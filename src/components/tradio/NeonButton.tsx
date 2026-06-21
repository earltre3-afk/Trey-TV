import React from 'react';

interface NeonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'gradient' | 'glass' | 'outline';
  className?: string;
}

export default function NeonButton({ children, onClick, variant = 'gradient', className = '' }: NeonButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all active:scale-95 select-none';
  const styles: Record<string, string> = {
    gradient:
      'bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 text-black shadow-[0_8px_30px_-6px_rgba(245,158,11,0.6)] hover:brightness-110',
    glass:
      'bg-white/[0.08] backdrop-blur-xl border border-white/10 text-white hover:bg-white/[0.14]',
    outline:
      'bg-transparent border border-amber-400/60 text-white shadow-[0_0_20px_-6px_rgba(245,158,11,0.6)] hover:bg-amber-400/10',
  };

  return (
    <button onClick={onClick} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
}
