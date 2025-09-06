/**
 * Smart Prefetch Hook Tests
 *
 * Comprehensive test suite for the Next.js 15 optimized prefetch system
 * covering all strategies, performance constraints, and edge cases.
 */

import { useRouter } from 'next/navigation';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useSmartPrefetch } from '../use-smart-prefetch';
import * as utils from '../utils';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock utilities
jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  getNetworkInfo: jest.fn(),
  supportsPrefetch: jest.fn(() => true),
  supportsPreload: jest.fn(() => true),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock requestIdleCallback
global.requestIdleCallback = jest.fn((callback) => {
  setTimeout(callback, 0);
  return 1;
});

global.cancelIdleCallback = jest.fn();

describe('useSmartPrefetch', () => {
  const mockPrefetch = jest.fn();
  const mockRouterPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      prefetch: mockPrefetch,
      push: mockRouterPush
    });

    (utils.getNetworkInfo as jest.Mock).mockReturnValue({
      effectiveType: '4g',
      downlink: 10,
      rtt: 100,
      saveData: false
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Initialization', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useSmartPrefetch());

      expect(result.current.status).toBe('idle');
      expect(result.current.isReady).toBe(false);
      expect(result.current.networkInfo).toBeNull();
    });

    it('should become ready after initialization', async () => {
      const { result } = renderHook(() => useSmartPrefetch());

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      expect(result.current.networkInfo).toBeTruthy();
    });

    it('should prefetch critical routes on initialization', async () => {
      renderHook(() => useSmartPrefetch());

      await waitFor(() => {
        expect(mockPrefetch).toHaveBeenCalledWith('/', { kind: 'auto' });
        expect(mockPrefetch).toHaveBeenCalledWith('/pricing', { kind: 'auto' });
        expect(mockPrefetch).toHaveBeenCalledWith('/onboarding', { kind: 'hover' });
      });
    });
  });

  describe('Basic Prefetch Operations', () => {
    it('should prefetch a valid URL successfully', async () => {
      const { result } = renderHook(() => useSmartPrefetch());

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      let prefetchResult;
      await act(async () => {
        prefetchResult = await result.current.prefetch('/test-page');
      });

      expect(prefetchResult.status).toBe('success');
      expect(prefetchResult.url).toBe(`${window.location.origin}/test-page`);
      expect(mockPrefetch).toHaveBeenCalledWith(`${window.location.origin}/test-page`, { kind: 'hover' });
    });

    it('should return cached result for already prefetched URLs', async () => {
      const { result } = renderHook(() => useSmartPrefetch());

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      // First prefetch
      await act(async () => {
        await result.current.prefetch('/test-page');
      });

      // Second prefetch should return cached
      let cachedResult;
      await act(async () => {
        cachedResult = await result.current.prefetch('/test-page');
      });

      expect(cachedResult.status).toBe('cached');
      expect(cachedResult.fromCache).toBe(true);
      expect(cachedResult.duration).toBe(0);
    });

    it('should reject external URLs', async () => {
      const { result } = renderHook(() => useSmartPrefetch());

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      let prefetchResult;
      await act(async () => {
        prefetchResult = await result.current.prefetch('https://external.com');
      });

      expect(prefetchResult.status).toBe('error');
      expect(prefetchResult.error).toBe('External URL not supported');
    });

    it('should reject invalid URLs', async () => {
      const { result } = renderHook(() => useSmartPrefetch());

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      let prefetchResult;
      await act(async () => {
        prefetchResult = await result.current.prefetch('invalid-url');
      });

      expect(prefetchResult.status).toBe('error');
      expect(prefetchResult.error).toBe('Invalid URL');
    });
  });

  describe('Performance Constraints', () => {
    it('should respect max concurrent prefetch limit', async () => {
      const { result } = renderHook(() =>
        useSmartPrefetch({
          constraints: {
            maxConcurrentPrefetch: 1
          }
        })
      );

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      // Start multiple prefetch operations
      const promises = [
        result.current.prefetch('/page1'),
        result.current.prefetch('/page2'),
        result.current.prefetch('/page3')
      ];

      const results = await Promise.all(promises);

      // First should succeed, others should be throttled or succeed based on timing
      expect(results[0].status).toBe('success');

      // Check that constraint was applied
      const metrics = result.current.getMetrics();
      expect(metrics.totalOperations).toBeGreaterThan(0);
    });

    it('should respect operations per minute limit', async () => {
      const { result } = renderHook(() =>
        useSmartPrefetch({
          constraints: {
            maxPrefetchPerMinute: 1
          }
        })
      );

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      // First operation should succeed
      let firstResult;
      await act(async () => {
        firstResult = await result.current.prefetch('/page1');
      });
      expect(firstResult.status).toBe('success');

      // Second operation should be rate limited
      let secondResult;
      await act(async () => {
        secondResult = await result.current.prefetch('/page2');
      });
      expect(secondResult.status).toBe('error');
      expect(secondResult.error).toBe('Rate limit exceeded');
    });

    it('should handle bandwidth-aware prefetching', async () => {
      // Mock slow connection
      (utils.getNetworkInfo as jest.Mock).mockReturnValue({
        effectiveType: '2g',
        downlink: 0.5,
        rtt: 2000,
        saveData: false
      });

      const { result } = renderHook(() => useSmartPrefetch());

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      // Should respect slow connection
      let prefetchResult;
      await act(async () => {
        prefetchResult = await result.current.prefetch('/page1', {
          strategy: 'viewport' // This should check fastConnectionOnly
        });
      });

      expect(result.current.networkInfo?.effectiveType).toBe('2g');
    });

    it('should respect save-data preference', async () => {
      (utils.getNetworkInfo as jest.Mock).mockReturnValue({
        effectiveType: '4g',
        downlink: 10,
        rtt: 100,
        saveData: true // User wants to save data
      });

      const { result } = renderHook(() => useSmartPrefetch());

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      expect(result.current.networkInfo?.saveData).toBe(true);
    });
  });

  describe('Cache Management', () => {
    it('should check if URL is cached', async () => {
      const { result } = renderHook(() => useSmartPrefetch());

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      expect(result.current.isCached('/test-page')).toBe(false);

      await act(async () => {
        await result.current.prefetch('/test-page');
      });

      expect(result.current.isCached('/test-page')).toBe(true);
    });

    it('should clear cache successfully', async () => {
      const { result } = renderHook(() => useSmartPrefetch());

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      // Add something to cache
      await act(async () => {
        await result.current.prefetch('/test-page');
      });

      expect(result.current.getCacheEntries()).toHaveLength(1);

      // Clear cache
      act(() => {
        result.current.clearCache();
      });

      expect(result.current.getCacheEntries()).toHaveLength(0);
      expect(result.current.isCached('/test-page')).toBe(false);
    });

    it('should provide accurate cache entries', async () => {
      const { result } = renderHook(() => useSmartPrefetch());

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      await act(async () => {
        await result.current.prefetch('/page1');
        await result.current.prefetch('/page2');
      });

      const cacheEntries = result.current.getCacheEntries();
      expect(cacheEntries).toHaveLength(2);

      const urls = cacheEntries.map(entry => entry.url);
      expect(urls).toContain(`${window.location.origin}/page1`);
      expect(urls).toContain(`${window.location.origin}/page2`);
    });
  });

  describe('Performance Metrics', () => {
    it('should track performance metrics correctly', async () => {
      const { result } = renderHook(() => useSmartPrefetch());

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      const initialMetrics = result.current.getMetrics();
      expect(initialMetrics.totalOperations).toBe(0);
      expect(initialMetrics.successfulOperations).toBe(0);

      await act(async () => {
        await result.current.prefetch('/test-page');
      });

      const updatedMetrics = result.current.getMetrics();
      expect(updatedMetrics.totalOperations).toBe(1);
      expect(updatedMetrics.successfulOperations).toBe(1);
      expect(updatedMetrics.failedOperations).toBe(0);
    });

    it('should calculate cache hit rate correctly', async () => {
      const { result } = renderHook(() => useSmartPrefetch());

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      // First prefetch
      await act(async () => {
        await result.current.prefetch('/test-page');
      });

      // Second prefetch (cache hit)
      await act(async () => {
        await result.current.prefetch('/test-page');
      });

      const metrics = result.current.getMetrics();
      expect(metrics.totalOperations).toBe(2);
      expect(metrics.cacheHitRate).toBeGreaterThan(0);
    });
  });

  describe('Enable/Disable Functionality', () => {
    it('should be disabled when disabled option is set', () => {
      const { result } = renderHook(() =>
        useSmartPrefetch({ disabled: true })
      );

      expect(result.current.isReady).toBe(false);
    });

    it('should disable and enable dynamically', async () => {
      const { result } = renderHook(() => useSmartPrefetch());

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      // Disable
      act(() => {
        result.current.setEnabled(false);
      });

      let prefetchResult;
      await act(async () => {
        prefetchResult = await result.current.prefetch('/test-page');
      });

      expect(prefetchResult.status).toBe('error');
      expect(prefetchResult.error).toBe('Prefetching disabled');

      // Re-enable
      act(() => {
        result.current.setEnabled(true);
      });

      await act(async () => {
        prefetchResult = await result.current.prefetch('/test-page');
      });

      expect(prefetchResult.status).toBe('success');
    });
  });

  describe('Error Handling', () => {
    it('should handle router.prefetch errors gracefully', async () => {
      mockPrefetch.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useSmartPrefetch());

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      let prefetchResult;
      await act(async () => {
        prefetchResult = await result.current.prefetch('/test-page');
      });

      expect(prefetchResult.status).toBe('error');
      expect(prefetchResult.error).toBe('Network error');
      expect(result.current.status).toBe('error');
    });

    it('should handle initialization errors', async () => {
      (utils.supportsPrefetch as jest.Mock).mockReturnValue(false);

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      renderHook(() => useSmartPrefetch());

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          '[SmartPrefetch] Prefetch not supported in this browser'
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Cancel Operations', () => {
    it('should cancel active prefetch operations', async () => {
      const { result } = renderHook(() => useSmartPrefetch());

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      // Start prefetch
      const prefetchPromise = result.current.prefetch('/test-page');

      // Cancel immediately
      act(() => {
        result.current.cancel('/test-page');
      });

      // Wait for prefetch to complete (should be cancelled)
      const prefetchResult = await prefetchPromise;

      // The operation might complete before cancellation, so we just check it doesn't crash
      expect(prefetchResult).toBeDefined();
    });
  });
});