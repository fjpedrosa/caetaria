# Redux Toolkit with RTK Query Usage Examples

## Basic Setup

The Redux store is already configured in the application layout. All components wrapped within the `StoreProvider` can use Redux hooks.

## Importing Hooks and Services

```typescript
// Import typed hooks
import { useAppDispatch, useAppSelector } from '@/store/hooks'

// Import API services
import {
  useCreateLeadMutation,
  useGetLeadsQuery,
  useSubmitContactFormMutation,
  useRequestDemoMutation,
} from '@/modules/landing/infra/services/landing-api.service'

import {
  useCreateOnboardingSessionMutation,
  useGetOnboardingSessionQuery,
  useSubmitBusinessInfoMutation,
} from '@/modules/onboarding/infra/services/onboarding-api.service'
```

## Landing Module Examples

### Contact Form Component

```tsx
import { useSubmitContactFormMutation } from '@/modules/landing/infra/services/landing-api.service'

function ContactForm() {
  const [submitContact, { isLoading, isSuccess, error }] = useSubmitContactFormMutation()

  const handleSubmit = async (formData: {
    name: string
    email: string
    message: string
  }) => {
    try {
      await submitContact({
        name: formData.name,
        email: formData.email,
        phoneNumber: undefined,
        companyName: undefined,
        message: formData.message,
      }).unwrap()
      // Handle success
    } catch (err) {
      // Handle error
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}
```

### Demo Request Component

```tsx
import { useRequestDemoMutation } from '@/modules/landing/infra/services/landing-api.service'

function DemoRequestForm() {
  const [requestDemo, { isLoading, isSuccess }] = useRequestDemoMutation()

  const handleDemoRequest = async (data: {
    name: string
    email: string
    companyName: string
  }) => {
    await requestDemo({
      name: data.name,
      email: data.email,
      companyName: data.companyName,
      interestedFeatures: ['whatsapp-integration', 'analytics'],
    })
  }

  return (
    // Demo request form implementation
  )
}
```

### Analytics Dashboard

```tsx
import { useGetLeadAnalyticsQuery } from '@/modules/landing/infra/services/landing-api.service'

function AnalyticsDashboard() {
  const { data: analytics, isLoading, error } = useGetLeadAnalyticsQuery({
    startDate: '2024-01-01',
    endDate: '2024-12-31',
  })

  if (isLoading) return <div>Loading analytics...</div>
  if (error) return <div>Error loading analytics</div>

  return (
    <div>
      <h2>Lead Analytics</h2>
      <p>Total Leads: {analytics?.totalLeads}</p>
      <p>Conversion Rate: {analytics?.conversionRate}%</p>
      {/* More analytics display */}
    </div>
  )
}
```

## Onboarding Module Examples

### Onboarding Session Management

```tsx
import {
  useCreateOnboardingSessionMutation,
  useGetOnboardingSessionQuery,
} from '@/modules/onboarding/infra/services/onboarding-api.service'

function OnboardingFlow({ userEmail }: { userEmail: string }) {
  const [createSession] = useCreateOnboardingSessionMutation()
  const [sessionId, setSessionId] = useState<string | null>(null)
  
  const { data: session, isLoading } = useGetOnboardingSessionQuery(sessionId!, {
    skip: !sessionId,
  })

  const startOnboarding = async () => {
    const result = await createSession({ userEmail })
    if ('data' in result) {
      setSessionId(result.data.id)
    }
  }

  return (
    <div>
      {!sessionId ? (
        <button onClick={startOnboarding}>Start Onboarding</button>
      ) : (
        <OnboardingSteps session={session} />
      )}
    </div>
  )
}
```

### Business Info Step

```tsx
import { useSubmitBusinessInfoMutation } from '@/modules/onboarding/infra/services/onboarding-api.service'

function BusinessInfoStep({ sessionId }: { sessionId: string }) {
  const [submitBusinessInfo, { isLoading }] = useSubmitBusinessInfoMutation()

  const handleSubmit = async (formData: {
    companyName: string
    businessType: 'startup' | 'sme' | 'enterprise'
    industry: string
    employeeCount: number
  }) => {
    await submitBusinessInfo({
      sessionId,
      ...formData,
      expectedVolume: 'medium',
    })
  }

  return (
    // Business info form implementation
  )
}
```

## Error Handling

```tsx
import { useSubmitContactFormMutation } from '@/modules/landing/infra/services/landing-api.service'

function ContactFormWithErrorHandling() {
  const [submitContact, { isLoading, error }] = useSubmitContactFormMutation()

  const handleSubmit = async (formData: any) => {
    try {
      await submitContact(formData).unwrap()
      // Success handling
    } catch (err: any) {
      // Error is automatically handled by RTK Query
      // but you can access it here for custom handling
      console.error('Submission failed:', err)
    }
  }

  return (
    <div>
      {error && (
        <div className="error">
          {'data' in error 
            ? `Error: ${error.data}`
            : 'Network error occurred'}
        </div>
      )}
      {/* Form implementation */}
    </div>
  )
}
```

## Caching and Data Management

RTK Query automatically handles:
- Caching responses
- Deduplicating identical requests
- Background refetching
- Cache invalidation via tags
- Loading states and error handling

Tags are configured for automatic cache invalidation:
- `Lead` - invalidated when leads are created/updated
- `OnboardingSession` - invalidated when sessions are modified
- `Analytics` - invalidated when underlying data changes

## Store Structure

The store includes:
- `api` slice containing all RTK Query endpoints
- Automatic loading states for all queries and mutations
- Error handling for network and server errors
- TypeScript integration for type safety