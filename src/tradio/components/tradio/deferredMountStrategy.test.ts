import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { shouldMountDeferredSection } from "./deferredMountStrategy.ts";

const sectionSource = readFileSync(new URL("./DeferredHomeSection.tsx", import.meta.url), "utf8");

test("mounts a deferred section once it reaches the viewport", () => {
  assert.equal(shouldMountDeferredSection({ top: 500, bottom: 700 }, 844), true);
});

test("mounts a deferred section if a fast scroll has already passed it", () => {
  assert.equal(shouldMountDeferredSection({ top: -400, bottom: -200 }, 844), true);
});

test("keeps a section deferred while it remains below the viewport", () => {
  assert.equal(shouldMountDeferredSection({ top: 1200, bottom: 1400 }, 844), false);
});

test("installs the fast-scroll fallback before the deferred home paints", () => {
  assert.match(sectionSource, /useLayoutEffect/);
  assert.match(sectionSource, /document\.addEventListener\("scroll"[\s\S]*capture:\s*true/);
});
