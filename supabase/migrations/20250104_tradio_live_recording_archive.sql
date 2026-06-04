-- Tradio Broadcast Studio Pass 9: Live Recording + Replay Clips + Show Archiver
-- Creates tables for opt-in live recording, clip creation, and archive publishing

-- Table: tradio_live_recordings
-- Stores full or partial live session recordings
CREATE TABLE tradio_live_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES tradio_live_mic_sessions(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES tradio_live_rooms(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES tradio_broadcast_channels(id) ON DELETE CASCADE,
  queue_id UUID REFERENCES tradio_broadcast_queue(id) ON DELETE SET NULL,
  show_id UUID REFERENCES tradio_shows(id) ON DELETE SET NULL,
  episode_id UUID REFERENCES tradio_show_episodes(id) ON DELETE SET NULL,
  assembly_id UUID REFERENCES tradio_episode_assemblies(id) ON DELETE SET NULL,
  
  recording_status TEXT NOT NULL DEFAULT 'queued',
  recording_type TEXT NOT NULL DEFAULT 'live_session',
  provider TEXT NOT NULL DEFAULT 'livekit',
  provider_recording_id TEXT,
  provider_egress_id TEXT,
  
  recording_started_at TIMESTAMPTZ,
  recording_ended_at TIMESTAMPTZ,
  duration_seconds NUMERIC,
  
  storage_path TEXT,
  audio_url TEXT,
  waveform_json JSONB DEFAULT '{}',
  
  transcript_status TEXT NOT NULL DEFAULT 'not_requested',
  transcript_text TEXT,
  
  rights_status TEXT NOT NULL DEFAULT 'draft_review',
  review_status TEXT NOT NULL DEFAULT 'draft',
  
  consent_snapshot JSONB NOT NULL DEFAULT '{}',
  source_manifest JSONB NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tradio_live_recordings_owner_user_id ON tradio_live_recordings(owner_user_id);
CREATE INDEX idx_tradio_live_recordings_session_id ON tradio_live_recordings(session_id);
CREATE INDEX idx_tradio_live_recordings_room_id ON tradio_live_recordings(room_id);
CREATE INDEX idx_tradio_live_recordings_channel_id ON tradio_live_recordings(channel_id);
CREATE INDEX idx_tradio_live_recordings_recording_status ON tradio_live_recordings(recording_status);

-- Table: tradio_live_recording_segments
-- Stores meaningful segments within recordings
CREATE TABLE tradio_live_recording_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID NOT NULL REFERENCES tradio_live_recordings(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES tradio_live_mic_sessions(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES tradio_live_rooms(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES tradio_broadcast_channels(id) ON DELETE CASCADE,
  queue_id UUID REFERENCES tradio_broadcast_queue(id) ON DELETE SET NULL,
  
  segment_type TEXT NOT NULL DEFAULT 'manual_marker',
  title TEXT,
  description TEXT,
  
  start_time_seconds NUMERIC NOT NULL,
  end_time_seconds NUMERIC NOT NULL,
  duration_seconds NUMERIC,
  
  confidence NUMERIC,
  source_event_ids JSONB DEFAULT '[]',
  metadata JSONB NOT NULL DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tradio_live_recording_segments_recording_id ON tradio_live_recording_segments(recording_id);
CREATE INDEX idx_tradio_live_recording_segments_session_id ON tradio_live_recording_segments(session_id);
CREATE INDEX idx_tradio_live_recording_segments_segment_type ON tradio_live_recording_segments(segment_type);

-- Table: tradio_live_highlight_clips
-- Stores trimmed clips created from recordings
CREATE TABLE tradio_live_highlight_clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recording_id UUID NOT NULL REFERENCES tradio_live_recordings(id) ON DELETE CASCADE,
  segment_id UUID REFERENCES tradio_live_recording_segments(id) ON DELETE SET NULL,
  
  session_id UUID NOT NULL REFERENCES tradio_live_mic_sessions(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES tradio_live_rooms(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES tradio_broadcast_channels(id) ON DELETE CASCADE,
  queue_id UUID REFERENCES tradio_broadcast_queue(id) ON DELETE SET NULL,
  show_id UUID REFERENCES tradio_shows(id) ON DELETE SET NULL,
  episode_id UUID REFERENCES tradio_show_episodes(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  
  clip_status TEXT NOT NULL DEFAULT 'draft',
  visibility TEXT NOT NULL DEFAULT 'private',
  
  start_time_seconds NUMERIC NOT NULL,
  end_time_seconds NUMERIC NOT NULL,
  duration_seconds NUMERIC,
  
  storage_path TEXT,
  audio_url TEXT,
  cover_art_url TEXT,
  
  transcript_text TEXT,
  caption TEXT,
  
  mood_tags TEXT[] DEFAULT '{}',
  genre_tags TEXT[] DEFAULT '{}',
  audience_tags TEXT[] DEFAULT '{}',
  
  engagement_snapshot JSONB NOT NULL DEFAULT '{}',
  rights_snapshot JSONB NOT NULL DEFAULT '{}',
  
  review_notes TEXT,
  published_at TIMESTAMPTZ,
  
  metadata JSONB NOT NULL DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tradio_live_highlight_clips_owner_user_id ON tradio_live_highlight_clips(owner_user_id);
CREATE INDEX idx_tradio_live_highlight_clips_recording_id ON tradio_live_highlight_clips(recording_id);
CREATE INDEX idx_tradio_live_highlight_clips_channel_id ON tradio_live_highlight_clips(channel_id);
CREATE INDEX idx_tradio_live_highlight_clips_clip_status ON tradio_live_highlight_clips(clip_status);
CREATE INDEX idx_tradio_live_highlight_clips_visibility ON tradio_live_highlight_clips(visibility);

-- Table: tradio_live_archive_jobs
-- Stores background processing jobs
CREATE TABLE tradio_live_archive_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recording_id UUID REFERENCES tradio_live_recordings(id) ON DELETE CASCADE,
  clip_id UUID REFERENCES tradio_live_highlight_clips(id) ON DELETE CASCADE,
  
  job_type TEXT NOT NULL,
  job_status TEXT NOT NULL DEFAULT 'queued',
  provider TEXT,
  
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  
  input_payload JSONB NOT NULL DEFAULT '{}',
  output_payload JSONB NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tradio_live_archive_jobs_owner_user_id ON tradio_live_archive_jobs(owner_user_id);
CREATE INDEX idx_tradio_live_archive_jobs_recording_id ON tradio_live_archive_jobs(recording_id);
CREATE INDEX idx_tradio_live_archive_jobs_clip_id ON tradio_live_archive_jobs(clip_id);
CREATE INDEX idx_tradio_live_archive_jobs_job_type ON tradio_live_archive_jobs(job_type);
CREATE INDEX idx_tradio_live_archive_jobs_job_status ON tradio_live_archive_jobs(job_status);

-- Table: tradio_live_recording_consents
-- Stores participant consent/notice acknowledgement
CREATE TABLE tradio_live_recording_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID REFERENCES tradio_live_recordings(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES tradio_live_mic_sessions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES tradio_live_mic_participants(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  anonymous_session_id TEXT,
  
  consent_status TEXT NOT NULL DEFAULT 'notified',
  consent_text TEXT NOT NULL,
  
  consented_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  
  metadata JSONB NOT NULL DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tradio_live_recording_consents_session_id ON tradio_live_recording_consents(session_id);
CREATE INDEX idx_tradio_live_recording_consents_user_id ON tradio_live_recording_consents(user_id);
CREATE INDEX idx_tradio_live_recording_consents_consent_status ON tradio_live_recording_consents(consent_status);

-- Enable Row Level Security
ALTER TABLE tradio_live_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tradio_live_recording_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tradio_live_highlight_clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE tradio_live_archive_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tradio_live_recording_consents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tradio_live_recordings
CREATE POLICY "Owners can view their own recordings" ON tradio_live_recordings
  FOR SELECT USING (auth.uid() = owner_user_id);

CREATE POLICY "Admins can view all recordings" ON tradio_live_recordings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Owners can insert their own recordings" ON tradio_live_recordings
  FOR INSERT WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Owners can update their own recordings" ON tradio_live_recordings
  FOR UPDATE USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- RLS Policies for tradio_live_recording_segments
CREATE POLICY "Segment visibility matches recording visibility" ON tradio_live_recording_segments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tradio_live_recordings r 
      WHERE r.id = recording_id AND (
        auth.uid() = r.owner_user_id OR
        EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
      )
    )
  );

CREATE POLICY "Only recording owner can manage segments" ON tradio_live_recording_segments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tradio_live_recordings r 
      WHERE r.id = recording_id AND auth.uid() = r.owner_user_id
    )
  );

-- RLS Policies for tradio_live_highlight_clips
CREATE POLICY "Owners can view their own clips" ON tradio_live_highlight_clips
  FOR SELECT USING (auth.uid() = owner_user_id);

CREATE POLICY "Public clips visible to all" ON tradio_live_highlight_clips
  FOR SELECT USING (visibility = 'public' AND clip_status = 'published');

CREATE POLICY "Admins can view all clips" ON tradio_live_highlight_clips
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Owners can manage their own clips" ON tradio_live_highlight_clips
  FOR INSERT WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Owners can update their own clips" ON tradio_live_highlight_clips
  FOR UPDATE USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- RLS Policies for tradio_live_archive_jobs
CREATE POLICY "Owners can view their own jobs" ON tradio_live_archive_jobs
  FOR SELECT USING (auth.uid() = owner_user_id);

CREATE POLICY "Admins can view all jobs" ON tradio_live_archive_jobs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Owners can insert their own jobs" ON tradio_live_archive_jobs
  FOR INSERT WITH CHECK (auth.uid() = owner_user_id);

-- RLS Policies for tradio_live_recording_consents
CREATE POLICY "Users can view their own consent records" ON tradio_live_recording_consents
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = (SELECT owner_user_id FROM tradio_live_recordings WHERE id = recording_id));

CREATE POLICY "Admins can view all consent records" ON tradio_live_recording_consents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Anyone can insert consent records for active sessions" ON tradio_live_recording_consents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tradio_live_mic_sessions s 
      WHERE s.id = session_id AND s.session_status = 'active'
    )
  );
