import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { treyIGenerate } from "@/lib/trey-i/vertex.server";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, ChevronDown, Upload, Download, Maximize2, Camera, SkipBack, Play, Pause,
  SkipForward, Undo2, Redo2, MoreHorizontal, Eye, Plus, ZoomIn, ZoomOut, Magnet,
  Scissors, Music2, Type, Sparkles, Layers, Captions, SlidersHorizontal, Wand2,
  Crown, Lock, X, Trash2, Gauge, Shuffle, ScissorsLineDashed, Image as ImageIcon,
  Hash, Lightbulb, MicVocal, Tag, FileText, Film, Clapperboard, Calendar,
  Loader2, CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { posts } from "@/lib/mock-data";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useGoBack } from "@/hooks/use-go-back";
import { useCloudflareUpload } from "@/hooks/use-cloudflare-upload";
import { useEditorRecipe } from "@/lib/creator-studio/useEditorRecipe";
import { previewFromRecipe, filterToCss } from "@/lib/creator-studio/preview";
import { createRecipe, recipeDuration, clipLength, findClip, type Clip, type TrackKind } from "@/lib/creator-studio/editRecipe";
import { useSupabaseSession } from "@/lib/supabase-session";
import { submitRender, getRenderStatus } from "@/lib/creator-studio/render.server";

type RenderPhase = "idle" | "submitting" | "rendering" | "done" | "error";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const editor = useEditorRecipe(null);
  const recipe = editor.recipe;
  const { session } = useSupabaseSession();

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
  const duration = recipe ? recipeDuration(recipe) : 0;

  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string>("edit");
  const [snap, setSnap] = useState(true);
  const [zoom, setZoom] = useState(1);

  // Derived, recipe-backed preview state.
  const preview = recipe ? previewFromRecipe(recipe, time) : null;
  const activeFilterCss = preview?.video ? filterToCss(preview.video.clip.filter) : "none";

  // Keep the real <video> playback rate in sync with the clip under the playhead.
  useEffect(() => {
    const v = videoRef.current;
    if (v && preview?.video) v.playbackRate = preview.video.clip.speed;
  }, [preview?.video?.clip.id, preview?.video?.clip.speed]);

  const seekTo = (t: number) => {
    const clamped = Math.max(0, duration ? Math.min(duration, t) : t);
    const v = videoRef.current;
    if (v) v.currentTime = clamped;
    setTime(clamped);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) { setPlaying((p) => !p); return; }
    if (v.paused) { void v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };

  // Timeline tracks, rendered in a fixed order but driven by the recipe.
  const trackOrder: { kind: TrackKind; label: string; icon: typeof Type; tone?: "purple" | "gold" | "cyan" | "magenta" }[] = [
    { kind: "video", label: "Video", icon: Clapperboard },
    { kind: "overlay", label: "Overlay", icon: Layers, tone: "purple" },
    { kind: "text", label: "Text", icon: Type, tone: "gold" },
    { kind: "audio", label: "Audio", icon: Music2, tone: "cyan" },
    { kind: "caption", label: "Captions", icon: Captions, tone: "magenta" },
  ];

  const clipLabel = (clip: Clip): string => {
    if (clip.kind === "video") return `${clipLength(clip).toFixed(1)}s`;
    if (clip.kind === "text" || clip.kind === "caption") return clip.text;
    if (clip.kind === "overlay") return "Overlay";
    return "Audio";
  };

  const addLayer = (kind: TrackKind) => {
    if (!recipe) { toast("Upload media to start a timeline"); return; }
    if (kind === "text") editor.addText({ text: "Trey TV", start: time, length: 3 });
    else if (kind === "overlay") editor.addOverlay({ src: posts[0].media, start: time, length: 3 });
    else if (kind === "audio") editor.addAudio({ src: posts[0].media, start: 0, length: Math.min(10, duration || 10) });
    else if (kind === "caption") editor.addCaption({ text: "New caption", start: time, length: 3 });
  };

  const runClipAction = (action: string) => {
    if (!selectedClip || !recipe) return;
    const found = findClip(recipe, selectedClip);
    if (!found) { setSelectedClip(null); return; }
    const { clip } = found;
    const id = selectedClip;
    switch (action) {
      case "split":
        editor.split(id, time);
        break;
      case "trim":
        if (clip.kind === "video") {
          const srcAtPlayhead = clip.trimIn + Math.max(0.1, time - clip.start) * clip.speed;
          editor.trim(id, { trimOut: srcAtPlayhead });
          toast("Trimmed to playhead");
        }
        break;
      case "speed":
        if (clip.kind === "video") {
          const order = [1, 1.5, 2, 0.5];
          const next = order[(order.indexOf(clip.speed) + 1) % order.length] ?? 1;
          editor.setSpeed(id, next);
          toast(`Speed ${next}x`);
        }
        break;
      case "trans":
        editor.setTransition(id, "in", "fade");
        toast("Fade transition added");
        break;
      case "effects":
        editor.toggleEffect(id, "zoomIn");
        break;
      case "delete":
        editor.remove(id);
        setSelectedClip(null);
        break;
    }
  };

  const [showAI, setShowAI] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showRender, setShowRender] = useState(false);
  const [renderPhase, setRenderPhase] = useState<RenderPhase>("idle");
  const [renderUrl, setRenderUrl] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
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

  const handleRender = async () => {
    if (!recipe) { toast("Upload media to render"); return; }
    const token = session?.access_token;
    if (!token) { toast.error("Sign in to render"); return; }
    setShowRender(true);
    setRenderPhase("submitting");
    setRenderUrl(null);
    setRenderError(null);
    try {
      const sub = await submitRender({ data: { accessToken: token, recipe } });
      if (!sub.ok) { setRenderPhase("error"); setRenderError(sub.error); return; }
      setRenderPhase("rendering");
      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        const st = await getRenderStatus({ data: { accessToken: token, renderId: sub.renderId } });
        if (!st.ok) { setRenderPhase("error"); setRenderError(st.error); return; }
        if (st.status === "done") { setRenderPhase("done"); setRenderUrl(st.url); return; }
        if (st.status === "failed") { setRenderPhase("error"); setRenderError("Render failed"); return; }
      }
      setRenderPhase("error");
      setRenderError("Render timed out");
    } catch (e) {
      setRenderPhase("error");
      setRenderError((e as Error).message || "Render error");
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
              onClick={handleRender}
              disabled={!recipe}
              className="px-3 md:px-4 py-2 rounded-xl text-sm font-bold glass border border-primary/40 text-primary hover:bg-primary/10 tilt-press flex items-center gap-1.5 whitespace-nowrap disabled:opacity-40"
            >
              <Wand2 className="size-4" /> <span className="hidden sm:inline">Render</span>
            </button>
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
                  <video
                    ref={videoRef}
                    src={mediaUrl}
                    className="absolute inset-0 size-full object-cover"
                    style={{ filter: activeFilterCss }}
                    playsInline
                    onLoadedMetadata={(e) => {
                      if (!recipe) {
                        editor.init(createRecipe({
                          streamUid,
                          srcUrl: mediaUrl,
                          width: e.currentTarget.videoWidth || 1920,
                          height: e.currentTarget.videoHeight || 1080,
                          fps: 30,
                          duration: e.currentTarget.duration || 10,
                        }));
                      }
                    }}
                    onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
                    onEnded={() => setPlaying(false)}
                  />
                ) : (
                  <img src={mediaUrl ?? posts[0].media} className="absolute inset-0 size-full object-cover" alt="" style={{ filter: activeFilterCss }} />
                )}
                {/* Live preview overlays (approximate; the render is authoritative) */}
                {preview?.overlays.map((o) => (
                  <img
                    key={o.id}
                    src={o.src}
                    alt=""
                    className="absolute pointer-events-none"
                    style={{ left: `${o.x * 100}%`, top: `${o.y * 100}%`, transform: `translate(-50%,-50%) scale(${o.scale})`, opacity: o.opacity, maxWidth: "60%" }}
                  />
                ))}
                {preview?.texts.map((tx) => (
                  <div
                    key={tx.id}
                    className="absolute pointer-events-none font-black drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                    style={{ left: `${tx.x * 100}%`, top: `${tx.y * 100}%`, transform: "translate(-50%,-50%)", color: tx.color, opacity: tx.opacity, fontSize: `clamp(14px, ${tx.size / 12}px, ${tx.size}px)`, background: tx.background ?? "transparent", padding: tx.background ? "2px 10px" : 0, borderRadius: tx.background ? 8 : 0 }}
                  >
                    {tx.text}
                  </div>
                ))}
                {preview && preview.captions.length > 0 && (
                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-3 py-1 rounded-md bg-black/60 text-white text-sm font-semibold text-center max-w-[80%] pointer-events-none">
                    {preview.captions.map((c) => c.text).join(" ")}
                  </div>
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
            <CtrlBtn icon={Maximize2} onClick={() => { void videoRef.current?.requestFullscreen?.().catch(() => toast("Fullscreen unavailable")); }} />
            <CtrlBtn icon={Camera} onClick={() => toast("Snapshot saved")} />
          </div>
          <div className="flex items-center gap-1.5">
            <CtrlBtn icon={SkipBack} onClick={() => seekTo((videoRef.current?.currentTime ?? time) - 1)} />
            <button
              onClick={togglePlay}
              className="size-11 grid place-items-center rounded-full bg-primary text-primary-foreground glow-gold tilt-press"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current ml-0.5" />}
            </button>
            <CtrlBtn icon={SkipForward} onClick={() => seekTo((videoRef.current?.currentTime ?? time) + 1)} />
          </div>
          <div className="flex items-center gap-1.5">
            <CtrlBtn icon={Undo2} onClick={editor.undo} />
            <CtrlBtn icon={Redo2} onClick={editor.redo} />
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

              {/* Playhead (real time) */}
              <div
                className="absolute top-5 bottom-0 w-px bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] z-10 pointer-events-none"
                style={{ left: `${duration ? Math.min(100, (time / duration) * 100) : 0}%` }}
              >
                <span className="absolute -top-1 -left-[3px] size-2 rounded-full bg-primary glow-gold" />
              </div>

              {/* Tracks (recipe-driven) */}
              {trackOrder.map(({ kind, label, icon, tone }) => {
                const track = recipe?.tracks.find((t) => t.kind === kind);
                return (
                  <Track
                    key={kind}
                    label={label}
                    icon={icon}
                    tone={tone}
                    onAdd={kind === "video" ? onPickFile : () => addLayer(kind)}
                  >
                    {track?.clips.map((clip) => {
                      const w = duration ? Math.max(40, (clipLength(clip) / duration) * 600 * zoom) : 96;
                      const isSel = selectedClip === clip.id;
                      const toneClass =
                        kind === "overlay" ? "bg-gradient-to-r from-[oklch(0.65_0.22_300_/_0.4)] to-[oklch(0.7_0.25_340_/_0.4)] text-purple-100" :
                        kind === "text" ? "bg-primary/10 text-primary" :
                        kind === "audio" ? "bg-[oklch(0.82_0.15_215_/_0.14)] text-[oklch(0.82_0.15_215)]" :
                        kind === "caption" ? "bg-[oklch(0.7_0.25_340_/_0.2)] text-[oklch(0.7_0.25_340)]" : "";
                      return (
                        <button
                          key={clip.id}
                          onClick={() => setSelectedClip(clip.id)}
                          style={{ width: `${w}px` }}
                          className={`relative h-full shrink-0 rounded-md overflow-hidden ring-1 transition flex items-center justify-center px-1 text-[10px] font-semibold ${toneClass} ${
                            isSel ? "ring-primary glow-gold scale-[1.02]" : "ring-white/15"
                          }`}
                        >
                          {clip.kind === "video" && mediaUrl && (
                            <img src={mediaUrl} className="absolute inset-0 size-full object-cover opacity-90" alt="" />
                          )}
                          <span className="relative truncate max-w-full">{clipLabel(clip)}</span>
                        </button>
                      );
                    })}
                  </Track>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => toast.info("Tap the '+' button on any track to add that layer type")}
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
                  onClick={() => runClipAction(a.id)}
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
      <Dialog open={showRender} onOpenChange={setShowRender}>
        <DialogContent className="glass-strong border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gradient-gold">
              <Wand2 className="size-5 text-primary" /> Cloud Render
            </DialogTitle>
            <DialogDescription>Your edit recipe is rendered in the cloud, then ready to publish.</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            {(renderPhase === "submitting" || renderPhase === "rendering") && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="size-5 text-primary animate-spin" />
                {renderPhase === "submitting" ? "Submitting render…" : "Rendering your video…"}
              </div>
            )}
            {renderPhase === "done" && renderUrl && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <CheckCircle2 className="size-5" /> Render complete
                </div>
                <video src={renderUrl} controls playsInline className="w-full rounded-xl border border-white/10" />
                <a
                  href={renderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-center px-4 py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold"
                >
                  Open rendered video
                </a>
              </div>
            )}
            {renderPhase === "error" && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">
                <div className="font-semibold text-destructive">Render failed</div>
                <div className="text-xs text-muted-foreground mt-1 break-words">{renderError}</div>
                <button onClick={handleRender} className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground">
                  Retry
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
