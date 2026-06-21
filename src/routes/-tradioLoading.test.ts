import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const routeSource = readFileSync(new URL("./tradio.tsx", import.meta.url), "utf8");
const homeSource = readFileSync(new URL("./index.tsx", import.meta.url), "utf8");
const platformSource = readFileSync(
  new URL("../tradio/platform/TradioPlatform.tsx", import.meta.url),
  "utf8",
);
const providerSource = readFileSync(
  new URL("../tradio/platform/TradioProvider.tsx", import.meta.url),
  "utf8",
);
const dataHookSource = readFileSync(
  new URL("../tradio/useTradioData.ts", import.meta.url),
  "utf8",
);
const mobileSource = readFileSync(
  new URL("../tradio/mobile/MobileTradioApp.tsx", import.meta.url),
  "utf8",
);
const tvSource = readFileSync(
  new URL("../tradio/tv/TVTradioApp.tsx", import.meta.url),
  "utf8",
);
const legacyShellPath = new URL(
  "../tradio/components/tradio/Shell.tsx",
  import.meta.url,
);
const appHeaderSource = readFileSync(
  new URL("../components/layout/AppHeader.tsx", import.meta.url),
  "utf8",
);
const desktopNavSource = readFileSync(
  new URL("../components/layout/DesktopTopNav.tsx", import.meta.url),
  "utf8",
);
const sideMenuSource = readFileSync(
  new URL("../components/layout/SideMenu.tsx", import.meta.url),
  "utf8",
);
const aiBallSource = readFileSync(
  new URL("../components/tradio/TradioAIBall.tsx", import.meta.url),
  "utf8",
);
const viteConfigSource = readFileSync(new URL("../../vite.config.ts", import.meta.url), "utf8");

test("the existing /tradio route mounts the unified platform directly", () => {
  assert.match(routeSource, /import\s+TradioPlatform\s+from/);
  assert.match(routeSource, /<TradioPlatform\s+deviceMode=\{device\}\s*\/>/);
  assert.match(routeSource, /component:\s*TradioRoute/);
  assert.doesNotMatch(routeSource, /lazy\(|Suspense|TradioShell|cover screen/);
  assert.equal(existsSync(legacyShellPath), false);
});

test("the mobile presentation is immediately available while TV stays split", () => {
  assert.match(
    platformSource,
    /import\s+MobileTradioApp\s+from\s+['"]@\/tradio\/mobile\/MobileTradioApp['"]/,
  );
  assert.match(
    platformSource,
    /const\s+TVTradioApp\s*=\s*lazy\(\(\)\s*=>\s*import\(['"]@\/tradio\/tv\/TVTradioApp['"]\)\)/,
  );
  assert.doesNotMatch(platformSource, /const\s+MobileTradioApp\s*=\s*lazy/);
  assert.doesNotMatch(mobileSource, /TVTradioApp/);
  assert.doesNotMatch(tvSource, /MobileTradioApp/);
});

test("mobile Tradio never shows a monochrome route cover", () => {
  assert.doesNotMatch(platformSource, /useState<DeviceMode \| null>/);
  assert.doesNotMatch(platformSource, /aria-label=["']Preparing Tradio["']/);
  assert.doesNotMatch(platformSource, />Tradio<\/span>/);
  assert.match(platformSource, /mode\s*!==\s*['"]tv['"]\s*\?\s*<MobileTradioApp\s*\/>/);
});

test("mobile and TV startup bundles contain only their home surfaces", () => {
  assert.match(mobileSource, /import\s+HomeScreen\s+from/);
  assert.match(mobileSource, /const\s+PlaylistDetailScreen\s*=\s*lazy\(/);
  assert.match(mobileSource, /const\s+SongWarsScreen\s*=\s*lazy\(/);
  assert.match(mobileSource, /<Suspense/);

  assert.match(tvSource, /import\s+HomeScreen\s+from/);
  assert.match(tvSource, /const\s+BrowseScreen\s*=\s*lazy\(/);
  assert.match(tvSource, /const\s+TVSongWarsScreen\s*=\s*lazy\(/);
  assert.match(tvSource, /<Suspense/);
});

test("TV mode can be supplied by the Trey TV APK shell or TV user agent", () => {
  assert.match(platformSource, /__TREY_TV_DEVICE_MODE__/);
  assert.match(platformSource, /Android TV\|GoogleTV\|SMART-TV/);
  assert.match(platformSource, /requested === 'tv'/);
});

test("the shared provider layer sits above whichever device shell is selected", () => {
  assert.match(platformSource, /<TradioProvider>/);
  assert.match(providerSource, /<SavedProvider>/);
  assert.match(providerSource, /<PlaylistProvider>/);
  assert.match(providerSource, /<TradioDataProvider>/);
  assert.match(providerSource, /<SongWarsProvider>/);
  assert.match(platformSource, /<PlaybackActivityBridge\s*\/>/);
  assert.match(platformSource, /<MobileTradioApp\s*\/>/);
  assert.match(platformSource, /<TVTradioApp\s*\/>/);
});

test("Tradio mock data is available synchronously on first render", () => {
  assert.match(dataHookSource, /getInitialTradioData/);
  assert.match(dataHookSource, /loading:\s*!initialData/);
});

test("homepage Tradio entrances preload and use client navigation", () => {
  assert.match(homeSource, /import\s*\{\s*preloadTradioPresentation\s*\}\s*from/);
  assert.match(homeSource, /void\s+preloadTradioPresentation\(\)/);
  assert.equal((homeSource.match(/to="\/tradio"/g) ?? []).length, 2);
  assert.equal((homeSource.match(/preload="render"/g) ?? []).length >= 2, true);
  assert.doesNotMatch(homeSource, /href="\/tradio"/);
});

test("signed-in app navigation preloads Tradio before click", () => {
  assert.match(
    appHeaderSource,
    /<Link[\s\S]{0,220}to="\/tradio"[\s\S]{0,220}preload="render"[\s\S]{0,900}\{t\.label\}/,
  );
  assert.match(
    desktopNavSource,
    /<Link[\s\S]{0,180}to=\{l\.to\}[\s\S]{0,180}preload=\{l\.to === ["']\/tradio["'] \? ["']render["'] : ["']intent["']\}[\s\S]{0,220}\{content\}/,
  );
  assert.match(
    sideMenuSource,
    /preload=\{i\.to === ["']\/tradio["'] \? ["']render["'] : ["']intent["']\}/,
  );
});

test("the route preload warms only the selected device presentation", () => {
  assert.match(routeSource, /loader:\s*\(\{ location \}\)\s*=>\s*preloadTradioPresentation/);
  assert.match(routeSource, /preloadStaleTime:\s*Infinity/);
  assert.match(routeSource, /staleTime:\s*Infinity/);
  assert.doesNotMatch(viteConfigSource, /pages:\s*\[\s*\{\s*path:\s*"\/tradio"/);
});

test("the decorative AI orb does not create a nested button hydration repair", () => {
  assert.match(aiBallSource, /const\s+Component\s*=\s*onClick\s*\?\s*['"]button['"]\s*:\s*['"]span['"]/);
  assert.match(aiBallSource, /<Component/);
});
