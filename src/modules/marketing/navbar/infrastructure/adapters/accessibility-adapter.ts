/**
 * Infrastructure Layer - Accessibility Adapter
 *
 * Implementación concreta del servicio de accesibilidad.
 * Principio aplicado: Dependency Inversion - Implementa la interfaz del dominio
 */

import type { AccessibilityService, AccessibilityState } from '../../domain/types';

export class AccessibilityAdapter implements AccessibilityService {
  private focusTrapElement: HTMLElement | null = null;
  private previousFocus: HTMLElement | null = null;
  private announcementQueue: string[] = [];
  private liveRegion: HTMLDivElement | null = null;

  constructor() {
    this.initializeLiveRegion();
  }

  /**
   * Initialize ARIA live region for screen reader announcements
   */
  private initializeLiveRegion(): void {
    if (typeof document === 'undefined') return;

    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('role', 'status');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.className = 'sr-only';
    document.body.appendChild(this.liveRegion);
  }

  /**
   * Announce a message to screen readers
   */
  announceToScreenReader(message: string): void {
    if (!this.liveRegion) {
      this.initializeLiveRegion();
    }

    // Add to queue
    this.announcementQueue.push(message);

    // Process queue
    this.processAnnouncementQueue();
  }

  /**
   * Process announcement queue with proper timing
   */
  private processAnnouncementQueue(): void {
    if (this.announcementQueue.length === 0 || !this.liveRegion) return;

    const message = this.announcementQueue.shift()!;

    // Update live region
    this.liveRegion.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = '';
      }

      // Process next message if any
      if (this.announcementQueue.length > 0) {
        this.processAnnouncementQueue();
      }
    }, 1000);
  }

  /**
   * Trap focus within a container element
   */
  trapFocus(containerElement: HTMLElement): void {
    // Store previous focus
    this.previousFocus = document.activeElement as HTMLElement;
    this.focusTrapElement = containerElement;

    // Get focusable elements
    const focusableElements = this.getFocusableElements(containerElement);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    firstElement.focus();

    // Add keydown listener for tab trapping
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    containerElement.addEventListener('keydown', handleKeyDown);

    // Store cleanup function
    (containerElement as any)._focusTrapCleanup = () => {
      containerElement.removeEventListener('keydown', handleKeyDown);
    };
  }

  /**
   * Release focus trap and restore previous focus
   */
  releaseFocus(): void {
    if (!this.focusTrapElement) return;

    // Clean up event listener
    const cleanup = (this.focusTrapElement as any)._focusTrapCleanup;
    if (cleanup) {
      cleanup();
      delete (this.focusTrapElement as any)._focusTrapCleanup;
    }

    // Restore previous focus
    if (this.previousFocus && this.previousFocus.focus) {
      this.previousFocus.focus();
    }

    this.focusTrapElement = null;
    this.previousFocus = null;
  }

  /**
   * Detect user accessibility preferences
   */
  detectUserPreferences(): AccessibilityState {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const highContrast = window.matchMedia('(prefers-contrast: high)').matches;

    // Heuristic screen reader detection
    const screenReaderActive = this.detectScreenReader();

    return {
      announcements: [...this.announcementQueue],
      focusedElement: document.activeElement?.getAttribute('aria-label') || null,
      skipLinkVisible: false,
      reducedMotion,
      highContrast,
      screenReaderActive,
      keyboardNavigating: false
    };
  }

  /**
   * Detect if a screen reader is active (heuristic approach)
   */
  private detectScreenReader(): boolean {
    // Check for common screen reader user agents
    const userAgent = navigator.userAgent;
    const screenReaderAgents = ['NVDA', 'JAWS', 'VoiceOver'];

    for (const agent of screenReaderAgents) {
      if (userAgent.includes(agent)) {
        return true;
      }
    }

    // Check for speech synthesis support (not definitive but helpful)
    if (window.speechSynthesis && window.speechSynthesis.getVoices().length > 0) {
      return true;
    }

    return false;
  }

  /**
   * Get all focusable elements within a container
   */
  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selector = `
      a[href]:not([disabled]),
      button:not([disabled]),
      textarea:not([disabled]),
      input:not([disabled]),
      select:not([disabled]),
      [tabindex]:not([tabindex="-1"])
    `;

    return Array.from(container.querySelectorAll<HTMLElement>(selector));
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.liveRegion && this.liveRegion.parentNode) {
      document.body.removeChild(this.liveRegion);
    }

    this.releaseFocus();
    this.announcementQueue = [];
    this.liveRegion = null;
  }
}

// Factory function for functional approach
export const createAccessibilityAdapter = (): AccessibilityService => {
  return new AccessibilityAdapter();
};