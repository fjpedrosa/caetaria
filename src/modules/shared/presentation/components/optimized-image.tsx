'use client';

import { useEffect,useRef, useState } from 'react';
import { AnimatePresence,motion } from 'framer-motion';
import Image from 'next/image';

import {
  createOptimizedImageProps,
  generateBlurDataURL,
  IMAGE_QUALITY,
  OptimizedImageProps} from '@/lib/image-optimization';
import { cn } from '@/lib/utils';
import { useAnimationConfig } from '@/shared/hooks/use-animation-config';
import { useIntersection } from '@/shared/hooks/use-intersection';

interface ResponsiveImageProps extends OptimizedImageProps {
  // Mobile-specific props
  mobileWidth?: number;
  mobileHeight?: number;
  mobileQuality?: number;

  // Lazy loading options
  lazy?: boolean;
  threshold?: number;
  rootMargin?: string;

  // Animation options
  animateIn?: boolean;
  animationDelay?: number;

  // Error handling
  fallbackSrc?: string;
  onError?: () => void;
  onLoad?: () => void;

  // Performance options
  priority?: boolean;
  preload?: boolean;

  // Styling
  containerClassName?: string;
  imageClassName?: string;
  overlayClassName?: string;

  // Accessibility
  ariaLabel?: string;
  role?: string;
}

/**
 * Responsive Image Component with Mobile Optimization
 *
 * Features:
 * - Lazy loading with intersection observer
 * - Device-aware quality and sizing
 * - Smooth loading animations
 * - Error handling with fallbacks
 * - Mobile-first responsive design
 */
export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  mobileWidth,
  mobileHeight,
  mobileQuality,
  quality = 80,
  sizes,
  className = '',
  containerClassName = '',
  imageClassName = '',
  overlayClassName = '',
  lazy = true,
  threshold = 0.1,
  rootMargin = '50px',
  animateIn = true,
  animationDelay = 0,
  priority = false,
  preload = false,
  fallbackSrc,
  onError,
  onLoad,
  ariaLabel,
  role,
  placeholder = 'blur',
  blurDataURL,
  ...props
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imageRef = useRef<HTMLDivElement>(null);

  const { isMobile, shouldAnimate, getDurationMultiplier } = useAnimationConfig();
  const isInView = useIntersection(imageRef, { threshold, rootMargin });

  // Determine optimal dimensions and quality for mobile
  const optimizedWidth = isMobile && mobileWidth ? mobileWidth : width;
  const optimizedHeight = isMobile && mobileHeight ? mobileHeight : height;
  const optimizedQuality = isMobile && mobileQuality
    ? mobileQuality
    : isMobile
      ? Math.max(quality - 15, 60) // Reduce quality on mobile
      : quality;

  // Generate blur placeholder if not provided
  const placeholderDataURL = blurDataURL || generateBlurDataURL(
    Math.min(optimizedWidth || 400, 8),
    Math.min(optimizedHeight || 300, 6)
  );

  // Handle image loading
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle image error with fallback
  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setHasError(true);
    }
    onError?.();
  };

  // Preload image if requested
  useEffect(() => {
    if (preload || priority) {
      const img = new window.Image();
      img.src = currentSrc;
    }
  }, [currentSrc, preload, priority]);

  // Don't render if lazy loading and not in view (unless priority)
  const shouldLoad = !lazy || isInView || priority;

  // Animation configuration
  const fadeInAnimation = shouldAnimate('low') && animateIn ? {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: isLoaded ? 1 : 0,
      scale: isLoaded ? 1 : 0.95,
      transition: {
        duration: 0.4 * getDurationMultiplier(),
        delay: animationDelay,
        ease: [0.215, 0.610, 0.355, 1.000]
      }
    }
  } : {};

  // Error fallback component
  if (hasError) {
    return (
      <div
        ref={imageRef}
        className={cn(
          'flex items-center justify-center bg-gray-100 text-gray-400 rounded-lg',
          containerClassName,
          className
        )}
        style={{ width: optimizedWidth, height: optimizedHeight }}
      >
        <div className="text-center p-4">
          <div className="text-2xl mb-2">🖼️</div>
          <div className="text-sm">Image not available</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={imageRef}
      className={cn('relative overflow-hidden', containerClassName)}
      style={{ width: optimizedWidth, height: optimizedHeight }}
    >
      {/* Loading skeleton */}
      <AnimatePresence>
        {!isLoaded && shouldLoad && (
          <motion.div
            className={cn(
              'absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse',
              overlayClassName
            )}
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 0.3 }
            }}
          />
        )}
      </AnimatePresence>

      {/* Actual image */}
      {shouldLoad && (
        <motion.div
          className="relative w-full h-full"
          {...fadeInAnimation}
        >
          <Image
            src={currentSrc}
            alt={alt}
            width={optimizedWidth}
            height={optimizedHeight}
            quality={optimizedQuality}
            sizes={sizes}
            priority={priority}
            placeholder={placeholder}
            blurDataURL={placeholderDataURL}
            className={cn(
              'object-cover transition-opacity duration-300',
              imageClassName,
              className
            )}
            onLoad={handleLoad}
            onError={handleError}
            aria-label={ariaLabel || alt}
            role={role}
            {...props}
          />
        </motion.div>
      )}

      {/* Lazy loading placeholder */}
      {!shouldLoad && (
        <div
          className={cn(
            'absolute inset-0 bg-gray-100 flex items-center justify-center',
            overlayClassName
          )}
        >
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
    </div>
  );
}

/**
 * Preset responsive image components for common use cases
 */

// Hero image with mobile optimization
export function HeroImage(props: Omit<ResponsiveImageProps, 'lazy' | 'priority'>) {
  const optimizedProps = createOptimizedImageProps(props.src, props.alt, 'hero');

  return (
    <ResponsiveImage
      {...optimizedProps}
      {...props}
      lazy={false}
      priority={true}
      mobileQuality={70}
      animateIn={true}
      containerClassName={cn('w-full h-auto', props.containerClassName)}
    />
  );
}

// Card image with lazy loading
export function CardImage(props: Omit<ResponsiveImageProps, 'lazy'>) {
  const optimizedProps = createOptimizedImageProps(props.src, props.alt, 'card');

  return (
    <ResponsiveImage
      {...optimizedProps}
      {...props}
      lazy={true}
      threshold={0.2}
      mobileQuality={65}
      containerClassName={cn('aspect-video w-full', props.containerClassName)}
    />
  );
}

// Avatar image (no lazy loading needed for small images)
export function AvatarImage(props: Omit<ResponsiveImageProps, 'lazy' | 'animateIn'>) {
  const optimizedProps = createOptimizedImageProps(props.src, props.alt, 'avatar');

  return (
    <ResponsiveImage
      {...optimizedProps}
      {...props}
      lazy={false}
      animateIn={false}
      containerClassName={cn('rounded-full', props.containerClassName)}
    />
  );
}

// Content image with medium optimization
export function ContentImage(props: ResponsiveImageProps) {
  const optimizedProps = createOptimizedImageProps(props.src, props.alt, 'content');

  return (
    <ResponsiveImage
      {...optimizedProps}
      {...props}
      lazy={true}
      threshold={0.3}
      mobileQuality={IMAGE_QUALITY.content}
      containerClassName={cn('w-full max-w-4xl mx-auto', props.containerClassName)}
    />
  );
}

export default ResponsiveImage;