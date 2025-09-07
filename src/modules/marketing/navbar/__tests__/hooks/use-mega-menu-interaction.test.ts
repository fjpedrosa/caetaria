/**
 * Application Layer Tests - useMegaMenuInteraction Hook
 *
 * Tests completos para el hook de interacción con mega menus.
 * Cubre funcionalidades avanzadas:
 * - Triangle safe zone detection
 * - Hover delays and timing
 * - Touch/click/keyboard interactions
 * - Cursor tracking and velocity
 * - Accessibility compliance
 * - Performance optimizations
 * - Edge cases and error handling
 */

import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useMegaMenuInteraction } from '../../application/hooks/use-mega-menu-interaction';

// Mock the triangle safe zone utilities
jest.mock('../../application/utils/triangle-safe-zone', () => ({
  calculateOptimalTriangle: jest.fn().mockReturnValue({
    points: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 }]
  }),
  createHoverBridge: jest.fn().mockReturnValue({
    position: 'absolute',
    top: '0px',
    left: '0px',
    width: '100px',
    height: '50px'
  }),
  isInEnhancedSafeZone: jest.fn().mockReturnValue(false),
  CursorTracker: jest.fn().mockImplementation(() => ({
    addPosition: jest.fn(),
    getLatest: jest.fn().mockReturnValue({ x: 0, y: 0 }),
    getPrevious: jest.fn().mockReturnValue({ x: 0, y: 0 }),
    getPositions: jest.fn().mockReturnValue([]),
    getVelocity: jest.fn().mockReturnValue(0),
    start: jest.fn(),
    stop: jest.fn()
  })),
  DEFAULT_SAFE_ZONE_CONFIG: {
    enabled: true,
    tolerance: 50,
    angleThreshold: 45,
    timeWindow: 200
  }
}));

// Mock requestAnimationFrame
const mockRaf = jest.fn((callback) => {
  callback();
  return 123;
});
const mockCancelRaf = jest.fn();

global.requestAnimationFrame = mockRaf;
global.cancelAnimationFrame = mockCancelRaf;

describe('useMegaMenuInteraction', () => {
  let mockMouseEvent: (type: string, options?: Partial<MouseEvent>) => MouseEvent;
  let mockKeyboardEvent: (key: string, options?: Partial<KeyboardEvent>) => KeyboardEvent;
  let mockTouchEvent: (type: string, options?: Partial<TouchEvent>) => TouchEvent;
  let mockMenuElement: HTMLElement;
  let mockTriggerElement: HTMLElement;

  const createMockElement = (tagName: string = 'div') => {
    const element = document.createElement(tagName);
    element.getBoundingClientRect = jest.fn().mockReturnValue({
      top: 100,
      left: 100,
      right: 300,
      bottom: 200,
      width: 200,
      height: 100
    });
    element.querySelectorAll = jest.fn().mockReturnValue([]);
    element.querySelector = jest.fn().mockReturnValue(null);
    element.contains = jest.fn().mockReturnValue(false);
    element.focus = jest.fn();
    element.setAttribute = jest.fn();
    element.getAttribute = jest.fn();
    element.style = {} as any;
    return element;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Setup mock elements
    mockMenuElement = createMockElement('div');
    mockTriggerElement = createMockElement('button');

    // Mock touch device detection
    Object.defineProperty(window, 'ontouchstart', {
      value: undefined,
      configurable: true
    });

    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 0,
      configurable: true
    });

    // Setup event creators
    mockMouseEvent = (type: string, options: Partial<MouseEvent> = {}) => {
      return new MouseEvent(type, {
        clientX: 150,
        clientY: 150,
        bubbles: true,
        ...options
      } as MouseEventInit);
    };

    mockKeyboardEvent = (key: string, options: Partial<KeyboardEvent> = {}) => {
      return new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        cancelable: true,
        ...options
      });
    };

    mockTouchEvent = (type: string, options: Partial<TouchEvent> = {}) => {
      return new TouchEvent(type, {
        touches: [{ clientX: 150, clientY: 150 } as any],
        bubbles: true,
        ...options
      } as TouchEventInit);
    };

    // Mock document methods
    document.createElement = jest.fn().mockImplementation((tagName) => {
      const element = createMockElement(tagName);
      if (tagName === 'style') {
        element.textContent = '';
      }
      return element;
    });

    document.body.appendChild = jest.fn();
    document.head.appendChild = jest.fn();
    document.querySelector = jest.fn().mockReturnValue(null);
    document.activeElement = mockTriggerElement;
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initial State and Configuration', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useMegaMenuInteraction());

      expect(result.current.activeMenu).toBeNull();
      expect(result.current.isOpen).toBe(false);
      expect(result.current.isPending).toBe(false);
      expect(result.current.interactionMode).toBe('hover');
    });

    it('should merge custom config with defaults', () => {
      const customConfig = {
        hoverDelay: { enter: 200, exit: 500, keyboard: 0 },
        triangleSafeZone: { enabled: false }
      };

      const { result } = renderHook(() =>
        useMegaMenuInteraction({ config: customConfig })
      );

      expect(result.current.config.hoverDelay.enter).toBe(200);
      expect(result.current.config.hoverDelay.exit).toBe(500);
      expect(result.current.config.triangleSafeZone.enabled).toBe(false);
    });

    it('should detect touch device and set appropriate interaction mode', async () => {
      Object.defineProperty(window, 'ontouchstart', {
        value: true,
        configurable: true
      });

      const onInteractionModeChange = jest.fn();

      renderHook(() =>
        useMegaMenuInteraction({ onInteractionModeChange })
      );

      await waitFor(() => {
        expect(onInteractionModeChange).toHaveBeenCalledWith('touch');
      });
    });

    it('should handle callback functions', () => {
      const onMenuOpen = jest.fn();
      const onMenuClose = jest.fn();
      const onInteractionModeChange = jest.fn();

      const { result } = renderHook(() =>
        useMegaMenuInteraction({
          onMenuOpen,
          onMenuClose,
          onInteractionModeChange
        })
      );

      expect(result.current).toBeDefined();
    });
  });

  describe('Menu Registration System', () => {
    it('should register menu element and trigger', () => {
      const { result } = renderHook(() => useMegaMenuInteraction());

      act(() => {
        const cleanup = result.current.registerMenu('test-menu', mockMenuElement, mockTriggerElement);
        expect(typeof cleanup).toBe('function');
      });
    });

    it('should add expanded hit area when enabled', () => {
      const { result } = renderHook(() =>
        useMegaMenuInteraction({
          config: {
            expandedHitArea: {
              enabled: true,
              padding: 12
            }
          }
        })
      );

      act(() => {
        result.current.registerMenu('test-menu', mockMenuElement, mockTriggerElement);
      });

      expect(mockTriggerElement.style.position).toBe('relative');
      expect(document.head.appendChild).toHaveBeenCalled();
      expect(mockTriggerElement.setAttribute).toHaveBeenCalledWith('data-menu-trigger', 'test-menu');
    });

    it('should cleanup registration properly', () => {
      const { result } = renderHook(() => useMegaMenuInteraction());

      let cleanup: () => void;

      act(() => {
        cleanup = result.current.registerMenu('test-menu', mockMenuElement, mockTriggerElement);
      });

      act(() => {
        cleanup();
      });

      // Should not throw
      expect(result.current.isMenuOpen('test-menu')).toBe(false);
    });
  });

  describe('Hover Interactions', () => {
    beforeEach(() => {
      // Setup for hover tests
      Object.defineProperty(window, 'innerWidth', {
        value: 1024,
        configurable: true
      });
    });

    it('should open menu on mouse enter with delay', async () => {
      const onMenuOpen = jest.fn();
      const { result } = renderHook(() =>
        useMegaMenuInteraction({
          onMenuOpen,
          config: {
            hoverDelay: { enter: 100, exit: 300, keyboard: 0 }
          }
        })
      );

      act(() => {
        result.current.registerMenu('test-menu', mockMenuElement, mockTriggerElement);
      });

      const event = mockMouseEvent('mouseenter', { clientX: 100, clientY: 100 });

      act(() => {
        result.current.handleMouseEnter('test-menu', event as any);
      });

      expect(result.current.isPending).toBe(true);

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(onMenuOpen).toHaveBeenCalledWith('test-menu');
        expect(result.current.activeMenu).toBe('test-menu');
        expect(result.current.isOpen).toBe(true);
        expect(result.current.isPending).toBe(false);
      });
    });

    it('should close menu on mouse leave with delay', async () => {
      const onMenuClose = jest.fn();
      const { result } = renderHook(() =>
        useMegaMenuInteraction({
          onMenuClose,
          config: {
            hoverDelay: { enter: 0, exit: 200, keyboard: 0 },
            triangleSafeZone: { enabled: false }
          }
        })
      );

      act(() => {
        result.current.registerMenu('test-menu', mockMenuElement, mockTriggerElement);
      });

      // First open the menu
      act(() => {
        result.current.openMenu('test-menu', true);
      });

      const event = mockMouseEvent('mouseleave');

      act(() => {
        result.current.handleMouseLeave('test-menu', event as any);
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(onMenuClose).toHaveBeenCalledWith('test-menu');
        expect(result.current.activeMenu).toBeNull();
        expect(result.current.isOpen).toBe(false);
      });
    });

    it('should respect movement threshold for accidental hover prevention', () => {
      const { result } = renderHook(() =>
        useMegaMenuInteraction({
          config: {
            performance: {
              movementThreshold: 5,
              useRAF: true,
              throttleMs: 16
            }
          }
        })
      );

      act(() => {
        result.current.registerMenu('test-menu', mockMenuElement, mockTriggerElement);
      });

      // Small movement (should be ignored)
      const smallMoveEvent = mockMouseEvent('mouseenter', { clientX: 102, clientY: 102 });

      act(() => {
        result.current.handleMouseEnter('test-menu', smallMoveEvent as any);
      });

      expect(result.current.isPending).toBe(false);
    });

    it('should handle menu switching with triangle safe zone', async () => {
      const { isInEnhancedSafeZone } = require('../../application/utils/triangle-safe-zone');
      isInEnhancedSafeZone.mockReturnValue(true);

      const { result } = renderHook(() =>
        useMegaMenuInteraction({
          config: {
            triangleSafeZone: { enabled: true }
          }
        })
      );

      act(() => {
        result.current.registerMenu('menu1', mockMenuElement, mockTriggerElement);
        result.current.registerMenu('menu2', createMockElement(), createMockElement());
      });

      // Open first menu
      act(() => {
        result.current.openMenu('menu1', true);
      });

      // Try to hover over second menu (should be delayed due to safe zone)
      const event = mockMouseEvent('mouseenter');

      act(() => {
        result.current.handleMouseEnter('menu2', event as any);
      });

      // Should not switch immediately due to safe zone
      expect(result.current.activeMenu).toBe('menu1');
    });
  });

  describe('Click and Touch Interactions', () => {
    it('should handle click interaction and toggle menu', async () => {
      const onInteractionModeChange = jest.fn();
      const { result } = renderHook(() =>
        useMegaMenuInteraction({ onInteractionModeChange })
      );

      act(() => {
        result.current.registerMenu('test-menu', mockMenuElement, mockTriggerElement);
      });

      const event = mockMouseEvent('click');

      act(() => {
        result.current.handleClick('test-menu', event as any);
      });

      await waitFor(() => {
        expect(onInteractionModeChange).toHaveBeenCalledWith('click');
        expect(result.current.activeMenu).toBe('test-menu');
        expect(result.current.isOpen).toBe(true);
      });

      // Click again should close
      act(() => {
        result.current.handleClick('test-menu', event as any);
      });

      await waitFor(() => {
        expect(result.current.activeMenu).toBeNull();
        expect(result.current.isOpen).toBe(false);
      });
    });

    it('should handle touch events', async () => {
      const onInteractionModeChange = jest.fn();
      const { result } = renderHook(() =>
        useMegaMenuInteraction({
          onInteractionModeChange,
          config: {
            touchMode: {
              enabled: true,
              preventClickPropagation: true
            }
          }
        })
      );

      act(() => {
        result.current.registerMenu('test-menu', mockMenuElement, mockTriggerElement);
      });

      const event = mockTouchEvent('touchstart');
      event.stopPropagation = jest.fn();

      act(() => {
        result.current.handleClick('test-menu', event as any);
      });

      expect(event.stopPropagation).toHaveBeenCalled();
      await waitFor(() => {
        expect(onInteractionModeChange).toHaveBeenCalledWith('touch');
      });
    });

    it('should prevent click propagation when configured', () => {
      const { result } = renderHook(() =>
        useMegaMenuInteraction({
          config: {
            touchMode: {
              enabled: true,
              preventClickPropagation: true
            }
          }
        })
      );

      const event = mockMouseEvent('click');
      event.stopPropagation = jest.fn();

      act(() => {
        result.current.handleClick('test-menu', event as any);
      });

      expect(event.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      // Setup focusable elements for keyboard tests
      const focusableElements = [
        createMockElement('a'),
        createMockElement('button'),
        createMockElement('input')
      ];

      focusableElements.forEach(el => {
        el.click = jest.fn();
        el.getAttribute = jest.fn().mockReturnValue('Test Item');
      });

      mockMenuElement.querySelectorAll = jest.fn().mockImplementation((selector) => {
        if (selector.includes('role="group"')) {
          return [mockMenuElement]; // Return column containers
        }
        return focusableElements;
      });

      document.querySelector = jest.fn().mockImplementation((selector) => {
        if (selector === '[role="navigation"]') {
          const nav = createMockElement('nav');
          nav.querySelectorAll = jest.fn().mockReturnValue(focusableElements);
          return nav;
        }
        return null;
      });
    });

    it('should handle Enter key to toggle menu', async () => {
      const { result } = renderHook(() => useMegaMenuInteraction());

      act(() => {
        result.current.registerMenu('test-menu', mockMenuElement, mockTriggerElement);
      });

      const event = mockKeyboardEvent('Enter');
      event.preventDefault = jest.fn();

      act(() => {
        result.current.handleKeyDown(event as any, 'test-menu');
      });

      expect(event.preventDefault).toHaveBeenCalled();
      await waitFor(() => {
        expect(result.current.activeMenu).toBe('test-menu');
      });
    });

    it('should handle Space key to toggle menu', async () => {
      const { result } = renderHook(() => useMegaMenuInteraction());

      act(() => {
        result.current.registerMenu('test-menu', mockMenuElement, mockTriggerElement);
      });

      const event = mockKeyboardEvent(' ');
      event.preventDefault = jest.fn();

      act(() => {
        result.current.handleKeyDown(event as any, 'test-menu');
      });

      expect(event.preventDefault).toHaveBeenCalled();
      await waitFor(() => {
        expect(result.current.activeMenu).toBe('test-menu');
      });
    });

    it('should handle Escape key to close menu', async () => {
      const { result } = renderHook(() => useMegaMenuInteraction());

      act(() => {
        result.current.registerMenu('test-menu', mockMenuElement, mockTriggerElement);
        result.current.openMenu('test-menu', true);
      });

      const event = mockKeyboardEvent('Escape');
      event.preventDefault = jest.fn();

      act(() => {
        result.current.handleKeyDown(event as any, 'test-menu');
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockTriggerElement.focus).toHaveBeenCalled();
      await waitFor(() => {
        expect(result.current.activeMenu).toBeNull();
      });
    });

    it('should handle ArrowDown to open menu and navigate', async () => {
      const { result } = renderHook(() => useMegaMenuInteraction());

      act(() => {
        result.current.registerMenu('test-menu', mockMenuElement, mockTriggerElement);
      });

      const event = mockKeyboardEvent('ArrowDown');
      event.preventDefault = jest.fn();

      act(() => {
        result.current.handleKeyDown(event as any, 'test-menu');
      });

      expect(event.preventDefault).toHaveBeenCalled();
      await waitFor(() => {
        expect(result.current.activeMenu).toBe('test-menu');
      });
    });

    it('should handle arrow key navigation within menu', async () => {
      const { result } = renderHook(() => useMegaMenuInteraction());

      act(() => {
        result.current.registerMenu('test-menu', mockMenuElement, mockTriggerElement);
        result.current.openMenu('test-menu', true);
      });

      const event = mockKeyboardEvent('ArrowRight');
      event.preventDefault = jest.fn();

      act(() => {
        result.current.handleKeyDown(event as any, 'test-menu');
      });

      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should handle Home key to focus first item', () => {
      const { result } = renderHook(() => useMegaMenuInteraction());

      act(() => {
        result.current.registerMenu('test-menu', mockMenuElement, mockTriggerElement);
        result.current.openMenu('test-menu', true);
      });

      const event = mockKeyboardEvent('Home');
      event.preventDefault = jest.fn();

      act(() => {
        result.current.handleKeyDown(event as any, 'test-menu');
      });

      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should handle End key to focus last item', () => {
      const { result } = renderHook(() => useMegaMenuInteraction());

      act(() => {
        result.current.registerMenu('test-menu', mockMenuElement, mockTriggerElement);
        result.current.openMenu('test-menu', true);
      });

      const event = mockKeyboardEvent('End');
      event.preventDefault = jest.fn();

      act(() => {
        result.current.handleKeyDown(event as any, 'test-menu');
      });

      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should handle Tab key for focus trapping', () => {
      const { result } = renderHook(() => useMegaMenuInteraction());

      act(() => {
        result.current.registerMenu('test-menu', mockMenuElement, mockTriggerElement);
        result.current.openMenu('test-menu', true);
      });

      const event = mockKeyboardEvent('Tab');
      event.preventDefault = jest.fn();

      act(() => {
        result.current.handleKeyDown(event as any, 'test-menu');
      });

      // Focus trapping logic should be executed
    });

    it('should handle Shift+Tab for reverse tab navigation', () => {
      const { result } = renderHook(() => useMegaMenuInteraction());

      act(() => {
        result.current.registerMenu('test-menu', mockMenuElement, mockTriggerElement);
        result.current.openMenu('test-menu', true);
      });

      const event = mockKeyboardEvent('Tab', { shiftKey: true });
      event.preventDefault = jest.fn();

      act(() => {
        result.current.handleKeyDown(event as any, 'test-menu');
      });
    });

    it('should set keyboard navigation mode when using keyboard', async () => {
      const onInteractionModeChange = jest.fn();
      const { result } = renderHook(() =>
        useMegaMenuInteraction({ onInteractionModeChange })
      );

      act(() => {
        result.current.registerMenu('test-menu', mockMenuElement, mockTriggerElement);
      });

      const event = mockKeyboardEvent('Enter');

      act(() => {
        result.current.handleKeyDown(event as any, 'test-menu');
      });

      await waitFor(() => {
        expect(onInteractionModeChange).toHaveBeenCalledWith('keyboard');
      });
    });
  });

  describe('Utility Props and Helpers', () => {
    it('should provide menu props helper', () => {
      const { result } = renderHook(() => useMegaMenuInteraction());

      const menuProps = result.current.getMenuProps('test-menu');

      expect(menuProps).toHaveProperty('onMouseEnter');
      expect(menuProps).toHaveProperty('onMouseLeave');
      expect(menuProps).toHaveProperty('onClick');
      expect(menuProps).toHaveProperty('onKeyDown');
      expect(menuProps).toHaveProperty('aria-expanded');
      expect(menuProps).toHaveProperty('aria-haspopup');
      expect(menuProps).toHaveProperty('data-menu-trigger');
      expect(menuProps).toHaveProperty('role');
    });

    it('should provide trigger props helper', () => {
      const { result } = renderHook(() => useMegaMenuInteraction());

      const triggerProps = result.current.getTriggerProps('test-menu');

      expect(triggerProps).toHaveProperty('data-menu-trigger');
      expect(triggerProps).toHaveProperty('data-menu-active');
      expect(triggerProps).toHaveProperty('data-menu-pending');
    });

    it('should provide menu state helpers', () => {
      const { result } = renderHook(() => useMegaMenuInteraction());

      expect(typeof result.current.isMenuOpen).toBe('function');
      expect(typeof result.current.isMenuPending).toBe('function');

      expect(result.current.isMenuOpen('test-menu')).toBe(false);
      expect(result.current.isMenuPending('test-menu')).toBe(false);
    });

    it('should provide cursor tracking information', () => {
      const { result } = renderHook(() => useMegaMenuInteraction());

      expect(result.current.cursorPosition).toBeDefined();
      expect(result.current.cursorVelocity).toBeDefined();
    });
  });

  describe('Global Mouse Tracking', () => {
    beforeEach(() => {
      // Mock mouse move events
      document.addEventListener = jest.fn();
      document.removeEventListener = jest.fn();
    });

    it('should setup global mouse tracking when triangle safe zone is enabled', () => {
      renderHook(() =>
        useMegaMenuInteraction({
          config: {
            triangleSafeZone: { enabled: true }
          }
        })
      );

      expect(document.addEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function), { passive: true });
    });

    it('should throttle mouse move events', () => {
      const { result } = renderHook(() =>
        useMegaMenuInteraction({
          config: {
            triangleSafeZone: { enabled: true },
            performance: {
              throttleMs: 32,
              useRAF: false
            }
          }
        })
      );

      // Global mouse tracking should be active
      expect(document.addEventListener).toHaveBeenCalled();
    });

    it('should use requestAnimationFrame when enabled', () => {
      renderHook(() =>
        useMegaMenuInteraction({
          config: {
            triangleSafeZone: { enabled: true },
            performance: {
              useRAF: true,
              throttleMs: 16
            }
          }
        })
      );

      expect(document.addEventListener).toHaveBeenCalled();
    });
  });

  describe('Outside Click Handling', () => {
    it('should close menu on outside click in click mode', async () => {
      const { result } = renderHook(() => useMegaMenuInteraction());

      act(() => {
        result.current.registerMenu('test-menu', mockMenuElement, mockTriggerElement);
      });

      // Set to click mode and open menu
      const clickEvent = mockMouseEvent('click');
      act(() => {
        result.current.handleClick('test-menu', clickEvent as any);
      });

      await waitFor(() => {
        expect(result.current.activeMenu).toBe('test-menu');
      });

      // Simulate outside click
      const outsideElement = createMockElement();
      mockMenuElement.contains = jest.fn().mockReturnValue(false);

      const outsideClickEvent = new MouseEvent('mousedown', {
        target: outsideElement
      } as any);

      act(() => {
        document.dispatchEvent(outsideClickEvent);
      });

      await waitFor(() => {
        expect(result.current.activeMenu).toBeNull();
      });
    });

    it('should not close menu on inside click', async () => {
      const { result } = renderHook(() => useMegaMenuInteraction());

      act(() => {
        result.current.registerMenu('test-menu', mockMenuElement, mockTriggerElement);
      });

      // Open menu
      act(() => {
        result.current.openMenu('test-menu', true);
      });

      // Simulate inside click
      mockMenuElement.contains = jest.fn().mockReturnValue(true);

      const insideClickEvent = new MouseEvent('mousedown', {
        target: mockMenuElement
      } as any);

      act(() => {
        document.dispatchEvent(insideClickEvent);
      });

      // Menu should remain open
      expect(result.current.activeMenu).toBe('test-menu');
    });
  });

  describe('Performance and Memory Management', () => {
    it('should cleanup timers on unmount', () => {
      const { unmount } = renderHook(() => useMegaMenuInteraction());

      expect(() => unmount()).not.toThrow();
    });

    it('should cancel animation frames on unmount', () => {
      const { unmount } = renderHook(() =>
        useMegaMenuInteraction({
          config: {
            triangleSafeZone: { enabled: true },
            performance: { useRAF: true }
          }
        })
      );

      unmount();

      expect(mockCancelRaf).toHaveBeenCalled();
    });

    it('should remove global event listeners on unmount', () => {
      const { unmount } = renderHook(() =>
        useMegaMenuInteraction({
          config: {
            triangleSafeZone: { enabled: true }
          }
        })
      );

      unmount();

      expect(document.removeEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
    });

    it('should handle rapid state changes without memory leaks', async () => {
      const { result } = renderHook(() => useMegaMenuInteraction());

      act(() => {
        result.current.registerMenu('test-menu', mockMenuElement, mockTriggerElement);
      });

      // Rapid open/close cycles
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.openMenu('test-menu', true);
          result.current.closeMenu('test-menu', true);
        });
      }

      expect(result.current.activeMenu).toBeNull();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle menu registration with missing elements', () => {
      const { result } = renderHook(() => useMegaMenuInteraction());

      expect(() => {
        act(() => {
          result.current.registerMenu('test-menu', mockMenuElement);
        });
      }).not.toThrow();
    });

    it('should handle opening non-existent menu', () => {
      const { result } = renderHook(() => useMegaMenuInteraction());

      expect(() => {
        act(() => {
          result.current.openMenu('non-existent-menu');
        });
      }).not.toThrow();
    });

    it('should handle closing non-active menu', () => {
      const { result } = renderHook(() => useMegaMenuInteraction());

      expect(() => {
        act(() => {
          result.current.closeMenu('non-active-menu');
        });
      }).not.toThrow();
    });

    it('should handle events with invalid targets', () => {
      const { result } = renderHook(() => useMegaMenuInteraction());

      const invalidEvent = { ...mockMouseEvent('click'), target: null } as any;

      expect(() => {
        act(() => {
          result.current.handleClick('test-menu', invalidEvent);
        });
      }).not.toThrow();
    });

    it('should handle keyboard events with missing elements', () => {
      const { result } = renderHook(() => useMegaMenuInteraction());

      mockMenuElement.querySelectorAll = jest.fn().mockReturnValue([]);

      expect(() => {
        act(() => {
          result.current.handleKeyDown(mockKeyboardEvent('ArrowDown') as any, 'test-menu');
        });
      }).not.toThrow();
    });

    it('should handle safe zone calculation with invalid cursor data', () => {
      const { CursorTracker } = require('../../application/utils/triangle-safe-zone');
      const mockTracker = CursorTracker.mockImplementation(() => ({
        addPosition: jest.fn(),
        getLatest: jest.fn().mockReturnValue(null),
        getPrevious: jest.fn().mockReturnValue(null),
        getPositions: jest.fn().mockReturnValue([]),
        getVelocity: jest.fn().mockReturnValue(0),
        start: jest.fn(),
        stop: jest.fn()
      }));

      const { result } = renderHook(() =>
        useMegaMenuInteraction({
          config: {
            triangleSafeZone: { enabled: true }
          }
        })
      );

      act(() => {
        result.current.registerMenu('test-menu', mockMenuElement, mockTriggerElement);
      });

      expect(() => {
        act(() => {
          result.current.openMenu('test-menu');
        });
      }).not.toThrow();
    });
  });

  describe('Accessibility Features', () => {
    it('should focus first item when menu opens via keyboard', async () => {
      const focusableElement = createMockElement('button');
      mockMenuElement.querySelector = jest.fn().mockReturnValue(focusableElement);

      const { result } = renderHook(() =>
        useMegaMenuInteraction({
          config: {
            accessibility: {
              focusFirstItem: true,
              announceChanges: true
            }
          }
        })
      );

      act(() => {
        result.current.registerMenu('test-menu', mockMenuElement, mockTriggerElement);
      });

      act(() => {
        result.current.openMenu('test-menu', false, true); // isKeyboard = true
      });

      await waitFor(() => {
        expect(focusableElement.focus).toHaveBeenCalled();
      });
    });

    it('should update roving tabindex correctly', () => {
      const elements = [createMockElement('a'), createMockElement('button')];
      elements.forEach(el => {
        el.setAttribute = jest.fn();
      });

      mockMenuElement.querySelectorAll = jest.fn().mockReturnValue(elements);

      const { result } = renderHook(() => useMegaMenuInteraction());

      act(() => {
        result.current.registerMenu('test-menu', mockMenuElement, mockTriggerElement);
        result.current.openMenu('test-menu', true);
      });

      // Simulate keyboard navigation
      const keyEvent = mockKeyboardEvent('ArrowDown');
      act(() => {
        result.current.handleKeyDown(keyEvent as any, 'test-menu');
      });

      // Elements should have tabindex set
      elements.forEach(el => {
        expect(el.setAttribute).toHaveBeenCalledWith('tabindex', expect.any(String));
      });
    });
  });
});
