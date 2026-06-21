// Song Review types ported from Tradio pass12's music-review feature
// Defines the structure for the song submission and review workflow.

export interface AIPrecheck {
  overallScore: number; // 0-100
  mixQuality: number;
  originality: number;
  vocalPresence: number;
  hitPotential: number;
  genre: string;
  summary: string;
  improvements: string[];
  strengths: string[];
}

export interface SongSubmission {
  id: string;
  songTitle: string;
  artistName: string;
  genre: string;
  audioUrl: string;
  coverArt?: string;
  submittedAt: number;
  status: 'pending' | 'prechecked' | 'in-queue' | 'reviewing' | 'reviewed' | 'rejected';
  precheck?: AIPrecheck;
  skipTheLine: boolean;
  position?: number;
}

export interface ReviewResult {
  id: string;
  submissionId: string;
  reviewerName: string;
  rating: number; // 1-10
  feedback: string;
  playedOnAir: boolean;
  timestamp: number;
  highlights: string[];
  verdict: 'approved' | 'needs-work' | 'rejected';
}

export interface ReviewQueueItem {
  position: number;
  submission: SongSubmission;
  estimatedWait: string;
}
