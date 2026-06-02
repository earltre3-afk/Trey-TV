import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { C as CreatorStudioLayout, a as CreatorMetricCard, S as SectionHeader } from "./CreatorStudioLayout-DnMAX3C9.mjs";
import { u as useSeries, S as Sparkline, R as RangePicker } from "./CreatorCharts-CbG8BSTh.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { u as Gem, w as Wallet, aw as Trophy, b as Heart, T as TrendingUp, x as Gift } from "../_libs/lucide-react.mjs";
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
import "./use-creator-studio-BkHsMg4r.mjs";
const GIFTS = [{
  id: "1",
  who: "@nightowl",
  what: "500 pts · Glow Heart",
  ep: "Late Night S2 E14",
  ago: "2m",
  thanked: false
}, {
  id: "2",
  who: "@maya",
  what: "250 pts · Star Boost",
  ep: "Studio Sessions E8",
  ago: "1h",
  thanked: false
}, {
  id: "3",
  who: "@lena",
  what: "100 pts · Crown Tip",
  ep: "City After Dark Trailer",
  ago: "3h",
  thanked: false
}, {
  id: "4",
  who: "@zaybeats",
  what: "1,000 pts · Diamond",
  ep: "Late Night S2 E14",
  ago: "1d",
  thanked: true
}];
function RewardsPage() {
  const [range, setRange] = reactExports.useState("30d");
  const length = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 120;
  const giftSeries = useSeries(57, length, 80, 60);
  const [gifts, setGifts] = reactExports.useState(GIFTS);
  const thank = (id) => {
    setGifts((g) => g.map((x) => x.id === id ? {
      ...x,
      thanked: true
    } : x));
    toast.success("Thank-you sent ✨");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(CreatorStudioLayout, { title: "Rewards & gifts", subtitle: "Track support from your fans.", actions: /* @__PURE__ */ jsxRuntimeExports.jsx(RangePicker, { value: range, onChange: setRange }), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorMetricCard, { label: "Total Gifts", value: "2,340", delta: "+18%", icon: Gem, tone: "gold" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorMetricCard, { label: "Points Received", value: "12,480", sub: "≈ $312 in tips", icon: Wallet, tone: "cyan" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorMetricCard, { label: "Top Supporter", value: "@nightowl", sub: "2,400 pts", icon: Trophy, tone: "magenta" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorMetricCard, { label: "Most Gifted", value: "Late Night E14", icon: Heart, tone: "purple" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl glass neon-border p-4 md:p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: TrendingUp, title: `Gifts over time · ${range}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkline, { values: giftSeries, height: 140, stroke: "oklch(0.78 0.25 340)", fill: "oklch(0.78 0.25 340 / 0.18)" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-[10px] text-muted-foreground mt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          length,
          "d ago"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "today" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl glass neon-border p-4 md:p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: Gift, title: "Recent gift activity" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-white/5", children: gifts.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-10 rounded-xl grid place-items-center bg-primary/10 text-primary ring-1 ring-primary/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Gem, { className: "size-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-semibold", children: [
            g.who,
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground font-normal", children: [
              "· ",
              g.ago
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground truncate", children: [
            g.what,
            " · on ",
            g.ep
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => !g.thanked && thank(g.id), disabled: g.thanked, className: `px-3 py-1.5 rounded-lg text-xs border ${g.thanked ? "border-white/10 text-muted-foreground" : "border-primary text-primary hover:bg-primary/10"}`, children: g.thanked ? "Thanked ✓" : "Thank" })
      ] }, g.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl glass neon-border p-4 md:p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: Wallet, title: "Payout status" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl glass border border-white/10 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Pending rewards" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-primary", children: "$312" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl glass border border-white/10 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Lifetime earned" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: "$1,840" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl glass border border-white/10 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Next payout" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: "Jun 1" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 h-2 rounded-full bg-white/5 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-gradient-to-r from-primary to-[oklch(0.7_0.25_340)]", style: {
        width: "62%"
      } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "$312 / $500 toward early payout. Connect a payout method in Settings." })
    ] })
  ] });
}
export {
  RewardsPage as component
};
