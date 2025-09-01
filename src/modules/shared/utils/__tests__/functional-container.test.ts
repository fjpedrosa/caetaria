/**
 * Functional Container Tests
 * Tests for functional container implementations with closure-based state management
 */

import type { DependencyContainer } from '../../application/interfaces/dependency-container';
import {
  createInitialContainerState,
  register,
  registerFactory,
  registerSingleton,
} from '../container-operations';
import {
  combineContainerStates,
  ContainerBuilder,
  containerBuilder,
  createFunctionalContainer,
  createImmutableContainer,
  createScopedContainer,
} from '../functional-container';

// Test implementations
const testService = { name: 'TestService', version: '1.0' };
const testFactory = jest.fn(() => ({ name: 'FactoryResult', id: Date.now() }));
const singletonFactory = jest.fn(() => ({ name: 'SingletonResult', id: 'singleton-123' }));

// Test tokens
const SERVICE_TOKEN = 'TestService';
const FACTORY_TOKEN = 'FactoryService';
const SINGLETON_TOKEN = 'SingletonService';

describe('Functional Container Implementation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =============================================================================
  // FUNCTIONAL CONTAINER TESTS
  // =============================================================================

  describe('createFunctionalContainer', () => {
    let container: ReturnType<typeof createFunctionalContainer>;

    beforeEach(() => {
      container = createFunctionalContainer();
    });

    it('should create container with empty initial state', () => {
      const stats = container.getStats();

      expect(stats.totalRegistrations).toBe(0);
      expect(stats.uniqueTokens).toBe(0);
      expect(container.getAllTokens()).toEqual([]);
    });

    it('should register and resolve dependencies', () => {
      container.register(SERVICE_TOKEN, testService);

      expect(container.has(SERVICE_TOKEN)).toBe(true);
      expect(container.resolve(SERVICE_TOKEN)).toBe(testService);
    });

    it('should register and resolve factories', () => {
      container.registerFactory(FACTORY_TOKEN, testFactory);

      const result = container.resolve(FACTORY_TOKEN);

      expect(testFactory).toHaveBeenCalledWith(container);
      expect(result).toHaveProperty('name', 'FactoryResult');
    });

    it('should register and resolve singletons', () => {
      container.registerSingleton(SINGLETON_TOKEN, singletonFactory);

      const result1 = container.resolve(SINGLETON_TOKEN);
      const result2 = container.resolve(SINGLETON_TOKEN);

      expect(singletonFactory).toHaveBeenCalledTimes(1);
      expect(result1).toBe(result2);
      expect(result1).toEqual({ name: 'SingletonResult', id: 'singleton-123' });
    });

    it('should clear all dependencies', () => {
      container.register(SERVICE_TOKEN, testService);
      container.registerFactory(FACTORY_TOKEN, testFactory);
      container.registerSingleton(SINGLETON_TOKEN, singletonFactory);

      expect(container.getStats().totalRegistrations).toBe(3);

      container.clear();

      expect(container.getStats().totalRegistrations).toBe(0);
      expect(container.has(SERVICE_TOKEN)).toBe(false);
      expect(container.has(FACTORY_TOKEN)).toBe(false);
      expect(container.has(SINGLETON_TOKEN)).toBe(false);
    });

    it('should clear specific registration types', () => {
      container.register(SERVICE_TOKEN, testService);
      container.registerFactory(FACTORY_TOKEN, testFactory);
      container.registerSingleton(SINGLETON_TOKEN, singletonFactory);

      container.clearSpecific('dependencies');

      expect(container.has(SERVICE_TOKEN)).toBe(false);
      expect(container.has(FACTORY_TOKEN)).toBe(true);
      expect(container.has(SINGLETON_TOKEN)).toBe(true);
    });

    it('should provide state access without allowing mutations', () => {
      container.register(SERVICE_TOKEN, testService);

      const state = container.getState();
      state.dependencies.clear(); // Try to mutate returned state

      // Original container should be unaffected
      expect(container.has(SERVICE_TOKEN)).toBe(true);
    });

    it('should track statistics correctly', () => {
      container.register('dep1', 'value1');
      container.register('dep2', 'value2');
      container.registerFactory('factory1', testFactory);
      container.registerSingleton('singleton1', singletonFactory);

      const stats = container.getStats();

      expect(stats).toEqual({
        totalRegistrations: 4,
        directDependencies: 2,
        factories: 1,
        singletons: 1,
        uniqueTokens: 4,
      });
    });

    it('should list all tokens', () => {
      container.register('dep', 'value');
      container.registerFactory('factory', testFactory);
      container.registerSingleton('singleton', singletonFactory);

      const tokens = container.getAllTokens();

      expect(tokens).toHaveLength(3);
      expect(tokens).toContain('dep');
      expect(tokens).toContain('factory');
      expect(tokens).toContain('singleton');
    });
  });

  // =============================================================================
  // IMMUTABLE CONTAINER TESTS
  // =============================================================================

  describe('createImmutableContainer', () => {
    let container: ReturnType<typeof createImmutableContainer>;

    beforeEach(() => {
      container = createImmutableContainer();
    });

    it('should throw error on mutable operations', () => {
      expect(() => container.register(SERVICE_TOKEN, testService))
        .toThrow('Immutable container does not support mutable operations. Use withRegistration() instead.');

      expect(() => container.registerFactory(FACTORY_TOKEN, testFactory))
        .toThrow('Immutable container does not support mutable operations. Use withFactory() instead.');

      expect(() => container.registerSingleton(SINGLETON_TOKEN, singletonFactory))
        .toThrow('Immutable container does not support mutable operations. Use withSingleton() instead.');

      expect(() => container.clear())
        .toThrow('Immutable container does not support mutable operations. Use withClear() instead.');
    });

    it('should create new containers with withRegistration', () => {
      const newContainer = container.withRegistration(SERVICE_TOKEN, testService);

      expect(newContainer).not.toBe(container);
      expect(container.has(SERVICE_TOKEN)).toBe(false);
      expect(newContainer.has(SERVICE_TOKEN)).toBe(true);
      expect(newContainer.resolve(SERVICE_TOKEN)).toBe(testService);
    });

    it('should create new containers with withFactory', () => {
      const newContainer = container.withFactory(FACTORY_TOKEN, testFactory);

      expect(newContainer).not.toBe(container);
      expect(container.has(FACTORY_TOKEN)).toBe(false);
      expect(newContainer.has(FACTORY_TOKEN)).toBe(true);
    });

    it('should create new containers with withSingleton', () => {
      const newContainer = container.withSingleton(SINGLETON_TOKEN, singletonFactory);

      expect(newContainer).not.toBe(container);
      expect(container.has(SINGLETON_TOKEN)).toBe(false);
      expect(newContainer.has(SINGLETON_TOKEN)).toBe(true);
    });

    it('should create new containers with withClear', () => {
      const containerWithDeps = container
        .withRegistration(SERVICE_TOKEN, testService)
        .withFactory(FACTORY_TOKEN, testFactory);

      expect(containerWithDeps.getStats().totalRegistrations).toBe(2);

      const clearedContainer = containerWithDeps.withClear();

      expect(clearedContainer).not.toBe(containerWithDeps);
      expect(containerWithDeps.getStats().totalRegistrations).toBe(2);
      expect(clearedContainer.getStats().totalRegistrations).toBe(0);
    });

    it('should support method chaining', () => {
      const chainedContainer = container
        .withRegistration('service1', { name: 'Service 1' })
        .withRegistration('service2', { name: 'Service 2' })
        .withFactory('factory', () => ({ name: 'Factory' }));

      expect(chainedContainer.has('service1')).toBe(true);
      expect(chainedContainer.has('service2')).toBe(true);
      expect(chainedContainer.has('factory')).toBe(true);
      expect(chainedContainer.getStats().totalRegistrations).toBe(3);
    });

    it('should provide immutable state access', () => {
      const containerWithData = container.withRegistration(SERVICE_TOKEN, testService);
      const state = containerWithData.getState();

      state.dependencies.clear(); // Try to mutate

      expect(containerWithData.has(SERVICE_TOKEN)).toBe(true);
    });
  });

  // =============================================================================
  // CONTAINER BUILDER TESTS
  // =============================================================================

  describe('ContainerBuilder', () => {
    let builder: ContainerBuilder;

    beforeEach(() => {
      builder = new ContainerBuilder();
    });

    it('should build functional container', () => {
      const container = builder
        .register(SERVICE_TOKEN, testService)
        .registerFactory(FACTORY_TOKEN, testFactory)
        .build();

      expect(container.has(SERVICE_TOKEN)).toBe(true);
      expect(container.has(FACTORY_TOKEN)).toBe(true);
      expect(container.resolve(SERVICE_TOKEN)).toBe(testService);
    });

    it('should build immutable container', () => {
      const container = builder
        .register(SERVICE_TOKEN, testService)
        .buildImmutable();

      expect(container.has(SERVICE_TOKEN)).toBe(true);
      expect(() => container.register('new', 'value')).toThrow();
    });

    it('should support clearing specific types', () => {
      builder
        .register('dep1', 'value1')
        .registerFactory('factory1', testFactory)
        .registerSingleton('singleton1', singletonFactory, createFunctionalContainer())
        .clearSpecific('dependencies');

      const state = builder.getState();
      expect(state.dependencies.size).toBe(0);
      expect(state.factories.size).toBe(1);
      expect(state.singletons.size).toBe(1);
    });

    it('should provide state inspection', () => {
      builder.register('test', 'value');

      const state = builder.getState();
      expect(state.dependencies.has('test')).toBe(true);
    });
  });

  describe('containerBuilder helper', () => {
    it('should create a new ContainerBuilder instance', () => {
      const builder = containerBuilder();

      expect(builder).toBeInstanceOf(ContainerBuilder);
    });
  });

  // =============================================================================
  // UTILITY FUNCTION TESTS
  // =============================================================================

  describe('combineContainerStates', () => {
    it('should combine empty states', () => {
      const state1 = createInitialContainerState();
      const state2 = createInitialContainerState();

      const combined = combineContainerStates(state1, state2);

      expect(combined.dependencies.size).toBe(0);
      expect(combined.factories.size).toBe(0);
      expect(combined.singletons.size).toBe(0);
    });

    it('should combine states with different tokens', () => {
      let state1 = register(createInitialContainerState(), 'token1', 'value1');
      state1 = registerFactory(state1, 'factory1', testFactory);

      let state2 = register(createInitialContainerState(), 'token2', 'value2');
      state2 = registerSingleton(state2, 'singleton1', singletonFactory, createFunctionalContainer());

      const combined = combineContainerStates(state1, state2);

      expect(combined.dependencies.size).toBe(2);
      expect(combined.factories.size).toBe(1);
      expect(combined.singletons.size).toBe(1);
      expect(combined.dependencies.get('token1')).toBe('value1');
      expect(combined.dependencies.get('token2')).toBe('value2');
    });

    it('should handle overlapping tokens (later wins)', () => {
      const state1 = register(createInitialContainerState(), 'shared', 'value1');
      const state2 = register(createInitialContainerState(), 'shared', 'value2');

      const combined = combineContainerStates(state1, state2);

      expect(combined.dependencies.size).toBe(1);
      expect(combined.dependencies.get('shared')).toBe('value2');
    });

    it('should combine multiple states', () => {
      const state1 = register(createInitialContainerState(), 'token1', 'value1');
      const state2 = register(createInitialContainerState(), 'token2', 'value2');
      const state3 = register(createInitialContainerState(), 'token3', 'value3');

      const combined = combineContainerStates(state1, state2, state3);

      expect(combined.dependencies.size).toBe(3);
      expect(combined.dependencies.get('token1')).toBe('value1');
      expect(combined.dependencies.get('token2')).toBe('value2');
      expect(combined.dependencies.get('token3')).toBe('value3');
    });
  });

  // =============================================================================
  // SCOPED CONTAINER TESTS
  // =============================================================================

  describe('createScopedContainer', () => {
    let parent: DependencyContainer;
    let scoped: DependencyContainer;

    beforeEach(() => {
      parent = createFunctionalContainer();
      parent.register('parentService', { name: 'Parent Service' });
      parent.registerFactory('parentFactory', () => ({ name: 'Parent Factory' }));

      scoped = createScopedContainer(parent);
    });

    it('should resolve from parent when not in scope', () => {
      expect(scoped.has('parentService')).toBe(true);
      expect(scoped.resolve('parentService')).toEqual({ name: 'Parent Service' });
    });

    it('should prefer scope over parent', () => {
      scoped.register('parentService', { name: 'Scoped Service' });

      expect(scoped.resolve('parentService')).toEqual({ name: 'Scoped Service' });
      expect(parent.resolve('parentService')).toEqual({ name: 'Parent Service' });
    });

    it('should register dependencies in scope only', () => {
      scoped.register('scopedService', { name: 'Scoped Only' });

      expect(scoped.has('scopedService')).toBe(true);
      expect(parent.has('scopedService')).toBe(false);
    });

    it('should have access to both parent and scope tokens', () => {
      scoped.register('scopedService', { name: 'Scoped Only' });

      expect(scoped.has('parentService')).toBe(true);
      expect(scoped.has('parentFactory')).toBe(true);
      expect(scoped.has('scopedService')).toBe(true);
    });

    it('should throw error for missing dependencies in both parent and scope', () => {
      expect(() => scoped.resolve('missingService'))
        .toThrow('Dependency not found: missingService');
    });

    it('should work with existing scope state', () => {
      const scopeState = register(createInitialContainerState(), 'preExisting', 'value');
      const scopedWithState = createScopedContainer(parent, scopeState);

      expect(scopedWithState.has('preExisting')).toBe(true);
      expect(scopedWithState.has('parentService')).toBe(true);
    });
  });

  // =============================================================================
  // INTEGRATION TESTS
  // =============================================================================

  describe('Integration Tests', () => {
    it('should work with complex dependency graphs', () => {
      const container = createFunctionalContainer();

      // Register base services
      container.register('config', { apiUrl: 'https://api.example.com' });
      container.register('logger', { log: jest.fn() });

      // Register factories that depend on other services
      container.registerFactory('httpClient', (c) => {
        const config = c.resolve<any>('config');
        return { baseUrl: config.apiUrl, get: jest.fn(), post: jest.fn() };
      });

      container.registerFactory('userService', (c) => {
        const http = c.resolve<any>('httpClient');
        const logger = c.resolve<any>('logger');
        return { http, logger, getUser: jest.fn() };
      });

      // Register singleton that uses everything
      container.registerSingleton('application', (c) => {
        const userService = c.resolve<any>('userService');
        return { userService, start: jest.fn() };
      });

      const app = container.resolve<any>('application');

      expect(app).toBeDefined();
      expect(app.userService).toBeDefined();
      expect(app.userService.http).toBeDefined();
      expect(app.userService.logger).toBeDefined();
      expect(app.userService.http.baseUrl).toBe('https://api.example.com');
    });

    it('should maintain performance with many dependencies', () => {
      const container = createFunctionalContainer();

      // Register many dependencies
      for (let i = 0; i < 1000; i++) {
        container.register(`service${i}`, { id: i, name: `Service ${i}` });
      }

      const startTime = performance.now();

      // Resolve many dependencies
      for (let i = 0; i < 100; i++) {
        const service = container.resolve(`service${i}`);
        expect(service.id).toBe(i);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should resolve 100 dependencies in less than 50ms
      expect(duration).toBeLessThan(50);
    });

    it('should handle circular dependencies gracefully', () => {
      const container = createFunctionalContainer();

      container.registerFactory('serviceA', (c) => {
        const serviceB = c.resolve<any>('serviceB');
        return { name: 'A', dependency: serviceB };
      });

      container.registerFactory('serviceB', (c) => {
        const serviceA = c.resolve<any>('serviceA');
        return { name: 'B', dependency: serviceA };
      });

      // This should cause a circular dependency error
      expect(() => container.resolve('serviceA')).toThrow();
    });
  });
});