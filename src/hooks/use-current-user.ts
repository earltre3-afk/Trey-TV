import { useState, useEffect } from "react";
import { useAuth as useSupabaseAuth } from "@/hooks/use-auth";
import { useSupabaseSession } from "@/lib/supabase-session";
import { createBrowserClient } from "@/lib/supabase-browser";
import { SessionUser } from "@/lib/auth";
import { currentUser as fallbackUser } from "@/lib/mock-data";
import { pointsToRewardTier } from "@/hooks/use-rewards";

export function useCurrentUser(): SessionUser {
  const { user, authReady } = useSupabaseAuth();
  const loading = !authReady;
  const { user: supaUser } = useSupabaseSession();
  const [profile, setProfile] = useState<SessionUser | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      if (!supaUser?.id) {
        if (mounted) setProfile(null);
        return;
      }

      setIsFetching(true);
      const supabase = createBrowserClient();
      try {
        const [{ data: rawData, error }, { data: rewardsData }] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, public_profile_uid, display_name, username, avatar_url, banner_url, bio, location, link_url, created_at, role, verification_type, is_verified, verified_creator, profile_accent_color, tagline, pronouns, birthday, favorite_genres, favorite_creators, social_instagram, social_tiktok, social_youtube, profile_visibility, show_location, show_birthday")
            .eq("id", supaUser.id)
            .single(),
          (supabase as any)
            .from("community_credit_balances")
            .select("current_balance, lifetime_earned")
            .eq("user_id", supaUser.id)
            .maybeSingle(),
        ]);

        const data = rawData as any;
        const rewardBalance = rewardsData as any;

        if (error || !data) {
          console.error("Failed to fetch profile:", error);
          if (mounted) setProfile(null);
        } else {
          if (mounted) {
            let verified: "creator" | "user" | undefined = undefined;
            if (data.is_verified) {
              verified = data.verified_creator ? "creator" : "user";
            } else if (data.verification_type === "creator") {
               verified = "creator";
            }

            const rewardPoints = Number(rewardBalance?.current_balance ?? 0);
            const rewardTier = pointsToRewardTier(Number(rewardBalance?.lifetime_earned ?? rewardPoints)).tier as any;
            const publicUid = data.public_profile_uid || data.id || "";
            const mappedProfile: SessionUser = {
              name: data.display_name || data.username || "Trey TV Member",
              handle: data.username || (publicUid ? `user_${String(publicUid).slice(-6)}` : "member"),
              uid: publicUid,
              avatar: data.avatar_url || "",
              banner: data.banner_url || "",
              bio: data.bio || "",
              location: data.location || "",
              link: data.link_url || "",
              accent: (data.profile_accent_color as any) || "gold",
              tagline: data.tagline || "",
              pronouns: data.pronouns || "",
              birthday: data.birthday || "",
              favoriteGenres: data.favorite_genres || "",
              favoriteCreators: data.favorite_creators || "",
              socialInstagram: data.social_instagram || "",
              socialTikTok: data.social_tiktok || "",
              socialYouTube: data.social_youtube || "",
              verified,
              role: (data.role as any) || "user",
              stats: fallbackUser.stats,
              rewards: { points: rewardPoints, tier: rewardTier },
              profileVisibility: data.profile_visibility || "public",
              showLocation: data.show_location ?? true,
              showBirthday: data.show_birthday ?? false,
            };
            setProfile(mappedProfile);
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        if (mounted) setProfile(null);
      } finally {
        if (mounted) setIsFetching(false);
      }
    }

    if (!loading) {
      fetchProfile();
    }

    return () => {
      mounted = false;
    };
  }, [user, loading, supaUser]);

  const defaultSessionUser: SessionUser = {
    name: "Trey TV Member",
    handle: "member",
    uid: "",
    avatar: "",
    banner: "",
    bio: "",
    location: "",
    link: "",
    verified: undefined,
    stats: fallbackUser.stats,
    role: "user",
    accent: "#FFC857",
    rewards: { points: 12480, tier: "GOLD" },
  };

  if (loading || isFetching || !user || !profile) {
    return defaultSessionUser;
  }

  return profile;
}
