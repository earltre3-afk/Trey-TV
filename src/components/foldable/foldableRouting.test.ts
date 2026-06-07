import assert from "node:assert/strict";
import { test } from "node:test";

import { shouldUseFoldableLayout } from "./foldableRouting.ts";

test("Tradio routes use the standard app layout instead of foldable mode", () => {
  assert.equal(shouldUseFoldableLayout("/tradio"), false);
  assert.equal(shouldUseFoldableLayout("/tradio/studio"), false);
});

test("non-Tradio routes keep existing foldable layout compatibility", () => {
  assert.equal(shouldUseFoldableLayout("/trance"), true);
  assert.equal(shouldUseFoldableLayout("/games/spades"), true);
});
