/**
 * Presentation Layer Tests - NavbarLinkPure Component
 * 
 * Tests completos para el componente NavbarLinkPure.
 * Verifica:
 * - Renderizado correcto con diferentes props
 * - Estados visuales (activo, hover, focus)
 * - Variantes de enlace (default, button, cta)
 * - Accesibilidad (ARIA, screen reader)
 * - Event handlers
 * - Props condicionales
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NavbarLinkPure, type NavbarLinkPureProps } from '../../../presentation/components/navbar-link-pure';

// Mock AnimatedLink component
jest.mock('@/shared/components/ui/animated-link', () => ({
  AnimatedLink: ({ children, href, className, onClick, onMouseEnter, onMouseLeave, onFocus, onBlur, ...props }: any) => (
    <a
      href={href}
      className={className}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      {...props}
      data-testid="animated-link"
    >
      {children}
    </a>
  )
}));

// Mock utility function
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

describe('NavbarLinkPure', () => {
  const defaultProps: NavbarLinkPureProps = {
    href: '/test',
    children: 'Test Link'
  };

  const mockHandlers = {
    onMouseEnter: jest.fn(),
    onMouseLeave: jest.fn(),
    onClick: jest.fn(),
    onFocus: jest.fn(),
    onBlur: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with minimum required props', () => {
      render(<NavbarLinkPure {...defaultProps} />);
      
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
      expect(link).toHaveTextContent('Test Link');
    });

    it('should render children correctly', () => {
      const customChildren = (
        <>
          <span>Custom</span>
          <span>Content</span>
        </>
      );
      
      render(
        <NavbarLinkPure {...defaultProps}>
          {customChildren}
        </NavbarLinkPure>
      );
      
      expect(screen.getByText('Custom')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps} 
          className="custom-class"
        />
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveClass('custom-class');
    });

    it('should set role attribute correctly', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps} 
          role="menuitem"
        />
      );
      
      const link = screen.getByRole('menuitem');
      expect(link).toBeInTheDocument();
    });
  });

  describe('Visual States', () => {
    it('should apply active state styling', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          isActive={true}
          activeClassName="active-custom"
        />
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveClass('active-custom');
    });

    it('should apply default active styling when no custom class provided', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          isActive={true}
        />
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveClass('text-yellow-400', 'font-semibold');
    });

    it('should apply hover state styling', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          isHovered={true}
          hoverClassName="hover-custom"
        />
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveClass('hover-custom');
    });

    it('should apply default hover styling when no custom class provided', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          isHovered={true}
        />
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveClass('text-white');
    });

    it('should apply focus state styling', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          isFocused={true}
        />
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveClass('ring-2', 'ring-yellow-400/50', 'ring-offset-2');
    });

    it('should apply prefetching state styling', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          isPrefetching={true}
        />
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveClass('opacity-70', 'cursor-wait');
    });

    it('should combine multiple states', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          isActive={true}
          isHovered={true}
          isFocused={true}
        />
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveClass('text-yellow-400', 'text-white', 'ring-2');
    });
  });

  describe('Link Variants', () => {
    it('should render default variant correctly', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          variant="default"
        />
      );
      
      const link = screen.getByTestId('animated-link');
      expect(link).toHaveAttribute('data-testid', 'animated-link');
    });

    it('should render button variant correctly', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          variant="button"
        />
      );
      
      const link = screen.getByTestId('animated-link');
      expect(link).toBeInTheDocument();
    });

    it('should render CTA primary variant correctly', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          variant="cta-primary"
        />
      );
      
      const link = screen.getByTestId('animated-link');
      expect(link).toHaveAttribute('variant', 'cta-primary');
    });

    it('should render CTA secondary variant correctly', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          variant="cta-secondary"
        />
      );
      
      const link = screen.getByTestId('animated-link');
      expect(link).toHaveAttribute('variant', 'cta-secondary');
    });
  });

  describe('Icons and Badges', () => {
    it('should render icon when provided', () => {
      const TestIcon = () => <svg data-testid="test-icon">test</svg>;
      
      render(
        <NavbarLinkPure 
          {...defaultProps}
          icon={<TestIcon />}
        />
      );
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByTestId('test-icon').closest('span')).toHaveAttribute('aria-hidden', 'true');
    });

    it('should render badge when provided', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          badge="5"
        />
      );
      
      const badge = screen.getByText('5');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('aria-label', '5 items');
      expect(badge).toHaveClass('inline-flex', 'bg-yellow-400/20', 'text-yellow-400');
    });

    it('should render numeric badge correctly', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          badge={42}
        />
      );
      
      const badge = screen.getByText('42');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('aria-label', '42 items');
    });
  });

  describe('External Links', () => {
    it('should render external icon when showExternalIcon is true', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          external={true}
          showExternalIcon={true}
        />
      );
      
      const externalIcon = screen.getByRole('link').querySelector('svg');
      expect(externalIcon).toBeInTheDocument();
      expect(externalIcon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should not render external icon when showExternalIcon is false', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          external={true}
          showExternalIcon={false}
        />
      );
      
      const externalIcon = screen.getByRole('link').querySelector('svg');
      expect(externalIcon).not.toBeInTheDocument();
    });

    it('should include screen reader text for external links', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          external={true}
        />
      );
      
      const srText = screen.getByText('(opens in new tab)');
      expect(srText).toBeInTheDocument();
      expect(srText).toHaveClass('sr-only');
    });

    it('should pass external prop to AnimatedLink', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          external={true}
        />
      );
      
      const link = screen.getByTestId('animated-link');
      expect(link).toHaveAttribute('external');
    });
  });

  describe('Event Handlers', () => {
    it('should call onMouseEnter when mouse enters', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          onMouseEnter={mockHandlers.onMouseEnter}
        />
      );
      
      fireEvent.mouseEnter(screen.getByRole('link'));
      expect(mockHandlers.onMouseEnter).toHaveBeenCalledTimes(1);
    });

    it('should call onMouseLeave when mouse leaves', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          onMouseLeave={mockHandlers.onMouseLeave}
        />
      );
      
      fireEvent.mouseLeave(screen.getByRole('link'));
      expect(mockHandlers.onMouseLeave).toHaveBeenCalledTimes(1);
    });

    it('should call onClick when clicked', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          onClick={mockHandlers.onClick}
        />
      );
      
      fireEvent.click(screen.getByRole('link'));
      expect(mockHandlers.onClick).toHaveBeenCalledTimes(1);
    });

    it('should call onFocus when focused', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          onFocus={mockHandlers.onFocus}
        />
      );
      
      fireEvent.focus(screen.getByRole('link'));
      expect(mockHandlers.onFocus).toHaveBeenCalledTimes(1);
    });

    it('should call onBlur when blurred', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          onBlur={mockHandlers.onBlur}
        />
      );
      
      const link = screen.getByRole('link');
      fireEvent.focus(link);
      fireEvent.blur(link);
      expect(mockHandlers.onBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should set aria-label when provided', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          ariaLabel="Custom aria label"
        />
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-label', 'Custom aria label');
    });

    it('should set aria-describedby when provided', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          ariaDescribedBy="description-id"
        />
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-describedby', 'description-id');
    });

    it('should set aria-current when active with default value', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          isActive={true}
        />
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-current', 'page');
    });

    it('should set custom aria-current when active', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          isActive={true}
          ariaCurrent="step"
        />
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-current', 'step');
    });

    it('should not set aria-current when not active', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          isActive={false}
          ariaCurrent="page"
        />
      );
      
      const link = screen.getByRole('link');
      expect(link).not.toHaveAttribute('aria-current');
    });

    it('should set custom tabIndex', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          tabIndex={-1}
        />
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('tabindex', '-1');
    });

    it('should have proper icon accessibility', () => {
      const TestIcon = () => <svg data-testid="test-icon">test</svg>;
      
      render(
        <NavbarLinkPure 
          {...defaultProps}
          icon={<TestIcon />}
        />
      );
      
      const iconContainer = screen.getByTestId('test-icon').parentElement;
      expect(iconContainer).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Active State Indicator', () => {
    it('should render active indicator when active', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          isActive={true}
        />
      );
      
      const indicator = screen.getByRole('link').querySelector('.absolute.-bottom-1');
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveAttribute('aria-hidden', 'true');
      expect(indicator).toHaveClass('h-0.5', 'bg-yellow-400', 'rounded-full');
    });

    it('should not render active indicator when not active', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          isActive={false}
        />
      );
      
      const indicator = screen.getByRole('link').querySelector('.absolute.-bottom-1');
      expect(indicator).not.toBeInTheDocument();
    });
  });

  describe('Prefetch Behavior', () => {
    it('should set prefetch data attribute when prefetch is true', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          prefetch={true}
        />
      );
      
      const link = screen.getByTestId('animated-link');
      expect(link).toHaveAttribute('data-prefetch', 'true');
    });

    it('should set prefetch data attribute when prefetch is false', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          prefetch={false}
        />
      );
      
      const link = screen.getByTestId('animated-link');
      expect(link).toHaveAttribute('data-prefetch', 'false');
    });

    it('should set prefetching data attribute', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          isPrefetching={true}
        />
      );
      
      const link = screen.getByTestId('animated-link');
      expect(link).toHaveAttribute('data-prefetching', 'true');
    });

    it('should default prefetch to true', () => {
      render(<NavbarLinkPure {...defaultProps} />);
      
      const link = screen.getByTestId('animated-link');
      expect(link).toHaveAttribute('data-prefetch', 'true');
    });
  });

  describe('AnimatedLink Integration', () => {
    it('should pass correct props to AnimatedLink for default variant', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          variant="default"
        />
      );
      
      const link = screen.getByTestId('animated-link');
      expect(link).toHaveAttribute('variant', 'default');
      expect(link).toHaveAttribute('enableUnderline');
      expect(link).toHaveAttribute('enableFontWeightChange');
    });

    it('should pass correct props to AnimatedLink for button variant', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          variant="button"
        />
      );
      
      const link = screen.getByTestId('animated-link');
      expect(link).toHaveAttribute('variant', 'button');
      expect(link).toHaveAttribute('enableFontWeightChange');
      expect(link).not.toHaveAttribute('enableUnderline');
    });

    it('should pass correct props to AnimatedLink for CTA variants', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          variant="cta-primary"
        />
      );
      
      const link = screen.getByTestId('animated-link');
      expect(link).toHaveAttribute('variant', 'cta-primary');
      expect(link).not.toHaveAttribute('enableUnderline');
      expect(link).not.toHaveAttribute('enableFontWeightChange');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          children={null}
        />
      );
      
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });

    it('should handle undefined href', () => {
      render(
        <NavbarLinkPure 
          href={undefined as any}
          children="Test"
        />
      );
      
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });

    it('should handle empty string href', () => {
      render(
        <NavbarLinkPure 
          href=""
          children="Test"
        />
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '');
    });

    it('should handle missing event handlers gracefully', () => {
      render(<NavbarLinkPure {...defaultProps} />);
      
      const link = screen.getByRole('link');
      
      expect(() => {
        fireEvent.click(link);
        fireEvent.mouseEnter(link);
        fireEvent.mouseLeave(link);
        fireEvent.focus(link);
        fireEvent.blur(link);
      }).not.toThrow();
    });

    it('should handle complex icon components', () => {
      const ComplexIcon = ({ className }: { className?: string }) => (
        <div className={className}>
          <svg data-testid="complex-icon">
            <path d="M10 20" />
          </svg>
        </div>
      );
      
      render(
        <NavbarLinkPure 
          {...defaultProps}
          icon={<ComplexIcon />}
        />
      );
      
      expect(screen.getByTestId('complex-icon')).toBeInTheDocument();
    });

    it('should handle long badge text', () => {
      render(
        <NavbarLinkPure 
          {...defaultProps}
          badge="999+"
        />
      );
      
      const badge = screen.getByText('999+');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('aria-label', '999+ items');
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = jest.fn();
      
      const TestComponent = (props: NavbarLinkPureProps) => {
        renderSpy();
        return <NavbarLinkPure {...props} />;
      };
      
      const { rerender } = render(<TestComponent {...defaultProps} />);
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Re-render with same props
      rerender(<TestComponent {...defaultProps} />);
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle rapid state changes', () => {
      const { rerender } = render(
        <NavbarLinkPure 
          {...defaultProps}
          isActive={false}
          isHovered={false}
        />
      );
      
      // Rapid state changes
      for (let i = 0; i < 10; i++) {
        rerender(
          <NavbarLinkPure 
            {...defaultProps}
            isActive={i % 2 === 0}
            isHovered={i % 3 === 0}
          />
        );
      }
      
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });
  });

  describe('Component Display Name', () => {
    it('should have correct display name', () => {
      expect(NavbarLinkPure.displayName).toBe('NavbarLinkPure');
    });
  });
});
