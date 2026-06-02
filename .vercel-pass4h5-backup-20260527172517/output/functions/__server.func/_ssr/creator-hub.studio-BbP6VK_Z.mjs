import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { A as AppShell } from "./AppShell-BWcCrjwR.mjs";
import { v as posts } from "./router-BtgGywEC.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { X, O as Search, cl as CircleDashed, t as Crown, S as Sparkles, ak as ChevronDown, bl as Download, c5 as Maximize2, c7 as Undo2, aJ as Pause, a4 as Play, c8 as Redo2, aL as Volume2, bI as Layers, d as Image, P as Plus, cf as Scissors, cm as ImagePlus, b7 as Film, a0 as Music, cd as Type, ce as Captions, aQ as SlidersHorizontal, $ as Smile, cn as SquareUserRound, F as FileText, W as WandSparkles, c3 as Square, co as LayoutTemplate } from "../_libs/lucide-react.mjs";
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
const primaryTools = [{
  id: "edit",
  label: "Edit",
  icon: Scissors
}, {
  id: "audio",
  label: "Audio",
  icon: Music
}, {
  id: "text",
  label: "Text",
  icon: Type
}, {
  id: "effects",
  label: "Effects",
  icon: Sparkles,
  accent: true
}, {
  id: "overlay",
  label: "Overlay",
  icon: Image
}, {
  id: "captions",
  label: "Captions",
  icon: Captions
}, {
  id: "filters",
  label: "Filters",
  icon: SlidersHorizontal
}, {
  id: "adjust",
  label: "Adjust",
  icon: SlidersHorizontal
}, {
  id: "stickers",
  label: "Stickers",
  icon: Smile
}, {
  id: "ai-avatar",
  label: "AI Avatar",
  icon: SquareUserRound,
  badge: "Try free"
}, {
  id: "transcript",
  label: "Transcript",
  icon: FileText
}, {
  id: "ai-media",
  label: "AI Media",
  icon: WandSparkles
}, {
  id: "aspect",
  label: "Aspect Ratio",
  icon: Square
}, {
  id: "background",
  label: "Background",
  icon: ImagePlus
}, {
  id: "templates",
  label: "Templates",
  icon: LayoutTemplate
}];
const editSubTools = [{
  id: "split",
  label: "Split",
  icon: Scissors
}, {
  id: "ai-image",
  label: "AI Image",
  icon: ImagePlus
}, {
  id: "ai-video",
  label: "AI Video",
  icon: Film
}, {
  id: "quality",
  label: "Video Quality",
  icon: Sparkles,
  badge: "HD"
}, {
  id: "delete",
  label: "Delete",
  icon: X,
  destructive: true
}, {
  id: "change-bg",
  label: "Change BG",
  icon: ImagePlus,
  free: true
}];
function Studio() {
  const navigate = useNavigate();
  const [tool, setTool] = reactExports.useState("edit");
  const [playing, setPlaying] = reactExports.useState(false);
  const [muted, setMuted] = reactExports.useState(true);
  const [resolution, setResolution] = reactExports.useState("AI UHD");
  const [showQuality, setShowQuality] = reactExports.useState(false);
  const [time, setTime] = reactExports.useState(0);
  const handlePlay = () => {
    setPlaying((p) => !p);
    toast(playing ? "Paused" : "Playing preview");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { wide: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 rounded-2xl glass neon-border p-3 md:p-4 hover-lift", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate({
          to: "/creator-hub"
        }), className: "size-10 grid place-items-center rounded-xl glass tilt-press hover:bg-white/5", "aria-label": "Close studio", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toast("Search timeline elements"), className: "size-10 grid place-items-center rounded-xl glass tilt-press hover:bg-white/5", "aria-label": "Search", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "size-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:flex items-center gap-2 ml-2 px-3 py-1.5 rounded-lg glass border border-white/10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleDashed, { className: "size-3.5 text-primary animate-spin [animation-duration:6s]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Project" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold", children: "Late Night · S2 E14" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-3.5 text-primary" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowQuality((s) => !s), className: "px-3 py-2 rounded-xl text-sm font-semibold glass border border-white/10 flex items-center gap-1.5 hover:bg-white/5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3.5 text-primary" }),
            resolution,
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: `size-3.5 transition-transform ${showQuality ? "rotate-180" : ""}` })
          ] }),
          showQuality && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-0 top-full mt-2 w-40 rounded-xl glass-strong border border-white/10 shadow-2xl p-1 z-20 animate-scale-in", children: ["AI UHD", "4K", "1080p", "720p"].map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
            setResolution(r);
            setShowQuality(false);
          }, className: `w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white/5 ${resolution === r ? "text-primary font-semibold" : ""}`, children: r }, r)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => toast.success("Export queued — rendering AI UHD"), className: "px-4 md:px-5 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold tilt-press hover-lift flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "size-4" }),
          " Export"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-3xl glass neon-border overflow-hidden hover-lift", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.2_0.1_300_/_0.4),transparent_60%)] pointer-events-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative p-4 md:p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto aspect-[9/16] max-h-[60vh] w-auto rounded-2xl overflow-hidden bg-black ring-1 ring-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: posts[0].media, className: "absolute inset-0 size-full object-cover opacity-80", alt: "" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toast("Edit text layer"), className: "absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-white/80 text-sm tracking-wide hover:text-primary transition group", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-3 py-1 rounded-md border border-dashed border-white/20 group-hover:border-primary", children: "Tap to edit text" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-3 inset-x-0 text-center text-[10px] tracking-[0.25em] text-white/40", children: "TREY TV ID: 1835089247" }),
            playing && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 ring-2 ring-primary/40 rounded-2xl pointer-events-none animate-glow-pulse" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toast("Fullscreen"), className: "size-9 grid place-items-center rounded-lg glass tilt-press", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize2, { className: "size-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toast("Undo"), className: "size-9 grid place-items-center rounded-lg glass tilt-press", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Undo2, { className: "size-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handlePlay, className: "size-12 grid place-items-center rounded-full bg-primary text-primary-foreground glow-gold tilt-press hover-lift", children: playing ? /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "size-5 fill-current" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "size-5 fill-current ml-0.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toast("Redo"), className: "size-9 grid place-items-center rounded-lg glass tilt-press", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Redo2, { className: "size-4" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setMuted((m) => !m), className: `size-9 grid place-items-center rounded-lg glass tilt-press ${muted ? "" : "text-primary"}`, "aria-label": "Mute", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Volume2, { className: "size-4" }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "rounded-3xl glass neon-border p-4 hover-lift hidden lg:flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] tracking-[0.3em] text-muted-foreground mb-3 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "size-3.5 text-primary" }),
          " PROPERTIES"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mb-1", children: "Selected layer" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2 rounded-lg glass border border-white/10 text-sm font-semibold", children: "Main video clip" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Slider, { label: "Speed", value: 1, min: 0.25, max: 3, suffix: "x" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Slider, { label: "Volume", value: 80, min: 0, max: 100, suffix: "%" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Slider, { label: "Opacity", value: 100, min: 0, max: 100, suffix: "%" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mb-2", children: "Filter" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: ["None", "Aurora", "Gold", "Cinema", "Neon", "Noir"].map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toast(`Filter: ${f}`), className: `relative aspect-square rounded-lg overflow-hidden ring-1 ${i === 1 ? "ring-primary glow-gold" : "ring-white/10"} tilt-press`, style: {
              background: i === 0 ? "oklch(0.2 0.02 270)" : i === 1 ? "linear-gradient(135deg,oklch(0.3 0.18 300),oklch(0.25 0.15 215),oklch(0.2 0.18 340))" : i === 2 ? "linear-gradient(135deg,oklch(0.7 0.18 60),oklch(0.86 0.17 90))" : i === 3 ? "linear-gradient(135deg,oklch(0.2 0.05 270),oklch(0.15 0.1 30))" : i === 4 ? "linear-gradient(135deg,oklch(0.4 0.25 340),oklch(0.4 0.22 215))" : "linear-gradient(135deg,oklch(0.15 0.01 270),oklch(0.05 0.005 270))"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-x-0 bottom-0 text-[9px] py-0.5 text-center bg-black/40 backdrop-blur-sm", children: f }) }, f)) })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl glass neon-border p-4 hover-lift", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Quick, { icon: Volume2, label: "Unmute", sub: "clip audio", onClick: () => setMuted(false) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Quick, { icon: Sparkles, label: "AI Clipper", highlight: true, onClick: () => toast("AI Clipper running") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Quick, { icon: Image, label: "Cover", onClick: () => toast("Edit cover") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs tabular-nums text-primary", children: [
            "00:",
            String(time).padStart(2, "0")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "/ 00:03" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 relative h-5 border-b border-white/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex justify-between text-[10px] text-muted-foreground tabular-nums", children: ["00:00", "00:01", "00:02", "00:03"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "-translate-x-1/2 first:translate-x-0 last:-translate-x-full", children: t }, t)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-3 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 bottom-0 left-[8%] w-px bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] z-10 pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1 -left-1 size-2 rounded-full bg-white" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Track, { tone: "primary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "range", min: 0, max: 3, value: time, onChange: (e) => setTime(Number(e.target.value)), className: "absolute inset-0 opacity-0 cursor-pointer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-full rounded-lg overflow-hidden bg-gradient-to-r from-primary/30 via-[oklch(0.7_0.25_340_/_0.3)] to-[oklch(0.65_0.22_300_/_0.3)] ring-1 ring-primary/50 shimmer-sweep", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: posts[0].media, className: "absolute inset-0 w-full h-full object-cover opacity-50", alt: "" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 flex items-center justify-between px-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-1 h-6 bg-white/70 rounded-full" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold text-white drop-shadow", children: "main_clip.mp4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-1 h-6 bg-white/70 rounded-full" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Track, { tone: "cyan", label: "Audio", emptyLabel: "+ Add audio", onAdd: () => toast("Add audio"), children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full flex items-center gap-px px-2", children: Array.from({
          length: 60
        }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 bg-[oklch(0.82_0.15_215)] rounded-full", style: {
          height: `${20 + Math.sin(i * 0.6) * 20 + Math.random() * 20}%`,
          opacity: 0.7
        } }, i)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Track, { tone: "magenta", label: "Text", emptyLabel: "+ Add text", onAdd: () => toast("Add text overlay"), children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full flex items-center px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-semibold text-[oklch(0.7_0.25_340)] truncate", children: '"Tap to edit text"' }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => toast("Add new track"), className: "mt-3 w-full py-2 rounded-xl border border-dashed border-white/15 text-xs text-muted-foreground hover:bg-white/5 hover:text-foreground transition flex items-center justify-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-3.5" }),
        " Add layer"
      ] })
    ] }),
    tool === "edit" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl glass neon-border p-2 overflow-x-auto no-scrollbar animate-fade-in", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-max", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "size-9 grid place-items-center rounded-lg glass tilt-press shrink-0", onClick: () => setTool("edit"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4 -rotate-45" }) }),
      editSubTools.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => toast(`${s.label}`), style: {
        animationDelay: `${i * 40}ms`
      }, className: `relative px-3 py-2 rounded-lg flex flex-col items-center gap-0.5 min-w-[72px] tilt-press animate-rise transition ${s.destructive ? "hover:bg-destructive/10" : "hover:bg-white/5"}`, children: [
        s.badge && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1 right-1 text-[8px] font-bold px-1.5 py-0.5 rounded bg-primary text-primary-foreground", children: s.badge }),
        s.free && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1 right-1 text-[8px] font-bold px-1.5 py-0.5 rounded bg-[oklch(0.78_0.18_150)] text-black", children: "Free" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(s.icon, { className: `size-5 ${s.destructive ? "text-destructive" : "text-foreground"}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px]", children: s.label })
      ] }, s.id))
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky bottom-3 z-10 rounded-3xl glass-strong border border-white/10 p-2 overflow-x-auto no-scrollbar shadow-[0_20px_60px_-20px_oklch(0_0_0_/_0.7)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1 min-w-max", children: primaryTools.map((t, i) => {
      const active = tool === t.id;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setTool(t.id), style: {
        animationDelay: `${i * 30}ms`
      }, className: `relative px-3 py-2 rounded-xl flex flex-col items-center gap-0.5 min-w-[76px] tilt-press animate-rise transition ${active ? "bg-primary/15 ring-1 ring-primary/40 glow-gold" : "hover:bg-white/5"}`, children: [
        t.badge && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1 right-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-[oklch(0.82_0.15_215)] text-black", children: t.badge }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(t.icon, { className: `size-5 ${active ? "text-primary" : t.accent ? "text-[oklch(0.7_0.25_340)]" : "text-foreground"}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[10px] ${active ? "text-primary font-semibold" : "text-muted-foreground"}`, children: t.label })
      ] }, t.id);
    }) }) })
  ] }) });
}
function Quick({
  icon: Icon,
  label,
  sub,
  highlight,
  onClick
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick, className: `px-3 py-2 rounded-xl tilt-press flex flex-col items-center gap-0.5 min-w-[72px] ${highlight ? "bg-[oklch(0.82_0.15_215_/_0.15)] ring-1 ring-[oklch(0.82_0.15_215_/_0.4)]" : "glass"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `size-4 ${highlight ? "text-[oklch(0.82_0.15_215)]" : ""}` }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold leading-tight", children: label }),
    sub && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-muted-foreground leading-tight", children: sub })
  ] });
}
function Track({
  children,
  tone,
  label,
  emptyLabel,
  onAdd
}) {
  const ring = tone === "primary" ? "ring-primary/30" : tone === "cyan" ? "ring-[oklch(0.82_0.15_215_/_0.3)]" : "ring-[oklch(0.7_0.25_340_/_0.3)]";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
    label && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-12 shrink-0 text-[9px] tracking-[0.18em] text-muted-foreground text-right`, children: label.toUpperCase() }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `relative flex-1 h-12 rounded-xl bg-white/5 ring-1 ${ring} overflow-hidden`, children }),
    onAdd && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onAdd, className: "shrink-0 px-2 py-1 rounded-lg text-[10px] glass border border-white/10 hover:bg-white/5", children: emptyLabel })
  ] });
}
function Slider({
  label,
  value,
  min,
  max,
  suffix
}) {
  const [v, setV] = reactExports.useState(value);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs mb-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "tabular-nums font-semibold", children: [
        v,
        suffix
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "range", min, max, step: (max - min) / 100, value: v, onChange: (e) => setV(Number(e.target.value)), className: "w-full accent-[oklch(0.82_0.16_85)]" })
  ] });
}
export {
  Studio as component
};
