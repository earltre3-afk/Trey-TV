// Hybrid DB layer:
//   .from() / .rpc()  → Neon (via db shim, never exposes connection string to browser)
//   .auth / .storage / .channel / .removeChannel  → real Supabase client (auth/storage/realtime stay on Supabase until Sub-project B)
import { supabase as realSupabase } from "@/integrations/supabase/client";
import { db } from "./db";

export const supabase: any = new Proxy({} as any, {
  get(_, prop: string) {
    if (prop === "from" || prop === "rpc") return (db as any)[prop].bind(db);
    return (realSupabase as any)[prop];
  },
});

export const isSupabaseConfigured = true;
export const hasSupabaseConfig = true;
export function requireSupabaseConfig() { return true; }
