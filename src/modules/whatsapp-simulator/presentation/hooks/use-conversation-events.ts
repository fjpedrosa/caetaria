/**
 * useConversationEvents - Hook for conversation event management without RxJS
 * Replaces complex Subject-based event system with simple callback pattern
 */

import { useCallback, useEffect, useMemo,useRef, useState } from 'react';

import { ConversationConfig, logDebug } from '../../application/services/conversation-service';
import { ConversationEvent } from '../../domain/events';

export interface ConversationEventsOptions {
  maxEventHistory?: number;
  enableDebug?: boolean;
  config?: ConversationConfig;
}

export interface EventSubscription {
  id: string;
  callback: (event: ConversationEvent) => void;
  filter?: (event: ConversationEvent) => boolean;
}

export interface ConversationEventsResult {
  // Event emission
  emitEvent: (event: ConversationEvent) => void;

  // Event subscription
  subscribe: (callback: (event: ConversationEvent) => void, filter?: (event: ConversationEvent) => boolean) => () => void;
  subscribeToType: (eventType: string, callback: (event: ConversationEvent) => void) => () => void;
  subscribeToPattern: (pattern: RegExp, callback: (event: ConversationEvent) => void) => () => void;

  // Event history and queries
  events: ConversationEvent[];
  getEventsByType: (eventType: string) => ConversationEvent[];
  getEventsByPattern: (pattern: RegExp) => ConversationEvent[];
  getRecentEvents: (count: number) => ConversationEvent[];
  clearEventHistory: () => void;

  // Event statistics
  eventStats: {
    totalEvents: number;
    eventsByType: Record<string, number>;
    lastEventTime: Date | null;
  };
}

export const useConversationEvents = (
  options: ConversationEventsOptions = {}
): ConversationEventsResult => {
  const { maxEventHistory = 100, enableDebug = false, config } = options;

  // Event storage
  const [events, setEvents] = useState<ConversationEvent[]>([]);

  // Subscriptions storage
  const subscriptionsRef = useRef<Map<string, EventSubscription>>(new Map());
  const nextSubscriptionIdRef = useRef(0);

  // Emit event to all subscribers
  const emitEvent = useCallback((event: ConversationEvent) => {
    if (enableDebug) {
      logDebug(config, 'Event emitted', {
        type: event.type,
        id: event.id,
        timestamp: event.timestamp
      });
    }

    // Add to event history
    setEvents(prevEvents => {
      const newEvents = [...prevEvents, event];

      // Limit event history size
      if (newEvents.length > maxEventHistory) {
        newEvents.splice(0, newEvents.length - maxEventHistory);
      }

      return newEvents;
    });

    // Notify all subscribers
    subscriptionsRef.current.forEach(subscription => {
      try {
        // Apply filter if provided
        if (!subscription.filter || subscription.filter(event)) {
          subscription.callback(event);
        }
      } catch (error) {
        logDebug(config, 'Error in event subscription callback', {
          subscriptionId: subscription.id,
          eventType: event.type,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    });
  }, [maxEventHistory, enableDebug, config]);

  // Generic subscription
  const subscribe = useCallback((
    callback: (event: ConversationEvent) => void,
    filter?: (event: ConversationEvent) => boolean
  ) => {
    const subscriptionId = `sub_${nextSubscriptionIdRef.current++}`;
    const subscription: EventSubscription = {
      id: subscriptionId,
      callback,
      filter
    };

    subscriptionsRef.current.set(subscriptionId, subscription);

    if (enableDebug) {
      logDebug(config, 'Event subscription created', {
        subscriptionId,
        hasFilter: !!filter
      });
    }

    // Return unsubscribe function
    return () => {
      subscriptionsRef.current.delete(subscriptionId);
      if (enableDebug) {
        logDebug(config, 'Event subscription removed', { subscriptionId });
      }
    };
  }, [enableDebug, config]);

  // Subscribe to specific event type
  const subscribeToType = useCallback((
    eventType: string,
    callback: (event: ConversationEvent) => void
  ) => {
    return subscribe(callback, (event) => event.type === eventType);
  }, [subscribe]);

  // Subscribe to event types matching pattern
  const subscribeToPattern = useCallback((
    pattern: RegExp,
    callback: (event: ConversationEvent) => void
  ) => {
    return subscribe(callback, (event) => pattern.test(event.type));
  }, [subscribe]);

  // Query events by type
  const getEventsByType = useCallback((eventType: string) => {
    return events.filter(event => event.type === eventType);
  }, [events]);

  // Query events by pattern
  const getEventsByPattern = useCallback((pattern: RegExp) => {
    return events.filter(event => pattern.test(event.type));
  }, [events]);

  // Get recent events
  const getRecentEvents = useCallback((count: number) => {
    return events.slice(-count);
  }, [events]);

  // Clear event history
  const clearEventHistory = useCallback(() => {
    setEvents([]);
    if (enableDebug) {
      logDebug(config, 'Event history cleared');
    }
  }, [enableDebug, config]);

  // Event statistics
  const eventStats = useMemo(() => {
    const eventsByType: Record<string, number> = {};
    let lastEventTime: Date | null = null;

    events.forEach(event => {
      // Count by type
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;

      // Track latest timestamp
      if (!lastEventTime || event.timestamp > lastEventTime) {
        lastEventTime = event.timestamp;
      }
    });

    return {
      totalEvents: events.length,
      eventsByType,
      lastEventTime
    };
  }, [events]);

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      subscriptionsRef.current.clear();
    };
  }, []);

  return {
    emitEvent,
    subscribe,
    subscribeToType,
    subscribeToPattern,
    events,
    getEventsByType,
    getEventsByPattern,
    getRecentEvents,
    clearEventHistory,
    eventStats
  };
};

// Hook for event logging and debugging
export interface EventLoggingOptions {
  logAllEvents?: boolean;
  logPatterns?: RegExp[];
  logTypes?: string[];
  maxLogEntries?: number;
}

export const useEventLogging = (
  events: ConversationEventsResult,
  options: EventLoggingOptions = {}
) => {
  const { logAllEvents = false, logPatterns = [], logTypes = [], maxLogEntries = 50 } = options;
  const [logEntries, setLogEntries] = useState<Array<{
    timestamp: Date;
    event: ConversationEvent;
    level: 'info' | 'warn' | 'error' | 'debug';
  }>>([]);

  // Subscribe to events for logging
  useEffect(() => {
    if (!logAllEvents && logPatterns.length === 0 && logTypes.length === 0) {
      return;
    }

    const unsubscribe = events.subscribe((event) => {
      let shouldLog = logAllEvents;

      if (!shouldLog) {
        // Check if event type matches
        shouldLog = logTypes.includes(event.type);
      }

      if (!shouldLog) {
        // Check if event type matches patterns
        shouldLog = logPatterns.some(pattern => pattern.test(event.type));
      }

      if (shouldLog) {
        const level = event.type.includes('error') ? 'error' :
                     event.type.includes('warning') ? 'warn' :
                     event.type.includes('debug') ? 'debug' : 'info';

        setLogEntries(prev => {
          const newEntries = [...prev, {
            timestamp: new Date(),
            event,
            level
          }];

          // Limit log entries
          if (newEntries.length > maxLogEntries) {
            newEntries.splice(0, newEntries.length - maxLogEntries);
          }

          return newEntries;
        });
      }
    });

    return unsubscribe;
  }, [events, logAllEvents, logPatterns, logTypes, maxLogEntries]);

  const clearLogs = useCallback(() => {
    setLogEntries([]);
  }, []);

  const getLogsByLevel = useCallback((level: 'info' | 'warn' | 'error' | 'debug') => {
    return logEntries.filter(entry => entry.level === level);
  }, [logEntries]);

  return {
    logEntries,
    clearLogs,
    getLogsByLevel,
    errorCount: logEntries.filter(e => e.level === 'error').length,
    warnCount: logEntries.filter(e => e.level === 'warn').length
  };
};

// Hook for event counters and metrics
export interface EventMetricsOptions {
  trackTypes?: string[];
  trackPatterns?: RegExp[];
}

export const useEventMetrics = (
  events: ConversationEventsResult,
  options: EventMetricsOptions = {}
) => {
  const { trackTypes = [], trackPatterns = [] } = options;
  const [counters, setCounters] = useState<Record<string, number>>({});

  // Subscribe to events for counting
  useEffect(() => {
    if (trackTypes.length === 0 && trackPatterns.length === 0) {
      return;
    }

    const unsubscribe = events.subscribe((event) => {
      let shouldCount = false;
      let counterKey = '';

      // Check specific types
      if (trackTypes.includes(event.type)) {
        shouldCount = true;
        counterKey = event.type;
      }

      // Check patterns
      if (!shouldCount) {
        for (const pattern of trackPatterns) {
          if (pattern.test(event.type)) {
            shouldCount = true;
            counterKey = pattern.toString();
            break;
          }
        }
      }

      if (shouldCount && counterKey) {
        setCounters(prev => ({
          ...prev,
          [counterKey]: (prev[counterKey] || 0) + 1
        }));
      }
    });

    return unsubscribe;
  }, [events, trackTypes, trackPatterns]);

  const resetCounters = useCallback(() => {
    setCounters({});
  }, []);

  const getCounter = useCallback((key: string) => {
    return counters[key] || 0;
  }, [counters]);

  return {
    counters,
    resetCounters,
    getCounter,
    totalTrackedEvents: Object.values(counters).reduce((sum, count) => sum + count, 0)
  };
};