import { c as createServerRpc, a as createServerFn, v as verifyTreyIUser, g as getTreyIServiceClient } from "./index.mjs";
import { c as calculateZodiacIdentity, l as locationParts, s as staticDailyReading, a as ageBracket, C as CUSP_GROUP_NAMES, Z as ZODIAC_GROUP_NAMES } from "./zodiac-BJiAMBSd.mjs";
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
const clean = (value, max = 120) => String(value ?? "").trim().slice(0, max);
const validatePreview = (input) => ({
  dateOfBirth: clean(input?.dateOfBirth, 20),
  birthLocationLabel: clean(input?.birthLocationLabel, 120),
  birthTimeLocal: clean(input?.birthTimeLocal, 20),
  birthTimezone: clean(input?.birthTimezone, 80),
  birthLatitude: typeof input?.birthLatitude === "number" && Number.isFinite(input.birthLatitude) ? input.birthLatitude : void 0,
  birthLongitude: typeof input?.birthLongitude === "number" && Number.isFinite(input.birthLongitude) ? input.birthLongitude : void 0,
  birthTimePrecision: ["unknown", "morning", "afternoon", "evening", "night", "exact"].includes(input?.birthTimePrecision) ? input.birthTimePrecision : "unknown"
});
const validateConfirm = (input) => ({
  ...validatePreview(input),
  accessToken: clean(input?.accessToken, 5e3),
  zodiacPublicOptIn: input?.zodiacPublicOptIn !== false
});
function groupName(sign, bracket) {
  const names = ZODIAC_GROUP_NAMES[sign];
  return names[Math.abs(bracket.length + sign.length) % names.length];
}
function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
async function ensureGroupMembership(userId, profile, identity) {
  const service = getTreyIServiceClient();
  const bracket = ageBracket(profile.date_of_birth);
  const city = locationParts(profile.birth_location_label || profile.location).city;
  const categories = Array.isArray(profile.favorite_categories) ? profile.favorite_categories : [];
  const moods = Array.isArray(profile.favorite_moods) ? profile.favorite_moods : [];
  const fanType = String(profile.fan_type ?? "").toLowerCase();
  const interest = [...categories, ...moods].find(Boolean);
  const musicInterest = [...categories, ...moods, fanType].find((value) => /music|singer|vocal|artist|creator|producer/i.test(String(value)));
  const entries = [{
    group_type: "zodiac",
    group_key: `zodiac:${identity.sunSign.toLowerCase()}:${bracket.label}`,
    group_name: groupName(identity.sunSign, bracket.label),
    group_description: `Matched by Trey TV for ${identity.sunSign} energy · ${bracket.label}.`,
    zodiac_sign: identity.sunSign,
    min_age: bracket.min,
    max_age: bracket.max,
    source: "auto"
  }, identity.isCusp ? {
    group_type: "cusp",
    group_key: `cusp:${(identity.cuspLabel ?? "cusp-souls").toLowerCase().replace(/[^a-z0-9]+/g, "-")}:${bracket.label}`,
    group_name: CUSP_GROUP_NAMES[bracket.label.length % CUSP_GROUP_NAMES.length],
    group_description: `For Cusp Souls balancing ${identity.cuspLabel}.`,
    zodiac_sign: identity.sunSign,
    min_age: bracket.min,
    max_age: bracket.max,
    source: "auto"
  } : null, city ? {
    group_type: "local_interest",
    group_key: `city:${slug(city)}:${bracket.label}`,
    group_name: `${city} Creators Circle`,
    group_description: "Matched by Trey TV based on city and age-safe community lane.",
    city,
    min_age: bracket.min,
    max_age: bracket.max,
    source: "auto"
  } : null, interest ? {
    group_type: "interest",
    group_key: `interest:${slug(String(interest))}:${bracket.label}`,
    group_name: `${String(interest)} Circle`,
    group_description: "Matched by Trey TV based on onboarding interests.",
    interest_key: slug(String(interest)),
    min_age: bracket.min,
    max_age: bracket.max,
    source: "auto"
  } : null, interest ? {
    group_type: "age_interest",
    group_key: `age-interest:${slug(String(interest))}:${bracket.label}`,
    group_name: `${bracket.label} ${String(interest)} Room`,
    group_description: "Matched by Trey TV based on age-safe interest lanes.",
    interest_key: slug(String(interest)),
    min_age: bracket.min,
    max_age: bracket.max,
    source: "auto"
  } : null, musicInterest ? {
    group_type: "creator_interest",
    group_key: `creator-interest:${slug(String(musicInterest))}:${bracket.label}`,
    group_name: /singer|vocal/i.test(String(musicInterest)) ? "Southern Vocalists" : `${identity.sunSign} Creators`,
    group_description: "Matched by Trey TV based on creator and music interests.",
    zodiac_sign: identity.sunSign,
    interest_key: slug(String(musicInterest)),
    min_age: bracket.min,
    max_age: bracket.max,
    source: "auto"
  } : null].filter(Boolean);
  for (const entry of entries) {
    const {
      source,
      ...thread
    } = entry;
    const {
      data,
      error
    } = await service.from("zodiac_group_threads").upsert(thread, {
      onConflict: "group_key"
    }).select("id").single();
    if (error) throw new Error(error.message);
    await service.from("zodiac_group_members").upsert({
      user_id: userId,
      group_thread_id: data.id,
      source,
      left_at: null
    }, {
      onConflict: "user_id,group_thread_id"
    });
  }
}
const previewZodiacIdentity_createServerFn_handler = createServerRpc({
  id: "6e0b427c068764957f473644cb3275e727da2c8b14da409f491c1f658e6a5f49",
  name: "previewZodiacIdentity",
  filename: "src/lib/zodiac.server.ts"
}, (opts) => previewZodiacIdentity.__executeServer(opts));
const previewZodiacIdentity = createServerFn({
  method: "POST"
}).inputValidator(validatePreview).handler(previewZodiacIdentity_createServerFn_handler, async ({
  data
}) => {
  const identity = calculateZodiacIdentity({
    dateOfBirth: data.dateOfBirth,
    birthLocationLabel: data.birthLocationLabel,
    birthTimePrecision: data.birthTimePrecision,
    birthTimeLocal: data.birthTimeLocal,
    birthTimezone: data.birthTimezone,
    birthLongitude: data.birthLongitude
  });
  if (!identity) throw new Error("Enter a valid date of birth first.");
  return identity;
});
const confirmZodiacIdentity_createServerFn_handler = createServerRpc({
  id: "8c3c3cad9ad0fabc6045fd491b744fd2a03840891ddcbdae73994749203284aa",
  name: "confirmZodiacIdentity",
  filename: "src/lib/zodiac.server.ts"
}, (opts) => confirmZodiacIdentity.__executeServer(opts));
const confirmZodiacIdentity = createServerFn({
  method: "POST"
}).inputValidator(validateConfirm).handler(confirmZodiacIdentity_createServerFn_handler, async ({
  data
}) => {
  const {
    supabase,
    user
  } = await verifyTreyIUser(data.accessToken);
  const {
    data: profile
  } = await supabase.from("profiles").select("zodiac_locked_at, date_of_birth, location, favorite_categories, favorite_moods, fan_type").eq("id", user.id).maybeSingle();
  if (profile?.zodiac_locked_at) throw new Error("Your zodiac identity is already locked.");
  const dateOfBirth = data.dateOfBirth || profile?.date_of_birth;
  const identity = calculateZodiacIdentity({
    dateOfBirth,
    birthLocationLabel: data.birthLocationLabel,
    birthTimePrecision: data.birthTimePrecision,
    birthTimeLocal: data.birthTimeLocal,
    birthTimezone: data.birthTimezone,
    birthLongitude: data.birthLongitude
  });
  if (!identity) throw new Error("Enter a valid date of birth first.");
  const parts = locationParts(data.birthLocationLabel);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const patch = {
    date_of_birth: dateOfBirth,
    zodiac_sun_sign: identity.sunSign,
    zodiac_is_cusp: identity.isCusp,
    zodiac_cusp_label: identity.cuspLabel,
    zodiac_badge_key: identity.badgeKey,
    zodiac_locked_at: now,
    zodiac_calculation_confidence: identity.confidence,
    zodiac_public_opt_in: data.zodiacPublicOptIn !== false,
    birth_time_local: data.birthTimePrecision === "exact" && data.birthTimeLocal ? data.birthTimeLocal : null,
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
    updated_at: now
  };
  const {
    data: saved,
    error
  } = await supabase.from("profiles").update(patch).eq("id", user.id).select("id, date_of_birth, location, birth_location_label, favorite_categories, favorite_moods, fan_type").single();
  if (error) throw new Error(error.message);
  await ensureGroupMembership(user.id, saved, identity);
  return identity;
});
const getDailyZodiacReading_createServerFn_handler = createServerRpc({
  id: "4a4eba1ddc908c8b0d90e2cdb9733e3a40ba166d58868dc7ac094c4adfd33ba3",
  name: "getDailyZodiacReading",
  filename: "src/lib/zodiac.server.ts"
}, (opts) => getDailyZodiacReading.__executeServer(opts));
const getDailyZodiacReading = createServerFn({
  method: "POST"
}).inputValidator((input) => ({
  zodiacSign: clean(input?.zodiacSign, 40),
  cuspLabel: input?.cuspLabel ? clean(input.cuspLabel, 80) : null,
  isCusp: input?.isCusp === true
})).handler(getDailyZodiacReading_createServerFn_handler, async ({
  data
}) => {
  const sign = data.zodiacSign;
  if (!sign) throw new Error("Missing zodiac sign");
  const service = getTreyIServiceClient();
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  let readingQuery = service.from("daily_zodiac_readings").select("*").eq("zodiac_sign", sign).eq("reading_date", today);
  readingQuery = data.cuspLabel ? readingQuery.eq("cusp_label", data.cuspLabel) : readingQuery.is("cusp_label", null);
  const {
    data: existing
  } = await readingQuery.maybeSingle();
  if (existing) return existing;
  const fallback = staticDailyReading(sign, data.isCusp);
  const {
    data: saved,
    error
  } = await service.from("daily_zodiac_readings").insert({
    zodiac_sign: sign,
    cusp_label: data.cuspLabel,
    reading_date: today,
    title: fallback.title,
    short_message: fallback.short_message,
    full_message: fallback.full_message,
    energy_word: fallback.energy_word,
    lucky_color: fallback.lucky_color,
    lucky_number: fallback.lucky_number,
    recommended_action: fallback.recommended_action
  }).select("*").single();
  if (error) return {
    ...fallback,
    zodiac_sign: sign,
    cusp_label: data.cuspLabel,
    reading_date: today
  };
  return saved;
});
export {
  confirmZodiacIdentity_createServerFn_handler,
  getDailyZodiacReading_createServerFn_handler,
  previewZodiacIdentity_createServerFn_handler
};
