import { CoinTier } from "./coin-tiers";

/**
 * Luxury gift token. Renders the tier's emoji at the requested size with
 * a soft radial glow halo and a hover-lift hover state.
 */
export function Coin({
  tier,
  size = 56,
  spinning = false,
  className,
}: {
  tier: CoinTier;
  size?: number;
  spinning?: boolean;
  className?: string;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "grid",
        placeItems: "center",
        position: "relative",
        animation: spinning ? "gift-float 2.4s ease-in-out infinite" : undefined,
      }}
      className={className}
      aria-hidden
    >
      <span
        style={{
          position: "absolute",
          inset: -size * 0.2,
          borderRadius: "9999px",
          background: `radial-gradient(circle, ${tier.glow}, transparent 65%)`,
          filter: "blur(6px)",
          opacity: 0.85,
        }}
      />
      <span
        style={{
          position: "relative",
          zIndex: 1,
          fontSize: size * 0.78,
          lineHeight: 1,
          filter: `drop-shadow(0 4px 14px ${tier.glow})`,
        }}
      >
        {tier.symbol}
      </span>
    </div>
  );
}
