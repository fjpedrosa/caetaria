/**
 * Application Layer Tests - useNavbarAccessibility Hook
 * 
 * Tests completos para el hook de accesibilidad del navbar.
 * Cubre WCAG 2.1 AA compliance:
 * - Focus management y focus trapping
 * - Keyboard navigation (arrow keys, shortcuts)
 * - Screen reader announcements
 * - User preferences detection
 * - ARIA attributes management
 * - Skip links functionality
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import { useNavbarAccessibility } from '../../application/hooks/use-navbar-accessibility';
import { DEFAULT_ACCESSIBILITY_CONFIG } from '../../domain/constants';

// Mock MediaQueryList
const createMockMediaQuery = (matches: boolean) => ({
  matches,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  onchange: null,
  dispatchEvent: jest.fn()
});

describe('useNavbarAccessibility', () => {
  let mockMatchMedia: jest.Mock;
  let mockGetVoices: jest.Mock;
  let mockUserAgent: string;
  let mockBody: HTMLElement;
  let mockContainer: HTMLElement;
  let mockFocusableElements: HTMLElement[];
  
  const mockKeyboardEvent = (key: string, options: Partial<KeyboardEvent> = {}) => {
    const event = new KeyboardEvent('keydown', { key, ...options });
    document.dispatchEvent(event);
    return event;
  };

  const mockFocusEvent = (target: HTMLElement) => {
    const event = new FocusEvent('focusin', { target } as any);
    document.dispatchEvent(event);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock matchMedia
    mockMatchMedia = jest.fn().mockImplementation((query) => {
      if (query === '(prefers-reduced-motion: reduce)') {
        return createMockMediaQuery(false);
      }
      if (query === '(prefers-contrast: high)') {
        return createMockMediaQuery(false);
      }
      return createMockMediaQuery(false);
    });
    window.matchMedia = mockMatchMedia;
    
    // Mock speechSynthesis
    mockGetVoices = jest.fn().mockReturnValue([]);
    Object.defineProperty(window, 'speechSynthesis', {
      value: { getVoices: mockGetVoices },
      configurable: true
    });
    
    // Mock navigator.userAgent
    mockUserAgent = 'Mozilla/5.0';
    Object.defineProperty(navigator, 'userAgent', {
      get: () => mockUserAgent,
      configurable: true
    });
    
    // Mock DOM elements
    mockBody = document.createElement('div');
    mockContainer = document.createElement('div');
    mockContainer.setAttribute('role', 'navigation');
    
    mockFocusableElements = [
      document.createElement('a'),
      document.createElement('button'),
      document.createElement('input')
    ];
    
    mockFocusableElements.forEach((el, index) => {
      el.textContent = `Element ${index}`;
      el.setAttribute('href', '#');
      mockContainer.appendChild(el);
    });
    
    // Mock DOM methods
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
    document.getElementById = jest.fn();
    document.querySelector = jest.fn().mockReturnValue(mockContainer);
    // Mock document.activeElement property
    Object.defineProperty(document, 'activeElement', {
      value: mockFocusableElements[0],
      writable: true,
      configurable: true
    });
    
    // Mock element methods
    mockContainer.querySelectorAll = jest.fn().mockReturnValue(mockFocusableElements);
    mockContainer.contains = jest.fn().mockReturnValue(true);
    mockContainer.addEventListener = jest.fn();
    mockContainer.removeEventListener = jest.fn();
    
    mockFocusableElements.forEach(el => {
      el.focus = jest.fn();
      el.getAttribute = jest.fn().mockReturnValue('Test Label');
      el.setAttribute = jest.fn();
      el.removeAttribute = jest.fn();
    });
  });

  afterEach(() => {
    // Clean up event listeners
    document.removeEventListener('keydown', jest.fn());
    document.removeEventListener('mousemove', jest.fn());
    document.removeEventListener('focusin', jest.fn());
  });

  describe('Initial State and Setup', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useNavbarAccessibility());
      
      expect(result.current.announcements).toEqual([]);
      expect(result.current.focusedElement).toBeNull();
      expect(result.current.skipLinkVisible).toBe(false);
      expect(result.current.keyboardNavigating).toBe(false);
    });

    it('should merge custom config with defaults', () => {
      const customConfig = {
        enableSkipLinks: false,
        minTouchTarget: 48
      };
      
      const { result } = renderHook(() => 
        useNavbarAccessibility({ config: customConfig })
      );
      
      expect(result.current.config.enableSkipLinks).toBe(false);
      expect(result.current.config.minTouchTarget).toBe(48);
      expect(result.current.config.enableKeyboardShortcuts).toBe(DEFAULT_ACCESSIBILITY_CONFIG.enableKeyboardShortcuts);
    });

    it('should detect user preferences on mount', async () => {
      // Mock reduced motion preference
      mockMatchMedia.mockImplementation((query) => {
        if (query === '(prefers-reduced-motion: reduce)') {
          return createMockMediaQuery(true);
        }
        return createMockMediaQuery(false);
      });
      
      const { result } = renderHook(() => useNavbarAccessibility());
      
      await waitFor(() => {
        expect(result.current.reducedMotion).toBe(true);
      });
    });

    it('should detect screen reader usage', async () => {
      // Mock NVDA user agent
      mockUserAgent = 'Mozilla/5.0 NVDA';
      
      const { result } = renderHook(() => useNavbarAccessibility());
      
      await waitFor(() => {
        expect(result.current.screenReaderActive).toBe(true);
      });
    });

    it('should detect high contrast preference', async () => {
      mockMatchMedia.mockImplementation((query) => {
        if (query === '(prefers-contrast: high)') {
          return createMockMediaQuery(true);
        }
        return createMockMediaQuery(false);
      });
      
      const { result } = renderHook(() => useNavbarAccessibility());
      
      await waitFor(() => {
        expect(result.current.highContrast).toBe(true);
      });
    });
  });

  describe('Screen Reader Announcements', () => {
    beforeEach(() => {
      // Reset DOM mocks for each test
      document.body.appendChild = jest.fn();
      document.body.removeChild = jest.fn();
    });

    it('should create announcements for screen readers', async () => {
      const onAnnouncement = jest.fn();
      const { result } = renderHook(() => 
        useNavbarAccessibility({ onAnnouncement })
      );
      
      act(() => {
        result.current.announceToScreenReader('Test announcement');
      });
      
      expect(onAnnouncement).toHaveBeenCalledWith('Test announcement');
      expect(document.body.appendChild).toHaveBeenCalled();
      
      // Check that the created element has correct attributes
      const createElementCall = (document.body.appendChild as jest.Mock).mock.calls[0][0];
      expect(createElementCall.getAttribute('role')).toBe('status');
      expect(createElementCall.getAttribute('aria-live')).toBe('polite');
      expect(createElementCall.textContent).toBe('Test announcement');
    });

    it('should support assertive announcements', async () => {
      const { result } = renderHook(() => useNavbarAccessibility());
      
      act(() => {
        result.current.announceToScreenReader('Urgent message', 'assertive');
      });
      
      const createElementCall = (document.body.appendChild as jest.Mock).mock.calls[0][0];
      expect(createElementCall.getAttribute('aria-live')).toBe('assertive');
    });

    it('should clean up announcements after timeout', async () => {
      jest.useFakeTimers();
      
      const { result } = renderHook(() => useNavbarAccessibility());
      
      act(() => {
        result.current.announceToScreenReader('Temporary message');
      });
      
      expect(document.body.appendChild).toHaveBeenCalled();
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(document.body.removeChild).toHaveBeenCalled();
      });
      
      jest.useRealTimers();
    });

    it('should track announcements in state', async () => {
      const { result } = renderHook(() => useNavbarAccessibility());
      
      act(() => {
        result.current.announceToScreenReader('Message 1');
      });
      
      expect(result.current.announcements).toContain('Message 1');
      
      act(() => {
        result.current.announceToScreenReader('Message 2');
      });
      
      expect(result.current.announcements).toContain('Message 2');
    });
  });

  describe('Focus Management', () => {
    it('should trap focus in container element', () => {
      const { result } = renderHook(() => useNavbarAccessibility());
      
      act(() => {
        result.current.trapFocus(mockContainer);
      });
      
      expect(mockContainer.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(mockContainer.addEventListener).toHaveBeenCalledWith('focusout', expect.any(Function));
      expect(mockFocusableElements[0].focus).toHaveBeenCalled();
    });

    it('should announce menu opening when focus is trapped', () => {
      const { result } = renderHook(() => useNavbarAccessibility());
      
      act(() => {
        result.current.trapFocus(mockContainer);
      });
      
      expect(document.body.appendChild).toHaveBeenCalled();
      const announcement = (document.body.appendChild as jest.Mock).mock.calls[0][0];
      expect(announcement.textContent).toBe('Menú abierto, usa Tab para navegar');
    });

    it('should handle container with no focusable elements', () => {
      mockContainer.querySelectorAll = jest.fn().mockReturnValue([]);
      const { result } = renderHook(() => useNavbarAccessibility());
      
      act(() => {
        result.current.trapFocus(mockContainer);
      });
      
      expect(mockContainer.setAttribute).toHaveBeenCalledWith('tabindex', '-1');
      expect(mockContainer.focus).toBeDefined();
    });

    it('should release focus and restore previous focus', () => {
      const previousElement = document.createElement('button');
      previousElement.focus = jest.fn();
      document.activeElement = previousElement;
      
      const { result } = renderHook(() => useNavbarAccessibility());
      
      // First trap focus
      act(() => {
        result.current.trapFocus(mockContainer);
      });
      
      // Then release focus
      act(() => {
        result.current.releaseFocus();
      });
      
      expect(previousElement.focus).toHaveBeenCalled();
    });

    it('should track focused element changes', () => {
      const onFocusChange = jest.fn();
      const { result } = renderHook(() => 
        useNavbarAccessibility({ onFocusChange })
      );
      
      act(() => {
        result.current.trackFocus(mockFocusableElements[0]);
      });
      
      expect(onFocusChange).toHaveBeenCalledWith('Test Label');
      expect(result.current.focusedElement).toBe('Test Label');
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      document.getElementById = jest.fn().mockImplementation((id) => {
        if (id === 'main-content') {
          const mainContent = document.createElement('main');
          mainContent.focus = jest.fn();
          mainContent.scrollIntoView = jest.fn();
          return mainContent;
        }
        return null;
      });
    });

    it('should handle skip to main content shortcut (Alt+S)', async () => {
      const { result } = renderHook(() => useNavbarAccessibility());
      
      act(() => {
        mockKeyboardEvent('s', { altKey: true });
      });
      
      const mainContent = document.getElementById('main-content');
      await waitFor(() => {
        expect(mainContent?.focus).toHaveBeenCalled();
        expect(mainContent?.scrollIntoView).toHaveBeenCalledWith({
          behavior: 'smooth',
          block: 'start'
        });
      });
    });

    it('should handle mobile menu toggle shortcut (Alt+M)', () => {
      const dispatchEventSpy = jest.spyOn(document, 'dispatchEvent');
      
      renderHook(() => useNavbarAccessibility());
      
      act(() => {
        mockKeyboardEvent('m', { altKey: true });
      });
      
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'navbar:toggle-mobile-menu'
        })
      );
    });

    it('should handle Tab key and set keyboard navigation mode', async () => {
      const { result } = renderHook(() => useNavbarAccessibility());
      
      act(() => {
        mockKeyboardEvent('Tab');
      });
      
      await waitFor(() => {
        expect(result.current.keyboardNavigating).toBe(true);
      });
    });

    it('should handle Escape key and dispatch escape event', () => {
      const dispatchEventSpy = jest.spyOn(document, 'dispatchEvent');
      
      renderHook(() => useNavbarAccessibility());
      
      act(() => {
        mockKeyboardEvent('Escape');
      });
      
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'navbar:escape-pressed'
        })
      );
    });

    it('should handle arrow key navigation in navbar', () => {
      const { result } = renderHook(() => useNavbarAccessibility());
      
      // Mock active element being in navbar
      mockFocusableElements[0].closest = jest.fn().mockReturnValue(mockContainer);
      // Mock document.activeElement property
    Object.defineProperty(document, 'activeElement', {
      value: mockFocusableElements[0],
      writable: true,
      configurable: true
    });
      
      act(() => {
        mockKeyboardEvent('ArrowRight');
      });
      
      expect(mockFocusableElements[1].focus).toHaveBeenCalled();
    });

    it('should handle Home and End keys in navbar', () => {
      renderHook(() => useNavbarAccessibility());
      
      mockFocusableElements[1].closest = jest.fn().mockReturnValue(mockContainer);
      document.activeElement = mockFocusableElements[1];
      
      act(() => {
        mockKeyboardEvent('Home');
      });
      
      expect(mockFocusableElements[0].focus).toHaveBeenCalled();
      
      act(() => {
        mockKeyboardEvent('End');
      });
      
      expect(mockFocusableElements[2].focus).toHaveBeenCalled();
    });

    it('should handle disabled keyboard shortcuts', () => {
      const dispatchEventSpy = jest.spyOn(document, 'dispatchEvent');
      
      renderHook(() => 
        useNavbarAccessibility({
          config: { enableKeyboardShortcuts: false }
        })
      );
      
      act(() => {
        mockKeyboardEvent('s', { altKey: true });
      });
      
      expect(dispatchEventSpy).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'navbar:toggle-mobile-menu' })
      );
    });

    it('should reset keyboard navigation on mouse move', async () => {
      const { result } = renderHook(() => useNavbarAccessibility());
      
      // First set keyboard navigation
      act(() => {
        mockKeyboardEvent('Tab');
      });
      
      await waitFor(() => {
        expect(result.current.keyboardNavigating).toBe(true);
      });
      
      // Then simulate mouse move
      act(() => {
        const event = new MouseEvent('mousemove');
        document.dispatchEvent(event);
      });
      
      await waitFor(() => {
        expect(result.current.keyboardNavigating).toBe(false);
      });
    });
  });

  describe('Arrow Key Navigation', () => {
    beforeEach(() => {
      // Setup more detailed navbar structure
      mockFocusableElements.forEach((el, index) => {
        el.closest = jest.fn().mockReturnValue(mockContainer);
        el.getAttribute = jest.fn().mockImplementation((attr) => {
          if (attr === 'aria-label') return `Navigation item ${index}`;
          return null;
        });
      });
    });

    it('should navigate right with ArrowRight', async () => {
      renderHook(() => useNavbarAccessibility());
      
      // Mock document.activeElement property
    Object.defineProperty(document, 'activeElement', {
      value: mockFocusableElements[0],
      writable: true,
      configurable: true
    });
      
      act(() => {
        mockKeyboardEvent('ArrowRight');
      });
      
      await waitFor(() => {
        expect(mockFocusableElements[1].focus).toHaveBeenCalled();
      });
    });

    it('should navigate left with ArrowLeft', () => {
      renderHook(() => useNavbarAccessibility());
      
      document.activeElement = mockFocusableElements[1];
      
      act(() => {
        mockKeyboardEvent('ArrowLeft');
      });
      
      expect(mockFocusableElements[0].focus).toHaveBeenCalled();
    });

    it('should wrap around when navigating past edges', () => {
      renderHook(() => useNavbarAccessibility());
      
      // Navigate right from last element should wrap to first
      document.activeElement = mockFocusableElements[2];
      
      act(() => {
        mockKeyboardEvent('ArrowRight');
      });
      
      expect(mockFocusableElements[0].focus).toHaveBeenCalled();
      
      // Navigate left from first element should wrap to last
      // Mock document.activeElement property
    Object.defineProperty(document, 'activeElement', {
      value: mockFocusableElements[0],
      writable: true,
      configurable: true
    });
      
      act(() => {
        mockKeyboardEvent('ArrowLeft');
      });
      
      expect(mockFocusableElements[2].focus).toHaveBeenCalled();
    });

    it('should announce navigation changes', async () => {
      const { result } = renderHook(() => useNavbarAccessibility());
      
      // Mock document.activeElement property
    Object.defineProperty(document, 'activeElement', {
      value: mockFocusableElements[0],
      writable: true,
      configurable: true
    });
      
      act(() => {
        mockKeyboardEvent('ArrowRight');
      });
      
      // Check for announcement
      await waitFor(() => {
        expect(document.body.appendChild).toHaveBeenCalled();
      });
      
      const announcement = (document.body.appendChild as jest.Mock).mock.calls.find(call => 
        call[0].textContent?.includes('Navegando a')
      )?.[0];
      
      expect(announcement?.textContent).toContain('Navigation item 1');
    });
  });

  describe('Skip Links', () => {
    it('should show skip links when enabled', () => {
      const { result } = renderHook(() => useNavbarAccessibility());
      
      act(() => {
        result.current.showSkipLinks();
      });
      
      expect(result.current.skipLinkVisible).toBe(true);
    });

    it('should hide skip links', () => {
      const { result } = renderHook(() => useNavbarAccessibility());
      
      act(() => {
        result.current.showSkipLinks();
        result.current.hideSkipLinks();
      });
      
      expect(result.current.skipLinkVisible).toBe(false);
    });

    it('should not show skip links when disabled in config', () => {
      const { result } = renderHook(() => 
        useNavbarAccessibility({
          config: { enableSkipLinks: false }
        })
      );
      
      act(() => {
        result.current.showSkipLinks();
      });
      
      expect(result.current.skipLinkVisible).toBe(false);
    });
  });

  describe('ARIA Helpers', () => {
    it('should return correct ARIA props for navbar', () => {
      const { result } = renderHook(() => useNavbarAccessibility());
      
      const ariaProps = result.current.getAriaProps('navbar');
      
      expect(ariaProps.role).toBe('navigation');
    });

    it('should return correct ARIA props for menu', () => {
      const { result } = renderHook(() => useNavbarAccessibility());
      
      const ariaProps = result.current.getAriaProps('menu');
      
      expect(ariaProps.role).toBe('menu');
      expect(ariaProps['aria-labelledby']).toBe('menu-button');
    });

    it('should return correct ARIA props for button', () => {
      const { result } = renderHook(() => useNavbarAccessibility());
      
      const ariaPropsOpen = result.current.getAriaProps('button', true);
      const ariaPropsClosed = result.current.getAriaProps('button', false);
      
      expect(ariaPropsOpen.role).toBe('button');
      expect(ariaPropsOpen['aria-expanded']).toBe(true);
      expect(ariaPropsOpen['aria-haspopup']).toBe('true');
      
      expect(ariaPropsClosed['aria-expanded']).toBe(false);
    });
  });

  describe('Event Listener Management', () => {
    it('should add event listeners on mount', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      
      renderHook(() => useNavbarAccessibility());
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('focusin', expect.any(Function));
    });

    it('should remove event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      
      const { unmount } = renderHook(() => useNavbarAccessibility());
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('focusin', expect.any(Function));
    });

    it('should handle media query changes', async () => {
      const mockReducedMotionQuery = createMockMediaQuery(false);
      const mockHighContrastQuery = createMockMediaQuery(false);
      
      mockMatchMedia.mockImplementation((query) => {
        if (query === '(prefers-reduced-motion: reduce)') {
          return mockReducedMotionQuery;
        }
        if (query === '(prefers-contrast: high)') {
          return mockHighContrastQuery;
        }
        return createMockMediaQuery(false);
      });
      
      const { result } = renderHook(() => useNavbarAccessibility());
      
      // Simulate media query change
      mockReducedMotionQuery.matches = true;
      act(() => {
        const changeHandler = mockReducedMotionQuery.addEventListener.mock.calls
          .find(call => call[0] === 'change')?.[1];
        if (changeHandler) {
          changeHandler({ matches: true });
        }
      });
      
      await waitFor(() => {
        expect(result.current.reducedMotion).toBe(true);
      });
    });
  });

  describe('Memory Management', () => {
    it('should clear announcement timers on unmount', () => {
      jest.useFakeTimers();
      
      const { result, unmount } = renderHook(() => useNavbarAccessibility());
      
      // Create some announcements
      act(() => {
        result.current.announceToScreenReader('Test 1');
        result.current.announceToScreenReader('Test 2');
      });
      
      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
      
      jest.useRealTimers();
    });

    it('should cleanup focus trap references', () => {
      const { result, unmount } = renderHook(() => useNavbarAccessibility());
      
      act(() => {
        result.current.trapFocus(mockContainer);
      });
      
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing main content element', () => {
      document.getElementById = jest.fn().mockReturnValue(null);
      
      renderHook(() => useNavbarAccessibility());
      
      expect(() => {
        act(() => {
          mockKeyboardEvent('s', { altKey: true });
        });
      }).not.toThrow();
    });

    it('should handle focus tracking with null element', () => {
      const { result } = renderHook(() => useNavbarAccessibility());
      
      expect(() => {
        act(() => {
          result.current.trackFocus(null);
        });
      }).not.toThrow();
      
      expect(result.current.focusedElement).toBeNull();
    });

    it('should handle arrow navigation with no navbar found', () => {
      document.querySelector = jest.fn().mockReturnValue(null);
      
      renderHook(() => useNavbarAccessibility());
      
      expect(() => {
        act(() => {
          mockKeyboardEvent('ArrowRight');
        });
      }).not.toThrow();
    });

    it('should handle focus trap with missing container', () => {
      const { result } = renderHook(() => useNavbarAccessibility());
      
      expect(() => {
        act(() => {
          result.current.releaseFocus(); // Call without first trapping
        });
      }).not.toThrow();
    });

    it('should handle speechSynthesis API not available', () => {
      delete (window as any).speechSynthesis;
      
      expect(() => {
        renderHook(() => useNavbarAccessibility());
      }).not.toThrow();
    });

    it('should handle matchMedia not supported', () => {
      delete (window as any).matchMedia;
      
      expect(() => {
        renderHook(() => useNavbarAccessibility());
      }).not.toThrow();
    });
  });

  describe('Integration with Focus Events', () => {
    it('should track focus changes from DOM events', async () => {
      const onFocusChange = jest.fn();
      const { result } = renderHook(() => 
        useNavbarAccessibility({ onFocusChange })
      );
      
      act(() => {
        mockFocusEvent(mockFocusableElements[1]);
      });
      
      await waitFor(() => {
        expect(onFocusChange).toHaveBeenCalled();
      });
    });
  });
});
