import React from "react";
import treyTvLogo from "@/assets/trey-tv-logo.png";

interface TreyBrandMarkProps {
  size?: number; // height in px
  className?: string;
  style?: React.CSSProperties;
  glow?: boolean;
  variant?: "full" | "mark"; // 'mark' = compact (still uses official logo, just smaller)
}

/* ============================================================
   Official Trey TV brandmark
   Renders the EXACT attached official logo (transparent PNG).
   - Never wrapped in a white box / white plate
   - Never recolored or simplified
   - Optional soft drop-shadow glow only (does not change pixels)
   ============================================================ */
export const OFFICIAL_TREY_TV_LOGO_URL = treyTvLogo;

function getTreyTvLogoSrc(): string {
  // Host override hook for QA or brand asset experiments. By default this uses
  // Trey TV's local transparent official logo asset.
  if (typeof window !== "undefined") {
    const injected = (window as typeof window & { __TREY_TV_LOGO_SRC__?: string })
      .__TREY_TV_LOGO_SRC__;
    if (injected) return injected;
  }
  return OFFICIAL_TREY_TV_LOGO_URL;
}

export const TreyBrandMark: React.FC<TreyBrandMarkProps> = ({
  size = 56,
  className,
  style,
  glow = true,
  variant = "full",
}) => {
  // 'full' variant: wide wordmark (logo aspect ~ 1.7:1 → width ≈ size * 1.7)
  // 'mark' variant: same logo, simply rendered at a more compact height
  const isMark = variant === "mark";
  const height = isMark ? size : size;
  const width = isMark ? size * 1.7 : size * 1.7;

  return (
    <img
      src={getTreyTvLogoSrc()}
      alt="Trey TV"
      draggable={false}
      className={className}
      style={{
        display: "block",
        width,
        height,
        objectFit: "contain",
        // GUARANTEE no white box: image PNG already has transparency,
        // we never apply any background here.
        background: "transparent",
        // Premium soft glow so the logo reads on dark glass without
        // adding any plate behind it.
        filter: glow
          ? "drop-shadow(0 0 6px rgba(0,183,255,0.35)) drop-shadow(0 0 14px rgba(168,85,247,0.28)) drop-shadow(0 0 18px rgba(255,200,87,0.18))"
          : "none",
        userSelect: "none",
        pointerEvents: "none",
        ...style,
      }}
    />
  );
};

export default TreyBrandMark;
