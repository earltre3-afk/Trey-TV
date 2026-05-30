import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useGoBack } from "./use-go-back-DIwqgoNo.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { A as AppShell } from "./AppShell-BWcCrjwR.mjs";
import { n as useActivity, v as posts, p as REACTIONS } from "./router-BtgGywEC.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { A as ArrowLeft, aF as Trash2, b as Heart, a8 as Bookmark, f as Send, j as Eye, aR as Funnel, S as Sparkles } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "./Logo-D0JEzEf4.mjs";
import "./trey-tv-logo-CG7PjBoN.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
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
const FILTERS = ["All", "Reactions", "Saves", "Shares"];
function Activity() {
  const {
    activity,
    reactions,
    saves,
    clear
  } = useActivity();
  const [filter, setFilter] = reactExports.useState("All");
  const goBack = useGoBack("/");
  const reactionCount = Object.values(reactions).filter(Boolean).length;
  const saveCount = Object.values(saves).filter(Boolean).length;
  const shareCount = activity.filter((a) => a.type === "share").length;
  const filtered = activity.filter((a) => filter === "All" ? true : filter === "Reactions" ? a.type === "react" : filter === "Saves" ? a.type === "save" : a.type === "share");
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { wide: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: goBack, className: "size-9 grid place-items-center rounded-full liquid-glass border border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.3em] text-primary", children: "YOUR JOURNEY" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-bold", children: "Activity" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
        clear();
        toast("Activity cleared");
      }, className: "size-9 grid place-items-center rounded-full liquid-glass border border-white/10", "aria-label": "clear", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 gap-3", children: [{
      label: "Reactions",
      value: reactionCount,
      Icon: Heart,
      color: "oklch(0.7 0.25 340)"
    }, {
      label: "Saves",
      value: saveCount,
      Icon: Bookmark,
      color: "oklch(0.82 0.16 85)"
    }, {
      label: "Shares",
      value: shareCount,
      Icon: Send,
      color: "oklch(0.82 0.15 215)"
    }, {
      label: "Watched",
      value: 24,
      Icon: Eye,
      color: "oklch(0.65 0.22 300)"
    }].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl liquid-glass border border-white/10 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-8 rounded-lg grid place-items-center mb-2", style: {
        background: `color-mix(in oklab, ${s.color} 18%, transparent)`,
        color: s.color
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(s.Icon, { className: "size-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold", children: s.value }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-wider text-muted-foreground", children: s.label.toUpperCase() })
    ] }, s.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 overflow-x-auto no-scrollbar", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { className: "size-4 text-muted-foreground shrink-0" }),
      FILTERS.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFilter(f), className: `shrink-0 px-3 h-8 rounded-full text-xs font-semibold transition border ${filter === f ? "bg-primary text-primary-foreground border-transparent glow-gold" : "liquid-glass border-white/10 text-muted-foreground hover:text-foreground"}`, children: f }, f))
    ] }),
    saveCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl liquid-glass border border-white/10 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bookmark, { className: "size-4 text-primary" }),
          " Saved bookmarks"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/collections", className: "text-xs text-primary hover:underline", children: "Open collections" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 sm:grid-cols-4 gap-2", children: posts.filter((p) => saves[p.id]).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: p.media, className: "size-full object-cover", alt: "" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-1.5 left-1.5 right-1.5 text-[10px] truncate", children: p.creator.name })
      ] }, p.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl liquid-glass border border-white/10 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-bold flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-4 text-primary" }),
        " Recent activity"
      ] }),
      filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-10 text-center text-sm text-muted-foreground", children: [
        "Nothing here yet — start reacting and saving content from your feed.",
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "px-4 h-9 inline-flex items-center rounded-full bg-primary text-primary-foreground text-xs font-semibold glow-gold", children: "Open feed" }) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: filtered.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { a }, a.id)) })
    ] })
  ] }) });
}
function Row({
  a
}) {
  const r = a.reaction ? REACTIONS.find((x) => x.key === a.reaction) : null;
  const Icon = a.type === "save" ? Bookmark : a.type === "share" ? Send : Heart;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3 p-3 rounded-2xl glass border border-white/10", children: [
    a.thumb ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: a.thumb, className: "size-12 rounded-xl object-cover", alt: "" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-12 rounded-xl bg-white/5 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-5 text-muted-foreground" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-semibold truncate flex items-center gap-2", children: [
        r && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base", children: r.emoji }),
        a.type === "react" ? `Reacted ${r?.label ?? ""} on ${a.title}` : a.type === "save" ? `Saved ${a.title}` : `Shared ${a.title}`
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground truncate", children: [
        "@",
        a.creator,
        " · ",
        timeAgo(a.ts)
      ] })
    ] })
  ] });
}
function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1e3);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
export {
  Activity as component
};
