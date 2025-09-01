-- Supabase Database Seed Data
-- This file contains sample data for development and testing

BEGIN;

-- =============================================================================
-- MARKETING SCHEMA - Sample Leads and Interactions
-- =============================================================================

-- Sample leads for development
INSERT INTO marketing.leads (
    id,
    email,
    phone_number,
    company_name,
    first_name,
    last_name,
    source,
    status,
    notes,
    interested_features,
    created_at,
    updated_at
) VALUES
    (
        'lead_sample_001',
        'john.doe@techcorp.com',
        '+1555-123-4567',
        'TechCorp Solutions',
        'John',
        'Doe',
        'website-form',
        'new',
        'Interested in WhatsApp automation for customer support',
        ARRAY['automation', 'customer-support', 'analytics'],
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days'
    ),
    (
        'lead_sample_002',
        'sarah.johnson@retail-plus.com',
        '+1555-987-6543',
        'Retail Plus',
        'Sarah',
        'Johnson',
        'demo-request',
        'contacted',
        'Restaurant chain looking for order management via WhatsApp',
        ARRAY['order-management', 'multi-location', 'integrations'],
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '1 day'
    ),
    (
        'lead_sample_003',
        'mike.wilson@healthcaregroup.org',
        '+1555-456-7890',
        'Healthcare Group',
        'Mike',
        'Wilson',
        'referral',
        'qualified',
        'Healthcare provider needs appointment booking system',
        ARRAY['appointment-booking', 'patient-communication', 'reminders'],
        NOW() - INTERVAL '1 week',
        NOW() - INTERVAL '3 days'
    ),
    (
        'lead_sample_004',
        'lisa.martinez@edutech.edu',
        '+1555-321-0987',
        'EduTech Institute',
        'Lisa',
        'Martinez',
        'social-media',
        'converted',
        'Educational institution for student communication',
        ARRAY['student-communication', 'announcements', 'support'],
        NOW() - INTERVAL '2 weeks',
        NOW() - INTERVAL '1 week'
    );

-- Sample lead interactions
INSERT INTO marketing.lead_interactions (
    id,
    lead_id,
    interaction_type,
    subject,
    description,
    outcome,
    scheduled_follow_up,
    metadata,
    created_at
) VALUES
    (
        'interaction_001',
        'lead_sample_001',
        'email_sent',
        'Welcome to WhatsApp Cloud API Solution',
        'Initial welcome email with getting started guide',
        'positive',
        NOW() + INTERVAL '3 days',
        '{"email_template": "welcome", "campaign_id": "onboarding_2024"}',
        NOW() - INTERVAL '2 days'
    ),
    (
        'interaction_002',
        'lead_sample_002',
        'demo_scheduled',
        'WhatsApp Automation Demo - January 15th',
        'Scheduled 30-minute demo focusing on restaurant order management',
        'positive',
        NOW() + INTERVAL '1 day',
        '{"demo_type": "restaurant", "duration_minutes": 30, "calendar_event_id": "demo_123"}',
        NOW() - INTERVAL '4 days'
    ),
    (
        'interaction_003',
        'lead_sample_002',
        'demo_completed',
        'Demo Follow-up',
        'Completed demo, customer interested in enterprise features',
        'positive',
        NOW() + INTERVAL '2 days',
        '{"demo_rating": 4, "interested_features": ["multi-location", "analytics"], "next_step": "proposal"}',
        NOW() - INTERVAL '1 day'
    ),
    (
        'interaction_004',
        'lead_sample_003',
        'call_made',
        'Discovery Call - Healthcare Requirements',
        'Discussed HIPAA compliance and appointment booking workflows',
        'positive',
        NOW() + INTERVAL '1 week',
        '{"call_duration_minutes": 45, "key_requirements": ["HIPAA", "appointment_booking", "reminders"]}',
        NOW() - INTERVAL '3 days'
    ),
    (
        'interaction_005',
        'lead_sample_004',
        'proposal_sent',
        'Custom WhatsApp Solution Proposal',
        'Sent detailed proposal for educational institution communication system',
        'positive',
        NULL,
        '{"proposal_value": 15000, "implementation_weeks": 6, "proposal_id": "PROP_2024_001"}',
        NOW() - INTERVAL '1 week'
    );

-- =============================================================================
-- ONBOARDING SCHEMA - Sample Sessions and Activities
-- =============================================================================

-- Sample onboarding sessions
INSERT INTO onboarding.sessions (
    id,
    session_token,
    lead_id,
    current_step,
    completion_percentage,
    business_data,
    integration_data,
    bot_configuration,
    is_completed,
    completed_at,
    created_at,
    updated_at
) VALUES
    (
        'session_001',
        'sess_tech_corp_2024_001',
        'lead_sample_001',
        'integration',
        60,
        '{
            "business_name": "TechCorp Solutions",
            "business_type": "technology",
            "industry": "software",
            "employee_count": "50-100",
            "primary_use_case": "customer_support"
        }',
        '{
            "phone_number": "+1555-TECHCORP",
            "verification_status": "pending",
            "webhook_url": "https://techcorp.com/webhooks/whatsapp"
        }',
        '{
            "bot_name": "TechCorp Assistant",
            "greeting_message": "Hello! How can TechCorp help you today?",
            "language": "en",
            "business_hours": {
                "enabled": true,
                "timezone": "America/New_York",
                "schedule": {
                    "monday": {"start": "09:00", "end": "17:00"},
                    "tuesday": {"start": "09:00", "end": "17:00"},
                    "wednesday": {"start": "09:00", "end": "17:00"},
                    "thursday": {"start": "09:00", "end": "17:00"},
                    "friday": {"start": "09:00", "end": "17:00"}
                }
            }
        }',
        FALSE,
        NULL,
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '4 hours'
    ),
    (
        'session_002',
        'sess_retail_plus_2024_001',
        'lead_sample_002',
        'testing',
        80,
        '{
            "business_name": "Retail Plus",
            "business_type": "retail",
            "industry": "restaurant",
            "employee_count": "100-500",
            "primary_use_case": "order_management"
        }',
        '{
            "phone_number": "+1555-RETAIL-PLUS",
            "verification_status": "verified",
            "webhook_url": "https://retail-plus.com/api/whatsapp"
        }',
        '{
            "bot_name": "Retail Plus Orders",
            "greeting_message": "Welcome to Retail Plus! Ready to place an order?",
            "language": "en",
            "menu_integration": true,
            "payment_integration": true,
            "order_confirmation": true
        }',
        FALSE,
        NULL,
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '1 hour'
    ),
    (
        'session_003',
        'sess_edutech_2024_001',
        'lead_sample_004',
        'complete',
        100,
        '{
            "business_name": "EduTech Institute",
            "business_type": "education",
            "industry": "education",
            "employee_count": "20-50",
            "primary_use_case": "student_communication"
        }',
        '{
            "phone_number": "+1555-EDUTECH",
            "verification_status": "verified",
            "webhook_url": "https://edutech.edu/whatsapp/webhook"
        }',
        '{
            "bot_name": "EduTech Assistant",
            "greeting_message": "Hi! Welcome to EduTech Institute. How can I help you?",
            "language": "en",
            "student_portal_integration": true,
            "announcement_broadcast": true,
            "office_hours_support": true
        }',
        TRUE,
        NOW() - INTERVAL '1 week',
        NOW() - INTERVAL '2 weeks',
        NOW() - INTERVAL '1 week'
    );

-- Sample step activities
INSERT INTO onboarding.step_activities (
    id,
    session_id,
    step,
    activity_type,
    field_name,
    old_value,
    new_value,
    metadata,
    created_at
) VALUES
    (
        'activity_001',
        'session_001',
        'business_info',
        'form_started',
        NULL,
        NULL,
        NULL,
        '{"user_agent": "Chrome/91.0", "referrer": "direct"}',
        NOW() - INTERVAL '2 days'
    ),
    (
        'activity_002',
        'session_001',
        'business_info',
        'field_filled',
        'business_name',
        NULL,
        'TechCorp Solutions',
        '{"validation_passed": true, "completion_time_ms": 2500}',
        NOW() - INTERVAL '2 days' + INTERVAL '2 minutes'
    ),
    (
        'activity_003',
        'session_001',
        'business_info',
        'step_completed',
        NULL,
        NULL,
        NULL,
        '{"total_time_seconds": 180, "fields_completed": 5}',
        NOW() - INTERVAL '2 days' + INTERVAL '3 minutes'
    ),
    (
        'activity_004',
        'session_002',
        'integration',
        'phone_verification_started',
        'phone_number',
        NULL,
        '+1555-RETAIL-PLUS',
        '{"method": "sms", "country_code": "US"}',
        NOW() - INTERVAL '4 days'
    ),
    (
        'activity_005',
        'session_002',
        'integration',
        'phone_verification_completed',
        'phone_number',
        'pending',
        'verified',
        '{"verification_method": "sms", "attempts": 1}',
        NOW() - INTERVAL '4 days' + INTERVAL '5 minutes'
    );

-- =============================================================================
-- ANALYTICS SCHEMA - Sample Events and Metrics
-- =============================================================================

-- Sample analytics events
INSERT INTO analytics.events (
    id,
    type,
    name,
    properties,
    user_id,
    session_id,
    metadata,
    created_at
) VALUES
    (
        'event_001',
        'page_view',
        'landing_page_view',
        '{
            "page_url": "/",
            "page_title": "WhatsApp Cloud API Landing",
            "referrer": "https://google.com",
            "user_agent": "Chrome/91.0",
            "viewport": {"width": 1920, "height": 1080},
            "load_time_ms": 1250
        }',
        NULL,
        'visitor_001',
        '{"campaign": "google_ads", "utm_source": "google", "utm_medium": "cpc"}',
        NOW() - INTERVAL '1 day'
    ),
    (
        'event_002',
        'user_action',
        'cta_click',
        '{
            "button_text": "Get Started Free",
            "button_position": "hero_section",
            "click_coordinates": {"x": 640, "y": 480},
            "time_on_page_seconds": 45
        }',
        NULL,
        'visitor_001',
        '{"experiment_variant": "A", "ab_test_id": "hero_cta_2024"}',
        NOW() - INTERVAL '1 day' + INTERVAL '45 seconds'
    ),
    (
        'event_003',
        'conversion',
        'lead_form_submit',
        '{
            "form_id": "hero_lead_capture",
            "fields_completed": 4,
            "completion_time_seconds": 120,
            "email": "john.doe@techcorp.com",
            "source": "landing_page"
        }',
        'lead_sample_001',
        'visitor_001',
        '{"conversion_value": 500, "lead_score": 85}',
        NOW() - INTERVAL '1 day' + INTERVAL '2 minutes'
    ),
    (
        'event_004',
        'user_action',
        'pricing_section_view',
        '{
            "section_position": 3,
            "scroll_percentage": 60,
            "time_to_scroll_seconds": 30,
            "pricing_variant": "B"
        }',
        NULL,
        'visitor_002',
        '{"ab_test_variant": "B", "pricing_test_2024": true}',
        NOW() - INTERVAL '6 hours'
    ),
    (
        'event_005',
        'user_action',
        'demo_request_click',
        '{
            "button_location": "pricing_section",
            "plan_interest": "professional",
            "monthly_vs_annual": "annual"
        }',
        NULL,
        'visitor_002',
        '{"intent_score": 95, "likelihood_to_convert": "high"}',
        NOW() - INTERVAL '6 hours' + INTERVAL '2 minutes'
    ),
    (
        'event_006',
        'system',
        'page_performance',
        '{
            "page_url": "/",
            "load_time_ms": 1100,
            "first_contentful_paint": 800,
            "largest_contentful_paint": 1500,
            "cumulative_layout_shift": 0.05,
            "time_to_interactive": 2000
        }',
        NULL,
        'system_monitor',
        '{"performance_grade": "A", "core_web_vitals_passed": true}',
        NOW() - INTERVAL '30 minutes'
    );

-- Sample metrics
INSERT INTO analytics.metrics (
    id,
    name,
    description,
    type,
    value_numeric,
    value_text,
    dimensions,
    created_at
) VALUES
    (
        'metric_001',
        'daily_page_views',
        'Total page views per day',
        'counter',
        1250,
        NULL,
        '{"date": "2024-01-30", "page": "landing"}',
        NOW() - INTERVAL '1 day'
    ),
    (
        'metric_002',
        'conversion_rate',
        'Lead conversion rate percentage',
        'gauge',
        8.5,
        NULL,
        '{"period": "daily", "source": "organic"}',
        NOW() - INTERVAL '1 day'
    ),
    (
        'metric_003',
        'avg_session_duration',
        'Average session duration in minutes',
        'gauge',
        4.2,
        NULL,
        '{"date": "2024-01-30", "device_type": "desktop"}',
        NOW() - INTERVAL '1 day'
    ),
    (
        'metric_004',
        'bounce_rate',
        'Percentage of single-page sessions',
        'gauge',
        35.8,
        NULL,
        '{"period": "weekly", "traffic_source": "paid"}',
        NOW() - INTERVAL '1 day'
    );

-- =============================================================================
-- EXPERIMENTS SCHEMA - Sample A/B Tests
-- =============================================================================

-- Sample experiments
INSERT INTO experiments.experiments (
    id,
    name,
    description,
    hypothesis,
    is_active,
    traffic_percentage,
    variants,
    success_metrics,
    created_at,
    updated_at
) VALUES
    (
        'exp_hero_cta_2024',
        'Hero CTA Button Test',
        'Testing different call-to-action button copy and colors in the hero section',
        'Changing the CTA from "Get Started" to "Start Free Trial" will improve conversion rates',
        TRUE,
        50,
        '{
            "A": {
                "name": "Control",
                "description": "Original green button with Get Started text",
                "changes": {
                    "button_text": "Get Started Free",
                    "button_color": "#10B981",
                    "button_size": "large"
                }
            },
            "B": {
                "name": "Variant",
                "description": "Blue button with Start Free Trial text",
                "changes": {
                    "button_text": "Start Free Trial",
                    "button_color": "#3B82F6",
                    "button_size": "large"
                }
            }
        }',
        '["cta_click_rate", "lead_conversion_rate", "time_to_conversion"]',
        NOW() - INTERVAL '1 week',
        NOW() - INTERVAL '1 day'
    ),
    (
        'exp_pricing_layout_2024',
        'Pricing Section Layout',
        'Testing 2-column vs 3-column pricing layout',
        '3-column layout with highlighted recommended plan will increase plan selection',
        TRUE,
        40,
        '{
            "A": {
                "name": "Two Column",
                "description": "Simplified two-column pricing (Basic, Pro)",
                "changes": {
                    "layout": "2_column",
                    "plans_shown": ["basic", "professional"],
                    "highlight_plan": "professional"
                }
            },
            "B": {
                "name": "Three Column",
                "description": "Traditional three-column with Basic, Pro, Enterprise",
                "changes": {
                    "layout": "3_column", 
                    "plans_shown": ["basic", "professional", "enterprise"],
                    "highlight_plan": "professional"
                }
            }
        }',
        '["pricing_section_engagement", "plan_selection_rate", "demo_request_rate"]',
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '2 days'
    );

-- Sample experiment assignments
INSERT INTO experiments.assignments (
    id,
    experiment_id,
    session_id,
    variant,
    assigned_at
) VALUES
    (
        'assign_001',
        'exp_hero_cta_2024',
        'visitor_001',
        'A',
        NOW() - INTERVAL '1 day'
    ),
    (
        'assign_002',
        'exp_hero_cta_2024',
        'visitor_002',
        'B',
        NOW() - INTERVAL '6 hours'
    ),
    (
        'assign_003',
        'exp_pricing_layout_2024',
        'visitor_001',
        'B',
        NOW() - INTERVAL '1 day'
    ),
    (
        'assign_004',
        'exp_pricing_layout_2024',
        'visitor_002',
        'A',
        NOW() - INTERVAL '6 hours'
    );

COMMIT;

-- =============================================================================
-- SEED DATA VERIFICATION
-- =============================================================================

-- Show summary of seeded data
DO $$
BEGIN
    RAISE NOTICE '=== SEED DATA SUMMARY ===';
    RAISE NOTICE 'Marketing leads: % rows', (SELECT COUNT(*) FROM marketing.leads);
    RAISE NOTICE 'Lead interactions: % rows', (SELECT COUNT(*) FROM marketing.lead_interactions);
    RAISE NOTICE 'Onboarding sessions: % rows', (SELECT COUNT(*) FROM onboarding.sessions);
    RAISE NOTICE 'Step activities: % rows', (SELECT COUNT(*) FROM onboarding.step_activities);
    RAISE NOTICE 'Analytics events: % rows', (SELECT COUNT(*) FROM analytics.events);
    RAISE NOTICE 'Analytics metrics: % rows', (SELECT COUNT(*) FROM analytics.metrics);
    RAISE NOTICE 'Experiments: % rows', (SELECT COUNT(*) FROM experiments.experiments);
    RAISE NOTICE 'Experiment assignments: % rows', (SELECT COUNT(*) FROM experiments.assignments);
    RAISE NOTICE '=== SEED COMPLETE ===';
END $$;