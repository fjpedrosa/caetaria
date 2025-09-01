'use client';

import { useCallback, useRef, useState } from 'react';

import { createEvent, Event, EventProperties } from '../../domain/entities/event';
import { ConsentLevel } from '../../domain/types';
import { createCustomEventType,EVENT_TYPES, EventType, EventTypeInterface } from '../../domain/value-objects/event-type';
import { TrackingService } from '../ports/tracking-service';

/**
 * Core Event Tracking Hook
 *
 * Handles basic event tracking functionality with queue management
 * Pure functional implementation following single responsibility principle
 */

interface EventTrackingConfig {
  enableAutoTracking?: boolean;
  consentLevel?: ConsentLevel;
  batchSize?: number;
  flushInterval?: number;
}

interface EventTrackingState {
  isInitialized: boolean;
  trackingEnabled: boolean;
  consentLevel: ConsentLevel;
  eventQueue: Event[];
  lastFlushTime: number;
}

interface EventTrackingHookReturn {
  // Core tracking functions
  trackEvent: (type: EventType | EventTypeInterface, name: string, properties?: EventProperties) => Promise<void>;
  trackCustom: (eventName: string, properties?: EventProperties) => Promise<void>;

  // Service management
  initializeService: (service: TrackingService) => void;
  setTrackingEnabled: (enabled: boolean) => void;
  setConsentLevel: (level: ConsentLevel) => void;

  // State
  trackingState: EventTrackingState;

  // Queue management
  getQueueSize: () => number;
  flushQueue: () => Promise<void>;
}

const initialState: EventTrackingState = {
  isInitialized: false,
  trackingEnabled: true,
  consentLevel: 'analytics',
  eventQueue: [],
  lastFlushTime: Date.now(),
};

export const useEventTracking = (config: EventTrackingConfig = {}): EventTrackingHookReturn => {
  const trackingService = useRef<TrackingService | null>(null);
  const [state, setState] = useState<EventTrackingState>(initialState);

  const {
    enableAutoTracking = true,
    consentLevel = 'analytics',
    batchSize = 10,
    flushInterval = 5000,
  } = config;

  // Initialize tracking service
  const initializeService = useCallback((service: TrackingService) => {
    trackingService.current = service;

    // Set initial configuration
    service.setConsentLevel(consentLevel);
    service.setTrackingEnabled(enableAutoTracking);

    setState(prev => ({
      ...prev,
      isInitialized: true,
      trackingEnabled: enableAutoTracking,
      consentLevel,
    }));
  }, [enableAutoTracking, consentLevel]);

  // Core event tracking function
  const trackEvent = useCallback(async (
    type: EventType | EventTypeInterface,
    name: string,
    properties?: EventProperties
  ): Promise<void> => {
    if (!trackingService.current || !state.isInitialized || !state.trackingEnabled) {
      return;
    }

    try {
      const event = createEvent({
        type,
        name,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
        },
      });

      const enrichedEvent = trackingService.current.enrichEvent(event);

      // Add to queue for batch processing
      setState(prev => ({
        ...prev,
        eventQueue: [...prev.eventQueue, enrichedEvent],
      }));

      // Auto-flush if batch size reached or interval elapsed
      const shouldFlush =
        state.eventQueue.length >= batchSize ||
        (Date.now() - state.lastFlushTime) >= flushInterval;

      if (shouldFlush) {
        await flushQueue();
      }
    } catch (error) {
      console.warn('Failed to track event:', error);
    }
  }, [state.isInitialized, state.trackingEnabled, state.eventQueue.length, state.lastFlushTime, batchSize, flushInterval]);

  // Track custom events
  const trackCustom = useCallback(async (
    eventName: string,
    properties?: EventProperties
  ): Promise<void> => {
    const customEventType = createCustomEventType(eventName);
    await trackEvent(customEventType, eventName, properties);
  }, [trackEvent]);

  // Flush event queue
  const flushQueue = useCallback(async (): Promise<void> => {
    if (!trackingService.current || state.eventQueue.length === 0) {
      return;
    }

    try {
      // Process events in batch
      const eventsToProcess = [...state.eventQueue];

      // Clear queue immediately to prevent duplicates
      setState(prev => ({
        ...prev,
        eventQueue: [],
        lastFlushTime: Date.now(),
      }));

      // Send events to tracking service
      for (const event of eventsToProcess) {
        await trackingService.current.trackEvent(event);
      }
    } catch (error) {
      console.warn('Failed to flush event queue:', error);

      // Re-add failed events to queue for retry
      setState(prev => ({
        ...prev,
        eventQueue: [...prev.eventQueue, ...state.eventQueue],
      }));
    }
  }, [state.eventQueue]);

  // Set tracking enabled state
  const setTrackingEnabled = useCallback((enabled: boolean) => {
    if (trackingService.current) {
      trackingService.current.setTrackingEnabled(enabled);
    }

    setState(prev => ({
      ...prev,
      trackingEnabled: enabled,
    }));
  }, []);

  // Set consent level
  const setConsentLevel = useCallback((level: ConsentLevel) => {
    if (trackingService.current) {
      trackingService.current.setConsentLevel(level);
    }

    setState(prev => ({
      ...prev,
      consentLevel: level,
    }));
  }, []);

  // Get current queue size
  const getQueueSize = useCallback((): number => {
    return state.eventQueue.length;
  }, [state.eventQueue.length]);

  return {
    // Core tracking functions
    trackEvent,
    trackCustom,

    // Service management
    initializeService,
    setTrackingEnabled,
    setConsentLevel,

    // State
    trackingState: state,

    // Queue management
    getQueueSize,
    flushQueue,
  };
};

export default useEventTracking;