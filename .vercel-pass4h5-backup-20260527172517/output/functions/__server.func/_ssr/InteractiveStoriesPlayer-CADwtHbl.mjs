import { r as reactExports, j as jsxRuntimeExports, R as React__default } from "../_libs/react.mjs";
import { l as loadBranches, e as loadEndings, f as loadInstalledStoryPackages, h as ensureBundledStoryPackagesInstalled, j as syncMetaFromBranch, n as normalizeStorySlug, k as findInstalledStoryPackageBySlug, m as createBranchFromStoryPackage, u as updateBranch, S as SharedEndingScreen, P as PlaythroughsScreen, I as IMAGES, T as TONE_COLORS, c as CHARACTERS, o as createNewBranch, d as getImageMeta, p as CHAPTER_1_CHOICES, i as inferAffectedCharacters, C as CHARACTERS_BY_ID, q as installTreyStoryFile, r as deleteBranch, t as replayFromChapter, v as createCustomStoryBranch, a as CHARACTERS_BY_KEY, b as CHARACTER_PHOTO_MAP, g as getInstalledStoryPackage, w as generateNextChapter, x as applyDelta, y as pickChapterImage, z as saveEnding, A as recordChoiceEvent, s as supabase } from "./PlaythroughsScreen-D6QZNspj.mjs";
import { b as useAuth$1, c as createBrowserClient } from "./router-BtgGywEC.mjs";
import { a as useTvRemoteInput } from "./useTvRemoteInput-3UKI_f2s.mjs";
import "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { X, S as Sparkles, W as WandSparkles, aj as ArrowRight, A as ArrowLeft, bI as Layers, be as MapPin, r as ChevronRight, i as Lock, bH as BookOpen, a8 as Bookmark, aG as Save, cw as GitBranch, a5 as Users, n as Settings, a9 as Clock, af as RotateCcw, P as Plus, a4 as Play, ap as Activity, b8 as MicVocal, R as Radio, c3 as Square, aL as Volume2, cx as ListMusic, aH as SkipForward, cy as ChevronUp, ak as ChevronDown, Z as Zap, cz as Swords, b as Heart, cA as Wind, aI as TriangleAlert, t as Crown, bj as Link2, Y as Flame, p as Shield, f as Send, az as LoaderCircle, T as TrendingUp, bP as TrendingDown, ae as Share2, bl as Download, d as Image$1, b0 as RefreshCw, aw as Trophy, cB as CirclePlus, cC as FileBraces, an as Upload, ax as CircleCheck, aF as Trash2, ac as Minus, s as LogOut, U as User, L as LogIn, h as Mail, aE as Info, a_ as ExternalLink, aK as VolumeX, bm as ShieldAlert } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
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
const ITEMS = [
  { id: "library", label: "Library", icon: BookOpen },
  { id: "story", label: "Story", icon: Bookmark },
  { id: "saves", label: "Saves", icon: Save },
  { id: "branches", label: "Branches", icon: GitBranch },
  { id: "characters", label: "Cast", icon: Users },
  { id: "settings", label: "Settings", icon: Settings }
];
const BottomNav = ({ active, onChange }) => /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/90 backdrop-blur-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex max-w-2xl items-stretch justify-around px-1 py-2", children: ITEMS.map(({ id, label, icon: Icon }) => {
  const isActive = active === id;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      onClick: () => onChange(id),
      className: `relative flex flex-1 flex-col items-center gap-1 rounded-lg px-1 py-2 transition-all ${isActive ? "text-violet-400" : "text-white/50 hover:text-white/80"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `h-5 w-5 ${isActive ? "drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" : ""}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-medium uppercase tracking-wider", children: label }),
        isActive && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -bottom-0.5 h-0.5 w-8 rounded-full bg-violet-500" })
      ]
    },
    id
  );
}) }) });
const COLORS = {
  violet: "from-violet-500 to-fuchsia-500",
  pink: "from-pink-500 to-rose-500",
  amber: "from-amber-400 to-orange-500",
  emerald: "from-emerald-400 to-teal-500",
  red: "from-red-500 to-orange-600",
  sky: "from-sky-400 to-cyan-500"
};
const MeterBar = ({ label, value, color = "violet", delta, compact }) => {
  const v = Math.max(0, Math.min(100, value));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: compact ? "space-y-0.5" : "space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-white/80", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "tabular-nums text-white/60", children: [
        v,
        "%",
        delta !== void 0 && delta !== 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `ml-1 font-bold ${delta > 0 ? "text-emerald-400" : "text-red-400"}`, children: [
          delta > 0 ? "+" : "",
          delta
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 w-full overflow-hidden rounded-full bg-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `h-full rounded-full bg-gradient-to-r ${COLORS[color]} transition-all duration-700 ease-out`,
        style: { width: `${v}%` }
      }
    ) })
  ] });
};
const StatusPanel = ({ branch, open, onClose }) => {
  if (!branch) return null;
  const switchRevealed = branch.flags.switch_revealed_to_ari || branch.flags.switch_revealed_to_coach || branch.flags.switch_revealed_to_mom;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        onClick: onClose,
        className: `fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-violet-500/30 bg-gradient-to-b from-zinc-900 to-black p-6 shadow-2xl transition-transform duration-300 ${open ? "translate-y-0" : "translate-y-full"}`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-2xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-5 w-5 text-violet-400" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-bold tracking-wide text-white", children: "Status & Mood" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5 rounded-xl border border-white/10 bg-white/5 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-widest text-white/50", children: "The Switch" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-1 text-2xl font-bold ${switchRevealed ? "text-red-400" : "text-emerald-400"}`, children: switchRevealed ? "REVEALED" : "HIDDEN" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MeterBar, { label: "Risk Level", value: branch.meters.risk_level, color: "red" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(MeterBar, { label: "Mom Suspicion", value: branch.meters.suspicion_mom, color: "amber" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(MeterBar, { label: "Coach Risk", value: branch.meters.suspicion_coach, color: "amber" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(MeterBar, { label: "Ms. Valentina", value: branch.meters.suspicion_valentina, color: "amber" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "my-3 h-px bg-white/10" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(MeterBar, { label: "Trust — Ari", value: branch.meters.trust_ari, color: "pink" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(MeterBar, { label: "Trust — Dante", value: branch.meters.trust_dante, color: "violet" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(MeterBar, { label: "Malik → Micah", value: branch.meters.trust_malik_to_micah, color: "emerald" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(MeterBar, { label: "Micah → Malik", value: branch.meters.trust_micah_to_malik, color: "emerald" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 text-center text-xs text-white/40", children: [
            "Chapter ",
            branch.chapters.length,
            " • ",
            branch.toneHistory.length,
            " choices made"
          ] })
        ] })
      }
    )
  ] });
};
const TREY_TV_LOGO_URL = "https://d64gsuwffb70l.cloudfront.net/6a060641815889c4c7c610fd_1778783806509_ab6fb4ed.png";
const TreyTVLogo = ({
  size = 32,
  className = "",
  glow = false
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "span",
  {
    className: `relative inline-flex items-center justify-center ${className}`,
    style: { height: size },
    children: [
      glow && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          "aria-hidden": true,
          className: "absolute inset-0 rounded-full bg-amber-400/20 blur-2xl"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: TREY_TV_LOGO_URL,
          alt: "Trey TV",
          draggable: false,
          style: { height: size, width: "auto" },
          className: "relative select-none object-contain"
        }
      )
    ]
  }
);
const WelcomeScreen = ({ onEnter }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex min-h-screen items-center justify-center overflow-hidden", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: IMAGES.twinsCover, alt: "", className: "absolute inset-0 h-full w-full object-cover" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 px-8 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TreyTVLogo, { size: 72, glow: true }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-5xl font-black uppercase leading-none tracking-tight text-white drop-shadow-2xl", children: [
      "Stories",
      /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
      "you don't just read —"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 font-display text-3xl font-black uppercase tracking-tight text-amber-400", children: "you live." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 max-w-xs mx-auto font-serif text-base italic text-white/80", children: "Every choice changes the story. Every branch ends differently." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: onEnter,
        className: "mt-10 inline-flex items-center gap-3 rounded-full bg-white px-7 py-3.5 font-display text-sm font-black uppercase tracking-widest text-black shadow-2xl transition-transform active:scale-95",
        children: [
          "Enter the Library ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
        ]
      }
    )
  ] })
] });
const LibraryScreen = ({
  onOpenStory,
  onOpenEndings,
  hasSave,
  endingsCount,
  installedStories = [],
  onInstallStoryFile,
  onStartInstalledStory,
  onCraftStory
}) => {
  const inputRef = reactExports.useRef(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen pb-24", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "px-5 pt-10 pb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TreyTVLogo, { size: 36, glow: true }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-2 font-display text-4xl font-black tracking-tight text-white", children: "Library" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: onOpenEndings,
            className: "flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3.5 w-3.5" }),
              "Endings ",
              endingsCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-amber-500 px-1.5 text-[10px] text-black", children: endingsCount })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-white/60", children: "Stories you don't just read — you live." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: onOpenStory,
        className: "group relative block w-full overflow-hidden rounded-3xl border border-white/10 text-left transition-transform active:scale-[0.98]",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[3/4] w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: IMAGES.twinsCover, alt: "Switch Kicks", className: "absolute inset-0 h-full w-full object-cover" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-4 left-4 flex items-center gap-2 rounded-full bg-violet-600/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-violet-500/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3" }),
            " Featured"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-xs uppercase tracking-[0.3em] text-amber-400", children: "An Interactive Story" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mt-1 font-display text-4xl font-black uppercase leading-none tracking-tight text-white drop-shadow-2xl", children: [
              "Switch",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "Kicks"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 max-w-xs font-serif text-base italic text-white/90", children: "Two brothers. Two worlds. One crazy day." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-bold text-black shadow-lg transition-transform group-hover:scale-105", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4 fill-current" }),
              hasSave ? "Continue" : "Start Story"
            ] })
          ] })
        ] })
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 px-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-3 text-xs font-bold uppercase tracking-widest text-white/50", children: "Interactive Stories" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-3", children: [
        installedStories.map((pkg) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => onStartInstalledStory?.(pkg.story.id),
            className: "group flex gap-3 rounded-2xl border border-amber-400/20 bg-gradient-to-br from-zinc-950 via-black to-amber-950/20 p-3 text-left shadow-lg shadow-amber-500/10 transition-transform active:scale-[0.98]",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-white/5", children: pkg.story.coverImage ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: pkg.story.coverImage, alt: pkg.story.title, className: "h-full w-full object-cover", style: { objectPosition: "center 35%" } }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full w-full items-center justify-center text-white/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CirclePlus, { className: "h-8 w-8" }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1 py-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold uppercase tracking-widest text-amber-400", children: pkg.story.genre || "Interactive Story" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 font-display text-xl font-black text-white", children: pkg.story.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 line-clamp-2 text-xs leading-relaxed text-white/55", children: pkg.story.description || "A bundled Trey TV interactive story." }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-200", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-3 w-3 fill-current" }),
                  " Start"
                ] })
              ] })
            ]
          },
          pkg.story.id
        )),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: onCraftStory,
            className: "group flex gap-3 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-zinc-950 via-black to-cyan-950/20 p-3 text-left shadow-lg shadow-cyan-500/10 transition-transform active:scale-[0.98]",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-cyan-600 via-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CirclePlus, { className: "h-9 w-9 text-cyan-100 animate-pulse" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1 py-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold uppercase tracking-widest text-cyan-400", children: "AI Story Studio" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 font-display text-xl font-black text-white", children: "Create Your Own Story" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 line-clamp-2 text-xs leading-relaxed text-white/55", children: "Craft your own unique story, define your characters, and let the AI generate a fully custom interactive adventure." }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 inline-flex items-center gap-1.5 rounded-full bg-cyan-400/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-200", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3 fill-current text-cyan-300" }),
                  " Start Crafting"
                ] })
              ] })
            ]
          }
        )
      ] })
    ] }),
    onInstallStoryFile && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 px-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-black/70 to-fuchsia-500/10 p-4 shadow-lg shadow-violet-500/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-500/15 text-violet-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileBraces, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold uppercase tracking-[0.25em] text-violet-300", children: "Story Installer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-xl font-black text-white", children: "Install a .ttstory file" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs leading-relaxed text-white/55", children: "Upload future Trey TV Interactive Story Packages after validation." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          ref: inputRef,
          type: "file",
          accept: ".ttstory,application/json",
          className: "hidden",
          onChange: (e) => {
            const file = e.target.files?.[0];
            if (file) onInstallStoryFile(file);
            e.currentTarget.value = "";
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => inputRef.current?.click(),
          className: "mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-violet-400/30 bg-violet-500/20 px-4 py-3 text-xs font-bold uppercase tracking-widest text-violet-100 active:scale-[0.98]",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4" }),
            " Upload .ttstory Package"
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 px-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-3 text-xs font-bold uppercase tracking-widest text-white/50", children: "Coming Soon" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: [
        { title: "After Hours", tag: "Drama" },
        { title: "The Understudy", tag: "Romance" },
        { title: "Last Set", tag: "Music" },
        { title: "Glasshouse", tag: "Mystery" }
      ].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-8 w-8 text-white/20" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold uppercase tracking-widest text-amber-400/70", children: s.tag }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-sm font-bold text-white/70", children: s.title })
        ] })
      ] }, s.title)) })
    ] })
  ] });
};
const CharacterAvatar = ({
  character,
  characterId,
  relationshipKey,
  className = "",
  faceCrop = false,
  alt
}) => {
  const resolved = character || (characterId ? CHARACTERS_BY_ID[characterId] : void 0) || (relationshipKey ? CHARACTERS_BY_KEY[relationshipKey] : void 0);
  const [errored, setErrored] = reactExports.useState(false);
  if (!resolved) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex items-center justify-center bg-zinc-900 text-white/40 ${className}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: "?" }) });
  }
  const mapped = resolved.mapKey ? CHARACTER_PHOTO_MAP[resolved.mapKey]?.image : void 0;
  const primary = mapped || resolved.image || resolved.fallbackImage;
  const fallback = resolved.fallbackImage || mapped || resolved.image || "/placeholder.svg";
  const src = !errored ? primary : fallback;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "img",
    {
      src,
      alt: alt || resolved.name,
      onError: () => setErrored(true),
      className: `h-full w-full object-cover ${faceCrop ? "object-[center_35%]" : "object-center"} ${className}`,
      draggable: false
    }
  );
};
const LandingScreen = ({ onBack, onStartNew, onContinue, branches, onReread }) => {
  const activeBranches = branches.filter((b) => !b.isComplete);
  const lastBranch = activeBranches[0];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen pb-24", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[4/5] w-full overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: IMAGES.twinsCover, alt: "Switch Kicks", className: "absolute inset-0 h-full w-full object-cover" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: onBack,
            className: "absolute left-4 top-10 rounded-full border border-white/20 bg-black/40 p-2.5 text-white backdrop-blur-md",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-x-0 bottom-0 px-5 pb-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-amber-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold uppercase tracking-[0.3em]", children: "Interactive Story" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 font-display text-5xl font-black uppercase leading-none tracking-tight text-white", children: "Switch Kicks" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 font-serif text-lg italic text-white/90", children: "Two brothers. Two worlds. One crazy day." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 px-5 pt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-xs font-bold uppercase tracking-widest text-violet-400", children: "Synopsis" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-serif text-base leading-relaxed text-white/80", children: "Identical twins. Malik is the football star with a draft showcase coming. Micah is the ballet dancer with an adjudication for a featured solo. After a recreationally unwise night, one panicked favor turns into the longest day of their lives — and every choice you make decides who finds out, who falls in love, and who survives the truth." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 text-xs font-bold uppercase tracking-widest text-violet-400", children: "The Cast" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide", children: CHARACTERS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 w-20 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-20 w-20 overflow-hidden rounded-full border-2 border-white/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CharacterAvatar, { character: c, faceCrop: true }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-xs font-medium text-white/90 leading-tight", children: c.firstName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-white/40 leading-tight", children: c.role })
        ] }, c.id)) })
      ] }),
      lastBranch && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-violet-500/30 bg-violet-500/5 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-violet-300", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold uppercase tracking-widest", children: "Last Branch" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 font-display text-lg font-bold text-white", children: [
          "Chapter ",
          lastBranch.chapters.length
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-white/60 line-clamp-2", children: lastBranch.chapters[lastBranch.chapters.length - 1]?.summary || "Continue where you left off." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => onContinue(lastBranch),
              className: "inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-violet-500/30",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4" }),
                " Continue Last Branch"
              ]
            }
          ),
          onReread && lastBranch.chapters.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => onReread(lastBranch),
              className: "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-bold text-white/90 hover:bg-white/10",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "h-4 w-4" }),
                " Re-read Chapters"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: onStartNew,
          className: "group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-5 font-display text-lg font-black uppercase tracking-widest text-white shadow-2xl shadow-violet-500/40 transition-transform active:scale-[0.98]",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative z-10 inline-flex items-center gap-3", children: activeBranches.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-5 w-5" }),
              " Start New Branch"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-5 w-5 fill-current" }),
              " Start Story"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 transition-opacity group-hover:opacity-100" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs text-white/40", children: "Every choice changes the story. Up to 5 branches per playthrough." })
    ] })
  ] });
};
const VOICE_PROFILES = {
  narrator: { character_id: "narrator", display_name: "Narrator", description: "Warm, cinematic, slightly amused. The voice of the story itself.", accent: "amber" },
  malik_carter: { character_id: "malik_carter", display_name: "Malik Carter", description: "Cocky, animated, leans on charm. Cracks under pressure.", accent: "orange" },
  micah_carter: { character_id: "micah_carter", display_name: "Micah Carter", description: "Controlled, dry, precise. Same face as Malik, opposite tempo.", accent: "sky" },
  denise_carter: { character_id: "denise_carter", display_name: "Denise Carter", description: "Mature, warm but sharp. Doesn't raise her voice; doesn't need to.", accent: "rose" },
  ari: { character_id: "ari", display_name: 'Ariana "Ari" Cole', description: "Bright, perceptive, gentle teasing energy.", accent: "pink" },
  dante_reeves: { character_id: "dante_reeves", display_name: "Dante Reeves", description: "Low, quiet swagger. Vulnerable when no one's watching.", accent: "violet" },
  reggie: { character_id: "reggie", display_name: "Reggie", description: "Loud, hilarious, leans into every joke. Sees more than he lets on.", accent: "yellow" },
  coach_bridges: { character_id: "coach_bridges", display_name: "Coach Bridges", description: "Gravel-voiced, old school, secretly fair.", accent: "emerald" },
  ms_valentina: { character_id: "ms_valentina", display_name: "Ms. Valentina", description: "Crisp, exacting, theatrical when she wants to be.", accent: "fuchsia" },
  compliance_officer: { character_id: "compliance_officer", display_name: "Compliance Officer", description: "Calm authority. Long memory. Never raises pace.", accent: "slate" }
};
function toVoiceId(appCharacterId) {
  if (!appCharacterId) return "narrator";
  const norm = appCharacterId.replace(/-/g, "_");
  if (norm in VOICE_PROFILES) return norm;
  return "narrator";
}
const KEY = "trey_voice_settings_v1";
const VOICE_SETTINGS_EVENT = "trey_voice_settings_changed";
function loadVoiceSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        muted: !!parsed.muted,
        autoplay: true,
        volume: 1
      };
    }
  } catch {
  }
  return { muted: false, autoplay: true, volume: 1 };
}
function saveVoiceSettings(s) {
  const next = { ...s, autoplay: true, volume: 1 };
  localStorage.setItem(KEY, JSON.stringify(next));
  try {
    window.dispatchEvent(new CustomEvent(VOICE_SETTINGS_EVENT, { detail: next }));
  } catch {
  }
}
let currentAudio = null;
let currentUrl = null;
let currentUtterance = null;
let playbackGeneration = 0;
let activePlaybackToken = null;
const audioCache = /* @__PURE__ */ new Map();
function cacheKey(characterId, text, voice) {
  const voicePart = voice?.voiceId || voice?.voiceName || voice?.voiceProvider || characterId;
  return `${characterId}::${voicePart}::${text.trim().toLowerCase().slice(0, 240)}`;
}
function debugVoice(event, payload) {
  try {
    if (localStorage.getItem("trey_voice_debug") !== "1") return;
    console.info(`[VoicePlaybackManager] ${event}`, payload);
  } catch {
  }
}
function stopVoice() {
  playbackGeneration += 1;
  activePlaybackToken = null;
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {
    }
    currentAudio = null;
  }
  if (currentUtterance) {
    try {
      window.speechSynthesis?.cancel();
    } catch {
    }
    currentUtterance = null;
  }
  currentUrl = null;
  debugVoice("stop", { playbackGeneration });
}
function createPlaybackToken(sceneId = "scene") {
  playbackGeneration += 1;
  activePlaybackToken = `${sceneId}_${Date.now()}_${playbackGeneration}`;
  return activePlaybackToken;
}
function isCurrentPlaybackToken(token) {
  return !!token && token === activePlaybackToken;
}
async function generateVoiceLine(characterId, text, voice) {
  if (voice?.voiceProvider === "none") return null;
  if (!voice || voice.voiceProvider === "system" || !voice.voiceProvider) return null;
  const key = cacheKey(characterId, text, voice);
  if (audioCache.has(key)) return audioCache.get(key);
  const { data: { session } } = await supabase.auth.getSession();
  const sb = supabase;
  const token = session?.access_token || sb.supabaseKey;
  const resp = await fetch(`${sb.supabaseUrl}/functions/v1/character-voice-line`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      apikey: sb.supabaseKey
    },
    body: JSON.stringify({
      text,
      character_id: toVoiceId(characterId),
      story_character_id: characterId,
      voice
    })
  });
  if (!resp.ok) throw new Error(`Voice request failed: ${resp.status}`);
  const blob = await resp.blob();
  const url = URL.createObjectURL(blob);
  audioCache.set(key, url);
  return url;
}
function normalizeVolume(volume) {
  if (!Number.isFinite(volume)) return loadVoiceSettings().volume;
  return Math.max(0, Math.min(1, Number(volume)));
}
function speakWithBrowserVoice(characterId, text, opts) {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
    return null;
  }
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const requestedName = opts.voice?.voiceName || VOICE_PROFILES[toVoiceId(characterId)]?.display_name;
    const voices = window.speechSynthesis.getVoices?.() || [];
    const matchedVoice = requestedName ? voices.find((candidate) => candidate.name.toLowerCase().includes(requestedName.toLowerCase())) : void 0;
    if (matchedVoice) utterance.voice = matchedVoice;
    utterance.volume = normalizeVolume(opts.volume);
    utterance.rate = typeof opts.voice?.settings?.rate === "number" ? Number(opts.voice.settings.rate) : 0.96;
    utterance.pitch = typeof opts.voice?.settings?.pitch === "number" ? Number(opts.voice.settings.pitch) : 1;
    utterance.onend = () => {
      if (currentUtterance === utterance && isCurrentPlaybackToken(opts.playbackToken)) {
        currentUtterance = null;
        debugVoice("speech-finished", { characterId, token: opts.playbackToken, lineIndex: opts.lineIndex });
        opts.onEnded?.();
      }
    };
    utterance.onerror = (event) => {
      if (isCurrentPlaybackToken(opts.playbackToken)) opts.onError?.(event);
    };
    currentUtterance = utterance;
    debugVoice("speech-playing", { characterId, token: opts.playbackToken, lineIndex: opts.lineIndex });
    window.speechSynthesis.speak(utterance);
    return utterance;
  } catch (error) {
    opts.onError?.(error);
    return null;
  }
}
async function playVoiceLine(characterId, text, opts = {}) {
  const token = opts.playbackToken || createPlaybackToken(opts.sceneId || "single-line");
  const generationAtStart = playbackGeneration;
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {
    }
    currentAudio = null;
  }
  if (currentUtterance) {
    try {
      window.speechSynthesis?.cancel();
    } catch {
    }
    currentUtterance = null;
  }
  currentUrl = null;
  activePlaybackToken = token;
  if (opts.muted) {
    debugVoice("muted-skip", { characterId, token, lineIndex: opts.lineIndex });
    return null;
  }
  try {
    debugVoice("loading", { characterId, token, lineIndex: opts.lineIndex, text: text.slice(0, 80) });
    const url = await generateVoiceLine(characterId, text, opts.voice);
    if (generationAtStart !== playbackGeneration || !isCurrentPlaybackToken(token)) {
      debugVoice("stale-blocked", { characterId, token, activePlaybackToken, generationAtStart, playbackGeneration });
      return null;
    }
    if (!url) {
      return speakWithBrowserVoice(characterId, text, {
        voice: opts.voice,
        volume: opts.volume,
        onEnded: opts.onEnded,
        onError: opts.onError,
        playbackToken: token,
        lineIndex: opts.lineIndex
      });
    }
    const audio = new Audio(url);
    audio.volume = normalizeVolume(opts.volume);
    currentAudio = audio;
    currentUrl = url;
    audio.addEventListener("ended", () => {
      if (currentAudio === audio && isCurrentPlaybackToken(token)) {
        currentAudio = null;
        debugVoice("finished", { characterId, token, lineIndex: opts.lineIndex });
        opts.onEnded?.();
      }
    });
    audio.addEventListener("error", (e) => {
      if (isCurrentPlaybackToken(token)) opts.onError?.(e);
    });
    debugVoice("playing", { characterId, token, lineIndex: opts.lineIndex, url: currentUrl });
    await audio.play();
    return audio;
  } catch (e) {
    if (!isCurrentPlaybackToken(token)) return null;
    debugVoice("provider-fallback", { characterId, token, error: e instanceof Error ? e.message : String(e) });
    return speakWithBrowserVoice(characterId, text, {
      voice: opts.voice,
      volume: opts.volume,
      onEnded: opts.onEnded,
      onError: opts.onError,
      playbackToken: token,
      lineIndex: opts.lineIndex
    });
  }
}
function normalizeName(value) {
  return (value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}
function resolveStoryVoiceForLine(line, characterVoices, characters = []) {
  const isNarration = line.type === "narration";
  const rawSpeakerId = line.character_id || line.characterId || line.speakerId;
  const speakerById = rawSpeakerId ? characters.find((candidate) => candidate.character_id === rawSpeakerId || normalizeName(candidate.character_id) === normalizeName(rawSpeakerId)) : void 0;
  const speakerByName = !speakerById && line.speakerName ? characters.find((candidate) => normalizeName(candidate.display_name) === normalizeName(line.speakerName)) : void 0;
  const character = speakerById || speakerByName;
  const characterId = isNarration ? "narrator" : character?.character_id || rawSpeakerId || "narrator";
  const speakerName = isNarration ? "Narrator" : line.speakerName || character?.display_name || VOICE_PROFILES[toVoiceId(characterId)]?.display_name || "Narrator";
  const voice = line.voice || (characterId === "narrator" ? characterVoices?.narrator : characterVoices?.characters?.[characterId]) || character?.voice || (characterId === "narrator" ? characterVoices?.narrator : null);
  return { characterId, speakerName, voice: voice || null };
}
const VoicePlayer = ({
  characterId,
  voice,
  text,
  speakerName,
  avatarUrl,
  onEnded,
  autoplayKey,
  playbackToken,
  sceneId,
  lineIndex,
  compact
}) => {
  const [settings, setSettings] = reactExports.useState(loadVoiceSettings());
  const [loading, setLoading] = reactExports.useState(false);
  const profile = VOICE_PROFILES[characterId] || VOICE_PROFILES.narrator;
  const lastAutoplayKeyRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const syncSettings = (event) => {
      const detail = event.detail;
      setSettings(detail || loadVoiceSettings());
    };
    window.addEventListener(VOICE_SETTINGS_EVENT, syncSettings);
    return () => window.removeEventListener(VOICE_SETTINGS_EVENT, syncSettings);
  }, []);
  const play = async () => {
    setLoading(true);
    try {
      await playVoiceLine(characterId, text, {
        muted: settings.muted,
        volume: settings.volume,
        voice,
        onEnded: () => onEnded?.(),
        onError: () => setLoading(false),
        playbackToken,
        sceneId,
        lineIndex
      });
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    if (!autoplayKey) return;
    if (!settings.autoplay) return;
    if (settings.muted) return;
    if (lastAutoplayKeyRef.current === autoplayKey) return;
    lastAutoplayKeyRef.current = autoplayKey;
    play();
    return () => stopVoice();
  }, [autoplayKey, settings.autoplay, settings.muted]);
  const toggleMute = () => {
    const next = { ...settings, muted: !settings.muted };
    setSettings(next);
    saveVoiceSettings(next);
    if (next.muted) stopVoice();
  };
  const handleButton = (event, action) => {
    event.preventDefault();
    event.stopPropagation();
    action();
  };
  if (compact) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: (event) => handleButton(event, play),
          "aria-label": "Replay voice",
          className: "flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/90 hover:bg-white/20",
          children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-3 w-3 fill-current" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: (event) => handleButton(event, toggleMute),
          "aria-label": settings.muted ? "Turn voices on" : "Turn voices off",
          className: "flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-white/15",
          children: settings.muted ? /* @__PURE__ */ jsxRuntimeExports.jsx(VolumeX, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Volume2, { className: "h-3.5 w-3.5" })
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-md", children: [
    avatarUrl && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src: avatarUrl,
        alt: speakerName || profile.display_name,
        className: "h-9 w-9 rounded-full object-cover ring-1 ring-white/15"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold uppercase tracking-widest text-white/60", children: speakerName || profile.display_name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-xs text-white/40", children: profile.description })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: (event) => handleButton(event, play),
        "aria-label": "Replay voice",
        className: "flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20",
        children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-3.5 w-3.5" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: (event) => handleButton(event, toggleMute),
        "aria-label": settings.muted ? "Turn voices on" : "Turn voices off",
        className: "flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/80 hover:bg-white/15",
        children: settings.muted ? /* @__PURE__ */ jsxRuntimeExports.jsx(VolumeX, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Volume2, { className: "h-4 w-4" })
      }
    )
  ] });
};
const VoiceSettingsToolbar = () => {
  const [settings, setSettings] = reactExports.useState(loadVoiceSettings());
  reactExports.useEffect(() => {
    const syncSettings = (event) => {
      const detail = event.detail;
      setSettings(detail || loadVoiceSettings());
    };
    window.addEventListener(VOICE_SETTINGS_EVENT, syncSettings);
    return () => window.removeEventListener(VOICE_SETTINGS_EVENT, syncSettings);
  }, []);
  const toggleMute = () => {
    const next = { ...settings, muted: !settings.muted };
    setSettings(next);
    saveVoiceSettings(next);
    if (next.muted) stopVoice();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick: (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleMute();
      },
      className: `flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors border ${settings.muted ? "border-red-500/30 bg-red-500/10 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]" : "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)]"}`,
      children: [
        settings.muted ? /* @__PURE__ */ jsxRuntimeExports.jsx(VolumeX, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Volume2, { className: "h-3.5 w-3.5" }),
        settings.muted ? "Muted" : "Listening"
      ]
    }
  ) });
};
let currentContext = null;
let currentAIStoryMakerContext = null;
function setCurrentInteractiveStoryNarrationContext(context) {
  currentContext = context;
}
function getCurrentInteractiveStoryNarrationContext() {
  return currentContext;
}
function getCurrentAIStoryMakerNarrationContext() {
  return currentAIStoryMakerContext;
}
function safeId(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}
function currentChapterFromContext(context) {
  return context.chapter || context.beat || context.branch.chapters[context.branch.chapters.length - 1];
}
function getInteractiveStoryMetadata(branch) {
  const installed = getInstalledStoryPackage(branch.storyId);
  if (installed) {
    return {
      id: installed.story.id,
      title: installed.story.title,
      genre: installed.story.genre || "Interactive Story",
      description: installed.story.description || "",
      tone: ""
    };
  }
  if (branch.storyId === "switch_kicks") {
    return {
      id: "switch_kicks",
      title: "Switch Kicks",
      genre: "Body-swap dramedy",
      description: "Twin brothers trade worlds across football, ballet, family pressure, and first love.",
      tone: branch.toneHistory[branch.toneHistory.length - 1] || "Bold"
    };
  }
  return {
    id: branch.storyId,
    title: branch.storyId.replace(/[_-]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()),
    genre: "Interactive Story",
    description: "",
    tone: branch.toneHistory[branch.toneHistory.length - 1] || ""
  };
}
function adaptBeatToCurrentStoryPage(story, chapter, beat, currentBeatIndex = 0) {
  if (!beat && !chapter) {
    return {
      available: false,
      message: "No active interactive story beat is open."
    };
  }
  const activeBeat = beat || chapter;
  const pageId = safeId(activeBeat?.sceneId, `chapter-${activeBeat?.number || currentBeatIndex + 1}`);
  const rawBeat = activeBeat;
  const content = String(
    rawBeat?.narration || rawBeat?.content || rawBeat?.text || activeBeat?.prose || ""
  );
  return {
    available: true,
    storyProjectId: safeId(story?.id, "interactive-story"),
    pageId,
    chapterTitle: chapter?.title || activeBeat?.title || "",
    pageTitle: activeBeat?.title || pageId,
    pageNumber: currentBeatIndex,
    content,
    summary: activeBeat?.summary || "",
    tone: story?.tone || activeBeat?.toneTag || "",
    genre: story?.genre || ""
  };
}
function characterDescription(character) {
  return String(
    character.description || character.short_description || character.role || character.bio || character.portraitPrompt || ""
  );
}
function normalizeNarratorCharacter(character, index) {
  const id = safeId(character.character_id || character.id, `character_${index + 1}`);
  const name = safeId(character.display_name || character.name || character.firstName, id.replace(/[_-]+/g, " "));
  const description = characterDescription(character);
  const voice = character.voice && typeof character.voice === "object" ? character.voice : void 0;
  return {
    id,
    name,
    role: String(character.role || "Character"),
    age: String(character.age || ""),
    personality: String(character.personality || description || "Story character"),
    voiceStyle: String(voice?.audioStyle || voice?.voiceName || character.voiceStyle || `${name} character voice`),
    speechPattern: String(character.speechPattern || character.quote || ""),
    emotionalTone: String(character.emotionalTone || character.tone || ""),
    visualDescription: String(character.visualDescription || description || character.portrait || character.image || "")
  };
}
function adaptStoryCharactersForNarrator(storyOrContext) {
  const context = storyOrContext && typeof storyOrContext === "object" && "branch" in storyOrContext ? storyOrContext : currentContext;
  const chapter = context ? currentChapterFromContext(context) : void 0;
  const installed = context ? getInstalledStoryPackage(context.branch.storyId) : null;
  const rawCharacters = chapter?.storyCharacters?.length ? chapter.storyCharacters : installed?.characters?.length ? installed.characters : context?.branch.storyId === "switch_kicks" ? CHARACTERS : [];
  if (!rawCharacters.length) {
    return {
      available: false,
      message: "No characters found for the current interactive story.",
      characters: []
    };
  }
  return {
    available: true,
    characters: rawCharacters.map((character, index) => normalizeNarratorCharacter(character, index))
  };
}
function lineSpeakerName(line) {
  return line.speakerName || line.character_id || line.characterId || line.speakerId || "";
}
function createNarrationScriptFromBeat(_story, beat) {
  if (!beat) {
    return {
      available: false,
      mode: "silent",
      lines: [],
      message: "Narration script missing because no active beat is open."
    };
  }
  if (beat.voiceLines?.length) {
    const lines = [...beat.voiceLines].filter((line) => line.text?.trim()).sort((a, b) => (a.lineIndex || 0) - (b.lineIndex || 0)).map((line, index) => {
      const type = line.type === "dialogue" || lineSpeakerName(line) && lineSpeakerName(line) !== "narrator" ? "dialogue" : "narrator";
      return {
        id: line.id || `line_${index + 1}`,
        type,
        characterName: type === "dialogue" ? lineSpeakerName(line) : "",
        text: line.text.trim(),
        emotion: line.emotion || beat.toneTag || "",
        orderIndex: line.lineIndex ?? index
      };
    });
    return {
      available: true,
      mode: lines.some((line) => line.type === "dialogue") ? "hybrid" : "author",
      lines
    };
  }
  const text = beat.prose?.trim();
  if (!text) {
    return {
      available: false,
      mode: "silent",
      lines: [],
      message: "Narration script missing for the current story beat."
    };
  }
  return {
    available: true,
    mode: "author",
    lines: [
      {
        id: `${safeId(beat.sceneId, `chapter_${beat.number}`)}_narration`,
        type: "narrator",
        characterName: "",
        text,
        emotion: beat.toneTag || "",
        orderIndex: 0
      }
    ]
  };
}
function createDirectionOptionsFromChoices(beatOrChoices) {
  const choices = Array.isArray(beatOrChoices) ? beatOrChoices : [];
  if (!choices.length) return [];
  return choices.map((choice) => choice.label ? `${choice.label}. ${choice.text}` : choice.text);
}
function prepareDirectionFromBranch(branch) {
  const choices = branch.pendingStopPoint?.choices || [];
  if (choices.length) {
    return {
      canContinue: true,
      needsDirection: true,
      currentPrompt: "What happens next?",
      suggestedDirections: [
        ...createDirectionOptionsFromChoices(choices),
        "Say my own choice"
      ]
    };
  }
  return {
    canContinue: !branch.isComplete,
    needsDirection: false,
    currentPrompt: branch.isComplete ? "This story branch is complete." : "Continue the story.",
    suggestedDirections: branch.isComplete ? [] : ["Continue"]
  };
}
function getCurrentStoryPageForNarrator() {
  const context = getCurrentInteractiveStoryNarrationContext();
  if (!context) {
    return {
      available: false,
      message: "No active interactive story beat is open."
    };
  }
  const story = context.story || getInteractiveStoryMetadata(context.branch);
  const chapter = currentChapterFromContext(context);
  return adaptBeatToCurrentStoryPage(story, chapter, context.beat || chapter, context.currentBeatIndex ?? 0);
}
function getCurrentDirectionForNarrator() {
  const context = getCurrentInteractiveStoryNarrationContext();
  if (!context) {
    return {
      canContinue: false,
      needsDirection: false,
      currentPrompt: "No active interactive story beat is open.",
      suggestedDirections: []
    };
  }
  return prepareDirectionFromBranch(context.branch);
}
function getCurrentNarrationScriptForNarrator() {
  const context = getCurrentInteractiveStoryNarrationContext();
  const chapter = context ? currentChapterFromContext(context) : void 0;
  return createNarrationScriptFromBeat(context?.story, chapter);
}
function parseRpcPayload(payload) {
  if (!payload) return {};
  try {
    const parsed = JSON.parse(payload);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}
function jsonRpcResponse(data) {
  return JSON.stringify(data);
}
function closestChoiceForTranscript(transcript) {
  const context = getCurrentInteractiveStoryNarrationContext();
  const choices = context?.branch.pendingStopPoint?.choices || [];
  const normalized = transcript.trim().toLowerCase();
  if (!normalized || !choices.length) return void 0;
  return choices.find((choice) => {
    const label = choice.label.toLowerCase();
    const text = choice.text.toLowerCase();
    return normalized === label || normalized.includes(text) || text.includes(normalized);
  }) || choices.find((choice) => normalized.includes(choice.label.toLowerCase()));
}
function safeJson(value) {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}
function participantSnapshot(participant) {
  return {
    identity: typeof participant.identity === "string" ? participant.identity : "",
    name: typeof participant.name === "string" ? participant.name : "",
    kind: typeof participant.kind === "string" || typeof participant.kind === "number" ? String(participant.kind) : "",
    metadata: typeof participant.metadata === "string" ? participant.metadata.slice(0, 500) : ""
  };
}
function participantLooksLikeAgent(participant, expectedAgentName) {
  const snapshot = participantSnapshot(participant);
  const metadata = safeJson(snapshot.metadata);
  const expected = expectedAgentName.toLowerCase();
  const identity = snapshot.identity.toLowerCase();
  const name = snapshot.name.toLowerCase();
  const kind = snapshot.kind.toLowerCase();
  const metadataAgentName = String(
    metadata.agentName || metadata.agent_name || metadata.agent || metadata.livekitAgentName || ""
  ).toLowerCase();
  return identity.includes(expected) || name.includes(expected) || metadataAgentName === expected || metadataAgentName.includes(expected) || kind.includes("agent");
}
function runLocalNarratorToolCheck() {
  return {
    page: getCurrentStoryPageForNarrator(),
    characters: adaptStoryCharactersForNarrator(getCurrentInteractiveStoryNarrationContext()),
    narrationScript: getCurrentNarrationScriptForNarrator()
  };
}
function registerInteractiveStoryRpcTools(room, options = {}) {
  const registered = [];
  const register = (method, handler) => {
    try {
      room.unregisterRpcMethod?.(method);
    } catch {
    }
    room.registerRpcMethod(method, async (data) => {
      try {
        options.onStatusMessage?.(`RPC received: ${method}`);
        console.info("[LiveKit] RPC received", { method });
        const result = handler(parseRpcPayload(data.payload));
        console.info("[LiveKit] RPC response returned", { method });
        return jsonRpcResponse(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : "RPC tool not registered.";
        return jsonRpcResponse({ available: false, message });
      }
    });
    registered.push(method);
  };
  register("getCurrentStoryPage", () => getCurrentStoryPageForNarrator());
  register("getCurrentCharacters", () => {
    if (getCurrentAIStoryMakerNarrationContext()) ;
    return adaptStoryCharactersForNarrator(getCurrentInteractiveStoryNarrationContext());
  });
  register("getNarrationScript", () => getCurrentNarrationScriptForNarrator());
  register("saveNarrationStatus", (payload) => {
    const update = {
      pageId: typeof payload.pageId === "string" ? payload.pageId : void 0,
      status: typeof payload.status === "string" ? payload.status : void 0,
      message: typeof payload.message === "string" ? payload.message : "",
      timestamp: typeof payload.timestamp === "string" ? payload.timestamp : (/* @__PURE__ */ new Date()).toISOString()
    };
    options.onNarrationStatus?.(update);
    return { ok: true, status: update.status || "started", pageId: update.pageId || "" };
  });
  register("submitStoryDirection", (payload) => {
    const transcript = String(payload.transcript || payload.text || payload.direction || "").trim();
    if (!transcript) {
      return { ok: false, message: "Spoken input empty." };
    }
    const match = closestChoiceForTranscript(transcript);
    options.onSpokenDirection?.({
      transcript,
      matchedChoiceLabel: match?.label,
      matchedChoiceText: match?.text,
      receivedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    return {
      ok: true,
      autoAdvanced: false,
      message: match ? "Spoken direction matched a choice. User confirmation is still required." : "Spoken direction saved for user confirmation.",
      matchedChoice: match ? { label: match.label, text: match.text } : null
    };
  });
  register("prepareNextPageDirection", () => getCurrentDirectionForNarrator());
  options.onStatusMessage?.("RPC tools registered.");
  return () => {
    for (const method of registered) {
      try {
        room.unregisterRpcMethod?.(method);
      } catch {
      }
    }
  };
}
async function requestLiveKitToken(options) {
  options.onStatusMessage?.("LiveKit token ready");
  let accessToken = "";
  try {
    const supabase2 = createBrowserClient();
    const { data } = await supabase2.auth.getSession();
    accessToken = data.session?.access_token || "";
  } catch {
  }
  const response = await fetch("/api/livekit/token", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...accessToken ? { authorization: `Bearer ${accessToken}` } : {}
    },
    body: JSON.stringify({
      roomKind: options.roomKind || "interactive-story",
      storyId: options.storyId,
      beatId: options.beatId,
      storyProjectId: options.storyProjectId,
      projectId: options.projectId,
      pageId: options.pageId
    })
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok || !payload.token || !payload.livekitUrl) {
    throw new Error(payload?.error || "LiveKit token route unavailable.");
  }
  options.onDebugEvent?.("token-diagnostics", {
    roomName: payload.roomName || "",
    livekitHost: payload.diagnostics?.livekitHost || "",
    apiKeyFingerprint: payload.diagnostics?.apiKeyFingerprint || "",
    dispatchEnabled: Boolean(payload.diagnostics?.dispatchEnabled),
    tokenHasRoomConfig: Boolean(payload.diagnostics?.tokenHasRoomConfig),
    tokenDispatchAgentPresent: Boolean(payload.diagnostics?.tokenDispatchAgentPresent),
    tokenDispatchMetadataValid: Boolean(payload.diagnostics?.tokenDispatchMetadataValid),
    tokenDispatchMetadataMode: payload.diagnostics?.tokenDispatchMetadataMode || ""
  });
  console.info("[LiveKit] token diagnostics", {
    roomName: payload.roomName,
    livekitHost: payload.diagnostics?.livekitHost,
    apiKeyFingerprint: payload.diagnostics?.apiKeyFingerprint,
    dispatchEnabled: payload.diagnostics?.dispatchEnabled,
    tokenHasRoomConfig: payload.diagnostics?.tokenHasRoomConfig,
    tokenDispatchAgentPresent: payload.diagnostics?.tokenDispatchAgentPresent,
    tokenDispatchMetadataValid: payload.diagnostics?.tokenDispatchMetadataValid,
    tokenDispatchMetadataMode: payload.diagnostics?.tokenDispatchMetadataMode
  });
  return payload;
}
function getLiveKitNarratorConfig() {
  return {
    displayUrl: "",
    agentName: "Hayden-1f01",
    configured: true
  };
}
async function connectInteractiveStoryNarrator(options) {
  const config = getLiveKitNarratorConfig();
  const token = await requestLiveKitToken(options);
  const { Room, RoomEvent, Track } = await import("../_libs/livekit-client.mjs");
  const room = new Room({ adaptiveStream: true, dynacast: true });
  const expectedAgentName = token.agentName || options.agentName || config.agentName;
  let unregister = () => {
  };
  let agentDetected = false;
  let agentAudioSubscribed = false;
  let agentJoinTimer;
  const markAgentDetected = (participant, reason) => {
    if (agentDetected) return;
    agentDetected = true;
    if (agentJoinTimer) clearTimeout(agentJoinTimer);
    const snapshot = participantSnapshot(participant);
    console.info("[LiveKit] agent participant detected", { reason, ...snapshot });
    options.onDebugEvent?.("agent-detected", { reason, ...snapshot });
    options.onStatusMessage?.("Hayden-1f01 detected");
  };
  const observeParticipant = (participant, reason) => {
    const record = participant;
    const snapshot = participantSnapshot(record);
    console.info("[LiveKit] participant observed", { reason, ...snapshot });
    options.onDebugEvent?.("participant-observed", { reason, ...snapshot });
    if (participantLooksLikeAgent(record, expectedAgentName)) {
      markAgentDetected(record, reason);
    }
  };
  room.on(RoomEvent.ConnectionStateChanged, (state) => {
    console.info("[LiveKit] connection state", { state: String(state) });
  });
  room.on(RoomEvent.Disconnected, () => {
    if (agentJoinTimer) clearTimeout(agentJoinTimer);
    options.onStatusMessage?.(agentDetected ? "Agent disconnected" : "disconnected");
  });
  room.on(RoomEvent.ParticipantConnected, (participant) => {
    observeParticipant(participant, "participant-connected");
  });
  room.on(RoomEvent.ParticipantDisconnected, (participant) => {
    const snapshot = participantSnapshot(participant);
    console.info("[LiveKit] participant disconnected", snapshot);
    if (participantLooksLikeAgent(participant, expectedAgentName)) {
      options.onStatusMessage?.("Agent disconnected");
    }
  });
  room.on(RoomEvent.TrackSubscribed, (track, _publication, participant) => {
    const record = participant;
    const source = String(track?.source || "");
    const kind = String(track?.kind || "");
    console.info("[LiveKit] track subscribed", {
      participant: participantSnapshot(record),
      source,
      kind
    });
    if (participantLooksLikeAgent(record, expectedAgentName) && (kind === "audio" || source === Track.Source.Microphone)) {
      agentAudioSubscribed = true;
      markAgentDetected(record, "audio-track-subscribed");
      options.onStatusMessage?.("audio track subscribed");
    }
  });
  room.on(RoomEvent.TrackSubscriptionFailed, (trackSid, participant, reason) => {
    console.warn("[LiveKit] track subscription failed", {
      trackSid,
      participant: participantSnapshot(participant),
      reason: String(reason || "")
    });
  });
  try {
    options.onStatusMessage?.("Room connecting");
    await room.connect(token.livekitUrl, token.token);
  } catch (connectError) {
    const urlHost = (() => {
      try {
        return new URL(token.livekitUrl).hostname;
      } catch {
        return "unknown";
      }
    })();
    console.error("[LiveKit] room.connect failed", {
      urlHost,
      roomName: token.roomName,
      participantIdentity: token.participant.identity,
      message: connectError instanceof Error ? connectError.message : String(connectError)
    });
    throw connectError;
  }
  options.onStatusMessage?.("Room connected");
  unregister = registerInteractiveStoryRpcTools(room, options);
  options.onStatusMessage?.("RPC tools registered");
  console.info("[LiveKit] room ready", {
    roomName: token.roomName,
    participantIdentity: token.participant.identity,
    dispatchEnabled: token.diagnostics?.dispatchEnabled,
    tokenHasRoomConfig: token.diagnostics?.tokenHasRoomConfig,
    tokenDispatchAgentPresent: token.diagnostics?.tokenDispatchAgentPresent
  });
  for (const participant of room.remoteParticipants?.values?.() || []) {
    observeParticipant(participant, "existing-remote-participant");
  }
  if (expectedAgentName === "Hayden-1f01" && !agentDetected) {
    options.onStatusMessage?.("Waiting for Hayden-1f01");
    agentJoinTimer = setTimeout(() => {
      if (!agentDetected) {
        options.onStatusMessage?.("Room connected, but Hayden-1f01 did not join. Check the agent deployment, project, or dispatch config.");
      }
    }, 2e4);
  }
  return {
    room,
    token,
    agentName: expectedAgentName,
    unregister,
    disconnect: () => {
      if (agentJoinTimer) clearTimeout(agentJoinTimer);
      unregister();
      room.disconnect();
    },
    testCurrentPageRpc: runLocalNarratorToolCheck,
    sendCue: async (cue) => {
      const context = getCurrentInteractiveStoryNarrationContext();
      const payload = new TextEncoder().encode(JSON.stringify({
        type: "interactive-story-narrator-cue",
        cue,
        agentName: expectedAgentName,
        page: getCurrentStoryPageForNarrator(),
        choices: getCurrentDirectionForNarrator(),
        storyId: context?.branch.storyId || options.storyId,
        beatId: options.beatId,
        pageId: options.pageId,
        projectId: options.projectId || options.storyProjectId,
        agentDetected,
        agentAudioSubscribed,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }));
      await room.localParticipant?.publishData?.(payload, { reliable: true, topic: "interactive-story-narrator" });
      if (cue === "read-current-beat") options.onStatusMessage?.("reading current beat/page");
      if (cue === "read-choices") options.onStatusMessage?.("reading choices");
    }
  };
}
function characterAvatar(characterId, fallback) {
  const match = CHARACTERS.find((candidate) => candidate.id === characterId);
  if (!match) return fallback || "/interactive-stories/portraits/narrator.png";
  const map = CHARACTER_PHOTO_MAP[match.mapKey];
  return map?.image || match.image || fallback || "/interactive-stories/portraits/narrator.png";
}
function beatsFromStructuredLines(lines, chapter) {
  if (!lines?.length) return [];
  return [...lines].filter((line) => typeof line.text === "string" && line.text.trim()).sort((a, b) => (a.lineIndex || 0) - (b.lineIndex || 0)).map((line) => {
    const resolved = resolveStoryVoiceForLine(line, chapter.characterVoices, chapter.storyCharacters);
    const isDialogue = line.type === "dialogue" || resolved.characterId !== "narrator" && line.type !== "narration";
    if (!isDialogue) {
      return {
        kind: "narration",
        text: line.text.trim(),
        speakerId: "narrator",
        speakerName: "Narrator",
        voice: resolved.voice
      };
    }
    return {
      kind: "dialogue",
      text: line.text.trim(),
      speakerId: resolved.characterId,
      speakerName: resolved.speakerName,
      avatar: characterAvatar(resolved.characterId, chapter.storyCharacters?.find((c) => c.character_id === resolved.characterId)?.portrait),
      voice: resolved.voice
    };
  });
}
function getFriendlyNarratorError(error) {
  const message = error instanceof Error ? error.message : String(error || "");
  const lower = message.toLowerCase();
  if (lower.includes("invalid token") || lower.includes("no valid credentials") || lower.includes("authentication failed")) {
    return "LiveKit rejected the narrator token. Check the API key and secret for this LiveKit URL.";
  }
  if (lower.includes("not configured") || lower.includes("livekit url") || lower.includes("missing")) {
    return "LiveKit env missing. Add the LiveKit URL and server token credentials.";
  }
  if (lower.includes("token") && (lower.includes("failed") || lower.includes("unavailable"))) {
    return "LiveKit token route failed.";
  }
  if (lower.includes("signal") || lower.includes("connection") || lower.includes("websocket")) {
    return "Room connection failed.";
  }
  return "Live narration could not connect yet. Check the LiveKit project credentials and try again.";
}
function parseBeats(prose) {
  const paragraphs = prose.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  const beats = [];
  let lastSpeaker = null;
  const findSpeakerInText = (text) => {
    const lower = text.toLowerCase();
    for (const c of CHARACTERS) {
      const re = new RegExp(`\\b${c.firstName}\\b`, "i");
      if (re.test(text) || lower.includes(c.name.toLowerCase())) {
        const map = CHARACTER_PHOTO_MAP[c.mapKey];
        return {
          id: toVoiceId(c.id),
          name: c.firstName,
          avatar: map?.image || c.image
        };
      }
    }
    return null;
  };
  for (const p of paragraphs) {
    const quoteRegex = /"([^"]+)"/g;
    let lastIndex = 0;
    let m;
    let hadQuote = false;
    while ((m = quoteRegex.exec(p)) !== null) {
      hadQuote = true;
      const before = p.slice(lastIndex, m.index).trim();
      const quoted = m[1].trim();
      const after = p.slice(m.index + m[0].length, m.index + m[0].length + 60);
      if (before && !/^[,;.\s]+$/.test(before)) {
        const spk2 = findSpeakerInText(before) || findSpeakerInText(after);
        if (spk2) lastSpeaker = spk2;
        beats.push({ kind: "narration", text: before, speakerId: "narrator", speakerName: "Narrator" });
      } else {
        const spk2 = findSpeakerInText(after);
        if (spk2) lastSpeaker = spk2;
      }
      const spk = lastSpeaker;
      if (spk) {
        beats.push({
          kind: "dialogue",
          text: quoted,
          speakerId: spk.id,
          speakerName: spk.name,
          avatar: spk.avatar
        });
      } else {
        beats.push({ kind: "narration", text: `"${quoted}"`, speakerId: "narrator", speakerName: "Narrator" });
      }
      lastIndex = m.index + m[0].length;
    }
    const tail = p.slice(lastIndex).trim();
    if (!hadQuote) {
      beats.push({ kind: "narration", text: p, speakerId: "narrator", speakerName: "Narrator" });
    } else if (tail && !/^[,;.\s]+$/.test(tail)) {
      beats.push({ kind: "narration", text: tail, speakerId: "narrator", speakerName: "Narrator" });
    }
  }
  return beats;
}
const ReadingScreen = ({
  branch,
  onBack,
  onContinue,
  onOpenStatus,
  onReread
}) => {
  const chapter = branch.chapters[branch.chapters.length - 1];
  const [railOpen, setRailOpen] = reactExports.useState(false);
  const [autoNarrate, setAutoNarrate] = reactExports.useState(false);
  const [narratorStatus, setNarratorStatus] = reactExports.useState({ message: "Not connected" });
  const [connectionStatus, setConnectionStatus] = reactExports.useState("idle");
  const [spokenDirection, setSpokenDirection] = reactExports.useState(null);
  const [narratorMessage, setNarratorMessage] = reactExports.useState("Live narrator unavailable until connected.");
  const sessionRef = React__default.useRef(null);
  const narratorConfig = getLiveKitNarratorConfig();
  const storyMeta = reactExports.useMemo(() => getInteractiveStoryMetadata(branch), [branch]);
  const beats = reactExports.useMemo(() => {
    const structured = beatsFromStructuredLines(chapter.voiceLines, chapter);
    return structured.length ? structured : parseBeats(chapter.prose);
  }, [chapter]);
  const [revealCount, setRevealCount] = reactExports.useState(1);
  const visibleBeats = beats.slice(0, revealCount);
  const isComplete = revealCount >= beats.length;
  beats[revealCount - 1];
  reactExports.useEffect(() => {
    setCurrentInteractiveStoryNarrationContext({
      branch,
      story: storyMeta,
      chapter,
      beat: chapter,
      currentBeatIndex: Math.max(0, chapter.number - 1)
    });
    return () => setCurrentInteractiveStoryNarrationContext(null);
  }, [branch, chapter, storyMeta]);
  reactExports.useEffect(() => {
    setRevealCount(1);
    stopVoice();
    return () => stopVoice();
  }, [chapter.number]);
  reactExports.useEffect(() => {
    if (!autoNarrate || !sessionRef.current || connectionStatus !== "connected") return;
    sessionRef.current.sendCue("beat-changed").catch(() => {
      setNarratorMessage("The narrator could not receive the new beat cue.");
    });
  }, [autoNarrate, chapter.sceneId, chapter.number, connectionStatus]);
  reactExports.useEffect(() => () => {
    sessionRef.current?.disconnect();
    sessionRef.current = null;
  }, []);
  loadVoiceSettings();
  const playbackSceneId = chapter.sceneId || `chapter_${chapter.number}`;
  const currentLineIndex = Math.max(0, revealCount - 1);
  const playbackToken = `${branch.id}:${playbackSceneId}:${currentLineIndex}`;
  const advance = () => {
    stopVoice();
    if (!isComplete) setRevealCount((n) => Math.min(beats.length, n + 1));
  };
  const skipAll = () => {
    stopVoice();
    setRevealCount(beats.length);
  };
  const imgMeta = getImageMeta(chapter.image);
  const imageFit = chapter.imageFit || imgMeta.fit;
  const imagePosition = chapter.imagePosition || imgMeta.position;
  const heroFitClass = imageFit === "contain" ? "object-contain bg-zinc-950" : "object-cover";
  const startNarrator = async () => {
    if (sessionRef.current) return;
    setConnectionStatus("connecting");
    setNarratorMessage("token requested");
    try {
      const session = await connectInteractiveStoryNarrator({
        storyId: branch.storyId,
        beatId: chapter.sceneId || `chapter-${chapter.number}`,
        agentName: narratorConfig.agentName,
        onNarrationStatus: (status) => {
          setNarratorStatus(status);
          setNarratorMessage(status.message || `Narration ${status.status || "updated"}.`);
        },
        onSpokenDirection: setSpokenDirection,
        onStatusMessage: (message) => {
          setNarratorMessage(message);
          const lower = message.toLowerCase();
          if (lower === "connected" || lower.includes("reachable")) {
            setConnectionStatus("connected");
          }
          if (lower.includes("did not join") || lower.includes("failed")) {
            setConnectionStatus("error");
          }
          if (lower.includes("disconnected")) {
            setConnectionStatus("idle");
            sessionRef.current = null;
          }
        }
      });
      sessionRef.current = session;
      setConnectionStatus("connected");
      setNarratorStatus({ status: "started", message: "connected", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
    } catch (error) {
      setConnectionStatus("error");
      setNarratorMessage(`failed: ${getFriendlyNarratorError(error)}`);
      sessionRef.current?.disconnect();
      sessionRef.current = null;
    }
  };
  const testCurrentPageRpc = () => {
    if (!sessionRef.current) {
      setNarratorMessage("RPC tool not registered");
      return;
    }
    try {
      const result = sessionRef.current.testCurrentPageRpc();
      console.info("[LiveKit] local narrator tool check", {
        pageAvailable: Boolean(result.page?.available),
        charactersAvailable: Boolean(result.characters?.available),
        narrationScriptAvailable: Boolean(result.narrationScript?.available)
      });
      setNarratorMessage("RPC tools registered");
    } catch {
      setNarratorMessage("failed: RPC tool not registered");
    }
  };
  const stopNarrator = () => {
    sessionRef.current?.disconnect();
    sessionRef.current = null;
    setConnectionStatus("idle");
    setNarratorStatus({ status: "paused", message: "Narrator stopped.", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
    setNarratorMessage("disconnected");
  };
  const sendNarratorCue = (cue) => {
    if (!sessionRef.current || connectionStatus !== "connected") {
      setNarratorMessage("disconnected");
      return;
    }
    setNarratorMessage(cue === "read-current-beat" ? "reading current beat/page" : "reading choices");
    sessionRef.current.sendCue(cue).then(() => {
      setNarratorMessage(cue === "read-current-beat" ? "reading current beat/page" : "reading choices");
    }).catch(() => {
      setNarratorMessage("failed: narrator cue could not be sent.");
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen pb-32", children: [
    chapter.image && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[4/3] min-h-[260px] w-full overflow-hidden bg-zinc-950 sm:aspect-[16/9]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: chapter.image,
          alt: chapter.title,
          className: `absolute inset-0 h-full w-full ${heroFitClass}`,
          style: { objectPosition: imagePosition }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onBack,
          className: "absolute left-4 top-10 rounded-full border border-white/20 bg-black/40 p-2.5 text-white backdrop-blur-md",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onOpenStatus,
          className: "absolute right-4 top-10 rounded-full border border-white/20 bg-black/40 p-2.5 text-white backdrop-blur-md",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-5 w-5" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-0 left-0 right-0 px-5 pb-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400", children: [
          "Chapter ",
          chapter.number
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-black leading-tight tracking-tight text-white", children: chapter.title.replace(/^Chapter \d+\s*[—-]\s*/, "") })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-5 mt-4 overflow-hidden rounded-[1.35rem] border border-cyan-300/20 bg-zinc-950/60 shadow-[0_0_34px_rgba(34,211,238,0.12)] backdrop-blur-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-white/10 bg-[linear-gradient(135deg,rgba(8,47,73,0.62),rgba(88,28,135,0.28),rgba(0,0,0,0.2))] p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-200/80", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MicVocal, { className: "h-4 w-4 text-cyan-300" }),
              "LiveKit Narrator"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mt-1 font-display text-lg font-black text-white", children: [
              "Agent: ",
              narratorConfig.agentName
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${connectionStatus === "connected" ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-200 shadow-[0_0_18px_rgba(52,211,153,0.22)]" : connectionStatus === "connecting" ? "border-cyan-300/40 bg-cyan-400/15 text-cyan-100" : connectionStatus === "error" ? "border-red-300/40 bg-red-400/15 text-red-100" : "border-white/15 bg-white/5 text-white/50"}`, children: connectionStatus === "connected" ? "Connected" : connectionStatus === "connecting" ? "Connecting" : connectionStatus === "error" ? "Failed" : "Disconnected" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid gap-2 text-xs text-white/65 sm:grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-black/25 px-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] uppercase tracking-widest text-white/35", children: "Story" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate font-semibold text-white", children: storyMeta.title })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-black/25 px-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] uppercase tracking-widest text-white/35", children: "Chapter / Beat" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate font-semibold text-white", children: chapter.title })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-black/25 px-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] uppercase tracking-widest text-white/35", children: "Narration Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate font-semibold text-white", children: narratorStatus.status || "idle" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 p-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: startNarrator,
            disabled: connectionStatus === "connecting" || connectionStatus === "connected",
            className: "flex min-h-11 items-center justify-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-cyan-100 transition hover:bg-cyan-400/15 disabled:opacity-45",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "h-4 w-4" }),
              " Start Narrator"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: stopNarrator,
            disabled: !sessionRef.current,
            className: "flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-widest text-white/80 transition hover:bg-white/10 disabled:opacity-45",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "h-4 w-4" }),
              " Stop Narrator"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => sendNarratorCue("read-current-beat"),
            className: "flex min-h-11 items-center justify-center gap-2 rounded-xl border border-violet-300/30 bg-violet-500/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-violet-100 transition hover:bg-violet-500/15",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Volume2, { className: "h-4 w-4" }),
              " Read Current Beat"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => sendNarratorCue("read-choices"),
            className: "flex min-h-11 items-center justify-center gap-2 rounded-xl border border-fuchsia-300/30 bg-fuchsia-500/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-fuchsia-100 transition hover:bg-fuchsia-500/15",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ListMusic, { className: "h-4 w-4" }),
              " Read Choices"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: testCurrentPageRpc,
            className: "flex min-h-11 items-center justify-center gap-2 rounded-xl border border-amber-300/30 bg-amber-500/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-amber-100 transition hover:bg-amber-500/15",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-4 w-4" }),
              " Test Current Page RPC"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 border-t border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 text-sm text-white/75", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              checked: autoNarrate,
              onChange: (event) => setAutoNarrate(event.target.checked),
              className: "h-4 w-4 accent-cyan-300"
            }
          ),
          "Auto-Narrate Beats"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-white/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-amber-300" }),
          narratorMessage
        ] })
      ] }),
      spokenDirection && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-white/10 bg-black/25 px-4 py-3 text-xs text-white/70", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold uppercase tracking-widest text-cyan-200/80", children: "Spoken Direction" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1", children: spokenDirection.transcript }),
        spokenDirection.matchedChoiceText && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-emerald-100", children: [
          "Closest choice: ",
          spokenDirection.matchedChoiceLabel,
          ". ",
          spokenDirection.matchedChoiceText
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-5 mt-4 flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-black/40 p-2 backdrop-blur", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(VoiceSettingsToolbar, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          Math.min(revealCount, beats.length),
          "/",
          beats.length
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: (event) => {
              event.preventDefault();
              event.stopPropagation();
              skipAll();
            },
            className: "flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-white/70",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SkipForward, { className: "h-3 w-3" }),
              " Skip"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => setRailOpen((o) => !o),
        className: "mx-5 mt-3 flex w-[calc(100%-2.5rem)] items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/80",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-4 w-4 text-violet-400" }),
            "Relationships & Risk"
          ] }),
          railOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4" })
        ]
      }
    ),
    railOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-5 mt-2 space-y-2.5 rounded-xl border border-white/10 bg-black/40 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MeterBar, { label: "Trust — Ari", value: branch.meters.trust_ari, color: "pink", compact: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MeterBar, { label: "Trust — Dante", value: branch.meters.trust_dante, color: "violet", compact: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MeterBar, { label: "Mom Suspicion", value: branch.meters.suspicion_mom, color: "amber", compact: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MeterBar, { label: "Coach Risk", value: branch.meters.suspicion_coach, color: "amber", compact: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MeterBar, { label: "Risk Level", value: branch.meters.risk_level, color: "red", compact: true })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        onClick: advance,
        className: "mx-auto mt-4 max-w-2xl cursor-pointer select-none px-5",
        role: "button",
        "aria-label": "Tap to advance",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: visibleBeats.map((b, i) => {
            const isLatest = i === visibleBeats.length - 1;
            if (b.kind === "narration") {
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: `rounded-2xl px-2 py-1 ${isLatest ? "animate-in fade-in" : ""}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-serif text-[17px] leading-[1.75] text-white/85", children: b.text }),
                    isLatest && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      VoicePlayer,
                      {
                        characterId: "narrator",
                        text: b.text,
                        speakerName: b.speakerName,
                        voice: b.voice,
                        compact: true,
                        autoplayKey: `${branch.id}-${playbackSceneId}-${i}`,
                        playbackToken,
                        sceneId: playbackSceneId,
                        lineIndex: i,
                        onEnded: () => advance()
                      }
                    ) })
                  ]
                },
                i
              );
            }
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: `flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md ${isLatest ? "ring-1 ring-violet-500/50 shadow-lg shadow-violet-500/10" : ""}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "img",
                    {
                      src: b.avatar,
                      alt: b.speakerName,
                      className: "h-12 w-12 flex-shrink-0 rounded-full object-cover ring-2 ring-white/20",
                      style: { objectPosition: "center 25%" }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-sm font-bold text-white", children: b.speakerName }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-full bg-white/10 px-2 py-0.5 text-[9px] uppercase tracking-widest text-white/60", children: "Voice Line" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 font-serif text-[16px] italic leading-snug text-white/95", children: [
                      '"',
                      b.text,
                      '"'
                    ] }),
                    isLatest && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      VoicePlayer,
                      {
                        characterId: b.speakerId,
                        text: b.text,
                        voice: b.voice,
                        speakerName: b.speakerName,
                        avatarUrl: b.avatar,
                        compact: true,
                        autoplayKey: `${branch.id}-${playbackSceneId}-${i}`,
                        playbackToken,
                        sceneId: playbackSceneId,
                        lineIndex: i,
                        onEnded: () => advance()
                      }
                    ) })
                  ] })
                ]
              },
              i
            );
          }) }),
          !isComplete && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-white/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-3 w-3 fill-current" }),
            " Tap to advance"
          ] })
        ]
      }
    ),
    isComplete && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2.5 px-5 pt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => {
            stopVoice();
            onContinue();
          },
          className: "group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-4 font-display text-base font-bold uppercase tracking-widest text-white shadow-lg shadow-violet-500/30 transition-transform active:scale-[0.98]",
          children: [
            "Continue",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-5 w-5 transition-transform group-hover:translate-x-1" })
          ]
        }
      ),
      onReread && branch.chapters.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => {
            stopVoice();
            onReread();
          },
          className: "flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white/80 transition-colors hover:bg-white/10",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "h-3.5 w-3.5" }),
            " Re-read Chapters"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 text-center text-xs text-white/40", children: [
        "Chapter ",
        chapter.number,
        " • ",
        branch.chapters.length,
        " chapter",
        branch.chapters.length === 1 ? "" : "s",
        " played •",
        " ",
        branch.isComplete ? "Branch Complete" : "Branch In Progress"
      ] })
    ] })
  ] });
};
const IMPACT_META$1 = {
  Trust: { Icon: Shield, ring: "ring-cyan-400/70", chip: "bg-cyan-500/15 border-cyan-500/40", text: "text-cyan-300" },
  Tension: { Icon: Flame, ring: "ring-orange-400/70", chip: "bg-orange-500/15 border-orange-500/40", text: "text-orange-300" },
  Loyalty: { Icon: Link2, ring: "ring-amber-400/70", chip: "bg-amber-500/15 border-amber-500/40", text: "text-amber-300" },
  Respect: { Icon: Crown, ring: "ring-violet-400/70", chip: "bg-violet-500/15 border-violet-500/40", text: "text-violet-300" },
  Pressure: { Icon: TriangleAlert, ring: "ring-red-400/70", chip: "bg-red-500/15 border-red-500/40", text: "text-red-300" },
  Distance: { Icon: Wind, ring: "ring-zinc-300/60", chip: "bg-zinc-500/15 border-zinc-500/40", text: "text-zinc-300" },
  Bond: { Icon: Heart, ring: "ring-pink-400/70", chip: "bg-pink-500/15 border-pink-500/40", text: "text-pink-300" },
  Rivalry: { Icon: Swords, ring: "ring-fuchsia-400/70", chip: "bg-fuchsia-500/15 border-fuchsia-500/40", text: "text-fuchsia-300" }
};
const buildAffectedLabel = (chars) => {
  if (chars.length === 0) return "Affects The Story";
  if (chars.length === 1) return `Affects ${chars[0].firstName}`;
  if (chars.length === 2) return `Affects ${chars[0].firstName} + ${chars[1].firstName}`;
  return `Affects ${chars[0].firstName}, ${chars[1].firstName} +${chars.length - 2}`;
};
const StopPointScreen = ({ branch, onBack, onSubmit, selectedChoiceIndex = -1 }) => {
  const stop = branch.pendingStopPoint;
  const [custom, setCustom] = reactExports.useState("");
  const lastChapter = branch.chapters[branch.chapters.length - 1];
  const bgImage = lastChapter?.image;
  const bgMeta = getImageMeta(bgImage);
  if (!stop) return null;
  const submitCustom = () => {
    if (!custom.trim()) return;
    onSubmit({ text: custom.trim() });
    setCustom("");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-screen pb-24", children: [
    bgImage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 -z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: bgImage,
          alt: "",
          className: `h-full w-full ${bgMeta.fit === "contain" ? "object-contain bg-zinc-950" : "object-cover"}`,
          style: { objectPosition: bgMeta.position }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/75 backdrop-blur-sm" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between px-5 pt-10 pb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onBack,
          className: "rounded-full border border-white/20 bg-black/40 p-2.5 text-white backdrop-blur-md",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold uppercase tracking-[0.3em] text-amber-400", children: "Critical Stop Point" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2 text-violet-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-5 w-5 animate-pulse" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold uppercase tracking-widest", children: "Decide" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-black uppercase leading-tight tracking-tight text-white", children: "What Happens Next?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm italic text-white/70", children: stop.prompt }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-white/40", children: "This choice changes the day." }),
      (() => {
        const lower = `${stop.prompt} ${stop.choices.map((c) => c.text).join(" ")}`.toLowerCase();
        const cast = CHARACTERS.filter(
          (c) => new RegExp(`\\b${c.firstName}\\b`, "i").test(lower) || new RegExp(`\\b${c.name}\\b`, "i").test(lower)
        ).slice(0, 5);
        if (cast.length === 0) return null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 p-2.5 backdrop-blur-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest text-white/40", children: "In Scene" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex -space-x-2", children: cast.map((ch) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-7 w-7 overflow-hidden rounded-full border-2 border-zinc-950 ring-1 ring-violet-500/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CharacterAvatar, { character: ch, faceCrop: true }) }, ch.id)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-white/60", children: cast.map((c) => c.firstName).join(" · ") })
        ] });
      })(),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 space-y-3", children: stop.choices.map((c, index) => {
        const tone = TONE_COLORS[c.tone] || TONE_COLORS.Bold;
        const affected = inferAffectedCharacters(c, stop.prompt).slice(0, 3);
        const impact = c.relationshipImpactType;
        const impactMeta = impact ? IMPACT_META$1[impact] : null;
        const Ring = impactMeta?.ring || "ring-violet-400/60";
        const affectedLabel = buildAffectedLabel(affected);
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => onSubmit(c),
            className: `group relative w-full overflow-hidden rounded-2xl border-2 ${tone.border} bg-black/60 p-4 text-left backdrop-blur-md transition-all hover:shadow-xl hover:${tone.glow} active:scale-[0.98] ${selectedChoiceIndex === index ? "ring-4 ring-amber-300/80 shadow-[0_0_28px_rgba(251,191,36,0.45)]" : ""}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${tone.bg} font-display text-lg font-black ${tone.text}`, children: c.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-white leading-snug", children: c.text }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `inline-block rounded-full ${tone.bg} px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${tone.text}`, children: c.tone }),
                  impactMeta && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `inline-flex items-center gap-1 rounded-full border ${impactMeta.chip} px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${impactMeta.text}`, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(impactMeta.Icon, { className: "h-2.5 w-2.5" }),
                    impact
                  ] })
                ] })
              ] }),
              affected.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-shrink-0 flex-col items-end gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex -space-x-2", children: affected.map((ch) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `h-10 w-10 overflow-hidden rounded-full border-2 border-zinc-950 ring-2 ${Ring} shadow-lg`,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(CharacterAvatar, { character: ch, faceCrop: true })
                  },
                  ch.id
                )) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-[7.5rem] text-right text-[9px] font-bold uppercase leading-tight tracking-wider text-white/70", children: affectedLabel })
              ] })
            ] })
          },
          c.label
        );
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-xs font-bold uppercase tracking-widest text-white/50", children: "Or type your own…" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-2xl border border-white/15 bg-black/60 p-2 backdrop-blur-md focus-within:border-violet-500", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: custom,
              onChange: (e) => setCustom(e.target.value),
              onKeyDown: (e) => e.key === "Enter" && submitCustom(),
              placeholder: "Micah grabs Malik's jacket and...",
              className: "flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: submitCustom,
              disabled: !custom.trim(),
              className: "rounded-xl bg-violet-600 p-2.5 text-white shadow-lg shadow-violet-500/40 disabled:bg-white/10 disabled:text-white/30 disabled:shadow-none",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" })
            }
          )
        ] })
      ] })
    ] })
  ] });
};
const STEPS = [
  "Reading your choice…",
  "Weighing the consequences…",
  "Updating relationships…",
  "Writing the next chapter…",
  "Setting the scene…"
];
const AILoadingScreen = () => {
  const [step, setStep] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const i = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 1800);
    return () => clearInterval(i);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex min-h-screen items-center justify-center overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: IMAGES.twinsCover, alt: "", className: "absolute inset-0 h-full w-full object-cover opacity-25" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 px-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-violet-400/40 bg-violet-500/10 shadow-2xl shadow-violet-500/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-10 w-10 animate-spin text-violet-300" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-xs font-bold uppercase tracking-[0.4em] text-amber-400", children: "AI Story Engine" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-2 font-display text-2xl font-black uppercase tracking-tight text-white", children: STEPS[step] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 max-w-xs mx-auto text-sm text-white/50", children: "The next chapter is being written based on the path you chose." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 flex justify-center gap-1.5", children: STEPS.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: `h-1 w-8 rounded-full transition-colors ${i === step ? "bg-violet-400" : "bg-white/15"}`
        },
        i
      )) })
    ] })
  ] });
};
const METER_LABELS = {
  trust_ari: "Ari Trust",
  trust_dante: "Dante Trust",
  trust_malik_to_micah: "Malik → Micah",
  trust_micah_to_malik: "Micah → Malik",
  suspicion_mom: "Mom Suspicion",
  suspicion_coach: "Coach Risk",
  suspicion_valentina: "Valentina",
  risk_level: "Risk Level"
};
const ContinuationScreen = ({ chapterTitle, prose, delta, image, imageFit, imagePosition, onContinue }) => {
  const [visibleChars, setVisibleChars] = reactExports.useState(0);
  const [showDeltas, setShowDeltas] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const totalLen = prose.length;
    const duration = Math.min(8e3, Math.max(2500, totalLen * 8));
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const ratio = Math.min(1, elapsed / duration);
      setVisibleChars(Math.floor(totalLen * ratio));
      if (ratio < 1) requestAnimationFrame(tick);
      else setTimeout(() => setShowDeltas(true), 300);
    };
    requestAnimationFrame(tick);
  }, [prose]);
  const visibleProse = prose.slice(0, visibleChars);
  const paragraphs = visibleProse.split(/\n\n+/);
  const nonZeroDeltas = Object.entries(delta).filter(([, v]) => v && v !== 0);
  const imgMeta = getImageMeta(image);
  const resolvedFit = imageFit || imgMeta.fit;
  const resolvedPosition = imagePosition || imgMeta.position;
  const heroFitClass = resolvedFit === "contain" ? "object-contain bg-zinc-950" : "object-cover";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen pb-24", children: [
    image && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[4/3] min-h-[260px] w-full overflow-hidden bg-zinc-950 sm:aspect-[16/9]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: image,
          alt: chapterTitle,
          className: `absolute inset-0 h-full w-full ${heroFitClass}`,
          style: { objectPosition: resolvedPosition }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-0 left-0 right-0 px-5 pb-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400", children: "New Chapter" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-black leading-tight tracking-tight text-white", children: chapterTitle })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("article", { className: "prose-story mx-auto max-w-2xl px-6 pt-6", children: paragraphs.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-5 font-serif text-[17px] leading-[1.75] text-white/85", children: [
      p,
      i === paragraphs.length - 1 && visibleChars < prose.length && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-violet-400 align-middle" })
    ] }, i)) }),
    showDeltas && nonZeroDeltas.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-5 mt-4 rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-xs font-bold uppercase tracking-widest text-violet-300", children: "State Updates" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: nonZeroDeltas.map(([k, v]) => {
        const val = v;
        const positive = val > 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${positive ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`,
            style: { animation: "pop-in 0.4s ease-out" },
            children: [
              positive ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3 w-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "h-3 w-3" }),
              METER_LABELS[k] || k,
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                positive ? "+" : "",
                val
              ] })
            ]
          },
          k
        );
      }) })
    ] }),
    showDeltas && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 pt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: onContinue,
        className: "flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-4 font-display text-base font-bold uppercase tracking-widest text-white shadow-lg shadow-violet-500/30",
        children: [
          "Continue ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-5 w-5" })
        ]
      }
    ) })
  ] });
};
const loadImage = (src) => new Promise((resolve, reject) => {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = src;
});
const tryLoadImage = async (src) => {
  try {
    return await loadImage(src);
  } catch {
    return null;
  }
};
const wrapText = (ctx, text, maxWidth) => {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
};
async function renderEndingPoster(ending, imageUrl, castIds = []) {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  try {
    const img = await loadImage(imageUrl || IMAGES.twinsCover);
    const ir = img.width / img.height;
    const cr = W / H;
    let dw, dh, dx, dy;
    if (ir > cr) {
      dh = H;
      dw = H * ir;
      dx = (W - dw) / 2;
      dy = 0;
    } else {
      dw = W;
      dh = W / ir;
      dx = 0;
      dy = (H - dh) / 2;
    }
    ctx.drawImage(img, dx, dy, dw, dh);
  } catch {
  }
  const topGrad = ctx.createLinearGradient(0, 0, 0, H * 0.4);
  topGrad.addColorStop(0, "rgba(0,0,0,0.7)");
  topGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, W, H * 0.4);
  const bottomGrad = ctx.createLinearGradient(0, H * 0.35, 0, H);
  bottomGrad.addColorStop(0, "rgba(0,0,0,0)");
  bottomGrad.addColorStop(0.55, "rgba(0,0,0,0.85)");
  bottomGrad.addColorStop(1, "rgba(0,0,0,1)");
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(0, H * 0.35, W, H * 0.65);
  ctx.fillStyle = "#f59e0b";
  const badgeText = "âœ¦ NEW ENDING UNLOCKED";
  ctx.font = "700 32px Inter, system-ui, sans-serif";
  const badgeW = ctx.measureText(badgeText).width + 60;
  const badgeX = (W - badgeW) / 2;
  const badgeY = 110;
  ctx.beginPath();
  if ("roundRect" in ctx && typeof ctx.roundRect === "function") ctx.roundRect(badgeX, badgeY, badgeW, 60, 30);
  else ctx.rect(badgeX, badgeY, badgeW, 60);
  ctx.fill();
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(badgeText, W / 2, badgeY + 32);
  ctx.fillStyle = "#fbbf24";
  ctx.font = "800 28px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SWITCH KICKS", W / 2, H - 580);
  ctx.fillStyle = "#fff";
  ctx.font = '900 140px "Anton Impact", Impact, sans-serif';
  ctx.textBaseline = "top";
  const nameLines = wrapText(ctx, ending.name.toUpperCase(), W - 120);
  let nameY = H - 510;
  ctx.shadowColor = "rgba(0,0,0,0.8)";
  ctx.shadowBlur = 20;
  for (const line of nameLines) {
    ctx.fillText(line, W / 2, nameY);
    nameY += 150;
  }
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = 'italic 400 44px "Crimson Pro", Georgia, serif';
  const taglineLines = wrapText(ctx, ending.tagline, W - 160);
  let tagY = nameY + 50;
  for (const line of taglineLines) {
    ctx.fillText(line, W / 2, tagY);
    tagY += 60;
  }
  const uniqueCastIds = Array.from(new Set(castIds)).slice(0, 5);
  if (uniqueCastIds.length > 0) {
    const avatarSize = 140;
    const gap = 28;
    const stripWidth = uniqueCastIds.length * avatarSize + (uniqueCastIds.length - 1) * gap;
    const stripStartX = (W - stripWidth) / 2;
    const stripY = H - 250;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "800 22px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Â· STARRING Â·", W / 2, stripY - 38);
    for (let i = 0; i < uniqueCastIds.length; i++) {
      const id = uniqueCastIds[i];
      const character = CHARACTERS_BY_ID[id];
      if (!character) continue;
      const cx = stripStartX + i * (avatarSize + gap) + avatarSize / 2;
      const cy = stripY + avatarSize / 2;
      const r = avatarSize / 2;
      let portrait = await tryLoadImage(character.image);
      if (!portrait) portrait = await tryLoadImage(character.fallbackImage);
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      if (portrait) {
        const ir = portrait.width / portrait.height;
        let dw, dh, dx, dy;
        if (ir > 1) {
          dh = avatarSize;
          dw = avatarSize * ir;
          dx = cx - dw / 2;
          dy = cy - dh / 2;
        } else {
          dw = avatarSize;
          dh = avatarSize / ir;
          dx = cx - dw / 2;
          dy = cy - dh / 2 - dh * 0.1;
        }
        ctx.drawImage(portrait, dx, dy, dw, dh);
      } else {
        ctx.fillStyle = "#1f1f23";
        ctx.fillRect(cx - r, cy - r, avatarSize, avatarSize);
        ctx.fillStyle = "#fbbf24";
        ctx.font = "900 56px Inter, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(character.firstName[0], cx, cy);
      }
      ctx.restore();
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cx, cy, r - 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = "800 20px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(character.firstName.toUpperCase(), cx, cy + r + 12);
    }
  }
  const logo = await tryLoadImage(
    "https://d64gsuwffb70l.cloudfront.net/6a060641815889c4c7c610fd_1778783806509_ab6fb4ed.png"
  );
  if (logo) {
    const logoH = 78;
    const ratio = logo.width / logo.height;
    const logoW = logoH * ratio;
    ctx.drawImage(logo, (W - logoW) / 2, H - 110, logoW, logoH);
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "700 24px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("TREY TV  â€¢  STORY BY TREY TRIZZY", W / 2, H - 60);
  }
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to render poster"));
    }, "image/png", 0.95);
  });
}
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1e3);
}
function pickCastFromBranch(branch, limit = 5) {
  if (!branch) return ["malik-carter", "micah-carter"];
  const counts = {};
  const allIds = Object.keys(CHARACTERS_BY_ID);
  for (const id of allIds) counts[id] = 0;
  for (const ch of branch.chapters) {
    const blob = `${ch.title || ""} ${ch.summary || ""} ${ch.choiceMade?.text || ""} ${ch.prose || ""}`.toLowerCase();
    for (const id of allIds) {
      const c = CHARACTERS_BY_ID[id];
      if (new RegExp(`\\b${c.firstName}\\b`, "i").test(blob) || new RegExp(`\\b${c.name}\\b`, "i").test(blob)) {
        counts[id] += 1;
      }
    }
  }
  const ranked = allIds.sort((a, b) => counts[b] - counts[a]);
  const top = ranked.filter((id) => counts[id] > 0).slice(0, limit);
  if (!top.includes("malik-carter")) top.unshift("malik-carter");
  if (!top.includes("micah-carter")) top.splice(1, 0, "micah-carter");
  return top.slice(0, limit);
}
const TONE_TO_IMPACT = {
  Risky: "Tension",
  Safe: "Trust",
  Romantic: "Bond",
  Funny: "Loyalty",
  Bold: "Pressure"
};
function pickDominantImpactFromBranch(branch) {
  if (!branch || branch.chapters.length === 0) return null;
  const impactCounts = {
    Trust: 0,
    Tension: 0,
    Loyalty: 0,
    Respect: 0,
    Pressure: 0,
    Distance: 0,
    Bond: 0,
    Rivalry: 0
  };
  for (const ch of branch.chapters) {
    if (ch.toneTag) {
      const mapped = TONE_TO_IMPACT[ch.toneTag];
      if (mapped) impactCounts[mapped] += 2;
    }
    if (ch.choiceMade?.tone) {
      const mapped = TONE_TO_IMPACT[ch.choiceMade.tone];
      if (mapped) impactCounts[mapped] += 1;
    }
  }
  const cast = pickCastFromBranch(branch, 4);
  const top3 = new Set(cast.slice(0, 3));
  if (top3.has("coach-bridges")) impactCounts.Respect += 2;
  if (top3.has("compliance-officer")) impactCounts.Pressure += 2;
  if (top3.has("ms-valentina")) impactCounts.Pressure += 1;
  if (top3.has("ari")) impactCounts.Bond += 2;
  if (top3.has("reggie")) impactCounts.Loyalty += 1;
  if (top3.has("dante-reeves")) impactCounts.Rivalry += 1;
  if (top3.has("denise-carter")) impactCounts.Tension += 1;
  const order = [
    "Bond",
    "Tension",
    "Pressure",
    "Trust",
    "Loyalty",
    "Respect",
    "Rivalry",
    "Distance"
  ];
  let winner = "Trust";
  let best = -1;
  for (const k of order) {
    if (impactCounts[k] > best) {
      best = impactCounts[k];
      winner = k;
    }
  }
  return best > 0 ? winner : null;
}
const IMPACT_META = {
  Trust: { Icon: Shield, chip: "bg-cyan-500/15 border-cyan-500/40", text: "text-cyan-300", ring: "ring-cyan-400/60", glow: "shadow-cyan-500/20" },
  Tension: { Icon: Flame, chip: "bg-orange-500/15 border-orange-500/40", text: "text-orange-300", ring: "ring-orange-400/60", glow: "shadow-orange-500/20" },
  Loyalty: { Icon: Link2, chip: "bg-amber-500/15 border-amber-500/40", text: "text-amber-300", ring: "ring-amber-400/60", glow: "shadow-amber-500/20" },
  Respect: { Icon: Crown, chip: "bg-violet-500/15 border-violet-500/40", text: "text-violet-300", ring: "ring-violet-400/60", glow: "shadow-violet-500/20" },
  Pressure: { Icon: TriangleAlert, chip: "bg-red-500/15 border-red-500/40", text: "text-red-300", ring: "ring-red-400/60", glow: "shadow-red-500/20" },
  Distance: { Icon: Wind, chip: "bg-zinc-500/15 border-zinc-500/40", text: "text-zinc-300", ring: "ring-zinc-300/60", glow: "shadow-zinc-500/20" },
  Bond: { Icon: Heart, chip: "bg-pink-500/15 border-pink-500/40", text: "text-pink-300", ring: "ring-pink-400/60", glow: "shadow-pink-500/20" },
  Rivalry: { Icon: Swords, chip: "bg-fuchsia-500/15 border-fuchsia-500/40", text: "text-fuchsia-300", ring: "ring-fuchsia-400/60", glow: "shadow-fuchsia-500/20" }
};
const IMPACT_FLAVOR = {
  Trust: "Trust Rising",
  Tension: "Tension Building",
  Loyalty: "Loyalty Tested",
  Respect: "Respect Gained",
  Pressure: "Pressure Rising",
  Distance: "Distance Growing",
  Bond: "Bond Strengthened",
  Rivalry: "Rivalry Heating Up"
};
const BranchMapScreen = ({ branches, activeBranchId, onOpenBranch, onNewBranch, onDelete }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen px-5 pt-10 pb-24", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-violet-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(GitBranch, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold uppercase tracking-[0.25em]", children: "Your Paths" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 font-display text-4xl font-black text-white", children: "Branches" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-white/60", children: "Each branch is a different version of the story." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: onNewBranch,
        className: "mb-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-violet-400/40 bg-violet-500/5 py-4 font-bold text-violet-300 hover:bg-violet-500/10",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-5 w-5" }),
          " Start New Branch"
        ]
      }
    ),
    branches.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(GitBranch, { className: "mx-auto mb-3 h-10 w-10 text-white/30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/60", children: "No branches yet. Start the story to create your first one." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-5", children: branches.map((b, idx) => {
      const isActive = b.id === activeBranchId;
      const cast = pickCastFromBranch(b, 3).slice(0, 3);
      const dominantImpact = pickDominantImpactFromBranch(b);
      const impactMeta = dominantImpact ? IMPACT_META[dominantImpact] : null;
      const avatarRing = impactMeta?.ring ?? "ring-violet-400/40";
      const tileGlow = impactMeta?.glow ?? "";
      const castNames = cast.map((id) => CHARACTERS_BY_ID[id]?.firstName).filter(Boolean).join(" · ");
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `relative rounded-2xl border ${isActive ? "border-violet-400/50 shadow-lg shadow-violet-500/20" : "border-white/10"} bg-gradient-to-br from-zinc-900/80 to-black p-4 ${tileGlow ? `shadow-lg ${tileGlow}` : ""}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold uppercase tracking-widest text-amber-400", children: [
                    "Branch ",
                    branches.length - idx
                  ] }),
                  isActive && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-violet-300", children: "Active" }),
                  b.isComplete && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-300", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }),
                    " Complete"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 truncate font-display text-lg font-bold text-white", children: b.ending?.name || `Chapter ${b.chapters.length}` })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: (e) => {
                    e.stopPropagation();
                    if (confirm("Delete this branch?")) onDelete(b.id);
                  },
                  className: "rounded-full p-2 text-white/40 hover:bg-red-500/10 hover:text-red-400",
                  "aria-label": "Delete branch",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
                }
              )
            ] }),
            (cast.length > 0 || impactMeta) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-md", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-3", children: [
                cast.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex -space-x-2", children: cast.map((id) => {
                  const ch = CHARACTERS_BY_ID[id];
                  if (!ch) return null;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: `h-9 w-9 overflow-hidden rounded-full border-2 border-zinc-950 ring-2 ${avatarRing} shadow-md`,
                      title: ch.name,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(CharacterAvatar, { character: ch, faceCrop: true })
                    },
                    id
                  );
                }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] font-bold uppercase tracking-[0.18em] text-white/40", children: "Starring" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-xs font-semibold text-white/85", children: castNames || "—" })
                ] })
              ] }),
              impactMeta && dominantImpact && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-shrink-0 flex-col items-end gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: `inline-flex items-center gap-1 rounded-full border ${impactMeta.chip} px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${impactMeta.text}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(impactMeta.Icon, { className: "h-2.5 w-2.5" }),
                      dominantImpact
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-[9px] font-semibold uppercase tracking-wider opacity-80 ${impactMeta.text}`, children: IMPACT_FLAVOR[dominantImpact] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "my-4 space-y-2", children: [
              b.chapters.map((ch, i) => {
                const isLast = i === b.chapters.length - 1;
                const tone = ch.toneTag ? TONE_COLORS[ch.toneTag] : null;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-col items-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: `h-4 w-4 rounded-full border-2 ${isLast && !b.isComplete ? "border-violet-400 bg-violet-500 shadow-lg shadow-violet-500/60 animate-pulse" : tone ? `${tone.border} ${tone.bg}` : "border-emerald-400 bg-emerald-500"}`
                      }
                    ),
                    i < b.chapters.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "my-1 h-6 w-0.5 bg-white/15" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 -mt-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-medium text-white/90 line-clamp-1", children: [
                      "Ch ",
                      ch.number,
                      " • ",
                      ch.title.replace(/^Chapter \d+\s*[—-]\s*/, "")
                    ] }),
                    ch.toneTag && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `mt-0.5 inline-block rounded-full ${tone.bg} px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${tone.text}`, children: ch.toneTag })
                  ] })
                ] }, i);
              }),
              !b.isComplete && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 opacity-40", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-4 rounded-full border-2 border-dashed border-white/30" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm italic text-white/40", children: "Unwritten…" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => onOpenBranch(b),
                className: "flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 text-sm font-bold text-white hover:bg-white/15",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4" }),
                  b.isComplete ? "View Ending" : "Continue Branch"
                ]
              }
            )
          ]
        },
        b.id
      );
    }) })
  ] });
};
const relationshipKeyForCharacterId = (characterId) => {
  const key = characterId.toLowerCase();
  if (key.includes("malik")) return "malik";
  if (key.includes("micah")) return "micah";
  if (key.includes("ari")) return "ari";
  if (key.includes("dante")) return "dante";
  if (key.includes("denise") || key.includes("mom") || key.includes("mother")) return "mom";
  if (key.includes("coach") || key.includes("bridges")) return "coach";
  if (key.includes("valentina")) return "valentina";
  if (key.includes("reggie")) return "reggie";
  if (key.includes("compliance") || key.includes("officer")) return "compliance";
  return characterId;
};
const firstNameOf = (name) => name.split(/\s+/)[0]?.replace(/["“”]/g, "") || name;
const getCharactersForBranch = (branch) => {
  const installed = branch?.flags?.installed_story ? getInstalledStoryPackage(branch.storyId) : null;
  if (installed?.characters?.length) {
    return installed.characters.map((c) => ({
      id: c.character_id.replace(/_/g, "-"),
      mapKey: c.character_id,
      relationshipKey: relationshipKeyForCharacterId(c.character_id),
      name: c.display_name,
      firstName: firstNameOf(c.display_name),
      role: c.role,
      canon: "installed",
      image: c.portrait || "/placeholder.svg",
      fallbackImage: c.portrait || "/placeholder.svg",
      discipline: 70,
      emotionalIQ: 70,
      secrets: 0,
      description: c.short_description || `${c.display_name} is part of this installed interactive story.`,
      quote: c.voice_key ? `Voice key: ${c.voice_key}` : "Installed story character."
    }));
  }
  return CHARACTERS;
};
const STATUS_STYLE = {
  "Trust Rising": { ring: "ring-cyan-400/60", chip: "bg-cyan-500/15 border-cyan-500/40", text: "text-cyan-300" },
  "Loyalty Tested": { ring: "ring-amber-400/60", chip: "bg-amber-500/15 border-amber-500/40", text: "text-amber-300" },
  "Tension Building": { ring: "ring-orange-400/60", chip: "bg-orange-500/15 border-orange-500/40", text: "text-orange-300" },
  "Respect Gained": { ring: "ring-violet-400/60", chip: "bg-violet-500/15 border-violet-500/40", text: "text-violet-300" },
  "Distance Growing": { ring: "ring-zinc-300/50", chip: "bg-zinc-500/15 border-zinc-500/40", text: "text-zinc-300" },
  "Pressure Rising": { ring: "ring-red-400/60", chip: "bg-red-500/15 border-red-500/40", text: "text-red-300" },
  "Bond Strengthened": { ring: "ring-pink-400/60", chip: "bg-pink-500/15 border-pink-500/40", text: "text-pink-300" },
  "Rivalry Heating Up": { ring: "ring-fuchsia-400/60", chip: "bg-fuchsia-500/15 border-fuchsia-500/40", text: "text-fuchsia-300" },
  "Mentor Trust": { ring: "ring-emerald-400/60", chip: "bg-emerald-500/15 border-emerald-500/40", text: "text-emerald-300" },
  "Family Strain": { ring: "ring-rose-400/60", chip: "bg-rose-500/15 border-rose-500/40", text: "text-rose-300" },
  "Steady": { ring: "ring-white/15", chip: "bg-white/10 border-white/15", text: "text-white/70" }
};
const statusForCharacter = (key, value) => {
  if (key === "mom") return value < 60 ? "Family Strain" : "Steady";
  if (key === "coach") return value < 60 ? "Pressure Rising" : "Mentor Trust";
  if (key === "valentina") return value < 60 ? "Pressure Rising" : "Mentor Trust";
  if (key === "compliance") return value < 60 ? "Pressure Rising" : "Steady";
  if (key === "reggie") {
    if (value >= 70) return "Bond Strengthened";
    if (value <= 40) return "Rivalry Heating Up";
    return "Loyalty Tested";
  }
  if (key === "ari" || key === "dante") {
    if (value >= 75) return "Bond Strengthened";
    if (value >= 55) return "Trust Rising";
    if (value >= 35) return "Distance Growing";
    return "Tension Building";
  }
  if (key === "malik" || key === "micah") {
    if (value >= 80) return "Bond Strengthened";
    if (value >= 60) return "Loyalty Tested";
    return "Distance Growing";
  }
  return "Steady";
};
const relationshipFor = (key, branch) => {
  if (!branch) return null;
  const m = branch.meters;
  switch (key) {
    case "ari":
      return { label: "Trust Toward You", value: m.trust_ari, status: statusForCharacter("ari", m.trust_ari), meterColor: "pink" };
    case "dante":
      return { label: "Trust Toward You", value: m.trust_dante, status: statusForCharacter("dante", m.trust_dante), meterColor: "violet" };
    case "malik":
      return { label: "Trust in Micah", value: m.trust_malik_to_micah, status: statusForCharacter("malik", m.trust_malik_to_micah), meterColor: "emerald" };
    case "micah":
      return { label: "Trust in Malik", value: m.trust_micah_to_malik, status: statusForCharacter("micah", m.trust_micah_to_malik), meterColor: "emerald" };
    case "mom": {
      const v = 100 - m.suspicion_mom;
      return { label: "Calm (vs Suspicion)", value: v, status: statusForCharacter("mom", v), meterColor: "amber" };
    }
    case "coach": {
      const v = 100 - m.suspicion_coach;
      return { label: "Coach Trust", value: v, status: statusForCharacter("coach", v), meterColor: "amber" };
    }
    case "valentina": {
      const v = 100 - m.suspicion_valentina;
      return { label: "Valentina Trust", value: v, status: statusForCharacter("valentina", v), meterColor: "amber" };
    }
    case "reggie": {
      const v = Math.max(0, Math.round(m.trust_micah_to_malik * 0.6 + (100 - m.risk_level) * 0.4));
      return { label: "Friendship (vs Suspicion)", value: v, status: statusForCharacter("reggie", v), meterColor: "violet" };
    }
    case "compliance": {
      const v = 100 - Math.max(m.suspicion_mom, m.suspicion_coach);
      return { label: "Standing at School", value: v, status: statusForCharacter("compliance", v), meterColor: "amber" };
    }
    default:
      return null;
  }
};
const lastChapterMentioning = (character, chapters) => {
  for (let i = chapters.length - 1; i >= 0; i--) {
    const ch = chapters[i];
    const blob = `${ch.title || ""} ${ch.summary || ""} ${ch.choiceMade?.text || ""}`.toLowerCase();
    if (new RegExp(`\\b${character.firstName}\\b`, "i").test(blob)) return ch;
    if (new RegExp(`\\b${character.name}\\b`, "i").test(blob)) return ch;
  }
  return null;
};
const CharactersScreen = ({ branch }) => {
  const [selected, setSelected] = reactExports.useState(null);
  const enriched = reactExports.useMemo(
    () => getCharactersForBranch(branch).map((c) => ({
      character: c,
      rel: relationshipFor(c.relationshipKey, branch),
      lastChapter: branch ? lastChapterMentioning(c, branch.chapters) : null
    })),
    [branch]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen px-5 pt-10 pb-24", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-violet-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold uppercase tracking-[0.25em]", children: "Relationship Tracker" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 font-display text-4xl font-black text-white", children: "Cast & Connections" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-white/60", children: "How your choices are landing with the people around you." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3", children: enriched.map(({ character: c, rel, lastChapter }) => {
      const status = rel?.status || "Steady";
      const style = STATUS_STYLE[status];
      const trend = rel ? rel.value >= 60 ? "up" : rel.value <= 40 ? "down" : "flat" : "flat";
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setSelected(c),
          className: `group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/80 to-black/90 p-3 text-left shadow-lg backdrop-blur-md transition-transform hover:border-white/20 active:scale-[0.98]`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border border-white/10 ring-2 ${style.ring} shadow-inner`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CharacterAvatar, { character: c, faceCrop: true }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-base font-bold leading-tight text-white truncate", children: c.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-widest text-amber-400", children: c.role }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `mt-1.5 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${style.chip} ${style.text}`, children: [
                  trend === "up" && /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-2.5 w-2.5" }),
                  trend === "down" && /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "h-2.5 w-2.5" }),
                  trend === "flat" && /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-2.5 w-2.5" }),
                  status
                ] }),
                rel && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MeterBar, { label: rel.label, value: rel.value, color: rel.meterColor, compact: true }) })
              ] })
            ] }),
            lastChapter && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2.5 flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-2 py-1.5 text-[10px] text-white/55", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3 text-white/40" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", children: [
                "Last changed: Ch. ",
                lastChapter.number,
                " — ",
                lastChapter.title
              ] })
            ] })
          ]
        },
        c.id
      );
    }) }),
    selected && /* @__PURE__ */ jsxRuntimeExports.jsx(
      CharacterPathModal,
      {
        character: selected,
        rel: relationshipFor(selected.relationshipKey, branch),
        branch,
        onClose: () => setSelected(null)
      }
    )
  ] });
};
const CharacterPathModal = ({ character, rel, branch, onClose }) => {
  const history = reactExports.useMemo(() => {
    if (!branch) return [];
    return branch.chapters.map((ch) => {
      const blob = `${ch.title || ""} ${ch.summary || ""} ${ch.choiceMade?.text || ""}`;
      const mentioned = new RegExp(`\\b${character.firstName}\\b`, "i").test(blob) || new RegExp(`\\b${character.name}\\b`, "i").test(blob);
      return mentioned ? ch : null;
    }).filter(Boolean);
  }, [branch, character]);
  const status = rel?.status || "Steady";
  const style = STATUS_STYLE[status];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center",
      onClick: onClose,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "relative w-full max-w-md overflow-hidden rounded-t-3xl border-t border-violet-500/30 bg-zinc-950 sm:rounded-3xl sm:border",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[4/5] w-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CharacterAvatar, { character }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: onClose,
                  className: "absolute right-3 top-3 rounded-full border border-white/20 bg-black/40 p-2 text-white backdrop-blur-md",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400", children: character.role }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-3xl font-black text-white", children: character.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${style.chip} ${style.text}`, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3" }),
                  status
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 p-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-serif text-sm leading-relaxed text-white/80", children: character.description }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-xl border-l-4 border-violet-500 bg-violet-500/5 p-3 font-serif text-sm italic text-white/70", children: character.quote }),
              rel && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/50", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Relationship Meter" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: style.text, children: rel.value })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MeterBar, { label: rel.label, value: rel.value, color: rel.meterColor })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MeterBar, { label: "Discipline", value: character.discipline, color: "violet" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MeterBar, { label: "Emotional IQ", value: character.emotionalIQ, color: "pink" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 text-white/80", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-4 w-4 text-amber-400" }),
                    "Secrets"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-white", children: character.secrets })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/50", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-3 w-3 text-pink-400" }),
                  "Their Path With You"
                ] }),
                history.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/50", children: [
                  "You haven't crossed paths with ",
                  character.firstName,
                  " in a saved chapter yet."
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "space-y-2", children: history.map((ch) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "li",
                  {
                    className: "rounded-xl border border-white/10 bg-gradient-to-r from-white/5 to-transparent p-3",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-bold uppercase tracking-widest text-amber-400/80", children: [
                          "Ch. ",
                          ch.number
                        ] }),
                        ch.toneTag && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-widest text-white/40", children: ch.toneTag })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 font-display text-sm font-bold text-white", children: ch.title }),
                      ch.summary && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-xs italic text-white/60 line-clamp-3", children: ch.summary }),
                      ch.choiceMade && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 text-[10px] text-white/40", children: [
                        "Your choice: ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/70", children: ch.choiceMade.text })
                      ] })
                    ]
                  },
                  ch.number
                )) })
              ] })
            ] })
          ]
        }
      )
    }
  );
};
const LOCKED_HINTS = [
  { label: "The Truth Costs Everything", hint: "Confess to everyone before noon." },
  { label: "Brothers Above All", hint: "Choose loyalty over the showcase." },
  { label: "A Quiet Reveal", hint: "Let only one person know." },
  { label: "The Adjudication Twist", hint: "Dance for Micah and mean it." },
  { label: "Coach Sees Through You", hint: "Get caught at practice." },
  { label: "Mom Always Knew", hint: "Come home before the sun sets." }
];
const EndingsScreen = ({ endings }) => {
  const [tab, setTab] = reactExports.useState(endings.length > 0 ? "completed" : "locked");
  const [openEnding, setOpenEnding] = reactExports.useState(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen px-5 pt-10 pb-24", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-amber-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold uppercase tracking-[0.25em]", children: "Collection" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 font-display text-4xl font-black text-white", children: "Endings" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5 inline-flex rounded-full border border-white/10 bg-white/5 p-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setTab("completed"),
          className: `rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest ${tab === "completed" ? "bg-violet-600 text-white" : "text-white/60"}`,
          children: [
            "Completed (",
            endings.length,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setTab("locked"),
          className: `rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest ${tab === "locked" ? "bg-violet-600 text-white" : "text-white/60"}`,
          children: "Locked"
        }
      )
    ] }),
    tab === "completed" ? endings.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "mx-auto mb-3 h-10 w-10 text-white/30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/60", children: "Finish a branch to unlock your first ending poster." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: endings.map((e, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => setOpenEnding(e),
        className: "group relative aspect-[3/4] overflow-hidden rounded-2xl border border-amber-500/30 text-left",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: IMAGES.twinsCover, alt: e.name, className: "absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-3 left-3 rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-black", children: "Unlocked" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-base font-black leading-tight text-white", children: e.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-[11px] italic text-white/70 line-clamp-2", children: e.tagline })
          ] })
        ]
      },
      i
    )) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: LOCKED_HINTS.map((h, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-10 w-10 text-white/15" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-sm font-bold text-white/40", children: "???" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 text-[11px] italic text-white/30 line-clamp-2", children: [
          "Hint: ",
          h.hint
        ] })
      ] })
    ] }, i)) }),
    openEnding && /* @__PURE__ */ jsxRuntimeExports.jsx(EndingPoster, { ending: openEnding, onClose: () => setOpenEnding(null) })
  ] });
};
const EndingPoster = ({ ending, onClose }) => {
  const handleShare = async () => {
    const text = `I just unlocked "${ending.name}" on Switch Kicks — ${ending.tagline}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Switch Kicks", text });
      } catch {
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
      } catch {
      }
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "relative w-full max-w-sm overflow-hidden rounded-3xl border border-amber-500/40 bg-black shadow-2xl shadow-amber-500/20",
      onClick: (e) => e.stopPropagation(),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[9/16] w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: IMAGES.twinsCover, alt: ending.name, className: "absolute inset-0 h-full w-full object-cover" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-5 left-5 right-5 flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-full bg-amber-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-black", children: "New Ending Unlocked" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-6 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold uppercase tracking-[0.4em] text-amber-400", children: "Switch Kicks" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-3 font-display text-4xl font-black uppercase leading-none tracking-tight text-white", children: ending.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 font-serif text-base italic leading-snug text-white/90", children: ending.tagline }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TreyTVLogo, { size: 24 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-[10px] uppercase tracking-widest text-white/40", children: "An Interactive Story" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 bg-zinc-950 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "flex-1 rounded-xl bg-white/10 py-2.5 text-sm font-bold text-white hover:bg-white/15", children: "Close" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleShare, className: "flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-black hover:bg-amber-400", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-4 w-4" }),
            " Share"
          ] })
        ] })
      ]
    }
  ) });
};
const SettingsScreen = ({ onResetAll, onOpenReread, hasActiveBranch }) => {
  const [email, setEmail] = reactExports.useState("");
  const [status, setStatus] = reactExports.useState("idle");
  const { user, signOut, isGuest } = useAuth$1();
  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await fetch("https://famous.ai/api/crm/6a06024d0a5bc44cc4e4a2bd/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          source: "switch-kicks-newsletter",
          tags: ["newsletter", "switch-kicks", "trey-tv"]
        })
      });
      setStatus("sent");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen px-5 pt-10 pb-24", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-violet-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold uppercase tracking-[0.25em]", children: "Preferences" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 font-display text-4xl font-black text-white", children: "Settings" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TreyTVLogo, { size: 32 })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-xs font-bold uppercase tracking-widest text-white/50", children: "Account" }),
      user ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-black text-white", children: (user.name || user.handle || "U")[0].toUpperCase() }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-sm font-bold text-white", children: user.name || "Trey TV reader" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-white/50", children: [
              "@",
              user.handle
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: signOut,
            className: "mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-white/80 hover:bg-white/10",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-3.5 w-3.5" }),
              " Sign Out"
            ]
          }
        )
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => {
          },
          className: "flex w-full items-center justify-between rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10 p-4 text-left",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-violet-300", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold uppercase tracking-widest", children: isGuest ? "Playing as Guest" : "Sign in to save" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 font-display text-base font-bold text-white", children: "Sync your story across devices" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-white/55", children: "Keep every branch, choice, and ending safe in your Trey TV account." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-full bg-violet-600 p-2.5 text-white shadow-lg shadow-violet-500/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "h-4 w-4" }) })
          ]
        }
      )
    ] }),
    onOpenReread && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-xs font-bold uppercase tracking-widest text-white/50", children: "Your Story" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: onOpenReread,
          disabled: !hasActiveBranch,
          className: "flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-colors hover:bg-white/10 disabled:opacity-40",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 text-white", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "h-4 w-4 text-violet-400" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Re-read Chapters" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-white/40", children: hasActiveBranch ? "View archive" : "No branch yet" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-6 rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-violet-300", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold uppercase tracking-widest", children: "Stay In The Loop" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-1 font-display text-xl font-bold text-white", children: "Get new stories first" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-white/60", children: "We're cooking up more interactive worlds for Trey TV. Drop your email." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "mt-4 flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "email",
            required: true,
            value: email,
            onChange: (e) => setEmail(e.target.value),
            placeholder: "you@treytv.com",
            className: "flex-1 rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-violet-500 focus:outline-none"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/30", children: "Subscribe" })
      ] }),
      status === "sent" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-emerald-400", children: "You're on the list." }),
      status === "error" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-red-400", children: "Something went wrong. Try again." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-6 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-xs font-bold uppercase tracking-widest text-white/50", children: "About" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-white/5 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-white", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-4 w-4 text-violet-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Switch Kicks v1.0" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-white/60", children: "Story by Trey Trizzy. Built for Trey TV. Powered by AI — every chapter is generated based on your choices." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          href: "https://treytv.com",
          target: "_blank",
          rel: "noopener noreferrer",
          className: "flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white hover:bg-white/10",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-4 w-4 text-pink-400" }),
              " Visit Trey TV"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4 text-white/40" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-xs font-bold uppercase tracking-widest text-white/50", children: "Danger Zone" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => {
            if (confirm("Delete ALL branches and endings? This cannot be undone.")) onResetAll();
          },
          className: "flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-3 text-sm font-bold text-red-300 hover:bg-red-500/20",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }),
            " Reset All Progress"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-8 text-center text-xs text-white/30", children: "Made with intention. Stories you don't just read — you live." })
  ] });
};
const EndingScreen = ({ ending, branch, onNewBranch, onLibrary, onReread }) => {
  const [busy, setBusy] = reactExports.useState(null);
  const [feedback, setFeedback] = reactExports.useState(null);
  const [previewUrl, setPreviewUrl] = reactExports.useState(null);
  const blobRef = reactExports.useRef(null);
  const castIds = reactExports.useMemo(() => pickCastFromBranch(branch ?? null), [branch]);
  const heroImage = branch?.chapters[branch.chapters.length - 1]?.image || IMAGES.twinsCover;
  reactExports.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const blob = await renderEndingPoster(ending, heroImage, castIds);
        if (cancelled) return;
        blobRef.current = blob;
        setPreviewUrl(URL.createObjectURL(blob));
      } catch (e) {
        console.warn("Poster render failed:", e);
      }
    })();
    return () => {
      cancelled = true;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [ending.name, heroImage, castIds.join("|")]);
  const ensureBlob = async () => {
    if (blobRef.current) return blobRef.current;
    const blob = await renderEndingPoster(ending, heroImage, castIds);
    blobRef.current = blob;
    return blob;
  };
  const doShare = async () => {
    setFeedback(null);
    setBusy("share");
    try {
      const blob = await ensureBlob();
      const file = new File([blob], `switch-kicks-${ending.name.replace(/\s+/g, "-").toLowerCase()}.png`, {
        type: "image/png"
      });
      const shareData = {
        title: "Switch Kicks",
        text: `I just unlocked "${ending.name}" on Switch Kicks — ${ending.tagline}`,
        files: [file]
      };
      const canShareFiles = "canShare" in navigator && typeof navigator.canShare === "function" ? navigator.canShare(shareData) : true;
      if (navigator.share && canShareFiles) {
        await navigator.share(shareData);
        setFeedback("Shared!");
      } else if (navigator.share) {
        await navigator.share({ title: shareData.title, text: shareData.text });
        setFeedback("Shared!");
      } else {
        downloadBlob(blob, file.name);
        setFeedback("Image downloaded — share it anywhere.");
      }
    } catch (e) {
      if (e?.name !== "AbortError") {
        setFeedback("Couldn't open share sheet. Try downloading instead.");
      }
    } finally {
      setBusy(null);
    }
  };
  const doDownload = async () => {
    setFeedback(null);
    setBusy("download");
    try {
      const blob = await ensureBlob();
      downloadBlob(blob, `switch-kicks-${ending.name.replace(/\s+/g, "-").toLowerCase()}.png`);
      setFeedback("Saved 1080Ã—1920 poster.");
    } catch {
      setFeedback("Couldn't generate poster. Try again.");
    } finally {
      setBusy(null);
    }
  };
  const handleShare = () => doShare();
  const handleDownload = () => doDownload();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen px-4 pt-8 pb-24", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative mx-auto max-w-sm overflow-hidden rounded-3xl border border-amber-500/40 shadow-2xl shadow-amber-500/20", children: previewUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: previewUrl, alt: ending.name, className: "block w-full" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[9/16] w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: heroImage, alt: ending.name, className: "absolute inset-0 h-full w-full object-cover" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-5 left-5 right-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-black shadow-lg shadow-amber-500/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3" }),
        " New Ending Unlocked"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-6 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold uppercase tracking-[0.4em] text-amber-400", children: "Switch Kicks" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 font-display text-5xl font-black uppercase leading-none tracking-tight text-white drop-shadow-2xl", children: ending.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 font-serif text-base italic leading-snug text-white/90", children: ending.tagline }),
        castIds.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex flex-col items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] font-bold uppercase tracking-[0.4em] text-white/50", children: "· Starring ·" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex -space-x-3", children: castIds.slice(0, 5).map((id) => {
            const c = CHARACTERS_BY_ID[id];
            if (!c) return null;
            return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 overflow-hidden rounded-full border-2 border-black ring-2 ring-amber-400/70", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CharacterAvatar, { character: c, faceCrop: true }) }, id);
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TreyTVLogo, { size: 28 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-[10px] uppercase tracking-widest text-white/40", children: "Story by Trey Trizzy" })
      ] })
    ] }) }),
    feedback && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mt-4 max-w-sm rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-center text-xs font-bold text-emerald-300", children: feedback }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto mt-6 max-w-sm space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: handleShare,
            disabled: busy !== null,
            className: "flex items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 font-display text-xs font-bold uppercase tracking-widest text-black shadow-lg shadow-amber-500/30 disabled:opacity-60",
            children: [
              busy === "share" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-4 w-4" }),
              "Share"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: handleDownload,
            disabled: busy !== null,
            className: "flex items-center justify-center gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/10 py-3.5 font-display text-xs font-bold uppercase tracking-widest text-amber-300 disabled:opacity-60",
            children: [
              busy === "download" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
              "Save PNG"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/10 bg-white/5 p-3 text-center text-[11px] text-white/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Image$1, { className: "mr-1 inline h-3 w-3" }),
        "1080 Ã— 1920 — optimized for Instagram Stories"
      ] }),
      onReread && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: onReread,
          className: "flex w-full items-center justify-center gap-2 rounded-2xl border border-violet-500/30 bg-violet-500/10 py-3.5 font-display text-sm font-bold uppercase tracking-widest text-violet-200",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "h-4 w-4" }),
            " Re-read This Branch"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: onNewBranch,
          className: "flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 font-display text-sm font-bold uppercase tracking-widest text-white",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }),
            " Start New Branch"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: onLibrary,
          className: "flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-3.5 font-display text-sm font-bold uppercase tracking-widest text-white",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "h-4 w-4" }),
            " Back to Library"
          ]
        }
      )
    ] })
  ] });
};
const ArchiveImage = ({ image, alt }) => {
  const meta = getImageMeta(image);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "img",
    {
      src: image,
      alt,
      className: `absolute inset-0 h-full w-full ${meta.fit === "contain" ? "object-contain bg-zinc-950" : "object-cover"}`,
      style: { objectPosition: meta.position },
      draggable: false
    }
  );
};
const detectCharacters = (text) => {
  if (!text) return [];
  const lower = text.toLowerCase();
  const found = [];
  CHARACTERS.forEach((c) => {
    const tokens = [c.firstName, c.name].filter(Boolean);
    if (tokens.some((t) => lower.includes(t.toLowerCase())) && !found.includes(c)) {
      found.push(c);
    }
  });
  return found.slice(0, 5);
};
const ChapterArchiveScreen = ({ branch, onBack, onJumpToCurrent }) => {
  const [selected, setSelected] = reactExports.useState(null);
  if (selected) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ChapterReader, { chapter: selected, branch, onBack: () => setSelected(null), onJumpToCurrent });
  }
  const chapters = branch.chapters;
  const currentNumber = chapters[chapters.length - 1]?.number || 1;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen pb-32", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-20 border-b border-white/5 bg-black/70 px-5 pb-4 pt-10 backdrop-blur-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: onBack,
            className: "flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/80",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-3.5 w-3.5" }),
              " Back"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: onJumpToCurrent,
            className: "rounded-full bg-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-violet-500/30",
            children: "Continue Story →"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-2 text-violet-300", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold uppercase tracking-[0.25em]", children: "Re-read Chapters" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 font-display text-3xl font-black tracking-tight text-white", children: "Your Story Path" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-white/50", children: [
        chapters.length,
        " chapter",
        chapters.length === 1 ? "" : "s",
        " on this branch • ",
        branch.isComplete ? "Complete" : "In Progress"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 pt-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-2 left-[18px] top-2 w-px bg-gradient-to-b from-violet-500/50 via-violet-500/20 to-transparent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        chapters.map((c, i) => {
          const isCurrent = c.number === currentNumber && !branch.isComplete;
          const tone = c.toneTag || c.choiceMade?.tone;
          const toneStyle = tone ? TONE_COLORS[tone] : null;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setSelected(c),
              className: "group relative block w-full text-left",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `absolute left-0 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-black ${isCurrent ? "border-violet-400 bg-violet-600 text-white shadow-lg shadow-violet-500/50" : "border-emerald-500/60 bg-emerald-600/30 text-emerald-200"}`,
                    children: c.number
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-12 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-md transition-all group-active:scale-[0.99] group-hover:border-violet-500/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
                  c.image && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-24 w-24 shrink-0 overflow-hidden sm:h-28 sm:w-28", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ArchiveImage, { image: c.image, alt: c.title }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-transparent to-zinc-950/80" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 py-3 pr-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-400/80", children: [
                      "Chapter ",
                      c.number,
                      isCurrent && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-violet-500/30 px-2 py-0.5 text-[9px] text-violet-200", children: "Current" }),
                      tone && toneStyle && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full border px-2 py-0.5 text-[9px] ${toneStyle.bg} ${toneStyle.border} ${toneStyle.text}`, children: tone })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-1 font-display text-base font-bold leading-tight text-white", children: c.title.replace(/^Chapter \d+\s*[—-]\s*/, "") }),
                    c.summary && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 line-clamp-2 text-xs leading-snug text-white/55", children: c.summary }),
                    (() => {
                      const cast = detectCharacters(`${c.summary || ""} ${c.title || ""}`);
                      if (cast.length === 0) return null;
                      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-1.5", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex -space-x-1.5", children: cast.map((ch) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "div",
                          {
                            className: "h-5 w-5 overflow-hidden rounded-full border border-zinc-950 ring-1 ring-white/10",
                            title: ch.name,
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx(CharacterAvatar, { character: ch, faceCrop: true })
                          },
                          ch.id
                        )) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-white/40", children: cast.map((ch) => ch.firstName).join(" · ") })
                      ] });
                    })(),
                    c.choiceMade && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-1.5 text-[10px] text-white/40", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "line-clamp-1", children: [
                        "Choice: ",
                        c.choiceMade.text
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center pr-3 text-white/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" }) })
                ] }) })
              ]
            },
            c.number
          );
        }),
        !branch.isComplete && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-0 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/15 bg-zinc-900 text-white/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-12 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-bold uppercase tracking-widest text-white/30", children: [
              "Chapter ",
              currentNumber + 1
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 font-display text-sm text-white/40", children: "Yet to be written…" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: onJumpToCurrent,
                className: "mt-2 text-xs font-bold text-violet-400 hover:text-violet-300",
                children: "Continue the story →"
              }
            )
          ] })
        ] })
      ] })
    ] }) })
  ] });
};
const ChapterReader = ({ chapter, branch, onBack, onJumpToCurrent }) => {
  const paragraphs = chapter.prose.split(/\n\n+/);
  const tone = chapter.toneTag || chapter.choiceMade?.tone;
  const toneStyle = tone ? TONE_COLORS[tone] : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen pb-24", children: [
    chapter.image && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[4/3] min-h-[260px] w-full overflow-hidden bg-zinc-950 sm:aspect-[16/9]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArchiveImage, { image: chapter.image, alt: chapter.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: onBack,
          className: "absolute left-4 top-10 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3 py-2 text-xs font-bold text-white backdrop-blur-md",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-3.5 w-3.5" }),
            " Chapter List"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-0 left-0 right-0 px-5 pb-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "h-3 w-3" }),
          " Chapter ",
          chapter.number,
          " • Re-reading"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 font-display text-3xl font-black leading-tight tracking-tight text-white drop-shadow-2xl", children: chapter.title.replace(/^Chapter \d+\s*[—-]\s*/, "") }),
        tone && toneStyle && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `mt-2 inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${toneStyle.bg} ${toneStyle.border} ${toneStyle.text}`, children: tone })
      ] })
    ] }),
    chapter.choiceMade && chapter.number > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-5 mt-4 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-300", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3" }),
        " The choice that led here"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 font-serif text-sm italic text-white/80", children: [
        '"',
        chapter.choiceMade.text,
        '"'
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("article", { className: "mx-auto max-w-2xl px-6 pt-6", children: paragraphs.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-5 font-serif text-[17px] leading-[1.75] text-white/85", children: p }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-5 mt-6 flex flex-col gap-2.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: onBack,
          className: "flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-3.5 text-sm font-bold text-white",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "h-4 w-4" }),
            " Back to Chapter List"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: onJumpToCurrent,
          className: "flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 font-display text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-violet-500/30",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4" }),
            " Continue Current Story"
          ]
        }
      )
    ] })
  ] });
};
const WELCOME_KEY = "switchkicks_welcomed_v1";
const InteractiveStoriesPlayer = ({
  storySlug,
  initialView,
  initialTab,
  onBack
}) => {
  const [branches, setBranches] = reactExports.useState([]);
  const [endings, setEndings] = reactExports.useState([]);
  const [activeBranchId, setActiveBranchId] = reactExports.useState(null);
  const [view, setView] = reactExports.useState(initialView || "welcome");
  const [tab, setTab] = reactExports.useState(initialTab || "library");
  const [statusOpen, setStatusOpen] = reactExports.useState(false);
  const [continuation, setContinuation] = reactExports.useState(null);
  const [showEndings, setShowEndings] = reactExports.useState(false);
  const [shareSlug, setShareSlug] = reactExports.useState(null);
  const [installedStories, setInstalledStories] = reactExports.useState([]);
  const [remoteChoiceIndex, setRemoteChoiceIndex] = reactExports.useState(0);
  const [showCraftingModal, setShowCraftingModal] = reactExports.useState(false);
  const [craftPremise, setCraftPremise] = reactExports.useState("");
  const [craftTone, setCraftTone] = reactExports.useState("Bold");
  const { user, isGuest, isAdmin } = useAuth$1();
  const userUid = user?.uid || null;
  const requireAuth = (action, callback) => {
    if (isGuest || !userUid) {
      callback();
      return;
    }
    callback();
  };
  reactExports.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("share");
    if (slug) {
      setShareSlug(slug);
      setView("shared");
    }
  }, []);
  reactExports.useEffect(() => {
    const allBranches = loadBranches();
    setBranches(allBranches);
    setEndings(loadEndings());
    setInstalledStories(loadInstalledStoryPackages());
    ensureBundledStoryPackagesInstalled().then(setInstalledStories).catch((error) => {
      console.error("Bundled Interactive Stories could not be loaded.", error);
    });
    for (const b of allBranches) syncMetaFromBranch(b, userUid);
    const welcomed = localStorage.getItem(WELCOME_KEY);
    if (welcomed && !shareSlug) setView("main");
  }, [userUid]);
  reactExports.useEffect(() => {
    if (storySlug && view === "main") {
      const normalizedSlug = normalizeStorySlug(storySlug);
      if (normalizedSlug === "switch-kicks") {
        setView("landing");
      } else {
        const pkg = findInstalledStoryPackageBySlug(normalizedSlug);
        if (pkg) {
          handleStartInstalledStory(pkg.story.id);
        }
      }
    }
  }, [storySlug, installedStories.length]);
  const activeBranch = reactExports.useMemo(
    () => branches.find((b) => b.id === activeBranchId) || null,
    [branches, activeBranchId]
  );
  const refresh = () => {
    const fresh = loadBranches();
    setBranches(fresh);
    setEndings(loadEndings());
    setInstalledStories(loadInstalledStoryPackages());
    for (const b of fresh) syncMetaFromBranch(b, userUid);
  };
  const enterApp = () => {
    localStorage.setItem(WELCOME_KEY, "1");
    setView("main");
    setTab("library");
  };
  const handleOpenStory = () => setView("landing");
  const handleInstallStoryFile = async (file) => {
    try {
      const next = await installTreyStoryFile(file);
      setInstalledStories(next);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Could not install this .ttstory file.");
    }
  };
  const handleStartInstalledStory = (storyId) => {
    const pkg = loadInstalledStoryPackages().find((story) => story.story.id === storyId);
    if (!pkg) {
      alert("That installed story could not be found.");
      return;
    }
    const branch = createBranchFromStoryPackage(pkg);
    updateBranch(branch);
    syncMetaFromBranch(branch, userUid);
    refresh();
    setActiveBranchId(branch.id);
    setView("reading");
  };
  const handleStartNew = () => {
    if (branches.filter((b2) => !b2.isComplete).length >= 5) {
      alert("You have 5 active branches. Finish or delete one to start a new path.");
      return;
    }
    const b = createNewBranch();
    syncMetaFromBranch(b, userUid);
    refresh();
    setActiveBranchId(b.id);
    setView("reading");
  };
  const handleLaunchCraftedStory = () => {
    if (!craftPremise.trim()) {
      alert("Please enter a premise for your story.");
      return;
    }
    if (branches.filter((b2) => !b2.isComplete).length >= 5) {
      alert("You have 5 active branches. Finish or delete one to start a new path.");
      return;
    }
    const b = createCustomStoryBranch(craftPremise.trim(), craftTone);
    syncMetaFromBranch(b, userUid);
    refresh();
    setActiveBranchId(b.id);
    setShowCraftingModal(false);
    setCraftPremise("");
    setView("reading");
  };
  const handleContinueBranch = (b) => {
    setActiveBranchId(b.id);
    if (b.isComplete && b.ending) setView("ending");
    else setView("reading");
  };
  const handleContinueById = (id) => {
    const b = loadBranches().find((x) => x.id === id);
    if (!b) return;
    handleContinueBranch(b);
  };
  const handleReplayFrom = (id, chapter) => {
    replayFromChapter(id, chapter);
    refresh();
    const b = loadBranches().find((x) => x.id === id);
    if (b) {
      setActiveBranchId(b.id);
      setView("reading");
    }
  };
  const openReread = (b) => {
    setActiveBranchId(b.id);
    requireAuth("reread", () => setView("archive"));
  };
  const handleReadingContinue = () => {
    if (!activeBranch) return;
    if (activeBranch.isComplete && activeBranch.ending) {
      setView("ending");
      return;
    }
    if (activeBranch.pendingStopPoint) {
      setView("stop");
    } else {
      const updated = {
        ...activeBranch,
        pendingStopPoint: { prompt: "What happens next?", choices: CHAPTER_1_CHOICES }
      };
      updateBranch(updated);
      refresh();
      setView("stop");
    }
  };
  const runChoice = async (choice) => {
    if (!activeBranch) return;
    setView("loading");
    try {
      const result = await generateNextChapter(activeBranch, choice);
      const newMeters = applyDelta(activeBranch.meters, result.state.state_delta);
      const newChapterNumber = activeBranch.chapters[activeBranch.chapters.length - 1].number + 1;
      const chapterImage = result.image || pickChapterImage(result.state.tone_tag, newChapterNumber, `${result.state.chapter_title} ${result.state.chapter_summary} ${result.prose}`);
      const newChapter = {
        number: newChapterNumber,
        title: result.state.chapter_title || `Chapter ${newChapterNumber}`,
        prose: result.prose,
        image: chapterImage,
        imageFit: result.imageFit,
        imagePosition: result.imagePosition,
        sceneId: result.sceneId,
        voiceLines: result.voiceLines,
        characterVoices: result.characterVoices,
        storyCharacters: result.storyCharacters,
        summary: result.state.chapter_summary,
        toneTag: result.state.tone_tag,
        choiceMade: choice.tone ? { label: choice.label || "?", text: choice.text, tone: choice.tone } : { label: "✎", text: choice.text, tone: "Bold" }
      };
      const newToneHistory = [...activeBranch.toneHistory, result.state.tone_tag].slice(-10);
      const updated = {
        ...activeBranch,
        chapters: [...activeBranch.chapters, newChapter],
        meters: newMeters,
        toneHistory: newToneHistory,
        pendingStopPoint: result.state.next_stop_point || void 0,
        flags: { ...activeBranch.flags, current_scene_id: result.sceneId || activeBranch.flags.current_scene_id || "" },
        isComplete: !!result.state.is_ending
      };
      if (result.state.is_ending && result.state.ending_unlocked) {
        const ending = {
          name: result.state.ending_unlocked,
          tagline: result.state.ending_tagline || "Your story has an ending.",
          unlockedAt: Date.now(),
          branchId: updated.id
        };
        updated.ending = ending;
        saveEnding(ending);
      }
      updateBranch(updated);
      const meta = syncMetaFromBranch(updated, userUid);
      recordChoiceEvent({
        playthroughId: meta.id,
        userUid,
        chapterNumber: newChapterNumber,
        choiceLabel: choice.label,
        choiceText: choice.text,
        toneLabel: choice.tone,
        statChanges: result.state.state_delta
      }).catch(() => {
      });
      refresh();
      setContinuation({
        chapterTitle: newChapter.title,
        prose: newChapter.prose,
        delta: result.state.state_delta,
        image: chapterImage,
        imageFit: result.imageFit,
        imagePosition: result.imagePosition
      });
      setView("continuation");
    } catch (err) {
      console.error(err);
      alert("The AI is having a moment. Try again.");
      setView("stop");
    }
  };
  const handleChoice = (choice) => {
    if (!activeBranch) return;
    if (activeBranch.chapters.length >= 2) {
      requireAuth("continue-ai", () => runChoice(choice));
    } else {
      runChoice(choice);
    }
  };
  const handleContinuationDone = () => {
    setContinuation(null);
    if (activeBranch?.isComplete && activeBranch.ending) setView("ending");
    else setView("reading");
  };
  const handleResetAll = () => {
    localStorage.removeItem("switchkicks_branches_v1");
    localStorage.removeItem("switchkicks_endings_v1");
    localStorage.removeItem("trey_playthroughs_meta_v1");
    setBranches([]);
    setEndings([]);
    setActiveBranchId(null);
    alert("All progress reset.");
  };
  const handleDeleteBranch = (id) => {
    deleteBranch(id);
    if (activeBranchId === id) setActiveBranchId(null);
    refresh();
  };
  const handleGoBack = () => {
    if (onBack) onBack();
    else window.history.back();
  };
  useTvRemoteInput((action) => {
    if (action === "BACK") {
      if (view === "stop") setView("reading");
      else if (view === "reading") setView("landing");
      else handleGoBack();
      return;
    }
    if (action === "MENU") {
      setStatusOpen(true);
      return;
    }
    if (view === "reading" && action === "SELECT") {
      handleReadingContinue();
      return;
    }
    const choices = activeBranch?.pendingStopPoint?.choices ?? [];
    if (view !== "stop" || choices.length === 0) return;
    if (action === "UP" || action === "LEFT") {
      setRemoteChoiceIndex((index) => (index - 1 + choices.length) % choices.length);
      return;
    }
    if (action === "DOWN" || action === "RIGHT") {
      setRemoteChoiceIndex((index) => (index + 1) % choices.length);
      return;
    }
    if (action === "SELECT") {
      handleChoice(choices[remoteChoiceIndex % choices.length]);
    }
  });
  if (view === "shared" && shareSlug) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      SharedEndingScreen,
      {
        slug: shareSlug,
        onBack: () => {
          window.history.replaceState({}, "", window.location.pathname);
          setShareSlug(null);
          setView("main");
          setTab("library");
        }
      }
    );
  }
  if (view === "welcome") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(WelcomeScreen, { onEnter: enterApp });
  }
  if (view === "archive" && activeBranch) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ChapterArchiveScreen,
        {
          branch: activeBranch,
          onBack: () => setView("reading"),
          onJumpToCurrent: () => {
            if (activeBranch.isComplete && activeBranch.ending) setView("ending");
            else setView("reading");
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(BottomNav, { active: tab, onChange: (t) => {
        setTab(t);
        setView("main");
      } })
    ] });
  }
  if (view === "landing") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        LandingScreen,
        {
          onBack: () => setView("main"),
          onStartNew: handleStartNew,
          onContinue: handleContinueBranch,
          branches: branches.filter((b) => b.storyId === "switch_kicks"),
          onReread: openReread
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(BottomNav, { active: tab, onChange: (t) => {
        setTab(t);
        setView("main");
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPanel, { branch: activeBranch, open: statusOpen, onClose: () => setStatusOpen(false) })
    ] });
  }
  if (view === "reading" && activeBranch) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ReadingScreen,
        {
          branch: activeBranch,
          onBack: () => setView("landing"),
          onContinue: handleReadingContinue,
          onOpenStatus: () => setStatusOpen(true),
          onReread: () => requireAuth("reread", () => setView("archive"))
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(BottomNav, { active: tab, onChange: (t) => {
        setTab(t);
        setView("main");
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPanel, { branch: activeBranch, open: statusOpen, onClose: () => setStatusOpen(false) })
    ] });
  }
  if (view === "stop" && activeBranch) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        StopPointScreen,
        {
          branch: activeBranch,
          onBack: () => setView("reading"),
          onSubmit: handleChoice,
          selectedChoiceIndex: remoteChoiceIndex
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(BottomNav, { active: tab, onChange: (t) => {
        setTab(t);
        setView("main");
      } })
    ] });
  }
  if (view === "loading") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AILoadingScreen, {});
  }
  if (view === "continuation" && continuation) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ContinuationScreen,
        {
          chapterTitle: continuation.chapterTitle,
          prose: continuation.prose,
          delta: continuation.delta,
          image: continuation.image,
          imageFit: continuation.imageFit,
          imagePosition: continuation.imagePosition,
          onContinue: handleContinuationDone
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(BottomNav, { active: tab, onChange: (t) => {
        setTab(t);
        setView("main");
      } })
    ] });
  }
  if (view === "ending" && activeBranch?.ending) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        EndingScreen,
        {
          ending: activeBranch.ending,
          branch: activeBranch,
          onNewBranch: () => setView("landing"),
          onLibrary: () => {
            setTab("library");
            setView("main");
          },
          onReread: () => requireAuth("reread", () => setView("archive"))
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(BottomNav, { active: tab, onChange: (t) => {
        setTab(t);
        setView("main");
      } })
    ] });
  }
  const lastActiveBranch = branches.find((b) => !b.isComplete) || branches[0] || null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    tab === "library" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      LibraryScreen,
      {
        onOpenStory: handleOpenStory,
        onOpenEndings: () => setShowEndings(true),
        hasSave: branches.some((b) => !b.isComplete),
        endingsCount: endings.length,
        installedStories,
        onInstallStoryFile: isAdmin ? handleInstallStoryFile : void 0,
        onStartInstalledStory: handleStartInstalledStory,
        onCraftStory: () => setShowCraftingModal(true)
      }
    ),
    tab === "story" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      LandingScreen,
      {
        onBack: () => setTab("library"),
        onStartNew: handleStartNew,
        onContinue: handleContinueBranch,
        branches: branches.filter((b) => b.storyId === "switch_kicks"),
        onReread: openReread
      }
    ),
    tab === "saves" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      PlaythroughsScreen,
      {
        branches,
        onContinue: handleContinueById,
        onReplayFrom: handleReplayFrom,
        onDelete: handleDeleteBranch,
        onShareEnding: (id) => {
          const b = loadBranches().find((x) => x.id === id);
          if (b?.isComplete && b.ending) {
            setActiveBranchId(b.id);
            setView("ending");
          }
        }
      }
    ),
    tab === "branches" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      BranchMapScreen,
      {
        branches,
        activeBranchId,
        onOpenBranch: handleContinueBranch,
        onNewBranch: handleStartNew,
        onDelete: handleDeleteBranch
      }
    ),
    tab === "characters" && /* @__PURE__ */ jsxRuntimeExports.jsx(CharactersScreen, { branch: activeBranch }),
    tab === "settings" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      SettingsScreen,
      {
        onResetAll: handleResetAll,
        hasActiveBranch: !!lastActiveBranch,
        onOpenReread: lastActiveBranch ? () => openReread(lastActiveBranch) : void 0
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BottomNav, { active: tab, onChange: setTab }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPanel, { branch: activeBranch, open: statusOpen, onClose: () => setStatusOpen(false) }),
    showEndings && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-40 overflow-y-auto bg-black", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setShowEndings(false),
          className: "fixed left-4 top-10 z-50 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-sm text-white backdrop-blur-md",
          children: "← Back"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(EndingsScreen, { endings })
    ] }),
    showCraftingModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-cyan-500/30 bg-[linear-gradient(135deg,rgba(9,9,11,0.95),rgba(15,23,42,0.95))] p-6 shadow-[0_0_50px_rgba(34,211,238,0.2)] animate-in fade-in zoom-in-95 duration-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            setShowCraftingModal(false);
            setCraftPremise("");
          },
          className: "absolute right-5 top-5 rounded-full border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10 hover:text-white",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-cyan-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-5 w-5 text-cyan-300 animate-pulse" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold uppercase tracking-[0.25em] text-cyan-300", children: "AI Story Studio" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-2 font-display text-3xl font-black text-white leading-none", children: "Craft Your Story" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-white/55", children: "Input your custom premise, pick a starting tone, and launch a fully customized AI interactive story journey." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-bold uppercase tracking-wider text-white/50", children: "Define Your Premise" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => {
                  const pool = [
                    "Two undercover detectives switching places during a high-stakes hip-hop concert.",
                    "A legendary streetball wager where the stakes are clearing a sibling's major debt.",
                    "A dancer trying to keep their twin out of trouble by performing in their place for the finals.",
                    "An ambitious sneaker designer who discovers a secret high-society wager ring.",
                    "A star athlete who gets swap-recruited into a mysterious underground sports guild."
                  ];
                  const picked = pool[Math.floor(Math.random() * pool.length)];
                  setCraftPremise(picked);
                },
                className: "flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(WandSparkles, { className: "h-3 w-3" }),
                  " Roll Preset"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: craftPremise,
              onChange: (e) => setCraftPremise(e.target.value),
              placeholder: "e.g. An ambitious sneaker designer who discovers a secret high-society wager ring...",
              className: "mt-1.5 w-full h-24 rounded-2xl border border-white/15 bg-black/40 p-4 text-sm text-white placeholder:text-white/30 focus:border-cyan-500 focus:outline-none resize-none font-serif leading-relaxed"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-bold uppercase tracking-wider text-white/50", children: "Starting Vibe / Tone" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex flex-wrap gap-2", children: ["Bold", "Risky", "Funny", "Romantic", "Safe"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setCraftTone(t),
              className: `rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] transition-colors border ${craftTone === t ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.15)]" : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"}`,
              children: t
            },
            t
          )) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: handleLaunchCraftedStory,
          className: "mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 via-violet-600 to-fuchsia-600 px-6 py-4 font-display text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-transform",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }),
            " Launch Story Adventure"
          ]
        }
      )
    ] }) })
  ] });
};
export {
  InteractiveStoriesPlayer as default
};
