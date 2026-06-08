import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to pause animations when element is out of viewport
 * Uses IntersectionObserver to reduce battery drain
 * 
 * Usage:
 *   const ref = useVisibleViewport();
 *   <div ref={ref} className={isVisible ? 'animate-spin' : ''}>
 */
export function useVisibleViewport(
  onVisibilityChange?: (isVisible: boolean) => void
) {
  const ref = useRef<HTMLElement>(null);
  const isVisibleRef = useRef(true);

  const setDataAttribute = useCallback((isVisible: boolean) => {
    if (ref.current) {
      ref.current.setAttribute('data-visible', isVisible ? 'true' : 'false');
      onVisibilityChange?.(isVisible);
    }
  }, [onVisibilityChange]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Use IntersectionObserver to detect visibility
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        if (isVisibleRef.current !== isVisible) {
          isVisibleRef.current = isVisible;
          setDataAttribute(isVisible);
        }
      },
      {
        // Trigger slightly before/after viewport edges to prevent flashing
        rootMargin: '50px',
        threshold: 0,
      }
    );

    observer.observe(element);

    // Initial state
    setDataAttribute(true);

    return () => {
      observer.disconnect();
    };
  }, [setDataAttribute]);

  return ref;
}

/**
 * Hook to batch control animation state for multiple elements
 * Useful for hero sections with many animated elements
 */
export function useVisibilityBatch(
  containerRef: React.RefObject<HTMLElement>,
  options?: IntersectionObserverInit
) {
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        if (isVisibleRef.current !== isVisible) {
          isVisibleRef.current = isVisible;
          
          // Set data attribute on container
          container.setAttribute('data-visible', isVisible ? 'true' : 'false');
          
          // All animated children inherit visibility state via CSS
          // See styles: [data-visible="false"] [data-animate] { animation-play-state: paused; }
        }
      },
      {
        rootMargin: '100px',
        threshold: 0,
        ...options,
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
    // Note: options is intentionally excluded from dependencies to prevent
    // infinite re-renders if options is created fresh on each render.
    // The options are used only to configure the observer on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef]);
}

/**
 * CSS classes to use with visibility system:
 * 
 * Add to any animated element:
 *   className="animate-spin data-animate"
 * 
 * Then in CSS:
 *   [data-visible="false"] [data-animate] {
 *     animation-play-state: paused;
 *   }
 */
