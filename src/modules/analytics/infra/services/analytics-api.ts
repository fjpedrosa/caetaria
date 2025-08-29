import { baseApi } from '../../../../store/api/base-api';
import { EventFilters, MetricFilters } from '../../application/ports/analytics-repository';
import { GenerateReportRequest } from '../../application/use-cases/generate-report';
import { GetMetricsRequest } from '../../application/use-cases/get-metrics';
import { TrackEventRequest } from '../../application/use-cases/track-event';

// API types for serialization
export interface EventApiModel {
  id: string;
  type: string;
  name: string;
  userId?: string;
  sessionId?: string;
  properties: Record<string, any>;
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
    url?: string;
    deviceType?: 'desktop' | 'mobile' | 'tablet';
    browser?: string;
    os?: string;
    country?: string;
    region?: string;
  };
  timestamp: string;
  processed: boolean;
}

export interface MetricApiModel {
  id: string;
  name: string;
  description: string;
  type: 'counter' | 'gauge' | 'histogram' | 'rate';
  value: {
    data: {
      raw: number;
      formatted: string;
      unit?: string;
      precision?: number;
    };
    dataType: 'number' | 'percentage' | 'duration' | 'bytes' | 'count' | 'rate';
  };
  dimensions: Record<string, string | number | boolean>;
  timestamp: string;
  tags: string[];
  source?: string;
  aggregation?: 'sum' | 'average' | 'min' | 'max' | 'count' | 'unique_count';
  timeWindow?: {
    start: string;
    end: string;
    granularity: 'minute' | 'hour' | 'day' | 'week' | 'month';
  };
}

export interface TrackEventApiRequest extends Omit<TrackEventRequest, 'type'> {
  type: string; // serialized EventType
}

export interface TrackEventApiResponse {
  event: EventApiModel;
  tracked: boolean;
}

export interface GetEventsApiRequest extends Omit<EventFilters, 'eventTypes'> {
  eventTypes?: string[]; // serialized EventType array
}

export interface GetEventsApiResponse {
  events: EventApiModel[];
  totalCount: number;
  hasMore: boolean;
}

export interface GetMetricsApiRequest extends GetMetricsRequest {}

export interface GetMetricsApiResponse {
  metrics: MetricApiModel[];
  totalCount: number;
  hasMore: boolean;
  aggregations?: Record<string, number>;
}

export interface GenerateReportApiRequest extends Omit<GenerateReportRequest, 'includeEvents'> {
  includeEvents?: string[]; // serialized EventType array
}

export interface GenerateReportApiResponse {
  reportId: string;
  reportType: GenerateReportRequest['reportType'];
  dateRange: {
    start: string;
    end: string;
  };
  generatedAt: string;
  sections: Array<{
    title: string;
    description: string;
    data: any;
    chartConfig?: {
      type: 'line' | 'bar' | 'pie' | 'area';
      dataKey: string;
      xAxisKey?: string;
      yAxisKey?: string;
    };
  }>;
  summary: {
    totalEvents: number;
    uniqueUsers: number;
    uniqueSessions: number;
    topEvents: Array<{ type: string; count: number }>;
    keyMetrics: Array<{ name: string; value: string; change?: string }>;
  };
  metadata: {
    executionTime: number;
    dataPoints: number;
    filters: any;
  };
}

export interface GetEventStatsApiResponse {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsByHour: Record<string, number>;
  uniqueUsers: number;
  uniqueSessions: number;
}

export interface GetMetricTrendApiRequest {
  name: string;
  granularity: 'minute' | 'hour' | 'day' | 'week' | 'month';
  startDate?: string;
  endDate?: string;
  dimensions?: Record<string, any>;
  tags?: string[];
}

export interface GetMetricTrendApiResponse {
  trend: MetricApiModel[];
  summary: {
    totalDataPoints: number;
    timeRange: {
      start: string;
      end: string;
    };
    trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    changePercentage: number;
  };
}

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Event tracking and retrieval
    trackEvent: builder.mutation<TrackEventApiResponse, TrackEventApiRequest>({
      query: (body) => ({
        url: '/analytics/events',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Event', id: 'LIST' }, { type: 'Analytics', id: 'STATS' }],
    }),

    trackEvents: builder.mutation<{ tracked: number }, { events: TrackEventApiRequest[] }>({
      query: (body) => ({
        url: '/analytics/events/batch',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Event', id: 'LIST' }, { type: 'Analytics', id: 'STATS' }],
    }),

    getEvents: builder.query<GetEventsApiResponse, GetEventsApiRequest>({
      query: (params) => ({
        url: '/analytics/events',
        method: 'GET',
        params: {
          ...params,
          startDate: params.startDate?.toISOString(),
          endDate: params.endDate?.toISOString(),
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.events.map(({ id }) => ({ type: 'Event' as const, id })),
              { type: 'Event', id: 'LIST' },
            ]
          : [{ type: 'Event', id: 'LIST' }],
    }),

    getEvent: builder.query<EventApiModel, string>({
      query: (id) => `/analytics/events/${id}`,
      providesTags: (result, error, id) => [{ type: 'Event', id }],
    }),

    deleteEvent: builder.mutation<void, string>({
      query: (id) => ({
        url: `/analytics/events/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Event', id },
        { type: 'Event', id: 'LIST' },
        { type: 'Analytics', id: 'STATS' },
      ],
    }),

    // Event statistics
    getEventStats: builder.query<GetEventStatsApiResponse, { startDate?: Date; endDate?: Date }>({
      query: (params) => ({
        url: '/analytics/events/stats',
        method: 'GET',
        params: {
          startDate: params.startDate?.toISOString(),
          endDate: params.endDate?.toISOString(),
        },
      }),
      providesTags: [{ type: 'Analytics', id: 'STATS' }],
    }),

    // Metrics tracking and retrieval
    saveMetric: builder.mutation<MetricApiModel, Omit<MetricApiModel, 'id' | 'timestamp'>>({
      query: (body) => ({
        url: '/analytics/metrics',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Metric', id: 'LIST' }],
    }),

    saveMetrics: builder.mutation<{ saved: number }, { metrics: Omit<MetricApiModel, 'id' | 'timestamp'>[] }>({
      query: (body) => ({
        url: '/analytics/metrics/batch',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Metric', id: 'LIST' }],
    }),

    getMetrics: builder.query<GetMetricsApiResponse, GetMetricsApiRequest>({
      query: (params) => ({
        url: '/analytics/metrics',
        method: 'GET',
        params: {
          ...params,
          startDate: params.startDate?.toISOString(),
          endDate: params.endDate?.toISOString(),
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.metrics.map(({ id }) => ({ type: 'Metric' as const, id })),
              { type: 'Metric', id: 'LIST' },
            ]
          : [{ type: 'Metric', id: 'LIST' }],
    }),

    getMetric: builder.query<MetricApiModel, string>({
      query: (id) => `/analytics/metrics/${id}`,
      providesTags: (result, error, id) => [{ type: 'Metric', id }],
    }),

    deleteMetric: builder.mutation<void, string>({
      query: (id) => ({
        url: `/analytics/metrics/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Metric', id },
        { type: 'Metric', id: 'LIST' },
      ],
    }),

    // Metric trends and aggregations
    getMetricTrend: builder.query<GetMetricTrendApiResponse, GetMetricTrendApiRequest>({
      query: (params) => ({
        url: '/analytics/metrics/trend',
        method: 'GET',
        params,
      }),
      providesTags: [{ type: 'Metric', id: 'TREND' }],
    }),

    aggregateMetrics: builder.query<
      MetricApiModel[],
      {
        names: string[];
        aggregationType: 'sum' | 'average' | 'min' | 'max' | 'count';
        filters: MetricFilters;
      }
    >({
      query: (params) => ({
        url: '/analytics/metrics/aggregate',
        method: 'GET',
        params: {
          ...params,
          filters: {
            ...params.filters,
            startDate: params.filters.startDate?.toISOString(),
            endDate: params.filters.endDate?.toISOString(),
          },
        },
      }),
      providesTags: [{ type: 'Metric', id: 'AGGREGATE' }],
    }),

    // Reporting
    generateReport: builder.mutation<GenerateReportApiResponse, GenerateReportApiRequest>({
      query: (body) => ({
        url: '/analytics/reports',
        method: 'POST',
        body: {
          ...body,
          startDate: body.startDate.toISOString(),
          endDate: body.endDate.toISOString(),
        },
      }),
      invalidatesTags: [{ type: 'Report', id: 'LIST' }],
    }),

    getReports: builder.query<{ reports: Array<{ id: string; type: string; createdAt: string }> }, void>({
      query: () => '/analytics/reports',
      providesTags: [{ type: 'Report', id: 'LIST' }],
    }),

    getReport: builder.query<GenerateReportApiResponse, string>({
      query: (id) => `/analytics/reports/${id}`,
      providesTags: (result, error, id) => [{ type: 'Report', id }],
    }),

    deleteReport: builder.mutation<void, string>({
      query: (id) => ({
        url: `/analytics/reports/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Report', id },
        { type: 'Report', id: 'LIST' },
      ],
    }),
  }),
});

// Export hooks for use in components
export const {
  // Events
  useTrackEventMutation,
  useTrackEventsMutation,
  useGetEventsQuery,
  useGetEventQuery,
  useDeleteEventMutation,
  useGetEventStatsQuery,
  
  // Metrics
  useSaveMetricMutation,
  useSaveMetricsMutation,
  useGetMetricsQuery,
  useGetMetricQuery,
  useDeleteMetricMutation,
  useGetMetricTrendQuery,
  useAggregateMetricsQuery,
  
  // Reporting
  useGenerateReportMutation,
  useGetReportsQuery,
  useGetReportQuery,
  useDeleteReportMutation,
} = analyticsApi;

// Export API for direct usage in use cases
export default analyticsApi;