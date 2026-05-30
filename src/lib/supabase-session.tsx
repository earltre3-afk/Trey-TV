import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { isTreyOwnerEmail, TREY_OWNER_EMAIL } from "@/lib/trey-owner";

// Tester access: a real Supabase session as the CaliforniaTrey admin so testers
// get a fully data-backed admin account (real profile/feed/follows/RLS).
// VITE_TESTER_ADMIN_AUTOLOGIN=true signs in automatically on boot; the same
// credentials also back the Trey-I chat access code (see signInAsTesterAdmin).
const TESTER_ADMIN_AUTOLOGIN = import.meta.env.VITE_TESTER_ADMIN_AUTOLOGIN === "true";
const TESTER_ADMIN_EMAIL =
  (import.meta.env.VITE_TESTER_ADMIN_EMAIL as string | undefined)?.trim() || TREY_OWNER_EMAIL;
const TESTER_ADMIN_PASSWORD = import.meta.env.VITE_TESTER_ADMIN_PASSWORD as string | undefined;

export type AdminRole = "owner" | "admin" | "moderator" | null;

type Ctx = {
  session: Session | null;
  user: User | null;
  adminRole: AdminRole;
  isRealAdmin: boolean;
  isOwner: boolean;
  loading: boolean;
  signOutSupabase: () => Promise<void>;
  signInAsTesterAdmin: () => Promise<{ error: Error | null }>;
};

const C = createContext<Ctx | null>(null);

export function SupabaseSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [adminRole, setAdminRole] = useState<AdminRole>(null);
  const [loading, setLoading] = useState(true);

  // Sign in as the CaliforniaTrey admin using the configured tester credentials.
  // Used both by boot auto-login and the Trey-I chat access code.
  const signInAsTesterAdmin = useCallback(async (): Promise<{ error: Error | null }> => {
    if (!TESTER_ADMIN_PASSWORD) {
      return { error: new Error("Tester admin password is not configured (VITE_TESTER_ADMIN_PASSWORD).") };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TESTER_ADMIN_EMAIL,
      password: TESTER_ADMIN_PASSWORD,
    });
    if (!error) {
      setSession(data.session);
      if (data.session?.user) loadAdmin(data.session.user.id, data.session.user.email);
    }
    return { error };
  }, []);

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
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        setSession(data.session);
        loadAdmin(data.session.user.id, data.session.user.email);
        setLoading(false);
        return;
      }

      // No session: tester builds sign in as the CaliforniaTrey admin.
      if (TESTER_ADMIN_AUTOLOGIN && TESTER_ADMIN_PASSWORD) {
        const { error } = await signInAsTesterAdmin();
        if (error) console.error("Tester admin auto-login failed:", error.message);
        setLoading(false);
        return;
      }

      setSession(null);
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
    signInAsTesterAdmin,
  };

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useSupabaseSession() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useSupabaseSession requires SupabaseSessionProvider");
  return ctx;
}
