import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Check, ChevronLeft, ChevronRight, Crown, FileEdit, FileText, HelpCircle, Loader2, Save, Search, Shield, X, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/brand/Logo";

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
  { label: "Identity", short: "1" },
  { label: "Channel", short: "2" },
  { label: "Content\nStyle", short: "3" },
  { label: "Launch\nPlan", short: "4" },
  { label: "Standards", short: "5" },
  { label: "Review", short: "6" },
];

const C = {
  blue: "oklch(0.82 0.15 215)",
  blueDim: "oklch(0.82 0.15 215 / 0.4)",
  gold: "oklch(0.82 0.16 85)",
};

type ExistingApplication = {
  id: string;
  status: "pending" | "approved" | "rejected" | "revoked";
  review_notes?: string | null;
  updated_at?: string | null;
};

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
        className="w-full px-4 py-3 rounded-xl bg-black/25 border border-[oklch(0.82_0.15_215_/_0.42)] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-[oklch(0.82_0.15_215_/_0.9)] focus:bg-white/8 transition shadow-[inset_0_0_16px_oklch(0.82_0.15_215_/_0.08)]"
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
        className="w-full px-4 py-3 rounded-xl bg-black/25 border border-[oklch(0.82_0.15_215_/_0.42)] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-[oklch(0.82_0.15_215_/_0.9)] focus:bg-white/8 transition resize-none shadow-[inset_0_0_16px_oklch(0.82_0.15_215_/_0.08)]"
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

function Step6({ data, goToStep }: { data: FormData; goToStep: (i: number) => void }) {
  const sections: { n: number; title: string; sub: string; step: number }[] = [
    { n: 1, title: "Your Identity", sub: "Personal information and creator profile", step: 0 },
    { n: 2, title: "Your Channel", sub: "Channel details, category, and branding", step: 1 },
    { n: 3, title: "Your Content Style", sub: "Content focus, format, and unique value", step: 2 },
    { n: 4, title: "Your Launch Plan", sub: "Publishing plan, goals, and growth strategy", step: 3 },
    { n: 5, title: "Community Standards", sub: "Content guidelines and compliance", step: 4 },
    { n: 6, title: "Review & Confirm", sub: "Final review and declarations", step: 5 },
  ];

  const summary: { icon: string; label: string; value: string }[] = [
    { icon: "📺", label: "Channel Name", value: data.channel_name || "—" },
    { icon: "🏷️", label: "Category", value: data.niche || "—" },
    { icon: "📅", label: "Upload Frequency", value: data.posting_frequency || "—" },
    { icon: "🎙️", label: "First Show", value: data.first_content_idea ? data.first_content_idea.slice(0, 40) : "—" },
    { icon: "🛡️", label: "Rights Confirmation", value: data.agreed_to_standards ? "Yes" : "Pending" },
    { icon: "🚀", label: "Launch Timeline", value: data.release_timeline || "—" },
  ];

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Creator Channel{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[oklch(0.82_0.15_215)] to-[oklch(0.92_0.15_220)]">
            Application
          </span>
        </h1>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Review & Submit list */}
        <div className="rounded-3xl p-4 border border-[oklch(0.82_0.15_215_/_0.4)] bg-[oklch(0.10_0.05_220_/_0.6)] shadow-[0_0_40px_-12px_oklch(0.82_0.15_215_/_0.5),inset_0_1px_0_oklch(0.82_0.15_215_/_0.2)]">
          <h3 className="font-bold mb-3">Review &amp; Submit</h3>
          <div className="space-y-2">
            {sections.map((s) => (
              <div key={s.n} className="flex items-center gap-3 p-3 rounded-2xl border border-[oklch(0.82_0.15_215_/_0.25)] bg-[oklch(0.12_0.05_220_/_0.5)]">
                <div className="size-7 rounded-full border border-[oklch(0.82_0.15_215_/_0.5)] grid place-items-center text-[11px] font-bold text-[oklch(0.82_0.15_215)] shrink-0">
                  {s.n}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{s.title}</div>
                  <div className="text-[10px] text-muted-foreground leading-tight">{s.sub}</div>
                </div>
                <button
                  type="button"
                  onClick={() => goToStep(s.step)}
                  className="size-7 rounded-lg border border-[oklch(0.82_0.15_215_/_0.4)] grid place-items-center text-[oklch(0.82_0.15_215)] hover:bg-[oklch(0.82_0.15_215_/_0.1)]"
                  aria-label={`Edit ${s.title}`}
                >
                  <FileEdit className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Application Summary */}
        <div className="rounded-3xl p-4 border border-[oklch(0.82_0.15_215_/_0.4)] bg-[oklch(0.10_0.05_220_/_0.6)] shadow-[0_0_40px_-12px_oklch(0.82_0.15_215_/_0.5),inset_0_1px_0_oklch(0.82_0.15_215_/_0.2)]">
          <h3 className="font-bold mb-3">Application Summary</h3>
          <div className="divide-y divide-[oklch(0.82_0.15_215_/_0.15)]">
            {summary.map((row) => (
              <div key={row.label} className="flex items-center gap-3 py-2.5">
                <div className="size-9 rounded-xl border border-[oklch(0.82_0.15_215_/_0.3)] bg-[oklch(0.82_0.15_215_/_0.08)] grid place-items-center text-base shrink-0">
                  {row.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{row.label}</div>
                  <div className="text-sm font-bold text-[oklch(0.82_0.15_215)] truncate">{row.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[oklch(0.82_0.15_215_/_0.35)] bg-[oklch(0.10_0.05_220_/_0.5)] p-4 flex items-start gap-3">
        <div className="size-10 rounded-xl border border-[oklch(0.82_0.15_215_/_0.5)] bg-[oklch(0.82_0.15_215_/_0.1)] grid place-items-center shrink-0">
          <Check className="size-5 text-[oklch(0.82_0.15_215)]" />
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          By submitting, you confirm that all information provided is accurate and you agree to comply with Trey TV's{" "}
          <span className="text-[oklch(0.82_0.15_215)] font-semibold">Community Guidelines.</span>
        </p>
      </div>
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
  const timeline = [
    { label: "Submitted", Icon: Check, active: true, done: false },
    { label: "Under Review", Icon: Search, active: false, done: false },
    { label: "More Info\nNeeded", Icon: HelpCircle, active: false, done: false },
    { label: "Approved", Icon: Shield, active: false, done: false },
    { label: "Denied", Icon: X, active: false, done: false },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center px-6 pt-16 pb-10 text-center"
      style={{ background: "radial-gradient(ellipse 120% 60% at 50% 0%, oklch(0.18 0.08 230 / 0.55) 0%, #02050B 60%)" }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[oklch(0.82_0.15_215_/_0.10)] blur-[140px]" />
      </div>

      <div className="relative w-full max-w-md flex flex-col items-center">
        {/* Neon folder icon */}
        <div className="relative mb-10">
          <div className="absolute inset-0 -m-8 rounded-full blur-3xl bg-[oklch(0.82_0.15_215_/_0.5)] animate-pulse-glow" />
          <div className="relative size-40 rounded-3xl border-2 border-[oklch(0.82_0.15_215_/_0.7)] bg-[oklch(0.10_0.05_230_/_0.6)] grid place-items-center shadow-[0_0_60px_oklch(0.82_0.15_215_/_0.6),inset_0_0_30px_oklch(0.82_0.15_215_/_0.25)]">
            <FileText className="size-20 text-[oklch(0.82_0.15_215)] drop-shadow-[0_0_18px_oklch(0.82_0.15_215_/_0.9)]" strokeWidth={1.5} />
            <div className="absolute bottom-3 right-3 size-10 rounded-full bg-[oklch(0.82_0.15_215_/_0.2)] border-2 border-[oklch(0.82_0.15_215)] grid place-items-center shadow-[0_0_20px_oklch(0.82_0.15_215_/_0.8)]">
              <Check className="size-5 text-[oklch(0.92_0.15_220)]" strokeWidth={3} />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight leading-tight mb-2">
          Your Creator{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[oklch(0.82_0.15_215)] via-[oklch(0.92_0.15_220)] to-[oklch(0.82_0.15_215)] drop-shadow-[0_0_18px_oklch(0.82_0.15_215_/_0.6)]">
            Application
          </span>{" "}
          Is In!
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-7 max-w-sm">
          We received your channel application.<br />You can check the status from your profile.
        </p>

        <div className="w-full space-y-3 mb-8">
          <button
            onClick={() => navigate({ to: "/applications" })}
            className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 text-white border-2 border-[oklch(0.82_0.15_215_/_0.7)] bg-[oklch(0.14_0.06_230_/_0.6)] shadow-[0_0_30px_oklch(0.82_0.15_215_/_0.5),inset_0_0_20px_oklch(0.82_0.15_215_/_0.15)] hover:shadow-[0_0_40px_oklch(0.82_0.15_215_/_0.7)] transition"
          >
            View Application Status <ChevronRight className="size-4" />
          </button>
          <button
            onClick={() => navigate({ to: "/" })}
            className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 text-[oklch(0.92_0.18_85)] border-2 border-[oklch(0.82_0.16_85_/_0.6)] bg-[oklch(0.14_0.06_85_/_0.4)] shadow-[0_0_24px_oklch(0.82_0.16_85_/_0.4)] hover:shadow-[0_0_32px_oklch(0.82_0.16_85_/_0.6)] transition"
          >
            Back to Trey TV <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Status timeline */}
        <div className="flex items-start w-full">
          {timeline.map((t, i) => (
            <div key={t.label} className="flex items-start flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`size-11 rounded-full border-2 grid place-items-center transition-all ${
                    t.active
                      ? "border-[oklch(0.82_0.15_215)] bg-[oklch(0.82_0.15_215_/_0.2)] shadow-[0_0_18px_oklch(0.82_0.15_215_/_0.8)]"
                      : "border-white/15 bg-white/3"
                  }`}
                >
                  <t.Icon
                    className={`size-4 ${t.active ? "text-[oklch(0.92_0.15_220)]" : "text-muted-foreground"}`}
                    strokeWidth={t.active ? 3 : 2}
                  />
                </div>
                <p
                  className={`text-[9px] text-center mt-1.5 leading-tight whitespace-pre-line font-medium ${
                    t.active ? "text-[oklch(0.82_0.15_215)]" : "text-muted-foreground"
                  }`}
                >
                  {t.label}
                </p>
              </div>
              {i < timeline.length - 1 && (
                <div className="h-px w-2 mt-5 shrink-0 bg-white/10" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExistingApplicationState({ app }: { app: ExistingApplication }) {
  const navigate = useNavigate();
  const statusCopy: Record<ExistingApplication["status"], { title: string; body: string }> = {
    pending: {
      title: "Your Creator Application Is Under Review",
      body: "We already have your channel application in the review queue. You can track the latest status from your applications page.",
    },
    approved: {
      title: "You Are Approved To Create",
      body: "Your creator application has already been approved. Creator tools remain available from your hub.",
    },
    rejected: {
      title: "Application Decision Posted",
      body: "Your creator application has a review decision. Check your applications page for notes from the team.",
    },
    revoked: {
      title: "Creator Access Needs Review",
      body: "Your creator status needs admin review before a new creator application can be submitted.",
    },
  };
  const copy = statusCopy[app.status] ?? statusCopy.pending;

  return (
    <div className="min-h-screen bg-[#02050B] flex items-center justify-center px-5">
      <div className="w-full max-w-md rounded-3xl border border-[oklch(0.82_0.15_215_/_0.35)] bg-[oklch(0.08_0.04_230_/_0.82)] p-6 text-center shadow-[0_0_60px_oklch(0.82_0.15_215_/_0.18)]">
        <div className="mx-auto size-16 rounded-2xl border border-[oklch(0.82_0.15_215_/_0.55)] bg-[oklch(0.82_0.15_215_/_0.14)] grid place-items-center">
          <Crown className="size-8 text-[oklch(0.82_0.15_215)]" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight">{copy.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{copy.body}</p>
        {app.review_notes && (
          <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-muted-foreground italic">
            "{app.review_notes}"
          </p>
        )}
        <div className="mt-6 grid gap-3">
          <button
            onClick={() => navigate({ to: "/applications" })}
            className="w-full py-3.5 rounded-2xl font-bold text-sm text-white border border-[oklch(0.82_0.15_215_/_0.7)] bg-[oklch(0.14_0.06_230_/_0.75)] shadow-[0_0_24px_oklch(0.82_0.15_215_/_0.35)]"
          >
            View Application Status
          </button>
          <button
            onClick={() => navigate({ to: "/" })}
            className="w-full py-3.5 rounded-2xl font-semibold text-sm border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
          >
            Back to Trey TV
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Step progress indicator ───────────────────────────────────────────────────

function CreatorPassport({ data, user, step }: { data: FormData; user: NonNullable<ReturnType<typeof useAuth>["user"]>; step: number }) {
  const percent = Math.round(((step + 1) / TOTAL_STEPS) * 100);
  return (
    <aside className="apply-shell-panel hidden w-full rounded-[28px] p-5 lg:block">
      <div className="flex items-center gap-2 text-xl font-extrabold">
        <Shield className="size-5 text-[oklch(0.82_0.15_215)]" />
        Creator Passport
      </div>
      <div className="mt-6 overflow-hidden rounded-[22px] border border-[oklch(0.82_0.15_215_/_0.45)] bg-black/30">
        <img src={user.avatar} alt="" className="aspect-[4/4.3] w-full object-cover" />
      </div>
      <div className="mt-5 text-center">
        <h3 className="text-3xl font-extrabold">{data.creator_name || user.name}</h3>
        <p className="mt-1 text-lg text-[oklch(0.82_0.15_215)]">
          {data.channel_handle || `@${user.handle}`}
        </p>
        <p className="mt-3 inline-flex items-center gap-2 text-white/75">
          <MapPin className="size-4" /> {data.location || user.location || "Location"}
        </p>
      </div>
      <div className="my-6 h-px bg-white/15" />
      <div className="text-center">
        <p className="text-sm uppercase tracking-wide text-white/55">Creator UID</p>
        <p className="mt-2 text-2xl font-extrabold text-[oklch(0.82_0.15_215)]">{user.uid}</p>
      </div>
      <div className="my-6 h-px bg-white/15" />
      <div
        className="mx-auto grid size-36 place-items-center rounded-full border border-[oklch(0.82_0.15_215_/_0.36)] bg-[conic-gradient(oklch(0.82_0.15_215)_0deg,oklch(0.82_0.15_215)_calc(var(--p)*1deg),oklch(1_0_0_/_0.08)_0)] shadow-[0_0_28px_oklch(0.82_0.15_215_/_0.35)]"
        style={{ "--p": percent * 3.6 } as React.CSSProperties}
      >
        <div className="grid size-28 place-items-center rounded-full bg-[#02050b] text-center">
          <div>
            <div className="text-4xl font-extrabold">{percent}%</div>
            <div className="text-sm text-[oklch(0.82_0.15_215)]">Step {step + 1} of {TOTAL_STEPS}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function StepProgress({ current }: { current: number }) {
  return (
    <div className="px-1">
      <div className="flex items-center">
        {STEPS.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={i} className="flex items-center flex-1">
              <div
                className="relative shrink-0 size-8 sm:size-9 rounded-full grid place-items-center text-xs sm:text-sm font-bold border-2 transition-all duration-300"
                style={{
                  background: done ? C.blue : active ? "oklch(0.82 0.15 215 / 0.18)" : "oklch(1 0 0 / 0.05)",
                  borderColor: done ? C.blue : active ? C.blue : "oklch(1 0 0 / 0.15)",
                  boxShadow: active ? `0 0 18px ${C.blue}` : "none",
                  color: done ? "#fff" : active ? C.blue : "oklch(0.5 0 0)",
                }}
              >
                {done ? <Check className="size-4" /> : s.short}
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px mx-1" style={{ background: done ? C.blue : "oklch(1 0 0 / 0.1)" }} />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex mt-2">
        {STEPS.map((s, i) => {
          const active = i === current;
          const done = i < current;
          return (
            <div key={i} className="flex-1 text-center">
              <span
                className="text-[9px] leading-tight whitespace-pre-line font-semibold"
                style={{ color: active ? C.blue : done ? C.blue : "oklch(0.45 0 0)" }}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-center text-xs font-bold mt-1.5" style={{ color: C.blue }}>
        Step {current + 1} of {STEPS.length}
      </p>
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
  const [existingApp, setExistingApp] = useState<ExistingApplication | null>(null);

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
        const { data: auth } = await supabase.auth.getUser();
        const authUserId = auth.user?.id;
        if (!authUserId) return;

        const { data: existing } = await (supabase as any)
          .from("creator_applications")
          .select("*")
          .eq("application_type", "creator")
          .eq("user_id", authUserId)
          .limit(1)
          .maybeSingle();

        if (cancelled || !existing) return;
        if (!["draft", "needs_more_info"].includes(existing.status)) {
          setExistingApp({
            id: existing.id,
            status: existing.status,
            review_notes: existing.review_notes,
            updated_at: existing.updated_at,
          });
          return;
        }
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

  const buildPayload = (status: "draft" | "pending", userId: string) => ({
    user_id: userId,
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
    const { data: auth } = await supabase.auth.getUser();
    const authUserId = auth.user?.id;
    if (!authUserId) throw new Error("Please sign in before submitting an application.");
    const payload = buildPayload(status, authUserId);
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
  if (existingApp) return <ExistingApplicationState app={existingApp} />;

  return (
    <div className="apply-scroll-page apply-luxe-page flex min-h-[100dvh] flex-col overflow-x-hidden">
      <header className="relative mx-auto flex w-full max-w-5xl shrink-0 items-start justify-between px-4 pt-5">
        <button
          onClick={step === 0 ? () => navigate({ to: "/apply" }) : handleBack}
          className="apply-pill-button flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition"
        >
          <ChevronLeft className="size-4 text-[oklch(0.82_0.15_215)]" /> <span className="hidden sm:inline">Back to Apply</span><span className="sm:hidden">Back</span>
        </button>
        <Logo className="absolute left-1/2 top-3 h-14 sm:h-20 -translate-x-1/2 drop-shadow-[0_0_28px_oklch(0.82_0.16_85_/_0.7)]" />
        <button
          onClick={handleSaveDraft}
          disabled={saving}
          className="apply-pill-button flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-50"
        >
          {saving ? <Loader2 className="size-4 animate-spin text-[oklch(0.82_0.15_215)]" /> : <Save className="size-4 text-[oklch(0.82_0.15_215)]" />}
          Save Draft
        </button>
      </header>

      <div className="shrink-0 px-5 pb-3 pt-14 sm:pt-20 text-center">
        <h1 className="text-4xl font-extrabold tracking-normal sm:text-5xl">
          Creator Channel{" "}
          <span className="text-[oklch(0.82_0.15_215)] drop-shadow-[0_0_20px_oklch(0.82_0.15_215_/_0.7)]">Application</span>
        </h1>
      </div>

      <div className="mx-auto w-full max-w-5xl shrink-0 px-5 pb-5">
        <StepProgress current={step} />
      </div>

      <div className="flex-1 px-4 pb-8">
        <div className="mx-auto grid w-full max-w-5xl gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="apply-shell-panel animate-rise rounded-[28px] p-5 sm:p-6 lg:p-8">
            {step === 0 && <Step1 data={data} set={(k, v) => set(k as keyof FormData, v as any)} />}
            {step === 1 && <Step2 data={data} set={(k, v) => set(k as keyof FormData, v as any)} toggleFormat={toggleFormat} />}
            {step === 2 && <Step3 data={data} set={(k, v) => set(k as keyof FormData, v as any)} toggleFormat={toggleFormat} />}
            {step === 3 && <Step4 data={data} set={(k, v) => set(k as keyof FormData, v as any)} />}
            {step === 4 && <Step5 data={data} setAgreed={(v) => set("agreed_to_standards", v)} />}
            {step === 5 && <Step6 data={data} goToStep={setStep} />}
          </div>
          {user && <CreatorPassport data={data} user={user} step={step} />}
        </div>
      </div>

      <div
        className="shrink-0 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),1rem)]"
        style={{ background: "linear-gradient(180deg, transparent, oklch(0.02 0.01 240 / 0.92))" }}
      >
        <div className="mx-auto flex max-w-5xl gap-4">
          {step > 0 && (
          <button
            onClick={handleBack}
            className="flex-1 py-4 rounded-full font-bold text-sm flex items-center justify-center gap-2 text-white"
            style={{ background: "oklch(0.15 0.05 230 / 0.7)", border: `1px solid ${C.blueDim}` }}
          >
            <ChevronLeft className="size-4" /> Back
          </button>
          )}
          {step < TOTAL_STEPS - 1 ? (
          <button
            onClick={handleNext}
            className="flex-1 py-4 rounded-full font-bold text-sm text-white flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(90deg, oklch(0.45 0.20 230), oklch(0.62 0.22 220))", boxShadow: "0 0 28px oklch(0.82 0.15 215 / 0.55)" }}
          >
            Next Step
            <ChevronRight className="size-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-4 rounded-full font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: "linear-gradient(90deg, oklch(0.45 0.20 230), oklch(0.62 0.22 220))", boxShadow: "0 0 28px oklch(0.82 0.15 215 / 0.55)" }}
          >
            {submitting ? (
              <><Loader2 className="size-4 animate-spin" /> Submitting…</>
            ) : (
              <><Crown className="size-4" /> Submit Application</>
            )}
          </button>
        )}
        </div>
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
