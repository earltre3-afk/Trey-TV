// ─────────────────────────────────────────────────────────────────────────────
// Pluto TV integration — LOCAL DEV ONLY.
//
// Pluto's API is undocumented and unstable. Endpoints used here are
// reverse-engineered from community sources and may break without notice.
// Streaming Pluto content from a third-party app violates their ToS — DO NOT
// deploy this. The integration is gated on PLUTO_ENABLED=1 (set in .env.local).
//
// Three endpoints, all under /api/pluto/*:
//   GET /api/pluto/catalog         — debug; lists cached channels/VOD
//   GET /api/pluto/player?...      — returns iframe HTML w/ hls.js + <video>
//   GET /api/pluto/m3u8?src=...    — CORS proxy for the master/variant manifests
// ─────────────────────────────────────────────────────────────────────────────
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

type PlutoChannel = {
  _id: string;
  name: string;
  slug?: string;
  summary?: string;
  number?: number;
  logo?: string;
};

type PlutoVodItem = {
  _id: string;
  name: string;
  slug?: string;
  summary?: string;
  poster?: string;
  duration?: number;
  category?: string;
};

type PlutoRawChannel = {
  _id: string;
  name: string;
  slug?: string;
  summary?: string;
  number?: number;
  category?: string;
  logo?: { path?: string };
  featuredImage?: { path?: string };
  colorLogoPNG?: { path?: string };
};

type PlutoRawCategory = {
  _id: string;
  name?: string;
  items?: PlutoRawVodItem[];
};

type PlutoRawVodItem = {
  _id: string;
  name?: string;
  slug?: string;
  summary?: string;
  description?: string;
  duration?: number;
  covers?: Array<{ url?: string; aspectRatio?: string }>;
  type?: string;
};

const CATALOG_TTL_MS = 60 * 60 * 1000; // 1 hour

// The legacy "service-stitcher.clusters.pluto.tv/v1/stitch/embed/..." path now
// returns a "ptv_takedownslates_all" slate for EVERY channel. The web app moved
// to the regional stitcher host advertised by boot under servers.stitcher, using
// the "/v2/stitch/hls/channel/{id}/master.m3u8" path with the session jwt. We
// read the host from boot at runtime and fall back to the us-east-1 host.
const DEFAULT_STITCHER_BASE = "https://cfd-v4-service-channel-stitcher-use1-1.prd.pluto.tv";

const PLUTO_HOST_ALLOWLIST = new Set([
  "service-stitcher.clusters.pluto.tv",
  "siloh-fkp.prd.fovea.cbsi.video",
  "siloh-fastly.prd.fovea.cbsi.video",
  "service-vod.clusters.pluto.tv",
  "service-channels.clusters.pluto.tv",
  "api.pluto.tv",
]);

// boot's servers.stitcher is region-specific (e.g. ...-use1-1, ...-usw2-1).
// Allow any of Pluto's prd stitcher clusters rather than enumerating each.
function isAllowedManifestHost(hostname: string): boolean {
  if (PLUTO_HOST_ALLOWLIST.has(hostname)) return true;
  return /\.prd\.pluto\.tv$/.test(hostname);
}

const channelCache: { ts: number; items: PlutoChannel[] } = { ts: 0, items: [] };
const vodCache: { ts: number; items: PlutoVodItem[] } = { ts: 0, items: [] };
const bootCache: {
  ts: number;
  stitcherParams: string;
  sessionID: string;
  sessionToken: string;
  stitcherBase: string;
} = {
  ts: 0,
  stitcherParams: "",
  sessionID: "",
  sessionToken: "",
  stitcherBase: DEFAULT_STITCHER_BASE,
};

// ── On-disk slate cache ─────────────────────────────────────────────────────
// HMR resets module-level state in dev. Persisting to .cache/pluto-slates.json
// (gitignored) means we don't re-probe known-bad channels on every reload.
const SLATE_CACHE_PATH = join(process.cwd(), ".cache", "pluto-slates.json");
// Bump when the streaming recipe changes — slate markings made against an old
// endpoint are meaningless once the URL/host/path changes. v2: switched live
// channels to the boot-advertised /v2/stitch/hls/channel host (was v1 /embed,
// which slated every channel).
const SLATE_CACHE_VERSION = 2;
let slatePersistTimer: NodeJS.Timeout | null = null;

function loadSlateCacheFromDisk(): { slates: Set<string>; playable: Set<string> } {
  const empty = { slates: new Set<string>(), playable: new Set<string>() };
  try {
    const raw = readFileSync(SLATE_CACHE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as {
      version?: number;
      channels?: string[];
      playable?: string[];
    };
    if (parsed.version !== SLATE_CACHE_VERSION) {
      console.log("[pluto] slate cache version changed; ignoring stale markings");
      return empty;
    }
    const slates = new Set(parsed.channels ?? []);
    const playable = new Set(parsed.playable ?? []);
    if (slates.size || playable.size) {
      console.log(
        `[pluto] loaded ${slates.size} unplayable + ${playable.size} playable channels from disk`,
      );
    }
    return { slates, playable };
  } catch {
    return empty;
  }
}

function schedulePersistSlate() {
  if (slatePersistTimer) return;
  slatePersistTimer = setTimeout(() => {
    slatePersistTimer = null;
    try {
      mkdirSync(dirname(SLATE_CACHE_PATH), { recursive: true });
      writeFileSync(
        SLATE_CACHE_PATH,
        JSON.stringify(
          {
            version: SLATE_CACHE_VERSION,
            channels: [...slateChannels],
            playable: [...playableChannels],
            updatedAt: new Date().toISOString(),
          },
          null,
          2,
        ),
      );
    } catch (err) {
      console.warn("[pluto] could not persist slate cache", err);
    }
  }, 1000); // debounce — many writes during pre-warm coalesce into one
}

function isEnabled(): boolean {
  return process.env.PLUTO_ENABLED === "1";
}

function randomUuid(): string {
  // Pluto accepts any UUIDv4-shaped string for session params.
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

async function ensureBoot(): Promise<void> {
  if (bootCache.stitcherParams && Date.now() - bootCache.ts < CATALOG_TTL_MS) return;
  const deviceId = randomUuid();
  const bootUrl = `https://boot.pluto.tv/v4/start?appName=web&appVersion=9.13.0&deviceType=web&deviceMake=Chrome&deviceModel=web&deviceVersion=131&deviceId=${deviceId}&clientID=${deviceId}&clientModelNumber=1&serverSideAds=true`;
  try {
    const res = await fetch(bootUrl, {
      headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
    });
    if (!res.ok) {
      console.warn(`[pluto] boot HTTP ${res.status}; falling back to synthesized params`);
      bootCache.stitcherParams = synthesizedParams();
      bootCache.stitcherBase = DEFAULT_STITCHER_BASE;
      bootCache.ts = Date.now();
      return;
    }
    const data = (await res.json()) as {
      stitcherParams?: string;
      sessionToken?: string;
      session?: { sessionID?: string; activeRegion?: string };
      servers?: { stitcher?: string };
    };
    bootCache.ts = Date.now();
    bootCache.stitcherParams = data.stitcherParams ?? synthesizedParams();
    bootCache.sessionID = data.session?.sessionID ?? "";
    bootCache.sessionToken = data.sessionToken ?? "";
    bootCache.stitcherBase = data.servers?.stitcher?.replace(/\/$/, "") || DEFAULT_STITCHER_BASE;
    console.log(
      `[pluto] boot ok; region=${data.session?.activeRegion} sessionID=${bootCache.sessionID.slice(0, 8)}… token=${bootCache.sessionToken ? "yes" : "no"} stitcher=${new URL(bootCache.stitcherBase).hostname}`,
    );
  } catch (err) {
    console.error("[pluto] boot failed", err);
    bootCache.stitcherParams = synthesizedParams();
    bootCache.stitcherBase = DEFAULT_STITCHER_BASE;
    bootCache.ts = Date.now();
  }
}

async function getStitcherBase(): Promise<string> {
  await ensureBoot();
  return bootCache.stitcherBase || DEFAULT_STITCHER_BASE;
}

async function getStitcherParams(): Promise<string> {
  await ensureBoot();
  return bootCache.stitcherParams || synthesizedParams();
}

async function getSessionToken(): Promise<string> {
  await ensureBoot();
  return bootCache.sessionToken;
}

function synthesizedParams(): string {
  const p = new URLSearchParams({
    advertisingId: "",
    appName: "web",
    appVersion: "9.13.0-d5e0e93",
    clientTime: new Date().toISOString(),
    deviceDNT: "0",
    deviceId: randomUuid(),
    deviceLat: "40.7128",
    deviceLon: "-74.0060",
    deviceMake: "Chrome",
    deviceModel: "web",
    deviceType: "web",
    deviceVersion: "131.0.0.0",
    sid: randomUuid(),
    userId: "",
    serverSideAds: "true",
  });
  return p.toString();
}

async function buildChannelStreamUrl(channelId: string): Promise<string> {
  const base = await getStitcherBase();
  const params = await getStitcherParams();
  const token = await getSessionToken();
  // The v2 channel stitcher requires the boot-issued JWT; without it (and on the
  // old v1 /embed path) every channel returns the "takedownslates_all" slate.
  const tokenSuffix = token ? `&jwt=${encodeURIComponent(token)}` : "";
  return `${base}/v2/stitch/hls/channel/${channelId}/master.m3u8?${params}${tokenSuffix}`;
}

async function buildVodStreamUrl(episodeId: string): Promise<string> {
  const base = await getStitcherBase();
  const params = await getStitcherParams();
  const token = await getSessionToken();
  // VOD stitcher requires the boot-issued JWT or returns 401.
  const tokenSuffix = token ? `&jwt=${encodeURIComponent(token)}` : "";
  return `${base}/v2/stitch/hls/episode/${episodeId}/master.m3u8?${params}${tokenSuffix}`;
}

// Channels in non-US categories return regional takedown slates ("Encerramos
// por aqui" — Pluto Brazil shutdown; "iEso fue todo!" — Pluto Latino). Filter
// them by category first (most reliable), then by name/slug keywords for the
// stragglers that aren't tagged.
const RESTRICTED_CATEGORIES = new Set(["En Español", "Latino", "Português", "Brasil"]);
const RESTRICTED_PATTERNS = [
  /latino/i,
  /espa[nñ]ol/i,
  /telenovela/i,
  /\bnovelas\b/i,
  /\bbrasil/i,
  /portugu[eê]s/i,
];

function isLikelyRestricted(c: PlutoRawChannel & { category?: string }): boolean {
  if (c.category && RESTRICTED_CATEGORIES.has(c.category)) return true;
  const blob = `${c.name ?? ""} ${c.slug ?? ""} ${c.summary ?? ""}`;
  return RESTRICTED_PATTERNS.some((re) => re.test(blob));
}

async function fetchPlutoChannels(): Promise<PlutoChannel[]> {
  if (channelCache.items.length && Date.now() - channelCache.ts < CATALOG_TTL_MS) {
    return channelCache.items;
  }
  try {
    // ?country=US biases the server-side selection toward US-licensed content.
    const res = await fetch("https://api.pluto.tv/v2/channels.json?country=US", {
      headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) {
      console.warn(`[pluto] channels.json HTTP ${res.status}`);
      return channelCache.items; // serve stale on failure
    }
    const raw = (await res.json()) as PlutoRawChannel[];
    const items: PlutoChannel[] = raw
      .filter((c) => c?._id && c?.name && c.number !== 0) // channel 0 is "fake" preview
      .filter((c) => !isLikelyRestricted(c))
      .map((c) => ({
        _id: c._id,
        name: c.name,
        slug: c.slug,
        summary: c.summary,
        number: c.number,
        logo: c.colorLogoPNG?.path ?? c.logo?.path ?? c.featuredImage?.path,
      }));
    channelCache.ts = Date.now();
    channelCache.items = items;
    console.log(`[pluto] loaded ${items.length} channels (filtered from ${raw.length})`);
    return items;
  } catch (err) {
    console.error("[pluto] failed to fetch channels", err);
    return channelCache.items;
  }
}

async function fetchPlutoVod(): Promise<PlutoVodItem[]> {
  if (vodCache.items.length && Date.now() - vodCache.ts < CATALOG_TTL_MS) {
    return vodCache.items;
  }
  try {
    // VOD categories endpoint — pass boot's stitcherParams so Pluto serves
    // region-appropriate VOD library and so the response shape stays stable.
    const params = await getStitcherParams();
    const token = await getSessionToken();
    const headers: Record<string, string> = {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(
      `https://service-vod.clusters.pluto.tv/v4/vod/categories?includeItems=true&${params}`,
      {
        headers,
      },
    );
    if (!res.ok) {
      console.warn(`[pluto] vod/categories HTTP ${res.status}`);
      return vodCache.items;
    }
    const json = await res.json();
    // Pluto's VOD endpoint sometimes returns `[...]`, sometimes
    // `{ categories: [...] }`. Normalize defensively.
    const raw = (Array.isArray(json) ? json : (json?.categories ?? [])) as PlutoRawCategory[];
    const items: PlutoVodItem[] = [];
    for (const cat of raw) {
      for (const it of cat.items ?? []) {
        if (!it?._id || !it?.name) continue;
        if (it.type && it.type !== "movie" && it.type !== "series") continue;
        items.push({
          _id: it._id,
          name: it.name,
          slug: it.slug,
          summary: it.summary ?? it.description,
          duration: it.duration,
          category: cat.name,
          poster: it.covers?.find((c) => c.aspectRatio === "16:9")?.url ?? it.covers?.[0]?.url,
        });
      }
    }
    vodCache.ts = Date.now();
    vodCache.items = items;
    return items;
  } catch (err) {
    console.error("[pluto] failed to fetch VOD", err);
    return vodCache.items;
  }
}

function hashString(input: string): number {
  // Tiny non-cryptographic hash for deterministic mapping.
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Channels that don't play: regional-takedown slates OR empty playlists (no
// segments). Detected at runtime by probing the manifest and remembered so we
// never pick them again. The complementary `playableChannels` set lets
// pickChannelFor fall back to a known-good channel instead of an unprobed one.
// Both are hydrated from disk so HMR doesn't reset them.
const { slates: slateChannels, playable: playableChannels } = loadSlateCacheFromDisk();

function markSlate(channelId: string, channelName: string): void {
  playableChannels.delete(channelId);
  if (slateChannels.has(channelId)) return;
  slateChannels.add(channelId);
  console.log(`[pluto] marked unplayable channel: ${channelName}`);
  schedulePersistSlate();
}

function markPlayable(channelId: string): void {
  slateChannels.delete(channelId);
  if (playableChannels.has(channelId)) return;
  playableChannels.add(channelId);
  schedulePersistSlate();
}

// ── Pre-warm ────────────────────────────────────────────────────────────────
// On first run after enable, probe every channel in the background and record
// which are playable vs unplayable. Only ~12% of the global channels.json is
// actually streamable via the web stitcher (the rest return empty playlists),
// so probing the full list is what makes the channel lists and pickChannelFor
// reliable. Runs once per server process; the disk cache carries the result
// across restarts.
let prewarmStarted = false;

async function maybePrewarmSlateCache(): Promise<void> {
  if (prewarmStarted) return;
  prewarmStarted = true;
  const channels = await fetchPlutoChannels();
  if (!channels.length) {
    prewarmStarted = false; // allow retry once channels are loaded
    return;
  }
  // Skip channels we've already classified (playable or unplayable).
  const targets = channels.filter((c) => !slateChannels.has(c._id) && !playableChannels.has(c._id));
  if (!targets.length) {
    console.log(
      `[pluto] pre-warm skipped — ${playableChannels.size} playable / ${slateChannels.size} unplayable cached`,
    );
    return;
  }
  console.log(`[pluto] pre-warming: probing ${targets.length} channels (concurrency 6)…`);
  let playable = 0;
  let slates = 0;
  const concurrency = 6;
  let cursor = 0;
  async function worker(): Promise<void> {
    while (cursor < targets.length) {
      const c = targets[cursor++];
      if (slateChannels.has(c._id) || playableChannels.has(c._id)) continue;
      try {
        if (await probeChannelPlayable(c._id)) {
          markPlayable(c._id);
          playable++;
        } else {
          markSlate(c._id, c.name);
          slates++;
        }
      } catch {
        // ignore — leave un-marked so a real request can re-evaluate
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  console.log(
    `[pluto] pre-warm done: ${playableChannels.size} playable, ${slateChannels.size} unplayable cached`,
  );
}

async function probeChannelPlayable(channelId: string): Promise<boolean> {
  try {
    const url = await buildChannelStreamUrl(channelId);
    const masterRes = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0", Accept: "application/vnd.apple.mpegurl" },
    });
    if (!masterRes.ok) return false;
    const masterBody = await masterRes.text();
    if (masterBody.length < 800) return false;
    if (!/#EXT-X-STREAM-INF/.test(masterBody)) return false;
    if (/where-watch|takedownslates|geo[-_]?block/i.test(masterBody)) return false;

    // Master alone isn't enough — geo-block slates ARE valid HLS streams
    // pointing to the "ptv_takedownslates_..." clip. Fetch the first variant
    // playlist and look for the slate clip in segment URIs.
    const variantUriMatch = masterBody
      .split(/\r?\n/)
      .find((line) => line && !line.startsWith("#") && /\.m3u8/.test(line));
    if (!variantUriMatch) return true; // odd shape; accept by default
    const variant = new URL(variantUriMatch, url);
    // v2 variant playlists don't inherit the master's jwt and 401 without it,
    // which would otherwise make every channel look like a slate.
    if (!variant.searchParams.has("jwt")) {
      const token = await getSessionToken();
      if (token) variant.searchParams.set("jwt", token);
    }
    const variantUrl = variant.toString();
    const variantRes = await fetch(variantUrl, {
      headers: { "User-Agent": "Mozilla/5.0", Accept: "application/vnd.apple.mpegurl" },
    });
    if (!variantRes.ok) return false;
    const variantBody = await variantRes.text();
    if (/takedownslates|where-watch|geo[-_]?block/i.test(variantBody)) return false;
    // Some channels return a valid-but-empty playlist (headers + EXT-X-ENDLIST,
    // no #EXTINF segments). hls.js fails these with "No Segments found in
    // Playlist" → the player shows "try a different channel". Reject them so
    // pickChannelFor skips them and they're filtered from the channel list.
    if (!/#EXTINF/.test(variantBody)) return false;
    return true;
  } catch {
    return false;
  }
}

async function pickChannelFor(trayChannelId: string): Promise<PlutoChannel | null> {
  const channels = await fetchPlutoChannels();
  if (!channels.length) return null;
  const start = hashString(trayChannelId) % channels.length;

  // Fast path: if we already know a channel at/after the hash anchor is
  // playable, use it without probing (deterministic per trayChannelId).
  for (let offset = 0; offset < channels.length; offset++) {
    const candidate = channels[(start + offset) % channels.length];
    if (playableChannels.has(candidate._id)) {
      return candidate;
    }
    if (!slateChannels.has(candidate._id)) break; // hit an unknown — probe below
  }

  // Walk the ring; skip already-classified, probe each unknown candidate. Up to
  // 30 probes per request (already-classified channels are free to skip).
  const max = Math.min(channels.length, 30);
  for (let offset = 0; offset < max; offset++) {
    const candidate = channels[(start + offset) % channels.length];
    if (slateChannels.has(candidate._id)) continue;
    if (playableChannels.has(candidate._id)) {
      return candidate;
    }
    if (await probeChannelPlayable(candidate._id)) {
      markPlayable(candidate._id);
      console.log(`[pluto] playable channel for "${trayChannelId}": ${candidate.name}`);
      return candidate;
    }
    markSlate(candidate._id, candidate.name);
  }
  // No clean candidate after `max` probes — fall back to any known-playable
  // channel (deterministic by hash) so the player never loads a dead stream.
  const playableIds = channels.filter((c) => playableChannels.has(c._id));
  if (playableIds.length) {
    return playableIds[hashString(trayChannelId) % playableIds.length];
  }
  return null;
}

async function pickVodFor(episodeId: string): Promise<PlutoVodItem | null> {
  const vod = await fetchPlutoVod();
  if (!vod.length) return null;
  return vod[hashString(episodeId) % vod.length];
}

// ── Manifest proxy ──────────────────────────────────────────────────────────
function rewriteManifest(text: string, manifestUrl: string, proxyBase: string): string {
  const base = new URL(manifestUrl);
  const lines = text.split(/\r?\n/);
  const out: string[] = [];

  const proxify = (absUrl: string) =>
    `${proxyBase}/api/pluto/m3u8?src=${encodeURIComponent(absUrl)}`;
  const absolutize = (raw: string) => new URL(raw, base).toString();
  const isPlaylist = (u: string) => u.endsWith(".m3u8") || u.includes(".m3u8?");

  for (const line of lines) {
    if (!line) {
      out.push(line);
      continue;
    }
    if (line.startsWith("#")) {
      // Rewrite URI="..." attributes in directives (EXT-X-KEY, EXT-X-MEDIA, etc.)
      out.push(
        line.replace(/URI="([^"]+)"/g, (_, uri) => {
          const abs = absolutize(uri);
          return `URI="${isPlaylist(abs) ? proxify(abs) : abs}"`;
        }),
      );
      continue;
    }
    // URI line — segment or sub-playlist
    const abs = absolutize(line);
    out.push(isPlaylist(abs) ? proxify(abs) : abs);
  }
  return out.join("\n");
}

async function handleManifestProxy(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const src = url.searchParams.get("src");
  if (!src) return new Response("missing src", { status: 400 });

  let target: URL;
  try {
    target = new URL(src);
  } catch {
    return new Response("bad src", { status: 400 });
  }
  if (!isAllowedManifestHost(target.hostname)) {
    return new Response("host not allowed", { status: 400 });
  }

  // Pluto's stitcher requires the JWT on every sub-playlist + audio + subtitle
  // request, not just the master (v2 variant playlists 401 without it). Inject
  // it here so the iframe doesn't need to know about auth.
  if (target.pathname.includes("/stitch/hls/") && !target.searchParams.has("jwt")) {
    const token = await getSessionToken();
    if (token) target.searchParams.set("jwt", token);
  }

  try {
    const upstream = await fetch(target.toString(), {
      headers: { "User-Agent": "Mozilla/5.0", Accept: "application/vnd.apple.mpegurl, */*" },
    });
    if (!upstream.ok) {
      return new Response(`upstream ${upstream.status}`, {
        status: 502,
        headers: { "access-control-allow-origin": "*" },
      });
    }
    const text = await upstream.text();
    const proxyBase = `${url.protocol}//${url.host}`;
    const rewritten = rewriteManifest(text, target.toString(), proxyBase);
    return new Response(rewritten, {
      status: 200,
      headers: {
        "content-type": "application/vnd.apple.mpegurl; charset=utf-8",
        "cache-control": "no-store",
        "access-control-allow-origin": "*",
      },
    });
  } catch (err) {
    console.error("[pluto] manifest proxy error", err);
    return new Response("proxy failed", {
      status: 502,
      headers: { "access-control-allow-origin": "*" },
    });
  }
}

// ── Player iframe HTML ──────────────────────────────────────────────────────
function renderPlayerHtml(opts: {
  streamUrl: string;
  title: string;
  poster?: string;
  proxyBase: string;
}): string {
  const proxied = `${opts.proxyBase}/api/pluto/m3u8?src=${encodeURIComponent(opts.streamUrl)}`;
  const safeTitle = opts.title.replace(
    /[<&>"]/g,
    (c) => ({ "<": "&lt;", "&": "&amp;", ">": "&gt;", '"': "&quot;" })[c]!,
  );
  const safePoster = (opts.poster ?? "").replace(/"/g, "&quot;");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle}</title>
    <style>
      html, body { margin: 0; padding: 0; background: #000; height: 100%; overflow: hidden; font: 14px/1.4 system-ui, sans-serif; color: #eee; }
      video { width: 100%; height: 100%; background: #000; display: block; }
      .err { position: absolute; inset: 0; display: grid; place-items: center; padding: 2rem; text-align: center; }
      .err b { display: block; font-size: 1.1rem; margin-bottom: .5rem; }
      .err small { color: #888; }
    </style>
  </head>
  <body>
    <video id="v" controls playsinline ${safePoster ? `poster="${safePoster}"` : ""}></video>
    <div id="err" class="err" hidden>
      <div>
        <b>Stream unavailable</b>
        <small id="errDetail">Pluto didn't return a playable manifest for this title.</small>
        <div style="margin-top:1rem">
          <button id="retryBtn" style="padding:.5rem 1rem;border:1px solid #555;background:#222;color:#eee;border-radius:.375rem;cursor:pointer;font:inherit">↻ Try a different channel</button>
        </div>
      </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js"></script>
    <script>
      (function () {
        var video = document.getElementById('v');
        var err = document.getElementById('err');
        var errDetail = document.getElementById('errDetail');
        var retryBtn = document.getElementById('retryBtn');
        var src = ${JSON.stringify(proxied)};

        retryBtn.addEventListener('click', function () {
          // Cache-buster forces parent server to re-roll pickChannelFor.
          // We can't change query string without losing the episode/channel id,
          // so just reload — server has slate-detection so retry tends to find a new one.
          location.reload();
        });

        function showError(detail) {
          if (detail) errDetail.textContent = detail;
          err.hidden = false;
          video.style.display = 'none';
        }

        function hideError() {
          if (err.hidden) return;
          err.hidden = true;
          video.style.display = '';
        }
        video.addEventListener('playing', hideError);

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () { /* autoplay blocked; controls remain */ });
          });
          hls.on(window.Hls.Events.ERROR, function (_evt, data) {
            var msg = '[hls] type=' + data.type + ' details=' + data.details + ' fatal=' + data.fatal
              + (data.reason ? ' reason=' + data.reason : '')
              + (data.response ? ' httpStatus=' + data.response.code : '');
            console.warn(msg);
            if (!data.fatal) return;
            // Try to recover instead of immediately failing.
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              try { hls.startLoad(); return; } catch (e) {}
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              try { hls.recoverMediaError(); return; } catch (e) {}
            }
            showError('hls error: ' + data.details + (data.response ? ' (HTTP ' + data.response.code + ')' : ''));
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src; // Safari native HLS
          video.addEventListener('loadedmetadata', function () { video.play().catch(function () {}); });
          video.addEventListener('error', function () { showError('native video error'); });
        } else {
          showError('Browser does not support HLS');
        }
      }());
    </script>
  </body>
</html>`;
}

// ── Public router ───────────────────────────────────────────────────────────
function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
    },
  });
}

function disabledResponse(): Response {
  return new Response(
    "Pluto integration disabled. Set PLUTO_ENABLED=1 in .env.local to enable (local dev only).",
    { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } },
  );
}

export async function handlePlutoApiRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/pluto/")) return null;
  if (!isEnabled()) return disabledResponse();

  // Fire-and-forget pre-warm on first request after server boot.
  void maybePrewarmSlateCache();

  // 1) Manifest proxy
  if (url.pathname === "/api/pluto/m3u8") {
    return handleManifestProxy(request);
  }

  // 2) Catalog (debug)
  if (url.pathname === "/api/pluto/catalog") {
    const [channels, vod] = await Promise.all([fetchPlutoChannels(), fetchPlutoVod()]);
    return jsonResponse({
      channels: channels.length,
      vod: vod.length,
      sampleChannels: channels.slice(0, 5).map((c) => ({ id: c._id, name: c.name })),
      sampleVod: vod.slice(0, 5).map((v) => ({ id: v._id, name: v.name })),
    });
  }

  // 2a) Full channel list — for /explore + /guide browsing.
  // ?limit=N (default 1000), ?excludeSlates=1 (default on) to skip known-bad channels.
  if (url.pathname === "/api/pluto/channels") {
    const limit = Math.min(Number(url.searchParams.get("limit") ?? "1000") || 1000, 1000);
    const excludeSlates = url.searchParams.get("excludeSlates") !== "0";
    const channels = await fetchPlutoChannels();
    const filtered = excludeSlates ? channels.filter((c) => !slateChannels.has(c._id)) : channels;
    return jsonResponse({
      count: filtered.length,
      total: channels.length,
      slatesFiltered: channels.length - filtered.length,
      channels: filtered.slice(0, limit).map((c) => ({
        id: c._id,
        name: c.name,
        slug: c.slug ?? null,
        number: c.number ?? null,
        logo: c.logo ?? null,
        summary: c.summary ?? null,
      })),
    });
  }

  // 2c) Native-client stream URL (for the Android TV app's ExoPlayer).
  // Returns JSON { url, name, logo } pointing at the proxied master m3u8 so
  // ExoPlayer can play it directly without the HTML iframe wrapper.
  if (url.pathname === "/api/pluto/stream") {
    const plutoId = url.searchParams.get("id");
    if (!plutoId) return new Response("missing id", { status: 400 });
    const all = await fetchPlutoChannels();
    const match = all.find((c) => c._id === plutoId);
    if (!match) return jsonResponse({ error: "channel_not_found" }, 404);
    const proxyBase = `${url.protocol}//${url.host}`;
    const rawStreamUrl = await buildChannelStreamUrl(match._id);
    const proxiedUrl = `${proxyBase}/api/pluto/m3u8?src=${encodeURIComponent(rawStreamUrl)}`;
    return jsonResponse({
      id: match._id,
      name: match.name,
      logo: match.logo ?? null,
      url: proxiedUrl,
    });
  }

  // 2d) Native-client VOD URL.
  if (url.pathname === "/api/pluto/stream-vod") {
    const vodId = url.searchParams.get("id");
    if (!vodId) return new Response("missing id", { status: 400 });
    const all = await fetchPlutoVod();
    const match = all.find((v) => v._id === vodId);
    if (!match) return jsonResponse({ error: "vod_not_found" }, 404);
    const proxyBase = `${url.protocol}//${url.host}`;
    const rawStreamUrl = await buildVodStreamUrl(match._id);
    const proxiedUrl = `${proxyBase}/api/pluto/m3u8?src=${encodeURIComponent(rawStreamUrl)}`;
    return jsonResponse({
      id: match._id,
      name: match.name,
      poster: match.poster ?? null,
      duration: match.duration ?? null,
      url: proxiedUrl,
    });
  }

  // 2b) Full VOD list — for browsing.
  if (url.pathname === "/api/pluto/vod") {
    const limit = Math.min(Number(url.searchParams.get("limit") ?? "200") || 200, 500);
    const vod = await fetchPlutoVod();
    return jsonResponse({
      count: vod.length,
      items: vod.slice(0, limit).map((v) => ({
        id: v._id,
        name: v.name,
        slug: v.slug ?? null,
        summary: v.summary ?? null,
        duration: v.duration ?? null,
        category: v.category ?? null,
        poster: v.poster ?? null,
      })),
    });
  }

  // 3) Player iframe HTML
  if (url.pathname === "/api/pluto/player") {
    const proxyBase = `${url.protocol}//${url.host}`;
    const trayChannelId = url.searchParams.get("channel");
    const trayEpisodeId = url.searchParams.get("episode");
    const directPlutoId = url.searchParams.get("id"); // Pluto channel id passthrough
    const directPlutoVodId = url.searchParams.get("vodId"); // Pluto VOD id passthrough

    // Direct Pluto-channel-id playback (used by /live/$id route).
    if (directPlutoId) {
      const all = await fetchPlutoChannels();
      const match = all.find((c) => c._id === directPlutoId);
      if (!match) return new Response("Channel not found", { status: 404 });
      const streamUrl = await buildChannelStreamUrl(match._id);
      const html = renderPlayerHtml({
        streamUrl,
        title: match.name,
        poster: match.logo,
        proxyBase,
      });
      return new Response(html, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
      });
    }

    if (directPlutoVodId) {
      const all = await fetchPlutoVod();
      const match = all.find((v) => v._id === directPlutoVodId);
      if (!match) return new Response("VOD title not found", { status: 404 });
      const streamUrl = await buildVodStreamUrl(match._id);
      const html = renderPlayerHtml({
        streamUrl,
        title: match.name,
        poster: match.poster,
        proxyBase,
      });
      return new Response(html, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
      });
    }

    if (trayChannelId) {
      // A "pluto:<id>" handle (used by watch parties started from /live/$id)
      // names a specific Pluto channel — play that exact channel so the party
      // mirrors the host. Anything else is a Trey TV handle that we hash-map to
      // a playable Pluto channel.
      const picked = trayChannelId.startsWith("pluto:")
        ? ((await fetchPlutoChannels()).find(
            (c) => c._id === trayChannelId.slice("pluto:".length),
          ) ?? (await pickChannelFor(trayChannelId)))
        : await pickChannelFor(trayChannelId);
      if (!picked) {
        return new Response("No Pluto channels available", { status: 503 });
      }
      const streamUrl = await buildChannelStreamUrl(picked._id);
      const html = renderPlayerHtml({
        streamUrl,
        title: picked.name,
        poster: picked.logo,
        proxyBase,
      });
      return new Response(html, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
      });
    }

    if (trayEpisodeId) {
      const vodPick = await pickVodFor(trayEpisodeId);
      if (vodPick) {
        const streamUrl = await buildVodStreamUrl(vodPick._id);
        const html = renderPlayerHtml({
          streamUrl,
          title: vodPick.name,
          poster: vodPick.poster,
          proxyBase,
        });
        return new Response(html, {
          status: 200,
          headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
        });
      }
      // VOD catalog empty (Pluto's v3 VOD endpoint isn't reliably returning items).
      // Fall back to a live channel keyed by the episode id so clicks still play.
      const channelFallback = await pickChannelFor(trayEpisodeId);
      if (!channelFallback) {
        return new Response("No Pluto content available", { status: 503 });
      }
      const streamUrl = await buildChannelStreamUrl(channelFallback._id);
      const html = renderPlayerHtml({
        streamUrl,
        title: `${channelFallback.name} (live)`,
        poster: channelFallback.logo,
        proxyBase,
      });
      return new Response(html, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
      });
    }

    return new Response("provide ?channel=<id> or ?episode=<id>", { status: 400 });
  }

  return new Response("Not Found", { status: 404 });
}
