/**
 * Lazy Loaded Mega Menu Container
 *
 * Optimización de performance:
 * - Carga lazy con dynamic import
 * - Suspense boundary con skeleton
 * - Tree shaking agresivo de dependencies
 */

'use client';

import React, { lazy,Suspense } from 'react';

import type { NavigationItem } from '../../domain/types';

// ============= Types =============

interface LazyMegaMenuContainerProps {
  menuId: string;
  navigationItems: NavigationItem[];
  interactionMode?: 'hover' | 'click' | 'touch';
  position?: 'left' | 'center' | 'right';
  className?: string;
  onClose: () => void;
  onNavigate?: (href: string) => void;
  getMenuProps?: (menuId: string) => any;
}

// ============= Lazy Components =============

// Only load heavy MegaMenuContainer when actually needed
const MegaMenuContainer = lazy(() =>
  import('./mega-menu-container').then(module => ({
    default: module.MegaMenuContainer
  }))
);

// ============= Loading Skeleton =============

const MegaMenuSkeleton: React.FC = () => (
  <div
    className="absolute top-full left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/30"
    role="presentation"
    aria-hidden="true"
  >
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-3 gap-8">
        {/* Column 1 */}
        <div className="space-y-4">
          <div className="h-6 bg-slate-700/50 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-slate-800/50 rounded animate-pulse" />
            <div className="h-4 bg-slate-800/50 rounded animate-pulse" />
            <div className="h-4 bg-slate-800/50 rounded animate-pulse" />
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-4">
          <div className="h-6 bg-slate-700/50 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-slate-800/50 rounded animate-pulse" />
            <div className="h-4 bg-slate-800/50 rounded animate-pulse" />
            <div className="h-4 bg-slate-800/50 rounded animate-pulse" />
          </div>
        </div>

        {/* Column 3 */}
        <div className="space-y-4">
          <div className="h-6 bg-slate-700/50 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-slate-800/50 rounded animate-pulse" />
            <div className="h-4 bg-slate-800/50 rounded animate-pulse" />
            <div className="h-4 bg-slate-800/50 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ============= Error Boundary =============

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

const MegaMenuErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError
}) => (
  <div
    className="absolute top-full left-0 right-0 z-50 bg-red-900/95 backdrop-blur-xl border-t border-red-800/30"
    role="alert"
  >
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 text-center">
      <h3 className="text-red-200 font-medium mb-2">
        Error loading menu
      </h3>
      <p className="text-red-300 text-sm mb-4">
        {error.message}
      </p>
      <button
        onClick={resetError}
        className="text-red-100 hover:text-white underline text-sm"
      >
        Try again
      </button>
    </div>
  </div>
);

// ============= Main Component =============

export const LazyMegaMenuContainer: React.FC<LazyMegaMenuContainerProps> = (props) => {
  return (
    <Suspense fallback={<MegaMenuSkeleton />}>
      <MegaMenuContainer {...props} />
    </Suspense>
  );
};

export default LazyMegaMenuContainer;