import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { CoinTier } from "./coin-tiers";
import { Coin } from "./Coin";

type Burst = {
  id: number;
  tier: CoinTier;
  recipient?: string;
};

let _emit: ((tier: CoinTier, recipient?: string) => void) | null = null;

export function triggerCoinGift(tier: CoinTier, recipient?: string) {
  _emit?.(tier, recipient);
}

export function GiftBurstHost() {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [mounted, setMounted] = useState(false);
  const idRef = useRef(0);

  useEffect(() => {
    setMounted(true);
    _emit = (tier, recipient) => {
      const id = ++idRef.current;
      setBursts((b) => [...b, { id, tier, recipient }]);
      window.setTimeout(() => {
        setBursts((b) => b.filter((x) => x.id !== id));
      }, 2800);
    };
    return () => {
      _emit = null;
    };
  }, []);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      aria-live="polite"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 99999,
        overflow: "hidden",
      }}
    >
      {bursts.map((b) => (
        <BurstLayer key={b.id} tier={b.tier} recipient={b.recipient} />
      ))}
    </div>,
    document.body,
  );
}

function BurstLayer({ tier, recipient }: { tier: CoinTier; recipient?: string }) {
  // Pre-randomize shower offsets (themed glyphs falling like petals/fireworks)
  const shower = useRef(
    Array.from({ length: tier.shower }, (_, i) => ({
      cx: `${(Math.random() * 110 - 55).toFixed(1)}vw`,
      cx2: `${(Math.random() * 110 - 55).toFixed(1)}vw`,
      delay: Math.random() * 700,
      dur: 1600 + Math.random() * 1100,
      size: 18 + Math.random() * 26,
      rot: `${Math.random() * 720 - 360}deg`,
      glyph: tier.showerGlyphs[i % tier.showerGlyphs.length],
      key: i,
    })),
  ).current;

  const sparkles = useRef(
    Array.from({ length: tier.particles }, (_, i) => {
      const a = (i / tier.particles) * Math.PI * 2;
      const r = 90 + Math.random() * 80;
      return {
        sx: `${Math.cos(a) * r}px`,
        sy: `${Math.sin(a) * r}px`,
        delay: Math.random() * 250,
        size: 3 + Math.random() * 5,
        key: i,
      };
    }),
  ).current;

  return (
    <>
      {/* Backdrop flash */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 45%, ${tier.glow}, transparent 60%)`,
          opacity: 0,
          animation: "fade-in 0.3s ease-out forwards, fade-out 0.7s ease-out 1.8s forwards",
          mixBlendMode: "screen",
        }}
      />

      {/* Center gift rise */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          animation: "coin-rise 2.5s cubic-bezier(0.2,0.8,0.2,1) forwards",
        }}
      >
        <div style={{ animation: "gift-float 2.2s ease-in-out infinite" }}>
          <Coin tier={tier} size={160} />
        </div>
        <div
          style={{
            marginTop: 14,
            textAlign: "center",
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            letterSpacing: "0.18em",
            fontSize: 13,
            color: "oklch(0.97 0.03 80)",
            textShadow: `0 0 18px ${tier.glow}`,
            textTransform: "uppercase",
          }}
        >
          {tier.name}
          {recipient ? ` → @${recipient}` : ""}
        </div>
        <div
          style={{
            marginTop: 4,
            textAlign: "center",
            fontSize: 11,
            color: "oklch(0.85 0.03 80 / 0.85)",
            fontStyle: "italic",
          }}
        >
          {tier.blurb}
        </div>
      </div>

      {/* Ring burst */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 140,
          height: 140,
          borderRadius: "9999px",
          border: `2px solid ${tier.glow}`,
          boxShadow: `0 0 50px ${tier.glow}`,
          animation: "ring-burst 1.4s cubic-bezier(0.2,0.8,0.2,1) forwards",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 90,
          height: 90,
          borderRadius: "9999px",
          border: `1px solid ${tier.glow}`,
          animation: "ring-burst 1.9s cubic-bezier(0.2,0.8,0.2,1) 0.18s forwards",
          opacity: 0,
        }}
      />

      {/* Sparkles radial */}
      {sparkles.map((s) => (
        <span
          key={s.key}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: s.size,
            height: s.size,
            borderRadius: "9999px",
            background: tier.accent,
            boxShadow: `0 0 14px ${tier.glow}`,
            ["--sx" as any]: s.sx,
            ["--sy" as any]: s.sy,
            animation: `sparkle-pop 1.2s cubic-bezier(0.2,0.8,0.2,1) ${s.delay}ms forwards`,
            opacity: 0,
          }}
        />
      ))}

      {/* Themed shower (petals / fireworks / bubbles) */}
      {shower.map((c) => (
        <div
          key={c.key}
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            fontSize: c.size,
            lineHeight: 1,
            ["--cx" as any]: c.cx,
            ["--cx2" as any]: c.cx2,
            ["--cr" as any]: c.rot,
            animation: `coin-fall ${c.dur}ms cubic-bezier(0.4,0.05,0.3,1) ${c.delay}ms forwards`,
            opacity: 0,
            filter: `drop-shadow(0 0 8px ${tier.glow})`,
            willChange: "transform, opacity",
          }}
        >
          {c.glyph}
        </div>
      ))}
    </>
  );
}
