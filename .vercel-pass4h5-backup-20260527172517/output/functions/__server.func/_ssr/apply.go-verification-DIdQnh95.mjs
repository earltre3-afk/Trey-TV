import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { A as ApplicationWizardChrome, W as WizardNav, F as Field, N as NeonInput, a as NeonSelect, b as NeonTextarea, C as ChipPicker, c as NeonCheckList, d as CreatorPassport } from "./CreatorPassport-D1PggdfN.mjs";
import { L as Logo } from "./Logo-D0JEzEf4.mjs";
import { b as useAuth$1, s as supabase } from "./router-BtgGywEC.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { l as ShieldCheck, r as ChevronRight, U as User, bd as AtSign, h as Mail, as as BadgeCheck, F as FileText, S as Sparkles, ao as Pencil, bw as FileCheckCorner, O as Search, bb as CircleQuestionMark, X } from "../_libs/lucide-react.mjs";
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
const STEPS = ["Badge Identity", "Notability", "Official Links", "Safety Check", "Review"];
const CATEGORIES = ["Artist / Musician", "Actor / Performer", "Athlete", "Public Figure", "Brand / Business", "Creator / Influencer", "Journalist / Press", "Organization", "Other"];
const ACKS = ["I am the person, brand, or authorized representative for this account.", "I understand Go verification is for notability or official identity, not popularity alone.", "I understand Trey TV can deny or remove verification for impersonation, false information, or policy violations.", "I understand verification does not guarantee promotion, payment, creator approval, or special ranking.", "I understand Trey TV may request more information before making a decision."];
const EMPTY = {
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
  impersonationNote: ""
};
function GoVerificationApplication() {
  const {
    isGuest,
    user
  } = useAuth$1();
  const navigate = useNavigate();
  const [authSettled, setAuthSettled] = reactExports.useState(false);
  const [data, setData] = reactExports.useState(EMPTY);
  const [step, setStep] = reactExports.useState(1);
  const [appId, setAppId] = reactExports.useState(null);
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [savedFlash, setSavedFlash] = reactExports.useState(false);
  const [submitted, setSubmitted] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const timer = window.setTimeout(() => setAuthSettled(true), 200);
    return () => window.clearTimeout(timer);
  }, []);
  reactExports.useEffect(() => {
    if (authSettled && isGuest) {
      try {
        sessionStorage.setItem("treytv_post_auth_redirect", "/apply/go-verification");
      } catch {
      }
      navigate({
        to: "/login"
      });
    }
  }, [authSettled, isGuest, navigate]);
  reactExports.useEffect(() => {
    if (!user) return;
    setData((prev) => ({
      ...prev,
      displayName: prev.displayName || user.name || "",
      username: prev.username || (user.handle ? `@${user.handle}` : ""),
      bio: prev.bio || user.bio || "",
      officialLinks: [prev.officialLinks[0] || user.link || "", prev.officialLinks[1] || user.socialInstagram || "", prev.officialLinks[2] || user.socialYouTube || user.socialTikTok || ""]
    }));
  }, [user?.uid]);
  const update = (patch) => setData((prev) => ({
    ...prev,
    ...patch
  }));
  const next = () => {
    const err = validate(step, data);
    if (err) {
      toast.error(err);
      return;
    }
    setStep((s) => Math.min(STEPS.length, s + 1));
  };
  const back = () => setStep((s) => Math.max(1, s - 1));
  const save = async (status) => {
    const {
      data: auth
    } = await supabase.auth.getUser();
    const authUserId = auth.user?.id;
    if (!authUserId) throw new Error("Please sign in with your Trey TV account before submitting.");
    const payload = {
      user_id: authUserId,
      application_type: "verification",
      status,
      verification_data: {
        ...data,
        public_profile_uid: user?.uid
      },
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (appId) {
      const {
        error: error2
      } = await supabase.from("creator_applications").update(payload).eq("id", appId);
      if (error2) throw error2;
      return appId;
    }
    const {
      data: row,
      error
    } = await supabase.from("creator_applications").insert(payload).select("id").single();
    if (error) throw error;
    setAppId(row.id);
    return row.id;
  };
  const handleDraft = async () => {
    try {
      await save("draft");
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1500);
      toast.success("Draft saved.");
    } catch (error) {
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
    } catch (error) {
      toast.error(error?.message ?? "Could not submit verification request.");
    } finally {
      setSubmitting(false);
    }
  };
  if (!authSettled || isGuest) return null;
  if (submitted) return /* @__PURE__ */ jsxRuntimeExports.jsx(PendingSuccess, {});
  const titleA = ["Badge", "Notability", "Official", "Safety", "Review"][step - 1];
  const titleB = ["Identity", "Proof", "Links", "Check", "& Submit"][step - 1];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(ApplicationWizardChrome, { variant: "gold", titleA, titleB, steps: STEPS.map((label) => ({
    label
  })), current: step, onSaveDraft: handleDraft, draftSaved: savedFlash, sectionTitle: ["Badge Identity", "Notability Proof", "Official Links", "Safety Check", "Review & Submit"][step - 1], sectionSubtitle: ["Tell us who you are.", "Tell us about your public recognition.", "Share links that confirm your identity and notability.", "Please confirm the following.", "Review your verification request before submitting."][step - 1], side: /* @__PURE__ */ jsxRuntimeExports.jsx(BadgePreview, { data, uid: user?.uid || "GV-PENDING", step, avatarUrl: user?.avatar }), children: [
    step === 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(StepIdentity, { data, update }),
    step === 2 && /* @__PURE__ */ jsxRuntimeExports.jsx(StepNotability, { data, update }),
    step === 3 && /* @__PURE__ */ jsxRuntimeExports.jsx(StepLinks, { data, update }),
    step === 4 && /* @__PURE__ */ jsxRuntimeExports.jsx(StepSafety, { data, update }),
    step === 5 && /* @__PURE__ */ jsxRuntimeExports.jsx(StepReview, { data, jumpTo: setStep }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WizardNav, { variant: "gold", onBack: back, backDisabled: step === 1, onNext: step === STEPS.length ? submit : next, submitting, nextLabel: step === STEPS.length ? "Submit Verification Request" : "Next Step" })
  ] });
}
function BadgePreview({
  data,
  uid,
  step,
  avatarUrl
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "neon-gold p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-[oklch(0.88_0.18_92)]", children: "Gold Badge Preview" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-14 w-14 overflow-hidden rounded-full bg-gradient-to-br from-[oklch(0.83_0.17_88)] to-[oklch(0.7_0.18_60)]", children: avatarUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: avatarUrl, alt: "", className: "h-full w-full object-cover" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: data.displayName || "Your Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4 text-[oklch(0.88_0.18_92)] drop-shadow-[0_0_6px_oklch(0.88_0.2_92/0.8)]" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: data.username || "@username" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs text-muted-foreground", children: data.title || "Profile title (e.g., Recording Artist)" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorPassport, { variant: "gold", displayName: data.displayName, handle: data.username, uid, step, totalSteps: STEPS.length, avatarUrl })
  ] });
}
function StepIdentity({
  data,
  update
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Display name to verify", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonInput, { value: data.displayName, onChange: (e) => update({
        displayName: e.target.value
      }), trailingIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4 text-[oklch(0.92_0.18_88)]" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Username", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonInput, { value: data.username, onChange: (e) => update({
        username: e.target.value
      }), trailingIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AtSign, { className: "h-4 w-4 text-[oklch(0.92_0.18_88)]" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Email", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonInput, { type: "email", value: data.email, onChange: (e) => update({
        email: e.target.value
      }), trailingIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-4 w-4 text-[oklch(0.92_0.18_88)]" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "What are you applying as?", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(NeonSelect, { value: data.category, onChange: (e) => update({
        category: e.target.value
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select category" }),
        CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { className: "bg-background", children: c }, c))
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "What title should appear near your profile?", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonInput, { value: data.title, onChange: (e) => update({
      title: e.target.value
    }), trailingIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "h-4 w-4 text-[oklch(0.92_0.18_88)]" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Short public bio", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonTextarea, { rows: 3, value: data.bio, onChange: (e) => update({
      bio: e.target.value
    }), trailingIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-[oklch(0.92_0.18_88)]" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Why should this profile receive a Go badge?", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonTextarea, { rows: 4, value: data.reason, onChange: (e) => update({
      reason: e.target.value
    }), trailingIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-[oklch(0.92_0.18_88)]" }) }) })
  ] });
}
function StepNotability({
  data,
  update
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Notability categories", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChipPicker, { variant: "gold", multi: true, value: data.notabilityTypes, onChange: (v) => update({
      notabilityTypes: v
    }), options: ["Press Coverage", "Music Releases", "Large Social Following", "Public Brand / Business", "Verified Elsewhere", "Community Impact", "Awards / Recognition", "IMDb / Film / TV Credits", "Sports / Team Affiliation", "Other"].map((label) => ({
      value: label,
      label
    })) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Describe your public recognition (3-6 sentences)", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonTextarea, { rows: 4, value: data.recognitionDescription, onChange: (e) => update({
      recognitionDescription: e.target.value
    }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Any major achievements?", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonTextarea, { rows: 3, value: data.achievements, onChange: (e) => update({
      achievements: e.target.value
    }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Any press mentions?", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonTextarea, { rows: 3, value: data.pressMentions, onChange: (e) => update({
        pressMentions: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Any official releases / projects?", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonTextarea, { rows: 3, value: data.releases, onChange: (e) => update({
        releases: e.target.value
      }) }) })
    ] })
  ] });
}
function StepLinks({
  data,
  update
}) {
  const upd = (key, i, v) => {
    const next = [...data[key]];
    next[i] = v;
    update({
      [key]: next
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Official Links", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: data.officialLinks.map((l, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(NeonInput, { placeholder: `Official link ${i + 1}`, value: l, onChange: (e) => upd("officialLinks", i, e.target.value) }, i)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Proof Links", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: data.proofLinks.map((l, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(NeonInput, { placeholder: `Proof link ${i + 1}`, value: l, onChange: (e) => upd("proofLinks", i, e.target.value) }, i)) }) })
  ] });
}
function StepSafety({
  data,
  update
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(NeonCheckList, { variant: "gold", items: ACKS, value: data.acks, onToggle: (i) => {
      const next = [...data.acks];
      next[i] = !next[i];
      update({
        acks: next
      });
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Is there any impersonation risk or confusion we should know about? (optional)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeonTextarea, { rows: 4, value: data.impersonationNote, onChange: (e) => update({
      impersonationNote: e.target.value
    }) }) })
  ] });
}
function StepReview({
  data,
  jumpTo
}) {
  const sections = ["Badge Identity", "Notability Proof", "Official Links", "Safety Check"];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: sections.map((title, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "step-circle is-done", children: i + 1 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "flex-1 font-semibold", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => jumpTo(i + 1), className: "btn-ghost-glass inline-flex items-center gap-2 px-3 py-2 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }),
        " Edit"
      ] })
    ] }, title)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-3 text-sm font-semibold", children: "Request Summary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Display Name", v: data.displayName || "-" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Category", v: data.category || "-" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Profile Title", v: data.title || "-" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Notability Types", v: String(data.notabilityTypes.length) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Official Links", v: `${data.officialLinks.filter(Boolean).length} added` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Proof Links", v: `${data.proofLinks.filter(Boolean).length} added` })
      ] })
    ] })
  ] });
}
function Row({
  k,
  v
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4 border-b border-white/5 py-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: k }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "text-right text-foreground", children: v })
  ] });
}
const GO_PIPELINE_STAGES = [{
  key: "Submitted",
  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FileCheckCorner, { className: "h-5 w-5" })
}, {
  key: "Under Review",
  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-5 w-5" })
}, {
  key: "More Info",
  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleQuestionMark, { className: "h-5 w-5" })
}, {
  key: "Approved",
  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-5 w-5" })
}, {
  key: "Denied",
  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" })
}];
function GoStatusPipeline({
  current
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start gap-1", children: GO_PIPELINE_STAGES.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col items-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-center", children: [
      i > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pipeline-line" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `pipeline-icon mx-auto ${s.key === current ? "is-current" : ""}`, children: s.icon }),
      i < GO_PIPELINE_STAGES.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pipeline-line" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `mt-2 text-center text-[10px] leading-tight sm:text-xs ${s.key === current ? "font-semibold text-[oklch(0.92_0.18_88)]" : "text-muted-foreground"}`, children: s.key })
  ] }, s.key)) }) });
}
function PendingSuccess() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "apply-scroll-page liquid-stage gold min-h-screen min-h-[100dvh]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid-veil", "aria-hidden": true }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "orb-extra", "aria-hidden": true }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-2xl px-4 py-8 lg:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative neon-gold p-6 md:p-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "swoosh-bg" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "liquid-sheen" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-col items-center text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "logo-float h-14" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "my-8 inline-flex h-28 w-28 items-center justify-center rounded-3xl", style: {
          boxShadow: "inset 0 0 0 2px oklch(0.95 0.2 88 / 0.95), 0 0 60px oklch(0.85 0.2 85 / 0.6)"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-14 w-14 text-[oklch(0.92_0.18_88)] drop-shadow-[0_0_16px_oklch(0.85_0.2_85/0.8)]" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl font-semibold leading-tight", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: "Your Go " }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "title-split-gold", children: "Badge" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: " Is In Review!" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 max-w-sm text-sm text-muted-foreground", children: "We received your verification request. You'll be notified as it moves through review." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-7 w-full space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/applications", className: "neon-btn-gold w-full py-4 text-base", children: [
            "View Request Status ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-5 w-5" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "neon-btn-blue w-full py-4 text-base", children: [
            "Back to Trey TV ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-5 w-5" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(GoStatusPipeline, { current: "Submitted" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden min-h-screen lg:flex", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex w-[42%] flex-col items-center justify-center overflow-hidden px-16 xl:w-[38%]", style: {
        background: "radial-gradient(120% 80% at 50% 30%, oklch(0.65 0.22 80 / 0.2), transparent 65%),radial-gradient(80% 60% at 80% 80%, oklch(0.78 0.18 70 / 0.12), transparent 60%),oklch(0.07 0.025 262 / 0.95)",
        borderRight: "1px solid oklch(1 0 0 / 0.06)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8 flex h-48 w-48 items-center justify-center rounded-[2.5rem]", style: {
          background: "linear-gradient(135deg, oklch(0.14 0.06 80 / 0.9), oklch(0.08 0.03 70 / 0.9))",
          boxShadow: "inset 0 0 0 2px oklch(0.92 0.18 88 / 0.6), 0 0 80px oklch(0.85 0.2 85 / 0.35), 0 0 0 1px oklch(0.78 0.18 80 / 0.25)"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-24 w-24 text-[oklch(0.92_0.18_88)]", style: {
          filter: "drop-shadow(0 0 20px oklch(0.85 0.2 85 / 0.75))"
        } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-xs space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[oklch(0.85_0.2_85)]", children: "What Happens Next" }),
          ["Your request enters our review queue", "Our team checks your notability evidence", "You may be asked for more information", "Approved accounts receive the Go badge"].map((txt, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-[oklch(0.92_0.18_88)]", style: {
              boxShadow: "inset 0 0 0 1px oklch(0.85 0.2 85 / 0.6), 0 0 10px oklch(0.85 0.2 85 / 0.2)"
            }, children: i + 1 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: txt })
          ] }, txt))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-1 flex-col items-center justify-center px-16 xl:px-24", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "logo-float mb-8 h-16" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-4xl font-semibold leading-tight xl:text-5xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: "Your Go " }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "title-split-gold", children: "Badge" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: " Is In Review!" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 text-base text-muted-foreground", children: "We received your verification request. Our team will review your notability evidence." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/applications", className: "neon-btn-gold w-full py-4 text-base", children: [
            "View Request Status ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-5 w-5" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "neon-btn-blue w-full py-4 text-base", children: [
            "Back to Trey TV ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-5 w-5" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(GoStatusPipeline, { current: "Submitted" })
      ] }) })
    ] })
  ] });
}
function validate(step, data) {
  if (step === 1 && (!data.displayName.trim() || !data.username.trim() || !data.category || !data.title.trim() || !data.bio.trim() || !data.reason.trim())) return "Complete the required identity fields.";
  if (step === 2 && (data.notabilityTypes.length === 0 || !data.recognitionDescription.trim())) return "Select at least one notability category and describe your recognition.";
  if (step === 4 && !data.acks.every(Boolean)) return "Please accept all safety confirmations.";
  return null;
}
export {
  GoVerificationApplication as component
};
