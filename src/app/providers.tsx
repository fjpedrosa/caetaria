'use client'

import React, { ReactNode, useEffect,useRef } from 'react'
import { ThemeProvider } from 'next-themes'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { Provider as ReduxProvider } from 'react-redux'

import { clientConfig, debugLog,shouldEnableAnalytics } from '@/lib/config/client-config'
import ErrorBoundary from '@/modules/shared/presentation/components/error-boundary'
import type { AppStore } from '@/store'
import { makeStore } from '@/store'

/**
 * Root Providers Component
 *
 * Wraps the application with essential providers:
 * - ReduxProvider: State management with Redux Toolkit
 * - ThemeProvider: Theme management for dark/light mode
 * - ErrorBoundary: Error handling with graceful fallbacks
 * - PostHogProvider: Analytics tracking with PostHog
 *
 * This component creates a per-request store instance for proper
 * SSR/SSG support in Next.js App Router and HMR stability.
 *
 * Uses centralized client configuration to avoid HMR module instantiation
 * issues with Turbopack in Next.js 15.5.2. All process.env access is
 * isolated in the client-config module.
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

  // Initialize PostHog on client side
  useEffect(() => {
    // Only initialize if we have a key and analytics should be enabled
    if (typeof window !== 'undefined' && clientConfig.posthog.key && shouldEnableAnalytics()) {
      try {
        // Check if already initialized to prevent duplicate initialization
        if (!posthog.__loaded) {
          posthog.init(clientConfig.posthog.key, {
            // Use proxy endpoint to avoid CORS and CSP issues
            api_host: '/ingest',
            // UI host for dashboard links
            ui_host: clientConfig.posthog.host,
            // Disable in development if not explicitly enabled
            opt_out_capturing_by_default: !shouldEnableAnalytics(),
            // Manual pageview handling for Next.js
            capture_pageview: false,
            capture_pageleave: true,
            // Auto-capture user interactions in production only
            autocapture: clientConfig.app.isProduction,
            // Session recording configuration
            session_recording: {
              maskAllInputs: false,
              maskTextSelector: '[data-private]'
            },
            // Performance tracking
            capture_performance: clientConfig.features.performanceMonitoring,
            // Person profiles
            person_profiles: 'identified_only',
            // Loaded callback
            loaded: (posthog) => {
              debugLog('PostHog initialized successfully', {
                env: clientConfig.app.env,
                analyticsEnabled: shouldEnableAnalytics()
              })
            },
            // Bootstrap to avoid waiting for initial load
            bootstrap: {
              distinctID: undefined,
              isIdentifiedID: false,
              featureFlags: {}
            }
          })
        }
      } catch (error) {
        console.error('[PostHog] Initialization error:', error)
      }
    } else if (clientConfig.app.isDevelopment && !clientConfig.posthog.enableInDev) {
      debugLog('PostHog disabled in development. Set NEXT_PUBLIC_ENABLE_POSTHOG_DEV=true to enable.')
    }
  }, [])

  return (
    <ErrorBoundary>
      <ReduxProvider store={store}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="neptunik-theme"
          themes={['light', 'dark', 'system']}
        >
          <PostHogProvider client={posthog}>
            {children}
          </PostHogProvider>
        </ThemeProvider>
      </ReduxProvider>
    </ErrorBoundary>
  )
}