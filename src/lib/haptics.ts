// Lightweight haptic feedback helper. Safe no-op on unsupported devices.
export type HapticPattern = "light" | "medium" | "heavy" | "selection" | "success";

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 8,
  medium: 14,
  heavy: 22,
  selection: [4, 18, 4],
  success: [10, 30, 10],
};

export function haptic(pattern: HapticPattern = "light") {
  if (typeof window === "undefined") return;
  try {
    const nav = window.navigator as Navigator & { vibrate?: (p: number | number[]) => boolean };
    nav.vibrate?.(PATTERNS[pattern]);
  } catch {
    // ignore
  }
}
