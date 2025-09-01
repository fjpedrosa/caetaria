import { Event } from '../../domain/entities/event';
import { Metric } from '../../domain/entities/metric';
import { EventTypeInterface } from '../../domain/value-objects/event-type';

export interface TrackingContext {
  readonly userId?: string;
  readonly sessionId?: string;
  readonly userAgent?: string;
  readonly ipAddress?: string;
  readonly referrer?: string;
  readonly url?: string;
  readonly deviceType?: 'desktop' | 'mobile' | 'tablet';
  readonly browser?: string;
  readonly os?: string;
  readonly country?: string;
  readonly region?: string;
}

export interface TrackingService {
  // Generic event tracking
  track(params: {
    type: EventTypeInterface;
    name: string;
    userId?: string;
    sessionId?: string;
    properties?: Record<string, any>;
  }): Promise<Event>;

  // Detailed event tracking
  trackEvent(event: Event): Promise<void>;
  trackEvents(events: Event[]): Promise<void>;

  // Page view tracking
  trackPageView(params: {
    path: string;
    userId?: string;
    sessionId?: string;
    properties?: Record<string, any>;
  }): Promise<Event>;

  // Conversion tracking
  trackConversion(params: {
    type: string;
    value?: number;
    userId?: string;
    sessionId?: string;
    properties?: Record<string, any>;
  }): Promise<Event>;

  // Error tracking
  trackError(params: {
    message: string;
    stack?: string;
    level?: 'error' | 'warning' | 'info';
    userId?: string;
    sessionId?: string;
  }): Promise<Event>;

  // Performance tracking
  trackPerformance(params: {
    metric: string;
    value: number;
    userId?: string;
    sessionId?: string;
  }): Promise<Event>;

  // A/B Test tracking
  trackABTestView(params: {
    testId: string;
    variantId: string;
    userId?: string;
    sessionId?: string;
  }): Promise<Event>;

  trackABTestConversion(params: {
    testId: string;
    variantId: string;
    conversionValue?: number;
    userId?: string;
    sessionId?: string;
  }): Promise<Event>;

  // Context management
  setContext(context: TrackingContext): void;
  getContext(): TrackingContext;
  enrichEvent(event: Event): Event;

  // Session management
  startSession(): string;
  endSession(sessionId: string): void;
  getCurrentSession(): string | undefined;

  // Privacy and consent
  setTrackingEnabled(enabled: boolean): void;
  isTrackingEnabled(): boolean;
  setConsentLevel(level: 'none' | 'essential' | 'analytics' | 'all'): void;
  getConsentLevel(): 'none' | 'essential' | 'analytics' | 'all';

  // Data management
  flush(): Promise<void>;
  clear(): Promise<void>;
}