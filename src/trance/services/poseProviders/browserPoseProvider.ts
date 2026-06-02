// TRANCE — Real client-side pose provider (adaptor).
//
// The pose MODEL itself (e.g. MediaPipe Tasks Vision PoseLandmarker or
// TensorFlow MoveNet) is intentionally NOT bundled in this phase. This keeps the
// production build light and dependency-free while the full pipeline is wired.
//
// There is exactly ONE integration point — `initialize()` — where a real model
// is loaded. Until that is done, `estimateFrame()` returns null (we NEVER
// fabricate the dancer's movement) and `isReady()` is false, so sessions
// gracefully fall back to the existing non-AI controlled scoring flow.
import type { PoseProvider } from "./basePoseProvider";
import type { PoseLandmarkFrame } from "../../types";

export class BrowserPoseProvider implements PoseProvider {
  readonly name = "browser-client";
  readonly modelVersion = "unwired-0";

  private video: HTMLVideoElement | null = null;
  private ready = false;

  async initialize(): Promise<{ ok: boolean; error?: string }> {
    // ── INTEGRATION POINT ──────────────────────────────────────────────
    // Load a real client-side pose model here, e.g.:
    //   const vision = await import("@mediapipe/tasks-vision");
    //   this.landmarker = await vision.PoseLandmarker.createFromOptions(...);
    //   this.ready = true;
    // Keep all model/library code inside this file only.
    this.ready = false;
    return { ok: false, error: "No client-side pose model is wired yet." };
  }

  attachVideoElement(video: HTMLVideoElement | null): void {
    this.video = video;
  }

  estimateFrame(_timestampMs: number): PoseLandmarkFrame | null {
    if (!this.ready || !this.video) return null;
    // With a real model wired, run detection on this.video and map results to
    // PoseLandmark[] here. No model → no landmarks (never fabricated).
    return null;
  }

  isReady(): boolean {
    return this.ready;
  }

  dispose(): void {
    this.video = null;
    this.ready = false;
  }
}
