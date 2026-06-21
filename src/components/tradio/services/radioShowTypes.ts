// Radio Show types ported from Tradio pass12's data.ts
// These define the structure for the AI Radio Show Builder.

export interface ShowSegment {
  id: string;
  type:
    | 'intro'
    | 'music-block'
    | 'host-talk'
    | 'fan-request'
    | 'producer-spotlight'
    | 'artist-premiere'
    | 'commercial'
    | 'poll'
    | 'closing';
  title: string;
  duration: number; // seconds
  description?: string;
  hostNotes?: string;
  script?: string;
  aiGenerated?: boolean;
}

export interface RadioShow {
  id: string;
  title: string;
  duration: number; // minutes
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
  status: 'draft' | 'template' | 'live' | 'archived';
  aiGenerated: boolean;
}
