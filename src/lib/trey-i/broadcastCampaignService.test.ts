import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CAMPAIGN_ASSET_COLUMNS,
  CAMPAIGN_CLIP_COLUMNS,
  CAMPAIGN_DRAFT_COLUMNS,
  sanitizeCampaignAssetRow,
  sanitizeCampaignDraftRow,
  sanitizeCampaignMetricRow,
  verifyCampaignUser,
} from './broadcastCampaignService.ts';

test('campaign database queries use explicit safe field allowlists', () => {
  assert.doesNotMatch(CAMPAIGN_DRAFT_COLUMNS, /\*/);
  assert.doesNotMatch(CAMPAIGN_DRAFT_COLUMNS, /\b(body|review_notes|moderation_snapshot)\b/);
  assert.doesNotMatch(CAMPAIGN_ASSET_COLUMNS, /\b(body|prompt_input|ai_provider|ai_model)\b/);
  assert.doesNotMatch(
    CAMPAIGN_CLIP_COLUMNS,
    /\b(storage_path|audio_url|transcript_text|engagement_snapshot|rights_snapshot|review_notes|metadata)\b/,
  );
});

test('campaign row sanitizers retain aggregate tags and remove private fields', () => {
  const draft = sanitizeCampaignDraftRow({
    id: 'draft-1',
    owner_user_id: 'owner-1',
    draft_type: 'instagram_caption',
    draft_status: 'used',
    platform: 'instagram',
    title: 'Replay',
    body: 'private draft body',
    copied_count: 2,
    created_at: '2026-06-01T00:00:00.000Z',
    updated_at: '2026-06-05T00:00:00.000Z',
    metadata: {
      marked_used: true,
      mood_tags: ['warm'],
      prompt_input: 'private',
    },
    source_snapshot: {
      genre_tags: ['r&b'],
      storage_path: 'private/audio.wav',
      private_chat: 'private',
    },
  });

  const asset = sanitizeCampaignAssetRow({
    id: 'asset-1',
    owner_user_id: 'owner-1',
    asset_type: 'clip_caption',
    asset_status: 'approved',
    body: 'private asset body',
    created_at: '2026-06-01T00:00:00.000Z',
    updated_at: '2026-06-05T00:00:00.000Z',
    metadata: {
      mood_tags: ['warm'],
      emotional_tone: 'hopeful',
      provider_secret: 'private',
    },
    source_snapshot: {
      audience_tags: ['night listeners'],
      caller_identity: 'private',
    },
  });

  assert.deepEqual(draft.metadata, { marked_used: true, mood_tags: ['warm'] });
  assert.deepEqual(draft.source_snapshot, { genre_tags: ['r&b'] });
  assert.deepEqual(asset.metadata, {
    mood_tags: ['warm'],
    emotional_tone: 'hopeful',
  });
  assert.deepEqual(asset.source_snapshot, { audience_tags: ['night listeners'] });
  assert.equal('body' in draft, false);
  assert.equal('body' in asset, false);
});

test('campaign metric history exposes only allowlisted note and category metadata', () => {
  const metric = sanitizeCampaignMetricRow({
    id: 'metric-1',
    owner_user_id: 'owner-1',
    metric_source: 'creator_manual',
    platform: 'instagram',
    metric_type: 'manual_views',
    metric_value: 100,
    entered_manually: true,
    source_snapshot: { private_session: 'private' },
    metadata: {
      note: 'Creator-entered',
      draft_type: 'instagram_caption',
      body: 'private copy',
      prompt: 'private prompt',
    },
    measured_at: '2026-06-05T00:00:00.000Z',
    created_at: '2026-06-05T00:00:00.000Z',
    updated_at: '2026-06-05T00:00:00.000Z',
  });

  assert.deepEqual(metric.source_snapshot, {});
  assert.deepEqual(metric.metadata, {
    note: 'Creator-entered',
    draft_type: 'instagram_caption',
  });
});

test('campaign access derives the user from the token and enforces admin access', async () => {
  const calls: Array<[string, unknown]> = [];
  const client = {
    auth: {
      getUser(token: string) {
        calls.push(['token', token]);
        return Promise.resolve({
          data: { user: token === 'valid-token' ? { id: 'user-1' } : null },
          error: token === 'valid-token' ? null : { message: 'invalid token' },
        });
      },
    },
    rpc(name: string, args: Record<string, unknown>) {
      calls.push([name, args]);
      return Promise.resolve({ data: args._user_id === 'admin-1', error: null });
    },
  };

  const creator = await verifyCampaignUser('valid-token', client);
  assert.deepEqual(creator, { userId: 'user-1', isAdmin: false });
  assert.deepEqual(calls[0], ['token', 'valid-token']);

  await assert.rejects(
    () => verifyCampaignUser('', client),
    /Sign in required/,
  );
  await assert.rejects(
    () => verifyCampaignUser('valid-token', client, true),
    /Admin access required/,
  );

  const adminClient = {
    ...client,
    auth: {
      getUser() {
        return Promise.resolve({ data: { user: { id: 'admin-1' } }, error: null });
      },
    },
  };
  assert.deepEqual(await verifyCampaignUser('admin-token', adminClient, true), {
    userId: 'admin-1',
    isAdmin: true,
  });
});
