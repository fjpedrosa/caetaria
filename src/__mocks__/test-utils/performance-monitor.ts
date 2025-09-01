/**
 * Performance Monitoring for Database Queries in Tests
 *
 * Provides utilities to measure and assert on database query performance
 * during testing to catch performance regressions early.
 */

import { performance } from 'perf_hooks';

// =============================================================================
// PERFORMANCE THRESHOLDS
// =============================================================================

export const PERFORMANCE_THRESHOLDS = {
  // Database operation thresholds (in milliseconds)
  SELECT_SIMPLE: 100,      // Simple SELECT queries
  SELECT_COMPLEX: 300,     // Complex SELECT with joins/aggregations
  INSERT_SINGLE: 50,       // Single INSERT operation
  INSERT_BATCH: 200,       // Batch INSERT operations
  UPDATE_SINGLE: 100,      // Single UPDATE operation
  UPDATE_BATCH: 300,       // Batch UPDATE operations
  DELETE_SINGLE: 100,      // Single DELETE operation
  DELETE_BATCH: 200,       // Batch DELETE operations

  // API response thresholds
  API_RESPONSE: 500,       // API endpoint response time

  // UI operation thresholds
  RENDER_COMPONENT: 16,    // Component render time (60fps = 16.67ms)
  FORM_VALIDATION: 50,     // Form validation response

  // Integration test thresholds
  INTEGRATION_SETUP: 5000, // Integration test setup time
  E2E_OPERATION: 10000,    // E2E test operation timeout
} as const;

// =============================================================================
// PERFORMANCE MEASUREMENT UTILITIES
// =============================================================================

export interface PerformanceMeasurement {
  operation: string;
  duration: number;
  startTime: number;
  endTime: number;
  metadata?: Record<string, any>;
}

export interface PerformanceReport {
  measurements: PerformanceMeasurement[];
  totalDuration: number;
  averageDuration: number;
  slowestOperation: PerformanceMeasurement;
  fastestOperation: PerformanceMeasurement;
}

class PerformanceMonitor {
  private measurements: PerformanceMeasurement[] = [];
  private activeOperations = new Map<string, number>();

  /**
   * Start measuring an operation
   */
  start(operationName: string, metadata?: Record<string, any>): string {
    const operationId = `${operationName}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const startTime = performance.now();

    this.activeOperations.set(operationId, startTime);

    if (metadata) {
      // Store metadata for later use
      (this as any)[`${operationId}_metadata`] = metadata;
    }

    return operationId;
  }

  /**
   * Stop measuring an operation and record the result
   */
  stop(operationId: string): PerformanceMeasurement {
    const endTime = performance.now();
    const startTime = this.activeOperations.get(operationId);

    if (!startTime) {
      throw new Error(`No active operation found with ID: ${operationId}`);
    }

    const duration = endTime - startTime;
    const metadata = (this as any)[`${operationId}_metadata`];

    const measurement: PerformanceMeasurement = {
      operation: operationId.split('_')[0],
      duration,
      startTime,
      endTime,
      metadata,
    };

    this.measurements.push(measurement);
    this.activeOperations.delete(operationId);

    // Clean up metadata
    if (metadata) {
      delete (this as any)[`${operationId}_metadata`];
    }

    return measurement;
  }

  /**
   * Measure a synchronous operation
   */
  measure<T>(operationName: string, operation: () => T, metadata?: Record<string, any>): T {
    const operationId = this.start(operationName, metadata);

    try {
      const result = operation();
      this.stop(operationId);
      return result;
    } catch (error) {
      this.stop(operationId); // Still record the measurement even if it failed
      throw error;
    }
  }

  /**
   * Measure an asynchronous operation
   */
  async measureAsync<T>(
    operationName: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const operationId = this.start(operationName, metadata);

    try {
      const result = await operation();
      this.stop(operationId);
      return result;
    } catch (error) {
      this.stop(operationId); // Still record the measurement even if it failed
      throw error;
    }
  }

  /**
   * Get performance report for all measurements
   */
  getReport(): PerformanceReport {
    if (this.measurements.length === 0) {
      throw new Error('No measurements recorded');
    }

    const totalDuration = this.measurements.reduce((sum, m) => sum + m.duration, 0);
    const averageDuration = totalDuration / this.measurements.length;

    const sortedByDuration = [...this.measurements].sort((a, b) => a.duration - b.duration);
    const slowestOperation = sortedByDuration[sortedByDuration.length - 1];
    const fastestOperation = sortedByDuration[0];

    return {
      measurements: [...this.measurements],
      totalDuration,
      averageDuration,
      slowestOperation,
      fastestOperation,
    };
  }

  /**
   * Clear all measurements
   */
  reset(): void {
    this.measurements = [];
    this.activeOperations.clear();
  }

  /**
   * Get measurements for a specific operation type
   */
  getMeasurementsForOperation(operationName: string): PerformanceMeasurement[] {
    return this.measurements.filter(m => m.operation === operationName);
  }

  /**
   * Get current active operations (for debugging)
   */
  getActiveOperations(): string[] {
    return Array.from(this.activeOperations.keys());
  }
}

// =============================================================================
// GLOBAL PERFORMANCE MONITOR INSTANCE
// =============================================================================

export const performanceMonitor = new PerformanceMonitor();

// =============================================================================
// DATABASE-SPECIFIC PERFORMANCE UTILITIES
// =============================================================================

/**
 * Wrap a Supabase query with performance monitoring
 */
export const monitorSupabaseQuery = async <T>(
  operationName: string,
  query: Promise<T>,
  expectedThreshold?: number
): Promise<T> => {
  const result = await performanceMonitor.measureAsync(
    `db_${operationName}`,
    () => query,
    { query_type: 'supabase', expected_threshold: expectedThreshold }
  );

  // Check performance against threshold
  if (expectedThreshold) {
    const lastMeasurement = performanceMonitor.getMeasurementsForOperation(`db_${operationName}`).pop();
    if (lastMeasurement && lastMeasurement.duration > expectedThreshold) {
      console.warn(
        `⚠️  Performance warning: ${operationName} took ${lastMeasurement.duration.toFixed(2)}ms ` +
        `(expected < ${expectedThreshold}ms)`
      );
    }
  }

  return result;
};

/**
 * Monitor a batch of database operations
 */
export const monitorBatchOperations = async <T>(
  operationName: string,
  operations: Promise<T>[],
  expectedThreshold?: number
): Promise<T[]> => {
  return performanceMonitor.measureAsync(
    `batch_${operationName}`,
    () => Promise.all(operations),
    {
      operation_count: operations.length,
      expected_threshold: expectedThreshold,
      batch_operation: true
    }
  );
};

// =============================================================================
// PERFORMANCE ASSERTIONS FOR TESTS
// =============================================================================

/**
 * Assert that an operation completed within the expected time
 */
export const expectPerformance = {
  toBeWithinThreshold: (measurement: PerformanceMeasurement, threshold: number) => {
    if (measurement.duration > threshold) {
      throw new Error(
        `Performance assertion failed: ${measurement.operation} took ${measurement.duration.toFixed(2)}ms ` +
        `but expected < ${threshold}ms`
      );
    }
  },

  toBeFasterThan: (measurement: PerformanceMeasurement, comparison: PerformanceMeasurement) => {
    if (measurement.duration >= comparison.duration) {
      throw new Error(
        `Performance assertion failed: ${measurement.operation} (${measurement.duration.toFixed(2)}ms) ` +
        `should be faster than ${comparison.operation} (${comparison.duration.toFixed(2)}ms)`
      );
    }
  },

  averageToBeWithinThreshold: (measurements: PerformanceMeasurement[], threshold: number) => {
    const average = measurements.reduce((sum, m) => sum + m.duration, 0) / measurements.length;
    if (average > threshold) {
      throw new Error(
        `Performance assertion failed: Average duration ${average.toFixed(2)}ms ` +
        `but expected < ${threshold}ms`
      );
    }
  },
};

// =============================================================================
// JEST MATCHERS FOR PERFORMANCE TESTING
// =============================================================================

declare global {
  namespace jest {
    interface Matchers<R> {
      toCompleteWithinThreshold(threshold: number): R;
      toBeFasterThan(comparison: PerformanceMeasurement): R;
    }
  }
}

// Custom Jest matchers
expect.extend({
  toCompleteWithinThreshold(received: PerformanceMeasurement, threshold: number) {
    const pass = received.duration <= threshold;

    return {
      message: () =>
        pass
          ? `Expected ${received.operation} to take more than ${threshold}ms, but it took ${received.duration.toFixed(2)}ms`
          : `Expected ${received.operation} to complete within ${threshold}ms, but it took ${received.duration.toFixed(2)}ms`,
      pass,
    };
  },

  toBeFasterThan(received: PerformanceMeasurement, comparison: PerformanceMeasurement) {
    const pass = received.duration < comparison.duration;

    return {
      message: () =>
        pass
          ? `Expected ${received.operation} (${received.duration.toFixed(2)}ms) to be slower than ${comparison.operation} (${comparison.duration.toFixed(2)}ms)`
          : `Expected ${received.operation} (${received.duration.toFixed(2)}ms) to be faster than ${comparison.operation} (${comparison.duration.toFixed(2)}ms)`,
      pass,
    };
  },
});

// =============================================================================
// TEST UTILITIES
// =============================================================================

/**
 * Set up performance monitoring for a test suite
 */
export const setupPerformanceMonitoring = () => {
  beforeEach(() => {
    performanceMonitor.reset();
  });

  afterEach(() => {
    const activeOperations = performanceMonitor.getActiveOperations();
    if (activeOperations.length > 0) {
      console.warn(`⚠️  Leaked performance measurements: ${activeOperations.join(', ')}`);
    }
  });
};

/**
 * Generate performance report for debugging
 */
export const logPerformanceReport = (title = 'Performance Report') => {
  try {
    const report = performanceMonitor.getReport();

    console.log(`\n📊 ${title}`);
    console.log(`Total operations: ${report.measurements.length}`);
    console.log(`Total time: ${report.totalDuration.toFixed(2)}ms`);
    console.log(`Average time: ${report.averageDuration.toFixed(2)}ms`);
    console.log(`Slowest: ${report.slowestOperation.operation} (${report.slowestOperation.duration.toFixed(2)}ms)`);
    console.log(`Fastest: ${report.fastestOperation.operation} (${report.fastestOperation.duration.toFixed(2)}ms)`);

    // Show operations that exceeded common thresholds
    const slowOperations = report.measurements.filter(m => m.duration > 100);
    if (slowOperations.length > 0) {
      console.log('\n⚠️  Operations > 100ms:');
      slowOperations.forEach(op => {
        console.log(`  - ${op.operation}: ${op.duration.toFixed(2)}ms`);
      });
    }

  } catch (error) {
    console.log(`\n📊 ${title}: No measurements recorded`);
  }
};

// =============================================================================
// EXPORTS
// =============================================================================

export { PerformanceMonitor };
export type { PerformanceMeasurement, PerformanceReport };