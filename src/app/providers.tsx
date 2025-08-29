'use client'

import { ReactNode } from 'react'
import { useRef } from 'react'
import { ThemeProvider } from 'next-themes'
import { Provider as ReduxProvider } from 'react-redux'

import ErrorBoundary from '@/components/error-boundary'
import { EventTrackerProvider, ScrollDepthTracker, TimeOnPageTracker, VisibilityTracker } from '@/modules/analytics/ui/components/event-tracker'
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
 * SSR/SSG support in Next.js App Router.
 */
export function Providers({ children }: { children: ReactNode }) {
  // Create store instance per request for SSR compatibility
  const storeRef = useRef<AppStore | null>(null)
  
  if (!storeRef.current) {
    storeRef.current = makeStore()
  }

  return (
    <ErrorBoundary>
      <ReduxProvider store={storeRef.current}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
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