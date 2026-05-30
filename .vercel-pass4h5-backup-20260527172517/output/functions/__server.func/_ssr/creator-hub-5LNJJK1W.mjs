import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { A as AppShell, V as VerifiedBadge } from "./AppShell-BWcCrjwR.mjs";
import { k as currentUser, v as posts, e as creators } from "./router-BtgGywEC.mjs";
import "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { t as Crown, an as Upload, R as Radio, j as Eye, a5 as Users, b as Heart, aD as DollarSign, T as TrendingUp, S as Sparkles, b7 as Film, bh as Music2, e as Mic, W as WandSparkles, aY as Calendar, P as Plus, a4 as Play, a9 as Clock, r as ChevronRight } from "../_libs/lucide-react.mjs";
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
const kpis = [{
  label: "Watch Hours",
  value: "184.2K",
  delta: "+12.4%",
  icon: Eye,
  tone: "cyan"
}, {
  label: "New Followers",
  value: "8,412",
  delta: "+5.1%",
  icon: Users,
  tone: "purple"
}, {
  label: "Engagement",
  value: "9.7%",
  delta: "+1.3%",
  icon: Heart,
  tone: "magenta"
}, {
  label: "Revenue (30d)",
  value: "$12,840",
  delta: "+18.6%",
  icon: DollarSign,
  tone: "gold"
}];
const toneMap = {
  cyan: "from-[oklch(0.82_0.15_215_/_0.25)] to-transparent text-[oklch(0.82_0.15_215)] ring-[oklch(0.82_0.15_215_/_0.4)]",
  purple: "from-[oklch(0.65_0.22_300_/_0.25)] to-transparent text-[oklch(0.65_0.22_300)] ring-[oklch(0.65_0.22_300_/_0.4)]",
  magenta: "from-[oklch(0.7_0.25_340_/_0.25)] to-transparent text-[oklch(0.7_0.25_340)] ring-[oklch(0.7_0.25_340_/_0.4)]",
  gold: "from-[oklch(0.82_0.16_85_/_0.28)] to-transparent text-primary ring-primary/40"
};
const shows = [{
  id: "s1",
  title: "Late Night with Trey",
  season: 2,
  ep: 14,
  status: "Live Tonight",
  media: posts[0].media,
  color: "magenta"
}, {
  id: "s2",
  title: "Studio Sessions",
  season: 1,
  ep: 8,
  status: "New Episode",
  media: posts[1].media,
  color: "cyan"
}, {
  id: "s3",
  title: "City After Dark",
  season: 3,
  ep: 22,
  status: "Top 10",
  media: posts[2].media,
  color: "purple"
}];
const tools = [{
  icon: Film,
  label: "Upload Episode",
  desc: "Drop a new episode into a show"
}, {
  icon: Radio,
  label: "Go Live",
  desc: "Stream to your audience now"
}, {
  icon: Music2,
  label: "Drop a Track",
  desc: "Release audio to your channel"
}, {
  icon: Mic,
  label: "Record Podcast",
  desc: "Capture audio with Trey-I"
}, {
  icon: WandSparkles,
  label: "Trey-I Studio",
  desc: "AI thumbnails, clips, captions"
}, {
  icon: Calendar,
  label: "Schedule",
  desc: "Plan drops across the week"
}];
function CreatorHub() {
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { wide: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-3xl glass neon-border p-6 md:p-8 hover-lift", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-24 -right-24 size-72 rounded-full bg-[radial-gradient(circle,oklch(0.7_0.25_340_/_0.4),transparent_70%)] blur-2xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-32 -left-16 size-80 rounded-full bg-[radial-gradient(circle,oklch(0.65_0.22_300_/_0.35),transparent_70%)] blur-2xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-col md:flex-row md:items-center gap-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative size-20 md:size-24 rounded-2xl conic-ring shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: currentUser.avatar, className: "size-full rounded-2xl object-cover", alt: "" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[10px] tracking-[0.3em] text-primary mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-3.5" }),
            " CREATOR HUB"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl md:text-4xl font-bold flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gradient-gold", children: [
              currentUser.name,
              "'s Network"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(VerifiedBadge, { kind: "creator" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: [
            "@",
            currentUser.handle,
            " · ",
            currentUser.stats.followers,
            " followers · ",
            currentUser.stats.posts,
            " posts"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate({
            to: "/creator-studio/edit"
          }), className: "px-4 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground glow-gold hover-lift tilt-press flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "size-4" }),
            " Upload"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate({
            to: "/go-live"
          }), className: "px-4 py-2.5 rounded-xl text-sm font-semibold border border-[oklch(0.7_0.25_340)] text-[oklch(0.7_0.25_340)] hover-lift tilt-press flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "size-4" }),
            " Go Live"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4", children: kpis.map((k, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      animationDelay: `${i * 80}ms`
    }, className: `relative rounded-2xl p-4 glass ring-1 ${toneMap[k.tone]} bg-gradient-to-br animate-rise hover-lift overflow-hidden`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shimmer-sweep absolute inset-0 rounded-2xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-start justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.2em] text-muted-foreground", children: k.label.toUpperCase() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-2xl md:text-3xl font-bold", children: k.value }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-xs flex items-center gap-1 opacity-90", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "size-3" }),
            " ",
            k.delta
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-10 rounded-xl bg-white/10 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(k.icon, { className: "size-5" }) })
      ] })
    ] }, k.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between mb-3 px-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-4 text-primary" }),
        " Studio Tools"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3", children: tools.map((t, i) => {
        const toolDestinations = {
          "Upload Episode": "/creator-studio/edit",
          "Go Live": "/go-live",
          "Drop a Track": "/creator-studio/edit",
          "Record Podcast": "/creator-studio/edit",
          "Trey-I Studio": "/creator-studio/edit",
          "Schedule": "/creator-studio/edit"
        };
        const isStudio = t.label === "Trey-I Studio" || t.label === "Upload Episode";
        const onClick = () => navigate({
          to: toolDestinations[t.label]
        });
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick, style: {
          animationDelay: `${i * 50}ms`
        }, className: `group relative rounded-2xl p-4 glass neon-border hover-lift tilt-press text-left animate-rise overflow-hidden ${isStudio ? "ring-1 ring-primary/40 glow-gold" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-10 rounded-xl grid place-items-center bg-white/5 group-hover:scale-110 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(t.icon, { className: "size-5 text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 text-sm font-semibold flex items-center gap-1", children: [
            t.label,
            isStudio && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground font-bold", children: "OPEN" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground mt-0.5", children: t.desc })
        ] }, t.label);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3 px-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Film, { className: "size-4 text-primary" }),
          " Your Shows"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate({
          to: "/creator-studio/edit"
        }), className: "text-sm text-primary flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" }),
          " New show"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4", children: shows.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { style: {
        animationDelay: `${i * 80}ms`
      }, className: "group relative rounded-3xl overflow-hidden glass neon-border hover-lift animate-rise", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[16/10] shimmer-sweep", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: s.media, className: "absolute inset-0 size-full object-cover group-hover:scale-105 transition-transform duration-700", alt: "" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "absolute top-3 left-3 text-[10px] tracking-[0.18em] px-2 py-1 rounded-full bg-black/60 backdrop-blur border border-white/15", children: [
            "SEASON ",
            s.season,
            " · EP ",
            s.ep
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-3 right-3 text-[10px] tracking-[0.18em] px-2 py-1 rounded-full bg-primary/20 text-primary border border-primary/40 animate-glow-pulse", children: s.status }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate({
            to: "/creator-studio/edit"
          }), className: "absolute bottom-3 right-3 size-11 rounded-full grid place-items-center bg-white text-black shadow-[0_0_24px_oklch(1_0_0_/_0.4)] hover:scale-110 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "size-5 fill-current" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-base", children: s.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center justify-between text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "size-3" }),
              " 12.4K"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "size-3" }),
              " 1.2K"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "size-3" }),
              " 32:14"
            ] })
          ] })
        ] })
      ] }, s.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3 px-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "size-4 text-primary" }),
          " Top Fans"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate({
          to: "/analytics"
        }), className: "text-sm text-primary flex items-center gap-1", children: [
          "View all ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-4" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl glass neon-border p-3 md:p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-white/5", children: creators.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3 py-3 px-2 rounded-xl hover:bg-white/5 transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs tabular-nums text-muted-foreground w-6", children: [
          "#",
          i + 1
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative size-10 rounded-full conic-ring shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: c.avatar, className: "size-10 rounded-full object-cover", alt: "" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-semibold flex items-center gap-1", children: [
            c.name,
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(VerifiedBadge, { kind: c.verified, className: "!size-3.5" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
            "@",
            c.handle
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground hidden md:block", children: [
          98 - i * 7,
          "h watched"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate({
          to: "/inbox"
        }), className: "px-3 py-1.5 rounded-lg text-xs border border-primary text-primary hover:bg-primary/10", children: "Message" })
      ] }, c.id)) }) })
    ] })
  ] }) });
}
export {
  CreatorHub as component
};
