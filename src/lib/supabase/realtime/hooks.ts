/**
 * Real-time Subscription Hooks
 *
 * React hooks for managing real-time subscriptions with automatic
 * cleanup, error handling, and integration with RTK Query cache.
 *
 * Features:
 * - Automatic subscription management
 * - RTK Query cache invalidation
 * - Error handling and recovery
 * - Performance optimization
 * - TypeScript support
 */

import { useCallback, useEffect, useMemo,useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import type {
  AnalyticsEvent,
  BotConfiguration,
  Database,
  Lead,
  WhatsAppIntegration} from '@/lib/supabase/types';
import { leadsApi } from '@/store/api/leads-api';

import {
  type ConnectionHealth,
  type ConnectionState,
  realtimeConnectionManager,
  type RealtimeSubscriptionPayload,
  type SubscriptionConfig,
  type SubscriptionEvent
} from './connection-manager';

// Hook options
interface UseRealtimeOptions {
  enabled?: boolean;
  filter?: string;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

// Connection status hook
export function useRealtimeConnection() {
  const [connectionHealth, setConnectionHealth] = useState<ConnectionHealth>(() =>
    realtimeConnectionManager.getHealth()
  );

  useEffect(() => {
    // Update health state periodically
    const updateHealth = () => {
      setConnectionHealth(realtimeConnectionManager.getHealth());
    };

    // Listen to connection events
    const unsubscribeStateChange = realtimeConnectionManager.on('state_change', updateHealth);
    const unsubscribeError = realtimeConnectionManager.on('error', updateHealth);
    const unsubscribeReconnect = realtimeConnectionManager.on('reconnect_attempt', updateHealth);

    // Initial update
    updateHealth();

    // Set up interval for periodic updates
    const interval = setInterval(updateHealth, 5000); // Every 5 seconds

    return () => {
      unsubscribeStateChange();
      unsubscribeError();
      unsubscribeReconnect();
      clearInterval(interval);
    };
  }, []);

  return {
    ...connectionHealth,
    isConnected: connectionHealth.state === 'connected',
    isConnecting: connectionHealth.state === 'connecting' || connectionHealth.state === 'reconnecting',
    hasError: connectionHealth.state === 'error',
  };
}

// Generic real-time subscription hook
export function useRealtimeSubscription<T = any>(
  subscriptionId: string,
  table: keyof Database['public']['Tables'],
  event: SubscriptionEvent,
  callback: (payload: RealtimeSubscriptionPayload<T>) => void,
  options: UseRealtimeOptions = {}
) {
  const {
    enabled = true,
    filter,
    onError,
    onConnect,
    onDisconnect,
  } = options;

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const handleCallback = useCallback((payload: RealtimeSubscriptionPayload<T>) => {
    try {
      callback(payload);
      setError(null);
    } catch (error) {
      console.error(`Callback error in subscription ${subscriptionId}:`, error);
      setError(error as Error);
      onError?.(error as Error);
    }
  }, [callback, subscriptionId, onError]);

  const handleError = useCallback((error: Error) => {
    console.error(`Subscription error for ${subscriptionId}:`, error);
    setError(error);
    onError?.(error);
  }, [subscriptionId, onError]);

  useEffect(() => {
    if (!enabled) {
      // Clean up if disabled
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
        setIsSubscribed(false);
      }
      return;
    }

    const config: SubscriptionConfig<T> = {
      id: subscriptionId,
      table,
      event,
      filter,
      callback: handleCallback,
      errorCallback: handleError,
    };

    // Subscribe
    const unsubscribe = realtimeConnectionManager.subscribe(config);
    unsubscribeRef.current = unsubscribe;
    setIsSubscribed(true);
    onConnect?.();

    return () => {
      unsubscribe();
      unsubscribeRef.current = null;
      setIsSubscribed(false);
      onDisconnect?.();
    };
  }, [
    enabled,
    subscriptionId,
    table,
    event,
    filter,
    handleCallback,
    handleError,
    onConnect,
    onDisconnect,
  ]);

  return {
    isSubscribed,
    error,
    reconnect: useCallback(() => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        // Re-trigger the effect by changing a dependency
        setIsSubscribed(false);
        setTimeout(() => setIsSubscribed(true), 100);
      }
    }, []),
  };
}

// Leads real-time subscription hook
export function useRealtimeLeads(options: UseRealtimeOptions = {}) {
  const dispatch = useDispatch();

  const handleLeadUpdate = useCallback((payload: RealtimeSubscriptionPayload<Lead>) => {
    console.log('=� Real-time lead update:', payload);

    // Invalidate leads cache to trigger refetch
    dispatch(leadsApi.util.invalidateTags(['Lead', 'LeadsList', 'LeadStats']));

    // Optional: Update specific cache entries for better performance
    if (payload.eventType === 'UPDATE' && payload.new) {
      dispatch(leadsApi.util.updateQueryData('getLead', payload.new.id, (draft) => {
        Object.assign(draft, payload.new);
      }));
    }
  }, [dispatch]);

  const subscription = useRealtimeSubscription<Lead>(
    'leads-realtime',
    'leads',
    '*',
    handleLeadUpdate,
    options
  );

  return {
    ...subscription,
    // Additional methods for lead-specific operations
    invalidateCache: useCallback(() => {
      dispatch(leadsApi.util.invalidateTags(['Lead', 'LeadsList', 'LeadStats']));
    }, [dispatch]),
  };
}

// Analytics events real-time subscription hook
export function useRealtimeAnalytics(options: UseRealtimeOptions = {}) {
  const [latestEvent, setLatestEvent] = useState<AnalyticsEvent | null>(null);
  const [eventCount, setEventCount] = useState(0);

  const handleAnalyticsUpdate = useCallback((payload: RealtimeSubscriptionPayload<AnalyticsEvent>) => {
    console.log('=� Real-time analytics event:', payload);

    if (payload.new) {
      setLatestEvent(payload.new);
      setEventCount(prev => prev + 1);
    }
  }, []);

  const subscription = useRealtimeSubscription<AnalyticsEvent>(
    'analytics-realtime',
    'analytics_events',
    'INSERT', // Only listen to new events
    handleAnalyticsUpdate,
    options
  );

  return {
    ...subscription,
    latestEvent,
    eventCount,
    resetEventCount: useCallback(() => setEventCount(0), []),
  };
}

// Bot configuration real-time subscription hook
export function useRealtimeBotConfiguration(userId?: string, options: UseRealtimeOptions = {}) {
  const [configurations, setConfigurations] = useState<BotConfiguration[]>([]);

  const handleBotConfigUpdate = useCallback((payload: RealtimeSubscriptionPayload<BotConfiguration>) => {
    console.log('> Real-time bot config update:', payload);

    setConfigurations(prev => {
      switch (payload.eventType) {
        case 'INSERT':
          if (payload.new) {
            return [...prev, payload.new];
          }
          break;
        case 'UPDATE':
          if (payload.new) {
            return prev.map(config =>
              config.id === payload.new!.id ? payload.new! : config
            );
          }
          break;
        case 'DELETE':
          if (payload.old) {
            return prev.filter(config => config.id !== payload.old!.id);
          }
          break;
      }
      return prev;
    });
  }, []);

  const subscription = useRealtimeSubscription<BotConfiguration>(
    'bot-config-realtime',
    'bot_configurations',
    '*',
    handleBotConfigUpdate,
    {
      ...options,
      filter: userId ? `user_id=eq.${userId}` : undefined,
    }
  );

  return {
    ...subscription,
    configurations,
    getConfigById: useCallback((id: string) =>
      configurations.find(config => config.id === id), [configurations]
    ),
  };
}

// WhatsApp integration real-time subscription hook
export function useRealtimeWhatsAppIntegration(userId?: string, options: UseRealtimeOptions = {}) {
  const [integrations, setIntegrations] = useState<WhatsAppIntegration[]>([]);

  const handleIntegrationUpdate = useCallback((payload: RealtimeSubscriptionPayload<WhatsAppIntegration>) => {
    console.log('=� Real-time WhatsApp integration update:', payload);

    setIntegrations(prev => {
      switch (payload.eventType) {
        case 'INSERT':
          if (payload.new) {
            return [...prev, payload.new];
          }
          break;
        case 'UPDATE':
          if (payload.new) {
            return prev.map(integration =>
              integration.id === payload.new!.id ? payload.new! : integration
            );
          }
          break;
        case 'DELETE':
          if (payload.old) {
            return prev.filter(integration => integration.id !== payload.old!.id);
          }
          break;
      }
      return prev;
    });
  }, []);

  const subscription = useRealtimeSubscription<WhatsAppIntegration>(
    'whatsapp-integration-realtime',
    'whatsapp_integrations',
    '*',
    handleIntegrationUpdate,
    {
      ...options,
      filter: userId ? `user_id=eq.${userId}` : undefined,
    }
  );

  return {
    ...subscription,
    integrations,
    getIntegrationById: useCallback((id: string) =>
      integrations.find(integration => integration.id === id), [integrations]
    ),
    getActiveIntegrations: useCallback(() =>
      integrations.filter(integration => integration.status === 'active'), [integrations]
    ),
  };
}

// Multi-subscription hook for admin dashboard
export function useRealtimeAdminDashboard(options: UseRealtimeOptions = {}) {
  const leadsSubscription = useRealtimeLeads(options);
  const analyticsSubscription = useRealtimeAnalytics(options);

  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeadsToday: 0,
    totalEvents: 0,
    eventsToday: 0,
  });

  // Update stats when data changes
  useEffect(() => {
    // This would typically fetch initial data and update based on real-time updates
    // For now, we'll simulate with the event counts
    setStats(prev => ({
      ...prev,
      totalEvents: prev.totalEvents + (analyticsSubscription.eventCount || 0),
      eventsToday: analyticsSubscription.eventCount || 0,
    }));
  }, [analyticsSubscription.eventCount]);

  const connection = useRealtimeConnection();

  return {
    connection,
    leads: leadsSubscription,
    analytics: analyticsSubscription,
    stats,
    isAllConnected: leadsSubscription.isSubscribed && analyticsSubscription.isSubscribed,
    hasErrors: !!(leadsSubscription.error || analyticsSubscription.error),
    reconnectAll: useCallback(() => {
      leadsSubscription.reconnect();
      analyticsSubscription.reconnect();
    }, [leadsSubscription.reconnect, analyticsSubscription.reconnect]),
  };
}

// Performance monitoring hook
export function useRealtimePerformance() {
  const [metrics, setMetrics] = useState({
    subscriptionsCount: 0,
    averageLatency: 0,
    errorRate: 0,
    connectionUptime: 0,
  });

  useEffect(() => {
    const updateMetrics = () => {
      const health = realtimeConnectionManager.getHealth();
      const subscriptions = realtimeConnectionManager.getSubscriptions();

      setMetrics({
        subscriptionsCount: subscriptions.length,
        averageLatency: health.latency || 0,
        errorRate: 0, // Would be calculated based on error history
        connectionUptime: health.connectedAt
          ? Date.now() - health.connectedAt.getTime()
          : 0,
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return metrics;
}

// Cleanup hook for component unmount
export function useRealtimeCleanup() {
  const subscriptionsRef = useRef<Array<() => void>>([]);

  const addSubscription = useCallback((unsubscribe: () => void) => {
    subscriptionsRef.current.push(unsubscribe);
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup all subscriptions on unmount
      subscriptionsRef.current.forEach(unsubscribe => unsubscribe());
      subscriptionsRef.current = [];
    };
  }, []);

  return { addSubscription };
}