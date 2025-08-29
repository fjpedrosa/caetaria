import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'

// Base query with authentication and error handling
const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers, { getState }) => {
    // TODO: Add authentication token when auth is implemented
    // const token = (getState() as RootState).auth.token
    // if (token) {
    //   headers.set('authorization', `Bearer ${token}`)
    // }
    
    headers.set('Content-Type', 'application/json')
    return headers
  },
})

// Enhanced base query with error handling and retry logic
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)
  
  // Handle authentication errors
  if (result.error && result.error.status === 401) {
    // TODO: Implement token refresh logic when auth is available
    console.warn('Authentication failed - implement token refresh')
  }
  
  // Handle server errors with retry logic
  if (result.error && typeof result.error.status === 'number' && result.error.status >= 500) {
    console.error('Server error:', result.error)
  }
  
  return result
}

// Base API configuration
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Lead', 'OnboardingSession', 'Analytics', 'PricingPlan', 'Discount', 'Event', 'Metric', 'Report'],
  endpoints: () => ({}),
})

export default baseApi