import type {
  DistributionAnalyticsEventType,
  DistributionDraft,
  DistributionDraftFormatted,
  DistributionDraftMetadata,
  DistributionDraftPatch,
  DistributionDraftStatus,
  DistributionDraftType,
  DistributionPlatform,
} from './broadcastDistributionTypes';
import type {
  PostShowApplication,
  PostShowAsset,
  PostShowAssetStatus,
  PostShowAssetType,
  PostShowJsonObject,
  PostShowJsonValue,
} from './broadcastPostShowTypes';

const DRAFTABLE_ASSET_STATUSES: PostShowAssetStatus[] = ['draft', 'generated', 'edited', 'approved', 'published'];

const SAFE_SOURCE_KEYS = new Set([
  'asset_id',
  'asset_type',
  'application_id',
  'application_type',
  'source_type',
  'recording_id',
  'clip_id',
  'episode_id',
  'queue_id',
  'channel_id',
  'platform',
  'draft_type',
  'mood_tags',
  'genre_tags',
  'audience_tags',
  'emotional_tone',
  'energy',
  'energy_level',
  'engagement_intensity',
  'replay_eligibility',
  'clip_duration_seconds',
  'recording_duration_seconds',
  'follow_up_topic_tags',
  'tags',
  'content_warning',
  'confidence',
]);

const PUBLIC_FACING_PLATFORMS: DistributionPlatform[] = [
  'tiktok',
  'instagram',
  'youtube',
  'facebook',
  'x',
  'newsletter',
  'push',
  'website',
];

const DRAFT_TYPE_BY_ASSET: Partial<Record<PostShowAssetType, DistributionDraftType>> = {
  social_post: 'generic_social',
  newsletter_blurb: 'newsletter_blurb',
  push_notification_copy: 'push_notification',
  replay_blurb: 'website_promo',
  clip_caption: 'instagram_caption',
  clip_title: 'youtube_shorts_caption',
  episode_description: 'youtube_description',
  show_summary: 'website_promo',
  seo_description: 'website_promo',
};

export function canCreateDistributionDraftFromAsset(asset: Pick<PostShowAsset, 'asset_status' | 'visibility'>): {
  allowed: boolean;
  reason?: string;
} {
  if (asset.asset_status === 'rejected') {
    return { allowed: false, reason: 'Rejected post-show assets cannot create distribution drafts.' };
  }
  if (asset.asset_status === 'archived') {
    return { allowed: false, reason: 'Archived post-show assets cannot create distribution drafts.' };
  }
  if (!DRAFTABLE_ASSET_STATUSES.includes(asset.asset_status)) {
    return { allowed: false, reason: `Post-show asset status ${asset.asset_status} cannot create drafts.` };
  }
  return { allowed: true };
}

export function resolveDistributionDraftType(
  assetType: PostShowAssetType,
  platform: DistributionPlatform = 'generic',
  requestedType?: DistributionDraftType,
): DistributionDraftType {
  if (requestedType) return requestedType;
  if (platform === 'tiktok') return 'tiktok_caption';
  if (platform === 'instagram') return 'instagram_caption';
  if (platform === 'youtube') return 'youtube_description';
  if (platform === 'facebook') return 'facebook_post';
  if (platform === 'x') return 'x_post';
  if (platform === 'newsletter') return 'newsletter_blurb';
  if (platform === 'push') return 'push_notification';
  if (platform === 'website') return 'website_promo';
  return DRAFT_TYPE_BY_ASSET[assetType] ?? 'generic_social';
}

export function formatDistributionDraftFromAsset(
  asset: PostShowAsset,
  draftType: DistributionDraftType,
  platform: DistributionPlatform,
): DistributionDraftFormatted {
  const title = normalizeLine(asset.title || titleFromBody(asset.body));
  const baseBody = normalizeBody(asset.body);
  const tags = collectTags(asset);
  const body = formatBodyForPlatform(baseBody, draftType, platform, tags);
  const callToAction = buildCallToAction(platform);

  return {
    draft_type: draftType,
    platform,
    title: platform === 'push' ? trimTo(title, 64) : title,
    body,
    call_to_action: callToAction,
    metadata: {
      no_external_send: true,
      no_auto_publish: true,
      platform,
      draft_type: draftType,
      asset_type: asset.asset_type,
      source: 'tradio_distribution_desk',
      copied_count: 0,
      marked_used: false,
      generated_from_asset: true,
    },
  };
}

export function formatDistributionDraftFromApplication(
  application: PostShowApplication,
  asset: PostShowAsset | null,
  draftType: DistributionDraftType,
  platform: DistributionPlatform,
): DistributionDraftFormatted {
  const title = normalizeLine(asset?.title || titleFromBody(application.applied_value));
  const tags = collectTags(asset ?? ({ metadata: application.applied_metadata, source_snapshot: {} } as PostShowAsset));
  const body = formatBodyForPlatform(application.applied_value, draftType, platform, tags);

  return {
    draft_type: draftType,
    platform,
    title: platform === 'push' ? trimTo(title, 64) : title,
    body,
    call_to_action: buildCallToAction(platform),
    metadata: {
      no_external_send: true,
      no_auto_publish: true,
      platform,
      draft_type: draftType,
      source: 'tradio_distribution_desk',
      generated_from_application: true,
      application_type: application.application_type,
      copied_count: 0,
      marked_used: false,
      ...(asset?.asset_type ? { asset_type: asset.asset_type } : {}),
    },
  };
}

export function buildDistributionSourceSnapshot(
  asset: PostShowAsset,
  application?: Pick<PostShowApplication, 'id' | 'application_type' | 'applied_metadata'> | null,
): PostShowJsonObject {
  const safe: PostShowJsonObject = {
    source_type: 'tradio_post_show_asset',
    asset_id: asset.id,
    asset_type: asset.asset_type,
  };

  if (asset.recording_id) safe.recording_id = asset.recording_id;
  if (asset.clip_id) safe.clip_id = asset.clip_id;
  if (asset.episode_id) safe.episode_id = asset.episode_id;
  if (asset.queue_id) safe.queue_id = asset.queue_id;
  if (asset.channel_id) safe.channel_id = asset.channel_id;
  if (asset.platform) safe.platform = asset.platform;
  if (application) {
    safe.application_id = application.id;
    safe.application_type = application.application_type;
    copySafeJsonKeys(safe, application.applied_metadata);
  }

  copySafeJsonKeys(safe, asset.source_snapshot);
  copySafeJsonKeys(safe, asset.metadata);
  return safe;
}

export function buildManualDistributionSourceSnapshot(input: {
  platform: DistributionPlatform;
  draftType: DistributionDraftType;
  clipId?: string | null;
  recordingId?: string | null;
  episodeId?: string | null;
  queueId?: string | null;
  channelId?: string | null;
}): PostShowJsonObject {
  const safe: PostShowJsonObject = {
    source_type: 'manual_distribution_draft',
    platform: input.platform,
    draft_type: input.draftType,
  };
  if (input.clipId) safe.clip_id = input.clipId;
  if (input.recordingId) safe.recording_id = input.recordingId;
  if (input.episodeId) safe.episode_id = input.episodeId;
  if (input.queueId) safe.queue_id = input.queueId;
  if (input.channelId) safe.channel_id = input.channelId;
  return safe;
}

export function buildPrescribeMeSignalsFromDistributionDraft(draft: Pick<
  DistributionDraft,
  | 'id'
  | 'asset_id'
  | 'draft_type'
  | 'draft_status'
  | 'platform'
  | 'copied_count'
  | 'source_snapshot'
  | 'metadata'
>): PostShowJsonObject {
  const signals: PostShowJsonObject = {
    source: 'tradio_distribution_desk',
    draft_id: draft.id,
    platform: draft.platform,
    draft_type: draft.draft_type,
    draft_status: draft.draft_status,
    copied_count: draft.copied_count,
  };
  if (draft.asset_id) signals.asset_id = draft.asset_id;
  copySafeJsonKeys(signals, draft.source_snapshot);
  copySafeJsonKeys(signals, draft.metadata);
  signals.marked_used = draft.draft_status === 'used' || draft.metadata.marked_used === true;
  delete signals.body;
  return signals;
}

export function distributionDraftRequiresReview(input: {
  platform: DistributionPlatform;
  draftType: DistributionDraftType;
  sourceAssetStatus?: PostShowAssetStatus | null;
  moderationSnapshot?: PostShowJsonObject | null;
}): boolean {
  if (hasModerationWarnings(input.moderationSnapshot)) return true;
  if (!PUBLIC_FACING_PLATFORMS.includes(input.platform)) return false;
  return input.sourceAssetStatus !== 'approved' && input.sourceAssetStatus !== 'published';
}

export function nextDistributionStatusForReady(input: {
  platform: DistributionPlatform;
  draftType: DistributionDraftType;
  sourceAssetStatus?: PostShowAssetStatus | null;
  moderationSnapshot?: PostShowJsonObject | null;
}): DistributionDraftStatus {
  return distributionDraftRequiresReview(input) ? 'pending_review' : 'ready';
}

export function createDistributionCopyPatch(
  draft: Pick<DistributionDraft, 'copied_count' | 'metadata'>,
  nowIso = new Date().toISOString(),
): Required<Pick<DistributionDraftPatch, 'copied_count' | 'last_copied_at' | 'metadata'>> {
  const nextCount = draft.copied_count + 1;
  return {
    copied_count: nextCount,
    last_copied_at: nowIso,
    metadata: appendDistributionEvent(
      {
        ...draft.metadata,
        copied_count: nextCount,
        no_external_send: true,
        no_auto_publish: true,
      },
      'draft_copied',
      nowIso,
    ),
  };
}

export function createDistributionReminderPatch(
  draft: Pick<DistributionDraft, 'metadata'>,
  scheduledForIso: string,
  nowIso = new Date().toISOString(),
): Required<Pick<DistributionDraftPatch, 'scheduled_for' | 'reminder_status' | 'metadata'>> {
  return {
    scheduled_for: scheduledForIso,
    reminder_status: 'scheduled',
    metadata: appendDistributionEvent(
      {
        ...draft.metadata,
        reminder_only: true,
        no_external_send: true,
        no_auto_publish: true,
        reminder_scheduled_for: scheduledForIso,
      },
      'reminder_scheduled',
      nowIso,
    ),
  };
}

export function createDistributionCancelReminderPatch(
  draft: Pick<DistributionDraft, 'metadata'>,
  nowIso = new Date().toISOString(),
): Required<Pick<DistributionDraftPatch, 'scheduled_for' | 'reminder_status' | 'metadata'>> {
  return {
    scheduled_for: null,
    reminder_status: 'canceled',
    metadata: appendDistributionEvent(
      {
        ...draft.metadata,
        reminder_only: true,
        no_external_send: true,
        no_auto_publish: true,
      },
      'reminder_canceled',
      nowIso,
    ),
  };
}

export function createDistributionStatusPatch(
  draft: Pick<DistributionDraft, 'metadata'>,
  status: DistributionDraftStatus,
  eventType: DistributionAnalyticsEventType,
  nowIso = new Date().toISOString(),
  extra: PostShowJsonObject = {},
): Required<Pick<DistributionDraftPatch, 'draft_status' | 'metadata'>> {
  return {
    draft_status: status,
    metadata: appendDistributionEvent(
      {
        ...draft.metadata,
        ...extra,
        no_external_send: true,
        no_auto_publish: true,
        marked_used: status === 'used' || draft.metadata.marked_used === true,
      },
      eventType,
      nowIso,
    ),
  };
}

export function publicDistributionDraftVisible(_draft: Pick<DistributionDraft, 'draft_status'>): boolean {
  return false;
}

export function normalizeDistributionBody(value: string, maxLength = 2000): string {
  return trimTo(normalizeBody(value), maxLength);
}

export function appendDistributionEvent(
  metadata: DistributionDraftMetadata,
  type: DistributionAnalyticsEventType,
  at = new Date().toISOString(),
  extra: PostShowJsonObject = {},
): DistributionDraftMetadata {
  const events = Array.isArray(metadata.events) ? metadata.events.slice(-24) : [];
  return {
    ...metadata,
    events: [
      ...events,
      {
        type,
        at,
        ...extra,
      },
    ],
  };
}

function formatBodyForPlatform(
  value: string,
  draftType: DistributionDraftType,
  platform: DistributionPlatform,
  tags: string[],
): string {
  const base = stripUnsafeClaims(normalizeBody(value));
  const hashtags = tagsToHashtags(tags);
  if (platform === 'x' || draftType === 'x_post') {
    return trimTo([base, hashtags].filter(Boolean).join('\n'), 280);
  }
  if (platform === 'tiktok' || draftType === 'tiktok_caption') {
    return trimTo([hookFirst(base), hashtags].filter(Boolean).join('\n'), 220);
  }
  if (platform === 'instagram' || draftType === 'instagram_caption' || draftType === 'instagram_story') {
    return trimTo([base, hashtags].filter(Boolean).join('\n\n'), 600);
  }
  if (platform === 'youtube' || draftType === 'youtube_description') {
    return trimTo([base, 'Replay prepared in Tradio.'].join('\n\n'), 1200);
  }
  if (platform === 'facebook' || draftType === 'facebook_post') {
    return trimTo(base, 800);
  }
  if (platform === 'newsletter' || draftType === 'newsletter_blurb') {
    return trimTo(base, 900);
  }
  if (platform === 'push' || draftType === 'push_notification') {
    return trimTo(base, 120);
  }
  if (platform === 'website' || draftType === 'website_promo') {
    return trimTo(base, 1000);
  }
  return trimTo(base, 800);
}

function buildCallToAction(platform: DistributionPlatform): string {
  if (platform === 'newsletter') return 'Read and replay on Trey TV';
  if (platform === 'push') return 'Open replay';
  if (platform === 'website') return 'Watch the replay';
  if (platform === 'youtube') return 'Watch the full replay';
  if (platform === 'x') return 'Replay now';
  return 'Tap into the replay';
}

function normalizeBody(value: string): string {
  return value.trim().replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
}

function normalizeLine(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function trimTo(value: string, maxLength: number): string {
  const normalized = value.trim();
  if (normalized.length <= maxLength) return normalized;
  if (maxLength <= 1) return normalized.slice(0, maxLength);
  return `${normalized.slice(0, maxLength - 1).trimEnd()}...`.slice(0, maxLength);
}

function titleFromBody(value: string): string {
  const firstLine = normalizeLine(value.split('\n')[0] || value);
  return trimTo(firstLine || 'Distribution draft', 72);
}

function hookFirst(value: string): string {
  const body = normalizeBody(value);
  if (body.length < 80) return body;
  return body;
}

function collectTags(asset: Pick<PostShowAsset, 'metadata' | 'source_snapshot'>): string[] {
  const tagCandidates = [
    tagsFrom(asset.metadata.tags),
    tagsFrom(asset.metadata.mood_tags),
    tagsFrom(asset.metadata.genre_tags),
    tagsFrom(asset.metadata.audience_tags),
    tagsFrom(asset.source_snapshot.mood_tags),
    tagsFrom(asset.source_snapshot.genre_tags),
    tagsFrom(asset.source_snapshot.audience_tags),
  ].flat();
  return Array.from(new Set(tagCandidates.map((tag) => tag.toLowerCase()))).slice(0, 6);
}

function tagsFrom(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
}

function tagsToHashtags(tags: string[]): string {
  return tags
    .slice(0, 4)
    .map((tag) => `#${tag.replace(/[^a-z0-9]+/gi, '')}`)
    .filter((tag) => tag.length > 1)
    .join(' ');
}

function stripUnsafeClaims(value: string): string {
  return value
    .replace(/\bguaranteed\b/gi, 'planned')
    .replace(/\bsponsored by\b/gi, 'featured on')
    .replace(/\bverified listeners?\b/gi, 'listeners')
    .replace(/\bofficial rights clearance\b/gi, 'creator-approved copy');
}

function copySafeJsonKeys(target: PostShowJsonObject, source: unknown): void {
  if (!source || typeof source !== 'object' || Array.isArray(source)) return;
  for (const [key, value] of Object.entries(source as Record<string, unknown>)) {
    if (!SAFE_SOURCE_KEYS.has(key)) continue;
    const jsonValue = sanitizeJsonValue(value);
    if (jsonValue !== undefined) target[key] = jsonValue;
  }
}

function hasModerationWarnings(source: unknown): boolean {
  if (!source || typeof source !== 'object' || Array.isArray(source)) return false;
  const record = source as Record<string, unknown>;
  return [record.warnings, record.safety_warnings, record.moderation_warnings].some(
    (warnings) => Array.isArray(warnings) && warnings.some((entry) => typeof entry === 'string' && entry.trim()),
  );
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
      if (!SAFE_SOURCE_KEYS.has(key)) continue;
      const jsonValue = sanitizeJsonValue(nested);
      if (jsonValue !== undefined) safe[key] = jsonValue;
    }
    return safe;
  }
  return undefined;
}
