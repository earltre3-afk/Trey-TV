/**
 * pixiAnimations.ts
 * Reusable animation primitives for the Trey TV game Pixi scenes.
 */
import type { Container } from "pixi.js";

export type EaseFn = (t: number) => number;

export const ease = {
  outCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  outQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  outBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  inOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  linear: (t: number) => t,
};

export interface Tween {
  obj: Container;
  from: Partial<{
    x: number;
    y: number;
    rotation: number;
    alpha: number;
    scaleX: number;
    scaleY: number;
  }>;
  to: Partial<{
    x: number;
    y: number;
    rotation: number;
    alpha: number;
    scaleX: number;
    scaleY: number;
  }>;
  duration: number; // seconds
  elapsed: number;
  easeFn: EaseFn;
  onComplete?: () => void;
  delay?: number;
}

/** Apply a linear interpolation tick to a tween. Returns true if still running. */
export function tickTween(tween: Tween, dt: number): boolean {
  if ((tween.delay ?? 0) > 0) {
    tween.delay = (tween.delay ?? 0) - dt;
    return true;
  }
  tween.elapsed += dt;
  const raw = Math.min(tween.elapsed / tween.duration, 1);
  const t = tween.easeFn(raw);

  const { obj, from, to } = tween;
  if (from.x !== undefined && to.x !== undefined) obj.x = from.x + (to.x - from.x) * t;
  if (from.y !== undefined && to.y !== undefined) obj.y = from.y + (to.y - from.y) * t;
  if (from.rotation !== undefined && to.rotation !== undefined)
    obj.rotation = from.rotation + (to.rotation - from.rotation) * t;
  if (from.alpha !== undefined && to.alpha !== undefined)
    obj.alpha = from.alpha + (to.alpha - from.alpha) * t;
  if (from.scaleX !== undefined && to.scaleX !== undefined)
    obj.scale.x = from.scaleX + (to.scaleX - from.scaleX) * t;
  if (from.scaleY !== undefined && to.scaleY !== undefined)
    obj.scale.y = from.scaleY + (to.scaleY - from.scaleY) * t;

  if (raw >= 1) {
    tween.onComplete?.();
    return false;
  }
  return true;
}

/** Convenience builder */
export function tween(
  obj: Container,
  from: Tween["from"],
  to: Tween["to"],
  duration: number,
  options: { ease?: EaseFn; delay?: number; onComplete?: () => void } = {},
): Tween {
  // Set initial values immediately
  if (from.x !== undefined) obj.x = from.x;
  if (from.y !== undefined) obj.y = from.y;
  if (from.rotation !== undefined) obj.rotation = from.rotation;
  if (from.alpha !== undefined) obj.alpha = from.alpha;
  if (from.scaleX !== undefined) obj.scale.x = from.scaleX;
  if (from.scaleY !== undefined) obj.scale.y = from.scaleY;
  return {
    obj,
    from,
    to,
    duration,
    elapsed: 0,
    easeFn: options.ease ?? ease.outCubic,
    onComplete: options.onComplete,
    delay: options.delay ?? 0,
  };
}
