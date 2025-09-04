import { usePostHog } from 'posthog-js/react'
import * as Sentry from '@sentry/nextjs'

// Unified analytics hook that maintains compatibility with the old system
export const useAnalytics = () => {
  const posthog = usePostHog()

  return {
    // Event tracking compatible with old useEventTracking
    trackEvent: (type: string, name: string, properties?: any) => {
      // PostHog for product events
      posthog?.capture(name, { ...properties, event_type: type })

      // Sentry breadcrumb for context
      Sentry.addBreadcrumb({
        category: 'user-action',
        message: name,
        level: 'info',
        data: properties
      })

      // GA4 for important conversions
      if (typeof window !== 'undefined' && window.gtag) {
        if (['form_submit', 'purchase', 'signup'].includes(type)) {
          window.gtag('event', type, properties)
        }
      }
    },

    // Form tracking compatibility
    trackFormStart: (formName: string) => {
      posthog?.capture('form_started', { form_name: formName })
    },

    trackFormSubmit: (formName: string, data?: any) => {
      posthog?.capture('form_submitted', { form_name: formName, ...data })
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'generate_lead', { form_name: formName })
      }
    },

    trackFormAbandonment: (formName: string, reason?: string) => {
      posthog?.capture('form_abandoned', { form_name: formName, reason })
    },

    // Page view tracking
    trackPageView: (url?: string, title?: string) => {
      posthog?.capture('$pageview', {
        $current_url: url || window.location.href,
        $title: title || document.title
      })

      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'page_view', {
          page_location: url || window.location.href,
          page_title: title || document.title
        })
      }
    },

    // Scroll tracking
    trackScrollDepth: (depth: number) => {
      posthog?.capture('scroll_depth_reached', {
        depth_percentage: depth,
        scroll_unit: 'percent'
      })
    },

    // Element visibility
    trackElementVisible: (elementId: string) => {
      posthog?.capture('element_viewed', {
        element_id: elementId
      })
    }
  }
}

// Minimal form analytics hook for compatibility
export const useFormAnalytics = (formName: string) => {
  const { trackFormStart, trackFormSubmit, trackFormAbandonment } = useAnalytics()

  return {
    trackFieldFocus: () => {}, // No-op for now
    trackFieldBlur: () => {},  // No-op for now
    trackSubmit: () => trackFormSubmit(formName),
    trackError: () => {},      // No-op for now
    trackStart: () => trackFormStart(formName),
    trackAbandonment: (reason?: string) => trackFormAbandonment(formName, reason)
  }
}

// Minimal scroll tracking hook for compatibility
export const useScrollTracking = () => {
  const { trackScrollDepth } = useAnalytics()

  return {
    trackScroll: (depth: number) => trackScrollDepth(depth)
  }
}

// Minimal visibility tracking hook for compatibility
export const useVisibilityTracking = () => {
  const { trackElementVisible } = useAnalytics()

  return {
    trackVisibility: (elementId: string) => trackElementVisible(elementId)
  }
}

// Minimal event tracking hook for compatibility
export const useEventTracking = () => {
  const { trackEvent } = useAnalytics()

  return {
    track: trackEvent
  }
}