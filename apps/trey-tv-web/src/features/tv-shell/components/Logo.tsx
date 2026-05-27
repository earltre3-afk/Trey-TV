import React from 'react';
import { TREY_TV_LOGO } from '../mockData';

// Official Trey TV logo (silver + gold). DO NOT redraw or substitute.
export const TreyLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const heights = { sm: 'h-10', md: 'h-14', lg: 'h-24', xl: 'h-40' };
  return (
    <img
      src={TREY_TV_LOGO}
      alt="Trey TV"
      draggable={false}
      className={`${heights[size]} w-auto object-contain select-none drop-shadow-[0_0_20px_rgba(255,43,214,0.25)] ${className}`}
    />
  );
};
