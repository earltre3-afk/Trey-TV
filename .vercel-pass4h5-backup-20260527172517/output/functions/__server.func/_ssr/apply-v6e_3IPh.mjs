import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useRouterState, O as Outlet, e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { L as Logo } from "./Logo-D0JEzEf4.mjs";
import { A as ArrowLeft, r as ChevronRight, br as Diamond, t as Crown, ai as Star, a2 as Tv, l as ShieldCheck, a9 as Clock, aj as ArrowRight } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "./trey-tv-logo-CG7PjBoN.mjs";
const creatorIcon = "/assets/apply-creator-icon-JK6Sp6IH.jpg";
const goldIcon = "/assets/apply-gold-icon-B8cUu-zP.jpg";
function ApplyRoot() {
  const {
    location
  } = useRouterState();
  if (location.pathname !== "/apply") return /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {});
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ApplyHub, {});
}
const FEATURES = [{
  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Diamond, { className: "h-4 w-4" }),
  label: "Curated",
  sub: "Hand-picked content"
}, {
  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-4 w-4" }),
  label: "Premium",
  sub: "Elite creator status"
}, {
  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-4 w-4" }),
  label: "Exclusive",
  sub: "Invite-only access"
}];
function ApplyHub() {
  const navigate = useNavigate();
  const handleBack = () => {
    void navigate({
      to: "/"
    });
  };
  return (
    /* ── Full-viewport liquid stage ── */
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "apply-scroll-page liquid-stage min-h-screen min-h-[100dvh] gold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid-veil", "aria-hidden": true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "orb-extra", "aria-hidden": true }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleBack, className: "neon-btn-ghost absolute left-4 top-4 mt-[max(0.5rem,env(safe-area-inset-top))] z-30 gap-2 px-3 py-2 text-xs text-white/75 hover:text-white sm:left-6 sm:top-6 sm:text-sm lg:left-8 lg:top-8", "aria-label": "Go back", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Back" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex min-h-[100dvh] max-w-7xl flex-col lg:flex-row lg:items-stretch", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center px-6 sm:px-8 py-10 sm:py-12 pt-[max(3rem,calc(env(safe-area-inset-top)+1.5rem))] text-center lg:w-[42%] lg:items-start lg:px-16 lg:py-20 lg:pt-20 lg:text-left xl:px-24", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "logo-float h-24 md:h-28 lg:h-32" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-6 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl lg:leading-[1.08]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: "Choose Your " }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", { className: "hidden lg:block" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "title-split-blue", children: "Trey TV" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: " Path" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground lg:text-base", children: "Apply to create a channel or request Go verification if you're notable. Every creator starts here." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 hidden space-y-3 lg:block", children: FEATURES.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 backdrop-blur-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[oklch(0.85_0.2_240)]", style: {
              boxShadow: "inset 0 0 0 1px oklch(0.65 0.22 245 / 0.4), 0 0 12px oklch(0.6 0.3 245 / 0.18)"
            }, children: f.icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: f.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: f.sub })
            ] })
          ] }, f.label)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/applications", className: "mt-8 inline-flex items-center gap-1.5 text-xs text-white/45 transition hover:text-white lg:mt-10 lg:text-sm", children: [
            "Check my application status ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 grid grid-cols-3 gap-2 lg:hidden", children: [{
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Diamond, { className: "h-3.5 w-3.5" }),
            label: "Curated"
          }, {
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-3.5 w-3.5" }),
            label: "Premium"
          }, {
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3.5 w-3.5" }),
            label: "Exclusive"
          }].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "neon-btn-ghost justify-center px-2 py-2 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[oklch(0.85_0.2_240)]", children: c.icon }),
            " ",
            c.label
          ] }, c.label)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col justify-center gap-5 px-6 pb-[max(4rem,env(safe-area-inset-bottom))] lg:w-[58%] lg:py-20 lg:pr-16 xl:pr-24", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden items-center gap-3 lg:flex", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-px flex-1 bg-gradient-to-r from-transparent to-[oklch(0.65_0.22_245/0.35)]" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold uppercase tracking-[0.28em] text-[oklch(0.65_0.22_245)]", children: "Select Your Path" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-px flex-1 bg-gradient-to-l from-transparent to-[oklch(0.65_0.22_245/0.35)]" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DesktopPathCard, { variant: "creator", image: creatorIcon, tag: "Apply to Create", tagIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Tv, { className: "h-4 w-4" }), desc: "Launch your own channel, build your brand, and share your vision with the world on Trey TV.", cta: "Start Creator Application", time: "5–7 minutes", to: "/apply/content-creator" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DesktopPathCard, { variant: "gold", image: goldIcon, tag: "Go Verification", tagIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4" }), desc: "Request a Go badge to verify your notable status and stand out on Trey TV.", cta: "Request Go Badge", time: "3–5 minutes", to: "/apply/go-verification" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "hidden text-center text-xs text-white/30 lg:block", children: "Applications are reviewed by the Trey TV team. Approval is not automatic." })
        ] })
      ] })
    ] })
  );
}
function DesktopPathCard({
  variant,
  image,
  tag,
  tagIcon,
  desc,
  cta,
  time,
  to
}) {
  const isGold = variant === "gold";
  const outer = isGold ? "neon-gold" : "neon-blue";
  const accent = isGold ? "text-[oklch(0.92_0.18_88)]" : "text-[oklch(0.85_0.2_240)]";
  const btn = isGold ? "neon-btn-gold" : "neon-btn-blue";
  const ctaText = isGold ? "!text-white" : "";
  const tagBg = isGold ? "bg-[oklch(0.13_0.05_80/0.7)] shadow-[inset_0_0_0_1px_oklch(0.92_0.18_88/0.5)]" : "bg-[oklch(0.13_0.07_252/0.7)] shadow-[inset_0_0_0_1px_oklch(0.85_0.2_240/0.5)]";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `group relative ${outer} p-4 transition-all duration-300 hover:-translate-y-0.5 lg:p-6`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to, className: "absolute inset-0 z-10", "aria-label": cta }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "swoosh-bg" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "liquid-sheen" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative grid grid-cols-[110px_1fr] items-center gap-3 lg:hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: image, alt: tag, loading: "lazy", className: "h-[110px] w-[110px] rounded-2xl object-cover" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: `text-lg font-semibold ${accent}`, children: tag }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: `h-5 w-5 ${accent}` })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 text-xs leading-relaxed text-muted-foreground", children: desc })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-20 mt-3 lg:hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to, className: `${btn} ${ctaText} w-full py-3 text-sm`, children: [
        cta,
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `mt-2 inline-flex items-center gap-1.5 text-xs ${accent}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
        " ",
        time
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative hidden lg:flex lg:gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-2xl", style: {
        padding: "3px",
        background: isGold ? "linear-gradient(135deg, oklch(0.95 0.2 88 / 0.6), oklch(0.78 0.18 80 / 0.15))" : "linear-gradient(135deg, oklch(0.85 0.2 240 / 0.5), oklch(0.55 0.25 245 / 0.15))",
        boxShadow: isGold ? "0 0 30px oklch(0.85 0.2 85 / 0.3)" : "0 0 30px oklch(0.6 0.3 245 / 0.3)"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: image, alt: tag, loading: "lazy", className: "h-[140px] w-[140px] rounded-[13px] object-cover transition-transform duration-500 group-hover:scale-[1.03]" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col justify-between py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${accent} ${tagBg}`, children: [
            tagIcon,
            tag
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-relaxed text-muted-foreground", children: desc })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to, className: `relative z-20 ${btn} ${ctaText} flex-1 py-3 text-sm`, children: [
            cta,
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex shrink-0 items-center gap-1.5 text-xs ${accent}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3.5 w-3.5" }),
            " ",
            time
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  ApplyRoot as component
};
