/**
 * Prefetch Utils Tests
 *
 * Test suite for utility functions including network monitoring,
 * cache management, and performance optimizations.
 */

import type { BandwidthAwareOptions,CacheEntry, NetworkInfo, PrefetchQueueItem } from '../types';
import {
  calculatePriorityScore,
  cleanExpiredCache,
  debounce,
  estimateCacheMemoryUsage,
  evictLRUCache,
  generateRequestId,
  getBandwidthQualitySettings,
  getNetworkInfo,
  isFastConnection,
  isSameOrigin,
  isValidURL,
  MetricsCalculator,
  normalizeURL,
  prefersReducedMotion,
  sortPrefetchQueue,
  supportsPrefetch,
  supportsPreload,
  throttle} from '../utils';

// Mock window and navigator
Object.defineProperty(window, 'location', {
  value: {
    origin: 'https://neptunik.com',
    href: 'https://neptunik.com/'
  }
});

Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockImplementation(query => ({
    matches: query === '(prefers-reduced-motion: reduce)' ? false : false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }))
});

describe('Network Utilities', () => {
  beforeEach(() => {
    // Reset navigator mock
    Object.defineProperty(navigator, 'connection', {
      value: undefined,
      configurable: true
    });
  });

  describe('getNetworkInfo', () => {
    it('should return null when no connection API available', () => {
      const networkInfo = getNetworkInfo();
      expect(networkInfo).toBeNull();
    });

    it('should return network info when connection API is available', () => {
      // Mock navigator.connection
      Object.defineProperty(navigator, 'connection', {
        value: {
          effectiveType: '4g',
          downlink: 10,
          rtt: 100,
          saveData: false,
          type: 'wifi'
        },
        configurable: true
      });

      const networkInfo = getNetworkInfo();
      expect(networkInfo).toEqual({
        effectiveType: '4g',
        downlink: 10,
        rtt: 100,
        saveData: false,
        type: 'wifi'
      });
    });

    it('should handle missing properties gracefully', () => {
      Object.defineProperty(navigator, 'connection', {
        value: {
          effectiveType: '3g'
          // Missing other properties
        },
        configurable: true
      });

      const networkInfo = getNetworkInfo();
      expect(networkInfo).toEqual({
        effectiveType: '3g',
        downlink: 10, // Default value
        rtt: 100, // Default value
        saveData: false, // Default value
        type: undefined
      });
    });
  });

  describe('isFastConnection', () => {
    it('should return true for null networkInfo (assume fast)', () => {
      expect(isFastConnection(null)).toBe(true);
    });

    it('should return false when saveData is true', () => {
      const networkInfo: NetworkInfo = {
        effectiveType: '4g',
        downlink: 10,
        rtt: 100,
        saveData: true
      };

      expect(isFastConnection(networkInfo)).toBe(false);
    });

    it('should return false for slow connection types', () => {
      const slowNetworkInfo: NetworkInfo = {
        effectiveType: '2g',
        downlink: 10,
        rtt: 100,
        saveData: false
      };

      expect(isFastConnection(slowNetworkInfo)).toBe(false);

      const verySlow: NetworkInfo = {
        effectiveType: 'slow-2g',
        downlink: 10,
        rtt: 100,
        saveData: false
      };

      expect(isFastConnection(verySlow)).toBe(false);
    });

    it('should check downlink speed', () => {
      const slowDownlink: NetworkInfo = {
        effectiveType: '4g',
        downlink: 0.5, // Below default threshold of 1.5
        rtt: 100,
        saveData: false
      };

      expect(isFastConnection(slowDownlink)).toBe(false);

      const fastDownlink: NetworkInfo = {
        effectiveType: '4g',
        downlink: 5, // Above threshold
        rtt: 100,
        saveData: false
      };

      expect(isFastConnection(fastDownlink)).toBe(true);
    });

    it('should respect custom speed threshold', () => {
      const networkInfo: NetworkInfo = {
        effectiveType: '4g',
        downlink: 2,
        rtt: 100,
        saveData: false
      };

      expect(isFastConnection(networkInfo, 1)).toBe(true); // 2 > 1
      expect(isFastConnection(networkInfo, 3)).toBe(false); // 2 < 3
    });
  });
});

describe('Priority and Queue Management', () => {
  describe('calculatePriorityScore', () => {
    it('should calculate priority scores correctly', () => {
      const now = Date.now();

      expect(calculatePriorityScore('critical', now, 0)).toBe(100);
      expect(calculatePriorityScore('high', now, 0)).toBe(75);
      expect(calculatePriorityScore('medium', now, 0)).toBe(50);
      expect(calculatePriorityScore('low', now, 0)).toBe(25);
      expect(calculatePriorityScore('external', now, 0)).toBe(0);
    });

    it('should add age bonus', () => {
      const oldTime = Date.now() - 5000; // 5 seconds ago
      const score = calculatePriorityScore('medium', oldTime, 0);

      expect(score).toBeGreaterThan(50); // Base score + age bonus
      expect(score).toBeLessThanOrEqual(70); // Max 20 points age bonus
    });

    it('should apply retry penalty', () => {
      const now = Date.now();
      const baseScore = calculatePriorityScore('high', now, 0);
      const penalizedScore = calculatePriorityScore('high', now, 2);

      expect(penalizedScore).toBe(baseScore - 20); // 2 retries * 10 penalty
    });

    it('should not go below zero', () => {
      const now = Date.now();
      const score = calculatePriorityScore('low', now, 10); // High retry count

      expect(score).toBe(0);
    });
  });

  describe('sortPrefetchQueue', () => {
    it('should sort queue by priority score', () => {
      const queue: PrefetchQueueItem[] = [
        {
          url: '/low',
          config: { path: '/low', strategy: 'hover', priority: 'low' },
          queueTime: Date.now(),
          retryCount: 0,
          priorityScore: 0,
          trigger: 'hover'
        },
        {
          url: '/high',
          config: { path: '/high', strategy: 'hover', priority: 'high' },
          queueTime: Date.now(),
          retryCount: 0,
          priorityScore: 0,
          trigger: 'hover'
        },
        {
          url: '/critical',
          config: { path: '/critical', strategy: 'immediate', priority: 'critical' },
          queueTime: Date.now(),
          retryCount: 0,
          priorityScore: 0,
          trigger: 'immediate'
        }
      ];

      const sorted = sortPrefetchQueue(queue);

      expect(sorted[0].url).toBe('/critical');
      expect(sorted[1].url).toBe('/high');
      expect(sorted[2].url).toBe('/low');
    });
  });
});

describe('Cache Management', () => {
  describe('estimateCacheMemoryUsage', () => {
    it('should estimate memory usage for cache entries', () => {
      const entries: CacheEntry[] = [
        {
          url: '/page1',
          timestamp: Date.now(),
          size: 1000,
          accessCount: 1,
          lastAccess: Date.now(),
          ttl: 300000
        },
        {
          url: '/page2',
          timestamp: Date.now(),
          size: 2000,
          accessCount: 2,
          lastAccess: Date.now(),
          ttl: 300000,
          metadata: { strategy: 'hover' }
        }
      ];

      const memoryUsage = estimateCacheMemoryUsage(entries);

      expect(memoryUsage).toBeGreaterThan(0);
      expect(typeof memoryUsage).toBe('number');
    });

    it('should handle empty cache', () => {
      const memoryUsage = estimateCacheMemoryUsage([]);
      expect(memoryUsage).toBe(0);
    });
  });

  describe('cleanExpiredCache', () => {
    it('should remove expired entries', () => {
      const now = Date.now();
      const entries: CacheEntry[] = [
        {
          url: '/fresh',
          timestamp: now - 1000,
          size: 1000,
          accessCount: 1,
          lastAccess: now,
          ttl: 5000 // Not expired
        },
        {
          url: '/expired',
          timestamp: now - 10000,
          size: 1000,
          accessCount: 1,
          lastAccess: now - 5000,
          ttl: 5000 // Expired
        }
      ];

      const cleaned = cleanExpiredCache(entries, now);

      expect(cleaned).toHaveLength(1);
      expect(cleaned[0].url).toBe('/fresh');
    });
  });

  describe('evictLRUCache', () => {
    it('should evict least recently used entries', () => {
      const entries: CacheEntry[] = [
        {
          url: '/old',
          timestamp: Date.now(),
          size: 100,
          accessCount: 1,
          lastAccess: Date.now() - 10000, // Oldest
          ttl: 300000
        },
        {
          url: '/recent',
          timestamp: Date.now(),
          size: 100,
          accessCount: 1,
          lastAccess: Date.now() - 1000, // Most recent
          ttl: 300000
        }
      ];

      const evicted = evictLRUCache(entries, 150); // Only room for one entry

      expect(evicted).toHaveLength(1);
      expect(evicted[0].url).toBe('/recent');
    });

    it('should keep at least one entry', () => {
      const entries: CacheEntry[] = [
        {
          url: '/large',
          timestamp: Date.now(),
          size: 1000,
          accessCount: 1,
          lastAccess: Date.now(),
          ttl: 300000
        }
      ];

      const evicted = evictLRUCache(entries, 100); // Smaller than entry size

      expect(evicted).toHaveLength(1); // Should keep at least one
    });
  });
});

describe('Browser Support Detection', () => {
  describe('supportsPrefetch', () => {
    it('should return false in non-browser environment', () => {
      const originalWindow = global.window;
      delete (global as any).window;

      expect(supportsPrefetch()).toBe(false);

      global.window = originalWindow;
    });

    it('should detect prefetch support', () => {
      // Mock link element with prefetch support
      const mockLink = {
        relList: {
          supports: jest.fn().mockReturnValue(true)
        }
      };

      jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);

      expect(supportsPrefetch()).toBe(true);
      expect(mockLink.relList.supports).toHaveBeenCalledWith('prefetch');
    });
  });

  describe('supportsPreload', () => {
    it('should detect preload support', () => {
      const mockLink = {
        relList: {
          supports: jest.fn().mockReturnValue(true)
        }
      };

      jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);

      expect(supportsPreload()).toBe(true);
      expect(mockLink.relList.supports).toHaveBeenCalledWith('preload');
    });
  });

  describe('prefersReducedMotion', () => {
    it('should detect reduced motion preference', () => {
      (window.matchMedia as jest.Mock).mockReturnValue({
        matches: true
      });

      expect(prefersReducedMotion()).toBe(true);
    });

    it('should return false when no reduced motion preference', () => {
      (window.matchMedia as jest.Mock).mockReturnValue({
        matches: false
      });

      expect(prefersReducedMotion()).toBe(false);
    });
  });
});

describe('Performance Utilities', () => {
  describe('debounce', () => {
    jest.useFakeTimers();

    it('should debounce function calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('test1');
      debouncedFn('test2');
      debouncedFn('test3');

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('test3');
    });

    afterEach(() => {
      jest.clearAllTimers();
    });
  });

  describe('throttle', () => {
    jest.useFakeTimers();

    it('should throttle function calls', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn('test1');
      throttledFn('test2');
      throttledFn('test3');

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('test1');

      jest.advanceTimersByTime(100);

      throttledFn('test4');
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith('test4');
    });

    afterEach(() => {
      jest.clearAllTimers();
    });
  });
});

describe('Bandwidth-aware Quality Settings', () => {
  describe('getBandwidthQualitySettings', () => {
    const mockOptions: BandwidthAwareOptions = {
      enabled: true,
      minSpeed: 1.5,
      maxSpeed: 10,
      respectSaveData: true,
      qualityLevels: {
        slow: {
          maxConcurrent: 1,
          enabledStrategies: ['hover'],
          maxCacheSize: 10,
          priority: 'low'
        },
        medium: {
          maxConcurrent: 2,
          enabledStrategies: ['hover', 'viewport'],
          maxCacheSize: 25,
          priority: 'low'
        },
        fast: {
          maxConcurrent: 5,
          enabledStrategies: ['immediate', 'hover', 'viewport', 'idle'],
          maxCacheSize: 50,
          priority: 'high'
        }
      }
    };

    it('should return medium quality when disabled', () => {
      const settings = getBandwidthQualitySettings(null, {
        ...mockOptions,
        enabled: false
      });

      expect(settings).toEqual(mockOptions.qualityLevels.medium);
    });

    it('should respect save data preference', () => {
      const networkInfo: NetworkInfo = {
        effectiveType: '4g',
        downlink: 10,
        rtt: 100,
        saveData: true
      };

      const settings = getBandwidthQualitySettings(networkInfo, mockOptions);

      expect(settings.maxConcurrent).toBe(1);
      expect(settings.enabledStrategies).toEqual(['hover']);
    });

    it('should return slow quality for slow connections', () => {
      const networkInfo: NetworkInfo = {
        effectiveType: '3g',
        downlink: 1, // Below minSpeed
        rtt: 200,
        saveData: false
      };

      const settings = getBandwidthQualitySettings(networkInfo, mockOptions);

      expect(settings).toEqual(mockOptions.qualityLevels.slow);
    });

    it('should return fast quality for fast connections', () => {
      const networkInfo: NetworkInfo = {
        effectiveType: '4g',
        downlink: 15, // Above maxSpeed
        rtt: 50,
        saveData: false
      };

      const settings = getBandwidthQualitySettings(networkInfo, mockOptions);

      expect(settings).toEqual(mockOptions.qualityLevels.fast);
    });

    it('should return medium quality for moderate connections', () => {
      const networkInfo: NetworkInfo = {
        effectiveType: '4g',
        downlink: 5, // Between min and max
        rtt: 100,
        saveData: false
      };

      const settings = getBandwidthQualitySettings(networkInfo, mockOptions);

      expect(settings).toEqual(mockOptions.qualityLevels.medium);
    });
  });
});

describe('Utility Functions', () => {
  describe('generateRequestId', () => {
    it('should generate unique request IDs', () => {
      const id1 = generateRequestId();
      const id2 = generateRequestId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^prefetch_\d+_[a-z0-9]+$/);
    });
  });

  describe('URL validation and normalization', () => {
    describe('isValidURL', () => {
      it('should validate URLs correctly', () => {
        expect(isValidURL('/relative-path')).toBe(true);
        expect(isValidURL('https://example.com')).toBe(true);
        expect(isValidURL('invalid-url')).toBe(true); // Relative URLs are valid
        // Empty string creates a valid URL with current origin, so it's actually valid
        expect(isValidURL('')).toBe(true);
      });
    });

    describe('normalizeURL', () => {
      it('should normalize relative URLs', () => {
        const normalized = normalizeURL('/test-page');
        expect(normalized).toBe('https://neptunik.com/test-page');
      });

      it('should keep absolute URLs unchanged', () => {
        const url = 'https://example.com/page';
        expect(normalizeURL(url)).toBe(url);
      });
    });

    describe('isSameOrigin', () => {
      it('should detect same origin URLs', () => {
        expect(isSameOrigin('/test')).toBe(true);
        expect(isSameOrigin('https://neptunik.com/test')).toBe(true);
        expect(isSameOrigin('https://example.com/test')).toBe(false);
      });
    });
  });
});

describe('MetricsCalculator', () => {
  let calculator: MetricsCalculator;

  beforeEach(() => {
    calculator = new MetricsCalculator();
  });

  it('should initialize with zero metrics', () => {
    const metrics = calculator.getMetrics();

    expect(metrics.totalOperations).toBe(0);
    expect(metrics.successfulOperations).toBe(0);
    expect(metrics.failedOperations).toBe(0);
    expect(metrics.avgPrefetchTime).toBe(0);
  });

  it('should update metrics correctly', () => {
    calculator.updateMetrics(true, 100);
    calculator.updateMetrics(false, 200);

    const metrics = calculator.getMetrics();

    expect(metrics.totalOperations).toBe(2);
    expect(metrics.successfulOperations).toBe(1);
    expect(metrics.failedOperations).toBe(1);
    expect(metrics.avgPrefetchTime).toBe(150); // (100 + 200) / 2
  });

  it('should reset metrics', () => {
    calculator.updateMetrics(true, 100);
    calculator.reset();

    const metrics = calculator.getMetrics();

    expect(metrics.totalOperations).toBe(0);
    expect(metrics.successfulOperations).toBe(0);
  });

  it('should track operations per minute', () => {
    calculator.updateMetrics(true, 100);

    const metrics = calculator.getMetrics();
    expect(metrics.opsPerMinute).toBe(1);
  });

  it('should limit operation time tracking to 100 entries', () => {
    // Add 150 operations
    for (let i = 0; i < 150; i++) {
      calculator.updateMetrics(true, i);
    }

    const metrics = calculator.getMetrics();
    // Should still calculate average correctly even with limit
    expect(metrics.avgPrefetchTime).toBeGreaterThan(0);
  });
});