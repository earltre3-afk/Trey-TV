// Trap Tap — local persistence (best scores + lifetime stats).
//
// Mirrors the treynoun storage pattern: localStorage now, swap for Supabase /
// user game-stats tables later without touching the screens.

import { TrapTapResult } from './traptapTypes';

const STORAGE_KEY = 'traptap.stats.v1';

export interface TrapTapPlayRecord {
  id: string;
  songId: string;
  songTitle: string;
  difficulty: string;
  score: number;
  accuracy: number;
  maxCombo: number;
  grade: string;
  date: number;
}

export interface TrapTapStats {
  /** Best score keyed by `${songId}:${difficulty}`. */
  bestScores: Record<string, number>;
  totalScore: number;
  bestCombo: number;
  playCount: number;
  history: TrapTapPlayRecord[];
}

export const DEFAULT_STATS: TrapTapStats = {
  bestScores: {},
  totalScore: 0,
  bestCombo: 0,
  playCount: 0,
  history: [],
};

export function bestKey(songId: string, difficulty: string): string {
  return `${songId}:${difficulty}`;
}

export function loadStats(): TrapTapStats {
  if (typeof window === 'undefined') return { ...DEFAULT_STATS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATS };
    const parsed = JSON.parse(raw);
    return {
      bestScores: parsed.bestScores && typeof parsed.bestScores === 'object' ? parsed.bestScores : {},
      totalScore: Number(parsed.totalScore) || 0,
      bestCombo: Number(parsed.bestCombo) || 0,
      playCount: Number(parsed.playCount) || 0,
      history: Array.isArray(parsed.history) ? parsed.history.slice(0, 50) : [],
    };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export function saveStats(stats: TrapTapStats): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    /* ignore quota / private mode */
  }
}

export function getBest(songId: string, difficulty: string): number {
  return loadStats().bestScores[bestKey(songId, difficulty)] || 0;
}

/** Records a finished run, updates the per-song best, returns the new stats. */
export function recordResult(result: TrapTapResult): TrapTapStats {
  const prev = loadStats();
  const key = bestKey(result.songId, result.difficulty);
  const prevBest = prev.bestScores[key] || 0;

  const record: TrapTapPlayRecord = {
    id: `tt_${Date.now()}`,
    songId: result.songId,
    songTitle: result.songTitle,
    difficulty: result.difficulty,
    score: result.score,
    accuracy: result.accuracy,
    maxCombo: result.maxCombo,
    grade: result.grade,
    date: Date.now(),
  };

  const next: TrapTapStats = {
    bestScores: { ...prev.bestScores, [key]: Math.max(prevBest, result.score) },
    totalScore: prev.totalScore + result.score,
    bestCombo: Math.max(prev.bestCombo, result.maxCombo),
    playCount: prev.playCount + 1,
    history: [record, ...prev.history].slice(0, 50),
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
