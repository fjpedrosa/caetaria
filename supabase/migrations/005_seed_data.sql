-- =============================================================================
-- SEED DATA FOR DEVELOPMENT AND TESTING
-- =============================================================================
--
-- This migration provides comprehensive seed data for development and testing
-- environments. It includes realistic sample data across all schemas while
-- maintaining referential integrity and business logic consistency.
--
-- IMPORTANT: This seed data should NOT be run in production environments.
-- Use conditional logic or separate migration files for production.
-- =============================================================================

-- Check if we should seed data (only in development/test environments)
DO $$
BEGIN
  -- Only run if explicitly enabled or in development
  IF current_setting('app.environment', true) IN ('development', 'test', 'local') 
     OR current_setting('app.seed_data', true) = 'true' THEN

    -- =============================================================================
    -- MARKETING SCHEMA SEED DATA
    -- =============================================================================
    
    -- Insert sample leads with realistic data
    INSERT INTO marketing.leads (
      id, email, phone_number, company_name, first_name, last_name, 
      source, status, notes, interested_features,
      utm_source, utm_medium, utm_campaign, utm_content,
      referrer, landing_page, user_agent, ip_address,
      country_code, region, city, created_at, updated_at
    ) VALUES 
    -- High-value enterprise leads
    (
      '550e8400-e29b-41d4-a716-446655440001'::UUID,
      'sarah.johnson@techcorp.com', '+1-555-0123', 'TechCorp Solutions', 
      'Sarah', 'Johnson', 'demo-request', 'qualified',
      'Interested in enterprise WhatsApp automation for customer support. 500+ employees.',
      ARRAY['automated-responses', 'integration-api', 'analytics-dashboard', 'multi-agent'],
      'google', 'cpc', 'enterprise-whatsapp-2024', 'demo-cta',
      'https://google.com', 'https://example.com/demo',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 
      '192.168.1.100'::INET, 'US', 'California', 'San Francisco',
      NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days'
    ),
    (
      '550e8400-e29b-41d4-a716-446655440002'::UUID,
      'marcus.rodriguez@retailplus.co.uk', '+44-20-7946-0958', 'RetailPlus Ltd',
      'Marcus', 'Rodriguez', 'pricing-inquiry', 'contacted',
      'UK retail chain looking to automate order confirmations and delivery updates.',
      ARRAY['automated-responses', 'template-management', 'multi-language'],
      'bing', 'cpc', 'uk-retail-automation', 'pricing-page',
      'https://bing.com', 'https://example.com/pricing',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      '81.2.69.142'::INET, 'GB', 'England', 'London',
      NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day'
    ),
    
    -- Mid-market prospects
    (
      '550e8400-e29b-41d4-a716-446655440003'::UUID,
      'ahmed.hassan@medclinic.ae', '+971-4-123-4567', 'Dubai Medical Clinic',
      'Ahmed', 'Hassan', 'contact-form', 'new',
      'Healthcare provider interested in appointment reminders and patient communications.',
      ARRAY['automated-responses', 'scheduling-integration', 'gdpr-compliance'],
      'facebook', 'social', 'healthcare-automation', 'contact-form',
      'https://facebook.com', 'https://example.com/contact',
      'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15',
      '185.3.94.25'::INET, 'AE', 'Dubai', 'Dubai',
      NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
    ),
    (
      '550e8400-e29b-41d4-a716-446655440004'::UUID,
      'priya.patel@startupxyz.in', '+91-98765-43210', 'StartupXYZ',
      'Priya', 'Patel', 'website-form', 'new',
      'Early-stage startup exploring WhatsApp for customer engagement.',
      ARRAY['automated-responses', 'chatbot-builder'],
      'organic', 'search', '', '',
      '', 'https://example.com/',
      'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36',
      '117.194.123.45'::INET, 'IN', 'Maharashtra', 'Mumbai',
      NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
    ),
    
    -- Newsletter subscribers and low-intent leads
    (
      '550e8400-e29b-41d4-a716-446655440005'::UUID,
      'jean.dubois@example.fr', NULL, NULL, 'Jean', 'Dubois', 
      'newsletter-signup', 'new', 'Subscribed to newsletter after reading blog post about WhatsApp Business API.',
      ARRAY[]::TEXT[],
      'twitter', 'social', 'blog-post-promotion', 'newsletter-signup',
      'https://twitter.com', 'https://example.com/blog/whatsapp-automation',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101',
      '82.64.23.19'::INET, 'FR', 'Île-de-France', 'Paris',
      NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'
    ),
    (
      '550e8400-e29b-41d4-a716-446655440006'::UUID,
      'carlos.silva@negocio.br', '+55-11-99999-8888', 'Negócio Digital',
      'Carlos', 'Silva', 'demo-request', 'converted',
      'Successfully converted to paid customer after demo. Now using enterprise plan.',
      ARRAY['automated-responses', 'integration-api', 'analytics-dashboard'],
      'google', 'cpc', 'latam-expansion-2024', 'demo-cta',
      'https://google.com.br', 'https://example.com/demo',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      '177.43.212.87'::INET, 'BR', 'São Paulo', 'São Paulo',
      NOW() - INTERVAL '15 days', NOW() - INTERVAL '1 day'
    );

    -- Insert lead interactions
    INSERT INTO marketing.lead_interactions (
      lead_id, interaction_type, subject, description, outcome,
      scheduled_at, completed_at, created_by, metadata
    ) VALUES
    (
      '550e8400-e29b-41d4-a716-446655440001'::UUID,
      'demo_scheduled', 'Enterprise WhatsApp Demo - TechCorp',
      'Scheduled product demonstration focusing on enterprise features and API integration capabilities.',
      'positive', 
      NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days',
      'sales@example.com',
      '{"demo_duration_minutes": 45, "attendees": 3, "follow_up_required": true}'::JSONB
    ),
    (
      '550e8400-e29b-41d4-a716-446655440001'::UUID,
      'email_sent', 'Follow-up: Enterprise Demo Discussion',
      'Sent follow-up email with pricing proposal and implementation timeline.',
      'positive',
      NULL, NOW() - INTERVAL '2 days',
      'sales@example.com',
      '{"email_template": "enterprise_followup", "proposal_sent": true}'::JSONB
    ),
    (
      '550e8400-e29b-41d4-a716-446655440002'::UUID,
      'call_made', 'Pricing Discussion - RetailPlus',
      'Discussed pricing options and implementation requirements for UK retail operations.',
      'neutral',
      NULL, NOW() - INTERVAL '1 day',
      'sales@example.com',
      '{"call_duration_minutes": 25, "concerns": ["integration_complexity", "data_privacy"]}'::JSONB
    ),
    (
      '550e8400-e29b-41d4-a716-446655440006'::UUID,
      'contract_signed', 'Enterprise Contract - Negócio Digital',
      'Successfully closed enterprise deal. Customer signed 12-month contract.',
      'positive',
      NULL, NOW() - INTERVAL '1 day',
      'sales@example.com',
      '{"contract_value": 24000, "contract_months": 12, "plan": "enterprise"}'::JSONB
    );

    -- =============================================================================
    -- ONBOARDING SCHEMA SEED DATA  
    -- =============================================================================
    
    -- Insert onboarding sessions
    INSERT INTO onboarding.sessions (
      id, lead_id, session_token, current_step, status, progress_percentage,
      business_info_completed_at, whatsapp_integration_completed_at, 
      bot_setup_completed_at, testing_completed_at, completed_at,
      started_at, last_activity_at, user_agent, ip_address,
      business_data, whatsapp_config, bot_config
    ) VALUES
    -- Completed onboarding
    (
      '650e8400-e29b-41d4-a716-446655440001'::UUID,
      '550e8400-e29b-41d4-a716-446655440006'::UUID,
      'sess_completed_carlos_silva_12345',
      'complete', 'completed', 100,
      NOW() - INTERVAL '14 days', NOW() - INTERVAL '13 days',
      NOW() - INTERVAL '12 days', NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days',
      NOW() - INTERVAL '15 days', NOW() - INTERVAL '11 days',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      '177.43.212.87'::INET,
      '{"email": "carlos.silva@negocio.br", "company": "Negócio Digital", "industry": "E-commerce", "employees": "10-50", "use_case": "Customer support automation"}'::JSONB,
      '{"business_account_id": "123456789", "phone_number": "+5511999998888", "verified": true}'::JSONB,
      '{"bot_name": "Atendimento Negócio", "greeting_message": "Olá! Como posso ajudar você hoje?", "business_hours": "09:00-18:00", "timezone": "America/Sao_Paulo"}'::JSONB
    ),
    
    -- In progress - bot setup step
    (
      '650e8400-e29b-41d4-a716-446655440002'::UUID,
      '550e8400-e29b-41d4-a716-446655440001'::UUID,
      'sess_inprogress_sarah_johnson_67890',
      'bot_setup', 'in_progress', 75,
      NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days',
      NULL, NULL, NULL,
      NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 hour',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      '192.168.1.100'::INET,
      '{"email": "sarah.johnson@techcorp.com", "company": "TechCorp Solutions", "industry": "Technology", "employees": "500+", "use_case": "Enterprise customer support"}'::JSONB,
      '{"business_account_id": "987654321", "phone_number": "+15550123", "verified": true}'::JSONB,
      '{"bot_name": "TechCorp Support", "greeting_message": "Hello! Welcome to TechCorp. How can I assist you today?"}'::JSONB
    ),
    
    -- Just started - business info step
    (
      '650e8400-e29b-41d4-a716-446655440003'::UUID,
      '550e8400-e29b-41d4-a716-446655440004'::UUID,
      'sess_started_priya_patel_54321',
      'business_info', 'in_progress', 0,
      NULL, NULL, NULL, NULL, NULL,
      NOW() - INTERVAL '2 hours', NOW() - INTERVAL '30 minutes',
      'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36',
      '117.194.123.45'::INET,
      '{}'::JSONB, '{}'::JSONB, '{}'::JSONB
    ),
    
    -- Abandoned session
    (
      '650e8400-e29b-41d4-a716-446655440004'::UUID,
      NULL,
      'sess_abandoned_anonymous_99999',
      'whatsapp_integration', 'abandoned', 25,
      NOW() - INTERVAL '7 days', NULL, NULL, NULL, NULL,
      NOW() - INTERVAL '8 days', NOW() - INTERVAL '6 days',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      '203.0.113.45'::INET,
      '{"email": "test@abandoned.com", "company": "Test Company"}'::JSONB,
      '{}'::JSONB, '{}'::JSONB
    );

    -- Insert step activities
    INSERT INTO onboarding.step_activities (
      session_id, step, activity_type, field_name, field_value,
      error_message, time_spent_seconds, metadata
    ) VALUES
    -- Carlos Silva's completed journey
    ('650e8400-e29b-41d4-a716-446655440001'::UUID, 'business_info', 'form_started', NULL, NULL, NULL, NULL, '{"page_load_time_ms": 1200}'::JSONB),
    ('650e8400-e29b-41d4-a716-446655440001'::UUID, 'business_info', 'field_filled', 'company_name', 'Negócio Digital', NULL, NULL, '{}'::JSONB),
    ('650e8400-e29b-41d4-a716-446655440001'::UUID, 'business_info', 'field_filled', 'industry', 'E-commerce', NULL, NULL, '{}'::JSONB),
    ('650e8400-e29b-41d4-a716-446655440001'::UUID, 'business_info', 'step_completed', NULL, NULL, NULL, 450, '{"form_completion_rate": 1.0}'::JSONB),
    
    ('650e8400-e29b-41d4-a716-446655440001'::UUID, 'whatsapp_integration', 'form_started', NULL, NULL, NULL, NULL, '{}'::JSONB),
    ('650e8400-e29b-41d4-a716-446655440001'::UUID, 'whatsapp_integration', 'field_filled', 'phone_number', '+5511999998888', NULL, NULL, '{}'::JSONB),
    ('650e8400-e29b-41d4-a716-446655440001'::UUID, 'whatsapp_integration', 'validation_success', 'phone_verification', 'true', NULL, NULL, '{"verification_method": "sms"}'::JSONB),
    ('650e8400-e29b-41d4-a716-446655440001'::UUID, 'whatsapp_integration', 'step_completed', NULL, NULL, NULL, 320, '{}'::JSONB),
    
    -- Sarah Johnson's ongoing journey
    ('650e8400-e29b-41d4-a716-446655440002'::UUID, 'business_info', 'form_started', NULL, NULL, NULL, NULL, '{"referrer": "demo-request"}'::JSONB),
    ('650e8400-e29b-41d4-a716-446655440002'::UUID, 'business_info', 'field_filled', 'company_name', 'TechCorp Solutions', NULL, NULL, '{}'::JSONB),
    ('650e8400-e29b-41d4-a716-446655440002'::UUID, 'business_info', 'field_filled', 'employees', '500+', NULL, NULL, '{}'::JSONB),
    ('650e8400-e29b-41d4-a716-446655440002'::UUID, 'business_info', 'step_completed', NULL, NULL, NULL, 280, '{}'::JSONB),
    
    ('650e8400-e29b-41d4-a716-446655440002'::UUID, 'whatsapp_integration', 'form_started', NULL, NULL, NULL, NULL, '{}'::JSONB),
    ('650e8400-e29b-41d4-a716-446655440002'::UUID, 'whatsapp_integration', 'field_filled', 'business_account_id', '987654321', NULL, NULL, '{}'::JSONB),
    ('650e8400-e29b-41d4-a716-446655440002'::UUID, 'whatsapp_integration', 'step_completed', NULL, NULL, NULL, 420, '{}'::JSONB),
    
    ('650e8400-e29b-41d4-a716-446655440002'::UUID, 'bot_setup', 'form_started', NULL, NULL, NULL, NULL, '{}'::JSONB),
    ('650e8400-e29b-41d4-a716-446655440002'::UUID, 'bot_setup', 'field_filled', 'bot_name', 'TechCorp Support', NULL, NULL, '{}'::JSONB),
    
    -- Priya's recent start
    ('650e8400-e29b-41d4-a716-446655440003'::UUID, 'business_info', 'form_started', NULL, NULL, NULL, NULL, '{"utm_source": "organic"}'::JSONB),
    ('650e8400-e29b-41d4-a716-446655440003'::UUID, 'business_info', 'field_filled', 'company_name', 'StartupXYZ', NULL, NULL, '{}'::JSONB),
    
    -- Abandoned session activities
    ('650e8400-e29b-41d4-a716-446655440004'::UUID, 'business_info', 'form_started', NULL, NULL, NULL, NULL, '{}'::JSONB),
    ('650e8400-e29b-41d4-a716-446655440004'::UUID, 'business_info', 'field_filled', 'email', 'test@abandoned.com', NULL, NULL, '{}'::JSONB),
    ('650e8400-e29b-41d4-a716-446655440004'::UUID, 'business_info', 'step_completed', NULL, NULL, NULL, 180, '{}'::JSONB),
    ('650e8400-e29b-41d4-a716-446655440004'::UUID, 'whatsapp_integration', 'form_started', NULL, NULL, NULL, NULL, '{}'::JSONB),
    ('650e8400-e29b-41d4-a716-446655440004'::UUID, 'whatsapp_integration', 'validation_error', 'phone_number', '+1234', 'Invalid phone number format', NULL, '{"error_code": "INVALID_PHONE"}'::JSONB);

    -- =============================================================================
    -- ANALYTICS SCHEMA SEED DATA
    -- =============================================================================
    
    -- Insert analytics events (spanning last 30 days)
    INSERT INTO analytics.events (
      id, type, name, user_id, session_id, properties, metadata,
      user_agent, ip_address, referrer, url, device_type, browser, os,
      country, region, processed, processed_at, created_at
    ) 
    SELECT 
      uuid_generate_v4(),
      (ARRAY['page_view', 'user_action', 'conversion', 'system'])[floor(random() * 4 + 1)],
      (CASE 
        WHEN random() < 0.3 THEN 'page_view'
        WHEN random() < 0.5 THEN 'button_click'
        WHEN random() < 0.7 THEN 'form_submit'
        WHEN random() < 0.8 THEN 'demo_request'
        WHEN random() < 0.9 THEN 'pricing_view'
        ELSE 'conversion'
      END),
      (CASE WHEN random() < 0.6 THEN 
        (ARRAY[
          '550e8400-e29b-41d4-a716-446655440001',
          '550e8400-e29b-41d4-a716-446655440002',
          '550e8400-e29b-41d4-a716-446655440003',
          '550e8400-e29b-41d4-a716-446655440004',
          '550e8400-e29b-41d4-a716-446655440005',
          '550e8400-e29b-41d4-a716-446655440006'
        ])[floor(random() * 6 + 1)]::UUID
      ELSE NULL END),
      ('session_' || floor(random() * 1000 + 1)::text),
      jsonb_build_object(
        'page', (ARRAY['/demo', '/pricing', '/contact', '/features', '/'])[floor(random() * 5 + 1)],
        'section', (ARRAY['hero', 'features', 'pricing', 'testimonials', 'faq'])[floor(random() * 5 + 1)],
        'engagement_time_seconds', floor(random() * 300 + 10),
        'scroll_percentage', floor(random() * 100 + 1)
      ),
      jsonb_build_object(
        'user_agent_parsed', jsonb_build_object(
          'browser_family', (ARRAY['Chrome', 'Firefox', 'Safari', 'Edge'])[floor(random() * 4 + 1)],
          'os_family', (ARRAY['Windows', 'macOS', 'Linux', 'iOS', 'Android'])[floor(random() * 5 + 1)]
        )
      ),
      (ARRAY[
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36'
      ])[floor(random() * 3 + 1)],
      ('192.168.' || floor(random() * 255 + 1)::text || '.' || floor(random() * 255 + 1)::text)::INET,
      (CASE WHEN random() < 0.7 THEN 
        (ARRAY['https://google.com', 'https://facebook.com', 'https://twitter.com', ''])[floor(random() * 4 + 1)]
      ELSE NULL END),
      ('https://example.com' || (ARRAY['/', '/demo', '/pricing', '/contact', '/features'])[floor(random() * 5 + 1)]),
      (ARRAY['desktop', 'mobile', 'tablet'])[floor(random() * 3 + 1)],
      (ARRAY['Chrome', 'Firefox', 'Safari', 'Edge'])[floor(random() * 4 + 1)],
      (ARRAY['Windows', 'macOS', 'Linux', 'iOS', 'Android'])[floor(random() * 5 + 1)],
      (ARRAY['US', 'GB', 'BR', 'IN', 'FR', 'DE', 'AE'])[floor(random() * 7 + 1)],
      (ARRAY['California', 'London', 'São Paulo', 'Mumbai', 'Paris', 'Berlin', 'Dubai'])[floor(random() * 7 + 1)],
      (random() < 0.8), -- 80% processed
      CASE WHEN random() < 0.8 THEN NOW() - INTERVAL '1 hour' ELSE NULL END,
      NOW() - (random() * 30)::int * INTERVAL '1 day' - (random() * 24)::int * INTERVAL '1 hour'
    FROM generate_series(1, 2500); -- Generate 2500 sample events

    -- Insert sample metrics
    INSERT INTO analytics.metrics (
      id, name, description, type, value_numeric, dimensions, tags,
      timestamp, source, aggregation, sample_count
    ) VALUES
    (uuid_generate_v4(), 'lead_conversion_rate', 'Percentage of leads that convert to customers', 'gauge', 12.5, '{"period": "daily"}'::JSONB, ARRAY['conversion', 'marketing'], NOW() - INTERVAL '1 day', 'marketing_dashboard', 'average', 100),
    (uuid_generate_v4(), 'page_views_total', 'Total page views', 'counter', 15420, '{"page": "/demo"}'::JSONB, ARRAY['traffic', 'engagement'], NOW() - INTERVAL '1 day', 'analytics_engine', 'sum', 1542),
    (uuid_generate_v4(), 'demo_requests_daily', 'Daily demo requests', 'counter', 23, '{"source": "organic"}'::JSONB, ARRAY['conversion', 'demo'], NOW() - INTERVAL '1 day', 'lead_tracking', 'count', 23),
    (uuid_generate_v4(), 'onboarding_completion_rate', 'Percentage of users completing onboarding', 'gauge', 68.2, '{"period": "weekly"}'::JSONB, ARRAY['onboarding', 'ux'], NOW() - INTERVAL '1 day', 'onboarding_tracker', 'average', 150),
    (uuid_generate_v4(), 'avg_session_duration', 'Average session duration in seconds', 'gauge', 245.5, '{"device_type": "desktop"}'::JSONB, ARRAY['engagement', 'ux'], NOW() - INTERVAL '1 day', 'analytics_engine', 'average', 890);

    -- Insert event aggregations (pre-calculated for performance)
    INSERT INTO analytics.event_aggregations (
      event_type, event_name, time_bucket, granularity,
      event_count, unique_users, unique_sessions, dimensions
    ) 
    SELECT 
      'page_view'::event_type_category,
      'page_view',
      date_trunc('hour', NOW() - (generate_series * INTERVAL '1 hour')),
      'hour'::time_granularity_enum,
      floor(random() * 100 + 20)::INTEGER, -- 20-120 events per hour
      floor(random() * 50 + 10)::INTEGER,  -- 10-60 unique users
      floor(random() * 70 + 15)::INTEGER,  -- 15-85 unique sessions
      '{}'::JSONB
    FROM generate_series(0, 167) -- Last 7 days (168 hours)
    UNION ALL
    SELECT 
      'user_action'::event_type_category,
      'button_click',
      date_trunc('hour', NOW() - (generate_series * INTERVAL '1 hour')),
      'hour'::time_granularity_enum,
      floor(random() * 50 + 5)::INTEGER,
      floor(random() * 30 + 5)::INTEGER,
      floor(random() * 40 + 8)::INTEGER,
      '{"button": "demo_request"}'::JSONB
    FROM generate_series(0, 167);

    -- =============================================================================
    -- EXPERIMENTS SCHEMA SEED DATA
    -- =============================================================================
    
    -- Insert A/B test experiments
    INSERT INTO experiments.experiments (
      id, name, description, hypothesis, is_active, traffic_percentage,
      control_variant, test_variants, targeting_rules,
      start_date, end_date, status, created_by
    ) VALUES
    (
      '750e8400-e29b-41d4-a716-446655440001'::UUID,
      'hero_cta_text_test',
      'Testing different call-to-action text in hero section',
      'More specific CTA text will increase demo request conversion rate',
      true, 100,
      '{"id": "control", "name": "Get Started Free", "description": "Original CTA text"}'::JSONB,
      ARRAY[
        '{"id": "variant_a", "name": "Start Your Free Demo", "description": "More specific demo-focused text"}'::JSONB,
        '{"id": "variant_b", "name": "Book Free WhatsApp Demo", "description": "Very specific WhatsApp-focused text"}'::JSONB
      ],
      '{"targeting": {"new_visitors_only": true}}'::JSONB,
      NOW() - INTERVAL '10 days',
      NOW() + INTERVAL '20 days',
      'running',
      'admin@example.com'
    ),
    (
      '750e8400-e29b-41d4-a716-446655440002'::UUID,
      'pricing_display_test',
      'Testing simplified vs detailed pricing display',
      'Simplified pricing will reduce cognitive load and increase conversions',
      true, 50,
      '{"id": "control", "name": "Detailed Pricing", "description": "Shows all features and pricing details"}'::JSONB,
      ARRAY[
        '{"id": "simplified", "name": "Simple Pricing", "description": "Shows only main plans with key features"}'::JSONB
      ],
      '{"targeting": {"traffic_percentage": 50}}'::JSONB,
      NOW() - INTERVAL '5 days',
      NOW() + INTERVAL '25 days',
      'running',
      'admin@example.com'
    ),
    (
      '750e8400-e29b-41d4-a716-446655440003'::UUID,
      'onboarding_step_order_test',
      'Testing different order of onboarding steps',
      'Starting with WhatsApp integration will improve completion rates',
      false, 100,
      '{"id": "control", "name": "Business First", "description": "Business info → WhatsApp → Bot Setup"}'::JSONB,
      ARRAY[
        '{"id": "whatsapp_first", "name": "WhatsApp First", "description": "WhatsApp → Business info → Bot Setup"}'::JSONB
      ],
      '{}'::JSONB,
      NOW() - INTERVAL '30 days',
      NOW() - INTERVAL '5 days',
      'completed',
      'admin@example.com'
    );

    -- Insert experiment assignments
    INSERT INTO experiments.assignments (
      experiment_id, user_id, session_id, variant_id,
      assigned_at, first_exposure_at, last_exposure_at, exposure_count,
      user_agent, ip_address, country
    ) VALUES
    -- Hero CTA test assignments
    ('750e8400-e29b-41d4-a716-446655440001'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, NULL, 'variant_a', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '192.168.1.100'::INET, 'US'),
    ('750e8400-e29b-41d4-a716-446655440001'::UUID, '550e8400-e29b-41d4-a716-446655440002'::UUID, NULL, 'control', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 2, 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', '81.2.69.142'::INET, 'GB'),
    ('750e8400-e29b-41d4-a716-446655440001'::UUID, '550e8400-e29b-41d4-a716-446655440003'::UUID, NULL, 'variant_b', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', 1, 'Mozilla/5.0 (iPad; CPU OS 16_6)', '185.3.94.25'::INET, 'AE'),
    
    -- Pricing test assignments
    ('750e8400-e29b-41d4-a716-446655440002'::UUID, '550e8400-e29b-41d4-a716-446655440004'::UUID, NULL, 'simplified', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 hour', 5, 'Mozilla/5.0 (Linux; Android 13)', '117.194.123.45'::INET, 'IN'),
    ('750e8400-e29b-41d4-a716-446655440002'::UUID, NULL, 'session_anonymous_123', 'control', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '2 hours', 2, 'Mozilla/5.0 (Windows NT 10.0)', '203.0.113.45'::INET, 'US');

    -- =============================================================================
    -- WHATSAPP SCHEMA SEED DATA (Future Integration)
    -- =============================================================================
    
    -- Insert WhatsApp accounts (for converted customers)
    INSERT INTO whatsapp.accounts (
      id, lead_id, business_account_id, phone_number_id, phone_number,
      display_name, access_token_encrypted, webhook_verify_token_encrypted,
      is_verified, is_active, verification_status,
      messages_sent_today, messages_limit_daily, last_message_sent_at
    ) VALUES
    (
      '850e8400-e29b-41d4-a716-446655440001'::UUID,
      '550e8400-e29b-41d4-a716-446655440006'::UUID, -- Carlos Silva (converted)
      '123456789012345', 'phone_number_id_12345', '+5511999998888',
      'Negócio Digital Support', 
      encrypt_pass('whatsapp_access_token_encrypted_data_here', 'encryption_key'),
      encrypt_pass('webhook_verify_token_encrypted_data_here', 'encryption_key'),
      true, true, 'approved',
      45, 1000, NOW() - INTERVAL '2 hours'
    );

    -- Insert WhatsApp message templates
    INSERT INTO whatsapp.templates (
      id, account_id, template_name, category, language, status,
      header_type, header_content, body_text, footer_text, buttons,
      whatsapp_template_id
    ) VALUES
    (
      '950e8400-e29b-41d4-a716-446655440001'::UUID,
      '850e8400-e29b-41d4-a716-446655440001'::UUID,
      'order_confirmation', 'utility', 'pt_BR', 'approved',
      'text', 'Confirmação do Pedido',
      'Olá {{1}}, seu pedido #{{2}} foi confirmado! Total: R$ {{3}}. Previsão de entrega: {{4}}.',
      'Negócio Digital - Obrigado pela preferência!',
      '[{"type": "url", "text": "Acompanhar Pedido", "url": "https://negocio.com/pedido/{{2}}"}]'::JSONB,
      'order_confirmation_pt_br_001'
    ),
    (
      '950e8400-e29b-41d4-a716-446655440002'::UUID,
      '850e8400-e29b-41d4-a716-446655440001'::UUID,
      'welcome_message', 'marketing', 'pt_BR', 'approved',
      NULL, NULL,
      'Bem-vindo ao Negócio Digital! 🎉 Estamos felizes em tê-lo conosco. Como podemos ajudá-lo hoje?',
      NULL,
      '[{"type": "quick_reply", "text": "Ver Produtos"}, {"type": "quick_reply", "text": "Falar com Atendente"}]'::JSONB,
      'welcome_message_pt_br_001'
    );

    RAISE NOTICE 'Seed data inserted successfully for development environment';
    
  ELSE
    RAISE NOTICE 'Skipping seed data insertion - not in development environment';
  END IF;
END
$$;