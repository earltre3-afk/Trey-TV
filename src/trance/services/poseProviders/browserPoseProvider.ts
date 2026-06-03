// TRANCE — Real client-side pose provider backed by MediaPipe Tasks Vision
// Pose Landmarker (VIDEO mode). All MediaPipe specifics live in ./mediapipeLoader
// so the rest of the app stays model-agnostic. Fails safe: if the device/browser
// can't run the model, initialize() returns ok:false and sessions fall back to
// the non-AI controlled flow. Never fabricates movement.
import type { PoseProvider } from "./basePoseProvider";
import type { PoseLandmarkFrame } from "../../types";
import type { PoseLandmarker } from "@mediapipe/tasks-vision";
import {
  createPoseLandmarker,
  mapResultToFrame,
  POSE_MODEL_VERSION,
  POSE_PROVIDER_NAME,
} from "./mediapipeLoader";

export class BrowserPoseProvider implements PoseProvider {
  readonly name = POSE_PROVIDER_NAME;
  readonly modelVersion = POSE_MODEL_VERSION;

  private video: HTMLVideoElement | null = null;
  private landmarker: PoseLandmarker | null = null;
  private ready = false;
  private lastTimestampMs = -1;

  async initialize(): Promise<{ ok: boolean; error?: string }> {
    const landmarker = await createPoseLandmarker("VIDEO");
    if (!landmarker) {
      this.ready = false;
      return { ok: false, error: "Pose Landmarker is unavailable on this device/browser." };
    }
    this.landmarker = landmarker;
    this.ready = true;
    return { ok: true };
  }

  attachVideoElement(video: HTMLVideoElement | null): void {
    this.video = video;
  }

  estimateFrame(timestampMs: number): PoseLandmarkFrame | null {
    if (!this.ready || !this.landmarker || !this.video) return null;
    const v = this.video;
    // Need a decoded frame with real dimensions.
    if (v.readyState < 2 || v.videoWidth === 0) return null;
    // detectForVideo requires strictly increasing timestamps.
    const ts = timestampMs <= this.lastTimestampMs ? this.lastTimestampMs + 1 : timestampMs;
    this.lastTimestampMs = ts;
    try {
      const result = this.landmarker.detectForVideo(v, ts);
      return mapResultToFrame(result, ts);
    } catch (err) {
      console.warn("[MediaPipe] detectForVideo failed:", err);
      return null;
    }
  }

  isReady(): boolean {
    return this.ready;
  }

  dispose(): void {
    try {
      this.landmarker?.close();
    } catch {
      /* ignore */
    }
    this.landmarker = null;
    this.video = null;
    this.ready = false;
    this.lastTimestampMs = -1;
  }
}
