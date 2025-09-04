/**
 * usePerformanceMonitor - Simplified hook for monitoring performance
 *
 * Minimal implementation to prevent infinite loops and performance issues
 * Only logs in development mode without causing re-renders
 */

import { useCallback, useRef } from 'react';

export interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  memoryUsage?: number;
  isSlowRender: boolean;
  transitionCount: number;
  lastTransitionTime: number;
}

export interface PerformanceConfig {
  enableMonitoring?: boolean;
  slowRenderThreshold?: number;
  maxRenderHistory?: number;
  reportInterval?: number;
}

const DEFAULT_CONFIG: PerformanceConfig = {
  enableMonitoring: process.env.NODE_ENV === 'development',
  slowRenderThreshold: 16,
  maxRenderHistory: 100,
  reportInterval: 5000
};

// Static metrics to prevent re-renders
const STATIC_METRICS: PerformanceMetrics = {
  renderCount: 0,
  lastRenderTime: 0,
  averageRenderTime: 0,
  isSlowRender: false,
  transitionCount: 0,
  lastTransitionTime: 0
};

export function usePerformanceMonitor(
  componentName: string,
  config: Partial<PerformanceConfig> = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Use refs to track performance without causing re-renders
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(0);

  // No-op functions for production
  const startRenderTiming = useCallback(() => {
    if (!finalConfig.enableMonitoring) return;
    lastRenderTimeRef.current = performance.now();
  }, [finalConfig.enableMonitoring]);

  const endRenderTiming = useCallback(() => {
    if (!finalConfig.enableMonitoring) return;

    const renderTime = performance.now() - lastRenderTimeRef.current;
    renderCountRef.current++;

    // Only log slow renders in development
    if (renderTime > finalConfig.slowRenderThreshold && process.env.NODE_ENV === 'development') {
      console.debug(`[Performance] ${componentName} slow render: ${renderTime.toFixed(2)}ms`);
    }
  }, [componentName, finalConfig.enableMonitoring, finalConfig.slowRenderThreshold]);

  const startTransition = useCallback(() => {
    // No-op to prevent errors
  }, []);

  const endTransition = useCallback(() => {
    // No-op to prevent errors
  }, []);

  // Static optimization helpers to prevent re-renders
  const optimizationHelpers = {
    shouldSkipRender: false,
    shouldReduceAnimations: false,
    isPerformant: true,
    getPerformanceGrade: () => 'A' as const
  };

  return {
    metrics: STATIC_METRICS,
    startTransition,
    endTransition,
    optimizationHelpers,
    config: finalConfig
  };
}

// Simplified operation timing hook
export function useOperationTiming(operationName: string) {
  const startTimeRef = useRef<number>(0);

  const startTiming = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      startTimeRef.current = performance.now();
    }
  }, []);

  const endTiming = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      const duration = performance.now() - startTimeRef.current;
      if (duration > 100) {
        console.debug(`[Operation] ${operationName}: ${duration.toFixed(2)}ms`);
      }
      return duration;
    }
    return 0;
  }, [operationName]);

  return { startTiming, endTiming };
}