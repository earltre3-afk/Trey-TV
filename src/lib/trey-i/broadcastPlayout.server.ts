import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  TradioBroadcastChannel,
  TradioBroadcastQueueItem,
  TradioBroadcastReview,
  TradioPlayoutEvent,
  ChannelNowPlaying,
  ReviewStatus,
  QueueStatus
} from "../../tradio/components/tradio/types/broadcastPlayoutTypes";

/**
 * Server Function: Schedules an episode assembly on a channel's broadcast queue.
 * Validates readiness before queueing.
 */
export const scheduleBroadcastItemServer = createServerFn({ method: "POST" })
  .inputValidator((input: {
    channelId: string;
    showId: string;
    episodeId: string;
    assemblyId: string;
    ownerUserId: string;
    scheduledStartAt: string;
    scheduledEndAt: string;
    timezone?: string;
    isLiveSlot?: boolean;
    isReplayEligible?: boolean;
    metadata?: Record<string, any>;
  }) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; queueItem?: any; error?: string }> => {
    try {
      // 1. Validate Assembly Readiness
      const { data: assembly, error: assemblyError } = await (supabaseAdmin as any)
        .from("tradio_episode_assemblies")
        .select("*")
        .eq("id", input.assemblyId)
        .single();

      if (assemblyError || !assembly) {
        return { success: false, error: "Referenced episode assembly does not exist." };
      }

      if (assembly.assembly_status !== "completed") {
        return { success: false, error: `Assembly is in status '${assembly.assembly_status}'. Must be 'completed'.` };
      }

      if (assembly.assembly_type !== "final_candidate") {
        return { success: false, error: "Only 'final_candidate' assemblies can be scheduled for public broadcast." };
      }

      if (!assembly.output_storage_path) {
        return { success: false, error: "Assembly lacks output audio storage path." };
      }

      // 2. Insert into broadcast queue
      const insertPayload = {
        channel_id: input.channelId,
        show_id: input.showId,
        episode_id: input.episodeId,
        assembly_id: input.assemblyId,
        owner_user_id: input.ownerUserId,
        queue_status: "scheduled",
        scheduled_start_at: input.scheduledStartAt,
        scheduled_end_at: input.scheduledEndAt,
        timezone: input.timezone || "America/Chicago",
        is_live_slot: input.isLiveSlot || false,
        is_replay_eligible: input.isReplayEligible !== false,
        rights_snapshot: assembly.source_manifest || {},
        readiness_snapshot: {
          assembly_status: assembly.assembly_status,
          assembly_type: assembly.assembly_type,
          duration_seconds: assembly.duration_seconds,
          block_count: assembly.block_count,
        },
        metadata: input.metadata || {},
      };

      const { data: queueItem, error: queueError } = await (supabaseAdmin as any)
        .from("tradio_broadcast_queue")
        .insert(insertPayload)
        .select()
        .single();

      if (queueError) {
        return { success: false, error: `Failed to queue broadcast item: ${queueError.message}` };
      }

      return { success: true, queueItem };
    } catch (e: any) {
      return { success: false, error: e.message || "An unexpected error occurred on the server." };
    }
  });

/**
 * Server Function: Submits an assembly for broadcast review.
 */
export const submitAssemblyForBroadcastReviewServer = createServerFn({ method: "POST" })
  .inputValidator((input: {
    channelId?: string | null;
    showId: string;
    episodeId: string;
    assemblyId: string;
    requesterUserId: string;
    reviewNotes?: string;
  }) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; review?: any; error?: string }> => {
    try {
      // Create pending review row
      const insertPayload = {
        channel_id: input.channelId || null,
        show_id: input.showId,
        episode_id: input.episodeId,
        assembly_id: input.assemblyId,
        requester_user_id: input.requesterUserId,
        review_status: "pending",
        review_notes: input.reviewNotes || "",
      };

      const { data: review, error } = await (supabaseAdmin as any)
        .from("tradio_broadcast_reviews")
        .insert(insertPayload)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Also update episode status to needs_review
      await (supabaseAdmin as any)
        .from("tradio_show_episodes")
        .update({ status: "needs_review" })
        .eq("id", input.episodeId);

      return { success: true, review };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

/**
 * Server Function: Approves or Rejects a Broadcast Review request.
 * Gated by admin check.
 */
export const approveBroadcastItemServer = createServerFn({ method: "POST" })
  .inputValidator((input: {
    reviewId: string;
    reviewerUserId: string;
    status: ReviewStatus;
    notes?: string;
    rightsNotes?: string;
    technicalNotes?: string;
  }) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; review?: any; error?: string }> => {
    try {
      // 1. Verify admin privilege
      const { data: isAdmin, error: adminErr } = await supabaseAdmin.rpc("is_admin", {
        _user_id: input.reviewerUserId,
      });

      if (adminErr || !isAdmin) {
        return { success: false, error: "Access denied. Admin permissions are required." };
      }

      // 2. Fetch current review details to get episode_id and assembly_id
      const { data: reviewDetails, error: fetchErr } = await (supabaseAdmin as any)
        .from("tradio_broadcast_reviews")
        .select("*")
        .eq("id", input.reviewId)
        .single();

      if (fetchErr || !reviewDetails) {
        return { success: false, error: "Review item not found." };
      }

      // 3. Update review record
      const updatePayload = {
        reviewer_user_id: input.reviewerUserId,
        review_status: input.status,
        review_notes: input.notes || "",
        rights_notes: input.rightsNotes || "",
        technical_notes: input.technicalNotes || "",
        updated_at: new Date().toISOString(),
      };

      const { data: updatedReview, error: updateErr } = await (supabaseAdmin as any)
        .from("tradio_broadcast_reviews")
        .update(updatePayload)
        .eq("id", input.reviewId)
        .select()
        .single();

      if (updateErr) {
        return { success: false, error: updateErr.message };
      }

      // 4. Update the parent episode status based on review status
      let nextEpisodeStatus = "draft";
      if (input.status === "approved") {
        nextEpisodeStatus = "scheduled";
      } else if (input.status === "rejected" || input.status === "needs_changes") {
        nextEpisodeStatus = "draft";
      }

      await (supabaseAdmin as any)
        .from("tradio_show_episodes")
        .update({ status: nextEpisodeStatus })
        .eq("id", reviewDetails.episode_id);

      // If approved, and we have a channel/queue entry, we can approve it in the queue too
      if (reviewDetails.queue_id && input.status === "approved") {
        await (supabaseAdmin as any)
          .from("tradio_broadcast_queue")
          .update({ queue_status: "scheduled" })
          .eq("id", reviewDetails.queue_id);
      }

      return { success: true, review: updatedReview };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

/**
 * Server Function: Resolves Now Playing and Upcoming items for a given channel.
 */
export const resolveNowPlayingServer = createServerFn({ method: "POST" })
  .inputValidator((input: { channelSlug: string }) => input)
  .handler(async ({ data: input }): Promise<ChannelNowPlaying | null> => {
    try {
      // 1. Fetch channel by slug
      const { data: channel, error: channelErr } = await (supabaseAdmin as any)
        .from("tradio_broadcast_channels")
        .select("*")
        .eq("slug", input.channelSlug)
        .single();

      if (channelErr || !channel) {
        return null;
      }

      const nowStr = new Date().toISOString();

      // 2. Fetch currently playing or scheduled queue items spanning 'now'
      const { data: currentQueueItems, error: queueErr } = await (supabaseAdmin as any)
        .from("tradio_broadcast_queue")
        .select("*, show:tradio_shows(title), episode:tradio_show_episodes(title, duration_seconds), assembly:tradio_episode_assemblies(output_storage_path, duration_seconds)")
        .eq("channel_id", channel.id)
        .eq("queue_status", "scheduled")
        .lte("scheduled_start_at", nowStr)
        .gte("scheduled_end_at", nowStr)
        .order("scheduled_start_at", { ascending: false });

      let activeItem = currentQueueItems && currentQueueItems.length > 0 ? currentQueueItems[0] : null;

      // 3. Fallback: If no scheduled items are active right now, get the most recently completed/scheduled queue item
      // to play in fallback/loop mode, so playout never goes fully silent!
      if (!activeItem) {
        const { data: recentCompleted, error: completedErr } = await (supabaseAdmin as any)
          .from("tradio_broadcast_queue")
          .select("*, show:tradio_shows(title), episode:tradio_show_episodes(title, duration_seconds), assembly:tradio_episode_assemblies(output_storage_path, duration_seconds)")
          .eq("channel_id", channel.id)
          .in("queue_status", ["scheduled", "completed", "playing"])
          .order("created_at", { ascending: false })
          .limit(1);

        if (recentCompleted && recentCompleted.length > 0) {
          activeItem = recentCompleted[0];
        }
      }

      if (!activeItem) {
        return {
          channel,
          queueItem: null,
          isFallbackFilePlayout: true,
        };
      }

      const showTitle = activeItem.show?.title || "Tradio Show";
      const episodeTitle = activeItem.episode?.title || "Live Session";
      const creatorName = "Trey TV Host";
      const durationSeconds = Number(activeItem.assembly?.duration_seconds || activeItem.episode?.duration_seconds || 1800);

      // Resolve signed URL for the assembly output audio
      let streamUrl = channel.stream_url || channel.hls_url || null;
      const isFallbackFilePlayout = !streamUrl;

      if (isFallbackFilePlayout && activeItem.assembly?.output_storage_path) {
        try {
          const { data: signedData, error: signErr } = await supabaseAdmin.storage
            .from("tradio")
            .createSignedUrl(activeItem.assembly.output_storage_path, 3600);
          if (!signErr && signedData?.signedUrl) {
            streamUrl = signedData.signedUrl;
          }
        } catch (e) {
          console.warn("[Playout] Failed to sign fallback playout URL:", e);
        }
      }

      // Compute time remaining if scheduled
      let timeRemainingSeconds = durationSeconds;
      if (activeItem.scheduled_start_at && activeItem.scheduled_end_at) {
        const startMs = new Date(activeItem.scheduled_start_at).getTime();
        const endMs = new Date(activeItem.scheduled_end_at).getTime();
        const nowMs = Date.now();
        if (nowMs >= startMs && nowMs <= endMs) {
          timeRemainingSeconds = Math.max(0, Math.floor((endMs - nowMs) / 1000));
        }
      }

      return {
        channel,
        queueItem: activeItem,
        showTitle,
        episodeTitle,
        creatorName,
        durationSeconds,
        timeRemainingSeconds,
        streamUrl,
        isFallbackFilePlayout,
      };
    } catch (e) {
      console.error("[Playout] Error in resolveNowPlayingServer:", e);
      return null;
    }
  });

/**
 * Server Function: Generates a signed playback URL for a queue item's assembly audio.
 */
export const getSignedBroadcastPlaybackUrlServer = createServerFn({ method: "POST" })
  .inputValidator((input: { queueItemId: string }) => input)
  .handler(async ({ data: input }): Promise<{ signedUrl: string | null; error?: string }> => {
    try {
      const { data: item, error } = await (supabaseAdmin as any)
        .from("tradio_broadcast_queue")
        .select("*, assembly:tradio_episode_assemblies(output_storage_path)")
        .eq("id", input.queueItemId)
        .single();

      if (error || !item) {
        return { signedUrl: null, error: "Queue item not found." };
      }

      if (!item.assembly?.output_storage_path) {
        return { signedUrl: null, error: "No assembly audio associated with this queue item." };
      }

      const { data: signedData, error: signErr } = await supabaseAdmin.storage
        .from("tradio")
        .createSignedUrl(item.assembly.output_storage_path, 7200); // 2 hours

      if (signErr || !signedData?.signedUrl) {
        return { signedUrl: null, error: "Failed to generate private signed URL." };
      }

      return { signedUrl: signedData.signedUrl };
    } catch (e: any) {
      return { signedUrl: null, error: e.message };
    }
  });

/**
 * Server Function: Logs a playout event.
 */
export const createPlayoutEventServer = createServerFn({ method: "POST" })
  .inputValidator((input: {
    channelId: string;
    queueId?: string | null;
    showId?: string | null;
    episodeId?: string | null;
    assemblyId?: string | null;
    eventType: string;
    eventStatus?: string;
    errorMessage?: string | null;
    listenerCountSnapshot?: number;
    playbackPositionSeconds?: number | null;
    metadata?: Record<string, any>;
  }) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; eventId?: string; error?: string }> => {
    try {
      const insertPayload = {
        channel_id: input.channelId,
        queue_id: input.queueId || null,
        show_id: input.showId || null,
        episode_id: input.episodeId || null,
        assembly_id: input.assemblyId || null,
        event_type: input.eventType,
        event_status: input.eventStatus || "started",
        error_message: input.errorMessage || null,
        listener_count_snapshot: input.listenerCountSnapshot || 0,
        playback_position_seconds: input.playbackPositionSeconds || null,
        metadata: input.metadata || {},
      };

      const { data: event, error } = await (supabaseAdmin as any)
        .from("tradio_playout_events")
        .insert(insertPayload)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, eventId: event.id };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });
