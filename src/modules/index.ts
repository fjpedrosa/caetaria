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

// Module configurations for easy setup
export { LandingModuleConfig } from './marketing/marketing-module';
export { OnboardingModuleConfig } from './onboarding/onboarding-module';