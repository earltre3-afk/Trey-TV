/**
 * Responsive Image Optimization Component
 * Handles lazy loading, responsive sizing, and format selection
 * 
 * Replace `<img>` tags with `<ResponsiveImage>` for automatic optimization
 */

import { CSSProperties } from 'react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean; // Only true for hero image
  sizes?: string;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
  quality?: number; // 75 for mobile, 85+ for desktop
}

/**
 * Responsive image component with automatic optimization
 * 
 * Usage (hero - priority):
 *   <ResponsiveImage
 *     src="/hero.jpg"
 *     alt="Hero"
 *     width={1920}
 *     height={1080}
 *     priority
 *     sizes="(max-width: 768px) 100vw, (max-width: 1440px) 80vw, 1440px"
 *   />
 * 
 * Usage (below the fold - lazy):
 *   <ResponsiveImage
 *     src="/card.jpg"
 *     alt="Card"
 *     width={400}
 *     height={300}
 *     sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
 *   />
 * 
 * Note: For multi-format support (AVIF/WebP), use PictureImage instead.
 * Ensure .avif and .webp variants exist in your CDN (e.g., Cloudinary).
 */
export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  priority = false,
  sizes,
  className = '',
  objectFit = 'cover',
  quality,
}: ResponsiveImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      style={
        {
          objectFit,
        } as CSSProperties
      }
    />
  );
}

/**
 * Recommended sizes props for common layouts
 */
export const imageSizes = {
  // Hero image - full width
  hero: '(max-width: 768px) 100vw, (max-width: 1440px) 100vw, 1440px',
  
  // Full width sections
  fullWidth: '(max-width: 768px) 100vw, (max-width: 1440px) 90vw, 1440px',
  
  // Card in grid - 2 columns on mobile, 3 on tablet, 4 on desktop
  card: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
  
  // Small card - 2 columns on mobile, 3-4 on tablet, 4-6 on desktop
  smallCard: '(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw',
  
  // Thumbnail - very small
  thumbnail: '(max-width: 768px) 80px, 120px',
  
  // Avatar
  avatar: '(max-width: 768px) 40px, 64px',
};

/**
 * Image format optimization helper
 * Returns optimal format based on browser support
 */
export function getOptimalImageFormat(
  originalSrc: string,
  supportWebp: boolean = true,
  supportAvif: boolean = true
): string {
  // Example: convert /images/photo.jpg to /images/photo.webp or /images/photo.avif
  if (originalSrc.includes('?')) return originalSrc;
  
  const ext = originalSrc.split('.').pop()?.toLowerCase() || 'jpg';
  
  // For now, just return original
  // In production, you'd use a CDN like Cloudinary or ImageKit
  // that supports automatic format conversion
  return originalSrc;
}

/**
 * Picture element for multi-format support
 * Automatically serves optimal format based on browser
 * 
 * IMPORTANT: Requires variant files to exist:
 * - /path/image.avif (modern format)
 * - /path/image.webp (fallback)
 * - /path/image.jpg|png (final fallback)
 * 
 * Use with a CDN that supports automatic conversion (Cloudinary, ImageKit, etc.)
 * or pre-generate variants during build time.
 */
export function PictureImage({
  src,
  alt,
  width,
  height,
  priority = false,
  sizes,
  className = '',
  objectFit = 'cover',
}: Omit<ResponsiveImageProps, 'quality'>) {
  const baseExt = src.split('.').pop() || 'jpg';
  const basePath = src.replace(`.${baseExt}`, '');

  return (
    <picture>
      {/* Modern format: AVIF */}
      <source
        srcSet={`${basePath}.avif`}
        type="image/avif"
        sizes={sizes}
      />
      
      {/* Fallback: WebP */}
      <source
        srcSet={`${basePath}.webp`}
        type="image/webp"
        sizes={sizes}
      />
      
      {/* Final fallback: original format */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        className={className}
        style={{ objectFit } as CSSProperties}
      />
    </picture>
  );
}
