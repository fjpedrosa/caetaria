export type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6

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

// =============================================================================
// BUSINESS FORM DATA TYPES - Business domain concepts
// =============================================================================

export type BusinessType = 'startup' | 'sme' | 'enterprise' | 'agency' | 'non-profit' | 'other';
export type Industry = 'e-commerce' | 'healthcare' | 'education' | 'finance' | 'real-estate' | 'travel' | 'food-beverage' | 'technology' | 'consulting' | 'retail' | 'other';
export type VolumeLevel = 'low' | 'medium' | 'high';

export interface BusinessInfoData {
  companyName: string;
  businessType: BusinessType;
  industry: Industry;
  employeeCount: number;
  website?: string;
  description?: string;
  expectedVolume: VolumeLevel;
}

export interface WhatsAppIntegrationData {
  phoneNumber: string;
  phoneNumberId: string;
  businessAccountId: string;
  accessToken: string;
  webhookVerifyToken: string;
  webhookUrl?: string;
  testMode: boolean;
}

export interface BotConfigurationData {
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

// =============================================================================
// FORM COMPONENT PROPS - Pure UI concerns
// =============================================================================

export interface BusinessInfoFormProps {
  onSubmit: (data: BusinessInfoData) => void;
  defaultValues?: Partial<BusinessInfoData>;
  isLoading?: boolean;
  className?: string;
}

export interface WhatsAppIntegrationFormProps {
  onSubmit: (data: WhatsAppIntegrationData) => void;
  defaultValues?: Partial<WhatsAppIntegrationData>;
  isLoading?: boolean;
  className?: string;
  showTestMode?: boolean;
}

export interface BotConfigurationFormProps {
  onSubmit: (data: BotConfigurationData) => void;
  defaultValues?: Partial<BotConfigurationData>;
  isLoading?: boolean;
  className?: string;
  showAdvanced?: boolean;
}

export interface OnboardingStepWrapperProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  step: number;
  totalSteps: number;
  className?: string;
  onBack?: () => void;
  showProgress?: boolean;
}

export interface OnboardingStepperProps {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  className?: string;
  variant?: 'default' | 'minimal';
}