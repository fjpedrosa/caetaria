'use client';

import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface DecorativeBlobConfig {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  color: 'neptune' | 'whatsapp' | string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  offset?: {
    x?: number; // percentage
    y?: number; // percentage
  };
  opacity?: number;
  blur?: number;
}

interface SeamlessSectionProps {
  children: ReactNode;
  className?: string;
  decorativeBlob?: DecorativeBlobConfig;
  id?: string;
  ariaLabel?: string;
  spacing?: 'normal' | 'large' | 'xlarge';
  paddingTop?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  paddingBottom?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export function SeamlessSection({
  children,
  className,
  decorativeBlob,
  id,
  ariaLabel,
  spacing = 'normal',
  paddingTop,
  paddingBottom,
}: SeamlessSectionProps) {

  // Blob size classes
  const blobSizes = {
    'sm': 'w-48 h-48',
    'md': 'w-64 h-64',
    'lg': 'w-80 h-80',
    'xl': 'w-96 h-96',
  };

  // Blob color mapping
  const getBlobColor = (color: string) => {
    if (color === 'neptune') return 'hsla(220, 100%, 62%, var(--blob-opacity, 0.15))';
    if (color === 'whatsapp') return 'hsla(150, 100%, 75%, var(--blob-opacity, 0.15))';
    return color;
  };

  // Blob position mapping
  const blobPositions = {
    'top-left': 'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
    'top-right': 'top-0 right-0 translate-x-1/2 -translate-y-1/2',
    'bottom-left': 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
    'bottom-right': 'bottom-0 right-0 translate-x-1/2 translate-y-1/2',
  };

  // Spacing classes for visual hierarchy
  const spacingClasses = {
    'normal': 'py-24 lg:py-32',
    'large': 'py-32 lg:py-40',
    'xlarge': 'py-40 lg:py-48',
  };

  // Individual padding classes
  const paddingTopClasses = {
    'none': 'pt-0',
    'sm': 'pt-4',
    'md': 'pt-8',
    'lg': 'pt-16',
    'xl': 'pt-24',
  };

  const paddingBottomClasses = {
    'none': 'pb-0',
    'sm': 'pb-4',
    'md': 'pb-8',
    'lg': 'pb-16',
    'xl': 'pb-24',
  };

  // Determine which classes to use
  const getPaddingClasses = () => {
    // If individual padding props are provided, use them
    if (paddingTop !== undefined || paddingBottom !== undefined) {
      const ptClass = paddingTop ? paddingTopClasses[paddingTop] : '';
      const pbClass = paddingBottom ? paddingBottomClasses[paddingBottom] : '';
      return `${ptClass} ${pbClass}`.trim();
    }

    // Otherwise, use the spacing prop
    return spacingClasses[spacing];
  };

  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={cn(
        'relative',
        getPaddingClasses(), // Dynamic padding based on props
        'overflow-visible', // Allow decorative elements to extend beyond
        'bg-transparent', // Transparent to inherit page background
        className
      )}
    >
      {/* Decorative Blob that can extend beyond section boundaries */}
      {decorativeBlob && (
        <div
          className={cn(
            'absolute pointer-events-none',
            blobSizes[decorativeBlob.size || 'lg'],
            blobPositions[decorativeBlob.position],
            'rounded-full',
            'transform-gpu', // GPU acceleration
            'will-change-transform',
            'animate-morph'
          )}
          style={{
            background: `radial-gradient(ellipse at center, ${getBlobColor(decorativeBlob.color)}, transparent)`,
            opacity: decorativeBlob.opacity || 0.15,
            filter: `blur(${decorativeBlob.blur || 80}px)`,
            transform: `
              ${blobPositions[decorativeBlob.position].includes('translate') ? '' : ''}
              translateX(${decorativeBlob.offset?.x || 0}%)
              translateY(${decorativeBlob.offset?.y || 0}%)
              translateZ(0)
            `,
            '--blob-opacity': decorativeBlob.opacity || 0.15,
            zIndex: -1,
          } as React.CSSProperties}
        />
      )}

      {/* Section content with proper z-index */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Performance optimization: CSS containment */}
      <style jsx>{`
        section {
          contain: layout style;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .animate-morph {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}