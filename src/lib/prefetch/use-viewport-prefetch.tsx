/**
 * Viewport Prefetch Hook for Next.js 15
 *
 * Advanced Intersection Observer implementation for viewport-based prefetching
 * with performance optimization and bandwidth awareness.
 */

'use client';

import React, { createContext, useCallback, useContext,useEffect, useMemo, useRef, useState } from 'react';

import { getRouteConfig, isExternalRoute } from './config';
import type {
  PerfConstraints,
  PrefetchResult,
  SmartPrefetchHook,
  ViewportIntersection} from './types';
import { debounce, getNetworkInfo,isFastConnection, throttle } from './utils';

/**
 * Viewport Prefetch Options
 */
interface ViewportPrefetchOptions {
  /** Intersection threshold (0-1) */
  threshold?: number;
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Debounce delay for intersection events */
  debounceDelay?: number;
  /** Only prefetch on fast connections */
  fastConnectionOnly?: boolean;
  /** Maximum concurrent viewport prefetches */
  maxConcurrent?: number;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Viewport Prefetch Hook Return Value
 */
interface ViewportPrefetchHook {
  /** Register element for viewport prefetch */
  registerElement: (element: Element, url: string) => () => void;
  /** Unregister element */
  unregisterElement: (element: Element) => void;
  /** Get currently observed elements */
  getObservedElements: () => ViewportIntersection[];
  /** Clear all observers */
  clearAll: () => void;
  /** Performance metrics */
  metrics: {
    totalObserved: number;
    currentlyVisible: number;
    successfulPrefetches: number;
    failedPrefetches: number;
  };
}

/**
 * Default viewport prefetch options
 */
const DEFAULT_OPTIONS: Required<ViewportPrefetchOptions> = {
  threshold: 0.1,
  rootMargin: '100px',
  debounceDelay: 150,
  fastConnectionOnly: true,
  maxConcurrent: 3,
  debug: false
};

/**
 * Use Viewport Prefetch Hook
 */
export function useViewportPrefetch(
  smartPrefetch: SmartPrefetchHook,
  options: ViewportPrefetchOptions = {}
): ViewportPrefetchHook {
  const config = useMemo(() => ({
    ...DEFAULT_OPTIONS,
    ...options
  }), [options]);

  // State management
  const [observedElements, setObservedElements] = useState<Map<Element, ViewportIntersection>>(
    new Map()
  );
  const [metrics, setMetrics] = useState({
    totalObserved: 0,
    currentlyVisible: 0,
    successfulPrefetches: 0,
    failedPrefetches: 0
  });

  // Refs for performance
  const observerRef = useRef<IntersectionObserver | null>(null);
  const activePrefetches = useRef<Set<string>>(new Set());
  const prefetchedUrls = useRef<Set<string>>(new Set());
  const pendingPrefetches = useRef<Map<string, NodeJS.Timeout>>(new Map());

  /**
   * Handle intersection changes with debouncing
   */
  const handleIntersection = useMemo(
    () => debounce((entries: IntersectionObserverEntry[]) => {
      const networkInfo = getNetworkInfo();
      const visibleCount = entries.filter(entry => entry.isIntersecting).length;

      setMetrics(prev => ({
        ...prev,
        currentlyVisible: visibleCount
      }));

      entries.forEach(entry => {
        const element = entry.target;
        const intersection = observedElements.get(element);

        if (!intersection) return;

        const { url, config: routeConfig } = intersection;

        // Update intersection data
        intersection.intersectionRatio = entry.intersectionRatio;
        intersection.isIntersecting = entry.isIntersecting;

        if (config.debug) {
          console.log('[ViewportPrefetch] Intersection change:', {
            url,
            isIntersecting: entry.isIntersecting,
            intersectionRatio: entry.intersectionRatio
          });
        }

        // Handle entering viewport
        if (entry.isIntersecting &&
            entry.intersectionRatio >= config.threshold &&
            !prefetchedUrls.current.has(url) &&
            !activePrefetches.current.has(url)) {

          // Check network conditions
          if (config.fastConnectionOnly &&
              !isFastConnection(networkInfo, smartPrefetch.constraints.minConnectionSpeed)) {
            if (config.debug) {
              console.log('[ViewportPrefetch] Skipping due to slow connection:', url);
            }
            return;
          }

          // Check concurrent limit
          if (activePrefetches.current.size >= config.maxConcurrent) {
            if (config.debug) {
              console.log('[ViewportPrefetch] Max concurrent reached, queuing:', url);
            }
            return;
          }

          // Prefetch with delay for performance
          const prefetchDelay = routeConfig?.delay || 100;
          const timeoutId = setTimeout(async () => {
            try {
              activePrefetches.current.add(url);

              await smartPrefetch.prefetch(url, {
                trigger: 'viewport',
                priority: routeConfig?.priority,
                strategy: 'viewport',
                element
              });

              prefetchedUrls.current.add(url);

              setMetrics(prev => ({
                ...prev,
                successfulPrefetches: prev.successfulPrefetches + 1
              }));

              if (config.debug) {
                console.log('[ViewportPrefetch] Prefetch successful:', url);
              }

            } catch (error) {
              setMetrics(prev => ({
                ...prev,
                failedPrefetches: prev.failedPrefetches + 1
              }));

              if (config.debug) {
                console.error('[ViewportPrefetch] Prefetch failed:', url, error);
              }
            } finally {
              activePrefetches.current.delete(url);
              pendingPrefetches.current.delete(url);
            }
          }, prefetchDelay);

          pendingPrefetches.current.set(url, timeoutId);
        }

        // Handle leaving viewport
        if (!entry.isIntersecting) {
          const timeoutId = pendingPrefetches.current.get(url);
          if (timeoutId) {
            clearTimeout(timeoutId);
            pendingPrefetches.current.delete(url);
          }
        }
      });
    }, config.debounceDelay),
    [observedElements, config, smartPrefetch]
  );

  /**
   * Initialize Intersection Observer
   */
  useEffect(() => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(handleIntersection, {
        threshold: config.threshold,
        rootMargin: config.rootMargin
      });
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [handleIntersection, config.threshold, config.rootMargin]);

  /**
   * Register element for viewport prefetch
   */
  const registerElement = useCallback((element: Element, url: string) => {
    if (isExternalRoute(url) || prefetchedUrls.current.has(url)) {
      return () => {}; // No-op cleanup
    }

    const routeConfig = getRouteConfig(url);
    if (!routeConfig || routeConfig.strategy !== 'viewport') {
      if (config.debug) {
        console.warn('[ViewportPrefetch] URL not configured for viewport prefetch:', url);
      }
      return () => {};
    }

    const intersection: ViewportIntersection = {
      element,
      intersectionRatio: 0,
      isIntersecting: false,
      url,
      config: routeConfig,
      observer: observerRef.current || undefined
    };

    setObservedElements(prev => new Map(prev.set(element, intersection)));

    if (observerRef.current) {
      observerRef.current.observe(element);
    }

    setMetrics(prev => ({
      ...prev,
      totalObserved: prev.totalObserved + 1
    }));

    if (config.debug) {
      console.log('[ViewportPrefetch] Element registered:', { url, element });
    }

    // Return cleanup function
    return () => {
      unregisterElement(element);
    };
  }, [config.debug]);

  /**
   * Unregister element
   */
  const unregisterElement = useCallback((element: Element) => {
    const intersection = observedElements.get(element);

    if (intersection) {
      // Cancel pending prefetch
      const timeoutId = pendingPrefetches.current.get(intersection.url);
      if (timeoutId) {
        clearTimeout(timeoutId);
        pendingPrefetches.current.delete(intersection.url);
      }

      // Remove from active prefetches
      activePrefetches.current.delete(intersection.url);

      // Unobserve element
      if (observerRef.current) {
        observerRef.current.unobserve(element);
      }

      // Remove from state
      setObservedElements(prev => {
        const newMap = new Map(prev);
        newMap.delete(element);
        return newMap;
      });

      if (config.debug) {
        console.log('[ViewportPrefetch] Element unregistered:', intersection.url);
      }
    }
  }, [observedElements, config.debug]);

  /**
   * Get currently observed elements
   */
  const getObservedElements = useCallback((): ViewportIntersection[] => {
    return Array.from(observedElements.values());
  }, [observedElements]);

  /**
   * Clear all observers
   */
  const clearAll = useCallback(() => {
    // Clear all pending timeouts
    pendingPrefetches.current.forEach(timeoutId => clearTimeout(timeoutId));
    pendingPrefetches.current.clear();

    // Clear active prefetches
    activePrefetches.current.clear();

    // Disconnect observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Clear state
    setObservedElements(new Map());
    setMetrics({
      totalObserved: 0,
      currentlyVisible: 0,
      successfulPrefetches: 0,
      failedPrefetches: 0
    });

    if (config.debug) {
      console.log('[ViewportPrefetch] All observers cleared');
    }
  }, [config.debug]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      clearAll();
    };
  }, [clearAll]);

  return {
    registerElement,
    unregisterElement,
    getObservedElements,
    clearAll,
    metrics
  };
}

/**
 * React Hook for automatic viewport prefetch registration
 */
export function useAutoViewportPrefetch(
  element: Element | null,
  url: string,
  smartPrefetch: SmartPrefetchHook,
  options: ViewportPrefetchOptions = {}
) {
  const { registerElement, unregisterElement } = useViewportPrefetch(smartPrefetch, options);

  useEffect(() => {
    if (!element || !url) return;

    const cleanup = registerElement(element, url);
    return cleanup;
  }, [element, url, registerElement]);
}

/**
 * Viewport Prefetch Context for providing smart prefetch instance
 */

const ViewportPrefetchContext = createContext<SmartPrefetchHook | null>(null);

export const ViewportPrefetchProvider: React.FC<{
  smartPrefetch: SmartPrefetchHook;
  children: React.ReactNode;
}> = ({ smartPrefetch, children }) => {
  return (
    <ViewportPrefetchContext.Provider value={smartPrefetch}>
      {children}
    </ViewportPrefetchContext.Provider>
  );
};

export function useViewportPrefetchContext(): SmartPrefetchHook {
  const context = useContext(ViewportPrefetchContext);
  if (!context) {
    throw new Error('useViewportPrefetchContext must be used within ViewportPrefetchProvider');
  }
  return context;
}