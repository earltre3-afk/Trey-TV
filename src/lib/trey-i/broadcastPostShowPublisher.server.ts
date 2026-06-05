import { createServerFn } from '@tanstack/react-start';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import {
  buildSafePrescribeMeMetadata,
  canApplyPostShowAsset,
  normalizePostShowAppliedValue,
  publicPostShowApplicationVisible,
  requiresPostShowApplicationReview,
  resolvePostShowApplicationType,
} from './broadcastPostShowPublisher';
import type {
  ApplyPostShowAssetToClipInput,
  ApplyPostShowAssetToEpisodeInput,
  CreatePostShowDraftFromAssetInput,
  CreatePrescribeMeMetadataFromAssetInput,
  ListPostShowApplicationsInput,
  PostShowApplication,
  PostShowApplicationType,
  PostShowAsset,
  PostShowJsonObject,
  PostShowPublisherTarget,
  PublicPostShowAppliedAsset,
  RejectPostShowApplicationInput,
  ReviewPostShowApplicationInput,
} from './broadcastPostShowTypes';

const supabase = supabaseAdmin;

type AuthUser = { id: string };

interface TargetWritePlan {
  applicationType: PostShowApplicationType;
  targetField: string | null;
  previousValue: string | null;
  appliedValue: string;
  appliedMetadata: PostShowJsonObject;
  targetVisibility?: string | null;
  targetStatus?: string | null;
}

interface ClipRow {
  id: string;
  owner_user_id: string;
  recording_id?: string | null;
  episode_id?: string | null;
  queue_id?: string | null;
  channel_id?: string | null;
  title?: string | null;
  description?: string | null;
  caption?: string | null;
  visibility?: string | null;
  clip_status?: string | null;
  mood_tags?: string[] | null;
  genre_tags?: string[] | null;
  audience_tags?: string[] | null;
  metadata?: PostShowJsonObject | null;
}

interface EpisodeRow {
  id: string;
  owner_user_id: string;
  title?: string | null;
  description?: string | null;
  visibility?: string | null;
  status?: string | null;
  metadata?: PostShowJsonObject | null;
}

async function currentUser(): Promise<{ user?: AuthUser; error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  return { user: { id: user.id } };
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

  const allowed = canApplyPostShowAsset(asset as PostShowAsset);
  if (!allowed.allowed) return { error: allowed.reason };

  return { asset: asset as PostShowAsset };
}

async function fetchClipForOwner(clipId: string, userId: string): Promise<{ clip?: ClipRow; error?: string }> {
  const { data: clip, error } = await (supabase as any)
    .from('tradio_live_highlight_clips')
    .select(
      'id, owner_user_id, recording_id, episode_id, queue_id, channel_id, title, description, caption, visibility, clip_status, mood_tags, genre_tags, audience_tags, metadata',
    )
    .eq('id', clipId)
    .single();

  if (error || !clip) return { error: 'Clip not found' };
  if ((clip as ClipRow).owner_user_id !== userId) return { error: 'Not authorized for this clip' };
  return { clip: clip as ClipRow };
}

async function fetchEpisodeForOwner(episodeId: string, userId: string): Promise<{ episode?: EpisodeRow; error?: string }> {
  const { data: episode, error } = await (supabase as any)
    .from('tradio_show_episodes')
    .select('id, owner_user_id, title, description, visibility, status, metadata')
    .eq('id', episodeId)
    .single();

  if (error || !episode) return { error: 'Episode not found' };
  if ((episode as EpisodeRow).owner_user_id !== userId) return { error: 'Not authorized for this episode' };
  return { episode: episode as EpisodeRow };
}

function clipWritePlan(asset: PostShowAsset, clip: ClipRow, requestedType?: PostShowApplicationType): TargetWritePlan {
  const applicationType = resolvePostShowApplicationType(asset.asset_type, requestedType);
  if (!applicationType) {
    throw new Error('This post-show asset cannot be applied to a clip');
  }

  if (applicationType === 'clip_title') {
    return {
      applicationType,
      targetField: 'title',
      previousValue: clip.title ?? null,
      appliedValue: normalizePostShowAppliedValue(asset.title || asset.body),
      appliedMetadata: { target_type: 'clip' },
      targetVisibility: clip.visibility,
      targetStatus: clip.clip_status,
    };
  }

  if (applicationType === 'clip_caption') {
    return {
      applicationType,
      targetField: 'caption',
      previousValue: clip.caption ?? null,
      appliedValue: normalizePostShowAppliedValue(asset.body),
      appliedMetadata: { target_type: 'clip' },
      targetVisibility: clip.visibility,
      targetStatus: clip.clip_status,
    };
  }

  if (applicationType === 'replay_blurb' || applicationType === 'seo_description') {
    return {
      applicationType,
      targetField: 'description',
      previousValue: clip.description ?? null,
      appliedValue: normalizePostShowAppliedValue(asset.body),
      appliedMetadata: { target_type: 'clip' },
      targetVisibility: clip.visibility,
      targetStatus: clip.clip_status,
    };
  }

  if (applicationType === 'prescribe_me_metadata') {
    return {
      applicationType,
      targetField: 'metadata.prescribe_me',
      previousValue: JSON.stringify((clip.metadata ?? {}).prescribe_me ?? null),
      appliedValue: JSON.stringify(buildSafePrescribeMeMetadata(asset)),
      appliedMetadata: buildSafePrescribeMeMetadata(asset),
      targetVisibility: clip.visibility,
      targetStatus: clip.clip_status,
    };
  }

  return {
    applicationType,
    targetField: null,
    previousValue: null,
    appliedValue: normalizePostShowAppliedValue(asset.body),
    appliedMetadata: { target_type: 'clip', draft_only: true },
    targetVisibility: clip.visibility,
    targetStatus: clip.clip_status,
  };
}

function episodeWritePlan(
  asset: PostShowAsset,
  episode: EpisodeRow,
  requestedType?: PostShowApplicationType,
): TargetWritePlan {
  const applicationType = resolvePostShowApplicationType(asset.asset_type, requestedType);
  if (!applicationType) {
    throw new Error('This post-show asset cannot be applied to an episode');
  }

  if (applicationType === 'episode_description' || applicationType === 'seo_description') {
    return {
      applicationType,
      targetField: 'description',
      previousValue: episode.description ?? null,
      appliedValue: normalizePostShowAppliedValue(asset.body),
      appliedMetadata: { target_type: 'episode' },
      targetVisibility: episode.visibility,
      targetStatus: episode.status,
    };
  }

  if (applicationType === 'prescribe_me_metadata') {
    return {
      applicationType,
      targetField: 'metadata.prescribe_me',
      previousValue: JSON.stringify((episode.metadata ?? {}).prescribe_me ?? null),
      appliedValue: JSON.stringify(buildSafePrescribeMeMetadata(asset)),
      appliedMetadata: buildSafePrescribeMeMetadata(asset),
      targetVisibility: episode.visibility,
      targetStatus: episode.status,
    };
  }

  return {
    applicationType,
    targetField: null,
    previousValue: null,
    appliedValue: normalizePostShowAppliedValue(asset.body),
    appliedMetadata: { target_type: 'episode', draft_only: true },
    targetVisibility: episode.visibility,
    targetStatus: episode.status,
  };
}

async function insertApplication(input: {
  ownerUserId: string;
  asset: PostShowAsset;
  applicationType: PostShowApplicationType;
  applicationStatus: PostShowApplication['application_status'];
  appliedValue: string;
  appliedMetadata: PostShowJsonObject;
  targetField?: string | null;
  previousValue?: string | null;
  clipId?: string | null;
  recordingId?: string | null;
  episodeId?: string | null;
  queueId?: string | null;
  channelId?: string | null;
}): Promise<{ application?: PostShowApplication; error?: string }> {
  const { data, error } = await (supabase as any)
    .from('tradio_post_show_applications')
    .insert({
      owner_user_id: input.ownerUserId,
      asset_id: input.asset.id,
      clip_id: input.clipId ?? input.asset.clip_id ?? null,
      recording_id: input.recordingId ?? input.asset.recording_id ?? null,
      episode_id: input.episodeId ?? input.asset.episode_id ?? null,
      queue_id: input.queueId ?? input.asset.queue_id ?? null,
      channel_id: input.channelId ?? input.asset.channel_id ?? null,
      application_type: input.applicationType,
      application_status: input.applicationStatus,
      target_field: input.targetField ?? null,
      previous_value: input.previousValue ?? null,
      applied_value: input.appliedValue,
      applied_metadata: input.appliedMetadata,
      applied_at: input.applicationStatus === 'applied' ? new Date().toISOString() : null,
    })
    .select('*')
    .single();

  if (error) return { error: error.message };
  return { application: data as PostShowApplication };
}

async function updateApplicationStatus(
  applicationId: string,
  status: PostShowApplication['application_status'],
  metadataPatch: PostShowJsonObject = {},
): Promise<{ success: boolean; error?: string }> {
  const { data: current } = await (supabase as any)
    .from('tradio_post_show_applications')
    .select('applied_metadata')
    .eq('id', applicationId)
    .single();

  const appliedMetadata = {
    ...((current?.applied_metadata ?? {}) as PostShowJsonObject),
    ...metadataPatch,
  };

  const { error } = await (supabase as any)
    .from('tradio_post_show_applications')
    .update({
      application_status: status,
      applied_metadata: appliedMetadata,
      applied_at: status === 'applied' ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', applicationId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

async function applyClipPlan(clip: ClipRow, plan: TargetWritePlan): Promise<{ success: boolean; error?: string }> {
  if (!plan.targetField) return { success: true };

  let updateData: Record<string, unknown>;
  if (plan.targetField === 'metadata.prescribe_me') {
    updateData = {
      metadata: {
        ...(clip.metadata ?? {}),
        prescribe_me: plan.appliedMetadata,
      },
    };
  } else {
    updateData = { [plan.targetField]: plan.appliedValue };
  }
  updateData.updated_at = new Date().toISOString();

  const { error } = await (supabase as any)
    .from('tradio_live_highlight_clips')
    .update(updateData)
    .eq('id', clip.id)
    .eq('owner_user_id', clip.owner_user_id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

async function applyEpisodePlan(
  episode: EpisodeRow,
  plan: TargetWritePlan,
): Promise<{ success: boolean; error?: string }> {
  if (!plan.targetField) return { success: true };

  let updateData: Record<string, unknown>;
  if (plan.targetField === 'metadata.prescribe_me') {
    updateData = {
      metadata: {
        ...(episode.metadata ?? {}),
        prescribe_me: plan.appliedMetadata,
      },
    };
  } else {
    updateData = { [plan.targetField]: plan.appliedValue };
  }
  updateData.updated_at = new Date().toISOString();

  const { error } = await (supabase as any)
    .from('tradio_show_episodes')
    .update(updateData)
    .eq('id', episode.id)
    .eq('owner_user_id', episode.owner_user_id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

async function createDraftApplication(
  input: CreatePostShowDraftFromAssetInput,
  applicationType: PostShowApplicationType,
): Promise<{ success: boolean; application?: PostShowApplication; error?: string }> {
  const { user, error: authError } = await currentUser();
  if (!user) return { success: false, error: authError };

  const { asset, error: assetError } = await fetchAssetForOwner(input.asset_id, user.id);
  if (!asset) return { success: false, error: assetError };

  const applicationResult = await insertApplication({
    ownerUserId: user.id,
    asset,
    applicationType,
    applicationStatus: 'draft',
    appliedValue: normalizePostShowAppliedValue(asset.body),
    appliedMetadata: {
      draft_only: true,
      no_external_send: true,
      platform: asset.platform ?? applicationType,
    },
    clipId: input.clip_id ?? null,
    recordingId: input.recording_id ?? null,
    episodeId: input.episode_id ?? null,
    queueId: input.queue_id ?? null,
    channelId: input.channel_id ?? null,
  });

  if (!applicationResult.application) return { success: false, error: applicationResult.error };
  return { success: true, application: applicationResult.application };
}

export const applyPostShowAssetToClip = createServerFn({ method: 'POST' })
  .inputValidator((input: ApplyPostShowAssetToClipInput) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; application?: PostShowApplication; error?: string }> => {
    try {
      const { user, error: authError } = await currentUser();
      if (!user) return { success: false, error: authError };

      const { asset, error: assetError } = await fetchAssetForOwner(input.asset_id, user.id);
      if (!asset) return { success: false, error: assetError };

      const { clip, error: clipError } = await fetchClipForOwner(input.clip_id, user.id);
      if (!clip) return { success: false, error: clipError };

      const plan = clipWritePlan(asset, clip, input.application_type);
      const reviewRequired = requiresPostShowApplicationReview({
        asset,
        applicationType: plan.applicationType,
        targetVisibility: clip.visibility,
      });

      const applicationResult = await insertApplication({
        ownerUserId: user.id,
        asset,
        applicationType: plan.applicationType,
        applicationStatus: reviewRequired ? 'pending_review' : 'draft',
        appliedValue: plan.appliedValue,
        appliedMetadata: {
          ...plan.appliedMetadata,
          review_required: reviewRequired,
          asset_status: asset.asset_status,
          target_visibility: clip.visibility ?? null,
          target_status: clip.clip_status ?? null,
        },
        targetField: plan.targetField,
        previousValue: plan.previousValue,
        clipId: clip.id,
        recordingId: clip.recording_id ?? asset.recording_id ?? null,
        episodeId: clip.episode_id ?? asset.episode_id ?? null,
        queueId: clip.queue_id ?? asset.queue_id ?? null,
        channelId: clip.channel_id ?? asset.channel_id ?? null,
      });

      if (!applicationResult.application) return { success: false, error: applicationResult.error };
      if (reviewRequired) return { success: true, application: applicationResult.application };

      const applyResult = await applyClipPlan(clip, plan);
      if (!applyResult.success) return { success: false, error: applyResult.error };

      await updateApplicationStatus(applicationResult.application.id, 'applied');
      return {
        success: true,
        application: {
          ...applicationResult.application,
          application_status: 'applied',
          applied_at: new Date().toISOString(),
        },
      };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Clip application failed' };
    }
  });

export const applyPostShowAssetToEpisode = createServerFn({ method: 'POST' })
  .inputValidator((input: ApplyPostShowAssetToEpisodeInput) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; application?: PostShowApplication; error?: string }> => {
    try {
      const { user, error: authError } = await currentUser();
      if (!user) return { success: false, error: authError };

      const { asset, error: assetError } = await fetchAssetForOwner(input.asset_id, user.id);
      if (!asset) return { success: false, error: assetError };

      const { episode, error: episodeError } = await fetchEpisodeForOwner(input.episode_id, user.id);
      if (!episode) return { success: false, error: episodeError };

      const plan = episodeWritePlan(asset, episode, input.application_type);
      const reviewRequired = requiresPostShowApplicationReview({
        asset,
        applicationType: plan.applicationType,
        targetVisibility: episode.visibility,
      });

      const applicationResult = await insertApplication({
        ownerUserId: user.id,
        asset,
        applicationType: plan.applicationType,
        applicationStatus: reviewRequired ? 'pending_review' : 'draft',
        appliedValue: plan.appliedValue,
        appliedMetadata: {
          ...plan.appliedMetadata,
          review_required: reviewRequired,
          asset_status: asset.asset_status,
          target_visibility: episode.visibility ?? null,
          target_status: episode.status ?? null,
        },
        targetField: plan.targetField,
        previousValue: plan.previousValue,
        episodeId: episode.id,
        recordingId: asset.recording_id ?? null,
        queueId: asset.queue_id ?? null,
        channelId: asset.channel_id ?? null,
      });

      if (!applicationResult.application) return { success: false, error: applicationResult.error };
      if (reviewRequired) return { success: true, application: applicationResult.application };

      const applyResult = await applyEpisodePlan(episode, plan);
      if (!applyResult.success) return { success: false, error: applyResult.error };

      await updateApplicationStatus(applicationResult.application.id, 'applied');
      return {
        success: true,
        application: {
          ...applicationResult.application,
          application_status: 'applied',
          applied_at: new Date().toISOString(),
        },
      };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Episode application failed' };
    }
  });

export const createSocialDraftFromAsset = createServerFn({ method: 'POST' })
  .inputValidator((input: CreatePostShowDraftFromAssetInput) => input)
  .handler(async ({ data: input }) => createDraftApplication(input, 'social_draft'));

export const createNewsletterDraftFromAsset = createServerFn({ method: 'POST' })
  .inputValidator((input: CreatePostShowDraftFromAssetInput) => input)
  .handler(async ({ data: input }) => createDraftApplication(input, 'newsletter_draft'));

export const createPushCopyDraftFromAsset = createServerFn({ method: 'POST' })
  .inputValidator((input: CreatePostShowDraftFromAssetInput) => input)
  .handler(async ({ data: input }) => createDraftApplication(input, 'push_copy_draft'));

export const createPrescribeMeMetadataFromAsset = createServerFn({ method: 'POST' })
  .inputValidator((input: CreatePrescribeMeMetadataFromAssetInput) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; application?: PostShowApplication; error?: string }> => {
    try {
      const { user, error: authError } = await currentUser();
      if (!user) return { success: false, error: authError };

      const { asset, error: assetError } = await fetchAssetForOwner(input.asset_id, user.id);
      if (!asset) return { success: false, error: assetError };

      if (input.clip_id) {
        const { clip, error: clipError } = await fetchClipForOwner(input.clip_id, user.id);
        if (!clip) return { success: false, error: clipError };

        const plan = clipWritePlan(asset, clip, 'prescribe_me_metadata');
        const applicationResult = await insertApplication({
          ownerUserId: user.id,
          asset,
          applicationType: 'prescribe_me_metadata',
          applicationStatus: 'draft',
          appliedValue: plan.appliedValue,
          appliedMetadata: plan.appliedMetadata,
          targetField: plan.targetField,
          previousValue: plan.previousValue,
          clipId: clip.id,
          recordingId: clip.recording_id ?? asset.recording_id ?? null,
          episodeId: clip.episode_id ?? asset.episode_id ?? null,
          queueId: clip.queue_id ?? asset.queue_id ?? null,
          channelId: clip.channel_id ?? asset.channel_id ?? null,
        });
        if (!applicationResult.application) return { success: false, error: applicationResult.error };

        const applyResult = await applyClipPlan(clip, plan);
        if (!applyResult.success) return { success: false, error: applyResult.error };
        await updateApplicationStatus(applicationResult.application.id, 'applied');
        return { success: true, application: { ...applicationResult.application, application_status: 'applied' } };
      }

      if (input.episode_id) {
        const { episode, error: episodeError } = await fetchEpisodeForOwner(input.episode_id, user.id);
        if (!episode) return { success: false, error: episodeError };

        const plan = episodeWritePlan(asset, episode, 'prescribe_me_metadata');
        const applicationResult = await insertApplication({
          ownerUserId: user.id,
          asset,
          applicationType: 'prescribe_me_metadata',
          applicationStatus: 'draft',
          appliedValue: plan.appliedValue,
          appliedMetadata: plan.appliedMetadata,
          targetField: plan.targetField,
          previousValue: plan.previousValue,
          episodeId: episode.id,
          recordingId: input.recording_id ?? asset.recording_id ?? null,
          queueId: input.queue_id ?? asset.queue_id ?? null,
          channelId: input.channel_id ?? asset.channel_id ?? null,
        });
        if (!applicationResult.application) return { success: false, error: applicationResult.error };

        const applyResult = await applyEpisodePlan(episode, plan);
        if (!applyResult.success) return { success: false, error: applyResult.error };
        await updateApplicationStatus(applicationResult.application.id, 'applied');
        return { success: true, application: { ...applicationResult.application, application_status: 'applied' } };
      }

      const applicationResult = await insertApplication({
        ownerUserId: user.id,
        asset,
        applicationType: 'prescribe_me_metadata',
        applicationStatus: 'applied',
        appliedValue: JSON.stringify(buildSafePrescribeMeMetadata(asset)),
        appliedMetadata: buildSafePrescribeMeMetadata(asset),
        clipId: input.clip_id ?? null,
        recordingId: input.recording_id ?? asset.recording_id ?? null,
        episodeId: input.episode_id ?? asset.episode_id ?? null,
        queueId: input.queue_id ?? asset.queue_id ?? null,
        channelId: input.channel_id ?? asset.channel_id ?? null,
      });
      if (!applicationResult.application) return { success: false, error: applicationResult.error };
      return { success: true, application: applicationResult.application };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Prescribe Me metadata failed' };
    }
  });

export const listPostShowApplications = createServerFn({ method: 'POST' })
  .inputValidator((input: ListPostShowApplicationsInput) => input)
  .handler(async ({ data: input }): Promise<{ applications: PostShowApplication[]; error?: string }> => {
    try {
      const { user, error: authError } = await currentUser();
      if (!user) return { applications: [], error: authError };

      const isAdmin = await ensureAdmin(user.id);
      if (input.review_queue && !isAdmin) return { applications: [], error: 'Admin access required' };

      let query = (supabase as any)
        .from('tradio_post_show_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (!isAdmin || !input.review_queue) {
        query = query.eq('owner_user_id', user.id);
      }
      if (input.review_queue) query = query.eq('application_status', 'pending_review');
      if (input.application_status) query = query.eq('application_status', input.application_status);
      if (input.recording_id) query = query.eq('recording_id', input.recording_id);
      if (input.clip_id) query = query.eq('clip_id', input.clip_id);
      if (input.episode_id) query = query.eq('episode_id', input.episode_id);

      const { data, error } = await query.limit(100);
      if (error) return { applications: [], error: error.message };
      return { applications: (data || []) as PostShowApplication[] };
    } catch (err) {
      return { applications: [], error: err instanceof Error ? err.message : 'Application list failed' };
    }
  });

export const listPendingPostShowApplicationsForReview = createServerFn({ method: 'GET' })
  .handler(async (): Promise<{ applications: PostShowApplication[]; error?: string }> => {
    return listPostShowApplications({ data: { review_queue: true } });
  });

export const submitPostShowApplicationForReview = createServerFn({ method: 'POST' })
  .inputValidator((input: ReviewPostShowApplicationInput) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; error?: string }> => {
    const { user, error: authError } = await currentUser();
    if (!user) return { success: false, error: authError };

    const { data: application, error } = await (supabase as any)
      .from('tradio_post_show_applications')
      .select('id, owner_user_id, application_status, applied_metadata')
      .eq('id', input.application_id)
      .single();

    if (error || !application) return { success: false, error: 'Application not found' };
    if (application.owner_user_id !== user.id) return { success: false, error: 'Not authorized' };
    if (!['draft', 'pending_review'].includes(application.application_status)) {
      return { success: false, error: 'Only draft applications can be submitted for review' };
    }

    return updateApplicationStatus(input.application_id, 'pending_review', {
      submitted_by: user.id,
      review_notes: input.review_notes ?? '',
      submitted_at: new Date().toISOString(),
    });
  });

export const approvePostShowApplication = createServerFn({ method: 'POST' })
  .inputValidator((input: ReviewPostShowApplicationInput) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; error?: string }> => {
    try {
      const { user, error: authError } = await currentUser();
      if (!user) return { success: false, error: authError };
      const isAdmin = await ensureAdmin(user.id);
      if (!isAdmin) return { success: false, error: 'Admin access required' };

      const { data: application, error } = await (supabase as any)
        .from('tradio_post_show_applications')
        .select('*')
        .eq('id', input.application_id)
        .single();
      if (error || !application) return { success: false, error: 'Application not found' };

      const app = application as PostShowApplication;
      if (app.application_status === 'rejected' || app.application_status === 'archived') {
        return { success: false, error: 'Rejected or archived applications cannot be approved' };
      }

      if (app.clip_id && app.target_field) {
        const { data: clip } = await (supabase as any)
          .from('tradio_live_highlight_clips')
          .select('id, owner_user_id, metadata')
          .eq('id', app.clip_id)
          .single();
        if (!clip) return { success: false, error: 'Clip not found' };
        const clipRow = clip as ClipRow;
        const applyResult = await applyClipPlan(clipRow, {
          applicationType: app.application_type,
          targetField: app.target_field,
          previousValue: app.previous_value ?? null,
          appliedValue: app.applied_value,
          appliedMetadata: app.applied_metadata,
        });
        if (!applyResult.success) return applyResult;
        return updateApplicationStatus(app.id, 'applied', {
          approved_by: user.id,
          review_notes: input.review_notes ?? '',
          approved_at: new Date().toISOString(),
        });
      }

      if (app.episode_id && app.target_field) {
        const { data: episode } = await (supabase as any)
          .from('tradio_show_episodes')
          .select('id, owner_user_id, metadata')
          .eq('id', app.episode_id)
          .single();
        if (!episode) return { success: false, error: 'Episode not found' };
        const episodeRow = episode as EpisodeRow;
        const applyResult = await applyEpisodePlan(episodeRow, {
          applicationType: app.application_type,
          targetField: app.target_field,
          previousValue: app.previous_value ?? null,
          appliedValue: app.applied_value,
          appliedMetadata: app.applied_metadata,
        });
        if (!applyResult.success) return applyResult;
        return updateApplicationStatus(app.id, 'applied', {
          approved_by: user.id,
          review_notes: input.review_notes ?? '',
          approved_at: new Date().toISOString(),
        });
      }

      return updateApplicationStatus(app.id, 'approved', {
        approved_by: user.id,
        review_notes: input.review_notes ?? '',
        approved_at: new Date().toISOString(),
      });
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Application approval failed' };
    }
  });

export const rejectPostShowApplication = createServerFn({ method: 'POST' })
  .inputValidator((input: RejectPostShowApplicationInput) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; error?: string }> => {
    const { user, error: authError } = await currentUser();
    if (!user) return { success: false, error: authError };
    const isAdmin = await ensureAdmin(user.id);
    if (!isAdmin) return { success: false, error: 'Admin access required' };

    return updateApplicationStatus(input.application_id, 'rejected', {
      rejected_by: user.id,
      rejection_reason: input.rejection_reason,
      rejected_at: new Date().toISOString(),
    });
  });

export const revertPostShowApplication = createServerFn({ method: 'POST' })
  .inputValidator((input: ReviewPostShowApplicationInput) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; error?: string }> => {
    try {
      const { user, error: authError } = await currentUser();
      if (!user) return { success: false, error: authError };

      const { data: application, error } = await (supabase as any)
        .from('tradio_post_show_applications')
        .select('*')
        .eq('id', input.application_id)
        .single();
      if (error || !application) return { success: false, error: 'Application not found' };

      const app = application as PostShowApplication;
      const isAdmin = await ensureAdmin(user.id);
      if (app.owner_user_id !== user.id && !isAdmin) return { success: false, error: 'Not authorized' };

      if (app.application_status !== 'applied') {
        return updateApplicationStatus(app.id, 'reverted', {
          reverted_by: user.id,
          revert_notes: input.review_notes ?? '',
          reverted_at: new Date().toISOString(),
        });
      }

      const previousValue = app.previous_value ?? '';
      if (app.clip_id && app.target_field) {
        const { data: clip } = await (supabase as any)
          .from('tradio_live_highlight_clips')
          .select('id, owner_user_id, metadata')
          .eq('id', app.clip_id)
          .single();
        if (!clip) return { success: false, error: 'Clip not found' };

        const updateData =
          app.target_field === 'metadata.prescribe_me'
            ? { metadata: { ...((clip.metadata ?? {}) as PostShowJsonObject), prescribe_me: parsePreviousJson(previousValue) } }
            : { [app.target_field]: previousValue };

        const { error: updateError } = await (supabase as any)
          .from('tradio_live_highlight_clips')
          .update({ ...updateData, updated_at: new Date().toISOString() })
          .eq('id', app.clip_id)
          .eq('owner_user_id', clip.owner_user_id);
        if (updateError) return { success: false, error: updateError.message };
      }

      if (app.episode_id && app.target_field) {
        const { data: episode } = await (supabase as any)
          .from('tradio_show_episodes')
          .select('id, owner_user_id, metadata')
          .eq('id', app.episode_id)
          .single();
        if (!episode) return { success: false, error: 'Episode not found' };

        const updateData =
          app.target_field === 'metadata.prescribe_me'
            ? { metadata: { ...((episode.metadata ?? {}) as PostShowJsonObject), prescribe_me: parsePreviousJson(previousValue) } }
            : { [app.target_field]: previousValue };

        const { error: updateError } = await (supabase as any)
          .from('tradio_show_episodes')
          .update({ ...updateData, updated_at: new Date().toISOString() })
          .eq('id', app.episode_id)
          .eq('owner_user_id', episode.owner_user_id);
        if (updateError) return { success: false, error: updateError.message };
      }

      return updateApplicationStatus(app.id, 'reverted', {
        reverted_by: user.id,
        revert_notes: input.review_notes ?? '',
        reverted_at: new Date().toISOString(),
      });
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Application revert failed' };
    }
  });

export const getPublicPostShowAssetsForClip = createServerFn({ method: 'POST' })
  .inputValidator((input: { clip_id: string }) => input)
  .handler(async ({ data: input }): Promise<{ assets: PublicPostShowAppliedAsset[]; error?: string }> => {
    try {
      const { data: clip } = await (supabase as any)
        .from('tradio_live_highlight_clips')
        .select('id, visibility, clip_status')
        .eq('id', input.clip_id)
        .single();
      if (!clip || clip.visibility !== 'public' || clip.clip_status !== 'published') {
        return { assets: [] };
      }

      const { data, error } = await (supabase as any)
        .from('tradio_post_show_applications')
        .select('id, asset_id, application_type, application_status, target_field, applied_value, applied_metadata, applied_at, updated_at')
        .eq('clip_id', input.clip_id)
        .in('application_status', ['applied', 'approved'])
        .order('updated_at', { ascending: false });
      if (error) return { assets: [], error: error.message };

      const assets = ((data || []) as PostShowApplication[])
        .filter((app) =>
          publicPostShowApplicationVisible({
            applicationStatus: app.application_status,
            applicationType: app.application_type,
            targetVisibility: clip.visibility,
            targetStatus: clip.clip_status,
          }),
        )
        .map(toPublicAppliedAsset);

      return { assets };
    } catch (err) {
      return { assets: [], error: err instanceof Error ? err.message : 'Public clip assets failed' };
    }
  });

export const getPublicPostShowAssetsForEpisode = createServerFn({ method: 'POST' })
  .inputValidator((input: { episode_id: string }) => input)
  .handler(async ({ data: input }): Promise<{ assets: PublicPostShowAppliedAsset[]; error?: string }> => {
    try {
      const { data: episode } = await (supabase as any)
        .from('tradio_show_episodes')
        .select('id, visibility, status')
        .eq('id', input.episode_id)
        .single();
      if (!episode || episode.visibility !== 'public' || episode.status !== 'published') {
        return { assets: [] };
      }

      const { data, error } = await (supabase as any)
        .from('tradio_post_show_applications')
        .select('id, asset_id, application_type, application_status, target_field, applied_value, applied_metadata, applied_at, updated_at')
        .eq('episode_id', input.episode_id)
        .in('application_status', ['applied', 'approved'])
        .order('updated_at', { ascending: false });
      if (error) return { assets: [], error: error.message };

      const assets = ((data || []) as PostShowApplication[])
        .filter((app) =>
          publicPostShowApplicationVisible({
            applicationStatus: app.application_status,
            applicationType: app.application_type,
            targetVisibility: episode.visibility,
            targetStatus: episode.status,
          }),
        )
        .map(toPublicAppliedAsset);

      return { assets };
    } catch (err) {
      return { assets: [], error: err instanceof Error ? err.message : 'Public episode assets failed' };
    }
  });

export const listPostShowTargetsForRecording = createServerFn({ method: 'POST' })
  .inputValidator((input: { recording_id: string }) => input)
  .handler(async ({ data: input }): Promise<{ targets: PostShowPublisherTarget[]; error?: string }> => {
    try {
      const { user, error: authError } = await currentUser();
      if (!user) return { targets: [], error: authError };

      const { data: recording, error: recordingError } = await (supabase as any)
        .from('tradio_live_recordings')
        .select('id, owner_user_id, episode_id, channel_id, queue_id')
        .eq('id', input.recording_id)
        .single();
      if (recordingError || !recording) return { targets: [], error: 'Recording not found' };
      if (recording.owner_user_id !== user.id) return { targets: [], error: 'Not authorized' };

      const targets: PostShowPublisherTarget[] = [];

      const { data: clips } = await (supabase as any)
        .from('tradio_live_highlight_clips')
        .select('id, title, description, caption, visibility, clip_status, recording_id, episode_id, channel_id, queue_id')
        .eq('recording_id', input.recording_id)
        .eq('owner_user_id', user.id)
        .order('created_at', { ascending: false });

      for (const clip of clips || []) {
        targets.push({
          id: clip.id,
          target_type: 'clip',
          label: clip.title || 'Untitled clip',
          visibility: clip.visibility,
          status: clip.clip_status,
          current_title: clip.title,
          current_description: clip.description,
          current_caption: clip.caption,
          recording_id: clip.recording_id,
          episode_id: clip.episode_id,
          channel_id: clip.channel_id,
          queue_id: clip.queue_id,
        });
      }

      if (recording.episode_id) {
        const { data: episode } = await (supabase as any)
          .from('tradio_show_episodes')
          .select('id, title, description, visibility, status')
          .eq('id', recording.episode_id)
          .eq('owner_user_id', user.id)
          .single();
        if (episode) {
          targets.push({
            id: episode.id,
            target_type: 'episode',
            label: episode.title || 'Untitled episode',
            visibility: episode.visibility,
            status: episode.status,
            current_title: episode.title,
            current_description: episode.description,
            recording_id: input.recording_id,
            episode_id: episode.id,
            channel_id: recording.channel_id,
            queue_id: recording.queue_id,
          });
        }
      }

      return { targets };
    } catch (err) {
      return { targets: [], error: err instanceof Error ? err.message : 'Target list failed' };
    }
  });

function parsePreviousJson(value: string): PostShowJsonObject | null {
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as PostShowJsonObject;
    return null;
  } catch {
    return null;
  }
}

function toPublicAppliedAsset(app: PostShowApplication): PublicPostShowAppliedAsset {
  return {
    id: app.id,
    asset_id: app.asset_id,
    application_type: app.application_type,
    target_field: app.target_field ?? null,
    applied_value: app.applied_value,
    applied_metadata: app.applied_metadata,
    applied_at: app.applied_at ?? null,
    updated_at: app.updated_at,
  };
}
