import React from "react";

interface Props {
  label: string;
  value: number;
  color?: "violet" | "pink" | "amber" | "emerald" | "red" | "sky";
  delta?: number;
  compact?: boolean;
}

const COLORS: Record<string, string> = {
  violet: "from-violet-500 to-fuchsia-500",
  pink: "from-pink-500 to-rose-500",
  amber: "from-amber-400 to-orange-500",
  emerald: "from-emerald-400 to-teal-500",
  red: "from-red-500 to-orange-600",
  sky: "from-sky-400 to-cyan-500",
};

export const MeterBar: React.FC<Props> = ({ label, value, color = "violet", delta, compact }) => {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={compact ? "space-y-0.5" : "space-y-1"}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-white/80">{label}</span>
        <span className="tabular-nums text-white/60">
          {v}%
          {delta !== undefined && delta !== 0 && (
            <span className={`ml-1 font-bold ${delta > 0 ? "text-emerald-400" : "text-red-400"}`}>
              {delta > 0 ? "+" : ""}
              {delta}
            </span>
          )}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${COLORS[color]} transition-all duration-700 ease-out`}
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
};
