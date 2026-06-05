import type {
  PostShowAsset,
  PostShowApplicationStatus,
  PostShowApplicationType,
  PostShowAssetStatus,
  PostShowAssetType,
  PostShowJsonObject,
  PostShowJsonValue,
} from './broadcastPostShowTypes';

export const PUBLIC_APPLICATION_TYPES: PostShowApplicationType[] = [
  'clip_title',
  'clip_caption',
  'replay_blurb',
  'episode_description',
  'seo_description',
];

const APPLICABLE_ASSET_STATUSES: PostShowAssetStatus[] = ['draft', 'generated', 'edited', 'approved', 'published'];

const DRAFT_APPLICATION_BY_ASSET: Partial<Record<PostShowAssetType, PostShowApplicationType>> = {
  social_post: 'social_draft',
  newsletter_blurb: 'newsletter_draft',
  push_notification_copy: 'push_copy_draft',
};

const DIRECT_APPLICATION_BY_ASSET: Partial<Record<PostShowAssetType, PostShowApplicationType>> = {
  clip_title: 'clip_title',
  clip_caption: 'clip_caption',
  replay_blurb: 'replay_blurb',
  episode_description: 'episode_description',
  seo_description: 'seo_description',
  thumbnail_prompt: 'thumbnail_prompt',
  cover_prompt: 'cover_prompt',
  tag_suggestion: 'prescribe_me_metadata',
  show_summary: 'prescribe_me_metadata',
  highlight_explanation: 'prescribe_me_metadata',
};

const SAFE_PRESCRIBE_KEYS = new Set([
  'mood_tags',
  'genre_tags',
  'audience_tags',
  'energy',
  'energy_level',
  'tempo',
  'tags',
  'content_warning',
  'confidence',
]);

export function resolvePostShowApplicationType(
  assetType: PostShowAssetType,
  requestedType?: PostShowApplicationType,
): PostShowApplicationType | null {
  if (requestedType) return requestedType;
  return DRAFT_APPLICATION_BY_ASSET[assetType] ?? DIRECT_APPLICATION_BY_ASSET[assetType] ?? null;
}

export function canApplyPostShowAssetStatus(status: PostShowAssetStatus): boolean {
  return APPLICABLE_ASSET_STATUSES.includes(status);
}

export function assetHasModerationWarnings(asset: Pick<PostShowAsset, 'metadata' | 'moderation_snapshot'>): boolean {
  const metadataWarnings = collectWarnings(asset.metadata);
  const moderationWarnings = collectWarnings(asset.moderation_snapshot);
  return metadataWarnings.length > 0 || moderationWarnings.length > 0;
}

export function requiresPostShowApplicationReview(input: {
  asset: Pick<PostShowAsset, 'asset_status' | 'metadata' | 'moderation_snapshot'>;
  applicationType: PostShowApplicationType;
  targetVisibility?: string | null;
}): boolean {
  if (assetHasModerationWarnings(input.asset)) return true;
  if (input.targetVisibility === 'public' || input.targetVisibility === 'unlisted') {
    return input.asset.asset_status !== 'approved' && input.asset.asset_status !== 'published';
  }
  return false;
}

export function createApplicationDraftStatus(input: {
  asset: Pick<PostShowAsset, 'asset_status' | 'metadata' | 'moderation_snapshot'>;
  applicationType: PostShowApplicationType;
  targetVisibility?: string | null;
}): PostShowApplicationStatus {
  return requiresPostShowApplicationReview(input) ? 'pending_review' : 'draft';
}

export function canApplyPostShowAsset(asset: Pick<PostShowAsset, 'asset_status'>): {
  allowed: boolean;
  reason?: string;
} {
  if (asset.asset_status === 'rejected') {
    return { allowed: false, reason: 'Rejected post-show assets cannot be applied.' };
  }
  if (asset.asset_status === 'archived') {
    return { allowed: false, reason: 'Archived post-show assets cannot be applied.' };
  }
  if (!canApplyPostShowAssetStatus(asset.asset_status)) {
    return { allowed: false, reason: `Post-show asset status ${asset.asset_status} is not applyable.` };
  }
  return { allowed: true };
}

export function normalizePostShowAppliedValue(value: string): string {
  return value.trim().replace(/\r\n/g, '\n');
}

export function buildSafePrescribeMeMetadata(
  asset: Pick<PostShowAsset, 'id' | 'asset_type' | 'title' | 'platform' | 'metadata' | 'source_snapshot'>,
): PostShowJsonObject {
  const safe: PostShowJsonObject = {
    source: 'tradio_post_show_publisher',
    asset_id: asset.id,
    asset_type: asset.asset_type,
  };

  if (asset.title) safe.title = asset.title;
  if (asset.platform) safe.platform = asset.platform;

  copySafeMetadata(safe, asset.source_snapshot);
  copySafeMetadata(safe, asset.metadata);

  return safe;
}

export function publicPostShowApplicationVisible(input: {
  applicationStatus: PostShowApplicationStatus;
  applicationType: PostShowApplicationType;
  targetVisibility?: string | null;
  targetStatus?: string | null;
}): boolean {
  const appliedOrApproved =
    input.applicationStatus === 'applied' || input.applicationStatus === 'approved';
  const targetIsPublic = input.targetVisibility === 'public';
  const targetIsPublished = !input.targetStatus || input.targetStatus === 'published';
  return (
    appliedOrApproved &&
    PUBLIC_APPLICATION_TYPES.includes(input.applicationType) &&
    targetIsPublic &&
    targetIsPublished
  );
}

function copySafeMetadata(target: PostShowJsonObject, source: unknown): void {
  if (!source || typeof source !== 'object' || Array.isArray(source)) return;

  for (const [key, value] of Object.entries(source as Record<string, unknown>)) {
    if (!SAFE_PRESCRIBE_KEYS.has(key)) continue;
    const jsonValue = sanitizeJsonValue(value);
    if (jsonValue !== undefined) {
      target[key] = jsonValue;
    }
  }
}

function collectWarnings(source: unknown): string[] {
  if (!source || typeof source !== 'object' || Array.isArray(source)) return [];
  const record = source as Record<string, unknown>;
  const candidates = [record.safety_warnings, record.moderation_warnings, record.warnings];
  return candidates.flatMap((candidate) => {
    if (!Array.isArray(candidate)) return [];
    return candidate.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
  });
}

function sanitizeJsonValue(value: unknown): PostShowJsonValue | undefined {
  if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) {
    return value as PostShowJsonValue;
  }
  if (Array.isArray(value)) {
    return value
      .map((entry) => sanitizeJsonValue(entry))
      .filter((entry): entry is PostShowJsonValue => entry !== undefined);
  }
  if (value && typeof value === 'object') {
    const safe: PostShowJsonObject = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      const jsonValue = sanitizeJsonValue(nested);
      if (jsonValue !== undefined) safe[key] = jsonValue;
    }
    return safe;
  }
  return undefined;
}
