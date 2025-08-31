/**
 * Smart Navigation Hook
 * Provides smooth scrolling to sections and active item detection
 */

import { useCallback, useState } from 'react';

interface SmartNavigationOptions {
  offset?: number;
  duration?: number;
  easing?: string;
}

export function useSmartNavigation(options: SmartNavigationOptions = {}) {
  const {
    offset = 80,
    duration = 800,
    easing = 'easeInOutCubic'
  } = options;

  const [isNavigating, setIsNavigating] = useState(false);

  const easingFunctions = {
    easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    easeOutQuad: (t: number) => t * (2 - t),
    linear: (t: number) => t
  };

  const smoothScrollTo = useCallback((targetY: number) => {
    return new Promise<void>((resolve) => {
      const startY = window.scrollY;
      const distance = targetY - startY;
      const startTime = performance.now();

      const easingFunction = easingFunctions[easing as keyof typeof easingFunctions] || easingFunctions.easeInOutCubic;

      function step(currentTime: number) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easingFunction(progress);

        window.scrollTo(0, startY + distance * easedProgress);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      }

      requestAnimationFrame(step);
    });
  }, [duration, easing]);

  const navigateToSection = useCallback(async (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (!element) {
      console.warn(`[useSmartNavigation] Section "${sectionId}" not found`);
      return;
    }

    setIsNavigating(true);

    try {
      const elementTop = element.getBoundingClientRect().top + window.scrollY;
      const targetY = Math.max(0, elementTop - offset);

      await smoothScrollTo(targetY);
    } catch (error) {
      console.error('[useSmartNavigation] Navigation failed:', error);
    } finally {
      setIsNavigating(false);
    }
  }, [offset, smoothScrollTo]);

  const getActiveNavItem = useCallback((currentSection: string) => {
    // Map sections to navigation items
    const sectionToNavMap: Record<string, string> = {
      'hero': '/',
      'features': '/productos',
      'pricing': '/precios',
      'testimonials': '/roadmap',
      'faq': '/soluciones'
    };

    return sectionToNavMap[currentSection] || '/';
  }, []);

  return {
    navigateToSection,
    isNavigating,
    getActiveNavItem
  };
}