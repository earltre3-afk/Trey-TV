import { useEffect, useState } from 'react';
import type { AuthError, Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '@/tradio/lib/supabaseClient';

interface SupabaseSessionState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  error: AuthError | Error | null;
  isConfigured: boolean;
}

export const useSupabaseSession = (): SupabaseSessionState => {
  const [state, setState] = useState<SupabaseSessionState>({
    session: null,
    user: null,
    isLoading: isSupabaseConfigured,
    error: null,
    isConfigured: isSupabaseConfigured,
  });

  useEffect(() => {
    if (!supabase) {
      setState({
        session: null,
        user: null,
        isLoading: false,
        error: null,
        isConfigured: false,
      });
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      setState({
        session: data.session,
        user: data.session?.user ?? null,
        isLoading: false,
        error,
        isConfigured: true,
      });
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setState({
        session,
        user: session?.user ?? null,
        isLoading: false,
        error: null,
        isConfigured: true,
      });
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return state;
};
