import assert from "node:assert/strict";
import { test } from "node:test";

import { resolveTradioDeviceBodyClass } from "./deviceCompatibility.ts";

test("Tradio treats foldable cover dimensions as standard layout", () => {
  assert.equal(resolveTradioDeviceBodyClass(320, 620), "");
});

test("Tradio treats square foldable tablet dimensions as standard tablet compatibility", () => {
  assert.equal(resolveTradioDeviceBodyClass(700, 720), "device-tablet");
});

test("Tradio keeps standard tablet and TV compatibility classes", () => {
  assert.equal(resolveTradioDeviceBodyClass(820, 1180), "device-tablet");
  assert.equal(resolveTradioDeviceBodyClass(1920, 1080), "device-tv-cinema");
});
