-- =============================================================================
-- DATABASE FUNCTIONS AND TRIGGERS
-- =============================================================================
--
-- This migration creates advanced database functions and triggers for:
-- - Data validation and business rule enforcement
-- - Automated data processing and enrichment
-- - Real-time analytics aggregation
-- - GDPR compliance and data lifecycle management
-- =============================================================================

-- =============================================================================
-- LEAD MANAGEMENT FUNCTIONS
-- =============================================================================

-- Function to normalize and validate lead data
CREATE OR REPLACE FUNCTION normalize_lead_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Normalize email to lowercase
  NEW.email = LOWER(TRIM(NEW.email));
  
  -- Normalize names (proper case)
  IF NEW.first_name IS NOT NULL THEN
    NEW.first_name = INITCAP(TRIM(NEW.first_name));
  END IF;
  
  IF NEW.last_name IS NOT NULL THEN
    NEW.last_name = INITCAP(TRIM(NEW.last_name));
  END IF;
  
  IF NEW.company_name IS NOT NULL THEN
    NEW.company_name = TRIM(NEW.company_name);
  END IF;
  
  -- Normalize phone number (remove non-digits except +)
  IF NEW.phone_number IS NOT NULL THEN
    NEW.phone_number = REGEXP_REPLACE(NEW.phone_number, '[^\d+]', '', 'g');
  END IF;
  
  -- Set updated_at on updates
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to detect and merge duplicate leads
CREATE OR REPLACE FUNCTION check_duplicate_leads()
RETURNS TRIGGER AS $$
DECLARE
  existing_lead_id UUID;
  existing_lead_created_at TIMESTAMPTZ;
BEGIN
  -- Look for existing lead with same email
  SELECT id, created_at 
  INTO existing_lead_id, existing_lead_created_at
  FROM marketing.leads 
  WHERE email = NEW.email 
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
    AND deleted_at IS NULL
  LIMIT 1;
  
  IF existing_lead_id IS NOT NULL THEN
    -- If we're inserting and there's an existing lead
    IF TG_OP = 'INSERT' THEN
      -- Update existing lead with new information if fields are empty
      UPDATE marketing.leads SET
        phone_number = COALESCE(phone_number, NEW.phone_number),
        company_name = COALESCE(company_name, NEW.company_name),
        first_name = COALESCE(first_name, NEW.first_name),
        last_name = COALESCE(last_name, NEW.last_name),
        interested_features = CASE 
          WHEN array_length(interested_features, 1) IS NULL 
          THEN NEW.interested_features 
          ELSE interested_features 
        END,
        notes = CASE 
          WHEN notes IS NULL OR notes = '' 
          THEN NEW.notes 
          WHEN NEW.notes IS NOT NULL AND NEW.notes != '' 
          THEN notes || E'\n---\n' || NEW.notes 
          ELSE notes 
        END,
        utm_source = COALESCE(utm_source, NEW.utm_source),
        utm_medium = COALESCE(utm_medium, NEW.utm_medium),
        utm_campaign = COALESCE(utm_campaign, NEW.utm_campaign),
        updated_at = NOW()
      WHERE id = existing_lead_id;
      
      -- Log the duplicate attempt
      INSERT INTO public.audit_logs (
        table_name, operation, row_id, new_values, user_email, ip_address
      ) VALUES (
        'marketing.leads', 'DUPLICATE_PREVENTED', existing_lead_id,
        row_to_json(NEW)::jsonb, NEW.email, inet_client_addr()
      );
      
      -- Prevent the insert by returning NULL
      RETURN NULL;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate lead score
CREATE OR REPLACE FUNCTION calculate_lead_score(lead_record marketing.leads)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  -- Base score for having essential information
  score := score + 10; -- Base points
  
  -- Points for complete profile
  IF lead_record.first_name IS NOT NULL AND lead_record.first_name != '' THEN
    score := score + 5;
  END IF;
  
  IF lead_record.last_name IS NOT NULL AND lead_record.last_name != '' THEN
    score := score + 5;
  END IF;
  
  IF lead_record.company_name IS NOT NULL AND lead_record.company_name != '' THEN
    score := score + 15; -- Business leads are more valuable
  END IF;
  
  IF lead_record.phone_number IS NOT NULL AND lead_record.phone_number != '' THEN
    score := score + 10; -- Contact information is valuable
  END IF;
  
  -- Points for engagement indicators
  IF array_length(lead_record.interested_features, 1) > 0 THEN
    score := score + (array_length(lead_record.interested_features, 1) * 3);
  END IF;
  
  -- Source quality points
  CASE lead_record.source
    WHEN 'demo-request' THEN score := score + 20
    WHEN 'pricing-inquiry' THEN score := score + 15
    WHEN 'contact-form' THEN score := score + 10
    WHEN 'website-form' THEN score := score + 5
    ELSE score := score + 0
  END CASE;
  
  -- UTM campaign indicates marketing qualified
  IF lead_record.utm_campaign IS NOT NULL THEN
    score := score + 8;
  END IF;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- ONBOARDING AUTOMATION FUNCTIONS
-- =============================================================================

-- Function to update onboarding session activity
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last_activity_at whenever session is modified
  NEW.last_activity_at = NOW();
  
  -- Check for abandonment (no activity for 2 hours while in progress)
  IF OLD.status = 'in_progress' 
     AND OLD.last_activity_at < NOW() - INTERVAL '2 hours'
     AND NEW.abandoned_at IS NULL THEN
    NEW.abandoned_at = NOW();
    NEW.status = 'abandoned';
  END IF;
  
  -- Auto-advance to next step based on completion
  IF TG_OP = 'UPDATE' THEN
    -- Business info step completed
    IF OLD.business_info_completed_at IS NULL 
       AND NEW.business_info_completed_at IS NOT NULL 
       AND NEW.current_step = 'business_info' THEN
      NEW.current_step = 'whatsapp_integration';
    END IF;
    
    -- WhatsApp integration completed
    IF OLD.whatsapp_integration_completed_at IS NULL 
       AND NEW.whatsapp_integration_completed_at IS NOT NULL 
       AND NEW.current_step = 'whatsapp_integration' THEN
      NEW.current_step = 'bot_setup';
    END IF;
    
    -- Bot setup completed
    IF OLD.bot_setup_completed_at IS NULL 
       AND NEW.bot_setup_completed_at IS NOT NULL 
       AND NEW.current_step = 'bot_setup' THEN
      NEW.current_step = 'testing';
    END IF;
    
    -- Testing completed
    IF OLD.testing_completed_at IS NULL 
       AND NEW.testing_completed_at IS NOT NULL 
       AND NEW.current_step = 'testing' THEN
      NEW.current_step = 'complete';
      NEW.status = 'completed';
      NEW.completed_at = NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to link onboarding session with lead
CREATE OR REPLACE FUNCTION link_session_to_lead()
RETURNS TRIGGER AS $$
DECLARE
  lead_id_found UUID;
BEGIN
  -- Try to link session to lead if business_data contains email
  IF NEW.business_data IS NOT NULL 
     AND NEW.business_data ? 'email' 
     AND NEW.lead_id IS NULL THEN
    
    SELECT id INTO lead_id_found
    FROM marketing.leads 
    WHERE email = (NEW.business_data->>'email')::CITEXT
      AND deleted_at IS NULL;
    
    IF lead_id_found IS NOT NULL THEN
      NEW.lead_id = lead_id_found;
      
      -- Update lead status to indicate onboarding started
      UPDATE marketing.leads 
      SET status = CASE 
        WHEN status = 'new' THEN 'contacted'
        ELSE status 
      END,
      updated_at = NOW()
      WHERE id = lead_id_found;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- ANALYTICS AUTOMATION FUNCTIONS
-- =============================================================================

-- Function to enrich event data
CREATE OR REPLACE FUNCTION enrich_event_data()
RETURNS TRIGGER AS $$
DECLARE
  session_data RECORD;
  lead_data RECORD;
BEGIN
  -- Set processing timestamp
  IF NEW.processed IS NULL THEN
    NEW.processed = FALSE;
  END IF;
  
  -- Enrich with session data if session_id is provided
  IF NEW.session_id IS NOT NULL THEN
    -- Try onboarding session first
    SELECT s.lead_id, s.current_step, s.progress_percentage
    INTO session_data
    FROM onboarding.sessions s
    WHERE s.session_token = NEW.session_id;
    
    IF session_data.lead_id IS NOT NULL THEN
      NEW.user_id = session_data.lead_id;
      NEW.properties = NEW.properties || jsonb_build_object(
        'onboarding_step', session_data.current_step,
        'onboarding_progress', session_data.progress_percentage
      );
    END IF;
  END IF;
  
  -- Enrich with lead data if user_id is provided
  IF NEW.user_id IS NOT NULL THEN
    SELECT l.source, l.status, l.company_name, l.country_code
    INTO lead_data
    FROM marketing.leads l
    WHERE l.id = NEW.user_id AND l.deleted_at IS NULL;
    
    IF lead_data IS NOT NULL THEN
      NEW.properties = NEW.properties || jsonb_build_object(
        'lead_source', lead_data.source,
        'lead_status', lead_data.status,
        'company_name', COALESCE(lead_data.company_name, ''),
        'lead_country', COALESCE(lead_data.country_code, '')
      );
    END IF;
  END IF;
  
  -- Parse user agent for device info if not provided
  IF NEW.device_type IS NULL AND NEW.user_agent IS NOT NULL THEN
    IF NEW.user_agent ~* 'Mobile|Android|iPhone|iPad' THEN
      NEW.device_type = 'mobile';
    ELSIF NEW.user_agent ~* 'Tablet|iPad' THEN
      NEW.device_type = 'tablet';  
    ELSE
      NEW.device_type = 'desktop';
    END IF;
  END IF;
  
  -- Extract browser from user agent
  IF NEW.browser IS NULL AND NEW.user_agent IS NOT NULL THEN
    CASE 
      WHEN NEW.user_agent ~* 'Chrome' THEN NEW.browser = 'Chrome';
      WHEN NEW.user_agent ~* 'Firefox' THEN NEW.browser = 'Firefox';
      WHEN NEW.user_agent ~* 'Safari' THEN NEW.browser = 'Safari';
      WHEN NEW.user_agent ~* 'Edge' THEN NEW.browser = 'Edge';
      ELSE NEW.browser = 'Other';
    END CASE;
  END IF;
  
  -- Extract OS from user agent
  IF NEW.os IS NULL AND NEW.user_agent IS NOT NULL THEN
    CASE 
      WHEN NEW.user_agent ~* 'Windows' THEN NEW.os = 'Windows';
      WHEN NEW.user_agent ~* 'Mac OS|macOS' THEN NEW.os = 'macOS';
      WHEN NEW.user_agent ~* 'Linux' THEN NEW.os = 'Linux';
      WHEN NEW.user_agent ~* 'Android' THEN NEW.os = 'Android';
      WHEN NEW.user_agent ~* 'iOS' THEN NEW.os = 'iOS';
      ELSE NEW.os = 'Other';
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically create event aggregations
CREATE OR REPLACE FUNCTION create_event_aggregation()
RETURNS TRIGGER AS $$
DECLARE
  hour_bucket TIMESTAMPTZ;
  day_bucket TIMESTAMPTZ;
BEGIN
  -- Only process if event is marked as processed
  IF NEW.processed = TRUE THEN
    -- Hourly aggregation
    hour_bucket := date_trunc('hour', NEW.created_at);
    
    INSERT INTO analytics.event_aggregations (
      event_type, event_name, time_bucket, granularity,
      event_count, unique_users, unique_sessions, dimensions
    ) VALUES (
      NEW.type, NEW.name, hour_bucket, 'hour',
      1, 
      CASE WHEN NEW.user_id IS NOT NULL THEN 1 ELSE 0 END,
      CASE WHEN NEW.session_id IS NOT NULL THEN 1 ELSE 0 END,
      '{}'::jsonb
    ) 
    ON CONFLICT (event_type, event_name, time_bucket, granularity, dimensions)
    DO UPDATE SET
      event_count = analytics.event_aggregations.event_count + 1,
      unique_users = analytics.event_aggregations.unique_users + 
        CASE WHEN NEW.user_id IS NOT NULL THEN 1 ELSE 0 END,
      unique_sessions = analytics.event_aggregations.unique_sessions + 
        CASE WHEN NEW.session_id IS NOT NULL THEN 1 ELSE 0 END,
      updated_at = NOW();
    
    -- Daily aggregation
    day_bucket := date_trunc('day', NEW.created_at);
    
    INSERT INTO analytics.event_aggregations (
      event_type, event_name, time_bucket, granularity,
      event_count, unique_users, unique_sessions, dimensions
    ) VALUES (
      NEW.type, NEW.name, day_bucket, 'day',
      1, 
      CASE WHEN NEW.user_id IS NOT NULL THEN 1 ELSE 0 END,
      CASE WHEN NEW.session_id IS NOT NULL THEN 1 ELSE 0 END,
      '{}'::jsonb
    ) 
    ON CONFLICT (event_type, event_name, time_bucket, granularity, dimensions)
    DO UPDATE SET
      event_count = analytics.event_aggregations.event_count + 1,
      unique_users = analytics.event_aggregations.unique_users + 
        CASE WHEN NEW.user_id IS NOT NULL THEN 1 ELSE 0 END,
      unique_sessions = analytics.event_aggregations.unique_sessions + 
        CASE WHEN NEW.session_id IS NOT NULL THEN 1 ELSE 0 END,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- EXPERIMENT AUTOMATION FUNCTIONS
-- =============================================================================

-- Function to auto-assign users to experiments
CREATE OR REPLACE FUNCTION auto_assign_experiments(
  user_id_param UUID DEFAULT NULL,
  session_id_param TEXT DEFAULT NULL,
  user_agent_param TEXT DEFAULT NULL,
  ip_address_param INET DEFAULT NULL,
  country_param TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  experiment_record RECORD;
  assignment_record experiments.assignments;
  assignments JSONB := '{}'::JSONB;
  variant_index INTEGER;
BEGIN
  -- Loop through all active experiments
  FOR experiment_record IN 
    SELECT * FROM experiments.experiments 
    WHERE is_active = TRUE 
      AND status = 'running'
      AND (start_date IS NULL OR start_date <= NOW())
      AND (end_date IS NULL OR end_date > NOW())
  LOOP
    -- Check if user is already assigned
    SELECT * INTO assignment_record
    FROM experiments.assignments
    WHERE experiment_id = experiment_record.id
      AND (
        (user_id_param IS NOT NULL AND user_id = user_id_param) 
        OR 
        (session_id_param IS NOT NULL AND session_id = session_id_param)
      );
    
    -- If not assigned, create assignment
    IF assignment_record.id IS NULL THEN
      -- Simple random assignment (can be enhanced with targeting rules)
      variant_index := FLOOR(random() * (array_length(experiment_record.test_variants, 1) + 1));
      
      INSERT INTO experiments.assignments (
        experiment_id, user_id, session_id, variant_id,
        user_agent, ip_address, country, assigned_at
      ) VALUES (
        experiment_record.id, 
        user_id_param, 
        session_id_param,
        CASE 
          WHEN variant_index = 0 THEN (experiment_record.control_variant->>'id')::TEXT
          ELSE (experiment_record.test_variants[variant_index]->>'id')::TEXT
        END,
        user_agent_param,
        ip_address_param,
        country_param,
        NOW()
      ) RETURNING * INTO assignment_record;
    END IF;
    
    -- Add to assignments result
    assignments := assignments || jsonb_build_object(
      experiment_record.name, 
      jsonb_build_object(
        'variant_id', assignment_record.variant_id,
        'experiment_id', assignment_record.experiment_id
      )
    );
  END LOOP;
  
  RETURN assignments;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- DATA CLEANUP AND MAINTENANCE FUNCTIONS
-- =============================================================================

-- Function to cleanup old analytical data
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS TABLE(
  table_name TEXT,
  deleted_count INTEGER,
  cleanup_date TIMESTAMPTZ
) AS $$
DECLARE
  events_deleted INTEGER;
  metrics_deleted INTEGER;
  audit_logs_deleted INTEGER;
BEGIN
  -- Cleanup processed events older than 90 days
  DELETE FROM analytics.events 
  WHERE created_at < NOW() - INTERVAL '90 days' 
    AND processed = TRUE;
  
  GET DIAGNOSTICS events_deleted = ROW_COUNT;
  
  -- Cleanup old metrics (keep aggregated data for 1 year)
  DELETE FROM analytics.metrics 
  WHERE created_at < NOW() - INTERVAL '365 days'
    AND aggregation IS NOT NULL;
  
  GET DIAGNOSTICS metrics_deleted = ROW_COUNT;
  
  -- Cleanup old audit logs (keep for 2 years for compliance)
  DELETE FROM public.audit_logs 
  WHERE created_at < NOW() - INTERVAL '2 years';
  
  GET DIAGNOSTICS audit_logs_deleted = ROW_COUNT;
  
  -- Return cleanup summary
  RETURN QUERY VALUES 
    ('analytics.events', events_deleted, NOW()),
    ('analytics.metrics', metrics_deleted, NOW()),
    ('public.audit_logs', audit_logs_deleted, NOW());
END;
$$ LANGUAGE plpgsql;

-- Function for GDPR data deletion
CREATE OR REPLACE FUNCTION gdpr_delete_user_data(user_email_param CITEXT)
RETURNS JSONB AS $$
DECLARE
  lead_id_found UUID;
  result JSONB := '{}'::JSONB;
  deleted_counts JSONB := '{}'::JSONB;
BEGIN
  -- Find the lead ID
  SELECT id INTO lead_id_found
  FROM marketing.leads
  WHERE email = user_email_param AND deleted_at IS NULL;
  
  IF lead_id_found IS NOT NULL THEN
    -- Soft delete lead (mark as deleted but keep for audit)
    UPDATE marketing.leads 
    SET deleted_at = NOW(),
        email = 'deleted_' || extract(epoch from now())::text || '@deleted.local',
        phone_number = NULL,
        first_name = 'DELETED',
        last_name = 'DELETED', 
        company_name = 'DELETED',
        notes = 'GDPR DELETION - ' || current_date::text
    WHERE id = lead_id_found;
    
    deleted_counts = deleted_counts || jsonb_build_object('leads', 1);
    
    -- Anonymize events (keep for analytics but remove PII)
    UPDATE analytics.events 
    SET user_id = NULL,
        properties = properties - 'email' - 'name' - 'phone',
        metadata = metadata - 'email' - 'user_email'
    WHERE user_id = lead_id_found;
    
    GET DIAGNOSTICS result = ROW_COUNT;
    deleted_counts = deleted_counts || jsonb_build_object('events_anonymized', result::text::integer);
    
    -- Delete onboarding sessions (contains PII)
    DELETE FROM onboarding.sessions WHERE lead_id = lead_id_found;
    GET DIAGNOSTICS result = ROW_COUNT;
    deleted_counts = deleted_counts || jsonb_build_object('onboarding_sessions', result::text::integer);
    
    -- Log GDPR deletion
    INSERT INTO public.audit_logs (
      table_name, operation, row_id, user_email, created_at
    ) VALUES (
      'gdpr_deletion', 'DELETE_USER_DATA', lead_id_found, user_email_param, NOW()
    );
    
    result = jsonb_build_object(
      'success', true,
      'lead_id', lead_id_found,
      'deleted_counts', deleted_counts,
      'deleted_at', NOW()
    );
  ELSE
    result = jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGER ASSIGNMENTS
-- =============================================================================

-- Lead management triggers
CREATE TRIGGER normalize_lead_data_trigger 
  BEFORE INSERT OR UPDATE ON marketing.leads
  FOR EACH ROW EXECUTE FUNCTION normalize_lead_data();

CREATE TRIGGER check_duplicate_leads_trigger 
  BEFORE INSERT ON marketing.leads
  FOR EACH ROW EXECUTE FUNCTION check_duplicate_leads();

-- Onboarding automation triggers
CREATE TRIGGER update_session_activity_trigger 
  BEFORE UPDATE ON onboarding.sessions
  FOR EACH ROW EXECUTE FUNCTION update_session_activity();

CREATE TRIGGER link_session_to_lead_trigger 
  BEFORE INSERT OR UPDATE ON onboarding.sessions
  FOR EACH ROW EXECUTE FUNCTION link_session_to_lead();

-- Analytics automation triggers
CREATE TRIGGER enrich_event_data_trigger 
  BEFORE INSERT ON analytics.events
  FOR EACH ROW EXECUTE FUNCTION enrich_event_data();

CREATE TRIGGER create_event_aggregation_trigger 
  AFTER UPDATE ON analytics.events
  FOR EACH ROW 
  WHEN (NEW.processed = TRUE AND OLD.processed = FALSE)
  EXECUTE FUNCTION create_event_aggregation();

-- =============================================================================
-- SCHEDULED FUNCTIONS (for pg_cron or external scheduling)
-- =============================================================================

-- Function to process unprocessed events (run every 5 minutes)
CREATE OR REPLACE FUNCTION process_pending_events()
RETURNS INTEGER AS $$
DECLARE
  processed_count INTEGER;
BEGIN
  -- Mark events as processed after basic validation
  UPDATE analytics.events 
  SET processed = TRUE,
      processed_at = NOW()
  WHERE processed = FALSE 
    AND created_at < NOW() - INTERVAL '1 minute' -- Wait 1 minute before processing
    AND LENGTH(name) > 0
    AND type IS NOT NULL;
  
  GET DIAGNOSTICS processed_count = ROW_COUNT;
  
  RETURN processed_count;
END;
$$ LANGUAGE plpgsql;

-- Function to abandon inactive sessions (run hourly)
CREATE OR REPLACE FUNCTION abandon_inactive_sessions()
RETURNS INTEGER AS $$
DECLARE
  abandoned_count INTEGER;
BEGIN
  UPDATE onboarding.sessions 
  SET abandoned_at = NOW(),
      status = 'abandoned'
  WHERE status = 'in_progress'
    AND last_activity_at < NOW() - INTERVAL '2 hours'
    AND abandoned_at IS NULL;
  
  GET DIAGNOSTICS abandoned_count = ROW_COUNT;
  
  RETURN abandoned_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON FUNCTION normalize_lead_data() IS 'Normalizes and validates lead data on insert/update';
COMMENT ON FUNCTION check_duplicate_leads() IS 'Prevents duplicate leads and merges data when possible';
COMMENT ON FUNCTION calculate_lead_score(marketing.leads) IS 'Calculates lead scoring based on profile completeness and source';
COMMENT ON FUNCTION update_session_activity() IS 'Manages onboarding session state and auto-progression';
COMMENT ON FUNCTION link_session_to_lead() IS 'Links onboarding sessions to existing leads when possible';
COMMENT ON FUNCTION enrich_event_data() IS 'Enriches analytics events with additional context data';
COMMENT ON FUNCTION create_event_aggregation() IS 'Creates real-time event aggregations for dashboard performance';
COMMENT ON FUNCTION auto_assign_experiments(UUID, TEXT, TEXT, INET, TEXT) IS 'Automatically assigns users to active A/B tests';
COMMENT ON FUNCTION cleanup_old_data() IS 'Cleans up old analytical data according to retention policies';
COMMENT ON FUNCTION gdpr_delete_user_data(CITEXT) IS 'GDPR compliant user data deletion with audit trail';
COMMENT ON FUNCTION process_pending_events() IS 'Batch processes unprocessed analytics events';
COMMENT ON FUNCTION abandon_inactive_sessions() IS 'Marks inactive onboarding sessions as abandoned';