import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/backend-env";

type AuthInput = {
  accessToken: string;
};

type ChooseOnboardingMethodInput = AuthInput & {
  method: "voice" | "manual";
};

type SaveOnboardingProfileInput = AuthInput & {
  fields: Record<string, unknown>;
};

type VerifiedUser = {
  email: string | null;
  id: string;
};

export type SafeProfileFields = {
  allow_top_three_adds?: boolean;
  bio?: string | null;
  content_frequency?: string | null;
  display_name?: string;
  fan_type?: string | null;
  favorite_categories?: string[] | null;
  favorite_moods?: string[] | null;
  location?: string | null;
  profile_visibility?: string;
  show_birthday?: boolean;
  show_location?: boolean;
  show_top_three?: boolean;
  social_links?: Record<string, string>;
  username?: string;
};

const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;
const PUBLIC_PROFILE_UID_PATTERN = /^423[0-9]{13}$/;

const validateAuthInput = (input: AuthInput): AuthInput => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
});

const validateChooseOnboardingMethodInput = (input: ChooseOnboardingMethodInput): ChooseOnboardingMethodInput => {
  const method = input?.method === "voice" || input?.method === "manual" ? input.method : "manual";
  return {
    accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
    method,
  };
};

const validateSaveOnboardingProfileInput = (input: SaveOnboardingProfileInput): SaveOnboardingProfileInput => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  fields: input?.fields && typeof input.fields === "object" && !Array.isArray(input.fields) ? input.fields : {},
});

function cleanText(value: unknown, max = 500): string {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);
}

function cleanProfileUsername(value: unknown): string {
  return cleanText(value, 80)
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/\s+underscore\s+/g, "_")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 30);
}

function cleanHandle(value: unknown): string {
  return cleanText(value, 80)
    .replace(/^@/, "")
    .replace(/\s+/g, "")
    .replace(/[^\w.-]/g, "");
}

function cleanBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (value === null || typeof value === "undefined") return fallback;
  const text = cleanText(value, 20).toLowerCase();
  if (["yes", "true", "on", "show", "public", "visible", "allow"].includes(text)) return true;
  if (["no", "false", "off", "hide", "private", "hidden", "deny"].includes(text)) return false;
  return fallback;
}

function cleanList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return Array.from(new Set(value.map((item) => cleanText(item, 40)).filter(Boolean))).slice(0, 12);
  }

  return cleanText(value, 800)
    .split(/,|\band\b|\n/i)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function socialLinksFrom(input: Record<string, unknown>): Record<string, string> {
  const links: Record<string, string> = {};
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

function sanitizeSafeProfileFields(fields: Record<string, unknown>, options: { requireBasics?: boolean } = {}): SafeProfileFields {
  const updates: SafeProfileFields = {};

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

function getUserClient(accessToken: string) {
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
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

export async function verifyTreyIUser(accessToken: string): Promise<{ supabase: any; user: VerifiedUser }> {
  const token = accessToken.trim();
  const supabase = getUserClient(token);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error("Sign in required");
  }

  return {
    supabase,
    user: {
      email: user.email ?? null,
      id: user.id,
    },
  };
}

export function getTreyIServiceClient() {
  const supabaseEnv = getSupabasePublicEnv();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseEnv || !serviceKey) {
    throw new Error("Trey-I server storage is not configured");
  }

  return createClient(supabaseEnv.url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function generateFallbackPublicProfileUid(): string {
  const suffix = Array.from({ length: 13 }, () => Math.floor(Math.random() * 10)).join("");
  return `423${suffix}`;
}

export async function ensurePublicProfileUid(userId: string): Promise<string | null> {
  const supabase = getTreyIServiceClient();
  const { data: existing, error: existingError } = await (supabase as any)
    .from("profiles")
    .select("site_uid, public_profile_uid")
    .eq("id", userId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  const existingPublicUid = cleanText(existing?.public_profile_uid, 32);
  const existingSiteUid = cleanText(existing?.site_uid, 32);
  const existingValidUid = PUBLIC_PROFILE_UID_PATTERN.test(existingPublicUid)
    ? existingPublicUid
    : PUBLIC_PROFILE_UID_PATTERN.test(existingSiteUid)
      ? existingSiteUid
      : "";

  if (existingValidUid) {
    const { error } = await (supabase as any)
      .from("profiles")
      .update({
        public_profile_uid: existingValidUid,
        site_uid: existingValidUid,
      })
      .eq("id", userId);

    if (error) throw new Error(error.message);
    return existingValidUid;
  }

  let candidate = "";
  const { data: generatedUid, error: rpcError } = await (supabase as any).rpc("generate_trey_public_profile_uid");
  if (!rpcError && typeof generatedUid === "string" && PUBLIC_PROFILE_UID_PATTERN.test(generatedUid)) {
    candidate = generatedUid;
  }

  for (let attempt = 0; !candidate && attempt < 10; attempt += 1) {
    const possibleUid = generateFallbackPublicProfileUid();
    const { data: collision } = await (supabase as any)
      .from("profiles")
      .select("id")
      .or(`site_uid.eq.${possibleUid},public_profile_uid.eq.${possibleUid}`)
      .maybeSingle();

    if (!collision) candidate = possibleUid;
  }

  if (!candidate) return null;

  const { data, error } = await (supabase as any)
    .from("profiles")
    .update({
      public_profile_uid: candidate,
      site_uid: candidate,
    })
    .eq("id", userId)
    .select("public_profile_uid")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data?.public_profile_uid ?? null;
}

async function assertUsernameAvailable(supabase: ReturnType<typeof createClient>, username: string, userId: string) {
  const { data: usernameOwner, error } = await (supabase as any)
    .from("profiles")
    .select("id")
    .ilike("username", username)
    .neq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (usernameOwner) {
    throw new Error("That username is already taken");
  }
}

export async function saveProfileFieldsForUser(
  accessToken: string,
  fields: Record<string, unknown>,
  options: { complete?: boolean; method?: "voice" | "manual"; requireBasics?: boolean } = {},
) {
  const { supabase, user } = await verifyTreyIUser(accessToken);
  const updates = sanitizeSafeProfileFields(fields, { requireBasics: options.requireBasics });

  if (updates.username) {
    await assertUsernameAvailable(supabase, updates.username, user.id);
  }

  const now = new Date().toISOString();
  const profileUpdates: Record<string, unknown> = {
    ...updates,
    onboarding_last_saved_at: now,
    updated_at: now,
  };

  let publicProfileUid: string | null = null;

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

  const { error } = await (supabase as any).from("profiles").update(profileUpdates).eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  if (options.complete) {
    await (supabase as any)
      .from("user_onboarding")
      .upsert(
        {
          user_id: user.id,
          current_step: 99,
          selected_path: options.method === "voice" ? "voice_profile_setup" : "profile_setup",
          answers: { ...updates, public_profile_uid: publicProfileUid },
          completed: true,
          updated_at: now,
        },
        { onConflict: "user_id" },
      )
      .then(() => undefined);
  }

  return {
    publicProfileUid,
    userId: user.id,
  };
}

export const chooseOnboardingMethod = createServerFn({ method: "POST" })
  .inputValidator(validateChooseOnboardingMethodInput)
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { supabase, user } = await verifyTreyIUser(data.accessToken);
    const now = new Date().toISOString();
    const { error } = await (supabase as any)
      .from("profiles")
      .update({
        onboarding_method: data.method,
        onboarding_status: "in_progress",
        onboarding_last_saved_at: now,
        updated_at: now,
      })
      .eq("id", user.id);

    if (error) {
      throw new Error(error.message);
    }

    return { ok: true };
  });

export const saveOnboardingProfile = createServerFn({ method: "POST" })
  .inputValidator(validateSaveOnboardingProfileInput)
  .handler(async ({ data }): Promise<{ ok: true }> => {
    await saveProfileFieldsForUser(data.accessToken, data.fields, { method: "manual" });
    return { ok: true };
  });

export const finalizeOnboarding = createServerFn({ method: "POST" })
  .inputValidator(validateAuthInput)
  .handler(async ({ data }): Promise<{ publicProfileUid: string }> => {
    const { publicProfileUid } = await saveProfileFieldsForUser(data.accessToken, {}, { complete: true, method: "manual" });
    if (!publicProfileUid) {
      throw new Error("Your public profile link is not ready yet. Please try finishing setup again.");
    }

    return { publicProfileUid };
  });
