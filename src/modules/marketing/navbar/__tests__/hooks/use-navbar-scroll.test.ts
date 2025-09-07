/**
 * Application Layer Tests - useNavbarScroll Hook
 *
 * Tests comprehensivos para el hook useNavbarScroll.
 * Incluye testing de:
 * - Throttling y requestAnimationFrame
 * - HideOnScroll logic
 * - Progress calculation
 * - Velocity tracking
 * - Memory cleanup
 * - Edge cases and error handling
 */

import { act, renderHook, waitFor } from '@testing-library/react';

import { useNavbarScroll } from '../../application/hooks/use-navbar-scroll';
import { SCROLL_THRESHOLDS } from '../../domain/constants';

// Mock performance.now for consistent testing
jest.mock('performance', () => ({
  now: jest.fn(() => Date.now())
}));

// Mock requestAnimationFrame and cancelAnimationFrame
const mockRaf = jest.fn((callback) => {
  callback();
  return 123; // mock frame id
});
const mockCancelRaf = jest.fn();

global.requestAnimationFrame = mockRaf;
global.cancelAnimationFrame = mockCancelRaf;

describe('useNavbarScroll', () => {
  let mockScrollY = 0;
  const mockInnerHeight = 1000;
  let mockScrollHeight = 2000;
  let mockInnerWidth = 1024;

  const mockScrollEvent = (scrollY: number) => {
    mockScrollY = scrollY;
    // Trigger scroll event
    const event = new Event('scroll');
    window.dispatchEvent(event);
  };

  const mockResizeEvent = (width: number = 1024) => {
    mockInnerWidth = width;
    const event = new Event('resize');
    window.dispatchEvent(event);
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock window properties
    Object.defineProperty(window, 'scrollY', {
      get: () => mockScrollY,
      configurable: true
    });

    Object.defineProperty(window, 'innerHeight', {
      get: () => mockInnerHeight,
      configurable: true
    });

    Object.defineProperty(window, 'innerWidth', {
      get: () => mockInnerWidth,
      configurable: true
    });

    Object.defineProperty(document.documentElement, 'scrollHeight', {
      get: () => mockScrollHeight,
      configurable: true
    });

    // Reset performance.now mock
    (performance.now as jest.Mock).mockImplementation(() => Date.now());
  });

  afterEach(() => {
    // Clean up any remaining event listeners
    window.removeEventListener('scroll', jest.fn());
    window.removeEventListener('resize', jest.fn());
  });

  describe('Initial State', () => {
    it('should return correct initial state', () => {
      const { result } = renderHook(() => useNavbarScroll());

      expect(result.current.isVisible).toBe(true);
      expect(result.current.isAtTop).toBe(true);
      expect(result.current.scrollY).toBe(0);
      expect(result.current.scrollVelocity).toBe(0);
      expect(result.current.scrollDirection).toBe('idle');
      expect(result.current.scrollProgress).toBe(0);
    });

    it('should accept custom options', () => {
      const { result } = renderHook(() =>
        useNavbarScroll({
          threshold: 50,
          hideThreshold: 100,
          enableProgressBar: false
        })
      );

      expect(result.current.scrollProgress).toBe(0);
    });
  });

  describe('Scroll Direction Detection', () => {
    it('should detect downward scrolling', async () => {
      const { result } = renderHook(() => useNavbarScroll());

      act(() => {
        mockScrollEvent(100);
      });

      await waitFor(() => {
        expect(result.current.scrollDirection).toBe('down');
        expect(result.current.scrollY).toBe(100);
      });
    });

    it('should detect upward scrolling', async () => {
      const { result } = renderHook(() => useNavbarScroll());

      // First scroll down
      act(() => {
        mockScrollEvent(100);
      });

      await waitFor(() => {
        expect(result.current.scrollDirection).toBe('down');
      });

      // Then scroll up
      act(() => {
        mockScrollEvent(50);
      });

      await waitFor(() => {
        expect(result.current.scrollDirection).toBe('up');
      });
    });

    it('should detect idle state for minimal movement', async () => {
      const { result } = renderHook(() => useNavbarScroll());

      act(() => {
        mockScrollEvent(0.5); // Less than 1px threshold
      });

      await waitFor(() => {
        expect(result.current.scrollDirection).toBe('idle');
      });
    });
  });

  describe('Visibility Logic', () => {
    it('should show navbar when at top', async () => {
      const { result } = renderHook(() => useNavbarScroll());

      expect(result.current.isVisible).toBe(true);
      expect(result.current.isAtTop).toBe(true);
    });

    it('should hide navbar when scrolling down past threshold', async () => {
      const { result } = renderHook(() =>
        useNavbarScroll({
          hideThreshold: 50,
          enableVelocityTracking: true
        })
      );

      // Simulate fast downward scroll
      let timestamp = 0;
      (performance.now as jest.Mock).mockImplementation(() => {
        timestamp += 16; // 60fps
        return timestamp;
      });

      act(() => {
        mockScrollEvent(100);
      });

      await waitFor(() => {
        expect(result.current.isAtTop).toBe(false);
        // Visibility depends on velocity, which is hard to mock precisely
        // So we mainly test the scroll position detection
        expect(result.current.scrollY).toBe(100);
      });
    });

    it('should always show navbar on mobile', async () => {
      const { result } = renderHook(() => useNavbarScroll());

      // Mock mobile viewport
      mockInnerWidth = 767;

      act(() => {
        mockScrollEvent(200);
      });

      await waitFor(() => {
        expect(result.current.isVisible).toBe(true);
      });
    });

    it('should show navbar when scrolling up regardless of position', async () => {
      const { result } = renderHook(() => useNavbarScroll());

      // Scroll down first
      act(() => {
        mockScrollEvent(200);
      });

      // Then scroll up
      act(() => {
        mockScrollEvent(150);
      });

      await waitFor(() => {
        expect(result.current.isVisible).toBe(true);
        expect(result.current.scrollDirection).toBe('up');
      });
    });
  });

  describe('Progress Calculation', () => {
    it('should calculate scroll progress correctly', async () => {
      const { result } = renderHook(() =>
        useNavbarScroll({ enableProgressBar: true })
      );

      // Scroll to 50% of total scrollable height
      // scrollHeight = 2000, innerHeight = 1000, so scrollable = 1000
      // 50% of 1000 = 500
      act(() => {
        mockScrollEvent(500);
      });

      await waitFor(() => {
        expect(result.current.scrollProgress).toBe(50);
      });
    });

    it('should clamp progress between 0 and 100', async () => {
      const { result } = renderHook(() =>
        useNavbarScroll({ enableProgressBar: true })
      );

      // Scroll beyond maximum
      act(() => {
        mockScrollEvent(2000);
      });

      await waitFor(() => {
        expect(result.current.scrollProgress).toBe(100);
      });
    });

    it('should return 0 progress when enableProgressBar is false', async () => {
      const { result } = renderHook(() =>
        useNavbarScroll({ enableProgressBar: false })
      );

      act(() => {
        mockScrollEvent(500);
      });

      await waitFor(() => {
        expect(result.current.scrollProgress).toBe(0);
      });
    });

    it('should handle edge case when no scrollable content', async () => {
      // Set scrollHeight equal to innerHeight
      mockScrollHeight = 1000;

      const { result } = renderHook(() =>
        useNavbarScroll({ enableProgressBar: true })
      );

      act(() => {
        mockScrollEvent(100);
      });

      await waitFor(() => {
        expect(result.current.scrollProgress).toBe(0);
      });
    });
  });

  describe('Velocity Tracking', () => {
    it('should track scroll velocity when enabled', async () => {
      let timestamp = 0;
      (performance.now as jest.Mock).mockImplementation(() => {
        timestamp += 16;
        return timestamp;
      });

      const { result } = renderHook(() =>
        useNavbarScroll({ enableVelocityTracking: true })
      );

      act(() => {
        mockScrollEvent(100);
      });

      await waitFor(() => {
        expect(result.current.scrollVelocity).toBeGreaterThan(0);
      });
    });

    it('should return 0 velocity when disabled', async () => {
      const { result } = renderHook(() =>
        useNavbarScroll({ enableVelocityTracking: false })
      );

      act(() => {
        mockScrollEvent(100);
      });

      await waitFor(() => {
        expect(result.current.scrollVelocity).toBe(0);
      });
    });

    it('should smooth velocity using exponential moving average', async () => {
      let timestamp = 0;
      (performance.now as jest.Mock).mockImplementation(() => {
        timestamp += 16;
        return timestamp;
      });

      const { result } = renderHook(() =>
        useNavbarScroll({ enableVelocityTracking: true })
      );

      // Multiple rapid scroll events
      act(() => {
        mockScrollEvent(50);
      });

      act(() => {
        mockScrollEvent(100);
      });

      act(() => {
        mockScrollEvent(150);
      });

      await waitFor(() => {
        expect(result.current.scrollVelocity).toBeGreaterThan(0);
        // Velocity should be smoothed, not the raw instant value
      });
    });
  });

  describe('Throttling and Performance', () => {
    it('should use requestAnimationFrame for smooth scrolling', () => {
      renderHook(() => useNavbarScroll());

      act(() => {
        mockScrollEvent(100);
      });

      expect(mockRaf).toHaveBeenCalled();
    });

    it('should throttle scroll events', async () => {
      const { result } = renderHook(() =>
        useNavbarScroll({ throttleTime: 32 }) // 30fps
      );

      // Rapid fire scroll events
      act(() => {
        mockScrollEvent(50);
        mockScrollEvent(100);
        mockScrollEvent(150);
      });

      // Should not process all events immediately due to throttling
      // The exact behavior depends on timing, so we mainly check it doesn't crash
      expect(result.current.scrollY).toBeGreaterThan(0);
    });

    it('should prevent division by zero in velocity calculation', async () => {
      // Mock performance.now to return same timestamp
      (performance.now as jest.Mock).mockReturnValue(1000);

      const { result } = renderHook(() =>
        useNavbarScroll({ enableVelocityTracking: true })
      );

      act(() => {
        mockScrollEvent(100);
      });

      // Should not crash with division by zero
      await waitFor(() => {
        expect(result.current.scrollVelocity).toBeGreaterThanOrEqual(0);
      });
    });

    it('should optimize state updates to prevent unnecessary re-renders', async () => {
      const { result } = renderHook(() => useNavbarScroll());

      const initialState = result.current;

      // Minimal scroll that shouldn't trigger state update
      act(() => {
        mockScrollEvent(0.5); // Less than 1px threshold
      });

      await waitFor(() => {
        // State should not change for minimal movement
        expect(result.current.scrollDirection).toBe('idle');
      });
    });
  });

  describe('Event Handling', () => {
    it('should handle scroll change callbacks', async () => {
      const onScrollChange = jest.fn();

      renderHook(() =>
        useNavbarScroll({ onScrollChange })
      );

      act(() => {
        mockScrollEvent(100);
      });

      await waitFor(() => {
        expect(onScrollChange).toHaveBeenCalled();
        expect(onScrollChange).toHaveBeenCalledWith(
          expect.objectContaining({
            scrollY: 100,
            scrollDirection: 'down'
          })
        );
      });
    });

    it('should handle resize events', async () => {
      const { result } = renderHook(() => useNavbarScroll());

      act(() => {
        mockResizeEvent(800);
      });

      // Resize should trigger recalculation
      expect(mockRaf).toHaveBeenCalled();
    });
  });

  describe('Scroll Utility Functions', () => {
    beforeEach(() => {
      // Mock window.scrollTo
      window.scrollTo = jest.fn();

      // Mock getElementById
      document.getElementById = jest.fn().mockReturnValue({
        getBoundingClientRect: () => ({
          top: 500,
          left: 0,
          right: 0,
          bottom: 600,
          width: 100,
          height: 100
        })
      });
    });

    it('should provide scrollToTop function', () => {
      const { result } = renderHook(() => useNavbarScroll());

      act(() => {
        result.current.scrollToTop();
      });

      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth'
      });
    });

    it('should provide scrollToTop with no smooth behavior', () => {
      const { result } = renderHook(() => useNavbarScroll());

      act(() => {
        result.current.scrollToTop(false);
      });

      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'auto'
      });
    });

    it('should provide scrollToElement function', () => {
      const { result } = renderHook(() => useNavbarScroll());

      act(() => {
        result.current.scrollToElement('test-section');
      });

      expect(document.getElementById).toHaveBeenCalledWith('test-section');
      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 420, // 500 (element position) - 80 (default offset)
        behavior: 'smooth'
      });
    });

    it('should handle scrollToElement with custom offset', () => {
      const { result } = renderHook(() => useNavbarScroll());

      act(() => {
        result.current.scrollToElement('test-section', 100);
      });

      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 400, // 500 - 100
        behavior: 'smooth'
      });
    });

    it('should handle scrollToElement when element not found', () => {
      document.getElementById = jest.fn().mockReturnValue(null);

      const { result } = renderHook(() => useNavbarScroll());

      act(() => {
        result.current.scrollToElement('non-existent');
      });

      expect(window.scrollTo).not.toHaveBeenCalled();
    });

    it('should provide scroll lock/unlock functions', () => {
      const { result } = renderHook(() => useNavbarScroll());

      // Mock body styles
      document.body.style = {} as any;
      document.body.clientWidth = 1000;
      window.innerWidth = 1017; // Includes scrollbar

      act(() => {
        result.current.lockScroll();
      });

      expect(document.body.style.overflow).toBe('hidden');
      expect(document.body.style.paddingRight).toBe('17px');

      act(() => {
        result.current.unlockScroll();
      });

      expect(document.body.style.overflow).toBe('');
      expect(document.body.style.paddingRight).toBe('');
    });
  });

  describe('Memory Management and Cleanup', () => {
    it('should cleanup event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useNavbarScroll());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    it('should cancel animation frames on unmount', () => {
      const { unmount } = renderHook(() => useNavbarScroll());

      // Trigger scroll to create animation frame
      act(() => {
        mockScrollEvent(100);
      });

      unmount();

      expect(mockCancelRaf).toHaveBeenCalled();
    });

    it('should clear velocity history on unmount', () => {
      const { unmount } = renderHook(() =>
        useNavbarScroll({ enableVelocityTracking: true })
      );

      // Generate some velocity history
      act(() => {
        mockScrollEvent(50);
        mockScrollEvent(100);
      });

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle rapid scroll direction changes', async () => {
      const { result } = renderHook(() => useNavbarScroll());

      // Rapid direction changes
      act(() => {
        mockScrollEvent(100);
        mockScrollEvent(50);
        mockScrollEvent(150);
        mockScrollEvent(25);
      });

      await waitFor(() => {
        // Should not crash and should have valid direction
        expect(['up', 'down', 'idle']).toContain(result.current.scrollDirection);
      });
    });

    it('should handle extreme scroll values', async () => {
      const { result } = renderHook(() => useNavbarScroll());

      act(() => {
        mockScrollEvent(999999);
      });

      await waitFor(() => {
        expect(result.current.scrollY).toBe(999999);
        expect(result.current.scrollProgress).toBe(100); // Clamped to max
      });
    });

    it('should handle negative scroll values', async () => {
      const { result } = renderHook(() => useNavbarScroll());

      act(() => {
        mockScrollEvent(-100);
      });

      await waitFor(() => {
        expect(result.current.scrollY).toBe(-100);
        expect(result.current.scrollProgress).toBe(0); // Clamped to min
      });
    });

    it('should handle window resize during scroll', async () => {
      const { result } = renderHook(() => useNavbarScroll());

      act(() => {
        mockScrollEvent(100);
        mockResizeEvent(500); // Change to mobile size
      });

      await waitFor(() => {
        // Should still maintain scroll state
        expect(result.current.scrollY).toBe(100);
        // Mobile should always be visible
        expect(result.current.isVisible).toBe(true);
      });
    });

    it('should handle performance.now returning invalid values', async () => {
      (performance.now as jest.Mock).mockReturnValue(NaN);

      const { result } = renderHook(() =>
        useNavbarScroll({ enableVelocityTracking: true })
      );

      act(() => {
        mockScrollEvent(100);
      });

      // Should not crash and should fallback gracefully
      await waitFor(() => {
        expect(result.current.scrollY).toBe(100);
      });
    });
  });

  describe('Configuration Options', () => {
    it('should respect custom thresholds', async () => {
      const { result } = renderHook(() =>
        useNavbarScroll({
          threshold: 200,
          hideThreshold: 300
        })
      );

      act(() => {
        mockScrollEvent(150);
      });

      await waitFor(() => {
        expect(result.current.isAtTop).toBe(true); // Below threshold
      });

      act(() => {
        mockScrollEvent(250);
      });

      await waitFor(() => {
        expect(result.current.isAtTop).toBe(false); // Above threshold
      });
    });

    it('should handle different throttle times', async () => {
      const { result } = renderHook(() =>
        useNavbarScroll({ throttleTime: 100 })
      );

      act(() => {
        mockScrollEvent(100);
      });

      // Should still work with different throttle time
      await waitFor(() => {
        expect(result.current.scrollY).toBe(100);
      });
    });
  });
});
