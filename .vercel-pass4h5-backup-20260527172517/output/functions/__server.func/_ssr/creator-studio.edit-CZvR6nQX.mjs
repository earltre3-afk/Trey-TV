import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { b as useAuth$1, v as posts, c as createBrowserClient, X as treyIGenerate } from "./router-BtgGywEC.mjs";
import { S as Sheet, a as SheetContent, b as SheetHeader, c as SheetTitle, d as SheetDescription } from "./sheet-CrRPJvha.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription } from "./dialog-Bvlih8gu.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useGoBack } from "./use-go-back-DIwqgoNo.mjs";
import { a as createServerFn, u as createSsrRpc } from "./index.mjs";
import "../_libs/react-dom.mjs";
import { i as Lock, t as Crown, A as ArrowLeft, ak as ChevronDown, S as Sparkles, bl as Download, an as Upload, c5 as Maximize2, b3 as Camera, c6 as SkipBack, aJ as Pause, a4 as Play, aH as SkipForward, c7 as Undo2, c8 as Redo2, aV as Ellipsis, c9 as Magnet, ca as ZoomOut, cb as ZoomIn, cc as Clapperboard, bI as Layers, cd as Type, bh as Music2, ce as Captions, P as Plus, cf as Scissors, cg as ScissorsLineDashed, ch as Gauge, bG as Shuffle, aF as Trash2, aQ as SlidersHorizontal, W as WandSparkles, ci as Lightbulb, F as FileText, cj as Hash, d as Image, b8 as MicVocal, ck as Tag, j as Eye, aY as Calendar, b7 as Film } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/tailwind-merge.mjs";
const validateDirectUploadInput = (input) => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : ""
});
const requestDirectUpload = createServerFn({
  method: "POST"
}).inputValidator(validateDirectUploadInput).handler(createSsrRpc("17b10bb5598753fba536d07e14923d7c22663af25668f440ba8ff661a0e5dd58"));
function getUploadErrorMessage(error) {
  if (!(error instanceof Error)) return "Upload failed";
  if (error.message === "Upload not configured") return "Upload not available";
  return error.message || "Upload failed";
}
function useCloudflareUpload() {
  const [requesting, setRequesting] = reactExports.useState(false);
  const [uploadingFile, setUploadingFile] = reactExports.useState(false);
  const [progress, setProgress] = reactExports.useState(0);
  const requestUpload = reactExports.useCallback(async () => {
    setRequesting(true);
    try {
      const supabase = createBrowserClient();
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Sign in required");
        return null;
      }
      return await requestDirectUpload({
        data: { accessToken: session.access_token }
      });
    } catch (error) {
      toast.error(getUploadErrorMessage(error));
      return null;
    } finally {
      setRequesting(false);
    }
  }, []);
  const uploadFile = reactExports.useCallback(
    (file, uploadURL, onProgress) => new Promise((resolve) => {
      setUploadingFile(true);
      setProgress(0);
      const xhr = new XMLHttpRequest();
      xhr.open("POST", uploadURL);
      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        const pct = Math.round(event.loaded / event.total * 100);
        setProgress(pct);
        onProgress?.(pct);
      };
      xhr.onload = () => {
        const ok = xhr.status >= 200 && xhr.status < 300;
        if (ok) {
          setProgress(100);
          onProgress?.(100);
        } else {
          toast.error("Upload failed");
        }
        setUploadingFile(false);
        resolve(ok);
      };
      xhr.onerror = () => {
        toast.error("Upload failed");
        setUploadingFile(false);
        resolve(false);
      };
      xhr.onabort = () => {
        toast.error("Upload cancelled");
        setUploadingFile(false);
        resolve(false);
      };
      const formData = new FormData();
      formData.append("file", file);
      xhr.send(formData);
    }),
    []
  );
  return {
    requestUpload,
    uploadFile,
    uploading: requesting || uploadingFile,
    progress
  };
}
const TOOLS = [{
  id: "edit",
  label: "Edit",
  icon: Scissors
}, {
  id: "audio",
  label: "Audio",
  icon: Music2
}, {
  id: "text",
  label: "Text",
  icon: Type
}, {
  id: "effects",
  label: "Effects",
  icon: Sparkles
}, {
  id: "overlay",
  label: "Overlay",
  icon: Layers
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
}];
const AI_ACTIONS = [{
  id: "captions",
  label: "Generate Captions",
  icon: Captions
}, {
  id: "title",
  label: "Suggest Title",
  icon: Lightbulb
}, {
  id: "desc",
  label: "Suggest Description",
  icon: FileText
}, {
  id: "hashtags",
  label: "Create Hashtags",
  icon: Hash
}, {
  id: "thumb",
  label: "Thumbnail Ideas",
  icon: Image
}, {
  id: "hook",
  label: "Improve Hook",
  icon: Sparkles
}, {
  id: "highlights",
  label: "Auto-cut Highlights",
  icon: ScissorsLineDashed
}, {
  id: "music",
  label: "Music Mood",
  icon: MicVocal
}, {
  id: "promo",
  label: "Promo Caption",
  icon: Tag
}, {
  id: "score",
  label: "Score Readiness",
  icon: Gauge
}];
function CreatorStudioEdit() {
  const {
    isGuest,
    isCreator
  } = useAuth$1();
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    if (isGuest) navigate({
      to: "/login"
    });
  }, [isGuest, navigate]);
  if (isGuest) return null;
  if (!isCreator) return /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorLockedScreen, {});
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Studio, {});
}
function CreatorLockedScreen() {
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "min-h-dvh grid place-items-center px-6 bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-md w-full rounded-3xl glass neon-border p-8 text-center overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-20 -right-20 size-56 rounded-full bg-[radial-gradient(circle,oklch(0.7_0.25_340_/_0.35),transparent_70%)] blur-2xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-20 -left-20 size-56 rounded-full bg-[radial-gradient(circle,oklch(0.65_0.22_300_/_0.3),transparent_70%)] blur-2xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto size-16 rounded-2xl glass grid place-items-center glow-gold mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "size-7 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] tracking-[0.3em] text-primary mb-1 flex items-center justify-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-3.5" }),
        " CREATOR ACCESS"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-gradient-gold", children: "Studio is creator-only" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-2", children: "The Creator Edit Studio is unlocked for approved Trey TV creators and admins. Apply to join the network and get access to the full cinematic editor." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-col gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate({
          to: "/apply/content-creator"
        }), className: "px-4 py-3 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold tilt-press hover-lift", children: "Apply to become a Creator" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate({
          to: "/creator-hub"
        }), className: "px-4 py-3 rounded-xl text-sm font-semibold glass border border-white/10 hover:bg-white/5", children: "Back to Creator Hub" })
      ] })
    ] })
  ] }) });
}
function Studio() {
  const navigate = useNavigate();
  const fileRef = reactExports.useRef(null);
  const goBack = useGoBack("/creator-hub");
  const {
    requestUpload,
    uploadFile
  } = useCloudflareUpload();
  const [projectName, setProjectName] = reactExports.useState("Untitled Episode");
  const [showProjects, setShowProjects] = reactExports.useState(false);
  const [quality, setQuality] = reactExports.useState("AI UHD");
  const [showQuality, setShowQuality] = reactExports.useState(false);
  const [uploadState, setUploadState] = reactExports.useState("empty");
  const [progress, setProgress] = reactExports.useState(0);
  const [mediaUrl, setMediaUrl] = reactExports.useState(null);
  const [streamUid, setStreamUid] = reactExports.useState(null);
  const [draftId, setDraftId] = reactExports.useState(null);
  const [playing, setPlaying] = reactExports.useState(false);
  const [time, setTime] = reactExports.useState(0);
  const duration = 45;
  const [selectedClip, setSelectedClip] = reactExports.useState("v1");
  const [activeTool, setActiveTool] = reactExports.useState("edit");
  const [snap, setSnap] = reactExports.useState(true);
  const [zoom, setZoom] = reactExports.useState(1);
  const [showAI, setShowAI] = reactExports.useState(false);
  const [showExport, setShowExport] = reactExports.useState(false);
  const [aiOutput, setAiOutput] = reactExports.useState("");
  const [aiOutputLabel, setAiOutputLabel] = reactExports.useState("");
  const [aiOutputBusy, setAiOutputBusy] = reactExports.useState(false);
  const AI_TEXT_TASKS = {
    captions: "caption",
    title: "title",
    desc: "description",
    hashtags: "hashtags",
    hook: "hook",
    promo: "promo_caption"
  };
  const handleAiAction = async (id, label) => {
    const task = AI_TEXT_TASKS[id];
    if (!task) {
      toast.success(`${label} queued`);
      return;
    }
    setAiOutput("");
    setAiOutputLabel(label);
    setAiOutputBusy(true);
    try {
      const result = await treyIGenerate({
        data: {
          task,
          prompt: `Generate ${label.toLowerCase()} for a Trey TV creator episode`
        }
      });
      setAiOutput("text" in result ? result.text : "");
      if ("error" in result) toast.error("Trey-I couldn't generate that right now");
    } catch {
      toast.error("Trey-I couldn't generate that right now");
    } finally {
      setAiOutputBusy(false);
    }
  };
  const onPickFile = () => fileRef.current?.click();
  const handleFile = async (file) => {
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
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "min-h-dvh bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileRef, type: "file", accept: "video/*,image/*", className: "hidden", onChange: (e) => handleFile(e.target.files?.[0] ?? null) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-30 px-3 md:px-5 pt-3 pb-2 backdrop-blur-xl bg-background/60 border-b border-white/5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap md:flex-nowrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: goBack, className: "size-10 shrink-0 grid place-items-center rounded-xl glass tilt-press hover:bg-white/5", "aria-label": "Back", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "order-3 md:order-none w-full md:w-auto md:flex-1 min-w-0 flex items-center md:justify-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden md:block text-[10px] tracking-[0.35em] text-gradient-gold font-bold whitespace-nowrap", children: "CREATOR EDIT STUDIO" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-w-0 flex-1 md:flex-none", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowProjects((s) => !s), className: "w-full md:w-auto px-3 py-1.5 rounded-lg glass border border-white/10 text-xs font-semibold flex items-center gap-1.5 md:max-w-[200px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-1.5 shrink-0 rounded-full bg-primary animate-glow-pulse" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: projectName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: `size-3.5 shrink-0 transition-transform ${showProjects ? "rotate-180" : ""}` })
          ] }),
          showProjects && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-0 md:left-1/2 md:-translate-x-1/2 top-full mt-2 w-56 rounded-xl glass-strong border border-white/10 shadow-2xl p-1 z-30 animate-scale-in", children: ["Untitled Episode", "New Trey TV Upload", "Late Night · S2 E14", "Studio Sessions Promo"].map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
            setProjectName(n);
            setShowProjects(false);
          }, className: `w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white/5 ${projectName === n ? "text-primary font-semibold" : ""}`, children: n }, n)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex items-center gap-2 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowQuality((s) => !s), className: "px-2.5 py-2 rounded-xl text-xs font-semibold glass border border-white/10 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3.5 text-primary" }),
            quality,
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: `size-3.5 transition-transform ${showQuality ? "rotate-180" : ""}` })
          ] }),
          showQuality && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-0 top-full mt-2 w-36 rounded-xl glass-strong border border-white/10 shadow-2xl p-1 z-30 animate-scale-in", children: ["AI UHD", "4K", "1080p", "720p"].map((q) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
            setQuality(q);
            setShowQuality(false);
          }, className: `w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white/5 ${quality === q ? "text-primary font-semibold" : ""}`, children: q }, q)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate({
          to: "/creator-studio/submit",
          search: {
            id: draftId ?? void 0
          }
        }), className: "px-3 md:px-5 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold tilt-press hover-lift flex items-center gap-1.5 whitespace-nowrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "size-4" }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Next:" }),
          " Details"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 md:px-5 py-4 space-y-4 pb-[260px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative rounded-3xl glass neon-border overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.2_0.1_300_/_0.4),transparent_60%)] pointer-events-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-video md:aspect-[16/9] w-full", children: [
          uploadState === "empty" && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onPickFile, className: "absolute inset-3 rounded-2xl border-2 border-dashed border-white/15 hover:border-primary/60 transition flex flex-col items-center justify-center gap-3 text-center px-6 group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-14 rounded-2xl glass grid place-items-center glow-gold group-hover:scale-110 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "size-6 text-primary" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "Upload your episode, clip, or promo to start editing" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "MP4 · MOV · HEVC · up to 4K" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground glow-gold", children: "Select Media" })
          ] }),
          uploadState === "uploading" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 grid place-items-center text-center px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs tracking-[0.3em] text-primary mb-2", children: "UPLOADING" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 rounded-full bg-white/10 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-gradient-to-r from-primary via-[oklch(0.7_0.25_340)] to-[oklch(0.65_0.22_300)] transition-all", style: {
              width: `${progress}%`
            } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-2 tabular-nums", children: [
              progress,
              "%"
            ] })
          ] }) }),
          uploadState === "processing" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 rounded-xl glass-strong border border-white/10 flex items-center gap-2 text-sm shimmer-sweep", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-4 text-primary animate-spin [animation-duration:2s]" }),
            " Processing media…"
          ] }) }),
          uploadState === "error" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 grid place-items-center px-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-destructive/40 bg-destructive/10 p-4 max-w-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold text-destructive", children: "Upload failed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onPickFile, className: "mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground", children: "Retry" })
          ] }) }),
          uploadState === "ready" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            mediaUrl?.startsWith("blob:") ? /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src: mediaUrl, className: "absolute inset-0 size-full object-cover", muted: !playing, loop: true, playsInline: true, autoPlay: playing }) : /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: mediaUrl ?? posts[0].media, className: "absolute inset-0 size-full object-cover", alt: "" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-3 left-3 flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold px-2 py-1 rounded-md bg-[oklch(0.65_0.22_300_/_0.3)] border border-[oklch(0.65_0.22_300_/_0.6)] text-white", children: "4K" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold px-2 py-1 rounded-md bg-white/10 border border-white/20", children: "HDR" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-3 right-3 px-2 py-1 rounded-md text-[11px] tabular-nums glass border border-white/10", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary font-semibold", children: fmt(time) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                " / ",
                fmt(duration)
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "flex items-center justify-between gap-2 rounded-2xl glass border border-white/10 p-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CtrlBtn, { icon: Maximize2, onClick: () => toast("Fullscreen") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CtrlBtn, { icon: Camera, onClick: () => toast("Snapshot saved") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CtrlBtn, { icon: SkipBack, onClick: () => setTime((t) => Math.max(0, t - 1)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPlaying((p) => !p), className: "size-11 grid place-items-center rounded-full bg-primary text-primary-foreground glow-gold tilt-press", "aria-label": playing ? "Pause" : "Play", children: playing ? /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "size-5 fill-current" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "size-5 fill-current ml-0.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CtrlBtn, { icon: SkipForward, onClick: () => setTime((t) => Math.min(duration, t + 1)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CtrlBtn, { icon: Undo2, onClick: () => toast("Undo") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CtrlBtn, { icon: Redo2, onClick: () => toast("Redo") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CtrlBtn, { icon: Ellipsis, onClick: () => toast("More options") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl glass neon-border p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs tabular-nums", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary font-semibold", children: fmt(time) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              " / ",
              fmt(duration)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setSnap((s) => !s), className: `px-2 py-1 rounded-md text-[10px] font-semibold flex items-center gap-1 border ${snap ? "border-primary text-primary glow-gold" : "border-white/10 text-muted-foreground"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Magnet, { className: "size-3" }),
              " Snap"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CtrlBtn, { icon: ZoomOut, onClick: () => setZoom((z) => Math.max(0.5, z - 0.25)), small: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CtrlBtn, { icon: ZoomIn, onClick: () => setZoom((z) => Math.min(2, z + 0.25)), small: true })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto no-scrollbar", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", style: {
          width: `${600 * zoom}px`
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-5 border-b border-white/5 mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex justify-between text-[10px] text-muted-foreground tabular-nums px-1", children: [0, 12, 14, 16, 18, 20].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "00:",
            String(t).padStart(2, "0")
          ] }, t)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-5 bottom-0 left-[40%] w-px bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] z-10 pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1 -left-[3px] size-2 rounded-full bg-primary glow-gold" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Track, { label: "Video", icon: Clapperboard, onAdd: () => toast("Add clip"), children: [posts[0].media, posts[1].media, posts[2].media, posts[0].media].map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setSelectedClip(`v${i}`), className: `relative h-full w-24 shrink-0 rounded-md overflow-hidden ring-1 transition ${selectedClip === `v${i}` ? "ring-primary glow-gold scale-[1.02]" : "ring-white/10"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: m, className: "absolute inset-0 size-full object-cover", alt: "" }),
            selectedClip === `v${i}` && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute bottom-0.5 left-1 text-[9px] font-bold text-primary", children: "8.6s" })
          ] }, i)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Track, { label: "Overlay", icon: Layers, tone: "purple", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full flex-1 rounded-md bg-gradient-to-r from-[oklch(0.65_0.22_300_/_0.4)] to-[oklch(0.7_0.25_340_/_0.4)] ring-1 ring-[oklch(0.65_0.22_300_/_0.5)] flex items-center px-3 text-[11px] font-semibold gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3" }),
            " Neon Glow"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Track, { label: "Text", icon: Type, tone: "gold", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full flex-1 rounded-md bg-primary/10 ring-1 ring-primary/40 flex items-center px-3 text-[11px] font-semibold text-primary gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Type, { className: "size-3" }),
            " Trey TV"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Track, { label: "Audio", icon: Music2, tone: "cyan", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full flex-1 rounded-md bg-[oklch(0.82_0.15_215_/_0.12)] ring-1 ring-[oklch(0.82_0.15_215_/_0.4)] flex items-center px-2 gap-px overflow-hidden", children: Array.from({
            length: 80
          }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 bg-[oklch(0.82_0.15_215)] rounded-full opacity-80", style: {
            height: `${20 + Math.sin(i * 0.5) * 25 + Math.random() * 25}%`
          } }, i)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Track, { label: "Captions", icon: Captions, tone: "magenta", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full flex items-center gap-1", children: ["CC", "CC", "CC"].map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded bg-[oklch(0.7_0.25_340_/_0.2)] border border-[oklch(0.7_0.25_340_/_0.5)] text-[10px] font-bold text-[oklch(0.7_0.25_340)]", children: c }, i)) }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => toast("Add new layer"), className: "mt-3 w-full py-2 rounded-xl border border-dashed border-white/15 text-xs text-muted-foreground hover:bg-white/5 hover:text-foreground transition flex items-center justify-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-3.5" }),
          " Add layer"
        ] })
      ] }),
      selectedClip && /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "rounded-2xl glass border border-white/10 p-2 overflow-x-auto no-scrollbar animate-fade-in", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-around gap-1 min-w-max px-2", children: [{
        id: "split",
        label: "Split",
        icon: Scissors
      }, {
        id: "trim",
        label: "Trim",
        icon: ScissorsLineDashed
      }, {
        id: "speed",
        label: "Speed",
        icon: Gauge
      }, {
        id: "trans",
        label: "Transitions",
        icon: Shuffle
      }, {
        id: "effects",
        label: "Effects",
        icon: Sparkles
      }, {
        id: "delete",
        label: "Delete",
        icon: Trash2,
        danger: true
      }].map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
        if (a.id === "delete") setSelectedClip(null);
        toast(a.label);
      }, className: `px-3 py-2 rounded-xl flex flex-col items-center gap-0.5 min-w-[64px] tilt-press hover:bg-white/5 ${a.danger ? "hover:bg-destructive/10" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(a.icon, { className: `size-4 ${a.danger ? "text-destructive" : ""}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px]", children: a.label })
      ] }, a.id)) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "fixed bottom-0 left-0 right-0 z-20 px-3 pb-3 pt-2 bg-gradient-to-t from-background via-background/95 to-transparent", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl glass-strong border border-white/10 p-2 shadow-[0_20px_60px_-20px_oklch(0_0_0_/_0.7)] flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-x-auto no-scrollbar", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1 min-w-max", children: TOOLS.map((t) => {
        const active = activeTool === t.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveTool(t.id), className: `px-3 py-2 rounded-xl flex flex-col items-center gap-0.5 min-w-[64px] tilt-press transition ${active ? "bg-primary/15 ring-1 ring-primary/40 glow-gold" : "hover:bg-white/5"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(t.icon, { className: `size-5 ${active ? "text-primary" : "text-foreground"}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[10px] ${active ? "text-primary font-semibold" : "text-muted-foreground"}`, children: t.label })
        ] }, t.id);
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowAI(true), "aria-label": "AI Assist", className: "relative shrink-0 size-14 rounded-full grid place-items-center bg-[radial-gradient(circle_at_30%_30%,oklch(0.82_0.16_85),oklch(0.65_0.22_300)_60%,oklch(0.7_0.25_340))] text-primary-foreground shadow-[0_0_24px_oklch(0.82_0.16_85_/_0.6),0_0_40px_oklch(0.65_0.22_300_/_0.4)] tilt-press hover:scale-105 transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-0 rounded-full ring-2 ring-white/30 animate-glow-pulse" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(WandSparkles, { className: "size-6 relative" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -bottom-1 text-[8px] font-bold tracking-[0.15em] text-primary-foreground/0", children: "AI" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open: showAI, onOpenChange: setShowAI, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { side: "bottom", className: "glass-strong border-t border-white/10 max-h-[85vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetHeader, { className: "text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetTitle, { className: "flex items-center gap-2 text-gradient-gold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(WandSparkles, { className: "size-5 text-primary" }),
          " Trey-I Assist"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SheetDescription, { children: "Premium AI tools for your upload. Tap any action to run it." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4", children: AI_ACTIONS.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleAiAction(a.id, a.label), disabled: aiOutputBusy, className: "group rounded-2xl glass neon-border p-4 text-left hover-lift tilt-press relative overflow-hidden disabled:opacity-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-10 rounded-xl bg-white/5 grid place-items-center group-hover:scale-110 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(a.icon, { className: "size-5 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-sm font-semibold", children: a.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground mt-0.5", children: "Trey-I" })
      ] }, a.id)) }),
      (aiOutputBusy || aiOutput) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-2xl glass border border-white/10 p-4 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.2em] text-primary", children: aiOutputLabel.toUpperCase() }),
          !aiOutputBusy && aiOutput && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
            navigator.clipboard.writeText(aiOutput);
            toast.success("Copied");
          }, className: "text-[10px] text-muted-foreground hover:text-foreground px-2 py-0.5 rounded glass border border-white/10", children: "Copy" })
        ] }),
        aiOutputBusy ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground py-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3 text-primary animate-pulse" }),
          " Trey-I is generating…"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-relaxed whitespace-pre-wrap", children: aiOutput })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showExport, onOpenChange: setShowExport, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "glass-strong border-white/10 max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2 text-gradient-gold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "size-5 text-primary" }),
          " Export & Publish"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Configure your upload before publishing to Trey TV." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ExportForm, { onClose: () => setShowExport(false) })
    ] }) })
  ] });
}
function CtrlBtn({
  icon: Icon,
  onClick,
  small
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick, className: `${small ? "size-7" : "size-9"} grid place-items-center rounded-lg glass border border-white/10 hover:bg-white/5 tilt-press`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: small ? "size-3.5" : "size-4" }) });
}
function Track({
  label,
  icon: Icon,
  tone,
  children,
  onAdd
}) {
  const toneColor = tone === "purple" ? "text-[oklch(0.65_0.22_300)]" : tone === "gold" ? "text-primary" : tone === "cyan" ? "text-[oklch(0.82_0.15_215)]" : tone === "magenta" ? "text-[oklch(0.7_0.25_340)]" : "text-foreground";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-16 shrink-0 flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `size-3.5 ${toneColor}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] tracking-[0.15em] text-muted-foreground uppercase", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "size-3 text-muted-foreground/60" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 h-12 rounded-lg bg-white/5 ring-1 ring-white/10 overflow-hidden flex items-center gap-1 px-1", children: [
      children,
      onAdd && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onAdd, className: "size-8 shrink-0 grid place-items-center rounded-md bg-white/10 hover:bg-white/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" }) })
    ] })
  ] });
}
function ExportForm({
  onClose
}) {
  const [title, setTitle] = reactExports.useState("");
  const [desc, setDesc] = reactExports.useState("");
  const [show, setShow] = reactExports.useState("late-night");
  const [ep, setEp] = reactExports.useState("15");
  const [visibility, setVisibility] = reactExports.useState("public");
  const [quality, setQuality] = reactExports.useState("AI UHD");
  const [thumb, setThumb] = reactExports.useState(0);
  const [schedule, setSchedule] = reactExports.useState("");
  const submit = () => {
    toast.success("Export queued — rendering in the cloud");
    onClose();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 mt-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Title", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: title, onChange: (e) => setTitle(e.target.value), placeholder: "Late Night with Trey — S2 E15", className: "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/60" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Description", children: /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: desc, onChange: (e) => setDesc(e.target.value), rows: 3, placeholder: "Tell your fans what's inside…", className: "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/60 resize-none" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Show / Series", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: show, onChange: (e) => setShow(e.target.value), className: "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/60", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "late-night", children: "Late Night with Trey" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "studio", children: "Studio Sessions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "city", children: "City After Dark" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Episode #", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: ep, onChange: (e) => setEp(e.target.value), type: "number", className: "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/60" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Visibility", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: ["draft", "private", "public"].map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setVisibility(v), className: `px-3 py-2 rounded-xl text-xs font-semibold capitalize border transition ${visibility === v ? "bg-primary/15 border-primary text-primary glow-gold" : "border-white/10 hover:bg-white/5"}`, children: v }, v)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Quality", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: ["HD", "4K", "AI UHD"].map((q) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setQuality(q), className: `px-3 py-2 rounded-xl text-xs font-semibold border transition ${quality === q ? "bg-primary/15 border-primary text-primary glow-gold" : "border-white/10 hover:bg-white/5"}`, children: q }, q)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Thumbnail", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: [posts[0].media, posts[1].media, posts[2].media].map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setThumb(i), className: `relative aspect-video rounded-lg overflow-hidden ring-1 transition ${thumb === i ? "ring-primary glow-gold scale-[1.02]" : "ring-white/10"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: m, className: "absolute inset-0 size-full object-cover", alt: "" }) }, i)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Schedule (optional)", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "datetime-local", value: schedule, onChange: (e) => setSchedule(e.target.value), className: "w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary/60" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "flex-1 px-4 py-3 rounded-xl text-sm font-semibold glass border border-white/10 hover:bg-white/5", children: "Save Draft" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: submit, className: "flex-1 px-4 py-3 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold tilt-press hover-lift flex items-center justify-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Film, { className: "size-4" }),
        " Publish"
      ] })
    ] })
  ] });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.2em] text-muted-foreground uppercase mb-1.5", children: label }),
    children
  ] });
}
export {
  CreatorStudioEdit as component
};
