import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, b as useRouterState, O as Outlet, L as Link } from "../_libs/tanstack__react-router.mjs";
import { L as Logo } from "./Logo-D0JEzEf4.mjs";
import { e as Mic, S as Sparkles, W as WandSparkles, j as Eye, aj as ArrowRight, C as Compass, t as Crown, d as Image } from "../_libs/lucide-react.mjs";
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
function Onboarding() {
  const nav = useNavigate();
  const pathname = useRouterState({
    select: (s) => s.location.pathname
  });
  if (pathname.startsWith("/onboarding/")) return /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {});
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-screen w-full overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "aria-hidden": true, className: "pointer-events-none absolute inset-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-40 left-1/2 -translate-x-1/2 size-[80vmin] rounded-full bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.45),oklch(0.7_0.25_340_/_0.4),oklch(0.65_0.22_300_/_0.45),oklch(0.82_0.15_215_/_0.4),oklch(0.82_0.16_85_/_0.45))] blur-3xl opacity-70 animate-conic-spin" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-background to-transparent" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-[1100px] mx-auto px-4 lg:px-8 pt-10 pb-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-3 animate-rise", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "h-20 mx-auto" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.4em] text-primary", children: "ENTER THE UNIVERSE" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl sm:text-5xl font-bold leading-tight", children: [
          "Choose your path into ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gradient-prescribe", children: "Trey TV" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto", children: "Talk it out with Trey-I or set things up the classic way. Either road takes you to the same premium universe." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 grid md:grid-cols-2 gap-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/onboarding/voice", className: "group relative text-left rounded-3xl liquid-glass liquid-hover neon-border overflow-hidden p-6 sm:p-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-[oklch(0.7_0.25_340_/_0.35)] blur-3xl group-hover:bg-[oklch(0.7_0.25_340_/_0.5)] transition" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-14 rounded-2xl conic-ring grid place-items-center bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "size-6 text-primary" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 text-[10px] tracking-[0.3em] text-primary", children: "RECOMMENDED · VOICE" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-1 text-2xl font-bold", children: "Setup with Trey-I" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Have a natural conversation. Trey-I asks the right questions and builds your profile while you talk. Cinematic, fast, and zero forms." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "mt-4 space-y-1.5 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3 text-primary" }),
                " Voice-first onboarding"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(WandSparkles, { className: "size-3 text-[oklch(0.7_0.25_340)]" }),
                " Auto-generated bio + accent"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "size-3 text-[oklch(0.82_0.15_215)]" }),
                " Live profile preview"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground font-semibold text-sm glow-gold", children: [
              "Start voice setup ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-4" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => nav({
          to: "/onboarding/manual"
        }), className: "group relative text-left rounded-3xl liquid-glass liquid-hover neon-border overflow-hidden p-6 sm:p-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-[oklch(0.82_0.15_215_/_0.3)] blur-3xl group-hover:bg-[oklch(0.82_0.15_215_/_0.5)] transition" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-14 rounded-2xl border border-white/15 grid place-items-center bg-white/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Compass, { className: "size-6 text-[oklch(0.82_0.15_215)]" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 text-[10px] tracking-[0.3em] text-[oklch(0.82_0.15_215)]", children: "CLASSIC · MANUAL" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-1 text-2xl font-bold", children: "Manual Setup" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The familiar flow. Enter your info, pick your interests, finish setup. Just polished." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "mt-4 space-y-1.5 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3 text-[oklch(0.82_0.15_215)]" }),
                " Step-by-step form"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-3 text-primary" }),
                " Choose your role on signup"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "size-3 text-[oklch(0.7_0.25_340)]" }),
                " Visual preview at the end"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full liquid-glass border border-white/15 font-semibold text-sm", children: [
              "Set up manually ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-4" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => nav({
        to: "/onboarding/import-screenshot"
      }), className: "group relative w-full text-left rounded-3xl liquid-glass liquid-hover neon-border overflow-hidden p-6 sm:p-7", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -top-12 -right-12 size-44 rounded-full bg-[oklch(0.78_0.18_150_/_0.25)] blur-3xl group-hover:bg-[oklch(0.78_0.18_150_/_0.4)] transition" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-col sm:flex-row sm:items-center gap-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-14 shrink-0 rounded-2xl border border-white/15 grid place-items-center bg-white/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "size-6 text-[oklch(0.78_0.18_150)]" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.3em] text-[oklch(0.78_0.18_150)]", children: "FAST · IMPORT" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-0.5 text-xl font-bold", children: "Import From Screenshot" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Upload a screenshot of your public profile and Trey TV will turn it into a profile draft you can edit before publishing." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "size-3 text-[oklch(0.78_0.18_150)]" }),
                " Upload your screenshot"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3 text-primary" }),
                " AI extracts your profile info"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "size-3 text-[oklch(0.82_0.15_215)]" }),
                " Review & edit before publishing"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full liquid-glass border border-[oklch(0.78_0.18_150_/_0.4)] text-[oklch(0.78_0.18_150)] font-semibold text-sm whitespace-nowrap", children: [
            "Import From Screenshot ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-4" })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 text-center text-xs text-muted-foreground", children: [
        "Already have an account? ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "text-primary font-semibold hover:underline", children: "Log in" })
      ] })
    ] })
  ] });
}
export {
  Onboarding as component
};
