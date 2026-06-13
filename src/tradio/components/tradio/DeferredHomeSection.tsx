import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { shouldMountDeferredSection } from "./deferredMountStrategy";

interface DeferredHomeSectionProps {
  className?: string;
  label: string;
  minHeight: number;
  render: () => ReactNode;
  rootMargin?: string;
}

export function DeferredHomeSection({
  className,
  label,
  minHeight,
  render,
  rootMargin = "800px 0px",
}: DeferredHomeSectionProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const placeholderRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (shouldRender) return;

    const placeholder = placeholderRef.current;
    if (!placeholder) return;

    if (typeof IntersectionObserver === "undefined") {
      const timer = window.setTimeout(() => setShouldRender(true), 750);
      return () => window.clearTimeout(timer);
    }

    const mountIfReached = () => {
      if (
        shouldMountDeferredSection(placeholder.getBoundingClientRect(), window.innerHeight)
      ) {
        setShouldRender(true);
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShouldRender(true);
        observer.disconnect();
      },
      { rootMargin },
    );

    observer.observe(placeholder);
    document.addEventListener("scroll", mountIfReached, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", mountIfReached, { passive: true });
    mountIfReached();

    return () => {
      observer.disconnect();
      document.removeEventListener("scroll", mountIfReached, true);
      window.removeEventListener("resize", mountIfReached);
    };
  }, [rootMargin, shouldRender]);

  return (
    <div
      ref={placeholderRef}
      className={className}
      aria-label={shouldRender ? undefined : `${label} loading`}
      style={shouldRender ? undefined : { minHeight }}
    >
      {shouldRender ? render() : null}
    </div>
  );
}
