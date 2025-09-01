import { Event } from '../../domain/entities/event';
import { Metric, TimeGranularity } from '../../domain/entities/metric';
import { EventType, EventTypeInterface } from '../../domain/value-objects/event-type';

export interface EventFilters {
  readonly userId?: string;
  readonly sessionId?: string;
  readonly eventTypes?: (EventType | EventTypeInterface)[];
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
  saveEvent(event: Event): Promise<Event>;
  getEvents(filters: EventFilters): Promise<Event[]>;
  getEventById(id: string): Promise<Event | null>;
  getEventCount(filters: Omit<EventFilters, 'limit' | 'offset'>): Promise<number>;
  deleteEvent(id: string): Promise<void>;

  // Batch event operations
  saveEvents(events: Event[]): Promise<Event[]>;
  deleteEvents(filters: EventFilters): Promise<number>;

  // Event aggregations
  getUniqueUsers(filters: Omit<EventFilters, 'userId'>): Promise<string[]>;
  getUniqueSessions(filters: EventFilters): Promise<string[]>;
  getEventsByType(filters: EventFilters): Promise<Record<string, Event[]>>;

  // A/B Testing methods
  createABTest(config: {
    name: string;
    variants: Array<{ id: string; name: string; weight: number }>;
    conversionGoal: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<string>;

  recordABTestVariantView(params: {
    testId: string;
    variantId: string;
    userId?: string;
  }): Promise<void>;

  recordABTestConversion(params: {
    testId: string;
    variantId: string;
    userId?: string;
    conversionValue?: number;
  }): Promise<void>;

  calculateABTestResults(testId: string): Promise<{
    variantId: string;
    conversionRate: number;
    statisticalSignificance: 'high' | 'medium' | 'low' | 'inconclusive';
  }[]>;

  // Performance Tracking
  trackPerformanceMetric(metric: {
    name: string;
    category: 'core_web_vital' | 'custom';
    value: number;
    timestamp?: Date;
    metadata?: Record<string, any>;
  }): Promise<void>;

  // Funnel and User Journey Tracking
  trackFunnelEntry(params: {
    funnelId: string;
    stepName: string;
    userId?: string;
    properties?: Record<string, any>;
  }): Promise<void>;

  trackFunnelProgression(params: {
    funnelId: string;
    fromStep: string;
    toStep: string;
    userId?: string;
    properties?: Record<string, any>;
  }): Promise<void>;

  trackUserRetention(params: {
    userId: string;
    feature?: string;
    duration?: number;
    properties?: Record<string, any>;
  }): Promise<void>;
}

export interface MetricsRepository {
  // Metric operations
  saveMetric(metric: Metric): Promise<Metric>;
  getMetrics(filters: MetricFilters): Promise<Metric[]>;
  getMetricById(id: string): Promise<Metric | null>;
  deleteMetric(id: string): Promise<void>;

  // Batch metric operations
  saveMetrics(metrics: Metric[]): Promise<Metric[]>;
  deleteMetrics(filters: MetricFilters): Promise<number>;

  // Metric aggregations
  aggregateMetrics(
    names: string[],
    aggregationType: 'sum' | 'average' | 'min' | 'max' | 'count',
    filters: MetricFilters
  ): Promise<Metric[]>;

  getMetricTrend(
    name: string,
    granularity: TimeGranularity,
    filters: MetricFilters
  ): Promise<Metric[]>;
}

export interface ReportingRepository {
  generateReport(
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
  }>;
}