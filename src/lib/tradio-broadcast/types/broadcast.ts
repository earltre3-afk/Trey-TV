/**
 * TypeScript definitions for Tradio Broadcast Studio system.
 * Matches the public schema prefix `tradio_`.
 */

export type ShowStatus = "draft" | "published" | "archived";
export type EpisodeStatus = "draft" | "needs_review" | "scheduled" | "published" | "hidden" | "archived";
export type BlockType =
  | "intro"
  | "station_drop"
  | "voiceover"
  | "song"
  | "ad"
  | "interview"
  | "producer_spotlight"
  | "artist_spotlight"
  | "submission_block"
  | "silence"
  | "transition"
  | "outro";

export type ApprovalStatus = "pending" | "approved" | "rejected";
export type ClearanceStatus = "unclear" | "cleared" | "review_needed";
export type RightsStatus =
  | "tradio_native"
  | "creator_owned"
  | "approved_submission"
  | "licensed_catalog"
  | "unclear";

export type BroadcastSlotStatus = "scheduled" | "live" | "completed" | "cancelled";
export type AdSlotStatus = "pending" | "filled" | "empty";

export interface TradioShow {
  id: string;
  user_id: string;
  owner_user_id?: string | null;
  profile_id?: string | null;
  public_profile_uid?: string | null;
  trey_tv_uid?: string | null;
  title: string;
  description?: string | null;
  show_type: string;
  mood?: string | null;
  target_audience?: string | null;
  host_mode?: string | null;
  music_source_pref?: string | null;
  ad_preference?: string | null;
  visibility: "public" | "private" | "unlisted";
  schedule_intent?: string | null;
  status: ShowStatus;
  created_at: string;
  updated_at: string;
}

export interface TradioShowEpisode {
  id: string;
  show_id: string;
  user_id: string;
  owner_user_id?: string | null;
  title: string;
  description?: string | null;
  cover_art?: string | null;
  duration_seconds: number;
  status: EpisodeStatus;
  created_at: string;
  updated_at: string;
}

export interface TradioShowBlock {
  id: string;
  show_id?: string | null;
  episode_id: string;
  user_id: string;
  owner_user_id?: string | null;
  block_type: BlockType;
  title: string;
  description?: string | null;
  script_text?: string | null;
  asset_id?: string | null;
  media_url?: string | null;
  start_time_seconds: number;
  duration_seconds: number;
  sort_order: number;
  volume_level: number;
  fade_in_seconds: number;
  fade_out_seconds: number;
  approval_status: ApprovalStatus;
  clearance_status: ClearanceStatus;
  rights_status?: RightsStatus | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TradioShowScript {
  id: string;
  episode_id: string;
  block_id?: string | null;
  user_id: string;
  owner_user_id?: string | null;
  script_type?: string | null;
  prompt_input?: string | null;
  script_text: string;
  revision_number?: number | null;
  status?: "draft" | "final" | "deprecated";
  generated_by_ai: boolean;
  voice_id?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TradioVoiceRender {
  id: string;
  episode_id: string;
  block_id?: string | null;
  user_id: string;
  provider: string;
  voice_id: string;
  audio_url: string;
  duration_seconds: number;
  metadata: Record<string, any>;
  created_at: string;
}

export interface TradioStationDrop {
  id: string;
  user_id: string;
  title: string;
  audio_url: string;
  duration_seconds: number;
  clearance_status: ClearanceStatus;
  metadata: Record<string, any>;
  created_at: string;
}

export interface TradioBroadcastSlot {
  id: string;
  show_id: string;
  episode_id?: string | null;
  start_time: string;
  end_time: string;
  timezone: string;
  recurrence?: string | null;
  status: BroadcastSlotStatus;
  created_at: string;
}

export interface TradioAdSlot {
  id: string;
  episode_id: string;
  block_id?: string | null;
  ad_provider?: string | null;
  duration_seconds: number;
  status: AdSlotStatus;
  metadata: Record<string, any>;
  created_at: string;
}

export interface TradioMusicSubmission {
  id: string;
  episode_id: string;
  block_id?: string | null;
  user_id: string;
  title: string;
  artist: string;
  audio_url: string;
  rights_status: RightsStatus;
  clearance_status: ClearanceStatus;
  created_at: string;
}

export interface TradioShowAnalytics {
  id: string;
  show_id: string;
  episode_id?: string | null;
  listens: number;
  unique_listeners: number;
  completion_rate: number;
  skips: number;
  saves: number;
  replays: number;
  likes: number;
  comments: number;
  segment_level_retention: Record<string, any>;
  updated_at: string;
}
