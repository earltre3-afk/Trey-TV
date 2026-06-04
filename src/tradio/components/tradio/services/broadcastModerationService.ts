import { isSupabaseConfigured, supabase } from "@/tradio/lib/supabaseClient";
import { TradioLiveModerationReport, LiveRoomPulseSummary } from "../types/broadcastLiveRoomTypes";
import {
  moderateLiveMessageServer,
  getLiveRoomPulseServer,
} from "../../../../lib/trey-i/broadcastLiveRoom.server";

// Local offline fallback data
let localReports: TradioLiveModerationReport[] = [];

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
 * Lists all active or pending moderation reports for a room
 */
export async function listModerationReports(roomId: string): Promise<TradioLiveModerationReport[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("tradio_live_moderation_reports")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Let's also resolve message details for each report
    const msgIds = Array.from(new Set(data.map((r: any) => r.message_id).filter(Boolean)));
    let messagesMap: Record<string, any> = {};

    if (msgIds.length > 0) {
      const { data: messages } = await supabase
        .from("tradio_live_chat_messages")
        .select("*")
        .in("id", msgIds);

      if (messages) {
        messages.forEach((m: any) => {
          messagesMap[m.id] = m;
        });
      }
    }

    return data.map((r: any) => ({
      ...r,
      message: r.message_id ? messagesMap[r.message_id] || null : null,
    })) as TradioLiveModerationReport[];
  } else {
    // Offline Mock Fallback
    return localReports.filter((r) => r.room_id === roomId);
  }
}

/**
 * Hides a chat message (sets moderation status to 'hidden')
 */
export async function hideLiveRoomMessage(messageId: string): Promise<void> {
  const userId = await getUserId();

  if (isSupabaseConfigured && supabase) {
    if (!userId) throw new Error("You must be logged in to moderate chat.");

    const response = await moderateLiveMessageServer({
      data: {
        messageId,
        moderatorUserId: userId,
        action: "hide",
      },
    });

    if (!response.success) {
      throw new Error(response.error || "Failed to hide message.");
    }
  } else {
    // Handled in local messages memory directly
    console.log(`[Offline Moderation] Message ${messageId} hidden.`);
  }
}

/**
 * Completely removes a chat message (sets status to 'removed')
 */
export async function removeLiveRoomMessage(messageId: string): Promise<void> {
  const userId = await getUserId();

  if (isSupabaseConfigured && supabase) {
    if (!userId) throw new Error("You must be logged in to moderate chat.");

    const response = await moderateLiveMessageServer({
      data: {
        messageId,
        moderatorUserId: userId,
        action: "remove",
      },
    });

    if (!response.success) {
      throw new Error(response.error || "Failed to remove message.");
    }
  } else {
    // Handled in local messages memory directly
    console.log(`[Offline Moderation] Message ${messageId} removed.`);
  }
}

/**
 * Resolves full engagement & activity pulse statistics for a channel
 */
export async function resolveLiveRoomPulseSummary(
  channelId: string,
  roomId: string,
): Promise<LiveRoomPulseSummary> {
  if (isSupabaseConfigured && supabase) {
    const response = await getLiveRoomPulseServer({
      data: { channelId, roomId },
    });

    if (response.success && response.pulse) {
      return response.pulse;
    }
    throw new Error(response.error || "Failed to fetch live room pulse summary.");
  } else {
    // Offline Mock Fallback
    return {
      channel_id: channelId,
      room_id: roomId,
      active_listeners: 142,
      chat_message_count: 57,
      unique_chatters: 24,
      poll_vote_count: 16,
      active_poll_count: 1,
      shoutout_count: 2,
      report_count: 0,
      engagement_rate: 18,
      top_poll_option: {
        poll_id: "poll-mock",
        question: "How is this mix hitting?",
        option_id: "opt-2",
        option_text: "Super Smooth 🌊",
        votes: 8,
      },
      top_reaction_moment: {
        second: 42,
        count: 12,
      },
    };
  }
}
