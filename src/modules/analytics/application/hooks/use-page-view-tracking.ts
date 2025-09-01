'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { EventProperties } from '../../domain/entities/event';
import { createEventType, EVENT_TYPES, EventTypeEnum } from '../../domain/value-objects/event-type';

/**
 * Page View Tracking Hook
 *
 * Specialized hook for page view analytics with navigation detection
 * Handles automatic page view tracking and manual page view events
 */

interface PageViewState {
  currentUrl: string;
  currentTitle: string;
  previousUrl: string | null;
  pageLoadTime: number;
  navigationCount: number;
}

interface PageViewTrackingHookReturn {
  // Core page view functions
  trackPageView: (url?: string, title?: string) => Promise<void>;
  trackNavigation: (fromUrl: string, toUrl: string) => Promise<void>;

  // State accessors
  currentPage: PageViewState;

  // Automatic tracking controls
  enableAutoTracking: (enabled: boolean) => void;
  isAutoTrackingEnabled: boolean;
}

interface PageViewTrackingConfig {
  enableAutoPageViews?: boolean;
  trackNavigationTiming?: boolean;
  trackReferrer?: boolean;
}

const usePageViewTracking = (
  trackEventFn: (type: any, name: string, properties?: EventProperties) => Promise<void>,
  config: PageViewTrackingConfig = {}
): PageViewTrackingHookReturn => {
  const {
    enableAutoPageViews = true,
    trackNavigationTiming = true,
    trackReferrer = true,
  } = config;

  const [isAutoTrackingEnabled, setIsAutoTrackingEnabled] = useState(enableAutoPageViews);
  const [pageState, setPageState] = useState<PageViewState>(() => ({
    currentUrl: typeof window !== 'undefined' ? window.location.href : '',
    currentTitle: typeof document !== 'undefined' ? document.title : '',
    previousUrl: null,
    pageLoadTime: Date.now(),
    navigationCount: 0,
  }));

  const initialPageTracked = useRef(false);

  // Track page view function
  const trackPageView = useCallback(async (url?: string, title?: string): Promise<void> => {
    const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const currentTitle = title || (typeof document !== 'undefined' ? document.title : '');

    // Collect navigation timing if available
    const navigationProperties: EventProperties = {
      url: currentUrl,
      title: currentTitle,
      timestamp: new Date().toISOString(),
      page_load_time: Date.now() - pageState.pageLoadTime,
      navigation_count: pageState.navigationCount,
    };

    // Add referrer information if enabled and available
    if (trackReferrer && typeof document !== 'undefined') {
      navigationProperties.referrer = document.referrer || null;
    }

    // Add navigation timing if enabled and available
    if (trackNavigationTiming && typeof window !== 'undefined' && window.performance) {
      const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        navigationProperties.dom_content_loaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        navigationProperties.page_load_complete = navigation.loadEventEnd - navigation.loadEventStart;
        navigationProperties.dns_lookup_time = navigation.domainLookupEnd - navigation.domainLookupStart;
        navigationProperties.connect_time = navigation.connectEnd - navigation.connectStart;
      }
    }

    // Add viewport information
    if (typeof window !== 'undefined') {
      navigationProperties.viewport_width = window.innerWidth;
      navigationProperties.viewport_height = window.innerHeight;
      navigationProperties.screen_width = window.screen.width;
      navigationProperties.screen_height = window.screen.height;
    }

    // Update state
    setPageState(prev => ({
      ...prev,
      previousUrl: prev.currentUrl,
      currentUrl,
      currentTitle,
      navigationCount: prev.navigationCount + 1,
    }));

    // Track the page view event
    await trackEventFn(EVENT_TYPES.PAGE_VIEW, 'Page View', navigationProperties);
  }, [trackEventFn, trackNavigationTiming, trackReferrer, pageState.pageLoadTime, pageState.navigationCount]);

  // Track navigation between pages
  const trackNavigation = useCallback(async (fromUrl: string, toUrl: string): Promise<void> => {
    const navigationProperties: EventProperties = {
      from_url: fromUrl,
      to_url: toUrl,
      timestamp: new Date().toISOString(),
      navigation_type: 'internal',
    };

    const navigationType = createEventType(EventTypeEnum.ROUTE_CHANGE);
    await trackEventFn(navigationType, 'Navigation', navigationProperties);
  }, [trackEventFn]);

  // Enable/disable automatic tracking
  const enableAutoTracking = useCallback((enabled: boolean) => {
    setIsAutoTrackingEnabled(enabled);
  }, []);

  // Auto-track initial page load
  useEffect(() => {
    if (isAutoTrackingEnabled && !initialPageTracked.current && typeof window !== 'undefined') {
      initialPageTracked.current = true;
      trackPageView();
    }
  }, [isAutoTrackingEnabled, trackPageView]);

  // Auto-track navigation changes (for SPA routing)
  useEffect(() => {
    if (!isAutoTrackingEnabled || typeof window === 'undefined') return;

    const handlePopState = () => {
      const newUrl = window.location.href;
      if (newUrl !== pageState.currentUrl) {
        trackNavigation(pageState.currentUrl, newUrl);
        trackPageView();
      }
    };

    // Listen for browser back/forward navigation
    window.addEventListener('popstate', handlePopState);

    // Listen for programmatic navigation (Next.js router)
    let lastUrl = window.location.href;
    const checkForUrlChange = () => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        trackNavigation(lastUrl, currentUrl);
        trackPageView();
        lastUrl = currentUrl;
      }
    };

    // Poll for URL changes (fallback for SPA navigation)
    const urlChangeInterval = setInterval(checkForUrlChange, 1000);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      clearInterval(urlChangeInterval);
    };
  }, [isAutoTrackingEnabled, pageState.currentUrl, trackNavigation, trackPageView]);

  return {
    // Core page view functions
    trackPageView,
    trackNavigation,

    // State accessors
    currentPage: pageState,

    // Automatic tracking controls
    enableAutoTracking,
    isAutoTrackingEnabled,
  };
};

export default usePageViewTracking;