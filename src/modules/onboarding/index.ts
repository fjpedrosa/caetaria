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

// Module Configuration - Functional Approach (Recommended)
export type {
  Environment,
  OnboardingModuleConfiguration,
  OnboardingModuleDependencies,
  OnboardingRepositoryConfiguration,
  OnboardingServiceConfiguration,
  OnboardingUseCaseConfiguration,
  RepositoryFactory,
  ServiceFactory,
  UseCaseFactory
} from './onboarding-module';
export {
  createConfigForEnvironment,
  createDevelopmentConfig,
  // Functional Module Factory
  createOnboardingModule,
  // Pure Configuration Functions
  createOnboardingModuleConfiguration,
  createProductionConfig,
  createTestConfig,
  environmentConfigFactories,
  // Backward Compatibility (Deprecated)
  OnboardingModuleConfig,
  // Use Case Factories
  OnboardingUseCaseFactories,
  // Dependency Registration Functions
  registerOnboardingDependencies,
  registerOnlyRepositories,
  registerOnlyServices,
  registerOnlyUseCases} from './onboarding-module';