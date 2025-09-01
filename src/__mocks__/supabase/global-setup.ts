/**
 * Jest Global Setup for Supabase Testing
 *
 * Sets up test database and environment before running tests.
 * Only runs for integration and E2E tests.
 */

import { createClient } from '@supabase/supabase-js';

import { TEST_CONFIG } from './setup';

export default async function globalSetup() {
  // Only run setup for integration/e2e tests
  if (TEST_CONFIG.TEST_LEVEL === 'unit') {
    console.log('🧪 Unit tests: Skipping database setup');
    return;
  }

  console.log(`🏗️  Setting up test database for ${TEST_CONFIG.TEST_LEVEL} tests...`);

  try {
    // Verify test database connection
    const supabase = createClient(
      TEST_CONFIG.SUPABASE_TEST_URL,
      TEST_CONFIG.SUPABASE_TEST_ANON_KEY
    );

    // Simple connection test
    const { data, error } = await supabase
      .from('marketing.leads')
      .select('id')
      .limit(1);

    if (error) {
      console.warn('⚠️  Database connection test failed:', error.message);
      console.warn('Integration tests may fail. Ensure test database is running.');
    } else {
      console.log('✅ Test database connection verified');
    }

    // Set global test identifiers
    process.env.TEST_RUN_ID = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`🎯 Test run ID: ${process.env.TEST_RUN_ID}`);

  } catch (error) {
    console.error('❌ Global test setup failed:', error);

    if (TEST_CONFIG.TEST_LEVEL === 'integration') {
      console.error('\n💡 To fix integration test setup:');
      console.error('  1. Start local Supabase: supabase start');
      console.error('  2. Verify migrations: supabase db reset');
      console.error('  3. Check connection: supabase status');
      console.error('\n🔄 Or run unit tests instead: TEST_LEVEL=unit npm test');
    }

    // Don't fail setup for integration tests - let individual tests handle missing DB
    if (TEST_CONFIG.TEST_LEVEL === 'e2e') {
      throw error; // E2E tests require working database
    }
  }
}