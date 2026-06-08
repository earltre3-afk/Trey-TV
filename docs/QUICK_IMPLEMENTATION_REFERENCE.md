# Quick Implementation Reference

## Apply to Existing Components

### 1. Replace `<img>` with `<ResponsiveImage>`

**Before:**
```tsx
<img src="/card.jpg" alt="Card" />
```

**After:**
```tsx
import { ResponsiveImage, imageSizes } from '@/components/ResponsiveImage';

<ResponsiveImage
  src="/card.jpg"
  alt="Card"
  width={400}
  height={300}
  sizes={imageSizes.card}
/>
```

### 2. Add Hero Image Priority

**Before:**
```tsx
<img src="/hero.jpg" alt="Hero" className="w-full h-screen object-cover" />
```

**After:**
```tsx
<ResponsiveImage
  src="/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  priority
  sizes={imageSizes.hero}
  className="w-full h-screen object-cover"
/>
```

### 3. Wrap Sections with AnimationViewport

**Before:**
```tsx
<section>
  <div className="animate-spin">...</div>
</section>
```

**After:**
```tsx
import { AnimationViewport } from '@/components/AnimationViewport';

<AnimationViewport>
  <section>
    <div className="animate-spin data-animate">...</div>
  </section>
</AnimationViewport>
```

### 4. Conditionally Render Based on Profile

**Before:**
```tsx
<div className="glass-blur">...</div>
```

**After:**
```tsx
import { useDeviceProfile } from '@/hooks/use-device-profile';

export function MyComponent() {
  const { profile } = useDeviceProfile();
  
  return (
    <div className={profile === 'full-premium' ? 'glass-strong' : 'glass-fake'}>
      ...
    </div>
  );
}
```

### 5. Lazy-load Heavy Panels

**Before:**
```tsx
import { RewardsPanel } from '@/components/rewards/RewardsPanel';

<RewardsPanel isOpen={isOpen} />
```

**After:**
```tsx
import { LazySuspense } from '@/lib/lazy-loading-patterns';
import { lazy } from 'react';

const LazyRewardsPanel = lazy(() => import('@/components/rewards/RewardsPanel'));

<LazySuspense fallback={<div>Loading rewards...</div>}>
  <LazyRewardsPanel isOpen={isOpen} />
</LazySuspense>
```

### 6. Detect Mobile for Conditional Rendering

**Before:**
```tsx
const isMobile = window.innerWidth < 768; // Runs before render
```

**After:**
```tsx
import { useDeviceProfile } from '@/hooks/use-device-profile';

export function MyComponent() {
  const { isMobile, profile } = useDeviceProfile();
  
  return isMobile ? <MobileLayout /> : <DesktopLayout />;
}
```

### 7. Respect User Motion Preference

**Before:**
```tsx
<div className="animate-spin">Spinning...</div>
```

**After:**
```tsx
const { prefersReducedMotion } = useDeviceProfile();

<div className={prefersReducedMotion ? '' : 'animate-spin'}>
  {prefersReducedMotion ? 'Loading...' : 'Spinning...'}
</div>
```

### 8. Conditional Subscriptions

**Before:**
```tsx
useEffect(() => {
  // Always initialize subscriptions
  supabase.channel('feed').on('*', () => {...}).subscribe();
}, []);
```

**After:**
```tsx
import { shouldInitializeRealtimeSubscriptions } from '@/lib/lazy-realtime-subscriptions';
import { useDeviceProfile } from '@/hooks/use-device-profile';

export function FeedSection() {
  const { profile } = useDeviceProfile();
  const { isGuest } = useAuth();
  
  useEffect(() => {
    if (!shouldInitializeRealtimeSubscriptions(isGuest, profile)) {
      return; // Skip on mobile guest
    }
    
    supabase.channel('feed').on('*', () => {...}).subscribe();
  }, [profile, isGuest]);
}
```

### 9. Disable Autoplay on Mobile

**Before:**
```tsx
<video autoPlay muted>...</video>
```

**After:**
```tsx
const { isMobile } = useDeviceProfile();

<video autoPlay={!isMobile} muted>...</video>
```

### 10. Apply Fake Glass Class

**Before:**
```tsx
<div className="glass">...</div>
```

**After:**
```tsx
// CSS handles this automatically via @media (max-width: 767px)
// But you can also explicitly use:
import { useDeviceProfile } from '@/hooks/use-device-profile';

const { profile } = useDeviceProfile();

<div className={profile === 'premium-lite' ? 'glass-fake' : 'glass'}>...</div>
```

## CSS Classes Reference

### Glass Effects
- `.glass` - Standard glass (responsive: fake on mobile)
- `.glass-strong` - Strong glass (responsive: fake-strong on mobile)
- `.glass-fake` - Force fake glass on all devices
- `.glass-fake-strong` - Force strong fake glass
- `.liquid-glass` - Lightweight glass with no blur

### Animation Control
- `data-animate` - Add to animated elements to pause when off-screen
- `data-animation-viewport` - Add to container for visibility tracking

### CSS Variables
```css
--profile-accent: /* User's chosen brand color */
--safe-area-inset-top: /* Mobile safe area */
--safe-area-inset-bottom: /* Mobile safe area */
```

## Hook Reference

### useDeviceProfile()
```typescript
const {
  profile: 'full-premium' | 'premium-lite',
  isMobile: boolean,
  isTablet: boolean,
  hasHighRefreshRate: boolean,
  hasHighMemory: boolean,
  prefersReducedMotion: boolean,
  effectiveConnectionType?: '4g' | '3g' | '2g' | 'slow-4g',
} = useDeviceProfile();
```

### useVisibleViewport()
```typescript
const ref = useVisibleViewport(
  (isVisible: boolean) => {
    console.log('Visibility changed:', isVisible);
  }
);

<div ref={ref} data-animate>
  {/* Animated content */}
</div>
```

### useVisibilityBatch()
```typescript
const containerRef = useRef<HTMLDivElement>(null);
useVisibilityBatch(containerRef);

<div ref={containerRef} data-animation-viewport>
  {/* All animated children inherit visibility state */}
</div>
```

## Performance Config Reference

```typescript
import { getPerformanceConfig } from '@/lib/performance-config';

const config = getPerformanceConfig('premium-lite', false);

config.useBackdropFilter // false
config.enableParticles // false
config.animationsEnabled // true
config.maxSimultaneousAnimations // 4
config.lazyLoadTreyI // true
config.initializeRealtimeSubscriptions // false
config.autoplayVideoOnMobile // false
```

## Image Sizes Presets

```typescript
import { imageSizes } from '@/components/ResponsiveImage';

// Available presets
imageSizes.hero // Hero/full-width
imageSizes.fullWidth // Full width sections
imageSizes.card // Grid cards
imageSizes.smallCard // Small cards
imageSizes.thumbnail // Thumbnails
imageSizes.avatar // Avatars
```

## Testing Checklist

- [ ] Page loads without autoplay on mobile
- [ ] Animations pause when scrolled out of view
- [ ] Fake glass looks premium on mobile
- [ ] No janky scrolling on low-end devices
- [ ] Images lazy-load below fold
- [ ] Hero image loads with priority
- [ ] Font sizes readable on mobile
- [ ] Touch targets are 48px+ minimum
- [ ] No infinite spinner animations
- [ ] Battery drain is minimal during use

## Performance Metrics to Monitor

```typescript
// Collect Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log); // Cumulative Layout Shift
getFID(console.log); // First Input Delay
getFCP(console.log); // First Contentful Paint
getLCP(console.log); // Largest Contentful Paint
getTTFB(console.log); // Time to First Byte

// Mobile Lighthouse score target: 85+
```

## Common Mistakes to Avoid

❌ **Don't:** Use `backdrop-filter` on mobile
✅ **Do:** Use `.glass-fake` for mobile

❌ **Don't:** Autoplay videos on mobile
✅ **Do:** Check `isMobile` before `autoPlay`

❌ **Don't:** Load all images eagerly
✅ **Do:** Use `priority` only for hero

❌ **Don't:** Animate 20 things simultaneously
✅ **Do:** Limit to 4 on mobile

❌ **Don't:** Initialize subscriptions on every page
✅ **Do:** Lazy-load on demand

❌ **Don't:** Ignore `sizes` prop on images
✅ **Do:** Always include accurate `sizes`

❌ **Don't:** Use fixed dimensions on responsive images
✅ **Do:** Use percentage widths with `sizes` prop

❌ **Don't:** Forget `data-animate` on animated elements
✅ **Do:** Add to enable IntersectionObserver pausing
