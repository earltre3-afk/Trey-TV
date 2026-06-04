/**
 * Tradio Broadcast Studio Pass 9B: Recording Consent Enforcement
 * Prevent speakers from joining when recording is active unless they accept consent
 */

import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from '@/integrations/supabase/client.server';

const supabase = supabaseAdmin;

interface RecordingConsentRow {
  id: string;
  user_id: string | null;
  participant_id: string | null;
  anonymous_session_id: string | null;
  consent_status: string;
  consented_at: string | null;
  declined_at: string | null;
}

/**
 * Check if recording is active for a session
 */
export async function isRecordingActiveServer(sessionId: string): Promise<boolean> {
  try {
    const { data, error } = await (supabase as any)
      .from('tradio_live_recordings')
      .select('recording_status')
      .eq('session_id', sessionId)
      .eq('recording_status', 'recording')
      .maybeSingle();

    return !error && !!data;
  } catch {
    return false;
  }
}

/**
 * Get recording disclosure text for a session
 */
export async function getRecordingDisclosureServer(sessionId: string): Promise<string | null> {
  try {
    const { data } = await (supabase as any)
      .from('tradio_live_recordings')
      .select('metadata')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return data?.metadata?.disclosure_text || null;
  } catch {
    return null;
  }
}

/**
 * Record participant consent before granting speaker token
 */
export async function recordParticipantConsentServer(input: {
  session_id: string;
  participant_id?: string;
  user_id?: string;
  anonymous_session_id?: string;
  consent_status: 'accepted' | 'declined';
}): Promise<{ consent_id: string; error?: string }> {
  try {
    const disclosure = await getRecordingDisclosureServer(input.session_id);
    const recordingActive = await isRecordingActiveServer(input.session_id);

    if (!recordingActive) {
      return { consent_id: '', error: 'No active recording for this session' };
    }

    // Get the active recording
    const { data: recording } = await (supabase as any)
      .from('tradio_live_recordings')
      .select('id')
      .eq('session_id', input.session_id)
      .eq('recording_status', 'recording')
      .maybeSingle();

    const { data, error } = await (supabase as any)
      .from('tradio_live_recording_consents')
      .insert({
        session_id: input.session_id,
        recording_id: recording?.id,
        participant_id: input.participant_id,
        user_id: input.user_id,
        anonymous_session_id: input.anonymous_session_id,
        consent_status: input.consent_status,
        consent_text: disclosure || 'This broadcast is being recorded.',
        consented_at: input.consent_status === 'accepted' ? new Date().toISOString() : null,
        declined_at: input.consent_status === 'declined' ? new Date().toISOString() : null,
      })
      .select('id')
      .single();

    if (error) return { consent_id: '', error: error.message };
    return { consent_id: data?.id || '' };
  } catch (err) {
    return { consent_id: '', error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Check if caller can receive speaker token (must have accepted consent)
 */
export async function canCallerReceiveSpeakerTokenServer(input: {
  session_id: string;
  caller_id: string;
}): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const recordingActive = await isRecordingActiveServer(input.session_id);

    // If no recording active, always allow speaker token
    if (!recordingActive) {
      return { allowed: true };
    }

    // Check if caller has accepted consent
    const { data: consent } = await (supabase as any)
      .from('tradio_live_recording_consents')
      .select('consent_status')
      .eq('session_id', input.session_id)
      .eq('participant_id', input.caller_id)
      .order('created_at', { ascending: false })
      .maybeSingle();

    if (!consent) {
      return { allowed: false, reason: 'Caller has not acknowledged recording consent' };
    }

    if (consent.consent_status === 'declined') {
      return { allowed: false, reason: 'Caller declined recording consent' };
    }

    if (consent.consent_status === 'removed_from_recording') {
      return { allowed: false, reason: 'Caller was removed from recording' };
    }

    // Accepted or notified
    return { allowed: true };
  } catch (err) {
    return { allowed: false, reason: 'Consent check failed' };
  }
}

/**
 * Update recording with final consent snapshot
 */
export async function finalizeRecordingConsentSnapshotServer(input: {
  recording_id: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Fetch all consent records for this recording
    const { data: consents } = await (supabase as any)
      .from('tradio_live_recording_consents')
      .select('*')
      .eq('recording_id', input.recording_id);

    if (!consents) {
      return { success: false, error: 'No consent records found' };
    }

    // Build consent snapshot
    const snapshot = {
      recorded_at: new Date().toISOString(),
      total_participants: consents.length,
      consents: consents.map((c: RecordingConsentRow) => ({
        id: c.id,
        user_id: c.user_id,
        participant_id: c.participant_id,
        anonymous_session_id: c.anonymous_session_id,
        consent_status: c.consent_status,
        consented_at: c.consented_at,
        declined_at: c.declined_at,
      })),
    };

    // Update recording with snapshot
    const { error } = await (supabase as any)
      .from('tradio_live_recordings')
      .update({
        consent_snapshot: snapshot,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.recording_id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
