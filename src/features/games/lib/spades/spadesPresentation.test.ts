import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildSpadesVisualEventKey,
  getDisplayedSpadesTrick,
} from "./spadesPresentation.ts";

test("keeps all four completed trick cards visible after the engine clears the active trick", () => {
  const completedTrick = [
    { seat: 0, cardId: "2C" },
    { seat: 1, cardId: "3C" },
    { seat: 2, cardId: "4C" },
    { seat: 3, cardId: "AC" },
  ];

  assert.deepEqual(
    getDisplayedSpadesTrick({
      trick: [],
      lastTrick: completedTrick,
    }),
    completedTrick,
  );
});

test("prefers the active trick once the next trick begins", () => {
  const activeTrick = [{ seat: 3, cardId: "KS" }];

  assert.deepEqual(
    getDisplayedSpadesTrick({
      trick: activeTrick,
      lastTrick: [{ seat: 1, cardId: "AH" }],
    }),
    activeTrick,
  );
});

test("changes the Pixi redraw key when the visible cards or winner change", () => {
  const base = {
    round: 1,
    phase: "playing",
    currentSeat: 0,
  } as const;
  const first = buildSpadesVisualEventKey(base, [{ seat: 0, cardId: "2C" }], null);
  const differentCard = buildSpadesVisualEventKey(base, [{ seat: 0, cardId: "3C" }], null);
  const winnerShown = buildSpadesVisualEventKey(base, [{ seat: 0, cardId: "2C" }], 0);

  assert.notEqual(first, differentCard);
  assert.notEqual(first, winnerShown);
});
