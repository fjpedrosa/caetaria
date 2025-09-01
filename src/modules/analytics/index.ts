/**
 * Analytics Module - Main Exports
 *
 * Clean Architecture Implementation with Specialized Hooks
 * Provides both legacy compatibility and modern hook-based API
 */

// =============================================================================
// Modern Clean Architecture Exports (RECOMMENDED)
// =============================================================================

// Main provider and context hooks
export {
  AnalyticsProvider,
  useAnalytics,
  useEventAnalytics,
  useFormAnalytics,
  usePageAnalytics,
  useScrollAnalytics,
  useVisibilityAnalytics,
} from './application/providers/analytics-context';

// Specialized hooks for advanced usage
export {
  useEventTracking,
  useFormAnalytics as useFormAnalyticsAdvanced,
  usePageViewTracking,
  useScrollTracking,
  useVisibilityTracking,
} from './application/hooks';

// =============================================================================
// Legacy Compatibility Exports (DEPRECATED but maintained)
// =============================================================================

export {
  EventTrackerProvider,
  ScrollDepthTracker,
  TimeOnPageTracker,
  useClickTracking,
  useEventTracker,
  useFormTracking,
  VisibilityTracker,
  withPageViewTracking,
} from './ui/components/event-tracker';

// =============================================================================
// Domain Types and Interfaces
// =============================================================================

export type {
  AnalyticsConfig,
  AnalyticsContext,
  AnalyticsMetric,
  ConsentLevel,
  EventTrackerProviderProps,
  FormAnalyticsData,
  ScrollDepthData,
  ScrollDepthTrackerProps,
  TimeOnPageData,
  TimeOnPageTrackerProps,
  TrackingEvent,
  VisibilityTrackerProps,
} from './domain/types';

// =============================================================================
// Event Types and Domain Entities
// =============================================================================

export {
  createEvent,
  type Event,
  type EventProperties,
} from './domain/entities/event';
export {
  createCustomEventType,
  createEventType,
  EVENT_TYPES,
  type EventCategory,
  EventTypeEnum,
  type EventTypeInterface,
  type EventTypeValue,
  getEventTypeCategory,
  isValidEventType,
} from './domain/value-objects/event-type';

// =============================================================================
// Application Ports (for advanced integrations)
// =============================================================================

export type {
  AnalyticsRepository,
  TrackingService,
} from './application/ports/tracking-service';

// =============================================================================
// Infrastructure Services (for custom implementations)
// =============================================================================

export { createBrowserTrackingService } from './infra/adapters/browser-tracking-service';

// =============================================================================
// Legacy Domain/Application/Infrastructure/UI exports for compatibility
// =============================================================================

// Domain exports
export * from './domain';

// Application exports
export * from './application';

// Infrastructure exports
export * from './infra';

// UI exports
export * from './ui';

// =============================================================================
// Migration Guide for Legacy Users
// =============================================================================

/**
 * MIGRATION FROM LEGACY EVENT TRACKER:
 *
 * OLD WAY:
 * ```tsx
 * import { EventTrackerProvider, useEventTracker } from '@/modules/analytics';
 *
 * function App() {
 *   return (
 *     <EventTrackerProvider>
 *       <MyComponent />
 *     </EventTrackerProvider>
 *   );
 * }
 *
 * function MyComponent() {
 *   const { trackEvent, trackPageView } = useEventTracker();
 *   // ... usage
 * }
 * ```
 *
 * NEW WAY (RECOMMENDED):
 * ```tsx
 * import { AnalyticsProvider, useEventAnalytics, usePageAnalytics } from '@/modules/analytics';
 *
 * function App() {
 *   return (
 *     <AnalyticsProvider>
 *       <MyComponent />
 *     </AnalyticsProvider>
 *   );
 * }
 *
 * function MyComponent() {
 *   const { trackEvent, trackCustom } = useEventAnalytics();
 *   const { trackPageView } = usePageAnalytics();
 *   // Enhanced capabilities with specialized hooks
 * }
 * ```
 *
 * BENEFITS OF NEW APPROACH:
 * - Separation of concerns with specialized hooks
 * - Better performance with targeted re-renders
 * - Enhanced type safety and auto-completion
 * - More granular control over tracking behavior
 * - Easier testing with isolated hook logic
 * - Advanced features like form field tracking, scroll velocity, etc.
 */