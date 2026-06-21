import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseSession } from "@/lib/supabase-session";
import type { User } from "@supabase/supabase-js";

export interface AuthState {
  user: User | null;
  loading: boolean;
}

export function useAuth(): AuthState & {
  sendMagicLink: (email: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
} {
  const { user, loading, signOutSupabase } = useSupabaseSession();

  const sendMagicLink = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.href },
      });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong. Try again.";
      return { ok: false, error: msg };
    }
  }, []);

  const signOut = useCallback(async () => {
    await signOutSupabase();
  }, [signOutSupabase]);

  return { user, loading, sendMagicLink, signOut };
}
