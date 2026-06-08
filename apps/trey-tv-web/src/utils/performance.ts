/**
 * Performance utilities for adaptive mobile rendering.
 * Detects device capabilities and determines optimal rendering strategy.
 */

// Device capability detection
export interface DeviceProfile {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasHighDpi: boolean;
  supportsBackdropFilter: boolean;
  cpuCores: number;
  deviceMemory?: number;
  effectiveType?: "4g" | "3g" | "2g" | "slow-4g";
  renderingMode: "full-premium" | "premium-lite";
}

let cachedDeviceProfile: DeviceProfile | null = null;

export function getDeviceProfile(): DeviceProfile {
  if (cachedDeviceProfile) return cachedDeviceProfile;

  const isClient = typeof window !== "undefined";
  if (!isClient) {
    // SSR safe default
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      hasHighDpi: false,
      supportsBackdropFilter: true,
      cpuCores: 4,
      renderingMode: "full-premium",
    };
  }

  const ua = navigator.userAgent.toLowerCase();
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Basic device classification
  const isMobile =
    /android|webos|iphone|ipod|blackberry|iemobile|opera mini/.test(ua) || width < 768;
  const isTablet = /ipad|android(?!.*mobile)|tablet/.test(ua) && !isMobile && width < 1024;
  const isDesktop = !isMobile && !isTablet;

  // High DPI detection (Retina displays, high-end phones)
  const hasHighDpi = (isClient && window.devicePixelRatio > 1.5) || false;

  // CPU cores estimate (most modern phones have 4-8, desktops 4-16+)
  const cpuCores = navigator.hardwareConcurrency || 4;

  // Device memory (in GB) - available on some browsers
  const deviceMemory = (navigator as any).deviceMemory || undefined;

  // Network info - available on some browsers
  const connection = (navigator as any).connection || (navigator as any).mozConnection;
  const effectiveType = connection?.effectiveType as any;

  // Backdrop filter support check
  const supportsBackdropFilter = (() => {
    if (!isClient) return true;
    const el = document.createElement("div");
    const style = el.style;
    const props = ["backdropFilter", "webkitBackdropFilter"];
    for (const prop of props) {
      if (prop in style) return true;
    }
    return false;
  })();

  // Determine rendering mode
  // Premium-lite on: mobile phones, slow networks, low memory, or when user prefers reduced motion
  const prefersReducedMotion =
    isClient && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSlowNetwork = effectiveType && ["3g", "2g", "slow-4g"].includes(effectiveType);
  const isLowEndDevice = deviceMemory ? deviceMemory <= 2 : false;

  const renderingMode =
    isMobile || isSlowNetwork || isLowEndDevice || prefersReducedMotion ? "premium-lite" : "full-premium";

  cachedDeviceProfile = {
    isMobile,
    isTablet,
    isDesktop,
    hasHighDpi,
    supportsBackdropFilter,
    cpuCores,
    deviceMemory,
    effectiveType,
    renderingMode,
  };

  return cachedDeviceProfile;
}

/**
 * Reset device profile cache (useful for testing)
 */
export function resetDeviceProfile(): void {
  cachedDeviceProfile = null;
}

/**
 * Hook to detect when device switches between premium and lite modes
 * (e.g., when network changes or window resizes)
 */
export function useResponsiveRenderingMode(): "full-premium" | "premium-lite" {
  if (typeof window === "undefined") return "full-premium";

  const profile = getDeviceProfile();
  return profile.renderingMode;
}

/**
 * CSS class names for adaptive rendering.
 * Use these to conditionally apply full-premium or premium-lite styles.
 */
export const performanceClasses = {
  // Full-premium only (desktop/high-power)
  fullPremiumOnly: "premium-full",

  // Premium-lite only (mobile/low-power)
  premiumLiteOnly: "premium-lite",

  // Both modes present (base styles)
  adaptive: "adaptive",
};

/**
 * Check if device supports a specific capability
 */
export function supportsCapability(capability: "backdrop-filter" | "gpu-animations"): boolean {
  const profile = getDeviceProfile();
  if (capability === "backdrop-filter") {
    return profile.supportsBackdropFilter && profile.renderingMode === "full-premium";
  }
  if (capability === "gpu-animations") {
    return profile.renderingMode === "full-premium";
  }
  return false;
}

/**
 * Get recommendation for image format and loading strategy
 */
export function getImageLoadingStrategy(): {
  priority: boolean;
  lazy: boolean;
  format: "avif" | "webp" | "jpg";
  quality: number;
  sizes?: string;
} {
  const profile = getDeviceProfile();

  // Mobile/lite mode: lazy load almost everything, lower quality, prefer webp
  if (profile.renderingMode === "premium-lite") {
    return {
      priority: false, // Only hero is priority
      lazy: true,
      format: "webp",
      quality: 70,
    };
  }

  // Desktop: still use webp/avif, but can load more eagerly
  return {
    priority: false,
    lazy: true,
    format: "webp",
    quality: 85,
  };
}

/**
 * Performance observer to track key metrics
 */
export function initPerformanceObservers(callback?: (metrics: PerformanceMetrics) => void): void {
  if (typeof window === "undefined" || !("PerformanceObserver" in window)) return;

  const metrics: PerformanceMetrics = {
    lcp: undefined, // Largest Contentful Paint
    fid: undefined, // First Input Delay
    cls: undefined, // Cumulative Layout Shift
    ttfb: undefined, // Time to First Byte
  };

  try {
    // LCP
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
      callback?.(metrics);
    });
    lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
  } catch (e) {
    // LCP not supported
  }

  try {
    // FID
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        metrics.fid = entry.processingDuration;
        callback?.(metrics);
      }
    });
    fidObserver.observe({ entryTypes: ["first-input"] });
  } catch (e) {
    // FID not supported
  }

  try {
    // CLS
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          metrics.cls = (metrics.cls || 0) + (entry as any).value;
          callback?.(metrics);
        }
      }
    });
    clsObserver.observe({ entryTypes: ["layout-shift"] });
  } catch (e) {
    // CLS not supported
  }

  // TTFB from navigation timing
  if ("performance" in window) {
    const navTiming = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    if (navTiming) {
      metrics.ttfb = navTiming.responseStart - navTiming.fetchStart;
    }
  }
}

export interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint (ms)
  fid?: number; // First Input Delay (ms)
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte (ms)
}

/**
 * Log performance metrics to console (dev mode only)
 */
export function logPerformanceMetrics(): void {
  if (typeof window === "undefined" || import.meta.env.PROD) return;

  window.addEventListener("load", () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      if (perfData) {
        console.group("[Trey TV Performance]");
        console.log(`📊 Device Profile: ${getDeviceProfile().renderingMode}`);
        console.log(`⏱️ DNS Lookup: ${(perfData.domainLookupEnd - perfData.domainLookupStart).toFixed(0)}ms`);
        console.log(`📡 TCP Connect: ${(perfData.connectEnd - perfData.connectStart).toFixed(0)}ms`);
        console.log(`📥 TTFB: ${(perfData.responseStart - perfData.fetchStart).toFixed(0)}ms`);
        console.log(`📄 DOM Interactive: ${(perfData.domInteractive - perfData.fetchStart).toFixed(0)}ms`);
        console.log(`✅ DOM Complete: ${(perfData.domComplete - perfData.fetchStart).toFixed(0)}ms`);
        console.log(`🎨 Load Complete: ${(perfData.loadEventEnd - perfData.fetchStart).toFixed(0)}ms`);
        console.groupEnd();
      }
    }, 100);
  });
}
