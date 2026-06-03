// TRANCE — MediaPipe Tasks Vision Pose Landmarker loader + landmark mapping.
// Isolated here so the rest of the app never imports MediaPipe directly. The
// WASM + model are fetched at runtime from CDN (no user data leaves the device).
import type { PoseLandmarker, PoseLandmarkerResult } from "@mediapipe/tasks-vision";
import type { PoseBodyPart, PoseLandmark, PoseLandmarkFrame } from "../../types";

const MEDIAPIPE_VERSION = "0.10.35";
const WASM_CDN = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

export const POSE_PROVIDER_NAME = "mediapipe-pose-landmarker";
export const POSE_MODEL_VERSION = "pose_landmarker_lite_float16_v1";

// MediaPipe BlazePose 33-landmark indices → the labeled subset TRANCE uses.
const INDEX_TO_PART: ReadonlyArray<readonly [number, PoseBodyPart]> = [
  [0, "nose"],
  [2, "left_eye"],
  [5, "right_eye"],
  [7, "left_ear"],
  [8, "right_ear"],
  [11, "left_shoulder"],
  [12, "right_shoulder"],
  [13, "left_elbow"],
  [14, "right_elbow"],
  [15, "left_wrist"],
  [16, "right_wrist"],
  [23, "left_hip"],
  [24, "right_hip"],
  [25, "left_knee"],
  [26, "right_knee"],
  [27, "left_ankle"],
  [28, "right_ankle"],
];

/** Create a Pose Landmarker, or null if the device/browser can't run it. */
export async function createPoseLandmarker(
  runningMode: "VIDEO" | "IMAGE",
): Promise<PoseLandmarker | null> {
  if (typeof window === "undefined") return null;
  try {
    const vision = await import("@mediapipe/tasks-vision");
    const fileset = await vision.FilesetResolver.forVisionTasks(WASM_CDN);
    const make = (delegate: "GPU" | "CPU") =>
      vision.PoseLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate },
        runningMode,
        numPoses: 2, // detect a 2nd person so we can warn on multiple people
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
    try {
      return await make("GPU");
    } catch {
      return await make("CPU");
    }
  } catch (err) {
    console.warn("[MediaPipe] Pose Landmarker init failed:", err);
    return null;
  }
}

/** Map a MediaPipe result into a TRANCE PoseLandmarkFrame (first person). */
export function mapResultToFrame(
  result: PoseLandmarkerResult | undefined | null,
  timestampMs: number,
): PoseLandmarkFrame | null {
  const poses = result?.landmarks;
  if (!poses || poses.length === 0) return null;
  const first = poses[0];
  const landmarks: PoseLandmark[] = [];
  for (const [idx, part] of INDEX_TO_PART) {
    const p = first[idx];
    if (!p) continue;
    landmarks.push({
      x: p.x,
      y: p.y,
      z: p.z,
      visibility: typeof p.visibility === "number" ? p.visibility : 1,
      bodyPart: part,
      timestampMs,
    });
  }
  if (landmarks.length === 0) return null;
  const frameConfidence =
    landmarks.reduce((s, l) => s + (l.visibility ?? 1), 0) / landmarks.length;
  return { timestampMs, landmarks, frameConfidence, peopleDetected: poses.length };
}
