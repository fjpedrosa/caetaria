'use client'

import React, { useRef } from 'react'
import { Provider } from 'react-redux'

import { type AppStore,makeStore } from './index'

interface StoreProviderProps {
  children: React.ReactNode
}

/**
 * Redux Store Provider Component for Next.js App Router
 *
 * This component creates a new store instance per request (SSR-friendly)
 * and provides it to the React component tree using React Redux Provider.
 *
 * Key features:
 * - Per-request store pattern for SSR compatibility
 * - Client-side only component (marked with "use client")
 * - Stable store reference using useRef
 * - Proper TypeScript integration with RTK Query
 */
export function StoreProvider({ children }: StoreProviderProps) {
  const storeRef = useRef<AppStore | null>(null)

  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
  }

  return (
    <Provider store={storeRef.current}>
      {children}
    </Provider>
  )
}

export default StoreProvider