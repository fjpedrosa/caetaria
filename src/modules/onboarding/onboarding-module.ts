/**
 * Onboarding Module Configuration
 * Module-level dependency registration and configuration
 */

import { 
  createUseCaseFactory, 
  DEPENDENCY_TOKENS,
  DependencyContainer, 
  ModuleConfig} from '../shared/application/interfaces/dependency-container';

/**
 * Onboarding Module Configuration
 * Registers all dependencies for the onboarding module
 */
export class OnboardingModuleConfig implements ModuleConfig {
  constructor(
    private readonly environment: 'development' | 'production' | 'test' = 'development'
  ) {}

  registerDependencies(container: DependencyContainer): void {
    // Register repositories (placeholder for now)
    container.registerFactory(DEPENDENCY_TOKENS.ONBOARDING_SESSION_REPOSITORY, (container) => {
      // Implementation would go here when repository is created
      throw new Error('OnboardingSessionRepository not implemented yet');
    });

    // Register services (placeholder for now)
    container.registerFactory(DEPENDENCY_TOKENS.ONBOARDING_SERVICE, (container) => {
      // Implementation would go here when service is created
      throw new Error('OnboardingService not implemented yet');
    });

    // Use cases would be registered here as they're implemented
  }
}

/**
 * Onboarding Module Use Case Factories (placeholder)
 */
export const OnboardingUseCaseFactories = {
  // Factories will be added as use cases are implemented
};

/**
 * Type definitions for external dependencies
 */
export interface OnboardingModuleDependencies {
  supabaseClient: any;
  config: {
    baseUrl: string;
  };
}