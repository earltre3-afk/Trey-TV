import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { L as Logo } from "./Logo-D0JEzEf4.mjs";
import { s as supabase } from "./router-BtgGywEC.mjs";
import { K as treyICheckUsername, L as saveOnboardingProfile, M as finalizeOnboarding } from "./index.mjs";
import { c as confirmZodiacIdentity } from "./zodiac.server-aEkMpDn_.mjs";
import { c as calculateZodiacIdentity } from "./zodiac-BJiAMBSd.mjs";
import { Z as ZodiacBadge } from "./ZodiacBadge-DoSkSIG_.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/react-dom.mjs";
import { A as ArrowLeft, bp as CircleCheckBig, i as Lock, ae as Share2, b as Heart, S as Sparkles, be as MapPin, U as User, k as Check, aj as ArrowRight, bg as Instagram, bi as Youtube } from "../_libs/lucide-react.mjs";
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
const STEPS = ["identity", "about", "zodiac", "preferences", "socials", "privacy", "review"];
const STEP_META = {
  identity: {
    label: "Identity",
    icon: User
  },
  about: {
    label: "About",
    icon: MapPin
  },
  zodiac: {
    label: "Zodiac",
    icon: Sparkles
  },
  preferences: {
    label: "Preferences",
    icon: Heart
  },
  socials: {
    label: "Socials",
    icon: Share2
  },
  privacy: {
    label: "Privacy",
    icon: Lock
  },
  review: {
    label: "Review",
    icon: CircleCheckBig
  }
};
const CATEGORY_OPTIONS = ["Music", "Shows", "Behind the scenes", "Comedy", "Motivation", "Creator content", "Exclusive drops"];
const MOOD_OPTIONS = ["Funny", "Deep", "Raw", "Luxury", "Reality-style", "Inspirational", "Wild/uncut"];
const FREQUENCY_OPTIONS = [{
  value: "daily",
  label: "Daily"
}, {
  value: "weekly",
  label: "Weekly"
}, {
  value: "only_drops",
  label: "Major drops only"
}];
const FAN_TYPE_OPTIONS = [{
  value: "viewer",
  label: "Viewer"
}, {
  value: "creator",
  label: "Creator"
}, {
  value: "supporter",
  label: "Supporter"
}, {
  value: "superfan",
  label: "Superfan"
}, {
  value: "trizfit",
  label: "Trizfit"
}];
const VISIBILITY_OPTIONS = [{
  value: "public",
  label: "Public"
}, {
  value: "members_only",
  label: "Members only"
}, {
  value: "private",
  label: "Private"
}];
function ManualOnboarding() {
  const nav = useNavigate();
  const [accessToken, setAccessToken] = reactExports.useState(null);
  const [step, setStep] = reactExports.useState("identity");
  const [saving, setSaving] = reactExports.useState(false);
  const [usernameHint, setUsernameHint] = reactExports.useState("");
  const [usernameChecked, setUsernameChecked] = reactExports.useState("");
  const [form, setForm] = reactExports.useState({
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
    show_location: true
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
        if (data && !data.completed && data.selected_path === "manual") {
          if (data.current_step >= 0 && data.current_step < STEPS.length) {
            setStep(STEPS[data.current_step]);
          }
          if (data.answers) {
            setForm((prev) => ({
              ...prev,
              ...data.answers
            }));
          }
          toast.success("Resumed manual onboarding from where you left off.");
        } else {
          await supabase.from("user_onboarding").upsert({
            user_id: user.id,
            selected_path: "manual",
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
  const set = reactExports.useCallback((key, val) => {
    setForm((prev) => ({
      ...prev,
      [key]: val
    }));
  }, []);
  const toggleList = reactExports.useCallback((key, val) => {
    setForm((prev) => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]
      };
    });
  }, []);
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
  const stepIdx = STEPS.indexOf(step);
  const isFirst = stepIdx === 0;
  const progress = stepIdx / (STEPS.length - 1) * 100;
  const zodiacPreview = reactExports.useMemo(() => calculateZodiacIdentity({
    dateOfBirth: form.date_of_birth,
    birthLocationLabel: form.birth_location_label || form.location,
    birthTimePrecision: form.birth_time_precision,
    birthTimeLocal: form.birth_time_local,
    birthTimezone: form.birth_timezone
  }), [form.date_of_birth, form.birth_location_label, form.location, form.birth_time_precision, form.birth_time_local, form.birth_timezone]);
  const goNext = async () => {
    if (stepIdx < STEPS.length - 1) {
      const nextStep = STEPS[stepIdx + 1];
      setStep(nextStep);
      try {
        const {
          data: {
            user
          }
        } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("user_onboarding").upsert({
            user_id: user.id,
            selected_path: "manual",
            current_step: stepIdx + 1,
            answers: form,
            completed: false,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          }, {
            onConflict: "user_id"
          });
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
        const {
          data: {
            user
          }
        } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("user_onboarding").upsert({
            user_id: user.id,
            selected_path: "manual",
            current_step: stepIdx - 1,
            answers: form,
            completed: false,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          }, {
            onConflict: "user_id"
          });
        }
      } catch (err) {
        console.error("Failed to save progress:", err);
      }
    } else {
      nav({
        to: "/onboarding"
      });
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
            display_name: form.display_name,
            username: form.username,
            bio: form.bio || void 0,
            location: form.location || void 0,
            date_of_birth: form.date_of_birth || void 0,
            show_birthday: form.show_birthday,
            favorite_categories: form.favorite_categories.length ? form.favorite_categories : void 0,
            favorite_moods: form.favorite_moods.length ? form.favorite_moods : void 0,
            content_frequency: form.content_frequency || void 0,
            fan_type: form.fan_type || void 0,
            instagram: form.instagram || void 0,
            tiktok: form.tiktok || void 0,
            youtube: form.youtube || void 0,
            x_handle: form.x_handle || void 0,
            profile_visibility: form.profile_visibility,
            show_location: form.show_location
          }
        }
      });
      if (form.date_of_birth && form.zodiac_confirmed) {
        await confirmZodiacIdentity({
          data: {
            accessToken,
            dateOfBirth: form.date_of_birth,
            birthLocationLabel: form.birth_location_label || form.location || void 0,
            birthTimeLocal: form.birth_time_local || void 0,
            birthTimePrecision: form.birth_time_precision,
            birthTimezone: form.birth_timezone || void 0,
            zodiacPublicOptIn: form.zodiac_public_opt_in
          }
        });
      }
      const {
        publicProfileUid
      } = await finalizeOnboarding({
        data: {
          accessToken,
          method: "manual"
        }
      });
      window.location.href = `/u/${publicProfileUid}?tour=1`;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };
  if (!accessToken) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass border border-white/10 rounded-3xl px-10 py-8 text-center space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-screen w-full overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "aria-hidden": true, className: "pointer-events-none absolute inset-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-40 left-1/2 -translate-x-1/2 size-[80vmin] rounded-full bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.45),oklch(0.7_0.25_340_/_0.4),oklch(0.65_0.22_300_/_0.45),oklch(0.82_0.15_215_/_0.4),oklch(0.82_0.16_85_/_0.45))] blur-3xl opacity-60 animate-conic-spin" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-background to-transparent" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-[600px] mx-auto px-4 pt-6 pb-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: goBack, className: "size-9 grid place-items-center rounded-full liquid-glass border border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "h-7" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-9" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2 text-[10px] uppercase tracking-widest text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: STEP_META[step].label }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            stepIdx + 1,
            " / ",
            STEPS.length
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 rounded-full bg-white/10 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full bg-gradient-to-r from-[oklch(0.82_0.16_85)] via-[oklch(0.7_0.25_340)] to-[oklch(0.82_0.15_215)] transition-all duration-500", style: {
          width: `${Math.max(progress, 6)}%`
        } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center gap-2 mt-3", children: STEPS.map((s, i) => {
          const Icon = STEP_META[s].icon;
          const done = i < stepIdx;
          const active = s === step;
          return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `size-7 rounded-full grid place-items-center transition-all ${done ? "bg-primary text-primary-foreground" : active ? "bg-primary/20 border border-primary text-primary" : "bg-white/5 text-muted-foreground"}`, children: done ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-3.5" }) }, s);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 rounded-3xl liquid-glass neon-border p-6 sm:p-8 space-y-5 animate-rise", children: [
        step === "identity" && /* @__PURE__ */ jsxRuntimeExports.jsx(IdentityStep, { form, usernameHint, setDisplayName: (v) => set("display_name", v), setUsername: (v) => {
          set("username", v);
          setUsernameHint("");
          setUsernameChecked("");
        }, onUsernameBlur: () => checkUsername(form.username) }),
        step === "about" && /* @__PURE__ */ jsxRuntimeExports.jsx(AboutStep, { bio: form.bio, location: form.location, dob: form.date_of_birth, showBirthday: form.show_birthday, setBio: (v) => set("bio", v), setLocation: (v) => set("location", v), setDob: (v) => set("date_of_birth", v), setShowBirthday: (v) => set("show_birthday", v) }),
        step === "zodiac" && /* @__PURE__ */ jsxRuntimeExports.jsx(ZodiacLockStep, { form, identity: zodiacPreview, setBirthLocation: (v) => {
          set("birth_location_label", v);
          set("zodiac_confirmed", false);
        }, setBirthTimePrecision: (v) => {
          set("birth_time_precision", v);
          set("zodiac_confirmed", false);
        }, setBirthTimeLocal: (v) => {
          set("birth_time_local", v);
          set("zodiac_confirmed", false);
        }, setBirthTimezone: (v) => {
          set("birth_timezone", v);
          set("zodiac_confirmed", false);
        }, setPublicOptIn: (v) => set("zodiac_public_opt_in", v), confirm: () => set("zodiac_confirmed", true), edit: () => set("zodiac_confirmed", false) }),
        step === "preferences" && /* @__PURE__ */ jsxRuntimeExports.jsx(PreferencesStep, { categories: form.favorite_categories, moods: form.favorite_moods, frequency: form.content_frequency, fanType: form.fan_type, toggleCategory: (v) => toggleList("favorite_categories", v), toggleMood: (v) => toggleList("favorite_moods", v), setFrequency: (v) => set("content_frequency", v), setFanType: (v) => set("fan_type", v) }),
        step === "socials" && /* @__PURE__ */ jsxRuntimeExports.jsx(SocialsStep, { instagram: form.instagram, tiktok: form.tiktok, youtube: form.youtube, xHandle: form.x_handle, setInstagram: (v) => set("instagram", v), setTiktok: (v) => set("tiktok", v), setYoutube: (v) => set("youtube", v), setXHandle: (v) => set("x_handle", v) }),
        step === "privacy" && /* @__PURE__ */ jsxRuntimeExports.jsx(PrivacyStep, { visibility: form.profile_visibility, showLocation: form.show_location, setVisibility: (v) => set("profile_visibility", v), setShowLocation: (v) => set("show_location", v) }),
        step === "review" && /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewStep, { form })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 flex gap-3", children: step !== "review" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: goNext, disabled: !canAdvance, className: "flex-1 h-11 rounded-2xl bg-primary text-primary-foreground text-sm font-bold glow-gold inline-flex items-center justify-center gap-2 disabled:opacity-50", children: [
        "Continue ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-4" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleFinish, disabled: saving, className: "flex-1 h-11 rounded-2xl bg-primary text-primary-foreground text-sm font-bold glow-gold inline-flex items-center justify-center gap-2 disabled:opacity-60", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-4" }),
        saving ? "Saving…" : "Finish setup"
      ] }) }),
      step !== "review" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: goNext, className: "text-xs text-muted-foreground hover:text-foreground", children: "Skip this step →" }) })
    ] })
  ] });
}
function StepHeading({
  title,
  sub
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold", children: title }),
    sub && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: sub })
  ] });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.2em] text-muted-foreground", children: label }),
    children
  ] });
}
function TextInput({
  value,
  onChange,
  placeholder,
  type = "text"
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value, onChange: (e) => onChange(e.target.value), type, placeholder, className: "w-full h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-sm focus:outline-none focus:border-primary/50 transition" });
}
function IdentityStep({
  form,
  usernameHint,
  setDisplayName,
  setUsername,
  onUsernameBlur
}) {
  const hintColor = usernameHint === "available" ? "text-green-400" : usernameHint === "taken" || usernameHint === "invalid" ? "text-red-400" : "text-muted-foreground";
  const hintText = usernameHint === "available" ? "Username is available" : usernameHint === "taken" ? "Username already taken" : usernameHint === "invalid" ? "3–30 letters, numbers or underscores" : usernameHint === "checking" ? "Checking…" : "";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(StepHeading, { title: "Your identity", sub: "What should people call you on Trey TV?" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "DISPLAY NAME", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.display_name, onChange: setDisplayName, placeholder: "Your name" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Field, { label: "USERNAME", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: form.username, onChange: (e) => setUsername(e.target.value), onBlur: onUsernameBlur, type: "text", placeholder: "@yourhandle", className: "w-full h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-sm focus:outline-none focus:border-primary/50 transition" }),
      hintText && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-[11px] mt-1 ${hintColor}`, children: hintText })
    ] })
  ] });
}
function AboutStep({
  bio,
  location,
  dob,
  showBirthday,
  setBio,
  setLocation,
  setDob,
  setShowBirthday
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(StepHeading, { title: "About you", sub: "A little context for your profile." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Field, { label: "BIO", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: bio, onChange: (e) => setBio(e.target.value), placeholder: "Short bio (optional)", maxLength: 160, rows: 3, className: "w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition resize-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground text-right", children: [
        bio.length,
        "/160"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "LOCATION", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: location, onChange: setLocation, placeholder: "City, State or Country (optional)" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "BIRTHDAY", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: dob, onChange: (e) => setDob(e.target.value), type: "date", className: "w-full h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-sm focus:outline-none focus:border-primary/50 transition" }) }),
    dob && /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: showBirthday, onChange: (e) => setShowBirthday(e.target.checked), className: "size-4" }),
      "Show birthday on my profile"
    ] })
  ] });
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
  edit
}) {
  if (!form.date_of_birth) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StepHeading, { title: "Personal identity", sub: "Add a birthday on the previous step to unlock your zodiac identity." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl bg-white/[0.04] border border-white/10 p-4 text-sm text-muted-foreground", children: "Zodiac identity is optional here, but it needs a date of birth before Trey TV can calculate it." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(StepHeading, { title: "Lock your zodiac identity", sub: "Review the details before this becomes part of your permanent Trey TV profile." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "BIRTH LOCATION", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.birth_location_label, onChange: setBirthLocation, placeholder: "Memphis, TN (optional)" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "BIRTH TIMEZONE", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.birth_timezone, onChange: setBirthTimezone, placeholder: "America/Chicago (optional)" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "BIRTH TIME", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: form.birth_time_precision, onChange: (e) => setBirthTimePrecision(e.target.value), className: "w-full h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-sm focus:outline-none focus:border-primary/50 transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "unknown", children: "I don't know" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "morning", children: "Morning" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "afternoon", children: "Afternoon" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "evening", children: "Evening" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "night", children: "Night" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "exact", children: "Exact time" })
      ] }) }),
      form.birth_time_precision === "exact" && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "EXACT TIME", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "time", value: form.birth_time_local, onChange: (e) => setBirthTimeLocal(e.target.value), className: "w-full h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-sm focus:outline-none focus:border-primary/50 transition" }) })
    ] }),
    identity && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl liquid-glass neon-border p-4 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ZodiacBadge, { sign: identity.sunSign, isCusp: identity.isCusp, cuspLabel: identity.cuspLabel }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-[0.2em] text-muted-foreground", children: identity.confidence.replace("_", " ") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewMini, { label: "DOB", value: form.date_of_birth }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewMini, { label: "Location", value: form.birth_location_label || "Not provided" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewMini, { label: "Timezone", value: form.birth_timezone || "Estimated" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewMini, { label: "Birth time", value: form.birth_time_precision === "exact" ? form.birth_time_local || "Exact" : form.birth_time_precision.replace("_", " ") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewMini, { label: "Cusp", value: identity.isCusp ? identity.cuspLabel ?? "Cusp Soul" : "No" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewMini, { label: "Method", value: identity.calculationMethod.replaceAll("_", " ") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-2 text-xs text-muted-foreground cursor-pointer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: form.zodiac_public_opt_in, onChange: (e) => setPublicOptIn(e.target.checked), className: "mt-0.5 size-4" }),
        "Show my zodiac badge and privacy-safe chart highlights on my public profile."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl bg-primary/10 border border-primary/25 p-3 text-xs text-muted-foreground", children: "Your zodiac identity is about to be added to your Trey TV profile. Once confirmed, this becomes part of your permanent profile identity unless support corrects an error." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: confirm, className: "flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-xs font-black glow-gold", children: form.zodiac_confirmed ? "Zodiac Identity Confirmed" : "Confirm Zodiac Identity" }),
        form.zodiac_confirmed && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: edit, className: "h-10 rounded-xl border border-white/10 px-3 text-xs font-semibold", children: "Edit Birth Details" })
      ] })
    ] })
  ] });
}
function ReviewMini({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-white/5 border border-white/10 p-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] tracking-[0.18em] text-muted-foreground uppercase", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 font-bold truncate", children: value })
  ] });
}
function Chip({
  active,
  onClick,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick, className: `px-3 h-8 rounded-full text-xs font-semibold transition border ${active ? "bg-primary/20 border-primary text-primary" : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20"}`, children });
}
function PreferencesStep({
  categories,
  moods,
  frequency,
  fanType,
  toggleCategory,
  toggleMood,
  setFrequency,
  setFanType
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(StepHeading, { title: "Your content taste", sub: "What brings you to Trey TV?" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.2em] text-muted-foreground mb-2", children: "CATEGORIES" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: CATEGORY_OPTIONS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { active: categories.includes(c), onClick: () => toggleCategory(c), children: c }, c)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.2em] text-muted-foreground mb-2", children: "VIBES" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: MOOD_OPTIONS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { active: moods.includes(m), onClick: () => toggleMood(m), children: m }, m)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.2em] text-muted-foreground mb-2", children: "HOW OFTEN DO YOU WATCH?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap", children: FREQUENCY_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { active: frequency === o.value, onClick: () => setFrequency(frequency === o.value ? "" : o.value), children: o.label }, o.value)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.2em] text-muted-foreground mb-2", children: "I'M MAINLY A…" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap", children: FAN_TYPE_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { active: fanType === o.value, onClick: () => setFanType(fanType === o.value ? "" : o.value), children: o.label }, o.value)) })
    ] })
  ] });
}
function SocialsStep({
  instagram,
  tiktok,
  youtube,
  xHandle,
  setInstagram,
  setTiktok,
  setYoutube,
  setXHandle
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(StepHeading, { title: "Social links", sub: "Connect your other platforms (all optional)." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "INSTAGRAM", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 h-10 focus-within:border-primary/50 transition", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Instagram, { className: "size-4 text-muted-foreground shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: instagram, onChange: (e) => setInstagram(e.target.value.replace(/^@/, "")), placeholder: "handle", className: "flex-1 bg-transparent text-sm focus:outline-none" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "TIKTOK", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 h-10 focus-within:border-primary/50 transition", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-sm shrink-0", children: "TT" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: tiktok, onChange: (e) => setTiktok(e.target.value.replace(/^@/, "")), placeholder: "handle", className: "flex-1 bg-transparent text-sm focus:outline-none" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "YOUTUBE", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 h-10 focus-within:border-primary/50 transition", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Youtube, { className: "size-4 text-muted-foreground shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: youtube, onChange: (e) => setYoutube(e.target.value), placeholder: "channel URL or handle", className: "flex-1 bg-transparent text-sm focus:outline-none" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "X / TWITTER", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 h-10 focus-within:border-primary/50 transition", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-sm font-bold shrink-0", children: "𝕏" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: xHandle, onChange: (e) => setXHandle(e.target.value.replace(/^@/, "")), placeholder: "handle", className: "flex-1 bg-transparent text-sm focus:outline-none" })
    ] }) })
  ] });
}
function PrivacyStep({
  visibility,
  showLocation,
  setVisibility,
  setShowLocation
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(StepHeading, { title: "Privacy", sub: "Control who sees your profile." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.2em] text-muted-foreground mb-2", children: "PROFILE VISIBILITY" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: VISIBILITY_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { active: visibility === o.value, onClick: () => setVisibility(o.value), children: o.label }, o.value)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: showLocation, onChange: (e) => setShowLocation(e.target.checked), className: "size-4" }),
      "Show location on profile"
    ] })
  ] });
}
function ReviewRow({
  label,
  value
}) {
  if (!value) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-3 text-sm py-2 border-b border-white/5 last:border-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground capitalize shrink-0", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-right max-w-[240px] truncate", children: value })
  ] });
}
function ReviewStep({
  form
}) {
  const socials = [form.instagram && `Instagram: @${form.instagram}`, form.tiktok && `TikTok: @${form.tiktok}`, form.youtube && `YouTube: ${form.youtube}`, form.x_handle && `X: @${form.x_handle}`].filter(Boolean).join(" · ");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(StepHeading, { title: "Review your profile", sub: "Everything look good? Hit Finish to go live." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-white/[0.03] border border-white/10 px-4 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewRow, { label: "Display name", value: form.display_name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewRow, { label: "Username", value: form.username ? `@${form.username}` : "" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewRow, { label: "Bio", value: form.bio }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewRow, { label: "Location", value: form.location }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewRow, { label: "Birthday", value: form.date_of_birth }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewRow, { label: "Categories", value: form.favorite_categories.join(", ") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewRow, { label: "Vibes", value: form.favorite_moods.join(", ") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewRow, { label: "Watch frequency", value: form.content_frequency.replace("_", " ") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewRow, { label: "Profile type", value: form.fan_type }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewRow, { label: "Socials", value: socials }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewRow, { label: "Visibility", value: form.profile_visibility.replace("_", " ") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3.5 text-primary shrink-0" }),
      "You can edit any of this later from your profile settings."
    ] })
  ] });
}
export {
  ManualOnboarding as component
};
