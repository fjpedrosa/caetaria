/**
 * SmartLink Component for Next.js 15
 *
 * Intelligent Link component with advanced prefetch strategies including
 * hover, viewport, and touch-based prefetching with performance optimization.
 */

'use client';

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState} from 'react';
import Link from 'next/link';

import { getRouteConfig, isExternalRoute } from './config';
import type { PrefetchTrigger,SmartLinkProps } from './types';
import { useSmartPrefetch } from './use-smart-prefetch';
import { debounce, throttle } from './utils';

/**
 * SmartLink Component with intelligent prefetch strategies
 */
export const SmartLink = forwardRef<HTMLAnchorElement, SmartLinkProps>(
  function SmartLink({
    href,
    children,
    className,
    prefetchStrategy,
    priority,
    noPrefetch = false,
    delay,
    highPriority,
    ...props
  }, ref) {
    const { prefetch, isCached, networkInfo, constraints } = useSmartPrefetch();

    // Internal state
    const [isHovered, setIsHovered] = useState(false);
    const [isInViewport, setIsInViewport] = useState(false);
    const [isTouched, setIsTouched] = useState(false);

    // Refs for performance optimization
    const linkRef = useRef<HTMLAnchorElement>(null);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
    const prefetchedRef = useRef<Set<string>>(new Set());

    // Get route configuration
    const routeConfig = useMemo(() => {
      if (noPrefetch || isExternalRoute(href)) return null;

      const config = getRouteConfig(href);
      return config ? {
        ...config,
        strategy: prefetchStrategy || config.strategy,
        priority: priority || config.priority,
        delay: delay !== undefined ? delay : config.delay,
        highPriority: highPriority !== undefined ? highPriority : config.highPriority
      } : null;
    }, [href, prefetchStrategy, priority, delay, highPriority, noPrefetch]);

    /**
     * Execute prefetch with strategy-specific logic
     */
    const executePrefetch = useCallback(async (
      trigger: PrefetchTrigger,
      immediate: boolean = false
    ) => {
      if (!routeConfig || prefetchedRef.current.has(href)) return;

      const prefetchDelay = immediate ? 0 : (routeConfig.delay || constraints.hoverDelay);

      const performPrefetch = async () => {
        try {
          await prefetch(href, {
            trigger,
            priority: routeConfig.priority,
            strategy: routeConfig.strategy,
            highPriority: routeConfig.highPriority,
            element: linkRef.current || undefined
          });

          prefetchedRef.current.add(href);
        } catch (error) {
          console.warn('[SmartLink] Prefetch failed:', href, error);
        }
      };

      if (prefetchDelay > 0) {
        setTimeout(performPrefetch, prefetchDelay);
      } else {
        await performPrefetch();
      }
    }, [href, routeConfig, prefetch, constraints.hoverDelay]);

    /**
     * Debounced hover prefetch
     */
    const debouncedHoverPrefetch = useMemo(
      () => debounce((trigger: PrefetchTrigger) => executePrefetch(trigger), 100),
      [executePrefetch]
    );

    /**
     * Throttled touch prefetch
     */
    const throttledTouchPrefetch = useMemo(
      () => throttle((trigger: PrefetchTrigger) => executePrefetch(trigger, true), 200),
      [executePrefetch]
    );

    /**
     * Mouse enter handler for hover strategy
     */
    const handleMouseEnter = useCallback(() => {
      if (!routeConfig || routeConfig.strategy !== 'hover') return;

      setIsHovered(true);

      // Clear any existing timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }

      // Check if already cached or prefetched
      if (isCached(href) || prefetchedRef.current.has(href)) return;

      debouncedHoverPrefetch('hover');
    }, [routeConfig, href, isCached, debouncedHoverPrefetch]);

    /**
     * Mouse leave handler
     */
    const handleMouseLeave = useCallback(() => {
      setIsHovered(false);

      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
    }, []);

    /**
     * Touch start handler for mobile
     */
    const handleTouchStart = useCallback(() => {
      if (!routeConfig) return;

      setIsTouched(true);

      // On mobile, prefetch immediately on touch
      if (!isCached(href) && !prefetchedRef.current.has(href)) {
        throttledTouchPrefetch('touch');
      }
    }, [routeConfig, href, isCached, throttledTouchPrefetch]);

    /**
     * Focus handler for keyboard navigation
     */
    const handleFocus = useCallback(() => {
      if (!routeConfig ||
          routeConfig.strategy !== 'hover' &&
          routeConfig.strategy !== 'manual') return;

      if (!isCached(href) && !prefetchedRef.current.has(href)) {
        // Prefetch on focus for keyboard navigation
        executePrefetch('prefocus');
      }
    }, [routeConfig, href, isCached, executePrefetch]);

    /**
     * Setup viewport intersection observer for viewport strategy
     */
    useEffect(() => {
      if (!routeConfig || routeConfig.strategy !== 'viewport' || !linkRef.current) {
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const isIntersecting = entry.intersectionRatio >= constraints.viewportThreshold;
            setIsInViewport(isIntersecting);

            if (isIntersecting &&
                !isCached(href) &&
                !prefetchedRef.current.has(href)) {
              executePrefetch('viewport');
            }
          });
        },
        {
          rootMargin: '50px',
          threshold: constraints.viewportThreshold
        }
      );

      observer.observe(linkRef.current);
      intersectionObserverRef.current = observer;

      return () => {
        if (intersectionObserverRef.current) {
          intersectionObserverRef.current.disconnect();
        }
      };
    }, [routeConfig, href, isCached, executePrefetch, constraints.viewportThreshold]);

    /**
     * Handle immediate prefetch strategy
     */
    useEffect(() => {
      if (!routeConfig || routeConfig.strategy !== 'immediate') return;

      const timer = setTimeout(() => {
        if (!isCached(href) && !prefetchedRef.current.has(href)) {
          executePrefetch('immediate', true);
        }
      }, routeConfig.delay || 0);

      return () => clearTimeout(timer);
    }, [routeConfig, href, isCached, executePrefetch]);

    /**
     * Handle idle prefetch strategy
     */
    useEffect(() => {
      if (!routeConfig || routeConfig.strategy !== 'idle') return;

      const idleCallback = (deadline: IdleDeadline) => {
        if (deadline.timeRemaining() > 0 &&
            !isCached(href) &&
            !prefetchedRef.current.has(href)) {
          executePrefetch('idle', true);
        }
      };

      let idleId: number;

      if ('requestIdleCallback' in window) {
        idleId = requestIdleCallback(idleCallback, {
          timeout: constraints.idleTimeout
        });
      } else {
        // Fallback for browsers without requestIdleCallback
        const timer = setTimeout(() => {
          if (!isCached(href) && !prefetchedRef.current.has(href)) {
            executePrefetch('idle', true);
          }
        }, constraints.idleTimeout);

        return () => clearTimeout(timer);
      }

      return () => {
        if (idleId && 'cancelIdleCallback' in window) {
          cancelIdleCallback(idleId);
        }
      };
    }, [routeConfig, href, isCached, executePrefetch, constraints.idleTimeout]);

    /**
     * Cleanup on unmount
     */
    useEffect(() => {
      return () => {
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
        }
        if (intersectionObserverRef.current) {
          intersectionObserverRef.current.disconnect();
        }
      };
    }, []);

    // Combine refs
    const combinedRef = useCallback((node: HTMLAnchorElement) => {
      linkRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }, [ref]);

    // Determine if this should use Next.js Link or regular anchor
    const isNextLink = !isExternalRoute(href) && !href.startsWith('#');

    // Event handlers
    const eventHandlers = {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onTouchStart: handleTouchStart,
      onFocus: handleFocus,
    };

    // Additional props for analytics and debugging
    const additionalProps = {
      'data-prefetch-strategy': routeConfig?.strategy,
      'data-prefetch-priority': routeConfig?.priority,
      'data-cached': isCached(href),
      'data-hovered': isHovered,
      'data-in-viewport': isInViewport,
      className: className ? `${className}` : undefined,
      ...props,
      ...eventHandlers
    };

    if (isNextLink) {
      return (
        <Link
          href={href}
          ref={combinedRef}
          prefetch={routeConfig?.strategy === 'immediate' || routeConfig?.highPriority}
          {...additionalProps}
        >
          {children}
        </Link>
      );
    } else {
      return (
        <a
          href={href}
          ref={combinedRef}
          {...additionalProps}
        >
          {children}
        </a>
      );
    }
  }
);

/**
 * Hook for manual prefetch control
 */
export function useManualPrefetch() {
  const { prefetch, cancel, isCached } = useSmartPrefetch();

  const prefetchManual = useCallback(async (href: string) => {
    if (isExternalRoute(href)) return null;

    return prefetch(href, {
      trigger: 'manual',
      strategy: 'manual'
    });
  }, [prefetch]);

  const cancelPrefetch = useCallback((href: string) => {
    cancel(href);
  }, [cancel]);

  const isUrlCached = useCallback((href: string) => {
    return isCached(href);
  }, [isCached]);

  return {
    prefetch: prefetchManual,
    cancel: cancelPrefetch,
    isCached: isUrlCached
  };
}

/**
 * SmartLink with explicit hover strategy
 */
export const HoverLink = forwardRef<HTMLAnchorElement, Omit<SmartLinkProps, 'prefetchStrategy'>>(
  function HoverLink(props, ref) {
    return <SmartLink {...props} ref={ref} prefetchStrategy="hover" />;
  }
);

/**
 * SmartLink with explicit viewport strategy
 */
export const ViewportLink = forwardRef<HTMLAnchorElement, Omit<SmartLinkProps, 'prefetchStrategy'>>(
  function ViewportLink(props, ref) {
    return <SmartLink {...props} ref={ref} prefetchStrategy="viewport" />;
  }
);

/**
 * SmartLink with explicit immediate strategy
 */
export const ImmediateLink = forwardRef<HTMLAnchorElement, Omit<SmartLinkProps, 'prefetchStrategy'>>(
  function ImmediateLink(props, ref) {
    return <SmartLink {...props} ref={ref} prefetchStrategy="immediate" />;
  }
);

// Default export
export default SmartLink;