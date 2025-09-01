'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';

import { ConsentLevel } from '../../domain/types';
import { createBrowserTrackingService } from '../../infra/adapters/browser-tracking-service';
// Import specialized hooks
import useEventTracking from '../hooks/use-event-tracking';
import useFormAnalytics from '../hooks/use-form-analytics';
import usePageViewTracking from '../hooks/use-page-view-tracking';
import useScrollTracking from '../hooks/use-scroll-tracking';
import useVisibilityTracking from '../hooks/use-visibility-tracking';
import { TrackingService } from '../ports/tracking-service';

/**
 * Analytics Context Provider
 *
 * Clean context provider following separation of concerns
 * Composes all specialized tracking hooks into unified interface
 */

// Combined analytics interface from all specialized hooks
interface AnalyticsContextValue {
  // Event tracking capabilities
  eventTracking: ReturnType<typeof useEventTracking>;

  // Page view tracking capabilities
  pageTracking: ReturnType<typeof usePageViewTracking>;

  // Scroll tracking capabilities
  scrollTracking: ReturnType<typeof useScrollTracking>;

  // Visibility tracking capabilities
  visibilityTracking: ReturnType<typeof useVisibilityTracking>;

  // Form factory function (creates form-specific hook instances)
  createFormTracker: (formName: string) => ReturnType<typeof useFormAnalytics>;

  // Service state
  isInitialized: boolean;
  trackingService: TrackingService | null;
}

interface AnalyticsProviderProps {
  children: React.ReactNode;
  userId?: string;
  enableAutoTracking?: boolean;
  consentLevel?: ConsentLevel;
  config?: {
    sessionTimeout?: number;
    batchSize?: number;
    flushInterval?: number;
    enableLocalStorage?: boolean;
    scrollThresholds?: number[];
    visibilityThreshold?: number;
  };
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export function AnalyticsProvider({
  children,
  userId,
  enableAutoTracking = true,
  consentLevel = 'analytics',
  config = {},
}: AnalyticsProviderProps) {
  const trackingService = useRef<TrackingService | null>(null);
  const isInitialized = useRef(false);

  // Initialize all specialized hooks
  const eventTracking = useEventTracking({
    enableAutoTracking,
    consentLevel,
    batchSize: config.batchSize,
    flushInterval: config.flushInterval,
  });

  const pageTracking = usePageViewTracking(
    eventTracking.trackEvent,
    {
      enableAutoPageViews: enableAutoTracking,
      trackNavigationTiming: true,
      trackReferrer: true,
    }
  );

  const scrollTracking = useScrollTracking(
    eventTracking.trackCustom,
    {
      thresholds: config.scrollThresholds || [25, 50, 75, 100],
      enabled: enableAutoTracking,
      trackScrollVelocity: true,
      trackScrollDirection: true,
      trackMaxScroll: true,
    }
  );

  const visibilityTracking = useVisibilityTracking(
    eventTracking.trackCustom,
    {
      enabled: enableAutoTracking,
      trackPageVisibility: true,
      trackElementVisibility: true,
      visibilityThreshold: config.visibilityThreshold || 0.1,
    }
  );

  // Factory function for creating form trackers
  const createFormTracker = React.useCallback((formName: string) => {
    return useFormAnalytics(
      eventTracking.trackEvent,
      {
        formName,
        trackFieldInteractions: true,
        trackValidationErrors: true,
        trackCompletionTime: true,
        trackFieldValues: false, // Privacy-conscious default
      }
    );
  }, [eventTracking.trackEvent]);

  // Initialize tracking service once
  useEffect(() => {
    if (isInitialized.current) return;

    try {
      // Create browser tracking service
      trackingService.current = createBrowserTrackingService({
        enableAutoTracking,
        sessionTimeout: config.sessionTimeout,
        batchSize: config.batchSize,
        flushInterval: config.flushInterval,
        enableLocalStorage: config.enableLocalStorage,
      });

      // Initialize event tracking with the service
      eventTracking.initializeService(trackingService.current);

      // Set initial configuration
      if (userId) {
        trackingService.current.setContext({ userId });
      }

      trackingService.current.setConsentLevel(consentLevel);
      isInitialized.current = true;

      // Clean up on unmount
      return () => {
        trackingService.current?.destroy();
        isInitialized.current = false;
      };
    } catch (error) {
      console.warn('Failed to initialize analytics tracking service:', error);
    }
  }, [enableAutoTracking, consentLevel, config, eventTracking, userId]);

  // Update user ID when it changes
  useEffect(() => {
    if (trackingService.current && userId && isInitialized.current) {
      trackingService.current.setContext({ userId });
    }
  }, [userId]);

  // Update consent level when it changes
  useEffect(() => {
    if (trackingService.current && isInitialized.current) {
      trackingService.current.setConsentLevel(consentLevel);
      eventTracking.setConsentLevel(consentLevel);
    }
  }, [consentLevel, eventTracking]);

  const contextValue: AnalyticsContextValue = {
    eventTracking,
    pageTracking,
    scrollTracking,
    visibilityTracking,
    createFormTracker,
    isInitialized: isInitialized.current,
    trackingService: trackingService.current,
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

/**
 * Hook to access analytics context
 * Provides access to all specialized tracking capabilities
 */
export function useAnalytics(): AnalyticsContextValue {
  const context = useContext(AnalyticsContext);

  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }

  return context;
}

/**
 * Convenience hooks for accessing specific tracking capabilities
 */

// Access event tracking functionality
export function useEventAnalytics() {
  const { eventTracking } = useAnalytics();
  return eventTracking;
}

// Access page view tracking functionality
export function usePageAnalytics() {
  const { pageTracking } = useAnalytics();
  return pageTracking;
}

// Access scroll tracking functionality
export function useScrollAnalytics() {
  const { scrollTracking } = useAnalytics();
  return scrollTracking;
}

// Access visibility tracking functionality
export function useVisibilityAnalytics() {
  const { visibilityTracking } = useAnalytics();
  return visibilityTracking;
}

// Create form-specific analytics tracker
export function useFormAnalytics(formName: string) {
  const { createFormTracker } = useAnalytics();
  return React.useMemo(() => createFormTracker(formName), [createFormTracker, formName]);
}

export default AnalyticsProvider;