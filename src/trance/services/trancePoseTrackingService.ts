// TRANCE — Pose tracking service (typed, replaceable, UI-free, DB-free).
//
// This is the orchestration boundary for the client-side pose pipeline. It owns
// the provider lifecycle + a rolling confidence tally and exposes pure analysis
// helpers. It NEVER touches the DOM directly (the hook passes the <video>) and
// NEVER writes to Supabase. AI here is coaching guidance, not perfect judgment.
import { createPoseProvider, isPoseDebugEnabled, type PoseProvider } from "./poseProviders";
import {
  calculateOverallPoseScore,
  calculateSectionAccuracy,
  compareBodyPartMovement,
  compareDirectionCue,
  compareTimingWindow,
  createFeedbackItems,
} from "../utils/poseComparison";
import type {
  FramingWarning,
  MovementCueMatch,
  PoseComparisonTarget,
  PoseConfidenceReport,
  PoseFeedbackItem,
  PoseLandmarkFrame,
  PoseSessionConfig,
  SessionAiAnalysisSummary,
  TimingAlignmentResult,
} from "../types";

const EXPECTED_PARTS = 13;

export interface PoseTracker {
  provider: PoseProvider;
  config: PoseSessionConfig | null;
  active: boolean;
  paused: boolean;
  totalFrameCount: number;
  trackedFrameCount: number;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const meanVis = (frame: PoseLandmarkFrame): number => {
  if (!frame.landmarks.length) return 0;
  const sum = frame.landmarks.reduce((s, l) => s + (l.visibility ?? 1), 0);
  return sum / frame.landmarks.length;
};

export const trancePoseTrackingService = {
  isPoseTrackingEnabled: (): boolean => import.meta.env.VITE_TRANCE_ENABLE_AI_POSE === "true",
  isCameraEnabled: (): boolean => import.meta.env.VITE_TRANCE_ENABLE_CAMERA === "true",
  isPoseDebugEnabled,

  createPoseTracker: (): PoseTracker => ({
    provider: createPoseProvider(),
    config: null,
    active: false,
    paused: false,
    totalFrameCount: 0,
    trackedFrameCount: 0,
  }),

  startPoseSession: async (
    tracker: PoseTracker,
    config: PoseSessionConfig,
  ): Promise<{ ok: boolean; error?: string }> => {
    tracker.config = config;
    tracker.totalFrameCount = 0;
    tracker.trackedFrameCount = 0;
    const res = await tracker.provider.initialize();
    tracker.active = res.ok;
    tracker.paused = false;
    return res;
  },

  pausePoseSession: (tracker: PoseTracker): void => {
    tracker.paused = true;
  },

  resumePoseSession: (tracker: PoseTracker): void => {
    tracker.paused = false;
  },

  stopPoseSession: (tracker: PoseTracker): void => {
    tracker.active = false;
    tracker.paused = false;
    try {
      tracker.provider.dispose();
    } catch {
      /* ignore */
    }
  },

  detectPoseFrame: (
    tracker: PoseTracker,
    video: HTMLVideoElement | null,
    timestampMs: number,
  ): PoseLandmarkFrame | null => {
    if (!tracker.active || tracker.paused) return null;
    tracker.provider.attachVideoElement(video);
    const raw = tracker.provider.estimateFrame(timestampMs);
    tracker.totalFrameCount++;
    if (!raw) return null;
    const minConf = tracker.config?.minFrameConfidence ?? 0.4;
    const conf = raw.frameConfidence ?? meanVis(raw);
    if (conf >= minConf) tracker.trackedFrameCount++;
    return trancePoseTrackingService.normalizePoseFrame(raw);
  },

  normalizePoseFrame: (frame: PoseLandmarkFrame): PoseLandmarkFrame => ({
    ...frame,
    landmarks: frame.landmarks.map((l) => ({ ...l, x: clamp01(l.x), y: clamp01(l.y) })),
  }),

  estimatePoseConfidence: (
    tracker: PoseTracker,
    frame: PoseLandmarkFrame | null,
  ): PoseConfidenceReport => {
    const visible = frame ? frame.landmarks.filter((l) => (l.visibility ?? 1) > 0.4).length : 0;
    const visibleRatio = frame ? Math.min(1, visible / EXPECTED_PARTS) : 0;
    const bodyConfidence = frame ? (frame.frameConfidence ?? meanVis(frame)) : 0;
    const peopleDetected = frame?.peopleDetected ?? (frame ? 1 : 0);
    return {
      bodyConfidence,
      visibleRatio,
      trackedFrameCount: tracker.trackedFrameCount,
      totalFrameCount: tracker.totalFrameCount,
      peopleDetected,
      lightingOk: bodyConfidence >= 0.5,
      fullBodyInFrame: visibleRatio >= 0.7,
    };
  },

  detectFramingWarnings: (report: PoseConfidenceReport): FramingWarning[] => {
    const warnings: FramingWarning[] = [];
    if (report.peopleDetected === 0)
      warnings.push({ kind: "no_person", message: "No dancer detected — step into frame." });
    if (report.peopleDetected > 1)
      warnings.push({
        kind: "multiple_people",
        message: "Multiple people detected — only one dancer should be in frame.",
      });
    if (!report.lightingOk)
      warnings.push({ kind: "poor_lighting", message: "Low confidence — improve your lighting." });
    if (!report.fullBodyInFrame && report.peopleDetected >= 1)
      warnings.push({
        kind: "body_out_of_frame",
        message: "Keep your full body in the frame.",
      });
    return warnings;
  },

  comparePoseToTarget: (
    frame: PoseLandmarkFrame | null,
    target: PoseComparisonTarget,
    recentFrames: PoseLandmarkFrame[],
  ): MovementCueMatch => {
    const dir = target.direction
      ? compareDirectionCue(target.direction, recentFrames)
      : { directionMatch: true, confidence: 1 };
    const body = target.bodyParts?.length
      ? compareBodyPartMovement(target.bodyParts, frame)
      : { bodyPartMatch: true, confidence: frame?.frameConfidence ?? 0.5 };
    return {
      targetTimestampMs: target.timestampMs,
      matched: dir.directionMatch && body.bodyPartMatch,
      directionMatch: dir.directionMatch,
      bodyPartMatch: body.bodyPartMatch,
      confidence: (dir.confidence + body.confidence) / 2,
      label: target.label,
    };
  },

  calculateTimingAlignment: (targetMs: number, actualMs: number): TimingAlignmentResult =>
    compareTimingWindow(targetMs, actualMs),

  calculateMovementAccuracy: (matches: MovementCueMatch[]): number =>
    calculateSectionAccuracy(matches),

  buildPoseFeedbackSummary: (input: {
    tracker: PoseTracker;
    matches: MovementCueMatch[];
    timingScores: number[];
    confidence: PoseConfidenceReport;
    completedSections: number;
    totalSections: number;
    completionPct: number;
    mode: "Learn" | "Practice" | "Performance";
  }): SessionAiAnalysisSummary => {
    const { tracker, matches, timingScores, confidence } = input;
    const directionAccuracy = matches.length
      ? Math.round((matches.filter((m) => m.directionMatch).length / matches.length) * 100)
      : 0;
    const bodyAccuracy = matches.length
      ? Math.round((matches.filter((m) => m.bodyPartMatch).length / matches.length) * 100)
      : 0;
    const timing = timingScores.length
      ? Math.round(timingScores.reduce((s, n) => s + n, 0) / timingScores.length)
      : 0;
    const meanConfidence = confidence.bodyConfidence;
    const accuracy = calculateSectionAccuracy(matches);
    const sync = Math.round((timing + directionAccuracy) / 2);
    const energy = Math.round((bodyAccuracy + input.completionPct) / 2);
    const total = calculateOverallPoseScore({
      timingScore: timing,
      directionAccuracy,
      bodyAccuracy,
      meanConfidence,
      completionPct: input.completionPct,
    });
    const missedCues = matches
      .filter((m) => !m.matched)
      .map((m) => ({ label: m.label, timestamp: msToClock(m.targetTimestampMs) }));
    const feedback: PoseFeedbackItem[] = createFeedbackItems({
      timingScore: timing,
      directionAccuracy,
      bodyAccuracy,
      meanConfidence,
      missedCues,
    });

    return {
      accuracy,
      timing,
      energy,
      sync,
      total,
      confidence: meanConfidence,
      trackedFrameCount: tracker.trackedFrameCount,
      totalFrameCount: tracker.totalFrameCount,
      completedSections: input.completedSections,
      totalSections: input.totalSections,
      missedCueCount: missedCues.length,
      completionPct: input.completionPct,
      feedback,
      poseProvider: tracker.provider.name,
      poseModelVersion: tracker.provider.modelVersion,
      cameraQuality: {
        lightingOk: confidence.lightingOk,
        fullBodyInFrame: confidence.fullBodyInFrame,
        peopleDetected: confidence.peopleDetected,
      },
    };
  },
};

function msToClock(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
