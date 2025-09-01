# RTK Query + Supabase Integration

Comprehensive RTK Query integration with Supabase for the WhatsApp Cloud Landing platform. This implementation provides type-safe, performant, and feature-rich API management with advanced caching, optimistic updates, and error handling.

## Features

- **🔥 Complete CRUD Operations** - Full Create, Read, Update, Delete operations for all entities
- **⚡ Optimistic Updates** - Instant UI feedback with automatic rollback on errors
- **💾 Intelligent Caching** - Advanced caching strategies with selective invalidation
- **🔄 Real-time Updates** - Supabase realtime subscriptions integration
- **📊 Analytics Tracking** - Comprehensive event tracking and metrics collection
- **🎯 Error Handling** - User-friendly error messages with recovery strategies
- **🎨 Loading States** - Beautiful skeleton screens and loading indicators
- **📱 Mobile Optimized** - Responsive design with touch-friendly interactions
- **♿ Accessibility** - WCAG 2.1 AA compliant components
- **🛡️ Type Safety** - Full TypeScript support with generated Supabase types

## Quick Start

### 1. Import API Hooks

```tsx
import { 
  useGetLeadsQuery,
  useCreateLeadMutation,
  useTrackEventMutation,
  useOnboardingFlow,
  LeadCardSkeleton,
  LoadingStateWrapper
} from '@/store/api';
```

### 2. Basic Usage

```tsx
import React from 'react';
import { useGetLeadsQuery, LeadCardSkeleton, LoadingStateWrapper } from '@/store/api';

const LeadsPage: React.FC = () => {
  const { 
    data: leadsResponse, 
    isLoading, 
    error,
    refetch 
  } = useGetLeadsQuery({
    page: 1,
    limit: 20,
    status: 'new',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Leads</h1>
        <button onClick={refetch} className="btn btn-primary">
          Refresh
        </button>
      </div>

      <LoadingStateWrapper
        isLoading={isLoading}
        error={error}
        isEmpty={!leadsResponse?.data?.length}
        loadingComponent={<LeadCardSkeleton count={5} />}
      >
        <div className="grid gap-4">
          {leadsResponse?.data.map(lead => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      </LoadingStateWrapper>
    </div>
  );
};
```

## API Slices

### Leads API

Complete lead management with CRUD operations, filtering, searching, and analytics.

```tsx
// Query leads with pagination and filters
const { data, isLoading, error } = useGetLeadsQuery({
  page: 1,
  limit: 20,
  status: 'new',
  source: 'landing_page',
  search: 'john@example.com',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});

// Create new lead with optimistic update
const [createLead, { isLoading: isCreating }] = useCreateLeadMutation();

const handleCreateLead = async (formData) => {
  try {
    const newLead = await createLead({
      email: formData.email,
      first_name: formData.firstName,
      last_name: formData.lastName,
      company_name: formData.company,
      source: 'landing_page',
      interested_features: ['whatsapp_api', 'analytics']
    }).unwrap();
    
    console.log('Lead created:', newLead);
    // UI updates automatically via optimistic update
  } catch (error) {
    console.error('Failed to create lead:', error);
    // Error handling with user-friendly messages
  }
};

// Update lead with optimistic update
const [updateLead] = useUpdateLeadMutation();

const handleUpdateLead = async (leadId, updates) => {
  try {
    await updateLead({
      id: leadId,
      updates: {
        status: 'qualified',
        notes: 'Follow up scheduled for next week'
      }
    }).unwrap();
  } catch (error) {
    console.error('Update failed:', error);
  }
};

// Get lead statistics
const { data: stats } = useGetLeadStatsQuery({ days: 30 });

console.log('Conversion rate:', stats?.conversionRate);
console.log('Total leads:', stats?.total);
console.log('By status:', stats?.byStatus);
```

### Analytics API

Event tracking, dashboard metrics, and user journey analytics.

```tsx
// Track events with automatic batching
const { trackEvent, trackBatch, isTracking } = useAnalyticsTracking('user123');

// Track single event
await trackEvent({
  eventName: 'button_clicked',
  eventData: {
    buttonName: 'Get Started',
    page: 'landing',
    section: 'hero'
  }
});

// Track multiple events in batch
await trackBatch([
  {
    eventName: 'page_viewed',
    eventData: { page: 'pricing' }
  },
  {
    eventName: 'feature_explored',
    eventData: { feature: 'whatsapp_api' }
  }
]);

// Get dashboard metrics
const { data: metrics, isLoading } = useGetDashboardMetricsQuery({ days: 7 });

// Real-time dashboard with polling
const { metrics: realtimeMetrics } = useDashboardMetrics(7, 30000); // 30s refresh

// Conversion funnel analysis
const { data: funnelData } = useGetConversionFunnelQuery({
  steps: [
    { stepName: 'Landing Page Visit', eventName: 'page_viewed' },
    { stepName: 'Sign Up Form', eventName: 'signup_form_viewed' },
    { stepName: 'Form Completed', eventName: 'signup_completed' },
    { stepName: 'Email Verified', eventName: 'email_verified' }
  ],
  days: 30
});

console.log('Overall conversion rate:', funnelData?.overallConversionRate);
console.log('Funnel steps:', funnelData?.steps);
```

### Onboarding API

Complete onboarding flow management with step-by-step progress tracking.

```tsx
// Complete onboarding flow hook
const {
  session,
  currentStep,
  completedSteps,
  progressPercentage,
  canProceedToNextStep,
  submitBusinessInfo,
  submitWhatsAppIntegration,
  submitBotConfiguration,
  testIntegration,
  completeOnboarding,
  isSubmittingStep,
  isTestingIntegration,
  stepErrors
} = useOnboardingFlow('user123');

// Step 1: Business Information
const handleBusinessInfoSubmit = async (formData) => {
  try {
    await submitBusinessInfo({
      fullName: formData.fullName,
      companyName: formData.companyName,
      phoneNumber: formData.phoneNumber,
      industry: formData.industry
    });
    // Automatically moves to next step
  } catch (error) {
    console.error('Business info submission failed:', error);
  }
};

// Step 2: WhatsApp Integration
const handleIntegrationSubmit = async (integrationData) => {
  try {
    await submitWhatsAppIntegration({
      phoneNumber: integrationData.phoneNumber,
      phoneNumberId: integrationData.phoneNumberId,
      businessAccountId: integrationData.businessAccountId,
      accessToken: integrationData.accessToken,
      webhookVerifyToken: integrationData.webhookVerifyToken
    });
  } catch (error) {
    console.error('Integration setup failed:', error);
  }
};

// Step 3: Bot Configuration
const handleBotConfigSubmit = async (botConfig) => {
  try {
    await submitBotConfiguration({
      name: botConfig.name,
      welcomeMessage: botConfig.welcomeMessage,
      fallbackMessage: botConfig.fallbackMessage,
      aiEnabled: botConfig.aiEnabled,
      aiModel: 'gpt-3.5-turbo',
      businessHours: {
        enabled: true,
        timezone: 'UTC',
        schedule: [
          { day: 'monday', startTime: '09:00', endTime: '17:00', enabled: true }
        ]
      }
    });
  } catch (error) {
    console.error('Bot configuration failed:', error);
  }
};

// Step 4: Testing
const handleTestIntegration = async () => {
  try {
    const success = await testIntegration();
    if (success) {
      console.log('Integration test passed!');
    }
  } catch (error) {
    console.error('Integration test failed:', error);
  }
};

// Progress indicator component
const OnboardingProgress: React.FC = () => (
  <div className="mb-8">
    <div className="flex justify-between text-sm text-gray-600 mb-2">
      <span>Step {stepOrder.indexOf(currentStep) + 1} of {totalSteps}</span>
      <span>{progressPercentage}% complete</span>
    </div>
    <ProgressBar progress={progressPercentage} />
  </div>
);
```

## Advanced Usage Patterns

### Custom Hooks with Business Logic

```tsx
// Enhanced leads management with business logic
const useLeadManagementWithValidation = () => {
  const { createLead, updateLead, deleteLead, isCreating, isUpdating } = useLeadManagement();
  const { trackEvent } = useAnalyticsTracking();

  const createLeadWithTracking = useCallback(async (leadData) => {
    // Validate data
    if (!leadData.email || !isValidEmail(leadData.email)) {
      throw new Error('Valid email is required');
    }

    try {
      // Create lead
      const newLead = await createLead(leadData);
      
      // Track conversion
      await trackEvent({
        eventName: 'lead_created',
        eventData: {
          source: leadData.source,
          hasPhoneNumber: !!leadData.phone_number,
          hasCompany: !!leadData.company_name
        }
      });

      return newLead;
    } catch (error) {
      // Track failed conversion
      await trackEvent({
        eventName: 'lead_creation_failed',
        eventData: {
          error: error.message,
          source: leadData.source
        }
      });
      throw error;
    }
  }, [createLead, trackEvent]);

  return {
    createLeadWithTracking,
    updateLead,
    deleteLead,
    isCreating,
    isUpdating
  };
};
```

### Real-time Data with Subscriptions

```tsx
// Real-time leads updates
const useRealtimeLeads = (filters = {}) => {
  const queryResult = useGetLeadsQuery(filters, {
    pollingInterval: 30000, // Poll every 30 seconds as fallback
  });

  const dispatch = useDispatch();

  useEffect(() => {
    // Set up real-time subscription
    const unsubscribe = createRealtimeSubscription(
      'leads',
      (payload) => {
        console.log('Real-time update:', payload);
        
        // Update cache based on the payload
        if (payload.eventType === 'INSERT') {
          dispatch(
            leadsApi.util.updateQueryData('getLeads', filters, (draft) => {
              if (draft.data) {
                draft.data.unshift(payload.new);
                draft.count += 1;
              }
            })
          );
        } else if (payload.eventType === 'UPDATE') {
          dispatch(
            leadsApi.util.updateQueryData('getLeads', filters, (draft) => {
              if (draft.data) {
                const index = draft.data.findIndex(lead => lead.id === payload.new.id);
                if (index !== -1) {
                  draft.data[index] = payload.new;
                }
              }
            })
          );
        }
      }
    );

    return unsubscribe;
  }, [dispatch, filters]);

  return queryResult;
};
```

### Error Handling Patterns

```tsx
// Component with comprehensive error handling
const LeadsManagement: React.FC = () => {
  const { leads, isLoading, error } = useLeadsWithPagination();
  const { createLeadWithTracking, isCreating } = useLeadManagementWithValidation();
  const handleError = useErrorHandler('leads_management');

  const onCreateLead = async (formData) => {
    try {
      await createLeadWithTracking(formData);
      toast.success('Lead created successfully!');
    } catch (error) {
      const enhancedError = handleError(error, true);
      
      // Show specific error message based on error category
      if (enhancedError.category === 'validation') {
        setFormErrors(enhancedError.details);
      } else if (enhancedError.category === 'network') {
        toast.error('Connection issue. Please try again.');
      } else {
        toast.error(enhancedError.userMessage);
      }
    }
  };

  if (error) {
    const enhancedError = processError(error);
    return <ErrorBoundary error={enhancedError} onRetry={refetch} />;
  }

  return (
    <LoadingStateWrapper
      isLoading={isLoading}
      error={error}
      isEmpty={!leads.length}
      loadingComponent={<LeadListSkeleton />}
    >
      {/* Your leads UI */}
    </LoadingStateWrapper>
  );
};
```

### Performance Optimization

```tsx
// Optimized component with selective updates
const OptimizedLeadsList: React.FC = () => {
  // Use pagination to limit data
  const { leads, hasNextPage, fetchNextPage } = useInfiniteLeadsQuery();
  
  // Memoize expensive computations
  const leadStats = useMemo(() => {
    return leads.reduce((stats, lead) => {
      stats[lead.status] = (stats[lead.status] || 0) + 1;
      return stats;
    }, {});
  }, [leads]);

  // Virtualize large lists
  const virtualizer = useVirtualizer({
    count: leads.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });

  return (
    <div ref={parentRef} className="h-96 overflow-auto">
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: virtualItem.size,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <LeadCard lead={leads[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Configuration

### API Configuration

```tsx
import { API_CONFIG, QUERY_OPTIONS } from '@/store/api';

// Use predefined configurations
const { data } = useGetLeadsQuery(filters, QUERY_OPTIONS.REAL_TIME);

// Custom configuration
const { data } = useGetLeadsQuery(filters, {
  ...QUERY_OPTIONS.STANDARD,
  keepUnusedDataFor: API_CONFIG.CACHE_TIMES.LONG,
  pollingInterval: API_CONFIG.POLLING_INTERVALS.FREQUENT
});
```

### Environment Variables

```env
# Required Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional configuration
NEXT_PUBLIC_API_BASE_URL=https://api.yourapp.com
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_DEBUG_API=false
```

## Testing

### Mock API Responses

```tsx
// Test utilities for mocking API responses
import { createMockLeadsResponse, createMockAnalyticsData } from '@/store/api/__mocks__';

// In your tests
const mockLeads = createMockLeadsResponse({ count: 5, status: 'new' });

jest.mock('@/store/api', () => ({
  useGetLeadsQuery: () => ({
    data: mockLeads,
    isLoading: false,
    error: null,
  }),
}));
```

### Integration Tests

```tsx
// Integration test example
describe('Leads API Integration', () => {
  it('should create, update, and delete leads', async () => {
    const { result } = renderHook(() => useLeadManagement(), {
      wrapper: createTestWrapper()
    });

    // Create lead
    const leadData = { email: 'test@example.com', source: 'test' };
    await act(async () => {
      const newLead = await result.current.createLead(leadData);
      expect(newLead.email).toBe(leadData.email);
    });

    // Update lead
    await act(async () => {
      await result.current.updateLead(newLead.id, { status: 'qualified' });
    });

    // Delete lead
    await act(async () => {
      await result.current.deleteLead(newLead.id);
    });
  });
});
```

## Best Practices

### 1. Data Fetching Patterns

```tsx
// ✅ Good: Use specific queries for different use cases
const { data: recentLeads } = useGetLeadsQuery({ limit: 10, sortBy: 'created_at' });
const { data: qualifiedLeads } = useGetLeadsQuery({ status: 'qualified' });

// ❌ Avoid: Fetching all data and filtering client-side
const { data: allLeads } = useGetLeadsQuery({ limit: 1000 });
const recentLeads = allLeads?.slice(0, 10);
```

### 2. Error Handling

```tsx
// ✅ Good: Handle errors gracefully with user feedback
const { data, error } = useGetLeadsQuery(params);

if (error) {
  const enhancedError = processError(error);
  return <ErrorMessage error={enhancedError} onRetry={refetch} />;
}

// ❌ Avoid: Ignoring errors or showing technical messages
if (error) {
  console.log(error); // Users won't see this
}
```

### 3. Loading States

```tsx
// ✅ Good: Show appropriate loading states
const { data, isLoading, isFetching } = useGetLeadsQuery(params);

return (
  <LoadingStateWrapper
    isLoading={isLoading}
    loadingComponent={<LeadListSkeleton />}
  >
    {data?.map(lead => <LeadCard key={lead.id} lead={lead} />)}
  </LoadingStateWrapper>
);

// Show refresh indicator for background updates
{isFetching && !isLoading && <RefreshIndicator />}
```

### 4. Optimistic Updates

```tsx
// ✅ Good: Use optimistic updates for better UX
const [updateLead] = useUpdateLeadMutation();

const handleStatusUpdate = async (leadId, newStatus) => {
  try {
    // UI updates immediately, rolls back on error
    await updateLead({ id: leadId, updates: { status: newStatus } }).unwrap();
  } catch (error) {
    // Error handled automatically, UI reverted
    toast.error('Failed to update lead status');
  }
};
```

### 5. Cache Management

```tsx
// ✅ Good: Invalidate related caches appropriately
const [createLead] = useCreateLeadMutation();

// This automatically invalidates lead lists and stats
await createLead(leadData);

// ❌ Avoid: Manual cache management unless necessary
dispatch(leadsApi.util.invalidateTags([{ type: 'Lead', id: 'LIST' }]));
```

## Troubleshooting

### Common Issues

1. **Stale Data**: Ensure proper cache invalidation tags are set
2. **Memory Leaks**: Use `keepUnusedDataFor` to limit cache retention
3. **Network Errors**: Implement retry logic and offline handling
4. **Type Errors**: Regenerate Supabase types after schema changes
5. **Performance**: Use pagination and virtualization for large datasets

### Debug Tools

```tsx
// Enable debug logging in development
import { DEBUG_UTILS } from '@/store/api';

// Log API operations
DEBUG_UTILS?.logOperation('getLeads', params, result);

// Monitor cache hits/misses
DEBUG_UTILS?.logCacheOperation('HIT', 'getLeads');

// Log errors with context
DEBUG_UTILS?.logError('createLead', error);
```

## Migration Guide

### From Legacy API to RTK Query

```tsx
// Before (legacy)
const [leads, setLeads] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  setLoading(true);
  fetchLeads()
    .then(setLeads)
    .finally(() => setLoading(false));
}, []);

// After (RTK Query)
const { data: leads, isLoading } = useGetLeadsQuery();
```

This comprehensive integration provides a solid foundation for building scalable, maintainable, and user-friendly applications with React, RTK Query, and Supabase.