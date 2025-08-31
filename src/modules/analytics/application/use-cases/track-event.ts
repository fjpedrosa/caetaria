import { failure,Result, success } from '../../../shared/domain/value-objects/result';
import { EventEntity, EventProperties } from '../../domain/entities/event';
import { EventType } from '../../domain/value-objects/event-type';
import { AnalyticsRepository } from '../ports/analytics-repository';
import { TrackingService } from '../ports/tracking-service';

export interface TrackEventRequest {
  type: EventType;
  name: string;
  userId?: string;
  sessionId?: string;
  properties?: EventProperties;
  skipEnrichment?: boolean;
}

export interface TrackEventResponse {
  event: EventEntity;
  tracked: boolean;
}

export class TrackEventUseCase {
  constructor(
    private readonly analyticsRepository: AnalyticsRepository,
    private readonly trackingService: TrackingService
  ) {}

  async execute(request: TrackEventRequest): Promise<Result<TrackEventResponse, Error>> {
    try {
      // Check if tracking is enabled
      if (!this.trackingService.isTrackingEnabled()) {
        return failure(new Error('Tracking is disabled'));
      }

      // Check consent level
      const consentLevel = this.trackingService.getConsentLevel();
      if (!this.canTrackEvent(request.type, consentLevel)) {
        return failure(new Error('Insufficient consent for tracking this event type'));
      }

      // Create base event
      let event = EventEntity.create({
        type: request.type,
        name: request.name,
        userId: request.userId,
        sessionId: request.sessionId || this.trackingService.getCurrentSession(),
        properties: request.properties || {},
      });

      // Enrich event with context if not skipped
      if (!request.skipEnrichment) {
        event = this.trackingService.enrichEvent(event);
      }

      // Validate event
      const validationResult = this.validateEvent(event);
      if (!validationResult.isValid) {
        return failure(new Error(validationResult.message));
      }

      // Save to repository
      const savedEvent = await this.analyticsRepository.saveEvent(event);

      // Send to tracking service
      await this.trackingService.trackEvent(savedEvent);

      return success({
        event: savedEvent,
        tracked: true,
      });
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to track event'));
    }
  }

  private canTrackEvent(eventType: EventType, consentLevel: string): boolean {
    switch (consentLevel) {
      case 'none':
        return false;
      case 'essential':
        return eventType.isSystem();
      case 'analytics':
        return !eventType.isCustom();
      case 'all':
        return true;
      default:
        return false;
    }
  }

  private validateEvent(event: EventEntity): { isValid: boolean; message?: string } {
    if (!event.name.trim()) {
      return { isValid: false, message: 'Event name cannot be empty' };
    }

    if (event.name.length > 100) {
      return { isValid: false, message: 'Event name cannot exceed 100 characters' };
    }

    // Validate properties size
    const propertiesString = JSON.stringify(event.properties);
    if (propertiesString.length > 10000) { // 10KB limit
      return { isValid: false, message: 'Event properties exceed size limit' };
    }

    // Validate property keys
    const invalidKeys = Object.keys(event.properties).filter(key =>
      !key.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/) || key.length > 50
    );

    if (invalidKeys.length > 0) {
      return {
        isValid: false,
        message: `Invalid property keys: ${invalidKeys.join(', ')}`
      };
    }

    return { isValid: true };
  }
}

// Convenience use case for common event tracking
export class TrackPageViewUseCase {
  constructor(private readonly trackEvent: TrackEventUseCase) {}

  async execute(request: {
    url: string;
    title?: string;
    referrer?: string;
    userId?: string;
    sessionId?: string;
  }): Promise<Result<TrackEventResponse, Error>> {
    return this.trackEvent.execute({
      type: EventType.PAGE_VIEW,
      name: 'Page View',
      userId: request.userId,
      sessionId: request.sessionId,
      properties: {
        url: request.url,
        title: request.title || '',
        referrer: request.referrer || '',
        timestamp: new Date().toISOString(),
      },
    });
  }
}

export class TrackConversionUseCase {
  constructor(private readonly trackEvent: TrackEventUseCase) {}

  async execute(request: {
    conversionType: EventType;
    value?: number;
    currency?: string;
    userId?: string;
    sessionId?: string;
    properties?: EventProperties;
  }): Promise<Result<TrackEventResponse, Error>> {
    if (!request.conversionType.isConversion()) {
      return failure(new Error('Event type must be a conversion event'));
    }

    const properties: EventProperties = {
      ...request.properties,
      conversion_value: request.value || 0,
      currency: request.currency || 'USD',
      timestamp: new Date().toISOString(),
    };

    return this.trackEvent.execute({
      type: request.conversionType,
      name: request.conversionType.value,
      userId: request.userId,
      sessionId: request.sessionId,
      properties,
    });
  }
}