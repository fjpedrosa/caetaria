'use client'

import React, { ReactNode, useEffect,useRef } from 'react'
import { ThemeProvider } from 'next-themes'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { Provider as ReduxProvider } from 'react-redux'

import ErrorBoundary from '@/modules/shared/presentation/components/error-boundary'
import type { AppStore } from '@/store'
import { makeStore } from '@/store'

// Extract environment variables at module level to avoid HMR issues with Turbopack
// This prevents process.env access issues during hot module replacement
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const NODE_ENV = process.env.NODE_ENV
const ENABLE_POSTHOG_DEV = process.env.NEXT_PUBLIC_ENABLE_POSTHOG_DEV

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
 * Environment variables are extracted at module level to prevent
 * HMR module instantiation issues with Turbopack in Next.js 15.
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
    // Only initialize if we have a key and we're on the client
    if (typeof window !== 'undefined' && POSTHOG_KEY) {
      try {
        // Check if already initialized to prevent duplicate initialization
        if (!posthog.__loaded) {
          posthog.init(POSTHOG_KEY, {
            // Use proxy endpoint to avoid CORS and CSP issues
            api_host: '/ingest',
            // UI host for dashboard links
            ui_host: 'https://eu.posthog.com',
            // Disable in development if needed
            opt_out_capturing_by_default: NODE_ENV === 'development' && !ENABLE_POSTHOG_DEV,
            // Manual pageview handling for Next.js
            capture_pageview: false,
            capture_pageleave: true,
            // Auto-capture user interactions
            autocapture: NODE_ENV === 'production',
            // Session recording configuration
            session_recording: {
              maskAllInputs: false,
              maskTextSelector: '[data-private]'
            },
            // Performance tracking
            capture_performance: NODE_ENV === 'production',
            // Person profiles
            person_profiles: 'identified_only',
            // Loaded callback
            loaded: (posthog) => {
              if (NODE_ENV === 'development') {
                console.log('[PostHog] Initialized successfully')
              }
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
          storageKey="caetaria-theme"
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