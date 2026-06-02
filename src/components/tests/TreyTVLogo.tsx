import React from 'react';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const TreyTVLogo: React.FC<Props> = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl md:text-3xl',
    lg: 'text-4xl md:text-5xl',
  };
  return (
    <div className={`inline-flex items-baseline gap-1 font-black tracking-tight ${sizes[size]} ${className}`}>
      <span className="bg-gradient-to-b from-white via-white to-slate-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(255,255,255,0.25)]">
        TREY
      </span>
      <span className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-fuchsia-500 bg-clip-text text-transparent italic font-extrabold drop-shadow-[0_0_18px_rgba(232,121,249,0.55)]">
        TV
      </span>
    </div>
  );
};

export default TreyTVLogo;
