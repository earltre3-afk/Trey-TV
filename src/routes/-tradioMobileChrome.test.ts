import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const mobileSource = readFileSync(
  new URL("../tradio/mobile/MobileTradioApp.tsx", import.meta.url),
  "utf8",
);
const miniPlayerSource = readFileSync(
  new URL("../components/tradio/MiniPlayer.tsx", import.meta.url),
  "utf8",
);
const bottomNavSource = readFileSync(
  new URL("../components/tradio/BottomNav.tsx", import.meta.url),
  "utf8",
);
const nowPlayingSource = readFileSync(
  new URL("../components/tradio/screens/NowPlayingScreen.tsx", import.meta.url),
  "utf8",
);
const mainProvidersSource = readFileSync(
  new URL("../components/root/MainAppProviders.tsx", import.meta.url),
  "utf8",
);
const corePlayerSource = readFileSync(
  new URL("../tradio/contexts/PlayerContext.tsx", import.meta.url),
  "utf8",
);
const platformSource = readFileSync(
  new URL("../tradio/platform/TradioPlatform.tsx", import.meta.url),
  "utf8",
);
const savedSource = readFileSync(
  new URL("../contexts/SavedContext.tsx", import.meta.url),
  "utf8",
);

test("the Tradio mini player only exists for a real selected track", () => {
  assert.match(miniPlayerSource, /if\s*\(!current\)\s*return\s+null/);
  assert.doesNotMatch(miniPlayerSource, /NOW_PLAYING/);
});

test("the Tradio player and nav use separate fixed dock layers", () => {
  assert.match(miniPlayerSource, /fixed\s+inset-x-0/);
  assert.match(miniPlayerSource, /bottom-\[var\(--tradio-nav-height\)\]/);
  assert.match(bottomNavSource, /<nav/);
  assert.match(bottomNavSource, /fixed\s+inset-x-0\s+bottom-0/);
  assert.match(bottomNavSource, /z-\[100\]/);
  assert.match(bottomNavSource, /safe-area-inset-bottom/);
  assert.match(mobileSource, /--tradio-nav-height/);
  assert.match(mobileSource, /--tradio-dock-reserve/);
});

test("the media player opens as a player surface instead of adding a Now Playing nav tab", () => {
  assert.doesNotMatch(bottomNavSource, /BarChart3|showNowPlaying|Now Playing/);
  assert.doesNotMatch(mobileSource, /<BottomNav\s+active=["']Now Playing["']/);
  assert.match(mobileSource, /<NowPlayingScreen\s+onClose=\{goHome\}\s*\/>/);
});

test("the full media player does not render a duplicate compact player dock", () => {
  assert.doesNotMatch(nowPlayingSource, /SlidersHorizontal/);
  assert.doesNotMatch(nowPlayingSource, /src=\{track\.artwork\}\s+alt=""/);
  assert.match(nowPlayingSource, /Queue lives inside the player/);
});

test("the player storage sync ignores unchanged cross-tab snapshots", () => {
  assert.match(corePlayerSource, /lastPersistedPlaybackRawRef/);
  assert.match(corePlayerSource, /hasRestoredPersistedPlaybackRef/);
  assert.match(corePlayerSource, /useState<PlaybackItem \| null>\(null\)/);
  assert.match(corePlayerSource, /if \(!hasRestoredPersistedPlaybackRef\.current\) return/);
  assert.match(corePlayerSource, /raw === lastPersistedPlaybackRawRef\.current/);
  assert.match(corePlayerSource, /event\.newValue === lastPersistedPlaybackRawRef\.current/);
});

test("recent playback history does not re-record the same wrapped track every render", () => {
  assert.match(platformSource, /currentTrackKey/);
  assert.match(platformSource, /\[currentTrackKey,\s*recordRecentlyPlayed\]/);
  assert.match(savedSource, /latest\?\.id === track\.id/);
  assert.match(savedSource, /return prev/);
});

test("the Trey TV global player clears the full mobile navigation height", () => {
  assert.match(
    mainProvidersSource,
    /bottom-\[calc\(7\.25rem_\+_env\(safe-area-inset-bottom\)\)\]/,
  );
  assert.match(mainProvidersSource, /z-\[9998\]/);
});
