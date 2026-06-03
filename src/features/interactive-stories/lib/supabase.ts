// Bridge to Trey TV's shared Supabase client.
// This replaces the standalone module's supabase.ts so all library code
// can import { supabase } from './supabase' without changes.

import { createBrowserClient } from "@/lib/supabase-browser";

let _client: ReturnType<typeof createBrowserClient> | null = null;

function getClient() {
  if (!_client) {
    try {
      _client = createBrowserClient();
    } catch {
      // During SSR or if env vars are missing, return a no-op stub so the
      // module doesn't crash on import. Actual DB ops will fail gracefully.
      console.warn("[InteractiveStories] Supabase client unavailable — local-only mode.");
      return null;
    }
  }
  return _client;
}

// Export a proxy that lazily initializes so we don't throw at import-time.
export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_target, prop) {
    const client = getClient();
    if (!client) {
      // Return safe stubs for common Supabase methods
      if (prop === "from")
        return () => ({
          select: () => ({ data: null, error: null }),
          upsert: () => ({ data: null, error: null }),
          insert: () => ({ data: null, error: null }),
          delete: () => ({ eq: () => ({ data: null, error: null }) }),
        });
      if (prop === "auth")
        return { getSession: () => Promise.resolve({ data: { session: null } }) };
      if (prop === "functions")
        return {
          invoke: () => Promise.resolve({ data: null, error: new Error("Supabase unavailable") }),
        };
      return undefined;
    }
    return (client as any)[prop];
  },
});
