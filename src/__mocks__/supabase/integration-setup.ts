/**
 * Integration Test Setup for Supabase
 *
 * Additional setup that runs after jest.setup.js for integration tests.
 * Provides utilities for managing test data and database state.
 */

import { afterEach,beforeEach } from '@jest/globals';

import { createIntegrationTestClient, TEST_CONFIG } from './setup';

// Global test state
let testClient: ReturnType<typeof createIntegrationTestClient> | null = null;
let currentTestRunId: string | null = null;

/**
 * Get or create test client for integration tests
 */
export const getTestClient = () => {
  if (!testClient) {
    testClient = createIntegrationTestClient();
  }
  return testClient;
};

/**
 * Generate unique test run ID for data isolation
 */
export const generateTestRunId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 6);
  return `test_${timestamp}_${random}`;
};

/**
 * Clean up test data for current test run
 */
export const cleanupTestData = async (testRunId: string) => {
  const client = getTestClient();

  try {
    // Clean up in reverse dependency order to avoid foreign key constraints
    const cleanupOperations = [
      // Step activities (references sessions)
      client
        .from('onboarding.step_activities')
        .delete()
        .like('metadata->test_run_id', `%${testRunId}%`),

      // Lead interactions (references leads)
      client
        .from('marketing.lead_interactions')
        .delete()
        .like('metadata->test_run_id', `%${testRunId}%`),

      // Onboarding sessions (may reference leads)
      client
        .from('onboarding.sessions')
        .delete()
        .like('business_data->test_run_id', `%${testRunId}%`),

      // Analytics events
      client
        .from('analytics.events')
        .delete()
        .like('metadata->test_run_id', `%${testRunId}%`),

      // Experiment assignments
      client
        .from('experiments.assignments')
        .delete()
        .eq('session_id', testRunId),

      // Leads (parent table)
      client
        .from('marketing.leads')
        .delete()
        .like('email', `%${testRunId}%`),
    ];

    const results = await Promise.allSettled(cleanupOperations);

    const errors = results
      .filter(r => r.status === 'rejected')
      .map(r => (r as PromiseRejectedResult).reason);

    if (errors.length > 0) {
      console.warn(`Test cleanup warnings for ${testRunId}:`, errors);
    }

  } catch (error) {
    console.warn(`Test data cleanup failed for ${testRunId}:`, error);
    // Don't throw - let tests continue
  }
};

// =============================================================================
// INTEGRATION TEST HOOKS
// =============================================================================

// Set up fresh test run ID before each test
beforeEach(() => {
  if (TEST_CONFIG.TEST_LEVEL === 'integration') {
    currentTestRunId = generateTestRunId();
    process.env.CURRENT_TEST_RUN_ID = currentTestRunId;
  }
});

// Clean up test data after each test
afterEach(async () => {
  if (TEST_CONFIG.TEST_LEVEL === 'integration' && currentTestRunId) {
    await cleanupTestData(currentTestRunId);
    currentTestRunId = null;
    delete process.env.CURRENT_TEST_RUN_ID;
  }
});

// =============================================================================
// UTILITIES FOR INTEGRATION TESTS
// =============================================================================

/**
 * Create test email with test run ID for isolation
 */
export const createTestEmail = (prefix = 'test') => {
  const testRunId = process.env.CURRENT_TEST_RUN_ID || 'default';
  return `${prefix}_${testRunId}@test-${Date.now()}.example.com`;
};

/**
 * Create test phone number for testing
 */
export const createTestPhone = () => {
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `+1555${random}`;
};

/**
 * Add test run ID to metadata for cleanup
 */
export const withTestMetadata = (data: Record<string, any>) => {
  const testRunId = process.env.CURRENT_TEST_RUN_ID;

  if (!testRunId) {
    return data;
  }

  return {
    ...data,
    metadata: {
      ...data.metadata,
      test_run_id: testRunId,
    },
  };
};

/**
 * Wait for async operations to complete
 */
export const waitForAsync = (ms = 100) =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Verify database connection for integration tests
 */
export const verifyDatabaseConnection = async () => {
  const client = getTestClient();

  try {
    const { data, error } = await client
      .from('marketing.leads')
      .select('id')
      .limit(1);

    if (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }

    return true;
  } catch (error) {
    throw new Error(`Integration test database not available: ${error}`);
  }
};

// =============================================================================
// EXPORTS
// =============================================================================

export {
  currentTestRunId,
  TEST_CONFIG,
  testClient,
};