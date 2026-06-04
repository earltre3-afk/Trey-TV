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
const AUTH_BOOTSTRAP_TIMEOUT_MS = 2500;
const STALE_AUTH_MESSAGES = [
  "Invalid Refresh Token",
  "Refresh Token Not Found",
  "refresh_token_not_found",
];

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

function getErrorMessage(err: unknown) {
  return err instanceof Error ? err.message : String(err);
}

function isStaleAuthError(err: unknown) {
  const message = getErrorMessage(err);
  return STALE_AUTH_MESSAGES.some((pattern) => message.includes(pattern));
}

function getStoredSupabaseAuthState() {
  if (typeof window === "undefined") return { hasToken: false, isExpired: false };

  for (const key of Object.keys(window.localStorage)) {
    if (!(key.startsWith("sb-") && key.endsWith("-auth-token")) && key !== "supabase.auth.token") {
      continue;
    }

    const raw = window.localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw) as {
        expires_at?: number;
        currentSession?: { expires_at?: number };
      };
      const expiresAt = parsed.expires_at ?? parsed.currentSession?.expires_at;
      if (!expiresAt) return { hasToken: true, isExpired: true };
      return { hasToken: true, isExpired: expiresAt * 1000 <= Date.now() + 30_000 };
    } catch {
      return { hasToken: true, isExpired: true };
    }
  }

  return { hasToken: false, isExpired: false };
}

function clearStoredSupabaseAuth() {
  if (typeof window === "undefined") return;

  for (const key of Object.keys(window.localStorage)) {
    if ((key.startsWith("sb-") && key.endsWith("-auth-token")) || key === "supabase.auth.token") {
      window.localStorage.removeItem(key);
    }
  }
}

async function recoverStaleSupabaseAuth() {
  clearStoredSupabaseAuth();
  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch (err) {
    console.warn("Failed to locally sign out stale Supabase auth state:", getErrorMessage(err));
  }
  clearStoredSupabaseAuth();
}

export function SupabaseSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [adminRole, setAdminRole] = useState<AdminRole>(null);
  const [loading, setLoading] = useState(true);
  const hasTesterAutoLogin = TESTER_ADMIN_AUTOLOGIN && !!TESTER_ADMIN_PASSWORD;

  // Sign in as the CaliforniaTrey admin using the configured tester credentials.
  // Used both by boot auto-login and the Trey-I chat access code.
  const signInAsTesterAdmin = useCallback(async (): Promise<{ error: Error | null }> => {
    if (!TESTER_ADMIN_PASSWORD) {
      return {
        error: new Error("Tester admin password is not configured (VITE_TESTER_ADMIN_PASSWORD)."),
      };
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
    let sub: any = null;
    let cancelled = false;
    let initialLoadSettled = false;
    let bootstrapInProgress = true;

    const finishInitialLoad = () => {
      if (cancelled || initialLoadSettled) return;
      initialLoadSettled = true;
      setLoading(false);
    };

    const deferAdminLoad = (uid: string, email?: string | null) => {
      setTimeout(() => {
        if (!cancelled) void loadAdmin(uid, email);
      }, 0);
    };

    try {
      const { data } = supabase.auth.onAuthStateChange((event, s) => {
        setSession(s);
        if (s?.user) {
          // defer admin lookup to avoid deadlocking the listener
          deferAdminLoad(s.user.id, s.user.email);
        } else {
          setAdminRole(null);
        }

        if (event === "INITIAL_SESSION") {
          if (s?.user || !hasTesterAutoLogin) {
            bootstrapInProgress = false;
            finishInitialLoad();
          }
          return;
        }

        if (event === "SIGNED_IN") {
          bootstrapInProgress = false;
          finishInitialLoad();
        }

        if (event === "SIGNED_OUT") {
          if (!hasTesterAutoLogin || !bootstrapInProgress || initialLoadSettled) {
            bootstrapInProgress = false;
            finishInitialLoad();
          }
          return;
        }

        if (event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
          bootstrapInProgress = false;
          finishInitialLoad();
        }
      });
      sub = data;
    } catch (err) {
      console.error("Error setting up auth state change listener:", err);
      finishInitialLoad();
    }

    // Then check existing session, but do not block Trey TV identity if there is
    // no Supabase auth cache to hydrate.
    const storedAuthAtStart = getStoredSupabaseAuthState();
    const shouldBootstrapStoredSession = storedAuthAtStart.hasToken || hasTesterAutoLogin;

    const bootstrapTimeout = shouldBootstrapStoredSession
      ? setTimeout(() => {
          const storedAuth = getStoredSupabaseAuthState();
          bootstrapInProgress = false;
          if (storedAuth.hasToken) {
            void recoverStaleSupabaseAuth();
            setSession(null);
            setAdminRole(null);
          } else {
            setSession(null);
          }
          finishInitialLoad();
        }, AUTH_BOOTSTRAP_TIMEOUT_MS)
      : null;

    if (!shouldBootstrapStoredSession) {
      setSession(null);
      finishInitialLoad();
    } else {
      try {
        supabase.auth
          .getSession()
          .then(async ({ data }) => {
            if (cancelled) return;
            if (data.session?.user) {
              bootstrapInProgress = false;
              setSession(data.session);
              deferAdminLoad(data.session.user.id, data.session.user.email);
              finishInitialLoad();
              return;
            }

            // No session: tester builds sign in as the CaliforniaTrey admin.
            if (hasTesterAutoLogin) {
              const { error } = await signInAsTesterAdmin();
              if (cancelled) return;
              if (error) console.error("Tester admin auto-login failed:", error.message);
              bootstrapInProgress = false;
              finishInitialLoad();
              return;
            }

            bootstrapInProgress = false;
            setSession(null);
            finishInitialLoad();
          })
          .catch(async (err) => {
            if (isStaleAuthError(err)) {
              console.warn("Clearing stale Supabase auth session:", getErrorMessage(err));
              await recoverStaleSupabaseAuth();
            } else {
              console.error("Failed to get Supabase session on init:", err);
            }
            if (cancelled) return;
            setSession(null);
            if (hasTesterAutoLogin) {
              const { error } = await signInAsTesterAdmin();
              if (cancelled) return;
              if (error) console.error("Tester admin auto-login failed:", error.message);
            }
            bootstrapInProgress = false;
            finishInitialLoad();
          });
      } catch (err) {
        console.error("Critical error in getSession setup:", err);
        bootstrapInProgress = false;
        setSession(null);
        finishInitialLoad();
      }
    }

    return () => {
      cancelled = true;
      if (bootstrapTimeout) clearTimeout(bootstrapTimeout);
      if (sub?.subscription) {
        try {
          sub.subscription.unsubscribe();
        } catch (err) {
          console.error("Error unsubscribing from auth state listener:", err);
        }
      }
    };
  }, [hasTesterAutoLogin, signInAsTesterAdmin]);

  async function loadAdmin(uid: string, email?: string | null) {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("role")
        .eq("user_id", uid)
        .maybeSingle();
      if (error) throw error;
      if (data?.role === "owner") {
        setAdminRole(isTreyOwnerEmail(email) ? "owner" : null);
        return;
      }
      if (data?.role) {
        setAdminRole(data.role as AdminRole);
        return;
      }
    } catch (err) {
      console.error("Failed to load admin role:", err);
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
    signOutSupabase: async () => {
      await supabase.auth.signOut();
    },
    signInAsTesterAdmin,
  };

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useSupabaseSession() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useSupabaseSession requires SupabaseSessionProvider");
  return ctx;
}
