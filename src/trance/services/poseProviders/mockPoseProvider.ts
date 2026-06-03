// TRANCE — Mock pose provider for development only.
//
// This produces a synthetic, gently-animated skeleton so the pose pipeline,
// skeleton overlay, and feedback UI can be exercised WITHOUT a camera/model.
// It is selected ONLY when VITE_TRANCE_USE_FIXTURES=true or
// VITE_TRANCE_ENABLE_POSE_DEBUG=true (see ./index.ts). It must never run in a
// normal production session — real sessions use the dancer's real camera.
import type { PoseProvider } from "./basePoseProvider";
import type { PoseLandmarkFrame, PoseBodyPart } from "../../types";

const BODY_PARTS: PoseBodyPart[] = [
  "nose",
  "left_shoulder",
  "right_shoulder",
  "left_elbow",
  "right_elbow",
  "left_wrist",
  "right_wrist",
  "left_hip",
  "right_hip",
  "left_knee",
  "right_knee",
  "left_ankle",
  "right_ankle",
];

// Base skeleton positions (normalized 0..1), roughly a person centered in frame.
const BASE: Record<PoseBodyPart, [number, number]> = {
  nose: [0.5, 0.18],
  left_eye: [0.47, 0.16],
  right_eye: [0.53, 0.16],
  left_ear: [0.44, 0.17],
  right_ear: [0.56, 0.17],
  left_shoulder: [0.42, 0.32],
  right_shoulder: [0.58, 0.32],
  left_elbow: [0.38, 0.46],
  right_elbow: [0.62, 0.46],
  left_wrist: [0.36, 0.58],
  right_wrist: [0.64, 0.58],
  left_hip: [0.45, 0.6],
  right_hip: [0.55, 0.6],
  left_knee: [0.44, 0.78],
  right_knee: [0.56, 0.78],
  left_ankle: [0.43, 0.95],
  right_ankle: [0.57, 0.95],
};

export class MockPoseProvider implements PoseProvider {
  readonly name = "mock";
  readonly modelVersion = "mock-1";

  private ready = false;

  async initialize(): Promise<{ ok: boolean; error?: string }> {
    this.ready = true;
    return { ok: true };
  }

  attachVideoElement(): void {
    // Mock ignores the video element.
  }

  estimateFrame(timestampMs: number): PoseLandmarkFrame | null {
    if (!this.ready) return null;
    const t = timestampMs / 1000;
    const sway = Math.sin(t * 2) * 0.02;
    const bounce = Math.abs(Math.sin(t * 3)) * 0.015;

    const landmarks = BODY_PARTS.map((bodyPart) => {
      const [bx, by] = BASE[bodyPart];
      const armWave = bodyPart.includes("wrist") ? Math.sin(t * 4) * 0.03 : 0;
      return {
        x: Math.min(1, Math.max(0, bx + sway + armWave)),
        y: Math.min(1, Math.max(0, by + bounce)),
        z: 0,
        visibility: 0.9,
        bodyPart,
        timestampMs,
      };
    });

    return {
      timestampMs,
      landmarks,
      frameConfidence: 0.9,
      peopleDetected: 1,
    };
  }

  isReady(): boolean {
    return this.ready;
  }

  dispose(): void {
    this.ready = false;
  }
}
