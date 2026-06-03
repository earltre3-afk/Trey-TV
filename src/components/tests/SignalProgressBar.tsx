import React from "react";

interface Props {
  current: number;
  total: number;
}

const SignalProgressBar: React.FC<Props> = ({ current, total }) => {
  const pct = Math.min(100, Math.round((current / total) * 100));
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-400 mb-2">
        <span className="text-cyan-300 font-semibold">{pct}%</span>
        <span>{total} Scenes</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 shadow-[0_0_12px_rgba(34,211,238,0.7)] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default SignalProgressBar;
