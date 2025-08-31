/**
 * Link Prefetch Hook
 * Intelligently prefetches links on hover with caching
 */

import { useCallback, useRef, useState } from 'react';

interface PrefetchOptions {
  hoverDelay?: number;
  prefetchTimeout?: number;
  maxCacheSize?: number;
}

export function useLinkPrefetch(options: PrefetchOptions = {}) {
  const {
    hoverDelay = 300,
    prefetchTimeout = 5000,
    maxCacheSize = 10
  } = options;

  const prefetchCache = useRef(new Set<string>());
  const prefetchTimeouts = useRef(new Map<string, NodeJS.Timeout>());
  const [isPrefetching, setIsPrefetching] = useState(false);

  const prefetchLink = useCallback(async (href: string) => {
    if (prefetchCache.current.has(href) || prefetchCache.current.size >= maxCacheSize) {
      return;
    }

    setIsPrefetching(true);

    try {
      // Simple prefetch using link rel=prefetch
      if (document.querySelector(`link[href="${href}"]`)) {
        return;
      }

      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);

      prefetchCache.current.add(href);

      // Auto cleanup after timeout
      const timeout = setTimeout(() => {
        cleanupPrefetch(href);
      }, prefetchTimeout);

      prefetchTimeouts.current.set(href, timeout);
    } catch (error) {
      console.warn('[useLinkPrefetch] Failed to prefetch:', href, error);
    } finally {
      setIsPrefetching(false);
    }
  }, [maxCacheSize, prefetchTimeout]);

  const cleanupPrefetch = useCallback((href: string) => {
    const link = document.querySelector(`link[href="${href}"]`);
    if (link) {
      document.head.removeChild(link);
    }

    prefetchCache.current.delete(href);

    const timeout = prefetchTimeouts.current.get(href);
    if (timeout) {
      clearTimeout(timeout);
      prefetchTimeouts.current.delete(href);
    }
  }, []);

  return {
    prefetchLink,
    cleanupPrefetch,
    isPrefetching
  };
}