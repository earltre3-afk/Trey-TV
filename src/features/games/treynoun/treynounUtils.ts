import { NounType, TreynounSignalClue } from './treynounTypes';
import { SIGNAL_PROMPTS, SOLO_TARGETS, NOUN_SIGNALS } from './treynounMockData';

export function normalizeGuess(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ');
}

export function isCorrectGuess(guess: string, target: string): boolean {
  const g = normalizeGuess(guess);
  const t = normalizeGuess(target);
  if (!g) return false;
  if (g === t) return true;
  // allow simple plural / trailing s
  if (g === t + 's' || g + 's' === t) return true;
  return false;
}

export function isCloseGuess(guess: string, target: string): boolean {
  const g = normalizeGuess(guess);
  const t = normalizeGuess(target);
  if (!g || isCorrectGuess(guess, target)) return false;
  if (g.length < 2) return false;
  // shares first letter and similar length
  if (g[0] === t[0]) return true;
  // levenshtein distance <= 2
  return levenshtein(g, t) <= 2;
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[m][n];
}

export interface ClueValidation {
  valid: boolean;
  warning?: string;
  error?: string;
}

export function validateClue(clue: string, target: string): ClueValidation {
  const c = clue.trim();
  if (!c) return { valid: false, error: 'Clue cannot be empty.' };
  const norm = normalizeGuess(c);
  const tnorm = normalizeGuess(target);
  if (tnorm && norm.split(' ').includes(tnorm)) {
    return { valid: false, error: 'Clue cannot contain the Target Noun.' };
  }
  if (tnorm && norm.includes(tnorm)) {
    return { valid: false, error: 'Clue cannot contain the Target Noun.' };
  }
  if (/starts with/i.test(c)) {
    return { valid: false, error: 'No "starts with" spelling hints allowed.' };
  }
  if (c.length < 3) {
    return { valid: true, warning: 'Clue is very short — add more detail.' };
  }
  return { valid: true };
}

export function getSignalPromptsForCategory(cat: NounType): [string, string, string] {
  return SIGNAL_PROMPTS[cat];
}

export function getMockNounForCategory(cat: NounType, exclude: string[] = []): string {
  const pool = SOLO_TARGETS[cat].filter((n) => !exclude.includes(n));
  const list = pool.length ? pool : SOLO_TARGETS[cat];
  return list[Math.floor(Math.random() * list.length)];
}

export function getMockSignalsForNoun(noun: string, cat: NounType): TreynounSignalClue[] {
  const prompts = getSignalPromptsForCategory(cat);
  const texts = NOUN_SIGNALS[noun] || ['It is common.', 'You see it often.', 'People know it well.'];
  return [0, 1, 2].map((i) => ({ id: i + 1, prompt: prompts[i], text: texts[i] }));
}

export function buildSignals(cat: NounType, texts: string[]): TreynounSignalClue[] {
  const prompts = getSignalPromptsForCategory(cat);
  return [0, 1, 2].map((i) => ({ id: i + 1, prompt: prompts[i], text: texts[i] || '' }));
}
