import {
  EventType,
  eventTypeFromJSON,
  EventTypeInterface,
  eventTypesEqual,
  eventTypeToString,
  isConversionEvent as isConversionEventType,
  isPageViewEvent as isPageViewEventType,
  isSystemEvent as isSystemEventType,
  isUserActionEvent as isUserActionEventType} from '../value-objects/event-type';

export interface EventProperties {
  readonly [key: string]: string | number | boolean | Date | null;
}

export interface Event {
  readonly id: string;
  readonly type: EventType | EventTypeInterface;
  readonly name: string;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly properties: EventProperties;
  readonly metadata: {
    readonly userAgent?: string;
    readonly ipAddress?: string;
    readonly referrer?: string;
    readonly url?: string;
    readonly deviceType?: 'desktop' | 'mobile' | 'tablet';
    readonly browser?: string;
    readonly os?: string;
    readonly country?: string;
    readonly region?: string;
  };
  readonly timestamp: Date;
  readonly processed: boolean;
}

// =============================================================================
// FUNCTIONAL EVENT OPERATIONS - Pure functions replacing EventEntity class
// =============================================================================

/**
 * Get a property from an event with type safety
 */
export const getEventProperty = <T = any>(event: Event, key: string): T | undefined => {
  return event.properties[key] as T;
};

/**
 * Check if event has a specific property
 */
export const hasEventProperty = (event: Event, key: string): boolean => {
  return key in event.properties;
};

/**
 * Check if event is a page view
 */
export const isPageViewEvent = (event: Event): boolean => {
  return isPageViewEventType(event.type as EventTypeInterface);
};

/**
 * Check if event is a user action
 */
export const isUserActionEvent = (event: Event): boolean => {
  return isUserActionEventType(event.type as EventTypeInterface);
};

/**
 * Check if event is a conversion
 */
export const isConversionEvent = (event: Event): boolean => {
  return isConversionEventType(event.type as EventTypeInterface);
};

/**
 * Check if event is a system event
 */
export const isSystemEvent = (event: Event): boolean => {
  return isSystemEventType(event.type as EventTypeInterface);
};

/**
 * Get the age of an event in milliseconds
 */
export const getEventAge = (event: Event): number => {
  return Date.now() - event.timestamp.getTime();
};

/**
 * Check if event is recent (within threshold)
 */
export const isRecentEvent = (event: Event, thresholdMs: number = 300000): boolean => {
  return getEventAge(event) < thresholdMs;
};

/**
 * Create a new event with updated userId (immutable)
 */
export const withUserId = (event: Event, userId: string): Event => ({
  ...event,
  userId,
});

/**
 * Create a new event with updated sessionId (immutable)
 */
export const withSessionId = (event: Event, sessionId: string): Event => ({
  ...event,
  sessionId,
});

/**
 * Add a single property to an event (immutable)
 */
export const addEventProperty = (
  event: Event,
  key: string,
  value: string | number | boolean | Date | null
): Event => ({
  ...event,
  properties: {
    ...event.properties,
    [key]: value,
  },
});

/**
 * Add multiple properties to an event (immutable)
 */
export const addEventProperties = (event: Event, properties: EventProperties): Event => ({
  ...event,
  properties: {
    ...event.properties,
    ...properties,
  },
});

/**
 * Mark an event as processed (immutable)
 */
export const markEventAsProcessed = (event: Event): Event => ({
  ...event,
  processed: true,
});

/**
 * Convert event to JSON representation
 */
export const eventToJSON = (event: Event): Record<string, any> => ({
  id: event.id,
  type: eventTypeToString(event.type as EventTypeInterface),
  name: event.name,
  userId: event.userId,
  sessionId: event.sessionId,
  properties: event.properties,
  metadata: event.metadata,
  timestamp: event.timestamp.toISOString(),
  processed: event.processed,
});

/**
 * Create a new event from data (factory function)
 */
export const createEvent = (data: {
  type: EventType | EventTypeInterface;
  name: string;
  userId?: string;
  sessionId?: string;
  properties?: EventProperties;
  metadata?: Partial<Event['metadata']>;
}): Event => {
  const now = new Date();
  const id = `evt_${now.getTime()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    id,
    type: data.type,
    name: data.name,
    userId: data.userId,
    sessionId: data.sessionId,
    properties: data.properties || {},
    metadata: data.metadata || {},
    timestamp: now,
    processed: false,
  };
};

/**
 * Create event from JSON data (deserializer function)
 */
export const eventFromJSON = (data: any): Event => ({
  id: data.id,
  type: eventTypeFromJSON(data.type),
  name: data.name,
  userId: data.userId,
  sessionId: data.sessionId,
  properties: data.properties || {},
  metadata: data.metadata || {},
  timestamp: new Date(data.timestamp),
  processed: data.processed || false,
});

// =============================================================================
// FUNCTIONAL COMPOSITION HELPERS - For complex operations
// =============================================================================

/**
 * Transform an event through multiple operations (functional composition)
 */
export const transformEvent = (event: Event, ...transformers: Array<(e: Event) => Event>): Event => {
  return transformers.reduce((acc, transformer) => transformer(acc), event);
};

/**
 * Validate event data structure (pure function)
 */
export const validateEventData = (event: Event): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!event.id) errors.push('Event ID is required');
  if (!event.name) errors.push('Event name is required');
  if (!event.type) errors.push('Event type is required');
  if (!(event.timestamp instanceof Date) || isNaN(event.timestamp.getTime())) {
    errors.push('Valid timestamp is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Filter events by criteria (pure function)
 */
export const filterEvents = (
  events: Event[],
  criteria: Partial<{
    userId: string;
    sessionId: string;
    type: EventType | EventTypeInterface;
    processed: boolean;
    isRecent: boolean;
    hasProperty: string;
  }>
): Event[] => {
  return events.filter(event => {
    if (criteria.userId && event.userId !== criteria.userId) return false;
    if (criteria.sessionId && event.sessionId !== criteria.sessionId) return false;
    if (criteria.type && !eventTypesEqual(event.type as EventTypeInterface, criteria.type as EventTypeInterface)) return false;
    if (criteria.processed !== undefined && event.processed !== criteria.processed) return false;
    if (criteria.isRecent && !isRecentEvent(event)) return false;
    if (criteria.hasProperty && !hasEventProperty(event, criteria.hasProperty)) return false;
    return true;
  });
};