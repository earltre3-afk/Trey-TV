import { GameMode, NounType, TreynounMatchState } from './treynounTypes';
import { MOCK_PLAYER } from './treynounMockData';

const STORAGE_KEY = 'treynoun.stats.v1';

export interface SavedMatch {
  id: string;
  mode: GameMode;
  score: number;
  roundsWon: number;
  roundsFailed: number;
  accuracy: number;
  bestStreak: number;
  bestCategory: NounType;
  date: number;
}

export interface TreynounStats {
  totalNounScore: number; // cumulative Noun Score across all matches
  bestHotTrail: number;
  gemsEarned: number; // cumulative gems
  rank: number;
  matchHistory: SavedMatch[];
}

export const DEFAULT_STATS: TreynounStats = {
  totalNounScore: 0,
  bestHotTrail: MOCK_PLAYER.hotTrail,
  gemsEarned: 0,
  rank: MOCK_PLAYER.rank,
  matchHistory: [],
};

export function loadStats(): TreynounStats {
  if (typeof window === 'undefined') return { ...DEFAULT_STATS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATS };
    const parsed = JSON.parse(raw);
    return {
      totalNounScore: Number(parsed.totalNounScore) || 0,
      bestHotTrail: Number(parsed.bestHotTrail) || DEFAULT_STATS.bestHotTrail,
      gemsEarned: Number(parsed.gemsEarned) || 0,
      rank: Number(parsed.rank) || DEFAULT_STATS.rank,
      matchHistory: Array.isArray(parsed.matchHistory) ? parsed.matchHistory.slice(0, 50) : [],
    };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export function saveStats(stats: TreynounStats): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    /* ignore quota / private mode errors */
  }
}

// Rank improves (gets smaller) as cumulative Noun Score grows.
export function computeRank(totalNounScore: number): number {
  const improved = MOCK_PLAYER.rank - Math.floor(totalNounScore / 500);
  return Math.max(1, improved);
}

function bestCategoryFromMatch(match: TreynounMatchState): NounType {
  const counts: Record<string, number> = {};
  match.history.forEach((h) => {
    if (h.won) counts[h.category] = (counts[h.category] || 0) + 1;
  });
  const entry = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return (entry?.[0] as NounType) || 'thing';
}

// Records a completed match into stats and persists. Returns the updated stats.
export function recordMatch(match: TreynounMatchState): TreynounStats {
  const prev = loadStats();
  const answered = match.roundsWon + match.roundsFailed;
  const accuracy = answered ? Math.round((match.roundsWon / answered) * 100) : 0;

  const saved: SavedMatch = {
    id: `m_${Date.now()}`,
    mode: match.mode,
    score: match.totalScore,
    roundsWon: match.roundsWon,
    roundsFailed: match.roundsFailed,
    accuracy,
    bestStreak: match.bestStreak,
    bestCategory: bestCategoryFromMatch(match),
    date: Date.now(),
  };

  const totalNounScore = prev.totalNounScore + match.totalScore;
  const next: TreynounStats = {
    totalNounScore,
    bestHotTrail: Math.max(prev.bestHotTrail, match.bestStreak),
    gemsEarned: prev.gemsEarned + match.gemsEarned,
    rank: computeRank(totalNounScore),
    matchHistory: [saved, ...prev.matchHistory].slice(0, 50),
  };

  saveStats(next);
  return next;
}

// Records a battle result (two team scores) into stats.
export function recordBattle(glow: number, vibe: number): TreynounStats {
  const prev = loadStats();
  const myScore = glow; // player is on Team Glow
  const won = glow >= vibe;
  const saved: SavedMatch = {
    id: `b_${Date.now()}`,
    mode: 'battle',
    score: myScore,
    roundsWon: won ? 3 : 0,
    roundsFailed: won ? 0 : 3,
    accuracy: won ? 100 : 0,
    bestStreak: 0,
    bestCategory: 'thing',
    date: Date.now(),
  };
  const totalNounScore = prev.totalNounScore + myScore;
  const next: TreynounStats = {
    totalNounScore,
    bestHotTrail: prev.bestHotTrail,
    gemsEarned: prev.gemsEarned + (won ? 3 : 1),
    rank: computeRank(totalNounScore),
    matchHistory: [saved, ...prev.matchHistory].slice(0, 50),
  };
  saveStats(next);
  return next;
}

export function clearStats(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
