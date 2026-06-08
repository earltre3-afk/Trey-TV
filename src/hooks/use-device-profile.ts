import { useEffect, useState } from 'react';

/**
 * Device performance profile for adaptive rendering
 * 
 * full-premium: Desktop/high-power devices
 *   - All blur effects (backdrop-filter, blur filters)
 *   - All animations and effects
 *   - Particle systems
 *   - Full glow/shadow effects
 * 
 * premium-lite: Mobile/low-power devices
 *   - Fake glass (rgba + borders + gradients + shadows)
 *   - Reduced animations and effects
 *   - Fewer particles
 *   - Simplified glow/shadow
 *   - Same visual language, cheaper rendering
 */
export type DeviceProfile = 'full-premium' | 'premium-lite';

interface DeviceCapabilities {
  profile: DeviceProfile;
  isMobile: boolean;
  isTablet: boolean;
  hasHighRefreshRate: boolean;
  hasHighMemory: boolean;
  prefersReducedMotion: boolean;
  effectiveConnectionType?: string;
}

export function useDeviceProfile(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    profile: 'premium-lite',
    isMobile: false,
    isTablet: false,
    hasHighRefreshRate: false,
    hasHighMemory: true,
    prefersReducedMotion: false,
  });

  useEffect(() => {
    const updateCapabilities = () => {
      // Detect motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Detect device memory (Chrome only, defaults to high)
      const hasHighMemory = 
        typeof (navigator as any).deviceMemory === 'undefined' || 
        (navigator as any).deviceMemory >= 4;

      // Detect connection type
      const connection = (navigator as any).connection;
      const effectiveConnectionType = connection?.effectiveType;

      // Viewport-based detection
      const width = window.innerWidth;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;

      // High refresh rate detection (90fps+)
      let hasHighRefreshRate = false;
      if ('screen' in window) {
        hasHighRefreshRate = (window.screen as any).refreshRate >= 90;
      }

      // Determine performance profile
      let profile: DeviceProfile = 'premium-lite';
      if (
        !isMobile &&
        !isTablet &&
        hasHighMemory &&
        (effectiveConnectionType === '4g' || !effectiveConnectionType) &&
        !prefersReducedMotion &&
        hasHighRefreshRate
      ) {
        profile = 'full-premium';
      }

      setCapabilities({
        profile,
        isMobile,
        isTablet,
        hasHighRefreshRate,
        hasHighMemory,
        prefersReducedMotion,
        effectiveConnectionType,
      });
    };

    // Initial calculation
    updateCapabilities();

    // Re-check on window resize
    const handleResize = () => {
      updateCapabilities();
    };

    window.addEventListener('resize', handleResize);

    // Listen for reduced motion preference changes
    const mediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      updateCapabilities();
    };

    mediaQueryList.addEventListener('change', handleMotionChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      mediaQueryList.removeEventListener('change', handleMotionChange);
    };
  }, []);

  return capabilities;
}

/**
 * Simple check without hook - for use in static context
 */
export function getDeviceProfileSync(): DeviceProfile {
  if (typeof window === 'undefined') return 'premium-lite';

  const width = window.innerWidth;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasHighMemory = 
    typeof (navigator as any).deviceMemory === 'undefined' || 
    (navigator as any).deviceMemory >= 4;
  const connection = (navigator as any).connection;
  const effectiveConnectionType = connection?.effectiveType;

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  if (
    !isMobile &&
    !isTablet &&
    hasHighMemory &&
    (effectiveConnectionType === '4g' || !effectiveConnectionType) &&
    !prefersReducedMotion
  ) {
    return 'full-premium';
  }

  return 'premium-lite';
}
