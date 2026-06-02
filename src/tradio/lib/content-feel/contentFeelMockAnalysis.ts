/**
 * TREY TV UNIVERSE — Mock Content Feel analysis (Phase 1).
 *
 * Deterministic, provider-free stand-in for the future AI scan. Produces a
 * structured ContentFeelScanResult from basic upload metadata using content-type
 * archetypes + lightweight keyword signals. Swappable for a real provider in a
 * later phase without changing the ContentFeelScanResult contract.
 */

import type {
  BehavioralNeedTag,
  ContentFeelScanInput,
  ContentFeelScanResult,
  ContentType,
  ConfidenceLabel,
  EnergyTag,
  MoodDirection,
  MoodTag,
  PrescribeMeRouteMapping,
} from "./contentFeelTypes";

interface Archetype {
  summary: string;
  mood: MoodTag[];
  energy: EnergyTag[];
  need: BehavioralNeedTag[];
  direction: MoodDirection[];
  quiet: string[];
}

const ARCHETYPES: Record<ContentType, Archetype> = {
  music_track: {
    summary: "Emotional record with intimate vocals and reflective energy.",
    mood: ["reflective", "vulnerable", "intimate" as MoodTag].filter(Boolean) as MoodTag[],
    energy: ["smooth", "low", "slow_burn"],
    need: ["feel_seen", "process_emotion", "background_energy"],
    direction: ["match_mood", "comfort_user"],
    quiet: ["late_night_music", "emotional_rnb"],
  },
  album: {
    summary: "A cohesive body of work spanning multiple moods.",
    mood: ["reflective", "cinematic"],
    energy: ["slow_burn", "spacious"],
    need: ["discover", "process_emotion"],
    direction: ["match_mood"],
    quiet: ["album_deep_listen"],
  },
  playlist: {
    summary: "A curated set tuned to a consistent vibe.",
    mood: ["social", "bright"],
    energy: ["smooth", "relaxed"],
    need: ["background_energy", "discover"],
    direction: ["match_mood"],
    quiet: ["playlist_vibes"],
  },
  producer_beat: {
    summary: "A beat with strong rhythmic identity, ready for artists.",
    mood: ["confident", "dark"],
    energy: ["bouncy", "tense"],
    need: ["create", "get_motivated"],
    direction: ["energize_user"],
    quiet: ["beat_marketplace"],
  },
  beat_pack: {
    summary: "A bundle of beats spanning a producer’s range.",
    mood: ["confident"],
    energy: ["bouncy"],
    need: ["create"],
    direction: ["energize_user"],
    quiet: ["beat_marketplace"],
  },
  dj_mix: {
    summary: "A continuous mix with an energy arc built for sessions.",
    mood: ["social", "hype"],
    energy: ["high", "bouncy"],
    need: ["turn_up", "connect", "background_energy"],
    direction: ["energize_user"],
    quiet: ["mix_sessions"],
  },
  live_broadcast: {
    summary: "A live show with hosting energy and real-time community.",
    mood: ["social", "playful"],
    energy: ["high", "urgent"],
    need: ["connect", "find_community"],
    direction: ["energize_user"],
    quiet: ["live_now"],
  },
  radio_show: {
    summary: "A hosted radio show blending talk and music.",
    mood: ["social", "nostalgic"],
    energy: ["medium", "relaxed"],
    need: ["connect", "background_energy"],
    direction: ["comfort_user"],
    quiet: ["radio_grid"],
  },
  song_war_battle: {
    summary: "A competitive head-to-head music battle.",
    mood: ["confident", "aggressive"],
    energy: ["explosive", "tense"],
    need: ["compete", "participate"],
    direction: ["intensify_mood"],
    quiet: ["song_wars_live"],
  },
  song_war_round: {
    summary: "A single battle round up for voting.",
    mood: ["confident"],
    energy: ["tense"],
    need: ["compete", "participate"],
    direction: ["intensify_mood"],
    quiet: ["song_wars_live"],
  },
  video: {
    summary: "A creator video with a clear narrative tone.",
    mood: ["cinematic", "social"],
    energy: ["medium"],
    need: ["discover", "laugh"],
    direction: ["match_mood"],
    quiet: ["video_feed"],
  },
  short_video: {
    summary: "Fast short-form clip with high social pull.",
    mood: ["funny", "playful", "chaotic"],
    energy: ["fast", "bouncy"],
    need: ["laugh", "turn_up"],
    direction: ["energize_user"],
    quiet: ["shorts_feed"],
  },
  episode: {
    summary: "A series episode with developing narrative.",
    mood: ["cinematic", "serious"],
    energy: ["medium", "slow_burn"],
    need: ["escape", "reflect"],
    direction: ["match_mood"],
    quiet: ["binge_queue"],
  },
  series: {
    summary: "A multi-episode series with a sustained arc.",
    mood: ["cinematic"],
    energy: ["slow_burn"],
    need: ["escape"],
    direction: ["match_mood"],
    quiet: ["binge_queue"],
  },
  story: {
    summary: "An interactive story with branching choices.",
    mood: ["mysterious", "romantic"],
    energy: ["dreamy", "tense"],
    need: ["escape", "reflect"],
    direction: ["match_mood"],
    quiet: ["storybook_shelf"],
  },
  story_scene: {
    summary: "A single interactive scene with a decision point.",
    mood: ["mysterious"],
    energy: ["tense"],
    need: ["decision_support", "escape"],
    direction: ["challenge_user"],
    quiet: ["storybook_shelf"],
  },
  game: {
    summary: "A playable game with social or competitive pull.",
    mood: ["playful", "chaotic"],
    energy: ["high", "bouncy"],
    need: ["compete", "laugh", "connect"],
    direction: ["energize_user"],
    quiet: ["game_room"],
  },
  gif: {
    summary: "A reaction GIF for conversation.",
    mood: ["funny", "playful"],
    energy: ["fast"],
    need: ["laugh", "connect"],
    direction: ["energize_user"],
    quiet: ["fwd_reactions"],
  },
  reaction: {
    summary: "An expressive reaction clip.",
    mood: ["funny", "playful"],
    energy: ["fast"],
    need: ["laugh", "connect"],
    direction: ["energize_user"],
    quiet: ["fwd_reactions"],
  },
  dance_video: {
    summary: "A dance clip with trend and performance energy.",
    mood: ["playful", "confident", "hype"],
    energy: ["bouncy", "high"],
    need: ["participate", "turn_up"],
    direction: ["energize_user"],
    quiet: ["trance_trends"],
  },
  profile_trailer: {
    summary: "A short creator intro trailer.",
    mood: ["confident", "bright"],
    energy: ["medium"],
    need: ["discover"],
    direction: ["match_mood"],
    quiet: ["creator_discovery"],
  },
  creator_channel_item: {
    summary: "A channel item representing a creator’s lane.",
    mood: ["social"],
    energy: ["medium"],
    need: ["discover", "connect"],
    direction: ["match_mood"],
    quiet: ["creator_discovery"],
  },
};

interface KeywordSignal {
  match: RegExp;
  mood?: MoodTag[];
  energy?: EnergyTag[];
  need?: BehavioralNeedTag[];
  direction?: MoodDirection[];
  rights?: boolean;
  safety?: boolean;
}

const KEYWORD_SIGNALS: KeywordSignal[] = [
  {
    match: /\b(sad|heartbreak|breakup|crying|lonely|miss you|grief)\b/i,
    mood: ["heartbreak", "vulnerable"],
    energy: ["low", "slow_burn"],
    need: ["process_emotion", "feel_seen"],
    direction: ["comfort_user"],
  },
  {
    match: /\b(hype|turn up|party|banger|anthem|lit|energy)\b/i,
    mood: ["hype", "confident"],
    energy: ["explosive", "fast"],
    need: ["turn_up", "get_motivated"],
    direction: ["energize_user"],
  },
  {
    match: /\b(focus|study|lofi|lo-fi|chill|ambient|sleep)\b/i,
    mood: ["calm", "reflective"],
    energy: ["smooth", "relaxed"],
    need: ["focus", "calm_down", "background_energy"],
    direction: ["ground_user"],
  },
  {
    match: /\b(funny|comedy|lol|meme|skit|prank)\b/i,
    mood: ["funny", "playful"],
    energy: ["bouncy", "fast"],
    need: ["laugh"],
    direction: ["change_mood" as MoodDirection].filter(Boolean) as MoodDirection[],
  },
  {
    match: /\b(motivat|grind|win|champion|comeback)\b/i,
    mood: ["triumphant", "inspirational"],
    energy: ["high"],
    need: ["get_motivated"],
    direction: ["energize_user"],
  },
  {
    match: /\b(romantic|love|sensual|intimate)\b/i,
    mood: ["romantic", "sensual"],
    energy: ["intimate", "dreamy"],
    need: ["feel_seen"],
    direction: ["match_mood"],
  },
];

const RIGHTS_KEYWORDS = /\b(sample|cover|remix|interpolat|uncleared|leak)\b/i;
const SAFETY_KEYWORDS = /\b(explicit|graphic|violence|nsfw|gore|self.?harm)\b/i;

const uniq = <T>(arr: T[]): T[] => Array.from(new Set(arr));

const deriveMappings = (
  mood: MoodTag[],
  energy: EnergyTag[],
  need: BehavioralNeedTag[],
  strength: number,
): PrescribeMeRouteMapping[] => {
  const maps: PrescribeMeRouteMapping[] = [];
  if (need.includes("feel_seen"))
    maps.push({
      question_key: "current_need",
      answer_key: "feel_understood",
      route_score: Number((strength + 0.1).toFixed(2)),
      reason: "Reflective, intimate tone supports feeling understood.",
    });
  if (need.includes("turn_up"))
    maps.push({
      question_key: "current_need",
      answer_key: "turn_up",
      route_score: Number(strength.toFixed(2)),
      reason: "High-energy content supports turning up.",
    });
  if (need.includes("focus"))
    maps.push({
      question_key: "current_need",
      answer_key: "focus",
      route_score: Number(strength.toFixed(2)),
      reason: "Steady, low-distraction energy supports focus.",
    });
  if (need.includes("create"))
    maps.push({
      question_key: "desired_shift",
      answer_key: "help_me_create",
      route_score: Number(strength.toFixed(2)),
      reason: "Creative, generative material.",
    });
  if (mood.includes("heartbreak") || mood.includes("vulnerable"))
    maps.push({
      question_key: "desired_shift",
      answer_key: "comfort_me",
      route_score: Number((strength - 0.05).toFixed(2)),
      reason: "Supports emotional processing without high intensity.",
    });
  if (mood.includes("hype") || energy.includes("explosive"))
    maps.push({
      question_key: "desired_shift",
      answer_key: "hype_me_up",
      route_score: Number(strength.toFixed(2)),
      reason: "Explosive energy lifts mood.",
    });
  return maps;
};

const musicAttrs = (input: ContentFeelScanInput) => ({
  genre: (input.hints?.genre as string) || "R&B",
  bpm: (input.hints?.bpm as number) || 72,
  key: (input.hints?.key as string) || undefined,
  radio_fit: 0.8,
  station_fit: 0.78,
  time_of_day_fit: ["late_night", "evening"],
});

/** Deterministically analyze upload metadata into a ContentFeelScanResult. */
export const analyzeContentFeelMock = (input: ContentFeelScanInput): ContentFeelScanResult => {
  const arch = ARCHETYPES[input.content_type];
  const haystack = `${input.title} ${input.description ?? ""} ${(input.creator_tags ?? []).join(" ")} ${input.lyrics ?? ""} ${input.transcript ?? ""}`;

  let mood = [...arch.mood];
  let energy = [...arch.energy];
  let need = [...arch.need];
  let direction = [...arch.direction];
  let rights = RIGHTS_KEYWORDS.test(haystack);
  let safety = SAFETY_KEYWORDS.test(haystack);

  KEYWORD_SIGNALS.forEach((sig) => {
    if (!sig.match.test(haystack)) return;
    mood = uniq([...(sig.mood ?? []), ...mood]);
    energy = uniq([...(sig.energy ?? []), ...energy]);
    need = uniq([...(sig.need ?? []), ...need]);
    direction = uniq([...(sig.direction ?? []), ...direction]);
    if (sig.rights) rights = true;
    if (sig.safety) safety = true;
  });

  mood = mood.slice(0, 5);
  energy = energy.slice(0, 4);
  need = need.slice(0, 4);
  direction = uniq(direction).slice(0, 3);

  const matchedKeyword = KEYWORD_SIGNALS.some((s) => s.match.test(haystack));
  const confidenceScore = Math.min(
    0.95,
    0.7 + (matchedKeyword ? 0.12 : 0) + (input.transcript || input.lyrics ? 0.08 : 0),
  );
  const confidenceLabel: ConfidenceLabel =
    confidenceScore >= 0.85 ? "high" : confidenceScore >= 0.72 ? "medium" : "low";

  const isMusic = [
    "music_track",
    "album",
    "playlist",
    "producer_beat",
    "beat_pack",
    "dj_mix",
  ].includes(input.content_type);

  return {
    content_id: input.content_id,
    content_type: input.content_type,
    source_platform: input.source_platform,
    summary: arch.summary,
    mood_tags: mood,
    energy_tags: energy,
    behavioral_need_tags: need,
    mood_direction: direction,
    audience_intent: isMusic ? ["listen", "save", "play"] : ["watch", "react", "share"],
    content_intensity: safety ? ["needs_context", "mature"] : ["balanced", "safe_for_general"],
    music: isMusic ? musicAttrs(input) : undefined,
    prescribe_me_mapping: deriveMappings(mood, energy, need, confidenceScore),
    quiet_feed_contexts: uniq([...arch.quiet, `${input.source_platform}_lane`]),
    safety_review_needed: safety,
    rights_review_needed: rights,
    confidence_score: Number(confidenceScore.toFixed(2)),
    confidence_label: confidenceLabel,
    uncertainty_notes: matchedKeyword
      ? []
      : ["No strong keyword signals; tags derived from content-type archetype only."],
  };
};

/** A few ready-made sample profiles (Task 7) for UI prototyping without uploads. */
export const MOCK_SCAN_SAMPLES: ContentFeelScanInput[] = [
  {
    content_id: "sample-track-velvet",
    content_type: "music_track",
    source_platform: "tradio",
    title: "Velvet Midnight",
    description: "Late-night emotional R&B about missing someone",
    creator_tags: ["rnb", "late night", "heartbreak"],
  },
  {
    content_id: "sample-beat-heatwave",
    content_type: "producer_beat",
    source_platform: "tradio",
    title: "Southern Heatwave",
    description: "Hard Memphis trap beat, banger energy",
    creator_tags: ["trap", "hype"],
    hints: { bpm: 142, key: "A min" },
  },
  {
    content_id: "sample-episode-laugh",
    content_type: "short_video",
    source_platform: "trey_tv",
    title: "Chaotic Studio Pranks",
    description: "Funny behind-the-scenes comedy skit",
    creator_tags: ["comedy", "funny"],
  },
  {
    content_id: "sample-story-mansion",
    content_type: "story",
    source_platform: "storybook",
    title: "The Midnight Mansion",
    description: "A mysterious romance with branching choices",
    creator_tags: ["mystery", "romance"],
  },
];
