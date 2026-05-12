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
  location: string | null;
  link_url: string | null;
  tagline: string | null;
  pronouns: string | null;
  birthday: string | null;
  favorite_genres: string | null;
  favorite_creators: string | null;
  social_instagram: string | null;
  social_tiktok: string | null;
  social_youtube: string | null;
  profile_visibility: string | null;
  show_location: boolean | null;
  show_birthday: boolean | null;
  created_at: string;
  profile_accent_color: string | null;
  follower_count?: number;
  following_count?: number;
  post_count?: number;
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
          .select("id, public_profile_uid, display_name, username, avatar_url, banner_url, bio, location, link_url, tagline, pronouns, birthday, favorite_genres, favorite_creators, social_instagram, social_tiktok, social_youtube, profile_visibility, show_location, show_birthday, created_at, profile_accent_color")
          .eq("public_profile_uid", publicUid)
          .single();

        if (error) {
          throw error;
        }

        const [followersResult, followingResult, postsResult] = await Promise.all([
          (supabase as any).from("follows").select("id", { count: "exact", head: true }).eq("following_id", (data as any).id),
          (supabase as any).from("follows").select("id", { count: "exact", head: true }).eq("follower_id", (data as any).id),
          (supabase as any).from("user_feed_posts").select("id", { count: "exact", head: true }).eq("user_id", (data as any).id),
        ]);

        if (mounted) {
          setProfile({
            ...(data as SupabaseProfile),
            follower_count: followersResult.count ?? 0,
            following_count: followingResult.count ?? 0,
            post_count: postsResult.count ?? 0,
          });
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
