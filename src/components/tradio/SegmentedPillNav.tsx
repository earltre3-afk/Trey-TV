import React from 'react';

interface SegmentedPillNavProps {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}

export default function SegmentedPillNav({ tabs, active, onChange }: SegmentedPillNavProps) {
  return (
    <div className="flex items-center p-1 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.06]">
      {tabs.map((tab) => {
        const isActive = tab === active;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              isActive ? 'bg-white text-black shadow' : 'text-white/55 hover:text-white/80'
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
