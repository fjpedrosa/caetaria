/**
 * Onboarding Module Configuration
 * Functional implementation following Clean Architecture principles
 * Module-level dependency registration and configuration
 */

import {
  createUseCaseFactory,
  DEPENDENCY_TOKENS,
  DependencyContainer,
  ModuleConfig
} from '../shared/application/interfaces/dependency-container';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * Environment configuration type
 */
export type Environment = 'development' | 'production' | 'test';

/**
 * Onboarding module configuration object
 */
export interface OnboardingModuleConfiguration {
  readonly environment: Environment;
  readonly repositories: OnboardingRepositoryConfiguration;
  readonly services: OnboardingServiceConfiguration;
  readonly useCases: OnboardingUseCaseConfiguration;
}

/**
 * Repository configuration
 */
export interface OnboardingRepositoryConfiguration {
  readonly sessionRepository: RepositoryFactory;
}

/**
 * Service configuration
 */
export interface OnboardingServiceConfiguration {
  readonly onboardingService: ServiceFactory;
}

/**
 * Use case configuration
 */
export interface OnboardingUseCaseConfiguration {
  // Use case factories will be added as they're implemented
}

/**
 * Type definitions for external dependencies
 */
export interface OnboardingModuleDependencies {
  supabaseClient: any;
  config: {
    baseUrl: string;
  };
}

/**
 * Factory function type for repositories
 */
export type RepositoryFactory = (container: DependencyContainer) => unknown;

/**
 * Factory function type for services
 */
export type ServiceFactory = (container: DependencyContainer) => unknown;

/**
 * Factory function type for use cases
 */
export type UseCaseFactory = (container: DependencyContainer) => unknown;

// =============================================================================
// PURE CONFIGURATION FUNCTIONS
// =============================================================================

/**
 * Creates repository configuration for the given environment
 * Pure function - no side effects
 */
const createRepositoryConfiguration = (environment: Environment): OnboardingRepositoryConfiguration => ({
  sessionRepository: (container: DependencyContainer) => {
    // Implementation would go here when repository is created
    // For now, we maintain the same placeholder behavior
    throw new Error(`OnboardingSessionRepository not implemented yet for environment: ${environment}`);
  }
});

/**
 * Creates service configuration for the given environment
 * Pure function - no side effects
 */
const createServiceConfiguration = (environment: Environment): OnboardingServiceConfiguration => ({
  onboardingService: (container: DependencyContainer) => {
    // Implementation would go here when service is created
    // For now, we maintain the same placeholder behavior
    throw new Error(`OnboardingService not implemented yet for environment: ${environment}`);
  }
});

/**
 * Creates use case configuration for the given environment
 * Pure function - no side effects
 */
const createUseCaseConfiguration = (environment: Environment): OnboardingUseCaseConfiguration => ({
  // Use case factories will be added as they're implemented
});

/**
 * Creates complete onboarding module configuration
 * Pure function - no side effects
 */
export const createOnboardingModuleConfiguration = (
  environment: Environment = 'development'
): OnboardingModuleConfiguration => ({
  environment,
  repositories: createRepositoryConfiguration(environment),
  services: createServiceConfiguration(environment),
  useCases: createUseCaseConfiguration(environment)
});

// =============================================================================
// DEPENDENCY REGISTRATION FUNCTIONS
// =============================================================================

/**
 * Registers repository dependencies
 * Pure function that takes configuration and returns registration function
 */
const registerRepositoryDependencies = (
  config: OnboardingRepositoryConfiguration
) => (container: DependencyContainer): void => {
  container.registerFactory(DEPENDENCY_TOKENS.ONBOARDING_SESSION_REPOSITORY, config.sessionRepository);
};

/**
 * Registers service dependencies
 * Pure function that takes configuration and returns registration function
 */
const registerServiceDependencies = (
  config: OnboardingServiceConfiguration
) => (container: DependencyContainer): void => {
  container.registerFactory(DEPENDENCY_TOKENS.ONBOARDING_SERVICE, config.onboardingService);
};

/**
 * Registers use case dependencies
 * Pure function that takes configuration and returns registration function
 */
const registerUseCaseDependencies = (
  config: OnboardingUseCaseConfiguration
) => (container: DependencyContainer): void => {
  // Use cases would be registered here as they're implemented
};

/**
 * Registers all onboarding module dependencies
 * Functional composition of all registration functions
 */
export const registerOnboardingDependencies = (
  config: OnboardingModuleConfiguration
) => (container: DependencyContainer): void => {
  // Compose all registration functions
  const registerRepositories = registerRepositoryDependencies(config.repositories);
  const registerServices = registerServiceDependencies(config.services);
  const registerUseCases = registerUseCaseDependencies(config.useCases);

  // Execute registrations
  registerRepositories(container);
  registerServices(container);
  registerUseCases(container);
};

// =============================================================================
// ENVIRONMENT-SPECIFIC FACTORY FUNCTIONS
// =============================================================================

/**
 * Creates development environment configuration
 * Pure function with development-specific settings
 */
export const createDevelopmentConfig = (): OnboardingModuleConfiguration =>
  createOnboardingModuleConfiguration('development');

/**
 * Creates production environment configuration
 * Pure function with production-specific settings
 */
export const createProductionConfig = (): OnboardingModuleConfiguration =>
  createOnboardingModuleConfiguration('production');

/**
 * Creates test environment configuration
 * Pure function with test-specific settings
 */
export const createTestConfig = (): OnboardingModuleConfiguration =>
  createOnboardingModuleConfiguration('test');

/**
 * Environment-specific configuration factory map
 * Immutable configuration object
 */
export const environmentConfigFactories = {
  development: createDevelopmentConfig,
  production: createProductionConfig,
  test: createTestConfig
} as const;

/**
 * Creates configuration for any environment
 * Pure function with environment detection
 */
export const createConfigForEnvironment = (
  environment: Environment
): OnboardingModuleConfiguration => {
  const factory = environmentConfigFactories[environment];
  return factory();
};

// =============================================================================
// MODULAR SERVICE REGISTRATION FUNCTIONS
// =============================================================================

/**
 * Registers only repository dependencies
 * Useful for testing or partial module loading
 */
export const registerOnlyRepositories = (
  environment: Environment = 'development'
) => (container: DependencyContainer): void => {
  const config = createConfigForEnvironment(environment);
  const registerRepositories = registerRepositoryDependencies(config.repositories);
  registerRepositories(container);
};

/**
 * Registers only service dependencies
 * Useful for testing or partial module loading
 */
export const registerOnlyServices = (
  environment: Environment = 'development'
) => (container: DependencyContainer): void => {
  const config = createConfigForEnvironment(environment);
  const registerServices = registerServiceDependencies(config.services);
  registerServices(container);
};

/**
 * Registers only use case dependencies
 * Useful for testing or partial module loading
 */
export const registerOnlyUseCases = (
  environment: Environment = 'development'
) => (container: DependencyContainer): void => {
  const config = createConfigForEnvironment(environment);
  const registerUseCases = registerUseCaseDependencies(config.useCases);
  registerUseCases(container);
};

// =============================================================================
// FUNCTIONAL MODULE FACTORY
// =============================================================================

/**
 * Creates a complete onboarding module with all dependencies registered
 * Pure function that returns registration function
 */
export const createOnboardingModule = (
  environment: Environment = 'development'
) => {
  const config = createConfigForEnvironment(environment);
  return {
    config,
    registerDependencies: registerOnboardingDependencies(config)
  };
};

// =============================================================================
// USE CASE FACTORIES (PLACEHOLDER)
// =============================================================================

/**
 * Onboarding Module Use Case Factories
 * Functional approach to use case creation
 */
export const OnboardingUseCaseFactories = {
  // Factories will be added as use cases are implemented
  // Example structure:
  // createCompleteOnboardingUseCase: createUseCaseFactory((container) => {
  //   const repository = container.resolve(DEPENDENCY_TOKENS.ONBOARDING_SESSION_REPOSITORY);
  //   const service = container.resolve(DEPENDENCY_TOKENS.ONBOARDING_SERVICE);
  //   return new CompleteOnboardingUseCase(repository, service);
  // })
};

// =============================================================================
// BACKWARD COMPATIBILITY (DEPRECATED)
// =============================================================================

/**
 * @deprecated Use createOnboardingModule() instead
 * Backward compatibility wrapper for existing code
 * This maintains the same interface as the original class
 */
export class OnboardingModuleConfig implements ModuleConfig {
  private readonly moduleConfig: OnboardingModuleConfiguration;
  private readonly registrationFunction: (container: DependencyContainer) => void;

  constructor(
    private readonly environment: Environment = 'development'
  ) {
    // Use the functional implementation internally
    const module = createOnboardingModule(environment);
    this.moduleConfig = module.config;
    this.registrationFunction = module.registerDependencies;
  }

  /**
   * @deprecated Use registerOnboardingDependencies() function instead
   */
  registerDependencies(container: DependencyContainer): void {
    this.registrationFunction(container);
  }

  /**
   * Get the functional configuration (for migration purposes)
   */
  getConfig(): OnboardingModuleConfiguration {
    return this.moduleConfig;
  }

  /**
   * Get the environment
   */
  getEnvironment(): Environment {
    return this.environment;
  }
}