// ─── Profile Polish ───────────────────────────────────────────────────────────
// Converts raw conversational captures into clean, profile-ready copy.
// Called in two places:
//   1. At field-confirmation time (normalization: name extraction, capitalization)
//   2. At review/save time (context polishing: bio + location weaving)

export type PolishContext = {
  display_name?: string;
  location?: string;
  favorite_categories?: string[];
};

// ─── Name extraction ──────────────────────────────────────────────────────────

/**
 * Extracts a clean name from a conversational utterance.
 * Strips letter-by-letter spelling patterns, name prefixes, and correction phrases.
 *
 * "Tray, T-R-A-Y"           → "Tray"
 * "No, Trey, T-R-E-Y"       → "Trey"
 * "My name is Trey"          → "Trey"
 * "I mean Trey, not Tray"    → "Trey"
 * "Actually it's spelled T-R-E-Y" → "" (caller will re-ask)
 *
 * Requires at least 3 letters in a spelling sequence so "D-J" or "A-I" are preserved.
 */
export function extractName(utterance: string): string {
  return (
    utterance
      // "spelled T-R-E-Y" or "it's spelled T-R-E-Y"
      .replace(/,?\s*(?:it'?s\s+)?spelled?\s+[A-Za-z](?:-[A-Za-z]){2,}/gi, "")
      // standalone spelling sequences: ", T-R-E-Y" or at string start
      .replace(/,?\s*\b[A-Za-z](?:-[A-Za-z]){2,}\b/g, "")
      // name / correction prefixes
      .replace(
        /^(?:i mean|actually|no[,\s]|it'?s|the name is|my name is|call me|i'?m|i am|it should be|i meant)\s+/i,
        "",
      )
      // "not Tray" / "instead of Tray" correction suffixes
      .replace(/,?\s*(?:not|instead of|rather than)\s+\S+$/i, "")
      // leading punctuation artifacts from noRe.replace()
      .replace(/^[,.\s]+/, "")
      .trim()
      .slice(0, 50)
  );
}

/** Title-cases a display name (first letter of each word capitalized). */
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ─── Location cleaning ────────────────────────────────────────────────────────

/**
 * Strips conversational prefixes and normalizes capitalization.
 * "i'm from Memphis, Tennessee" → "Memphis, Tennessee"
 * "out of Nashville"            → "Nashville"
 */
export function cleanLocation(raw: string): string {
  return raw
    .replace(/^(?:i(?:'m| am) from|i live in|from|in|it'?s|located in|out of)\s+/i, "")
    .replace(/[!?]+$/, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
    .trim()
    .slice(0, 60);
}

// ─── Bio polishing ────────────────────────────────────────────────────────────

/**
 * Polishes raw conversational bio into profile-ready copy.
 * Applies sentence capitalization and a natural period, then lightly
 * weaves in location for specific outdoor-activity phrases when the
 * location isn't already mentioned.
 *
 * Only touches phrases it can safely extend — does not invent new facts.
 */
export function polishBio(raw: string, ctx: PolishContext): string {
  if (!raw || raw.length < 3) return raw;

  let bio = raw.trim();
  // Sentence capitalization
  bio = bio.charAt(0).toUpperCase() + bio.slice(1);
  // Ensure proper ending
  if (!/[.!?]$/.test(bio)) bio += ".";

  const loc = ctx.location;
  if (loc) {
    const bioLower = bio.toLowerCase();
    const locLower = loc.toLowerCase();
    if (!bioLower.includes(locLower)) {
      // "riding bikes / my bike / bicycle" → "riding my bike through {loc}"
      bio = bio.replace(
        /\b(riding|ride)\s+((?:my\s+)?bikes?|bicycles?)\b/gi,
        `$1 my bike through ${loc}`,
      );
      // Active outdoor verbs → "{verb} around {loc}"
      // Guard: don't add if a location preposition already follows
      bio = bio.replace(
        /\b(hiking|running|jogging|skating|skateboarding|walking)\b(?!\s+(?:in|around|through|near|by)\s)/gi,
        `$1 around ${loc}`,
      );
    }
  }

  return bio;
}

// ─── List polishing ───────────────────────────────────────────────────────────

/** Capitalizes the first letter of each item in an interest or category list. */
export function polishInterestList(items: string[]): string[] {
  return items.map((item) => {
    const t = item.trim();
    return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
  });
}

// ─── Full-set polisher ────────────────────────────────────────────────────────

/**
 * Applies all polishing transforms to a complete captured field set.
 * Safe to call multiple times — already-normalized values pass through unchanged.
 * Called at review/save time, after all fields are confirmed, so location
 * context is available for bio polishing.
 */
export function polishAllFields(fields: Record<string, unknown>): Record<string, unknown> {
  const ctx: PolishContext = {
    display_name: typeof fields.display_name === "string" ? fields.display_name : undefined,
    location: typeof fields.location === "string" ? fields.location : undefined,
    favorite_categories: Array.isArray(fields.favorite_categories)
      ? (fields.favorite_categories as string[])
      : undefined,
  };

  const result: Record<string, unknown> = { ...fields };

  if (typeof fields.display_name === "string")
    result.display_name = toTitleCase(extractName(fields.display_name));
  if (typeof fields.location === "string") result.location = cleanLocation(fields.location);
  if (typeof fields.bio === "string") result.bio = polishBio(fields.bio, ctx);
  if (Array.isArray(fields.favorite_categories))
    result.favorite_categories = polishInterestList(fields.favorite_categories as string[]);
  if (Array.isArray(fields.favorite_moods))
    result.favorite_moods = polishInterestList(fields.favorite_moods as string[]);

  return result;
}
