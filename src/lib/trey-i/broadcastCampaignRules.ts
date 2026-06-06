import type {
  CampaignAssetSnapshot,
  CampaignClipPerformance,
  CampaignClipSnapshot,
  CampaignDraftPerformance,
  CampaignDraftSnapshot,
  CampaignInsightSummary,
  CampaignMetric,
  CampaignMetricType,
  CampaignPlatformPerformance,
  CampaignPrescribeSignals,
  CampaignRecommendation,
  CampaignReusablePerformer,
  CampaignTagCategory,
  CampaignTagPerformance,
  CampaignUnderperformer,
  DerivedCampaignMetric,
  ManualCampaignMetricInput,
  NormalizedManualCampaignMetric,
} from './broadcastCampaignTypes';
import type { PostShowJsonObject } from './broadcastPostShowTypes';

const MANUAL_METRIC_TYPES = new Set<CampaignMetricType>([
  'manual_views',
  'manual_likes',
  'manual_comments',
  'manual_shares',
  'manual_saves',
  'manual_clicks',
  'follower_gain',
]);

const EXCLUDED_ASSET_STATUSES = new Set(['rejected', 'archived']);
const MANUAL_ENGAGEMENT_TYPES = new Set<CampaignMetricType>([
  'manual_likes',
  'manual_comments',
  'manual_shares',
  'manual_saves',
  'manual_clicks',
]);
const PLAY_TYPES = new Set<CampaignMetricType>(['clip_play', 'replay_play', 'manual_views']);

export function normalizeManualCampaignMetric(
  input: ManualCampaignMetricInput,
): NormalizedManualCampaignMetric {
  if (!MANUAL_METRIC_TYPES.has(input.metric_type)) {
    throw new Error('Only creator-entered external metric types are allowed');
  }

  const metricValue = Number(input.metric_value);
  if (!Number.isFinite(metricValue) || metricValue < 0) {
    throw new Error('Metric value must be a non-negative number');
  }

  const measuredAt = input.measured_at ? new Date(input.measured_at) : new Date();
  if (Number.isNaN(measuredAt.getTime())) {
    throw new Error('Measured date is invalid');
  }

  const note = cleanText(input.note, 240);
  const metadata: PostShowJsonObject = {};
  if (note) metadata.note = note;

  return {
    channel_id: cleanId(input.channel_id),
    clip_id: cleanId(input.clip_id),
    recording_id: cleanId(input.recording_id),
    asset_id: cleanId(input.asset_id),
    application_id: cleanId(input.application_id),
    distribution_draft_id: cleanId(input.distribution_draft_id),
    metric_source: 'creator_manual',
    platform: cleanText(input.platform, 40).toLowerCase() || 'external',
    metric_type: input.metric_type,
    metric_value: metricValue,
    metric_unit: cleanText(input.metric_unit, 32) || null,
    entered_manually: true,
    source_snapshot: {},
    metadata,
    measured_at: measuredAt.toISOString(),
  };
}

export function deriveInternalCampaignMetrics(input: {
  drafts: CampaignDraftSnapshot[];
  measured_at?: string;
}): DerivedCampaignMetric[] {
  const measuredAt = input.measured_at ?? new Date().toISOString();
  const metrics: DerivedCampaignMetric[] = [];

  for (const draft of input.drafts) {
    if (draft.copied_count > 0) {
      metrics.push({
        channel_id: draft.channel_id,
        clip_id: draft.clip_id,
        recording_id: draft.recording_id,
        asset_id: draft.asset_id,
        application_id: draft.application_id,
        distribution_draft_id: draft.id,
        metric_source: 'distribution_desk',
        platform: draft.platform,
        metric_type: 'draft_copied',
        metric_value: draft.copied_count,
        metric_unit: 'copies',
        entered_manually: false,
        source_snapshot: {},
        metadata: { draft_type: draft.draft_type },
        measured_at: measuredAt,
      });
    }

    if (draft.draft_status === 'used' || draft.metadata.marked_used === true) {
      metrics.push({
        channel_id: draft.channel_id,
        clip_id: draft.clip_id,
        recording_id: draft.recording_id,
        asset_id: draft.asset_id,
        application_id: draft.application_id,
        distribution_draft_id: draft.id,
        metric_source: 'distribution_desk',
        platform: draft.platform,
        metric_type: 'draft_marked_used',
        metric_value: 1,
        metric_unit: 'uses',
        entered_manually: false,
        source_snapshot: {},
        metadata: { draft_type: draft.draft_type },
        measured_at: measuredAt,
      });
    }
  }

  return metrics;
}

export function buildCampaignInsightSummary(input: {
  metrics: CampaignMetric[];
  drafts: CampaignDraftSnapshot[];
  clips: CampaignClipSnapshot[];
  assets: CampaignAssetSnapshot[];
  now?: Date;
}): CampaignInsightSummary {
  const now = input.now ?? new Date();
  const assets = input.assets.filter((entry) => !EXCLUDED_ASSET_STATUSES.has(entry.asset_status));
  const approvedAssets = assets.filter(
    (entry) => entry.asset_status === 'approved' || entry.asset_status === 'published',
  );
  const publishedClips = input.clips.filter(
    (entry) => entry.clip_status === 'published' && entry.visibility === 'public',
  );

  const topClips = buildClipPerformance(publishedClips, input.metrics);
  const topDrafts = buildDraftPerformance(input.drafts, input.metrics);
  const topAssetTypes = buildAssetTypePerformance(assets, input.drafts, input.metrics);
  const platforms = buildPlatformPerformance(input.drafts, input.metrics);
  const tagInsights = buildTagPerformance(publishedClips, input.drafts, assets, input.metrics);
  const underperforming = buildUnderperformers(assets, input.drafts, publishedClips, input.metrics, now);
  const reusable = buildReusablePerformers(topClips, topDrafts);

  const base = {
    overview: {
      total_metrics: input.metrics.length,
      manual_metrics: input.metrics.filter((entry) => entry.entered_manually).length,
      draft_copies: input.drafts.reduce((sum, entry) => sum + positive(entry.copied_count), 0),
      drafts_used: input.drafts.filter(
        (entry) => entry.draft_status === 'used' || entry.metadata.marked_used === true,
      ).length,
      published_clips: publishedClips.length,
      clip_plays: sumMetrics(input.metrics, 'clip_play'),
      replay_plays: sumMetrics(input.metrics, 'replay_play'),
      eligible_assets: assets.length,
    },
    top_clips: topClips,
    top_drafts: topDrafts,
    top_asset_types: topAssetTypes,
    platforms,
    tag_insights: tagInsights,
    emotional_tones: Array.from(
      new Set(
        approvedAssets
          .map((entry) => cleanText(entry.tone, 60).toLowerCase())
          .filter(Boolean),
      ),
    ).slice(0, 8),
    approved_content_categories: Array.from(
      new Set(approvedAssets.map((entry) => entry.asset_type)),
    ).slice(0, 8),
    underperforming_assets: underperforming,
    reusable_high_performers: reusable,
  };

  const recommendations = buildCampaignRecommendations(base);
  const prescribeSignals = buildPrescribeMeCampaignSignals(base);

  return {
    ...base,
    recommendations,
    prescribe_me_signals: prescribeSignals,
  };
}

export function buildCampaignRecommendations(
  summary: Pick<
    CampaignInsightSummary,
    | 'overview'
    | 'top_clips'
    | 'top_drafts'
    | 'platforms'
    | 'tag_insights'
    | 'underperforming_assets'
    | 'reusable_high_performers'
  >,
): CampaignRecommendation[] {
  const recommendations: CampaignRecommendation[] = [];
  const topPlatform = summary.platforms[0];
  const topClip = summary.top_clips[0];
  const topTag = summary.tag_insights[0];
  const reusable = summary.reusable_high_performers[0];
  const underperformer = summary.underperforming_assets[0];

  if (topPlatform && topPlatform.score > 0) {
    recommendations.push({
      id: `platform-${topPlatform.platform}`,
      kind: 'next_action',
      title: `Prepare the next ${topPlatform.platform} draft`,
      action: `Reuse the strongest approved format for ${topPlatform.platform}; keep it as a draft until you choose to post it.`,
      basis: `${topPlatform.copies} copies, ${topPlatform.used} marked-used drafts, and ${formatNumber(topPlatform.manual_metric_total)} creator-entered engagement points.`,
      evidence_count: Math.max(1, topPlatform.drafts + topPlatform.copies + topPlatform.used),
    });
  }

  if (topClip && topClip.score > 0) {
    recommendations.push({
      id: `clip-${topClip.id}`,
      kind: 'reuse',
      title: `Reuse the pattern from "${topClip.title}"`,
      action: 'Create a follow-up clip or replay blurb using the same approved tags and a similar duration.',
      basis: `${formatNumber(topClip.plays)} recorded plays, ${formatNumber(topClip.reactions)} reactions, and ${formatNumber(topClip.manual_engagement)} manual engagement points.`,
      evidence_count: Math.max(1, topClip.plays + topClip.reactions + topClip.manual_engagement),
    });
  }

  if (topTag && topTag.score > 0) {
    recommendations.push({
      id: `tag-${topTag.category}-${topTag.tag}`,
      kind: 'follow_up',
      title: `Plan a follow-up around ${topTag.tag}`,
      action: `Use the ${topTag.category} tag "${topTag.tag}" as a planning signal for the next approved show or clip.`,
      basis: `${topTag.evidence_count} eligible assets, clips, drafts, or metrics contributed to this aggregate tag score.`,
      evidence_count: topTag.evidence_count,
    });
  }

  if (reusable && !recommendations.some((entry) => entry.id === `clip-${reusable.id}`)) {
    recommendations.push({
      id: `reuse-${reusable.entity_type}-${reusable.id}`,
      kind: 'reuse',
      title: `Reuse ${reusable.label}`,
      action: 'Duplicate the successful structure into a new private draft and review it before use.',
      basis: reusable.basis,
      evidence_count: Math.max(1, Math.round(reusable.score)),
    });
  }

  if (underperformer) {
    recommendations.push({
      id: `warning-${underperformer.entity_type}-${underperformer.id}`,
      kind: 'warning',
      title: `Review ${underperformer.label}`,
      action: 'Refresh, archive, or connect this item to a clearer distribution plan.',
      basis: underperformer.basis,
      evidence_count: 1,
    });
  }

  if (recommendations.length === 0 && summary.overview.eligible_assets > 0) {
    recommendations.push({
      id: 'collect-first-signal',
      kind: 'next_action',
      title: 'Collect the first campaign signal',
      action: 'Copy or mark an approved distribution draft used, or enter a real external metric manually.',
      basis: `${summary.overview.eligible_assets} eligible assets exist, but no performance event has been recorded yet.`,
      evidence_count: summary.overview.eligible_assets,
    });
  }

  return recommendations.slice(0, 6);
}

export function buildPrescribeMeCampaignSignals(
  summary: Pick<
    CampaignInsightSummary,
    | 'overview'
    | 'top_clips'
    | 'top_drafts'
    | 'platforms'
    | 'tag_insights'
    | 'emotional_tones'
    | 'approved_content_categories'
  >,
): CampaignPrescribeSignals {
  const completionRates = summary.top_clips
    .map((entry) => entry.completion_rate)
    .filter((entry): entry is number => entry !== null);
  const reactionTotal = summary.top_clips.reduce((sum, entry) => sum + entry.reactions, 0);
  const topDraftType = summary.top_drafts[0]?.draft_type;
  const durationCandidates = summary.top_clips
    .map((entry) => entry.duration_seconds)
    .filter((entry): entry is number => typeof entry === 'number' && entry > 0);

  return {
    top_platform: summary.platforms[0]?.platform,
    top_draft_type: topDraftType,
    preferred_clip_duration_seconds:
      durationCandidates.length > 0 ? roundedAverage(durationCandidates) : undefined,
    replay_eligible: summary.overview.published_clips > 0,
    mood_tags: topTags(summary.tag_insights, 'mood'),
    genre_tags: topTags(summary.tag_insights, 'genre'),
    audience_tags: topTags(summary.tag_insights, 'audience'),
    emotional_tones: summary.emotional_tones,
    approved_content_categories: summary.approved_content_categories,
    average_completion_rate:
      completionRates.length > 0 ? roundedAverage(completionRates) : undefined,
    reaction_intensity:
      reactionTotal >= 50 ? 'high' : reactionTotal >= 15 ? 'medium' : reactionTotal > 0 ? 'low' : 'none',
    draft_copy_count: summary.overview.draft_copies,
    draft_marked_used_count: summary.overview.drafts_used,
    follow_up_topic_tags: summary.tag_insights.slice(0, 5).map((entry) => entry.tag),
    evidence_count:
      summary.overview.total_metrics +
      summary.overview.draft_copies +
      summary.overview.drafts_used +
      summary.overview.published_clips,
  };
}

function buildClipPerformance(
  clips: CampaignClipSnapshot[],
  metrics: CampaignMetric[],
): CampaignClipPerformance[] {
  return clips
    .map((entry) => {
      const linked = metrics.filter((metric) => metric.clip_id === entry.id);
      const plays = linked
        .filter((metric) => PLAY_TYPES.has(metric.metric_type))
        .reduce((sum, metric) => sum + positive(metric.metric_value), 0);
      const reactions = linked
        .filter((metric) => metric.metric_type === 'reaction_count')
        .reduce((sum, metric) => sum + positive(metric.metric_value), 0);
      const manualEngagement = linked
        .filter((metric) => MANUAL_ENGAGEMENT_TYPES.has(metric.metric_type))
        .reduce((sum, metric) => sum + positive(metric.metric_value), 0);
      const completionValues = linked
        .filter((metric) => metric.metric_type === 'completion_rate')
        .map((metric) => positive(metric.metric_value));
      const completionRate =
        completionValues.length > 0 ? roundedAverage(completionValues) : null;

      return {
        id: entry.id,
        title: entry.title,
        plays,
        completion_rate: completionRate,
        reactions,
        manual_engagement: manualEngagement,
        score: plays + reactions * 2 + manualEngagement * 1.5 + (completionRate ?? 0) / 10,
        duration_seconds:
          typeof entry.duration_seconds === 'number' ? entry.duration_seconds : null,
        mood_tags: cleanTags(entry.mood_tags),
        genre_tags: cleanTags(entry.genre_tags),
        audience_tags: cleanTags(entry.audience_tags),
      };
    })
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, 8);
}

function buildDraftPerformance(
  drafts: CampaignDraftSnapshot[],
  metrics: CampaignMetric[],
): CampaignDraftPerformance[] {
  return drafts
    .filter((entry) => entry.draft_status !== 'rejected' && entry.draft_status !== 'archived')
    .map((entry) => {
      const manualEngagement = metrics
        .filter(
          (metric) =>
            metric.distribution_draft_id === entry.id &&
            MANUAL_ENGAGEMENT_TYPES.has(metric.metric_type),
        )
        .reduce((sum, metric) => sum + positive(metric.metric_value), 0);
      const markedUsed = entry.draft_status === 'used' || entry.metadata.marked_used === true;
      return {
        id: entry.id,
        title: entry.title?.trim() || formatLabel(entry.draft_type),
        platform: entry.platform,
        draft_type: entry.draft_type,
        copied_count: positive(entry.copied_count),
        marked_used: markedUsed,
        manual_engagement: manualEngagement,
        score: positive(entry.copied_count) + (markedUsed ? 5 : 0) + manualEngagement,
      };
    })
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, 8);
}

function buildAssetTypePerformance(
  assets: CampaignAssetSnapshot[],
  drafts: CampaignDraftSnapshot[],
  metrics: CampaignMetric[],
) {
  const grouped = new Map<
    string,
    { count: number; linked_drafts: number; manual_engagement: number }
  >();

  for (const asset of assets) {
    const current = grouped.get(asset.asset_type) ?? {
      count: 0,
      linked_drafts: 0,
      manual_engagement: 0,
    };
    current.count += 1;
    current.linked_drafts += drafts.filter(
      (draft) => draft.asset_id === asset.id && !['rejected', 'archived'].includes(draft.draft_status),
    ).length;
    current.manual_engagement += metrics
      .filter(
        (metric) => metric.asset_id === asset.id && MANUAL_ENGAGEMENT_TYPES.has(metric.metric_type),
      )
      .reduce((sum, metric) => sum + positive(metric.metric_value), 0);
    grouped.set(asset.asset_type, current);
  }

  return Array.from(grouped.entries())
    .map(([assetType, value]) => ({
      asset_type: assetType as CampaignAssetSnapshot['asset_type'],
      ...value,
      score: value.count + value.linked_drafts * 2 + value.manual_engagement,
    }))
    .sort((a, b) => b.score - a.score || a.asset_type.localeCompare(b.asset_type))
    .slice(0, 8);
}

function buildPlatformPerformance(
  drafts: CampaignDraftSnapshot[],
  metrics: CampaignMetric[],
): CampaignPlatformPerformance[] {
  const platforms = new Map<string, CampaignPlatformPerformance>();
  const ensure = (platform: string) => {
    const key = platform || 'unknown';
    const existing = platforms.get(key);
    if (existing) return existing;
    const created: CampaignPlatformPerformance = {
      platform: key,
      drafts: 0,
      copies: 0,
      used: 0,
      manual_metric_total: 0,
      score: 0,
    };
    platforms.set(key, created);
    return created;
  };

  for (const draft of drafts.filter(
    (entry) => entry.draft_status !== 'rejected' && entry.draft_status !== 'archived',
  )) {
    const platform = ensure(draft.platform);
    platform.drafts += 1;
    platform.copies += positive(draft.copied_count);
    if (draft.draft_status === 'used' || draft.metadata.marked_used === true) platform.used += 1;
  }

  for (const metric of metrics.filter((entry) => entry.entered_manually)) {
    ensure(metric.platform).manual_metric_total += positive(metric.metric_value);
  }

  return Array.from(platforms.values())
    .map((entry) => ({
      ...entry,
      score: entry.copies + entry.used * 5 + entry.manual_metric_total,
    }))
    .sort((a, b) => b.score - a.score || a.platform.localeCompare(b.platform));
}

function buildTagPerformance(
  clips: CampaignClipSnapshot[],
  drafts: CampaignDraftSnapshot[],
  assets: CampaignAssetSnapshot[],
  metrics: CampaignMetric[],
): CampaignTagPerformance[] {
  const scores = new Map<string, CampaignTagPerformance>();

  const add = (tag: string, category: CampaignTagCategory, score: number) => {
    const normalized = cleanText(tag, 60).toLowerCase();
    if (!normalized) return;
    const key = `${category}:${normalized}`;
    const existing = scores.get(key) ?? {
      tag: normalized,
      category,
      score: 0,
      evidence_count: 0,
    };
    existing.score += score;
    existing.evidence_count += 1;
    scores.set(key, existing);
  };

  for (const clip of clips) {
    const linkedScore = metrics
      .filter((metric) => metric.clip_id === clip.id)
      .reduce((sum, metric) => sum + positive(metric.metric_value), 0);
    for (const tag of clip.mood_tags) add(tag, 'mood', 1 + linkedScore);
    for (const tag of clip.genre_tags) add(tag, 'genre', 1 + linkedScore);
    for (const tag of clip.audience_tags) add(tag, 'audience', 1 + linkedScore);
  }

  for (const draft of drafts.filter(
    (entry) => entry.draft_status !== 'rejected' && entry.draft_status !== 'archived',
  )) {
    const score = 1 + positive(draft.copied_count) + (draft.draft_status === 'used' ? 5 : 0);
    addTagsFromJson(draft.metadata, score, add);
    addTagsFromJson(draft.source_snapshot, score, add);
  }

  for (const asset of assets) {
    addTagsFromJson(asset.metadata, 1, add);
    addTagsFromJson(asset.source_snapshot, 1, add);
  }

  return Array.from(scores.values())
    .sort((a, b) => b.score - a.score || a.tag.localeCompare(b.tag))
    .slice(0, 12);
}

function buildUnderperformers(
  assets: CampaignAssetSnapshot[],
  drafts: CampaignDraftSnapshot[],
  clips: CampaignClipSnapshot[],
  metrics: CampaignMetric[],
  now: Date,
): CampaignUnderperformer[] {
  const threshold = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const underperformers: CampaignUnderperformer[] = [];

  for (const asset of assets) {
    if (new Date(asset.created_at).getTime() > threshold) continue;
    const linkedDrafts = drafts.filter((draft) => draft.asset_id === asset.id);
    const evidence =
      linkedDrafts.reduce((sum, draft) => sum + positive(draft.copied_count), 0) +
      metrics
        .filter((metric) => metric.asset_id === asset.id)
        .reduce((sum, metric) => sum + positive(metric.metric_value), 0);
    if (evidence === 0) {
      underperformers.push({
        id: asset.id,
        entity_type: 'asset',
        label: formatLabel(asset.asset_type),
        basis: 'This eligible asset is at least 7 days old with no recorded copy, use, play, or manual metric.',
      });
    }
  }

  for (const draft of drafts) {
    if (['rejected', 'archived'].includes(draft.draft_status)) continue;
    if (new Date(draft.created_at).getTime() > threshold) continue;
    const metricTotal = metrics
      .filter((metric) => metric.distribution_draft_id === draft.id)
      .reduce((sum, metric) => sum + positive(metric.metric_value), 0);
    if (draft.copied_count === 0 && draft.draft_status !== 'used' && metricTotal === 0) {
      underperformers.push({
        id: draft.id,
        entity_type: 'draft',
        label: draft.title?.trim() || formatLabel(draft.draft_type),
        basis: 'This draft is at least 7 days old and has not been copied, marked used, or linked to a manual metric.',
      });
    }
  }

  for (const clip of clips) {
    if (new Date(clip.published_at ?? clip.created_at).getTime() > threshold) continue;
    const playTotal = metrics
      .filter((metric) => metric.clip_id === clip.id && PLAY_TYPES.has(metric.metric_type))
      .reduce((sum, metric) => sum + positive(metric.metric_value), 0);
    if (playTotal === 0) {
      underperformers.push({
        id: clip.id,
        entity_type: 'clip',
        label: clip.title,
        basis: 'This published clip is at least 7 days old with no recorded Tradio or manual play metric.',
      });
    }
  }

  return underperformers.slice(0, 8);
}

function buildReusablePerformers(
  clips: CampaignClipPerformance[],
  drafts: CampaignDraftPerformance[],
): CampaignReusablePerformer[] {
  return [
    ...clips
      .filter((entry) => entry.score > 0)
      .map((entry) => ({
        id: entry.id,
        entity_type: 'clip' as const,
        label: entry.title,
        score: entry.score,
        basis: `${formatNumber(entry.plays)} plays and ${formatNumber(entry.manual_engagement)} manual engagement points.`,
      })),
    ...drafts
      .filter((entry) => entry.score > 0)
      .map((entry) => ({
        id: entry.id,
        entity_type: 'draft' as const,
        label: entry.title,
        score: entry.score,
        basis: `${entry.copied_count} copies${entry.marked_used ? ' and marked used' : ''}.`,
      })),
  ]
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
    .slice(0, 8);
}

function addTagsFromJson(
  source: PostShowJsonObject,
  score: number,
  add: (tag: string, category: CampaignTagCategory, score: number) => void,
) {
  for (const tag of jsonTags(source.mood_tags)) add(tag, 'mood', score);
  for (const tag of jsonTags(source.genre_tags)) add(tag, 'genre', score);
  for (const tag of jsonTags(source.audience_tags)) add(tag, 'audience', score);
}

function jsonTags(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string')
    : [];
}

function topTags(tags: CampaignTagPerformance[], category: CampaignTagCategory): string[] {
  return tags
    .filter((entry) => entry.category === category)
    .slice(0, 5)
    .map((entry) => entry.tag);
}

function cleanTags(tags: string[]): string[] {
  return Array.from(new Set(tags.map((entry) => cleanText(entry, 60).toLowerCase()).filter(Boolean))).slice(
    0,
    12,
  );
}

function sumMetrics(metrics: CampaignMetric[], type: CampaignMetricType): number {
  return metrics
    .filter((entry) => entry.metric_type === type)
    .reduce((sum, entry) => sum + positive(entry.metric_value), 0);
}

function roundedAverage(values: number[]): number {
  return Math.round((values.reduce((sum, entry) => sum + entry, 0) / values.length) * 100) / 100;
}

function positive(value: number): number {
  return Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
}

function cleanText(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, maxLength) : '';
}

function cleanId(value: unknown): string | null {
  const cleaned = cleanText(value, 80);
  return cleaned || null;
}

function formatLabel(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
