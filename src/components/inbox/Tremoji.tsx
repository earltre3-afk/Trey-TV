import type { CSSProperties } from "react";

const NEON: { color: string; ring: string }[] = [
  { color: "oklch(0.82 0.16 85)", ring: "rgba(255, 200, 87, 0.95)" },
  { color: "oklch(0.82 0.15 215)", ring: "rgba(0, 183, 255, 0.95)" },
  { color: "oklch(0.7 0.25 340)", ring: "rgba(255, 52, 185, 0.95)" },
  { color: "oklch(0.65 0.22 300)", ring: "rgba(168, 85, 247, 0.95)" },
  { color: "oklch(0.78 0.18 150)", ring: "rgba(60, 230, 170, 0.95)" },
  { color: "oklch(0.65 0.24 15)", ring: "rgba(255, 92, 60, 0.95)" },
];

function pickNeon(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return NEON[h % NEON.length];
}

interface TremojiProps {
  emoji: string;
  size?: number;
  label?: string;
  variant?: number;
  static?: boolean;
  className?: string;
}

export function Tremoji({
  emoji,
  size = 32,
  label,
  variant,
  static: isStatic = false,
  className = "",
}: TremojiProps) {
  const neon =
    typeof variant === "number" ? NEON[variant % NEON.length] : pickNeon(emoji);
  const glyphSize = Math.round(size * 0.62);

  const style: CSSProperties = {
    width: size,
    height: size,
    background: "radial-gradient(circle at 50% 55%, #08111F 0%, #05070D 70%)",
    boxShadow: [
      `0 0 0 1.5px ${neon.ring}`,
      `0 0 ${Math.round(size * 0.28)}px ${neon.ring}`,
      `inset 0 0 ${Math.round(size * 0.18)}px ${neon.color.replace(")", " / 0.35)")}`,
    ].join(", "),
    fontSize: glyphSize,
    lineHeight: 1,
  };

  return (
    <span
      role="img"
      aria-label={label ?? emoji}
      title={label}
      className={`tremoji ${isStatic ? "" : "tremoji-pulse"} ${className}`}
      style={style}
    >
      <span aria-hidden className="tremoji-gloss" />
      <span
        aria-hidden
        className="tremoji-glyph"
        style={{
          filter: `drop-shadow(0 0 ${Math.round(size * 0.12)}px ${neon.ring}) drop-shadow(0 0 ${Math.round(size * 0.04)}px rgba(255,255,255,0.35))`,
        }}
      >
        {emoji}
      </span>
    </span>
  );
}

export default Tremoji;
