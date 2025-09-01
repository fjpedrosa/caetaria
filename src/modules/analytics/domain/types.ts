/**
 * Analytics Domain Types - Centralized type definitions
 * Following Clean Architecture principles with business concepts separated from UI concerns
 */

// =============================================================================
// BUSINESS DOMAIN TYPES - Core analytics concepts
// =============================================================================

export type ConsentLevel = 'none' | 'essential' | 'analytics' | 'all';

export interface AnalyticsConfig {
  sessionTimeout?: number;
  batchSize?: number;
  flushInterval?: number;
  enableLocalStorage?: boolean;
  enableAutoTracking?: boolean;
  consentLevel?: ConsentLevel;
}

export interface AnalyticsContext {
  userId?: string;
  sessionId?: string;
  deviceId?: string;
  userAgent?: string;
  referrer?: string;
  timestamp?: string;
  [key: string]: any;
}

export interface TrackingEvent {
  id: string;
  name: string;
  type: string;
  properties?: Record<string, string | number | boolean | Date | null>;
  context?: AnalyticsContext;
  timestamp: string;
}

export interface AnalyticsMetric {
  name: string;
  value: number;
  unit?: string;
  tags?: Record<string, string>;
  timestamp: string;
}

export interface ScrollDepthData {
  percentage: number;
  absolute_position: number;
  page_height: number;
  thresholds?: number[];
}

export interface TimeOnPageData {
  seconds: number;
  url: string;
  intervals?: number[];
}

export interface FormAnalyticsData {
  form_name: string;
  form_fields: number;
  completion_time?: number;
  field_errors?: Record<string, string[]>;
  [key: string]: any;
}

// =============================================================================
// UI COMPONENT PROPS - Pure presentation concerns
// =============================================================================

export interface EventTrackerProviderProps {
  children: React.ReactNode;
  userId?: string;
  enableAutoTracking?: boolean;
  consentLevel?: ConsentLevel;
  config?: AnalyticsConfig;
}

export interface EventTrackerContextType {
  trackEvent: (type: any, name: string, properties?: Record<string, any>) => Promise<void>;
  trackPageView: (url?: string, title?: string) => Promise<void>;
  trackClick: (element: string, properties?: Record<string, any>) => Promise<void>;
  trackFormSubmit: (formName: string, properties?: Record<string, any>) => Promise<void>;
  trackCustom: (eventName: string, properties?: Record<string, any>) => Promise<void>;
  setUserId: (userId: string) => void;
  setTrackingEnabled: (enabled: boolean) => void;
  setConsentLevel: (level: ConsentLevel) => void;
}

export interface MetricsDashboardProps {
  userId?: string;
  timeRange?: 'hour' | 'day' | 'week' | 'month';
  metrics?: string[];
  refreshInterval?: number;
  className?: string;
  showExport?: boolean;
}

export interface ScrollDepthTrackerProps {
  thresholds?: number[];
  enabled?: boolean;
}

export interface TimeOnPageTrackerProps {
  intervals?: number[]; // seconds
  enabled?: boolean;
}

export interface VisibilityTrackerProps {
  enabled?: boolean;
}

export interface ClickTrackingOptions {
  enabled?: boolean;
  elementName: string;
  additionalProperties?: Record<string, any>;
}

export interface FormTrackingOptions {
  formName: string;
  trackFieldInteractions?: boolean;
  trackValidationErrors?: boolean;
  trackCompletionTime?: boolean;
}

export interface PageViewTrackingOptions {
  trackOnMount?: boolean;
  customPageName?: string;
}