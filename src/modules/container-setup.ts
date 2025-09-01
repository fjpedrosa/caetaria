/**
 * Application Container Setup
 * Clean Architecture - Dependency injection configuration
 */

import {
  createConfigForEnvironment,
  LandingModuleConfig,
  registerMarketingModuleDependencies
} from './marketing/marketing-module';
import {
  createOnboardingModule,
  OnboardingModuleConfig,
  registerOnlyRepositories,
  registerOnlyServices
} from './onboarding/onboarding-module';
import {
  createSimpleDependencyContainer,
  DEPENDENCY_TOKENS,
  DependencyContainer,
  SimpleDependencyContainer} from './shared/application/interfaces/dependency-container';

/**
 * Application configuration interface
 */
export interface ApplicationConfig {
  environment: 'development' | 'production' | 'test';
  supabase: {
    url: string;
    anonKey: string;
  };
  email: {
    fromEmail: string;
  };
  analytics: {
    gaTrackingId?: string;
  };
  slack?: {
    salesChannel: string;
    botToken: string;
  };
  baseUrl: string;
}

/**
 * Creates and configures the application dependency container
 * Using the new functional implementation with higher-order functions
 */
export function createApplicationContainer(config: ApplicationConfig): DependencyContainer {
  const container = createSimpleDependencyContainer();

  // Register shared dependencies
  container.register(DEPENDENCY_TOKENS.CONFIG, {
    fromEmail: config.email.fromEmail,
    slackSalesChannel: config.slack?.salesChannel,
    baseUrl: config.baseUrl,
    gaTrackingId: config.analytics.gaTrackingId,
  });

  // Register external clients
  registerExternalClients(container, config);

  // Register module configurations
  // Marketing module
  const marketingConfig = createConfigForEnvironment(config.environment);
  registerMarketingModuleDependencies(marketingConfig)(container);


  // Onboarding module
  const onboardingModule = createOnboardingModule(config.environment);
  onboardingModule.registerDependencies(container);


  return container;
}

/**
 * Register external service clients
 */
function registerExternalClients(container: DependencyContainer, config: ApplicationConfig): void {
  // Supabase client factory
  container.registerFactory(DEPENDENCY_TOKENS.SUPABASE_CLIENT, () => {
    // In a real app, this would create the actual Supabase client
    // For now, we'll create a mock that matches the interface
    return createMockSupabaseClient();
  });

  // Email client factory
  container.registerFactory(DEPENDENCY_TOKENS.EMAIL_CLIENT, () => {
    // In a real app, this would create Resend, SendGrid, etc.
    return createMockEmailClient();
  });

  // Slack client factory (optional)
  if (config.slack) {
    container.registerFactory(DEPENDENCY_TOKENS.SLACK_CLIENT, () => {
      return createMockSlackClient();
    });
  }

  // Logger
  container.register(DEPENDENCY_TOKENS.LOGGER, console);
}

/**
 * Mock Supabase client for development/testing
 */
function createMockSupabaseClient() {
  return {
    from: (table: string) => ({
      select: (columns: string) => ({
        eq: (column: string, value: any) => ({
          single: () => Promise.resolve({ data: null, error: { code: 'PGRST116' } }),
        }),
        gte: (column: string, value: any) => ({
          lte: (column: string, value: any) => ({
            order: (column: string, options: any) => Promise.resolve({ data: [], error: null })
          })
        }),
        order: (column: string, options: any) => Promise.resolve({ data: [], error: null }),
      }),
      upsert: (data: any) => Promise.resolve({ error: null }),
      delete: () => ({ eq: (column: string, value: any) => Promise.resolve({ error: null }) }),
    }),
  };
}

/**
 * Mock email client for development/testing
 */
function createMockEmailClient() {
  return {
    send: async (params: any) => {
      console.log('[Mock Email] Sending email:', params);
      return { id: `mock-email-${Date.now()}` };
    },
  };
}

/**
 * Mock Slack client for development/testing
 */
function createMockSlackClient() {
  return {
    chat: {
      postMessage: async (params: any) => {
        console.log('[Mock Slack] Posting message:', params);
        return { ok: true, ts: Date.now().toString() };
      },
    },
  };
}

/**
 * Default configuration for development
 */
export const DEFAULT_DEV_CONFIG: ApplicationConfig = {
  environment: 'development',
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key',
  },
  email: {
    fromEmail: 'hello@whatsappcloud.com',
  },
  analytics: {
    gaTrackingId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  },
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
};

/**
 * Global container instance (can be used for dependency injection in components)
 */
let globalContainer: DependencyContainer | null = null;

/**
 * Initialize the global container
 */
export function initializeContainer(config: ApplicationConfig = DEFAULT_DEV_CONFIG): DependencyContainer {
  globalContainer = createApplicationContainer(config);
  return globalContainer;
}

/**
 * Get the global container instance
 */
export function getContainer(): DependencyContainer {
  if (!globalContainer) {
    globalContainer = createApplicationContainer(DEFAULT_DEV_CONFIG);
  }
  return globalContainer;
}

/**
 * Clear the global container (useful for testing)
 */
export function clearContainer(): void {
  globalContainer = null;
}

// =============================================================================
// FUNCTIONAL APPROACH DEMO
// =============================================================================

/**
 * Creates application container using the legacy class-based approach
 * @deprecated Use createApplicationContainer() instead (now uses functional approach)
 */
export function createApplicationContainerLegacy(config: ApplicationConfig): DependencyContainer {
  const container = new SimpleDependencyContainer();

  // Register shared dependencies
  container.register(DEPENDENCY_TOKENS.CONFIG, {
    fromEmail: config.email.fromEmail,
    slackSalesChannel: config.slack?.salesChannel,
    baseUrl: config.baseUrl,
    gaTrackingId: config.analytics.gaTrackingId,
  });

  // Register external clients
  registerExternalClients(container, config);

  // Register modules using functional approach
  const landingModule = new LandingModuleConfig(config.environment);
  const onboardingModule = createOnboardingModule(config.environment);

  // Register dependencies
  landingModule.registerDependencies(container);
  onboardingModule.registerDependencies(container);

  return container;
}

/**
 * Example of partial module registration using functional approach
 * Useful for testing specific parts of the application
 */
export function createTestContainer(config: ApplicationConfig): DependencyContainer {
  const container = createSimpleDependencyContainer();

  // Register only shared dependencies
  container.register(DEPENDENCY_TOKENS.CONFIG, {
    fromEmail: config.email.fromEmail,
    baseUrl: config.baseUrl,
  });

  // Register only specific module parts for testing
  // Using the modular registration functions from the functional approach
  registerOnlyRepositories('test')(container);
  registerOnlyServices('test')(container);

  return container;
}