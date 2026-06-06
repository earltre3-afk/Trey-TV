import type {
  DistributionDraftStatus,
  DistributionDraftType,
  DistributionPlatform,
} from './broadcastDistributionTypes';
import type {
  PostShowAssetStatus,
  PostShowAssetType,
  PostShowJsonObject,
  PostShowPlatform,
} from './broadcastPostShowTypes';

export type CampaignMetricSource =
  | 'tradio'
  | 'creator_manual'
  | 'internal_player'
  | 'public_replay'
  | 'distribution_desk'
  | 'prescribe_me';

export type CampaignMetricType =
  | 'draft_copied'
  | 'draft_marked_used'
  | 'clip_play'
  | 'replay_play'
  | 'completion_rate'
  | 'reaction_count'
  | 'chat_spike'
  | 'poll_engagement'
  | 'follower_gain'
  | 'manual_views'
  | 'manual_likes'
  | 'manual_comments'
  | 'manual_shares'
  | 'manual_saves'
  | 'manual_clicks'
  | 'prescribe_me_signal'
  | 'tag_performance_score';

export interface CampaignMetric {
  id: string;
  owner_user_id: string;
  channel_id?: string | null;
  clip_id?: string | null;
  recording_id?: string | null;
  asset_id?: string | null;
  application_id?: string | null;
  distribution_draft_id?: string | null;
  metric_source: CampaignMetricSource;
  platform: string;
  metric_type: CampaignMetricType;
  metric_value: number;
  metric_unit?: string | null;
  entered_manually: boolean;
  source_snapshot: PostShowJsonObject;
  metadata: PostShowJsonObject;
  measured_at: string;
  created_at: string;
  updated_at: string;
}

export interface ManualCampaignMetricInput {
  accessToken?: string;
  metric_id?: string;
  channel_id?: string;
  clip_id?: string;
  recording_id?: string;
  asset_id?: string;
  application_id?: string;
  distribution_draft_id?: string;
  platform: string;
  metric_type: CampaignMetricType;
  metric_value: number;
  metric_unit?: string;
  measured_at?: string;
  note?: string;
}

export type NormalizedManualCampaignMetric = Omit<
  CampaignMetric,
  'id' | 'owner_user_id' | 'created_at' | 'updated_at'
>;

export interface CampaignDraftSnapshot {
  id: string;
  owner_user_id: string;
  channel_id?: string | null;
  clip_id?: string | null;
  recording_id?: string | null;
  asset_id?: string | null;
  application_id?: string | null;
  draft_type: DistributionDraftType;
  draft_status: DistributionDraftStatus;
  platform: DistributionPlatform;
  title?: string | null;
  copied_count: number;
  created_at: string;
  updated_at: string;
  metadata: PostShowJsonObject;
  source_snapshot: PostShowJsonObject;
}

export interface CampaignClipSnapshot {
  id: string;
  owner_user_id: string;
  channel_id?: string | null;
  recording_id?: string | null;
  title: string;
  clip_status: string;
  visibility: string;
  duration_seconds?: number | null;
  mood_tags: string[];
  genre_tags: string[];
  audience_tags: string[];
  published_at?: string | null;
  created_at: string;
}

export interface CampaignAssetSnapshot {
  id: string;
  owner_user_id: string;
  channel_id?: string | null;
  clip_id?: string | null;
  recording_id?: string | null;
  asset_type: PostShowAssetType;
  asset_status: PostShowAssetStatus;
  platform?: PostShowPlatform | null;
  tone?: string | null;
  created_at: string;
  updated_at: string;
  metadata: PostShowJsonObject;
  source_snapshot: PostShowJsonObject;
}

export interface CampaignChannelOption {
  id: string;
  owner_user_id: string;
  title: string;
  slug?: string | null;
  visibility?: string | null;
  status?: string | null;
}

export interface DerivedCampaignMetric {
  channel_id?: string | null;
  clip_id?: string | null;
  recording_id?: string | null;
  asset_id?: string | null;
  application_id?: string | null;
  distribution_draft_id?: string | null;
  metric_source: CampaignMetricSource;
  platform: string;
  metric_type: CampaignMetricType;
  metric_value: number;
  metric_unit?: string | null;
  entered_manually: boolean;
  source_snapshot: PostShowJsonObject;
  metadata: PostShowJsonObject;
  measured_at: string;
}

export interface CampaignOverview {
  total_metrics: number;
  manual_metrics: number;
  draft_copies: number;
  drafts_used: number;
  published_clips: number;
  clip_plays: number;
  replay_plays: number;
  eligible_assets: number;
}

export interface CampaignClipPerformance {
  id: string;
  title: string;
  plays: number;
  completion_rate: number | null;
  reactions: number;
  manual_engagement: number;
  score: number;
  duration_seconds: number | null;
  mood_tags: string[];
  genre_tags: string[];
  audience_tags: string[];
}

export interface CampaignDraftPerformance {
  id: string;
  title: string;
  platform: string;
  draft_type: string;
  copied_count: number;
  marked_used: boolean;
  manual_engagement: number;
  score: number;
}

export interface CampaignAssetTypePerformance {
  asset_type: PostShowAssetType;
  count: number;
  linked_drafts: number;
  manual_engagement: number;
  score: number;
}

export interface CampaignPlatformPerformance {
  platform: string;
  drafts: number;
  copies: number;
  used: number;
  manual_metric_total: number;
  score: number;
}

export type CampaignTagCategory = 'mood' | 'genre' | 'audience';

export interface CampaignTagPerformance {
  tag: string;
  category: CampaignTagCategory;
  score: number;
  evidence_count: number;
}

export interface CampaignRecommendation {
  id: string;
  kind: 'next_action' | 'reuse' | 'warning' | 'follow_up';
  title: string;
  action: string;
  basis: string;
  evidence_count: number;
}

export interface CampaignUnderperformer {
  id: string;
  entity_type: 'asset' | 'draft' | 'clip';
  label: string;
  basis: string;
}

export interface CampaignReusablePerformer {
  id: string;
  entity_type: 'draft' | 'clip';
  label: string;
  score: number;
  basis: string;
}

export interface CampaignPrescribeSignals {
  top_platform?: string;
  top_draft_type?: string;
  preferred_clip_duration_seconds?: number;
  replay_eligible: boolean;
  mood_tags: string[];
  genre_tags: string[];
  audience_tags: string[];
  emotional_tones: string[];
  approved_content_categories: PostShowAssetType[];
  average_completion_rate?: number;
  reaction_intensity: 'none' | 'low' | 'medium' | 'high';
  draft_copy_count: number;
  draft_marked_used_count: number;
  follow_up_topic_tags: string[];
  evidence_count: number;
}

export interface CampaignInsightSummary {
  overview: CampaignOverview;
  top_clips: CampaignClipPerformance[];
  top_drafts: CampaignDraftPerformance[];
  top_asset_types: CampaignAssetTypePerformance[];
  platforms: CampaignPlatformPerformance[];
  tag_insights: CampaignTagPerformance[];
  emotional_tones: string[];
  approved_content_categories: PostShowAssetType[];
  underperforming_assets: CampaignUnderperformer[];
  reusable_high_performers: CampaignReusablePerformer[];
  recommendations: CampaignRecommendation[];
  prescribe_me_signals: CampaignPrescribeSignals;
}

export interface CampaignDashboardData extends CampaignInsightSummary {
  metrics: CampaignMetric[];
  channels: CampaignChannelOption[];
  selected_channel_id?: string | null;
}

export interface AdminCampaignSummary {
  owner_user_id: string;
  channel_id?: string | null;
  channel_title: string;
  total_metrics: number;
  manual_metrics: number;
  draft_copies: number;
  drafts_used: number;
  published_clips: number;
  clip_plays: number;
  top_platform?: string;
  top_tag?: string;
}
