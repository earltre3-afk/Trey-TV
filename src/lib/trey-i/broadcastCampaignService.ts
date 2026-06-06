import type {
  CampaignAssetSnapshot,
  CampaignClipSnapshot,
  CampaignDraftSnapshot,
  CampaignMetric,
} from './broadcastCampaignTypes';
import type { PostShowJsonObject, PostShowJsonValue } from './broadcastPostShowTypes';

export const CAMPAIGN_METRIC_COLUMNS = [
  'id',
  'owner_user_id',
  'channel_id',
  'clip_id',
  'recording_id',
  'asset_id',
  'application_id',
  'distribution_draft_id',
  'metric_source',
  'platform',
  'metric_type',
  'metric_value',
  'metric_unit',
  'entered_manually',
  'source_snapshot',
  'metadata',
  'measured_at',
  'created_at',
  'updated_at',
].join(', ');

export const CAMPAIGN_DRAFT_COLUMNS = [
  'id',
  'owner_user_id',
  'channel_id',
  'clip_id',
  'recording_id',
  'asset_id',
  'application_id',
  'draft_type',
  'draft_status',
  'platform',
  'title',
  'copied_count',
  'created_at',
  'updated_at',
  'metadata',
  'source_snapshot',
].join(', ');

export const CAMPAIGN_ASSET_COLUMNS = [
  'id',
  'owner_user_id',
  'channel_id',
  'clip_id',
  'recording_id',
  'asset_type',
  'asset_status',
  'platform',
  'tone',
  'created_at',
  'updated_at',
  'metadata',
  'source_snapshot',
].join(', ');

export const CAMPAIGN_CLIP_COLUMNS = [
  'id',
  'owner_user_id',
  'channel_id',
  'recording_id',
  'title',
  'clip_status',
  'visibility',
  'duration_seconds',
  'mood_tags',
  'genre_tags',
  'audience_tags',
  'published_at',
  'created_at',
].join(', ');

export const CAMPAIGN_CHANNEL_COLUMNS = [
  'id',
  'owner_user_id',
  'title',
  'slug',
  'visibility',
  'status',
].join(', ');

const SAFE_SIGNAL_KEYS = new Set([
  'marked_used',
  'mood_tags',
  'genre_tags',
  'audience_tags',
  'emotional_tone',
  'follow_up_topic_tags',
  'asset_type',
  'draft_type',
  'platform',
  'clip_duration_seconds',
  'replay_eligible',
]);

const SAFE_METRIC_METADATA_KEYS = new Set([
  'note',
  'draft_type',
  'asset_type',
  'category',
  'event_type',
]);

export type CampaignAuthClient = {
  auth: {
    getUser: (token: string) => Promise<{
      data?: { user?: { id: string } | null } | null;
      error?: { message?: string } | null;
    }>;
  };
  rpc: (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<{ data?: unknown; error?: { message?: string } | null }>;
};

export async function verifyCampaignUser(
  accessToken: string,
  client: CampaignAuthClient,
  requireAdmin = false,
): Promise<{ userId: string; isAdmin: boolean }> {
  const token = accessToken.trim();
  if (!token) throw new Error('Sign in required');

  const { data, error } = await client.auth.getUser(token);
  const userId = data?.user?.id;
  if (error || !userId) throw new Error('Sign in required');

  if (!requireAdmin) return { userId, isAdmin: false };

  const { data: isAdmin, error: adminError } = await client.rpc('is_admin', {
    _user_id: userId,
  });
  if (adminError || isAdmin !== true) throw new Error('Admin access required');

  return { userId, isAdmin: true };
}

export function sanitizeCampaignDraftRow(row: Record<string, unknown>): CampaignDraftSnapshot {
  return {
    id: stringValue(row.id),
    owner_user_id: stringValue(row.owner_user_id),
    channel_id: nullableString(row.channel_id),
    clip_id: nullableString(row.clip_id),
    recording_id: nullableString(row.recording_id),
    asset_id: nullableString(row.asset_id),
    application_id: nullableString(row.application_id),
    draft_type: stringValue(row.draft_type) as CampaignDraftSnapshot['draft_type'],
    draft_status: stringValue(row.draft_status) as CampaignDraftSnapshot['draft_status'],
    platform: stringValue(row.platform) as CampaignDraftSnapshot['platform'],
    title: nullableString(row.title),
    copied_count: numberValue(row.copied_count),
    created_at: stringValue(row.created_at),
    updated_at: stringValue(row.updated_at),
    metadata: sanitizeJsonObject(row.metadata, SAFE_SIGNAL_KEYS),
    source_snapshot: sanitizeJsonObject(row.source_snapshot, SAFE_SIGNAL_KEYS),
  };
}

export function sanitizeCampaignAssetRow(row: Record<string, unknown>): CampaignAssetSnapshot {
  return {
    id: stringValue(row.id),
    owner_user_id: stringValue(row.owner_user_id),
    channel_id: nullableString(row.channel_id),
    clip_id: nullableString(row.clip_id),
    recording_id: nullableString(row.recording_id),
    asset_type: stringValue(row.asset_type) as CampaignAssetSnapshot['asset_type'],
    asset_status: stringValue(row.asset_status) as CampaignAssetSnapshot['asset_status'],
    platform: nullableString(row.platform) as CampaignAssetSnapshot['platform'],
    tone: nullableString(row.tone),
    created_at: stringValue(row.created_at),
    updated_at: stringValue(row.updated_at),
    metadata: sanitizeJsonObject(row.metadata, SAFE_SIGNAL_KEYS),
    source_snapshot: sanitizeJsonObject(row.source_snapshot, SAFE_SIGNAL_KEYS),
  };
}

export function sanitizeCampaignClipRow(row: Record<string, unknown>): CampaignClipSnapshot {
  return {
    id: stringValue(row.id),
    owner_user_id: stringValue(row.owner_user_id),
    channel_id: nullableString(row.channel_id),
    recording_id: nullableString(row.recording_id),
    title: stringValue(row.title),
    clip_status: stringValue(row.clip_status),
    visibility: stringValue(row.visibility),
    duration_seconds:
      row.duration_seconds === null || row.duration_seconds === undefined
        ? null
        : numberValue(row.duration_seconds),
    mood_tags: stringArray(row.mood_tags),
    genre_tags: stringArray(row.genre_tags),
    audience_tags: stringArray(row.audience_tags),
    published_at: nullableString(row.published_at),
    created_at: stringValue(row.created_at),
  };
}

export function sanitizeCampaignMetricRow(row: Record<string, unknown>): CampaignMetric {
  return {
    id: stringValue(row.id),
    owner_user_id: stringValue(row.owner_user_id),
    channel_id: nullableString(row.channel_id),
    clip_id: nullableString(row.clip_id),
    recording_id: nullableString(row.recording_id),
    asset_id: nullableString(row.asset_id),
    application_id: nullableString(row.application_id),
    distribution_draft_id: nullableString(row.distribution_draft_id),
    metric_source: stringValue(row.metric_source) as CampaignMetric['metric_source'],
    platform: stringValue(row.platform),
    metric_type: stringValue(row.metric_type) as CampaignMetric['metric_type'],
    metric_value: numberValue(row.metric_value),
    metric_unit: nullableString(row.metric_unit),
    entered_manually: row.entered_manually === true,
    source_snapshot: {},
    metadata: sanitizeJsonObject(row.metadata, SAFE_METRIC_METADATA_KEYS),
    measured_at: stringValue(row.measured_at),
    created_at: stringValue(row.created_at),
    updated_at: stringValue(row.updated_at),
  };
}

function sanitizeJsonObject(value: unknown, allowedKeys: Set<string>): PostShowJsonObject {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const safe: PostShowJsonObject = {};

  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (!allowedKeys.has(key)) continue;
    const sanitized = sanitizeJsonValue(entry);
    if (sanitized !== undefined) safe[key] = sanitized;
  }

  return safe;
}

function sanitizeJsonValue(value: unknown): PostShowJsonValue | undefined {
  if (value === null || typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.trim().slice(0, 240);
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (Array.isArray(value)) {
    return value
      .map((entry) => sanitizeJsonValue(entry))
      .filter((entry): entry is PostShowJsonValue => entry !== undefined)
      .slice(0, 20);
  }
  return undefined;
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function nullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function numberValue(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value
        .filter((entry): entry is string => typeof entry === 'string')
        .map((entry) => entry.trim())
        .filter(Boolean)
        .slice(0, 20)
    : [];
}
