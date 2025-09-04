/**
 * RTK Query Real-time Integration
 *
 * Integrates Supabase real-time subscriptions with RTK Query
 * for automatic cache invalidation and optimistic updates.
 *
 * Features:
 * - Automatic cache invalidation on real-time updates
 * - Optimistic updates for better UX
 * - Smart cache management
 * - Performance optimization
 */

import { createApi } from '@reduxjs/toolkit/query/react';

import {
  realtimeConnectionManager,
  type RealtimeSubscriptionPayload
} from '@/lib/supabase/realtime';
import type { AnalyticsEvent, BotConfiguration, Lead, WhatsAppIntegration } from '@/lib/supabase/types';

import { leadsApi } from './leads-api';
import { supabaseBaseQuery } from './supabase-base-query';

// Enhanced RTK Query API with real-time capabilities
export const realtimeApi = createApi({
  reducerPath: 'realtimeApi',
  baseQuery: supabaseBaseQuery,
  tagTypes: [
    'Lead', 'LeadsList', 'LeadStats',
    'Analytics', 'AnalyticsEvent',
    'BotConfiguration', 'BotConfigList',
    'WhatsAppIntegration', 'IntegrationList',
    'RealTimeHealth'
  ],
  keepUnusedDataFor: 300, // 5 minutes
  refetchOnReconnect: true,
  refetchOnFocus: false, // Disabled since we have real-time updates

  endpoints: (builder) => ({
    /**
     * Real-time health monitoring endpoint
     */
    getRealtimeHealth: builder.query<{
      isConnected: boolean;
      subscriptionsCount: number;
      latency: number;
      uptime: number;
    }, void>({
      queryFn: async () => {
        const health = realtimeConnectionManager.getHealth();
        return {
          data: {
            isConnected: health.state === 'connected',
            subscriptionsCount: health.subscriptionsCount,
            latency: health.latency || 0,
            uptime: health.connectedAt
              ? Date.now() - health.connectedAt.getTime()
              : 0,
          }
        };
      },
      providesTags: ['RealTimeHealth'],
      // Refresh every 10 seconds
      keepUnusedDataFor: 10,
    }),

    /**
     * Live analytics events stream
     */
    getAnalyticsEvents: builder.query<AnalyticsEvent[], { limit?: number; since?: string }>({
      query: ({ limit = 50, since }) => ({
        table: 'analytics_events',
        method: 'select',
        query: (queryBuilder: any) => {
          let query = queryBuilder
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

          if (since) {
            query = query.gte('created_at', since);
          }

          return query;
        },
      }),
      transformResponse: (response: any) => response.data || [],
      providesTags: (result) => [
        { type: 'Analytics', id: 'LIST' },
        ...(result || []).map(({ id }) => ({ type: 'AnalyticsEvent' as const, id }))
      ],
    }),

    /**
     * Live bot configurations
     */
    getBotConfigurations: builder.query<BotConfiguration[], { userId?: string }>({
      query: ({ userId }) => ({
        table: 'bot_configurations',
        method: 'select',
        query: (queryBuilder: any) => {
          let query = queryBuilder
            .select('*')
            .order('updated_at', { ascending: false });

          if (userId) {
            query = query.eq('user_id', userId);
          }

          return query;
        },
      }),
      transformResponse: (response: any) => response.data || [],
      providesTags: (result, error, { userId }) => [
        { type: 'BotConfigList', id: userId || 'ALL' },
        ...(result || []).map(({ id }) => ({ type: 'BotConfiguration' as const, id }))
      ],
    }),

    /**
     * Live WhatsApp integrations
     */
    getWhatsAppIntegrations: builder.query<WhatsAppIntegration[], { userId?: string }>({
      query: ({ userId }) => ({
        table: 'whatsapp_integrations',
        method: 'select',
        query: (queryBuilder: any) => {
          let query = queryBuilder
            .select('*')
            .order('updated_at', { ascending: false });

          if (userId) {
            query = query.eq('user_id', userId);
          }

          return query;
        },
      }),
      transformResponse: (response: any) => response.data || [],
      providesTags: (result, error, { userId }) => [
        { type: 'IntegrationList', id: userId || 'ALL' },
        ...(result || []).map(({ id }) => ({ type: 'WhatsAppIntegration' as const, id }))
      ],
    }),
  }),
});

// Export hooks
export const {
  useGetRealtimeHealthQuery,
  useGetAnalyticsEventsQuery,
  useGetBotConfigurationsQuery,
  useGetWhatsAppIntegrationsQuery,
  useLazyGetAnalyticsEventsQuery,
} = realtimeApi;

// Real-time integration utilities - Functional implementation
const createRTKQueryRealtimeIntegration = () => {
  const subscriptions = new Map<string, () => void>();

  /**
   * Initialize real-time integration with RTK Query
   */
  const initialize = (dispatch: any) => {
    console.log('= Initializing RTK Query real-time integration...');

    // Set up real-time subscriptions for automatic cache management
    setupLeadsSubscription(dispatch);
    setupAnalyticsSubscription(dispatch);
    setupBotConfigSubscription(dispatch);
    setupWhatsAppIntegrationSubscription(dispatch);

    console.log(' RTK Query real-time integration initialized');
  };

  /**
   * Set up leads real-time subscription
   */
  const setupLeadsSubscription = (dispatch: any) => {
    const unsubscribe = realtimeConnectionManager.subscribe({
      id: 'rtk-leads-integration',
      table: 'leads',
      event: '*',
      callback: (payload: RealtimeSubscriptionPayload<Lead>) => {
        console.log('= RTK Query: Lead real-time update', payload.eventType);

        // Invalidate leads-related cache
        dispatch(leadsApi.util.invalidateTags(['Lead', 'LeadsList', 'LeadStats']));

        // Optimistic updates for better UX
        handleLeadOptimisticUpdate(dispatch, payload);
      },
      errorCallback: (error: Error) => {
        console.error('L RTK Query: Leads subscription error', error);
      }
    });

    subscriptions.set('leads', unsubscribe);
  };

  /**
   * Set up analytics real-time subscription
   */
  const setupAnalyticsSubscription = (dispatch: any) => {
    const unsubscribe = realtimeConnectionManager.subscribe({
      id: 'rtk-analytics-integration',
      table: 'analytics_events',
      event: 'INSERT', // Only listen for new events
      callback: (payload: RealtimeSubscriptionPayload<AnalyticsEvent>) => {
        console.log('=� RTK Query: Analytics real-time update', payload.eventType);

        // Invalidate analytics cache
        dispatch(realtimeApi.util.invalidateTags(['Analytics', 'AnalyticsEvent']));

        // Add new event to existing cache if possible
        if (payload.new) {
          handleAnalyticsOptimisticUpdate(dispatch, payload.new);
        }
      },
      errorCallback: (error: Error) => {
        console.error('L RTK Query: Analytics subscription error', error);
      }
    });

    subscriptions.set('analytics', unsubscribe);
  };

  /**
   * Set up bot configuration real-time subscription
   */
  const setupBotConfigSubscription = (dispatch: any) => {
    const unsubscribe = realtimeConnectionManager.subscribe({
      id: 'rtk-bot-config-integration',
      table: 'bot_configurations',
      event: '*',
      callback: (payload: RealtimeSubscriptionPayload<BotConfiguration>) => {
        console.log('> RTK Query: Bot config real-time update', payload.eventType);

        // Invalidate bot configuration cache
        dispatch(realtimeApi.util.invalidateTags(['BotConfiguration', 'BotConfigList']));

        // Optimistic updates
        handleBotConfigOptimisticUpdate(dispatch, payload);
      },
      errorCallback: (error: Error) => {
        console.error('L RTK Query: Bot config subscription error', error);
      }
    });

    subscriptions.set('bot-config', unsubscribe);
  };

  /**
   * Set up WhatsApp integration real-time subscription
   */
  const setupWhatsAppIntegrationSubscription = (dispatch: any) => {
    const unsubscribe = realtimeConnectionManager.subscribe({
      id: 'rtk-whatsapp-integration',
      table: 'whatsapp_integrations',
      event: '*',
      callback: (payload: RealtimeSubscriptionPayload<WhatsAppIntegration>) => {
        console.log('=� RTK Query: WhatsApp integration real-time update', payload.eventType);

        // Invalidate WhatsApp integration cache
        dispatch(realtimeApi.util.invalidateTags(['WhatsAppIntegration', 'IntegrationList']));

        // Optimistic updates
        handleWhatsAppIntegrationOptimisticUpdate(dispatch, payload);
      },
      errorCallback: (error: Error) => {
        console.error('L RTK Query: WhatsApp integration subscription error', error);
      }
    });

    subscriptions.set('whatsapp-integration', unsubscribe);
  };

  /**
   * Handle lead optimistic updates
   */
  const handleLeadOptimisticUpdate = (dispatch: any, payload: RealtimeSubscriptionPayload<Lead>) => {
    if (payload.eventType === 'UPDATE' && payload.new) {
      // Try to update specific lead cache
      dispatch(leadsApi.util.updateQueryData('getLead', payload.new.id, (draft) => {
        Object.assign(draft, payload.new);
      }));

      // Try to update leads list cache
      dispatch(leadsApi.util.updateQueryData('getLeads', {}, (draft) => {
        const index = draft.data.findIndex(lead => lead.id === payload.new!.id);
        if (index !== -1) {
          Object.assign(draft.data[index], payload.new);
        }
      }));
    }
  };

  /**
   * Handle analytics optimistic updates
   */
  const handleAnalyticsOptimisticUpdate = (dispatch: any, newEvent: AnalyticsEvent) => {
    // Try to add to existing analytics cache
    dispatch(realtimeApi.util.updateQueryData('getAnalyticsEvents', { limit: 50 }, (draft) => {
      // Add new event at the beginning
      draft.unshift(newEvent);
      // Keep only the latest events
      if (draft.length > 50) {
        draft.splice(50);
      }
    }));
  };

  /**
   * Handle bot configuration optimistic updates
   */
  const handleBotConfigOptimisticUpdate = (dispatch: any, payload: RealtimeSubscriptionPayload<BotConfiguration>) => {
    if (payload.new) {
      const userId = payload.new.user_id;

      // Update user-specific cache
      dispatch(realtimeApi.util.updateQueryData('getBotConfigurations', { userId }, (draft) => {
        const index = draft.findIndex(config => config.id === payload.new!.id);

        switch (payload.eventType) {
          case 'INSERT':
            if (index === -1) {
              draft.unshift(payload.new!);
            }
            break;
          case 'UPDATE':
            if (index !== -1) {
              Object.assign(draft[index], payload.new);
            }
            break;
          case 'DELETE':
            if (index !== -1) {
              draft.splice(index, 1);
            }
            break;
        }
      }));
    }
  };

  /**
   * Handle WhatsApp integration optimistic updates
   */
  const handleWhatsAppIntegrationOptimisticUpdate = (dispatch: any, payload: RealtimeSubscriptionPayload<WhatsAppIntegration>) => {
    if (payload.new) {
      const userId = payload.new.user_id;

      // Update user-specific cache
      dispatch(realtimeApi.util.updateQueryData('getWhatsAppIntegrations', { userId }, (draft) => {
        const index = draft.findIndex(integration => integration.id === payload.new!.id);

        switch (payload.eventType) {
          case 'INSERT':
            if (index === -1) {
              draft.unshift(payload.new!);
            }
            break;
          case 'UPDATE':
            if (index !== -1) {
              Object.assign(draft[index], payload.new);
            }
            break;
          case 'DELETE':
            if (index !== -1) {
              draft.splice(index, 1);
            }
            break;
        }
      }));
    }
  };

  /**
   * Clean up all subscriptions
   */
  const destroy = () => {
    console.log('>� Cleaning up RTK Query real-time integration...');

    subscriptions.forEach((unsubscribe, key) => {
      console.log(`=� Unsubscribing from ${key}`);
      unsubscribe();
    });

    subscriptions.clear();
    console.log(' RTK Query real-time integration cleanup complete');
  };

  // Return public API
  return {
    initialize,
    destroy
  };
};

// Create singleton instance
export const rtkQueryRealtimeIntegration = createRTKQueryRealtimeIntegration();

// Export utilities
export { realtimeApi as default };