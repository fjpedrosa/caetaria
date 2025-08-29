// Image optimization utilities for Next.js

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  className?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

// Generate responsive image sizes for different breakpoints
export function generateResponsiveSizes(
  sizes: { breakpoint: number; size: string }[]
): string {
  return sizes
    .map(({ breakpoint, size }) => `(max-width: ${breakpoint}px) ${size}`)
    .join(', ');
}

// Common responsive image configurations
export const RESPONSIVE_SIZES = {
  // Hero images - full width on mobile, half on tablet, third on desktop
  hero: generateResponsiveSizes([
    { breakpoint: 768, size: '100vw' },
    { breakpoint: 1200, size: '50vw' },
    { breakpoint: 9999, size: '33vw' },
  ]),
  
  // Card images - consistent across breakpoints
  card: generateResponsiveSizes([
    { breakpoint: 640, size: '100vw' },
    { breakpoint: 1024, size: '50vw' },
    { breakpoint: 9999, size: '33vw' },
  ]),
  
  // Avatar images - small and consistent
  avatar: generateResponsiveSizes([
    { breakpoint: 9999, size: '80px' },
  ]),
  
  // Full-width content images
  content: generateResponsiveSizes([
    { breakpoint: 640, size: '100vw' },
    { breakpoint: 1024, size: '80vw' },
    { breakpoint: 9999, size: '60vw' },
  ]),
};

// Generate blur placeholder for images
export function generateBlurDataURL(
  width: number = 8,
  height: number = 8,
  color: string = '#f3f4f6'
): string {
  const canvas = typeof window !== 'undefined' && document.createElement('canvas');
  if (!canvas) {
    // Server-side fallback
    return `data:image/svg+xml;base64,${Buffer.from(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${color}"/>
      </svg>`
    ).toString('base64')}`;
  }
  
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
  }
  
  return canvas.toDataURL();
}

// Image quality settings based on use case
export const IMAGE_QUALITY = {
  hero: 85, // High quality for hero images
  content: 80, // Good quality for content images  
  thumbnail: 75, // Standard quality for thumbnails
  avatar: 70, // Lower quality for small avatars
  background: 60, // Lower quality for background images
} as const;

// Common image dimensions
export const IMAGE_DIMENSIONS = {
  hero: { width: 1920, height: 1080 },
  card: { width: 600, height: 400 },
  avatar: { width: 120, height: 120 },
  thumbnail: { width: 300, height: 200 },
  og: { width: 1200, height: 630 },
} as const;

// Utility to create optimized image props
export function createOptimizedImageProps(
  src: string,
  alt: string,
  type: keyof typeof IMAGE_DIMENSIONS = 'hero',
  options: Partial<OptimizedImageProps> = {}
): OptimizedImageProps {
  const dimensions = IMAGE_DIMENSIONS[type] || IMAGE_DIMENSIONS.hero;
  const quality = IMAGE_QUALITY[type as keyof typeof IMAGE_QUALITY] || IMAGE_QUALITY.hero;
  
  return {
    src,
    alt,
    width: dimensions.width,
    height: dimensions.height,
    quality,
    placeholder: 'blur',
    blurDataURL: generateBlurDataURL(8, 6),
    sizes: RESPONSIVE_SIZES[type as keyof typeof RESPONSIVE_SIZES] || RESPONSIVE_SIZES.hero,
    ...options,
  };
}

// Preload critical images
export function preloadImage(src: string, priority: boolean = true): void {
  if (typeof window === 'undefined' || !priority) return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  link.crossOrigin = 'anonymous';
  
  document.head.appendChild(link);
}