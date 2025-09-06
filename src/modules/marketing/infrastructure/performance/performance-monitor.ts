/**
 * Performance Monitor
 * Utility for monitoring and optimizing component performance
 */

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  componentCount: number;
  slowRenders: number;
  averageFPS: number;
}

/**
 * Performance monitor class for development
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics = {
    renderTime: 0,
    memoryUsage: 0,
    componentCount: 0,
    slowRenders: 0,
    averageFPS: 60
  };
  private frameTimestamps: number[] = [];
  private isMonitoring = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start monitoring performance
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitorFPS();
    this.monitorMemory();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Performance monitoring started');
    }
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Performance monitoring stopped');
    }
  }

  /**
   * Monitor FPS
   */
  private monitorFPS(): void {
    const measureFPS = () => {
      if (!this.isMonitoring) return;
      
      const now = performance.now();
      this.frameTimestamps.push(now);
      
      // Keep only last 60 frames
      if (this.frameTimestamps.length > 60) {
        this.frameTimestamps.shift();
      }
      
      // Calculate average FPS
      if (this.frameTimestamps.length > 1) {
        const timeSpan = now - this.frameTimestamps[0];
        this.metrics.averageFPS = Math.round((this.frameTimestamps.length / timeSpan) * 1000);
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }

  /**
   * Monitor memory usage
   */
  private monitorMemory(): void {
    if (!('memory' in performance)) return;
    
    const checkMemory = () => {
      if (!this.isMonitoring) return;
      
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = Math.round(memory.usedJSHeapSize / 1048576); // Convert to MB
      
      // Check again in 5 seconds
      setTimeout(checkMemory, 5000);
    };
    
    checkMemory();
  }

  /**
   * Measure component render time
   */
  measureRender(componentName: string, renderFn: () => void): void {
    const startTime = performance.now();
    
    renderFn();
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    this.metrics.renderTime = renderTime;
    this.metrics.componentCount++;
    
    // Track slow renders (> 16ms = 60fps threshold)
    if (renderTime > 16) {
      this.metrics.slowRenders++;
      
      if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️ Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Log performance report
   */
  logReport(): void {
    if (process.env.NODE_ENV !== 'development') return;
    
    console.group('📊 Performance Report');
    console.log(`Average FPS: ${this.metrics.averageFPS}`);
    console.log(`Memory Usage: ${this.metrics.memoryUsage}MB`);
    console.log(`Components Rendered: ${this.metrics.componentCount}`);
    console.log(`Slow Renders: ${this.metrics.slowRenders}`);
    console.log(`Average Render Time: ${(this.metrics.renderTime / this.metrics.componentCount).toFixed(2)}ms`);
    console.groupEnd();
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.metrics = {
      renderTime: 0,
      memoryUsage: 0,
      componentCount: 0,
      slowRenders: 0,
      averageFPS: 60
    };
    this.frameTimestamps = [];
  }
}

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitor(componentName: string) {
  const monitor = PerformanceMonitor.getInstance();
  
  // Start monitoring on mount
  if (process.env.NODE_ENV === 'development') {
    monitor.startMonitoring();
  }
  
  return {
    measureRender: (renderFn: () => void) => monitor.measureRender(componentName, renderFn),
    getMetrics: () => monitor.getMetrics(),
    logReport: () => monitor.logReport()
  };
}

/**
 * Higher-order component for performance monitoring
 */
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
): React.ComponentType<P> {
  return (props: P) => {
    const { measureRender } = usePerformanceMonitor(componentName);
    
    // Measure render in development only
    if (process.env.NODE_ENV === 'development') {
      measureRender(() => {
        // Component will be rendered by React
      });
    }
    
    return <Component {...props} />;
  };
}