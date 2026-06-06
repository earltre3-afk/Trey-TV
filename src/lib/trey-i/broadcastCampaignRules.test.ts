import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildCampaignInsightSummary,
  buildCampaignRecommendations,
  buildPrescribeMeCampaignSignals,
  deriveInternalCampaignMetrics,
  normalizeManualCampaignMetric,
} from './broadcastCampaignRules.ts';
import type {
  CampaignAssetSnapshot,
  CampaignClipSnapshot,
  CampaignDraftSnapshot,
  CampaignMetric,
} from './broadcastCampaignTypes.ts';

const now = '2026-06-05T12:00:00.000Z';

function draft(overrides: Partial<CampaignDraftSnapshot> = {}): CampaignDraftSnapshot {
  return {
    id: 'draft-1',
    owner_user_id: 'owner-1',
    channel_id: 'channel-1',
    clip_id: 'clip-1',
    asset_id: 'asset-1',
    draft_type: 'instagram_caption',
    draft_status: 'used',
    platform: 'instagram',
    title: 'Replay moment',
    copied_count: 3,
    created_at: '2026-06-01T12:00:00.000Z',
    updated_at: now,
    metadata: {
      marked_used: true,
      mood_tags: ['warm'],
      private_prompt: 'never expose',
    },
    source_snapshot: {
      genre_tags: ['r&b'],
      audience_tags: ['night listeners'],
      storage_path: 'private/audio.wav',
    },
    ...overrides,
  };
}

function clip(overrides: Partial<CampaignClipSnapshot> = {}): CampaignClipSnapshot {
  return {
    id: 'clip-1',
    owner_user_id: 'owner-1',
    channel_id: 'channel-1',
    title: 'The bridge',
    clip_status: 'published',
    visibility: 'public',
    duration_seconds: 42,
    mood_tags: ['warm'],
    genre_tags: ['r&b'],
    audience_tags: ['night listeners'],
    published_at: '2026-06-01T12:00:00.000Z',
    created_at: '2026-06-01T12:00:00.000Z',
    ...overrides,
  };
}

function asset(overrides: Partial<CampaignAssetSnapshot> = {}): CampaignAssetSnapshot {
  return {
    id: 'asset-1',
    owner_user_id: 'owner-1',
    channel_id: 'channel-1',
    clip_id: 'clip-1',
    asset_type: 'clip_caption',
    asset_status: 'approved',
    platform: 'instagram',
    tone: 'warm',
    created_at: '2026-06-01T12:00:00.000Z',
    updated_at: now,
    metadata: {
      mood_tags: ['warm'],
      prompt_input: 'private prompt',
      provider_secret: 'private secret',
    },
    source_snapshot: {
      genre_tags: ['r&b'],
      private_chat: 'private chat',
      caller_identity: 'private caller',
    },
    ...overrides,
  };
}

function metric(overrides: Partial<CampaignMetric> = {}): CampaignMetric {
  return {
    id: 'metric-1',
    owner_user_id: 'owner-1',
    channel_id: 'channel-1',
    clip_id: 'clip-1',
    metric_source: 'public_replay',
    platform: 'tradio',
    metric_type: 'clip_play',
    metric_value: 8,
    metric_unit: 'plays',
    entered_manually: false,
    source_snapshot: {},
    metadata: {},
    measured_at: now,
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

test('manual external metrics are always marked manual and private metadata is removed', () => {
  const normalized = normalizeManualCampaignMetric({
    platform: 'instagram',
    metric_type: 'manual_views',
    metric_value: 250,
    metric_unit: 'views',
    clip_id: 'clip-1',
    measured_at: now,
    note: 'Creator-entered insights',
    metric_source: 'tradio',
    entered_manually: false,
    source_snapshot: { private_prompt: 'do not keep' },
    metadata: { body: 'private draft copy', storage_path: 'private/file.mp3' },
  } as never);

  assert.equal(normalized.metric_source, 'creator_manual');
  assert.equal(normalized.entered_manually, true);
  assert.deepEqual(normalized.source_snapshot, {});
  assert.deepEqual(normalized.metadata, { note: 'Creator-entered insights' });
});

test('derived campaign metrics never invent external platform performance', () => {
  const derived = deriveInternalCampaignMetrics({
    drafts: [draft()],
    measured_at: now,
  });

  assert.deepEqual(
    derived.map((entry) => entry.metric_type).sort(),
    ['draft_copied', 'draft_marked_used'],
  );
  assert.ok(derived.every((entry) => entry.metric_source === 'distribution_desk'));
  assert.ok(derived.every((entry) => !entry.metric_type.startsWith('manual_')));
});

test('rejected and archived assets are excluded from campaign insight surfaces', () => {
  const summary = buildCampaignInsightSummary({
    metrics: [metric()],
    drafts: [draft()],
    clips: [clip()],
    assets: [
      asset(),
      asset({ id: 'asset-rejected', asset_status: 'rejected', asset_type: 'social_post' }),
      asset({ id: 'asset-archived', asset_status: 'archived', asset_type: 'replay_blurb' }),
    ],
    now: new Date(now),
  });

  assert.deepEqual(summary.top_asset_types.map((entry) => entry.asset_type), ['clip_caption']);
  assert.equal(summary.overview.eligible_assets, 1);
});

test('campaign recommendations explain the data behind each action', () => {
  const summary = buildCampaignInsightSummary({
    metrics: [
      metric(),
      metric({
        id: 'metric-2',
        metric_source: 'creator_manual',
        platform: 'instagram',
        metric_type: 'manual_likes',
        metric_value: 25,
        entered_manually: true,
      }),
    ],
    drafts: [draft()],
    clips: [clip()],
    assets: [asset()],
    now: new Date(now),
  });

  const recommendations = buildCampaignRecommendations(summary);

  assert.ok(recommendations.length > 0);
  assert.ok(recommendations.every((entry) => entry.basis.trim().length > 0));
  assert.ok(recommendations.every((entry) => entry.evidence_count > 0));
});

test('Prescribe Me campaign signals contain aggregate allowlisted data only', () => {
  const summary = buildCampaignInsightSummary({
    metrics: [metric()],
    drafts: [draft()],
    clips: [clip()],
    assets: [asset()],
    now: new Date(now),
  });

  const signals = buildPrescribeMeCampaignSignals(summary);
  const serialized = JSON.stringify(signals);

  assert.equal(signals.top_platform, 'instagram');
  assert.deepEqual(signals.mood_tags, ['warm']);
  assert.deepEqual(signals.emotional_tones, ['warm']);
  assert.deepEqual(signals.approved_content_categories, ['clip_caption']);
  assert.doesNotMatch(
    serialized,
    /private_prompt|prompt_input|private_chat|caller_identity|storage_path|provider_secret|body/i,
  );
});
