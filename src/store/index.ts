import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'

import { fakeOnboardingApi } from '@/modules/onboarding/infrastructure/fake-onboarding-api'

import { analyticsApi } from './api/analytics-api'
import { baseApi } from './api/base-api'
import { leadsApi } from './api/leads-api'
import { onboardingApi } from './api/onboarding-api'

// Store configuration function for per-request pattern (SSR-friendly)
export const makeStore = () => {
  const store = configureStore({
    reducer: {
      // Base API (generic operations)
      [baseApi.reducerPath]: baseApi.reducer,

      // Specialized API slices
      [leadsApi.reducerPath]: leadsApi.reducer,
      [analyticsApi.reducerPath]: analyticsApi.reducer,
      [onboardingApi.reducerPath]: onboardingApi.reducer,

      // Legacy API (will be removed)
      [fakeOnboardingApi.reducerPath]: fakeOnboardingApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        // Enhanced serializable check configuration for Supabase data
        serializableCheck: {
          ignoredActions: [
            // Ignore RTK Query actions that contain non-serializable values
            'persist/PERSIST',
            'persist/REHYDRATE',
          ],
          ignoredActionsPaths: [
            'meta.arg',
            'meta.baseQueryMeta',
            'payload.timestamp',
          ],
          ignoredPaths: [
            // Ignore specific paths that may contain functions or non-serializable data
            'api.queries',
            'api.mutations',
          ],
        },
        // Immutability check configuration
        immutableCheck: {
          warnAfter: 128, // Warn if state mutations take longer than 128ms
        },
      })
        // Add all API middleware
        .concat(baseApi.middleware)
        .concat(leadsApi.middleware)
        .concat(analyticsApi.middleware)
        .concat(onboardingApi.middleware)
        .concat(fakeOnboardingApi.middleware),
    devTools: process.env.NODE_ENV !== 'production' && {
      // Enhanced DevTools configuration
      name: 'WhatsApp Cloud Landing Store',
      trace: true,
      traceLimit: 25,
      maxAge: 50,
      // Action sanitizer to hide sensitive data
      actionSanitizer: (action: any) => {
        // Hide sensitive auth data
        if (action.type?.includes('auth') || action.type?.includes('login')) {
          return {
            ...action,
            payload: action.payload ? '[HIDDEN]' : action.payload,
          };
        }
        return action;
      },
      // State sanitizer to hide sensitive data
      stateSanitizer: (state: any) => {
        // Hide API keys and tokens
        const sanitized = { ...state };

        // Sanitize onboarding data
        if (sanitized.onboardingApi?.queries) {
          Object.keys(sanitized.onboardingApi.queries).forEach(key => {
            if (key.includes('WhatsAppIntegration')) {
              const query = sanitized.onboardingApi.queries[key];
              if (query?.data?.access_token) {
                query.data.access_token = '[HIDDEN]';
              }
              if (query?.data?.webhook_verify_token) {
                query.data.webhook_verify_token = '[HIDDEN]';
              }
            }
          });
        }

        return sanitized;
      },
    },
  })

  // Setup listeners for RTK Query (enables caching, invalidation, polling, etc.)
  setupListeners(store.dispatch)

  return store
}

// Infer types from the store
export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']