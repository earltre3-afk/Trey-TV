import { useEffect, useState } from "react";

/**
 * Vector Trey TV logo.
 * Renders on a white background that animates away ("no background"
 * reveal) so the mark settles cleanly into the dark UI.
 */
export function Logo({ className = "h-9" }: { className?: string }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`${className} relative inline-flex items-center justify-center aspect-[16/6] overflow-hidden rounded-md`}
    >
      {/* Animated white background — fades out to reveal transparent logo */}
      <div
        className={`absolute inset-0 bg-white transition-opacity duration-700 ease-out ${
          revealed ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden
      />
      <svg
        viewBox="0 0 320 120"
        xmlns="http://www.w3.org/2000/svg"
        className="relative h-full w-auto drop-shadow-[0_0_14px_rgba(255,200,80,0.45)]"
        role="img"
        aria-label="Trey TV"
      >
        <defs>
          <linearGradient id="treyGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFE9A8" />
            <stop offset="50%" stopColor="#F4C24A" />
            <stop offset="100%" stopColor="#B8821B" />
          </linearGradient>
          <linearGradient id="treyNeon" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7C5CFF" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>

        {/* TREY */}
        <text
          x="12"
          y="78"
          fontFamily="'Inter', 'Helvetica Neue', system-ui, sans-serif"
          fontWeight="900"
          fontSize="68"
          letterSpacing="-2"
          fill="url(#treyGold)"
        >
          TREY
        </text>

        {/* TV badge */}
        <g transform="translate(208,28)">
          <rect
            x="0"
            y="0"
            rx="10"
            ry="10"
            width="96"
            height="64"
            fill="none"
            stroke="url(#treyNeon)"
            strokeWidth="3"
          />
          <text
            x="48"
            y="46"
            textAnchor="middle"
            fontFamily="'Inter', 'Helvetica Neue', system-ui, sans-serif"
            fontWeight="800"
            fontSize="38"
            letterSpacing="2"
            fill="url(#treyNeon)"
          >
            TV
          </text>
        </g>

        {/* Underline accent */}
        <rect x="12" y="92" width="184" height="4" rx="2" fill="url(#treyGold)" opacity="0.75" />
      </svg>
    </div>
  );
}
