import { useCallback, useEffect, useRef, useState } from "react";
import { trancePoseTrackingService, type PoseTracker } from "../services/trancePoseTrackingService";
import type {
  FramingWarning,
  PoseComparisonTarget,
  PoseConfidenceReport,
  PoseLandmarkFrame,
  PoseTrackingStatus,
  PoseTrackingError,
  SessionAiAnalysisSummary,
  MovementCueMatch,
} from "../types";

const HISTORY_LIMIT = 600; // ~ a few minutes at low sample rate
const RECENT_WINDOW = 6; // frames used for directional comparison
const SAMPLE_INTERVAL_MS = 80; // ~12 fps estimation cadence

export interface UseTrancePoseSession {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  status: PoseTrackingStatus;
  error: PoseTrackingError | null;
  warnings: FramingWarning[];
  latestFrame: PoseLandmarkFrame | null;
  confidence: PoseConfidenceReport | null;
  liveScorePreview: number | null;
  aiEnabled: boolean;
  cameraEnabled: boolean;
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
  buildSummary: (args: {
    targets: PoseComparisonTarget[];
    totalSections: number;
    completedSections: number;
    completionPct: number;
    mode: "Learn" | "Practice" | "Performance";
  }) => SessionAiAnalysisSummary | null;
}

export function useTrancePoseSession(mode: "Learn" | "Practice" | "Performance"): UseTrancePoseSession {
  const aiEnabled = trancePoseTrackingService.isPoseTrackingEnabled();
  const cameraEnabled = trancePoseTrackingService.isCameraEnabled();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const trackerRef = useRef<PoseTracker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastSampleRef = useRef<number>(0);
  const historyRef = useRef<PoseLandmarkFrame[]>([]);

  const [status, setStatus] = useState<PoseTrackingStatus>("idle");
  const [error, setError] = useState<PoseTrackingError | null>(null);
  const [warnings, setWarnings] = useState<FramingWarning[]>([]);
  const [latestFrame, setLatestFrame] = useState<PoseLandmarkFrame | null>(null);
  const [confidence, setConfidence] = useState<PoseConfidenceReport | null>(null);
  const [liveScorePreview, setLiveScorePreview] = useState<number | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const stopLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const loop = useCallback(() => {
    const tracker = trackerRef.current;
    if (!tracker) return;
    const now = performance.now();
    if (now - lastSampleRef.current >= SAMPLE_INTERVAL_MS) {
      lastSampleRef.current = now;
      const ts = now - startTimeRef.current;
      const frame = trancePoseTrackingService.detectPoseFrame(tracker, videoRef.current, ts);
      const report = trancePoseTrackingService.estimatePoseConfidence(tracker, frame);
      const frameWarnings = trancePoseTrackingService.detectFramingWarnings(report);
      if (frame) {
        historyRef.current.push(frame);
        if (historyRef.current.length > HISTORY_LIMIT) historyRef.current.shift();
      }
      setLatestFrame(frame);
      setConfidence(report);
      setWarnings(frameWarnings);
      setLiveScorePreview(frame ? Math.round(report.bodyConfidence * 100) : null);
    }
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    if (!aiEnabled || !cameraEnabled) {
      setStatus("unavailable");
      return;
    }
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStatus("unavailable");
      setError({ code: "camera_unsupported", message: "Camera is not supported on this device." });
      return;
    }

    setStatus("requesting_permission");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Camera permission denied.";
      setStatus("permission_denied");
      setError({ code: "permission_denied", message });
      return;
    }

    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      try {
        await videoRef.current.play();
      } catch {
        /* autoplay can fail silently; preview still binds */
      }
    }
    setStatus("camera_ready");

    const tracker = trancePoseTrackingService.createPoseTracker();
    trackerRef.current = tracker;
    historyRef.current = [];
    const res = await trancePoseTrackingService.startPoseSession(tracker, {
      routineId: "",
      mode,
      minFrameConfidence: 0.4,
    });

    if (!res.ok) {
      // Camera preview stays on, but no pose model is available to track.
      setStatus("unavailable");
      setError({ code: "provider_init_failed", message: res.error || "Pose model unavailable." });
      return;
    }

    startTimeRef.current = performance.now();
    lastSampleRef.current = 0;
    setStatus("tracking");
    rafRef.current = requestAnimationFrame(loop);
  }, [aiEnabled, cameraEnabled, mode, loop]);

  const pause = useCallback(() => {
    if (trackerRef.current) trancePoseTrackingService.pausePoseSession(trackerRef.current);
    stopLoop();
    setStatus((s) => (s === "tracking" ? "paused" : s));
  }, [stopLoop]);

  const resume = useCallback(() => {
    if (!trackerRef.current || status !== "paused") return;
    trancePoseTrackingService.resumePoseSession(trackerRef.current);
    setStatus("tracking");
    rafRef.current = requestAnimationFrame(loop);
  }, [status, loop]);

  const stop = useCallback(() => {
    stopLoop();
    if (trackerRef.current) trancePoseTrackingService.stopPoseSession(trackerRef.current);
    stopStream();
    setStatus("stopped");
  }, [stopLoop, stopStream]);

  const reset = useCallback(() => {
    stopLoop();
    if (trackerRef.current) trancePoseTrackingService.stopPoseSession(trackerRef.current);
    trackerRef.current = null;
    stopStream();
    historyRef.current = [];
    setStatus("idle");
    setError(null);
    setWarnings([]);
    setLatestFrame(null);
    setConfidence(null);
    setLiveScorePreview(null);
  }, [stopLoop, stopStream]);

  // Always release camera + loop on unmount.
  useEffect(() => {
    return () => {
      stopLoop();
      if (trackerRef.current) trancePoseTrackingService.stopPoseSession(trackerRef.current);
      stopStream();
    };
  }, [stopLoop, stopStream]);

  const buildSummary: UseTrancePoseSession["buildSummary"] = useCallback(
    ({ targets, totalSections, completedSections, completionPct, mode: m }) => {
      const tracker = trackerRef.current;
      if (!tracker) return null;
      const history = historyRef.current;
      const matches: MovementCueMatch[] = [];
      const timingScores: number[] = [];

      for (const target of targets) {
        // Closest sampled frame to the cue time.
        let closest: PoseLandmarkFrame | null = null;
        let bestDelta = Infinity;
        let idx = -1;
        history.forEach((f, i) => {
          const d = Math.abs(f.timestampMs - target.timestampMs);
          if (d < bestDelta) {
            bestDelta = d;
            closest = f;
            idx = i;
          }
        });
        const recent = idx >= 0 ? history.slice(Math.max(0, idx - RECENT_WINDOW), idx + 1) : [];
        matches.push(trancePoseTrackingService.comparePoseToTarget(closest, target, recent));
        if (closest) {
          timingScores.push(
            trancePoseTrackingService.calculateTimingAlignment(
              target.timestampMs,
              (closest as PoseLandmarkFrame).timestampMs,
            ).score,
          );
        }
      }

      const report = trancePoseTrackingService.estimatePoseConfidence(
        tracker,
        history[history.length - 1] ?? null,
      );

      return trancePoseTrackingService.buildPoseFeedbackSummary({
        tracker,
        matches,
        timingScores,
        confidence: report,
        completedSections,
        totalSections,
        completionPct,
        mode: m,
      });
    },
    [],
  );

  return {
    videoRef,
    canvasRef,
    status,
    error,
    warnings,
    latestFrame,
    confidence,
    liveScorePreview,
    aiEnabled,
    cameraEnabled,
    start,
    pause,
    resume,
    stop,
    reset,
    buildSummary,
  };
}
