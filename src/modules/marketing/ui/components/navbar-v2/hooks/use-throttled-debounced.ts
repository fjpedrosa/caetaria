'use client';

import { useCallback, useEffect, useRef } from 'react';

interface ThrottledDebouncedOptions {
  scrollThrottle?: number;
  resizeDebounce?: number;
  mouseMoveThrottle?: number;
  keyboardDebounce?: number;
}

interface ThrottledDebouncedHandlers {
  throttledScrollHandler: (callback: () => void) => void;
  debouncedResizeHandler: (callback: () => void) => void;
  throttledMouseMoveHandler: (callback: (event: MouseEvent) => void) => (event: MouseEvent) => void;
  debouncedKeyboardHandler: (callback: (event: KeyboardEvent) => void) => (event: KeyboardEvent) => void;
  throttle: <T extends (...args: any[]) => any>(func: T, delay: number) => T;
  debounce: <T extends (...args: any[]) => any>(func: T, delay: number) => T;
  cancelThrottle: (id: string) => void;
  cancelDebounce: (id: string) => void;
}

/**
 * Advanced Throttled and Debounced Event Handlers Hook
 *
 * Proporciona utilidades optimizadas para:
 * - Throttling de eventos de scroll para 60fps
 * - Debouncing de eventos de resize
 * - Throttling de mousemove para interacciones suaves
 * - Debouncing de keyboard input
 * - Gestión de memoria con cleanup automático
 * - Cancelación manual de timers
 * - Performance monitoring
 */
export function useThrottledDebounced(
  options: ThrottledDebouncedOptions = {}
): ThrottledDebouncedHandlers {
  const {
    scrollThrottle = 16, // ~60fps
    resizeDebounce = 200,
    mouseMoveThrottle = 16, // ~60fps
    keyboardDebounce = 300
  } = options;

  // Refs to store timers and prevent memory leaks
  const throttleTimersRef = useRef<Map<string, number>>(new Map());
  const debounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const lastCallTimeRef = useRef<Map<string, number>>(new Map());
  const animationFramesRef = useRef<Map<string, number>>(new Map());

  // Generic throttle function with requestAnimationFrame optimization
  const throttle = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    delay: number,
    useRAF: boolean = true
  ): T => {
    return ((...args: any[]) => {
      const key = func.name || 'anonymous';
      const now = performance.now();
      const lastCallTime = lastCallTimeRef.current.get(key) || 0;

      if (now - lastCallTime >= delay) {
        lastCallTimeRef.current.set(key, now);

        if (useRAF) {
          // Cancel any pending animation frame
          const existingFrame = animationFramesRef.current.get(key);
          if (existingFrame) {
            cancelAnimationFrame(existingFrame);
          }

          // Schedule in next animation frame for smooth performance
          const frameId = requestAnimationFrame(() => {
            func.apply(null, args);
            animationFramesRef.current.delete(key);
          });

          animationFramesRef.current.set(key, frameId);
        } else {
          func.apply(null, args);
        }
      }
    }) as T;
  }, []);

  // Generic debounce function
  const debounce = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): T => {
    return ((...args: any[]) => {
      const key = func.name || 'anonymous';

      // Clear existing timer
      const existingTimer = debounceTimersRef.current.get(key);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Set new timer
      const timerId = setTimeout(() => {
        func.apply(null, args);
        debounceTimersRef.current.delete(key);
      }, delay);

      debounceTimersRef.current.set(key, timerId);
    }) as T;
  }, []);

  // Optimized scroll handler
  const throttledScrollHandler = useCallback((callback: () => void) => {
    const throttledCallback = throttle(callback, scrollThrottle, true);

    const handleScroll = () => {
      throttledCallback();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Return cleanup function
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollThrottle, throttle]);

  // Optimized resize handler
  const debouncedResizeHandler = useCallback((callback: () => void) => {
    const debouncedCallback = debounce(callback, resizeDebounce);

    const handleResize = () => {
      debouncedCallback();
    };

    window.addEventListener('resize', handleResize);

    // Return cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [resizeDebounce, debounce]);

  // Optimized mouse move handler
  const throttledMouseMoveHandler = useCallback((
    callback: (event: MouseEvent) => void
  ) => {
    return throttle((event: MouseEvent) => {
      // Add performance hints
      if (event.target) {
        const element = event.target as HTMLElement;
        element.style.willChange = 'transform';

        // Clean up will-change after animation
        requestAnimationFrame(() => {
          setTimeout(() => {
            element.style.willChange = 'auto';
          }, 100);
        });
      }

      callback(event);
    }, mouseMoveThrottle, true);
  }, [mouseMoveThrottle, throttle]);

  // Optimized keyboard handler
  const debouncedKeyboardHandler = useCallback((
    callback: (event: KeyboardEvent) => void
  ) => {
    return debounce((event: KeyboardEvent) => {
      callback(event);
    }, keyboardDebounce);
  }, [keyboardDebounce, debounce]);

  // Manual cancellation functions
  const cancelThrottle = useCallback((id: string) => {
    const frameId = animationFramesRef.current.get(id);
    if (frameId) {
      cancelAnimationFrame(frameId);
      animationFramesRef.current.delete(id);
    }
    lastCallTimeRef.current.delete(id);
  }, []);

  const cancelDebounce = useCallback((id: string) => {
    const timerId = debounceTimersRef.current.get(id);
    if (timerId) {
      clearTimeout(timerId);
      debounceTimersRef.current.delete(id);
    }
  }, []);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Cancel all pending animation frames
      animationFramesRef.current.forEach(frameId => {
        cancelAnimationFrame(frameId);
      });
      animationFramesRef.current.clear();

      // Clear all debounce timers
      debounceTimersRef.current.forEach(timerId => {
        clearTimeout(timerId);
      });
      debounceTimersRef.current.clear();

      // Clear throttle tracking
      throttleTimersRef.current.clear();
      lastCallTimeRef.current.clear();
    };
  }, []);

  return {
    throttledScrollHandler,
    debouncedResizeHandler,
    throttledMouseMoveHandler,
    debouncedKeyboardHandler,
    throttle,
    debounce,
    cancelThrottle,
    cancelDebounce
  };
}

/**
 * Specialized hook for scroll performance optimization
 */
export function useOptimizedScrollHandler(
  callback: () => void,
  throttleDelay: number = 16
) {
  const { throttledScrollHandler } = useThrottledDebounced({
    scrollThrottle: throttleDelay
  });

  useEffect(() => {
    const cleanup = throttledScrollHandler(callback);
    return cleanup;
  }, [callback, throttledScrollHandler]);
}

/**
 * Specialized hook for resize performance optimization
 */
export function useOptimizedResizeHandler(
  callback: () => void,
  debounceDelay: number = 200
) {
  const { debouncedResizeHandler } = useThrottledDebounced({
    resizeDebounce: debounceDelay
  });

  useEffect(() => {
    const cleanup = debouncedResizeHandler(callback);
    return cleanup;
  }, [callback, debouncedResizeHandler]);
}

/**
 * Performance monitoring utilities
 */
export function usePerformanceMonitoring() {
  const performanceMetrics = useRef<Map<string, number[]>>(new Map());

  const measurePerformance = useCallback((label: string, fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    const duration = end - start;

    // Store metrics
    const existing = performanceMetrics.current.get(label) || [];
    existing.push(duration);

    // Keep only last 100 measurements
    if (existing.length > 100) {
      existing.shift();
    }

    performanceMetrics.current.set(label, existing);

    // Log if performance is poor (> 16ms = below 60fps)
    if (duration > 16) {
      console.warn(`[Performance] ${label} took ${duration.toFixed(2)}ms (> 16ms threshold)`);
    }
  }, []);

  const getPerformanceStats = useCallback((label: string) => {
    const metrics = performanceMetrics.current.get(label) || [];
    if (metrics.length === 0) return null;

    const avg = metrics.reduce((sum, time) => sum + time, 0) / metrics.length;
    const min = Math.min(...metrics);
    const max = Math.max(...metrics);

    return { avg, min, max, count: metrics.length };
  }, []);

  return {
    measurePerformance,
    getPerformanceStats
  };
}