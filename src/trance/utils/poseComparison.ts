// TRANCE — Pure, explainable pose-vs-target comparison helpers.
// No DOM, no Supabase, no provider-specific code. Operates on whatever frames
// the pipeline produced (real camera or, in dev, the mock provider).
import type {
  PoseLandmark,
  PoseLandmarkFrame,
  PoseBodyPart,
  PoseComparisonTarget,
  MovementCueMatch,
  TimingAlignmentResult,
  PoseFeedbackItem,
} from "../types";

const TIMING_WINDOW_MS = 400;

const lm = (frame: PoseLandmarkFrame, part: PoseBodyPart): PoseLandmark | undefined =>
  frame.landmarks.find((l) => l.bodyPart === part);

/** Timing alignment for a single cue. +delta = late, -delta = early. */
export function compareTimingWindow(
  targetMs: number,
  actualMs: number,
  windowMs: number = TIMING_WINDOW_MS,
): TimingAlignmentResult {
  const deltaMs = Math.round(actualMs - targetMs);
  const withinWindow = Math.abs(deltaMs) <= windowMs;
  // Linear falloff to 0 at 2x the window.
  const score = Math.max(0, Math.min(100, Math.round(100 * (1 - Math.abs(deltaMs) / (windowMs * 2)))));
  return { deltaMs, withinWindow, score };
}

/**
 * Does the dancer's recent motion match a directional cue? Uses the average
 * movement of wrists/hips across the provided frames (most recent last).
 */
export function compareDirectionCue(
  direction: NonNullable<PoseComparisonTarget["direction"]>,
  frames: PoseLandmarkFrame[],
): { directionMatch: boolean; confidence: number } {
  if (frames.length < 2) return { directionMatch: false, confidence: 0 };
  const first = frames[0];
  const last = frames[frames.length - 1];
  const parts: PoseBodyPart[] = ["left_wrist", "right_wrist", "left_hip", "right_hip"];

  let dx = 0;
  let dy = 0;
  let n = 0;
  let conf = 0;
  for (const part of parts) {
    const a = lm(first, part);
    const b = lm(last, part);
    if (a && b) {
      dx += b.x - a.x;
      dy += b.y - a.y;
      conf += Math.min(a.visibility ?? 1, b.visibility ?? 1);
      n++;
    }
  }
  if (n === 0) return { directionMatch: false, confidence: 0 };
  dx /= n;
  dy /= n;
  const confidence = conf / n;

  // Normalized coords: x grows right, y grows DOWN.
  const wantsRight = direction === "right" || direction === "up-right";
  const wantsLeft = direction === "left" || direction === "up-left";
  const wantsUp = direction === "up" || direction === "up-right" || direction === "up-left";
  const wantsDown = direction === "down";
  const TH = 0.01;

  let directionMatch = false;
  if (wantsRight) directionMatch = dx > TH;
  else if (wantsLeft) directionMatch = dx < -TH;
  else if (wantsUp) directionMatch = dy < -TH;
  else if (wantsDown) directionMatch = dy > TH;

  return { directionMatch, confidence };
}

/** Are the emphasized body parts visible (a proxy for "in play") this frame? */
export function compareBodyPartMovement(
  bodyParts: PoseBodyPart[],
  frame: PoseLandmarkFrame | null,
): { bodyPartMatch: boolean; confidence: number } {
  if (!frame || bodyParts.length === 0) return { bodyPartMatch: false, confidence: 0 };
  let visible = 0;
  let conf = 0;
  for (const part of bodyParts) {
    const l = lm(frame, part);
    if (l && (l.visibility ?? 1) > 0.4) {
      visible++;
      conf += l.visibility ?? 1;
    }
  }
  const bodyPartMatch = visible >= Math.ceil(bodyParts.length / 2);
  return { bodyPartMatch, confidence: visible ? conf / visible : 0 };
}

/** Section accuracy = share of cue matches that hit timing + direction/body. */
export function calculateSectionAccuracy(matches: MovementCueMatch[]): number {
  if (matches.length === 0) return 0;
  const hit = matches.filter((m) => m.matched).length;
  return Math.round((hit / matches.length) * 100);
}

export interface OverallScoreInput {
  timingScore: number; // 0..100
  directionAccuracy: number; // 0..100
  bodyAccuracy: number; // 0..100
  meanConfidence: number; // 0..1
  completionPct: number; // 0..100
  weights?: { timing: number; execution: number; energy: number };
}

/** Weighted, clamped overall pose score, scaled down by camera confidence. */
export function calculateOverallPoseScore(input: OverallScoreInput): number {
  const w = input.weights ?? { timing: 40, execution: 40, energy: 20 };
  const wTotal = w.timing + w.execution + w.energy || 1;
  const execution = (input.directionAccuracy + input.bodyAccuracy) / 2;
  const raw =
    (input.timingScore * w.timing + execution * w.execution + input.completionPct * w.energy) /
    wTotal;
  // Confidence acts as a quality multiplier so low-camera-quality sessions
  // don't inflate scores.
  const confidenceFactor = 0.5 + 0.5 * Math.max(0, Math.min(1, input.meanConfidence));
  return Math.round(Math.max(0, Math.min(100, raw * confidenceFactor)));
}

export function createFeedbackItems(input: {
  timingScore: number;
  directionAccuracy: number;
  bodyAccuracy: number;
  meanConfidence: number;
  missedCues: { label?: string; timestamp?: string }[];
}): PoseFeedbackItem[] {
  const items: PoseFeedbackItem[] = [];

  if (input.timingScore >= 80) items.push({ tone: "strength", text: "Strong timing on the beat" });
  else if (input.timingScore > 0) items.push({ tone: "focus", text: "Tighten your timing on quick hits" });

  if (input.directionAccuracy >= 80) items.push({ tone: "strength", text: "Clean directional transitions" });
  else if (input.directionAccuracy > 0) items.push({ tone: "focus", text: "Commit fully to direction changes" });

  if (input.bodyAccuracy >= 80) items.push({ tone: "strength", text: "Good full-body engagement" });
  else if (input.bodyAccuracy > 0) items.push({ tone: "focus", text: "Keep more of your body in frame" });

  if (input.meanConfidence < 0.5) {
    items.push({ tone: "focus", text: "Improve lighting/framing for better tracking" });
  }

  for (const cue of input.missedCues.slice(0, 4)) {
    items.push({
      tone: "missed",
      text: cue.label ? `Missed: ${cue.label}` : "Missed a cue",
      timestamp: cue.timestamp,
    });
  }

  return items;
}
