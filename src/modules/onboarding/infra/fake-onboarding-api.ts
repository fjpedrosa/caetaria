import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import type { 
  AutoMessageFormData,
  BusinessInfoFormData, 
  PhoneNumberFormData, 
  PlanSelectionFormData,
  RegistrationFormData
} from '../domain/schemas'
import type { OnboardingState } from '../domain/types'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

const STORAGE_KEY = 'onboarding_session'

const loadFromStorage = (): Partial<OnboardingState> | null => {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : null
}

const saveToStorage = (data: Partial<OnboardingState>) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const fakeOnboardingApi = createApi({
  reducerPath: 'fakeOnboardingApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  tagTypes: ['OnboardingSession'],
  endpoints: (builder) => ({
    saveBusinessInfo: builder.mutation<
      { success: boolean; sessionId: string },
      BusinessInfoFormData
    >({
      queryFn: async (data) => {
        await delay(800)
        
        const stored = loadFromStorage() || {}
        const sessionId = stored.metadata?.sessionId || generateSessionId()
        
        const updated: Partial<OnboardingState> = {
          ...stored,
          currentStep: 2,
          completedSteps: [...(stored.completedSteps || []), 1],
          data: {
            ...stored.data,
            businessInfo: data
          },
          metadata: {
            ...stored.metadata,
            sessionId,
            lastUpdatedAt: new Date().toISOString(),
            startedAt: stored.metadata?.startedAt || new Date().toISOString()
          }
        }
        
        saveToStorage(updated)
        
        console.log('[FakeAPI] Business info saved:', data)
        
        return { 
          data: { 
            success: true, 
            sessionId 
          } 
        }
      },
      invalidatesTags: ['OnboardingSession']
    }),

    savePhoneNumber: builder.mutation<
      { success: boolean; verified: boolean },
      PhoneNumberFormData
    >({
      queryFn: async (data) => {
        await delay(1000)
        
        const stored = loadFromStorage() || {}
        
        const updated: Partial<OnboardingState> = {
          ...stored,
          currentStep: 3,
          completedSteps: [...(stored.completedSteps || []), 2],
          data: {
            ...stored.data,
            phoneNumber: {
              phoneNumber: data.phoneNumber || '',
              countryCode: data.countryCode,
              isWhatsAppBusiness: data.isWhatsAppBusiness
            }
          },
          metadata: {
            ...stored.metadata,
            lastUpdatedAt: new Date().toISOString()
          }
        }
        
        saveToStorage(updated)
        
        console.log('[FakeAPI] Phone number saved:', data)
        
        return { 
          data: { 
            success: true, 
            verified: Math.random() > 0.2 
          } 
        }
      },
      invalidatesTags: ['OnboardingSession']
    }),

    saveAutoMessage: builder.mutation<
      { success: boolean; messageId: string },
      AutoMessageFormData
    >({
      queryFn: async (data) => {
        await delay(600)
        
        const stored = loadFromStorage() || {}
        
        const updated: Partial<OnboardingState> = {
          ...stored,
          currentStep: 4,
          completedSteps: [...(stored.completedSteps || []), 3],
          data: {
            ...stored.data,
            autoMessage: data
          },
          metadata: {
            ...stored.metadata,
            lastUpdatedAt: new Date().toISOString()
          }
        }
        
        saveToStorage(updated)
        
        console.log('[FakeAPI] Auto message saved:', data)
        
        return { 
          data: { 
            success: true, 
            messageId: `msg_${Date.now()}` 
          } 
        }
      },
      invalidatesTags: ['OnboardingSession']
    }),

    savePlanSelection: builder.mutation<
      { success: boolean; checkoutUrl?: string },
      PlanSelectionFormData & { priceVariant: 'A' | 'B' | 'C' }
    >({
      queryFn: async (data) => {
        await delay(800)
        
        const stored = loadFromStorage() || {}
        
        const updated: Partial<OnboardingState> = {
          ...stored,
          currentStep: 5,
          completedSteps: [...(stored.completedSteps || []), 4],
          data: {
            ...stored.data,
            planSelection: {
              planType: data.planType,
              billingCycle: data.billingCycle,
              addOns: data.addOns
            }
          },
          metadata: {
            ...stored.metadata,
            priceVariant: data.priceVariant,
            lastUpdatedAt: new Date().toISOString()
          }
        }
        
        saveToStorage(updated)
        
        console.log('[FakeAPI] Plan selection saved:', data)
        
        return { 
          data: { 
            success: true,
            checkoutUrl: '#checkout'
          } 
        }
      },
      invalidatesTags: ['OnboardingSession']
    }),

    completeRegistration: builder.mutation<
      { success: boolean; userId: string; betaAccess: boolean },
      RegistrationFormData | { authMethod: 'google'; googleToken: string }
    >({
      queryFn: async (data) => {
        await delay(1500)
        
        const stored = loadFromStorage() || {}
        
        const updated: Partial<OnboardingState> = {
          ...stored,
          currentStep: 5,
          completedSteps: [...(stored.completedSteps || []), 5],
          data: {
            ...stored.data,
            registration: 'googleToken' in data 
              ? { email: 'user@gmail.com', authMethod: 'google' }
              : { email: data.email, authMethod: 'email' }
          },
          metadata: {
            ...stored.metadata,
            lastUpdatedAt: new Date().toISOString()
          }
        }
        
        saveToStorage(updated)
        
        console.log('[FakeAPI] Registration completed:', data)
        
        return { 
          data: { 
            success: true,
            userId: `user_${Date.now()}`,
            betaAccess: true
          } 
        }
      },
      invalidatesTags: ['OnboardingSession']
    }),

    getOnboardingSession: builder.query<OnboardingState | null, void>({
      queryFn: async () => {
        await delay(200)
        const stored = loadFromStorage()
        
        if (!stored) {
          return { 
            data: null 
          }
        }
        
        return { 
          data: stored as OnboardingState 
        }
      },
      providesTags: ['OnboardingSession']
    }),

    clearOnboardingSession: builder.mutation<{ success: boolean }, void>({
      queryFn: async () => {
        await delay(200)
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY)
        }
        
        console.log('[FakeAPI] Onboarding session cleared')
        
        return { 
          data: { 
            success: true 
          } 
        }
      },
      invalidatesTags: ['OnboardingSession']
    })
  })
})

export const {
  useSaveBusinessInfoMutation,
  useSavePhoneNumberMutation,
  useSaveAutoMessageMutation,
  useSavePlanSelectionMutation,
  useCompleteRegistrationMutation,
  useGetOnboardingSessionQuery,
  useClearOnboardingSessionMutation
} = fakeOnboardingApi