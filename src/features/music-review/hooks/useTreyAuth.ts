import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useSupabaseSession } from '@/lib/supabase-session';
import { musicReviewEnv } from '../lib/env';

export interface TreyUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

declare global {
  interface Window {
    __TREY_USER__?: Partial<TreyUser> & { username?: string; role?: string };
  }
}

const LS_KEY = 'trey_tv_demo_user';

function normalizeHostUser(hostUser: Window['__TREY_USER__']): TreyUser | null {
  if (!hostUser?.id) return null;
  const role = hostUser.role || '';
  return {
    id: String(hostUser.id),
    email: hostUser.email || '',
    name: hostUser.name || hostUser.username || 'Artist',
    isAdmin: Boolean(hostUser.isAdmin || role === 'admin' || role === 'owner')
  };
}

/**
 * Trey TV auth bridge for the imported music review module.
 *
 * It prefers a host-injected user, then Trey TV's real Supabase session/admin
 * lookup, then the app's local session. Demo identities stay disabled in
 * production unless explicitly enabled by env.
 */
export function useTreyAuth() {
  const appAuth = useAuth();
  const supabaseSession = useSupabaseSession();
  const [demoUser, setDemoUser] = useState<TreyUser | null>(null);

  useEffect(() => {
    if (!musicReviewEnv.demoAuthEnabled || typeof window === 'undefined') return;
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    try {
      setDemoUser(JSON.parse(raw));
    } catch {
      localStorage.removeItem(LS_KEY);
    }
  }, []);

  const hostUser = typeof window !== 'undefined' ? normalizeHostUser(window.__TREY_USER__) : null;

  const sessionUser = useMemo<TreyUser | null>(() => {
    if (hostUser) return hostUser;

    if (supabaseSession.user) {
      const metadata = supabaseSession.user.user_metadata as Record<string, unknown>;
      const name =
        typeof metadata?.name === 'string' ? metadata.name :
        typeof metadata?.full_name === 'string' ? metadata.full_name :
        supabaseSession.user.email?.split('@')[0] ||
        'Artist';

      return {
        id: supabaseSession.user.id,
        email: supabaseSession.user.email || '',
        name,
        isAdmin: supabaseSession.isRealAdmin || supabaseSession.isOwner
      };
    }

    if (appAuth.user && !appAuth.isGuest) {
      return {
        id: appAuth.user.uid,
        email: '',
        name: appAuth.user.name || appAuth.user.handle || 'Artist',
        isAdmin: appAuth.isAdmin
      };
    }

    return musicReviewEnv.demoAuthEnabled ? demoUser : null;
  }, [
    appAuth.isAdmin,
    appAuth.isGuest,
    appAuth.user,
    demoUser,
    hostUser,
    supabaseSession.isOwner,
    supabaseSession.isRealAdmin,
    supabaseSession.user,
  ]);

  const signInDemo = (name: string, email: string, asAdmin = false) => {
    if (!musicReviewEnv.demoAuthEnabled) return;
    const u: TreyUser = {
      id: crypto.randomUUID(),
      email,
      name,
      isAdmin: asAdmin
    };
    localStorage.setItem(LS_KEY, JSON.stringify(u));
    setDemoUser(u);
  };

  const signOut = async () => {
    if (musicReviewEnv.demoAuthEnabled) localStorage.removeItem(LS_KEY);
    try { await supabaseSession.signOutSupabase(); } catch {}
    try { appAuth.signOut(); } catch {}
    setDemoUser(null);
  };

  const toggleAdmin = () => {
    if (!musicReviewEnv.demoAuthEnabled || !demoUser) return;
    const u = { ...demoUser, isAdmin: !demoUser.isAdmin };
    localStorage.setItem(LS_KEY, JSON.stringify(u));
    setDemoUser(u);
  };

  const refresh = useCallback(async () => {}, []);

  return {
    user: sessionUser,
    loading: supabaseSession.loading,
    signInDemo,
    signOut,
    toggleAdmin,
    refresh,
    demoAuthEnabled: musicReviewEnv.demoAuthEnabled
  };
}

export const isAdmin = (u: TreyUser | null) => !!u?.isAdmin;
export const canManageMusicReviews = (u: TreyUser | null) => isAdmin(u);
export const canModerateOpenMic = (u: TreyUser | null) => isAdmin(u);
export const canCompleteReviews = (u: TreyUser | null) => isAdmin(u);
