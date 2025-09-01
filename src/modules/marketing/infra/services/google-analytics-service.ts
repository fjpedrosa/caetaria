/**
 * Google Analytics Service - Functional Implementation
 * Infrastructure layer - Google Analytics implementation using functional approach
 */

import { AnalyticsEvent, AnalyticsService, LeadAnalyticsData } from '../../application/ports/analytics-service';

// Google Analytics gtag would be available globally
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// =============================================================================
// CONFIGURATION TYPES - For dependency injection
// =============================================================================

export interface GoogleAnalyticsConfig {
  measurementId: string;
  debug: boolean;
}

export interface MockAnalyticsState {
  events: AnalyticsEvent[];
}

// =============================================================================
// GOOGLE ANALYTICS FUNCTIONAL IMPLEMENTATION
// =============================================================================

/**
 * Track an analytics event through Google Analytics
 */
const trackEvent = async (config: GoogleAnalyticsConfig, event: AnalyticsEvent): Promise<void> => {
  if (typeof window === 'undefined' || !window.gtag) {
    if (config.debug) {
      console.log('[GA Debug] Analytics not available:', event);
    }
    return;
  }

  try {
    window.gtag('event', event.event, {
      ...event.properties,
      custom_map: {
        user_id: event.userId,
      },
      timestamp_micros: event.timestamp
        ? Math.floor(event.timestamp.getTime() * 1000)
        : Math.floor(Date.now() * 1000),
    });

    if (config.debug) {
      console.log('[GA Debug] Tracked event:', event);
    }
  } catch (error) {
    if (config.debug) {
      console.error('[GA Error] Failed to track event:', error, event);
    }
  }
};

/**
 * Track lead conversion through Google Analytics
 */
const trackLeadConversion = async (
  config: GoogleAnalyticsConfig,
  data: LeadAnalyticsData
): Promise<void> => {
  // Track generate_lead event
  await trackEvent(config, {
    event: 'generate_lead',
    properties: {
      currency: 'USD',
      value: 1.0, // Default lead value
      email: data.email,
      source: data.source,
      company_name: data.companyName,
      interested_features: data.interestedFeatures?.join(','),
      lead_source: data.source,
    },
  });

  // Also track as conversion
  await trackEvent(config, {
    event: 'conversion',
    properties: {
      send_to: `${config.measurementId}/lead_conversion`,
      value: 1.0,
      currency: 'USD',
      transaction_id: `lead_${Date.now()}`,
    },
  });
};

/**
 * Track page view through Google Analytics
 */
const trackPageView = async (
  config: GoogleAnalyticsConfig,
  page: string,
  properties?: Record<string, unknown>
): Promise<void> => {
  if (typeof window === 'undefined' || !window.gtag) {
    if (config.debug) {
      console.log('[GA Debug] Page view not tracked - analytics not available');
    }
    return;
  }

  try {
    window.gtag('config', config.measurementId, {
      page_title: properties?.title || document.title,
      page_location: properties?.url || window.location.href,
      page_path: page,
      ...properties,
    });

    if (config.debug) {
      console.log('[GA Debug] Tracked page view:', page, properties);
    }
  } catch (error) {
    if (config.debug) {
      console.error('[GA Error] Failed to track page view:', error);
    }
  }
};

/**
 * Identify user through Google Analytics
 */
const identifyUser = async (
  config: GoogleAnalyticsConfig,
  userId: string,
  traits?: Record<string, unknown>
): Promise<void> => {
  if (typeof window === 'undefined' || !window.gtag) {
    if (config.debug) {
      console.log('[GA Debug] User identification not available');
    }
    return;
  }

  try {
    window.gtag('config', config.measurementId, {
      user_id: userId,
      custom_map: traits,
    });

    // Set user properties
    if (traits) {
      window.gtag('set', 'user_properties', traits);
    }

    if (config.debug) {
      console.log('[GA Debug] Identified user:', userId, traits);
    }
  } catch (error) {
    if (config.debug) {
      console.error('[GA Error] Failed to identify user:', error);
    }
  }
};

/**
 * Create Google Analytics service object (functional service)
 */
export const createGoogleAnalyticsService = (config: GoogleAnalyticsConfig): AnalyticsService => ({
  track: (event: AnalyticsEvent) => trackEvent(config, event),
  trackLeadConversion: (data: LeadAnalyticsData) => trackLeadConversion(config, data),
  trackPageView: (page: string, properties?: Record<string, unknown>) =>
    trackPageView(config, page, properties),
  identify: (userId: string, traits?: Record<string, unknown>) =>
    identifyUser(config, userId, traits),
});

// =============================================================================
// MOCK ANALYTICS FUNCTIONAL IMPLEMENTATION
// =============================================================================

/**
 * Track event in mock analytics (pure function)
 */
const mockTrackEvent = (state: MockAnalyticsState, event: AnalyticsEvent): MockAnalyticsState => {
  const newEvent = {
    ...event,
    timestamp: event.timestamp || new Date(),
  };

  console.log('[Mock Analytics] Tracked event:', event);

  return {
    events: [...state.events, newEvent],
  };
};

/**
 * Track lead conversion in mock analytics
 */
const mockTrackLeadConversion = (
  state: MockAnalyticsState,
  data: LeadAnalyticsData
): MockAnalyticsState => {
  return mockTrackEvent(state, {
    event: 'lead_conversion',
    properties: {
      email: data.email,
      source: data.source,
      company_name: data.companyName,
      interested_features: data.interestedFeatures,
    },
  });
};

/**
 * Track page view in mock analytics
 */
const mockTrackPageView = (
  state: MockAnalyticsState,
  page: string,
  properties?: Record<string, unknown>
): MockAnalyticsState => {
  return mockTrackEvent(state, {
    event: 'page_view',
    properties: {
      page,
      ...properties,
    },
  });
};

/**
 * Identify user in mock analytics
 */
const mockIdentifyUser = (
  state: MockAnalyticsState,
  userId: string,
  traits?: Record<string, unknown>
): MockAnalyticsState => {
  return mockTrackEvent(state, {
    event: 'user_identified',
    properties: {
      user_id: userId,
      ...traits,
    },
    userId,
  });
};

/**
 * Create initial mock analytics state
 */
export const createMockAnalyticsState = (): MockAnalyticsState => ({
  events: [],
});

/**
 * Create mock analytics service with state management
 */
export const createMockAnalyticsService = (): AnalyticsService & {
  getEvents: () => AnalyticsEvent[];
  clearEvents: () => void;
} => {
  let state = createMockAnalyticsState();

  return {
    track: async (event: AnalyticsEvent) => {
      state = mockTrackEvent(state, event);
    },
    trackLeadConversion: async (data: LeadAnalyticsData) => {
      state = mockTrackLeadConversion(state, data);
    },
    trackPageView: async (page: string, properties?: Record<string, unknown>) => {
      state = mockTrackPageView(state, page, properties);
    },
    identify: async (userId: string, traits?: Record<string, unknown>) => {
      state = mockIdentifyUser(state, userId, traits);
    },
    getEvents: () => [...state.events],
    clearEvents: () => {
      state = createMockAnalyticsState();
    },
  };
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if Google Analytics is available in the environment
 */
export const isGoogleAnalyticsAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!window.gtag;
};

/**
 * Create analytics service based on environment
 */
export const createAnalyticsService = (
  measurementId: string,
  debug = false,
  useMock = false
): AnalyticsService => {
  if (useMock || !isGoogleAnalyticsAvailable()) {
    return createMockAnalyticsService();
  }

  return createGoogleAnalyticsService({ measurementId, debug });
};

/**
 * Create analytics configuration
 */
export const createAnalyticsConfig = (
  measurementId: string,
  debug = false
): GoogleAnalyticsConfig => ({
  measurementId,
  debug,
});

