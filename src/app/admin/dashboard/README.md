# Admin Dashboard

A comprehensive administrative dashboard for monitoring and managing the onboarding platform with real-time capabilities, analytics, and mobile-responsive design.

## 🚀 Features

### Core Features
- **Real-time Monitoring** - Live updates using Supabase real-time subscriptions
- **KPI Dashboard** - Comprehensive metrics with trend analysis and alerts
- **Lead Management** - Advanced lead tracking with filtering, search, and bulk actions
- **Onboarding Monitoring** - Step-by-step session tracking with completion analytics
- **System Health** - Performance monitoring, alerts, and system status
- **Analytics Reports** - User behavior analysis with conversion funnels
- **Export Manager** - CSV/PDF/Excel exports with scheduling capabilities
- **Notification Center** - Real-time notifications with delivery tracking

### Technical Features
- **Role-based Access Control** - Multi-tier permission system
- **Mobile-Responsive Design** - Optimized for all device sizes
- **Authentication** - Secure admin access with session management
- **Real-time Updates** - WebSocket connections with automatic reconnection
- **Performance Optimized** - Lazy loading, caching, and efficient rendering

## 📱 Mobile Responsiveness

The admin dashboard is fully responsive and optimized for:

- **Mobile Devices** (< 768px) - Touch-optimized interface with swipe navigation
- **Tablets** (768px - 1024px) - Balanced layout with grid adjustments
- **Desktop** (> 1024px) - Full feature set with multi-column layouts

### Mobile Features
- Collapsible navigation tabs
- Touch-friendly buttons (44px minimum)
- Horizontal scrolling for tables
- Optimized spacing and typography
- Gesture-based interactions

## 🔐 Authentication & Authorization

### Role Hierarchy
1. **Admin** - Full system access and user management
2. **Manager** - Management functions and team oversight
3. **Analyst** - Data analysis and reporting access
4. **Viewer** - Read-only access to dashboards

### Demo Credentials
```
Email: admin@example.com
Password: admin123
```

### Permission System
- `dashboard:read` - Access to main dashboard
- `leads:read/write/delete` - Lead management permissions
- `analytics:read` - Analytics and reporting access
- `system:read` - System health monitoring
- `exports:create` - Data export capabilities
- `users:manage` - User and role management

## 📊 Dashboard Components

### 1. KPI Dashboard (`/components/kpi-dashboard.tsx`)
- Real-time metrics display
- Trend analysis with visual indicators
- System performance monitoring
- Alert thresholds and notifications

### 2. Lead Management (`/components/lead-management.tsx`)
- Advanced filtering and search
- Bulk actions and status updates
- Real-time lead notifications
- Export capabilities
- Pagination and sorting

### 3. Onboarding Monitor (`/components/onboarding-monitor.tsx`)
- Step-by-step session tracking
- Completion rate analytics
- Bottleneck identification
- User journey visualization

### 4. Notification Center (`/components/notification-center.tsx`)
- Real-time notification feed
- Categorization and filtering
- Delivery status tracking
- Bulk management actions

### 5. System Health (`/components/system-health.tsx`)
- Server performance metrics
- Database connection monitoring
- API response time tracking
- Alert management

### 6. Analytics Reports (`/components/analytics-reports.tsx`)
- Conversion funnel analysis
- User behavior tracking
- Traffic source analysis
- Geographic distribution

### 7. Export Manager (`/components/export-manager.tsx`)
- Multi-format exports (CSV, PDF, Excel)
- Scheduled export jobs
- Email delivery integration
- Custom report generation

## 🛠️ Technical Implementation

### Real-time Architecture
```typescript
// Real-time connection management
const realtimeConnection = useRealtimeConnection();
const leadsSubscription = useRealtimeLeads();
const analyticsSubscription = useRealtimeAnalytics();

// Automatic cache invalidation
useEffect(() => {
  if (leadsSubscription.latestEvent) {
    // Invalidate relevant queries
    // Update UI with optimistic updates
  }
}, [leadsSubscription.latestEvent]);
```

### State Management
- **RTK Query** for server state and caching
- **React State** for local UI state
- **Real-time Subscriptions** for live data updates
- **Optimistic Updates** for immediate UI feedback

### Performance Optimizations
- **Code Splitting** - Dynamic imports for route-level chunks
- **Lazy Loading** - Deferred loading for non-critical components
- **Memoization** - React.memo and useMemo for expensive operations
- **Virtual Scrolling** - For large data sets
- **Debounced Search** - Reduces API calls during typing

### Responsive Design System
```typescript
// Custom responsive hooks
const { isMobile, isTablet, isDesktop } = useResponsive();

// Responsive components
<ResponsiveGrid 
  columns={{ mobile: 1, tablet: 2, desktop: 4 }}
  gap="gap-6"
>
  {/* Content adapts automatically */}
</ResponsiveGrid>
```

## 🎨 Design System

### Color Palette
- **Primary**: Corporate Yellow (`oklch(0.87 0.15 95)`) - Main brand color
- **Success**: Green (`oklch(0.68 0.17 150)`) - Success states
- **Warning**: Amber (`oklch(0.75 0.15 65)`) - Warning states
- **Error**: Red (`oklch(0.62 0.22 25)`) - Error states
- **Info**: Blue (`oklch(0.65 0.18 248)`) - Information

### Typography
- **Inter** - Primary font for UI elements
- **Roboto Mono** - Monospace font for code/data
- **Responsive scaling** - Adjusts based on screen size

### Spacing System
- **Base unit**: 4px
- **Mobile**: Reduced padding and margins
- **Desktop**: Standard spacing with increased whitespace

## 🧪 Testing

### Test Coverage Requirements
- **Domain Layer**: 95% coverage (business logic)
- **Application Layer**: 90% coverage (use cases)
- **UI Components**: 80% coverage (user interactions)
- **Integration**: E2E testing with Playwright

### Testing Tools
- **Jest** - Unit and integration testing
- **React Testing Library** - Component testing
- **Playwright** - End-to-end testing
- **MSW** - API mocking for tests

## 🚀 Deployment

### Environment Variables
```bash
# Required for admin dashboard
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional for enhanced features
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
```

### Build Commands
```bash
# Development
npm run dev:stable        # Optimized stable development
npm run dev:performance   # High performance mode

# Production
npm run build            # Production build
npm run start           # Start production server

# Testing
npm run test:all        # Run all tests
npm run test:e2e        # E2E tests only
```

## 📱 Mobile Performance

### Optimization Strategies
- **Touch Targets** - Minimum 44px for accessibility
- **Gesture Support** - Swipe navigation and touch interactions
- **Viewport Optimization** - Proper scaling and zoom control
- **Image Optimization** - Responsive images with Next.js Image
- **Bundle Splitting** - Route-based code splitting

### Performance Metrics
- **First Contentful Paint** - < 1.5s
- **Largest Contentful Paint** - < 2.5s
- **Cumulative Layout Shift** - < 0.1
- **First Input Delay** - < 100ms

## 🔧 Configuration

### Customization Options
- **Theme Colors** - Easily customizable via CSS variables
- **Layout Breakpoints** - Adjustable responsive breakpoints
- **Polling Intervals** - Configurable real-time update frequencies
- **Cache Duration** - Tunable data cache settings

### Feature Flags
```typescript
const FEATURES = {
  REAL_TIME_ENABLED: true,
  EXPORT_ENABLED: true,
  NOTIFICATIONS_ENABLED: true,
  MOBILE_OPTIMIZED: true,
} as const;
```

## 📚 API Integration

### RTK Query Endpoints
- **Leads API** - CRUD operations with real-time updates
- **Analytics API** - Metrics and reporting data
- **Onboarding API** - Session tracking and monitoring
- **System API** - Health checks and performance metrics

### Real-time Subscriptions
- **Database Changes** - Automatic UI updates
- **System Events** - Live monitoring alerts
- **User Actions** - Cross-session notifications

## 🐛 Error Handling

### Error Boundaries
- **Component-level** - Graceful degradation
- **Route-level** - Fallback UI for page errors
- **Global** - Catch-all error handling

### Monitoring
- **Sentry Integration** - Error tracking and performance monitoring
- **Custom Logging** - Structured logging for debugging
- **User Feedback** - In-app error reporting

## 🔒 Security

### Data Protection
- **Role-based Access** - Fine-grained permissions
- **Input Validation** - Client and server-side validation
- **XSS Protection** - Sanitized outputs and CSP headers
- **CSRF Protection** - Token-based request validation

### Authentication Security
- **Session Management** - Secure session handling
- **Token Expiration** - Automatic logout on expiry
- **Rate Limiting** - API request throttling
- **Audit Logging** - Track admin actions

## 📖 Usage Examples

### Accessing the Dashboard
```typescript
// Navigate to admin dashboard
// Requires authentication and appropriate role
window.location.href = '/admin/dashboard';
```

### Real-time Data Usage
```typescript
// Subscribe to real-time updates
const { data, isLoading } = useGetLeadsQuery({
  pollingInterval: 30000, // 30 seconds
  refetchOnFocus: true,
});

// Handle real-time notifications
useEffect(() => {
  if (leadsSubscription.latestEvent) {
    toast.success(`New lead: ${leadsSubscription.latestEvent.email}`);
  }
}, [leadsSubscription.latestEvent]);
```

### Export Functionality
```typescript
// Create scheduled export
const exportJob = {
  name: 'Daily Leads Report',
  type: 'leads',
  format: 'csv',
  schedule: { frequency: 'daily', time: '09:00' },
  email_recipients: ['admin@example.com'],
};
```

## 🤝 Contributing

### Development Guidelines
1. **Follow TypeScript** - Strict type checking enabled
2. **Use RTK Query** - For all API interactions
3. **Responsive First** - Mobile-first development approach
4. **Test Coverage** - Maintain minimum coverage thresholds
5. **Accessibility** - WCAG 2.1 AA compliance

### Code Style
- **ESLint** - Enforced code style rules
- **Prettier** - Automatic code formatting
- **Conventional Commits** - Standardized commit messages

---

This admin dashboard provides a comprehensive solution for monitoring and managing the onboarding platform with enterprise-grade features, real-time capabilities, and mobile-optimized design.