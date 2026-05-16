import React from 'react';
import StepShell from './StepShell';
import { LiquidGlassCard, NeonGlassButton } from './LiquidGlass';
import {
  Music, Smile, Drama, Tv, Mic, Zap, Heart, Search, Sofa, Check, Play,
} from 'lucide-react';
import type { ContentType } from './data';

interface Opt {
  value: ContentType;
  color: string;
  accent: 'gold' | 'cyan' | 'magenta' | 'purple' | 'pink' | 'orange';
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

// PDF: exact 9-item 3x3 grid (Music, Drama, Comedy, Reality, Interviews, Motivation, Romance, Mystery, Comfort Content).
const OPTS: Opt[] = [
  { value: 'Music',           color: '#fbbf24', accent: 'gold',    icon: Music },
  { value: 'Drama',           color: '#c084fc', accent: 'purple',  icon: Drama },
  { value: 'Comedy',          color: '#67e8f9', accent: 'cyan',    icon: Smile },
  { value: 'Reality',         color: '#f0abfc', accent: 'pink',    icon: Tv },
  { value: 'Interviews',      color: '#22d3ee', accent: 'cyan',    icon: Mic },
  { value: 'Motivation',      color: '#ec4899', accent: 'magenta', icon: Zap },
  { value: 'Romance',         color: '#fb7185', accent: 'pink',    icon: Heart },
  { value: 'Mystery',         color: '#a78bfa', accent: 'purple',  icon: Search },
  { value: 'Comfort Content', color: '#fb923c', accent: 'orange',  icon: Sofa },
];

interface Props {
  value: ContentType[];
  onChange: (v: ContentType[]) => void;
  onNext: () => void;
  onBack: () => void;
  step: number;
  total: number;
}

const ContentTypeSelector: React.FC<Props> = ({ value, onChange, onNext, onBack, step, total }) => {
  const toggle = (v: ContentType) => {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };

  return (
    <StepShell
      step={step}
      totalSteps={total}
      title={<>What do you want<br />more of tonight?</>}
      subtitle="Pick one or more lanes."
      onBack={onBack}
      footer={
        <NeonGlassButton onClick={onNext} disabled={value.length === 0} className="w-full">
          <span className="inline-flex items-center gap-2 justify-center">
            <Play className="w-4 h-4 fill-black" />
            Continue
          </span>
        </NeonGlassButton>
      }
    >
      <div className="grid grid-cols-3 gap-2">
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
              ariaLabel={`${o.value}${selected ? ', selected' : ''}`}
            >
              <div className="relative px-2 py-3 flex flex-col items-center gap-1.5 min-h-[86px] justify-center">
                {selected && (
                  <div
                    className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: o.color, boxShadow: `0 0 10px ${o.color}` }}
                  >
                    <Check className="w-3 h-3 text-black" strokeWidth={3} />
                  </div>
                )}
                <Icon
                  className="w-7 h-7"
                  style={{ color: o.color, filter: `drop-shadow(0 0 10px ${o.color}cc)` }}
                />
                <span
                  className="text-[10px] sm:text-[11px] text-center font-medium leading-tight"
                  style={{ color: selected ? o.color : 'rgba(255,255,255,0.85)' }}
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

export default ContentTypeSelector;
