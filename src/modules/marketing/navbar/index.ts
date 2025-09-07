/**
 * Marketing Navbar Module Exports
 *
 * Premium navbar with Stripe-quality mega menus
 */

// Main enhanced navbar component
export { EnhancedNavbar } from './presentation/components/enhanced-navbar';

// Mega menu components
export { MegaMenuBackdrop } from './presentation/components/mega-menu/mega-menu-backdrop';
export { MegaMenuColumnComponent } from './presentation/components/mega-menu/mega-menu-column';
export { MegaMenuItemComponent } from './presentation/components/mega-menu/mega-menu-item';
export { MegaMenuPanel } from './presentation/components/mega-menu/mega-menu-panel';

// Hooks
export { useHoverIntent, useMultiHoverIntent } from './application/hooks/use-hover-intent';

// Types
export type {
  MegaMenuAnimationVariants,
  MegaMenuColumn,
  MegaMenuConfig,
  MegaMenuFeatured,
  MegaMenuItem,
  MegaMenuState,
  MegaMenuTheme,
} from './domain/types/mega-menu.types';

// Configuration data
export {
  companyMegaMenu,
  megaMenuConfigs,
  productsMegaMenu,
  resourcesMegaMenu,
  solutionsMegaMenu} from './infrastructure/data/mega-menu-config';

// Design tokens
export { designTokens } from './presentation/styles/design-tokens';

// Legacy exports for compatibility (if needed)
export type {
  AnimationPhase,
  InteractionMode,
  MegaMenuContent,
  MenuPosition,
  NavigationItem,
  NavigationSection
} from './domain/types';

// Legacy components (keep for backward compatibility)
export { useNavbarAccessibility } from './application/hooks/use-navbar-accessibility';
export { useNavbarPrefetch } from './application/hooks/use-navbar-prefetch';
export { useNavbarScroll } from './application/hooks/use-navbar-scroll';
export { useNavbarState } from './application/hooks/use-navbar-state';
export { NavbarPresentation } from './presentation/components/navbar-presentation';
export { MobileMenuContainer } from './presentation/containers/mobile-menu-container';
export { NavbarContainer } from './presentation/containers/navbar-container';