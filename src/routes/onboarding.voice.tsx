import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle, Keyboard, Mic, MicOff, Send, Shield, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { VoiceOrb, type VoiceState } from "@/components/onboarding/VoiceOrb";
import { treyIElevenLabsOnboardingSession } from "@/lib/trey-i/elevenlabs-session.server";
import { treyITts } from "@/lib/trey-i/tts.server";
import { saveOnboardingProfile, finalizeOnboarding, treyICheckUsername } from "@/lib/trey-i/onboarding.server";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/onboarding/voice")({
  component: VoiceOnboarding,
  head: () => ({
    meta: [
      { title: "Build your profile with Trey-I — Trey TV" },
      { name: "description", content: "Premium voice setup with Trey-I. Cinematic, fast, beautifully guided." },
    ],
  }),
});

// ─── Types ────────────────────────────────────────────────────────────────────

type Stage =
  | "ask_display_name" | "confirm_display_name"
  | "ask_username"     | "confirm_username"
  | "ask_bio"          | "confirm_bio"
  | "ask_location"     | "confirm_location"
  | "optional_offer"
  | "ask_birthday_choice" | "ask_birthday" | "confirm_date_of_birth" | "ask_show_birthday"
  | "ask_content_choice"
  | "ask_categories"   | "confirm_categories"
  | "ask_moods"        | "confirm_moods"
  | "ask_frequency"    | "confirm_frequency"
  | "ask_fan_type"     | "confirm_fan_type"
  | "ask_socials_choice"
  | "ask_instagram"    | "confirm_instagram"
  | "ask_tiktok"       | "confirm_tiktok"
  | "ask_youtube"      | "confirm_youtube"
  | "ask_x_handle"     | "confirm_x_handle"
  | "ask_privacy_choice"
  | "ask_visibility"   | "confirm_visibility"
  | "ask_privacy_details"
  | "review" | "edit_field" | "complete";

type Fields = {
  display_name?: string;
  username?: string;
  bio?: string;
  location?: string;
  date_of_birth?: string;
  show_birthday?: boolean;
  favorite_categories?: string[];
  favorite_moods?: string[];
  content_frequency?: string;
  fan_type?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  x_handle?: string;
  profile_visibility?: string;
  show_location?: boolean;
  show_top_three?: boolean;
  allow_top_three_adds?: boolean;
};

type Pending = { field?: string; value?: unknown };
type Turn = { message: string; stage: Stage; fields: Fields; pending: Pending; switchToManual?: boolean };

// ─── Constants ────────────────────────────────────────────────────────────────

const CORE_FIELDS: Array<keyof Fields> = ["display_name", "username", "bio", "location"];
const INITIAL_MESSAGE = "Hey — I'm Trey-I. What should the world call you?";

const CATEGORY_OPTIONS = ["Music", "Shows", "Behind the scenes", "Comedy", "Motivation", "Creator content", "Exclusive drops"];
const MOOD_OPTIONS     = ["Funny", "Deep", "Raw", "Luxury", "Reality-style", "Inspirational", "Wild/uncut"];

// ─── Patterns ─────────────────────────────────────────────────────────────────

const yesRe    = /^(yes|yeah|yep|correct|right|that'?s right|looks good|sounds good|save it|confirm|confirmed|sure|ok|okay|please do)$/i;
const noRe     = /^(no|nope|nah|not quite|wrong|change it|try again)/i;
const skipRe   = /^(skip|skip it|pass|no thanks|not now|later|next)$/i;
const finishRe = /^(finish|done|complete|wrap up|that'?s all|all set)$/i;
const manualRe = /^(manual|switch to manual|stop|cancel|i want manual|do it manually)$/i;

// ─── Parse helpers ────────────────────────────────────────────────────────────

function normalizeUsername(v: string) {
  return v.toLowerCase()
    .replace(/^@/, "").replace(/\s+underscore\s+/g, "_").replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "").slice(0, 30);
}

function cleanHandle(v: string) {
  return v.replace(/^@/, "").replace(/\s+/g, "").replace(/[^\w.-]/g, "").slice(0, 80);
}

function parseList(input: string, options: string[]) {
  const lower = input.toLowerCase();
  const matched = options.filter((o) => lower.includes(o.toLowerCase()));
  if (matched.length) return matched;
  return input.split(/,|\band\b/i).map((s) => s.trim()).filter(Boolean).slice(0, 5);
}

function summarizeList(v: unknown) {
  return Array.isArray(v) ? v.join(", ") : String(v ?? "");
}

function parseFrequency(input: string) {
  const l = input.toLowerCase();
  if (l.includes("daily") || l.includes("every day")) return "daily";
  if (l.includes("weekly") || l.includes("week"))      return "weekly";
  if (l.includes("drop") || l.includes("major"))       return "only_drops";
  return "";
}

function parseFanType(input: string) {
  const l = input.toLowerCase();
  if (l.includes("trizfit"))                              return "trizfit";
  if (l.includes("creator") || l.includes("artist") || l.includes("make")) return "creator";
  if (l.includes("support"))                              return "supporter";
  if (l.includes("super") || l.includes("fan"))          return "superfan";
  if (l.includes("viewer") || l.includes("watch"))       return "viewer";
  return "";
}

function parseVisibility(input: string) {
  const l = input.toLowerCase();
  if (l.includes("private"))                        return "private";
  if (l.includes("member") || l.includes("limited")) return "members_only";
  if (l.includes("public"))                         return "public";
  return "";
}

function parseDateOfBirth(input: string) {
  const s = input.trim().slice(0, 40);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const mdy = s.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b/);
  if (mdy) return `${mdy[3]}-${mdy[1].padStart(2, "0")}-${mdy[2].padStart(2, "0")}`;
  const d = new Date(s);
  if (!Number.isNaN(d.getTime()) && /\d{4}/.test(s)) return d.toISOString().slice(0, 10);
  return "";
}

// ─── Review summary ───────────────────────────────────────────────────────────

function buildReview(f: Fields): string {
  const parts = [
    `display name: ${f.display_name}`,
    `username: @${f.username}`,
  ];
  if (f.bio)            parts.push(`bio: ${f.bio}`);
  if (f.location)       parts.push(`location: ${f.location}`);
  if (f.date_of_birth)  parts.push(`birthday: ${f.date_of_birth}`);
  if (f.favorite_categories?.length) parts.push(`categories: ${f.favorite_categories.join(", ")}`);
  if (f.favorite_moods?.length)      parts.push(`moods: ${f.favorite_moods.join(", ")}`);
  if (f.content_frequency) parts.push(`frequency: ${f.content_frequency.replace("_", " ")}`);
  if (f.fan_type)          parts.push(`profile type: ${f.fan_type}`);
  const socials = (["instagram", "tiktok", "youtube", "x_handle"] as const)
    .filter((s) => f[s]).map((s) => `${s.replace("_handle", "")}: ${f[s]}`);
  if (socials.length) parts.push(`socials: ${socials.join(", ")}`);
  if (f.profile_visibility) parts.push(`visibility: ${f.profile_visibility}`);
  return `Here's your profile. ${parts.join(". ")}. Does everything look right?`;
}

function afterLocationMsg() {
  return "We've got the essentials. Want to add a few extras — birthday, content preferences, socials, privacy? Or say finish to wrap up.";
}

// ─── Core state machine ───────────────────────────────────────────────────────
// Async so username stages can hit the server availability check.

type CheckUsername = (u: string) => Promise<{ username: string; available: boolean; reason: string }>;

async function clientTurn(
  stage: Stage,
  fields: Fields,
  pending: Pending,
  input: string,
  checkUsername: CheckUsername,
): Promise<Turn> {
  const t = input.trim();
  const stay = (msg: string): Turn => ({ message: msg, stage, fields, pending });

  // Global shortcuts available from any non-critical stage
  if (manualRe.test(t)) return { message: "No problem. Switching you to manual setup.", stage, fields, pending, switchToManual: true };

  const canFinish = !["confirm_display_name", "confirm_username", "review", "complete"].includes(stage);
  if (finishRe.test(t) && canFinish && fields.display_name && fields.username) {
    return { message: buildReview(fields), stage: "review", fields, pending: {} };
  }

  // ── Required fields ────────────────────────────────────────────────────────

  if (stage === "ask_display_name") {
    if (yesRe.test(t) || noRe.test(t) || skipRe.test(t))
      return stay("Say the name you want people to see on Trey TV.");
    const name = t.replace(/^my name is\s+/i, "").replace(/^call me\s+/i, "").trim().slice(0, 50);
    if (name.length < 2) return stay("Say your profile name one more time for me.");
    return { message: `I heard "${name}". Is that spelled right?`, stage: "confirm_display_name", fields, pending: { field: "display_name", value: name } };
  }

  if (stage === "confirm_display_name") {
    if (yesRe.test(t) && pending.value)
      return { message: "Saved. What username do you want on Trey TV?", stage: "ask_username", fields: { ...fields, display_name: String(pending.value) }, pending: {} };
    const rep = (noRe.test(t) ? t.replace(noRe, "") : t).trim();
    if (rep.length >= 2)
      return { message: `Got it. I heard "${rep.slice(0, 50)}". Is that spelled right?`, stage: "confirm_display_name", fields, pending: { field: "display_name", value: rep.slice(0, 50) } };
    return { message: "Say your profile name one more time.", stage: "ask_display_name", fields, pending: {} };
  }

  if (stage === "ask_username") {
    if (yesRe.test(t) || noRe.test(t) || skipRe.test(t))
      return stay("Say the username you want — letters, numbers, or underscores.");
    const raw = normalizeUsername(t);
    const check = await checkUsername(raw);
    if (!check.available) {
      const msg = check.reason === "invalid"
        ? "Use 3–30 lowercase letters, numbers, or underscores."
        : `${raw} is already taken. Try a different username.`;
      return stay(msg);
    }
    return { message: `${check.username} is available. Should I save that as your username?`, stage: "confirm_username", fields, pending: { field: "username", value: check.username } };
  }

  if (stage === "confirm_username") {
    if (yesRe.test(t) && pending.value)
      return { message: "Username saved. Want to add a short bio? Say one now, or say skip.", stage: "ask_bio", fields: { ...fields, username: String(pending.value) }, pending: {} };
    const raw = normalizeUsername((noRe.test(t) ? t.replace(noRe, "") : t));
    if (raw.length >= 3) {
      const check = await checkUsername(raw);
      if (!check.available) return stay("That username isn't available. Try another one.");
      return { message: `${check.username} is available. Should I save that?`, stage: "confirm_username", fields, pending: { field: "username", value: check.username } };
    }
    return { message: "Say the username one more time.", stage: "ask_username", fields, pending: {} };
  }

  if (stage === "ask_bio") {
    if (skipRe.test(t))
      return { message: "No bio for now. Want to add your location? Say it now, or say skip.", stage: "ask_location", fields, pending: {} };
    if (yesRe.test(t) || noRe.test(t)) return stay("Say the short bio you want, or say skip.");
    const bio = t.slice(0, 160);
    return { message: `I heard: "${bio}". Should I save it?`, stage: "confirm_bio", fields, pending: { field: "bio", value: bio } };
  }

  if (stage === "confirm_bio") {
    if (yesRe.test(t) && pending.value)
      return { message: "Bio saved. Want to add your location? Say it now, or say skip.", stage: "ask_location", fields: { ...fields, bio: String(pending.value) }, pending: {} };
    if (skipRe.test(t))
      return { message: "No bio for now. Want to add your location? Say it now, or say skip.", stage: "ask_location", fields, pending: {} };
    const bio = (noRe.test(t) ? t.replace(noRe, "") : t).trim().slice(0, 160);
    if (bio) return { message: `Got it. "${bio}". Should I save it?`, stage: "confirm_bio", fields, pending: { field: "bio", value: bio } };
    return { message: "Say the bio one more time, or say skip.", stage: "ask_bio", fields, pending: {} };
  }

  if (stage === "ask_location") {
    if (skipRe.test(t))
      return { message: afterLocationMsg(), stage: "optional_offer", fields, pending: {} };
    if (yesRe.test(t) || noRe.test(t)) return stay("Say your location, or say skip.");
    const loc = t.slice(0, 50);
    return { message: `I heard "${loc}". Should I save that?`, stage: "confirm_location", fields, pending: { field: "location", value: loc } };
  }

  if (stage === "confirm_location") {
    if (yesRe.test(t) && pending.value) {
      const f = { ...fields, location: String(pending.value) };
      return { message: afterLocationMsg(), stage: "optional_offer", fields: f, pending: {} };
    }
    if (skipRe.test(t))
      return { message: afterLocationMsg(), stage: "optional_offer", fields, pending: {} };
    const loc = (noRe.test(t) ? t.replace(noRe, "") : t).trim().slice(0, 50);
    if (loc) return { message: `Got it. "${loc}". Should I save that?`, stage: "confirm_location", fields, pending: { field: "location", value: loc } };
    return { message: "Say your location one more time, or say skip.", stage: "ask_location", fields, pending: {} };
  }

  // ── Optional extras offer ──────────────────────────────────────────────────

  if (stage === "optional_offer") {
    if (skipRe.test(t) || finishRe.test(t) || noRe.test(t))
      return { message: buildReview(fields), stage: "review", fields, pending: {} };
    return { message: "Want to add your birthday? Say yes, or say skip.", stage: "ask_birthday_choice", fields, pending: {} };
  }

  // ── Birthday ───────────────────────────────────────────────────────────────

  if (stage === "ask_birthday_choice") {
    if (skipRe.test(t) || noRe.test(t))
      return { message: "Birthday skipped. Want to add content preferences?", stage: "ask_content_choice", fields, pending: {} };
    return { message: "Say your full birthday — month, day, and year. Or say skip.", stage: "ask_birthday", fields, pending: {} };
  }

  if (stage === "ask_birthday") {
    if (skipRe.test(t))
      return { message: "Birthday skipped. Want to add content preferences?", stage: "ask_content_choice", fields, pending: {} };
    const dob = parseDateOfBirth(t);
    if (!dob) return stay("I need the full date — month, day, and year. Or say skip.");
    return { message: `I heard ${dob}. Should I save that birthday?`, stage: "confirm_date_of_birth", fields, pending: { field: "date_of_birth", value: dob } };
  }

  if (stage === "confirm_date_of_birth") {
    if (yesRe.test(t) && pending.value) {
      const f = { ...fields, date_of_birth: String(pending.value) };
      return { message: "Birthday saved. Do you want it shown on your profile?", stage: "ask_show_birthday", fields: f, pending: {} };
    }
    if (skipRe.test(t))
      return { message: "Birthday skipped. Want to add content preferences?", stage: "ask_content_choice", fields, pending: {} };
    return { message: "Say the birthday again with month, day, and year, or say skip.", stage: "ask_birthday", fields, pending: {} };
  }

  if (stage === "ask_show_birthday") {
    const show = yesRe.test(t);
    return { message: `Got it. Birthday visibility is ${show ? "on" : "off"}. Want to add content preferences?`, stage: "ask_content_choice", fields: { ...fields, show_birthday: show }, pending: {} };
  }

  // ── Content preferences ────────────────────────────────────────────────────

  if (stage === "ask_content_choice") {
    if (skipRe.test(t) || noRe.test(t))
      return { message: "Content preferences skipped. Want to add social links?", stage: "ask_socials_choice", fields, pending: {} };
    return { message: `What kind of Trey TV content do you like? For example: ${CATEGORY_OPTIONS.slice(0, 4).join(", ")}.`, stage: "ask_categories", fields, pending: {} };
  }

  if (stage === "ask_categories") {
    if (skipRe.test(t))
      return { message: "Categories skipped. What moods do you usually watch for? Or say skip.", stage: "ask_moods", fields, pending: {} };
    const cats = parseList(t, CATEGORY_OPTIONS);
    return { message: `I heard ${summarizeList(cats)}. Save those categories?`, stage: "confirm_categories", fields, pending: { field: "favorite_categories", value: cats } };
  }

  if (stage === "confirm_categories") {
    if (yesRe.test(t) && pending.value) {
      const f = { ...fields, favorite_categories: pending.value as string[] };
      return { message: "Categories saved. What moods do you usually watch for? Or say skip.", stage: "ask_moods", fields: f, pending: {} };
    }
    if (skipRe.test(t))
      return { message: "Categories skipped. What moods do you usually watch for? Or say skip.", stage: "ask_moods", fields, pending: {} };
    return { message: "No problem. Say the content categories again, or say skip.", stage: "ask_categories", fields, pending: {} };
  }

  if (stage === "ask_moods") {
    if (skipRe.test(t))
      return { message: "Moods skipped. How often do you watch or post? Daily, weekly, or only major drops?", stage: "ask_frequency", fields, pending: {} };
    const moods = parseList(t, MOOD_OPTIONS);
    return { message: `I heard ${summarizeList(moods)}. Save those moods?`, stage: "confirm_moods", fields, pending: { field: "favorite_moods", value: moods } };
  }

  if (stage === "confirm_moods") {
    if (yesRe.test(t) && pending.value) {
      const f = { ...fields, favorite_moods: pending.value as string[] };
      return { message: "Moods saved. How often do you watch or post? Daily, weekly, or only major drops?", stage: "ask_frequency", fields: f, pending: {} };
    }
    if (skipRe.test(t))
      return { message: "Moods skipped. How often do you watch or post? Daily, weekly, or only major drops?", stage: "ask_frequency", fields, pending: {} };
    return { message: "No problem. Say the moods again, or say skip.", stage: "ask_moods", fields, pending: {} };
  }

  if (stage === "ask_frequency") {
    if (skipRe.test(t))
      return { message: "Frequency skipped. Are you mostly a viewer, creator, supporter, superfan, or Trizfit?", stage: "ask_fan_type", fields, pending: {} };
    const freq = parseFrequency(t);
    if (!freq) return stay("Say daily, weekly, only major drops, or skip.");
    return { message: `I heard ${freq.replace("_", " ")}. Save that frequency?`, stage: "confirm_frequency", fields, pending: { field: "content_frequency", value: freq } };
  }

  if (stage === "confirm_frequency") {
    if (yesRe.test(t) && pending.value) {
      const f = { ...fields, content_frequency: String(pending.value) };
      return { message: "Frequency saved. Are you mostly a viewer, creator, supporter, superfan, or Trizfit?", stage: "ask_fan_type", fields: f, pending: {} };
    }
    if (skipRe.test(t))
      return { message: "Frequency skipped. Are you mostly a viewer, creator, supporter, superfan, or Trizfit?", stage: "ask_fan_type", fields, pending: {} };
    return { message: "No problem. Say daily, weekly, only major drops, or skip.", stage: "ask_frequency", fields, pending: {} };
  }

  if (stage === "ask_fan_type") {
    if (skipRe.test(t))
      return { message: "Profile type skipped. Want to add social links?", stage: "ask_socials_choice", fields, pending: {} };
    const fanType = parseFanType(t);
    if (!fanType) return stay("Say viewer, creator, supporter, superfan, Trizfit, or skip.");
    return { message: `I heard ${fanType}. Save that profile type?`, stage: "confirm_fan_type", fields, pending: { field: "fan_type", value: fanType } };
  }

  if (stage === "confirm_fan_type") {
    if (yesRe.test(t) && pending.value) {
      const f = { ...fields, fan_type: String(pending.value) };
      return { message: "Profile type saved. Want to add social links?", stage: "ask_socials_choice", fields: f, pending: {} };
    }
    if (skipRe.test(t))
      return { message: "Profile type skipped. Want to add social links?", stage: "ask_socials_choice", fields, pending: {} };
    return { message: "No problem. Say viewer, creator, supporter, superfan, Trizfit, or skip.", stage: "ask_fan_type", fields, pending: {} };
  }

  // ── Social links ───────────────────────────────────────────────────────────

  if (stage === "ask_socials_choice") {
    if (skipRe.test(t) || noRe.test(t))
      return { message: "Social links skipped. Want to set privacy now?", stage: "ask_privacy_choice", fields, pending: {} };
    return { message: "Say your Instagram handle, or say skip.", stage: "ask_instagram", fields, pending: {} };
  }

  const socialAskMap: Partial<Record<Stage, { field: keyof Fields; next: Stage; nextPrompt: string }>> = {
    ask_instagram: { field: "instagram", next: "ask_tiktok",   nextPrompt: "Say your TikTok handle, or say skip." },
    ask_tiktok:    { field: "tiktok",    next: "ask_youtube",   nextPrompt: "Say your YouTube link, or say skip." },
    ask_youtube:   { field: "youtube",   next: "ask_x_handle",  nextPrompt: "Say your X handle, or say skip." },
    ask_x_handle:  { field: "x_handle",  next: "ask_privacy_choice", nextPrompt: "Socials done. Want to set privacy now?" },
  };
  const socialConfirmMap: Partial<Record<Stage, { field: keyof Fields; ask: Stage; next: Stage; nextPrompt: string }>> = {
    confirm_instagram: { field: "instagram", ask: "ask_instagram", next: "ask_tiktok",        nextPrompt: "Instagram saved. Say your TikTok handle, or say skip." },
    confirm_tiktok:    { field: "tiktok",    ask: "ask_tiktok",    next: "ask_youtube",        nextPrompt: "TikTok saved. Say your YouTube link, or say skip." },
    confirm_youtube:   { field: "youtube",   ask: "ask_youtube",   next: "ask_x_handle",       nextPrompt: "YouTube saved. Say your X handle, or say skip." },
    confirm_x_handle:  { field: "x_handle",  ask: "ask_x_handle",  next: "ask_privacy_choice", nextPrompt: "X saved. Want to set privacy now?" },
  };

  const askSocial = socialAskMap[stage];
  if (askSocial) {
    if (skipRe.test(t))
      return { message: askSocial.nextPrompt, stage: askSocial.next, fields, pending: {} };
    const val = askSocial.field === "youtube" ? t.slice(0, 300) : cleanHandle(t);
    if (!val) return stay("I didn't catch that. Say the handle, or say skip.");
    const confirmStage = `confirm_${String(askSocial.field)}` as Stage;
    return { message: `I heard ${val}. Should I save it?`, stage: confirmStage, fields, pending: { field: String(askSocial.field), value: val } };
  }

  const confirmSocial = socialConfirmMap[stage];
  if (confirmSocial) {
    if (yesRe.test(t) && pending.value) {
      const f = { ...fields, [confirmSocial.field]: String(pending.value) };
      return { message: confirmSocial.nextPrompt, stage: confirmSocial.next, fields: f, pending: {} };
    }
    if (skipRe.test(t))
      return { message: confirmSocial.nextPrompt, stage: confirmSocial.next, fields, pending: {} };
    return { message: "No problem. Say it again, or say skip.", stage: confirmSocial.ask, fields, pending: {} };
  }

  // ── Privacy ────────────────────────────────────────────────────────────────

  if (stage === "ask_privacy_choice") {
    if (skipRe.test(t) || noRe.test(t))
      return { message: buildReview(fields), stage: "review", fields, pending: {} };
    return { message: "Do you want your profile public, private, or limited to Trey TV members?", stage: "ask_visibility", fields, pending: {} };
  }

  if (stage === "ask_visibility") {
    const vis = parseVisibility(t);
    if (!vis) return stay("Say public, private, or limited.");
    return { message: `I heard ${vis === "members_only" ? "limited to members" : vis}. Save that visibility?`, stage: "confirm_visibility", fields, pending: { field: "profile_visibility", value: vis } };
  }

  if (stage === "confirm_visibility") {
    if (yesRe.test(t) && pending.value) {
      const f = { ...fields, profile_visibility: String(pending.value) };
      return { message: "Visibility saved. Should your location and birthday show on your profile? Say both, location only, birthday only, or neither.", stage: "ask_privacy_details", fields: f, pending: {} };
    }
    if (skipRe.test(t))
      return { message: buildReview(fields), stage: "review", fields, pending: {} };
    return { message: "No problem. Say public, private, or limited.", stage: "ask_visibility", fields, pending: {} };
  }

  if (stage === "ask_privacy_details") {
    if (skipRe.test(t))
      return { message: buildReview(fields), stage: "review", fields, pending: {} };
    const l = t.toLowerCase();
    const showLoc  = l.includes("both") || l.includes("location");
    const showBday = l.includes("both") || l.includes("birthday");
    let f: Fields = { ...fields, show_location: showLoc, show_birthday: showBday };
    if (l.includes("top three") || l.includes("top 3")) {
      const show = !l.includes("hide") && !l.includes("no");
      f = { ...f, show_top_three: show, allow_top_three_adds: show };
    }
    return { message: buildReview(f), stage: "review", fields: f, pending: {} };
  }

  // ── Review + edit ──────────────────────────────────────────────────────────

  if (stage === "review") {
    if (yesRe.test(t))
      return { message: "Your Trey TV profile is ready. Creating your account now…", stage: "complete", fields, pending: {} };
    return { message: "What do you want to change? You can say display name, username, bio, location, birthday, categories, moods, frequency, profile type, socials, or privacy.", stage: "edit_field", fields, pending: {} };
  }

  if (stage === "edit_field") {
    const l = t.toLowerCase();
    if (l.includes("name") && !l.includes("user"))
      return { message: "What name should show on your profile?", stage: "ask_display_name", fields, pending: {} };
    if (l.includes("username") || (l.includes("user") && l.includes("name")))
      return { message: "What username do you want on Trey TV?", stage: "ask_username", fields, pending: {} };
    if (l.includes("bio"))
      return { message: "Say the new bio, or say skip.", stage: "ask_bio", fields, pending: {} };
    if (l.includes("location"))
      return { message: "Say the new location, or say skip.", stage: "ask_location", fields, pending: {} };
    if (l.includes("birthday") || l.includes("birth"))
      return { message: "Say your full birthday — month, day, and year. Or say skip.", stage: "ask_birthday", fields, pending: {} };
    if (l.includes("categor"))
      return { message: "Say the content categories, or say skip.", stage: "ask_categories", fields, pending: {} };
    if (l.includes("mood"))
      return { message: "Say the moods, or say skip.", stage: "ask_moods", fields, pending: {} };
    if (l.includes("frequency") || l.includes("often"))
      return { message: "Say daily, weekly, only major drops, or skip.", stage: "ask_frequency", fields, pending: {} };
    if (l.includes("type") || l.includes("fan"))
      return { message: "Say viewer, creator, supporter, superfan, Trizfit, or skip.", stage: "ask_fan_type", fields, pending: {} };
    if (l.includes("social") || l.includes("instagram") || l.includes("tiktok"))
      return { message: "Say your Instagram handle, or say skip.", stage: "ask_instagram", fields, pending: {} };
    if (l.includes("privacy") || l.includes("visib"))
      return { message: "Do you want your profile public, private, or limited to Trey TV members?", stage: "ask_visibility", fields, pending: {} };
    return { message: buildReview(fields), stage: "review", fields, pending: {} };
  }

  return { message: "Your profile is ready.", stage: "complete", fields, pending: {} };
}

// ─── Voice helpers ────────────────────────────────────────────────────────────

type VoiceStatus = "idle" | "connecting" | "connected" | "listening" | "speaking" | "error" | "unavailable";

function isVoiceActive(s: VoiceStatus) {
  return s === "connected" || s === "listening" || s === "speaking";
}

function playAssistantAudio(text: string) {
  treyITts({ data: { text } })
    .then((result) => {
      if (!result.audioBase64) return;
      const bytes = Uint8Array.from(atob(result.audioBase64), (c) => c.charCodeAt(0));
      const blob  = new Blob([bytes], { type: result.mimeType ?? "audio/wav" });
      const url   = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      audio.onerror  = () => URL.revokeObjectURL(url);
      audio.play().catch(() => URL.revokeObjectURL(url));
    })
    .catch(() => {});
}

// ─── Components ───────────────────────────────────────────────────────────────

function VoiceOnboarding() {
  return (
    <ConversationProvider>
      <VoiceOnboardingInner />
    </ConversationProvider>
  );
}

function VoiceOnboardingInner() {
  const nav = useNavigate();

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [phase,   setPhase]   = useState<"disclosure" | "conversation">("disclosure");
  const [stage,   setStage]   = useState<Stage>("ask_display_name");
  const [fields,  setFields]  = useState<Fields>({});
  const [pending, setPending] = useState<Pending>({});
  const [assistantMessage, setAssistantMessage] = useState(INITIAL_MESSAGE);
  const [draft,   setDraft]   = useState("");
  const [thinking, setThinking] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [error,   setError]   = useState<string | null>(null);

  const voiceStatusRef = useRef<VoiceStatus>("idle");
  const watchdogRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const processingRef  = useRef(false);

  const coreConfirmed = CORE_FIELDS.filter((f) => fields[f] !== undefined && fields[f] !== "").length;
  const progress      = (coreConfirmed / CORE_FIELDS.length) * 100;
  const isAtReview    = !!fields.display_name && !!fields.username;

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data }) => { if (data.session?.access_token) setAccessToken(data.session.access_token); })
      .catch(() => {});
  }, []);

  useEffect(() => { voiceStatusRef.current = voiceStatus; }, [voiceStatus]);

  const clearWatchdog = useCallback(() => {
    if (watchdogRef.current !== null) { clearTimeout(watchdogRef.current); watchdogRef.current = null; }
  }, []);

  // ── Username availability (server call) ────────────────────────────────────
  const checkUsername = useCallback(async (username: string) => {
    try {
      return await treyICheckUsername({ data: { username } });
    } catch {
      return { username, available: true, reason: "unchecked" };
    }
  }, []);

  // ── Core: advance the state machine ───────────────────────────────────────
  const advance = useCallback(async (input: string) => {
    const text = input.trim();
    if (!text || thinking || stage === "complete") return;
    if (processingRef.current) return;
    processingRef.current = true;
    setThinking(true);
    setError(null);

    try {
      const result = await clientTurn(stage, fields, pending, text, checkUsername);

      if (result.switchToManual) {
        nav({ to: "/login" });
        return;
      }

      setStage(result.stage);
      setFields(result.fields);
      setPending(result.pending);
      setAssistantMessage(result.message);

      if (!isVoiceActive(voiceStatusRef.current)) {
        playAssistantAudio(result.message);
      }

      if (result.stage !== "complete") return;

      // Persist all fields in sessionStorage as fallback
      try { sessionStorage.setItem("treytv_voice_profile", JSON.stringify(result.fields)); } catch {}

      const token = accessToken ?? await supabase.auth.getSession()
        .then(({ data }) => data.session?.access_token ?? null).catch(() => null);

      if (token) {
        try {
          await saveOnboardingProfile({ data: { accessToken: token, fields: result.fields } });
          const { publicProfileUid } = await finalizeOnboarding({ data: { accessToken: token } });
          window.location.href = `/u/${publicProfileUid}?tour=1`;
          return;
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Could not save your profile. Please try again.";
          setError(msg);
          setStage("review");
          setAssistantMessage(buildReview(result.fields));
          return;
        }
      }

      // Guest: trigger OAuth; callback will save the stored profile
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (oauthErr) {
        setError("Could not start Google sign-in. Please try again.");
        setStage("review");
        setAssistantMessage(buildReview(result.fields));
      }
    } finally {
      setThinking(false);
      processingRef.current = false;
    }
  }, [stage, fields, pending, thinking, accessToken, checkUsername, nav]);

  const submit = useCallback(async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    await advance(text);
  }, [draft, advance]);

  // ── ElevenLabs voice ───────────────────────────────────────────────────────
  const conversation = useConversation({
    onConnect:    () => { clearWatchdog(); setVoiceStatus("connected"); setError(null); },
    onDisconnect: (details) => {
      clearWatchdog();
      const reason = typeof details === "object" && details !== null && "reason" in details
        ? (details as { reason?: string }).reason : undefined;
      setVoiceStatus(reason === "error" ? "error" : "idle");
      if (reason === "error") setError("Voice disconnected. Type to continue or tap mic to retry.");
    },
    onError: () => { clearWatchdog(); setVoiceStatus("error"); setError("Voice disconnected. Type to continue."); },
    onModeChange: (mode) => {
      if (mode.mode === "listening") setVoiceStatus("listening");
      else if (mode.mode === "speaking") setVoiceStatus("speaking");
    },
    onMessage: (message) => {
      const payload = message as { message?: unknown; role?: unknown };
      const text = typeof payload.message === "string" ? payload.message.trim() : "";
      if (!text) return;
      if (payload.role !== "user") { setAssistantMessage(text); return; }
      void advance(text);
    },
  });

  useEffect(() => () => { clearWatchdog(); try { conversation.endSession(); } catch {} }, []);

  const startVoice = useCallback(async () => {
    setVoiceStatus("connecting");
    setError(null);
    try {
      const result = await treyIElevenLabsOnboardingSession().catch(() => null);
      if (!result?.ok) {
        setVoiceStatus("unavailable");
        setError(result?.message ?? "Voice unavailable. Type your answers below.");
        playAssistantAudio(INITIAL_MESSAGE);
        return;
      }
      watchdogRef.current = setTimeout(() => {
        try { conversation.endSession(); } catch {}
        setVoiceStatus("error");
        setError("Voice timed out. Type to continue or tap mic to retry.");
        playAssistantAudio(INITIAL_MESSAGE);
      }, 12_000);
      conversation.startSession({ signedUrl: result.signedUrl, connectionType: "websocket" });
    } catch {
      clearWatchdog();
      setVoiceStatus("error");
      setError("Voice unavailable. Type your answers below.");
      playAssistantAudio(INITIAL_MESSAGE);
    }
  }, [conversation, clearWatchdog]);

  const stopVoice = useCallback(() => {
    clearWatchdog();
    try { conversation.endSession(); } catch {}
    setVoiceStatus("idle");
    setError(null);
  }, [conversation, clearWatchdog]);

  const toggleMic = useCallback(() => {
    if (voiceStatus === "connecting") return;
    if (isVoiceActive(voiceStatus)) { stopVoice(); return; }
    void startVoice();
  }, [voiceStatus, startVoice, stopVoice]);

  const acceptDisclosure = useCallback(() => {
    setPhase("conversation");
    void startVoice();
  }, [startVoice]);

  const voiceActive = isVoiceActive(voiceStatus);
  const voiceBusy   = voiceStatus === "connecting";
  const voiceState: VoiceState =
    thinking || voiceBusy ? "processing"
    : voiceActive          ? "listening"
    : stage === "complete" ? "completed"
    : "idle";

  const micLabel         = voiceBusy ? "Connecting…" : voiceActive ? "Stop voice" : "Restart voice";
  const inputPlaceholder = voiceActive || voiceBusy ? "Listening… (or type)" : "Type your answer…";

  // ── Disclosure gate ────────────────────────────────────────────────────────
  if (phase === "disclosure") {
    return (
      <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center px-4">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[80vmin] rounded-full bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.45),oklch(0.7_0.25_340_/_0.4),oklch(0.65_0.22_300_/_0.45),oklch(0.82_0.15_215_/_0.4),oklch(0.82_0.16_85_/_0.45))] blur-3xl opacity-60 animate-conic-spin" />
          <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
        </div>
        <div className="relative w-full max-w-md animate-rise">
          <div className="liquid-glass neon-border rounded-3xl p-8 space-y-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="size-14 rounded-2xl conic-ring grid place-items-center bg-background">
                <Shield className="size-6 text-primary" />
              </div>
              <div className="text-[10px] tracking-[0.4em] text-primary">VOICE DISCLOSURE</div>
              <h2 className="text-2xl font-bold leading-snug">Before Trey-I Speaks</h2>
              <p className="text-sm text-muted-foreground">
                Trey-I uses AI voice technology to guide you through your profile setup.
                Please review what you're agreeing to before we begin.
              </p>
            </div>
            <ul className="space-y-3">
              {[
                "Your voice is recorded and processed to understand your responses.",
                "An AI — not a live person — will ask questions and confirm every answer before saving.",
                "Your profile information is saved only after you review and approve it.",
                "You can type instead of speaking at any time.",
              ].map((line) => (
                <li key={line} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle className="size-4 text-primary shrink-0 mt-0.5" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-muted-foreground/60 text-center leading-relaxed">
              By tapping <strong className="text-muted-foreground">Accept &amp; Start</strong> you consent to the above.
              This session is governed by our{" "}
              <a href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</a>.
            </p>
            <div className="flex gap-3">
              <Link
                to="/onboarding"
                className="flex-1 h-11 rounded-2xl liquid-glass border border-white/10 text-sm font-semibold grid place-items-center"
              >
                Decline
              </Link>
              <button
                onClick={acceptDisclosure}
                className="flex-1 h-11 rounded-2xl bg-primary text-primary-foreground text-sm font-bold glow-gold inline-flex items-center justify-center gap-2"
              >
                <Mic className="size-4" /> Accept &amp; Start
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Conversation UI ────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[80vmin] rounded-full bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.45),oklch(0.7_0.25_340_/_0.4),oklch(0.65_0.22_300_/_0.45),oklch(0.82_0.15_215_/_0.4),oklch(0.82_0.16_85_/_0.45))] blur-3xl opacity-60 animate-conic-spin" />
        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="relative max-w-[720px] mx-auto px-4 pt-6 pb-12">
        <div className="flex items-center justify-between">
          <Link to="/onboarding" className="size-9 grid place-items-center rounded-full liquid-glass border border-white/10">
            <ArrowLeft className="size-4" />
          </Link>
          <Logo className="h-7" />
          <div className="size-9" />
        </div>

        <header className="mt-6 text-center space-y-3 animate-rise">
          <div className="text-[10px] tracking-[0.4em] text-primary">PROFILE CONCIERGE</div>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
            Build Your Trey TV Profile{" "}
            <span className="text-gradient-prescribe">With Trey-I</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Trey-I guides you through setup one question at a time.
            Every answer is confirmed before it's saved. Say "finish" to skip to review, or "switch to manual" anytime.
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="inline-flex items-center gap-2 px-4 h-9 rounded-full text-sm font-semibold bg-primary text-primary-foreground glow-gold">
              <Mic className="size-4" /> Voice Setup
            </span>
            <button
              onClick={() => nav({ to: "/login" })}
              className="inline-flex items-center gap-2 px-4 h-9 rounded-full text-sm font-semibold liquid-glass border border-white/10"
            >
              <Keyboard className="size-4" /> Manual Form
            </button>
          </div>
        </header>

        <div className="mt-7">
          <div className="flex items-center justify-between mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
            <span>REQUIRED FIELDS · {coreConfirmed}/{CORE_FIELDS.length}</span>
            {isAtReview && stage !== "complete" && <span className="text-primary">Ready to finish</span>}
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[oklch(0.82_0.16_85)] via-[oklch(0.7_0.25_340)] to-[oklch(0.82_0.15_215)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <section className="mt-6 rounded-3xl liquid-glass neon-border p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute -top-24 -right-20 size-72 rounded-full bg-[oklch(0.7_0.25_340_/_0.25)] blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="text-[10px] tracking-[0.3em] text-primary mb-4">TREY-I VOICE MODULE</div>

            <div className="grid sm:grid-cols-[180px_1fr] gap-5 items-center">
              <div className="grid place-items-center">
                <VoiceOrb state={voiceState} size={160} />
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <div className="text-xs tracking-widest text-muted-foreground">TREY-I SAYS</div>
                <p className="text-xl sm:text-2xl font-bold leading-snug">{assistantMessage}</p>
                {error && (
                  <div className="text-sm text-red-400 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
                    {error}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 rounded-2xl liquid-glass border border-white/10 p-2.5 flex items-center gap-2 focus-within:border-primary/50 transition">
              <button
                onClick={toggleMic}
                disabled={voiceBusy}
                aria-label={micLabel}
                className={`size-10 rounded-full grid place-items-center shrink-0 transition ${
                  voiceActive ? "bg-primary text-primary-foreground glow-gold"
                  : voiceBusy ? "bg-primary/70 text-primary-foreground"
                  : "bg-white/5 text-muted-foreground"
                }`}
              >
                {voiceActive || voiceBusy ? <Mic className="size-4" /> : <MicOff className="size-4" />}
              </button>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !thinking && void submit()}
                placeholder={inputPlaceholder}
                disabled={thinking || stage === "complete"}
                className="flex-1 bg-transparent text-sm focus:outline-none px-1 h-10 disabled:opacity-50"
                autoFocus
              />
              <button
                onClick={() => void submit()}
                disabled={!draft.trim() || thinking || stage === "complete"}
                className={`inline-flex items-center gap-1 h-10 px-4 rounded-xl text-xs font-bold shrink-0 ${
                  draft.trim() && !thinking && stage !== "complete"
                    ? "bg-primary text-primary-foreground glow-gold"
                    : "bg-white/5 text-muted-foreground"
                }`}
              >
                {isAtReview && stage !== "complete" ? "Finish" : "Send"} <Send className="size-3" />
              </button>
            </div>

            <div className="mt-3 text-center text-[11px] text-muted-foreground">
              Say <strong>"finish"</strong> to skip to review · <strong>"switch to manual"</strong> to use a form instead
            </div>

            {/* Confirmed field chips */}
            {Object.entries(fields).filter(([, v]) => v !== undefined && v !== "" && !Array.isArray(v) && typeof v !== "boolean").length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {(Object.entries(fields) as [keyof Fields, unknown][]).map(([f, v]) => {
                  if (v === undefined || v === "" || Array.isArray(v) || typeof v === "boolean") return null;
                  const label = String(f).replace(/_/g, " ");
                  const display = String(v).slice(0, 30);
                  return (
                    <span key={f} className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full bg-primary/10 border border-primary/30 text-xs">
                      <Sparkles className="size-3 text-primary" />
                      <span className="text-muted-foreground capitalize">{label}:</span>
                      <span className="font-semibold max-w-[120px] truncate">{display}</span>
                    </span>
                  );
                })}
                {(Object.entries(fields) as [keyof Fields, unknown][]).map(([f, v]) => {
                  if (!Array.isArray(v) || !v.length) return null;
                  return (
                    <span key={f} className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full bg-primary/10 border border-primary/30 text-xs">
                      <Sparkles className="size-3 text-primary" />
                      <span className="text-muted-foreground capitalize">{String(f).replace(/_/g, " ")}:</span>
                      <span className="font-semibold max-w-[140px] truncate">{(v as string[]).join(", ")}</span>
                    </span>
                  );
                })}
              </div>
            )}

            <div className="mt-4 flex justify-center gap-1.5">
              {CORE_FIELDS.map((f) => (
                <span key={f} className={`h-1.5 rounded-full transition-all ${fields[f] ? "w-8 bg-primary" : "w-3 bg-white/10"}`} />
              ))}
            </div>
          </div>
        </section>

        <div className="mt-5 text-center text-xs text-muted-foreground">
          Prefer a form?{" "}
          <button onClick={() => nav({ to: "/login" })} className="text-primary font-semibold hover:underline inline-flex items-center gap-1">
            Switch to manual setup <ArrowRight className="size-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
