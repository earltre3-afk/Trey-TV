import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { b as useAuth$1, s as supabase } from "./router-BtgGywEC.mjs";
import { L as Logo } from "./Logo-D0JEzEf4.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { z as ChevronLeft, az as LoaderCircle, aG as Save, r as ChevronRight, k as Check, ai as Star, a_ as ExternalLink } from "../_libs/lucide-react.mjs";
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
  display_name: "",
  username: "",
  applying_as: "",
  profile_title: "",
  short_bio: "",
  why_gold_badge: "",
  notability_types: [],
  recognition_description: "",
  major_achievements: "",
  press_mentions: "",
  official_releases: "",
  monthly_listeners: "",
  social_followers: "",
  media_mentions: "",
  awards_count: "",
  link_website: "",
  link_instagram: "",
  link_tiktok: "",
  link_youtube: "",
  link_spotify: "",
  link_apple_music: "",
  link_imdb: "",
  link_linkedin: "",
  link_press_1: "",
  link_press_2: "",
  link_press_3: "",
  link_other: "",
  safety_confirmed: false,
  impersonation_notes: ""
};
const APPLYING_AS = ["Artist / Musician", "Actor / Actress", "Athlete / Sports Figure", "Public Brand / Business", "Content Creator", "Journalist / Media", "Community Leader", "Public Figure / Celebrity", "Other"];
const TITLES = ["Recording Artist", "Actor", "Professional Athlete", "Brand", "Content Creator", "Journalist", "Coach / Mentor", "Public Figure", "Director", "Producer", "Author", "Other"];
const NOTABILITY = [{
  id: "press",
  emoji: "📰",
  label: "Press\nCoverage"
}, {
  id: "music",
  emoji: "🎵",
  label: "Music\nReleases"
}, {
  id: "social",
  emoji: "👥",
  label: "Large Social\nFollowing"
}, {
  id: "brand",
  emoji: "💼",
  label: "Public Brand /\nBusiness"
}, {
  id: "verified",
  emoji: "✅",
  label: "Verified\nElsewhere"
}, {
  id: "community",
  emoji: "🤝",
  label: "Community\nImpact"
}, {
  id: "awards",
  emoji: "🏆",
  label: "Awards /\nRecognition"
}, {
  id: "imdb",
  emoji: "🎬",
  label: "IMDb / Film /\nTV Credits"
}, {
  id: "sports",
  emoji: "👕",
  label: "Sports / Team\nAffiliation"
}, {
  id: "other",
  emoji: "···",
  label: "Other"
}];
const LINK_ROWS = [{
  key: "link_website",
  emoji: "🌐",
  label: "Official Website"
}, {
  key: "link_instagram",
  emoji: "📸",
  label: "Instagram"
}, {
  key: "link_tiktok",
  emoji: "🎵",
  label: "TikTok"
}, {
  key: "link_youtube",
  emoji: "▶️",
  label: "YouTube"
}, {
  key: "link_spotify",
  emoji: "🎧",
  label: "Spotify"
}, {
  key: "link_apple_music",
  emoji: "🎼",
  label: "Apple Music"
}, {
  key: "link_imdb",
  emoji: "🎬",
  label: "IMDb"
}, {
  key: "link_linkedin",
  emoji: "💼",
  label: "LinkedIn"
}, {
  key: "link_press_1",
  emoji: "📄",
  label: "Press Article 1"
}, {
  key: "link_press_2",
  emoji: "📄",
  label: "Press Article 2"
}, {
  key: "link_press_3",
  emoji: "📄",
  label: "Press Article 3"
}, {
  key: "link_other",
  emoji: "🔗",
  label: "Other Proof Link"
}];
const SAFETY_ITEMS = ["I am the person, brand, or authorized representative for this account.", "I understand gold verification is for notability or official identity, not popularity alone.", "I understand Trey TV can deny or remove verification for impersonation, false information, or policy violations.", "I understand verification does not guarantee promotion, payment, creator approval, or special ranking.", "I understand Trey TV may request more information before making a decision."];
const STEPS = [{
  label: "Badge\nIdentity",
  short: "1"
}, {
  label: "Notability\nProof",
  short: "2"
}, {
  label: "Official\nLinks",
  short: "3"
}, {
  label: "Safety\nCheck",
  short: "4"
}, {
  label: "Review &\nSubmit",
  short: "5"
}];
const G = {
  gold: "oklch(0.82 0.16 85)",
  goldDim: "oklch(0.82 0.16 85 / 0.35)",
  blue: "oklch(0.82 0.15 215)",
  blueDim: "oklch(0.82 0.15 215 / 0.4)"
};
function GInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text"
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-semibold uppercase tracking-widest text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type, value, placeholder, onChange: (e) => onChange(e.target.value), className: "w-full px-3.5 py-2.5 rounded-xl text-sm bg-black/25 border placeholder:text-white/20 focus:outline-none focus:border-[oklch(0.82_0.16_85_/_0.85)] transition shadow-[inset_0_0_16px_oklch(0.82_0.16_85_/_0.08)]", style: {
      borderColor: G.goldDim
    } })
  ] });
}
function GSelect({
  label,
  value,
  onChange,
  options,
  placeholder
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-semibold uppercase tracking-widest text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value, onChange: (e) => onChange(e.target.value), className: "w-full appearance-none px-3.5 py-2.5 pr-8 rounded-xl text-sm bg-black/25 border focus:outline-none focus:border-[oklch(0.82_0.16_85_/_0.85)] transition text-foreground shadow-[inset_0_0_16px_oklch(0.82_0.16_85_/_0.08)]", style: {
        borderColor: G.goldDim
      }, children: [
        placeholder && /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", className: "bg-[#020508]", children: placeholder }),
        options.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: o, className: "bg-[#020508]", children: o }, o))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground rotate-90 pointer-events-none" })
    ] })
  ] });
}
function GTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  hint
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
    label && /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-semibold uppercase tracking-widest text-muted-foreground", children: label }),
    hint && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-white/35", children: hint }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value, rows, placeholder, onChange: (e) => onChange(e.target.value), className: "w-full px-3.5 py-2.5 rounded-xl text-sm bg-black/25 border placeholder:text-white/20 focus:outline-none focus:border-[oklch(0.82_0.16_85_/_0.85)] transition resize-none shadow-[inset_0_0_16px_oklch(0.82_0.16_85_/_0.08)]", style: {
      borderColor: G.goldDim
    } })
  ] });
}
function StepBar({
  current
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center", children: STEPS.map((s, i) => {
      const done = i < current;
      const active = i === current;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative shrink-0 size-9 rounded-full grid place-items-center text-sm font-bold border-2 transition-all duration-300", style: {
          background: done ? G.blue : active ? "oklch(0.82 0.16 85 / 0.2)" : "oklch(1 0 0 / 0.05)",
          borderColor: done ? G.blue : active ? G.gold : "oklch(1 0 0 / 0.15)",
          boxShadow: active ? `0 0 18px ${G.gold}` : "none",
          color: done ? "#fff" : active ? G.gold : "oklch(0.5 0 0)"
        }, children: done ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-4" }) : s.short }),
        i < STEPS.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px mx-1", style: {
          background: done ? G.blue : "oklch(1 0 0 / 0.1)"
        } })
      ] }, i);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex mt-2", children: STEPS.map((s, i) => {
      const active = i === current;
      const done = i < current;
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] leading-tight whitespace-pre-line font-semibold", style: {
        color: active ? G.gold : done ? G.blue : "oklch(0.45 0 0)"
      }, children: s.label }) }, i);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-xs font-bold mt-1.5", style: {
      color: G.gold
    }, children: [
      "Step ",
      current + 1,
      " of ",
      STEPS.length
    ] })
  ] });
}
function SectionCard({
  emoji,
  title,
  sub,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "apply-shell-panel rounded-[28px] p-5 space-y-5", style: {
    "--apply-panel-edge": "oklch(0.82 0.16 85 / 0.72)",
    "--apply-panel-glow": "oklch(0.82 0.16 85 / 0.18)",
    "--apply-panel-shadow": "oklch(0.82 0.16 85 / 0.75)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-11 rounded-2xl grid place-items-center text-xl shrink-0", style: {
        background: "oklch(0.82 0.16 85 / 0.12)",
        border: `1px solid ${G.goldDim}`
      }, children: emoji }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-extrabold", children: title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: sub })
      ] })
    ] }),
    children
  ] });
}
function Step1({
  d,
  set,
  avatar
}) {
  const showPreview = !!(d.display_name || d.profile_title);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionCard, { emoji: "🛡️", title: "Badge Identity", sub: "Tell us who you are.", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(GInput, { label: "Display name to verify", value: d.display_name, onChange: (v) => set("display_name", v), placeholder: "Your public name" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(GInput, { label: "Username", value: d.username, onChange: (v) => set("username", v.startsWith("@") ? v : v ? "@" + v : ""), placeholder: "@yourhandle" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(GSelect, { label: "What are you applying as?", value: d.applying_as, onChange: (v) => set("applying_as", v), options: APPLYING_AS, placeholder: "Select category…" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(GSelect, { label: "What title should appear near your profile?", value: d.profile_title, onChange: (v) => set("profile_title", v), options: TITLES, placeholder: "Select title…" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(GTextarea, { label: "Short public bio", value: d.short_bio, onChange: (v) => set("short_bio", v), placeholder: "Brief description of who you are and what you do.", rows: 3 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(GTextarea, { label: "Why should this profile receive a gold badge?", value: d.why_gold_badge, onChange: (v) => set("why_gold_badge", v), placeholder: "Describe your notability, achievements, and public recognition.", rows: 3 })
    ] }),
    showPreview && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl p-4 text-center space-y-3 mt-2", style: {
      background: "oklch(0.10 0.04 85 / 0.8)",
      border: `1px solid ${G.gold}`,
      boxShadow: `0 0 30px oklch(0.82 0.16 85 / 0.35)`
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold tracking-[0.2em] uppercase", style: {
        color: G.gold
      }, children: "Gold Badge Preview" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-16 rounded-full overflow-hidden border-[3px]", style: {
          borderColor: G.gold,
          boxShadow: `0 0 20px ${G.gold}`
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: avatar, alt: "", className: "size-full object-cover" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-1 -right-1 size-6 rounded-full grid place-items-center border-2 border-[#020508]", style: {
          background: G.gold
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3.5 text-black", strokeWidth: 3 }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-extrabold", children: d.display_name || "Your Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: d.username || "@handle" }),
        d.profile_title && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs mt-0.5", style: {
          color: G.gold
        }, children: d.profile_title })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border", style: {
        color: G.gold,
        borderColor: G.goldDim,
        background: "oklch(0.82 0.16 85 / 0.1)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "size-3", fill: "currentColor" }),
        " Notable Account"
      ] })
    ] })
  ] });
}
function Step2({
  d,
  set,
  toggle
}) {
  const fields = [{
    emoji: "✏️",
    label: "Describe your public recognition (3–6 sentences)",
    hint: "Share how you're recognized in your field and why it matters.",
    key: "recognition_description",
    rows: 4
  }, {
    emoji: "⭐",
    label: "Any major achievements?",
    hint: "List key milestones, accomplishments, or standout moments.",
    key: "major_achievements",
    rows: 2
  }, {
    emoji: "📰",
    label: "Any press mentions?",
    hint: "Include articles, interviews, or media features.",
    key: "press_mentions",
    rows: 2
  }, {
    emoji: "▶️",
    label: "Any official releases / projects?",
    hint: "Share links or details about your releases or productions.",
    key: "official_releases",
    rows: 2
  }];
  const stats = [{
    emoji: "🎧",
    label: "Monthly Listeners",
    key: "monthly_listeners"
  }, {
    emoji: "👥",
    label: "Social Followers",
    key: "social_followers"
  }, {
    emoji: "📰",
    label: "Media Mentions",
    key: "media_mentions"
  }, {
    emoji: "🏆",
    label: "Awards",
    key: "awards_count"
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionCard, { emoji: "🛡️", title: "Notability Proof", sub: "Tell us about your public recognition.", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-5 gap-2", children: NOTABILITY.map((n) => {
      const active = d.notability_types.includes(n.id);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => toggle(n.id), className: "flex flex-col items-center gap-1.5 p-2 rounded-2xl border text-center transition-all", style: {
        background: active ? "oklch(0.82 0.16 85 / 0.18)" : "oklch(0.08 0.02 85 / 0.6)",
        borderColor: active ? G.gold : G.goldDim,
        boxShadow: active ? `0 0 12px oklch(0.82 0.16 85 / 0.4)` : "none"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl leading-none", children: n.emoji }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[8px] leading-tight text-center whitespace-pre-line font-semibold text-muted-foreground", children: n.label })
      ] }, n.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: fields.map(({
      emoji,
      label,
      hint,
      key,
      rows
    }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl p-3 space-y-2", style: {
      background: "oklch(0.07 0.02 85 / 0.7)",
      border: `1px solid ${G.goldDim}`
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base shrink-0 mt-0.5", children: emoji }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold", children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: hint })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: d[key], onChange: (e) => set(key, e.target.value), rows, placeholder: "Type your answer here…", className: "w-full bg-transparent text-sm placeholder:text-white/20 focus:outline-none resize-none" })
    ] }, String(key))) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl p-4", style: {
      background: "oklch(0.82 0.16 85 / 0.07)",
      border: `1px solid ${G.goldDim}`
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold tracking-wide", style: {
          color: G.gold
        }, children: "Recognition Summary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-4 rounded-full grid place-items-center text-[8px] font-bold border", style: {
          color: G.gold,
          borderColor: G.goldDim
        }, children: "i" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: stats.map(({
        emoji,
        label,
        key
      }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl", children: emoji }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: d[key], onChange: (e) => set(key, e.target.value), placeholder: "0", className: "w-full text-center text-base font-extrabold bg-transparent focus:outline-none placeholder:text-white/20", style: {
          color: G.gold
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: label })
      ] }, String(key))) })
    ] })
  ] });
}
function Step3({
  d,
  set
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SectionCard, { emoji: "🔗", title: "Official Links", sub: "Add links that confirm your identity and notability.", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: LINK_ROWS.map(({
    key,
    emoji,
    label
  }) => {
    const val = d[key];
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-4 py-3 rounded-2xl border transition", style: {
      background: "oklch(0.07 0.02 85 / 0.7)",
      borderColor: val ? G.gold : G.goldDim
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base w-6 text-center shrink-0", children: emoji }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: val, onChange: (e) => set(key, e.target.value), placeholder: label, type: "url", className: "flex-1 text-sm bg-transparent focus:outline-none placeholder:text-white/30 min-w-0" }),
      val ? /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: val, target: "_blank", rel: "noopener noreferrer", className: "shrink-0 text-muted-foreground hover:text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "size-3.5" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "size-3.5 text-white/20 shrink-0" })
    ] }, String(key));
  }) }) });
}
function Step4({
  d,
  set
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionCard, { emoji: "🛡️", title: "Safety Check", sub: "Please confirm the following.", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl overflow-hidden divide-y", style: {
      border: `1px solid ${G.goldDim}`,
      borderColor: G.goldDim
    }, children: SAFETY_ITEMS.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 px-4 py-3.5", style: {
      background: "oklch(0.07 0.02 85 / 0.7)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-6 rounded-full border-2 grid place-items-center shrink-0 mt-0.5", style: {
        borderColor: G.gold,
        background: "oklch(0.82 0.16 85 / 0.15)",
        boxShadow: `0 0 8px ${G.gold}`
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3.5", strokeWidth: 3, style: {
        color: G.gold
      } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground leading-relaxed", children: item })
    ] }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl p-4 space-y-3", style: {
      background: "oklch(0.07 0.02 85 / 0.7)",
      border: `1px solid ${G.blueDim}`
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-6 rounded-full grid place-items-center text-xs font-bold shrink-0 mt-0.5 border", style: {
          color: G.blue,
          borderColor: G.blueDim,
          background: "oklch(0.82 0.15 215 / 0.1)"
        }, children: "?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold", children: [
            "Is there any impersonation risk or confusion we should know about? ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal", children: "(Optional)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-0.5", children: "For example: similar account names, logos, or brands that might be confused with your channel." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: d.impersonation_notes, onChange: (e) => set("impersonation_notes", e.target.value), rows: 3, placeholder: "Type your answer here…", className: "w-full px-3.5 py-2.5 rounded-xl bg-white/5 border text-sm placeholder:text-white/20 focus:outline-none transition resize-none", style: {
        borderColor: G.blueDim
      } })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => set("safety_confirmed", !d.safety_confirmed), className: "w-full flex items-center gap-3 p-4 rounded-2xl border transition-all", style: {
      background: d.safety_confirmed ? "oklch(0.82 0.16 85 / 0.12)" : "oklch(0.07 0.02 85 / 0.7)",
      borderColor: d.safety_confirmed ? G.gold : G.goldDim,
      boxShadow: d.safety_confirmed ? `0 0 20px oklch(0.82 0.16 85 / 0.25)` : "none"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-6 rounded-lg border-2 grid place-items-center shrink-0 transition-all", style: {
        borderColor: d.safety_confirmed ? G.gold : "oklch(0.4 0 0)",
        background: d.safety_confirmed ? G.gold : "transparent"
      }, children: d.safety_confirmed && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3.5 text-black", strokeWidth: 3 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: "I confirm all the above statements" })
    ] })
  ] });
}
function Step5({
  d,
  goTo,
  agreed,
  setAgreed
}) {
  const linksCount = LINK_ROWS.filter(({
    key
  }) => d[key]).length;
  const sections = [{
    emoji: "🛡️",
    title: "Badge Identity",
    sub: "Your official identity details",
    step: 0
  }, {
    emoji: "⭐",
    title: "Notability Proof",
    sub: "Proof of your notability",
    step: 1
  }, {
    emoji: "🔗",
    title: "Official Links",
    sub: "Links to your official presence",
    step: 2
  }, {
    emoji: "✅",
    title: "Safety Check",
    sub: "Confirm your account safety",
    step: 3
  }];
  const summary = [d.display_name && {
    emoji: "👤",
    text: d.display_name
  }, d.profile_title && {
    emoji: "🎙️",
    text: d.profile_title
  }, ...d.notability_types.slice(0, 3).map((id) => {
    const n = NOTABILITY.find((x) => x.id === id);
    return n ? {
      emoji: n.emoji,
      text: n.label.replace(/\n/g, " ")
    } : null;
  }), linksCount > 0 && {
    emoji: "🔗",
    text: `${linksCount} link${linksCount !== 1 ? "s" : ""} added`
  }, d.safety_confirmed && {
    emoji: "✅",
    text: "All confirmations accepted"
  }].filter(Boolean);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-extrabold", children: "Review & Submit" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: "Review your request before submitting." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-5 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-3 space-y-2", children: sections.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 p-3 rounded-2xl border", style: {
        background: "oklch(0.10 0.05 215 / 0.5)",
        borderColor: G.blueDim
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-9 rounded-xl grid place-items-center text-base shrink-0", style: {
          background: "oklch(0.82 0.15 215 / 0.15)",
          border: `1px solid ${G.blueDim}`
        }, children: s.emoji }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold truncate", children: s.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-muted-foreground truncate", children: s.sub })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => goTo(s.step), className: "shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition", style: {
          color: G.blue,
          borderColor: G.blueDim,
          background: "oklch(0.82 0.15 215 / 0.1)"
        }, children: "✏️ Edit" })
      ] }, s.step)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 rounded-2xl p-3 space-y-2", style: {
        background: "oklch(0.82 0.16 85 / 0.07)",
        border: `1px solid ${G.gold}`,
        boxShadow: `0 0 24px oklch(0.82 0.16 85 / 0.2)`
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold tracking-wide", style: {
          color: G.gold
        }, children: "Application Summary" }),
        summary.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs shrink-0", children: s.emoji }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground leading-snug", children: s.text })
        ] }, i))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl p-4 space-y-3", style: {
      background: "oklch(0.09 0.04 85 / 0.9)",
      border: `1px solid ${G.goldDim}`
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-12 rounded-2xl grid place-items-center text-2xl shrink-0", style: {
          background: "oklch(0.82 0.16 85 / 0.15)",
          border: `1px solid ${G.goldDim}`
        }, children: "🛡️" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground leading-relaxed", children: [
          "By submitting, you confirm that all information provided is accurate and you agree to the",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", style: {
            color: G.gold
          }, children: "Trey TV Community Guidelines." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setAgreed(!agreed), className: "flex items-center gap-2.5 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-5 rounded-full border-2 grid place-items-center shrink-0 transition-all", style: {
          borderColor: agreed ? G.gold : "oklch(0.4 0 0)",
          background: agreed ? G.gold : "transparent"
        }, children: agreed && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3 text-black", strokeWidth: 3 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: agreed ? "font-medium" : "text-muted-foreground", style: agreed ? {
          color: G.gold
        } : {}, children: "I agree to the community guidelines" })
      ] })
    ] })
  ] });
}
const TIMELINE = [{
  label: "Submitted",
  emoji: "📄"
}, {
  label: "Under Review",
  emoji: "🔍"
}, {
  label: "More Info\nNeeded",
  emoji: "ℹ️"
}, {
  label: "Approved",
  emoji: "🛡️"
}, {
  label: "Denied",
  emoji: "✗"
}];
function VerificationSubmitted() {
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex flex-col items-center px-5 pb-10", style: {
    background: "radial-gradient(ellipse 100% 50% at 50% 0%, oklch(0.22 0.09 85 / 0.6) 0%, #020508 55%)"
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm flex flex-col items-center pt-12 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "h-14 drop-shadow-[0_0_24px_oklch(0.82_0.16_85_/_0.8)]" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-44 rounded-full grid place-items-center", style: {
        background: "radial-gradient(circle, oklch(0.82 0.16 85 / 0.2) 0%, transparent 70%)"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-32 rounded-[2.5rem] grid place-items-center text-7xl", style: {
        background: "linear-gradient(145deg, oklch(0.78 0.22 78), oklch(0.62 0.20 68), oklch(0.50 0.18 62))",
        border: "2px solid oklch(0.85 0.20 82 / 0.8)",
        boxShadow: `0 0 80px oklch(0.82 0.16 85 / 0.9), 0 0 160px oklch(0.82 0.16 85 / 0.4), inset 0 2px 0 oklch(1 0 0 / 0.3)`
      }, children: "🛡️" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute bottom-5 right-4 text-2xl", children: "✨" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl font-extrabold leading-tight", children: [
        "Your",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
          color: G.gold
        }, children: "Gold Verification" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "Request Is In!"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "We received your request.",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "You can track the status from your profile."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate({
        to: "/applications"
      }), className: "w-full py-4 rounded-full font-bold text-sm flex items-center justify-between px-6 text-black", style: {
        background: `linear-gradient(90deg, oklch(0.65 0.20 72), oklch(0.80 0.22 82))`,
        boxShadow: `0 0 40px oklch(0.82 0.16 85 / 0.7)`
      }, children: [
        "View Verification Status ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-5" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate({
        to: "/"
      }), className: "w-full py-4 rounded-full font-semibold text-sm flex items-center justify-between px-6", style: {
        background: "oklch(0.15 0.06 215 / 0.7)",
        border: `1px solid ${G.blueDim}`
      }, children: [
        "Back to Trey TV ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-5" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full rounded-3xl p-4", style: {
      background: "oklch(0.10 0.03 0 / 0.8)",
      border: "1px solid oklch(1 0 0 / 0.08)"
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start", children: TIMELINE.map((s, i) => {
      const isFirst = i === 0;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-10 rounded-full border-2 grid place-items-center", style: {
            borderColor: isFirst ? G.gold : "oklch(1 0 0 / 0.15)",
            background: isFirst ? "oklch(0.82 0.16 85 / 0.2)" : "oklch(1 0 0 / 0.05)",
            boxShadow: isFirst ? `0 0 14px ${G.gold}` : "none"
          }, children: isFirst ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-4", style: {
            color: G.gold
          } }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: s.emoji }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] text-center mt-1.5 leading-tight whitespace-pre-line font-semibold", style: {
            color: isFirst ? G.gold : "oklch(0.4 0 0)"
          }, children: s.label })
        ] }),
        i < TIMELINE.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px w-3 mt-5 shrink-0", style: {
          background: "oklch(1 0 0 / 0.1)"
        } })
      ] }, s.label);
    }) }) })
  ] }) });
}
function ExistingVerificationState({
  app
}) {
  const navigate = useNavigate();
  const statusCopy = {
    pending: {
      title: "Your Gold Verification Request Is Under Review",
      body: "We already have your verification request in the review queue. Track the latest status from your applications page."
    },
    approved: {
      title: "Your Gold Verification Is Approved",
      body: "Your profile has already been approved for gold verification."
    },
    rejected: {
      title: "Verification Decision Posted",
      body: "Your verification request has a review decision. Check your applications page for review notes."
    },
    revoked: {
      title: "Verification Needs Review",
      body: "Your verification status needs admin review before a new request can be submitted."
    }
  };
  const copy = statusCopy[app.status] ?? statusCopy.pending;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center px-5", style: {
    background: "radial-gradient(ellipse 100% 50% at 50% 0%, oklch(0.22 0.09 85 / 0.6) 0%, #020508 55%)"
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md rounded-3xl p-6 text-center", style: {
    background: "oklch(0.09 0.03 85 / 0.9)",
    border: `1px solid ${G.goldDim}`,
    boxShadow: `0 0 60px oklch(0.82 0.16 85 / 0.25)`
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "h-12 mx-auto drop-shadow-[0_0_24px_oklch(0.82_0.16_85_/_0.8)]" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mt-6 size-20 rounded-[1.75rem] grid place-items-center text-4xl", style: {
      background: "linear-gradient(145deg, oklch(0.78 0.22 78), oklch(0.62 0.20 68))",
      border: "2px solid oklch(0.85 0.20 82 / 0.8)",
      boxShadow: `0 0 50px oklch(0.82 0.16 85 / 0.75)`
    }, children: "🛡️" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-6 text-2xl font-extrabold leading-tight", children: copy.title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground leading-relaxed", children: copy.body }),
    app.review_notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-muted-foreground italic", children: [
      '"',
      app.review_notes,
      '"'
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate({
        to: "/applications"
      }), className: "w-full py-4 rounded-full font-bold text-sm text-black", style: {
        background: `linear-gradient(90deg, oklch(0.65 0.20 72), oklch(0.80 0.22 82))`,
        boxShadow: `0 0 34px oklch(0.82 0.16 85 / 0.55)`
      }, children: "View Verification Status" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate({
        to: "/"
      }), className: "w-full py-4 rounded-full font-semibold text-sm", style: {
        background: "oklch(0.15 0.06 215 / 0.7)",
        border: `1px solid ${G.blueDim}`
      }, children: "Back to Trey TV" })
    ] })
  ] }) });
}
function validate(step, d) {
  if (step === 0) {
    if (!d.display_name.trim()) return "Display name is required.";
    if (!d.username.trim()) return "Username is required.";
    if (!d.applying_as) return "Please select what you're applying as.";
    if (!d.why_gold_badge.trim()) return "Please tell us why this profile should receive a gold badge.";
  }
  if (step === 1) {
    if (d.notability_types.length === 0) return "Select at least one notability type.";
    if (!d.recognition_description.trim()) return "Please describe your public recognition.";
  }
  if (step === 3) {
    if (!d.safety_confirmed) return "You must confirm all safety statements.";
  }
  return null;
}
function GoldVerificationApplication() {
  const {
    isGuest,
    user
  } = useAuth$1();
  const navigate = useNavigate();
  const [step, setStep] = reactExports.useState(0);
  const [data, setData] = reactExports.useState(EMPTY);
  const [agreed, setAgreed] = reactExports.useState(false);
  const [saving, setSaving] = reactExports.useState(false);
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [submitted, setSubmitted] = reactExports.useState(false);
  const [appId, setAppId] = reactExports.useState(null);
  const [existingApp, setExistingApp] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (isGuest) {
      try {
        sessionStorage.setItem("treytv_post_auth_redirect", "/apply/verification");
      } catch {
      }
      navigate({
        to: "/login"
      });
    }
  }, [isGuest, navigate]);
  reactExports.useEffect(() => {
    if (!user) return;
    setData((p) => ({
      ...p,
      display_name: p.display_name || user.name || "",
      username: p.username || (user.handle ? `@${user.handle}` : "")
    }));
  }, [user?.uid]);
  reactExports.useEffect(() => {
    if (!user) return;
    let dead = false;
    void (async () => {
      try {
        const {
          data: auth
        } = await supabase.auth.getUser();
        const authUserId = auth.user?.id;
        if (!authUserId) return;
        const {
          data: row
        } = await supabase.from("creator_applications").select("id, status, review_notes, verification_data").eq("application_type", "verification").eq("user_id", authUserId).limit(1).maybeSingle();
        if (dead || !row) return;
        if (!["draft", "needs_more_info"].includes(row.status)) {
          setExistingApp({
            id: row.id,
            status: row.status,
            review_notes: row.review_notes
          });
          return;
        }
        setAppId(row.id);
        if (row.verification_data) setData((p) => ({
          ...p,
          ...row.verification_data
        }));
      } catch {
      }
    })();
    return () => {
      dead = true;
    };
  }, [user?.uid]);
  const set = reactExports.useCallback((k, v) => {
    setData((p) => ({
      ...p,
      [k]: v
    }));
  }, []);
  const toggle = reactExports.useCallback((id) => {
    setData((p) => ({
      ...p,
      notability_types: p.notability_types.includes(id) ? p.notability_types.filter((x) => x !== id) : [...p.notability_types, id]
    }));
  }, []);
  const upsert = async (status) => {
    const {
      data: auth
    } = await supabase.auth.getUser();
    const authUserId = auth.user?.id;
    if (!authUserId) throw new Error("Please sign in before submitting a verification request.");
    const payload = {
      user_id: authUserId,
      application_type: "verification",
      status,
      verification_data: data,
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
    setSaving(true);
    try {
      await upsert("draft");
      toast.success("Draft saved!");
    } catch (e) {
      toast.error(e?.message ?? "Failed to save draft.");
    } finally {
      setSaving(false);
    }
  };
  const handleNext = () => {
    const err = validate(step, data);
    if (err) {
      toast.error(err);
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
  const handleSubmit = async () => {
    if (!agreed) {
      toast.error("Please agree to the community guidelines.");
      return;
    }
    setSubmitting(true);
    try {
      await upsert("pending");
      setSubmitted(true);
    } catch (e) {
      toast.error(e?.message ?? "Failed to submit.");
    } finally {
      setSubmitting(false);
    }
  };
  if (isGuest) return null;
  if (submitted) return /* @__PURE__ */ jsxRuntimeExports.jsx(VerificationSubmitted, {});
  if (existingApp) return /* @__PURE__ */ jsxRuntimeExports.jsx(ExistingVerificationState, { app: existingApp });
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
      /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "absolute left-1/2 top-3 h-14 sm:h-20 -translate-x-1/2 drop-shadow-[0_0_30px_oklch(0.82_0.16_85_/_0.85)]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleDraft, disabled: saving, className: "apply-pill-button flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-50", children: [
        saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin text-[oklch(0.82_0.16_85)]" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "size-4 text-[oklch(0.82_0.16_85)]" }),
        "Save Draft"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 px-5 pb-3 pt-14 sm:pt-20 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-4xl font-extrabold tracking-normal sm:text-5xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-transparent bg-clip-text bg-gradient-to-r from-[oklch(0.98_0.12_95)] via-[oklch(0.82_0.16_85)] to-white drop-shadow-[0_0_24px_oklch(0.82_0.16_85_/_0.7)]", children: "Gold Verification" }),
      " Request"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto w-full max-w-5xl shrink-0 px-5 pb-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StepBar, { current: step }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 px-4 pb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "animate-rise mx-auto w-full max-w-5xl", children: [
      step === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Step1, { d: data, set: (k, v) => set(k, v), avatar: user?.avatar ?? "" }),
      step === 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Step2, { d: data, set: (k, v) => set(k, v), toggle }),
      step === 2 && /* @__PURE__ */ jsxRuntimeExports.jsx(Step3, { d: data, set: (k, v) => set(k, v) }),
      step === 3 && /* @__PURE__ */ jsxRuntimeExports.jsx(Step4, { d: data, set: (k, v) => set(k, v) }),
      step === 4 && /* @__PURE__ */ jsxRuntimeExports.jsx(Step5, { d: data, goTo: setStep, agreed, setAgreed })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),1rem)]", style: {
      background: "linear-gradient(180deg, transparent, oklch(0.02 0.01 240 / 0.92))"
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-5xl gap-4", children: [
      step > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleBack, className: "flex-1 py-4 rounded-full font-bold text-sm flex items-center justify-center gap-2", style: {
        background: "oklch(0.15 0.06 215 / 0.7)",
        border: `1px solid ${G.blueDim}`
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "size-4" }),
        " Back"
      ] }),
      step < STEPS.length - 1 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleNext, className: "flex-1 py-4 rounded-full font-bold text-sm text-black flex items-center justify-center gap-2", style: {
        background: `linear-gradient(90deg, oklch(0.65 0.20 72), oklch(0.80 0.22 82))`,
        boxShadow: `0 0 28px oklch(0.82 0.16 85 / 0.55)`
      }, children: [
        "Next Step ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-4" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleSubmit, disabled: submitting || !agreed, className: "flex-1 py-4 rounded-full font-bold text-sm text-black flex items-center justify-center gap-2 disabled:opacity-50", style: {
        background: `linear-gradient(90deg, oklch(0.65 0.20 72), oklch(0.80 0.22 82))`,
        boxShadow: `0 0 28px oklch(0.82 0.16 85 / 0.55)`
      }, children: [
        submitting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin text-black" }) : "🛡️",
        submitting ? "Submitting…" : "Submit Verification Request",
        !submitting && /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-4" })
      ] })
    ] }) })
  ] });
}
export {
  GoldVerificationApplication as component
};
