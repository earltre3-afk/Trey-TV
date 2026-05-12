import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
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
  accent?: "gold" | "magenta" | "cyan" | "purple";
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

const Ctx = createContext<AuthCtx | null>(null);
const KEY = "treytv_session_v1";

const buildUser = (role: Exclude<Role, "guest">): SessionUser => ({
  ...defaultUser,
  banner: "",
  accent: "gold",
  profileVisibility: "public",
  showLocation: true,
  showBirthday: false,
  role,
  creatorStatus: role === "creator" || role === "admin" ? "approved" : "not_applied",
  rewards: { points: 12480, tier: "GOLD" },
});

const mapProfileToSessionUser = (profile: any, fallbackRole: Exclude<Role, "guest"> = "user"): SessionUser => ({
  ...defaultUser,
  name: profile?.display_name || defaultUser.name,
  handle: profile?.username || defaultUser.handle,
  uid: profile?.public_profile_uid || defaultUser.uid,
  avatar: profile?.avatar_url || defaultUser.avatar,
  banner: profile?.banner_url || defaultUser.banner,
  bio: profile?.bio || defaultUser.bio,
  location: profile?.location || defaultUser.location,
  link: profile?.link_url || defaultUser.link,
  accent: profile?.profile_accent_color || "gold",
  verified: profile?.verified_creator || profile?.verification_type === "creator" ? "creator" : profile?.is_verified ? "user" : defaultUser.verified,
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
  rewards: { points: 0, tier: "WHITE" },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isRealAdmin, isOwner, user: supaUser } = useSupabaseSession();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [role, setRoleState] = useState<Role>("guest");

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

  // When a real Supabase user logs in, hydrate the app session from the
  // UID-backed profile row so preferences, rewards, inbox, and feed state
  // all point at the same identity mark.
  useEffect(() => {
    if (!supaUser) return;
    let cancelled = false;

    const hydrateProfile = async () => {
      const fallbackRole: Exclude<Role, "guest"> = isOwner ? "admin" : isRealAdmin ? "creator" : "user";
      try {
        const supabase = createBrowserClient();
        const { data, error } = await (supabase as any)
          .from("profiles")
          .select("id, public_profile_uid, display_name, username, avatar_url, banner_url, bio, location, link_url, role, creator_status, verification_type, is_verified, verified_creator, profile_accent_color, tagline, pronouns, birthday, favorite_genres, favorite_creators, social_instagram, social_tiktok, social_youtube, profile_visibility, show_location, show_birthday")
          .eq("id", supaUser.id)
          .maybeSingle();

        if (cancelled) return;
        if (error || !data) {
          const u = buildUser(fallbackRole);
          setUser(u);
          setRoleState(fallbackRole);
          return;
        }

        const mapped = mapProfileToSessionUser(data, fallbackRole);
        const effectiveRole: Role = isOwner ? "admin" : isRealAdmin ? "creator" : mapped.role;
        setUser({ ...mapped, role: effectiveRole });
        setRoleState(effectiveRole);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to hydrate UID profile:", error);
          const u = buildUser(fallbackRole);
          setUser(u);
          setRoleState(fallbackRole);
        }
      }
    };

    hydrateProfile();
    return () => {
      cancelled = true;
    };
  }, [supaUser?.id, isRealAdmin, isOwner]);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ role, user })); } catch {}
  }, [role, user]);

  const signIn = (r: Exclude<Role, "guest"> = "creator") => {
    const u = buildUser(r);
    setUser(u);
    setRoleState(r);
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
