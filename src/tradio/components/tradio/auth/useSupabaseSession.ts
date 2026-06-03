import type { Session, User } from "@supabase/supabase-js";
import { useSupabaseSession as useParentSupabaseSession } from "@/lib/supabase-session";
import { isSupabaseConfigured } from "@/tradio/lib/supabaseClient";

interface SupabaseSessionState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  isConfigured: boolean;
}

export const useSupabaseSession = (): SupabaseSessionState => {
  const parentSession = useParentSupabaseSession();

  return {
    session: parentSession.session,
    user: parentSession.user,
    isLoading: parentSession.loading,
    error: null,
    isConfigured: isSupabaseConfigured,
  };
};
