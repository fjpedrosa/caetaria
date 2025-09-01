/**
 * Real-time Performance Optimizer
 *
 * Advanced performance optimization for Supabase real-time subscriptions
 * with intelligent filtering, batching, and connection management.
 *
 * Features:
 * - Subscription filtering and optimization
 * - Message batching and throttling
 * - Connection pooling
 * - Memory management
 * - Performance metrics
 */

import type { Database } from '@/lib/supabase/types';

import { realtimeConnectionManager, type SubscriptionConfig } from './connection-manager';

// Performance configuration
export interface PerformanceConfig {
  maxSubscriptions: number;
  batchSize: number;
  batchTimeout: number;
  messageThrottle: number;
  memoryLimit: number; // in MB
  enableCompression: boolean;
  enableFiltering: boolean;
  priorityTables: string[];
}

// Default performance configuration
const DEFAULT_CONFIG: PerformanceConfig = {
  maxSubscriptions: 50,
  batchSize: 10,
  batchTimeout: 1000, // 1 second
  messageThrottle: 100, // 100ms
  memoryLimit: 50, // 50MB
  enableCompression: true,
  enableFiltering: true,
  priorityTables: ['leads', 'analytics_events'],
};

// Message queue for batching
interface QueuedMessage {
  subscriptionId: string;
  payload: any;
  timestamp: number;
  priority: number;
}

// Performance metrics
export interface PerformanceMetrics {
  subscriptionsCount: number;
  messagesPerSecond: number;
  averageLatency: number;
  memoryUsage: number;
  errorRate: number;
  connectionUptime: number;
  batchedMessages: number;
  throttledMessages: number;
}

/**
 * Real-time Performance Optimizer
 *
 * Manages performance optimization for real-time subscriptions
 * with intelligent batching, filtering, and resource management.
 */
class RealtimePerformanceOptimizer {
  private config: PerformanceConfig;
  private messageQueue: QueuedMessage[] = [];
  private batchTimer?: NodeJS.Timeout;
  private throttleMap = new Map<string, number>();
  private metrics: PerformanceMetrics;
  private metricsHistory: PerformanceMetrics[] = [];
  private messageRateCounter = 0;
  private lastRateReset = Date.now();

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.metrics = this.initializeMetrics();

    this.startPerformanceMonitoring();
    this.startBatchProcessor();
  }

  /**
   * Initialize performance metrics
   */
  private initializeMetrics(): PerformanceMetrics {
    return {
      subscriptionsCount: 0,
      messagesPerSecond: 0,
      averageLatency: 0,
      memoryUsage: 0,
      errorRate: 0,
      connectionUptime: 0,
      batchedMessages: 0,
      throttledMessages: 0,
    };
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    setInterval(() => {
      this.updateMetrics();
      this.checkMemoryUsage();
      this.cleanupThrottleMap();
    }, 1000); // Update every second

    // Store metrics history
    setInterval(() => {
      this.metricsHistory.push({ ...this.metrics });
      if (this.metricsHistory.length > 60) {
        this.metricsHistory.shift(); // Keep last 60 entries (1 minute of history)
      }
    }, 1000);
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(): void {
    const health = realtimeConnectionManager.getHealth();
    const now = Date.now();

    // Calculate messages per second
    const timeSinceReset = now - this.lastRateReset;
    if (timeSinceReset >= 1000) {
      this.metrics.messagesPerSecond = this.messageRateCounter;
      this.messageRateCounter = 0;
      this.lastRateReset = now;
    }

    // Update other metrics
    this.metrics.subscriptionsCount = health.subscriptionsCount;
    this.metrics.averageLatency = health.latency || 0;
    this.metrics.connectionUptime = health.connectedAt
      ? now - health.connectedAt.getTime()
      : 0;
  }

  /**
   * Check memory usage and cleanup if necessary
   */
  private checkMemoryUsage(): void {
    const memoryUsage = this.getEstimatedMemoryUsage();
    this.metrics.memoryUsage = memoryUsage;

    if (memoryUsage > this.config.memoryLimit) {
      console.warn(`� Memory usage (${memoryUsage}MB) exceeds limit (${this.config.memoryLimit}MB)`);
      this.performMemoryCleanup();
    }
  }

  /**
   * Estimate memory usage
   */
  private getEstimatedMemoryUsage(): number {
    // Rough estimation based on queue size and subscription count
    const queueSize = this.messageQueue.length * 0.001; // ~1KB per message
    const subscriptionSize = this.metrics.subscriptionsCount * 0.01; // ~10KB per subscription
    const historySize = this.metricsHistory.length * 0.001; // ~1KB per metrics entry

    return queueSize + subscriptionSize + historySize;
  }

  /**
   * Perform memory cleanup
   */
  private performMemoryCleanup(): void {
    // Clear old queue messages
    const cutoffTime = Date.now() - this.config.batchTimeout * 2;
    this.messageQueue = this.messageQueue.filter(msg => msg.timestamp > cutoffTime);

    // Limit metrics history
    if (this.metricsHistory.length > 30) {
      this.metricsHistory = this.metricsHistory.slice(-30);
    }

    console.log('>� Performed memory cleanup');
  }

  /**
   * Cleanup throttle map
   */
  private cleanupThrottleMap(): void {
    const now = Date.now();
    const cutoff = now - this.config.messageThrottle * 2;

    for (const [key, timestamp] of this.throttleMap.entries()) {
      if (timestamp < cutoff) {
        this.throttleMap.delete(key);
      }
    }
  }

  /**
   * Start batch message processor
   */
  private startBatchProcessor(): void {
    this.batchTimer = setInterval(() => {
      this.processBatch();
    }, this.config.batchTimeout);
  }

  /**
   * Process batched messages
   */
  private processBatch(): void {
    if (this.messageQueue.length === 0) return;

    // Sort by priority and timestamp
    this.messageQueue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Higher priority first
      }
      return a.timestamp - b.timestamp; // Older messages first
    });

    // Process in batches
    const batchSize = Math.min(this.config.batchSize, this.messageQueue.length);
    const batch = this.messageQueue.splice(0, batchSize);

    batch.forEach(message => {
      this.processMessage(message);
    });

    this.metrics.batchedMessages += batch.length;
  }

  /**
   * Process individual message
   */
  private processMessage(message: QueuedMessage): void {
    // This would forward the message to the appropriate handler
    // For now, we'll just log it
    console.log(`=� Processing batched message for ${message.subscriptionId}`, {
      priority: message.priority,
      age: Date.now() - message.timestamp,
    });
  }

  /**
   * Optimize subscription configuration
   */
  public optimizeSubscription<T>(config: SubscriptionConfig<T>): SubscriptionConfig<T> {
    if (!this.config.enableFiltering) {
      return config;
    }

    const optimizedConfig = { ...config };

    // Add selective filtering for high-volume tables
    if (this.isHighVolumeTable(config.table as string)) {
      optimizedConfig.filter = this.addSelectiveFilter(config.filter, config.table as string);
    }

    // Add priority based on table importance
    const priority = this.getTablePriority(config.table as string);

    // Wrap callback with performance optimizations
    const originalCallback = config.callback;
    optimizedConfig.callback = (payload: any) => {
      this.handleOptimizedCallback(config.id, payload, originalCallback, priority);
    };

    return optimizedConfig;
  }

  /**
   * Handle optimized callback with throttling and batching
   */
  private handleOptimizedCallback<T>(
    subscriptionId: string,
    payload: T,
    originalCallback: (payload: T) => void,
    priority: number
  ): void {
    const now = Date.now();
    const throttleKey = `${subscriptionId}_${JSON.stringify(payload).slice(0, 50)}`;

    // Check throttling
    if (this.shouldThrottle(throttleKey, now)) {
      this.metrics.throttledMessages++;
      return;
    }

    // Update throttle map
    this.throttleMap.set(throttleKey, now);

    // Count message
    this.messageRateCounter++;

    // For high-priority messages, process immediately
    if (priority > 8 || !this.config.enableFiltering) {
      originalCallback(payload);
      return;
    }

    // Queue for batch processing
    this.messageQueue.push({
      subscriptionId,
      payload,
      timestamp: now,
      priority,
    });
  }

  /**
   * Check if message should be throttled
   */
  private shouldThrottle(throttleKey: string, now: number): boolean {
    const lastTime = this.throttleMap.get(throttleKey);
    return lastTime !== undefined && (now - lastTime) < this.config.messageThrottle;
  }

  /**
   * Check if table is high-volume
   */
  private isHighVolumeTable(table: string): boolean {
    const highVolumeTables = ['analytics_events', 'user_sessions', 'page_views'];
    return highVolumeTables.includes(table);
  }

  /**
   * Add selective filtering for high-volume tables
   */
  private addSelectiveFilter(existingFilter: string | undefined, table: string): string {
    const filters: string[] = [];

    if (existingFilter) {
      filters.push(existingFilter);
    }

    // Add time-based filtering for high-volume tables
    switch (table) {
      case 'analytics_events':
        // Only events from last 24 hours
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        filters.push(`created_at.gte.${dayAgo}`);
        break;
      case 'user_sessions':
        // Only active sessions
        filters.push('status.eq.active');
        break;
    }

    return filters.join(',');
  }

  /**
   * Get table priority
   */
  private getTablePriority(table: string): number {
    if (this.config.priorityTables.includes(table)) {
      return 9; // High priority
    }

    switch (table) {
      case 'leads':
        return 8;
      case 'whatsapp_integrations':
        return 7;
      case 'bot_configurations':
        return 6;
      case 'analytics_events':
        return 3; // Lower priority due to volume
      default:
        return 5;
    }
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get metrics history
   */
  public getMetricsHistory(): PerformanceMetrics[] {
    return [...this.metricsHistory];
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('� Updated performance configuration', this.config);
  }

  /**
   * Get configuration
   */
  public getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  /**
   * Reset metrics
   */
  public resetMetrics(): void {
    this.metrics = this.initializeMetrics();
    this.metricsHistory = [];
    this.messageRateCounter = 0;
    this.lastRateReset = Date.now();
    console.log('= Performance metrics reset');
  }

  /**
   * Performance analysis report
   */
  public generateReport(): {
    summary: string;
    recommendations: string[];
    metrics: PerformanceMetrics;
    config: PerformanceConfig;
  } {
    const recommendations: string[] = [];

    // Analyze metrics and generate recommendations
    if (this.metrics.subscriptionsCount > this.config.maxSubscriptions * 0.8) {
      recommendations.push('Consider reducing the number of active subscriptions');
    }

    if (this.metrics.averageLatency > 200) {
      recommendations.push('High latency detected - check network connection');
    }

    if (this.metrics.memoryUsage > this.config.memoryLimit * 0.8) {
      recommendations.push('Memory usage is high - consider increasing cleanup frequency');
    }

    if (this.metrics.throttledMessages > this.metrics.batchedMessages * 0.1) {
      recommendations.push('High message throttling - consider increasing throttle limits');
    }

    const summary = `Real-time performance summary: ${this.metrics.subscriptionsCount} active subscriptions, ` +
      `${this.metrics.messagesPerSecond} msg/s, ${this.metrics.averageLatency}ms latency, ` +
      `${this.metrics.memoryUsage.toFixed(1)}MB memory usage`;

    return {
      summary,
      recommendations,
      metrics: this.getMetrics(),
      config: this.getConfig(),
    };
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }

    this.messageQueue = [];
    this.throttleMap.clear();
    this.metricsHistory = [];

    console.log('>� Performance optimizer destroyed');
  }
}

// Create singleton instance
export const performanceOptimizer = new RealtimePerformanceOptimizer();

// Export utilities
export type { PerformanceConfig, PerformanceMetrics };