import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AtSign, Briefcase, Building2, ChevronRight, FileCheck2, Globe, HelpCircle, Instagram, Mail, MapPin, Pencil, PenLine, Search, ShieldCheck, Twitter, User, Users, X, Youtube } from "lucide-react";
import { toast } from "sonner";
import { ApplicationWizardChrome, ChipPicker, Field, NeonCheckList, NeonInput, NeonSelect, NeonTextarea, TileChoice, WizardNav } from "@/components/apply/ApplicationWizardChrome";
import { CreatorPassport } from "@/components/apply/CreatorPassport";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/apply/content-creator")({
  component: ContentCreatorApplication,
  head: () => ({ meta: [{ title: "Content Creator Application - Trey TV" }] }),
});

const STEPS = ["Identity", "Channel", "Content Style", "Launch Plan", "Standards", "Review"] as const;
const CATEGORIES = ["Podcast / Talk", "Music", "Lifestyle", "Comedy", "Sports", "Gaming", "Education", "News", "Film / TV", "Other"];
const ACK_LABELS = [
  "I understand Trey TV is curated and creator approval is not automatic.",
  "I will only upload content I own or have rights to use.",
  "I will not upload hateful, exploitative, illegal, or dangerous content.",
  "I understand Trey TV may remove content that violates platform rules.",
  "I understand fake engagement, impersonation, and stolen content can lead to denial or removal.",
  "I understand approval as a creator does not guarantee fame, monetization, payment, or promotion.",
];

type ApplicantType = "individual" | "duo" | "brand" | "org";
type Rights = "yes" | "some" | "no";

type CreatorDraft = {
  displayName: string;
  handle: string;
  email: string;
  location: string;
  applicantType: ApplicantType;
  bio: string;
  social: { tiktok: string; instagram: string; youtube: string; website: string; x: string };
  channelName: string;
  category: string;
  pitch: string;
  description: string;
  audience: string;
  whyTreyTV: string;
  differentiation: string;
  formats: string[];
  videoLength: string;
  frequency: string;
  hasContent: "yes" | "partial" | "no";
  sampleLinks: string[];
  tools: string[];
  rights: Rights;
  firstShow: string;
  episode1: string;
  episode2: string;
  schedule: string;
  promotion: string;
  acks: boolean[];
  applicantMessage: string;
};

const EMPTY: CreatorDraft = {
  displayName: "",
  handle: "",
  email: "",
  location: "",
  applicantType: "individual",
  bio: "",
  social: { tiktok: "", instagram: "", youtube: "", website: "", x: "" },
  channelName: "",
  category: "",
  pitch: "",
  description: "",
  audience: "",
  whyTreyTV: "",
  differentiation: "",
  formats: [],
  videoLength: "",
  frequency: "",
  hasContent: "yes",
  sampleLinks: ["", "", ""],
  tools: [],
  rights: "yes",
  firstShow: "",
  episode1: "",
  episode2: "",
  schedule: "",
  promotion: "",
  acks: [false, false, false, false, false, false],
  applicantMessage: "",
};

function ContentCreatorApplication() {
  const { isGuest, user } = useAuth();
  const navigate = useNavigate();
  const [authSettled, setAuthSettled] = useState(false);
  const [data, setData] = useState<CreatorDraft>(EMPTY);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [appId, setAppId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setAuthSettled(true), 200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (authSettled && isGuest) {
      try { sessionStorage.setItem("treytv_post_auth_redirect", "/apply/content-creator"); } catch {}
      navigate({ to: "/login" });
    }
  }, [authSettled, isGuest, navigate]);

  useEffect(() => {
    if (!user) return;
    setData((prev) => ({
      ...prev,
      displayName: prev.displayName || user.name || "",
      handle: prev.handle || (user.handle ? `@${user.handle}` : ""),
      location: prev.location || user.location || "",
      bio: prev.bio || user.bio || "",
      social: {
        ...prev.social,
        instagram: prev.social.instagram || user.socialInstagram || "",
        tiktok: prev.social.tiktok || user.socialTikTok || "",
        youtube: prev.social.youtube || user.socialYouTube || "",
        website: prev.social.website || user.link || "",
      },
    }));
  }, [user?.uid]);

  const update = (patch: Partial<CreatorDraft>) => setData((prev) => ({ ...prev, ...patch }));
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
    const payload = buildCreatorPayload(data, authUserId, status);

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
      setTimeout(() => setSavedFlash(false), 1600);
      toast.success("Draft saved.");
    } catch (error: any) {
      toast.error(error?.message ?? "Could not save draft.");
    }
  };

  const submit = async () => {
    const err = validate(6, data);
    if (err) { toast.error(err); return; }
    setSubmitting(true);
    try {
      await save("pending");
      setSubmitted(true);
    } catch (error: any) {
      toast.error(error?.message ?? "Could not submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!authSettled || isGuest) return null;
  if (submitted) return <PendingSuccess kind="creator" />;

  const titleStr = ["Your Identity", "Your Channel", "Your Content Style", "Your Launch Plan", "Community Standards", "Review & Submit"][step - 1];
  const [titleA, ...rest] = titleStr.split(" ");

  return (
    <ApplicationWizardChrome
      variant="creator"
      titleA={titleA}
      titleB={rest.join(" ")}
      steps={STEPS.map((label) => ({ label }))}
      current={step}
      onSaveDraft={handleDraft}
      draftSaved={savedFlash}
      sectionTitle={titleStr}
      sectionSubtitle={["Tell us who you are.", "What channel are you building?", "What type of content will you create?", "Define your first show, schedule, and promotion plan.", "Agree to our guidelines.", "Review your application before submitting."][step - 1]}
      side={<CreatorPassport variant="creator" displayName={data.displayName} handle={data.handle} location={data.location} uid={user?.uid || "TRTV-PENDING"} step={step} totalSteps={STEPS.length} avatarUrl={user?.avatar} />}
    >
      {step === 1 && <StepIdentity data={data} update={update} />}
      {step === 2 && <StepChannel data={data} update={update} />}
      {step === 3 && <StepContent data={data} update={update} />}
      {step === 4 && <StepLaunch data={data} update={update} />}
      {step === 5 && <StepStandards data={data} update={update} />}
      {step === 6 && <StepReview data={data} jumpTo={setStep} />}
      <WizardNav variant="creator" onBack={back} backDisabled={step === 1} onNext={step === STEPS.length ? submit : next} submitting={submitting} nextLabel={step === STEPS.length ? "Submit Creator Application" : "Next Step"} />
    </ApplicationWizardChrome>
  );
}

function StepIdentity({ data, update }: { data: CreatorDraft; update: (p: Partial<CreatorDraft>) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Display Name" required><NeonInput value={data.displayName} onChange={(e) => update({ displayName: e.target.value })} trailingIcon={<User className="h-4 w-4" />} /></Field>
        <Field label="Username / Handle" required><NeonInput value={data.handle} onChange={(e) => update({ handle: e.target.value })} trailingIcon={<AtSign className="h-4 w-4" />} /></Field>
        <Field label="Email"><NeonInput type="email" value={data.email} onChange={(e) => update({ email: e.target.value })} trailingIcon={<Mail className="h-4 w-4" />} /></Field>
        <Field label="Location (City / State)"><NeonInput value={data.location} onChange={(e) => update({ location: e.target.value })} trailingIcon={<MapPin className="h-4 w-4" />} /></Field>
      </div>
      <Field label="I am applying as" required>
        <TileChoice value={data.applicantType} onChange={(v) => update({ applicantType: v as ApplicantType })} options={[{ value: "individual", label: "Individual Creator", icon: <User className="h-5 w-5" /> }, { value: "duo", label: "Duo / Group", icon: <Users className="h-5 w-5" /> }, { value: "brand", label: "Brand / Business", icon: <Briefcase className="h-5 w-5" /> }, { value: "org", label: "Organization", icon: <Building2 className="h-5 w-5" /> }]} />
      </Field>
      <Field label="Short Bio" required><NeonTextarea rows={4} value={data.bio} onChange={(e) => update({ bio: e.target.value })} trailingIcon={<PenLine className="h-4 w-4" />} /></Field>
      <Field label="Social Links">
        <div className="grid gap-2 sm:grid-cols-2">
          <NeonInput placeholder="TikTok" value={data.social.tiktok} onChange={(e) => update({ social: { ...data.social, tiktok: e.target.value } })} trailingIcon={<span className="text-xs">♪</span>} />
          <NeonInput placeholder="Instagram" value={data.social.instagram} onChange={(e) => update({ social: { ...data.social, instagram: e.target.value } })} trailingIcon={<Instagram className="h-4 w-4" />} />
          <NeonInput placeholder="YouTube" value={data.social.youtube} onChange={(e) => update({ social: { ...data.social, youtube: e.target.value } })} trailingIcon={<Youtube className="h-4 w-4" />} />
          <NeonInput placeholder="Website" value={data.social.website} onChange={(e) => update({ social: { ...data.social, website: e.target.value } })} trailingIcon={<Globe className="h-4 w-4" />} />
          <NeonInput placeholder="X/Twitter" value={data.social.x} onChange={(e) => update({ social: { ...data.social, x: e.target.value } })} trailingIcon={<Twitter className="h-4 w-4" />} />
        </div>
      </Field>
    </div>
  );
}

function StepChannel({ data, update }: { data: CreatorDraft; update: (p: Partial<CreatorDraft>) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Proposed Channel Name" required><NeonInput value={data.channelName} onChange={(e) => update({ channelName: e.target.value })} /></Field>
        <Field label="Channel Category" required><NeonSelect value={data.category} onChange={(e) => update({ category: e.target.value })}><option value="">Select a category</option>{CATEGORIES.map((c) => <option key={c} value={c} className="bg-background">{c}</option>)}</NeonSelect></Field>
      </div>
      <Field label="One-sentence channel pitch" required><NeonInput value={data.pitch} onChange={(e) => update({ pitch: e.target.value })} /></Field>
      <Field label="Full Channel Description" required><NeonTextarea rows={4} value={data.description} onChange={(e) => update({ description: e.target.value })} /></Field>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Who is your audience?" required><NeonTextarea rows={3} value={data.audience} onChange={(e) => update({ audience: e.target.value })} /></Field>
        <Field label="Why does this belong on Trey TV?" required><NeonTextarea rows={3} value={data.whyTreyTV} onChange={(e) => update({ whyTreyTV: e.target.value })} /></Field>
      </div>
      <Field label="What makes you different?" required><NeonTextarea rows={3} value={data.differentiation} onChange={(e) => update({ differentiation: e.target.value })} /></Field>
    </div>
  );
}

function StepContent({ data, update }: { data: CreatorDraft; update: (p: Partial<CreatorDraft>) => void }) {
  return (
    <div className="space-y-5">
      <Field label="Content formats" required><ChipPicker multi value={data.formats} onChange={(v) => update({ formats: v as string[] })} options={["Episodes", "Shorts / Clips", "Interviews", "Behind the Scenes", "Skits", "Reviews / Reactions", "Tutorials", "Live-style Premieres"].map((label) => ({ value: label, label }))} /></Field>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Average video length"><NeonSelect value={data.videoLength} onChange={(e) => update({ videoLength: e.target.value })}><option value="">Select length</option>{["Under 5 min", "5-10 min", "10-20 min", "20-40 min", "40+ min"].map((x) => <option key={x} className="bg-background">{x}</option>)}</NeonSelect></Field>
        <Field label="How often can you post?" required><NeonSelect value={data.frequency} onChange={(e) => update({ frequency: e.target.value })}><option value="">Select frequency</option>{["Daily", "Multiple per week", "Weekly", "Bi-weekly", "Monthly"].map((x) => <option key={x} className="bg-background">{x}</option>)}</NeonSelect></Field>
      </div>
      <Field label="Upload sample work (links accepted)"><div className="space-y-2">{data.sampleLinks.map((l, i) => <NeonInput key={i} placeholder={`Video Link ${i + 1}`} value={l} onChange={(e) => { const next = [...data.sampleLinks]; next[i] = e.target.value; update({ sampleLinks: next }); }} />)}</div></Field>
      <Field label="Tools you use"><ChipPicker multi value={data.tools} onChange={(v) => update({ tools: v as string[] })} options={["Phone", "Camera", "CapCut", "Final Cut", "Premiere", "Canva", "Other"].map((label) => ({ value: label, label }))} /></Field>
      <Field label="Do you own or have permission for your content, music, footage, and images?" required><ChipPicker value={data.rights} onChange={(v) => update({ rights: v as Rights })} options={[{ value: "yes", label: "Yes, I do" }, { value: "some", label: "I have some permissions" }, { value: "no", label: "No / Not sure" }]} /></Field>
    </div>
  );
}

function StepLaunch({ data, update }: { data: CreatorDraft; update: (p: Partial<CreatorDraft>) => void }) {
  return (
    <div className="space-y-5">
      <Field label="First show name" required><NeonInput value={data.firstShow} onChange={(e) => update({ firstShow: e.target.value })} /></Field>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Episode 1 title"><NeonInput value={data.episode1} onChange={(e) => update({ episode1: e.target.value })} /></Field>
        <Field label="Episode 2 title"><NeonInput value={data.episode2} onChange={(e) => update({ episode2: e.target.value })} /></Field>
      </div>
      <Field label="Publishing schedule" required><NeonInput value={data.schedule} onChange={(e) => update({ schedule: e.target.value })} /></Field>
      <Field label="How will you promote your channel?" required><NeonTextarea rows={4} value={data.promotion} onChange={(e) => update({ promotion: e.target.value })} /></Field>
    </div>
  );
}

function StepStandards({ data, update }: { data: CreatorDraft; update: (p: Partial<CreatorDraft>) => void }) {
  return (
    <div className="space-y-5">
      <NeonCheckList items={ACK_LABELS} value={data.acks} onToggle={(i) => { const next = [...data.acks]; next[i] = !next[i]; update({ acks: next }); }} />
      <Field label="Anything else we should know? (optional)"><NeonTextarea rows={4} value={data.applicantMessage} onChange={(e) => update({ applicantMessage: e.target.value })} /></Field>
    </div>
  );
}

function StepReview({ data, jumpTo }: { data: CreatorDraft; jumpTo: (s: number) => void }) {
  const sections = useMemo(() => ([1, 2, 3, 4, 5].map((n) => ({ n, title: ["Your Identity", "Your Channel", "Your Content Style", "Your Launch Plan", "Community Standards"][n - 1] }))), []);
  return (
    <div className="space-y-5">
      <div className="space-y-3">{sections.map((s) => <div key={s.n} className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"><span className="step-circle is-done">{s.n}</span><p className="flex-1 font-semibold">{s.title}</p><button onClick={() => jumpTo(s.n)} className="btn-ghost-glass inline-flex items-center gap-2 px-3 py-2 text-xs"><Pencil className="h-3.5 w-3.5" /> Edit</button></div>)}</div>
      <div className="glass p-5"><p className="mb-3 text-sm font-semibold">Application Summary</p><dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2"><Row k="Channel Name" v={data.channelName || "-"} /><Row k="Category" v={data.category || "-"} /><Row k="Upload Frequency" v={data.frequency || "-"} /><Row k="First Show" v={data.firstShow || "-"} /><Row k="Sample Links" v={`${data.sampleLinks.filter(Boolean).length} links added`} /><Row k="Rights Confirmation" v={data.rights === "yes" ? "Yes" : data.rights === "some" ? "Partial" : "No"} /></dl></div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-4 border-b border-white/5 py-1"><dt className="text-muted-foreground">{k}</dt><dd className="text-right text-foreground">{v}</dd></div>;
}

const PIPELINE_STAGES = [
  { key: "Submitted", icon: <FileCheck2 className="h-5 w-5" /> },
  { key: "Under Review", icon: <Search className="h-5 w-5" /> },
  { key: "More Info", icon: <HelpCircle className="h-5 w-5" /> },
  { key: "Approved", icon: <ShieldCheck className="h-5 w-5" /> },
  { key: "Denied", icon: <X className="h-5 w-5" /> },
];

function StatusPipeline({ current }: { current: string }) {
  return (
    <div className="mt-8 w-full">
      <div className="flex items-start gap-1">
        {PIPELINE_STAGES.map((s, i) => (
          <div key={s.key} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {i > 0 && <span className="pipeline-line" />}
              <span className={`pipeline-icon mx-auto ${s.key === current ? "is-current" : ""}`}>{s.icon}</span>
              {i < PIPELINE_STAGES.length - 1 && <span className="pipeline-line" />}
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

function PendingSuccess({ kind: _kind }: { kind: "creator" }) {
  return (
    <div className="apply-scroll-page liquid-stage min-h-screen min-h-[100dvh]">
      <div className="grid-veil" aria-hidden />
      <div className="orb-extra" aria-hidden />

      {/* Mobile: centered card */}
      <div className="mx-auto max-w-2xl px-4 py-8 lg:hidden">
        <div className="relative neon-blue p-6 md:p-10">
          <div className="swoosh-bg" />
          <div className="liquid-sheen" />
          <div className="relative flex flex-col items-center text-center">
            <Logo className="logo-float h-14" />
            <div
              className="my-8 inline-flex h-28 w-28 items-center justify-center rounded-3xl"
              style={{ boxShadow: "inset 0 0 0 2px oklch(0.85 0.2 240 / 0.95), 0 0 60px oklch(0.65 0.3 245 / 0.6)" }}
            >
              <FileCheck2 className="h-14 w-14 text-[oklch(0.85_0.2_240)] drop-shadow-[0_0_16px_oklch(0.7_0.3_245/0.8)]" />
            </div>
            <h1 className="text-3xl font-semibold leading-tight">
              <span className="text-foreground">Your Creator </span>
              <span className="title-split-blue">Application</span>
              <span className="text-foreground"> Is In!</span>
            </h1>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              We received your channel application. You can check the status from your profile.
            </p>
            <div className="mt-7 w-full space-y-3">
              <Link to="/applications" className="neon-btn-blue w-full py-4 text-base">
                View Application Status <ChevronRight className="h-5 w-5" />
              </Link>
              <Link to="/" className="neon-btn-gold w-full py-4 text-base">
                Back to Trey TV <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
            <StatusPipeline current="Submitted" />
          </div>
        </div>
      </div>

      {/* Desktop: two-column split */}
      <div className="hidden min-h-screen lg:flex">
        {/* Left decorative panel */}
        <div
          className="relative flex w-[42%] flex-col items-center justify-center overflow-hidden px-16 xl:w-[38%]"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 30%, oklch(0.55 0.28 245 / 0.18), transparent 65%)," +
              "radial-gradient(80% 60% at 80% 80%, oklch(0.65 0.22 300 / 0.12), transparent 60%)," +
              "oklch(0.07 0.025 262 / 0.95)",
            borderRight: "1px solid oklch(1 0 0 / 0.06)",
          }}
        >
          {/* Big monogram */}
          <div
            className="mb-8 flex h-48 w-48 items-center justify-center rounded-[2.5rem]"
            style={{
              background: "linear-gradient(135deg, oklch(0.14 0.06 252 / 0.9), oklch(0.08 0.03 262 / 0.9))",
              boxShadow:
                "inset 0 0 0 2px oklch(0.85 0.2 240 / 0.6), 0 0 80px oklch(0.65 0.3 245 / 0.35), 0 0 0 1px oklch(0.55 0.25 245 / 0.25)",
            }}
          >
            <FileCheck2
              className="h-24 w-24 text-[oklch(0.85_0.2_240)]"
              style={{ filter: "drop-shadow(0 0 20px oklch(0.7 0.3 245 / 0.75))" }}
            />
          </div>

          {/* What happens next checklist */}
          <div className="w-full max-w-xs space-y-3">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[oklch(0.65_0.22_245)]">
              What Happens Next
            </p>
            {[
              "Your application enters our review queue",
              "Our team reviews your channel concept",
              "You'll be notified of the decision",
              "Approved creators get onboarded",
            ].map((txt, i) => (
              <div key={txt} className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-[oklch(0.85_0.2_240)]"
                  style={{ boxShadow: "inset 0 0 0 1px oklch(0.65 0.22 245 / 0.6), 0 0 10px oklch(0.6 0.3 245 / 0.2)" }}
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
              <span className="text-foreground">Your Creator </span>
              <span className="title-split-blue">Application</span>
              <span className="text-foreground"> Is In!</span>
            </h1>
            <p className="mt-5 text-base text-muted-foreground">
              We received your channel application. Our team will review it and get back to you.
            </p>
            <div className="mt-8 space-y-3">
              <Link to="/applications" className="neon-btn-blue w-full py-4 text-base">
                View Application Status <ChevronRight className="h-5 w-5" />
              </Link>
              <Link to="/" className="neon-btn-gold w-full py-4 text-base">
                Back to Trey TV <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
            <StatusPipeline current="Submitted" />
          </div>
        </div>
      </div>
    </div>
  );
}

function validate(step: number, data: CreatorDraft) {
  if (step === 1 && (!data.displayName.trim() || !data.handle.trim() || !data.bio.trim())) return "Display name, handle, and bio are required.";
  if (step === 2 && (!data.channelName.trim() || !data.category || !data.pitch.trim() || !data.description.trim() || !data.audience.trim() || !data.whyTreyTV.trim())) return "Complete the required channel details.";
  if (step === 3 && (data.formats.length === 0 || !data.frequency || data.rights === "no")) return "Choose formats, posting frequency, and confirm rights.";
  if (step === 4 && (!data.firstShow.trim() || !data.schedule.trim() || !data.promotion.trim())) return "First show, schedule, and promotion plan are required.";
  if (step === 5 && !data.acks.every(Boolean)) return "Please accept all community standards.";
  return null;
}

function buildCreatorPayload(data: CreatorDraft, userId: string, status: "draft" | "pending") {
  return {
    user_id: userId,
    application_type: "creator",
    status,
    creator_name: data.displayName,
    channel_handle: data.handle.replace(/^@/, ""),
    location: data.location,
    channel_name: data.channelName,
    niche: data.category,
    bio: data.description || data.bio,
    content_formats: data.formats,
    posting_frequency: data.frequency,
    target_audience: data.audience,
    first_content_idea: [data.firstShow, data.episode1, data.episode2].filter(Boolean).join(" | "),
    release_timeline: data.schedule,
    reason: JSON.stringify({
      applicantType: data.applicantType,
      pitch: data.pitch,
      whyTreyTV: data.whyTreyTV,
      differentiation: data.differentiation,
      videoLength: data.videoLength,
      hasContent: data.hasContent,
      sampleLinks: data.sampleLinks.filter(Boolean),
      tools: data.tools,
      rights: data.rights,
      promotion: data.promotion,
      social: data.social,
      applicantMessage: data.applicantMessage,
      email: data.email,
    }),
    agreed_to_standards: data.acks.every(Boolean) && data.rights !== "no",
    updated_at: new Date().toISOString(),
  };
}
