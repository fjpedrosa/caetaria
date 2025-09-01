/**
 * Onboarding Flow Integration Tests
 *
 * Tests the complete onboarding flow with real database operations.
 * Demonstrates integration testing patterns for complex business flows.
 */

import {
  createTestEmail,
  getTestClient,
  verifyDatabaseConnection,
  withTestMetadata
} from '../../../__mocks__/supabase/integration-setup';
import {
  createLeadFactory,
  createOnboardingSessionFactory,
  createStepActivityFactory
} from '../../../__mocks__/test-data/factories';
import {
  logPerformanceReport,
  monitorSupabaseQuery,
  PERFORMANCE_THRESHOLDS,
  performanceMonitor,
  setupPerformanceMonitoring} from '../../../__mocks__/test-utils/performance-monitor';
import { CompleteOnboardingUseCase } from '../../application/use-cases/complete-onboarding';
import { ConfigureBotUseCase } from '../../application/use-cases/configure-bot';
import { ConfigureWhatsAppIntegrationUseCase } from '../../application/use-cases/configure-whatsapp-integration';
// Import the actual use cases we're testing
import { StartOnboardingUseCase } from '../../application/use-cases/start-onboarding';
import { SubmitBusinessInfoUseCase } from '../../application/use-cases/submit-business-info';

// =============================================================================
// INTEGRATION TEST SETUP
// =============================================================================

describe('Onboarding Flow Integration Tests', () => {
  let testClient: ReturnType<typeof getTestClient>;

  // Use case instances
  let startOnboarding: StartOnboardingUseCase;
  let submitBusinessInfo: SubmitBusinessInfoUseCase;
  let configureWhatsApp: ConfigureWhatsAppIntegrationUseCase;
  let configureBot: ConfigureBotUseCase;
  let completeOnboarding: CompleteOnboardingUseCase;

  // Setup performance monitoring
  setupPerformanceMonitoring();

  beforeAll(async () => {
    // Verify database connection before running integration tests
    await verifyDatabaseConnection();
    testClient = getTestClient();

    // Initialize use cases with test client
    startOnboarding = new StartOnboardingUseCase(testClient);
    submitBusinessInfo = new SubmitBusinessInfoUseCase(testClient);
    configureWhatsApp = new ConfigureWhatsAppIntegrationUseCase(testClient);
    configureBot = new ConfigureBotUseCase(testClient);
    completeOnboarding = new CompleteOnboardingUseCase(testClient);
  });

  afterAll(() => {
    // Log performance summary after all tests
    logPerformanceReport('Onboarding Integration Tests');
  });

  // =============================================================================
  // COMPLETE ONBOARDING FLOW TESTS
  // =============================================================================

  describe('Complete Onboarding Flow', () => {
    it('should complete the full onboarding flow successfully', async () => {
      // Step 1: Create a lead (entry point)
      const leadData = createLeadFactory({
        email: createTestEmail('onboarding_flow'),
        first_name: 'Integration',
        last_name: 'Test',
        company_name: 'Test Company Inc',
        source: 'demo-request',
      });

      const { data: lead, error: leadError } = await monitorSupabaseQuery(
        'create_lead',
        testClient.from('marketing.leads').insert(leadData).select().single(),
        PERFORMANCE_THRESHOLDS.INSERT_SINGLE
      );

      expect(leadError).toBeNull();
      expect(lead.id).toBeDefined();

      // Step 2: Start onboarding
      const startResult = await monitorSupabaseQuery(
        'start_onboarding',
        startOnboarding.execute({ leadId: lead.id }),
        PERFORMANCE_THRESHOLDS.INSERT_SINGLE
      );

      expect(startResult.success).toBe(true);
      expect(startResult.data?.session_token).toBeDefined();
      expect(startResult.data?.current_step).toBe('business_info');
      expect(startResult.data?.status).toBe('in_progress');

      const sessionId = startResult.data!.id;
      const sessionToken = startResult.data!.session_token;

      // Step 3: Submit business information
      const businessInfoData = {
        company_name: 'Updated Test Company',
        business_type: 'restaurant',
        employee_count: '10-50',
        monthly_messages_estimate: '1000-5000',
        use_cases: ['customer-support', 'marketing'],
        timezone: 'America/New_York',
      };

      const businessInfoResult = await monitorSupabaseQuery(
        'submit_business_info',
        submitBusinessInfo.execute({
          sessionToken,
          businessInfo: businessInfoData,
        }),
        PERFORMANCE_THRESHOLDS.UPDATE_SINGLE
      );

      expect(businessInfoResult.success).toBe(true);
      expect(businessInfoResult.data?.current_step).toBe('whatsapp_integration');
      expect(businessInfoResult.data?.business_info_completed_at).toBeTruthy();

      // Step 4: Configure WhatsApp integration
      const whatsappConfig = {
        phone_number: '+1234567890',
        business_account_id: 'test_ba_123',
        access_token: 'test_token_encrypted',
        webhook_verify_token: 'test_webhook_token',
        display_name: 'Test Company Support',
      };

      const whatsappResult = await monitorSupabaseQuery(
        'configure_whatsapp',
        configureWhatsApp.execute({
          sessionToken,
          whatsappConfig,
        }),
        PERFORMANCE_THRESHOLDS.UPDATE_SINGLE
      );

      expect(whatsappResult.success).toBe(true);
      expect(whatsappResult.data?.current_step).toBe('bot_setup');
      expect(whatsappResult.data?.whatsapp_integration_completed_at).toBeTruthy();

      // Step 5: Configure bot settings
      const botConfig = {
        bot_name: 'TestBot',
        default_language: 'en',
        greeting_message: 'Hello! How can I help you today?',
        fallback_message: 'I didn\'t understand. Can you please rephrase?',
        business_hours: {
          enabled: true,
          timezone: 'America/New_York',
          schedule: {
            monday: { start: '09:00', end: '17:00' },
            tuesday: { start: '09:00', end: '17:00' },
            wednesday: { start: '09:00', end: '17:00' },
            thursday: { start: '09:00', end: '17:00' },
            friday: { start: '09:00', end: '17:00' },
          },
        },
        auto_responses: [
          {
            trigger: 'pricing',
            response: 'Our pricing starts at $29/month. Would you like to learn more?',
          },
        ],
      };

      const botResult = await monitorSupabaseQuery(
        'configure_bot',
        configureBot.execute({
          sessionToken,
          botConfig,
        }),
        PERFORMANCE_THRESHOLDS.UPDATE_SINGLE
      );

      expect(botResult.success).toBe(true);
      expect(botResult.data?.current_step).toBe('testing');
      expect(botResult.data?.bot_setup_completed_at).toBeTruthy();

      // Step 6: Complete onboarding (simulate successful testing)
      const completeResult = await monitorSupabaseQuery(
        'complete_onboarding',
        completeOnboarding.execute({
          sessionToken,
          testingResults: {
            whatsapp_connection_test: 'passed',
            bot_response_test: 'passed',
            webhook_test: 'passed',
          },
        }),
        PERFORMANCE_THRESHOLDS.UPDATE_SINGLE
      );

      expect(completeResult.success).toBe(true);
      expect(completeResult.data?.status).toBe('completed');
      expect(completeResult.data?.progress_percentage).toBe(100);
      expect(completeResult.data?.testing_completed_at).toBeTruthy();
      expect(completeResult.data?.completed_at).toBeTruthy();

      // Verify final state in database
      const { data: finalSession } = await testClient
        .from('onboarding.sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      expect(finalSession.status).toBe('completed');
      expect(finalSession.progress_percentage).toBe(100);
      expect(finalSession.business_info_completed_at).toBeTruthy();
      expect(finalSession.whatsapp_integration_completed_at).toBeTruthy();
      expect(finalSession.bot_setup_completed_at).toBeTruthy();
      expect(finalSession.testing_completed_at).toBeTruthy();
      expect(finalSession.completed_at).toBeTruthy();

      // Verify step activities were recorded
      const { data: stepActivities } = await testClient
        .from('onboarding.step_activities')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      expect(stepActivities.length).toBeGreaterThan(0);

      // Should have activities for each major step
      const stepTypes = stepActivities.map(a => a.step);
      expect(stepTypes).toContain('business_info');
      expect(stepTypes).toContain('whatsapp_integration');
      expect(stepTypes).toContain('bot_setup');
    });

    it('should handle onboarding abandonment correctly', async () => {
      // Create lead and start onboarding
      const leadData = createLeadFactory({
        email: createTestEmail('abandoned_onboarding'),
      });

      const { data: lead } = await testClient
        .from('marketing.leads')
        .insert(leadData)
        .select()
        .single();

      const startResult = await startOnboarding.execute({ leadId: lead.id });
      expect(startResult.success).toBe(true);

      const sessionToken = startResult.data!.session_token;

      // Submit only business info, then abandon
      await submitBusinessInfo.execute({
        sessionToken,
        businessInfo: {
          company_name: 'Abandoned Company',
          business_type: 'retail',
        },
      });

      // Simulate abandonment by not completing further steps
      // In real system, this would be handled by a background job
      await testClient
        .from('onboarding.sessions')
        .update({
          status: 'abandoned',
          abandoned_at: new Date().toISOString(),
        })
        .eq('session_token', sessionToken);

      // Verify abandonment was recorded
      const { data: abandonedSession } = await testClient
        .from('onboarding.sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .single();

      expect(abandonedSession.status).toBe('abandoned');
      expect(abandonedSession.abandoned_at).toBeTruthy();
      expect(abandonedSession.progress_percentage).toBeLessThan(100);
    });
  });

  // =============================================================================
  // ERROR HANDLING INTEGRATION TESTS
  // =============================================================================

  describe('Error Handling', () => {
    it('should handle invalid session tokens gracefully', async () => {
      const invalidToken = 'invalid_token_123';

      const result = await submitBusinessInfo.execute({
        sessionToken: invalidToken,
        businessInfo: { company_name: 'Test' },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Session not found');
    });

    it('should prevent step skipping', async () => {
      // Create session in business_info step
      const leadData = createLeadFactory({
        email: createTestEmail('step_skipping_test'),
      });

      const { data: lead } = await testClient
        .from('marketing.leads')
        .insert(leadData)
        .select()
        .single();

      const startResult = await startOnboarding.execute({ leadId: lead.id });
      const sessionToken = startResult.data!.session_token;

      // Try to skip to bot setup without completing previous steps
      const skipResult = await configureBot.execute({
        sessionToken,
        botConfig: { bot_name: 'Test Bot' },
      });

      expect(skipResult.success).toBe(false);
      expect(skipResult.error).toContain('business_info step not completed');
    });

    it('should validate required fields for each step', async () => {
      const leadData = createLeadFactory({
        email: createTestEmail('validation_test'),
      });

      const { data: lead } = await testClient
        .from('marketing.leads')
        .insert(leadData)
        .select()
        .single();

      const startResult = await startOnboarding.execute({ leadId: lead.id });
      const sessionToken = startResult.data!.session_token;

      // Try to submit business info with missing required fields
      const invalidResult = await submitBusinessInfo.execute({
        sessionToken,
        businessInfo: {
          // Missing required fields like business_type
        },
      });

      expect(invalidResult.success).toBe(false);
      expect(invalidResult.error).toContain('business_type is required');
    });
  });

  // =============================================================================
  // PERFORMANCE INTEGRATION TESTS
  // =============================================================================

  describe('Performance Integration Tests', () => {
    it('should complete onboarding steps within performance thresholds', async () => {
      const leadData = createLeadFactory({
        email: createTestEmail('performance_test'),
      });

      const { data: lead } = await testClient
        .from('marketing.leads')
        .insert(leadData)
        .select()
        .single();

      // Each step should complete within threshold
      const startMeasurement = await performanceMonitor.measureAsync(
        'start_onboarding_perf',
        () => startOnboarding.execute({ leadId: lead.id })
      );
      expect(startMeasurement).toCompleteWithinThreshold(200);

      const sessionToken = startMeasurement.metadata?.result?.data?.session_token;
      if (!sessionToken) throw new Error('Session token not found');

      const businessInfoMeasurement = await performanceMonitor.measureAsync(
        'submit_business_info_perf',
        () => submitBusinessInfo.execute({
          sessionToken,
          businessInfo: { company_name: 'Perf Test', business_type: 'restaurant' },
        })
      );
      expect(businessInfoMeasurement).toCompleteWithinThreshold(150);
    });

    it('should handle concurrent onboarding sessions', async () => {
      const concurrentCount = 5;
      const operations = Array.from({ length: concurrentCount }, async (_, i) => {
        const leadData = createLeadFactory({
          email: createTestEmail(`concurrent_${i}`),
        });

        const { data: lead } = await testClient
          .from('marketing.leads')
          .insert(leadData)
          .select()
          .single();

        return startOnboarding.execute({ leadId: lead.id });
      });

      const results = await Promise.all(operations);

      // All operations should succeed
      expect(results.every(r => r.success)).toBe(true);

      // All should have unique session tokens
      const tokens = results.map(r => r.data?.session_token);
      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBe(concurrentCount);
    });
  });

  // =============================================================================
  // DATA CONSISTENCY TESTS
  // =============================================================================

  describe('Data Consistency', () => {
    it('should maintain referential integrity', async () => {
      // Create onboarding session
      const leadData = createLeadFactory({
        email: createTestEmail('referential_integrity'),
      });

      const { data: lead } = await testClient
        .from('marketing.leads')
        .insert(leadData)
        .select()
        .single();

      const startResult = await startOnboarding.execute({ leadId: lead.id });
      const sessionId = startResult.data!.id;

      // Add step activities
      const activityData = createStepActivityFactory(sessionId, {
        step: 'business_info',
        activity_type: 'form_started',
      });

      await testClient
        .from('onboarding.step_activities')
        .insert(activityData);

      // Verify relationships are maintained
      const { data: sessionWithActivities } = await testClient
        .from('onboarding.sessions')
        .select(`
          *,
          step_activities:onboarding.step_activities(*),
          lead:marketing.leads(*)
        `)
        .eq('id', sessionId)
        .single();

      expect(sessionWithActivities.lead).toBeTruthy();
      expect(sessionWithActivities.step_activities.length).toBeGreaterThan(0);
      expect(sessionWithActivities.step_activities[0].session_id).toBe(sessionId);
    });

    it('should handle database triggers correctly', async () => {
      // Create session and test that triggers update progress correctly
      const leadData = createLeadFactory({
        email: createTestEmail('triggers_test'),
      });

      const { data: lead } = await testClient
        .from('marketing.leads')
        .insert(leadData)
        .select()
        .single();

      const startResult = await startOnboarding.execute({ leadId: lead.id });
      const sessionToken = startResult.data!.session_token;

      // Complete business info step
      await submitBusinessInfo.execute({
        sessionToken,
        businessInfo: { company_name: 'Triggers Test', business_type: 'healthcare' },
      });

      // Verify progress was updated by trigger
      const { data: updatedSession } = await testClient
        .from('onboarding.sessions')
        .select('progress_percentage, status')
        .eq('session_token', sessionToken)
        .single();

      expect(updatedSession.progress_percentage).toBe(25); // 1/4 steps completed
      expect(updatedSession.status).toBe('in_progress');
    });
  });
});