import React from 'react';

export const TreyLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const scale = size === 'sm' ? 'text-2xl' : size === 'lg' ? 'text-5xl' : 'text-4xl';
  const sub = size === 'sm' ? 'text-[8px]' : 'text-[10px]';
  return (
    <div className="flex flex-col items-center select-none">
      <div
        className={`${scale} font-black tracking-tight leading-none`}
        style={{ fontFamily: '"Impact","Anton","Bebas Neue",Arial,sans-serif' }}
      >
        <span
          style={{
            color: '#FFC857',
            textShadow:
              '0 0 18px rgba(255,200,87,0.55), 0 0 30px rgba(255,176,0,0.35)',
            WebkitTextStroke: '0.5px rgba(255,200,87,0.4)'
          }}
        >
          TREY
        </span>{' '}
        <span
          style={{
            color: '#00B7FF',
            textShadow:
              '0 0 18px rgba(0,183,255,0.6), 0 0 30px rgba(0,183,255,0.4)'
          }}
        >
          TV
        </span>
      </div>
      <div
        className={`${sub} tracking-[0.65em] text-[#00B7FF] mt-0.5`}
        style={{ textShadow: '0 0 10px rgba(0,183,255,0.5)' }}
      >
        G A M E S
      </div>
      <div
        className={`${sub} tracking-[0.45em] text-[#FFC857] mt-1`}
        style={{ textShadow: '0 0 8px rgba(255,200,87,0.4)' }}
      >
        — LIVE REVIEW —
      </div>
    </div>
  );
};
