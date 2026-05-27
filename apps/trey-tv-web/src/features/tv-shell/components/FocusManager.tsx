import React, { useEffect, useState } from 'react';
import { useFocusGrid } from '../hooks/useFocusGrid';
import { useTV } from '../TVContext';

/**
 * Mount once near the root of the TV shell. Hooks up:
 *  - keyboard arrow / Enter / Backspace / Escape
 *  - gamepad d-pad + analog stick + A/B/Y buttons
 *  - back/menu remote actions
 */
export const FocusManager: React.FC = () => {
  const { back } = useTV();
  useFocusGrid({ onBack: back });
  return null;
};

/**
 * Floating neon outline that tracks whichever element currently holds :focus.
 * Pure visual layer — does not affect tab order or hit-testing.
 */
export const SpatialFocusRing: React.FC = () => {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [radius, setRadius] = useState<number>(16);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = document.activeElement as HTMLElement | null;
      if (el && el !== document.body && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          setRect(r);
          // Match the element's border-radius if any
          const br = parseFloat(getComputedStyle(el).borderRadius) || 16;
          setRadius(Math.min(br, 32));
        } else {
          setRect(null);
        }
      } else {
        setRect(null);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!rect) return null;

  // Inflate the ring slightly so it surrounds, not overlaps.
  const PAD = 6;
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        top: rect.top - PAD,
        left: rect.left - PAD,
        width: rect.width + PAD * 2,
        height: rect.height + PAD * 2,
        borderRadius: radius + PAD,
        pointerEvents: 'none',
        zIndex: 9999,
        boxShadow:
          '0 0 0 2px rgba(255,43,214,0.95), 0 0 22px 4px rgba(255,43,214,0.55), 0 0 60px 12px rgba(168,85,247,0.35)',
        transition: 'top 140ms ease, left 140ms ease, width 140ms ease, height 140ms ease, border-radius 140ms ease',
        willChange: 'top, left, width, height',
      }}
    />
  );
};
