import { supabase } from "@/lib/supabase";

// Returns the hybrid supabase object: Neon for DB queries, Supabase for auth/storage/realtime.
export const createBrowserClient = () => supabase;
