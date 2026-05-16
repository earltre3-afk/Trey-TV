import { useCallback } from 'react';
import { supabase, hasSupabaseConfig } from '@/lib/supabase';
import { useSupabaseSession } from '@/lib/supabase-session';
import type { SupabaseClient, User } from '@supabase/supabase-js';

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
    if (!hasSupabaseConfig || !supabase) {
      return { ok: false, error: 'Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' };
    }

    try {
      const client = supabase as SupabaseClient;
      const { error } = await client.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.href },
      });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong. Try again.';
      return { ok: false, error: msg };
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!hasSupabaseConfig || !supabase) return;
    await signOutSupabase();
  }, [signOutSupabase]);

  return { user, loading, sendMagicLink, signOut };
}
