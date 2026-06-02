import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { _ as Route$y, $ as cap, w as prescribed, v as posts, e as creators } from "./router-BtgGywEC.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { A as AppShell } from "./AppShell-BWcCrjwR.mjs";
import { u as useGoBack } from "./use-go-back-DIwqgoNo.mjs";
import "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { A as ArrowLeft, Y as Flame, T as TrendingUp, j as Eye, a4 as Play } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
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
import "../_libs/isbot.mjs";
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
import "./Logo-D0JEzEf4.mjs";
import "./trey-tv-logo-CG7PjBoN.mjs";
const CATEGORY_META = {
  music: {
    label: "Music",
    tagline: "Beats, drops and live sets dominating the charts.",
    tint: "oklch(0.7 0.25 340)"
  },
  shows: {
    label: "Shows",
    tagline: "Binge-worthy series and breakout episodes.",
    tint: "oklch(0.82 0.16 85)"
  },
  podcasts: {
    label: "Podcasts",
    tagline: "Voices, conversations and hot mic moments.",
    tint: "oklch(0.82 0.15 215)"
  },
  gaming: {
    label: "Gaming",
    tagline: "Top streams, plays and tournament highlights.",
    tint: "oklch(0.65 0.22 300)"
  },
  lifestyle: {
    label: "Lifestyle",
    tagline: "Fashion, food and the day-in-the-life drops.",
    tint: "oklch(0.7 0.25 340)"
  },
  trending: {
    label: "Trending",
    tagline: "Everything blowing up right now.",
    tint: "oklch(0.82 0.16 85)"
  }
};
function CategoryPage() {
  const {
    slug
  } = Route$y.useParams();
  const meta = CATEGORY_META[slug] ?? {
    label: cap(slug),
    tagline: "Top videos in this category.",
    tint: "oklch(0.82 0.16 85)"
  };
  const goBack = useGoBack("/explore");
  const pool = [...prescribed.map((p) => ({
    id: p.id,
    title: p.title,
    media: p.media,
    creator: p.creator,
    kind: p.kind,
    duration: p.duration ?? p.viewers ?? "—"
  })), ...posts.map((p) => ({
    id: p.id,
    title: p.text.split("\n")[0],
    media: p.media,
    creator: p.creator.name,
    kind: "VIDEO",
    duration: p.duration
  }))];
  const popular = pool.map((p, i) => ({
    ...p,
    views: (p.id.charCodeAt(0) + slug.length + i) * 137 % 950 + 50
  })).sort((a, b) => b.views - a.views);
  const topCreators = creators.slice(0, 4);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { wide: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: goBack, className: "inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-3.5" }),
      " Back"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative overflow-hidden rounded-3xl glass neon-border p-6 lg:p-10", style: {
      background: `radial-gradient(circle at 20% 0%, color-mix(in oklab, ${meta.tint} 28%, transparent), transparent 60%), radial-gradient(circle at 90% 100%, color-mix(in oklab, ${meta.tint} 18%, transparent), transparent 60%)`
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] tracking-[0.3em] font-semibold flex items-center gap-1.5", style: {
        color: meta.tint
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "size-3.5" }),
        " POPULAR · ",
        meta.label.toUpperCase()
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-3 text-3xl lg:text-5xl font-bold leading-tight", children: [
        "Top ",
        meta.label,
        " on Trey TV"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm lg:text-base text-muted-foreground max-w-xl", children: meta.tagline })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm lg:text-base font-semibold mb-3 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "size-4", style: {
          color: meta.tint
        } }),
        " Top ",
        meta.label.toLowerCase(),
        " creators"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3 overflow-x-auto no-scrollbar -mx-3 px-3 pb-1", children: topCreators.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/channel/$handle", params: {
        handle: c.handle
      }, className: "shrink-0 w-32 rounded-2xl glass border border-white/10 p-3 flex flex-col items-center gap-2 hover-lift", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-14 rounded-full conic-ring", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: c.avatar, alt: "", className: "size-full rounded-full object-cover" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold truncate w-full text-center", children: c.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground truncate w-full text-center", children: [
          "@",
          c.handle
        ] })
      ] }, c.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm lg:text-base font-semibold mb-3", children: "Most popular" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3", children: popular.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/watch/$id", params: {
        id: String(p.id)
      }, className: "group relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: p.media, alt: "", className: "size-full object-cover transition duration-500 group-hover:scale-110", loading: "lazy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 backdrop-blur text-white", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "size-3" }),
          " ",
          (p.views / 10).toFixed(1),
          "K"
        ] }),
        i < 3 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 right-2 size-6 grid place-items-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold glow-gold", children: i + 1 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-x-0 bottom-0 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] tracking-widest", style: {
            color: meta.tint
          }, children: p.kind }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold text-white truncate", children: p.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-white/70 truncate", children: p.creator })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-12 rounded-full bg-primary/90 grid place-items-center glow-gold", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "size-5 fill-primary-foreground text-primary-foreground" }) }) })
      ] }, `${p.id}-${i}`)) })
    ] })
  ] }) });
}
export {
  CategoryPage as component
};
