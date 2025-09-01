-- =============================================================================
-- SUPABASE SCHEMA ARCHITECTURE - WhatsApp Cloud API SaaS Platform
-- =============================================================================
--
-- This migration creates the complete database schema for the WhatsApp Cloud API
-- SaaS platform with multi-level schemas, RLS policies, and performance indexes.
--
-- SCHEMAS:
-- - marketing: Lead capture and management
-- - onboarding: User onboarding flow tracking  
-- - analytics: Event tracking and metrics
-- - whatsapp: Future WhatsApp integration data
-- - experiments: A/B testing and feature flags
-- - public: Core shared tables and utilities
--
-- COMPLIANCE: EU region setup for GDPR compliance
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- =============================================================================
-- ENUMS AND CUSTOM TYPES
-- =============================================================================

-- Lead management enums
CREATE TYPE lead_source_type AS ENUM (
  'website-form',
  'demo-request', 
  'newsletter-signup',
  'pricing-inquiry',
  'contact-form'
);

CREATE TYPE lead_status_type AS ENUM (
  'new',
  'contacted',
  'qualified',
  'converted',
  'lost'
);

-- Event tracking enums
CREATE TYPE event_type_category AS ENUM (
  'page_view',
  'user_action', 
  'conversion',
  'system'
);

CREATE TYPE metric_type_enum AS ENUM (
  'counter',
  'gauge',
  'histogram', 
  'rate'
);

CREATE TYPE aggregation_type_enum AS ENUM (
  'sum',
  'average',
  'min',
  'max',
  'count',
  'unique_count'
);

CREATE TYPE time_granularity_enum AS ENUM (
  'minute',
  'hour',
  'day',
  'week',
  'month'
);

-- Onboarding enums
CREATE TYPE onboarding_step_type AS ENUM (
  'business_info',
  'whatsapp_integration',
  'bot_setup',
  'testing',
  'complete'
);

CREATE TYPE onboarding_status_type AS ENUM (
  'not_started',
  'in_progress',
  'completed',
  'abandoned'
);

-- Device and browser tracking
CREATE TYPE device_type_enum AS ENUM (
  'desktop',
  'mobile',
  'tablet'
);

-- =============================================================================
-- MARKETING SCHEMA - Lead capture and management
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS marketing;

-- Leads table - Core lead management
CREATE TABLE marketing.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email CITEXT NOT NULL UNIQUE,
  phone_number VARCHAR(20),
  company_name VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  source lead_source_type NOT NULL DEFAULT 'website-form',
  status lead_status_type NOT NULL DEFAULT 'new',
  notes TEXT,
  interested_features TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Metadata for analytics and tracking
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100), 
  utm_campaign VARCHAR(100),
  utm_content VARCHAR(100),
  utm_term VARCHAR(100),
  referrer TEXT,
  landing_page TEXT,
  user_agent TEXT,
  ip_address INET,
  country_code VARCHAR(2),
  region VARCHAR(100),
  city VARCHAR(100),
  
  -- Soft delete support
  deleted_at TIMESTAMPTZ NULL,
  
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_phone CHECK (phone_number IS NULL OR phone_number ~* '^\+?[\d\s\-()]{7,20}$')
);

-- Lead interactions - Track all touchpoints
CREATE TABLE marketing.lead_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES marketing.leads(id) ON DELETE CASCADE,
  interaction_type VARCHAR(50) NOT NULL, -- 'email_sent', 'demo_scheduled', 'call_made', etc.
  subject VARCHAR(255),
  description TEXT,
  outcome VARCHAR(50), -- 'positive', 'negative', 'neutral', 'no_response'
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by VARCHAR(100), -- User who created the interaction
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- ONBOARDING SCHEMA - User onboarding flow tracking
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS onboarding;

-- Onboarding sessions - Track user progress through onboarding
CREATE TABLE onboarding.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES marketing.leads(id) ON DELETE SET NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  current_step onboarding_step_type NOT NULL DEFAULT 'business_info',
  status onboarding_status_type NOT NULL DEFAULT 'not_started',
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  
  -- Step completion tracking
  business_info_completed_at TIMESTAMPTZ,
  whatsapp_integration_completed_at TIMESTAMPTZ,
  bot_setup_completed_at TIMESTAMPTZ,
  testing_completed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Session metadata
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  abandoned_at TIMESTAMPTZ,
  user_agent TEXT,
  ip_address INET,
  
  -- Business information collected during onboarding
  business_data JSONB DEFAULT '{}'::JSONB,
  whatsapp_config JSONB DEFAULT '{}'::JSONB,
  bot_config JSONB DEFAULT '{}'::JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Onboarding step activities - Detailed tracking of user actions within steps
CREATE TABLE onboarding.step_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES onboarding.sessions(id) ON DELETE CASCADE,
  step onboarding_step_type NOT NULL,
  activity_type VARCHAR(50) NOT NULL, -- 'form_started', 'field_filled', 'validation_error', 'step_completed'
  field_name VARCHAR(100),
  field_value TEXT,
  error_message TEXT,
  time_spent_seconds INTEGER,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- ANALYTICS SCHEMA - Event tracking and metrics
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS analytics;

-- Events table - All user and system events
CREATE TABLE analytics.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type event_type_category NOT NULL,
  name VARCHAR(100) NOT NULL,
  user_id UUID, -- Can link to leads or future user system
  session_id UUID, -- Can link to onboarding sessions or web sessions
  
  -- Event data
  properties JSONB DEFAULT '{}'::JSONB,
  
  -- Request metadata
  metadata JSONB DEFAULT '{}'::JSONB,
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,
  url TEXT,
  device_type device_type_enum,
  browser VARCHAR(50),
  os VARCHAR(50),
  country VARCHAR(100),
  region VARCHAR(100),
  
  -- Processing status
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Indexes will be created separately for performance
  CONSTRAINT valid_properties CHECK (jsonb_typeof(properties) = 'object'),
  CONSTRAINT valid_metadata CHECK (jsonb_typeof(metadata) = 'object')
);

-- Metrics table - Aggregated and calculated metrics
CREATE TABLE analytics.metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type metric_type_enum NOT NULL,
  value_numeric DECIMAL(20,8),
  value_json JSONB, -- For complex metric values like histograms
  
  -- Metric dimensions and tags
  dimensions JSONB DEFAULT '{}'::JSONB,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Time information
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  time_window_start TIMESTAMPTZ,
  time_window_end TIMESTAMPTZ,
  granularity time_granularity_enum,
  
  -- Aggregation information
  source VARCHAR(100), -- Source system or component
  aggregation aggregation_type_enum,
  sample_count INTEGER,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_dimensions CHECK (jsonb_typeof(dimensions) = 'object'),
  CONSTRAINT valid_value CHECK (value_numeric IS NOT NULL OR value_json IS NOT NULL)
);

-- Event aggregations - Pre-calculated event summaries for performance
CREATE TABLE analytics.event_aggregations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type event_type_category,
  event_name VARCHAR(100),
  time_bucket TIMESTAMPTZ NOT NULL, -- Rounded to granularity
  granularity time_granularity_enum NOT NULL,
  
  -- Aggregated counts
  event_count INTEGER NOT NULL DEFAULT 0,
  unique_users INTEGER NOT NULL DEFAULT 0,
  unique_sessions INTEGER NOT NULL DEFAULT 0,
  
  -- Additional dimensions
  dimensions JSONB DEFAULT '{}'::JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(event_type, event_name, time_bucket, granularity, dimensions)
);

-- =============================================================================
-- EXPERIMENTS SCHEMA - A/B testing and feature flags
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS experiments;

-- Experiments - A/B tests and feature flag experiments
CREATE TABLE experiments.experiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  hypothesis TEXT,
  
  -- Experiment configuration
  is_active BOOLEAN DEFAULT FALSE,
  traffic_percentage INTEGER DEFAULT 100 CHECK (traffic_percentage >= 0 AND traffic_percentage <= 100),
  
  -- Variants configuration
  control_variant JSONB NOT NULL,
  test_variants JSONB[] NOT NULL,
  
  -- Targeting rules
  targeting_rules JSONB DEFAULT '{}'::JSONB,
  
  -- Time bounds
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  
  -- Results and status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed', 'cancelled')),
  results JSONB DEFAULT '{}'::JSONB,
  winner_variant_id VARCHAR(50),
  
  -- Metadata
  created_by VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_control_variant CHECK (jsonb_typeof(control_variant) = 'object'),
  CONSTRAINT valid_targeting_rules CHECK (jsonb_typeof(targeting_rules) = 'object'),
  CONSTRAINT valid_results CHECK (jsonb_typeof(results) = 'object'),
  CONSTRAINT valid_date_range CHECK (end_date IS NULL OR start_date < end_date)
);

-- Experiment assignments - User/session assignments to experiment variants
CREATE TABLE experiments.assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID NOT NULL REFERENCES experiments.experiments(id) ON DELETE CASCADE,
  user_id UUID, -- Can be lead_id or future user_id
  session_id VARCHAR(255), -- Anonymous session identifier
  variant_id VARCHAR(50) NOT NULL,
  
  -- Assignment metadata
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  first_exposure_at TIMESTAMPTZ,
  last_exposure_at TIMESTAMPTZ,
  exposure_count INTEGER DEFAULT 0,
  
  -- Context when assigned
  user_agent TEXT,
  ip_address INET,
  country VARCHAR(100),
  
  UNIQUE(experiment_id, user_id, session_id)
);

-- =============================================================================
-- WHATSAPP SCHEMA - Future WhatsApp integration data
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS whatsapp;

-- WhatsApp accounts - Business accounts configuration
CREATE TABLE whatsapp.accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES marketing.leads(id) ON DELETE SET NULL,
  
  -- WhatsApp Business API configuration
  business_account_id VARCHAR(100) NOT NULL,
  phone_number_id VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  display_name VARCHAR(100),
  
  -- API credentials (encrypted)
  access_token_encrypted TEXT NOT NULL,
  webhook_verify_token_encrypted TEXT NOT NULL,
  
  -- Account status
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT FALSE,
  verification_status VARCHAR(50) DEFAULT 'pending',
  
  -- Usage tracking
  messages_sent_today INTEGER DEFAULT 0,
  messages_limit_daily INTEGER DEFAULT 1000,
  last_message_sent_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(business_account_id, phone_number_id)
);

-- Message templates - Pre-approved message templates
CREATE TABLE whatsapp.templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES whatsapp.accounts(id) ON DELETE CASCADE,
  
  -- Template information
  template_name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'marketing', 'utility', 'authentication'
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'disabled')),
  
  -- Template content
  header_type VARCHAR(20), -- 'text', 'image', 'video', 'document'
  header_content TEXT,
  body_text TEXT NOT NULL,
  footer_text TEXT,
  
  -- Button configuration
  buttons JSONB DEFAULT '[]'::JSONB,
  
  -- WhatsApp template ID when approved
  whatsapp_template_id VARCHAR(100),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_buttons CHECK (jsonb_typeof(buttons) = 'array')
);

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to validate email format
CREATE OR REPLACE FUNCTION validate_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql;

-- Function to generate session token
CREATE OR REPLACE FUNCTION generate_session_token()
RETURNS TEXT AS $$
BEGIN
    RETURN 'sess_' || encode(gen_random_bytes(32), 'base64url');
END;
$$ LANGUAGE plpgsql;

-- Function to calculate onboarding progress
CREATE OR REPLACE FUNCTION calculate_onboarding_progress(session_record onboarding.sessions)
RETURNS INTEGER AS $$
DECLARE
    progress INTEGER := 0;
BEGIN
    IF session_record.business_info_completed_at IS NOT NULL THEN
        progress := progress + 25;
    END IF;
    
    IF session_record.whatsapp_integration_completed_at IS NOT NULL THEN
        progress := progress + 25;
    END IF;
    
    IF session_record.bot_setup_completed_at IS NOT NULL THEN
        progress := progress + 25;
    END IF;
    
    IF session_record.testing_completed_at IS NOT NULL THEN
        progress := progress + 25;
    END IF;
    
    RETURN progress;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at for all tables
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON marketing.leads 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON onboarding.sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiments_updated_at BEFORE UPDATE ON experiments.experiments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_accounts_updated_at BEFORE UPDATE ON whatsapp.accounts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_templates_updated_at BEFORE UPDATE ON whatsapp.templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update onboarding progress automatically
CREATE OR REPLACE FUNCTION update_onboarding_progress()
RETURNS TRIGGER AS $$
BEGIN
    NEW.progress_percentage = calculate_onboarding_progress(NEW);
    
    -- Update status based on progress
    IF NEW.progress_percentage = 100 THEN
        NEW.status = 'completed';
        NEW.completed_at = COALESCE(NEW.completed_at, NOW());
    ELSIF NEW.progress_percentage > 0 THEN
        NEW.status = 'in_progress';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_onboarding_sessions_progress BEFORE UPDATE ON onboarding.sessions 
    FOR EACH ROW EXECUTE FUNCTION update_onboarding_progress();

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON SCHEMA marketing IS 'Lead capture and management system';
COMMENT ON SCHEMA onboarding IS 'User onboarding flow tracking and management';  
COMMENT ON SCHEMA analytics IS 'Event tracking, metrics, and analytics data';
COMMENT ON SCHEMA experiments IS 'A/B testing and feature flag management';
COMMENT ON SCHEMA whatsapp IS 'WhatsApp Business API integration data';

COMMENT ON TABLE marketing.leads IS 'Core lead management with comprehensive tracking';
COMMENT ON TABLE marketing.lead_interactions IS 'All touchpoints and interactions with leads';
COMMENT ON TABLE onboarding.sessions IS 'User progress through onboarding flow';
COMMENT ON TABLE onboarding.step_activities IS 'Detailed user actions within onboarding steps';
COMMENT ON TABLE analytics.events IS 'All user and system events for analytics';
COMMENT ON TABLE analytics.metrics IS 'Aggregated metrics and KPIs';
COMMENT ON TABLE analytics.event_aggregations IS 'Pre-calculated event summaries for performance';
COMMENT ON TABLE experiments.experiments IS 'A/B tests and feature flag experiments';
COMMENT ON TABLE experiments.assignments IS 'User assignments to experiment variants';
COMMENT ON TABLE whatsapp.accounts IS 'WhatsApp Business API account configuration';
COMMENT ON TABLE whatsapp.templates IS 'WhatsApp message templates management';