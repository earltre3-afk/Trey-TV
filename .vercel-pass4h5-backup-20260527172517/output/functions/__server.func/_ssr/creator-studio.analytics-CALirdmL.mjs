import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { C as CreatorStudioLayout, S as SectionHeader, a as CreatorMetricCard } from "./CreatorStudioLayout-DnMAX3C9.mjs";
import { u as useSeries, S as Sparkline, M as MiniBars, R as RangePicker } from "./CreatorCharts-CbG8BSTh.mjs";
import { u as useCreatorStudio } from "./use-creator-studio-BkHsMg4r.mjs";
import "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { T as TrendingUp, j as Eye, a9 as Clock, a5 as Users, b as Heart, a8 as Bookmark, ae as Share2, bu as Earth, t as Crown, O as Search, C as Compass, W as WandSparkles } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "./AppShell-BWcCrjwR.mjs";
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
function AnalyticsPage() {
  const [range, setRange] = reactExports.useState("30d");
  const length = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 120;
  const views = useSeries(7, length, 4200, 2200);
  const watch = useSeries(13, length, 320, 180);
  const followers = useSeries(31, length, 40, 30);
  const engagement = useSeries(47, length, 60, 25);
  const sources = [{
    id: "home",
    label: "Trey TV Home",
    pct: 38,
    icon: Crown
  }, {
    id: "search",
    label: "Search",
    pct: 22,
    icon: Search
  }, {
    id: "explore",
    label: "Explore / Recs",
    pct: 18,
    icon: Compass
  }, {
    id: "external",
    label: "External / Shares",
    pct: 12,
    icon: Earth
  }, {
    id: "channel",
    label: "Direct channel",
    pct: 10,
    icon: Eye
  }];
  const {
    episodes: studioEpisodes
  } = useCreatorStudio();
  const episodes = reactExports.useMemo(() => studioEpisodes.filter((ep) => ep.publish_status === "published").slice(0, 8), [studioEpisodes]);
  const epSeries = useSeries(11, Math.max(episodes.length, 1) * 14, 200, 140);
  const hourly = useSeries(99, 24, 50, 50);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(CreatorStudioLayout, { title: "Analytics", subtitle: "The numbers behind your network.", actions: /* @__PURE__ */ jsxRuntimeExports.jsx(RangePicker, { value: range, onChange: setRange }), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: TrendingUp, title: `Overview · Last ${range === "all" ? "all time" : range}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MetricWithSpark, { label: "Views", value: fmt(views.reduce((a, b) => a + b)), delta: "+12.4%", icon: Eye, tone: "cyan", series: views }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MetricWithSpark, { label: "Watch Time", value: `${Math.round(watch.reduce((a, b) => a + b) / 60)}h`, delta: "+8.1%", icon: Clock, tone: "purple", series: watch }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MetricWithSpark, { label: "Followers", value: `+${fmt(followers.reduce((a, b) => a + b))}`, delta: "+22%", icon: Users, tone: "magenta", series: followers }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MetricWithSpark, { label: "Engagement", value: "9.7%", delta: "+1.3%", icon: Heart, tone: "gold", series: engagement })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorMetricCard, { label: "Saves", value: "3,812", icon: Bookmark, tone: "purple" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorMetricCard, { label: "Shares", value: "942", icon: Share2, tone: "cyan" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorMetricCard, { label: "Comments", value: "1,247", icon: Users, tone: "magenta" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorMetricCard, { label: "Completion", value: "62%", icon: Clock, tone: "green" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid grid-cols-1 lg:grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 rounded-3xl glass neon-border p-4 md:p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: TrendingUp, title: "Views over time" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkline, { values: views, height: 140 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-[10px] text-muted-foreground mt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            length,
            "d ago"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "today" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl glass neon-border p-4 md:p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: Earth, title: "Traffic sources" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2.5", children: sources.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(s.icon, { className: "size-3.5 text-primary" }),
              " ",
              s.label
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "tabular-nums text-muted-foreground", children: [
              s.pct,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 rounded-full bg-white/5 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-gradient-to-r from-primary to-[oklch(0.7_0.25_340)]", style: {
            width: `${s.pct}%`
          } }) })
        ] }, s.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl glass neon-border p-4 md:p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: WandSparkles, title: "Trey-I growth insights" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "grid md:grid-cols-2 gap-2", children: ["BTS clips save 2.3× higher than full episodes — make a weekly series.", "Drop-off in first 8s. Open with your strongest moment.", "Returning fans peak 9–11pm local. Schedule premieres late.", "Top 10 fans drove 42% of last week's gifts. Reply to them."].map((tip, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-3 p-3 rounded-2xl bg-white/5 ring-1 ring-white/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(WandSparkles, { className: "size-4 text-primary shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: tip })
      ] }, i)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl glass neon-border p-4 md:p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: Eye, title: "Episode performance" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm min-w-[640px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-[10px] tracking-[0.18em] text-muted-foreground uppercase", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left p-2", children: "Episode" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left p-2", children: "Trend" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right p-2", children: "Views" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right p-2", children: "Avg Watch" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right p-2", children: "Completion" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right p-2", children: "Saves" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-white/5", children: [
          episodes.map((e, i) => {
            const v = 8e3 + i * 3700 + i % 3 * 1200;
            const series = epSeries.slice(i * 14, (i + 1) * 14);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-white/5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2 font-semibold truncate max-w-[200px]", children: e.title || "Untitled" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2 w-32", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkline, { values: series, height: 28 }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2 text-right tabular-nums", children: fmt(v) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-2 text-right tabular-nums", children: [
                Math.floor(8 + i),
                ":",
                String(10 + i * 7 % 50).padStart(2, "0")
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-2 text-right tabular-nums", children: [
                55 + i * 3 % 30,
                "%"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2 text-right tabular-nums", children: fmt(120 + i * 80) })
            ] }, e.id);
          }),
          episodes.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "p-6 text-center text-muted-foreground text-sm", children: "Publish episodes to see performance." }) })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl glass neon-border p-4 md:p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: Clock, title: "When your fans watch" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MiniBars, { values: hourly }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-[10px] text-muted-foreground mt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "12am" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "6am" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "12pm" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "6pm" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "11pm" })
      ] })
    ] })
  ] });
}
function MetricWithSpark(props) {
  const {
    series,
    ...rest
  } = props;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorMetricCard, { ...rest }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 px-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkline, { values: series, height: 32 }) })
  ] });
}
function fmt(n) {
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
}
export {
  AnalyticsPage as component
};
