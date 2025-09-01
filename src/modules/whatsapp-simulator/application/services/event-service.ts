/**
 * EventService - Functional service for event management and emission
 * Replaces the reactive Subject/Observable pattern with pure functions
 */

import { BehaviorSubject, EMPTY,merge, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, takeUntil,throttleTime } from 'rxjs/operators';

import { ConversationEvent, EventFilter, EventFilters } from '../../domain/events';

// Types
export interface EventServiceConfig {
  enableDebug: boolean;
  throttleTime: number;
  maxEventsInMemory: number;
}

export interface EventSubscription {
  unsubscribe: () => void;
}

export interface EventServiceState {
  events: ConversationEvent[];
  lastEvent: ConversationEvent | null;
  isActive: boolean;
}

// Configuration factory
export const createEventServiceConfig = (overrides: Partial<EventServiceConfig> = {}): EventServiceConfig => ({
  enableDebug: false,
  throttleTime: 16, // ~60fps
  maxEventsInMemory: 100,
  ...overrides
});

// Event emission functions
export const createEventEmitter = () => {
  const eventSubject = new Subject<ConversationEvent>();
  return {
    emit: (event: ConversationEvent): void => {
      eventSubject.next(event);
    },
    events$: eventSubject.asObservable(),
    destroy: (): void => {
      eventSubject.complete();
    }
  };
};

// Event filtering functions
export const filterEventsByType = (eventType: string) => (event: ConversationEvent): boolean => {
  return event.type === eventType;
};

export const filterEventsByPattern = (pattern: string) => (event: ConversationEvent): boolean => {
  return event.type.includes(pattern);
};

export const filterEventsByConversation = (conversationId: string) => (event: ConversationEvent): boolean => {
  return event.conversationId === conversationId;
};

export const filterEventsByTimeRange = (startTime: Date, endTime: Date) => (event: ConversationEvent): boolean => {
  return event.timestamp >= startTime && event.timestamp <= endTime;
};

// Event subscription functions
export const subscribeToEvents = (
  events$: Observable<ConversationEvent>,
  filter: EventFilter,
  handler: (event: ConversationEvent) => void,
  config: EventServiceConfig
): EventSubscription => {
  const subscription = events$.pipe(
    filter(filter),
    config.throttleTime > 0 ? throttleTime(config.throttleTime) : (source) => source
  ).subscribe({
    next: handler,
    error: (error) => {
      if (config.enableDebug) {
        console.error('[EventService] Subscription error:', error);
      }
    }
  });

  return {
    unsubscribe: () => subscription.unsubscribe()
  };
};

export const subscribeToConversationEvents = (
  events$: Observable<ConversationEvent>,
  handler: (event: ConversationEvent) => void,
  config: EventServiceConfig
): EventSubscription => {
  return subscribeToEvents(events$, EventFilters.conversationEvents, handler, config);
};

export const subscribeToMessageEvents = (
  events$: Observable<ConversationEvent>,
  handler: (event: ConversationEvent) => void,
  config: EventServiceConfig
): EventSubscription => {
  return subscribeToEvents(events$, EventFilters.messageEvents, handler, config);
};

export const subscribeToErrorEvents = (
  events$: Observable<ConversationEvent>,
  handler: (event: ConversationEvent) => void,
  config: EventServiceConfig
): EventSubscription => {
  return subscribeToEvents(events$, EventFilters.errorEvents, handler, config);
};

// Event debugging functions
export const logEvent = (
  event: ConversationEvent,
  config: EventServiceConfig
): void => {
  if (config.enableDebug) {
    console.log(`[EventService] ${event.type}:`, event);
  }
};

export const logEventSimple = (
  event: ConversationEvent,
  config: EventServiceConfig
): void => {
  if (config.enableDebug) {
    console.log(`[EventService] ${event.type} - ${event.conversationId}`);
  }
};

// Event aggregation functions
export const createEventAggregator = (events$: Observable<ConversationEvent>, config: EventServiceConfig) => {
  const eventsState = new BehaviorSubject<EventServiceState>({
    events: [],
    lastEvent: null,
    isActive: true
  });

  const subscription = events$.subscribe(event => {
    const currentState = eventsState.value;
    const updatedEvents = [...currentState.events.slice(-(config.maxEventsInMemory - 1)), event];

    eventsState.next({
      events: updatedEvents,
      lastEvent: event,
      isActive: true
    });

    logEvent(event, config);
  });

  return {
    state$: eventsState.asObservable(),
    getCurrentState: () => eventsState.value,
    destroy: () => {
      subscription.unsubscribe();
      eventsState.complete();
    }
  };
};

// Event stream composition functions
export const combineEventStreams = (...streams: Observable<ConversationEvent>[]): Observable<ConversationEvent> => {
  return merge(...streams);
};

export const createFilteredEventStream = (
  events$: Observable<ConversationEvent>,
  filters: EventFilter[]
): Observable<ConversationEvent> => {
  const combinedFilter = (event: ConversationEvent) => filters.every(filter => filter(event));
  return events$.pipe(filter(combinedFilter));
};

// Event cleanup functions
export const createEventCleanup = (...subscriptions: EventSubscription[]): (() => void) => {
  return () => {
    subscriptions.forEach(subscription => {
      try {
        subscription.unsubscribe();
      } catch (error) {
        console.warn('[EventService] Cleanup error:', error);
      }
    });
  };
};

// Event validation functions
export const validateEvent = (event: ConversationEvent): boolean => {
  return typeof event.id === 'string' &&
         typeof event.type === 'string' &&
         event.timestamp instanceof Date &&
         typeof event.conversationId === 'string' &&
         event.payload !== undefined;
};

export const validateEventType = (event: ConversationEvent, expectedType: string): boolean => {
  return event.type === expectedType;
};

export const validateEventConversation = (event: ConversationEvent, expectedConversationId: string): boolean => {
  return event.conversationId === expectedConversationId;
};

// Event transformation functions
export const mapEventToType = (events$: Observable<ConversationEvent>): Observable<string> => {
  return events$.pipe(
    map(event => event.type),
    distinctUntilChanged()
  );
};

export const mapEventToConversation = (events$: Observable<ConversationEvent>): Observable<string> => {
  return events$.pipe(
    map(event => event.conversationId),
    distinctUntilChanged()
  );
};

export const mapEventToTimestamp = (events$: Observable<ConversationEvent>): Observable<Date> => {
  return events$.pipe(
    map(event => event.timestamp)
  );
};

// Performance monitoring functions
export const measureEventThroughput = (
  events$: Observable<ConversationEvent>,
  windowMs: number = 1000
): Observable<number> => {
  return events$.pipe(
    throttleTime(windowMs),
    scan((count, _) => count + 1, 0)
  );
};

export const trackEventLatency = (event: ConversationEvent): number => {
  return Date.now() - event.timestamp.getTime();
};

// Helper function for creating stop signals
export const createStopSignal = () => {
  const stopSubject = new Subject<void>();
  return {
    stop: () => stopSubject.next(),
    destroy: () => stopSubject.complete(),
    stop$: stopSubject.asObservable()
  };
};

// Event service factory function
export const createEventService = (config: Partial<EventServiceConfig> = {}) => {
  const serviceConfig = createEventServiceConfig(config);
  const emitter = createEventEmitter();
  const aggregator = createEventAggregator(emitter.events$, serviceConfig);
  const stopSignal = createStopSignal();

  // Enhanced events stream with stop signal
  const events$ = emitter.events$.pipe(
    takeUntil(stopSignal.stop$)
  );

  return {
    // Core functionality
    emit: emitter.emit,
    events$,

    // State access
    getState: aggregator.getCurrentState,
    state$: aggregator.state$,

    // Subscription helpers
    subscribeToAll: (handler: (event: ConversationEvent) => void) =>
      subscribeToEvents(events$, () => true, handler, serviceConfig),

    subscribeToConversation: (handler: (event: ConversationEvent) => void) =>
      subscribeToConversationEvents(events$, handler, serviceConfig),

    subscribeToMessages: (handler: (event: ConversationEvent) => void) =>
      subscribeToMessageEvents(events$, handler, serviceConfig),

    subscribeToErrors: (handler: (event: ConversationEvent) => void) =>
      subscribeToErrorEvents(events$, handler, serviceConfig),

    // Custom subscriptions
    subscribe: (filter: EventFilter, handler: (event: ConversationEvent) => void) =>
      subscribeToEvents(events$, filter, handler, serviceConfig),

    // Utility
    config: serviceConfig,

    // Lifecycle
    destroy: () => {
      stopSignal.stop();
      aggregator.destroy();
      emitter.destroy();
      stopSignal.destroy();
    }
  };
};

// Types for the service
export type EventService = ReturnType<typeof createEventService>;