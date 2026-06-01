import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let warnedMissingConfig = false;
let cachedFetch: typeof fetch | undefined;

function getSafeFetch(): typeof fetch {
  if (typeof window === 'undefined') {
    return fetch;
  }

  if (cachedFetch) {
    return cachedFetch;
  }

  if (!document.body) {
    return window.fetch;
  }

  try {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    const nativeFetch = iframe.contentWindow?.fetch;
    document.body.removeChild(iframe);
    if (nativeFetch) {
      cachedFetch = nativeFetch.bind(window);
      return cachedFetch;
    }
  } catch (e) {
    console.warn('[Supabase] Failed to retrieve native fetch from iframe, falling back to window.fetch:', e);
  }

  cachedFetch = window.fetch;
  return cachedFetch;
}

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (import.meta.env.DEV && !warnedMissingConfig) {
      warnedMissingConfig = true;
      console.warn('Tradio Supabase client is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to use Trizzy Hub auth.');
    }
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      fetch: (...args) => getSafeFetch()(...args),
    }
  });
};

export const supabase = getSupabaseClient();
