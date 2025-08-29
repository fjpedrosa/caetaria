/**
 * Application Container Setup
 * Clean Architecture - Dependency injection configuration
 */

import { 
  SimpleDependencyContainer, 
  DependencyContainer, 
  DEPENDENCY_TOKENS 
} from './shared/application/interfaces/dependency-container';

import { LandingModuleConfig } from './marketing/marketing-module';
import { OnboardingModuleConfig } from './onboarding/onboarding-module';

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
 */
export function createApplicationContainer(config: ApplicationConfig): DependencyContainer {
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

  // Register module configurations
  const landingModule = new LandingModuleConfig(config.environment);
  const onboardingModule = new OnboardingModuleConfig(config.environment);

  landingModule.registerDependencies(container);
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