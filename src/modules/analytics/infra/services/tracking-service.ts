import { AnalyticsRepository } from '../../application/ports/analytics-repository';
import { TrackingService } from '../../application/ports/tracking-service';
import { createEvent,Event } from '../../domain/entities/event';
import { EventTypeInterface } from '../../domain/value-objects/event-type';

export class SupabaseTrackingService implements TrackingService {
  constructor(private analyticsRepository: AnalyticsRepository) {}

  async track(params: {
    type: EventTypeInterface;
    name: string;
    userId?: string;
    sessionId?: string;
    properties?: Record<string, any>;
  }): Promise<Event> {
    const event = createEvent({
      type: params.type,
      name: params.name,
      userId: params.userId,
      sessionId: params.sessionId,
      properties: params.properties || {},
      metadata: {
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      },
    });

    return this.analyticsRepository.saveEvent(event);
  }

  async trackPageView(params: {
    path: string;
    userId?: string;
    sessionId?: string;
    properties?: Record<string, any>;
  }): Promise<Event> {
    return this.track({
      type: { value: 'page_view' } as EventTypeInterface,
      name: `Page View: ${params.path}`,
      userId: params.userId,
      sessionId: params.sessionId,
      properties: {
        path: params.path,
        ...params.properties,
      },
    });
  }

  async trackConversion(params: {
    type: string;
    value?: number;
    userId?: string;
    sessionId?: string;
    properties?: Record<string, any>;
  }): Promise<Event> {
    return this.track({
      type: { value: 'conversion' } as EventTypeInterface,
      name: `Conversion: ${params.type}`,
      userId: params.userId,
      sessionId: params.sessionId,
      properties: {
        conversion_type: params.type,
        conversion_value: params.value,
        ...params.properties,
      },
    });
  }

  async trackError(params: {
    message: string;
    stack?: string;
    level?: 'error' | 'warning' | 'info';
    userId?: string;
    sessionId?: string;
  }): Promise<Event> {
    return this.track({
      type: { value: 'error' } as EventTypeInterface,
      name: `Error: ${params.message}`,
      userId: params.userId,
      sessionId: params.sessionId,
      properties: {
        error_message: params.message,
        error_stack: params.stack,
        error_level: params.level || 'error',
      },
    });
  }

  async trackPerformance(params: {
    metric: string;
    value: number;
    userId?: string;
    sessionId?: string;
  }): Promise<Event> {
    return this.track({
      type: { value: 'performance' } as EventTypeInterface,
      name: `Performance: ${params.metric}`,
      userId: params.userId,
      sessionId: params.sessionId,
      properties: {
        metric_name: params.metric,
        metric_value: params.value,
      },
    });
  }

  async trackABTestView(params: {
    testId: string;
    variantId: string;
    userId?: string;
    sessionId?: string;
  }): Promise<Event> {
    return this.track({
      type: { value: 'ab_test_variant_viewed' } as EventTypeInterface,
      name: `A/B Test Variant View: ${params.testId}`,
      userId: params.userId,
      sessionId: params.sessionId,
      properties: {
        test_id: params.testId,
        variant_id: params.variantId,
      },
    });
  }

  async trackABTestConversion(params: {
    testId: string;
    variantId: string;
    conversionValue?: number;
    userId?: string;
    sessionId?: string;
  }): Promise<Event> {
    return this.track({
      type: { value: 'ab_test_conversion' } as EventTypeInterface,
      name: `A/B Test Conversion: ${params.testId}`,
      userId: params.userId,
      sessionId: params.sessionId,
      properties: {
        test_id: params.testId,
        variant_id: params.variantId,
        conversion_value: params.conversionValue,
      },
    });
  }
}