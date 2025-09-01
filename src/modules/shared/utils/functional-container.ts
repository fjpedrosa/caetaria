/**
 * Functional Container Implementation
 * Clean Architecture - Functional dependency container using closure-based state management
 *
 * This demonstrates how the pure container operations integrate with closure-based
 * state management to create an immutable, functional dependency injection container.
 */

import type { DependencyContainer } from '../application/interfaces/dependency-container';

import {
  clear as pureClear,
  clearSpecific as pureClearSpecific,
  ContainerState,
  createInitialContainerState,
  getAllTokens,
  getContainerStats,
  has as pureHas,
  register as pureRegister,
  registerFactory as pureRegisterFactory,
  registerSingleton as pureRegisterSingleton,
  resolve as pureResolve,
} from './container-operations';

/**
 * Creates a functional dependency container using closure-based state management
 * All operations are immutable and return new container instances
 */
export function createFunctionalContainer(
  initialState: ContainerState = createInitialContainerState()
): DependencyContainer & {
  // Additional methods not in the interface
  getState: () => ContainerState;
  getAllTokens: () => (string | symbol)[];
  getStats: () => ReturnType<typeof getContainerStats>;
  clearSpecific: (type: 'dependencies' | 'factories' | 'singletons' | 'all') => DependencyContainer;
} {
  // Closure-based state management
  let state: ContainerState = initialState;

  // Helper function to update state immutably
  const updateState = (newState: ContainerState): void => {
    state = newState;
  };

  // Create container interface implementation
  const container: DependencyContainer & {
    getState: () => ContainerState;
    getAllTokens: () => (string | symbol)[];
    getStats: () => ReturnType<typeof getContainerStats>;
    clearSpecific: (type: 'dependencies' | 'factories' | 'singletons' | 'all') => DependencyContainer;
  } = {
    // Standard DependencyContainer interface methods
    register<T>(token: string | symbol, implementation: T): void {
      const newState = pureRegister(state, token, implementation);
      updateState(newState);
    },

    registerFactory<T>(
      token: string | symbol,
      factory: (container: DependencyContainer) => T
    ): void {
      const newState = pureRegisterFactory(state, token, factory);
      updateState(newState);
    },

    registerSingleton<T>(
      token: string | symbol,
      factory: (container: DependencyContainer) => T
    ): void {
      const newState = pureRegisterSingleton(state, token, factory, container);
      updateState(newState);
    },

    resolve<T>(token: string | symbol): T {
      return pureResolve<T>(state, token, container);
    },

    has(token: string | symbol): boolean {
      return pureHas(state, token);
    },

    clear(): void {
      const newState = pureClear();
      updateState(newState);
    },

    // Extended methods for enhanced functionality
    getState(): ContainerState {
      // Return a deep copy to prevent external mutations
      return {
        dependencies: new Map(state.dependencies),
        factories: new Map(state.factories),
        singletons: new Map(state.singletons),
      };
    },

    getAllTokens(): (string | symbol)[] {
      return getAllTokens(state);
    },

    getStats(): ReturnType<typeof getContainerStats> {
      return getContainerStats(state);
    },

    clearSpecific(type: 'dependencies' | 'factories' | 'singletons' | 'all'): DependencyContainer {
      const newState = pureClearSpecific(state, type);
      updateState(newState);
      return container;
    },
  };

  return container;
}

/**
 * Creates an immutable functional container where each operation returns a new container
 * This approach is useful when you need to track state changes or implement undo/redo functionality
 */
export function createImmutableContainer(
  initialState: ContainerState = createInitialContainerState()
): DependencyContainer & {
  // Additional methods that return new container instances
  withRegistration: <T>(token: string | symbol, implementation: T) => ReturnType<typeof createImmutableContainer>;
  withFactory: <T>(token: string | symbol, factory: (container: DependencyContainer) => T) => ReturnType<typeof createImmutableContainer>;
  withSingleton: <T>(token: string | symbol, factory: (container: DependencyContainer) => T) => ReturnType<typeof createImmutableContainer>;
  withClear: () => ReturnType<typeof createImmutableContainer>;
  getState: () => ContainerState;
  getAllTokens: () => (string | symbol)[];
  getStats: () => ReturnType<typeof getContainerStats>;
} {
  const state = initialState;

  const container: DependencyContainer & {
    withRegistration: <T>(token: string | symbol, implementation: T) => ReturnType<typeof createImmutableContainer>;
    withFactory: <T>(token: string | symbol, factory: (container: DependencyContainer) => T) => ReturnType<typeof createImmutableContainer>;
    withSingleton: <T>(token: string | symbol, factory: (container: DependencyContainer) => T) => ReturnType<typeof createImmutableContainer>;
    withClear: () => ReturnType<typeof createImmutableContainer>;
    getState: () => ContainerState;
    getAllTokens: () => (string | symbol)[];
    getStats: () => ReturnType<typeof getContainerStats>;
  } = {
    // Mutable interface methods (for compatibility)
    register<T>(token: string | symbol, implementation: T): void {
      throw new Error('Immutable container does not support mutable operations. Use withRegistration() instead.');
    },

    registerFactory<T>(
      token: string | symbol,
      factory: (container: DependencyContainer) => T
    ): void {
      throw new Error('Immutable container does not support mutable operations. Use withFactory() instead.');
    },

    registerSingleton<T>(
      token: string | symbol,
      factory: (container: DependencyContainer) => T
    ): void {
      throw new Error('Immutable container does not support mutable operations. Use withSingleton() instead.');
    },

    resolve<T>(token: string | symbol): T {
      return pureResolve<T>(state, token, container);
    },

    has(token: string | symbol): boolean {
      return pureHas(state, token);
    },

    clear(): void {
      throw new Error('Immutable container does not support mutable operations. Use withClear() instead.');
    },

    // Immutable methods that return new containers
    withRegistration<T>(token: string | symbol, implementation: T) {
      const newState = pureRegister(state, token, implementation);
      return createImmutableContainer(newState);
    },

    withFactory<T>(token: string | symbol, factory: (container: DependencyContainer) => T) {
      const newState = pureRegisterFactory(state, token, factory);
      return createImmutableContainer(newState);
    },

    withSingleton<T>(token: string | symbol, factory: (container: DependencyContainer) => T) {
      const newState = pureRegisterSingleton(state, token, factory, container);
      return createImmutableContainer(newState);
    },

    withClear() {
      const newState = pureClear();
      return createImmutableContainer(newState);
    },

    // Query methods
    getState(): ContainerState {
      return {
        dependencies: new Map(state.dependencies),
        factories: new Map(state.factories),
        singletons: new Map(state.singletons),
      };
    },

    getAllTokens(): (string | symbol)[] {
      return getAllTokens(state);
    },

    getStats(): ReturnType<typeof getContainerStats> {
      return getContainerStats(state);
    },
  };

  return container;
}

/**
 * Container builder for fluent API construction
 * Enables chaining operations for clean container setup
 */
export class ContainerBuilder {
  private state: ContainerState;

  constructor(initialState: ContainerState = createInitialContainerState()) {
    this.state = initialState;
  }

  /**
   * Register a direct dependency
   */
  register<T>(token: string | symbol, implementation: T): ContainerBuilder {
    this.state = pureRegister(this.state, token, implementation);
    return this;
  }

  /**
   * Register a factory function
   */
  registerFactory<T>(
    token: string | symbol,
    factory: (container: DependencyContainer) => T
  ): ContainerBuilder {
    this.state = pureRegisterFactory(this.state, token, factory);
    return this;
  }

  /**
   * Register a singleton factory
   */
  registerSingleton<T>(
    token: string | symbol,
    factory: (container: DependencyContainer) => T,
    container: DependencyContainer
  ): ContainerBuilder {
    this.state = pureRegisterSingleton(this.state, token, factory, container);
    return this;
  }

  /**
   * Clear specific registrations
   */
  clearSpecific(type: 'dependencies' | 'factories' | 'singletons' | 'all'): ContainerBuilder {
    this.state = pureClearSpecific(this.state, type);
    return this;
  }

  /**
   * Build the final container
   */
  build(): DependencyContainer {
    return createFunctionalContainer(this.state);
  }

  /**
   * Build an immutable container
   */
  buildImmutable(): ReturnType<typeof createImmutableContainer> {
    return createImmutableContainer(this.state);
  }

  /**
   * Get the current state for inspection
   */
  getState(): ContainerState {
    return {
      dependencies: new Map(this.state.dependencies),
      factories: new Map(this.state.factories),
      singletons: new Map(this.state.singletons),
    };
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Creates a container builder instance
 */
export function containerBuilder(): ContainerBuilder {
  return new ContainerBuilder();
}

/**
 * Combines multiple container states into one
 * Later states override earlier ones for conflicting tokens
 */
export function combineContainerStates(...states: ContainerState[]): ContainerState {
  let combinedState = createInitialContainerState();

  for (const state of states) {
    // Copy dependencies
    for (const [token, implementation] of state.dependencies) {
      combinedState = pureRegister(combinedState, token, implementation);
    }

    // Copy factories
    for (const [token, factory] of state.factories) {
      combinedState = pureRegisterFactory(combinedState, token, factory);
    }

    // Copy singletons
    for (const [token, singleton] of state.singletons) {
      const newState = {
        ...combinedState,
        singletons: new Map(combinedState.singletons),
      };
      newState.singletons.set(token, singleton);
      combinedState = newState;
    }
  }

  return combinedState;
}

/**
 * Creates a scoped container that inherits from a parent but can have its own registrations
 */
export function createScopedContainer(
  parent: DependencyContainer,
  scopeState: ContainerState = createInitialContainerState()
): DependencyContainer {
  const container = createFunctionalContainer(scopeState);

  // Store original methods before overriding
  const originalResolve = container.resolve.bind(container);
  const originalHas = container.has.bind(container);

  // Override resolve to check parent if not found in scope
  container.resolve = <T>(token: string | symbol): T => {
    // First check if it exists in the current scope using the original has method
    if (originalHas(token)) {
      return originalResolve<T>(token);
    }
    // If not in scope, try parent
    return parent.resolve<T>(token);
  };

  // Override has to check both scope and parent
  container.has = (token: string | symbol): boolean => {
    return originalHas(token) || parent.has(token);
  };

  return container;
}