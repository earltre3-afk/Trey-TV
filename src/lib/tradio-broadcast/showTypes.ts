export interface BroadcastTrack {
  id: string;
  title: string;
  artist: string;
  src?: string;
}

export interface ShowSegment {
  id: string;
  type:
    | "intro"
    | "music-block"
    | "host-talk"
    | "fan-request"
    | "producer-spotlight"
    | "artist-premiere"
    | "commercial"
    | "poll"
    | "closing";
  title: string;
  duration: number;
  description?: string;
  tracks?: BroadcastTrack[];
  hostNotes?: string;
  script?: string;
  timestamp?: number;
  aiGenerated?: boolean;
}

export interface RadioShow {
  id: string;
  title: string;
  djId?: string;
  djName?: string;
  duration: number;
  mood: string;
  targetAudience: string;
  hostTone: string;
  musicSource: string;
  selectedStation?: string;
  commercialBreaks: number;
  fanInteractionStyle: string;
  includeProducerSpotlight: boolean;
  includeArtistPremiere: boolean;
  includeListenerRequests: boolean;
  segments: ShowSegment[];
  status: "draft" | "template" | "scheduled" | "live" | "archived";
  scheduledFor?: string;
  audience?: number;
  aiGenerated: boolean;
}
