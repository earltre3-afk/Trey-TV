import React from 'react';
import { CheckCircle2, Clock3 } from 'lucide-react';

export default function CheckInIndicator({ checked, label }: { checked: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
        checked
          ? 'bg-emerald-400/15 text-emerald-200 border border-emerald-300/30'
          : 'bg-white/[0.05] text-white/45 border border-white/10'
      }`}
    >
      {checked ? <CheckCircle2 className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}
      {label}
    </span>
  );
}
