 
import { getCard, shuffledDeck, Suit } from '@/features/games/lib/cards/cardManifest';

export type SpadesPhase = 'bidding' | 'playing' | 'round-end' | 'game-over';

export interface SpadesPlayer {
  seat: number;            // 0-3, 0 = you, partners: 0&2 vs 1&3
  name: string;
  isBot: boolean;
  hand: string[];          // card ids
  bid: number | null;
  tricksWon: number;
}

export interface SpadesState {
  phase: SpadesPhase;
  players: [SpadesPlayer, SpadesPlayer, SpadesPlayer, SpadesPlayer];
  currentSeat: number;     // seat to act
  leadSeat: number;        // who led current trick
  trick: { seat: number; cardId: string }[]; // current trick in play order
  ledSuit: Suit | null;
  spadesBroken: boolean;
  teamScores: [number, number]; // teams 0 (seats 0+2), 1 (seats 1+3)
  teamBags: [number, number];
  teamRoundBids: [number, number];
  teamRoundTricks: [number, number];
  round: number;
  targetScore: number;
  lastTrickWinner: number | null;
  log: string[];
}

export function teamOf(seat: number): 0 | 1 {
  return (seat % 2) as 0 | 1;
}

export function newSpadesGame(playerNames: string[], targetScore = 500): SpadesState {
  const deck = shuffledDeck();
  const hands: string[][] = [[], [], [], []];
  deck.forEach((c, i) => hands[i % 4].push(c));
  // sort hands by suit/rank
  hands.forEach(h => h.sort(sortCardCmp));

  const players = [0,1,2,3].map((seat) => ({
    seat,
    name: playerNames[seat] || `Player ${seat + 1}`,
    isBot: seat !== 0,
    hand: hands[seat],
    bid: null as number | null,
    tricksWon: 0,
  })) as SpadesState['players'];

  return {
    phase: 'bidding',
    players,
    currentSeat: 0,
    leadSeat: 0,
    trick: [],
    ledSuit: null,
    spadesBroken: false,
    teamScores: [0, 0],
    teamBags: [0, 0],
    teamRoundBids: [0, 0],
    teamRoundTricks: [0, 0],
    round: 1,
    targetScore,
    lastTrickWinner: null,
    log: ['Round 1 — Place your bids.'],
  };
}

function sortCardCmp(a: string, b: string): number {
  const ca = getCard(a), cb = getCard(b);
  const order: Suit[] = ['clubs','diamonds','hearts','spades'];
  if (ca.suit !== cb.suit) return order.indexOf(ca.suit) - order.indexOf(cb.suit);
  return ca.spadesValue - cb.spadesValue;
}

export function legalCards(state: SpadesState, seat: number): string[] {
  const p = state.players[seat];
  if (state.phase !== 'playing' || state.currentSeat !== seat) return [];
  const hand = p.hand;
  if (state.trick.length === 0) {
    // leading: cannot lead spades until broken unless only spades remain
    const nonSpades = hand.filter(c => getCard(c).suit !== 'spades');
    if (!state.spadesBroken && nonSpades.length > 0) return nonSpades;
    return [...hand];
  }
  const led = state.ledSuit!;
  const followers = hand.filter(c => getCard(c).suit === led);
  if (followers.length > 0) return followers;
  return [...hand];
}

export function placeBid(state: SpadesState, seat: number, bid: number): SpadesState {
  if (state.phase !== 'bidding') return state;
  if (state.currentSeat !== seat) return state;
  if (bid < 0 || bid > 13) return state;
  const next: SpadesState = JSON.parse(JSON.stringify(state));
  next.players[seat].bid = bid;
  next.log = [...next.log, `${next.players[seat].name} bids ${bid}.`];
  // next bidder
  const nextSeat = (seat + 1) % 4;
  if (next.players.every(p => p.bid !== null)) {
    next.phase = 'playing';
    next.teamRoundBids = [
      (next.players[0].bid! + next.players[2].bid!),
      (next.players[1].bid! + next.players[3].bid!),
    ];
    next.currentSeat = next.leadSeat;
    next.log.push(`Bidding complete. Team We: ${next.teamRoundBids[0]} | Team Them: ${next.teamRoundBids[1]}`);
  } else {
    next.currentSeat = nextSeat;
  }
  return next;
}

export function playCard(state: SpadesState, seat: number, cardId: string): SpadesState {
  if (state.phase !== 'playing') return state;
  if (state.currentSeat !== seat) return state;
  const legal = legalCards(state, seat);
  if (!legal.includes(cardId)) return state;
  const next: SpadesState = JSON.parse(JSON.stringify(state));
  const p = next.players[seat];
  p.hand = p.hand.filter(c => c !== cardId);
  next.trick.push({ seat, cardId });
  const c = getCard(cardId);
  if (next.trick.length === 1) next.ledSuit = c.suit;
  if (c.suit === 'spades') next.spadesBroken = true;

  if (next.trick.length === 4) {
    // resolve trick
    const winnerSeat = resolveTrick(next.trick, next.ledSuit!);
    next.players[winnerSeat].tricksWon += 1;
    next.teamRoundTricks[teamOf(winnerSeat)] += 1;
    next.lastTrickWinner = winnerSeat;
    next.log.push(`${next.players[winnerSeat].name} wins the trick.`);
    next.trick = [];
    next.ledSuit = null;
    next.leadSeat = winnerSeat;
    next.currentSeat = winnerSeat;

    // round end?
    if (next.players.every(pp => pp.hand.length === 0)) {
      scoreRound(next);
      if (next.teamScores[0] >= next.targetScore || next.teamScores[1] >= next.targetScore) {
        next.phase = 'game-over';
        const winner = next.teamScores[0] > next.teamScores[1] ? 0 : 1;
        next.log.push(`Game over. Team ${winner === 0 ? 'We' : 'Them'} wins!`);
      } else {
        next.phase = 'round-end';
      }
    }
  } else {
    next.currentSeat = (seat + 1) % 4;
  }
  return next;
}

function resolveTrick(trick: { seat: number; cardId: string }[], led: Suit): number {
  let bestSeat = trick[0].seat;
  let bestCard = getCard(trick[0].cardId);
  for (let i = 1; i < trick.length; i++) {
    const cur = getCard(trick[i].cardId);
    const bestIsSpade = bestCard.suit === 'spades';
    const curIsSpade = cur.suit === 'spades';
    if (curIsSpade && !bestIsSpade) { bestSeat = trick[i].seat; bestCard = cur; continue; }
    if (!curIsSpade && bestIsSpade) continue;
    if (curIsSpade && bestIsSpade) {
      if (cur.spadesValue > bestCard.spadesValue) { bestSeat = trick[i].seat; bestCard = cur; }
      continue;
    }
    // both non-spades
    if (cur.suit === led && bestCard.suit === led) {
      if (cur.spadesValue > bestCard.spadesValue) { bestSeat = trick[i].seat; bestCard = cur; }
    } else if (cur.suit === led && bestCard.suit !== led) {
      bestSeat = trick[i].seat; bestCard = cur;
    }
  }
  return bestSeat;
}

function scoreRound(s: SpadesState) {
  for (let t = 0; t < 2; t++) {
    const bid = s.teamRoundBids[t];
    const tricks = s.teamRoundTricks[t];
    if (tricks >= bid) {
      const overs = tricks - bid;
      s.teamScores[t] += bid * 10 + overs;
      s.teamBags[t] += overs;
      if (s.teamBags[t] >= 10) {
        s.teamScores[t] -= 100;
        s.teamBags[t] -= 10;
        s.log.push(`Team ${t === 0 ? 'We' : 'Them'} bag penalty: -100`);
      }
    } else {
      s.teamScores[t] -= bid * 10;
    }
  }
  s.log.push(`Round ${s.round} scored. We: ${s.teamScores[0]} | Them: ${s.teamScores[1]}`);
}

export function startNextRound(state: SpadesState): SpadesState {
  if (state.phase !== 'round-end') return state;
  const next: SpadesState = JSON.parse(JSON.stringify(state));
  const deck = shuffledDeck();
  const hands: string[][] = [[], [], [], []];
  deck.forEach((c, i) => hands[i % 4].push(c));
  hands.forEach(h => h.sort(sortCardCmp));
  next.players.forEach((p, i) => { p.hand = hands[i]; p.bid = null; p.tricksWon = 0; });
  next.teamRoundBids = [0,0];
  next.teamRoundTricks = [0,0];
  next.trick = [];
  next.ledSuit = null;
  next.spadesBroken = false;
  next.round += 1;
  next.phase = 'bidding';
  next.currentSeat = next.leadSeat = (next.round - 1) % 4;
  next.log.push(`Round ${next.round} — Place your bids.`);
  return next;
}

// ---- Bots ----
export function botBid(state: SpadesState, seat: number): number {
  // count likely tricks: A=1, K=0.7, Q=0.4 in non-spade; spades A=1, K=0.9, Q=0.7, J=0.5, others 0.25 each over 3
  const hand = state.players[seat].hand.map(getCard);
  let expected = 0;
  for (const c of hand) {
    if (c.suit === 'spades') {
      if (c.rank === 'A') expected += 1;
      else if (c.rank === 'K') expected += 0.85;
      else if (c.rank === 'Q') expected += 0.65;
      else if (c.rank === 'J') expected += 0.45;
      else expected += 0.2;
    } else {
      if (c.rank === 'A') expected += 0.85;
      else if (c.rank === 'K') expected += 0.55;
      else if (c.rank === 'Q') expected += 0.25;
    }
  }
  return Math.max(1, Math.min(7, Math.round(expected)));
}

export function botPlay(state: SpadesState, seat: number): string {
  const legal = legalCards(state, seat);
  if (legal.length === 1) return legal[0];
  const cards = legal.map(getCard);
  if (state.trick.length === 0) {
    // lead lowest non-spade if possible
    const low = [...cards].sort((a,b) => a.spadesValue - b.spadesValue);
    return low[0].id;
  }
  // try to win cheaply or dump lowest
  const led = state.ledSuit!;
  const follow = cards.filter(c => c.suit === led);
  const trick = state.trick.map(t => getCard(t.cardId));
  const currentBest = trick.reduce((best, c) => {
    if (!best) return c;
    if (best.suit === 'spades' && c.suit !== 'spades') return best;
    if (c.suit === 'spades' && best.suit !== 'spades') return c;
    if (c.suit === best.suit && c.spadesValue > best.spadesValue) return c;
    return best;
  }, null as any);
  if (follow.length) {
    const winners = follow.filter(c => c.spadesValue > currentBest.spadesValue && currentBest.suit !== 'spades');
    if (winners.length) return winners.sort((a,b) => a.spadesValue - b.spadesValue)[0].id;
    return follow.sort((a,b) => a.spadesValue - b.spadesValue)[0].id;
  }
  // cant follow; dump lowest non-spade if exists else lowest spade
  const nonSpade = cards.filter(c => c.suit !== 'spades').sort((a,b) => a.spadesValue - b.spadesValue);
  if (nonSpade.length) return nonSpade[0].id;
  return cards.sort((a,b) => a.spadesValue - b.spadesValue)[0].id;
}
