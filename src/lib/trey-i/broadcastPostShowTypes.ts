/**
 * Tradio Post-Show Producer types (Pass 10)
 */

export type PostShowJsonValue =
  | string
  | number
  | boolean
  | null
  | PostShowJsonValue[]
  | { [key: string]: PostShowJsonValue };

export type PostShowJsonObject = { [key: string]: PostShowJsonValue };

// Asset types
export type PostShowAssetType =
  | 'show_summary'
  | 'clip_title'
  | 'clip_caption'
  | 'social_post'
  | 'newsletter_blurb'
  | 'episode_description'
  | 'replay_blurb'
  | 'thumbnail_prompt'
  | 'cover_prompt'
  | 'follow_up_topic'
  | 'tag_suggestion'
  | 'highlight_explanation'
  | 'seo_description'
  | 'push_notification_copy';

// Asset statuses
export type PostShowAssetStatus =
  | 'draft'
  | 'generated'
  | 'edited'
  | 'pending_review'
  | 'approved'
  | 'published'
  | 'rejected'
  | 'archived';

// Asset visibility
export type PostShowAssetVisibility = 'private' | 'unlisted' | 'public';

// Platforms
export type PostShowPlatform =
  | 'tradio'
  | 'trey_tv'
  | 'tiktok'
  | 'instagram'
  | 'youtube'
  | 'facebook'
  | 'x'
  | 'newsletter'
  | 'push'
  | 'website'
  | 'generic';

// Run statuses
export type PostShowRunStatus = 'queued' | 'running' | 'completed' | 'failed' | 'canceled';

// Run types
export type PostShowRunType =
  | 'post_show_package'
  | 'clip_package'
  | 'replay_package'
  | 'social_package'
  | 'newsletter_package'
  | 'metadata_package';

// Editor types
export type PostShowEditorType = 'ai' | 'human' | 'admin';

export type PostShowApplicationType =
  | 'clip_title'
  | 'clip_caption'
  | 'replay_blurb'
  | 'episode_description'
  | 'social_draft'
  | 'newsletter_draft'
  | 'push_copy_draft'
  | 'seo_description'
  | 'thumbnail_prompt'
  | 'cover_prompt'
  | 'prescribe_me_metadata';

export type PostShowApplicationStatus =
  | 'draft'
  | 'applied'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'reverted'
  | 'archived';

// Database row types
export interface PostShowAsset {
  id: string;
  owner_user_id: string;
  channel_id?: string;
  show_id?: string;
  episode_id?: string;
  queue_id?: string;
  recording_id?: string;
  clip_id?: string;
  asset_type: PostShowAssetType;
  asset_status: PostShowAssetStatus;
  visibility: PostShowAssetVisibility;
  title?: string;
  body: string;
  platform?: PostShowPlatform;
  tone?: string;
  language: string;
  ai_provider?: string;
  ai_model?: string;
  prompt_input: PostShowJsonObject;
  source_snapshot: PostShowJsonObject;
  moderation_snapshot: PostShowJsonObject;
  metadata: PostShowJsonObject;
  approved_at?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PostShowRun {
  id: string;
  owner_user_id: string;
  channel_id?: string;
  show_id?: string;
  episode_id?: string;
  queue_id?: string;
  recording_id?: string;
  clip_id?: string;
  run_status: PostShowRunStatus;
  run_type: PostShowRunType;
  ai_provider?: string;
  ai_model?: string;
  requested_asset_types: string[];
  source_snapshot: PostShowJsonObject;
  output_summary: PostShowJsonObject;
  error_message?: string;
  created_at: string;
  completed_at?: string;
  updated_at: string;
}

export interface PostShowAssetRevision {
  id: string;
  asset_id: string;
  owner_user_id: string;
  revision_number: number;
  title?: string;
  body: string;
  edit_reason?: string;
  editor_type: PostShowEditorType;
  ai_provider?: string;
  ai_model?: string;
  prompt_input: PostShowJsonObject;
  metadata: PostShowJsonObject;
  created_at: string;
}

export interface PostShowApplication {
  id: string;
  owner_user_id: string;
  asset_id: string;
  clip_id?: string | null;
  recording_id?: string | null;
  episode_id?: string | null;
  queue_id?: string | null;
  channel_id?: string | null;
  application_type: PostShowApplicationType;
  application_status: PostShowApplicationStatus;
  target_field?: string | null;
  previous_value?: string | null;
  applied_value: string;
  applied_metadata: PostShowJsonObject;
  created_at: string;
  applied_at?: string | null;
  updated_at: string;
}

// Source snapshot structure
export interface PostShowSourceSnapshot {
  channel_title?: string;
  show_title?: string;
  episode_title?: string;
  clip_title?: string;
  recording_duration_seconds?: number;
  clip_duration_seconds?: number;
  segment_type?: string;
  reaction_count?: number;
  top_reaction_types?: string[];
  chat_count?: number;
  poll_questions?: string[];
  poll_results?: Array<{ question: string; winner: string; percentage: number }>;
  call_in_moments?: Array<{ name: string; duration_seconds: number }>;
  sfx_events?: Array<{ name: string; count: number }>;
  completion_rate?: number;
  replay_count?: number;
  live_mode?: boolean;
  mood_tags?: string[];
  genre_tags?: string[];
  audience_tags?: string[];
  transcript_available?: boolean;
}

// AI-generated asset structure
export interface PostShowGeneratedAsset {
  assetType: PostShowAssetType;
  platform: PostShowPlatform;
  title: string;
  body: string;
  tone?: string;
  tags?: string[];
  metadata?: PostShowJsonObject;
}

// AI package response
export interface PostShowAIPackageResponse {
  assets: PostShowGeneratedAsset[];
  followUpTopics?: Array<{
    title: string;
    reason: string;
    tags?: string[];
  }>;
  warnings: string[];
}

// Generation request
export interface GeneratePostShowPackageInput {
  source_type: 'recording' | 'clip' | 'episode' | 'queue_item';
  source_id: string;
  asset_types: PostShowAssetType[];
  include_follow_ups?: boolean;
  tone?: string;
}

// Manual asset creation request
export interface CreatePostShowAssetInput {
  recording_id: string;
  asset_type: PostShowAssetType;
  title?: string;
  body: string;
  platform?: PostShowPlatform;
  tone?: string;
}

// Update asset request
export interface UpdatePostShowAssetInput {
  asset_id: string;
  title?: string;
  body?: string;
  asset_status?: PostShowAssetStatus;
  visibility?: PostShowAssetVisibility;
  edit_reason?: string;
}

// Approve asset request
export interface ApprovePostShowAssetInput {
  asset_id: string;
  moderation_notes?: string;
}

// Reject asset request
export interface RejectPostShowAssetInput {
  asset_id: string;
  rejection_reason: string;
}

// Archive asset request
export interface ArchivePostShowAssetInput {
  asset_id: string;
  moderation_notes?: string;
}

// Publish asset request
export interface PublishPostShowAssetInput {
  asset_id: string;
  visibility: PostShowAssetVisibility;
}

export interface PostShowPublisherTarget {
  id: string;
  target_type: 'clip' | 'episode';
  label: string;
  visibility?: string | null;
  status?: string | null;
  current_title?: string | null;
  current_description?: string | null;
  current_caption?: string | null;
  recording_id?: string | null;
  episode_id?: string | null;
  channel_id?: string | null;
  queue_id?: string | null;
}

export interface ApplyPostShowAssetToClipInput {
  asset_id: string;
  clip_id: string;
  application_type?: PostShowApplicationType;
}

export interface ApplyPostShowAssetToEpisodeInput {
  asset_id: string;
  episode_id: string;
  application_type?: PostShowApplicationType;
}

export interface CreatePostShowDraftFromAssetInput {
  asset_id: string;
  recording_id?: string;
  clip_id?: string;
  episode_id?: string;
  queue_id?: string;
  channel_id?: string;
}

export interface CreatePrescribeMeMetadataFromAssetInput extends CreatePostShowDraftFromAssetInput {}

export interface ListPostShowApplicationsInput {
  recording_id?: string;
  clip_id?: string;
  episode_id?: string;
  application_status?: PostShowApplicationStatus;
  review_queue?: boolean;
}

export interface ReviewPostShowApplicationInput {
  application_id: string;
  review_notes?: string;
}

export interface RejectPostShowApplicationInput {
  application_id: string;
  rejection_reason: string;
}

export interface PublicPostShowAppliedAsset {
  id: string;
  asset_id: string;
  application_type: PostShowApplicationType;
  target_field?: string | null;
  applied_value: string;
  applied_metadata: PostShowJsonObject;
  applied_at?: string | null;
  updated_at: string;
}
