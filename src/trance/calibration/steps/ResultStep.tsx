import React from "react";
import type { CalibrationProfile } from "../../types";

interface ResultStepProps {
  result: Omit<CalibrationProfile, "completed" | "version" | "completedAt" | "deviceType">;
  onStartPractice: () => void;
  saving: boolean;
}

const LEVEL_DESCRIPTIONS: Record<string, string> = {
  beginner: "Sessions will build your fundamentals at a comfortable pace.",
  intermediate: "Sessions will challenge you while keeping movement clean.",
  advanced: "Sessions will push your timing, range, and precision.",
};

function qualitativeLabel(score: number): string {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Good";
  return "Developing";
}

function qualitativeColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-yellow-300";
  return "text-white/50";
}

export function ResultStep({ result, onStartPractice, saving }: ResultStepProps) {
  const { assignedLevel, scores } = result;

  const metrics: { label: string; score: number }[] = [
    { label: "Timing", score: scores.timing },
    { label: "Body Control", score: scores.bodyControl },
    { label: "Range", score: scores.range },
    { label: "Camera", score: scores.camera },
  ];

  return (
    <div className="flex flex-col min-h-screen px-5 py-8 gap-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 grid place-items-center shadow-[0_0_32px_-4px_rgba(16,185,129,0.6)] text-4xl">
          ✓
        </div>
        <div>
          <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">
            You're calibrated
          </div>
          <h2 className="text-2xl font-black text-white uppercase">
            You're {assignedLevel.charAt(0).toUpperCase() + assignedLevel.slice(1)}
          </h2>
          <p className="text-xs text-white/50 mt-1 max-w-xs">
            {LEVEL_DESCRIPTIONS[assignedLevel]}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/10">
        {metrics.map(({ label, score }) => (
          <div key={label} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-semibold text-white/70">{label}</span>
            <span className={`text-sm font-black ${qualitativeColor(score)}`}>
              {qualitativeLabel(score)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-auto space-y-3">
        <button
          onClick={onStartPractice}
          disabled={saving}
          className="w-full py-4 rounded-2xl font-black text-sm uppercase bg-gradient-to-r from-emerald-600 to-teal-700 text-white disabled:opacity-60 transition-opacity"
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Saving…
            </span>
          ) : (
            "Start Practice →"
          )}
        </button>
        <p className="text-center text-[10px] text-white/30">
          You can recalibrate anytime from your profile.
        </p>
      </div>
    </div>
  );
}
