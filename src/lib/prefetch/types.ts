/**
 * TypeScript Type Definitions for Smart Prefetch System
 *
 * Comprehensive types for Next.js 15 optimized prefetching with
 * performance monitoring and intelligent resource management.
 */

import type { PerfConstraints,PrefetchStrategy, RouteConfig, RoutePriority } from './config';

/**
 * Network Connection Information
 */
export interface NetworkInfo {
  /** Effective connection type (4g, 3g, 2g, slow-2g) */
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g';
  /** Downlink speed estimate in Mbps */
  downlink: number;
  /** Round-trip time estimate in ms */
  rtt: number;
  /** Save-data preference */
  saveData: boolean;
  /** Connection type (cellular, wifi, ethernet, etc.) */
  type?: string;
}

/**
 * Prefetch Operation Status
 */
export type PrefetchStatus =
  | 'idle'        // No operation in progress
  | 'pending'     // Queued for prefetch
  | 'loading'     // Currently prefetching
  | 'success'     // Successfully prefetched
  | 'error'       // Failed to prefetch
  | 'cached'      // Already in cache
  | 'throttled'   // Throttled due to constraints
  | 'cancelled';  // Cancelled operation

/**
 * Prefetch Operation Result
 */
export interface PrefetchResult {
  /** Target URL */
  url: string;
  /** Operation status */
  status: PrefetchStatus;
  /** Start timestamp */
  startTime: number;
  /** End timestamp */
  endTime?: number;
  /** Duration in milliseconds */
  duration?: number;
  /** Error message if failed */
  error?: string;
  /** Cache hit information */
  fromCache?: boolean;
  /** Resource size in bytes */
  size?: number;
  /** Route configuration used */
  config?: RouteConfig;
}

/**
 * Prefetch Queue Item
 */
export interface PrefetchQueueItem {
  /** Target URL */
  url: string;
  /** Route configuration */
  config: RouteConfig;
  /** Queue timestamp */
  queueTime: number;
  /** Retry count */
  retryCount: number;
  /** Priority score for queue ordering */
  priorityScore: number;
  /** Trigger source (hover, viewport, etc.) */
  trigger: PrefetchTrigger;
  /** Element that triggered prefetch */
  element?: Element;
  /** AbortController for cancellation */
  abortController?: AbortController;
}

/**
 * Prefetch Trigger Source
 */
export type PrefetchTrigger =
  | 'immediate'   // Page load
  | 'hover'       // Mouse hover
  | 'viewport'    // Intersection Observer
  | 'idle'        // Browser idle time
  | 'manual'      // Programmatic call
  | 'prefocus'    // Keyboard navigation focus
  | 'touch';      // Touch start (mobile)

/**
 * Performance Metrics
 */
export interface PerfMetrics {
  /** Total prefetch operations */
  totalOperations: number;
  /** Successful operations */
  successfulOperations: number;
  /** Failed operations */
  failedOperations: number;
  /** Cache hit rate (0-1) */
  cacheHitRate: number;
  /** Average prefetch time (ms) */
  avgPrefetchTime: number;
  /** Memory usage (bytes) */
  memoryUsage: number;
  /** Network savings (bytes) */
  networkSavings: number;
  /** Current queue size */
  queueSize: number;
  /** Operations in last minute */
  opsPerMinute: number;
  /** Last reset timestamp */
  lastReset: number;
}

/**
 * Cache Entry
 */
export interface CacheEntry {
  /** Cached URL */
  url: string;
  /** Cache timestamp */
  timestamp: number;
  /** Entry size in bytes */
  size: number;
  /** Access count */
  accessCount: number;
  /** Last access time */
  lastAccess: number;
  /** Cache metadata */
  metadata?: Record<string, unknown>;
  /** TTL in milliseconds */
  ttl: number;
}

/**
 * Viewport Intersection Data
 */
export interface ViewportIntersection {
  /** Target element */
  element: Element;
  /** Intersection ratio (0-1) */
  intersectionRatio: number;
  /** Whether element is intersecting */
  isIntersecting: boolean;
  /** URL to prefetch */
  url: string;
  /** Route configuration */
  config: RouteConfig;
  /** Observer instance */
  observer?: IntersectionObserver;
}

/**
 * Bandwidth-aware Prefetch Options
 */
export interface BandwidthAwareOptions {
  /** Enable bandwidth monitoring */
  enabled: boolean;
  /** Min speed for aggressive prefetch (Mbps) */
  minSpeed: number;
  /** Max speed for unlimited prefetch (Mbps) */
  maxSpeed: number;
  /** Prefetch quality levels by speed */
  qualityLevels: {
    slow: PrefetchQuality;
    medium: PrefetchQuality;
    fast: PrefetchQuality;
  };
  /** Respect save-data preference */
  respectSaveData: boolean;
}

/**
 * Prefetch Quality Level
 */
export interface PrefetchQuality {
  /** Max concurrent operations */
  maxConcurrent: number;
  /** Strategies to enable */
  enabledStrategies: PrefetchStrategy[];
  /** Max cache size (MB) */
  maxCacheSize: number;
  /** Resource priority hint */
  priority: 'low' | 'high';
}

/**
 * Smart Prefetch Hook Options
 */
export interface SmartPrefetchOptions {
  /** Performance constraints */
  constraints?: Partial<PerfConstraints>;
  /** Bandwidth awareness config */
  bandwidthAware?: Partial<BandwidthAwareOptions>;
  /** Enable analytics tracking */
  analytics?: boolean;
  /** Debug mode */
  debug?: boolean;
  /** Custom route configurations */
  customRoutes?: RouteConfig[];
  /** Global prefetch disable */
  disabled?: boolean;
}

/**
 * Smart Prefetch Hook Return Value
 */
export interface SmartPrefetchHook {
  /** Prefetch a URL with automatic strategy selection */
  prefetch: (url: string, options?: PrefetchOptions) => Promise<PrefetchResult>;
  /** Cancel prefetch operation */
  cancel: (url: string) => void;
  /** Clear prefetch cache */
  clearCache: () => void;
  /** Get current performance metrics */
  getMetrics: () => PerfMetrics;
  /** Check if URL is already cached */
  isCached: (url: string) => boolean;
  /** Get current cache entries */
  getCacheEntries: () => CacheEntry[];
  /** Current operation status */
  status: PrefetchStatus;
  /** Whether system is ready */
  isReady: boolean;
  /** Current network information */
  networkInfo: NetworkInfo | null;
  /** Performance constraints */
  constraints: PerfConstraints;
  /** Enable/disable prefetching */
  setEnabled: (enabled: boolean) => void;
}

/**
 * Manual Prefetch Options
 */
export interface PrefetchOptions {
  /** Force prefetch even if cached */
  force?: boolean;
  /** Custom priority override */
  priority?: RoutePriority;
  /** Custom strategy override */
  strategy?: PrefetchStrategy;
  /** Custom cache time */
  cacheTime?: number;
  /** High priority hint */
  highPriority?: boolean;
  /** Trigger source */
  trigger?: PrefetchTrigger;
  /** Element that triggered prefetch */
  element?: Element;
  /** AbortSignal for cancellation */
  signal?: AbortSignal;
}

/**
 * SmartLink Component Props
 */
export interface SmartLinkProps {
  /** Link destination */
  href: string;
  /** Child content */
  children: React.ReactNode;
  /** CSS class name */
  className?: string;
  /** Override prefetch strategy */
  prefetchStrategy?: PrefetchStrategy;
  /** Override priority */
  priority?: RoutePriority;
  /** Disable prefetch for this link */
  noPrefetch?: boolean;
  /** Custom prefetch delay */
  delay?: number;
  /** High priority hint */
  highPriority?: boolean;
  /** Additional HTML props */
  [key: string]: unknown;
}

/**
 * Context Value for Prefetch Provider
 */
export interface PrefetchContextValue {
  /** Hook instance */
  hook: SmartPrefetchHook;
  /** Global options */
  options: SmartPrefetchOptions;
  /** Update global options */
  updateOptions: (options: Partial<SmartPrefetchOptions>) => void;
}