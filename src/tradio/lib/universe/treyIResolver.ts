/**
 * TREY TV UNIVERSE — Trey-I resolver (registry-backed).
 *
 * The parent Trey-I runtime calls this to answer "where is X / how do I Y"
 * universe questions using the shared registry — NOT hand-coded routes. It
 * returns a short answer plus route entries the UI renders as buttons.
 *
 * Trey-I itself (LLM, chat UI, session) is parent-owned; this is the pure
 * routing/answer layer Tradio contributes. No assistant runtime is built here.
 */

import {
  findUniverseEntries,
  getUniverseEntry,
  TREY_I_FAQ,
  UNIVERSE_REGISTRY,
  type UniverseRegistryEntry,
} from "./universeRegistry";

export interface TreyIRoute {
  id: string;
  label: string;
  route: string;
  surface: UniverseRegistryEntry["surface"];
  action: UniverseRegistryEntry["action"];
  requiresAccount: boolean;
  roleRelated: boolean;
}

export interface TreyIAnswer {
  /** Short, direct answer copy. */
  answer: string;
  /** Route buttons the assistant should render. */
  routes: TreyIRoute[];
  /** Whether this came from a curated FAQ entry vs. keyword search. */
  matchedFaq: boolean;
}

const toRoute = (entry: UniverseRegistryEntry): TreyIRoute => ({
  id: entry.id,
  label: entry.label,
  route: entry.route,
  surface: entry.surface,
  action: entry.action,
  requiresAccount: Boolean(entry.requiresAccount),
  roleRelated: Boolean(entry.roleRelated),
});

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Token-overlap score between a question and an FAQ question. */
const faqScore = (query: string, faqQuestion: string): number => {
  const q = new Set(
    norm(query)
      .split(" ")
      .filter((w) => w.length > 2),
  );
  const f = new Set(
    norm(faqQuestion)
      .split(" ")
      .filter((w) => w.length > 2),
  );
  if (!q.size || !f.size) return 0;
  let overlap = 0;
  q.forEach((w) => {
    if (f.has(w)) overlap += 1;
  });
  return overlap / Math.max(q.size, f.size);
};

/**
 * Answers a free-text universe question. Prefers a curated FAQ match, then falls
 * back to registry keyword search. Always safe: returns a generic pointer to the
 * Tradio + Messenger entries if nothing matches.
 */
export const answerUniverseQuestion = (query: string): TreyIAnswer => {
  const best = TREY_I_FAQ.map((faq) => ({ faq, score: faqScore(query, faq.question) })).sort(
    (a, b) => b.score - a.score,
  )[0];

  if (best && best.score >= 0.34) {
    const routes = best.faq.entryIds
      .map(getUniverseEntry)
      .filter((e): e is UniverseRegistryEntry => Boolean(e))
      .map(toRoute);
    return { answer: best.faq.answer, routes, matchedFaq: true };
  }

  const found = findUniverseEntries(query, 3);
  if (found.length) {
    return {
      answer: `Here ${found.length === 1 ? "is" : "are"} the best match${found.length === 1 ? "" : "es"} in the Trey TV universe:`,
      routes: found.map(toRoute),
      matchedFaq: false,
    };
  }

  // Safe default — never leave the user stranded.
  const fallback = ["tradio_home", "messenger", "personal_profile"]
    .map(getUniverseEntry)
    .filter((e): e is UniverseRegistryEntry => Boolean(e))
    .map(toRoute);
  return {
    answer: "I can route you around the Trey TV universe — here are some starting points.",
    routes: fallback,
    matchedFaq: false,
  };
};

/** All curated FAQ answers with resolved route buttons (for a help panel). */
export const getAllFaqWithRoutes = (): {
  question: string;
  answer: string;
  routes: TreyIRoute[];
}[] =>
  TREY_I_FAQ.map((faq) => ({
    question: faq.question,
    answer: faq.answer,
    routes: faq.entryIds
      .map(getUniverseEntry)
      .filter((e): e is UniverseRegistryEntry => Boolean(e))
      .map(toRoute),
  }));

/** Convenience: resolve a single registry entry to a route button. */
export const resolveRoute = (id: string): TreyIRoute | null => {
  const entry = getUniverseEntry(id);
  return entry ? toRoute(entry) : null;
};

/** Surface count sanity (used by tests / parent diagnostics). */
export const universeEntryCount = (): number => UNIVERSE_REGISTRY.length;
