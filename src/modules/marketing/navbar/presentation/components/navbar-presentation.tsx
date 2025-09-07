/**
 * Presentation Layer - Pure Navbar Component
 *
 * Componente presentacional puro sin lógica de negocio.
 * WCAG 2.1 AA Compliant - Full accessibility implementation
 * Principio aplicado: Single Responsibility - Solo renderiza UI
 */

import React from 'react';

import { cn } from '@/lib/utils';

import type { NavbarPresentationProps } from '../../domain/types';

import { NavbarActions } from './navbar-actions';
import { NavbarLogo } from './navbar-logo';
import { NavbarMobileToggle } from './navbar-mobile-toggle';
import { NavbarNavigation } from './navbar-navigation';
import { SkipLinks } from './skip-links';

/**
 * Pure presentational navbar component.
 * No business logic, no hooks, no state - just UI rendering.
 */
export const NavbarPresentation: React.FC<NavbarPresentationProps> = ({
  navigationItems,
  ctaConfig,
  className,
  isTransparent = false,
  showLogo = true,
  logoText = 'Neptunik',
  ariaLabel = 'Navegación principal del sitio',

  // Event handlers - passed from container
  onLogoClick,
  onNavItemClick,
  onSignInClick,
  onPrimaryCtaClick,
  onMobileMenuToggle,
  onNavItemHover,

  // Visual states only
  isMobileMenuOpen = false,
  activeNavItem,
  isScrolled = false,
  isVisible = true,
  isCompactMode = false,
  cssVariables = {}
}) => {
  // Pure presentation - only visual logic
  const navbarClasses = cn(
    'fixed top-0 left-0 right-0 z-50',
    'transition-all duration-200 ease-out',

    // Transform based on visibility (desktop only)
    !isVisible && 'lg:transform lg:-translate-y-full',

    // Background based on state
    isTransparent && !isScrolled
      ? 'bg-transparent'
      : 'bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/30 shadow-2xl',

    // Always visible on mobile
    'transform-none md:transform',

    className
  );

  return (
    <>
      {/* Skip Links for Keyboard Navigation - WCAG 2.1 AA */}
      <SkipLinks
        mainContentId="main-content"
        navigationId="main-navigation"
        footerId="footer-content"
      />

      <header
        className={navbarClasses}
        role="banner"
        aria-label={ariaLabel}
        style={cssVariables}
      >
        <nav
          id="main-navigation"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          role="navigation"
          aria-label="Navegación principal"
        >
          <div className={cn(
          'flex items-center justify-between',
          // Dynamic height based on compact mode
          isCompactMode ? 'h-14' : 'h-16 sm:h-18',
          // Apply safe area padding for devices with notch
          'pt-[env(safe-area-inset-top,0px)]'
        )}>

          {/* Logo Section */}
          {showLogo && (
            <NavbarLogo
              text={logoText}
              onClick={onLogoClick}
            />
          )}

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center">
            <NavbarNavigation
              items={navigationItems}
              activeItem={activeNavItem}
              onItemClick={onNavItemClick}
              onItemHover={onNavItemHover}
            />
          </div>

          {/* CTA Actions - Optimized for mobile */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Primary CTA always visible on mobile */}
            <button
              onClick={onPrimaryCtaClick}
              className={cn(
                // Mobile-optimized button
                'sm:hidden',
                'min-w-[80px] min-h-[44px] px-3 py-2.5',
                'text-xs font-semibold rounded-lg',
                'bg-gradient-to-r from-yellow-400 to-yellow-500',
                'text-slate-900 hover:from-yellow-500 hover:to-yellow-600',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2',
                // Touch target optimization
                'relative touch-manipulation',
                // Compact mode adjustments
                isCompactMode && 'py-2 min-h-[40px]'
              )}
              aria-label={ctaConfig.primary.text}
            >
              {isCompactMode ? 'Start' : ctaConfig.primary.text}
            </button>

            {/* Desktop CTAs */}
            <div className="hidden sm:flex items-center space-x-4">
              <NavbarActions
                signInText={ctaConfig.signIn.text}
                signInHref={ctaConfig.signIn.href}
                primaryText={ctaConfig.primary.text}
                primaryHref={ctaConfig.primary.href}
                onSignInClick={onSignInClick}
                onPrimaryClick={onPrimaryCtaClick}
              />
            </div>

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden">
              <NavbarMobileToggle
                isOpen={isMobileMenuOpen}
                onClick={onMobileMenuToggle}
                isCompact={isCompactMode}
              />
            </div>
          </div>

        </div>
      </nav>
    </header>
    </>
  );
};