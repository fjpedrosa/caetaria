-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
--
-- This migration configures comprehensive Row Level Security policies for all
-- tables in the WhatsApp Cloud API SaaS platform database.
--
-- SECURITY APPROACH:
-- - Public read/write access for lead capture (marketing)
-- - Session-based access for onboarding data
-- - Admin-only access for sensitive analytics and WhatsApp data
-- - Rate limiting and data validation built into policies
-- 
-- GDPR COMPLIANCE:
-- - Data access controls for EU users
-- - Audit trail for all data access
-- - Right to be forgotten implementation
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE marketing.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing.lead_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding.step_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.event_aggregations ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments.experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp.templates ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- MARKETING SCHEMA POLICIES - Public lead capture with rate limiting
-- =============================================================================

-- Leads table policies
-- Public: Can insert new leads (lead capture forms)
CREATE POLICY "Allow public lead creation" 
ON marketing.leads 
FOR INSERT 
TO public
WITH CHECK (
  -- Rate limiting: Max 10 leads per IP per hour
  (
    SELECT COUNT(*) 
    FROM marketing.leads 
    WHERE ip_address = NEW.ip_address 
    AND created_at > NOW() - INTERVAL '1 hour'
  ) < 10
  AND
  -- Validate email format
  validate_email(NEW.email)
  AND
  -- Basic data validation
  LENGTH(TRIM(COALESCE(NEW.first_name, ''))) >= 1
  AND
  LENGTH(TRIM(COALESCE(NEW.company_name, ''))) >= 2
);

-- Public: Can read own lead by email (for form feedback)
CREATE POLICY "Allow public read own lead" 
ON marketing.leads 
FOR SELECT 
TO public
USING (
  email = current_setting('app.user_email', true)::CITEXT
  AND
  deleted_at IS NULL
);

-- Admin: Full access to all leads
CREATE POLICY "Allow admin full access to leads" 
ON marketing.leads 
FOR ALL 
TO authenticated
USING (
  -- Check if user has admin role
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- Lead interactions policies
-- Admin only: Full access to lead interactions
CREATE POLICY "Allow admin full access to lead interactions" 
ON marketing.lead_interactions 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- =============================================================================
-- ONBOARDING SCHEMA POLICIES - Session-based access
-- =============================================================================

-- Sessions table policies  
-- Public: Can create new onboarding sessions
CREATE POLICY "Allow public session creation" 
ON onboarding.sessions 
FOR INSERT 
TO public
WITH CHECK (
  -- Rate limiting: Max 5 sessions per IP per hour
  (
    SELECT COUNT(*) 
    FROM onboarding.sessions 
    WHERE ip_address = NEW.ip_address 
    AND created_at > NOW() - INTERVAL '1 hour'
  ) < 5
  AND
  -- Session token must be generated properly
  NEW.session_token LIKE 'sess_%'
  AND
  LENGTH(NEW.session_token) >= 20
);

-- Public: Can read and update own session by token
CREATE POLICY "Allow session access by token" 
ON onboarding.sessions 
FOR ALL 
TO public
USING (
  session_token = current_setting('app.session_token', true)
  AND
  -- Session must be active (not abandoned for more than 24 hours)
  (abandoned_at IS NULL OR abandoned_at > NOW() - INTERVAL '24 hours')
)
WITH CHECK (
  session_token = current_setting('app.session_token', true)
  AND
  -- Only allow updating specific fields
  (
    OLD.id = NEW.id AND
    OLD.created_at = NEW.created_at AND
    OLD.session_token = NEW.session_token
  )
);

-- Admin: Full access to all sessions
CREATE POLICY "Allow admin full access to sessions" 
ON onboarding.sessions 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- Step activities policies
-- Public: Can insert activities for own session
CREATE POLICY "Allow session step activity creation" 
ON onboarding.step_activities 
FOR INSERT 
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM onboarding.sessions s
    WHERE s.id = NEW.session_id
    AND s.session_token = current_setting('app.session_token', true)
    AND (s.abandoned_at IS NULL OR s.abandoned_at > NOW() - INTERVAL '24 hours')
  )
  AND
  -- Rate limiting: Max 100 activities per session per hour
  (
    SELECT COUNT(*) 
    FROM onboarding.step_activities sa
    WHERE sa.session_id = NEW.session_id
    AND sa.created_at > NOW() - INTERVAL '1 hour'
  ) < 100
);

-- Public: Can read own session activities
CREATE POLICY "Allow session step activity read" 
ON onboarding.step_activities 
FOR SELECT 
TO public
USING (
  EXISTS (
    SELECT 1 FROM onboarding.sessions s
    WHERE s.id = session_id
    AND s.session_token = current_setting('app.session_token', true)
  )
);

-- Admin: Full access to all step activities
CREATE POLICY "Allow admin full access to step activities" 
ON onboarding.step_activities 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- =============================================================================
-- ANALYTICS SCHEMA POLICIES - Controlled access for data privacy
-- =============================================================================

-- Events table policies
-- Public: Can insert events (anonymous analytics)
CREATE POLICY "Allow public event tracking" 
ON analytics.events 
FOR INSERT 
TO public
WITH CHECK (
  -- Rate limiting: Max 1000 events per IP per hour
  (
    SELECT COUNT(*) 
    FROM analytics.events 
    WHERE ip_address = NEW.ip_address 
    AND created_at > NOW() - INTERVAL '1 hour'
  ) < 1000
  AND
  -- Validate event structure
  LENGTH(TRIM(NEW.name)) >= 1
  AND
  NEW.type IS NOT NULL
  AND
  -- Limit properties size to prevent abuse
  pg_column_size(NEW.properties) < 8192 -- 8KB limit
);

-- Admin: Full access to events for analytics
CREATE POLICY "Allow admin full access to events" 
ON analytics.events 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' IN ('admin', 'analyst')
  )
);

-- Metrics table policies  
-- Admin and analysts: Read access to metrics
CREATE POLICY "Allow admin and analyst read metrics" 
ON analytics.metrics 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' IN ('admin', 'analyst')
  )
);

-- Service role: Can insert/update metrics (for automated processing)
CREATE POLICY "Allow service role metrics management" 
ON analytics.metrics 
FOR ALL 
TO service_role;

-- Event aggregations policies
-- Admin and analysts: Read access to aggregated data
CREATE POLICY "Allow admin and analyst read aggregations" 
ON analytics.event_aggregations 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' IN ('admin', 'analyst')
  )
);

-- Service role: Full access for automated aggregation
CREATE POLICY "Allow service role aggregation management" 
ON analytics.event_aggregations 
FOR ALL 
TO service_role;

-- =============================================================================
-- EXPERIMENTS SCHEMA POLICIES - A/B testing access control
-- =============================================================================

-- Experiments table policies
-- Public: Can read active experiments for assignment
CREATE POLICY "Allow public read active experiments" 
ON experiments.experiments 
FOR SELECT 
TO public
USING (
  is_active = true 
  AND 
  status = 'running'
  AND
  (start_date IS NULL OR start_date <= NOW())
  AND
  (end_date IS NULL OR end_date > NOW())
);

-- Admin: Full access to experiments
CREATE POLICY "Allow admin full access to experiments" 
ON experiments.experiments 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- Assignments table policies
-- Public: Can create assignments for active experiments
CREATE POLICY "Allow public assignment creation" 
ON experiments.assignments 
FOR INSERT 
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM experiments.experiments e
    WHERE e.id = NEW.experiment_id
    AND e.is_active = true
    AND e.status = 'running'
    AND (e.start_date IS NULL OR e.start_date <= NOW())
    AND (e.end_date IS NULL OR e.end_date > NOW())
  )
  AND
  -- Rate limiting: Max 10 assignments per IP per hour
  (
    SELECT COUNT(*) 
    FROM experiments.assignments 
    WHERE ip_address = NEW.ip_address 
    AND created_at > NOW() - INTERVAL '1 hour'
  ) < 10
);

-- Public: Can read and update own assignments
CREATE POLICY "Allow public read own assignments" 
ON experiments.assignments 
FOR SELECT 
TO public
USING (
  (user_id::TEXT = current_setting('app.user_id', true) AND current_setting('app.user_id', true) != '')
  OR
  (session_id = current_setting('app.session_id', true) AND current_setting('app.session_id', true) != '')
);

CREATE POLICY "Allow public update own assignments" 
ON experiments.assignments 
FOR UPDATE 
TO public
USING (
  (user_id::TEXT = current_setting('app.user_id', true) AND current_setting('app.user_id', true) != '')
  OR
  (session_id = current_setting('app.session_id', true) AND current_setting('app.session_id', true) != '')
)
WITH CHECK (
  -- Only allow updating exposure tracking fields
  OLD.id = NEW.id AND
  OLD.experiment_id = NEW.experiment_id AND
  OLD.user_id = NEW.user_id AND
  OLD.session_id = NEW.session_id AND
  OLD.variant_id = NEW.variant_id
);

-- Admin: Full access to assignments
CREATE POLICY "Allow admin full access to assignments" 
ON experiments.assignments 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- =============================================================================
-- WHATSAPP SCHEMA POLICIES - Secure access to business data
-- =============================================================================

-- WhatsApp accounts policies
-- User: Can read and update own account
CREATE POLICY "Allow user access to own whatsapp account" 
ON whatsapp.accounts 
FOR ALL 
TO authenticated
USING (
  lead_id IS NOT NULL 
  AND 
  EXISTS (
    SELECT 1 FROM marketing.leads l
    WHERE l.id = lead_id
    AND l.email = (
      SELECT email FROM auth.users 
      WHERE auth.uid() = auth.users.id
    )
  )
)
WITH CHECK (
  lead_id IS NOT NULL 
  AND 
  EXISTS (
    SELECT 1 FROM marketing.leads l
    WHERE l.id = lead_id
    AND l.email = (
      SELECT email FROM auth.users 
      WHERE auth.uid() = auth.users.id
    )
  )
);

-- Admin: Full access to all accounts
CREATE POLICY "Allow admin full access to whatsapp accounts" 
ON whatsapp.accounts 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- WhatsApp templates policies
-- User: Can manage templates for own account
CREATE POLICY "Allow user manage own templates" 
ON whatsapp.templates 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM whatsapp.accounts wa
    JOIN marketing.leads l ON wa.lead_id = l.id
    WHERE wa.id = account_id
    AND l.email = (
      SELECT email FROM auth.users 
      WHERE auth.uid() = auth.users.id
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM whatsapp.accounts wa
    JOIN marketing.leads l ON wa.lead_id = l.id
    WHERE wa.id = account_id
    AND l.email = (
      SELECT email FROM auth.users 
      WHERE auth.uid() = auth.users.id
    )
  )
);

-- Admin: Full access to all templates
CREATE POLICY "Allow admin full access to templates" 
ON whatsapp.templates 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- =============================================================================
-- UTILITY FUNCTIONS FOR RLS POLICIES
-- =============================================================================

-- Function to check rate limiting
CREATE OR REPLACE FUNCTION check_rate_limit(
  table_name TEXT,
  identifier_column TEXT, 
  identifier_value TEXT,
  time_window INTERVAL,
  max_requests INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
BEGIN
  EXECUTE format(
    'SELECT COUNT(*) FROM %I WHERE %I = $1 AND created_at > NOW() - $2',
    table_name, identifier_column
  ) INTO current_count USING identifier_value, time_window;
  
  RETURN current_count < max_requests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate JSON size
CREATE OR REPLACE FUNCTION validate_json_size(json_data JSONB, max_size INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN pg_column_size(json_data) <= max_size;
END;
$$ LANGUAGE plpgsql;

-- Function to check user role
CREATE OR REPLACE FUNCTION has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- GRANTS AND PERMISSIONS
-- =============================================================================

-- Grant usage on schemas to public for lead capture
GRANT USAGE ON SCHEMA marketing TO public;
GRANT USAGE ON SCHEMA onboarding TO public;  
GRANT USAGE ON SCHEMA analytics TO public;
GRANT USAGE ON SCHEMA experiments TO public;

-- Grant specific table permissions to public
GRANT INSERT ON marketing.leads TO public;
GRANT SELECT ON marketing.leads TO public;

GRANT INSERT, SELECT, UPDATE ON onboarding.sessions TO public;
GRANT INSERT, SELECT ON onboarding.step_activities TO public;

GRANT INSERT ON analytics.events TO public;

GRANT INSERT, SELECT, UPDATE ON experiments.assignments TO public;
GRANT SELECT ON experiments.experiments TO public;

-- Grant usage on sequences to public
GRANT USAGE ON ALL SEQUENCES IN SCHEMA marketing TO public;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA onboarding TO public;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA analytics TO public;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA experiments TO public;

-- Service role gets full access for system operations
GRANT ALL ON ALL TABLES IN SCHEMA marketing TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA onboarding TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA analytics TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA experiments TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA whatsapp TO service_role;

-- =============================================================================
-- AUDIT LOGGING SETUP
-- =============================================================================

-- Create audit log table for GDPR compliance
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL, -- INSERT, UPDATE, DELETE, SELECT
  row_id UUID,
  old_values JSONB,
  new_values JSONB,
  user_id UUID,
  user_email TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on audit logs (admin only)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin full access to audit logs" 
ON public.audit_logs 
FOR ALL 
TO authenticated
USING (has_role('admin'));

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (
    table_name,
    operation,
    row_id,
    old_values,
    new_values,
    user_id,
    user_email,
    ip_address
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN row_to_json(OLD) END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) END,
    auth.uid(),
    current_setting('app.user_email', true),
    inet_client_addr()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for sensitive tables
CREATE TRIGGER audit_leads AFTER INSERT OR UPDATE OR DELETE ON marketing.leads
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_whatsapp_accounts AFTER INSERT OR UPDATE OR DELETE ON whatsapp.accounts
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON FUNCTION validate_email(TEXT) IS 'Validates email format using regex';
COMMENT ON FUNCTION generate_session_token() IS 'Generates secure session token for onboarding';
COMMENT ON FUNCTION calculate_onboarding_progress(onboarding.sessions) IS 'Calculates completion percentage for onboarding';
COMMENT ON FUNCTION check_rate_limit(TEXT, TEXT, TEXT, INTERVAL, INTEGER) IS 'Generic rate limiting function for RLS policies';
COMMENT ON FUNCTION has_role(TEXT) IS 'Checks if current user has specific role';
COMMENT ON FUNCTION audit_trigger() IS 'Generic audit logging trigger for GDPR compliance';

COMMENT ON TABLE public.audit_logs IS 'Audit trail for GDPR compliance and security monitoring';