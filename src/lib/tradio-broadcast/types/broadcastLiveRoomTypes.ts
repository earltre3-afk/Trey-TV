export type LiveRoomStatus = "open" | "paused" | "locked" | "ended" | "archived";
export type LiveRoomVisibility = "public" | "private" | "unlisted";

export type LiveChatSenderRole = "listener" | "creator" | "host" | "admin" | "system";
export type LiveChatMessageType =
  | "chat"
  | "shoutout"
  | "host_note"
  | "system"
  | "moderation_notice";
export type LiveChatModerationStatus =
  | "visible"
  | "hidden"
  | "flagged"
  | "removed"
  | "pending_review";

export type LivePollStatus = "draft" | "active" | "closed" | "hidden" | "archived";
export type LivePollShowResultsMode = "always" | "after_vote" | "after_close" | "never";

export type LiveModerationReportStatus = "pending" | "reviewed" | "dismissed" | "action_taken";

export interface TradioLiveRoom {
  id: string;
  channel_id: string;
  queue_id: string | null;
  show_id: string | null;
  episode_id: string | null;
  owner_user_id: string;
  room_status: LiveRoomStatus;
  visibility: LiveRoomVisibility;
  title: string | null;
  pinned_message_id: string | null;
  slow_mode_seconds: number;
  chat_enabled: boolean;
  polls_enabled: boolean;
  reactions_enabled: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TradioLiveChatMessage {
  id: string;
  room_id: string;
  channel_id: string;
  queue_id: string | null;
  user_id: string | null;
  anonymous_session_id: string | null;
  sender_role: LiveChatSenderRole;
  message_text: string;
  message_type: LiveChatMessageType;
  playback_position_seconds: number | null;
  is_pinned: boolean;
  is_highlighted: boolean;
  moderation_status: LiveChatModerationStatus;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Optional profiles join fields
  profiles?: {
    display_name?: string | null;
    avatar_url?: string | null;
  } | null;
}

export interface TradioLivePoll {
  id: string;
  room_id: string;
  channel_id: string;
  queue_id: string | null;
  creator_user_id: string;
  question: string;
  poll_status: LivePollStatus;
  allow_multiple: boolean;
  show_results_mode: LivePollShowResultsMode;
  opens_at: string | null;
  closes_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  options?: TradioLivePollOption[];
}

export interface TradioLivePollOption {
  id: string;
  poll_id: string;
  option_text: string;
  sort_order: number;
  metadata: Record<string, any>;
  created_at: string;
  // Dynamic vote counts from results calculations
  vote_count?: number;
  voted_by_me?: boolean;
}

export interface TradioLivePollVote {
  id: string;
  poll_id: string;
  option_id: string;
  user_id: string | null;
  anonymous_session_id: string | null;
  room_id: string;
  channel_id: string;
  queue_id: string | null;
  playback_position_seconds: number | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface TradioLiveModerationReport {
  id: string;
  room_id: string;
  message_id: string | null;
  reported_user_id: string | null;
  reporter_user_id: string | null;
  anonymous_session_id: string | null;
  reason: string;
  report_status: LiveModerationReportStatus;
  moderator_user_id: string | null;
  moderation_notes: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Optional join helper for detailed admin views
  message?: TradioLiveChatMessage | null;
}

export interface LiveRoomPulseSummary {
  channel_id: string;
  room_id: string;
  active_listeners: number;
  chat_message_count: number;
  unique_chatters: number;
  poll_vote_count: number;
  active_poll_count: number;
  shoutout_count: number;
  report_count: number;
  engagement_rate: number;
  top_poll_option?: {
    poll_id: string;
    question: string;
    option_id: string;
    option_text: string;
    votes: number;
  } | null;
  top_reaction_moment?: {
    second: number;
    count: number;
  } | null;
}

export interface LiveRoomPrescribeMeMetadata {
  channel_id: string;
  queue_id: string | null;
  mood_tags: string[];
  genre_tags: string[];
  audience_tags: string[];
  reaction_types: string[];
  poll_topics: string[];
  engagement_intensity: "low" | "medium" | "high" | "viral";
  replay_eligibility: boolean;
  listener_surface: string;
  creator_role: string | null;
}
