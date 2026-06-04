export type LiveMicSessionStatus = "pending" | "live" | "paused" | "ended" | "failed" | "archived";
export type LiveMicMode = "host_only" | "host_plus_cohost" | "call_in_queue" | "open_stage_locked";
export type BackgroundAudioMode = "duck_on_host" | "pause_on_host" | "keep_full_volume" | "host_between_blocks";

export type LiveMicParticipantRole = "host" | "cohost" | "caller" | "listener" | "moderator" | "admin";
export type LiveMicParticipantStatus =
  | "waiting"
  | "invited"
  | "approved"
  | "live"
  | "muted"
  | "removed"
  | "declined"
  | "left";

export type LiveCallRequestStatus = "pending" | "approved" | "rejected" | "canceled" | "expired" | "completed";

export type SfxDropType =
  | "drop"
  | "applause"
  | "airhorn"
  | "riser"
  | "impact"
  | "tag"
  | "transition"
  | "custom";

export type SfxDropVisibility = "public" | "private" | "shared";
export type SfxEventStatus = "triggered" | "played" | "failed" | "canceled";

export type LiveMicEventType =
  | "session_started"
  | "session_paused"
  | "session_resumed"
  | "session_ended"
  | "host_joined"
  | "cohost_invited"
  | "cohost_joined"
  | "caller_requested"
  | "caller_approved"
  | "caller_rejected"
  | "caller_joined"
  | "participant_muted"
  | "participant_unmuted"
  | "participant_removed"
  | "sfx_triggered"
  | "provider_error";

export interface TradioLiveMicSession {
  id: string;
  room_id: string;
  channel_id: string;
  queue_id: string | null;
  show_id: string | null;
  episode_id: string | null;
  host_user_id: string;
  session_status: LiveMicSessionStatus;
  provider: string;
  provider_room_name: string | null;
  provider_session_id: string | null;
  mic_mode: LiveMicMode;
  background_audio_mode: BackgroundAudioMode;
  recording_enabled: boolean;
  max_speakers: number;
  max_callers_waiting: number;
  metadata: Record<string, any>;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TradioLiveMicParticipant {
  id: string;
  session_id: string;
  room_id: string;
  channel_id: string;
  user_id: string | null;
  anonymous_session_id: string | null;
  participant_role: LiveMicParticipantRole;
  participant_status: LiveMicParticipantStatus;
  provider_participant_id: string | null;
  display_name: string | null;
  mic_enabled: boolean;
  is_muted_by_host: boolean;
  is_muted_self: boolean;
  joined_at: string;
  left_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TradioLiveCallRequest {
  id: string;
  session_id: string;
  room_id: string;
  channel_id: string;
  queue_id: string | null;
  requester_user_id: string | null;
  anonymous_session_id: string | null;
  request_status: LiveCallRequestStatus;
  request_note: string | null;
  host_decision_user_id: string | null;
  decision_reason: string | null;
  playback_position_seconds: number | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TradioLiveSfxDrop {
  id: string;
  owner_user_id: string;
  channel_id: string | null;
  room_id: string | null;
  title: string;
  audio_url: string | null;
  storage_path: string | null;
  sfx_type: SfxDropType;
  visibility: SfxDropVisibility;
  duration_seconds: number | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TradioLiveSfxEvent {
  id: string;
  session_id: string;
  room_id: string;
  channel_id: string;
  sfx_drop_id: string | null;
  triggered_by_user_id: string | null;
  playback_position_seconds: number | null;
  event_status: SfxEventStatus;
  metadata: Record<string, any>;
  created_at: string;
}

export interface TradioLiveMicEvent {
  id: string;
  session_id: string;
  room_id: string;
  channel_id: string;
  participant_id: string | null;
  user_id: string | null;
  event_type: LiveMicEventType;
  event_status: "recorded" | "processed" | "failed";
  playback_position_seconds: number | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface LiveMicPulseSummary {
  live_mic_session_count: number;
  call_request_count: number;
  approved_call_count: number;
  rejected_call_count: number;
  cohost_count: number;
  average_call_duration: number;
  sfx_trigger_count: number;
  mic_event_count: number;
  live_engagement_rate: number;
}
