import { isSupabaseConfigured, supabase } from "@/tradio/lib/supabaseClient";
import {
  startListeningSessionServer,
  heartbeatListeningSessionServer,
  completeListeningSessionServer,
} from "../../../../lib/trey-i/broadcastAnalytics.server";
import { PlaybackMode } from "../types/broadcastListenerTypes";

let activeSessionId: string | null = null;
let activeChannelId: string | null = null;
let activeQueueId: string | null = null;
let activeEpisodeId: string | null = null;
let heartbeatTimer: any = null;
let currentListenSec = 0;

/**
 * Initiates a new public tracking session for a tuning listener.
 */
export async function startChannelTracking(
  channelId: string,
  mode: PlaybackMode = "live",
  queueId?: string | null,
  showId?: string | null,
  episodeId?: string | null,
  assemblyId?: string | null,
): Promise<string | null> {
  // Clean up any existing tracking first
  await stopChannelTracking(0);

  let userId: string | null = null;
  let anonId = "anon-client-uid";

  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        userId = data.user.id;
      } else {
        const stored = localStorage.getItem("tradio_anonymous_uid");
        if (stored) {
          anonId = stored;
        } else {
          anonId = `anon-${Math.random().toString(36).substring(2)}-${Date.now()}`;
          localStorage.setItem("tradio_anonymous_uid", anonId);
        }
      }
    } catch {
      // ignore
    }
  }

  activeChannelId = channelId;
  activeQueueId = queueId || null;
  activeEpisodeId = episodeId || null;
  currentListenSec = 0;

  if (isSupabaseConfigured && supabase) {
    try {
      const res = await startListeningSessionServer({
        data: {
          channelId,
          userId,
          anonymousSessionId: userId ? null : anonId,
          playbackMode: mode,
          queueId,
          showId,
          episodeId,
          assemblyId,
        },
      });
      if (res.success && res.sessionId) {
        activeSessionId = res.sessionId;

        // Start heartbeat schedule: every 30 seconds
        startHeartbeatSchedule();
        return res.sessionId;
      }
    } catch (err) {
      console.warn("[Playout Tracking] Failed to start tracking on server:", err);
    }
  } else {
    activeSessionId = `mock-session-${Date.now()}`;
    startHeartbeatSchedule();
  }

  return activeSessionId;
}

/**
 * Registers active heartbeats every 30 seconds during streaming.
 */
function startHeartbeatSchedule() {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = setInterval(async () => {
    if (!activeSessionId || !activeChannelId) return;
    currentListenSec += 30;

    if (isSupabaseConfigured && supabase) {
      try {
        await heartbeatListeningSessionServer({
          data: {
            sessionId: activeSessionId,
            channelId: activeChannelId,
            durationIncrementSeconds: 30,
            lastPlaybackPositionSeconds: currentListenSec,
            percentComplete: Math.min(100, Math.round((currentListenSec / 1800) * 100)), // estimated percentage
            queueId: activeQueueId,
            episodeId: activeEpisodeId,
          },
        });
      } catch (err) {
        console.warn("[Tracking Heartbeat] Failed:", err);
      }
    }
  }, 30000); // 30-second interval
}

/**
 * Concludes and submits final listen checkpoints when tuning out or exiting.
 */
export async function stopChannelTracking(finalPositionSeconds = 0): Promise<boolean> {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }

  if (!activeSessionId || !activeChannelId) {
    activeSessionId = null;
    activeChannelId = null;
    return false;
  }

  const sId = activeSessionId;
  const cId = activeChannelId;
  const qId = activeQueueId;
  const eId = activeEpisodeId;

  activeSessionId = null;
  activeChannelId = null;
  activeQueueId = null;
  activeEpisodeId = null;

  if (isSupabaseConfigured && supabase && !sId.startsWith("mock-")) {
    try {
      await completeListeningSessionServer({
        data: {
          sessionId: sId,
          channelId: cId,
          finalPlaybackPositionSeconds: finalPositionSeconds || currentListenSec,
          percentComplete: Math.min(100, Math.round((currentListenSec / 1800) * 100)),
          queueId: qId,
          episodeId: eId,
          isCompletion: finalPositionSeconds >= 1700, // completed if close to 30 mins
        },
      });
      return true;
    } catch (err) {
      console.warn("[Tracking Completion] Failed:", err);
    }
  }

  return true;
}
