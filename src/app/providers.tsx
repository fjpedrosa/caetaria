'use client'

import React, { ReactNode, useEffect,useRef } from 'react'
import { ThemeProvider } from 'next-themes'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { Provider as ReduxProvider } from 'react-redux'

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
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
        capture_pageview: false, // Handle manually in Next.js
        capture_pageleave: true,
        autocapture: true,
        session_recording: {
          maskAllInputs: false,
          maskTextSelector: '[data-private]'
        },
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            posthog.debug()
          }
        }
      })
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