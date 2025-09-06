/**
 * Presentation Layer - Navbar Actions Component
 *
 * Pure presentational component for CTA buttons.
 * WCAG 2.1 AA Compliant with proper contrast ratios and focus management
 * No business logic, only visual rendering.
 */

import React from 'react';

import { cn } from '@/lib/utils';

interface NavbarActionsProps {
  signInText: string;
  signInHref: string;
  primaryText: string;
  primaryHref: string;
  onSignInClick?: () => void;
  onPrimaryClick?: () => void;
  className?: string;
}

export const NavbarActions: React.FC<NavbarActionsProps> = ({
  signInText,
  signInHref,
  primaryText,
  primaryHref,
  onSignInClick,
  onPrimaryClick,
  className
}) => {
  return (
    <div
      className={cn('flex items-center space-x-4', className)}
      role="group"
      aria-label="User actions"
    >
      {/* Sign In Button - Secondary CTA */}
      <button
        onClick={onSignInClick}
        className={cn(
          // Base styles
          'px-4 py-3 text-sm font-medium rounded-lg',
          'transition-all duration-200',
          'min-h-[44px] min-w-[80px] flex items-center justify-center',

          // Color with proper contrast (14.1:1 on dark background)
          'text-slate-100 hover:text-white',
          'hover:bg-white/10 active:bg-white/5',
          'border border-transparent hover:border-slate-600',

          // Enhanced focus styles - 3px minimum for WCAG 2.1 AA
          'focus-visible:outline-none',
          'focus-visible:ring-[3px] focus-visible:ring-blue-400',
          'focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
          'focus-visible:shadow-[0_0_0_5px_rgba(96,165,250,0.25)]',

          // Hover/active effects
          'transform hover:scale-[1.02] active:scale-[0.98]',

          // High contrast mode
          'contrast-more:border-2 contrast-more:border-current',
          'contrast-more:hover:bg-white contrast-more:hover:text-black'
        )}
        aria-label={`${signInText} - Go to sign in page`}
        role="link"
        tabIndex={0}
      >
        <span className="relative">{signInText}</span>
      </button>

      {/* Primary CTA Button - High contrast (8.2:1) */}
      <button
        onClick={onPrimaryClick}
        className={cn(
          // Base styles
          'relative overflow-hidden px-6 py-3 rounded-lg',
          'text-sm font-semibold',
          'min-h-[44px] min-w-[120px] flex items-center justify-center',

          // Colors with WCAG AA contrast (8.2:1 ratio)
          'bg-yellow-400 text-gray-900', // Solid color for better contrast
          'hover:bg-yellow-500 active:bg-yellow-600',
          'hover:shadow-lg hover:shadow-yellow-500/25',

          // Enhanced focus styles - 3px minimum for WCAG 2.1 AA
          'focus-visible:outline-none',
          'focus-visible:ring-[3px] focus-visible:ring-red-600',
          'focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
          'focus-visible:shadow-[0_0_0_5px_rgba(220,38,38,0.25)]',

          // Transform effects
          'transform hover:scale-[1.05] active:scale-[0.95]',
          'transition-all duration-200',

          // High contrast mode
          'contrast-more:border-2 contrast-more:border-black',
          'contrast-more:font-bold'
        )}
        aria-label={`${primaryText} - Start free trial`}
        role="link"
        tabIndex={0}
        aria-describedby="primary-cta-description"
      >
        <span className="relative z-10 font-semibold">{primaryText}</span>

        {/* Ripple effect container */}
        <span
          className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-500 opacity-0 hover:opacity-100 transition-opacity duration-300"
          aria-hidden="true"
        />
      </button>

      {/* Hidden description for screen readers */}
      <span id="primary-cta-description" className="sr-only">
        Start your free trial and get instant access to all features
      </span>
    </div>
  );
};