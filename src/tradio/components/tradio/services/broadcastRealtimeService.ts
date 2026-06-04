import { isSupabaseConfigured, supabase } from "@/tradio/lib/supabaseClient";
import { TradioBroadcastReaction } from "../types/broadcastListenerTypes";

export interface RealtimeSubscription {
  unsubscribe: () => void;
}

/**
 * Subscribes to real-time broadcast reactions for a specific channel.
 * Uses real Postgres Changes sync over Supabase, falls back to randomized intervals offline!
 */
export function subscribeToChannelReactions(
  channelId: string,
  onReaction: (reaction: TradioBroadcastReaction) => void,
): RealtimeSubscription {
  if (isSupabaseConfigured && supabase) {
    const client = supabase;
    const channel = client
      .channel(`reactions:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tradio_broadcast_reactions",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          onReaction(payload.new as TradioBroadcastReaction);
        },
      )
      .subscribe();

    return {
      unsubscribe: () => {
        void client.removeChannel(channel);
      },
    };
  } else {
    // Offline simulated polling interval to make reactions look lively in local development!
    const mockInterval = setInterval(() => {
      const types: Array<any> = ["fire", "love", "laugh", "hard", "smooth", "salute"];
      const selectedType = types[Math.floor(Math.random() * types.length)];

      onReaction({
        id: `m-react-${Date.now()}`,
        channel_id: channelId,
        user_id: "00000000-0000-0000-0000-000000000000",
        reaction_type: selectedType,
        is_live: true,
        metadata: {},
        created_at: new Date().toISOString(),
      });
    }, 8000); // Send a friendly mock reaction pulse every 8 seconds

    return {
      unsubscribe: () => {
        clearInterval(mockInterval);
      },
    };
  }
}
