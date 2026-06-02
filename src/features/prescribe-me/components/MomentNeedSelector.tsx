import React from "react";
import StepShell from "./StepShell";
import { LiquidGlassCard, NeonGlassButton } from "./LiquidGlass";
import { User, Users, Zap, Popcorn, Smile, Leaf, Check, ChevronRight } from "lucide-react";
import type { MomentNeed } from "./data";

interface Opt {
  value: MomentNeed;
  color: string;
  accent: "gold" | "cyan" | "magenta" | "purple" | "pink" | "orange";
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

// PDF: exact 6-item 2x3 grid.
const OPTS: Opt[] = [
  { value: "Just me", color: "#c084fc", accent: "purple", icon: User },
  { value: "Watching with friends", color: "#fb923c", accent: "orange", icon: Users },
  { value: "Need a quick watch", color: "#ec4899", accent: "magenta", icon: Zap },
  { value: "Give me a deep binge", color: "#22d3ee", accent: "cyan", icon: Popcorn },
  { value: "Make me laugh", color: "#fbbf24", accent: "gold", icon: Smile },
  { value: "I need something healing", color: "#a78bfa", accent: "purple", icon: Leaf },
];

interface Props {
  value: MomentNeed[];
  onChange: (v: MomentNeed[]) => void;
  onNext: () => void;
  onBack: () => void;
  step: number;
  total: number;
}

const MomentNeedSelector: React.FC<Props> = ({ value, onChange, onNext, onBack, step, total }) => {
  const toggle = (v: MomentNeed) => {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };

  return (
    <StepShell
      step={step}
      totalSteps={total}
      title={
        <>
          What does
          <br />
          this moment need?
        </>
      }
      subtitle="One more detail for a better match."
      onBack={onBack}
      footer={
        <NeonGlassButton onClick={onNext} disabled={value.length === 0} className="w-full">
          <span className="inline-flex items-center gap-2 justify-center">
            Next
            <ChevronRight className="w-4 h-4" />
          </span>
        </NeonGlassButton>
      }
    >
      <div className="grid grid-cols-2 gap-2.5">
        {OPTS.map((o) => {
          const Icon = o.icon;
          const selected = value.includes(o.value);
          return (
            <LiquidGlassCard
              key={o.value}
              accent={o.accent}
              selected={selected}
              onClick={() => toggle(o.value)}
              role="checkbox"
              ariaPressed={selected}
              ariaLabel={o.value}
            >
              <div className="relative px-3 py-4 flex flex-col items-center gap-2 min-h-[108px] justify-center text-center">
                {selected && (
                  <div
                    className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: o.color, boxShadow: `0 0 10px ${o.color}` }}
                  >
                    <Check className="w-3 h-3 text-black" strokeWidth={3} />
                  </div>
                )}
                <Icon
                  className="w-7 h-7"
                  style={{ color: o.color, filter: `drop-shadow(0 0 12px ${o.color}cc)` }}
                />
                <span
                  className="text-[11px] sm:text-xs font-medium leading-tight"
                  style={{ color: selected ? o.color : "rgba(255,255,255,0.9)" }}
                >
                  {o.value}
                </span>
              </div>
            </LiquidGlassCard>
          );
        })}
      </div>
    </StepShell>
  );
};

export default MomentNeedSelector;
