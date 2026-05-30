const SIGN_BOUNDARIES = [
  { sign: "Capricorn", symbol: "♑", starts: [1, 1], element: "Earth", modality: "Cardinal", archetype: "Legacy Builder" },
  { sign: "Aquarius", symbol: "♒", starts: [1, 20], element: "Air", modality: "Fixed", archetype: "Future Frequency" },
  { sign: "Pisces", symbol: "♓", starts: [2, 19], element: "Water", modality: "Mutable", archetype: "Dream Current" },
  { sign: "Aries", symbol: "♈", starts: [3, 21], element: "Fire", modality: "Cardinal", archetype: "First Flame" },
  { sign: "Taurus", symbol: "♉", starts: [4, 20], element: "Earth", modality: "Fixed", archetype: "Velvet Bull" },
  { sign: "Gemini", symbol: "♊", starts: [5, 21], element: "Air", modality: "Mutable", archetype: "Twin Signal" },
  { sign: "Cancer", symbol: "♋", starts: [6, 21], element: "Water", modality: "Cardinal", archetype: "Tide Keeper" },
  { sign: "Leo", symbol: "♌", starts: [7, 23], element: "Fire", modality: "Fixed", archetype: "Solar Royal" },
  { sign: "Virgo", symbol: "♍", starts: [8, 23], element: "Earth", modality: "Mutable", archetype: "Clean Frequency" },
  { sign: "Libra", symbol: "♎", starts: [9, 23], element: "Air", modality: "Cardinal", archetype: "Balance Room" },
  { sign: "Scorpio", symbol: "♏", starts: [10, 23], element: "Water", modality: "Fixed", archetype: "Deep Water" },
  { sign: "Sagittarius", symbol: "♐", starts: [11, 22], element: "Fire", modality: "Mutable", archetype: "Wild Arrow" },
  { sign: "Capricorn", symbol: "♑", starts: [12, 22], element: "Earth", modality: "Cardinal", archetype: "Mountain Mind" }
];
const ZODIAC_GROUP_NAMES = {
  Aries: ["The Fire Starters", "The First Flames", "The Bold Rams"],
  Taurus: ["The Strong-Minded Bulls", "The Velvet Bulls", "The Grounded Ones"],
  Gemini: ["The Twin Signals", "The Double Frequency", "The Air Talkers"],
  Cancer: ["The Moonlit Shells", "The Soft Armor Circle", "The Tide Keepers"],
  Leo: ["The Solar Royals", "The Crowned Lions", "The Main Character Den"],
  Virgo: ["The Detail Gods", "The Clean Frequency", "The Precision Circle"],
  Libra: ["The Balance Room", "The Venus Circle", "The Pretty Peacekeepers"],
  Scorpio: ["The Deep Waters", "The Shadow Hearts", "The Magnetic Ones"],
  Sagittarius: ["The Wild Arrows", "The Free Spirits", "The Truth Chasers"],
  Capricorn: ["The Mountain Minds", "The Legacy Builders", "The Leading Capricorns"],
  Aquarius: ["The Future Frequency", "The Alien Minds", "The Vision Room"],
  Pisces: ["The Dream Current", "The Soft Visionaries", "The Ocean Hearts"]
};
const CUSP_GROUP_NAMES = ["The Between Worlds Circle", "The Cusp Souls", "The Double Energy Room", "The Two-Sign Tribe"];
const ZODIAC_DEGREES = 30;
const CUSP_ORB_DEGREES = 2;
const SOLAR_SIGN_BY_INDEX = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces"
];
const parseDob = (dob) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null;
  const [year, month, day] = dob.split("-").map(Number);
  const date = new Date(Date.UTC(2e3, month - 1, day));
  if (Number.isNaN(date.getTime()) || year < 1900 || year > (/* @__PURE__ */ new Date()).getFullYear()) return null;
  return { year, month, day, ordinal: date.getTime() };
};
function signMeta(sign) {
  return SIGN_BOUNDARIES.find((s) => s.sign === sign && s.starts[0] !== 12) ?? SIGN_BOUNDARIES.find((s) => s.sign === sign);
}
const ZODIAC_SYMBOLS = {
  Aries: "♈",
  Taurus: "♉",
  Gemini: "♊",
  Cancer: "♋",
  Leo: "♌",
  Virgo: "♍",
  Libra: "♎",
  Scorpio: "♏",
  Sagittarius: "♐",
  Capricorn: "♑",
  Aquarius: "♒",
  Pisces: "♓"
};
function zodiacSymbol(sign) {
  const symbol = ZODIAC_SYMBOLS[sign];
  if (symbol) return symbol;
  if (!sign) return "✦";
  return signMeta(sign)?.symbol ?? "✦";
}
function zodiacBadgeKey(sign, isCusp = false) {
  const key = String(sign ?? "unknown").toLowerCase().replace(/\s+/g, "-");
  return isCusp ? `cusp-${key}` : `zodiac-${key}`;
}
function normalizeDegrees(value) {
  return (value % 360 + 360) % 360;
}
function julianDay(date) {
  return date.getTime() / 864e5 + 24405875e-1;
}
function degSin(degrees) {
  return Math.sin(degrees * Math.PI / 180);
}
function solarLongitude(date) {
  const jd = julianDay(date);
  const t = (jd - 2451545) / 36525;
  const meanLongitude = normalizeDegrees(280.46646 + t * (36000.76983 + t * 3032e-7));
  const meanAnomaly = normalizeDegrees(357.52911 + t * (35999.05029 - 1537e-7 * t));
  const center = degSin(meanAnomaly) * (1.914602 - t * (4817e-6 + 14e-6 * t)) + degSin(2 * meanAnomaly) * (0.019993 - 101e-6 * t) + degSin(3 * meanAnomaly) * 289e-6;
  const trueLongitude = meanLongitude + center;
  const omega = 125.04 - 1934.136 * t;
  return normalizeDegrees(trueLongitude - 569e-5 - 478e-5 * degSin(omega));
}
function signFromSolarLongitude(longitude) {
  return SOLAR_SIGN_BY_INDEX[Math.floor(normalizeDegrees(longitude) / ZODIAC_DEGREES) % 12];
}
function nearestBoundary(longitude) {
  const normalized = normalizeDegrees(longitude);
  const lowerBoundary = Math.floor(normalized / ZODIAC_DEGREES) * ZODIAC_DEGREES;
  const upperBoundary = normalizeDegrees(lowerBoundary + ZODIAC_DEGREES);
  const lowerDistance = Math.min(Math.abs(normalized - lowerBoundary), 360 - Math.abs(normalized - lowerBoundary));
  const upperDistance = Math.min(Math.abs(normalized - upperBoundary), 360 - Math.abs(normalized - upperBoundary));
  const boundary = lowerDistance <= upperDistance ? lowerBoundary : upperBoundary;
  const enteringSign = signFromSolarLongitude(boundary);
  const enteringIndex = SOLAR_SIGN_BY_INDEX.indexOf(enteringSign);
  const previousSign = SOLAR_SIGN_BY_INDEX[(enteringIndex + 11) % 12];
  return {
    distance: Math.min(lowerDistance, upperDistance),
    label: `${previousSign}/${enteringSign} Cusp`
  };
}
function timeForPrecision(precision, exact) {
  if (precision === "exact" && /^\d{2}:\d{2}/.test(exact ?? "")) return exact.slice(0, 5);
  if (precision === "morning") return "08:00";
  if (precision === "afternoon") return "14:00";
  if (precision === "evening") return "19:00";
  if (precision === "night") return "23:00";
  return "12:00";
}
function timeZoneOffsetMinutes(timeZone, utcDate) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).formatToParts(utcDate);
    const get = (type) => Number(parts.find((part) => part.type === type)?.value);
    const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
    return (asUtc - utcDate.getTime()) / 6e4;
  } catch {
    return null;
  }
}
function birthMomentUtc({
  dateOfBirth,
  birthTimePrecision,
  birthTimeLocal,
  birthTimezone,
  birthLongitude
}) {
  const [year, month, day] = dateOfBirth.split("-").map(Number);
  const [hour, minute] = timeForPrecision(birthTimePrecision, birthTimeLocal).split(":").map(Number);
  const localAsUtc = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const firstOffset = birthTimezone ? timeZoneOffsetMinutes(birthTimezone, localAsUtc) : null;
  const firstGuess = firstOffset === null ? localAsUtc : new Date(localAsUtc.getTime() - firstOffset * 6e4);
  const exactOffset = birthTimezone ? timeZoneOffsetMinutes(birthTimezone, firstGuess) : null;
  const longitudeOffset = typeof birthLongitude === "number" && Number.isFinite(birthLongitude) ? Math.round(birthLongitude / 15 * 60) : null;
  const offset = exactOffset ?? longitudeOffset ?? 0;
  return {
    moment: new Date(localAsUtc.getTime() - offset * 6e4),
    method: exactOffset !== null ? "solar_longitude" : longitudeOffset !== null ? "solar_longitude_approximate_timezone" : "solar_longitude_date_noon"
  };
}
function calculateZodiacIdentity({
  dateOfBirth,
  birthTimePrecision = "unknown",
  birthLocationLabel,
  birthTimeLocal,
  birthTimezone,
  birthLongitude
}) {
  const parsed = parseDob(dateOfBirth);
  if (!parsed) return null;
  const { moment, method } = birthMomentUtc({
    dateOfBirth,
    birthTimePrecision,
    birthTimeLocal,
    birthTimezone,
    birthLongitude
  });
  const longitude = solarLongitude(moment);
  const selected = signMeta(signFromSolarLongitude(longitude));
  const cusp = nearestBoundary(longitude);
  const isCusp = cusp.distance <= CUSP_ORB_DEGREES;
  const cuspLabel = isCusp ? cusp.label : null;
  const confidence = birthTimePrecision === "exact" && method !== "solar_longitude_date_noon" ? "exact_time" : birthTimePrecision === "unknown" ? "date_only" : "approximate_time";
  return {
    sunSign: selected.sign,
    isCusp,
    cuspLabel,
    badgeKey: zodiacBadgeKey(selected.sign, isCusp),
    confidence,
    calculationMethod: method,
    chart: {
      sign: selected.sign,
      symbol: ZODIAC_SYMBOLS[selected.sign],
      element: selected.element,
      modality: selected.modality,
      archetype: selected.archetype,
      solarLongitude: Number(longitude.toFixed(4)),
      cuspOrbDegrees: Number(cusp.distance.toFixed(4)),
      calculatedWith: [dateOfBirth, birthLocationLabel, birthTimezone, birthTimePrecision !== "unknown" ? birthTimePrecision : ""].filter(Boolean).join(" · "),
      privacyNote: "Exact birth details stay private. Trey TV only shows your zodiac identity and opted-in highlights."
    }
  };
}
function ageBracket(dateOfBirth) {
  if (!dateOfBirth || !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) return { label: "18-24", min: 18, max: 24 };
  const dob = /* @__PURE__ */ new Date(`${dateOfBirth}T00:00:00`);
  const now = /* @__PURE__ */ new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || m === 0 && now.getDate() < dob.getDate()) age -= 1;
  if (age < 18) return { label: "under-18", min: 13, max: 17 };
  if (age <= 24) return { label: "18-24", min: 18, max: 24 };
  if (age <= 34) return { label: "25-34", min: 25, max: 34 };
  if (age <= 44) return { label: "35-44", min: 35, max: 44 };
  return { label: "45-plus", min: 45, max: 120 };
}
function locationParts(label) {
  const parts = String(label ?? "").split(",").map((p) => p.trim()).filter(Boolean);
  return {
    city: parts[0] ?? null,
    region: parts[1] ?? null,
    country: parts[2] ?? null
  };
}
function staticDailyReading(sign, isCusp = false) {
  const seed = sign.length + (/* @__PURE__ */ new Date()).getDate();
  const luckyNumber = seed % 9 + 1;
  const colors = ["Blue flame", "Molten gold", "Deep violet", "Chrome silver", "Midnight teal"];
  return {
    title: isCusp ? "Cusp Soul Reading" : `${sign} Energy: Stand firm, but don't stand still.`,
    short_message: isCusp ? "You were born where two energies meet. Today, don't choose one side of yourself. Use both." : "Your gift today is patience with pressure. Move slow, but make every move count.",
    full_message: isCusp ? "The middle space is not confusion. It is range. Let your second instinct speak before you decide." : "Today is about pressure becoming proof. You do not need to explain your pace to people who cannot carry your weight.",
    energy_word: isCusp ? "Alchemy" : "Proof",
    lucky_color: colors[seed % colors.length],
    lucky_number: luckyNumber,
    recommended_action: isCusp ? "Blend two ideas you usually keep separate." : "Finish one thing before chasing the next spark."
  };
}
export {
  CUSP_GROUP_NAMES as C,
  ZODIAC_GROUP_NAMES as Z,
  ageBracket as a,
  calculateZodiacIdentity as c,
  locationParts as l,
  staticDailyReading as s,
  zodiacSymbol as z
};
