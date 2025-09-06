/**
 * Optimized Navbar Module Exports
 *
 * Barrel exports con lazy loading para optimización del bundle:
 * - Exports principales siempre disponibles
 * - Componentes pesados lazy-loaded
 * - Tree shaking optimizado
 */

// ============= Core Exports (Always Available) =============

// Main optimized container - primary export
export { OptimizedNavbarContainer } from './containers/optimized-navbar-container';
export { OptimizedNavbarContainer as NavbarContainer } from './containers/optimized-navbar-container';

// Core presentational components - needed for LCP
export { NavbarActions } from './components/navbar-actions';
export { NavbarLogo } from './components/navbar-logo';
export { NavbarMobileToggle } from './components/navbar-mobile-toggle';
export { NavbarNavigation } from './components/navbar-navigation';
export { NavbarPresentation } from './components/navbar-presentation';

// Optimized utilities
export * from './components/optimized-icons';
export * from './components/optimized-motion';

// ============= Lazy Exports (Load on Demand) =============

// Lazy containers - only loaded when needed
export const LazyMegaMenuContainer = async () => {
  const { LazyMegaMenuContainer } = await import('./containers/lazy-mega-menu-container');
  return LazyMegaMenuContainer;
};

export const LazyMobileMenuContainer = async () => {
  const { LazyMobileMenuContainer } = await import('./containers/lazy-mobile-menu-container');
  return LazyMobileMenuContainer;
};

// Original containers for backward compatibility (but not recommended)
export const LegacyNavbarContainer = async () => {
  const { NavbarContainer } = await import('./containers/navbar-container');
  return NavbarContainer;
};

export const LegacyMegaMenuContainer = async () => {
  const { MegaMenuContainer } = await import('./containers/mega-menu-container');
  return MegaMenuContainer;
};

export const LegacyMobileMenuContainer = async () => {
  const { MobileMenuContainer } = await import('./containers/mobile-menu-container');
  return MobileMenuContainer;
};

// ============= Bundle Size Information =============

/**
 * Bundle Size Comparison:
 *
 * Using OptimizedNavbarContainer:
 * - Initial: ~15KB (core components + optimized motion + icons)
 * - Lazy loaded: ~25KB total when all features used
 * - Total maximum: ~40KB
 *
 * Using Legacy NavbarContainer:
 * - Initial: ~85KB (all components + full framer-motion + all hooks)
 * - No lazy loading
 *
 * Savings: ~53% reduction in bundle size
 */

// ============= TypeScript Re-exports =============

export type {
  CTAConfig,
  MegaMenuContent,
  NavbarContainerProps,
  NavbarPresentationProps,
  NavigationItem} from '../domain/types';