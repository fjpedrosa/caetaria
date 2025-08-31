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

// Factory function type definitions for higher-order functions
export type FactoryFunction<T> = (container: DependencyContainer) => T;

export type SingletonEntry<T> = {
  factory: FactoryFunction<T>;
  instance?: T;
  created: boolean;
};

/**
 * Container state interface for functional implementation
 * Enhanced to support proper singleton lazy instantiation
 */
interface ContainerState {
  readonly dependencies: ReadonlyMap<string | symbol, unknown>;
  readonly factories: ReadonlyMap<string | symbol, FactoryFunction<unknown>>;
  readonly singletons: ReadonlyMap<string | symbol, SingletonEntry<unknown>>;
}

/**
 * Pure function to create new container state with updated dependencies
 */
const updateDependencies = (
  state: ContainerState,
  token: string | symbol,
  implementation: unknown
): ContainerState => ({
  dependencies: new Map(state.dependencies).set(token, implementation),
  factories: state.factories,
  singletons: state.singletons,
});

/**
 * Pure function to create new container state with updated factories
 */
const updateFactories = (
  state: ContainerState,
  token: string | symbol,
  factory: (container: DependencyContainer) => unknown
): ContainerState => ({
  dependencies: state.dependencies,
  factories: new Map(state.factories).set(token, factory),
  singletons: state.singletons,
});

/**
 * Pure function to create new container state with updated singleton registration
 */
const registerSingletonFactory = <T>(
  state: ContainerState,
  token: string | symbol,
  factory: FactoryFunction<T>
): ContainerState => ({
  dependencies: state.dependencies,
  factories: state.factories,
  singletons: new Map(state.singletons).set(token, {
    factory: factory as FactoryFunction<unknown>,
    instance: undefined,
    created: false,
  }),
});

/**
 * Pure function to create new container state with cached singleton instance
 */
const cacheSingletonInstance = <T>(
  state: ContainerState,
  token: string | symbol,
  instance: T
): ContainerState => {
  const existingEntry = state.singletons.get(token) as SingletonEntry<T>;
  return {
    dependencies: state.dependencies,
    factories: state.factories,
    singletons: new Map(state.singletons).set(token, {
      ...existingEntry,
      instance,
      created: true,
    }),
  };
};

/**
 * Pure function to create empty container state
 */
const createEmptyState = (): ContainerState => ({
  dependencies: new Map(),
  factories: new Map(),
  singletons: new Map(),
});

/**
 * Higher-order function to create factory management operations
 * This is the core of the factory management system using closures
 */
const createFactoryOperations = (
  getState: () => ContainerState,
  updateState: (updater: (state: ContainerState) => ContainerState) => void
) => {
  /**
   * Higher-order function for factory registration with lazy instantiation
   */
  const createFactoryRegistrar = <T>() => {
    return (token: string | symbol, factory: FactoryFunction<T>): void => {
      updateState((currentState) => updateFactories(currentState, token, factory as FactoryFunction<unknown>));
    };
  };

  /**
   * Higher-order function for singleton registration with memoization pattern
   */
  const createSingletonRegistrar = <T>() => {
    return (token: string | symbol, factory: FactoryFunction<T>): void => {
      updateState((currentState) => registerSingletonFactory(currentState, token, factory));
    };
  };

  /**
   * Factory execution function with proper container injection
   */
  const executeFactory = <T>(token: string | symbol, container: DependencyContainer): T | null => {
    const state = getState();

    if (state.factories.has(token)) {
      const factory = state.factories.get(token)!;
      return factory(container) as T;
    }

    return null;
  };

  /**
   * Singleton resolution function with memoization
   */
  const resolveSingleton = <T>(token: string | symbol, container: DependencyContainer): T | null => {
    const state = getState();

    if (!state.singletons.has(token)) {
      return null;
    }

    const singletonEntry = state.singletons.get(token)! as SingletonEntry<T>;

    // Return cached instance if available
    if (singletonEntry.created && singletonEntry.instance !== undefined) {
      return singletonEntry.instance;
    }

    // Create and cache instance
    const instance = singletonEntry.factory(container) as T;
    updateState((currentState) => cacheSingletonInstance(currentState, token, instance));

    return instance;
  };

  return {
    registerFactory: createFactoryRegistrar(),
    registerSingleton: createSingletonRegistrar(),
    executeFactory,
    resolveSingleton,
  };
};

/**
 * Pure function to resolve a dependency from container state
 * Enhanced with proper factory execution and singleton handling
 */
const resolveDependency = <T>(
  state: ContainerState,
  token: string | symbol,
  container: DependencyContainer,
  factoryOps: ReturnType<typeof createFactoryOperations>
): T => {
  // Check singletons first with proper lazy instantiation
  const singletonResult = factoryOps.resolveSingleton<T>(token, container);
  if (singletonResult !== null) {
    return singletonResult;
  }

  // Check direct registrations
  if (state.dependencies.has(token)) {
    return state.dependencies.get(token) as T;
  }

  // Check factories with proper execution
  const factoryResult = factoryOps.executeFactory<T>(token, container);
  if (factoryResult !== null) {
    return factoryResult;
  }

  throw new Error(`Dependency not found: ${String(token)}`);
};

/**
 * Pure function to check if a dependency exists in container state
 */
const hasDependency = (state: ContainerState, token: string | symbol): boolean => {
  return (
    state.dependencies.has(token) ||
    state.factories.has(token) ||
    state.singletons.has(token)
  );
};

/**
 * Enhanced functional dependency container implementation using higher-order functions
 * Maintains immutable state and provides pure functions for operations
 * Features proper lazy instantiation and singleton patterns through closures
 */
export const createDependencyContainer = (): DependencyContainer => {
  // Enclosed state - private to this closure
  let state: ContainerState = createEmptyState();

  // State management functions
  const getState = (): ContainerState => state;
  const updateState = (updater: (state: ContainerState) => ContainerState): void => {
    state = updater(state);
  };

  // Create factory operations using higher-order functions
  const factoryOps = createFactoryOperations(getState, updateState);

  // Return object with methods that close over the state
  const container: DependencyContainer = {
    register<T>(token: string | symbol, implementation: T): void {
      updateState((currentState) => updateDependencies(currentState, token, implementation));
    },

    registerFactory: factoryOps.registerFactory,
    registerSingleton: factoryOps.registerSingleton,

    resolve<T>(token: string | symbol): T {
      return resolveDependency<T>(state, token, container, factoryOps);
    },

    has(token: string | symbol): boolean {
      return hasDependency(state, token);
    },

    clear(): void {
      updateState(() => createEmptyState());
    },
  };

  return container;
};

/**
 * Factory function to create the enhanced SimpleDependencyContainer
 * Uses the functional implementation under the hood
 */
export const createSimpleDependencyContainer = createDependencyContainer;

/**
 * Legacy class-based implementation for backward compatibility
 * @deprecated Use createSimpleDependencyContainer() instead
 *
 * This class now uses the functional implementation internally,
 * maintaining the same API while leveraging higher-order functions
 */
export class SimpleDependencyContainer implements DependencyContainer {
  private container = createDependencyContainer();

  register<T>(token: string | symbol, implementation: T): void {
    this.container.register(token, implementation);
  }

  registerFactory<T>(
    token: string | symbol,
    factory: (container: DependencyContainer) => T
  ): void {
    this.container.registerFactory(token, factory);
  }

  registerSingleton<T>(
    token: string | symbol,
    factory: (container: DependencyContainer) => T
  ): void {
    this.container.registerSingleton(token, factory);
  }

  resolve<T>(token: string | symbol): T {
    return this.container.resolve<T>(token);
  }

  has(token: string | symbol): boolean {
    return this.container.has(token);
  }

  clear(): void {
    this.container.clear();
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