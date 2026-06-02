import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ArrowLeft, ArrowRight, Check, Sparkles,
  User, MapPin, Heart, Share2, Lock, CheckCircle,
  Instagram, Youtube,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { supabase } from "@/integrations/supabase/client";
import { saveOnboardingProfile, finalizeOnboarding, treyICheckUsername } from "@/lib/trey-i/onboarding.server";
import { confirmZodiacIdentity } from "@/lib/zodiac.server";
import { calculateZodiacIdentity, type BirthTimePrecision, type ZodiacIdentity } from "@/lib/zodiac";
import { ZodiacBadge } from "@/components/zodiac";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding/manual")({
  component: ManualOnboarding,
  head: () => ({
    meta: [
      { title: "Set up your profile — Trey TV" },
      { name: "description", content: "Build your Trey TV profile step by step." },
    ],
  }),
});

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "identity" | "about" | "zodiac" | "preferences" | "socials" | "privacy" | "review";
const STEPS: Step[] = ["identity", "about", "zodiac", "preferences", "socials", "privacy", "review"];

const STEP_META: Record<Step, { label: string; icon: React.ElementType }> = {
  identity:    { label: "Identity",     icon: User },
  about:       { label: "About",        icon: MapPin },
  zodiac:      { label: "Zodiac",       icon: Sparkles },
  preferences: { label: "Preferences", icon: Heart },
  socials:     { label: "Socials",      icon: Share2 },
  privacy:     { label: "Privacy",      icon: Lock },
  review:      { label: "Review",       icon: CheckCircle },
};

const CATEGORY_OPTIONS = ["Music", "Shows", "Behind the scenes", "Comedy", "Motivation", "Creator content", "Exclusive drops"];
const MOOD_OPTIONS     = ["Funny", "Deep", "Raw", "Luxury", "Reality-style", "Inspirational", "Wild/uncut"];
const FREQUENCY_OPTIONS = [
  { value: "daily",      label: "Daily" },
  { value: "weekly",     label: "Weekly" },
  { value: "only_drops", label: "Major drops only" },
];
const FAN_TYPE_OPTIONS = [
  { value: "viewer",    label: "Viewer" },
  { value: "creator",   label: "Creator" },
  { value: "supporter", label: "Supporter" },
  { value: "superfan",  label: "Superfan" },
  { value: "trizfit",   label: "Trizfit" },
];
const VISIBILITY_OPTIONS = [
  { value: "public",       label: "Public" },
  { value: "members_only", label: "Members only" },
  { value: "private",      label: "Private" },
];

type FormData = {
  display_name: string;
  username: string;
  bio: string;
  location: string;
  date_of_birth: string;
  birth_location_label: string;
  birth_time_precision: BirthTimePrecision;
  birth_time_local: string;
  birth_timezone: string;
  zodiac_confirmed: boolean;
  zodiac_public_opt_in: boolean;
  show_birthday: boolean;
  favorite_categories: string[];
  favorite_moods: string[];
  content_frequency: string;
  fan_type: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  x_handle: string;
  profile_visibility: string;
  show_location: boolean;
};

// ─── Component ────────────────────────────────────────────────────────────────

function ManualOnboarding() {
  const nav = useNavigate();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [step, setStep]               = useState<Step>("identity");
  const [saving, setSaving]           = useState(false);
  const [usernameHint, setUsernameHint] = useState<"" | "checking" | "available" | "taken" | "invalid">("");
  const [usernameChecked, setUsernameChecked] = useState("");

  const [form, setForm] = useState<FormData>({
    display_name: "",
    username: "",
    bio: "",
    location: "",
    date_of_birth: "",
    birth_location_label: "",
    birth_time_precision: "unknown",
    birth_time_local: "",
    birth_timezone: "",
    zodiac_confirmed: false,
    zodiac_public_opt_in: true,
    show_birthday: false,
    favorite_categories: [],
    favorite_moods: [],
    content_frequency: "",
    fan_type: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    x_handle: "",
    profile_visibility: "public",
    show_location: true,
  });

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

        const { data } = await (supabase as any)
          .from("user_onboarding")
          .select("current_step, selected_path, answers")
          .eq("user_id", user.id)
          .maybeSingle();

        if (data && !data.completed && data.selected_path === "manual") {
          if (data.current_step >= 0 && data.current_step < STEPS.length) {
            setStep(STEPS[data.current_step]);
          }
          if (data.answers) {
            setForm((prev) => ({
              ...prev,
              ...data.answers,
            }));
          }
          toast.success("Resumed manual onboarding from where you left off.");
        } else {
          await (supabase as any).from("user_onboarding").upsert({
            user_id: user.id,
            selected_path: "manual",
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

  const set = useCallback(<K extends keyof FormData>(key: K, val: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  }, []);

  const toggleList = useCallback((key: "favorite_categories" | "favorite_moods", val: string) => {
    setForm((prev) => {
      const arr = prev[key];
      return { ...prev, [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] };
    });
  }, []);

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

  const stepIdx  = STEPS.indexOf(step);
  const isFirst  = stepIdx === 0;
  const progress = ((stepIdx) / (STEPS.length - 1)) * 100;
  const zodiacPreview = useMemo(() => calculateZodiacIdentity({
    dateOfBirth: form.date_of_birth,
    birthLocationLabel: form.birth_location_label || form.location,
    birthTimePrecision: form.birth_time_precision,
    birthTimeLocal: form.birth_time_local,
    birthTimezone: form.birth_timezone,
  }), [form.date_of_birth, form.birth_location_label, form.location, form.birth_time_precision, form.birth_time_local, form.birth_timezone]);

  const goNext = async () => {
    if (stepIdx < STEPS.length - 1) {
      const nextStep = STEPS[stepIdx + 1];
      setStep(nextStep);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await (supabase as any).from("user_onboarding").upsert({
            user_id: user.id,
            selected_path: "manual",
            current_step: stepIdx + 1,
            answers: form,
            completed: false,
            updated_at: new Date().toISOString()
          }, { onConflict: "user_id" });
        }
      } catch (err) {
        console.error("Failed to save progress:", err);
      }
    }
  };

  const goBack = async () => {
    if (!isFirst) {
      const prevStep = STEPS[stepIdx - 1];
      setStep(prevStep);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await (supabase as any).from("user_onboarding").upsert({
            user_id: user.id,
            selected_path: "manual",
            current_step: stepIdx - 1,
            answers: form,
            completed: false,
            updated_at: new Date().toISOString()
          }, { onConflict: "user_id" });
        }
      } catch (err) {
        console.error("Failed to save progress:", err);
      }
    } else {
      nav({ to: "/onboarding" });
    }
  };

  const canAdvanceIdentity = form.display_name.trim().length >= 2 && usernameHint === "available";
  const canAdvanceAbout = !form.date_of_birth || !!zodiacPreview;
  const canAdvanceZodiac = !form.date_of_birth || form.zodiac_confirmed;
  const canAdvance = step === "identity" ? canAdvanceIdentity : step === "about" ? canAdvanceAbout : step === "zodiac" ? canAdvanceZodiac : true;

  const handleFinish = async () => {
    if (!accessToken) return;
    setSaving(true);
    try {
      await saveOnboardingProfile({
        data: {
          accessToken,
          fields: {
            display_name:        form.display_name,
            username:            form.username,
            bio:                 form.bio || undefined,
            location:            form.location || undefined,
            date_of_birth:       form.date_of_birth || undefined,
            show_birthday:       form.show_birthday,
            favorite_categories: form.favorite_categories.length ? form.favorite_categories : undefined,
            favorite_moods:      form.favorite_moods.length ? form.favorite_moods : undefined,
            content_frequency:   form.content_frequency || undefined,
            fan_type:            form.fan_type || undefined,
            instagram:           form.instagram || undefined,
            tiktok:              form.tiktok || undefined,
            youtube:             form.youtube || undefined,
            x_handle:            form.x_handle || undefined,
            profile_visibility:  form.profile_visibility,
            show_location:       form.show_location,
          },
        },
      });
      if (form.date_of_birth && form.zodiac_confirmed) {
        await confirmZodiacIdentity({
          data: {
            accessToken,
            dateOfBirth: form.date_of_birth,
            birthLocationLabel: form.birth_location_label || form.location || undefined,
            birthTimeLocal: form.birth_time_local || undefined,
            birthTimePrecision: form.birth_time_precision,
            birthTimezone: form.birth_timezone || undefined,
            zodiacPublicOptIn: form.zodiac_public_opt_in,
          },
        });
      }
      const { publicProfileUid } = await finalizeOnboarding({ data: { accessToken, method: "manual" } });
      window.location.href = `/u/${publicProfileUid}?tour=1`;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[80vmin] rounded-full bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.45),oklch(0.7_0.25_340_/_0.4),oklch(0.65_0.22_300_/_0.45),oklch(0.82_0.15_215_/_0.4),oklch(0.82_0.16_85_/_0.45))] blur-3xl opacity-60 animate-conic-spin" />
        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="relative max-w-[600px] mx-auto px-4 pt-6 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={goBack}
            className="size-9 grid place-items-center rounded-full liquid-glass border border-white/10"
          >
            <ArrowLeft className="size-4" />
          </button>
          <Logo className="h-7" />
          <div className="size-9" />
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            <span>{STEP_META[step].label}</span>
            <span>{stepIdx + 1} / {STEPS.length}</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[oklch(0.82_0.16_85)] via-[oklch(0.7_0.25_340)] to-[oklch(0.82_0.15_215)] transition-all duration-500"
              style={{ width: `${Math.max(progress, 6)}%` }}
            />
          </div>

          {/* Step dots */}
          <div className="flex justify-center gap-2 mt-3">
            {STEPS.map((s, i) => {
              const Icon = STEP_META[s].icon;
              const done = i < stepIdx;
              const active = s === step;
              return (
                <div
                  key={s}
                  className={`size-7 rounded-full grid place-items-center transition-all ${
                    done   ? "bg-primary text-primary-foreground"
                    : active ? "bg-primary/20 border border-primary text-primary"
                    : "bg-white/5 text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step card */}
        <div className="mt-6 rounded-3xl liquid-glass neon-border p-6 sm:p-8 space-y-5 animate-rise">
          {step === "identity" && (
            <IdentityStep
              form={form}
              usernameHint={usernameHint}
              setDisplayName={(v) => set("display_name", v)}
              setUsername={(v) => { set("username", v); setUsernameHint(""); setUsernameChecked(""); }}
              onUsernameBlur={() => checkUsername(form.username)}
            />
          )}
          {step === "about" && (
            <AboutStep
              bio={form.bio}
              location={form.location}
              dob={form.date_of_birth}
              showBirthday={form.show_birthday}
              setBio={(v) => set("bio", v)}
              setLocation={(v) => set("location", v)}
              setDob={(v) => set("date_of_birth", v)}
              setShowBirthday={(v) => set("show_birthday", v)}
            />
          )}
          {step === "zodiac" && (
            <ZodiacLockStep
              form={form}
              identity={zodiacPreview}
              setBirthLocation={(v) => {
                set("birth_location_label", v);
                set("zodiac_confirmed", false);
              }}
              setBirthTimePrecision={(v) => {
                set("birth_time_precision", v);
                set("zodiac_confirmed", false);
              }}
              setBirthTimeLocal={(v) => {
                set("birth_time_local", v);
                set("zodiac_confirmed", false);
              }}
              setBirthTimezone={(v) => {
                set("birth_timezone", v);
                set("zodiac_confirmed", false);
              }}
              setPublicOptIn={(v) => set("zodiac_public_opt_in", v)}
              confirm={() => set("zodiac_confirmed", true)}
              edit={() => set("zodiac_confirmed", false)}
            />
          )}
          {step === "preferences" && (
            <PreferencesStep
              categories={form.favorite_categories}
              moods={form.favorite_moods}
              frequency={form.content_frequency}
              fanType={form.fan_type}
              toggleCategory={(v) => toggleList("favorite_categories", v)}
              toggleMood={(v) => toggleList("favorite_moods", v)}
              setFrequency={(v) => set("content_frequency", v)}
              setFanType={(v) => set("fan_type", v)}
            />
          )}
          {step === "socials" && (
            <SocialsStep
              instagram={form.instagram}
              tiktok={form.tiktok}
              youtube={form.youtube}
              xHandle={form.x_handle}
              setInstagram={(v) => set("instagram", v)}
              setTiktok={(v) => set("tiktok", v)}
              setYoutube={(v) => set("youtube", v)}
              setXHandle={(v) => set("x_handle", v)}
            />
          )}
          {step === "privacy" && (
            <PrivacyStep
              visibility={form.profile_visibility}
              showLocation={form.show_location}
              setVisibility={(v) => set("profile_visibility", v)}
              setShowLocation={(v) => set("show_location", v)}
            />
          )}
          {step === "review" && (
            <ReviewStep form={form} />
          )}
        </div>

        {/* Navigation */}
        <div className="mt-5 flex gap-3">
          {step !== "review" ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!canAdvance}
              className="flex-1 h-11 rounded-2xl bg-primary text-primary-foreground text-sm font-bold glow-gold inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Continue <ArrowRight className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={saving}
              className="flex-1 h-11 rounded-2xl bg-primary text-primary-foreground text-sm font-bold glow-gold inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Sparkles className="size-4" />
              {saving ? "Saving…" : "Finish setup"}
            </button>
          )}
        </div>

        {step !== "review" && (
          <div className="mt-3 text-center">
            <button type="button" onClick={goNext} className="text-xs text-muted-foreground hover:text-foreground">
              Skip this step →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step sub-components ──────────────────────────────────────────────────────

function StepHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-1">
      <h2 className="text-xl font-bold">{title}</h2>
      {sub && <p className="text-sm text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] tracking-[0.2em] text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text" }: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type={type}
      placeholder={placeholder}
      className="w-full h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-sm focus:outline-none focus:border-primary/50 transition"
    />
  );
}

function IdentityStep({
  form, usernameHint, setDisplayName, setUsername, onUsernameBlur,
}: {
  form: FormData;
  usernameHint: string;
  setDisplayName: (v: string) => void;
  setUsername: (v: string) => void;
  onUsernameBlur: () => void;
}) {
  const hintColor =
    usernameHint === "available" ? "text-green-400"
    : usernameHint === "taken" || usernameHint === "invalid" ? "text-red-400"
    : "text-muted-foreground";
  const hintText =
    usernameHint === "available" ? "Username is available"
    : usernameHint === "taken" ? "Username already taken"
    : usernameHint === "invalid" ? "3–30 letters, numbers or underscores"
    : usernameHint === "checking" ? "Checking…"
    : "";

  return (
    <div className="space-y-4">
      <StepHeading title="Your identity" sub="What should people call you on Trey TV?" />
      <Field label="DISPLAY NAME">
        <TextInput
          value={form.display_name}
          onChange={setDisplayName}
          placeholder="Your name"
        />
      </Field>
      <Field label="USERNAME">
        <input
          value={form.username}
          onChange={(e) => setUsername(e.target.value)}
          onBlur={onUsernameBlur}
          type="text"
          placeholder="@yourhandle"
          className="w-full h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-sm focus:outline-none focus:border-primary/50 transition"
        />
        {hintText && (
          <p className={`text-[11px] mt-1 ${hintColor}`}>{hintText}</p>
        )}
      </Field>
    </div>
  );
}

function AboutStep({
  bio, location, dob, showBirthday,
  setBio, setLocation, setDob, setShowBirthday,
}: {
  bio: string; location: string; dob: string; showBirthday: boolean;
  setBio: (v: string) => void; setLocation: (v: string) => void;
  setDob: (v: string) => void; setShowBirthday: (v: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      <StepHeading title="About you" sub="A little context for your profile." />
      <Field label="BIO">
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Short bio (optional)"
          maxLength={160}
          rows={3}
          className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition resize-none"
        />
        <p className="text-[10px] text-muted-foreground text-right">{bio.length}/160</p>
      </Field>
      <Field label="LOCATION">
        <TextInput value={location} onChange={setLocation} placeholder="City, State or Country (optional)" />
      </Field>
      <Field label="BIRTHDAY">
        <input
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          type="date"
          className="w-full h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-sm focus:outline-none focus:border-primary/50 transition"
        />
      </Field>
      {dob && (
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={showBirthday}
            onChange={(e) => setShowBirthday(e.target.checked)}
            className="size-4"
          />
          Show birthday on my profile
        </label>
      )}
    </div>
  );
}

function ZodiacLockStep({
  form,
  identity,
  setBirthLocation,
  setBirthTimePrecision,
  setBirthTimeLocal,
  setBirthTimezone,
  setPublicOptIn,
  confirm,
  edit,
}: {
  form: FormData;
  identity: ZodiacIdentity | null;
  setBirthLocation: (v: string) => void;
  setBirthTimePrecision: (v: BirthTimePrecision) => void;
  setBirthTimeLocal: (v: string) => void;
  setBirthTimezone: (v: string) => void;
  setPublicOptIn: (v: boolean) => void;
  confirm: () => void;
  edit: () => void;
}) {
  if (!form.date_of_birth) {
    return (
      <div className="space-y-4">
        <StepHeading title="Personal identity" sub="Add a birthday on the previous step to unlock your zodiac identity." />
        <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4 text-sm text-muted-foreground">
          Zodiac identity is optional here, but it needs a date of birth before Trey TV can calculate it.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StepHeading title="Lock your zodiac identity" sub="Review the details before this becomes part of your permanent Trey TV profile." />
      <Field label="BIRTH LOCATION">
        <TextInput value={form.birth_location_label} onChange={setBirthLocation} placeholder="Memphis, TN (optional)" />
      </Field>
      <Field label="BIRTH TIMEZONE">
        <TextInput value={form.birth_timezone} onChange={setBirthTimezone} placeholder="America/Chicago (optional)" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="BIRTH TIME">
          <select
            value={form.birth_time_precision}
            onChange={(e) => setBirthTimePrecision(e.target.value as BirthTimePrecision)}
            className="w-full h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-sm focus:outline-none focus:border-primary/50 transition"
          >
            <option value="unknown">I don't know</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
            <option value="night">Night</option>
            <option value="exact">Exact time</option>
          </select>
        </Field>
        {form.birth_time_precision === "exact" && (
          <Field label="EXACT TIME">
            <input
              type="time"
              value={form.birth_time_local}
              onChange={(e) => setBirthTimeLocal(e.target.value)}
              className="w-full h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-sm focus:outline-none focus:border-primary/50 transition"
            />
          </Field>
        )}
      </div>

      {identity && (
        <div className="rounded-3xl liquid-glass neon-border p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <ZodiacBadge sign={identity.sunSign} isCusp={identity.isCusp} cuspLabel={identity.cuspLabel} />
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{identity.confidence.replace("_", " ")}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <ReviewMini label="DOB" value={form.date_of_birth} />
            <ReviewMini label="Location" value={form.birth_location_label || "Not provided"} />
            <ReviewMini label="Timezone" value={form.birth_timezone || "Estimated"} />
            <ReviewMini label="Birth time" value={form.birth_time_precision === "exact" ? form.birth_time_local || "Exact" : form.birth_time_precision.replace("_", " ")} />
            <ReviewMini label="Cusp" value={identity.isCusp ? identity.cuspLabel ?? "Cusp Soul" : "No"} />
            <ReviewMini label="Method" value={identity.calculationMethod.replaceAll("_", " ")} />
          </div>
          <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={form.zodiac_public_opt_in}
              onChange={(e) => setPublicOptIn(e.target.checked)}
              className="mt-0.5 size-4"
            />
            Show my zodiac badge and privacy-safe chart highlights on my public profile.
          </label>
          <div className="rounded-2xl bg-primary/10 border border-primary/25 p-3 text-xs text-muted-foreground">
            Your zodiac identity is about to be added to your Trey TV profile. Once confirmed, this becomes part of your permanent profile identity unless support corrects an error.
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={confirm} className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-xs font-black glow-gold">
              {form.zodiac_confirmed ? "Zodiac Identity Confirmed" : "Confirm Zodiac Identity"}
            </button>
            {form.zodiac_confirmed && (
              <button type="button" onClick={edit} className="h-10 rounded-xl border border-white/10 px-3 text-xs font-semibold">
                Edit Birth Details
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-2">
      <div className="text-[9px] tracking-[0.18em] text-muted-foreground uppercase">{label}</div>
      <div className="mt-0.5 font-bold truncate">{value}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 h-8 rounded-full text-xs font-semibold transition border ${
        active
          ? "bg-primary/20 border-primary text-primary"
          : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20"
      }`}
    >
      {children}
    </button>
  );
}

function PreferencesStep({
  categories, moods, frequency, fanType,
  toggleCategory, toggleMood, setFrequency, setFanType,
}: {
  categories: string[]; moods: string[]; frequency: string; fanType: string;
  toggleCategory: (v: string) => void; toggleMood: (v: string) => void;
  setFrequency: (v: string) => void; setFanType: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <StepHeading title="Your content taste" sub="What brings you to Trey TV?" />
      <div>
        <div className="text-[10px] tracking-[0.2em] text-muted-foreground mb-2">CATEGORIES</div>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((c) => (
            <Chip key={c} active={categories.includes(c)} onClick={() => toggleCategory(c)}>{c}</Chip>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[10px] tracking-[0.2em] text-muted-foreground mb-2">VIBES</div>
        <div className="flex flex-wrap gap-2">
          {MOOD_OPTIONS.map((m) => (
            <Chip key={m} active={moods.includes(m)} onClick={() => toggleMood(m)}>{m}</Chip>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[10px] tracking-[0.2em] text-muted-foreground mb-2">HOW OFTEN DO YOU WATCH?</div>
        <div className="flex gap-2 flex-wrap">
          {FREQUENCY_OPTIONS.map((o) => (
            <Chip key={o.value} active={frequency === o.value} onClick={() => setFrequency(frequency === o.value ? "" : o.value)}>{o.label}</Chip>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[10px] tracking-[0.2em] text-muted-foreground mb-2">I'M MAINLY A…</div>
        <div className="flex gap-2 flex-wrap">
          {FAN_TYPE_OPTIONS.map((o) => (
            <Chip key={o.value} active={fanType === o.value} onClick={() => setFanType(fanType === o.value ? "" : o.value)}>{o.label}</Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

function SocialsStep({
  instagram, tiktok, youtube, xHandle,
  setInstagram, setTiktok, setYoutube, setXHandle,
}: {
  instagram: string; tiktok: string; youtube: string; xHandle: string;
  setInstagram: (v: string) => void; setTiktok: (v: string) => void;
  setYoutube: (v: string) => void; setXHandle: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <StepHeading title="Social links" sub="Connect your other platforms (all optional)." />
      <Field label="INSTAGRAM">
        <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 h-10 focus-within:border-primary/50 transition">
          <Instagram className="size-4 text-muted-foreground shrink-0" />
          <input value={instagram} onChange={(e) => setInstagram(e.target.value.replace(/^@/, ""))} placeholder="handle" className="flex-1 bg-transparent text-sm focus:outline-none" />
        </div>
      </Field>
      <Field label="TIKTOK">
        <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 h-10 focus-within:border-primary/50 transition">
          <span className="text-muted-foreground text-sm shrink-0">TT</span>
          <input value={tiktok} onChange={(e) => setTiktok(e.target.value.replace(/^@/, ""))} placeholder="handle" className="flex-1 bg-transparent text-sm focus:outline-none" />
        </div>
      </Field>
      <Field label="YOUTUBE">
        <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 h-10 focus-within:border-primary/50 transition">
          <Youtube className="size-4 text-muted-foreground shrink-0" />
          <input value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="channel URL or handle" className="flex-1 bg-transparent text-sm focus:outline-none" />
        </div>
      </Field>
      <Field label="X / TWITTER">
        <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 h-10 focus-within:border-primary/50 transition">
          <span className="text-muted-foreground text-sm font-bold shrink-0">𝕏</span>
          <input value={xHandle} onChange={(e) => setXHandle(e.target.value.replace(/^@/, ""))} placeholder="handle" className="flex-1 bg-transparent text-sm focus:outline-none" />
        </div>
      </Field>
    </div>
  );
}

function PrivacyStep({
  visibility, showLocation,
  setVisibility, setShowLocation,
}: {
  visibility: string; showLocation: boolean;
  setVisibility: (v: string) => void; setShowLocation: (v: boolean) => void;
}) {
  return (
    <div className="space-y-5">
      <StepHeading title="Privacy" sub="Control who sees your profile." />
      <div>
        <div className="text-[10px] tracking-[0.2em] text-muted-foreground mb-2">PROFILE VISIBILITY</div>
        <div className="flex gap-2">
          {VISIBILITY_OPTIONS.map((o) => (
            <Chip key={o.value} active={visibility === o.value} onClick={() => setVisibility(o.value)}>{o.label}</Chip>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={showLocation}
          onChange={(e) => setShowLocation(e.target.checked)}
          className="size-4"
        />
        Show location on profile
      </label>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-3 text-sm py-2 border-b border-white/5 last:border-0">
      <span className="text-muted-foreground capitalize shrink-0">{label}</span>
      <span className="font-medium text-right max-w-[240px] truncate">{value}</span>
    </div>
  );
}

function ReviewStep({ form }: { form: FormData }) {
  const socials = [
    form.instagram && `Instagram: @${form.instagram}`,
    form.tiktok    && `TikTok: @${form.tiktok}`,
    form.youtube   && `YouTube: ${form.youtube}`,
    form.x_handle  && `X: @${form.x_handle}`,
  ].filter(Boolean).join(" · ");

  return (
    <div className="space-y-4">
      <StepHeading title="Review your profile" sub="Everything look good? Hit Finish to go live." />
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 px-4 py-2">
        <ReviewRow label="Display name" value={form.display_name} />
        <ReviewRow label="Username" value={form.username ? `@${form.username}` : ""} />
        <ReviewRow label="Bio" value={form.bio} />
        <ReviewRow label="Location" value={form.location} />
        <ReviewRow label="Birthday" value={form.date_of_birth} />
        <ReviewRow label="Categories" value={form.favorite_categories.join(", ")} />
        <ReviewRow label="Vibes" value={form.favorite_moods.join(", ")} />
        <ReviewRow label="Watch frequency" value={form.content_frequency.replace("_", " ")} />
        <ReviewRow label="Profile type" value={form.fan_type} />
        <ReviewRow label="Socials" value={socials} />
        <ReviewRow label="Visibility" value={form.profile_visibility.replace("_", " ")} />
      </div>
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-muted-foreground">
        <Sparkles className="size-3.5 text-primary shrink-0" />
        You can edit any of this later from your profile settings.
      </div>
    </div>
  );
}
