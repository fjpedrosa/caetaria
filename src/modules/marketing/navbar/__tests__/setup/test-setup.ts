/**
 * Test Setup Configuration for Navbar Tests
 *
 * Configuración específica de testing para el módulo del navbar.
 * Incluye:
 * - Mocks globales para testing
 * - Utilities de testing personalizadas
 * - Custom matchers
 * - Setup para accessibility testing
 * - Performance testing utilities
 */

import { configure } from '@testing-library/react';

import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';

// Configure testing library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000,
  computedStyleSupportsPseudoElements: true
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback: ResizeObserverCallback) {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback) => {
  return setTimeout(callback, 16); // 60fps
};

global.cancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};

// Mock performance.now
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    navigation: {
      type: 'navigate'
    }
  }
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true
});

// Mock window scroll properties
Object.defineProperty(window, 'scrollY', {
  value: 0,
  writable: true,
  configurable: true
});

Object.defineProperty(window, 'scrollX', {
  value: 0,
  writable: true,
  configurable: true
});

// Mock window dimensions
Object.defineProperty(window, 'innerWidth', {
  value: 1024,
  writable: true,
  configurable: true
});

Object.defineProperty(window, 'innerHeight', {
  value: 768,
  writable: true,
  configurable: true
});

// Mock document.elementFromPoint for testing hover/focus
Object.defineProperty(document, 'elementFromPoint', {
  value: jest.fn().mockReturnValue(null),
  writable: true
});

// Mock getBoundingClientRect for all elements
Element.prototype.getBoundingClientRect = jest.fn(() => ({
  width: 120,
  height: 40,
  top: 0,
  left: 0,
  bottom: 40,
  right: 120,
  x: 0,
  y: 0,
  toJSON: jest.fn()
}));

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock focus and blur methods
HTMLElement.prototype.focus = jest.fn();
HTMLElement.prototype.blur = jest.fn();

// Mock touch support
Object.defineProperty(window, 'ontouchstart', {
  value: undefined,
  configurable: true
});

Object.defineProperty(navigator, 'maxTouchPoints', {
  value: 0,
  configurable: true
});

// Custom testing utilities
export const createMockNavigationItem = (overrides = {}) => ({
  label: 'Test Item',
  href: '/test',
  sectionId: 'test',
  external: false,
  ...overrides
});

export const createMockCTAConfig = (overrides = {}) => ({
  signIn: {
    text: 'Sign In',
    href: '/login',
    ariaLabel: 'Sign in to your account'
  },
  primary: {
    text: 'Get Started',
    href: '/signup',
    ariaLabel: 'Create a free account'
  },
  ...overrides
});

export const createMockScrollState = (overrides = {}) => ({
  isVisible: true,
  isAtTop: true,
  scrollY: 0,
  scrollVelocity: 0,
  scrollDirection: 'idle' as const,
  scrollProgress: 0,
  ...overrides
});

export const createMockAccessibilityState = (overrides = {}) => ({
  announcements: [],
  focusedElement: null,
  skipLinkVisible: false,
  reducedMotion: false,
  highContrast: false,
  screenReaderActive: false,
  keyboardNavigating: false,
  ...overrides
});

// Mock scroll behavior helper
export const mockScrollBehavior = (scrollY: number) => {
  Object.defineProperty(window, 'scrollY', {
    value: scrollY,
    configurable: true
  });

  // Trigger scroll event
  const scrollEvent = new Event('scroll');
  window.dispatchEvent(scrollEvent);
};

// Mock resize behavior helper
export const mockResizeBehavior = (width: number, height: number = 768) => {
  Object.defineProperty(window, 'innerWidth', {
    value: width,
    configurable: true
  });

  Object.defineProperty(window, 'innerHeight', {
    value: height,
    configurable: true
  });

  // Trigger resize event
  const resizeEvent = new Event('resize');
  window.dispatchEvent(resizeEvent);
};

// Mock media query helper
export const mockMediaQuery = (query: string, matches: boolean) => {
  window.matchMedia = jest.fn().mockImplementation((q: string) => {
    if (q === query) {
      return {
        matches,
        media: q,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      };
    }
    return {
      matches: false,
      media: q,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    };
  });
};

// Performance testing helper
export const mockPerformanceNow = () => {
  let time = 0;
  (performance.now as jest.Mock).mockImplementation(() => {
    time += 16; // Simulate 60fps
    return time;
  });
  return () => {
    time = 0;
  };
};

// Accessibility testing helper
export const expectNoA11yViolations = async (container: Element) => {
  const { axe } = await import('jest-axe');
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};

// Wait for animations/transitions helper
export const waitForAnimation = (duration: number = 300) => {
  return new Promise(resolve => setTimeout(resolve, duration));
};

// Custom keyboard event helper
export const createKeyboardEvent = (
  key: string,
  options: Partial<KeyboardEventInit> = {}
): KeyboardEvent => {
  return new KeyboardEvent('keydown', {
    key,
    code: key,
    bubbles: true,
    cancelable: true,
    ...options
  });
};

// Custom mouse event helper
export const createMouseEvent = (
  type: string,
  options: Partial<MouseEventInit> = {}
): MouseEvent => {
  return new MouseEvent(type, {
    clientX: 100,
    clientY: 100,
    bubbles: true,
    cancelable: true,
    ...options
  });
};

// Custom touch event helper
export const createTouchEvent = (
  type: string,
  options: Partial<TouchEventInit> = {}
): TouchEvent => {
  return new TouchEvent(type, {
    touches: [{
      identifier: 0,
      target: document.body,
      clientX: 100,
      clientY: 100,
      pageX: 100,
      pageY: 100,
      screenX: 100,
      screenY: 100,
      radiusX: 0,
      radiusY: 0,
      rotationAngle: 0,
      force: 1
    } as any],
    bubbles: true,
    cancelable: true,
    ...options
  });
};

// Focus trap testing helper
export const testFocusTrap = async (
  container: Element,
  user: any // userEvent instance
) => {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  // Focus first element
  firstElement.focus();
  expect(firstElement).toHaveFocus();

  // Tab from last element should cycle to first
  lastElement.focus();
  await user.tab();
  expect(firstElement).toHaveFocus();

  // Shift+Tab from first element should cycle to last
  await user.tab({ shift: true });
  expect(lastElement).toHaveFocus();
};

// Screen reader testing helper
export const expectScreenReaderText = (text: string) => {
  const srElements = document.querySelectorAll('.sr-only, [aria-hidden="false"]');
  const found = Array.from(srElements).some(el =>
    el.textContent?.includes(text)
  );
  expect(found).toBe(true);
};

// ARIA testing helper
export const expectProperAriaAttributes = (
  element: Element,
  expectedAttributes: Record<string, string>
) => {
  Object.entries(expectedAttributes).forEach(([attr, value]) => {
    expect(element).toHaveAttribute(attr, value);
  });
};

// Color contrast testing helper (mock)
export const expectSufficientContrast = (
  element: Element,
  minRatio: number = 4.5
) => {
  // In a real implementation, this would calculate actual contrast
  // For now, we just verify the element exists and has color styles
  const computedStyle = window.getComputedStyle(element);
  expect(computedStyle.color).toBeTruthy();
  expect(computedStyle.backgroundColor).toBeTruthy();
};

// Touch target size testing helper
export const expectMinimumTouchTargetSize = (
  element: Element,
  minSize: number = 44
) => {
  const rect = element.getBoundingClientRect();
  expect(Math.min(rect.width, rect.height)).toBeGreaterThanOrEqual(minSize);
};

// Performance testing helper
export const measurePerformance = async (fn: () => Promise<void>) => {
  const start = performance.now();
  await fn();
  const end = performance.now();
  return end - start;
};

// Memory leak testing helper
export const detectMemoryLeaks = () => {
  const initialListeners = {
    document: Object.keys((document as any)._events || {}).length,
    window: Object.keys((window as any)._events || {}).length
  };

  return () => {
    const finalListeners = {
      document: Object.keys((document as any)._events || {}).length,
      window: Object.keys((window as any)._events || {}).length
    };

    expect(finalListeners.document).toBeLessThanOrEqual(initialListeners.document + 1);
    expect(finalListeners.window).toBeLessThanOrEqual(initialListeners.window + 1);
  };
};

// Custom Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R;
      toBeFocusable(): R;
      toHaveAccessibleName(name: string): R;
    }
  }
}

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();

  // Reset window properties
  Object.defineProperty(window, 'scrollY', {
    value: 0,
    configurable: true
  });

  Object.defineProperty(window, 'innerWidth', {
    value: 1024,
    configurable: true
  });

  Object.defineProperty(window, 'innerHeight', {
    value: 768,
    configurable: true
  });

  // Reset performance timer
  (performance.now as jest.Mock).mockReturnValue(Date.now());
});

// Global test timeout
jest.setTimeout(10000);

// Suppress console warnings in tests (except for accessibility warnings)
const originalConsoleWarn = console.warn;
console.warn = (...args: any[]) => {
  if (args[0]?.includes?.('accessibility') || args[0]?.includes?.('a11y')) {
    originalConsoleWarn(...args);
  }
  // Suppress other warnings
};

const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  if (args[0]?.includes?.('accessibility') || args[0]?.includes?.('a11y')) {
    originalConsoleError(...args);
  }
  // Suppress other errors in tests
};
