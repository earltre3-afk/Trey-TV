/**
 * TRADIO PASS 4J — Creator Profile Service
 *
 * Backend service layer for fetching, storing, and managing creator role profiles.
 *
 * Behavior:
 * - Uses Supabase tables if configured and available
 * - Falls back to mock/identity-derived data if not
 * - Never crashes; always returns a graceful result
 * - Designed to work alongside mock profile data in Pass 4I
 * - Preserves current UX while preparing for real Supabase-backed profiles
 */

import { supabase } from '@/tradio/lib/supabaseClient';
import type {
  ArtistProfileRecord,
  CreatorProfileBackendStatus,
  CreatorProfileDraftPayload,
  CreatorProfileLookupKey,
  CreatorProfileRecord,
  CreatorProfileServiceConfig,
  CreatorProfileServiceResult,
  CreatorProfileUpdateResult,
  DjHostProfileRecord,
  ProducerProfileRecord,
} from './creatorProfileTypes';
import type { RoleProfileType } from './roleProfile';
import type { TradioIdentity } from './types';

const TABLE_NAMES: Record<RoleProfileType, string> = {
  artist: 'tradio_artist_profiles',
  producer: 'tradio_producer_profiles',
  dj: 'tradio_dj_profiles',
};

/**
 * Detect service config at startup.
 * Checks if Supabase is available and tables exist.
 */
const serviceConfig: CreatorProfileServiceConfig = {
  isSupabaseReady: false,
  tablesExist: { artist: false, producer: false, dj: false },
  readOnly: false,
  mockOnly: false,
};

export async function initCreatorProfileService(): Promise<CreatorProfileServiceConfig> {
  if (!supabase) {
    serviceConfig.isSupabaseReady = false;
    return serviceConfig;
  }

  try {
    // Try a lightweight query to each table to detect existence.
    for (const role of ['artist', 'producer', 'dj'] as RoleProfileType[]) {
      const tableName = TABLE_NAMES[role];
      const { error } = await supabase.from(tableName).select('id').limit(1);

      if (error?.code === 'PGRST116' || error?.message?.includes('does not exist')) {
        serviceConfig.tablesExist[role] = false;
      } else if (!error) {
        serviceConfig.tablesExist[role] = true;
        serviceConfig.isSupabaseReady = true;
      }
    }
  } catch {
    // If anything fails, assume Supabase is not ready. Service will use mock.
    serviceConfig.isSupabaseReady = false;
  }

  return serviceConfig;
}

export function getServiceConfig(): CreatorProfileServiceConfig {
  return { ...serviceConfig };
}

/**
 * Derive a mock profile from a Tradio identity.
 * Used as fallback when Supabase is not available.
 */
function deriveMockProfile(identity: TradioIdentity, role: RoleProfileType): CreatorProfileRecord | null {
  // Read local draft if available
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let localDraftData: any = {};
  try {
    const stored = localStorage.getItem(`tradio_draft_${role}_${identity.user_id}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      localDraftData = parsed.data || {};
    }
  } catch (e) {
    // ignore
  }

  const baseProfile = {
    id: `mock-${identity.user_id}-${role}`,
    user_id: identity.user_id,
    profile_id: identity.profile_id,
    public_profile_uid: identity.public_profile_uid,
    slug: `${identity.username}-${role}`.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    avatar_url: localDraftData.avatar || identity.avatar_url,
    banner_url: localDraftData.banner || identity.banner_url,
    bio: localDraftData.bio || (identity.display_name ? `Tradio ${role} creator profile.` : null),
    tradio_verification_status: identity.verification_status,
    broadcast_access: identity.broadcast_access_status,
    badges: [],
    studio_access: identity.roles.some((r) => ['admin', 'owner'].includes(r.role)),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),

    // Spotify-style Pinned Pick & Socials mapping
    artist_pick_type: localDraftData.artistPickType || 'track',
    artist_pick_title: localDraftData.artistPickTitle || null,
    artist_pick_message: localDraftData.artistPickMessage || null,
    artist_pick_image: localDraftData.artistPickImage || null,
    social_instagram: localDraftData.socialInstagram || null,
    social_tiktok: localDraftData.socialTiktok || null,
    social_youtube: localDraftData.socialYoutube || null,
    social_twitter: localDraftData.socialTwitter || null,
  };

  if (role === 'artist') {
    return {
      ...baseProfile,
      artist_name: localDraftData.artistName || identity.display_name || `@${identity.username}`,
      tradio_genres: (localDraftData.genres && localDraftData.genres.length > 0) ? localDraftData.genres : (identity.genres || []),
      city: localDraftData.city || identity.city,
      region: localDraftData.region || identity.region,
      monthly_listeners: 0,
      followers_count: 0,
      total_releases: 0,
      pinned_release_id: null,
      spotlight_track_id: null,
    } as ArtistProfileRecord;
  }

  if (role === 'producer') {
    return {
      ...baseProfile,
      producer_name: localDraftData.producerName || identity.display_name || `@${identity.username}`,
      tradio_genres: (localDraftData.genres && localDraftData.genres.length > 0) ? localDraftData.genres : (identity.genres || []),
      tradio_moods: localDraftData.moods || [],
      specialties: localDraftData.specialties || [],
      beat_count: 0,
      beat_pack_count: 0,
      collaboration_count: 0,
      featured_beat_pack_id: null,
    } as ProducerProfileRecord;
  }

  if (role === 'dj') {
    return {
      ...baseProfile,
      dj_name: localDraftData.djName || identity.display_name || `@${identity.username}`,
      tradio_genres: (localDraftData.genres && localDraftData.genres.length > 0) ? localDraftData.genres : (identity.genres || []),
      specialties: localDraftData.specialties || [],
      show_count: 0,
      mix_count: 0,
      total_listeners: 0,
      currently_broadcasting: false,
      upcoming_show_count: 0,
    } as DjHostProfileRecord;
  }

  return null;
}

/**
 * Get a creator profile by role and user ID.
 * Most common query path: "load my artist profile".
 */
export async function getCreatorProfileByRoleAndUser(
  role: RoleProfileType,
  userId: string
): Promise<CreatorProfileServiceResult> {
  try {
    const client = supabase;
    if (!serviceConfig.isSupabaseReady || !serviceConfig.tablesExist[role] || !client) {
      return {
        profile: null,
        source: 'mock',
        backendStatus: serviceConfig.isSupabaseReady ? 'table_missing' : 'not_configured',
        visibility: 'private',
        isPublicReady: false,
        isComplete: false,
        notFoundReason: 'Supabase not available.',
      };
    }

    const tableName = TABLE_NAMES[role];
    const { data, error } = await client.from(tableName).select('*').eq('user_id', userId).single();

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          profile: null,
          source: 'supabase',
          backendStatus: 'not_found',
          visibility: 'private',
          isPublicReady: false,
          isComplete: false,
          notFoundReason: `No ${role} profile found for user ${userId}.`,
        };
      }
      throw error;
    }

    return {
      profile: data as CreatorProfileRecord,
      source: 'supabase',
      backendStatus: 'connected',
      visibility: (data?.visibility as 'public' | 'private' | 'unlisted') || 'private',
      isPublicReady: data?.visibility === 'public' && data?.status !== 'draft',
      isComplete: !!data?.artist_name || !!data?.producer_name || !!data?.dj_name,
    };
  } catch (err) {
    console.error(`[creatorProfileService] Error fetching ${role} profile for user ${userId}:`, err);
    return {
      profile: null,
      source: 'supabase',
      backendStatus: 'error',
      visibility: 'private',
      isPublicReady: false,
      isComplete: false,
      error: String(err),
    };
  }
}

/**
 * Get a creator profile by public UID (for public/shared viewing).
 * Used when rendering `/tradio/artist/:public_profile_uid`.
 */
export async function getCreatorProfileByPublicUid(
  role: RoleProfileType,
  publicProfileUid: string
): Promise<CreatorProfileServiceResult> {
  if (!publicProfileUid) {
    return {
      profile: null,
      source: 'mock',
      backendStatus: 'not_configured',
      visibility: 'private',
      isPublicReady: false,
      isComplete: false,
      notFoundReason: 'No public UID provided.',
    };
  }

  try {
    const client = supabase;
    if (!serviceConfig.isSupabaseReady || !serviceConfig.tablesExist[role] || !client) {
      return {
        profile: null,
        source: 'mock',
        backendStatus: serviceConfig.isSupabaseReady ? 'table_missing' : 'not_configured',
        visibility: 'private',
        isPublicReady: false,
        isComplete: false,
        notFoundReason: 'Supabase not available.',
      };
    }

    const tableName = TABLE_NAMES[role];
    const { data, error } = await client.from(tableName).select('*').eq('public_profile_uid', publicProfileUid).single();

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          profile: null,
          source: 'supabase',
          backendStatus: 'not_found',
          visibility: 'private',
          isPublicReady: false,
          isComplete: false,
          notFoundReason: `No ${role} profile found with public UID ${publicProfileUid}.`,
        };
      }
      throw error;
    }

    return {
      profile: data as CreatorProfileRecord,
      source: 'supabase',
      backendStatus: 'connected',
      visibility: (data?.visibility as 'public' | 'private' | 'unlisted') || 'private',
      isPublicReady: data?.visibility === 'public' && data?.status !== 'draft',
      isComplete: !!data?.artist_name || !!data?.producer_name || !!data?.dj_name,
    };
  } catch (err) {
    console.error(`[creatorProfileService] Error fetching ${role} profile by public UID ${publicProfileUid}:`, err);
    return {
      profile: null,
      source: 'supabase',
      backendStatus: 'error',
      visibility: 'private',
      isPublicReady: false,
      isComplete: false,
      error: String(err),
    };
  }
}

/**
 * Get a creator profile by username/handle (future-friendly for `/tradio/artist/@handle`).
 * Currently falls back to mock.
 */
export async function getCreatorProfileByHandle(
  role: RoleProfileType,
  handle: string
): Promise<CreatorProfileServiceResult> {
  if (!handle) {
    return {
      profile: null,
      source: 'mock',
      backendStatus: 'not_configured',
      visibility: 'private',
      isPublicReady: false,
      isComplete: false,
      notFoundReason: 'No handle provided.',
    };
  }

  try {
    const client = supabase;
    if (!serviceConfig.isSupabaseReady || !serviceConfig.tablesExist[role] || !client) {
      return {
        profile: null,
        source: 'mock',
        backendStatus: serviceConfig.isSupabaseReady ? 'table_missing' : 'not_configured',
        visibility: 'private',
        isPublicReady: false,
        isComplete: false,
        notFoundReason: 'Supabase not available.',
      };
    }

    const tableName = TABLE_NAMES[role];
    const { data, error } = await client.from(tableName).select('*').eq('slug', handle).single();

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          profile: null,
          source: 'supabase',
          backendStatus: 'not_found',
          visibility: 'private',
          isPublicReady: false,
          isComplete: false,
          notFoundReason: `No ${role} profile found with handle @${handle}.`,
        };
      }
      throw error;
    }

    return {
      profile: data as CreatorProfileRecord,
      source: 'supabase',
      backendStatus: 'connected',
      visibility: (data?.visibility as 'public' | 'private' | 'unlisted') || 'private',
      isPublicReady: data?.visibility === 'public' && data?.status !== 'draft',
      isComplete: !!data?.artist_name || !!data?.producer_name || !!data?.dj_name,
    };
  } catch (err) {
    console.error(`[creatorProfileService] Error fetching ${role} profile by handle ${handle}:`, err);
    return {
      profile: null,
      source: 'supabase',
      backendStatus: 'error',
      visibility: 'private',
      isPublicReady: false,
      isComplete: false,
      error: String(err),
    };
  }
}

/**
 * Get the current user's creator profile (owner view).
 * Uses identity to derive mock profile if Supabase not available.
 */
export async function getMyCreatorProfile(
  role: RoleProfileType,
  identity: TradioIdentity
): Promise<CreatorProfileServiceResult> {
  // First, try to load from Supabase.
  const result = await getCreatorProfileByRoleAndUser(role, identity.user_id);

  // If found in Supabase, return it.
  if (result.profile) {
    return result;
  }

  // Fall back to mock/identity-derived profile.
  const mockProfile = deriveMockProfile(identity, role);

  // Check draft status for visibility & completeness fallback
  let visibility: 'private' | 'public' = 'private';
  let isPublicReady = false;
  let isComplete = false;

  try {
    const stored = localStorage.getItem(`tradio_draft_${role}_${identity.user_id}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.status === 'published' || parsed.data?.visibility === 'public') {
        visibility = 'public';
        isPublicReady = true;
      }

      const data = parsed.data || {};
      if (role === 'artist') {
        isComplete = !!data.artistName && data.genres?.length > 0 && !!data.bio;
      } else if (role === 'producer') {
        isComplete = !!data.producerName && data.genres?.length > 0 && !!data.bio && (data.moods?.length > 0 || data.specialties?.length > 0);
      } else if (role === 'dj') {
        isComplete = !!data.djName && data.genres?.length > 0 && !!data.bio && data.showTypes?.length > 0 && !!data.broadcastConcept;
      }
    }
  } catch (e) {
    // ignore
  }

  return {
    profile: mockProfile,
    source: 'mock',
    backendStatus: result.backendStatus,
    visibility,
    isPublicReady,
    isComplete,
    notFoundReason: result.notFoundReason,
  };
}

/**
 * Update / draft a creator profile.
 * Currently only accepts mock/local; Supabase writes require backend validation.
 */
export async function updateCreatorProfileDraft(
  role: RoleProfileType,
  userId: string,
  payload: CreatorProfileDraftPayload
): Promise<CreatorProfileUpdateResult> {
  // For Pass 4J, updates are local-only simulation.
  // Real backend updates would require role validation, RLS checks, etc.
  // This function serves as the hook for future Supabase integration.

  try {
    // If Supabase is ready, attempt update (subject to future RLS).
    const client = supabase;
    if (serviceConfig.isSupabaseReady && serviceConfig.tablesExist[role] && client) {
      const tableName = TABLE_NAMES[role];
      const updatePayload: Record<string, unknown> = {};

      if (payload.displayName !== undefined) {
        const displayNameField = role === 'artist' ? 'artist_name' : role === 'producer' ? 'producer_name' : 'dj_name';
        updatePayload[displayNameField] = payload.displayName;
      }
      if (payload.bio !== undefined) updatePayload.bio = payload.bio;
      if (payload.genres !== undefined) updatePayload.tradio_genres = payload.genres;
      if (payload.moods !== undefined && role === 'producer') updatePayload.tradio_moods = payload.moods;
      if (payload.specialties !== undefined && (role === 'producer' || role === 'dj')) updatePayload.specialties = payload.specialties;
      if (payload.city !== undefined) updatePayload.city = payload.city;
      if (payload.region !== undefined) updatePayload.region = payload.region;
      if (payload.avatarUrl !== undefined) updatePayload.avatar_url = payload.avatarUrl;
      if (payload.bannerUrl !== undefined) updatePayload.banner_url = payload.bannerUrl;

      const { data, error } = await client.from(tableName).update(updatePayload).eq('user_id', userId).select().single();

      if (error) throw error;

      return {
        success: true,
        updatedProfile: data as CreatorProfileRecord,
        source: 'supabase',
      };
    }

    // Mock only: return success without actually persisting.
    return {
      success: true,
      source: 'mock',
    };
  } catch (err) {
    console.error(`[creatorProfileService] Error updating ${role} profile for user ${userId}:`, err);
    return {
      success: false,
      error: String(err),
      source: serviceConfig.isSupabaseReady ? 'supabase' : 'mock',
    };
  }
}

/**
 * Check if a profile is public-ready.
 * Based on visibility + completion status.
 */
export function isCreatorProfilePublicReady(result: CreatorProfileServiceResult): boolean {
  return result.isPublicReady && result.isComplete;
}

/**
 * Build a public URL form for a creator profile.
 */
export function getCreatorProfilePublicUrl(
  role: RoleProfileType,
  profile: CreatorProfileRecord | TradioIdentity
): string {
  const publicUid = 'public_profile_uid' in profile ? profile.public_profile_uid : profile?.public_profile_uid;
  if (!publicUid) return '';
  return `/tradio/${role}/${publicUid}`;
}

/**
 * Get content modules available for a role + profile state.
 * (Already defined in roleProfile.ts; this is a convenience re-export hook.)
 */
export function getCreatorProfileContentModules(role: RoleProfileType, result: CreatorProfileServiceResult) {
  // This would integrate with ROLE_PROFILE_SECTIONS from roleProfile.ts
  // and filter based on completion/broadcast/visibility state.
  // For now, return a list; RoleProfilePage will apply filtering.
  return [];
}

/**
 * Get the completion status of a creator profile.
 * Extends the identity-based completion from roleProfile.ts with Supabase data.
 */
export function getCreatorProfileCompletion(
  role: RoleProfileType,
  profile: CreatorProfileRecord | null,
  identity: TradioIdentity
) {
  // This would combine identity signals + Supabase profile data
  // to produce a detailed completion checklist.
  // For now, return a summary.
  if (!profile) {
    return { percent: 0, completed: 0, total: 1 };
  }

  let completed = 0;
  const total = 4; // Display name, avatar, bio, role approval

  if (role === 'artist') {
    completed += (profile as ArtistProfileRecord).artist_name ? 1 : 0;
  } else if (role === 'producer') {
    completed += (profile as ProducerProfileRecord).producer_name ? 1 : 0;
  } else if (role === 'dj') {
    completed += (profile as DjHostProfileRecord).dj_name ? 1 : 0;
  }

  completed += profile.avatar_url ? 1 : 0;
  completed += profile.bio ? 1 : 0;
  completed += identity.roles.some((r) => r.role === role && r.role_status === 'active') ? 1 : 0;

  return { percent: Math.round((completed / total) * 100), completed, total };
}
