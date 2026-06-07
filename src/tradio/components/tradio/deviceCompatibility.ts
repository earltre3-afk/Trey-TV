export const TRADIO_DEVICE_BODY_CLASSES = [
  "device-foldable-folded",
  "device-foldable-unfolded",
  "device-tablet",
  "device-tv-cinema",
] as const;

export type TradioDeviceBodyClass = (typeof TRADIO_DEVICE_BODY_CLASSES)[number] | "";

export function resolveTradioDeviceBodyClass(width: number, height: number): TradioDeviceBodyClass {
  if (width >= 1800) return "device-tv-cinema";
  if (width >= 500 && width < 1024 && height > 0) return "device-tablet";
  return "";
}
