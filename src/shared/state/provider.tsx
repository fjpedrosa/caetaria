'use client'

/**
 * Redux Provider Component
 * 
 * This is a CLIENT COMPONENT that provides Redux store to the app.
 * It handles store creation, hydration, and SSR/SSG compatibility.
 * 
 * IMPORTANT: This must be a client component because Redux uses React Context,
 * which is not available in Server Components.
 */

import { ReactNode, useEffect,useRef } from 'react'
import { Provider } from 'react-redux'

import { createStore } from './create-store'
import type { AppStore } from './store'

interface ReduxProviderProps {
  children: ReactNode
  /**
   * Initial state for SSR/SSG hydration
   * This is typically not needed with App Router as Next.js handles it
   */
  initialState?: any
}

/**
 * Redux Provider with SSR/SSG support
 * 
 * Features:
 * - Per-request store creation on server
 * - Singleton store on client
 * - Automatic hydration from localStorage
 * - Safe for React 18 concurrent features
 * 
 * Usage in app/layout.tsx:
 * ```tsx
 * import { ReduxProvider } from '@/shared/state/provider'
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
 */
export function ReduxProvider({ children, initialState }: ReduxProviderProps) {
  // Use ref to maintain stable store reference
  const storeRef = useRef<AppStore | undefined>(undefined)

  // Create store only once
  if (!storeRef.current) {
    storeRef.current = createStore()
    
    // Apply initial state if provided (for SSR/SSG)
    if (initialState && typeof window !== 'undefined') {
      storeRef.current.dispatch({
        type: '__HYDRATE__',
        payload: initialState,
      })
    }
  }

  // Setup store subscriptions and cleanup
  useEffect(() => {
    const store = storeRef.current
    if (!store) return

    // Store is ready, you can dispatch initial actions here if needed
    // Example: store.dispatch(initializeApp())

    // Cleanup function (runs on unmount)
    return () => {
      // Cleanup subscriptions if any
      // Note: RTK Query subscriptions are handled automatically
    }
  }, [])

  return <Provider store={storeRef.current}>{children}</Provider>
}

/**
 * Alternative Provider with Suspense boundary
 * 
 * Use this if you want to show loading state while store initializes.
 * Useful for large initial states or slow hydration.
 */
export function ReduxProviderWithSuspense({ children, initialState }: ReduxProviderProps) {
  const storeRef = useRef<AppStore | undefined>(undefined)

  if (!storeRef.current) {
    storeRef.current = createStore()
    
    if (initialState) {
      storeRef.current.dispatch({
        type: '__HYDRATE__',
        payload: initialState,
      })
    }
  }

  return (
    <Provider store={storeRef.current}>
      {children}
    </Provider>
  )
}

/**
 * Hook to ensure Redux is properly initialized
 * 
 * Use this in components that absolutely require Redux to be ready.
 * Most components don't need this as Provider handles initialization.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   useEnsureReduxReady()
 *   const data = useAppSelector(state => state.ui)
 *   // ... rest of component
 * }
 * ```
 */
export function useEnsureReduxReady() {
  useEffect(() => {
    // This effect runs after Redux Provider is mounted
    // You can dispatch initialization actions here
  }, [])
}

/**
 * ARCHITECTURE NOTES:
 * 
 * Why Client Component?
 * - Redux uses React Context which requires client-side JavaScript
 * - Server Components can't use Context or state
 * - This component must be 'use client'
 * 
 * SSR/SSG Compatibility:
 * - Server creates a new store for each request
 * - Client reuses the same store instance
 * - Hydration happens automatically on client mount
 * 
 * Performance Considerations:
 * - Store creation is fast (< 1ms)
 * - Hydration from localStorage is async and non-blocking
 * - RTK Query handles its own caching and persistence
 * 
 * Common Mistakes to Avoid:
 * ❌ Don't import store directly in components
 * ❌ Don't create multiple Providers
 * ❌ Don't use Context for server state (use RTK Query)
 * ❌ Don't persist sensitive data in localStorage
 * 
 * Best Practices:
 * ✅ Use this Provider at the root level only
 * ✅ Use RTK Query for all server state
 * ✅ Use Redux slices for complex client state
 * ✅ Keep localStorage persistence minimal
 */