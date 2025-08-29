/**
 * Onboarding Module Barrel Export
 * Clean Architecture - Module public interface
 */

// Domain Layer - Pure business logic
export type { 
  OnboardingSession, 
  OnboardingSessionId, 
  OnboardingStatus,
  OnboardingStep} from './domain/entities/onboarding-session';
export {
  advanceOnboardingStep,
  calculateOnboardingProgress,
  createOnboardingSession,
  getNextOnboardingStep,
  isStepAccessible,
  pauseOnboarding,
  resumeOnboarding,
  updateOnboardingMetadata} from './domain/entities/onboarding-session';
export type {
  BusinessInfo,
  BusinessType,
  Industry
} from './domain/value-objects/business-info';
export {
  createBusinessInfo,
  formatWebsiteUrl,
  getBusinessSizeCategory,
  getBusinessTypeDisplayName,
  getIndustryDisplayName,
  getRecommendedPlan} from './domain/value-objects/business-info';

// Module Configuration
export type { OnboardingModuleConfig, OnboardingModuleDependencies,OnboardingUseCaseFactories } from './onboarding-module';