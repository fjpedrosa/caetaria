/**
 * Presentation Components Export
 *
 * Exporta todos los componentes presentacionales del navbar.
 * Incluye tanto los componentes puros nuevos como los existentes.
 */

// Componentes puros (100% presentacionales, sin lógica)
export type { MegaMenuPresentationPureProps } from './mega-menu-presentation-pure';
export { MegaMenuPresentationPure } from './mega-menu-presentation-pure';
export type { NavbarCTAPureProps } from './navbar-cta-pure';
export { NavbarCTAPure } from './navbar-cta-pure';
export type { NavbarLinkPureProps } from './navbar-link-pure';
export { NavbarLinkPure } from './navbar-link-pure';
export type { NavbarLogoPureProps } from './navbar-logo-pure';
export { NavbarLogoPure } from './navbar-logo-pure';
export type { NavbarProgressBarPureProps } from './navbar-progress-bar-pure';
export { NavbarProgressBarPure } from './navbar-progress-bar-pure';

// Componentes existentes (para mantener compatibilidad)
export { NavbarActions } from './navbar-actions';
export { NavbarLogo } from './navbar-logo';
export { NavbarMobileToggle } from './navbar-mobile-toggle';
export { NavbarNavigation } from './navbar-navigation';
export { NavbarPresentation } from './navbar-presentation';

// Nuevo componente de navegación accesible
export { AccessibleNavbarNavigation } from './accessible-navbar-navigation';