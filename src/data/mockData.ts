// Centralized mock data for the Tradio mobile shell.
// Replace with real data sources later. No backend logic here.

export const IMAGES = {
  treyHero: 'https://d64gsuwffb70l.cloudfront.net/6a2dc9d344393226c14988a8_1781386155114_dcc0441a.png',
  neonCity1: 'https://d64gsuwffb70l.cloudfront.net/6a2dc5b5ed1f99f26cee7943_1781384757469_41d1b4e5.jpg',
  neonCity2: 'https://d64gsuwffb70l.cloudfront.net/6a2dc5b5ed1f99f26cee7943_1781384764145_541ae566.png',
  neonCity3: 'https://d64gsuwffb70l.cloudfront.net/6a2dc5b5ed1f99f26cee7943_1781384760533_d6358c37.jpg',
  neonCity4: 'https://d64gsuwffb70l.cloudfront.net/6a2dc5b5ed1f99f26cee7943_1781384761345_cf4721a4.jpg',
  artist1: 'https://d64gsuwffb70l.cloudfront.net/6a2dc5b5ed1f99f26cee7943_1781384778774_addd7d75.jpg',
  artist2: 'https://d64gsuwffb70l.cloudfront.net/6a2dc5b5ed1f99f26cee7943_1781384782418_d8d85510.jpg',
  artist3: 'https://d64gsuwffb70l.cloudfront.net/6a2dc5b5ed1f99f26cee7943_1781384780222_ce710d13.jpg',
  artist4: 'https://d64gsuwffb70l.cloudfront.net/6a2dc5b5ed1f99f26cee7943_1781384783724_15d9c52d.jpg',
  indieFolk: 'https://d64gsuwffb70l.cloudfront.net/6a2dc5b5ed1f99f26cee7943_1781384805088_0f9e9299.jpg',
  lateNight: 'https://d64gsuwffb70l.cloudfront.net/6a2dc5b5ed1f99f26cee7943_1781384820143_01755bef.jpg',
  avatar: 'https://d64gsuwffb70l.cloudfront.net/6a2dc5b5ed1f99f26cee7943_1781384835247_1644ac83.jpg',
};

export const ARTIST = 'Trey Trizzy';

export const NOW_PLAYING = {
  title: 'Back To Night',
  artist: ARTIST,
  artwork: IMAGES.treyHero,
  progress: 0.38,
  elapsed: '0:58',
  remaining: '-1:35',
};

export const FEATURED_PLAYLISTS = [
  { id: 'p1', title: 'Midnight Drive', subtitle: 'Playlist', image: IMAGES.artist2 },
  { id: 'p2', title: 'After Hours', subtitle: 'Playlist', image: IMAGES.neonCity1 },
  { id: 'p3', title: 'Back To Night', subtitle: 'Playlist', image: IMAGES.treyHero, featured: true },
  { id: 'p4', title: 'The Come Up', subtitle: 'Playlist', image: IMAGES.artist3 },
  { id: 'p5', title: 'Late Night Vibes', subtitle: 'Playlist', image: IMAGES.lateNight },
];

export const LIVE_RADIO = [
  { id: 'r1', title: 'Trizzy Radio', subtitle: 'Live Station', tone: 'from-amber-500/40 to-yellow-600/30' },
  { id: 'r2', title: 'Prescribe Me Radio', subtitle: 'Live Station', tone: 'from-yellow-500/40 to-amber-700/30' },
  { id: 'r3', title: 'After Hours', subtitle: 'Live Station', tone: 'from-slate-500/40 to-slate-800/30' },
  { id: 'r4', title: 'Gold Standard', subtitle: 'Live Station', tone: 'from-amber-400/40 to-orange-700/30' },
];

export const PLAYLIST_DETAIL = {
  title: 'MIDNIGHT DRIVE',
  artist: ARTIST,
  artwork: IMAGES.neonCity2,
  description: 'Late nights. City lights. The soundtrack to the come up.',
  meta: '13 Tracks • 47 Min',
  tracks: [
    { id: 't1', n: 1, title: 'Midnight Drive', artist: ARTIST, time: '3:34', artwork: IMAGES.neonCity2, src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: 't2', n: 2, title: 'No Looking Back', artist: ARTIST, time: '4:06', artwork: IMAGES.artist3, src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { id: 't3', n: 3, title: 'Pressure Points', artist: ARTIST, time: '4:30', artwork: IMAGES.neonCity4, src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { id: 't4', n: 4, title: 'Back To Night', artist: ARTIST, time: '2:33', artwork: IMAGES.treyHero, src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    { id: 't5', n: 5, title: 'City Lights', artist: ARTIST, time: '3:23', artwork: IMAGES.neonCity1, src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
    { id: 't6', n: 6, title: 'Ocean Views', artist: ARTIST, time: '4:29', artwork: IMAGES.artist4, src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
    { id: 't7', n: 7, title: 'After Hours', artist: ARTIST, time: '3:21', artwork: IMAGES.lateNight, src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
    { id: 't8', n: 8, title: 'Soul Therapy', artist: ARTIST, time: '4:23', artwork: IMAGES.neonCity3, src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
    { id: 't9', n: 9, title: 'The Come Up', artist: ARTIST, time: '3:24', artwork: IMAGES.artist2, src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3' },
    { id: 't10', n: 10, title: 'JUNE NINETEENTH', artist: ARTIST, time: '4:33', artwork: IMAGES.neonCity1, src: '/assets/games/traptap/audio/june-nineteenth.m4a' },
  ],
};

export const RECENT_SEARCHES = [
  { id: 's1', label: 'Trizzy Radio', image: IMAGES.artist1 },
  { id: 's2', label: 'Midnight Drive', image: IMAGES.neonCity2 },
  { id: 's3', label: 'After Hours', image: IMAGES.artist3 },
  { id: 's4', label: 'The Come Up', image: IMAGES.neonCity1 },
];

export const SAVED_ITEMS = [
  { id: 'sv1', title: 'Midnight Drive', subtitle: 'Trey Trizzy', image: IMAGES.neonCity2 },
  { id: 'sv2', title: 'After Hours', subtitle: 'Playlist', image: IMAGES.artist4 },
  { id: 'sv3', title: 'Soul Therapy', subtitle: 'Playlist', image: IMAGES.indieFolk },
  { id: 'sv4', title: 'Gold Standard', subtitle: 'Playlist', image: IMAGES.artist2 },
];

export const LIBRARY_ROWS = ['Playlists', 'Albums', 'Artists', 'Songs', 'Radios'];

export const TOP_TRACKS = [
  { id: 'tt4', title: 'JUNE NINETEENTH', artist: ARTIST, time: '4:33', image: IMAGES.neonCity1, src: '/assets/games/traptap/audio/june-nineteenth.m4a' },
  { id: 'tt1', title: 'Back To Night', artist: ARTIST, time: '3:45', image: IMAGES.treyHero, src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  { id: 'tt2', title: 'No Looking Back', artist: ARTIST, time: '3:16', image: IMAGES.neonCity2, src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 'tt3', title: 'Pressure Points', artist: ARTIST, time: '2:58', image: IMAGES.neonCity4, src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];


export const RELEASES = [
  { id: 're5', title: 'JUNE NINETEENTH', meta: 'Single • 2026', image: IMAGES.neonCity1 },
  { id: 're1', title: 'Back To Night', meta: 'EP • 2024', image: IMAGES.treyHero },
  { id: 're2', title: 'No Looking Back', meta: 'EP • 2024', image: IMAGES.artist3 },
  { id: 're3', title: 'Pressure Points', meta: 'EP • 2023', image: IMAGES.artist1 },
  { id: 're4', title: 'Gold Standard', meta: 'Single • 2024', image: IMAGES.neonCity1 },
];

export const RELATED_ARTISTS = [
  { id: 'ra1', name: 'City Lights', image: IMAGES.artist1 },
  { id: 'ra2', name: 'After Hours', image: IMAGES.artist2 },
  { id: 'ra3', name: 'Soul Therapy', image: IMAGES.artist3 },
  { id: 'ra4', name: 'Ocean Views', image: IMAGES.artist4 },
];

export const LIVE_FEATURED = {
  label: 'Tradio Original',
  title: 'Trance Energy',
  listeners: '1.2K Listeners',
};

export const LIVE_LIST = [
  { id: 'll1', title: 'Late Night Vibes', subtitle: 'Playlists', tone: 'from-amber-500 to-yellow-700' },
  { id: 'll2', title: 'R&B Nights', subtitle: 'Playlists', tone: 'from-slate-500 to-slate-800' },
  { id: 'll3', title: 'Community Grooves', subtitle: 'Playlists', tone: 'from-amber-400 to-orange-600' },
];

export const ALL_LIVE_STATIONS = [
  { id: 'als1', name: 'Trey Trizzy Official', sub: 'Artist Radio', image: IMAGES.treyHero },
  { id: 'als2', name: 'Trizzy Radio', sub: 'Artist Radio', image: IMAGES.artist2 },
  { id: 'als3', name: 'Trap Gallery', sub: 'Hip Hop Radio', image: IMAGES.artist3 },
  { id: 'als4', name: 'Vibes Only', sub: 'Tradio Original', image: IMAGES.artist1 },
];

export const CURATED_STREAMS = [
  { id: 'cs1', name: 'Trance Energy', sub: 'Tradio Radio', image: IMAGES.artist1 },
  { id: 'cs2', name: 'Trap Gallery', sub: 'Hip Hop Radio', image: IMAGES.artist4 },
  { id: 'cs3', name: 'R&B Nights', sub: 'R&B Radio', image: IMAGES.artist3 },
  { id: 'cs4', name: 'Prescribe Me Radio', sub: 'Tradio Radio', image: IMAGES.artist2 },
];

export const GENRES = [
  { id: 'g1', title: 'Trap Gallery', subtitle: 'Playlists', image: IMAGES.neonCity1 },
  { id: 'g2', title: 'R&B Nights', subtitle: 'Playlists', image: IMAGES.indieFolk },
  { id: 'g3', title: 'Live Radio', subtitle: 'Playlists', image: IMAGES.artist3 },
  { id: 'g4', title: 'Trance Energy', subtitle: 'Playlists', image: IMAGES.artist1 },
];

export const MOODS: Mood[] = [

  { id: 'm1', title: 'Chill', subtitle: 'Moods', tone: 'from-slate-500 to-slate-800', icon: 'cloud' },
  { id: 'm2', title: 'Energetic', subtitle: 'Playlists', image: IMAGES.artist1 },
  { id: 'm3', title: 'Focused', subtitle: 'Moods', image: IMAGES.artist2 },
  { id: 'm4', title: 'Gold Standard', subtitle: 'Playlists', image: IMAGES.artist4 },
  { id: 'm5', title: 'Feel Good', subtitle: 'Moods', tone: 'from-amber-500 to-yellow-700', icon: 'disc' },
  { id: 'm6', title: 'Late Night Vibes', subtitle: 'Playlists', image: IMAGES.lateNight },
];

export const DECADES = [
  { id: 'd1', big: '80s', title: '80s Hits', tone: 'from-amber-500 to-orange-600' },
  { id: 'd2', big: '90s', title: '90s Hits', tone: 'from-slate-600 to-slate-900' },
  { id: 'd3', big: '00s', title: '00s Hits', tone: 'from-yellow-500 to-amber-700' },
  { id: 'd4', big: '10s', title: '10s Hits', tone: 'from-amber-400 to-yellow-600' },
  { id: 'd5', big: '20s', title: '20s Hits', tone: 'from-slate-500 to-slate-800' },
];


// ---- Playable queues (Track[] shape: id, title, artist, artwork, src) ----
export const PLAYLIST_QUEUE = PLAYLIST_DETAIL.tracks.map((t) => ({
  id: t.id,
  title: t.title,
  artist: t.artist,
  artwork: t.artwork,
  src: t.src,
}));

export const TOP_TRACK_QUEUE = TOP_TRACKS.map((t) => ({
  id: t.id,
  title: t.title,
  artist: t.artist,
  artwork: t.image,
  src: t.src,
}));

// "Back To Night" spotlight track, used by the hero CTA & default now-playing
export const SPOTLIGHT_TRACK = {
  id: 'spotlight-back-to-night',
  title: 'Back To Night',
  artist: ARTIST,
  artwork: IMAGES.treyHero,
  src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
};

// Spotlight queue starts with Back To Night then continues into the playlist
export const SPOTLIGHT_QUEUE = [SPOTLIGHT_TRACK, ...PLAYLIST_QUEUE];

// ---- Unified search index ----
export interface SearchTrack {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  src: string;
}
export interface SearchEntity {
  id: string;
  title: string;
  subtitle: string;
  image?: string;
  tone?: string;
}

// All searchable tracks (deduped by title), each playable.
export const SEARCH_TRACKS: SearchTrack[] = (() => {
  const seen = new Set<string>();
  const out: SearchTrack[] = [];
  const push = (t: SearchTrack) => {
    const key = t.title.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(t);
  };
  push(SPOTLIGHT_TRACK);
  PLAYLIST_DETAIL.tracks.forEach((t) =>
    push({ id: t.id, title: t.title, artist: t.artist, artwork: t.artwork, src: t.src }),
  );
  TOP_TRACKS.forEach((t) =>
    push({ id: t.id, title: t.title, artist: t.artist, artwork: t.image, src: t.src }),
  );
  return out;
})();

export const SEARCH_PLAYLISTS: SearchEntity[] = FEATURED_PLAYLISTS.map((p) => ({
  id: p.id,
  title: p.title,
  subtitle: p.subtitle,
  image: p.image,
}));

export const SEARCH_ARTISTS: SearchEntity[] = [
  { id: 'artist-trey', title: ARTIST, subtitle: 'Artist', image: IMAGES.treyHero },
  ...RELATED_ARTISTS.map((a) => ({ id: a.id, title: a.name, subtitle: 'Artist', image: a.image })),
];

export const SEARCH_RADIOS: SearchEntity[] = [
  ...LIVE_RADIO.map((r) => ({ id: r.id, title: r.title, subtitle: r.subtitle, tone: r.tone })),
  ...LIVE_LIST.map((r) => ({ id: r.id, title: r.title, subtitle: 'Live Station', tone: r.tone })),
  ...ALL_LIVE_STATIONS.map((r) => ({ id: r.id, title: r.name, subtitle: r.sub, image: r.image })),
];

export interface SearchResults {
  tracks: SearchTrack[];
  playlists: SearchEntity[];
  artists: SearchEntity[];
  radios: SearchEntity[];
  total: number;
}

export function searchAll(query: string): SearchResults {
  const q = query.trim().toLowerCase();
  if (!q) return { tracks: [], playlists: [], artists: [], radios: [], total: 0 };
  const match = (s: string) => s.toLowerCase().includes(q);
  const tracks = SEARCH_TRACKS.filter((t) => match(t.title) || match(t.artist));
  const playlists = SEARCH_PLAYLISTS.filter((p) => match(p.title) || match(p.subtitle));
  const artists = SEARCH_ARTISTS.filter((a) => match(a.title));
  const radios = SEARCH_RADIOS.filter((r) => match(r.title) || match(r.subtitle));
  return {
    tracks,
    playlists,
    artists,
    radios,
    total: tracks.length + playlists.length + artists.length + radios.length,
  };
}

// ---- Browse / Mood typing ----
export interface Mood {
  id: string;
  title: string;
  subtitle: string;
  tone?: string;
  image?: string;
  icon?: 'cloud' | 'disc';
}

// ---- Community (social music behavior) ----
export interface CommunityPost {
  id: string;
  user: string;
  avatar: string;
  action: string;
  target: string;
  meta: string;
  likes: number;
}

export const COMMUNITY_NOW_PLAYING = [
  { id: 'cn1', user: 'Jordan R.', avatar: IMAGES.artist1, track: 'Pressure Points', station: 'Trizzy Radio' },
  { id: 'cn2', user: 'Maya K.', avatar: IMAGES.artist2, track: 'Soul Therapy', station: 'R&B Nights' },
  { id: 'cn3', user: 'Devon S.', avatar: IMAGES.artist3, track: 'Midnight Drive', station: 'After Hours' },
  { id: 'cn4', user: 'Tasha M.', avatar: IMAGES.artist4, track: 'Gold Standard', station: 'Gold Standard' },
];

export const COMMUNITY_FEED: CommunityPost[] = [
  { id: 'cf1', user: 'Jordan R.', avatar: IMAGES.artist1, action: 'is in the live room', target: 'Trizzy Radio', meta: 'Tuned in now', likes: 128 },
  { id: 'cf2', user: 'Maya K.', avatar: IMAGES.artist2, action: 'added to', target: 'Soul Therapy', meta: '12 min ago', likes: 64 },
  { id: 'cf3', user: 'Devon S.', avatar: IMAGES.artist3, action: 'prescribed', target: 'Midnight Recovery', meta: '20 min ago', likes: 203 },
  { id: 'cf4', user: 'Tasha M.', avatar: IMAGES.artist4, action: 'shared', target: 'Gold Standard', meta: '1 hr ago', likes: 41 },
  { id: 'cf5', user: 'Andre L.', avatar: IMAGES.treyHero, action: 'is listening to', target: 'After Hours', meta: '2 hr ago', likes: 89 },
];

export const COMMUNITY_ROOMS = [
  { id: 'crm1', title: 'After Hours Lounge', subtitle: '342 in the room', tone: 'from-amber-500/40 to-yellow-700/30' },
  { id: 'crm2', title: 'Trap Gallery Live', subtitle: '218 in the room', tone: 'from-slate-600/40 to-slate-900/30' },
  { id: 'crm3', title: 'Soul Therapy Circle', subtitle: '156 in the room', tone: 'from-amber-400/40 to-orange-700/30' },
  { id: 'crm4', title: 'Prescribe Me Sessions', subtitle: '410 in the room', tone: 'from-yellow-500/40 to-amber-800/30' },
];

// ---- Prescribe Me (music personalization) ----
export interface PrescribeOption {
  value: string;
  label: string;
}
export interface PrescribeQuestion {
  id: 'feeling' | 'need' | 'energy' | 'sound' | 'place';
  prompt: string;
  options: PrescribeOption[];
}

const opt = (labels: string[]): PrescribeOption[] =>
  labels.map((l) => ({ value: l.toLowerCase().replace(/[^a-z]/g, ''), label: l }));

export const PRESCRIBE_QUESTIONS: PrescribeQuestion[] = [
  { id: 'feeling', prompt: 'What are you feeling right now?', options: opt(['Calm', 'Heavy', 'Focused', 'Romantic', 'Turnt', 'Inspired', 'Lonely', 'Confident']) },
  { id: 'need', prompt: 'What do you need from the music?', options: opt(['Heal me', 'Hype me', 'Focus me', 'Slow me down', 'Put me in my bag', 'Help me escape']) },
  { id: 'energy', prompt: 'What energy level?', options: opt(['Low', 'Medium', 'High']) },
  { id: 'sound', prompt: 'What sound do you want?', options: opt(['R&B', 'Hip Hop', 'Afrobeats', 'Trap Soul', 'Gospel Soul', 'Pop', 'Chill', 'Surprise Me']) },
  { id: 'place', prompt: 'Where are you listening?', options: opt(['Driving', 'Bedroom', 'Studio', 'Workout', 'Party', 'Alone', 'With friends']) },
];

export interface Prescription {
  name: string;
  tagline: string;
  station: string;
  playlist: string;
  liveRoom: string;
  tone: string;
  vibe: string; // human label used to match a Prescribe Me Battle
}

export type PrescribeAnswers = Partial<Record<PrescribeQuestion['id'], string>>;

// Look up the human-readable label for a stored answer value.
export function answerLabel(qid: PrescribeQuestion['id'], value?: string): string {
  if (!value) return '';
  const q = PRESCRIBE_QUESTIONS.find((x) => x.id === qid);
  return q?.options.find((o) => o.value === value)?.label ?? '';
}


// Map a set of answers to a coherent Trey TV music prescription.
export function buildPrescription(answers: PrescribeAnswers): Prescription {
  const feeling = answers.feeling ?? '';
  const need = answers.need ?? '';

  if (need === 'healme' || feeling === 'lonely' || feeling === 'heavy') {
    return {
      name: 'Midnight Recovery',
      tagline: 'Soft sounds to put you back together after hours.',
      station: 'After Hours',
      playlist: 'Soul Therapy',
      liveRoom: 'Soul Therapy Circle',
      tone: 'from-slate-700 via-amber-900/40 to-black',
      vibe: 'Heal me',
    };
  }
  if (need === 'hypeme' || feeling === 'turnt' || feeling === 'confident') {
    return {
      name: 'Gold Confidence',
      tagline: 'Pressure released. Walk in like you own the room.',
      station: 'Trizzy Radio',
      playlist: 'The Come Up',
      liveRoom: 'Trap Gallery Live',
      tone: 'from-amber-600 via-yellow-700/50 to-black',
      vibe: 'Confident',
    };
  }
  if (need === 'focusme' || feeling === 'focused') {
    return {
      name: 'Trizzy Focus',
      tagline: 'Locked in. Studio energy with zero distractions.',
      station: 'Prescribe Me Radio',
      playlist: 'Pressure Points',
      liveRoom: 'Prescribe Me Sessions',
      tone: 'from-slate-800 via-amber-800/30 to-black',
      vibe: 'Focus me',
    };
  }
  if (need === 'slowmedown' || feeling === 'romantic' || feeling === 'calm') {
    return {
      name: 'After Hours Therapy',
      tagline: 'Slow it all the way down. Late-night and easy.',
      station: 'R&B Nights',
      playlist: 'Late Night Vibes',
      liveRoom: 'After Hours Lounge',
      tone: 'from-amber-900/50 via-slate-800 to-black',
      vibe: 'Slow me down',
    };
  }
  return {
    name: 'Pressure Release',
    tagline: 'Your perfect escape, prescribed by Tradio.',
    station: 'Gold Standard',
    playlist: 'Midnight Drive',
    liveRoom: 'Prescribe Me Sessions',
    tone: 'from-amber-700 via-slate-800 to-black',
    vibe: 'Help me escape',
  };
}



// ---- Song Wars (admin-controlled music battle experience) ----
export type BattleType =
  | 'Artist vs Artist'
  | 'Song vs Song'
  | 'Producer vs Producer'
  | 'Beat Battle'
  | 'DJ Mix Battle'
  | 'Hook Battle'
  | 'Freestyle Battle'
  | 'Fan Favorite'
  | 'Prescribe Me Battle'
  | 'Trizzy Pick';

export type BattleStatus = 'active' | 'scheduled' | 'draft' | 'completed' | 'reported';

export interface Contestant {
  id: string;
  name: string;
  handle: string;
  role: 'Artist' | 'Producer' | 'DJ' | 'Creator';
  image: string;
  track: string;
  src: string;
  votes: number;
  wins: number;
  losses: number;
  approved: boolean;
}

// Approved Trey TV artists/creators allowed to enter Song Wars and run a profile.
export const APPROVED_HANDLES = new Set<string>([
  '@treytrizzy',
  '@novasaint',
  '@citylights',
  '@soultherapy',
  '@oceanviews',
  '@trapgallery',
  '@afterhours',
  '@gold',
  '@recovery',
  '@latenight',
]);

// Career win/loss records keyed by handle (local mock state).
const RECORDS: Record<string, { wins: number; losses: number }> = {
  '@treytrizzy': { wins: 14, losses: 2 },
  '@novasaint': { wins: 11, losses: 4 },
  '@citylights': { wins: 8, losses: 5 },
  '@soultherapy': { wins: 6, losses: 4 },
  '@oceanviews': { wins: 5, losses: 6 },
  '@trapgallery': { wins: 9, losses: 3 },
  '@afterhours': { wins: 7, losses: 4 },
  '@gold': { wins: 10, losses: 3 },
  '@recovery': { wins: 4, losses: 2 },
  '@latenight': { wins: 3, losses: 5 },
};

export interface SongWar {
  id: string;
  title: string;
  type: BattleType;
  status: BattleStatus;
  hype: string;        // e.g. "Round 2 of 3"
  schedule: string;    // human-readable schedule label
  vibe?: string;       // Prescribe Me match tag
  featured?: boolean;  // Trizzy Pick / hero
  reports?: number;    // moderation queue count
  left: Contestant;
  right: Contestant;
}

const C = (
  id: string,
  name: string,
  handle: string,
  role: Contestant['role'],
  image: string,
  track: string,
  src: string,
  votes: number,
): Contestant => ({
  id,
  name,
  handle,
  role,
  image,
  track,
  src,
  votes,
  wins: RECORDS[handle]?.wins ?? 0,
  losses: RECORDS[handle]?.losses ?? 0,
  approved: APPROVED_HANDLES.has(handle),
});


export const SONG_WARS: SongWar[] = [
  {
    id: 'sw0',
    title: 'Live Battle Arena: Trizzy vs Nova',
    type: 'Artist vs Artist',
    status: 'active',
    hype: 'Live Arena • Best of 3',
    schedule: 'Live now • Trey TV Main Stage',
    featured: true,
    left: C('sw0a', 'Trey Trizzy', '@treytrizzy', 'Artist', IMAGES.treyHero, 'Back To Night', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 0),
    right: C('sw0b', 'Nova Saint', '@novasaint', 'Artist', IMAGES.artist2, 'Neon Halo', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', 0),
  },
  {
    id: 'sw1',
    title: 'After Hours Showdown',
    type: 'Artist vs Artist',
    status: 'active',
    hype: 'Round 2 of 3',
    schedule: 'Live now • ends in 02:14:00',
    vibe: 'Confident',
    featured: true,
    left: C('sw1a', 'Trey Trizzy', '@treytrizzy', 'Artist', IMAGES.treyHero, 'Back To Night', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 6420),
    right: C('sw1b', 'City Lights', '@citylights', 'Artist', IMAGES.artist1, 'No Looking Back', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 5980),
  },
  {
    id: 'sw2',
    title: 'Beat Battle: Pressure',
    type: 'Beat Battle',
    status: 'active',
    hype: 'Round 1 of 1',
    schedule: 'Live now • ends in 05:40:00',
    left: C('sw2a', 'Soul Therapy', '@soultherapy', 'Producer', IMAGES.artist3, 'Pressure Points', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 2310),
    right: C('sw2b', 'Ocean Views', '@oceanviews', 'Producer', IMAGES.artist4, 'Gold Standard', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 2890),
  },
  {
    id: 'sw3',
    title: 'DJ Mix Clash',
    type: 'DJ Mix Battle',
    status: 'scheduled',
    hype: 'Best of 3',
    schedule: 'Starts Sat 9:00 PM',
    left: C('sw3a', 'Trap Gallery', '@trapgallery', 'DJ', IMAGES.artist2, 'Trap Set', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', 0),
    right: C('sw3b', 'After Hours', '@afterhours', 'DJ', IMAGES.lateNight, 'Late Mix', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 0),
  },
  {
    id: 'sw4',
    title: 'Prescribe Me Battle: Recovery',
    type: 'Prescribe Me Battle',
    status: 'scheduled',
    hype: 'Mood-matched',
    schedule: 'Starts Sun 8:00 PM',
    vibe: 'Heal me',
    left: C('sw4a', 'Midnight Recovery', '@recovery', 'Artist', IMAGES.neonCity2, 'Soul Therapy', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', 0),
    right: C('sw4b', 'Late Night Vibes', '@latenight', 'Artist', IMAGES.indieFolk, 'After Hours', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', 0),
  },
  {
    id: 'sw5',
    title: 'Hook Battle Draft',
    type: 'Hook Battle',
    status: 'draft',
    hype: 'Unpublished',
    schedule: 'Draft • not scheduled',
    left: C('sw5a', 'Devon S.', '@devon', 'Creator', IMAGES.artist3, 'Hook A', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 0),
    right: C('sw5b', 'Maya K.', '@maya', 'Creator', IMAGES.artist2, 'Hook B', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 0),
  },
  {
    id: 'sw6',
    title: 'Freestyle Finals',
    type: 'Freestyle Battle',
    status: 'completed',
    hype: 'Final • Trizzy Pick',
    schedule: 'Ended • Trey Trizzy won',
    featured: false,
    left: C('sw6a', 'Trey Trizzy', '@treytrizzy', 'Artist', IMAGES.treyHero, 'Freestyle 1', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 12040),
    right: C('sw6b', 'Jordan R.', '@jordan', 'Artist', IMAGES.artist1, 'Freestyle 2', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 8120),
  },
  {
    id: 'sw7',
    title: 'Fan Favorite: Gold Standard',
    type: 'Fan Favorite',
    status: 'reported',
    hype: 'Under review',
    schedule: 'Active • 3 reports',
    reports: 3,
    left: C('sw7a', 'Gold Standard', '@gold', 'Artist', IMAGES.artist4, 'Gold Standard', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 4410),
    right: C('sw7b', 'Soul Therapy', '@soultherapy', 'Artist', IMAGES.artist3, 'Soul Therapy', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 4380),
  },
  {
    id: 'sw8',
    title: 'Prescribe Me Battle: Gold Confidence',
    type: 'Prescribe Me Battle',
    status: 'active',
    hype: 'Mood-matched • Live',
    schedule: 'Live now • ends in 03:30:00',
    vibe: 'Confident',
    left: C('sw8a', 'Trey Trizzy', '@treytrizzy', 'Artist', IMAGES.treyHero, 'The Come Up', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 3120),
    right: C('sw8b', 'Gold Standard', '@gold', 'Artist', IMAGES.artist4, 'Gold Standard', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 2980),
  },
];


export const BATTLE_TYPES: BattleType[] = [
  'Artist vs Artist',
  'Song vs Song',
  'Producer vs Producer',
  'Beat Battle',
  'DJ Mix Battle',
  'Hook Battle',
  'Freestyle Battle',
  'Fan Favorite',
  'Prescribe Me Battle',
  'Trizzy Pick',
];

// Selectable vibe tags used to match Prescribe Me Battles to a prescription.
export const VIBE_TAGS: string[] = [
  'Heal me',
  'Hype me',
  'Focus me',
  'Slow me down',
  'Put me in my bag',
  'Help me escape',
  'Confident',
  'Calm',
];

// Pool of contestants admins can pick from when creating a battle.
export interface ContestantSeed {
  id: string;
  name: string;
  handle: string;
  role: Contestant['role'];
  image: string;
  track: string;
  src: string;
}

export const CONTESTANT_POOL: ContestantSeed[] = [
  { id: 'cp1', name: 'Trey Trizzy', handle: '@treytrizzy', role: 'Artist', image: IMAGES.treyHero, track: 'Back To Night', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  { id: 'cp2', name: 'City Lights', handle: '@citylights', role: 'Artist', image: IMAGES.artist1, track: 'No Looking Back', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 'cp3', name: 'After Hours', handle: '@afterhours', role: 'DJ', image: IMAGES.lateNight, track: 'Late Mix', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
  { id: 'cp4', name: 'Soul Therapy', handle: '@soultherapy', role: 'Producer', image: IMAGES.artist3, track: 'Pressure Points', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { id: 'cp5', name: 'Ocean Views', handle: '@oceanviews', role: 'Producer', image: IMAGES.artist4, track: 'Gold Standard', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
  { id: 'cp6', name: 'Trap Gallery', handle: '@trapgallery', role: 'DJ', image: IMAGES.artist2, track: 'Trap Set', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
  { id: 'cp7', name: 'Midnight Recovery', handle: '@recovery', role: 'Artist', image: IMAGES.neonCity2, track: 'Soul Therapy', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
  { id: 'cp8', name: 'Gold Standard', handle: '@gold', role: 'Artist', image: IMAGES.artist4, track: 'Gold Standard', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
  { id: 'cp9', name: 'Nova Saint', handle: '@novasaint', role: 'Artist', image: IMAGES.artist2, track: 'Neon Halo', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3' },
];

// ---- Live Battle Arena state machine ----
export type BattleSide = 'left' | 'right';

export type LiveStatus =
  | 'waiting_for_checkins'
  | 'ready_to_start'
  | 'live_starting'
  | 'artist_a_performing'
  | 'artist_b_performing'
  | 'voting_open'
  | 'voting_closed'
  | 'winner_reveal'
  | 'round_break'
  | 'paused'
  | 'completed';

export interface RoundResult {
  round: number;
  winner: BattleSide | 'tie';
  leftVotes: number;
  rightVotes: number;
  leftPct: number;
  rightPct: number;
}

export interface ArenaReaction {
  id: string;
  key: string;
  label: string;
  at: number;
}

export interface ArenaState {
  status: LiveStatus;
  checkLeft: boolean;
  checkRight: boolean;
  countdown: number;
  countdownSel: number;
  roundNumber: number;
  totalRounds: number;
  currentPerformer: BattleSide;
  artistAPerformed: boolean;
  artistBPerformed: boolean;
  votingOpen: boolean;
  voteSeconds: number;
  roundVotes: Record<BattleSide, number>;
  userVoteByRound: Record<number, BattleSide | undefined>;
  roundResults: RoundResult[];
  winner?: BattleSide | 'tie';
  viewers: number;
  peakViewers: number;
  announcement?: string;
  mutedArtistA: boolean;
  mutedArtistB: boolean;
  technicalIssue: boolean;
  isPaused: boolean;
  reactions: ArenaReaction[];
}

export const DEFAULT_ARENA: ArenaState = {
  // Intentional demo state: Trey Trizzy is checked in, Nova Saint is still pending.
  checkLeft: true,
  checkRight: false,
  status: 'waiting_for_checkins',
  countdown: 10,
  countdownSel: 10,
  roundNumber: 1,
  totalRounds: 3,
  currentPerformer: 'left',
  artistAPerformed: false,
  artistBPerformed: false,
  votingOpen: false,
  voteSeconds: 20,
  roundVotes: { left: 642, right: 611 },
  userVoteByRound: {},
  roundResults: [],
  winner: undefined,
  viewers: 2412,
  peakViewers: 2412,
  announcement: undefined,
  mutedArtistA: false,
  mutedArtistB: false,
  technicalIssue: false,
  isPaused: false,
  reactions: [],
};

// ---- Battle result recap (generated when an admin closes a battle) ----
export interface BattleResult {
  warId: string;
  title: string;
  winnerName: string;
  winnerImage: string;
  loserName: string;
  leftName: string;
  rightName: string;
  leftPct: number;
  rightPct: number;
  totalVotes: number;
  topComment?: { user: string; text: string; avatar: string };
}

export function recapShareText(r: BattleResult): string {
  return `SONG WARS RESULTS on Tradio — "${r.title}"\nWinner: ${r.winnerName}\nFinal split: ${r.leftName} ${r.leftPct}% vs ${r.rightName} ${r.rightPct}%\n${r.totalVotes.toLocaleString()} votes cast on the Trey TV Music Arena.`;
}

// ---- Song Wars comments & reactions ----
export type ReactionKey = 'fire' | 'gold' | 'wave';

export interface BattleComment {
  id: string;
  warId: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  reactions: Record<ReactionKey, number>;
  myReaction?: ReactionKey;
  reported: boolean;
  hidden: boolean;
}

const seedReactions = (fire: number, gold: number, wave: number): Record<ReactionKey, number> => ({
  fire,
  gold,
  wave,
});

export const SEED_COMMENTS: BattleComment[] = [
  { id: 'cm1', warId: 'sw1', user: 'Jordan R.', avatar: IMAGES.artist1, text: 'Trizzy got this one locked. Back To Night is unmatched.', time: '2m', reactions: seedReactions(42, 18, 9), reported: false, hidden: false },
  { id: 'cm2', warId: 'sw1', user: 'Maya K.', avatar: IMAGES.artist2, text: 'City Lights snuck up though, that hook is crazy.', time: '5m', reactions: seedReactions(21, 7, 14), reported: false, hidden: false },
  { id: 'cm3', warId: 'sw1', user: 'spamacct', avatar: IMAGES.artist3, text: 'Buy followers cheap >>> link in bio', time: '1m', reactions: seedReactions(0, 0, 0), reported: true, hidden: false },
  { id: 'cm4', warId: 'sw2', user: 'Devon S.', avatar: IMAGES.artist3, text: 'Ocean Views production is buttery. Hard pick.', time: '8m', reactions: seedReactions(30, 12, 6), reported: false, hidden: false },
  { id: 'cm5', warId: 'sw7', user: 'troll99', avatar: IMAGES.artist4, text: 'This battle is rigged, mods do something', time: '3m', reactions: seedReactions(2, 0, 1), reported: true, hidden: false },
];

// ---- Share references (in-app shareable text) ----
export function battleShareText(war: SongWar): string {
  return `SONG WARS on Tradio — "${war.title}" (${war.type})\n${war.left.name} vs ${war.right.name}\n${war.schedule}\nVote now in the Trey TV Music Arena.`;
}

export function prescriptionShareText(p: Prescription): string {
  return `Tradio prescribed me "${p.name}" — ${p.tagline}\nVibe: ${p.vibe} • Station: ${p.station} • Playlist: ${p.playlist}\nGet your music prescription on Tradio.`;
}

// Deterministic faux "monthly listeners" stat for an artist profile (Apple-Music style).
export function monthlyListeners(handle: string): string {
  let h = 0;
  for (let i = 0; i < handle.length; i++) h = (h * 31 + handle.charCodeAt(i)) % 9000;
  const n = 120000 + h * 137;
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : `${Math.round(n / 1000)}K`;
}
