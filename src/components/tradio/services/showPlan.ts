// Show Plan service ported from Tradio pass12's showPlan.ts
// Local deterministic show plan generator (no AI/server dependencies).

import type { RadioShow, ShowSegment } from './radioShowTypes';

export const SHOW_SEGMENT_TYPES: ShowSegment['type'][] = [
  'intro',
  'music-block',
  'host-talk',
  'fan-request',
  'producer-spotlight',
  'artist-premiere',
  'commercial',
  'poll',
  'closing',
];

export type SaveTarget = 'live show' | 'replay' | 'template';

export interface ShowBuilderFormState {
  showName: string;
  showLength: number;
  showMood: string;
  targetAudience: string;
  hostTone: string;
  musicSource: string;
  selectedStation: string;
  commercialBreaks: number;
  fanInteractionStyle: string;
  includeProducerBeatSpotlight: boolean;
  includeArtistPremiere: boolean;
  includeListenerRequests: boolean;
  saveAs: SaveTarget;
}

export const emptyForm: ShowBuilderFormState = {
  showName: '',
  showLength: 120,
  showMood: 'late-night',
  targetAudience: 'fans who want premieres and discovery',
  hostTone: 'warm, cinematic',
  musicSource: 'artist station plus Tradio catalog',
  selectedStation: 'station-trey-trizzy',
  commercialBreaks: 2,
  fanInteractionStyle: 'polls, shoutouts, and request queue',
  includeProducerBeatSpotlight: true,
  includeArtistPremiere: true,
  includeListenerRequests: true,
  saveAs: 'template',
};

/** Local deterministic fallback generator (no AI). */
export const generateShowPlan = (form: ShowBuilderFormState): RadioShow => ({
  id: `generated-show-${Date.now()}`,
  title: form.showName || 'Midnight Network Session',
  duration: form.showLength,
  mood: form.showMood,
  targetAudience: form.targetAudience,
  hostTone: form.hostTone,
  musicSource: form.musicSource,
  selectedStation: form.selectedStation,
  commercialBreaks: form.commercialBreaks,
  fanInteractionStyle: form.fanInteractionStyle,
  includeProducerSpotlight: form.includeProducerBeatSpotlight,
  includeArtistPremiere: form.includeArtistPremiere,
  includeListenerRequests: form.includeListenerRequests,
  status: form.saveAs === 'template' ? 'template' : 'draft',
  aiGenerated: true,
  segments: [
    {
      id: 'gen-1',
      type: 'intro',
      title: 'Opening Intro',
      duration: 180,
      hostNotes: `Welcome listeners in a ${form.hostTone} voice and set the ${form.showMood} atmosphere.`,
      aiGenerated: true,
    },
    {
      id: 'gen-2',
      type: 'host-talk',
      title: 'Host Notes',
      duration: 120,
      description: `Frame the show for ${form.targetAudience}.`,
      hostNotes: 'Mention that requests and votes shape the back half of the show.',
      aiGenerated: true,
    },
    {
      id: 'gen-3',
      type: 'music-block',
      title: 'Song Block 1',
      duration: 480,
      description: `Curated from ${form.musicSource}.`,
      aiGenerated: true,
    },
    {
      id: 'gen-4',
      type: 'host-talk',
      title: 'Transition Script',
      duration: 90,
      hostNotes: 'Move from the opener into fan participation without breaking the mood.',
      aiGenerated: true,
    },
    {
      id: 'gen-5',
      type: 'commercial',
      title: 'Commercial / Ad Slot',
      duration: 60,
      description: `${form.commercialBreaks} planned break across the show.`,
      aiGenerated: true,
    },
    ...(form.includeListenerRequests
      ? [
          {
            id: 'gen-6',
            type: 'fan-request' as const,
            title: 'Fan Request Segment',
            duration: 360,
            description: form.fanInteractionStyle,
            aiGenerated: true,
          },
        ]
      : []),
    ...(form.includeProducerBeatSpotlight
      ? [
          {
            id: 'gen-7',
            type: 'producer-spotlight' as const,
            title: 'Producer Beat Spotlight',
            duration: 240,
            description: 'Preview two beats and invite artists to save or pitch.',
            aiGenerated: true,
          },
        ]
      : []),
    ...(form.includeArtistPremiere
      ? [
          {
            id: 'gen-8',
            type: 'artist-premiere' as const,
            title: 'Artist Premiere Block',
            duration: 300,
            description: 'Pinned release, premiere intro, and first-listen fan chat.',
            aiGenerated: true,
          },
        ]
      : []),
    {
      id: 'gen-9',
      type: 'music-block',
      title: 'DJ Mix Section',
      duration: 420,
      description: 'Blend catalog picks, beat spotlight stems, and requested tracks.',
      aiGenerated: true,
    },
    {
      id: 'gen-10',
      type: 'poll',
      title: 'Listener Interaction Moment',
      duration: 180,
      description: 'Vote what plays next and collect shoutouts.',
      aiGenerated: true,
    },
    {
      id: 'gen-11',
      type: 'closing',
      title: 'Closing Message + Replay Package',
      duration: 180,
      hostNotes: `Save as ${form.saveAs} and package highlights for replay listeners.`,
      aiGenerated: true,
    },
  ],
});

/** Segment type display labels */
export const SEGMENT_LABELS: Record<ShowSegment['type'], string> = {
  intro: '🎙️ Intro',
  'music-block': '🎵 Music Block',
  'host-talk': '💬 Host Talk',
  'fan-request': '📩 Fan Request',
  'producer-spotlight': '🎹 Producer Spotlight',
  'artist-premiere': '🌟 Artist Premiere',
  commercial: '📢 Commercial',
  poll: '📊 Poll / Vote',
  closing: '🎬 Closing',
};

/** Format seconds to mm:ss */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
