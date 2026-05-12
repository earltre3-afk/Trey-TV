import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import {
  Check, ChevronLeft, ChevronRight,
  ExternalLink, Loader2, Save, Star,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/brand/Logo";

export const Route = createFileRoute("/apply/verification")({
  component: GoldVerificationApplication,
  head: () => ({ meta: [{ title: "Gold Verification — Trey TV" }] }),
});

// ── Types ─────────────────────────────────────────────────────────────────────

type VerifData = {
  display_name: string; username: string; applying_as: string;
  profile_title: string; short_bio: string; why_gold_badge: string;
  notability_types: string[];
  recognition_description: string; major_achievements: string;
  press_mentions: string; official_releases: string;
  monthly_listeners: string; social_followers: string;
  media_mentions: string; awards_count: string;
  link_website: string; link_instagram: string; link_tiktok: string;
  link_youtube: string; link_spotify: string; link_apple_music: string;
  link_imdb: string; link_linkedin: string;
  link_press_1: string; link_press_2: string; link_press_3: string;
  link_other: string;
  safety_confirmed: boolean; impersonation_notes: string;
};

const EMPTY: VerifData = {
  display_name: "", username: "", applying_as: "", profile_title: "",
  short_bio: "", why_gold_badge: "",
  notability_types: [],
  recognition_description: "", major_achievements: "", press_mentions: "",
  official_releases: "", monthly_listeners: "", social_followers: "",
  media_mentions: "", awards_count: "",
  link_website: "", link_instagram: "", link_tiktok: "", link_youtube: "",
  link_spotify: "", link_apple_music: "", link_imdb: "", link_linkedin: "",
  link_press_1: "", link_press_2: "", link_press_3: "", link_other: "",
  safety_confirmed: false, impersonation_notes: "",
};

const APPLYING_AS = [
  "Artist / Musician", "Actor / Actress", "Athlete / Sports Figure",
  "Public Brand / Business", "Content Creator", "Journalist / Media",
  "Community Leader", "Public Figure / Celebrity", "Other",
];
const TITLES = [
  "Recording Artist", "Actor", "Professional Athlete", "Brand",
  "Content Creator", "Journalist", "Coach / Mentor", "Public Figure",
  "Director", "Producer", "Author", "Other",
];

const NOTABILITY = [
  { id: "press",     emoji: "📰", label: "Press\nCoverage" },
  { id: "music",     emoji: "🎵", label: "Music\nReleases" },
  { id: "social",    emoji: "👥", label: "Large Social\nFollowing" },
  { id: "brand",     emoji: "💼", label: "Public Brand /\nBusiness" },
  { id: "verified",  emoji: "✅", label: "Verified\nElsewhere" },
  { id: "community", emoji: "🤝", label: "Community\nImpact" },
  { id: "awards",    emoji: "🏆", label: "Awards /\nRecognition" },
  { id: "imdb",      emoji: "🎬", label: "IMDb / Film /\nTV Credits" },
  { id: "sports",    emoji: "👕", label: "Sports / Team\nAffiliation" },
  { id: "other",     emoji: "···", label: "Other" },
];

const LINK_ROWS: { key: keyof VerifData; emoji: string; label: string }[] = [
  { key: "link_website",     emoji: "🌐", label: "Official Website" },
  { key: "link_instagram",   emoji: "📸", label: "Instagram" },
  { key: "link_tiktok",      emoji: "🎵", label: "TikTok" },
  { key: "link_youtube",     emoji: "▶️",  label: "YouTube" },
  { key: "link_spotify",     emoji: "🎧", label: "Spotify" },
  { key: "link_apple_music", emoji: "🎼", label: "Apple Music" },
  { key: "link_imdb",        emoji: "🎬", label: "IMDb" },
  { key: "link_linkedin",    emoji: "💼", label: "LinkedIn" },
  { key: "link_press_1",     emoji: "📄", label: "Press Article 1" },
  { key: "link_press_2",     emoji: "📄", label: "Press Article 2" },
  { key: "link_press_3",     emoji: "📄", label: "Press Article 3" },
  { key: "link_other",       emoji: "🔗", label: "Other Proof Link" },
];

const SAFETY_ITEMS = [
  "I am the person, brand, or authorized representative for this account.",
  "I understand gold verification is for notability or official identity, not popularity alone.",
  "I understand Trey TV can deny or remove verification for impersonation, false information, or policy violations.",
  "I understand verification does not guarantee promotion, payment, creator approval, or special ranking.",
  "I understand Trey TV may request more information before making a decision.",
];

// Step labels matching the reference screenshots
const STEPS = [
  { label: "Badge\nIdentity",     short: "1" },
  { label: "Notability\nProof",   short: "2" },
  { label: "Official\nLinks",     short: "3" },
  { label: "Safety\nCheck",       short: "4" },
  { label: "Review &\nSubmit",    short: "5" },
];

// ── Shared primitives ─────────────────────────────────────────────────────────

const G = {
  gold:   "oklch(0.82 0.16 85)",
  goldDim: "oklch(0.82 0.16 85 / 0.35)",
  blue:   "oklch(0.82 0.15 215)",
  blueDim: "oklch(0.82 0.15 215 / 0.4)",
};

function GInput({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/5 border placeholder:text-white/20 focus:outline-none focus:border-[oklch(0.82_0.16_85_/_0.7)] transition"
        style={{ borderColor: G.goldDim }}
      />
    </div>
  );
}

function GSelect({ label, value, onChange, options, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</label>
      <div className="relative">
        <select
          value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none px-3.5 py-2.5 pr-8 rounded-xl text-sm bg-white/5 border focus:outline-none focus:border-[oklch(0.82_0.16_85_/_0.7)] transition text-foreground"
          style={{ borderColor: G.goldDim }}
        >
          {placeholder && <option value="" className="bg-[#020508]">{placeholder}</option>}
          {options.map((o) => <option key={o} value={o} className="bg-[#020508]">{o}</option>)}
        </select>
        <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground rotate-90 pointer-events-none" />
      </div>
    </div>
  );
}

function GTextarea({ label, value, onChange, placeholder, rows = 3, hint }: {
  label?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number; hint?: string;
}) {
  return (
    <div className="space-y-1">
      {label && <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</label>}
      {hint && <p className="text-[10px] text-white/35">{hint}</p>}
      <textarea
        value={value} rows={rows} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/5 border placeholder:text-white/20 focus:outline-none focus:border-[oklch(0.82_0.16_85_/_0.7)] transition resize-none"
        style={{ borderColor: G.goldDim }}
      />
    </div>
  );
}

// ── Step progress bar (matches the reference screenshots) ──────────────────────

function StepBar({ current }: { current: number }) {
  return (
    <div className="px-1">
      {/* Circles + connectors */}
      <div className="flex items-center">
        {STEPS.map((s, i) => {
          const done   = i < current;
          const active = i === current;
          return (
            <div key={i} className="flex items-center flex-1">
              <div
                className="relative shrink-0 size-9 rounded-full grid place-items-center text-sm font-bold border-2 transition-all duration-300"
                style={{
                  background: done   ? G.blue :
                              active ? "oklch(0.82 0.16 85 / 0.2)" : "oklch(1 0 0 / 0.05)",
                  borderColor: done   ? G.blue :
                               active ? G.gold : "oklch(1 0 0 / 0.15)",
                  boxShadow: active ? `0 0 18px ${G.gold}` : "none",
                  color: done ? "#fff" : active ? G.gold : "oklch(0.5 0 0)",
                }}
              >
                {done ? <Check className="size-4" /> : s.short}
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px mx-1" style={{ background: done ? G.blue : "oklch(1 0 0 / 0.1)" }} />
              )}
            </div>
          );
        })}
      </div>
      {/* Labels below */}
      <div className="flex mt-2">
        {STEPS.map((s, i) => {
          const active = i === current;
          const done   = i < current;
          return (
            <div key={i} className="flex-1 text-center">
              <span
                className="text-[9px] leading-tight whitespace-pre-line font-semibold"
                style={{ color: active ? G.gold : done ? G.blue : "oklch(0.45 0 0)" }}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-center text-xs font-bold mt-1.5" style={{ color: G.gold }}>
        Step {current + 1} of {STEPS.length}
      </p>
    </div>
  );
}

// ── Section card ───────────────────────────────────────────────────────────────

function SectionCard({ emoji, title, sub, children }: {
  emoji: string; title: string; sub: string; children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-3xl p-5 space-y-5"
      style={{
        background: "oklch(0.09 0.03 85 / 0.9)",
        border: `1px solid ${G.goldDim}`,
        boxShadow: `0 0 40px oklch(0.82 0.16 85 / 0.12), inset 0 1px 0 oklch(0.82 0.16 85 / 0.15)`,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="size-11 rounded-2xl grid place-items-center text-xl shrink-0"
          style={{ background: "oklch(0.82 0.16 85 / 0.12)", border: `1px solid ${G.goldDim}` }}
        >
          {emoji}
        </div>
        <div>
          <h2 className="text-lg font-extrabold">{title}</h2>
          <p className="text-xs text-muted-foreground">{sub}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

// ── Step 1: Badge Identity ─────────────────────────────────────────────────────

function Step1({ d, set, avatar }: {
  d: VerifData; set: (k: keyof VerifData, v: string) => void; avatar: string;
}) {
  const showPreview = !!(d.display_name || d.profile_title);
  return (
    <SectionCard emoji="🛡️" title="Badge Identity" sub="Tell us who you are.">
      <div className="space-y-3">
        <GInput label="Display name to verify" value={d.display_name} onChange={(v) => set("display_name", v)} placeholder="Your public name" />
        <GInput label="Username" value={d.username} onChange={(v) => set("username", v.startsWith("@") ? v : v ? "@" + v : "")} placeholder="@yourhandle" />
        <GSelect label="What are you applying as?" value={d.applying_as} onChange={(v) => set("applying_as", v)} options={APPLYING_AS} placeholder="Select category…" />
        <GSelect label="What title should appear near your profile?" value={d.profile_title} onChange={(v) => set("profile_title", v)} options={TITLES} placeholder="Select title…" />
        <GTextarea label="Short public bio" value={d.short_bio} onChange={(v) => set("short_bio", v)} placeholder="Brief description of who you are and what you do." rows={3} />
        <GTextarea label="Why should this profile receive a gold badge?" value={d.why_gold_badge} onChange={(v) => set("why_gold_badge", v)} placeholder="Describe your notability, achievements, and public recognition." rows={3} />
      </div>

      {/* Gold Badge Preview — appears once name or title is entered */}
      {showPreview && (
        <div
          className="rounded-2xl p-4 text-center space-y-3 mt-2"
          style={{
            background: "oklch(0.10 0.04 85 / 0.8)",
            border: `1px solid ${G.gold}`,
            boxShadow: `0 0 30px oklch(0.82 0.16 85 / 0.35)`,
          }}
        >
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: G.gold }}>Gold Badge Preview</p>
          <div className="flex justify-center">
            <div className="relative">
              <div
                className="size-16 rounded-full overflow-hidden border-[3px]"
                style={{ borderColor: G.gold, boxShadow: `0 0 20px ${G.gold}` }}
              >
                <img src={avatar} alt="" className="size-full object-cover" />
              </div>
              <div
                className="absolute -bottom-1 -right-1 size-6 rounded-full grid place-items-center border-2 border-[#020508]"
                style={{ background: G.gold }}
              >
                <Check className="size-3.5 text-black" strokeWidth={3} />
              </div>
            </div>
          </div>
          <div>
            <div className="font-extrabold">{d.display_name || "Your Name"}</div>
            <div className="text-xs text-muted-foreground">{d.username || "@handle"}</div>
            {d.profile_title && <div className="text-xs mt-0.5" style={{ color: G.gold }}>{d.profile_title}</div>}
          </div>
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
            style={{ color: G.gold, borderColor: G.goldDim, background: "oklch(0.82 0.16 85 / 0.1)" }}
          >
            <Star className="size-3" fill="currentColor" /> Notable Account
          </div>
        </div>
      )}
    </SectionCard>
  );
}

// ── Step 2: Notability Proof ───────────────────────────────────────────────────

function Step2({ d, set, toggle }: {
  d: VerifData; set: (k: keyof VerifData, v: string) => void; toggle: (id: string) => void;
}) {
  const fields = [
    { emoji: "✏️", label: "Describe your public recognition (3–6 sentences)", hint: "Share how you're recognized in your field and why it matters.", key: "recognition_description" as keyof VerifData, rows: 4 },
    { emoji: "⭐", label: "Any major achievements?", hint: "List key milestones, accomplishments, or standout moments.", key: "major_achievements" as keyof VerifData, rows: 2 },
    { emoji: "📰", label: "Any press mentions?", hint: "Include articles, interviews, or media features.", key: "press_mentions" as keyof VerifData, rows: 2 },
    { emoji: "▶️", label: "Any official releases / projects?", hint: "Share links or details about your releases or productions.", key: "official_releases" as keyof VerifData, rows: 2 },
  ];

  const stats = [
    { emoji: "🎧", label: "Monthly Listeners", key: "monthly_listeners" as keyof VerifData },
    { emoji: "👥", label: "Social Followers",  key: "social_followers"  as keyof VerifData },
    { emoji: "📰", label: "Media Mentions",    key: "media_mentions"    as keyof VerifData },
    { emoji: "🏆", label: "Awards",            key: "awards_count"      as keyof VerifData },
  ];

  return (
    <SectionCard emoji="🛡️" title="Notability Proof" sub="Tell us about your public recognition.">
      {/* 5-column x 2-row notability grid — matches the reference screenshot */}
      <div className="grid grid-cols-5 gap-2">
        {NOTABILITY.map((n) => {
          const active = d.notability_types.includes(n.id);
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => toggle(n.id)}
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl border text-center transition-all"
              style={{
                background: active ? "oklch(0.82 0.16 85 / 0.18)" : "oklch(0.08 0.02 85 / 0.6)",
                borderColor: active ? G.gold : G.goldDim,
                boxShadow: active ? `0 0 12px oklch(0.82 0.16 85 / 0.4)` : "none",
              }}
            >
              <span className="text-xl leading-none">{n.emoji}</span>
              <span className="text-[8px] leading-tight text-center whitespace-pre-line font-semibold text-muted-foreground">{n.label}</span>
            </button>
          );
        })}
      </div>

      {/* Text fields with emoji icons — matches reference layout */}
      <div className="space-y-2">
        {fields.map(({ emoji, label, hint, key, rows }) => (
          <div
            key={String(key)}
            className="rounded-2xl p-3 space-y-2"
            style={{ background: "oklch(0.07 0.02 85 / 0.7)", border: `1px solid ${G.goldDim}` }}
          >
            <div className="flex items-start gap-2">
              <span className="text-base shrink-0 mt-0.5">{emoji}</span>
              <div>
                <p className="text-xs font-semibold">{label}</p>
                <p className="text-[10px] text-muted-foreground">{hint}</p>
              </div>
            </div>
            <textarea
              value={d[key] as string}
              onChange={(e) => set(key, e.target.value)}
              rows={rows}
              placeholder="Type your answer here…"
              className="w-full bg-transparent text-sm placeholder:text-white/20 focus:outline-none resize-none"
            />
          </div>
        ))}
      </div>

      {/* Recognition Summary — matches the gold summary box in the reference */}
      <div
        className="rounded-2xl p-4"
        style={{ background: "oklch(0.82 0.16 85 / 0.07)", border: `1px solid ${G.goldDim}` }}
      >
        <div className="flex items-center gap-2 mb-3">
          <p className="text-xs font-bold tracking-wide" style={{ color: G.gold }}>Recognition Summary</p>
          <div
            className="size-4 rounded-full grid place-items-center text-[8px] font-bold border"
            style={{ color: G.gold, borderColor: G.goldDim }}
          >i</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {stats.map(({ emoji, label, key }) => (
            <div key={String(key)} className="text-center space-y-1">
              <div className="text-xl">{emoji}</div>
              <input
                value={d[key] as string}
                onChange={(e) => set(key, e.target.value)}
                placeholder="0"
                className="w-full text-center text-base font-extrabold bg-transparent focus:outline-none placeholder:text-white/20"
                style={{ color: G.gold }}
              />
              <div className="text-[10px] text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

// ── Step 3: Official Links ────────────────────────────────────────────────────

function Step3({ d, set }: { d: VerifData; set: (k: keyof VerifData, v: string) => void }) {
  return (
    <SectionCard emoji="🔗" title="Official Links" sub="Add links that confirm your identity and notability.">
      <div className="space-y-1">
        {LINK_ROWS.map(({ key, emoji, label }) => {
          const val = d[key] as string;
          return (
            <div
              key={String(key)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl border transition"
              style={{ background: "oklch(0.07 0.02 85 / 0.7)", borderColor: val ? G.gold : G.goldDim }}
            >
              <span className="text-base w-6 text-center shrink-0">{emoji}</span>
              <input
                value={val}
                onChange={(e) => set(key, e.target.value)}
                placeholder={label}
                type="url"
                className="flex-1 text-sm bg-transparent focus:outline-none placeholder:text-white/30 min-w-0"
              />
              {val ? (
                <a href={val} target="_blank" rel="noopener noreferrer" className="shrink-0 text-muted-foreground hover:text-primary">
                  <ExternalLink className="size-3.5" />
                </a>
              ) : (
                <ExternalLink className="size-3.5 text-white/20 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

// ── Step 4: Safety Check ──────────────────────────────────────────────────────

function Step4({ d, set }: { d: VerifData; set: (k: keyof VerifData, v: string | boolean) => void }) {
  return (
    <SectionCard emoji="🛡️" title="Safety Check" sub="Please confirm the following.">
      {/* Pre-confirmed items — gold check circles like the reference */}
      <div
        className="rounded-2xl overflow-hidden divide-y"
        style={{ border: `1px solid ${G.goldDim}`, borderColor: G.goldDim }}
      >
        {SAFETY_ITEMS.map((item, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3.5" style={{ background: "oklch(0.07 0.02 85 / 0.7)" }}>
            <div
              className="size-6 rounded-full border-2 grid place-items-center shrink-0 mt-0.5"
              style={{ borderColor: G.gold, background: "oklch(0.82 0.16 85 / 0.15)", boxShadow: `0 0 8px ${G.gold}` }}
            >
              <Check className="size-3.5" strokeWidth={3} style={{ color: G.gold }} />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{item}</p>
          </div>
        ))}
      </div>

      {/* Optional impersonation question */}
      <div
        className="rounded-2xl p-4 space-y-3"
        style={{ background: "oklch(0.07 0.02 85 / 0.7)", border: `1px solid ${G.blueDim}` }}
      >
        <div className="flex items-start gap-2">
          <div
            className="size-6 rounded-full grid place-items-center text-xs font-bold shrink-0 mt-0.5 border"
            style={{ color: G.blue, borderColor: G.blueDim, background: "oklch(0.82 0.15 215 / 0.1)" }}
          >?</div>
          <div>
            <p className="text-sm font-semibold">Is there any impersonation risk or confusion we should know about? <span className="text-muted-foreground font-normal">(Optional)</span></p>
            <p className="text-[11px] text-muted-foreground mt-0.5">For example: similar account names, logos, or brands that might be confused with your channel.</p>
          </div>
        </div>
        <textarea
          value={d.impersonation_notes}
          onChange={(e) => set("impersonation_notes", e.target.value)}
          rows={3}
          placeholder="Type your answer here…"
          className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border text-sm placeholder:text-white/20 focus:outline-none transition resize-none"
          style={{ borderColor: G.blueDim }}
        />
      </div>

      {/* Agree toggle */}
      <button
        type="button"
        onClick={() => set("safety_confirmed", !d.safety_confirmed)}
        className="w-full flex items-center gap-3 p-4 rounded-2xl border transition-all"
        style={{
          background: d.safety_confirmed ? "oklch(0.82 0.16 85 / 0.12)" : "oklch(0.07 0.02 85 / 0.7)",
          borderColor: d.safety_confirmed ? G.gold : G.goldDim,
          boxShadow: d.safety_confirmed ? `0 0 20px oklch(0.82 0.16 85 / 0.25)` : "none",
        }}
      >
        <div
          className="size-6 rounded-lg border-2 grid place-items-center shrink-0 transition-all"
          style={{
            borderColor: d.safety_confirmed ? G.gold : "oklch(0.4 0 0)",
            background: d.safety_confirmed ? G.gold : "transparent",
          }}
        >
          {d.safety_confirmed && <Check className="size-3.5 text-black" strokeWidth={3} />}
        </div>
        <span className="text-sm font-semibold">I confirm all the above statements</span>
      </button>
    </SectionCard>
  );
}

// ── Step 5: Review & Submit ───────────────────────────────────────────────────

function Step5({ d, goTo, agreed, setAgreed }: {
  d: VerifData; goTo: (s: number) => void; agreed: boolean; setAgreed: (v: boolean) => void;
}) {
  const linksCount = LINK_ROWS.filter(({ key }) => (d[key] as string)).length;

  const sections = [
    { emoji: "🛡️", title: "Badge Identity",    sub: "Your official identity details", step: 0 },
    { emoji: "⭐",  title: "Notability Proof",   sub: "Proof of your notability",       step: 1 },
    { emoji: "🔗",  title: "Official Links",      sub: "Links to your official presence", step: 2 },
    { emoji: "✅",  title: "Safety Check",        sub: "Confirm your account safety",    step: 3 },
  ];

  const summary = [
    d.display_name && { emoji: "👤", text: d.display_name },
    d.profile_title && { emoji: "🎙️", text: d.profile_title },
    ...d.notability_types.slice(0, 3).map((id) => {
      const n = NOTABILITY.find((x) => x.id === id);
      return n ? { emoji: n.emoji, text: n.label.replace(/\n/g, " ") } : null;
    }),
    linksCount > 0 && { emoji: "🔗", text: `${linksCount} link${linksCount !== 1 ? "s" : ""} added` },
    d.safety_confirmed && { emoji: "✅", text: "All confirmations accepted" },
  ].filter(Boolean) as { emoji: string; text: string }[];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-extrabold">Review & Submit</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Review your request before submitting.</p>
      </div>

      {/* Two-column layout matching the reference screenshot */}
      <div className="grid grid-cols-5 gap-3">
        {/* Left: section edit cards */}
        <div className="col-span-3 space-y-2">
          {sections.map((s) => (
            <div
              key={s.step}
              className="flex items-center gap-2.5 p-3 rounded-2xl border"
              style={{ background: "oklch(0.10 0.05 215 / 0.5)", borderColor: G.blueDim }}
            >
              <div
                className="size-9 rounded-xl grid place-items-center text-base shrink-0"
                style={{ background: "oklch(0.82 0.15 215 / 0.15)", border: `1px solid ${G.blueDim}` }}
              >
                {s.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate">{s.title}</div>
                <div className="text-[9px] text-muted-foreground truncate">{s.sub}</div>
              </div>
              <button
                onClick={() => goTo(s.step)}
                className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition"
                style={{ color: G.blue, borderColor: G.blueDim, background: "oklch(0.82 0.15 215 / 0.1)" }}
              >
                ✏️ Edit
              </button>
            </div>
          ))}
        </div>

        {/* Right: Application Summary */}
        <div
          className="col-span-2 rounded-2xl p-3 space-y-2"
          style={{ background: "oklch(0.82 0.16 85 / 0.07)", border: `1px solid ${G.gold}`, boxShadow: `0 0 24px oklch(0.82 0.16 85 / 0.2)` }}
        >
          <p className="text-[10px] font-bold tracking-wide" style={{ color: G.gold }}>Application Summary</p>
          {summary.map((s, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <span className="text-xs shrink-0">{s.emoji}</span>
              <span className="text-[10px] text-muted-foreground leading-snug">{s.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Agreement block — matches reference screenshot */}
      <div
        className="rounded-3xl p-4 space-y-3"
        style={{ background: "oklch(0.09 0.04 85 / 0.9)", border: `1px solid ${G.goldDim}` }}
      >
        <div className="flex items-start gap-3">
          <div
            className="size-12 rounded-2xl grid place-items-center text-2xl shrink-0"
            style={{ background: "oklch(0.82 0.16 85 / 0.15)", border: `1px solid ${G.goldDim}` }}
          >🛡️</div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            By submitting, you confirm that all information provided is accurate and you agree to the{" "}
            <span className="font-semibold" style={{ color: G.gold }}>Trey TV Community Guidelines.</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAgreed(!agreed)}
          className="flex items-center gap-2.5 text-sm"
        >
          <div
            className="size-5 rounded-full border-2 grid place-items-center shrink-0 transition-all"
            style={{
              borderColor: agreed ? G.gold : "oklch(0.4 0 0)",
              background: agreed ? G.gold : "transparent",
            }}
          >
            {agreed && <Check className="size-3 text-black" strokeWidth={3} />}
          </div>
          <span className={agreed ? "font-medium" : "text-muted-foreground"} style={agreed ? { color: G.gold } : {}}>
            I agree to the community guidelines
          </span>
        </button>
      </div>
    </div>
  );
}

// ── Submitted screen ──────────────────────────────────────────────────────────

const TIMELINE = [
  { label: "Submitted",         emoji: "📄" },
  { label: "Under Review",      emoji: "🔍" },
  { label: "More Info\nNeeded", emoji: "ℹ️" },
  { label: "Approved",          emoji: "🛡️" },
  { label: "Denied",            emoji: "✗" },
];

function VerificationSubmitted() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center px-5 pb-10" style={{ background: "radial-gradient(ellipse 100% 50% at 50% 0%, oklch(0.22 0.09 85 / 0.6) 0%, #020508 55%)" }}>
      <div className="w-full max-w-sm flex flex-col items-center pt-12 space-y-6">
        <Logo className="h-14 drop-shadow-[0_0_24px_oklch(0.82_0.16_85_/_0.8)]" />

        {/* Gold shield */}
        <div className="relative">
          <div className="size-44 rounded-full grid place-items-center" style={{ background: "radial-gradient(circle, oklch(0.82 0.16 85 / 0.2) 0%, transparent 70%)" }}>
            <div
              className="size-32 rounded-[2.5rem] grid place-items-center text-7xl"
              style={{
                background: "linear-gradient(145deg, oklch(0.78 0.22 78), oklch(0.62 0.20 68), oklch(0.50 0.18 62))",
                border: "2px solid oklch(0.85 0.20 82 / 0.8)",
                boxShadow: `0 0 80px oklch(0.82 0.16 85 / 0.9), 0 0 160px oklch(0.82 0.16 85 / 0.4), inset 0 2px 0 oklch(1 0 0 / 0.3)`,
              }}
            >
              🛡️
            </div>
          </div>
          <span className="absolute bottom-5 right-4 text-2xl">✨</span>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold leading-tight">
            Your{" "}
            <span style={{ color: G.gold }}>Gold Verification</span>
            <br />Request Is In!
          </h1>
          <p className="text-sm text-muted-foreground">
            We received your request.<br />You can track the status from your profile.
          </p>
        </div>

        <div className="w-full space-y-3">
          <button
            onClick={() => navigate({ to: "/applications" })}
            className="w-full py-4 rounded-full font-bold text-sm flex items-center justify-between px-6 text-black"
            style={{ background: `linear-gradient(90deg, oklch(0.65 0.20 72), oklch(0.80 0.22 82))`, boxShadow: `0 0 40px oklch(0.82 0.16 85 / 0.7)` }}
          >
            View Verification Status <ChevronRight className="size-5" />
          </button>
          <button
            onClick={() => navigate({ to: "/" })}
            className="w-full py-4 rounded-full font-semibold text-sm flex items-center justify-between px-6"
            style={{ background: "oklch(0.15 0.06 215 / 0.7)", border: `1px solid ${G.blueDim}` }}
          >
            Back to Trey TV <ChevronRight className="size-5" />
          </button>
        </div>

        {/* Status timeline — matches the reference bottom card */}
        <div
          className="w-full rounded-3xl p-4"
          style={{ background: "oklch(0.10 0.03 0 / 0.8)", border: "1px solid oklch(1 0 0 / 0.08)" }}
        >
          <div className="flex items-start">
            {TIMELINE.map((s, i) => {
              const isFirst = i === 0;
              return (
                <div key={s.label} className="flex items-start flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className="size-10 rounded-full border-2 grid place-items-center"
                      style={{
                        borderColor: isFirst ? G.gold : "oklch(1 0 0 / 0.15)",
                        background: isFirst ? "oklch(0.82 0.16 85 / 0.2)" : "oklch(1 0 0 / 0.05)",
                        boxShadow: isFirst ? `0 0 14px ${G.gold}` : "none",
                      }}
                    >
                      {isFirst
                        ? <Check className="size-4" style={{ color: G.gold }} />
                        : <span className="text-sm">{s.emoji}</span>}
                    </div>
                    <p
                      className="text-[9px] text-center mt-1.5 leading-tight whitespace-pre-line font-semibold"
                      style={{ color: isFirst ? G.gold : "oklch(0.4 0 0)" }}
                    >
                      {s.label}
                    </p>
                  </div>
                  {i < TIMELINE.length - 1 && (
                    <div className="h-px w-3 mt-5 shrink-0" style={{ background: "oklch(1 0 0 / 0.1)" }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Validation ────────────────────────────────────────────────────────────────

function validate(step: number, d: VerifData): string | null {
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

// ── Main ──────────────────────────────────────────────────────────────────────

function GoldVerificationApplication() {
  const { isGuest, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<VerifData>(EMPTY);
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [appId, setAppId] = useState<string | null>(null);

  useEffect(() => {
    if (isGuest) {
      try { sessionStorage.setItem("treytv_post_auth_redirect", "/apply/verification"); } catch {}
      navigate({ to: "/login" });
    }
  }, [isGuest, navigate]);

  useEffect(() => {
    if (!user) return;
    setData((p) => ({
      ...p,
      display_name: p.display_name || user.name || "",
      username: p.username || (user.handle ? `@${user.handle}` : ""),
    }));
  }, [user?.uid]);

  useEffect(() => {
    if (!user) return;
    let dead = false;
    void (async () => {
      try {
        const { data: row } = await (supabase as any)
          .from("creator_applications")
          .select("id, verification_data")
          .eq("application_type", "verification")
          .in("status", ["draft", "needs_more_info"])
          .limit(1).maybeSingle();
        if (dead || !row?.verification_data) return;
        setAppId(row.id);
        setData((p) => ({ ...p, ...row.verification_data }));
      } catch {}
    })();
    return () => { dead = true; };
  }, [user?.uid]);

  const set = useCallback(<K extends keyof VerifData>(k: K, v: VerifData[K]) => {
    setData((p) => ({ ...p, [k]: v }));
  }, []);

  const toggle = useCallback((id: string) => {
    setData((p) => ({
      ...p,
      notability_types: p.notability_types.includes(id)
        ? p.notability_types.filter((x) => x !== id)
        : [...p.notability_types, id],
    }));
  }, []);

  const upsert = async (status: "draft" | "pending") => {
    const payload = { application_type: "verification", status, verification_data: data, updated_at: new Date().toISOString() };
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
    setSaving(true);
    try { await upsert("draft"); toast.success("Draft saved!"); }
    catch (e: any) { toast.error(e?.message ?? "Failed to save draft."); }
    finally { setSaving(false); }
  };

  const handleNext = () => {
    const err = validate(step, data);
    if (err) { toast.error(err); return; }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => { setStep((s) => Math.max(s - 1, 0)); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const handleSubmit = async () => {
    if (!agreed) { toast.error("Please agree to the community guidelines."); return; }
    setSubmitting(true);
    try { await upsert("pending"); setSubmitted(true); }
    catch (e: any) { toast.error(e?.message ?? "Failed to submit."); }
    finally { setSubmitting(false); }
  };

  if (isGuest) return null;
  if (submitted) return <VerificationSubmitted />;

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: "100dvh", background: "radial-gradient(ellipse 100% 35% at 50% 0%, oklch(0.20 0.08 85 / 0.45) 0%, #020508 50%)" }}
    >
      {/* ── Header: pill buttons matching reference screenshots ── */}
      <header className="shrink-0 flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "oklch(0.82 0.16 85 / 0.12)", background: "oklch(0.06 0.02 85 / 0.95)", backdropFilter: "blur(20px)" }}>
        <button
          onClick={step === 0 ? () => navigate({ to: "/apply" }) : handleBack}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition"
          style={{ background: "oklch(0.82 0.15 215 / 0.12)", border: `1px solid ${G.blueDim}`, color: G.blue }}
        >
          <ChevronLeft className="size-3.5" /> Back to Apply
        </button>
        <button
          onClick={handleDraft}
          disabled={saving}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition disabled:opacity-50"
          style={{ background: "oklch(0.82 0.16 85 / 0.10)", border: `1px solid ${G.goldDim}`, color: G.gold }}
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          Save Draft
        </button>
      </header>

      {/* ── Logo + title on every step ── */}
      <div className="shrink-0 text-center py-4 px-5">
        <div style={{ filter: "drop-shadow(0 0 20px oklch(0.82 0.16 85 / 0.7))" }}>
          <Logo className="h-12 mx-auto" />
        </div>
        <h1 className="text-lg font-extrabold mt-2">
          <span style={{ color: G.gold }}>Gold Verification</span> Request
        </h1>
      </div>

      {/* ── Step progress ── */}
      <div className="shrink-0 px-5 pb-4">
        <StepBar current={step} />
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 space-y-4 max-w-lg mx-auto w-full">
        <div className="animate-rise">
          {step === 0 && <Step1 d={data} set={(k, v) => set(k, v as any)} avatar={user?.avatar ?? ""} />}
          {step === 1 && <Step2 d={data} set={(k, v) => set(k, v as any)} toggle={toggle} />}
          {step === 2 && <Step3 d={data} set={(k, v) => set(k, v as any)} />}
          {step === 3 && <Step4 d={data} set={(k, v) => set(k, v as any)} />}
          {step === 4 && <Step5 d={data} goTo={setStep} agreed={agreed} setAgreed={setAgreed} />}
        </div>
      </div>

      {/* ── Footer: two pill buttons matching reference screenshots ── */}
      <div
        className="shrink-0 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),1rem)]"
        style={{ background: "oklch(0.06 0.02 85 / 0.95)", borderTop: `1px solid oklch(0.82 0.16 85 / 0.12)`, backdropFilter: "blur(20px)" }}
      >
        <div className="max-w-lg mx-auto flex gap-3">
          {step > 0 && (
            <button
              onClick={handleBack}
              className="flex-1 py-4 rounded-full font-bold text-sm flex items-center justify-center gap-2"
              style={{ background: "oklch(0.15 0.06 215 / 0.7)", border: `1px solid ${G.blueDim}` }}
            >
              <ChevronLeft className="size-4" /> Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex-1 py-4 rounded-full font-bold text-sm text-black flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(90deg, oklch(0.65 0.20 72), oklch(0.80 0.22 82))`, boxShadow: `0 0 28px oklch(0.82 0.16 85 / 0.55)` }}
            >
              Next Step <ChevronRight className="size-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !agreed}
              className="flex-1 py-4 rounded-full font-bold text-sm text-black flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: `linear-gradient(90deg, oklch(0.65 0.20 72), oklch(0.80 0.22 82))`, boxShadow: `0 0 28px oklch(0.82 0.16 85 / 0.55)` }}
            >
              {submitting ? <Loader2 className="size-4 animate-spin text-black" /> : "🛡️"}
              {submitting ? "Submitting…" : "Submit Verification Request"}
              {!submitting && <ChevronRight className="size-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
