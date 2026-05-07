import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { currentUser as defaultUser } from "@/lib/mock-data";

export type Role = "guest" | "user" | "creator" | "admin";

export type SessionUser = {
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
};

type AuthCtx = {
  role: Role;
  user: SessionUser | null;
  isGuest: boolean;
  isCreator: boolean;
  isAdmin: boolean;
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
  role,
  rewards: { points: 12480, tier: "GOLD" },
});

export function AuthProvider({ children }: { children: ReactNode }) {
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

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ role, user })); } catch {}
  }, [role, user]);

  const signIn = (r: Exclude<Role, "guest"> = "creator") => {
    const u = buildUser(r);
    setUser(u);
    setRoleState(r);
  };
  const signOut = () => { setUser(null); setRoleState("guest"); };
  const setRole = (r: Role) => {
    setRoleState(r);
    if (r === "guest") setUser(null);
    else setUser((prev) => prev ? { ...prev, role: r } : buildUser(r));
  };
  const updateUser = (patch: Partial<SessionUser>) =>
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));

  return (
    <Ctx.Provider value={{
      role,
      user,
      isGuest: role === "guest",
      isCreator: role === "creator" || role === "admin",
      isAdmin: role === "admin",
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
