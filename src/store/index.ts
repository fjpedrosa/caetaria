import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { baseApi } from './api/base-api'
import { fakeOnboardingApi } from '@/modules/onboarding/infra/fake-onboarding-api'

// Store configuration function for per-request pattern (SSR-friendly)
export const makeStore = () => {
  const store = configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      [fakeOnboardingApi.reducerPath]: fakeOnboardingApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(baseApi.middleware)
        .concat(fakeOnboardingApi.middleware),
    devTools: process.env.NODE_ENV !== 'production',
  })

  // Setup listeners for RTK Query
  setupListeners(store.dispatch)

  return store
}

// Infer types from the store
export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']