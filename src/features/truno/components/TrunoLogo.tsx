import React from "react";

interface Props {
  size?: "sm" | "md" | "lg" | "xl";
  subtitle?: string;
  showParent?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "text-3xl",
  md: "text-5xl",
  lg: "text-6xl md:text-7xl",
  xl: "text-7xl md:text-8xl",
};

const TrunoLogo: React.FC<Props> = ({
  size = "lg",
  subtitle,
  showParent = true,
  className = "",
}) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {showParent && (
        <div className="flex flex-col items-center mb-1">
          <div className="flex items-baseline gap-1">
            <span
              className="text-xl font-light italic text-white tracking-tight"
              style={{ fontFamily: "cursive" }}
            >
              Trey
            </span>
            <span className="text-xl font-bold italic bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              TV
            </span>
            <span className="text-amber-400 text-sm">✦</span>
          </div>
          <span className="text-[10px] tracking-[0.3em] text-purple-300/80 font-semibold mt-0.5">
            ORIGINAL GAME
          </span>
        </div>
      )}
      <div className="relative">
        <h1
          className={`${sizeMap[size]} font-black tracking-tight leading-none select-none`}
          style={{
            background:
              "linear-gradient(90deg, #FF0080 0%, #FF3366 20%, #9D4EDD 45%, #00D9FF 75%, #00FF88 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter:
              "drop-shadow(0 0 20px rgba(255,0,128,0.5)) drop-shadow(0 0 40px rgba(157,78,221,0.4))",
            fontFamily: '"Arial Black", system-ui, sans-serif',
            letterSpacing: "-0.02em",
          }}
        >
          TRUNO<sup className="text-xs align-super opacity-60">™</sup>
        </h1>
      </div>
      {subtitle && <p className="mt-2 text-sm text-zinc-300/90 text-center px-4">{subtitle}</p>}
    </div>
  );
};

export default TrunoLogo;
