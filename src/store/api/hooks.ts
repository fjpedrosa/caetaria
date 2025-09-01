/**
 * Custom API Hooks
 *
 * Higher-level hooks that combine multiple API operations and provide
 * enhanced developer experience with error handling, loading states,
 * and common patterns.
 *
 * Features:
 * - Compound operations combining multiple API calls
 * - Enhanced error handling and user feedback
 * - Optimized loading states and caching
 * - Common business logic patterns
 * - Real-time data synchronization
 * - Form integration helpers
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react';

import type { Lead, LeadSource,LeadStatus } from '@/lib/supabase/types';

import {
  type BatchTrackEventsPayload,
  type TrackEventPayload,
  useBatchTrackEventsMutation,
  useGetConversionFunnelQuery,
  useGetDashboardMetricsQuery,
  useGetEventNamesQuery,
  useGetUserJourneyQuery,
  useTrackEventMutation,
} from './analytics-api';
// Import all API hooks
import {
  type CreateLeadForm,
  type LeadsListParams,
  type UpdateLeadForm,
  useBulkUpdateLeadsMutation,
  useCreateLeadMutation,
  useDeleteLeadMutation,
  useGetLeadsQuery,
  useGetLeadStatsQuery,
  useSearchLeadsQuery,
  useUpdateLeadMutation,
} from './leads-api';
import {
  type BotConfigurationFormData,
  type BusinessInfoFormData,
  type OnboardingStep,
  useCompleteOnboardingMutation,
  useCreateOnboardingSessionMutation,
  useGetOnboardingDataQuery,
  useGetOnboardingSessionQuery,
  useSubmitBotConfigurationMutation,
  useSubmitBusinessInfoMutation,
  useSubmitWhatsAppIntegrationMutation,
  useTestWhatsAppIntegrationMutation,
  type WhatsAppIntegrationFormData,
} from './onboarding-api';

// Enhanced hook return types
export interface UseLeadsResult {
  leads: Lead[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  isFetching: boolean;
  error: any;
  refetch: () => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface UseLeadManagementResult {
  createLead: (leadData: CreateLeadForm) => Promise<Lead>;
  updateLead: (id: string, updates: UpdateLeadForm) => Promise<Lead>;
  deleteLead: (id: string) => Promise<void>;
  bulkUpdateLeads: (ids: string[], updates: UpdateLeadForm) => Promise<Lead[]>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isBulkUpdating: boolean;
  errors: Record<string, any>;
}

export interface UseAnalyticsTrackingResult {
  trackEvent: (eventData: Omit<TrackEventPayload, 'sessionId' | 'userId'>) => Promise<void>;
  trackBatch: (events: Omit<TrackEventPayload, 'sessionId' | 'userId'>[]) => Promise<void>;
  isTracking: boolean;
  trackingErrors: any[];
  sessionId: string;
  userId?: string;
}

export interface UseOnboardingFlowResult {
  session: any;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  canProceedToNextStep: boolean;
  totalSteps: number;
  progressPercentage: number;
  isLoading: boolean;
  error: any;

  // Step actions
  submitBusinessInfo: (data: BusinessInfoFormData) => Promise<void>;
  submitWhatsAppIntegration: (data: WhatsAppIntegrationFormData) => Promise<void>;
  submitBotConfiguration: (data: BotConfigurationFormData) => Promise<void>;
  testIntegration: () => Promise<boolean>;
  completeOnboarding: () => Promise<void>;

  // Step states
  isSubmittingStep: boolean;
  isTestingIntegration: boolean;
  isCompletingOnboarding: boolean;
  stepErrors: Record<OnboardingStep, any>;
}

/**
 * Enhanced leads management hook with pagination and filtering
 */
export const useLeadsWithPagination = (
  params: LeadsListParams = {},
  options: { enabled?: boolean } = {}
): UseLeadsResult => {
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch
  } = useGetLeadsQuery(params, {
    skip: options.enabled === false,
    refetchOnMountOrArgChange: true,
  });

  return useMemo(() => ({
    leads: data?.data || [],
    totalCount: data?.count || 0,
    currentPage: data?.page || 1,
    totalPages: data?.totalPages || 1,
    isLoading,
    isFetching,
    error,
    refetch,
    hasNextPage: (data?.page || 1) < (data?.totalPages || 1),
    hasPreviousPage: (data?.page || 1) > 1,
  }), [data, isLoading, isFetching, error, refetch]);
};

/**
 * Comprehensive lead management hook with all CRUD operations
 */
export const useLeadManagement = (): UseLeadManagementResult => {
  const [createLeadMutation, createState] = useCreateLeadMutation();
  const [updateLeadMutation, updateState] = useUpdateLeadMutation();
  const [deleteLeadMutation, deleteState] = useDeleteLeadMutation();
  const [bulkUpdateMutation, bulkState] = useBulkUpdateLeadsMutation();

  const createLead = useCallback(async (leadData: CreateLeadForm): Promise<Lead> => {
    try {
      const result = await createLeadMutation(leadData).unwrap();
      return result;
    } catch (error) {
      console.error('Failed to create lead:', error);
      throw error;
    }
  }, [createLeadMutation]);

  const updateLead = useCallback(async (id: string, updates: UpdateLeadForm): Promise<Lead> => {
    try {
      const result = await updateLeadMutation({ id, updates }).unwrap();
      return result;
    } catch (error) {
      console.error('Failed to update lead:', error);
      throw error;
    }
  }, [updateLeadMutation]);

  const deleteLead = useCallback(async (id: string): Promise<void> => {
    try {
      await deleteLeadMutation(id).unwrap();
    } catch (error) {
      console.error('Failed to delete lead:', error);
      throw error;
    }
  }, [deleteLeadMutation]);

  const bulkUpdateLeads = useCallback(async (ids: string[], updates: UpdateLeadForm): Promise<Lead[]> => {
    try {
      const result = await bulkUpdateMutation({ ids, updates }).unwrap();
      return result;
    } catch (error) {
      console.error('Failed to bulk update leads:', error);
      throw error;
    }
  }, [bulkUpdateMutation]);

  return useMemo(() => ({
    createLead,
    updateLead,
    deleteLead,
    bulkUpdateLeads,
    isCreating: createState.isLoading,
    isUpdating: updateState.isLoading,
    isDeleting: deleteState.isLoading,
    isBulkUpdating: bulkState.isLoading,
    errors: {
      create: createState.error,
      update: updateState.error,
      delete: deleteState.error,
      bulk: bulkState.error,
    },
  }), [
    createLead,
    updateLead,
    deleteLead,
    bulkUpdateLeads,
    createState,
    updateState,
    deleteState,
    bulkState,
  ]);
};

/**
 * Analytics tracking hook with session management
 */
export const useAnalyticsTracking = (
  userId?: string,
  options: {
    autoGenerateSessionId?: boolean;
    batchSize?: number;
    flushInterval?: number;
  } = {}
): UseAnalyticsTrackingResult => {
  const {
    autoGenerateSessionId = true,
    batchSize = 10,
    flushInterval = 30000, // 30 seconds
  } = options;

  const [trackEventMutation, trackState] = useTrackEventMutation();
  const [batchTrackMutation, batchState] = useBatchTrackEventsMutation();

  // Generate session ID
  const sessionId = useMemo(() => {
    if (autoGenerateSessionId) {
      return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return '';
  }, [autoGenerateSessionId]);

  // Batch tracking state
  const [eventQueue, setEventQueue] = useState<TrackEventPayload[]>([]);
  const [trackingErrors, setTrackingErrors] = useState<any[]>([]);

  // Flush batch periodically
  useEffect(() => {
    if (eventQueue.length === 0 || flushInterval <= 0) return;

    const interval = setInterval(() => {
      if (eventQueue.length > 0) {
        flushBatch();
      }
    }, flushInterval);

    return () => clearInterval(interval);
  }, [eventQueue, flushInterval]);

  // Auto-flush when batch size is reached
  useEffect(() => {
    if (eventQueue.length >= batchSize) {
      flushBatch();
    }
  }, [eventQueue, batchSize]);

  const flushBatch = useCallback(async () => {
    if (eventQueue.length === 0) return;

    try {
      const eventsToFlush = [...eventQueue];
      setEventQueue([]);

      await batchTrackMutation({
        events: eventsToFlush,
        batchId: `batch_${Date.now()}`,
      }).unwrap();
    } catch (error) {
      setTrackingErrors(prev => [...prev, error]);
      console.warn('Failed to flush analytics batch:', error);
    }
  }, [eventQueue, batchTrackMutation]);

  const trackEvent = useCallback(async (
    eventData: Omit<TrackEventPayload, 'sessionId' | 'userId'>
  ): Promise<void> => {
    const fullEventData: TrackEventPayload = {
      ...eventData,
      userId,
      sessionId,
      pageUrl: eventData.pageUrl || (typeof window !== 'undefined' ? window.location.href : undefined),
      userAgent: eventData.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : undefined),
    };

    // Add to batch queue for better performance
    if (batchSize > 1) {
      setEventQueue(prev => [...prev, fullEventData]);
      return;
    }

    // Track immediately for real-time events
    try {
      await trackEventMutation(fullEventData).unwrap();
    } catch (error) {
      setTrackingErrors(prev => [...prev, error]);
      console.warn('Failed to track event:', error);
    }
  }, [userId, sessionId, trackEventMutation, batchSize]);

  const trackBatch = useCallback(async (
    events: Omit<TrackEventPayload, 'sessionId' | 'userId'>[]
  ): Promise<void> => {
    try {
      const fullEvents: TrackEventPayload[] = events.map(event => ({
        ...event,
        userId,
        sessionId,
        pageUrl: event.pageUrl || (typeof window !== 'undefined' ? window.location.href : undefined),
        userAgent: event.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : undefined),
      }));

      await batchTrackMutation({
        events: fullEvents,
        batchId: `manual_batch_${Date.now()}`,
      }).unwrap();
    } catch (error) {
      setTrackingErrors(prev => [...prev, error]);
      console.error('Failed to track batch events:', error);
      throw error;
    }
  }, [userId, sessionId, batchTrackMutation]);

  // Cleanup: flush remaining events on unmount
  useEffect(() => {
    return () => {
      if (eventQueue.length > 0) {
        flushBatch();
      }
    };
  }, []);

  return useMemo(() => ({
    trackEvent,
    trackBatch,
    isTracking: trackState.isLoading || batchState.isLoading,
    trackingErrors,
    sessionId,
    userId,
  }), [
    trackEvent,
    trackBatch,
    trackState.isLoading,
    batchState.isLoading,
    trackingErrors,
    sessionId,
    userId,
  ]);
};

/**
 * Complete onboarding flow management hook
 */
export const useOnboardingFlow = (userId: string): UseOnboardingFlowResult => {
  const { data: onboardingData, isLoading, error, refetch } = useGetOnboardingDataQuery(
    userId ? { userId } : skipToken
  );

  const [submitBusinessInfo, businessInfoState] = useSubmitBusinessInfoMutation();
  const [submitWhatsAppIntegration, integrationState] = useSubmitWhatsAppIntegrationMutation();
  const [submitBotConfiguration, botConfigState] = useSubmitBotConfigurationMutation();
  const [testIntegration, testState] = useTestWhatsAppIntegrationMutation();
  const [completeOnboarding, completeState] = useCompleteOnboardingMutation();

  const session = onboardingData?.session;
  const currentStep = session?.currentStep || 'business_info';
  const completedSteps = session?.completedSteps || [];

  const stepOrder: OnboardingStep[] = ['business_info', 'whatsapp_integration', 'bot_configuration', 'testing', 'complete'];
  const totalSteps = stepOrder.length - 1; // Exclude 'complete' from count
  const progressPercentage = Math.round((completedSteps.length / totalSteps) * 100);

  const canProceedToNextStep = useMemo(() => {
    const currentStepIndex = stepOrder.indexOf(currentStep);
    if (currentStepIndex === -1) return false;

    // Check if current step is completed or if it's the first step
    return currentStepIndex === 0 || completedSteps.includes(stepOrder[currentStepIndex - 1]);
  }, [currentStep, completedSteps, stepOrder]);

  // Step submission functions
  const handleSubmitBusinessInfo = useCallback(async (data: BusinessInfoFormData): Promise<void> => {
    try {
      await submitBusinessInfo({ userId, businessInfo: data }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to submit business info:', error);
      throw error;
    }
  }, [userId, submitBusinessInfo, refetch]);

  const handleSubmitWhatsAppIntegration = useCallback(async (data: WhatsAppIntegrationFormData): Promise<void> => {
    try {
      await submitWhatsAppIntegration({ userId, integrationData: data }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to submit WhatsApp integration:', error);
      throw error;
    }
  }, [userId, submitWhatsAppIntegration, refetch]);

  const handleSubmitBotConfiguration = useCallback(async (data: BotConfigurationFormData): Promise<void> => {
    try {
      if (!onboardingData?.whatsappIntegration?.id) {
        throw new Error('WhatsApp integration not found');
      }

      await submitBotConfiguration({
        userId,
        integrationId: onboardingData.whatsappIntegration.id,
        botConfig: data,
      }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to submit bot configuration:', error);
      throw error;
    }
  }, [userId, onboardingData?.whatsappIntegration?.id, submitBotConfiguration, refetch]);

  const handleTestIntegration = useCallback(async (): Promise<boolean> => {
    try {
      const result = await testIntegration({
        userId,
        testType: 'full_flow',
      }).unwrap();
      refetch();
      return result.success;
    } catch (error) {
      console.error('Failed to test integration:', error);
      throw error;
    }
  }, [userId, testIntegration, refetch]);

  const handleCompleteOnboarding = useCallback(async (): Promise<void> => {
    try {
      await completeOnboarding({ userId }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      throw error;
    }
  }, [userId, completeOnboarding, refetch]);

  return useMemo(() => ({
    session,
    currentStep,
    completedSteps,
    canProceedToNextStep,
    totalSteps,
    progressPercentage,
    isLoading,
    error,

    // Step actions
    submitBusinessInfo: handleSubmitBusinessInfo,
    submitWhatsAppIntegration: handleSubmitWhatsAppIntegration,
    submitBotConfiguration: handleSubmitBotConfiguration,
    testIntegration: handleTestIntegration,
    completeOnboarding: handleCompleteOnboarding,

    // Step states
    isSubmittingStep: businessInfoState.isLoading || integrationState.isLoading || botConfigState.isLoading,
    isTestingIntegration: testState.isLoading,
    isCompletingOnboarding: completeState.isLoading,
    stepErrors: {
      business_info: businessInfoState.error,
      whatsapp_integration: integrationState.error,
      bot_configuration: botConfigState.error,
      testing: testState.error,
      complete: completeState.error,
    },
  }), [
    session,
    currentStep,
    completedSteps,
    canProceedToNextStep,
    totalSteps,
    progressPercentage,
    isLoading,
    error,
    handleSubmitBusinessInfo,
    handleSubmitWhatsAppIntegration,
    handleSubmitBotConfiguration,
    handleTestIntegration,
    handleCompleteOnboarding,
    businessInfoState,
    integrationState,
    botConfigState,
    testState,
    completeState,
  ]);
};

/**
 * Lead statistics and insights hook
 */
export const useLeadInsights = (days: number = 30) => {
  const { data: stats, isLoading: isLoadingStats, error: statsError } = useGetLeadStatsQuery({ days });
  const { data: recentLeads, isLoading: isLoadingRecent } = useGetLeadsQuery({
    limit: 10,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  return useMemo(() => ({
    stats,
    recentLeads: recentLeads?.data || [],
    isLoading: isLoadingStats || isLoadingRecent,
    error: statsError,
    // Computed insights
    insights: stats ? {
      isGrowthPositive: (stats.recentCount || 0) > 0,
      topSource: Object.entries(stats.bySource || {})
        .sort(([,a], [,b]) => b - a)[0]?.[0] as LeadSource,
      needsAttention: (stats.byStatus?.new || 0) > 10, // More than 10 new leads need attention
      conversionTrend: stats.conversionRate > 10 ? 'good' : stats.conversionRate > 5 ? 'average' : 'poor',
    } : null,
  }), [stats, recentLeads, isLoadingStats, isLoadingRecent, statsError]);
};

/**
 * Real-time dashboard metrics hook
 */
export const useDashboardMetrics = (days: number = 7, refreshInterval: number = 60000) => {
  const {
    data: metrics,
    isLoading,
    error,
    refetch
  } = useGetDashboardMetricsQuery({ days }, {
    pollingInterval: refreshInterval,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  return useMemo(() => ({
    metrics,
    isLoading,
    error,
    refetch,
    // Computed dashboard data
    summary: metrics ? {
      totalEvents: metrics.totalEvents,
      activeUsers: metrics.uniqueUsers,
      activeSessions: metrics.uniqueSessions,
      averageSessionDuration: Math.round(metrics.averageSessionDuration / 60000), // Convert to minutes
      bounceRate: `${metrics.bounceRate}%`,
      topEvent: metrics.popularEvents[0]?.eventName || 'None',
    } : null,
  }), [metrics, isLoading, error, refetch]);
};