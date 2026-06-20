import React from "react";
import { useAuth } from "../auth/AuthContext";
import { useTrancePoseSession } from "../hooks/useTrancePoseSession";
import { tranceProfileService } from "../services/tranceProfileService";
import { useCalibrationScoring } from "./useCalibrationScoring";
import { CameraSetupStep } from "./steps/CameraSetupStep";
import { LevelQuizStep } from "./steps/LevelQuizStep";
import { MoveTestStep, type MoveConfig } from "./steps/MoveTestStep";
import { ResultStep } from "./steps/ResultStep";
import type { CalibrationLevel, CalibrationProfile } from "../types";

interface CalibrationOverlayProps {
  onComplete: () => void;
}

type CalibrationStep = 1 | 2 | 3 | 4;

const MOVES: MoveConfig[] = [
  { name: "Step Touch", description: "Lateral weight shift", counts: "8 counts", moveIndex: 0 },
  { name: "Arm + Body Wave", description: "Full-body articulation", counts: "8 counts", moveIndex: 1 },
  { name: "Direction Change", description: "Quarter-turn with rebound", counts: "8 counts", moveIndex: 2 },
];

export function CalibrationOverlay({ onComplete }: CalibrationOverlayProps) {
  const { effectiveProfile } = useAuth();
  const pose = useTrancePoseSession("Practice");
  const { recordFrame, commitMove, computeFinalResult } = useCalibrationScoring();

  const [step, setStep] = React.useState<CalibrationStep>(1);
  const [selectedLevel, setSelectedLevel] = React.useState<CalibrationLevel | null>(null);
  const [currentMoveIndex, setCurrentMoveIndex] = React.useState(0);
  const [finalResult, setFinalResult] = React.useState<
    Omit<CalibrationProfile, "completed" | "version" | "completedAt" | "deviceType"> | null
  >(null);
  const [saving, setSaving] = React.useState(false);

  const handleCameraReady = () => setStep(2);

  const handleLevelConfirmed = (level: CalibrationLevel) => {
    setSelectedLevel(level);
    setStep(3);
  };

  const handleMoveComplete = React.useCallback(() => {
    commitMove();
    if (currentMoveIndex < MOVES.length - 1) {
      setCurrentMoveIndex((i) => i + 1);
    } else {
      const result = computeFinalResult(selectedLevel!);
      setFinalResult(result);
      setStep(4);
    }
  }, [commitMove, computeFinalResult, currentMoveIndex, selectedLevel]);

  const handleStartPractice = async () => {
    if (!finalResult || saving) return;
    setSaving(true);
    try {
      const profile: CalibrationProfile = {
        completed: true,
        version: 1,
        completedAt: new Date().toISOString(),
        deviceType: "mobile",
        ...finalResult,
      };
      await tranceProfileService.saveCalibrationProfile(effectiveProfile.id, profile);
      pose.stop();
      onComplete();
    } catch (err) {
      console.error("Failed to save calibration profile:", err);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0012] overflow-y-auto">
      {step === 1 && <CameraSetupStep pose={pose} onReady={handleCameraReady} />}
      {step === 2 && <LevelQuizStep onConfirm={handleLevelConfirmed} />}
      {step === 3 && (
        <MoveTestStep
          key={currentMoveIndex}
          pose={pose}
          move={MOVES[currentMoveIndex]}
          onRecordFrame={recordFrame}
          onComplete={handleMoveComplete}
        />
      )}
      {step === 4 && finalResult && (
        <ResultStep
          result={finalResult}
          onStartPractice={handleStartPractice}
          saving={saving}
        />
      )}
    </div>
  );
}
