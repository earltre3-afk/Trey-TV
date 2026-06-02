import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { C as ConversationProvider, u as useConversation } from "../_libs/elevenlabs__react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { L as Logo } from "./Logo-D0JEzEf4.mjs";
import { K as treyICheckUsername, L as saveOnboardingProfile, M as finalizeOnboarding, a as createServerFn, u as createSsrRpc } from "./index.mjs";
import { s as supabase } from "./router-BtgGywEC.mjs";
import "../_libs/sonner.mjs";
import "../_libs/react-dom.mjs";
import { p as Shield, bp as CircleCheckBig, e as Mic, A as ArrowLeft, S as Sparkles, b_ as Keyboard, bQ as MicOff, f as Send, ax as CircleCheck } from "../_libs/lucide-react.mjs";
import "../_libs/livekit-client.mjs";
import "../_libs/elevenlabs__client.mjs";
import "../_libs/elevenlabs__types.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "./trey-tv-logo-CG7PjBoN.mjs";
import "node:crypto";
import "node:async_hooks";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/livekit__protocol.mjs";
import "../_libs/bufbuild__protobuf.mjs";
import "../_libs/livekit-server-sdk.mjs";
import "../_libs/jose.mjs";
import "node:buffer";
import "node:util";
import "node:fs";
import "node:path";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/zod.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
function extractName(utterance) {
  return utterance.replace(/,?\s*(?:it'?s\s+)?spelled?\s+[A-Za-z](?:-[A-Za-z]){2,}/gi, "").replace(/,?\s*\b[A-Za-z](?:-[A-Za-z]){2,}\b/g, "").replace(/^(?:i mean|actually|no[,\s]|it'?s|the name is|my name is|call me|i'?m|i am|it should be|i meant)\s+/i, "").replace(/,?\s*(?:not|instead of|rather than)\s+\S+$/i, "").replace(/^[,.\s]+/, "").trim().slice(0, 50);
}
function toTitleCase(str) {
  return str.toLowerCase().split(/\s+/).filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
function cleanLocation(raw) {
  return raw.replace(/^(?:i(?:'m| am) from|i live in|from|in|it'?s|located in|out of)\s+/i, "").replace(/[!?]+$/, "").split(/\s+/).filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ").trim().slice(0, 60);
}
function polishBio(raw, ctx) {
  if (!raw || raw.length < 3) return raw;
  let bio = raw.trim();
  bio = bio.charAt(0).toUpperCase() + bio.slice(1);
  if (!/[.!?]$/.test(bio)) bio += ".";
  const loc = ctx.location;
  if (loc) {
    const bioLower = bio.toLowerCase();
    const locLower = loc.toLowerCase();
    if (!bioLower.includes(locLower)) {
      bio = bio.replace(
        /\b(riding|ride)\s+((?:my\s+)?bikes?|bicycles?)\b/gi,
        `$1 my bike through ${loc}`
      );
      bio = bio.replace(
        /\b(hiking|running|jogging|skating|skateboarding|walking)\b(?!\s+(?:in|around|through|near|by)\s)/gi,
        `$1 around ${loc}`
      );
    }
  }
  return bio;
}
function polishInterestList(items) {
  return items.map((item) => {
    const t = item.trim();
    return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
  });
}
function polishAllFields(fields) {
  const ctx = {
    display_name: typeof fields.display_name === "string" ? fields.display_name : void 0,
    location: typeof fields.location === "string" ? fields.location : void 0,
    favorite_categories: Array.isArray(fields.favorite_categories) ? fields.favorite_categories : void 0
  };
  const result = { ...fields };
  if (typeof fields.display_name === "string")
    result.display_name = toTitleCase(extractName(fields.display_name));
  if (typeof fields.location === "string")
    result.location = cleanLocation(fields.location);
  if (typeof fields.bio === "string")
    result.bio = polishBio(fields.bio, ctx);
  if (Array.isArray(fields.favorite_categories))
    result.favorite_categories = polishInterestList(fields.favorite_categories);
  if (Array.isArray(fields.favorite_moods))
    result.favorite_moods = polishInterestList(fields.favorite_moods);
  return result;
}
function validateElevenLabsSessionInput(input) {
  return {
    accessToken: typeof input?.accessToken === "string" ? input.accessToken : ""
  };
}
const treyIElevenLabsOnboardingSession = createServerFn({
  method: "GET"
}).handler(createSsrRpc("32425a5c968d0592c182959d85048eed9e3e9223581aee743a986a97cae431e6"));
createServerFn({
  method: "POST"
}).inputValidator(validateElevenLabsSessionInput).handler(createSsrRpc("dd1287e471e65d20cbc5c4dc956ad27b11fa01674c048d20656dfe3221e0c3e9"));
const validateTtsInput = (input) => ({
  text: typeof input?.text === "string" ? input.text : ""
});
const treyITts = createServerFn({
  method: "POST"
}).inputValidator(validateTtsInput).handler(createSsrRpc("a521bd0c0f9b13430bd87e32d02f2b3fa1fca84e9b3342ce415da37ebfecf808"));
const CORE_FIELDS = ["display_name", "username", "bio", "location"];
const INITIAL_MESSAGE = "Hey — I'm Trey-I. What should the world call you?";
const CATEGORY_OPTIONS = ["Music", "Shows", "Behind the scenes", "Comedy", "Motivation", "Creator content", "Exclusive drops"];
const MOOD_OPTIONS = ["Funny", "Deep", "Raw", "Luxury", "Reality-style", "Inspirational", "Wild/uncut"];
const yesRe = /^(yes|yeah|yep|correct|right|that'?s right|looks good|sounds good|save it|confirm|confirmed|sure|ok|okay|please do)$/i;
const noRe = /^(no|nope|nah|not quite|wrong|change it|try again)/i;
const skipRe = /^(skip|skip it|pass|no thanks|not now|later|next)$/i;
const finishRe = /^(finish|done|complete|wrap up|that'?s all|all set)$/i;
const manualRe = /^(manual|switch to manual|stop|cancel|i want manual|do it manually)$/i;
function normalizeUsername(v) {
  return v.toLowerCase().replace(/^@/, "").replace(/\s+underscore\s+/g, "_").replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "").slice(0, 30);
}
function cleanHandle(v) {
  return v.replace(/^@/, "").replace(/\s+/g, "").replace(/[^\w.-]/g, "").slice(0, 80);
}
function parseList(input, options) {
  const lower = input.toLowerCase();
  const matched = options.filter((o) => lower.includes(o.toLowerCase()));
  if (matched.length) return matched;
  return input.split(/,|\band\b/i).map((s) => s.trim()).filter(Boolean).slice(0, 5);
}
function summarizeList(v) {
  return Array.isArray(v) ? v.join(", ") : String(v ?? "");
}
function parseFrequency(input) {
  const l = input.toLowerCase();
  if (l.includes("daily") || l.includes("every day")) return "daily";
  if (l.includes("weekly") || l.includes("week")) return "weekly";
  if (l.includes("drop") || l.includes("major")) return "only_drops";
  return "";
}
function parseFanType(input) {
  const l = input.toLowerCase();
  if (l.includes("trizfit")) return "trizfit";
  if (l.includes("creator") || l.includes("artist") || l.includes("make")) return "creator";
  if (l.includes("support")) return "supporter";
  if (l.includes("super") || l.includes("fan")) return "superfan";
  if (l.includes("viewer") || l.includes("watch")) return "viewer";
  return "";
}
function parseVisibility(input) {
  const l = input.toLowerCase();
  if (l.includes("private")) return "private";
  if (l.includes("member") || l.includes("limited")) return "members_only";
  if (l.includes("public")) return "public";
  return "";
}
function parseDateOfBirth(input) {
  const s = input.trim().slice(0, 40);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const mdy = s.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b/);
  if (mdy) return `${mdy[3]}-${mdy[1].padStart(2, "0")}-${mdy[2].padStart(2, "0")}`;
  const d = new Date(s);
  if (!Number.isNaN(d.getTime()) && /\d{4}/.test(s)) return d.toISOString().slice(0, 10);
  return "";
}
function buildReview(f) {
  const bio = f.bio ? polishBio(f.bio, {
    location: f.location ?? void 0
  }) : void 0;
  const parts = [`display name: ${f.display_name}`, `username: @${f.username}`];
  if (bio) parts.push(`bio: ${bio}`);
  if (f.location) parts.push(`location: ${f.location}`);
  if (f.date_of_birth) parts.push(`birthday: ${f.date_of_birth}`);
  if (f.favorite_categories?.length) parts.push(`categories: ${f.favorite_categories.join(", ")}`);
  if (f.favorite_moods?.length) parts.push(`moods: ${f.favorite_moods.join(", ")}`);
  if (f.content_frequency) parts.push(`frequency: ${f.content_frequency.replace("_", " ")}`);
  if (f.fan_type) parts.push(`profile type: ${f.fan_type}`);
  const socials = ["instagram", "tiktok", "youtube", "x_handle"].filter((s) => f[s]).map((s) => `${s.replace("_handle", "")}: ${f[s]}`);
  if (socials.length) parts.push(`socials: ${socials.join(", ")}`);
  if (f.profile_visibility) parts.push(`visibility: ${f.profile_visibility}`);
  return `Here's your profile. ${parts.join(". ")}. Does everything look right?`;
}
function afterLocationMsg() {
  return "We've got the essentials. Want to add a few extras — birthday, content preferences, socials, privacy? Or say finish to wrap up.";
}
async function clientTurn(stage, fields, pending, input, checkUsername) {
  const t = input.trim();
  const stay = (msg) => ({
    message: msg,
    stage,
    fields,
    pending
  });
  if (manualRe.test(t)) return {
    message: "No problem. Switching you to manual setup.",
    stage,
    fields,
    pending,
    switchToManual: true
  };
  const canFinish = !["confirm_display_name", "confirm_username", "review", "complete"].includes(stage);
  if (finishRe.test(t) && canFinish && fields.display_name && fields.username) {
    return {
      message: buildReview(fields),
      stage: "review",
      fields,
      pending: {}
    };
  }
  if (stage === "ask_display_name") {
    if (yesRe.test(t) || noRe.test(t) || skipRe.test(t)) return stay("Say the name you want people to see on Trey TV.");
    const raw = t.replace(/^my name is\s+/i, "").replace(/^call me\s+/i, "").trim();
    const name = toTitleCase(extractName(raw));
    if (name.length < 2) return stay("Say your profile name one more time for me.");
    return {
      message: `I heard "${name}". Is that right?`,
      stage: "confirm_display_name",
      fields,
      pending: {
        field: "display_name",
        value: name
      }
    };
  }
  if (stage === "confirm_display_name") {
    if (yesRe.test(t) && pending.value) return {
      message: "Saved. What username do you want on Trey TV?",
      stage: "ask_username",
      fields: {
        ...fields,
        display_name: String(pending.value)
      },
      pending: {}
    };
    const repRaw = noRe.test(t) ? t.replace(noRe, "") : t;
    const rep = toTitleCase(extractName(repRaw));
    if (rep.length >= 2) return {
      message: `Got it. I heard "${rep}". Is that right?`,
      stage: "confirm_display_name",
      fields,
      pending: {
        field: "display_name",
        value: rep
      }
    };
    return {
      message: "Say your profile name one more time.",
      stage: "ask_display_name",
      fields,
      pending: {}
    };
  }
  if (stage === "ask_username") {
    if (yesRe.test(t) || noRe.test(t) || skipRe.test(t)) return stay("Say the username you want — letters, numbers, or underscores.");
    const raw = normalizeUsername(t);
    const check = await checkUsername(raw);
    if (!check.available) {
      const msg = check.reason === "invalid" ? "Use 3–30 lowercase letters, numbers, or underscores." : `${raw} is already taken. Try a different username.`;
      return stay(msg);
    }
    return {
      message: `${check.username} is available. Should I save that as your username?`,
      stage: "confirm_username",
      fields,
      pending: {
        field: "username",
        value: check.username
      }
    };
  }
  if (stage === "confirm_username") {
    if (yesRe.test(t) && pending.value) return {
      message: "Username saved. Want to add a short bio? Say one now, or say skip.",
      stage: "ask_bio",
      fields: {
        ...fields,
        username: String(pending.value)
      },
      pending: {}
    };
    const raw = normalizeUsername(noRe.test(t) ? t.replace(noRe, "") : t);
    if (raw.length >= 3) {
      const check = await checkUsername(raw);
      if (!check.available) return stay("That username isn't available. Try another one.");
      return {
        message: `${check.username} is available. Should I save that?`,
        stage: "confirm_username",
        fields,
        pending: {
          field: "username",
          value: check.username
        }
      };
    }
    return {
      message: "Say the username one more time.",
      stage: "ask_username",
      fields,
      pending: {}
    };
  }
  if (stage === "ask_bio") {
    if (skipRe.test(t)) return {
      message: "No bio for now. Want to add your location? Say it now, or say skip.",
      stage: "ask_location",
      fields,
      pending: {}
    };
    if (yesRe.test(t) || noRe.test(t)) return stay("Say the short bio you want, or say skip.");
    const bio = t.slice(0, 160);
    return {
      message: `I heard: "${bio}". Should I save it?`,
      stage: "confirm_bio",
      fields,
      pending: {
        field: "bio",
        value: bio
      }
    };
  }
  if (stage === "confirm_bio") {
    if (yesRe.test(t) && pending.value) {
      const rawBio = String(pending.value).trim();
      const cleanedBio = rawBio.charAt(0).toUpperCase() + rawBio.slice(1) + (!/[.!?]$/.test(rawBio) ? "." : "");
      return {
        message: "Bio saved. Want to add your location? Say it now, or say skip.",
        stage: "ask_location",
        fields: {
          ...fields,
          bio: cleanedBio
        },
        pending: {}
      };
    }
    if (skipRe.test(t)) return {
      message: "No bio for now. Want to add your location? Say it now, or say skip.",
      stage: "ask_location",
      fields,
      pending: {}
    };
    const bio = (noRe.test(t) ? t.replace(noRe, "") : t).trim().slice(0, 160);
    if (bio) return {
      message: `Got it. "${bio}". Should I save it?`,
      stage: "confirm_bio",
      fields,
      pending: {
        field: "bio",
        value: bio
      }
    };
    return {
      message: "Say the bio one more time, or say skip.",
      stage: "ask_bio",
      fields,
      pending: {}
    };
  }
  if (stage === "ask_location") {
    if (skipRe.test(t)) return {
      message: afterLocationMsg(),
      stage: "optional_offer",
      fields,
      pending: {}
    };
    if (yesRe.test(t) || noRe.test(t)) return stay("Say your location, or say skip.");
    const loc = cleanLocation(t);
    if (loc.length < 2) return stay("Say your city or location, or say skip.");
    return {
      message: `I heard "${loc}". Should I save that?`,
      stage: "confirm_location",
      fields,
      pending: {
        field: "location",
        value: loc
      }
    };
  }
  if (stage === "confirm_location") {
    if (yesRe.test(t) && pending.value) {
      const f = {
        ...fields,
        location: String(pending.value)
      };
      return {
        message: afterLocationMsg(),
        stage: "optional_offer",
        fields: f,
        pending: {}
      };
    }
    if (skipRe.test(t)) return {
      message: afterLocationMsg(),
      stage: "optional_offer",
      fields,
      pending: {}
    };
    const loc = cleanLocation(noRe.test(t) ? t.replace(noRe, "") : t);
    if (loc.length >= 2) return {
      message: `Got it, "${loc}". Should I save that?`,
      stage: "confirm_location",
      fields,
      pending: {
        field: "location",
        value: loc
      }
    };
    return {
      message: "Say your location one more time, or say skip.",
      stage: "ask_location",
      fields,
      pending: {}
    };
  }
  if (stage === "optional_offer") {
    if (skipRe.test(t) || finishRe.test(t) || noRe.test(t)) return {
      message: buildReview(fields),
      stage: "review",
      fields,
      pending: {}
    };
    return {
      message: "Want to add your birthday? Say yes, or say skip.",
      stage: "ask_birthday_choice",
      fields,
      pending: {}
    };
  }
  if (stage === "ask_birthday_choice") {
    if (skipRe.test(t) || noRe.test(t)) return {
      message: "Birthday skipped. Want to add content preferences?",
      stage: "ask_content_choice",
      fields,
      pending: {}
    };
    return {
      message: "Say your full birthday — month, day, and year. Or say skip.",
      stage: "ask_birthday",
      fields,
      pending: {}
    };
  }
  if (stage === "ask_birthday") {
    if (skipRe.test(t)) return {
      message: "Birthday skipped. Want to add content preferences?",
      stage: "ask_content_choice",
      fields,
      pending: {}
    };
    const dob = parseDateOfBirth(t);
    if (!dob) return stay("I need the full date — month, day, and year. Or say skip.");
    return {
      message: `I heard ${dob}. Should I save that birthday?`,
      stage: "confirm_date_of_birth",
      fields,
      pending: {
        field: "date_of_birth",
        value: dob
      }
    };
  }
  if (stage === "confirm_date_of_birth") {
    if (yesRe.test(t) && pending.value) {
      const f = {
        ...fields,
        date_of_birth: String(pending.value)
      };
      return {
        message: "Birthday saved. Do you want it shown on your profile?",
        stage: "ask_show_birthday",
        fields: f,
        pending: {}
      };
    }
    if (skipRe.test(t)) return {
      message: "Birthday skipped. Want to add content preferences?",
      stage: "ask_content_choice",
      fields,
      pending: {}
    };
    return {
      message: "Say the birthday again with month, day, and year, or say skip.",
      stage: "ask_birthday",
      fields,
      pending: {}
    };
  }
  if (stage === "ask_show_birthday") {
    const show = yesRe.test(t);
    return {
      message: `Got it. Birthday visibility is ${show ? "on" : "off"}. Want to add content preferences?`,
      stage: "ask_content_choice",
      fields: {
        ...fields,
        show_birthday: show
      },
      pending: {}
    };
  }
  if (stage === "ask_content_choice") {
    if (skipRe.test(t) || noRe.test(t)) return {
      message: "Content preferences skipped. Want to add social links?",
      stage: "ask_socials_choice",
      fields,
      pending: {}
    };
    return {
      message: `What kind of Trey TV content do you like? For example: ${CATEGORY_OPTIONS.slice(0, 4).join(", ")}.`,
      stage: "ask_categories",
      fields,
      pending: {}
    };
  }
  if (stage === "ask_categories") {
    if (skipRe.test(t)) return {
      message: "Categories skipped. What moods do you usually watch for? Or say skip.",
      stage: "ask_moods",
      fields,
      pending: {}
    };
    const cats = parseList(t, CATEGORY_OPTIONS);
    return {
      message: `I heard ${summarizeList(cats)}. Save those categories?`,
      stage: "confirm_categories",
      fields,
      pending: {
        field: "favorite_categories",
        value: cats
      }
    };
  }
  if (stage === "confirm_categories") {
    if (yesRe.test(t) && pending.value) {
      const f = {
        ...fields,
        favorite_categories: pending.value
      };
      return {
        message: "Categories saved. What moods do you usually watch for? Or say skip.",
        stage: "ask_moods",
        fields: f,
        pending: {}
      };
    }
    if (skipRe.test(t)) return {
      message: "Categories skipped. What moods do you usually watch for? Or say skip.",
      stage: "ask_moods",
      fields,
      pending: {}
    };
    return {
      message: "No problem. Say the content categories again, or say skip.",
      stage: "ask_categories",
      fields,
      pending: {}
    };
  }
  if (stage === "ask_moods") {
    if (skipRe.test(t)) return {
      message: "Moods skipped. How often do you watch or post? Daily, weekly, or only major drops?",
      stage: "ask_frequency",
      fields,
      pending: {}
    };
    const moods = parseList(t, MOOD_OPTIONS);
    return {
      message: `I heard ${summarizeList(moods)}. Save those moods?`,
      stage: "confirm_moods",
      fields,
      pending: {
        field: "favorite_moods",
        value: moods
      }
    };
  }
  if (stage === "confirm_moods") {
    if (yesRe.test(t) && pending.value) {
      const f = {
        ...fields,
        favorite_moods: pending.value
      };
      return {
        message: "Moods saved. How often do you watch or post? Daily, weekly, or only major drops?",
        stage: "ask_frequency",
        fields: f,
        pending: {}
      };
    }
    if (skipRe.test(t)) return {
      message: "Moods skipped. How often do you watch or post? Daily, weekly, or only major drops?",
      stage: "ask_frequency",
      fields,
      pending: {}
    };
    return {
      message: "No problem. Say the moods again, or say skip.",
      stage: "ask_moods",
      fields,
      pending: {}
    };
  }
  if (stage === "ask_frequency") {
    if (skipRe.test(t)) return {
      message: "Frequency skipped. Are you mostly a viewer, creator, supporter, superfan, or Trizfit?",
      stage: "ask_fan_type",
      fields,
      pending: {}
    };
    const freq = parseFrequency(t);
    if (!freq) return stay("Say daily, weekly, only major drops, or skip.");
    return {
      message: `I heard ${freq.replace("_", " ")}. Save that frequency?`,
      stage: "confirm_frequency",
      fields,
      pending: {
        field: "content_frequency",
        value: freq
      }
    };
  }
  if (stage === "confirm_frequency") {
    if (yesRe.test(t) && pending.value) {
      const f = {
        ...fields,
        content_frequency: String(pending.value)
      };
      return {
        message: "Frequency saved. Are you mostly a viewer, creator, supporter, superfan, or Trizfit?",
        stage: "ask_fan_type",
        fields: f,
        pending: {}
      };
    }
    if (skipRe.test(t)) return {
      message: "Frequency skipped. Are you mostly a viewer, creator, supporter, superfan, or Trizfit?",
      stage: "ask_fan_type",
      fields,
      pending: {}
    };
    return {
      message: "No problem. Say daily, weekly, only major drops, or skip.",
      stage: "ask_frequency",
      fields,
      pending: {}
    };
  }
  if (stage === "ask_fan_type") {
    if (skipRe.test(t)) return {
      message: "Profile type skipped. Want to add social links?",
      stage: "ask_socials_choice",
      fields,
      pending: {}
    };
    const fanType = parseFanType(t);
    if (!fanType) return stay("Say viewer, creator, supporter, superfan, Trizfit, or skip.");
    return {
      message: `I heard ${fanType}. Save that profile type?`,
      stage: "confirm_fan_type",
      fields,
      pending: {
        field: "fan_type",
        value: fanType
      }
    };
  }
  if (stage === "confirm_fan_type") {
    if (yesRe.test(t) && pending.value) {
      const f = {
        ...fields,
        fan_type: String(pending.value)
      };
      return {
        message: "Profile type saved. Want to add social links?",
        stage: "ask_socials_choice",
        fields: f,
        pending: {}
      };
    }
    if (skipRe.test(t)) return {
      message: "Profile type skipped. Want to add social links?",
      stage: "ask_socials_choice",
      fields,
      pending: {}
    };
    return {
      message: "No problem. Say viewer, creator, supporter, superfan, Trizfit, or skip.",
      stage: "ask_fan_type",
      fields,
      pending: {}
    };
  }
  if (stage === "ask_socials_choice") {
    if (skipRe.test(t) || noRe.test(t)) return {
      message: "Social links skipped. Want to set privacy now?",
      stage: "ask_privacy_choice",
      fields,
      pending: {}
    };
    return {
      message: "Say your Instagram handle, or say skip.",
      stage: "ask_instagram",
      fields,
      pending: {}
    };
  }
  const socialAskMap = {
    ask_instagram: {
      field: "instagram",
      next: "ask_tiktok",
      nextPrompt: "Say your TikTok handle, or say skip."
    },
    ask_tiktok: {
      field: "tiktok",
      next: "ask_youtube",
      nextPrompt: "Say your YouTube link, or say skip."
    },
    ask_youtube: {
      field: "youtube",
      next: "ask_x_handle",
      nextPrompt: "Say your X handle, or say skip."
    },
    ask_x_handle: {
      field: "x_handle",
      next: "ask_privacy_choice",
      nextPrompt: "Socials done. Want to set privacy now?"
    }
  };
  const socialConfirmMap = {
    confirm_instagram: {
      field: "instagram",
      ask: "ask_instagram",
      next: "ask_tiktok",
      nextPrompt: "Instagram saved. Say your TikTok handle, or say skip."
    },
    confirm_tiktok: {
      field: "tiktok",
      ask: "ask_tiktok",
      next: "ask_youtube",
      nextPrompt: "TikTok saved. Say your YouTube link, or say skip."
    },
    confirm_youtube: {
      field: "youtube",
      ask: "ask_youtube",
      next: "ask_x_handle",
      nextPrompt: "YouTube saved. Say your X handle, or say skip."
    },
    confirm_x_handle: {
      field: "x_handle",
      ask: "ask_x_handle",
      next: "ask_privacy_choice",
      nextPrompt: "X saved. Want to set privacy now?"
    }
  };
  const askSocial = socialAskMap[stage];
  if (askSocial) {
    if (skipRe.test(t)) return {
      message: askSocial.nextPrompt,
      stage: askSocial.next,
      fields,
      pending: {}
    };
    const val = askSocial.field === "youtube" ? t.slice(0, 300) : cleanHandle(t);
    if (!val) return stay("I didn't catch that. Say the handle, or say skip.");
    const confirmStage = `confirm_${String(askSocial.field)}`;
    return {
      message: `I heard ${val}. Should I save it?`,
      stage: confirmStage,
      fields,
      pending: {
        field: String(askSocial.field),
        value: val
      }
    };
  }
  const confirmSocial = socialConfirmMap[stage];
  if (confirmSocial) {
    if (yesRe.test(t) && pending.value) {
      const f = {
        ...fields,
        [confirmSocial.field]: String(pending.value)
      };
      return {
        message: confirmSocial.nextPrompt,
        stage: confirmSocial.next,
        fields: f,
        pending: {}
      };
    }
    if (skipRe.test(t)) return {
      message: confirmSocial.nextPrompt,
      stage: confirmSocial.next,
      fields,
      pending: {}
    };
    return {
      message: "No problem. Say it again, or say skip.",
      stage: confirmSocial.ask,
      fields,
      pending: {}
    };
  }
  if (stage === "ask_privacy_choice") {
    if (skipRe.test(t) || noRe.test(t)) return {
      message: buildReview(fields),
      stage: "review",
      fields,
      pending: {}
    };
    return {
      message: "Do you want your profile public, private, or limited to Trey TV members?",
      stage: "ask_visibility",
      fields,
      pending: {}
    };
  }
  if (stage === "ask_visibility") {
    const vis = parseVisibility(t);
    if (!vis) return stay("Say public, private, or limited.");
    return {
      message: `I heard ${vis === "members_only" ? "limited to members" : vis}. Save that visibility?`,
      stage: "confirm_visibility",
      fields,
      pending: {
        field: "profile_visibility",
        value: vis
      }
    };
  }
  if (stage === "confirm_visibility") {
    if (yesRe.test(t) && pending.value) {
      const f = {
        ...fields,
        profile_visibility: String(pending.value)
      };
      return {
        message: "Visibility saved. Should your location and birthday show on your profile? Say both, location only, birthday only, or neither.",
        stage: "ask_privacy_details",
        fields: f,
        pending: {}
      };
    }
    if (skipRe.test(t)) return {
      message: buildReview(fields),
      stage: "review",
      fields,
      pending: {}
    };
    return {
      message: "No problem. Say public, private, or limited.",
      stage: "ask_visibility",
      fields,
      pending: {}
    };
  }
  if (stage === "ask_privacy_details") {
    if (skipRe.test(t)) return {
      message: buildReview(fields),
      stage: "review",
      fields,
      pending: {}
    };
    const l = t.toLowerCase();
    const showLoc = l.includes("both") || l.includes("location");
    const showBday = l.includes("both") || l.includes("birthday");
    let f = {
      ...fields,
      show_location: showLoc,
      show_birthday: showBday
    };
    if (l.includes("top three") || l.includes("top 3")) {
      const show = !l.includes("hide") && !l.includes("no");
      f = {
        ...f,
        show_top_three: show,
        allow_top_three_adds: show
      };
    }
    return {
      message: buildReview(f),
      stage: "review",
      fields: f,
      pending: {}
    };
  }
  if (stage === "review") {
    if (yesRe.test(t)) return {
      message: "Your Trey TV profile is ready. Creating your account now…",
      stage: "complete",
      fields,
      pending: {}
    };
    return {
      message: "What do you want to change? You can say display name, username, bio, location, birthday, categories, moods, frequency, profile type, socials, or privacy.",
      stage: "edit_field",
      fields,
      pending: {}
    };
  }
  if (stage === "edit_field") {
    const l = t.toLowerCase();
    if (l.includes("name") && !l.includes("user")) return {
      message: "What name should show on your profile?",
      stage: "ask_display_name",
      fields,
      pending: {}
    };
    if (l.includes("username") || l.includes("user") && l.includes("name")) return {
      message: "What username do you want on Trey TV?",
      stage: "ask_username",
      fields,
      pending: {}
    };
    if (l.includes("bio")) return {
      message: "Say the new bio, or say skip.",
      stage: "ask_bio",
      fields,
      pending: {}
    };
    if (l.includes("location")) return {
      message: "Say the new location, or say skip.",
      stage: "ask_location",
      fields,
      pending: {}
    };
    if (l.includes("birthday") || l.includes("birth")) return {
      message: "Say your full birthday — month, day, and year. Or say skip.",
      stage: "ask_birthday",
      fields,
      pending: {}
    };
    if (l.includes("categor")) return {
      message: "Say the content categories, or say skip.",
      stage: "ask_categories",
      fields,
      pending: {}
    };
    if (l.includes("mood")) return {
      message: "Say the moods, or say skip.",
      stage: "ask_moods",
      fields,
      pending: {}
    };
    if (l.includes("frequency") || l.includes("often")) return {
      message: "Say daily, weekly, only major drops, or skip.",
      stage: "ask_frequency",
      fields,
      pending: {}
    };
    if (l.includes("type") || l.includes("fan")) return {
      message: "Say viewer, creator, supporter, superfan, Trizfit, or skip.",
      stage: "ask_fan_type",
      fields,
      pending: {}
    };
    if (l.includes("social") || l.includes("instagram") || l.includes("tiktok")) return {
      message: "Say your Instagram handle, or say skip.",
      stage: "ask_instagram",
      fields,
      pending: {}
    };
    if (l.includes("privacy") || l.includes("visib")) return {
      message: "Do you want your profile public, private, or limited to Trey TV members?",
      stage: "ask_visibility",
      fields,
      pending: {}
    };
    return {
      message: buildReview(fields),
      stage: "review",
      fields,
      pending: {}
    };
  }
  return {
    message: "Your profile is ready.",
    stage: "complete",
    fields,
    pending: {}
  };
}
function isVoiceActive(s) {
  return s === "connected" || s === "listening" || s === "speaking";
}
function playAssistantAudio(text) {
  treyITts({
    data: {
      text
    }
  }).then((result) => {
    if (!result.audioBase64) return;
    const bytes = Uint8Array.from(atob(result.audioBase64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], {
      type: result.mimeType ?? "audio/wav"
    });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    audio.onerror = () => URL.revokeObjectURL(url);
    audio.play().catch(() => URL.revokeObjectURL(url));
  }).catch(() => {
  });
}
const SETUP_STEPS = [{
  key: "display_name",
  label: "Name"
}, {
  key: "username",
  label: "Handle"
}, {
  key: "date_of_birth",
  label: "Birth"
}, {
  key: "location",
  label: "City"
}, {
  key: "favorite_categories",
  label: "Taste"
}];
function stepDone(fields, key) {
  const v = fields[key];
  if (v === void 0 || v === "") return false;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}
const ORB_C = 120;
const ORB_R = 100;
const ORB_W = 240;
const ORB_H = 288;
const BARS = 20;
const BAR_W = 2.2;
const BAR_GAP = 3.6;
const BARS_SPAN = BARS * (BAR_W + BAR_GAP) - BAR_GAP;
const BAR_ANIMS = ["orb-bar-a", "orb-bar-b", "orb-bar-c", "orb-bar-b", "orb-bar-a"];
const BAR_DURS = [0.55, 0.72, 0.82, 0.65, 0.6];
const RINGS = [[0.91, 0.225, -26, 7.5, "orb-ring-cw"], [0.78, 0.2, 17, 5.2, "orb-ring-cw"], [0.65, 0.18, -9, 9, "orb-ring-ccw"], [0.52, 0.16, 33, 4, "orb-ring-cw"], [0.38, 0.13, -43, 3.4, "orb-ring-ccw"]];
const SPARKS = [0, 72, 144, 216, 288];
const SPARK_COLORS = ["#35E6FF", "#FFC85A", "#35E6FF", "#9B7FFF", "#FFC85A"];
function GalaxyOrb({
  state
}) {
  const isActive = state === "listening" || state === "speaking";
  const isProcessing = state === "processing";
  const isDone = state === "completed";
  const speed = isActive ? 0.52 : 1;
  const C = ORB_C;
  const R = ORB_R;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative select-none", style: {
    width: ORB_W,
    height: ORB_H
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: ORB_W, height: ORB_H, viewBox: `0 0 ${ORB_W} ${ORB_H}`, "aria-hidden": true, style: {
    overflow: "visible"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("defs", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("radialGradient", { id: "pOrbBg", cx: "37%", cy: "31%", r: "66%", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#192860" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "38%", stopColor: "#0d1835" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "72%", stopColor: "#070e22" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#030810" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "pGold", x1: "0", y1: "0", x2: "1", y2: "0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#FFC85A", stopOpacity: "0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "22%", stopColor: "#FFC85A", stopOpacity: "0.88" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "50%", stopColor: "#FFE490", stopOpacity: "1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "78%", stopColor: "#FFC85A", stopOpacity: "0.88" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#FFC85A", stopOpacity: "0" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "pBlue", x1: "0", y1: "0", x2: "1", y2: "0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#35E6FF", stopOpacity: "0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "22%", stopColor: "#35E6FF", stopOpacity: "0.85" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "50%", stopColor: "#88EEFF", stopOpacity: "1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "78%", stopColor: "#35E6FF", stopOpacity: "0.85" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#35E6FF", stopOpacity: "0" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "pPurple", x1: "0", y1: "0", x2: "1", y2: "0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#7A5CFF", stopOpacity: "0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "22%", stopColor: "#7A5CFF", stopOpacity: "0.85" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "50%", stopColor: "#A888FF", stopOpacity: "1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "78%", stopColor: "#7A5CFF", stopOpacity: "0.85" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#7A5CFF", stopOpacity: "0" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("radialGradient", { id: "pCore", cx: "50%", cy: "50%", r: "50%", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#FFFFFF" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "22%", stopColor: "#B8F4FF", stopOpacity: "0.96" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "58%", stopColor: "#35E6FF", stopOpacity: "0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#35E6FF", stopOpacity: "0" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("radialGradient", { id: "pRimGlow", cx: "50%", cy: "50%", r: "50%", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "55%", stopColor: "transparent" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#1060CC", stopOpacity: "0.22" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("filter", { id: "pGfSoft", x: "-40%", y: "-40%", width: "180%", height: "180%", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("feGaussianBlur", { stdDeviation: "1.6", result: "b" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("feMerge", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("feMergeNode", { in: "b" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("feMergeNode", { in: "SourceGraphic" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("filter", { id: "pGfStrong", x: "-80%", y: "-80%", width: "260%", height: "260%", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("feGaussianBlur", { stdDeviation: "5", result: "b" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("feMerge", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("feMergeNode", { in: "b" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("feMergeNode", { in: "SourceGraphic" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("filter", { id: "pGfBloom", x: "-100%", y: "-100%", width: "300%", height: "300%", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("feGaussianBlur", { stdDeviation: "9", result: "b" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("feMerge", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("feMergeNode", { in: "b" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("feMergeNode", { in: "SourceGraphic" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("clipPath", { id: "pOrbClip", children: /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: C, cy: C, r: R }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: C, cy: C, r: R + 26, fill: "none", stroke: "#1E4090", strokeWidth: "0.55", opacity: "0.48" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: C, cy: C, r: R + 44, fill: "none", stroke: "#142870", strokeWidth: "0.38", opacity: "0.30" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: C, cy: C, r: R + 62, fill: "none", stroke: "#0e1f52", strokeWidth: "0.25", opacity: "0.18" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: C, cy: C, r: R + 8, fill: "url(#pRimGlow)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: C, cy: C, r: R + 1, fill: "none", stroke: "#35E6FF", strokeWidth: "1.4", opacity: isActive ? 0.55 : 0.28, filter: "url(#pGfSoft)" }),
    isActive && /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: C, cy: C, r: R + 14, fill: "none", stroke: "#35E6FF", strokeWidth: "1", opacity: "0.18", filter: "url(#pGfBloom)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: C, cy: C, r: R, fill: "url(#pOrbBg)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { clipPath: "url(#pOrbClip)", children: [
      RINGS.map(([rxR, ryR, tilt, durBase, animName], i) => {
        const gradId = i % 3 === 0 ? "url(#pGold)" : i % 3 === 1 ? "url(#pBlue)" : "url(#pPurple)";
        const sw = i < 2 ? 2.4 : i < 4 ? 2 : 1.5;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("g", { style: {
          transformOrigin: `${C}px ${C}px`,
          animationName: animName,
          animationDuration: `${durBase * speed}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("ellipse", { cx: C, cy: C, rx: R * rxR, ry: R * ryR, fill: "none", stroke: gradId, strokeWidth: sw, transform: `rotate(${tilt} ${C} ${C})`, filter: "url(#pGfSoft)" }) }, i);
      }),
      isActive && Array.from({
        length: BARS
      }).map((_, i) => {
        const bx = C - BARS_SPAN / 2 + i * (BAR_W + BAR_GAP);
        const color = i % 3 === 0 ? "#FFC85A" : i % 3 === 1 ? "#35E6FF" : "#A080FF";
        const anim = BAR_ANIMS[i % BAR_ANIMS.length];
        const dur = BAR_DURS[i % BAR_DURS.length];
        const delay = i * 0.045 % 0.54;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: bx, y: C - 1, width: BAR_W, height: 2, rx: "1", fill: color, opacity: "0.92", style: {
          transformOrigin: `${bx + BAR_W / 2}px ${C}px`,
          animationName: anim,
          animationDuration: `${dur}s`,
          animationDelay: `${delay}s`,
          animationTimingFunction: "ease-in-out",
          animationIterationCount: "infinite"
        } }, i);
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: C, cy: C, r: 16, fill: "url(#pCore)", filter: "url(#pGfStrong)", style: {
        transformOrigin: `${C}px ${C}px`,
        animationName: "orb-core-breathe",
        animationDuration: isActive ? "1.3s" : "2.8s",
        animationTimingFunction: "ease-in-out",
        animationIterationCount: "infinite"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ellipse", { cx: C - 18, cy: C - R * 0.44, rx: R * 0.28, ry: R * 0.1, fill: "white", opacity: "0.07" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: C, cy: C, r: R, fill: "none", stroke: "rgba(255,255,255,0.09)", strokeWidth: "1.5" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("g", { style: {
      transformOrigin: `${C}px ${C}px`,
      animationName: "orb-ring-cw",
      animationDuration: `${15 * speed}s`,
      animationTimingFunction: "linear",
      animationIterationCount: "infinite"
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: `M ${C - R} ${C} A ${R} ${R} 0 0 1 ${C + R} ${C}`, fill: "none", stroke: "url(#pGold)", strokeWidth: "1.8", opacity: "0.6", filter: "url(#pGfSoft)" }) }),
    SPARKS.map((deg, i) => {
      const rad = deg * Math.PI / 180;
      const px = C + (R - 1) * Math.cos(rad);
      const py = C + (R - 1) * Math.sin(rad);
      return /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: px, cy: py, r: "2.5", fill: SPARK_COLORS[i], opacity: "0.65", filter: "url(#pGfSoft)", style: {
        animation: `orb-rim-dot ${1.5 + i * 0.35}s ease-in-out ${i * 0.45}s infinite`
      } }, i);
    }),
    isDone && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: C, cy: C, r: R, fill: "none", stroke: "#4ADE80", strokeWidth: "2", opacity: "0.6", filter: "url(#pGfSoft)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: C, cy: C, r: 18, fill: "#22C55E", opacity: "0.92", filter: "url(#pGfStrong)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: `M ${C - 9} ${C} L ${C - 2} ${C + 7} L ${C + 9} ${C - 7}`, fill: "none", stroke: "white", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" })
    ] }),
    isProcessing && /* @__PURE__ */ jsxRuntimeExports.jsx("g", { style: {
      transformOrigin: `${C}px ${C}px`,
      animationName: "orb-ring-cw",
      animationDuration: "0.9s",
      animationTimingFunction: "linear",
      animationIterationCount: "infinite"
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: C, cy: C - R + 9, r: "5.5", fill: "#35E6FF", opacity: "0.92", filter: "url(#pGfSoft)" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ellipse", { cx: C, cy: C + R + 12, rx: R * 0.7, ry: "5", fill: "none", stroke: "#35E6FF", strokeWidth: "0.7", opacity: "0.28" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ellipse", { cx: C, cy: C + R + 21, rx: R * 0.5, ry: "3.5", fill: "none", stroke: "#FFC85A", strokeWidth: "0.5", opacity: "0.18" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ellipse", { cx: C, cy: C + R + 29, rx: R * 0.32, ry: "2.5", fill: "none", stroke: "#35E6FF", strokeWidth: "0.4", opacity: "0.12" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: C, cy: C + R + 36, r: "3.5", fill: "#35E6FF", opacity: "0.28", filter: "url(#pGfStrong)" }),
    [[C - 82, C - 68, 2.2, "2.1s", "0s"], [C + 70, C - 55, 1.5, "1.7s", "0.6s"], [C - 95, C + 10, 1.8, "2.4s", "1.1s"], [C + 88, C + 25, 1.5, "1.9s", "0.3s"], [C + 58, C + 68, 2, "2.2s", "0.9s"], [C - 65, C + 72, 1.5, "1.8s", "1.4s"]].map(([px, py, r, dur, del], i) => /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: px, cy: py, r, fill: "white", style: {
      animation: `trey-star-twinkle ${dur} ease-in-out ${del} infinite`
    } }, i))
  ] }) });
}
function GalaxyBackdrop() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "aria-hidden": true, className: "pointer-events-none fixed inset-0 overflow-hidden", style: {
    zIndex: 0
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0", style: {
      background: "radial-gradient(ellipse at 50% 22%, oklch(0.2 0.07 290 / 0.78) 0%, oklch(0.1 0.03 270 / 0.88) 50%, #05060B 100%)"
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute rounded-full", style: {
      top: "-20%",
      left: "-10%",
      width: "70vw",
      height: "70vw",
      background: "radial-gradient(circle, oklch(0.65 0.22 300 / 0.14), transparent 62%)",
      filter: "blur(60px)"
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute rounded-full", style: {
      top: "5%",
      right: "-15%",
      width: "60vw",
      height: "60vw",
      background: "radial-gradient(circle, oklch(0.7 0.25 340 / 0.11), transparent 62%)",
      filter: "blur(80px)"
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute rounded-full", style: {
      bottom: "0",
      left: "15%",
      width: "55vw",
      height: "38vw",
      background: "radial-gradient(circle, oklch(0.82 0.15 215 / 0.08), transparent 65%)",
      filter: "blur(70px)"
    } })
  ] });
}
function ReviewPanel({
  fields,
  polishedBio,
  overrides,
  onOverride,
  onConfirm
}) {
  const name = String(overrides.display_name ?? fields.display_name ?? "");
  const handle = String(overrides.username ?? fields.username ?? "");
  const bioVal = String(overrides.bio ?? (polishedBio || fields.bio) ?? "");
  const locVal = String(overrides.location ?? fields.location ?? "");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-4 mb-3 rounded-2xl liquid-glass border border-primary/25 overflow-hidden", style: {
    zIndex: 1
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-white/5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] tracking-[0.35em] text-primary font-bold", children: "YOUR PROFILE PREVIEW" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground/50", children: "Tap any field to edit" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[9px] tracking-[0.2em] text-muted-foreground/50 mb-1 block", children: "NAME" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: name, onChange: (e) => onOverride("display_name", e.target.value), className: "w-full bg-white/5 border border-white/10 rounded-xl px-3 h-9 text-sm font-semibold focus:outline-none focus:border-primary/40 transition" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[9px] tracking-[0.2em] text-muted-foreground/50 mb-1 block", children: "HANDLE" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center bg-white/5 border border-white/10 rounded-xl h-9 px-2 focus-within:border-primary/40 transition", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-sm", children: "@" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: handle, onChange: (e) => onOverride("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 30)), className: "flex-1 bg-transparent text-sm font-semibold focus:outline-none ml-1" })
          ] })
        ] })
      ] }),
      (polishedBio || fields.bio) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[9px] tracking-[0.2em] text-muted-foreground/50 mb-1 block", children: "BIO" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: bioVal, onChange: (e) => onOverride("bio", e.target.value), rows: 3, className: "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-primary/40 transition leading-relaxed" })
      ] }),
      fields.location && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[9px] tracking-[0.2em] text-muted-foreground/50 mb-1 block", children: "LOCATION" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: locVal, onChange: (e) => onOverride("location", e.target.value), className: "w-full bg-white/5 border border-white/10 rounded-xl px-3 h-9 text-sm focus:outline-none focus:border-primary/40 transition" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onConfirm, className: "w-full h-11 rounded-2xl bg-primary text-primary-foreground text-sm font-bold glow-gold flex items-center justify-center gap-2 mt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-4" }),
        " Looks Good — Save Profile"
      ] })
    ] })
  ] });
}
function VoiceOnboarding() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ConversationProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(VoiceOnboardingInner, {}) });
}
function VoiceOnboardingInner() {
  const nav = useNavigate();
  const [accessToken, setAccessToken] = reactExports.useState(null);
  const [phase, setPhase] = reactExports.useState("disclosure");
  const [stage, setStage] = reactExports.useState("ask_display_name");
  const [fields, setFields] = reactExports.useState({});
  const [pending, setPending] = reactExports.useState({});
  const [assistantMessage, setAssistantMessage] = reactExports.useState(INITIAL_MESSAGE);
  const [draft, setDraft] = reactExports.useState("");
  const [thinking, setThinking] = reactExports.useState(false);
  const [voiceStatus, setVoiceStatus] = reactExports.useState("idle");
  const [error, setError] = reactExports.useState(null);
  const [fieldOverrides, setFieldOverrides] = reactExports.useState({});
  const voiceStatusRef = reactExports.useRef("idle");
  const watchdogRef = reactExports.useRef(null);
  const processingRef = reactExports.useRef(false);
  const coreConfirmed = CORE_FIELDS.filter((f) => fields[f] !== void 0 && fields[f] !== "").length;
  const isAtReview = !!fields.display_name && !!fields.username;
  const polishedBio = reactExports.useMemo(() => polishBio(fields.bio ?? "", {
    location: fields.location ?? void 0
  }), [fields.bio, fields.location]);
  reactExports.useEffect(() => {
    supabase.auth.getSession().then(({
      data
    }) => {
      if (data.session?.access_token) setAccessToken(data.session.access_token);
    }).catch(() => {
    });
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
        if (data && !data.completed && (data.selected_path === "voice" || data.selected_path === "trey_i")) {
          const answers = data.answers;
          if (answers) {
            if (answers.stage) setStage(answers.stage);
            if (answers.fields) setFields(answers.fields);
            if (answers.pending) setPending(answers.pending);
            if (answers.assistantMessage) setAssistantMessage(answers.assistantMessage);
          }
          toast.success("Resumed Trey-I voice onboarding from where you left off.");
        } else {
          await supabase.from("user_onboarding").upsert({
            user_id: user.id,
            selected_path: "voice",
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
  reactExports.useEffect(() => {
    if (!accessToken || stage === "complete") return;
    const saveProgress = async () => {
      try {
        const {
          data: {
            user
          }
        } = await supabase.auth.getUser();
        if (user) {
          const stepCount = SETUP_STEPS.filter((s) => stepDone(fields, s.key)).length;
          await supabase.from("user_onboarding").upsert({
            user_id: user.id,
            selected_path: "voice",
            current_step: stepCount,
            answers: {
              stage,
              fields,
              pending,
              assistantMessage
            },
            completed: false,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          }, {
            onConflict: "user_id"
          });
        }
      } catch (err) {
        console.error("Failed to save voice onboarding progress:", err);
      }
    };
    const timer = setTimeout(saveProgress, 1e3);
    return () => clearTimeout(timer);
  }, [accessToken, stage, fields, pending, assistantMessage]);
  reactExports.useEffect(() => {
    voiceStatusRef.current = voiceStatus;
  }, [voiceStatus]);
  const clearWatchdog = reactExports.useCallback(() => {
    if (watchdogRef.current !== null) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
  }, []);
  const checkUsername = reactExports.useCallback(async (username) => {
    try {
      return await treyICheckUsername({
        data: {
          username
        }
      });
    } catch {
      return {
        username,
        available: true,
        reason: "unchecked"
      };
    }
  }, []);
  const advance = reactExports.useCallback(async (input) => {
    const text = input.trim();
    if (!text || thinking || stage === "complete") return;
    if (processingRef.current) return;
    processingRef.current = true;
    setThinking(true);
    setError(null);
    try {
      const result = await clientTurn(stage, fields, pending, text, checkUsername);
      if (result.switchToManual) {
        nav({
          to: "/login"
        });
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
      const finalFields = {
        ...polishAllFields(result.fields),
        ...fieldOverrides
      };
      try {
        sessionStorage.setItem("treytv_voice_profile", JSON.stringify(finalFields));
      } catch {
      }
      const token = accessToken ?? await supabase.auth.getSession().then(({
        data
      }) => data.session?.access_token ?? null).catch(() => null);
      if (token) {
        try {
          await saveOnboardingProfile({
            data: {
              accessToken: token,
              fields: finalFields
            }
          });
          const {
            publicProfileUid
          } = await finalizeOnboarding({
            data: {
              accessToken: token,
              method: "voice"
            }
          });
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
      const {
        error: oauthErr
      } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
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
  const submit = reactExports.useCallback(async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    await advance(text);
  }, [draft, advance]);
  const conversation = useConversation({
    onConnect: () => {
      clearWatchdog();
      setVoiceStatus("connected");
      setError(null);
    },
    onDisconnect: (details) => {
      clearWatchdog();
      const reason = typeof details === "object" && details !== null && "reason" in details ? details.reason : void 0;
      setVoiceStatus(reason === "error" ? "error" : "idle");
      if (reason === "error") setError("Voice disconnected. Type to continue or tap mic to retry.");
    },
    onError: () => {
      clearWatchdog();
      setVoiceStatus("error");
      setError("Voice disconnected. Type to continue.");
    },
    onModeChange: (mode) => {
      if (mode.mode === "listening") setVoiceStatus("listening");
      else if (mode.mode === "speaking") setVoiceStatus("speaking");
    },
    onMessage: (message) => {
      const payload = message;
      const text = typeof payload.message === "string" ? payload.message.trim() : "";
      if (!text) return;
      if (payload.role !== "user") {
        setAssistantMessage(text);
        return;
      }
      void advance(text);
    }
  });
  reactExports.useEffect(() => () => {
    clearWatchdog();
    try {
      conversation.endSession();
    } catch {
    }
  }, []);
  const startVoice = reactExports.useCallback(async () => {
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
        try {
          conversation.endSession();
        } catch {
        }
        setVoiceStatus("error");
        setError("Voice timed out. Type to continue or tap mic to retry.");
        playAssistantAudio(INITIAL_MESSAGE);
      }, 12e3);
      conversation.startSession({
        signedUrl: result.signedUrl,
        connectionType: "websocket"
      });
    } catch {
      clearWatchdog();
      setVoiceStatus("error");
      setError("Voice unavailable. Type your answers below.");
      playAssistantAudio(INITIAL_MESSAGE);
    }
  }, [conversation, clearWatchdog]);
  const stopVoice = reactExports.useCallback(() => {
    clearWatchdog();
    try {
      conversation.endSession();
    } catch {
    }
    setVoiceStatus("idle");
    setError(null);
  }, [conversation, clearWatchdog]);
  const toggleMic = reactExports.useCallback(() => {
    if (voiceStatus === "connecting") return;
    if (isVoiceActive(voiceStatus)) {
      stopVoice();
      return;
    }
    void startVoice();
  }, [voiceStatus, startVoice, stopVoice]);
  const acceptDisclosure = reactExports.useCallback(() => {
    setPhase("conversation");
    void startVoice();
  }, [startVoice]);
  const voiceActive = isVoiceActive(voiceStatus);
  const voiceBusy = voiceStatus === "connecting";
  const voiceState = thinking || voiceBusy ? "processing" : voiceActive ? "listening" : stage === "complete" ? "completed" : "idle";
  const micLabel = voiceBusy ? "Connecting…" : voiceActive ? "Stop voice" : "Restart voice";
  const inputPlaceholder = voiceActive || voiceBusy ? "Listening… or type" : "Type your answer…";
  if (phase === "disclosure") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-screen w-full overflow-hidden flex items-center justify-center px-4", style: {
      background: "#05060B"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(GalaxyBackdrop, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-full max-w-md animate-rise", style: {
        zIndex: 1
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "liquid-glass neon-border rounded-3xl p-8 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-14 rounded-2xl conic-ring grid place-items-center bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "size-6 text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.4em] text-primary", children: "VOICE DISCLOSURE" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold leading-snug", children: "Before Trey-I Speaks" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Trey-I uses AI voice technology to guide you through your profile setup. Please review what you're agreeing to before we begin." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-3", children: ["Your voice is recorded and processed to understand your responses.", "An AI — not a live person — will ask questions and confirm every answer before saving.", "Your profile information is saved only after you review and approve it.", "You can type instead of speaking at any time."].map((line) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-3 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "size-4 text-primary shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: line })
        ] }, line)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground/60 text-center leading-relaxed", children: [
          "By tapping ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-muted-foreground", children: "Accept & Start" }),
          " you consent to the above. This session is governed by our",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/legal/privacy", className: "text-primary hover:underline", children: "Privacy Policy" }),
          "."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/onboarding", className: "flex-1 h-11 rounded-2xl liquid-glass border border-white/10 text-sm font-semibold grid place-items-center", children: "Decline" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: acceptDisclosure, className: "flex-1 h-11 rounded-2xl bg-primary text-primary-foreground text-sm font-bold glow-gold inline-flex items-center justify-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "size-4" }),
            " Accept & Start"
          ] })
        ] })
      ] }) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-screen w-full overflow-hidden flex flex-col", style: {
    background: "#05060B"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(GalaxyBackdrop, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center justify-between px-4 pt-6 pb-2 shrink-0", style: {
      zIndex: 1
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/onboarding", className: "size-9 grid place-items-center rounded-full liquid-glass border border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "h-7" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-9" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "relative text-center px-4 pt-1 pb-2 shrink-0", style: {
      zIndex: 1
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[oklch(0.82_0.16_85_/_0.35)] bg-[oklch(0.82_0.16_85_/_0.08)] mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] tracking-[0.3em] text-primary font-bold", children: "PROFILE CONCIERGE" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-extrabold leading-tight", children: [
        "Build Your Trey TV Profile",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gradient-prescribe", children: "with Trey-I" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center justify-center gap-2 px-4 py-2 shrink-0", style: {
      zIndex: 1
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 px-5 h-9 rounded-full text-sm font-bold bg-primary text-primary-foreground glow-gold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "size-3.5" }),
        " Voice Setup"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => nav({
        to: "/login"
      }), className: "inline-flex items-center gap-1.5 px-5 h-9 rounded-full text-sm font-medium liquid-glass border border-white/10 text-muted-foreground hover:text-foreground transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Keyboard, { className: "size-3.5" }),
        " Manual Form"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex justify-center items-center py-5 shrink-0", style: {
      zIndex: 1
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(GalaxyOrb, { state: voiceState }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-4 mb-3 rounded-2xl liquid-glass border border-white/10 p-4 shrink-0", style: {
      zIndex: 1
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] tracking-[0.35em] text-primary font-bold mb-1.5", children: "TREY-I SAYS" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-semibold leading-snug", children: assistantMessage }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-xs text-red-400 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20", children: error })
    ] }),
    stage === "review" && /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewPanel, { fields, polishedBio, overrides: fieldOverrides, onOverride: (key, value) => setFieldOverrides((prev) => ({
      ...prev,
      [key]: value
    })), onConfirm: () => void advance("yes") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-4 mb-3 rounded-2xl liquid-glass border border-white/10 p-2 flex items-center gap-2 focus-within:border-primary/40 transition shrink-0", style: {
      zIndex: 1
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: toggleMic, disabled: voiceBusy, "aria-label": micLabel, className: `size-10 rounded-full grid place-items-center shrink-0 transition ${voiceActive ? "bg-primary text-primary-foreground glow-gold" : voiceBusy ? "bg-primary/60 text-primary-foreground" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`, children: voiceActive || voiceBusy ? /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "size-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(MicOff, { className: "size-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: draft, onChange: (e) => setDraft(e.target.value), onKeyDown: (e) => e.key === "Enter" && !thinking && void submit(), placeholder: inputPlaceholder, disabled: thinking || stage === "complete", className: "flex-1 bg-transparent text-sm focus:outline-none px-1 h-10 placeholder:text-muted-foreground/40 disabled:opacity-50", autoFocus: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => void submit(), disabled: !draft.trim() || thinking || stage === "complete", className: `inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-bold shrink-0 transition ${draft.trim() && !thinking && stage !== "complete" ? "bg-primary text-primary-foreground glow-gold" : "bg-white/5 text-muted-foreground"}`, children: [
        isAtReview && stage !== "complete" ? "Finish" : "Send",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "size-3" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-4 pb-8 shrink-0", style: {
      zIndex: 1
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] tracking-[0.22em] text-muted-foreground/50 font-medium", children: "SETUP PATH" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px] tracking-[0.15em] text-muted-foreground/50", children: [
          SETUP_STEPS.filter((s) => stepDone(fields, s.key)).length,
          "/",
          SETUP_STEPS.length
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center", children: SETUP_STEPS.map((step, i) => {
        const done = stepDone(fields, step.key);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `size-6 rounded-full grid place-items-center border-2 transition-all duration-500 ${done ? "bg-primary border-primary shadow-[0_0_12px_oklch(0.82_0.16_85_/_0.65)]" : "bg-white/5 border-white/15"}`, children: done && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-3.5 text-primary-foreground" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[9px] tracking-wider font-medium transition-colors duration-500 ${done ? "text-primary" : "text-muted-foreground/35"}`, children: step.label })
          ] }),
          i < SETUP_STEPS.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex-1 h-px mx-1 mb-4 transition-all duration-500 ${done ? "bg-primary/50" : "bg-white/10"}` })
        ] }, step.key);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-1 rounded-full bg-white/8 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full bg-gradient-to-r from-[oklch(0.82_0.16_85)] via-[oklch(0.7_0.25_340)] to-[oklch(0.82_0.15_215)] transition-all duration-500", style: {
          width: `${coreConfirmed / CORE_FIELDS.length * 100}%`
        } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px] text-muted-foreground/50 shrink-0", children: [
          coreConfirmed,
          "/",
          CORE_FIELDS.length,
          " required"
        ] })
      ] })
    ] })
  ] });
}
export {
  VoiceOnboarding as component
};
