import { TradioBroadcastChannel, TradioBroadcastQueueItem } from "../types/broadcastPlayoutTypes";

export interface StreamPlayoutManifest {
  channelId: string;
  slug: string;
  title: string;
  channelType: string;
  creatorId: string;

  // Prescribe Me attributes
  feel: {
    moodTags: string[];
    genreTags: string[];
    audienceTags: string[];
    creatorRole: string;
  };

  // Playback Track state
  currentTrack?: {
    queueItemId: string;
    showId: string;
    episodeId: string;
    assemblyId: string;
    title: string;
    episodeTitle: string;
    durationSeconds: number;
    startTime: string;
    endTime: string;
  } | null;

  metadata: Record<string, any>;
}

/**
 * Builds a clean stream manifest block that packages all metadata for NowPlaying and Prescribe Me systems.
 */
export function buildStreamPlayoutManifest(
  channel: TradioBroadcastChannel,
  currentItem?: TradioBroadcastQueueItem | null,
  showTitle?: string | null,
  episodeTitle?: string | null,
  durationSeconds?: number | null
): StreamPlayoutManifest {
  return {
    channelId: channel.id,
    slug: channel.slug,
    title: channel.title,
    channelType: channel.channel_type,
    creatorId: channel.owner_user_id,
    feel: {
      moodTags: channel.mood_tags || [],
      genreTags: channel.genre_tags || [],
      audienceTags: channel.audience_tags || [],
      creatorRole: channel.creator_role || "Trey Creator",
    },
    currentTrack: currentItem ? {
      queueItemId: currentItem.id,
      showId: currentItem.show_id,
      episodeId: currentItem.episode_id,
      assemblyId: currentItem.assembly_id,
      title: showTitle || "Scheduled Show",
      episodeTitle: episodeTitle || "Scheduled Episode",
      durationSeconds: durationSeconds || 1800,
      startTime: currentItem.scheduled_start_at || new Date().toISOString(),
      endTime: currentItem.scheduled_end_at || new Date().toISOString(),
    } : null,
    metadata: {
      ...channel.metadata,
      playoutProvider: channel.stream_provider || "file_based_scheduled_playback",
    }
  };
}
