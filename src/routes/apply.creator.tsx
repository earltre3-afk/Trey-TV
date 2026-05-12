import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, ArrowRight, Check, Crown, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/apply/creator")({
  component: CreatorApplication,
  head: () => ({
    meta: [{ title: "Apply to Create — Trey TV" }],
  }),
});

// ── Types ─────────────────────────────────────────────────────────────────────

type FormData = {
  // Step 1
  creator_name: string;
  channel_handle: string;
  location: string;
  // Step 2
  channel_name: string;
  niche: string;
  bio: string;
  // Step 3
  content_formats: string[];
  posting_frequency: string;
  target_audience: string;
  // Step 4
  first_content_idea: string;
  release_timeline: string;
  reason: string;
  // Step 5
  agreed_to_standards: boolean;
};

const EMPTY: FormData = {
  creator_name: "",
  channel_handle: "",
  location: "",
  channel_name: "",
  niche: "",
  bio: "",
  content_formats: [],
  posting_frequency: "",
  target_audience: "",
  first_content_idea: "",
  release_timeline: "",
  reason: "",
  agreed_to_standards: false,
};

const NICHES = ["Music", "Film & TV", "Comedy", "Lifestyle", "Sports", "Gaming", "Food", "Fashion", "Tech", "Education", "News", "Art", "Fitness", "Travel", "Business"];
const FORMATS = ["Video", "Short-form", "Music", "Podcast", "Live Stream", "Documentary", "Tutorials"];
const FREQUENCIES = ["Daily", "3–4x per week", "Weekly", "2x per month", "Monthly"];
const TIMELINES = ["Within 1 week", "2–4 weeks", "1–3 months", "3+ months"];
const TOTAL_STEPS = 6;

const STEPS = [
  { label: "Identity", short: "You" },
  { label: "Channel", short: "Channel" },
  { label: "Content Style", short: "Style" },
  { label: "Launch Plan", short: "Launch" },
  { label: "Standards", short: "Standards" },
  { label: "Review", short: "Review" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function InputField({
  label, value, onChange, placeholder, required, maxLength,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; maxLength?: number;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}{required && <span className="text-[oklch(0.7_0.25_340)] ml-0.5">*</span>}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition"
      />
      {maxLength && value.length > maxLength * 0.8 && (
        <div className="text-right text-[10px] text-muted-foreground">{value.length}/{maxLength}</div>
      )}
    </div>
  );
}

function TextareaField({
  label, value, onChange, placeholder, rows = 3, required, maxLength,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number; required?: boolean; maxLength?: number;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}{required && <span className="text-[oklch(0.7_0.25_340)] ml-0.5">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition resize-none"
      />
      {maxLength && (
        <div className="text-right text-[10px] text-muted-foreground">{value.length}/{maxLength}</div>
      )}
    </div>
  );
}

function PillSelect({ label, options, value, onToggle, single }: {
  label: string; options: string[]; value: string | string[];
  onToggle: (v: string) => void; single?: boolean;
}) {
  const isActive = (o: string) =>
    Array.isArray(value) ? value.includes(o) : value === o;

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onToggle(o)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              isActive(o)
                ? "bg-primary/20 border-primary/60 text-primary glow-gold"
                : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Step components ───────────────────────────────────────────────────────────

function Step1({ data, set }: { data: FormData; set: (k: keyof FormData, v: string) => void }) {
  return (
    <div className="space-y-5">
      <StepHeader
        icon={<Crown className="size-6 text-primary" />}
        title="Your Identity"
        sub="Tell us who you are as a creator."
      />
      <InputField
        label="Creator Name"
        value={data.creator_name}
        onChange={(v) => set("creator_name", v)}
        placeholder="Your public creator name"
        required
        maxLength={60}
      />
      <InputField
        label="Channel Handle"
        value={data.channel_handle}
        onChange={(v) => set("channel_handle", v.replace(/[^a-zA-Z0-9_.]/g, "").toLowerCase())}
        placeholder="@yourhandle"
        required
        maxLength={30}
      />
      <InputField
        label="Location"
        value={data.location}
        onChange={(v) => set("location", v)}
        placeholder="City, State or Country"
        maxLength={60}
      />
    </div>
  );
}

function Step2({ data, set, toggleFormat }: {
  data: FormData;
  set: (k: keyof FormData, v: string) => void;
  toggleFormat: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <StepHeader
        icon={<span className="text-2xl">📺</span>}
        title="Your Channel"
        sub="Describe what your channel is all about."
      />
      <InputField
        label="Channel Name"
        value={data.channel_name}
        onChange={(v) => set("channel_name", v)}
        placeholder="e.g. The Daily Frequency"
        required
        maxLength={80}
      />
      <PillSelect
        label="Content Category / Niche"
        options={NICHES}
        value={data.niche}
        onToggle={(v) => set("niche", data.niche === v ? "" : v)}
        single
      />
      <TextareaField
        label="Channel Description"
        value={data.bio}
        onChange={(v) => set("bio", v)}
        placeholder="What is your channel about? Who is it for? What makes it unique?"
        rows={4}
        required
        maxLength={500}
      />
    </div>
  );
}

function Step3({ data, set, toggleFormat }: {
  data: FormData;
  set: (k: keyof FormData, v: string) => void;
  toggleFormat: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <StepHeader
        icon={<span className="text-2xl">🎬</span>}
        title="Content Style"
        sub="How and how often will you publish?"
      />
      <PillSelect
        label="Content Formats"
        options={FORMATS}
        value={data.content_formats}
        onToggle={toggleFormat}
      />
      <PillSelect
        label="Posting Frequency"
        options={FREQUENCIES}
        value={data.posting_frequency}
        onToggle={(v) => set("posting_frequency", data.posting_frequency === v ? "" : v)}
        single
      />
      <TextareaField
        label="Target Audience"
        value={data.target_audience}
        onChange={(v) => set("target_audience", v)}
        placeholder="Who is your content for? Age range, interests, demographic?"
        rows={3}
        maxLength={300}
      />
    </div>
  );
}

function Step4({ data, set }: { data: FormData; set: (k: keyof FormData, v: string) => void }) {
  return (
    <div className="space-y-5">
      <StepHeader
        icon={<span className="text-2xl">🚀</span>}
        title="Launch Plan"
        sub="Tell us how you'll hit the ground running."
      />
      <TextareaField
        label="First Content Idea"
        value={data.first_content_idea}
        onChange={(v) => set("first_content_idea", v)}
        placeholder="Describe your first piece of content — what's the hook? What makes it shareable?"
        rows={3}
        required
        maxLength={400}
      />
      <PillSelect
        label="Release Timeline"
        options={TIMELINES}
        value={data.release_timeline}
        onToggle={(v) => set("release_timeline", data.release_timeline === v ? "" : v)}
        single
      />
      <TextareaField
        label="Why Trey TV?"
        value={data.reason}
        onChange={(v) => set("reason", v)}
        placeholder="Why do you want to create on Trey TV? What are your goals for your channel?"
        rows={3}
        required
        maxLength={400}
      />
    </div>
  );
}

function Step5({ data, setAgreed }: { data: FormData; setAgreed: (v: boolean) => void }) {
  const standards = [
    "I will publish original, authentic content that I have the rights to.",
    "I will not post content that is hateful, harmful, or violates Trey TV's community guidelines.",
    "I will engage respectfully with my audience and other creators.",
    "I understand that my application may be reviewed and I may be asked to provide more information.",
    "I agree to Trey TV's Creator Terms of Service and Content Policy.",
  ];

  return (
    <div className="space-y-5">
      <StepHeader
        icon={<span className="text-2xl">🤝</span>}
        title="Community Standards"
        sub="Every creator on Trey TV upholds these commitments."
      />
      <div className="space-y-3">
        {standards.map((s, i) => (
          <div key={i} className="flex gap-3 p-3 rounded-2xl bg-white/3 border border-white/8">
            <div className="size-5 rounded-full border border-primary/40 bg-primary/10 grid place-items-center shrink-0 mt-0.5">
              <Check className="size-3 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{s}</p>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setAgreed(!data.agreed_to_standards)}
        className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${
          data.agreed_to_standards
            ? "border-primary/60 bg-primary/10 text-primary"
            : "border-white/15 bg-white/3 text-muted-foreground hover:border-white/25"
        }`}
      >
        <div className={`size-6 rounded-lg border-2 grid place-items-center transition-all ${
          data.agreed_to_standards ? "border-primary bg-primary" : "border-muted-foreground"
        }`}>
          {data.agreed_to_standards && <Check className="size-3.5 text-primary-foreground" />}
        </div>
        <span className="text-sm font-semibold">I agree to all community standards</span>
      </button>
    </div>
  );
}

function Step6({ data }: { data: FormData }) {
  const fields: { label: string; value: string }[] = [
    { label: "Creator Name", value: data.creator_name },
    { label: "Handle", value: data.channel_handle ? `@${data.channel_handle}` : "" },
    { label: "Location", value: data.location },
    { label: "Channel", value: data.channel_name },
    { label: "Niche", value: data.niche },
    { label: "Formats", value: data.content_formats.join(", ") },
    { label: "Frequency", value: data.posting_frequency },
    { label: "Launch Timeline", value: data.release_timeline },
  ].filter((f) => f.value);

  return (
    <div className="space-y-5">
      <StepHeader
        icon={<span className="text-2xl">✅</span>}
        title="Review & Submit"
        sub="Everything looks right? Submit your application."
      />
      <div className="rounded-2xl border border-white/10 bg-white/3 divide-y divide-white/5">
        {fields.map((f) => (
          <div key={f.label} className="flex items-start gap-3 px-4 py-3">
            <span className="text-xs text-muted-foreground w-28 shrink-0 pt-0.5">{f.label}</span>
            <span className="text-sm font-medium flex-1">{f.value}</span>
          </div>
        ))}
      </div>
      {data.bio && (
        <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
          <div className="text-xs text-muted-foreground mb-2">Channel Description</div>
          <p className="text-sm leading-relaxed">{data.bio}</p>
        </div>
      )}
      {data.reason && (
        <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
          <div className="text-xs text-muted-foreground mb-2">Why Trey TV?</div>
          <p className="text-sm leading-relaxed">{data.reason}</p>
        </div>
      )}
      <p className="text-xs text-muted-foreground text-center leading-relaxed">
        Our team reviews applications within 3–5 business days. You'll be notified by email and in-app.
      </p>
    </div>
  );
}

function StepHeader({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="size-12 rounded-2xl liquid-glass border border-white/10 grid place-items-center shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

function Submitted() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#02050B] flex flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-8">
        <div className="size-24 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 border border-primary/50 glow-gold grid place-items-center mx-auto">
          <Crown className="size-12 text-primary" />
        </div>
        <span className="absolute -bottom-1 -right-1 text-3xl">✨</span>
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight mb-3">
        Application{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[oklch(0.9_0.18_85)] to-primary">
          Submitted!
        </span>
      </h1>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-8">
        Your creator application is in the queue. Our team reviews applications within 3–5 business days and will reach out to you via email and in-app notification.
      </p>
      <div className="w-full max-w-xs space-y-3">
        <button
          onClick={() => navigate({ to: "/applications" })}
          className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold glow-gold hover-scale"
        >
          Track My Application
        </button>
        <button
          onClick={() => navigate({ to: "/" })}
          className="w-full py-3 rounded-2xl liquid-glass border border-white/15 text-sm font-semibold text-muted-foreground hover:text-foreground transition"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

// ── Step progress indicator ───────────────────────────────────────────────────

function StepProgress({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1 mb-6">
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={s.label} className="flex items-center flex-1">
            <div
              className={`relative shrink-0 size-7 rounded-full grid place-items-center text-[10px] font-bold border transition-all duration-300 ${
                done
                  ? "bg-primary border-primary text-primary-foreground"
                  : active
                  ? "bg-primary/20 border-primary/70 text-primary glow-gold"
                  : "bg-white/5 border-white/15 text-muted-foreground"
              }`}
            >
              {done ? <Check className="size-3.5" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-1 transition-colors duration-300 ${done ? "bg-primary/60" : "bg-white/10"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Validation ────────────────────────────────────────────────────────────────

function validateStep(step: number, data: FormData): string | null {
  if (step === 0) {
    if (!data.creator_name.trim()) return "Creator name is required.";
    if (!data.channel_handle.trim()) return "Channel handle is required.";
  }
  if (step === 1) {
    if (!data.channel_name.trim()) return "Channel name is required.";
    if (!data.bio.trim()) return "Channel description is required.";
  }
  if (step === 3) {
    if (!data.first_content_idea.trim()) return "First content idea is required.";
    if (!data.reason.trim()) return "Tell us why you want to create on Trey TV.";
  }
  if (step === 4) {
    if (!data.agreed_to_standards) return "You must agree to the community standards.";
  }
  return null;
}

// ── Main component ────────────────────────────────────────────────────────────

function CreatorApplication() {
  const { isGuest, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [appId, setAppId] = useState<string | null>(null);

  useEffect(() => {
    if (isGuest) {
      try { sessionStorage.setItem("treytv_post_auth_redirect", "/apply/creator"); } catch {}
      navigate({ to: "/login" });
    }
  }, [isGuest, navigate]);

  // Load existing draft on mount
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void (async () => {
      try {
        const { data: existing } = await (supabase as any)
          .from("creator_applications")
          .select("*")
          .eq("application_type", "creator")
          .in("status", ["draft", "needs_more_info"])
          .limit(1)
          .maybeSingle();

        if (cancelled || !existing) return;
        setAppId(existing.id);
        setData({
          creator_name: existing.creator_name ?? "",
          channel_handle: existing.channel_handle ?? "",
          location: existing.location ?? "",
          channel_name: existing.channel_name ?? "",
          niche: existing.niche ?? "",
          bio: existing.bio ?? "",
          content_formats: existing.content_formats ?? [],
          posting_frequency: existing.posting_frequency ?? "",
          target_audience: existing.target_audience ?? "",
          first_content_idea: existing.first_content_idea ?? "",
          release_timeline: existing.release_timeline ?? "",
          reason: existing.reason ?? "",
          agreed_to_standards: existing.agreed_to_standards ?? false,
        });
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [user?.uid]);

  const set = useCallback(<K extends keyof FormData>(k: K, v: FormData[K]) => {
    setData((prev) => ({ ...prev, [k]: v }));
  }, []);

  const toggleFormat = useCallback((fmt: string) => {
    setData((prev) => ({
      ...prev,
      content_formats: prev.content_formats.includes(fmt)
        ? prev.content_formats.filter((f) => f !== fmt)
        : [...prev.content_formats, fmt],
    }));
  }, []);

  const buildPayload = (status: "draft" | "pending") => ({
    application_type: "creator",
    status,
    creator_name: data.creator_name,
    channel_handle: data.channel_handle,
    location: data.location,
    channel_name: data.channel_name,
    niche: data.niche,
    bio: data.bio,
    content_formats: data.content_formats,
    posting_frequency: data.posting_frequency,
    target_audience: data.target_audience,
    first_content_idea: data.first_content_idea,
    release_timeline: data.release_timeline,
    reason: data.reason,
    agreed_to_standards: data.agreed_to_standards,
    updated_at: new Date().toISOString(),
  });

  const upsert = async (status: "draft" | "pending") => {
    const payload = buildPayload(status);
    if (appId) {
      const { error } = await (supabase as any)
        .from("creator_applications")
        .update(payload)
        .eq("id", appId);
      if (error) throw error;
      return appId;
    } else {
      const { data: row, error } = await (supabase as any)
        .from("creator_applications")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw error;
      setAppId(row.id);
      return row.id as string;
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await upsert("draft");
      toast.success("Draft saved!");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save draft.");
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    const err = validateStep(step, data);
    if (err) { toast.error(err); return; }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await upsert("pending");
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isGuest) return null;
  if (submitted) return <Submitted />;

  return (
    <div className="bg-[#02050B] flex flex-col overflow-hidden" style={{ height: "100dvh" }}>
      {/* Header */}
      <header className="flex items-center gap-3 px-5 pt-[env(safe-area-inset-top)] pb-3 border-b border-white/5 sticky top-0 z-30 bg-[#02050B]/90 backdrop-blur-md">
        <button
          onClick={step === 0 ? () => navigate({ to: "/apply" }) : handleBack}
          className="size-9 grid place-items-center rounded-xl glass text-muted-foreground hover:text-foreground transition shrink-0"
          aria-label="Back"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="flex-1 text-center">
          <div className="text-xs text-muted-foreground tracking-wide">
            Step {step + 1} of {TOTAL_STEPS}
          </div>
          <div className="text-sm font-bold">{STEPS[step]?.label}</div>
        </div>
        <button
          onClick={handleSaveDraft}
          disabled={saving}
          className="size-9 grid place-items-center rounded-xl glass text-muted-foreground hover:text-primary transition shrink-0"
          aria-label="Save draft"
          title="Save draft"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        </button>
      </header>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-6 max-w-lg mx-auto w-full">
        <StepProgress current={step} />

        <div className="animate-rise">
          {step === 0 && <Step1 data={data} set={(k, v) => set(k as keyof FormData, v as any)} />}
          {step === 1 && <Step2 data={data} set={(k, v) => set(k as keyof FormData, v as any)} toggleFormat={toggleFormat} />}
          {step === 2 && <Step3 data={data} set={(k, v) => set(k as keyof FormData, v as any)} toggleFormat={toggleFormat} />}
          {step === 3 && <Step4 data={data} set={(k, v) => set(k as keyof FormData, v as any)} />}
          {step === 4 && <Step5 data={data} setAgreed={(v) => set("agreed_to_standards", v)} />}
          {step === 5 && <Step6 data={data} />}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-4 border-t border-white/5 bg-[#02050B]/90 backdrop-blur-md">
        {step < TOTAL_STEPS - 1 ? (
          <button
            onClick={handleNext}
            className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm glow-gold hover-scale flex items-center justify-center gap-2"
          >
            Continue
            <ArrowRight className="size-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm glow-gold hover-scale flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <><Loader2 className="size-4 animate-spin" /> Submitting…</>
            ) : (
              <><Crown className="size-4" /> Submit Application</>
            )}
          </button>
        )}
        <div className="mt-2 text-center">
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="text-xs text-muted-foreground hover:text-foreground transition inline-flex items-center gap-1.5"
          >
            <Save className="size-3" />
            {saving ? "Saving…" : "Save draft & come back later"}
          </button>
        </div>
      </div>
    </div>
  );
}
