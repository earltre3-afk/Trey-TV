export type ChannelStatus = "draft" | "active" | "paused" | "hidden" | "archived";

export type ChannelType =
  | "radio"
  | "artist_station"
  | "dj_station"
  | "producer_station"
  | "talk_station"
  | "discovery_station"
  | "event_station";

export type ChannelVisibility = "public" | "private" | "unlisted";

export type QueueStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "scheduled"
  | "playing"
  | "completed"
  | "skipped"
  | "failed"
  | "canceled"
  | "archived";

export type PlayoutEventType =
  | "channel_started"
  | "episode_started"
  | "episode_completed"
  | "episode_skipped"
  | "episode_failed"
  | "stream_connected"
  | "stream_disconnected"
  | "listener_joined"
  | "listener_left";

export type ReviewStatus = "pending" | "approved" | "rejected" | "needs_changes" | "canceled";

export interface TradioBroadcastChannel {
  id: string;
  owner_user_id: string;
  title: string;
  slug: string;
  description?: string | null;
  channel_type: ChannelType;
  visibility: ChannelVisibility;
  status: ChannelStatus;
  cover_art_url?: string | null;
  mood_tags: string[];
  genre_tags: string[];
  audience_tags: string[];
  creator_role?: string | null;
  stream_provider?: string | null;
  stream_url?: string | null;
  hls_url?: string | null;
  icecast_mount?: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TradioBroadcastQueueItem {
  id: string;
  channel_id: string;
  show_id: string;
  episode_id: string;
  assembly_id: string;
  owner_user_id: string;
  queue_status: QueueStatus;
  scheduled_start_at?: string | null;
  scheduled_end_at?: string | null;
  timezone: string;
  sort_order: number;
  repeat_policy?: string | null;
  is_live_slot: boolean;
  is_replay_eligible: boolean;
  rights_snapshot: Record<string, any>;
  readiness_snapshot: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TradioPlayoutEvent {
  id: string;
  channel_id: string;
  queue_id?: string | null;
  show_id?: string | null;
  episode_id?: string | null;
  assembly_id?: string | null;
  event_type: PlayoutEventType;
  event_status: string;
  started_at: string;
  ended_at?: string | null;
  listener_count_snapshot: number;
  playback_position_seconds?: number | null;
  error_message?: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface TradioBroadcastReview {
  id: string;
  channel_id?: string | null;
  queue_id?: string | null;
  show_id?: string | null;
  episode_id?: string | null;
  assembly_id: string;
  requester_user_id: string;
  reviewer_user_id?: string | null;
  review_status: ReviewStatus;
  review_notes?: string | null;
  rights_notes?: string | null;
  technical_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChannelNowPlaying {
  channel: TradioBroadcastChannel;
  queueItem?: TradioBroadcastQueueItem | null;
  showTitle?: string | null;
  episodeTitle?: string | null;
  creatorName?: string | null;
  durationSeconds?: number | null;
  timeRemainingSeconds?: number | null;
  streamUrl?: string | null;
  isFallbackFilePlayout: boolean;
}
