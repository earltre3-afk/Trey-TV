import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { resolveTradioViewportLayout } from "./mobileMountStrategy.ts";

const shellSource = readFileSync(new URL("./Shell.tsx", import.meta.url), "utf8");
const homeSource = readFileSync(new URL("./screens/Home.tsx", import.meta.url), "utf8");

test("mobile Tradio does not mount desktop-only rails", () => {
  assert.deepEqual(resolveTradioViewportLayout(390), {
    renderDesktopNav: false,
    renderUtilityRail: false,
  });
});

test("desktop Tradio mounts each rail only at its CSS breakpoint", () => {
  assert.deepEqual(resolveTradioViewportLayout(1023), {
    renderDesktopNav: false,
    renderUtilityRail: false,
  });
  assert.deepEqual(resolveTradioViewportLayout(1024), {
    renderDesktopNav: true,
    renderUtilityRail: false,
  });
  assert.deepEqual(resolveTradioViewportLayout(1280), {
    renderDesktopNav: true,
    renderUtilityRail: true,
  });
});

test("the mobile shell does not construct hidden desktop rails", () => {
  assert.match(shellSource, /viewportLayout\.renderDesktopNav\s*&&/);
  assert.match(shellSource, /viewportLayout\.renderUtilityRail\s*&&/);
});

test("closed panels and desktop-only controls stay out of the mobile startup chunk", () => {
  assert.doesNotMatch(shellSource, /import\s+\{\s*ModeSwitcher\s*\}\s+from/);
  assert.doesNotMatch(shellSource, /import\s+\{\s*LegalFooterLinks\s*\}\s+from/);
  assert.doesNotMatch(shellSource, /import\s+\{\s*TradioMessengerBell\s*\}\s+from/);
  assert.doesNotMatch(shellSource, /import\s+\{\s*PrescriptionRadioPopover\s*\}\s+from/);
  assert.match(shellSource, /lazy\(\(\)\s*=>\s*[\s\S]*prescribeMe\/PrescriptionRadioPopover/);
});

test("the home screen defers non-critical sections until they approach the viewport", () => {
  assert.match(homeSource, /DeferredHomeSection/);
  assert.match(homeSource, /label="Tradio Pathway"/);
  assert.match(homeSource, /label="Prescribe My Music"/);
  assert.match(homeSource, /label="Live Music Review"[\s\S]*rootMargin="400px"/);
  assert.match(homeSource, /label="Prescription Radio"[\s\S]*rootMargin="400px"/);
  assert.match(homeSource, /label="Live Song Wars PVP"[\s\S]*rootMargin="0px"/);
  assert.match(homeSource, /label="Featured Stations"/);
  assert.match(homeSource, /label="Trending Now"/);
});
