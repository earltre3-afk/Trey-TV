import { useState, useEffect } from "react";
import { createBrowserClient } from "../lib/supabase-browser";
import type { RelationshipStatus, TopThreeEntry } from "../components/profile/ProfileTypes";

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
  zodiac_sun_sign: string | null;
  zodiac_moon_sign: string | null;
  zodiac_rising_sign: string | null;
  zodiac_is_cusp: boolean | null;
  zodiac_cusp_label: string | null;
  zodiac_badge_key: string | null;
  zodiac_public_opt_in: boolean | null;
  birth_chart_json: Record<string, unknown> | null;
  role?: string | null;
  creator_status?: string | null;
  follower_count?: number;
  following_count?: number;
  post_count?: number;
  subscriber_count?: number;
  show_fwd_gifs_on_profile?: boolean | null;
  gif_of_day_url?: string | null;
  gif_of_day_poster_url?: string | null;
  gif_of_day_caption?: string | null;
}

export function useProfile(publicUid: string) {
  const [profile, setProfile] = useState<SupabaseProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTick, setRefetchTick] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      try {
        setLoading(true);
        const supabase = createBrowserClient();
        const { data, error } = await supabase
          .from("profiles")
          .select("id, public_profile_uid, display_name, username, avatar_url, banner_url, bio, location, link_url, tagline, pronouns, birthday, favorite_genres, favorite_creators, social_instagram, social_tiktok, social_youtube, profile_visibility, show_location, show_birthday, created_at, profile_accent_color, zodiac_sun_sign, zodiac_moon_sign, zodiac_rising_sign, zodiac_is_cusp, zodiac_cusp_label, zodiac_badge_key, zodiac_public_opt_in, birth_chart_json, role, creator_status, gif_of_day_url, gif_of_day_poster_url, gif_of_day_caption, show_fwd_gifs_on_profile")
          .eq("public_profile_uid", publicUid)
          .single();

        if (error) {
          throw error;
        }

        const [followersResult, followingResult, postsResult, subscribersResult] = await Promise.all([
          supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", (data as any).id),
          supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", (data as any).id),
          supabase.from("user_feed_posts").select("id", { count: "exact", head: true }).eq("user_id", (data as any).id),
          (supabase as any).from("creator_subscriptions").select("id", { count: "exact", head: true }).eq("subscribed_to_id", (data as any).id),
        ]);

        if (mounted) {
          setProfile({
            ...(data as SupabaseProfile),
            follower_count: followersResult.count ?? 0,
            following_count: followingResult.count ?? 0,
            post_count: postsResult.count ?? 0,
            subscriber_count: subscribersResult.count ?? 0,
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
  }, [publicUid, refetchTick]);

  const refetch = () => {
    setRefetchTick((prev) => prev + 1);
  };

  return { profile, loading, error, refetch };
}

export function useRelationshipStatus(targetUserId: string) {
  const [status, setStatus] = useState<RelationshipStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchTick, setFetchTick] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function fetchStatus() {
      try {
        setLoading(true);
        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          if (mounted) {
            setStatus(null);
            setLoading(false);
          }
          return;
        }

        const { data, error } = await supabase.rpc("get_relationship_status", {
          _viewer_id: user.id,
          _target_id: targetUserId,
        } as any);

        if (error) {
          throw error;
        }

        if (mounted) {
          setStatus(data as RelationshipStatus);
        }
      } catch (err) {
        console.error("Error fetching relationship status:", err);
        if (mounted) {
          setStatus(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (targetUserId) {
      fetchStatus();
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [targetUserId, fetchTick]);

  const refetch = () => setFetchTick((t) => t + 1);

  return { status, loading, refetch };
}

export function useTopThree(profileUserId: string) {
  const [topThree, setTopThree] = useState<TopThreeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchTick, setFetchTick] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function fetchTopThree() {
      try {
        setLoading(true);
        const supabase = createBrowserClient();

        const { data, error } = await supabase.rpc("get_profile_top_three", {
          _profile_user_id: profileUserId,
        } as any);

        if (error) {
          throw error;
        }

        if (mounted) {
          // RPC returns `position` (aliased from slot_position in the DB)
          setTopThree((data as TopThreeEntry[]) || []);
        }
      } catch (err) {
        console.error("Error fetching Top 3:", err);
        if (mounted) {
          setTopThree([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (profileUserId) {
      fetchTopThree();
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [profileUserId, fetchTick]);

  const refetch = () => setFetchTick((t) => t + 1);

  return { topThree, loading, refetch };
}
