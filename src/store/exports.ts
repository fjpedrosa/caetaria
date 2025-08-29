// Store configuration exports
export { makeStore } from './index'
export type { AppStore, RootState, AppDispatch } from './index'

// Typed hooks exports
export { useAppDispatch, useAppSelector } from './hooks'

// Store provider component
export { StoreProvider } from './store-provider'

// Base API configuration
export { baseApi } from './api/base-api'

// API service exports from modules
// NOTE: These services need to be implemented or imported from correct paths
// export * from '../modules/marketing/infra/services/marketing-api.service'
// export * from '../modules/onboarding/infra/services/onboarding-api.service'