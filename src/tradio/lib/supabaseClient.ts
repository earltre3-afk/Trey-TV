import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as mainSupabase } from "@/integrations/supabase/client";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabasePublishableKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = isSupabaseConfigured ? (mainSupabase as unknown as SupabaseClient) : null;

export const getSupabaseClient = (): SupabaseClient | null => {
  return supabase;
};
