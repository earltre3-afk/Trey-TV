import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  X, Search, Download, Play, Pause, Maximize2, Undo2, Redo2, Volume2, Sparkles,
  Scissors, Music, Type, Wand2, Image as ImageIcon, Captions, SlidersHorizontal,
  Smile, UserSquare2, FileText, Film, Square, ImagePlus, LayoutTemplate,
  Plus, ChevronDown, Crown, CircleDashed, Layers,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { posts } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/creator-hub/studio")({
  component: Studio,
  head: () => ({
    meta: [
      { title: "Edit Studio — Trey TV" },
      { name: "description", content: "Cinematic editor inside the Creator Hub. Cut, mix, caption and AI-enhance your shows." },
    ],
  }),
});

type LucideIcon = typeof Scissors;
type Tool = { id: string; label: string; icon: LucideIcon; badge?: string; accent?: boolean; destructive?: boolean; free?: boolean };

const primaryTools: Tool[] = [
  { id: "edit", label: "Edit", icon: Scissors },
  { id: "audio", label: "Audio", icon: Music },
  { id: "text", label: "Text", icon: Type },
  { id: "effects", label: "Effects", icon: Sparkles, accent: true },
  { id: "overlay", label: "Overlay", icon: ImageIcon },
  { id: "captions", label: "Captions", icon: Captions },
  { id: "filters", label: "Filters", icon: SlidersHorizontal },
  { id: "adjust", label: "Adjust", icon: SlidersHorizontal },
  { id: "stickers", label: "Stickers", icon: Smile },
  { id: "ai-avatar", label: "AI Avatar", icon: UserSquare2, badge: "Try free" },
  { id: "transcript", label: "Transcript", icon: FileText },
  { id: "ai-media", label: "AI Media", icon: Wand2 },
  { id: "aspect", label: "Aspect Ratio", icon: Square },
  { id: "background", label: "Background", icon: ImagePlus },
  { id: "templates", label: "Templates", icon: LayoutTemplate },
];

const editSubTools: Tool[] = [
  { id: "split", label: "Split", icon: Scissors },
  { id: "ai-image", label: "AI Image", icon: ImagePlus },
  { id: "ai-video", label: "AI Video", icon: Film },
  { id: "quality", label: "Video Quality", icon: Sparkles, badge: "HD" },
  { id: "delete", label: "Delete", icon: X, destructive: true },
  { id: "change-bg", label: "Change BG", icon: ImagePlus, free: true },
];

function Studio() {
  const navigate = useNavigate();
  const [tool, setTool] = useState<string>("edit");
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [resolution, setResolution] = useState("AI UHD");
  const [showQuality, setShowQuality] = useState(false);
  const [time, setTime] = useState(0);

  const handlePlay = () => {
    setPlaying((p) => !p);
    toast(playing ? "Paused" : "Playing preview");
  };

  return (
    <AppShell wide>
      <div className="space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 rounded-2xl glass neon-border p-3 md:p-4 hover-lift">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate({ to: "/creator-hub" })}
              className="size-10 grid place-items-center rounded-xl glass tilt-press hover:bg-white/5"
              aria-label="Close studio"
            >
              <X className="size-5" />
            </button>
            <button
              onClick={() => toast("Search timeline elements")}
              className="size-10 grid place-items-center rounded-xl glass tilt-press hover:bg-white/5"
              aria-label="Search"
            >
              <Search className="size-5" />
            </button>
            <div className="hidden md:flex items-center gap-2 ml-2 px-3 py-1.5 rounded-lg glass border border-white/10">
              <CircleDashed className="size-3.5 text-primary animate-spin [animation-duration:6s]" />
              <span className="text-xs text-muted-foreground">Project</span>
              <span className="text-xs font-semibold">Late Night · S2 E14</span>
              <Crown className="size-3.5 text-primary" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowQuality((s) => !s)}
                className="px-3 py-2 rounded-xl text-sm font-semibold glass border border-white/10 flex items-center gap-1.5 hover:bg-white/5"
              >
                <Sparkles className="size-3.5 text-primary" />
                {resolution}
                <ChevronDown className={`size-3.5 transition-transform ${showQuality ? "rotate-180" : ""}`} />
              </button>
              {showQuality && (
                <div className="absolute right-0 top-full mt-2 w-40 rounded-xl glass-strong border border-white/10 shadow-2xl p-1 z-20 animate-scale-in">
                  {["AI UHD", "4K", "1080p", "720p"].map((r) => (
                    <button
                      key={r}
                      onClick={() => { setResolution(r); setShowQuality(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white/5 ${resolution === r ? "text-primary font-semibold" : ""}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => toast.success("Export queued — rendering AI UHD")}
              className="px-4 md:px-5 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold tilt-press hover-lift flex items-center gap-2"
            >
              <Download className="size-4" /> Export
            </button>
          </div>
        </div>

        {/* Main editor: preview + side panel */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          {/* Preview Canvas */}
          <div className="relative rounded-3xl glass neon-border overflow-hidden hover-lift">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.2_0.1_300_/_0.4),transparent_60%)] pointer-events-none" />
            <div className="relative p-4 md:p-6">
              {/* Canvas */}
              <div className="relative mx-auto aspect-[9/16] max-h-[60vh] w-auto rounded-2xl overflow-hidden bg-black ring-1 ring-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
                <img src={posts[0].media} className="absolute inset-0 size-full object-cover opacity-80" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                {/* Editable text */}
                <button
                  onClick={() => toast("Edit text layer")}
                  className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-white/80 text-sm tracking-wide hover:text-primary transition group"
                >
                  <span className="px-3 py-1 rounded-md border border-dashed border-white/20 group-hover:border-primary">
                    Tap to edit text
                  </span>
                </button>
                {/* Bottom watermark */}
                <div className="absolute bottom-3 inset-x-0 text-center text-[10px] tracking-[0.25em] text-white/40">
                  TREY TV ID: 1835089247
                </div>
                {/* Playhead halo */}
                {playing && (
                  <div className="absolute inset-0 ring-2 ring-primary/40 rounded-2xl pointer-events-none animate-glow-pulse" />
                )}
              </div>

              {/* Transport bar */}
              <div className="mt-4 flex items-center justify-between gap-3">
                <button onClick={() => toast("Fullscreen")} className="size-9 grid place-items-center rounded-lg glass tilt-press">
                  <Maximize2 className="size-4" />
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={() => toast("Undo")} className="size-9 grid place-items-center rounded-lg glass tilt-press"><Undo2 className="size-4" /></button>
                  <button
                    onClick={handlePlay}
                    className="size-12 grid place-items-center rounded-full bg-primary text-primary-foreground glow-gold tilt-press hover-lift"
                  >
                    {playing ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current ml-0.5" />}
                  </button>
                  <button onClick={() => toast("Redo")} className="size-9 grid place-items-center rounded-lg glass tilt-press"><Redo2 className="size-4" /></button>
                </div>
                <button
                  onClick={() => setMuted((m) => !m)}
                  className={`size-9 grid place-items-center rounded-lg glass tilt-press ${muted ? "" : "text-primary"}`}
                  aria-label="Mute"
                >
                  <Volume2 className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Properties panel */}
          <aside className="rounded-3xl glass neon-border p-4 hover-lift hidden lg:flex flex-col">
            <div className="text-[10px] tracking-[0.3em] text-muted-foreground mb-3 flex items-center gap-2">
              <Layers className="size-3.5 text-primary" /> PROPERTIES
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Selected layer</div>
                <div className="px-3 py-2 rounded-lg glass border border-white/10 text-sm font-semibold">Main video clip</div>
              </div>
              <Slider label="Speed" value={1.0} min={0.25} max={3} suffix="x" />
              <Slider label="Volume" value={80} min={0} max={100} suffix="%" />
              <Slider label="Opacity" value={100} min={0} max={100} suffix="%" />
              <div>
                <div className="text-xs text-muted-foreground mb-2">Filter</div>
                <div className="grid grid-cols-3 gap-2">
                  {["None", "Aurora", "Gold", "Cinema", "Neon", "Noir"].map((f, i) => (
                    <button
                      key={f}
                      onClick={() => toast(`Filter: ${f}`)}
                      className={`relative aspect-square rounded-lg overflow-hidden ring-1 ${i === 1 ? "ring-primary glow-gold" : "ring-white/10"} tilt-press`}
                      style={{
                        background:
                          i === 0 ? "oklch(0.2 0.02 270)" :
                          i === 1 ? "linear-gradient(135deg,oklch(0.3 0.18 300),oklch(0.25 0.15 215),oklch(0.2 0.18 340))" :
                          i === 2 ? "linear-gradient(135deg,oklch(0.7 0.18 60),oklch(0.86 0.17 90))" :
                          i === 3 ? "linear-gradient(135deg,oklch(0.2 0.05 270),oklch(0.15 0.1 30))" :
                          i === 4 ? "linear-gradient(135deg,oklch(0.4 0.25 340),oklch(0.4 0.22 215))" :
                          "linear-gradient(135deg,oklch(0.15 0.01 270),oklch(0.05 0.005 270))",
                      }}
                    >
                      <span className="absolute inset-x-0 bottom-0 text-[9px] py-0.5 text-center bg-black/40 backdrop-blur-sm">{f}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Timeline */}
        <div className="rounded-3xl glass neon-border p-4 hover-lift">
          {/* Top tools row */}
          <div className="flex items-center gap-3 flex-wrap">
            <Quick icon={Volume2} label="Unmute" sub="clip audio" onClick={() => setMuted(false)} />
            <Quick icon={Sparkles} label="AI Clipper" highlight onClick={() => toast("AI Clipper running")} />
            <Quick icon={ImageIcon} label="Cover" onClick={() => toast("Edit cover")} />
            <div className="ml-auto flex items-center gap-3">
              <span className="text-xs tabular-nums text-primary">00:{String(time).padStart(2, "0")}</span>
              <span className="text-xs text-muted-foreground">/ 00:03</span>
            </div>
          </div>

          {/* Ruler */}
          <div className="mt-4 relative h-5 border-b border-white/5">
            <div className="absolute inset-0 flex justify-between text-[10px] text-muted-foreground tabular-nums">
              {["00:00", "00:01", "00:02", "00:03"].map((t) => (
                <span key={t} className="-translate-x-1/2 first:translate-x-0 last:-translate-x-full">{t}</span>
              ))}
            </div>
          </div>

          {/* Tracks */}
          <div className="relative mt-3 space-y-2">
            {/* Playhead */}
            <div className="absolute top-0 bottom-0 left-[8%] w-px bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] z-10 pointer-events-none">
              <span className="absolute -top-1 -left-1 size-2 rounded-full bg-white" />
            </div>

            {/* Video track */}
            <Track tone="primary">
              <input
                type="range"
                min={0}
                max={3}
                value={time}
                onChange={(e) => setTime(Number(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="relative h-full rounded-lg overflow-hidden bg-gradient-to-r from-primary/30 via-[oklch(0.7_0.25_340_/_0.3)] to-[oklch(0.65_0.22_300_/_0.3)] ring-1 ring-primary/50 shimmer-sweep">
                <img src={posts[0].media} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="" />
                <div className="absolute inset-0 flex items-center justify-between px-2">
                  <span className="size-1 h-6 bg-white/70 rounded-full" />
                  <span className="text-[10px] font-semibold text-white drop-shadow">main_clip.mp4</span>
                  <span className="size-1 h-6 bg-white/70 rounded-full" />
                </div>
              </div>
            </Track>

            {/* Audio track */}
            <Track tone="cyan" label="Audio" emptyLabel="+ Add audio" onAdd={() => toast("Add audio")}>
              <div className="h-full flex items-center gap-px px-2">
                {Array.from({ length: 60 }).map((_, i) => (
                  <span
                    key={i}
                    className="flex-1 bg-[oklch(0.82_0.15_215)] rounded-full"
                    style={{ height: `${20 + Math.sin(i * 0.6) * 20 + Math.random() * 20}%`, opacity: 0.7 }}
                  />
                ))}
              </div>
            </Track>

            {/* Text track */}
            <Track tone="magenta" label="Text" emptyLabel="+ Add text" onAdd={() => toast("Add text overlay")}>
              <div className="h-full flex items-center px-3">
                <span className="text-[11px] font-semibold text-[oklch(0.7_0.25_340)] truncate">"Tap to edit text"</span>
              </div>
            </Track>
          </div>

          {/* Add layer */}
          <button
            onClick={() => toast("Add new track")}
            className="mt-3 w-full py-2 rounded-xl border border-dashed border-white/15 text-xs text-muted-foreground hover:bg-white/5 hover:text-foreground transition flex items-center justify-center gap-1"
          >
            <Plus className="size-3.5" /> Add layer
          </button>
        </div>

        {/* Sub tool rail (Edit-mode actions) */}
        {tool === "edit" && (
          <div className="rounded-2xl glass neon-border p-2 overflow-x-auto no-scrollbar animate-fade-in">
            <div className="flex items-center gap-2 min-w-max">
              <button className="size-9 grid place-items-center rounded-lg glass tilt-press shrink-0" onClick={() => setTool("edit")}>
                <X className="size-4 -rotate-45" />
              </button>
              {editSubTools.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => toast(`${s.label}`)}
                  style={{ animationDelay: `${i * 40}ms` }}
                  className={`relative px-3 py-2 rounded-lg flex flex-col items-center gap-0.5 min-w-[72px] tilt-press animate-rise transition ${
                    s.destructive ? "hover:bg-destructive/10" : "hover:bg-white/5"
                  }`}
                >
                  {s.badge && (
                    <span className="absolute -top-1 right-1 text-[8px] font-bold px-1.5 py-0.5 rounded bg-primary text-primary-foreground">
                      {s.badge}
                    </span>
                  )}
                  {s.free && (
                    <span className="absolute -top-1 right-1 text-[8px] font-bold px-1.5 py-0.5 rounded bg-[oklch(0.78_0.18_150)] text-black">
                      Free
                    </span>
                  )}
                  <s.icon className={`size-5 ${s.destructive ? "text-destructive" : "text-foreground"}`} />
                  <span className="text-[10px]">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom toolbar (primary tools) */}
        <div className="sticky bottom-3 z-10 rounded-3xl glass-strong border border-white/10 p-2 overflow-x-auto no-scrollbar shadow-[0_20px_60px_-20px_oklch(0_0_0_/_0.7)]">
          <div className="flex items-center gap-1 min-w-max">
            {primaryTools.map((t, i) => {
              const active = tool === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTool(t.id)}
                  style={{ animationDelay: `${i * 30}ms` }}
                  className={`relative px-3 py-2 rounded-xl flex flex-col items-center gap-0.5 min-w-[76px] tilt-press animate-rise transition ${
                    active
                      ? "bg-primary/15 ring-1 ring-primary/40 glow-gold"
                      : "hover:bg-white/5"
                  }`}
                >
                  {t.badge && (
                    <span className="absolute -top-1 right-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-[oklch(0.82_0.15_215)] text-black">
                      {t.badge}
                    </span>
                  )}
                  <t.icon className={`size-5 ${active ? "text-primary" : t.accent ? "text-[oklch(0.7_0.25_340)]" : "text-foreground"}`} />
                  <span className={`text-[10px] ${active ? "text-primary font-semibold" : "text-muted-foreground"}`}>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Quick({
  icon: Icon, label, sub, highlight, onClick,
}: { icon: typeof Volume2; label: string; sub?: string; highlight?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-xl tilt-press flex flex-col items-center gap-0.5 min-w-[72px] ${
        highlight ? "bg-[oklch(0.82_0.15_215_/_0.15)] ring-1 ring-[oklch(0.82_0.15_215_/_0.4)]" : "glass"
      }`}
    >
      <Icon className={`size-4 ${highlight ? "text-[oklch(0.82_0.15_215)]" : ""}`} />
      <span className="text-[10px] font-semibold leading-tight">{label}</span>
      {sub && <span className="text-[9px] text-muted-foreground leading-tight">{sub}</span>}
    </button>
  );
}

function Track({
  children, tone, label, emptyLabel, onAdd,
}: {
  children: React.ReactNode;
  tone: "primary" | "cyan" | "magenta";
  label?: string;
  emptyLabel?: string;
  onAdd?: () => void;
}) {
  const ring =
    tone === "primary" ? "ring-primary/30" :
    tone === "cyan" ? "ring-[oklch(0.82_0.15_215_/_0.3)]" :
    "ring-[oklch(0.7_0.25_340_/_0.3)]";
  return (
    <div className="flex items-center gap-2">
      {label && (
        <div className={`w-12 shrink-0 text-[9px] tracking-[0.18em] text-muted-foreground text-right`}>
          {label.toUpperCase()}
        </div>
      )}
      <div className={`relative flex-1 h-12 rounded-xl bg-white/5 ring-1 ${ring} overflow-hidden`}>
        {children}
      </div>
      {onAdd && (
        <button
          onClick={onAdd}
          className="shrink-0 px-2 py-1 rounded-lg text-[10px] glass border border-white/10 hover:bg-white/5"
        >
          {emptyLabel}
        </button>
      )}
    </div>
  );
}

function Slider({ label, value, min, max, suffix }: { label: string; value: number; min: number; max: number; suffix: string }) {
  const [v, setV] = useState(value);
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums font-semibold">{v}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={(max - min) / 100}
        value={v}
        onChange={(e) => setV(Number(e.target.value))}
        className="w-full accent-[oklch(0.82_0.16_85)]"
      />
    </div>
  );
}
