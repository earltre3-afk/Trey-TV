import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { currentUser as defaultUser } from "@/lib/mock-data";
import { useSupabaseSession } from "@/lib/supabase-session";
import { recordUserTrace } from "@/lib/user-trace";

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
  rewards?: { points: number; tier: "BRONZE" | "SILVER" | "GOLD" | "DIAMOND" };
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

  // When the real Supabase owner/admin logs in, auto-populate the @trey mock profile
  useEffect(() => {
    if (supaUser && isRealAdmin && !user) {
      const r: Exclude<Role, "guest"> = isOwner ? "admin" : "creator";
      const u = buildUser(r);
      setUser(u);
      setRoleState(r);
    }
  }, [supaUser, isRealAdmin, isOwner, user]);

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
    recordUserTrace({ userUid: user?.uid, action: "auth.sign_out", targetType: "session", details: { role } });
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
  const updateUser = (patch: Partial<SessionUser>) =>
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));

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
