/**
 * Supabase Real-time Module
 *
 * Comprehensive real-time subscription system with advanced features:
 * - Connection management and health monitoring
 * - Performance optimization with batching and filtering
 * - Custom React hooks for different data types
 * - Live dashboard components
 * - Error handling and recovery
 *
 * Usage:
 * ```typescript
 * import { useRealtimeLeads, RealtimeDashboard } from '@/lib/supabase/realtime';
 *
 * // Use real-time leads subscription
 * const { isSubscribed, error } = useRealtimeLeads();
 *
 * // Display live dashboard
 * <RealtimeDashboard />
 * ```
 */

// Core connection management
export {
  type ConnectionHealth,
  type ConnectionManagerEvent,
  type ConnectionManagerEventPayload,
  ConnectionState,
  type RealtimeSubscriptionPayload,
  type SubscriptionConfig,
  type SubscriptionEvent} from './connection-manager';

// SSR-safe manager
export {
  ssrSafeRealtimeManager as realtimeConnectionManager,
  syncRealtimeManager
} from './ssr-safe-manager';

// React hooks
export {
  useRealtimeAdminDashboard,
  useRealtimeAnalytics,
  useRealtimeBotConfiguration,
  useRealtimeCleanup,
  useRealtimeConnection,
  useRealtimeLeads,
  type UseRealtimeOptions,
  useRealtimePerformance,
  useRealtimeSubscription,
  useRealtimeWhatsAppIntegration} from './hooks';

// Performance optimization
export {
  type PerformanceConfig,
  type PerformanceMetrics,
  performanceOptimizer} from './performance-optimizer';

// UI Components
export {
  RealtimeDashboard
} from './components/realtime-dashboard';

// Utilities
export const createOptimizedSubscription = <T>(
  id: string,
  table: keyof import('@/lib/supabase/types').Database['public']['Tables'],
  event: SubscriptionEvent,
  callback: (payload: RealtimeSubscriptionPayload<T>) => void,
  options: Partial<SubscriptionConfig<T>> = {}
): Promise<() => void> => {
  const config: SubscriptionConfig<T> = {
    id,
    table,
    event,
    callback,
    ...options,
  };

  // Apply performance optimizations
  const optimizedConfig = performanceOptimizer.optimizeSubscription(config);

  // Create subscription using SSR-safe manager
  return realtimeConnectionManager.subscribe(optimizedConfig);
};

// Health check utility
export const checkRealtimeHealth = async () => {
  const health = await realtimeConnectionManager.getHealth();
  const metrics = performanceOptimizer.getMetrics();
  const report = performanceOptimizer.generateReport();

  return {
    isHealthy: health.state === 'connected' &&
               metrics.averageLatency < 200 &&
               metrics.errorRate < 0.05,
    health,
    metrics,
    report,
  };
};

// Cleanup utility for app shutdown
export const cleanupRealtime = async () => {
  console.log('>� Cleaning up real-time resources...');

  await realtimeConnectionManager.destroy();
  performanceOptimizer.destroy();

  console.log(' Real-time cleanup complete');
};