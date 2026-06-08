/**
 * Intersection Observer utilities for:
 * - Lazy loading images and components
 * - Pausing animations when offscreen
 * - Tracking visibility
 */

/**
 * Create a reusable intersection observer with standard options
 */
export function createObserver(
  callback: (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void,
  options?: IntersectionObserverInit
): IntersectionObserver | null {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    return null;
  }

  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: "50px", // Start loading 50px before visible
    threshold: 0.01, // Trigger when 1% is visible
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
}

/**
 * Hook for lazy loading: observe element and trigger callback when visible
 */
export function useLazyLoad(
  ref: React.RefObject<HTMLElement | null>,
  onVisible: () => void,
  options?: IntersectionObserverInit
): void {
  if (typeof window === "undefined") return;

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = createObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onVisible();
            observer?.unobserve(element);
          }
        });
      },
      options
    );

    if (observer) {
      observer.observe(element);
      return () => observer.disconnect();
    }
  }, [ref, onVisible, options]);
}

/**
 * Hook for pausing animations when element is offscreen
 * Useful for scroll animations, looping particles, etc.
 */
export function usePauseAnimationOffscreen(
  ref: React.RefObject<HTMLElement | null>,
  selector?: string // CSS selector for elements to pause within ref
): void {
  if (typeof window === "undefined") return;

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = createObserver(
      (entries) => {
        entries.forEach((entry) => {
          const elements = selector
            ? element.querySelectorAll(selector)
            : [element];

          elements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            if (entry.isIntersecting) {
              // Resume animations
              htmlEl.style.animationPlayState = "running";
              htmlEl.style.animation = htmlEl.dataset.animation || "";
            } else {
              // Pause animations
              htmlEl.style.animationPlayState = "paused";
            }
          });
        });
      },
      { threshold: 0 }
    );

    if (observer) {
      observer.observe(element);
      return () => observer.disconnect();
    }
  }, [ref, selector]);
}

/**
 * Helper to detect if element is currently visible
 */
export function isElementVisible(element: HTMLElement): boolean {
  if (typeof window === "undefined") return true;

  const rect = element.getBoundingClientRect();
  return (
    rect.top < window.innerHeight &&
    rect.bottom > 0 &&
    rect.left < window.innerWidth &&
    rect.right > 0
  );
}

/**
 * Defer expensive operations until after first paint
 */
export function deferUntilVisible(
  element: HTMLElement,
  callback: () => void
): IntersectionObserver | null {
  return createObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback();
          observer?.unobserve(element);
        }
      });
    },
    { threshold: 0.01 }
  );
}

/**
 * Batch observe multiple elements
 */
export function observeElements(
  elements: HTMLElement[],
  callback: (element: HTMLElement, visible: boolean) => void,
  options?: IntersectionObserverInit
): IntersectionObserver | null {
  if (typeof window === "undefined" || elements.length === 0) return null;

  const observer = createObserver(
    (entries) => {
      entries.forEach((entry) => {
        callback(entry.target as HTMLElement, entry.isIntersecting);
      });
    },
    options
  );

  if (observer) {
    elements.forEach((el) => observer.observe(el));
  }

  return observer;
}

/**
 * React import needed for useEffect
 */
import React from "react";

export default {
  createObserver,
  useLazyLoad,
  usePauseAnimationOffscreen,
  isElementVisible,
  deferUntilVisible,
  observeElements,
};
