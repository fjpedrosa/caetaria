/**
 * Smart Prefetch System for Next.js 15
 *
 * Complete prefetch optimization system with intelligent strategies,
 * bandwidth awareness, performance monitoring, and cache management.
 *
 * @example
 * ```tsx
 * import { PrefetchProvider, SmartLink, useSmartPrefetch } from '@/lib/prefetch';
 *
 * // Wrap your app
 * <PrefetchProvider options={{ debug: true }}>
 *   <App />
 * </PrefetchProvider>
 *
 * // Use SmartLink components
 * <SmartLink href="/pricing" prefetchStrategy="hover">
 *   View Pricing
 * </SmartLink>
 *
 * // Manual prefetch control
 * const { prefetch } = useSmartPrefetch();
 * await prefetch('/dashboard');
 * ```
 */

// Core hooks and utilities
export { useSmartPrefetch } from './use-smart-prefetch';
export { useAutoViewportPrefetch, useViewportPrefetch } from './use-viewport-prefetch';

// Components
export {
  HoverLink,
  ImmediateLink,
  SmartLink,
  useManualPrefetch,
  ViewportLink} from './smart-link';

// Provider and context
export {
  PrefetchProvider,
  usePrefetch,
  usePrefetchContext} from './provider';

// Configuration and utilities
export {
  DEFAULT_PERF_CONSTRAINTS,
  getRouteConfig,
  getRoutesByPriority,
  getRoutesByStrategy,
  isExternalRoute,
  ROUTE_CONFIGS} from './config';
export {
  debounce,
  getNetworkInfo,
  isFastConnection,
  MetricsCalculator,
  prefersReducedMotion,
  supportsPrefetch,
  supportsPreload,
  throttle} from './utils';

// Types
export type {
  BandwidthAwareOptions,
  CacheEntry,
  // Performance types
  NetworkInfo,
  PerfConstraints,
  PerfMetrics,
  // Context types
  PrefetchContextValue,
  PrefetchOptions,
  PrefetchQueueItem,
  PrefetchResult,
  PrefetchStatus,
  PrefetchStrategy,
  PrefetchTrigger,
  // Configuration types
  RouteConfig,
  RoutePriority,
  // Component types
  SmartLinkProps,
  // Core types
  SmartPrefetchHook,
  SmartPrefetchOptions,
  ViewportIntersection} from './types';

/**
 * Default export for convenience
 */
import { PrefetchProvider as Provider, usePrefetch } from './provider';
import { SmartLink as Link } from './smart-link';
import { useSmartPrefetch } from './use-smart-prefetch';

export default {
  Provider,
  Link,
  useSmartPrefetch,
  usePrefetch
};

/**
 * Prefetch system version
 */
export const PREFETCH_VERSION = '1.0.0';

/**
 * Feature detection utilities
 */
export const features = {
  /** Check if prefetch is supported */
  prefetch: () => supportsPrefetch(),
  /** Check if preload is supported */
  preload: () => supportsPreload(),
  /** Check if Intersection Observer is supported */
  intersectionObserver: () => typeof IntersectionObserver !== 'undefined',
  /** Check if Network Information API is supported */
  networkInfo: () => typeof navigator !== 'undefined' && 'connection' in navigator,
  /** Check if idle callback is supported */
  idleCallback: () => typeof requestIdleCallback !== 'undefined'
} as const;