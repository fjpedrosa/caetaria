import { failure,Result, success } from '../../../shared/domain/value-objects/result';
import { createEvent,Event, EventProperties } from '../../domain/entities/event';
import {
  EVENT_TYPES,
  EventType,
  EventTypeInterface,
  eventTypeToString,
  isConversionEvent,
  isCustomEvent,
  isSystemEvent} from '../../domain/value-objects/event-type';
import { AnalyticsRepository } from '../ports/analytics-repository';
import { TrackingService } from '../ports/tracking-service';

export interface TrackEventRequest {
  type: EventType | EventTypeInterface;
  name: string;
  userId?: string;
  sessionId?: string;
  properties?: EventProperties;
  skipEnrichment?: boolean;
}

export interface TrackEventResponse {
  event: Event;
  tracked: boolean;
}

// =============================================================================
// DEPENDENCY INJECTION TYPES - Define what we need
// =============================================================================

interface TrackEventDependencies {
  analyticsRepository: AnalyticsRepository;
  trackingService: TrackingService;
}

// =============================================================================
// VALIDATION FUNCTIONS - Pure functions (Single Responsibility)
// =============================================================================

/**
 * Check if event type can be tracked based on consent level
 * Single Responsibility: Only handles consent validation
 */
export const canTrackEvent = (eventType: EventType | EventTypeInterface, consentLevel: string): boolean => {
  switch (consentLevel) {
    case 'none':
      return false;
    case 'essential':
      return isSystemEvent(eventType as EventTypeInterface);
    case 'analytics':
      return !isCustomEvent(eventType as EventTypeInterface);
    case 'all':
      return true;
    default:
      return false;
  }
};

/**
 * Validate event data
 * Single Responsibility: Only handles event validation
 */
export const validateEvent = (event: Event): { isValid: boolean; message?: string } => {
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
};

// =============================================================================
// USE CASE FACTORY FUNCTION - Dependency Inversion Principle
// =============================================================================

/**
 * Create track event use case function with injected dependencies
 * Single Responsibility: Only creates the use case function
 * Dependency Inversion: Depends on abstractions, not concretions
 */
export const createTrackEventUseCase = (dependencies: TrackEventDependencies) => {
  const { analyticsRepository, trackingService } = dependencies;

  return async (request: TrackEventRequest): Promise<Result<TrackEventResponse, Error>> => {
    try {
      // Check if tracking is enabled
      if (!trackingService.isTrackingEnabled()) {
        return failure(new Error('Tracking is disabled'));
      }

      // Check consent level
      const consentLevel = trackingService.getConsentLevel();
      if (!canTrackEvent(request.type, consentLevel)) {
        return failure(new Error('Insufficient consent for tracking this event type'));
      }

      // Create base event
      let event = createEvent({
        type: request.type,
        name: request.name,
        userId: request.userId,
        sessionId: request.sessionId || trackingService.getCurrentSession(),
        properties: request.properties || {},
      });

      // Enrich event with context if not skipped
      if (!request.skipEnrichment) {
        event = trackingService.enrichEvent(event);
      }

      // Validate event
      const validationResult = validateEvent(event);
      if (!validationResult.isValid) {
        return failure(new Error(validationResult.message));
      }

      // Save to repository
      const savedEvent = await analyticsRepository.saveEvent(event);

      // Send to tracking service
      await trackingService.trackEvent(savedEvent);

      return success({
        event: savedEvent,
        tracked: true,
      });
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to track event'));
    }
  };
};

// =============================================================================
// SPECIALIZED USE CASE FACTORY FUNCTIONS - Composition over classes
// =============================================================================

/**
 * Create page view tracking function
 * Single Responsibility: Only handles page view tracking
 * Open/Closed Principle: Extends base tracking without modification
 */
export const createTrackPageViewUseCase = (
  trackEventUseCase: (request: TrackEventRequest) => Promise<Result<TrackEventResponse, Error>>
) => {
  return async (request: {
    url: string;
    title?: string;
    referrer?: string;
    userId?: string;
    sessionId?: string;
  }): Promise<Result<TrackEventResponse, Error>> => {
    return trackEventUseCase({
      type: EVENT_TYPES.PAGE_VIEW,
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
  };
};

/**
 * Create conversion tracking function
 * Single Responsibility: Only handles conversion tracking
 * Interface Segregation: Specific interface for conversion needs
 */
export const createTrackConversionUseCase = (
  trackEventUseCase: (request: TrackEventRequest) => Promise<Result<TrackEventResponse, Error>>
) => {
  return async (request: {
    conversionType: EventType | EventTypeInterface;
    value?: number;
    currency?: string;
    userId?: string;
    sessionId?: string;
    properties?: EventProperties;
  }): Promise<Result<TrackEventResponse, Error>> => {
    if (!isConversionEvent(request.conversionType as EventTypeInterface)) {
      return failure(new Error('Event type must be a conversion event'));
    }

    const properties: EventProperties = {
      ...request.properties,
      conversion_value: request.value || 0,
      currency: request.currency || 'USD',
      timestamp: new Date().toISOString(),
    };

    return trackEventUseCase({
      type: request.conversionType,
      name: eventTypeToString(request.conversionType as EventTypeInterface),
      userId: request.userId,
      sessionId: request.sessionId,
      properties,
    });
  };
};

// =============================================================================
// CONVENIENCE COMPOSITION FUNCTION - Create all use cases together
// =============================================================================

/**
 * Create all tracking use cases with shared dependencies
 * Single Responsibility: Only assembles use case functions
 * Dependency Inversion: All functions depend on the same abstractions
 */
export const createTrackingUseCases = (dependencies: TrackEventDependencies) => {
  const trackEventUseCase = createTrackEventUseCase(dependencies);
  const trackPageViewUseCase = createTrackPageViewUseCase(trackEventUseCase);
  const trackConversionUseCase = createTrackConversionUseCase(trackEventUseCase);

  return {
    trackEvent: trackEventUseCase,
    trackPageView: trackPageViewUseCase,
    trackConversion: trackConversionUseCase,
  };
};