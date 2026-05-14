import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AtSign, BadgeCheck, ChevronRight, FileCheck2, FileText, HelpCircle, Mail, Pencil, Search, ShieldCheck, Sparkles, User, X } from "lucide-react";
import { toast } from "sonner";
import { ApplicationWizardChrome, ChipPicker, Field, NeonCheckList, NeonInput, NeonSelect, NeonTextarea, WizardNav } from "@/components/apply/ApplicationWizardChrome";
import { CreatorPassport } from "@/components/apply/CreatorPassport";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/apply/go-verification")({
  component: GoVerificationApplication,
  head: () => ({ meta: [{ title: "Go Verification Badge Application - Trey TV" }] }),
});

const STEPS = ["Badge Identity", "Notability", "Official Links", "Safety Check", "Review"] as const;
const CATEGORIES = ["Artist / Musician", "Actor / Performer", "Athlete", "Public Figure", "Brand / Business", "Creator / Influencer", "Journalist / Press", "Organization", "Other"];
const ACKS = [
  "I am the person, brand, or authorized representative for this account.",
  "I understand Go verification is for notability or official identity, not popularity alone.",
  "I understand Trey TV can deny or remove verification for impersonation, false information, or policy violations.",
  "I understand verification does not guarantee promotion, payment, creator approval, or special ranking.",
  "I understand Trey TV may request more information before making a decision.",
];

type VerifDraft = {
  displayName: string;
  username: string;
  email: string;
  category: string;
  title: string;
  bio: string;
  reason: string;
  notabilityTypes: string[];
  recognitionDescription: string;
  achievements: string;
  pressMentions: string;
  releases: string;
  officialLinks: string[];
  proofLinks: string[];
  acks: boolean[];
  impersonationNote: string;
};

const EMPTY: VerifDraft = {
  displayName: "",
  username: "",
  email: "",
  category: "",
  title: "",
  bio: "",
  reason: "",
  notabilityTypes: [],
  recognitionDescription: "",
  achievements: "",
  pressMentions: "",
  releases: "",
  officialLinks: ["", "", ""],
  proofLinks: ["", "", ""],
  acks: [false, false, false, false, false],
  impersonationNote: "",
};

function GoVerificationApplication() {
  const { isGuest, user } = useAuth();
  const navigate = useNavigate();
  const [authSettled, setAuthSettled] = useState(false);
  const [data, setData] = useState<VerifDraft>(EMPTY);
  const [step, setStep] = useState(1);
  const [appId, setAppId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setAuthSettled(true), 200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (authSettled && isGuest) {
      try { sessionStorage.setItem("treytv_post_auth_redirect", "/apply/go-verification"); } catch {}
      navigate({ to: "/login" });
    }
  }, [authSettled, isGuest, navigate]);

  useEffect(() => {
    if (!user) return;
    setData((prev) => ({
      ...prev,
      displayName: prev.displayName || user.name || "",
      username: prev.username || (user.handle ? `@${user.handle}` : ""),
      bio: prev.bio || user.bio || "",
      officialLinks: [
        prev.officialLinks[0] || user.link || "",
        prev.officialLinks[1] || user.socialInstagram || "",
        prev.officialLinks[2] || user.socialYouTube || user.socialTikTok || "",
      ],
    }));
  }, [user?.uid]);

  const update = (patch: Partial<VerifDraft>) => setData((prev) => ({ ...prev, ...patch }));
  const next = () => {
    const err = validate(step, data);
    if (err) { toast.error(err); return; }
    setStep((s) => Math.min(STEPS.length, s + 1));
  };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const save = async (status: "draft" | "pending") => {
    const { data: auth } = await supabase.auth.getUser();
    const authUserId = auth.user?.id;
    if (!authUserId) throw new Error("Please sign in with your Trey TV account before submitting.");
    const payload = { user_id: authUserId, application_type: "verification", status, verification_data: { ...data, public_profile_uid: user?.uid }, updated_at: new Date().toISOString() };
    if (appId) {
      const { error } = await (supabase as any).from("creator_applications").update(payload).eq("id", appId);
      if (error) throw error;
      return appId;
    }
    const { data: row, error } = await (supabase as any).from("creator_applications").insert(payload).select("id").single();
    if (error) throw error;
    setAppId(row.id);
    return row.id as string;
  };

  const handleDraft = async () => {
    try {
      await save("draft");
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1500);
      toast.success("Draft saved.");
    } catch (error: any) {
      toast.error(error?.message ?? "Could not save draft.");
    }
  };

  const submit = async () => {
    const err = validate(5, data);
    if (err) { toast.error(err); return; }
    setSubmitting(true);
    try {
      await save("pending");
      setSubmitted(true);
    } catch (error: any) {
      toast.error(error?.message ?? "Could not submit verification request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!authSettled || isGuest) return null;
  if (submitted) return <PendingSuccess />;

  const titleA = ["Badge", "Notability", "Official", "Safety", "Review"][step - 1];
  const titleB = ["Identity", "Proof", "Links", "Check", "& Submit"][step - 1];

  return (
    <ApplicationWizardChrome
      variant="gold"
      titleA={titleA}
      titleB={titleB}
      steps={STEPS.map((label) => ({ label }))}
      current={step}
      onSaveDraft={handleDraft}
      draftSaved={savedFlash}
      sectionTitle={["Badge Identity", "Notability Proof", "Official Links", "Safety Check", "Review & Submit"][step - 1]}
      sectionSubtitle={["Tell us who you are.", "Tell us about your public recognition.", "Share links that confirm your identity and notability.", "Please confirm the following.", "Review your verification request before submitting."][step - 1]}
      side={<BadgePreview data={data} uid={user?.uid || "GV-PENDING"} step={step} avatarUrl={user?.avatar} />}
    >
      {step === 1 && <StepIdentity data={data} update={update} />}
      {step === 2 && <StepNotability data={data} update={update} />}
      {step === 3 && <StepLinks data={data} update={update} />}
      {step === 4 && <StepSafety data={data} update={update} />}
      {step === 5 && <StepReview data={data} jumpTo={setStep} />}
      <WizardNav variant="gold" onBack={back} backDisabled={step === 1} onNext={step === STEPS.length ? submit : next} submitting={submitting} nextLabel={step === STEPS.length ? "Submit Verification Request" : "Next Step"} />
    </ApplicationWizardChrome>
  );
}

function BadgePreview({ data, uid, step, avatarUrl }: { data: VerifDraft; uid: string; step: number; avatarUrl?: string }) {
  return (
    <div className="space-y-5">
      <div className="neon-gold p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-[oklch(0.88_0.18_92)]">Gold Badge Preview</p>
        <div className="mt-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-5">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 overflow-hidden rounded-full bg-gradient-to-br from-[oklch(0.83_0.17_88)] to-[oklch(0.7_0.18_60)]">
              {avatarUrl && <img src={avatarUrl} alt="" className="h-full w-full object-cover" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-semibold">{data.displayName || "Your Name"}</p>
                <ShieldCheck className="h-4 w-4 text-[oklch(0.88_0.18_92)] drop-shadow-[0_0_6px_oklch(0.88_0.2_92/0.8)]" />
              </div>
              <p className="text-xs text-muted-foreground">{data.username || "@username"}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{data.title || "Profile title (e.g., Recording Artist)"}</p>
        </div>
      </div>
      <CreatorPassport variant="gold" displayName={data.displayName} handle={data.username} uid={uid} step={step} totalSteps={STEPS.length} avatarUrl={avatarUrl} />
    </div>
  );
}

function StepIdentity({ data, update }: { data: VerifDraft; update: (p: Partial<VerifDraft>) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Display name to verify" required><NeonInput value={data.displayName} onChange={(e) => update({ displayName: e.target.value })} trailingIcon={<User className="h-4 w-4 text-[oklch(0.92_0.18_88)]" />} /></Field>
        <Field label="Username" required><NeonInput value={data.username} onChange={(e) => update({ username: e.target.value })} trailingIcon={<AtSign className="h-4 w-4 text-[oklch(0.92_0.18_88)]" />} /></Field>
        <Field label="Email"><NeonInput type="email" value={data.email} onChange={(e) => update({ email: e.target.value })} trailingIcon={<Mail className="h-4 w-4 text-[oklch(0.92_0.18_88)]" />} /></Field>
        <Field label="What are you applying as?" required><NeonSelect value={data.category} onChange={(e) => update({ category: e.target.value })}><option value="">Select category</option>{CATEGORIES.map((c) => <option key={c} className="bg-background">{c}</option>)}</NeonSelect></Field>
      </div>
      <Field label="What title should appear near your profile?" required><NeonInput value={data.title} onChange={(e) => update({ title: e.target.value })} trailingIcon={<BadgeCheck className="h-4 w-4 text-[oklch(0.92_0.18_88)]" />} /></Field>
      <Field label="Short public bio" required><NeonTextarea rows={3} value={data.bio} onChange={(e) => update({ bio: e.target.value })} trailingIcon={<FileText className="h-4 w-4 text-[oklch(0.92_0.18_88)]" />} /></Field>
      <Field label="Why should this profile receive a Go badge?" required><NeonTextarea rows={4} value={data.reason} onChange={(e) => update({ reason: e.target.value })} trailingIcon={<Sparkles className="h-4 w-4 text-[oklch(0.92_0.18_88)]" />} /></Field>
    </div>
  );
}

function StepNotability({ data, update }: { data: VerifDraft; update: (p: Partial<VerifDraft>) => void }) {
  return (
    <div className="space-y-5">
      <Field label="Notability categories" required><ChipPicker variant="gold" multi value={data.notabilityTypes} onChange={(v) => update({ notabilityTypes: v as string[] })} options={["Press Coverage", "Music Releases", "Large Social Following", "Public Brand / Business", "Verified Elsewhere", "Community Impact", "Awards / Recognition", "IMDb / Film / TV Credits", "Sports / Team Affiliation", "Other"].map((label) => ({ value: label, label }))} /></Field>
      <Field label="Describe your public recognition (3-6 sentences)" required><NeonTextarea rows={4} value={data.recognitionDescription} onChange={(e) => update({ recognitionDescription: e.target.value })} /></Field>
      <Field label="Any major achievements?"><NeonTextarea rows={3} value={data.achievements} onChange={(e) => update({ achievements: e.target.value })} /></Field>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Any press mentions?"><NeonTextarea rows={3} value={data.pressMentions} onChange={(e) => update({ pressMentions: e.target.value })} /></Field>
        <Field label="Any official releases / projects?"><NeonTextarea rows={3} value={data.releases} onChange={(e) => update({ releases: e.target.value })} /></Field>
      </div>
    </div>
  );
}

function StepLinks({ data, update }: { data: VerifDraft; update: (p: Partial<VerifDraft>) => void }) {
  const upd = (key: "officialLinks" | "proofLinks", i: number, v: string) => {
    const next = [...data[key]];
    next[i] = v;
    update({ [key]: next } as any);
  };
  return (
    <div className="space-y-6">
      <Field label="Official Links"><div className="space-y-2">{data.officialLinks.map((l, i) => <NeonInput key={i} placeholder={`Official link ${i + 1}`} value={l} onChange={(e) => upd("officialLinks", i, e.target.value)} />)}</div></Field>
      <Field label="Proof Links"><div className="space-y-2">{data.proofLinks.map((l, i) => <NeonInput key={i} placeholder={`Proof link ${i + 1}`} value={l} onChange={(e) => upd("proofLinks", i, e.target.value)} />)}</div></Field>
    </div>
  );
}

function StepSafety({ data, update }: { data: VerifDraft; update: (p: Partial<VerifDraft>) => void }) {
  return (
    <div className="space-y-5">
      <NeonCheckList variant="gold" items={ACKS} value={data.acks} onToggle={(i) => { const next = [...data.acks]; next[i] = !next[i]; update({ acks: next }); }} />
      <Field label="Is there any impersonation risk or confusion we should know about? (optional)"><NeonTextarea rows={4} value={data.impersonationNote} onChange={(e) => update({ impersonationNote: e.target.value })} /></Field>
    </div>
  );
}

function StepReview({ data, jumpTo }: { data: VerifDraft; jumpTo: (n: number) => void }) {
  const sections = ["Badge Identity", "Notability Proof", "Official Links", "Safety Check"];
  return (
    <div className="space-y-5">
      <div className="space-y-3">{sections.map((title, i) => <div key={title} className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"><span className="step-circle is-done">{i + 1}</span><p className="flex-1 font-semibold">{title}</p><button onClick={() => jumpTo(i + 1)} className="btn-ghost-glass inline-flex items-center gap-2 px-3 py-2 text-xs"><Pencil className="h-3.5 w-3.5" /> Edit</button></div>)}</div>
      <div className="glass p-5"><p className="mb-3 text-sm font-semibold">Request Summary</p><dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2"><Row k="Display Name" v={data.displayName || "-"} /><Row k="Category" v={data.category || "-"} /><Row k="Profile Title" v={data.title || "-"} /><Row k="Notability Types" v={String(data.notabilityTypes.length)} /><Row k="Official Links" v={`${data.officialLinks.filter(Boolean).length} added`} /><Row k="Proof Links" v={`${data.proofLinks.filter(Boolean).length} added`} /></dl></div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-4 border-b border-white/5 py-1"><dt className="text-muted-foreground">{k}</dt><dd className="text-right text-foreground">{v}</dd></div>;
}

const GO_PIPELINE_STAGES = [
  { key: "Submitted", icon: <FileCheck2 className="h-5 w-5" /> },
  { key: "Under Review", icon: <Search className="h-5 w-5" /> },
  { key: "More Info", icon: <HelpCircle className="h-5 w-5" /> },
  { key: "Approved", icon: <ShieldCheck className="h-5 w-5" /> },
  { key: "Denied", icon: <X className="h-5 w-5" /> },
];

function GoStatusPipeline({ current }: { current: string }) {
  return (
    <div className="mt-8 w-full">
      <div className="flex items-start gap-1">
        {GO_PIPELINE_STAGES.map((s, i) => (
          <div key={s.key} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {i > 0 && <span className="pipeline-line" />}
              <span className={`pipeline-icon mx-auto ${s.key === current ? "is-current" : ""}`}>{s.icon}</span>
              {i < GO_PIPELINE_STAGES.length - 1 && <span className="pipeline-line" />}
            </div>
            <span className={`mt-2 text-center text-[10px] leading-tight sm:text-xs ${s.key === current ? "font-semibold text-[oklch(0.92_0.18_88)]" : "text-muted-foreground"}`}>
              {s.key}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PendingSuccess() {
  return (
    <div className="apply-scroll-page liquid-stage gold min-h-screen min-h-[100dvh]">
      <div className="grid-veil" aria-hidden />
      <div className="orb-extra" aria-hidden />

      {/* Mobile: centered card */}
      <div className="mx-auto max-w-2xl px-4 py-8 lg:hidden">
        <div className="relative neon-gold p-6 md:p-10">
          <div className="swoosh-bg" />
          <div className="liquid-sheen" />
          <div className="relative flex flex-col items-center text-center">
            <Logo className="logo-float h-14" />
            <div
              className="my-8 inline-flex h-28 w-28 items-center justify-center rounded-3xl"
              style={{ boxShadow: "inset 0 0 0 2px oklch(0.95 0.2 88 / 0.95), 0 0 60px oklch(0.85 0.2 85 / 0.6)" }}
            >
              <ShieldCheck className="h-14 w-14 text-[oklch(0.92_0.18_88)] drop-shadow-[0_0_16px_oklch(0.85_0.2_85/0.8)]" />
            </div>
            <h1 className="text-3xl font-semibold leading-tight">
              <span className="text-foreground">Your Go </span>
              <span className="title-split-gold">Badge</span>
              <span className="text-foreground"> Is In Review!</span>
            </h1>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              We received your verification request. You'll be notified as it moves through review.
            </p>
            <div className="mt-7 w-full space-y-3">
              <Link to="/applications" className="neon-btn-gold w-full py-4 text-base">
                View Request Status <ChevronRight className="h-5 w-5" />
              </Link>
              <Link to="/" className="neon-btn-blue w-full py-4 text-base">
                Back to Trey TV <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
            <GoStatusPipeline current="Submitted" />
          </div>
        </div>
      </div>

      {/* Desktop: two-column split */}
      <div className="hidden min-h-screen lg:flex">
        {/* Left decorative panel — gold */}
        <div
          className="relative flex w-[42%] flex-col items-center justify-center overflow-hidden px-16 xl:w-[38%]"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 30%, oklch(0.65 0.22 80 / 0.2), transparent 65%)," +
              "radial-gradient(80% 60% at 80% 80%, oklch(0.78 0.18 70 / 0.12), transparent 60%)," +
              "oklch(0.07 0.025 262 / 0.95)",
            borderRight: "1px solid oklch(1 0 0 / 0.06)",
          }}
        >
          {/* Big icon */}
          <div
            className="mb-8 flex h-48 w-48 items-center justify-center rounded-[2.5rem]"
            style={{
              background: "linear-gradient(135deg, oklch(0.14 0.06 80 / 0.9), oklch(0.08 0.03 70 / 0.9))",
              boxShadow:
                "inset 0 0 0 2px oklch(0.92 0.18 88 / 0.6), 0 0 80px oklch(0.85 0.2 85 / 0.35), 0 0 0 1px oklch(0.78 0.18 80 / 0.25)",
            }}
          >
            <ShieldCheck
              className="h-24 w-24 text-[oklch(0.92_0.18_88)]"
              style={{ filter: "drop-shadow(0 0 20px oklch(0.85 0.2 85 / 0.75))" }}
            />
          </div>

          {/* What happens next */}
          <div className="w-full max-w-xs space-y-3">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[oklch(0.85_0.2_85)]">
              What Happens Next
            </p>
            {[
              "Your request enters our review queue",
              "Our team checks your notability evidence",
              "You may be asked for more information",
              "Approved accounts receive the Go badge",
            ].map((txt, i) => (
              <div key={txt} className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-[oklch(0.92_0.18_88)]"
                  style={{ boxShadow: "inset 0 0 0 1px oklch(0.85 0.2 85 / 0.6), 0 0 10px oklch(0.85 0.2 85 / 0.2)" }}
                >
                  {i + 1}
                </span>
                <p className="text-sm text-muted-foreground">{txt}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right content panel */}
        <div className="flex flex-1 flex-col items-center justify-center px-16 xl:px-24">
          <div className="w-full max-w-md">
            <Logo className="logo-float mb-8 h-16" />
            <h1 className="text-4xl font-semibold leading-tight xl:text-5xl">
              <span className="text-foreground">Your Go </span>
              <span className="title-split-gold">Badge</span>
              <span className="text-foreground"> Is In Review!</span>
            </h1>
            <p className="mt-5 text-base text-muted-foreground">
              We received your verification request. Our team will review your notability evidence.
            </p>
            <div className="mt-8 space-y-3">
              <Link to="/applications" className="neon-btn-gold w-full py-4 text-base">
                View Request Status <ChevronRight className="h-5 w-5" />
              </Link>
              <Link to="/" className="neon-btn-blue w-full py-4 text-base">
                Back to Trey TV <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
            <GoStatusPipeline current="Submitted" />
          </div>
        </div>
      </div>
    </div>
  );
}

function validate(step: number, data: VerifDraft) {
  if (step === 1 && (!data.displayName.trim() || !data.username.trim() || !data.category || !data.title.trim() || !data.bio.trim() || !data.reason.trim())) return "Complete the required identity fields.";
  if (step === 2 && (data.notabilityTypes.length === 0 || !data.recognitionDescription.trim())) return "Select at least one notability category and describe your recognition.";
  if (step === 4 && !data.acks.every(Boolean)) return "Please accept all safety confirmations.";
  return null;
}
