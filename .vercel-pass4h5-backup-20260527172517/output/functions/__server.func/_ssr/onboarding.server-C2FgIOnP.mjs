import { c as createServerRpc, a as createServerFn, k as getSupabasePublicEnv } from "./index.mjs";
import { c as createClient } from "../_libs/supabase__supabase-js.mjs";
import "../_libs/react.mjs";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/livekit__protocol.mjs";
import "../_libs/bufbuild__protobuf.mjs";
import "../_libs/livekit-server-sdk.mjs";
import "../_libs/jose.mjs";
import "node:buffer";
import "node:util";
import "node:fs";
import "node:path";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;
const PUBLIC_PROFILE_UID_PATTERN = /^[0-9]{16}$/;
const TREY_PUBLIC_PROFILE_UID_PATTERN = /^423[0-9]{13}$/;
const validateFinalizeInput = (input) => {
  const method = ["voice", "manual", "import_screenshot"].includes(input?.method) ? input.method : void 0;
  return {
    accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
    method
  };
};
const validateChooseOnboardingMethodInput = (input) => {
  const method = input?.method === "voice" || input?.method === "manual" ? input.method : "manual";
  return {
    accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
    method
  };
};
const validateSaveOnboardingProfileInput = (input) => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  fields: input?.fields && typeof input.fields === "object" && !Array.isArray(input.fields) ? input.fields : {}
});
function cleanText(value, max = 500) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);
}
function cleanProfileUsername(value) {
  return cleanText(value, 80).toLowerCase().replace(/^@/, "").replace(/\s+underscore\s+/g, "_").replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "").slice(0, 30);
}
function cleanHandle(value) {
  return cleanText(value, 80).replace(/^@/, "").replace(/\s+/g, "").replace(/[^\w.-]/g, "");
}
function cleanBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (value === null || typeof value === "undefined") return fallback;
  const text = cleanText(value, 20).toLowerCase();
  if (["yes", "true", "on", "show", "public", "visible", "allow"].includes(text)) return true;
  if (["no", "false", "off", "hide", "private", "hidden", "deny"].includes(text)) return false;
  return fallback;
}
function cleanList(value) {
  if (Array.isArray(value)) {
    return Array.from(new Set(value.map((item) => cleanText(item, 40)).filter(Boolean))).slice(0, 12);
  }
  return cleanText(value, 800).split(/,|\band\b|\n/i).map((item) => item.trim()).filter(Boolean).slice(0, 12);
}
function socialLinksFrom(input) {
  const links = {};
  const instagram = cleanHandle(input.instagram);
  const tiktok = cleanHandle(input.tiktok);
  const youtube = cleanText(input.youtube, 300);
  const x = cleanHandle(input.x_handle);
  if (instagram) links.instagram = instagram;
  if (tiktok) links.tiktok = tiktok;
  if (youtube) links.youtube = youtube;
  if (x) links.x = x;
  return links;
}
function sanitizeSafeProfileFields(fields, options = {}) {
  const updates = {};
  const displayName = cleanText(fields.display_name ?? fields.name, 50);
  if (displayName) {
    if (displayName.length < 2) throw new Error("Display name must be at least 2 characters");
    updates.display_name = displayName;
  }
  const usernameInput = fields.username;
  if (typeof usernameInput !== "undefined" && usernameInput !== null && cleanText(usernameInput, 80)) {
    const username = cleanProfileUsername(usernameInput);
    if (!USERNAME_PATTERN.test(username)) {
      throw new Error("Use 3-30 lowercase letters, numbers, or underscores");
    }
    updates.username = username;
  }
  const bio = cleanText(fields.bio, 160);
  if (bio) updates.bio = bio;
  const location = cleanText(fields.location, 50);
  if (location) updates.location = location;
  const rawDob = cleanText(fields.date_of_birth, 20);
  if (rawDob && /^\d{4}-\d{2}-\d{2}$/.test(rawDob)) updates.date_of_birth = rawDob;
  const categories = cleanList(fields.favorite_categories);
  if (categories.length) updates.favorite_categories = categories;
  const moods = cleanList(fields.favorite_moods);
  if (moods.length) updates.favorite_moods = moods;
  const contentFrequency = cleanText(fields.content_frequency, 40);
  if (contentFrequency) {
    if (!["daily", "weekly", "only_drops"].includes(contentFrequency)) {
      throw new Error("Unsupported content frequency");
    }
    updates.content_frequency = contentFrequency;
  }
  const fanType = cleanText(fields.fan_type, 40);
  if (fanType) {
    if (!["viewer", "trizfit", "creator", "supporter", "superfan"].includes(fanType)) {
      throw new Error("Unsupported profile type");
    }
    updates.fan_type = fanType;
  }
  const profileVisibility = cleanText(fields.profile_visibility, 40);
  if (profileVisibility) {
    if (!["public", "members_only", "private"].includes(profileVisibility)) {
      throw new Error("Unsupported profile visibility");
    }
    updates.profile_visibility = profileVisibility;
  }
  if (typeof fields.show_location !== "undefined") updates.show_location = cleanBoolean(fields.show_location, true);
  if (typeof fields.show_birthday !== "undefined") updates.show_birthday = cleanBoolean(fields.show_birthday, false);
  if (typeof fields.show_top_three !== "undefined") updates.show_top_three = cleanBoolean(fields.show_top_three, true);
  if (typeof fields.allow_top_three_adds !== "undefined") {
    updates.allow_top_three_adds = cleanBoolean(fields.allow_top_three_adds, true);
  }
  const socialLinks = socialLinksFrom(fields);
  if (Object.keys(socialLinks).length > 0) updates.social_links = socialLinks;
  if (options.requireBasics) {
    if (!updates.display_name) throw new Error("Display name is required");
    if (!updates.username) throw new Error("Username is required");
  }
  return updates;
}
function getUserClient(accessToken) {
  const token = accessToken.trim();
  if (!token) {
    throw new Error("Sign in required");
  }
  const supabaseEnv = getSupabasePublicEnv();
  if (!supabaseEnv) {
    throw new Error("Supabase is not configured");
  }
  return createClient(supabaseEnv.url, supabaseEnv.anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
}
async function verifyTreyIUser(accessToken) {
  const token = accessToken.trim();
  const supabase = getUserClient(token);
  const {
    data: {
      user
    },
    error
  } = await supabase.auth.getUser(token);
  if (error || !user) {
    throw new Error("Sign in required");
  }
  return {
    supabase,
    user: {
      email: user.email ?? null,
      id: user.id
    }
  };
}
function getTreyIServiceClient() {
  const supabaseEnv = getSupabasePublicEnv();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseEnv || !serviceKey) {
    throw new Error("Trey-I server storage is not configured");
  }
  return createClient(supabaseEnv.url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
function generateFallbackPublicProfileUid() {
  const suffix = Array.from({
    length: 13
  }, () => Math.floor(Math.random() * 10)).join("");
  return `423${suffix}`;
}
async function ensurePublicProfileUid(userId) {
  const supabase = getTreyIServiceClient();
  const {
    data: existing,
    error: existingError
  } = await supabase.from("profiles").select("site_uid, public_profile_uid").eq("id", userId).maybeSingle();
  if (existingError) {
    throw new Error(existingError.message);
  }
  if (!existing) {
    const publicUid = generateFallbackPublicProfileUid();
    const {
      error: error2
    } = await supabase.from("profiles").upsert({
      id: userId,
      public_profile_uid: publicUid,
      site_uid: publicUid,
      role: "user"
    }, {
      onConflict: "id"
    });
    if (error2) throw new Error(error2.message);
    return ensurePublicProfileUid(userId);
  }
  const existingPublicUid = cleanText(existing?.public_profile_uid, 32);
  const existingSiteUid = cleanText(existing?.site_uid, 32);
  const existingValidUid = PUBLIC_PROFILE_UID_PATTERN.test(existingPublicUid) ? existingPublicUid : PUBLIC_PROFILE_UID_PATTERN.test(existingSiteUid) ? existingSiteUid : "";
  if (existingValidUid) {
    const {
      error: error2
    } = await supabase.from("profiles").update({
      public_profile_uid: existingValidUid,
      site_uid: existingValidUid
    }).eq("id", userId);
    if (error2) throw new Error(error2.message);
    return existingValidUid;
  }
  let candidate = "";
  const {
    data: generatedUid,
    error: rpcError
  } = await supabase.rpc("generate_trey_public_profile_uid");
  if (!rpcError && typeof generatedUid === "string" && TREY_PUBLIC_PROFILE_UID_PATTERN.test(generatedUid)) {
    candidate = generatedUid;
  }
  for (let attempt = 0; !candidate && attempt < 10; attempt += 1) {
    const possibleUid = generateFallbackPublicProfileUid();
    const {
      data: collision
    } = await supabase.from("profiles").select("id").or(`site_uid.eq.${possibleUid},public_profile_uid.eq.${possibleUid}`).maybeSingle();
    if (!collision) candidate = possibleUid;
  }
  if (!candidate) return null;
  const {
    data,
    error
  } = await supabase.from("profiles").update({
    public_profile_uid: candidate,
    site_uid: candidate
  }).eq("id", userId).select("public_profile_uid").single();
  if (error) {
    throw new Error(error.message);
  }
  return data?.public_profile_uid ?? null;
}
async function ensureCompletedAccountPersistence(userId, publicProfileUid) {
  const supabase = getTreyIServiceClient();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const profilePatch = {
    id: userId,
    public_profile_uid: publicProfileUid,
    site_uid: publicProfileUid,
    onboarding_completed: true,
    onboarding_status: "completed",
    updated_at: now
  };
  const {
    error: profileError
  } = await supabase.from("profiles").upsert(profilePatch, {
    onConflict: "id"
  });
  if (profileError) throw new Error(profileError.message);
  const {
    error: prefError
  } = await supabase.from("user_preferences").upsert({
    user_id: userId,
    public_profile_uid: publicProfileUid,
    updated_at: now
  }, {
    onConflict: "user_id"
  });
  if (prefError) throw new Error(prefError.message);
  const {
    error: creditError
  } = await supabase.from("community_credit_balances").upsert({
    user_id: userId,
    public_profile_uid: publicProfileUid,
    updated_at: now
  }, {
    onConflict: "user_id"
  });
  if (creditError) throw new Error(creditError.message);
}
async function assertUsernameAvailable(supabase, username, userId) {
  const {
    data: usernameOwner,
    error
  } = await supabase.from("profiles").select("id").ilike("username", username).neq("id", userId).maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  if (usernameOwner) {
    throw new Error("That username is already taken");
  }
}
async function saveProfileFieldsForUser(accessToken, fields, options = {}) {
  const {
    supabase,
    user
  } = await verifyTreyIUser(accessToken);
  const updates = sanitizeSafeProfileFields(fields, {
    requireBasics: options.requireBasics
  });
  if (updates.username) {
    await assertUsernameAvailable(supabase, updates.username, user.id);
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const profileUpdates = {
    ...updates,
    onboarding_last_saved_at: now,
    updated_at: now
  };
  let publicProfileUid = null;
  if (options.complete) {
    publicProfileUid = await ensurePublicProfileUid(user.id);
    if (!publicProfileUid) {
      throw new Error("Your public profile link is not ready yet. Please try finishing setup again.");
    }
    profileUpdates.public_profile_uid = publicProfileUid;
    profileUpdates.site_uid = publicProfileUid;
    profileUpdates.onboarding_completed = true;
    profileUpdates.onboarding_status = "completed";
    profileUpdates.onboarding_completed_at = now;
    profileUpdates.account_setup_completed_at = now;
    profileUpdates.onboarding_method = options.method ?? "manual";
  } else {
    profileUpdates.onboarding_status = "in_progress";
    if (options.method) profileUpdates.onboarding_method = options.method;
  }
  const {
    error
  } = await supabase.from("profiles").update(profileUpdates).eq("id", user.id);
  if (error) {
    throw new Error(error.message);
  }
  if (options.complete) {
    if (!publicProfileUid) {
      throw new Error("Your public profile link is not ready yet. Please try finishing setup again.");
    }
    await ensureCompletedAccountPersistence(user.id, publicProfileUid);
    await supabase.from("user_onboarding").upsert({
      user_id: user.id,
      current_step: 99,
      selected_path: options.method === "voice" ? "voice_profile_setup" : "profile_setup",
      answers: {
        ...updates,
        public_profile_uid: publicProfileUid
      },
      completed: true,
      updated_at: now
    }, {
      onConflict: "user_id"
    }).then(() => void 0);
  }
  return {
    publicProfileUid,
    userId: user.id
  };
}
const chooseOnboardingMethod_createServerFn_handler = createServerRpc({
  id: "158d5275b118404c6378c88b6bbc169c097dd89e1e74e7566f776cd1160aa210",
  name: "chooseOnboardingMethod",
  filename: "src/lib/trey-i/onboarding.server.ts"
}, (opts) => chooseOnboardingMethod.__executeServer(opts));
const chooseOnboardingMethod = createServerFn({
  method: "POST"
}).inputValidator(validateChooseOnboardingMethodInput).handler(chooseOnboardingMethod_createServerFn_handler, async ({
  data
}) => {
  const {
    supabase,
    user
  } = await verifyTreyIUser(data.accessToken);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const {
    error
  } = await supabase.from("profiles").update({
    onboarding_method: data.method,
    onboarding_status: "in_progress",
    onboarding_last_saved_at: now,
    updated_at: now
  }).eq("id", user.id);
  if (error) {
    throw new Error(error.message);
  }
  return {
    ok: true
  };
});
const saveOnboardingProfile_createServerFn_handler = createServerRpc({
  id: "fb0adceaa37358e61cbaee59ae5cad610e70c9f11a784fd1e737be5bce2e6436",
  name: "saveOnboardingProfile",
  filename: "src/lib/trey-i/onboarding.server.ts"
}, (opts) => saveOnboardingProfile.__executeServer(opts));
const saveOnboardingProfile = createServerFn({
  method: "POST"
}).inputValidator(validateSaveOnboardingProfileInput).handler(saveOnboardingProfile_createServerFn_handler, async ({
  data
}) => {
  await saveProfileFieldsForUser(data.accessToken, data.fields, {
    method: "manual"
  });
  return {
    ok: true
  };
});
const finalizeOnboarding_createServerFn_handler = createServerRpc({
  id: "ad1bda8976de22f0ab9942c4b3e01863d0a7b6d223b682eaa4f514bc67151af3",
  name: "finalizeOnboarding",
  filename: "src/lib/trey-i/onboarding.server.ts"
}, (opts) => finalizeOnboarding.__executeServer(opts));
const finalizeOnboarding = createServerFn({
  method: "POST"
}).inputValidator(validateFinalizeInput).handler(finalizeOnboarding_createServerFn_handler, async ({
  data
}) => {
  const {
    publicProfileUid
  } = await saveProfileFieldsForUser(data.accessToken, {}, {
    complete: true,
    method: data.method ?? "manual"
  });
  if (!publicProfileUid) {
    throw new Error("Your public profile link is not ready yet. Please try finishing setup again.");
  }
  return {
    publicProfileUid
  };
});
const treyICheckUsername_createServerFn_handler = createServerRpc({
  id: "44b7ca2ab9f6c0db3ecdd5c41d9577de228d125fbdbe6d300bb4eaa221bd60d2",
  name: "treyICheckUsername",
  filename: "src/lib/trey-i/onboarding.server.ts"
}, (opts) => treyICheckUsername.__executeServer(opts));
const treyICheckUsername = createServerFn({
  method: "POST"
}).inputValidator((input) => ({
  username: typeof input?.username === "string" ? input.username : ""
})).handler(treyICheckUsername_createServerFn_handler, async ({
  data
}) => {
  const raw = data.username.toLowerCase().replace(/^@/, "").replace(/\s+underscore\s+/g, "_").replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "").slice(0, 30);
  if (!USERNAME_PATTERN.test(raw)) return {
    username: raw,
    available: false,
    reason: "invalid"
  };
  try {
    const supabase = getTreyIServiceClient();
    const {
      data: existing
    } = await supabase.from("profiles").select("id").ilike("username", raw).maybeSingle();
    if (existing) return {
      username: raw,
      available: false,
      reason: "taken"
    };
    return {
      username: raw,
      available: true,
      reason: "available"
    };
  } catch {
    return {
      username: raw,
      available: true,
      reason: "unchecked"
    };
  }
});
export {
  chooseOnboardingMethod_createServerFn_handler,
  finalizeOnboarding_createServerFn_handler,
  saveOnboardingProfile_createServerFn_handler,
  treyICheckUsername_createServerFn_handler
};
