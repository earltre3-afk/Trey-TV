import React from 'react';

/**
 * Trey TV-aligned Tradio logo system.
 * - Chrome/silver "Tra" influence from the Trey script
 * - Gold "dio" influence from the TV lettering
 * - A broadcast wave / radio ring icon with a star flare
 * - Premium black-background compatibility
 *
 * Modes:
 *  - withWordmark (default): full horizontal wordmark
 *  - withWordmark={false}: compact icon-only mode
 */
export default function TradioLogo({
  withWordmark = true,
  size = 'md',
  glow = true,
}: {
  withWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}) {
  const iconPx = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9';
  const wordPx = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className={`relative ${iconPx} flex items-center justify-center`}>
        {glow && (
          <span className="absolute inset-0 rounded-full bg-amber-400/25 blur-md animate-pulse" />
        )}
        <svg viewBox="0 0 44 44" className={`relative ${iconPx}`}>
          <defs>
            <linearGradient id="tradioChrome" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="45%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
            <linearGradient id="tradioGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>

          {/* outer broadcast ring (chrome) */}
          <circle cx="22" cy="22" r="19" fill="#0a0a0f" stroke="url(#tradioChrome)" strokeWidth="1.5" />
          {/* inner radio ring (gold) */}
          <circle cx="22" cy="22" r="12.5" fill="none" stroke="url(#tradioGold)" strokeWidth="2.4" />

          {/* broadcast waves */}
          <path d="M9 16 A 20 20 0 0 0 9 28" fill="none" stroke="url(#tradioGold)" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
          <path d="M35 16 A 20 20 0 0 1 35 28" fill="none" stroke="url(#tradioChrome)" strokeWidth="2" strokeLinecap="round" opacity="0.9" />

          {/* swoosh / motion line */}
          <path d="M6 36 Q 22 30 38 36" fill="none" stroke="url(#tradioGold)" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />


          {/* center "T" mark in gold */}
          <text
            x="22"
            y="28.5"
            textAnchor="middle"
            fontSize="17"
            fontWeight="900"
            fontStyle="italic"
            fill="url(#tradioGold)"
            fontFamily="Inter, system-ui, sans-serif"
          >
            T
          </text>

          {/* star flare */}
          <path d="M34 11 l1.1 2.6 2.6 1.1 -2.6 1.1 -1.1 2.6 -1.1 -2.6 -2.6 -1.1 2.6 -1.1 z" fill="#fde68a" />
        </svg>
      </div>

      {withWordmark && (
        <span className={`font-black tracking-tight ${wordPx} leading-none`}>
          <span className="bg-gradient-to-b from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Tra
          </span>
          <span className="bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
            dio
          </span>
        </span>
      )}
    </div>
  );
}
