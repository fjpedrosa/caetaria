/**
 * Test Data Factories
 *
 * Provides factory functions to generate consistent test data
 * for all database entities with realistic values.
 */

import { Database } from '../../lib/supabase/types';
import { createTestEmail, createTestPhone } from '../supabase/integration-setup';

// =============================================================================
// TYPE ALIASES FOR CONVENIENCE
// =============================================================================

type Lead = Database['marketing']['Tables']['leads']['Row'];
type LeadInsert = Database['marketing']['Tables']['leads']['Insert'];
type LeadInteraction = Database['marketing']['Tables']['lead_interactions']['Row'];
type OnboardingSession = Database['onboarding']['Tables']['sessions']['Row'];
type OnboardingSessionInsert = Database['onboarding']['Tables']['sessions']['Insert'];
type StepActivity = Database['onboarding']['Tables']['step_activities']['Row'];
type Event = Database['analytics']['Tables']['events']['Row'];
type EventInsert = Database['analytics']['Tables']['events']['Insert'];
type Experiment = Database['experiments']['Tables']['experiments']['Row'];

// =============================================================================
// MARKETING FACTORIES
// =============================================================================

/**
 * Generate a test lead with realistic data
 */
export const createLeadFactory = (overrides: Partial<LeadInsert> = {}): LeadInsert => {
  const companies = ['Acme Corp', 'TechStart', 'Innovation Inc', 'Digital Solutions', 'Growth Co'];
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Anna'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];

  const randomCompany = companies[Math.floor(Math.random() * companies.length)];
  const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];

  return {
    email: createTestEmail(`${randomFirstName.toLowerCase()}_${randomLastName.toLowerCase()}`),
    phone_number: createTestPhone(),
    company_name: randomCompany,
    first_name: randomFirstName,
    last_name: randomLastName,
    source: 'website-form',
    status: 'new',
    interested_features: ['whatsapp-automation', 'analytics'],
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'whatsapp-landing',
    referrer: 'https://google.com',
    landing_page: '/landing',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    country_code: 'US',
    region: 'California',
    city: 'San Francisco',
    ...overrides,
  };
};

/**
 * Generate a test lead interaction
 */
export const createLeadInteractionFactory = (
  leadId: string,
  overrides: Partial<Omit<Database['marketing']['Tables']['lead_interactions']['Insert'], 'lead_id'>> = {}
) => {
  const interactionTypes = ['email_sent', 'demo_scheduled', 'call_made', 'follow_up', 'meeting_booked'];
  const outcomes = ['positive', 'negative', 'neutral', 'no_response'];

  const randomType = interactionTypes[Math.floor(Math.random() * interactionTypes.length)];
  const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];

  return {
    lead_id: leadId,
    interaction_type: randomType,
    subject: `Test ${randomType} interaction`,
    description: `Automated test interaction of type ${randomType}`,
    outcome: randomOutcome,
    created_by: 'test_user',
    metadata: {
      test_run_id: process.env.CURRENT_TEST_RUN_ID || 'test',
      interaction_context: 'unit_test',
    },
    ...overrides,
  };
};

// =============================================================================
// ONBOARDING FACTORIES
// =============================================================================

/**
 * Generate a test onboarding session
 */
export const createOnboardingSessionFactory = (
  overrides: Partial<OnboardingSessionInsert> = {}
): OnboardingSessionInsert => {
  const generateSessionToken = () =>
    `sess_test_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;

  const businessTypes = ['restaurant', 'retail', 'healthcare', 'education', 'consulting'];
  const randomBusinessType = businessTypes[Math.floor(Math.random() * businessTypes.length)];

  return {
    session_token: generateSessionToken(),
    current_step: 'business_info',
    status: 'not_started',
    progress_percentage: 0,
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    business_data: {
      test_run_id: process.env.CURRENT_TEST_RUN_ID || 'test',
      business_type: randomBusinessType,
      employees_count: '1-10',
      monthly_messages: '100-500',
    },
    whatsapp_config: {},
    bot_config: {},
    ...overrides,
  };
};

/**
 * Generate a test step activity
 */
export const createStepActivityFactory = (
  sessionId: string,
  overrides: Partial<Omit<Database['onboarding']['Tables']['step_activities']['Insert'], 'session_id'>> = {}
) => {
  const activities = ['form_started', 'field_filled', 'validation_error', 'step_completed'];
  const fields = ['company_name', 'business_type', 'phone_number', 'employee_count'];

  const randomActivity = activities[Math.floor(Math.random() * activities.length)];
  const randomField = fields[Math.floor(Math.random() * fields.length)];

  return {
    session_id: sessionId,
    step: 'business_info',
    activity_type: randomActivity,
    field_name: randomField,
    field_value: 'test_value',
    time_spent_seconds: Math.floor(Math.random() * 300) + 10, // 10-310 seconds
    metadata: {
      test_run_id: process.env.CURRENT_TEST_RUN_ID || 'test',
      browser: 'Chrome',
      device_type: 'desktop',
    },
    ...overrides,
  };
};

// =============================================================================
// ANALYTICS FACTORIES
// =============================================================================

/**
 * Generate a test analytics event
 */
export const createEventFactory = (overrides: Partial<EventInsert> = {}): EventInsert => {
  const eventTypes = ['page_view', 'user_action', 'conversion', 'system'];
  const eventNames = [
    'landing_page_view', 'cta_click', 'form_submit', 'demo_request',
    'pricing_view', 'feature_click', 'testimonial_view', 'faq_expand'
  ];

  const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)] as any;
  const randomName = eventNames[Math.floor(Math.random() * eventNames.length)];

  return {
    type: randomType,
    name: randomName,
    properties: {
      page_url: '/landing',
      section: 'hero',
      element: 'cta_button',
      test_context: true,
    },
    metadata: {
      test_run_id: process.env.CURRENT_TEST_RUN_ID || 'test',
      test_environment: true,
    },
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    referrer: 'https://google.com',
    url: '/landing',
    device_type: 'desktop',
    browser: 'Chrome',
    os: 'Windows',
    country: 'United States',
    region: 'California',
    ...overrides,
  };
};

/**
 * Generate a test metric
 */
export const createMetricFactory = (
  overrides: Partial<Database['analytics']['Tables']['metrics']['Insert']> = {}
) => {
  const metricNames = ['conversion_rate', 'page_views', 'bounce_rate', 'session_duration'];
  const metricTypes = ['counter', 'gauge', 'histogram', 'rate'];

  const randomName = metricNames[Math.floor(Math.random() * metricNames.length)];
  const randomType = metricTypes[Math.floor(Math.random() * metricTypes.length)] as any;

  return {
    name: randomName,
    description: `Test metric: ${randomName}`,
    type: randomType,
    value_numeric: Math.random() * 100,
    dimensions: {
      page: 'landing',
      test_run_id: process.env.CURRENT_TEST_RUN_ID || 'test',
    },
    tags: ['test', 'automated'],
    source: 'test_suite',
    aggregation: 'average',
    sample_count: Math.floor(Math.random() * 1000) + 1,
    ...overrides,
  };
};

// =============================================================================
// EXPERIMENT FACTORIES
// =============================================================================

/**
 * Generate a test experiment
 */
export const createExperimentFactory = (
  overrides: Partial<Database['experiments']['Tables']['experiments']['Insert']> = {}
) => {
  const experimentNames = [
    'hero_cta_test', 'pricing_layout_test', 'testimonial_position_test',
    'form_fields_test', 'color_scheme_test'
  ];

  const randomName = experimentNames[Math.floor(Math.random() * experimentNames.length)];

  return {
    name: `test_${randomName}_${Date.now()}`,
    description: `Test experiment: ${randomName}`,
    hypothesis: 'This change will improve conversion rates',
    is_active: false, // Start inactive for safety
    traffic_percentage: 50,
    control_variant: {
      name: 'control',
      description: 'Original version',
      config: { color: 'blue', text: 'Get Started' },
    },
    test_variants: [
      {
        name: 'variant_a',
        description: 'Test variant A',
        config: { color: 'green', text: 'Start Free Trial' },
      },
    ],
    targeting_rules: {
      countries: ['US', 'CA'],
      device_types: ['desktop', 'mobile'],
    },
    status: 'draft',
    results: {},
    created_by: 'test_user',
    ...overrides,
  };
};

/**
 * Generate a test experiment assignment
 */
export const createExperimentAssignmentFactory = (
  experimentId: string,
  overrides: Partial<Omit<Database['experiments']['Tables']['assignments']['Insert'], 'experiment_id'>> = {}
) => {
  const variants = ['control', 'variant_a', 'variant_b'];
  const randomVariant = variants[Math.floor(Math.random() * variants.length)];

  return {
    experiment_id: experimentId,
    session_id: process.env.CURRENT_TEST_RUN_ID || `test_session_${Date.now()}`,
    variant_id: randomVariant,
    exposure_count: Math.floor(Math.random() * 10) + 1,
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    country: 'United States',
    ...overrides,
  };
};

// =============================================================================
// BATCH FACTORY UTILITIES
// =============================================================================

/**
 * Create multiple leads at once
 */
export const createLeadBatch = (count: number, baseOverrides: Partial<LeadInsert> = []) => {
  return Array.from({ length: count }, (_, index) =>
    createLeadFactory({
      ...baseOverrides,
      email: createTestEmail(`batch_lead_${index}`),
    })
  );
};

/**
 * Create multiple events at once
 */
export const createEventBatch = (count: number, baseOverrides: Partial<EventInsert> = []) => {
  return Array.from({ length: count }, (_, index) =>
    createEventFactory({
      ...baseOverrides,
      name: `batch_event_${index}`,
    })
  );
};

// =============================================================================
// REALISTIC DATA SCENARIOS
// =============================================================================

/**
 * Create a complete onboarding scenario with related data
 */
export const createOnboardingScenario = async (client: any) => {
  // Create lead
  const leadData = createLeadFactory();
  const { data: lead, error: leadError } = await client
    .from('marketing.leads')
    .insert(leadData)
    .select()
    .single();

  if (leadError) throw leadError;

  // Create onboarding session
  const sessionData = createOnboardingSessionFactory({ lead_id: lead.id });
  const { data: session, error: sessionError } = await client
    .from('onboarding.sessions')
    .insert(sessionData)
    .select()
    .single();

  if (sessionError) throw sessionError;

  // Create step activities
  const activities = [
    createStepActivityFactory(session.id, { step: 'business_info', activity_type: 'form_started' }),
    createStepActivityFactory(session.id, { step: 'business_info', activity_type: 'field_filled' }),
    createStepActivityFactory(session.id, { step: 'business_info', activity_type: 'step_completed' }),
  ];

  const { data: stepActivities, error: activitiesError } = await client
    .from('onboarding.step_activities')
    .insert(activities)
    .select();

  if (activitiesError) throw activitiesError;

  return {
    lead,
    session,
    activities: stepActivities,
  };
};

// =============================================================================
// EXPORTS
// =============================================================================

export type {
  Event,
  EventInsert,
  Experiment,
  Lead,
  LeadInsert,
  LeadInteraction,
  OnboardingSession,
  OnboardingSessionInsert,
  StepActivity,
};