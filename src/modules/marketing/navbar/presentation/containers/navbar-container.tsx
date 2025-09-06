/**
 * Presentation Layer - Smart Navbar Container
 *
 * Container component que orquesta toda la lógica del navbar.
 * Conecta los hooks de aplicación con los componentes presentacionales puros.
 *
 * Principios aplicados:
 * - Container/Presentation Pattern: Separa lógica de presentación
 * - Single Responsibility: Solo conecta hooks con componentes
 * - Dependency Inversion: Usa abstracciones (hooks) no implementaciones
 */

'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { useMegaMenuInteraction } from '../../application/hooks/use-mega-menu-interaction';
import { useMobileOptimization } from '../../application/hooks/use-mobile-optimization';
import { useNavbarAccessibility } from '../../application/hooks/use-navbar-accessibility';
import { useNavbarPrefetch } from '../../application/hooks/use-navbar-prefetch';
import { useNavbarScroll } from '../../application/hooks/use-navbar-scroll';
import { useNavbarState } from '../../application/hooks/use-navbar-state';
import type { NavbarContainerProps } from '../../domain/types';
import { createAccessibilityAdapter } from '../../infrastructure/adapters/accessibility-adapter';
import { createNavigationAdapter } from '../../infrastructure/adapters/navigation-adapter';
import { NavbarPresentation } from '../components/navbar-presentation';

import { MegaMenuContainer } from './mega-menu-container';
import { MobileMenuContainer } from './mobile-menu-container';
import { ProgressBarContainer } from './progress-bar-container';

/**
 * Smart container component that handles all business logic
 * and delegates presentation to pure components.
 */
export const NavbarContainer: React.FC<NavbarContainerProps> = ({
  config,
  navigationItems,
  ctaConfig,
  performanceConfig,
  accessibilityConfig,
  onNavigate,
  className
}) => {
  const router = useRouter();

  // ============= State Management =============
  const {
    state,
    isNavbarVisible,
    shouldShowProgress,
    isHighContrastMode,
    isReducedMotion,
    actions
  } = useNavbarState({
    config,
    navigationItems,
    ctaConfig
  });

  // ============= Scroll Management =============
  const {
    isVisible,
    isAtTop,
    scrollY,
    scrollProgress,
    scrollToElement,
    lockScroll,
    unlockScroll
  } = useNavbarScroll({
    threshold: config?.hideOnScroll ? 10 : 0,
    onScrollChange: (scrollState) => {
      actions.updateScrollState(scrollState);
    }
  });

  // ============= Accessibility Management =============
  const {
    announceToScreenReader,
    trapFocus,
    releaseFocus,
    getAriaProps
  } = useNavbarAccessibility({
    config: accessibilityConfig,
    onAnnouncement: (message) => {
      console.log('[Accessibility]', message);
    }
  });

  // ============= Prefetch Management =============
  const {
    prefetchLink,
    clearPrefetchQueue,
    isPrefetching
  } = useNavbarPrefetch({
    enabled: performanceConfig?.enablePrefetch ?? true,
    delay: performanceConfig?.prefetchDelay ?? 100,
    maxQueueSize: performanceConfig?.maxPrefetchQueue ?? 5
  });

  // ============= Mega Menu Interaction =============
  const {
    activeMenu,
    isOpen: isMegaMenuOpen,
    interactionMode,
    openMenu,
    closeMenu,
    toggleMenu,
    handleMouseEnter: handleMegaMenuMouseEnter,
    handleMouseLeave: handleMegaMenuMouseLeave,
    handleClick: handleMegaMenuClick,
    handleKeyDown: handleMegaMenuKeyDown,
    getMenuProps
  } = useMegaMenuInteraction({
    config: {
      hoverDelay: { enter: 100, exit: 300 },
      triangleSafeZone: { enabled: true, tolerance: 100 },
      touchMode: { enabled: true, preventClickPropagation: true },
      accessibility: { announceChanges: true, focusFirstItem: true }
    },
    onMenuOpen: (menuId) => announceToScreenReader(`Menú ${menuId} abierto`),
    onMenuClose: (menuId) => announceToScreenReader(`Menú ${menuId} cerrado`)
  });

  // ============= Mobile Optimization =============
  const {
    isCompactMode,
    hasNotch,
    safeAreaInsets,
    triggerHapticFeedback,
    optimizeTouchTargets,
    getCSSVariables
  } = useMobileOptimization({
    enableSwipeGestures: true,
    swipeThreshold: 50,
    enableHapticFeedback: performanceConfig?.enableHapticFeedback ?? true,
    enableCompactMode: true,
    onSwipeLeft: () => {
      // Open mobile menu on swipe left
      if (!state.mobileMenu.isOpen) {
        handleMobileMenuToggle();
      }
    },
    onSwipeRight: () => {
      // Close mobile menu on swipe right
      if (state.mobileMenu.isOpen) {
        handleMobileMenuClose();
      }
    }
  });

  // ============= Service Adapters =============
  const navigationService = useMemo(() => createNavigationAdapter(), []);
  const accessibilityService = useMemo(() => createAccessibilityAdapter(), []);

  // ============= Event Handlers =============

  const handleLogoClick = useCallback(() => {
    router.push('/');
    announceToScreenReader('Navegando a página principal');
  }, [router, announceToScreenReader]);

  const handleNavItemClick = useCallback(async (item: typeof state.navigationItems[0]) => {
    if (item.sectionId) {
      await navigationService.navigateToSection(item.sectionId);
      announceToScreenReader(`Navegando a sección ${item.label}`);
    } else if (item.external) {
      window.open(item.href, '_blank', 'noopener,noreferrer');
      announceToScreenReader(`Abriendo ${item.label} en nueva pestaña`);
    } else {
      router.push(item.href);
      onNavigate?.(item.href);
      announceToScreenReader(`Navegando a ${item.label}`);
    }

    actions.setCurrentSection(item.sectionId || '');
  }, [router, navigationService, announceToScreenReader, onNavigate, actions]);

  const handleSignInClick = useCallback(() => {
    router.push(state.ctaConfig.signIn.href);
    announceToScreenReader('Navegando a página de inicio de sesión');
  }, [router, state.ctaConfig.signIn.href, announceToScreenReader]);

  const handlePrimaryCtaClick = useCallback(() => {
    router.push(state.ctaConfig.primary.href);
    announceToScreenReader('Navegando a página de registro');
  }, [router, state.ctaConfig.primary.href, announceToScreenReader]);

  const handleMobileMenuToggle = useCallback(() => {
    const newState = !state.mobileMenu.isOpen;
    actions.toggleMobileMenu(newState);

    // Trigger haptic feedback
    triggerHapticFeedback('medium');

    if (newState) {
      lockScroll();
      announceToScreenReader('Menú móvil abierto');
    } else {
      unlockScroll();
      announceToScreenReader('Menú móvil cerrado');
    }
  }, [state.mobileMenu.isOpen, actions, lockScroll, unlockScroll, announceToScreenReader, triggerHapticFeedback]);

  const handleMobileMenuClose = useCallback(() => {
    actions.toggleMobileMenu(false);
    unlockScroll();
    announceToScreenReader('Menú móvil cerrado');
  }, [actions, unlockScroll, announceToScreenReader]);

  // ============= Prefetch on hover =============
  const handleLinkHover = useCallback(async (href: string) => {
    if (performanceConfig?.enablePrefetch) {
      await prefetchLink(href);
      actions.addToPrefetchQueue(href);
    }
  }, [performanceConfig?.enablePrefetch, prefetchLink, actions]);

  const handleLinkLeave = useCallback((href: string) => {
    actions.removeFromPrefetchQueue(href);
  }, [actions]);

  // ============= Effects =============

  // Optimize touch targets on mount and when content changes
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      optimizeTouchTargets();
    }, 100);

    return () => clearTimeout(timer);
  }, [optimizeTouchTargets, state.mobileMenu.isOpen]);

  // Update current section based on scroll
  useEffect(() => {
    const currentSection = navigationService.getCurrentSection();
    if (currentSection) {
      actions.setCurrentSection(currentSection);
    }
  }, [scrollY, navigationService, actions]);

  // Handle escape key for mobile menu
  useEffect(() => {
    const handleEscape = (event: CustomEvent | KeyboardEvent) => {
      if ('key' in event && event.key === 'Escape') {
        if (state.mobileMenu.isOpen) {
          handleMobileMenuClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('navbar:escape-pressed', handleEscape as EventListener);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('navbar:escape-pressed', handleEscape as EventListener);
    };
  }, [state.mobileMenu.isOpen, handleMobileMenuClose]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      navigationService.cleanup();
      accessibilityService.cleanup();
    };
  }, [navigationService, accessibilityService]);

  // ============= Render =============

  // Compute visibility states
  const computedNavbarVisible = isVisible && isNavbarVisible;
  const showProgressBar = shouldShowProgress && config?.showProgress !== false;
  const hasActiveMegaMenu = isMegaMenuOpen && activeMenu;

  return (
    <>
      {/* Progress Bar */}
      {showProgressBar && (
        <ProgressBarContainer
          progress={scrollProgress}
          currentSection={state.currentSection}
          isVisible={computedNavbarVisible}
          onSectionClick={(sectionId) => {
            scrollToElement(sectionId);
            actions.setCurrentSection(sectionId);
            announceToScreenReader(`Navegando a sección ${sectionId}`);
          }}
        />
      )}

      {/* Main Navbar */}
      <NavbarPresentation
        navigationItems={state.navigationItems}
        ctaConfig={state.ctaConfig}
        className={className}
        isTransparent={config?.variant?.type === 'transparent'}
        showLogo={true}
        logoText="Neptunik"
        ariaLabel="Navegación principal del sitio"

        // Event handlers
        onLogoClick={handleLogoClick}
        onNavItemClick={handleNavItemClick}
        onSignInClick={handleSignInClick}
        onPrimaryCtaClick={handlePrimaryCtaClick}
        onMobileMenuToggle={handleMobileMenuToggle}

        // Visual states
        isMobileMenuOpen={state.mobileMenu.isOpen}
        activeNavItem={state.currentSection}
        isScrolled={!isAtTop}
        isVisible={computedNavbarVisible}
        isCompactMode={isCompactMode}
        cssVariables={getCSSVariables()}
      />

      {/* Mega Menu Container */}
      {hasActiveMegaMenu && (
        <MegaMenuContainer
          menuId={activeMenu}
          navigationItems={state.navigationItems}
          interactionMode={interactionMode}
          onClose={() => closeMenu(activeMenu)}
          onNavigate={(href) => {
            router.push(href);
            closeMenu(activeMenu);
            onNavigate?.(href);
          }}
          getMenuProps={getMenuProps}
        />
      )}

      {/* Mobile Menu */}
      <MobileMenuContainer
        isOpen={state.mobileMenu.isOpen}
        navigationItems={state.navigationItems}
        ctaConfig={state.ctaConfig}
        isScrolled={!isAtTop}
        onClose={handleMobileMenuClose}
        onNavigate={(href) => {
          router.push(href);
          handleMobileMenuClose();
          onNavigate?.(href);
        }}
      />

      {/* Spacer to prevent content overlap */}
      {config?.sticky !== false && (
        <div className="h-16 sm:h-18" aria-hidden="true" />
      )}
    </>
  );
};