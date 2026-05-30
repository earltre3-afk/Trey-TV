import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { currentUser as defaultUser } from "@/lib/mock-data";
import { useSupabaseSession } from "@/lib/supabase-session";
import { recordUserTrace } from "@/lib/user-trace";
import { createBrowserClient } from "@/lib/supabase-browser";

export type Role = "guest" | "user" | "creator" | "admin";
export type CreatorStatus = "not_applied" | "pending" | "approved" | "rejected";

export type SessionUser = {
  creatorStatus?: CreatorStatus;
  name: string;
  handle: string;
  uid: string;
  avatar: string;
  banner?: string;
  bio: string;
  location?: string;
  link?: string;
  accent?: string;
  verified?: "creator" | "user";
  role: Role;
  stats: { posts: number; followers: string; following: number; prescriptions: string };
  rewards?: { points: number; tier: "WHITE" | "GREEN" | "RED" | "GOLD" | "BRONZE" | "SILVER" | "DIAMOND" };
  tagline?: string;
  pronouns?: string;
  birthday?: string;
  favoriteGenres?: string;
  favoriteCreators?: string;
  socialInstagram?: string;
  socialTikTok?: string;
  socialYouTube?: string;
  profileVisibility?: "public" | "members_only" | "private";
  showLocation?: boolean;
  showBirthday?: boolean;
  gifOfDayId?: string | null;
  gifOfDayUrl?: string | null;
  gifOfDayPosterUrl?: string | null;
  gifOfDayProvider?: string | null;
  gifOfDayCaption?: string | null;
  gifOfDaySetAt?: string | null;
  showFwdGifsOnProfile?: boolean;
  onboarding_completed?: boolean;
};

type AuthCtx = {
  role: Role;
  user: SessionUser | null;
  isGuest: boolean;
  isCreator: boolean;
  isAdmin: boolean;
  creatorStatus: CreatorStatus;
  isApprovedCreator: boolean;
  setCreatorStatus: (s: CreatorStatus) => void;
  signIn: (role?: Exclude<Role, "guest">) => void;
  signOut: () => void;
  setRole: (r: Role) => void;
  updateUser: (patch: Partial<SessionUser>) => void;
};

export type AuthorizationStatus =
  | "checking"
  | "logged_out"
  | "needs_onboarding"
  | "authorized"
  | "unauthorized"
  | "error";

type FullAuthCtx = AuthCtx & {
  // readiness and diagnostics
  authReady: boolean;
  profileReady: boolean;
  authorizationStatus: AuthorizationStatus;
  authError: string | null;
  retryHydrate: () => void;
};

const Ctx = createContext<FullAuthCtx | null>(null);
const KEY = "treytv_session_v1";

const buildUser = (role: Exclude<Role, "guest">): SessionUser => ({
  ...defaultUser,
  banner: "",
  accent: "#FFC857",
  profileVisibility: "public",
  showLocation: true,
  showBirthday: false,
  role,
  creatorStatus: role === "creator" || role === "admin" ? "approved" : "not_applied",
  rewards: { points: 12480, tier: "GOLD" },
  onboarding_completed: true,
});

const mapProfileToSessionUser = (profile: any, fallbackRole: Exclude<Role, "guest"> = "user"): SessionUser => {
  const publicUid = profile?.public_profile_uid || profile?.id || "";
  const handle = profile?.username || (publicUid ? `user_${String(publicUid).slice(-6)}` : "member");
  const isCreator = Boolean(profile?.verified_creator || profile?.verification_type === "creator" || profile?.creator_status === "approved");

  return {
    ...defaultUser,
    name: profile?.display_name || profile?.username || "Trey TV Member",
    handle,
    uid: publicUid,
    avatar: profile?.avatar_url || "",
    banner: profile?.banner_url || "",
    bio: profile?.bio || "",
    location: profile?.location || "",
    link: profile?.link_url || "",
    accent: profile?.profile_accent_color || "#FFC857",
    verified: isCreator ? "creator" : profile?.is_verified ? "user" : undefined,
    role: (profile?.role as Role) || fallbackRole,
    creatorStatus: profile?.creator_status ?? (fallbackRole === "creator" || fallbackRole === "admin" ? "approved" : "not_applied"),
    tagline: profile?.tagline ?? "",
    pronouns: profile?.pronouns ?? "",
    birthday: profile?.birthday ?? "",
    favoriteGenres: profile?.favorite_genres ?? "",
    favoriteCreators: profile?.favorite_creators ?? "",
    socialInstagram: profile?.social_instagram ?? "",
    socialTikTok: profile?.social_tiktok ?? "",
    socialYouTube: profile?.social_youtube ?? "",
    profileVisibility: profile?.profile_visibility ?? "public",
    showLocation: profile?.show_location ?? true,
    showBirthday: profile?.show_birthday ?? false,
    gifOfDayId: profile?.gif_of_day_id ?? null,
    gifOfDayUrl: profile?.gif_of_day_url ?? null,
    gifOfDayPosterUrl: profile?.gif_of_day_poster_url ?? null,
    gifOfDayProvider: profile?.gif_of_day_provider ?? null,
    gifOfDayCaption: profile?.gif_of_day_caption ?? null,
    gifOfDaySetAt: profile?.gif_of_day_set_at ?? null,
    showFwdGifsOnProfile: !!profile?.show_fwd_gifs_on_profile,
    onboarding_completed: !!profile?.onboarding_completed,
    rewards: { points: 0, tier: "WHITE" },
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isRealAdmin, isOwner, user: supaUser } = useSupabaseSession();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [role, setRoleState] = useState<Role>("guest");
  const [authReady, setAuthReady] = useState(false);
  const [profileReady, setProfileReady] = useState(false);
  const [authorizationStatus, setAuthorizationStatus] = useState<AuthorizationStatus>("checking");
  const [authError, setAuthError] = useState<string | null>(null);
  const hydrateAbortRef = { current: false } as { current: boolean };
  // Tracks which (supaUser, owner/admin) we've already hydrated for, so the
  // hydration effect doesn't loop when it updates its own user/role outputs.
  const hydratedKeyRef = useRef<string | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { role: Role; user: SessionUser | null };
        setRoleState(parsed.role);
        setUser(parsed.user);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const debug = Boolean(import.meta.env.DEV) || Boolean((globalThis as any).__TREYTV_AUTH_DEBUG);

    // If there's no Supabase session, honor any local tester/mock auth session
    if (!supaUser) {
      hydratedKeyRef.current = null;
      if (user && role !== "guest") {
        if (debug) console.debug("auth: local session restored", role, user.uid);
        setProfileReady(true);
        setAuthReady(true);
        setAuthError(null);
        setAuthorizationStatus(user.onboarding_completed ? "authorized" : "needs_onboarding");
        return;
      }

      if (debug) console.debug("auth: no session found");
      setProfileReady(true);
      setAuthReady(true);
      setAuthorizationStatus("logged_out");
      setAuthError(null);
      return;
    }

    // Skip redundant re-hydration. This effect lists user/role in its deps (for
    // the mock-session branch above) but also writes user/role below — so a
    // completed hydrate would otherwise retrigger the effect endlessly, pinning
    // authorizationStatus on "checking". Only (re)hydrate when the session or
    // owner/admin flags actually change.
    const hydrationKey = `${supaUser.id}:${isOwner ? 1 : 0}:${isRealAdmin ? 1 : 0}`;
    if (hydratedKeyRef.current === hydrationKey) return;
    hydratedKeyRef.current = hydrationKey;

    // Begin profile hydration
    hydrateAbortRef.current = false;
    setProfileReady(false);
    setAuthReady(false);
    setAuthorizationStatus("checking");
    setAuthError(null);

    const hydrateProfile = async () => {
      if (debug) console.debug("auth: profile fetch started for", supaUser.id);
      const fallbackRole: Exclude<Role, "guest"> = isOwner ? "admin" : isRealAdmin ? "creator" : "user";
      const supabase = createBrowserClient();

      // timeout fail-safe
      let timedOut = false;
      const timeoutMs = 8000;
      const to = setTimeout(() => {
        timedOut = true;
        hydrateAbortRef.current = true;
        setAuthError("Timed out while loading profile");
        setAuthorizationStatus("error");
        setProfileReady(true);
        setAuthReady(true);
      }, timeoutMs);

      try {
        const { data, error } = await (supabase as any)
          .from("profiles")
          .select("id, public_profile_uid, display_name, username, avatar_url, banner_url, bio, location, link_url, role, creator_status, verification_type, is_verified, verified_creator, profile_accent_color, tagline, pronouns, birthday, favorite_genres, favorite_creators, social_instagram, social_tiktok, social_youtube, profile_visibility, show_location, show_birthday, gif_of_day_id, gif_of_day_url, gif_of_day_poster_url, gif_of_day_provider, gif_of_day_caption, gif_of_day_set_at, show_fwd_gifs_on_profile, onboarding_completed")
          .eq("id", supaUser.id)
          .maybeSingle();

        clearTimeout(to);
        if (hydrateAbortRef.current) return;

        if (error) {
          setAuthError(String(error.message ?? error));
          setAuthorizationStatus("error");
          // fallback but mark ready so guards stop blocking
          const u = buildUser(fallbackRole);
          setUser(u);
          setRoleState(fallbackRole);
          setProfileReady(true);
          setAuthReady(true);
          return;
        }

        const mapped = mapProfileToSessionUser(data ?? null, fallbackRole);
        if (debug) console.debug("auth: profile fetch resolved", mapped.uid, mapped.onboarding_completed);
        const effectiveRole: Role = isOwner ? "admin" : isRealAdmin ? "creator" : mapped.role;
        const finalUser = { ...mapped, role: effectiveRole };
        setUser(finalUser);
        setRoleState(effectiveRole);

        // derive authorization status
        if (!finalUser.onboarding_completed) {
          setAuthorizationStatus("needs_onboarding");
          if (debug) console.debug("auth: authorization resolved -> needs_onboarding");
        } else {
          setAuthorizationStatus("authorized");
          if (debug) console.debug("auth: authorization resolved -> authorized");
        }

        setProfileReady(true);
        setAuthReady(true);
      } catch (err: any) {
        clearTimeout(to);
        if (timedOut || hydrateAbortRef.current) return;
        console.error("Failed to hydrate UID profile:", err);
        if (debug) console.debug("auth: profile fetch failed", err);
        setAuthError(String(err?.message ?? err));
        setAuthorizationStatus("error");
        const u = buildUser(fallbackRole);
        setUser(u);
        setRoleState(fallbackRole);
        setProfileReady(true);
        setAuthReady(true);
      }
    };

    hydrateProfile();
    return () => {
      hydrateAbortRef.current = true;
    };
  }, [supaUser?.id, isRealAdmin, isOwner, user, role]);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ role, user })); } catch {}
  }, [role, user]);

  const retryHydrate = () => {
    setAuthError(null);
    hydratedKeyRef.current = null;
    setAuthorizationStatus("checking");
    setProfileReady(false);
    setAuthReady(false);
    // Trigger re-hydration by checking session; SupabaseSessionProvider will trigger listeners
    void (async () => {
      try {
        const supabase = createBrowserClient();
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          setProfileReady(false);
          setAuthReady(false);
          setAuthorizationStatus("checking");
        }
      } catch (e) {
        setAuthError(String((e as any)?.message ?? e));
        setAuthorizationStatus("error");
        setProfileReady(true);
        setAuthReady(true);
      }
    })();
  };

  const signIn = (r: Exclude<Role, "guest"> = "creator") => {
    const u = buildUser(r);
    setUser(u);
    setRoleState(r);
    setAuthError(null);
    setProfileReady(true);
    setAuthReady(true);
    setAuthorizationStatus(u.onboarding_completed ? "authorized" : "needs_onboarding");
    recordUserTrace({ userUid: u.uid, action: "auth.sign_in", targetType: "session", details: { role: r } });
  };
  const signOut = () => {
    recordUserTrace({ userUid: user?.uid ?? "", action: "auth.sign_out", targetType: "session", details: { role } });
    try {
      localStorage.removeItem(KEY);
      sessionStorage.removeItem("treytv_post_auth_redirect");
      sessionStorage.removeItem("treytv_voice_profile");
    } catch {}
    setUser(null);
    setRoleState("guest");
  };
  const setRole = (r: Role) => {
    setRoleState(r);
    if (r === "guest") setUser(null);
    else setUser((prev) => prev ? { ...prev, role: r } : buildUser(r));
  };
  const updateUser = (patch: Partial<SessionUser>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));

    if (supaUser) {
      void (async () => {
        try {
          const supabase = createBrowserClient();
          const profilePatch: Record<string, unknown> = {};
          if (patch.name !== undefined) profilePatch.display_name = patch.name;
          if (patch.handle !== undefined) profilePatch.username = patch.handle;
          if (patch.avatar !== undefined) profilePatch.avatar_url = patch.avatar;
          if (patch.banner !== undefined) profilePatch.banner_url = patch.banner;
          if (patch.bio !== undefined) profilePatch.bio = patch.bio;
          if (patch.location !== undefined) profilePatch.location = patch.location;
          if (patch.link !== undefined) profilePatch.link_url = patch.link;
          if (patch.accent !== undefined) profilePatch.profile_accent_color = patch.accent;
          if (patch.tagline !== undefined) profilePatch.tagline = patch.tagline;
          if (patch.pronouns !== undefined) profilePatch.pronouns = patch.pronouns;
          if (patch.birthday !== undefined) profilePatch.birthday = patch.birthday;
          if (patch.favoriteGenres !== undefined) profilePatch.favorite_genres = patch.favoriteGenres;
          if (patch.favoriteCreators !== undefined) profilePatch.favorite_creators = patch.favoriteCreators;
          if (patch.socialInstagram !== undefined) profilePatch.social_instagram = patch.socialInstagram;
          if (patch.socialTikTok !== undefined) profilePatch.social_tiktok = patch.socialTikTok;
          if (patch.socialYouTube !== undefined) profilePatch.social_youtube = patch.socialYouTube;
          if (patch.profileVisibility !== undefined) profilePatch.profile_visibility = patch.profileVisibility;
          if (patch.showLocation !== undefined) profilePatch.show_location = patch.showLocation;
          if (patch.showBirthday !== undefined) profilePatch.show_birthday = patch.showBirthday;
          if (patch.gifOfDayId !== undefined) profilePatch.gif_of_day_id = patch.gifOfDayId;
          if (patch.gifOfDayUrl !== undefined) profilePatch.gif_of_day_url = patch.gifOfDayUrl;
          if (patch.gifOfDayPosterUrl !== undefined) profilePatch.gif_of_day_poster_url = patch.gifOfDayPosterUrl;
          if (patch.gifOfDayProvider !== undefined) profilePatch.gif_of_day_provider = patch.gifOfDayProvider;
          if (patch.gifOfDayCaption !== undefined) profilePatch.gif_of_day_caption = patch.gifOfDayCaption;
          if (patch.gifOfDaySetAt !== undefined) profilePatch.gif_of_day_set_at = patch.gifOfDaySetAt;
          if (patch.showFwdGifsOnProfile !== undefined) profilePatch.show_fwd_gifs_on_profile = patch.showFwdGifsOnProfile;
          if (Object.keys(profilePatch).length === 0) return;

          const { error } = await (supabase as any)
            .from("profiles")
            .update({ ...profilePatch, updated_at: new Date().toISOString() })
            .eq("id", supaUser.id);
          if (error) throw error;
        } catch (error) {
          console.error("Failed to persist UID profile settings:", error);
        }
      })();
    }
  };

  // Real Supabase admin overrides mock role for admin gating
  const effectiveIsAdmin = role === "admin" || isRealAdmin;
  const effectiveIsCreator = effectiveIsAdmin || role === "creator";

  // expose debug state in dev for troubleshooting hydration issues
  useEffect(() => {
    try {
      if (import.meta.env.DEV || (globalThis as any).__TREYTV_AUTH_DEBUG) {
        (globalThis as any).__TREYTV_AUTH_STATE = {
          authReady,
          profileReady,
          authorizationStatus,
          authError,
          role,
          user: user ? { uid: user.uid, onboarding_completed: user.onboarding_completed } : null,
          supabaseUserId: supaUser?.id ?? null,
        };
      }
    } catch {}
  }, [authReady, profileReady, authorizationStatus, authError, role, user, supaUser?.id]);

  return (
    <Ctx.Provider value={{
      role,
      user,
      isGuest: role === "guest" && !supaUser,
      isCreator: effectiveIsCreator,
      isAdmin: effectiveIsAdmin,
      creatorStatus: user?.creatorStatus ?? (effectiveIsCreator ? "approved" : "not_applied"),
      isApprovedCreator: (user?.creatorStatus ?? (effectiveIsCreator ? "approved" : "not_applied")) === "approved" && effectiveIsCreator,
      setCreatorStatus: (s) => setUser((prev) => prev ? { ...prev, creatorStatus: s } : prev),
      signIn, signOut, setRole, updateUser,
      // new fields
      authReady,
      profileReady,
      authorizationStatus,
      authError,
      retryHydrate,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
