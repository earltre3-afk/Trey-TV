// Mock data for the Song Review module
import { IMAGES } from '@/data/mockData';
import type { AIPrecheck, SongSubmission, ReviewResult, ReviewQueueItem } from './songReviewTypes';

export const MOCK_PRECHECK: AIPrecheck = {
  overallScore: 82,
  mixQuality: 78,
  originality: 88,
  vocalPresence: 80,
  hitPotential: 75,
  genre: 'Hip Hop / Trap Soul',
  summary: 'Strong melodic presence with a unique hook. Mix could use more low-end clarity. The track has solid replay value and fits the Tradio catalog well.',
  improvements: [
    'Boost low-end clarity in the 60-120Hz range',
    'Add subtle ad-libs to fill the second verse',
    'Consider a bridge section before the final chorus',
  ],
  strengths: [
    'Catchy hook with strong melodic identity',
    'Clean vocal delivery and flow',
    'Production quality is above average',
    'Unique sonic palette that stands out',
  ],
};

export const MOCK_SUBMISSIONS: SongSubmission[] = [
  {
    id: 'sub-1',
    songTitle: 'Midnight Confessions',
    artistName: 'Nova Saint',
    genre: 'R&B / Trap Soul',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverArt: IMAGES.artist2,
    submittedAt: Date.now() - 3600000,
    status: 'in-queue',
    precheck: { ...MOCK_PRECHECK, overallScore: 85 },
    skipTheLine: false,
    position: 3,
  },
  {
    id: 'sub-2',
    songTitle: 'Gold Rush',
    artistName: 'City Lights',
    genre: 'Hip Hop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    coverArt: IMAGES.artist1,
    submittedAt: Date.now() - 7200000,
    status: 'reviewed',
    precheck: { ...MOCK_PRECHECK, overallScore: 91 },
    skipTheLine: true,
    position: 1,
  },
  {
    id: 'sub-3',
    songTitle: 'Pressure Drop',
    artistName: 'Soul Therapy',
    genre: 'Trap',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    coverArt: IMAGES.artist3,
    submittedAt: Date.now() - 1800000,
    status: 'in-queue',
    precheck: { ...MOCK_PRECHECK, overallScore: 72 },
    skipTheLine: false,
    position: 5,
  },
  {
    id: 'sub-4',
    songTitle: 'Ocean Drive',
    artistName: 'Ocean Views',
    genre: 'R&B',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    coverArt: IMAGES.artist4,
    submittedAt: Date.now() - 900000,
    status: 'pending',
    skipTheLine: false,
  },
];

export const MOCK_QUEUE: ReviewQueueItem[] = MOCK_SUBMISSIONS
  .filter((s) => s.status === 'in-queue' || s.status === 'prechecked')
  .map((s, i) => ({
    position: i + 1,
    submission: s,
    estimatedWait: `~${(i + 1) * 12} min`,
  }));

export const MOCK_REVIEW_RESULT: ReviewResult = {
  id: 'rev-1',
  submissionId: 'sub-2',
  reviewerName: 'Trey Trizzy',
  rating: 9,
  feedback: 'This track is fire. The production is clean, the hook is memorable, and the energy is right for the Tradio catalog. Adding this to the rotation.',
  playedOnAir: true,
  timestamp: Date.now() - 3600000,
  highlights: ['Strong hook', 'Clean mix', 'Catalog fit'],
  verdict: 'approved',
};
