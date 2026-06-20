import React from "react";
import { PoseCameraCanvas } from "../../components/PoseCameraCanvas";
import type { UseTrancePoseSession } from "../../hooks/useTrancePoseSession";
import type { MoveFrameData } from "../useCalibrationScoring";

export interface MoveConfig {
  name: string;
  description: string;
  counts: string;
  moveIndex: number; // 0, 1, or 2
}

interface MoveTestStepProps {
  pose: UseTrancePoseSession;
  move: MoveConfig;
  onRecordFrame: (data: MoveFrameData) => void;
  onComplete: () => void;
}

type Phase = "preview" | "countdown" | "scoring" | "done";

const PREVIEW_MS = 3000;
const COUNTDOWN_MS = 3000;
const SCORING_MS = 8000;

export function MoveTestStep({ pose, move, onRecordFrame, onComplete }: MoveTestStepProps) {
  const [phase, setPhase] = React.useState<Phase>("preview");
  const [countdown, setCountdown] = React.useState(3);
  const [elapsed, setElapsed] = React.useState(0);
  const onCompleteRef = React.useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Preview phase timer
  React.useEffect(() => {
    if (phase !== "preview") return;
    const t = setTimeout(() => setPhase("countdown"), PREVIEW_MS);
    return () => clearTimeout(t);
  }, [phase]);

  // Countdown phase
  React.useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      setPhase("scoring");
      setElapsed(0);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // Scoring phase: tick elapsed and record frames from pose.confidence
  React.useEffect(() => {
    if (phase !== "scoring") return;
    const interval = setInterval(() => {
      setElapsed((e) => {
        const next = e + 80;
        if (next >= SCORING_MS) {
          clearInterval(interval);
          setPhase("done");
          return SCORING_MS;
        }
        return next;
      });
      // Record frame from current confidence
      const c = pose.confidence;
      onRecordFrame({
        bodyConfidence: c?.bodyConfidence ?? 0,
        visibleRatio: c?.visibleRatio ?? 0,
        lightingOk: c?.lightingOk ?? false,
        fullBodyInFrame: c?.fullBodyInFrame ?? false,
      });
    }, 80);
    return () => clearInterval(interval);
  }, [phase, pose.confidence, onRecordFrame]);

  // Auto-advance when done
  React.useEffect(() => {
    if (phase !== "done") return;
    const t = setTimeout(() => onCompleteRef.current(), 500);
    return () => clearTimeout(t);
  }, [phase]);

  const progress = phase === "scoring" ? (elapsed / SCORING_MS) * 100 : 0;
  const isScoringOrDone = phase === "scoring" || phase === "done";

  return (
    <div className="flex flex-col min-h-screen">
      {/* Camera feed during scoring */}
      {isScoringOrDone ? (
        <div className="flex-1 relative">
          <PoseCameraCanvas pose={pose} className="min-h-[50vh]" />
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="text-[9px] font-black text-fuchsia-400 uppercase tracking-widest">
              Move {move.moveIndex + 1} of 3
            </div>
            <div className="text-xs font-black text-white">
              {Math.max(0, Math.ceil((SCORING_MS - elapsed) / 1000))}s
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#0f0720] to-[#0a0012]">
          {phase === "countdown" ? (
            <div className="text-8xl font-black text-white animate-pulse">
              {countdown === 0 ? "Go!" : countdown}
            </div>
          ) : (
            <>
              <div className="text-6xl opacity-60">🕺</div>
              <div className="text-center px-6">
                <div className="text-[9px] font-black text-fuchsia-400 uppercase tracking-widest mb-1">
                  Move {move.moveIndex + 1} of 3 · Preview
                </div>
                <div className="text-lg font-black text-white uppercase">{move.name}</div>
                <div className="text-xs text-white/50 mt-1">
                  {move.description} · {move.counts}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Progress bar during scoring */}
      {isScoringOrDone && (
        <div className="px-5 py-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-white/60 uppercase">
            <span>{move.name}</span>
            <span>{move.counts}</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
