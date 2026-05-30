import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { b as useQuery, u as useMutation } from "../_libs/tanstack__react-query.mjs";
import { A as AppShell } from "./AppShell-BWcCrjwR.mjs";
import { g as useSupabaseSession, v as posts, w as prescribed, e as creators } from "./router-BtgGywEC.mjs";
import { F as shows, A as channels, a as createServerFn, u as createSsrRpc } from "./index.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/react-dom.mjs";
import { a4 as Play, O as Search, X, b7 as Film, R as Radio, az as LoaderCircle, k as Check, P as Plus, ai as Star, aj as ArrowRight, T as TrendingUp, a0 as Music, b8 as MicVocal, b9 as Gamepad2, S as Sparkles, Y as Flame, j as Eye, a2 as Tv } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "./Logo-D0JEzEf4.mjs";
import "./trey-tv-logo-CG7PjBoN.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/zod.mjs";
import "node:crypto";
import "node:async_hooks";
import "../_libs/livekit__protocol.mjs";
import "../_libs/bufbuild__protobuf.mjs";
import "../_libs/livekit-server-sdk.mjs";
import "../_libs/jose.mjs";
import "node:buffer";
import "node:util";
import "node:fs";
import "node:path";
import "util";
import "crypto";
import "async_hooks";
import "stream";
const searchTmdbContent = createServerFn({
  method: "GET"
}).inputValidator((input) => input).handler(createSsrRpc("ac12d50256cc12339275595886c33298dabab01860dcb25c8e45de4dcf88bf49"));
const captureTmdbContent = createServerFn({
  method: "POST"
}).inputValidator((input) => input).handler(createSsrRpc("e6a5e262b25266990d1b2c2552e6673cb2fb4243392f5fa31d7e6763d93556aa"));
function stableK(seed, min, range) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = h * 31 + seed.charCodeAt(i) >>> 0;
  return ((min + h % range) / 10).toFixed(1);
}
const categoryChips = [{
  slug: "music",
  icon: Music,
  label: "Music",
  color: "text-[oklch(0.7_0.25_340)]",
  bg: "bg-[oklch(0.7_0.25_340_/_0.1)]"
}, {
  slug: "shows",
  icon: Film,
  label: "Shows",
  color: "text-primary",
  bg: "bg-primary/10"
}, {
  slug: "podcasts",
  icon: MicVocal,
  label: "Podcasts",
  color: "text-[oklch(0.82_0.15_215)]",
  bg: "bg-[oklch(0.82_0.15_215_/_0.1)]"
}, {
  slug: "gaming",
  icon: Gamepad2,
  label: "Gaming",
  color: "text-[oklch(0.65_0.22_300)]",
  bg: "bg-[oklch(0.65_0.22_300_/_0.1)]"
}, {
  slug: "lifestyle",
  icon: Sparkles,
  label: "Lifestyle",
  color: "text-[oklch(0.7_0.25_340)]",
  bg: "bg-[oklch(0.7_0.25_340_/_0.1)]"
}, {
  slug: "trending",
  icon: Flame,
  label: "Trending",
  color: "text-primary",
  bg: "bg-primary/10"
}];
const filters = ["All", "Music", "Shows", "Live", "Podcasts", "Gaming", "Lifestyle", "New"];
function searchLocalCatalog(query) {
  const q = query.toLowerCase();
  const matchedShows = shows.filter((s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
  const matchedChannels = channels.filter((c) => c.name.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
  return {
    shows: matchedShows,
    channels: matchedChannels
  };
}
function Explore() {
  const [active, setActive] = reactExports.useState("All");
  const hero = posts[0];
  const nav = useNavigate();
  const {
    session
  } = useSupabaseSession();
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [debouncedQuery, setDebouncedQuery] = reactExports.useState("");
  reactExports.useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(searchQuery.trim()), 320);
    return () => window.clearTimeout(t);
  }, [searchQuery]);
  const localResults = reactExports.useMemo(() => debouncedQuery.length >= 2 ? searchLocalCatalog(debouncedQuery) : null, [debouncedQuery]);
  const hasLocalResults = localResults && (localResults.shows.length > 0 || localResults.channels.length > 0);
  const {
    data: scoutData,
    isLoading: isScoutLoading
  } = useQuery({
    queryKey: ["tmdb-scout", debouncedQuery],
    queryFn: () => searchTmdbContent({
      data: {
        query: debouncedQuery
      }
    }),
    enabled: debouncedQuery.length >= 2 && !hasLocalResults,
    staleTime: 5 * 6e4,
    gcTime: 10 * 6e4
  });
  const scoutResults = scoutData?.ok ? scoutData.items : [];
  const [capturedIds, setCapturedIds] = reactExports.useState(/* @__PURE__ */ new Set());
  const captureMutation = useMutation({
    mutationFn: async (item) => {
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error("Not signed in");
      return captureTmdbContent({
        data: {
          accessToken,
          item
        }
      });
    },
    onSuccess: (_data, item) => {
      setCapturedIds((prev) => new Set(prev).add(item.id));
      toast.success(`Added "${item.title}" to your library`);
    },
    onError: () => toast.error("Couldn't add to library — try again")
  });
  const isSearchActive = debouncedQuery.length >= 2;
  const showScout = isSearchActive && !hasLocalResults && (scoutResults.length > 0 || isScoutLoading);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { wide: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "hidden lg:block relative overflow-hidden rounded-[2rem] border border-white/10 glass", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: hero.media, alt: "", className: "size-full object-cover opacity-50" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-background to-transparent" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative grid grid-cols-2 gap-8 p-10 min-h-[340px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col justify-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] tracking-[0.3em] text-primary font-semibold", children: "FEATURED · TONIGHT" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 text-4xl xl:text-5xl font-bold leading-tight", children: "Discover the next wave of creators" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-base text-muted-foreground max-w-md", children: "Trending shows, live channels and editor-picked drops — refreshed every hour." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => nav({
              to: "/channel/$handle",
              params: {
                handle: hero.creator.handle
              }
            }), className: "px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold glow-gold tilt-press flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "size-4 fill-current" }),
              " Watch trailer"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/prescribe-me", className: "px-5 py-2.5 rounded-full glass border border-white/15 font-semibold hover:bg-white/5", children: "Prescribe me" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden xl:flex items-center justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 w-full max-w-md", children: prescribed.slice(0, 4).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-square rounded-2xl overflow-hidden border border-white/10 group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: p.media, alt: "", className: "size-full object-cover transition group-hover:scale-105" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] tracking-widest text-primary", children: p.kind }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold truncate", children: p.title })
          ] })
        ] }, p.id)) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-2xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search creators, shows, channels…", className: "w-full pl-11 pr-10 py-3 lg:py-4 rounded-2xl glass border border-white/10 text-sm lg:text-base focus:outline-none focus:border-primary/60" }),
        searchQuery && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          setSearchQuery("");
          setDebouncedQuery("");
        }, className: "absolute right-3 top-1/2 -translate-y-1/2 size-7 grid place-items-center rounded-full text-muted-foreground hover:bg-white/10 hover:text-foreground", "aria-label": "Clear search", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-3.5" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 overflow-x-auto no-scrollbar -mx-3 px-3", children: filters.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setActive(f), className: `shrink-0 px-4 py-1.5 rounded-full text-xs lg:text-sm font-semibold transition ${active === f ? "bg-primary text-primary-foreground glow-gold" : "glass border border-white/10 text-muted-foreground hover:text-foreground"}`, children: f }, f)) })
    ] }),
    isSearchActive && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4", children: [
      hasLocalResults && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        localResults.shows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-semibold mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Film, { className: "size-4 text-primary" }),
            " Shows"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3", children: localResults.shows.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 cursor-pointer hover:ring-2 hover:ring-primary transition", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: s.poster, alt: "", className: "size-full object-cover transition duration-500 group-hover:scale-110" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-x-0 bottom-0 p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-widest text-primary mb-0.5", children: s.category }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold truncate", children: s.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
                s.year,
                " · ",
                s.rating
              ] })
            ] })
          ] }, s.id)) })
        ] }),
        localResults.channels.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-semibold mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "size-4 text-primary" }),
            " Channels"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3 overflow-x-auto no-scrollbar -mx-3 px-3", children: localResults.channels.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/channel/$handle", params: {
            handle: c.handle
          }, className: "shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl glass border border-white/10 hover:border-primary/40 transition", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: c.avatar, alt: "", className: "size-10 rounded-full object-cover" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", children: c.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
                "@",
                c.handle,
                " · ",
                c.category
              ] })
            ] })
          ] }, c.id)) })
        ] })
      ] }),
      showScout && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: isScoutLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-6 animate-spin text-muted-foreground" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3", children: scoutResults.map((item) => {
        const captured = capturedIds.has(item.id);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          if (!captured) captureMutation.mutate(item);
        }, className: "group relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 text-left transition hover:ring-2 hover:ring-primary focus-visible:ring-2 focus-visible:ring-primary", children: [
          item.poster_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: item.poster_url, alt: "", className: "size-full object-cover transition duration-500 group-hover:scale-110" }) : item.backdrop_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: item.backdrop_url, alt: "", className: "size-full object-cover transition duration-500 group-hover:scale-110" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-full bg-white/[0.04] grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Film, { className: "size-8 text-muted-foreground/30" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" }),
          captured && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 right-2 size-7 rounded-full bg-primary grid place-items-center glow-gold", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3.5 text-primary-foreground" }) }),
          !captured && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 right-2 size-7 rounded-full bg-black/50 backdrop-blur grid place-items-center opacity-0 group-hover:opacity-100 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-x-0 bottom-0 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 mb-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] tracking-widest text-primary uppercase", children: item.media_type === "tv" ? "TV Series" : "Movie" }),
              item.rating && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground flex items-center gap-0.5 ml-auto", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "size-2.5 fill-primary text-primary" }),
                " ",
                item.rating
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold truncate", children: item.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground truncate", children: item.release_year ?? "" })
          ] })
        ] }, item.id);
      }) }) }),
      isSearchActive && !hasLocalResults && !isScoutLoading && scoutResults.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl mb-3 select-none", children: "📺" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold", children: [
          'No results for "',
          debouncedQuery,
          '"'
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Try a different search term." })
      ] })
    ] }),
    !isSearchActive && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/music-review", className: "group relative block overflow-hidden rounded-3xl liquid-glass neon-border p-5 lg:p-7", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[radial-gradient(80%_80%_at_20%_20%,oklch(0.7_0.25_340/0.22),transparent),radial-gradient(80%_80%_at_85%_80%,oklch(0.82_0.15_215/0.22),transparent)]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-16 -right-10 size-56 rounded-full bg-[oklch(0.65_0.24_15/0.2)] blur-3xl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.82_0.16_85/0.6)] to-transparent" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center gap-4 lg:gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 size-14 lg:size-16 rounded-2xl bg-gradient-to-br from-[oklch(0.82_0.16_85)] via-[oklch(0.7_0.25_340)] to-[oklch(0.82_0.15_215)] grid place-items-center text-primary-foreground glow-gold", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "size-6 lg:size-7" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[oklch(0.65_0.24_15/0.15)] border border-[oklch(0.65_0.24_15/0.4)] text-[9px] lg:text-[10px] tracking-[0.22em] text-[oklch(0.85_0.18_15)]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-1.5 rounded-full bg-[oklch(0.65_0.24_15)] animate-glow-pulse" }),
                " LIVE"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] lg:text-[10px] tracking-[0.22em] text-muted-foreground", children: "NEW" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg lg:text-2xl font-black tracking-tight", children: "Live Music Review" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs lg:text-sm text-muted-foreground mt-0.5 line-clamp-2", children: "Submit your track, get reviewed live on TikTok. Skip the line with Cash App." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs lg:text-sm font-bold glow-gold tilt-press", children: [
            "Submit ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-3.5 transition-transform group-hover:translate-x-0.5" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "sm:hidden size-5 text-primary transition-transform group-hover:translate-x-0.5" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm lg:text-base font-semibold mb-3 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "size-4 text-primary" }),
          " Trending categories"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-3", children: categoryChips.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/category/$slug", params: {
          slug: c.slug
        }, className: "group p-4 lg:p-5 rounded-2xl glass border border-white/10 flex flex-col items-center gap-2 lg:gap-3 hover:bg-white/5 hover-lift", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `size-10 lg:size-12 rounded-xl grid place-items-center ${c.bg} ${c.color} transition group-hover:scale-110`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(c.icon, { className: "size-5 lg:size-6" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs lg:text-sm font-medium", children: c.label })
        ] }, c.label)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LiveTvRail, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm lg:text-base font-semibold", children: "Top creators" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-xs text-primary hover:underline", children: "See all" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3", children: creators.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/channel/$handle", params: {
          handle: c.handle
        }, className: "group rounded-2xl glass border border-white/10 p-4 flex flex-col items-center gap-3 hover-lift relative overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-[radial-gradient(circle_at_50%_0%,oklch(0.82_0.16_85_/_0.15),transparent_70%)]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative size-16 lg:size-20 rounded-full conic-ring", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: c.avatar, className: "size-full rounded-full object-cover", alt: "" }),
            c.live && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-[oklch(0.65_0.24_15)] text-white animate-glow-pulse", children: "LIVE" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center min-w-0 w-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold truncate", children: c.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground truncate", children: [
              "@",
              c.handle
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] px-3 py-1 rounded-full border border-primary/40 text-primary group-hover:bg-primary/10 transition", children: "View Profile" })
        ] }, c.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid lg:grid-cols-[1fr_320px] gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm lg:text-base font-semibold flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "size-4 text-[oklch(0.7_0.25_340)]" }),
              " Hot right now"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-xs text-primary hover:underline", children: "More" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-3", children: [...posts, ...prescribed.map((p) => ({
            id: p.id,
            media: p.media,
            creator: {
              name: p.creator
            }
          }))].map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: p.media, alt: "", className: "size-full object-cover transition duration-500 group-hover:scale-110" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/50 backdrop-blur text-white", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "size-3" }),
              " ",
              stableK(`${p.id}-${i}`, 5, 195),
              "K"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 bottom-0 p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold text-white truncate", children: p.creator.name }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-12 rounded-full bg-primary/90 grid place-items-center glow-gold", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "size-5 fill-primary-foreground text-primary-foreground" }) }) })
          ] }, `${p.id}-${i}`)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "hidden lg:flex flex-col gap-4 sticky top-6 h-fit", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl glass neon-border p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-bold flex items-center gap-2 mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "size-4 text-[oklch(0.65_0.24_15)]" }),
              " Live channels"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-3", children: creators.slice(0, 4).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative size-10 rounded-lg overflow-hidden", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: c.avatar, className: "size-full object-cover", alt: "" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-0 ring-2 ring-[oklch(0.65_0.24_15)] rounded-lg" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold truncate", children: c.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
                  stableK(c.id, 10, 40),
                  "K viewers"
                ] })
              ] })
            ] }, c.id)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl glass neon-border p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold mb-3", children: "Editor's picks" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-3", children: prescribed.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-12 rounded-lg overflow-hidden shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: p.media, alt: "", className: "size-full object-cover" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-widest text-primary", children: p.kind }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold truncate", children: p.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground truncate", children: p.creator })
              ] })
            ] }, p.id)) })
          ] })
        ] })
      ] })
    ] })
  ] }) });
}
function LiveTvRail() {
  const [channels2, setChannels] = reactExports.useState([]);
  const [count, setCount] = reactExports.useState(0);
  const [loading, setLoading] = reactExports.useState(true);
  const [errored, setErrored] = reactExports.useState(false);
  reactExports.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/pluto/channels?limit=120");
        if (!res.ok) {
          if (!cancelled) setErrored(true);
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        setChannels(data.channels);
        setCount(data.count);
      } catch {
        if (!cancelled) setErrored(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm lg:text-base font-semibold mb-3 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tv, { className: "size-4 text-primary" }),
        " Live TV"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-white/40", children: "Loading channels…" })
    ] });
  }
  if (errored || channels2.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm lg:text-base font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tv, { className: "size-4 text-primary" }),
        " Live TV",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] tracking-widest text-white/40 font-normal", children: [
          "· ",
          count,
          " channels"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] tracking-widest text-red-400 font-bold inline-flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-1.5 rounded-full bg-red-400 animate-pulse" }),
        " LIVE"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 lg:gap-3", children: channels2.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/live/$id", params: {
      id: c.id
    }, className: "group rounded-xl glass border border-white/10 p-2 hover:bg-white/5 hover-lift transition flex flex-col items-center text-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square w-full rounded-lg bg-black/40 grid place-items-center overflow-hidden", children: c.logo ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: c.logo, alt: "", className: "size-full object-contain p-1 transition-transform group-hover:scale-105", loading: "lazy" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Tv, { className: "size-6 text-white/30" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-semibold truncate", children: c.name }),
        c.number ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[9px] text-white/40", children: [
          "Ch. ",
          c.number
        ] }) : null
      ] })
    ] }, c.id)) })
  ] });
}
export {
  Explore as component
};
