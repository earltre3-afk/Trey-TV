import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const rootSource = await readFile(new URL("./__root.tsx", import.meta.url), "utf8");
const homeSource = await readFile(new URL("./index.tsx", import.meta.url), "utf8");

test("does not mount the floating cast-to-device control on every page", () => {
  assert.doesNotMatch(rootSource, /GlobalMediaCastButton/);
});

test("Tradio uses the same standard router navigation path as Trance", () => {
  assert.doesNotMatch(rootSource, /__treyTradioEarlyNavInstalled|trey:tradio-instant-nav/);
  assert.doesNotMatch(homeSource, /data-tradio-entry/);
  assert.match(homeSource, /<Link[\s\S]*?to="\/tradio"/);
});
