import type { DeviceProfile } from '@/hooks/use-device-profile';

/**
 * Performance configurations for each device profile
 * Controls which features/effects are enabled
 */
export interface PerformanceConfig {
  // Glass effects
  useBackdropFilter: boolean;      // true: backdrop-filter blur, false: fake glass
  glassBlurAmount: string;           // '12px', '8px', etc.
  
  // Animations
  animationsEnabled: boolean;
  enableParticles: boolean;
  enableGlowEffects: boolean;
  animationDuration: number;         // ms - reduce on mobile
  maxSimultaneousAnimations: number;
  
  // Images
  lazyLoadImages: boolean;
  imageQualityReduction: number;     // 0-1, where 1 is full quality
  
  // Components
  lazyLoadTreyI: boolean;
  lazyLoadTradio: boolean;
  lazyLoadRewards: boolean;
  lazyLoadGuide: boolean;
  initializeRealtimeSubscriptions: boolean;
  
  // Auto-play
  autoplayVideoOnMobile: boolean;
  autoplayAudioOnMobile: boolean;
  
  // Misc
  prefersReducedMotion: boolean;
}

const fullPremiumConfig: PerformanceConfig = {
  useBackdropFilter: true,
  glassBlurAmount: '12px',
  
  animationsEnabled: true,
  enableParticles: true,
  enableGlowEffects: true,
  animationDuration: 300,
  maxSimultaneousAnimations: 20,
  
  lazyLoadImages: false, // Load all visible images eagerly
  imageQualityReduction: 1, // Full quality
  
  lazyLoadTreyI: false, // Load upfront
  lazyLoadTradio: false,
  lazyLoadRewards: false,
  lazyLoadGuide: false,
  initializeRealtimeSubscriptions: true,
  
  autoplayVideoOnMobile: false, // Desktop only
  autoplayAudioOnMobile: false,
  
  prefersReducedMotion: false,
};

const premiumLiteConfig: PerformanceConfig = {
  useBackdropFilter: false, // Use fake glass instead
  glassBlurAmount: '0px', // No blur, use rgba + gradients + shadows
  
  animationsEnabled: true, // But limited
  enableParticles: false, // Disable particles
  enableGlowEffects: false, // Simplified glow
  animationDuration: 400, // Slightly longer to feel smooth despite fewer effects
  maxSimultaneousAnimations: 4, // Limit concurrent animations
  
  lazyLoadImages: true,
  imageQualityReduction: 0.8, // Slightly reduced but still good quality
  
  lazyLoadTreyI: true, // Lazy-load on tap
  lazyLoadTradio: true,
  lazyLoadRewards: true,
  lazyLoadGuide: true,
  initializeRealtimeSubscriptions: false, // Load on demand
  
  autoplayVideoOnMobile: false,
  autoplayAudioOnMobile: false,
  
  prefersReducedMotion: false, // Set based on user preference
};

export function getPerformanceConfig(profile: DeviceProfile, prefersReducedMotion: boolean = false): PerformanceConfig {
  const baseConfig = profile === 'full-premium' ? fullPremiumConfig : premiumLiteConfig;
  
  // Override with reduced motion if needed
  if (prefersReducedMotion) {
    return {
      ...baseConfig,
      animationsEnabled: false,
      enableParticles: false,
      enableGlowEffects: false,
      prefersReducedMotion: true,
    };
  }
  
  return baseConfig;
}

/**
 * Mobile-specific animation settings
 * Use these values in Tailwind animations for premium-lite mode
 */
export const mobileAnimationConfig = {
  // Reduce animation duration on mobile
  duration: '400ms',
  // Use only transform and opacity
  properties: ['transform', 'opacity'],
  // Avoid these - too expensive on mobile
  avoidProperties: ['blur', 'box-shadow', 'filter', 'width', 'height', 'backdrop-filter'],
};

/**
 * Fake glass configuration for mobile
 * Replaces backdrop-filter with lighter rendering
 */
export const fakeGlassConfig = {
  // Lighter rgba background
  bgColor: 'rgba(255, 255, 255, 0.08)', // Instead of full blur
  // Border with gradient
  borderColor: 'rgba(255, 255, 255, 0.15)',
  borderWidth: '1px',
  // Subtle gradient overlay
  gradientOverlay: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%)',
  // Light shadow instead of blur
  shadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
};
