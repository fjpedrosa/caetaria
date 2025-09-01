/**
 * E2E Database State Manager
 *
 * Provides utilities for managing database state during E2E tests,
 * including setup, cleanup, and data seeding for Playwright tests.
 */

import { createClient } from '@supabase/supabase-js';

import { Database } from '../../lib/supabase/types';
import {
  createEventFactory,
  createExperimentFactory,
  createLeadFactory,
  createOnboardingScenario,
  createOnboardingSessionFactory,
  type LeadInsert
} from '../test-data/factories';

// =============================================================================
// E2E DATABASE CONFIGURATION
// =============================================================================

export interface E2ETestConfig {
  supabaseUrl: string;
  supabaseKey: string;
  testRunId: string;
  cleanupOnError: boolean;
  maxRetries: number;
}

export const DEFAULT_E2E_CONFIG: E2ETestConfig = {
  supabaseUrl: process.env.SUPABASE_TEST_URL || 'http://localhost:54321',
  supabaseKey: process.env.SUPABASE_TEST_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOuoJeO2VSqw_gvOnkX1TjVBdw3LImJPBd1Y',
  testRunId: `e2e_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
  cleanupOnError: true,
  maxRetries: 3,
};

// =============================================================================
// DATABASE MANAGER CLASS
// =============================================================================

export class E2EDatabaseManager {
  private client: ReturnType<typeof createClient<Database>>;
  private config: E2ETestConfig;
  private createdRecords: Map<string, string[]> = new Map();

  constructor(config: Partial<E2ETestConfig> = {}) {
    this.config = { ...DEFAULT_E2E_CONFIG, ...config };
    this.client = createClient<Database>(this.config.supabaseUrl, this.config.supabaseKey, {
      auth: { persistSession: false },
    });
  }

  // ===========================================================================
  // CONNECTION AND HEALTH CHECKS
  // ===========================================================================

  /**
   * Verify database connection and schema
   */
  async verifyConnection(): Promise<void> {
    try {
      // Test basic connection
      const { error } = await this.client
        .from('marketing.leads')
        .select('id')
        .limit(1);

      if (error) {
        throw new Error(`Database connection failed: ${error.message}`);
      }

      // Verify all required schemas exist
      const schemas = ['marketing', 'onboarding', 'analytics', 'experiments'];
      for (const schema of schemas) {
        const { error: schemaError } = await this.client
          .from(`${schema}.${this.getTableForSchema(schema)}` as any)
          .select('id')
          .limit(1);

        if (schemaError) {
          throw new Error(`Schema ${schema} not available: ${schemaError.message}`);
        }
      }

    } catch (error) {
      throw new Error(`E2E database verification failed: ${error}`);
    }
  }

  private getTableForSchema(schema: string): string {
    const schemaTables = {
      marketing: 'leads',
      onboarding: 'sessions',
      analytics: 'events',
      experiments: 'experiments',
    };
    return schemaTables[schema as keyof typeof schemaTables] || 'unknown';
  }

  // ===========================================================================
  // DATA SEEDING METHODS
  // ===========================================================================

  /**
   * Seed basic test data for E2E tests
   */
  async seedBasicTestData(): Promise<{
    leads: any[];
    sessions: any[];
    events: any[];
    experiments: any[];
  }> {
    console.log(`🌱 Seeding basic test data for run: ${this.config.testRunId}`);

    try {
      // Create test leads
      const leadData = Array.from({ length: 3 }, (_, i) =>
        createLeadFactory({
          email: `e2e_lead_${i}_${this.config.testRunId}@test.example.com`,
          first_name: `TestUser${i}`,
          company_name: `TestCompany${i}`,
        })
      );

      const { data: leads, error: leadsError } = await this.client
        .from('marketing.leads')
        .insert(leadData)
        .select();

      if (leadsError) throw leadsError;
      this.trackCreatedRecords('marketing.leads', leads.map(l => l.id));

      // Create onboarding sessions
      const sessionData = leads.map((lead, i) =>
        createOnboardingSessionFactory({
          lead_id: lead.id,
          session_token: `e2e_session_${i}_${this.config.testRunId}`,
          business_data: {
            test_run_id: this.config.testRunId,
            business_type: 'restaurant',
            onboarding_context: 'e2e_test',
          },
        })
      );

      const { data: sessions, error: sessionsError } = await this.client
        .from('onboarding.sessions')
        .insert(sessionData)
        .select();

      if (sessionsError) throw sessionsError;
      this.trackCreatedRecords('onboarding.sessions', sessions.map(s => s.id));

      // Create test events
      const eventData = Array.from({ length: 5 }, (_, i) =>
        createEventFactory({
          name: `e2e_test_event_${i}`,
          user_id: leads[i % leads.length].id,
          metadata: {
            test_run_id: this.config.testRunId,
            event_context: 'e2e_test',
          },
        })
      );

      const { data: events, error: eventsError } = await this.client
        .from('analytics.events')
        .insert(eventData)
        .select();

      if (eventsError) throw eventsError;
      this.trackCreatedRecords('analytics.events', events.map(e => e.id));

      // Create test experiments
      const experimentData = [
        createExperimentFactory({
          name: `e2e_test_experiment_${this.config.testRunId}`,
          is_active: true,
          status: 'running',
        }),
      ];

      const { data: experiments, error: experimentsError } = await this.client
        .from('experiments.experiments')
        .insert(experimentData)
        .select();

      if (experimentsError) throw experimentsError;
      this.trackCreatedRecords('experiments.experiments', experiments.map(e => e.id));

      console.log(`✅ Seeded test data: ${leads.length} leads, ${sessions.length} sessions, ${events.length} events, ${experiments.length} experiments`);

      return { leads, sessions, events, experiments };

    } catch (error) {
      console.error('❌ Failed to seed basic test data:', error);
      throw error;
    }
  }

  /**
   * Create a complete onboarding scenario for testing
   */
  async createOnboardingScenario() {
    console.log(`🎬 Creating onboarding scenario for E2E test: ${this.config.testRunId}`);

    const scenario = await createOnboardingScenario(this.client);

    // Track created records for cleanup
    this.trackCreatedRecords('marketing.leads', [scenario.lead.id]);
    this.trackCreatedRecords('onboarding.sessions', [scenario.session.id]);
    this.trackCreatedRecords('onboarding.step_activities', scenario.activities.map(a => a.id));

    return scenario;
  }

  /**
   * Create leads with specific email patterns for form testing
   */
  async createLeadFormTestData(): Promise<{
    newLead: string; // Email for new lead creation
    existingLead: string; // Email that already exists
    invalidLead: string; // Invalid email format
  }> {
    const existingEmail = `existing_${this.config.testRunId}@test.example.com`;

    // Create one existing lead
    const { data, error } = await this.client
      .from('marketing.leads')
      .insert(createLeadFactory({ email: existingEmail }))
      .select()
      .single();

    if (error) throw error;
    this.trackCreatedRecords('marketing.leads', [data.id]);

    return {
      newLead: `new_${this.config.testRunId}@test.example.com`,
      existingLead: existingEmail,
      invalidLead: 'invalid-email-format',
    };
  }

  // ===========================================================================
  // RECORD TRACKING AND CLEANUP
  // ===========================================================================

  /**
   * Track created records for cleanup
   */
  private trackCreatedRecords(table: string, ids: string[]): void {
    const existing = this.createdRecords.get(table) || [];
    this.createdRecords.set(table, [...existing, ...ids]);
  }

  /**
   * Clean up all created test data
   */
  async cleanup(): Promise<void> {
    console.log(`🧹 Cleaning up E2E test data for run: ${this.config.testRunId}`);

    const cleanupOperations = [];

    for (const [table, ids] of this.createdRecords.entries()) {
      if (ids.length === 0) continue;

      console.log(`  Cleaning ${ids.length} records from ${table}`);

      cleanupOperations.push(
        this.client
          .from(table as any)
          .delete()
          .in('id', ids)
      );
    }

    // Also clean up by test run ID pattern matching
    cleanupOperations.push(
      // Clean leads by email pattern
      this.client
        .from('marketing.leads')
        .delete()
        .like('email', `%${this.config.testRunId}%`),

      // Clean sessions by token pattern
      this.client
        .from('onboarding.sessions')
        .delete()
        .like('session_token', `%${this.config.testRunId}%`),

      // Clean events by metadata
      this.client
        .from('analytics.events')
        .delete()
        .like('metadata->test_run_id', `%${this.config.testRunId}%`),

      // Clean experiments by name pattern
      this.client
        .from('experiments.experiments')
        .delete()
        .like('name', `%${this.config.testRunId}%`)
    );

    try {
      const results = await Promise.allSettled(cleanupOperations);
      const successCount = results.filter(r => r.status === 'fulfilled').length;

      console.log(`✅ E2E cleanup completed: ${successCount}/${results.length} operations successful`);

      // Clear tracking
      this.createdRecords.clear();

    } catch (error) {
      console.error('⚠️  E2E cleanup encountered issues:', error);
      // Don't throw - cleanup is best effort
    }
  }

  /**
   * Emergency cleanup - removes all test data by pattern matching
   */
  async emergencyCleanup(): Promise<void> {
    console.log(`🚨 Emergency cleanup for test run: ${this.config.testRunId}`);

    const emergencyOperations = [
      // Clean by email pattern (most reliable for leads)
      this.client
        .from('marketing.leads')
        .delete()
        .like('email', '%@test.example.com'),

      // Clean sessions with test tokens
      this.client
        .from('onboarding.sessions')
        .delete()
        .like('session_token', '%e2e_%'),

      // Clean test events
      this.client
        .from('analytics.events')
        .delete()
        .like('metadata->event_context', '%e2e_test%'),

      // Clean test experiments
      this.client
        .from('experiments.experiments')
        .delete()
        .like('name', '%e2e_test_%'),
    ];

    const results = await Promise.allSettled(emergencyOperations);
    console.log(`🧹 Emergency cleanup completed: ${results.filter(r => r.status === 'fulfilled').length}/${results.length} operations successful`);
  }

  // ===========================================================================
  // DATABASE STATE QUERIES
  // ===========================================================================

  /**
   * Get all test data created in this run
   */
  async getTestDataSummary() {
    const summary: Record<string, number> = {};

    for (const [table, ids] of this.createdRecords.entries()) {
      summary[table] = ids.length;
    }

    return {
      testRunId: this.config.testRunId,
      tablesAffected: Object.keys(summary).length,
      totalRecords: Object.values(summary).reduce((sum, count) => sum + count, 0),
      recordsByTable: summary,
    };
  }

  /**
   * Verify test data exists
   */
  async verifyTestDataExists(): Promise<boolean> {
    try {
      for (const [table, ids] of this.createdRecords.entries()) {
        if (ids.length === 0) continue;

        const { data, error } = await this.client
          .from(table as any)
          .select('id')
          .in('id', ids);

        if (error) throw error;

        if (data.length !== ids.length) {
          console.warn(`⚠️  Expected ${ids.length} records in ${table}, found ${data.length}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Error verifying test data:', error);
      return false;
    }
  }

  // ===========================================================================
  // GETTERS
  // ===========================================================================

  getClient() {
    return this.client;
  }

  getConfig() {
    return this.config;
  }

  getTestRunId() {
    return this.config.testRunId;
  }
}

// =============================================================================
// PLAYWRIGHT FIXTURES INTEGRATION
// =============================================================================

/**
 * Create database manager for Playwright test fixture
 */
export const createE2EDatabaseFixture = (testInfo: { title: string }) => {
  const testRunId = `e2e_${testInfo.title.replace(/\s+/g, '_')}_${Date.now()}`;

  return new E2EDatabaseManager({
    testRunId,
    cleanupOnError: true,
  });
};

/**
 * Global database manager for E2E tests
 */
export const globalE2EDatabase = new E2EDatabaseManager();

// =============================================================================
// UTILITIES FOR PLAYWRIGHT TESTS
// =============================================================================

/**
 * Setup test data before E2E test
 */
export const setupE2ETestData = async (testName: string) => {
  const dbManager = new E2EDatabaseManager({
    testRunId: `e2e_${testName}_${Date.now()}`,
  });

  await dbManager.verifyConnection();
  const testData = await dbManager.seedBasicTestData();

  return { dbManager, testData };
};

/**
 * Cleanup test data after E2E test
 */
export const cleanupE2ETestData = async (dbManager: E2EDatabaseManager) => {
  await dbManager.cleanup();
};

// =============================================================================
// EXPORTS
// =============================================================================

export type { E2ETestConfig };
export { DEFAULT_E2E_CONFIG };