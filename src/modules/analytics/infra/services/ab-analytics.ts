import type { PriceVariant } from '@/modules/pricing/infra/ab-testing'

// Tipos de eventos de A/B testing
export type ABTestEventType = 'view_pricing' | 'click_plan' | 'cta_start'

export interface ABTestEvent {
  event: ABTestEventType
  variant: PriceVariant
  timestamp: number
  metadata?: Record<string, any>
}

export interface PricingViewEvent extends ABTestEvent {
  event: 'view_pricing'
  metadata: {
    page_path: string
    referrer?: string
  }
}

export interface ClickPlanEvent extends ABTestEvent {
  event: 'click_plan'
  metadata: {
    plan_type: 'starter' | 'pro'
    price: string
    has_discount: boolean
    discount_percentage?: string
    button_text: string
  }
}

export interface CTAStartEvent extends ABTestEvent {
  event: 'cta_start'
  metadata: {
    cta_location: 'hero' | 'pricing' | 'footer' | 'final_cta'
    cta_text: string
    plan_type?: 'starter' | 'pro'
  }
}

// Analytics service para A/B testing
class ABTestingAnalytics {
  private queue: ABTestEvent[] = []
  private flushInterval: NodeJS.Timeout | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.startFlushInterval()
      this.attachUnloadHandler()
    }
  }

  // Método principal para trackear eventos
  track(event: PricingViewEvent | ClickPlanEvent | CTAStartEvent) {
    const enrichedEvent = {
      ...event,
      timestamp: Date.now(),
      session_id: this.getSessionId(),
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      viewport:
        typeof window !== 'undefined'
          ? {
              width: window.innerWidth,
              height: window.innerHeight,
            }
          : undefined,
    }

    this.queue.push(enrichedEvent)

    // Log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('[A/B Analytics]', enrichedEvent)
    }

    // Flush si la cola está muy llena
    if (this.queue.length >= 10) {
      this.flush()
    }
  }

  // Track view de página de pricing
  trackPricingView(variant: PriceVariant, pagePath: string) {
    this.track({
      event: 'view_pricing',
      variant,
      timestamp: Date.now(),
      metadata: {
        page_path: pagePath,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      },
    })
  }

  // Track click en plan
  trackPlanClick(
    variant: PriceVariant,
    planType: 'starter' | 'pro',
    planDetails: {
      price: string
      has_discount: boolean
      discount_percentage?: string
      button_text: string
    },
  ) {
    this.track({
      event: 'click_plan',
      variant,
      timestamp: Date.now(),
      metadata: {
        plan_type: planType,
        ...planDetails,
      },
    })
  }

  // Track click en CTA principal
  trackCTAStart(
    variant: PriceVariant,
    location: 'hero' | 'pricing' | 'footer' | 'final_cta',
    ctaText: string,
    planType?: 'starter' | 'pro',
  ) {
    this.track({
      event: 'cta_start',
      variant,
      timestamp: Date.now(),
      metadata: {
        cta_location: location,
        cta_text: ctaText,
        plan_type: planType,
      },
    })
  }

  // Enviar eventos al servidor
  private async flush() {
    if (this.queue.length === 0) return

    const events = [...this.queue]
    this.queue = []

    try {
      await fetch('/api/analytics/ab-testing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      })
    } catch (error) {
      // En caso de error, volver a añadir los eventos a la cola
      this.queue = [...events, ...this.queue]
      console.error('[A/B Analytics] Failed to send events:', error)
    }
  }

  // Gestión de sesión
  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server'

    let sessionId = sessionStorage.getItem('ab_session_id')
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('ab_session_id', sessionId)
    }
    return sessionId
  }

  // Auto-flush cada 30 segundos
  private startFlushInterval() {
    this.flushInterval = setInterval(() => {
      this.flush()
    }, 30000)
  }

  // Flush cuando el usuario abandona la página
  private attachUnloadHandler() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush()
      })

      // Para navegadores modernos
      window.addEventListener('pagehide', () => {
        this.flush()
      })
    }
  }

  // Limpiar recursos
  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }
    this.flush()
  }
}

// Singleton instance
let analyticsInstance: ABTestingAnalytics | null = null

export function getABAnalytics(): ABTestingAnalytics {
  if (!analyticsInstance) {
    analyticsInstance = new ABTestingAnalytics()
  }
  return analyticsInstance
}

// Hooks de React para facilitar el uso
export function useABAnalytics() {
  if (typeof window === 'undefined') {
    return {
      trackPricingView: () => {},
      trackPlanClick: () => {},
      trackCTAStart: () => {},
    }
  }

  const analytics = getABAnalytics()

  return {
    trackPricingView: analytics.trackPricingView.bind(analytics),
    trackPlanClick: analytics.trackPlanClick.bind(analytics),
    trackCTAStart: analytics.trackCTAStart.bind(analytics),
  }
}
