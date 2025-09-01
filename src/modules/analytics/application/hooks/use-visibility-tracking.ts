'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { EventProperties } from '../../domain/entities/event';

/**
 * Visibility Tracking Hook
 *
 * Specialized hook for tracking element visibility and page visibility changes
 * Handles intersection observer, page visibility API, and time-based visibility metrics
 */

interface VisibilityState {
  isPageVisible: boolean;
  pageVisibilityTime: number;
  pageHiddenTime: number;
  totalVisibleTime: number;
  visibilityChanges: number;
  visibleElements: Set<string>;
  elementVisibilityTimes: Record<string, number>;
  lastVisibilityChange: number;
}

interface ElementVisibilityEntry {
  elementId: string;
  isVisible: boolean;
  intersectionRatio: number;
  boundingRect: DOMRect;
  timestamp: number;
}

interface VisibilityTrackingConfig {
  enabled?: boolean;
  trackPageVisibility?: boolean;
  trackElementVisibility?: boolean;
  visibilityThreshold?: number;
  rootMargin?: string;
  debounceMs?: number;
}

interface VisibilityTrackingHookReturn {
  // Core visibility tracking functions
  trackElementVisibility: (elementId: string, isVisible: boolean, additionalData?: Record<string, any>) => Promise<void>;
  trackPageVisibility: (isVisible: boolean) => Promise<void>;
  observeElement: (element: Element, elementId: string) => void;
  unobserveElement: (element: Element) => void;

  // State accessors
  visibilityState: VisibilityState;

  // Utilities
  getElementVisibilityDuration: (elementId: string) => number;
  getTotalPageVisibleTime: () => number;
  getVisibilityMetrics: () => Record<string, any>;

  // Configuration
  updateConfig: (newConfig: Partial<VisibilityTrackingConfig>) => void;
  setEnabled: (enabled: boolean) => void;
}

const useVisibilityTracking = (
  trackCustomFn: (eventName: string, properties?: EventProperties) => Promise<void>,
  config: VisibilityTrackingConfig = {}
): VisibilityTrackingHookReturn => {
  const {
    enabled = true,
    trackPageVisibility = true,
    trackElementVisibility = true,
    visibilityThreshold = 0.1,
    rootMargin = '0px',
    debounceMs = 100,
  } = config;

  const [isEnabled, setIsEnabled] = useState(enabled);
  const [currentConfig, setCurrentConfig] = useState(config);
  const [visibilityState, setVisibilityState] = useState<VisibilityState>(() => ({
    isPageVisible: typeof document !== 'undefined' ? !document.hidden : true,
    pageVisibilityTime: Date.now(),
    pageHiddenTime: 0,
    totalVisibleTime: 0,
    visibilityChanges: 0,
    visibleElements: new Set<string>(),
    elementVisibilityTimes: {},
    lastVisibilityChange: Date.now(),
  }));

  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  const visibilityTimersRef = useRef<Record<string, number>>({});
  const pageVisibilityStartTimeRef = useRef(Date.now());

  // Track element visibility
  const trackElementVisibility = useCallback(async (
    elementId: string,
    isVisible: boolean,
    additionalData?: Record<string, any>
  ): Promise<void> => {
    if (!trackCustomFn) return;

    const now = Date.now();

    // Update visibility state
    setVisibilityState(prev => {
      const newVisibleElements = new Set(prev.visibleElements);
      const newElementVisibilityTimes = { ...prev.elementVisibilityTimes };

      if (isVisible) {
        newVisibleElements.add(elementId);
        visibilityTimersRef.current[elementId] = now;
      } else {
        newVisibleElements.delete(elementId);
        if (visibilityTimersRef.current[elementId]) {
          const visibleDuration = now - visibilityTimersRef.current[elementId];
          newElementVisibilityTimes[elementId] =
            (prev.elementVisibilityTimes[elementId] || 0) + visibleDuration;
          delete visibilityTimersRef.current[elementId];
        }
      }

      return {
        ...prev,
        visibleElements: newVisibleElements,
        elementVisibilityTimes: newElementVisibilityTimes,
        lastVisibilityChange: now,
      };
    });

    const properties: EventProperties = {
      element_id: elementId,
      is_visible: isVisible,
      timestamp: new Date().toISOString(),
      visibility_change_time: now,
      total_visible_elements: visibilityState.visibleElements.size,
      ...additionalData,
    };

    // Add element visibility duration if hiding
    if (!isVisible && visibilityTimersRef.current[elementId]) {
      const visibilityDuration = now - visibilityTimersRef.current[elementId];
      properties.visibility_duration_ms = visibilityDuration;
      properties.visibility_duration_seconds = Math.round(visibilityDuration / 1000);
    }

    await trackCustomFn('element_visibility', properties);
  }, [trackElementVisibility, trackCustomFn, visibilityState.visibleElements.size]);

  // Track page visibility
  const trackPageVisibility = useCallback(async (isVisible: boolean): Promise<void> => {
    if (!trackPageVisibility) return;

    const now = Date.now();

    setVisibilityState(prev => {
      let newTotalVisibleTime = prev.totalVisibleTime;

      if (!isVisible && prev.isPageVisible) {
        // Page is becoming hidden
        newTotalVisibleTime += now - pageVisibilityStartTimeRef.current;
      }

      if (isVisible && !prev.isPageVisible) {
        // Page is becoming visible
        pageVisibilityStartTimeRef.current = now;
      }

      return {
        ...prev,
        isPageVisible: isVisible,
        pageVisibilityTime: isVisible ? now : prev.pageVisibilityTime,
        pageHiddenTime: !isVisible ? now : prev.pageHiddenTime,
        totalVisibleTime: newTotalVisibleTime,
        visibilityChanges: prev.visibilityChanges + 1,
        lastVisibilityChange: now,
      };
    });

    const properties: EventProperties = {
      page_visible: isVisible,
      timestamp: new Date().toISOString(),
      visibility_changes_count: visibilityState.visibilityChanges,
      total_visible_time_ms: visibilityState.totalVisibleTime,
      total_visible_time_seconds: Math.round(visibilityState.totalVisibleTime / 1000),
    };

    // Add session duration if page is becoming hidden
    if (!isVisible) {
      const sessionDuration = now - pageVisibilityStartTimeRef.current;
      properties.session_duration_ms = sessionDuration;
      properties.session_duration_seconds = Math.round(sessionDuration / 1000);
    }

    await trackCustomFn('page_visibility', properties);
  }, [trackPageVisibility, trackCustomFn, visibilityState.visibilityChanges, visibilityState.totalVisibleTime]);

  // Initialize intersection observer
  useEffect(() => {
    if (!isEnabled || !trackElementVisibility || typeof window === 'undefined') return;

    const observerOptions: IntersectionObserverInit = {
      threshold: visibilityThreshold,
      rootMargin,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        const elementId = entry.target.getAttribute('data-visibility-id') ||
                         entry.target.id ||
                         entry.target.className ||
                         'unknown-element';

        const isVisible = entry.isIntersecting;
        const additionalData = {
          intersection_ratio: entry.intersectionRatio,
          bounding_rect_top: entry.boundingClientRect.top,
          bounding_rect_left: entry.boundingClientRect.left,
          bounding_rect_width: entry.boundingClientRect.width,
          bounding_rect_height: entry.boundingClientRect.height,
          root_bounds_width: entry.rootBounds?.width || 0,
          root_bounds_height: entry.rootBounds?.height || 0,
        };

        trackElementVisibility(elementId, isVisible, additionalData);
      });
    };

    intersectionObserverRef.current = new IntersectionObserver(handleIntersection, observerOptions);

    return () => {
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect();
        intersectionObserverRef.current = null;
      }
    };
  }, [isEnabled, trackElementVisibility, visibilityThreshold, rootMargin, trackElementVisibility]);

  // Handle page visibility changes
  useEffect(() => {
    if (!isEnabled || !trackPageVisibility || typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      trackPageVisibility(isVisible);
    };

    // Initial page visibility check
    trackPageVisibility(!document.hidden);

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Also track focus/blur events as fallback
    window.addEventListener('focus', () => trackPageVisibility(true));
    window.addEventListener('blur', () => trackPageVisibility(false));

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', () => trackPageVisibility(true));
      window.removeEventListener('blur', () => trackPageVisibility(false));
    };
  }, [isEnabled, trackPageVisibility, trackPageVisibility]);

  // Observe element for visibility tracking
  const observeElement = useCallback((element: Element, elementId: string) => {
    if (!intersectionObserverRef.current || !isEnabled) return;

    // Set data attribute for identification
    element.setAttribute('data-visibility-id', elementId);
    intersectionObserverRef.current.observe(element);
  }, [isEnabled]);

  // Stop observing element
  const unobserveElement = useCallback((element: Element) => {
    if (!intersectionObserverRef.current) return;

    intersectionObserverRef.current.unobserve(element);

    // Clean up visibility timer if exists
    const elementId = element.getAttribute('data-visibility-id');
    if (elementId && visibilityTimersRef.current[elementId]) {
      delete visibilityTimersRef.current[elementId];
    }
  }, []);

  // Get element visibility duration
  const getElementVisibilityDuration = useCallback((elementId: string): number => {
    let totalDuration = visibilityState.elementVisibilityTimes[elementId] || 0;

    // Add current session duration if element is currently visible
    if (visibilityState.visibleElements.has(elementId) && visibilityTimersRef.current[elementId]) {
      totalDuration += Date.now() - visibilityTimersRef.current[elementId];
    }

    return totalDuration;
  }, [visibilityState.elementVisibilityTimes, visibilityState.visibleElements]);

  // Get total page visible time
  const getTotalPageVisibleTime = useCallback((): number => {
    let totalTime = visibilityState.totalVisibleTime;

    // Add current session if page is currently visible
    if (visibilityState.isPageVisible) {
      totalTime += Date.now() - pageVisibilityStartTimeRef.current;
    }

    return totalTime;
  }, [visibilityState.totalVisibleTime, visibilityState.isPageVisible]);

  // Get comprehensive visibility metrics
  const getVisibilityMetrics = useCallback((): Record<string, any> => {
    const elementMetrics: Record<string, number> = {};
    visibilityState.visibleElements.forEach(elementId => {
      elementMetrics[`element_${elementId}_duration`] = getElementVisibilityDuration(elementId);
    });

    return {
      page_visible: visibilityState.isPageVisible,
      total_page_visible_time: getTotalPageVisibleTime(),
      visibility_changes: visibilityState.visibilityChanges,
      currently_visible_elements: visibilityState.visibleElements.size,
      tracked_elements_count: Object.keys(visibilityState.elementVisibilityTimes).length,
      ...elementMetrics,
    };
  }, [visibilityState.isPageVisible, visibilityState.visibilityChanges, visibilityState.visibleElements.size, visibilityState.elementVisibilityTimes, getTotalPageVisibleTime, getElementVisibilityDuration]);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<VisibilityTrackingConfig>) => {
    setCurrentConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  // Set enabled state
  const setEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
  }, []);

  return {
    // Core visibility tracking functions
    trackElementVisibility,
    trackPageVisibility,
    observeElement,
    unobserveElement,

    // State accessors
    visibilityState,

    // Utilities
    getElementVisibilityDuration,
    getTotalPageVisibleTime,
    getVisibilityMetrics,

    // Configuration
    updateConfig,
    setEnabled,
  };
};

export default useVisibilityTracking;