/**
 * Navbar Application Hooks
 *
 * Exportación centralizada de todos los custom hooks especializados del navbar.
 * Cada hook tiene una responsabilidad única siguiendo el principio SRP.
 */

// Core navigation hooks
export { useNavbarAccessibility } from './use-navbar-accessibility';
export { useNavbarScroll } from './use-navbar-scroll';
export { useNavbarState } from './use-navbar-state';

// Interaction hooks
export { useMegaMenuInteraction } from './use-mega-menu-interaction';

// Performance hooks
export { useNavbarPrefetch } from './use-navbar-prefetch';

// Re-export types if needed
export type {
  AccessibilityConfig,
  AccessibilityState,
  ScrollState} from '../../domain/types';