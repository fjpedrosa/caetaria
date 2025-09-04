/**
 * SSR-Safe Realtime Connection Manager
 * 
 * This wrapper ensures that realtime functionality only executes
 * in browser environments, preventing SSR build errors.
 */

import type { 
  ConnectionHealth, 
  SubscriptionConfig,
  RealtimeSubscriptionPayload,
  ConnectionManagerEvent,
  ConnectionManagerEventPayload
} from './connection-manager';

// Mock implementations for SSR
const createMockManager = () => ({
  subscribe: <T = any>(_config: SubscriptionConfig<T>) => {
    console.warn('Realtime subscription attempted during SSR, returning mock unsubscribe');
    return () => {};
  },
  unsubscribe: (_subscriptionId: string, _reason?: string) => {
    console.warn('Realtime unsubscribe attempted during SSR');
  },
  getHealth: (): ConnectionHealth => ({
    state: 'disconnected' as const,
    reconnectAttempts: 0,
    subscriptionsCount: 0,
  }),
  getSubscriptions: () => [],
  toggleSubscription: (_subscriptionId: string, _enabled: boolean) => {
    console.warn('Realtime toggle attempted during SSR');
  },
  on: <T extends ConnectionManagerEvent>(
    _event: T,
    _listener: (payload: ConnectionManagerEventPayload[T]) => void
  ) => {
    console.warn('Realtime event listener attempted during SSR');
    return () => {};
  },
  destroy: () => {
    console.warn('Realtime destroy attempted during SSR');
  }
});

// Lazy load the real manager only in browser
let realManager: any = null;

const getRealManager = async () => {
  if (typeof window === 'undefined') {
    return createMockManager();
  }

  if (!realManager) {
    try {
      const { realtimeConnectionManager } = await import('./connection-manager');
      realManager = realtimeConnectionManager;
    } catch (error) {
      console.error('Failed to load realtime connection manager:', error);
      return createMockManager();
    }
  }

  return realManager;
};

// SSR-safe wrapper
export const ssrSafeRealtimeManager = {
  async subscribe<T = any>(config: SubscriptionConfig<T>): Promise<() => void> {
    const manager = await getRealManager();
    return manager.subscribe(config);
  },

  async unsubscribe(subscriptionId: string, reason?: string): Promise<void> {
    const manager = await getRealManager();
    return manager.unsubscribe(subscriptionId, reason);
  },

  async getHealth(): Promise<ConnectionHealth> {
    const manager = await getRealManager();
    return manager.getHealth();
  },

  async getSubscriptions(): Promise<SubscriptionConfig[]> {
    const manager = await getRealManager();
    return manager.getSubscriptions();
  },

  async toggleSubscription(subscriptionId: string, enabled: boolean): Promise<void> {
    const manager = await getRealManager();
    return manager.toggleSubscription(subscriptionId, enabled);
  },

  async on<T extends ConnectionManagerEvent>(
    event: T,
    listener: (payload: ConnectionManagerEventPayload[T]) => void
  ): Promise<() => void> {
    const manager = await getRealManager();
    return manager.on(event, listener);
  },

  async destroy(): Promise<void> {
    const manager = await getRealManager();
    return manager.destroy();
  }
};

// Synchronous version for immediate use (returns mock during SSR)
export const syncRealtimeManager = (() => {
  if (typeof window === 'undefined') {
    return createMockManager();
  }

  // In browser, try to import synchronously
  try {
    // This will only work if the module is already loaded
    const manager = require('./connection-manager').realtimeConnectionManager;
    return manager;
  } catch {
    return createMockManager();
  }
})();

export default ssrSafeRealtimeManager;
