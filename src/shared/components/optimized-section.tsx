'use client';

import { Suspense, lazy, ComponentType, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/shared/hooks/use-scroll-animations';

interface OptimizedSectionProps {
  children: ReactNode;
  className?: string;
  animationType?: 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn';
  delay?: number;
  threshold?: number;
  loading?: ReactNode;
  ariaLabel?: string;
  id?: string;
}

// Loading skeleton component
const SectionSkeleton = () => (
  <div className="w-full h-96 bg-muted/20 animate-pulse rounded-lg" />
);

/**
 * Optimized section wrapper with lazy loading and animations
 */
export function OptimizedSection({
  children,
  className = '',
  animationType = 'fadeInUp',
  delay = 0,
  threshold = 0.2,
  loading = <SectionSkeleton />,
  ariaLabel,
  id
}: OptimizedSectionProps) {
  const animationVariants = {
    fadeInUp: { animateIn: { opacity: 1, y: 0 }, animateOut: { opacity: 0, y: 40 } },
    fadeInDown: { animateIn: { opacity: 1, y: 0 }, animateOut: { opacity: 0, y: -40 } },
    fadeInLeft: { animateIn: { opacity: 1, x: 0 }, animateOut: { opacity: 0, x: -40 } },
    fadeInRight: { animateIn: { opacity: 1, x: 0 }, animateOut: { opacity: 0, x: 40 } },
    scaleIn: { animateIn: { opacity: 1, scale: 1 }, animateOut: { opacity: 0, scale: 0.9 } }
  };

  const { ref, controls, initial } = useScrollAnimation({
    ...animationVariants[animationType],
    delay,
    amount: threshold
  });

  return (
    <Suspense fallback={loading}>
      <motion.section
        ref={ref}
        id={id}
        initial={initial}
        animate={controls}
        className={className}
        aria-label={ariaLabel}
      >
        {children}
      </motion.section>
    </Suspense>
  );
}

/**
 * Lazy load wrapper for components
 */
export function LazyLoadWrapper<P = {}>({
  loader,
  fallback = <SectionSkeleton />,
  ...props
}: {
  loader: () => Promise<{ default: ComponentType<P> }>;
  fallback?: ReactNode;
} & P) {
  const LazyComponent = lazy(loader) as ComponentType<P>;

  return (
    <Suspense fallback={fallback}>
      <LazyComponent {...(props as P)} />
    </Suspense>
  );
}

/**
 * Image component with lazy loading and optimization
 */
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  loading?: 'lazy' | 'eager';
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  loading = 'lazy',
  placeholder = 'empty',
  blurDataURL
}: OptimizedImageProps) {
  return (
    <picture>
      <source srcSet={`${src}?format=webp`} type="image/webp" />
      <source srcSet={`${src}?format=avif`} type="image/avif" />
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
        className={className}
        decoding="async"
        style={{
          backgroundImage: placeholder === 'blur' && blurDataURL 
            ? `url(${blurDataURL})` 
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
    </picture>
  );
}

/**
 * Performance monitoring component
 */
export function PerformanceMonitor({ children }: { children: ReactNode }) {
  // Monitor Web Vitals in development
  if (process.env.NODE_ENV === 'development') {
    import('web-vitals').then((webVitals) => {
      webVitals.onCLS(console.log);
      webVitals.onINP(console.log); // INP replaced FID
      webVitals.onFCP(console.log);
      webVitals.onLCP(console.log);
      webVitals.onTTFB(console.log);
    });
  }

  return <>{children}</>;
}

/**
 * Accessibility wrapper with ARIA landmarks
 */
interface AccessibleSectionProps {
  children: ReactNode;
  as?: 'section' | 'article' | 'aside' | 'nav';
  role?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  className?: string;
}

export function AccessibleSection({
  children,
  as: Component = 'section',
  role,
  ariaLabel,
  ariaDescribedBy,
  className
}: AccessibleSectionProps) {
  return (
    <Component
      role={role}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={className}
    >
      {children}
    </Component>
  );
}

/**
 * Skip to content link for keyboard navigation
 */
export function SkipToContent({ href = '#main-content' }: { href?: string }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      Skip to main content
    </a>
  );
}

/**
 * SEO meta tags component
 */
interface SEOMetaProps {
  title: string;
  description: string;
  keywords?: string;
  author?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image';
}

export function SEOMeta({
  title,
  description,
  keywords,
  author = 'WhatsApp Cloud',
  ogImage = '/og-image.jpg',
  ogUrl,
  twitterCard = 'summary_large_image'
}: SEOMetaProps) {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content={author} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      <meta property="og:type" content="website" />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
    </>
  );
}