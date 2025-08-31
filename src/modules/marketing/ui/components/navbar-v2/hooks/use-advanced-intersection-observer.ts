'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface AdvancedIntersectionOptions {
  rootMargin?: string;
  threshold?: number | number[];
  sections: string[];
  debounceDelay?: number;
}

interface SectionProgress {
  [key: string]: number;
}

interface SectionTiming {
  [key: string]: {
    enterTime: number;
    exitTime: number;
    totalTime: number;
    viewCount: number;
  };
}

interface AdvancedIntersectionState {
  activeSection: string | null;
  sectionProgress: SectionProgress;
  sectionTiming: SectionTiming;
  visibilityRatio: number;
  isIntersecting: boolean;
  scrollDirection: 'up' | 'down' | null;
  sectionHistory: string[];
}

/**
 * Advanced Intersection Observer Hook
 *
 * Proporciona detección precisa de secciones con:
 * - Múltiples umbrales de visibilidad
 * - Progreso granular por sección
 * - Timing de visualización
 * - Historial de navegación
 * - Detección de dirección de scroll
 * - Performance optimization con debouncing
 */
export function useAdvancedIntersectionObserver(
  options: AdvancedIntersectionOptions
): AdvancedIntersectionState {
  const {
    rootMargin = '-20% 0px -80% 0px',
    threshold = [0, 0.25, 0.5, 0.75, 1.0],
    sections,
    debounceDelay = 100
  } = options;

  // State management
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [sectionProgress, setSectionProgress] = useState<SectionProgress>({});
  const [sectionTiming, setSectionTiming] = useState<SectionTiming>({});
  const [visibilityRatio, setVisibilityRatio] = useState(0);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [sectionHistory, setSectionHistory] = useState<string[]>([]);

  // Refs for performance optimization
  const observersRef = useRef<Map<string, IntersectionObserver>>(new Map());
  const elementsRef = useRef<Map<string, Element>>(new Map());
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollY = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Performance-optimized intersection callback
  const createIntersectionCallback = useCallback((sectionId: string) => {
    return (entries: IntersectionObserverEntry[]) => {
      // Cancel previous animation frame if pending
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Schedule update in next animation frame for smooth performance
      animationFrameRef.current = requestAnimationFrame(() => {
        entries.forEach(entry => {
          const ratio = entry.intersectionRatio;
          const currentTime = performance.now();

          // Update section progress immediately for smooth transitions
          setSectionProgress(prev => ({
            ...prev,
            [sectionId]: ratio
          }));

          // Update visibility and intersection state
          if (entry.isIntersecting && ratio > 0.3) {
            setIsIntersecting(true);
            setVisibilityRatio(ratio);

            // Determine scroll direction
            const currentScrollY = window.scrollY;
            const direction = currentScrollY > lastScrollY.current ? 'down' : 'up';
            setScrollDirection(direction);
            lastScrollY.current = currentScrollY;

            // Debounced active section update to prevent rapid changes
            if (debounceTimerRef.current) {
              clearTimeout(debounceTimerRef.current);
            }

            debounceTimerRef.current = setTimeout(() => {
              // Only update if this section has higher visibility than current
              setSectionProgress(currentProgress => {
                const maxVisibleSection = Object.entries(currentProgress)
                  .reduce((max, [id, progress]) =>
                    progress > max.progress ? { id, progress } : max,
                    { id: '', progress: 0 }
                  );

                if (maxVisibleSection.id !== activeSection && maxVisibleSection.progress > 0.3) {
                  setActiveSection(maxVisibleSection.id);

                  // Update section history
                  setSectionHistory(prev => {
                    const newHistory = prev.filter(id => id !== maxVisibleSection.id);
                    return [maxVisibleSection.id, ...newHistory.slice(0, 4)]; // Keep last 5 sections
                  });
                }

                return currentProgress;
              });

              // Update timing information
              setSectionTiming(prev => {
                const existing = prev[sectionId] || {
                  enterTime: currentTime,
                  exitTime: 0,
                  totalTime: 0,
                  viewCount: 0
                };

                return {
                  ...prev,
                  [sectionId]: {
                    ...existing,
                    enterTime: entry.isIntersecting ? currentTime : existing.enterTime,
                    exitTime: !entry.isIntersecting ? currentTime : existing.exitTime,
                    totalTime: !entry.isIntersecting && existing.enterTime
                      ? existing.totalTime + (currentTime - existing.enterTime)
                      : existing.totalTime,
                    viewCount: entry.isIntersecting && !existing.enterTime
                      ? existing.viewCount + 1
                      : existing.viewCount
                  }
                };
              });
            }, debounceDelay);
          } else if (!entry.isIntersecting) {
            setIsIntersecting(false);
            setVisibilityRatio(0);
          }
        });
      });
    };
  }, [activeSection, debounceDelay]);

  // Initialize observers for all sections
  useEffect(() => {
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      console.warn('[AdvancedIntersectionObserver] IntersectionObserver not supported, falling back to scroll detection');
      return;
    }

    // Clean up existing observers
    observersRef.current.forEach(observer => observer.disconnect());
    observersRef.current.clear();
    elementsRef.current.clear();

    // Initialize observers for each section
    sections.forEach(sectionId => {
      const element = document.getElementById(sectionId) ||
                     document.querySelector(`[data-section="${sectionId}"]`) ||
                     document.querySelector(`.${sectionId}-section`);

      if (element) {
        elementsRef.current.set(sectionId, element);

        const observer = new IntersectionObserver(
          createIntersectionCallback(sectionId),
          {
            root: null,
            rootMargin,
            threshold: Array.isArray(threshold) ? threshold : [threshold]
          }
        );

        observer.observe(element);
        observersRef.current.set(sectionId, observer);
      } else {
        console.warn(`[AdvancedIntersectionObserver] Element not found for section: ${sectionId}`);
      }
    });

    // Cleanup function
    return () => {
      observersRef.current.forEach(observer => observer.disconnect());
      observersRef.current.clear();
      elementsRef.current.clear();

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [sections, rootMargin, threshold, createIntersectionCallback]);

  // Fallback scroll-based detection for unsupported browsers
  useEffect(() => {
    if (window.IntersectionObserver) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      sections.forEach(sectionId => {
        const element = elementsRef.current.get(sectionId);
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + scrollY;
        const elementHeight = rect.height;

        // Calculate visibility ratio
        const visibleTop = Math.max(0, Math.min(windowHeight, windowHeight - rect.top));
        const visibleBottom = Math.max(0, Math.min(windowHeight, elementHeight + rect.top));
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        const ratio = elementHeight > 0 ? visibleHeight / Math.min(elementHeight, windowHeight) : 0;

        setSectionProgress(prev => ({
          ...prev,
          [sectionId]: ratio
        }));

        if (ratio > 0.3 && ratio > visibilityRatio) {
          setActiveSection(sectionId);
          setVisibilityRatio(ratio);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections, visibilityRatio]);

  return {
    activeSection,
    sectionProgress,
    sectionTiming,
    visibilityRatio,
    isIntersecting,
    scrollDirection,
    sectionHistory
  };
}

/**
 * Simplified hook for basic section detection
 */
export function useActiveSection(sections: string[]): string | null {
  const { activeSection } = useAdvancedIntersectionObserver({
    sections,
    threshold: 0.5
  });

  return activeSection;
}

/**
 * Hook for section progress tracking
 */
export function useSectionProgress(sectionId: string): number {
  const { sectionProgress } = useAdvancedIntersectionObserver({
    sections: [sectionId],
    threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
  });

  return sectionProgress[sectionId] || 0;
}