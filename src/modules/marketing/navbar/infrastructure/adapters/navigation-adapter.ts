/**
 * Infrastructure Layer - Navigation Adapter
 *
 * Implementación concreta del servicio de navegación.
 * Principio aplicado: Dependency Inversion - Implementa la interfaz del dominio
 */

import { SCROLL_THRESHOLDS, SECTION_IDS } from '../../domain/constants';
import type { NavigationService } from '../../domain/types';

export class NavigationAdapter implements NavigationService {
  private isNavigating = false;
  private prefetchCache = new Map<string, boolean>();

  /**
   * Navigate to a specific section with smooth scrolling
   */
  async navigateToSection(sectionId: string, options?: ScrollToOptions): Promise<void> {
    if (this.isNavigating) return;

    this.isNavigating = true;

    try {
      const element = document.getElementById(sectionId);
      if (!element) {
        throw new Error(`Section with id "${sectionId}" not found`);
      }

      const offset = 80; // Navbar height
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: options?.behavior || 'smooth'
      });

      // Wait for scroll to complete (approximate)
      await new Promise(resolve => setTimeout(resolve, SCROLL_THRESHOLDS.SMOOTH_SCROLL_DURATION));

    } finally {
      this.isNavigating = false;
    }
  }

  /**
   * Navigate to a route using Next.js router
   */
  async navigateToRoute(href: string): Promise<void> {
    // Check if it's an internal section link
    if (href.startsWith('#')) {
      const sectionId = href.slice(1);
      return this.navigateToSection(sectionId);
    }

    // For external navigation, we'll use window.location
    // In a real implementation, this would use Next.js router
    window.location.href = href;
  }

  /**
   * Prefetch a route for faster navigation
   */
  async prefetchRoute(href: string): Promise<void> {
    // Skip if already prefetched
    if (this.prefetchCache.has(href)) {
      return;
    }

    try {
      // In a real implementation, this would use Next.js prefetch
      // For now, we'll simulate with a link element
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);

      this.prefetchCache.set(href, true);

      // Clean up old prefetch links after some time
      setTimeout(() => {
        document.head.removeChild(link);
        this.prefetchCache.delete(href);
      }, 60000); // 1 minute cache

    } catch (error) {
      console.error(`Failed to prefetch route: ${href}`, error);
      throw error;
    }
  }

  /**
   * Get the currently visible section
   */
  getCurrentSection(): string | null {
    const scrollPosition = window.scrollY + 100; // Offset for navbar

    for (const sectionId of SECTION_IDS) {
      const element = document.getElementById(sectionId);
      if (element) {
        const { offsetTop, offsetHeight } = element;
        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
          return sectionId;
        }
      }
    }

    return SECTION_IDS[0] || null;
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.prefetchCache.clear();
    this.isNavigating = false;
  }
}

// Factory function for functional approach
export const createNavigationAdapter = (): NavigationService => {
  return new NavigationAdapter();
};