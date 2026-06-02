import React from "react";

/**
 * Official Trey TV logo (silver + gold metallic wordmark).
 * Replaces every text-based "Trey TV" heading across the app.
 *
 * Use the `size` prop to scale; the asset is a 1:1 transparent PNG so any
 * height looks crisp on dark backgrounds.
 */
export const TREY_TV_LOGO_URL =
  "https://d64gsuwffb70l.cloudfront.net/6a060641815889c4c7c610fd_1778783806509_ab6fb4ed.png";

interface TreyTVLogoProps {
  /** Pixel height of the logo. Width auto-scales. */
  size?: number;
  className?: string;
  /** Adds a subtle gold glow behind the logo on very dark surfaces. */
  glow?: boolean;
}

export const TreyTVLogo: React.FC<TreyTVLogoProps> = ({
  size = 32,
  className = "",
  glow = false,
}) => (
  <span
    className={`relative inline-flex items-center justify-center ${className}`}
    style={{ height: size }}
  >
    {glow && (
      <span aria-hidden className="absolute inset-0 rounded-full bg-amber-400/20 blur-2xl" />
    )}
    <img
      src={TREY_TV_LOGO_URL}
      alt="Trey TV"
      draggable={false}
      style={{ height: size, width: "auto" }}
      className="relative select-none object-contain"
    />
  </span>
);

export default TreyTVLogo;
