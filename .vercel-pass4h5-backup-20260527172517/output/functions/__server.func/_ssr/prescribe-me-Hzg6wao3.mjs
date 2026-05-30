import { j as jsxRuntimeExports, r as reactExports, R as React__default } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { t as treyTvLogo } from "./trey-tv-logo-CG7PjBoN.mjs";
import { s as supabase } from "./supabase-BQ18xbNk.mjs";
import { g as useSupabaseSession } from "./router-BtgGywEC.mjs";
import "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { z as ChevronLeft, D as History, l as ShieldCheck, J as Coffee, S as Sparkles, K as Frown, N as Target, O as Search, Q as Leaf, Y as Flame, _ as Cloud, Z as Zap, b as Heart, $ as Smile, k as Check, r as ChevronRight, a0 as Music, a1 as Drama, a2 as Tv, e as Mic, a3 as Sofa, a4 as Play, U as User, a5 as Users, a6 as Popcorn, a7 as Waves, c as ChartColumn, a8 as Bookmark, a9 as Clock, t as Crown, aa as ThumbsUp, ab as ThumbsDown, ac as Minus, ad as ListVideo, ae as Share2, af as RotateCcw, ag as SlidersVertical, ah as EllipsisVertical } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
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
const Background = () => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 -z-10 overflow-hidden bg-black", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute inset-0",
        style: {
          background: "radial-gradient(120% 80% at 50% 0%, #1a0530 0%, #07000f 55%, #000000 100%)"
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute -left-32 top-10 w-[60vw] h-[120vh] opacity-70 blur-3xl",
        style: {
          background: "conic-gradient(from 220deg at 30% 50%, rgba(168,85,247,0) 0deg, rgba(168,85,247,0.45) 60deg, rgba(217,70,239,0.35) 120deg, rgba(168,85,247,0) 200deg)",
          animation: "ribbonSpin 28s linear infinite"
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute -right-32 top-0 w-[60vw] h-[120vh] opacity-60 blur-3xl",
        style: {
          background: "conic-gradient(from 40deg at 70% 50%, rgba(34,211,238,0) 0deg, rgba(34,211,238,0.4) 70deg, rgba(99,102,241,0.35) 140deg, rgba(34,211,238,0) 220deg)",
          animation: "ribbonSpin 36s linear infinite reverse"
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute left-1/2 -translate-x-1/2 bottom-[-20vh] w-[110vw] h-[60vh] opacity-50 blur-3xl",
        style: {
          background: "radial-gradient(50% 50% at 50% 50%, rgba(251,146,60,0.5) 0%, rgba(217,70,239,0.25) 40%, transparent 70%)",
          animation: "ribbonPulse 8s ease-in-out infinite"
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute inset-0 opacity-[0.04] mix-blend-overlay",
        style: {
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @keyframes ribbonSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes ribbonPulse { 0%,100% { opacity: 0.4; transform: translateX(-50%) scale(1); } 50% { opacity: 0.65; transform: translateX(-50%) scale(1.08); } }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      ` })
  ] });
};
const LOGO_URL = treyTvLogo;
const TreyTVHeader = ({ size = "md", onClick }) => {
  const dims = size === "lg" ? "h-24 sm:h-28" : size === "md" ? "h-16 sm:h-20" : "h-12 sm:h-14";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "flex justify-center w-full pt-2 pb-3 select-none",
      onClick,
      role: onClick ? "button" : void 0,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative inline-flex items-center justify-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute inset-0 -m-4 rounded-full opacity-40 blur-2xl pointer-events-none",
            style: {
              background: "radial-gradient(closest-side, rgba(251,191,36,0.45), transparent 70%), radial-gradient(closest-side, rgba(232,121,249,0.35), transparent 70%)"
            },
            "aria-hidden": true
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: LOGO_URL,
            alt: "Trey TV",
            draggable: false,
            className: `relative ${dims} w-auto object-contain pointer-events-none`,
            style: {
              filter: "drop-shadow(0 0 18px rgba(255,180,80,0.45)) drop-shadow(0 0 30px rgba(180,80,255,0.35))"
            }
          }
        )
      ] })
    }
  );
};
const accentMap = {
  gold: { border: "from-amber-300 via-yellow-400 to-orange-500", glow: "shadow-[0_0_40px_-5px_rgba(251,191,36,0.55)]", ring: "ring-amber-400/60" },
  cyan: { border: "from-cyan-300 via-sky-400 to-blue-500", glow: "shadow-[0_0_40px_-5px_rgba(34,211,238,0.55)]", ring: "ring-cyan-400/60" },
  magenta: { border: "from-fuchsia-400 via-pink-500 to-rose-500", glow: "shadow-[0_0_40px_-5px_rgba(232,121,249,0.55)]", ring: "ring-fuchsia-400/60" },
  purple: { border: "from-purple-400 via-violet-500 to-indigo-500", glow: "shadow-[0_0_40px_-5px_rgba(168,85,247,0.55)]", ring: "ring-purple-400/60" },
  pink: { border: "from-pink-400 via-rose-500 to-fuchsia-500", glow: "shadow-[0_0_40px_-5px_rgba(244,114,182,0.55)]", ring: "ring-pink-400/60" },
  orange: { border: "from-orange-400 via-amber-500 to-yellow-400", glow: "shadow-[0_0_40px_-5px_rgba(251,146,60,0.55)]", ring: "ring-orange-400/60" },
  multi: { border: "from-cyan-400 via-fuchsia-500 to-amber-400", glow: "shadow-[0_0_50px_-5px_rgba(217,70,239,0.45)]", ring: "ring-fuchsia-400/50" }
};
const LiquidGlassCard = ({ children, accent = "multi", selected = false, className = "", onClick, role, ariaPressed, ariaLabel, tabIndex }) => {
  const a = accentMap[accent];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      onClick,
      role,
      "aria-pressed": ariaPressed,
      "aria-label": ariaLabel,
      tabIndex: tabIndex ?? (onClick ? 0 : void 0),
      onKeyDown: (e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      },
      className: `relative rounded-3xl p-[1.5px] transition-all duration-300 ${onClick ? "cursor-pointer active:scale-[0.98]" : ""} ${selected ? `bg-gradient-to-br ${a.border} ${a.glow} ring-2 ${a.ring}` : "bg-gradient-to-br from-white/15 via-white/5 to-white/10 hover:from-white/25 hover:via-white/10 hover:to-white/15"} ${className}`,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `relative rounded-3xl h-full w-full overflow-hidden ${selected ? "bg-black/70" : "bg-black/60"} backdrop-blur-xl`,
          style: {
            backgroundImage: "radial-gradient(120% 80% at 0% 0%, rgba(255,255,255,0.08), transparent 50%), radial-gradient(100% 80% at 100% 100%, rgba(255,255,255,0.05), transparent 50%)"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent rounded-t-3xl" }),
            children
          ]
        }
      )
    }
  );
};
const NeonGlassButton = ({ children, onClick, variant = "gold", disabled, className = "", ariaLabel, type = "button" }) => {
  if (variant === "ghost") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type,
        onClick,
        disabled,
        "aria-label": ariaLabel,
        className: `relative px-5 py-3 rounded-full text-sm font-medium text-white/80 hover:text-white border border-white/15 hover:border-white/30 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all disabled:opacity-50 ${className}`,
        children
      }
    );
  }
  if (variant === "outline") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type,
        onClick,
        disabled,
        "aria-label": ariaLabel,
        className: `relative px-6 py-3 rounded-full text-sm font-semibold text-white border-2 border-fuchsia-400/60 hover:border-fuchsia-300 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 backdrop-blur-md transition-all shadow-[0_0_30px_-8px_rgba(217,70,239,0.6)] disabled:opacity-50 ${className}`,
        children
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type,
      onClick,
      disabled,
      "aria-label": ariaLabel,
      className: `relative group ${className}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -inset-1 rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-yellow-300 blur-md opacity-70 group-hover:opacity-100 transition-opacity" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative block px-8 py-4 rounded-full font-semibold text-black bg-gradient-to-b from-amber-200 via-yellow-300 to-amber-500 border border-amber-200/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_10px_30px_-5px_rgba(251,191,36,0.6)] disabled:opacity-50", children })
      ]
    }
  );
};
const MOOD_META = {
  Happy: { color: "#fbbf24", icon: Smile },
  Chill: { color: "#22d3ee", icon: Leaf },
  Romantic: { color: "#f472b6", icon: Heart },
  Motivated: { color: "#a855f7", icon: Zap },
  Reflective: { color: "#60a5fa", icon: Cloud },
  Wild: { color: "#f43f5e", icon: Flame },
  Healing: { color: "#34d399", icon: Leaf },
  Curious: { color: "#facc15", icon: Search },
  Focused: { color: "#c084fc", icon: Target },
  Sad: { color: "#818cf8", icon: Frown },
  Inspired: { color: "#fb923c", icon: Sparkles },
  Bored: { color: "#9ca3af", icon: Coffee }
};
const MoodIcon = ({ mood, size = 28, className = "" }) => {
  const meta = MOOD_META[mood];
  const Icon = meta.icon;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Icon,
    {
      className,
      style: {
        width: size,
        height: size,
        color: meta.color,
        filter: `drop-shadow(0 0 8px ${meta.color}aa) drop-shadow(0 0 14px ${meta.color}55)`
      }
    }
  );
};
const PREVIEW_MOODS = ["Happy", "Chill", "Romantic", "Motivated", "Reflective"];
const LandingScreen = ({ onStart, onOpenHistory }) => {
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "w-full max-w-md mx-auto h-[100dvh] overflow-hidden px-4 pt-[max(0.25rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] flex flex-col relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => void navigate({ to: "/" }),
        className: "absolute top-[max(1rem,env(safe-area-inset-top))] left-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 border border-white/10 text-white/70 hover:text-white hover:bg-black/60 transition-colors",
        "aria-label": "Back to Home",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "w-6 h-6" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TreyTVHeader, { size: "md" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-h-0 flex flex-col justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LiquidGlassCard, { accent: "multi", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "h1",
        {
          className: "font-serif text-[clamp(2.65rem,12vw,4rem)] font-bold tracking-tight leading-none",
          style: {
            backgroundImage: "linear-gradient(90deg,#fcd34d 0%, #f0abfc 35%, #d8b4fe 70%, #67e8f9 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent"
          },
          children: "Prescribe Me"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-3 mt-3", "aria-hidden": true, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px w-10 bg-gradient-to-r from-transparent to-amber-300/60" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", className: "text-amber-300", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.5-7 10-7 10z", stroke: "currentColor", strokeWidth: "1.5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px w-10 bg-gradient-to-l from-transparent to-amber-300/60" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-sm text-white/80 leading-relaxed", children: [
        "Tell us your mood. We’ll curate your",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent font-semibold", children: "perfect watch." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-5 mb-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] tracking-[0.23em] text-amber-300/90 uppercase mb-2", children: "How are you feeling?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-5 gap-2", children: PREVIEW_MOODS.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "relative w-11 h-11 rounded-full flex items-center justify-center bg-black/60 border border-white/15",
              style: i === 2 ? { boxShadow: "0 0 0 2px rgba(251,191,36,0.6), 0 0 24px rgba(251,191,36,0.45)" } : {},
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(MoodIcon, { mood: m, size: 21 })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] mt-1 text-white/70 truncate max-w-full", children: m })
        ] }, m)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NeonGlassButton, { onClick: onStart, ariaLabel: "Start my prescription", className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 justify-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8 5v14l11-7z" }) }),
        "Start My Prescription"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: onOpenHistory,
          className: "mt-4 inline-flex items-center gap-2 text-xs text-white/70 hover:text-white transition-colors",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-4 h-4" }),
            "View your prescriptions"
          ]
        }
      )
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LiquidGlassCard, { accent: "cyan", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-3 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-9 h-9 rounded-full bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-4 h-4 text-cyan-300" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-cyan-300 font-semibold text-xs", children: "Your vibe. Your privacy." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/65 text-[11px] mt-0.5 leading-snug", children: "Responses personalize your Trey TV experience only." })
      ] })
    ] }) }) })
  ] });
};
const StepShell = ({ step, totalSteps, title, subtitle, onBack, children, footer }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "w-full max-w-md mx-auto h-[100dvh] overflow-hidden px-4 pt-[max(0.25rem,env(safe-area-inset-top))] pb-[max(0.65rem,env(safe-area-inset-bottom))] flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TreyTVHeader, { size: "sm" }),
      onBack && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onBack,
          "aria-label": "Go back",
          className: "absolute left-0 top-3 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/15 text-white/80 hover:text-white hover:bg-white/10 backdrop-blur",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "w-4 h-4" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center shrink-0 mb-2 px-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "h2",
        {
          className: "font-serif font-bold text-[clamp(1.65rem,7vw,2.45rem)] leading-[0.95]",
          style: {
            backgroundImage: "linear-gradient(90deg,#fcd34d 0%, #f0abfc 40%, #c4b5fd 75%, #67e8f9 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent"
          },
          children: title
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 mt-2", "aria-hidden": true, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px w-8 bg-gradient-to-r from-transparent to-amber-300/50" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "10", height: "10", viewBox: "0 0 24 24", fill: "none", className: "text-amber-300/80", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.5-7 10-7 10z", stroke: "currentColor", strokeWidth: "1.5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px w-8 bg-gradient-to-l from-transparent to-amber-300/50" })
      ] }),
      subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/65 text-xs mt-2 leading-snug", children: subtitle })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-h-0 flex flex-col justify-center", children }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 mt-3 mb-3 px-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 text-[9px] tracking-[0.23em] text-amber-300/80 uppercase", children: [
        "Step ",
        step,
        " of ",
        totalSteps
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex items-center gap-1.5", children: Array.from({ length: totalSteps }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: `flex-1 h-1 rounded-full ${i < step ? "bg-gradient-to-r from-amber-300 via-pink-400 to-fuchsia-500 shadow-[0_0_8px_rgba(251,191,36,0.6)]" : "bg-white/10"}`
        },
        i
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0", children: footer })
  ] });
};
const MOODS = ["Happy", "Chill", "Romantic", "Motivated", "Reflective", "Wild", "Healing", "Curious"];
const MoodSelector = ({ value, onChange, onNext, onBack, step, total }) => {
  const toggle = (m) => {
    if (value.includes(m)) {
      onChange(value.filter((x) => x !== m));
    } else if (value.length < 3) {
      onChange([...value, m]);
    } else {
      onChange([...value.slice(1), m]);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    StepShell,
    {
      step,
      totalSteps: total,
      title: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        "How are you",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "feeling right now?"
      ] }),
      subtitle: "Pick up to 3 vibes.",
      onBack,
      footer: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonGlassButton, { onClick: onNext, disabled: value.length === 0, className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 justify-center", children: [
        "Next",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4" })
      ] }) }),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 gap-2", children: MOODS.map((m) => {
          const selected = value.includes(m);
          const color = MOOD_META[m].color;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => toggle(m),
              role: "checkbox",
              "aria-checked": selected,
              "aria-label": `${m} mood${selected ? ", selected" : ""}`,
              className: "group flex flex-col items-center gap-1.5 focus:outline-none",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  selected && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "absolute -top-1 -right-1 z-10 w-5 h-5 rounded-full flex items-center justify-center",
                      style: { background: color, boxShadow: `0 0 12px ${color}` },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3 h-3 text-black", strokeWidth: 3 })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "w-[58px] h-[58px] sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all",
                      style: {
                        background: selected ? `radial-gradient(circle at 50% 45%, ${color}22, rgba(0,0,0,0.85) 70%)` : "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.06), rgba(0,0,0,0.7) 70%)",
                        border: `1.5px solid ${selected ? color : "rgba(255,255,255,0.14)"}`,
                        boxShadow: selected ? `0 0 22px ${color}cc, inset 0 0 14px ${color}55` : `inset 0 0 10px rgba(255,255,255,0.04)`,
                        backdropFilter: "blur(8px)"
                      },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(MoodIcon, { mood: m, size: 25 })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: "text-[11px] sm:text-xs font-medium",
                    style: {
                      color: selected ? color : "rgba(255,255,255,0.78)",
                      textShadow: selected ? `0 0 8px ${color}88` : "none"
                    },
                    children: m
                  }
                )
              ]
            },
            m
          );
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-center text-[10px] text-white/45", children: "Multi-select up to 3 moods for the most accurate prescription." })
      ]
    }
  );
};
const OPTS$2 = [
  {
    value: "Soft",
    title: "Soft",
    desc: "Calm and easy.",
    color: "#c084fc",
    accent: "purple",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Cloud, { className: "w-8 h-8" })
  },
  {
    value: "Balanced",
    title: "Balanced",
    desc: "Focused and clear.",
    color: "#fbbf24",
    accent: "gold",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(YinYang, {})
  },
  {
    value: "High Energy",
    title: "High Energy",
    desc: "Up and active.",
    color: "#67e8f9",
    accent: "cyan",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-8 h-8" })
  }
];
function YinYang() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 24 24", className: "w-8 h-8", fill: "none", stroke: "currentColor", strokeWidth: "1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "9" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 3a4.5 4.5 0 0 0 0 9 4.5 4.5 0 0 1 0 9" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "7.5", r: "1", fill: "currentColor" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "16.5", r: "1", fill: "currentColor" })
  ] });
}
const Waveform = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-12 mb-3 overflow-hidden", "aria-hidden": true, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 400 80", className: "w-full h-full", preserveAspectRatio: "none", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "wfg", x1: "0%", x2: "100%", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#a855f7" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "35%", stopColor: "#fbbf24" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "65%", stopColor: "#ec4899" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#22d3ee" })
    ] }) }),
    Array.from({ length: 72 }).map((_, i) => {
      const x = i / 72 * 400;
      const h = 10 + Math.abs(Math.sin(i * 0.55) * 32) + Math.abs(Math.cos(i * 0.27) * 16);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "rect",
        {
          x,
          y: 40 - h / 2,
          width: "3",
          height: h,
          rx: "1.5",
          fill: "url(#wfg)",
          style: {
            animation: `wfBar 1.6s ease-in-out ${i * 0.04}s infinite alternate`,
            transformOrigin: "center",
            filter: "drop-shadow(0 0 5px rgba(236,72,153,0.6))"
          }
        },
        i
      );
    })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `@keyframes wfBar { from { transform: scaleY(0.55); } to { transform: scaleY(1.15); } }` })
] });
const EnergySelector = ({ value, onChange, onNext, onBack, step, total }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    StepShell,
    {
      step,
      totalSteps: total,
      title: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        "What energy are",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "you looking for?"
      ] }),
      onBack,
      footer: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonGlassButton, { onClick: onNext, disabled: !value, className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 justify-center", children: [
        "Continue",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4" })
      ] }) }),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Waveform, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: OPTS$2.map((o) => {
          const selected = value === o.value;
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            LiquidGlassCard,
            {
              accent: o.accent,
              selected,
              onClick: () => onChange(o.value),
              role: "radio",
              ariaPressed: selected,
              ariaLabel: `${o.title} energy: ${o.desc}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative px-2 py-4 flex flex-col items-center text-center gap-1.5 min-h-[156px]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "w-12 h-12 rounded-full bg-black/50 border flex items-center justify-center mt-1",
                    style: {
                      borderColor: selected ? o.color : "rgba(255,255,255,0.15)",
                      boxShadow: selected ? `0 0 24px ${o.color}cc, inset 0 0 14px ${o.color}66` : "none",
                      color: o.color
                    },
                    children: o.icon
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "font-serif text-base sm:text-lg leading-tight mt-1",
                    style: { color: o.color, textShadow: `0 0 12px ${o.color}66` },
                    children: o.title
                  }
                ),
                selected && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Heart,
                  {
                    className: "w-3 h-3",
                    style: { color: o.color, fill: o.color, filter: `drop-shadow(0 0 6px ${o.color})` }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9.5px] text-white/70 leading-snug px-0.5", children: o.desc })
              ] })
            },
            o.value
          );
        }) })
      ]
    }
  );
};
const OPTS$1 = [
  { value: "Music", color: "#fbbf24", accent: "gold", icon: Music },
  { value: "Drama", color: "#c084fc", accent: "purple", icon: Drama },
  { value: "Comedy", color: "#67e8f9", accent: "cyan", icon: Smile },
  { value: "Reality", color: "#f0abfc", accent: "pink", icon: Tv },
  { value: "Interviews", color: "#22d3ee", accent: "cyan", icon: Mic },
  { value: "Motivation", color: "#ec4899", accent: "magenta", icon: Zap },
  { value: "Romance", color: "#fb7185", accent: "pink", icon: Heart },
  { value: "Mystery", color: "#a78bfa", accent: "purple", icon: Search },
  { value: "Comfort Content", color: "#fb923c", accent: "orange", icon: Sofa }
];
const ContentTypeSelector = ({ value, onChange, onNext, onBack, step, total }) => {
  const toggle = (v) => {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    StepShell,
    {
      step,
      totalSteps: total,
      title: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        "What do you want",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "more of tonight?"
      ] }),
      subtitle: "Pick one or more lanes.",
      onBack,
      footer: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonGlassButton, { onClick: onNext, disabled: value.length === 0, className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 justify-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-4 h-4 fill-black" }),
        "Continue"
      ] }) }),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: OPTS$1.map((o) => {
        const Icon = o.icon;
        const selected = value.includes(o.value);
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          LiquidGlassCard,
          {
            accent: o.accent,
            selected,
            onClick: () => toggle(o.value),
            role: "checkbox",
            ariaPressed: selected,
            ariaLabel: `${o.value}${selected ? ", selected" : ""}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative px-2 py-3 flex flex-col items-center gap-1.5 min-h-[86px] justify-center", children: [
              selected && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center",
                  style: { background: o.color, boxShadow: `0 0 10px ${o.color}` },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3 h-3 text-black", strokeWidth: 3 })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Icon,
                {
                  className: "w-7 h-7",
                  style: { color: o.color, filter: `drop-shadow(0 0 10px ${o.color}cc)` }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "text-[10px] sm:text-[11px] text-center font-medium leading-tight",
                  style: { color: selected ? o.color : "rgba(255,255,255,0.85)" },
                  children: o.value
                }
              )
            ] })
          },
          o.value
        );
      }) })
    }
  );
};
const OPTS = [
  { value: "Just me", color: "#c084fc", accent: "purple", icon: User },
  { value: "Watching with friends", color: "#fb923c", accent: "orange", icon: Users },
  { value: "Need a quick watch", color: "#ec4899", accent: "magenta", icon: Zap },
  { value: "Give me a deep binge", color: "#22d3ee", accent: "cyan", icon: Popcorn },
  { value: "Make me laugh", color: "#fbbf24", accent: "gold", icon: Smile },
  { value: "I need something healing", color: "#a78bfa", accent: "purple", icon: Leaf }
];
const MomentNeedSelector = ({ value, onChange, onNext, onBack, step, total }) => {
  const toggle = (v) => {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    StepShell,
    {
      step,
      totalSteps: total,
      title: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        "What does",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "this moment need?"
      ] }),
      subtitle: "One more detail for a better match.",
      onBack,
      footer: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonGlassButton, { onClick: onNext, disabled: value.length === 0, className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 justify-center", children: [
        "Next",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4" })
      ] }) }),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2.5", children: OPTS.map((o) => {
        const Icon = o.icon;
        const selected = value.includes(o.value);
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          LiquidGlassCard,
          {
            accent: o.accent,
            selected,
            onClick: () => toggle(o.value),
            role: "checkbox",
            ariaPressed: selected,
            ariaLabel: o.value,
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative px-3 py-4 flex flex-col items-center gap-2 min-h-[108px] justify-center text-center", children: [
              selected && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center",
                  style: { background: o.color, boxShadow: `0 0 10px ${o.color}` },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3 h-3 text-black", strokeWidth: 3 })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Icon,
                {
                  className: "w-7 h-7",
                  style: { color: o.color, filter: `drop-shadow(0 0 12px ${o.color}cc)` }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "text-[11px] sm:text-xs font-medium leading-tight",
                  style: { color: selected ? o.color : "rgba(255,255,255,0.9)" },
                  children: o.value
                }
              )
            ] })
          },
          o.value
        );
      }) })
    }
  );
};
const AnalyzingScreen = ({ moods, onDone }) => {
  const [progress, setProgress] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const t0 = Date.now();
    const DURATION = 2800;
    const id = window.setInterval(() => {
      const elapsed = Date.now() - t0;
      const p = Math.min(100, Math.round(elapsed / DURATION * 100));
      setProgress(p);
      if (p >= 100) {
        clearInterval(id);
        setTimeout(onDone, 250);
      }
    }, 60);
    return () => clearInterval(id);
  }, [onDone]);
  const baseMoods = ["Chill", "Romantic", "Happy", "Motivated", "Reflective", "Healing"];
  const displayMoods = (() => {
    const out = [...moods];
    for (const m of baseMoods) if (out.length < 6 && !out.includes(m)) out.push(m);
    return out.slice(0, 6);
  })();
  const positions = [
    { top: "4%", left: "0%" },
    { top: "4%", right: "0%" },
    { top: "43%", left: "-5%" },
    { top: "43%", right: "-5%" },
    { bottom: "4%", left: "0%" },
    { bottom: "4%", right: "0%" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "w-full max-w-md mx-auto h-[100dvh] overflow-hidden px-4 pt-[max(0.25rem,env(safe-area-inset-top))] pb-[max(0.65rem,env(safe-area-inset-bottom))] flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TreyTVHeader, { size: "sm" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "h2",
        {
          className: "font-serif font-bold text-[clamp(1.8rem,8vw,2.7rem)] leading-none",
          style: {
            backgroundImage: "linear-gradient(90deg,#fcd34d 0%, #f0abfc 50%, #c4b5fd 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent"
          },
          children: "Analyzing your vibe"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-xs mt-2 text-white/75", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cyan-300 font-semibold", children: "Trey-I" }),
        " is curating your perfect prescription"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-h-0 flex flex-col justify-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto w-full max-w-[260px] aspect-square", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "absolute inset-1/4 rounded-full bg-black/70 border border-white/10",
            style: { boxShadow: "0 0 50px rgba(168,85,247,0.6), inset 0 0 35px rgba(34,211,238,0.4)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full", style: { background: "radial-gradient(circle at 50% 45%, rgba(34,211,238,0.5), transparent 60%)" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 100 100", className: "absolute inset-0 w-full h-full", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M30 42 q5 -10 12 0", stroke: "#67e8f9", strokeWidth: "3.5", fill: "none", strokeLinecap: "round", style: { filter: "drop-shadow(0 0 6px #67e8f9)" } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M58 42 q5 -10 12 0", stroke: "#67e8f9", strokeWidth: "3.5", fill: "none", strokeLinecap: "round", style: { filter: "drop-shadow(0 0 6px #67e8f9)" } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M35 60 q15 14 30 0", stroke: "#67e8f9", strokeWidth: "3.5", fill: "none", strokeLinecap: "round", style: { filter: "drop-shadow(0 0 6px #67e8f9)" } })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full", style: { animation: "orbSpin 12s linear infinite" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-2 rounded-full border-2 border-fuchsia-500/40", style: { boxShadow: "0 0 30px rgba(217,70,239,0.4)" } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-3 rounded-full", style: { animation: "orbSpin 18s linear infinite reverse" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full border-2 border-cyan-400/35", style: { boxShadow: "0 0 30px rgba(34,211,238,0.35)" } }) }),
        displayMoods.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute", style: positions[i], children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur border border-white/15", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MoodIcon, { mood: m, size: 12 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-white/90 font-medium", children: m })
        ] }) }, m + i)),
        /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `@keyframes orbSpin { from { transform: rotate(0); } to { transform: rotate(360deg); } }` })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LiquidGlassCard, { accent: "multi", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-300 text-xs font-medium", children: "Building prescription..." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-cyan-300 text-base font-semibold", children: [
            progress,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2.5 rounded-full bg-black/60 overflow-hidden border border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "h-full rounded-full transition-all duration-200 ease-out",
            style: {
              width: `${progress}%`,
              background: "linear-gradient(90deg,#fb923c 0%, #f0abfc 50%, #c084fc 100%)",
              boxShadow: "0 0 18px rgba(251,146,60,0.7)"
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 gap-1.5 mt-3 text-[9px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Waves, { className: "w-3 h-3 text-cyan-300" }), label: "Vibe", value: `${4e3 + Math.floor(progress * 36)}`, color: "#67e8f9" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "w-3 h-3 text-purple-300" }), label: "Sound", value: `${8e3 + Math.floor(progress * 43)}`, color: "#c084fc" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "w-3 h-3 text-pink-400" }), label: "Mood", value: `${Math.min(96, 60 + Math.floor(progress * 0.4))}%`, color: "#f472b6" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "w-3 h-3 text-amber-300" }), label: "Fit", value: `${Math.min(98, 65 + Math.floor(progress * 0.35))}%`, color: "#fbbf24" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LiquidGlassCard, { accent: "cyan", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-2.5 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "w-9 h-9 rounded-full bg-black/60 border border-cyan-400/40 flex items-center justify-center flex-shrink-0",
            style: { boxShadow: "0 0 14px rgba(34,211,238,0.4)" },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 24 24", className: "w-5 h-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8 11 q1.5 -3 3 0", stroke: "#67e8f9", strokeWidth: "1.5", fill: "none", strokeLinecap: "round" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M13 11 q1.5 -3 3 0", stroke: "#67e8f9", strokeWidth: "1.5", fill: "none", strokeLinecap: "round" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M9 15 q3 3 6 0", stroke: "#67e8f9", strokeWidth: "1.5", fill: "none", strokeLinecap: "round" })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-cyan-300 text-xs font-semibold", children: "Trey-I" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/75 text-[11px] leading-snug", children: "Almost there. The algorithm is seasoning it right." })
        ] })
      ] }) })
    ] })
  ] });
};
const Stat = ({ icon, label, value, color }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-0.5 min-w-0", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-white/55 truncate", children: [
    icon,
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: label })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-xs", style: { color }, children: value })
] });
const ResultsScreen = ({
  answers,
  scored,
  prescriptionTitle,
  onTryAgain,
  onAdjustMood,
  onSave,
  onShare,
  onOpenHistory,
  onGoWatch,
  isSaved
}) => {
  const [feedback, setFeedback] = reactExports.useState({});
  const [page, setPage] = reactExports.useState(0);
  const top = scored[0];
  const secondary = scored.slice(1, 4);
  const moreRest = scored.slice(4, 7);
  const pages = reactExports.useMemo(() => {
    const base = ["top"];
    if (secondary.length > 0) base.push("recommended");
    if (moreRest.length > 0) base.push("more");
    base.push("actions");
    return base;
  }, [secondary.length, moreRest.length]);
  reactExports.useEffect(() => {
    if (page > pages.length - 1) setPage(pages.length - 1);
  }, [page, pages.length]);
  const activePage = pages[page];
  const setFb = (id, v) => setFeedback((p) => ({ ...p, [id]: v }));
  const pickMoods = answers.moods.length > 0 ? answers.moods : ["Reflective", "Happy", "Motivated"];
  const attribFor = (i) => pickMoods[i % pickMoods.length];
  const avgMatch = Math.round(scored.slice(0, 5).reduce((s, x) => s + x.score, 0) / Math.max(1, Math.min(5, scored.length)));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "w-full max-w-md mx-auto h-[100dvh] overflow-hidden px-4 pt-[max(0.25rem,env(safe-area-inset-top))] pb-[max(0.65rem,env(safe-area-inset-bottom))] flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TreyTVHeader, { size: "sm" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 text-center mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "h1",
        {
          className: "font-serif font-bold text-[clamp(1.9rem,8.5vw,2.9rem)] leading-none",
          style: {
            backgroundImage: "linear-gradient(90deg,#fcd34d 0%, #f0abfc 50%, #c4b5fd 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent"
          },
          children: "Your Prescription"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/65 text-[11px] mt-1 truncate px-6", children: prescriptionTitle })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-h-0 flex flex-col justify-center", children: [
      activePage === "top" && top && /* @__PURE__ */ jsxRuntimeExports.jsx(TopPickCard, { top, feedback: feedback[top.id], setFeedback: (v) => setFb(top.id, v) }),
      activePage === "recommended" && /* @__PURE__ */ jsxRuntimeExports.jsx(PagedPickList, { title: "More matches", subtitle: "Because of the mood recipe you picked.", items: secondary, attribFor, startIndex: 0 }),
      activePage === "more" && /* @__PURE__ */ jsxRuntimeExports.jsx(PagedPickList, { title: "Deep cuts", subtitle: "Extra options without making the page scroll.", items: moreRest, attribFor, startIndex: 3 }),
      activePage === "actions" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        ActionsPage,
        {
          avgMatch,
          isSaved,
          onSave,
          onShare,
          onTryAgain,
          onAdjustMood,
          onOpenHistory
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 pt-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center gap-1.5 mb-3", children: pages.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setPage(i),
          "aria-label": `Go to result page ${i + 1}`,
          className: `h-1.5 rounded-full transition-all ${i === page ? "w-8 bg-gradient-to-r from-amber-300 via-pink-400 to-cyan-300 shadow-[0_0_10px_rgba(251,191,36,0.55)]" : "w-1.5 bg-white/20"}`
        },
        p + i
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_1.5fr] gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => page === 0 ? onAdjustMood() : setPage((p) => Math.max(0, p - 1)),
            className: "py-3 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs inline-flex items-center justify-center gap-1.5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "w-4 h-4" }),
              " ",
              page === 0 ? "Adjust" : "Back"
            ]
          }
        ),
        page < pages.length - 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx(NeonGlassButton, { onClick: () => setPage((p) => Math.min(pages.length - 1, p + 1)), className: "w-full", ariaLabel: "Next results page", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 justify-center", children: [
          "Continue ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4" })
        ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(NeonGlassButton, { onClick: onGoWatch, className: "w-full", ariaLabel: "Watch my prescription", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 justify-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tv, { className: "w-4 h-4" }),
          " Watch Now"
        ] }) })
      ] })
    ] })
  ] });
};
const TopPickCard = ({ top, feedback, setFeedback }) => /* @__PURE__ */ jsxRuntimeExports.jsx(LiquidGlassCard, { accent: "multi", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3.5", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: top.thumbnail, alt: top.title, className: "w-full h-full object-cover" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition",
          "aria-label": `Play ${top.title}`,
          onClick: () => window.alert(`Now playing: ${top.title}`),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-10 h-10 rounded-full bg-black/60 border border-white/30 flex items-center justify-center backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-4 h-4 text-white fill-white" }) })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-400/60 bg-amber-500/10 text-amber-300 text-[10px] font-semibold tracking-wider uppercase", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "w-3 h-3" }),
        " Top Pick"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "h3",
        {
          className: "font-serif text-xl mt-1.5 leading-tight line-clamp-2",
          style: {
            backgroundImage: "linear-gradient(90deg,#f472b6,#c084fc)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent"
          },
          children: top.title
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/75 text-xs mt-1 leading-snug line-clamp-3", children: top.description })
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-2.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MatchBar, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "w-3.5 h-3.5 text-pink-400" }), label: "Mood Match", value: top.moodMatch, color: "from-pink-500 to-rose-500" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MatchBar, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-3.5 h-3.5 text-purple-400" }), label: "Energy Match", value: top.energyMatch, color: "from-purple-500 to-fuchsia-500" })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/60 text-[11px] mt-3 italic line-clamp-2", children: top.reason }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid grid-cols-4 gap-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(FbButton, { active: feedback === "perfect", onClick: () => setFeedback("perfect"), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsUp, { className: "w-3.5 h-3.5" }), label: "Perfect" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FbButton, { active: feedback === "not-my-vibe", onClick: () => setFeedback("not-my-vibe"), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsDown, { className: "w-3.5 h-3.5" }), label: "Not me" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FbButton, { active: feedback === "more-like", onClick: () => setFeedback("more-like"), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-3.5 h-3.5" }), label: "More" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FbButton, { active: feedback === "less-like", onClick: () => setFeedback("less-like"), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "w-3.5 h-3.5" }), label: "Less" })
  ] })
] }) });
const PagedPickList = ({ title, subtitle, items, attribFor, startIndex }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-300/40 bg-cyan-400/10 text-cyan-200 text-[10px] uppercase tracking-[0.2em]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ListVideo, { className: "w-3 h-3" }),
      " No-scroll picks"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-2xl text-white mt-2", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/60 text-xs mt-1", children: subtitle })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2.5", children: items.map((it, i) => {
    const mood = attribFor(startIndex + i);
    const color = MOOD_META[mood].color;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(LiquidGlassCard, { accent: "cyan", onClick: () => window.alert(`Now playing: ${it.title}`), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-2.5 py-2.5 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-xl overflow-hidden border border-white/10 flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: it.thumbnail, alt: it.title, className: "w-full h-full object-cover" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "w-10 h-10 rounded-full bg-black/60 border flex items-center justify-center flex-shrink-0",
          style: { borderColor: color, boxShadow: `0 0 14px ${color}88` },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(MoodIcon, { mood, size: 20 })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "font-serif text-lg leading-tight truncate",
            style: {
              backgroundImage: `linear-gradient(90deg,#f0abfc,${color})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent"
            },
            children: it.title
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-white/70 truncate", children: [
          "Because you picked ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color }, className: "font-semibold", children: mood })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4 text-white/50 flex-shrink-0" })
    ] }) }, it.id);
  }) })
] });
const ActionsPage = ({ avgMatch, isSaved, onSave, onShare, onTryAgain, onAdjustMood, onOpenHistory }) => /* @__PURE__ */ jsxRuntimeExports.jsx(LiquidGlassCard, { accent: "orange", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 text-center", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "mx-auto w-16 h-16 rounded-full bg-amber-500/15 border border-amber-300/50 flex items-center justify-center",
      style: { boxShadow: "0 0 24px rgba(251,191,36,0.45)" },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-7 h-7 text-amber-300" })
    }
  ),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-2xl text-white mt-3", children: "Prescription ready" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-white/65 text-sm mt-1", children: [
    "Average match score: ",
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-cyan-300 font-semibold", children: [
      avgMatch,
      "%"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid grid-cols-2 gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: onSave,
        "aria-label": isSaved ? "Unsave prescription" : "Save prescription",
        className: `py-3 rounded-2xl border flex flex-col items-center justify-center gap-1 text-xs transition ${isSaved ? "bg-amber-400/20 border-amber-300 text-amber-300" : "bg-white/5 border-white/15 text-white/80 hover:text-white"}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bookmark, { className: `w-5 h-5 ${isSaved ? "fill-amber-300" : ""}` }),
          isSaved ? "Saved" : "Save"
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onShare, className: "py-3 rounded-2xl border border-fuchsia-400/40 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-200 text-xs flex flex-col items-center justify-center gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "w-5 h-5" }),
      " Share"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onTryAgain, className: "py-3 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs flex flex-col items-center justify-center gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-5 h-5" }),
      " Try Again"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onAdjustMood, className: "py-3 rounded-2xl border border-cyan-400/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-200 text-xs flex flex-col items-center justify-center gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersVertical, { className: "w-5 h-5" }),
      " Adjust Mood"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onOpenHistory, className: "mt-4 text-sm text-white/70 hover:text-white inline-flex items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-4 h-4" }),
    " View saved prescriptions"
  ] })
] }) });
const MatchBar = ({ icon, label, value, color }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[11px] mb-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-white/80", children: [
      icon,
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-white", children: [
      value,
      "%"
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 rounded-full bg-white/10 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-full rounded-full bg-gradient-to-r ${color}`, style: { width: `${value}%`, boxShadow: "0 0 10px rgba(236,72,153,0.5)" } }) })
] });
const FbButton = ({ active, onClick, icon, label }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "button",
  {
    onClick,
    "aria-pressed": active,
    className: `text-[10px] py-1.5 rounded-full border flex items-center justify-center gap-1 transition ${active ? "bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-200" : "bg-white/5 border-white/15 text-white/70 hover:text-white"}`,
    children: [
      icon,
      " ",
      label
    ]
  }
);
const CONTENT_LIBRARY = [
  {
    id: "midnight-voltage",
    title: "Midnight Voltage",
    description: "High-energy cinematic beats that electrify the night.",
    category: "Music",
    moods: ["Motivated", "Wild", "Inspired"],
    energy: ["High Energy"],
    duration: "medium",
    thumbnail: "https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730889867_bfd3e0b6.png",
    contentKind: "video",
    trending: true
  },
  {
    id: "velvet-echoes",
    title: "Velvet Echoes",
    description: "Soft soundscapes for late-night reflection.",
    category: "Music",
    moods: ["Reflective", "Chill", "Healing"],
    energy: ["Soft", "Balanced"],
    duration: "long",
    thumbnail: "https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730889057_b6e69acc.png",
    contentKind: "music-review"
  },
  {
    id: "laugh-therapy",
    title: "Laugh Therapy",
    description: "Open mic comedy that lifts the room.",
    category: "Comedy",
    moods: ["Happy", "Chill", "Bored"],
    energy: ["Balanced", "High Energy"],
    duration: "short",
    thumbnail: "https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730887832_fbb02db5.png",
    contentKind: "open-mic",
    trending: true
  },
  {
    id: "city-afterglow",
    title: "City Afterglow",
    description: "Cinematic nightscapes scored with synth motivation.",
    category: "Motivation",
    moods: ["Motivated", "Inspired", "Focused"],
    energy: ["Balanced", "High Energy"],
    duration: "medium",
    thumbnail: "https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730891471_29bf970b.png",
    contentKind: "video"
  },
  {
    id: "sunday-mind-reset",
    title: "Sunday Mind Reset",
    description: "A slow, healing channel built for the soft restart.",
    category: "Comfort Content",
    moods: ["Healing", "Reflective", "Chill", "Sad"],
    energy: ["Soft"],
    duration: "long",
    thumbnail: "https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730892607_30c92666.png",
    contentKind: "channel",
    creator: "Trey TV Wellness"
  },
  {
    id: "creator-spotlight",
    title: "Creator Spotlight Live",
    description: "Meet the new voices breaking through this week.",
    category: "Creator Channels",
    moods: ["Curious", "Inspired"],
    energy: ["Balanced"],
    duration: "medium",
    thumbnail: "https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730894402_923b856a.png",
    contentKind: "channel",
    isNewCreator: true
  },
  {
    id: "date-night-in",
    title: "Date Night In",
    description: "Romantic short films and slow-burn moments.",
    category: "Romance",
    moods: ["Romantic", "Chill"],
    energy: ["Soft", "Balanced"],
    duration: "medium",
    thumbnail: "https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730896949_cc176f8f.png",
    contentKind: "video"
  },
  {
    id: "lock-in-session",
    title: "Lock-In Session",
    description: "Deep-focus instrumentals to fuel the grind.",
    category: "Motivation",
    moods: ["Focused", "Motivated"],
    energy: ["Balanced", "High Energy"],
    duration: "long",
    thumbnail: "https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730900195_7a4a14de.png",
    contentKind: "video"
  },
  {
    id: "wild-frequency",
    title: "Wild Frequency",
    description: "Bold, untamed sounds and visual chaos.",
    category: "Music",
    moods: ["Wild", "Motivated"],
    energy: ["High Energy"],
    duration: "short",
    thumbnail: "https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730889867_bfd3e0b6.png",
    contentKind: "short",
    trending: true
  },
  {
    id: "mystery-hour",
    title: "Mystery Hour",
    description: "A slow-unfolding case to keep you guessing.",
    category: "Mystery",
    moods: ["Curious", "Focused"],
    energy: ["Balanced"],
    duration: "long",
    thumbnail: "https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730887832_fbb02db5.png",
    contentKind: "episode"
  },
  {
    id: "open-mic-friday",
    title: "Open Mic Friday",
    description: "Live mic room with rising poets and singers.",
    category: "Open Mic",
    moods: ["Reflective", "Inspired", "Curious"],
    energy: ["Balanced"],
    duration: "long",
    thumbnail: "https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730891471_29bf970b.png",
    contentKind: "open-mic"
  },
  {
    id: "review-room-r-and-b",
    title: "Review Room: R&B",
    description: "Track-by-track reactions with the music desk.",
    category: "Music Reviews",
    moods: ["Chill", "Romantic", "Reflective"],
    energy: ["Soft", "Balanced"],
    duration: "medium",
    thumbnail: "https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730889057_b6e69acc.png",
    contentKind: "music-review"
  },
  {
    id: "quick-laughs",
    title: "Quick Laughs",
    description: "Two-minute sketches when you only have a sec.",
    category: "Short Videos",
    moods: ["Happy", "Bored", "Chill"],
    energy: ["Balanced", "High Energy"],
    duration: "short",
    thumbnail: "https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730887832_fbb02db5.png",
    contentKind: "short"
  },
  {
    id: "drama-cut",
    title: "The Drama Cut",
    description: "An ongoing series with emotional depth.",
    category: "Drama",
    moods: ["Reflective", "Sad", "Curious"],
    energy: ["Balanced"],
    duration: "long",
    thumbnail: "https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730892607_30c92666.png",
    contentKind: "episode"
  },
  {
    id: "real-talk",
    title: "Real Talk Interviews",
    description: "Long-form conversations with thinkers and creators.",
    category: "Interviews",
    moods: ["Curious", "Inspired", "Reflective"],
    energy: ["Balanced"],
    duration: "long",
    thumbnail: "https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730894402_923b856a.png",
    contentKind: "episode"
  },
  {
    id: "reality-house",
    title: "Reality House",
    description: "Unscripted moments from the Trey TV house.",
    category: "Reality",
    moods: ["Bored", "Curious", "Wild"],
    energy: ["Balanced", "High Energy"],
    duration: "long",
    thumbnail: "https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730896949_cc176f8f.png",
    contentKind: "episode",
    trending: true
  },
  {
    id: "healing-mode",
    title: "Healing Mode",
    description: "Guided sound baths and gentle visuals.",
    category: "Comfort Content",
    moods: ["Healing", "Sad", "Reflective"],
    energy: ["Soft"],
    duration: "long",
    thumbnail: "https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730900195_7a4a14de.png",
    contentKind: "channel"
  },
  {
    id: "new-creators-now",
    title: "New Creators Now",
    description: "This week’s emerging Trey TV voices.",
    category: "New Creators",
    moods: ["Curious", "Inspired"],
    energy: ["Balanced"],
    duration: "medium",
    thumbnail: "https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730894402_923b856a.png",
    contentKind: "channel",
    isNewCreator: true
  }
];
const MOMENT_CONTENT_HINT = {
  "Just me": ["Comfort Content", "Music", "Drama"],
  "Watching with friends": ["Comedy", "Reality", "Open Mic"],
  "Need a quick watch": ["Short Videos"],
  "Give me a deep binge": ["Deep Binge", "Drama", "Mystery"],
  "Make me laugh": ["Comedy", "Short Videos"],
  "I need something healing": ["Comfort Content"],
  "Put me on something new": ["New Creators", "Creator Channels"],
  "Help me lock in": ["Motivation", "Music"],
  "I want creator energy": ["Creator Channels", "New Creators"],
  "I want music energy": ["Music", "Music Reviews"]
};
const MOMENT_DURATION_HINT = {
  "Just me": ["medium", "long"],
  "Watching with friends": ["medium", "long"],
  "Need a quick watch": ["short"],
  "Give me a deep binge": ["long"],
  "Make me laugh": ["short", "medium"],
  "I need something healing": ["long"],
  "Put me on something new": ["short", "medium"],
  "Help me lock in": ["long"],
  "I want creator energy": ["medium", "long"],
  "I want music energy": ["medium", "long"]
};
function scoreContent(answers) {
  const { moods, energy, contentTypes, momentNeeds } = answers;
  return CONTENT_LIBRARY.map((item) => {
    const moodHits = moods.filter((m) => item.moods.includes(m)).length;
    const moodMatch = moods.length === 0 ? 70 : Math.min(100, Math.round(moodHits / moods.length * 100 + (moodHits > 0 ? 20 : 0)));
    let energyMatch = 70;
    if (energy === "Surprise Me" || !energy) energyMatch = 80;
    else if (item.energy.includes(energy)) energyMatch = 95;
    else energyMatch = 55;
    const contentMatch = contentTypes.length === 0 || contentTypes.includes(item.category) ? 1 : 0.4;
    let momentBoost = 0;
    let durationOk = true;
    momentNeeds.forEach((m) => {
      const wanted = MOMENT_CONTENT_HINT[m];
      if (wanted.includes(item.category)) momentBoost += 8;
      const dur = MOMENT_DURATION_HINT[m];
      if (!dur.includes(item.duration)) durationOk = false;
    });
    if (momentNeeds.length > 0 && !durationOk) momentBoost -= 5;
    const freshness = (item.trending ? 4 : 0) + (item.isNewCreator && contentTypes.includes("New Creators") ? 6 : 0);
    const raw = moodMatch * 0.45 + energyMatch * 0.25 + contentMatch * 20 + momentBoost + freshness;
    const score = Math.max(0, Math.min(100, Math.round(raw)));
    const reasonBits = [];
    const matchedMoods = moods.filter((m) => item.moods.includes(m));
    if (matchedMoods.length > 0) reasonBits.push(matchedMoods.slice(0, 2).join(" + "));
    if (energy && energy !== "Surprise Me" && item.energy.includes(energy)) reasonBits.push(energy);
    if (contentTypes.includes(item.category)) reasonBits.push(item.category);
    const reason = reasonBits.length > 0 ? `Because you picked ${reasonBits.slice(0, 3).join(" + ")}` : "Because it matches your current vibe";
    return { ...item, score, moodMatch, energyMatch, reason };
  }).sort((a, b) => b.score - a.score);
}
function generatePrescriptionTitle(answers) {
  const { moods, energy, momentNeeds } = answers;
  const titlePool = [
    "Friday Night Reset",
    "Date Night In",
    "Sunday Mind Reset",
    "Midnight Motivation",
    "Healing Mode",
    "Laugh Therapy",
    "Lock-In Session",
    "Velvet Hours",
    "Open Mic Energy",
    "Soft Restart",
    "Wild Frequency",
    "Deep Binge Mode"
  ];
  if (moods.includes("Healing") || momentNeeds.includes("I need something healing")) return "Healing Mode";
  if (moods.includes("Romantic")) return "Date Night In";
  if (moods.includes("Reflective") && energy === "Soft") return "Sunday Mind Reset";
  if (moods.includes("Motivated") && energy === "High Energy") return "Midnight Motivation";
  if (moods.includes("Focused")) return "Lock-In Session";
  if (momentNeeds.includes("Make me laugh")) return "Laugh Therapy";
  if (moods.includes("Wild")) return "Wild Frequency";
  return titlePool[Math.floor(Math.random() * titlePool.length)];
}
const STORE_KEY = "treytv:prescriptions";
function loadPrescriptions() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
function savePrescriptions(list) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(list));
  } catch {
  }
}
const HistoryScreen = ({ prescriptions, onBack, onReplay, onShare, onToggleFavorite, onNewPrescription }) => {
  const [tab, setTab] = reactExports.useState("saved");
  const [index, setIndex] = reactExports.useState(0);
  const filtered = reactExports.useMemo(() => prescriptions.filter((p) => {
    if (tab === "saved") return p.isSaved;
    if (tab === "favorites") return p.isFavorite;
    return true;
  }), [prescriptions, tab]);
  reactExports.useEffect(() => {
    setIndex(0);
  }, [tab]);
  reactExports.useEffect(() => {
    if (filtered.length === 0) setIndex(0);
    else if (index > filtered.length - 1) setIndex(filtered.length - 1);
  }, [filtered.length, index]);
  const active = filtered[index];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "w-full max-w-md mx-auto h-[100dvh] overflow-hidden px-4 pt-[max(0.25rem,env(safe-area-inset-top))] pb-[max(0.65rem,env(safe-area-inset-bottom))] flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TreyTVHeader, { size: "sm" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onBack,
          "aria-label": "Back",
          className: "absolute left-0 top-3 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/15 text-white/80 hover:text-white hover:bg-white/10 backdrop-blur",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "w-4 h-4" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 text-center mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "h1",
      {
        className: "font-serif font-bold text-[clamp(1.9rem,8.5vw,2.85rem)] leading-none",
        style: {
          backgroundImage: "linear-gradient(90deg,#fcd34d 0%, #f0abfc 50%, #c4b5fd 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent"
        },
        children: "Your Prescriptions"
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LiquidGlassCard, { accent: "multi", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 p-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabBtn, { active: tab === "saved", onClick: () => setTab("saved"), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Bookmark, { className: "w-4 h-4" }), label: "Saved" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabBtn, { active: tab === "history", onClick: () => setTab("history"), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4" }), label: "History" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabBtn, { active: tab === "favorites", onClick: () => setTab("favorites"), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "w-4 h-4" }), label: "Favorites" })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-h-0 flex flex-col justify-center", children: !active ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { tab, onNewPrescription }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      PrescriptionCard,
      {
        prescription: active,
        position: index + 1,
        total: filtered.length,
        onReplay: () => onReplay(active),
        onShare: () => onShare(active),
        onToggleFavorite: () => onToggleFavorite(active.id)
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 pt-3", children: [
      active && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center gap-1.5 mb-3", children: filtered.slice(0, 8).map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setIndex(i),
          "aria-label": `Open prescription ${i + 1}`,
          className: `h-1.5 rounded-full transition-all ${i === index ? "w-8 bg-gradient-to-r from-amber-300 via-pink-400 to-cyan-300 shadow-[0_0_10px_rgba(251,191,36,0.55)]" : "w-1.5 bg-white/20"}`
        },
        p.id
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_1fr] gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => active ? setIndex((i) => Math.max(0, i - 1)) : onBack(),
            disabled: !!active && index === 0,
            className: "py-3 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 disabled:opacity-40 text-white/80 hover:text-white text-xs inline-flex items-center justify-center gap-1.5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "w-4 h-4" }),
              " Back"
            ]
          }
        ),
        active && index < filtered.length - 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx(NeonGlassButton, { onClick: () => setIndex((i) => Math.min(filtered.length - 1, i + 1)), className: "w-full", ariaLabel: "Next prescription", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 justify-center", children: [
          "Next ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4" })
        ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(NeonGlassButton, { onClick: onNewPrescription, className: "w-full", ariaLabel: "Start a new prescription", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 justify-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-4 h-4" }),
          " New"
        ] }) })
      ] })
    ] })
  ] });
};
const EmptyState = ({ tab, onNewPrescription }) => /* @__PURE__ */ jsxRuntimeExports.jsx(LiquidGlassCard, { accent: "purple", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 text-center", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-9 h-9 mx-auto text-fuchsia-300 mb-3" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-serif text-2xl text-white", children: "No prescriptions yet" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/60 text-sm mt-1", children: tab === "favorites" ? "Star the ones you love to find them here." : "Start a new prescription to build your library." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 inline-block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonGlassButton, { onClick: onNewPrescription, children: "Start a prescription" }) })
] }) });
const PrescriptionCard = ({ prescription: p, position, total, onReplay, onShare, onToggleFavorite }) => {
  const primaryMood = p.answers.moods[0];
  const accent = primaryMood ? primaryMood === "Happy" ? "gold" : primaryMood === "Romantic" ? "pink" : primaryMood === "Reflective" ? "cyan" : primaryMood === "Motivated" ? "purple" : primaryMood === "Wild" ? "magenta" : "purple" : "purple";
  const thumbs = p.recIds.slice(0, 3).map((id) => CONTENT_LIBRARY.find((x) => x.id === id)?.thumbnail).filter(Boolean);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(LiquidGlassCard, { accent, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      primaryMood && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "w-14 h-14 rounded-full bg-black/60 border flex items-center justify-center flex-shrink-0",
          style: { borderColor: MOOD_META[primaryMood].color, boxShadow: `0 0 14px ${MOOD_META[primaryMood].color}aa` },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(MoodIcon, { mood: primaryMood, size: 26 })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-white/45 mb-0.5", children: [
          position,
          " of ",
          total
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-serif text-xl text-white truncate", children: p.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] mt-0.5", children: p.answers.moods.slice(0, 3).map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React__default.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: MOOD_META[m].color }, children: m }),
          i < Math.min(p.answers.moods.length, 3) - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/30", children: "•" })
        ] }, m)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          "aria-label": p.isFavorite ? "Unfavorite" : "Mark favorite",
          onClick: onToggleFavorite,
          className: "w-8 h-8 rounded-full text-white/60 hover:text-white flex items-center justify-center",
          title: p.isFavorite ? "Unfavorite" : "Mark favorite",
          children: p.isFavorite ? /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "w-5 h-5 fill-pink-500 text-pink-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EllipsisVertical, { className: "w-5 h-5" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex -space-x-2", children: thumbs.map((src, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-full border-2 border-black/80 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src, alt: "", className: "w-full h-full object-cover" }) }, i)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onReplay, "aria-label": `Replay ${p.title}`, className: "relative group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -inset-1 rounded-full bg-amber-400/40 blur-md opacity-70 group-hover:opacity-100" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative w-12 h-12 rounded-full border-2 border-amber-300 bg-black/60 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-5 h-5 fill-amber-300 text-amber-300" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid grid-cols-3 gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(IconBtn, { onClick: onReplay, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-4 h-4" }), label: "Replay", color: "#fbbf24" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(IconBtn, { onClick: onShare, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "w-4 h-4" }), label: "Share", color: "#c084fc" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(IconBtn, { onClick: onToggleFavorite, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "w-4 h-4" }), label: p.isFavorite ? "Loved" : "Favorite", color: "#f472b6" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LiquidGlassCard, { accent: "orange", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "relative w-12 h-12 rounded-2xl bg-gradient-to-b from-amber-300/20 to-amber-700/20 border border-amber-400/40 flex items-center justify-center flex-shrink-0",
          style: { boxShadow: "0 0 20px rgba(251,191,36,0.4)" },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-6 h-6 text-amber-300" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-serif text-base text-white", children: "Re-dose Your Favorites" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-white/65 mt-0.5 truncate", children: "Your vibe. Your recipe. One tap." })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-[10px] text-white/40 text-center", children: new Date(p.createdAt).toLocaleString() })
  ] }) });
};
const TabBtn = ({ active, onClick, icon, label }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "button",
  {
    onClick,
    "aria-pressed": active,
    className: `inline-flex items-center justify-center gap-1.5 py-2 rounded-full text-xs transition ${active ? "bg-amber-500/20 text-amber-200 border border-amber-300/60 shadow-[0_0_18px_-4px_rgba(251,191,36,0.6)]" : "text-white/70 hover:text-white border border-transparent"}`,
    children: [
      icon,
      " ",
      label
    ]
  }
);
const IconBtn = ({ onClick, icon, label, color }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick, className: "flex flex-col items-center gap-1 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color, filter: `drop-shadow(0 0 6px ${color}aa)` }, children: icon }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px]", style: { color }, children: label })
] });
function useAuth() {
  const { user, loading, signOutSupabase } = useSupabaseSession();
  const sendMagicLink = reactExports.useCallback(async (email) => {
    if (!supabase) {
      return { ok: false, error: "Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY." };
    }
    try {
      const client = supabase;
      const { error } = await client.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.href }
      });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong. Try again.";
      return { ok: false, error: msg };
    }
  }, []);
  const signOut = reactExports.useCallback(async () => {
    if (!supabase) return;
    await signOutSupabase();
  }, [signOutSupabase]);
  return { user, loading, sendMagicLink, signOut };
}
const toRow = (p, userId) => ({
  user_id: userId,
  client_id: p.id,
  title: p.title,
  selected_moods: p.answers.moods,
  selected_energy: p.answers.energy,
  selected_content_types: p.answers.contentTypes,
  selected_moment_needs: p.answers.momentNeeds,
  generated_recommendations: p.recIds,
  top_recommendation_id: p.topId || null,
  match_score: p.matchScore,
  is_saved: p.isSaved,
  is_favorite: p.isFavorite,
  created_at: new Date(p.createdAt).toISOString()
});
const fromRow = (row) => {
  const recIds = Array.isArray(row.generated_recommendations) ? row.generated_recommendations : [];
  return {
    id: row.client_id || row.id,
    title: row.title || "My Prescription",
    answers: {
      moods: row.selected_moods || [],
      energy: row.selected_energy ?? null,
      contentTypes: row.selected_content_types || [],
      momentNeeds: row.selected_moment_needs || []
    },
    topId: row.top_recommendation_id || "",
    recIds,
    matchScore: row.match_score ?? 0,
    createdAt: new Date(row.created_at).getTime(),
    isSaved: !!row.is_saved,
    isFavorite: !!row.is_favorite
  };
};
const dedupeById = (list) => {
  const map = /* @__PURE__ */ new Map();
  for (const p of list) {
    const existing = map.get(p.id);
    if (!existing || p.createdAt > existing.createdAt) map.set(p.id, p);
  }
  return [...map.values()].sort((a, b) => b.createdAt - a.createdAt);
};
async function syncOnSignIn(userId, local) {
  if (!supabase) return local;
  if (local.length > 0) {
    const rows = local.map((p) => toRow(p, userId));
    const { error: error2 } = await supabase.from("prescribe_me_sessions").upsert(rows, { onConflict: "user_id,client_id" });
    if (error2) console.warn("[prescribe] upsert local error", error2.message);
  }
  const { data, error } = await supabase.from("prescribe_me_sessions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(100);
  if (error) {
    console.warn("[prescribe] fetch error", error.message);
    return local;
  }
  const remote = data.map(fromRow);
  return dedupeById([...remote, ...local]);
}
async function upsertPrescription(userId, p) {
  if (!supabase) return;
  const { error } = await supabase.from("prescribe_me_sessions").upsert([toRow(p, userId)], { onConflict: "user_id,client_id" });
  if (error) console.warn("[prescribe] upsert error", error.message);
}
const TOTAL_STEPS = 4;
const PrescribeMeApp = () => {
  const navigate = useNavigate();
  const [step, setStep] = reactExports.useState("landing");
  const [moods, setMoods] = reactExports.useState([]);
  const [energy, setEnergy] = reactExports.useState(null);
  const [contentTypes, setContentTypes] = reactExports.useState([]);
  const [momentNeeds, setMomentNeeds] = reactExports.useState([]);
  const [prescriptions, setPrescriptions] = reactExports.useState([]);
  const [currentPrescriptionId, setCurrentPrescriptionId] = reactExports.useState(null);
  const { user } = useAuth();
  const syncedForUserRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    setPrescriptions(loadPrescriptions());
  }, []);
  reactExports.useEffect(() => {
    if (!user) return;
    if (syncedForUserRef.current === user.id) return;
    syncedForUserRef.current = user.id;
    const local = loadPrescriptions();
    syncOnSignIn(user.id, local).then((merged) => {
      setPrescriptions(merged);
      savePrescriptions(merged);
    });
  }, [user]);
  const answers = reactExports.useMemo(() => ({
    moods,
    energy,
    contentTypes,
    momentNeeds
  }), [moods, energy, contentTypes, momentNeeds]);
  const scored = reactExports.useMemo(() => scoreContent(answers), [answers]);
  const currentPrescription = reactExports.useMemo(
    () => prescriptions.find((p) => p.id === currentPrescriptionId) || null,
    [prescriptions, currentPrescriptionId]
  );
  const updatePrescriptions = (updater) => {
    setPrescriptions((prev) => {
      const next = updater(prev);
      savePrescriptions(next);
      return next;
    });
  };
  const syncOne = (p) => {
    if (!user || !p) return;
    void upsertPrescription(user.id, p);
  };
  const createPrescription = (saved = false) => {
    const title = generatePrescriptionTitle(answers);
    const top = scored[0];
    const matchScore = Math.round(scored.slice(0, 5).reduce((s, x) => s + x.score, 0) / Math.max(1, Math.min(5, scored.length)));
    const p = {
      id: `rx_${Date.now()}`,
      title,
      answers,
      topId: top?.id || "",
      recIds: scored.slice(0, 6).map((x) => x.id),
      matchScore,
      createdAt: Date.now(),
      isSaved: saved,
      isFavorite: false
    };
    updatePrescriptions((prev) => [p, ...prev].slice(0, 50));
    setCurrentPrescriptionId(p.id);
    if (user) syncOne(p);
    return p;
  };
  const goStart = () => {
    setMoods([]);
    setEnergy(null);
    setContentTypes([]);
    setMomentNeeds([]);
    setCurrentPrescriptionId(null);
    setStep("mood");
  };
  const onAnalyzeDone = () => {
    createPrescription(false);
    setStep("results");
  };
  const onSaveToggle = () => {
    if (!currentPrescriptionId) return;
    let updated;
    updatePrescriptions((prev) => prev.map((p) => {
      if (p.id !== currentPrescriptionId) return p;
      updated = { ...p, isSaved: !p.isSaved };
      return updated;
    }));
    syncOne(updated);
  };
  const onShare = async (titleHint) => {
    const title = titleHint || (currentPrescription?.title ?? "My Trey TV Prescription");
    const text = `${title} — curated by Trey TV Prescribe Me`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(`${text}
${window.location.href}`);
        window.alert("Link copied to clipboard");
      }
    } catch {
    }
  };
  const onToggleFavorite = (id) => {
    let updated;
    updatePrescriptions((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      updated = { ...p, isFavorite: !p.isFavorite };
      return updated;
    }));
    syncOne(updated);
  };
  const onGoWatch = () => {
    const top = scored[0];
    void navigate({ to: top?.contentKind === "music-review" ? "/music-review" : "/" });
  };
  const onReplay = (p) => {
    setMoods(p.answers.moods);
    setEnergy(p.answers.energy);
    setContentTypes(p.answers.contentTypes);
    setMomentNeeds(p.answers.momentNeeds);
    setCurrentPrescriptionId(p.id);
    setStep("analyzing");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "prescribe-me-root fixed inset-0 h-[100dvh] overflow-hidden text-white antialiased font-sans", style: { fontFamily: '"Inter", system-ui, -apple-system, sans-serif' }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("link", { rel: "preconnect", href: "https://fonts.googleapis.com" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "link",
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        .font-serif { font-family: 'Playfair Display', Georgia, serif; }
        .font-sans { font-family: 'Inter', system-ui, sans-serif; }
        ::selection { background: rgba(251,191,36,0.35); }
      ` }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Background, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "relative z-0 h-full overflow-hidden", children: [
      step === "landing" && /* @__PURE__ */ jsxRuntimeExports.jsx(LandingScreen, { onStart: goStart, onOpenHistory: () => setStep("history") }),
      step === "mood" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        MoodSelector,
        {
          value: moods,
          onChange: setMoods,
          onNext: () => setStep("energy"),
          onBack: () => setStep("landing"),
          step: 1,
          total: TOTAL_STEPS
        }
      ),
      step === "energy" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        EnergySelector,
        {
          value: energy,
          onChange: setEnergy,
          onNext: () => setStep("content"),
          onBack: () => setStep("mood"),
          step: 2,
          total: TOTAL_STEPS
        }
      ),
      step === "content" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        ContentTypeSelector,
        {
          value: contentTypes,
          onChange: setContentTypes,
          onNext: () => setStep("moment"),
          onBack: () => setStep("energy"),
          step: 3,
          total: TOTAL_STEPS
        }
      ),
      step === "moment" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        MomentNeedSelector,
        {
          value: momentNeeds,
          onChange: setMomentNeeds,
          onNext: () => setStep("analyzing"),
          onBack: () => setStep("content"),
          step: 4,
          total: TOTAL_STEPS
        }
      ),
      step === "analyzing" && /* @__PURE__ */ jsxRuntimeExports.jsx(AnalyzingScreen, { moods, onDone: onAnalyzeDone }),
      step === "results" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        ResultsScreen,
        {
          answers,
          scored,
          prescriptionTitle: currentPrescription?.title || generatePrescriptionTitle(answers),
          onTryAgain: () => setStep("analyzing"),
          onAdjustMood: () => setStep("mood"),
          onSave: onSaveToggle,
          onShare: () => void onShare(currentPrescription?.title),
          onOpenHistory: () => setStep("history"),
          onGoWatch,
          isSaved: !!currentPrescription?.isSaved
        }
      ),
      step === "history" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        HistoryScreen,
        {
          prescriptions,
          onBack: () => setStep("landing"),
          onReplay,
          onShare: (p) => void onShare(p.title),
          onToggleFavorite,
          onNewPrescription: goStart
        }
      )
    ] })
  ] });
};
const defaultAppContext = {
  sidebarOpen: false,
  toggleSidebar: () => {
  }
};
const AppContext = reactExports.createContext(defaultAppContext);
const AppProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = reactExports.useState(false);
  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    AppContext.Provider,
    {
      value: {
        sidebarOpen,
        toggleSidebar
      },
      children
    }
  );
};
const PrescribeMeFeature = () => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(PrescribeMeApp, {}) });
};
function PrescribeMe() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PrescribeMeFeature, {});
}
export {
  PrescribeMe as component
};
