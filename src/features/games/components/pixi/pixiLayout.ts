/**
 * pixiLayout.ts
 * Canonical layout constants and helpers for Trey TV Pixi table scenes.
 * All measurements are in logical pixels (DPR handled by autoDensity).
 */

export interface TableLayout {
  w: number;
  h: number;
  cx: number;
  cy: number;
  cardW: number;
  cardH: number;
  cardRadius: number;
}

/**
 * Normalized (0-1) seat positions that match seatCenter().
 * Used by React seat overlays to align with Pixi card stacks.
 * Keep in sync with seatCenter() below.
 */
export const SEAT_PIXI_NORM = {
  bottom: { x: 0.50, y: 0.82 },
  left:   { x: 0.12, y: 0.50 },
  top:    { x: 0.50, y: 0.16 },
  right:  { x: 0.88, y: 0.50 },
} as const;

/** Build layout from canvas dimensions */
export function buildLayout(w: number, h: number): TableLayout {
  // Card proportions: standard playing card 63.5 x 88.9 mm → ~0.714 ratio
  // Slightly larger cards for better readability on mobile
  const cardH = Math.min(h * 0.200, 110);
  const cardW = cardH * 0.714;
  return {
    w, h,
    cx: w / 2,
    cy: h / 2,
    cardW,
    cardH,
    cardRadius: cardW * 0.1,
  };
}

/** 4-seat table seat positions, relative to layout center */
export function seatCenter(
  seat: 0 | 1 | 2 | 3,
  layout: TableLayout,
  bottomSeat = 0,
): { x: number; y: number } {
  const rotated = (seat - bottomSeat + 4) % 4;
  const { w, h } = layout;
  switch (rotated) {
    case 0: return { x: w * 0.50, y: h * 0.82 };   // bottom (player)
    case 1: return { x: w * 0.12, y: h * 0.50 };   // left
    case 2: return { x: w * 0.50, y: h * 0.16 };   // top
    case 3: return { x: w * 0.88, y: h * 0.50 };   // right
    default: return { x: w / 2, y: h / 2 };
  }
}

/** Hand fan layout — returns per-card x/y/rotation offsets centered on cx */
export function fanLayout(
  count: number,
  cardW: number,
  maxWidth: number,
  liftBase = 0,
): Array<{ dx: number; dy: number; rotation: number }> {
  if (count === 0) return [];
  const spacing = Math.min(cardW * 0.72, maxWidth / Math.max(count, 1));
  const totalWidth = spacing * (count - 1);
  const maxRotDeg = Math.min(3.5, 28 / Math.max(count, 1));

  return Array.from({ length: count }, (_, i) => {
    const t = count > 1 ? (i / (count - 1)) * 2 - 1 : 0; // -1 to +1
    return {
      dx: -totalWidth / 2 + i * spacing,
      dy: -liftBase + Math.abs(t) * liftBase * 0.4,
      rotation: t * maxRotDeg * (Math.PI / 180),
    };
  });
}
