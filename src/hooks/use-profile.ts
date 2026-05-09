import { useState, useEffect } from "react";
import { createBrowserClient } from "../lib/supabase-browser";

export interface SupabaseProfile {
  id: string;
  public_profile_uid: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  is_creator: boolean;
  location: string | null;
  created_at: string;
  profile_accent_color: string | null;
}

export function useProfile(publicUid: string) {
  const [profile, setProfile] = useState<SupabaseProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      try {
        setLoading(true);
        const supabase = createBrowserClient();
        const { data, error } = await supabase
          .from("profiles")
          .select("id, public_profile_uid, display_name, username, avatar_url, banner_url, bio, location, created_at, profile_accent_color")
          .eq("public_profile_uid", publicUid)
          .single();

        if (error) {
          throw error;
        }

        if (mounted) {
          setProfile(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (publicUid) {
      fetchProfile();
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [publicUid]);

  return { profile, loading, error };
}
