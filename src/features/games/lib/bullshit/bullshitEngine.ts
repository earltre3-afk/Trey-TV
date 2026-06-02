import { getCard, shuffledDeck, Rank } from "@/features/games/lib/cards/cardManifest";

export type BSPhase = "playing" | "awaiting-challenge" | "game-over";

export interface BSPlayer {
  seat: number;
  name: string;
  isBot: boolean;
  hand: string[];
}
export interface BSClaim {
  seat: number;
  rank: Rank;
  count: number;
  cardIds: string[];
}

export interface BSState {
  phase: BSPhase;
  players: BSPlayer[];
  pile: string[]; // face-down pile (ids)
  currentSeat: number;
  expectedRank: Rank; // rank everyone must claim this round of the central pile
  lastClaim: BSClaim | null;
  winner: number | null;
  log: string[];
  reveal: { liar: boolean; cards: string[]; loserSeat: number } | null;
}

const RANK_ORDER: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export function newBullshitGame(playerNames: string[]): BSState {
  const n = playerNames.length;
  const deck = shuffledDeck();
  const hands: string[][] = Array.from({ length: n }, () => []);
  deck.forEach((c, i) => hands[i % n].push(c));
  hands.forEach((h) =>
    h.sort((a, b) => RANK_ORDER.indexOf(getCard(a).rank) - RANK_ORDER.indexOf(getCard(b).rank)),
  );
  const players: BSPlayer[] = playerNames.map((name, seat) => ({
    seat,
    name,
    isBot: seat !== 0,
    hand: hands[seat],
  }));
  return {
    phase: "playing",
    players,
    pile: [],
    currentSeat: 0,
    expectedRank: "A",
    lastClaim: null,
    winner: null,
    log: [`Bullshit start. ${players[0].name} leads with Aces.`],
    reveal: null,
  };
}

export function makeClaim(
  state: BSState,
  seat: number,
  cardIds: string[],
  claimedRank: Rank,
): BSState {
  if (state.phase !== "playing") return state;
  if (state.currentSeat !== seat) return state;
  if (cardIds.length < 1 || cardIds.length > 4) return state;
  if (claimedRank !== state.expectedRank) return state;
  const player = state.players[seat];
  if (!cardIds.every((id) => player.hand.includes(id))) return state;
  const next: BSState = JSON.parse(JSON.stringify(state));
  next.players[seat].hand = next.players[seat].hand.filter((c) => !cardIds.includes(c));
  next.pile.push(...cardIds);
  next.lastClaim = { seat, rank: claimedRank, count: cardIds.length, cardIds };
  next.log.push(`${player.name} claims ${cardIds.length} × ${claimedRank}.`);
  next.phase = "awaiting-challenge";
  return next;
}

export function passChallenge(state: BSState): BSState {
  if (state.phase !== "awaiting-challenge" || !state.lastClaim) return state;
  return advanceTurn(state, false);
}

export function callBullshit(state: BSState, callerSeat: number): BSState {
  if (state.phase !== "awaiting-challenge" || !state.lastClaim) return state;
  const claim = state.lastClaim;
  if (callerSeat === claim.seat) return state;
  const next: BSState = JSON.parse(JSON.stringify(state));
  const truthful = claim.cardIds.every((id) => getCard(id).rank === claim.rank);
  const loserSeat = truthful ? callerSeat : claim.seat;
  next.players[loserSeat].hand.push(...next.pile);
  next.players[loserSeat].hand.sort(
    (a, b) => RANK_ORDER.indexOf(getCard(a).rank) - RANK_ORDER.indexOf(getCard(b).rank),
  );
  next.reveal = { liar: !truthful, cards: claim.cardIds, loserSeat };
  next.log.push(
    truthful
      ? `${next.players[callerSeat].name} called BS — claim was TRUE. ${next.players[callerSeat].name} takes the pile.`
      : `${next.players[callerSeat].name} called BS — BLUFF! ${next.players[claim.seat].name} takes the pile.`,
  );
  next.pile = [];
  return advanceTurn(next, true, loserSeat);
}

function advanceTurn(state: BSState, fromChallenge: boolean, loserSeat?: number): BSState {
  const next: BSState = JSON.parse(JSON.stringify(state));
  // win check
  for (const p of next.players) {
    if (p.hand.length === 0) {
      next.winner = p.seat;
      next.phase = "game-over";
      next.log.push(`${p.name} wins Bullshit!`);
      return next;
    }
  }
  const start = next.currentSeat;
  let nextSeat = (start + 1) % next.players.length;
  if (fromChallenge && loserSeat !== undefined) {
    nextSeat = loserSeat;
  }
  next.currentSeat = nextSeat;
  const idx = RANK_ORDER.indexOf(next.expectedRank);
  next.expectedRank = RANK_ORDER[(idx + 1) % RANK_ORDER.length];
  next.phase = "playing";
  next.log.push(`${next.players[nextSeat].name}'s turn. Claim ${next.expectedRank}.`);
  return next;
}

// ---- Bots ----
export function botClaim(state: BSState, seat: number): { cardIds: string[]; rank: Rank } {
  const p = state.players[seat];
  const truthful = p.hand.filter((id) => getCard(id).rank === state.expectedRank);
  if (truthful.length > 0) {
    return { cardIds: truthful.slice(0, Math.min(truthful.length, 3)), rank: state.expectedRank };
  }
  // bluff with 1-2 lowest cards
  const sorted = [...p.hand].sort(
    (a, b) => RANK_ORDER.indexOf(getCard(a).rank) - RANK_ORDER.indexOf(getCard(b).rank),
  );
  const n = Math.random() < 0.7 ? 1 : 2;
  return { cardIds: sorted.slice(0, Math.min(n, sorted.length)), rank: state.expectedRank };
}

export function botShouldCall(state: BSState, seat: number): boolean {
  if (!state.lastClaim) return false;
  if (state.lastClaim.seat === seat) return false;
  // simple heuristic: call ~20% of the time, more if claim count is suspicious (3-4)
  const base = state.lastClaim.count >= 3 ? 0.45 : 0.18;
  return Math.random() < base;
}
