-- =============================================================================
-- SEED DATA FOR LOCAL DEVELOPMENT
-- =============================================================================
-- Simplified seed data for local testing with public schema
-- =============================================================================

BEGIN;

-- =============================================================================
-- SAMPLE LEADS
-- =============================================================================
INSERT INTO leads (email, business_name, business_type, phone, country, source, status, notes) VALUES
  ('john.doe@techcorp.com', 'TechCorp Solutions', 'technology', '+1555123456', 'US', 'landing_page', 'new', 'Interested in WhatsApp automation'),
  ('sarah.johnson@retail.com', 'Retail Plus', 'retail', '+1555987654', 'US', 'landing_page', 'contacted', 'Restaurant chain looking for order management'),
  ('mike.wilson@health.org', 'Healthcare Group', 'healthcare', '+1555456789', 'US', 'referral', 'qualified', 'Healthcare provider needs appointment booking'),
  ('lisa.martinez@edu.edu', 'EduTech Institute', 'education', '+1555321098', 'US', 'social_media', 'converted', 'Educational institution for student communication'),
  ('carlos.garcia@hotel.es', 'Hotel Paradise', 'hospitality', '+34666777888', 'ES', 'landing_page', 'new', 'Hotel chain interested in guest services'),
  ('anna.smith@beauty.com', 'Beauty Studio', 'beauty', '+44207123456', 'GB', 'landing_page', 'contacted', 'Beauty salon needs appointment system');

-- =============================================================================
-- SAMPLE ONBOARDING FLOWS
-- =============================================================================
INSERT INTO onboarding_flows (name, description, steps, is_active) VALUES
  (
    'Standard Onboarding',
    'Default onboarding flow for new users',
    '[
      {"id": 1, "name": "business_info", "title": "Business Information", "required": true},
      {"id": 2, "name": "whatsapp_setup", "title": "WhatsApp Configuration", "required": true},
      {"id": 3, "name": "bot_config", "title": "Bot Setup", "required": true},
      {"id": 4, "name": "testing", "title": "Test Your Bot", "required": false}
    ]'::jsonb,
    true
  ),
  (
    'Quick Start',
    'Simplified onboarding for quick setup',
    '[
      {"id": 1, "name": "basic_info", "title": "Basic Information", "required": true},
      {"id": 2, "name": "quick_setup", "title": "Quick Setup", "required": true}
    ]'::jsonb,
    true
  );

-- =============================================================================
-- SAMPLE ONBOARDING SESSIONS
-- =============================================================================
INSERT INTO onboarding_sessions (flow_id, user_email, current_step, status, data) VALUES
  (
    (SELECT id FROM onboarding_flows WHERE name = 'Standard Onboarding' LIMIT 1),
    'john.doe@techcorp.com',
    2,
    'in_progress',
    '{
      "business_name": "TechCorp Solutions",
      "business_type": "technology",
      "employee_count": "50-100",
      "use_case": "customer_support"
    }'::jsonb
  ),
  (
    (SELECT id FROM onboarding_flows WHERE name = 'Standard Onboarding' LIMIT 1),
    'lisa.martinez@edu.edu',
    4,
    'completed',
    '{
      "business_name": "EduTech Institute",
      "business_type": "education",
      "employee_count": "20-50",
      "use_case": "student_communication",
      "whatsapp_number": "+1555321098",
      "bot_name": "EduBot"
    }'::jsonb
  );

-- =============================================================================
-- SAMPLE ANALYTICS EVENTS
-- =============================================================================
INSERT INTO analytics_events (
  event_name, event_category, event_action, event_label, 
  page_url, page_title, session_id, utm_source, utm_medium
) VALUES
  ('page_view', 'navigation', 'view', 'homepage', '/', 'Home - Neptunik', 'session_001', 'google', 'organic'),
  ('button_click', 'interaction', 'click', 'cta_hero', '/', 'Home - Neptunik', 'session_001', 'google', 'organic'),
  ('form_submit', 'conversion', 'submit', 'lead_capture', '/onboarding', 'Get Started - Neptunik', 'session_001', 'google', 'organic'),
  ('page_view', 'navigation', 'view', 'pricing', '/pricing', 'Pricing - Neptunik', 'session_002', 'direct', 'none'),
  ('button_click', 'interaction', 'click', 'start_trial', '/pricing', 'Pricing - Neptunik', 'session_002', 'direct', 'none'),
  ('video_play', 'engagement', 'play', 'demo_video', '/', 'Home - Neptunik', 'session_003', 'facebook', 'social'),
  ('scroll_depth', 'engagement', 'scroll', '75%', '/', 'Home - Neptunik', 'session_003', 'facebook', 'social'),
  ('page_view', 'navigation', 'view', 'features', '/features', 'Features - Neptunik', 'session_004', 'linkedin', 'social'),
  ('download', 'conversion', 'download', 'whitepaper', '/resources', 'Resources - Neptunik', 'session_004', 'linkedin', 'social'),
  ('error', 'system', 'error', '404', '/old-page', '404 Not Found', 'session_005', 'google', 'cpc');

-- =============================================================================
-- SAMPLE EXPERIMENTS
-- =============================================================================
INSERT INTO experiments (name, description, hypothesis, status, traffic_percentage, variants, metrics) VALUES
  (
    'Hero CTA Test',
    'Testing different CTA button texts',
    'Changing CTA text from "Get Started" to "Start Free Trial" will increase conversions',
    'running',
    50,
    '[
      {"id": "control", "name": "Get Started", "weight": 50},
      {"id": "variant", "name": "Start Free Trial", "weight": 50}
    ]'::jsonb,
    '["click_rate", "conversion_rate", "bounce_rate"]'::jsonb
  ),
  (
    'Pricing Layout',
    'Testing 2-column vs 3-column pricing',
    'Three-column pricing with highlighted middle option will increase plan selection',
    'running',
    100,
    '[
      {"id": "two_col", "name": "Two Column", "weight": 50},
      {"id": "three_col", "name": "Three Column", "weight": 50}
    ]'::jsonb,
    '["plan_selection_rate", "time_on_page", "conversion_rate"]'::jsonb
  );

-- =============================================================================
-- SAMPLE EXPERIMENT ASSIGNMENTS
-- =============================================================================
INSERT INTO experiment_assignments (experiment_id, session_id, variant) VALUES
  ((SELECT id FROM experiments WHERE name = 'Hero CTA Test' LIMIT 1), 'session_001', 'control'),
  ((SELECT id FROM experiments WHERE name = 'Hero CTA Test' LIMIT 1), 'session_002', 'variant'),
  ((SELECT id FROM experiments WHERE name = 'Hero CTA Test' LIMIT 1), 'session_003', 'control'),
  ((SELECT id FROM experiments WHERE name = 'Pricing Layout' LIMIT 1), 'session_002', 'three_col'),
  ((SELECT id FROM experiments WHERE name = 'Pricing Layout' LIMIT 1), 'session_004', 'two_col'),
  ((SELECT id FROM experiments WHERE name = 'Pricing Layout' LIMIT 1), 'session_005', 'three_col');

COMMIT;

-- =============================================================================
-- VERIFY SEED DATA
-- =============================================================================
DO $$
BEGIN
  RAISE NOTICE '=== SEED DATA SUMMARY ===';
  RAISE NOTICE 'Leads: % rows', (SELECT COUNT(*) FROM leads);
  RAISE NOTICE 'Onboarding Flows: % rows', (SELECT COUNT(*) FROM onboarding_flows);
  RAISE NOTICE 'Onboarding Sessions: % rows', (SELECT COUNT(*) FROM onboarding_sessions);
  RAISE NOTICE 'Analytics Events: % rows', (SELECT COUNT(*) FROM analytics_events);
  RAISE NOTICE 'Experiments: % rows', (SELECT COUNT(*) FROM experiments);
  RAISE NOTICE 'Experiment Assignments: % rows', (SELECT COUNT(*) FROM experiment_assignments);
  RAISE NOTICE '=== SEED COMPLETE ===';
END $$;