import { baseApi } from '../../../../store/api/base-api'
import type { 
  OnboardingSession, 
  OnboardingStep, 
  OnboardingStatus 
} from '../../domain/entities/onboarding-session'
import type { 
  BusinessInfo, 
  BusinessType, 
  Industry 
} from '../../domain/value-objects/business-info'

// DTOs for API requests/responses
interface OnboardingSessionResponse {
  id: string
  userEmail: string
  currentStep: OnboardingStep
  status: OnboardingStatus
  completedSteps: OnboardingStep[]
  startedAt: string
  lastActivityAt: string
  completedAt?: string
  metadata?: Record<string, unknown>
}

interface CreateSessionRequest {
  userEmail: string
}

interface UpdateSessionRequest {
  sessionId: string
  currentStep?: OnboardingStep
  status?: OnboardingStatus
  metadata?: Record<string, unknown>
}

interface BusinessInfoRequest {
  sessionId: string
  companyName: string
  businessType: BusinessType
  industry: Industry
  employeeCount: number
  website?: string
  description?: string
  expectedVolume: 'low' | 'medium' | 'high'
}

interface IntegrationConfigRequest {
  sessionId: string
  whatsappPhoneNumber: string
  whatsappToken: string
  webhookUrl?: string
  verifyToken?: string
}

interface PhoneVerificationRequest {
  sessionId: string
  phoneNumber: string
  verificationCode?: string
}

interface BotSetupRequest {
  sessionId: string
  botName: string
  welcomeMessage: string
  fallbackMessage: string
  businessHours?: {
    enabled: boolean
    timezone: string
    schedule: Record<string, { start: string; end: string }>
  }
  autoResponses?: Array<{
    keywords: string[]
    response: string
  }>
}

interface OnboardingStatsResponse {
  totalSessions: number
  completedSessions: number
  averageCompletionTime: number // in minutes
  dropOffByStep: Record<OnboardingStep, number>
  conversionRate: number
}

// Onboarding API service using RTK Query
export const onboardingApiService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Session management
    createOnboardingSession: builder.mutation<OnboardingSessionResponse, CreateSessionRequest>({
      query: (request) => ({
        url: '/onboarding/sessions',
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['OnboardingSession'],
    }),

    getOnboardingSession: builder.query<OnboardingSessionResponse, string>({
      query: (sessionId) => `/onboarding/sessions/${sessionId}`,
      providesTags: (_result, _error, sessionId) => [
        { type: 'OnboardingSession', id: sessionId }
      ],
    }),

    getUserOnboardingSessions: builder.query<OnboardingSessionResponse[], { 
      userEmail: string 
      status?: OnboardingStatus 
    }>({
      query: ({ userEmail, status }) => {
        const params = new URLSearchParams({ userEmail })
        if (status) params.append('status', status)
        return `/onboarding/sessions/user?${params.toString()}`
      },
      providesTags: ['OnboardingSession'],
    }),

    updateOnboardingSession: builder.mutation<OnboardingSessionResponse, UpdateSessionRequest>({
      query: ({ sessionId, ...updates }) => ({
        url: `/onboarding/sessions/${sessionId}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (_result, _error, { sessionId }) => [
        { type: 'OnboardingSession', id: sessionId }
      ],
    }),

    // Step-specific endpoints
    submitBusinessInfo: builder.mutation<{ success: boolean }, BusinessInfoRequest>({
      query: ({ sessionId, ...businessInfo }) => ({
        url: `/onboarding/sessions/${sessionId}/business-info`,
        method: 'POST',
        body: businessInfo,
      }),
      invalidatesTags: (_result, _error, { sessionId }) => [
        { type: 'OnboardingSession', id: sessionId }
      ],
    }),

    configureIntegration: builder.mutation<{ success: boolean; webhookUrl?: string }, IntegrationConfigRequest>({
      query: ({ sessionId, ...config }) => ({
        url: `/onboarding/sessions/${sessionId}/integration`,
        method: 'POST',
        body: config,
      }),
      invalidatesTags: (_result, _error, { sessionId }) => [
        { type: 'OnboardingSession', id: sessionId }
      ],
    }),

    requestPhoneVerification: builder.mutation<{ success: boolean; verificationMethod: string }, PhoneVerificationRequest>({
      query: ({ sessionId, phoneNumber }) => ({
        url: `/onboarding/sessions/${sessionId}/phone-verification`,
        method: 'POST',
        body: { phoneNumber },
      }),
    }),

    verifyPhoneNumber: builder.mutation<{ success: boolean }, PhoneVerificationRequest>({
      query: ({ sessionId, phoneNumber, verificationCode }) => ({
        url: `/onboarding/sessions/${sessionId}/phone-verification/verify`,
        method: 'POST',
        body: { phoneNumber, verificationCode },
      }),
      invalidatesTags: (_result, _error, { sessionId }) => [
        { type: 'OnboardingSession', id: sessionId }
      ],
    }),

    setupBot: builder.mutation<{ success: boolean; botId: string }, BotSetupRequest>({
      query: ({ sessionId, ...botConfig }) => ({
        url: `/onboarding/sessions/${sessionId}/bot-setup`,
        method: 'POST',
        body: botConfig,
      }),
      invalidatesTags: (_result, _error, { sessionId }) => [
        { type: 'OnboardingSession', id: sessionId }
      ],
    }),

    testBotConfiguration: builder.mutation<{ 
      success: boolean 
      testResults: {
        webhookConnectivity: boolean
        whatsappApiAccess: boolean
        messageDelivery: boolean
        issues?: string[]
      }
    }, string>({
      query: (sessionId) => ({
        url: `/onboarding/sessions/${sessionId}/test`,
        method: 'POST',
      }),
    }),

    completeOnboarding: builder.mutation<{ 
      success: boolean 
      botId: string 
      dashboardUrl: string 
    }, string>({
      query: (sessionId) => ({
        url: `/onboarding/sessions/${sessionId}/complete`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, sessionId) => [
        { type: 'OnboardingSession', id: sessionId }
      ],
    }),

    // Analytics and progress tracking
    getOnboardingStats: builder.query<OnboardingStatsResponse, {
      startDate?: string
      endDate?: string
    }>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams()
        if (params.startDate) searchParams.append('startDate', params.startDate)
        if (params.endDate) searchParams.append('endDate', params.endDate)
        return `/onboarding/analytics?${searchParams.toString()}`
      },
      providesTags: ['Analytics'],
    }),

    // Session recovery and resumption
    pauseOnboarding: builder.mutation<{ success: boolean }, string>({
      query: (sessionId) => ({
        url: `/onboarding/sessions/${sessionId}/pause`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, sessionId) => [
        { type: 'OnboardingSession', id: sessionId }
      ],
    }),

    resumeOnboarding: builder.mutation<{ success: boolean }, string>({
      query: (sessionId) => ({
        url: `/onboarding/sessions/${sessionId}/resume`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, sessionId) => [
        { type: 'OnboardingSession', id: sessionId }
      ],
    }),

    // Helper endpoints
    validateWhatsAppToken: builder.mutation<{ 
      valid: boolean 
      phoneNumberId?: string 
      displayPhoneNumber?: string 
    }, {
      token: string
      phoneNumber: string
    }>({
      query: (credentials) => ({
        url: '/onboarding/validate-whatsapp-token',
        method: 'POST',
        body: credentials,
      }),
    }),

    generateWebhookToken: builder.mutation<{ 
      verifyToken: string 
      webhookUrl: string 
    }, string>({
      query: (sessionId) => ({
        url: `/onboarding/sessions/${sessionId}/generate-webhook`,
        method: 'POST',
      }),
    }),
  }),
  overrideExisting: false,
})

// Export hooks for components
export const {
  useCreateOnboardingSessionMutation,
  useGetOnboardingSessionQuery,
  useGetUserOnboardingSessionsQuery,
  useUpdateOnboardingSessionMutation,
  useSubmitBusinessInfoMutation,
  useConfigureIntegrationMutation,
  useRequestPhoneVerificationMutation,
  useVerifyPhoneNumberMutation,
  useSetupBotMutation,
  useTestBotConfigurationMutation,
  useCompleteOnboardingMutation,
  useGetOnboardingStatsQuery,
  usePauseOnboardingMutation,
  useResumeOnboardingMutation,
  useValidateWhatsAppTokenMutation,
  useGenerateWebhookTokenMutation,
} = onboardingApiService