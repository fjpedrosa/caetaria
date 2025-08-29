import { 
  AnalyticsRepository, 
  EventFilters,
  MetricFilters, 
  MetricsRepository, 
  ReportingRepository} from '../../application/ports/analytics-repository';
import { EventEntity } from '../../domain/entities/event';
import { MetricEntity } from '../../domain/entities/metric';
import { EventType } from '../../domain/value-objects/event-type';
import { MetricValue } from '../../domain/value-objects/metric-value';
import { 
  analyticsApi, 
  EventApiModel, 
  GenerateReportApiResponse, 
  MetricApiModel} from '../services/analytics-api';

// Mappers for converting between domain entities and API models
export class AnalyticsModelMapper {
  static toDomainEvent(apiModel: EventApiModel): EventEntity {
    return EventEntity.fromJSON({
      ...apiModel,
      type: apiModel.type,
    });
  }

  static toApiEvent(domainEntity: EventEntity): EventApiModel {
    const json = domainEntity.toJSON();
    return json as EventApiModel;
  }

  static toDomainMetric(apiModel: MetricApiModel): MetricEntity {
    return MetricEntity.fromJSON({
      ...apiModel,
      value: apiModel.value,
    });
  }

  static toApiMetric(domainEntity: MetricEntity): MetricApiModel {
    const json = domainEntity.toJSON();
    return json as MetricApiModel;
  }

  static serializeEventFilters(filters: EventFilters): any {
    return {
      ...filters,
      eventTypes: filters.eventTypes?.map(type => type.value),
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString(),
    };
  }

  static serializeMetricFilters(filters: MetricFilters): any {
    return {
      ...filters,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString(),
    };
  }
}

export class AnalyticsRepositoryAdapter implements AnalyticsRepository {
  constructor(private readonly store: any) {} // RTK store reference

  async saveEvent(event: EventEntity): Promise<EventEntity> {
    const apiEvent = AnalyticsModelMapper.toApiEvent(event);
    const result = await this.store.dispatch(
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

    return AnalyticsModelMapper.toDomainEvent(result.data.event);
  }

  async getEvents(filters: EventFilters): Promise<EventEntity[]> {
    const serializedFilters = AnalyticsModelMapper.serializeEventFilters(filters);
    const result = await this.store.dispatch(
      analyticsApi.endpoints.getEvents.initiate(serializedFilters)
    );

    if (result.error) {
      throw new Error('Failed to get events');
    }

    return result.data.events.map(AnalyticsModelMapper.toDomainEvent);
  }

  async getEventById(id: string): Promise<EventEntity | null> {
    const result = await this.store.dispatch(
      analyticsApi.endpoints.getEvent.initiate(id)
    );

    if (result.error) {
      return null;
    }

    return result.data ? AnalyticsModelMapper.toDomainEvent(result.data) : null;
  }

  async getEventCount(filters: Omit<EventFilters, 'limit' | 'offset'>): Promise<number> {
    const serializedFilters = AnalyticsModelMapper.serializeEventFilters(filters);
    const result = await this.store.dispatch(
      analyticsApi.endpoints.getEvents.initiate({ ...serializedFilters, limit: 1 })
    );

    if (result.error) {
      throw new Error('Failed to get event count');
    }

    return result.data.totalCount;
  }

  async deleteEvent(id: string): Promise<void> {
    const result = await this.store.dispatch(
      analyticsApi.endpoints.deleteEvent.initiate(id)
    );

    if (result.error) {
      throw new Error('Failed to delete event');
    }
  }

  async saveEvents(events: EventEntity[]): Promise<EventEntity[]> {
    const apiEvents = events.map(event => ({
      type: event.type.value,
      name: event.name,
      userId: event.userId,
      sessionId: event.sessionId,
      properties: event.properties,
      skipEnrichment: true,
    }));

    const result = await this.store.dispatch(
      analyticsApi.endpoints.trackEvents.initiate({ events: apiEvents })
    );

    if (result.error) {
      throw new Error('Failed to save events');
    }

    // Since batch endpoint doesn't return full events, return the input events
    // In a real implementation, the API would return the saved events
    return events;
  }

  async deleteEvents(filters: EventFilters): Promise<number> {
    // This would require a batch delete endpoint in the API
    throw new Error('Batch delete events not implemented');
  }

  async getUniqueUsers(filters: Omit<EventFilters, 'userId'>): Promise<string[]> {
    const events = await this.getEvents(filters);
    const userIds = new Set<string>();
    
    events.forEach(event => {
      if (event.userId) {
        userIds.add(event.userId);
      }
    });

    return Array.from(userIds);
  }

  async getUniqueSessions(filters: EventFilters): Promise<string[]> {
    const events = await this.getEvents(filters);
    const sessionIds = new Set<string>();
    
    events.forEach(event => {
      if (event.sessionId) {
        sessionIds.add(event.sessionId);
      }
    });

    return Array.from(sessionIds);
  }

  async getEventsByType(filters: EventFilters): Promise<Record<string, EventEntity[]>> {
    const events = await this.getEvents(filters);
    const eventsByType: Record<string, EventEntity[]> = {};

    events.forEach(event => {
      const type = event.type.value;
      if (!eventsByType[type]) {
        eventsByType[type] = [];
      }
      eventsByType[type].push(event);
    });

    return eventsByType;
  }
}

export class MetricsRepositoryAdapter implements MetricsRepository {
  constructor(private readonly store: any) {} // RTK store reference

  async saveMetric(metric: MetricEntity): Promise<MetricEntity> {
    const apiMetric = AnalyticsModelMapper.toApiMetric(metric);
    const { id, timestamp, ...metricData } = apiMetric;

    const result = await this.store.dispatch(
      analyticsApi.endpoints.saveMetric.initiate(metricData)
    );

    if (result.error) {
      throw new Error('Failed to save metric');
    }

    return AnalyticsModelMapper.toDomainMetric(result.data);
  }

  async getMetrics(filters: MetricFilters): Promise<MetricEntity[]> {
    const serializedFilters = AnalyticsModelMapper.serializeMetricFilters(filters);
    const result = await this.store.dispatch(
      analyticsApi.endpoints.getMetrics.initiate(serializedFilters)
    );

    if (result.error) {
      throw new Error('Failed to get metrics');
    }

    return result.data.metrics.map(AnalyticsModelMapper.toDomainMetric);
  }

  async getMetricById(id: string): Promise<MetricEntity | null> {
    const result = await this.store.dispatch(
      analyticsApi.endpoints.getMetric.initiate(id)
    );

    if (result.error) {
      return null;
    }

    return result.data ? AnalyticsModelMapper.toDomainMetric(result.data) : null;
  }

  async deleteMetric(id: string): Promise<void> {
    const result = await this.store.dispatch(
      analyticsApi.endpoints.deleteMetric.initiate(id)
    );

    if (result.error) {
      throw new Error('Failed to delete metric');
    }
  }

  async saveMetrics(metrics: MetricEntity[]): Promise<MetricEntity[]> {
    const apiMetrics = metrics.map(metric => {
      const apiMetric = AnalyticsModelMapper.toApiMetric(metric);
      const { id, timestamp, ...metricData } = apiMetric;
      return metricData;
    });

    const result = await this.store.dispatch(
      analyticsApi.endpoints.saveMetrics.initiate({ metrics: apiMetrics })
    );

    if (result.error) {
      throw new Error('Failed to save metrics');
    }

    // Return the input metrics since batch endpoint doesn't return full metrics
    return metrics;
  }

  async deleteMetrics(filters: MetricFilters): Promise<number> {
    // This would require a batch delete endpoint in the API
    throw new Error('Batch delete metrics not implemented');
  }

  async aggregateMetrics(
    names: string[],
    aggregationType: 'sum' | 'average' | 'min' | 'max' | 'count',
    filters: MetricFilters
  ): Promise<MetricEntity[]> {
    const result = await this.store.dispatch(
      analyticsApi.endpoints.aggregateMetrics.initiate({
        names,
        aggregationType,
        filters: AnalyticsModelMapper.serializeMetricFilters(filters),
      })
    );

    if (result.error) {
      throw new Error('Failed to aggregate metrics');
    }

    return result.data.map(AnalyticsModelMapper.toDomainMetric);
  }

  async getMetricTrend(
    name: string,
    granularity: 'minute' | 'hour' | 'day' | 'week' | 'month',
    filters: MetricFilters
  ): Promise<MetricEntity[]> {
    const result = await this.store.dispatch(
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

    return result.data.trend.map(AnalyticsModelMapper.toDomainMetric);
  }
}

export class ReportingRepositoryAdapter implements ReportingRepository {
  constructor(private readonly store: any) {} // RTK store reference

  async generateReport(
    reportType: 'daily' | 'weekly' | 'monthly',
    filters: {
      startDate: Date;
      endDate: Date;
      includeMetrics?: string[];
      includeEvents?: EventType[];
    }
  ): Promise<{
    events: EventEntity[];
    metrics: MetricEntity[];
    summary: Record<string, any>;
  }> {
    const result = await this.store.dispatch(
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
    const events: EventEntity[] = [];
    const metrics: MetricEntity[] = [];

    return {
      events,
      metrics,
      summary: result.data.summary,
    };
  }
}