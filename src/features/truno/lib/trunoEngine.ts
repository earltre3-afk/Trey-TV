import { TrunoCard } from "./cards";

export type TrunoMove =
  | { type: "play"; playerId: string; cardId: string; wildColor?: TrunoCard["color"] }
  | { type: "draw"; playerId: string }
  | { type: "keep"; playerId: string }
  | { type: "call-truno"; playerId: string };

export interface TrunoMoveEvent {
  kind: TrunoMove["type"];
  playerId: string;
  playerName: string;
  message: string;
  card?: TrunoCard;
  effect?: "skip" | "reverse" | "draw_two" | "wild" | "wild_draw_four" | "win";
  targetPlayerId?: string;
  targetPlayerName?: string;
  color?: TrunoGameState["currentColor"];
}

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
  currentColor: Exclude<TrunoCard["color"], "black" | "purple">;
  currentPlayerIndex: number;
  direction: 1 | -1;
  phase: "playing" | "ended";
  winnerId: string | null;
  message: string;
  turn: number;
  lastMoveId: string;
  trunoCalledBy: string | null;
  pendingDrawPlayCardId?: string | null;
}

const COLORS: Exclude<TrunoCard["color"], "black" | "purple">[] = [
  "red",
  "blue",
  "green",
  "yellow",
];
const BOT_NAMES = ["Aaliyah", "Marcus", "Jamal", "Zion", "Tre Earl", "Drei", "Lyric", "Sage"];

export function createTrunoGame(
  players: Array<{ id: string; name: string; isBot?: boolean }> = defaultPlayers(),
): TrunoGameState {
  const deck = shuffle(createDeck());
  const gamePlayers = players.slice(0, 8).map((p, seat) => ({
    id: p.id,
    name: p.name,
    isBot: !!p.isBot,
    seat,
    hand: deck.splice(0, 7),
  }));

  let topCard = deck.shift()!;
  while (topCard.color === "black" || topCard.color === "purple") {
    deck.push(topCard);
    topCard = deck.shift()!;
  }

  return {
    players: gamePlayers,
    deck,
    discardPile: [topCard],
    currentColor: topCard.color as TrunoGameState["currentColor"],
    currentPlayerIndex: 0,
    direction: 1,
    phase: "playing",
    winnerId: null,
    message: `${gamePlayers[0]?.name ?? "Player"} starts.`,
    turn: 1,
    lastMoveId: "start",
    trunoCalledBy: null,
    pendingDrawPlayCardId: null,
  };
}

export function isPlayableCard(card: TrunoCard, state: TrunoGameState): boolean {
  const top = topCard(state);
  if (!top || card.color === "black" || card.color === "purple") return true;
  return (
    card.color === state.currentColor ||
    card.symbol === top.symbol ||
    (card.symbol === "number" && top.symbol === "number" && card.value === top.value)
  );
}

export function applyPlayerMove(state: TrunoGameState, move: TrunoMove): TrunoGameState {
  if (state.phase === "ended") return state;
  const next = cloneState(state);
  const player = currentPlayer(next);
  if (!player || player.id !== move.playerId) {
    return { ...next, message: "Wait for your turn." };
  }

  if (move.type === "call-truno") {
    next.trunoCalledBy = player.id;
    next.message =
      player.hand.length === 1
        ? `${player.name} called TRUNO.`
        : "Call TRUNO when you have one card left.";
    next.lastMoveId = `${next.turn}:call:${player.id}`;
    return next;
  }

  if (move.type === "keep") {
    next.pendingDrawPlayCardId = null;
    next.message = `${player.name} kept the drawn card.`;
    advanceTurn(next);
    stamp(next, `keep:${player.id}`);
    return next;
  }

  if (move.type === "draw") {
    next.pendingDrawPlayCardId = null;
    if (next.deck.length === 0) recycleDiscard(next);
    const drawn = next.deck.shift();
    if (drawn) {
      player.hand.push(drawn);
      const playable = isPlayableCard(drawn, next);
      if (playable) {
        next.pendingDrawPlayCardId = drawn.id;
        next.message = `${player.name} drew a playable card: ${describeCard(drawn)}. Play or keep it?`;
        stamp(next, `draw_pending:${player.id}:${drawn.id}`);
      } else {
        next.message = `${player.name} drew a card.`;
        advanceTurn(next);
        stamp(next, `draw:${player.id}`);
      }
    } else {
      next.message = `${player.name} tried to draw but the deck was empty.`;
      advanceTurn(next);
      stamp(next, `draw:${player.id}`);
    }
    return next;
  }

  const cardIndex = player.hand.findIndex((c) => c.id === move.cardId);
  if (cardIndex < 0) return { ...next, message: "Card is no longer in your hand." };
  const card = player.hand[cardIndex];

  if (next.pendingDrawPlayCardId && next.pendingDrawPlayCardId !== card.id) {
    return { ...next, message: "You must play the drawn card or keep it." };
  }

  if (!isPlayableCard(card, next))
    return { ...next, message: "That card is not playable right now." };

  player.hand.splice(cardIndex, 1);
  next.discardPile.push(card);
  next.currentColor = normalizeColor(card, move.wildColor);
  next.trunoCalledBy = null;
  next.pendingDrawPlayCardId = null;

  if (player.hand.length === 0) {
    next.phase = "ended";
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
  while (next.phase === "playing" && currentPlayer(next)?.isBot && turns < maxTurns) {
    const result = applyBotMove(next);
    if (!result || result.state.lastMoveId === next.lastMoveId) break;
    next = result.state;
    turns++;
  }
  return next;
}

export function applyBotMove(
  state: TrunoGameState,
): { state: TrunoGameState; event: TrunoMoveEvent } | null {
  if (state.phase !== "playing") return null;
  const bot = currentPlayer(state);
  if (!bot?.isBot) return null;

  let move: TrunoMove;
  if (state.pendingDrawPlayCardId) {
    const cardId = state.pendingDrawPlayCardId;
    const card = bot.hand.find((c) => c.id === cardId);
    if (card && isPlayableCard(card, state)) {
      move = { type: "play", playerId: bot.id, cardId, wildColor: chooseBotColor(bot) };
    } else {
      move = { type: "keep", playerId: bot.id };
    }
  } else {
    const playable = bot.hand.find((card) => isPlayableCard(card, state));
    move = playable
      ? { type: "play", playerId: bot.id, cardId: playable.id, wildColor: chooseBotColor(bot) }
      : { type: "draw", playerId: bot.id };
  }

  const next = applyPlayerMove(state, move);
  return { state: next, event: describeMoveEvent(state, move, next) };
}

export function describeMoveEvent(
  before: TrunoGameState,
  move: TrunoMove,
  after: TrunoGameState,
): TrunoMoveEvent {
  const player = before.players.find((p) => p.id === move.playerId) ?? currentPlayer(before);
  const playerName = player?.name ?? "Player";
  const base = {
    kind: move.type,
    playerId: move.playerId,
    playerName,
  };

  if (move.type === "keep") {
    return {
      ...base,
      message: `${playerName} kept the drawn card.`,
    };
  }

  if (move.type === "draw") {
    const msg = after.pendingDrawPlayCardId
      ? `${playerName} drew a playable card and is deciding...`
      : `${playerName} drew a card.`;
    return {
      ...base,
      message: msg,
    };
  }

  if (move.type === "call-truno") {
    return {
      ...base,
      message: after.message || `${playerName} called TRUNO.`,
    };
  }

  const card = player?.hand.find((c) => c.id === move.cardId);
  if (!card) {
    return {
      ...base,
      message: after.message || `${playerName} played a card.`,
    };
  }

  const target = actionTarget(before, card);
  const effect = effectForCard(card, after);
  let message = `${playerName} played ${describeCard(card)}.`;
  if (effect === "skip" && target)
    message = `${playerName} played ${describeCard(card)}. ${target.name} was skipped.`;
  if (effect === "reverse") message = `${playerName} played ${describeCard(card)}. Reverse.`;
  if (effect === "draw_two" && target)
    message = `${playerName} played ${describeCard(card)}. ${target.name} drew two.`;
  if (effect === "wild_draw_four" && target)
    message = `${playerName} played ${describeCard(card)}. ${target.name} drew four.`;
  if (effect === "wild")
    message = `${playerName} played ${describeCard(card)} and chose ${after.currentColor}.`;
  if (after.phase === "ended" && after.winnerId === move.playerId)
    message = `${playerName} played ${describeCard(card)} and won the table.`;

  return {
    ...base,
    card,
    effect,
    targetPlayerId: target?.id,
    targetPlayerName: target?.name,
    color: after.currentColor,
    message,
  };
}

export function describeCard(card: TrunoCard): string {
  const color = card.color === "black" || card.color === "purple" ? "Wild" : titleCase(card.color);
  if (card.symbol === "number") return `${color} ${card.value ?? card.label}`;
  if (card.symbol === "draw_two") return `${color} Draw Two`;
  if (card.symbol === "wild_draw_four") return "Wild Draw Four";
  if (card.symbol === "reverse") return `${color} Reverse`;
  if (card.symbol === "skip") return `${color} Skip`;
  if (card.symbol === "wild") return "Wild";
  return `${color} ${card.label}`;
}

export function currentPlayer(state: TrunoGameState): TrunoPlayer | null {
  return state.players[state.currentPlayerIndex] ?? null;
}

export function topCard(state: TrunoGameState): TrunoCard | null {
  return state.discardPile[state.discardPile.length - 1] ?? null;
}

function defaultPlayers() {
  return [
    { id: "human-0", name: "You", isBot: false },
    { id: "bot-1", name: BOT_NAMES[0], isBot: true },
    { id: "bot-2", name: BOT_NAMES[1], isBot: true },
    { id: "bot-3", name: BOT_NAMES[2], isBot: true },
  ];
}

function createDeck(): TrunoCard[] {
  const deck: TrunoCard[] = [];
  for (const color of COLORS) {
    deck.push(card(color, "number", 0));
    for (let value = 1; value <= 9; value++) {
      deck.push(card(color, "number", value), card(color, "number", value));
    }
    for (const symbol of ["skip", "reverse", "draw_two"] as const) {
      deck.push(card(color, symbol), card(color, symbol));
    }
  }
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `wild-${i}`, color: "black", symbol: "wild", label: "W" });
    deck.push({
      id: `wild-draw-four-${i}`,
      color: "black",
      symbol: "wild_draw_four",
      value: 4,
      label: "+4",
    });
  }
  return deck;
}

function card(color: TrunoCard["color"], symbol: TrunoCard["symbol"], value?: number): TrunoCard {
  const label =
    symbol === "number"
      ? String(value)
      : symbol === "draw_two"
        ? "+2"
        : symbol === "skip"
          ? "S"
          : "R";
  return {
    id: `${color}-${symbol}-${value ?? "x"}-${Math.random().toString(36).slice(2, 8)}`,
    color,
    symbol,
    value,
    label,
  };
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
  if (card.symbol === "reverse") {
    state.direction = state.direction === 1 ? -1 : 1;
    state.message = `${name} reversed the table.`;
    advanceTurn(state, state.players.length === 2 ? 2 : 1);
    return;
  }
  if (card.symbol === "skip") {
    state.message = `${name} skipped the next player.`;
    advanceTurn(state, 2);
    return;
  }
  if (card.symbol === "draw_two" || card.symbol === "wild_draw_four") {
    advanceTurn(state);
    const target = currentPlayer(state);
    if (target) drawCards(state, target, card.symbol === "draw_two" ? 2 : 4);
    state.message = `${target?.name ?? "Next player"} drew ${card.symbol === "draw_two" ? "two" : "four"} cards.`;
    advanceTurn(state);
    return;
  }
  state.message = `${name} played ${card.label}.`;
  advanceTurn(state);
}

function actionTarget(state: TrunoGameState, card: TrunoCard): TrunoPlayer | null {
  if (!["skip", "draw_two", "wild_draw_four"].includes(card.symbol)) return null;
  const total = state.players.length;
  if (total === 0) return null;
  const targetIndex = (state.currentPlayerIndex + state.direction + total) % total;
  return state.players[targetIndex] ?? null;
}

function effectForCard(
  card: TrunoCard,
  after: TrunoGameState,
): TrunoMoveEvent["effect"] | undefined {
  if (after.phase === "ended") return "win";
  if (card.symbol === "skip") return "skip";
  if (card.symbol === "reverse") return "reverse";
  if (card.symbol === "draw_two") return "draw_two";
  if (card.symbol === "wild_draw_four") return "wild_draw_four";
  if (card.symbol === "wild") return "wild";
  return undefined;
}

function advanceTurn(state: TrunoGameState, steps = 1) {
  const total = state.players.length;
  for (let i = 0; i < steps; i++) {
    state.currentPlayerIndex = (state.currentPlayerIndex + state.direction + total) % total;
  }
}

function normalizeColor(
  card: TrunoCard,
  wildColor?: TrunoCard["color"],
): TrunoGameState["currentColor"] {
  if (card.color !== "black" && card.color !== "purple") return card.color;
  return COLORS.includes(wildColor as TrunoGameState["currentColor"])
    ? (wildColor as TrunoGameState["currentColor"])
    : "red";
}

function chooseBotColor(bot: TrunoPlayer): TrunoGameState["currentColor"] {
  const counts = COLORS.map((color) => ({
    color,
    n: bot.hand.filter((c) => c.color === color).length,
  }));
  counts.sort((a, b) => b.n - a.n);
  return counts[0]?.color ?? "red";
}

function stamp(state: TrunoGameState, id: string) {
  state.turn += 1;
  state.lastMoveId = `${state.turn}:${id}`;
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
