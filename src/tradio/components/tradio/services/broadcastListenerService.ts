import { isSupabaseConfigured, supabase } from "@/tradio/lib/supabaseClient";
import {
  TradioChannelFollow,
  TradioBroadcastReaction,
  ReactionType,
  NotificationPreference,
} from "../types/broadcastListenerTypes";
import { createReactionServer } from "../../../../lib/trey-i/broadcastAnalytics.server";

// Local cache for in-memory offline fallback
let localFollows: TradioChannelFollow[] = [];
let localReactions: TradioBroadcastReaction[] = [];
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
 * Lists active, public discoverable channels.
 */
export async function listDiscoverableChannels() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("tradio_broadcast_channels")
      .select("*")
      .eq("status", "active")
      .eq("visibility", "public")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  } else {
    // Return standard mock channels from Pass 5
    return [
      {
        id: "chan-mock-1",
        title: "Trey FM Smooth Waves",
        slug: "smooth-waves",
        description: "The smoothest lofi, late-night grooves, and creator-curated radio.",
        channel_type: "radio",
        visibility: "public",
        status: "active",
        mood_tags: ["relaxing", "chilled"],
        genre_tags: ["lofi", "ambient"],
        audience_tags: ["midnight-riders"],
        cover_art_url: "https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=500&q=80",
      },
      {
        id: "chan-mock-2",
        title: "DJ Hype's Midnight Club",
        slug: "dj-hype-club",
        description: "High-octane club music and energetic broadcast mixes.",
        channel_type: "dj_station",
        visibility: "public",
        status: "active",
        mood_tags: ["hype", "energetic"],
        genre_tags: ["house", "electronic"],
        audience_tags: ["club-goers"],
        cover_art_url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&q=80",
      },
    ];
  }
}

/**
 * Follows a channel.
 */
export async function followChannel(
  channelId: string,
  pref: NotificationPreference = "all",
): Promise<TradioChannelFollow> {
  if (isSupabaseConfigured && supabase) {
    const userId = await getUserId();
    if (!userId) throw new Error("Sign in to follow broadcast channels.");

    const { data, error } = await supabase
      .from("tradio_channel_follows")
      .insert({
        channel_id: channelId,
        user_id: userId,
        notification_preference: pref,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const userId = (await getUserId()) || OFFLINE_USER_ID;
    const followRow: TradioChannelFollow = {
      id: `follow-${Date.now()}`,
      channel_id: channelId,
      user_id: userId,
      notification_preference: pref,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localFollows.push(followRow);
    return followRow;
  }
}

/**
 * Unfollows a channel.
 */
export async function unfollowChannel(channelId: string): Promise<boolean> {
  const userId = await getUserId();
  if (isSupabaseConfigured && supabase) {
    if (!userId) throw new Error("Sign in to unfollow broadcast channels.");

    const { error } = await supabase
      .from("tradio_channel_follows")
      .delete()
      .eq("channel_id", channelId)
      .eq("user_id", userId);
    if (error) throw error;
    return true;
  } else {
    const localUserId = userId || OFFLINE_USER_ID;
    const idx = localFollows.findIndex(
      (f) => f.channel_id === channelId && f.user_id === localUserId,
    );
    if (idx === -1) return false;
    localFollows.splice(idx, 1);
    return true;
  }
}

/**
 * Resolves current follow status of a channel.
 */
export async function getMyChannelFollowStatus(
  channelId: string,
): Promise<TradioChannelFollow | null> {
  const userId = await getUserId();
  if (!userId && isSupabaseConfigured) return null;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("tradio_channel_follows")
      .select("*")
      .eq("channel_id", channelId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  } else {
    const localUserId = userId || OFFLINE_USER_ID;
    return (
      localFollows.find((f) => f.channel_id === channelId && f.user_id === localUserId) || null
    );
  }
}

/**
 * Submits a listener pulse reaction.
 */
export async function createBroadcastReaction(
  channelId: string,
  reactionType: ReactionType,
  queueId?: string | null,
  isLive = true,
): Promise<TradioBroadcastReaction> {
  const userId = await getUserId();

  if (isSupabaseConfigured && supabase) {
    const res = await createReactionServer({
      data: {
        channelId,
        reactionType,
        userId,
        queueId,
        isLive,
      },
    });
    if (!res.success) throw new Error(res.error);
    return res.reaction;
  } else {
    const localUserId = userId || OFFLINE_USER_ID;
    const newReact: TradioBroadcastReaction = {
      id: `react-${Date.now()}`,
      channel_id: channelId,
      queue_id: queueId,
      user_id: localUserId,
      reaction_type: reactionType,
      is_live: isLive,
      metadata: {},
      created_at: new Date().toISOString(),
    };
    localReactions.push(newReact);
    return newReact;
  }
}

/**
 * Lists recent pulse reactions.
 */
export async function listRecentBroadcastReactions(
  channelId: string,
): Promise<TradioBroadcastReaction[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("tradio_broadcast_reactions")
      .select("*")
      .eq("channel_id", channelId)
      .order("created_at", { ascending: false })
      .limit(15);
    if (error) throw error;
    return data || [];
  } else {
    return localReactions
      .filter((r) => r.channel_id === channelId)
      .slice(-15)
      .reverse();
  }
}

/**
 * Lists replay eligible completed broadcasts.
 */
export async function getReplayEligibleBroadcasts(channelId: string) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("tradio_broadcast_queue")
      .select(
        "*, show:tradio_shows(title), episode:tradio_show_episodes(title, duration_seconds, cover_art), assembly:tradio_episode_assemblies(output_storage_path, duration_seconds)",
      )
      .eq("channel_id", channelId)
      .eq("queue_status", "completed")
      .eq("is_replay_eligible", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  } else {
    // Mock replay list
    return [
      {
        id: "replay-mock-1",
        channel_id: channelId,
        show: { title: "Late Night Lounge" },
        episode: { title: "Episode 1: Smooth Waveforms", duration_seconds: 1800, cover_art: null },
        assembly: { output_storage_path: "mock-storage-path" },
        is_replay_eligible: true,
        queue_status: "completed",
        created_at: new Date().toISOString(),
      },
    ];
  }
}
