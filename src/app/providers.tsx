'use client'

import React, { ReactNode, useRef } from 'react'
import { ThemeProvider } from 'next-themes'
import { Provider as ReduxProvider } from 'react-redux'

import { EventTrackerProvider, ScrollDepthTracker, TimeOnPageTracker, VisibilityTracker } from '@/modules/analytics/ui/components/event-tracker'
import ErrorBoundary from '@/modules/shared/ui/components/error-boundary'
import type { AppStore } from '@/store'
import { makeStore } from '@/store'

/**
 * Root Providers Component
 *
 * Wraps the application with essential providers:
 * - ReduxProvider: State management with Redux Toolkit
 * - ThemeProvider: Theme management for dark/light mode
 * - ErrorBoundary: Error handling with graceful fallbacks
 * - EventTrackerProvider: Analytics tracking for user interactions
 *
 * This component creates a per-request store instance for proper
 * SSR/SSG support in Next.js App Router and HMR stability.
 *
 * Optimized for React 19 compatibility with Turbopack and hydration fixes.
 */
export function Providers({ children }: { children: ReactNode }) {
  // Create stable store instance for HMR compatibility
  const storeRef = useRef<AppStore | null>(null)

  // Initialize store only once to prevent HMR issues
  if (!storeRef.current) {
    storeRef.current = makeStore()
  }

  // Prevent store recreation during HMR updates
  const store = storeRef.current

  return (
    <ErrorBoundary>
      <ReduxProvider store={store}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="caetaria-theme"
          themes={['light', 'dark', 'system']}
        >
          <EventTrackerProvider
            enableAutoTracking={true}
            consentLevel="analytics"
            config={{
              sessionTimeout: 30 * 60 * 1000, // 30 minutes
              batchSize: 10,
              flushInterval: 5000,
              enableLocalStorage: true,
            }}
          >
            {children}

            {/* Global analytics trackers */}
            <ScrollDepthTracker
              thresholds={[25, 50, 75, 100]}
              enabled={true}
            />
            <TimeOnPageTracker
              intervals={[30, 60, 120, 300]}
              enabled={true}
            />
            <VisibilityTracker enabled={true} />
          </EventTrackerProvider>
        </ThemeProvider>
      </ReduxProvider>
    </ErrorBoundary>
  )
}