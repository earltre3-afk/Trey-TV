import type { PrescribeMeQuestionKey as ContentFeelQuestionKey } from "@/tradio/lib/content-feel/contentFeelQuestions";
import type {
  ConfidenceLabel,
  ContentFeelProfile,
} from "@/tradio/lib/content-feel/contentFeelTypes";

export type RouteMePlatformLane =
  | "trey_tv"
  | "tradio"
  | "fwd"
  | "storybook"
  | "games"
  | "trance"
  | "all";

export type PrescribeMeQuestionKey = Extract<
  ContentFeelQuestionKey,
  "current_need" | "current_energy" | "desired_shift" | "platform_lane" | "content_type_preference"
>;

export type PrescribeMeFlowStatus =
  | "idle"
  | "in_progress"
  | "complete"
  | "limit_reached"
  | "viewing_saved"
  | "error";

export type PrescribeMeRouteDestination =
  | "creator"
  | "episode"
  | "room"
  | "video"
  | "station"
  | "artist_station"
  | "track"
  | "song_war_battle"
  | "show"
  | "beat"
  | "dj_mix"
  | "gif_pack"
  | "story_path"
  | "game_challenge"
  | "dance_trend";

export type PrescribeMeRouteConfidence = ConfidenceLabel;

export interface PrescribeMeAnswer {
  questionKey: PrescribeMeQuestionKey;
  answerKey: string;
  label: string;
}

export interface PrescribeMeQuestion {
  key: PrescribeMeQuestionKey;
  prompt: string;
  answers: { key: string; label: string; hint?: string }[];
}

export interface PrescribeMeDailyUsage {
  date: string;
  limit: number;
  used: number;
  remaining: number;
  savedRoutes: PrescribeMeSavedRoute[];
}

export interface PrescribeMeRouteReason {
  headline: string;
  detail: string;
  matchedAnswers: PrescribeMeAnswer[];
  contentFeelHints: string[];
}

export interface PrescribeMeRouteResult {
  id: string;
  title: string;
  platformLane: RouteMePlatformLane;
  destinationType: PrescribeMeRouteDestination;
  summary: string;
  reason: PrescribeMeRouteReason;
  confidence: PrescribeMeRouteConfidence;
  primaryCta: string;
  secondaryCta: string;
  imageUrl?: string;
  sourceProfile?: ContentFeelProfile;
  createdAt: string;
}

export interface PrescribeMeSavedRoute {
  id: string;
  savedAt: string;
  result: PrescribeMeRouteResult;
}

export interface PrescribeMeSession {
  id: string;
  status: PrescribeMeFlowStatus;
  answers: PrescribeMeAnswer[];
  startedAt: string;
  completedAt?: string;
  result?: PrescribeMeRouteResult;
}

export type RouteMeSection = "prescribe_me" | "universe_lanes" | "quiet_routes" | "saved_routes";

export interface RouteMeUniverseSurface {
  id: RouteMePlatformLane;
  label: string;
  eyebrow: string;
  summary: string;
  accent: string;
  examples: string[];
}

export interface QuietRouteSuggestion {
  id: string;
  title: string;
  lane: RouteMePlatformLane;
  summary: string;
  feelTags: string[];
  reason: string;
  cta: string;
}
