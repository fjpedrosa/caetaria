/**
 * Performance Monitoring Utilities for E2E Tests
 * 
 * Advanced performance monitoring tools for navbar testing including:
 * - FPS measurement during animations
 * - Memory usage tracking
 * - Network performance monitoring
 * - Core Web Vitals collection
 * - Frame timing analysis
 * 
 * @group performance
 * @group helpers
 */

import { Page } from '@playwright/test';

export interface PerformanceMetrics {
  // Core Web Vitals
  fcp?: number;           // First Contentful Paint
  lcp?: number;           // Largest Contentful Paint
  fid?: number;           // First Input Delay
  cls?: number;           // Cumulative Layout Shift
  ttfb?: number;          // Time to First Byte
  tti?: number;           // Time to Interactive

  // Animation Performance
  averageFps?: number;    // Average frames per second
  minFps?: number;        // Minimum FPS during animation
  maxFps?: number;        // Maximum FPS during animation
  frameDrops?: number;    // Number of dropped frames
  frameDropPercentage?: number; // Percentage of dropped frames
  totalFrames?: number;   // Total frames measured
  
  // Memory Usage
  usedJSHeapSize?: number;     // JavaScript heap used
  totalJSHeapSize?: number;    // JavaScript heap total
  jsHeapSizeLimit?: number;    // JavaScript heap limit
  memoryIncrease?: number;     // Memory increase during test
  
  // Network Performance
  totalRequests?: number;      // Total network requests
  totalTransferSize?: number;  // Total bytes transferred
  resourceLoadTime?: number;   // Average resource load time
  failedRequests?: number;     // Number of failed requests
  
  // Timing Metrics
  loadTime?: number;           // Total page load time
  domContentLoaded?: number;   // DOM content loaded time
  responseTime?: number;       // Average response time
  
  // Custom Navbar Metrics
  navbarRenderTime?: number;   // Time to render navbar
  mobileMenuAnimationTime?: number; // Mobile menu animation duration
  hoverResponseTime?: number;  // Hover interaction response time
  scrollPerformance?: number;  // Scroll performance score
}

export interface FrameData {
  timestamp: number;
  fps: number;
  duration: number;
}

export interface NetworkRequest {
  url: string;
  method: string;
  status: number;
  responseTime: number;
  transferSize: number;
  resourceType: string;
}

export class PerformanceMonitor {
  private page: Page;
  private isMonitoring: boolean = false;
  private frameData: FrameData[] = [];
  private networkRequests: NetworkRequest[] = [];
  private startTime: number = 0;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Start performance monitoring
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.startTime = Date.now();
    this.frameData = [];
    this.networkRequests = [];

    // Start network request monitoring
    await this.startNetworkMonitoring();

    // Inject performance monitoring script
    await this.injectPerformanceScript();
  }

  /**
   * Stop performance monitoring and return metrics
   */
  async stopMonitoring(): Promise<PerformanceMetrics> {
    if (!this.isMonitoring) {
      throw new Error('Performance monitoring is not active');
    }

    this.isMonitoring = false;

    // Collect all metrics
    const coreWebVitals = await this.collectCoreWebVitals();
    const frameMetrics = this.calculateFrameMetrics();
    const memoryMetrics = await this.collectMemoryMetrics();
    const networkMetrics = this.calculateNetworkMetrics();
    const timingMetrics = await this.collectTimingMetrics();
    const customMetrics = await this.collectCustomMetrics();

    return {
      ...coreWebVitals,
      ...frameMetrics,
      ...memoryMetrics,
      ...networkMetrics,
      ...timingMetrics,
      ...customMetrics
    };
  }

  /**
   * Measure FPS during a specific operation
   */
  async measureFPS(operation: () => Promise<void>, duration: number = 2000): Promise<FrameData[]> {
    const frameData: FrameData[] = [];
    
    // Start FPS measurement
    const fpsPromise = this.page.evaluate((measureDuration) => {
      return new Promise<Array<{ timestamp: number; fps: number; duration: number }>>((resolve) => {
        const frames: Array<{ timestamp: number; fps: number; duration: number }> = [];
        let lastTime = performance.now();
        let startTime = lastTime;
        let frameCount = 0;

        function measureFrame() {
          const now = performance.now();
          const delta = now - lastTime;
          const fps = 1000 / delta;
          
          frames.push({
            timestamp: now - startTime,
            fps: fps,
            duration: delta
          });

          lastTime = now;
          frameCount++;

          if (now - startTime < measureDuration) {
            requestAnimationFrame(measureFrame);
          } else {
            resolve(frames);
          }
        }

        requestAnimationFrame(measureFrame);
      });
    }, duration);

    // Execute the operation
    await operation();

    // Wait for FPS measurement to complete
    const frames = await fpsPromise;
    
    return frames.map(frame => ({
      timestamp: frame.timestamp,
      fps: frame.fps,
      duration: frame.duration
    }));
  }

  /**
   * Monitor memory usage during operation
   */
  async measureMemoryUsage(operation: () => Promise<void>): Promise<{
    initial: any;
    final: any;
    peak: any;
    increase: number;
  }> {
    // Get initial memory
    const initialMemory = await this.page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
      } : null;
    });

    let peakMemory = initialMemory;

    // Monitor memory during operation
    const memoryMonitor = setInterval(async () => {
      try {
        const currentMemory = await this.page.evaluate(() => {
          return (performance as any).memory ? {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
            jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
          } : null;
        });

        if (currentMemory && peakMemory && currentMemory.usedJSHeapSize > peakMemory.usedJSHeapSize) {
          peakMemory = currentMemory;
        }
      } catch (error) {
        // Ignore errors during monitoring
      }
    }, 100);

    // Execute operation
    await operation();

    clearInterval(memoryMonitor);

    // Get final memory
    const finalMemory = await this.page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
      } : null;
    });

    const memoryIncrease = finalMemory && initialMemory ? 
      finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize : 0;

    return {
      initial: initialMemory,
      final: finalMemory,
      peak: peakMemory,
      increase: memoryIncrease
    };
  }

  /**
   * Measure interaction response time
   */
  async measureResponseTime(interaction: () => Promise<void>): Promise<number> {
    const startTime = performance.now();
    await interaction();
    return performance.now() - startTime;
  }

  /**
   * Collect Core Web Vitals
   */
  private async collectCoreWebVitals(): Promise<Partial<PerformanceMetrics>> {
    try {
      const vitals = await this.page.evaluate(() => {
        return new Promise<any>((resolve) => {
          const metrics: any = {};
          let collected = 0;
          const expectedMetrics = 5;

          const tryResolve = () => {
            collected++;
            if (collected >= expectedMetrics) {
              setTimeout(() => resolve(metrics), 100);
            }
          };

          // First Contentful Paint
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.name === 'first-contentful-paint') {
                metrics.fcp = entry.startTime;
                tryResolve();
                return;
              }
            }
          }).observe({ entryTypes: ['paint'] });

          // Largest Contentful Paint
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length > 0) {
              const lastEntry = entries[entries.length - 1];
              metrics.lcp = lastEntry.startTime;
              tryResolve();
            }
          }).observe({ entryTypes: ['largest-contentful-paint'] });

          // Cumulative Layout Shift
          let clsValue = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
            metrics.cls = clsValue;
            tryResolve();
          }).observe({ entryTypes: ['layout-shift'] });

          // Time to First Byte
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            metrics.ttfb = navigation.responseStart - navigation.fetchStart;
            tryResolve();
          }

          // Time to Interactive (approximation)
          const loadEventEnd = navigation?.loadEventEnd || 0;
          metrics.tti = loadEventEnd - (navigation?.fetchStart || 0);
          tryResolve();

          // Timeout fallback
          setTimeout(() => resolve(metrics), 3000);
        });
      });

      return vitals;
    } catch (error) {
      return {};
    }
  }

  /**
   * Calculate frame metrics from collected data
   */
  private calculateFrameMetrics(): Partial<PerformanceMetrics> {
    if (this.frameData.length === 0) {
      return {};
    }

    const fpsList = this.frameData.map(frame => frame.fps).filter(fps => fps > 0 && fps < 1000);
    
    if (fpsList.length === 0) {
      return {};
    }

    const averageFps = fpsList.reduce((sum, fps) => sum + fps, 0) / fpsList.length;
    const minFps = Math.min(...fpsList);
    const maxFps = Math.max(...fpsList);
    const targetFps = 60;
    const frameDrops = fpsList.filter(fps => fps < targetFps - 5).length;
    const frameDropPercentage = frameDrops / fpsList.length;

    return {
      averageFps: Math.round(averageFps * 100) / 100,
      minFps: Math.round(minFps * 100) / 100,
      maxFps: Math.round(maxFps * 100) / 100,
      frameDrops,
      frameDropPercentage: Math.round(frameDropPercentage * 1000) / 10,
      totalFrames: fpsList.length
    };
  }

  /**
   * Collect memory metrics
   */
  private async collectMemoryMetrics(): Promise<Partial<PerformanceMetrics>> {
    try {
      const memoryInfo = await this.page.evaluate(() => {
        return (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
        } : null;
      });

      return memoryInfo || {};
    } catch (error) {
      return {};
    }
  }

  /**
   * Calculate network metrics
   */
  private calculateNetworkMetrics(): Partial<PerformanceMetrics> {
    if (this.networkRequests.length === 0) {
      return {};
    }

    const totalRequests = this.networkRequests.length;
    const totalTransferSize = this.networkRequests.reduce((sum, req) => sum + req.transferSize, 0);
    const averageResponseTime = this.networkRequests.reduce((sum, req) => sum + req.responseTime, 0) / totalRequests;
    const failedRequests = this.networkRequests.filter(req => req.status >= 400).length;

    return {
      totalRequests,
      totalTransferSize,
      resourceLoadTime: Math.round(averageResponseTime),
      failedRequests
    };
  }

  /**
   * Collect timing metrics
   */
  private async collectTimingMetrics(): Promise<Partial<PerformanceMetrics>> {
    try {
      const timing = await this.page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (!navigation) return {};

        return {
          loadTime: navigation.loadEventEnd - navigation.fetchStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          responseTime: navigation.responseEnd - navigation.responseStart
        };
      });

      return timing;
    } catch (error) {
      return {};
    }
  }

  /**
   * Collect custom navbar-specific metrics
   */
  private async collectCustomMetrics(): Promise<Partial<PerformanceMetrics>> {
    try {
      return await this.page.evaluate(() => {
        const navbar = document.querySelector('nav');
        if (!navbar) return {};

        // Get navbar render time (if marked)
        const navbarMark = performance.getEntriesByName('navbar-render-complete')[0];
        const navbarRenderTime = navbarMark ? navbarMark.startTime : undefined;

        // Get mobile menu animation time (if marked)
        const mobileMenuMark = performance.getEntriesByName('mobile-menu-animation')[0];
        const mobileMenuAnimationTime = mobileMenuMark ? mobileMenuMark.duration : undefined;

        return {
          navbarRenderTime,
          mobileMenuAnimationTime
        };
      });
    } catch (error) {
      return {};
    }
  }

  /**
   * Start monitoring network requests
   */
  private async startNetworkMonitoring(): Promise<void> {
    this.page.on('request', (request) => {
      // Track request start time
      (request as any)._startTime = Date.now();
    });

    this.page.on('response', (response) => {
      const request = response.request();
      const startTime = (request as any)._startTime || Date.now();
      const responseTime = Date.now() - startTime;

      this.networkRequests.push({
        url: response.url(),
        method: request.method(),
        status: response.status(),
        responseTime,
        transferSize: parseInt(response.headers()['content-length'] || '0'),
        resourceType: request.resourceType()
      });
    });
  }

  /**
   * Inject performance monitoring script into page
   */
  private async injectPerformanceScript(): Promise<void> {
    await this.page.addInitScript(() => {
      // Performance marks for custom metrics
      (window as any).markNavbarRenderComplete = () => {
        performance.mark('navbar-render-complete');
      };

      (window as any).markMobileMenuAnimation = (duration: number) => {
        performance.mark('mobile-menu-animation');
        performance.measure('mobile-menu-animation', 'mobile-menu-animation');
      };

      // Enhanced console logging for debugging
      const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn
      };

      console.log = (...args) => {
        if (args[0] && args[0].includes('[Performance]')) {
          originalConsole.log('[PERF-MONITOR]', performance.now(), ...args);
        } else {
          originalConsole.log(...args);
        }
      };
    });
  }
}

/**
 * Performance assertion helpers
 */
export class PerformanceAssertions {
  static expectGoodFPS(metrics: PerformanceMetrics, minFps: number = 55): void {
    if (metrics.averageFps !== undefined) {
      if (metrics.averageFps < minFps) {
        throw new Error(`Average FPS ${metrics.averageFps} is below threshold ${minFps}`);
      }
    }

    if (metrics.frameDropPercentage !== undefined) {
      if (metrics.frameDropPercentage > 10) {
        throw new Error(`Frame drop percentage ${metrics.frameDropPercentage}% exceeds 10%`);
      }
    }
  }

  static expectFastLoadTime(metrics: PerformanceMetrics, maxLoadTime: number = 3000): void {
    if (metrics.loadTime !== undefined) {
      if (metrics.loadTime > maxLoadTime) {
        throw new Error(`Load time ${metrics.loadTime}ms exceeds threshold ${maxLoadTime}ms`);
      }
    }
  }

  static expectGoodCoreWebVitals(metrics: PerformanceMetrics): void {
    const thresholds = {
      fcp: 1500,  // First Contentful Paint
      lcp: 2500,  // Largest Contentful Paint
      cls: 0.1,   // Cumulative Layout Shift
      fid: 100    // First Input Delay
    };

    if (metrics.fcp !== undefined && metrics.fcp > thresholds.fcp) {
      throw new Error(`FCP ${metrics.fcp}ms exceeds threshold ${thresholds.fcp}ms`);
    }

    if (metrics.lcp !== undefined && metrics.lcp > thresholds.lcp) {
      throw new Error(`LCP ${metrics.lcp}ms exceeds threshold ${thresholds.lcp}ms`);
    }

    if (metrics.cls !== undefined && metrics.cls > thresholds.cls) {
      throw new Error(`CLS ${metrics.cls} exceeds threshold ${thresholds.cls}`);
    }

    if (metrics.fid !== undefined && metrics.fid > thresholds.fid) {
      throw new Error(`FID ${metrics.fid}ms exceeds threshold ${thresholds.fid}ms`);
    }
  }

  static expectReasonableMemoryUsage(metrics: PerformanceMetrics, maxIncrease: number = 10485760): void { // 10MB
    if (metrics.memoryIncrease !== undefined) {
      if (metrics.memoryIncrease > maxIncrease) {
        throw new Error(`Memory increase ${Math.round(metrics.memoryIncrease / 1024 / 1024)}MB exceeds threshold ${Math.round(maxIncrease / 1024 / 1024)}MB`);
      }
    }
  }

  static expectEfficientNetworking(metrics: PerformanceMetrics, maxRequests: number = 30): void {
    if (metrics.totalRequests !== undefined) {
      if (metrics.totalRequests > maxRequests) {
        throw new Error(`Total requests ${metrics.totalRequests} exceeds threshold ${maxRequests}`);
      }
    }

    if (metrics.failedRequests !== undefined && metrics.failedRequests > 0) {
      throw new Error(`${metrics.failedRequests} failed requests found`);
    }
  }
}

/**
 * Utility function to create performance monitor
 */
export function createPerformanceMonitor(page: Page): PerformanceMonitor {
  return new PerformanceMonitor(page);
}