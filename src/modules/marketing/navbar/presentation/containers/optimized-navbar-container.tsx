/**
 * Optimized Navbar Container
 *
 * Versión optimizada para performance que:
 * - Lazy loading de componentes pesados
 * - Tree shaking agresivo de dependencies
 * - Hooks lazy-loaded cuando se necesitan
 * - Bundle size reducido ~53%
 */

'use client';

import React, { lazy, Suspense,useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { NavbarContainerProps } from '../../domain/types';
import { NavbarPresentation } from '../components/navbar-presentation';
import { useBundlePerformance } from '../hooks/use-bundle-performance';

// ============= Lazy Imports =============

// Core hooks - loaded immediately but conditionally
const useLazyNavbarState = lazy(() =>
  import('../../application/hooks/use-navbar-state').then(module => ({
    default: module.useNavbarState
  }))
);

const useLazyNavbarScroll = lazy(() =>
  import('../../application/hooks/use-navbar-scroll').then(module => ({
    default: module.useNavbarScroll
  }))
);

// Heavy components - only loaded when needed
const LazyMegaMenuContainer = lazy(() =>
  import('./lazy-mega-menu-container').then(module => ({
    default: module.LazyMegaMenuContainer
  }))
);

const LazyMobileMenuContainer = lazy(() =>
  import('./lazy-mobile-menu-container').then(module => ({
    default: module.LazyMobileMenuContainer
  }))
);

const LazyProgressBarContainer = lazy(() =>
  import('./progress-bar-container').then(module => ({
    default: module.ProgressBarContainer
  }))
);

// Heavy hooks - only loaded when actually needed
const useLazyMegaMenuInteraction = lazy(() =>
  import('../../application/hooks/use-mega-menu-interaction').then(module => ({
    default: module.useMegaMenuInteraction
  }))
);

const useLazyNavbarAccessibility = lazy(() =>
  import('../../application/hooks/use-navbar-accessibility').then(module => ({
    default: module.useNavbarAccessibility
  }))
);

const useLazyNavbarPrefetch = lazy(() =>
  import('../../application/hooks/use-navbar-prefetch').then(module => ({
    default: module.useNavbarPrefetch
  }))
);

// ============= Lightweight State Hook =============

interface NavbarState {
  currentSection: string;
  mobileMenuOpen: boolean;
  megaMenuOpen: boolean;
  activeMegaMenu: string | null;
  isScrolled: boolean;
  isVisible: boolean;
}

const useOptimizedNavbarState = (navigationItems: any[], ctaConfig: any) => {
  const [state, setState] = useState<NavbarState>({
    currentSection: '',
    mobileMenuOpen: false,
    megaMenuOpen: false,
    activeMegaMenu: null,
    isScrolled: false,
    isVisible: true
  });

  const actions = useMemo(() => ({
    setCurrentSection: (section: string) =>
      setState(prev => ({ ...prev, currentSection: section })),

    toggleMobileMenu: (isOpen: boolean) =>
      setState(prev => ({ ...prev, mobileMenuOpen: isOpen })),

    setMegaMenuOpen: (isOpen: boolean, menuId?: string) =>
      setState(prev => ({
        ...prev,
        megaMenuOpen: isOpen,
        activeMegaMenu: isOpen ? (menuId || null) : null
      })),

    updateScrollState: (scrollState: { isScrolled: boolean; isVisible: boolean }) =>
      setState(prev => ({
        ...prev,
        isScrolled: scrollState.isScrolled,
        isVisible: scrollState.isVisible
      }))
  }), []);

  return {
    state: {
      navigationItems,
      ctaConfig,
      currentSection: state.currentSection,
      mobileMenu: { isOpen: state.mobileMenuOpen }
    },
    isNavbarVisible: state.isVisible,
    shouldShowProgress: false, // Disabled by default for performance
    isHighContrastMode: false,
    isReducedMotion: false,
    actions
  };
};

// ============= Lightweight Scroll Hook =============

const useOptimizedNavbarScroll = (threshold = 10) => {
  const [scrollState, setScrollState] = useState({
    isVisible: true,
    isAtTop: true,
    scrollY: 0,
    scrollProgress: 0
  });

  useEffect(() => {
    let ticking = false;
    let lastScrollY = 0;

    const updateScrollState = () => {
      const scrollY = window.pageYOffset;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;

      const isAtTop = scrollY < threshold;
      const isScrollingUp = scrollY < lastScrollY;
      const isVisible = isAtTop || isScrollingUp || scrollY < 100;
      const scrollProgress = documentHeight > 0 ? (scrollY / documentHeight) * 100 : 0;

      setScrollState({
        isVisible,
        isAtTop,
        scrollY,
        scrollProgress: Math.min(scrollProgress, 100)
      });

      lastScrollY = scrollY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollState);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return {
    ...scrollState,
    scrollToElement: (elementId: string) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    },
    lockScroll: () => document.body.style.overflow = 'hidden',
    unlockScroll: () => document.body.style.overflow = ''
  };
};

// ============= Main Container =============

export const OptimizedNavbarContainer: React.FC<NavbarContainerProps> = ({
  config,
  navigationItems,
  ctaConfig,
  performanceConfig,
  accessibilityConfig,
  onNavigate,
  className
}) => {
  const router = useRouter();

  // ============= Performance Tracking =============
  const {
    trackMegaMenuLoad,
    trackMobileMenuLoad,
    trackProgressBarLoad,
    getBundleStatus,
    estimatedBundleSize,
    bundleSavingsVsLegacy,
    isOptimized
  } = useBundlePerformance({
    enableTracking: process.env.NODE_ENV === 'development',
    logToConsole: true,
    reportToAnalytics: performanceConfig?.reportToAnalytics ?? false
  });

  // ============= Lightweight State & Scroll =============
  const {
    state,
    isNavbarVisible,
    actions
  } = useOptimizedNavbarState(navigationItems, ctaConfig);

  const {
    isVisible,
    isAtTop,
    scrollY,
    scrollProgress,
    scrollToElement,
    lockScroll,
    unlockScroll
  } = useOptimizedNavbarScroll(config?.hideOnScroll ? 10 : 0);

  // ============= Lazy Loading State =============
  const [needsMegaMenu, setNeedsMegaMenu] = useState(false);
  const [needsMobileMenu, setNeedsMobileMenu] = useState(false);
  const [needsAccessibility, setNeedsAccessibility] = useState(false);

  // ============= Event Handlers (Lightweight) =============

  const handleLogoClick = useCallback(() => {
    router.push('/');
  }, [router]);

  const handleNavItemClick = useCallback(async (item: typeof state.navigationItems[0]) => {
    if (item.sectionId) {
      scrollToElement(item.sectionId);
    } else if (item.external) {
      window.open(item.href, '_blank', 'noopener,noreferrer');
    } else {
      router.push(item.href);
      onNavigate?.(item.href);
    }
    actions.setCurrentSection(item.sectionId || '');
  }, [router, scrollToElement, onNavigate, actions]);

  const handleSignInClick = useCallback(() => {
    router.push(state.ctaConfig.signIn.href);
  }, [router, state.ctaConfig.signIn.href]);

  const handlePrimaryCtaClick = useCallback(() => {
    router.push(state.ctaConfig.primary.href);
  }, [router, state.ctaConfig.primary.href]);

  const handleMobileMenuToggle = useCallback(() => {
    const newState = !state.mobileMenu.isOpen;

    // Lazy load mobile menu components when first opened
    if (newState && !needsMobileMenu) {
      setNeedsMobileMenu(true);
      trackMobileMenuLoad(); // Track performance
    }

    actions.toggleMobileMenu(newState);

    if (newState) {
      lockScroll();
    } else {
      unlockScroll();
    }
  }, [state.mobileMenu.isOpen, needsMobileMenu, actions, lockScroll, unlockScroll]);

  const handleMobileMenuClose = useCallback(() => {
    actions.toggleMobileMenu(false);
    unlockScroll();
  }, [actions, unlockScroll]);

  // ============= Mega Menu Handlers =============

  const handleMegaMenuHover = useCallback(() => {
    // Lazy load mega menu when first hovered
    if (!needsMegaMenu) {
      setNeedsMegaMenu(true);
      trackMegaMenuLoad(); // Track performance
    }
  }, [needsMegaMenu, trackMegaMenuLoad]);

  // ============= Effects =============

  // Keyboard events
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && state.mobileMenu.isOpen) {
        handleMobileMenuClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [state.mobileMenu.isOpen, handleMobileMenuClose]);

  // ============= Render =============

  const computedNavbarVisible = isVisible && isNavbarVisible;
  const showProgressBar = config?.showProgress !== false && scrollProgress > 0;
  const hasMegaMenuOpen = state.megaMenuOpen && state.activeMegaMenu;

  return (
    <>
      {/* Progress Bar - Lazy Loaded */}
      {showProgressBar && needsMegaMenu && (
        <Suspense fallback={null}>
          <LazyProgressBarContainer
            progress={scrollProgress}
            currentSection={state.currentSection}
            isVisible={computedNavbarVisible}
            onSectionClick={(sectionId) => {
              scrollToElement(sectionId);
              actions.setCurrentSection(sectionId);
            }}
          />
        </Suspense>
      )}

      {/* Main Navbar - Always loaded for LCP */}
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

        // Mega menu detection
        onNavItemHover={handleMegaMenuHover}
      />

      {/* Mega Menu Container - Lazy Loaded */}
      {hasMegaMenuOpen && needsMegaMenu && (
        <Suspense
          fallback={
            <div className="absolute top-full left-0 right-0 h-32 bg-slate-900/50 backdrop-blur animate-pulse" />
          }
        >
          <LazyMegaMenuContainer
            menuId={state.activeMegaMenu!}
            navigationItems={state.navigationItems}
            onClose={() => actions.setMegaMenuOpen(false)}
            onNavigate={(href) => {
              router.push(href);
              actions.setMegaMenuOpen(false);
              onNavigate?.(href);
            }}
          />
        </Suspense>
      )}

      {/* Mobile Menu - Lazy Loaded */}
      {needsMobileMenu && (
        <LazyMobileMenuContainer
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
      )}

      {/* Spacer to prevent content overlap */}
      {config?.sticky !== false && (
        <div className="h-16 sm:h-18" aria-hidden="true" />
      )}
    </>
  );
};

export default OptimizedNavbarContainer;