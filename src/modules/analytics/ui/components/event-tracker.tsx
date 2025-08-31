'use client';

import React, { createContext, useCallback,useContext, useEffect } from 'react';

import { EventEntity, EventProperties } from '../../domain/entities/event';
import { EventType } from '../../domain/value-objects/event-type';
import { BrowserTrackingService } from '../../infra/adapters/browser-tracking-service';

interface EventTrackerContextType {
  trackEvent: (type: EventType, name: string, properties?: EventProperties) => Promise<void>;
  trackPageView: (url?: string, title?: string) => Promise<void>;
  trackClick: (element: string, properties?: EventProperties) => Promise<void>;
  trackFormSubmit: (formName: string, properties?: EventProperties) => Promise<void>;
  trackCustom: (eventName: string, properties?: EventProperties) => Promise<void>;
  setUserId: (userId: string) => void;
  setTrackingEnabled: (enabled: boolean) => void;
  setConsentLevel: (level: 'none' | 'essential' | 'analytics' | 'all') => void;
}

const EventTrackerContext = createContext<EventTrackerContextType | null>(null);

interface EventTrackerProviderProps {
  children: React.ReactNode;
  userId?: string;
  enableAutoTracking?: boolean;
  consentLevel?: 'none' | 'essential' | 'analytics' | 'all';
  config?: {
    sessionTimeout?: number;
    batchSize?: number;
    flushInterval?: number;
    enableLocalStorage?: boolean;
  };
}

export function EventTrackerProvider({
  children,
  userId,
  enableAutoTracking = true,
  consentLevel = 'analytics',
  config,
}: EventTrackerProviderProps) {
  const trackingService = React.useRef<BrowserTrackingService | null>(null);

  useEffect(() => {
    // Initialize tracking service
    trackingService.current = new BrowserTrackingService({
      enableAutoTracking,
      ...config,
    });

    // Set initial consent level
    trackingService.current.setConsentLevel(consentLevel);

    // Set user ID if provided
    if (userId) {
      trackingService.current.setContext({ userId });
    }

    // Cleanup on unmount
    return () => {
      trackingService.current?.destroy();
    };
  }, [enableAutoTracking, consentLevel, config]);

  useEffect(() => {
    // Update user ID when it changes
    if (trackingService.current && userId) {
      trackingService.current.setContext({ userId });
    }
  }, [userId]);

  const trackEvent = useCallback(async (type: EventType, name: string, properties?: EventProperties) => {
    if (!trackingService.current) return;

    const event = EventEntity.create({
      type,
      name,
      properties,
    });

    const enrichedEvent = trackingService.current.enrichEvent(event);
    await trackingService.current.trackEvent(enrichedEvent);
  }, []);

  const trackPageView = useCallback(async (url?: string, title?: string) => {
    if (!trackingService.current) return;

    const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const currentTitle = title || (typeof document !== 'undefined' ? document.title : '');

    await trackEvent(EventType.PAGE_VIEW, 'Page View', {
      url: currentUrl,
      title: currentTitle,
      timestamp: new Date().toISOString(),
    });
  }, [trackEvent]);

  const trackClick = useCallback(async (element: string, properties?: EventProperties) => {
    await trackEvent(EventType.CLICK, 'Click', {
      element,
      timestamp: new Date().toISOString(),
      ...properties,
    });
  }, [trackEvent]);

  const trackFormSubmit = useCallback(async (formName: string, properties?: EventProperties) => {
    await trackEvent(EventType.FORM_SUBMIT, 'Form Submit', {
      form_name: formName,
      timestamp: new Date().toISOString(),
      ...properties,
    });
  }, [trackEvent]);

  const trackCustom = useCallback(async (eventName: string, properties?: EventProperties) => {
    const customEventType = EventType.createCustom(eventName);
    await trackEvent(customEventType, eventName, {
      timestamp: new Date().toISOString(),
      ...properties,
    });
  }, [trackEvent]);

  const setUserId = useCallback((userId: string) => {
    if (trackingService.current) {
      trackingService.current.setContext({ userId });
    }
  }, []);

  const setTrackingEnabled = useCallback((enabled: boolean) => {
    if (trackingService.current) {
      trackingService.current.setTrackingEnabled(enabled);
    }
  }, []);

  const setConsentLevel = useCallback((level: 'none' | 'essential' | 'analytics' | 'all') => {
    if (trackingService.current) {
      trackingService.current.setConsentLevel(level);
    }
  }, []);

  const contextValue: EventTrackerContextType = {
    trackEvent,
    trackPageView,
    trackClick,
    trackFormSubmit,
    trackCustom,
    setUserId,
    setTrackingEnabled,
    setConsentLevel,
  };

  return (
    <EventTrackerContext.Provider value={contextValue}>
      {children}
    </EventTrackerContext.Provider>
  );
}

export function useEventTracker(): EventTrackerContextType {
  const context = useContext(EventTrackerContext);
  if (!context) {
    throw new Error('useEventTracker must be used within an EventTrackerProvider');
  }
  return context;
}

// Higher-order component for automatic page view tracking
export function withPageViewTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: {
    trackOnMount?: boolean;
    customPageName?: string;
  }
) {
  const { trackOnMount = true, customPageName } = options || {};

  return function TrackedComponent(props: P) {
    const { trackPageView } = useEventTracker();

    useEffect(() => {
      if (trackOnMount) {
        const pageName = customPageName || WrappedComponent.displayName || WrappedComponent.name;
        trackPageView(undefined, pageName);
      }
    }, [trackPageView]);

    return <WrappedComponent {...props} />;
  };
}

// Hook for automatic click tracking
export function useClickTracking(elementName: string, enabled: boolean = true) {
  const { trackClick } = useEventTracker();

  return useCallback(
    (event: React.MouseEvent, additionalProperties?: EventProperties) => {
      if (enabled) {
        trackClick(elementName, {
          target: event.currentTarget.tagName,
          ...additionalProperties,
        });
      }
    },
    [trackClick, elementName, enabled]
  );
}

// Hook for form submission tracking
export function useFormTracking(formName: string) {
  const { trackFormSubmit } = useEventTracker();

  return useCallback(
    (formData?: Record<string, any>) => {
      const properties: Record<string, string | number | boolean | Date | null> = {
        form_fields: formData ? Object.keys(formData).length : 0,
      };

      // Add non-sensitive form data
      if (formData) {
        Object.entries(formData).forEach(([key, value]) => {
          // Only track non-sensitive field metadata
          if (typeof value === 'string' && !key.toLowerCase().includes('password')) {
            properties[`field_${key}_length`] = value.length;
            properties[`field_${key}_filled`] = value.length > 0;
          }
        });
      }

      trackFormSubmit(formName, properties);
    },
    [trackFormSubmit, formName]
  );
}

// Component for tracking scroll depth
export function ScrollDepthTracker({
  thresholds = [25, 50, 75, 100],
  enabled = true
}: {
  thresholds?: number[];
  enabled?: boolean;
}) {
  const { trackCustom } = useEventTracker();
  const trackedThresholds = React.useRef(new Set<number>());

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrollPercentage = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );

      thresholds.forEach(threshold => {
        if (scrollPercentage >= threshold && !trackedThresholds.current.has(threshold)) {
          trackedThresholds.current.add(threshold);
          trackCustom('scroll_depth', {
            percentage: threshold,
            absolute_position: window.scrollY,
            page_height: document.documentElement.scrollHeight,
          });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [thresholds, enabled, trackCustom]);

  return null;
}

// Component for tracking time on page
export function TimeOnPageTracker({
  intervals = [30, 60, 120, 300], // seconds
  enabled = true
}: {
  intervals?: number[];
  enabled?: boolean;
}) {
  const { trackCustom } = useEventTracker();
  const startTime = React.useRef(Date.now());
  const trackedIntervals = React.useRef(new Set<number>());

  useEffect(() => {
    if (!enabled) return;

    const checkTimeIntervals = () => {
      const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);

      intervals.forEach(interval => {
        if (timeSpent >= interval && !trackedIntervals.current.has(interval)) {
          trackedIntervals.current.add(interval);
          trackCustom('time_on_page', {
            seconds: interval,
            url: typeof window !== 'undefined' ? window.location.href : '',
          });
        }
      });
    };

    const timer = setInterval(checkTimeIntervals, 5000); // Check every 5 seconds
    return () => clearInterval(timer);
  }, [intervals, enabled, trackCustom]);

  return null;
}

// Component for tracking visibility changes
export function VisibilityTracker({ enabled = true }: { enabled?: boolean }) {
  const { trackCustom } = useEventTracker();

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      trackCustom('page_visibility', {
        visible: !document.hidden,
        timestamp: new Date().toISOString(),
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, trackCustom]);

  return null;
}