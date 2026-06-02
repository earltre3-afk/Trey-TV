import React, { useEffect, useState } from "react";

interface WaveformProps {
  playing?: boolean;
  bars?: number;
  height?: number;
  gradient?: [string, string];
  className?: string;
}

export const Waveform: React.FC<WaveformProps> = ({
  playing = false,
  bars = 48,
  height = 56,
  gradient = ["#00B7FF", "#A855F7"],
  className = "",
}) => {
  const [seed, setSeed] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const i = setInterval(() => setSeed((s) => s + 1), 180);
    return () => clearInterval(i);
  }, [playing]);

  const heights = Array.from({ length: bars }, (_, i) => {
    const base = Math.sin((i + seed) * 0.5) * 0.4 + 0.6;
    const noise = playing ? Math.sin(i * 1.7 + seed * 2.1) * 0.3 + 0.7 : 0.45;
    return Math.round(Math.max(0.15, Math.min(1, base * noise)) * 10000) / 10000;
  });

  return (
    <div className={`flex items-center gap-[3px] ${className}`} style={{ height }}>
      {heights.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-full transition-all duration-200"
          style={{
            height: `${h * 100}%`,
            background: `linear-gradient(180deg, ${gradient[0]}, ${gradient[1]})`,
            boxShadow: playing ? `0 0 8px ${gradient[0]}80` : "none",
            opacity: playing ? 0.95 : 0.55,
          }}
        />
      ))}
    </div>
  );
};
