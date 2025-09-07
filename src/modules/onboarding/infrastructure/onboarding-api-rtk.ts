/**
 * RTK Query Wrapper for Real Onboarding API
 * Provides Redux Toolkit Query interface for the real Supabase-backed API
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import type {
  AutoMessageFormData,
  BusinessInfoFormData,
  PhoneNumberFormData,
  PlanSelectionFormData,
  RegistrationFormData
} from '../domain/schemas'
import type { OnboardingState } from '../domain/types'

import { onboardingApi } from './services/onboarding-api'

/**
 * RTK Query API that wraps the real onboarding service
 * This maintains compatibility with existing components while using real backend
 */
export const realOnboardingApi = createApi({
  reducerPath: 'realOnboardingApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }), // Not used, but required by RTK Query
  tagTypes: ['OnboardingSession'],
  endpoints: (builder) => ({
    /**
     * Save business info - Step 1
     */
    saveBusinessInfo: builder.mutation<
      { success: boolean; sessionId: string },
      BusinessInfoFormData
    >({
      queryFn: async (data) => {
        try {
          const result = await onboardingApi.saveBusinessInfo(data)

          console.log('[OnboardingAPI] Business info saved:', {
            sessionId: result.sessionId,
            data: data.businessName
          })

          return {
            data: {
              success: result.success,
              sessionId: result.sessionId
            }
          }
        } catch (error) {
          console.error('[OnboardingAPI] Failed to save business info:', error)
          return {
            error: {
              status: 500,
              data: { message: 'Failed to save business information' }
            }
          }
        }
      },
      invalidatesTags: ['OnboardingSession']
    }),

    /**
     * Save phone number - Step 2
     */
    savePhoneNumber: builder.mutation<
      { success: boolean; verified: boolean },
      PhoneNumberFormData
    >({
      queryFn: async (data) => {
        try {
          const result = await onboardingApi.savePhoneNumber(data)

          console.log('[OnboardingAPI] Phone number saved:', {
            phoneNumber: data.phoneNumber,
            verified: result.verified
          })

          return {
            data: {
              success: result.success,
              verified: result.verified
            }
          }
        } catch (error) {
          console.error('[OnboardingAPI] Failed to save phone number:', error)
          return {
            error: {
              status: 500,
              data: { message: 'Failed to save phone number' }
            }
          }
        }
      },
      invalidatesTags: ['OnboardingSession']
    }),

    /**
     * Save auto message - Step 3
     */
    saveAutoMessage: builder.mutation<
      { success: boolean; messageId: string },
      AutoMessageFormData
    >({
      queryFn: async (data) => {
        try {
          const result = await onboardingApi.saveAutoMessage(data)

          console.log('[OnboardingAPI] Auto message saved:', {
            messageId: result.messageId,
            messageLength: data.welcomeMessage.length
          })

          return {
            data: {
              success: result.success,
              messageId: result.messageId
            }
          }
        } catch (error) {
          console.error('[OnboardingAPI] Failed to save auto message:', error)
          return {
            error: {
              status: 500,
              data: { message: 'Failed to save auto message' }
            }
          }
        }
      },
      invalidatesTags: ['OnboardingSession']
    }),

    /**
     * Save plan selection - Step 4
     */
    savePlanSelection: builder.mutation<
      { success: boolean; checkoutUrl?: string },
      PlanSelectionFormData & { priceVariant: 'A' | 'B' | 'C' }
    >({
      queryFn: async (data) => {
        try {
          const result = await onboardingApi.savePlanSelection(data)

          console.log('[OnboardingAPI] Plan selection saved:', {
            plan: data.planType,
            billing: data.billingCycle,
            variant: data.priceVariant
          })

          return {
            data: {
              success: result.success,
              checkoutUrl: result.checkoutUrl
            }
          }
        } catch (error) {
          console.error('[OnboardingAPI] Failed to save plan selection:', error)
          return {
            error: {
              status: 500,
              data: { message: 'Failed to save plan selection' }
            }
          }
        }
      },
      invalidatesTags: ['OnboardingSession']
    }),

    /**
     * Complete registration - Step 5
     */
    completeRegistration: builder.mutation<
      { success: boolean; userId: string; betaAccess: boolean },
      RegistrationFormData | { authMethod: 'google'; googleToken: string }
    >({
      queryFn: async (data) => {
        try {
          const result = await onboardingApi.completeRegistration(data)

          console.log('[OnboardingAPI] Registration completed:', {
            userId: result.userId,
            betaAccess: result.betaAccess,
            authMethod: 'googleToken' in data ? 'google' : 'email'
          })

          return {
            data: {
              success: result.success,
              userId: result.userId,
              betaAccess: result.betaAccess
            }
          }
        } catch (error) {
          console.error('[OnboardingAPI] Failed to complete registration:', error)
          return {
            error: {
              status: 500,
              data: { message: 'Failed to complete registration' }
            }
          }
        }
      },
      invalidatesTags: ['OnboardingSession']
    }),

    /**
     * Get existing onboarding session
     */
    getOnboardingSession: builder.query<OnboardingState | null, void>({
      queryFn: async () => {
        try {
          const session = await onboardingApi.getOnboardingSession()

          console.log('[OnboardingAPI] Session retrieved:', {
            exists: !!session,
            currentStep: session?.currentStep,
            completedSteps: session?.completedSteps?.length || 0
          })

          return {
            data: session
          }
        } catch (error) {
          console.error('[OnboardingAPI] Failed to get session:', error)
          return {
            data: null
          }
        }
      },
      providesTags: ['OnboardingSession']
    }),

    /**
     * Clear onboarding session
     */
    clearOnboardingSession: builder.mutation<{ success: boolean }, void>({
      queryFn: async () => {
        try {
          const result = await onboardingApi.clearOnboardingSession()

          console.log('[OnboardingAPI] Session cleared')

          return {
            data: {
              success: result.success
            }
          }
        } catch (error) {
          console.error('[OnboardingAPI] Failed to clear session:', error)
          return {
            error: {
              status: 500,
              data: { message: 'Failed to clear session' }
            }
          }
        }
      },
      invalidatesTags: ['OnboardingSession']
    })
  })
})

/**
 * Export hooks for use in components
 * These match the exact same interface as the fake API
 */
export const {
  useSaveBusinessInfoMutation,
  useSavePhoneNumberMutation,
  useSaveAutoMessageMutation,
  useSavePlanSelectionMutation,
  useCompleteRegistrationMutation,
  useGetOnboardingSessionQuery,
  useClearOnboardingSessionMutation
} = realOnboardingApi