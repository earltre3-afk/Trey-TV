/**
 * Component-level Code Splitting Guide
 * 
 * Implements lazy loading for heavy feature modules to reduce initial bundle size
 * especially important on mobile (premium-lite profile)
 */

import { lazy, Suspense, ReactNode } from 'react';

/**
 * PATTERN 1: Route-level code splitting (automatic with TanStack Router)
 * 
 * Heavy routes should be in separate files and loaded on-demand:
 * - /tradio - large feature module
 * - /games - interactive content
 * - /trance - choreography engine
 * - /creator-studio - complex dashboard
 * 
 * These are already route-based, so code is split automatically
 */

/**
 * PATTERN 2: Component-level lazy loading
 * 
 * Heavy components that aren't always visible:
 */

// Heavy components to lazy-load
export const LazyTreyI = lazy(() => import('@/components/ai/TreyIWidget'));
export const LazyPlayerControls = lazy(() => import('@/components/player/PlayerControls'));
export const LazyRewardsPanel = lazy(() => import('@/components/rewards/RewardsPanel'));
export const LazyGuideContent = lazy(() => import('@/components/guide/GuideContent'));
export const LazyNotifications = lazy(() => import('@/components/notifications/NotificationsPanel'));
export const LazyMessages = lazy(() => import('@/components/messages/MessagesPanel'));
export const LazyCreatorHub = lazy(() => import('@/components/creator/CreatorHubContent'));

/**
 * PATTERN 3: Fallback UI for lazy components
 */

function LoadingFallback({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

/**
 * PATTERN 4: Lazy component wrapper with Suspense
 * 
 * Usage:
 *   <LazySuspense fallback={<LoadingFallback />}>
 *     <LazyTreyI />
 *   </LazySuspense>
 */

export function LazySuspense({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <Suspense fallback={fallback || <LoadingFallback />}>
      {children}
    </Suspense>
  );
}

/**
 * PATTERN 5: Feature flags + lazy loading
 * 
 * Load features only when enabled/needed
 */

export function useFeatureLazyLoad(featureName: string, enabled: boolean) {
  if (!enabled) return null;
  
  // Feature is enabled, return lazy-loaded component
  const features: Record<string, any> = {
    tradio: lazy(() => import('@/tradio')),
    trance: lazy(() => import('@/trance')),
    games: lazy(() => import('@/features/games')),
    rewards: lazy(() => import('@/features/rewards')),
  };
  
  return features[featureName];
}

/**
 * IMPLEMENTATION CHECKLIST
 * 
 * ✓ TreyIWidget - lazy-loaded on mobile with LazyTreyIWidget
 * 
 * TODO - Apply to these modules:
 * - [ ] PlayerControls - only needed when watching
 * - [ ] RewardsPanel - only needed when user opens rewards
 * - [ ] GuideContent - only needed when user opens guide
 * - [ ] NotificationsPanel - only needed when user clicks notifications
 * - [ ] MessagesPanel - only needed when user opens messages
 * - [ ] CreatorHub - only needed for creators (separate section)
 * 
 * CURRENT STATE:
 * - Routes are already split via TanStack Router
 * - TreyIWidget is lazy-loaded
 * - Heavy animations paused via IntersectionObserver
 * - Need to apply pattern to feature panels
 * 
 * NEXT STEPS:
 * 1. Wrap BottomNav feature buttons with LazySuspense
 * 2. Only load feature content on user interaction
 * 3. Test bundle size reduction with npm run build
 * 4. Verify on mobile Lighthouse audit
 */
