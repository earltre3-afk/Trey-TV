/**
 * TREY TV UNIVERSE — Content Feel service (Phase 1, mock-only / defensive).
 *
 * Orchestrates the analysis pipeline (job → scan → profile → indexing) and the
 * two Prescribe Me layers:
 *   1. Explicit Prescribe Me — guided question flow, limited to 2/day/user.
 *   2. Quiet algorithm — background ranking over content feel profiles.
 *
 * Everything is in-memory/mock for now. Functions never throw; a real Supabase /
 * AI-provider backend swaps in behind the same signatures in a later phase.
 */

import { analyzeContentFeelMock } from "./contentFeelMockAnalysis";
import {
  buildQuietContexts,
  buildRouteMappingsFromProfile,
  profileToQuietIndexEntry,
  profileToRouteIndexEntries,
} from "./contentFeelRouteMapping";
import { PRESCRIBE_ME_DAILY_LIMIT } from "./contentFeelQuestions";
import type {
  ContentAnalysisJob,
  ContentFeelProfile,
  ContentFeelScanInput,
  ContentFeelScanResult,
  PrescribeMeRouteIndexEntry,
  QuietRecommendationIndexEntry,
  ReanalysisTrigger,
} from "./contentFeelTypes";

export type ContentFeelDataSource = "mock" | "supabase";

export interface ContentFeelResult<T> {
  source: ContentFeelDataSource;
  data: T;
  warning: string | null;
}

const ok = <T>(data: T, warning: string | null = null): ContentFeelResult<T> => ({
  source: "mock",
  data,
  warning,
});

// In-memory stores (replace with Supabase tables in a later phase).
const profileCache = new Map<string, ContentFeelProfile>();
const jobCache = new Map<string, ContentAnalysisJob>();
const prescribeUsage = new Map<string, { date: string; count: number }>();

const nowIso = () => new Date().toISOString();
const today = () => new Date().toISOString().slice(0, 10);
const fingerprint = (tags: string[]) => tags.slice().sort().join("|") || "none";

// ─── Pipeline ─────────────────────────────────────────────────────────────────

/** Step 1: create a pending analysis job when an upload is created. */
export const createAnalysisJob = (
  input: ContentFeelScanInput,
  analysisType: ContentAnalysisJob["analysis_type"] = "initial",
): ContentFeelResult<ContentAnalysisJob> => {
  const job: ContentAnalysisJob = {
    id: `job-${input.content_id}-${Date.now()}`,
    content_id: input.content_id,
    content_type: input.content_type,
    source_platform: input.source_platform,
    user_id: input.creator_user_id ?? null,
    status: "pending",
    analysis_type: analysisType,
    input_metadata: input,
    output_profile: null,
    error_message: null,
    confidence_score: null,
    created_at: nowIso(),
    started_at: null,
    completed_at: null,
  };
  jobCache.set(job.id, job);
  return ok(job);
};

/** Converts a provider scan result into a full Content Feel Profile. */
export const scanResultToProfile = (
  input: ContentFeelScanInput,
  result: ContentFeelScanResult,
): ContentFeelProfile => {
  const profile: ContentFeelProfile = {
    content_id: input.content_id,
    content_type: input.content_type,
    source_platform: input.source_platform,
    creator_user_id: input.creator_user_id ?? null,
    creator_profile_id: input.creator_profile_id ?? null,
    public_profile_uid: input.public_profile_uid ?? null,
    title: input.title,
    description: input.description,
    upload_status: "ready",
    visibility: "public",
    created_at: nowIso(),
    analyzed_at: nowIso(),
    summary: result.summary,
    mood_tags: result.mood_tags,
    energy_tags: result.energy_tags,
    behavioral_need_tags: result.behavioral_need_tags,
    mood_direction: result.mood_direction,
    audience_intent: result.audience_intent,
    content_intensity: result.content_intensity,
    music: result.music,
    video: result.video,
    storybook: result.storybook,
    games: result.games,
    fwd: result.fwd,
    trance: result.trance,
    prescribe_me: {
      recommended_question_answers: result.prescribe_me_mapping,
      avoid_question_answers: [],
      route_strength_score: result.confidence_score,
      prescription_contexts: result.quiet_feed_contexts,
      ideal_user_need: result.behavioral_need_tags,
      not_ideal_for: [],
      recommended_platform_lane: input.source_platform,
      recommended_route_type: input.content_type,
    },
    quiet: {
      feed_boost_contexts: result.quiet_feed_contexts,
      feed_suppress_contexts: result.safety_review_needed ? ["general_feed", "minors_feed"] : [],
      discovery_clusters: result.quiet_feed_contexts.slice(0, 2),
      user_match_signals: [],
      content_similarity_fingerprint: fingerprint([...result.mood_tags, ...result.energy_tags]),
      freshness_score: 1,
      engagement_prediction_bucket: "unknown",
      safety_review_needed: result.safety_review_needed,
      rights_review_needed: result.rights_review_needed,
    },
    ai: {
      confidence_score: result.confidence_score,
      confidence_label: result.confidence_label,
      uncertainty_notes: result.uncertainty_notes,
      needs_human_review:
        result.confidence_label === "low" ||
        result.safety_review_needed ||
        result.rights_review_needed,
    },
  };
  // Enrich Prescribe Me mappings using the shared mapper (dedup + lane mapping).
  profile.prescribe_me.recommended_question_answers = buildRouteMappingsFromProfile(profile);
  profile.prescribe_me.prescription_contexts = buildQuietContexts(profile);
  return profile;
};

/** Steps 2–4: run analysis (mock) and produce + cache a Content Feel Profile. */
export const runContentFeelAnalysis = async (
  input: ContentFeelScanInput,
): Promise<ContentFeelResult<ContentFeelProfile>> => {
  try {
    const result = analyzeContentFeelMock(input);
    const profile = scanResultToProfile(input, result);
    profileCache.set(profile.content_id, profile);
    return ok(profile);
  } catch (error) {
    return ok(
      scanResultToProfile(input, fallbackScan(input)),
      error instanceof Error ? error.message : "Mock analysis fallback used.",
    );
  }
};

const fallbackScan = (input: ContentFeelScanInput): ContentFeelScanResult => ({
  content_id: input.content_id,
  content_type: input.content_type,
  source_platform: input.source_platform,
  summary: "Pending analysis.",
  mood_tags: [],
  energy_tags: [],
  behavioral_need_tags: [],
  mood_direction: [],
  audience_intent: [],
  content_intensity: ["needs_context"],
  prescribe_me_mapping: [],
  quiet_feed_contexts: [`${input.source_platform}_lane`],
  safety_review_needed: false,
  rights_review_needed: false,
  confidence_score: 0.4,
  confidence_label: "low",
  uncertainty_notes: ["Analysis could not complete; profile is a placeholder."],
});

export const getContentFeelProfile = (contentId: string): ContentFeelProfile | null =>
  profileCache.get(contentId) ?? null;

/** Step 6: Prescribe Me indexing. */
export const indexForPrescribeMe = (profile: ContentFeelProfile): PrescribeMeRouteIndexEntry[] =>
  profileToRouteIndexEntries(profile);

/** Step 7: Quiet algorithm indexing. */
export const indexForQuietAlgorithm = (
  profile: ContentFeelProfile,
): QuietRecommendationIndexEntry => profileToQuietIndexEntry(profile);

/** Step 8: request a re-analysis (mock: re-runs immediately). */
export const requestReanalysis = async (
  contentId: string,
  trigger: ReanalysisTrigger,
): Promise<ContentFeelResult<ContentFeelProfile | null>> => {
  const existing = profileCache.get(contentId);
  if (!existing) return ok(null, `No profile cached for ${contentId}.`);
  const input: ContentFeelScanInput = {
    content_id: existing.content_id,
    content_type: existing.content_type,
    source_platform: existing.source_platform,
    title: existing.title,
    description: existing.description,
    creator_user_id: existing.creator_user_id,
  };
  const result = await runContentFeelAnalysis(input);
  return ok(result.data, `Re-analyzed due to: ${trigger}`);
};

// ─── Explicit Prescribe Me daily limit ─────────────────────────────────────────

export interface PrescribeMeUsage {
  used: number;
  limit: number;
  remaining: number;
  canStart: boolean;
}

export const getPrescribeMeUsage = (userId: string): PrescribeMeUsage => {
  const entry = prescribeUsage.get(userId);
  const used = entry && entry.date === today() ? entry.count : 0;
  const remaining = Math.max(0, PRESCRIBE_ME_DAILY_LIMIT - used);
  return { used, limit: PRESCRIBE_ME_DAILY_LIMIT, remaining, canStart: remaining > 0 };
};

export const canStartPrescribeMe = (userId: string): boolean =>
  getPrescribeMeUsage(userId).canStart;

/** Records one explicit Prescribe Me use (call when a guided flow completes). */
export const recordPrescribeMeUse = (userId: string): PrescribeMeUsage => {
  const entry = prescribeUsage.get(userId);
  if (entry && entry.date === today()) entry.count += 1;
  else prescribeUsage.set(userId, { date: today(), count: 1 });
  return getPrescribeMeUsage(userId);
};

// ─── Quiet algorithm ranking (background; unaffected by the daily limit) ────────

export interface QuietRankInput {
  /** Feed/route context being filled, e.g. 'late_night_music'. */
  context: string;
  /** Optional behavioral signals already known for the session. */
  recentMoodTags?: string[];
  recentNeedTags?: string[];
}

/**
 * Ranks cached profiles for a quiet-feed context. Pure scoring stub: boosts
 * context matches + recent-signal overlap, suppresses review-flagged content.
 */
export const rankForQuietFeed = (
  input: QuietRankInput,
  profiles: ContentFeelProfile[] = Array.from(profileCache.values()),
): { profile: ContentFeelProfile; score: number }[] => {
  const recentMood = new Set(input.recentMoodTags ?? []);
  const recentNeed = new Set(input.recentNeedTags ?? []);
  return profiles
    .filter((p) => !p.quiet.safety_review_needed && !p.quiet.rights_review_needed)
    .map((profile) => {
      let score = 0;
      const contexts = buildQuietContexts(profile);
      if (contexts.includes(input.context)) score += 0.5;
      score += profile.mood_tags.filter((m) => recentMood.has(m)).length * 0.15;
      score += profile.behavioral_need_tags.filter((n) => recentNeed.has(n)).length * 0.15;
      score += profile.quiet.freshness_score * 0.1;
      return { profile, score: Number(score.toFixed(2)) };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
};

/** Test/util: clears in-memory caches. */
export const __resetContentFeelStores = () => {
  profileCache.clear();
  jobCache.clear();
  prescribeUsage.clear();
};
