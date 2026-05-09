import { useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { createBrowserClient } from "../lib/supabase-browser";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const supabase = createBrowserClient();
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (mounted) {
          if (error) {
            console.error("Auth session error:", error);
            setSession(null);
            setUser(null);
          } else {
            setSession(session);
            setUser(session?.user ?? null);
          }
          setLoading(false);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            if (mounted) {
              setSession(session);
              setUser(session?.user ?? null);
              setLoading(false);
            }
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.warn("Failed to initialize Supabase client. Missing env vars?", err);
        if (mounted) {
          setLoading(false);
        }
        return () => {};
      }
    };

    const cleanupPromise = initializeAuth();

    return () => {
      mounted = false;
      cleanupPromise.then((cleanup) => {
        if (cleanup) cleanup();
      });
    };
  }, []);

  return {
    session,
    user,
    loading,
    isSignedIn: !!session,
  };
}
