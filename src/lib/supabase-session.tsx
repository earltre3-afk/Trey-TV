import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { isTreyOwnerEmail } from "@/lib/trey-owner";

export type AdminRole = "owner" | "admin" | "moderator" | null;

type Ctx = {
  session: Session | null;
  user: User | null;
  adminRole: AdminRole;
  isRealAdmin: boolean;
  isOwner: boolean;
  loading: boolean;
  signOutSupabase: () => Promise<void>;
};

const C = createContext<Ctx | null>(null);

export function SupabaseSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [adminRole, setAdminRole] = useState<AdminRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up listener FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        // defer admin lookup to avoid deadlocking the listener
        setTimeout(() => loadAdmin(s.user.id, s.user.email), 0);
      } else {
        setAdminRole(null);
      }
    });
    // Then check existing session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) loadAdmin(data.session.user.id, data.session.user.email);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function loadAdmin(uid: string, email?: string | null) {
    const { data } = await supabase.from("admin_users").select("role").eq("user_id", uid).maybeSingle();
    if (data?.role === "owner") {
      setAdminRole(isTreyOwnerEmail(email) ? "owner" : null);
      return;
    }
    if (data?.role) {
      setAdminRole(data.role as AdminRole);
      return;
    }
    // Owner email fallback grants owner access even before the DB row is created.
    setAdminRole(isTreyOwnerEmail(email) ? "owner" : null);
  }

  const value: Ctx = {
    session,
    user: session?.user ?? null,
    adminRole,
    isRealAdmin: !!adminRole,
    isOwner: adminRole === "owner",
    loading,
    signOutSupabase: async () => { await supabase.auth.signOut(); },
  };

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useSupabaseSession() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useSupabaseSession requires SupabaseSessionProvider");
  return ctx;
}
