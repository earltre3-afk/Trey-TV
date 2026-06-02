import assert from "node:assert/strict";
import test from "node:test";
import {
  applyBotMove,
  createTrunoGame,
  currentPlayer,
  describeMoveEvent,
  TrunoMove,
} from "./trunoEngine";

test("applyBotMove resolves one visible bot action at a time", () => {
  const state = createTrunoGame([
    { id: "human", name: "You", isBot: false },
    { id: "bot-1", name: "Maya", isBot: true },
    { id: "bot-2", name: "Zay", isBot: true },
  ]);
  state.currentPlayerIndex = 1;
  state.currentColor = "red";
  state.discardPile = [{ id: "top-red-5", color: "red", symbol: "number", value: 5, label: "5" }];
  state.players[1].hand = [
    { id: "maya-red-7", color: "red", symbol: "number", value: 7, label: "7" },
    { id: "maya-blue-8", color: "blue", symbol: "number", value: 8, label: "8" },
  ];
  state.players[2].hand = [
    { id: "zay-red-8", color: "red", symbol: "number", value: 8, label: "8" },
  ];

  const result = applyBotMove(state);

  assert.ok(result);
  assert.equal(result.event.playerName, "Maya");
  assert.equal(result.state.discardPile.at(-1)?.id, "maya-red-7");
  assert.equal(result.state.players[1].hand.length, 1);
  assert.equal(currentPlayer(result.state)?.id, "bot-2");
  assert.equal(result.state.players[2].hand.length, 1);
});

test("describeMoveEvent includes action-card target details", () => {
  const before = createTrunoGame([
    { id: "human", name: "You", isBot: false },
    { id: "bot-1", name: "Maya", isBot: true },
    { id: "bot-2", name: "Zay", isBot: true },
  ]);
  before.currentColor = "blue";
  before.discardPile = [
    { id: "top-blue-5", color: "blue", symbol: "number", value: 5, label: "5" },
  ];
  before.players[0].hand = [{ id: "skip-card", color: "blue", symbol: "skip", label: "S" }];
  const move: TrunoMove = { type: "play", playerId: "human", cardId: "skip-card" };
  const after = {
    ...before,
    currentPlayerIndex: 2,
    discardPile: [...before.discardPile, before.players[0].hand[0]],
    lastMoveId: "2:play:human:skip-card",
    message: "You skipped the next player.",
    players: before.players.map((player, index) =>
      index === 0 ? { ...player, hand: [] } : player,
    ),
    turn: 2,
  };

  const event = describeMoveEvent(before, move, after);

  assert.equal(event.effect, "skip");
  assert.equal(event.targetPlayerId, "bot-1");
  assert.match(event.message, /Maya was skipped/);
});
