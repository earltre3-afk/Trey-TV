import { createServerFn } from "@tanstack/react-start";
import { getTreyIServiceClient } from "@/lib/trey-i/onboarding.server";

// ─────────────────────────────────────────────────────────────────────────────
// TMDB Content Scout — server-only proxy so the API key never leaks to browser.
// Searches movies + TV shows and returns normalized items the Explore page
// renders natively.  When a user selects a result, `captureTmdbContent`
// persists it to the `tv_library` Supabase table so it lives in the catalog.
// ─────────────────────────────────────────────────────────────────────────────

const TMDB_IMG = "https://image.tmdb.org/t/p";

export type TmdbContentItem = {
  id: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  overview: string;
  poster_url: string | null;
  backdrop_url: string | null;
  release_year: number | null;
  rating: number | null;
  vote_count: number;
  genre_ids: number[];
};

type TmdbRawResult = {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
};

// ── In-memory cache (5 min TTL) ─────────────────────────────────────────────
const CACHE_TTL = 5 * 60 * 1000;
const cache = new Map<string, { ts: number; items: TmdbContentItem[] }>();

function getCached(key: string): TmdbContentItem[] | null {
  const e = cache.get(key);
  if (!e) return null;
  if (Date.now() - e.ts > CACHE_TTL) { cache.delete(key); return null; }
  return e.items;
}
function setCache(key: string, items: TmdbContentItem[]) {
  if (cache.size > 200) {
    const now = Date.now();
    for (const [k, v] of cache) { if (now - v.ts > CACHE_TTL) cache.delete(k); }
  }
  cache.set(key, { ts: Date.now(), items });
}

// ── TMDB fetch helper ───────────────────────────────────────────────────────
async function tmdbGet<T>(path: string, params: Record<string, string>): Promise<T | null> {
  const token = process.env.TMDB_ACCESS_TOKEN?.trim();
  if (!token) return null;
  const url = new URL(path, "https://api.themoviedb.org");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch { return null; }
}

function normalize(r: TmdbRawResult, fallbackType: string): TmdbContentItem | null {
  const type = (r.media_type ?? fallbackType) as "movie" | "tv" | "person";
  if (type === "person") return null;  // skip people results

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
    genre_ids: r.genre_ids ?? [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// searchTmdbContent — returns up to 10 movies/TV shows matching a query.
// ─────────────────────────────────────────────────────────────────────────────
export const searchTmdbContent = createServerFn({ method: "GET" })
  .inputValidator((input: { query: string }) => input)
  .handler(async ({ data: input }): Promise<{ ok: true; items: TmdbContentItem[] } | { ok: false; error: string }> => {
    const q = input.query?.trim();
    if (!q || q.length < 2) return { ok: false, error: "Query too short." };
    if (!process.env.TMDB_ACCESS_TOKEN?.trim()) return { ok: false, error: "TMDB not configured." };

    const cacheKey = q.toLowerCase();
    const cached = getCached(cacheKey);
    if (cached) return { ok: true, items: cached };

    const [multi, movies, tvShows] = await Promise.all([
      tmdbGet<{ results: TmdbRawResult[] }>("/3/search/multi", { query: q, include_adult: "false", language: "en-US" }),
      tmdbGet<{ results: TmdbRawResult[] }>("/3/search/movie", { query: q, include_adult: "false", language: "en-US" }),
      tmdbGet<{ results: TmdbRawResult[] }>("/3/search/tv", { query: q, include_adult: "false", language: "en-US" }),
    ]);

    const seen = new Set<number>();
    const items: TmdbContentItem[] = [];
    const all = [
      ...(multi?.results ?? []).map((r) => ({ r, type: r.media_type ?? "movie" })),
      ...(movies?.results ?? []).map((r) => ({ r, type: "movie" as const })),
      ...(tvShows?.results ?? []).map((r) => ({ r, type: "tv" as const })),
    ];

    for (const { r, type } of all) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      const item = normalize(r, type);
      if (item) { items.push(item); if (items.length >= 10) break; }
    }

    setCache(cacheKey, items);
    return { ok: true, items };
  });

// ─────────────────────────────────────────────────────────────────────────────
// captureTmdbContent — user selected a scout result → persist to tv_library.
// ─────────────────────────────────────────────────────────────────────────────
export const captureTmdbContent = createServerFn({ method: "POST" })
  .inputValidator((input: { accessToken: string; item: TmdbContentItem }) => input)
  .handler(async ({ data: input }) => {
    // We use the service client so RLS doesn't block the insert
    const service = getTreyIServiceClient();
    const item = input.item;

    // Upsert by tmdb_id so we don't duplicate
    const { error } = await (service as any)
      .from("tv_library")
      .upsert({
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
        updated_at: new Date().toISOString(),
      }, { onConflict: "tmdb_id" });

    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });
