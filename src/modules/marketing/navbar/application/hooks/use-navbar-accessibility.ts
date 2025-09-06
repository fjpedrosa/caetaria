/**
 * Application Layer - Navbar Accessibility Hook
 *
 * Hook que maneja toda la lógica de accesibilidad del navbar.
 * Principio aplicado: Single Responsibility - Solo maneja accesibilidad
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { DEFAULT_ACCESSIBILITY_CONFIG, KEYBOARD_SHORTCUTS } from '../../domain/constants';
import type { AccessibilityConfig,AccessibilityState } from '../../domain/types';

interface UseNavbarAccessibilityOptions {
  config?: Partial<AccessibilityConfig>;
  onAnnouncement?: (message: string) => void;
  onFocusChange?: (element: string | null) => void;
}

export function useNavbarAccessibility(options: UseNavbarAccessibilityOptions = {}) {
  const config = { ...DEFAULT_ACCESSIBILITY_CONFIG, ...options.config };
  const { onAnnouncement, onFocusChange } = options;

  const [state, setState] = useState<AccessibilityState>({
    announcements: [],
    focusedElement: null,
    skipLinkVisible: false,
    reducedMotion: false,
    highContrast: false,
    screenReaderActive: false,
    keyboardNavigating: false
  });

  const focusTrapRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const announcementTimers = useRef<Set<NodeJS.Timeout>>(new Set());

  // ============= Detect User Preferences =============

  const detectUserPreferences = useCallback(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const highContrast = window.matchMedia('(prefers-contrast: high)').matches;

    // Screen reader detection (heuristic approach)
    const screenReaderActive =
      window.speechSynthesis?.getVoices().length > 0 ||
      navigator.userAgent.includes('NVDA') ||
      navigator.userAgent.includes('JAWS') ||
      window.navigator.userAgent.includes('VoiceOver');

    setState(prev => ({
      ...prev,
      reducedMotion,
      highContrast,
      screenReaderActive
    }));

    return { reducedMotion, highContrast, screenReaderActive };
  }, []);

  // ============= Screen Reader Announcements =============

  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setState(prev => ({
      ...prev,
      announcements: [...prev.announcements, message]
    }));

    onAnnouncement?.(message);

    // Create live region announcement
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);

    // Remove after announcement
    const timer = setTimeout(() => {
      document.body.removeChild(announcement);
      setState(prev => ({
        ...prev,
        announcements: prev.announcements.filter(ann => ann !== message)
      }));
      announcementTimers.current.delete(timer);
    }, 1000);

    announcementTimers.current.add(timer);
  }, [onAnnouncement]);

  // ============= Enhanced Focus Management with Smart Focus Trap =============

  const trapFocus = useCallback((containerElement: HTMLElement) => {
    if (!config.enableFocusTrap) return;

    // Store previous focus for restoration
    previousFocusRef.current = document.activeElement as HTMLElement;
    focusTrapRef.current = containerElement;

    // More comprehensive selector for focusable elements
    const focusableSelector = [
      'a[href]:not([disabled])',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input[type="text"]:not([disabled])',
      'input[type="radio"]:not([disabled])',
      'input[type="checkbox"]:not([disabled])',
      'input[type="submit"]:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"]):not([disabled])',
      'details:not([disabled])',
      'summary:not(:disabled)',
      '[contenteditable]:not([contenteditable="false"])'
    ].join(', ');

    // Function to get currently focusable elements (dynamic)
    const getFocusableElements = (): NodeListOf<HTMLElement> => {
      return containerElement.querySelectorAll<HTMLElement>(focusableSelector);
    };

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) {
      // If no focusable elements, focus the container itself
      containerElement.setAttribute('tabindex', '-1');
      containerElement.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Announce to screen readers
    announceToScreenReader('Menú abierto, usa Tab para navegar');

    // Focus first element with a small delay for smoother animation
    requestAnimationFrame(() => {
      firstElement.focus();
    });

    // Enhanced tab key handler with dynamic element checking
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      // Re-query focusable elements in case DOM changed
      const currentFocusableElements = getFocusableElements();
      if (currentFocusableElements.length === 0) return;

      const currentFirst = currentFocusableElements[0];
      const currentLast = currentFocusableElements[currentFocusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab - Moving backwards
        if (document.activeElement === currentFirst) {
          e.preventDefault();
          currentLast.focus();
        }
      } else {
        // Tab - Moving forwards
        if (document.activeElement === currentLast) {
          e.preventDefault();
          currentFirst.focus();
        }
      }
    };

    // Handle focus leaving the container (for programmatic focus changes)
    const handleFocusOut = (e: FocusEvent) => {
      // Check if focus is moving outside the container
      requestAnimationFrame(() => {
        if (!containerElement.contains(document.activeElement)) {
          // Focus has left the container, bring it back
          const focusableElements = getFocusableElements();
          if (focusableElements.length > 0) {
            focusableElements[0].focus();
          }
        }
      });
    };

    containerElement.addEventListener('keydown', handleTabKey);
    containerElement.addEventListener('focusout', handleFocusOut);

    // Store cleanup function
    (containerElement as any)._focusTrapCleanup = () => {
      containerElement.removeEventListener('keydown', handleTabKey);
      containerElement.removeEventListener('focusout', handleFocusOut);

      // Remove temporary tabindex if added
      if (containerElement.getAttribute('tabindex') === '-1') {
        containerElement.removeAttribute('tabindex');
      }
    };
  }, [config.enableFocusTrap, announceToScreenReader]);

  const releaseFocus = useCallback(() => {
    if (!focusTrapRef.current) return;

    // Clean up event listener
    const cleanup = (focusTrapRef.current as any)._focusTrapCleanup;
    if (cleanup) {
      cleanup();
      delete (focusTrapRef.current as any)._focusTrapCleanup;
    }

    // Restore previous focus
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }

    focusTrapRef.current = null;
  }, []);

  // ============= Enhanced Keyboard Navigation with Arrow Keys =============

  const handleKeyboardNavigation = useCallback((event: KeyboardEvent) => {
    if (!config.enableKeyboardShortcuts) return;

    // Detect keyboard navigation mode
    if (event.key === 'Tab') {
      setState(prev => ({ ...prev, keyboardNavigating: true }));
    }

    // Skip to main content (Alt + S)
    if (event.altKey && event.key.toLowerCase() === 's') {
      event.preventDefault();
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.focus();
        mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        announceToScreenReader('Saltando al contenido principal', 'assertive');
      }
    }

    // Toggle mobile menu (Alt + M)
    if (event.altKey && event.key.toLowerCase() === 'm') {
      event.preventDefault();
      document.dispatchEvent(new CustomEvent('navbar:toggle-mobile-menu'));
      announceToScreenReader('Menú móvil activado');
    }

    // Navigate with arrow keys in navbar
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      const activeElement = document.activeElement as HTMLElement;
      const navbar = activeElement?.closest('[role="navigation"]');

      if (navbar) {
        event.preventDefault();
        handleArrowKeyNavigation(event.key as 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown', navbar);
      }
    }

    // Home/End keys for first/last navigation item
    if (event.key === 'Home' || event.key === 'End') {
      const activeElement = document.activeElement as HTMLElement;
      const navbar = activeElement?.closest('[role="navigation"]');

      if (navbar) {
        event.preventDefault();
        const focusableElements = navbar.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length > 0) {
          const targetElement = event.key === 'Home'
            ? focusableElements[0]
            : focusableElements[focusableElements.length - 1];

          targetElement.focus();
          announceToScreenReader(`Navegando a ${event.key === 'Home' ? 'primer' : 'último'} elemento`);
        }
      }
    }

    // Escape key to close menus and return focus
    if (event.key === 'Escape') {
      // Emit custom event for menu closing
      document.dispatchEvent(new CustomEvent('navbar:escape-pressed'));

      // If in a menu, return focus to trigger element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        announceToScreenReader('Menú cerrado');
      }
    }
  }, [config.enableKeyboardShortcuts, announceToScreenReader]);

  // Helper function for arrow key navigation
  const handleArrowKeyNavigation = useCallback((key: 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown', container: Element) => {
    const focusableElements = Array.from(
      container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );

    const currentIndex = focusableElements.findIndex(el => el === document.activeElement);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;

    switch (key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = (currentIndex + 1) % focusableElements.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
        break;
    }

    if (nextIndex !== currentIndex && focusableElements[nextIndex]) {
      focusableElements[nextIndex].focus();

      // Announce the focused element
      const label = focusableElements[nextIndex].getAttribute('aria-label') ||
                   focusableElements[nextIndex].textContent?.trim();
      if (label) {
        announceToScreenReader(`Navegando a ${label}`);
      }
    }
  }, [announceToScreenReader]);

  const handleMouseMove = useCallback(() => {
    setState(prev => {
      if (prev.keyboardNavigating) {
        return { ...prev, keyboardNavigating: false };
      }
      return prev;
    });
  }, []);

  // ============= Focus Tracking =============

  const trackFocus = useCallback((element: HTMLElement | null) => {
    const elementIdentifier = element?.getAttribute('aria-label') ||
                             element?.textContent?.trim() ||
                             element?.id ||
                             null;

    setState(prev => ({ ...prev, focusedElement: elementIdentifier }));
    onFocusChange?.(elementIdentifier);
  }, [onFocusChange]);

  // ============= Skip Links Management =============

  const showSkipLinks = useCallback(() => {
    if (!config.enableSkipLinks) return;
    setState(prev => ({ ...prev, skipLinkVisible: true }));
  }, [config.enableSkipLinks]);

  const hideSkipLinks = useCallback(() => {
    setState(prev => ({ ...prev, skipLinkVisible: false }));
  }, []);

  // ============= Setup Effects =============

  useEffect(() => {
    // Detect initial preferences
    detectUserPreferences();

    // Listen for preference changes
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setState(prev => ({ ...prev, reducedMotion: e.matches }));
    };

    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setState(prev => ({ ...prev, highContrast: e.matches }));
    };

    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    highContrastQuery.addEventListener('change', handleHighContrastChange);

    // Keyboard and mouse listeners
    document.addEventListener('keydown', handleKeyboardNavigation);
    document.addEventListener('mousemove', handleMouseMove);

    // Focus tracking
    const handleFocusIn = (e: FocusEvent) => {
      trackFocus(e.target as HTMLElement);
    };

    document.addEventListener('focusin', handleFocusIn);

    return () => {
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
      document.removeEventListener('keydown', handleKeyboardNavigation);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('focusin', handleFocusIn);

      // Clear announcement timers
      announcementTimers.current.forEach(timer => clearTimeout(timer));
      announcementTimers.current.clear();
    };
  }, [detectUserPreferences, handleKeyboardNavigation, handleMouseMove, trackFocus]);

  // ============= ARIA Helpers =============

  const getAriaProps = useCallback((element: 'navbar' | 'menu' | 'button', isOpen = false) => {
    const baseProps: Record<string, any> = {
      role: element === 'navbar' ? 'navigation' : element === 'menu' ? 'menu' : 'button',
    };

    if (element === 'button') {
      baseProps['aria-expanded'] = isOpen;
      baseProps['aria-haspopup'] = 'true';
    }

    if (element === 'menu') {
      baseProps['aria-labelledby'] = 'menu-button';
    }

    return baseProps;
  }, []);

  return {
    // State
    ...state,

    // Actions
    announceToScreenReader,
    trapFocus,
    releaseFocus,
    trackFocus,
    showSkipLinks,
    hideSkipLinks,
    detectUserPreferences,

    // Helpers
    getAriaProps,

    // Config
    config
  };
}