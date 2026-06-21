import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const rootSource = await readFile(new URL("./__root.tsx", import.meta.url), "utf8");
const homeSource = await readFile(new URL("./index.tsx", import.meta.url), "utf8");
const tradioHeaderSource = await readFile(
  new URL("../components/tradio/TradioHeader.tsx", import.meta.url),
  "utf8",
);

test("Tradio does not boot through the heavy Trey TV app shell", () => {
  assert.match(rootSource, /const\s+MainAppProviders\s*=\s*lazy\(/);
  assert.match(rootSource, /if\s*\(isImmersiveTradio\)\s*\{[\s\S]*?<TradioRootProviders\s*\/>/);
  assert.doesNotMatch(rootSource, /GlobalMediaCastButton|TreyIWidget|GiftBurstHost/);
  assert.doesNotMatch(rootSource, /ActivityProvider|FeedProvider|MessagesProvider|GuideProvider/);
});

test("analytics are deferred away from Tradio first paint", () => {
  assert.match(rootSource, /pathname\.startsWith\("\/tradio"\)/);
  assert.doesNotMatch(rootSource, /<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js/);
});

test("Tradio stays inside the running Trey TV router", () => {
  assert.doesNotMatch(rootSource, /__treyTradioEarlyNavInstalled|trey:tradio-instant-nav/);
  assert.doesNotMatch(homeSource, /data-tradio-entry/);
  assert.match(homeSource, /to="\/tradio"/);
  assert.match(homeSource, /preload="render"/);
  assert.doesNotMatch(homeSource, /href="\/tradio"/);
  assert.match(tradioHeaderSource, /<Link\s+[\s\S]*to="\/"/);
  assert.doesNotMatch(tradioHeaderSource, /href="\/"/);
});
