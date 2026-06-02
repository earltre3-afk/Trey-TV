import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { A as AppShell } from "./AppShell-BWcCrjwR.mjs";
import { P as PublicFooter } from "./PublicFooter-CCf5tIyl.mjs";
import { P as POLICY_INDEX, L as LEGAL_LAST_UPDATED } from "./router-BtgGywEC.mjs";
import "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { l as ShieldCheck, S as Sparkles, F as FileText, O as Search, a5 as Users, aF as Trash2, b7 as Film, t as Crown, q as CreditCard, bA as Copyright, bB as Cookie, aI as TriangleAlert, bC as Accessibility, y as ArrowUpRight } from "../_libs/lucide-react.mjs";
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
const ICONS = {
  Accessibility,
  AlertTriangle: TriangleAlert,
  Cookie,
  Copyright,
  CreditCard,
  Crown,
  FileText,
  Film,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users
};
function LegalHubCard({
  slug,
  title,
  summary,
  icon = "FileText"
}) {
  const Icon = ICONS[icon] ?? FileText;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Link,
    {
      to: "/legal/$slug",
      params: { slug },
      className: "group relative block rounded-2xl liquid-glass border border-white/10 p-5 hover:border-white/25 transition-all overflow-hidden",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-[oklch(0.82_0.15_215/0.08)] via-transparent to-[oklch(0.82_0.16_85/0.06)] pointer-events-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-10 rounded-xl bg-primary/15 text-primary grid place-items-center shrink-0 ring-1 ring-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm sm:text-base font-bold leading-tight", children: title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "size-4 text-muted-foreground group-hover:text-foreground group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground leading-relaxed", children: summary })
          ] })
        ] })
      ]
    }
  );
}
const CATEGORIES = [{
  id: "core",
  label: "Core"
}, {
  id: "user",
  label: "Community"
}, {
  id: "creator",
  label: "Creators"
}, {
  id: "ai",
  label: "AI"
}, {
  id: "support",
  label: "Support"
}];
function LegalHub() {
  const [q, setQ] = reactExports.useState("");
  const [tab, setTab] = reactExports.useState("all");
  const filtered = POLICY_INDEX.filter((p) => {
    if (tab !== "all" && p.category !== tab) return false;
    if (!q.trim()) return true;
    const needle = q.toLowerCase();
    return p.title.toLowerCase().includes(needle) || p.summary.toLowerCase().includes(needle);
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { wide: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-[28px] liquid-glass neon-border p-6 lg:p-10 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "absolute inset-0 pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-40 left-1/3 size-[80vmin] rounded-full bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.25),oklch(0.7_0.25_340_/_0.2),oklch(0.82_0.15_215_/_0.25),oklch(0.82_0.16_85_/_0.25))] blur-3xl opacity-50" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass border border-white/15 text-[10px] tracking-[0.22em]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "size-3 text-primary" }),
          " TRUST & SAFETY"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display mt-3 text-3xl sm:text-5xl xl:text-6xl font-black tracking-tight bg-gradient-to-br from-white via-white/85 to-white/55 bg-clip-text text-transparent", children: "Legal & Safety" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm sm:text-base text-foreground/70 max-w-2xl", children: "How Trey TV works, what we expect, and the rights you have. Browse policies, request data actions, and learn how we keep the community welcoming." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex flex-wrap items-center gap-2 text-[11px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full liquid-glass border border-white/10 text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3 text-primary" }),
            " Last updated: ",
            LEGAL_LAST_UPDATED
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full liquid-glass border border-white/10 text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "size-3" }),
            " ",
            POLICY_INDEX.length,
            " policies"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid sm:grid-cols-[1fr_auto] gap-3 items-stretch", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "relative flex items-center gap-2 rounded-2xl liquid-glass border border-white/10 px-3 h-11 focus-within:border-primary/50 transition", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "size-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Search policies…", className: "flex-1 bg-transparent text-sm focus:outline-none" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { active: tab === "all", onClick: () => setTab("all"), children: "All" }),
            CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { active: tab === c.id, onClick: () => setTab(c.id), children: c.label }, c.id))
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-3 gap-3 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ActionTile, { to: "/legal/data-deletion", title: "Data request", body: "Delete, export, or correct your data.", accent: "gold" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ActionTile, { to: "/legal/community-guidelines", title: "Report content", body: "See what's allowed and how to flag violations.", accent: "cyan" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ActionTile, { to: "/legal/dmca", title: "Copyright complaint", body: "File a DMCA takedown notice.", accent: "magenta" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-3", children: [
      filtered.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(LegalHubCard, { slug: p.slug, title: p.title, summary: p.summary, icon: p.icon }, p.slug)),
      filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-full text-center text-sm text-muted-foreground py-10 rounded-2xl liquid-glass border border-white/10", children: "No policies match that search." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PublicFooter, {})
  ] }) });
}
function Chip({
  active,
  onClick,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick, className: `px-3 h-9 rounded-full text-xs font-semibold border transition ${active ? "border-primary bg-primary/15 text-primary" : "border-white/10 text-foreground/70 hover:border-white/25 hover:text-foreground"}`, children });
}
function ActionTile({
  to,
  title,
  body,
  accent
}) {
  const accents = {
    gold: "from-[oklch(0.82_0.16_85/0.18)] to-transparent border-[oklch(0.82_0.16_85/0.35)]",
    cyan: "from-[oklch(0.82_0.15_215/0.18)] to-transparent border-[oklch(0.82_0.15_215/0.35)]",
    magenta: "from-[oklch(0.7_0.25_340/0.18)] to-transparent border-[oklch(0.7_0.25_340/0.35)]"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to, className: `relative block rounded-2xl border bg-gradient-to-br ${accents[accent]} p-5 hover:translate-y-[-1px] transition-all`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs tracking-[0.18em] text-muted-foreground", children: "QUICK ACTION" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-base font-bold", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-xs text-foreground/70", children: body })
  ] });
}
export {
  LegalHub as component
};
