import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
  action?: string;
}

export default function SectionHeader({ title, onSeeAll, action = 'See All' }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 mb-3">
      <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
      {onSeeAll && (
        <button
          onClick={onSeeAll}
          className="flex items-center gap-0.5 text-sm font-medium text-amber-400 active:opacity-70"

        >
          {action}
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
