/**
 * Performance Optimization Hook
 * Provides utilities for optimizing re-renders and performance
 */

import { useCallback, useRef } from 'react';

export function usePerformanceOptimization() {
  const animationFrameId = useRef<number | null>(null);
  const pendingUpdates = useRef<(() => void)[]>([]);

  const scheduleUpdate = useCallback((callback: () => void) => {
    pendingUpdates.current.push(callback);

    if (animationFrameId.current !== null) {
      return;
    }

    animationFrameId.current = requestAnimationFrame(() => {
      const updates = [...pendingUpdates.current];
      pendingUpdates.current = [];
      animationFrameId.current = null;

      // Execute all pending updates in a single frame
      updates.forEach(update => {
        try {
          update();
        } catch (error) {
          console.error('[usePerformanceOptimization] Update failed:', error);
        }
      });
    });
  }, []);

  const isAnimationFrameScheduled = useCallback(() => {
    return animationFrameId.current !== null;
  }, []);

  const optimizeReflow = useCallback((elements: HTMLElement[], operation: () => void) => {
    if (elements.length === 0) {
      operation();
      return;
    }

    // Batch DOM reads and writes to minimize reflow
    const styles = elements.map(el => ({
      element: el,
      originalStyle: el.style.cssText
    }));

    // Perform operation
    operation();

    // Restore styles if needed
    requestAnimationFrame(() => {
      styles.forEach(({ element, originalStyle }) => {
        if (element.style.cssText !== originalStyle) {
          element.style.cssText = originalStyle;
        }
      });
    });
  }, []);

  const debounce = useCallback(<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): T => {
    let timeoutId: NodeJS.Timeout;

    return ((...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
  }, []);

  const throttle = useCallback(<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): T => {
    let lastCall = 0;

    return ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    }) as T;
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (animationFrameId.current !== null) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    pendingUpdates.current = [];
  }, []);

  return {
    scheduleUpdate,
    isAnimationFrameScheduled,
    optimizeReflow,
    debounce,
    throttle,
    cleanup
  };
}