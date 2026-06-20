import React from "react";
import { cn } from "../../components/primitives";
import type { CalibrationLevel } from "../../types";

interface LevelQuizStepProps {
  onConfirm: (level: CalibrationLevel) => void;
}

const LEVELS: { value: CalibrationLevel; label: string; description: string; accent: string }[] = [
  {
    value: "beginner",
    label: "Beginner",
    description: "Still learning timing, steps, and control",
    accent: "border-sky-400/40 bg-sky-500/10",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "Can follow choreography with some practice",
    accent: "border-fuchsia-400/50 bg-fuchsia-500/15",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "Pick up movement fast, want a challenge",
    accent: "border-orange-400/40 bg-orange-500/10",
  },
];

export function LevelQuizStep({ onConfirm }: LevelQuizStepProps) {
  const [selected, setSelected] = React.useState<CalibrationLevel | null>(null);

  return (
    <div className="flex flex-col min-h-screen px-5 py-8 gap-6">
      <div>
        <div className="text-[9px] font-black text-fuchsia-400 uppercase tracking-widest mb-1">
          Step 2 of 4
        </div>
        <h2 className="text-xl font-black text-white uppercase leading-tight">
          Where are you<br />starting?
        </h2>
        <p className="text-xs text-white/50 mt-1">
          We'll verify with a quick movement check.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {LEVELS.map((level) => {
          const isSelected = selected === level.value;
          return (
            <button
              key={level.value}
              onClick={() => setSelected(level.value)}
              className={cn(
                "w-full rounded-2xl border p-4 text-left transition-all",
                isSelected
                  ? `${level.accent} border-2`
                  : "border-white/10 bg-white/[0.03]",
              )}
            >
              <div className="font-black text-white uppercase text-sm">
                {level.label}
                {isSelected && " ✓"}
              </div>
              <div className="text-xs text-white/50 mt-0.5">{level.description}</div>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => selected && onConfirm(selected)}
        disabled={!selected}
        className="mt-auto w-full py-4 rounded-2xl font-black text-sm uppercase bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
      >
        Next: Quick Move Test →
      </button>
    </div>
  );
}
