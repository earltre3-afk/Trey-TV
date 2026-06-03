import React from "react";
import treyTvLogo from "@/assets/trey-tv-logo.png";

// Transparent-background PNG version of the official Trey TV logo
const LOGO_URL = treyTvLogo;

interface Props {
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

/**
 * Trey TV logo header.
 * Uses the official transparent-background PNG so the silver/gold mark sits
 * cleanly on the dark neon liquid-glass canvas with no white/black box behind it.
 */
const TreyTVHeader: React.FC<Props> = ({ size = "md", onClick }) => {
  const dims = size === "lg" ? "h-24 sm:h-28" : size === "md" ? "h-16 sm:h-20" : "h-12 sm:h-14";

  return (
    <div
      className="flex justify-center w-full pt-2 pb-3 select-none"
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <div className="relative inline-flex items-center justify-center">
        {/* Soft multi-color halo behind the logo */}
        <div
          className="absolute inset-0 -m-4 rounded-full opacity-40 blur-2xl pointer-events-none"
          style={{
            background:
              "radial-gradient(closest-side, rgba(251,191,36,0.45), transparent 70%), radial-gradient(closest-side, rgba(232,121,249,0.35), transparent 70%)",
          }}
          aria-hidden
        />
        <img
          src={LOGO_URL}
          alt="Trey TV"
          draggable={false}
          className={`relative ${dims} w-auto object-contain pointer-events-none`}
          style={{
            filter:
              "drop-shadow(0 0 18px rgba(255,180,80,0.45)) drop-shadow(0 0 30px rgba(180,80,255,0.35))",
          }}
        />
      </div>
    </div>
  );
};

export default TreyTVHeader;
