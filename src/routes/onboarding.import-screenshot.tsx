import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft, ArrowRight, Upload, ImageIcon, Check, X,
  Sparkles, AlertCircle, Camera, User, MapPin, Link2,
  Heart, Eye, CheckCircle, Edit3,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { supabase } from "@/integrations/supabase/client";
import {
  startImportJob,
  extractScreenshot,
  saveImportDraft,
  publishImportProfile,
} from "@/lib/trey-i/import-screenshot.server";
import { treyICheckUsername } from "@/lib/trey-i/onboarding.server";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding/import-screenshot")({
  component: ImportScreenshot,
  head: () => ({
    meta: [
      { title: "Import From Screenshot — Trey TV" },
      { name: "description", content: "Upload a screenshot of your public profile and Trey TV will turn it into a draft you can edit before it goes live." },
    ],
  }),
});

// ─── Constants ─────────────────────────────────────────────────────────────────

const CONSENT_TEXT =
  "I confirm that I own or control this profile/page, or I am authorized to use the photos, name, bio, links, and public information shown in this screenshot. I give Trey TV permission to use this uploaded screenshot to create a draft profile. I understand I can review, edit, replace, or remove anything before publishing.";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const CATEGORY_OPTIONS = [
  "Music", "Shows", "Behind the scenes", "Comedy", "Motivation",
  "Creator content", "Exclusive drops", "Sports", "Fashion", "Gaming",
];

const SECTION_LABELS = ["Screenshot", "Profile Images", "Identity", "Bio & Links", "Required Info", "Final Review"];

type Step = "upload" | "extracting" | "review" | "publishing";

type DraftForm = {
  display_name: string;
  username: string;
  bio: string;
  location: string;
  date_of_birth: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  x_handle: string;
  favorite_categories: string[];
  avatarDataUrl: string | null;
  bannerDataUrl: string | null;
  avatarApproved: boolean;
  bannerApproved: boolean;
  show_location: boolean;
  profile_visibility: string;
};

// ─── Component ─────────────────────────────────────────────────────────────────

function ImportScreenshot() {
  const nav = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("upload");
  const [consentChecked, setConsentChecked] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [extractionFallback, setExtractionFallback] = useState(false);
  const [saving, setSaving] = useState(false);
  const [usernameHint, setUsernameHint] = useState<"" | "checking" | "available" | "taken" | "invalid">("");
  const [usernameChecked, setUsernameChecked] = useState("");
  const [activeSection, setActiveSection] = useState(0);

  const [draft, setDraft] = useState<DraftForm>({
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
    profile_visibility: "public",
  });

  // Auth guard
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) nav({ to: "/login" });
      else setAccessToken(data.session.access_token);
    }).catch(() => nav({ to: "/login" }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    
    const loadProgress = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("user_onboarding")
          .select("current_step, selected_path, answers")
          .eq("user_id", user.id)
          .maybeSingle();

        if (data && !data.completed && data.selected_path === "import_screenshot") {
          const answers = data.answers as any;
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
            updated_at: new Date().toISOString()
          }, { onConflict: "user_id" });
        }
      } catch (err) {
        console.error("Failed to load onboarding progress:", err);
      }
    };
    
    loadProgress();
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken || step === "publishing") return;

    const saveProgress = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const stepNum = step === "upload" ? 0 : step === "review" ? 1 : 2;
          await supabase.from("user_onboarding").upsert({
            user_id: user.id,
            selected_path: "import_screenshot",
            current_step: stepNum,
            answers: { step, draft, jobId, consentChecked },
            completed: false,
            updated_at: new Date().toISOString()
          }, { onConflict: "user_id" });
        }
      } catch (err) {
        console.error("Failed to save screenshot onboarding progress:", err);
      }
    };

    const timer = setTimeout(saveProgress, 1000);
    return () => clearTimeout(timer);
  }, [accessToken, step, draft, jobId, consentChecked]);

  const set = useCallback(<K extends keyof DraftForm>(key: K, val: DraftForm[K]) => {
    setDraft((prev) => ({ ...prev, [key]: val }));
  }, []);

  const toggleCategory = useCallback((val: string) => {
    setDraft((prev) => ({
      ...prev,
      favorite_categories: prev.favorite_categories.includes(val)
        ? prev.favorite_categories.filter((x) => x !== val)
        : [...prev.favorite_categories, val],
    }));
  }, []);

  // ─── File selection ───────────────────────────────────────────────────────────

  const handleFileSelect = useCallback((file: File) => {
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
    reader.onload = (e) => setScreenshotPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  // ─── Avatar / banner replacement ─────────────────────────────────────────────

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      set("avatarDataUrl", ev.target?.result as string);
      set("avatarApproved", true);
    };
    reader.readAsDataURL(file);
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      set("bannerDataUrl", ev.target?.result as string);
      set("bannerApproved", true);
    };
    reader.readAsDataURL(file);
  };

  // ─── Username check ───────────────────────────────────────────────────────────

  const checkUsername = useCallback(async (raw: string) => {
    if (!raw || raw === usernameChecked) return;
    setUsernameHint("checking");
    try {
      const result = await treyICheckUsername({ data: { username: raw } });
      setUsernameChecked(raw);
      setUsernameHint(
        result.available ? "available"
        : result.reason === "invalid" ? "invalid"
        : "taken",
      );
    } catch {
      setUsernameChecked(raw);
      setUsernameHint("available");
    }
  }, [usernameChecked]);

  // ─── Start import: record consent + create job ────────────────────────────────

  const handleStartImport = async () => {
    if (!accessToken || !consentChecked || !screenshotFile) return;
    setSaving(true);
    try {
      const { jobId: newJobId } = await startImportJob({
        data: { accessToken, consentAccepted: true },
      });
      setJobId(newJobId);
      setStep("extracting");
      await runExtraction(newJobId, screenshotFile);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start import. Please try again.");
      setSaving(false);
    }
  };

  // ─── Run Gemini extraction ────────────────────────────────────────────────────

  const runExtraction = async (jid: string, file: File) => {
    try {
      const base64 = await fileToBase64(file);
      const { extracted, fallback } = await extractScreenshot({
        data: {
          accessToken: accessToken!,
          jobId: jid,
          imageBase64: base64,
          mimeType: file.type,
        },
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
        favorite_categories: extracted.favorite_categories ?? [],
      }));

      if (fallback) {
        toast("We couldn't read this screenshot automatically, but you can still build your profile from it manually.", { duration: 6000 });
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

  // ─── Publish ──────────────────────────────────────────────────────────────────

  const handlePublish = async () => {
    if (!accessToken) return;

    // Validate required fields
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
      const { publicProfileUid } = await publishImportProfile({
        data: {
          accessToken,
          jobId: jobId ?? "",
          draft: {
            display_name: draft.display_name,
            username: draft.username,
            bio: draft.bio || undefined,
            location: draft.location,
            date_of_birth: draft.date_of_birth,
            instagram: draft.instagram || undefined,
            tiktok: draft.tiktok || undefined,
            youtube: draft.youtube || undefined,
            x_handle: draft.x_handle || undefined,
            favorite_categories: draft.favorite_categories.length ? draft.favorite_categories : undefined,
            show_location: draft.show_location,
            profile_visibility: draft.profile_visibility,
            _jobId: jobId,
          },
        },
      });
      window.location.href = `/u/${publicProfileUid}?tour=1`;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not publish profile. Please check your info and try again.");
      setSaving(false);
      setStep("review");
    }
  };

  // ─── Loading state ────────────────────────────────────────────────────────────

  if (!accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass border border-white/10 rounded-3xl px-10 py-8 text-center space-y-3">
          <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  // ─── Extracting state ─────────────────────────────────────────────────────────

  if (step === "extracting") {
    return <ExtractingScreen screenshotPreview={screenshotPreview} />;
  }

  // ─── Publishing state ─────────────────────────────────────────────────────────

  if (step === "publishing") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass border border-white/10 rounded-3xl px-10 py-8 text-center space-y-4">
          <div className="size-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="font-semibold">Publishing your Trey TV profile…</p>
          <p className="text-xs text-muted-foreground">Almost there. One moment.</p>
        </div>
      </div>
    );
  }

  // ─── Upload step ──────────────────────────────────────────────────────────────

  if (step === "upload") {
    return (
      <div className="relative min-h-screen w-full overflow-hidden">
        <CinematicBackdrop />
        <div className="relative max-w-[600px] mx-auto px-4 pt-6 pb-16">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => nav({ to: "/onboarding" })}
              className="size-9 grid place-items-center rounded-full liquid-glass border border-white/10"
              aria-label="Back"
            >
              <ArrowLeft className="size-4" />
            </button>
            <Logo className="h-7" />
            <div className="size-9" />
          </div>

          {/* Progress */}
          <ProgressBar current={0} total={2} label="Upload" />

          {/* Card */}
          <div className="mt-6 rounded-3xl liquid-glass neon-border p-6 sm:p-8 space-y-6 animate-rise">
            <div>
              <p className="text-[10px] tracking-[0.35em] text-primary uppercase">Import · Step 1 of 2</p>
              <h2 className="mt-1 text-2xl font-bold">Import From Screenshot</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Upload a screenshot of your public profile. Trey TV will turn it into a draft you can edit before it goes live.
              </p>
            </div>

            {/* Drop zone */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer group ${
                screenshotFile
                  ? "border-primary/60 bg-primary/5"
                  : "border-white/15 hover:border-primary/50 bg-white/3"
              } p-4`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="sr-only"
                onChange={onFileChange}
              />
              {screenshotPreview ? (
                <div className="space-y-3">
                  <img
                    src={screenshotPreview}
                    alt="Selected screenshot"
                    className="w-full max-h-64 object-contain rounded-xl"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5 text-primary">
                      <Check className="size-3.5" /> {screenshotFile?.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setScreenshotFile(null); setScreenshotPreview(null); }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-10 flex flex-col items-center gap-3 text-center">
                  <div className="size-14 rounded-2xl border border-white/15 bg-white/5 grid place-items-center group-hover:border-primary/40 transition">
                    <Upload className="size-6 text-muted-foreground group-hover:text-primary transition" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Drop your screenshot here, or click to browse</p>
                    <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, JPEG, WEBP · Max 10MB</p>
                  </div>
                </div>
              )}
            </div>

            {/* Helper */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground/80 flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" /> Best results
              </p>
              <p>Upload a clear screenshot that shows your profile photo, banner if available, display name, username, bio, and public links.</p>
            </div>

            {/* Consent */}
            <div className="space-y-3">
              <label className="flex gap-3 cursor-pointer group">
                <div
                  onClick={() => setConsentChecked((v) => !v)}
                  className={`mt-0.5 shrink-0 size-5 rounded border transition flex items-center justify-center cursor-pointer ${
                    consentChecked
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-white/20 bg-white/5 group-hover:border-primary/50"
                  }`}
                  role="checkbox"
                  aria-checked={consentChecked}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setConsentChecked((v) => !v)}
                >
                  {consentChecked && <Check className="size-3" />}
                </div>
                <span className="text-xs text-muted-foreground leading-relaxed">{CONSENT_TEXT}</span>
              </label>
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={handleStartImport}
              disabled={!consentChecked || !screenshotFile || saving}
              className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-bold text-sm glow-gold inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {saving ? (
                <>
                  <div className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Starting import…
                </>
              ) : (
                <>
                  <ImageIcon className="size-4" />
                  Analyze Screenshot
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>

            {!consentChecked && (
              <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                <AlertCircle className="size-3.5" /> Accept the agreement above to continue.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Review step ──────────────────────────────────────────────────────────────

  const canPublish =
    draft.display_name.trim().length >= 2 &&
    draft.username.trim().length >= 3 &&
    usernameHint === "available" &&
    /^\d{4}-\d{2}-\d{2}$/.test(draft.date_of_birth) &&
    draft.location.trim().length > 0 &&
    draft.favorite_categories.length > 0;

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <CinematicBackdrop />
      <div className="relative max-w-[700px] mx-auto px-4 pt-6 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep("upload")}
            className="size-9 grid place-items-center rounded-full liquid-glass border border-white/10"
            aria-label="Back"
          >
            <ArrowLeft className="size-4" />
          </button>
          <Logo className="h-7" />
          <div className="size-9" />
        </div>

        {/* Progress */}
        <ProgressBar current={1} total={2} label="Review" />

        {/* Heading */}
        <div className="mt-6 animate-rise text-center space-y-1">
          {extractionFallback ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 text-xs">
              <AlertCircle className="size-3.5" />
              Manual mode — fill in the fields below
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs">
              <Sparkles className="size-3.5" />
              Draft imported — review everything before publishing
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl font-bold">Review Your Imported Profile</h2>
          <p className="text-sm text-muted-foreground">Edit any field. Nothing goes live until you click Publish.</p>
        </div>

        {/* Section nav pills */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {SECTION_LABELS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => setActiveSection(i)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                activeSection === i
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/5 border border-white/10 text-muted-foreground hover:border-primary/40"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-5">
          {/* Section 0: Screenshot */}
          {activeSection === 0 && (
            <SectionCard icon={Camera} title="Your Screenshot">
              {screenshotPreview ? (
                <img
                  src={screenshotPreview}
                  alt="Uploaded screenshot"
                  className="w-full rounded-2xl object-contain max-h-72"
                />
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center h-40 text-muted-foreground text-sm">
                  No screenshot preview available
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                This file stays private. Only you can access it.
              </p>
            </SectionCard>
          )}

          {/* Section 1: Profile Images */}
          {activeSection === 1 && (
            <SectionCard icon={ImageIcon} title="Profile Images">
              <input ref={avatarInputRef} type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} />
              <input ref={bannerInputRef} type="file" accept="image/*" className="sr-only" onChange={handleBannerChange} />

              {/* Avatar */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Profile Photo</p>
                <div className="flex items-center gap-4">
                  <div className="size-20 rounded-full overflow-hidden border-2 border-white/15 bg-white/5 flex items-center justify-center shrink-0">
                    {draft.avatarDataUrl ? (
                      <img src={draft.avatarDataUrl} alt="Avatar" className="size-full object-cover" />
                    ) : (
                      <User className="size-8 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl liquid-glass border border-white/15 text-xs font-medium"
                    >
                      <Upload className="size-3" />
                      {draft.avatarDataUrl ? "Replace Photo" : "Upload Photo"}
                    </button>
                    {draft.avatarDataUrl && (
                      <button
                        type="button"
                        onClick={() => { set("avatarDataUrl", null); set("avatarApproved", false); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-3" /> Remove
                      </button>
                    )}
                    {!draft.avatarDataUrl && (
                      <p className="text-xs text-muted-foreground">You can add a photo later from your profile settings.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Banner */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Banner Image</p>
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 h-28 flex items-center justify-center relative">
                  {draft.bannerDataUrl ? (
                    <img src={draft.bannerDataUrl} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-muted-foreground/50 text-sm">No banner</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl liquid-glass border border-white/15 text-xs font-medium"
                  >
                    <Upload className="size-3" />
                    {draft.bannerDataUrl ? "Replace Banner" : "Upload Banner"}
                  </button>
                  {draft.bannerDataUrl && (
                    <button
                      type="button"
                      onClick={() => { set("bannerDataUrl", null); set("bannerApproved", false); }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3" /> Remove
                    </button>
                  )}
                </div>
              </div>
            </SectionCard>
          )}

          {/* Section 2: Identity */}
          {activeSection === 2 && (
            <SectionCard icon={User} title="Identity">
              <Field label="Display Name *">
                <input
                  type="text"
                  value={draft.display_name}
                  onChange={(e) => set("display_name", e.target.value)}
                  placeholder="Your name"
                  maxLength={50}
                  className="w-full h-11 rounded-xl bg-white/5 border border-white/15 px-4 text-sm focus:outline-none focus:border-primary/60 transition"
                />
              </Field>

              <Field label="Username *">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                  <input
                    type="text"
                    value={draft.username}
                    onChange={(e) => {
                      set("username", e.target.value);
                      setUsernameHint("");
                      setUsernameChecked("");
                    }}
                    onBlur={() => checkUsername(draft.username)}
                    placeholder="handle"
                    maxLength={30}
                    className="w-full h-11 rounded-xl bg-white/5 border border-white/15 pl-8 pr-4 text-sm focus:outline-none focus:border-primary/60 transition"
                  />
                </div>
                <UsernameHint hint={usernameHint} />
              </Field>
            </SectionCard>
          )}

          {/* Section 3: Bio & Links */}
          {activeSection === 3 && (
            <SectionCard icon={Edit3} title="Bio & Links">
              <Field label="Bio">
                <textarea
                  value={draft.bio}
                  onChange={(e) => set("bio", e.target.value)}
                  placeholder="A short bio about you…"
                  maxLength={160}
                  rows={3}
                  className="w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-sm focus:outline-none focus:border-primary/60 transition resize-none"
                />
                <p className="text-right text-xs text-muted-foreground">{draft.bio.length}/160</p>
              </Field>

              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Instagram">
                  <SocialInput icon="@" value={draft.instagram} onChange={(v) => set("instagram", v)} placeholder="username" />
                </Field>
                <Field label="TikTok">
                  <SocialInput icon="@" value={draft.tiktok} onChange={(v) => set("tiktok", v)} placeholder="username" />
                </Field>
                <Field label="YouTube">
                  <SocialInput icon="" value={draft.youtube} onChange={(v) => set("youtube", v)} placeholder="channel / URL" />
                </Field>
                <Field label="X / Twitter">
                  <SocialInput icon="@" value={draft.x_handle} onChange={(v) => set("x_handle", v)} placeholder="handle" />
                </Field>
              </div>
            </SectionCard>
          )}

          {/* Section 4: Required Trey TV Info */}
          {activeSection === 4 && (
            <SectionCard icon={MapPin} title="Required Info">
              <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4 text-xs text-muted-foreground space-y-1">
                <p className="text-foreground/80 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="size-3.5 text-primary" /> These fields are required
                </p>
                <p>Date of birth and location are never imported automatically — you must enter them yourself for privacy.</p>
              </div>

              <Field label="Date of Birth *">
                <input
                  type="date"
                  value={draft.date_of_birth}
                  onChange={(e) => set("date_of_birth", e.target.value)}
                  max={new Date(Date.now() - 13 * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                  className="w-full h-11 rounded-xl bg-white/5 border border-white/15 px-4 text-sm focus:outline-none focus:border-primary/60 transition"
                />
                <p className="text-xs text-muted-foreground">Used to verify age. Stored privately.</p>
              </Field>

              <Field label="Broad Location *">
                <input
                  type="text"
                  value={draft.location}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder="e.g. Atlanta, GA or UK"
                  maxLength={50}
                  className="w-full h-11 rounded-xl bg-white/5 border border-white/15 px-4 text-sm focus:outline-none focus:border-primary/60 transition"
                />
                <p className="text-xs text-muted-foreground">City, region, or country only. No street addresses.</p>
              </Field>

              <Field label="Content Interests * (pick at least one)">
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                        draft.favorite_categories.includes(cat)
                          ? "bg-primary text-primary-foreground"
                          : "bg-white/5 border border-white/15 text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </Field>

              <div className="flex items-center justify-between">
                <span className="text-sm">Show location on profile</span>
                <button
                  type="button"
                  onClick={() => set("show_location", !draft.show_location)}
                  className={`relative w-10 h-6 rounded-full transition ${draft.show_location ? "bg-primary" : "bg-white/10"}`}
                >
                  <span className={`absolute top-1 size-4 rounded-full bg-white transition-all ${draft.show_location ? "left-5" : "left-1"}`} />
                </button>
              </div>
            </SectionCard>
          )}

          {/* Section 5: Final Review */}
          {activeSection === 5 && (
            <SectionCard icon={CheckCircle} title="Final Review">
              <div className="space-y-3 text-sm">
                <ReviewRow label="Display Name" value={draft.display_name || "—"} missing={!draft.display_name} />
                <ReviewRow label="Username" value={draft.username ? `@${draft.username}` : "—"} missing={!draft.username} />
                <ReviewRow label="Bio" value={draft.bio || "Not set"} />
                <ReviewRow label="Location" value={draft.location || "—"} missing={!draft.location} />
                <ReviewRow label="Date of Birth" value={draft.date_of_birth || "—"} missing={!draft.date_of_birth} />
                <ReviewRow label="Interests" value={draft.favorite_categories.length ? draft.favorite_categories.join(", ") : "—"} missing={!draft.favorite_categories.length} />
                <ReviewRow label="Instagram" value={draft.instagram || "Not set"} />
                <ReviewRow label="TikTok" value={draft.tiktok || "Not set"} />
                <ReviewRow label="Avatar" value={draft.avatarDataUrl ? "Uploaded" : "None (can add later)"} />
                <ReviewRow label="Banner" value={draft.bannerDataUrl ? "Uploaded" : "None (can add later)"} />
              </div>

              {!canPublish && (
                <div className="rounded-2xl bg-yellow-500/10 border border-yellow-500/20 p-4 text-xs text-yellow-400 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5"><AlertCircle className="size-3.5" /> Missing required fields</p>
                  <ul className="list-disc list-inside space-y-0.5 text-yellow-400/80">
                    {draft.display_name.trim().length < 2 && <li>Display name (section 3)</li>}
                    {(draft.username.trim().length < 3 || usernameHint === "taken") && <li>Valid username (section 3)</li>}
                    {!/^\d{4}-\d{2}-\d{2}$/.test(draft.date_of_birth) && <li>Date of birth (section 5)</li>}
                    {!draft.location.trim() && <li>Location (section 5)</li>}
                    {draft.favorite_categories.length === 0 && <li>At least one content interest (section 5)</li>}
                  </ul>
                </div>
              )}

              <button
                type="button"
                onClick={handlePublish}
                disabled={!canPublish || saving}
                className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-bold text-sm glow-gold inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <Sparkles className="size-4" />
                {saving ? "Publishing…" : "Publish My Trey TV Profile"}
              </button>

              <p className="text-center text-xs text-muted-foreground">
                By publishing you confirm this is your real profile information.
              </p>
            </SectionCard>
          )}
        </div>

        {/* Bottom section nav */}
        <div className="mt-6 flex justify-between gap-3">
          <button
            type="button"
            onClick={() => setActiveSection((s) => Math.max(0, s - 1))}
            disabled={activeSection === 0}
            className="h-11 px-5 rounded-2xl liquid-glass border border-white/15 text-sm font-medium inline-flex items-center gap-2 disabled:opacity-40"
          >
            <ArrowLeft className="size-4" /> Back
          </button>
          {activeSection < SECTION_LABELS.length - 1 ? (
            <button
              type="button"
              onClick={() => setActiveSection((s) => Math.min(SECTION_LABELS.length - 1, s + 1))}
              className="h-11 px-5 rounded-2xl bg-primary/20 border border-primary/30 text-primary text-sm font-medium inline-flex items-center gap-2"
            >
              Next <ArrowRight className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              disabled={!canPublish || saving}
              className="h-11 px-5 rounded-2xl bg-primary text-primary-foreground text-sm font-bold glow-gold inline-flex items-center gap-2 disabled:opacity-40"
            >
              <Sparkles className="size-4" />
              {saving ? "Publishing…" : "Publish Profile"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function CinematicBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[80vmin] rounded-full bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.45),oklch(0.7_0.25_340_/_0.4),oklch(0.65_0.22_300_/_0.45),oklch(0.82_0.15_215_/_0.4),oklch(0.82_0.16_85_/_0.45))] blur-3xl opacity-60 animate-conic-spin" />
      <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}

function ProgressBar({ current, total, label }: { current: number; total: number; label: string }) {
  const pct = (current / (total - 1)) * 100;
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>{label}</span>
        <span>{current + 1} / {total}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[oklch(0.82_0.16_85)] via-[oklch(0.7_0.25_340)] to-[oklch(0.82_0.15_215)] transition-all duration-500"
          style={{ width: `${Math.max(pct, 6)}%` }}
        />
      </div>
    </div>
  );
}

function ExtractingScreen({ screenshotPreview }: { screenshotPreview: string | null }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[80vmin] rounded-full bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.45),oklch(0.7_0.25_340_/_0.4),oklch(0.65_0.22_300_/_0.45),oklch(0.82_0.15_215_/_0.4),oklch(0.82_0.16_85_/_0.45))] blur-3xl opacity-60 animate-conic-spin" />
      </div>
      <div className="relative max-w-sm w-full mx-auto px-6 py-10 text-center space-y-6">
        <Logo className="h-10 mx-auto" />
        <div className="rounded-3xl liquid-glass neon-border p-8 space-y-5">
          {screenshotPreview && (
            <div className="relative mx-auto w-36 h-36 rounded-2xl overflow-hidden border border-primary/30">
              <img src={screenshotPreview} alt="" className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="size-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            </div>
          )}
          {!screenshotPreview && (
            <div className="size-16 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          )}
          <div>
            <p className="text-[10px] tracking-[0.35em] text-primary uppercase">Trey-I</p>
            <h3 className="mt-1 text-xl font-bold">Analyzing your screenshot…</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Extracting your display name, bio, username, and links. This takes a moment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl liquid-glass neon-border p-6 sm:p-8 space-y-5 animate-rise">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-xl bg-white/5 border border-white/10 grid place-items-center">
          <Icon className="size-4 text-primary" />
        </div>
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function SocialInput({ icon, value, onChange, placeholder }: { icon: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{icon}</span>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full h-11 rounded-xl bg-white/5 border border-white/15 ${icon ? "pl-8" : "pl-4"} pr-4 text-sm focus:outline-none focus:border-primary/60 transition`}
      />
    </div>
  );
}

function UsernameHint({ hint }: { hint: string }) {
  if (!hint || hint === "checking") {
    return hint === "checking" ? (
      <p className="text-xs text-muted-foreground flex items-center gap-1"><span className="size-3 border border-current border-t-transparent rounded-full animate-spin inline-block" /> Checking…</p>
    ) : null;
  }
  if (hint === "available") return <p className="text-xs text-green-400 flex items-center gap-1"><Check className="size-3" /> Available</p>;
  if (hint === "taken") return <p className="text-xs text-red-400 flex items-center gap-1"><X className="size-3" /> Already taken</p>;
  if (hint === "invalid") return <p className="text-xs text-yellow-400 flex items-center gap-1"><AlertCircle className="size-3" /> Use 3–30 lowercase letters, numbers, or underscores</p>;
  return null;
}

function ReviewRow({ label, value, missing }: { label: string; value: string; missing?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-white/5 last:border-0">
      <span className="text-muted-foreground text-xs shrink-0 w-28">{label}</span>
      <span className={`text-right text-xs ${missing ? "text-yellow-400" : "text-foreground/90"}`}>{value}</span>
    </div>
  );
}

// ─── Utilities ──────────────────────────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip data URL prefix — only send the raw base64 bytes
      const base64 = result.split(",")[1] ?? result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
