import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { A as AppShell } from "./AppShell-BWcCrjwR.mjs";
import { P as PublicFooter } from "./PublicFooter-CCf5tIyl.mjs";
import { L as LEGAL_LAST_UPDATED } from "./router-BtgGywEC.mjs";
import { A as ArrowLeft, l as ShieldCheck, S as Sparkles } from "../_libs/lucide-react.mjs";
function LegalTOC({ sections, compact = false }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: compact ? "" : "rounded-2xl liquid-glass border border-white/10 p-4", children: [
    !compact && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.25em] text-muted-foreground mb-3", children: "ON THIS PAGE" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "space-y-1 text-sm", children: sections.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "a",
      {
        href: `#${s.id}`,
        className: "group flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5 text-[10px] font-mono text-muted-foreground tabular-nums w-5 shrink-0", children: String(i + 1).padStart(2, "0") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/80 group-hover:text-foreground transition leading-snug", children: s.heading })
        ]
      }
    ) }, s.id)) })
  ] });
}
function LegalSection({ section }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: section.id, className: "scroll-mt-24", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "details",
    {
      open: true,
      className: "group rounded-2xl liquid-glass border border-white/10 hover:border-white/20 transition-colors lg:open:border-white/15",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "lg:pointer-events-none list-none cursor-pointer p-5 lg:p-6 flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-base sm:text-lg font-bold tracking-tight", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary mr-2 font-mono text-[11px] align-middle hidden sm:inline", children: "§" }),
            section.heading
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "lg:hidden text-muted-foreground transition-transform group-open:rotate-180", "aria-hidden": true, children: "▾" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 lg:px-6 pb-5 lg:pb-6 -mt-2 space-y-3 text-sm leading-relaxed text-foreground/80", children: [
          section.body?.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: p }, i)),
          section.list && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "list-disc pl-5 space-y-1.5 marker:text-primary/70", children: section.list.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: item }, i)) })
        ] })
      ]
    }
  ) });
}
function LegalLayout({
  policy,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { wide: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative pb-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-[28px] liquid-glass neon-border p-6 lg:p-10 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "aria-hidden": true, className: "absolute inset-0 pointer-events-none", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-32 -right-20 size-[60vmin] rounded-full bg-[radial-gradient(closest-side,oklch(0.82_0.15_215/0.25),transparent)] blur-3xl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-32 -left-20 size-[60vmin] rounded-full bg-[radial-gradient(closest-side,oklch(0.82_0.16_85/0.18),transparent)] blur-3xl" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/legal", className: "inline-flex items-center gap-1.5 text-[11px] tracking-[0.22em] text-muted-foreground hover:text-foreground transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-3.5" }),
          " LEGAL & SAFETY"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display mt-3 text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight bg-gradient-to-br from-white via-white/85 to-white/60 bg-clip-text text-transparent", children: policy.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm sm:text-base text-foreground/70 max-w-2xl", children: policy.summary }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap items-center gap-2 text-[11px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full liquid-glass border border-white/10 text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "size-3" }),
            " Last updated: ",
            LEGAL_LAST_UPDATED
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full liquid-glass border border-white/10 text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3 text-primary" }),
            " Trey TV policy"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[260px_minmax(0,1fr)] gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "hidden lg:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky top-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LegalTOC, { sections: policy.sections }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 lg:space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "lg:hidden rounded-2xl liquid-glass border border-white/10 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer text-xs tracking-[0.22em] text-muted-foreground select-none", children: "ON THIS PAGE" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LegalTOC, { sections: policy.sections, compact: true }) })
        ] }),
        policy.sections.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(LegalSection, { section: s }, s.id)),
        children,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/legal", className: "inline-flex items-center gap-1.5 px-4 h-10 rounded-xl liquid-glass border border-white/10 text-sm font-semibold hover:border-white/30 transition", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }),
            " Back to Legal Hub"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/legal/data-deletion", className: "inline-flex items-center gap-1.5 px-4 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-bold glow-gold tilt-press", children: "Data Request" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PublicFooter, {})
  ] }) });
}
export {
  LegalLayout as L
};
