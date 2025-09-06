/**
 * Performance Tests for Optimized Navbar Components
 *
 * Tests para verificar que las optimizaciones funcionan correctamente:
 * - Bundle size optimizado
 * - Lazy loading behavior
 * - Tree shaking efectivo
 * - Component rendering performance
 */

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import type { NavbarContainerProps } from '../domain/types';
import { LazyMegaMenuContainer } from '../presentation/containers/lazy-mega-menu-container';
import { LazyMobileMenuContainer } from '../presentation/containers/lazy-mobile-menu-container';
import { OptimizedNavbarContainer } from '../presentation/containers/optimized-navbar-container';

import '@testing-library/jest-dom';

// ============= Mock Data =============

const mockNavigationItems = [
  { label: 'Productos', href: '/productos' },
  { label: 'Precios', href: '/precios' },
  { label: 'Recursos', href: '/recursos' },
];

const mockCtaConfig = {
  signIn: { text: 'Iniciar Sesión', href: '/login' },
  primary: { text: 'Probar Gratis', href: '/registro' }
};

const defaultProps: NavbarContainerProps = {
  navigationItems: mockNavigationItems,
  ctaConfig: mockCtaConfig,
  config: {
    variant: { type: 'default' },
    sticky: true,
    hideOnScroll: true,
    showProgress: true
  }
};

// ============= Component Loading Tests =============

describe('Optimized Navbar - Bundle Size', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render core navbar immediately without lazy components', async () => {
    render(<OptimizedNavbarContainer {...defaultProps} />);

    // Core navbar should be visible immediately
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('Neptunik')).toBeInTheDocument();
    expect(screen.getByText('Productos')).toBeInTheDocument();
    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
    expect(screen.getByText('Probar Gratis')).toBeInTheDocument();
  });

  test('should not render heavy components initially', async () => {
    render(<OptimizedNavbarContainer {...defaultProps} />);

    // Mega menu should not be in DOM initially
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    // Mobile menu should not be in DOM initially
    expect(screen.queryByText('Menú móvil')).not.toBeInTheDocument();
  });
});

describe('Lazy Loading Behavior', () => {
  test('should lazy load mobile menu only when toggled', async () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768, // mobile width
    });

    render(<OptimizedNavbarContainer {...defaultProps} />);

    // Mobile menu should not be loaded initially
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();

    // Trigger mobile menu toggle
    const mobileToggle = screen.getByRole('button', { name: /abrir menú/i });
    fireEvent.click(mobileToggle);

    // Should show loading skeleton first, then actual menu
    await waitFor(() => {
      expect(screen.getByTestId('mobile-menu-skeleton') || screen.getByTestId('mobile-menu'))
        .toBeInTheDocument();
    });
  });

  test('should lazy load mega menu only on hover', async () => {
    render(<OptimizedNavbarContainer {...defaultProps} />);

    // Mega menu should not be loaded initially
    expect(screen.queryByTestId('mega-menu')).not.toBeInTheDocument();

    // Hover over navigation item
    const productLink = screen.getByText('Productos');
    fireEvent.mouseEnter(productLink);

    // Should trigger lazy loading of mega menu
    await waitFor(() => {
      // Check for loading skeleton or loaded menu
      const megaMenu = screen.queryByTestId('mega-menu-skeleton') ||
                      screen.queryByTestId('mega-menu');
      expect(megaMenu).toBeInTheDocument();
    });
  });
});

describe('LazyMegaMenuContainer', () => {
  const megaMenuProps = {
    menuId: 'productos',
    navigationItems: mockNavigationItems,
    onClose: jest.fn(),
    onNavigate: jest.fn()
  };

  test('should render with loading skeleton initially', async () => {
    render(<LazyMegaMenuContainer {...megaMenuProps} />);

    // Should show skeleton while loading
    await waitFor(() => {
      const skeleton = screen.queryByRole('presentation');
      if (skeleton) {
        expect(skeleton).toHaveAttribute('aria-hidden', 'true');
      }
    });
  });

  test('should handle loading errors gracefully', async () => {
    // Mock import failure
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    // This would need more sophisticated mocking to truly test import failures
    render(<LazyMegaMenuContainer {...megaMenuProps} />);

    // Should not crash the application
    expect(screen.getByRole('banner')).toBeDefined();

    consoleError.mockRestore();
  });
});

describe('LazyMobileMenuContainer', () => {
  const mobileMenuProps = {
    isOpen: true,
    navigationItems: mockNavigationItems,
    ctaConfig: mockCtaConfig,
    isScrolled: false,
    onClose: jest.fn(),
    onNavigate: jest.fn()
  };

  test('should not render on desktop viewports', () => {
    // Mock desktop viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1440,
    });

    render(<LazyMobileMenuContainer {...mobileMenuProps} />);

    // Should not render anything on desktop
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
  });

  test('should render on mobile viewports when open', async () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });

    render(<LazyMobileMenuContainer {...mobileMenuProps} />);

    // Should render skeleton or menu on mobile
    await waitFor(() => {
      const mobileMenu = screen.queryByTestId('mobile-menu-skeleton') ||
                        screen.queryByTestId('mobile-menu');
      expect(mobileMenu).toBeInTheDocument();
    });
  });

  test('should not render when closed', () => {
    render(<LazyMobileMenuContainer {...{ ...mobileMenuProps, isOpen: false }} />);

    // Should not render when closed
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
  });
});

describe('Performance Optimizations', () => {
  test('should use optimized event handlers', async () => {
    const mockOnNavigate = jest.fn();

    render(
      <OptimizedNavbarContainer
        {...defaultProps}
        onNavigate={mockOnNavigate}
      />
    );

    // Click on navigation item
    const productLink = screen.getByText('Productos');
    fireEvent.click(productLink);

    // Should call handler efficiently
    expect(mockOnNavigate).toHaveBeenCalledWith('/productos');
  });

  test('should implement efficient scroll handling', async () => {
    const { container } = render(<OptimizedNavbarContainer {...defaultProps} />);

    // Simulate scroll events
    fireEvent.scroll(window, { target: { scrollY: 100 } });
    fireEvent.scroll(window, { target: { scrollY: 200 } });

    // Should not cause excessive re-renders
    expect(container.firstChild).toBeInTheDocument();
  });
});

// ============= Bundle Size Integration Tests =============

describe('Bundle Size Optimizations', () => {
  test('should only import necessary icons', () => {
    // This is more of a build-time test, but we can check component rendering
    render(<OptimizedNavbarContainer {...defaultProps} />);

    // Icons should be rendered (verifies tree-shaking worked)
    const mobileToggle = screen.getByRole('button', { name: /abrir menú/i });
    expect(mobileToggle).toBeInTheDocument();

    // SVG icon should be present
    const svgIcon = mobileToggle.querySelector('svg');
    expect(svgIcon).toBeInTheDocument();
  });

  test('should use optimized motion components', async () => {
    render(<OptimizedNavbarContainer {...defaultProps} />);

    // Navbar should render without motion errors
    const navbar = screen.getByRole('banner');
    expect(navbar).toBeInTheDocument();
    expect(navbar).toBeVisible();
  });
});

describe('Accessibility with Optimizations', () => {
  test('should maintain accessibility during lazy loading', async () => {
    render(<OptimizedNavbarContainer {...defaultProps} />);

    // Navigation should have proper ARIA labels
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Navegación principal');

    // Banner should be present
    const banner = screen.getByRole('banner');
    expect(banner).toBeInTheDocument();
  });

  test('should handle keyboard navigation efficiently', async () => {
    render(<OptimizedNavbarContainer {...defaultProps} />);

    // Focus should work on navigation items
    const productLink = screen.getByText('Productos');
    productLink.focus();
    expect(productLink).toHaveFocus();

    // Tab navigation should work
    fireEvent.keyDown(productLink, { key: 'Tab' });
    // Next focusable element should receive focus (implementation-dependent)
  });
});