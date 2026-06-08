import { ReactNode } from 'react';
import { useVisibilityBatch } from '@/hooks/use-visible-viewport';
import { useRef } from 'react';

/**
 * Wrapper component that pauses all animated children when off-screen
 * Use this around sections with many animations to reduce battery drain
 */
export function AnimationViewport({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Set up visibility tracking via IntersectionObserver
  useVisibilityBatch(ref as any);

  return (
    <div ref={ref} className={className} data-animation-viewport>
      {children}
    </div>
  );
}

/**
 * Simple helper to add data-animate to animated elements
 * Use className="animate-spin data-animate" on any animated element
 * Combined with [data-visible="false"] [data-animate] in CSS to pause when off-screen
 */
export function useAnimateIfVisible() {
  return {
    // Add to any animated element
    animateClassName: 'data-animate',
    // Or use as a hook to manually control
  };
}
