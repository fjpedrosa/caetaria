/**
 * Smart Prefetch Hook for Next.js 15
 *
 * Intelligent prefetching system with bandwidth awareness, cache management,
 * and multiple prefetch strategies optimized for Next.js 15 App Router.
 */

'use client';

import { useCallback, useEffect, useMemo,useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  DEFAULT_PERF_CONSTRAINTS,
  getRouteConfig,
  isExternalRoute,
  ROUTE_CONFIGS} from './config';
import type {
  CacheEntry,
  NetworkInfo,
  PerfMetrics,
  PrefetchOptions,
  PrefetchQueueItem,
  PrefetchResult,
  PrefetchStatus,
  PrefetchTrigger,
  SmartPrefetchHook,
  SmartPrefetchOptions,
  ViewportIntersection} from './types';
import {
  cleanExpiredCache,
  debounce,
  evictLRUCache,
  generateRequestId,
  getBandwidthQualitySettings,
  getNetworkInfo,
  isFastConnection,
  isSameOrigin,
  isValidURL,
  MetricsCalculator,
  normalizeURL,
  sortPrefetchQueue,
  supportsPrefetch,
  supportsPreload,
  throttle} from './utils';

/**
 * Smart Prefetch Hook Implementation
 */
export function useSmartPrefetch(options: SmartPrefetchOptions = {}): SmartPrefetchHook {
  const router = useRouter();

  // Configuration
  const constraints = useMemo(() => ({
    ...DEFAULT_PERF_CONSTRAINTS,
    ...options.constraints
  }), [options.constraints]);

  // State management
  const [status, setStatus] = useState<PrefetchStatus>('idle');
  const [isReady, setIsReady] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [isEnabled, setEnabledState] = useState(!options.disabled);

  // Refs for persistent data
  const cache = useRef<Map<string, CacheEntry>>(new Map());
  const queue = useRef<PrefetchQueueItem[]>([]);
  const activeOperations = useRef<Map<string, AbortController>>(new Map());
  const metricsCalculator = useRef(new MetricsCalculator());
  const intersectionObservers = useRef<Map<string, IntersectionObserver>>(new Map());
  const idleCallbackId = useRef<number | null>(null);

  /**
   * Initialize system on mount
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check browser support
        if (!supportsPrefetch()) {
          console.warn('[SmartPrefetch] Prefetch not supported in this browser');
          return;
        }

        // Get initial network info
        const info = getNetworkInfo();
        setNetworkInfo(info);

        // Start immediate prefetch for critical routes
        await prefetchCriticalRoutes();

        setIsReady(true);
        if (options.debug) {
          console.log('[SmartPrefetch] System initialized', { networkInfo: info, constraints });
        }
      } catch (error) {
        console.error('[SmartPrefetch] Initialization failed:', error);
        setStatus('error');
      }
    };

    initialize();

    // Network change listener
    const handleNetworkChange = () => {
      const info = getNetworkInfo();
      setNetworkInfo(info);

      if (options.debug) {
        console.log('[SmartPrefetch] Network changed:', info);
      }
    };

    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      (navigator as any).connection?.addEventListener('change', handleNetworkChange);
    }

    return () => {
      // Cleanup
      if (typeof navigator !== 'undefined' && 'connection' in navigator) {
        (navigator as any).connection?.removeEventListener('change', handleNetworkChange);
      }

      // Cancel all active operations
      activeOperations.current.forEach(controller => controller.abort());
      activeOperations.current.clear();

      // Clear intersection observers
      intersectionObservers.current.forEach(observer => observer.disconnect());
      intersectionObservers.current.clear();

      // Clear idle callback
      if (idleCallbackId.current) {
        cancelIdleCallback(idleCallbackId.current);
      }
    };
  }, []);

  /**
   * Prefetch critical routes immediately on page load
   */
  const prefetchCriticalRoutes = useCallback(async () => {
    const criticalRoutes = ROUTE_CONFIGS.filter(config =>
      config.strategy === 'immediate' && config.priority === 'critical'
    );

    for (const route of criticalRoutes) {
      if (route.delay) {
        setTimeout(() => {
          prefetch(route.path, {
            trigger: 'immediate',
            priority: route.priority,
            highPriority: route.highPriority
          });
        }, route.delay);
      } else {
        await prefetch(route.path, {
          trigger: 'immediate',
          priority: route.priority,
          highPriority: route.highPriority
        });
      }
    }
  }, []);

  /**
   * Main prefetch function with intelligent strategy selection
   */
  const prefetch = useCallback(async (
    url: string,
    prefetchOptions: PrefetchOptions = {}
  ): Promise<PrefetchResult> => {
    const startTime = Date.now();
    const normalizedUrl = normalizeURL(url);

    if (options.debug) {
      console.log('[SmartPrefetch] Prefetch requested:', { url: normalizedUrl, options: prefetchOptions });
    }

    // Validation
    if (!isEnabled) {
      return createErrorResult(normalizedUrl, 'Prefetching disabled', startTime);
    }

    if (!isValidURL(normalizedUrl)) {
      return createErrorResult(normalizedUrl, 'Invalid URL', startTime);
    }

    if (isExternalRoute(normalizedUrl)) {
      return createErrorResult(normalizedUrl, 'External URL not supported', startTime);
    }

    // Check cache first
    const cachedEntry = cache.current.get(normalizedUrl);
    if (cachedEntry && !prefetchOptions.force &&
        (cachedEntry.timestamp + cachedEntry.ttl) > Date.now()) {

      // Update access time
      cachedEntry.lastAccess = Date.now();
      cachedEntry.accessCount++;

      metricsCalculator.current.updateMetrics(true, 0, true);

      return {
        url: normalizedUrl,
        status: 'cached',
        startTime,
        endTime: Date.now(),
        duration: 0,
        fromCache: true,
        config: getRouteConfig(normalizedUrl) || undefined
      };
    }

    // Get route configuration
    const routeConfig = getRouteConfig(normalizedUrl) || {
      path: normalizedUrl,
      strategy: 'hover',
      priority: 'medium',
      options: { cacheTime: 120000 }
    };

    // Check constraints
    const constraintCheck = checkConstraints(routeConfig, prefetchOptions);
    if (!constraintCheck.allowed) {
      return createErrorResult(normalizedUrl, constraintCheck.reason, startTime);
    }

    try {
      setStatus('loading');

      // Create abort controller
      const abortController = new AbortController();
      activeOperations.current.set(normalizedUrl, abortController);

      // Use Next.js router.prefetch for optimal performance
      await router.prefetch(normalizedUrl, {
        kind: prefetchOptions.highPriority || routeConfig.highPriority ? 'auto' : 'hover'
      });

      // Cache the result
      const cacheEntry: CacheEntry = {
        url: normalizedUrl,
        timestamp: Date.now(),
        size: 0, // Next.js handles this internally
        accessCount: 1,
        lastAccess: Date.now(),
        ttl: routeConfig.options?.cacheTime || 120000,
        metadata: {
          strategy: routeConfig.strategy,
          priority: routeConfig.priority,
          trigger: prefetchOptions.trigger || 'manual'
        }
      };

      cache.current.set(normalizedUrl, cacheEntry);

      // Cleanup active operation
      activeOperations.current.delete(normalizedUrl);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Update metrics
      metricsCalculator.current.updateMetrics(true, duration, false);
      metricsCalculator.current.updateCacheMetrics(Array.from(cache.current.values()));

      setStatus('success');

      if (options.debug) {
        console.log('[SmartPrefetch] Prefetch successful:', { url: normalizedUrl, duration });
      }

      return {
        url: normalizedUrl,
        status: 'success',
        startTime,
        endTime,
        duration,
        fromCache: false,
        config: routeConfig
      };

    } catch (error) {
      activeOperations.current.delete(normalizedUrl);
      setStatus('error');

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      metricsCalculator.current.updateMetrics(false);

      if (options.debug) {
        console.error('[SmartPrefetch] Prefetch failed:', { url: normalizedUrl, error: errorMessage });
      }

      return createErrorResult(normalizedUrl, errorMessage, startTime);
    }
  }, [router, isEnabled, options.debug]);

  /**
   * Cancel prefetch operation
   */
  const cancel = useCallback((url: string) => {
    const normalizedUrl = normalizeURL(url);
    const controller = activeOperations.current.get(normalizedUrl);

    if (controller) {
      controller.abort();
      activeOperations.current.delete(normalizedUrl);

      if (options.debug) {
        console.log('[SmartPrefetch] Cancelled:', normalizedUrl);
      }
    }
  }, [options.debug]);

  /**
   * Clear prefetch cache
   */
  const clearCache = useCallback(() => {
    cache.current.clear();
    metricsCalculator.current.updateCacheMetrics([]);

    if (options.debug) {
      console.log('[SmartPrefetch] Cache cleared');
    }
  }, [options.debug]);

  /**
   * Get performance metrics
   */
  const getMetrics = useCallback((): PerfMetrics => {
    return metricsCalculator.current.getMetrics();
  }, []);

  /**
   * Check if URL is cached
   */
  const isCached = useCallback((url: string): boolean => {
    const normalizedUrl = normalizeURL(url);
    const entry = cache.current.get(normalizedUrl);

    return entry !== undefined &&
           (entry.timestamp + entry.ttl) > Date.now();
  }, []);

  /**
   * Get cache entries
   */
  const getCacheEntries = useCallback((): CacheEntry[] => {
    return Array.from(cache.current.values());
  }, []);

  /**
   * Set enabled state
   */
  const setEnabled = useCallback((enabled: boolean) => {
    setEnabledState(enabled);

    if (!enabled) {
      // Cancel all active operations when disabled
      activeOperations.current.forEach(controller => controller.abort());
      activeOperations.current.clear();
    }

    if (options.debug) {
      console.log('[SmartPrefetch] Enabled state changed:', enabled);
    }
  }, [options.debug]);

  /**
   * Check performance constraints before prefetch
   */
  const checkConstraints = useCallback((
    routeConfig: any,
    prefetchOptions: PrefetchOptions
  ): { allowed: boolean; reason?: string } => {
    // Check if disabled
    if (!isEnabled) {
      return { allowed: false, reason: 'Prefetching disabled' };
    }

    // Check max concurrent operations
    if (activeOperations.current.size >= constraints.maxConcurrentPrefetch) {
      return { allowed: false, reason: 'Max concurrent operations reached' };
    }

    // Check operations per minute limit
    const metrics = metricsCalculator.current.getMetrics();
    if (metrics.opsPerMinute >= constraints.maxPrefetchPerMinute) {
      return { allowed: false, reason: 'Rate limit exceeded' };
    }

    // Check memory usage
    const cacheSize = cache.current.size;
    const memoryUsage = metricsCalculator.current.getMetrics().memoryUsage;
    if (memoryUsage > constraints.maxMemoryUsage * 1024 * 1024) {
      // Try to clean up cache
      const entries = Array.from(cache.current.values());
      const cleanedEntries = evictLRUCache(entries, constraints.maxMemoryUsage * 1024 * 1024);

      // Update cache
      cache.current.clear();
      cleanedEntries.forEach(entry => cache.current.set(entry.url, entry));

      if (cache.current.size === cacheSize) {
        return { allowed: false, reason: 'Memory limit exceeded' };
      }
    }

    // Check network conditions for bandwidth-aware prefetch
    if (routeConfig.options?.fastConnectionOnly &&
        !isFastConnection(networkInfo, constraints.minConnectionSpeed)) {
      return { allowed: false, reason: 'Connection too slow' };
    }

    return { allowed: true };
  }, [isEnabled, constraints, networkInfo]);

  /**
   * Create error result object
   */
  const createErrorResult = useCallback((
    url: string,
    error: string,
    startTime: number
  ): PrefetchResult => {
    return {
      url,
      status: 'error',
      startTime,
      endTime: Date.now(),
      duration: Date.now() - startTime,
      error,
      fromCache: false
    };
  }, []);

  // Periodic cache maintenance
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const entries = Array.from(cache.current.values());
      const cleanedEntries = cleanExpiredCache(entries);

      if (cleanedEntries.length !== entries.length) {
        cache.current.clear();
        cleanedEntries.forEach(entry => cache.current.set(entry.url, entry));

        metricsCalculator.current.updateCacheMetrics(cleanedEntries);

        if (options.debug) {
          console.log('[SmartPrefetch] Cache cleaned:', {
            removed: entries.length - cleanedEntries.length,
            remaining: cleanedEntries.length
          });
        }
      }
    }, 60000); // Clean every minute

    return () => clearInterval(cleanupInterval);
  }, [options.debug]);

  return {
    prefetch,
    cancel,
    clearCache,
    getMetrics,
    isCached,
    getCacheEntries,
    status,
    isReady,
    networkInfo,
    constraints,
    setEnabled
  };
}