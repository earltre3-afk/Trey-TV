import { ChannelType } from "../types/broadcastPlayoutTypes";

export interface StreamProviderConfig {
  id: string;
  name: string;
  description: string;
  requiresContinuousServer: boolean;
  supportedChannelTypes: ChannelType[];
}

export const STREAM_PROVIDERS: StreamProviderConfig[] = [
  {
    id: "file_based_scheduled_playback",
    name: "File-Based Scheduled Playback",
    description: "Serves pre-compiled episode assemblies via client-side scheduled audio loading. Ideal for serverless hosting and zero-cost scaling.",
    requiresContinuousServer: false,
    supportedChannelTypes: ["radio", "artist_station", "dj_station", "producer_station", "talk_station", "discovery_station"],
  },
  {
    id: "hls",
    name: "HTTP Live Streaming (HLS)",
    description: "Streams continuously chunked MPEG-TS playlists for massive concurrent listenership with low latency.",
    requiresContinuousServer: true,
    supportedChannelTypes: ["radio", "talk_station", "discovery_station", "event_station"],
  },
  {
    id: "icecast",
    name: "Icecast Server",
    description: "Classical radio streaming format utilizing dedicated Icecast directories and mountpoints. Perfect for compatibility with winamp/mobile-radio apps.",
    requiresContinuousServer: true,
    supportedChannelTypes: ["radio", "dj_station", "artist_station"],
  },
  {
    id: "liquidsoap",
    name: "Liquidsoap Automation Engine",
    description: "Continuous server-side playlist scheduler and crossfading DSP. Generates uninterrupted source streams for Icecast or HLS endpoints.",
    requiresContinuousServer: true,
    supportedChannelTypes: ["radio", "artist_station", "dj_station", "producer_station", "talk_station", "discovery_station", "event_station"],
  },
  {
    id: "external_stream_service",
    name: "External Shoutcast/Icecast Relay",
    description: "Relay feed to an external commercial service provider like Radio.co, Live365, or Shoutcast.",
    requiresContinuousServer: false,
    supportedChannelTypes: ["radio", "event_station"],
  },
  {
    id: "future_internal_stream",
    name: "Trey TV Custom Playout Daemon",
    description: "Planned built-in high-fidelity audio stream multiplexer utilizing server-side Web Audio API rendering nodes.",
    requiresContinuousServer: true,
    supportedChannelTypes: ["radio", "artist_station", "dj_station", "producer_station", "talk_station", "discovery_station", "event_station"],
  }
];

export interface StreamConnectionStatus {
  connected: boolean;
  activeMount?: string | null;
  bitrateKbps?: number | null;
  codec?: string | null;
  listenersCount: number;
}

/**
 * Resolves current active stream URL or metadata for a channel depending on the selected provider.
 */
export function getChannelStreamDetails(channel: {
  stream_provider?: string | null;
  stream_url?: string | null;
  hls_url?: string | null;
  icecast_mount?: string | null;
}) {
  const providerId = channel.stream_provider || "file_based_scheduled_playback";
  const provider = STREAM_PROVIDERS.find(p => p.id === providerId) || STREAM_PROVIDERS[0];

  let activeUrl = channel.stream_url || channel.hls_url || null;

  if (providerId === "hls") {
    activeUrl = channel.hls_url || activeUrl;
  } else if (providerId === "icecast") {
    activeUrl = channel.icecast_mount ? `${channel.stream_url || ""}/${channel.icecast_mount}` : activeUrl;
  }

  return {
    providerId,
    providerName: provider.name,
    requiresServer: provider.requiresContinuousServer,
    playbackUrl: activeUrl,
  };
}
