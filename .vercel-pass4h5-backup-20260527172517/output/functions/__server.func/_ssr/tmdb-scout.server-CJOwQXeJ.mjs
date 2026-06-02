import { c as createServerRpc, a as createServerFn, g as getTreyIServiceClient } from "./index.mjs";
import "../_libs/react.mjs";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/livekit__protocol.mjs";
import "../_libs/bufbuild__protobuf.mjs";
import "../_libs/livekit-server-sdk.mjs";
import "../_libs/jose.mjs";
import "node:buffer";
import "node:util";
import "node:fs";
import "node:path";
const TMDB_IMG = "https://image.tmdb.org/t/p";
const CACHE_TTL = 5 * 60 * 1e3;
const cache = /* @__PURE__ */ new Map();
function getCached(key) {
  const e = cache.get(key);
  if (!e) return null;
  if (Date.now() - e.ts > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return e.items;
}
function setCache(key, items) {
  if (cache.size > 200) {
    const now = Date.now();
    for (const [k, v] of cache) {
      if (now - v.ts > CACHE_TTL) cache.delete(k);
    }
  }
  cache.set(key, {
    ts: Date.now(),
    items
  });
}
async function tmdbGet(path, params) {
  const token = process.env.TMDB_ACCESS_TOKEN?.trim();
  if (!token) return null;
  const url = new URL(path, "https://api.themoviedb.org");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  try {
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
function normalize(r, fallbackType) {
  const type = r.media_type ?? fallbackType;
  if (type === "person") return null;
  const title = r.title ?? r.name ?? r.original_title ?? r.original_name ?? "";
  if (!title) return null;
  const dateStr = r.release_date ?? r.first_air_date ?? "";
  const year = dateStr ? parseInt(dateStr.slice(0, 4), 10) : null;
  return {
    id: `tmdb-${type}-${r.id}`,
    tmdb_id: r.id,
    media_type: type,
    title,
    overview: r.overview ?? "",
    poster_url: r.poster_path ? `${TMDB_IMG}/w500${r.poster_path}` : null,
    backdrop_url: r.backdrop_path ? `${TMDB_IMG}/w780${r.backdrop_path}` : null,
    release_year: year && !isNaN(year) ? year : null,
    rating: typeof r.vote_average === "number" ? Math.round(r.vote_average * 10) / 10 : null,
    vote_count: r.vote_count ?? 0,
    genre_ids: r.genre_ids ?? []
  };
}
const searchTmdbContent_createServerFn_handler = createServerRpc({
  id: "ac12d50256cc12339275595886c33298dabab01860dcb25c8e45de4dcf88bf49",
  name: "searchTmdbContent",
  filename: "src/lib/tmdb-scout.server.ts"
}, (opts) => searchTmdbContent.__executeServer(opts));
const searchTmdbContent = createServerFn({
  method: "GET"
}).inputValidator((input) => input).handler(searchTmdbContent_createServerFn_handler, async ({
  data: input
}) => {
  const q = input.query?.trim();
  if (!q || q.length < 2) return {
    ok: false,
    error: "Query too short."
  };
  if (!process.env.TMDB_ACCESS_TOKEN?.trim()) return {
    ok: false,
    error: "TMDB not configured."
  };
  const cacheKey = q.toLowerCase();
  const cached = getCached(cacheKey);
  if (cached) return {
    ok: true,
    items: cached
  };
  const [multi, movies, tvShows] = await Promise.all([tmdbGet("/3/search/multi", {
    query: q,
    include_adult: "false",
    language: "en-US"
  }), tmdbGet("/3/search/movie", {
    query: q,
    include_adult: "false",
    language: "en-US"
  }), tmdbGet("/3/search/tv", {
    query: q,
    include_adult: "false",
    language: "en-US"
  })]);
  const seen = /* @__PURE__ */ new Set();
  const items = [];
  const all = [...(multi?.results ?? []).map((r) => ({
    r,
    type: r.media_type ?? "movie"
  })), ...(movies?.results ?? []).map((r) => ({
    r,
    type: "movie"
  })), ...(tvShows?.results ?? []).map((r) => ({
    r,
    type: "tv"
  }))];
  for (const {
    r,
    type
  } of all) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    const item = normalize(r, type);
    if (item) {
      items.push(item);
      if (items.length >= 10) break;
    }
  }
  setCache(cacheKey, items);
  return {
    ok: true,
    items
  };
});
const captureTmdbContent_createServerFn_handler = createServerRpc({
  id: "e6a5e262b25266990d1b2c2552e6673cb2fb4243392f5fa31d7e6763d93556aa",
  name: "captureTmdbContent",
  filename: "src/lib/tmdb-scout.server.ts"
}, (opts) => captureTmdbContent.__executeServer(opts));
const captureTmdbContent = createServerFn({
  method: "POST"
}).inputValidator((input) => input).handler(captureTmdbContent_createServerFn_handler, async ({
  data: input
}) => {
  const service = getTreyIServiceClient();
  const item = input.item;
  const {
    error
  } = await service.from("tv_library").upsert({
    tmdb_id: item.tmdb_id,
    media_type: item.media_type,
    title: item.title,
    overview: item.overview,
    poster_url: item.poster_url,
    backdrop_url: item.backdrop_url,
    release_year: item.release_year,
    rating: item.rating,
    vote_count: item.vote_count,
    genre_ids: item.genre_ids,
    source: "tmdb_scout",
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }, {
    onConflict: "tmdb_id"
  });
  if (error) return {
    ok: false,
    error: error.message
  };
  return {
    ok: true
  };
});
export {
  captureTmdbContent_createServerFn_handler,
  searchTmdbContent_createServerFn_handler
};
