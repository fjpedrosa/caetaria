/**
 * Marketing Module Configuration - Functional Implementation
 * Clean Architecture - Dependency registration using pure functions
 *
 * MIGRATION GUIDE:
 * ================
 *
 * OLD CLASS-BASED APPROACH (Deprecated):
 * ```typescript
 * import { LandingModuleConfig } from '@/modules/marketing';
 *
 * const config = new LandingModuleConfig('production');
 * config.registerDependencies(container);
 * ```
 *
 * NEW FUNCTIONAL APPROACH (Recommended):
 * ```typescript
 * import {
 *   createProductionConfig,
 *   registerMarketingModuleDependencies
 * } from '@/modules/marketing';
 *
 * const config = createProductionConfig();
 * registerMarketingModuleDependencies(config)(container);
 * ```
 *
 * CONVENIENCE FUNCTIONS:
 * ```typescript
 * import { setupMarketingModuleForProduction } from '@/modules/marketing';
 *
 * setupMarketingModuleForProduction(container);
 * ```
 *
 * BENEFITS:
 * - Pure functions (easier to test)
 * - Immutable configurations
 * - Environment-specific factories
 * - Functional composition
 * - Better tree-shaking
 * - No side effects in constructors
 */

import {
  createUseCaseFactory,
  DEPENDENCY_TOKENS,
  DependencyContainer,
  ModuleConfig} from '../shared/application/interfaces/dependency-container';

import { AnalyticsService } from './application/ports/analytics-service';
import { NotificationService } from './application/ports/notification-service';
import { createGetLandingAnalyticsUseCase, GetLandingAnalyticsUseCase } from './application/use-cases/get-landing-analytics';
import { createSubmitLeadFormUseCase, SubmitLeadFormUseCase } from './application/use-cases/submit-lead-form';
import { LeadRepository } from './domain/repositories/lead-repository';
import { createEmail } from './domain/value-objects/email';
import { createSupabaseLeadRepository } from './infra/adapters/supabase-lead-repository';
import { createEmailNotificationService } from './infra/services/email-notification-service';
import { createGoogleAnalyticsService, createMockAnalyticsService } from './infra/services/google-analytics-service';

// =============================================================================
// FUNCTIONAL CONFIGURATION TYPES
// =============================================================================

/**
 * Environment type definition
 */
export type Environment = 'development' | 'production' | 'test';

/**
 * Marketing module configuration structure
 */
export interface MarketingModuleConfig {
  readonly environment: Environment;
  readonly analytics: AnalyticsConfig;
  readonly notification: NotificationConfig;
}

/**
 * Analytics service configuration
 */
export interface AnalyticsConfig {
  readonly measurementId?: string;
  readonly debug: boolean;
  readonly mockInDevelopment: boolean;
}

/**
 * Notification service configuration
 */
export interface NotificationConfig {
  readonly fromEmail: string;
  readonly salesTeamChannel?: string;
  readonly baseUrl: string;
}

/**
 * Service registration function type
 */
type ServiceRegistration = (container: DependencyContainer) => void;

/**
 * Configuration factory function type
 */
type ConfigurationFactory<T> = (environment: Environment) => T;

// =============================================================================
// PURE CONFIGURATION FUNCTIONS
// =============================================================================

/**
 * Creates analytics service configuration based on environment
 */
const createAnalyticsConfig: ConfigurationFactory<AnalyticsConfig> = (environment) => ({
  measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  debug: environment === 'development',
  mockInDevelopment: environment !== 'production',
});

/**
 * Creates notification service configuration based on environment
 */
const createNotificationConfig: ConfigurationFactory<NotificationConfig> = (environment) => ({
  fromEmail: process.env.MARKETING_FROM_EMAIL || 'hello@whatsappcloud.com',
  salesTeamChannel: process.env.SLACK_SALES_CHANNEL,
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://whatsappcloud.com',
});

/**
 * Creates complete marketing module configuration
 */
export const createMarketingModuleConfig = (environment: Environment): MarketingModuleConfig => ({
  environment,
  analytics: createAnalyticsConfig(environment),
  notification: createNotificationConfig(environment),
});

// =============================================================================
// REPOSITORY REGISTRATION FUNCTIONS
// =============================================================================

/**
 * Registers lead repository with container
 */
const registerLeadRepository: ServiceRegistration = (container) => {
  container.registerFactory(DEPENDENCY_TOKENS.LEAD_REPOSITORY, (container) => {
    const supabaseClient = container.resolve(DEPENDENCY_TOKENS.SUPABASE_CLIENT) as any;
    return createSupabaseLeadRepository({ supabase: supabaseClient });
  });
};

// =============================================================================
// SERVICE REGISTRATION FUNCTIONS
// =============================================================================

/**
 * Registers analytics service based on configuration
 */
const createAnalyticsServiceRegistration = (config: AnalyticsConfig): ServiceRegistration =>
  (container) => {
    if (config.mockInDevelopment) {
      container.register(DEPENDENCY_TOKENS.ANALYTICS_SERVICE, createMockAnalyticsService());
    } else {
      container.registerFactory(DEPENDENCY_TOKENS.ANALYTICS_SERVICE, () => {
        if (!config.measurementId) {
          console.warn('GA_MEASUREMENT_ID not configured, using mock analytics');
          return createMockAnalyticsService();
        }
        return createGoogleAnalyticsService({
          measurementId: config.measurementId,
          debug: config.debug,
        });
      });
    }
  };

/**
 * Registers notification service based on configuration
 */
const createNotificationServiceRegistration = (config: NotificationConfig): ServiceRegistration =>
  (container) => {
    container.registerFactory(DEPENDENCY_TOKENS.NOTIFICATION_SERVICE, (container) => {
      const emailClient = container.resolve(DEPENDENCY_TOKENS.EMAIL_CLIENT);
      const slackClient = container.has(DEPENDENCY_TOKENS.SLACK_CLIENT)
        ? container.resolve(DEPENDENCY_TOKENS.SLACK_CLIENT)
        : undefined;

      return createEmailNotificationService(
        emailClient as any,
        {
          fromEmail: createEmail(config.fromEmail),
          salesTeamChannel: config.salesTeamChannel,
          baseUrl: config.baseUrl,
        },
        slackClient as any
      );
    });
  };

// =============================================================================
// USE CASE REGISTRATION FUNCTIONS
// =============================================================================

/**
 * Registers submit lead form use case
 */
const registerSubmitLeadFormUseCase: ServiceRegistration = (container) => {
  container.registerFactory(DEPENDENCY_TOKENS.SUBMIT_LEAD_FORM_USE_CASE, (container) => {
    return createSubmitLeadFormUseCase({
      leadRepository: container.resolve<LeadRepository>(DEPENDENCY_TOKENS.LEAD_REPOSITORY),
      analyticsService: container.resolve<AnalyticsService>(DEPENDENCY_TOKENS.ANALYTICS_SERVICE),
      notificationService: container.resolve<NotificationService>(DEPENDENCY_TOKENS.NOTIFICATION_SERVICE),
    });
  });
};

/**
 * Registers get landing analytics use case
 */
const registerGetLandingAnalyticsUseCase: ServiceRegistration = (container) => {
  container.registerFactory(DEPENDENCY_TOKENS.GET_LANDING_ANALYTICS_USE_CASE, (container) => {
    return createGetLandingAnalyticsUseCase({
      leadRepository: container.resolve<LeadRepository>(DEPENDENCY_TOKENS.LEAD_REPOSITORY),
    });
  });
};

// =============================================================================
// MAIN REGISTRATION FUNCTION
// =============================================================================

/**
 * Registers all marketing module dependencies using functional composition
 */
export const registerMarketingModuleDependencies = (config: MarketingModuleConfig) =>
  (container: DependencyContainer): void => {
    // Compose all registration functions
    const registrations: ServiceRegistration[] = [
      registerLeadRepository,
      createAnalyticsServiceRegistration(config.analytics),
      createNotificationServiceRegistration(config.notification),
      registerSubmitLeadFormUseCase,
      registerGetLandingAnalyticsUseCase,
    ];

    // Apply all registrations to the container
    registrations.forEach(register => register(container));
  };

// =============================================================================
// ENVIRONMENT-SPECIFIC CONFIGURATION FACTORIES
// =============================================================================

/**
 * Creates development configuration with sensible defaults
 */
export const createDevelopmentConfig = (): MarketingModuleConfig =>
  createMarketingModuleConfig('development');

/**
 * Creates production configuration with production optimizations
 */
export const createProductionConfig = (): MarketingModuleConfig =>
  createMarketingModuleConfig('production');

/**
 * Creates test configuration with mocked services
 */
export const createTestConfig = (): MarketingModuleConfig =>
  createMarketingModuleConfig('test');

/**
 * Factory function to create configuration based on environment
 */
export const createConfigForEnvironment = (env: Environment): MarketingModuleConfig => {
  switch (env) {
    case 'development':
      return createDevelopmentConfig();
    case 'production':
      return createProductionConfig();
    case 'test':
      return createTestConfig();
    default:
      throw new Error(`Unknown environment: ${env}`);
  }
};

// =============================================================================
// FUNCTIONAL USE CASE FACTORIES
// =============================================================================

/**
 * Marketing Module Use Case Factories (Functional Implementation)
 * Provides type-safe factories for creating use cases
 */
export const MarketingUseCaseFactories = {
  submitLeadForm: createUseCaseFactory<SubmitLeadFormUseCase>((container) =>
    container.resolve(DEPENDENCY_TOKENS.SUBMIT_LEAD_FORM_USE_CASE)
  ),

  getLandingAnalytics: createUseCaseFactory<GetLandingAnalyticsUseCase>((container) =>
    container.resolve(DEPENDENCY_TOKENS.GET_LANDING_ANALYTICS_USE_CASE)
  ),
};

/**
 * @deprecated Use MarketingUseCaseFactories instead
 * Backward compatibility alias - will be removed in next major version
 */
export const LandingUseCaseFactories = MarketingUseCaseFactories;

// =============================================================================
// BACKWARD COMPATIBILITY - CLASS-BASED WRAPPER
// =============================================================================

/**
 * @deprecated Use functional configuration instead
 * Backward compatibility wrapper - will be removed in next major version
 *
 * Migration guide:
 * ```typescript
 * // Old way
 * const config = new LandingModuleConfig('production');
 * config.registerDependencies(container);
 *
 * // New way
 * const config = createProductionConfig();
 * registerMarketingModuleDependencies(config)(container);
 * ```
 */
export class LandingModuleConfig implements ModuleConfig {
  private readonly config: MarketingModuleConfig;

  constructor(environment: Environment = 'development') {
    this.config = createConfigForEnvironment(environment);
    console.warn('LandingModuleConfig class is deprecated. Use functional configuration instead.');
  }

  registerDependencies(container: DependencyContainer): void {
    registerMarketingModuleDependencies(this.config)(container);
  }

  /**
   * @deprecated Use createConfigForEnvironment instead
   */
  getConfig(): MarketingModuleConfig {
    return this.config;
  }
}

// =============================================================================
// TYPE DEFINITIONS FOR EXTERNAL DEPENDENCIES
// =============================================================================

/**
 * External dependencies required by the marketing module
 */
export interface MarketingModuleDependencies {
  readonly supabaseClient: any; // Supabase client
  readonly emailClient: any; // Email service client
  readonly slackClient?: any; // Optional Slack client
  readonly config: {
    readonly fromEmail: string;
    readonly slackSalesChannel?: string;
    readonly baseUrl: string;
    readonly gaTrackingId?: string;
  };
}

/**
 * @deprecated Use MarketingModuleDependencies instead
 * Backward compatibility alias - will be removed in next major version
 */
export interface LandingModuleDependencies extends MarketingModuleDependencies {}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Quick setup function for development environment
 */
export const setupMarketingModuleForDevelopment = (container: DependencyContainer): void => {
  const config = createDevelopmentConfig();
  registerMarketingModuleDependencies(config)(container);
};

/**
 * Quick setup function for production environment
 */
export const setupMarketingModuleForProduction = (container: DependencyContainer): void => {
  const config = createProductionConfig();
  registerMarketingModuleDependencies(config)(container);
};

/**
 * Quick setup function for test environment
 */
export const setupMarketingModuleForTest = (container: DependencyContainer): void => {
  const config = createTestConfig();
  registerMarketingModuleDependencies(config)(container);
};

/**
 * Generic setup function with custom configuration
 */
export const setupMarketingModuleWithConfig = (config: MarketingModuleConfig) =>
  (container: DependencyContainer): void => {
    registerMarketingModuleDependencies(config)(container);
  };