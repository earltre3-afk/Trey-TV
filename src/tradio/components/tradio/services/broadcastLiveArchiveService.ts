/**
 * Tradio Broadcast Studio Pass 9: Live Recording + Replay Clips + Show Archiver
 * Core archiving and clip management service (client-safe utility functions)
 */

import type {
  LiveRecording,
  RecordingSegment,
  HighlightClip,
  ArchiveJob,
  RecordingConsent,
  SegmentType,
  ClipStatus,
  RecordingStatus,
} from '../types/broadcastArchiveTypes';

/**
 * Time utilities for segment/clip creation
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

export function parseTimeString(timeStr: string): number {
  const parts = timeStr.split(':');
  if (parts.length === 3) {
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
  }
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
  return parseInt(parts[0]) || 0;
}

/**
 * Validation helpers
 */
export function validateClipTrim(
  startSec: number,
  endSec: number,
  recordingDuration: number,
): { valid: boolean; error?: string } {
  if (startSec < 0) return { valid: false, error: 'Start time cannot be negative' };
  if (endSec > recordingDuration) {
    return { valid: false, error: 'End time cannot exceed recording duration' };
  }
  if (startSec >= endSec) {
    return { valid: false, error: 'Start time must be before end time' };
  }

  const duration = endSec - startSec;
  const minClipSeconds = 5;
  const maxClipSeconds = 3600; // 1 hour

  if (duration < minClipSeconds) {
    return { valid: false, error: `Clip must be at least ${minClipSeconds} seconds` };
  }
  if (duration > maxClipSeconds) {
    return { valid: false, error: `Clip cannot exceed ${maxClipSeconds} seconds` };
  }

  return { valid: true };
}

/**
 * Recording status helpers
 */
export function canStartRecording(sessionStatus: string): boolean {
  return sessionStatus === 'active';
}

export function canStopRecording(recordingStatus: RecordingStatus): boolean {
  return recordingStatus === 'recording';
}

export function canCreateClip(recordingStatus: RecordingStatus): boolean {
  return recordingStatus === 'completed' || recordingStatus === 'archived';
}

/**
 * Clip status progression
 */
export function getClipStatusTransitions(currentStatus: ClipStatus): ClipStatus[] {
  const transitions: Record<ClipStatus, ClipStatus[]> = {
    draft: ['rendering', 'pending_review', 'archived'],
    rendering: ['rendered', 'failed'],
    rendered: ['pending_review', 'archived'],
    pending_review: ['approved', 'rejected', 'archived'],
    approved: ['published', 'hidden', 'archived'],
    published: ['hidden', 'archived'],
    rejected: ['hidden', 'archived'],
    hidden: ['published', 'archived'],
    archived: [],
    failed: ['rendering', 'archived'],
  };

  return transitions[currentStatus] || [];
}

/**
 * Segment detection helpers
 */
export function getSegmentDuration(segment: RecordingSegment): number {
  return segment.duration_seconds || segment.end_time_seconds - segment.start_time_seconds;
}

export function segmentsOverlap(
  seg1: RecordingSegment,
  seg2: RecordingSegment,
): boolean {
  return !(seg1.end_time_seconds <= seg2.start_time_seconds || seg2.end_time_seconds <= seg1.start_time_seconds);
}

/**
 * Highlight candidate scoring (non-AI baseline)
 */
export function scoreHighlightCandidate(segment: RecordingSegment): number {
  let score = 0.5; // Base score

  const metadata = segment.metadata || {};
  
  if (segment.segment_type === 'reaction_spike') score += 0.3;
  if (segment.segment_type === 'chat_spike') score += 0.2;
  if (segment.segment_type === 'call_in_moment') score += 0.4;
  if (segment.segment_type === 'sfx_moment') score += 0.15;
  if (segment.segment_type === 'poll_result') score += 0.25;

  if (segment.confidence && typeof segment.confidence === 'number') {
    score = score * (1 + segment.confidence / 2);
  }

  // Prefer medium-length segments (30s - 5m)
  const duration = getSegmentDuration(segment);
  if (duration >= 30 && duration <= 300) {
    score += 0.2;
  }

  return Math.min(1, score);
}

/**
 * Metadata helpers for Prescribe Me preparation
 */
export function extractPrescribeMeMetadata(clip: HighlightClip): Record<string, unknown> {
  return {
    clip_id: clip.id,
    title: clip.title,
    description: clip.description,
    mood_tags: clip.mood_tags,
    genre_tags: clip.genre_tags,
    audience_tags: clip.audience_tags,
    duration_seconds: clip.duration_seconds,
    published_at: clip.published_at,
    engagement_snapshot: clip.engagement_snapshot,
    visibility: clip.visibility,
    clip_status: clip.clip_status,
  };
}

/**
 * Provider availability check (client can use these for UI state)
 */
export function isRecordingProviderAvailable(provider: string, config?: Record<string, unknown>): boolean {
  // These checks are informational; actual provider validation happens server-side
  switch (provider) {
    case 'livekit':
      return !!(config?.LIVEKIT_API_KEY && config?.LIVEKIT_API_SECRET);
    case 'local_dev_stub':
      return true; // Always available for testing
    case 'uploaded_recording':
      return true; // Upload always available
    default:
      return false;
  }
}

/**
 * Consent helpers
 */
export function generateRecordingDisclosureText(
  channelName: string,
  publishingIntent: 'private' | 'unlisted' | 'public' = 'private',
): string {
  const base = `This broadcast may be recorded by ${channelName} for archival and replay purposes.`;
  
  switch (publishingIntent) {
    case 'private':
      return `${base} Recordings are private and accessible only to the creator.`;
    case 'unlisted':
      return `${base} Clips may be created and shared via direct link.`;
    case 'public':
      return `${base} Approved clips may be published to the ${channelName} replay library.`;
    default:
      return base;
  }
}

export function hasGivenConsent(consent: RecordingConsent): boolean {
  return consent.consent_status === 'accepted' || consent.consent_status === 'not_required';
}

export function hasDeclinedRecording(consent: RecordingConsent): boolean {
  return consent.consent_status === 'declined' || consent.consent_status === 'removed_from_recording';
}
