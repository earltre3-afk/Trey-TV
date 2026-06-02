import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { b as useAuth$1, s as supabase } from "./router-BtgGywEC.mjs";
import { L as Logo } from "./Logo-D0JEzEf4.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { z as ChevronLeft, az as LoaderCircle, aG as Save, r as ChevronRight, t as Crown, F as FileText, k as Check, O as Search, bb as CircleQuestionMark, p as Shield, X, bt as FilePen, be as MapPin } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
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
import "./trey-tv-logo-CG7PjBoN.mjs";
const EMPTY = {
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
  agreed_to_standards: false
};
const NICHES = ["Music", "Film & TV", "Comedy", "Lifestyle", "Sports", "Gaming", "Food", "Fashion", "Tech", "Education", "News", "Art", "Fitness", "Travel", "Business"];
const FORMATS = ["Video", "Short-form", "Music", "Podcast", "Live Stream", "Documentary", "Tutorials"];
const FREQUENCIES = ["Daily", "3–4x per week", "Weekly", "2x per month", "Monthly"];
const TIMELINES = ["Within 1 week", "2–4 weeks", "1–3 months", "3+ months"];
const TOTAL_STEPS = 6;
const STEPS = [{
  label: "Identity",
  short: "1"
}, {
  label: "Channel",
  short: "2"
}, {
  label: "Content\nStyle",
  short: "3"
}, {
  label: "Launch\nPlan",
  short: "4"
}, {
  label: "Standards",
  short: "5"
}, {
  label: "Review",
  short: "6"
}];
const C = {
  blue: "oklch(0.82 0.15 215)",
  blueDim: "oklch(0.82 0.15 215 / 0.4)"
};
function InputField({
  label,
  value,
  onChange,
  placeholder,
  required,
  maxLength
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-semibold tracking-wide text-muted-foreground uppercase", children: [
      label,
      required && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[oklch(0.7_0.25_340)] ml-0.5", children: "*" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value, onChange: (e) => onChange(e.target.value), placeholder, maxLength, className: "w-full px-4 py-3 rounded-xl bg-black/25 border border-[oklch(0.82_0.15_215_/_0.42)] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-[oklch(0.82_0.15_215_/_0.9)] focus:bg-white/8 transition shadow-[inset_0_0_16px_oklch(0.82_0.15_215_/_0.08)]" }),
    maxLength && value.length > maxLength * 0.8 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-[10px] text-muted-foreground", children: [
      value.length,
      "/",
      maxLength
    ] })
  ] });
}
function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  required,
  maxLength
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-semibold tracking-wide text-muted-foreground uppercase", children: [
      label,
      required && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[oklch(0.7_0.25_340)] ml-0.5", children: "*" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value, onChange: (e) => onChange(e.target.value), placeholder, rows, maxLength, className: "w-full px-4 py-3 rounded-xl bg-black/25 border border-[oklch(0.82_0.15_215_/_0.42)] text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-[oklch(0.82_0.15_215_/_0.9)] focus:bg-white/8 transition resize-none shadow-[inset_0_0_16px_oklch(0.82_0.15_215_/_0.08)]" }),
    maxLength && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-[10px] text-muted-foreground", children: [
      value.length,
      "/",
      maxLength
    ] })
  ] });
}
function PillSelect({
  label,
  options,
  value,
  onToggle,
  single
}) {
  const isActive = (o) => Array.isArray(value) ? value.includes(o) : value === o;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold tracking-wide text-muted-foreground uppercase", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: options.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => onToggle(o), className: `px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${isActive(o) ? "bg-primary/20 border-primary/60 text-primary glow-gold" : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"}`, children: o }, o)) })
  ] });
}
function Step1({
  data,
  set
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(StepHeader, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-6 text-primary" }), title: "Your Identity", sub: "Tell us who you are as a creator." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(InputField, { label: "Creator Name", value: data.creator_name, onChange: (v) => set("creator_name", v), placeholder: "Your public creator name", required: true, maxLength: 60 }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(InputField, { label: "Channel Handle", value: data.channel_handle, onChange: (v) => set("channel_handle", v.replace(/[^a-zA-Z0-9_.]/g, "").toLowerCase()), placeholder: "@yourhandle", required: true, maxLength: 30 }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(InputField, { label: "Location", value: data.location, onChange: (v) => set("location", v), placeholder: "City, State or Country", maxLength: 60 })
  ] });
}
function Step2({
  data,
  set,
  toggleFormat
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(StepHeader, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: "📺" }), title: "Your Channel", sub: "Describe what your channel is all about." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(InputField, { label: "Channel Name", value: data.channel_name, onChange: (v) => set("channel_name", v), placeholder: "e.g. The Daily Frequency", required: true, maxLength: 80 }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PillSelect, { label: "Content Category / Niche", options: NICHES, value: data.niche, onToggle: (v) => set("niche", data.niche === v ? "" : v), single: true }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TextareaField, { label: "Channel Description", value: data.bio, onChange: (v) => set("bio", v), placeholder: "What is your channel about? Who is it for? What makes it unique?", rows: 4, required: true, maxLength: 500 })
  ] });
}
function Step3({
  data,
  set,
  toggleFormat
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(StepHeader, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: "🎬" }), title: "Content Style", sub: "How and how often will you publish?" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PillSelect, { label: "Content Formats", options: FORMATS, value: data.content_formats, onToggle: toggleFormat }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PillSelect, { label: "Posting Frequency", options: FREQUENCIES, value: data.posting_frequency, onToggle: (v) => set("posting_frequency", data.posting_frequency === v ? "" : v), single: true }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TextareaField, { label: "Target Audience", value: data.target_audience, onChange: (v) => set("target_audience", v), placeholder: "Who is your content for? Age range, interests, demographic?", rows: 3, maxLength: 300 })
  ] });
}
function Step4({
  data,
  set
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(StepHeader, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: "🚀" }), title: "Launch Plan", sub: "Tell us how you'll hit the ground running." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TextareaField, { label: "First Content Idea", value: data.first_content_idea, onChange: (v) => set("first_content_idea", v), placeholder: "Describe your first piece of content — what's the hook? What makes it shareable?", rows: 3, required: true, maxLength: 400 }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PillSelect, { label: "Release Timeline", options: TIMELINES, value: data.release_timeline, onToggle: (v) => set("release_timeline", data.release_timeline === v ? "" : v), single: true }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TextareaField, { label: "Why Trey TV?", value: data.reason, onChange: (v) => set("reason", v), placeholder: "Why do you want to create on Trey TV? What are your goals for your channel?", rows: 3, required: true, maxLength: 400 })
  ] });
}
function Step5({
  data,
  setAgreed
}) {
  const standards = ["I will publish original, authentic content that I have the rights to.", "I will not post content that is hateful, harmful, or violates Trey TV's community guidelines.", "I will engage respectfully with my audience and other creators.", "I understand that my application may be reviewed and I may be asked to provide more information.", "I agree to Trey TV's Creator Terms of Service and Content Policy."];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(StepHeader, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: "🤝" }), title: "Community Standards", sub: "Every creator on Trey TV upholds these commitments." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: standards.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 p-3 rounded-2xl bg-white/3 border border-white/8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-5 rounded-full border border-primary/40 bg-primary/10 grid place-items-center shrink-0 mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground leading-relaxed", children: s })
    ] }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setAgreed(!data.agreed_to_standards), className: `w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${data.agreed_to_standards ? "border-primary/60 bg-primary/10 text-primary" : "border-white/15 bg-white/3 text-muted-foreground hover:border-white/25"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `size-6 rounded-lg border-2 grid place-items-center transition-all ${data.agreed_to_standards ? "border-primary bg-primary" : "border-muted-foreground"}`, children: data.agreed_to_standards && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3.5 text-primary-foreground" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: "I agree to all community standards" })
    ] })
  ] });
}
function Step6({
  data,
  goToStep
}) {
  const sections = [{
    n: 1,
    title: "Your Identity",
    sub: "Personal information and creator profile",
    step: 0
  }, {
    n: 2,
    title: "Your Channel",
    sub: "Channel details, category, and branding",
    step: 1
  }, {
    n: 3,
    title: "Your Content Style",
    sub: "Content focus, format, and unique value",
    step: 2
  }, {
    n: 4,
    title: "Your Launch Plan",
    sub: "Publishing plan, goals, and growth strategy",
    step: 3
  }, {
    n: 5,
    title: "Community Standards",
    sub: "Content guidelines and compliance",
    step: 4
  }, {
    n: 6,
    title: "Review & Confirm",
    sub: "Final review and declarations",
    step: 5
  }];
  const summary = [{
    icon: "📺",
    label: "Channel Name",
    value: data.channel_name || "—"
  }, {
    icon: "🏷️",
    label: "Category",
    value: data.niche || "—"
  }, {
    icon: "📅",
    label: "Upload Frequency",
    value: data.posting_frequency || "—"
  }, {
    icon: "🎙️",
    label: "First Show",
    value: data.first_content_idea ? data.first_content_idea.slice(0, 40) : "—"
  }, {
    icon: "🛡️",
    label: "Rights Confirmation",
    value: data.agreed_to_standards ? "Yes" : "Pending"
  }, {
    icon: "🚀",
    label: "Launch Timeline",
    value: data.release_timeline || "—"
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-extrabold tracking-tight", children: [
      "Creator Channel",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-transparent bg-clip-text bg-gradient-to-r from-[oklch(0.82_0.15_215)] to-[oklch(0.92_0.15_220)]", children: "Application" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl p-4 border border-[oklch(0.82_0.15_215_/_0.4)] bg-[oklch(0.10_0.05_220_/_0.6)] shadow-[0_0_40px_-12px_oklch(0.82_0.15_215_/_0.5),inset_0_1px_0_oklch(0.82_0.15_215_/_0.2)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold mb-3", children: "Review & Submit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: sections.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3 rounded-2xl border border-[oklch(0.82_0.15_215_/_0.25)] bg-[oklch(0.12_0.05_220_/_0.5)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-7 rounded-full border border-[oklch(0.82_0.15_215_/_0.5)] grid place-items-center text-[11px] font-bold text-[oklch(0.82_0.15_215)] shrink-0", children: s.n }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold truncate", children: s.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground leading-tight", children: s.sub })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => goToStep(s.step), className: "size-7 rounded-lg border border-[oklch(0.82_0.15_215_/_0.4)] grid place-items-center text-[oklch(0.82_0.15_215)] hover:bg-[oklch(0.82_0.15_215_/_0.1)]", "aria-label": `Edit ${s.title}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FilePen, { className: "size-3.5" }) })
        ] }, s.n)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl p-4 border border-[oklch(0.82_0.15_215_/_0.4)] bg-[oklch(0.10_0.05_220_/_0.6)] shadow-[0_0_40px_-12px_oklch(0.82_0.15_215_/_0.5),inset_0_1px_0_oklch(0.82_0.15_215_/_0.2)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold mb-3", children: "Application Summary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-[oklch(0.82_0.15_215_/_0.15)]", children: summary.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 py-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-9 rounded-xl border border-[oklch(0.82_0.15_215_/_0.3)] bg-[oklch(0.82_0.15_215_/_0.08)] grid place-items-center text-base shrink-0", children: row.icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wide text-muted-foreground", children: row.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold text-[oklch(0.82_0.15_215)] truncate", children: row.value })
          ] })
        ] }, row.label)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-[oklch(0.82_0.15_215_/_0.35)] bg-[oklch(0.10_0.05_220_/_0.5)] p-4 flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-10 rounded-xl border border-[oklch(0.82_0.15_215_/_0.5)] bg-[oklch(0.82_0.15_215_/_0.1)] grid place-items-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-5 text-[oklch(0.82_0.15_215)]" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground leading-relaxed", children: [
        "By submitting, you confirm that all information provided is accurate and you agree to comply with Trey TV's",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[oklch(0.82_0.15_215)] font-semibold", children: "Community Guidelines." })
      ] })
    ] })
  ] });
}
function StepHeader({
  icon,
  title,
  sub
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-12 rounded-2xl liquid-glass border border-white/10 grid place-items-center shrink-0", children: icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: sub })
    ] })
  ] });
}
function Submitted() {
  const navigate = useNavigate();
  const timeline = [{
    label: "Submitted",
    Icon: Check,
    active: true,
    done: false
  }, {
    label: "Under Review",
    Icon: Search,
    active: false,
    done: false
  }, {
    label: "More Info\nNeeded",
    Icon: CircleQuestionMark,
    active: false,
    done: false
  }, {
    label: "Approved",
    Icon: Shield,
    active: false,
    done: false
  }, {
    label: "Denied",
    Icon: X,
    active: false,
    done: false
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex flex-col items-center px-6 pt-16 pb-10 text-center", style: {
    background: "radial-gradient(ellipse 120% 60% at 50% 0%, oklch(0.18 0.08 230 / 0.55) 0%, #02050B 60%)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[oklch(0.82_0.15_215_/_0.10)] blur-[140px]" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full max-w-md flex flex-col items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 -m-8 rounded-full blur-3xl bg-[oklch(0.82_0.15_215_/_0.5)] animate-pulse-glow" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative size-40 rounded-3xl border-2 border-[oklch(0.82_0.15_215_/_0.7)] bg-[oklch(0.10_0.05_230_/_0.6)] grid place-items-center shadow-[0_0_60px_oklch(0.82_0.15_215_/_0.6),inset_0_0_30px_oklch(0.82_0.15_215_/_0.25)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "size-20 text-[oklch(0.82_0.15_215)] drop-shadow-[0_0_18px_oklch(0.82_0.15_215_/_0.9)]", strokeWidth: 1.5 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-3 right-3 size-10 rounded-full bg-[oklch(0.82_0.15_215_/_0.2)] border-2 border-[oklch(0.82_0.15_215)] grid place-items-center shadow-[0_0_20px_oklch(0.82_0.15_215_/_0.8)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-5 text-[oklch(0.92_0.15_220)]", strokeWidth: 3 }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl font-extrabold tracking-tight leading-tight mb-2", children: [
        "Your Creator",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-transparent bg-clip-text bg-gradient-to-r from-[oklch(0.82_0.15_215)] via-[oklch(0.92_0.15_220)] to-[oklch(0.82_0.15_215)] drop-shadow-[0_0_18px_oklch(0.82_0.15_215_/_0.6)]", children: "Application" }),
        " ",
        "Is In!"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground leading-relaxed mb-7 max-w-sm", children: [
        "We received your channel application.",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "You can check the status from your profile."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full space-y-3 mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate({
          to: "/applications"
        }), className: "w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 text-white border-2 border-[oklch(0.82_0.15_215_/_0.7)] bg-[oklch(0.14_0.06_230_/_0.6)] shadow-[0_0_30px_oklch(0.82_0.15_215_/_0.5),inset_0_0_20px_oklch(0.82_0.15_215_/_0.15)] hover:shadow-[0_0_40px_oklch(0.82_0.15_215_/_0.7)] transition", children: [
          "View Application Status ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-4" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate({
          to: "/"
        }), className: "w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 text-[oklch(0.92_0.18_85)] border-2 border-[oklch(0.82_0.16_85_/_0.6)] bg-[oklch(0.14_0.06_85_/_0.4)] shadow-[0_0_24px_oklch(0.82_0.16_85_/_0.4)] hover:shadow-[0_0_32px_oklch(0.82_0.16_85_/_0.6)] transition", children: [
          "Back to Trey TV ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-4" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start w-full", children: timeline.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `size-11 rounded-full border-2 grid place-items-center transition-all ${t.active ? "border-[oklch(0.82_0.15_215)] bg-[oklch(0.82_0.15_215_/_0.2)] shadow-[0_0_18px_oklch(0.82_0.15_215_/_0.8)]" : "border-white/15 bg-white/3"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(t.Icon, { className: `size-4 ${t.active ? "text-[oklch(0.92_0.15_220)]" : "text-muted-foreground"}`, strokeWidth: t.active ? 3 : 2 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-[9px] text-center mt-1.5 leading-tight whitespace-pre-line font-medium ${t.active ? "text-[oklch(0.82_0.15_215)]" : "text-muted-foreground"}`, children: t.label })
        ] }),
        i < timeline.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px w-2 mt-5 shrink-0 bg-white/10" })
      ] }, t.label)) })
    ] })
  ] });
}
function ExistingApplicationState({
  app
}) {
  const navigate = useNavigate();
  const statusCopy = {
    pending: {
      title: "Your Creator Application Is Under Review",
      body: "We already have your channel application in the review queue. You can track the latest status from your applications page."
    },
    approved: {
      title: "You Are Approved To Create",
      body: "Your creator application has already been approved. Creator tools remain available from your hub."
    },
    rejected: {
      title: "Application Decision Posted",
      body: "Your creator application has a review decision. Check your applications page for notes from the team."
    },
    revoked: {
      title: "Creator Access Needs Review",
      body: "Your creator status needs admin review before a new creator application can be submitted."
    }
  };
  const copy = statusCopy[app.status] ?? statusCopy.pending;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-[#02050B] flex items-center justify-center px-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md rounded-3xl border border-[oklch(0.82_0.15_215_/_0.35)] bg-[oklch(0.08_0.04_230_/_0.82)] p-6 text-center shadow-[0_0_60px_oklch(0.82_0.15_215_/_0.18)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto size-16 rounded-2xl border border-[oklch(0.82_0.15_215_/_0.55)] bg-[oklch(0.82_0.15_215_/_0.14)] grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-8 text-[oklch(0.82_0.15_215)]" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-5 text-2xl font-extrabold tracking-tight", children: copy.title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground leading-relaxed", children: copy.body }),
    app.review_notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-muted-foreground italic", children: [
      '"',
      app.review_notes,
      '"'
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate({
        to: "/applications"
      }), className: "w-full py-3.5 rounded-2xl font-bold text-sm text-white border border-[oklch(0.82_0.15_215_/_0.7)] bg-[oklch(0.14_0.06_230_/_0.75)] shadow-[0_0_24px_oklch(0.82_0.15_215_/_0.35)]", children: "View Application Status" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate({
        to: "/"
      }), className: "w-full py-3.5 rounded-2xl font-semibold text-sm border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground", children: "Back to Trey TV" })
    ] })
  ] }) });
}
function CreatorPassport({
  data,
  user,
  step
}) {
  const percent = Math.round((step + 1) / TOTAL_STEPS * 100);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "apply-shell-panel hidden w-full rounded-[28px] p-5 lg:block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xl font-extrabold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "size-5 text-[oklch(0.82_0.15_215)]" }),
      "Creator Passport"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 overflow-hidden rounded-[22px] border border-[oklch(0.82_0.15_215_/_0.45)] bg-black/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: user.avatar, alt: "", className: "aspect-[4/4.3] w-full object-cover" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-3xl font-extrabold", children: data.creator_name || user.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-lg text-[oklch(0.82_0.15_215)]", children: data.channel_handle || `@${user.handle}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 inline-flex items-center gap-2 text-white/75", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "size-4" }),
        " ",
        data.location || user.location || "Location"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "my-6 h-px bg-white/15" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm uppercase tracking-wide text-white/55", children: "Creator UID" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-2xl font-extrabold text-[oklch(0.82_0.15_215)]", children: user.uid })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "my-6 h-px bg-white/15" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto grid size-36 place-items-center rounded-full border border-[oklch(0.82_0.15_215_/_0.36)] bg-[conic-gradient(oklch(0.82_0.15_215)_0deg,oklch(0.82_0.15_215)_calc(var(--p)*1deg),oklch(1_0_0_/_0.08)_0)] shadow-[0_0_28px_oklch(0.82_0.15_215_/_0.35)]", style: {
      "--p": percent * 3.6
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-28 place-items-center rounded-full bg-[#02050b] text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-4xl font-extrabold", children: [
        percent,
        "%"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-[oklch(0.82_0.15_215)]", children: [
        "Step ",
        step + 1,
        " of ",
        TOTAL_STEPS
      ] })
    ] }) }) })
  ] });
}
function StepProgress({
  current
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center", children: STEPS.map((s, i) => {
      const done = i < current;
      const active = i === current;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative shrink-0 size-8 sm:size-9 rounded-full grid place-items-center text-xs sm:text-sm font-bold border-2 transition-all duration-300", style: {
          background: done ? C.blue : active ? "oklch(0.82 0.15 215 / 0.18)" : "oklch(1 0 0 / 0.05)",
          borderColor: done ? C.blue : active ? C.blue : "oklch(1 0 0 / 0.15)",
          boxShadow: active ? `0 0 18px ${C.blue}` : "none",
          color: done ? "#fff" : active ? C.blue : "oklch(0.5 0 0)"
        }, children: done ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-4" }) : s.short }),
        i < STEPS.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px mx-1", style: {
          background: done ? C.blue : "oklch(1 0 0 / 0.1)"
        } })
      ] }, i);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex mt-2", children: STEPS.map((s, i) => {
      const active = i === current;
      const done = i < current;
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] leading-tight whitespace-pre-line font-semibold", style: {
        color: active ? C.blue : done ? C.blue : "oklch(0.45 0 0)"
      }, children: s.label }) }, i);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-xs font-bold mt-1.5", style: {
      color: C.blue
    }, children: [
      "Step ",
      current + 1,
      " of ",
      STEPS.length
    ] })
  ] });
}
function validateStep(step, data) {
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
function CreatorApplication() {
  const {
    isGuest,
    user
  } = useAuth$1();
  const navigate = useNavigate();
  const [step, setStep] = reactExports.useState(0);
  const [data, setData] = reactExports.useState(EMPTY);
  const [saving, setSaving] = reactExports.useState(false);
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [submitted, setSubmitted] = reactExports.useState(false);
  const [appId, setAppId] = reactExports.useState(null);
  const [existingApp, setExistingApp] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (isGuest) {
      try {
        sessionStorage.setItem("treytv_post_auth_redirect", "/apply/creator");
      } catch {
      }
      navigate({
        to: "/login"
      });
    }
  }, [isGuest, navigate]);
  reactExports.useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void (async () => {
      try {
        const {
          data: auth
        } = await supabase.auth.getUser();
        const authUserId = auth.user?.id;
        if (!authUserId) return;
        const {
          data: existing
        } = await supabase.from("creator_applications").select("*").eq("application_type", "creator").eq("user_id", authUserId).limit(1).maybeSingle();
        if (cancelled || !existing) return;
        if (!["draft", "needs_more_info"].includes(existing.status)) {
          setExistingApp({
            id: existing.id,
            status: existing.status,
            review_notes: existing.review_notes,
            updated_at: existing.updated_at
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
          agreed_to_standards: existing.agreed_to_standards ?? false
        });
      } catch {
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);
  const set = reactExports.useCallback((k, v) => {
    setData((prev) => ({
      ...prev,
      [k]: v
    }));
  }, []);
  const toggleFormat = reactExports.useCallback((fmt) => {
    setData((prev) => ({
      ...prev,
      content_formats: prev.content_formats.includes(fmt) ? prev.content_formats.filter((f) => f !== fmt) : [...prev.content_formats, fmt]
    }));
  }, []);
  const buildPayload = (status, userId) => ({
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
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  const upsert = async (status) => {
    const {
      data: auth
    } = await supabase.auth.getUser();
    const authUserId = auth.user?.id;
    if (!authUserId) throw new Error("Please sign in before submitting an application.");
    const payload = buildPayload(status, authUserId);
    if (appId) {
      const {
        error
      } = await supabase.from("creator_applications").update(payload).eq("id", appId);
      if (error) throw error;
      return appId;
    } else {
      const {
        data: row,
        error
      } = await supabase.from("creator_applications").insert(payload).select("id").single();
      if (error) throw error;
      setAppId(row.id);
      return row.id;
    }
  };
  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await upsert("draft");
      toast.success("Draft saved!");
    } catch (err) {
      toast.error(err?.message ?? "Failed to save draft.");
    } finally {
      setSaving(false);
    }
  };
  const handleNext = () => {
    const err = validateStep(step, data);
    if (err) {
      toast.error(err);
      return;
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };
  const handleBack = () => setStep((s) => Math.max(s - 1, 0));
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await upsert("pending");
      setSubmitted(true);
    } catch (err) {
      toast.error(err?.message ?? "Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  };
  if (isGuest) return null;
  if (submitted) return /* @__PURE__ */ jsxRuntimeExports.jsx(Submitted, {});
  if (existingApp) return /* @__PURE__ */ jsxRuntimeExports.jsx(ExistingApplicationState, { app: existingApp });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "apply-scroll-page apply-luxe-page flex min-h-[100dvh] flex-col overflow-x-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "relative mx-auto flex w-full max-w-5xl shrink-0 items-start justify-between px-4 pt-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: step === 0 ? () => navigate({
        to: "/apply"
      }) : handleBack, className: "apply-pill-button flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "size-4 text-[oklch(0.82_0.15_215)]" }),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Back to Apply" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sm:hidden", children: "Back" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "absolute left-1/2 top-3 h-14 sm:h-20 -translate-x-1/2 drop-shadow-[0_0_28px_oklch(0.82_0.16_85_/_0.7)]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleSaveDraft, disabled: saving, className: "apply-pill-button flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-50", children: [
        saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin text-[oklch(0.82_0.15_215)]" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "size-4 text-[oklch(0.82_0.15_215)]" }),
        "Save Draft"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 px-5 pb-3 pt-14 sm:pt-20 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-4xl font-extrabold tracking-normal sm:text-5xl", children: [
      "Creator Channel",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[oklch(0.82_0.15_215)] drop-shadow-[0_0_20px_oklch(0.82_0.15_215_/_0.7)]", children: "Application" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto w-full max-w-5xl shrink-0 px-5 pb-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StepProgress, { current: step }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 px-4 pb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto grid w-full max-w-5xl gap-5 lg:grid-cols-[minmax(0,1fr)_320px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "apply-shell-panel animate-rise rounded-[28px] p-5 sm:p-6 lg:p-8", children: [
        step === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Step1, { data, set: (k, v) => set(k, v) }),
        step === 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Step2, { data, set: (k, v) => set(k, v), toggleFormat }),
        step === 2 && /* @__PURE__ */ jsxRuntimeExports.jsx(Step3, { data, set: (k, v) => set(k, v), toggleFormat }),
        step === 3 && /* @__PURE__ */ jsxRuntimeExports.jsx(Step4, { data, set: (k, v) => set(k, v) }),
        step === 4 && /* @__PURE__ */ jsxRuntimeExports.jsx(Step5, { data, setAgreed: (v) => set("agreed_to_standards", v) }),
        step === 5 && /* @__PURE__ */ jsxRuntimeExports.jsx(Step6, { data, goToStep: setStep })
      ] }),
      user && /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorPassport, { data, user, step })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),1rem)]", style: {
      background: "linear-gradient(180deg, transparent, oklch(0.02 0.01 240 / 0.92))"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-5xl gap-4", children: [
        step > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleBack, className: "flex-1 py-4 rounded-full font-bold text-sm flex items-center justify-center gap-2 text-white", style: {
          background: "oklch(0.15 0.05 230 / 0.7)",
          border: `1px solid ${C.blueDim}`
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "size-4" }),
          " Back"
        ] }),
        step < TOTAL_STEPS - 1 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleNext, className: "flex-1 py-4 rounded-full font-bold text-sm text-white flex items-center justify-center gap-2", style: {
          background: "linear-gradient(90deg, oklch(0.45 0.20 230), oklch(0.62 0.22 220))",
          boxShadow: "0 0 28px oklch(0.82 0.15 215 / 0.55)"
        }, children: [
          "Next Step",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-4" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleSubmit, disabled: submitting, className: "flex-1 py-4 rounded-full font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50", style: {
          background: "linear-gradient(90deg, oklch(0.45 0.20 230), oklch(0.62 0.22 220))",
          boxShadow: "0 0 28px oklch(0.82 0.15 215 / 0.55)"
        }, children: submitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" }),
          " Submitting…"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-4" }),
          " Submit Application"
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleSaveDraft, disabled: saving, className: "text-xs text-muted-foreground hover:text-foreground transition inline-flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "size-3" }),
        saving ? "Saving…" : "Save draft & come back later"
      ] }) })
    ] })
  ] });
}
export {
  CreatorApplication as component
};
