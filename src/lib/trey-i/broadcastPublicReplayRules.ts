import { publicPostShowApplicationVisible } from './broadcastPostShowPublisher.ts';
import type {
  PostShowApplication,
  PublicPostShowAppliedAsset,
} from './broadcastPostShowTypes.ts';

export const PUBLIC_REPLAY_CLIP_COLUMNS = [
  'id',
  'channel_id',
  'title',
  'description',
  'clip_status',
  'visibility',
  'start_time_seconds',
  'end_time_seconds',
  'duration_seconds',
  'audio_url',
  'cover_art_url',
  'caption',
  'mood_tags',
  'genre_tags',
  'audience_tags',
  'published_at',
  'created_at',
  'updated_at',
].join(', ');

export type PublicReplayClip = {
  id: string;
  channel_id: string | null;
  title: string;
  description: string | null;
  clip_status: string;
  visibility: string;
  start_time_seconds: number | null;
  end_time_seconds: number | null;
  duration_seconds: number | null;
  audio_url: string | null;
  cover_art_url: string | null;
  caption: string | null;
  mood_tags: string[];
  genre_tags: string[];
  audience_tags: string[];
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  post_show_applications?: PublicPostShowAppliedAsset[];
};

type ReplayClipRow = Record<string, unknown>;

export function toPublicReplayClip(
  row: ReplayClipRow,
  applications: PostShowApplication[] = [],
): PublicReplayClip {
  const clip: PublicReplayClip = {
    id: stringOrEmpty(row.id),
    channel_id: stringOrNull(row.channel_id),
    title: stringOrEmpty(row.title),
    description: stringOrNull(row.description),
    clip_status: stringOrEmpty(row.clip_status),
    visibility: stringOrEmpty(row.visibility),
    start_time_seconds: numberOrNull(row.start_time_seconds),
    end_time_seconds: numberOrNull(row.end_time_seconds),
    duration_seconds: numberOrNull(row.duration_seconds),
    audio_url: stringOrNull(row.audio_url),
    cover_art_url: stringOrNull(row.cover_art_url),
    caption: stringOrNull(row.caption),
    mood_tags: stringArray(row.mood_tags),
    genre_tags: stringArray(row.genre_tags),
    audience_tags: stringArray(row.audience_tags),
    published_at: stringOrNull(row.published_at),
    created_at: stringOrNull(row.created_at),
    updated_at: stringOrNull(row.updated_at),
    post_show_applications: applications.map(toPublicAsset),
  };

  return applyPublicPostShowCopy(clip, applications);
}

export function collectVisiblePublicApplications(
  applications: PostShowApplication[],
): Map<string, PostShowApplication[]> {
  const applicationsByClip = new Map<string, PostShowApplication[]>();

  for (const application of applications) {
    if (!application.clip_id) continue;
    if (
      !publicPostShowApplicationVisible({
        applicationStatus: application.application_status,
        applicationType: application.application_type,
        targetVisibility: 'public',
        targetStatus: 'published',
      })
    ) {
      continue;
    }

    const existing = applicationsByClip.get(application.clip_id) ?? [];
    existing.push(application);
    applicationsByClip.set(application.clip_id, existing);
  }

  return applicationsByClip;
}

export function applyPublicPostShowCopy(
  clip: PublicReplayClip,
  applications: PostShowApplication[],
): PublicReplayClip {
  const next: PublicReplayClip = {
    ...clip,
    post_show_applications: applications.map(toPublicAsset),
  };
  const appliedFields = new Set<string>();

  for (const application of applications) {
    if (application.application_type === 'clip_title' && !appliedFields.has('title')) {
      next.title = application.applied_value;
      appliedFields.add('title');
    }
    if (
      (application.application_type === 'replay_blurb' ||
        application.application_type === 'seo_description') &&
      !appliedFields.has('description')
    ) {
      next.description = application.applied_value;
      appliedFields.add('description');
    }
    if (application.application_type === 'clip_caption' && !appliedFields.has('caption')) {
      next.caption = application.applied_value;
      appliedFields.add('caption');
    }
  }

  return next;
}

function toPublicAsset(application: PostShowApplication): PublicPostShowAppliedAsset {
  return {
    id: application.id,
    asset_id: application.asset_id,
    application_type: application.application_type,
    target_field: application.target_field ?? null,
    applied_value: application.applied_value,
    applied_metadata: application.applied_metadata,
    applied_at: application.applied_at ?? null,
    updated_at: application.updated_at,
  };
}

function stringOrEmpty(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string')
    : [];
}
