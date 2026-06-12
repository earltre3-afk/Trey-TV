import type { CreateType } from './last-create-type.ts';

export const DEAD_ZONE_RADIUS = 30;

const RAD_TO_DEG = 180 / Math.PI;

/**
 * Map a pointer position to a bubble id (or null) based on its angle from
 * vertical relative to the pivot. Pivot is the center of the + button at the
 * top of the bottom nav.
 *
 * - Pointer below pivot (dy >= 0): null.
 * - Pointer within DEAD_ZONE_RADIUS of pivot: null (prevents jitter on the +).
 * - Else: angle from vertical-up in degrees, binned per design spec section 4.
 */
export function computeHoveredBubble(
  pointerX: number,
  pointerY: number,
  pivotX: number,
  pivotY: number,
): CreateType | null {
  const dx = pointerX - pivotX;
  const dy = pointerY - pivotY;
  if (dy >= 0) return null;
  const distance = Math.hypot(dx, dy);
  if (distance < DEAD_ZONE_RADIUS) return null;
  const angleDeg = Math.atan2(dx, -dy) * RAD_TO_DEG;
  if (angleDeg >= -90 && angleDeg < -48) return 'photo';
  if (angleDeg >= -48 && angleDeg < 0) return 'video';
  if (angleDeg >= 0 && angleDeg < 48) return 'story';
  if (angleDeg >= 48 && angleDeg <= 90) return 'reel';
  return null;
}
