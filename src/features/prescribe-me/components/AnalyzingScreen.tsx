import React, { useEffect, useState } from "react";
import TreyTVHeader from "./TreyTVHeader";
import { LiquidGlassCard } from "./LiquidGlass";
import MoodIcon from "./MoodIcon";
import { Waves, BarChart3, Heart, Target } from "lucide-react";
import type { Mood } from "./data";

interface Props {
  moods: Mood[];
  onDone: () => void;
}

const AnalyzingScreen: React.FC<Props> = ({ moods, onDone }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t0 = Date.now();
    const DURATION = 2800;
    const id = window.setInterval(() => {
      const elapsed = Date.now() - t0;
      const p = Math.min(100, Math.round((elapsed / DURATION) * 100));
      setProgress(p);
      if (p >= 100) {
        clearInterval(id);
        setTimeout(onDone, 250);
      }
    }, 60);
    return () => clearInterval(id);
  }, [onDone]);

  const baseMoods: Mood[] = ["Chill", "Romantic", "Happy", "Motivated", "Reflective", "Healing"];
  const displayMoods: Mood[] = (() => {
    const out: Mood[] = [...moods];
    for (const m of baseMoods) if (out.length < 6 && !out.includes(m)) out.push(m);
    return out.slice(0, 6);
  })();

  const positions: React.CSSProperties[] = [
    { top: "4%", left: "0%" },
    { top: "4%", right: "0%" },
    { top: "43%", left: "-5%" },
    { top: "43%", right: "-5%" },
    { bottom: "4%", left: "0%" },
    { bottom: "4%", right: "0%" },
  ];

  return (
    <section className="w-full max-w-md mx-auto h-[100dvh] overflow-hidden px-4 pt-[max(0.25rem,env(safe-area-inset-top))] pb-[max(0.65rem,env(safe-area-inset-bottom))] flex flex-col">
      <div className="shrink-0">
        <TreyTVHeader size="sm" />
      </div>

      <div className="shrink-0 text-center">
        <h2
          className="font-serif font-bold text-[clamp(1.8rem,8vw,2.7rem)] leading-none"
          style={{
            backgroundImage: "linear-gradient(90deg,#fcd34d 0%, #f0abfc 50%, #c4b5fd 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Analyzing your vibe
        </h2>
        <p className="text-center text-xs mt-2 text-white/75">
          <span className="text-cyan-300 font-semibold">Trey-I</span> is curating your perfect
          prescription
        </p>
      </div>

      <div className="flex-1 min-h-0 flex flex-col justify-center gap-3">
        <div className="relative mx-auto w-full max-w-[260px] aspect-square">
          <div
            className="absolute inset-1/4 rounded-full bg-black/70 border border-white/10"
            style={{
              boxShadow: "0 0 50px rgba(168,85,247,0.6), inset 0 0 35px rgba(34,211,238,0.4)",
            }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 50% 45%, rgba(34,211,238,0.5), transparent 60%)",
              }}
            />
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
              <path
                d="M30 42 q5 -10 12 0"
                stroke="#67e8f9"
                strokeWidth="3.5"
                fill="none"
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 6px #67e8f9)" }}
              />
              <path
                d="M58 42 q5 -10 12 0"
                stroke="#67e8f9"
                strokeWidth="3.5"
                fill="none"
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 6px #67e8f9)" }}
              />
              <path
                d="M35 60 q15 14 30 0"
                stroke="#67e8f9"
                strokeWidth="3.5"
                fill="none"
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 6px #67e8f9)" }}
              />
            </svg>
          </div>
          <div
            className="absolute inset-0 rounded-full"
            style={{ animation: "orbSpin 12s linear infinite" }}
          >
            <div
              className="absolute inset-2 rounded-full border-2 border-fuchsia-500/40"
              style={{ boxShadow: "0 0 30px rgba(217,70,239,0.4)" }}
            />
          </div>
          <div
            className="absolute inset-3 rounded-full"
            style={{ animation: "orbSpin 18s linear infinite reverse" }}
          >
            <div
              className="absolute inset-0 rounded-full border-2 border-cyan-400/35"
              style={{ boxShadow: "0 0 30px rgba(34,211,238,0.35)" }}
            />
          </div>
          {displayMoods.map((m, i) => (
            <div key={m + i} className="absolute" style={positions[i]}>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur border border-white/15">
                <MoodIcon mood={m} size={12} />
                <span className="text-[10px] text-white/90 font-medium">{m}</span>
              </div>
            </div>
          ))}
          <style>{`@keyframes orbSpin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
        </div>

        <LiquidGlassCard accent="multi">
          <div className="px-3 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-amber-300 text-xs font-medium">Building prescription...</span>
              <span className="text-cyan-300 text-base font-semibold">{progress}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-black/60 overflow-hidden border border-white/10">
              <div
                className="h-full rounded-full transition-all duration-200 ease-out"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg,#fb923c 0%, #f0abfc 50%, #c084fc 100%)",
                  boxShadow: "0 0 18px rgba(251,146,60,0.7)",
                }}
              />
            </div>
            <div className="grid grid-cols-4 gap-1.5 mt-3 text-[9px]">
              <Stat
                icon={<Waves className="w-3 h-3 text-cyan-300" />}
                label="Vibe"
                value={`${4000 + Math.floor(progress * 36)}`}
                color="#67e8f9"
              />
              <Stat
                icon={<BarChart3 className="w-3 h-3 text-purple-300" />}
                label="Sound"
                value={`${8000 + Math.floor(progress * 43)}`}
                color="#c084fc"
              />
              <Stat
                icon={<Heart className="w-3 h-3 text-pink-400" />}
                label="Mood"
                value={`${Math.min(96, 60 + Math.floor(progress * 0.4))}%`}
                color="#f472b6"
              />
              <Stat
                icon={<Target className="w-3 h-3 text-amber-300" />}
                label="Fit"
                value={`${Math.min(98, 65 + Math.floor(progress * 0.35))}%`}
                color="#fbbf24"
              />
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard accent="cyan">
          <div className="px-3 py-2.5 flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full bg-black/60 border border-cyan-400/40 flex items-center justify-center flex-shrink-0"
              style={{ boxShadow: "0 0 14px rgba(34,211,238,0.4)" }}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path
                  d="M8 11 q1.5 -3 3 0"
                  stroke="#67e8f9"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M13 11 q1.5 -3 3 0"
                  stroke="#67e8f9"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M9 15 q3 3 6 0"
                  stroke="#67e8f9"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <div className="text-cyan-300 text-xs font-semibold">Trey-I</div>
              <p className="text-white/75 text-[11px] leading-snug">
                Almost there. The algorithm is seasoning it right.
              </p>
            </div>
          </div>
        </LiquidGlassCard>
      </div>
    </section>
  );
};

const Stat: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({
  icon,
  label,
  value,
  color,
}) => (
  <div className="flex flex-col gap-0.5 min-w-0">
    <div className="flex items-center gap-1 text-white/55 truncate">
      {icon}
      <span className="truncate">{label}</span>
    </div>
    <div className="font-semibold text-xs" style={{ color }}>
      {value}
    </div>
  </div>
);

export default AnalyzingScreen;
