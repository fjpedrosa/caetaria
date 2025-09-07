/**
 * Real Onboarding API Service
 * Connects to Supabase backend for persistent storage
 */

import type {
  AutoMessageFormData,
  BusinessInfoFormData,
  PhoneNumberFormData,
  PlanSelectionFormData,
  RegistrationFormData
} from '../../domain/schemas'
import type { OnboardingState } from '../../domain/types'

const API_BASE = '/api/onboarding'
const STORAGE_KEY = 'onboarding_session'

/**
 * Helper to save to localStorage as fallback
 */
const saveToLocalStorage = (data: Partial<OnboardingState>) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

/**
 * Helper to load from localStorage
 */
const loadFromLocalStorage = (): Partial<OnboardingState> | null => {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error('Failed to load from localStorage:', error)
    return null
  }
}

/**
 * Helper to generate anonymous user email
 */
const generateAnonymousEmail = () => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  return `anon_${timestamp}_${random}@temp.local`
}

/**
 * Helper to get or create user email
 */
const getUserEmail = (): string => {
  // Try to get from localStorage first
  const stored = loadFromLocalStorage()
  if (stored?.data?.registration?.email) {
    return stored.data.registration.email
  }

  // Check if we have a stored anonymous email
  const anonEmailKey = 'onboarding_anon_email'
  let anonEmail = localStorage.getItem(anonEmailKey)

  if (!anonEmail) {
    anonEmail = generateAnonymousEmail()
    localStorage.setItem(anonEmailKey, anonEmail)
  }

  return anonEmail
}

/**
 * Make API request with error handling and retry logic
 */
const apiRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      lastError = error as Error
      console.error(`API request attempt ${attempt + 1} failed:`, error)

      // Don't retry on client errors (4xx)
      if (error instanceof Error && error.message.includes('HTTP 4')) {
        break
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  }

  throw lastError || new Error('API request failed after retries')
}

/**
 * Save step data to backend
 */
const saveStepToBackend = async (
  step: number,
  data: any,
  flowId: string = 'default'
): Promise<{ success: boolean; sessionId?: string; recoveryToken?: string }> => {
  try {
    const userEmail = getUserEmail()

    // First, ensure we have a session started
    const sessionResponse = await apiRequest<any>(`${API_BASE}`, {
      method: 'POST',
      body: JSON.stringify({
        userEmail,
        conversionSource: 'onboarding-wizard',
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
        },
      }),
    }).catch(() => null)

    // Now save the step data
    const result = await apiRequest<any>(`${API_BASE}/save-step`, {
      method: 'POST',
      body: JSON.stringify({
        step,
        data,
        flowId,
        userEmail, // Include email for anonymous tracking
      }),
    })

    return {
      success: result.success,
      sessionId: result.sessionId || sessionResponse?.sessionId,
      recoveryToken: result.recoveryToken || sessionResponse?.recoveryToken,
    }
  } catch (error) {
    console.error('Failed to save step to backend:', error)
    // Don't throw - we'll fall back to localStorage
    return { success: false }
  }
}

/**
 * Get existing session from backend
 */
const getSessionFromBackend = async (): Promise<OnboardingState | null> => {
  try {
    const userEmail = getUserEmail()

    const result = await apiRequest<any>(`${API_BASE}?email=${encodeURIComponent(userEmail)}`)

    if (result.sessionId) {
      return {
        currentStep: result.currentStep,
        completedSteps: result.completedSteps || [],
        data: result.stepData || {},
        metadata: {
          sessionId: result.sessionId,
          startedAt: result.createdAt || new Date().toISOString(),
          lastUpdatedAt: result.updatedAt || new Date().toISOString(),
        }
      }
    }

    return null
  } catch (error) {
    console.error('Failed to get session from backend:', error)
    return null
  }
}

/**
 * Main Onboarding API Service
 */
export const onboardingApi = {
  /**
   * Save business info (Step 1)
   */
  async saveBusinessInfo(data: BusinessInfoFormData) {
    const stored = loadFromLocalStorage() || {}
    const sessionId = stored.metadata?.sessionId || `session_${Date.now()}`

    // Update local storage immediately for offline support
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

    saveToLocalStorage(updated)

    // Attempt to save to backend
    const backendResult = await saveStepToBackend(1, { businessInfo: data })

    return {
      success: true,
      sessionId: backendResult.sessionId || sessionId,
      data: updated
    }
  },

  /**
   * Save phone number (Step 2)
   */
  async savePhoneNumber(data: PhoneNumberFormData) {
    const stored = loadFromLocalStorage() || {}
    const sessionId = stored.metadata?.sessionId || `session_${Date.now()}`

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
        sessionId,
        lastUpdatedAt: new Date().toISOString()
      }
    }

    saveToLocalStorage(updated)

    // Attempt to save to backend
    await saveStepToBackend(2, { phoneNumber: data })

    return {
      success: true,
      verified: true, // For now, always return verified
      data: updated
    }
  },

  /**
   * Save auto message (Step 3)
   */
  async saveAutoMessage(data: AutoMessageFormData) {
    const stored = loadFromLocalStorage() || {}
    const sessionId = stored.metadata?.sessionId || `session_${Date.now()}`

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
        sessionId,
        lastUpdatedAt: new Date().toISOString()
      }
    }

    saveToLocalStorage(updated)

    // Attempt to save to backend
    await saveStepToBackend(3, { autoMessage: data })

    return {
      success: true,
      messageId: `msg_${Date.now()}`,
      data: updated
    }
  },

  /**
   * Save plan selection (Step 4)
   */
  async savePlanSelection(data: PlanSelectionFormData & { priceVariant: 'A' | 'B' | 'C' }) {
    const stored = loadFromLocalStorage() || {}
    const sessionId = stored.metadata?.sessionId || `session_${Date.now()}`

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
        sessionId,
        priceVariant: data.priceVariant,
        lastUpdatedAt: new Date().toISOString()
      }
    }

    saveToLocalStorage(updated)

    // Attempt to save to backend
    await saveStepToBackend(4, { planSelection: data })

    return {
      success: true,
      checkoutUrl: '#checkout',
      data: updated
    }
  },

  /**
   * Complete registration (Step 5)
   */
  async completeRegistration(data: RegistrationFormData | { authMethod: 'google'; googleToken: string }) {
    const stored = loadFromLocalStorage() || {}
    const sessionId = stored.metadata?.sessionId || `session_${Date.now()}`

    const registrationData = 'googleToken' in data
      ? { email: 'user@gmail.com', authMethod: 'google' as const }
      : { email: data.email, authMethod: 'email' as const }

    const updated: Partial<OnboardingState> = {
      ...stored,
      currentStep: 5,
      completedSteps: [...(stored.completedSteps || []), 5],
      data: {
        ...stored.data,
        registration: registrationData
      },
      metadata: {
        ...stored.metadata,
        sessionId,
        lastUpdatedAt: new Date().toISOString()
      }
    }

    saveToLocalStorage(updated)

    // Attempt to save to backend with complete flag
    await saveStepToBackend(5, {
      registration: registrationData,
      completed: true
    })

    // Clear anonymous email after successful registration
    if (registrationData.email !== 'user@gmail.com') {
      localStorage.removeItem('onboarding_anon_email')
    }

    return {
      success: true,
      userId: `user_${Date.now()}`,
      betaAccess: true,
      data: updated
    }
  },

  /**
   * Get existing onboarding session
   */
  async getOnboardingSession(): Promise<OnboardingState | null> {
    // Try backend first
    const backendSession = await getSessionFromBackend()
    if (backendSession) {
      // Sync with localStorage
      saveToLocalStorage(backendSession)
      return backendSession
    }

    // Fall back to localStorage
    const stored = loadFromLocalStorage()
    return stored as OnboardingState | null
  },

  /**
   * Clear onboarding session
   */
  async clearOnboardingSession() {
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('onboarding_anon_email')

    // No need to clear backend as we're using anonymous tracking

    return {
      success: true
    }
  }
}