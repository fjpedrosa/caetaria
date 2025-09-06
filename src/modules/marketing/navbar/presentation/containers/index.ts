/**
 * Presentation Layer - Container Exports
 *
 * Exporta todos los contenedores smart que conectan hooks con componentes presentacionales.
 * Estos contenedores son el puente entre la lógica de aplicación y la presentación pura.
 */

// Main container that orchestrates the entire navbar
export { NavbarContainer } from './navbar-container';

// Mobile-specific container with touch gestures and mobile optimizations
export { NavbarMobileContainer } from './navbar-mobile-container';

// Mega menu container for complex dropdown menus
export { MegaMenuContainer } from './mega-menu-container';

// Mobile menu container for responsive navigation
export { MobileMenuContainer } from './mobile-menu-container';

// Progress bar container for scroll tracking
export { ProgressBarContainer } from './progress-bar-container';

// Example container for demonstration purposes
export { NavbarPureExampleContainer } from './navbar-pure-example-container';