import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { A as AppShell } from "./AppShell-BWcCrjwR.mjs";
import "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { c as ChartColumn, aR as Funnel, a9 as Clock, j as Eye, b as Heart, a5 as Users, y as ArrowUpRight, T as TrendingUp, a4 as Play, bu as Earth } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "./Logo-D0JEzEf4.mjs";
import "./trey-tv-logo-CG7PjBoN.mjs";
import "./router-BtgGywEC.mjs";
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
const series = [22, 34, 28, 40, 52, 48, 60, 55, 72, 68, 84, 96, 88, 110];
const series2 = [10, 14, 18, 22, 30, 28, 38, 36, 50, 58, 64, 70, 80, 92];
function Sparkline({
  data,
  color
}) {
  const w = 100, h = 32;
  const max = Math.max(...data);
  const points = data.map((v, i) => `${i / (data.length - 1) * w},${h - v / max * h}`).join(" ");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: `0 0 ${w} ${h}`, className: "w-full h-10", preserveAspectRatio: "none", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: `g-${color}`, x1: "0", x2: "0", y1: "0", y2: "1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: color, stopOpacity: "0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: color, stopOpacity: "0" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { fill: "none", stroke: color, strokeWidth: "1.6", points }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("polygon", { fill: `url(#g-${color})`, points: `0,${h} ${points} ${w},${h}` })
  ] });
}
const stats = [{
  label: "Watch Hours",
  value: "184,210",
  delta: "+12.4%",
  color: "oklch(0.82 0.16 85)",
  icon: Clock,
  data: series
}, {
  label: "Unique Viewers",
  value: "92,481",
  delta: "+8.7%",
  color: "oklch(0.82 0.15 215)",
  icon: Eye,
  data: series2
}, {
  label: "Engagement Rate",
  value: "9.74%",
  delta: "+1.3%",
  color: "oklch(0.7 0.25 340)",
  icon: Heart,
  data: series
}, {
  label: "New Followers",
  value: "8,412",
  delta: "+5.1%",
  color: "oklch(0.65 0.22 300)",
  icon: Users,
  data: series2
}];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const bars = [42, 64, 50, 78, 96, 118, 88];
const top = [{
  title: "Late Night with Trey · S2 E14",
  views: "42.1K",
  mins: "32:14",
  lift: "+24%"
}, {
  title: "Studio Sessions · S1 E08",
  views: "18.7K",
  mins: "12:45",
  lift: "+11%"
}, {
  title: "City After Dark · S3 E22",
  views: "12.4K",
  mins: "08:32",
  lift: "+9%"
}, {
  title: "Late Night with Trey · S2 E13",
  views: "9.8K",
  mins: "28:02",
  lift: "+6%"
}];
const geo = [{
  country: "United States",
  pct: 42,
  color: "oklch(0.82 0.16 85)"
}, {
  country: "United Kingdom",
  pct: 18,
  color: "oklch(0.82 0.15 215)"
}, {
  country: "Canada",
  pct: 12,
  color: "oklch(0.7 0.25 340)"
}, {
  country: "Germany",
  pct: 9,
  color: "oklch(0.65 0.22 300)"
}, {
  country: "Other",
  pct: 19,
  color: "oklch(0.78 0.18 150)"
}];
function Analytics() {
  const maxBar = Math.max(...bars);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { wide: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between flex-wrap gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] tracking-[0.3em] text-primary flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "size-3.5" }),
          " ANALYTICS"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl md:text-4xl font-bold mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gradient-gold", children: "Channel Performance" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Last 14 days · Updated just now" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        ["7d", "14d", "30d", "All"].map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: `px-3 py-1.5 rounded-lg text-xs ${i === 1 ? "bg-primary/15 text-primary border border-primary/40 glow-gold" : "glass border border-white/10 text-muted-foreground hover:text-foreground"}`, children: r }, r)),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "size-9 grid place-items-center rounded-lg glass border border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { className: "size-4" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: stats.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      animationDelay: `${i * 80}ms`,
      boxShadow: `0 18px 50px -25px ${s.color}`
    }, className: "relative rounded-2xl glass neon-border p-4 animate-rise hover-lift overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.2em] text-muted-foreground", children: s.label.toUpperCase() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-2xl font-bold tabular-nums", children: s.value })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-9 rounded-xl grid place-items-center", style: {
          background: `${s.color.replace(")", " / 0.15)")}`
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(s.icon, { className: "size-4", style: {
          color: s.color
        } }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-1 text-xs", style: {
        color: s.color
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "size-3" }),
        " ",
        s.delta,
        " vs prev"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkline, { data: s.data, color: s.color }) })
    ] }, s.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl glass neon-border p-5 md:p-6 hover-lift", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-2 mb-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-semibold flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "size-4 text-primary" }),
            " Watch Time This Week"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Total: 612 hours · Peak: Saturday" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-[11px] text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-2 rounded-full bg-primary" }),
            " Watch hours"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-2 rounded-full bg-[oklch(0.7_0.25_340)]" }),
            " Live"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end justify-between gap-2 md:gap-4 h-48", children: bars.map((b, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-full flex justify-center items-end h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
          height: `${b / maxBar * 100}%`,
          animationDelay: `${i * 70}ms`
        }, className: "w-full max-w-[44px] rounded-t-xl bg-gradient-to-t from-primary/40 to-primary shadow-[0_0_20px_oklch(0.82_0.16_85_/_0.5)] animate-rise relative overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "absolute inset-x-0 top-1 text-center text-[10px] font-bold text-primary-foreground", children: [
          b,
          "h"
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: days[i] })
      ] }, days[i])) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 rounded-3xl glass neon-border p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "size-4 text-primary" }),
            " Top Performing Episodes"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-xs text-primary", children: "See all" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: top.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { style: {
          animationDelay: `${i * 60}ms`
        }, className: "animate-rise flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs tabular-nums text-primary font-bold w-6", children: [
            "#",
            i + 1
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold truncate", children: t.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
              t.mins,
              " avg watch"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold tabular-nums", children: t.views }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-[oklch(0.78_0.18_150)] flex items-center gap-1 justify-end", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "size-3" }),
              " ",
              t.lift
            ] })
          ] })
        ] }, t.title)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl glass neon-border p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Earth, { className: "size-4 text-primary" }),
          " Audience by Country"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-3", children: geo.map((g, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { style: {
          animationDelay: `${i * 70}ms`
        }, className: "animate-rise", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: g.country }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "tabular-nums text-muted-foreground", children: [
              g.pct,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 rounded-full bg-white/5 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full shimmer-sweep", style: {
            width: `${g.pct}%`,
            background: `linear-gradient(90deg, ${g.color}, ${g.color.replace(")", " / 0.4)")})`,
            boxShadow: `0 0 12px ${g.color}`
          } }) })
        ] }, g.country)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 pt-4 border-t border-white/5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.2em] text-muted-foreground mb-2", children: "DEVICES" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2 text-center", children: [{
            l: "Mobile",
            v: "68%"
          }, {
            l: "Web",
            v: "22%"
          }, {
            l: "TV",
            v: "10%"
          }].map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl glass p-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-bold", children: d.v }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: d.l })
          ] }, d.l)) })
        ] })
      ] })
    ] })
  ] }) });
}
export {
  Analytics as component
};
