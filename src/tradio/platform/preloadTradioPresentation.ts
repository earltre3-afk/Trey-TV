import type { DeviceMode } from "./DeviceModeProvider";

function requestedMode(search: unknown): DeviceMode | undefined {
  if (typeof search === "string") {
    const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
    const value = params.get("device") ?? params.get("mode");
    if (value === "tv" || value === "mobile" || value === "web") return value;
  }

  if (search && typeof search === "object") {
    const record = search as Record<string, unknown>;
    const value = record.device ?? record.mode;
    if (value === "tv" || value === "mobile" || value === "web") return value;
  }

  return undefined;
}

function browserMode(): DeviceMode {
  if (typeof window === "undefined") return "web";

  const shellMode = (window as Window & { __TREY_TV_DEVICE_MODE__?: DeviceMode })
    .__TREY_TV_DEVICE_MODE__;
  if (shellMode === "tv" || shellMode === "mobile" || shellMode === "web") return shellMode;

  if (
    /Android TV|GoogleTV|SMART-TV|SmartTV|HbbTV|AFT[A-Z0-9]*|TV;/i.test(
      window.navigator.userAgent,
    )
  ) {
    return "tv";
  }

  return window.innerWidth < 768 ? "mobile" : "web";
}

export function resolveTradioDeviceMode(search?: unknown): DeviceMode {
  return requestedMode(search) ?? browserMode();
}

export async function preloadTradioPresentation(search?: unknown): Promise<void> {
  const mode = resolveTradioDeviceMode(search);
  if (mode === "tv") {
    await import("@/tradio/tv/TVTradioApp");
    return;
  }
  await import("@/tradio/mobile/MobileTradioApp");
}
