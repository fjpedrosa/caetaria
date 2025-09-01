/**
 * Supabase Testing Setup - Tiered Mock Strategy
 *
 * This file provides a comprehensive mock system for Supabase operations
 * with different mock levels for unit, integration, and E2E testing.
 *
 * MOCK LEVELS:
 * 1. UNIT: Full mocks, no network calls, predictable responses
 * 2. INTEGRATION: Real Supabase client with test database
 * 3. E2E: Real Supabase with isolated test environment
 */

import { createClient } from '@supabase/supabase-js';

import { Database } from '../../lib/supabase/types';

// =============================================================================
// MOCK CONFIGURATION
// =============================================================================

export type TestLevel = 'unit' | 'integration' | 'e2e';

export const TEST_CONFIG = {
  // Test database URLs (set via environment variables in CI/CD)
  SUPABASE_TEST_URL: process.env.SUPABASE_TEST_URL || 'http://localhost:54321',
  SUPABASE_TEST_ANON_KEY: process.env.SUPABASE_TEST_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOuoJeO2VSqw_gvOnkX1TjVBdw3LImJPBd1Y',

  // Test level detection
  TEST_LEVEL: (process.env.TEST_LEVEL || 'unit') as TestLevel,

  // Database schemas for testing
  SCHEMAS: ['marketing', 'onboarding', 'analytics', 'whatsapp', 'experiments'] as const,
} as const;

// =============================================================================
// UNIT TEST MOCKS - Full Client Mock
// =============================================================================

export const createUnitTestMock = () => {
  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    containedBy: jest.fn().mockReturnThis(),
    rangeGt: jest.fn().mockReturnThis(),
    rangeGte: jest.fn().mockReturnThis(),
    rangeLt: jest.fn().mockReturnThis(),
    rangeLte: jest.fn().mockReturnThis(),
    rangeAdjacent: jest.fn().mockReturnThis(),
    overlaps: jest.fn().mockReturnThis(),
    textSearch: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    filter: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    abortSignal: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockReturnThis(),
    csv: jest.fn().mockReturnThis(),
    geojson: jest.fn().mockReturnThis(),
    explain: jest.fn().mockReturnThis(),
    rollback: jest.fn().mockReturnThis(),
    returns: jest.fn().mockReturnThis(),

    // Promise-like methods
    then: jest.fn((callback) => {
      // Default successful response
      const result = {
        data: [],
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      };
      return Promise.resolve(result).then(callback);
    }),
  };

  const mockClient = {
    from: jest.fn(() => mockQueryBuilder),

    // Auth mock
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: null
      }),
      signUp: jest.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: null
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },

    // Storage mock
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: null, error: null }),
        download: jest.fn().mockResolvedValue({ data: null, error: null }),
        remove: jest.fn().mockResolvedValue({ data: null, error: null }),
        list: jest.fn().mockResolvedValue({ data: [], error: null }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: 'https://test-url.com' }
        }),
      }),
    },

    // RPC mock
    rpc: jest.fn().mockResolvedValue({ data: null, error: null }),

    // Schema mock
    schema: jest.fn().mockReturnThis(),

    // Channel/Realtime mock
    channel: jest.fn().mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnValue(Promise.resolve('SUBSCRIBED')),
      unsubscribe: jest.fn().mockReturnValue(Promise.resolve('CLOSED')),
      send: jest.fn().mockReturnThis(),
    }),

    // Remove channels
    removeAllChannels: jest.fn(),
    removeChannel: jest.fn(),

    // Functions mock
    functions: {
      invoke: jest.fn().mockResolvedValue({ data: null, error: null }),
    },
  };

  return mockClient;
};

// =============================================================================
// INTEGRATION TEST CLIENT - Real Client with Test Database
// =============================================================================

export const createIntegrationTestClient = () => {
  if (!TEST_CONFIG.SUPABASE_TEST_URL || !TEST_CONFIG.SUPABASE_TEST_ANON_KEY) {
    throw new Error(
      'Integration tests require SUPABASE_TEST_URL and SUPABASE_TEST_ANON_KEY environment variables'
    );
  }

  return createClient<Database>(
    TEST_CONFIG.SUPABASE_TEST_URL,
    TEST_CONFIG.SUPABASE_TEST_ANON_KEY,
    {
      auth: {
        persistSession: false, // Don't persist sessions in tests
        autoRefreshToken: false,
      },
      global: {
        headers: {
          'x-test-mode': 'true', // Identify test requests
        },
      },
    }
  );
};

// =============================================================================
// SMART MOCK FACTORY - Auto-detects Test Level
// =============================================================================

export const createTestSupabaseClient = (testLevel?: TestLevel) => {
  const level = testLevel || TEST_CONFIG.TEST_LEVEL;

  switch (level) {
    case 'unit':
      return createUnitTestMock();
    case 'integration':
    case 'e2e':
      return createIntegrationTestClient();
    default:
      console.warn(`Unknown test level: ${level}. Falling back to unit test mock.`);
      return createUnitTestMock();
  }
};

// =============================================================================
// MOCK RESPONSE BUILDERS - Helpers for Unit Tests
// =============================================================================

export const createMockResponse = {
  success: <T>(data: T, count?: number) => ({
    data,
    error: null,
    count,
    status: 200,
    statusText: 'OK',
  }),

  error: (message: string, code?: string, status = 400) => ({
    data: null,
    error: {
      message,
      code: code || 'test_error',
      details: null,
      hint: null,
    },
    count: null,
    status,
    statusText: status === 400 ? 'Bad Request' : 'Error',
  }),

  empty: () => ({
    data: [],
    error: null,
    count: 0,
    status: 200,
    statusText: 'OK',
  }),
};

// =============================================================================
// AUTO-APPLY MOCKS BASED ON TEST LEVEL
// =============================================================================

// Only apply mocks for unit tests
if (TEST_CONFIG.TEST_LEVEL === 'unit') {
  // Mock the Supabase client module
  jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => createUnitTestMock()),
  }));

  // Mock our Supabase client exports
  jest.mock('../../lib/supabase/client', () => ({
    supabase: createUnitTestMock(),
  }));

  jest.mock('../../lib/supabase/server', () => ({
    createClient: jest.fn(() => createUnitTestMock()),
    supabaseServer: createUnitTestMock(),
  }));
}

// =============================================================================
// TYPE HELPERS FOR TESTS
// =============================================================================

export type MockSupabaseClient = ReturnType<typeof createUnitTestMock>;
export type TestSupabaseClient = ReturnType<typeof createTestSupabaseClient>;

// Export for direct import in test files
export { TEST_CONFIG };
export default createTestSupabaseClient;