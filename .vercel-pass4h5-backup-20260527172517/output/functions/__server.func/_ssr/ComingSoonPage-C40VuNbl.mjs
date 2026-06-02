import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useGoBack } from "./use-go-back-DIwqgoNo.mjs";
import { A as AppShell } from "./AppShell-BWcCrjwR.mjs";
import { A as ArrowLeft, S as Sparkles } from "../_libs/lucide-react.mjs";
function ComingSoonPage({
  title,
  tagline,
  icon: Icon = Sparkles,
  accent = "primary",
  bullets,
  cta
}) {
  const goBack = useGoBack("/");
  const accentClass = {
    primary: "text-primary border-primary/40 bg-primary/10 glow-gold",
    magenta: "text-[oklch(0.7_0.25_340)] border-[oklch(0.7_0.25_340_/_0.5)] bg-[oklch(0.7_0.25_340_/_0.1)] glow-magenta",
    cyan: "text-[oklch(0.82_0.15_215)] border-[oklch(0.82_0.15_215_/_0.5)] bg-[oklch(0.82_0.15_215_/_0.1)]",
    purple: "text-[oklch(0.65_0.22_300)] border-[oklch(0.65_0.22_300_/_0.5)] bg-[oklch(0.65_0.22_300_/_0.1)] glow-purple"
  }[accent];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 -mt-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: goBack, className: "inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }),
      " Back"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-3xl border border-white/10 glass-strong p-6 lg:p-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "absolute -top-16 -right-16 size-56 rounded-full bg-primary/15 blur-3xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "absolute -bottom-16 -left-16 size-56 rounded-full bg-[oklch(0.7_0.25_340_/_0.15)] blur-3xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,oklch(0.82_0.16_85_/_0.6),transparent)]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-start gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `size-14 grid place-items-center rounded-2xl border ${accentClass} animate-glow-pulse`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-7" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] tracking-[0.2em] text-muted-foreground", children: "TREY · TV" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 text-2xl lg:text-3xl font-bold", children: title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground max-w-prose", children: tagline })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "relative mt-6 grid sm:grid-cols-2 gap-2", children: bullets.map((b, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "li",
        {
          style: { animationDelay: `${i * 60}ms` },
          className: "animate-rise rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm flex items-start gap-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-4 text-primary mt-0.5 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: b })
          ]
        },
        b
      )) }),
      cta && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: cta.to,
          className: "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground glow-gold hover-lift tilt-press",
          children: cta.label
        }
      ) })
    ] })
  ] }) });
}
export {
  ComingSoonPage as C
};
