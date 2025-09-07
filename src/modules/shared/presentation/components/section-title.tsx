'use client';

import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface SectionTitleProps {
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  align?: 'left' | 'center' | 'right';
  size?: 'default' | 'large' | 'xlarge';
  className?: string;
  animated?: boolean;
}

export function SectionTitle({
  title,
  subtitle,
  align = 'center',
  size = 'default',
  className,
  animated = true,
}: SectionTitleProps) {
  // Size classes for title
  const titleSizes = {
    'default': 'text-4xl md:text-5xl lg:text-6xl',
    'large': 'text-5xl md:text-6xl lg:text-7xl',
    'xlarge': 'text-6xl md:text-7xl lg:text-8xl',
  };

  // Alignment classes
  const alignmentClasses = {
    'left': 'text-left',
    'center': 'text-center',
    'right': 'text-right',
  };

  // Subtitle size based on title size
  const subtitleSizes = {
    'default': 'text-lg md:text-xl lg:text-2xl',
    'large': 'text-xl md:text-2xl lg:text-3xl',
    'xlarge': 'text-2xl md:text-3xl lg:text-4xl',
  };

  return (
    <div
      className={cn(
        'space-y-4 mb-12 lg:mb-16',
        alignmentClasses[align],
        animated && 'transition-all duration-700 ease-out',
        className
      )}
    >
      <h2
        className={cn(
          'font-bold tracking-tight',
          'text-foreground', // Solid color for better contrast
          titleSizes[size],
          'leading-tight'
        )}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className={cn(
            'text-muted-foreground',
            'max-w-3xl mx-auto',
            subtitleSizes[size],
            animated && 'transition-all duration-700 ease-out delay-150'
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}