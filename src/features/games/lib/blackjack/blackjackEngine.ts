import { getCard, shuffledDeck } from '@/features/games/lib/cards/cardManifest';

export type BJPhase = 'betting' | 'player' | 'dealer' | 'settled';

export interface BJState {
  phase: BJPhase;
  shoe: string[];      // remaining deck
  player: string[];
  dealer: string[];
  bet: number;
  balance: number;
  result: 'win' | 'lose' | 'push' | 'blackjack' | 'bust' | null;
  message: string;
  doubled: boolean;
}

export function newBlackjackGame(balance = 1000): BJState {
  return {
    phase: 'betting',
    shoe: buildShoe(6),
    player: [],
    dealer: [],
    bet: 0,
    balance,
    result: null,
    message: 'Place your virtual chips to begin. Free-play points only.',
    doubled: false,
  };
}

function buildShoe(decks: number): string[] {
  let shoe: string[] = [];
  for (let i = 0; i < decks; i++) shoe = shoe.concat(shuffledDeck(Date.now() + i));
  // shuffle combined
  for (let i = shoe.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
  }
  return shoe;
}

export function handValue(hand: string[]): { total: number; soft: boolean } {
  let total = 0, aces = 0;
  for (const id of hand) {
    const c = getCard(id);
    total += c.blackjackValue;
    if (c.rank === 'A') aces += 1;
  }
  let soft = aces > 0 && total <= 21;
  while (total > 21 && aces > 0) { total -= 10; aces -= 1; }
  soft = aces > 0 && total <= 21;
  return { total, soft };
}

export function placeBet(state: BJState, bet: number): BJState {
  if (state.phase !== 'betting') return state;
  if (bet <= 0 || bet > state.balance) return state;
  const next: BJState = { ...state, shoe: [...state.shoe] };
  if (next.shoe.length < 20) next.shoe = buildShoe(6);
  next.bet = bet;
  next.balance -= bet;
  next.player = [next.shoe.pop()!, next.shoe.pop()!];
  next.dealer = [next.shoe.pop()!, next.shoe.pop()!];
  next.phase = 'player';
  next.result = null;
  next.doubled = false;
  const pv = handValue(next.player).total;
  const dv = handValue(next.dealer).total;
  if (pv === 21 && dv === 21) { next.phase = 'settled'; next.result = 'push'; next.balance += next.bet; next.message = 'Push — both blackjack.'; }
  else if (pv === 21) { next.phase = 'settled'; next.result = 'blackjack'; next.balance += Math.floor(next.bet * 2.5); next.message = 'Blackjack! Pays 3 to 2.'; }
  else if (dv === 21) { next.phase = 'settled'; next.result = 'lose'; next.message = 'Dealer blackjack.'; }
  else { next.message = 'Your move. Hit, Stand, or Double.'; }
  return next;
}

export function hit(state: BJState): BJState {
  if (state.phase !== 'player') return state;
  const next: BJState = { ...state, shoe: [...state.shoe], player: [...state.player] };
  next.player.push(next.shoe.pop()!);
  const { total } = handValue(next.player);
  if (total > 21) {
    next.phase = 'settled';
    next.result = 'bust';
    next.message = 'Bust.';
  } else if (total === 21) {
    return stand(next);
  } else {
    next.message = `Hand: ${total}. Hit or Stand?`;
  }
  return next;
}

export function doubleDown(state: BJState): BJState {
  if (state.phase !== 'player' || state.player.length !== 2 || state.balance < state.bet) return state;
  const next: BJState = { ...state, balance: state.balance - state.bet, bet: state.bet * 2, doubled: true, shoe: [...state.shoe], player: [...state.player] };
  next.player.push(next.shoe.pop()!);
  const { total } = handValue(next.player);
  if (total > 21) { next.phase = 'settled'; next.result = 'bust'; next.message = 'Doubled and busted.'; return next; }
  return stand(next);
}

export function stand(state: BJState): BJState {
  if (state.phase !== 'player') return state;
  const next: BJState = { ...state, shoe: [...state.shoe], dealer: [...state.dealer] };
  next.phase = 'dealer';
  // dealer hits to 17 (stand soft 17)
  while (true) {
    const { total, soft } = handValue(next.dealer);
    if (total >= 17 && !(total === 17 && soft && false)) break;
    next.dealer.push(next.shoe.pop()!);
    if (next.dealer.length > 11) break;
  }
  const pv = handValue(next.player).total;
  const dv = handValue(next.dealer).total;
  next.phase = 'settled';
  if (dv > 21 || pv > dv) { next.result = 'win'; next.balance += next.bet * 2; next.message = `You win with ${pv}!`; }
  else if (pv === dv) { next.result = 'push'; next.balance += next.bet; next.message = `Push at ${pv}.`; }
  else { next.result = 'lose'; next.message = `Dealer wins with ${dv}.`; }
  return next;
}

export function nextHand(state: BJState): BJState {
  return { ...state, phase: 'betting', player: [], dealer: [], bet: 0, result: null, doubled: false, message: 'Place your virtual chips for the next hand.' };
}
