import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, TrendingUp, Flame, Music, Film, Mic2, Gamepad2, Sparkles, Play, Eye, Radio, ArrowRight, Star, Loader2, X, Plus, Check, Tv } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { creators, posts, prescribed } from "@/lib/mock-data";
import { shows, channels } from "@/lib/watch-data";
import { searchTmdbContent, captureTmdbContent, type TmdbContentItem } from "@/lib/tmdb-scout.server";
import { useSupabaseSession } from "@/lib/supabase-session";
import { toast } from "sonner";

function stableK(seed: string, min: number, range: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = ((h * 31) + seed.charCodeAt(i)) >>> 0;
  return ((min + (h % range)) / 10).toFixed(1);
}

export const Route = createFileRoute("/explore")({
  component: Explore,
  head: () => ({
    meta: [
      { title: "Explore — Trey TV" },
      { name: "description", content: "Discover trending creators, shows, and channels on Trey TV." },
    ],
  }),
});

const categoryChips = [
  { slug: "music", icon: Music, label: "Music", color: "text-[oklch(0.7_0.25_340)]", bg: "bg-[oklch(0.7_0.25_340_/_0.1)]" },
  { slug: "shows", icon: Film, label: "Shows", color: "text-primary", bg: "bg-primary/10" },
  { slug: "podcasts", icon: Mic2, label: "Podcasts", color: "text-[oklch(0.82_0.15_215)]", bg: "bg-[oklch(0.82_0.15_215_/_0.1)]" },
  { slug: "gaming", icon: Gamepad2, label: "Gaming", color: "text-[oklch(0.65_0.22_300)]", bg: "bg-[oklch(0.65_0.22_300_/_0.1)]" },
  { slug: "lifestyle", icon: Sparkles, label: "Lifestyle", color: "text-[oklch(0.7_0.25_340)]", bg: "bg-[oklch(0.7_0.25_340_/_0.1)]" },
  { slug: "trending", icon: Flame, label: "Trending", color: "text-primary", bg: "bg-primary/10" },
];

const filters = ["All", "Music", "Shows", "Live", "Podcasts", "Gaming", "Lifestyle", "New"];

// ── Local catalog search ────────────────────────────────────────────────────
function searchLocalCatalog(query: string) {
  const q = query.toLowerCase();
  const matchedShows = shows.filter((s) =>
    s.title.toLowerCase().includes(q) ||
    s.description.toLowerCase().includes(q) ||
    s.category.toLowerCase().includes(q)
  );
  const matchedChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(q) ||
    c.handle.toLowerCase().includes(q) ||
    c.category.toLowerCase().includes(q)
  );
  return { shows: matchedShows, channels: matchedChannels };
}

function Explore() {
  const [active, setActive] = useState("All");
  const hero = posts[0];
  const nav = useNavigate();
  const { session } = useSupabaseSession();

  // ── Search state with debounce ──────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(searchQuery.trim()), 320);
    return () => window.clearTimeout(t);
  }, [searchQuery]);

  // ── Local results ─────────────────────────────────────────────────────────
  const localResults = useMemo(
    () => (debouncedQuery.length >= 2 ? searchLocalCatalog(debouncedQuery) : null),
    [debouncedQuery],
  );
  const hasLocalResults = localResults && (localResults.shows.length > 0 || localResults.channels.length > 0);

  // ── TMDB scout — fires only when local catalog has 0 results ────────────
  const { data: scoutData, isLoading: isScoutLoading } = useQuery({
    queryKey: ["tmdb-scout", debouncedQuery],
    queryFn: () => searchTmdbContent({ data: { query: debouncedQuery } }),
    enabled: debouncedQuery.length >= 2 && !hasLocalResults,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });
  const scoutResults: TmdbContentItem[] = scoutData?.ok ? scoutData.items : [];

  // ── Capture mutation — persist selected scout result to tv_library ──────
  const [capturedIds, setCapturedIds] = useState<Set<string>>(new Set());
  const captureMutation = useMutation({
    mutationFn: async (item: TmdbContentItem) => {
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error("Not signed in");
      return captureTmdbContent({ data: { accessToken, item } });
    },
    onSuccess: (_data, item) => {
      setCapturedIds((prev) => new Set(prev).add(item.id));
      toast.success(`Added "${item.title}" to your library`);
    },
    onError: () => toast.error("Couldn't add to library — try again"),
  });

  const isSearchActive = debouncedQuery.length >= 2;
  const showScout = isSearchActive && !hasLocalResults && (scoutResults.length > 0 || isScoutLoading);

  return (
    <AppShell wide>
      <div className="space-y-8">
        {/* Hero spotlight — desktop showcase */}
        <section className="hidden lg:block relative overflow-hidden rounded-[2rem] border border-white/10 glass">
          <div className="absolute inset-0">
            <img src={hero.media} alt="" className="size-full object-cover opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          </div>
          <div className="relative grid grid-cols-2 gap-8 p-10 min-h-[340px]">
            <div className="flex flex-col justify-center">
              <div className="text-[11px] tracking-[0.3em] text-primary font-semibold">FEATURED · TONIGHT</div>
              <h1 className="mt-3 text-4xl xl:text-5xl font-bold leading-tight">Discover the next wave of creators</h1>
              <p className="mt-4 text-base text-muted-foreground max-w-md">Trending shows, live channels and editor-picked drops — refreshed every hour.</p>
              <div className="mt-6 flex items-center gap-3">
                <button onClick={() => nav({ to: "/channel/$handle", params: { handle: hero.creator.handle } })} className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold glow-gold tilt-press flex items-center gap-2"><Play className="size-4 fill-current" /> Watch trailer</button>
                <Link to="/prescribe-me" className="px-5 py-2.5 rounded-full glass border border-white/15 font-semibold hover:bg-white/5">Prescribe me</Link>
              </div>
            </div>
            <div className="hidden xl:flex items-center justify-end">
              <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                {prescribed.slice(0, 4).map((p) => (
                  <div key={p.id} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group">
                    <img src={p.media} alt="" className="size-full object-cover transition group-hover:scale-105" />
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="text-[9px] tracking-widest text-primary">{p.kind}</div>
                      <div className="text-xs font-semibold truncate">{p.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Search + filters */}
        <div className="space-y-4">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search creators, shows, channels…"
              className="w-full pl-11 pr-10 py-3 lg:py-4 rounded-2xl glass border border-white/10 text-sm lg:text-base focus:outline-none focus:border-primary/60"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setDebouncedQuery(""); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 size-7 grid place-items-center rounded-full text-muted-foreground hover:bg-white/10 hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-3 px-3">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs lg:text-sm font-semibold transition ${
                  active === f
                    ? "bg-primary text-primary-foreground glow-gold"
                    : "glass border border-white/10 text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ── Search results overlay ─────────────────────────────────────── */}
        {isSearchActive && (
          <section className="space-y-4">
            {/* Local results */}
            {hasLocalResults && (
              <>
                {localResults.shows.length > 0 && (
                  <div>
                    <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><Film className="size-4 text-primary" /> Shows</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      {localResults.shows.map((s) => (
                        <div key={s.id} className="group relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 cursor-pointer hover:ring-2 hover:ring-primary transition">
                          <img src={s.poster} alt="" className="size-full object-cover transition duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                          <div className="absolute inset-x-0 bottom-0 p-3">
                            <div className="text-[10px] tracking-widest text-primary mb-0.5">{s.category}</div>
                            <div className="text-sm font-bold truncate">{s.title}</div>
                            <div className="text-[11px] text-muted-foreground">{s.year} · {s.rating}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {localResults.channels.length > 0 && (
                  <div>
                    <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><Radio className="size-4 text-primary" /> Channels</h2>
                    <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-3 px-3">
                      {localResults.channels.map((c) => (
                        <Link
                          to="/channel/$handle"
                          params={{ handle: c.handle }}
                          key={c.id}
                          className="shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl glass border border-white/10 hover:border-primary/40 transition"
                        >
                          <img src={c.avatar} alt="" className="size-10 rounded-full object-cover" />
                          <div>
                            <div className="text-sm font-bold">{c.name}</div>
                            <div className="text-[11px] text-muted-foreground">@{c.handle} · {c.category}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Scout results — user doesn't know these are external */}
            {showScout && (
              <div>
                {isScoutLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {scoutResults.map((item) => {
                      const captured = capturedIds.has(item.id);
                      return (
                        <button
                          key={item.id}
                          onClick={() => { if (!captured) captureMutation.mutate(item); }}
                          className="group relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 text-left transition hover:ring-2 hover:ring-primary focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          {item.poster_url ? (
                            <img src={item.poster_url} alt="" className="size-full object-cover transition duration-500 group-hover:scale-110" />
                          ) : item.backdrop_url ? (
                            <img src={item.backdrop_url} alt="" className="size-full object-cover transition duration-500 group-hover:scale-110" />
                          ) : (
                            <div className="size-full bg-white/[0.04] grid place-items-center">
                              <Film className="size-8 text-muted-foreground/30" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                          {/* Captured badge */}
                          {captured && (
                            <div className="absolute top-2 right-2 size-7 rounded-full bg-primary grid place-items-center glow-gold">
                              <Check className="size-3.5 text-primary-foreground" />
                            </div>
                          )}

                          {/* Add-to-library indicator on hover */}
                          {!captured && (
                            <div className="absolute top-2 right-2 size-7 rounded-full bg-black/50 backdrop-blur grid place-items-center opacity-0 group-hover:opacity-100 transition">
                              <Plus className="size-3.5" />
                            </div>
                          )}

                          <div className="absolute inset-x-0 bottom-0 p-3">
                            <div className="flex items-center gap-1 mb-0.5">
                              <span className="text-[10px] tracking-widest text-primary uppercase">{item.media_type === "tv" ? "TV Series" : "Movie"}</span>
                              {item.rating && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 ml-auto">
                                  <Star className="size-2.5 fill-primary text-primary" /> {item.rating}
                                </span>
                              )}
                            </div>
                            <div className="text-sm font-bold truncate">{item.title}</div>
                            <div className="text-[11px] text-muted-foreground truncate">{item.release_year ?? ""}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* No results at all */}
            {isSearchActive && !hasLocalResults && !isScoutLoading && scoutResults.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-4xl mb-3 select-none">📺</div>
                <p className="text-sm font-semibold">No results for "{debouncedQuery}"</p>
                <p className="text-xs text-muted-foreground mt-1">Try a different search term.</p>
              </div>
            )}
          </section>
        )}

        {/* ── Default browse content (hidden during search) ──────────── */}
        {!isSearchActive && (
          <>
            <section>
              <h2 className="text-sm lg:text-base font-semibold mb-3 flex items-center gap-2"><TrendingUp className="size-4 text-primary" /> Trending categories</h2>
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-3">
                {categoryChips.map((c) => (
                  <Link
                    key={c.label}
                    to="/category/$slug"
                    params={{ slug: c.slug }}
                    className="group p-4 lg:p-5 rounded-2xl glass border border-white/10 flex flex-col items-center gap-2 lg:gap-3 hover:bg-white/5 hover-lift"
                  >
                    <div className={`size-10 lg:size-12 rounded-xl grid place-items-center ${c.bg} ${c.color} transition group-hover:scale-110`}>
                      <c.icon className="size-5 lg:size-6" />
                    </div>
                    <span className="text-xs lg:text-sm font-medium">{c.label}</span>
                  </Link>
                ))}
              </div>
            </section>

            {/* Live TV rail (Pluto channels — local-dev only via PLUTO_ENABLED) */}
            <LiveTvRail />


            {/* Top creators */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm lg:text-base font-semibold">Top creators</h2>
                <button className="text-xs text-primary hover:underline">See all</button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {creators.map((c) => (
                  <Link
                    to="/channel/$handle"
                    params={{ handle: c.handle }}
                    key={c.id}
                    className="group rounded-2xl glass border border-white/10 p-4 flex flex-col items-center gap-3 hover-lift relative overflow-hidden"
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-[radial-gradient(circle_at_50%_0%,oklch(0.82_0.16_85_/_0.15),transparent_70%)]" />
                    <div className="relative size-16 lg:size-20 rounded-full conic-ring">
                      <img src={c.avatar} className="size-full rounded-full object-cover" alt="" />
                      {c.live && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-[oklch(0.65_0.24_15)] text-white animate-glow-pulse">LIVE</span>
                      )}
                    </div>
                    <div className="text-center min-w-0 w-full">
                      <div className="text-sm font-semibold truncate">{c.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">@{c.handle}</div>
                    </div>
                    <span className="text-[11px] px-3 py-1 rounded-full border border-primary/40 text-primary group-hover:bg-primary/10 transition">
                      View Profile
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            {/* Hot grid + side rail on desktop */}
            <section className="grid lg:grid-cols-[1fr_320px] gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm lg:text-base font-semibold flex items-center gap-2"><Flame className="size-4 text-[oklch(0.7_0.25_340)]" /> Hot right now</h2>
                  <button className="text-xs text-primary hover:underline">More</button>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-3">
                  {[...posts, ...prescribed.map((p) => ({ id: p.id, media: p.media, creator: { name: p.creator } }))].map((p, i) => (
                    <div key={`${p.id}-${i}`} className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 cursor-pointer">
                      <img src={p.media} alt="" className="size-full object-cover transition duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/50 backdrop-blur text-white">
                        <Eye className="size-3" /> {stableK(`${p.id}-${i}`, 5, 195)}K
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-3">
                        <div className="text-xs font-semibold text-white truncate">{p.creator.name}</div>
                      </div>
                      <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition">
                        <div className="size-12 rounded-full bg-primary/90 grid place-items-center glow-gold">
                          <Play className="size-5 fill-primary-foreground text-primary-foreground" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Side rail — desktop */}
              <aside className="hidden lg:flex flex-col gap-4 sticky top-6 h-fit">
                <div className="rounded-3xl glass neon-border p-4">
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-3"><Radio className="size-4 text-[oklch(0.65_0.24_15)]" /> Live channels</h3>
                  <ul className="space-y-3">
                    {creators.slice(0, 4).map((c) => (
                      <li key={c.id} className="flex items-center gap-3">
                        <div className="relative size-10 rounded-lg overflow-hidden">
                          <img src={c.avatar} className="size-full object-cover" alt="" />
                          <span className="absolute inset-0 ring-2 ring-[oklch(0.65_0.24_15)] rounded-lg" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate">{c.name}</div>
                          <div className="text-[11px] text-muted-foreground">{stableK(c.id, 10, 40)}K viewers</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-3xl glass neon-border p-4">
                  <h3 className="text-sm font-bold mb-3">Editor's picks</h3>
                  <ul className="space-y-3">
                    {prescribed.map((p) => (
                      <li key={p.id} className="flex items-center gap-3">
                        <div className="size-12 rounded-lg overflow-hidden shrink-0">
                          <img src={p.media} alt="" className="size-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] tracking-widest text-primary">{p.kind}</div>
                          <div className="text-sm font-semibold truncate">{p.title}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{p.creator}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}

// ── LiveTvRail (Pluto) ─────────────────────────────────────────────────────
type PlutoChannelLite = {
  id: string;
  name: string;
  slug: string | null;
  number: number | null;
  logo: string | null;
  summary: string | null;
};

function LiveTvRail() {
  const [channels, setChannels] = useState<PlutoChannelLite[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/pluto/channels?limit=120");
        if (!res.ok) { if (!cancelled) setErrored(true); return; }
        const data = (await res.json()) as { count: number; channels: PlutoChannelLite[] };
        if (cancelled) return;
        setChannels(data.channels);
        setCount(data.count);
      } catch {
        if (!cancelled) setErrored(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <section>
        <h2 className="text-sm lg:text-base font-semibold mb-3 flex items-center gap-2">
          <Tv className="size-4 text-primary" /> Live TV
        </h2>
        <div className="text-xs text-white/40">Loading channels…</div>
      </section>
    );
  }
  if (errored || channels.length === 0) {
    return null; // silently hide if Pluto is disabled (prod) or unreachable
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm lg:text-base font-semibold flex items-center gap-2">
          <Tv className="size-4 text-primary" /> Live TV
          <span className="text-[10px] tracking-widest text-white/40 font-normal">· {count} channels</span>
        </h2>
        <span className="text-[10px] tracking-widest text-red-400 font-bold inline-flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-red-400 animate-pulse" /> LIVE
        </span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 lg:gap-3">
        {channels.map((c) => (
          <Link
            key={c.id}
            to="/live/$id"
            params={{ id: c.id }}
            className="group rounded-xl glass border border-white/10 p-2 hover:bg-white/5 hover-lift transition flex flex-col items-center text-center gap-1.5"
          >
            <div className="aspect-square w-full rounded-lg bg-black/40 grid place-items-center overflow-hidden">
              {c.logo ? (
                <img src={c.logo} alt="" className="size-full object-contain p-1 transition-transform group-hover:scale-105" loading="lazy" />
              ) : (
                <Tv className="size-6 text-white/30" />
              )}
            </div>
            <div className="min-w-0 w-full">
              <div className="text-[11px] font-semibold truncate">{c.name}</div>
              {c.number ? <div className="text-[9px] text-white/40">Ch. {c.number}</div> : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
