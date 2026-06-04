import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  TradioListeningSession,
  TradioBroadcastReaction,
  ChannelPulseSummary,
  ReactionType,
  PlaybackMode,
} from "../../tradio/components/tradio/types/broadcastListenerTypes";

/**
 * Server Function: Starts a listener session.
 */
export const startListeningSessionServer = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      channelId: string;
      userId?: string | null;
      anonymousSessionId?: string | null;
      playbackMode: PlaybackMode;
      queueId?: string | null;
      showId?: string | null;
      episodeId?: string | null;
      assemblyId?: string | null;
      deviceType?: string;
      appSurface?: string;
      referrerSurface?: string;
    }) => input,
  )
  .handler(
    async ({ data: input }): Promise<{ success: boolean; sessionId?: string; error?: string }> => {
      try {
        const insertPayload = {
          channel_id: input.channelId,
          user_id: input.userId || null,
          anonymous_session_id: input.anonymousSessionId || null,
          playback_mode: input.playbackMode,
          queue_id: input.queueId || null,
          show_id: input.showId || null,
          episode_id: input.episodeId || null,
          assembly_id: input.assemblyId || null,
          device_type: input.deviceType || "web-browser",
          app_surface: input.appSurface || "tradio-pulse",
          referrer_surface: input.referrerSurface || null,
          listen_duration_seconds: 0,
          started_at: new Date().toISOString(),
          metadata: {},
        };

        const { data: session, error: sessionErr } = await (supabaseAdmin as any)
          .from("tradio_broadcast_listening_sessions")
          .insert(insertPayload)
          .select()
          .single();

        if (sessionErr || !session) {
          return { success: false, error: `Failed to open session: ${sessionErr?.message}` };
        }

        // Record 'start' retention checkpoint event
        await (supabaseAdmin as any).from("tradio_broadcast_retention_events").insert({
          listening_session_id: session.id,
          channel_id: input.channelId,
          queue_id: input.queueId || null,
          episode_id: input.episodeId || null,
          playback_position_seconds: 0,
          percent_complete: 0,
          event_type: "start",
          metadata: {},
        });

        return { success: true, sessionId: session.id };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    },
  );

/**
 * Server Function: Records session heartbeats and advances listen durations.
 */
export const heartbeatListeningSessionServer = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      sessionId: string;
      channelId: string;
      durationIncrementSeconds: number;
      lastPlaybackPositionSeconds: number;
      percentComplete?: number;
      queueId?: string | null;
      episodeId?: string | null;
    }) => input,
  )
  .handler(async ({ data: input }): Promise<{ success: boolean; error?: string }> => {
    try {
      // 1. Fetch current session to read existing duration
      const { data: session, error: fetchErr } = await (supabaseAdmin as any)
        .from("tradio_broadcast_listening_sessions")
        .select("listen_duration_seconds")
        .eq("id", input.sessionId)
        .single();

      if (fetchErr || !session) {
        return { success: false, error: "Listening session not found." };
      }

      const nextDuration =
        Number(session.listen_duration_seconds || 0) + input.durationIncrementSeconds;

      // 2. Update session record
      await (supabaseAdmin as any)
        .from("tradio_broadcast_listening_sessions")
        .update({
          listen_duration_seconds: nextDuration,
          last_playback_position_seconds: input.lastPlaybackPositionSeconds,
          completion_rate: input.percentComplete || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.sessionId);

      // 3. Log a heartbeat checkpoint
      await (supabaseAdmin as any).from("tradio_broadcast_retention_events").insert({
        listening_session_id: input.sessionId,
        channel_id: input.channelId,
        queue_id: input.queueId || null,
        episode_id: input.episodeId || null,
        playback_position_seconds: input.lastPlaybackPositionSeconds,
        percent_complete: input.percentComplete || null,
        event_type: "heartbeat",
        metadata: {},
      });

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

/**
 * Server Function: Completes and exits a listener session.
 */
export const completeListeningSessionServer = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      sessionId: string;
      channelId: string;
      finalPlaybackPositionSeconds: number;
      percentComplete?: number;
      queueId?: string | null;
      episodeId?: string | null;
      isCompletion?: boolean;
    }) => input,
  )
  .handler(async ({ data: input }): Promise<{ success: boolean; error?: string }> => {
    try {
      const eventType = input.isCompletion ? "complete" : "exit";

      await (supabaseAdmin as any)
        .from("tradio_broadcast_listening_sessions")
        .update({
          ended_at: new Date().toISOString(),
          last_playback_position_seconds: input.finalPlaybackPositionSeconds,
          completion_rate: input.percentComplete || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.sessionId);

      // Log exit/complete event
      await (supabaseAdmin as any).from("tradio_broadcast_retention_events").insert({
        listening_session_id: input.sessionId,
        channel_id: input.channelId,
        queue_id: input.queueId || null,
        episode_id: input.episodeId || null,
        playback_position_seconds: input.finalPlaybackPositionSeconds,
        percent_complete: input.percentComplete || null,
        event_type: eventType,
        metadata: {},
      });

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

/**
 * Server Function: Creates a fast broadcast reaction.
 */
export const createReactionServer = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      channelId: string;
      reactionType: ReactionType;
      userId?: string | null;
      queueId?: string | null;
      showId?: string | null;
      episodeId?: string | null;
      assemblyId?: string | null;
      playbackPositionSeconds?: number | null;
      isLive?: boolean;
      metadata?: Record<string, any>;
    }) => input,
  )
  .handler(
    async ({ data: input }): Promise<{ success: boolean; reaction?: any; error?: string }> => {
      try {
        const insertPayload = {
          channel_id: input.channelId,
          reaction_type: input.reactionType,
          user_id: input.userId || null,
          queue_id: input.queueId || null,
          show_id: input.showId || null,
          episode_id: input.episodeId || null,
          assembly_id: input.assemblyId || null,
          playback_position_seconds: input.playbackPositionSeconds || null,
          is_live: input.isLive || false,
          metadata: input.metadata || {},
        };

        const { data: reaction, error } = await (supabaseAdmin as any)
          .from("tradio_broadcast_reactions")
          .insert(insertPayload)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true, reaction };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    },
  );

/**
 * Server Function: Resolves current pulse details of a channel.
 */
export const resolvePublicChannelPulseServer = createServerFn({ method: "POST" })
  .inputValidator((input: { channelId: string }) => input)
  .handler(async ({ data: input }): Promise<ChannelPulseSummary | null> => {
    try {
      const nowStr = new Date().toISOString();
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      // 1. Fetch active listeners (sessions updated in last 10 minutes and ended_at is null)
      const { count: activeListeners, error: sessionsErr } = await (supabaseAdmin as any)
        .from("tradio_broadcast_listening_sessions")
        .select("*", { count: "exact", head: true })
        .eq("channel_id", input.channelId)
        .is("ended_at", null)
        .gte("updated_at", tenMinutesAgo);

      if (sessionsErr) throw sessionsErr;

      // 2. Fetch recent reactions count
      const { count: recentReactions, error: reactErr } = await (supabaseAdmin as any)
        .from("tradio_broadcast_reactions")
        .select("*", { count: "exact", head: true })
        .eq("channel_id", input.channelId)
        .gte("created_at", tenMinutesAgo);

      // 3. Fetch followers count
      const { count: followersCount, error: followErr } = await (supabaseAdmin as any)
        .from("tradio_channel_follows")
        .select("*", { count: "exact", head: true })
        .eq("channel_id", input.channelId);

      // 4. Resolve top reaction type in the last hour
      const { data: reactionsList } = await (supabaseAdmin as any)
        .from("tradio_broadcast_reactions")
        .select("reaction_type")
        .eq("channel_id", input.channelId)
        .gte("created_at", oneHourAgo);

      let topReactionType: ReactionType | null = null;
      if (reactionsList && reactionsList.length > 0) {
        const counts: Record<string, number> = {};
        reactionsList.forEach((r: any) => {
          counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1;
        });
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        topReactionType = sorted[0][0] as ReactionType;
      }

      return {
        channelId: input.channelId,
        activeListeners: activeListeners || 0,
        recentReactionsCount: recentReactions || 0,
        topReactionType,
        followersCount: followersCount || 0,
      };
    } catch (e) {
      console.error("[Playout Analytics] Pulse resolution error:", e);
      return null;
    }
  });

/**
 * Server Function: Fetches daily rolled analytics for a channel.
 */
export const getCreatorAnalyticsServer = createServerFn({ method: "POST" })
  .inputValidator((input: { channelId: string; ownerUserId: string }) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; data?: any[]; error?: string }> => {
    try {
      // 1. Verify channel ownership
      const { data: channel, error: chanErr } = await (supabaseAdmin as any)
        .from("tradio_broadcast_channels")
        .select("owner_user_id")
        .eq("id", input.channelId)
        .single();

      if (chanErr || !channel) {
        return { success: false, error: "Channel not found." };
      }

      if (channel.owner_user_id !== input.ownerUserId) {
        // Double-check admin
        const { data: isAdmin } = await supabaseAdmin.rpc("is_admin", {
          _user_id: input.ownerUserId,
        });
        if (!isAdmin) {
          return {
            success: false,
            error: "Access denied. Not the channel owner or platform administrator.",
          };
        }
      }

      // 2. Fetch daily analytics rows
      const { data, error } = await (supabaseAdmin as any)
        .from("tradio_channel_analytics_daily")
        .select("*")
        .eq("channel_id", input.channelId)
        .order("analytics_date", { ascending: false })
        .limit(30);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

/**
 * Server Function: Performs the analytical aggregation rollup for a daily date.
 */
export const rollupChannelAnalyticsServer = createServerFn({ method: "POST" })
  .inputValidator((input: { channelId: string; dateStr: string }) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; error?: string }> => {
    try {
      // YYYY-MM-DD parsing boundaries
      const startOfDay = new Date(`${input.dateStr}T00:00:00Z`).toISOString();
      const endOfDay = new Date(`${input.dateStr}T23:59:59Z`).toISOString();

      // 1. Fetch channel details to get owner
      const { data: channel, error: chanErr } = await (supabaseAdmin as any)
        .from("tradio_broadcast_channels")
        .select("owner_user_id")
        .eq("id", input.channelId)
        .single();

      if (chanErr || !channel) return { success: false, error: "Channel not found." };

      // 2. Aggregate listening sessions
      const { data: sessions } = await (supabaseAdmin as any)
        .from("tradio_broadcast_listening_sessions")
        .select("*")
        .eq("channel_id", input.channelId)
        .gte("started_at", startOfDay)
        .lte("started_at", endOfDay);

      const totalListens = sessions?.length || 0;

      const distinctUsers = new Set();
      let totalSeconds = 0;
      let replaysCount = 0;
      let liveListensCount = 0;
      let totalCompletionRate = 0;
      let completedSessions = 0;

      sessions?.forEach((s: any) => {
        const identifier = s.user_id || s.anonymous_session_id || s.id;
        distinctUsers.add(identifier);
        totalSeconds += Number(s.listen_duration_seconds || 0);

        if (s.playback_mode === "replay") replaysCount++;
        else if (s.playback_mode === "live") liveListensCount++;

        if (s.completion_rate !== null && s.completion_rate !== undefined) {
          totalCompletionRate += Number(s.completion_rate);
          completedSessions++;
        }
      });

      const uniqueListeners = distinctUsers.size;
      const avgListenSeconds = totalListens > 0 ? totalSeconds / totalListens : 0;
      const completionRate = completedSessions > 0 ? totalCompletionRate / completedSessions : null;

      // 3. Aggregate Reactions
      const { count: reactionCount } = await (supabaseAdmin as any)
        .from("tradio_broadcast_reactions")
        .select("*", { count: "exact", head: true })
        .eq("channel_id", input.channelId)
        .gte("created_at", startOfDay)
        .lte("created_at", endOfDay);

      // 4. Aggregate Saves (specific reaction save_this)
      const { count: saveCount } = await (supabaseAdmin as any)
        .from("tradio_broadcast_reactions")
        .select("*", { count: "exact", head: true })
        .eq("channel_id", input.channelId)
        .eq("reaction_type", "save_this")
        .gte("created_at", startOfDay)
        .lte("created_at", endOfDay);

      // 5. Aggregate Followers
      const { count: followCount } = await (supabaseAdmin as any)
        .from("tradio_channel_follows")
        .select("*", { count: "exact", head: true })
        .eq("channel_id", input.channelId);

      // 6. Aggregate Peak concurrent listeners (represented by the highest concurrent count logged in playout events or listening checkpoints)
      const { data: peakLogs } = await (supabaseAdmin as any)
        .from("tradio_playout_events")
        .select("listener_count_snapshot")
        .eq("channel_id", input.channelId)
        .gte("started_at", startOfDay)
        .lte("started_at", endOfDay);

      let peakConcurrent = 1;
      peakLogs?.forEach((l: any) => {
        if (l.listener_count_snapshot > peakConcurrent) {
          peakConcurrent = l.listener_count_snapshot;
        }
      });

      // 7. Upsert Daily rollup
      const upsertPayload = {
        channel_id: input.channelId,
        owner_user_id: channel.owner_user_id,
        analytics_date: input.dateStr,
        total_listens: totalListens,
        unique_listeners: uniqueListeners,
        total_listen_seconds: totalSeconds,
        avg_listen_seconds: avgListenSeconds,
        completion_rate: completionRate,
        replay_count: replaysCount,
        live_listen_count: liveListensCount,
        follow_count: followCount || 0,
        reaction_count: reactionCount || 0,
        save_count: saveCount || 0,
        peak_concurrent_listeners: peakConcurrent,
        updated_at: new Date().toISOString(),
      };

      const { error: upsertErr } = await (supabaseAdmin as any)
        .from("tradio_channel_analytics_daily")
        .upsert(upsertPayload, { onConflict: "channel_id, analytics_date" });

      if (upsertErr) {
        return { success: false, error: upsertErr.message };
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });
