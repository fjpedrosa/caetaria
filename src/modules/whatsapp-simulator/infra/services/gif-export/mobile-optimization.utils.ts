/**
 * Mobile Optimization Utilities
 * Mobile-specific optimizations for GIF export
 */

import { ExportOptions } from './types';

export interface MobileOptimizationConfig {
  /** Detect mobile devices */
  isMobile: boolean;
  /** Device pixel ratio */
  pixelRatio: number;
  /** Available memory in MB */
  availableMemory: number;
  /** Network connection type */
  connectionType: 'slow' | 'fast' | 'unknown';
  /** Battery level (if available) */
  batteryLevel: number | null;
}

export class MobileOptimizationUtils {
  /**
   * Detect current device and connection characteristics
   */
  static detectDeviceCapabilities(): MobileOptimizationConfig {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

    // Device pixel ratio
    const pixelRatio = window.devicePixelRatio || 1;

    // Available memory (Chrome only)
    let availableMemory = 1000; // Default 1GB
    if ('memory' in navigator) {
      availableMemory = (navigator as any).memory.deviceMemory * 1024 || 1000;
    }

    // Network connection
    let connectionType: 'slow' | 'fast' | 'unknown' = 'unknown';
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection.effectiveType) {
        connectionType = ['slow-2g', '2g', '3g'].includes(connection.effectiveType) ? 'slow' : 'fast';
      }
    }

    // Battery level (experimental API)
    let batteryLevel: number | null = null;
    if ('getBattery' in navigator) {
      // Note: Battery API is deprecated, this is just for demonstration
      batteryLevel = 0.5; // Assume 50% as default
    }

    return {
      isMobile,
      pixelRatio,
      availableMemory,
      connectionType,
      batteryLevel
    };
  }

  /**
   * Optimize export options for mobile devices
   */
  static optimizeForMobile(
    baseOptions: ExportOptions,
    config: MobileOptimizationConfig
  ): ExportOptions {
    const optimized = { ...baseOptions };

    if (!config.isMobile) {
      return optimized; // No mobile optimizations needed
    }

    // Reduce quality for mobile devices
    optimized.quality = Math.min(optimized.quality, 0.7);

    // Adjust based on available memory
    if (config.availableMemory < 2000) { // Less than 2GB
      optimized.quality = Math.min(optimized.quality, 0.5);
      optimized.frameRate = Math.min(optimized.frameRate, 12);
      optimized.duration = Math.min(optimized.duration, 15);
      optimized.scale = Math.min(optimized.scale, 0.7);
    }

    // Adjust for high pixel ratio displays
    if (config.pixelRatio > 2) {
      optimized.scale = Math.min(optimized.scale, 0.6);
    }

    // Optimize for slow connections
    if (config.connectionType === 'slow') {
      optimized.quality = Math.min(optimized.quality, 0.4);
      optimized.frameRate = Math.min(optimized.frameRate, 10);
      optimized.duration = Math.min(optimized.duration, 10);
    }

    // Battery-aware optimizations
    if (config.batteryLevel && config.batteryLevel < 0.2) {
      optimized.quality = Math.min(optimized.quality, 0.4);
      optimized.frameRate = Math.min(optimized.frameRate, 8);
      optimized.duration = Math.min(optimized.duration, 10);
    }

    return optimized;
  }

  /**
   * Check if device supports smooth GIF export
   */
  static canHandleSmoothExport(config: MobileOptimizationConfig): boolean {
    // Basic capability check
    if (!config.isMobile) return true;

    // Check memory constraints
    if (config.availableMemory < 1000) return false;

    // Check connection
    if (config.connectionType === 'slow') return false;

    // Check battery
    if (config.batteryLevel && config.batteryLevel < 0.1) return false;

    return true;
  }

  /**
   * Get mobile-specific capture options
   */
  static getMobileCaptureOptions(config: MobileOptimizationConfig): {
    batchSize: number;
    maxConcurrentCaptures: number;
    frameDelay: number;
    memoryCleanupInterval: number;
  } {
    const base = {
      batchSize: 5,
      maxConcurrentCaptures: 2,
      frameDelay: 100,
      memoryCleanupInterval: 10
    };

    if (!config.isMobile) return base;

    // Mobile-specific adjustments
    return {
      batchSize: Math.max(2, Math.floor(base.batchSize * (config.availableMemory / 2000))),
      maxConcurrentCaptures: 1, // Single threaded on mobile
      frameDelay: config.connectionType === 'slow' ? 200 : base.frameDelay,
      memoryCleanupInterval: 5 // More frequent cleanup on mobile
    };
  }

  /**
   * Monitor performance during export
   */
  static createPerformanceMonitor() {
    const startTime = performance.now();
    let frameCount = 0;
    const memoryPeaks: number[] = [];

    return {
      recordFrame: () => {
        frameCount++;

        // Record memory usage if available
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          memoryPeaks.push(memory.usedJSHeapSize);
        }
      },

      getMetrics: () => {
        const totalTime = performance.now() - startTime;
        const avgFPS = frameCount / (totalTime / 1000);
        const peakMemory = Math.max(...memoryPeaks) / (1024 * 1024); // MB

        return {
          totalTime,
          frameCount,
          averageFPS: avgFPS,
          peakMemoryUsage: peakMemory
        };
      },

      shouldReduceQuality: () => {
        const metrics = performance.now() - startTime;
        const currentFPS = frameCount / (metrics / 1000);

        // Reduce quality if FPS is too low
        return currentFPS < 5;
      }
    };
  }

  /**
   * Adaptive quality adjustment based on performance
   */
  static adaptiveQualityControl(
    currentOptions: ExportOptions,
    performanceMetrics: {
      averageFPS: number;
      peakMemoryUsage: number;
      totalTime: number;
    }
  ): ExportOptions {
    const adjusted = { ...currentOptions };

    // Reduce quality if performance is poor
    if (performanceMetrics.averageFPS < 10) {
      adjusted.quality *= 0.8;
      adjusted.frameRate = Math.max(5, Math.floor(adjusted.frameRate * 0.8));
    }

    // Reduce quality if memory usage is high
    if (performanceMetrics.peakMemoryUsage > 200) { // 200MB
      adjusted.quality *= 0.7;
      adjusted.scale = Math.min(adjusted.scale, 0.8);
    }

    // Ensure minimum values
    adjusted.quality = Math.max(0.1, adjusted.quality);
    adjusted.frameRate = Math.max(5, adjusted.frameRate);
    adjusted.scale = Math.max(0.5, adjusted.scale);

    return adjusted;
  }

  /**
   * Get viewport-aware scaling
   */
  static getViewportAwareScale(element: HTMLElement): number {
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // If element is larger than viewport, scale it down
    const scaleX = viewportWidth / rect.width;
    const scaleY = viewportHeight / rect.height;

    return Math.min(1, Math.min(scaleX, scaleY) * 0.9); // 90% of viewport
  }

  /**
   * Check if device supports Web Workers
   */
  static supportsWebWorkers(): boolean {
    return typeof Worker !== 'undefined';
  }

  /**
   * Get optimal worker count for device
   */
  static getOptimalWorkerCount(): number {
    const config = this.detectDeviceCapabilities();

    if (!this.supportsWebWorkers()) return 0;

    if (config.isMobile) return 1; // Single worker on mobile

    return Math.min(4, navigator.hardwareConcurrency || 2);
  }
}

/**
 * Singleton mobile optimization utility
 */
export const mobileOptimizationUtils = MobileOptimizationUtils;