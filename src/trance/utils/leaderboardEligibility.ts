// TRANCE — Leaderboard eligibility rules (pure). Only Performance mode with a
// verified AI-tracked attempt is eligible. Honest by design: if we can't verify
// the body/camera, the score still saves but is NOT submitted to the leaderboard.
import type { LeaderboardEligibilityStatus, PoseConfidenceReport } from "../types";

export const ELIGIBILITY_THRESHOLDS = {
  minConfidence: 0.6,
  minTrackedFrames: 60,
  minCompletionPct: 90,
};

export interface EligibilityInput {
  mode: "Learn" | "Practice" | "Performance";
  aiEnabled: boolean;
  trackingFailed: boolean;
  confidence: PoseConfidenceReport;
  completionPct: number;
  trackedFrameCount: number;
}

export function evaluateLeaderboardEligibility(
  i: EligibilityInput,
): LeaderboardEligibilityStatus {
  if (i.mode !== "Performance") {
    return {
      eligible: false,
      reason: "session_incomplete",
      message: `${i.mode} sessions aren't submitted to the leaderboard.`,
    };
  }
  if (!i.aiEnabled || i.trackingFailed) {
    return {
      eligible: false,
      reason: i.aiEnabled ? "tracking_failed" : "ai_disabled",
      message: i.aiEnabled
        ? "Pose tracking failed — not eligible for the leaderboard."
        : "AI pose tracking is off — performance not verified, not eligible.",
    };
  }
  if (i.confidence.peopleDetected > 1) {
    return {
      eligible: false,
      reason: "multiple_people",
      message: "Multiple people detected — not eligible for the leaderboard.",
    };
  }
  if (!i.confidence.fullBodyInFrame) {
    return {
      eligible: false,
      reason: "body_out_of_frame",
      message: "Not eligible for leaderboard because your body was out of frame.",
    };
  }
  if (i.confidence.bodyConfidence < ELIGIBILITY_THRESHOLDS.minConfidence) {
    return {
      eligible: false,
      reason: "low_confidence",
      message: "Camera confidence too low — not eligible for the leaderboard.",
    };
  }
  if (i.trackedFrameCount < ELIGIBILITY_THRESHOLDS.minTrackedFrames) {
    return {
      eligible: false,
      reason: "insufficient_frames",
      message: "Not enough clean tracked frames — not eligible for the leaderboard.",
    };
  }
  if (i.completionPct < ELIGIBILITY_THRESHOLDS.minCompletionPct) {
    return {
      eligible: false,
      reason: "session_incomplete",
      message: "Finish the full routine to be eligible for the leaderboard.",
    };
  }
  return { eligible: true, message: "Performance verified — submitted to the leaderboard." };
}
