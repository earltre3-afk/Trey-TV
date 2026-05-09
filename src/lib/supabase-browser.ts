import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "./backend-env";

let supabaseClient: ReturnType<typeof createClient> | null = null;

export const createBrowserClient = () => {
  if (supabaseClient) {
    return supabaseClient;
  }

  const env = getSupabasePublicEnv();
  if (!env) {
    console.warn("Supabase public env vars are missing. Authentication will fail.");
    throw new Error("Missing Supabase public environment variables.");
  }

  supabaseClient = createClient(env.url, env.anonKey);
  return supabaseClient;
};
