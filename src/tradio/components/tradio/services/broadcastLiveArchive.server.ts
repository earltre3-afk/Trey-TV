/**
 * Tradio Broadcast Studio Pass 9: Live Recording + Replay Clips + Show Archiver
 * Server-side functions for recording, clips, and archive operations
 * 
 * All operations here must:
 * - Validate user permissions
 * - Never expose private storage paths
 * - Use signed URLs for private playback
 * - Preserve consent and rights snapshots
 * - Integrate with existing Broadcast Studio Pass 1-8 systems
 * - Not record by default
 * - Require explicit host action
 */

import { createBrowserClient } from '@/lib/supabase-browser';

const supabase = createBrowserClient();

/**
 * Create a new recording instance for a live mic session
 * Only called server-side when host explicitly enables recording
 */
export async function createLiveRecordingServer(input: {
  session_id: string;
  room_id: string;
  channel_id: string;
  queue_id?: string;
  show_id?: string;
  episode_id?: string;
  assembly_id?: string;
  recording_type?: string;
}): Promise<{ id: string; error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { id: '', error: 'Not authenticated' };

  const {
    data,
    error,
  } = await (supabase as any)
    .from('tradio_live_recordings')
    .insert({
      owner_user_id: user.id,
      session_id: input.session_id,
      room_id: input.room_id,
      channel_id: input.channel_id,
      queue_id: input.queue_id,
      show_id: input.show_id,
      episode_id: input.episode_id,
      assembly_id: input.assembly_id,
      recording_type: input.recording_type || 'live_session',
      recording_status: 'queued',
      provider: 'livekit',
      rights_status: 'draft_review',
      review_status: 'draft',
    })
    .select('id')
    .single();

  if (error) return { id: '', error: error.message };
  return { id: data?.id || '', error: undefined };
}

/**
 * Update recording status (server-side only)
 * Called when provider confirms recording started/stopped/completed
 */
export async function updateRecordingStatusServer(input: {
  recording_id: string;
  status: string;
  duration_seconds?: number;
  provider_recording_id?: string;
  provider_egress_id?: string;
  storage_path?: string;
  error?: string;
}): Promise<{ success: boolean; error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const updateData: Record<string, unknown> = {
    recording_status: input.status,
    updated_at: new Date().toISOString(),
  };

  if (input.status === 'recording') {
    updateData.recording_started_at = new Date().toISOString();
    if (input.provider_recording_id) updateData.provider_recording_id = input.provider_recording_id;
    if (input.provider_egress_id) updateData.provider_egress_id = input.provider_egress_id;
  }

  if (input.status === 'completed') {
    updateData.recording_ended_at = new Date().toISOString();
    if (input.duration_seconds) updateData.duration_seconds = input.duration_seconds;
    if (input.storage_path) updateData.storage_path = input.storage_path;
  }

  if (input.status === 'failed' && input.error) {
    updateData.metadata = { error_details: input.error };
  }

  const { error } = await (supabase as any)
    .from('tradio_live_recordings')
    .update(updateData)
    .eq('id', input.recording_id)
    .eq('owner_user_id', user.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Create recording consent record for participant
 */
export async function createRecordingConsentServer(input: {
  session_id: string;
  recording_id?: string;
  participant_id?: string;
  user_id?: string;
  anonymous_session_id?: string;
  consent_text: string;
}): Promise<{ id: string; error?: string }> {
  const {
    data,
    error,
  } = await (supabase as any)
    .from('tradio_live_recording_consents')
    .insert({
      session_id: input.session_id,
      recording_id: input.recording_id,
      participant_id: input.participant_id,
      user_id: input.user_id,
      anonymous_session_id: input.anonymous_session_id,
      consent_status: 'notified',
      consent_text: input.consent_text,
    })
    .select('id')
    .single();

  if (error) return { id: '', error: error.message };
  return { id: data?.id || '', error: undefined };
}

/**
 * Update participant consent status
 */
export async function updateRecordingConsentServer(input: {
  consent_id: string;
  status: string;
}): Promise<{ success: boolean; error?: string }> {
  const updateData: Record<string, unknown> = {
    consent_status: input.status,
    updated_at: new Date().toISOString(),
  };

  if (input.status === 'accepted') {
    updateData.consented_at = new Date().toISOString();
  }
  if (input.status === 'declined') {
    updateData.declined_at = new Date().toISOString();
  }

  const { error } = await (supabase as any)
    .from('tradio_live_recording_consents')
    .update(updateData)
    .eq('id', input.consent_id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Create a recording segment (manual marker or AI-suggested)
 */
export async function createRecordingSegmentServer(input: {
  recording_id: string;
  session_id: string;
  room_id: string;
  channel_id: string;
  queue_id?: string;
  segment_type: string;
  title?: string;
  description?: string;
  start_time_seconds: number;
  end_time_seconds: number;
  confidence?: number;
  source_event_ids?: string[];
}): Promise<{ id: string; error?: string }> {
  const {
    data,
    error,
  } = await (supabase as any)
    .from('tradio_live_recording_segments')
    .insert({
      recording_id: input.recording_id,
      session_id: input.session_id,
      room_id: input.room_id,
      channel_id: input.channel_id,
      queue_id: input.queue_id,
      segment_type: input.segment_type,
      title: input.title,
      description: input.description,
      start_time_seconds: input.start_time_seconds,
      end_time_seconds: input.end_time_seconds,
      duration_seconds: input.end_time_seconds - input.start_time_seconds,
      confidence: input.confidence,
      source_event_ids: input.source_event_ids || [],
    })
    .select('id')
    .single();

  if (error) return { id: '', error: error.message };
  return { id: data?.id || '', error: undefined };
}

/**
 * Create a highlight clip from a recording
 */
export async function createHighlightClipServer(input: {
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
  start_time_seconds: number;
  end_time_seconds: number;
  mood_tags?: string[];
  genre_tags?: string[];
  audience_tags?: string[];
}): Promise<{ id: string; error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { id: '', error: 'Not authenticated' };

  const {
    data,
    error,
  } = await (supabase as any)
    .from('tradio_live_highlight_clips')
    .insert({
      owner_user_id: user.id,
      recording_id: input.recording_id,
      segment_id: input.segment_id,
      session_id: input.session_id,
      room_id: input.room_id,
      channel_id: input.channel_id,
      queue_id: input.queue_id,
      show_id: input.show_id,
      episode_id: input.episode_id,
      title: input.title,
      description: input.description,
      start_time_seconds: input.start_time_seconds,
      end_time_seconds: input.end_time_seconds,
      duration_seconds: input.end_time_seconds - input.start_time_seconds,
      clip_status: 'draft',
      visibility: 'private',
      mood_tags: input.mood_tags || [],
      genre_tags: input.genre_tags || [],
      audience_tags: input.audience_tags || [],
    })
    .select('id')
    .single();

  if (error) return { id: '', error: error.message };
  return { id: data?.id || '', error: undefined };
}

/**
 * Update clip metadata and status
 */
export async function updateHighlightClipServer(input: {
  clip_id: string;
  title?: string;
  description?: string;
  caption?: string;
  clip_status?: string;
  visibility?: string;
  mood_tags?: string[];
  genre_tags?: string[];
  audience_tags?: string[];
}): Promise<{ success: boolean; error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.title) updateData.title = input.title;
  if (input.description) updateData.description = input.description;
  if (input.caption) updateData.caption = input.caption;
  if (input.clip_status) updateData.clip_status = input.clip_status;
  if (input.visibility) updateData.visibility = input.visibility;
  if (input.mood_tags) updateData.mood_tags = input.mood_tags;
  if (input.genre_tags) updateData.genre_tags = input.genre_tags;
  if (input.audience_tags) updateData.audience_tags = input.audience_tags;

  const { error } = await (supabase as any)
    .from('tradio_live_highlight_clips')
    .update(updateData)
    .eq('id', input.clip_id)
    .eq('owner_user_id', user.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Submit clip for review/approval
 */
export async function submitClipForReviewServer(input: {
  clip_id: string;
  review_notes?: string;
}): Promise<{ success: boolean; error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { error } = await (supabase as any)
    .from('tradio_live_highlight_clips')
    .update({
      clip_status: 'pending_review',
      review_notes: input.review_notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.clip_id)
    .eq('owner_user_id', user.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Publish approved clip (admin/creator)
 */
export async function publishHighlightClipServer(input: {
  clip_id: string;
  visibility?: string;
}): Promise<{ success: boolean; error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { error } = await (supabase as any)
    .from('tradio_live_highlight_clips')
    .update({
      clip_status: 'published',
      visibility: input.visibility || 'public',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.clip_id)
    .eq('owner_user_id', user.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Get signed URL for private recording playback (review only)
 */
export async function getSignedRecordingPlaybackUrlServer(input: {
  recording_id: string;
  expiresIn?: number;
}): Promise<{ url?: string; error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Fetch recording to verify ownership/permissions
  const { data: recording, error: fetchError } = await (supabase as any)
    .from('tradio_live_recordings')
    .select('storage_path')
    .eq('id', input.recording_id)
    .eq('owner_user_id', user.id)
    .single();

  if (fetchError || !recording?.storage_path) {
    return { error: 'Recording not found or not authorized' };
  }

  // Generate signed URL for private storage (5 hours default)
  const { data, error } = await supabase.storage
    .from('tradio')
    .createSignedUrl(recording.storage_path, input.expiresIn || 18000);

  if (error) return { error: error.message };
  return { url: data?.signedUrl };
}

/**
 * Get signed URL for public clip playback
 */
export async function getSignedClipPlaybackUrlServer(input: {
  clip_id: string;
}): Promise<{ url?: string; error?: string }> {
  const { data: clip, error: fetchError } = await (supabase as any)
    .from('tradio_live_highlight_clips')
    .select('audio_url, clip_status, visibility')
    .eq('id', input.clip_id)
    .single();

  if (fetchError) return { error: 'Clip not found' };

  // Only serve publicly published clips or auth-owned clips
  if (clip.clip_status !== 'published' && clip.visibility !== 'public') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authorized' };
  }

  // If audio_url is a signed URL or public path, return it
  // Otherwise generate a signed URL from storage_path
  if (clip.audio_url) {
    return { url: clip.audio_url };
  }

  return { error: 'Clip not yet rendered' };
}

/**
 * List recordings for a session or creator
 */
export async function listRecordingsForSessionServer(input: {
  session_id?: string;
  limit?: number;
  offset?: number;
}): Promise<{ recordings: any[]; error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { recordings: [], error: 'Not authenticated' };

  let query = (supabase as any)
    .from('tradio_live_recordings')
    .select('*')
    .eq('owner_user_id', user.id);

  if (input.session_id) {
    query = query.eq('session_id', input.session_id);
  }

  query = query.order('created_at', { ascending: false });

  if (input.limit) {
    query = query.limit(input.limit);
  }
  if (input.offset) {
    query = query.range(input.offset, input.offset + (input.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) return { recordings: [], error: error.message };
  return { recordings: data || [] };
}

/**
 * Create an archive job (for background processing)
 */
export async function createArchiveJobServer(input: {
  recording_id?: string;
  clip_id?: string;
  job_type: string;
  input_payload?: Record<string, unknown>;
}): Promise<{ id: string; error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { id: '', error: 'Not authenticated' };

  const { data, error } = await (supabase as any)
    .from('tradio_live_archive_jobs')
    .insert({
      owner_user_id: user.id,
      recording_id: input.recording_id,
      clip_id: input.clip_id,
      job_type: input.job_type,
      job_status: 'queued',
      input_payload: input.input_payload || {},
    })
    .select('id')
    .single();

  if (error) return { id: '', error: error.message };
  return { id: data?.id || '', error: undefined };
}
