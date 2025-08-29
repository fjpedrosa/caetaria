/**
 * Main export for Redux state management
 * 
 * This is the single entry point for all state-related imports.
 * Import from '@/shared/state' instead of individual files.
 */

// Store and configuration
export { makeStore } from './store'
export type { AppStore, RootState, AppDispatch } from './store'

// Store creation and management
export { createStore, resetStore, getStore } from './create-store'

// Provider component
export { ReduxProvider, ReduxProviderWithSuspense, useEnsureReduxReady } from './provider'

// Typed hooks (ALWAYS use these)
export {
  useAppDispatch,
  useAppSelector,
  useAppStore,
  useAppSelectorMultiple,
  useAppDispatchMultiple,
  useConditionalDispatch,
} from './hooks'

// Persistence utilities
export {
  persistenceMiddleware,
  loadPersistedState,
  clearPersistedState,
} from './middleware/persistence'

// Re-export all slices
export * from './slices'

/**
 * QUICK START GUIDE:
 * 
 * 1. Setup Provider in your app:
 * ```tsx
 * // app/layout.tsx
 * import { ReduxProvider } from '@/shared/state'
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <ReduxProvider>
 *           {children}
 *         </ReduxProvider>
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 * 
 * 2. Use in components:
 * ```tsx
 * 'use client'
 * import { useAppSelector, useAppDispatch, selectTheme, setTheme } from '@/shared/state'
 * 
 * export function ThemeToggle() {
 *   const theme = useAppSelector(selectTheme)
 *   const dispatch = useAppDispatch()
 *   
 *   return (
 *     <button onClick={() => dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'))}>
 *       Current theme: {theme}
 *     </button>
 *   )
 * }
 * ```
 * 
 * 3. Use RTK Query for API calls:
 * ```tsx
 * import { useGetUsersQuery } from '@/modules/users/api'
 * 
 * export function UserList() {
 *   const { data: users, isLoading, error } = useGetUsersQuery()
 *   
 *   if (isLoading) return <div>Loading...</div>
 *   if (error) return <div>Error loading users</div>
 *   
 *   return (
 *     <ul>
 *       {users?.map(user => (
 *         <li key={user.id}>{user.name}</li>
 *       ))}
 *     </ul>
 *   )
 * }
 * ```
 * 
 * REMEMBER:
 * - Use RTK Query for server state (not Redux slices)
 * - Use Redux slices for complex client state
 * - Use local state for simple component state
 * - Don't use Context for global state
 */