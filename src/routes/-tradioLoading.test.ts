import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const routeSource = readFileSync(new URL("./tradio.tsx", import.meta.url), "utf8");
const homeSource = readFileSync(new URL("./index.tsx", import.meta.url), "utf8");

test("the Tradio route keeps its splash separate from the heavy shell chunk", () => {
  assert.doesNotMatch(
    routeSource,
    /import\s+\{\s*TradioShell\s*\}\s+from/,
    "TradioShell must not be a static route import",
  );
  assert.match(routeSource, /lazy\(\(\)\s*=>\s*import\(/);
  assert.match(routeSource, /requestAnimationFrame/);
  assert.match(routeSource, /shellReady\s*\?/);
  assert.match(routeSource, /<Suspense\s+fallback=\{<TradioSplash\s*\/>\}>/);
});

test("homepage Tradio entrances use a document navigation boundary", () => {
  assert.doesNotMatch(homeSource, /<Link[\s\S]{0,120}to="\/tradio"/);
  assert.equal((homeSource.match(/<a[\s\S]{0,120}href="\/tradio"/g) ?? []).length, 2);
});
