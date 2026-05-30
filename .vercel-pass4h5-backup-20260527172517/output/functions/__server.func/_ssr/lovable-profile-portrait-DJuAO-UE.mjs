import { r as reactExports } from "../_libs/react.mjs";
import { c as createBrowserClient } from "./router-BtgGywEC.mjs";
function useProfile(publicUid) {
  const [profile, setProfile] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    let mounted = true;
    async function fetchProfile() {
      try {
        setLoading(true);
        const supabase = createBrowserClient();
        const { data, error: error2 } = await supabase.from("profiles").select("id, public_profile_uid, display_name, username, avatar_url, banner_url, bio, location, link_url, tagline, pronouns, birthday, favorite_genres, favorite_creators, social_instagram, social_tiktok, social_youtube, profile_visibility, show_location, show_birthday, created_at, profile_accent_color, zodiac_sun_sign, zodiac_moon_sign, zodiac_rising_sign, zodiac_is_cusp, zodiac_cusp_label, zodiac_badge_key, zodiac_public_opt_in, birth_chart_json, role, creator_status, gif_of_day_url, gif_of_day_poster_url, gif_of_day_caption, show_fwd_gifs_on_profile").eq("public_profile_uid", publicUid).single();
        if (error2) {
          throw error2;
        }
        const [followersResult, followingResult, postsResult, subscribersResult] = await Promise.all([
          supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", data.id),
          supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", data.id),
          supabase.from("user_feed_posts").select("id", { count: "exact", head: true }).eq("user_id", data.id),
          supabase.from("creator_subscriptions").select("id", { count: "exact", head: true }).eq("subscribed_to_id", data.id)
        ]);
        if (mounted) {
          setProfile({
            ...data,
            follower_count: followersResult.count ?? 0,
            following_count: followingResult.count ?? 0,
            post_count: postsResult.count ?? 0,
            subscriber_count: subscribersResult.count ?? 0
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
function useRelationshipStatus(targetUserId) {
  const [status, setStatus] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [fetchTick, setFetchTick] = reactExports.useState(0);
  reactExports.useEffect(() => {
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
          _target_id: targetUserId
        });
        if (error) {
          throw error;
        }
        if (mounted) {
          setStatus(data);
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
function useTopThree(profileUserId) {
  const [topThree, setTopThree] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [fetchTick, setFetchTick] = reactExports.useState(0);
  reactExports.useEffect(() => {
    let mounted = true;
    async function fetchTopThree() {
      try {
        setLoading(true);
        const supabase = createBrowserClient();
        const { data, error } = await supabase.rpc("get_profile_top_three", {
          _profile_user_id: profileUserId
        });
        if (error) {
          throw error;
        }
        if (mounted) {
          setTopThree(data || []);
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
const portrait = "/assets/pixel-profile-portrait-CJXu_2Nd.jpg";
export {
  useRelationshipStatus as a,
  useTopThree as b,
  portrait as p,
  useProfile as u
};
