/**
 * Prefetch Utilities for Next.js 15
 *
 * Performance optimization utilities including bandwidth monitoring,
 * cache management, and intelligent resource allocation strategies.
 */

import type { RouteConfig, RoutePriority } from './config';
import type {
  BandwidthAwareOptions,
  CacheEntry,
  NetworkInfo,
  PerfConstraints,
  PerfMetrics,
  PrefetchQueueItem} from './types';

/**
 * Get network connection information
 * Uses Navigator.connection API with fallbacks
 */
export function getNetworkInfo(): NetworkInfo | null {
  if (typeof navigator === 'undefined') return null;

  // Type assertion for navigator.connection (not in all TypeScript lib versions)
  const connection = (navigator as any).connection ||
                    (navigator as any).mozConnection ||
                    (navigator as any).webkitConnection;

  if (!connection) return null;

  return {
    effectiveType: connection.effectiveType || '4g',
    downlink: connection.downlink || 10,
    rtt: connection.rtt || 100,
    saveData: connection.saveData || false,
    type: connection.type,
  };
}

/**
 * Check if connection is fast enough for aggressive prefetch
 */
export function isFastConnection(
  networkInfo: NetworkInfo | null,
  minSpeed: number = 1.5
): boolean {
  if (!networkInfo) return true; // Assume fast if unknown

  // Respect save-data preference
  if (networkInfo.saveData) return false;

  // Check effective connection type
  const slowConnections = ['slow-2g', '2g'];
  if (slowConnections.includes(networkInfo.effectiveType)) return false;

  // Check downlink speed
  return networkInfo.downlink >= minSpeed;
}

/**
 * Calculate priority score for queue ordering
 * Higher scores get processed first
 */
export function calculatePriorityScore(
  priority: RoutePriority,
  queueTime: number,
  retryCount: number
): number {
  const priorityWeights = {
    critical: 100,
    high: 75,
    medium: 50,
    low: 25,
    external: 0
  };

  const baseScore = priorityWeights[priority] || 0;
  const ageBonus = Math.min((Date.now() - queueTime) / 1000, 20); // Max 20 points for age
  const retryPenalty = retryCount * 10; // Reduce priority for retries

  return Math.max(0, baseScore + ageBonus - retryPenalty);
}

/**
 * Sort prefetch queue by priority and age
 */
export function sortPrefetchQueue(queue: PrefetchQueueItem[]): PrefetchQueueItem[] {
  return [...queue].sort((a, b) => {
    // Update priority scores
    a.priorityScore = calculatePriorityScore(a.config.priority, a.queueTime, a.retryCount);
    b.priorityScore = calculatePriorityScore(b.config.priority, b.queueTime, b.retryCount);

    // Sort by priority score (descending)
    return b.priorityScore - a.priorityScore;
  });
}

/**
 * Estimate memory usage of cache
 * Rough estimation based on URL length and metadata
 */
export function estimateCacheMemoryUsage(entries: CacheEntry[]): number {
  return entries.reduce((total, entry) => {
    // Base size for cache entry structure
    const baseSize = 200; // bytes

    // URL string size (2 bytes per character for Unicode)
    const urlSize = entry.url.length * 2;

    // Metadata size estimation
    const metadataSize = entry.metadata
      ? JSON.stringify(entry.metadata).length * 2
      : 0;

    return total + baseSize + urlSize + metadataSize + (entry.size || 0);
  }, 0);
}

/**
 * Clean expired cache entries
 */
export function cleanExpiredCache(
  entries: CacheEntry[],
  now: number = Date.now()
): CacheEntry[] {
  return entries.filter(entry => {
    return (entry.timestamp + entry.ttl) > now;
  });
}

/**
 * Implement LRU cache eviction
 * Remove least recently used entries when memory limit exceeded
 */
export function evictLRUCache(
  entries: CacheEntry[],
  maxMemoryBytes: number
): CacheEntry[] {
  // Sort by last access time (ascending - oldest first)
  const sortedEntries = [...entries].sort((a, b) => a.lastAccess - b.lastAccess);

  let currentMemory = estimateCacheMemoryUsage(sortedEntries);
  const result: CacheEntry[] = [];

  // Keep newest entries that fit in memory limit
  for (let i = sortedEntries.length - 1; i >= 0; i--) {
    const entry = sortedEntries[i];
    const entryMemory = estimateCacheMemoryUsage([entry]);

    if (currentMemory <= maxMemoryBytes || result.length === 0) {
      result.unshift(entry);
    } else {
      currentMemory -= entryMemory;
    }
  }

  return result;
}

/**
 * Check if system supports prefetch
 */
export function supportsPrefetch(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for link prefetch support
  const link = document.createElement('link');
  return 'relList' in link && link.relList.supports('prefetch');
}

/**
 * Check if system supports preload
 */
export function supportsPreload(): boolean {
  if (typeof window === 'undefined') return false;

  const link = document.createElement('link');
  return 'relList' in link && link.relList.supports('preload');
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for rate limiting
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Create bandwidth-aware quality settings
 */
export function getBandwidthQualitySettings(
  networkInfo: NetworkInfo | null,
  options: BandwidthAwareOptions
): {
  maxConcurrent: number;
  enabledStrategies: string[];
  maxCacheSize: number;
  priority: 'low' | 'high';
} {
  if (!networkInfo || !options.enabled) {
    return options.qualityLevels.medium;
  }

  // Respect save-data preference
  if (options.respectSaveData && networkInfo.saveData) {
    return {
      ...options.qualityLevels.slow,
      maxConcurrent: 1,
      enabledStrategies: ['hover'],
    };
  }

  const speed = networkInfo.downlink;

  if (speed <= options.minSpeed) {
    return options.qualityLevels.slow;
  } else if (speed >= options.maxSpeed) {
    return options.qualityLevels.fast;
  } else {
    return options.qualityLevels.medium;
  }
}

/**
 * Generate unique request ID for tracking
 */
export function generateRequestId(): string {
  return `prefetch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Performance metrics calculator
 */
export class MetricsCalculator {
  private metrics: PerfMetrics = {
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    cacheHitRate: 0,
    avgPrefetchTime: 0,
    memoryUsage: 0,
    networkSavings: 0,
    queueSize: 0,
    opsPerMinute: 0,
    lastReset: Date.now(),
  };

  private operationTimes: number[] = [];
  private operationTimestamps: number[] = [];

  updateMetrics(
    success: boolean,
    duration?: number,
    cacheHit: boolean = false,
    networkSaving: number = 0
  ): void {
    this.metrics.totalOperations++;

    if (success) {
      this.metrics.successfulOperations++;
    } else {
      this.metrics.failedOperations++;
    }

    if (duration !== undefined) {
      this.operationTimes.push(duration);
      // Keep only last 100 operations for average calculation
      if (this.operationTimes.length > 100) {
        this.operationTimes.shift();
      }
      this.metrics.avgPrefetchTime =
        this.operationTimes.reduce((sum, time) => sum + time, 0) /
        this.operationTimes.length;
    }

    if (cacheHit) {
      this.metrics.cacheHitRate =
        this.metrics.successfulOperations > 0
          ? (this.metrics.successfulOperations - this.metrics.failedOperations) /
            this.metrics.successfulOperations
          : 0;
    }

    if (networkSaving > 0) {
      this.metrics.networkSavings += networkSaving;
    }

    // Track operations per minute
    const now = Date.now();
    this.operationTimestamps.push(now);

    // Keep only timestamps from last minute
    const oneMinuteAgo = now - 60000;
    this.operationTimestamps = this.operationTimestamps.filter(
      timestamp => timestamp > oneMinuteAgo
    );
    this.metrics.opsPerMinute = this.operationTimestamps.length;
  }

  updateCacheMetrics(entries: CacheEntry[]): void {
    this.metrics.memoryUsage = estimateCacheMemoryUsage(entries);
    this.metrics.queueSize = entries.length;
  }

  getMetrics(): PerfMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      cacheHitRate: 0,
      avgPrefetchTime: 0,
      memoryUsage: 0,
      networkSavings: 0,
      queueSize: 0,
      opsPerMinute: 0,
      lastReset: Date.now(),
    };
    this.operationTimes = [];
    this.operationTimestamps = [];
  }
}

/**
 * URL validation utilities
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url, window.location.origin);
    return true;
  } catch {
    return false;
  }
}

export function normalizeURL(url: string): string {
  try {
    const normalized = new URL(url, window.location.origin);
    return normalized.href;
  } catch {
    return url;
  }
}

export function isSameOrigin(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.origin === window.location.origin;
  } catch {
    return false;
  }
}