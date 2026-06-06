/**
 * Tradio Post-Show Producer server functions (Pass 10)
 * AI-powered post-show asset generation, management, and moderation
 */

import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { aiGenerateJson, getAIProviderName } from './aiProvider.server';
import {
  buildPostShowGenerationPrompt,
  filterDeceptiveContent,
} from './broadcastPostShowPrompts';
import type {
  PostShowAsset,
  PostShowJsonObject,
  PostShowSourceSnapshot,
  PostShowAIPackageResponse,
  CreatePostShowAssetInput,
  GeneratePostShowPackageInput,
  UpdatePostShowAssetInput,
  ApprovePostShowAssetInput,
  RejectPostShowAssetInput,
  ArchivePostShowAssetInput,
  PublishPostShowAssetInput,
} from './broadcastPostShowTypes';
import {
  verifyTradioAccessToken,
  type TradioAuthenticatedInput,
  type TradioServerAuthClient,
} from './tradioServerAuth';

const supabase = supabaseAdmin;

const AI_PROVIDER_UNAVAILABLE_COPY =
  'AI provider unavailable. Continue manually; no AI output was generated.';

function isAIProviderUnavailableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /configuration error|api_key|environment variable|not configured|unauthorized|forbidden|provider unavailable/i.test(
    message,
  );
}

function buildSourceReference(input: GeneratePostShowPackageInput | { source_type: string; source_id: string }) {
  return {
    channel_id: null,
    show_id: null,
    episode_id: input.source_type === 'episode' ? input.source_id : null,
    queue_id: input.source_type === 'queue_item' ? input.source_id : null,
    recording_id: input.source_type === 'recording' ? input.source_id : null,
    clip_id: input.source_type === 'clip' ? input.source_id : null,
  };
}

async function ensureAdmin(userId: string): Promise<boolean> {
  const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: userId });
  return isAdmin === true;
}

async function currentUser(accessToken: string): Promise<{ id: string } | null> {
  try {
    const { verifiedUserId } = await verifyTradioAccessToken(
      accessToken,
      supabase as unknown as TradioServerAuthClient,
    );
    return { id: verifiedUserId };
  } catch {
    return null;
  }
}

interface RecordingDurationRow {
  duration_seconds?: number | null;
  session_id?: string | null;
}

interface ReactionTypeRow {
  reaction_type?: string | null;
}

function sanitizePublicMetadata(metadata: unknown): PostShowJsonObject {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return {};
  }

  const source = metadata as Record<string, unknown>;
  const safe: PostShowJsonObject = {};

  if (Array.isArray(source.tags)) {
    safe.tags = source.tags.filter((tag): tag is string => typeof tag === 'string').slice(0, 12);
  }

  if (typeof source.content_warning === 'string') {
    safe.content_warning = source.content_warning;
  }

  return safe;
}

/**
 * Build source snapshot from recording/clip/episode data
 */
export async function buildPostShowSourceSnapshot(
  sourceType: 'recording' | 'clip' | 'episode' | 'queue_item',
  sourceId: string,
  verifiedUserId: string,
): Promise<{ snapshot: PostShowSourceSnapshot; error?: string }> {
  try {
    const snapshot: PostShowSourceSnapshot = {};

    if (sourceType === 'recording') {
      const { data: recording } = await (supabase as any)
        .from('tradio_live_recordings')
        .select('owner_user_id, duration_seconds, recording_type, session_id, tradio_broadcast_channels(title), tradio_shows(title)')
        .eq('id', sourceId)
        .single();

      if (!recording) return { snapshot: {}, error: 'Recording not found' };
      if (recording.owner_user_id !== verifiedUserId) return { snapshot: {}, error: 'Not authorized' };

      snapshot.recording_duration_seconds = recording.duration_seconds;
      snapshot.channel_title = (recording.tradio_broadcast_channels as any)?.title;
      snapshot.show_title = (recording.tradio_shows as any)?.title;
      snapshot.live_mode = recording.recording_type === 'live_session';

      // Fetch segments
      const { data: segments } = await (supabase as any)
        .from('tradio_live_recording_segments')
        .select('segment_type')
        .eq('recording_id', sourceId);

      if (segments?.length) {
        snapshot.segment_type = segments[0].segment_type;
      }

      // Fetch events for this session
      await enrichSnapshotFromEvents(snapshot, recording.session_id);
    } else if (sourceType === 'clip') {
      const { data: clip } = await (supabase as any)
        .from('tradio_live_highlight_clips')
        .select('owner_user_id, title, duration_seconds, mood_tags, genre_tags, audience_tags, recording_id, tradio_broadcast_channels(title), tradio_shows(title)')
        .eq('id', sourceId)
        .single();

      if (!clip) return { snapshot: {}, error: 'Clip not found' };
      if (clip.owner_user_id !== verifiedUserId) return { snapshot: {}, error: 'Not authorized' };

      snapshot.clip_title = clip.title;
      snapshot.clip_duration_seconds = clip.duration_seconds;
      snapshot.mood_tags = clip.mood_tags;
      snapshot.genre_tags = clip.genre_tags;
      snapshot.audience_tags = clip.audience_tags;
      snapshot.channel_title = (clip.tradio_broadcast_channels as any)?.title;
      snapshot.show_title = (clip.tradio_shows as any)?.title;

      // Fetch recording for additional context
      if (clip.recording_id) {
        const { data: recording } = await (supabase as any)
          .from('tradio_live_recordings')
          .select('session_id, duration_seconds')
          .eq('id', clip.recording_id)
          .single();

        if (recording) {
          snapshot.recording_duration_seconds = recording.duration_seconds;
          await enrichSnapshotFromEvents(snapshot, recording.session_id);
        }
      }
    } else if (sourceType === 'episode') {
      const { data: episode } = await (supabase as any)
        .from('tradio_show_episodes')
        .select('owner_user_id, title, tradio_shows(title), tradio_broadcast_channels(title)')
        .eq('id', sourceId)
        .single();

      if (!episode) return { snapshot: {}, error: 'Episode not found' };
      if (episode.owner_user_id !== verifiedUserId) return { snapshot: {}, error: 'Not authorized' };

      snapshot.episode_title = episode.title;
      snapshot.show_title = (episode.tradio_shows as any)?.title;
      snapshot.channel_title = (episode.tradio_broadcast_channels as any)?.title;

      // Fetch associated recordings
      const { data: recordings } = await (supabase as any)
        .from('tradio_live_recordings')
        .select('duration_seconds, session_id')
        .eq('episode_id', sourceId);

      if (recordings?.length) {
        const recordingRows = recordings as RecordingDurationRow[];
        snapshot.recording_duration_seconds = recordingRows.reduce(
          (sum: number, row: RecordingDurationRow) => sum + (row.duration_seconds || 0),
          0,
        );
        for (const row of recordingRows) {
          if (row.session_id) {
            await enrichSnapshotFromEvents(snapshot, row.session_id);
          }
        }
      }
    } else if (sourceType === 'queue_item') {
      const { data: item } = await (supabase as any)
        .from('tradio_broadcast_queue')
        .select('owner_user_id, tradio_broadcast_channels(title), tradio_shows(title)')
        .eq('id', sourceId)
        .single();

      if (!item) return { snapshot: {}, error: 'Queue item not found' };
      if (item.owner_user_id !== verifiedUserId) return { snapshot: {}, error: 'Not authorized' };

      snapshot.channel_title = (item.tradio_broadcast_channels as any)?.title;
      snapshot.show_title = (item.tradio_shows as any)?.title;
    }

    return { snapshot };
  } catch (err) {
    return {
      snapshot: {},
      error: `Failed to build snapshot: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Enrich snapshot with event data from live room
 */
async function enrichSnapshotFromEvents(snapshot: PostShowSourceSnapshot, sessionId: string): Promise<void> {
  try {
    // Fetch reactions
    const { data: reactions } = await (supabase as any)
      .from('tradio_broadcast_reactions')
      .select('reaction_type')
      .eq('session_id', sessionId);

    if (reactions?.length) {
      const reactionRows = reactions as ReactionTypeRow[];
      snapshot.reaction_count = reactionRows.length;
      snapshot.top_reaction_types = [
        ...new Set(
          reactionRows
            .map((row: ReactionTypeRow) => row.reaction_type)
            .filter((reactionType): reactionType is string => Boolean(reactionType)),
        ),
      ].slice(0, 5);
    }

    // Fetch chat messages
    const { data: chat } = await (supabase as any)
      .from('tradio_live_chat_messages')
      .select('id')
      .eq('session_id', sessionId);

    if (chat?.length) {
      snapshot.chat_count = chat.length;
    }

    // Fetch polls
    const { data: polls } = await (supabase as any)
      .from('tradio_live_polls')
      .select('question, top_option, top_percentage')
      .eq('session_id', sessionId);

    if (polls?.length) {
      snapshot.poll_results = polls.map((p: any) => ({
        question: p.question,
        winner: p.top_option,
        percentage: p.top_percentage,
      }));
    }

    // Fetch call-in moments
    const { data: callIns } = await (supabase as any)
      .from('tradio_live_call_requests')
      .select('duration_seconds')
      .eq('session_id', sessionId)
      .eq('request_status', 'approved');

    if (callIns?.length) {
      snapshot.call_in_moments = callIns.map((c: any, index: number) => ({
        name: `Caller ${index + 1}`,
        duration_seconds: c.duration_seconds || 60,
      }));
    }

    // Fetch SFX events
    const { data: sfx } = await (supabase as any)
      .from('tradio_live_sfx_events')
      .select('sfx_name')
      .eq('session_id', sessionId);

    if (sfx?.length) {
      const sfxCounts: Record<string, number> = {};
      sfx.forEach((s: any) => {
        sfxCounts[s.sfx_name || 'SFX'] = (sfxCounts[s.sfx_name || 'SFX'] || 0) + 1;
      });
      snapshot.sfx_events = Object.entries(sfxCounts).map(([name, count]) => ({
        name,
        count,
      }));
    }
  } catch {
    // Silently fail enrichment; snapshot is still usable
  }
}

/**
 * Generate post-show package with AI
 */
export const generatePostShowPackageServer = createServerFn({ method: "POST" })
  .inputValidator((input: GeneratePostShowPackageInput) => input)
  .handler(async ({ data: input }): Promise<{
    success: boolean;
    run_id?: string;
    error?: string;
    provider_unavailable?: boolean;
  }> => {
    try {
      const user = await currentUser(input.accessToken);
      if (!user) return { success: false, error: 'Not authenticated' };

      // Build source snapshot
      const { snapshot, error: snapError } = await buildPostShowSourceSnapshot(
        input.source_type,
        input.source_id,
        user.id,
      );

      if (snapError) {
        return { success: false, error: snapError };
      }

      const includeFollowUps = input.include_follow_ups ?? input.asset_types.includes('follow_up_topic');
      const sourceRefs = buildSourceReference(input);

      // Create run record
      const { data: run, error: runError } = await (supabase as any)
        .from('tradio_post_show_runs')
        .insert({
          owner_user_id: user.id,
          ...sourceRefs,
          run_status: 'running',
          run_type: 'post_show_package',
          requested_asset_types: input.asset_types,
          source_snapshot: snapshot,
          ai_provider: getAIProviderName(),
          ai_model: 'gemini-2.5-flash',
        })
        .select('id')
        .single();

      if (runError || !run) {
        return { success: false, error: 'Failed to create run record' };
      }

      // Generate with AI
      const prompt = buildPostShowGenerationPrompt(snapshot, input.asset_types, includeFollowUps);

      try {
        const aiResponse = await aiGenerateJson<PostShowAIPackageResponse>({
          prompt,
          systemInstruction:
            'Return strictly valid JSON for post-show producer assets. Do not include markdown.',
          temperature: 0.7,
          maxTokens: 2048,
        });

        const parsedResponse: PostShowAIPackageResponse = {
          assets: Array.isArray(aiResponse.assets) ? aiResponse.assets : [],
          followUpTopics: Array.isArray(aiResponse.followUpTopics) ? aiResponse.followUpTopics : [],
          warnings: Array.isArray(aiResponse.warnings) ? aiResponse.warnings : [],
        };

        parsedResponse.assets.forEach((asset, index) => {
          if (!asset.assetType) throw new Error(`Asset ${index}: missing assetType`);
          if (!asset.body) throw new Error(`Asset ${index}: missing body`);
          if (!asset.platform) throw new Error(`Asset ${index}: missing platform`);
        });

        const { response: filteredResponse } = filterDeceptiveContent(parsedResponse);

        // Save generated assets
        const generatedAssets = filteredResponse.assets.map((asset) => ({
          owner_user_id: user.id,
          ...sourceRefs,
          asset_type: asset.assetType,
          asset_status: 'generated',
          visibility: 'private',
          title: asset.title,
          body: asset.body,
          platform: asset.platform,
          tone: asset.tone,
          ai_provider: getAIProviderName(),
          ai_model: 'gemini-2.5-flash',
          prompt_input: { source_type: input.source_type, source_id: input.source_id },
          source_snapshot: snapshot,
          metadata: asset.metadata || {},
        }));

        const followUpAssets = includeFollowUps
          ? (filteredResponse.followUpTopics ?? []).map((topic) => ({
              owner_user_id: user.id,
              ...sourceRefs,
              asset_type: 'follow_up_topic',
              asset_status: 'generated',
              visibility: 'private',
              title: topic.title,
              body: topic.reason,
              platform: 'tradio',
              tone: input.tone,
              ai_provider: getAIProviderName(),
              ai_model: 'gemini-2.5-flash',
              prompt_input: { source_type: input.source_type, source_id: input.source_id },
              source_snapshot: snapshot,
              metadata: {
                tags: topic.tags ?? [],
                source: 'ai_follow_up_topic',
              },
            }))
          : [];

        const assets = [...generatedAssets, ...followUpAssets];

        if (assets.length > 0) {
          const { error: insertError } = await (supabase as any)
            .from('tradio_post_show_assets')
            .insert(assets);

          if (insertError) throw insertError;
        }

        // Update run as completed
        await (supabase as any)
          .from('tradio_post_show_runs')
          .update({
            run_status: 'completed',
            output_summary: {
              asset_count: assets.length,
              follow_up_topics: followUpAssets.length,
              warnings: parsedResponse.warnings,
            },
            completed_at: new Date().toISOString(),
          })
          .eq('id', run.id);

        return { success: true, run_id: run.id };
      } catch (aiError) {
        // Mark run as failed
        await (supabase as any)
          .from('tradio_post_show_runs')
          .update({
            run_status: 'failed',
            error_message: aiError instanceof Error ? aiError.message : 'AI generation failed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', run.id);

        if (isAIProviderUnavailableError(aiError)) {
          return {
            success: false,
            provider_unavailable: true,
            run_id: run.id,
            error: AI_PROVIDER_UNAVAILABLE_COPY,
          };
        }

        return {
          success: false,
          error: `AI generation failed: ${aiError instanceof Error ? aiError.message : String(aiError)}`,
        };
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Generation failed',
      };
    }
  });

/**
 * Create a manual post-show asset when AI is unavailable or the creator wants full control.
 */
export const createPostShowAssetServer = createServerFn({ method: "POST" })
  .inputValidator((input: CreatePostShowAssetInput) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; asset?: PostShowAsset; error?: string }> => {
    try {
      const user = await currentUser(input.accessToken);
      if (!user) return { success: false, error: 'Not authenticated' };

      if (!input.body.trim()) {
        return { success: false, error: 'Manual asset body is required' };
      }

      const { data: recording } = await (supabase as any)
        .from('tradio_live_recordings')
        .select('id, owner_user_id')
        .eq('id', input.recording_id)
        .single();

      if (!recording || recording.owner_user_id !== user.id) {
        return { success: false, error: 'Not authorized' };
      }

      const { snapshot } = await buildPostShowSourceSnapshot('recording', input.recording_id, user.id);

      const { data: asset, error } = await (supabase as any)
        .from('tradio_post_show_assets')
        .insert({
          owner_user_id: user.id,
          recording_id: input.recording_id,
          asset_type: input.asset_type,
          asset_status: 'draft',
          visibility: 'private',
          title: input.title?.trim() || null,
          body: input.body.trim(),
          platform: input.platform || 'tradio',
          tone: input.tone || 'manual',
          prompt_input: { source_type: 'recording', source_id: input.recording_id, manual: true },
          source_snapshot: snapshot,
          moderation_snapshot: {},
          metadata: { source: 'manual_creation' },
        })
        .select('*')
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, asset };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Manual asset creation failed' };
    }
  });

/**
 * Update post-show asset
 */
export const updatePostShowAssetServer = createServerFn({ method: "POST" })
  .inputValidator((input: UpdatePostShowAssetInput) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; error?: string }> => {
    try {
      const user = await currentUser(input.accessToken);
      if (!user) return { success: false, error: 'Not authenticated' };

      // Verify ownership
      const { data: asset } = await (supabase as any)
        .from('tradio_post_show_assets')
        .select('id, owner_user_id, title, body, asset_status')
        .eq('id', input.asset_id)
        .single();

      if (!asset || asset.owner_user_id !== user.id) {
        return { success: false, error: 'Not authorized' };
      }

      if (input.asset_status && ['approved', 'published', 'rejected'].includes(input.asset_status)) {
        return { success: false, error: 'This status requires the review or publish flow' };
      }

      if (input.visibility && input.visibility !== 'private') {
        return { success: false, error: 'Creator edits cannot make post-show assets public' };
      }

      // Get previous revision
      const { data: lastRevision } = await (supabase as any)
        .from('tradio_post_show_asset_revisions')
        .select('revision_number')
        .eq('asset_id', input.asset_id)
        .order('revision_number', { ascending: false })
        .limit(1)
        .single();

      const nextRevisionNumber = (lastRevision?.revision_number || 0) + 1;

      // Create revision
      await (supabase as any)
        .from('tradio_post_show_asset_revisions')
        .insert({
          asset_id: input.asset_id,
          owner_user_id: user.id,
          revision_number: nextRevisionNumber,
          title: input.title ?? asset.title,
          body: input.body ?? asset.body,
          edit_reason: input.edit_reason,
          editor_type: 'human',
        });

      // Update asset
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (input.title !== undefined) updateData.title = input.title;
      if (input.body !== undefined) updateData.body = input.body;
      if (input.asset_status !== undefined) updateData.asset_status = input.asset_status;
      if (input.visibility !== undefined) updateData.visibility = input.visibility;

      if (input.asset_status === 'pending_review') {
        updateData.asset_status = 'pending_review';
        updateData.visibility = 'private';
      }

      if (input.asset_status === 'archived') {
        updateData.visibility = 'private';
      }

      const { error } = await (supabase as any)
        .from('tradio_post_show_assets')
        .update(updateData)
        .eq('id', input.asset_id)
        .eq('owner_user_id', user.id);

      if (error) return { success: false, error: error.message };

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Update failed' };
    }
  });

/**
 * Approve post-show asset (admin only)
 */
export const approvePostShowAssetServer = createServerFn({ method: "POST" })
  .inputValidator((input: ApprovePostShowAssetInput) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; error?: string }> => {
    try {
      const user = await currentUser(input.accessToken);
      if (!user) return { success: false, error: 'Not authenticated' };

      // Check admin status
      const isAdmin = await ensureAdmin(user.id);
      if (!isAdmin) return { success: false, error: 'Admin access required' };

      // Update asset
      const { error } = await (supabase as any)
        .from('tradio_post_show_assets')
        .update({
          asset_status: 'approved',
          visibility: 'private',
          approved_at: new Date().toISOString(),
          moderation_snapshot: {
            approved_by: user.id,
            moderation_notes: input.moderation_notes,
            approved_at: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.asset_id);

      if (error) return { success: false, error: error.message };

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Approval failed' };
    }
  });

/**
 * Reject post-show asset (admin only)
 */
export const rejectPostShowAssetServer = createServerFn({ method: "POST" })
  .inputValidator((input: RejectPostShowAssetInput) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; error?: string }> => {
    try {
      const user = await currentUser(input.accessToken);
      if (!user) return { success: false, error: 'Not authenticated' };

      // Check admin status
      const isAdmin = await ensureAdmin(user.id);
      if (!isAdmin) return { success: false, error: 'Admin access required' };

      // Update asset
      const { error } = await (supabase as any)
        .from('tradio_post_show_assets')
        .update({
          asset_status: 'rejected',
          visibility: 'private',
          moderation_snapshot: {
            rejected_by: user.id,
            rejection_reason: input.rejection_reason,
            rejected_at: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.asset_id);

      if (error) return { success: false, error: error.message };

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Rejection failed' };
    }
  });

/**
 * Archive post-show asset (admin only)
 */
export const archivePostShowAssetServer = createServerFn({ method: "POST" })
  .inputValidator((input: ArchivePostShowAssetInput) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; error?: string }> => {
    try {
      const user = await currentUser(input.accessToken);
      if (!user) return { success: false, error: 'Not authenticated' };

      const isAdmin = await ensureAdmin(user.id);
      if (!isAdmin) return { success: false, error: 'Admin access required' };

      const { error } = await (supabase as any)
        .from('tradio_post_show_assets')
        .update({
          asset_status: 'archived',
          visibility: 'private',
          moderation_snapshot: {
            archived_by: user.id,
            moderation_notes: input.moderation_notes,
            archived_at: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.asset_id);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Archive failed' };
    }
  });

/**
 * Publish approved post-show asset. Generated or pending assets never become public here.
 */
export const publishPostShowAssetServer = createServerFn({ method: "POST" })
  .inputValidator((input: PublishPostShowAssetInput) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; error?: string }> => {
    try {
      const user = await currentUser(input.accessToken);
      if (!user) return { success: false, error: 'Not authenticated' };

      const { data: asset } = await (supabase as any)
        .from('tradio_post_show_assets')
        .select('id, owner_user_id, asset_status')
        .eq('id', input.asset_id)
        .single();

      if (!asset || asset.owner_user_id !== user.id) {
        return { success: false, error: 'Not authorized' };
      }

      if (asset.asset_status !== 'approved' && asset.asset_status !== 'published') {
        return { success: false, error: 'Only approved post-show assets can be published' };
      }

      if (!['public', 'unlisted'].includes(input.visibility)) {
        return { success: false, error: 'Publish visibility must be public or unlisted' };
      }

      const { error } = await (supabase as any)
        .from('tradio_post_show_assets')
        .update({
          asset_status: 'published',
          visibility: input.visibility,
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.asset_id)
        .eq('owner_user_id', user.id);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Publish failed' };
    }
  });

/**
 * List generated and pending post-show assets for admin review.
 */
export const listPendingPostShowAssetsForReviewServer = createServerFn({ method: "POST" })
  .inputValidator((input: TradioAuthenticatedInput) => input)
  .handler(async ({ data: input }): Promise<{ assets: PostShowAsset[]; error?: string }> => {
    try {
      const user = await currentUser(input.accessToken);
      if (!user) return { assets: [], error: 'Not authenticated' };

      const isAdmin = await ensureAdmin(user.id);
      if (!isAdmin) return { assets: [], error: 'Admin access required' };

      const { data, error } = await (supabase as any)
        .from('tradio_post_show_assets')
        .select('*')
        .in('asset_status', ['generated', 'pending_review'])
        .order('created_at', { ascending: true });

      if (error) return { assets: [], error: error.message };
      return { assets: data || [] };
    } catch (err) {
      return { assets: [], error: err instanceof Error ? err.message : 'Review queue failed' };
    }
  });

/**
 * Public post-show reads are restricted to explicitly published public assets.
 */
export const listPublicPostShowAssetsServer = createServerFn({ method: "POST" })
  .inputValidator((input: { recording_id?: string; clip_id?: string }) => input)
  .handler(async ({ data: input }): Promise<{ assets: PostShowAsset[]; error?: string }> => {
    try {
      let query = (supabase as any)
        .from('tradio_post_show_assets')
        .select(
          'id, owner_user_id, asset_type, asset_status, visibility, title, body, platform, tone, language, metadata, approved_at, published_at, created_at, updated_at',
        )
        .eq('asset_status', 'published')
        .eq('visibility', 'public');

      if (input.recording_id) query = query.eq('recording_id', input.recording_id);
      if (input.clip_id) query = query.eq('clip_id', input.clip_id);

      const { data, error } = await query.order('published_at', { ascending: false });
      if (error) return { assets: [], error: error.message };
      const assets = (data || []).map((asset: any): PostShowAsset => ({
        id: asset.id,
        owner_user_id: asset.owner_user_id,
        asset_type: asset.asset_type,
        asset_status: 'published',
        visibility: 'public',
        ...(asset.title !== null && asset.title !== undefined ? { title: asset.title } : {}),
        body: asset.body,
        ...(asset.platform !== null && asset.platform !== undefined ? { platform: asset.platform } : {}),
        ...(asset.tone !== null && asset.tone !== undefined ? { tone: asset.tone } : {}),
        language: asset.language || 'en',
        prompt_input: {},
        source_snapshot: {},
        moderation_snapshot: {},
        metadata: sanitizePublicMetadata(asset.metadata),
        ...(asset.approved_at !== null && asset.approved_at !== undefined ? { approved_at: asset.approved_at } : {}),
        ...(asset.published_at !== null && asset.published_at !== undefined ? { published_at: asset.published_at } : {}),
        created_at: asset.created_at,
        updated_at: asset.updated_at,
      }));
      return { assets };
    } catch (err) {
      return { assets: [], error: err instanceof Error ? err.message : 'Public asset list failed' };
    }
  });

/**
 * List post-show assets for a recording
 */
export const listPostShowRecordingsServer = createServerFn({ method: "POST" })
  .inputValidator((input: TradioAuthenticatedInput & { limit?: number }) => input)
  .handler(async ({ data: input }): Promise<{
    recordings: Array<{
      id: string;
      recording_status?: string;
      duration_seconds?: number | null;
      created_at: string;
      channel_id?: string | null;
      show_id?: string | null;
      episode_id?: string | null;
    }>;
    error?: string;
  }> => {
    try {
      const user = await currentUser(input.accessToken);
      if (!user) return { recordings: [], error: 'Not authenticated' };

      const { data, error } = await (supabase as any)
        .from('tradio_live_recordings')
        .select('id, recording_status, duration_seconds, created_at, channel_id, show_id, episode_id')
        .eq('owner_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(input.limit ?? 25);

      if (error) return { recordings: [], error: error.message };
      return { recordings: data || [] };
    } catch (err) {
      return { recordings: [], error: err instanceof Error ? err.message : 'Recording list failed' };
    }
  });

export const listPostShowAssetsForRecordingServer = createServerFn({ method: "POST" })
  .inputValidator((input: TradioAuthenticatedInput & { recording_id: string }) => input)
  .handler(async ({ data: input }): Promise<{ assets: PostShowAsset[]; error?: string }> => {
    try {
      const user = await currentUser(input.accessToken);
      if (!user) return { assets: [], error: 'Not authenticated' };

      // Check user owns recording
      const { data: recording } = await (supabase as any)
        .from('tradio_live_recordings')
        .select('owner_user_id')
        .eq('id', input.recording_id)
        .single();

      if (!recording || recording.owner_user_id !== user.id) {
        return { assets: [], error: 'Not authorized' };
      }

      const { data: assets } = await (supabase as any)
        .from('tradio_post_show_assets')
        .select('*')
        .eq('recording_id', input.recording_id)
        .order('created_at', { ascending: false });

      return { assets: assets || [] };
    } catch (err) {
      return {
        assets: [],
        error: err instanceof Error ? err.message : 'List failed',
      };
    }
  });

export {
  applyPostShowAssetToClip,
  applyPostShowAssetToEpisode,
  approvePostShowApplication,
  createNewsletterDraftFromAsset,
  createPrescribeMeMetadataFromAsset,
  createPushCopyDraftFromAsset,
  createSocialDraftFromAsset,
  getPublicPostShowAssetsForClip,
  getPublicPostShowAssetsForEpisode,
  listPendingPostShowApplicationsForReview,
  listPostShowApplications,
  listPostShowTargetsForRecording,
  rejectPostShowApplication,
  revertPostShowApplication,
  submitPostShowApplicationForReview,
} from './broadcastPostShowPublisher.server';

export {
  archiveDistributionDraft,
  approveDistributionDraft,
  buildDistributionSourceSnapshot,
  buildPrescribeMeSignalsFromDistributionDraft,
  cancelDistributionDraftReminder,
  createDistributionDraftFromApplication,
  createDistributionDraftFromAsset,
  createDistributionDraftManually,
  incrementDistributionDraftCopyCount,
  listDistributionDrafts,
  listDistributionDraftsForClip,
  listDistributionDraftsForEpisode,
  listPendingDistributionDraftReviews,
  markDistributionDraftReady,
  markDistributionDraftUsed,
  rejectDistributionDraft,
  scheduleDistributionDraftReminder,
  submitDistributionDraftForReview,
  updateDistributionDraft,
} from './broadcastDistribution.server';
