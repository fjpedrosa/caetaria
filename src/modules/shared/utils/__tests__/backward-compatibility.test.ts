/**
 * Backward Compatibility Tests
 * Clean Architecture - Ensures SimpleDependencyContainer class remains fully compatible
 *
 * This test suite verifies that the deprecated SimpleDependencyContainer class
 * maintains exact API compatibility while using the functional implementation internally.
 */

import {
  createDependencyContainer,
  createSimpleDependencyContainer,
  DEPENDENCY_TOKENS,
  type DependencyContainer,
  isLegacyContainer,
  migrateLegacyContainer,
  SimpleDependencyContainer} from '../../application/interfaces/dependency-container';

describe('SimpleDependencyContainer Backward Compatibility', () => {
  let consoleWarnSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;

  beforeEach(() => {
    // Spy on console methods to test deprecation warnings
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleInfoSpy.mockRestore();
  });

  describe('API Compatibility', () => {
    it('should maintain exact same public API as functional implementation', () => {
      const legacyContainer = new SimpleDependencyContainer();
      const functionalContainer = createSimpleDependencyContainer();

      // Both should have the same methods
      expect(typeof legacyContainer.register).toBe('function');
      expect(typeof legacyContainer.registerFactory).toBe('function');
      expect(typeof legacyContainer.registerSingleton).toBe('function');
      expect(typeof legacyContainer.resolve).toBe('function');
      expect(typeof legacyContainer.has).toBe('function');
      expect(typeof legacyContainer.clear).toBe('function');

      expect(typeof functionalContainer.register).toBe('function');
      expect(typeof functionalContainer.registerFactory).toBe('function');
      expect(typeof functionalContainer.registerSingleton).toBe('function');
      expect(typeof functionalContainer.resolve).toBe('function');
      expect(typeof functionalContainer.has).toBe('function');
      expect(typeof functionalContainer.clear).toBe('function');
    });

    it('should handle direct dependency registration identically', () => {
      const legacyContainer = new SimpleDependencyContainer();
      const functionalContainer = createSimpleDependencyContainer();

      const mockService = { name: 'TestService', version: '1.0.0' };

      // Register in both containers
      legacyContainer.register(DEPENDENCY_TOKENS.CONFIG, mockService);
      functionalContainer.register(DEPENDENCY_TOKENS.CONFIG, mockService);

      // Both should resolve to the same value
      expect(legacyContainer.resolve(DEPENDENCY_TOKENS.CONFIG)).toEqual(mockService);
      expect(functionalContainer.resolve(DEPENDENCY_TOKENS.CONFIG)).toEqual(mockService);

      // Both should report having the dependency
      expect(legacyContainer.has(DEPENDENCY_TOKENS.CONFIG)).toBe(true);
      expect(functionalContainer.has(DEPENDENCY_TOKENS.CONFIG)).toBe(true);
    });

    it('should handle factory registration identically', () => {
      const legacyContainer = new SimpleDependencyContainer();
      const functionalContainer = createSimpleDependencyContainer();

      const factory = (container: DependencyContainer) => ({
        created: new Date('2024-01-01'),
        id: 'factory-service'
      });

      // Register factory in both containers
      legacyContainer.registerFactory(DEPENDENCY_TOKENS.EMAIL_CLIENT, factory);
      functionalContainer.registerFactory(DEPENDENCY_TOKENS.EMAIL_CLIENT, factory);

      // Both should resolve factory results
      const legacyResult = legacyContainer.resolve(DEPENDENCY_TOKENS.EMAIL_CLIENT);
      const functionalResult = functionalContainer.resolve(DEPENDENCY_TOKENS.EMAIL_CLIENT);

      expect(legacyResult).toEqual(functionalResult);
      expect(legacyResult.id).toBe('factory-service');
    });

    it('should handle singleton registration identically', () => {
      const legacyContainer = new SimpleDependencyContainer();
      const functionalContainer = createSimpleDependencyContainer();

      let creationCount = 0;
      const singletonFactory = () => {
        creationCount++;
        return { instanceId: creationCount, created: new Date() };
      };

      // Register singleton in both containers
      legacyContainer.registerSingleton(DEPENDENCY_TOKENS.ANALYTICS_SERVICE, singletonFactory);
      functionalContainer.registerSingleton(DEPENDENCY_TOKENS.ANALYTICS_SERVICE, singletonFactory);

      // First resolution should create instance
      const legacyFirst = legacyContainer.resolve(DEPENDENCY_TOKENS.ANALYTICS_SERVICE);
      const legacySecond = legacyContainer.resolve(DEPENDENCY_TOKENS.ANALYTICS_SERVICE);

      const functionalFirst = functionalContainer.resolve(DEPENDENCY_TOKENS.ANALYTICS_SERVICE);
      const functionalSecond = functionalContainer.resolve(DEPENDENCY_TOKENS.ANALYTICS_SERVICE);

      // Both should return same instance (singleton behavior)
      expect(legacyFirst).toBe(legacySecond);
      expect(functionalFirst).toBe(functionalSecond);

      // Instance IDs should be consistent
      expect(legacyFirst.instanceId).toBe(1);
      expect(functionalFirst.instanceId).toBe(2); // Different container, new instance
    });

    it('should handle clear() method identically', () => {
      const legacyContainer = new SimpleDependencyContainer();
      const functionalContainer = createSimpleDependencyContainer();

      const mockService = { name: 'ClearTest' };

      // Register and verify
      legacyContainer.register(DEPENDENCY_TOKENS.CONFIG, mockService);
      functionalContainer.register(DEPENDENCY_TOKENS.CONFIG, mockService);

      expect(legacyContainer.has(DEPENDENCY_TOKENS.CONFIG)).toBe(true);
      expect(functionalContainer.has(DEPENDENCY_TOKENS.CONFIG)).toBe(true);

      // Clear both
      legacyContainer.clear();
      functionalContainer.clear();

      // Both should be empty
      expect(legacyContainer.has(DEPENDENCY_TOKENS.CONFIG)).toBe(false);
      expect(functionalContainer.has(DEPENDENCY_TOKENS.CONFIG)).toBe(false);
    });
  });

  describe('Deprecation Warnings', () => {
    it('should show deprecation warning on first usage in development', () => {
      // Set development environment
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const container = new SimpleDependencyContainer();

      // First call should trigger warning
      container.register(DEPENDENCY_TOKENS.CONFIG, { test: true });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('SimpleDependencyContainer.register() is deprecated!')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Replace \'new SimpleDependencyContainer()\' with \'createSimpleDependencyContainer()\'')
      );

      // Reset console spy
      consoleWarnSpy.mockClear();

      // Second call should not trigger warning (hasWarned = true)
      container.register(DEPENDENCY_TOKENS.LOGGER, { log: () => {} });

      expect(consoleWarnSpy).not.toHaveBeenCalled();

      // Restore environment
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should not show warnings in production environment', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const container = new SimpleDependencyContainer();
      container.register(DEPENDENCY_TOKENS.CONFIG, { test: true });

      expect(consoleWarnSpy).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalNodeEnv;
    });
  });

  describe('Type Guards and Migration Helpers', () => {
    it('should correctly identify legacy container instances', () => {
      const legacyContainer = new SimpleDependencyContainer();
      const functionalContainer = createSimpleDependencyContainer();

      expect(isLegacyContainer(legacyContainer)).toBe(true);
      expect(isLegacyContainer(functionalContainer)).toBe(false);
    });

    it('should provide migration helper with informational message', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const legacyContainer = new SimpleDependencyContainer();
      const migratedContainer = migrateLegacyContainer(legacyContainer);

      expect(migratedContainer).toBeDefined();
      expect(isLegacyContainer(migratedContainer)).toBe(false);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('Container migrated successfully!')
      );

      process.env.NODE_ENV = originalNodeEnv;
    });
  });

  describe('Error Handling Compatibility', () => {
    it('should throw identical errors for missing dependencies', () => {
      const legacyContainer = new SimpleDependencyContainer();
      const functionalContainer = createSimpleDependencyContainer();

      const missingToken = Symbol('MissingDependency');

      expect(() => legacyContainer.resolve(missingToken)).toThrow('Dependency not found');
      expect(() => functionalContainer.resolve(missingToken)).toThrow('Dependency not found');
    });

    it('should handle invalid tokens consistently', () => {
      const legacyContainer = new SimpleDependencyContainer();
      const functionalContainer = createSimpleDependencyContainer();

      // Both should handle string and symbol tokens
      legacyContainer.register('string-token', { type: 'string' });
      legacyContainer.register(Symbol('symbol-token'), { type: 'symbol' });

      functionalContainer.register('string-token', { type: 'string' });
      functionalContainer.register(Symbol('symbol-token'), { type: 'symbol' });

      expect(legacyContainer.has('string-token')).toBe(true);
      expect(functionalContainer.has('string-token')).toBe(true);
    });
  });

  describe('Performance and Memory Compatibility', () => {
    it('should handle large numbers of dependencies without performance degradation', () => {
      const legacyContainer = new SimpleDependencyContainer();
      const functionalContainer = createSimpleDependencyContainer();

      const dependencyCount = 1000;

      // Register many dependencies
      const startLegacy = performance.now();
      for (let i = 0; i < dependencyCount; i++) {
        legacyContainer.register(`dependency-${i}`, { id: i, name: `Dependency ${i}` });
      }
      const endLegacy = performance.now();

      const startFunctional = performance.now();
      for (let i = 0; i < dependencyCount; i++) {
        functionalContainer.register(`dependency-${i}`, { id: i, name: `Dependency ${i}` });
      }
      const endFunctional = performance.now();

      // Performance should be comparable
      const legacyTime = endLegacy - startLegacy;
      const functionalTime = endFunctional - startFunctional;

      // Functional should be at least as fast or faster
      expect(functionalTime).toBeLessThanOrEqual(legacyTime * 2); // Allow 2x tolerance

      // Verify all dependencies are accessible
      expect(legacyContainer.has('dependency-0')).toBe(true);
      expect(legacyContainer.has('dependency-999')).toBe(true);
      expect(functionalContainer.has('dependency-0')).toBe(true);
      expect(functionalContainer.has('dependency-999')).toBe(true);
    });
  });

  describe('Integration with Existing Code', () => {
    it('should work seamlessly with existing container setup code', () => {
      // Simulate existing setup code that uses the class
      function setupContainer(): DependencyContainer {
        const container = new SimpleDependencyContainer();

        container.register(DEPENDENCY_TOKENS.CONFIG, {
          apiUrl: 'https://api.example.com',
          apiKey: 'test-key'
        });

        container.registerFactory(DEPENDENCY_TOKENS.EMAIL_CLIENT, (c) => {
          const config = c.resolve<any>(DEPENDENCY_TOKENS.CONFIG);
          return {
            send: async (to: string, subject: string) => `Sent to ${to}: ${subject}`,
            apiUrl: config.apiUrl
          };
        });

        return container;
      }

      // Should work without any changes
      const container = setupContainer();

      expect(container.has(DEPENDENCY_TOKENS.CONFIG)).toBe(true);
      expect(container.has(DEPENDENCY_TOKENS.EMAIL_CLIENT)).toBe(true);

      const config = container.resolve<any>(DEPENDENCY_TOKENS.CONFIG);
      const emailClient = container.resolve<any>(DEPENDENCY_TOKENS.EMAIL_CLIENT);

      expect(config.apiUrl).toBe('https://api.example.com');
      expect(emailClient.apiUrl).toBe('https://api.example.com');
    });
  });

  describe('Module Integration Tests', () => {
    it('should work with existing module configuration patterns', () => {
      // Test that legacy container works with existing module configs
      const container = new SimpleDependencyContainer();

      // Simulate module registration
      container.register(DEPENDENCY_TOKENS.CONFIG, {
        environment: 'test',
        features: ['analytics', 'notifications']
      });

      container.registerSingleton(DEPENDENCY_TOKENS.ANALYTICS_SERVICE, (c) => {
        const config = c.resolve<any>(DEPENDENCY_TOKENS.CONFIG);
        return {
          environment: config.environment,
          track: (event: string) => `Tracking ${event} in ${config.environment}`,
          initialized: true
        };
      });

      // Should work exactly like before
      const analytics = container.resolve<any>(DEPENDENCY_TOKENS.ANALYTICS_SERVICE);
      expect(analytics.environment).toBe('test');
      expect(analytics.track('user_click')).toBe('Tracking user_click in test');

      // Singleton should be maintained
      const analytics2 = container.resolve<any>(DEPENDENCY_TOKENS.ANALYTICS_SERVICE);
      expect(analytics).toBe(analytics2);
    });
  });
});