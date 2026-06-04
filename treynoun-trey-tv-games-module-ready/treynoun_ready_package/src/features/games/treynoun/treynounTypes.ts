export type NounType = 'person' | 'place' | 'thing';

export type GameMode = 'solo' | 'pass-noun' | 'battle' | 'live-room' | 'daily';

export type TreynounScreen =
  | 'home'
  | 'mode-select'
  | 'target-setup'
  | 'trail-builder'
  | 'chase'
  | 'correct'
  | 'failed'
  | 'match-results'
  | 'battle-lobby'
  | 'battle-chase'
  | 'live-room'
  | 'leaderboard';

export type HintType = 'first-letter' | 'letter-count' | 'remove-category' | 'hot-cold';

export interface TreynounSignalClue {
  id: number;
  prompt: string;
  text: string;
}

export interface ChaosEvent {
  reason: string;
  amount: number;
  at: number;
}

export interface TreynounScoreBreakdown {
  base: number;
  timeBonus: number;
  signalBonus: number;
  categoryLockBonus: number;
  noHintBonus: number;
  perfectChaseBonus: number;
  streakBonus: number;
  hintPenalty: number;
  wrongGuessPenalty: number;
  trapMultiplier: number;
  total: number;
}

export interface TreynounRoundState {
  roundNumber: number;
  category: NounType;
  targetNoun: string;
  signals: TreynounSignalClue[];
  revealedSignals: number; // 1..3
  earlyReveals: number;
  timeLeft: number;
  maxTime: number;
  chaos: number;
  chaosEvents: ChaosEvent[];
  wrongGuesses: string[];
  hintsUsed: HintType[];
  lockedCategory: NounType | null;
  categoryLockCorrect: boolean | null;
  trapUsed: boolean;
  trapCorrect: boolean | null;
  result: 'pending' | 'won' | 'lost';
  lossReason?: string;
  scoreBreakdown?: TreynounScoreBreakdown;
}

export interface TreynounMatchState {
  mode: GameMode;
  difficulty: 'easy' | 'normal' | 'hard' | 'expert';
  totalRounds: number;
  currentRound: number;
  totalScore: number;
  roundsWon: number;
  roundsFailed: number;
  streak: number;
  bestStreak: number;
  fastestLockIn: number | null;
  gemsEarned: number;
  history: { round: number; category: NounType; noun: string; won: boolean; score: number; timeUsed: number }[];
}

export interface TreynounPlayer {
  id: string;
  name: string;
  avatar: string;
  isHost?: boolean;
  ready?: boolean;
  age?: number;
}

export interface TreynounTeam {
  id: string;
  name: string;
  accent: string;
  score: number;
  chaos: number;
  players: TreynounPlayer[];
}

export interface TreynounLeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  nounScore: number;
  hotTrail: number;
  fastestLock: number;
  bestCategory: NounType;
}
