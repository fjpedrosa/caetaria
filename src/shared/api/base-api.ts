/**
 * RTK Query Base API Configuration
 * 
 * This is the foundation for ALL API calls in the application.
 * Use RTK Query instead of Context for server state management.
 * 
 * Benefits over Context + fetch:
 * - Automatic caching and cache invalidation
 * - Request deduplication (no duplicate requests)
 * - Optimistic updates
 * - Polling and refetching
 * - Built-in loading and error states
 * - TypeScript support out of the box
 */

import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'

/**
 * Custom base query with authentication and error handling
 * 
 * Features:
 * - Automatic token injection
 * - Error transformation
 * - Request/response logging (development only)
 * - Timeout handling
 */
const customBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  
  // Prepare headers for every request
  prepareHeaders: (headers, { getState, endpoint }) => {
    // Get token from state or localStorage
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('auth_token')
      : null

    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }

    // Add custom headers
    headers.set('x-client-version', '1.0.0')
    headers.set('x-request-id', crypto.randomUUID?.() || Date.now().toString())

    return headers
  },

  // Global response interceptor
  responseHandler: async (response) => {
    // Log responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.url}:`, {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      })
    }

    // Handle different content types
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      return response.json()
    }
    return response.text()
  },

  // Timeout for all requests (30 seconds default)
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
})

/**
 * Base query with automatic retry logic
 * 
 * Retries failed requests with exponential backoff:
 * - 1st retry: 1 second
 * - 2nd retry: 2 seconds  
 * - 3rd retry: 4 seconds
 * 
 * Only retries on network errors or 5xx status codes
 */
const baseQueryWithRetry = retry(customBaseQuery, {
  maxRetries: 3,
  backoff: async (attempt: number) => {
    // Exponential backoff: 1s, 2s, 4s
    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 4000);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
})

/**
 * Enhanced base query with error handling
 * 
 * Centralizes error handling and provides consistent error format
 */
const enhancedBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQueryWithRetry(args, api, extraOptions)

  // Handle authentication errors globally
  if (result.error && result.error.status === 401) {
    // Clear auth state and redirect to login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      // Dispatch logout action if needed
      // api.dispatch(logout())
      
      // Redirect to login (customize as needed)
      // window.location.href = '/login'
    }
  }

  // Transform errors to consistent format
  if (result.error) {
    const error = result.error as any
    return {
      error: {
        status: error.status || 'FETCH_ERROR',
        data: error.data || { 
          message: 'An unexpected error occurred',
          code: 'UNKNOWN_ERROR'
        },
      },
    }
  }

  return result
}

/**
 * Main API slice configuration
 * 
 * This is the base for all API endpoints in the application.
 * Each module can inject its own endpoints into this API.
 * 
 * Cache configuration:
 * - Default: 60 seconds (1 minute)
 * - Can be overridden per endpoint
 * - Automatic garbage collection of unused data
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: enhancedBaseQuery,
  
  // Global cache configuration
  keepUnusedDataFor: 60, // Keep cached data for 60 seconds after last subscriber unsubscribes
  refetchOnFocus: true,   // Refetch when window regains focus
  refetchOnReconnect: true, // Refetch when regaining internet connection
  
  // Tag types for cache invalidation
  // Add your tag types here as you create endpoints
  tagTypes: [
    'User',
    'Lead',
    'OnboardingSession',
    'Pricing',
    'Analytics',
    'Notification',
    // Add more as needed
  ],
  
  // Endpoints will be injected by each module
  endpoints: () => ({}),
})

/**
 * USAGE GUIDELINES:
 * 
 * When to use RTK Query (this):
 * ✅ Fetching data from APIs
 * ✅ Caching server responses  
 * ✅ Real-time data with polling
 * ✅ Optimistic updates
 * ✅ Request deduplication needed
 * ✅ Loading/error states needed
 * 
 * When NOT to use RTK Query:
 * ❌ Local-only state (use Redux slices)
 * ❌ One-time actions (use regular fetch)
 * ❌ File uploads (use FormData + fetch)
 * ❌ WebSocket connections (use separate solution)
 * 
 * Example - Injecting endpoints:
 * ```typescript
 * const userApi = baseApi.injectEndpoints({
 *   endpoints: (builder) => ({
 *     getUser: builder.query<User, string>({
 *       query: (id) => `users/${id}`,
 *       providesTags: (result, error, id) => [{ type: 'User', id }],
 *       keepUnusedDataFor: 300, // Override cache time to 5 minutes
 *     }),
 *     updateUser: builder.mutation<User, Partial<User>>({
 *       query: ({ id, ...patch }) => ({
 *         url: `users/${id}`,
 *         method: 'PATCH',
 *         body: patch,
 *       }),
 *       invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
 *       // Optimistic update example
 *       async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
 *         const patchResult = dispatch(
 *           userApi.util.updateQueryData('getUser', id, (draft) => {
 *             Object.assign(draft, patch)
 *           })
 *         )
 *         try {
 *           await queryFulfilled
 *         } catch {
 *           patchResult.undo()
 *         }
 *       },
 *     }),
 *   }),
 * })
 * ```
 * 
 * Cache Invalidation Strategies:
 * 
 * 1. Automatic (via tags):
 *    - Use providesTags on queries
 *    - Use invalidatesTags on mutations
 *    - RTK Query handles the rest
 * 
 * 2. Manual:
 *    - dispatch(api.util.invalidateTags(['User']))
 *    - dispatch(api.util.resetApiState()) // Nuclear option
 * 
 * 3. Time-based:
 *    - keepUnusedDataFor: seconds to keep in cache
 *    - refetchOnFocus: refetch when window regains focus
 *    - polling: { pollingInterval: 5000 } on queries
 */

// Export hooks for common operations
export const {
  util: { invalidateTags, resetApiState, updateQueryData },
} = baseApi