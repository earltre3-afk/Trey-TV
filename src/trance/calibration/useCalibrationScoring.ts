import { useCallback, useRef, useState } from "react";
import type { CalibrationLevel, CalibrationTrackingQuality } from "../types";

export interface MoveFrameData {
  bodyConfidence: number;
  visibleRatio: number;
  lightingOk: boolean;
  fullBodyInFrame: boolean;
}

export interface MoveResult {
  timing: number;
  bodyControl: number;
  range: number;
  camera: number;
}

export function scoreMoveFrames(frames: MoveFrameData[]): MoveResult {
  if (frames.length === 0) return { timing: 0, bodyControl: 0, range: 0, camera: 0 };
  const n = frames.length;

  const meanConfidence = frames.reduce((s, f) => s + f.bodyConfidence, 0) / n;
  const variance = frames.reduce((s, f) => s + Math.pow(f.bodyConfidence - meanConfidence, 2), 0) / n;
  const timing = Math.round(Math.max(0, (1 - Math.min(variance * 4, 1)) * 100));
  const bodyControl = Math.round(meanConfidence * 100);
  const range = Math.round((frames.reduce((s, f) => s + f.visibleRatio, 0) / n) * 100);
  const camera = Math.round((frames.filter((f) => f.lightingOk && f.fullBodyInFrame).length / n) * 100);

  return { timing, bodyControl, range, camera };
}

export function averageMoveResults(results: MoveResult[]): MoveResult {
  if (results.length === 0) return { timing: 0, bodyControl: 0, range: 0, camera: 0 };
  const n = results.length;
  return {
    timing: Math.round(results.reduce((s, r) => s + r.timing, 0) / n),
    bodyControl: Math.round(results.reduce((s, r) => s + r.bodyControl, 0) / n),
    range: Math.round(results.reduce((s, r) => s + r.range, 0) / n),
    camera: Math.round(results.reduce((s, r) => s + r.camera, 0) / n),
  };
}

export function assignCalibrationLevel(
  selectedLevel: CalibrationLevel,
  meanBodyConfidence: number,
): CalibrationLevel {
  if (selectedLevel === "advanced" && meanBodyConfidence < 0.55) return "intermediate";
  if (selectedLevel === "beginner" && meanBodyConfidence > 0.75) return "intermediate";
  return selectedLevel;
}

export function cameraScoreToTrackingQuality(camera: number): CalibrationTrackingQuality {
  if (camera < 50) return "poor";
  if (camera < 70) return "ok";
  if (camera < 85) return "good";
  return "excellent";
}

export function useCalibrationScoring() {
  const frameBufferRef = useRef<MoveFrameData[]>([]);
  const [moveResults, setMoveResults] = useState<MoveResult[]>([]);

  const recordFrame = useCallback((data: MoveFrameData) => {
    frameBufferRef.current.push(data);
  }, []);

  const commitMove = useCallback((): MoveResult => {
    const result = scoreMoveFrames(frameBufferRef.current);
    frameBufferRef.current = [];
    setMoveResults((prev) => [...prev, result]);
    return result;
  }, []);

  const computeFinalResult = useCallback(
    (selectedLevel: CalibrationLevel) => {
      const final = averageMoveResults(moveResults);
      const meanBodyConfidence =
        moveResults.length > 0
          ? moveResults.reduce((s, r) => s + r.bodyControl, 0) / (moveResults.length * 100)
          : 0;
      return {
        selectedLevel,
        assignedLevel: assignCalibrationLevel(selectedLevel, meanBodyConfidence),
        scores: final,
        trackingQuality: cameraScoreToTrackingQuality(final.camera),
      };
    },
    [moveResults],
  );

  return { recordFrame, commitMove, computeFinalResult, moveResults };
}
