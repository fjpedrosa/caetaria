import { EventEntity } from '../../domain/entities/event';
import { MetricEntity } from '../../domain/entities/metric';

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
  // Event tracking
  trackEvent(event: EventEntity): Promise<void>;
  trackEvents(events: EventEntity[]): Promise<void>;

  // Context management
  setContext(context: TrackingContext): void;
  getContext(): TrackingContext;
  enrichEvent(event: EventEntity): EventEntity;

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