/**
 * Google Analytics Service Adapter
 * Infrastructure layer - Google Analytics implementation of AnalyticsService
 */

import { AnalyticsEvent, AnalyticsService, LeadAnalyticsData } from '../../application/ports/analytics-service';

// Google Analytics gtag would be available globally
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Google Analytics implementation of AnalyticsService
 * Handles tracking events through Google Analytics gtag
 */
export class GoogleAnalyticsService implements AnalyticsService {
  constructor(
    private readonly measurementId: string,
    private readonly debug: boolean = false
  ) {}

  async track(event: AnalyticsEvent): Promise<void> {
    if (typeof window === 'undefined' || !window.gtag) {
      if (this.debug) {
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

      if (this.debug) {
        console.log('[GA Debug] Tracked event:', event);
      }
    } catch (error) {
      if (this.debug) {
        console.error('[GA Error] Failed to track event:', error, event);
      }
    }
  }

  async trackLeadConversion(data: LeadAnalyticsData): Promise<void> {
    await this.track({
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
    await this.track({
      event: 'conversion',
      properties: {
        send_to: `${this.measurementId}/lead_conversion`,
        value: 1.0,
        currency: 'USD',
        transaction_id: `lead_${Date.now()}`,
      },
    });
  }

  async trackPageView(page: string, properties?: Record<string, unknown>): Promise<void> {
    if (typeof window === 'undefined' || !window.gtag) {
      if (this.debug) {
        console.log('[GA Debug] Page view not tracked - analytics not available');
      }
      return;
    }

    try {
      window.gtag('config', this.measurementId, {
        page_title: properties?.title || document.title,
        page_location: properties?.url || window.location.href,
        page_path: page,
        ...properties,
      });

      if (this.debug) {
        console.log('[GA Debug] Tracked page view:', page, properties);
      }
    } catch (error) {
      if (this.debug) {
        console.error('[GA Error] Failed to track page view:', error);
      }
    }
  }

  async identify(userId: string, traits?: Record<string, unknown>): Promise<void> {
    if (typeof window === 'undefined' || !window.gtag) {
      if (this.debug) {
        console.log('[GA Debug] User identification not available');
      }
      return;
    }

    try {
      window.gtag('config', this.measurementId, {
        user_id: userId,
        custom_map: traits,
      });

      // Set user properties
      if (traits) {
        window.gtag('set', 'user_properties', traits);
      }

      if (this.debug) {
        console.log('[GA Debug] Identified user:', userId, traits);
      }
    } catch (error) {
      if (this.debug) {
        console.error('[GA Error] Failed to identify user:', error);
      }
    }
  }
}

/**
 * Development/Mock Analytics Service
 * Used in development environment for testing
 */
export class MockAnalyticsService implements AnalyticsService {
  private events: AnalyticsEvent[] = [];

  async track(event: AnalyticsEvent): Promise<void> {
    this.events.push({
      ...event,
      timestamp: event.timestamp || new Date(),
    });
    console.log('[Mock Analytics] Tracked event:', event);
  }

  async trackLeadConversion(data: LeadAnalyticsData): Promise<void> {
    await this.track({
      event: 'lead_conversion',
      properties: {
        email: data.email,
        source: data.source,
        company_name: data.companyName,
        interested_features: data.interestedFeatures,
      },
    });
  }

  async trackPageView(page: string, properties?: Record<string, unknown>): Promise<void> {
    await this.track({
      event: 'page_view',
      properties: {
        page,
        ...properties,
      },
    });
  }

  async identify(userId: string, traits?: Record<string, unknown>): Promise<void> {
    await this.track({
      event: 'user_identified',
      properties: {
        user_id: userId,
        ...traits,
      },
      userId,
    });
  }

  /**
   * Get all tracked events (useful for testing)
   */
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Clear all tracked events
   */
  clearEvents(): void {
    this.events = [];
  }
}