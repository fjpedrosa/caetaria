/**
 * Analytics Service Port
 * Application layer - Interface for analytics tracking
 */

import { LeadSource } from '../../domain/entities/lead';
import { Email } from '../../domain/value-objects/email';

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
  userId?: string;
  timestamp?: Date;
}

export interface LeadAnalyticsData {
  email: Email;
  source: LeadSource;
  companyName?: string;
  interestedFeatures?: string[];
}

export interface AnalyticsService {
  /**
   * Track a custom event
   */
  track(event: AnalyticsEvent): Promise<void>;

  /**
   * Track lead conversion
   */
  trackLeadConversion(data: LeadAnalyticsData): Promise<void>;

  /**
   * Track page view
   */
  trackPageView(page: string, properties?: Record<string, unknown>): Promise<void>;

  /**
   * Identify user for analytics
   */
  identify(userId: string, traits?: Record<string, unknown>): Promise<void>;
}