import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { C as CreatorStudioLayout, S as SectionHeader, a as CreatorMetricCard, b as CreatorActionButton, c as CreatorStatusBadge } from "./CreatorStudioLayout-DnMAX3C9.mjs";
import { b as useAuth$1 } from "./router-BtgGywEC.mjs";
import { u as useCreatorStudio } from "./use-creator-studio-BkHsMg4r.mjs";
import "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { c as ChartColumn, y as ArrowUpRight, j as Eye, a9 as Clock, a5 as Users, b as Heart, u as Gem, bO as FileClock, ax as CircleCheck, aw as Trophy, S as Sparkles, r as ChevronRight, aM as MessageSquare, W as WandSparkles, P as Plus, an as Upload, b7 as Film, a2 as Tv, aY as Calendar, B as Bell } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "./AppShell-BWcCrjwR.mjs";
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
function CreatorStudioDashboard() {
  const {
    user
  } = useAuth$1();
  const {
    submissions
  } = useCreatorStudio();
  const navigate = useNavigate();
  const myName = user?.name?.split(" ")[0] ?? "Creator";
  const channelHandle = user?.handle ?? "you";
  const pending = submissions.filter((s) => s.status === "pending").length;
  const approved = submissions.filter((s) => s.status === "approved" || s.status === "published").length;
  const needsChanges = submissions.filter((s) => s.status === "needs_changes").length;
  const top = submissions.find((s) => s.status === "published") ?? submissions[0];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(CreatorStudioLayout, { title: `Welcome back, ${myName}.`, subtitle: "Your channel is live. Your audience is watching.", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate({
      to: "/creator-studio/edit"
    }), className: "px-3.5 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold tilt-press hover-lift inline-flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "size-4" }),
      " Upload Episode"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/u/$uid", params: {
      uid: user?.uid ?? "trey"
    }, className: "px-3 py-2 rounded-xl text-sm font-semibold glass border border-white/15 hover:bg-white/5 inline-flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tv, { className: "size-4" }),
      " View Channel"
    ] })
  ] }), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: ChartColumn, title: "Channel performance", action: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/creator-studio/analytics", className: "text-sm text-primary inline-flex items-center gap-1", children: [
        "Analytics ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "size-3.5" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorMetricCard, { label: "Total Views", value: "184.2K", delta: "+12.4% this week", icon: Eye, tone: "cyan" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorMetricCard, { label: "Watch Time", value: "9,420h", delta: "+8.1%", icon: Clock, tone: "purple" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorMetricCard, { label: "Followers", value: "32.7K", delta: "+1,204 new", icon: Users, tone: "magenta" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorMetricCard, { label: "Engagement", value: "9.7%", delta: "+1.3%", icon: Heart, tone: "gold" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorMetricCard, { label: "Rewards Earned", value: "12,480 pts", sub: "≈ $312 in tips", icon: Gem, tone: "gold" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorMetricCard, { label: "Pending Submissions", value: String(pending), sub: "In admin review", icon: FileClock, tone: "purple" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorMetricCard, { label: "Approved Episodes", value: String(approved), sub: "Live on the network", icon: CircleCheck, tone: "green" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorMetricCard, { label: "Best Performer", value: top?.title?.slice(0, 18) ?? "—", sub: "Last 30 days", icon: Trophy, tone: "cyan" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 rounded-3xl glass neon-border p-4 md:p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: Sparkles, title: "Today on your channel", action: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/creator-studio/interactions", className: "text-sm text-primary inline-flex items-center gap-1", children: [
          "Open inbox ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-3.5" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "divide-y divide-white/5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TodayRow, { icon: MessageSquare, title: "14 new comments", desc: "Across 3 episodes — 4 mention you directly.", tone: "magenta" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TodayRow, { icon: Users, title: "+128 new followers", desc: "Up 22% vs yesterday's pace.", tone: "purple" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TodayRow, { icon: Gem, title: "3 new gifts received", desc: "Top supporter: @nightowl — 500 pts.", tone: "gold" }),
          needsChanges > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TodayRow, { icon: FileClock, title: `${needsChanges} episode${needsChanges > 1 ? "s" : ""} need changes`, desc: "Admin left feedback. Open content to review.", tone: "magenta", href: "/creator-studio/submissions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TodayRow, { icon: Trophy, title: "Performance spike", desc: '"Studio Sessions E8" hit Top 10 in Music.', tone: "cyan" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TodayRow, { icon: WandSparkles, title: "Trey-I suggestion", desc: "Your behind-the-scenes clips are saving 2.3× higher — make a series.", tone: "gold" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl glass neon-border p-4 md:p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: Plus, title: "Quick actions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorActionButton, { icon: Upload, label: "Upload", desc: "New video / episode", to: "/creator-studio/edit", accent: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorActionButton, { icon: Film, label: "New Show", desc: "Set up a series", to: "/creator-studio/schedule" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorActionButton, { icon: Tv, label: "Edit Channel", desc: "Banner, bio, links", to: "/creator-studio/channel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorActionButton, { icon: Users, label: "View Fans", desc: "Top supporters", to: "/creator-studio/fans" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorActionButton, { icon: Calendar, label: "Schedule", desc: "Premiere setup", to: "/creator-studio/schedule" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorActionButton, { icon: WandSparkles, label: "Ask Trey-I", desc: "Growth ideas", onClick: () => {
          } })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl glass neon-border p-4 md:p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: Film, title: "Recent submissions", action: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/creator-studio/submissions", className: "text-sm text-primary inline-flex items-center gap-1", children: [
        "All content ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-3.5" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2", children: [
        submissions.slice(0, 4).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative size-14 rounded-xl overflow-hidden shrink-0 bg-white/5", children: s.thumbnail_url && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: s.thumbnail_url, className: "size-full object-cover", alt: "" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold truncate", children: s.title || "Untitled draft" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground truncate", children: [
              s.show_title || "—",
              " · S",
              s.season_number,
              " E",
              s.episode_number,
              " · ",
              s.duration
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorStatusBadge, { status: s.status })
        ] }, s.content_id)),
        submissions.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-sm text-muted-foreground text-center py-6", children: [
          "No submissions yet. ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/creator-studio/edit", className: "text-primary font-semibold", children: "Upload your first episode →" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl glass neon-border p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "size-5 text-primary shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "Your public channel link" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground truncate", children: [
          "trey.tv/@",
          channelHandle
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/u/$uid", params: {
        uid: user?.uid ?? "trey"
      }, className: "px-3 py-2 rounded-xl text-sm font-semibold border border-primary/40 text-primary hover:bg-primary/10 inline-flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "size-4" }),
        " Open channel"
      ] })
    ] })
  ] });
}
function TodayRow({
  icon: Icon,
  title,
  desc,
  tone,
  href
}) {
  const toneCls = {
    gold: "text-primary bg-primary/10 ring-primary/30",
    cyan: "text-[oklch(0.82_0.15_215)] bg-[oklch(0.82_0.15_215_/_0.1)] ring-[oklch(0.82_0.15_215_/_0.3)]",
    purple: "text-[oklch(0.78_0.22_300)] bg-[oklch(0.65_0.22_300_/_0.1)] ring-[oklch(0.65_0.22_300_/_0.3)]",
    magenta: "text-[oklch(0.78_0.25_340)] bg-[oklch(0.7_0.25_340_/_0.1)] ring-[oklch(0.7_0.25_340_/_0.3)]"
  }[tone];
  const content = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `size-10 rounded-xl grid place-items-center ring-1 ${toneCls}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-5" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: desc })
    ] }),
    href && /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-4 text-muted-foreground" })
  ] });
  if (href) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: href, className: "flex items-center gap-3 py-3 px-1 hover:bg-white/5 rounded-xl transition", children: content }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "flex items-center gap-3 py-3 px-1", children: content });
}
export {
  CreatorStudioDashboard as component
};
