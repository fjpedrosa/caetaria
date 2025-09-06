/**
 * Application Layer - Navbar Prefetch Hook
 *
 * Hook especializado para el prefetch inteligente de navegación.
 * Integra con el sistema SmartLink y optimiza la carga de recursos.
 *
 * Principios aplicados:
 * - Single Responsibility: Solo maneja estrategias de prefetch
 * - Open/Closed: Extensible mediante nuevas estrategias sin modificar el core
 * - Interface Segregation: Expone solo las funciones necesarias para prefetch
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { usePrefetch as useSmartPrefetch } from '@/lib/prefetch';

// ============= Types =============

type PrefetchPriority = 'critical' | 'high' | 'medium' | 'low' | 'idle';
type PrefetchStrategy = 'immediate' | 'hover' | 'viewport' | 'idle' | 'predicted';
type NetworkSpeed = 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';

interface PrefetchItem {
  url: string;
  priority: PrefetchPriority;
  strategy: PrefetchStrategy;
  timestamp: number;
  completed: boolean;
  error?: Error;
}

interface PrefetchMetrics {
  totalPrefetched: number;
  successfulPrefetches: number;
  failedPrefetches: number;
  averageLoadTime: number;
  dataSaved: number; // bytes saved from cache hits
  networkCondition: NetworkSpeed;
}

interface PrefetchConfig {
  maxConcurrent: number;
  maxQueueSize: number;
  strategies: {
    viewport: {
      enabled: boolean;
      rootMargin: string; // e.g., '50px'
      threshold: number;  // 0-1
    };
    hover: {
      enabled: boolean;
      delay: number; // ms before prefetch starts
    };
    idle: {
      enabled: boolean;
      timeout: number; // ms to wait for idle
    };
    predicted: {
      enabled: boolean;
      confidence: number; // 0-1 confidence threshold
    };
  };
  networkAware: {
    enabled: boolean;
    slowConnectionThreshold: '2g' | '3g';
    reduceOnSlowConnection: boolean;
  };
  resourceHints: {
    dns: boolean;      // dns-prefetch
    preconnect: boolean;
    preload: boolean;
    modulepreload: boolean;
  };
}

interface UseNavbarPrefetchOptions {
  config?: Partial<PrefetchConfig>;
  onPrefetchStart?: (url: string) => void;
  onPrefetchComplete?: (url: string, success: boolean) => void;
  onMetricsUpdate?: (metrics: PrefetchMetrics) => void;
}

// ============= Default Configuration =============

const DEFAULT_CONFIG: PrefetchConfig = {
  maxConcurrent: 3,
  maxQueueSize: 10,
  strategies: {
    viewport: {
      enabled: true,
      rootMargin: '50px',
      threshold: 0.1
    },
    hover: {
      enabled: true,
      delay: 150
    },
    idle: {
      enabled: true,
      timeout: 2000
    },
    predicted: {
      enabled: true,
      confidence: 0.7
    }
  },
  networkAware: {
    enabled: true,
    slowConnectionThreshold: '3g',
    reduceOnSlowConnection: true
  },
  resourceHints: {
    dns: true,
    preconnect: true,
    preload: true,
    modulepreload: true
  }
};

// ============= Hook Implementation =============

export function useNavbarPrefetch(options: UseNavbarPrefetchOptions = {}) {
  const config = { ...DEFAULT_CONFIG, ...options.config };
  const { onPrefetchStart, onPrefetchComplete, onMetricsUpdate } = options;

  // SmartLink integration
  const smartPrefetch = useSmartPrefetch();

  // State
  const [queue, setQueue] = useState<Map<string, PrefetchItem>>(new Map());
  const [activePrefetches, setActivePrefetches] = useState<Set<string>>(new Set());
  const [metrics, setMetrics] = useState<PrefetchMetrics>({
    totalPrefetched: 0,
    successfulPrefetches: 0,
    failedPrefetches: 0,
    averageLoadTime: 0,
    dataSaved: 0,
    networkCondition: 'unknown'
  });

  // Refs
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hoverTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const idleCallbackRef = useRef<number | null>(null);
  const loadTimesRef = useRef<number[]>([]);
  const predictedUrlsRef = useRef<Set<string>>(new Set());
  const resourceHintsRef = useRef<Set<string>>(new Set());

  // ============= Network Detection =============

  const detectNetworkSpeed = useCallback((): NetworkSpeed => {
    const connection = (navigator as any).connection ||
                      (navigator as any).mozConnection ||
                      (navigator as any).webkitConnection;

    if (!connection) return 'unknown';

    const effectiveType = connection.effectiveType;
    if (effectiveType) return effectiveType as NetworkSpeed;

    // Fallback to bandwidth detection
    const downlink = connection.downlink;
    if (downlink) {
      if (downlink < 0.25) return 'slow-2g';
      if (downlink < 0.75) return '2g';
      if (downlink < 2) return '3g';
      return '4g';
    }

    return 'unknown';
  }, []);

  const shouldReducePrefetch = useCallback((): boolean => {
    if (!config.networkAware.enabled) return false;

    const speed = detectNetworkSpeed();
    const slowSpeeds: NetworkSpeed[] = ['slow-2g', '2g'];

    if (config.networkAware.slowConnectionThreshold === '3g') {
      slowSpeeds.push('3g');
    }

    return config.networkAware.reduceOnSlowConnection && slowSpeeds.includes(speed);
  }, [config.networkAware, detectNetworkSpeed]);

  // ============= Resource Hints =============

  const addResourceHint = useCallback((url: string, type: 'dns-prefetch' | 'preconnect' | 'preload' | 'modulepreload') => {
    if (resourceHintsRef.current.has(`${type}:${url}`)) return;

    const link = document.createElement('link');
    link.rel = type;

    if (type === 'preload' || type === 'modulepreload') {
      link.as = 'document';
      link.href = url;
    } else {
      // For dns-prefetch and preconnect, use origin only
      try {
        const urlObj = new URL(url, window.location.origin);
        link.href = urlObj.origin;
      } catch {
        link.href = url;
      }
    }

    document.head.appendChild(link);
    resourceHintsRef.current.add(`${type}:${url}`);

    // Cleanup function
    return () => {
      document.head.removeChild(link);
      resourceHintsRef.current.delete(`${type}:${url}`);
    };
  }, []);

  // ============= Prefetch Queue Management =============

  const addToQueue = useCallback((url: string, priority: PrefetchPriority, strategy: PrefetchStrategy) => {
    setQueue(prev => {
      if (prev.size >= config.maxQueueSize) {
        // Remove lowest priority item if queue is full
        const lowestPriority = Array.from(prev.values())
          .filter(item => !item.completed)
          .sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3, idle: 4 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          })[0];

        if (lowestPriority) {
          prev.delete(lowestPriority.url);
        }
      }

      const newItem: PrefetchItem = {
        url,
        priority,
        strategy,
        timestamp: Date.now(),
        completed: false
      };

      return new Map(prev).set(url, newItem);
    });
  }, [config.maxQueueSize]);

  const processPrefetch = useCallback(async (url: string) => {
    // Check if already prefetching or completed
    if (activePrefetches.has(url)) return;

    const queueItem = queue.get(url);
    if (!queueItem || queueItem.completed) return;

    // Check concurrent limit
    if (activePrefetches.size >= config.maxConcurrent) {
      // Will be retried when a slot becomes available
      return;
    }

    // Check network conditions
    if (shouldReducePrefetch() && queueItem.priority !== 'critical') {
      return;
    }

    // Start prefetch
    setActivePrefetches(prev => new Set(prev).add(url));
    onPrefetchStart?.(url);

    const startTime = performance.now();

    try {
      // Add resource hints first
      if (config.resourceHints.dns) {
        addResourceHint(url, 'dns-prefetch');
      }
      if (config.resourceHints.preconnect) {
        addResourceHint(url, 'preconnect');
      }

      // Use SmartLink's prefetch system
      await smartPrefetch(url, {
        priority: queueItem.priority as any,
        strategy: queueItem.strategy as any
      });

      const loadTime = performance.now() - startTime;
      loadTimesRef.current.push(loadTime);

      // Update metrics
      setMetrics(prev => ({
        ...prev,
        totalPrefetched: prev.totalPrefetched + 1,
        successfulPrefetches: prev.successfulPrefetches + 1,
        averageLoadTime: loadTimesRef.current.reduce((a, b) => a + b, 0) / loadTimesRef.current.length,
        networkCondition: detectNetworkSpeed()
      }));

      // Mark as completed
      setQueue(prev => {
        const updated = new Map(prev);
        const item = updated.get(url);
        if (item) {
          item.completed = true;
        }
        return updated;
      });

      onPrefetchComplete?.(url, true);
    } catch (error) {
      // Update metrics for failure
      setMetrics(prev => ({
        ...prev,
        totalPrefetched: prev.totalPrefetched + 1,
        failedPrefetches: prev.failedPrefetches + 1,
        networkCondition: detectNetworkSpeed()
      }));

      // Mark with error
      setQueue(prev => {
        const updated = new Map(prev);
        const item = updated.get(url);
        if (item) {
          item.completed = true;
          item.error = error as Error;
        }
        return updated;
      });

      onPrefetchComplete?.(url, false);
    } finally {
      setActivePrefetches(prev => {
        const updated = new Set(prev);
        updated.delete(url);
        return updated;
      });
    }
  }, [
    queue,
    activePrefetches,
    config.maxConcurrent,
    config.resourceHints,
    shouldReducePrefetch,
    onPrefetchStart,
    onPrefetchComplete,
    smartPrefetch,
    addResourceHint,
    detectNetworkSpeed
  ]);

  // ============= Strategy Implementations =============

  // Immediate prefetch
  const prefetchImmediate = useCallback((url: string, priority: PrefetchPriority = 'high') => {
    addToQueue(url, priority, 'immediate');
    processPrefetch(url);
  }, [addToQueue, processPrefetch]);

  // Hover prefetch with delay
  const prefetchOnHover = useCallback((url: string, priority: PrefetchPriority = 'medium') => {
    if (!config.strategies.hover.enabled) return;

    // Clear any existing timeout for this URL
    const existingTimeout = hoverTimeoutsRef.current.get(url);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const timeout = setTimeout(() => {
      addToQueue(url, priority, 'hover');
      processPrefetch(url);
      hoverTimeoutsRef.current.delete(url);
    }, config.strategies.hover.delay);

    hoverTimeoutsRef.current.set(url, timeout);

    // Return cleanup function
    return () => {
      clearTimeout(timeout);
      hoverTimeoutsRef.current.delete(url);
    };
  }, [config.strategies.hover, addToQueue, processPrefetch]);

  // Cancel hover prefetch
  const cancelHoverPrefetch = useCallback((url: string) => {
    const timeout = hoverTimeoutsRef.current.get(url);
    if (timeout) {
      clearTimeout(timeout);
      hoverTimeoutsRef.current.delete(url);
    }
  }, []);

  // Viewport prefetch with IntersectionObserver
  const observeForPrefetch = useCallback((element: HTMLElement, url: string, priority: PrefetchPriority = 'low') => {
    if (!config.strategies.viewport.enabled) return;

    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const url = entry.target.getAttribute('href');
              if (url) {
                addToQueue(url, 'low', 'viewport');
                processPrefetch(url);
              }
            }
          });
        },
        {
          rootMargin: config.strategies.viewport.rootMargin,
          threshold: config.strategies.viewport.threshold
        }
      );
    }

    observerRef.current.observe(element);

    // Return cleanup function
    return () => {
      observerRef.current?.unobserve(element);
    };
  }, [config.strategies.viewport, addToQueue, processPrefetch]);

  // Idle prefetch
  const prefetchOnIdle = useCallback((urls: string[], priority: PrefetchPriority = 'idle') => {
    if (!config.strategies.idle.enabled) return;
    if (!('requestIdleCallback' in window)) {
      // Fallback to setTimeout
      setTimeout(() => {
        urls.forEach(url => {
          addToQueue(url, priority, 'idle');
          processPrefetch(url);
        });
      }, config.strategies.idle.timeout);
      return;
    }

    idleCallbackRef.current = requestIdleCallback(
      () => {
        urls.forEach(url => {
          addToQueue(url, priority, 'idle');
          processPrefetch(url);
        });
      },
      { timeout: config.strategies.idle.timeout }
    );

    // Return cleanup function
    return () => {
      if (idleCallbackRef.current) {
        cancelIdleCallback(idleCallbackRef.current);
        idleCallbackRef.current = null;
      }
    };
  }, [config.strategies.idle, addToQueue, processPrefetch]);

  // Predictive prefetch based on user behavior
  const predictAndPrefetch = useCallback((currentPath: string, userHistory: string[] = []) => {
    if (!config.strategies.predicted.enabled) return;

    // Simple prediction: most common next pages based on current path
    const predictions: Record<string, string[]> = {
      '/': ['/productos', '/precios'],
      '/productos': ['/precios', '/soluciones'],
      '/precios': ['/onboarding', '/productos'],
      '/soluciones': ['/precios', '/productos']
    };

    const predictedUrls = predictions[currentPath] || [];

    // Filter by confidence (in real app, this would use ML or analytics)
    const confidentPredictions = predictedUrls.filter((url, index) => {
      const confidence = 1 - (index * 0.3); // Simple decay
      return confidence >= config.strategies.predicted.confidence;
    });

    confidentPredictions.forEach(url => {
      if (!predictedUrlsRef.current.has(url)) {
        predictedUrlsRef.current.add(url);
        addToQueue(url, 'low', 'predicted');
        processPrefetch(url);
      }
    });
  }, [config.strategies.predicted, addToQueue, processPrefetch]);

  // ============= Queue Processing =============

  useEffect(() => {
    // Process queue when there are available slots
    const processQueue = () => {
      if (activePrefetches.size >= config.maxConcurrent) return;

      // Sort queue by priority
      const pending = Array.from(queue.values())
        .filter(item => !item.completed && !activePrefetches.has(item.url))
        .sort((a, b) => {
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3, idle: 4 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

      // Process highest priority items
      const toProcess = pending.slice(0, config.maxConcurrent - activePrefetches.size);
      toProcess.forEach(item => processPrefetch(item.url));
    };

    processQueue();
  }, [queue, activePrefetches, config.maxConcurrent, processPrefetch]);

  // ============= Metrics Reporting =============

  useEffect(() => {
    onMetricsUpdate?.(metrics);
  }, [metrics, onMetricsUpdate]);

  // ============= Network Change Listener =============

  useEffect(() => {
    const connection = (navigator as any).connection ||
                      (navigator as any).mozConnection ||
                      (navigator as any).webkitConnection;

    if (!connection) return;

    const handleConnectionChange = () => {
      setMetrics(prev => ({
        ...prev,
        networkCondition: detectNetworkSpeed()
      }));
    };

    connection.addEventListener('change', handleConnectionChange);
    return () => connection.removeEventListener('change', handleConnectionChange);
  }, [detectNetworkSpeed]);

  // ============= Cleanup =============

  useEffect(() => {
    return () => {
      // Clear all timeouts
      hoverTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      hoverTimeoutsRef.current.clear();

      // Cancel idle callback
      if (idleCallbackRef.current) {
        cancelIdleCallback(idleCallbackRef.current);
      }

      // Disconnect observer
      observerRef.current?.disconnect();
    };
  }, []);

  return {
    // Actions
    prefetchImmediate,
    prefetchOnHover,
    cancelHoverPrefetch,
    observeForPrefetch,
    prefetchOnIdle,
    predictAndPrefetch,

    // State
    queue: Array.from(queue.values()),
    activePrefetches: Array.from(activePrefetches),
    metrics,
    isLoading: activePrefetches.size > 0,

    // Utilities
    isPrefetched: (url: string) => {
      const item = queue.get(url);
      return item?.completed === true && !item.error;
    },
    getPrefetchStatus: (url: string) => {
      const item = queue.get(url);
      if (!item) return 'not-queued';
      if (item.error) return 'failed';
      if (item.completed) return 'completed';
      if (activePrefetches.has(url)) return 'loading';
      return 'queued';
    },
    clearQueue: () => {
      setQueue(new Map());
      predictedUrlsRef.current.clear();
    },

    // Config
    config,
    networkSpeed: detectNetworkSpeed()
  };
}