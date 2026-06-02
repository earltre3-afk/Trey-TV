import type { Track } from '@/tradio/contexts/PlayerContext';

// ─── IMAGE ASSETS ─────────────────────────────────────────
export const IMG = {
  // Album/Station Art
  aiSphere: 'https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986662442_13f29141.png',
  midnightVelvet: 'https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986683829_2c697ab7.png',
  memphisAfterDark: 'https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986707024_a1d0505d.png',
  treyTrizzy: 'https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986727359_90668e12.png',
  neonHeartbreak: 'https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986750809_4e57f6ad.jpg',
  outOfOrbit: 'https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986767781_0ba6a8e1.jpg',
  milaRain: 'https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986787354_65419cd8.png',
  noahKade: 'https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986809175_9fd3c540.png',
  dariusCole: 'https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986835747_6ddf50eb.jpg',
  kianaLane: 'https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986874398_28ab4dd4.png',
  healingLotus: 'https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986891701_e9dca9ca.jpg',
  midnightDrive: 'https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986907668_f7d54282.jpg',
  instantDrop: 'https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986932694_df46e3b9.jpg',
  jordan: 'https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986950242_08bd0357.jpg',
  lateNightSoul: 'https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986969747_0621f927.jpg',
  flowers: 'https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986988018_572a0201.jpg',
};

// ─── TYPES ────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  avatar: string;
  role: UserRole | 'listener';
  verified: boolean;
  followers?: number;
  following?: number;
  bio?: string;
  badges?: string[];
  creatorType?: CreatorType;
  stationOwnership?: string[];
  studioPermissions?: StudioPermission[];
}

export interface Station {
  id: string;
  title: string;
  description?: string;
  image: string;
  genre: string;
  owner?: {
    name: string;
    avatar: string;
    verified?: boolean;
  };
  followers: number;
  nowPlaying?: Track;
  isLive?: boolean;
  tags?: string[];
}

export interface CommunityMessage {
  id: string;
  author: string;
  avatar: string;
  message: string;
  timestamp: string;
  verified?: boolean;
}

export interface Poll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  totalVotes: number;
  endsIn?: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  artist?: string;
  type: 'premiere' | 'dj-show' | 'producer-spotlight' | 'fan-request' | 'replay' | 'sponsored' | 'live' | 'block';
  startTime: string;
  endTime?: string;
  image?: string;
  description?: string;
  status?: 'live' | 'upcoming' | 'replay';
  station?: string;
  listeners?: number;
}

export interface Release {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  releasedAt: string;
  streams?: number;
}

export interface VoiceDrop {
  id: string;
  artist: string;
  avatar: string;
  text: string;
  duration: number;
  recordedAt: string;
}

export interface StudioStats {
  plays: number;
  likes: number;
  shares: number;
  followers: number;
  newFollowers: number;
  avgListenTime: number;
}

// ─── ROLE & CREATOR TYPES ─────────────────────────────────
export type UserRole = 'fan' | 'artist' | 'producer' | 'dj' | 'admin';
export type CreatorType = 'fan' | 'artist' | 'producer' | 'dj' | 'admin';
export type StudioPermission =
  | 'manage-station'
  | 'release-music'
  | 'upload-beats'
  | 'manage-beat-packs'
  | 'go-live'
  | 'build-show'
  | 'manage-community'
  | 'view-analytics'
  | 'admin-ready';

export interface RoleAwareUser extends User {
  role: UserRole;
  modeLabel: string;
  activeProfileId?: string;
  fanProfile?: FanProfile;
  artistProfile?: ArtistProfile;
  producerProfile?: ProducerProfile;
  djProfile?: DJProfile;
}

export interface FanProfile {
  id: string;
  userId: string;
  displayName: string;
  avatar: string;
  badges: string[];
  favoriteStations: string[];
  requestCount: number;
  votesCast: number;
  listeningStreak: number;
  supportTier: 'free' | 'supporter' | 'vip';
}

export interface ArtistProfile {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  verified: boolean;
  bio: string;
  followers: number;
  stationCount: number;
  totalReleases: number;
  monthlyListeners: number;
  spotlightTrack?: string;
  pinnedRelease?: string;
}

export interface ProducerProfile {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  verified: boolean;
  bio: string;
  followers: number;
  beatCount: number;
  collaborations: number;
  specialties: string[]; // ['lo-fi', 'trap', 'r&b', etc.]
  featuredBeatPack?: string;
}

export interface DJProfile {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  verified: boolean;
  bio: string;
  followers: number;
  showCount: number;
  totalListeners: number;
  specialties: string[]; // ['house', 'hip-hop mix', 'live radio', etc.]
  currentlyBroadcasting: boolean;
  upcomingShowCount: number;
}

export interface Beat {
  id: string;
  title: string;
  producerId: string;
  producerName: string;
  producerAvatar: string;
  artwork: string;
  bpm: number;
  key: string;
  mood: string[];
  genre: string;
  duration: number;
  plays: number;
  downloads: number;
  price?: number; // 'free' or price in credits
  tags: string[];
  previewUrl: string;
}

export interface BeatPack {
  id: string;
  title: string;
  producerId: string;
  producerName: string;
  artwork: string;
  description: string;
  beatCount: number;
  theme: string;
  price?: number;
  createdAt: string;
  downloads: number;
}

export interface CollaborationRequest {
  id: string;
  from: { id: string; name: string; avatar: string; type: 'artist' | 'producer' | 'dj' };
  to: { id: string; name: string };
  type: 'collab' | 'feature' | 'remix';
  message: string;
  beatId?: string;
  status: 'pending' | 'accepted' | 'declined';
  sentAt: string;
}

export interface DJMix {
  id: string;
  djId: string;
  djName: string;
  title: string;
  description: string;
  artwork: string;
  duration: number;
  tracklist: { track: Track; timestamp: number }[];
  plays: number;
  savedBy: number;
  isLive: boolean;
  scheduledFor?: string;
  genre: string;
  mood: string;
}

export interface ShowSegment {
  id: string;
  type: 'intro' | 'music-block' | 'host-talk' | 'fan-request' | 'producer-spotlight' | 'artist-premiere' | 'commercial' | 'poll' | 'closing';
  title: string;
  duration: number; // in seconds
  description?: string;
  tracks?: Track[];
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
  duration: number; // in minutes
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
  status: 'draft' | 'template' | 'scheduled' | 'live' | 'archived';
  scheduledFor?: string;
  audience?: number;
  aiGenerated: boolean;
}

export interface ListenerRequest {
  id: string;
  listenerId: string;
  listenerName: string;
  listenerAvatar: string;
  songTitle?: string;
  artistName?: string;
  message?: string;
  requestedAt: string;
  played: boolean;
  timestamp?: number;
}

export interface FanVote {
  id: string;
  listenerId: string;
  stationId: string;
  voteType: 'track' | 'mood' | 'segment';
  votedFor: string;
  timestamp: string;
}

export interface PlaylistCollection {
  id: string;
  title: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  description: string;
  artwork: string;
  tracks: Track[];
  followers: number;
  isPublic: boolean;
  mood?: string;
  genre?: string;
  createdAt: string;
}

export type ArtistPlaylist = PlaylistCollection;

export interface AdSlot {
  id: string;
  showId?: string;
  title: string;
  duration: number;
  sponsor?: string;
  placement: 'pre-roll' | 'mid-roll' | 'post-roll';
  status: 'placeholder' | 'reserved' | 'ready';
}

export interface HostNote {
  id: string;
  showId?: string;
  segmentId?: string;
  title: string;
  note: string;
  tone: string;
}

export interface ReplayItem {
  id: string;
  showId: string;
  title: string;
  host: string;
  artwork: string;
  duration: number;
  playedAt: string;
  plays: number;
  saves: number;
}

export interface BroadcastStatus {
  id: string;
  djId: string;
  djName: string;
  isLive: boolean;
  currentShow?: string;
  currentTrack?: Track;
  listeners: number;
  startedAt: string;
  duration: number;
}

// ─── CURRENT USER (Role-Aware) ────────────────────────────
export const CURRENT_USER: User = {
  id: 'user-jordan',
  name: 'Jordan',
  avatar: IMG.jordan,
  role: 'fan',
  verified: false,
  followers: 234,
  following: 487,
  bio: 'Late night vibes & good music 🌙',
  badges: ['Top Fan', 'Request Maker'],
  creatorType: 'fan',
  stationOwnership: [],
  studioPermissions: ['manage-community'],
};

export const CURRENT_USER_ROLE: UserRole = 'fan'; // Can be 'fan' | 'artist' | 'producer' | 'dj'

export const ROLE_MODES: Record<UserRole, { label: string; description: string; permissions: StudioPermission[] }> = {
  fan: {
    label: 'Listener Mode',
    description: 'Listen, vote, request, chat, save, and support creators.',
    permissions: ['manage-community'],
  },
  artist: {
    label: 'Artist Studio',
    description: 'Release music, own stations, premiere tracks, and notify fans.',
    permissions: ['manage-station', 'release-music', 'manage-community', 'view-analytics'],
  },
  producer: {
    label: 'Producer Hub',
    description: 'Upload beats, package catalogs, pitch artists, and feed DJ mixes.',
    permissions: ['upload-beats', 'manage-beat-packs', 'manage-community', 'view-analytics'],
  },
  dj: {
    label: 'DJ Studio',
    description: 'Build shows, go live, schedule mixes, and manage listener requests.',
    permissions: ['go-live', 'build-show', 'manage-community', 'view-analytics'],
  },
  admin: {
    label: 'Network Admin',
    description: 'Future moderation, programming, monetization, and network controls.',
    permissions: ['admin-ready', 'manage-station', 'release-music', 'upload-beats', 'go-live', 'build-show', 'view-analytics'],
  },
};

// ─── ARTISTS ──────────────────────────────────────────────
export const ARTISTS: Record<string, User> = {
  treyTrizzy: {
    id: 'artist-trey',
    name: 'Trey Trizzy',
    avatar: IMG.treyTrizzy,
    role: 'artist',
    verified: true,
    followers: 125400,
    bio: 'Trap & Hip-Hop Creator | Tradio Artist',
  },
  kianaLane: {
    id: 'artist-kiana',
    name: 'Kiana Lane',
    avatar: IMG.kianaLane,
    role: 'artist',
    verified: true,
    followers: 89200,
    bio: 'Soul & R&B | Artist-Owned Station',
  },
  milaRain: {
    id: 'artist-mila',
    name: 'Mila Rain',
    avatar: IMG.milaRain,
    role: 'artist',
    verified: true,
    followers: 67800,
    bio: 'Indie Pop | Emotional Sound',
  },
  noahKade: {
    id: 'artist-jaye',
    name: 'JAYE.',
    avatar: IMG.noahKade,
    role: 'artist',
    verified: true,
    followers: 54300,
    bio: 'Chill Hip-Hop & Lo-Fi',
  },
  dariusCole: {
    id: 'artist-darius',
    name: 'Darius Cole',
    avatar: IMG.dariusCole,
    role: 'artist',
    verified: true,
    followers: 43200,
    bio: 'Electronic & House',
  },
};

export const ARTIST_PROFILES: ArtistProfile[] = [
  {
    id: 'artist-profile-trey',
    userId: ARTISTS.treyTrizzy.id,
    name: ARTISTS.treyTrizzy.name,
    avatar: ARTISTS.treyTrizzy.avatar,
    verified: true,
    bio: ARTISTS.treyTrizzy.bio || '',
    followers: ARTISTS.treyTrizzy.followers || 0,
    stationCount: 2,
    totalReleases: 38,
    monthlyListeners: 287600,
    spotlightTrack: 'Midnight Velvet',
    pinnedRelease: 'Neon Heartbreak',
  },
  {
    id: 'artist-profile-kiana',
    userId: ARTISTS.kianaLane.id,
    name: ARTISTS.kianaLane.name,
    avatar: ARTISTS.kianaLane.avatar,
    verified: true,
    bio: ARTISTS.kianaLane.bio || '',
    followers: ARTISTS.kianaLane.followers || 0,
    stationCount: 1,
    totalReleases: 24,
    monthlyListeners: 198200,
    spotlightTrack: 'Falling For You',
    pinnedRelease: 'Kiana Soulful Selections',
  },
];

// SoundHelix free MP3 samples — used for in-shell audio playback demo
const SH = (n: number) => `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`;

// ─── MASTER TRACK CATALOG ──────────────────────────────
export const TRACKS: Record<string, Track> = {
  midnightVelvet: { id: 'midnight-velvet', title: 'Midnight Velvet', artist: 'Trey Trizzy', art: IMG.treyTrizzy, station: 'Neon Heartbreak Radio', src: SH(1) },
  memphisAfterDark: { id: 'memphis-after-dark', title: 'Memphis After Dark', artist: 'Blues • Soul • Classic', art: IMG.memphisAfterDark, station: 'Memphis Heat', src: SH(2) },
  treyTrizzyRadio: { id: 'trey-trizzy-radio', title: 'Trey Trizzy Radio', artist: 'Hip-Hop • Trap • Bangers', art: IMG.treyTrizzy, station: 'Trey Trizzy Radio', src: SH(3) },
  neonHeartbreak: { id: 'neon-heartbreak', title: 'Neon Heartbreak', artist: 'Pop • Indie • Heartfelt', art: IMG.neonHeartbreak, station: 'Neon Heartbreak Radio', src: SH(4) },
  fallingForYou: { id: 'falling-for-you', title: 'Falling For You', artist: 'Mila Rain', art: IMG.milaRain, station: 'Mila Rain Radio', src: SH(5) },
  outOfOrbit: { id: 'out-of-orbit', title: 'Out Of Orbit', artist: 'Miles Avalon', art: IMG.outOfOrbit, station: 'AI Radio', src: SH(6) },
  underCityLights: { id: 'under-city-lights', title: 'Under City Lights', artist: 'Noah Kade', art: IMG.noahKade, station: 'JAYE. Radio', src: SH(7) },
  sixAmThoughts: { id: '6am-thoughts', title: '6AM Thoughts', artist: 'Trey Trizzy', art: IMG.treyTrizzy, station: 'Trey Trizzy Radio', src: SH(8) },
  instantDrop: { id: 'instant-drop', title: 'Instant Drop', artist: 'Zaylen', art: IMG.instantDrop, station: 'AI Radio', src: SH(9) },
  noLookingBack: { id: 'no-looking-back', title: 'No Looking Back', artist: 'Luna Rae', art: IMG.flowers, station: 'AI Radio', src: SH(10) },
  cityLights: { id: 'city-lights', title: 'City Lights', artist: 'JAYE.', art: IMG.noahKade, station: 'JAYE. Radio', src: SH(11) },
  afterHours: { id: 'after-hours', title: 'After Hours', artist: 'Giveon', art: IMG.midnightVelvet, station: 'Late Night R&B', src: SH(12) },
  persuasion: { id: 'persuasion', title: 'Persuasion', artist: 'Brent Faiyaz', art: IMG.midnightDrive, station: 'Late Night R&B', src: SH(13) },
  dontCall: { id: 'dont-call', title: "Don't Call", artist: 'SZA', art: IMG.flowers, station: 'Late Night R&B', src: SH(14) },
  spinning: { id: 'spinning', title: 'Spinning', artist: 'Summer Walker', art: IMG.neonHeartbreak, station: 'Late Night R&B', src: SH(15) },
  aiRadio: { id: 'ai-radio', title: 'AI Radio For You', artist: 'Tradio AI', art: IMG.aiSphere, station: 'AI Radio', src: SH(16) },
  lateNightSoul: { id: 'late-night-soul', title: 'Late Night Soul Radio', artist: 'AI Preview', art: IMG.lateNightSoul, station: 'AI Preview', src: SH(1) },
  untitledSignal: { id: 'untitled-signal', title: 'Untitled Signal', artist: 'Unknown Broadcast', art: '', station: 'Deep Space Feed', src: SH(1) },
  brokenSignal: { id: 'broken-signal', title: 'Late Night Demo', artist: 'Producer Bounce', art: 'https://invalid-image-domain.com/broken.jpg', station: 'Sonic Identity', src: SH(2) },
  processingSignal: { id: 'processing-signal', title: 'New Drop (Processing)', artist: 'Trey Trizzy', art: 'processing', station: 'TRADIO SIGNAL', src: SH(3) },
};

// ─── ALL STATIONS ──────────────────────────────────────
export const ALL_STATIONS: Station[] = [
  // Featured Stations
  {
    id: 'station-midnight-velvet',
    title: 'Midnight Velvet',
    description: 'Soul, R&B, and late-night vibes to sink into',
    image: IMG.midnightVelvet,
    genre: 'Soul • R&B • Late Night',
    followers: 45200,
    nowPlaying: TRACKS.midnightVelvet,
    isLive: true,
    tags: ['soul', 'relaxing', 'evening'],
  },
  {
    id: 'station-memphis-heat',
    title: 'Memphis After Dark',
    description: 'Classic blues and soul legends',
    image: IMG.memphisAfterDark,
    genre: 'Blues • Soul • Classic',
    followers: 38900,
    nowPlaying: TRACKS.memphisAfterDark,
    isLive: true,
    tags: ['blues', 'classic', 'soul'],
  },
  {
    id: 'station-trey-trizzy',
    title: 'Trey Trizzy Radio',
    description: 'Hip-hop, trap, and bangers from the artist',
    image: IMG.treyTrizzy,
    genre: 'Hip-Hop • Trap • Bangers',
    followers: 67400,
    owner: ARTISTS.treyTrizzy,
    nowPlaying: TRACKS.treyTrizzyRadio,
    isLive: true,
    tags: ['hiphop', 'trap', 'energy'],
  },
  {
    id: 'station-neon-heartbreak',
    title: 'Neon Heartbreak Radio',
    description: 'Indie pop and heartfelt pop-rock',
    image: IMG.neonHeartbreak,
    genre: 'Pop • Indie • Heartfelt',
    followers: 52100,
    nowPlaying: TRACKS.neonHeartbreak,
    isLive: true,
    tags: ['indie', 'pop', 'emotional'],
  },
  // Artist-Owned Stations
  {
    id: 'station-kiana-lane',
    title: 'Kiana Lane Radio',
    description: 'R&B, Soul, and smooth vocals from Kiana',
    image: IMG.kianaLane,
    genre: 'R&B • Soul • Smooth',
    followers: 34500,
    owner: ARTISTS.kianaLane,
    nowPlaying: TRACKS.fallingForYou,
    isLive: false,
    tags: ['randb', 'soul', 'smooth'],
  },
  {
    id: 'station-mila-rain',
    title: 'Mila Rain Radio',
    description: 'Indie pop and emotional journeys',
    image: IMG.milaRain,
    genre: 'Indie • Pop • Emotional',
    followers: 28700,
    owner: ARTISTS.milaRain,
    nowPlaying: TRACKS.fallingForYou,
    isLive: false,
    tags: ['indie', 'pop', 'emotional'],
  },
  {
    id: 'station-jaye',
    title: 'JAYE. Radio',
    description: 'Chill hip-hop and lo-fi beats',
    image: IMG.noahKade,
    genre: 'Hip-Hop • Lo-Fi • Chill',
    followers: 41200,
    owner: ARTISTS.noahKade,
    nowPlaying: TRACKS.cityLights,
    isLive: true,
    tags: ['lofi', 'hiphop', 'chill'],
  },
  {
    id: 'station-late-night-rb',
    title: 'Late Night R&B',
    description: 'Smooth R&B for the late hours',
    image: IMG.lateNightSoul,
    genre: 'R&B • Soul • Smooth',
    followers: 56300,
    nowPlaying: TRACKS.afterHours,
    isLive: true,
    tags: ['randb', 'relaxing', 'night'],
  },
];

// ─── STATION COMMUNITIES ──────────────────────────────
export const STATION_COMMUNITIES: Record<string, { messages: CommunityMessage[]; polls: Poll[] }> = {
  'station-trey-trizzy': {
    messages: [
      { id: '1', author: 'Alex M', avatar: IMG.jordan, message: '🔥🔥 This track is absolute fire right now', timestamp: '2m ago', verified: false },
      { id: '2', author: 'Trey Trizzy', avatar: IMG.treyTrizzy, message: 'Thanks everyone for the love! New release coming Friday 🎵', timestamp: '5m ago', verified: true },
      { id: '3', author: 'Cosmic Vibes', avatar: IMG.milaRain, message: 'Finally got my friends into Tradio because of this station', timestamp: '8m ago', verified: false },
      { id: '4', author: 'Echo Pulse', avatar: IMG.flowers, message: 'The production quality on this is unreal', timestamp: '12m ago', verified: false },
    ],
    polls: [
      {
        id: 'poll-1',
        question: 'What\'s your vibe right now?',
        options: [
          { id: 'opt1', text: '🔥 High Energy', votes: 342 },
          { id: 'opt2', text: '😎 Chill Mode', votes: 256 },
          { id: 'opt3', text: '😴 Night Vibes', votes: 189 },
          { id: 'opt4', text: '💪 Workout Time', votes: 127 },
        ],
        totalVotes: 914,
        endsIn: '2h',
      },
    ],
  },
  'station-kiana-lane': {
    messages: [
      { id: '1', author: 'Kiana Lane', avatar: IMG.kianaLane, message: 'Love seeing this community grow! 💜', timestamp: '1m ago', verified: true },
      { id: '2', author: 'Soul Seeker', avatar: IMG.lateNightSoul, message: 'This is pure artistry. Kiana deserves so much more', timestamp: '4m ago', verified: false },
      { id: '3', author: 'Vibe Check', avatar: IMG.flowers, message: 'Every song hits different', timestamp: '7m ago', verified: false },
    ],
    polls: [
      {
        id: 'poll-2',
        question: 'Favorite Kiana Lane era?',
        options: [
          { id: 'opt1', text: 'Early Days', votes: 128 },
          { id: 'opt2', text: 'The Awakening', votes: 267 },
          { id: 'opt3', text: 'Current Era', votes: 345 },
        ],
        totalVotes: 740,
        endsIn: '4h',
      },
    ],
  },
};

// ─── RELEASES (Instant Drops) ──────────────────────────
export const RELEASES: Release[] = [
  { id: 'rel-1', title: 'Instant Drop', artist: 'Zaylen', artwork: IMG.instantDrop, releasedAt: '2 minutes ago', streams: 4200 },
  { id: 'rel-2', title: 'No Looking Back', artist: 'Luna Rae', artwork: IMG.flowers, releasedAt: '7 minutes ago', streams: 12500 },
  { id: 'rel-3', title: 'Out Of Orbit', artist: 'Miles Avalon', artwork: IMG.outOfOrbit, releasedAt: '11 minutes ago', streams: 28900 },
  { id: 'rel-4', title: 'Neon Dreams', artist: 'Kiana Lane', artwork: IMG.kianaLane, releasedAt: '23 minutes ago', streams: 45200 },
  { id: 'rel-5', title: 'Midnight Run', artist: 'Trey Trizzy', artwork: IMG.treyTrizzy, releasedAt: '1 hour ago', streams: 127300 },
];

// ─── VOICE DROPS (Artist feature) ──────────────────────
export const VOICE_DROPS: VoiceDrop[] = [
  { id: 'vd-1', artist: 'Trey Trizzy', avatar: IMG.treyTrizzy, text: 'Yo, thanks for rocking with my station! New album coming soon.', duration: 4.2, recordedAt: '2 days ago' },
  { id: 'vd-2', artist: 'Kiana Lane', avatar: IMG.kianaLane, text: 'Hey beautiful souls, thanks for the support. Check out my new release.', duration: 5.1, recordedAt: '1 day ago' },
  { id: 'vd-3', artist: 'JAYE.', avatar: IMG.noahKade, text: 'Appreciate all the love. Stay chill and keep it moving.', duration: 3.8, recordedAt: '3 days ago' },
];

// ─── SCHEDULE / PROGRAMMING ────────────────────────────
export const SCHEDULE: ScheduleItem[] = [
  { id: 'sch-songwars', title: 'PVP Song War: Trey Trizzy vs Kiana Lane', artist: 'Trey Trizzy & Kiana Lane', type: 'live', startTime: '10:00 PM', endTime: '11:00 PM', image: IMG.treyTrizzy, description: 'Live pvp music duel! Round-by-round voting and interactive emoji clashing.', status: 'live', station: 'Song Wars Arena', listeners: 14850 },
  { id: 'sch-1', title: 'Midnight Velvet Premiere', artist: 'Trey Trizzy', type: 'premiere', startTime: '10:00 PM', endTime: '10:45 PM', image: IMG.treyTrizzy, description: 'First listen of the new single with fan shoutouts.', status: 'live', station: 'Trey Trizzy Radio', listeners: 18400 },
  { id: 'sch-2', title: 'Midnight Therapy Live', artist: 'Midnight Spin', type: 'dj-show', startTime: '11:00 PM', endTime: '1:00 AM', image: IMG.midnightVelvet, description: 'Live DJ show with requests, transitions, and talk breaks.', status: 'upcoming', station: 'Late Night R&B', listeners: 12600 },
  { id: 'sch-3', title: 'Alex Beats Spotlight', artist: 'Alex Beats', type: 'producer-spotlight', startTime: '1:00 AM', endTime: '1:30 AM', image: IMG.midnightDrive, description: 'Producer beat showcase ready for artists and DJs.', status: 'upcoming', station: 'Producer Signal', listeners: 7400 },
  { id: 'sch-4', title: 'Fan Request Hour', type: 'fan-request', startTime: '2:00 AM', endTime: '3:00 AM', image: IMG.lateNightSoul, description: 'Listeners vote and request what plays next.', status: 'upcoming', station: 'AI Radio', listeners: 9100 },
  { id: 'sch-5', title: 'Replay: Kiana Lane Premiere Room', artist: 'Kiana Lane', type: 'replay', startTime: '3:00 AM', endTime: '4:00 AM', image: IMG.kianaLane, description: 'Replay package with premiere chat highlights.', status: 'replay', station: 'Kiana Lane Radio', listeners: 5200 },
  { id: 'sch-6', title: 'Trey TV Music Minute', type: 'sponsored', startTime: '4:00 AM', endTime: '4:05 AM', image: IMG.aiSphere, description: 'Sponsored/commercial block placeholder.', status: 'upcoming', station: 'Network Guide', listeners: 0 },
];

// ─── STUDIO ANALYTICS (Artist Dashboard) ──────────────
export const ARTIST_STATS: StudioStats = {
  plays: 1247500,
  likes: 34200,
  shares: 8900,
  followers: 125400,
  newFollowers: 2340,
  avgListenTime: 3.2, // minutes
};

// ─── BACKWARD-COMPATIBLE EXPORTS ──────────────────────
// Legacy exports for screens that use old data structure
export const FEATURED_STATIONS = ALL_STATIONS.slice(0, 4).map((s) => ({
  id: s.id,
  title: s.title,
  tags: s.genre,
  img: s.image,
  track: s.nowPlaying || TRACKS.aiRadio,
}));

export const ARTIST_STATIONS = [
  { id: 'artist-kiana', name: 'Kiana Lane', img: IMG.kianaLane, verified: true, track: TRACKS.fallingForYou },
  { id: 'artist-jaye', name: 'JAYE.', img: IMG.noahKade, verified: true, track: TRACKS.cityLights },
  { id: 'artist-darius', name: 'Darius Cole', img: IMG.dariusCole, verified: true, track: TRACKS.treyTrizzyRadio },
  { id: 'artist-mila', name: 'Mila Rain', img: IMG.milaRain, verified: true, track: TRACKS.fallingForYou },
];

export const INSTANT_RELEASES = RELEASES.map((r) => ({
  id: r.id,
  title: r.title,
  artist: r.artist,
  released: r.releasedAt,
  img: r.artwork,
  track: TRACKS.instantDrop,
}));

export const TRENDING = [
  { rank: 1, title: 'Under City Lights', artist: 'Noah Kade', delta: '24%', img: IMG.noahKade, track: TRACKS.underCityLights },
  { rank: 2, title: 'Falling For You', artist: 'Mila Rain', delta: '18%', img: IMG.milaRain, track: TRACKS.fallingForYou },
  { rank: 3, title: '6AM Thoughts', artist: 'Trey Trizzy', delta: '15%', img: IMG.treyTrizzy, track: TRACKS.sixAmThoughts },
];

export const ROTATION = [
  { n: 1, title: 'Falling For You', artist: 'Mila Rain', dur: '3:18', img: IMG.milaRain, track: TRACKS.fallingForYou },
  { n: 2, title: 'Out Of Orbit', artist: 'Miles Avalon', dur: '2:54', img: IMG.outOfOrbit, track: TRACKS.outOfOrbit },
  { n: 3, title: 'Memphis After Dark', artist: 'Blues • Soul • Classic', dur: '4:07', img: IMG.memphisAfterDark, track: TRACKS.memphisAfterDark },
  { n: 4, title: 'Under City Lights', artist: 'Noah Kade', dur: '3:21', img: IMG.noahKade, track: TRACKS.underCityLights },
];

export const SEARCH_SONGS = [
  { ...TRACKS.afterHours, dur: '3:28' },
  { ...TRACKS.persuasion, dur: '2:49' },
  { ...TRACKS.dontCall, dur: '3:15' },
  { ...TRACKS.spinning, dur: '2:57' },
  { ...TRACKS.untitledSignal, dur: '3:45' },
  { ...TRACKS.brokenSignal, dur: '2:12' },
  { ...TRACKS.processingSignal, dur: '3:04' },
];

export const COLLECTIONS = [
  { title: 'Late Night Essentials', sub: '32 tracks • Updated 2d ago', img: IMG.midnightVelvet, tracks: [TRACKS.midnightVelvet, TRACKS.afterHours, TRACKS.fallingForYou] },
  { title: 'Heartbreak Hotel', sub: '24 tracks • Updated 5d ago', img: IMG.neonHeartbreak, tracks: [TRACKS.neonHeartbreak, TRACKS.dontCall, TRACKS.spinning] },
  { title: 'Morning Elevation', sub: '18 tracks • Updated 1w ago', img: IMG.flowers, tracks: [TRACKS.cityLights, TRACKS.underCityLights, TRACKS.outOfOrbit] },
];

// ─── PRODUCER PROFILES & BEATS ────────────────────────────
export const PRODUCERS: ProducerProfile[] = [
  {
    id: 'prod-alex-beats',
    userId: 'user-alex',
    name: 'Alex Beats',
    avatar: IMG.dariusCole,
    verified: true,
    bio: 'Lo-fi & Trap producer | 50K+ downloads',
    followers: 28400,
    beatCount: 342,
    collaborations: 12,
    specialties: ['lo-fi', 'trap', 'ambient'],
    featuredBeatPack: 'pack-lo-fi-nights',
  },
  {
    id: 'prod-sonic-craft',
    userId: 'user-sonic',
    name: 'Sonic Craft',
    avatar: IMG.noahKade,
    verified: true,
    bio: 'R&B & Soul production | Worked with major artists',
    followers: 42100,
    beatCount: 156,
    collaborations: 28,
    specialties: ['r&b', 'soul', 'jazz'],
    featuredBeatPack: 'pack-soul-sessions',
  },
  {
    id: 'prod-wave-maker',
    userId: 'user-wave',
    name: 'Wave Maker',
    avatar: IMG.milaRain,
    verified: false,
    bio: 'House & Electronic enthusiast',
    followers: 12300,
    beatCount: 89,
    collaborations: 5,
    specialties: ['house', 'electronic', 'deep-house'],
  },
];

export const BEATS: Beat[] = [
  {
    id: 'beat-1',
    title: 'Midnight Dream',
    producerId: 'prod-alex-beats',
    producerName: 'Alex Beats',
    producerAvatar: IMG.dariusCole,
    artwork: IMG.midnightDrive,
    bpm: 88,
    key: 'Cm',
    mood: ['chill', 'late-night', 'introspective'],
    genre: 'Lo-Fi',
    duration: 240,
    plays: 12400,
    downloads: 340,
    price: undefined, // free
    tags: ['lofi', 'hip-hop', 'night'],
    previewUrl: SH(1),
  },
  {
    id: 'beat-2',
    title: 'Soul Connection',
    producerId: 'prod-sonic-craft',
    producerName: 'Sonic Craft',
    producerAvatar: IMG.noahKade,
    artwork: IMG.lateNightSoul,
    bpm: 92,
    key: 'Em',
    mood: ['smooth', 'soulful', 'emotional'],
    genre: 'R&B',
    duration: 210,
    plays: 18900,
    downloads: 620,
    price: undefined,
    tags: ['randb', 'soul', 'smooth'],
    previewUrl: SH(2),
  },
  {
    id: 'beat-3',
    title: 'Electric Pulse',
    producerId: 'prod-wave-maker',
    producerName: 'Wave Maker',
    producerAvatar: IMG.milaRain,
    artwork: IMG.neonHeartbreak,
    bpm: 128,
    key: 'Am',
    mood: ['energetic', 'dance', 'euphoric'],
    genre: 'House',
    duration: 320,
    plays: 7200,
    downloads: 150,
    price: undefined,
    tags: ['house', 'electronic', 'dance'],
    previewUrl: SH(3),
  },
];

export const BEAT_PACKS: BeatPack[] = [
  {
    id: 'pack-lo-fi-nights',
    title: 'Lo-Fi Nights Collection',
    producerId: 'prod-alex-beats',
    producerName: 'Alex Beats',
    artwork: IMG.midnightDrive,
    description: '15 premium lo-fi beats perfect for study and chill sessions',
    beatCount: 15,
    theme: 'Lo-Fi Hip-Hop',
    price: undefined,
    createdAt: '2025-05-15',
    downloads: 2340,
  },
  {
    id: 'pack-soul-sessions',
    title: 'Soul Sessions',
    producerId: 'prod-sonic-craft',
    producerName: 'Sonic Craft',
    artwork: IMG.lateNightSoul,
    description: '20 smooth R&B and Soul beats for artists and producers',
    beatCount: 20,
    theme: 'R&B Soul',
    price: undefined,
    createdAt: '2025-04-22',
    downloads: 3120,
  },
];

// ─── DJ PROFILES & MIXES ──────────────────────────────────
export const DJS: DJProfile[] = [
  {
    id: 'dj-midnight-spin',
    userId: 'user-midnight',
    name: 'Midnight Spin',
    avatar: IMG.treyTrizzy,
    verified: true,
    bio: 'Late night radio host | Hip-Hop & Trap specialist',
    followers: 65400,
    showCount: 287,
    totalListeners: 1240000,
    specialties: ['hip-hop', 'trap', 'late-night radio'],
    currentlyBroadcasting: false,
    upcomingShowCount: 3,
  },
  {
    id: 'dj-rhythm-flow',
    userId: 'user-rhythm',
    name: 'Rhythm Flow',
    avatar: IMG.kianaLane,
    verified: true,
    bio: 'Electronic & House DJ | Festival veteran',
    followers: 48200,
    showCount: 156,
    totalListeners: 890000,
    specialties: ['house', 'electronic', 'deep-house'],
    currentlyBroadcasting: false,
    upcomingShowCount: 2,
  },
];

export const DJ_MIXES: DJMix[] = [
  {
    id: 'mix-1',
    djId: 'dj-midnight-spin',
    djName: 'Midnight Spin',
    title: 'Late Night Vibes - May 26',
    description: 'A 2-hour mix of late-night hip-hop and trap',
    artwork: IMG.midnightVelvet,
    duration: 7200,
    tracklist: [
      { track: TRACKS.midnightVelvet, timestamp: 0 },
      { track: TRACKS.sixAmThoughts, timestamp: 240 },
      { track: TRACKS.treyTrizzyRadio, timestamp: 480 },
    ],
    plays: 12400,
    savedBy: 340,
    isLive: false,
    genre: 'Hip-Hop',
    mood: 'late-night',
  },
];

// ─── COLLABORATION REQUESTS ──────────────────────────────
export const COLLABORATION_REQUESTS: CollaborationRequest[] = [
  {
    id: 'collab-1',
    from: { id: 'artist-trey', name: 'Trey Trizzy', avatar: IMG.treyTrizzy, type: 'artist' },
    to: { id: 'prod-alex-beats', name: 'Alex Beats' },
    type: 'collab',
    message: 'Love your "Midnight Dream" beat. Would love to create a track on it!',
    beatId: 'beat-1',
    status: 'pending',
    sentAt: '2 days ago',
  },
  {
    id: 'collab-2',
    from: { id: 'prod-sonic-craft', name: 'Sonic Craft', avatar: IMG.noahKade, type: 'producer' },
    to: { id: 'artist-kiana', name: 'Kiana Lane' },
    type: 'feature',
    message: 'Your voice would be perfect for my new Soul Sessions pack. Let me know!',
    status: 'accepted',
    sentAt: '5 days ago',
  },
];

// ─── RADIO SHOWS & AI BUILDER ────────────────────────────
export const RADIO_SHOWS: RadioShow[] = [
  {
    id: 'show-1',
    title: 'Midnight Therapy',
    djId: 'dj-midnight-spin',
    djName: 'Midnight Spin',
    duration: 120,
    mood: 'chill, introspective',
    targetAudience: 'late-night listeners',
    hostTone: 'warm, thoughtful',
    musicSource: 'Trey Trizzy Radio',
    selectedStation: 'station-trey-trizzy',
    commercialBreaks: 2,
    fanInteractionStyle: 'polls, shoutouts',
    includeProducerSpotlight: true,
    includeArtistPremiere: false,
    includeListenerRequests: true,
    segments: [
      {
        id: 'seg-1',
        type: 'intro',
        title: 'Welcome to Midnight Therapy',
        duration: 300,
        hostNotes: 'Welcome back everyone, tonight we\'re exploring late-night emotions',
        aiGenerated: true,
      },
      {
        id: 'seg-2',
        type: 'music-block',
        title: 'Opening Mix',
        duration: 900,
        tracks: [TRACKS.midnightVelvet, TRACKS.sixAmThoughts],
        aiGenerated: true,
      },
      {
        id: 'seg-3',
        type: 'producer-spotlight',
        title: 'Alex Beats Beat Showcase',
        duration: 600,
        description: 'Featuring "Midnight Dream" and other lo-fi gems',
        aiGenerated: true,
      },
      {
        id: 'seg-4',
        type: 'fan-request',
        title: 'Fan Requests',
        duration: 900,
        hostNotes: 'Taking your music requests live',
        aiGenerated: true,
      },
      {
        id: 'seg-5',
        type: 'poll',
        title: 'What\'s your mood tonight?',
        duration: 300,
        aiGenerated: true,
      },
    ],
    status: 'template',
    aiGenerated: true,
  },
];

export const SHOW_TEMPLATES: RadioShow[] = [
  {
    id: 'template-1',
    title: 'Morning Wake-Up Mix',
    duration: 90,
    mood: 'energetic, uplifting',
    targetAudience: 'morning commuters',
    hostTone: 'energetic, positive',
    musicSource: 'Prescription Radio',
    commercialBreaks: 1,
    fanInteractionStyle: 'requests only',
    includeProducerSpotlight: false,
    includeArtistPremiere: false,
    includeListenerRequests: true,
    segments: [],
    status: 'template',
    aiGenerated: true,
  },
  {
    id: 'template-2',
    title: 'Evening Study Session',
    duration: 180,
    mood: 'calm, focused',
    targetAudience: 'students, professionals',
    hostTone: 'calm, supportive',
    musicSource: 'Lo-Fi Beats',
    commercialBreaks: 0,
    fanInteractionStyle: 'minimal',
    includeProducerSpotlight: true,
    includeArtistPremiere: false,
    includeListenerRequests: false,
    segments: [],
    status: 'template',
    aiGenerated: true,
  },
];

// ─── LISTENER REQUESTS & FAN DATA ────────────────────────
export const LISTENER_REQUESTS: ListenerRequest[] = [
  {
    id: 'req-1',
    listenerId: 'user-jordan',
    listenerName: 'Jordan',
    listenerAvatar: IMG.jordan,
    songTitle: 'Falling For You',
    artistName: 'Mila Rain',
    message: 'This song changed my life 💜',
    requestedAt: '5 minutes ago',
    played: false,
  },
  {
    id: 'req-2',
    listenerId: 'user-fan2',
    listenerName: 'Casey',
    listenerAvatar: IMG.flowers,
    songTitle: 'After Hours',
    artistName: 'Giveon',
    message: 'Perfect for late night drives',
    requestedAt: '12 minutes ago',
    played: true,
    timestamp: 340,
  },
];

// ─── ARTIST PLAYLISTS & COLLECTIONS ───────────────────────
export const ARTIST_PLAYLISTS: PlaylistCollection[] = [
  {
    id: 'playlist-1',
    title: 'Trey\'s Late Night Picks',
    creatorId: 'artist-trey',
    creatorName: 'Trey Trizzy',
    creatorAvatar: IMG.treyTrizzy,
    description: 'Music that moved me this month',
    artwork: IMG.treyTrizzy,
    tracks: [TRACKS.midnightVelvet, TRACKS.fallingForYou, TRACKS.afterHours],
    followers: 23400,
    isPublic: true,
    mood: 'late-night, introspective',
    genre: 'Hip-Hop, Soul, R&B',
    createdAt: '2 weeks ago',
  },
  {
    id: 'playlist-2',
    title: 'Kiana\'s Soulful Selections',
    creatorId: 'artist-kiana',
    creatorName: 'Kiana Lane',
    creatorAvatar: IMG.kianaLane,
    description: 'Soul essentials for the moment',
    artwork: IMG.kianaLane,
    tracks: [TRACKS.cityLights, TRACKS.fallingForYou, TRACKS.lateNightSoul],
    followers: 18900,
    isPublic: true,
    mood: 'soulful, smooth',
    genre: 'R&B, Soul',
    createdAt: '1 week ago',
  },
];

// ─── BROADCAST STATUS ────────────────────────────────────
export const BROADCAST_STATUS: BroadcastStatus = {
  id: 'broadcast-1',
  djId: 'dj-midnight-spin',
  djName: 'Midnight Spin',
  isLive: false,
  currentShow: 'Midnight Therapy',
  currentTrack: TRACKS.midnightVelvet,
  listeners: 0,
  startedAt: '2025-05-28T22:00:00Z',
  duration: 0,
};

export const FAN_PROFILE: FanProfile = {
  id: 'fan-jordan',
  userId: CURRENT_USER.id,
  displayName: CURRENT_USER.name,
  avatar: CURRENT_USER.avatar,
  badges: ['Top Fan', 'First Listener', 'Request Maker'],
  favoriteStations: ['station-trey-trizzy', 'station-late-night-rb', 'station-jaye'],
  requestCount: 47,
  votesCast: 132,
  listeningStreak: 18,
  supportTier: 'supporter',
};

export const ACTIVE_USER: RoleAwareUser = {
  ...CURRENT_USER,
  role: CURRENT_USER_ROLE,
  modeLabel: ROLE_MODES[CURRENT_USER_ROLE].label,
  activeProfileId: FAN_PROFILE.id,
  fanProfile: FAN_PROFILE,
};

export const ARTIST_MATCH_SUGGESTIONS = [
  { id: 'match-1', artistId: 'artist-mila', artist: 'Mila Rain', avatar: IMG.milaRain, match: 92, reason: 'Needs warm lo-fi drums for an upcoming acoustic-pop drop.' },
  { id: 'match-2', artistId: 'artist-kiana', artist: 'Kiana Lane', avatar: IMG.kianaLane, match: 87, reason: 'Building a soul collection with late-night keys and low tempo pockets.' },
  { id: 'match-3', artistId: 'artist-jaye', artist: 'JAYE.', avatar: IMG.noahKade, match: 84, reason: 'Looking for chill hip-hop loops for a fan playlist premiere.' },
];

export const DJ_OPPORTUNITIES = [
  { id: 'opp-1', dj: 'Midnight Spin', show: 'Midnight Therapy', station: 'Trey Trizzy Radio', need: 'Lo-fi beat spotlight', audience: 18400 },
  { id: 'opp-2', dj: 'Rhythm Flow', show: 'House Signal', station: 'Neon Heartbreak Radio', need: '128 BPM transition bed', audience: 12100 },
];

export const BROADCAST_BLOCKS = [
  { id: 'block-1', title: 'Opening Warmup', type: 'music-block', duration: 18, status: 'ready' },
  { id: 'block-2', title: 'Fan Request Hour', type: 'fan-request', duration: 22, status: 'queued' },
  { id: 'block-3', title: 'Producer Spotlight', type: 'producer-spotlight', duration: 12, status: 'needs review' },
  { id: 'block-4', title: 'Ad Break A', type: 'commercial', duration: 3, status: 'placeholder' },
];

export const AD_SLOTS: AdSlot[] = [
  { id: 'ad-1', showId: 'show-1', title: 'Mid-roll sponsor break', duration: 90, sponsor: 'Trey TV Marketplace', placement: 'mid-roll', status: 'placeholder' },
  { id: 'ad-2', showId: 'show-1', title: 'Replay pre-roll', duration: 30, placement: 'pre-roll', status: 'reserved' },
];

export const HOST_NOTES: HostNote[] = [
  { id: 'note-1', showId: 'show-1', segmentId: 'seg-1', title: 'Opening tone', note: 'Welcome listeners like they just stepped into a private after-hours session.', tone: 'warm, cinematic' },
  { id: 'note-2', showId: 'show-1', segmentId: 'seg-3', title: 'Producer setup', note: 'Explain why the drum texture matters before the beat preview starts.', tone: 'curious, respectful' },
];

export const REPLAY_ITEMS: ReplayItem[] = [
  { id: 'replay-1', showId: 'show-1', title: 'Midnight Therapy Replay', host: 'Midnight Spin', artwork: IMG.midnightVelvet, duration: 7200, playedAt: 'Yesterday, 11 PM', plays: 18400, saves: 2300 },
  { id: 'replay-2', showId: 'show-2', title: 'Kiana Lane Premiere Room', host: 'Kiana Lane', artwork: IMG.kianaLane, duration: 3600, playedAt: 'May 27, 9 PM', plays: 12600, saves: 1800 },
];

export const TOP_FAN_LEADERBOARD = [
  { id: 'fan-1', name: 'Jordan', avatar: IMG.jordan, badge: 'Top Fan', points: 18420, streak: 18 },
  { id: 'fan-2', name: 'Casey', avatar: IMG.flowers, badge: 'Request Captain', points: 15110, streak: 12 },
  { id: 'fan-3', name: 'Liv', avatar: IMG.milaRain, badge: 'Premiere Supporter', points: 13240, streak: 9 },
];

export const FAN_VOTES: FanVote[] = [
  { id: 'vote-1', listenerId: 'user-jordan', stationId: 'station-trey-trizzy', voteType: 'track', votedFor: 'Falling For You', timestamp: '2 minutes ago' },
  { id: 'vote-2', listenerId: 'user-fan2', stationId: 'station-trey-trizzy', voteType: 'segment', votedFor: 'Producer Spotlight', timestamp: '4 minutes ago' },
];
