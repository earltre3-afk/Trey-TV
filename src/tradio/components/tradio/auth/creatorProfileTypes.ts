/**
 * TRADIO PASS 4J — Creator Profile Service Types
 *
 * Types for loading, storing, and reconciling creator role profiles
 * from both mock data and Supabase tables. All types are designed to work
 * with or without Supabase configured, gracefully degrading to mock fallbacks.
 */

import type { RoleProfileType } from './roleProfile';
import type { TradioIdentity } from './types';

/**
 * Lookup key variations for profile queries.
 * The service tries each in order: userId → publicUid → handle.
 */
export interface CreatorProfileLookupKey {
  userId?: string;
  publicProfileUid?: string;
  handle?: string;
}

/**
 * Internal: Base fields found in all role-specific profile tables.
 * These map to the Supabase schema (artist/producer/dj_profiles).
 */
export interface CreatorProfileBase {
  id: string;
  user_id: string;
  profile_id?: string | null;
  public_profile_uid?: string | null;
  slug: string;
  avatar_url?: string | null;
  banner_url?: string | null;
  bio?: string | null;
  tradio_verification_status: 'unverified' | 'pending' | 'verified' | 'rejected' | 'revoked';
  broadcast_access: 'invite_only' | 'submitted' | 'pending' | 'under_review' | 'cleared' | 'denied' | 'revoked';
  badges?: string[] | null;
  studio_access: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Artist-specific profile fields from tradio_artist_profiles.
 */
export interface ArtistProfileRecord extends CreatorProfileBase {
  artist_name: string;
  tradio_genres: string[];
  city?: string | null;
  region?: string | null;
  monthly_listeners: number;
  followers_count: number;
  total_releases: number;
  pinned_release_id?: string | null;
  spotlight_track_id?: string | null;
}

/**
 * Producer-specific profile fields from tradio_producer_profiles.
 */
export interface ProducerProfileRecord extends CreatorProfileBase {
  producer_name: string;
  tradio_genres: string[];
  tradio_moods: string[];
  specialties: string[];
  beat_count: number;
  beat_pack_count: number;
  collaboration_count: number;
  featured_beat_pack_id?: string | null;
}

/**
 * DJ/Host-specific profile fields from tradio_dj_profiles.
 */
export interface DjHostProfileRecord extends CreatorProfileBase {
  dj_name: string;
  tradio_genres: string[];
  specialties: string[];
  show_count: number;
  mix_count: number;
  total_listeners: number;
  currently_broadcasting: boolean;
  upcoming_show_count: number;
}

/**
 * Discriminated union of all creator profile records.
 */
export type CreatorProfileRecord = ArtistProfileRecord | ProducerProfileRecord | DjHostProfileRecord;

/**
 * Backend status/diagnostic for a profile query result.
 */
export type CreatorProfileBackendStatus =
  | 'connected' // Supabase available and profile found
  | 'not_configured' // Supabase not configured
  | 'table_missing' // Supabase available but table doesn't exist yet
  | 'not_found' // Supabase available but no row for this lookup
  | 'error' // Supabase query error
  | 'mock'; // Fallback to mock identity-derived data

/**
 * Result of a profile service query. Always includes a profile and status.
 * Never throws; always has a graceful fallback shape.
 */
export interface CreatorProfileServiceResult {
  /** The profile record (real or mock/derived). */
  profile: CreatorProfileRecord | null;

  /** Whether this is Supabase-backed or mock-derived. */
  source: 'supabase' | 'mock' | 'fallback';

  /** Current backend status. */
  backendStatus: CreatorProfileBackendStatus;

  /** If status is 'error', the error message. */
  error?: string;

  /** If status is 'not_found', a diagnostic hint. */
  notFoundReason?: string;

  /** Visibility of the profile (public/private/unlisted). Derived or explicit. */
  visibility: 'public' | 'private' | 'unlisted';

  /** Whether the profile is publication-ready. */
  isPublicReady: boolean;

  /** Whether the profile is complete (all required fields). */
  isComplete: boolean;
}

/**
 * Payload for updating/drafting a creator profile.
 * Pass a subset of fields; undefined fields are not changed.
 */
export interface CreatorProfileDraftPayload {
  displayName?: string;
  bio?: string;
  genres?: string[];
  moods?: string[]; // producer-only
  specialties?: string[]; // producer/dj-only
  city?: string;
  region?: string;
  slug?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  visibility?: 'public' | 'private' | 'unlisted';
  metadata?: Record<string, unknown>;
}

/**
 * Update result. Always includes a status, never throws.
 */
export interface CreatorProfileUpdateResult {
  success: boolean;
  error?: string;
  updatedProfile?: CreatorProfileRecord | null;
  source: 'supabase' | 'mock';
}

/**
 * Public URL form for a creator profile.
 * Used for sharing and routing.
 */
export interface CreatorProfilePublicRoute {
  /** Role + public_profile_uid form. */
  uid: string; // "/tradio/artist/:public_profile_uid"

  /** Optional handle form (future-friendly). */
  handle?: string; // "/tradio/artist/@handle"

  /** Full absolute URL for sharing. */
  absoluteUrl?: string;

  /** Deep link into shell view state. */
  shellDeepLink: string; // `openPublicCreatorProfile(role, publicUid)`
}

/**
 * Content module definition mapped to a specific role.
 * Used for rendering the module grid on profile pages.
 */
export interface CreatorProfileContentModule {
  id: string;
  title: string;
  description: string;
  role: RoleProfileType;
  ownerOnly?: boolean;
  requiresBroadcast?: boolean;
  icon?: React.ReactNode;
  isAvailable: boolean; // determined by completion/broadcast status
  lockedReason?: string; // e.g., "Broadcast access required"
}

/**
 * Service configuration / detection result.
 * Tells the service what to do (use real DB, fall back to mock, etc).
 */
export interface CreatorProfileServiceConfig {
  /** Supabase is configured and responding. */
  isSupabaseReady: boolean;

  /** Supabase tables exist. Determined at service init. */
  tablesExist: {
    artist: boolean;
    producer: boolean;
    dj: boolean;
  };

  /** Service is in read-only mode (no updates). */
  readOnly: boolean;

  /** Prefer mock for demo/testing. */
  mockOnly: boolean;
}

/**
 * Unified profile response that includes identity + role profile data.
 * Useful for the UI to have both the Trey TV identity and the role-specific data.
 */
export interface EnrichedCreatorProfile extends CreatorProfileServiceResult {
  /** The source Trey TV identity this profile belongs to. */
  identity?: TradioIdentity;

  /** Role name (artist/producer/dj). */
  role: RoleProfileType;

  /** Display name (from profile or identity). */
  displayName: string;

  /** Public UID (from profile or identity). */
  publicProfileUid?: string | null;

  /** Username (from identity). */
  username?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRADIO PASS 4K — Creator Profile Draft & Editing Types
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Status of a profile draft in the local editing session.
 */
export type CreatorProfileDraftStatus = 'empty' | 'dirty' | 'saving' | 'saved' | 'failed' | 'submitted' | 'published';

/**
 * Publication/visibility status of a profile.
 */
export type CreatorProfilePublishStatus =
  | 'private' // Only visible to owner
  | 'draft' // Saved as draft, not public
  | 'ready_for_review' // Ready for moderation review
  | 'public' // Published and public
  | 'hidden' // Owner-hidden
  | 'suspended'; // Admin-suspended

/**
 * Validation issue found during profile completion check.
 */
export interface CreatorProfileValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  fixedBy?: string; // e.g., "adding a bio" or "uploading an avatar"
}

/**
 * Base draft shared across all roles.
 * Extends the DraftPayload with additional metadata.
 */
export interface CreatorProfileDraft {
  role: RoleProfileType;
  user_id: string;
  status: CreatorProfileDraftStatus;
  lastModified: number; // timestamp
  expiresAt?: number; // optional auto-expiration
  data: CreatorProfileDraftPayload & {
    // Role-specific fields
    artistName?: string;
    producerName?: string;
    djName?: string;

    // Additional fields not in base payload
    releaseGoal?: string; // artist
    beatLicensingIntent?: 'exclusive' | 'non_exclusive' | 'open' | 'not_selling'; // producer
    showTypes?: string[]; // dj
    broadcastConcept?: string; // dj
    scheduleGoal?: string; // dj
    listenerRequestStyle?: string; // dj
    explicitComfort?: boolean; // artist reminder flag
    moderationAgreement?: boolean; // dj reminder flag
    replayArchiveEnabled?: boolean; // dj
    fanCommunityEnabled?: boolean; // artist
    collabAvailability?: string; // producer
  };
}

/**
 * Artist profile draft (role-specific).
 */
export interface ArtistProfileDraft extends CreatorProfileDraft {
  role: 'artist';
  data: CreatorProfileDraft['data'] & {
    artistName: string;
    genres: string[];
    bio?: string;
    city?: string;
    region?: string;
    avatar?: string;
    banner?: string;
  };
}

/**
 * Producer profile draft (role-specific).
 */
export interface ProducerProfileDraft extends CreatorProfileDraft {
  role: 'producer';
  data: CreatorProfileDraft['data'] & {
    producerName: string;
    genres: string[];
    moods?: string[];
    specialties?: string[];
    bio?: string;
    avatar?: string;
    banner?: string;
  };
}

/**
 * DJ/Host profile draft (role-specific).
 */
export interface DjHostProfileDraft extends CreatorProfileDraft {
  role: 'dj';
  data: CreatorProfileDraft['data'] & {
    djName: string;
    genres: string[];
    specialties?: string[];
    bio?: string;
    city?: string;
    region?: string;
    avatar?: string;
    banner?: string;
    showTypes: string[];
  };
}

/**
 * Discriminated union of role-specific drafts.
 */
export type CreatorProfileSpecificDraft = ArtistProfileDraft | ProducerProfileDraft | DjHostProfileDraft;

/**
 * Completion checklist for a profile.
 */
export interface CreatorProfileCompletionChecklist {
  required: CreatorProfileValidationIssue[]; // must fix
  optional: CreatorProfileValidationIssue[]; // suggested improvements
  percentComplete: number; // 0-100
  isReadyForPublish: boolean; // all required fields filled
}

/**
 * Result of validating a draft.
 */
export interface CreatorProfileValidationResult {
  isValid: boolean;
  issues: CreatorProfileValidationIssue[];
  checklist: CreatorProfileCompletionChecklist;
  canPublish: boolean;
}

/**
 * Result of saving a draft (local or backend).
 */
export interface CreatorProfileSaveResult {
  success: boolean;
  error?: string;
  draft?: CreatorProfileSpecificDraft;
  status: CreatorProfileDraftStatus;
  savedAt?: number;
}

/**
 * Result of publishing/submitting a profile.
 */
export interface CreatorProfilePublishResult {
  success: boolean;
  error?: string;
  publishStatus?: CreatorProfilePublishStatus;
  requiresReview?: boolean;
  message?: string; // e.g., "Profile submitted for review"
}

/**
 * Modes for previewing a draft.
 */
export type CreatorProfilePreviewMode = 'owner' | 'public';

/**
 * Configuration for editing/draft lifecycle.
 */
export interface CreatorProfileEditConfig {
  /** Allow saving drafts. */
  allowDrafts: boolean;
  /** Allow submitting for review/publish. */
  allowPublish: boolean;
  /** Auto-save interval (ms). 0 = disabled. */
  autoSaveInterval: number;
  /** Draft expiration time (ms). 0 = never. */
  draftExpiration: number;
  /** Persistent storage method: 'localStorage' | 'memory' */
  persistenceMethod: 'localStorage' | 'memory';
}
