/**
 * Redux Persistence Middleware
 * 
 * Automatically syncs specific Redux slices to localStorage.
 * This is a lightweight alternative to redux-persist for simple use cases.
 * 
 * Features:
 * - Selective persistence (whitelist specific slices)
 * - Debounced writes to localStorage (performance)
 * - Error handling for quota exceeded
 * - Skip persistence for server-side rendering
 */

import { Middleware } from '@reduxjs/toolkit'

import type { RootState } from '../store'

/**
 * Configuration for persistence
 */
const PERSISTENCE_CONFIG = {
  // Slices to persist (add slice names here)
  whitelist: ['ui'] as const,
  
  // Debounce delay in milliseconds
  debounceMs: 1000,
  
  // localStorage key prefix
  keyPrefix: 'redux_',
  
  // Maximum storage size per slice (in characters)
  maxSize: 50000,
}

/**
 * Debounce helper for batching localStorage writes
 */
function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      func(...args)
      timeoutId = null
    }, delay)
  }
}

/**
 * Save state to localStorage with error handling
 */
function saveToLocalStorage(key: string, state: any): void {
  // Skip on server
  if (typeof window === 'undefined') return
  
  try {
    const serialized = JSON.stringify(state)
    
    // Check size limit
    if (serialized.length > PERSISTENCE_CONFIG.maxSize) {
      console.warn(`State for ${key} exceeds max size (${serialized.length} chars)`)
      return
    }
    
    localStorage.setItem(key, serialized)
  } catch (error) {
    // Handle quota exceeded or other errors
    if (error instanceof Error) {
      if (error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded. Clearing old data...')
        
        // Try to clear old data and retry
        try {
          clearOldStorageData()
          localStorage.setItem(key, JSON.stringify(state))
        } catch (retryError) {
          console.error('Failed to persist state after clearing:', retryError)
        }
      } else {
        console.error('Failed to persist state:', error)
      }
    }
  }
}

/**
 * Clear old or unused localStorage data
 */
function clearOldStorageData(): void {
  if (typeof window === 'undefined') return
  
  // Get all keys with our prefix
  const keysToCheck: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(PERSISTENCE_CONFIG.keyPrefix)) {
      keysToCheck.push(key)
    }
  }
  
  // Remove keys not in whitelist
  keysToCheck.forEach(key => {
    const sliceName = key.replace(PERSISTENCE_CONFIG.keyPrefix, '')
    if (!PERSISTENCE_CONFIG.whitelist.includes(sliceName as any)) {
      localStorage.removeItem(key)
    }
  })
}

/**
 * Create debounced save functions for each slice
 */
const debouncedSavers = new Map<string, ReturnType<typeof debounce>>()

PERSISTENCE_CONFIG.whitelist.forEach(sliceName => {
  const key = `${PERSISTENCE_CONFIG.keyPrefix}${sliceName}`
  debouncedSavers.set(
    sliceName,
    debounce((state: any) => saveToLocalStorage(key, state), PERSISTENCE_CONFIG.debounceMs)
  )
})

/**
 * Redux Middleware for localStorage persistence
 * 
 * Watches for state changes and persists whitelisted slices to localStorage.
 * Uses debouncing to batch rapid state changes.
 * 
 * Usage:
 * Add this middleware to your store configuration:
 * ```typescript
 * import { persistenceMiddleware } from './middleware/persistence'
 * 
 * const store = configureStore({
 *   reducer: rootReducer,
 *   middleware: (getDefaultMiddleware) =>
 *     getDefaultMiddleware().concat(persistenceMiddleware)
 * })
 * ```
 */
export const persistenceMiddleware: Middleware = 
  (store: any) => (next: any) => (action: any) => {
    // Process the action first
    const result = next(action)
    
    // Skip persistence on server
    if (typeof window === 'undefined') {
      return result
    }
    
    // Get the new state
    const state = store.getState()
    
    // Persist whitelisted slices
    PERSISTENCE_CONFIG.whitelist.forEach(sliceName => {
      const sliceState = (state as any)[sliceName]
      const saver = debouncedSavers.get(sliceName)
      
      if (sliceState && saver) {
        saver(sliceState)
      }
    })
    
    return result
  }

/**
 * Load persisted state from localStorage
 * 
 * Call this when initializing the store to restore persisted state.
 * This is handled automatically in create-store.ts
 * 
 * @returns Partial state object with persisted slices
 */
export function loadPersistedState(): Partial<RootState> {
  // Skip on server
  if (typeof window === 'undefined') {
    return {}
  }
  
  const persistedState: Partial<RootState> = {}
  
  PERSISTENCE_CONFIG.whitelist.forEach(sliceName => {
    const key = `${PERSISTENCE_CONFIG.keyPrefix}${sliceName}`
    
    try {
      const savedState = localStorage.getItem(key)
      
      if (savedState) {
        const parsedState = JSON.parse(savedState)
        ;(persistedState as any)[sliceName] = parsedState
      }
    } catch (error) {
      console.error(`Failed to load persisted state for ${sliceName}:`, error)
      // Remove corrupted data
      localStorage.removeItem(key)
    }
  })
  
  return persistedState
}

/**
 * Clear all persisted state
 * 
 * Useful for logout or reset scenarios.
 */
export function clearPersistedState(): void {
  if (typeof window === 'undefined') return
  
  PERSISTENCE_CONFIG.whitelist.forEach(sliceName => {
    const key = `${PERSISTENCE_CONFIG.keyPrefix}${sliceName}`
    localStorage.removeItem(key)
  })
}

/**
 * ARCHITECTURE NOTES:
 * 
 * Why custom middleware instead of redux-persist?
 * - Lighter weight (no extra dependencies)
 * - Simpler configuration
 * - Better control over persistence timing
 * - Easier to understand and debug
 * 
 * When to persist state:
 * ✅ User preferences (theme, layout)
 * ✅ UI state that should survive refreshes
 * ✅ Draft data (with user consent)
 * ✅ Feature flags
 * 
 * When NOT to persist:
 * ❌ Sensitive data (tokens, passwords)
 * ❌ Server state (use RTK Query caching)
 * ❌ Temporary UI state (modals, toasts)
 * ❌ Large data sets (use IndexedDB instead)
 * 
 * Performance considerations:
 * - Writes are debounced (1 second default)
 * - Size limits prevent quota issues
 * - Selective persistence reduces overhead
 * - Automatic cleanup of old keys
 * 
 * Security notes:
 * - Never persist authentication tokens here
 * - Be careful with user data (GDPR compliance)
 * - Consider encryption for sensitive preferences
 * - Clear on logout for shared devices
 */