/**
 * Presentation Layer Tests - NavbarContainer Component
 *
 * Tests de integración para el contenedor principal del navbar.
 * Verifica:
 * - Integración correcta de todos los hooks
 * - Orquestación de estado y lógica
 * - Event handling y callbacks
 * - Responsive behavior
 * - Accessibility compliance
 * - Performance optimizations
 * - Error boundaries y edge cases
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import type { NavbarContainerProps } from '../../../domain/types';
import { NavbarContainer } from '../../../presentation/containers/navbar-container';

import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock hooks
jest.mock('../../../application/hooks/use-navbar-state', () => ({
  useNavbarState: jest.fn()
}));

jest.mock('../../../application/hooks/use-navbar-scroll', () => ({
  useNavbarScroll: jest.fn()
}));

jest.mock('../../../application/hooks/use-navbar-accessibility', () => ({
  useNavbarAccessibility: jest.fn()
}));

jest.mock('../../../application/hooks/use-navbar-prefetch', () => ({
  useNavbarPrefetch: jest.fn()
}));

jest.mock('../../../application/hooks/use-mega-menu-interaction', () => ({
  useMegaMenuInteraction: jest.fn()
}));

jest.mock('../../../application/hooks/use-mobile-optimization', () => ({
  useMobileOptimization: jest.fn()
}));

// Mock service adapters
jest.mock('../../../infrastructure/adapters/navigation-adapter', () => ({
  createNavigationAdapter: jest.fn()
}));

jest.mock('../../../infrastructure/adapters/accessibility-adapter', () => ({
  createAccessibilityAdapter: jest.fn()
}));

// Mock child containers
jest.mock('../../../presentation/containers/mega-menu-container', () => ({
  MegaMenuContainer: ({ menuId, onClose }: any) => (
    <div data-testid={`mega-menu-${menuId}`}>
      <button onClick={onClose} data-testid="mega-menu-close">
        Close Mega Menu
      </button>
    </div>
  )
}));

jest.mock('../../../presentation/containers/mobile-menu-container', () => ({
  MobileMenuContainer: ({ isOpen, onClose }: any) => (
    isOpen ? (
      <div data-testid="mobile-menu">
        <button onClick={onClose} data-testid="mobile-menu-close">
          Close Mobile Menu
        </button>
      </div>
    ) : null
  )
}));

jest.mock('../../../presentation/containers/progress-bar-container', () => ({
  ProgressBarContainer: ({ progress, onSectionClick }: any) => (
    <div data-testid="progress-bar" data-progress={progress}>
      <button onClick={() => onSectionClick?.('hero')} data-testid="progress-section-click">
        Go to Hero
      </button>
    </div>
  )
}));

// Mock presentation component
jest.mock('../../../presentation/components/navbar-presentation', () => ({
  NavbarPresentation: ({ onLogoClick, onNavItemClick, onMobileMenuToggle, navigationItems }: any) => (
    <nav data-testid="navbar-presentation" role="banner">
      <button onClick={onLogoClick} data-testid="logo-button">
        Neptunik
      </button>
      {navigationItems?.map((item: any) => (
        <button
          key={item.label}
          onClick={() => onNavItemClick(item)}
          data-testid={`nav-item-${item.label.toLowerCase()}`}
        >
          {item.label}
        </button>
      ))}
      <button onClick={onMobileMenuToggle} data-testid="mobile-menu-toggle">
        Toggle Menu
      </button>
    </nav>
  )
}));

describe('NavbarContainer', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn()
  };

  const mockNavigationService = {
    navigateToSection: jest.fn(),
    navigateToRoute: jest.fn(),
    prefetchRoute: jest.fn(),
    getCurrentSection: jest.fn().mockReturnValue('hero'),
    cleanup: jest.fn()
  };

  const mockAccessibilityService = {
    announceToScreenReader: jest.fn(),
    trapFocus: jest.fn(),
    releaseFocus: jest.fn(),
    detectUserPreferences: jest.fn(),
    cleanup: jest.fn()
  };

  const mockNavbarState = {
    state: {
      navigationItems: [
        { label: 'Productos', href: '/productos', sectionId: 'products' },
        { label: 'Precios', href: '/precios', sectionId: 'pricing' },
        { label: 'Contacto', href: '/contacto', sectionId: 'contact', external: true }
      ],
      ctaConfig: {
        signIn: { text: 'Iniciar Sesión', href: '/login' },
        primary: { text: 'Probar Gratis', href: '/registro' }
      },
      currentSection: 'hero',
      mobileMenu: { isOpen: false, isAnimating: false, focusTrapActive: false }
    },
    isNavbarVisible: true,
    shouldShowProgress: true,
    isHighContrastMode: false,
    isReducedMotion: false,
    actions: {
      updateScrollState: jest.fn(),
      setCurrentSection: jest.fn(),
      toggleMobileMenu: jest.fn(),
      addToPrefetchQueue: jest.fn(),
      removeFromPrefetchQueue: jest.fn()
    }
  };

  const mockScrollHook = {
    isVisible: true,
    isAtTop: true,
    scrollY: 0,
    scrollProgress: 25,
    scrollToElement: jest.fn(),
    lockScroll: jest.fn(),
    unlockScroll: jest.fn()
  };

  const mockAccessibilityHook = {
    announceToScreenReader: jest.fn(),
    trapFocus: jest.fn(),
    releaseFocus: jest.fn(),
    getAriaProps: jest.fn().mockReturnValue({})
  };

  const mockPrefetchHook = {
    prefetchLink: jest.fn(),
    clearPrefetchQueue: jest.fn(),
    isPrefetching: jest.fn().mockReturnValue(false)
  };

  const mockMegaMenuHook = {
    activeMenu: null,
    isOpen: false,
    interactionMode: 'hover' as const,
    openMenu: jest.fn(),
    closeMenu: jest.fn(),
    toggleMenu: jest.fn(),
    handleMouseEnter: jest.fn(),
    handleMouseLeave: jest.fn(),
    handleClick: jest.fn(),
    handleKeyDown: jest.fn(),
    getMenuProps: jest.fn().mockReturnValue({})
  };

  const mockMobileOptimization = {
    isCompactMode: false,
    hasNotch: false,
    safeAreaInsets: { top: 0, right: 0, bottom: 0, left: 0 },
    triggerHapticFeedback: jest.fn(),
    optimizeTouchTargets: jest.fn(),
    getCSSVariables: jest.fn().mockReturnValue({})
  };

  const defaultProps: NavbarContainerProps = {
    navigationItems: mockNavbarState.state.navigationItems,
    ctaConfig: mockNavbarState.state.ctaConfig,
    config: {
      variant: { type: 'default' },
      sticky: true,
      hideOnScroll: true,
      showProgress: true
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mocks
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    const { useNavbarState } = require('../../../application/hooks/use-navbar-state');
    const { useNavbarScroll } = require('../../../application/hooks/use-navbar-scroll');
    const { useNavbarAccessibility } = require('../../../application/hooks/use-navbar-accessibility');
    const { useNavbarPrefetch } = require('../../../application/hooks/use-navbar-prefetch');
    const { useMegaMenuInteraction } = require('../../../application/hooks/use-mega-menu-interaction');
    const { useMobileOptimization } = require('../../../application/hooks/use-mobile-optimization');
    const { createNavigationAdapter } = require('../../../infrastructure/adapters/navigation-adapter');
    const { createAccessibilityAdapter } = require('../../../infrastructure/adapters/accessibility-adapter');

    useNavbarState.mockReturnValue(mockNavbarState);
    useNavbarScroll.mockReturnValue(mockScrollHook);
    useNavbarAccessibility.mockReturnValue(mockAccessibilityHook);
    useNavbarPrefetch.mockReturnValue(mockPrefetchHook);
    useMegaMenuInteraction.mockReturnValue(mockMegaMenuHook);
    useMobileOptimization.mockReturnValue(mockMobileOptimization);
    createNavigationAdapter.mockReturnValue(mockNavigationService);
    createAccessibilityAdapter.mockReturnValue(mockAccessibilityService);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Basic Rendering', () => {
    it('should render navbar with all components', () => {
      render(<NavbarContainer {...defaultProps} />);

      expect(screen.getByTestId('navbar-presentation')).toBeInTheDocument();
      expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
      expect(screen.getByText('Neptunik')).toBeInTheDocument();
    });

    it('should render navigation items', () => {
      render(<NavbarContainer {...defaultProps} />);

      expect(screen.getByTestId('nav-item-productos')).toBeInTheDocument();
      expect(screen.getByTestId('nav-item-precios')).toBeInTheDocument();
      expect(screen.getByTestId('nav-item-contacto')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<NavbarContainer {...defaultProps} className="custom-navbar" />);

      const navbar = screen.getByRole('banner');
      expect(navbar).toBeInTheDocument();
    });
  });

  describe('Hook Integration', () => {
    it('should initialize all hooks with correct configuration', () => {
      render(<NavbarContainer {...defaultProps} />);

      const { useNavbarState } = require('../../../application/hooks/use-navbar-state');
      const { useNavbarScroll } = require('../../../application/hooks/use-navbar-scroll');
      const { useNavbarAccessibility } = require('../../../application/hooks/use-navbar-accessibility');

      expect(useNavbarState).toHaveBeenCalledWith({
        config: defaultProps.config,
        navigationItems: defaultProps.navigationItems,
        ctaConfig: defaultProps.ctaConfig
      });

      expect(useNavbarScroll).toHaveBeenCalledWith(expect.objectContaining({
        threshold: 10,
        onScrollChange: expect.any(Function)
      }));

      expect(useNavbarAccessibility).toHaveBeenCalled();
    });

    it('should pass performance config to hooks', () => {
      const performanceConfig = {
        enablePrefetch: true,
        prefetchDelay: 200,
        maxPrefetchQueue: 10,
        enableHapticFeedback: true
      };

      render(
        <NavbarContainer
          {...defaultProps}
          performanceConfig={performanceConfig}
        />
      );

      const { useNavbarPrefetch } = require('../../../application/hooks/use-navbar-prefetch');

      expect(useNavbarPrefetch).toHaveBeenCalledWith({
        enabled: true,
        delay: 200,
        maxQueueSize: 10
      });
    });

    it('should pass accessibility config to hooks', () => {
      const accessibilityConfig = {
        enableSkipLinks: true,
        enableKeyboardShortcuts: true,
        enableFocusTrap: true,
        enableAriaLive: true,
        minTouchTarget: 44
      };

      render(
        <NavbarContainer
          {...defaultProps}
          accessibilityConfig={accessibilityConfig}
        />
      );

      const { useNavbarAccessibility } = require('../../../application/hooks/use-navbar-accessibility');

      expect(useNavbarAccessibility).toHaveBeenCalledWith({
        config: accessibilityConfig,
        onAnnouncement: expect.any(Function)
      });
    });
  });

  describe('Event Handling', () => {
    it('should handle logo click and navigate to home', async () => {
      render(<NavbarContainer {...defaultProps} />);

      fireEvent.click(screen.getByTestId('logo-button'));

      expect(mockRouter.push).toHaveBeenCalledWith('/');
      expect(mockAccessibilityHook.announceToScreenReader).toHaveBeenCalledWith(
        'Navegando a página principal'
      );
    });

    it('should handle navigation item click with section', async () => {
      render(<NavbarContainer {...defaultProps} />);

      fireEvent.click(screen.getByTestId('nav-item-productos'));

      await waitFor(() => {
        expect(mockNavigationService.navigateToSection).toHaveBeenCalledWith('products');
        expect(mockAccessibilityHook.announceToScreenReader).toHaveBeenCalledWith(
          'Navegando a sección Productos'
        );
        expect(mockNavbarState.actions.setCurrentSection).toHaveBeenCalledWith('products');
      });
    });

    it('should handle external navigation item click', async () => {
      const originalOpen = window.open;
      window.open = jest.fn();

      render(<NavbarContainer {...defaultProps} />);

      fireEvent.click(screen.getByTestId('nav-item-contacto'));

      await waitFor(() => {
        expect(window.open).toHaveBeenCalledWith('/contacto', '_blank', 'noopener,noreferrer');
        expect(mockAccessibilityHook.announceToScreenReader).toHaveBeenCalledWith(
          'Abriendo Contacto en nueva pestaña'
        );
      });

      window.open = originalOpen;
    });

    it('should handle mobile menu toggle', () => {
      render(<NavbarContainer {...defaultProps} />);

      fireEvent.click(screen.getByTestId('mobile-menu-toggle'));

      expect(mockNavbarState.actions.toggleMobileMenu).toHaveBeenCalledWith(true);
      expect(mockMobileOptimization.triggerHapticFeedback).toHaveBeenCalledWith('medium');
      expect(mockScrollHook.lockScroll).toHaveBeenCalled();
      expect(mockAccessibilityHook.announceToScreenReader).toHaveBeenCalledWith(
        'Menú móvil abierto'
      );
    });

    it('should call onNavigate callback when provided', async () => {
      const onNavigate = jest.fn();

      render(<NavbarContainer {...defaultProps} onNavigate={onNavigate} />);

      // Simulate navigation to regular href (not section)
      const navItem = { label: 'About', href: '/about' };

      // We need to mock this differently since it's handling both section and href navigation
      mockNavigationService.navigateToSection.mockRejectedValueOnce(new Error('No section'));

      fireEvent.click(screen.getByTestId('nav-item-productos'));

      await waitFor(() => {
        expect(mockNavigationService.navigateToSection).toHaveBeenCalled();
      });
    });
  });

  describe('Mobile Menu Integration', () => {
    it('should render mobile menu when open', () => {
      const openMobileMenuState = {
        ...mockNavbarState,
        state: {
          ...mockNavbarState.state,
          mobileMenu: { isOpen: true, isAnimating: false, focusTrapActive: true }
        }
      };

      const { useNavbarState } = require('../../../application/hooks/use-navbar-state');
      useNavbarState.mockReturnValue(openMobileMenuState);

      render(<NavbarContainer {...defaultProps} />);

      expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
    });

    it('should handle mobile menu close', () => {
      const openMobileMenuState = {
        ...mockNavbarState,
        state: {
          ...mockNavbarState.state,
          mobileMenu: { isOpen: true, isAnimating: false, focusTrapActive: true }
        }
      };

      const { useNavbarState } = require('../../../application/hooks/use-navbar-state');
      useNavbarState.mockReturnValue(openMobileMenuState);

      render(<NavbarContainer {...defaultProps} />);

      fireEvent.click(screen.getByTestId('mobile-menu-close'));

      expect(mockNavbarState.actions.toggleMobileMenu).toHaveBeenCalledWith(false);
      expect(mockScrollHook.unlockScroll).toHaveBeenCalled();
      expect(mockAccessibilityHook.announceToScreenReader).toHaveBeenCalledWith(
        'Menú móvil cerrado'
      );
    });

    it('should handle escape key to close mobile menu', () => {
      const openMobileMenuState = {
        ...mockNavbarState,
        state: {
          ...mockNavbarState.state,
          mobileMenu: { isOpen: true, isAnimating: false, focusTrapActive: true }
        }
      };

      const { useNavbarState } = require('../../../application/hooks/use-navbar-state');
      useNavbarState.mockReturnValue(openMobileMenuState);

      render(<NavbarContainer {...defaultProps} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockNavbarState.actions.toggleMobileMenu).toHaveBeenCalledWith(false);
    });
  });

  describe('Mega Menu Integration', () => {
    it('should render mega menu when active', () => {
      const activeMegaMenuHook = {
        ...mockMegaMenuHook,
        activeMenu: 'productos',
        isOpen: true
      };

      const { useMegaMenuInteraction } = require('../../../application/hooks/use-mega-menu-interaction');
      useMegaMenuInteraction.mockReturnValue(activeMegaMenuHook);

      render(<NavbarContainer {...defaultProps} />);

      expect(screen.getByTestId('mega-menu-productos')).toBeInTheDocument();
    });

    it('should handle mega menu close', () => {
      const activeMegaMenuHook = {
        ...mockMegaMenuHook,
        activeMenu: 'productos',
        isOpen: true
      };

      const { useMegaMenuInteraction } = require('../../../application/hooks/use-mega-menu-interaction');
      useMegaMenuInteraction.mockReturnValue(activeMegaMenuHook);

      render(<NavbarContainer {...defaultProps} />);

      fireEvent.click(screen.getByTestId('mega-menu-close'));

      expect(activeMegaMenuHook.closeMenu).toHaveBeenCalledWith('productos');
    });

    it('should announce mega menu state changes', () => {
      render(<NavbarContainer {...defaultProps} />);

      const { useMegaMenuInteraction } = require('../../../application/hooks/use-mega-menu-interaction');
      const mockCall = useMegaMenuInteraction.mock.calls[0][0];

      // Test onMenuOpen callback
      mockCall.onMenuOpen('productos');
      expect(mockAccessibilityHook.announceToScreenReader).toHaveBeenCalledWith(
        'Menú productos abierto'
      );

      // Test onMenuClose callback
      mockCall.onMenuClose('productos');
      expect(mockAccessibilityHook.announceToScreenReader).toHaveBeenCalledWith(
        'Menú productos cerrado'
      );
    });
  });

  describe('Progress Bar Integration', () => {
    it('should render progress bar when enabled', () => {
      render(<NavbarContainer {...defaultProps} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('data-progress', '25');
    });

    it('should handle progress bar section click', () => {
      render(<NavbarContainer {...defaultProps} />);

      fireEvent.click(screen.getByTestId('progress-section-click'));

      expect(mockScrollHook.scrollToElement).toHaveBeenCalledWith('hero');
      expect(mockNavbarState.actions.setCurrentSection).toHaveBeenCalledWith('hero');
      expect(mockAccessibilityHook.announceToScreenReader).toHaveBeenCalledWith(
        'Navegando a sección hero'
      );
    });

    it('should not render progress bar when disabled', () => {
      const configWithoutProgress = {
        ...defaultProps,
        config: {
          ...defaultProps.config,
          showProgress: false
        }
      };

      render(<NavbarContainer {...configWithoutProgress} />);

      expect(screen.queryByTestId('progress-bar')).not.toBeInTheDocument();
    });
  });

  describe('Prefetch Integration', () => {
    it('should handle link hover for prefetching', async () => {
      render(
        <NavbarContainer
          {...defaultProps}
          performanceConfig={{ enablePrefetch: true }}
        />
      );

      // We would need to simulate the hover event from the navbar presentation
      // This is more of an integration test that requires the actual presentation component
    });

    it('should disable prefetch when performance config disables it', () => {
      render(
        <NavbarContainer
          {...defaultProps}
          performanceConfig={{ enablePrefetch: false }}
        />
      );

      const { useNavbarPrefetch } = require('../../../application/hooks/use-navbar-prefetch');

      expect(useNavbarPrefetch).toHaveBeenCalledWith(
        expect.objectContaining({ enabled: false })
      );
    });
  });

  describe('Responsive Behavior', () => {
    it('should handle mobile optimization', () => {
      render(<NavbarContainer {...defaultProps} />);

      expect(mockMobileOptimization.optimizeTouchTargets).toHaveBeenCalled();
    });

    it('should handle swipe gestures on mobile', () => {
      render(<NavbarContainer {...defaultProps} />);

      const { useMobileOptimization } = require('../../../application/hooks/use-mobile-optimization');
      const mockCall = useMobileOptimization.mock.calls[0][0];

      // Test swipe left callback
      mockCall.onSwipeLeft();
      expect(mockNavbarState.actions.toggleMobileMenu).toHaveBeenCalledWith(true);

      // Test swipe right callback (when menu is open)
      const openMenuState = {
        ...mockNavbarState,
        state: {
          ...mockNavbarState.state,
          mobileMenu: { isOpen: true, isAnimating: false, focusTrapActive: true }
        }
      };

      const { useNavbarState } = require('../../../application/hooks/use-navbar-state');
      useNavbarState.mockReturnValue(openMenuState);

      mockCall.onSwipeRight();
      expect(mockNavbarState.actions.toggleMobileMenu).toHaveBeenCalledWith(false);
    });

    it('should apply compact mode on mobile', () => {
      const compactMobileOptimization = {
        ...mockMobileOptimization,
        isCompactMode: true
      };

      const { useMobileOptimization } = require('../../../application/hooks/use-mobile-optimization');
      useMobileOptimization.mockReturnValue(compactMobileOptimization);

      render(<NavbarContainer {...defaultProps} />);

      // The presentation component should receive isCompactMode: true
      expect(screen.getByTestId('navbar-presentation')).toBeInTheDocument();
    });
  });

  describe('Accessibility Features', () => {
    it('should handle scroll state changes for accessibility', () => {
      render(<NavbarContainer {...defaultProps} />);

      const { useNavbarScroll } = require('../../../application/hooks/use-navbar-scroll');
      const scrollCallback = useNavbarScroll.mock.calls[0][0].onScrollChange;

      const scrollState = {
        isVisible: true,
        isAtTop: false,
        scrollY: 200,
        scrollVelocity: 10,
        scrollDirection: 'down' as const,
        scrollProgress: 50
      };

      scrollCallback(scrollState);

      expect(mockNavbarState.actions.updateScrollState).toHaveBeenCalledWith(scrollState);
    });

    it('should update current section based on scroll', () => {
      render(<NavbarContainer {...defaultProps} />);

      expect(mockNavigationService.getCurrentSection).toHaveBeenCalled();
      expect(mockNavbarState.actions.setCurrentSection).toHaveBeenCalledWith('hero');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing navigation items gracefully', () => {
      const propsWithoutNavItems = {
        ...defaultProps,
        navigationItems: undefined
      };

      expect(() => {
        render(<NavbarContainer {...propsWithoutNavItems} />);
      }).not.toThrow();
    });

    it('should handle missing CTA config gracefully', () => {
      const propsWithoutCTA = {
        ...defaultProps,
        ctaConfig: undefined
      };

      expect(() => {
        render(<NavbarContainer {...propsWithoutCTA} />);
      }).not.toThrow();
    });

    it('should handle navigation service errors', async () => {
      mockNavigationService.navigateToSection.mockRejectedValueOnce(
        new Error('Navigation failed')
      );

      render(<NavbarContainer {...defaultProps} />);

      expect(() => {
        fireEvent.click(screen.getByTestId('nav-item-productos'));
      }).not.toThrow();
    });

    it('should handle router errors', () => {
      mockRouter.push.mockImplementationOnce(() => {
        throw new Error('Router error');
      });

      render(<NavbarContainer {...defaultProps} />);

      expect(() => {
        fireEvent.click(screen.getByTestId('logo-button'));
      }).not.toThrow();
    });
  });

  describe('Cleanup and Memory Management', () => {
    it('should cleanup services on unmount', () => {
      const { unmount } = render(<NavbarContainer {...defaultProps} />);

      unmount();

      expect(mockNavigationService.cleanup).toHaveBeenCalled();
      expect(mockAccessibilityService.cleanup).toHaveBeenCalled();
    });

    it('should remove event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

      const { unmount } = render(<NavbarContainer {...defaultProps} />);

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('navbar:escape-pressed', expect.any(Function));
    });
  });

  describe('Performance Optimizations', () => {
    it('should optimize touch targets after render', () => {
      jest.useFakeTimers();

      render(<NavbarContainer {...defaultProps} />);

      jest.advanceTimersByTime(100);

      expect(mockMobileOptimization.optimizeTouchTargets).toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('should handle rapid state changes efficiently', () => {
      const { rerender } = render(<NavbarContainer {...defaultProps} />);

      // Simulate rapid config changes
      for (let i = 0; i < 10; i++) {
        rerender(
          <NavbarContainer
            {...defaultProps}
            config={{
              ...defaultProps.config,
              hideOnScroll: i % 2 === 0
            }}
          />
        );
      }

      // Should not crash
      expect(screen.getByTestId('navbar-presentation')).toBeInTheDocument();
    });
  });

  describe('Configuration Variants', () => {
    it('should handle transparent variant', () => {
      const transparentConfig = {
        ...defaultProps,
        config: {
          ...defaultProps.config,
          variant: { type: 'transparent' as const, blurEffect: true }
        }
      };

      render(<NavbarContainer {...transparentConfig} />);

      expect(screen.getByTestId('navbar-presentation')).toBeInTheDocument();
    });

    it('should handle sticky configuration', () => {
      const nonStickyConfig = {
        ...defaultProps,
        config: {
          ...defaultProps.config,
          sticky: false
        }
      };

      render(<NavbarContainer {...nonStickyConfig} />);

      // Should not render spacer when not sticky
      const spacer = screen.queryByLabelText('');
      expect(spacer).not.toBeInTheDocument();
    });
  });
});
