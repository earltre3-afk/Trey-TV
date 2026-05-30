import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { C as CreatorStudioLayout, a as CreatorMetricCard, S as SectionHeader } from "./CreatorStudioLayout-DnMAX3C9.mjs";
import { e as creators } from "./router-BtgGywEC.mjs";
import { S as Sheet, a as SheetContent } from "./sheet-CrRPJvha.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { a5 as Users, T as TrendingUp, u as Gem, b as Heart, O as Search, t as Crown, ai as Star, Y as Flame, c4 as UserCheck, aM as MessageSquare, X } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "./AppShell-BWcCrjwR.mjs";
import "./Logo-D0JEzEf4.mjs";
import "./trey-tv-logo-CG7PjBoN.mjs";
import "./use-creator-studio-BkHsMg4r.mjs";
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
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/tailwind-merge.mjs";
const SEGMENTS = [{
  id: "all",
  label: "All fans",
  icon: Users
}, {
  id: "top",
  label: "Top supporters",
  icon: Crown
}, {
  id: "new",
  label: "New this week",
  icon: Star
}, {
  id: "active",
  label: "Most engaged",
  icon: Flame
}, {
  id: "returning",
  label: "Returning",
  icon: UserCheck
}];
function FansPage() {
  const [seg, setSeg] = reactExports.useState("all");
  const [q, setQ] = reactExports.useState("");
  const [open, setOpen] = reactExports.useState(null);
  const [followerCount, setFollowerCount] = reactExports.useState("32.7K");
  const fans = reactExports.useMemo(() => {
    const more = [...creators, ...creators];
    return more.map((c, i) => ({
      id: `${c.id}-${i}`,
      name: c.name,
      handle: c.handle,
      avatar: c.avatar,
      pts: 2400 - i * 180,
      segment: i < 3 ? "top" : i < 5 ? "new" : i < 7 ? "active" : "returning",
      joined: i < 5 ? "This week" : `${i - 1}w ago`,
      watched: 12 + i * 3
    }));
  }, []);
  const filtered = fans.filter((f) => seg === "all" || f.segment === seg).filter((f) => !q || `${f.name} ${f.handle}`.toLowerCase().includes(q.toLowerCase()));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(CreatorStudioLayout, { title: "Your fans", subtitle: "The people powering your channel.", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorMetricCard, { label: "Total Fans", value: followerCount, delta: "+1.2K this week", icon: Users, tone: "cyan" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorMetricCard, { label: "Returning", value: "68%", delta: "+4%", icon: TrendingUp, tone: "purple" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorMetricCard, { label: "Top Supporter", value: "@nightowl", sub: "2,400 pts gifted", icon: Gem, tone: "gold" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorMetricCard, { label: "Most Engaged", value: "Late Night fans", icon: Heart, tone: "magenta" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl glass neon-border p-3 flex flex-col md:flex-row gap-3 md:items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Search fans by name or @handle…", className: "w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1 py-1", children: SEGMENTS.map((s) => {
      const active = seg === s.id;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setSeg(s.id), className: `shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition flex items-center gap-1.5 ${active ? "bg-primary/15 text-primary border-primary/40 glow-gold" : "border-white/10 text-muted-foreground hover:text-foreground"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(s.icon, { className: "size-3.5" }),
        " ",
        s.label
      ] }, s.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl glass neon-border p-2 md:p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: Gem, title: `${filtered.length} fans` }),
      filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center text-sm text-muted-foreground", children: "No fans match this filter." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-white/5", children: filtered.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3 py-3 px-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs tabular-nums text-muted-foreground w-6 text-right", children: [
          "#",
          i + 1
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setOpen(f), className: "flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-90", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative size-10 rounded-full conic-ring shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: f.avatar, className: "size-10 rounded-full object-cover", alt: "" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold truncate", children: f.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground truncate", children: [
              "@",
              f.handle,
              " · ",
              f.pts,
              " pts gifted · joined ",
              f.joined
            ] })
          ] })
        ] }),
        f.segment === "top" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden md:inline text-[10px] tracking-[0.18em] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/30 uppercase", children: "Top" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => toast.success(`Thanked @${f.handle}`), className: "px-3 py-1.5 rounded-lg text-xs border border-primary text-primary hover:bg-primary/10 inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "size-3.5" }),
          " Thank"
        ] })
      ] }, f.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open: !!open, onOpenChange: (o) => !o && setOpen(null), children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheetContent, { side: "right", className: "bg-background/95 backdrop-blur-xl border-l border-white/10 w-full sm:max-w-md", children: open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-14 rounded-2xl conic-ring", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: open.avatar, className: "size-14 rounded-2xl object-cover", alt: "" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold truncate", children: open.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            "@",
            open.handle
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setOpen(null), className: "ml-auto size-8 grid place-items-center rounded-lg hover:bg-white/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Pts gifted", value: String(open.pts) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Watched", value: `${open.watched} eps` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Joined", value: open.joined })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl glass border border-white/10 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.2em] text-primary mb-1", children: "FAVORITE SHOWS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: ["Late Night with Trey", "Studio Sessions"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10", children: s }, s)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toast.success("Message sent"), className: "flex-1 px-3 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold", children: "Send message" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toast.success("Gifted Glow Heart back"), className: "px-3 py-2 rounded-xl text-sm font-semibold glass border border-primary/40 text-primary", children: "Gift back" })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground text-center", children: "More fan insights coming as your channel grows." })
  ] });
}
function Stat({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-white/5 ring-1 ring-white/10 p-2.5 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.18em] uppercase text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold mt-0.5", children: value })
  ] });
}
export {
  FansPage as component
};
