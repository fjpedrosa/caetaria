export type OnboardingStep = 1 | 2 | 3 | 4 | 5

export interface OnboardingState {
  currentStep: OnboardingStep
  completedSteps: OnboardingStep[]
  data: {
    businessInfo?: {
      businessName: string
      sector: string
      employeeCount: string
      monthlyClients: string
    }
    phoneNumber?: {
      phoneNumber: string
      countryCode: string
      isWhatsAppBusiness: boolean
    }
    autoMessage?: {
      welcomeMessage: string
      responseTime: string
      enableKeywords: boolean
      keywords?: string[]
    }
    planSelection?: {
      planType: 'starter' | 'pro' | 'enterprise'
      billingCycle: 'monthly' | 'yearly'
      addOns?: string[]
    }
    registration?: {
      email: string
      authMethod: 'email' | 'google'
    }
  }
  metadata: {
    startedAt: string
    lastUpdatedAt: string
    sessionId: string
    priceVariant?: 'A' | 'B' | 'C'
  }
}

export interface StepProps {
  onNext: (data: any) => void
  onPrev: () => void
  defaultValues?: any
  isFirstStep?: boolean
  isLastStep?: boolean
}

export interface OnboardingAnalyticsEvent {
  event: 'onboarding_step_view' | 'onboarding_step_complete' | 'onboarding_complete' | 'onboarding_abandon'
  properties: {
    step?: number
    stepName?: string
    sessionId: string
    timeSpent?: number
    priceVariant?: string
    [key: string]: any
  }
}