/**
 * Analytics API Slice
 *
 * RTK Query API slice for analytics event tracking and metrics collection.
 * Provides comprehensive analytics capabilities with real-time updates,
 * caching strategies, and performance optimizations.
 *
 * Features:
 * - Event tracking with metadata
 * - Real-time analytics dashboard data
 * - Performance metrics collection
 * - User behavior analytics
 * - Conversion funnel tracking
 * - Custom event definitions
 * - Batch event processing
 */

import { createApi } from '@reduxjs/toolkit/query/react';

import type {
  AnalyticsEvent,
  AnalyticsEventInsert,
  Json,
} from '@/lib/supabase/types';

import { supabaseBaseQuery, type SupabaseQueryResult } from './supabase-base-query';

// Analytics event types
export interface TrackEventPayload {
  eventName: string;
  eventData?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  pageUrl?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface EventsListParams {
  page?: number;
  limit?: number;
  eventName?: string;
  userId?: string;
  sessionId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'created_at' | 'event_name';
  sortOrder?: 'asc' | 'desc';
}

export interface EventsListResponse {
  data: AnalyticsEvent[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Metrics and analytics responses
export interface DashboardMetrics {
  totalEvents: number;
  uniqueUsers: number;
  uniqueSessions: number;
  popularEvents: Array<{
    eventName: string;
    count: number;
    percentage: number;
  }>;
  hourlyActivity: Array<{
    hour: number;
    count: number;
  }>;
  dailyActivity: Array<{
    date: string;
    count: number;
  }>;
  topPages: Array<{
    pageUrl: string;
    count: number;
    percentage: number;
  }>;
  averageSessionDuration: number;
  bounceRate: number;
}

export interface ConversionFunnelStep {
  stepName: string;
  eventName: string;
  count: number;
  percentage: number;
  dropoffRate: number;
}

export interface ConversionFunnelData {
  steps: ConversionFunnelStep[];
  totalStarted: number;
  totalCompleted: number;
  overallConversionRate: number;
}

export interface UserJourneyEvent {
  id: string;
  eventName: string;
  eventData: Json | null;
  pageUrl: string | null;
  createdAt: string;
  timeSinceStart: number; // milliseconds
}

export interface UserJourneyResponse {
  userId: string;
  sessionId: string;
  events: UserJourneyEvent[];
  sessionDuration: number;
  totalEvents: number;
  startTime: string;
  endTime: string;
}

// Batch operations
export interface BatchTrackEventsPayload {
  events: TrackEventPayload[];
  batchId?: string;
}

/**
 * Analytics API Slice
 */
export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  baseQuery: supabaseBaseQuery,
  tagTypes: ['AnalyticsEvent', 'AnalyticsMetrics', 'ConversionFunnel', 'UserJourney'],
  keepUnusedDataFor: 300, // 5 minutes default
  refetchOnReconnect: true,

  endpoints: (builder) => ({
    /**
     * Track a single analytics event
     */
    trackEvent: builder.mutation<AnalyticsEvent, TrackEventPayload>({
      query: (eventData) => ({
        table: 'analytics_events',
        method: 'insert',
        body: {
          event_name: eventData.eventName,
          event_data: eventData.eventData as Json || null,
          user_id: eventData.userId || null,
          session_id: eventData.sessionId || null,
          page_url: eventData.pageUrl || null,
          user_agent: eventData.userAgent || null,
          ip_address: eventData.ipAddress || null,
          created_at: new Date().toISOString(),
        } as AnalyticsEventInsert,
      }),
      transformResponse: (response: SupabaseQueryResult<AnalyticsEvent[]>) =>
        response.data?.[0] as AnalyticsEvent,
      invalidatesTags: [
        { type: 'AnalyticsMetrics', id: 'DASHBOARD' },
        { type: 'ConversionFunnel', id: 'LIST' },
      ],
      // Don't show loading states for tracking (fire-and-forget)
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          // Silently handle tracking errors to not disrupt user experience
          console.warn('Analytics tracking failed:', error);
        }
      },
    }),

    /**
     * Batch track multiple events for better performance
     */
    batchTrackEvents: builder.mutation<AnalyticsEvent[], BatchTrackEventsPayload>({
      query: ({ events, batchId }) => {
        const now = new Date().toISOString();
        const formattedEvents: AnalyticsEventInsert[] = events.map((event, index) => ({
          event_name: event.eventName,
          event_data: {
            ...(event.eventData || {}),
            batchId,
            batchIndex: index,
          } as Json,
          user_id: event.userId || null,
          session_id: event.sessionId || null,
          page_url: event.pageUrl || null,
          user_agent: event.userAgent || null,
          ip_address: event.ipAddress || null,
          created_at: now,
        }));

        return {
          table: 'analytics_events',
          method: 'insert',
          body: formattedEvents,
        };
      },
      transformResponse: (response: SupabaseQueryResult<AnalyticsEvent[]>) =>
        response.data || [],
      invalidatesTags: [
        { type: 'AnalyticsMetrics', id: 'DASHBOARD' },
        { type: 'ConversionFunnel', id: 'LIST' },
      ],
    }),

    /**
     * Get paginated analytics events
     */
    getEvents: builder.query<EventsListResponse, EventsListParams>({
      query: (params = {}) => {
        const {
          page = 1,
          limit = 50,
          eventName,
          userId,
          sessionId,
          dateFrom,
          dateTo,
          sortBy = 'created_at',
          sortOrder = 'desc',
        } = params;

        return {
          table: 'analytics_events',
          method: 'select',
          query: (queryBuilder: any) => {
            let query = queryBuilder.select('*', { count: 'exact' });

            // Apply filters
            if (eventName) {
              query = query.eq('event_name', eventName);
            }
            if (userId) {
              query = query.eq('user_id', userId);
            }
            if (sessionId) {
              query = query.eq('session_id', sessionId);
            }
            if (dateFrom) {
              query = query.gte('created_at', dateFrom);
            }
            if (dateTo) {
              query = query.lte('created_at', dateTo);
            }

            // Apply sorting
            query = query.order(sortBy, { ascending: sortOrder === 'asc' });

            // Apply pagination
            const offset = (page - 1) * limit;
            return query.range(offset, offset + limit - 1);
          },
          options: { count: 'exact' },
        };
      },
      transformResponse: (response: SupabaseQueryResult<AnalyticsEvent[]>, meta, arg) => {
        const { page = 1, limit = 50 } = arg;
        const totalPages = Math.ceil((response.count || 0) / limit);

        return {
          data: response.data || [],
          count: response.count || 0,
          page,
          limit,
          totalPages,
        };
      },
      providesTags: (result) => {
        const tags: any[] = [{ type: 'AnalyticsEvent', id: 'LIST' }];

        if (result?.data) {
          tags.push(
            ...result.data.map(({ id }) => ({ type: 'AnalyticsEvent' as const, id }))
          );
        }

        return tags;
      },
      keepUnusedDataFor: 120, // 2 minutes
    }),

    /**
     * Get comprehensive dashboard metrics
     */
    getDashboardMetrics: builder.query<DashboardMetrics, { days?: number }>({
      query: ({ days = 7 } = {}) => {
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - days);

        return {
          table: 'analytics_events',
          method: 'select',
          query: (queryBuilder: any) =>
            queryBuilder
              .select('*')
              .gte('created_at', dateFrom.toISOString())
              .order('created_at', { ascending: true }),
        };
      },
      transformResponse: (response: SupabaseQueryResult<AnalyticsEvent[]>, meta, { days = 7 }) => {
        const events = response.data || [];
        const totalEvents = events.length;

        // Unique users and sessions
        const uniqueUsers = new Set(events.filter(e => e.user_id).map(e => e.user_id)).size;
        const uniqueSessions = new Set(events.filter(e => e.session_id).map(e => e.session_id)).size;

        // Popular events
        const eventCounts = events.reduce((acc, event) => {
          acc[event.event_name] = (acc[event.event_name] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const popularEvents = Object.entries(eventCounts)
          .map(([eventName, count]) => ({
            eventName,
            count,
            percentage: Math.round((count / totalEvents) * 100 * 100) / 100,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        // Hourly activity
        const hourlyActivity = Array.from({ length: 24 }, (_, hour) => ({
          hour,
          count: events.filter(event =>
            new Date(event.created_at).getHours() === hour
          ).length,
        }));

        // Daily activity
        const dailyActivity = Array.from({ length: days }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (days - 1 - i));
          const dateString = date.toISOString().split('T')[0];

          return {
            date: dateString,
            count: events.filter(event =>
              event.created_at.split('T')[0] === dateString
            ).length,
          };
        });

        // Top pages
        const pageViews = events
          .filter(event => event.page_url)
          .reduce((acc, event) => {
            const pageUrl = event.page_url!;
            acc[pageUrl] = (acc[pageUrl] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

        const topPages = Object.entries(pageViews)
          .map(([pageUrl, count]) => ({
            pageUrl,
            count,
            percentage: Math.round((count / Object.values(pageViews).reduce((a, b) => a + b, 0)) * 100 * 100) / 100,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        // Session analysis (simplified)
        const sessions = events
          .filter(event => event.session_id)
          .reduce((acc, event) => {
            const sessionId = event.session_id!;
            if (!acc[sessionId]) {
              acc[sessionId] = [];
            }
            acc[sessionId].push(event);
            return acc;
          }, {} as Record<string, AnalyticsEvent[]>);

        const sessionDurations = Object.values(sessions).map(sessionEvents => {
          if (sessionEvents.length < 2) return 0;
          const start = new Date(sessionEvents[0].created_at).getTime();
          const end = new Date(sessionEvents[sessionEvents.length - 1].created_at).getTime();
          return end - start;
        });

        const averageSessionDuration = sessionDurations.length > 0
          ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length
          : 0;

        // Bounce rate (sessions with only 1 event)
        const singleEventSessions = Object.values(sessions).filter(
          sessionEvents => sessionEvents.length === 1
        ).length;
        const bounceRate = uniqueSessions > 0
          ? (singleEventSessions / uniqueSessions) * 100
          : 0;

        return {
          totalEvents,
          uniqueUsers,
          uniqueSessions,
          popularEvents,
          hourlyActivity,
          dailyActivity,
          topPages,
          averageSessionDuration,
          bounceRate: Math.round(bounceRate * 100) / 100,
        };
      },
      providesTags: [{ type: 'AnalyticsMetrics', id: 'DASHBOARD' }],
      keepUnusedDataFor: 600, // 10 minutes - dashboard data doesn't change frequently
    }),

    /**
     * Get conversion funnel data
     */
    getConversionFunnel: builder.query<ConversionFunnelData, {
      steps: Array<{ stepName: string; eventName: string }>;
      days?: number;
    }>({
      query: ({ steps, days = 30 }) => {
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - days);

        const eventNames = steps.map(step => step.eventName);

        return {
          table: 'analytics_events',
          method: 'select',
          query: (queryBuilder: any) =>
            queryBuilder
              .select('event_name, user_id, session_id, created_at')
              .in('event_name', eventNames)
              .gte('created_at', dateFrom.toISOString())
              .order('created_at', { ascending: true }),
        };
      },
      transformResponse: (response: SupabaseQueryResult<Array<{
        event_name: string;
        user_id: string | null;
        session_id: string | null;
        created_at: string;
      }>>, meta, { steps }) => {
        const events = response.data || [];

        // Group events by user or session (prefer user_id if available)
        const userJourneys = events.reduce((acc, event) => {
          const key = event.user_id || event.session_id || 'anonymous';
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(event);
          return acc;
        }, {} as Record<string, typeof events>);

        // Calculate funnel metrics
        const funnelSteps: ConversionFunnelStep[] = [];
        let previousCount = 0;

        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          let count = 0;

          // Count unique users/sessions that reached this step
          for (const journey of Object.values(userJourneys)) {
            // Check if user completed all previous steps and this step
            let completedAllPreviousSteps = true;

            for (let j = 0; j <= i; j++) {
              const requiredEvent = steps[j].eventName;
              const hasEvent = journey.some(event => event.event_name === requiredEvent);

              if (!hasEvent) {
                completedAllPreviousSteps = false;
                break;
              }
            }

            if (completedAllPreviousSteps) {
              count++;
            }
          }

          const percentage = i === 0
            ? 100
            : previousCount > 0
              ? Math.round((count / Object.keys(userJourneys).length) * 100 * 100) / 100
              : 0;

          const dropoffRate = i === 0
            ? 0
            : previousCount > 0
              ? Math.round(((previousCount - count) / previousCount) * 100 * 100) / 100
              : 100;

          funnelSteps.push({
            stepName: step.stepName,
            eventName: step.eventName,
            count,
            percentage,
            dropoffRate,
          });

          previousCount = count;
        }

        const totalStarted = funnelSteps[0]?.count || 0;
        const totalCompleted = funnelSteps[funnelSteps.length - 1]?.count || 0;
        const overallConversionRate = totalStarted > 0
          ? Math.round((totalCompleted / totalStarted) * 100 * 100) / 100
          : 0;

        return {
          steps: funnelSteps,
          totalStarted,
          totalCompleted,
          overallConversionRate,
        };
      },
      providesTags: [{ type: 'ConversionFunnel', id: 'LIST' }],
      keepUnusedDataFor: 300, // 5 minutes
    }),

    /**
     * Get user journey for specific user/session
     */
    getUserJourney: builder.query<UserJourneyResponse, {
      userId?: string;
      sessionId?: string;
      days?: number;
    }>({
      query: ({ userId, sessionId, days = 7 }) => {
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - days);

        return {
          table: 'analytics_events',
          method: 'select',
          query: (queryBuilder: any) => {
            let query = queryBuilder
              .select('id, event_name, event_data, page_url, created_at')
              .gte('created_at', dateFrom.toISOString())
              .order('created_at', { ascending: true });

            if (userId) {
              query = query.eq('user_id', userId);
            } else if (sessionId) {
              query = query.eq('session_id', sessionId);
            }

            return query;
          },
        };
      },
      transformResponse: (response: SupabaseQueryResult<Array<{
        id: string;
        event_name: string;
        event_data: Json | null;
        page_url: string | null;
        created_at: string;
      }>>, meta, { userId, sessionId }) => {
        const events = response.data || [];

        if (events.length === 0) {
          return {
            userId: userId || '',
            sessionId: sessionId || '',
            events: [],
            sessionDuration: 0,
            totalEvents: 0,
            startTime: '',
            endTime: '',
          };
        }

        const startTime = events[0].created_at;
        const endTime = events[events.length - 1].created_at;
        const sessionDuration = new Date(endTime).getTime() - new Date(startTime).getTime();
        const startTimestamp = new Date(startTime).getTime();

        const userJourneyEvents: UserJourneyEvent[] = events.map(event => ({
          id: event.id,
          eventName: event.event_name,
          eventData: event.event_data,
          pageUrl: event.page_url,
          createdAt: event.created_at,
          timeSinceStart: new Date(event.created_at).getTime() - startTimestamp,
        }));

        return {
          userId: userId || '',
          sessionId: sessionId || '',
          events: userJourneyEvents,
          sessionDuration,
          totalEvents: events.length,
          startTime,
          endTime,
        };
      },
      providesTags: (result, error, { userId, sessionId }) => [
        { type: 'UserJourney', id: userId || sessionId || 'ANONYMOUS' },
      ],
      keepUnusedDataFor: 300, // 5 minutes
    }),

    /**
     * Get unique event names for filtering
     */
    getEventNames: builder.query<string[], { days?: number }>({
      query: ({ days = 30 } = {}) => {
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - days);

        return {
          table: 'analytics_events',
          method: 'select',
          query: (queryBuilder: any) =>
            queryBuilder
              .select('event_name')
              .gte('created_at', dateFrom.toISOString()),
        };
      },
      transformResponse: (response: SupabaseQueryResult<Array<{ event_name: string }>>) => {
        const events = response.data || [];
        const uniqueNames = [...new Set(events.map(e => e.event_name))];
        return uniqueNames.sort();
      },
      providesTags: [{ type: 'AnalyticsEvent', id: 'NAMES' }],
      keepUnusedDataFor: 900, // 15 minutes - event names don't change frequently
    }),
  }),
});

// Export hooks for use in components
export const {
  useTrackEventMutation,
  useBatchTrackEventsMutation,
  useGetEventsQuery,
  useGetDashboardMetricsQuery,
  useGetConversionFunnelQuery,
  useGetUserJourneyQuery,
  useGetEventNamesQuery,
  useLazyGetEventsQuery,
  useLazyGetUserJourneyQuery,
} = analyticsApi;

// Export utilities
export const {
  util: {
    updateQueryData: updateAnalyticsQueryData,
    invalidateTags: invalidateAnalyticsTags,
    prefetch: prefetchAnalytics,
  },
} = analyticsApi;