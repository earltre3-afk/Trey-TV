// TRANCE — Pose provider selector. Chooses the concrete provider based on env.
// Mock is dev-only (fixtures or pose-debug); otherwise the real browser adaptor.
import { shouldUseFixtures } from "../config";
import type { PoseProvider } from "./basePoseProvider";
import { BrowserPoseProvider } from "./browserPoseProvider";
import { MockPoseProvider } from "./mockPoseProvider";

export type { PoseProvider } from "./basePoseProvider";

export function isPoseDebugEnabled(): boolean {
  return import.meta.env.VITE_TRANCE_ENABLE_POSE_DEBUG === "true";
}

export function createPoseProvider(): PoseProvider {
  if (shouldUseFixtures() || isPoseDebugEnabled()) {
    return new MockPoseProvider();
  }
  return new BrowserPoseProvider();
}
