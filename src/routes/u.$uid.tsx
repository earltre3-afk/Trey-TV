/**
 * u.$uid.tsx — Public Profile Route
 *
 * This route renders ANY user's public profile page using the
 * ProfilePageShell template system. It is the single source of truth
 * for how profiles look across the platform.
 *
 * Data resolution order:
 *   1. Supabase real profile (via useProfile hook)
 *   2. Authenticated session user (if viewing own profile)
 *   3. Mock currentUser fallback (loading / error state)
 *
 * Role logic:
 *   - If viewer === profile owner → "owner"
 *   - If viewer is authenticated user → "user"
 *   - If viewer is guest → "guest"
 *
 * Profile type logic:
 *   - If auth.role === "creator" | "admin" → "creator"
 *   - Otherwise → "user"
 */

import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { useProfile, useRelationshipStatus, useTopThree } from "@/hooks/use-profile";
import { currentUser } from "@/lib/mock-data";
import banner from "@/assets/profile-banner.jpg";
import { isTreyOwnerProfile } from "@/lib/trey-owner";
import type { ProfileData, ViewerRole } from "@/components/profile";
import { ProfilePageNew } from "@/components/profile/ProfilePageNew";
import type { ProfileVariant } from "@/components/profile/ProfilePageNew";

export const Route = createFileRoute("/u/$uid")({
  component: PublicProfileRoute,
  head: ({ params }) => ({
    meta: [
      { title: `Profile (@${params.uid}) — Trey TV` },
      {
        name: "description",
        content: `Public profile on Trey TV. UID ${params.uid}.`,
      },
    ],
  }),
});

function PublicProfileRoute() {
  const { uid } = Route.useParams();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { user: authUser, isGuest, role, isApprovedCreator } = useAuth();
  const { profile: dbProfile, loading } = useProfile(uid);

  // Load relationship status and Top 3 for authenticated users
  const { status: relationshipStatus } = useRelationshipStatus(dbProfile?.id || "");
  const { topThree } = useTopThree(dbProfile?.id || "");

  // ── Determine who is viewing ──────────────────────────────────────────
  const isOwnProfile = !isGuest && authUser?.uid === uid;

  const viewerRole: ViewerRole = isOwnProfile ? "owner" : isGuest ? "guest" : "user";

  // ── Build normalized ProfileData ──────────────────────────────────────
  const profileData = useMemo<ProfileData>(() => {
    // Only the official Trey UID gets the Trey demo fallback. Other profiles
    // should never inherit @trey fields while their Supabase row is loading.
    if (loading || !dbProfile) {
      const isSessionProfile = isOwnProfile && !!authUser;
      const isTreyProfile = isTreyOwnerProfile({ uid });
      const fallback = isSessionProfile ? authUser : isTreyProfile ? currentUser : null;
      const isFallbackCreator =
        isTreyProfile ||
        (isSessionProfile && (fallback?.verified === "creator" || role === "creator" || role === "admin"));
      return {
        uid,
        displayName: fallback?.name ?? (loading ? "Loading profile" : "Profile unavailable"),
        handle: fallback?.handle ?? uid,
        avatarUrl: (fallback?.avatar as string | undefined) ?? "",
        bannerUrl: (fallback as any)?.banner || banner,
        bio: fallback?.bio,
        location: fallback?.location,
        websiteLink: (fallback as any)?.link,
        tagline: (fallback as any)?.tagline,
        pronouns: (fallback as any)?.pronouns,
        birthday: (fallback as any)?.birthday,
        favoriteGenres: (fallback as any)?.favoriteGenres,
        favoriteCreators: (fallback as any)?.favoriteCreators,
        socialInstagram: (fallback as any)?.socialInstagram,
        socialTikTok: (fallback as any)?.socialTikTok,
        socialYouTube: (fallback as any)?.socialYouTube,
        profileVisibility: (fallback as any)?.profileVisibility,
        showLocation: (fallback as any)?.showLocation,
        showBirthday: (fallback as any)?.showBirthday,
        joinedDate: undefined,
        profileType: isFallbackCreator ? "creator" : "user",
        isCreator: isFallbackCreator,
        isVerified: !!fallback?.verified,
        verifiedKind: fallback?.verified ?? (isFallbackCreator ? "creator" : "user"),
        isFounder: isTreyProfile,
        stats: {
          posts: fallback?.stats?.posts ?? 0,
          followers: fallback?.stats?.followers ?? 0,
          following: fallback?.stats?.following ?? 0,
          prescriptions: fallback?.stats?.prescriptions,
          // Creator extras populated once real data flows in
          episodes: 0,
          subscribers: "—",
          watchHours: "—",
        },
        rewards: (authUser as any)?.rewards ?? { points: 12480, tier: "GOLD" },
        interests: [],
        creatorStatus: isSessionProfile ? authUser?.creatorStatus : undefined,
        accentColor: isSessionProfile ? ((authUser as any)?.accent ?? null) : null,
      };
    }

    // Real Supabase profile
    const isCreatorProfile =
      dbProfile.creator_status === "approved" ||
      dbProfile.role === "creator" ||
      dbProfile.role === "admin" ||
      (isOwnProfile && (role === "creator" || role === "admin"));
    const isTreyProfile = isTreyOwnerProfile({
      username: dbProfile.username,
      public_profile_uid: dbProfile.public_profile_uid,
    });

    return {
      uid,
      displayName: dbProfile.display_name || dbProfile.username || "Anonymous",
      handle: dbProfile.username || "anonymous",
      avatarUrl: dbProfile.avatar_url || "",
      bannerUrl: dbProfile.banner_url || banner,
      bio: dbProfile.bio ?? undefined,
      location: dbProfile.location ?? undefined,
      websiteLink: dbProfile.link_url ?? undefined,
      tagline: dbProfile.tagline ?? undefined,
      pronouns: dbProfile.pronouns ?? undefined,
      birthday: dbProfile.birthday ?? undefined,
      favoriteGenres: dbProfile.favorite_genres ?? undefined,
      favoriteCreators: dbProfile.favorite_creators ?? undefined,
      socialInstagram: dbProfile.social_instagram ?? undefined,
      socialTikTok: dbProfile.social_tiktok ?? undefined,
      socialYouTube: dbProfile.social_youtube ?? undefined,
      profileVisibility: dbProfile.profile_visibility as any,
      showLocation: dbProfile.show_location ?? true,
      showBirthday: dbProfile.show_birthday ?? false,
      joinedDate: dbProfile.created_at
        ? new Date(dbProfile.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
          })
        : undefined,
      profileType: isCreatorProfile ? "creator" : "user",
      isCreator: isCreatorProfile,
      isVerified: isCreatorProfile || (isOwnProfile && isApprovedCreator),
      verifiedKind: isCreatorProfile ? "creator" : "user",
      isFounder: isTreyProfile,
      stats: {
        posts: dbProfile.post_count ?? 0,
        followers: dbProfile.follower_count ?? 0,
        following: dbProfile.following_count ?? 0,
        prescriptions: undefined,
        episodes: 0,
        subscribers: "—",
        watchHours: "—",
      },
      rewards: isOwnProfile
        ? ((authUser as any)?.rewards ?? { points: 12480, tier: "GOLD" })
        : undefined,
      interests: [],
      creatorStatus: (dbProfile.creator_status as any) ?? (isOwnProfile ? authUser?.creatorStatus : undefined),
      accentColor: dbProfile.profile_accent_color,
      gifOfDayUrl: (dbProfile as any).gif_of_day_url ?? null,
      gifOfDayPosterUrl: (dbProfile as any).gif_of_day_poster_url ?? null,
      gifOfDayCaption: (dbProfile as any).gif_of_day_caption ?? null,
      zodiacSunSign: dbProfile.zodiac_public_opt_in === false ? null : dbProfile.zodiac_sun_sign,
      zodiacMoonSign: dbProfile.zodiac_public_opt_in === false ? null : dbProfile.zodiac_moon_sign,
      zodiacRisingSign: dbProfile.zodiac_public_opt_in === false ? null : dbProfile.zodiac_rising_sign,
      zodiacIsCusp: dbProfile.zodiac_public_opt_in !== false && !!dbProfile.zodiac_is_cusp,
      zodiacCuspLabel: dbProfile.zodiac_public_opt_in === false ? null : dbProfile.zodiac_cusp_label,
      zodiacBadgeKey: dbProfile.zodiac_public_opt_in === false ? null : dbProfile.zodiac_badge_key,
      zodiacPublicOptIn: dbProfile.zodiac_public_opt_in !== false,
      birthChartHighlights: dbProfile.zodiac_public_opt_in === false ? null : dbProfile.birth_chart_json,
    };
  }, [dbProfile, loading, uid, authUser, isGuest, isOwnProfile, role, isApprovedCreator]);

  if (pathname.endsWith("/channel")) {
    return <Outlet />;
  }

  // Determine variant for ProfilePageNew
  const isTreyProfile = isTreyOwnerProfile({
    username: dbProfile?.username,
    public_profile_uid: dbProfile?.public_profile_uid,
    uid,
  });
  const variant: ProfileVariant = isOwnProfile
    ? isTreyProfile
      ? "owner"
      : profileData.isCreator
        ? "creator"
        : "user"
    : "public";

  return <ProfilePageNew profile={profileData} variant={variant} />;
}
