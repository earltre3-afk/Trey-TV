import type { PostShowAssetType, PostShowJsonObject, PostShowJsonValue } from './broadcastPostShowTypes';
import type { TradioAuthenticatedInput } from './tradioServerAuth';

export type DistributionDraftType =
  | 'tiktok_caption'
  | 'instagram_caption'
  | 'instagram_story'
  | 'youtube_description'
  | 'youtube_shorts_caption'
  | 'facebook_post'
  | 'x_post'
  | 'newsletter_blurb'
  | 'push_notification'
  | 'website_promo'
  | 'generic_social'
  | 'creator_note';

export type DistributionDraftStatus =
  | 'draft'
  | 'edited'
  | 'ready'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'archived'
  | 'used';

export type DistributionReminderStatus = 'not_scheduled' | 'scheduled' | 'reminded' | 'canceled' | 'expired';

export type DistributionPlatform =
  | 'tiktok'
  | 'instagram'
  | 'youtube'
  | 'facebook'
  | 'x'
  | 'newsletter'
  | 'push'
  | 'website'
  | 'generic';

export type DistributionAnalyticsEventType =
  | 'draft_created'
  | 'draft_edited'
  | 'draft_copied'
  | 'draft_marked_ready'
  | 'draft_submitted_review'
  | 'draft_approved'
  | 'draft_rejected'
  | 'draft_archived'
  | 'draft_marked_used'
  | 'reminder_scheduled'
  | 'reminder_canceled';

export type DistributionDraftMetadata = PostShowJsonObject & {
  no_external_send?: boolean;
  no_auto_publish?: boolean;
  reminder_only?: boolean;
  platform?: DistributionPlatform;
  draft_type?: DistributionDraftType;
  asset_type?: PostShowAssetType;
  copied_count?: number;
  marked_used?: boolean;
  events?: PostShowJsonObject[];
};

export interface DistributionDraft {
  id: string;
  owner_user_id: string;
  asset_id?: string | null;
  application_id?: string | null;
  clip_id?: string | null;
  recording_id?: string | null;
  episode_id?: string | null;
  queue_id?: string | null;
  channel_id?: string | null;
  draft_type: DistributionDraftType;
  draft_status: DistributionDraftStatus;
  platform: DistributionPlatform;
  title?: string | null;
  body: string;
  call_to_action?: string | null;
  scheduled_for?: string | null;
  reminder_status: DistributionReminderStatus;
  copied_count: number;
  last_copied_at?: string | null;
  review_notes?: string | null;
  moderation_snapshot: PostShowJsonObject;
  source_snapshot: PostShowJsonObject;
  metadata: DistributionDraftMetadata;
  created_at: string;
  updated_at: string;
}

export interface DistributionDraftFormatted {
  draft_type: DistributionDraftType;
  platform: DistributionPlatform;
  title?: string | null;
  body: string;
  call_to_action?: string | null;
  metadata: DistributionDraftMetadata;
}

export interface CreateDistributionDraftFromAssetInput extends TradioAuthenticatedInput {
  asset_id: string;
  draft_type: DistributionDraftType;
  platform: DistributionPlatform;
  clip_id?: string;
  recording_id?: string;
  episode_id?: string;
  queue_id?: string;
  channel_id?: string;
}

export interface CreateDistributionDraftFromApplicationInput extends TradioAuthenticatedInput {
  application_id: string;
  draft_type: DistributionDraftType;
  platform: DistributionPlatform;
}

export interface CreateDistributionDraftManualInput extends TradioAuthenticatedInput {
  draft_type: DistributionDraftType;
  platform: DistributionPlatform;
  title?: string;
  body: string;
  call_to_action?: string;
  clip_id?: string;
  recording_id?: string;
  episode_id?: string;
  queue_id?: string;
  channel_id?: string;
}

export interface UpdateDistributionDraftInput extends TradioAuthenticatedInput {
  draft_id: string;
  draft_type?: DistributionDraftType;
  platform?: DistributionPlatform;
  title?: string;
  body?: string;
  call_to_action?: string;
  scheduled_for?: string | null;
}

export interface ReviewDistributionDraftInput extends TradioAuthenticatedInput {
  draft_id: string;
  review_notes?: string;
}

export interface RejectDistributionDraftInput extends TradioAuthenticatedInput {
  draft_id: string;
  rejection_reason: string;
}

export interface ScheduleDistributionDraftReminderInput extends TradioAuthenticatedInput {
  draft_id: string;
  scheduled_for: string;
}

export interface ListDistributionDraftsInput extends TradioAuthenticatedInput {
  asset_id?: string;
  application_id?: string;
  clip_id?: string;
  recording_id?: string;
  episode_id?: string;
  channel_id?: string;
  draft_status?: DistributionDraftStatus;
  platform?: DistributionPlatform;
  review_queue?: boolean;
}

export interface DistributionDraftPatch {
  draft_type?: DistributionDraftType;
  platform?: DistributionPlatform;
  draft_status?: DistributionDraftStatus;
  title?: string | null;
  body?: string;
  call_to_action?: string | null;
  scheduled_for?: string | null;
  reminder_status?: DistributionReminderStatus;
  copied_count?: number;
  last_copied_at?: string | null;
  review_notes?: string | null;
  metadata?: DistributionDraftMetadata;
  updated_at?: string;
}

export type SafeDistributionSignalValue = PostShowJsonValue;
