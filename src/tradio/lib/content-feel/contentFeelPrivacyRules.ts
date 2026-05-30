/**
 * TREY TV UNIVERSE — Prescribe Me privacy & safety language rules (Phase 1).
 *
 * The recommendation layer must never diagnose users, label sensitive traits, or
 * expose surveillance-style explanations. These helpers enforce broad, consent-
 * framed, user-friendly copy. Use `safeRecommendationReason()` for any text shown
 * to a user explaining WHY something was surfaced.
 */

/** Phrases that must never be shown to users (diagnosis / surveillance / manipulation). */
export const BANNED_EXPLANATION_PATTERNS: RegExp[] = [
  /you (are|seem|look|might be) (depressed|lonely|anxious|sad|angry|heartbroken)/i,
  /we (noticed|detected|tracked|know) (you|that you)/i,
  /you (always|never|keep) (skip|watch|listen|avoid)/i,
  /\b(diagnos|mental health condition|disorder)\b/i,
  /you watched .* for \d+ (hours|minutes)/i,
  /because you('| a)re (sad|lonely|depressed|angry)/i,
];

/** Approved, broad explanation templates for quiet-feed / route surfacing. */
export const SAFE_EXPLANATION_TEMPLATES = {
  recent_saves: 'Because this matches your recent saves.',
  creator_pattern: 'Because you tend to enjoy this kind of creator content.',
  listening_lane: 'Because this station fits your current listening lane.',
  collaborative: 'Because people who liked this also engaged with this route.',
  selected_answer: 'Based on what you selected.',
  selected_energy: (energy: string) => `Because you chose ${energy} energy.`,
  current_route: 'This content matches the energy of your current route.',
  recent_patterns: 'Based on recent listening patterns.',
  chosen_mood: 'This route fits the mood you chose.',
} as const;

export type SafeExplanationKey = Exclude<keyof typeof SAFE_EXPLANATION_TEMPLATES, 'selected_energy'>;

/** Returns true if a string would violate the privacy/safety language rules. */
export const isUnsafeExplanation = (text: string): boolean =>
  BANNED_EXPLANATION_PATTERNS.some((pattern) => pattern.test(text));

/**
 * Returns a safe, user-facing reason. If the proposed text is unsafe (or omitted),
 * falls back to a broad approved template. Never returns diagnosis-style copy.
 */
export const safeRecommendationReason = (proposed?: string, fallback: SafeExplanationKey = 'selected_answer'): string => {
  if (proposed && !isUnsafeExplanation(proposed)) return proposed;
  return SAFE_EXPLANATION_TEMPLATES[fallback];
};

/** Guardrails for what the creator-facing analysis view may expose. */
export const CREATOR_VIEW_RULES = {
  allowed: [
    'mood_tags',
    'energy_tags',
    'behavioral_need_tags',
    'ideal_user_need',
    'prescription_contexts',
    'recommended_platform_lane',
    'discovery_clusters',
    'confidence',
    'needs_human_review',
    'safety_review_needed',
    'rights_review_needed',
  ],
  hidden: [
    'user_match_signals',
    'engagement_prediction_bucket',
    'individual user behavior',
    'sensitive audience predictions',
    'private routing logic',
  ],
} as const;

/** Short standing notice surfaced near any Prescribe Me / recommendation UI. */
export const PRESCRIBE_ME_PRIVACY_NOTICE =
  'Prescribe Me routes content based on what you choose and broad patterns — not diagnoses or sensitive personal conclusions. You can refine or rewrite any result.';
