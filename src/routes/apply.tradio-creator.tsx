import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import aiBallCutout from "@/tradio/assets/ai-ball.png";
import {
  AtSign,
  Briefcase,
  Building2,
  ChevronRight,
  FileCheck2,
  Globe,
  HelpCircle,
  Instagram,
  Mail,
  MapPin,
  Pencil,
  PenLine,
  Search,
  ShieldCheck,
  Twitter,
  User,
  Users,
  X,
  Radio,
  Mic2,
  Sliders,
  Disc,
  Sparkles,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import {
  ApplicationWizardChrome,
  ChipPicker,
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

export const Route = createFileRoute("/apply/tradio-creator")({
  component: TradioCreatorApplication,
  head: () => ({ meta: [{ title: "Tradio Creative Position - Trey TV" }] }),
});

const STEPS = ["Role Selection", "Vetting", "Technical", "Guidelines", "Review"] as const;

const TRADIO_ACKS = [
  "I certify that all audio files, instrumentals, or tracks I broadcast or upload are original or fully cleared/royalty-free.",
  "I understand Tradio enforces strict DMCA/copyright standards and does not permit stolen samples.",
  "I am comfortable working with AI assistants to map schedules, generate playlists, and curate music lanes.",
  "I understand my broadcasts must align with Trey TV's community guidelines, prohibiting dangerous or offensive commentary.",
  "I understand Tradio's application process is highly curated and approval is not automatic.",
];

type TradioRole = "artist" | "producer" | "dj";
type BeatsCleared = "yes" | "some" | "no";

type TradioDraft = {
  displayName: string;
  handle: string;
  email: string;
  location: string;
  selectedRole: TradioRole;

  // Artist Specifics
  artistGenre: string;
  artistPortfolio: string;
  artistType: "solo" | "band" | "songwriter" | "collaboration";

  // Producer Specifics
  producerDaw: string;
  producerPortfolio: string;
  beatsCleared: BeatsCleared;

  // DJ / Host Specifics
  hostExperience: string;
  hostPortfolio: string;
  hostConcept: string;

  // General Technical Vetting
  studioMic: "yes" | "no";
  aiAssistantsOk: "yes" | "no";
  whyQualified: string;

  // Standard Acknowledgements
  acks: boolean[];
  applicantMessage: string;
};

const EMPTY_TRADIO_DRAFT: TradioDraft = {
  displayName: "",
  handle: "",
  email: "",
  location: "",
  selectedRole: "artist",

  artistGenre: "",
  artistPortfolio: "",
  artistType: "solo",

  producerDaw: "",
  producerPortfolio: "",
  beatsCleared: "yes",

  hostExperience: "",
  hostPortfolio: "",
  hostConcept: "",

  studioMic: "yes",
  aiAssistantsOk: "yes",
  whyQualified: "",

  acks: [false, false, false, false, false],
  applicantMessage: "",
};

function TradioCreatorApplication() {
  const { isGuest, user } = useAuth();
  const navigate = useNavigate();
  const [authSettled, setAuthSettled] = useState(false);
  const [data, setData] = useState<TradioDraft>(EMPTY_TRADIO_DRAFT);
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
        sessionStorage.setItem("treytv_post_auth_redirect", "/apply/tradio-creator");
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

  const update = (patch: Partial<TradioDraft>) => setData((prev) => ({ ...prev, ...patch }));
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

    // We map Tradio fields into creator_applications table!
    const payload = buildTradioPayload(data, authUserId, status);

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
      toast.success("Tradio application draft saved.");
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
      toast.error(error?.message ?? "Could not submit Tradio application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!authSettled || isGuest) return null;
  if (submitted) return <PendingSuccess />;

  const titleStr = [
    "Position Details",
    "Creative Vetting",
    "Technical Aptitude",
    "Community Standards",
    "Review & Submit",
  ][step - 1];
  const [titleA, ...rest] = titleStr.split(" ");

  return (
    <ApplicationWizardChrome
      variant="tradio"
      titleA={titleA}
      titleB={rest.join(" ")}
      steps={STEPS.map((label) => ({ label }))}
      current={step}
      onSaveDraft={handleDraft}
      draftSaved={savedFlash}
      sectionTitle={titleStr}
      sectionSubtitle={
        [
          "Choose your creative track.",
          "Vetting your professional music or hosting experience.",
          "Evaluating your hardware and AI software compatibility.",
          "Accept our copyright and broadcast rules.",
          "Review your information before submitting.",
        ][step - 1]
      }
      side={
        <CreatorPassport
          variant="tradio"
          displayName={data.displayName}
          handle={data.handle}
          location={data.location}
          uid={user?.uid || "TRADIO-PENDING"}
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
        variant="tradio"
        onBack={back}
        backDisabled={step === 1}
        onNext={step === STEPS.length ? submit : next}
        submitting={submitting}
        nextLabel={step === STEPS.length ? "Submit Tradio Application" : "Next Step"}
      />
    </ApplicationWizardChrome>
  );
}

function StepRole({
  data,
  update,
}: {
  data: TradioDraft;
  update: (p: Partial<TradioDraft>) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Stage Name / Display Name" required>
          <NeonInput
            value={data.displayName}
            onChange={(e) => update({ displayName: e.target.value })}
            trailingIcon={<User className="h-4 w-4" />}
          />
        </Field>
        <Field label="Tradio Handle" required>
          <NeonInput
            value={data.handle}
            onChange={(e) => update({ handle: e.target.value })}
            trailingIcon={<AtSign className="h-4 w-4" />}
          />
        </Field>
        <Field label="Contact Email" required>
          <NeonInput
            type="email"
            value={data.email}
            onChange={(e) => update({ email: e.target.value })}
            trailingIcon={<Mail className="h-4 w-4" />}
          />
        </Field>
        <Field label="Location (City / State)">
          <NeonInput
            value={data.location}
            onChange={(e) => update({ location: e.target.value })}
            trailingIcon={<MapPin className="h-4 w-4" />}
          />
        </Field>
      </div>

      <Field label="Select your Tradio Creative Track" required>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => update({ selectedRole: "artist" })}
            className={`flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition active:scale-95 ${
              data.selectedRole === "artist"
                ? "border-purple-500 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.3)] text-white"
                : "border-white/5 bg-zinc-950/40 text-white/70 hover:border-white/10"
            }`}
          >
            <Mic2 className="h-7 w-7 text-purple-400" />
            <div>
              <span className="block text-sm font-black uppercase tracking-wider">
                Tradio Artist
              </span>
              <span className="mt-1 block text-[10px] text-white/50 leading-relaxed">
                Drop original vocal tracks, songs, and albums
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => update({ selectedRole: "producer" })}
            className={`flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition active:scale-95 ${
              data.selectedRole === "producer"
                ? "border-purple-500 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.3)] text-white"
                : "border-white/5 bg-zinc-950/40 text-white/70 hover:border-white/10"
            }`}
          >
            <Sliders className="h-7 w-7 text-purple-400" />
            <div>
              <span className="block text-sm font-black uppercase tracking-wider">
                Tradio Producer
              </span>
              <span className="mt-1 block text-[10px] text-white/50 leading-relaxed">
                Create and clear beats for continuous AI radio lanes
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => update({ selectedRole: "dj" })}
            className={`flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition active:scale-95 ${
              data.selectedRole === "dj"
                ? "border-purple-500 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.3)] text-white"
                : "border-white/5 bg-zinc-950/40 text-white/70 hover:border-white/10"
            }`}
          >
            <Disc className="h-7 w-7 text-purple-400 animate-slow-spin" />
            <div>
              <span className="block text-sm font-black uppercase tracking-wider">
                Radio Host / DJ
              </span>
              <span className="mt-1 block text-[10px] text-white/50 leading-relaxed">
                Build show timelines, podcasts, and host live sessions
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
  data: TradioDraft;
  update: (p: Partial<TradioDraft>) => void;
}) {
  if (data.selectedRole === "artist") {
    return (
      <div className="space-y-5">
        <Field
          label="Primary Musical Genre(s)"
          required
          hint="e.g. Synth-wave, Lo-fi Hip Hop, R&B, Dream Pop"
        >
          <NeonInput
            placeholder="e.g. Synthwave / Lo-fi"
            value={data.artistGenre}
            onChange={(e) => update({ artistGenre: e.target.value })}
          />
        </Field>
        <Field
          label="Artist Profile & Portfolio Links"
          required
          hint="Link to Spotify, SoundCloud, Bandcamp, or Audiomack"
        >
          <NeonInput
            placeholder="SoundCloud or Spotify Link"
            value={data.artistPortfolio}
            onChange={(e) => update({ artistPortfolio: e.target.value })}
          />
        </Field>
        <Field label="Creative Setup" required>
          <TileChoice
            value={data.artistType}
            onChange={(v) => update({ artistType: v as any })}
            options={[
              { value: "solo", label: "Solo Artist", icon: <User className="h-5 w-5" /> },
              { value: "band", label: "Band / Group", icon: <Users className="h-5 w-5" /> },
              {
                value: "songwriter",
                label: "Songwriter Only",
                icon: <PenLine className="h-5 w-5" />,
              },
              {
                value: "collaboration",
                label: "Open Collaborator",
                icon: <Sparkles className="h-5 w-5" />,
              },
            ]}
          />
        </Field>
      </div>
    );
  }

  if (data.selectedRole === "producer") {
    return (
      <div className="space-y-5">
        <Field
          label="Primary DAW or Production Equipment"
          required
          hint="e.g., Ableton Live, FL Studio, Logic Pro, MPC"
        >
          <NeonInput
            placeholder="e.g. Ableton Live"
            value={data.producerDaw}
            onChange={(e) => update({ producerDaw: e.target.value })}
          />
        </Field>
        <Field
          label="Link to Beat Catalog or Audio Portfolio"
          required
          hint="SoundCloud Playlist, Beatstars, Google Drive, Dropbox, or YouTube link"
        >
          <NeonInput
            placeholder="Beat/Instrumental Link"
            value={data.producerPortfolio}
            onChange={(e) => update({ producerPortfolio: e.target.value })}
          />
        </Field>
        <Field label="Are all beats 100% royalty-free and cleared for Tradio broadcasts?" required>
          <TileChoice
            value={data.beatsCleared}
            onChange={(v) => update({ beatsCleared: v as BeatsCleared })}
            options={[
              {
                value: "yes",
                label: "Yes, fully cleared",
                icon: <ShieldCheck className="h-5 w-5 text-emerald-400" />,
              },
              {
                value: "some",
                label: "Some need clearances",
                icon: <HelpCircle className="h-5 w-5 text-amber-400" />,
              },
              {
                value: "no",
                label: "No / Not sure",
                icon: <X className="h-5 w-5 text-rose-400" />,
              },
            ]}
          />
        </Field>
      </div>
    );
  }

  // DJ / Host Specific
  return (
    <div className="space-y-5">
      <Field
        label="Describe your hosting or DJ experience"
        required
        hint="Podcasting, live streaming, club gigs, local FM radio host, etc."
      >
        <NeonTextarea
          rows={3}
          placeholder="Tell us about your background..."
          value={data.hostExperience}
          onChange={(e) => update({ hostExperience: e.target.value })}
        />
      </Field>
      <Field
        label="Link to voice reel, show sample, or previous DJ mix"
        required
        hint="SoundCloud Mix, YouTube video, Mixcloud, or Google Drive link"
      >
        <NeonInput
          placeholder="Voice Reel / Audio Link"
          value={data.hostPortfolio}
          onChange={(e) => update({ hostPortfolio: e.target.value })}
        />
      </Field>
      <Field
        label="Show Concept or Curatorial Theme"
        required
        hint="What kind of show, music vibe, or interactive segments would you host?"
      >
        <NeonTextarea
          rows={4}
          placeholder="e.g. 'The Cosmic Lounge' - deep synths and interviews with local producers..."
          value={data.hostConcept}
          onChange={(e) => update({ hostConcept: e.target.value })}
        />
      </Field>
    </div>
  );
}

function StepTechnical({
  data,
  update,
}: {
  data: TradioDraft;
  update: (p: Partial<TradioDraft>) => void;
}) {
  return (
    <div className="space-y-5">
      <Field
        label="Do you have access to a professional or studio-grade recording microphone?"
        required
      >
        <TileChoice
          value={data.studioMic}
          onChange={(v) => update({ studioMic: v as "yes" | "no" })}
          options={[
            {
              value: "yes",
              label: "Yes, XLR/USB condenser mic",
              icon: <Volume2 className="h-5 w-5 text-emerald-400" />,
            },
            {
              value: "no",
              label: "No, standard phone/laptop mic",
              icon: <X className="h-5 w-5 text-rose-400" />,
            },
          ]}
        />
      </Field>

      <Field
        label="Are you comfortable collaborating with Tradio's AI curators to build playlists and schedule shows?"
        required
      >
        <TileChoice
          value={data.aiAssistantsOk}
          onChange={(v) => update({ aiAssistantsOk: v as "yes" | "no" })}
          options={[
            {
              value: "yes",
              label: "Yes, active collaborator",
              icon: <Sparkles className="h-5 w-5 text-emerald-400 animate-pulse" />,
            },
            {
              value: "no",
              label: "No, prefer purely manual curves",
              icon: <Sliders className="h-5 w-5" />,
            },
          ]}
        />
      </Field>

      <Field
        label="Why are you qualified to be an elite creator on Tradio?"
        required
        hint="What value, unique style, or notable reputation do you bring to our network?"
      >
        <NeonTextarea
          rows={5}
          placeholder="Describe your creative qualifications..."
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
  data: TradioDraft;
  update: (p: Partial<TradioDraft>) => void;
}) {
  return (
    <div className="space-y-5">
      <NeonCheckList
        items={TRADIO_ACKS}
        value={data.acks}
        onToggle={(i) => {
          const next = [...data.acks];
          next[i] = !next[i];
          update({ acks: next });
        }}
        variant="tradio"
      />
      <Field label="Additional comments or applicant message (optional)">
        <NeonTextarea
          rows={3}
          placeholder="Anything else you'd like to share..."
          value={data.applicantMessage}
          onChange={(e) => update({ applicantMessage: e.target.value })}
        />
      </Field>
    </div>
  );
}

function StepReview({ data, jumpTo }: { data: TradioDraft; jumpTo: (s: number) => void }) {
  const sections = useMemo(
    () =>
      [1, 2, 3, 4].map((n) => ({
        n,
        title: [
          "Position Details",
          "Creative Vetting",
          "Technical Aptitude",
          "Community Standards",
        ][n - 1],
      })),
    [],
  );
  const mappedRole =
    data.selectedRole === "artist"
      ? "Tradio Artist"
      : data.selectedRole === "producer"
        ? "Tradio Producer"
        : "Radio Host / DJ";
  const portfolioLink =
    data.selectedRole === "artist"
      ? data.artistPortfolio
      : data.selectedRole === "producer"
        ? data.producerPortfolio
        : data.hostPortfolio;

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
              onClick={() => jumpTo(s.n)}
              className="neon-btn-ghost purple text-xs inline-flex items-center gap-2 px-3 py-2 text-purple-300 hover:text-white"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          </div>
        ))}
      </div>
      <div className="glass-premium p-5 rounded-2xl border border-white/5">
        <p className="mb-3 text-sm font-semibold text-purple-300">Application Summary</p>
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <Row k="Selected Track" v={mappedRole} />
          <Row k="Handle" v={data.handle} />
          <Row k="Portfolio Link" v={portfolioLink || "-"} />
          <Row
            k="Recording Hardware"
            v={data.studioMic === "yes" ? "Studio Microphone" : "Standard Hardware"}
          />
          <Row
            k="AI Collaboration"
            v={data.aiAssistantsOk === "yes" ? "Comfortable / Active" : "Declined"}
          />
          <Row
            k="Acks Accepted"
            v={`${data.acks.filter(Boolean).length} / ${TRADIO_ACKS.length} checks`}
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
                  "inset 0 0 0 2px oklch(0.85 0.2 290 / 0.95), 0 0 60px oklch(0.65 0.3 295 / 0.6)",
              }}
            >
              <FileCheck2 className="h-14 w-14 text-purple-300 drop-shadow-[0_0_16px_rgba(168,85,247,0.8)]" />
            </div>
            <h1 className="text-3xl font-semibold leading-tight">
              <span className="text-foreground">Tradio Application </span>
              <span className="text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">
                Submitted!
              </span>
            </h1>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground leading-relaxed">
              Your professional Tradio Creative application is in. The curation team will review
              your portfolio and reach out regarding live show or track drop clearances.
            </p>
            <div className="mt-7 w-full space-y-3">
              <Link to="/applications" className="neon-btn-purple w-full py-4 text-base">
                View Application Status <ChevronRight className="h-5 w-5" />
              </Link>
              <Link
                to="/tradio"
                className="neon-btn-blue w-full py-4 text-base flex items-center justify-center gap-2"
              >
                <span className="relative size-5 inline-flex items-center justify-center shrink-0">
                  <span className="absolute inset-0 rounded-full bg-purple-500/25 blur-[2px] animate-pulse" />
                  <img
                    src={aiBallCutout}
                    alt=""
                    className="relative size-5 object-contain [filter:drop-shadow(0_0_3px_rgba(176,38,255,0.6))]"
                    style={{ animation: "spin 25s linear infinite" }}
                  />
                </span>
                Back to Tradio <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function validate(step: number, data: TradioDraft) {
  if (step === 1 && (!data.displayName.trim() || !data.handle.trim() || !data.email.trim()))
    return "Stage Name, Handle, and Email are required.";
  if (step === 2) {
    if (
      data.selectedRole === "artist" &&
      (!data.artistGenre.trim() || !data.artistPortfolio.trim())
    )
      return "Genre and portfolio links are required for Artist application.";
    if (
      data.selectedRole === "producer" &&
      (!data.producerDaw.trim() || !data.producerPortfolio.trim())
    )
      return "DAW setup and beat portfolio links are required for Producer application.";
    if (
      data.selectedRole === "dj" &&
      (!data.hostExperience.trim() || !data.hostPortfolio.trim() || !data.hostConcept.trim())
    )
      return "Experience details, voice reel, and show concept are required for Host/DJ application.";
  }
  if (step === 3 && !data.whyQualified.trim())
    return "Please elaborate on why you are qualified for this Tradio creative track.";
  if (step === 4 && !data.acks.every(Boolean))
    return "You must accept and acknowledge all licensing and broadcasting standards.";
  return null;
}

function buildTradioPayload(data: TradioDraft, userId: string, status: "draft" | "pending") {
  const roleName =
    data.selectedRole === "artist"
      ? "Artist"
      : data.selectedRole === "producer"
        ? "Producer"
        : "Radio Host / DJ";
  const portfolioLink =
    data.selectedRole === "artist"
      ? data.artistPortfolio
      : data.selectedRole === "producer"
        ? data.producerPortfolio
        : data.hostPortfolio;

  return {
    user_id: userId,
    application_type: "tradio_creator",
    status,
    creator_name: data.displayName,
    channel_handle: data.handle.replace(/^@/, ""),
    location: data.location,
    channel_name: `${data.displayName} Tradio`,
    niche: `Tradio ${roleName}`,
    bio: data.whyQualified,
    content_formats: [roleName],
    posting_frequency: "Weekly",
    target_audience: "Trey TV Tradio network listeners",
    first_content_idea:
      data.selectedRole === "dj" ? data.hostConcept : `Original uploads & clearance`,
    release_timeline: "TBD",
    reason: JSON.stringify({
      selectedRole: data.selectedRole,
      portfolioLink,
      email: data.email,
      artistGenre: data.artistGenre,
      artistType: data.artistType,
      producerDaw: data.producerDaw,
      beatsCleared: data.beatsCleared,
      hostExperience: data.hostExperience,
      hostConcept: data.hostConcept,
      studioMic: data.studioMic,
      aiAssistantsOk: data.aiAssistantsOk,
      applicantMessage: data.applicantMessage,
    }),
    agreed_to_standards: data.acks.every(Boolean),
    updated_at: new Date().toISOString(),
  };
}
