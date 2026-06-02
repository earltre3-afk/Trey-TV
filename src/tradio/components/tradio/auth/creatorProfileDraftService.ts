/**
 * TRADIO PASS 4K — Creator Profile Draft Service
 *
 * Manages profile editing drafts, validation, and completion logic.
 * Uses localStorage for persistence; gracefully degrades to memory if unavailable.
 * Never calls real backend; all mock for now.
 */

import type { TradioIdentity } from "./types";
import type {
  CreatorProfileDraft,
  CreatorProfileDraftPayload,
  CreatorProfileDraftStatus,
  CreatorProfileSpecificDraft,
  CreatorProfileValidationResult,
  CreatorProfileValidationIssue,
  CreatorProfileSaveResult,
  CreatorProfilePublishResult,
  CreatorProfileCompletionChecklist,
  ArtistProfileDraft,
  ProducerProfileDraft,
  DjHostProfileDraft,
} from "./creatorProfileTypes";
import type { RoleProfileType } from "./roleProfile";

// ─────────────────────────────────────────────────────────────────────────────
// Storage & Persistence
// ─────────────────────────────────────────────────────────────────────────────

const DRAFT_STORAGE_KEY = (role: RoleProfileType, userId: string) =>
  `tradio_draft_${role}_${userId}`;
const draftMemoryCache = new Map<string, CreatorProfileSpecificDraft>();

function storeDraft(draft: CreatorProfileSpecificDraft): void {
  const key = DRAFT_STORAGE_KEY(draft.role, draft.user_id);
  draftMemoryCache.set(key, draft);
  try {
    localStorage.setItem(key, JSON.stringify(draft));
  } catch (err) {
    console.warn("[creatorProfileDraftService] localStorage failed, using memory cache:", err);
  }
}

function loadDraft(role: RoleProfileType, userId: string): CreatorProfileSpecificDraft | null {
  const key = DRAFT_STORAGE_KEY(role, userId);

  // Check memory cache first
  if (draftMemoryCache.has(key)) {
    return draftMemoryCache.get(key) || null;
  }

  // Try localStorage
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const draft = JSON.parse(stored) as CreatorProfileSpecificDraft;
      draftMemoryCache.set(key, draft);
      return draft;
    }
  } catch (err) {
    console.warn("[creatorProfileDraftService] localStorage read failed:", err);
  }

  return null;
}

function clearDraft(role: RoleProfileType, userId: string): void {
  const key = DRAFT_STORAGE_KEY(role, userId);
  draftMemoryCache.delete(key);
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn("[creatorProfileDraftService] localStorage clear failed:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Draft Initialization
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get or create a draft for the given role and identity.
 */
export function getCreatorProfileDraft(
  role: RoleProfileType,
  identity: TradioIdentity,
): CreatorProfileSpecificDraft {
  const draft = loadDraft(role, identity.user_id);

  if (draft) {
    return draft;
  }

  // Create a new empty draft
  const now = Date.now();
  const baseDraft = {
    role,
    user_id: identity.user_id,
    status: "empty" as const,
    lastModified: now,
    expiresAt: now + 7 * 24 * 60 * 60 * 1000, // 7 days
    data: {
      genres: [],
      specialties: [],
      moods: [],
      city: "",
      region: "",
      bio: "",
      visibility: "private" as const,
      artistPickType: "track" as const,
      artistPickTitle: "",
      artistPickMessage: "",
      artistPickImage: "",
      socialInstagram: "",
      socialTiktok: "",
      socialYoutube: "",
      socialTwitter: "",
    },
  };

  if (role === "artist") {
    const artistDraft: ArtistProfileDraft = {
      ...baseDraft,
      role: "artist",
      data: {
        ...baseDraft.data,
        artistName: identity.display_name || "",
        releaseGoal: "",
        explicitComfort: false,
        fanCommunityEnabled: false,
      },
    };
    storeDraft(artistDraft);
    return artistDraft;
  } else if (role === "producer") {
    const producerDraft: ProducerProfileDraft = {
      ...baseDraft,
      role: "producer",
      data: {
        ...baseDraft.data,
        producerName: identity.display_name || "",
        beatLicensingIntent: "non_exclusive",
        collabAvailability: "",
      },
    };
    storeDraft(producerDraft);
    return producerDraft;
  } else {
    const djDraft: DjHostProfileDraft = {
      ...baseDraft,
      role: "dj",
      data: {
        ...baseDraft.data,
        djName: identity.display_name || "",
        showTypes: [],
        broadcastConcept: "",
        scheduleGoal: "",
        listenerRequestStyle: "open",
        moderationAgreement: false,
        replayArchiveEnabled: true,
      },
    };
    storeDraft(djDraft);
    return djDraft;
  }
}

/**
 * Update a draft locally (not persisted yet).
 */
export function updateCreatorProfileDraftLocal(
  draft: CreatorProfileSpecificDraft,
  updates: Partial<CreatorProfileDraftPayload>,
): CreatorProfileSpecificDraft {
  const next = {
    ...draft,
    status: "dirty" as const,
    lastModified: Date.now(),
  };

  if (draft.role === "artist") {
    const updatedDraft: ArtistProfileDraft = {
      ...draft,
      ...next,
      role: "artist",
      data: {
        ...draft.data,
        ...updates,
        artistName: draft.data.artistName,
        genres: updates.genres ?? draft.data.genres,
      },
    };
    return updatedDraft;
  }
  if (draft.role === "producer") {
    const updatedDraft: ProducerProfileDraft = {
      ...draft,
      ...next,
      role: "producer",
      data: {
        ...draft.data,
        ...updates,
        producerName: draft.data.producerName,
        genres: updates.genres ?? draft.data.genres,
      },
    };
    return updatedDraft;
  }
  const updatedDraft: DjHostProfileDraft = {
    ...draft,
    ...next,
    role: "dj",
    data: {
      ...draft.data,
      ...updates,
      djName: draft.data.djName,
      genres: updates.genres ?? draft.data.genres,
      showTypes: draft.data.showTypes,
    },
  };
  return updatedDraft;
}

/**
 * Save a draft to persistence.
 */
export function saveCreatorProfileDraft(
  draft: CreatorProfileSpecificDraft,
): CreatorProfileSaveResult {
  try {
    const updatedDraft = {
      ...draft,
      status: "saved" as const,
      lastModified: Date.now(),
    };
    storeDraft(updatedDraft);
    return {
      success: true,
      draft: updatedDraft,
      status: "saved",
      savedAt: Date.now(),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      success: false,
      error: message,
      status: "failed",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation & Completion
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate a draft and return completion checklist.
 */
export function validateCreatorProfileDraft(
  role: RoleProfileType,
  draft: CreatorProfileSpecificDraft,
): CreatorProfileValidationResult {
  const required: CreatorProfileValidationIssue[] = [];
  const optional: CreatorProfileValidationIssue[] = [];

  const data = draft.data;
  const has = (value: unknown) => (Array.isArray(value) ? value.length > 0 : Boolean(value));

  if (role === "artist") {
    // Required
    if (!data.artistName || data.artistName.trim().length === 0) {
      required.push({
        field: "artistName",
        message: "Artist name is required",
        severity: "error",
        fixedBy: "adding your artist name",
      });
    }
    if (!has(data.genres)) {
      required.push({
        field: "genres",
        message: "Please select at least one genre",
        severity: "error",
        fixedBy: "selecting genres that match your music",
      });
    }
    if (!data.bio || data.bio.trim().length < 10) {
      required.push({
        field: "bio",
        message: "Bio must be at least 10 characters",
        severity: "error",
        fixedBy: "writing a bio",
      });
    }

    // Optional
    if (!data.avatar) {
      optional.push({
        field: "avatar",
        message: "Profile picture helps fans recognize you",
        severity: "warning",
        fixedBy: "uploading an avatar",
      });
    }
    if (!data.releaseGoal || data.releaseGoal.trim().length === 0) {
      optional.push({
        field: "releaseGoal",
        message: "Add a release goal to inspire your creative focus",
        severity: "warning",
        fixedBy: "setting a release goal",
      });
    }
  } else if (role === "producer") {
    // Required
    if (!data.producerName || data.producerName.trim().length === 0) {
      required.push({
        field: "producerName",
        message: "Producer name is required",
        severity: "error",
        fixedBy: "adding your producer name",
      });
    }
    if (!has(data.genres)) {
      required.push({
        field: "genres",
        message: "Please select at least one beat genre",
        severity: "error",
        fixedBy: "selecting genres that match your beats",
      });
    }
    if (!data.bio || data.bio.trim().length < 10) {
      required.push({
        field: "bio",
        message: "Bio must be at least 10 characters",
        severity: "error",
        fixedBy: "writing a bio",
      });
    }
    if (!has(data.moods) && !has(data.specialties)) {
      required.push({
        field: "moods",
        message: "Add moods or specialties to help artists find your beats",
        severity: "error",
        fixedBy: "selecting moods or specialties",
      });
    }

    // Optional
    if (!data.avatar) {
      optional.push({
        field: "avatar",
        message: "Profile picture helps artists connect with you",
        severity: "warning",
        fixedBy: "uploading an avatar",
      });
    }
    if (!data.collabAvailability || data.collabAvailability.trim().length === 0) {
      optional.push({
        field: "collabAvailability",
        message: "Let artists know if you collaborate",
        severity: "warning",
        fixedBy: "describing your collab availability",
      });
    }
  } else if (role === "dj") {
    // Required
    if (!data.djName || data.djName.trim().length === 0) {
      required.push({
        field: "djName",
        message: "DJ/Host name is required",
        severity: "error",
        fixedBy: "adding your DJ name",
      });
    }
    if (!has(data.genres)) {
      required.push({
        field: "genres",
        message: "Please select at least one preferred genre",
        severity: "error",
        fixedBy: "selecting genres you spin",
      });
    }
    if (!data.bio || data.bio.trim().length < 10) {
      required.push({
        field: "bio",
        message: "Bio must be at least 10 characters",
        severity: "error",
        fixedBy: "writing a bio",
      });
    }
    if (!has(data.showTypes)) {
      required.push({
        field: "showTypes",
        message: "Select at least one show type",
        severity: "error",
        fixedBy: "choosing show types",
      });
    }
    if (!data.broadcastConcept || data.broadcastConcept.trim().length === 0) {
      required.push({
        field: "broadcastConcept",
        message: "Describe your broadcast concept",
        severity: "error",
        fixedBy: "describing your show concept",
      });
    }

    // Optional
    if (!data.avatar) {
      optional.push({
        field: "avatar",
        message: "Profile picture helps listeners recognize you",
        severity: "warning",
        fixedBy: "uploading an avatar",
      });
    }
    if (!data.scheduleGoal || data.scheduleGoal.trim().length === 0) {
      optional.push({
        field: "scheduleGoal",
        message: "Set a schedule goal for consistency",
        severity: "warning",
        fixedBy: "setting a broadcast schedule goal",
      });
    }
  }

  // Shared Spotify-inspired Optional Checks (Artist Pick & Socials)
  if (!data.artistPickTitle || data.artistPickTitle.trim().length === 0) {
    optional.push({
      field: "artistPickTitle",
      message: 'Feature an "Artist Pick" (pinned featured release or beat) on your profile page',
      severity: "warning",
      fixedBy: "pinning an Artist Pick",
    });
  }
  if (!data.socialInstagram && !data.socialTiktok && !data.socialYoutube && !data.socialTwitter) {
    optional.push({
      field: "socialInstagram",
      message: "Connect social handles (Instagram/TikTok/YouTube) to link your platforms",
      severity: "warning",
      fixedBy: "adding your social handles",
    });
  }

  const totalChecks = required.length + optional.length;
  const passedChecks = totalChecks - required.length;
  const percentComplete =
    totalChecks > 0 ? Math.round(((totalChecks - required.length) / totalChecks) * 100) : 100;

  return {
    isValid: required.length === 0,
    issues: [...required, ...optional],
    checklist: {
      required,
      optional,
      percentComplete,
      isReadyForPublish: required.length === 0,
    },
    canPublish: required.length === 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Publishing / Submission
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Submit a profile for review (mock).
 */
export function submitCreatorProfileForReview(
  role: RoleProfileType,
  identity: TradioIdentity,
  draft: CreatorProfileSpecificDraft,
): CreatorProfilePublishResult {
  const validation = validateCreatorProfileDraft(role, draft);

  if (!validation.canPublish) {
    return {
      success: false,
      error: "Profile is incomplete. Please fill in all required fields.",
      requiresReview: false,
    };
  }

  // Mark as submitted (mock)
  const updatedDraft: CreatorProfileSpecificDraft = {
    ...draft,
    status: "submitted",
    lastModified: Date.now(),
  };
  storeDraft(updatedDraft);

  return {
    success: true,
    publishStatus: "ready_for_review",
    requiresReview: true,
    message: `Your ${role} profile has been submitted for review. We'll notify you when it's approved.`,
  };
}

/**
 * Publish a profile to public (mock).
 * In Pass 4K, this is local-only. Real publish requires backend in Pass 4L.
 */
export function publishCreatorProfileMock(
  role: RoleProfileType,
  identity: TradioIdentity,
  draft: CreatorProfileSpecificDraft,
): CreatorProfilePublishResult {
  const validation = validateCreatorProfileDraft(role, draft);

  if (!validation.canPublish) {
    return {
      success: false,
      error: "Profile is incomplete. Please fill in all required fields.",
      requiresReview: false,
    };
  }

  // Mark as published (mock)
  const lastModified = Date.now();
  const updatedDraft: CreatorProfileSpecificDraft =
    draft.role === "artist"
      ? {
          ...draft,
          status: "published",
          lastModified,
          data: { ...draft.data, visibility: "public" },
        }
      : draft.role === "producer"
        ? {
            ...draft,
            status: "published",
            lastModified,
            data: { ...draft.data, visibility: "public" },
          }
        : {
            ...draft,
            status: "published",
            lastModified,
            data: { ...draft.data, visibility: "public" },
          };
  storeDraft(updatedDraft);

  return {
    success: true,
    publishStatus: "public",
    requiresReview: false,
    message: `Your ${role} profile is now public! Share your profile URL with fans.`,
  };
}

/**
 * Get current draft status (for UI).
 */
export function getProfileDraftStatus(
  role: RoleProfileType,
  identity: TradioIdentity,
): { status: CreatorProfileDraftStatus; lastModified: number } {
  const draft = loadDraft(role, identity.user_id);
  if (!draft) {
    return { status: "empty", lastModified: Date.now() };
  }
  return {
    status: draft.status,
    lastModified: draft.lastModified,
  };
}

/**
 * Reset a draft (delete it).
 */
export function resetProfileDraftMock(role: RoleProfileType, userId: string): void {
  clearDraft(role, userId);
}

/**
 * Export a draft for external use (debugging/testing).
 */
export function exportDraftAsJSON(draft: CreatorProfileSpecificDraft): string {
  return JSON.stringify(draft, null, 2);
}

/**
 * Import a draft from JSON (debugging/testing).
 */
export function importDraftFromJSON(json: string): CreatorProfileSpecificDraft | null {
  try {
    const draft = JSON.parse(json) as CreatorProfileSpecificDraft;
    storeDraft(draft);
    return draft;
  } catch (err) {
    console.error("[creatorProfileDraftService] Import failed:", err);
    return null;
  }
}
