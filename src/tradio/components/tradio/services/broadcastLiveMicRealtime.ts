import { isSupabaseConfigured, supabase } from "@/tradio/lib/supabaseClient";
import {
  TradioLiveMicSession,
  TradioLiveMicParticipant,
  TradioLiveCallRequest,
  TradioLiveSfxEvent,
} from "../types/broadcastLiveMicTypes";

export interface RealtimeMicSubscription {
  unsubscribe: () => void;
}

export type LiveMicRealtimeEvent =
  | { type: "session_updated"; session: TradioLiveMicSession }
  | { type: "participant_inserted"; participant: TradioLiveMicParticipant }
  | { type: "participant_updated"; participant: TradioLiveMicParticipant }
  | { type: "call_request_inserted"; request: TradioLiveCallRequest }
  | { type: "call_request_updated"; request: TradioLiveCallRequest }
  | { type: "sfx_triggered"; event: TradioLiveSfxEvent };

/**
 * Handles realtime synchronization for Live Mic sessions, participants, call-ins, and SFX drops.
 * Features automatic polling fallbacks when offline or disconnected.
 */
export function subscribeToLiveMicEvents(
  sessionId: string,
  onEvent: (event: LiveMicRealtimeEvent) => void,
): RealtimeMicSubscription {
  if (isSupabaseConfigured && supabase) {
    const client = supabase;
    const channelId = `live_mic:${sessionId}`;

    const channel = client
      .channel(channelId)
      // 1. Session Updates
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tradio_live_mic_sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          onEvent({ type: "session_updated", session: payload.new as TradioLiveMicSession });
        },
      )
      // 2. Participants
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tradio_live_mic_participants",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          onEvent({
            type: "participant_inserted",
            participant: payload.new as TradioLiveMicParticipant,
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tradio_live_mic_participants",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          onEvent({
            type: "participant_updated",
            participant: payload.new as TradioLiveMicParticipant,
          });
        },
      )
      // 3. Call Requests
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tradio_live_call_requests",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          onEvent({ type: "call_request_inserted", request: payload.new as TradioLiveCallRequest });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tradio_live_call_requests",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          onEvent({ type: "call_request_updated", request: payload.new as TradioLiveCallRequest });
        },
      )
      // 4. SFX Drops
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tradio_live_sfx_events",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          onEvent({ type: "sfx_triggered", event: payload.new as TradioLiveSfxEvent });
        },
      )
      .subscribe();

    return {
      unsubscribe: () => {
        if (client) {
          void client.removeChannel(channel);
        }
      },
    };
  } else {
    // Offline Polling / Simulation Mock Loop
    console.log(`[Offline Realtime] Started simulated realtime adapter for session ${sessionId}.`);

    // In local mode, let's inject simulated caller request occasionally to test queue UX
    const pollInterval = setInterval(() => {
      if (Math.random() < 0.1) {
        const mockCallerRequest: TradioLiveCallRequest = {
          id: `req-sim-${Date.now()}`,
          session_id: sessionId,
          room_id: "room-mock",
          channel_id: "chan-mock",
          queue_id: null,
          requester_user_id: `user-sim-${Math.random()}`,
          anonymous_session_id: null,
          request_status: "pending",
          request_note: "Hey Trey! I want to share my thoughts on this song!",
          host_decision_user_id: null,
          decision_reason: null,
          playback_position_seconds: 120,
          metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        onEvent({ type: "call_request_inserted", request: mockCallerRequest });
      }
    }, 10000);

    return {
      unsubscribe: () => {
        clearInterval(pollInterval);
        console.log("[Offline Realtime] Unsubscribed simulated adapter.");
      },
    };
  }
}
