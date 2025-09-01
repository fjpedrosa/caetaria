/**
 * Jest Global Teardown for Supabase Testing
 *
 * Cleans up test data and connections after running tests.
 */

import { createClient } from '@supabase/supabase-js';

import { TEST_CONFIG } from './setup';

export default async function globalTeardown() {
  // Only run teardown for integration/e2e tests
  if (TEST_CONFIG.TEST_LEVEL === 'unit') {
    return;
  }

  console.log(`🧹 Cleaning up test database for ${TEST_CONFIG.TEST_LEVEL} tests...`);

  try {
    const supabase = createClient(
      TEST_CONFIG.SUPABASE_TEST_URL,
      TEST_CONFIG.SUPABASE_TEST_ANON_KEY
    );

    const testRunId = process.env.TEST_RUN_ID;

    if (testRunId && TEST_CONFIG.TEST_LEVEL === 'integration') {
      console.log(`🗑️  Cleaning up test data for run: ${testRunId}`);

      // Clean up test data in reverse dependency order
      const cleanupPromises = [
        // Analytics data
        supabase
          .from('analytics.events')
          .delete()
          .like('metadata->test_run_id', `%${testRunId}%`),

        // Onboarding data
        supabase
          .from('onboarding.step_activities')
          .delete()
          .like('metadata->test_run_id', `%${testRunId}%`),

        supabase
          .from('onboarding.sessions')
          .delete()
          .like('business_data->test_run_id', `%${testRunId}%`),

        // Marketing data
        supabase
          .from('marketing.lead_interactions')
          .delete()
          .like('metadata->test_run_id', `%${testRunId}%`),

        supabase
          .from('marketing.leads')
          .delete()
          .like('email', `%${testRunId}%`),

        // Experiment data
        supabase
          .from('experiments.assignments')
          .delete()
          .eq('session_id', testRunId),
      ];

      const results = await Promise.allSettled(cleanupPromises);

      const successCount = results.filter(r => r.status === 'fulfilled').length;
      console.log(`✅ Cleanup completed: ${successCount}/${results.length} operations successful`);

      const failures = results.filter(r => r.status === 'rejected');
      if (failures.length > 0) {
        console.warn('⚠️  Some cleanup operations failed (this may be normal)');
      }
    }

  } catch (error) {
    console.warn('⚠️  Test teardown encountered an issue:', error);
    // Don't fail the teardown - tests are already complete
  }

  console.log('🏁 Test database cleanup completed');
}