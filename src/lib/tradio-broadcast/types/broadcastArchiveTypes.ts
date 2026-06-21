/**
 * Tradio Broadcast Studio Pass 9: Live Recording + Replay Clips + Show Archiver
 * Type definitions for recording, clip, and archive management
 */

// Recording statuses
export type RecordingStatus = 
  | 'queued'
  | 'recording'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'canceled'
  | 'archived';

// Recording types
export type RecordingType = 
  | 'live_session'
  | 'host_mic_only'
  | 'call_in_segment'
  | 'sfx_segment'
  | 'mixed_broadcast_capture';

// Recording providers
export type RecordingProvider = 
  | 'livekit'
  | 'uploaded_recording'
  | 'server_side_capture'
  | 'local_dev_stub';

// Transcript statuses
export type TranscriptStatus = 
  | 'not_requested'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed';

// Rights statuses
export type RightsStatus = 
  | 'draft_review'
  | 'cleared'
  | 'needs_review'
  | 'blocked';

// Review statuses
export type ReviewStatus = 
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'hidden'
  | 'archived';

// Segment types
export type SegmentType = 
  | 'manual_marker'
  | 'reaction_spike'
  | 'chat_spike'
  | 'poll_result'
  | 'call_in_moment'
  | 'host_monologue'
  | 'cohost_exchange'
  | 'sfx_moment'
  | 'outro'
  | 'intro'
  | 'ai_suggested';

// Clip statuses
export type ClipStatus = 
  | 'draft'
  | 'rendering'
  | 'rendered'
  | 'pending_review'
  | 'approved'
  | 'published'
  | 'rejected'
  | 'hidden'
  | 'archived'
  | 'failed';

// Clip visibility
export type ClipVisibility = 
  | 'private'
  | 'unlisted'
  | 'public';

// Consent statuses
export type ConsentStatus = 
  | 'notified'
  | 'accepted'
  | 'declined'
  | 'not_required'
  | 'removed_from_recording';

// Archive job types
export type ArchiveJobType = 
  | 'provider_recording_import'
  | 'waveform_generate'
  | 'transcript_generate'
  | 'highlight_detect'
  | 'clip_render'
  | 'archive_publish'
  | 'cleanup';

// Archive job statuses
export type ArchiveJobStatus = 
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'canceled';

/**
 * Domain models
 */

export interface LiveRecording {
  id: string;
  owner_user_id: string;
  session_id: string;
  room_id: string;
  channel_id: string;
  queue_id?: string;
  show_id?: string;
  episode_id?: string;
  assembly_id?: string;
  
  recording_status: RecordingStatus;
  recording_type: RecordingType;
  provider: RecordingProvider;
  provider_recording_id?: string;
  provider_egress_id?: string;
  
  recording_started_at?: string;
  recording_ended_at?: string;
  duration_seconds?: number;
  
  storage_path?: string;
  audio_url?: string;
  waveform_json?: Record<string, unknown>;
  
  transcript_status: TranscriptStatus;
  transcript_text?: string;
  
  rights_status: RightsStatus;
  review_status: ReviewStatus;
  
  consent_snapshot: Record<string, unknown>;
  source_manifest: Record<string, unknown>;
  metadata: Record<string, unknown>;
  
  created_at: string;
  updated_at: string;
}

export interface RecordingSegment {
  id: string;
  recording_id: string;
  session_id: string;
  room_id: string;
  channel_id: string;
  queue_id?: string;
  
  segment_type: SegmentType;
  title?: string;
  description?: string;
  
  start_time_seconds: number;
  end_time_seconds: number;
  duration_seconds?: number;
  
  confidence?: number;
  source_event_ids: string[];
  metadata: Record<string, unknown>;
  
  created_at: string;
  updated_at: string;
}

export interface HighlightClip {
  id: string;
  owner_user_id: string;
  recording_id: string;
  segment_id?: string;
  
  session_id: string;
  room_id: string;
  channel_id: string;
  queue_id?: string;
  show_id?: string;
  episode_id?: string;
  
  title: string;
  description?: string;
  
  clip_status: ClipStatus;
  visibility: ClipVisibility;
  
  start_time_seconds: number;
  end_time_seconds: number;
  duration_seconds?: number;
  
  storage_path?: string;
  audio_url?: string;
  cover_art_url?: string;
  
  transcript_text?: string;
  caption?: string;
  
  mood_tags: string[];
  genre_tags: string[];
  audience_tags: string[];
  
  engagement_snapshot: Record<string, unknown>;
  rights_snapshot: Record<string, unknown>;
  
  review_notes?: string;
  published_at?: string;
  
  metadata: Record<string, unknown>;
  
  created_at: string;
  updated_at: string;
}

export interface ArchiveJob {
  id: string;
  owner_user_id: string;
  recording_id?: string;
  clip_id?: string;
  
  job_type: ArchiveJobType;
  job_status: ArchiveJobStatus;
  provider?: string;
  
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  
  input_payload: Record<string, unknown>;
  output_payload: Record<string, unknown>;
  metadata: Record<string, unknown>;
  
  created_at: string;
  updated_at: string;
}

export interface RecordingConsent {
  id: string;
  recording_id?: string;
  session_id: string;
  participant_id?: string;
  user_id?: string;
  
  anonymous_session_id?: string;
  
  consent_status: ConsentStatus;
  consent_text: string;
  
  consented_at?: string;
  declined_at?: string;
  
  metadata: Record<string, unknown>;
  
  created_at: string;
  updated_at: string;
}

/**
 * Request/Response types
 */

export interface CreateRecordingRequest {
  session_id: string;
  room_id: string;
  channel_id: string;
  queue_id?: string;
  show_id?: string;
  episode_id?: string;
  assembly_id?: string;
  recording_type?: RecordingType;
}

export interface CreateClipRequest {
  recording_id: string;
  segment_id?: string;
  title: string;
  description?: string;
  start_time_seconds: number;
  end_time_seconds: number;
  mood_tags?: string[];
  genre_tags?: string[];
  audience_tags?: string[];
}

export interface UpdateClipRequest {
  title?: string;
  description?: string;
  caption?: string;
  clip_status?: ClipStatus;
  visibility?: ClipVisibility;
  mood_tags?: string[];
  genre_tags?: string[];
  audience_tags?: string[];
}

export interface CreateConsentRequest {
  session_id: string;
  recording_id?: string;
  participant_id?: string;
  user_id?: string;
  anonymous_session_id?: string;
  consent_text: string;
}
