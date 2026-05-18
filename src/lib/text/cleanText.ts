/**
 * cleanText.ts — shared text cleanup utility for Trey TV Interactive Stories.
 *
 * Converts common UTF-8 mojibake sequences (produced by Latin-1/Windows-1252
 * double-encoding) into their intended Unicode characters.  Safe to call on
 * any string — never throws, preserves normal punctuation and apostrophes.
 *
 * Apply this function:
 *   • When rendering story titles, chapter titles, scene titles, body text,
 *     choices, branch labels, cast names/descriptions, and category names.
 *   • When importing / parsing .ttstory files before saving to localStorage
 *     or the database.
 *   • When loading story records from Supabase.
 */

/** Map of mojibake sequences → intended characters. */
const MOJIBAKE_MAP: [RegExp, string][] = [
  // Smart double quotes  "  "
  [/â€œ/g, '\u201C'],   // "
  [/â€\x9D/g, '\u201D'], // "  (â€ + RIGHT DOUBLE QUOTATION MARK byte)
  [/â€/g, '\u201D'],    // " — catch remaining â€ before broader rules
  // Smart single quotes  '  '
  [/â€˜/g, '\u2018'],   // '
  [/â€™/g, '\u2019'],   // '
  // Ellipsis  …
  [/â€¦/g, '\u2026'],   // …
  // Em dash  —
  [/â€"/g, '\u2014'],   // —
  // En dash  –
  [/â€"/g, '\u2013'],   // –
  // Bullet  •
  [/â€¢/g, '\u2022'],   // •
  // Arrow  →
  [/â†'/g, '\u2192'],   // →
  // Non-breaking space artifact
  [/Â\u00A0/g, '\u00A0'], // keep NBSP but drop the Â prefix
  [/Â /g, ' '],         // Â + regular space → just a space
  [/Â/g, ''],           // lone Â → remove
  // Replacement character / null artifact
  [/\uFFFD/g, ''],
  [/\u0000/g, ''],
  // Euro sign artifact used as em dash stand-in: €"  →  —
  [/€"/g, '\u2014'],
  // Repeated whitespace cleanup
  [/[ \t]{2,}/g, ' '],
];

/**
 * Clean a single string of mojibake / encoding corruption.
 * Returns the cleaned string, trimmed of leading/trailing whitespace.
 * Returns an empty string for null / undefined / non-string inputs.
 */
export function cleanText(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value !== 'string') {
    // Attempt safe conversion; skip if the result isn't useful.
    const coerced = String(value);
    if (coerced === '[object Object]' || coerced === 'undefined' || coerced === 'null') return '';
    return cleanText(coerced);
  }

  let s = value;
  for (const [pattern, replacement] of MOJIBAKE_MAP) {
    s = s.replace(pattern, replacement);
  }
  return s.trim();
}

/**
 * Clean an array of paragraph strings.
 * Non-string items are skipped (not converted to "[object Object]").
 */
export function cleanParagraphs(paragraphs: unknown[]): string[] {
  if (!Array.isArray(paragraphs)) return [];
  return paragraphs
    .filter((p) => typeof p === 'string')
    .map((p) => cleanText(p))
    .filter(Boolean);
}

/**
 * Recursively clean all string fields in an object or array.
 * Useful for sanitising an entire .ttstory JSON payload at once.
 * Non-string leaf values are left untouched.
 */
export function cleanDeep<T>(value: T): T {
  if (typeof value === 'string') return cleanText(value) as unknown as T;
  if (Array.isArray(value)) return value.map(cleanDeep) as unknown as T;
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      result[k] = cleanDeep(v);
    }
    return result as T;
  }
  return value;
}
