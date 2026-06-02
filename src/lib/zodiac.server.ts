import { createServerFn } from "@tanstack/react-start";
import {
  CUSP_GROUP_NAMES,
  ZODIAC_GROUP_NAMES,
  ageBracket,
  calculateZodiacIdentity,
  locationParts,
  staticDailyReading,
  type BirthTimePrecision,
  type ZodiacSign,
} from "@/lib/zodiac";
import { getTreyIServiceClient, verifyTreyIUser } from "@/lib/trey-i/onboarding.server";

type PreviewInput = {
  dateOfBirth: string;
  birthLocationLabel?: string;
  birthTimeLocal?: string;
  birthTimePrecision?: BirthTimePrecision;
  birthTimezone?: string;
  birthLatitude?: number;
  birthLongitude?: number;
};

type ConfirmInput = PreviewInput & {
  accessToken: string;
  zodiacPublicOptIn?: boolean;
};

const clean = (value: unknown, max = 120) =>
  String(value ?? "")
    .trim()
    .slice(0, max);

const validatePreview = (input: PreviewInput): PreviewInput => ({
  dateOfBirth: clean(input?.dateOfBirth, 20),
  birthLocationLabel: clean(input?.birthLocationLabel, 120),
  birthTimeLocal: clean(input?.birthTimeLocal, 20),
  birthTimezone: clean(input?.birthTimezone, 80),
  birthLatitude:
    typeof input?.birthLatitude === "number" && Number.isFinite(input.birthLatitude)
      ? input.birthLatitude
      : undefined,
  birthLongitude:
    typeof input?.birthLongitude === "number" && Number.isFinite(input.birthLongitude)
      ? input.birthLongitude
      : undefined,
  birthTimePrecision: (
    ["unknown", "morning", "afternoon", "evening", "night", "exact"] as const
  ).includes(input?.birthTimePrecision as BirthTimePrecision)
    ? input.birthTimePrecision
    : "unknown",
});

const validateConfirm = (input: ConfirmInput): ConfirmInput => ({
  ...validatePreview(input),
  accessToken: clean(input?.accessToken, 5000),
  zodiacPublicOptIn: input?.zodiacPublicOptIn !== false,
});

function groupName(sign: ZodiacSign, bracket: string) {
  const names = ZODIAC_GROUP_NAMES[sign];
  return names[Math.abs(bracket.length + sign.length) % names.length];
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function ensureGroupMembership(
  userId: string,
  profile: any,
  identity: NonNullable<ReturnType<typeof calculateZodiacIdentity>>,
) {
  const service = getTreyIServiceClient();
  const bracket = ageBracket(profile.date_of_birth);
  const city = locationParts(profile.birth_location_label || profile.location).city;
  const categories = Array.isArray(profile.favorite_categories) ? profile.favorite_categories : [];
  const moods = Array.isArray(profile.favorite_moods) ? profile.favorite_moods : [];
  const fanType = String(profile.fan_type ?? "").toLowerCase();
  const interest = [...categories, ...moods].find(Boolean);
  const musicInterest = [...categories, ...moods, fanType].find((value) =>
    /music|singer|vocal|artist|creator|producer/i.test(String(value)),
  );
  const entries = [
    {
      group_type: "zodiac",
      group_key: `zodiac:${identity.sunSign.toLowerCase()}:${bracket.label}`,
      group_name: groupName(identity.sunSign, bracket.label),
      group_description: `Matched by Trey TV for ${identity.sunSign} energy · ${bracket.label}.`,
      zodiac_sign: identity.sunSign,
      min_age: bracket.min,
      max_age: bracket.max,
      source: "auto",
    },
    identity.isCusp
      ? {
          group_type: "cusp",
          group_key: `cusp:${(identity.cuspLabel ?? "cusp-souls").toLowerCase().replace(/[^a-z0-9]+/g, "-")}:${bracket.label}`,
          group_name: CUSP_GROUP_NAMES[bracket.label.length % CUSP_GROUP_NAMES.length],
          group_description: `For Cusp Souls balancing ${identity.cuspLabel}.`,
          zodiac_sign: identity.sunSign,
          min_age: bracket.min,
          max_age: bracket.max,
          source: "auto",
        }
      : null,
    city
      ? {
          group_type: "local_interest",
          group_key: `city:${slug(city)}:${bracket.label}`,
          group_name: `${city} Creators Circle`,
          group_description: "Matched by Trey TV based on city and age-safe community lane.",
          city,
          min_age: bracket.min,
          max_age: bracket.max,
          source: "auto",
        }
      : null,
    interest
      ? {
          group_type: "interest",
          group_key: `interest:${slug(String(interest))}:${bracket.label}`,
          group_name: `${String(interest)} Circle`,
          group_description: "Matched by Trey TV based on onboarding interests.",
          interest_key: slug(String(interest)),
          min_age: bracket.min,
          max_age: bracket.max,
          source: "auto",
        }
      : null,
    interest
      ? {
          group_type: "age_interest",
          group_key: `age-interest:${slug(String(interest))}:${bracket.label}`,
          group_name: `${bracket.label} ${String(interest)} Room`,
          group_description: "Matched by Trey TV based on age-safe interest lanes.",
          interest_key: slug(String(interest)),
          min_age: bracket.min,
          max_age: bracket.max,
          source: "auto",
        }
      : null,
    musicInterest
      ? {
          group_type: "creator_interest",
          group_key: `creator-interest:${slug(String(musicInterest))}:${bracket.label}`,
          group_name: /singer|vocal/i.test(String(musicInterest))
            ? "Southern Vocalists"
            : `${identity.sunSign} Creators`,
          group_description: "Matched by Trey TV based on creator and music interests.",
          zodiac_sign: identity.sunSign,
          interest_key: slug(String(musicInterest)),
          min_age: bracket.min,
          max_age: bracket.max,
          source: "auto",
        }
      : null,
  ].filter(Boolean) as Array<Record<string, unknown> & { source: string }>;

  for (const entry of entries) {
    const { source, ...thread } = entry;
    const { data, error } = await (service as any)
      .from("zodiac_group_threads")
      .upsert(thread, { onConflict: "group_key" })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await (service as any)
      .from("zodiac_group_members")
      .upsert(
        { user_id: userId, group_thread_id: data.id, source, left_at: null },
        { onConflict: "user_id,group_thread_id" },
      );
  }
}

export const previewZodiacIdentity = createServerFn({ method: "POST" })
  .inputValidator(validatePreview)
  .handler(async ({ data }) => {
    const identity = calculateZodiacIdentity({
      dateOfBirth: data.dateOfBirth,
      birthLocationLabel: data.birthLocationLabel,
      birthTimePrecision: data.birthTimePrecision,
      birthTimeLocal: data.birthTimeLocal,
      birthTimezone: data.birthTimezone,
      birthLongitude: data.birthLongitude,
    });
    if (!identity) throw new Error("Enter a valid date of birth first.");
    return identity;
  });

export const confirmZodiacIdentity = createServerFn({ method: "POST" })
  .inputValidator(validateConfirm)
  .handler(async ({ data }) => {
    const { supabase, user } = await verifyTreyIUser(data.accessToken);
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select(
        "zodiac_locked_at, date_of_birth, location, favorite_categories, favorite_moods, fan_type",
      )
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.zodiac_locked_at) throw new Error("Your zodiac identity is already locked.");

    const dateOfBirth = data.dateOfBirth || profile?.date_of_birth;
    const identity = calculateZodiacIdentity({
      dateOfBirth,
      birthLocationLabel: data.birthLocationLabel,
      birthTimePrecision: data.birthTimePrecision,
      birthTimeLocal: data.birthTimeLocal,
      birthTimezone: data.birthTimezone,
      birthLongitude: data.birthLongitude,
    });
    if (!identity) throw new Error("Enter a valid date of birth first.");

    const parts = locationParts(data.birthLocationLabel);
    const now = new Date().toISOString();
    const patch = {
      date_of_birth: dateOfBirth,
      zodiac_sun_sign: identity.sunSign,
      zodiac_is_cusp: identity.isCusp,
      zodiac_cusp_label: identity.cuspLabel,
      zodiac_badge_key: identity.badgeKey,
      zodiac_locked_at: now,
      zodiac_calculation_confidence: identity.confidence,
      zodiac_public_opt_in: data.zodiacPublicOptIn !== false,
      birth_time_local:
        data.birthTimePrecision === "exact" && data.birthTimeLocal ? data.birthTimeLocal : null,
      birth_time_precision: data.birthTimePrecision,
      birth_location_label: data.birthLocationLabel || null,
      birth_location_city: parts.city,
      birth_location_region: parts.region,
      birth_location_country: parts.country,
      birth_timezone: data.birthTimezone || null,
      birth_latitude: data.birthLatitude ?? null,
      birth_longitude: data.birthLongitude ?? null,
      birth_chart_json: identity.chart,
      birth_chart_generated_at: now,
      updated_at: now,
    };

    const { data: saved, error } = await (supabase as any)
      .from("profiles")
      .update(patch)
      .eq("id", user.id)
      .select(
        "id, date_of_birth, location, birth_location_label, favorite_categories, favorite_moods, fan_type",
      )
      .single();
    if (error) throw new Error(error.message);

    await ensureGroupMembership(user.id, saved, identity);
    return identity;
  });

export const getDailyZodiacReading = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { zodiacSign?: string; cuspLabel?: string | null; isCusp?: boolean }) => ({
      zodiacSign: clean(input?.zodiacSign, 40),
      cuspLabel: input?.cuspLabel ? clean(input.cuspLabel, 80) : null,
      isCusp: input?.isCusp === true,
    }),
  )
  .handler(async ({ data }) => {
    const sign = data.zodiacSign as ZodiacSign;
    if (!sign) throw new Error("Missing zodiac sign");
    const service = getTreyIServiceClient();
    const today = new Date().toISOString().slice(0, 10);
    let readingQuery = (service as any)
      .from("daily_zodiac_readings")
      .select("*")
      .eq("zodiac_sign", sign)
      .eq("reading_date", today);
    readingQuery = data.cuspLabel
      ? readingQuery.eq("cusp_label", data.cuspLabel)
      : readingQuery.is("cusp_label", null);
    const { data: existing } = await readingQuery.maybeSingle();
    if (existing) return existing;

    const fallback = staticDailyReading(sign, data.isCusp);
    const { data: saved, error } = await (service as any)
      .from("daily_zodiac_readings")
      .insert({
        zodiac_sign: sign,
        cusp_label: data.cuspLabel,
        reading_date: today,
        title: fallback.title,
        short_message: fallback.short_message,
        full_message: fallback.full_message,
        energy_word: fallback.energy_word,
        lucky_color: fallback.lucky_color,
        lucky_number: fallback.lucky_number,
        recommended_action: fallback.recommended_action,
      })
      .select("*")
      .single();
    if (error)
      return { ...fallback, zodiac_sign: sign, cusp_label: data.cuspLabel, reading_date: today };
    return saved;
  });
