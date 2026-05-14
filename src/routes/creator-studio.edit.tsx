import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { treyIGenerate } from "@/lib/trey-i/vertex.server";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, ChevronDown, Upload, Download, Maximize2, Camera, SkipBack, Play, Pause,
  SkipForward, Undo2, Redo2, MoreHorizontal, Eye, Plus, ZoomIn, ZoomOut, Magnet,
  Scissors, Music2, Type, Sparkles, Layers, Captions, SlidersHorizontal, Wand2,
  Crown, Lock, X, Trash2, Gauge, Shuffle, ScissorsLineDashed, Image as ImageIcon,
  Hash, Lightbulb, MicVocal, Tag, FileText, Film, Clapperboard, Calendar,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { posts } from "@/lib/mock-data";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useGoBack } from "@/hooks/use-go-back";
import { useCloudflareUpload } from "@/hooks/use-cloudflare-upload";

export const Route = createFileRoute("/creator-studio/edit")({
  component: CreatorStudioEdit,
  head: () => ({
    meta: [
      { title: "Creator Edit Studio — Trey TV" },
      { name: "description", content: "Cinematic mobile-first editor for Trey TV creators." },
    ],
  }),
});

type UploadState = "empty" | "uploading" | "processing" | "ready" | "error";

const TOOLS = [
  { id: "edit", label: "Edit", icon: Scissors },
  { id: "audio", label: "Audio", icon: Music2 },
  { id: "text", label: "Text", icon: Type },
  { id: "effects", label: "Effects", icon: Sparkles },
  { id: "overlay", label: "Overlay", icon: Layers },
  { id: "captions", label: "Captions", icon: Captions },
  { id: "filters", label: "Filters", icon: SlidersHorizontal },
  { id: "adjust", label: "Adjust", icon: SlidersHorizontal },
] as const;

const AI_ACTIONS = [
  { id: "captions", label: "Generate Captions", icon: Captions },
  { id: "title", label: "Suggest Title", icon: Lightbulb },
  { id: "desc", label: "Suggest Description", icon: FileText },
  { id: "hashtags", label: "Create Hashtags", icon: Hash },
  { id: "thumb", label: "Thumbnail Ideas", icon: ImageIcon },
  { id: "hook", label: "Improve Hook", icon: Sparkles },
  { id: "highlights", label: "Auto-cut Highlights", icon: ScissorsLineDashed },
  { id: "music", label: "Music Mood", icon: MicVocal },
  { id: "promo", label: "Promo Caption", icon: Tag },
  { id: "score", label: "Score Readiness", icon: Gauge },
];

function CreatorStudioEdit() {
  const { isGuest, isCreator } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isGuest) navigate({ to: "/login" });
  }, [isGuest, navigate]);

  if (isGuest) return null;
  if (!isCreator) return <CreatorLockedScreen />;

  return <Studio />;
}

function CreatorLockedScreen() {
  const navigate = useNavigate();
  return (
    <main className="min-h-dvh grid place-items-center px-6 bg-background">
      <div className="relative max-w-md w-full rounded-3xl glass neon-border p-8 text-center overflow-hidden">
        <div className="absolute -top-20 -right-20 size-56 rounded-full bg-[radial-gradient(circle,oklch(0.7_0.25_340_/_0.35),transparent_70%)] blur-2xl" />
        <div className="absolute -bottom-20 -left-20 size-56 rounded-full bg-[radial-gradient(circle,oklch(0.65_0.22_300_/_0.3),transparent_70%)] blur-2xl" />
        <div className="relative">
          <div className="mx-auto size-16 rounded-2xl glass grid place-items-center glow-gold mb-4">
            <Lock className="size-7 text-primary" />
          </div>
          <div className="text-[10px] tracking-[0.3em] text-primary mb-1 flex items-center justify-center gap-2">
            <Crown className="size-3.5" /> CREATOR ACCESS
          </div>
          <h1 className="text-2xl font-bold text-gradient-gold">Studio is creator-only</h1>
          <p className="text-sm text-muted-foreground mt-2">
            The Creator Edit Studio is unlocked for approved Trey TV creators and admins. Apply to join the network and get access to the full cinematic editor.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => navigate({ to: "/apply/content-creator" })}
              className="px-4 py-3 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold tilt-press hover-lift"
            >
              Apply to become a Creator
            </button>
            <button
              onClick={() => navigate({ to: "/creator-hub" })}
              className="px-4 py-3 rounded-xl text-sm font-semibold glass border border-white/10 hover:bg-white/5"
            >
              Back to Creator Hub
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Studio() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const goBack = useGoBack("/creator-hub");
  const { requestUpload, uploadFile } = useCloudflareUpload();

  const [projectName, setProjectName] = useState("Untitled Episode");
  const [showProjects, setShowProjects] = useState(false);
  const [quality, setQuality] = useState("AI UHD");
  const [showQuality, setShowQuality] = useState(false);

  const [uploadState, setUploadState] = useState<UploadState>("empty");
  const [progress, setProgress] = useState(0);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [streamUid, setStreamUid] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);

  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const duration = 45;

  const [selectedClip, setSelectedClip] = useState<string | null>("v1");
  const [activeTool, setActiveTool] = useState<string>("edit");
  const [snap, setSnap] = useState(true);
  const [zoom, setZoom] = useState(1);

  const [showAI, setShowAI] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [aiOutput, setAiOutput] = useState("");
  const [aiOutputLabel, setAiOutputLabel] = useState("");
  const [aiOutputBusy, setAiOutputBusy] = useState(false);

  type AiActionId = typeof AI_ACTIONS[number]["id"];
  const AI_TEXT_TASKS: Partial<Record<AiActionId, Parameters<typeof treyIGenerate>[0]["data"]["task"]>> = {
    captions: "caption",
    title: "title",
    desc: "description",
    hashtags: "hashtags",
    hook: "hook",
    promo: "promo_caption",
  };

  const handleAiAction = async (id: AiActionId, label: string) => {
    const task = AI_TEXT_TASKS[id];
    if (!task) { toast.success(`${label} queued`); return; }
    setAiOutput("");
    setAiOutputLabel(label);
    setAiOutputBusy(true);
    try {
      const result = await treyIGenerate({ data: { task, prompt: `Generate ${label.toLowerCase()} for a Trey TV creator episode` } });
      setAiOutput("text" in result ? result.text : "");
      if ("error" in result) toast.error("Trey-I couldn't generate that right now");
    } catch {
      toast.error("Trey-I couldn't generate that right now");
    } finally {
      setAiOutputBusy(false);
    }
  };

  const onPickFile = () => fileRef.current?.click();

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setUploadState("uploading");
    setProgress(0);
    setStreamUid(null);
    setDraftId(null);

    const result = await requestUpload();
    if (!result) {
      setUploadState("error");
      return;
    }

    setStreamUid(result.uid);
    setDraftId(result.draftId);

    const ok = await uploadFile(file, result.uploadURL, setProgress);
    if (!ok) {
      setUploadState("error");
      return;
    }

    setUploadState("processing");
    window.setTimeout(() => {
      try {
        setMediaUrl(URL.createObjectURL(file));
      } catch {
        setMediaUrl(posts[0].media);
      }
      setUploadState("ready");
      toast.success("Media ready to edit");
    }, 700);
  };

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <input
        ref={fileRef}
        type="file"
        accept="video/*,image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 px-3 md:px-5 pt-3 pb-2 backdrop-blur-xl bg-background/60 border-b border-white/5">
        <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
          <button
            onClick={goBack}
            className="size-10 shrink-0 grid place-items-center rounded-xl glass tilt-press hover:bg-white/5"
            aria-label="Back"
          >
            <ArrowLeft className="size-5" />
          </button>

          <div className="order-3 md:order-none w-full md:w-auto md:flex-1 min-w-0 flex items-center md:justify-center gap-2">
            <span className="hidden md:block text-[10px] tracking-[0.35em] text-gradient-gold font-bold whitespace-nowrap">
              CREATOR EDIT STUDIO
            </span>
            <div className="relative min-w-0 flex-1 md:flex-none">
              <button
                onClick={() => setShowProjects((s) => !s)}
                className="w-full md:w-auto px-3 py-1.5 rounded-lg glass border border-white/10 text-xs font-semibold flex items-center gap-1.5 md:max-w-[200px]"
              >
                <span className="size-1.5 shrink-0 rounded-full bg-primary animate-glow-pulse" />
                <span className="truncate">{projectName}</span>
                <ChevronDown className={`size-3.5 shrink-0 transition-transform ${showProjects ? "rotate-180" : ""}`} />
              </button>
              {showProjects && (
                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 top-full mt-2 w-56 rounded-xl glass-strong border border-white/10 shadow-2xl p-1 z-30 animate-scale-in">
                  {["Untitled Episode", "New Trey TV Upload", "Late Night · S2 E14", "Studio Sessions Promo"].map((n) => (
                    <button
                      key={n}
                      onClick={() => { setProjectName(n); setShowProjects(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white/5 ${projectName === n ? "text-primary font-semibold" : ""}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2 shrink-0">
            <div className="relative">
              <button
                onClick={() => setShowQuality((s) => !s)}
                className="px-2.5 py-2 rounded-xl text-xs font-semibold glass border border-white/10 flex items-center gap-1"
              >
                <Sparkles className="size-3.5 text-primary" />
                {quality}
                <ChevronDown className={`size-3.5 transition-transform ${showQuality ? "rotate-180" : ""}`} />
              </button>
              {showQuality && (
                <div className="absolute right-0 top-full mt-2 w-36 rounded-xl glass-strong border border-white/10 shadow-2xl p-1 z-30 animate-scale-in">
                  {["AI UHD", "4K", "1080p", "720p"].map((q) => (
                    <button
                      key={q}
                      onClick={() => { setQuality(q); setShowQuality(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white/5 ${quality === q ? "text-primary font-semibold" : ""}`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => navigate({ to: "/creator-studio/submit", search: { id: draftId ?? undefined } as any })}
              className="px-3 md:px-5 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold tilt-press hover-lift flex items-center gap-1.5 whitespace-nowrap"
            >
              <Download className="size-4" /> <span className="hidden sm:inline">Next:</span> Details
            </button>
          </div>
        </div>
      </header>

      <div className="px-3 md:px-5 py-4 space-y-4 pb-[260px]">
        {/* Preview */}
        <section className="relative rounded-3xl glass neon-border overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.2_0.1_300_/_0.4),transparent_60%)] pointer-events-none" />
          <div className="relative aspect-video md:aspect-[16/9] w-full">
            {uploadState === "empty" && (
              <button
                onClick={onPickFile}
                className="absolute inset-3 rounded-2xl border-2 border-dashed border-white/15 hover:border-primary/60 transition flex flex-col items-center justify-center gap-3 text-center px-6 group"
              >
                <div className="size-14 rounded-2xl glass grid place-items-center glow-gold group-hover:scale-110 transition">
                  <Upload className="size-6 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Upload your episode, clip, or promo to start editing</div>
                  <div className="text-xs text-muted-foreground mt-1">MP4 · MOV · HEVC · up to 4K</div>
                </div>
                <span className="mt-1 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground glow-gold">
                  Select Media
                </span>
              </button>
            )}
            {uploadState === "uploading" && (
              <div className="absolute inset-0 grid place-items-center text-center px-6">
                <div className="w-full max-w-xs">
                  <div className="text-xs tracking-[0.3em] text-primary mb-2">UPLOADING</div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary via-[oklch(0.7_0.25_340)] to-[oklch(0.65_0.22_300)] transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 tabular-nums">{progress}%</div>
                </div>
              </div>
            )}
            {uploadState === "processing" && (
              <div className="absolute inset-0 grid place-items-center">
                <div className="px-4 py-3 rounded-xl glass-strong border border-white/10 flex items-center gap-2 text-sm shimmer-sweep">
                  <Sparkles className="size-4 text-primary animate-spin [animation-duration:2s]" /> Processing media…
                </div>
              </div>
            )}
            {uploadState === "error" && (
              <div className="absolute inset-0 grid place-items-center px-6 text-center">
                <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 max-w-xs">
                  <div className="text-sm font-semibold text-destructive">Upload failed</div>
                  <button onClick={onPickFile} className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground">Retry</button>
                </div>
              </div>
            )}
            {uploadState === "ready" && (
              <>
                {mediaUrl?.startsWith("blob:") ? (
                  <video src={mediaUrl} className="absolute inset-0 size-full object-cover" muted={!playing} loop playsInline autoPlay={playing} />
                ) : (
                  <img src={mediaUrl ?? posts[0].media} className="absolute inset-0 size-full object-cover" alt="" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-[oklch(0.65_0.22_300_/_0.3)] border border-[oklch(0.65_0.22_300_/_0.6)] text-white">4K</span>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-white/10 border border-white/20">HDR</span>
                </div>
                <div className="absolute top-3 right-3 px-2 py-1 rounded-md text-[11px] tabular-nums glass border border-white/10">
                  <span className="text-primary font-semibold">{fmt(time)}</span>
                  <span className="text-muted-foreground"> / {fmt(duration)}</span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Playback controls */}
        <section className="flex items-center justify-between gap-2 rounded-2xl glass border border-white/10 p-2">
          <div className="flex items-center gap-1.5">
            <CtrlBtn icon={Maximize2} onClick={() => toast("Fullscreen")} />
            <CtrlBtn icon={Camera} onClick={() => toast("Snapshot saved")} />
          </div>
          <div className="flex items-center gap-1.5">
            <CtrlBtn icon={SkipBack} onClick={() => setTime((t) => Math.max(0, t - 1))} />
            <button
              onClick={() => setPlaying((p) => !p)}
              className="size-11 grid place-items-center rounded-full bg-primary text-primary-foreground glow-gold tilt-press"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current ml-0.5" />}
            </button>
            <CtrlBtn icon={SkipForward} onClick={() => setTime((t) => Math.min(duration, t + 1))} />
          </div>
          <div className="flex items-center gap-1.5">
            <CtrlBtn icon={Undo2} onClick={() => toast("Undo")} />
            <CtrlBtn icon={Redo2} onClick={() => toast("Redo")} />
            <CtrlBtn icon={MoreHorizontal} onClick={() => toast("More options")} />
          </div>
        </section>

        {/* Timeline */}
        <section className="rounded-3xl glass neon-border p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs tabular-nums">
              <span className="text-primary font-semibold">{fmt(time)}</span>
              <span className="text-muted-foreground"> / {fmt(duration)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSnap((s) => !s)}
                className={`px-2 py-1 rounded-md text-[10px] font-semibold flex items-center gap-1 border ${snap ? "border-primary text-primary glow-gold" : "border-white/10 text-muted-foreground"}`}
              >
                <Magnet className="size-3" /> Snap
              </button>
              <CtrlBtn icon={ZoomOut} onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} small />
              <CtrlBtn icon={ZoomIn} onClick={() => setZoom((z) => Math.min(2, z + 0.25))} small />
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <div className="relative" style={{ width: `${600 * zoom}px` }}>
              {/* Ruler */}
              <div className="relative h-5 border-b border-white/5 mb-2">
                <div className="absolute inset-0 flex justify-between text-[10px] text-muted-foreground tabular-nums px-1">
                  {[0, 12, 14, 16, 18, 20].map((t) => (
                    <span key={t}>00:{String(t).padStart(2, "0")}</span>
                  ))}
                </div>
              </div>

              {/* Playhead */}
              <div className="absolute top-5 bottom-0 left-[40%] w-px bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] z-10 pointer-events-none">
                <span className="absolute -top-1 -left-[3px] size-2 rounded-full bg-primary glow-gold" />
              </div>

              {/* Tracks */}
              <Track label="Video" icon={Clapperboard} onAdd={() => toast("Add clip")}>
                {[posts[0].media, posts[1].media, posts[2].media, posts[0].media].map((m, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedClip(`v${i}`)}
                    className={`relative h-full w-24 shrink-0 rounded-md overflow-hidden ring-1 transition ${
                      selectedClip === `v${i}` ? "ring-primary glow-gold scale-[1.02]" : "ring-white/10"
                    }`}
                  >
                    <img src={m} className="absolute inset-0 size-full object-cover" alt="" />
                    {selectedClip === `v${i}` && (
                      <span className="absolute bottom-0.5 left-1 text-[9px] font-bold text-primary">8.6s</span>
                    )}
                  </button>
                ))}
              </Track>

              <Track label="Overlay" icon={Layers} tone="purple">
                <div className="h-full flex-1 rounded-md bg-gradient-to-r from-[oklch(0.65_0.22_300_/_0.4)] to-[oklch(0.7_0.25_340_/_0.4)] ring-1 ring-[oklch(0.65_0.22_300_/_0.5)] flex items-center px-3 text-[11px] font-semibold gap-1.5">
                  <Sparkles className="size-3" /> Neon Glow
                </div>
              </Track>

              <Track label="Text" icon={Type} tone="gold">
                <div className="h-full flex-1 rounded-md bg-primary/10 ring-1 ring-primary/40 flex items-center px-3 text-[11px] font-semibold text-primary gap-1.5">
                  <Type className="size-3" /> Trey TV
                </div>
              </Track>

              <Track label="Audio" icon={Music2} tone="cyan">
                <div className="h-full flex-1 rounded-md bg-[oklch(0.82_0.15_215_/_0.12)] ring-1 ring-[oklch(0.82_0.15_215_/_0.4)] flex items-center px-2 gap-px overflow-hidden">
                  {Array.from({ length: 80 }).map((_, i) => (
                    <span
                      key={i}
                      className="flex-1 bg-[oklch(0.82_0.15_215)] rounded-full opacity-80"
                      style={{ height: `${20 + Math.sin(i * 0.5) * 25 + Math.random() * 25}%` }}
                    />
                  ))}
                </div>
              </Track>

              <Track label="Captions" icon={Captions} tone="magenta">
                <div className="h-full flex items-center gap-1">
                  {["CC", "CC", "CC"].map((c, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-[oklch(0.7_0.25_340_/_0.2)] border border-[oklch(0.7_0.25_340_/_0.5)] text-[10px] font-bold text-[oklch(0.7_0.25_340)]">
                      {c}
                    </span>
                  ))}
                </div>
              </Track>
            </div>
          </div>

          <button
            onClick={() => toast("Add new layer")}
            className="mt-3 w-full py-2 rounded-xl border border-dashed border-white/15 text-xs text-muted-foreground hover:bg-white/5 hover:text-foreground transition flex items-center justify-center gap-1"
          >
            <Plus className="size-3.5" /> Add layer
          </button>
        </section>

        {/* Clip action bar */}
        {selectedClip && (
          <section className="rounded-2xl glass border border-white/10 p-2 overflow-x-auto no-scrollbar animate-fade-in">
            <div className="flex items-center justify-around gap-1 min-w-max px-2">
              {[
                { id: "split", label: "Split", icon: Scissors },
                { id: "trim", label: "Trim", icon: ScissorsLineDashed },
                { id: "speed", label: "Speed", icon: Gauge },
                { id: "trans", label: "Transitions", icon: Shuffle },
                { id: "effects", label: "Effects", icon: Sparkles },
                { id: "delete", label: "Delete", icon: Trash2, danger: true },
              ].map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    if (a.id === "delete") setSelectedClip(null);
                    toast(a.label);
                  }}
                  className={`px-3 py-2 rounded-xl flex flex-col items-center gap-0.5 min-w-[64px] tilt-press hover:bg-white/5 ${
                    a.danger ? "hover:bg-destructive/10" : ""
                  }`}
                >
                  <a.icon className={`size-4 ${a.danger ? "text-destructive" : ""}`} />
                  <span className="text-[10px]">{a.label}</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Tool dock — sticky bottom */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 px-3 pb-3 pt-2 bg-gradient-to-t from-background via-background/95 to-transparent">
        <div className="rounded-3xl glass-strong border border-white/10 p-2 shadow-[0_20px_60px_-20px_oklch(0_0_0_/_0.7)] flex items-center gap-2">
          <div className="flex-1 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 min-w-max">
              {TOOLS.map((t) => {
                const active = activeTool === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTool(t.id)}
                    className={`px-3 py-2 rounded-xl flex flex-col items-center gap-0.5 min-w-[64px] tilt-press transition ${
                      active ? "bg-primary/15 ring-1 ring-primary/40 glow-gold" : "hover:bg-white/5"
                    }`}
                  >
                    <t.icon className={`size-5 ${active ? "text-primary" : "text-foreground"}`} />
                    <span className={`text-[10px] ${active ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          {/* AI Assist circular button */}
          <button
            onClick={() => setShowAI(true)}
            aria-label="AI Assist"
            className="relative shrink-0 size-14 rounded-full grid place-items-center bg-[radial-gradient(circle_at_30%_30%,oklch(0.82_0.16_85),oklch(0.65_0.22_300)_60%,oklch(0.7_0.25_340))] text-primary-foreground shadow-[0_0_24px_oklch(0.82_0.16_85_/_0.6),0_0_40px_oklch(0.65_0.22_300_/_0.4)] tilt-press hover:scale-105 transition"
          >
            <span className="absolute inset-0 rounded-full ring-2 ring-white/30 animate-glow-pulse" />
            <Wand2 className="size-6 relative" />
            <span className="absolute -bottom-1 text-[8px] font-bold tracking-[0.15em] text-primary-foreground/0">AI</span>
          </button>
        </div>
      </nav>

      {/* AI Assist drawer */}
      <Sheet open={showAI} onOpenChange={setShowAI}>
        <SheetContent side="bottom" className="glass-strong border-t border-white/10 max-h-[85vh] overflow-y-auto">
          <SheetHeader className="text-left">
            <SheetTitle className="flex items-center gap-2 text-gradient-gold">
              <Wand2 className="size-5 text-primary" /> Trey-I Assist
            </SheetTitle>
            <SheetDescription>Premium AI tools for your upload. Tap any action to run it.</SheetDescription>
          </SheetHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
            {AI_ACTIONS.map((a) => (
              <button
                key={a.id}
                onClick={() => handleAiAction(a.id, a.label)}
                disabled={aiOutputBusy}
                className="group rounded-2xl glass neon-border p-4 text-left hover-lift tilt-press relative overflow-hidden disabled:opacity-50"
              >
                <div className="size-10 rounded-xl bg-white/5 grid place-items-center group-hover:scale-110 transition">
                  <a.icon className="size-5 text-primary" />
                </div>
                <div className="mt-3 text-sm font-semibold">{a.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Trey-I</div>
              </button>
            ))}
          </div>

          {/* AI output result panel */}
          {(aiOutputBusy || aiOutput) && (
            <div className="mt-4 rounded-2xl glass border border-white/10 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[10px] tracking-[0.2em] text-primary">{aiOutputLabel.toUpperCase()}</div>
                {!aiOutputBusy && aiOutput && (
                  <button
                    onClick={() => { navigator.clipboard.writeText(aiOutput); toast.success("Copied"); }}
                    className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-0.5 rounded glass border border-white/10"
                  >
                    Copy
                  </button>
                )}
              </div>
              {aiOutputBusy ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
                  <Sparkles className="size-3 text-primary animate-pulse" /> Trey-I is generating…
                </div>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{aiOutput}</p>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Export panel */}
      <Dialog open={showExport} onOpenChange={setShowExport}>
        <DialogContent className="glass-strong border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gradient-gold">
              <Download className="size-5 text-primary" /> Export & Publish
            </DialogTitle>
            <DialogDescription>Configure your upload before publishing to Trey TV.</DialogDescription>
          </DialogHeader>
          <ExportForm onClose={() => setShowExport(false)} />
        </DialogContent>
      </Dialog>
    </main>
  );
}

function CtrlBtn({ icon: Icon, onClick, small }: { icon: typeof Play; onClick: () => void; small?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`${small ? "size-7" : "size-9"} grid place-items-center rounded-lg glass border border-white/10 hover:bg-white/5 tilt-press`}
    >
      <Icon className={small ? "size-3.5" : "size-4"} />
    </button>
  );
}

function Track({
  label, icon: Icon, tone, children, onAdd,
}: {
  label: string;
  icon: typeof Type;
  tone?: "purple" | "gold" | "cyan" | "magenta";
  children: React.ReactNode;
  onAdd?: () => void;
}) {
  const toneColor =
    tone === "purple" ? "text-[oklch(0.65_0.22_300)]" :
    tone === "gold" ? "text-primary" :
    tone === "cyan" ? "text-[oklch(0.82_0.15_215)]" :
    tone === "magenta" ? "text-[oklch(0.7_0.25_340)]" :
    "text-foreground";
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <div className="w-16 shrink-0 flex items-center gap-1.5">
        <Icon className={`size-3.5 ${toneColor}`} />
        <span className="text-[9px] tracking-[0.15em] text-muted-foreground uppercase">{label}</span>
        <Eye className="size-3 text-muted-foreground/60" />
      </div>
      <div className="relative flex-1 h-12 rounded-lg bg-white/5 ring-1 ring-white/10 overflow-hidden flex items-center gap-1 px-1">
        {children}
        {onAdd && (
          <button onClick={onAdd} className="size-8 shrink-0 grid place-items-center rounded-md bg-white/10 hover:bg-white/20">
            <Plus className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function ExportForm({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [show, setShow] = useState("late-night");
  const [ep, setEp] = useState("15");
  const [visibility, setVisibility] = useState<"draft" | "private" | "public">("public");
  const [quality, setQuality] = useState("AI UHD");
  const [thumb, setThumb] = useState(0);
  const [schedule, setSchedule] = useState("");

  const submit = () => {
    // TODO: wire to upload pipeline
    toast.success("Export queued — rendering in the cloud");
    onClose();
  };

  return (
    <div className="space-y-4 mt-2">
      <Field label="Title">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Late Night with Trey — S2 E15"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/60" />
      </Field>
      <Field label="Description">
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} placeholder="Tell your fans what's inside…"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/60 resize-none" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Show / Series">
          <select value={show} onChange={(e) => setShow(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/60">
            <option value="late-night">Late Night with Trey</option>
            <option value="studio">Studio Sessions</option>
            <option value="city">City After Dark</option>
          </select>
        </Field>
        <Field label="Episode #">
          <input value={ep} onChange={(e) => setEp(e.target.value)} type="number"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/60" />
        </Field>
      </div>
      <Field label="Visibility">
        <div className="grid grid-cols-3 gap-2">
          {(["draft", "private", "public"] as const).map((v) => (
            <button key={v} onClick={() => setVisibility(v)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize border transition ${
                visibility === v ? "bg-primary/15 border-primary text-primary glow-gold" : "border-white/10 hover:bg-white/5"
              }`}>{v}</button>
          ))}
        </div>
      </Field>
      <Field label="Quality">
        <div className="grid grid-cols-3 gap-2">
          {["HD", "4K", "AI UHD"].map((q) => (
            <button key={q} onClick={() => setQuality(q)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                quality === q ? "bg-primary/15 border-primary text-primary glow-gold" : "border-white/10 hover:bg-white/5"
              }`}>{q}</button>
          ))}
        </div>
      </Field>
      <Field label="Thumbnail">
        <div className="grid grid-cols-3 gap-2">
          {[posts[0].media, posts[1].media, posts[2].media].map((m, i) => (
            <button key={i} onClick={() => setThumb(i)}
              className={`relative aspect-video rounded-lg overflow-hidden ring-1 transition ${
                thumb === i ? "ring-primary glow-gold scale-[1.02]" : "ring-white/10"
              }`}>
              <img src={m} className="absolute inset-0 size-full object-cover" alt="" />
            </button>
          ))}
        </div>
      </Field>
      <Field label="Schedule (optional)">
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input type="datetime-local" value={schedule} onChange={(e) => setSchedule(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary/60" />
        </div>
      </Field>
      <div className="flex items-center gap-2 pt-2">
        <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold glass border border-white/10 hover:bg-white/5">
          Save Draft
        </button>
        <button onClick={submit} className="flex-1 px-4 py-3 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold tilt-press hover-lift flex items-center justify-center gap-2">
          <Film className="size-4" /> Publish
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase mb-1.5">{label}</div>
      {children}
    </label>
  );
}
