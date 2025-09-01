/**
 * API Layer Exports
 *
 * Centralized exports for all RTK Query APIs, hooks, types, and utilities.
 * Provides a clean interface for components to import API functionality.
 *
 * Usage:
 * ```ts
 * import {
 *   useGetLeadsQuery,
 *   useCreateLeadMutation,
 *   useTrackEventMutation,
 *   useOnboardingFlow,
 *   LeadCardSkeleton
 * } from '@/store/api';
 * ```
 */

// Base query utilities
export type { SupabaseError, SupabaseQueryArgs, SupabaseQueryResult } from './supabase-base-query';
export { createBatchOperation,createRealtimeSubscription, supabaseBaseQuery } from './supabase-base-query';

// Leads API
export type {
  LeadsListParams,
  LeadsListResponse,
  LeadStatsResponse,
  OptimisticLeadUpdate,
} from './leads-api';
export { leadsApi } from './leads-api';
export {
  invalidateLeadsTags,
  prefetchLeads,
  updateLeadsQueryData,
  useBulkUpdateLeadsMutation,
  useCreateLeadMutation,
  useDeleteLeadMutation,
  useGetLeadQuery,
  useGetLeadsQuery,
  useGetLeadStatsQuery,
  useLazyGetLeadsQuery,
  useLazySearchLeadsQuery,
  useSearchLeadsQuery,
  useUpdateLeadMutation,
} from './leads-api';

// Analytics API
export type {
  BatchTrackEventsPayload,
  ConversionFunnelData,
  ConversionFunnelStep,
  DashboardMetrics,
  EventsListParams,
  EventsListResponse,
  TrackEventPayload,
  UserJourneyEvent,
  UserJourneyResponse,
} from './analytics-api';
export { analyticsApi } from './analytics-api';
export {
  invalidateAnalyticsTags,
  prefetchAnalytics,
  updateAnalyticsQueryData,
  useBatchTrackEventsMutation,
  useGetConversionFunnelQuery,
  useGetDashboardMetricsQuery,
  useGetEventNamesQuery,
  useGetEventsQuery,
  useGetUserJourneyQuery,
  useLazyGetEventsQuery,
  useLazyGetUserJourneyQuery,
  useTrackEventMutation,
} from './analytics-api';

// Onboarding API
export type {
  BotConfigurationFormData,
  BusinessInfoFormData,
  IntegrationTestResult,
  OnboardingData,
  OnboardingSession,
  OnboardingStep,
  StepValidationResult,
  WhatsAppIntegrationFormData,
} from './onboarding-api';
export { onboardingApi } from './onboarding-api';
export {
  invalidateOnboardingTags,
  prefetchOnboarding,
  updateOnboardingQueryData,
  useCompleteOnboardingMutation,
  useCreateOnboardingSessionMutation,
  useGetBotConfigurationQuery,
  useGetOnboardingDataQuery,
  useGetOnboardingSessionQuery,
  useGetUserProfileQuery,
  useGetWhatsAppIntegrationQuery,
  useLazyGetOnboardingDataQuery,
  useLazyGetOnboardingSessionQuery,
  useSubmitBotConfigurationMutation,
  useSubmitBusinessInfoMutation,
  useSubmitWhatsAppIntegrationMutation,
  useTestWhatsAppIntegrationMutation,
  useUpdateBotConfigurationMutation,
  useUpdateOnboardingSessionMutation,
  useUpdateWhatsAppIntegrationMutation,
} from './onboarding-api';

// Enhanced Custom Hooks
export type {
  UseAnalyticsTrackingResult,
  UseLeadManagementResult,
  UseLeadsResult,
  UseOnboardingFlowResult,
} from './hooks';
export {
  useAnalyticsTracking,
  useDashboardMetrics,
  useLeadInsights,
  useLeadManagement,
  useLeadsWithPagination,
  useOnboardingFlow,
} from './hooks';

// Error Handling Utilities
export type {
  EnhancedError,
  ErrorCategory,
  ErrorRecoveryStrategy,
  ErrorSeverity,
} from './error-handling';
export {
  classifyError,
  createErrorHandler,
  getErrorSeverity,
  getRecoveryStrategy,
  getRecoverySuggestions,
  getUserFriendlyMessage,
  processError,
  reportError,
  transformRTKQueryError,
  useErrorHandler,
} from './error-handling';

// Loading State Components
export {
  ChartSkeleton,
  DashboardMetricsSkeleton,
  FormSkeleton,
  LeadCardSkeleton,
  LeadListSkeleton,
  LoadingSpinner,
  LoadingStateWrapper,
  OnboardingStepSkeleton,
  OptimisticLoadingIndicator,
  ProgressBar,
  Skeleton,
  TableSkeleton,
  useRTKQueryLoadingStates,
} from './loading-states';

// Re-export common Supabase types for convenience
export type {
  AnalyticsEvent,
  AnalyticsEventInsert,
  BotConfiguration,
  BotConfigurationInsert,
  BotConfigurationUpdate,
  BotStatus,
  CreateLeadForm,
  IntegrationStatus,
  Lead,
  LeadInsert,
  LeadSource,
  LeadStatus,
  LeadUpdate,
  UpdateLeadForm,
  UserProfile,
  UserProfileInsert,
  UserProfileUpdate,
  WhatsAppIntegration,
  WhatsAppIntegrationInsert,
  WhatsAppIntegrationUpdate,
} from '@/lib/supabase/types';

/**
 * API Configuration Constants
 */
export const API_CONFIG = {
  // Cache durations (in seconds)
  CACHE_TIMES: {
    SHORT: 60, // 1 minute
    MEDIUM: 300, // 5 minutes
    LONG: 900, // 15 minutes
    EXTENDED: 1800, // 30 minutes
  },

  // Polling intervals (in milliseconds)
  POLLING_INTERVALS: {
    REAL_TIME: 5000, // 5 seconds
    FREQUENT: 30000, // 30 seconds
    NORMAL: 60000, // 1 minute
    SLOW: 300000, // 5 minutes
  },

  // Retry configurations
  RETRY_CONFIG: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    EXPONENTIAL_BACKOFF: true,
  },

  // Batch processing
  BATCH_CONFIG: {
    DEFAULT_SIZE: 10,
    MAX_SIZE: 100,
    FLUSH_INTERVAL: 30000, // 30 seconds
  },
} as const;

/**
 * Common Query Options Presets
 */
export const QUERY_OPTIONS = {
  // Standard caching with refetch on focus
  STANDARD: {
    refetchOnFocus: true,
    refetchOnReconnect: true,
    keepUnusedDataFor: API_CONFIG.CACHE_TIMES.MEDIUM,
  },

  // Real-time data with polling
  REAL_TIME: {
    pollingInterval: API_CONFIG.POLLING_INTERVALS.REAL_TIME,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    keepUnusedDataFor: API_CONFIG.CACHE_TIMES.SHORT,
  },

  // Long-term caching for stable data
  STABLE: {
    refetchOnFocus: false,
    refetchOnReconnect: false,
    keepUnusedDataFor: API_CONFIG.CACHE_TIMES.EXTENDED,
  },

  // Background data with minimal refetching
  BACKGROUND: {
    refetchOnFocus: false,
    refetchOnReconnect: true,
    keepUnusedDataFor: API_CONFIG.CACHE_TIMES.LONG,
  },
} as const;

/**
 * Helper Functions
 */

/**
 * Create optimistic update patterns for common operations
 */
export const createOptimisticUpdate = <T extends { id: string }>(
  updateFn: (draft: T[], update: Partial<T> & { id: string }) => void
) => {
  return (queryResult: { data?: T[] }, update: Partial<T> & { id: string }) => {
    if (!queryResult.data) return;
    updateFn(queryResult.data, update);
  };
};

/**
 * Create cache invalidation patterns
 */
export const createCacheInvalidation = (tags: string[]) => {
  return tags.map(tag => ({ type: tag, id: 'LIST' }));
};

/**
 * Generate cache tags for entity operations
 */
export const generateEntityTags = <T extends { id: string }>(
  entityName: string,
  entities?: T[]
) => {
  const baseTags = [{ type: entityName, id: 'LIST' }];

  if (entities) {
    return [
      ...baseTags,
      ...entities.map(({ id }) => ({ type: entityName, id })),
    ];
  }

  return baseTags;
};

/**
 * Utility to transform RTK Query errors for consistent handling
 */
export const transformError = (error: any) => {
  return processError(error);
};

/**
 * Debug utilities for development
 */
export const DEBUG_UTILS = process.env.NODE_ENV === 'development' ? {
  /**
   * Log API operation details
   */
  logOperation: (operation: string, args: any, result: any) => {
    console.group(`🔄 API Operation: ${operation}`);
    console.log('Arguments:', args);
    console.log('Result:', result);
    console.groupEnd();
  },

  /**
   * Log cache operations
   */
  logCacheOperation: (operation: string, key: string, data?: any) => {
    console.log(`💾 Cache ${operation}: ${key}`, data ? { data } : '');
  },

  /**
   * Log error details
   */
  logError: (operation: string, error: any) => {
    console.group(`❌ API Error: ${operation}`);
    console.error('Error details:', error);
    if (error.originalError) {
      console.error('Original error:', error.originalError);
    }
    console.groupEnd();
  },
} : {};

/**
 * Type guards for API responses
 */
export const isApiError = (value: any): value is EnhancedError => {
  return value && typeof value === 'object' && 'category' in value && 'severity' in value;
};

export const isSupabaseError = (value: any): value is SupabaseError => {
  return value && typeof value === 'object' && 'message' in value && 'status' in value;
};

/**
 * Performance monitoring utilities
 */
export const PERFORMANCE_MONITORING = {
  /**
   * Monitor query performance
   */
  monitorQuery: (queryName: string) => {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      if (duration > 1000) {
        console.warn(`⚠️ Slow query detected: ${queryName} took ${duration.toFixed(2)}ms`);
      }
    };
  },

  /**
   * Monitor cache effectiveness
   */
  monitorCache: (queryName: string, wasCached: boolean) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Cache ${wasCached ? 'HIT' : 'MISS'}: ${queryName}`);
    }
  },
};