import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const createBrowserClient = (): ReturnType<typeof createClient> => {
  return supabase as unknown as ReturnType<typeof createClient>;
};
