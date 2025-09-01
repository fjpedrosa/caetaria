# Onboarding Session Management System

## Overview

This document describes the comprehensive onboarding session management system implemented for Task 2.3. The system provides advanced session management capabilities including state persistence, analytics tracking, abandonment recovery, and multi-device synchronization.

## Architecture

### Domain Layer Enhancements

#### Enhanced Session Entity
```typescript
interface OnboardingSession {
  readonly id: OnboardingSessionId;
  readonly userEmail: Email;
  readonly currentStep: OnboardingStep;
  readonly status: OnboardingStatus;
  readonly completedSteps: OnboardingStep[];
  readonly startedAt: Date;
  readonly lastActivityAt: Date;
  readonly completedAt?: Date;
  readonly stepData: OnboardingStepData;
  readonly metadata?: Record<string, unknown>;
  readonly analytics: SessionAnalytics;      // NEW: Comprehensive analytics
  readonly recoveryToken?: string;            // NEW: Recovery mechanism
  readonly expiresAt: Date;                  // NEW: Session expiration
}
```

#### Session Analytics
```typescript
interface SessionAnalytics {
  readonly startedAt: Date;
  readonly lastActivityAt: Date;
  readonly completedAt?: Date;
  readonly abandonedAt?: Date;
  readonly resumedAt?: Date;
  readonly pausedAt?: Date;
  readonly stepTimestamps: Record<OnboardingStep, Date[]>;
  readonly stepDurations: Record<OnboardingStep, number>;
  readonly deviceInfo?: {
    readonly userAgent: string;
    readonly ip: string;
    readonly country?: string;
    readonly city?: string;
  };
  readonly abTestVariants: Record<string, string>;
  readonly conversionSource?: string;
  readonly abandonmentReason?: string;
}
```

### Application Layer Services

#### SessionManagementService
High-level orchestration service for session operations:
- **Session Recovery**: Recover expired or interrupted sessions
- **Abandonment Tracking**: Identify and mark abandoned sessions
- **Multi-device Sync**: Synchronize session state across devices
- **Analytics**: Generate comprehensive session analytics
- **Cleanup**: Automated cleanup of expired sessions

#### Enhanced Use Cases
- **ManageSessionUseCase**: Comprehensive session management operations
- **Enhanced StartOnboardingUseCase**: Includes device tracking and A/B test support

### Infrastructure Layer

#### SupabaseOnboardingRepository
Production-ready Supabase implementation with:
- Full CRUD operations
- Advanced querying capabilities
- Analytics aggregation
- Bulk operations for cleanup

#### SessionMonitoringService
Background monitoring service featuring:
- Automated cleanup cycles
- Health metrics monitoring
- Alert generation
- Notification system integration

## Database Schema

### Supabase Table Structure

```sql
CREATE TABLE onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  current_step TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('in-progress', 'paused', 'completed', 'abandoned')),
  completed_steps TEXT[] DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  step_data JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  analytics JSONB NOT NULL DEFAULT '{
    "startedAt": null,
    "lastActivityAt": null,
    "stepTimestamps": {},
    "stepDurations": {},
    "abTestVariants": {},
    "deviceInfo": null,
    "conversionSource": null
  }',
  recovery_token UUID UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_onboarding_sessions_user_email ON onboarding_sessions(user_email);
CREATE INDEX idx_onboarding_sessions_status ON onboarding_sessions(status);
CREATE INDEX idx_onboarding_sessions_recovery_token ON onboarding_sessions(recovery_token);
CREATE INDEX idx_onboarding_sessions_expires_at ON onboarding_sessions(expires_at);
CREATE INDEX idx_onboarding_sessions_last_activity ON onboarding_sessions(last_activity_at);
CREATE INDEX idx_onboarding_sessions_created_at ON onboarding_sessions(created_at);

-- Partial indexes for common queries
CREATE INDEX idx_onboarding_sessions_active ON onboarding_sessions(id) WHERE status = 'in-progress';
CREATE INDEX idx_onboarding_sessions_expired ON onboarding_sessions(id) WHERE expires_at < NOW();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_onboarding_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER trigger_update_onboarding_sessions_updated_at
  BEFORE UPDATE ON onboarding_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_sessions_updated_at();
```

### Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to access their own sessions
CREATE POLICY "Users can access their own sessions" ON onboarding_sessions
  FOR ALL USING (auth.email() = user_email);

-- Policy for service accounts to manage all sessions
CREATE POLICY "Service accounts can manage all sessions" ON onboarding_sessions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
```

## API Endpoints

### Core Session Management

#### POST /api/onboarding
Start new onboarding session or resume existing one.

**Request Body:**
```json
{
  "userEmail": "user@example.com",
  "conversionSource": "landing-page",
  "abTestVariants": {
    "onboarding-flow": "variant-b",
    "ui-theme": "modern"
  }
}
```

**Response:**
```json
{
  "sessionId": "uuid",
  "currentStep": "welcome",
  "status": "in-progress",
  "progress": 0,
  "recoveryToken": "uuid",
  "expiresAt": "2024-01-01T12:00:00Z"
}
```

#### GET /api/onboarding?email=user@example.com
Get existing session by email.

#### GET /api/onboarding?recoveryToken=uuid
Recover session using recovery token.

### Session Management

#### GET /api/onboarding/sessions/[sessionId]
Get detailed session information and analytics summary.

#### PUT /api/onboarding/sessions/[sessionId]
Update session with various actions:

**Synchronization:**
```json
{
  "action": "sync",
  "clientVersion": 2
}
```

**Pause Session:**
```json
{
  "action": "pause",
  "reason": "user_requested"
}
```

**Resume Session:**
```json
{
  "action": "resume"
}
```

**A/B Test Variant:**
```json
{
  "action": "abtest",
  "testName": "checkout-flow",
  "variant": "simplified"
}
```

#### DELETE /api/onboarding/sessions/[sessionId]
Delete session permanently.

### Recovery System

#### POST /api/onboarding/recover
Recover session using recovery token with automatic expiry extension.

**Request Body:**
```json
{
  "recoveryToken": "uuid"
}
```

**Response:**
```json
{
  "sessionId": "uuid",
  "currentStep": "business",
  "status": "in-progress",
  "progress": 33,
  "completedSteps": ["welcome", "business"],
  "stepData": { ... },
  "recovery": {
    "wasExpired": true,
    "wasExtended": true,
    "recoveredAt": "2024-01-01T12:00:00Z"
  }
}
```

#### GET /api/onboarding/recover?email=user@example.com
Generate recovery information for email.

### Analytics & Monitoring

#### GET /api/onboarding/analytics
Comprehensive onboarding analytics.

**Query Parameters:**
- `startDate`: ISO 8601 date string
- `endDate`: ISO 8601 date string  
- `conversionSource`: Filter by source

**Response:**
```json
{
  "totalSessions": 1250,
  "completedSessions": 892,
  "abandonedSessions": 258,
  "averageCompletionTime": 12.5,
  "conversionRate": 71.36,
  "activeSessions": 42,
  "stepDropoffRates": {
    "welcome": 5.2,
    "business": 12.8,
    "verification": 18.3,
    "integration": 24.1,
    "bot-setup": 8.7,
    "testing": 3.2
  },
  "commonAbandonmentReasons": {
    "inactive_timeout": 145,
    "user_requested": 28,
    "technical_error": 15
  },
  "conversionSourceBreakdown": {
    "landing-page": 650,
    "social-media": 320,
    "email-campaign": 180,
    "direct": 100
  }
}
```

### Management & Cleanup

#### POST /api/onboarding/management
Administrative operations.

**Cleanup Operation:**
```json
{
  "action": "cleanup"
}
```

**Track Abandonment:**
```json
{
  "action": "track-abandonment",
  "abandonmentThresholdMinutes": 30
}
```

**Get Active Count:**
```json
{
  "action": "get-active-count"
}
```

#### GET /api/onboarding/management?status=abandoned
Get sessions by status for monitoring.

## Features

### 1. Session Persistence & Recovery
- **Automatic Recovery**: Sessions can be recovered using recovery tokens
- **Expiry Management**: Configurable session expiration with automatic extension
- **Cross-device Continuity**: Resume sessions on different devices

### 2. Advanced Analytics
- **Step-by-step Tracking**: Detailed timing and progression analytics
- **Device Information**: Track user agent, IP, location data
- **A/B Testing**: Built-in support for experiment tracking
- **Conversion Attribution**: Track conversion sources and campaign effectiveness

### 3. Abandonment Prevention
- **Proactive Detection**: Identify sessions at risk of abandonment
- **Automated Marking**: Mark inactive sessions as abandoned
- **Recovery Campaigns**: Generate recovery links for re-engagement

### 4. Multi-device Synchronization
- **Conflict Detection**: Identify version conflicts between devices
- **State Merging**: Intelligent merging of session state
- **Device Tracking**: Monitor session usage across devices

### 5. Performance & Scalability
- **Background Monitoring**: Automated cleanup and health monitoring
- **Efficient Querying**: Optimized database indexes and queries
- **Bulk Operations**: Efficient batch processing for cleanup

### 6. Security & Privacy
- **Recovery Tokens**: Secure session recovery mechanism
- **Data Expiration**: Automatic cleanup of expired data
- **Privacy Controls**: Configurable data retention policies

## Monitoring & Alerts

### Health Metrics
- Active session count
- Completion rates
- Average completion time
- Abandonment rates by step
- System error rates

### Automated Alerts
- **High Abandonment**: Alert when abandonment rate exceeds thresholds
- **System Errors**: Monitor for technical issues
- **Resource Usage**: Track active session limits
- **Data Quality**: Monitor for data inconsistencies

### Background Jobs
- **Session Cleanup**: Remove expired sessions
- **Abandonment Tracking**: Mark inactive sessions
- **Health Monitoring**: Generate system health reports
- **Notification Dispatch**: Send administrative alerts

## Usage Examples

### Starting Enhanced Session
```typescript
import { createStartOnboardingUseCase } from './modules/onboarding';

const startOnboarding = createStartOnboardingUseCase({ onboardingRepository });

const result = await startOnboarding.execute({
  userEmail: 'user@example.com',
  conversionSource: 'landing-page',
  deviceInfo: {
    userAgent: req.headers['user-agent'],
    ip: req.ip,
    country: req.headers['cf-ipcountry'],
  },
  abTestVariants: {
    'onboarding-flow': 'variant-b'
  }
});
```

### Session Recovery
```typescript
import { createManageSessionUseCases } from './modules/onboarding';

const sessionUseCases = createManageSessionUseCases({ onboardingRepository });

const recovery = await sessionUseCases.recoverSession({
  recoveryToken: 'user-provided-token'
});

if (recovery.data.wasExpired) {
  console.log('Session was expired but recovered successfully');
}
```

### Analytics Dashboard
```typescript
const analytics = await sessionUseCases.getSessionAnalytics({
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
  conversionSource: 'landing-page'
});

console.log(`Conversion rate: ${analytics.data.conversionRate}%`);
```

### Background Monitoring
```typescript
import { SessionMonitoringService } from './modules/onboarding';

const monitoring = new SessionMonitoringService(
  onboardingRepository,
  sessionManagementService
);

monitoring.start(); // Starts background monitoring

const healthMetrics = await monitoring.getHealthMetrics();
console.log('Active sessions:', healthMetrics.activeSessions);
```

## Configuration

### Environment Variables
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Session Configuration
ONBOARDING_SESSION_TIMEOUT_HOURS=24
ONBOARDING_ABANDONMENT_THRESHOLD_MINUTES=30
ONBOARDING_CLEANUP_INTERVAL_MINUTES=60

# Monitoring Configuration
ENABLE_SESSION_MONITORING=true
MONITORING_ALERT_THRESHOLD_ABANDONMENT=50
MONITORING_ALERT_THRESHOLD_ERRORS=5
```

### Monitoring Configuration
```typescript
const monitoringConfig: MonitoringConfig = {
  abandonmentThresholdMinutes: 30,
  cleanupIntervalMinutes: 60,
  maxRetries: 3,
  enableNotifications: true,
};
```

## Testing

### Unit Tests
- Domain entity functions
- Use case logic
- Repository adapter methods
- Service layer operations

### Integration Tests
- Database operations
- API endpoint responses
- Session recovery flows
- Analytics calculations

### E2E Tests
- Complete onboarding flows
- Session recovery scenarios
- Multi-device synchronization
- Abandonment tracking

## Performance Considerations

### Database Optimization
- Strategic indexing for common queries
- Partial indexes for filtered queries
- JSONB indexes for analytics queries
- Automated cleanup of old data

### Caching Strategy
- Session data caching in Redis
- Analytics result caching
- Recovery token validation caching
- Device information caching

### Scalability
- Horizontal database scaling
- Background job distribution
- Load balancing for API endpoints
- CDN caching for static analytics

## Security

### Data Protection
- Encrypted recovery tokens
- PII data handling compliance
- Secure session expiration
- Access control with RLS

### API Security
- Rate limiting on recovery endpoints
- Input validation and sanitization
- SQL injection prevention
- XSS protection

## Future Enhancements

### Planned Features
- Real-time session synchronization with WebSockets
- Machine learning-based abandonment prediction
- Advanced segmentation and cohort analysis
- Integration with external analytics platforms

### Scaling Considerations
- Microservices architecture split
- Event-driven architecture with queues
- Advanced caching strategies
- Multi-region deployment support

## Support

### Documentation
- API documentation with OpenAPI specs
- SDK documentation for client libraries
- Integration guides for different platforms
- Troubleshooting guides

### Monitoring
- Comprehensive logging
- Error tracking with Sentry
- Performance monitoring
- Business metrics dashboards