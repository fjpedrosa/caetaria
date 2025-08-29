/**
 * Store Creation Helper
 * 
 * This module provides utilities for creating Redux stores with SSR/SSG support.
 * Uses the per-request store pattern for Next.js App Router.
 */

import { makeStore } from './store'
import type { AppStore } from './store'

/**
 * Store cache for client-side
 * 
 * On the client, we want a single store instance that persists
 * across navigation. This prevents losing state on route changes.
 */
let clientStore: AppStore | undefined

/**
 * Create or return existing store instance
 * 
 * Behavior:
 * - Server: Always creates a new store (per-request isolation)
 * - Client: Returns existing store or creates one (singleton)
 * 
 * This pattern is crucial for:
 * - Preventing state leakage between requests on server
 * - Maintaining state during client-side navigation
 * - Supporting SSR/SSG hydration
 */
export function createStore(): AppStore {
  // Server-side: always create a new store
  if (typeof window === 'undefined') {
    return makeStore()
  }

  // Client-side: create store if it doesn't exist
  if (!clientStore) {
    clientStore = makeStore()
    
    // Hydrate from localStorage on client
    if (typeof window !== 'undefined') {
      hydrateFromLocalStorage(clientStore)
    }
  }

  return clientStore
}

/**
 * Hydrate store from localStorage
 * 
 * This runs once on client initialization to restore
 * persisted state from previous sessions.
 * 
 * Only specific slices are hydrated (see whitelist).
 */
function hydrateFromLocalStorage(store: AppStore) {
  if (typeof window === 'undefined') return

  try {
    // Define which slices to persist/hydrate
    const persistedSlices = ['ui'] // Add more slices as needed
    
    persistedSlices.forEach(sliceName => {
      const key = `redux_${sliceName}`
      const savedState = localStorage.getItem(key)
      
      if (savedState) {
        const parsedState = JSON.parse(savedState)
        
        // Dispatch hydration action for each slice
        store.dispatch({
          type: `${sliceName}/hydrate`,
          payload: parsedState,
        })
      }
    })
  } catch (error) {
    console.warn('Failed to hydrate state from localStorage:', error)
    // Continue without hydration on error
  }
}

/**
 * Reset store (useful for testing or logout)
 * 
 * Clears the client store instance and localStorage.
 * Server stores are automatically garbage collected.
 */
export function resetStore() {
  if (typeof window !== 'undefined') {
    clientStore = undefined
    
    // Clear persisted state
    const persistedSlices = ['ui']
    persistedSlices.forEach(sliceName => {
      localStorage.removeItem(`redux_${sliceName}`)
    })
  }
}

/**
 * Get current store instance (if exists)
 * 
 * Useful for accessing store outside of React components.
 * Returns undefined on server or if store not initialized.
 */
export function getStore(): AppStore | undefined {
  return clientStore
}

/**
 * SSR/SSG Considerations:
 * 
 * 1. Per-Request Isolation:
 *    Each request gets its own store to prevent data leakage
 * 
 * 2. Hydration:
 *    Initial state from server is automatically handled by Next.js
 *    Additional client state is hydrated from localStorage
 * 
 * 3. Store Creation Timing:
 *    - Server: Created in Provider during render
 *    - Client: Created on first Provider mount
 * 
 * 4. State Persistence:
 *    Only specific slices are persisted (see persistedSlices)
 *    Server state (RTK Query) is never persisted
 * 
 * Example usage in a Server Component:
 * ```tsx
 * // This won't work - Server Components can't use Redux
 * const store = createStore() // ❌
 * ```
 * 
 * Example usage in a Client Component:
 * ```tsx
 * 'use client'
 * import { Provider } from 'react-redux'
 * import { createStore } from '@/shared/state/create-store'
 * 
 * export function ReduxProvider({ children }) {
 *   const store = createStore()
 *   return <Provider store={store}>{children}</Provider>
 * }
 * ```
 */