/**
 * Redux Store Configuration
 *
 * IMPORTANT: This is the main store configuration. For SSR/SSG support,
 * use createStore() from create-store.ts instead of directly importing this.
 *
 * Architecture decisions:
 * - RTK Query for all server state (no Context for this)
 * - Redux for complex client state that needs persistence
 * - Context only for simple, non-persistent, local state
 */

import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'

import { baseApi } from '../api/base-api'

import { persistenceMiddleware } from './middleware/persistence'
import authSlice from './slices/auth-slice'
import { uiSlice } from './slices/ui-slice'

/**
 * Root reducer combining all slices and RTK Query reducers
 *
 * Add new slices here. Remember:
 * - Use RTK Query for server state (users, posts, etc.)
 * - Use Redux slices for complex UI state (forms, wizards, etc.)
 * - DON'T use Context for global state that needs persistence
 */
const rootReducer = {
  // RTK Query reducers - automatically generated
  [baseApi.reducerPath]: baseApi.reducer,

  // Auth state slice - for authentication state
  auth: authSlice,

  // UI state slice - for global UI state
  ui: uiSlice.reducer,

  // Add more slices here as needed
  // Examples:
  // - preferences: preferencesSlice.reducer
  // - notifications: notificationsSlice.reducer
}

/**
 * Create middleware array with all custom and default middleware
 *
 * Middleware order matters:
 * 1. RTK Query middleware (for caching, invalidation, polling)
 * 2. Persistence middleware (for localStorage sync)
 * 3. Default middleware (thunk, serializableCheck, immutableCheck)
 */
const createMiddleware = (getDefaultMiddleware: any) =>
  getDefaultMiddleware({
    // RTK Query requires these settings
    serializableCheck: {
      ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      ignoredPaths: ['api'],
    },
    immutableCheck: {
      ignoredPaths: ['api'],
    },
  })
    .concat(baseApi.middleware) // RTK Query middleware must be added
    .concat(persistenceMiddleware) // Custom persistence middleware

/**
 * Store configuration with all features enabled
 *
 * Features:
 * - Redux DevTools (development only)
 * - RTK Query with caching and invalidation
 * - Persistence to localStorage (selective)
 * - Type-safe throughout
 */
export const makeStore = () => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: createMiddleware,
    devTools: process.env.NODE_ENV !== 'production',
  })

  // Enable refetchOnFocus and refetchOnReconnect listeners
  // This is crucial for keeping data fresh when users return to the app
  if (typeof window !== 'undefined') {
    setupListeners(store.dispatch)
  }

  return store
}

// Type exports for TypeScript
export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']

/**
 * WHEN TO USE WHAT:
 *
 * RTK Query (preferred for server state):
 * - API calls and data fetching
 * - Caching server responses
 * - Optimistic updates
 * - Polling and real-time updates
 * - Request deduplication
 *
 * Redux Slices (for complex client state):
 * - Multi-step forms that need persistence
 * - Shopping carts
 * - User preferences
 * - Complex UI state (modals, sidebars, etc.)
 *
 * React Context (use sparingly):
 * - Theme (if not persisted)
 * - Portal targets
 * - Very localized state
 *
 * Local State (useState):
 * - Form inputs (if not persisted)
 * - UI toggles
 * - Animation states
 * - Component-specific state
 *
 * DON'T use Context for:
 * - Server state (use RTK Query)
 * - Global app state (use Redux)
 * - Anything that needs persistence (use Redux + middleware)
 * - High-frequency updates (causes re-renders)
 */