// Trap Tap — shared types for the Trey TV Games module.

export type TrapTapScreen = 'home' | 'gameplay' | 'results';

export type Judgment = 'pp' | 'p' | 'g' | 'm';

export interface TrapTapSong {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  /** Seconds. Used for the progress bar + auto-finish. */
  duration: number;
  /** Seconds into the track where the first beat lands (chart anchor). */
  beatOffset: number;
  genre: string;
  /** Path served from /public. */
  audioUrl: string;
  /** Square cover art URL. */
  coverArtUrl: string;
}

export interface TrapTapDifficulty {
  name: 'Easy' | 'Normal' | 'Hard' | 'Expert' | 'Expert+';
  level: number;
  /** Approach-speed multiplier (higher = notes travel faster). */
  speed: number;
  /** Score multiplier for the difficulty. */
  mult: number;
  /** Beat sub-positions (in beats) placed each bar. */
  offs: number[];
  /** Neon accent for the difficulty chip. */
  color: string;
}

export interface TrapTapNote {
  id: number;
  /** Lane index 0..LANE_COUNT-1. */
  lane: number;
  /** Seconds — the moment the note should be struck. */
  time: number;
  hit: boolean;
  missed: boolean;
  /** Optional duration in seconds for hold notes. */
  holdDuration?: number;
  holdHeadHit?: boolean;
  holdActive?: boolean;
  holdReleasedEarly?: boolean;
  /** Optional ending lane for bending/lane-shifting hold notes. */
  endLane?: number;
}

export interface JudgmentCounts {
  pp: number;
  p: number;
  g: number;
  m: number;
}

export interface TrapTapResult {
  songId: string;
  songTitle: string;
  artist: string;
  difficulty: TrapTapDifficulty['name'];
  score: number;
  /** 0..100 */
  accuracy: number;
  maxCombo: number;
  grade: string;
  rank: string;
  counts: JudgmentCounts;
  isNewBest: boolean;
}
