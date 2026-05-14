import { supabase as appSupabase } from "@/integrations/supabase/client";

export const supabase = appSupabase as any;

export const isSupabaseConfigured = true;
export const hasSupabaseConfig = true;

export function requireSupabaseConfig() {
  return true;
}
