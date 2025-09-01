-- ===============================================================================
-- PRODUCTION OPTIMIZATION MIGRATION
-- ===============================================================================
-- This migration optimizes the database for production workloads
-- Includes indexes, RLS policies, performance optimizations, and monitoring
-- ===============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ===============================================================================
-- CORE TABLES
-- ===============================================================================

-- Leads table for lead capture
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  message TEXT,
  source TEXT DEFAULT 'landing' NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  price_variant TEXT CHECK (price_variant IN ('A', 'B', 'C')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'rejected')),
  quality_score INTEGER DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT leads_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT leads_phone_format CHECK (phone IS NULL OR phone ~* '^\+?[1-9]\d{1,14}$')
);

-- Lead activities tracking
CREATE TABLE IF NOT EXISTS public.lead_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('email_sent', 'email_opened', 'link_clicked', 'form_submitted', 'call_made', 'meeting_scheduled')),
  activity_data JSONB,
  performed_by TEXT,
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  event_data JSONB,
  user_id TEXT,
  session_id TEXT,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  country TEXT,
  region TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- System metrics table
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT,
  metric_tags JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ===============================================================================
-- PERFORMANCE INDEXES
-- ===============================================================================

-- Leads table indexes
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_quality_score ON public.leads(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_updated_at ON public.leads(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_price_variant ON public.leads(price_variant);
CREATE INDEX IF NOT EXISTS idx_leads_utm_source ON public.leads(utm_source) WHERE utm_source IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_country ON public.leads(country) WHERE country IS NOT NULL;

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_leads_source_created_at ON public.leads(source, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status_created_at ON public.leads(status, created_at DESC);

-- Lead activities indexes
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON public.lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_type ON public.lead_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_lead_activities_performed_at ON public.lead_activities(performed_at DESC);

-- Analytics events indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON public.analytics_events(session_id) WHERE session_id IS NOT NULL;

-- System metrics indexes
CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON public.system_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_metrics_recorded_at ON public.system_metrics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_metrics_name_recorded_at ON public.system_metrics(metric_name, recorded_at DESC);

-- ===============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ===============================================================================

-- Enable RLS on all tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

-- Leads RLS policies
CREATE POLICY "Allow INSERT for authenticated users" ON public.leads
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow INSERT for anonymous users" ON public.leads
FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow SELECT for service role" ON public.leads
FOR SELECT TO service_role USING (true);

CREATE POLICY "Allow UPDATE for service role" ON public.leads
FOR UPDATE TO service_role USING (true);

CREATE POLICY "Allow DELETE for service role" ON public.leads
FOR DELETE TO service_role USING (true);

-- Lead activities RLS policies
CREATE POLICY "Allow INSERT for service role" ON public.lead_activities
FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Allow SELECT for service role" ON public.lead_activities
FOR SELECT TO service_role USING (true);

-- Analytics events RLS policies
CREATE POLICY "Allow INSERT for authenticated and anonymous" ON public.analytics_events
FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY "Allow SELECT for service role" ON public.analytics_events
FOR SELECT TO service_role USING (true);

-- System metrics RLS policies
CREATE POLICY "Allow INSERT for service role" ON public.system_metrics
FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Allow SELECT for service role" ON public.system_metrics
FOR SELECT TO service_role USING (true);

-- ===============================================================================
-- TRIGGERS AND FUNCTIONS
-- ===============================================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to leads table
DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Lead quality scoring function
CREATE OR REPLACE FUNCTION calculate_lead_quality(
    lead_email TEXT,
    lead_company TEXT,
    lead_phone TEXT,
    lead_message TEXT,
    lead_source TEXT
)
RETURNS INTEGER AS $$
DECLARE
    quality_score INTEGER := 0;
BEGIN
    -- Email quality (0-20 points)
    IF lead_email IS NOT NULL AND lead_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        quality_score := quality_score + 20;
    END IF;
    
    -- Company provided (0-25 points)
    IF lead_company IS NOT NULL AND LENGTH(TRIM(lead_company)) > 0 THEN
        quality_score := quality_score + 25;
    END IF;
    
    -- Phone provided and valid (0-20 points)
    IF lead_phone IS NOT NULL AND lead_phone ~* '^\+?[1-9]\d{1,14}$' THEN
        quality_score := quality_score + 20;
    END IF;
    
    -- Message quality (0-20 points)
    IF lead_message IS NOT NULL AND LENGTH(TRIM(lead_message)) > 10 THEN
        quality_score := quality_score + 20;
    END IF;
    
    -- Source quality (0-15 points)
    CASE lead_source
        WHEN 'organic' THEN quality_score := quality_score + 15;
        WHEN 'referral' THEN quality_score := quality_score + 12;
        WHEN 'social' THEN quality_score := quality_score + 10;
        WHEN 'paid' THEN quality_score := quality_score + 8;
        ELSE quality_score := quality_score + 5;
    END CASE;
    
    RETURN LEAST(quality_score, 100);
END;
$$ LANGUAGE plpgsql;

-- Auto-calculate quality score on lead insert/update
CREATE OR REPLACE FUNCTION auto_calculate_lead_quality()
RETURNS TRIGGER AS $$
BEGIN
    NEW.quality_score := calculate_lead_quality(
        NEW.email,
        NEW.company,
        NEW.phone,
        NEW.message,
        NEW.source
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply quality scoring trigger
DROP TRIGGER IF EXISTS trigger_auto_calculate_lead_quality ON public.leads;
CREATE TRIGGER trigger_auto_calculate_lead_quality
    BEFORE INSERT OR UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION auto_calculate_lead_quality();

-- ===============================================================================
-- ANALYTICS AND REPORTING FUNCTIONS
-- ===============================================================================

-- Get lead statistics
CREATE OR REPLACE FUNCTION get_lead_statistics()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total', COUNT(*),
        'today', COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE),
        'yesterday', COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE - INTERVAL '1 day'),
        'this_week', COUNT(*) FILTER (WHERE created_at >= date_trunc('week', CURRENT_DATE)),
        'last_week', COUNT(*) FILTER (WHERE created_at >= date_trunc('week', CURRENT_DATE) - INTERVAL '1 week' AND created_at < date_trunc('week', CURRENT_DATE)),
        'this_month', COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE)),
        'last_month', COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '1 month' AND created_at < date_trunc('month', CURRENT_DATE)),
        'avg_quality_score', ROUND(AVG(quality_score), 2),
        'high_quality_leads', COUNT(*) FILTER (WHERE quality_score >= 80),
        'by_source', (
            SELECT json_object_agg(source, count)
            FROM (
                SELECT source, COUNT(*) as count
                FROM public.leads
                GROUP BY source
                ORDER BY count DESC
            ) t
        ),
        'by_status', (
            SELECT json_object_agg(status, count)
            FROM (
                SELECT status, COUNT(*) as count
                FROM public.leads
                GROUP BY status
                ORDER BY count DESC
            ) t
        )
    )
    INTO result
    FROM public.leads;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get conversion funnel data
CREATE OR REPLACE FUNCTION get_conversion_funnel(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'period', json_build_object('start', start_date, 'end', end_date),
        'funnel', json_build_array(
            json_build_object(
                'stage', 'leads',
                'count', COUNT(*),
                'conversion_rate', 100.0
            ),
            json_build_object(
                'stage', 'qualified',
                'count', COUNT(*) FILTER (WHERE status IN ('qualified', 'converted')),
                'conversion_rate', ROUND(
                    (COUNT(*) FILTER (WHERE status IN ('qualified', 'converted')) * 100.0) / NULLIF(COUNT(*), 0), 2
                )
            ),
            json_build_object(
                'stage', 'converted',
                'count', COUNT(*) FILTER (WHERE status = 'converted'),
                'conversion_rate', ROUND(
                    (COUNT(*) FILTER (WHERE status = 'converted') * 100.0) / NULLIF(COUNT(*), 0), 2
                )
            )
        )
    )
    INTO result
    FROM public.leads
    WHERE created_at::date BETWEEN start_date AND end_date;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================================================
-- MONITORING AND HEALTH CHECKS
-- ===============================================================================

-- Database health check function
CREATE OR REPLACE FUNCTION check_database_health()
RETURNS JSON AS $$
DECLARE
    result JSON;
    connection_count INTEGER;
    slow_queries INTEGER;
    table_sizes JSON;
BEGIN
    -- Get connection count
    SELECT COUNT(*) INTO connection_count
    FROM pg_stat_activity
    WHERE state = 'active';
    
    -- Get slow queries count (queries running for more than 30 seconds)
    SELECT COUNT(*) INTO slow_queries
    FROM pg_stat_activity
    WHERE state = 'active'
    AND now() - query_start > INTERVAL '30 seconds';
    
    -- Get table sizes
    SELECT json_object_agg(tablename, pg_size_pretty(total_bytes))
    INTO table_sizes
    FROM (
        SELECT 
            schemaname||'.'||tablename AS tablename,
            pg_total_relation_size(schemaname||'.'||tablename) AS total_bytes
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY total_bytes DESC
        LIMIT 10
    ) t;
    
    SELECT json_build_object(
        'timestamp', NOW(),
        'status', 'healthy',
        'connections', json_build_object(
            'active', connection_count,
            'max_connections', (SELECT setting::int FROM pg_settings WHERE name = 'max_connections')
        ),
        'queries', json_build_object(
            'slow_queries', slow_queries
        ),
        'storage', json_build_object(
            'database_size', pg_size_pretty(pg_database_size(current_database())),
            'largest_tables', table_sizes
        ),
        'performance', json_build_object(
            'cache_hit_ratio', ROUND(
                (SELECT sum(blks_hit) * 100.0 / NULLIF(sum(blks_hit) + sum(blks_read), 0)
                 FROM pg_stat_database
                 WHERE datname = current_database()), 2
            )
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================================================
-- DATA RETENTION AND CLEANUP
-- ===============================================================================

-- Clean up old analytics events (keep 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_analytics_events()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.analytics_events
    WHERE created_at < CURRENT_DATE - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup
    INSERT INTO public.system_metrics (metric_name, metric_value, metric_unit)
    VALUES ('analytics_events_cleaned', deleted_count, 'records');
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean up old system metrics (keep 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_system_metrics()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.system_metrics
    WHERE recorded_at < CURRENT_DATE - INTERVAL '30 days'
    AND metric_name != 'analytics_events_cleaned'; -- Keep cleanup logs longer
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================================================
-- PERFORMANCE OPTIMIZATION
-- ===============================================================================

-- Analyze all tables to update statistics
ANALYZE public.leads;
ANALYZE public.lead_activities;
ANALYZE public.analytics_events;
ANALYZE public.system_metrics;

-- ===============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ===============================================================================

COMMENT ON TABLE public.leads IS 'Lead capture data with quality scoring and UTM tracking';
COMMENT ON TABLE public.lead_activities IS 'Activity tracking for lead nurturing and engagement';
COMMENT ON TABLE public.analytics_events IS 'User behavior and interaction tracking';
COMMENT ON TABLE public.system_metrics IS 'System performance and business metrics';

COMMENT ON FUNCTION get_lead_statistics() IS 'Returns comprehensive lead statistics for dashboard';
COMMENT ON FUNCTION get_conversion_funnel(DATE, DATE) IS 'Returns conversion funnel data for specified period';
COMMENT ON FUNCTION check_database_health() IS 'Returns database health and performance metrics';
COMMENT ON FUNCTION calculate_lead_quality(TEXT, TEXT, TEXT, TEXT, TEXT) IS 'Calculates lead quality score based on provided information';

-- ===============================================================================
-- GRANT PERMISSIONS
-- ===============================================================================

-- Grant appropriate permissions to service role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant limited permissions to authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT INSERT ON public.leads TO authenticated;
GRANT INSERT ON public.analytics_events TO authenticated;

-- Grant minimal permissions to anonymous role
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON public.leads TO anon;
GRANT INSERT ON public.analytics_events TO anon;