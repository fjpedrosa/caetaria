/**
 * Onboarding Module Barrel Export
 * Clean Architecture - Module public interface
 */

// Domain Layer - Pure business logic
export type { 
  OnboardingSession, 
  OnboardingSessionId, 
  OnboardingStep, 
  OnboardingStatus
} from './domain/entities/onboarding-session';

export {
  createOnboardingSession,
  advanceOnboardingStep,
  updateOnboardingMetadata,
  pauseOnboarding,
  resumeOnboarding,
  calculateOnboardingProgress,
  getNextOnboardingStep,
  isStepAccessible
} from './domain/entities/onboarding-session';

export type {
  BusinessInfo,
  BusinessType,
  Industry
} from './domain/value-objects/business-info';

export {
  createBusinessInfo,
  getBusinessSizeCategory,
  getRecommendedPlan,
  formatWebsiteUrl,
  getBusinessTypeDisplayName,
  getIndustryDisplayName
} from './domain/value-objects/business-info';

// Module Configuration
export type { OnboardingModuleConfig, OnboardingUseCaseFactories, OnboardingModuleDependencies } from './onboarding-module';