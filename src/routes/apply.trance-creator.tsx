import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AtSign,
  Briefcase,
  ChevronRight,
  FileCheck2,
  Globe,
  HelpCircle,
  Mail,
  MapPin,
  Pencil,
  Sparkles,
  Camera,
  User,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  ApplicationWizardChrome,
  Field,
  NeonCheckList,
  NeonInput,
  NeonSelect,
  NeonTextarea,
  TileChoice,
  WizardNav,
} from "@/components/apply/ApplicationWizardChrome";
import { CreatorPassport } from "@/components/apply/CreatorPassport";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/apply/trance-creator")({
  component: TranceCreatorApplication,
  head: () => ({ meta: [{ title: "Trance Pro Choreographer / Dancer Position - Trey TV" }] }),
});

const STEPS = ["Role Selection", "Vetting", "Technical", "Guidelines", "Review"] as const;

const TRANCE_ACKS = [
  "I certify that all choreography, movements, and steps I upload or showcase are my original creative work or I hold full licensing rights.",
  "I understand Trance App enforces rigorous standards for safe, respectful, and high-quality artistic performance.",
  "I am comfortable with players around the world using my recorded tutorials for AI-scored pose tracking and leaderboard rankings.",
  "I understand my choreography must align with Trey TV's community guidelines, prohibiting offensive or dangerous activities.",
  "I understand that the Trance professional vetting process is highly curated and approval is not automatic.",
];

type TranceRole = "choreographer" | "dancer" | "both";
type TranceExperience = "under_2" | "between_2_5" | "between_5_10" | "over_10";

type TranceDraft = {
  displayName: string;
  handle: string;
  email: string;
  location: string;
  selectedRole: TranceRole;

  // Professional Vetting
  primaryStyles: string;
  portfolio: string;
  experienceLevel: TranceExperience;
  affiliations: string;

  // Technical Vetting
  hdCameraSetup: "yes" | "no";
  aiPoseTrackingOk: "yes" | "no";
  firstRoutineConcept: string;
  whyQualified: string;

  // Standard Acknowledgements
  acks: boolean[];
  applicantMessage: string;
};

const EMPTY_TRANCE_DRAFT: TranceDraft = {
  displayName: "",
  handle: "",
  email: "",
  location: "",
  selectedRole: "both",

  primaryStyles: "",
  portfolio: "",
  experienceLevel: "between_2_5",
  affiliations: "",

  hdCameraSetup: "yes",
  aiPoseTrackingOk: "yes",
  firstRoutineConcept: "",
  whyQualified: "",

  acks: [false, false, false, false, false],
  applicantMessage: "",
};

function TranceCreatorApplication() {
  const { isGuest, user } = useAuth();
  const navigate = useNavigate();
  const [authSettled, setAuthSettled] = useState(false);
  const [data, setData] = useState<TranceDraft>(EMPTY_TRANCE_DRAFT);
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
      try {
        sessionStorage.setItem("treytv_post_auth_redirect", "/apply/trance-creator");
      } catch {}
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
      email: prev.email || (user as any).email || "",
    }));
  }, [user?.uid]);

  const update = (patch: Partial<TranceDraft>) => setData((prev) => ({ ...prev, ...patch }));
  const next = () => {
    const err = validate(step, data);
    if (err) {
      toast.error(err);
      return;
    }
    setStep((s) => Math.min(STEPS.length, s + 1));
  };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const save = async (status: "draft" | "pending") => {
    const { data: auth } = await supabase.auth.getUser();
    const authUserId = auth.user?.id;
    if (!authUserId) throw new Error("Please sign in with your Trey TV account before submitting.");

    const payload = buildTrancePayload(data, authUserId, status);

    if (appId) {
      const { error } = await (supabase as any)
        .from("creator_applications")
        .update(payload)
        .eq("id", appId);
      if (error) throw error;
      return appId;
    }

    const { data: row, error } = await (supabase as any)
      .from("creator_applications")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw error;
    setAppId(row.id);
    return row.id as string;
  };

  const handleDraft = async () => {
    try {
      await save("draft");
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1600);
      toast.success("Trance application draft saved.");
    } catch (error: any) {
      toast.error(error?.message ?? "Could not save draft.");
    }
  };

  const submit = async () => {
    const err = validate(5, data);
    if (err) {
      toast.error(err);
      return;
    }
    setSubmitting(true);
    try {
      await save("pending");
      setSubmitted(true);
    } catch (error: any) {
      toast.error(error?.message ?? "Could not submit Trance application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!authSettled || isGuest) return null;
  if (submitted) return <PendingSuccess />;

  const titleStr = [
    "Position Details",
    "Professional Vetting",
    "Technical Setup",
    "Community Standards",
    "Review & Submit",
  ][step - 1];
  const [titleA, ...rest] = titleStr.split(" ");

  return (
    <ApplicationWizardChrome
      variant="trance"
      titleA={titleA}
      titleB={rest.join(" ")}
      steps={STEPS.map((label) => ({ label }))}
      current={step}
      onSaveDraft={handleDraft}
      draftSaved={savedFlash}
      sectionTitle={titleStr}
      sectionSubtitle={
        [
          "Choose your professional dance track.",
          "Vetting your professional dance background and styling.",
          "Evaluating your camera setup and AI tracker compatibility.",
          "Review our guidelines and sign choreographer standards.",
          "Review your information before submitting.",
        ][step - 1]
      }
      side={
        <CreatorPassport
          variant="trance"
          displayName={data.displayName}
          handle={data.handle}
          location={data.location}
          uid={user?.uid || "TRANCE-PENDING"}
          step={step}
          totalSteps={STEPS.length}
          avatarUrl={user?.avatar}
        />
      }
    >
      {step === 1 && <StepRole data={data} update={update} />}
      {step === 2 && <StepVetting data={data} update={update} />}
      {step === 3 && <StepTechnical data={data} update={update} />}
      {step === 4 && <StepStandards data={data} update={update} />}
      {step === 5 && <StepReview data={data} jumpTo={setStep} />}

      <WizardNav
        variant="trance"
        onBack={back}
        backDisabled={step === 1}
        onNext={step === STEPS.length ? submit : next}
        submitting={submitting}
        nextLabel={step === STEPS.length ? "Submit Trance Application" : "Next Step"}
      />
    </ApplicationWizardChrome>
  );
}

function StepRole({
  data,
  update,
}: {
  data: TranceDraft;
  update: (p: Partial<TranceDraft>) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Stage Name / Professional Name" required>
          <NeonInput
            value={data.displayName}
            onChange={(e) => update({ displayName: e.target.value })}
            trailingIcon={<User className="h-4 w-4" />}
          />
        </Field>
        <Field label="Trance / Trey TV Handle" required>
          <NeonInput
            value={data.handle}
            onChange={(e) => update({ handle: e.target.value })}
            trailingIcon={<AtSign className="h-4 w-4" />}
          />
        </Field>
        <Field label="Contact Email Address" required>
          <NeonInput
            type="email"
            value={data.email}
            onChange={(e) => update({ email: e.target.value })}
            trailingIcon={<Mail className="h-4 w-4" />}
          />
        </Field>
        <Field label="Location (City, State, Country)">
          <NeonInput
            value={data.location}
            onChange={(e) => update({ location: e.target.value })}
            trailingIcon={<MapPin className="h-4 w-4" />}
          />
        </Field>
      </div>

      <Field label="Select your Professional Trance Track" required>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => update({ selectedRole: "choreographer" })}
            className={`flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition active:scale-95 ${
              data.selectedRole === "choreographer"
                ? "border-fuchsia-500 bg-fuchsia-500/10 shadow-[0_0_15px_rgba(240,79,255,0.3)] text-white"
                : "border-white/5 bg-zinc-950/40 text-white/70 hover:border-white/10"
            }`}
          >
            <Briefcase className="h-7 w-7 text-fuchsia-400" />
            <div>
              <span className="block text-sm font-black uppercase tracking-wider">
                Choreographer / Teacher
              </span>
              <span className="mt-1 block text-[10px] text-white/50 leading-relaxed">
                Design custom tutorial routines, teach steps, and build dance catalogs
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => update({ selectedRole: "dancer" })}
            className={`flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition active:scale-95 ${
              data.selectedRole === "dancer"
                ? "border-fuchsia-500 bg-fuchsia-500/10 shadow-[0_0_15px_rgba(240,79,255,0.3)] text-white"
                : "border-white/5 bg-zinc-950/40 text-white/70 hover:border-white/10"
            }`}
          >
            <User className="h-7 w-7 text-fuchsia-400" />
            <div>
              <span className="block text-sm font-black uppercase tracking-wider">
                Pro Dancer / Performer
              </span>
              <span className="mt-1 block text-[10px] text-white/50 leading-relaxed">
                Perform in official showcases, battle on rankings, and model routine tracking
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => update({ selectedRole: "both" })}
            className={`flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition active:scale-95 ${
              data.selectedRole === "both"
                ? "border-fuchsia-500 bg-fuchsia-500/10 shadow-[0_0_15px_rgba(240,79,255,0.3)] text-white"
                : "border-white/5 bg-zinc-950/40 text-white/70 hover:border-white/10"
            }`}
          >
            <Users className="h-7 w-7 text-fuchsia-400" />
            <div>
              <span className="block text-sm font-black uppercase tracking-wider">
                Hybrid Creator
              </span>
              <span className="mt-1 block text-[10px] text-white/50 leading-relaxed">
                Create and choreograph routines while performing as a top-ranked dancer
              </span>
            </div>
          </button>
        </div>
      </Field>
    </div>
  );
}

function StepVetting({
  data,
  update,
}: {
  data: TranceDraft;
  update: (p: Partial<TranceDraft>) => void;
}) {
  return (
    <div className="space-y-5">
      <Field
        label="Primary Dance Styles & Specializations"
        required
        hint="e.g. Hip-Hop, Popping, Locking, Afro-fusion, Krump, Contemporary, Heels"
      >
        <NeonInput
          placeholder="e.g. Hip-Hop / Popping / Krump"
          value={data.primaryStyles}
          onChange={(e) => update({ primaryStyles: e.target.value })}
        />
      </Field>
      <Field
        label="Professional Dance Portfolio & Reel Link"
        required
        hint="Provide a link to a YouTube, Instagram, TikTok video, or Google Drive showing your dance/choreography"
      >
        <NeonInput
          placeholder="Dance Reel Link (YouTube/Instagram/TikTok)"
          value={data.portfolio}
          onChange={(e) => update({ portfolio: e.target.value })}
        />
      </Field>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Years of Professional Dance Experience" required>
          <NeonSelect
            value={data.experienceLevel}
            onChange={(e) => update({ experienceLevel: e.target.value as TranceExperience })}
          >
            <option value="under_2">Less than 2 Years</option>
            <option value="between_2_5">2 – 5 Years</option>
            <option value="between_5_10">5 – 10 Years</option>
            <option value="over_10">10+ Years of experience</option>
          </NeonSelect>
        </Field>
        <Field
          label="Crews, Studios, or Professional Credits"
          hint="Studios taught at, crews represented, or background dancer credits"
        >
          <NeonInput
            placeholder="e.g. Dance 411, Royal Family, Trey TV showcase dancer"
            value={data.affiliations}
            onChange={(e) => update({ affiliations: e.target.value })}
          />
        </Field>
      </div>
    </div>
  );
}

function StepTechnical({
  data,
  update,
}: {
  data: TranceDraft;
  update: (p: Partial<TranceDraft>) => void;
}) {
  return (
    <div className="space-y-5">
      <Field
        label="Do you have access to a high-definition video camera or smartphone (1080p/4K at 60fps) to record routines?"
        required
      >
        <TileChoice
          value={data.hdCameraSetup}
          onChange={(v) => update({ hdCameraSetup: v as "yes" | "no" })}
          options={[
            {
              value: "yes",
              label: "Yes, 1080p/4K @ 60fps",
              icon: <Camera className="h-5 w-5 text-emerald-400" />,
            },
            {
              value: "no",
              label: "No, standard laptop camera",
              icon: <X className="h-5 w-5 text-rose-400" />,
            },
          ]}
        />
      </Field>

      <Field
        label="Are you comfortable with our AI engine analyzing your video recordings to generate real-time pose tracking matrices for players?"
        required
      >
        <TileChoice
          value={data.aiPoseTrackingOk}
          onChange={(v) => update({ aiPoseTrackingOk: v as "yes" | "no" })}
          options={[
            {
              value: "yes",
              label: "Yes, fully comfortable",
              icon: <Sparkles className="h-5 w-5 text-emerald-400 animate-pulse" />,
            },
            {
              value: "no",
              label: "No, prefer manual vetting",
              icon: <X className="h-5 w-5 text-rose-400" />,
            },
          ]}
        />
      </Field>

      <Field
        label="Proposed First Routine or Teaching Concept"
        required
        hint="What song, style, and difficulty would you like to drop as your first official Trance App routine?"
      >
        <NeonTextarea
          rows={3}
          placeholder="e.g. 'Atlanta Bounce' to Trey's custom track - Hip-Hop style, Intermediate level, teaching basic bounce and grooves..."
          value={data.firstRoutineConcept}
          onChange={(e) => update({ firstRoutineConcept: e.target.value })}
        />
      </Field>

      <Field
        label="Describe your unique style and professional credentials"
        required
        hint="Why are you qualified to join the ranks of elite Trance App choreographers and instructors?"
      >
        <NeonTextarea
          rows={4}
          placeholder="Detail your professional experience, teaching philosophy, and style qualifications..."
          value={data.whyQualified}
          onChange={(e) => update({ whyQualified: e.target.value })}
        />
      </Field>
    </div>
  );
}

function StepStandards({
  data,
  update,
}: {
  data: TranceDraft;
  update: (p: Partial<TranceDraft>) => void;
}) {
  return (
    <div className="space-y-5">
      <NeonCheckList
        items={TRANCE_ACKS}
        value={data.acks}
        onToggle={(i) => {
          const next = [...data.acks];
          next[i] = !next[i];
          update({ acks: next });
        }}
        variant="trance"
      />
      <Field label="Additional comments or applicant message (optional)">
        <NeonTextarea
          rows={3}
          placeholder="Anything else you'd like to share with the vetting committee..."
          value={data.applicantMessage}
          onChange={(e) => update({ applicantMessage: e.target.value })}
        />
      </Field>
    </div>
  );
}

function StepReview({ data, jumpTo }: { data: TranceDraft; jumpTo: (s: number) => void }) {
  const sections = useMemo(
    () =>
      [1, 2, 3, 4].map((n) => ({
        n,
        title: [
          "Position Details",
          "Professional Vetting",
          "Technical Setup",
          "Community Standards",
        ][n - 1],
      })),
    [],
  );
  const mappedRole =
    data.selectedRole === "choreographer"
      ? "Choreographer"
      : data.selectedRole === "dancer"
        ? "Professional Dancer"
        : "Choreographer & Dancer";

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {sections.map((s) => (
          <div
            key={s.n}
            className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"
          >
            <span className="step-circle is-done">{s.n}</span>
            <p className="flex-1 font-semibold text-sm sm:text-base">{s.title}</p>
            <button
              type="button"
              onClick={() => jumpTo(s.n)}
              className="neon-btn-ghost purple text-xs inline-flex items-center gap-2 px-3 py-2 text-fuchsia-300 hover:text-white"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          </div>
        ))}
      </div>
      <div className="glass-premium p-5 rounded-2xl border border-white/5">
        <p className="mb-3 text-sm font-semibold text-fuchsia-300">Application Summary</p>
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <Row k="Selected Track" v={mappedRole} />
          <Row k="Handle" v={data.handle} />
          <Row k="Styles" v={data.primaryStyles} />
          <Row k="Portfolio Link" v={data.portfolio || "-"} />
          <Row
            k="HD Video Camera"
            v={data.hdCameraSetup === "yes" ? "Full HD (1080p/4K @ 60fps)" : "Standard Camera"}
          />
          <Row
            k="AI Tracker Integration"
            v={data.aiPoseTrackingOk === "yes" ? "Authorized / Comfortable" : "Declined"}
          />
          <Row
            k="Acks Accepted"
            v={`${data.acks.filter(Boolean).length} / ${TRANCE_ACKS.length} checks`}
          />
        </dl>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/5 py-1.5">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right text-foreground font-semibold truncate max-w-[200px]" title={v}>
        {v}
      </dd>
    </div>
  );
}

function PendingSuccess() {
  return (
    <div className="apply-scroll-page liquid-stage min-h-screen min-h-[100dvh]">
      <div className="grid-veil" aria-hidden />
      <div className="orb-extra" aria-hidden />

      {/* Centered success panel */}
      <div className="mx-auto max-w-2xl px-4 py-8 lg:py-16">
        <div className="relative neon-purple p-6 md:p-10">
          <div className="swoosh-bg" />
          <div className="liquid-sheen" />
          <div className="relative flex flex-col items-center text-center">
            <Logo className="logo-float h-14" />
            <div
              className="my-8 inline-flex h-28 w-28 items-center justify-center rounded-3xl"
              style={{
                boxShadow:
                  "inset 0 0 0 2px oklch(0.85 0.2 320 / 0.95), 0 0 60px oklch(0.7 0.25 340 / 0.6)",
              }}
            >
              <FileCheck2 className="h-14 w-14 text-fuchsia-300 drop-shadow-[0_0_16px_rgba(240,79,255,0.8)]" />
            </div>
            <h1 className="text-3xl font-semibold leading-tight">
              <span className="text-foreground">Trance Application </span>
              <span className="text-fuchsia-300 drop-shadow-[0_0_8px_rgba(240,79,255,0.4)]">
                Submitted!
              </span>
            </h1>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground leading-relaxed">
              Your professional Trance App Choreographer / Dancer application is in. Our vetting team
              will review your video portfolio/reel and reach out regarding official routine launches or showcase bookings.
            </p>
            <div className="mt-7 w-full space-y-3">
              <Link to="/applications" className="neon-btn-purple w-full py-4 text-base">
                View Application Status <ChevronRight className="h-5 w-5" />
              </Link>
              <Link
                to="/trance"
                className="neon-btn-blue w-full py-4 text-base flex items-center justify-center gap-2"
              >
                Back to Trance App <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function validate(step: number, data: TranceDraft) {
  if (step === 1 && (!data.displayName.trim() || !data.handle.trim() || !data.email.trim()))
    return "Stage Name, Handle, and Email are required.";
  if (step === 2) {
    if (!data.primaryStyles.trim() || !data.portfolio.trim())
      return "Dance styles and portfolio/reel links are required.";
  }
  if (step === 3) {
    if (!data.firstRoutineConcept.trim() || !data.whyQualified.trim())
      return "Proposed routine concept and professional qualifications are required.";
  }
  if (step === 4 && !data.acks.every(Boolean))
    return "You must accept and acknowledge all safety and copyright choreo standards.";
  return null;
}

function buildTrancePayload(data: TranceDraft, userId: string, status: "draft" | "pending") {
  const roleName =
    data.selectedRole === "choreographer"
      ? "Choreographer / Instructor"
      : data.selectedRole === "dancer"
        ? "Professional Dancer"
        : "Choreographer & Dancer";

  const experienceLabel =
    data.experienceLevel === "under_2"
      ? "< 2 Years"
      : data.experienceLevel === "between_2_5"
        ? "2-5 Years"
        : data.experienceLevel === "between_5_10"
          ? "5-10 Years"
          : "10+ Years";

  return {
    user_id: userId,
    application_type: "trance_creator",
    status,
    creator_name: data.displayName,
    channel_handle: data.handle.replace(/^@/, ""),
    location: data.location,
    channel_name: `${data.displayName} Trance`,
    niche: `Trance ${roleName}`,
    bio: data.whyQualified,
    content_formats: [roleName],
    posting_frequency: "Weekly",
    target_audience: "Trance App dancers & learners",
    first_content_idea: data.firstRoutineConcept || `Original dance tutorial`,
    release_timeline: "Immediate",
    reason: JSON.stringify({
      selectedRole: data.selectedRole,
      portfolioLink: data.portfolio,
      email: data.email,
      primaryStyles: data.primaryStyles,
      experienceLevel: experienceLabel,
      affiliations: data.affiliations,
      hdCameraSetup: data.hdCameraSetup,
      aiPoseTrackingOk: data.aiPoseTrackingOk,
      applicantMessage: data.applicantMessage,
    }),
    agreed_to_standards: data.acks.every(Boolean),
    updated_at: new Date().toISOString(),
  };
}
