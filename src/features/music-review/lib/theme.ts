import type React from "react";
export const TREY_COLORS = {
  bg: "#05070D",
  panel: "#08111F",
  panelDeep: "#0B1426",
  charcoal: "#101827",
  blue: "#00B7FF",
  gold: "#FFC857",
  amber: "#FFB000",
  white: "#F8FAFC",
  muted: "#94A3B8",
  green: "#22C55E",
  red: "#EF4444",
  purple: "#A855F7",
  border: "#1a2942",
} as const;

export const glassPanel =
  "rounded-3xl bg-gradient-to-b from-[#0B1426]/95 to-[#08111F]/95 border border-[#1a2942] backdrop-blur-xl shadow-[0_0_40px_-15px_rgba(0,183,255,0.35)]";

export const neonGlowStyle = (color: string): React.CSSProperties => ({
  boxShadow: `0 0 30px -5px ${color}, inset 0 1px 0 0 rgba(255,255,255,0.05)`,
});

// Kept for backward compatibility with earlier components. Prefer neonGlowStyle() for dynamic colors.
export const neonGlow = (_color: string) => "";
