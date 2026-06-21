export type NotificationPreference = "none" | "all" | "live_only" | "replays_only";

export type ReactionType =
  | "fire"
  | "love"
  | "laugh"
  | "rewind"
  | "save_this"
  | "hard"
  | "smooth"
  | "surprise"
  | "salute";

export type PlaybackMode = "live" | "replay" | "preview";

export type RetentionEventType =
  | "start"
  | "heartbeat"
  | "pause"
  | "resume"
  | "seek"
  | "skip"
  | "complete"
  | "exit";

export interface TradioChannelFollow {
  id: string;
  channel_id: string;
  user_id?: string | null;
  notification_preference: NotificationPreference;
  created_at: string;
  updated_at: string;
}

export interface TradioBroadcastReaction {
  id: string;
  channel_id: string;
  queue_id?: string | null;
  show_id?: string | null;
  episode_id?: string | null;
  assembly_id?: string | null;
  user_id: string;
  reaction_type: ReactionType;
  playback_position_seconds?: number | null;
  is_live: boolean;
  metadata: Record<string, any>;
  created_at: string;
}

export interface TradioListeningSession {
  id: string;
  channel_id: string;
  queue_id?: string | null;
  show_id?: string | null;
  episode_id?: string | null;
  assembly_id?: string | null;
  user_id?: string | null;
  anonymous_session_id?: string | null;
  playback_mode: PlaybackMode;
  started_at: string;
  ended_at?: string | null;
  listen_duration_seconds: number;
  completion_rate?: number | null;
  last_playback_position_seconds?: number | null;
  device_type?: string | null;
  app_surface?: string | null;
  referrer_surface?: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TradioRetentionEvent {
  id: string;
  listening_session_id: string;
  channel_id: string;
  queue_id?: string | null;
  episode_id?: string | null;
  playback_position_seconds: number;
  percent_complete?: number | null;
  event_type: RetentionEventType;
  metadata: Record<string, any>;
  created_at: string;
}

export interface TradioChannelAnalyticsDaily {
  id: string;
  channel_id: string;
  owner_user_id: string;
  analytics_date: string;
  total_listens: number;
  unique_listeners: number;
  total_listen_seconds: number;
  avg_listen_seconds: number;
  completion_rate?: number | null;
  replay_count: number;
  live_listen_count: number;
  follow_count: number;
  reaction_count: number;
  save_count: number;
  peak_concurrent_listeners: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ChannelPulseSummary {
  channelId: string;
  activeListeners: number;
  recentReactionsCount: number;
  topReactionType?: ReactionType | null;
  followersCount: number;
}
