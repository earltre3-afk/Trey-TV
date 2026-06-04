import { isSupabaseConfigured, supabase } from "@/tradio/lib/supabaseClient";
import { TradioLiveChatMessage, TradioLivePoll } from "../types/broadcastLiveRoomTypes";

export interface RealtimeSubscription {
  unsubscribe: () => void;
}

export type LiveRoomRealtimeEvent =
  | { type: "message_inserted"; message: TradioLiveChatMessage }
  | { type: "message_updated"; message: TradioLiveChatMessage }
  | { type: "poll_inserted"; poll: TradioLivePoll }
  | { type: "poll_updated"; poll: TradioLivePoll }
  | { type: "vote_inserted"; vote: any }
  | { type: "room_updated"; room: any };

/**
 * Listens to all realtime table events for a specific live room.
 * Resilient to offline/local-only state with simulated chat participants.
 */
export function subscribeToLiveRoomEvents(
  roomId: string,
  onEvent: (event: LiveRoomRealtimeEvent) => void,
): RealtimeSubscription {
  if (isSupabaseConfigured && supabase) {
    const client = supabase;
    const channelId = `live_room:${roomId}`;

    const channel = client
      .channel(channelId)
      // 1. Listen for Chat Messages
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tradio_live_chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          onEvent({ type: "message_inserted", message: payload.new as TradioLiveChatMessage });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tradio_live_chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          onEvent({ type: "message_updated", message: payload.new as TradioLiveChatMessage });
        },
      )
      // 2. Listen for Polls
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tradio_live_polls",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          onEvent({ type: "poll_inserted", poll: payload.new as TradioLivePoll });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tradio_live_polls",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          onEvent({ type: "poll_updated", poll: payload.new as TradioLivePoll });
        },
      )
      // 3. Listen for Poll Votes
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tradio_live_poll_votes",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          onEvent({ type: "vote_inserted", vote: payload.new });
        },
      )
      // 4. Listen for Room updates (e.g. Pin changes, slows)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tradio_live_rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          onEvent({ type: "room_updated", room: payload.new });
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
    // Offline simulated activity loop for immersive local development
    const simulatedMessages = [
      "Yo! This is an amazing stream! 🎧",
      "Which song is this? Absolute vibe.",
      "Loving the transitions here, so clean!",
      "Shoutout to Tradio! Doing it big.",
      "That drop was incredible! 🔥🔥🔥",
      "Late night listening hits different.",
      "Smooth radio waves!",
    ];

    const simulatedNames = [
      "LofiDreamer",
      "TechnoHustle",
      "JazzCat",
      "VibeCurator",
      "BassBooster",
      "WaveRider",
    ];

    const timer = setInterval(() => {
      // 10% chance of spawning a random simulated listener comment
      if (Math.random() < 0.15) {
        const text = simulatedMessages[Math.floor(Math.random() * simulatedMessages.length)];
        const name = simulatedNames[Math.floor(Math.random() * simulatedNames.length)];

        const mockMsg: TradioLiveChatMessage = {
          id: `msg-realtime-sim-${Date.now()}`,
          room_id: roomId,
          channel_id: "chan-mock-1",
          queue_id: null,
          user_id: `sim-user-${name}`,
          anonymous_session_id: null,
          sender_role: "listener",
          message_text: text,
          message_type: "chat",
          playback_position_seconds: 30,
          is_pinned: false,
          is_highlighted: false,
          moderation_status: "visible",
          metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          profiles: {
            display_name: name,
            avatar_url: "",
          },
        };

        onEvent({ type: "message_inserted", message: mockMsg });
      }
    }, 4000); // Check every 4 seconds

    return {
      unsubscribe: () => {
        clearInterval(timer);
      },
    };
  }
}
