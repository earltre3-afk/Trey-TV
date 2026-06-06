import { createServerFn } from '@tanstack/react-start';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import {
  buildCampaignInsightSummary as buildCampaignInsightSummaryRules,
  normalizeManualCampaignMetric,
} from './broadcastCampaignRules';
import {
  CAMPAIGN_ASSET_COLUMNS,
  CAMPAIGN_CHANNEL_COLUMNS,
  CAMPAIGN_CLIP_COLUMNS,
  CAMPAIGN_DRAFT_COLUMNS,
  CAMPAIGN_METRIC_COLUMNS,
  sanitizeCampaignAssetRow,
  sanitizeCampaignClipRow,
  sanitizeCampaignDraftRow,
  sanitizeCampaignMetricRow,
  verifyCampaignUser,
  type CampaignAuthClient,
} from './broadcastCampaignService';
import type {
  AdminCampaignSummary,
  CampaignAssetSnapshot,
  CampaignChannelOption,
  CampaignClipSnapshot,
  CampaignDashboardData,
  CampaignDraftSnapshot,
  CampaignInsightSummary,
  CampaignMetric,
  CampaignMetricType,
  ManualCampaignMetricInput,
} from './broadcastCampaignTypes';

const supabase = supabaseAdmin as any;
const campaignAuthClient = supabaseAdmin as unknown as CampaignAuthClient;

type CampaignAccessInput = {
  accessToken: string;
  channel_id?: string;
};

type CampaignEntityInput = CampaignAccessInput & {
  clip_id?: string;
  draft_id?: string;
};

type CampaignRows = {
  metrics: CampaignMetric[];
  drafts: CampaignDraftSnapshot[];
  clips: CampaignClipSnapshot[];
  assets: CampaignAssetSnapshot[];
  channels: CampaignChannelOption[];
};

function validateAccessInput(input: Partial<CampaignAccessInput>): CampaignAccessInput {
  return {
    accessToken: typeof input?.accessToken === 'string' ? input.accessToken : '',
    channel_id: cleanOptional(input?.channel_id),
  };
}

function validateEntityInput(input: Partial<CampaignEntityInput>): CampaignEntityInput {
  return {
    ...validateAccessInput(input),
    clip_id: cleanOptional(input?.clip_id),
    draft_id: cleanOptional(input?.draft_id),
  };
}

function validateManualInput(input: Partial<ManualCampaignMetricInput>): ManualCampaignMetricInput {
  return {
    accessToken: typeof input?.accessToken === 'string' ? input.accessToken : '',
    metric_id: cleanOptional(input?.metric_id),
    channel_id: cleanOptional(input?.channel_id),
    clip_id: cleanOptional(input?.clip_id),
    recording_id: cleanOptional(input?.recording_id),
    asset_id: cleanOptional(input?.asset_id),
    application_id: cleanOptional(input?.application_id),
    distribution_draft_id: cleanOptional(input?.distribution_draft_id),
    platform: typeof input?.platform === 'string' ? input.platform : '',
    metric_type:
      typeof input?.metric_type === 'string' ? input.metric_type : 'manual_views',
    metric_value: Number(input?.metric_value ?? 0),
    metric_unit: typeof input?.metric_unit === 'string' ? input.metric_unit : '',
    measured_at: typeof input?.measured_at === 'string' ? input.measured_at : undefined,
    note: typeof input?.note === 'string' ? input.note : '',
  } as ManualCampaignMetricInput;
}

async function loadCampaignRows(
  ownerUserId: string,
  filters: { channel_id?: string; clip_id?: string; draft_id?: string } = {},
): Promise<CampaignRows> {
  let metricQuery = supabase
    .from('tradio_campaign_metrics')
    .select(CAMPAIGN_METRIC_COLUMNS)
    .eq('owner_user_id', ownerUserId)
    .order('measured_at', { ascending: false })
    .limit(500);
  let draftQuery = supabase
    .from('tradio_distribution_drafts')
    .select(CAMPAIGN_DRAFT_COLUMNS)
    .eq('owner_user_id', ownerUserId)
    .order('updated_at', { ascending: false })
    .limit(250);
  let clipQuery = supabase
    .from('tradio_live_highlight_clips')
    .select(CAMPAIGN_CLIP_COLUMNS)
    .eq('owner_user_id', ownerUserId)
    .order('created_at', { ascending: false })
    .limit(250);
  let assetQuery = supabase
    .from('tradio_post_show_assets')
    .select(CAMPAIGN_ASSET_COLUMNS)
    .eq('owner_user_id', ownerUserId)
    .order('updated_at', { ascending: false })
    .limit(250);

  if (filters.channel_id) {
    metricQuery = metricQuery.eq('channel_id', filters.channel_id);
    draftQuery = draftQuery.eq('channel_id', filters.channel_id);
    clipQuery = clipQuery.eq('channel_id', filters.channel_id);
    assetQuery = assetQuery.eq('channel_id', filters.channel_id);
  }
  if (filters.clip_id) {
    metricQuery = metricQuery.eq('clip_id', filters.clip_id);
    draftQuery = draftQuery.eq('clip_id', filters.clip_id);
    clipQuery = clipQuery.eq('id', filters.clip_id);
    assetQuery = assetQuery.eq('clip_id', filters.clip_id);
  }
  if (filters.draft_id) {
    metricQuery = metricQuery.eq('distribution_draft_id', filters.draft_id);
    draftQuery = draftQuery.eq('id', filters.draft_id);
  }

  const [metricsResult, draftsResult, clipsResult, assetsResult, channelsResult] =
    await Promise.all([
      metricQuery,
      draftQuery,
      clipQuery,
      assetQuery,
      supabase
        .from('tradio_broadcast_channels')
        .select(CAMPAIGN_CHANNEL_COLUMNS)
        .eq('owner_user_id', ownerUserId)
        .order('title', { ascending: true })
        .limit(100),
    ]);

  const firstError = [
    metricsResult.error,
    draftsResult.error,
    clipsResult.error,
    assetsResult.error,
    channelsResult.error,
  ].find(Boolean);
  if (firstError) throw new Error(firstError.message || 'Campaign data failed to load');

  return {
    metrics: (metricsResult.data || []).map((row: Record<string, unknown>) =>
      sanitizeCampaignMetricRow(row),
    ),
    drafts: (draftsResult.data || []).map((row: Record<string, unknown>) =>
      sanitizeCampaignDraftRow(row),
    ),
    clips: (clipsResult.data || []).map((row: Record<string, unknown>) =>
      sanitizeCampaignClipRow(row),
    ),
    assets: (assetsResult.data || []).map((row: Record<string, unknown>) =>
      sanitizeCampaignAssetRow(row),
    ),
    channels: (channelsResult.data || []).map((row: Record<string, unknown>) => ({
      id: String(row.id || ''),
      owner_user_id: String(row.owner_user_id || ''),
      title: String(row.title || 'Untitled channel'),
      slug: typeof row.slug === 'string' ? row.slug : null,
      visibility: typeof row.visibility === 'string' ? row.visibility : null,
      status: typeof row.status === 'string' ? row.status : null,
    })),
  };
}

function toDashboardData(
  rows: CampaignRows,
  selectedChannelId?: string,
): CampaignDashboardData {
  const summary = buildCampaignInsightSummaryRules({
    metrics: rows.metrics,
    drafts: rows.drafts,
    clips: rows.clips,
    assets: rows.assets,
  });
  return {
    ...summary,
    metrics: rows.metrics,
    channels: rows.channels,
    selected_channel_id: selectedChannelId ?? null,
  };
}

async function verifyEntityOwnership(
  userId: string,
  input: ManualCampaignMetricInput,
): Promise<void> {
  const references: Array<[string, string | undefined]> = [
    ['tradio_broadcast_channels', input.channel_id],
    ['tradio_live_highlight_clips', input.clip_id],
    ['tradio_live_recordings', input.recording_id],
    ['tradio_post_show_assets', input.asset_id],
    ['tradio_post_show_applications', input.application_id],
    ['tradio_distribution_drafts', input.distribution_draft_id],
  ];

  for (const [table, id] of references) {
    if (!id) continue;
    const { data, error } = await supabase
      .from(table)
      .select('owner_user_id')
      .eq('id', id)
      .maybeSingle();
    if (error || !data || data.owner_user_id !== userId) {
      throw new Error('Campaign metric target not found or not owned by this creator');
    }
  }
}

async function loadCreatorSummary(
  input: CampaignEntityInput,
): Promise<{ userId: string; summary: CampaignInsightSummary; rows: CampaignRows }> {
  const { userId } = await verifyCampaignUser(input.accessToken, campaignAuthClient);
  const rows = await loadCampaignRows(userId, {
    channel_id: input.channel_id,
    clip_id: input.clip_id,
    draft_id: input.draft_id,
  });
  return {
    userId,
    rows,
    summary: buildCampaignInsightSummaryRules(rows),
  };
}

export const listCampaignDashboard = createServerFn({ method: 'POST' })
  .inputValidator(validateAccessInput)
  .handler(
    async ({
      data,
    }): Promise<{ dashboard?: CampaignDashboardData; error?: string }> => {
      try {
        const { userId } = await verifyCampaignUser(data.accessToken, campaignAuthClient);
        const rows = await loadCampaignRows(userId, { channel_id: data.channel_id });
        return { dashboard: toDashboardData(rows, data.channel_id) };
      } catch (error) {
        return { error: errorMessage(error) };
      }
    },
  );

export const getCampaignSummaryForChannel = createServerFn({ method: 'POST' })
  .inputValidator(validateAccessInput)
  .handler(
    async ({ data }): Promise<{ summary?: CampaignInsightSummary; error?: string }> => {
      try {
        const result = await loadCreatorSummary(data);
        return { summary: result.summary };
      } catch (error) {
        return { error: errorMessage(error) };
      }
    },
  );

export const getCampaignSummaryForClip = createServerFn({ method: 'POST' })
  .inputValidator(validateEntityInput)
  .handler(
    async ({ data }): Promise<{ summary?: CampaignInsightSummary; error?: string }> => {
      try {
        if (!data.clip_id) return { error: 'Clip is required' };
        const result = await loadCreatorSummary(data);
        return { summary: result.summary };
      } catch (error) {
        return { error: errorMessage(error) };
      }
    },
  );

export const getCampaignSummaryForDraft = createServerFn({ method: 'POST' })
  .inputValidator(validateEntityInput)
  .handler(
    async ({ data }): Promise<{ summary?: CampaignInsightSummary; error?: string }> => {
      try {
        if (!data.draft_id) return { error: 'Distribution draft is required' };
        const result = await loadCreatorSummary(data);
        return { summary: result.summary };
      } catch (error) {
        return { error: errorMessage(error) };
      }
    },
  );

export const createManualExternalMetric = createServerFn({ method: 'POST' })
  .inputValidator(validateManualInput)
  .handler(
    async ({ data }): Promise<{ metric?: CampaignMetric; error?: string }> => {
      try {
        const { userId } = await verifyCampaignUser(
          data.accessToken || '',
          campaignAuthClient,
        );
        const normalized = normalizeManualCampaignMetric(data);
        await verifyEntityOwnership(userId, data);

        const { data: inserted, error } = await supabase
          .from('tradio_campaign_metrics')
          .insert({
            owner_user_id: userId,
            ...normalized,
          })
          .select(CAMPAIGN_METRIC_COLUMNS)
          .single();
        if (error || !inserted) throw new Error(error?.message || 'Manual metric creation failed');
        return { metric: sanitizeCampaignMetricRow(inserted) };
      } catch (error) {
        return { error: errorMessage(error) };
      }
    },
  );

export const updateManualExternalMetric = createServerFn({ method: 'POST' })
  .inputValidator(validateManualInput)
  .handler(
    async ({ data }): Promise<{ metric?: CampaignMetric; error?: string }> => {
      try {
        const metricId = data.metric_id?.trim();
        if (!metricId) return { error: 'Metric is required' };
        const { userId } = await verifyCampaignUser(
          data.accessToken || '',
          campaignAuthClient,
        );
        const { data: existing, error: existingError } = await supabase
          .from('tradio_campaign_metrics')
          .select(CAMPAIGN_METRIC_COLUMNS)
          .eq('id', metricId)
          .eq('owner_user_id', userId)
          .eq('entered_manually', true)
          .maybeSingle();
        if (existingError || !existing) return { error: 'Manual metric not found' };

        const merged = {
          ...sanitizeCampaignMetricRow(existing),
          ...data,
          platform: data.platform || existing.platform,
          metric_type: data.metric_type || existing.metric_type,
          metric_value:
            data.metric_value === undefined ? Number(existing.metric_value) : data.metric_value,
          measured_at: data.measured_at || existing.measured_at,
          note:
            data.note ??
            (existing.metadata && typeof existing.metadata.note === 'string'
              ? existing.metadata.note
              : ''),
        } as ManualCampaignMetricInput;
        const normalized = normalizeManualCampaignMetric(merged);
        await verifyEntityOwnership(userId, merged);

        const { data: updated, error } = await supabase
          .from('tradio_campaign_metrics')
          .update(normalized)
          .eq('id', metricId)
          .eq('owner_user_id', userId)
          .eq('entered_manually', true)
          .select(CAMPAIGN_METRIC_COLUMNS)
          .maybeSingle();
        if (error || !updated) throw new Error(error?.message || 'Manual metric update failed');
        return { metric: sanitizeCampaignMetricRow(updated) };
      } catch (error) {
        return { error: errorMessage(error) };
      }
    },
  );

export const deleteManualExternalMetric = createServerFn({ method: 'POST' })
  .inputValidator((input: { accessToken?: string; metric_id?: string }) => ({
    accessToken: typeof input?.accessToken === 'string' ? input.accessToken : '',
    metric_id: cleanOptional(input?.metric_id),
  }))
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!data.metric_id) return { success: false, error: 'Metric is required' };
      const { userId } = await verifyCampaignUser(data.accessToken, campaignAuthClient);
      const { data: deleted, error } = await supabase
        .from('tradio_campaign_metrics')
        .delete()
        .eq('id', data.metric_id)
        .eq('owner_user_id', userId)
        .eq('entered_manually', true)
        .select('id')
        .maybeSingle();
      if (error || !deleted) return { success: false, error: error?.message || 'Manual metric not found' };
      return { success: true };
    } catch (error) {
      return { success: false, error: errorMessage(error) };
    }
  });

export async function recordDistributionMetricForOwner(input: {
  owner_user_id: string;
  draft: CampaignDraftSnapshot;
  metric_type: 'draft_copied' | 'draft_marked_used';
}): Promise<void> {
  try {
    const { error } = await supabase.from('tradio_campaign_metrics').insert({
      owner_user_id: input.owner_user_id,
      channel_id: input.draft.channel_id ?? null,
      clip_id: input.draft.clip_id ?? null,
      recording_id: input.draft.recording_id ?? null,
      asset_id: input.draft.asset_id ?? null,
      application_id: input.draft.application_id ?? null,
      distribution_draft_id: input.draft.id,
      metric_source: 'distribution_desk',
      platform: input.draft.platform,
      metric_type: input.metric_type,
      metric_value: 1,
      metric_unit: input.metric_type === 'draft_copied' ? 'copy' : 'use',
      entered_manually: false,
      source_snapshot: {},
      metadata: {
        draft_type: input.draft.draft_type,
        event_type: input.metric_type,
      },
      measured_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
  } catch (error) {
    console.warn('[Campaign Intelligence] Distribution metric was not recorded:', error);
  }
}

async function recordDistributionMetricWithToken(input: {
  accessToken: string;
  draft_id: string;
  metric_type: 'draft_copied' | 'draft_marked_used';
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await verifyCampaignUser(input.accessToken, campaignAuthClient);
    const { data: draftRow, error } = await supabase
      .from('tradio_distribution_drafts')
      .select(CAMPAIGN_DRAFT_COLUMNS)
      .eq('id', input.draft_id)
      .eq('owner_user_id', userId)
      .maybeSingle();
    if (error || !draftRow) return { success: false, error: 'Distribution draft not found' };
    await recordDistributionMetricForOwner({
      owner_user_id: userId,
      draft: sanitizeCampaignDraftRow(draftRow),
      metric_type: input.metric_type,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export const recordDistributionDraftCopiedMetric = createServerFn({ method: 'POST' })
  .inputValidator((input: { accessToken?: string; draft_id?: string }) => ({
    accessToken: typeof input?.accessToken === 'string' ? input.accessToken : '',
    draft_id: cleanOptional(input?.draft_id) || '',
  }))
  .handler(async ({ data }) =>
    recordDistributionMetricWithToken({ ...data, metric_type: 'draft_copied' }),
  );

export const recordDistributionDraftUsedMetric = createServerFn({ method: 'POST' })
  .inputValidator((input: { accessToken?: string; draft_id?: string }) => ({
    accessToken: typeof input?.accessToken === 'string' ? input.accessToken : '',
    draft_id: cleanOptional(input?.draft_id) || '',
  }))
  .handler(async ({ data }) =>
    recordDistributionMetricWithToken({ ...data, metric_type: 'draft_marked_used' }),
  );

export const recordPublicClipPlayMetric = createServerFn({ method: 'POST' })
  .inputValidator((input: { clip_id?: string }) => ({
    clip_id: cleanOptional(input?.clip_id) || '',
  }))
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!data.clip_id) return { success: false, error: 'Clip is required' };
      const { data: clipRow, error } = await supabase
        .from('tradio_live_highlight_clips')
        .select('id, owner_user_id, channel_id, recording_id, clip_status, visibility')
        .eq('id', data.clip_id)
        .eq('clip_status', 'published')
        .eq('visibility', 'public')
        .maybeSingle();
      if (error || !clipRow) return { success: false, error: 'Public clip not found' };

      const { error: insertError } = await supabase.from('tradio_campaign_metrics').insert({
        owner_user_id: clipRow.owner_user_id,
        channel_id: clipRow.channel_id ?? null,
        clip_id: clipRow.id,
        recording_id: clipRow.recording_id ?? null,
        metric_source: 'public_replay',
        platform: 'tradio',
        metric_type: 'clip_play',
        metric_value: 1,
        metric_unit: 'play',
        entered_manually: false,
        source_snapshot: {},
        metadata: { event_type: 'public_clip_play' },
        measured_at: new Date().toISOString(),
      });
      if (insertError) throw new Error(insertError.message);
      return { success: true };
    } catch (error) {
      return { success: false, error: errorMessage(error) };
    }
  });

export const buildCampaignInsightSummary = createServerFn({ method: 'POST' })
  .inputValidator(validateAccessInput)
  .handler(
    async ({ data }): Promise<{ summary?: CampaignInsightSummary; error?: string }> => {
      try {
        const result = await loadCreatorSummary(data);
        return { summary: result.summary };
      } catch (error) {
        return { error: errorMessage(error) };
      }
    },
  );

export const buildPrescribeMeCampaignSignals = createServerFn({ method: 'POST' })
  .inputValidator(validateAccessInput)
  .handler(async ({ data }) => {
    try {
      const result = await loadCreatorSummary(data);
      return { signals: result.summary.prescribe_me_signals };
    } catch (error) {
      return { error: errorMessage(error) };
    }
  });

export const listRecommendedNextActions = createServerFn({ method: 'POST' })
  .inputValidator(validateAccessInput)
  .handler(async ({ data }) => {
    try {
      const result = await loadCreatorSummary(data);
      return { recommendations: result.summary.recommendations };
    } catch (error) {
      return { recommendations: [], error: errorMessage(error) };
    }
  });

export const listUnderperformingAssets = createServerFn({ method: 'POST' })
  .inputValidator(validateAccessInput)
  .handler(async ({ data }) => {
    try {
      const result = await loadCreatorSummary(data);
      return { assets: result.summary.underperforming_assets };
    } catch (error) {
      return { assets: [], error: errorMessage(error) };
    }
  });

export const listReusableHighPerformers = createServerFn({ method: 'POST' })
  .inputValidator(validateAccessInput)
  .handler(async ({ data }) => {
    try {
      const result = await loadCreatorSummary(data);
      return { performers: result.summary.reusable_high_performers };
    } catch (error) {
      return { performers: [], error: errorMessage(error) };
    }
  });

export const listAdminCampaignSummaries = createServerFn({ method: 'POST' })
  .inputValidator((input: { accessToken?: string; search?: string }) => ({
    accessToken: typeof input?.accessToken === 'string' ? input.accessToken : '',
    search: typeof input?.search === 'string' ? input.search.trim().toLowerCase().slice(0, 80) : '',
  }))
  .handler(
    async ({ data }): Promise<{ summaries: AdminCampaignSummary[]; error?: string }> => {
      try {
        await verifyCampaignUser(data.accessToken, campaignAuthClient, true);
        const [channelsResult, metricsResult, draftsResult, clipsResult] = await Promise.all([
          supabase
            .from('tradio_broadcast_channels')
            .select(CAMPAIGN_CHANNEL_COLUMNS)
            .order('title', { ascending: true })
            .limit(200),
          supabase
            .from('tradio_campaign_metrics')
            .select(CAMPAIGN_METRIC_COLUMNS)
            .order('measured_at', { ascending: false })
            .limit(2000),
          supabase
            .from('tradio_distribution_drafts')
            .select(CAMPAIGN_DRAFT_COLUMNS)
            .order('updated_at', { ascending: false })
            .limit(1000),
          supabase
            .from('tradio_live_highlight_clips')
            .select(CAMPAIGN_CLIP_COLUMNS)
            .order('created_at', { ascending: false })
            .limit(1000),
        ]);
        const firstError = [
          channelsResult.error,
          metricsResult.error,
          draftsResult.error,
          clipsResult.error,
        ].find(Boolean);
        if (firstError) throw new Error(firstError.message || 'Admin campaign data failed to load');

        const metrics: CampaignMetric[] = (metricsResult.data || []).map(
          (row: Record<string, unknown>) => sanitizeCampaignMetricRow(row),
        );
        const drafts: CampaignDraftSnapshot[] = (draftsResult.data || []).map(
          (row: Record<string, unknown>) => sanitizeCampaignDraftRow(row),
        );
        const clips: CampaignClipSnapshot[] = (clipsResult.data || []).map(
          (row: Record<string, unknown>) => sanitizeCampaignClipRow(row),
        );

        const summaries = (channelsResult.data || [])
          .map((channel: Record<string, unknown>): AdminCampaignSummary => {
            const channelId = String(channel.id || '');
            const summary = buildCampaignInsightSummaryRules({
              metrics: metrics.filter((entry) => entry.channel_id === channelId),
              drafts: drafts.filter((entry) => entry.channel_id === channelId),
              clips: clips.filter((entry) => entry.channel_id === channelId),
              assets: [],
            });
            return {
              owner_user_id: String(channel.owner_user_id || ''),
              channel_id: channelId,
              channel_title: String(channel.title || 'Untitled channel'),
              total_metrics: summary.overview.total_metrics,
              manual_metrics: summary.overview.manual_metrics,
              draft_copies: summary.overview.draft_copies,
              drafts_used: summary.overview.drafts_used,
              published_clips: summary.overview.published_clips,
              clip_plays: summary.overview.clip_plays,
              top_platform: summary.platforms[0]?.platform,
              top_tag: summary.tag_insights[0]?.tag,
            };
          })
          .filter((entry: AdminCampaignSummary) => {
            if (!data.search) return true;
            return (
              entry.channel_title.toLowerCase().includes(data.search) ||
              entry.owner_user_id.toLowerCase().includes(data.search)
            );
          });

        return { summaries };
      } catch (error) {
        return { summaries: [], error: errorMessage(error) };
      }
    },
  );

function cleanOptional(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Campaign Intelligence request failed';
}
