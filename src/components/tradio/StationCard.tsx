import React from 'react';

interface StationCardProps {
  title: string;
  subtitle?: string;
  tone: string;
  onClick?: () => void;
}

export default function StationCard({ title, subtitle, tone, onClick }: StationCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-32 h-32 shrink-0 rounded-2xl bg-gradient-to-br ${tone} border border-white/[0.08] relative overflow-hidden flex flex-col items-center justify-center gap-2 active:scale-[0.97] transition-transform`}
    >
      {/* waveform */}
      <div className="flex items-end gap-[2px] h-8">
        {[5, 12, 22, 14, 28, 18, 26, 10, 20, 8, 16].map((h, i) => (
          <span
            key={i}
            className="w-[3px] rounded-full bg-white/90"
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
      <span className="text-white font-bold text-base">{title}</span>
      {subtitle && <span className="text-white/70 text-xs">{subtitle}</span>}
    </button>
  );
}
