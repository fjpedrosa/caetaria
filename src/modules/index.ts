/**
 * Modules Barrel Export
 * Clean Architecture - Main module interface
 */

// Re-export all modules
export * from './analytics';
export * from './marketing';
export * from './onboarding';
export * from './pricing';
export * from './shared';

// Module configurations for easy setup (backward compatibility)
export { LandingModuleConfig } from './marketing/marketing-module';
export { OnboardingModuleConfig } from './onboarding/onboarding-module';

// New functional configuration exports - Marketing Module
export {
  createDevelopmentConfig as createMarketingDevelopmentConfig,
  createMarketingModuleConfig,
  createProductionConfig as createMarketingProductionConfig,
  createTestConfig as createMarketingTestConfig,
  registerMarketingModuleDependencies,
  setupMarketingModuleForDevelopment,
  setupMarketingModuleForProduction,
  setupMarketingModuleForTest,
} from './marketing/marketing-module';

// New functional configuration exports - Onboarding Module
export {
  createConfigForEnvironment as createOnboardingConfigForEnvironment,
  createDevelopmentConfig as createOnboardingDevelopmentConfig,
  // Module Factory
  createOnboardingModule,
  // Configuration Functions
  createOnboardingModuleConfiguration,
  createProductionConfig as createOnboardingProductionConfig,
  createTestConfig as createOnboardingTestConfig,
  // Types
  type Environment as OnboardingEnvironment,
  environmentConfigFactories as onboardingEnvironmentConfigFactories,
  type OnboardingModuleConfiguration,
  type OnboardingRepositoryConfiguration,
  type OnboardingServiceConfiguration,
  type OnboardingUseCaseConfiguration,
  // Registration Functions
  registerOnboardingDependencies,
  registerOnlyRepositories as registerOnlyOnboardingRepositories,
  registerOnlyServices as registerOnlyOnboardingServices,
  registerOnlyUseCases as registerOnlyOnboardingUseCases,
} from './onboarding/onboarding-module';