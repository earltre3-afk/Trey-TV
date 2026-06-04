import { isSupabaseConfigured, supabase } from "@/tradio/lib/supabaseClient";
import { TradioLiveRoom, TradioLiveChatMessage } from "../types/broadcastLiveRoomTypes";
import {
  resolveLiveRoomServer,
  sendLiveRoomMessageServer,
  reportLiveMessageServer,
} from "../../../../lib/trey-i/broadcastLiveRoom.server";

// Local in-memory store for offline fallback simulation
let localRooms: TradioLiveRoom[] = [];
let localMessages: TradioLiveChatMessage[] = [];
const OFFLINE_USER_ID = "00000000-0000-0000-0000-000000000000";

async function getUserId(): Promise<string | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.auth.getUser();
      return data?.user?.id || null;
    } catch {
      // ignore
    }
  }
  return null;
}

/**
 * Gets or creates a live room for a channel
 */
export async function getOrCreateLiveRoomForChannel(
  channelId: string,
  queueId: string | null = null,
  showId: string | null = null,
  episodeId: string | null = null,
): Promise<TradioLiveRoom> {
  if (isSupabaseConfigured && supabase) {
    const response = await resolveLiveRoomServer({
      data: { channelId, queueId, showId, episodeId },
    });
    if (response.success && response.room) {
      return response.room;
    }
    throw new Error(response.error || "Failed to resolve live room on server.");
  } else {
    // Offline Mock Fallback
    const existing = localRooms.find((r) => r.channel_id === channelId && r.room_status === "open");
    if (existing) return existing;

    const mockRoom: TradioLiveRoom = {
      id: `room-mock-${channelId}`,
      channel_id: channelId,
      queue_id: queueId,
      show_id: showId,
      episode_id: episodeId,
      owner_user_id: OFFLINE_USER_ID,
      room_status: "open",
      visibility: "public",
      title: "Trey FM Live Lounge",
      pinned_message_id: null,
      slow_mode_seconds: 5,
      chat_enabled: true,
      polls_enabled: true,
      reactions_enabled: true,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localRooms.push(mockRoom);
    return mockRoom;
  }
}

/**
 * Lists visible live room chat messages, optionally resolving sender profile details
 */
export async function listLiveRoomMessages(roomId: string): Promise<TradioLiveChatMessage[]> {
  if (isSupabaseConfigured && supabase) {
    const { data: messages, error } = await supabase
      .from("tradio_live_chat_messages")
      .select("*")
      .eq("room_id", roomId)
      .eq("moderation_status", "visible")
      .order("created_at", { ascending: true });

    if (error) throw error;
    if (!messages || messages.length === 0) return [];

    // Fetch user profiles in a single query to remain resilient to specific FK join namings
    const userIds = Array.from(new Set(messages.map((m: any) => m.user_id).filter(Boolean)));

    let profilesMap: Record<string, { display_name: string; avatar_url: string }> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, username, avatar_url")
        .in("id", userIds);

      if (profiles) {
        profiles.forEach((p: any) => {
          profilesMap[p.id] = {
            display_name: p.display_name || p.username || "Listener",
            avatar_url: p.avatar_url || "",
          };
        });
      }
    }

    return messages.map((m: any) => ({
      ...m,
      profiles: m.user_id
        ? profilesMap[m.user_id] || { display_name: "Listener", avatar_url: "" }
        : null,
    })) as TradioLiveChatMessage[];
  } else {
    // Offline Mock Fallback
    const messages = localMessages.filter(
      (m) => m.room_id === roomId && m.moderation_status === "visible",
    );
    if (messages.length === 0) {
      // Inject some initial pleasant station greeting messages for natural immersion
      const initialMock: TradioLiveChatMessage[] = [
        {
          id: `msg-init-1-${roomId}`,
          room_id: roomId,
          channel_id: "chan-mock-1",
          queue_id: null,
          user_id: null,
          anonymous_session_id: null,
          sender_role: "system",
          message_text:
            "Welcome to the Tradio Live Room! Turn up the volume and join the conversation.",
          message_type: "system",
          playback_position_seconds: 0,
          is_pinned: false,
          is_highlighted: false,
          moderation_status: "visible",
          metadata: {},
          created_at: new Date(Date.now() - 300000).toISOString(),
          updated_at: new Date(Date.now() - 300000).toISOString(),
        },
        {
          id: `msg-init-2-${roomId}`,
          room_id: roomId,
          channel_id: "chan-mock-1",
          queue_id: null,
          user_id: OFFLINE_USER_ID,
          anonymous_session_id: null,
          sender_role: "creator",
          message_text:
            "Hey everyone! Thanks for tuning in today. Let me know what tracks you're feeling!",
          message_type: "host_note",
          playback_position_seconds: 15,
          is_pinned: true,
          is_highlighted: true,
          moderation_status: "visible",
          metadata: {},
          created_at: new Date(Date.now() - 150000).toISOString(),
          updated_at: new Date(Date.now() - 150000).toISOString(),
          profiles: {
            display_name: "Trey FM DJ",
            avatar_url: "",
          },
        },
      ];
      localMessages.push(...initialMock);
      return initialMock;
    }
    return messages;
  }
}

/**
 * Sends a chat message in the live room
 */
export async function sendLiveRoomMessage(
  roomId: string,
  channelId: string,
  messageText: string,
  senderRole: "listener" | "creator" | "host" | "admin" | "system" = "listener",
  messageType: "chat" | "shoutout" | "host_note" | "system" = "chat",
  queueId: string | null = null,
  playbackPositionSeconds: number | null = null,
  anonymousSessionId: string | null = null,
): Promise<TradioLiveChatMessage> {
  const userId = await getUserId();
  const textLimit = 240;

  if (messageText.trim().length === 0) {
    throw new Error("Message cannot be empty.");
  }
  if (messageText.length > textLimit) {
    throw new Error(`Message exceeds maximum limit of ${textLimit} characters.`);
  }

  if (isSupabaseConfigured && supabase) {
    const response = await sendLiveRoomMessageServer({
      data: {
        roomId,
        channelId,
        queueId,
        userId,
        anonymousSessionId,
        senderRole,
        messageText,
        messageType,
        playbackPositionSeconds,
      },
    });

    if (response.success && response.message) {
      return response.message;
    }
    throw new Error(response.error || "Failed to deliver chat message.");
  } else {
    // Offline Mock Fallback
    const mockMsg: TradioLiveChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      room_id: roomId,
      channel_id: channelId,
      queue_id: queueId,
      user_id: userId || OFFLINE_USER_ID,
      anonymous_session_id: anonymousSessionId,
      sender_role: senderRole,
      message_text: messageText,
      message_type: messageType,
      playback_position_seconds: playbackPositionSeconds,
      is_pinned: false,
      is_highlighted: false,
      moderation_status: "visible",
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: {
        display_name: userId ? "Trizzy Fan" : "Anonymous Guest",
        avatar_url: "",
      },
    };
    localMessages.push(mockMsg);
    return mockMsg;
  }
}

/**
 * Pins a message inside the live room
 */
export async function pinLiveRoomMessage(roomId: string, messageId: string | null): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    // 1. Unpin existing
    await supabase
      .from("tradio_live_chat_messages")
      .update({ is_pinned: false })
      .eq("room_id", roomId);

    // 2. Pin selected if messageId is provided
    if (messageId) {
      const { error: pinErr } = await supabase
        .from("tradio_live_chat_messages")
        .update({ is_pinned: true })
        .eq("id", messageId);
      if (pinErr) throw pinErr;

      await supabase
        .from("tradio_live_rooms")
        .update({ pinned_message_id: messageId })
        .eq("id", roomId);
    } else {
      await supabase.from("tradio_live_rooms").update({ pinned_message_id: null }).eq("id", roomId);
    }
  } else {
    // Offline Mock Fallback
    localMessages.forEach((m) => {
      if (m.room_id === roomId) {
        m.is_pinned = m.id === messageId;
      }
    });
    const room = localRooms.find((r) => r.id === roomId);
    if (room) {
      room.pinned_message_id = messageId;
    }
  }
}

/**
 * Highlights a message as a shoutout in the live room
 */
export async function highlightLiveRoomMessage(
  messageId: string,
  isHighlighted: boolean,
): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from("tradio_live_chat_messages")
      .update({ is_highlighted: isHighlighted })
      .eq("id", messageId);
    if (error) throw error;
  } else {
    // Offline Mock Fallback
    const msg = localMessages.find((m) => m.id === messageId);
    if (msg) {
      msg.is_highlighted = isHighlighted;
    }
  }
}

/**
 * Reports a message for moderation review
 */
export async function reportLiveRoomMessage(
  roomId: string,
  messageId: string,
  reportedUserId: string | null,
  reason: string,
  anonymousSessionId: string | null = null,
): Promise<void> {
  const userId = await getUserId();
  if (isSupabaseConfigured && supabase) {
    const response = await reportLiveMessageServer({
      data: {
        roomId,
        messageId,
        reportedUserId,
        reporterUserId: userId,
        anonymousSessionId,
        reason,
      },
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to submit abuse report.");
    }
  } else {
    // Offline Mock Fallback
    const msg = localMessages.find((m) => m.id === messageId);
    if (msg) {
      msg.moderation_status = "flagged";
    }
  }
}
