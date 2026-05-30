import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { L as Logo } from "./Logo-D0JEzEf4.mjs";
import { s as supabase } from "./router-BtgGywEC.mjs";
import { K as treyICheckUsername, a as createServerFn, u as createSsrRpc } from "./index.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/react-dom.mjs";
import { A as ArrowLeft, k as Check, X, an as Upload, S as Sparkles, d as Image, aj as ArrowRight, ay as CircleAlert, b3 as Camera, U as User, aC as PenLine, be as MapPin, bp as CircleCheckBig } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
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
function validateStartInput(input) {
  return {
    accessToken: typeof input?.accessToken === "string" ? input.accessToken.trim() : "",
    consentAccepted: input?.consentAccepted === true
  };
}
function validateExtractInput(input) {
  return {
    accessToken: typeof input?.accessToken === "string" ? input.accessToken.trim() : "",
    jobId: typeof input?.jobId === "string" ? input.jobId.trim().slice(0, 64) : "",
    imageBase64: typeof input?.imageBase64 === "string" ? input.imageBase64 : "",
    mimeType: typeof input?.mimeType === "string" ? input.mimeType.slice(0, 30) : "image/png"
  };
}
function validateApproveInput(input) {
  return {
    accessToken: typeof input?.accessToken === "string" ? input.accessToken.trim() : "",
    jobId: typeof input?.jobId === "string" ? input.jobId.trim().slice(0, 64) : "",
    draft: input?.draft && typeof input.draft === "object" && !Array.isArray(input.draft) ? input.draft : {}
  };
}
const startImportJob = createServerFn({
  method: "POST"
}).inputValidator(validateStartInput).handler(createSsrRpc("616699ed6892ddd3f1f73adca5ab09feae022407cd58be36c9e5746f2d15ddfd"));
const extractScreenshot = createServerFn({
  method: "POST"
}).inputValidator(validateExtractInput).handler(createSsrRpc("9f00c8564e148c83c17a18b551a7e490f87de0ee8797abfaea71782551973e2a"));
createServerFn({
  method: "POST"
}).inputValidator(validateApproveInput).handler(createSsrRpc("2013fb9d641643a76de9394cb914e45d53fc33f2ac8dc4d3a3526038b4b3fda4"));
const publishImportProfile = createServerFn({
  method: "POST"
}).inputValidator(validateApproveInput).handler(createSsrRpc("3159d595375b826eefa825c4544b69c4bfd27bc69bd36b05c30b5a809595876a"));
const CONSENT_TEXT = "I confirm that I own or control this profile/page, or I am authorized to use the photos, name, bio, links, and public information shown in this screenshot. I give Trey TV permission to use this uploaded screenshot to create a draft profile. I understand I can review, edit, replace, or remove anything before publishing.";
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const CATEGORY_OPTIONS = ["Music", "Shows", "Behind the scenes", "Comedy", "Motivation", "Creator content", "Exclusive drops", "Sports", "Fashion", "Gaming"];
const SECTION_LABELS = ["Screenshot", "Profile Images", "Identity", "Bio & Links", "Required Info", "Final Review"];
function ImportScreenshot() {
  const nav = useNavigate();
  const fileInputRef = reactExports.useRef(null);
  const avatarInputRef = reactExports.useRef(null);
  const bannerInputRef = reactExports.useRef(null);
  const [accessToken, setAccessToken] = reactExports.useState(null);
  const [step, setStep] = reactExports.useState("upload");
  const [consentChecked, setConsentChecked] = reactExports.useState(false);
  const [jobId, setJobId] = reactExports.useState(null);
  const [screenshotFile, setScreenshotFile] = reactExports.useState(null);
  const [screenshotPreview, setScreenshotPreview] = reactExports.useState(null);
  const [extractionFallback, setExtractionFallback] = reactExports.useState(false);
  const [saving, setSaving] = reactExports.useState(false);
  const [usernameHint, setUsernameHint] = reactExports.useState("");
  const [usernameChecked, setUsernameChecked] = reactExports.useState("");
  const [activeSection, setActiveSection] = reactExports.useState(0);
  const [draft, setDraft] = reactExports.useState({
    display_name: "",
    username: "",
    bio: "",
    location: "",
    date_of_birth: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    x_handle: "",
    favorite_categories: [],
    avatarDataUrl: null,
    bannerDataUrl: null,
    avatarApproved: false,
    bannerApproved: false,
    show_location: true,
    profile_visibility: "public"
  });
  reactExports.useEffect(() => {
    supabase.auth.getSession().then(({
      data
    }) => {
      if (!data.session) nav({
        to: "/login"
      });
      else setAccessToken(data.session.access_token);
    }).catch(() => nav({
      to: "/login"
    }));
  }, []);
  reactExports.useEffect(() => {
    if (!accessToken) return;
    const loadProgress = async () => {
      try {
        const {
          data: {
            user
          }
        } = await supabase.auth.getUser();
        if (!user) return;
        const {
          data
        } = await supabase.from("user_onboarding").select("current_step, selected_path, answers").eq("user_id", user.id).maybeSingle();
        if (data && !data.completed && data.selected_path === "import_screenshot") {
          const answers = data.answers;
          if (answers) {
            if (answers.step) setStep(answers.step);
            if (answers.draft) setDraft(answers.draft);
            if (answers.jobId) setJobId(answers.jobId);
            if (answers.consentChecked) setConsentChecked(answers.consentChecked);
          }
          toast.success("Resumed screenshot onboarding from where you left off.");
        } else {
          await supabase.from("user_onboarding").upsert({
            user_id: user.id,
            selected_path: "import_screenshot",
            current_step: 0,
            answers: {},
            completed: false,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          }, {
            onConflict: "user_id"
          });
        }
      } catch (err) {
        console.error("Failed to load onboarding progress:", err);
      }
    };
    loadProgress();
  }, [accessToken]);
  reactExports.useEffect(() => {
    if (!accessToken || step === "publishing") return;
    const saveProgress = async () => {
      try {
        const {
          data: {
            user
          }
        } = await supabase.auth.getUser();
        if (user) {
          const stepNum = step === "upload" ? 0 : step === "review" ? 1 : 2;
          await supabase.from("user_onboarding").upsert({
            user_id: user.id,
            selected_path: "import_screenshot",
            current_step: stepNum,
            answers: {
              step,
              draft,
              jobId,
              consentChecked
            },
            completed: false,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          }, {
            onConflict: "user_id"
          });
        }
      } catch (err) {
        console.error("Failed to save screenshot onboarding progress:", err);
      }
    };
    const timer = setTimeout(saveProgress, 1e3);
    return () => clearTimeout(timer);
  }, [accessToken, step, draft, jobId, consentChecked]);
  const set = reactExports.useCallback((key, val) => {
    setDraft((prev) => ({
      ...prev,
      [key]: val
    }));
  }, []);
  const toggleCategory = reactExports.useCallback((val) => {
    setDraft((prev) => ({
      ...prev,
      favorite_categories: prev.favorite_categories.includes(val) ? prev.favorite_categories.filter((x) => x !== val) : [...prev.favorite_categories, val]
    }));
  }, []);
  const handleFileSelect = reactExports.useCallback((file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Please upload a PNG, JPG, JPEG, or WEBP image.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Screenshot must be under 10MB.");
      return;
    }
    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setScreenshotPreview(e.target?.result);
    reader.readAsDataURL(file);
  }, []);
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };
  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      set("avatarDataUrl", ev.target?.result);
      set("avatarApproved", true);
    };
    reader.readAsDataURL(file);
  };
  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      set("bannerDataUrl", ev.target?.result);
      set("bannerApproved", true);
    };
    reader.readAsDataURL(file);
  };
  const checkUsername = reactExports.useCallback(async (raw) => {
    if (!raw || raw === usernameChecked) return;
    setUsernameHint("checking");
    try {
      const result = await treyICheckUsername({
        data: {
          username: raw
        }
      });
      setUsernameChecked(raw);
      setUsernameHint(result.available ? "available" : result.reason === "invalid" ? "invalid" : "taken");
    } catch {
      setUsernameChecked(raw);
      setUsernameHint("available");
    }
  }, [usernameChecked]);
  const handleStartImport = async () => {
    if (!accessToken || !consentChecked || !screenshotFile) return;
    setSaving(true);
    try {
      const {
        jobId: newJobId
      } = await startImportJob({
        data: {
          accessToken,
          consentAccepted: true
        }
      });
      setJobId(newJobId);
      setStep("extracting");
      await runExtraction(newJobId, screenshotFile);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start import. Please try again.");
      setSaving(false);
    }
  };
  const runExtraction = async (jid, file) => {
    try {
      const base64 = await fileToBase64(file);
      const {
        extracted,
        fallback
      } = await extractScreenshot({
        data: {
          accessToken,
          jobId: jid,
          imageBase64: base64,
          mimeType: file.type
        }
      });
      setExtractionFallback(fallback);
      setDraft((prev) => ({
        ...prev,
        display_name: extracted.display_name ?? "",
        username: (extracted.username ?? "").toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "").slice(0, 30),
        bio: extracted.bio ?? "",
        location: extracted.location ?? "",
        instagram: extracted.instagram ?? "",
        tiktok: extracted.tiktok ?? "",
        youtube: extracted.youtube ?? "",
        x_handle: extracted.x_handle ?? "",
        favorite_categories: extracted.favorite_categories ?? []
      }));
      if (fallback) {
        toast("We couldn't read this screenshot automatically, but you can still build your profile from it manually.", {
          duration: 6e3
        });
      }
      setStep("review");
    } catch (err) {
      console.error(err);
      setExtractionFallback(true);
      toast("We couldn't read this screenshot automatically, but your upload is still saved. You can finish the profile manually from here.");
      setStep("review");
    } finally {
      setSaving(false);
    }
  };
  const handlePublish = async () => {
    if (!accessToken) return;
    if (!draft.display_name.trim() || draft.display_name.trim().length < 2) {
      toast.error("Display name is required (at least 2 characters).");
      setActiveSection(2);
      return;
    }
    if (!draft.username.trim() || usernameHint === "taken" || usernameHint === "invalid") {
      toast.error("A valid, available username is required.");
      setActiveSection(2);
      return;
    }
    if (!draft.date_of_birth || !/^\d{4}-\d{2}-\d{2}$/.test(draft.date_of_birth)) {
      toast.error("Date of birth is required (YYYY-MM-DD format).");
      setActiveSection(4);
      return;
    }
    if (!draft.location.trim()) {
      toast.error("A broad location is required.");
      setActiveSection(4);
      return;
    }
    if (draft.favorite_categories.length === 0) {
      toast.error("Select at least one content interest.");
      setActiveSection(4);
      return;
    }
    setSaving(true);
    setStep("publishing");
    try {
      const {
        publicProfileUid
      } = await publishImportProfile({
        data: {
          accessToken,
          jobId: jobId ?? "",
          draft: {
            display_name: draft.display_name,
            username: draft.username,
            bio: draft.bio || void 0,
            location: draft.location,
            date_of_birth: draft.date_of_birth,
            instagram: draft.instagram || void 0,
            tiktok: draft.tiktok || void 0,
            youtube: draft.youtube || void 0,
            x_handle: draft.x_handle || void 0,
            favorite_categories: draft.favorite_categories.length ? draft.favorite_categories : void 0,
            show_location: draft.show_location,
            profile_visibility: draft.profile_visibility,
            _jobId: jobId
          }
        }
      });
      window.location.href = `/u/${publicProfileUid}?tour=1`;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not publish profile. Please check your info and try again.");
      setSaving(false);
      setStep("review");
    }
  };
  if (!accessToken) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass border border-white/10 rounded-3xl px-10 py-8 text-center space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" })
    ] }) });
  }
  if (step === "extracting") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ExtractingScreen, { screenshotPreview });
  }
  if (step === "publishing") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass border border-white/10 rounded-3xl px-10 py-8 text-center space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Publishing your Trey TV profile…" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Almost there. One moment." })
    ] }) });
  }
  if (step === "upload") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-screen w-full overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CinematicBackdrop, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-[600px] mx-auto px-4 pt-6 pb-16", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => nav({
            to: "/onboarding"
          }), className: "size-9 grid place-items-center rounded-full liquid-glass border border-white/10", "aria-label": "Back", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "h-7" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-9" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ProgressBar, { current: 0, total: 2, label: "Upload" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 rounded-3xl liquid-glass neon-border p-6 sm:p-8 space-y-6 animate-rise", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] tracking-[0.35em] text-primary uppercase", children: "Import · Step 1 of 2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-1 text-2xl font-bold", children: "Import From Screenshot" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Upload a screenshot of your public profile. Trey TV will turn it into a draft you can edit before it goes live." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "button", tabIndex: 0, onClick: () => fileInputRef.current?.click(), onKeyDown: (e) => e.key === "Enter" && fileInputRef.current?.click(), onDrop, onDragOver: (e) => e.preventDefault(), className: `relative rounded-2xl border-2 border-dashed transition-all cursor-pointer group ${screenshotFile ? "border-primary/60 bg-primary/5" : "border-white/15 hover:border-primary/50 bg-white/3"} p-4`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileInputRef, type: "file", accept: "image/png,image/jpeg,image/jpg,image/webp", className: "sr-only", onChange: onFileChange }),
            screenshotPreview ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: screenshotPreview, alt: "Selected screenshot", className: "w-full max-h-64 object-contain rounded-xl" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 text-primary", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3.5" }),
                  " ",
                  screenshotFile?.name
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: (e) => {
                  e.stopPropagation();
                  setScreenshotFile(null);
                  setScreenshotPreview(null);
                }, className: "text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" }) })
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-10 flex flex-col items-center gap-3 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-14 rounded-2xl border border-white/15 bg-white/5 grid place-items-center group-hover:border-primary/40 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "size-6 text-muted-foreground group-hover:text-primary transition" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Drop your screenshot here, or click to browse" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "PNG, JPG, JPEG, WEBP · Max 10MB" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-white/5 border border-white/10 p-4 text-xs text-muted-foreground space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold text-foreground/80 flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3.5 text-primary" }),
              " Best results"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Upload a clear screenshot that shows your profile photo, banner if available, display name, username, bio, and public links." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex gap-3 cursor-pointer group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { onClick: () => setConsentChecked((v) => !v), className: `mt-0.5 shrink-0 size-5 rounded border transition flex items-center justify-center cursor-pointer ${consentChecked ? "border-primary bg-primary/20 text-primary" : "border-white/20 bg-white/5 group-hover:border-primary/50"}`, role: "checkbox", "aria-checked": consentChecked, tabIndex: 0, onKeyDown: (e) => e.key === "Enter" && setConsentChecked((v) => !v), children: consentChecked && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground leading-relaxed", children: CONSENT_TEXT })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleStartImport, disabled: !consentChecked || !screenshotFile || saving, className: "w-full h-12 rounded-2xl bg-primary text-primary-foreground font-bold text-sm glow-gold inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition", children: saving ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-4 rounded-full border-2 border-current border-t-transparent animate-spin" }),
            "Starting import…"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "size-4" }),
            "Analyze Screenshot",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-4" })
          ] }) }),
          !consentChecked && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "size-3.5" }),
            " Accept the agreement above to continue."
          ] })
        ] })
      ] })
    ] });
  }
  const canPublish = draft.display_name.trim().length >= 2 && draft.username.trim().length >= 3 && usernameHint === "available" && /^\d{4}-\d{2}-\d{2}$/.test(draft.date_of_birth) && draft.location.trim().length > 0 && draft.favorite_categories.length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-screen w-full overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CinematicBackdrop, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-[700px] mx-auto px-4 pt-6 pb-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setStep("upload"), className: "size-9 grid place-items-center rounded-full liquid-glass border border-white/10", "aria-label": "Back", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "h-7" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-9" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ProgressBar, { current: 1, total: 2, label: "Review" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 animate-rise text-center space-y-1", children: [
        extractionFallback ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "size-3.5" }),
          "Manual mode — fill in the fields below"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3.5" }),
          "Draft imported — review everything before publishing"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl sm:text-3xl font-bold", children: "Review Your Imported Profile" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Edit any field. Nothing goes live until you click Publish." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar", children: SECTION_LABELS.map((label, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setActiveSection(i), className: `shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition ${activeSection === i ? "bg-primary text-primary-foreground" : "bg-white/5 border border-white/10 text-muted-foreground hover:border-primary/40"}`, children: label }, label)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 space-y-5", children: [
        activeSection === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionCard, { icon: Camera, title: "Your Screenshot", children: [
          screenshotPreview ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: screenshotPreview, alt: "Uploaded screenshot", className: "w-full rounded-2xl object-contain max-h-72" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center h-40 text-muted-foreground text-sm", children: "No screenshot preview available" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "This file stays private. Only you can access it." })
        ] }),
        activeSection === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionCard, { icon: Image, title: "Profile Images", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: avatarInputRef, type: "file", accept: "image/*", className: "sr-only", onChange: handleAvatarChange }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: bannerInputRef, type: "file", accept: "image/*", className: "sr-only", onChange: handleBannerChange }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wider", children: "Profile Photo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-20 rounded-full overflow-hidden border-2 border-white/15 bg-white/5 flex items-center justify-center shrink-0", children: draft.avatarDataUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: draft.avatarDataUrl, alt: "Avatar", className: "size-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "size-8 text-muted-foreground/50" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => avatarInputRef.current?.click(), className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl liquid-glass border border-white/15 text-xs font-medium", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "size-3" }),
                  draft.avatarDataUrl ? "Replace Photo" : "Upload Photo"
                ] }),
                draft.avatarDataUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => {
                  set("avatarDataUrl", null);
                  set("avatarApproved", false);
                }, className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-xs text-muted-foreground hover:text-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-3" }),
                  " Remove"
                ] }),
                !draft.avatarDataUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "You can add a photo later from your profile settings." })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 pt-2 border-t border-white/10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wider", children: "Banner Image" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl overflow-hidden border border-white/10 bg-white/5 h-28 flex items-center justify-center relative", children: draft.bannerDataUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: draft.bannerDataUrl, alt: "Banner", className: "w-full h-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground/50 text-sm", children: "No banner" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => bannerInputRef.current?.click(), className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl liquid-glass border border-white/15 text-xs font-medium", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "size-3" }),
                draft.bannerDataUrl ? "Replace Banner" : "Upload Banner"
              ] }),
              draft.bannerDataUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => {
                set("bannerDataUrl", null);
                set("bannerApproved", false);
              }, className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-xs text-muted-foreground hover:text-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-3" }),
                " Remove"
              ] })
            ] })
          ] })
        ] }),
        activeSection === 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionCard, { icon: User, title: "Identity", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Display Name *", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: draft.display_name, onChange: (e) => set("display_name", e.target.value), placeholder: "Your name", maxLength: 50, className: "w-full h-11 rounded-xl bg-white/5 border border-white/15 px-4 text-sm focus:outline-none focus:border-primary/60 transition" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Field, { label: "Username *", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm", children: "@" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: draft.username, onChange: (e) => {
                set("username", e.target.value);
                setUsernameHint("");
                setUsernameChecked("");
              }, onBlur: () => checkUsername(draft.username), placeholder: "handle", maxLength: 30, className: "w-full h-11 rounded-xl bg-white/5 border border-white/15 pl-8 pr-4 text-sm focus:outline-none focus:border-primary/60 transition" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(UsernameHint, { hint: usernameHint })
          ] })
        ] }),
        activeSection === 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionCard, { icon: PenLine, title: "Bio & Links", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Field, { label: "Bio", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: draft.bio, onChange: (e) => set("bio", e.target.value), placeholder: "A short bio about you…", maxLength: 160, rows: 3, className: "w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-sm focus:outline-none focus:border-primary/60 transition resize-none" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-right text-xs text-muted-foreground", children: [
              draft.bio.length,
              "/160"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Instagram", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SocialInput, { icon: "@", value: draft.instagram, onChange: (v) => set("instagram", v), placeholder: "username" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "TikTok", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SocialInput, { icon: "@", value: draft.tiktok, onChange: (v) => set("tiktok", v), placeholder: "username" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "YouTube", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SocialInput, { icon: "", value: draft.youtube, onChange: (v) => set("youtube", v), placeholder: "channel / URL" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "X / Twitter", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SocialInput, { icon: "@", value: draft.x_handle, onChange: (v) => set("x_handle", v), placeholder: "handle" }) })
          ] })
        ] }),
        activeSection === 4 && /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionCard, { icon: MapPin, title: "Required Info", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-primary/5 border border-primary/20 p-4 text-xs text-muted-foreground space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-foreground/80 font-semibold flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "size-3.5 text-primary" }),
              " These fields are required"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Date of birth and location are never imported automatically — you must enter them yourself for privacy." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Field, { label: "Date of Birth *", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: draft.date_of_birth, onChange: (e) => set("date_of_birth", e.target.value), max: new Date(Date.now() - 13 * 365 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0], className: "w-full h-11 rounded-xl bg-white/5 border border-white/15 px-4 text-sm focus:outline-none focus:border-primary/60 transition" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Used to verify age. Stored privately." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Field, { label: "Broad Location *", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: draft.location, onChange: (e) => set("location", e.target.value), placeholder: "e.g. Atlanta, GA or UK", maxLength: 50, className: "w-full h-11 rounded-xl bg-white/5 border border-white/15 px-4 text-sm focus:outline-none focus:border-primary/60 transition" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "City, region, or country only. No street addresses." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Content Interests * (pick at least one)", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: CATEGORY_OPTIONS.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => toggleCategory(cat), className: `px-3 py-1.5 rounded-full text-xs font-medium transition ${draft.favorite_categories.includes(cat) ? "bg-primary text-primary-foreground" : "bg-white/5 border border-white/15 text-muted-foreground hover:border-primary/40"}`, children: cat }, cat)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Show location on profile" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => set("show_location", !draft.show_location), className: `relative w-10 h-6 rounded-full transition ${draft.show_location ? "bg-primary" : "bg-white/10"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `absolute top-1 size-4 rounded-full bg-white transition-all ${draft.show_location ? "left-5" : "left-1"}` }) })
          ] })
        ] }),
        activeSection === 5 && /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionCard, { icon: CircleCheckBig, title: "Final Review", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewRow, { label: "Display Name", value: draft.display_name || "—", missing: !draft.display_name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewRow, { label: "Username", value: draft.username ? `@${draft.username}` : "—", missing: !draft.username }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewRow, { label: "Bio", value: draft.bio || "Not set" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewRow, { label: "Location", value: draft.location || "—", missing: !draft.location }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewRow, { label: "Date of Birth", value: draft.date_of_birth || "—", missing: !draft.date_of_birth }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewRow, { label: "Interests", value: draft.favorite_categories.length ? draft.favorite_categories.join(", ") : "—", missing: !draft.favorite_categories.length }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewRow, { label: "Instagram", value: draft.instagram || "Not set" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewRow, { label: "TikTok", value: draft.tiktok || "Not set" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewRow, { label: "Avatar", value: draft.avatarDataUrl ? "Uploaded" : "None (can add later)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewRow, { label: "Banner", value: draft.bannerDataUrl ? "Uploaded" : "None (can add later)" })
          ] }),
          !canPublish && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-yellow-500/10 border border-yellow-500/20 p-4 text-xs text-yellow-400 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "size-3.5" }),
              " Missing required fields"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside space-y-0.5 text-yellow-400/80", children: [
              draft.display_name.trim().length < 2 && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Display name (section 3)" }),
              (draft.username.trim().length < 3 || usernameHint === "taken") && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Valid username (section 3)" }),
              !/^\d{4}-\d{2}-\d{2}$/.test(draft.date_of_birth) && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Date of birth (section 5)" }),
              !draft.location.trim() && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Location (section 5)" }),
              draft.favorite_categories.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "At least one content interest (section 5)" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handlePublish, disabled: !canPublish || saving, className: "w-full h-12 rounded-2xl bg-primary text-primary-foreground font-bold text-sm glow-gold inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-4" }),
            saving ? "Publishing…" : "Publish My Trey TV Profile"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs text-muted-foreground", children: "By publishing you confirm this is your real profile information." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setActiveSection((s) => Math.max(0, s - 1)), disabled: activeSection === 0, className: "h-11 px-5 rounded-2xl liquid-glass border border-white/15 text-sm font-medium inline-flex items-center gap-2 disabled:opacity-40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }),
          " Back"
        ] }),
        activeSection < SECTION_LABELS.length - 1 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setActiveSection((s) => Math.min(SECTION_LABELS.length - 1, s + 1)), className: "h-11 px-5 rounded-2xl bg-primary/20 border border-primary/30 text-primary text-sm font-medium inline-flex items-center gap-2", children: [
          "Next ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-4" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handlePublish, disabled: !canPublish || saving, className: "h-11 px-5 rounded-2xl bg-primary text-primary-foreground text-sm font-bold glow-gold inline-flex items-center gap-2 disabled:opacity-40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-4" }),
          saving ? "Publishing…" : "Publish Profile"
        ] })
      ] })
    ] })
  ] });
}
function CinematicBackdrop() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "aria-hidden": true, className: "pointer-events-none absolute inset-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-40 left-1/2 -translate-x-1/2 size-[80vmin] rounded-full bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.45),oklch(0.7_0.25_340_/_0.4),oklch(0.65_0.22_300_/_0.45),oklch(0.82_0.15_215_/_0.4),oklch(0.82_0.16_85_/_0.45))] blur-3xl opacity-60 animate-conic-spin" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-background to-transparent" })
  ] });
}
function ProgressBar({
  current,
  total,
  label
}) {
  const pct = current / (total - 1) * 100;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2 text-[10px] uppercase tracking-widest text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        current + 1,
        " / ",
        total
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 rounded-full bg-white/10 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full bg-gradient-to-r from-[oklch(0.82_0.16_85)] via-[oklch(0.7_0.25_340)] to-[oklch(0.82_0.15_215)] transition-all duration-500", style: {
      width: `${Math.max(pct, 6)}%`
    } }) })
  ] });
}
function ExtractingScreen({
  screenshotPreview
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-screen w-full overflow-hidden flex items-center justify-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "pointer-events-none absolute inset-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-40 left-1/2 -translate-x-1/2 size-[80vmin] rounded-full bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.45),oklch(0.7_0.25_340_/_0.4),oklch(0.65_0.22_300_/_0.45),oklch(0.82_0.15_215_/_0.4),oklch(0.82_0.16_85_/_0.45))] blur-3xl opacity-60 animate-conic-spin" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-sm w-full mx-auto px-6 py-10 text-center space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "h-10 mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl liquid-glass neon-border p-8 space-y-5", children: [
        screenshotPreview && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto w-36 h-36 rounded-2xl overflow-hidden border border-primary/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: screenshotPreview, alt: "", className: "w-full h-full object-cover opacity-60" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-10 rounded-full border-2 border-primary border-t-transparent animate-spin" }) })
        ] }),
        !screenshotPreview && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-16 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] tracking-[0.35em] text-primary uppercase", children: "Trey-I" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-1 text-xl font-bold", children: "Analyzing your screenshot…" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Extracting your display name, bio, username, and links. This takes a moment." })
        ] })
      ] })
    ] })
  ] });
}
function SectionCard({
  icon: Icon,
  title,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl liquid-glass neon-border p-6 sm:p-8 space-y-5 animate-rise", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-9 rounded-xl bg-white/5 border border-white/10 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-4 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold", children: title })
    ] }),
    children
  ] });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wider", children: label }),
    children
  ] });
}
function SocialInput({
  icon,
  value,
  onChange,
  placeholder
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
    icon && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm", children: icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value, onChange: (e) => onChange(e.target.value), placeholder, className: `w-full h-11 rounded-xl bg-white/5 border border-white/15 ${icon ? "pl-8" : "pl-4"} pr-4 text-sm focus:outline-none focus:border-primary/60 transition` })
  ] });
}
function UsernameHint({
  hint
}) {
  if (!hint || hint === "checking") {
    return hint === "checking" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-3 border border-current border-t-transparent rounded-full animate-spin inline-block" }),
      " Checking…"
    ] }) : null;
  }
  if (hint === "available") return /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-400 flex items-center gap-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3" }),
    " Available"
  ] });
  if (hint === "taken") return /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-red-400 flex items-center gap-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-3" }),
    " Already taken"
  ] });
  if (hint === "invalid") return /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-yellow-400 flex items-center gap-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "size-3" }),
    " Use 3–30 lowercase letters, numbers, or underscores"
  ] });
  return null;
}
function ReviewRow({
  label,
  value,
  missing
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4 py-2 border-b border-white/5 last:border-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs shrink-0 w-28", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-right text-xs ${missing ? "text-yellow-400" : "text-foreground/90"}`, children: value })
  ] });
}
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = result.split(",")[1] ?? result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
export {
  ImportScreenshot as component
};
