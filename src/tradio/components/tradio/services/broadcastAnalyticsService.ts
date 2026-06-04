import { isSupabaseConfigured, supabase } from "@/tradio/lib/supabaseClient";
import {
  getCreatorAnalyticsServer,
  resolvePublicChannelPulseServer,
  rollupChannelAnalyticsServer,
} from "../../../../lib/trey-i/broadcastAnalytics.server";
import { ChannelPulseSummary } from "../types/broadcastListenerTypes";

/**
 * Retrieves daily rollups for the creator's channel metrics dashboard.
 */
export async function getCreatorChannelAnalytics(channelId: string): Promise<any[]> {
  let userId = "00000000-0000-0000-0000-000000000000";
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) userId = data.user.id;
    } catch {
      // ignore
    }
  }

  if (isSupabaseConfigured && supabase) {
    const res = await getCreatorAnalyticsServer({
      data: {
        channelId,
        ownerUserId: userId,
      },
    });
    if (!res.success) throw new Error(res.error);
    return res.data || [];
  } else {
    // Return high-quality, professional simulated mock analytics trends
    return [
      {
        id: "mock-aly-1",
        channel_id: channelId,
        analytics_date: new Date().toISOString().slice(0, 10),
        total_listens: 145,
        unique_listeners: 89,
        total_listen_seconds: 261000,
        avg_listen_seconds: 1800,
        completion_rate: 88.5,
        replay_count: 35,
        live_listen_count: 110,
        follow_count: 24,
        reaction_count: 412,
        save_count: 14,
        peak_concurrent_listeners: 32,
      },
      {
        id: "mock-aly-2",
        channel_id: channelId,
        analytics_date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
        total_listens: 120,
        unique_listeners: 76,
        total_listen_seconds: 198000,
        avg_listen_seconds: 1650,
        completion_rate: 82.1,
        replay_count: 28,
        live_listen_count: 92,
        follow_count: 21,
        reaction_count: 320,
        save_count: 9,
        peak_concurrent_listeners: 27,
      },
    ];
  }
}

/**
 * Resolves current realtime pulse metric summary (listeners, recent reactions, followers).
 */
export async function getChannelPulseSummary(channelId: string): Promise<ChannelPulseSummary> {
  if (isSupabaseConfigured && supabase) {
    const res = await resolvePublicChannelPulseServer({
      data: { channelId },
    });
    return (
      res || {
        channelId,
        activeListeners: 0,
        recentReactionsCount: 0,
        followersCount: 0,
      }
    );
  } else {
    return {
      channelId,
      activeListeners: 5,
      recentReactionsCount: 14,
      topReactionType: "fire",
      followersCount: 42,
    };
  }
}

/**
 * Triggers a manual/admin daily aggregation rollup for metrics analysis.
 */
export async function rollupDailyChannelAnalytics(
  channelId: string,
  dateStr: string,
): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const res = await rollupChannelAnalyticsServer({
      data: { channelId, dateStr },
    });
    if (!res.success) throw new Error(res.error);
    return true;
  } else {
    return true;
  }
}
