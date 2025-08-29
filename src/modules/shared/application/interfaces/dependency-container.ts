/**
 * Dependency Container Interface
 * Shared application layer - Dependency injection container contract
 */

/**
 * Dependency injection container interface
 * Following the Dependency Inversion Principle (SOLID)
 */
export interface DependencyContainer {
  /**
   * Register a dependency with its implementation
   */
  register<T>(token: string | symbol, implementation: T): void;
  
  /**
   * Register a factory function for lazy instantiation
   */
  registerFactory<T>(
    token: string | symbol, 
    factory: (container: DependencyContainer) => T
  ): void;
  
  /**
   * Register a singleton (only one instance will be created)
   */
  registerSingleton<T>(
    token: string | symbol, 
    factory: (container: DependencyContainer) => T
  ): void;
  
  /**
   * Resolve a dependency by its token
   */
  resolve<T>(token: string | symbol): T;
  
  /**
   * Check if a dependency is registered
   */
  has(token: string | symbol): boolean;
  
  /**
   * Clear all dependencies (useful for testing)
   */
  clear(): void;
}

/**
 * Dependency tokens - Use symbols to avoid string collisions
 */
export const DEPENDENCY_TOKENS = {
  // Landing module dependencies
  LEAD_REPOSITORY: Symbol('LeadRepository'),
  ANALYTICS_SERVICE: Symbol('AnalyticsService'),
  NOTIFICATION_SERVICE: Symbol('NotificationService'),
  SUBMIT_LEAD_FORM_USE_CASE: Symbol('SubmitLeadFormUseCase'),
  GET_LANDING_ANALYTICS_USE_CASE: Symbol('GetLandingAnalyticsUseCase'),
  
  // Onboarding module dependencies
  ONBOARDING_SESSION_REPOSITORY: Symbol('OnboardingSessionRepository'),
  ONBOARDING_SERVICE: Symbol('OnboardingService'),
  
  // Shared dependencies
  EMAIL_CLIENT: Symbol('EmailClient'),
  SLACK_CLIENT: Symbol('SlackClient'),
  SUPABASE_CLIENT: Symbol('SupabaseClient'),
  LOGGER: Symbol('Logger'),
  CONFIG: Symbol('Config'),
} as const;

/**
 * Type helper for dependency tokens
 */
export type DependencyToken = typeof DEPENDENCY_TOKENS[keyof typeof DEPENDENCY_TOKENS];

/**
 * Module configuration interface
 */
export interface ModuleConfig {
  /**
   * Register module dependencies
   */
  registerDependencies(container: DependencyContainer): void;
}

/**
 * Use case factory interface
 */
export interface UseCaseFactory<T> {
  create(container: DependencyContainer): T;
}

/**
 * Simple dependency container implementation
 */
export class SimpleDependencyContainer implements DependencyContainer {
  private dependencies = new Map<string | symbol, unknown>();
  private factories = new Map<string | symbol, (container: DependencyContainer) => unknown>();
  private singletons = new Map<string | symbol, unknown>();

  register<T>(token: string | symbol, implementation: T): void {
    this.dependencies.set(token, implementation);
  }

  registerFactory<T>(
    token: string | symbol, 
    factory: (container: DependencyContainer) => T
  ): void {
    this.factories.set(token, factory);
  }

  registerSingleton<T>(
    token: string | symbol, 
    factory: (container: DependencyContainer) => T
  ): void {
    if (!this.singletons.has(token)) {
      const instance = factory(this);
      this.singletons.set(token, instance);
    }
  }

  resolve<T>(token: string | symbol): T {
    // Check singletons first
    if (this.singletons.has(token)) {
      return this.singletons.get(token) as T;
    }

    // Check direct registrations
    if (this.dependencies.has(token)) {
      return this.dependencies.get(token) as T;
    }

    // Check factories
    if (this.factories.has(token)) {
      const factory = this.factories.get(token)!;
      return factory(this) as T;
    }

    throw new Error(`Dependency not found: ${String(token)}`);
  }

  has(token: string | symbol): boolean {
    return (
      this.dependencies.has(token) ||
      this.factories.has(token) ||
      this.singletons.has(token)
    );
  }

  clear(): void {
    this.dependencies.clear();
    this.factories.clear();
    this.singletons.clear();
  }
}

/**
 * Decorator for injectable classes (optional, for better DX)
 */
export function Injectable(token?: string | symbol) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    // Store metadata for reflection (if needed)
    // Note: Reflect.defineMetadata requires reflect-metadata library
    // For now, we'll just return the constructor as-is
    return constructor;
  };
}

/**
 * Type helper for creating use case factories
 */
export function createUseCaseFactory<T>(
  factory: (container: DependencyContainer) => T
): UseCaseFactory<T> {
  return {
    create: factory,
  };
}