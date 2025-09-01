/**
 * usePerformanceMonitor - Hook for monitoring and optimizing simulator performance
 */

import { useCallback, useEffect, useRef, useState } from 'react';

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
  enableMonitoring: boolean;
  slowRenderThreshold: number; // ms
  maxRenderHistory: number;
  reportInterval: number; // ms
}

const DEFAULT_CONFIG: PerformanceConfig = {
  enableMonitoring: process.env.NODE_ENV === 'development',
  slowRenderThreshold: 16, // 60fps threshold
  maxRenderHistory: 100,
  reportInterval: 5000
};

export function usePerformanceMonitor(
  componentName: string,
  config: Partial<PerformanceConfig> = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Performance tracking state
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    isSlowRender: false,
    transitionCount: 0,
    lastTransitionTime: 0
  });

  // Internal tracking
  const renderTimesRef = useRef<number[]>([]);
  const lastRenderStartRef = useRef<number>(0);
  const reportIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transitionStartRef = useRef<number>(0);

  // Start render timing
  const startRenderTiming = useCallback(() => {
    if (!finalConfig.enableMonitoring) return;

    lastRenderStartRef.current = performance.now();
  }, [finalConfig.enableMonitoring]);

  // End render timing
  const endRenderTiming = useCallback(() => {
    if (!finalConfig.enableMonitoring) return;

    const endTime = performance.now();
    const renderTime = endTime - lastRenderStartRef.current;

    // Update render times history
    renderTimesRef.current.push(renderTime);
    if (renderTimesRef.current.length > finalConfig.maxRenderHistory) {
      renderTimesRef.current.shift();
    }

    // Calculate average
    const averageRenderTime = renderTimesRef.current.reduce((sum, time) => sum + time, 0) /
                             renderTimesRef.current.length;

    // Check if render was slow
    const isSlowRender = renderTime > finalConfig.slowRenderThreshold;

    // Update metrics
    setMetrics(prev => ({
      ...prev,
      renderCount: prev.renderCount + 1,
      lastRenderTime: renderTime,
      averageRenderTime,
      isSlowRender
    }));

    // Log slow renders in development
    if (isSlowRender && process.env.NODE_ENV === 'development') {
      console.warn(
        `[Performance] Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`
      );
    }
  }, [componentName, finalConfig.enableMonitoring, finalConfig.maxRenderHistory, finalConfig.slowRenderThreshold]);

  // Track transitions
  const startTransition = useCallback(() => {
    if (!finalConfig.enableMonitoring) return;

    transitionStartRef.current = performance.now();
  }, [finalConfig.enableMonitoring]);

  const endTransition = useCallback(() => {
    if (!finalConfig.enableMonitoring) return;

    const endTime = performance.now();
    const transitionTime = endTime - transitionStartRef.current;

    setMetrics(prev => ({
      ...prev,
      transitionCount: prev.transitionCount + 1,
      lastTransitionTime: transitionTime
    }));

    // Log slow transitions
    if (transitionTime > 300 && process.env.NODE_ENV === 'development') {
      console.warn(
        `[Performance] Slow transition detected in ${componentName}: ${transitionTime.toFixed(2)}ms`
      );
    }
  }, [componentName, finalConfig.enableMonitoring]);

  // Memory monitoring (if available)
  const checkMemoryUsage = useCallback(() => {
    if (!finalConfig.enableMonitoring) return;

    // @ts-ignore - performance.memory is not in all browsers
    if (typeof window !== 'undefined' && window.performance?.memory) {
      // @ts-ignore
      const memoryInfo = window.performance.memory;
      const memoryUsage = memoryInfo.usedJSHeapSize;

      setMetrics(prev => ({
        ...prev,
        memoryUsage
      }));

      // Warn about high memory usage
      const memoryLimitMB = memoryInfo.jsHeapSizeLimit / (1024 * 1024);
      const memoryUsedMB = memoryUsage / (1024 * 1024);
      const memoryUsagePercent = (memoryUsedMB / memoryLimitMB) * 100;

      if (memoryUsagePercent > 80 && process.env.NODE_ENV === 'development') {
        console.warn(
          `[Performance] High memory usage in ${componentName}: ${memoryUsedMB.toFixed(1)}MB (${memoryUsagePercent.toFixed(1)}%)`
        );
      }
    }
  }, [componentName, finalConfig.enableMonitoring]);

  // Periodic reporting
  useEffect(() => {
    if (!finalConfig.enableMonitoring) return;

    reportIntervalRef.current = setInterval(() => {
      checkMemoryUsage();

      // Log performance summary in development
      if (process.env.NODE_ENV === 'development' && metrics.renderCount > 0) {
        console.group(`[Performance Report] ${componentName}`);
        console.log(`Renders: ${metrics.renderCount}`);
        console.log(`Average render time: ${metrics.averageRenderTime.toFixed(2)}ms`);
        console.log(`Transitions: ${metrics.transitionCount}`);
        if (metrics.memoryUsage) {
          console.log(`Memory usage: ${(metrics.memoryUsage / (1024 * 1024)).toFixed(1)}MB`);
        }
        console.groupEnd();
      }
    }, finalConfig.reportInterval);

    return () => {
      if (reportIntervalRef.current) {
        clearInterval(reportIntervalRef.current);
      }
    };
  }, [finalConfig.enableMonitoring, finalConfig.reportInterval, componentName, metrics, checkMemoryUsage]);

  // Component render effect
  useEffect(() => {
    startRenderTiming();

    // End timing on next tick to capture full render
    const timeoutId = setTimeout(endRenderTiming, 0);

    return () => clearTimeout(timeoutId);
  });

  // Performance optimization helpers
  const optimizationHelpers = {
    // Check if component should skip render based on performance
    shouldSkipRender: metrics.isSlowRender && metrics.averageRenderTime > finalConfig.slowRenderThreshold * 2,

    // Check if animations should be reduced
    shouldReduceAnimations: metrics.averageRenderTime > finalConfig.slowRenderThreshold * 1.5,

    // Check if component is performing well
    isPerformant: metrics.averageRenderTime <= finalConfig.slowRenderThreshold && !metrics.isSlowRender,

    // Get performance grade
    getPerformanceGrade: () => {
      if (metrics.averageRenderTime <= finalConfig.slowRenderThreshold) return 'A';
      if (metrics.averageRenderTime <= finalConfig.slowRenderThreshold * 1.5) return 'B';
      if (metrics.averageRenderTime <= finalConfig.slowRenderThreshold * 2) return 'C';
      return 'D';
    }
  };

  return {
    metrics,
    startTransition,
    endTransition,
    optimizationHelpers,
    config: finalConfig
  };
}

// Hook for monitoring specific operations
export function useOperationTiming(operationName: string) {
  const startTimeRef = useRef<number>(0);

  const startTiming = useCallback(() => {
    startTimeRef.current = performance.now();
  }, []);

  const endTiming = useCallback(() => {
    const endTime = performance.now();
    const duration = endTime - startTimeRef.current;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Operation Timing] ${operationName}: ${duration.toFixed(2)}ms`);

      if (duration > 100) {
        console.warn(`[Performance] Slow operation detected: ${operationName} took ${duration.toFixed(2)}ms`);
      }
    }

    return duration;
  }, [operationName]);

  return { startTiming, endTiming };
}