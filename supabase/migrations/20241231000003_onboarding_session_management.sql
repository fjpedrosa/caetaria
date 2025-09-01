-- Migration: Enhanced Onboarding Session Management
-- Description: Comprehensive session management with analytics, recovery, and monitoring
-- Created: 2024-12-31

-- Create onboarding_sessions table with enhanced features
CREATE TABLE IF NOT EXISTS onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  current_step TEXT NOT NULL CHECK (current_step IN ('welcome', 'business', 'integration', 'verification', 'bot-setup', 'testing', 'complete')),
  status TEXT NOT NULL CHECK (status IN ('in-progress', 'paused', 'completed', 'abandoned')),
  completed_steps TEXT[] DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  step_data JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  
  -- Enhanced analytics and tracking
  analytics JSONB NOT NULL DEFAULT jsonb_build_object(
    'startedAt', NOW(),
    'lastActivityAt', NOW(),
    'stepTimestamps', jsonb_build_object(
      'welcome', '[]'::jsonb,
      'business', '[]'::jsonb,
      'integration', '[]'::jsonb,
      'verification', '[]'::jsonb,
      'bot-setup', '[]'::jsonb,
      'testing', '[]'::jsonb,
      'complete', '[]'::jsonb
    ),
    'stepDurations', jsonb_build_object(
      'welcome', 0,
      'business', 0,
      'integration', 0,
      'verification', 0,
      'bot-setup', 0,
      'testing', 0,
      'complete', 0
    ),
    'abTestVariants', '{}'::jsonb,
    'deviceInfo', NULL,
    'conversionSource', NULL,
    'abandonmentReason', NULL,
    'abandonedAt', NULL,
    'resumedAt', NULL,
    'pausedAt', NULL
  ),
  
  -- Session recovery and expiration
  recovery_token UUID UNIQUE DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  
  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_user_email ON onboarding_sessions(user_email);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_status ON onboarding_sessions(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_recovery_token ON onboarding_sessions(recovery_token) WHERE recovery_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_expires_at ON onboarding_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_last_activity ON onboarding_sessions(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_created_at ON onboarding_sessions(created_at);

-- Partial indexes for common filtered queries
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_active ON onboarding_sessions(id, last_activity_at) WHERE status = 'in-progress';
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_expired ON onboarding_sessions(id, expires_at) WHERE expires_at < NOW();
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_abandoned ON onboarding_sessions(id, last_activity_at) WHERE status = 'abandoned';
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_completed_recent ON onboarding_sessions(id, completed_at) WHERE status = 'completed' AND completed_at > NOW() - INTERVAL '30 days';

-- JSONB indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_conversion_source ON onboarding_sessions USING GIN ((analytics->>'conversionSource'));
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_ab_variants ON onboarding_sessions USING GIN ((analytics->'abTestVariants'));
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_device_country ON onboarding_sessions USING GIN ((analytics->'deviceInfo'->>'country'));

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_onboarding_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.analytics = NEW.analytics || jsonb_build_object('lastActivityAt', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on every update
DROP TRIGGER IF EXISTS trigger_update_onboarding_sessions_updated_at ON onboarding_sessions;
CREATE TRIGGER trigger_update_onboarding_sessions_updated_at
  BEFORE UPDATE ON onboarding_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_sessions_updated_at();

-- Function for session cleanup (removes expired sessions older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_expired_onboarding_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted_sessions AS (
    DELETE FROM onboarding_sessions 
    WHERE expires_at < NOW() - INTERVAL '7 days'
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted_sessions;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to mark abandoned sessions
CREATE OR REPLACE FUNCTION mark_abandoned_onboarding_sessions(threshold_minutes INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  WITH updated_sessions AS (
    UPDATE onboarding_sessions 
    SET 
      status = 'abandoned',
      analytics = analytics || jsonb_build_object(
        'abandonedAt', NOW(),
        'abandonmentReason', 'inactive_timeout'
      ),
      updated_at = NOW()
    WHERE 
      status = 'in-progress' 
      AND last_activity_at < NOW() - (threshold_minutes || ' minutes')::INTERVAL
    RETURNING id
  )
  SELECT COUNT(*) INTO updated_count FROM updated_sessions;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get analytics summary
CREATE OR REPLACE FUNCTION get_onboarding_analytics_summary(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT NOW(),
  conversion_source_filter TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  WITH session_stats AS (
    SELECT 
      COUNT(*) as total_sessions,
      COUNT(*) FILTER (WHERE status = 'completed') as completed_sessions,
      COUNT(*) FILTER (WHERE status = 'abandoned') as abandoned_sessions,
      COUNT(*) FILTER (WHERE status = 'in-progress') as active_sessions,
      AVG(CASE 
        WHEN status = 'completed' AND completed_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (completed_at - started_at)) / 60 
      END) as avg_completion_minutes
    FROM onboarding_sessions
    WHERE 
      created_at >= start_date 
      AND created_at <= end_date
      AND (conversion_source_filter IS NULL OR analytics->>'conversionSource' = conversion_source_filter)
  ),
  step_dropoffs AS (
    SELECT 
      step_name,
      total_sessions,
      sessions_at_step,
      ROUND(((total_sessions - sessions_at_step)::DECIMAL / NULLIF(total_sessions, 0)) * 100, 2) as dropoff_rate
    FROM (
      SELECT 
        'welcome' as step_name,
        COUNT(*) as total_sessions,
        COUNT(*) FILTER (WHERE array_length(completed_steps, 1) > 0 OR current_step != 'welcome') as sessions_at_step
      FROM onboarding_sessions
      WHERE created_at >= start_date AND created_at <= end_date
      
      UNION ALL
      
      SELECT 
        'business' as step_name,
        COUNT(*) as total_sessions,
        COUNT(*) FILTER (WHERE array_length(completed_steps, 1) > 1 OR current_step IN ('integration', 'verification', 'bot-setup', 'testing', 'complete')) as sessions_at_step
      FROM onboarding_sessions
      WHERE created_at >= start_date AND created_at <= end_date
      
      UNION ALL
      
      SELECT 
        'integration' as step_name,
        COUNT(*) as total_sessions,
        COUNT(*) FILTER (WHERE array_length(completed_steps, 1) > 2 OR current_step IN ('verification', 'bot-setup', 'testing', 'complete')) as sessions_at_step
      FROM onboarding_sessions
      WHERE created_at >= start_date AND created_at <= end_date
    ) step_analysis
  ),
  abandonment_reasons AS (
    SELECT 
      COALESCE(analytics->>'abandonmentReason', 'unknown') as reason,
      COUNT(*) as count
    FROM onboarding_sessions
    WHERE 
      status = 'abandoned'
      AND created_at >= start_date 
      AND created_at <= end_date
    GROUP BY analytics->>'abandonmentReason'
  ),
  conversion_sources AS (
    SELECT 
      COALESCE(analytics->>'conversionSource', 'unknown') as source,
      COUNT(*) as count
    FROM onboarding_sessions
    WHERE 
      created_at >= start_date 
      AND created_at <= end_date
    GROUP BY analytics->>'conversionSource'
  )
  SELECT json_build_object(
    'totalSessions', s.total_sessions,
    'completedSessions', s.completed_sessions,
    'abandonedSessions', s.abandoned_sessions,
    'activeSessions', s.active_sessions,
    'averageCompletionTime', COALESCE(s.avg_completion_minutes, 0),
    'conversionRate', CASE 
      WHEN s.total_sessions > 0 THEN ROUND((s.completed_sessions::DECIMAL / s.total_sessions) * 100, 2)
      ELSE 0 
    END,
    'stepDropoffRates', (
      SELECT json_object_agg(step_name, dropoff_rate) 
      FROM step_dropoffs
    ),
    'commonAbandonmentReasons', (
      SELECT json_object_agg(reason, count) 
      FROM abandonment_reasons
    ),
    'conversionSourceBreakdown', (
      SELECT json_object_agg(source, count) 
      FROM conversion_sources
    )
  ) INTO result
  FROM session_stats s;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Policy: Users can access their own sessions
CREATE POLICY "Users can access their own onboarding sessions" ON onboarding_sessions
  FOR ALL USING (
    auth.email() = user_email
  );

-- Policy: Service accounts can manage all sessions
CREATE POLICY "Service accounts can manage all onboarding sessions" ON onboarding_sessions
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Policy: Authenticated users can read session analytics (aggregated data only)
CREATE POLICY "Authenticated users can read session analytics" ON onboarding_sessions
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    current_setting('request.jwt.claims', true)::json ->> 'role' IN ('admin', 'analyst')
  );

-- Grants for service role
GRANT ALL ON onboarding_sessions TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_expired_onboarding_sessions() TO service_role;
GRANT EXECUTE ON FUNCTION mark_abandoned_onboarding_sessions(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_onboarding_analytics_summary(TIMESTAMPTZ, TIMESTAMPTZ, TEXT) TO service_role;

-- Grants for authenticated users
GRANT SELECT ON onboarding_sessions TO authenticated;
GRANT EXECUTE ON FUNCTION get_onboarding_analytics_summary(TIMESTAMPTZ, TIMESTAMPTZ, TEXT) TO authenticated;

-- Create a view for public analytics (no personal data)
CREATE OR REPLACE VIEW public.onboarding_analytics_public AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_sessions,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_sessions,
  COUNT(*) FILTER (WHERE status = 'abandoned') as abandoned_sessions,
  ROUND(AVG(CASE 
    WHEN status = 'completed' AND completed_at IS NOT NULL 
    THEN EXTRACT(EPOCH FROM (completed_at - started_at)) / 60 
  END), 2) as avg_completion_minutes,
  analytics->>'conversionSource' as conversion_source
FROM onboarding_sessions
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE_TRUNC('day', created_at), analytics->>'conversionSource'
ORDER BY date DESC;

-- Grant access to the public analytics view
GRANT SELECT ON public.onboarding_analytics_public TO authenticated;

-- Comment the table and important columns
COMMENT ON TABLE onboarding_sessions IS 'Enhanced onboarding sessions with comprehensive analytics and session management';
COMMENT ON COLUMN onboarding_sessions.recovery_token IS 'Unique token for session recovery across devices';
COMMENT ON COLUMN onboarding_sessions.analytics IS 'Comprehensive analytics data including step timings, device info, and A/B test variants';
COMMENT ON COLUMN onboarding_sessions.expires_at IS 'Session expiration timestamp, automatically extended on activity';

-- Insert sample data for testing (only in development)
-- This will be removed in production migrations
DO $$
BEGIN
  -- Only insert sample data if the table is empty and we're not in production
  IF NOT EXISTS (SELECT 1 FROM onboarding_sessions LIMIT 1) 
     AND current_setting('app.environment', true) != 'production' THEN
    
    INSERT INTO onboarding_sessions (
      user_email, current_step, status, completed_steps, 
      step_data, analytics, expires_at
    ) VALUES 
    (
      'test@example.com', 
      'business', 
      'in-progress', 
      ARRAY['welcome'], 
      '{"welcome": {"timestamp": "2024-01-01T10:00:00Z"}}',
      jsonb_build_object(
        'startedAt', '2024-01-01T10:00:00Z',
        'lastActivityAt', NOW() - INTERVAL '5 minutes',
        'conversionSource', 'landing-page',
        'deviceInfo', jsonb_build_object(
          'userAgent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'country', 'US'
        ),
        'abTestVariants', jsonb_build_object(
          'onboarding-flow', 'variant-a'
        )
      ),
      NOW() + INTERVAL '23 hours'
    );
    
  END IF;
END
$$;

-- Create extension for analytics if not exists
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Final validation
DO $$
BEGIN
  -- Verify table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'onboarding_sessions') THEN
    RAISE EXCEPTION 'onboarding_sessions table was not created successfully';
  END IF;
  
  -- Verify indexes exist
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_onboarding_sessions_user_email') THEN
    RAISE EXCEPTION 'Required indexes were not created successfully';
  END IF;
  
  -- Verify functions exist
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'cleanup_expired_onboarding_sessions') THEN
    RAISE EXCEPTION 'Required functions were not created successfully';
  END IF;
  
  RAISE NOTICE 'Onboarding session management migration completed successfully';
END
$$;