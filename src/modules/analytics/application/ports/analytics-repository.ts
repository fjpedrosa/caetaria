import { EventEntity } from '../../domain/entities/event';
import { MetricEntity, TimeGranularity } from '../../domain/entities/metric';
import { EventType } from '../../domain/value-objects/event-type';

export interface EventFilters {
  readonly userId?: string;
  readonly sessionId?: string;
  readonly eventTypes?: EventType[];
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly properties?: Record<string, any>;
  readonly limit?: number;
  readonly offset?: number;
}

export interface MetricFilters {
  readonly names?: string[];
  readonly tags?: string[];
  readonly dimensions?: Record<string, any>;
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly granularity?: TimeGranularity;
  readonly limit?: number;
  readonly offset?: number;
}

export interface AnalyticsRepository {
  // Event operations
  saveEvent(event: EventEntity): Promise<EventEntity>;
  getEvents(filters: EventFilters): Promise<EventEntity[]>;
  getEventById(id: string): Promise<EventEntity | null>;
  getEventCount(filters: Omit<EventFilters, 'limit' | 'offset'>): Promise<number>;
  deleteEvent(id: string): Promise<void>;
  
  // Batch event operations
  saveEvents(events: EventEntity[]): Promise<EventEntity[]>;
  deleteEvents(filters: EventFilters): Promise<number>;
  
  // Event aggregations
  getUniqueUsers(filters: Omit<EventFilters, 'userId'>): Promise<string[]>;
  getUniqueSessions(filters: EventFilters): Promise<string[]>;
  getEventsByType(filters: EventFilters): Promise<Record<string, EventEntity[]>>;
}

export interface MetricsRepository {
  // Metric operations
  saveMetric(metric: MetricEntity): Promise<MetricEntity>;
  getMetrics(filters: MetricFilters): Promise<MetricEntity[]>;
  getMetricById(id: string): Promise<MetricEntity | null>;
  deleteMetric(id: string): Promise<void>;
  
  // Batch metric operations
  saveMetrics(metrics: MetricEntity[]): Promise<MetricEntity[]>;
  deleteMetrics(filters: MetricFilters): Promise<number>;
  
  // Metric aggregations
  aggregateMetrics(
    names: string[],
    aggregationType: 'sum' | 'average' | 'min' | 'max' | 'count',
    filters: MetricFilters
  ): Promise<MetricEntity[]>;
  
  getMetricTrend(
    name: string,
    granularity: TimeGranularity,
    filters: MetricFilters
  ): Promise<MetricEntity[]>;
}

export interface ReportingRepository {
  generateReport(
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
  }>;
}