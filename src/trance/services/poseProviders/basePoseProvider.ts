// TRANCE — Pose provider interface. Every concrete provider (browser model,
// mock, or a future cloud worker) implements this so the rest of the pipeline
// never depends on a specific model/library.
import type { PoseLandmarkFrame } from "../../types";

export interface PoseProvider {
  /** Stable identifier stored with scores for provenance. */
  readonly name: string;
  /** Model/graph version stored with scores. */
  readonly modelVersion: string;
  /** Load the model/graph. Returns ok:false if unavailable (no throw). */
  initialize(): Promise<{ ok: boolean; error?: string }>;
  /** Bind the live <video> element the provider should read frames from. */
  attachVideoElement(video: HTMLVideoElement | null): void;
  /** Estimate landmarks for the current video frame, or null if unavailable. */
  estimateFrame(timestampMs: number): PoseLandmarkFrame | null;
  /** True once a usable model is loaded and a video is attached. */
  isReady(): boolean;
  /** Release model/worker resources. */
  dispose(): void;
}
