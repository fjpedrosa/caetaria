/**
 * Migration Example - Class to Functional Container
 * Clean Architecture - Shows how to migrate from SimpleDependencyContainer class to functional implementation
 *
 * This file demonstrates how to replace the class-based SimpleDependencyContainer
 * with the new pure functional implementation.
 */

import {
  DEPENDENCY_TOKENS,
  type DependencyContainer,
  SimpleDependencyContainer,
} from '../application/interfaces/dependency-container';

import {
  ContainerBuilder,
  containerBuilder,
  createFunctionalContainer,
  createImmutableContainer,
} from './functional-container';

// =============================================================================
// BEFORE - Class-based implementation (what we had)
// =============================================================================

/**
 * OLD WAY: Using the class-based SimpleDependencyContainer
 */
function setupContainerOldWay(): DependencyContainer {
  const container = new SimpleDependencyContainer();

  // Register direct dependencies
  container.register(DEPENDENCY_TOKENS.CONFIG, {
    apiUrl: 'https://api.example.com',
    apiKey: 'secret-key'
  });

  container.register(DEPENDENCY_TOKENS.LOGGER, {
    log: (message: string) => console.log(`[LOG] ${message}`),
    error: (message: string) => console.error(`[ERROR] ${message}`)
  });

  // Register factory
  container.registerFactory(DEPENDENCY_TOKENS.EMAIL_CLIENT, (c) => {
    const config = c.resolve<any>(DEPENDENCY_TOKENS.CONFIG);
    return {
      send: async (to: string, subject: string, body: string) => {
        console.log(`Sending email to ${to}: ${subject}`);
        return { id: `email-${Date.now()}` };
      },
      apiUrl: config.apiUrl
    };
  });

  // Register singleton
  container.registerSingleton(DEPENDENCY_TOKENS.ANALYTICS_SERVICE, (c) => {
    const logger = c.resolve<any>(DEPENDENCY_TOKENS.LOGGER);
    logger.log('Creating Analytics Service singleton');
    return {
      track: (event: string, properties?: Record<string, any>) => {
        logger.log(`Tracking event: ${event}`, properties);
      },
      createdAt: new Date()
    };
  });

  return container;
}

// =============================================================================
// AFTER - Functional implementations (new approach)
// =============================================================================

/**
 * NEW WAY 1: Using createFunctionalContainer (drop-in replacement)
 * - Same interface as SimpleDependencyContainer
 * - Mutable operations but with immutable internal state
 * - Closure-based state management
 */
function setupContainerFunctionalWay(): DependencyContainer {
  const container = createFunctionalContainer();

  // Same API as before, but now using pure functions internally
  container.register(DEPENDENCY_TOKENS.CONFIG, {
    apiUrl: 'https://api.example.com',
    apiKey: 'secret-key'
  });

  container.register(DEPENDENCY_TOKENS.LOGGER, {
    log: (message: string) => console.log(`[LOG] ${message}`),
    error: (message: string) => console.error(`[ERROR] ${message}`)
  });

  container.registerFactory(DEPENDENCY_TOKENS.EMAIL_CLIENT, (c) => {
    const config = c.resolve<any>(DEPENDENCY_TOKENS.CONFIG);
    return {
      send: async (to: string, subject: string, body: string) => {
        console.log(`Sending email to ${to}: ${subject}`);
        return { id: `email-${Date.now()}` };
      },
      apiUrl: config.apiUrl
    };
  });

  container.registerSingleton(DEPENDENCY_TOKENS.ANALYTICS_SERVICE, (c) => {
    const logger = c.resolve<any>(DEPENDENCY_TOKENS.LOGGER);
    logger.log('Creating Analytics Service singleton');
    return {
      track: (event: string, properties?: Record<string, any>) => {
        logger.log(`Tracking event: ${event}`, properties);
      },
      createdAt: new Date()
    };
  });

  return container;
}

/**
 * NEW WAY 2: Using ContainerBuilder (fluent API)
 * - Method chaining for clean setup
 * - Can build either functional or immutable containers
 */
function setupContainerBuilderWay(): DependencyContainer {
  return containerBuilder()
    .register(DEPENDENCY_TOKENS.CONFIG, {
      apiUrl: 'https://api.example.com',
      apiKey: 'secret-key'
    })
    .register(DEPENDENCY_TOKENS.LOGGER, {
      log: (message: string) => console.log(`[LOG] ${message}`),
      error: (message: string) => console.error(`[ERROR] ${message}`)
    })
    .registerFactory(DEPENDENCY_TOKENS.EMAIL_CLIENT, (c) => {
      const config = c.resolve<any>(DEPENDENCY_TOKENS.CONFIG);
      return {
        send: async (to: string, subject: string, body: string) => {
          console.log(`Sending email to ${to}: ${subject}`);
          return { id: `email-${Date.now()}` };
        },
        apiUrl: config.apiUrl
      };
    })
    .build(); // Could also use .buildImmutable() for immutable container
}

/**
 * NEW WAY 3: Using Immutable Container (functional composition)
 * - Returns new containers for each operation
 * - Useful for configuration scenarios or testing variations
 */
function setupContainerImmutableWay() {
  const baseContainer = createImmutableContainer();

  const configuredContainer = baseContainer
    .withRegistration(DEPENDENCY_TOKENS.CONFIG, {
      apiUrl: 'https://api.example.com',
      apiKey: 'secret-key'
    })
    .withRegistration(DEPENDENCY_TOKENS.LOGGER, {
      log: (message: string) => console.log(`[LOG] ${message}`),
      error: (message: string) => console.error(`[ERROR] ${message}`)
    })
    .withFactory(DEPENDENCY_TOKENS.EMAIL_CLIENT, (c) => {
      const config = c.resolve<any>(DEPENDENCY_TOKENS.CONFIG);
      return {
        send: async (to: string, subject: string, body: string) => {
          console.log(`Sending email to ${to}: ${subject}`);
          return { id: `email-${Date.now()}` };
        },
        apiUrl: config.apiUrl
      };
    });

  // Can create variations without affecting the original
  const prodContainer = configuredContainer.withRegistration(DEPENDENCY_TOKENS.CONFIG, {
    apiUrl: 'https://prod-api.example.com',
    apiKey: process.env.PROD_API_KEY || 'prod-key'
  });

  const testContainer = configuredContainer.withRegistration(DEPENDENCY_TOKENS.CONFIG, {
    apiUrl: 'https://test-api.example.com',
    apiKey: 'test-key'
  });

  return { base: baseContainer, configured: configuredContainer, prod: prodContainer, test: testContainer };
}

// =============================================================================
// DEMONSTRATION AND COMPARISON
// =============================================================================

/**
 * Demonstrates that both approaches work identically
 */
function demonstrateCompatibility() {
  console.log('=== Compatibility Demonstration ===\n');

  const oldContainer = setupContainerOldWay();
  const newContainer = setupContainerFunctionalWay();

  // Both containers should behave identically
  const testDependency = (container: DependencyContainer, name: string) => {
    console.log(`Testing ${name} container:`);

    // Test has() method
    console.log(`  Has CONFIG: ${container.has(DEPENDENCY_TOKENS.CONFIG)}`);
    console.log(`  Has LOGGER: ${container.has(DEPENDENCY_TOKENS.LOGGER)}`);
    console.log(`  Has EMAIL_CLIENT: ${container.has(DEPENDENCY_TOKENS.EMAIL_CLIENT)}`);
    console.log(`  Has ANALYTICS_SERVICE: ${container.has(DEPENDENCY_TOKENS.ANALYTICS_SERVICE)}`);

    // Test resolve() method
    const config = container.resolve<any>(DEPENDENCY_TOKENS.CONFIG);
    const logger = container.resolve<any>(DEPENDENCY_TOKENS.LOGGER);
    const emailClient = container.resolve<any>(DEPENDENCY_TOKENS.EMAIL_CLIENT);
    const analytics = container.resolve<any>(DEPENDENCY_TOKENS.ANALYTICS_SERVICE);

    console.log(`  CONFIG resolved: ${config.apiUrl}`);
    console.log(`  EMAIL_CLIENT has correct API URL: ${emailClient.apiUrl === config.apiUrl}`);
    console.log(`  ANALYTICS_SERVICE created at: ${analytics.createdAt}`);

    // Test singleton behavior (should be same instance)
    const analytics2 = container.resolve<any>(DEPENDENCY_TOKENS.ANALYTICS_SERVICE);
    console.log(`  Singleton working: ${analytics === analytics2}`);

    console.log('');
  };

  testDependency(oldContainer, 'OLD (Class-based)');
  testDependency(newContainer, 'NEW (Functional)');
}

/**
 * Demonstrates advanced features only available in functional containers
 */
function demonstrateAdvancedFeatures() {
  console.log('=== Advanced Features Demonstration ===\n');

  const container = createFunctionalContainer();
  container.register('service1', { name: 'Service 1' });
  container.register('service2', { name: 'Service 2' });
  container.registerFactory('factory1', () => ({ created: new Date() }));

  // New features not available in class-based container
  console.log('Container Stats:', container.getStats());
  console.log('All Tokens:', container.getAllTokens());

  // State inspection
  const state = container.getState();
  console.log('Dependencies count:', state.dependencies.size);
  console.log('Factories count:', state.factories.size);

  // Selective clearing
  container.clearSpecific('dependencies');
  console.log('After clearing dependencies:', container.getStats());
}

/**
 * Shows performance comparison
 */
async function performanceComparison() {
  console.log('=== Performance Comparison ===\n');

  const iterations = 10000;

  // Test class-based performance
  const startOld = performance.now();
  for (let i = 0; i < iterations; i++) {
    const container = new SimpleDependencyContainer();
    container.register(`token${i}`, { value: i });
    container.resolve(`token${i}`);
  }
  const endOld = performance.now();

  // Test functional performance
  const startNew = performance.now();
  for (let i = 0; i < iterations; i++) {
    const container = createFunctionalContainer();
    container.register(`token${i}`, { value: i });
    container.resolve(`token${i}`);
  }
  const endNew = performance.now();

  console.log(`Class-based (${iterations} operations): ${(endOld - startOld).toFixed(2)}ms`);
  console.log(`Functional (${iterations} operations): ${(endNew - startNew).toFixed(2)}ms`);
  console.log(`Performance difference: ${((endNew - startNew) / (endOld - startOld) * 100).toFixed(1)}%`);
}

/**
 * Migration strategy recommendations
 */
function migrationStrategies() {
  console.log('=== Migration Strategies ===\n');

  console.log('1. DROP-IN REPLACEMENT:');
  console.log('   Replace: new SimpleDependencyContainer()');
  console.log('   With:    createFunctionalContainer()');
  console.log('   - Same API, zero code changes needed');
  console.log('   - Benefits: better testability, immutable internals\n');

  console.log('2. FLUENT API UPGRADE:');
  console.log('   Replace: manual container.register() calls');
  console.log('   With:    containerBuilder().register().registerFactory().build()');
  console.log('   - More readable configuration');
  console.log('   - Better IDE support with chaining\n');

  console.log('3. IMMUTABLE APPROACH:');
  console.log('   Use:     createImmutableContainer()');
  console.log('   For:     Configuration scenarios, A/B testing, test variations');
  console.log('   - Each operation returns new container');
  console.log('   - Great for functional composition\n');

  console.log('4. GRADUAL MIGRATION:');
  console.log('   - Start with drop-in replacement');
  console.log('   - Gradually adopt builder pattern for new code');
  console.log('   - Use immutable containers for specific use cases');
  console.log('   - Leverage advanced features (stats, state inspection) for debugging');
}

// =============================================================================
// EXAMPLE USAGE
// =============================================================================

if (require.main === module) {
  console.log('SimpleDependencyContainer Migration Example\n');
  console.log('==========================================\n');

  try {
    demonstrateCompatibility();
    demonstrateAdvancedFeatures();
    performanceComparison();
    migrationStrategies();
  } catch (error) {
    console.error('Demo failed:', error);
  }
}

export {
  demonstrateAdvancedFeatures,
  demonstrateCompatibility,
  migrationStrategies,
  performanceComparison,
  setupContainerBuilderWay,
  setupContainerFunctionalWay,
  setupContainerImmutableWay,
  setupContainerOldWay,
};