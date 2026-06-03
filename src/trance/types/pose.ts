// TRANCE — AI pose-tracking type contracts.
// This is the typed boundary for the (replaceable) client-side pose pipeline.
// AI here is coaching guidance, NOT perfect judgment — types must always carry
// confidence + framing context so consumers can degrade gracefully.

export type PoseBodyPart =
  | "nose"
  | "left_eye"
  | "right_eye"
  | "left_ear"
  | "right_ear"
  | "left_shoulder"
  | "right_shoulder"
  | "left_elbow"
  | "right_elbow"
  | "left_wrist"
  | "right_wrist"
  | "left_hip"
  | "right_hip"
  | "left_knee"
  | "right_knee"
  | "left_ankle"
  | "right_ankle";

export interface PoseLandmark {
  x: number; // normalized 0..1 (left→right)
  y: number; // normalized 0..1 (top→bottom)
  z?: number; // relative depth if the provider supplies it
  visibility?: number; // 0..1 visibility/confidence if available
  bodyPart?: PoseBodyPart;
  timestampMs?: number;
}

export interface PoseLandmarkFrame {
  timestampMs: number;
  landmarks: PoseLandmark[];
  /** Provider-reported mean confidence for this frame, 0..1. */
  frameConfidence?: number;
  /** Number of distinct people the provider saw in this frame. */
  peopleDetected?: number;
}

export type PoseTrackingStatus =
  | "idle"
  | "requesting_permission"
  | "camera_ready"
  | "tracking"
  | "paused"
  | "stopped"
  | "unavailable"
  | "permission_denied"
  | "poor_lighting"
  | "body_out_of_frame"
  | "multiple_people_detected"
  | "error";

export type PoseTrackingErrorCode =
  | "camera_unsupported"
  | "permission_denied"
  | "no_camera_found"
  | "provider_init_failed"
  | "disabled_by_flag"
  | "unknown";

export interface PoseTrackingError {
  code: PoseTrackingErrorCode;
  message: string;
}

export interface PoseSessionConfig {
  routineId: string;
  mode: "Learn" | "Practice" | "Performance";
  /** Target FPS for landmark estimation (best-effort). */
  targetFps?: number;
  /** Minimum per-frame confidence to count a frame as "tracked". */
  minFrameConfidence?: number;
}

export interface PoseTrackingResult {
  status: PoseTrackingStatus;
  frame: PoseLandmarkFrame | null;
  confidence: PoseConfidenceReport;
  warnings: FramingWarning[];
}

export interface PoseConfidenceReport {
  /** Overall body-visibility confidence, 0..1. */
  bodyConfidence: number;
  /** Fraction of expected landmarks visible this frame, 0..1. */
  visibleRatio: number;
  /** Rolling count of frames that met minFrameConfidence. */
  trackedFrameCount: number;
  /** Total frames seen (tracked or not). */
  totalFrameCount: number;
  peopleDetected: number;
  lightingOk: boolean;
  fullBodyInFrame: boolean;
}

export type FramingWarningKind =
  | "poor_lighting"
  | "body_out_of_frame"
  | "multiple_people"
  | "low_confidence"
  | "no_person";

export interface FramingWarning {
  kind: FramingWarningKind;
  message: string;
}

// ── Target choreography comparison ─────────────────────────────────────────

export interface PoseComparisonTarget {
  timestampMs: number;
  /** Direction the dancer should be facing/moving at this cue, if known. */
  direction?: "up" | "down" | "left" | "right" | "up-right" | "up-left";
  /** Body parts emphasized by this cue, if known. */
  bodyParts?: PoseBodyPart[];
  label?: string;
}

export interface MovementCueMatch {
  targetTimestampMs: number;
  matched: boolean;
  directionMatch: boolean;
  bodyPartMatch: boolean;
  confidence: number;
  label?: string;
}

export interface TimingAlignmentResult {
  /** +ve = dancer late, -ve = early (ms). */
  deltaMs: number;
  withinWindow: boolean;
  score: number; // 0..100
}

export interface PoseComparisonResult {
  frameIndex: number;
  timestampMs: number;
  overallScore: number; // 0..100
  jointAngles: Record<string, number>;
  timingDeltaMs: number;
  confidence: number; // 0..1
}

export type PoseFeedbackTone = "strength" | "missed" | "focus";

export interface PoseFeedbackItem {
  tone: PoseFeedbackTone;
  text: string;
  timestamp?: string; // mm:ss
}

export interface SessionAiAnalysisSummary {
  accuracy: number; // 0..100
  timing: number; // 0..100
  energy: number; // 0..100
  sync: number; // 0..100
  total: number; // 0..100
  confidence: number; // 0..1 mean camera/body confidence
  trackedFrameCount: number;
  totalFrameCount: number;
  completedSections: number;
  totalSections: number;
  missedCueCount: number;
  completionPct: number; // 0..100
  feedback: PoseFeedbackItem[];
  poseProvider: string;
  poseModelVersion: string;
  cameraQuality: {
    lightingOk: boolean;
    fullBodyInFrame: boolean;
    peopleDetected: number;
  };
}

export type LeaderboardIneligibilityReason =
  | "low_confidence"
  | "body_out_of_frame"
  | "multiple_people"
  | "session_incomplete"
  | "insufficient_frames"
  | "tracking_failed"
  | "ai_disabled";

export interface LeaderboardEligibilityStatus {
  eligible: boolean;
  reason?: LeaderboardIneligibilityReason;
  message: string;
}

// ── Choreographer video analysis (AI-suggested target choreography) ─────────

export type CueDirection = "up" | "down" | "left" | "right" | "up-right" | "up-left";

export interface ChoreographyTargetFrame {
  timestampMs: number;
  landmarks: PoseLandmark[];
}

export interface SuggestedCountSection {
  index: number;
  label: string;
  counts: string;
}

export interface SuggestedDirectionCue {
  timestamp: string; // mm:ss
  direction: CueDirection;
  facing: string;
}

export interface SuggestedMoveHint {
  timestamp: string; // mm:ss
  label: string;
  description: string;
}

export interface ChoreographyAnalysis {
  routineId?: string;
  durationMs: number;
  sampledFrameCount: number;
  /** Per-sample target pose timeline (the choreographer's reference movement). */
  targetTimeline: ChoreographyTargetFrame[];
  suggestedCountSections: SuggestedCountSection[];
  suggestedDirectionCues: SuggestedDirectionCue[];
  suggestedMoveHints: SuggestedMoveHint[];
  /** AI output is a SUGGESTION — the choreographer reviews/edits before publishing. */
  suggested: true;
  poseProvider: string;
  poseModelVersion: string;
}
