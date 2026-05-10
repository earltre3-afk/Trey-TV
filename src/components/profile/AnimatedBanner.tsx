import { useMemo } from "react";

/**
 * AnimatedBanner — renders a profile banner that may be:
 *  - a static image (jpg/png/webp/avif)
 *  - an animated GIF (loops natively via <img>)
 *  - a short looping video (mp4/webm) — autoplay, muted, loop, playsInline
 *
 * Falls back to a provided fallback URL when src is empty.
 */
export function AnimatedBanner({
  src,
  fallback,
  className,
  alt = "",
}: {
  src?: string | null;
  fallback: string;
  className?: string;
  alt?: string;
}) {
  const url = src && src.length > 0 ? src : fallback;

  const isVideo = useMemo(() => {
    const u = url.toLowerCase().split("?")[0];
    return /\.(mp4|webm|mov)$/.test(u) || u.startsWith("blob:") && /video/.test(src ?? "");
  }, [url, src]);

  if (isVideo) {
    return (
      <video
        src={url}
        className={className}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={alt}
      />
    );
  }

  return <img src={url} alt={alt} className={className} loading="lazy" decoding="async" />;
}
