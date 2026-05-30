import { IMG } from '../data';
import type { MockIdentityKey } from './mockAuth';
import type { TradioMode, TradioProfileBridge } from './types';

export type PrescribeMeScope = 'ecosystem' | 'tradio';

export type TradioPrescriptionSource =
  | 'track'
  | 'station'
  | 'artist_station'
  | 'artist'
  | 'producer'
  | 'beat'
  | 'dj_show'
  | 'broadcast'
  | 'song_war'
  | 'playlist'
  | 'replay'
  | 'community';

export type TradioPrescriptionMood =
  | 'late-night'
  | 'emotional'
  | 'high-energy'
  | 'discovery'
  | 'premiere'
  | 'collaboration'
  | 'battle-ready'
  | 'focus'
  | 'community';

export type TradioPrescriptionReason =
  | 'recent_station_saves'
  | 'late_night_listening'
  | 'song_wars_votes'
  | 'artist_fan_engagement'
  | 'beat_pattern_match'
  | 'dj_retention_pattern'
  | 'library_rediscovery'
  | 'community_overlap'
  | 'mode_goal';

export interface ParentPrescriptionSignal extends TradioProfileBridge {
  scope: 'ecosystem';
  signal_type: 'creator' | 'video' | 'room' | 'game' | 'storybook' | 'tradio' | 'fan_group' | 'trance_trend';
  signal_source: string;
  signal_weight: number;
  context?: Record<string, unknown>;
}

export interface TradioPrescriptionSignal extends TradioProfileBridge {
  scope: 'tradio';
  active_mode: TradioMode;
  signal_type: 'listen' | 'save' | 'skip' | 'like' | 'follow' | 'vote' | 'request' | 'upload' | 'broadcast' | 'community';
  signal_source: TradioPrescriptionSource;
  signal_weight: number;
  mood?: TradioPrescriptionMood;
  genre?: string;
  context?: Record<string, unknown>;
}

export interface TradioMusicTasteProfile extends TradioProfileBridge {
  active_mode: TradioMode;
  favorite_genres: string[];
  favorite_moods: TradioPrescriptionMood[];
  favorite_artists?: string[];
  station_habits?: string[];
  skip_save_like_behavior?: string;
  song_wars_voting_behavior?: string;
  live_show_attendance?: string;
  community_participation?: string;
  release_style?: string;
  fanbase_mood?: string;
  station_programming_style?: string;
  similar_artists?: string[];
  preferred_collaborators?: string[];
  beat_patterns?: string[];
  artist_match_preferences?: string[];
  dj_opportunity_preferences?: string[];
  show_formats?: string[];
  time_slots?: string[];
  fan_request_style?: string;
  mix_energy?: string;
  programming_identity?: string;
}

export interface TradioPrescriptionContext {
  scope: PrescribeMeScope;
  active_mode: TradioMode;
  moment: 'home' | 'stations' | 'search' | 'library' | 'studio' | 'broadcast' | 'song_wars';
  mood?: TradioPrescriptionMood;
  source?: TradioPrescriptionSource;
}

export interface TradioPrescriptionResult {
  id: string;
  scope: 'tradio';
  active_mode: TradioMode;
  result_type: TradioPrescriptionSource | 'strategy' | 'show_flow' | 'platform_feature';
  result_id?: string;
  title: string;
  subtitle: string;
  reason: string;
  reason_code: TradioPrescriptionReason;
  confidence_score: number;
  mood?: TradioPrescriptionMood;
  genre?: string;
  image: string;
  cta: string;
}

export interface TradioRecommendationRail {
  id: string;
  title: string;
  subtitle: string;
  context: TradioPrescriptionContext;
  results: TradioPrescriptionResult[];
}

const bridge = (key: MockIdentityKey): TradioProfileBridge => ({
  user_id: `${key}-mock-user`,
  profile_id: `${key}-mock-profile`,
  public_profile_uid: `treytv_${key}_prescribe_me`,
  trey_tv_uid: `TTV-${key.toUpperCase()}-PM`,
});

type PrescribeMeTasteProfileKey = Extract<MockIdentityKey, 'fan' | 'artist' | 'producer' | 'dj' | 'multi' | 'admin'>;

export const MOCK_TRADIO_TASTE_PROFILES: Record<PrescribeMeTasteProfileKey, TradioMusicTasteProfile> = {
  fan: {
    ...bridge('fan'),
    active_mode: 'listener',
    favorite_genres: ['R&B', 'Trap Soul', 'Southern Hip-Hop'],
    favorite_moods: ['late-night', 'emotional', 'community'],
    favorite_artists: ['Trey Trizzy', 'Mila Rain', 'Kiana Lane'],
    station_habits: ['saves late-night stations', 'returns to artist stations after premieres'],
    skip_save_like_behavior: 'High save rate on emotional vocals; skips aggressive morning tracks.',
    song_wars_voting_behavior: 'Votes for vocal delivery and lyrical vulnerability.',
    live_show_attendance: 'Most active after 9 PM during premiere and request blocks.',
    community_participation: 'Frequently reacts, requests songs, and joins station polls.',
  },
  artist: {
    ...bridge('artist'),
    active_mode: 'artist',
    favorite_genres: ['R&B', 'Soul'],
    favorite_moods: ['premiere', 'emotional', 'late-night'],
    release_style: 'Emotional singles with first-listen premiere moments.',
    fanbase_mood: 'Fans respond to vulnerable hooks and late-night station drops.',
    station_programming_style: 'Release-first station with fan playlists and voice drops.',
    similar_artists: ['Kiana Lane', 'Trey Trizzy'],
    preferred_collaborators: ['melodic producers', 'late-night DJs'],
    song_wars_voting_behavior: 'Interested in friendly fanbase-overlap battles.',
  },
  producer: {
    ...bridge('producer'),
    active_mode: 'producer',
    favorite_genres: ['Trap Soul', 'Lo-Fi', 'Memphis Rap'],
    favorite_moods: ['collaboration', 'focus', 'battle-ready'],
    beat_patterns: ['88-96 BPM', 'minor key', 'warm pads', 'sparse percussion'],
    artist_match_preferences: ['melodic rappers', 'R&B vocalists', 'late-night station owners'],
    dj_opportunity_preferences: ['producer spotlight blocks', 'request-hour beat beds', 'battle intro loops'],
  },
  dj: {
    ...bridge('dj'),
    active_mode: 'dj',
    favorite_genres: ['Southern Hip-Hop', 'R&B', 'House'],
    favorite_moods: ['high-energy', 'late-night', 'community'],
    show_formats: ['45-minute mix block', 'fan request hour', 'Song Wars pre-show'],
    time_slots: ['9 PM', 'midnight', 'Friday late-night'],
    fan_request_style: 'Balances chat requests with structured energy arcs.',
    mix_energy: 'Builds from warm R&B into Memphis heat transitions.',
    programming_identity: 'Host-led live radio with replayable moments.',
  },
  multi: {
    ...bridge('multi'),
    active_mode: 'artist',
    favorite_genres: ['Trap Soul', 'R&B', 'Rap'],
    favorite_moods: ['premiere', 'collaboration', 'battle-ready'],
    release_style: 'Artist-producer drops with station premieres and beat storylines.',
    fanbase_mood: 'Fans engage with behind-the-song commentary and producer credits.',
    station_programming_style: 'Artist station that can also spotlight beats.',
    preferred_collaborators: ['Mila Rain', 'DJ Midnight Spin', 'Darius Cole'],
    beat_patterns: ['92 BPM', 'minor key', 'late-night bounce'],
  },
  admin: {
    ...bridge('admin'),
    active_mode: 'admin',
    favorite_genres: ['network-wide'],
    favorite_moods: ['discovery', 'community', 'battle-ready'],
    station_habits: ['monitors trending stations', 'reviews broadcast readiness', 'features creator momentum'],
    community_participation: 'Looks for moderation attention areas and featured content candidates.',
  },
};

export const MOCK_TRADIO_PRESCRIPTION_RESULTS: Record<TradioMode, TradioPrescriptionResult[]> = {
  listener: [
    {
      id: 'rx-fan-midnight-radio',
      scope: 'tradio',
      active_mode: 'listener',
      result_type: 'artist_station',
      result_id: 'station-midnight-velvet',
      title: 'Midnight Velvet Radio',
      subtitle: 'AI picked this station for your current energy.',
      reason: 'Based on your recent station saves and late-night R&B listening.',
      reason_code: 'late_night_listening',
      confidence_score: 0.91,
      mood: 'late-night',
      genre: 'R&B',
      image: IMG.midnightVelvet,
      cta: 'Play Station',
    },
    {
      id: 'rx-fan-song-wars',
      scope: 'tradio',
      active_mode: 'listener',
      result_type: 'song_war',
      title: 'Tonight: Vocal Hooks Battle',
      subtitle: 'A battle room with fanbases you already overlap with.',
      reason: 'You often vote for emotional vocals in Song Wars.',
      reason_code: 'song_wars_votes',
      confidence_score: 0.84,
      mood: 'battle-ready',
      image: IMG.treyTrizzy,
      cta: 'Enter Battle',
    },
  ],
  artist: [
    {
      id: 'rx-artist-friday-premiere',
      scope: 'tradio',
      active_mode: 'artist',
      result_type: 'strategy',
      title: 'Schedule a Friday Night Premiere',
      subtitle: 'Release strategy for your artist station.',
      reason: 'Your fans engage most with emotional releases after 9 PM.',
      reason_code: 'artist_fan_engagement',
      confidence_score: 0.88,
      mood: 'premiere',
      image: IMG.milaRain,
      cta: 'Plan Premiere',
    },
    {
      id: 'rx-artist-challenge',
      scope: 'tradio',
      active_mode: 'artist',
      result_type: 'song_war',
      title: 'Challenge This Artist',
      subtitle: 'A friendly Song Wars matchup with audience overlap.',
      reason: 'Your fanbases overlap in late-night trap R&B rooms.',
      reason_code: 'community_overlap',
      confidence_score: 0.78,
      mood: 'battle-ready',
      image: IMG.kianaLane,
      cta: 'Create Battle',
    },
  ],
  producer: [
    {
      id: 'rx-producer-pitch-trey',
      scope: 'tradio',
      active_mode: 'producer',
      result_type: 'beat',
      title: 'Pitch this beat to Trey Trizzy',
      subtitle: 'Artist match for your current beat pattern.',
      reason: 'Your 92 BPM minor-key beats match his current station rotation.',
      reason_code: 'beat_pattern_match',
      confidence_score: 0.9,
      mood: 'collaboration',
      genre: 'Trap Soul',
      image: IMG.dariusCole,
      cta: 'Pitch Beat',
    },
  ],
  dj: [
    {
      id: 'rx-dj-memphis-heat',
      scope: 'tradio',
      active_mode: 'dj',
      result_type: 'show_flow',
      title: 'Build a 45-minute Memphis Heat block',
      subtitle: 'Show flow for tonight.',
      reason: 'Your listeners stay longer during Southern hip-hop transitions.',
      reason_code: 'dj_retention_pattern',
      confidence_score: 0.86,
      mood: 'high-energy',
      genre: 'Southern Hip-Hop',
      image: IMG.lateNightSoul,
      cta: 'Build Show',
    },
  ],
  admin: [
    {
      id: 'rx-admin-feature-candidates',
      scope: 'tradio',
      active_mode: 'admin',
      result_type: 'platform_feature',
      title: 'Feature rising artist stations',
      subtitle: 'Platform programming candidate.',
      reason: 'Several creator stations are gaining saves and community requests.',
      reason_code: 'mode_goal',
      confidence_score: 0.74,
      mood: 'discovery',
      image: IMG.aiSphere,
      cta: 'Review Candidates',
    },
  ],
};
