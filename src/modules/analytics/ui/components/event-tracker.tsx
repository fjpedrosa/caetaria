'use client';

import React, { useEffect } from 'react';

// Import the new clean analytics provider and hooks
import {
  AnalyticsProvider,
  useAnalytics,
  useEventAnalytics,
  useFormAnalytics,
  usePageAnalytics,
  useScrollAnalytics,
  useVisibilityAnalytics,
} from '../../application/providers/analytics-context';
// Import specialized hook types
import type {
  ConsentLevel,
  ScrollDepthTrackerProps,
  TimeOnPageTrackerProps,
  VisibilityTrackerProps,
} from '../../domain/types';

/**
 * Event Tracker - Refactored with Clean Architecture
 *
 * Now serves as a composition layer over specialized tracking hooks
 * All business logic moved to application layer hooks
 * Pure presentational component following separation of concerns
 */

// Legacy interface for backward compatibility
interface EventTrackerContextType {
  trackEvent: (type: any, name: string, properties?: Record<string, any>) => Promise<void>;
  trackPageView: (url?: string, title?: string) => Promise<void>;
  trackClick: (element: string, properties?: Record<string, any>) => Promise<void>;
  trackFormSubmit: (formName: string, properties?: Record<string, any>) => Promise<void>;
  trackCustom: (eventName: string, properties?: Record<string, any>) => Promise<void>;
  setUserId: (userId: string) => void;
  setTrackingEnabled: (enabled: boolean) => void;
  setConsentLevel: (level: ConsentLevel) => void;
}

interface EventTrackerProviderProps {
  children: React.ReactNode;
  userId?: string;
  enableAutoTracking?: boolean;
  consentLevel?: ConsentLevel;
  config?: {
    sessionTimeout?: number;
    batchSize?: number;
    flushInterval?: number;
    enableLocalStorage?: boolean;
  };
}

// Legacy context for backward compatibility (deprecated)
const EventTrackerContext = React.createContext<EventTrackerContextType | null>(null);

/**
 * New EventTrackerProvider - Clean Architecture Implementation
 *
 * Uses the new AnalyticsProvider internally with backward compatibility
 */
export function EventTrackerProvider({
  children,
  userId,
  enableAutoTracking = true,
  consentLevel = 'analytics',
  config,
}: EventTrackerProviderProps) {
  return (
    <AnalyticsProvider
      userId={userId}
      enableAutoTracking={enableAutoTracking}
      consentLevel={consentLevel}
      config={config}
    >
      <LegacyContextBridge>
        {children}
      </LegacyContextBridge>
    </AnalyticsProvider>
  );
}

/**
 * Legacy Context Bridge
 *
 * Provides backward compatibility by bridging new hooks to old context interface
 */
function LegacyContextBridge({ children }: { children: React.ReactNode }) {
  const { eventTracking, pageTracking } = useAnalytics();

  // Create legacy interface from new specialized hooks
  const legacyContextValue: EventTrackerContextType = React.useMemo(() => ({
    trackEvent: eventTracking.trackEvent,
    trackPageView: pageTracking.trackPageView,
    trackClick: async (element: string, properties?: Record<string, any>) => {
      await eventTracking.trackCustom('click', {
        element,
        timestamp: new Date().toISOString(),
        ...properties,
      });
    },
    trackFormSubmit: async (formName: string, properties?: Record<string, any>) => {
      await eventTracking.trackCustom('form_submit', {
        form_name: formName,
        timestamp: new Date().toISOString(),
        ...properties,
      });
    },
    trackCustom: eventTracking.trackCustom,
    setUserId: (userId: string) => {
      // This would be handled at the provider level in new architecture
      console.warn('setUserId: Use AnalyticsProvider userId prop instead');
    },
    setTrackingEnabled: eventTracking.setTrackingEnabled,
    setConsentLevel: eventTracking.setConsentLevel,
  }), [eventTracking, pageTracking]);

  return (
    <EventTrackerContext.Provider value={legacyContextValue}>
      {children}
    </EventTrackerContext.Provider>
  );
}

/**
 * Legacy useEventTracker hook
 *
 * Provides backward compatibility while encouraging migration to new hooks
 * @deprecated Use useEventAnalytics, usePageAnalytics, etc. instead
 */
export function useEventTracker(): EventTrackerContextType {
  const context = React.useContext(EventTrackerContext);
  if (!context) {
    throw new Error('useEventTracker must be used within an EventTrackerProvider');
  }
  return context;
}

/**
 * Higher-order component for automatic page view tracking
 *
 * Refactored to use new page analytics hook
 */
export function withPageViewTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: {
    trackOnMount?: boolean;
    customPageName?: string;
  }
) {
  const { trackOnMount = true, customPageName } = options || {};

  return function TrackedComponent(props: P) {
    const { trackPageView } = usePageAnalytics();

    useEffect(() => {
      if (trackOnMount) {
        const pageName = customPageName || WrappedComponent.displayName || WrappedComponent.name;
        trackPageView(undefined, pageName);
      }
    }, [trackPageView]);

    return <WrappedComponent {...props} />;
  };
}

/**
 * Hook for automatic click tracking
 *
 * Refactored to use new event analytics hook
 */
export function useClickTracking(elementName: string, enabled: boolean = true) {
  const { trackCustom } = useEventAnalytics();

  return React.useCallback(
    (event: React.MouseEvent, additionalProperties?: Record<string, any>) => {
      if (enabled) {
        trackCustom('click', {
          element: elementName,
          target: event.currentTarget.tagName,
          timestamp: new Date().toISOString(),
          ...additionalProperties,
        });
      }
    },
    [trackCustom, elementName, enabled]
  );
}

/**
 * Hook for form submission tracking
 *
 * Refactored to use new form analytics hook with enhanced capabilities
 */
export function useFormTracking(formName: string) {
  const formTracker = useFormAnalytics(formName);

  return React.useCallback(
    (formData?: Record<string, any>) => {
      // Use the new form tracker's comprehensive submit tracking
      formTracker.trackFormSubmit(formData);
    },
    [formTracker]
  );
}

/**
 * Component for tracking scroll depth
 *
 * Refactored to use specialized scroll tracking hook
 */
export function ScrollDepthTracker({
  thresholds = [25, 50, 75, 100],
  enabled = true
}: ScrollDepthTrackerProps) {
  const scrollTracker = useScrollAnalytics();

  useEffect(() => {
    // Update scroll tracking configuration
    scrollTracker.updateThresholds(thresholds);
    scrollTracker.setEnabled(enabled);
  }, [thresholds, enabled, scrollTracker]);

  // The new hook handles all scroll tracking logic internally
  // This component now just manages configuration
  return null;
}

/**
 * Component for tracking time on page
 *
 * Refactored to use visibility tracking hook which includes time-based metrics
 */
export function TimeOnPageTracker({
  intervals = [30, 60, 120, 300], // seconds
  enabled = true
}: TimeOnPageTrackerProps) {
  const visibilityTracker = useVisibilityAnalytics();
  const { trackCustom } = useEventAnalytics();
  const trackedIntervals = React.useRef(new Set<number>());

  useEffect(() => {
    if (!enabled) return;

    const checkTimeIntervals = () => {
      const totalVisibleTime = Math.floor(visibilityTracker.getTotalPageVisibleTime() / 1000);

      intervals.forEach(interval => {
        if (totalVisibleTime >= interval && !trackedIntervals.current.has(interval)) {
          trackedIntervals.current.add(interval);
          trackCustom('time_on_page', {
            seconds: interval,
            total_visible_time: totalVisibleTime,
            url: typeof window !== 'undefined' ? window.location.href : '',
          });
        }
      });
    };

    const timer = setInterval(checkTimeIntervals, 5000);
    return () => clearInterval(timer);
  }, [intervals, enabled, trackCustom, visibilityTracker]);

  return null;
}

/**
 * Component for tracking visibility changes
 *
 * Refactored to use specialized visibility tracking hook
 */
export function VisibilityTracker({ enabled = true }: VisibilityTrackerProps) {
  const visibilityTracker = useVisibilityAnalytics();

  useEffect(() => {
    // Configure visibility tracking
    visibilityTracker.setEnabled(enabled);
  }, [enabled, visibilityTracker]);

  // The new hook handles all visibility tracking logic internally
  // This component now just manages configuration
  return null;
}

/**
 * New Exports - Modern Analytics Hooks
 *
 * These are the recommended hooks for new implementations
 */

// Re-export the new clean hooks for easy access
export {
  useEventAnalytics,
  useFormAnalytics,
  usePageAnalytics,
  useScrollAnalytics,
  useVisibilityAnalytics,
} from '../../application/providers/analytics-context';

// Re-export the provider for direct use
export { AnalyticsProvider } from '../../application/providers/analytics-context';