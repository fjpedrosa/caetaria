/**
 * Analytics Hooks - Exports
 *
 * Centralized exports for all specialized analytics tracking hooks
 * Following clean architecture with separation of concerns
 */

// Core event tracking
export { default as useEventTracking } from './use-event-tracking';

// Specialized tracking hooks
export { default as useFormAnalytics } from './use-form-analytics';
export { default as usePageViewTracking } from './use-page-view-tracking';
export { default as useScrollTracking } from './use-scroll-tracking';
export { default as useVisibilityTracking } from './use-visibility-tracking';

// Re-export types for convenience
export type {
  AnalyticsConfig,
  AnalyticsContext,
  AnalyticsMetric,
  ConsentLevel,
  FormAnalyticsData,
  ScrollDepthData,
  TimeOnPageData,
  TrackingEvent,
} from '../../domain/types';