# Analytics Module

This module implements comprehensive analytics and event tracking functionality following Clean Architecture principles with proper separation of concerns and SOLID principles.

## Architecture Overview

The module is organized into four main layers:

### 1. Domain Layer (`/domain`)
Contains pure business logic with no external dependencies:

- **Entities**: `Event`, `Metric` - Core analytics objects with behavior
- **Value Objects**: `EventType`, `MetricValue` - Immutable objects representing analytics concepts

**Key Features**:
- Comprehensive event type system with 25+ predefined types
- Flexible metric value system supporting multiple data types (numbers, percentages, durations, bytes, counts, rates)
- Rich event metadata and properties system
- Business rules for event validation and metric calculations

### 2. Application Layer (`/application`)
Orchestrates business logic and defines contracts:

- **Use Cases**: `TrackEvent`, `GetMetrics`, `GenerateReport`
- **Ports**: Repository interfaces for analytics data access

**Key Features**:
- Event tracking with consent management
- Metrics collection and trend analysis
- Automated report generation with multiple sections
- User behavior analytics and performance tracking

### 3. Infrastructure Layer (`/infra`)
Handles external dependencies and technical concerns:

- **Services**: `analytics-api.ts` - RTK Query API integration
- **Adapters**: Repository implementations and browser tracking service

**Key Features**:
- RESTful API integration with comprehensive endpoints
- Browser-based tracking service with session management
- Local storage for offline event queueing
- Privacy-compliant tracking with consent levels

### 4. UI Layer (`/ui`)
React components and hooks for analytics interface:

- **Components**: `MetricsDashboard`, `EventTracker`
- **Hooks**: `useEventTracker`, `useClickTracking`, `useFormTracking`

**Key Features**:
- Real-time metrics dashboard with auto-refresh
- Declarative event tracking with React context
- Automatic scroll depth and time-on-page tracking
- GDPR/privacy-compliant tracking controls

## Usage Examples

### Basic Event Tracking Setup
```tsx
import { EventTrackerProvider, useEventTracker } from './modules/analytics';

export function App() {
  return (
    <EventTrackerProvider
      userId="user123"
      consentLevel="analytics"
      enableAutoTracking={true}
    >
      <YourAppContent />
    </EventTrackerProvider>
  );
}

function YourAppContent() {
  const { trackEvent, trackPageView, trackClick } = useEventTracker();
  
  useEffect(() => {
    trackPageView();
  }, []);

  return (
    <button onClick={() => trackClick('header-cta')}>
      Get Started
    </button>
  );
}
```

### Metrics Dashboard
```tsx
import { MetricsDashboard } from './modules/analytics';

export function AnalyticsPage() {
  return (
    <MetricsDashboard 
      showRealTime={true}
      refreshInterval={30000}
      dateRange={{
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      }}
    />
  );
}
```

### Advanced Tracking Hooks
```tsx
import { 
  useClickTracking, 
  useFormTracking,
  ScrollDepthTracker,
  TimeOnPageTracker 
} from './modules/analytics';

export function TrackedForm() {
  const trackFormSubmit = useFormTracking('newsletter-signup');
  const trackButtonClick = useClickTracking('signup-button');

  const handleSubmit = (formData: any) => {
    trackFormSubmit(formData);
    // Handle actual form submission
  };

  return (
    <div>
      <ScrollDepthTracker thresholds={[25, 50, 75, 100]} />
      <TimeOnPageTracker intervals={[30, 60, 180]} />
      
      <form onSubmit={handleSubmit}>
        <input name="email" type="email" required />
        <button 
          type="submit"
          onClick={(e) => trackButtonClick(e, { position: 'top' })}
        >
          Subscribe
        </button>
      </form>
    </div>
  );
}
```

### Direct Use Case Usage
```tsx
import { 
  TrackEventUseCase,
  GetMetricsUseCase,
  EventType,
  AnalyticsRepositoryAdapter 
} from './modules/analytics';

// In a service or component
const analyticsRepo = new AnalyticsRepositoryAdapter(store);
const trackEvent = new TrackEventUseCase(analyticsRepo, trackingService);

const result = await trackEvent.execute({
  type: EventType.PURCHASE,
  name: 'Product Purchase',
  properties: { 
    product_id: 'prod_123', 
    amount: 99.99, 
    currency: 'USD' 
  },
});
```

## Event Types

The module includes comprehensive event types:

### Page & Navigation
- `PAGE_VIEW` - Page view tracking
- `PAGE_LOAD` - Page load performance
- `ROUTE_CHANGE` - SPA navigation

### User Interactions
- `CLICK` - Click tracking
- `FORM_SUBMIT` - Form submissions
- `FORM_FIELD_FOCUS` - Form field interactions
- `SCROLL` - Scroll behavior
- `SEARCH` - Search queries

### Business Conversions
- `LEAD_GENERATED` - Lead capture
- `SIGNUP_STARTED` / `SIGNUP_COMPLETED` - User registration
- `TRIAL_STARTED` - Trial conversions
- `PURCHASE` - E-commerce transactions
- `SUBSCRIPTION_CREATED` / `SUBSCRIPTION_CANCELLED` - Subscription events

### Product-Specific (WhatsApp Bot Platform)
- `BOT_CREATED` / `BOT_CONFIGURED` / `BOT_ACTIVATED` - Bot lifecycle
- `MESSAGE_SENT` / `MESSAGE_RECEIVED` - Message tracking
- `WEBHOOK_CONFIGURED` - Integration setup
- `INTEGRATION_CONNECTED` - External service connections

### System & Performance
- `PERFORMANCE_METRIC` - Performance data
- `ERROR_OCCURRED` - Error tracking
- `API_REQUEST` / `API_ERROR` - API monitoring

## Metric Types

### Value Types
- **Number**: General numeric values with units
- **Percentage**: Values displayed as percentages
- **Duration**: Time-based metrics (ms, s, m, h)
- **Bytes**: File/data size metrics (B, KB, MB, GB)
- **Count**: Countable items (formatted with K, M, B suffixes)
- **Rate**: Rate-based metrics (per second, per minute, etc.)

### Metric Categories
- **Counter**: Monotonic increasing values
- **Gauge**: Point-in-time values
- **Histogram**: Distribution of values
- **Rate**: Rate of change over time

## API Endpoints

The module expects the following API endpoints:

### Events
- `POST /api/analytics/events` - Track single event
- `POST /api/analytics/events/batch` - Track multiple events
- `GET /api/analytics/events` - Query events
- `GET /api/analytics/events/:id` - Get specific event
- `DELETE /api/analytics/events/:id` - Delete event
- `GET /api/analytics/events/stats` - Event statistics

### Metrics
- `POST /api/analytics/metrics` - Save metric
- `POST /api/analytics/metrics/batch` - Save multiple metrics
- `GET /api/analytics/metrics` - Query metrics
- `GET /api/analytics/metrics/:id` - Get specific metric
- `DELETE /api/analytics/metrics/:id` - Delete metric
- `GET /api/analytics/metrics/trend` - Metric trend analysis
- `GET /api/analytics/metrics/aggregate` - Metric aggregations

### Reporting
- `POST /api/analytics/reports` - Generate report
- `GET /api/analytics/reports` - List reports
- `GET /api/analytics/reports/:id` - Get specific report
- `DELETE /api/analytics/reports/:id` - Delete report

## Privacy & Compliance

### Consent Management
- **None**: No tracking
- **Essential**: System events only
- **Analytics**: Page views and user interactions
- **All**: Complete tracking including custom events

### Data Protection
- Local storage for offline event queueing
- Automatic PII detection and filtering
- Session-based user identification
- Configurable data retention periods

### GDPR/CCPA Compliance
- Explicit consent management
- Right to data deletion
- Data export capabilities
- Anonymization options

## Performance Features

### Efficient Data Collection
- Event batching to reduce API calls
- Local storage for offline scenarios
- Configurable flush intervals
- Automatic retry mechanisms

### Real-time Capabilities
- WebSocket support for live metrics
- Auto-refreshing dashboards
- Real-time alert system
- Live user activity tracking

## Testing Strategy

The module is designed for comprehensive testing:
- Pure domain functions for unit testing
- Mockable repository interfaces
- Separated business logic from UI
- Integration test helpers

## Dependencies

### External Dependencies
- `@reduxjs/toolkit` - State management and RTK Query
- `react` - UI components and hooks
- `lucide-react` - Dashboard icons

### Internal Dependencies
- `components/ui/*` - shadcn/ui components
- `store/api/base-api` - Base RTK Query configuration
- `modules/shared` - Shared domain objects

## Configuration Options

### Tracking Service Config
```typescript
{
  sessionTimeout: 30,        // Session timeout in minutes
  batchSize: 10,            // Events per batch
  flushInterval: 5000,      // Flush interval in milliseconds
  enableLocalStorage: true, // Offline storage
  enableAutoTracking: true, // Automatic page/user tracking
}
```

### Dashboard Config
```typescript
{
  refreshInterval: 30000,   // Auto-refresh interval
  showRealTime: true,       // Enable real-time updates
  compactMode: false,       // Compact UI mode
}
```

## Future Enhancements

- A/B testing integration
- Funnel analysis tools
- Cohort analysis
- Machine learning insights
- Advanced segmentation
- Custom dashboard builder
- Data warehouse integration
- Real-time alerting system