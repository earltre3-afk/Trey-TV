import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PUBLIC_REPLAY_CLIP_COLUMNS,
  toPublicReplayClip,
} from './broadcastPublicReplayRules.ts';

test('public replay query uses an explicit clip field allowlist', () => {
  assert.doesNotMatch(PUBLIC_REPLAY_CLIP_COLUMNS, /\*/);
  assert.doesNotMatch(
    PUBLIC_REPLAY_CLIP_COLUMNS,
    /\b(owner_user_id|storage_path|transcript_text|engagement_snapshot|rights_snapshot|review_notes|metadata)\b/,
  );
});

test('public replay rows do not expose private clip fields', () => {
  const publicClip = toPublicReplayClip({
    id: 'clip-1',
    owner_user_id: 'owner-1',
    recording_id: 'recording-1',
    session_id: 'session-1',
    room_id: 'room-1',
    channel_id: 'channel-1',
    queue_id: 'queue-1',
    show_id: 'show-1',
    episode_id: 'episode-1',
    title: 'Original title',
    description: 'Original description',
    clip_status: 'published',
    visibility: 'public',
    start_time_seconds: 10,
    end_time_seconds: 40,
    duration_seconds: 30,
    storage_path: 'private/highlights/clip-1.mp3',
    audio_url: 'https://cdn.example/clip-1.mp3',
    cover_art_url: 'https://cdn.example/clip-1.jpg',
    transcript_text: 'private transcript',
    caption: 'Original caption',
    mood_tags: ['bright'],
    genre_tags: ['soul'],
    audience_tags: ['night'],
    engagement_snapshot: { chat: 'private' },
    rights_snapshot: { status: 'cleared' },
    review_notes: 'internal note',
    published_at: '2026-06-05T00:00:00.000Z',
    metadata: { prompt: 'private' },
    created_at: '2026-06-04T00:00:00.000Z',
    updated_at: '2026-06-05T00:00:00.000Z',
  });

  assert.equal(publicClip.id, 'clip-1');
  assert.equal(publicClip.audio_url, 'https://cdn.example/clip-1.mp3');
  assert.deepEqual(publicClip.mood_tags, ['bright']);

  const exposed = publicClip as Record<string, unknown>;
  for (const privateField of [
    'owner_user_id',
    'recording_id',
    'session_id',
    'room_id',
    'queue_id',
    'show_id',
    'episode_id',
    'storage_path',
    'transcript_text',
    'engagement_snapshot',
    'rights_snapshot',
    'review_notes',
    'metadata',
  ]) {
    assert.equal(privateField in exposed, false, `${privateField} should not be public`);
  }
});
