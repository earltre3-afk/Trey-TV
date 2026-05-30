/**
 * TREY TV UNIVERSE — Content Feel + Prescribe Me Intelligence Layer (Phase 1).
 *
 * Shared, platform-agnostic type model describing the emotional / behavioral /
 * aesthetic "feel" of any uploaded media across Trey TV, Tradio, FWD, Storybook,
 * Games, and future Trance. These types are the contract consumed by:
 * explicit Prescribe Me routing, the quiet feed algorithm, discovery/search,
 * creator analytics, and safety/rights review.
 *
 * Phase 1 is types + mock only. No AI provider, no backend tables yet.
 */

// ─── Identity ────────────────────────────────────────────────────────────────

export type ContentType =
  | 'video'
  | 'short_video'
  | 'episode'
  | 'series'
  | 'music_track'
  | 'album'
  | 'playlist'
  | 'producer_beat'
  | 'beat_pack'
  | 'dj_mix'
  | 'live_broadcast'
  | 'radio_show'
  | 'song_war_battle'
  | 'song_war_round'
  | 'story'
  | 'story_scene'
  | 'game'
  | 'gif'
  | 'reaction'
  | 'dance_video'
  | 'profile_trailer'
  | 'creator_channel_item';

export type SourcePlatform =
  | 'trey_tv'
  | 'tradio'
  | 'fwd'
  | 'storybook'
  | 'games'
  | 'trance'
  | 'shared_universe';

export type ContentVisibility = 'public' | 'private' | 'unlisted' | 'followers' | 'draft';

export type ContentUploadStatus =
  | 'pending'
  | 'uploading'
  | 'processing'
  | 'analyzing'
  | 'ready'
  | 'published'
  | 'failed'
  | 'removed';

// ─── Feel tag vocabularies ─────────────────────────────────────────────────────

export type MoodTag =
  | 'understood' | 'comforted' | 'hype' | 'calm' | 'focus' | 'healing' | 'reflective'
  | 'romantic' | 'heartbreak' | 'confident' | 'rebellious' | 'funny' | 'chaotic'
  | 'mysterious' | 'dark' | 'bright' | 'spiritual' | 'nostalgic' | 'lonely' | 'social'
  | 'inspirational' | 'cinematic' | 'sensual' | 'aggressive' | 'playful' | 'serious'
  | 'vulnerable' | 'triumphant';

export type EnergyTag =
  | 'low' | 'medium' | 'high' | 'explosive' | 'smooth' | 'slow_burn' | 'fast'
  | 'bouncy' | 'tense' | 'relaxed' | 'dreamy' | 'urgent' | 'intimate' | 'spacious';

export type BehavioralNeedTag =
  | 'escape' | 'process_emotion' | 'feel_seen' | 'turn_up' | 'calm_down' | 'focus'
  | 'discover' | 'create' | 'learn' | 'laugh' | 'connect' | 'compete' | 'participate'
  | 'reflect' | 'get_motivated' | 'find_community' | 'background_energy'
  | 'emotional_release' | 'decision_support';

export type MoodDirection =
  | 'match_mood' | 'shift_mood' | 'intensify_mood' | 'soften_mood'
  | 'challenge_user' | 'comfort_user' | 'energize_user' | 'ground_user';

export type AudienceIntent =
  | 'watch' | 'listen' | 'join' | 'vote' | 'comment' | 'react' | 'share'
  | 'create_with' | 'remix' | 'battle' | 'follow' | 'save' | 'request' | 'broadcast' | 'play';

export type ContentIntensity =
  | 'gentle' | 'balanced' | 'intense' | 'explicit' | 'mature' | 'sensitive'
  | 'high_conflict' | 'high_energy' | 'safe_for_general' | 'needs_context';

// ─── Lane-specific attribute blocks ────────────────────────────────────────────

export interface MusicFeelAttributes {
  genre?: string;
  subgenre?: string;
  bpm?: number;
  key?: string;
  vocal_energy?: EnergyTag | string;
  sonic_texture?: string;
  lyrical_mood?: MoodTag | string;
  instrumental_mood?: MoodTag | string;
  radio_fit?: number;
  playlist_fit?: number;
  station_fit?: number;
  time_of_day_fit?: string[];
  artist_similarity?: string[];
  producer_style?: string;
  dj_mix_fit?: number;
}

export interface VideoFeelAttributes {
  narrative_mood?: MoodTag | string;
  pacing?: EnergyTag | string;
  visual_energy?: EnergyTag | string;
  topic_tags?: string[];
  episode_theme?: string;
  humor_level?: number;
  drama_level?: number;
  educational_value?: number;
  binge_potential?: number;
  social_clip_potential?: number;
}

export interface StorybookFeelAttributes {
  genre?: string;
  emotional_arc?: string;
  choice_style?: string;
  stakes_level?: number;
  fantasy_level?: number;
  romance_level?: number;
  horror_level?: number;
  mystery_level?: number;
  moral_complexity?: number;
  replayability?: number;
}

export interface GameFeelAttributes {
  energy_level?: EnergyTag | string;
  social_level?: number;
  competition_level?: number;
  casual_vs_serious?: number;
  focus_required?: number;
  session_length?: string;
  challenge_level?: number;
  party_game_fit?: number;
}

export interface FwdFeelAttributes {
  reaction_emotion?: MoodTag | string;
  conversation_use?: string[];
  humor_style?: string;
  intensity?: ContentIntensity | string;
  sarcasm_level?: number;
  flirt_level?: number;
  support_level?: number;
  celebration_level?: number;
}

export interface TranceFeelAttributes {
  dance_energy?: EnergyTag | string;
  difficulty?: number;
  trend_potential?: number;
  solo_or_group?: 'solo' | 'group' | 'either';
  performance_style?: string;
  tutorial_fit?: number;
  challenge_fit?: number;
}

// ─── Prescribe Me mapping + quiet algorithm metadata ───────────────────────────

export interface PrescribeMeRouteMapping {
  question_key: string;
  answer_key: string;
  route_score: number;
  reason: string;
  mode_target?: string;
}

export interface PrescribeMeMeta {
  recommended_question_answers: PrescribeMeRouteMapping[];
  avoid_question_answers: { question_key: string; answer_key: string; reason?: string }[];
  route_strength_score: number;
  prescription_contexts: string[];
  ideal_user_need: BehavioralNeedTag[];
  not_ideal_for: BehavioralNeedTag[];
  recommended_platform_lane: SourcePlatform;
  recommended_route_type: string;
}

export type EngagementBucket = 'low' | 'medium' | 'high' | 'viral_potential' | 'unknown';

export interface QuietAlgorithmMeta {
  feed_boost_contexts: string[];
  feed_suppress_contexts: string[];
  discovery_clusters: string[];
  user_match_signals: string[];
  content_similarity_fingerprint: string;
  freshness_score: number;
  engagement_prediction_bucket: EngagementBucket;
  safety_review_needed: boolean;
  rights_review_needed: boolean;
}

export type ConfidenceLabel = 'low' | 'medium' | 'high' | 'very_high';

export interface AiConfidence {
  confidence_score: number;
  confidence_label: ConfidenceLabel;
  uncertainty_notes: string[];
  needs_human_review: boolean;
}

// ─── The Content Feel Profile ──────────────────────────────────────────────────

export interface ContentFeelProfile {
  // Identity
  content_id: string;
  content_type: ContentType;
  source_platform: SourcePlatform;
  creator_user_id?: string | null;
  creator_profile_id?: string | null;
  public_profile_uid?: string | null;
  title: string;
  description?: string;
  upload_status: ContentUploadStatus;
  visibility: ContentVisibility;
  created_at: string;
  analyzed_at?: string | null;

  // Universal feel
  summary: string;
  mood_tags: MoodTag[];
  energy_tags: EnergyTag[];
  behavioral_need_tags: BehavioralNeedTag[];
  mood_direction: MoodDirection[];
  audience_intent: AudienceIntent[];
  content_intensity: ContentIntensity[];

  // Lane-specific (only the relevant block is populated)
  music?: MusicFeelAttributes;
  video?: VideoFeelAttributes;
  storybook?: StorybookFeelAttributes;
  games?: GameFeelAttributes;
  fwd?: FwdFeelAttributes;
  trance?: TranceFeelAttributes;

  // Routing + quiet algorithm + confidence
  prescribe_me: PrescribeMeMeta;
  quiet: QuietAlgorithmMeta;
  ai: AiConfidence;
}

// ─── AI scan output (provider-agnostic structured result) ──────────────────────

export interface ContentFeelScanInput {
  content_id: string;
  content_type: ContentType;
  source_platform: SourcePlatform;
  title: string;
  description?: string;
  creator_user_id?: string | null;
  creator_profile_id?: string | null;
  public_profile_uid?: string | null;
  duration_seconds?: number;
  transcript?: string;
  lyrics?: string;
  captions?: string;
  creator_tags?: string[];
  /** Lane hints a creator already supplied (e.g. genre, bpm). */
  hints?: Record<string, unknown>;
}

/** The JSON contract returned by any (mock or real) analysis provider. */
export interface ContentFeelScanResult {
  content_id: string;
  content_type: ContentType;
  source_platform: SourcePlatform;
  summary: string;
  mood_tags: MoodTag[];
  energy_tags: EnergyTag[];
  behavioral_need_tags: BehavioralNeedTag[];
  mood_direction: MoodDirection[];
  audience_intent: AudienceIntent[];
  content_intensity: ContentIntensity[];
  music?: MusicFeelAttributes;
  video?: VideoFeelAttributes;
  storybook?: StorybookFeelAttributes;
  games?: GameFeelAttributes;
  fwd?: FwdFeelAttributes;
  trance?: TranceFeelAttributes;
  prescribe_me_mapping: PrescribeMeRouteMapping[];
  quiet_feed_contexts: string[];
  safety_review_needed: boolean;
  rights_review_needed: boolean;
  confidence_score: number;
  confidence_label: ConfidenceLabel;
  uncertainty_notes: string[];
}

// ─── Pipeline records (mirror future Supabase tables) ──────────────────────────

export type AnalysisJobStatus = 'pending' | 'running' | 'succeeded' | 'failed' | 'cancelled' | 'needs_review';
export type AnalysisType = 'initial' | 'reanalysis' | 'manual_override' | 'safety_recheck';

export interface ContentAnalysisJob {
  id: string;
  content_id: string;
  content_type: ContentType;
  source_platform: SourcePlatform;
  user_id?: string | null;
  status: AnalysisJobStatus;
  analysis_type: AnalysisType;
  input_metadata: ContentFeelScanInput;
  output_profile?: ContentFeelProfile | null;
  error_message?: string | null;
  confidence_score?: number | null;
  created_at: string;
  started_at?: string | null;
  completed_at?: string | null;
}

export interface ContentFeelProfileRecord {
  id: string;
  content_id: string;
  content_type: ContentType;
  source_platform: SourcePlatform;
  user_id?: string | null;
  profile_json: ContentFeelProfile;
  mood_tags: MoodTag[];
  energy_tags: EnergyTag[];
  behavioral_need_tags: BehavioralNeedTag[];
  route_strength_score: number;
  safety_review_needed: boolean;
  rights_review_needed: boolean;
  confidence_score: number;
  analyzed_at: string;
  updated_at: string;
}

export interface PrescribeMeRouteIndexEntry {
  id: string;
  content_id: string;
  content_type: ContentType;
  source_platform: SourcePlatform;
  question_key: string;
  answer_key: string;
  route_score: number;
  route_reason: string;
  mode_target?: string | null;
  active: boolean;
  created_at: string;
}

export interface QuietRecommendationIndexEntry {
  id: string;
  content_id: string;
  content_type: ContentType;
  source_platform: SourcePlatform;
  cluster_key: string;
  mood_vector: Record<string, number>;
  behavior_vector: Record<string, number>;
  feed_contexts: string[];
  suppress_contexts: string[];
  freshness_score: number;
  active: boolean;
  created_at: string;
}

/** Reasons that can re-trigger analysis. */
export type ReanalysisTrigger =
  | 'title_or_description_changed'
  | 'transcript_added'
  | 'creator_category_changed'
  | 'performance_mismatch'
  | 'moderation_status_changed'
  | 'user_feedback_wrong';
