import {
  ChaosEvent,
  HintType,
  TreynounMatchState,
  TreynounRoundState,
  TreynounScoreBreakdown,
  GameMode,
  NounType,
} from './treynounTypes';

export const CHAOS_VALUES = {
  wrongGuess: 15,
  wrongCategory: 15,
  hint: 10,
  earlyReveal: 5,
  repeatedWrong: 20,
  lowTimer: 10,
  trapWrong: 35,
};

export const HINT_PENALTY: Record<HintType, number> = {
  'first-letter': 15,
  'letter-count': 10,
  'remove-category': 20,
  'hot-cold': 10,
};

export function calculateChaos(events: ChaosEvent[]): number {
  return Math.min(100, events.reduce((sum, e) => sum + e.amount, 0));
}

export function applyHintPenalty(hints: HintType[]): number {
  return hints.reduce((sum, h) => sum + HINT_PENALTY[h], 0);
}

export function applyTrapMultiplier(base: number, trapCorrect: boolean | null): number {
  return trapCorrect ? base * 1.5 : base;
}

export function calculateRoundScore(
  round: TreynounRoundState,
  streak: number
): TreynounScoreBreakdown {
  const base = 100;
  const timeBonus = Math.max(0, round.timeLeft) * 2;

  let signalBonus = 0;
  if (round.revealedSignals <= 1) signalBonus = 60;
  else if (round.revealedSignals === 2) signalBonus = 35;
  else signalBonus = 10;

  const categoryLockBonus = round.categoryLockCorrect ? 25 : 0;
  const noHintBonus = round.hintsUsed.length === 0 ? 25 : 0;

  const isPerfect =
    round.timeLeft >= round.maxTime - 10 &&
    round.wrongGuesses.length === 0 &&
    round.hintsUsed.length === 0 &&
    round.earlyReveals === 0;
  const perfectChaseBonus = isPerfect ? 75 : 0;

  let streakBonus = 0;
  const newStreak = streak + 1;
  if (newStreak === 2) streakBonus = 25;
  else if (newStreak === 3) streakBonus = 50;
  else if (newStreak >= 5) streakBonus = 60;

  const hintPenalty = applyHintPenalty(round.hintsUsed);
  const wrongGuessPenalty = round.wrongGuesses.length * 5;

  let subtotal =
    base +
    timeBonus +
    signalBonus +
    categoryLockBonus +
    noHintBonus +
    perfectChaseBonus +
    streakBonus -
    hintPenalty -
    wrongGuessPenalty;

  subtotal = Math.max(0, subtotal);

  const trapMultiplier = round.trapCorrect ? 1.5 : 1;
  const total = Math.round(subtotal * trapMultiplier);

  return {
    base,
    timeBonus,
    signalBonus,
    categoryLockBonus,
    noHintBonus,
    perfectChaseBonus,
    streakBonus,
    hintPenalty,
    wrongGuessPenalty,
    trapMultiplier,
    total,
  };
}

export function calculateMatchWinner(
  scoreA: number,
  scoreB: number
): 'a' | 'b' | 'tie' {
  if (scoreA > scoreB) return 'a';
  if (scoreB > scoreA) return 'b';
  return 'tie';
}

export function resetRound(
  roundNumber: number,
  category: NounType,
  targetNoun: string,
  signals: TreynounRoundState['signals'],
  maxTime = 60
): TreynounRoundState {
  return {
    roundNumber,
    category,
    targetNoun,
    signals,
    revealedSignals: 1,
    earlyReveals: 0,
    timeLeft: maxTime,
    maxTime,
    chaos: 0,
    chaosEvents: [],
    wrongGuesses: [],
    hintsUsed: [],
    lockedCategory: null,
    categoryLockCorrect: null,
    trapUsed: false,
    trapCorrect: null,
    result: 'pending',
  };
}

export function resetMatch(mode: GameMode, difficulty: TreynounMatchState['difficulty']): TreynounMatchState {
  const totalRounds = mode === 'battle' ? 3 : mode === 'live-room' ? 1 : 5;
  return {
    mode,
    difficulty,
    totalRounds,
    currentRound: 1,
    totalScore: 0,
    roundsWon: 0,
    roundsFailed: 0,
    streak: 0,
    bestStreak: 0,
    fastestLockIn: null,
    gemsEarned: 0,
    history: [],
  };
}
