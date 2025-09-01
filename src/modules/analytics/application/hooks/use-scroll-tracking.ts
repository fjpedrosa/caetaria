'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { EventProperties } from '../../domain/entities/event';
import { ScrollDepthData } from '../../domain/types';

/**
 * Scroll Depth Tracking Hook
 *
 * Specialized hook for tracking scroll behavior and depth milestones
 * Handles percentage-based and pixel-based scroll tracking
 */

interface ScrollTrackingState {
  currentScrollPosition: number;
  maxScrollPosition: number;
  scrollPercentage: number;
  scrollDirection: 'up' | 'down' | 'none';
  lastScrollTime: number;
  trackedThresholds: Set<number>;
  isScrolling: boolean;
}

interface ScrollTrackingConfig {
  thresholds?: number[];
  enabled?: boolean;
  debounceMs?: number;
  trackScrollVelocity?: boolean;
  trackScrollDirection?: boolean;
  trackMaxScroll?: boolean;
}

interface ScrollTrackingHookReturn {
  // Core scroll tracking functions
  trackScrollMilestone: (percentage: number, additionalData?: Partial<ScrollDepthData>) => Promise<void>;
  trackMaxScrollReached: () => Promise<void>;
  resetTracking: () => void;

  // State accessors
  scrollState: ScrollTrackingState;

  // Configuration
  updateThresholds: (newThresholds: number[]) => void;
  setEnabled: (enabled: boolean) => void;
}

const useScrollTracking = (
  trackCustomFn: (eventName: string, properties?: EventProperties) => Promise<void>,
  config: ScrollTrackingConfig = {}
): ScrollTrackingHookReturn => {
  const {
    thresholds = [25, 50, 75, 100],
    enabled = true,
    debounceMs = 100,
    trackScrollVelocity = true,
    trackScrollDirection = true,
    trackMaxScroll = true,
  } = config;

  const [isEnabled, setIsEnabled] = useState(enabled);
  const [currentThresholds, setCurrentThresholds] = useState(thresholds);
  const [scrollState, setScrollState] = useState<ScrollTrackingState>(() => ({
    currentScrollPosition: 0,
    maxScrollPosition: 0,
    scrollPercentage: 0,
    scrollDirection: 'none',
    lastScrollTime: 0,
    trackedThresholds: new Set<number>(),
    isScrolling: false,
  }));

  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollPositionRef = useRef(0);
  const scrollVelocityRef = useRef(0);

  // Calculate scroll percentage
  const calculateScrollPercentage = useCallback((): number => {
    if (typeof window === 'undefined') return 0;

    const scrollTop = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;

    return documentHeight > 0 ? Math.round((scrollTop / documentHeight) * 100) : 0;
  }, []);

  // Track scroll milestone
  const trackScrollMilestone = useCallback(async (
    percentage: number,
    additionalData?: Partial<ScrollDepthData>
  ): Promise<void> => {
    const scrollData: ScrollDepthData = {
      percentage,
      absolute_position: window.scrollY,
      page_height: document.documentElement.scrollHeight,
      thresholds: currentThresholds,
      ...additionalData,
    };

    const properties: EventProperties = {
      ...scrollData,
      scroll_direction: scrollState.scrollDirection,
      max_scroll_reached: scrollState.maxScrollPosition,
      timestamp: new Date().toISOString(),
    };

    // Add velocity if tracking is enabled
    if (trackScrollVelocity) {
      properties.scroll_velocity = scrollVelocityRef.current;
    }

    // Add timing information
    properties.time_to_milestone = Date.now() - (scrollState.lastScrollTime || Date.now());

    await trackCustomFn('scroll_depth', properties);
  }, [trackCustomFn, currentThresholds, scrollState.scrollDirection, scrollState.maxScrollPosition, scrollState.lastScrollTime, trackScrollVelocity]);

  // Track maximum scroll reached
  const trackMaxScrollReached = useCallback(async (): Promise<void> => {
    const properties: EventProperties = {
      max_scroll_percentage: scrollState.scrollPercentage,
      max_scroll_position: scrollState.maxScrollPosition,
      page_height: document.documentElement.scrollHeight,
      timestamp: new Date().toISOString(),
    };

    await trackCustomFn('max_scroll_reached', properties);
  }, [trackCustomFn, scrollState.scrollPercentage, scrollState.maxScrollPosition]);

  // Reset tracking state
  const resetTracking = useCallback(() => {
    setScrollState(prev => ({
      ...prev,
      trackedThresholds: new Set<number>(),
      maxScrollPosition: 0,
      lastScrollTime: Date.now(),
    }));
  }, []);

  // Update thresholds dynamically
  const updateThresholds = useCallback((newThresholds: number[]) => {
    setCurrentThresholds(newThresholds);
    // Reset tracked thresholds when thresholds change
    setScrollState(prev => ({
      ...prev,
      trackedThresholds: new Set<number>(),
    }));
  }, []);

  // Set enabled state
  const setEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
  }, []);

  // Handle scroll events
  useEffect(() => {
    if (!isEnabled || typeof window === 'undefined') return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const currentTime = Date.now();
      const scrollPercentage = calculateScrollPercentage();

      // Calculate scroll direction
      const direction: 'up' | 'down' | 'none' =
        currentScrollY > lastScrollPositionRef.current ? 'down' :
        currentScrollY < lastScrollPositionRef.current ? 'up' : 'none';

      // Calculate scroll velocity if enabled
      if (trackScrollVelocity && scrollState.lastScrollTime > 0) {
        const timeDiff = currentTime - scrollState.lastScrollTime;
        const positionDiff = Math.abs(currentScrollY - lastScrollPositionRef.current);
        scrollVelocityRef.current = timeDiff > 0 ? positionDiff / timeDiff : 0;
      }

      // Update scroll state
      setScrollState(prev => ({
        ...prev,
        currentScrollPosition: currentScrollY,
        maxScrollPosition: Math.max(prev.maxScrollPosition, currentScrollY),
        scrollPercentage,
        scrollDirection: trackScrollDirection ? direction : prev.scrollDirection,
        lastScrollTime: currentTime,
        isScrolling: true,
      }));

      // Check thresholds and track milestones
      currentThresholds.forEach(threshold => {
        if (scrollPercentage >= threshold && !scrollState.trackedThresholds.has(threshold)) {
          // Add to tracked thresholds immediately to prevent duplicates
          setScrollState(prev => ({
            ...prev,
            trackedThresholds: new Set([...prev.trackedThresholds, threshold]),
          }));

          trackScrollMilestone(threshold);
        }
      });

      // Update last scroll position for direction calculation
      lastScrollPositionRef.current = currentScrollY;

      // Clear previous timeout and set new one for scroll end detection
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setScrollState(prev => ({
          ...prev,
          isScrolling: false,
        }));

        // Track max scroll when scrolling stops (if enabled)
        if (trackMaxScroll && scrollState.maxScrollPosition > 0) {
          trackMaxScrollReached();
        }
      }, 150); // Consider scrolling stopped after 150ms of inactivity
    };

    // Throttled scroll handler
    let ticking = false;
    const throttledScrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScrollHandler, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledScrollHandler);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isEnabled, currentThresholds, scrollState.trackedThresholds, scrollState.lastScrollTime, scrollState.maxScrollPosition, calculateScrollPercentage, trackScrollDirection, trackScrollVelocity, trackMaxScroll, trackScrollMilestone, trackMaxScrollReached]);

  return {
    // Core scroll tracking functions
    trackScrollMilestone,
    trackMaxScrollReached,
    resetTracking,

    // State accessors
    scrollState,

    // Configuration
    updateThresholds,
    setEnabled,
  };
};

export default useScrollTracking;