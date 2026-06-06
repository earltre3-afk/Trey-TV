import { createServerFn } from '@tanstack/react-start';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import {
  appendDistributionEvent,
  buildDistributionSourceSnapshot as buildSafeDistributionSourceSnapshot,
  buildManualDistributionSourceSnapshot,
  buildPrescribeMeSignalsFromDistributionDraft as buildSafePrescribeMeSignalsFromDistributionDraft,
  canCreateDistributionDraftFromAsset,
  createDistributionCancelReminderPatch,
  createDistributionCopyPatch,
  createDistributionReminderPatch,
  createDistributionStatusPatch,
  distributionDraftRequiresReview,
  formatDistributionDraftFromApplication,
  formatDistributionDraftFromAsset,
  nextDistributionStatusForReady,
  normalizeDistributionBody,
} from './broadcastDistributionRules';
import type {
  CreateDistributionDraftFromApplicationInput,
  CreateDistributionDraftFromAssetInput,
  CreateDistributionDraftManualInput,
  DistributionDraft,
  DistributionDraftMetadata,
  DistributionDraftPatch,
  ListDistributionDraftsInput,
  RejectDistributionDraftInput,
  ReviewDistributionDraftInput,
  ScheduleDistributionDraftReminderInput,
  UpdateDistributionDraftInput,
} from './broadcastDistributionTypes';
import type { PostShowApplication, PostShowAsset, PostShowJsonObject } from './broadcastPostShowTypes';
import { recordDistributionMetricForOwner } from './broadcastCampaign.server';
import {
  verifyTradioAccessToken,
  type TradioAuthenticatedInput,
  type TradioServerAuthClient,
} from './tradioServerAuth';

const supabase = supabaseAdmin;

type AuthUser = { id: string };

async function currentUser(accessToken: string): Promise<{ user?: AuthUser; error?: string }> {
  try {
    const { verifiedUserId } = await verifyTradioAccessToken(
      accessToken,
      supabase as unknown as TradioServerAuthClient,
    );
    return { user: { id: verifiedUserId } };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Not authenticated' };
  }
}

async function ensureAdmin(userId: string): Promise<boolean> {
  const { data: isAdmin } = await supabase.rpc('is_admin', { _user_id: userId });
  return isAdmin === true;
}

async function fetchAssetForOwner(assetId: string, userId: string): Promise<{ asset?: PostShowAsset; error?: string }> {
  const { data: asset, error } = await (supabase as any)
    .from('tradio_post_show_assets')
    .select('*')
    .eq('id', assetId)
    .single();

  if (error || !asset) return { error: 'Post-show asset not found' };
  if ((asset as PostShowAsset).owner_user_id !== userId) return { error: 'Not authorized' };

  const allowed = canCreateDistributionDraftFromAsset(asset as PostShowAsset);
  if (!allowed.allowed) return { error: allowed.reason };

  return { asset: asset as PostShowAsset };
}

async function fetchApplicationForOwner(
  applicationId: string,
  userId: string,
): Promise<{ application?: PostShowApplication; asset?: PostShowAsset | null; error?: string }> {
  const { data: application, error } = await (supabase as any)
    .from('tradio_post_show_applications')
    .select('*')
    .eq('id', applicationId)
    .single();

  if (error || !application) return { error: 'Post-show application not found' };
  const app = application as PostShowApplication;
  if (app.owner_user_id !== userId) return { error: 'Not authorized' };
  if (app.application_status === 'rejected' || app.application_status === 'archived' || app.application_status === 'reverted') {
    return { error: 'Rejected, archived, or reverted applications cannot create distribution drafts.' };
  }

  const { data: asset } = await (supabase as any)
    .from('tradio_post_show_assets')
    .select('*')
    .eq('id', app.asset_id)
    .single();

  if (asset && (asset as PostShowAsset).owner_user_id !== userId) {
    return { error: 'Not authorized for application asset' };
  }

  return { application: app, asset: (asset as PostShowAsset | null) ?? null };
}

async function fetchDraftForUser(
  draftId: string,
  userId: string,
): Promise<{ draft?: DistributionDraft; isAdmin?: boolean; error?: string }> {
  const { data: draft, error } = await (supabase as any)
    .from('tradio_distribution_drafts')
    .select('*')
    .eq('id', draftId)
    .single();

  if (error || !draft) return { error: 'Distribution draft not found' };
  const isAdmin = await ensureAdmin(userId);
  if ((draft as DistributionDraft).owner_user_id !== userId && !isAdmin) return { error: 'Not authorized' };
  return { draft: draft as DistributionDraft, isAdmin };
}

async function insertDistributionDraft(input: {
  ownerUserId: string;
  formatted: {
    draft_type: DistributionDraft['draft_type'];
    platform: DistributionDraft['platform'];
    title?: string | null;
    body: string;
    call_to_action?: string | null;
    metadata: DistributionDraftMetadata;
  };
  sourceSnapshot: PostShowJsonObject;
  moderationSnapshot?: PostShowJsonObject;
  assetId?: string | null;
  applicationId?: string | null;
  clipId?: string | null;
  recordingId?: string | null;
  episodeId?: string | null;
  queueId?: string | null;
  channelId?: string | null;
}): Promise<{ draft?: DistributionDraft; error?: string }> {
  const now = new Date().toISOString();
  const { data, error } = await (supabase as any)
    .from('tradio_distribution_drafts')
    .insert({
      owner_user_id: input.ownerUserId,
      asset_id: input.assetId ?? null,
      application_id: input.applicationId ?? null,
      clip_id: input.clipId ?? null,
      recording_id: input.recordingId ?? null,
      episode_id: input.episodeId ?? null,
      queue_id: input.queueId ?? null,
      channel_id: input.channelId ?? null,
      draft_type: input.formatted.draft_type,
      draft_status: 'draft',
      platform: input.formatted.platform,
      title: input.formatted.title ?? null,
      body: normalizeDistributionBody(input.formatted.body),
      call_to_action: input.formatted.call_to_action ?? null,
      moderation_snapshot: input.moderationSnapshot ?? {},
      source_snapshot: input.sourceSnapshot,
      metadata: appendDistributionEvent(
        {
          ...input.formatted.metadata,
          no_external_send: true,
          no_auto_publish: true,
        },
        'draft_created',
        now,
      ),
    })
    .select('*')
    .single();

  if (error) return { error: error.message };
  return { draft: data as DistributionDraft };
}

async function updateDraft(
  draftId: string,
  patch: DistributionDraftPatch,
  ownerUserId?: string,
): Promise<{ draft?: DistributionDraft; error?: string }> {
  const updateData = {
    ...patch,
    updated_at: patch.updated_at ?? new Date().toISOString(),
  };

  let query = (supabase as any)
    .from('tradio_distribution_drafts')
    .update(updateData)
    .eq('id', draftId);
  if (ownerUserId) query = query.eq('owner_user_id', ownerUserId);

  const { data, error } = await query.select('*').single();
  if (error) return { error: error.message };
  return { draft: data as DistributionDraft };
}

export const createDistributionDraftFromAsset = createServerFn({ method: 'POST' })
  .inputValidator((input: CreateDistributionDraftFromAssetInput) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; draft?: DistributionDraft; error?: string }> => {
    try {
      const { user, error: authError } = await currentUser(input.accessToken);
      if (!user) return { success: false, error: authError };

      const { asset, error: assetError } = await fetchAssetForOwner(input.asset_id, user.id);
      if (!asset) return { success: false, error: assetError };

      const formatted = formatDistributionDraftFromAsset(asset, input.draft_type, input.platform);
      const result = await insertDistributionDraft({
        ownerUserId: user.id,
        formatted,
        sourceSnapshot: buildSafeDistributionSourceSnapshot(asset),
        moderationSnapshot: asset.moderation_snapshot,
        assetId: asset.id,
        clipId: input.clip_id ?? asset.clip_id ?? null,
        recordingId: input.recording_id ?? asset.recording_id ?? null,
        episodeId: input.episode_id ?? asset.episode_id ?? null,
        queueId: input.queue_id ?? asset.queue_id ?? null,
        channelId: input.channel_id ?? asset.channel_id ?? null,
      });

      if (!result.draft) return { success: false, error: result.error };
      return { success: true, draft: result.draft };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Distribution draft creation failed' };
    }
  });

export const createDistributionDraftFromApplication = createServerFn({ method: 'POST' })
  .inputValidator((input: CreateDistributionDraftFromApplicationInput) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; draft?: DistributionDraft; error?: string }> => {
    try {
      const { user, error: authError } = await currentUser(input.accessToken);
      if (!user) return { success: false, error: authError };

      const { application, asset, error: appError } = await fetchApplicationForOwner(input.application_id, user.id);
      if (!application) return { success: false, error: appError };

      if (asset) {
        const allowed = canCreateDistributionDraftFromAsset(asset);
        if (!allowed.allowed) return { success: false, error: allowed.reason };
      }

      const formatted = formatDistributionDraftFromApplication(application, asset ?? null, input.draft_type, input.platform);
      const result = await insertDistributionDraft({
        ownerUserId: user.id,
        formatted,
        sourceSnapshot: asset
          ? buildSafeDistributionSourceSnapshot(asset, application)
          : {
              source_type: 'tradio_post_show_application',
              application_id: application.id,
              application_type: application.application_type,
            },
        moderationSnapshot: asset?.moderation_snapshot ?? {},
        assetId: application.asset_id,
        applicationId: application.id,
        clipId: application.clip_id,
        recordingId: application.recording_id,
        episodeId: application.episode_id,
        queueId: application.queue_id,
        channelId: application.channel_id,
      });

      if (!result.draft) return { success: false, error: result.error };
      return { success: true, draft: result.draft };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Distribution draft creation failed' };
    }
  });

export const createDistributionDraftManually = createServerFn({ method: 'POST' })
  .inputValidator((input: CreateDistributionDraftManualInput) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; draft?: DistributionDraft; error?: string }> => {
    try {
      const { user, error: authError } = await currentUser(input.accessToken);
      if (!user) return { success: false, error: authError };
      if (!input.body.trim()) return { success: false, error: 'Draft body is required' };

      const result = await insertDistributionDraft({
        ownerUserId: user.id,
        formatted: {
          draft_type: input.draft_type,
          platform: input.platform,
          title: input.title?.trim() || null,
          body: input.body,
          call_to_action: input.call_to_action?.trim() || null,
          metadata: {
            source: 'manual_distribution_draft',
            no_external_send: true,
            no_auto_publish: true,
            platform: input.platform,
            draft_type: input.draft_type,
            copied_count: 0,
            marked_used: false,
          },
        },
        sourceSnapshot: buildManualDistributionSourceSnapshot({
          platform: input.platform,
          draftType: input.draft_type,
          clipId: input.clip_id ?? null,
          recordingId: input.recording_id ?? null,
          episodeId: input.episode_id ?? null,
          queueId: input.queue_id ?? null,
          channelId: input.channel_id ?? null,
        }),
        clipId: input.clip_id ?? null,
        recordingId: input.recording_id ?? null,
        episodeId: input.episode_id ?? null,
        queueId: input.queue_id ?? null,
        channelId: input.channel_id ?? null,
      });

      if (!result.draft) return { success: false, error: result.error };
      return { success: true, draft: result.draft };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Manual draft creation failed' };
    }
  });

export const updateDistributionDraft = createServerFn({ method: 'POST' })
  .inputValidator((input: UpdateDistributionDraftInput) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; draft?: DistributionDraft; error?: string }> => {
    try {
      const { user, error: authError } = await currentUser(input.accessToken);
      if (!user) return { success: false, error: authError };
      const { draft, error: draftError } = await fetchDraftForUser(input.draft_id, user.id);
      if (!draft) return { success: false, error: draftError };
      if (draft.owner_user_id !== user.id) return { success: false, error: 'Only the creator can edit this draft' };
      if (draft.draft_status === 'archived') return { success: false, error: 'Archived drafts cannot be edited' };

      const metadata = appendDistributionEvent(
        {
          ...draft.metadata,
          no_external_send: true,
          no_auto_publish: true,
          platform: input.platform ?? draft.platform,
          draft_type: input.draft_type ?? draft.draft_type,
        },
        'draft_edited',
      );

      const result = await updateDraft(input.draft_id, {
        draft_status: draft.draft_status === 'draft' ? 'edited' : draft.draft_status,
        draft_type: input.draft_type,
        platform: input.platform,
        title: input.title === undefined ? undefined : input.title.trim() || null,
        body: input.body === undefined ? undefined : normalizeDistributionBody(input.body),
        call_to_action: input.call_to_action === undefined ? undefined : input.call_to_action.trim() || null,
        scheduled_for: input.scheduled_for,
        metadata,
      } as DistributionDraftPatch, user.id);

      if (!result.draft) return { success: false, error: result.error };
      return { success: true, draft: result.draft };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Draft update failed' };
    }
  });

export const markDistributionDraftReady = createServerFn({ method: 'POST' })
  .inputValidator((input: ReviewDistributionDraftInput) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; draft?: DistributionDraft; error?: string }> => {
    try {
      const { user, error: authError } = await currentUser(input.accessToken);
      if (!user) return { success: false, error: authError };
      const { draft, error: draftError } = await fetchDraftForUser(input.draft_id, user.id);
      if (!draft) return { success: false, error: draftError };
      if (draft.owner_user_id !== user.id) return { success: false, error: 'Only the creator can mark this ready' };

      const nextStatus = nextDistributionStatusForReady({
        platform: draft.platform,
        draftType: draft.draft_type,
        sourceAssetStatus: typeof draft.metadata.asset_status === 'string' ? draft.metadata.asset_status as any : null,
        moderationSnapshot: draft.moderation_snapshot,
      });
      const patch = createDistributionStatusPatch(
        draft,
        nextStatus,
        nextStatus === 'pending_review' ? 'draft_submitted_review' : 'draft_marked_ready',
        new Date().toISOString(),
        { review_notes: input.review_notes ?? '' },
      );
      const result = await updateDraft(input.draft_id, { ...patch, review_notes: input.review_notes ?? draft.review_notes }, user.id);
      if (!result.draft) return { success: false, error: result.error };
      if (draft.draft_status !== 'used' && draft.metadata.marked_used !== true) {
        await recordDistributionMetricForOwner({
          owner_user_id: user.id,
          draft: result.draft,
          metric_type: 'draft_marked_used',
        });
      }
      return { success: true, draft: result.draft };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Ready update failed' };
    }
  });

export const submitDistributionDraftForReview = createServerFn({ method: 'POST' })
  .inputValidator((input: ReviewDistributionDraftInput) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; draft?: DistributionDraft; error?: string }> => {
    try {
      const { user, error: authError } = await currentUser(input.accessToken);
      if (!user) return { success: false, error: authError };
      const { draft, error: draftError } = await fetchDraftForUser(input.draft_id, user.id);
      if (!draft) return { success: false, error: draftError };
      if (draft.owner_user_id !== user.id) return { success: false, error: 'Only the creator can submit this draft' };

      const patch = createDistributionStatusPatch(draft, 'pending_review', 'draft_submitted_review', new Date().toISOString(), {
        review_notes: input.review_notes ?? '',
      });
      const result = await updateDraft(input.draft_id, { ...patch, review_notes: input.review_notes ?? draft.review_notes }, user.id);
      if (!result.draft) return { success: false, error: result.error };
      return { success: true, draft: result.draft };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Review submission failed' };
    }
  });

export const approveDistributionDraft = createServerFn({ method: 'POST' })
  .inputValidator((input: ReviewDistributionDraftInput) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; draft?: DistributionDraft; error?: string }> => {
    try {
      const { user, error: authError } = await currentUser(input.accessToken);
      if (!user) return { success: false, error: authError };
      const isAdmin = await ensureAdmin(user.id);
      if (!isAdmin) return { success: false, error: 'Admin access required' };

      const { draft, error: draftError } = await fetchDraftForUser(input.draft_id, user.id);
      if (!draft) return { success: false, error: draftError };
      if (draft.draft_status === 'archived' || draft.draft_status === 'rejected') {
        return { success: false, error: 'Archived or rejected drafts cannot be approved' };
      }

      const patch = createDistributionStatusPatch(draft, 'approved', 'draft_approved', new Date().toISOString(), {
        approved_by: user.id,
        review_notes: input.review_notes ?? '',
      });
      const result = await updateDraft(input.draft_id, { ...patch, review_notes: input.review_notes ?? draft.review_notes });
      if (!result.draft) return { success: false, error: result.error };
      return { success: true, draft: result.draft };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Draft approval failed' };
    }
  });

export const rejectDistributionDraft = createServerFn({ method: 'POST' })
  .inputValidator((input: RejectDistributionDraftInput) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; draft?: DistributionDraft; error?: string }> => {
    try {
      const { user, error: authError } = await currentUser(input.accessToken);
      if (!user) return { success: false, error: authError };
      const isAdmin = await ensureAdmin(user.id);
      if (!isAdmin) return { success: false, error: 'Admin access required' };

      const { draft, error: draftError } = await fetchDraftForUser(input.draft_id, user.id);
      if (!draft) return { success: false, error: draftError };

      const patch = createDistributionStatusPatch(draft, 'rejected', 'draft_rejected', new Date().toISOString(), {
        rejected_by: user.id,
        rejection_reason: input.rejection_reason,
      });
      const result = await updateDraft(input.draft_id, { ...patch, review_notes: input.rejection_reason });
      if (!result.draft) return { success: false, error: result.error };
      return { success: true, draft: result.draft };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Draft rejection failed' };
    }
  });

export const archiveDistributionDraft = createServerFn({ method: 'POST' })
  .inputValidator((input: ReviewDistributionDraftInput) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; draft?: DistributionDraft; error?: string }> => {
    try {
      const { user, error: authError } = await currentUser(input.accessToken);
      if (!user) return { success: false, error: authError };
      const { draft, error: draftError, isAdmin } = await fetchDraftForUser(input.draft_id, user.id);
      if (!draft) return { success: false, error: draftError };
      if (draft.owner_user_id !== user.id && !isAdmin) return { success: false, error: 'Not authorized' };

      const patch = createDistributionStatusPatch(draft, 'archived', 'draft_archived', new Date().toISOString(), {
        archived_by: user.id,
        review_notes: input.review_notes ?? '',
      });
      const result = await updateDraft(input.draft_id, { ...patch, review_notes: input.review_notes ?? draft.review_notes });
      if (!result.draft) return { success: false, error: result.error };
      return { success: true, draft: result.draft };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Draft archive failed' };
    }
  });

export const markDistributionDraftUsed = createServerFn({ method: 'POST' })
  .inputValidator((input: ReviewDistributionDraftInput) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; draft?: DistributionDraft; error?: string }> => {
    try {
      const { user, error: authError } = await currentUser(input.accessToken);
      if (!user) return { success: false, error: authError };
      const { draft, error: draftError } = await fetchDraftForUser(input.draft_id, user.id);
      if (!draft) return { success: false, error: draftError };
      if (draft.owner_user_id !== user.id) return { success: false, error: 'Only the creator can mark this used' };

      const patch = createDistributionStatusPatch(draft, 'used', 'draft_marked_used', new Date().toISOString(), {
        use_notes: input.review_notes ?? '',
        external_success_not_verified: true,
      });
      const result = await updateDraft(input.draft_id, { ...patch, review_notes: input.review_notes ?? draft.review_notes }, user.id);
      if (!result.draft) return { success: false, error: result.error };
      return { success: true, draft: result.draft };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Used update failed' };
    }
  });

export const incrementDistributionDraftCopyCount = createServerFn({ method: 'POST' })
  .inputValidator((input: ReviewDistributionDraftInput) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; draft?: DistributionDraft; error?: string }> => {
    try {
      const { user, error: authError } = await currentUser(input.accessToken);
      if (!user) return { success: false, error: authError };
      const { draft, error: draftError } = await fetchDraftForUser(input.draft_id, user.id);
      if (!draft) return { success: false, error: draftError };
      if (draft.owner_user_id !== user.id) return { success: false, error: 'Only the creator can copy this draft' };

      const patch = createDistributionCopyPatch(draft);
      const result = await updateDraft(input.draft_id, patch, user.id);
      if (!result.draft) return { success: false, error: result.error };
      await recordDistributionMetricForOwner({
        owner_user_id: user.id,
        draft: result.draft,
        metric_type: 'draft_copied',
      });
      return { success: true, draft: result.draft };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Copy tracking failed' };
    }
  });

export const scheduleDistributionDraftReminder = createServerFn({ method: 'POST' })
  .inputValidator((input: ScheduleDistributionDraftReminderInput) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; draft?: DistributionDraft; error?: string }> => {
    try {
      const { user, error: authError } = await currentUser(input.accessToken);
      if (!user) return { success: false, error: authError };
      const { draft, error: draftError } = await fetchDraftForUser(input.draft_id, user.id);
      if (!draft) return { success: false, error: draftError };
      if (draft.owner_user_id !== user.id) return { success: false, error: 'Only the creator can schedule reminders' };

      const scheduledAt = new Date(input.scheduled_for);
      if (Number.isNaN(scheduledAt.getTime())) return { success: false, error: 'Invalid reminder date' };

      const patch = createDistributionReminderPatch(draft, scheduledAt.toISOString());
      const result = await updateDraft(input.draft_id, patch, user.id);
      if (!result.draft) return { success: false, error: result.error };
      return { success: true, draft: result.draft };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Reminder scheduling failed' };
    }
  });

export const cancelDistributionDraftReminder = createServerFn({ method: 'POST' })
  .inputValidator((input: ReviewDistributionDraftInput) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; draft?: DistributionDraft; error?: string }> => {
    try {
      const { user, error: authError } = await currentUser(input.accessToken);
      if (!user) return { success: false, error: authError };
      const { draft, error: draftError } = await fetchDraftForUser(input.draft_id, user.id);
      if (!draft) return { success: false, error: draftError };
      if (draft.owner_user_id !== user.id) return { success: false, error: 'Only the creator can cancel reminders' };

      const patch = createDistributionCancelReminderPatch(draft);
      const result = await updateDraft(input.draft_id, patch, user.id);
      if (!result.draft) return { success: false, error: result.error };
      return { success: true, draft: result.draft };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Reminder cancellation failed' };
    }
  });

export const listDistributionDrafts = createServerFn({ method: 'POST' })
  .inputValidator((input: ListDistributionDraftsInput) => input)
  .handler(async ({ data: input }): Promise<{ drafts: DistributionDraft[]; error?: string }> => {
    try {
      const { user, error: authError } = await currentUser(input.accessToken);
      if (!user) return { drafts: [], error: authError };
      const isAdmin = await ensureAdmin(user.id);
      if (input.review_queue && !isAdmin) return { drafts: [], error: 'Admin access required' };

      let query = (supabase as any)
        .from('tradio_distribution_drafts')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!isAdmin || !input.review_queue) query = query.eq('owner_user_id', user.id);
      if (input.review_queue) query = query.eq('draft_status', 'pending_review');
      if (input.draft_status) query = query.eq('draft_status', input.draft_status);
      if (input.platform) query = query.eq('platform', input.platform);
      if (input.asset_id) query = query.eq('asset_id', input.asset_id);
      if (input.application_id) query = query.eq('application_id', input.application_id);
      if (input.clip_id) query = query.eq('clip_id', input.clip_id);
      if (input.recording_id) query = query.eq('recording_id', input.recording_id);
      if (input.episode_id) query = query.eq('episode_id', input.episode_id);
      if (input.channel_id) query = query.eq('channel_id', input.channel_id);

      const { data, error } = await query.limit(100);
      if (error) return { drafts: [], error: error.message };
      return { drafts: (data || []) as DistributionDraft[] };
    } catch (err) {
      return { drafts: [], error: err instanceof Error ? err.message : 'Draft list failed' };
    }
  });

export const listDistributionDraftsForClip = createServerFn({ method: 'POST' })
  .inputValidator((input: TradioAuthenticatedInput & { clip_id: string }) => input)
  .handler(async ({ data: input }): Promise<{ drafts: DistributionDraft[]; error?: string }> => {
    return listDistributionDrafts({ data: { accessToken: input.accessToken, clip_id: input.clip_id } });
  });

export const listDistributionDraftsForEpisode = createServerFn({ method: 'POST' })
  .inputValidator((input: TradioAuthenticatedInput & { episode_id: string }) => input)
  .handler(async ({ data: input }): Promise<{ drafts: DistributionDraft[]; error?: string }> => {
    return listDistributionDrafts({ data: { accessToken: input.accessToken, episode_id: input.episode_id } });
  });

export const listPendingDistributionDraftReviews = createServerFn({ method: 'POST' })
  .inputValidator((input: TradioAuthenticatedInput) => input)
  .handler(async ({ data: input }): Promise<{ drafts: DistributionDraft[]; error?: string }> => {
    return listDistributionDrafts({ data: { accessToken: input.accessToken, review_queue: true } });
  });

export const buildDistributionSourceSnapshot = createServerFn({ method: 'POST' })
  .inputValidator((input: TradioAuthenticatedInput & { asset_id: string; application_id?: string }) => input)
  .handler(async ({ data: input }): Promise<{ snapshot: PostShowJsonObject; error?: string }> => {
    const { user, error: authError } = await currentUser(input.accessToken);
    if (!user) return { snapshot: {}, error: authError };

    const { asset, error: assetError } = await fetchAssetForOwner(input.asset_id, user.id);
    if (!asset) return { snapshot: {}, error: assetError };

    let application: PostShowApplication | null = null;
    if (input.application_id) {
      const appResult = await fetchApplicationForOwner(input.application_id, user.id);
      if (appResult.error) return { snapshot: {}, error: appResult.error };
      application = appResult.application ?? null;
    }

    return { snapshot: buildSafeDistributionSourceSnapshot(asset, application) };
  });

export const buildPrescribeMeSignalsFromDistributionDraft = createServerFn({ method: 'POST' })
  .inputValidator((input: TradioAuthenticatedInput & { draft_id: string }) => input)
  .handler(async ({ data: input }): Promise<{ signals: PostShowJsonObject; error?: string }> => {
    const { user, error: authError } = await currentUser(input.accessToken);
    if (!user) return { signals: {}, error: authError };

    const { draft, error: draftError } = await fetchDraftForUser(input.draft_id, user.id);
    if (!draft) return { signals: {}, error: draftError };

    return { signals: buildSafePrescribeMeSignalsFromDistributionDraft(draft) };
  });

export function draftNeedsReviewPreview(draft: DistributionDraft): boolean {
  return distributionDraftRequiresReview({
    platform: draft.platform,
    draftType: draft.draft_type,
    sourceAssetStatus: typeof draft.metadata.asset_status === 'string' ? draft.metadata.asset_status as any : null,
    moderationSnapshot: draft.moderation_snapshot,
  });
}
