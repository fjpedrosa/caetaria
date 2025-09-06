/**
 * Lazy Loaded Mobile Menu Container
 *
 * Optimización de performance:
 * - Carga solo en viewports móviles con useMediaQuery
 * - Dynamic import con Suspense
 * - Minimal bundle impact para desktop
 */

'use client';

import React, { lazy, Suspense, useEffect, useState } from 'react';

import type { CTAConfig,NavigationItem } from '../../domain/types';

// ============= Types =============

interface LazyMobileMenuContainerProps {
  isOpen: boolean;
  navigationItems: NavigationItem[];
  ctaConfig: CTAConfig;
  isScrolled: boolean;
  onClose: () => void;
  onNavigate?: (href: string) => void;
}

// ============= Lazy Components =============

// Only load MobileMenuContainer when needed on mobile
const MobileMenuContainer = lazy(() =>
  import('./mobile-menu-container').then(module => ({
    default: module.MobileMenuContainer
  }))
);

// ============= Media Query Hook (Lightweight) =============

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

// ============= Loading Skeleton =============

const MobileMenuSkeleton: React.FC = () => (
  <div
    className="fixed inset-0 z-40 lg:hidden"
    role="presentation"
    aria-hidden="true"
  >
    {/* Backdrop */}
    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm animate-pulse" />

    {/* Menu Panel */}
    <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-slate-900 shadow-2xl">
      <div className="p-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-32 bg-slate-700/50 rounded animate-pulse" />
          <div className="h-8 w-8 bg-slate-700/50 rounded animate-pulse" />
        </div>

        {/* Navigation skeleton */}
        <div className="space-y-4 mb-8">
          <div className="h-12 bg-slate-800/50 rounded animate-pulse" />
          <div className="h-12 bg-slate-800/50 rounded animate-pulse" />
          <div className="h-12 bg-slate-800/50 rounded animate-pulse" />
          <div className="h-12 bg-slate-800/50 rounded animate-pulse" />
        </div>

        {/* CTA skeleton */}
        <div className="space-y-3">
          <div className="h-10 bg-slate-800/50 rounded animate-pulse" />
          <div className="h-10 bg-yellow-600/20 rounded animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

// ============= Main Component =============

export const LazyMobileMenuContainer: React.FC<LazyMobileMenuContainerProps> = (props) => {
  const isMobile = useIsMobile();

  // Don't render anything on desktop
  if (!isMobile) {
    return null;
  }

  // Don't render when closed
  if (!props.isOpen) {
    return null;
  }

  return (
    <Suspense fallback={<MobileMenuSkeleton />}>
      <MobileMenuContainer {...props} />
    </Suspense>
  );
};

export default LazyMobileMenuContainer;