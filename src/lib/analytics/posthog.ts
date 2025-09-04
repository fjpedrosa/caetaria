import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import type { ReactNode } from 'react'

export const initPostHog = () => {
  if (typeof window === 'undefined') return

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || '', {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    
    // Capture configuration
    capture_pageview: false, // We'll handle this manually in Next.js
    capture_pageleave: true,
    autocapture: true,
    
    // Session recording
    session_recording: {
      maskAllInputs: false,
      maskTextSelector: '[data-private]'
    },
    
    // Performance
    capture_performance: true,
    
    // Person profiles
    person_profiles: 'identified_only',
    
    // Development
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') {
        posthog.debug()
      }
    }
  })

  return posthog
}

// PostHog Provider wrapper
export function PostHogProviderWrapper({ children }: { children: ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}

// Export for direct usage
export { posthog, PostHogProvider }