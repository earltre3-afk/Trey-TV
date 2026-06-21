import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Browser account and user-data access must stay on Supabase so the active
// session and Row Level Security policies are applied to every request.
export const createBrowserClient = (): ReturnType<typeof createClient> => {
  return supabase as unknown as ReturnType<typeof createClient>;
};
