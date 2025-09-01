/**
 * Pure Container Operations
 * Clean Architecture - Functional container operations for dependency injection
 *
 * This module provides pure functions for container operations that can be composed
 * with closure-based state management for immutable container behavior.
 */

import type { DependencyContainer } from '../application/interfaces/dependency-container';

/**
 * Container state interface for immutable operations
 */
export interface ContainerState {
  readonly dependencies: Map<string | symbol, unknown>;
  readonly factories: Map<string | symbol, (container: DependencyContainer) => unknown>;
  readonly singletons: Map<string | symbol, unknown>;
}

/**
 * Creates an initial empty container state
 */
export function createInitialContainerState(): ContainerState {
  return {
    dependencies: new Map(),
    factories: new Map(),
    singletons: new Map(),
  };
}

/**
 * Creates a copy of container state for immutable updates
 */
function cloneContainerState(state: ContainerState): ContainerState {
  return {
    dependencies: new Map(state.dependencies),
    factories: new Map(state.factories),
    singletons: new Map(state.singletons),
  };
}

// =============================================================================
// PURE CONTAINER OPERATIONS
// =============================================================================

/**
 * Pure register function - registers a direct dependency implementation
 * @param state - Current container state
 * @param token - Dependency token (string or symbol)
 * @param implementation - The implementation to register
 * @returns New container state with the dependency registered
 */
export function register<T>(
  state: ContainerState,
  token: string | symbol,
  implementation: T
): ContainerState {
  if (token === null || token === undefined) {
    throw new Error('Token cannot be null or undefined');
  }

  const newState = cloneContainerState(state);
  newState.dependencies.set(token, implementation);
  return newState;
}

/**
 * Pure registerFactory function - registers a factory for lazy instantiation
 * @param state - Current container state
 * @param token - Dependency token
 * @param factory - Factory function that creates the dependency
 * @returns New container state with the factory registered
 */
export function registerFactory<T>(
  state: ContainerState,
  token: string | symbol,
  factory: (container: DependencyContainer) => T
): ContainerState {
  if (token === null || token === undefined) {
    throw new Error('Token cannot be null or undefined');
  }
  if (typeof factory !== 'function') {
    throw new Error('Factory must be a function');
  }

  const newState = cloneContainerState(state);
  newState.factories.set(token, factory);
  return newState;
}

/**
 * Pure registerSingleton function - registers a singleton factory
 * @param state - Current container state
 * @param token - Dependency token
 * @param factory - Factory function that creates the singleton
 * @param container - Container instance for factory resolution
 * @returns New container state with singleton registered (if not already exists)
 */
export function registerSingleton<T>(
  state: ContainerState,
  token: string | symbol,
  factory: (container: DependencyContainer) => T,
  container: DependencyContainer
): ContainerState {
  if (token === null || token === undefined) {
    throw new Error('Token cannot be null or undefined');
  }
  if (typeof factory !== 'function') {
    throw new Error('Factory must be a function');
  }

  // If singleton already exists, return state unchanged
  if (state.singletons.has(token)) {
    return state;
  }

  const newState = cloneContainerState(state);
  const instance = factory(container);
  newState.singletons.set(token, instance);
  return newState;
}

/**
 * Pure resolve function - resolves a dependency by its token
 * @param state - Current container state
 * @param token - Dependency token to resolve
 * @param container - Container instance for factory resolution
 * @returns The resolved dependency
 * @throws Error if dependency is not found
 */
export function resolve<T>(
  state: ContainerState,
  token: string | symbol,
  container: DependencyContainer
): T {
  if (token === null || token === undefined) {
    throw new Error('Token cannot be null or undefined');
  }

  // Check singletons first (highest priority)
  if (state.singletons.has(token)) {
    return state.singletons.get(token) as T;
  }

  // Check direct registrations
  if (state.dependencies.has(token)) {
    return state.dependencies.get(token) as T;
  }

  // Check factories (lowest priority, creates new instances each time)
  if (state.factories.has(token)) {
    const factory = state.factories.get(token)!;
    return factory(container) as T;
  }

  // Dependency not found - provide helpful error message
  const tokenString = typeof token === 'symbol' ? token.toString() : String(token);
  throw new Error(`Dependency not found: ${tokenString}. Make sure it's registered before resolving.`);
}

/**
 * Pure has function - checks if a dependency is registered
 * @param state - Current container state
 * @param token - Dependency token to check
 * @returns True if dependency exists in any form (direct, factory, or singleton)
 */
export function has(state: ContainerState, token: string | symbol): boolean {
  if (token === null || token === undefined) {
    return false;
  }

  return (
    state.dependencies.has(token) ||
    state.factories.has(token) ||
    state.singletons.has(token)
  );
}

/**
 * Pure clear function - returns a clean container state
 * @returns New empty container state
 */
export function clear(): ContainerState {
  return createInitialContainerState();
}

/**
 * Pure clearSpecific function - clears specific type of registrations
 * @param state - Current container state
 * @param type - Type of registrations to clear ('dependencies', 'factories', 'singletons', or 'all')
 * @returns New container state with specified registrations cleared
 */
export function clearSpecific(
  state: ContainerState,
  type: 'dependencies' | 'factories' | 'singletons' | 'all'
): ContainerState {
  if (type === 'all') {
    return clear();
  }

  const newState = cloneContainerState(state);

  switch (type) {
    case 'dependencies':
      newState.dependencies.clear();
      break;
    case 'factories':
      newState.factories.clear();
      break;
    case 'singletons':
      newState.singletons.clear();
      break;
    default:
      throw new Error(`Invalid clear type: ${type}. Must be 'dependencies', 'factories', 'singletons', or 'all'`);
  }

  return newState;
}

/**
 * Pure function to get all registered tokens
 * @param state - Current container state
 * @returns Array of all registered tokens
 */
export function getAllTokens(state: ContainerState): (string | symbol)[] {
  const tokens = new Set<string | symbol>();

  // Collect tokens from all registration types
  state.dependencies.forEach((_, token) => tokens.add(token));
  state.factories.forEach((_, token) => tokens.add(token));
  state.singletons.forEach((_, token) => tokens.add(token));

  return Array.from(tokens);
}

/**
 * Pure function to get container statistics
 * @param state - Current container state
 * @returns Statistics about the container state
 */
export function getContainerStats(state: ContainerState): {
  totalRegistrations: number;
  directDependencies: number;
  factories: number;
  singletons: number;
  uniqueTokens: number;
} {
  const uniqueTokens = getAllTokens(state);

  return {
    totalRegistrations: state.dependencies.size + state.factories.size + state.singletons.size,
    directDependencies: state.dependencies.size,
    factories: state.factories.size,
    singletons: state.singletons.size,
    uniqueTokens: uniqueTokens.length,
  };
}

// =============================================================================
// UTILITY FUNCTIONS FOR VALIDATION
// =============================================================================

/**
 * Validates if a token is valid for registration
 */
export function isValidToken(token: unknown): token is string | symbol {
  return typeof token === 'string' || typeof token === 'symbol';
}

/**
 * Validates container state integrity
 */
export function validateContainerState(state: ContainerState): boolean {
  return (
    state.dependencies instanceof Map &&
    state.factories instanceof Map &&
    state.singletons instanceof Map
  );
}