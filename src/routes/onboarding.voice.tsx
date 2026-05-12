import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle, CheckCircle2, Keyboard, Loader2, Mic, MicOff, Send, Shield, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { extractName, toTitleCase, cleanLocation, polishBio, polishAllFields } from "@/lib/trey-i/profile-polish";
import { type VoiceState } from "@/components/onboarding/VoiceOrb";
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
  const bio = f.bio ? polishBio(f.bio, { location: f.location ?? undefined }) : undefined;
  const parts = [
    `display name: ${f.display_name}`,
    `username: @${f.username}`,
  ];
  if (bio)              parts.push(`bio: ${bio}`);
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
    const raw = t.replace(/^my name is\s+/i, "").replace(/^call me\s+/i, "").trim();
    const name = toTitleCase(extractName(raw));
    if (name.length < 2) return stay("Say your profile name one more time for me.");
    return { message: `I heard "${name}". Is that right?`, stage: "confirm_display_name", fields, pending: { field: "display_name", value: name } };
  }

  if (stage === "confirm_display_name") {
    if (yesRe.test(t) && pending.value)
      return { message: "Saved. What username do you want on Trey TV?", stage: "ask_username", fields: { ...fields, display_name: String(pending.value) }, pending: {} };
    const repRaw = (noRe.test(t) ? t.replace(noRe, "") : t);
    const rep = toTitleCase(extractName(repRaw));
    if (rep.length >= 2)
      return { message: `Got it. I heard "${rep}". Is that right?`, stage: "confirm_display_name", fields, pending: { field: "display_name", value: rep } };
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
    if (yesRe.test(t) && pending.value) {
      const rawBio = String(pending.value).trim();
      const cleanedBio = rawBio.charAt(0).toUpperCase() + rawBio.slice(1) + (!/[.!?]$/.test(rawBio) ? "." : "");
      return { message: "Bio saved. Want to add your location? Say it now, or say skip.", stage: "ask_location", fields: { ...fields, bio: cleanedBio }, pending: {} };
    }
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
    const loc = cleanLocation(t);
    if (loc.length < 2) return stay("Say your city or location, or say skip.");
    return { message: `I heard "${loc}". Should I save that?`, stage: "confirm_location", fields, pending: { field: "location", value: loc } };
  }

  if (stage === "confirm_location") {
    if (yesRe.test(t) && pending.value) {
      const f = { ...fields, location: String(pending.value) };
      return { message: afterLocationMsg(), stage: "optional_offer", fields: f, pending: {} };
    }
    if (skipRe.test(t))
      return { message: afterLocationMsg(), stage: "optional_offer", fields, pending: {} };
    const loc = cleanLocation((noRe.test(t) ? t.replace(noRe, "") : t));
    if (loc.length >= 2) return { message: `Got it, "${loc}". Should I save that?`, stage: "confirm_location", fields, pending: { field: "location", value: loc } };
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

// ─── Setup path ───────────────────────────────────────────────────────────────

const SETUP_STEPS: Array<{ key: keyof Fields; label: string }> = [
  { key: "display_name", label: "Name" },
  { key: "username",     label: "Handle" },
  { key: "date_of_birth", label: "Birth" },
  { key: "location",     label: "City" },
  { key: "favorite_categories", label: "Taste" },
];

function stepDone(fields: Fields, key: keyof Fields): boolean {
  const v = fields[key];
  if (v === undefined || v === "") return false;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

// ─── Plasma Orb ───────────────────────────────────────────────────────────────
// Replaces the mic icon with a full SVG energy-sphere that reacts to voice state.

const ORB_C = 120;  // center x/y
const ORB_R = 100;  // sphere radius
const ORB_W = 240;  // svg width
const ORB_H = 288;  // svg height (includes ground reflection)

// Audio-bar layout
const BARS      = 20;
const BAR_W     = 2.2;
const BAR_GAP   = 3.6;
const BARS_SPAN = BARS * (BAR_W + BAR_GAP) - BAR_GAP;

// Per-bar config: animation name, duration, delay
const BAR_ANIMS = ["orb-bar-a","orb-bar-b","orb-bar-c","orb-bar-b","orb-bar-a"] as const;
const BAR_DURS  = [0.55, 0.72, 0.82, 0.65, 0.60];

// Ring config: [rx ratio, ry ratio, tiltDeg, durationBase, direction]
const RINGS = [
  [0.91, 0.225, -26, 7.5, "orb-ring-cw" ],
  [0.78, 0.200,  17, 5.2, "orb-ring-cw" ],
  [0.65, 0.180,  -9, 9.0, "orb-ring-ccw"],
  [0.52, 0.160,  33, 4.0, "orb-ring-cw" ],
  [0.38, 0.130, -43, 3.4, "orb-ring-ccw"],
] as const;

// Rim spark positions (degrees)
const SPARKS = [0, 72, 144, 216, 288];
const SPARK_COLORS = ["#35E6FF","#FFC85A","#35E6FF","#9B7FFF","#FFC85A"];

function GalaxyOrb({ state }: { state: VoiceState }) {
  const isActive     = state === "listening" || state === "speaking";
  const isProcessing = state === "processing";
  const isDone       = state === "completed";

  // Rings spin faster when voice is active
  const speed = isActive ? 0.52 : 1;

  // Gradient IDs — defined once in <defs>
  const C = ORB_C;
  const R = ORB_R;

  return (
    <div className="relative select-none" style={{ width: ORB_W, height: ORB_H }}>
      <svg
        width={ORB_W}
        height={ORB_H}
        viewBox={`0 0 ${ORB_W} ${ORB_H}`}
        aria-hidden
        style={{ overflow: "visible" }}
      >
        <defs>
          {/* Sphere interior fill */}
          <radialGradient id="pOrbBg" cx="37%" cy="31%" r="66%">
            <stop offset="0%"   stopColor="#192860" />
            <stop offset="38%"  stopColor="#0d1835" />
            <stop offset="72%"  stopColor="#070e22" />
            <stop offset="100%" stopColor="#030810" />
          </radialGradient>

          {/* Ring stroke gradients */}
          <linearGradient id="pGold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#FFC85A" stopOpacity="0" />
            <stop offset="22%"  stopColor="#FFC85A" stopOpacity="0.88" />
            <stop offset="50%"  stopColor="#FFE490" stopOpacity="1" />
            <stop offset="78%"  stopColor="#FFC85A" stopOpacity="0.88" />
            <stop offset="100%" stopColor="#FFC85A" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="pBlue" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#35E6FF" stopOpacity="0" />
            <stop offset="22%"  stopColor="#35E6FF" stopOpacity="0.85" />
            <stop offset="50%"  stopColor="#88EEFF" stopOpacity="1" />
            <stop offset="78%"  stopColor="#35E6FF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#35E6FF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="pPurple" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#7A5CFF" stopOpacity="0" />
            <stop offset="22%"  stopColor="#7A5CFF" stopOpacity="0.85" />
            <stop offset="50%"  stopColor="#A888FF" stopOpacity="1" />
            <stop offset="78%"  stopColor="#7A5CFF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#7A5CFF" stopOpacity="0" />
          </linearGradient>

          {/* Center core */}
          <radialGradient id="pCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#FFFFFF" />
            <stop offset="22%"  stopColor="#B8F4FF" stopOpacity="0.96" />
            <stop offset="58%"  stopColor="#35E6FF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#35E6FF" stopOpacity="0" />
          </radialGradient>

          {/* Outer sphere glow ring */}
          <radialGradient id="pRimGlow" cx="50%" cy="50%" r="50%">
            <stop offset="55%" stopColor="transparent" />
            <stop offset="100%" stopColor="#1060CC" stopOpacity="0.22" />
          </radialGradient>

          {/* SVG blur / glow filters */}
          <filter id="pGfSoft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.6" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="pGfStrong" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="pGfBloom" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="9" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          {/* Clip to sphere boundary */}
          <clipPath id="pOrbClip">
            <circle cx={C} cy={C} r={R} />
          </clipPath>
        </defs>

        {/* ── Outer halo rings ── */}
        <circle cx={C} cy={C} r={R + 26} fill="none" stroke="#1E4090" strokeWidth="0.55" opacity="0.48" />
        <circle cx={C} cy={C} r={R + 44} fill="none" stroke="#142870" strokeWidth="0.38" opacity="0.30" />
        <circle cx={C} cy={C} r={R + 62} fill="none" stroke="#0e1f52" strokeWidth="0.25" opacity="0.18" />

        {/* ── Sphere outer glow ── */}
        <circle cx={C} cy={C} r={R + 8}  fill="url(#pRimGlow)" />
        <circle cx={C} cy={C} r={R + 1}  fill="none" stroke="#35E6FF"
          strokeWidth="1.4" opacity={isActive ? 0.55 : 0.28} filter="url(#pGfSoft)" />

        {/* ── Active bloom ── */}
        {isActive && (
          <circle cx={C} cy={C} r={R + 14} fill="none" stroke="#35E6FF"
            strokeWidth="1" opacity="0.18" filter="url(#pGfBloom)" />
        )}

        {/* ── Main sphere fill ── */}
        <circle cx={C} cy={C} r={R} fill="url(#pOrbBg)" />

        {/* ── Inner clipped content ── */}
        <g clipPath="url(#pOrbClip)">

          {/* Swirling energy rings */}
          {RINGS.map(([rxR, ryR, tilt, durBase, animName], i) => {
            const gradId = i % 3 === 0 ? "url(#pGold)" : i % 3 === 1 ? "url(#pBlue)" : "url(#pPurple)";
            const sw = i < 2 ? 2.4 : i < 4 ? 2.0 : 1.5;
            return (
              <g
                key={i}
                style={{
                  transformOrigin: `${C}px ${C}px`,
                  animationName: animName,
                  animationDuration: `${durBase * speed}s`,
                  animationTimingFunction: "linear",
                  animationIterationCount: "infinite",
                }}
              >
                <ellipse
                  cx={C} cy={C}
                  rx={R * rxR} ry={R * ryR}
                  fill="none"
                  stroke={gradId}
                  strokeWidth={sw}
                  transform={`rotate(${tilt} ${C} ${C})`}
                  filter="url(#pGfSoft)"
                />
              </g>
            );
          })}

          {/* ── Audio bars (Siri-style wave) — active only ── */}
          {isActive && Array.from({ length: BARS }).map((_, i) => {
            const bx = C - BARS_SPAN / 2 + i * (BAR_W + BAR_GAP);
            const color = i % 3 === 0 ? "#FFC85A" : i % 3 === 1 ? "#35E6FF" : "#A080FF";
            const anim  = BAR_ANIMS[i % BAR_ANIMS.length];
            const dur   = BAR_DURS[i % BAR_DURS.length];
            const delay = (i * 0.045) % 0.54;
            return (
              <rect
                key={i}
                x={bx} y={C - 1}
                width={BAR_W} height={2}
                rx="1"
                fill={color}
                opacity="0.92"
                style={{
                  transformOrigin: `${bx + BAR_W / 2}px ${C}px`,
                  animationName: anim,
                  animationDuration: `${dur}s`,
                  animationDelay: `${delay}s`,
                  animationTimingFunction: "ease-in-out",
                  animationIterationCount: "infinite",
                } as React.CSSProperties}
              />
            );
          })}

          {/* ── Center star core ── */}
          <circle
            cx={C} cy={C} r={16}
            fill="url(#pCore)"
            filter="url(#pGfStrong)"
            style={{
              transformOrigin: `${C}px ${C}px`,
              animationName: "orb-core-breathe",
              animationDuration: isActive ? "1.3s" : "2.8s",
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
            } as React.CSSProperties}
          />

          {/* ── Top specular highlight ── */}
          <ellipse
            cx={C - 18} cy={C - R * 0.44}
            rx={R * 0.28} ry={R * 0.1}
            fill="white" opacity="0.07"
          />
        </g>

        {/* ── Glass sphere edge ── */}
        <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1.5" />

        {/* ── Rotating gold rim band ── */}
        <g style={{
          transformOrigin: `${C}px ${C}px`,
          animationName: "orb-ring-cw",
          animationDuration: `${15 * speed}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
        }}>
          <path
            d={`M ${C - R} ${C} A ${R} ${R} 0 0 1 ${C + R} ${C}`}
            fill="none"
            stroke="url(#pGold)"
            strokeWidth="1.8"
            opacity="0.6"
            filter="url(#pGfSoft)"
          />
        </g>

        {/* ── Rim spark dots ── */}
        {SPARKS.map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const px = C + (R - 1) * Math.cos(rad);
          const py = C + (R - 1) * Math.sin(rad);
          return (
            <circle
              key={i}
              cx={px} cy={py} r="2.5"
              fill={SPARK_COLORS[i]}
              opacity="0.65"
              filter="url(#pGfSoft)"
              style={{ animation: `orb-rim-dot ${1.5 + i * 0.35}s ease-in-out ${i * 0.45}s infinite` }}
            />
          );
        })}

        {/* ── Completed state overlay ── */}
        {isDone && (
          <>
            <circle cx={C} cy={C} r={R} fill="none" stroke="#4ADE80" strokeWidth="2" opacity="0.6" filter="url(#pGfSoft)" />
            <circle cx={C} cy={C} r={18} fill="#22C55E" opacity="0.92" filter="url(#pGfStrong)" />
            <path
              d={`M ${C - 9} ${C} L ${C - 2} ${C + 7} L ${C + 9} ${C - 7}`}
              fill="none" stroke="white" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
            />
          </>
        )}

        {/* ── Processing spinner dot ── */}
        {isProcessing && (
          <g style={{
            transformOrigin: `${C}px ${C}px`,
            animationName: "orb-ring-cw",
            animationDuration: "0.9s",
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
          }}>
            <circle cx={C} cy={C - R + 9} r="5.5" fill="#35E6FF" opacity="0.92" filter="url(#pGfSoft)" />
          </g>
        )}

        {/* ── Ground reflection rings ── */}
        <ellipse cx={C} cy={C + R + 12} rx={R * 0.7}  ry="5"   fill="none" stroke="#35E6FF" strokeWidth="0.7" opacity="0.28" />
        <ellipse cx={C} cy={C + R + 21} rx={R * 0.50} ry="3.5" fill="none" stroke="#FFC85A" strokeWidth="0.5" opacity="0.18" />
        <ellipse cx={C} cy={C + R + 29} rx={R * 0.32} ry="2.5" fill="none" stroke="#35E6FF" strokeWidth="0.4" opacity="0.12" />
        <circle  cx={C} cy={C + R + 36} r="3.5"
          fill="#35E6FF" opacity="0.28" filter="url(#pGfStrong)"
        />

        {/* ── Scattered star particles (outside sphere) ── */}
        {([
          [C - 82, C - 68, 2.2, "2.1s", "0s"   ],
          [C + 70, C - 55, 1.5, "1.7s", "0.6s"  ],
          [C - 95, C + 10, 1.8, "2.4s", "1.1s"  ],
          [C + 88, C + 25, 1.5, "1.9s", "0.3s"  ],
          [C + 58, C + 68, 2.0, "2.2s", "0.9s"  ],
          [C - 65, C + 72, 1.5, "1.8s", "1.4s"  ],
        ] as [number,number,number,string,string][]).map(([px, py, r, dur, del], i) => (
          <circle
            key={i}
            cx={px} cy={py} r={r}
            fill="white"
            style={{ animation: `trey-star-twinkle ${dur} ease-in-out ${del} infinite` }}
          />
        ))}
      </svg>
    </div>
  );
}

// ─── Galaxy backdrop ──────────────────────────────────────────────────────────

function GalaxyBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 22%, oklch(0.2 0.07 290 / 0.78) 0%, oklch(0.1 0.03 270 / 0.88) 50%, #05060B 100%)" }}
      />
      <div className="absolute rounded-full" style={{ top: "-20%", left: "-10%", width: "70vw", height: "70vw", background: "radial-gradient(circle, oklch(0.65 0.22 300 / 0.14), transparent 62%)", filter: "blur(60px)" }} />
      <div className="absolute rounded-full" style={{ top: "5%", right: "-15%", width: "60vw", height: "60vw", background: "radial-gradient(circle, oklch(0.7 0.25 340 / 0.11), transparent 62%)", filter: "blur(80px)" }} />
      <div className="absolute rounded-full" style={{ bottom: "0", left: "15%", width: "55vw", height: "38vw", background: "radial-gradient(circle, oklch(0.82 0.15 215 / 0.08), transparent 65%)", filter: "blur(70px)" }} />
    </div>
  );
}

// ─── Review panel ─────────────────────────────────────────────────────────────
// Shows polished profile copy at the review stage. Manual edits here win over
// auto-polished values — they go into fieldOverrides and are spread on top at save time.

function ReviewPanel({
  fields,
  polishedBio,
  overrides,
  onOverride,
  onConfirm,
}: {
  fields: Fields;
  polishedBio: string;
  overrides: Partial<Fields>;
  onOverride: (key: keyof Fields, value: unknown) => void;
  onConfirm: () => void;
}) {
  const name     = String(overrides.display_name ?? fields.display_name ?? "");
  const handle   = String(overrides.username     ?? fields.username     ?? "");
  const bioVal   = String(overrides.bio          ?? (polishedBio || fields.bio) ?? "");
  const locVal   = String(overrides.location     ?? fields.location     ?? "");

  return (
    <div className="relative mx-4 mb-3 rounded-2xl liquid-glass border border-primary/25 overflow-hidden" style={{ zIndex: 1 }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="text-[9px] tracking-[0.35em] text-primary font-bold">YOUR PROFILE PREVIEW</div>
        <span className="text-[10px] text-muted-foreground/50">Tap any field to edit</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[9px] tracking-[0.2em] text-muted-foreground/50 mb-1 block">NAME</label>
            <input
              value={name}
              onChange={(e) => onOverride("display_name", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 h-9 text-sm font-semibold focus:outline-none focus:border-primary/40 transition"
            />
          </div>
          <div>
            <label className="text-[9px] tracking-[0.2em] text-muted-foreground/50 mb-1 block">HANDLE</label>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl h-9 px-2 focus-within:border-primary/40 transition">
              <span className="text-muted-foreground text-sm">@</span>
              <input
                value={handle}
                onChange={(e) =>
                  onOverride("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 30))
                }
                className="flex-1 bg-transparent text-sm font-semibold focus:outline-none ml-1"
              />
            </div>
          </div>
        </div>
        {(polishedBio || fields.bio) && (
          <div>
            <label className="text-[9px] tracking-[0.2em] text-muted-foreground/50 mb-1 block">BIO</label>
            <textarea
              value={bioVal}
              onChange={(e) => onOverride("bio", e.target.value)}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-primary/40 transition leading-relaxed"
            />
          </div>
        )}
        {fields.location && (
          <div>
            <label className="text-[9px] tracking-[0.2em] text-muted-foreground/50 mb-1 block">LOCATION</label>
            <input
              value={locVal}
              onChange={(e) => onOverride("location", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 h-9 text-sm focus:outline-none focus:border-primary/40 transition"
            />
          </div>
        )}
        <button
          onClick={onConfirm}
          className="w-full h-11 rounded-2xl bg-primary text-primary-foreground text-sm font-bold glow-gold flex items-center justify-center gap-2 mt-1"
        >
          <CheckCircle2 className="size-4" /> Looks Good — Save Profile
        </button>
      </div>
    </div>
  );
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
  // Manual edits made in the review panel — these win over auto-polished values at save time
  const [fieldOverrides, setFieldOverrides] = useState<Partial<Fields>>({});

  const voiceStatusRef = useRef<VoiceStatus>("idle");
  const watchdogRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const processingRef  = useRef(false);

  const coreConfirmed = CORE_FIELDS.filter((f) => fields[f] !== undefined && fields[f] !== "").length;
  const isAtReview    = !!fields.display_name && !!fields.username;

  // Context-polished bio — available once location is captured, shown on review panel
  const polishedBio = useMemo(
    () => polishBio(fields.bio ?? "", { location: fields.location ?? undefined }),
    [fields.bio, fields.location],
  );

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

      // Build final save payload: auto-polish raw captures, then layer manual review edits on top
      const finalFields = {
        ...polishAllFields(result.fields as Record<string, unknown>),
        ...fieldOverrides,
      };

      // Persist polished fields in sessionStorage as fallback for OAuth callback
      try { sessionStorage.setItem("treytv_voice_profile", JSON.stringify(finalFields)); } catch {}

      const token = accessToken ?? await supabase.auth.getSession()
        .then(({ data }) => data.session?.access_token ?? null).catch(() => null);

      if (token) {
        try {
          await saveOnboardingProfile({ data: { accessToken: token, fields: finalFields } });
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
  }, [stage, fields, pending, thinking, accessToken, checkUsername, nav, fieldOverrides]);

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
  const inputPlaceholder = voiceActive || voiceBusy ? "Listening… or type" : "Type your answer…";

  // ── Disclosure gate ────────────────────────────────────────────────────────
  if (phase === "disclosure") {
    return (
      <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center px-4" style={{ background: "#05060B" }}>
        <GalaxyBackdrop />
        <div className="relative w-full max-w-md animate-rise" style={{ zIndex: 1 }}>
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
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col" style={{ background: "#05060B" }}>
      <GalaxyBackdrop />

      {/* Top bar */}
      <div className="relative flex items-center justify-between px-4 pt-6 pb-2 shrink-0" style={{ zIndex: 1 }}>
        <Link to="/onboarding" className="size-9 grid place-items-center rounded-full liquid-glass border border-white/10">
          <ArrowLeft className="size-4" />
        </Link>
        <Logo className="h-7" />
        <div className="size-9" />
      </div>

      {/* Header */}
      <header className="relative text-center px-4 pt-1 pb-2 shrink-0" style={{ zIndex: 1 }}>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[oklch(0.82_0.16_85_/_0.35)] bg-[oklch(0.82_0.16_85_/_0.08)] mb-2">
          <Sparkles className="size-3 text-primary" />
          <span className="text-[9px] tracking-[0.3em] text-primary font-bold">PROFILE CONCIERGE</span>
        </div>
        <h1 className="text-2xl font-extrabold leading-tight">
          Build Your Trey TV Profile<br />
          <span className="text-gradient-prescribe">with Trey-I</span>
        </h1>
      </header>

      {/* Voice / Manual toggle */}
      <div className="relative flex items-center justify-center gap-2 px-4 py-2 shrink-0" style={{ zIndex: 1 }}>
        <span className="inline-flex items-center gap-1.5 px-5 h-9 rounded-full text-sm font-bold bg-primary text-primary-foreground glow-gold">
          <Mic className="size-3.5" /> Voice Setup
        </span>
        <button
          onClick={() => nav({ to: "/login" })}
          className="inline-flex items-center gap-1.5 px-5 h-9 rounded-full text-sm font-medium liquid-glass border border-white/10 text-muted-foreground hover:text-foreground transition"
        >
          <Keyboard className="size-3.5" /> Manual Form
        </button>
      </div>

      {/* Galaxy Orb hero */}
      <div className="relative flex justify-center items-center py-5 shrink-0" style={{ zIndex: 1 }}>
        <GalaxyOrb state={voiceState} />
      </div>

      {/* TREY-I SAYS card */}
      <div className="relative mx-4 mb-3 rounded-2xl liquid-glass border border-white/10 p-4 shrink-0" style={{ zIndex: 1 }}>
        <div className="text-[9px] tracking-[0.35em] text-primary font-bold mb-1.5">TREY-I SAYS</div>
        <p className="text-base font-semibold leading-snug">{assistantMessage}</p>
        {error && (
          <div className="mt-2 text-xs text-red-400 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
            {error}
          </div>
        )}
      </div>

      {/* Review panel — appears at review stage so the user can see and edit polished fields */}
      {stage === "review" && (
        <ReviewPanel
          fields={fields}
          polishedBio={polishedBio}
          overrides={fieldOverrides}
          onOverride={(key, value) => setFieldOverrides((prev) => ({ ...prev, [key]: value }))}
          onConfirm={() => void advance("yes")}
        />
      )}

      {/* Input bar */}
      <div
        className="relative mx-4 mb-3 rounded-2xl liquid-glass border border-white/10 p-2 flex items-center gap-2 focus-within:border-primary/40 transition shrink-0"
        style={{ zIndex: 1 }}
      >
        <button
          onClick={toggleMic}
          disabled={voiceBusy}
          aria-label={micLabel}
          className={`size-10 rounded-full grid place-items-center shrink-0 transition ${
            voiceActive
              ? "bg-primary text-primary-foreground glow-gold"
              : voiceBusy
              ? "bg-primary/60 text-primary-foreground"
              : "bg-white/5 text-muted-foreground hover:bg-white/10"
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
          className="flex-1 bg-transparent text-sm focus:outline-none px-1 h-10 placeholder:text-muted-foreground/40 disabled:opacity-50"
          autoFocus
        />
        <button
          onClick={() => void submit()}
          disabled={!draft.trim() || thinking || stage === "complete"}
          className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-bold shrink-0 transition ${
            draft.trim() && !thinking && stage !== "complete"
              ? "bg-primary text-primary-foreground glow-gold"
              : "bg-white/5 text-muted-foreground"
          }`}
        >
          {isAtReview && stage !== "complete" ? "Finish" : "Send"} <Send className="size-3" />
        </button>
      </div>

      {/* Setup path progress */}
      <div className="relative mx-4 pb-8 shrink-0" style={{ zIndex: 1 }}>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[9px] tracking-[0.22em] text-muted-foreground/50 font-medium">SETUP PATH</span>
          <span className="text-[9px] tracking-[0.15em] text-muted-foreground/50">
            {SETUP_STEPS.filter((s) => stepDone(fields, s.key)).length}/{SETUP_STEPS.length}
          </span>
        </div>
        <div className="flex items-center">
          {SETUP_STEPS.map((step, i) => {
            const done = stepDone(fields, step.key);
            return (
              <Fragment key={step.key}>
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`size-6 rounded-full grid place-items-center border-2 transition-all duration-500 ${
                    done
                      ? "bg-primary border-primary shadow-[0_0_12px_oklch(0.82_0.16_85_/_0.65)]"
                      : "bg-white/5 border-white/15"
                  }`}>
                    {done && <CheckCircle2 className="size-3.5 text-primary-foreground" />}
                  </div>
                  <span className={`text-[9px] tracking-wider font-medium transition-colors duration-500 ${done ? "text-primary" : "text-muted-foreground/35"}`}>
                    {step.label}
                  </span>
                </div>
                {i < SETUP_STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-1 mb-4 transition-all duration-500 ${done ? "bg-primary/50" : "bg-white/10"}`} />
                )}
              </Fragment>
            );
          })}
        </div>

        {/* Core field progress */}
        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-white/8 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[oklch(0.82_0.16_85)] via-[oklch(0.7_0.25_340)] to-[oklch(0.82_0.15_215)] transition-all duration-500"
              style={{ width: `${(coreConfirmed / CORE_FIELDS.length) * 100}%` }}
            />
          </div>
          <span className="text-[9px] text-muted-foreground/50 shrink-0">{coreConfirmed}/{CORE_FIELDS.length} required</span>
        </div>
      </div>
    </div>
  );
}
