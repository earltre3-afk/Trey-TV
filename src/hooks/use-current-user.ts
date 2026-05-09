import { useState, useEffect } from "react";
import { useAuth as useSupabaseAuth } from "@/hooks/use-auth";
import { createBrowserClient } from "@/lib/supabase-browser";
import { SessionUser } from "@/lib/auth";
import { currentUser as fallbackUser } from "@/lib/mock-data";

export function useCurrentUser(): SessionUser {
  const { user, loading } = useSupabaseAuth();
  const [profile, setProfile] = useState<SessionUser | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      if (!user) {
        if (mounted) setProfile(null);
        return;
      }
      
      setIsFetching(true);
      const supabase = createBrowserClient();
      try {
        const { data: rawData, error } = await supabase
          .from("profiles")
          .select("id, public_profile_uid, display_name, username, avatar_url, banner_url, bio, location, created_at, role, verification_type, is_verified, verified_creator, profile_accent_color")
          .eq("id", user.id)
          .single();

        const data = rawData as any;

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

            const mappedProfile: SessionUser = {
              name: data.display_name || fallbackUser.name,
              handle: data.username || fallbackUser.handle,
              uid: data.public_profile_uid || fallbackUser.uid,
              avatar: data.avatar_url || fallbackUser.avatar,
              banner: data.banner_url || fallbackUser.banner,
              bio: data.bio || fallbackUser.bio,
              location: data.location || fallbackUser.location,
              link: fallbackUser.link,
              accent: (data.profile_accent_color as any) || "gold",
              verified: verified || fallbackUser.verified,
              role: (data.role as any) || "user",
              stats: fallbackUser.stats,
              rewards: { points: 12480, tier: "GOLD" },
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
  }, [user, loading]);

  const defaultSessionUser: SessionUser = {
    ...fallbackUser,
    role: "user",
    accent: "gold",
    rewards: { points: 12480, tier: "GOLD" },
  };

  if (loading || isFetching || !user || !profile) {
    return defaultSessionUser;
  }

  return profile;
}
