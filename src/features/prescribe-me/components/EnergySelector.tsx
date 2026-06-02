import React from "react";
import StepShell from "./StepShell";
import { LiquidGlassCard, NeonGlassButton } from "./LiquidGlass";
import { Cloud, Zap, Heart, ChevronRight } from "lucide-react";
import type { Energy } from "./data";

interface Opt {
  value: Energy;
  title: string;
  desc: string;
  color: string;
  accent: "purple" | "gold" | "cyan" | "pink";
  icon: React.ReactNode;
}

// PDF: exactly 3 options (Soft, Balanced, High Energy) in a single row.
const OPTS: Opt[] = [
  {
    value: "Soft",
    title: "Soft",
    desc: "Calm and easy.",
    color: "#c084fc",
    accent: "purple",
    icon: <Cloud className="w-8 h-8" />,
  },
  {
    value: "Balanced",
    title: "Balanced",
    desc: "Focused and clear.",
    color: "#fbbf24",
    accent: "gold",
    icon: <YinYang />,
  },
  {
    value: "High Energy",
    title: "High Energy",
    desc: "Up and active.",
    color: "#67e8f9",
    accent: "cyan",
    icon: <Zap className="w-8 h-8" />,
  },
];

function YinYang() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-8 h-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a4.5 4.5 0 0 0 0 9 4.5 4.5 0 0 1 0 9" />
      <circle cx="12" cy="7.5" r="1" fill="currentColor" />
      <circle cx="12" cy="16.5" r="1" fill="currentColor" />
    </svg>
  );
}

interface Props {
  value: Energy | null;
  onChange: (v: Energy) => void;
  onNext: () => void;
  onBack: () => void;
  step: number;
  total: number;
}

const Waveform: React.FC = () => (
  <div className="relative h-12 mb-3 overflow-hidden" aria-hidden>
    <svg viewBox="0 0 400 80" className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="wfg" x1="0%" x2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="35%" stopColor="#fbbf24" />
          <stop offset="65%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      {Array.from({ length: 72 }).map((_, i) => {
        const x = (i / 72) * 400;
        const h = 10 + Math.abs(Math.sin(i * 0.55) * 32) + Math.abs(Math.cos(i * 0.27) * 16);
        return (
          <rect
            key={i}
            x={x}
            y={40 - h / 2}
            width="3"
            height={h}
            rx="1.5"
            fill="url(#wfg)"
            style={{
              animation: `wfBar 1.6s ease-in-out ${i * 0.04}s infinite alternate`,
              transformOrigin: "center",
              filter: "drop-shadow(0 0 5px rgba(236,72,153,0.6))",
            }}
          />
        );
      })}
    </svg>
    <style>{`@keyframes wfBar { from { transform: scaleY(0.55); } to { transform: scaleY(1.15); } }`}</style>
  </div>
);

const EnergySelector: React.FC<Props> = ({ value, onChange, onNext, onBack, step, total }) => {
  return (
    <StepShell
      step={step}
      totalSteps={total}
      title={
        <>
          What energy are
          <br />
          you looking for?
        </>
      }
      onBack={onBack}
      footer={
        <NeonGlassButton onClick={onNext} disabled={!value} className="w-full">
          <span className="inline-flex items-center gap-2 justify-center">
            Continue
            <ChevronRight className="w-4 h-4" />
          </span>
        </NeonGlassButton>
      }
    >
      <Waveform />
      <div className="grid grid-cols-3 gap-2">
        {OPTS.map((o) => {
          const selected = value === o.value;
          return (
            <LiquidGlassCard
              key={o.value}
              accent={o.accent}
              selected={selected}
              onClick={() => onChange(o.value)}
              role="radio"
              ariaPressed={selected}
              ariaLabel={`${o.title} energy: ${o.desc}`}
            >
              <div className="relative px-2 py-4 flex flex-col items-center text-center gap-1.5 min-h-[156px]">
                <div
                  className="w-12 h-12 rounded-full bg-black/50 border flex items-center justify-center mt-1"
                  style={{
                    borderColor: selected ? o.color : "rgba(255,255,255,0.15)",
                    boxShadow: selected
                      ? `0 0 24px ${o.color}cc, inset 0 0 14px ${o.color}66`
                      : "none",
                    color: o.color,
                  }}
                >
                  {o.icon}
                </div>
                <div
                  className="font-serif text-base sm:text-lg leading-tight mt-1"
                  style={{ color: o.color, textShadow: `0 0 12px ${o.color}66` }}
                >
                  {o.title}
                </div>
                {selected && (
                  <Heart
                    className="w-3 h-3"
                    style={{
                      color: o.color,
                      fill: o.color,
                      filter: `drop-shadow(0 0 6px ${o.color})`,
                    }}
                  />
                )}
                <p className="text-[9.5px] text-white/70 leading-snug px-0.5">{o.desc}</p>
              </div>
            </LiquidGlassCard>
          );
        })}
      </div>
    </StepShell>
  );
};

export default EnergySelector;
