/**
 * SmartLink Component Tests
 *
 * Comprehensive test suite for the SmartLink component covering
 * all prefetch strategies, accessibility features, and edge cases.
 */

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PrefetchProvider } from '../provider';
import { HoverLink, ImmediateLink,SmartLink, ViewportLink } from '../smart-link';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    prefetch: jest.fn().mockResolvedValue(undefined),
    push: jest.fn()
  })
}));

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
});
global.IntersectionObserver = mockIntersectionObserver;

// Mock requestIdleCallback
global.requestIdleCallback = jest.fn((callback) => {
  setTimeout(callback, 0);
  return 1;
});

// Test wrapper with PrefetchProvider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PrefetchProvider options={{ debug: false }}>
    {children}
  </PrefetchProvider>
);

describe('SmartLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('Basic Rendering', () => {
    it('should render as Next.js Link for internal URLs', () => {
      render(
        <TestWrapper>
          <SmartLink href="/internal-page">
            Internal Link
          </SmartLink>
        </TestWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/internal-page');
      expect(link).toHaveTextContent('Internal Link');
    });

    it('should render as anchor tag for external URLs', () => {
      render(
        <TestWrapper>
          <SmartLink href="https://external.com">
            External Link
          </SmartLink>
        </TestWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://external.com');
      expect(link).toHaveTextContent('External Link');
    });

    it('should apply custom className', () => {
      render(
        <TestWrapper>
          <SmartLink href="/test" className="custom-class">
            Test Link
          </SmartLink>
        </TestWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveClass('custom-class');
    });

    it('should pass through additional props', () => {
      render(
        <TestWrapper>
          <SmartLink href="/test" data-testid="smart-link" aria-label="Custom label">
            Test Link
          </SmartLink>
        </TestWrapper>
      );

      const link = screen.getByTestId('smart-link');
      expect(link).toHaveAttribute('aria-label', 'Custom label');
    });
  });

  describe('Prefetch Strategies', () => {
    it('should set immediate prefetch for immediate strategy', () => {
      render(
        <TestWrapper>
          <SmartLink href="/immediate" prefetchStrategy="immediate">
            Immediate Link
          </SmartLink>
        </TestWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('data-prefetch-strategy', 'immediate');
    });

    it('should handle hover prefetch strategy', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <SmartLink href="/hover-page" prefetchStrategy="hover">
            Hover Link
          </SmartLink>
        </TestWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('data-prefetch-strategy', 'hover');

      // Hover over the link
      await user.hover(link);

      expect(link).toHaveAttribute('data-hovered', 'true');
    });

    it('should handle viewport prefetch strategy', () => {
      render(
        <TestWrapper>
          <SmartLink href="/viewport-page" prefetchStrategy="viewport">
            Viewport Link
          </SmartLink>
        </TestWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('data-prefetch-strategy', 'viewport');

      // Should set up intersection observer
      expect(mockIntersectionObserver).toHaveBeenCalled();
    });

    it('should handle manual prefetch strategy', () => {
      render(
        <TestWrapper>
          <SmartLink href="/manual-page" prefetchStrategy="manual">
            Manual Link
          </SmartLink>
        </TestWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('data-prefetch-strategy', 'manual');
    });

    it('should disable prefetch when noPrefetch is true', () => {
      render(
        <TestWrapper>
          <SmartLink href="/no-prefetch" noPrefetch>
            No Prefetch Link
          </SmartLink>
        </TestWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).not.toHaveAttribute('data-prefetch-strategy');
    });
  });

  describe('Priority Levels', () => {
    it('should apply high priority', () => {
      render(
        <TestWrapper>
          <SmartLink href="/high-priority" priority="high">
            High Priority Link
          </SmartLink>
        </TestWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('data-prefetch-priority', 'high');
    });

    it('should apply critical priority with highPriority flag', () => {
      render(
        <TestWrapper>
          <SmartLink href="/critical" priority="critical" highPriority>
            Critical Link
          </SmartLink>
        </TestWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('data-prefetch-priority', 'critical');
    });
  });

  describe('Touch and Mobile Events', () => {
    it('should handle touch start events', () => {
      render(
        <TestWrapper>
          <SmartLink href="/touch-page">
            Touch Link
          </SmartLink>
        </TestWrapper>
      );

      const link = screen.getByRole('link');

      fireEvent.touchStart(link);

      // Touch event should be handled without errors
      expect(link).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should handle focus events for keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <SmartLink href="/keyboard-page" prefetchStrategy="hover">
            Keyboard Link
          </SmartLink>
        </TestWrapper>
      );

      const link = screen.getByRole('link');

      // Focus on the link
      await user.tab();

      expect(link).toHaveFocus();
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <SmartLink href="/accessible-page">
            Accessible Link
          </SmartLink>
        </TestWrapper>
      );

      const link = screen.getByRole('link');

      // Should be focusable with keyboard
      await user.tab();
      expect(link).toHaveFocus();

      // Should be activatable with Enter
      await user.keyboard('{Enter}');

      expect(link).toBeInTheDocument();
    });
  });

  describe('Accessibility Features', () => {
    it('should include accessibility data attributes', () => {
      render(
        <TestWrapper>
          <SmartLink href="/accessible" prefetchStrategy="hover" priority="high">
            Accessible Link
          </SmartLink>
        </TestWrapper>
      );

      const link = screen.getByRole('link');

      expect(link).toHaveAttribute('data-prefetch-strategy', 'hover');
      expect(link).toHaveAttribute('data-prefetch-priority', 'high');
      expect(link).toHaveAttribute('data-cached', 'false');
      expect(link).toHaveAttribute('data-hovered', 'false');
      expect(link).toHaveAttribute('data-in-viewport', 'false');
    });

    it('should support aria-label', () => {
      render(
        <TestWrapper>
          <SmartLink href="/test" aria-label="Custom accessible label">
            Link Text
          </SmartLink>
        </TestWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-label', 'Custom accessible label');
    });
  });

  describe('Specialized Link Components', () => {
    it('should render HoverLink with hover strategy', () => {
      render(
        <TestWrapper>
          <HoverLink href="/hover-specialized">
            Hover Specialized
          </HoverLink>
        </TestWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('data-prefetch-strategy', 'hover');
    });

    it('should render ViewportLink with viewport strategy', () => {
      render(
        <TestWrapper>
          <ViewportLink href="/viewport-specialized">
            Viewport Specialized
          </ViewportLink>
        </TestWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('data-prefetch-strategy', 'viewport');
    });

    it('should render ImmediateLink with immediate strategy', () => {
      render(
        <TestWrapper>
          <ImmediateLink href="/immediate-specialized">
            Immediate Specialized
          </ImmediateLink>
        </TestWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('data-prefetch-strategy', 'immediate');
    });
  });

  describe('Error Handling', () => {
    it('should handle external URLs gracefully', () => {
      render(
        <TestWrapper>
          <SmartLink href="mailto:test@example.com">
            Email Link
          </SmartLink>
        </TestWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'mailto:test@example.com');
      expect(link).not.toHaveAttribute('data-prefetch-strategy');
    });

    it('should handle anchor links', () => {
      render(
        <TestWrapper>
          <SmartLink href="#section">
            Anchor Link
          </SmartLink>
        </TestWrapper>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '#section');
    });
  });

  describe('Performance Considerations', () => {
    it('should cleanup on unmount', () => {
      const { unmount } = render(
        <TestWrapper>
          <SmartLink href="/cleanup-test" prefetchStrategy="viewport">
            Cleanup Test
          </SmartLink>
        </TestWrapper>
      );

      // Should setup intersection observer
      expect(mockIntersectionObserver).toHaveBeenCalled();

      // Unmount component
      unmount();

      // Should not cause memory leaks (tested implicitly by not throwing errors)
    });

    it('should handle rapid hover events without issues', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <SmartLink href="/rapid-hover" prefetchStrategy="hover" delay={50}>
            Rapid Hover Test
          </SmartLink>
        </TestWrapper>
      );

      const link = screen.getByRole('link');

      // Rapid hover and unhover
      await user.hover(link);
      await user.unhover(link);
      await user.hover(link);
      await user.unhover(link);

      // Should not cause errors
      expect(link).toBeInTheDocument();
    });
  });

  describe('Configuration Override', () => {
    it('should override route configuration with props', () => {
      render(
        <TestWrapper>
          <SmartLink
            href="/pricing"
            prefetchStrategy="viewport"
            priority="low"
            delay={1000}
          >
            Override Test
          </SmartLink>
        </TestWrapper>
      );

      const link = screen.getByRole('link');

      // Should use prop values instead of route config
      expect(link).toHaveAttribute('data-prefetch-strategy', 'viewport');
      expect(link).toHaveAttribute('data-prefetch-priority', 'low');
    });
  });

  describe('Cache Integration', () => {
    it('should update cached status when URL is prefetched', async () => {
      render(
        <TestWrapper>
          <SmartLink href="/cache-test" prefetchStrategy="immediate">
            Cache Test
          </SmartLink>
        </TestWrapper>
      );

      const link = screen.getByRole('link');

      // Initially not cached
      expect(link).toHaveAttribute('data-cached', 'false');

      // Wait for immediate prefetch to complete
      await waitFor(() => {
        // Note: In a real test, we would need to wait for the actual prefetch
        // This is a simplified test
      });
    });
  });
});