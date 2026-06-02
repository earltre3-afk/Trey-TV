import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as mainSupabase } from "@/integrations/supabase/client";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured ? (mainSupabase as unknown as SupabaseClient) : null;

export const getSupabaseClient = (): SupabaseClient | null => {
  return supabase;
};
