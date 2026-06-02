/**
 * TREY TV UNIVERSE — Content Feel → Prescribe Me / quiet-feed route mapping (Phase 1).
 *
 * Pure, deterministic functions that turn a Content Feel Profile (or scan result)
 * into (a) Prescribe Me route-index entries keyed to the structured question flow,
 * and (b) quiet-algorithm feed contexts + vectors. No AI here — just the mapping
 * contract the explicit and quiet layers both rely on.
 */

import type { PrescribeMeQuestionKey } from './contentFeelQuestions';
import type {
  BehavioralNeedTag,
  ContentFeelProfile,
  EnergyTag,
  MoodTag,
  PrescribeMeRouteIndexEntry,
  PrescribeMeRouteMapping,
  QuietRecommendationIndexEntry,
} from './contentFeelTypes';

type Mapping = { question_key: PrescribeMeQuestionKey; answer_key: string; score: number; reason: string };

/** Behavioral need → current_need answer. */
const NEED_TO_ANSWER: Partial<Record<BehavioralNeedTag, string>> = {
  feel_seen: 'feel_understood',
  process_emotion: 'process_something',
  emotional_release: 'process_something',
  turn_up: 'turn_up',
  calm_down: 'calm_down',
  focus: 'focus',
  discover: 'discover',
  get_motivated: 'motivation',
  create: 'creative_inspiration',
  background_energy: 'background_energy',
  find_community: 'community_energy',
  connect: 'community_energy',
  laugh: 'turn_up',
};

/** Mood → desired_shift answer. */
const MOOD_TO_SHIFT: Partial<Record<MoodTag, string>> = {
  heartbreak: 'comfort_me',
  vulnerable: 'comfort_me',
  lonely: 'help_me_find_my_people',
  reflective: 'match_my_mood',
  comforted: 'comfort_me',
  hype: 'hype_me_up',
  confident: 'hype_me_up',
  triumphant: 'hype_me_up',
  inspirational: 'help_me_create',
  social: 'help_me_find_my_people',
  funny: 'change_my_mood',
  chaotic: 'change_my_mood',
};

/** Energy → current_energy answer (matching, not diagnosing). */
const ENERGY_TO_STATE: Partial<Record<EnergyTag, string>> = {
  low: 'reflective',
  slow_burn: 'reflective',
  intimate: 'reflective',
  dreamy: 'reflective',
  high: 'excited',
  explosive: 'excited',
  fast: 'restless',
  urgent: 'restless',
  bouncy: 'social',
  relaxed: 'focused',
  spacious: 'focused',
};

const push = (out: Mapping[], m: Mapping) => {
  const existing = out.find((x) => x.question_key === m.question_key && x.answer_key === m.answer_key);
  if (!existing) out.push(m);
  else if (m.score > existing.score) existing.score = m.score;
};

/**
 * Derives Prescribe Me question→answer route mappings from a profile's feel tags.
 * Returns mappings sorted by descending route score.
 */
export const buildRouteMappingsFromProfile = (profile: ContentFeelProfile): PrescribeMeRouteMapping[] => {
  const out: Mapping[] = [];
  const strength = profile.prescribe_me?.route_strength_score ?? 0.7;

  profile.behavioral_need_tags.forEach((need) => {
    const answer = NEED_TO_ANSWER[need];
    if (answer) push(out, { question_key: 'current_need', answer_key: answer, score: Math.min(0.99, strength + 0.1), reason: `Content supports the "${need}" need.` });
  });

  profile.mood_tags.forEach((mood) => {
    const shift = MOOD_TO_SHIFT[mood];
    if (shift) push(out, { question_key: 'desired_shift', answer_key: shift, score: Math.min(0.95, strength), reason: `Mood "${mood}" maps to this shift.` });
  });

  profile.energy_tags.forEach((energy) => {
    const state = ENERGY_TO_STATE[energy];
    if (state) push(out, { question_key: 'current_energy', answer_key: state, score: Math.min(0.9, strength - 0.05), reason: `Energy "${energy}" matches this state.` });
  });

  // Platform lane is always routable.
  push(out, { question_key: 'platform_lane', answer_key: profile.source_platform === 'shared_universe' ? 'any' : profile.source_platform, score: 0.8, reason: 'Native platform lane.' });

  return out
    .sort((x, y) => y.score - x.score)
    .map((m) => ({ question_key: m.question_key, answer_key: m.answer_key, route_score: Number(m.score.toFixed(2)), reason: m.reason }));
};

/** Quiet-feed contexts derived from feel tags + lane (broad, non-creepy clusters). */
export const buildQuietContexts = (profile: ContentFeelProfile): string[] => {
  const contexts = new Set<string>(profile.quiet?.feed_boost_contexts ?? []);
  if (profile.energy_tags.includes('low') || profile.energy_tags.includes('intimate')) contexts.add('late_night');
  if (profile.mood_tags.includes('hype') || profile.energy_tags.includes('explosive')) contexts.add('hype_rotation');
  if (profile.behavioral_need_tags.includes('focus')) contexts.add('focus_sessions');
  if (profile.behavioral_need_tags.includes('find_community')) contexts.add('community_discovery');
  contexts.add(`${profile.source_platform}_lane`);
  contexts.add(`${profile.content_type}_pool`);
  return Array.from(contexts);
};

const toVector = (tags: string[]): Record<string, number> =>
  tags.reduce<Record<string, number>>((acc, tag) => { acc[tag] = 1; return acc; }, {});

export const profileToRouteIndexEntries = (profile: ContentFeelProfile): PrescribeMeRouteIndexEntry[] =>
  buildRouteMappingsFromProfile(profile).map((m, i) => ({
    id: `${profile.content_id}-route-${i}`,
    content_id: profile.content_id,
    content_type: profile.content_type,
    source_platform: profile.source_platform,
    question_key: m.question_key,
    answer_key: m.answer_key,
    route_score: m.route_score,
    route_reason: m.reason,
    mode_target: m.mode_target ?? null,
    active: !profile.quiet.safety_review_needed && !profile.quiet.rights_review_needed,
    created_at: new Date().toISOString(),
  }));

export const profileToQuietIndexEntry = (profile: ContentFeelProfile): QuietRecommendationIndexEntry => ({
  id: `${profile.content_id}-quiet`,
  content_id: profile.content_id,
  content_type: profile.content_type,
  source_platform: profile.source_platform,
  cluster_key: profile.quiet.discovery_clusters[0] ?? `${profile.source_platform}_general`,
  mood_vector: toVector(profile.mood_tags),
  behavior_vector: toVector(profile.behavioral_need_tags),
  feed_contexts: buildQuietContexts(profile),
  suppress_contexts: profile.quiet.feed_suppress_contexts,
  freshness_score: profile.quiet.freshness_score,
  active: !profile.quiet.safety_review_needed && !profile.quiet.rights_review_needed,
  created_at: new Date().toISOString(),
});
