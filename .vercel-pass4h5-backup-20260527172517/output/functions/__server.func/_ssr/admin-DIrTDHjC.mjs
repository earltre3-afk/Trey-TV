import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useRouterState, O as Outlet, L as Link } from "../_libs/tanstack__react-router.mjs";
import { A as AdminShell } from "./AdminShell-DTn6ktTs.mjs";
import { b as useAuth$1, g as useSupabaseSession, s as supabase } from "./router-BtgGywEC.mjs";
import { b as useQuery } from "../_libs/tanstack__react-query.mjs";
import { f as fetchAdminStats } from "./admin-api-D2pvH5CQ.mjs";
import "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { a5 as Users, t as Crown, as as BadgeCheck, aT as Flag, aI as TriangleAlert, x as Gift, bv as Coins, l as ShieldCheck, D as History, y as ArrowUpRight, S as Sparkles, bw as FileCheckCorner, bx as ScrollText } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "./AppShell-BWcCrjwR.mjs";
import "./Logo-D0JEzEf4.mjs";
import "./trey-tv-logo-CG7PjBoN.mjs";
import "../_libs/tanstack__query-core.mjs";
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
function Admin() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname
  });
  const {
    isAdmin
  } = useAuth$1();
  const {
    adminRole,
    user: supaUser
  } = useSupabaseSession();
  if (!isAdmin) return null;
  if (pathname !== "/admin") return /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {});
  const {
    data: stats,
    isLoading
  } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: fetchAdminStats,
    refetchInterval: 3e4
  });
  const {
    data: recentAudit
  } = useQuery({
    queryKey: ["admin", "recent-audit"],
    queryFn: async () => {
      const {
        data
      } = await supabase.from("admin_audit_log").select("*").order("created_at", {
        ascending: false
      }).limit(8);
      return data ?? [];
    },
    refetchInterval: 3e4
  });
  const tiles = [{
    label: "Total users",
    value: stats?.totalUsers ?? "—",
    icon: Users,
    color: "oklch(0.82 0.15 215)",
    to: "/admin/users"
  }, {
    label: "Pending creators",
    value: stats?.pendingCreators ?? "—",
    icon: Crown,
    color: "oklch(0.82 0.16 85)",
    to: "/admin/applications"
  }, {
    label: "Pending verification",
    value: stats?.pendingVerifications ?? "—",
    icon: BadgeCheck,
    color: "oklch(0.82 0.16 85)",
    to: "/admin/verification"
  }, {
    label: "Open reports",
    value: stats?.pendingReports ?? "—",
    icon: Flag,
    color: "oklch(0.65 0.24 15)",
    to: "/admin/reports"
  }, {
    label: "Banned users",
    value: stats?.activeBans ?? "—",
    icon: TriangleAlert,
    color: "oklch(0.65 0.24 15)",
    to: "/admin/users"
  }, {
    label: "Gold verified",
    value: stats?.goldVerifiedUsers ?? "—",
    icon: BadgeCheck,
    color: "oklch(0.82 0.16 85)",
    to: "/admin/verification"
  }, {
    label: "Pending redemptions",
    value: stats?.pendingRedemptions ?? "—",
    icon: Gift,
    color: "oklch(0.7 0.25 340)",
    to: "/admin/rewards"
  }, {
    label: "Points issued",
    value: stats?.totalPointsIssued ?? "—",
    icon: Coins,
    color: "oklch(0.78 0.18 150)",
    to: "/admin/rewards"
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminShell, { title: "Owner Command Center", subtitle: "Platform control · users · creators · content · rewards", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl liquid-glass border border-primary/30 p-5 flex items-center gap-3 glow-gold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-12 rounded-2xl grid place-items-center bg-primary/15 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "size-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] tracking-[0.3em] text-primary", children: [
          (adminRole ?? "ADMIN").toUpperCase(),
          " MODE"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-bold truncate", children: supaUser?.email ?? "Demo admin (mock)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: "All actions are logged to the audit trail." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin/audit-log", className: "hidden md:inline-flex items-center gap-1.5 px-3 h-9 rounded-xl glass border border-white/10 text-xs font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "size-3.5" }),
        " Audit log"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: tiles.map((k, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: k.to, className: "group relative rounded-2xl liquid-glass border border-white/10 p-4 block overflow-hidden hover-lift transition", style: {
      animation: `counter-up 0.5s ${i * 60}ms both`
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500", style: {
        background: `radial-gradient(circle at 30% 0%, color-mix(in oklab, ${k.color} 30%, transparent), transparent 60%)`
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "absolute inset-0 shimmer-sweep pointer-events-none opacity-0 group-hover:opacity-100" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-9 rounded-xl grid place-items-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6", style: {
            background: `color-mix(in oklab, ${k.color} 20%, transparent)`,
            color: k.color,
            boxShadow: `0 0 20px color-mix(in oklab, ${k.color} 35%, transparent)`
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(k.icon, { className: "size-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.2em] text-muted-foreground", children: k.label.toUpperCase() })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-2xl font-bold animate-counter-up", style: {
          textShadow: `0 0 18px color-mix(in oklab, ${k.color} 40%, transparent)`
        }, children: isLoading ? "…" : k.value }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "absolute top-0 right-0 size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition" })
      ] })
    ] }, k.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl liquid-glass border border-white/10 p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-bold flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-4 text-primary" }),
          " Quick actions"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(QuickAction, { to: "/admin/applications", icon: Crown, label: "Review creators", tone: "gold" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(QuickAction, { to: "/admin/verification", icon: BadgeCheck, label: "Verification queue", tone: "gold" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(QuickAction, { to: "/admin/reports", icon: Flag, label: "Reports inbox", tone: "red" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(QuickAction, { to: "/admin/content-approval", icon: FileCheckCorner, label: "Content approval", tone: "blue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(QuickAction, { to: "/admin/site-editor", icon: ScrollText, label: "Edit live site", tone: "blue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(QuickAction, { to: "/admin/settings", icon: ShieldCheck, label: "Platform settings", tone: "purple" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl liquid-glass border border-white/10 p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-bold flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "size-4 text-[oklch(0.7_0.25_340)]" }),
            " Recent admin activity"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin/audit-log", className: "text-xs text-muted-foreground hover:text-foreground", children: [
            "View all ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "inline size-3" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 max-h-[320px] overflow-y-auto", children: (recentAudit?.length ?? 0) === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground p-4 text-center", children: "No admin actions logged yet." }) : recentAudit.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-2xl glass border border-white/10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold truncate", children: row.action }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground shrink-0", children: new Date(row.created_at).toLocaleString() })
          ] }),
          row.target_type && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground truncate", children: [
            row.target_type,
            ": ",
            row.target_id
          ] }),
          row.reason && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground/80 mt-1 italic", children: [
            '"',
            row.reason,
            '"'
          ] })
        ] }, row.id)) })
      ] })
    ] })
  ] });
}
function QuickAction({
  to,
  icon: Icon,
  label,
  tone
}) {
  const colors = {
    gold: "oklch(0.82 0.16 85)",
    blue: "oklch(0.82 0.15 215)",
    red: "oklch(0.65 0.24 15)",
    purple: "oklch(0.7 0.25 340)"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to, className: "group p-3 rounded-2xl glass border border-white/10 hover:border-white/30 transition flex items-center gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-9 rounded-xl grid place-items-center", style: {
      background: `color-mix(in oklab, ${colors[tone]} 18%, transparent)`,
      color: colors[tone]
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-4" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold flex-1", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "size-3.5 text-muted-foreground group-hover:text-foreground transition" })
  ] });
}
export {
  Admin as component
};
