import React from 'react';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function GlassPanel({ children, className = '', onClick }: GlassPanelProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.7)] ${onClick ? 'cursor-pointer active:scale-[0.99] transition-transform' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
