-- =============================================================================
-- PERFORMANCE INDEXES
-- =============================================================================
--
-- This migration creates comprehensive indexes optimized for the expected
-- workload of 100-500 leads/day and high-frequency analytics events.
--
-- INDEX STRATEGY:
-- - Query patterns based on application code analysis
-- - Composite indexes for complex filtering
-- - Partial indexes for common conditions
-- - GIN indexes for JSONB and array columns
-- - Time-series optimized indexes for analytics
-- =============================================================================

-- =============================================================================
-- MARKETING SCHEMA INDEXES - Lead management optimization
-- =============================================================================

-- Primary query patterns for leads table
-- 1. Email lookup (authentication, duplicate checking)
CREATE UNIQUE INDEX idx_leads_email_active ON marketing.leads (email) 
WHERE deleted_at IS NULL;

-- 2. Status-based filtering (CRM workflows)  
CREATE INDEX idx_leads_status_created ON marketing.leads (status, created_at DESC) 
WHERE deleted_at IS NULL;

-- 3. Source analysis (marketing attribution)
CREATE INDEX idx_leads_source_created ON marketing.leads (source, created_at DESC);

-- 4. Time-based queries (daily/weekly reports)
CREATE INDEX idx_leads_created_date ON marketing.leads (DATE(created_at), status);

-- 5. Geographic analysis
CREATE INDEX idx_leads_location ON marketing.leads (country_code, region, city) 
WHERE country_code IS NOT NULL;

-- 6. UTM campaign analysis
CREATE INDEX idx_leads_utm_campaign ON marketing.leads (utm_campaign, utm_source, created_at DESC)
WHERE utm_campaign IS NOT NULL;

-- 7. Full-text search on names and company
CREATE INDEX idx_leads_search ON marketing.leads 
USING gin(to_tsvector('english', 
  COALESCE(first_name, '') || ' ' || 
  COALESCE(last_name, '') || ' ' || 
  COALESCE(company_name, '')
));

-- 8. IP-based rate limiting (RLS policies)
CREATE INDEX idx_leads_ip_created ON marketing.leads (ip_address, created_at DESC);

-- 9. Interested features analysis (JSONB array)
CREATE INDEX idx_leads_features ON marketing.leads 
USING gin(interested_features);

-- Lead interactions indexes
-- 1. Lead-based queries (interaction history)
CREATE INDEX idx_lead_interactions_lead_created ON marketing.lead_interactions 
(lead_id, created_at DESC);

-- 2. Type-based analysis
CREATE INDEX idx_lead_interactions_type_outcome ON marketing.lead_interactions 
(interaction_type, outcome, created_at DESC);

-- 3. Scheduled interactions (task management)
CREATE INDEX idx_lead_interactions_scheduled ON marketing.lead_interactions 
(scheduled_at ASC) 
WHERE scheduled_at IS NOT NULL AND completed_at IS NULL;

-- =============================================================================
-- ONBOARDING SCHEMA INDEXES - Session tracking optimization
-- =============================================================================

-- Sessions table indexes
-- 1. Session token lookup (primary access pattern)
CREATE UNIQUE INDEX idx_sessions_token ON onboarding.sessions (session_token);

-- 2. Lead association
CREATE INDEX idx_sessions_lead ON onboarding.sessions (lead_id, created_at DESC)
WHERE lead_id IS NOT NULL;

-- 3. Status and progress analysis
CREATE INDEX idx_sessions_status_progress ON onboarding.sessions 
(status, progress_percentage, created_at DESC);

-- 4. Current step analysis
CREATE INDEX idx_sessions_current_step ON onboarding.sessions 
(current_step, status, last_activity_at DESC);

-- 5. Abandoned session cleanup
CREATE INDEX idx_sessions_abandoned ON onboarding.sessions (abandoned_at ASC)
WHERE abandoned_at IS NOT NULL;

-- 6. Active sessions monitoring
CREATE INDEX idx_sessions_active ON onboarding.sessions (last_activity_at DESC)
WHERE status IN ('not_started', 'in_progress');

-- 7. IP-based rate limiting
CREATE INDEX idx_sessions_ip_created ON onboarding.sessions (ip_address, created_at DESC);

-- 8. Business data search (JSONB)
CREATE INDEX idx_sessions_business_data ON onboarding.sessions 
USING gin(business_data);

-- Step activities indexes
-- 1. Session-based queries (activity timeline)
CREATE INDEX idx_step_activities_session_created ON onboarding.step_activities 
(session_id, created_at DESC);

-- 2. Step analysis
CREATE INDEX idx_step_activities_step_type ON onboarding.step_activities 
(step, activity_type, created_at DESC);

-- 3. Error tracking
CREATE INDEX idx_step_activities_errors ON onboarding.step_activities 
(activity_type, error_message) 
WHERE error_message IS NOT NULL;

-- 4. Time spent analysis
CREATE INDEX idx_step_activities_time_spent ON onboarding.step_activities 
(step, time_spent_seconds DESC) 
WHERE time_spent_seconds IS NOT NULL;

-- =============================================================================
-- ANALYTICS SCHEMA INDEXES - High-performance event tracking
-- =============================================================================

-- Events table indexes (high-volume, time-series data)
-- 1. Time-based queries (most common pattern)
CREATE INDEX idx_events_created_type ON analytics.events (created_at DESC, type);

-- 2. User journey analysis
CREATE INDEX idx_events_user_session ON analytics.events (user_id, session_id, created_at DESC)
WHERE user_id IS NOT NULL;

-- 3. Event type analysis
CREATE INDEX idx_events_type_name_created ON analytics.events (type, name, created_at DESC);

-- 4. Session-based analysis
CREATE INDEX idx_events_session_created ON analytics.events (session_id, created_at DESC)
WHERE session_id IS NOT NULL;

-- 5. Unprocessed events (background processing)
CREATE INDEX idx_events_unprocessed ON analytics.events (processed, created_at ASC)
WHERE processed = false;

-- 6. Geographic analysis
CREATE INDEX idx_events_location ON analytics.events (country, region, created_at DESC)
WHERE country IS NOT NULL;

-- 7. Device and browser analysis
CREATE INDEX idx_events_device_browser ON analytics.events 
(device_type, browser, created_at DESC)
WHERE device_type IS NOT NULL;

-- 8. Properties search (JSONB - most expensive, use carefully)
CREATE INDEX idx_events_properties ON analytics.events 
USING gin(properties);

-- 9. Metadata search
CREATE INDEX idx_events_metadata ON analytics.events 
USING gin(metadata);

-- 10. IP-based rate limiting for events
CREATE INDEX idx_events_ip_created ON analytics.events (ip_address, created_at DESC);

-- Metrics table indexes
-- 1. Time-series queries (primary pattern)
CREATE INDEX idx_metrics_timestamp_name ON analytics.metrics (timestamp DESC, name);

-- 2. Metric name and type analysis
CREATE INDEX idx_metrics_name_type ON analytics.metrics (name, type, timestamp DESC);

-- 3. Source-based analysis
CREATE INDEX idx_metrics_source_created ON analytics.metrics (source, created_at DESC)
WHERE source IS NOT NULL;

-- 4. Time window queries
CREATE INDEX idx_metrics_time_window ON analytics.metrics 
(time_window_start, time_window_end, granularity)
WHERE time_window_start IS NOT NULL;

-- 5. Dimensions search (JSONB)
CREATE INDEX idx_metrics_dimensions ON analytics.metrics 
USING gin(dimensions);

-- 6. Tags analysis (array)
CREATE INDEX idx_metrics_tags ON analytics.metrics 
USING gin(tags);

-- 7. Aggregation type queries
CREATE INDEX idx_metrics_aggregation ON analytics.metrics 
(aggregation, timestamp DESC)
WHERE aggregation IS NOT NULL;

-- Event aggregations table indexes (for dashboard performance)
-- 1. Time bucket queries (primary access pattern)
CREATE UNIQUE INDEX idx_event_agg_unique ON analytics.event_aggregations 
(event_type, event_name, time_bucket, granularity, 
 COALESCE(dimensions, '{}'::jsonb));

-- 2. Time range queries
CREATE INDEX idx_event_agg_time_range ON analytics.event_aggregations 
(time_bucket, granularity, event_type);

-- 3. Event type analysis
CREATE INDEX idx_event_agg_type_name ON analytics.event_aggregations 
(event_type, event_name, time_bucket DESC);

-- 4. Update tracking
CREATE INDEX idx_event_agg_updated ON analytics.event_aggregations (updated_at DESC);

-- =============================================================================
-- EXPERIMENTS SCHEMA INDEXES - A/B testing optimization  
-- =============================================================================

-- Experiments table indexes
-- 1. Active experiments lookup
CREATE INDEX idx_experiments_active ON experiments.experiments 
(is_active, status, start_date, end_date)
WHERE is_active = true AND status = 'running';

-- 2. Name lookup
CREATE UNIQUE INDEX idx_experiments_name ON experiments.experiments (name);

-- 3. Status and date analysis
CREATE INDEX idx_experiments_status_dates ON experiments.experiments 
(status, start_date DESC, end_date DESC);

-- 4. Results analysis
CREATE INDEX idx_experiments_results ON experiments.experiments 
USING gin(results) 
WHERE results IS NOT NULL;

-- Assignments table indexes
-- 1. Experiment and user lookup
CREATE INDEX idx_assignments_experiment_user ON experiments.assignments 
(experiment_id, user_id, session_id)
WHERE user_id IS NOT NULL;

-- 2. User/session assignments lookup
CREATE INDEX idx_assignments_user_session ON experiments.assignments 
(COALESCE(user_id::text, session_id), assigned_at DESC);

-- 3. Experiment analysis
CREATE INDEX idx_assignments_experiment_variant ON experiments.assignments 
(experiment_id, variant_id, assigned_at DESC);

-- 4. Exposure tracking
CREATE INDEX idx_assignments_exposure ON experiments.assignments 
(experiment_id, last_exposure_at DESC)
WHERE last_exposure_at IS NOT NULL;

-- 5. IP-based rate limiting
CREATE INDEX idx_assignments_ip_created ON experiments.assignments 
(ip_address, created_at DESC);

-- =============================================================================
-- WHATSAPP SCHEMA INDEXES - Business API optimization
-- =============================================================================

-- WhatsApp accounts table indexes
-- 1. Lead association
CREATE INDEX idx_whatsapp_accounts_lead ON whatsapp.accounts (lead_id)
WHERE lead_id IS NOT NULL;

-- 2. Business account lookup
CREATE UNIQUE INDEX idx_whatsapp_business_phone ON whatsapp.accounts 
(business_account_id, phone_number_id);

-- 3. Phone number lookup
CREATE INDEX idx_whatsapp_phone ON whatsapp.accounts (phone_number);

-- 4. Active accounts
CREATE INDEX idx_whatsapp_active ON whatsapp.accounts 
(is_active, is_verified, created_at DESC)
WHERE is_active = true;

-- 5. Usage tracking
CREATE INDEX idx_whatsapp_usage ON whatsapp.accounts 
(messages_sent_today, last_message_sent_at DESC)
WHERE messages_sent_today > 0;

-- Templates table indexes
-- 1. Account-based queries
CREATE INDEX idx_templates_account_status ON whatsapp.templates 
(account_id, status, created_at DESC);

-- 2. Template name and category
CREATE INDEX idx_templates_name_category ON whatsapp.templates 
(template_name, category, language);

-- 3. WhatsApp template ID lookup
CREATE INDEX idx_templates_whatsapp_id ON whatsapp.templates 
(whatsapp_template_id)
WHERE whatsapp_template_id IS NOT NULL;

-- 4. Status and approval tracking
CREATE INDEX idx_templates_status ON whatsapp.templates (status, updated_at DESC);

-- 5. Button configuration search
CREATE INDEX idx_templates_buttons ON whatsapp.templates 
USING gin(buttons);

-- =============================================================================
-- SPECIAL INDEXES FOR ANALYTICS AND REPORTING
-- =============================================================================

-- Materialized view support indexes for dashboard performance
-- Lead conversion funnel index
CREATE INDEX idx_leads_conversion_funnel ON marketing.leads 
(source, status, DATE(created_at))
WHERE deleted_at IS NULL;

-- Onboarding funnel index  
CREATE INDEX idx_onboarding_funnel ON onboarding.sessions 
(current_step, status, progress_percentage, DATE(created_at));

-- Event funnel index
CREATE INDEX idx_events_funnel ON analytics.events 
(type, name, DATE(created_at), user_id);

-- Time-series partitioning preparation (for future scaling)
-- These indexes support time-based partitioning strategies

-- Daily partitioning support
CREATE INDEX idx_events_daily_partition ON analytics.events 
(DATE(created_at), id);

CREATE INDEX idx_metrics_daily_partition ON analytics.metrics 
(DATE(timestamp), id);

-- =============================================================================
-- COMPOSITE INDEXES FOR COMPLEX QUERIES
-- =============================================================================

-- Lead scoring and qualification
CREATE INDEX idx_leads_scoring ON marketing.leads 
(source, status, created_at DESC, 
 CASE WHEN company_name IS NOT NULL THEN 1 ELSE 0 END,
 CASE WHEN phone_number IS NOT NULL THEN 1 ELSE 0 END)
WHERE deleted_at IS NULL;

-- Multi-dimensional event analysis
CREATE INDEX idx_events_multi_dim ON analytics.events 
(type, device_type, country, DATE(created_at))
WHERE processed = true;

-- Onboarding drop-off analysis
CREATE INDEX idx_onboarding_dropoff ON onboarding.sessions 
(current_step, status, 
 EXTRACT(EPOCH FROM (last_activity_at - started_at)) / 3600 -- hours spent
)
WHERE status IN ('in_progress', 'abandoned');

-- =============================================================================
-- MAINTENANCE INDEXES - For background jobs and cleanup
-- =============================================================================

-- Old data cleanup indexes
CREATE INDEX idx_events_cleanup ON analytics.events (created_at ASC)
WHERE processed = true;

CREATE INDEX idx_audit_logs_cleanup ON public.audit_logs (created_at ASC);

-- Session cleanup index
CREATE INDEX idx_sessions_cleanup ON onboarding.sessions 
(last_activity_at ASC)
WHERE status = 'abandoned' AND abandoned_at < NOW() - INTERVAL '30 days';

-- =============================================================================
-- INDEX USAGE MONITORING
-- =============================================================================

-- Create a view to monitor index usage (for optimization)
CREATE VIEW public.index_usage_stats AS
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_tup_read,
  idx_tup_fetch,
  idx_scan,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON INDEX idx_leads_email_active IS 'Primary email lookup for authentication and duplicates';
COMMENT ON INDEX idx_events_created_type IS 'Primary time-series index for analytics queries';
COMMENT ON INDEX idx_sessions_token IS 'Primary session access by token';
COMMENT ON INDEX idx_experiments_active IS 'Active experiments for A/B testing assignment';
COMMENT ON INDEX idx_whatsapp_business_phone IS 'WhatsApp Business API account identification';

COMMENT ON VIEW public.index_usage_stats IS 'Monitor index performance and usage patterns';