import React from 'react';
import StepShell from './StepShell';
import { NeonGlassButton } from './LiquidGlass';
import MoodIcon, { MOOD_META } from './MoodIcon';
import { Check, ChevronRight } from 'lucide-react';
import type { Mood } from './data';

// PDF: exactly 8 moods in 2 rows of 4 columns.
const MOODS: Mood[] = ['Happy', 'Chill', 'Romantic', 'Motivated', 'Reflective', 'Wild', 'Healing', 'Curious'];

interface Props {
  value: Mood[];
  onChange: (v: Mood[]) => void;
  onNext: () => void;
  onBack: () => void;
  step: number;
  total: number;
}

const MoodSelector: React.FC<Props> = ({ value, onChange, onNext, onBack, step, total }) => {
  const toggle = (m: Mood) => {
    if (value.includes(m)) {
      onChange(value.filter((x) => x !== m));
    } else if (value.length < 3) {
      // Cap multi-select at 3 per design rules
      onChange([...value, m]);
    } else {
      // Replace oldest selection if user picks a 4th mood
      onChange([...value.slice(1), m]);
    }
  };

  return (
    <StepShell
      step={step}
      totalSteps={total}
      title={<>How are you<br />feeling right now?</>}
      subtitle="Pick up to 3 vibes."
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
      <div className="grid grid-cols-4 gap-2">
        {MOODS.map((m) => {
          const selected = value.includes(m);
          const color = MOOD_META[m].color;
          return (
            <button
              key={m}
              type="button"
              onClick={() => toggle(m)}
              role="checkbox"
              aria-checked={selected}
              aria-label={`${m} mood${selected ? ', selected' : ''}`}
              className="group flex flex-col items-center gap-1.5 focus:outline-none"
            >
              <div className="relative">
                {selected && (
                  <div
                    className="absolute -top-1 -right-1 z-10 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: color, boxShadow: `0 0 12px ${color}` }}
                  >
                    <Check className="w-3 h-3 text-black" strokeWidth={3} />
                  </div>
                )}
                <div
                  className="w-[58px] h-[58px] sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: selected
                      ? `radial-gradient(circle at 50% 45%, ${color}22, rgba(0,0,0,0.85) 70%)`
                      : 'radial-gradient(circle at 50% 45%, rgba(255,255,255,0.06), rgba(0,0,0,0.7) 70%)',
                    border: `1.5px solid ${selected ? color : 'rgba(255,255,255,0.14)'}`,
                    boxShadow: selected
                      ? `0 0 22px ${color}cc, inset 0 0 14px ${color}55`
                      : `inset 0 0 10px rgba(255,255,255,0.04)`,
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <MoodIcon mood={m} size={25} />
                </div>
              </div>
              <span
                className="text-[11px] sm:text-xs font-medium"
                style={{
                  color: selected ? color : 'rgba(255,255,255,0.78)',
                  textShadow: selected ? `0 0 8px ${color}88` : 'none',
                }}
              >
                {m}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-[10px] text-white/45">
        Multi-select up to 3 moods for the most accurate prescription.
      </p>
    </StepShell>
  );
};

export default MoodSelector;
