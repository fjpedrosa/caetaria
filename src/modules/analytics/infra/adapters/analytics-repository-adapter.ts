import {
  AnalyticsRepository,
  EventFilters,
  MetricFilters,
  MetricsRepository,
  ReportingRepository} from '../../application/ports/analytics-repository';
import { Event, eventFromJSON, eventToJSON } from '../../domain/entities/event';
import { Metric, metricFromJSON, metricToJSON } from '../../domain/entities/metric';
import { EventType, EventTypeInterface } from '../../domain/value-objects/event-type';
import { MetricValue } from '../../domain/value-objects/metric-value';
import {
  analyticsApi,
  EventApiModel,
  GenerateReportApiResponse,
  MetricApiModel} from '../services/analytics-api';

// Functional mapper object for converting between domain entities and API models
export const analyticsModelMapper = {
  toDomainEvent: (apiModel: EventApiModel): Event => {
    return eventFromJSON({
      ...apiModel,
      type: apiModel.type,
    });
  },

  toApiEvent: (domainEntity: Event): EventApiModel => {
    const json = eventToJSON(domainEntity);
    return json as EventApiModel;
  },

  toDomainMetric: (apiModel: MetricApiModel): Metric => {
    return metricFromJSON({
      ...apiModel,
      value: apiModel.value,
    });
  },

  toApiMetric: (domainEntity: Metric): MetricApiModel => {
    const json = metricToJSON(domainEntity);
    return json as MetricApiModel;
  },

  serializeEventFilters: (filters: EventFilters): any => {
    return {
      ...filters,
      eventTypes: filters.eventTypes?.map(type => type.value),
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString(),
    };
  },

  serializeMetricFilters: (filters: MetricFilters): any => {
    return {
      ...filters,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString(),
    };
  }
};

export const createAnalyticsRepository = (dependencies: { store: any }): AnalyticsRepository => ({
  async saveEvent(event: Event): Promise<Event> {
    const apiEvent = analyticsModelMapper.toApiEvent(event);
    const result = await dependencies.store.dispatch(
      analyticsApi.endpoints.trackEvent.initiate({
        type: event.type.value,
        name: event.name,
        userId: event.userId,
        sessionId: event.sessionId,
        properties: event.properties,
        skipEnrichment: true, // Already enriched
      })
    );

    if (result.error) {
      throw new Error('Failed to save event');
    }

    return analyticsModelMapper.toDomainEvent(result.data.event);
  },

  async getEvents(filters: EventFilters): Promise<Event[]> {
    const serializedFilters = analyticsModelMapper.serializeEventFilters(filters);
    const result = await dependencies.store.dispatch(
      analyticsApi.endpoints.getEvents.initiate(serializedFilters)
    );

    if (result.error) {
      throw new Error('Failed to get events');
    }

    return result.data.events.map(analyticsModelMapper.toDomainEvent);
  },

  async getEventById(id: string): Promise<Event | null> {
    const result = await dependencies.store.dispatch(
      analyticsApi.endpoints.getEvent.initiate(id)
    );

    if (result.error) {
      return null;
    }

    return result.data ? analyticsModelMapper.toDomainEvent(result.data) : null;
  },

  async getEventCount(filters: Omit<EventFilters, 'limit' | 'offset'>): Promise<number> {
    const serializedFilters = analyticsModelMapper.serializeEventFilters(filters);
    const result = await dependencies.store.dispatch(
      analyticsApi.endpoints.getEvents.initiate({ ...serializedFilters, limit: 1 })
    );

    if (result.error) {
      throw new Error('Failed to get event count');
    }

    return result.data.totalCount;
  },

  async deleteEvent(id: string): Promise<void> {
    const result = await dependencies.store.dispatch(
      analyticsApi.endpoints.deleteEvent.initiate(id)
    );

    if (result.error) {
      throw new Error('Failed to delete event');
    }
  },

  async saveEvents(events: Event[]): Promise<Event[]> {
    const apiEvents = events.map(event => ({
      type: event.type.value,
      name: event.name,
      userId: event.userId,
      sessionId: event.sessionId,
      properties: event.properties,
      skipEnrichment: true,
    }));

    const result = await dependencies.store.dispatch(
      analyticsApi.endpoints.trackEvents.initiate({ events: apiEvents })
    );

    if (result.error) {
      throw new Error('Failed to save events');
    }

    // Since batch endpoint doesn't return full events, return the input events
    // In a real implementation, the API would return the saved events
    return events;
  },

  async deleteEvents(filters: EventFilters): Promise<number> {
    // This would require a batch delete endpoint in the API
    throw new Error('Batch delete events not implemented');
  },

  async getUniqueUsers(filters: Omit<EventFilters, 'userId'>): Promise<string[]> {
    const serializedFilters = analyticsModelMapper.serializeEventFilters(filters);
    const result = await dependencies.store.dispatch(
      analyticsApi.endpoints.getEvents.initiate(serializedFilters)
    );

    if (result.error) {
      throw new Error('Failed to get events for unique users');
    }

    const events = result.data.events.map(analyticsModelMapper.toDomainEvent);
    const userIds = new Set<string>();

    events.forEach(event => {
      if (event.userId) {
        userIds.add(event.userId);
      }
    });

    return Array.from(userIds);
  },

  async getUniqueSessions(filters: EventFilters): Promise<string[]> {
    const serializedFilters = analyticsModelMapper.serializeEventFilters(filters);
    const result = await dependencies.store.dispatch(
      analyticsApi.endpoints.getEvents.initiate(serializedFilters)
    );

    if (result.error) {
      throw new Error('Failed to get events for unique sessions');
    }

    const events = result.data.events.map(analyticsModelMapper.toDomainEvent);
    const sessionIds = new Set<string>();

    events.forEach(event => {
      if (event.sessionId) {
        sessionIds.add(event.sessionId);
      }
    });

    return Array.from(sessionIds);
  },

  async getEventsByType(filters: EventFilters): Promise<Record<string, Event[]>> {
    const serializedFilters = analyticsModelMapper.serializeEventFilters(filters);
    const result = await dependencies.store.dispatch(
      analyticsApi.endpoints.getEvents.initiate(serializedFilters)
    );

    if (result.error) {
      throw new Error('Failed to get events by type');
    }

    const events = result.data.events.map(analyticsModelMapper.toDomainEvent);
    const eventsByType: Record<string, Event[]> = {};

    events.forEach(event => {
      const type = event.type.value;
      if (!eventsByType[type]) {
        eventsByType[type] = [];
      }
      eventsByType[type].push(event);
    });

    return eventsByType;
  }
});

export const createMetricsRepository = (dependencies: { store: any }): MetricsRepository => ({
  async saveMetric(metric: Metric): Promise<Metric> {
    const apiMetric = analyticsModelMapper.toApiMetric(metric);
    const { id, timestamp, ...metricData } = apiMetric;

    const result = await dependencies.store.dispatch(
      analyticsApi.endpoints.saveMetric.initiate(metricData)
    );

    if (result.error) {
      throw new Error('Failed to save metric');
    }

    return analyticsModelMapper.toDomainMetric(result.data);
  },

  async getMetrics(filters: MetricFilters): Promise<Metric[]> {
    const serializedFilters = analyticsModelMapper.serializeMetricFilters(filters);
    const result = await dependencies.store.dispatch(
      analyticsApi.endpoints.getMetrics.initiate(serializedFilters)
    );

    if (result.error) {
      throw new Error('Failed to get metrics');
    }

    return result.data.metrics.map(analyticsModelMapper.toDomainMetric);
  },

  async getMetricById(id: string): Promise<Metric | null> {
    const result = await dependencies.store.dispatch(
      analyticsApi.endpoints.getMetric.initiate(id)
    );

    if (result.error) {
      return null;
    }

    return result.data ? analyticsModelMapper.toDomainMetric(result.data) : null;
  },

  async deleteMetric(id: string): Promise<void> {
    const result = await dependencies.store.dispatch(
      analyticsApi.endpoints.deleteMetric.initiate(id)
    );

    if (result.error) {
      throw new Error('Failed to delete metric');
    }
  },

  async saveMetrics(metrics: Metric[]): Promise<Metric[]> {
    const apiMetrics = metrics.map(metric => {
      const apiMetric = analyticsModelMapper.toApiMetric(metric);
      const { id, timestamp, ...metricData } = apiMetric;
      return metricData;
    });

    const result = await dependencies.store.dispatch(
      analyticsApi.endpoints.saveMetrics.initiate({ metrics: apiMetrics })
    );

    if (result.error) {
      throw new Error('Failed to save metrics');
    }

    // Return the input metrics since batch endpoint doesn't return full metrics
    return metrics;
  },

  async deleteMetrics(filters: MetricFilters): Promise<number> {
    // This would require a batch delete endpoint in the API
    throw new Error('Batch delete metrics not implemented');
  },

  async aggregateMetrics(
    names: string[],
    aggregationType: 'sum' | 'average' | 'min' | 'max' | 'count',
    filters: MetricFilters
  ): Promise<Metric[]> {
    const result = await dependencies.store.dispatch(
      analyticsApi.endpoints.aggregateMetrics.initiate({
        names,
        aggregationType,
        filters: analyticsModelMapper.serializeMetricFilters(filters),
      })
    );

    if (result.error) {
      throw new Error('Failed to aggregate metrics');
    }

    return result.data.map(analyticsModelMapper.toDomainMetric);
  },

  async getMetricTrend(
    name: string,
    granularity: 'minute' | 'hour' | 'day' | 'week' | 'month',
    filters: MetricFilters
  ): Promise<Metric[]> {
    const result = await dependencies.store.dispatch(
      analyticsApi.endpoints.getMetricTrend.initiate({
        name,
        granularity,
        startDate: filters.startDate?.toISOString(),
        endDate: filters.endDate?.toISOString(),
        dimensions: filters.dimensions,
        tags: filters.tags,
      })
    );

    if (result.error) {
      throw new Error('Failed to get metric trend');
    }

    return result.data.trend.map(analyticsModelMapper.toDomainMetric);
  }
});

export const createReportingRepository = (dependencies: { store: any }): ReportingRepository => ({
  async generateReport(
    reportType: 'daily' | 'weekly' | 'monthly',
    filters: {
      startDate: Date;
      endDate: Date;
      includeMetrics?: string[];
      includeEvents?: (EventType | EventTypeInterface)[];
    }
  ): Promise<{
    events: Event[];
    metrics: Metric[];
    summary: Record<string, any>;
  }> {
    const result = await dependencies.store.dispatch(
      analyticsApi.endpoints.generateReport.initiate({
        reportType,
        startDate: filters.startDate,
        endDate: filters.endDate,
        includeMetrics: filters.includeMetrics,
        includeEvents: filters.includeEvents?.map(type => type.value),
        includeSummary: true,
        includeCharts: false,
      })
    );

    if (result.error) {
      throw new Error('Failed to generate report');
    }

    // Extract events and metrics from report sections
    // This is a simplified extraction - in practice, you'd parse the report structure
    const events: Event[] = [];
    const metrics: Metric[] = [];

    return {
      events,
      metrics,
      summary: result.data.summary,
    };
  }
});