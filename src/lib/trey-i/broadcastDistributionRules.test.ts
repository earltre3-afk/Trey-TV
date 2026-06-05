import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildDistributionSourceSnapshot,
  buildPrescribeMeSignalsFromDistributionDraft,
  canCreateDistributionDraftFromAsset,
  createDistributionCopyPatch,
  createDistributionReminderPatch,
  formatDistributionDraftFromAsset,
  publicDistributionDraftVisible,
} from './broadcastDistributionRules.ts';
import type { DistributionDraft } from './broadcastDistributionTypes.ts';
import type { PostShowAsset } from './broadcastPostShowTypes.ts';

function asset(overrides: Partial<PostShowAsset> = {}): PostShowAsset {
  return {
    id: 'asset-1',
    owner_user_id: 'owner-1',
    asset_type: 'social_post',
    asset_status: 'approved',
    visibility: 'private',
    title: 'Replay moment',
    body: 'A tight replay blurb about the show moment.',
    platform: 'instagram',
    language: 'en',
    prompt_input: { private_prompt: 'do not leak' },
    source_snapshot: {
      mood_tags: ['hype'],
      genre_tags: ['trap soul'],
      audience_tags: ['night listeners'],
      private_chat: 'do not leak',
      storage_path: 'private/file.wav',
    },
    moderation_snapshot: {},
    metadata: {
      emotional_tone: 'warm',
      engagement_intensity: 'high',
      follow_up_topic_tags: ['after show'],
      provider_secret: 'nope',
    },
    created_at: '2026-06-05T00:00:00.000Z',
    updated_at: '2026-06-05T00:00:00.000Z',
    ...overrides,
  };
}

function draft(overrides: Partial<DistributionDraft> = {}): DistributionDraft {
  return {
    id: 'draft-1',
    owner_user_id: 'owner-1',
    asset_id: 'asset-1',
    application_id: null,
    clip_id: 'clip-1',
    recording_id: 'recording-1',
    episode_id: null,
    queue_id: null,
    channel_id: 'channel-1',
    draft_type: 'instagram_caption',
    draft_status: 'draft',
    platform: 'instagram',
    title: 'Replay moment',
    body: 'Public-facing copy still stays private in the draft queue.',
    call_to_action: 'Watch the replay',
    scheduled_for: null,
    reminder_status: 'not_scheduled',
    copied_count: 1,
    last_copied_at: null,
    review_notes: null,
    moderation_snapshot: {},
    source_snapshot: {
      mood_tags: ['hype'],
      private_prompt: 'do not leak',
      raw_private_chat: 'nope',
    },
    metadata: {
      platform: 'instagram',
      asset_type: 'social_post',
      copied_count: 1,
      marked_used: false,
      prompt_input: 'nope',
    },
    created_at: '2026-06-05T00:00:00.000Z',
    updated_at: '2026-06-05T00:00:00.000Z',
    ...overrides,
  };
}

test('rejected and archived post-show assets cannot create distribution drafts', () => {
  assert.deepEqual(canCreateDistributionDraftFromAsset(asset({ asset_status: 'rejected' })), {
    allowed: false,
    reason: 'Rejected post-show assets cannot create distribution drafts.',
  });
  assert.equal(canCreateDistributionDraftFromAsset(asset({ asset_status: 'archived' })).allowed, false);
});

test('platform formatting creates draft copy without external-send behavior', () => {
  const formatted = formatDistributionDraftFromAsset(asset(), 'x_post', 'x');
  assert.equal(formatted.platform, 'x');
  assert.equal(formatted.draft_type, 'x_post');
  assert.equal(formatted.metadata.no_external_send, true);
  assert.equal(formatted.metadata.no_auto_publish, true);
  assert.ok(formatted.body.length <= 280);
  assert.doesNotMatch(formatted.body, /guaranteed|sponsor|verified listeners/i);
});

test('source snapshots keep safe metadata and drop private prompt/source fields', () => {
  const snapshot = buildDistributionSourceSnapshot(asset());
  assert.deepEqual(snapshot.mood_tags, ['hype']);
  assert.deepEqual(snapshot.genre_tags, ['trap soul']);
  assert.equal(snapshot.asset_id, 'asset-1');
  assert.equal(snapshot.private_chat, undefined);
  assert.equal(snapshot.storage_path, undefined);
  assert.equal(snapshot.private_prompt, undefined);
});

test('copy tracking increments usage without posting or sending', () => {
  const patch = createDistributionCopyPatch(draft(), '2026-06-05T01:00:00.000Z');
  assert.equal(patch.copied_count, 2);
  assert.equal(patch.last_copied_at, '2026-06-05T01:00:00.000Z');
  assert.equal(patch.metadata.no_external_send, true);
  assert.equal(patch.metadata.events?.at(-1)?.type, 'draft_copied');
});

test('reminder scheduling stores metadata only and does not notify', () => {
  const patch = createDistributionReminderPatch(
    draft(),
    '2026-06-06T15:00:00.000Z',
    '2026-06-05T01:00:00.000Z',
  );
  assert.equal(patch.scheduled_for, '2026-06-06T15:00:00.000Z');
  assert.equal(patch.reminder_status, 'scheduled');
  assert.equal(patch.metadata.reminder_only, true);
  assert.equal(patch.metadata.no_external_send, true);
});

test('Prescribe Me draft signals exclude private fields and rejected copy', () => {
  const signals = buildPrescribeMeSignalsFromDistributionDraft(draft({ draft_status: 'approved' }));
  assert.equal(signals.platform, 'instagram');
  assert.equal(signals.draft_type, 'instagram_caption');
  assert.equal(signals.body, undefined);
  assert.equal(signals.private_prompt, undefined);
  assert.equal(signals.raw_private_chat, undefined);

  const rejectedSignals = buildPrescribeMeSignalsFromDistributionDraft(draft({ draft_status: 'rejected' }));
  assert.equal(rejectedSignals.draft_status, 'rejected');
  assert.equal(rejectedSignals.body, undefined);
});

test('raw distribution draft records are never public-readable', () => {
  assert.equal(publicDistributionDraftVisible(draft({ draft_status: 'approved' })), false);
  assert.equal(publicDistributionDraftVisible(draft({ draft_status: 'used' })), false);
});
