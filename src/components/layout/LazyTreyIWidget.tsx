import { Suspense, useState, lazy } from 'react';
import { useDeviceProfile } from '@/hooks/use-device-profile';

/**
 * Lazy-loading wrapper for TreyIWidget
 * On mobile (premium-lite), TreyI is only loaded when user taps or opens it
 * On desktop (full-premium), it loads normally
 */

// Import TreyIWidget only when needed (lazy)
const TreyIWidgetLazy = lazy(() =>
  import('@/components/ai/TreyIWidget').then(mod => ({
    default: mod.TreyIWidget
  }))
);

// Fallback placeholder - minimal memory footprint
function TreyIPlaceholder() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="fixed bottom-20 right-4 z-30">
      <button
        onClick={() => setIsExpanded(true)}
        className="size-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center text-white font-bold hover:scale-110 transition-transform"
        aria-label="Open Trey-I assistant"
        title="Trey-I Assistant"
      >
        ✨
      </button>
      {isExpanded && (
        <div className="absolute bottom-0 right-0 mb-16 bg-card rounded-2xl border border-white/10 p-4 shadow-xl max-w-xs">
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute top-2 right-2 p-1 hover:bg-muted rounded"
            aria-label="Close Trey-I assistant"
          >
            ✕
          </button>
          {/* Lazy load on open */}
          <Suspense fallback={<div className="h-20 bg-muted animate-pulse rounded" />}>
            <TreyIWidgetLazy />
          </Suspense>
        </div>
      )}
    </div>
  );
}

export function LazyTreyIWidget() {
  const { profile } = useDeviceProfile();

  // On desktop (full-premium): Load TreyIWidget normally and eager
  if (profile === 'full-premium') {
    return (
      <Suspense fallback={<div className="h-12 w-12 bg-muted animate-pulse rounded-full" />}>
        <TreyIWidgetLazy />
      </Suspense>
    );
  }

  // On mobile (premium-lite): Show placeholder, lazy-load on demand
  return <TreyIPlaceholder />;
}
