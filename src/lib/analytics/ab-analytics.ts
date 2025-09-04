/**
 * A/B Testing Analytics Adapter
 *
 * This is a lightweight adapter that delegates A/B testing metrics to our existing
 * analytics infrastructure (PostHog, Google Analytics, Sentry).
 *
 * Instead of reimplementing A/B testing logic, we leverage:
 * - PostHog: For experiment tracking and cohort analysis
 * - Google Analytics: For conversion tracking and Google Ads integration
 * - Sentry: For error tracking and performance monitoring
 */

import { usePostHog } from 'posthog-js/react'
import * as Sentry from '@sentry/nextjs'

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

/**
 * Hook for A/B testing analytics
 * Provides a unified interface for tracking pricing experiments
 */
export const useABAnalytics = () => {
  const posthog = usePostHog()

  return {
    /**
     * Track when a pricing section is viewed
     * PostHog will automatically handle session recording and heatmaps
     */
    trackPricingView: (variant: string, page: string) => {
      // PostHog for experiment tracking
      posthog?.capture('pricing_view', {
        variant,
        page,
        experiment: 'pricing_test',
        timestamp: new Date().toISOString()
      })

      // Sentry breadcrumb for debugging
      Sentry.addBreadcrumb({
        category: 'experiment',
        message: 'Pricing view',
        level: 'info',
        data: { variant, page }
      })

      // GA4 for pageview with experiment context
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'experiment_impression', {
          experiment_id: 'pricing_test',
          variant_id: variant,
          page_location: page
        })
      }
    },

    /**
     * Track when a pricing plan is clicked
     * This is a key conversion event for the experiment
     */
    trackPlanClick: (
      variant: string,
      plan: string,
      metadata?: Record<string, any>
    ) => {
      // PostHog for detailed tracking
      posthog?.capture('plan_clicked', {
        variant,
        plan,
        experiment: 'pricing_test',
        ...metadata,
        timestamp: new Date().toISOString()
      })

      // GA4 for conversion tracking (important for Google Ads)
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'select_content', {
          content_type: 'pricing_plan',
          content_id: plan,
          experiment_id: 'pricing_test',
          variant_id: variant,
          value: metadata?.price ? parseFloat(metadata.price.replace(/[^0-9.]/g, '')) : 0,
          currency: 'USD',
          ...metadata
        })

        // Also track as a conversion event
        if (plan === 'pro') {
          window.gtag('event', 'conversion', {
            send_to: 'pricing_plan_pro_click',
            value: metadata?.price ? parseFloat(metadata.price.replace(/[^0-9.]/g, '')) : 0,
            currency: 'USD'
          })
        }
      }

      // Sentry for business metrics
      Sentry.addBreadcrumb({
        category: 'conversion',
        message: `Plan clicked: ${plan}`,
        level: 'info',
        data: { variant, plan, ...metadata }
      })
    },

    /**
     * Track CTA button clicks
     * Helps understand which CTAs are most effective in each variant
     */
    trackCTAStart: (
      variant: string,
      location: string,
      buttonText: string,
      plan?: string
    ) => {
      // PostHog for funnel tracking
      posthog?.capture('cta_clicked', {
        variant,
        location,
        button_text: buttonText,
        plan,
        experiment: 'pricing_test',
        timestamp: new Date().toISOString()
      })

      // GA4 for engagement tracking
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'cta_interaction', {
          cta_location: location,
          cta_text: buttonText,
          experiment_id: 'pricing_test',
          variant_id: variant,
          plan_type: plan
        })
      }

      // Sentry breadcrumb for user journey tracking
      Sentry.addBreadcrumb({
        category: 'user-action',
        message: `CTA clicked: ${buttonText}`,
        level: 'info',
        data: { variant, location, plan }
      })
    }
  }
}

/**
 * Hook for VWO integration (placeholder for future implementation)
 * When VWO is needed, this will integrate with their SDK
 */
export const useVWOExperiment = (experimentId: string) => {
  // Placeholder for VWO SDK integration
  // Will be implemented when VWO is actually needed
  // For now, we're using PostHog's built-in experimentation features

  return {
    variant: 'control',
    isLoading: false,
    trackConversion: (goalId: string) => {
      console.log('VWO tracking will be implemented when needed', { experimentId, goalId })
    }
  }
}

/**
 * Utility to check if A/B testing is properly configured
 */
export const isABTestingConfigured = (): boolean => {
  const hasPostHog = typeof window !== 'undefined' && window.posthog
  const hasGA = typeof window !== 'undefined' && window.gtag

  return !!(hasPostHog || hasGA)
}