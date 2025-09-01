/**
 * Container Operations Tests
 * Tests for pure container operations with comprehensive coverage
 */

import { DependencyContainer } from '../../application/interfaces/dependency-container';
import {
  clear,
  clearSpecific,
  ContainerState,
  createInitialContainerState,
  getAllTokens,
  getContainerStats,
  has,
  isValidToken,
  register,
  registerFactory,
  registerSingleton,
  resolve,
  validateContainerState,
} from '../container-operations';

// Mock container for factory tests
const createMockContainer = (): DependencyContainer => ({
  register: jest.fn(),
  registerFactory: jest.fn(),
  registerSingleton: jest.fn(),
  resolve: jest.fn(),
  has: jest.fn(),
  clear: jest.fn(),
});

// Test tokens
const TEST_TOKEN_STRING = 'TestService';
const TEST_TOKEN_SYMBOL = Symbol('TestService');
const MISSING_TOKEN = 'MissingService';

// Test implementations
const testImplementation = { name: 'TestImplementation', value: 42 };
const testFactory = jest.fn().mockReturnValue({ name: 'FactoryResult', id: 'factory-1' });
const singletonFactory = jest.fn().mockReturnValue({ name: 'SingletonResult', id: 'singleton-1' });

describe('Container Operations - Pure Functions', () => {
  let initialState: ContainerState;
  let mockContainer: DependencyContainer;

  beforeEach(() => {
    initialState = createInitialContainerState();
    mockContainer = createMockContainer();
    jest.clearAllMocks();
  });

  // =============================================================================
  // INITIAL STATE TESTS
  // =============================================================================

  describe('createInitialContainerState', () => {
    it('should create empty container state', () => {
      const state = createInitialContainerState();

      expect(state.dependencies).toBeInstanceOf(Map);
      expect(state.factories).toBeInstanceOf(Map);
      expect(state.singletons).toBeInstanceOf(Map);
      expect(state.dependencies.size).toBe(0);
      expect(state.factories.size).toBe(0);
      expect(state.singletons.size).toBe(0);
    });

    it('should create new instances each time', () => {
      const state1 = createInitialContainerState();
      const state2 = createInitialContainerState();

      expect(state1).not.toBe(state2);
      expect(state1.dependencies).not.toBe(state2.dependencies);
    });
  });

  // =============================================================================
  // REGISTER FUNCTION TESTS
  // =============================================================================

  describe('register', () => {
    it('should register dependency with string token', () => {
      const newState = register(initialState, TEST_TOKEN_STRING, testImplementation);

      expect(newState).not.toBe(initialState);
      expect(newState.dependencies.get(TEST_TOKEN_STRING)).toBe(testImplementation);
      expect(newState.dependencies.size).toBe(1);
      expect(initialState.dependencies.size).toBe(0); // Original state unchanged
    });

    it('should register dependency with symbol token', () => {
      const newState = register(initialState, TEST_TOKEN_SYMBOL, testImplementation);

      expect(newState.dependencies.get(TEST_TOKEN_SYMBOL)).toBe(testImplementation);
      expect(newState.dependencies.size).toBe(1);
    });

    it('should throw error for null token', () => {
      expect(() => register(initialState, null as any, testImplementation))
        .toThrow('Token cannot be null or undefined');
    });

    it('should throw error for undefined token', () => {
      expect(() => register(initialState, undefined as any, testImplementation))
        .toThrow('Token cannot be null or undefined');
    });

    it('should allow registering same token multiple times (overwrites)', () => {
      const firstImplementation = { name: 'First' };
      const secondImplementation = { name: 'Second' };

      const state1 = register(initialState, TEST_TOKEN_STRING, firstImplementation);
      const state2 = register(state1, TEST_TOKEN_STRING, secondImplementation);

      expect(state2.dependencies.get(TEST_TOKEN_STRING)).toBe(secondImplementation);
      expect(state2.dependencies.size).toBe(1);
    });

    it('should register different types of implementations', () => {
      const stringImpl = 'string implementation';
      const numberImpl = 42;
      const objectImpl = { key: 'value' };
      const functionImpl = () => 'function result';

      let state = register(initialState, 'string', stringImpl);
      state = register(state, 'number', numberImpl);
      state = register(state, 'object', objectImpl);
      state = register(state, 'function', functionImpl);

      expect(state.dependencies.get('string')).toBe(stringImpl);
      expect(state.dependencies.get('number')).toBe(numberImpl);
      expect(state.dependencies.get('object')).toBe(objectImpl);
      expect(state.dependencies.get('function')).toBe(functionImpl);
      expect(state.dependencies.size).toBe(4);
    });
  });

  // =============================================================================
  // REGISTER FACTORY FUNCTION TESTS
  // =============================================================================

  describe('registerFactory', () => {
    it('should register factory with string token', () => {
      const newState = registerFactory(initialState, TEST_TOKEN_STRING, testFactory);

      expect(newState).not.toBe(initialState);
      expect(newState.factories.get(TEST_TOKEN_STRING)).toBe(testFactory);
      expect(newState.factories.size).toBe(1);
      expect(initialState.factories.size).toBe(0); // Original state unchanged
    });

    it('should register factory with symbol token', () => {
      const newState = registerFactory(initialState, TEST_TOKEN_SYMBOL, testFactory);

      expect(newState.factories.get(TEST_TOKEN_SYMBOL)).toBe(testFactory);
      expect(newState.factories.size).toBe(1);
    });

    it('should throw error for null token', () => {
      expect(() => registerFactory(initialState, null as any, testFactory))
        .toThrow('Token cannot be null or undefined');
    });

    it('should throw error for undefined token', () => {
      expect(() => registerFactory(initialState, undefined as any, testFactory))
        .toThrow('Token cannot be null or undefined');
    });

    it('should throw error for non-function factory', () => {
      expect(() => registerFactory(initialState, TEST_TOKEN_STRING, 'not-a-function' as any))
        .toThrow('Factory must be a function');
    });

    it('should allow registering same token multiple times (overwrites)', () => {
      const factory1 = jest.fn().mockReturnValue('result1');
      const factory2 = jest.fn().mockReturnValue('result2');

      const state1 = registerFactory(initialState, TEST_TOKEN_STRING, factory1);
      const state2 = registerFactory(state1, TEST_TOKEN_STRING, factory2);

      expect(state2.factories.get(TEST_TOKEN_STRING)).toBe(factory2);
      expect(state2.factories.size).toBe(1);
    });
  });

  // =============================================================================
  // REGISTER SINGLETON FUNCTION TESTS
  // =============================================================================

  describe('registerSingleton', () => {
    it('should register singleton and call factory immediately', () => {
      const newState = registerSingleton(initialState, TEST_TOKEN_STRING, singletonFactory, mockContainer);

      expect(newState).not.toBe(initialState);
      expect(singletonFactory).toHaveBeenCalledWith(mockContainer);
      expect(singletonFactory).toHaveBeenCalledTimes(1);
      expect(newState.singletons.get(TEST_TOKEN_STRING)).toEqual({ name: 'SingletonResult', id: 'singleton-1' });
      expect(newState.singletons.size).toBe(1);
      expect(initialState.singletons.size).toBe(0); // Original state unchanged
    });

    it('should not register singleton if already exists (idempotent)', () => {
      const existingSingleton = { name: 'Existing', id: 'existing-1' };
      const stateWithSingleton: ContainerState = {
        ...initialState,
        singletons: new Map([[TEST_TOKEN_STRING, existingSingleton]]),
      };

      const newState = registerSingleton(stateWithSingleton, TEST_TOKEN_STRING, singletonFactory, mockContainer);

      expect(newState).toBe(stateWithSingleton); // Same reference - no change
      expect(singletonFactory).not.toHaveBeenCalled();
      expect(newState.singletons.get(TEST_TOKEN_STRING)).toBe(existingSingleton);
    });

    it('should throw error for null token', () => {
      expect(() => registerSingleton(initialState, null as any, singletonFactory, mockContainer))
        .toThrow('Token cannot be null or undefined');
    });

    it('should throw error for undefined token', () => {
      expect(() => registerSingleton(initialState, undefined as any, singletonFactory, mockContainer))
        .toThrow('Token cannot be null or undefined');
    });

    it('should throw error for non-function factory', () => {
      expect(() => registerSingleton(initialState, TEST_TOKEN_STRING, 'not-a-function' as any, mockContainer))
        .toThrow('Factory must be a function');
    });

    it('should register multiple singletons with different tokens', () => {
      const factory1 = jest.fn().mockReturnValue({ id: '1' });
      const factory2 = jest.fn().mockReturnValue({ id: '2' });

      let state = registerSingleton(initialState, 'token1', factory1, mockContainer);
      state = registerSingleton(state, 'token2', factory2, mockContainer);

      expect(factory1).toHaveBeenCalledTimes(1);
      expect(factory2).toHaveBeenCalledTimes(1);
      expect(state.singletons.size).toBe(2);
      expect(state.singletons.get('token1')).toEqual({ id: '1' });
      expect(state.singletons.get('token2')).toEqual({ id: '2' });
    });
  });

  // =============================================================================
  // RESOLVE FUNCTION TESTS
  // =============================================================================

  describe('resolve', () => {
    it('should resolve direct dependency', () => {
      const stateWithDependency = register(initialState, TEST_TOKEN_STRING, testImplementation);

      const result = resolve(stateWithDependency, TEST_TOKEN_STRING, mockContainer);

      expect(result).toBe(testImplementation);
    });

    it('should resolve factory dependency and call factory', () => {
      const stateWithFactory = registerFactory(initialState, TEST_TOKEN_STRING, testFactory);

      const result = resolve(stateWithFactory, TEST_TOKEN_STRING, mockContainer);

      expect(testFactory).toHaveBeenCalledWith(mockContainer);
      expect(result).toEqual({ name: 'FactoryResult', id: 'factory-1' });
    });

    it('should resolve singleton dependency', () => {
      const stateWithSingleton = registerSingleton(initialState, TEST_TOKEN_STRING, singletonFactory, mockContainer);

      const result = resolve(stateWithSingleton, TEST_TOKEN_STRING, mockContainer);

      expect(result).toEqual({ name: 'SingletonResult', id: 'singleton-1' });
      expect(singletonFactory).toHaveBeenCalledTimes(1); // Called during registration
    });

    it('should prioritize singletons over direct dependencies', () => {
      let state = register(initialState, TEST_TOKEN_STRING, testImplementation);
      state = registerSingleton(state, TEST_TOKEN_STRING, singletonFactory, mockContainer);

      const result = resolve(state, TEST_TOKEN_STRING, mockContainer);

      expect(result).toEqual({ name: 'SingletonResult', id: 'singleton-1' });
      expect(result).not.toBe(testImplementation);
    });

    it('should prioritize singletons over factories', () => {
      let state = registerFactory(initialState, TEST_TOKEN_STRING, testFactory);
      state = registerSingleton(state, TEST_TOKEN_STRING, singletonFactory, mockContainer);

      const result = resolve(state, TEST_TOKEN_STRING, mockContainer);

      expect(result).toEqual({ name: 'SingletonResult', id: 'singleton-1' });
      expect(testFactory).not.toHaveBeenCalled();
    });

    it('should prioritize direct dependencies over factories', () => {
      let state = registerFactory(initialState, TEST_TOKEN_STRING, testFactory);
      state = register(state, TEST_TOKEN_STRING, testImplementation);

      const result = resolve(state, TEST_TOKEN_STRING, mockContainer);

      expect(result).toBe(testImplementation);
      expect(testFactory).not.toHaveBeenCalled();
    });

    it('should throw error for missing dependency', () => {
      expect(() => resolve(initialState, MISSING_TOKEN, mockContainer))
        .toThrow('Dependency not found: MissingService. Make sure it\'s registered before resolving.');
    });

    it('should throw error for null token', () => {
      expect(() => resolve(initialState, null as any, mockContainer))
        .toThrow('Token cannot be null or undefined');
    });

    it('should throw error for undefined token', () => {
      expect(() => resolve(initialState, undefined as any, mockContainer))
        .toThrow('Token cannot be null or undefined');
    });

    it('should provide helpful error message for symbol tokens', () => {
      const symbolToken = Symbol('TestSymbol');
      expect(() => resolve(initialState, symbolToken, mockContainer))
        .toThrow('Dependency not found: Symbol(TestSymbol). Make sure it\'s registered before resolving.');
    });

    it('should call factory each time for non-singleton factories', () => {
      const stateWithFactory = registerFactory(initialState, TEST_TOKEN_STRING, testFactory);

      resolve(stateWithFactory, TEST_TOKEN_STRING, mockContainer);
      resolve(stateWithFactory, TEST_TOKEN_STRING, mockContainer);
      resolve(stateWithFactory, TEST_TOKEN_STRING, mockContainer);

      expect(testFactory).toHaveBeenCalledTimes(3);
    });

    it('should resolve different types correctly', () => {
      let state = register(initialState, 'string', 'test string');
      state = register(state, 'number', 42);
      state = register(state, 'boolean', true);
      state = register(state, 'object', { key: 'value' });

      expect(resolve(state, 'string', mockContainer)).toBe('test string');
      expect(resolve(state, 'number', mockContainer)).toBe(42);
      expect(resolve(state, 'boolean', mockContainer)).toBe(true);
      expect(resolve(state, 'object', mockContainer)).toEqual({ key: 'value' });
    });
  });

  // =============================================================================
  // HAS FUNCTION TESTS
  // =============================================================================

  describe('has', () => {
    it('should return true for registered direct dependency', () => {
      const stateWithDependency = register(initialState, TEST_TOKEN_STRING, testImplementation);

      expect(has(stateWithDependency, TEST_TOKEN_STRING)).toBe(true);
    });

    it('should return true for registered factory', () => {
      const stateWithFactory = registerFactory(initialState, TEST_TOKEN_STRING, testFactory);

      expect(has(stateWithFactory, TEST_TOKEN_STRING)).toBe(true);
    });

    it('should return true for registered singleton', () => {
      const stateWithSingleton = registerSingleton(initialState, TEST_TOKEN_STRING, singletonFactory, mockContainer);

      expect(has(stateWithSingleton, TEST_TOKEN_STRING)).toBe(true);
    });

    it('should return false for missing dependency', () => {
      expect(has(initialState, MISSING_TOKEN)).toBe(false);
    });

    it('should return false for null token', () => {
      expect(has(initialState, null as any)).toBe(false);
    });

    it('should return false for undefined token', () => {
      expect(has(initialState, undefined as any)).toBe(false);
    });

    it('should work with symbol tokens', () => {
      const stateWithSymbol = register(initialState, TEST_TOKEN_SYMBOL, testImplementation);

      expect(has(stateWithSymbol, TEST_TOKEN_SYMBOL)).toBe(true);
      expect(has(stateWithSymbol, Symbol('different'))).toBe(false);
    });

    it('should return true when dependency exists in multiple forms', () => {
      let state = register(initialState, TEST_TOKEN_STRING, testImplementation);
      state = registerFactory(state, TEST_TOKEN_STRING, testFactory);
      state = registerSingleton(state, TEST_TOKEN_STRING, singletonFactory, mockContainer);

      expect(has(state, TEST_TOKEN_STRING)).toBe(true);
    });
  });

  // =============================================================================
  // CLEAR FUNCTION TESTS
  // =============================================================================

  describe('clear', () => {
    it('should return empty container state', () => {
      let state = register(initialState, 'dep1', 'value1');
      state = registerFactory(state, 'factory1', testFactory);
      state = registerSingleton(state, 'singleton1', singletonFactory, mockContainer);

      const clearedState = clear();

      expect(clearedState.dependencies.size).toBe(0);
      expect(clearedState.factories.size).toBe(0);
      expect(clearedState.singletons.size).toBe(0);
    });

    it('should return new state instance', () => {
      const clearedState = clear();
      const anotherClearedState = clear();

      expect(clearedState).not.toBe(anotherClearedState);
      expect(clearedState.dependencies).not.toBe(anotherClearedState.dependencies);
    });
  });

  // =============================================================================
  // CLEAR SPECIFIC FUNCTION TESTS
  // =============================================================================

  describe('clearSpecific', () => {
    let complexState: ContainerState;

    beforeEach(() => {
      let state = register(initialState, 'dep1', 'value1');
      state = registerFactory(state, 'factory1', testFactory);
      state = registerSingleton(state, 'singleton1', singletonFactory, mockContainer);
      complexState = state;
    });

    it('should clear only dependencies', () => {
      const newState = clearSpecific(complexState, 'dependencies');

      expect(newState.dependencies.size).toBe(0);
      expect(newState.factories.size).toBe(1);
      expect(newState.singletons.size).toBe(1);
      expect(newState).not.toBe(complexState);
    });

    it('should clear only factories', () => {
      const newState = clearSpecific(complexState, 'factories');

      expect(newState.dependencies.size).toBe(1);
      expect(newState.factories.size).toBe(0);
      expect(newState.singletons.size).toBe(1);
    });

    it('should clear only singletons', () => {
      const newState = clearSpecific(complexState, 'singletons');

      expect(newState.dependencies.size).toBe(1);
      expect(newState.factories.size).toBe(1);
      expect(newState.singletons.size).toBe(0);
    });

    it('should clear all when type is "all"', () => {
      const newState = clearSpecific(complexState, 'all');

      expect(newState.dependencies.size).toBe(0);
      expect(newState.factories.size).toBe(0);
      expect(newState.singletons.size).toBe(0);
    });

    it('should throw error for invalid type', () => {
      expect(() => clearSpecific(complexState, 'invalid' as any))
        .toThrow('Invalid clear type: invalid. Must be \'dependencies\', \'factories\', \'singletons\', or \'all\'');
    });
  });

  // =============================================================================
  // UTILITY FUNCTION TESTS
  // =============================================================================

  describe('getAllTokens', () => {
    it('should return empty array for empty state', () => {
      expect(getAllTokens(initialState)).toEqual([]);
    });

    it('should return all unique tokens', () => {
      let state = register(initialState, 'dep1', 'value1');
      state = registerFactory(state, 'factory1', testFactory);
      state = registerSingleton(state, 'singleton1', singletonFactory, mockContainer);
      state = register(state, TEST_TOKEN_SYMBOL, 'symbol value');

      const tokens = getAllTokens(state);

      expect(tokens).toHaveLength(4);
      expect(tokens).toContain('dep1');
      expect(tokens).toContain('factory1');
      expect(tokens).toContain('singleton1');
      expect(tokens).toContain(TEST_TOKEN_SYMBOL);
    });

    it('should return unique tokens when same token exists in multiple maps', () => {
      let state = register(initialState, 'shared', 'value1');
      state = registerFactory(state, 'shared', testFactory);
      state = registerSingleton(state, 'shared', singletonFactory, mockContainer);

      const tokens = getAllTokens(state);

      expect(tokens).toHaveLength(1);
      expect(tokens).toContain('shared');
    });
  });

  describe('getContainerStats', () => {
    it('should return correct stats for empty container', () => {
      const stats = getContainerStats(initialState);

      expect(stats).toEqual({
        totalRegistrations: 0,
        directDependencies: 0,
        factories: 0,
        singletons: 0,
        uniqueTokens: 0,
      });
    });

    it('should return correct stats for complex container', () => {
      let state = register(initialState, 'dep1', 'value1');
      state = register(state, 'dep2', 'value2');
      state = registerFactory(state, 'factory1', testFactory);
      state = registerSingleton(state, 'singleton1', singletonFactory, mockContainer);
      state = registerSingleton(state, 'singleton2', singletonFactory, mockContainer);

      const stats = getContainerStats(state);

      expect(stats).toEqual({
        totalRegistrations: 5,
        directDependencies: 2,
        factories: 1,
        singletons: 2,
        uniqueTokens: 5,
      });
    });

    it('should count unique tokens correctly with overlapping registrations', () => {
      let state = register(initialState, 'shared', 'value');
      state = registerFactory(state, 'shared', testFactory);
      state = registerSingleton(state, 'unique', singletonFactory, mockContainer);

      const stats = getContainerStats(state);

      expect(stats).toEqual({
        totalRegistrations: 3,
        directDependencies: 1,
        factories: 1,
        singletons: 1,
        uniqueTokens: 2,
      });
    });
  });

  describe('isValidToken', () => {
    it('should return true for string tokens', () => {
      expect(isValidToken('test')).toBe(true);
      expect(isValidToken('')).toBe(true);
    });

    it('should return true for symbol tokens', () => {
      expect(isValidToken(Symbol('test'))).toBe(true);
      expect(isValidToken(Symbol.for('test'))).toBe(true);
    });

    it('should return false for invalid tokens', () => {
      expect(isValidToken(null)).toBe(false);
      expect(isValidToken(undefined)).toBe(false);
      expect(isValidToken(42)).toBe(false);
      expect(isValidToken({})).toBe(false);
      expect(isValidToken([])).toBe(false);
      expect(isValidToken(true)).toBe(false);
    });
  });

  describe('validateContainerState', () => {
    it('should return true for valid container state', () => {
      expect(validateContainerState(initialState)).toBe(true);
    });

    it('should return false for invalid container state', () => {
      const invalidState1 = { ...initialState, dependencies: null as any };
      const invalidState2 = { ...initialState, factories: 'not-a-map' as any };
      const invalidState3 = { ...initialState, singletons: [] as any };

      expect(validateContainerState(invalidState1)).toBe(false);
      expect(validateContainerState(invalidState2)).toBe(false);
      expect(validateContainerState(invalidState3)).toBe(false);
    });
  });
});