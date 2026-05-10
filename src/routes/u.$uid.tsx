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

import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/hooks/use-profile";
import { currentUser } from "@/lib/mock-data";
import banner from "@/assets/profile-banner.jpg";
import { ProfilePageShell } from "@/components/profile/ProfilePageShell";
import type { ProfileData, ViewerRole } from "@/components/profile";

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
  const { user: authUser, isGuest, role, isApprovedCreator } = useAuth();
  const { profile: dbProfile, loading } = useProfile(uid);

  // ── Determine who is viewing ──────────────────────────────────────────
  const isOwnProfile = !isGuest && (authUser?.uid ?? currentUser.uid) === uid;

  const viewerRole: ViewerRole = isOwnProfile ? "owner" : isGuest ? "guest" : "user";

  // ── Build normalized ProfileData ──────────────────────────────────────
  const profileData = useMemo<ProfileData>(() => {
    // If loading or no DB profile, fall back to session user or mock
    if (loading || !dbProfile) {
      const fallback = authUser ?? currentUser;
      return {
        uid,
        displayName: fallback.name,
        handle: fallback.handle,
        avatarUrl: fallback.avatar as string,
        bannerUrl: (fallback as any).banner || banner,
        bio: fallback.bio,
        location: fallback.location,
        websiteLink: (fallback as any).link,
        tagline: (fallback as any).tagline,
        pronouns: (fallback as any).pronouns,
        birthday: (fallback as any).birthday,
        favoriteGenres: (fallback as any).favoriteGenres,
        favoriteCreators: (fallback as any).favoriteCreators,
        socialInstagram: (fallback as any).socialInstagram,
        socialTikTok: (fallback as any).socialTikTok,
        socialYouTube: (fallback as any).socialYouTube,
        profileVisibility: (fallback as any).profileVisibility,
        showLocation: (fallback as any).showLocation,
        showBirthday: (fallback as any).showBirthday,
        joinedDate: undefined,
        profileType: (role === "creator" || role === "admin") ? "creator" : "user",
        isCreator: role === "creator" || role === "admin",
        isVerified: !!fallback.verified,
        verifiedKind: fallback.verified ?? "user",
        isFounder: isOwnProfile,
        stats: {
          posts: fallback.stats?.posts ?? 0,
          followers: fallback.stats?.followers ?? 0,
          following: fallback.stats?.following ?? 0,
          prescriptions: fallback.stats?.prescriptions,
          // Creator extras populated once real data flows in
          episodes: 0,
          subscribers: "—",
          watchHours: "—",
        },
        rewards: (authUser as any)?.rewards ?? { points: 12480, tier: "GOLD" },
        interests: [],
        creatorStatus: authUser?.creatorStatus,
        accentColor: (authUser as any)?.accent ?? null,
      };
    }

    // Real Supabase profile
    const isCreatorProfile =
      (isOwnProfile && (role === "creator" || role === "admin"));

    return {
      uid,
      displayName: dbProfile.display_name || dbProfile.username || "Anonymous",
      handle: dbProfile.username || "anonymous",
      avatarUrl: dbProfile.avatar_url || (authUser?.avatar as string) || currentUser.avatar,
      bannerUrl: dbProfile.banner_url || banner,
      bio: dbProfile.bio ?? undefined,
      location: dbProfile.location ?? undefined,
      websiteLink: undefined, // Map from schema when available
      tagline: (authUser as any)?.tagline,
      pronouns: (authUser as any)?.pronouns,
      birthday: (authUser as any)?.birthday,
      favoriteGenres: (authUser as any)?.favoriteGenres,
      favoriteCreators: (authUser as any)?.favoriteCreators,
      socialInstagram: (authUser as any)?.socialInstagram,
      socialTikTok: (authUser as any)?.socialTikTok,
      socialYouTube: (authUser as any)?.socialYouTube,
      profileVisibility: (authUser as any)?.profileVisibility,
      showLocation: (authUser as any)?.showLocation,
      showBirthday: (authUser as any)?.showBirthday,
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
      isFounder: isOwnProfile && (role === "admin" || authUser?.uid === currentUser.uid),
      stats: {
        // Use real stats if available; otherwise fall back gracefully
        posts: currentUser.stats.posts,
        followers: currentUser.stats.followers,
        following: currentUser.stats.following,
        prescriptions: currentUser.stats.prescriptions,
        episodes: 0,
        subscribers: "—",
        watchHours: "—",
      },
      rewards: isOwnProfile
        ? ((authUser as any)?.rewards ?? { points: 12480, tier: "GOLD" })
        : undefined,
      interests: [],
      creatorStatus: isOwnProfile ? authUser?.creatorStatus : undefined,
      accentColor: dbProfile.profile_accent_color,
    };
  }, [dbProfile, loading, uid, authUser, isGuest, isOwnProfile, role, isApprovedCreator]);

  return <ProfilePageShell profile={profileData} viewerRole={viewerRole} />;
}
