import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSafePrescribeMeMetadata,
  canApplyPostShowAsset,
  publicPostShowApplicationVisible,
  requiresPostShowApplicationReview,
  resolvePostShowApplicationType,
} from './broadcastPostShowPublisher.ts';
import type { PostShowAsset } from './broadcastPostShowTypes.ts';

const baseAsset: PostShowAsset = {
  id: 'asset-1',
  owner_user_id: 'owner-1',
  asset_type: 'clip_caption',
  asset_status: 'generated',
  visibility: 'private',
  title: 'Best moment',
  body: 'A clean caption.',
  platform: 'tradio',
  language: 'en',
  prompt_input: {},
  source_snapshot: {},
  moderation_snapshot: {},
  metadata: {},
  created_at: '2026-06-05T00:00:00Z',
  updated_at: '2026-06-05T00:00:00Z',
};

test('rejected and archived post-show assets cannot be applied', () => {
  assert.equal(canApplyPostShowAsset({ asset_status: 'rejected' }).allowed, false);
  assert.equal(canApplyPostShowAsset({ asset_status: 'archived' }).allowed, false);
  assert.equal(canApplyPostShowAsset({ asset_status: 'generated' }).allowed, true);
});

test('draft-only social, newsletter, and push assets resolve to non-sending draft application types', () => {
  assert.equal(resolvePostShowApplicationType('social_post'), 'social_draft');
  assert.equal(resolvePostShowApplicationType('newsletter_blurb'), 'newsletter_draft');
  assert.equal(resolvePostShowApplicationType('push_notification_copy'), 'push_copy_draft');
});

test('public targets require an approved asset before direct apply', () => {
  assert.equal(
    requiresPostShowApplicationReview({
      asset: baseAsset,
      applicationType: 'clip_caption',
      targetVisibility: 'public',
    }),
    true,
  );

  assert.equal(
    requiresPostShowApplicationReview({
      asset: { ...baseAsset, asset_status: 'approved' },
      applicationType: 'clip_caption',
      targetVisibility: 'public',
    }),
    false,
  );
});

test('moderation warnings require review before apply even for private targets', () => {
  assert.equal(
    requiresPostShowApplicationReview({
      asset: {
        ...baseAsset,
        metadata: { safety_warnings: ['possible rights claim'] },
      },
      applicationType: 'clip_caption',
      targetVisibility: 'private',
    }),
    true,
  );
});

test('safe Prescribe Me metadata excludes private source, prompt, and body copy', () => {
  const unsafeAsset: PostShowAsset = {
    ...baseAsset,
    body: 'Do not route this copy into recommendations.',
    source_snapshot: {
      mood_tags: ['late-night'],
      private_transcript: 'caller said something private',
      chat_count: 42,
    },
    metadata: {
      genre_tags: ['R&B'],
      audience_tags: ['night listeners'],
      prompt: 'hidden prompt',
      source_snapshot: { unsafe: true },
    },
  };

  const safe = buildSafePrescribeMeMetadata(unsafeAsset);

  assert.deepEqual(safe.mood_tags, ['late-night']);
  assert.deepEqual(safe.genre_tags, ['R&B']);
  assert.deepEqual(safe.audience_tags, ['night listeners']);
  assert.equal('private_transcript' in safe, false);
  assert.equal('prompt' in safe, false);
  assert.equal('body' in safe, false);
  assert.equal('source_snapshot' in safe, false);
});

test('public read filter only exposes applied or approved public copy on published targets', () => {
  assert.equal(
    publicPostShowApplicationVisible({
      applicationStatus: 'applied',
      applicationType: 'replay_blurb',
      targetVisibility: 'public',
      targetStatus: 'published',
    }),
    true,
  );
  assert.equal(
    publicPostShowApplicationVisible({
      applicationStatus: 'draft',
      applicationType: 'replay_blurb',
      targetVisibility: 'public',
      targetStatus: 'published',
    }),
    false,
  );
  assert.equal(
    publicPostShowApplicationVisible({
      applicationStatus: 'applied',
      applicationType: 'social_draft',
      targetVisibility: 'public',
      targetStatus: 'published',
    }),
    false,
  );
});
