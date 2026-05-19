import { TrunoCard } from './cards';

export type TrunoMove =
  | { type: 'play'; playerId: string; cardId: string; wildColor?: TrunoCard['color'] }
  | { type: 'draw'; playerId: string }
  | { type: 'call-truno'; playerId: string };

export interface TrunoPlayer {
  id: string;
  name: string;
  isBot: boolean;
  seat: number;
  hand: TrunoCard[];
}

export interface TrunoGameState {
  players: TrunoPlayer[];
  deck: TrunoCard[];
  discardPile: TrunoCard[];
  currentColor: Exclude<TrunoCard['color'], 'black' | 'purple'>;
  currentPlayerIndex: number;
  direction: 1 | -1;
  phase: 'playing' | 'ended';
  winnerId: string | null;
  message: string;
  turn: number;
  lastMoveId: string;
  trunoCalledBy: string | null;
}

const COLORS: Exclude<TrunoCard['color'], 'black' | 'purple'>[] = ['red', 'blue', 'green', 'yellow'];
const BOT_NAMES = ['Aaliyah', 'Marcus', 'Jamal', 'Zion', 'Nova', 'Drei', 'Lyric', 'Sage'];

export function createTrunoGame(players: Array<{ id: string; name: string; isBot?: boolean }> = defaultPlayers()): TrunoGameState {
  const deck = shuffle(createDeck());
  const gamePlayers = players.slice(0, 8).map((p, seat) => ({
    id: p.id,
    name: p.name,
    isBot: !!p.isBot,
    seat,
    hand: deck.splice(0, 7),
  }));

  let topCard = deck.shift()!;
  while (topCard.color === 'black' || topCard.color === 'purple') {
    deck.push(topCard);
    topCard = deck.shift()!;
  }

  return {
    players: gamePlayers,
    deck,
    discardPile: [topCard],
    currentColor: topCard.color as TrunoGameState['currentColor'],
    currentPlayerIndex: 0,
    direction: 1,
    phase: 'playing',
    winnerId: null,
    message: `${gamePlayers[0]?.name ?? 'Player'} starts.`,
    turn: 1,
    lastMoveId: 'start',
    trunoCalledBy: null,
  };
}

export function isPlayableCard(card: TrunoCard, state: TrunoGameState): boolean {
  const top = topCard(state);
  if (!top || card.color === 'black' || card.color === 'purple') return true;
  return card.color === state.currentColor ||
    card.symbol === top.symbol ||
    (card.symbol === 'number' && top.symbol === 'number' && card.value === top.value);
}

export function applyPlayerMove(state: TrunoGameState, move: TrunoMove): TrunoGameState {
  if (state.phase === 'ended') return state;
  const next = cloneState(state);
  const player = currentPlayer(next);
  if (!player || player.id !== move.playerId) {
    return { ...next, message: 'Wait for your turn.' };
  }

  if (move.type === 'call-truno') {
    next.trunoCalledBy = player.id;
    next.message = player.hand.length === 1 ? `${player.name} called TRUNO.` : 'Call TRUNO when you have one card left.';
    next.lastMoveId = `${next.turn}:call:${player.id}`;
    return next;
  }

  if (move.type === 'draw') {
    drawCards(next, player, 1);
    next.message = `${player.name} drew a card.`;
    advanceTurn(next);
    stamp(next, `draw:${player.id}`);
    return next;
  }

  const cardIndex = player.hand.findIndex((c) => c.id === move.cardId);
  if (cardIndex < 0) return { ...next, message: 'Card is no longer in your hand.' };
  const card = player.hand[cardIndex];
  if (!isPlayableCard(card, next)) return { ...next, message: 'That card is not playable right now.' };

  player.hand.splice(cardIndex, 1);
  next.discardPile.push(card);
  next.currentColor = normalizeColor(card, move.wildColor);
  next.trunoCalledBy = null;

  if (player.hand.length === 0) {
    next.phase = 'ended';
    next.winnerId = player.id;
    next.message = `${player.name} wins the table.`;
    stamp(next, `win:${player.id}`);
    return next;
  }

  applyCardEffect(next, card, player.name);
  stamp(next, `play:${player.id}:${card.id}`);
  return next;
}

export function maybeRunBotTurn(state: TrunoGameState, maxTurns = 16): TrunoGameState {
  let next = cloneState(state);
  let turns = 0;
  while (next.phase === 'playing' && currentPlayer(next)?.isBot && turns < maxTurns) {
    const bot = currentPlayer(next)!;
    const playable = bot.hand.find((card) => isPlayableCard(card, next));
    next = playable
      ? applyPlayerMove(next, { type: 'play', playerId: bot.id, cardId: playable.id, wildColor: chooseBotColor(bot) })
      : applyPlayerMove(next, { type: 'draw', playerId: bot.id });
    turns++;
  }
  return next;
}

export function currentPlayer(state: TrunoGameState): TrunoPlayer | null {
  return state.players[state.currentPlayerIndex] ?? null;
}

export function topCard(state: TrunoGameState): TrunoCard | null {
  return state.discardPile[state.discardPile.length - 1] ?? null;
}

function defaultPlayers() {
  return [
    { id: 'human-0', name: 'You', isBot: false },
    { id: 'bot-1', name: BOT_NAMES[0], isBot: true },
    { id: 'bot-2', name: BOT_NAMES[1], isBot: true },
    { id: 'bot-3', name: BOT_NAMES[2], isBot: true },
  ];
}

function createDeck(): TrunoCard[] {
  const deck: TrunoCard[] = [];
  for (const color of COLORS) {
    deck.push(card(color, 'number', 0));
    for (let value = 1; value <= 9; value++) {
      deck.push(card(color, 'number', value), card(color, 'number', value));
    }
    for (const symbol of ['skip', 'reverse', 'draw_two'] as const) {
      deck.push(card(color, symbol), card(color, symbol));
    }
  }
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `wild-${i}`, color: 'black', symbol: 'wild', label: 'W' });
    deck.push({ id: `wild-draw-four-${i}`, color: 'black', symbol: 'wild_draw_four', value: 4, label: '+4' });
  }
  return deck;
}

function card(color: TrunoCard['color'], symbol: TrunoCard['symbol'], value?: number): TrunoCard {
  const label = symbol === 'number' ? String(value) : symbol === 'draw_two' ? '+2' : symbol === 'skip' ? 'S' : 'R';
  return { id: `${color}-${symbol}-${value ?? 'x'}-${Math.random().toString(36).slice(2, 8)}`, color, symbol, value, label };
}

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function cloneState(state: TrunoGameState): TrunoGameState {
  return {
    ...state,
    players: state.players.map((p) => ({ ...p, hand: p.hand.map((c) => ({ ...c })) })),
    deck: state.deck.map((c) => ({ ...c })),
    discardPile: state.discardPile.map((c) => ({ ...c })),
  };
}

function drawCards(state: TrunoGameState, player: TrunoPlayer, count: number) {
  for (let i = 0; i < count; i++) {
    if (state.deck.length === 0) recycleDiscard(state);
    const drawn = state.deck.shift();
    if (drawn) player.hand.push(drawn);
  }
}

function recycleDiscard(state: TrunoGameState) {
  const top = state.discardPile.pop();
  state.deck = shuffle(state.discardPile);
  state.discardPile = top ? [top] : [];
}

function applyCardEffect(state: TrunoGameState, card: TrunoCard, name: string) {
  if (card.symbol === 'reverse') {
    state.direction = state.direction === 1 ? -1 : 1;
    state.message = `${name} reversed the table.`;
    advanceTurn(state, state.players.length === 2 ? 2 : 1);
    return;
  }
  if (card.symbol === 'skip') {
    state.message = `${name} skipped the next player.`;
    advanceTurn(state, 2);
    return;
  }
  if (card.symbol === 'draw_two' || card.symbol === 'wild_draw_four') {
    advanceTurn(state);
    const target = currentPlayer(state);
    if (target) drawCards(state, target, card.symbol === 'draw_two' ? 2 : 4);
    state.message = `${target?.name ?? 'Next player'} drew ${card.symbol === 'draw_two' ? 'two' : 'four'} cards.`;
    advanceTurn(state);
    return;
  }
  state.message = `${name} played ${card.label}.`;
  advanceTurn(state);
}

function advanceTurn(state: TrunoGameState, steps = 1) {
  const total = state.players.length;
  for (let i = 0; i < steps; i++) {
    state.currentPlayerIndex = (state.currentPlayerIndex + state.direction + total) % total;
  }
}

function normalizeColor(card: TrunoCard, wildColor?: TrunoCard['color']): TrunoGameState['currentColor'] {
  if (card.color !== 'black' && card.color !== 'purple') return card.color;
  return COLORS.includes(wildColor as TrunoGameState['currentColor']) ? wildColor as TrunoGameState['currentColor'] : 'red';
}

function chooseBotColor(bot: TrunoPlayer): TrunoGameState['currentColor'] {
  const counts = COLORS.map((color) => ({ color, n: bot.hand.filter((c) => c.color === color).length }));
  counts.sort((a, b) => b.n - a.n);
  return counts[0]?.color ?? 'red';
}

function stamp(state: TrunoGameState, id: string) {
  state.turn += 1;
  state.lastMoveId = `${state.turn}:${id}`;
}
