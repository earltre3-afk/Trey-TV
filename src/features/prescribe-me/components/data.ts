// Content library + recommendation scoring

export type Mood =
  | 'Happy' | 'Chill' | 'Romantic' | 'Motivated' | 'Reflective' | 'Wild'
  | 'Healing' | 'Curious' | 'Focused' | 'Sad' | 'Inspired' | 'Bored';

export type Energy = 'Soft' | 'Balanced' | 'High Energy' | 'Surprise Me';

export type ContentType =
  | 'Music' | 'Comedy' | 'Drama' | 'Reality' | 'Interviews' | 'Motivation'
  | 'Romance' | 'Mystery' | 'Comfort Content' | 'Creator Channels'
  | 'Open Mic' | 'Music Reviews' | 'Short Videos' | 'Deep Binge' | 'New Creators';

export type MomentNeed =
  | 'Just me' | 'Watching with friends' | 'Need a quick watch' | 'Give me a deep binge'
  | 'Make me laugh' | 'I need something healing' | 'Put me on something new'
  | 'Help me lock in' | 'I want creator energy' | 'I want music energy';

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  category: ContentType;
  moods: Mood[];
  energy: Energy[];
  duration: 'short' | 'medium' | 'long';
  creator?: string;
  thumbnail: string;
  contentKind: 'video' | 'channel' | 'open-mic' | 'music-review' | 'episode' | 'short';
  trending?: boolean;
  isNewCreator?: boolean;
}

// Curated content library — no fake celebrity names, no licensed content claims.
// All titles are original Trey TV programming concepts.
export const CONTENT_LIBRARY: ContentItem[] = [
  {
    id: 'midnight-voltage',
    title: 'Midnight Voltage',
    description: 'High-energy cinematic beats that electrify the night.',
    category: 'Music',
    moods: ['Motivated', 'Wild', 'Inspired'],
    energy: ['High Energy'],
    duration: 'medium',
    thumbnail: 'https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730889867_bfd3e0b6.png',
    contentKind: 'video',
    trending: true,
  },
  {
    id: 'velvet-echoes',
    title: 'Velvet Echoes',
    description: 'Soft soundscapes for late-night reflection.',
    category: 'Music',
    moods: ['Reflective', 'Chill', 'Healing'],
    energy: ['Soft', 'Balanced'],
    duration: 'long',
    thumbnail: 'https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730889057_b6e69acc.png',
    contentKind: 'music-review',
  },
  {
    id: 'laugh-therapy',
    title: 'Laugh Therapy',
    description: 'Open mic comedy that lifts the room.',
    category: 'Comedy',
    moods: ['Happy', 'Chill', 'Bored'],
    energy: ['Balanced', 'High Energy'],
    duration: 'short',
    thumbnail: 'https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730887832_fbb02db5.png',
    contentKind: 'open-mic',
    trending: true,
  },
  {
    id: 'city-afterglow',
    title: 'City Afterglow',
    description: 'Cinematic nightscapes scored with synth motivation.',
    category: 'Motivation',
    moods: ['Motivated', 'Inspired', 'Focused'],
    energy: ['Balanced', 'High Energy'],
    duration: 'medium',
    thumbnail: 'https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730891471_29bf970b.png',
    contentKind: 'video',
  },
  {
    id: 'sunday-mind-reset',
    title: 'Sunday Mind Reset',
    description: 'A slow, healing channel built for the soft restart.',
    category: 'Comfort Content',
    moods: ['Healing', 'Reflective', 'Chill', 'Sad'],
    energy: ['Soft'],
    duration: 'long',
    thumbnail: 'https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730892607_30c92666.png',
    contentKind: 'channel',
    creator: 'Trey TV Wellness',
  },
  {
    id: 'creator-spotlight',
    title: 'Creator Spotlight Live',
    description: 'Meet the new voices breaking through this week.',
    category: 'Creator Channels',
    moods: ['Curious', 'Inspired'],
    energy: ['Balanced'],
    duration: 'medium',
    thumbnail: 'https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730894402_923b856a.png',
    contentKind: 'channel',
    isNewCreator: true,
  },
  {
    id: 'date-night-in',
    title: 'Date Night In',
    description: 'Romantic short films and slow-burn moments.',
    category: 'Romance',
    moods: ['Romantic', 'Chill'],
    energy: ['Soft', 'Balanced'],
    duration: 'medium',
    thumbnail: 'https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730896949_cc176f8f.png',
    contentKind: 'video',
  },
  {
    id: 'lock-in-session',
    title: 'Lock-In Session',
    description: 'Deep-focus instrumentals to fuel the grind.',
    category: 'Motivation',
    moods: ['Focused', 'Motivated'],
    energy: ['Balanced', 'High Energy'],
    duration: 'long',
    thumbnail: 'https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730900195_7a4a14de.png',
    contentKind: 'video',
  },
  {
    id: 'wild-frequency',
    title: 'Wild Frequency',
    description: 'Bold, untamed sounds and visual chaos.',
    category: 'Music',
    moods: ['Wild', 'Motivated'],
    energy: ['High Energy'],
    duration: 'short',
    thumbnail: 'https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730889867_bfd3e0b6.png',
    contentKind: 'short',
    trending: true,
  },
  {
    id: 'mystery-hour',
    title: 'Mystery Hour',
    description: 'A slow-unfolding case to keep you guessing.',
    category: 'Mystery',
    moods: ['Curious', 'Focused'],
    energy: ['Balanced'],
    duration: 'long',
    thumbnail: 'https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730887832_fbb02db5.png',
    contentKind: 'episode',
  },
  {
    id: 'open-mic-friday',
    title: 'Open Mic Friday',
    description: 'Live mic room with rising poets and singers.',
    category: 'Open Mic',
    moods: ['Reflective', 'Inspired', 'Curious'],
    energy: ['Balanced'],
    duration: 'long',
    thumbnail: 'https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730891471_29bf970b.png',
    contentKind: 'open-mic',
  },
  {
    id: 'review-room-r-and-b',
    title: 'Review Room: R&B',
    description: 'Track-by-track reactions with the music desk.',
    category: 'Music Reviews',
    moods: ['Chill', 'Romantic', 'Reflective'],
    energy: ['Soft', 'Balanced'],
    duration: 'medium',
    thumbnail: 'https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730889057_b6e69acc.png',
    contentKind: 'music-review',
  },
  {
    id: 'quick-laughs',
    title: 'Quick Laughs',
    description: 'Two-minute sketches when you only have a sec.',
    category: 'Short Videos',
    moods: ['Happy', 'Bored', 'Chill'],
    energy: ['Balanced', 'High Energy'],
    duration: 'short',
    thumbnail: 'https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730887832_fbb02db5.png',
    contentKind: 'short',
  },
  {
    id: 'drama-cut',
    title: 'The Drama Cut',
    description: 'An ongoing series with emotional depth.',
    category: 'Drama',
    moods: ['Reflective', 'Sad', 'Curious'],
    energy: ['Balanced'],
    duration: 'long',
    thumbnail: 'https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730892607_30c92666.png',
    contentKind: 'episode',
  },
  {
    id: 'real-talk',
    title: 'Real Talk Interviews',
    description: 'Long-form conversations with thinkers and creators.',
    category: 'Interviews',
    moods: ['Curious', 'Inspired', 'Reflective'],
    energy: ['Balanced'],
    duration: 'long',
    thumbnail: 'https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730894402_923b856a.png',
    contentKind: 'episode',
  },
  {
    id: 'reality-house',
    title: 'Reality House',
    description: 'Unscripted moments from the Trey TV house.',
    category: 'Reality',
    moods: ['Bored', 'Curious', 'Wild'],
    energy: ['Balanced', 'High Energy'],
    duration: 'long',
    thumbnail: 'https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730896949_cc176f8f.png',
    contentKind: 'episode',
    trending: true,
  },
  {
    id: 'healing-mode',
    title: 'Healing Mode',
    description: 'Guided sound baths and gentle visuals.',
    category: 'Comfort Content',
    moods: ['Healing', 'Sad', 'Reflective'],
    energy: ['Soft'],
    duration: 'long',
    thumbnail: 'https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730900195_7a4a14de.png',
    contentKind: 'channel',
  },
  {
    id: 'new-creators-now',
    title: 'New Creators Now',
    description: 'This week\u2019s emerging Trey TV voices.',
    category: 'New Creators',
    moods: ['Curious', 'Inspired'],
    energy: ['Balanced'],
    duration: 'medium',
    thumbnail: 'https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730894402_923b856a.png',
    contentKind: 'channel',
    isNewCreator: true,
  },
];

export interface PrescriptionAnswers {
  moods: Mood[];
  energy: Energy | null;
  contentTypes: ContentType[];
  momentNeeds: MomentNeed[];
}

export interface ScoredItem extends ContentItem {
  score: number;
  moodMatch: number;
  energyMatch: number;
  reason: string;
}

const MOMENT_CONTENT_HINT: Record<MomentNeed, ContentType[]> = {
  'Just me': ['Comfort Content', 'Music', 'Drama'],
  'Watching with friends': ['Comedy', 'Reality', 'Open Mic'],
  'Need a quick watch': ['Short Videos'],
  'Give me a deep binge': ['Deep Binge', 'Drama', 'Mystery'],
  'Make me laugh': ['Comedy', 'Short Videos'],
  'I need something healing': ['Comfort Content'],
  'Put me on something new': ['New Creators', 'Creator Channels'],
  'Help me lock in': ['Motivation', 'Music'],
  'I want creator energy': ['Creator Channels', 'New Creators'],
  'I want music energy': ['Music', 'Music Reviews'],
};

const MOMENT_DURATION_HINT: Record<MomentNeed, ('short' | 'medium' | 'long')[]> = {
  'Just me': ['medium', 'long'],
  'Watching with friends': ['medium', 'long'],
  'Need a quick watch': ['short'],
  'Give me a deep binge': ['long'],
  'Make me laugh': ['short', 'medium'],
  'I need something healing': ['long'],
  'Put me on something new': ['short', 'medium'],
  'Help me lock in': ['long'],
  'I want creator energy': ['medium', 'long'],
  'I want music energy': ['medium', 'long'],
};

export function scoreContent(answers: PrescriptionAnswers): ScoredItem[] {
  const { moods, energy, contentTypes, momentNeeds } = answers;

  return CONTENT_LIBRARY.map((item) => {
    // Mood match
    const moodHits = moods.filter((m) => item.moods.includes(m)).length;
    const moodMatch = moods.length === 0 ? 70 : Math.min(100, Math.round((moodHits / moods.length) * 100 + (moodHits > 0 ? 20 : 0)));

    // Energy match
    let energyMatch = 70;
    if (energy === 'Surprise Me' || !energy) energyMatch = 80;
    else if (item.energy.includes(energy)) energyMatch = 95;
    else energyMatch = 55;

    // Content type match
    const contentMatch = contentTypes.length === 0 || contentTypes.includes(item.category) ? 1 : 0.4;

    // Moment match
    let momentBoost = 0;
    let durationOk = true;
    momentNeeds.forEach((m) => {
      const wanted = MOMENT_CONTENT_HINT[m];
      if (wanted.includes(item.category)) momentBoost += 8;
      const dur = MOMENT_DURATION_HINT[m];
      if (!dur.includes(item.duration)) durationOk = false;
    });
    if (momentNeeds.length > 0 && !durationOk) momentBoost -= 5;

    // Trending / freshness bonus
    const freshness = (item.trending ? 4 : 0) + (item.isNewCreator && contentTypes.includes('New Creators') ? 6 : 0);

    const raw = moodMatch * 0.45 + energyMatch * 0.25 + contentMatch * 20 + momentBoost + freshness;
    const score = Math.max(0, Math.min(100, Math.round(raw)));

    // Build "why this" reason
    const reasonBits: string[] = [];
    const matchedMoods = moods.filter((m) => item.moods.includes(m));
    if (matchedMoods.length > 0) reasonBits.push(matchedMoods.slice(0, 2).join(' + '));
    if (energy && energy !== 'Surprise Me' && item.energy.includes(energy)) reasonBits.push(energy);
    if (contentTypes.includes(item.category)) reasonBits.push(item.category);
    const reason = reasonBits.length > 0
      ? `Because you picked ${reasonBits.slice(0, 3).join(' + ')}`
      : 'Because it matches your current vibe';

    return { ...item, score, moodMatch, energyMatch, reason };
  }).sort((a, b) => b.score - a.score);
}

export function generatePrescriptionTitle(answers: PrescriptionAnswers): string {
  const { moods, energy, momentNeeds } = answers;
  const titlePool = [
    'Friday Night Reset', 'Date Night In', 'Sunday Mind Reset', 'Midnight Motivation',
    'Healing Mode', 'Laugh Therapy', 'Lock-In Session', 'Velvet Hours', 'Open Mic Energy',
    'Soft Restart', 'Wild Frequency', 'Deep Binge Mode',
  ];
  if (moods.includes('Healing') || momentNeeds.includes('I need something healing')) return 'Healing Mode';
  if (moods.includes('Romantic')) return 'Date Night In';
  if (moods.includes('Reflective') && energy === 'Soft') return 'Sunday Mind Reset';
  if (moods.includes('Motivated') && energy === 'High Energy') return 'Midnight Motivation';
  if (moods.includes('Focused')) return 'Lock-In Session';
  if (momentNeeds.includes('Make me laugh')) return 'Laugh Therapy';
  if (moods.includes('Wild')) return 'Wild Frequency';
  return titlePool[Math.floor(Math.random() * titlePool.length)];
}

// localStorage persistence helpers
const STORE_KEY = 'treytv:prescriptions';

export interface SavedPrescription {
  id: string;
  title: string;
  answers: PrescriptionAnswers;
  topId: string;
  recIds: string[];
  matchScore: number;
  createdAt: number;
  isSaved: boolean;
  isFavorite: boolean;
}

export function loadPrescriptions(): SavedPrescription[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function savePrescriptions(list: SavedPrescription[]) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(list));
  } catch { /* ignore */ }
}
