# Production Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Neptunik WhatsApp Cloud Landing platform to production with enterprise-grade security, monitoring, and operational procedures.

## Pre-Deployment Checklist

### Environment Configuration
- [ ] Production environment variables configured in `.env.production`
- [ ] All secrets generated with cryptographically secure methods (32+ characters)
- [ ] Database credentials are production-ready (strong passwords, limited privileges)
- [ ] API keys are production/live keys (not test/sandbox)
- [ ] Webhook URLs point to production endpoints
- [ ] CORS origins configured for production domains only

### Security Configuration
- [ ] CSP (Content Security Policy) configured and tested
- [ ] HSTS (HTTP Strict Transport Security) enabled
- [ ] Security headers implemented (XSS, CSRF protection)
- [ ] Rate limiting configured for API endpoints
- [ ] Webhook signature validation enabled
- [ ] SQL injection protection verified
- [ ] Input validation and sanitization implemented

### Database Setup
- [ ] Production Supabase project created and configured
- [ ] Row Level Security (RLS) policies implemented
- [ ] Database indexes optimized for queries
- [ ] Connection pooling configured
- [ ] Automated backups enabled (daily minimum)
- [ ] Database monitoring configured

### Monitoring & Alerting
- [ ] Sentry error tracking configured and receiving data
- [ ] Vercel Analytics configured
- [ ] PostHog analytics configured
- [ ] Health check endpoints tested (`/api/health`, `/api/status`)
- [ ] Uptime monitoring configured
- [ ] Alert notifications set up (email, Slack)
- [ ] Performance monitoring enabled
- [ ] Log aggregation configured

### SSL & Domain Configuration
- [ ] Production domain configured
- [ ] SSL certificates valid and auto-renewing
- [ ] DNS records configured correctly
- [ ] CDN configured (Vercel/Cloudflare)
- [ ] WWW redirect configured if needed

### Performance Optimization
- [ ] Bundle size analyzed and optimized
- [ ] Image optimization configured
- [ ] Static asset caching configured (1 year for immutable assets)
- [ ] API response caching configured
- [ ] Database query performance optimized
- [ ] Core Web Vitals targets met

## Deployment Steps

### 1. Environment Setup

```bash
# Copy production environment template
cp .env.production.example .env.production

# Generate secure secrets
openssl rand -base64 32  # For NEXTAUTH_SECRET
openssl rand -hex 32     # For WEBHOOK_SECRET
openssl rand -hex 32     # For ENCRYPTION_KEY
```

### 2. Database Migration

```bash
# Run database migrations
supabase db push --project-ref YOUR_PROJECT_REF

# Generate production types
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.ts

# Verify RLS policies
supabase projects api-keys --project-ref YOUR_PROJECT_REF
```

### 3. Build Verification

```bash
# Test production build locally
npm run build
npm run start

# Run full test suite
npm run test:ci

# Verify bundle size
npm run build:analyze
```

### 4. Deployment to Vercel

```bash
# Deploy to production
vercel --prod

# Verify deployment
curl -H "Accept: application/json" https://your-domain.com/api/health
```

### 5. Post-Deployment Verification

```bash
# Health checks
curl https://your-domain.com/api/health
curl https://your-domain.com/api/status

# SSL verification
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Performance test
lighthouse https://your-domain.com --output json
```

## Database Configuration

### Required Tables

```sql
-- Leads table for lead capture
CREATE TABLE public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  message TEXT,
  source TEXT DEFAULT 'landing',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow INSERT for authenticated users" ON public.leads
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow SELECT for service role" ON public.leads
FOR SELECT TO service_role USING (true);
```

### Indexes for Performance

```sql
-- Performance indexes
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_source ON public.leads(source);
```

### Analytics Function

```sql
-- Lead statistics function for metrics
CREATE OR REPLACE FUNCTION get_lead_statistics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total', COUNT(*),
    'today', COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE),
    'this_week', COUNT(*) FILTER (WHERE created_at >= date_trunc('week', CURRENT_DATE)),
    'this_month', COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE))
  )
  INTO result
  FROM public.leads;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Security Configuration

### Required Environment Variables

```bash
# Generate these securely
NEXTAUTH_SECRET=your_very_secure_production_nextauth_secret
WEBHOOK_SECRET=your_production_webhook_secret
ENCRYPTION_KEY=your_32_character_production_encryption_key
SUPABASE_JWT_SECRET=your_production_jwt_secret

# Rate limiting
RATE_LIMIT_MAX=50
RATE_LIMIT_WINDOW=900000
API_RATE_LIMIT_MAX=1000
API_RATE_LIMIT_WINDOW=3600000
```

### Security Headers Verification

Test security headers are correctly applied:

```bash
# Check security headers
curl -I https://your-domain.com

# Expected headers:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
# Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
# Content-Security-Policy: [configured policy]
```

## Monitoring Setup

### Sentry Configuration

```bash
# Environment variables
SENTRY_DSN=https://your_production_sentry_dsn
SENTRY_ORG=your_organization_name
SENTRY_PROJECT=your_project_name
SENTRY_AUTH_TOKEN=your_sentry_auth_token
SENTRY_ENVIRONMENT=production
```

### Health Check Monitoring

Set up external monitoring for:
- `https://your-domain.com/api/health` (every 5 minutes)
- `https://your-domain.com/api/status` (every 15 minutes)
- Core Web Vitals monitoring
- Error rate monitoring (< 0.1%)
- Response time monitoring (< 500ms P95)

### Alert Thresholds

Configure alerts for:
- Error rate > 1%
- Response time P95 > 1000ms
- Database connection failures
- Memory usage > 80%
- Failed health checks (2 consecutive)

## Backup & Disaster Recovery

### Automated Backups

```bash
# Configure automated backups in Supabase
# Daily backups with 30-day retention
# Point-in-time recovery enabled
```

### Manual Backup Procedures

```bash
# Database backup
supabase db dump --project-ref YOUR_PROJECT_REF > backup_$(date +%Y%m%d).sql

# Verify backup
pg_restore --list backup_$(date +%Y%m%d).sql
```

### Disaster Recovery Plan

1. **Data Loss Recovery**
   - Point-in-time recovery available for 7 days
   - Daily backups retained for 30 days
   - Recovery time objective (RTO): 4 hours
   - Recovery point objective (RPO): 24 hours

2. **Service Outage Response**
   - Vercel automatic failover to multiple regions
   - Static assets cached via CDN
   - Database hosted on AWS multi-AZ
   - Expected uptime: 99.9%

## Performance Optimization

### Core Web Vitals Targets

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms  
- **CLS (Cumulative Layout Shift)**: < 0.1

### Caching Strategy

```javascript
// Static assets: 1 year cache
Cache-Control: public, max-age=31536000, immutable

// API responses: Short cache with revalidation
Cache-Control: public, s-maxage=60, stale-while-revalidate=300

// Dynamic pages: No cache
Cache-Control: no-store, must-revalidate
```

## Compliance & Legal

### GDPR Compliance

- [ ] Privacy policy updated and accessible
- [ ] Cookie consent implemented
- [ ] User data export functionality
- [ ] User data deletion functionality
- [ ] Data retention policies configured

### Security Compliance

- [ ] Security audit completed
- [ ] Vulnerability scanning configured
- [ ] Dependency security monitoring
- [ ] Access controls implemented
- [ ] Incident response plan documented

## Rollback Procedures

### Automated Rollback

```bash
# Vercel automatic rollback on failed deployments
# Database migrations are reversible
# Environment variables versioned
```

### Manual Rollback

```bash
# Rollback to previous deployment
vercel rollback https://your-domain.com --timeout=600s

# Database rollback (if needed)
supabase db reset --project-ref YOUR_PROJECT_REF
```

## Go-Live Checklist

### Final Verification

- [ ] All production endpoints responding correctly
- [ ] SSL certificate valid and configured
- [ ] Health checks passing
- [ ] Monitoring receiving data
- [ ] Error tracking configured
- [ ] Performance metrics within targets
- [ ] Security headers configured
- [ ] Rate limiting functional
- [ ] Database connections stable
- [ ] Backup procedures tested
- [ ] Alert notifications working
- [ ] DNS propagation complete
- [ ] CDN cache configured
- [ ] Analytics tracking active

### Post Go-Live

- [ ] Monitor error rates for first 24 hours
- [ ] Verify performance metrics
- [ ] Check log aggregation
- [ ] Validate user flows
- [ ] Monitor business metrics
- [ ] Document any issues found
- [ ] Update status page if applicable
- [ ] Notify stakeholders of successful deployment

## Support & Maintenance

### Regular Maintenance Tasks

**Daily:**
- Review error logs and alerts
- Check system health metrics
- Monitor performance indicators

**Weekly:**
- Review security alerts
- Analyze performance trends
- Update dependencies (security patches)

**Monthly:**
- Full security audit
- Performance optimization review
- Backup recovery testing
- Dependency updates
- Documentation updates

### Emergency Contacts

- **Primary On-Call**: [Contact Information]
- **Secondary On-Call**: [Contact Information]
- **Infrastructure Team**: [Contact Information]
- **Security Team**: [Contact Information]

### Escalation Procedures

1. **P1 (Critical)**: Site down, data loss
   - Response time: 15 minutes
   - All hands on deck

2. **P2 (High)**: Performance degradation
   - Response time: 1 hour
   - Primary team responds

3. **P3 (Medium)**: Minor issues
   - Response time: 4 hours
   - Standard support process

## Conclusion

This production deployment guide ensures enterprise-grade reliability, security, and performance for the Neptunik platform. All procedures should be tested in a staging environment before production deployment.

For questions or issues, refer to the emergency contacts and escalation procedures outlined above.