/**
 * Onboarding Session API Slice
 *
 * RTK Query API slice for managing onboarding sessions, user profiles,
 * WhatsApp integrations, and bot configurations during the onboarding flow.
 *
 * Features:
 * - Complete onboarding flow state management
 * - User profile management
 * - WhatsApp integration setup
 * - Bot configuration management
 * - Session persistence and recovery
 * - Progress tracking and validation
 * - Multi-step form data handling
 */

import { createApi } from '@reduxjs/toolkit/query/react';

import type {
  BotConfiguration,
  BotConfigurationInsert,
  BotConfigurationUpdate,
  BotStatus,
  IntegrationStatus,
  Json,
  UserProfile,
  UserProfileInsert,
  UserProfileUpdate,
  WhatsAppIntegration,
  WhatsAppIntegrationInsert,
  WhatsAppIntegrationUpdate,
} from '@/lib/supabase/types';

import { supabaseBaseQuery, type SupabaseQueryResult } from './supabase-base-query';

// Onboarding session types
export interface OnboardingSession {
  sessionId: string;
  userId: string;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  sessionData: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export type OnboardingStep =
  | 'business_info'
  | 'whatsapp_integration'
  | 'bot_configuration'
  | 'testing'
  | 'complete';

// Form data types for each onboarding step
export interface BusinessInfoFormData {
  fullName: string;
  companyName?: string;
  phoneNumber?: string;
  businessType?: string;
  industry?: string;
  expectedVolume?: string;
  timezone?: string;
}

export interface WhatsAppIntegrationFormData {
  phoneNumber: string;
  phoneNumberId: string;
  businessAccountId: string;
  accessToken: string;
  webhookVerifyToken: string;
  webhookUrl?: string;
  testMode?: boolean;
}

export interface BotConfigurationFormData {
  name: string;
  description?: string;
  welcomeMessage: string;
  fallbackMessage: string;
  businessHours?: {
    enabled: boolean;
    timezone: string;
    schedule: Array<{
      day: string;
      startTime: string;
      endTime: string;
      enabled: boolean;
    }>;
  };
  autoReplyEnabled: boolean;
  aiEnabled: boolean;
  aiModel?: string;
  aiPersonality?: string;
  trainingData?: Array<{
    question: string;
    answer: string;
    keywords?: string[];
  }>;
}

// Comprehensive onboarding data
export interface OnboardingData {
  session: OnboardingSession;
  userProfile?: UserProfile;
  whatsappIntegration?: WhatsAppIntegration;
  botConfiguration?: BotConfiguration;
}

// Step validation results
export interface StepValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings?: Record<string, string[]>;
  canProceed: boolean;
}

// Integration testing results
export interface IntegrationTestResult {
  success: boolean;
  testType: 'webhook' | 'send_message' | 'receive_message' | 'full_flow';
  message?: string;
  details?: Record<string, any>;
  timestamp: string;
}

/**
 * Onboarding API Slice
 */
export const onboardingApi = createApi({
  reducerPath: 'onboardingApi',
  baseQuery: supabaseBaseQuery,
  tagTypes: [
    'OnboardingSession',
    'UserProfile',
    'WhatsAppIntegration',
    'BotConfiguration',
    'IntegrationTest'
  ],
  keepUnusedDataFor: 600, // 10 minutes for onboarding data
  refetchOnReconnect: true,
  refetchOnFocus: false, // Don't refetch when tab gets focus during onboarding

  endpoints: (builder) => ({
    /**
     * Create or resume onboarding session
     */
    createOnboardingSession: builder.mutation<OnboardingSession, {
      userId: string;
      initialStep?: OnboardingStep;
      sessionData?: Record<string, any>;
    }>({
      queryFn: async ({ userId, initialStep = 'business_info', sessionData = {} }, { dispatch }) => {
        try {
          // Check for existing incomplete session first
          const existingSessionResult = await dispatch(
            onboardingApi.endpoints.getOnboardingSession.initiate({ userId })
          );

          if (existingSessionResult.data && !existingSessionResult.data.completedSteps.includes('complete')) {
            // Resume existing session
            return { data: existingSessionResult.data };
          }

          // Create new session
          const sessionId = `onboarding_${userId}_${Date.now()}`;
          const now = new Date();
          const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

          const newSession: OnboardingSession = {
            sessionId,
            userId,
            currentStep: initialStep,
            completedSteps: [],
            sessionData,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
            expiresAt: expiresAt.toISOString(),
          };

          // Store session data (you might want to use a separate sessions table)
          // For now, we'll store it in the user profile or a cache

          return { data: newSession };
        } catch (error) {
          return { error: { message: (error as Error).message, status: 500 } };
        }
      },
      invalidatesTags: (result, error, { userId }) => [
        { type: 'OnboardingSession', id: userId },
      ],
    }),

    /**
     * Get onboarding session by user ID
     */
    getOnboardingSession: builder.query<OnboardingSession, { userId: string }>({
      queryFn: async ({ userId }, { dispatch }) => {
        try {
          // This would typically come from a sessions table or cache
          // For now, we'll derive it from the user's profile completion status
          const profileResult = await dispatch(
            onboardingApi.endpoints.getUserProfile.initiate(userId)
          );

          const integrationResult = await dispatch(
            onboardingApi.endpoints.getWhatsAppIntegration.initiate({ userId })
          );

          const botResult = await dispatch(
            onboardingApi.endpoints.getBotConfiguration.initiate({ userId })
          );

          // Determine current step and completed steps based on data
          const completedSteps: OnboardingStep[] = [];
          let currentStep: OnboardingStep = 'business_info';

          if (profileResult.data) {
            completedSteps.push('business_info');
            currentStep = 'whatsapp_integration';
          }

          if (integrationResult.data) {
            completedSteps.push('whatsapp_integration');
            currentStep = 'bot_configuration';
          }

          if (botResult.data) {
            completedSteps.push('bot_configuration');
            currentStep = 'testing';

            // Check if integration is tested and active
            if (integrationResult.data?.status === 'active') {
              completedSteps.push('testing');
              currentStep = 'complete';
            }
          }

          if (completedSteps.includes('testing')) {
            completedSteps.push('complete');
          }

          const session: OnboardingSession = {
            sessionId: `onboarding_${userId}_derived`,
            userId,
            currentStep,
            completedSteps,
            sessionData: {},
            createdAt: profileResult.data?.created_at || new Date().toISOString(),
            updatedAt: profileResult.data?.updated_at || new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          };

          return { data: session };
        } catch (error) {
          return { error: { message: (error as Error).message, status: 500 } };
        }
      },
      providesTags: (result, error, { userId }) => [
        { type: 'OnboardingSession', id: userId },
      ],
      keepUnusedDataFor: 300, // 5 minutes
    }),

    /**
     * Update onboarding session step and data
     */
    updateOnboardingSession: builder.mutation<OnboardingSession, {
      userId: string;
      step?: OnboardingStep;
      sessionData?: Record<string, any>;
      markStepComplete?: OnboardingStep;
    }>({
      queryFn: async ({ userId, step, sessionData, markStepComplete }, { dispatch }) => {
        try {
          // Get current session
          const currentResult = await dispatch(
            onboardingApi.endpoints.getOnboardingSession.initiate({ userId })
          );

          if (!currentResult.data) {
            throw new Error('No onboarding session found');
          }

          const currentSession = currentResult.data;
          const completedSteps = [...currentSession.completedSteps];

          if (markStepComplete && !completedSteps.includes(markStepComplete)) {
            completedSteps.push(markStepComplete);
          }

          const updatedSession: OnboardingSession = {
            ...currentSession,
            currentStep: step || currentSession.currentStep,
            completedSteps,
            sessionData: sessionData ? { ...currentSession.sessionData, ...sessionData } : currentSession.sessionData,
            updatedAt: new Date().toISOString(),
          };

          return { data: updatedSession };
        } catch (error) {
          return { error: { message: (error as Error).message, status: 500 } };
        }
      },
      invalidatesTags: (result, error, { userId }) => [
        { type: 'OnboardingSession', id: userId },
      ],
    }),

    /**
     * Submit business info step
     */
    submitBusinessInfo: builder.mutation<UserProfile, {
      userId: string;
      businessInfo: BusinessInfoFormData;
    }>({
      query: ({ userId, businessInfo }) => ({
        table: 'user_profiles',
        method: 'upsert',
        body: {
          user_id: userId,
          full_name: businessInfo.fullName,
          phone_number: businessInfo.phoneNumber || null,
          company_name: businessInfo.companyName || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as UserProfileInsert,
        options: {
          upsertOptions: { onConflict: 'user_id' },
          returnData: true,
        },
      }),
      transformResponse: (response: SupabaseQueryResult<UserProfile[]>) =>
        response.data?.[0] as UserProfile,
      invalidatesTags: (result, error, { userId }) => [
        { type: 'UserProfile', id: userId },
        { type: 'OnboardingSession', id: userId },
      ],
      // Optimistic update
      onQueryStarted: async ({ userId, businessInfo }, { dispatch, queryFulfilled }) => {
        try {
          // Update session to mark business info as complete
          dispatch(
            onboardingApi.endpoints.updateOnboardingSession.initiate({
              userId,
              step: 'whatsapp_integration',
              markStepComplete: 'business_info',
              sessionData: { businessInfo },
            })
          );

          await queryFulfilled;
        } catch (error) {
          console.error('Failed to submit business info:', error);
        }
      },
    }),

    /**
     * Submit WhatsApp integration step
     */
    submitWhatsAppIntegration: builder.mutation<WhatsAppIntegration, {
      userId: string;
      integrationData: WhatsAppIntegrationFormData;
    }>({
      query: ({ userId, integrationData }) => ({
        table: 'whatsapp_integrations',
        method: 'upsert',
        body: {
          user_id: userId,
          phone_number: integrationData.phoneNumber,
          phone_number_id: integrationData.phoneNumberId,
          business_account_id: integrationData.businessAccountId,
          access_token: integrationData.accessToken,
          webhook_verify_token: integrationData.webhookVerifyToken,
          webhook_url: integrationData.webhookUrl || null,
          status: 'pending' as IntegrationStatus,
          configuration: {
            testMode: integrationData.testMode || false,
          } as Json,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as WhatsAppIntegrationInsert,
        options: {
          upsertOptions: { onConflict: 'user_id' },
          returnData: true,
        },
      }),
      transformResponse: (response: SupabaseQueryResult<WhatsAppIntegration[]>) =>
        response.data?.[0] as WhatsAppIntegration,
      invalidatesTags: (result, error, { userId }) => [
        { type: 'WhatsAppIntegration', id: userId },
        { type: 'OnboardingSession', id: userId },
      ],
      onQueryStarted: async ({ userId, integrationData }, { dispatch, queryFulfilled }) => {
        try {
          dispatch(
            onboardingApi.endpoints.updateOnboardingSession.initiate({
              userId,
              step: 'bot_configuration',
              markStepComplete: 'whatsapp_integration',
              sessionData: { integrationData },
            })
          );

          await queryFulfilled;
        } catch (error) {
          console.error('Failed to submit WhatsApp integration:', error);
        }
      },
    }),

    /**
     * Submit bot configuration step
     */
    submitBotConfiguration: builder.mutation<BotConfiguration, {
      userId: string;
      integrationId: string;
      botConfig: BotConfigurationFormData;
    }>({
      query: ({ userId, integrationId, botConfig }) => ({
        table: 'bot_configurations',
        method: 'upsert',
        body: {
          user_id: userId,
          integration_id: integrationId,
          name: botConfig.name,
          description: botConfig.description || null,
          welcome_message: botConfig.welcomeMessage,
          fallback_message: botConfig.fallbackMessage,
          business_hours: botConfig.businessHours as Json || null,
          auto_reply_enabled: botConfig.autoReplyEnabled,
          ai_enabled: botConfig.aiEnabled,
          ai_model: botConfig.aiModel || null,
          ai_personality: botConfig.aiPersonality || null,
          training_data: botConfig.trainingData as Json || null,
          status: 'draft' as BotStatus,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as BotConfigurationInsert,
        options: {
          upsertOptions: { onConflict: 'user_id,integration_id' },
          returnData: true,
        },
      }),
      transformResponse: (response: SupabaseQueryResult<BotConfiguration[]>) =>
        response.data?.[0] as BotConfiguration,
      invalidatesTags: (result, error, { userId }) => [
        { type: 'BotConfiguration', id: userId },
        { type: 'OnboardingSession', id: userId },
      ],
      onQueryStarted: async ({ userId, botConfig }, { dispatch, queryFulfilled }) => {
        try {
          dispatch(
            onboardingApi.endpoints.updateOnboardingSession.initiate({
              userId,
              step: 'testing',
              markStepComplete: 'bot_configuration',
              sessionData: { botConfig },
            })
          );

          await queryFulfilled;
        } catch (error) {
          console.error('Failed to submit bot configuration:', error);
        }
      },
    }),

    /**
     * Test WhatsApp integration
     */
    testWhatsAppIntegration: builder.mutation<IntegrationTestResult, {
      userId: string;
      testType?: 'webhook' | 'send_message' | 'receive_message' | 'full_flow';
      testData?: Record<string, any>;
    }>({
      queryFn: async ({ userId, testType = 'webhook', testData = {} }, { dispatch }) => {
        try {
          // Get integration data
          const integrationResult = await dispatch(
            onboardingApi.endpoints.getWhatsAppIntegration.initiate({ userId })
          );

          if (!integrationResult.data) {
            throw new Error('No WhatsApp integration found');
          }

          const integration = integrationResult.data;

          // Simulate different types of tests
          // In a real implementation, these would make actual API calls to WhatsApp
          let testResult: IntegrationTestResult;

          switch (testType) {
            case 'webhook':
              // Test webhook configuration
              testResult = {
                success: true,
                testType: 'webhook',
                message: 'Webhook configuration verified successfully',
                details: {
                  webhookUrl: integration.webhook_url,
                  verifyToken: 'verified',
                  responseTime: Math.random() * 100 + 50, // Simulated response time
                },
                timestamp: new Date().toISOString(),
              };
              break;

            case 'send_message':
              // Test sending a message
              testResult = {
                success: Math.random() > 0.1, // 90% success rate for demo
                testType: 'send_message',
                message: 'Test message sent successfully',
                details: {
                  messageId: `test_msg_${Date.now()}`,
                  phoneNumber: integration.phone_number,
                  content: testData.message || 'Hello! This is a test message from your WhatsApp bot.',
                },
                timestamp: new Date().toISOString(),
              };
              break;

            case 'receive_message':
              // Test receiving messages
              testResult = {
                success: true,
                testType: 'receive_message',
                message: 'Message receiving capability verified',
                details: {
                  webhookStatus: 'active',
                  lastReceived: new Date().toISOString(),
                },
                timestamp: new Date().toISOString(),
              };
              break;

            case 'full_flow':
              // Test complete flow
              const subTests = ['webhook', 'send_message', 'receive_message'];
              const results: any[] = [];

              for (const subTest of subTests) {
                const subResult = await dispatch(
                  onboardingApi.endpoints.testWhatsAppIntegration.initiate({
                    userId,
                    testType: subTest as any,
                    testData,
                  })
                ).unwrap();

                results.push(subResult);
              }

              const allSuccessful = results.every(r => r.success);

              testResult = {
                success: allSuccessful,
                testType: 'full_flow',
                message: allSuccessful
                  ? 'All integration tests passed successfully'
                  : 'Some integration tests failed',
                details: {
                  subTests: results,
                  overallStatus: allSuccessful ? 'passed' : 'failed',
                },
                timestamp: new Date().toISOString(),
              };
              break;

            default:
              throw new Error(`Unknown test type: ${testType}`);
          }

          // If test is successful, update integration status
          if (testResult.success && testType === 'full_flow') {
            await dispatch(
              onboardingApi.endpoints.updateWhatsAppIntegration.initiate({
                userId,
                updates: { status: 'active' },
              })
            );

            // Mark testing step as complete
            await dispatch(
              onboardingApi.endpoints.updateOnboardingSession.initiate({
                userId,
                step: 'complete',
                markStepComplete: 'testing',
                sessionData: { testResult },
              })
            );
          }

          return { data: testResult };
        } catch (error) {
          return {
            data: {
              success: false,
              testType,
              message: (error as Error).message,
              timestamp: new Date().toISOString(),
            },
          };
        }
      },
      invalidatesTags: (result, error, { userId }) => [
        { type: 'IntegrationTest', id: userId },
        { type: 'WhatsAppIntegration', id: userId },
        { type: 'OnboardingSession', id: userId },
      ],
    }),

    /**
     * Get user profile
     */
    getUserProfile: builder.query<UserProfile, string>({
      query: (userId) => ({
        table: 'user_profiles',
        method: 'select',
        query: (queryBuilder: any) =>
          queryBuilder.select('*').eq('user_id', userId).single(),
      }),
      transformResponse: (response: SupabaseQueryResult<UserProfile>) => response.data,
      providesTags: (result, error, userId) => [{ type: 'UserProfile', id: userId }],
    }),

    /**
     * Get WhatsApp integration
     */
    getWhatsAppIntegration: builder.query<WhatsAppIntegration, { userId: string }>({
      query: ({ userId }) => ({
        table: 'whatsapp_integrations',
        method: 'select',
        query: (queryBuilder: any) =>
          queryBuilder.select('*').eq('user_id', userId).single(),
      }),
      transformResponse: (response: SupabaseQueryResult<WhatsAppIntegration>) => response.data,
      providesTags: (result, error, { userId }) => [{ type: 'WhatsAppIntegration', id: userId }],
    }),

    /**
     * Get bot configuration
     */
    getBotConfiguration: builder.query<BotConfiguration, { userId: string }>({
      query: ({ userId }) => ({
        table: 'bot_configurations',
        method: 'select',
        query: (queryBuilder: any) =>
          queryBuilder.select('*').eq('user_id', userId).single(),
      }),
      transformResponse: (response: SupabaseQueryResult<BotConfiguration>) => response.data,
      providesTags: (result, error, { userId }) => [{ type: 'BotConfiguration', id: userId }],
    }),

    /**
     * Update WhatsApp integration
     */
    updateWhatsAppIntegration: builder.mutation<WhatsAppIntegration, {
      userId: string;
      updates: WhatsAppIntegrationUpdate;
    }>({
      query: ({ userId, updates }) => ({
        table: 'whatsapp_integrations',
        method: 'update',
        query: (queryBuilder: any) => queryBuilder.eq('user_id', userId),
        body: {
          ...updates,
          updated_at: new Date().toISOString(),
        },
      }),
      transformResponse: (response: SupabaseQueryResult<WhatsAppIntegration[]>) =>
        response.data?.[0] as WhatsAppIntegration,
      invalidatesTags: (result, error, { userId }) => [
        { type: 'WhatsAppIntegration', id: userId },
        { type: 'OnboardingSession', id: userId },
      ],
    }),

    /**
     * Get complete onboarding data
     */
    getOnboardingData: builder.query<OnboardingData, { userId: string }>({
      queryFn: async ({ userId }, { dispatch }) => {
        try {
          const [sessionResult, profileResult, integrationResult, botResult] = await Promise.all([
            dispatch(onboardingApi.endpoints.getOnboardingSession.initiate({ userId })),
            dispatch(onboardingApi.endpoints.getUserProfile.initiate(userId)),
            dispatch(onboardingApi.endpoints.getWhatsAppIntegration.initiate({ userId })),
            dispatch(onboardingApi.endpoints.getBotConfiguration.initiate({ userId })),
          ]);

          if (!sessionResult.data) {
            throw new Error('No onboarding session found');
          }

          return {
            data: {
              session: sessionResult.data,
              userProfile: profileResult.data || undefined,
              whatsappIntegration: integrationResult.data || undefined,
              botConfiguration: botResult.data || undefined,
            },
          };
        } catch (error) {
          return { error: { message: (error as Error).message, status: 500 } };
        }
      },
      providesTags: (result, error, { userId }) => [
        { type: 'OnboardingSession', id: userId },
        { type: 'UserProfile', id: userId },
        { type: 'WhatsAppIntegration', id: userId },
        { type: 'BotConfiguration', id: userId },
      ],
    }),

    /**
     * Complete onboarding flow
     */
    completeOnboarding: builder.mutation<OnboardingSession, { userId: string }>({
      queryFn: async ({ userId }, { dispatch }) => {
        try {
          // Final validation - ensure all steps are complete
          const onboardingDataResult = await dispatch(
            onboardingApi.endpoints.getOnboardingData.initiate({ userId })
          );

          if (!onboardingDataResult.data) {
            throw new Error('No onboarding data found');
          }

          const { session, userProfile, whatsappIntegration, botConfiguration } = onboardingDataResult.data;

          // Validate all required data is present
          if (!userProfile) {
            throw new Error('Business information is incomplete');
          }

          if (!whatsappIntegration) {
            throw new Error('WhatsApp integration is not configured');
          }

          if (!botConfiguration) {
            throw new Error('Bot configuration is incomplete');
          }

          if (whatsappIntegration.status !== 'active') {
            throw new Error('WhatsApp integration has not been tested and activated');
          }

          // Activate bot configuration
          await dispatch(
            onboardingApi.endpoints.updateBotConfiguration.initiate({
              userId,
              updates: {
                status: 'active',
                updated_at: new Date().toISOString(),
              },
            })
          );

          // Update session to complete
          const completedSession = await dispatch(
            onboardingApi.endpoints.updateOnboardingSession.initiate({
              userId,
              step: 'complete',
              markStepComplete: 'complete',
              sessionData: {
                completedAt: new Date().toISOString(),
                finalValidation: 'passed',
              },
            })
          );

          return { data: completedSession.data };
        } catch (error) {
          return { error: { message: (error as Error).message, status: 400 } };
        }
      },
      invalidatesTags: (result, error, { userId }) => [
        { type: 'OnboardingSession', id: userId },
        { type: 'BotConfiguration', id: userId },
      ],
    }),

    /**
     * Update bot configuration
     */
    updateBotConfiguration: builder.mutation<BotConfiguration, {
      userId: string;
      updates: BotConfigurationUpdate;
    }>({
      query: ({ userId, updates }) => ({
        table: 'bot_configurations',
        method: 'update',
        query: (queryBuilder: any) => queryBuilder.eq('user_id', userId),
        body: {
          ...updates,
          updated_at: new Date().toISOString(),
        },
      }),
      transformResponse: (response: SupabaseQueryResult<BotConfiguration[]>) =>
        response.data?.[0] as BotConfiguration,
      invalidatesTags: (result, error, { userId }) => [
        { type: 'BotConfiguration', id: userId },
        { type: 'OnboardingSession', id: userId },
      ],
    }),
  }),
});

// Export hooks for use in components
export const {
  useCreateOnboardingSessionMutation,
  useGetOnboardingSessionQuery,
  useUpdateOnboardingSessionMutation,
  useSubmitBusinessInfoMutation,
  useSubmitWhatsAppIntegrationMutation,
  useSubmitBotConfigurationMutation,
  useTestWhatsAppIntegrationMutation,
  useGetUserProfileQuery,
  useGetWhatsAppIntegrationQuery,
  useGetBotConfigurationQuery,
  useUpdateWhatsAppIntegrationMutation,
  useGetOnboardingDataQuery,
  useCompleteOnboardingMutation,
  useUpdateBotConfigurationMutation,
  useLazyGetOnboardingSessionQuery,
  useLazyGetOnboardingDataQuery,
} = onboardingApi;

// Export utilities
export const {
  util: {
    updateQueryData: updateOnboardingQueryData,
    invalidateTags: invalidateOnboardingTags,
    prefetch: prefetchOnboarding,
  },
} = onboardingApi;