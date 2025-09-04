'use client'

import { useEffect } from 'react'
import { ArrowRight, Check, Sparkles } from 'lucide-react'

import { useABAnalytics } from '@/lib/analytics/ab-analytics'
import {
  formatPriceWithDiscount,
  getPricingMetadata,
  usePriceVariant,
} from '@/modules/pricing/infrastructure/ab-testing-client'
import { Badge } from '@/modules/shared/presentation/components/ui/badge'
import { Button } from '@/modules/shared/presentation/components/ui/button'
import { Card } from '@/modules/shared/presentation/components/ui/card'

export function PricingTeaserAB() {
  const { variant, pricing } = usePriceVariant()
  const { trackPricingView, trackPlanClick, trackCTAStart } = useABAnalytics()

  // Track view cuando el componente se monta
  useEffect(() => {
    trackPricingView(variant, '/')
  }, [variant, trackPricingView])

  // Formatear precios con descuentos
  const starterPricing = formatPriceWithDiscount(pricing.starter)
  const proPricing = formatPriceWithDiscount(pricing.pro)

  const handleStarterClick = () => {
    const metadata = getPricingMetadata(variant, 'starter')
    trackPlanClick(variant, 'starter', {
      price: metadata.price,
      has_discount: metadata.has_discount,
      discount_percentage: metadata.discount_percentage,
      button_text: 'Empezar gratis',
    })

    trackCTAStart(variant, 'hero', 'Empezar gratis', 'starter')
  }

  const handleProClick = () => {
    const metadata = getPricingMetadata(variant, 'pro')
    trackPlanClick(variant, 'pro', {
      price: metadata.price,
      has_discount: metadata.has_discount,
      discount_percentage: metadata.discount_percentage,
      button_text: 'Elegir Pro',
    })

    trackCTAStart(variant, 'hero', 'Elegir Pro', 'pro')
  }

  return (
    <section className="bg-gradient-to-br from-background via-muted/20 to-background py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <Badge variant="outline" className="mb-4">
            <Sparkles className="mr-1 h-3 w-3" />
            Precios simples, sin sorpresas
          </Badge>
          <h2 className="mb-4 text-4xl font-bold tracking-tight">
            Elige el plan perfecto para tu negocio
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
            Empieza gratis y escala cuando lo necesites. Sin compromisos.
          </p>

        </div>

        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          {/* Starter Plan */}
          <Card className="relative p-8 transition-shadow hover:shadow-lg">
            <div className="mb-6">
              <h3 className="mb-2 text-2xl font-bold">Starter</h3>
              <p className="text-muted-foreground">
                Perfecto para empezar a vender más en WhatsApp
              </p>
            </div>

            <div className="mb-8">
              {starterPricing.hasDiscount ? (
                <div>
                  <div className="mb-1 flex items-baseline gap-2">
                    <span className="text-5xl font-bold">{starterPricing.displayPrice}</span>
                    <span className="text-muted-foreground">/mes</span>
                    {starterPricing.discountBadge && (
                      <Badge variant="destructive" className="ml-2">
                        {starterPricing.discountBadge}
                      </Badge>
                    )}
                  </div>
                  {starterPricing.originalPrice && (
                    <p className="text-muted-foreground text-sm">
                      <span className="line-through">{starterPricing.originalPrice}/mes</span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">{starterPricing.displayPrice}</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
              )}
            </div>

            <ul className="mb-8 space-y-3">
              <li className="flex items-center">
                <Check className="mr-3 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Hasta 1.000 conversaciones/mes</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-3 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Bot con IA conversacional</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-3 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Plantillas pre-diseñadas</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-3 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Badge verde verificado</span>
              </li>
            </ul>

            <Button className="w-full" size="lg" variant="outline" onClick={handleStarterClick}>
              Empezar gratis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>

          {/* Pro Plan */}
          <Card className="border-primary relative border-2 p-8 transition-shadow hover:shadow-xl">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1">
              Más popular
            </Badge>

            <div className="mb-6">
              <h3 className="mb-2 text-2xl font-bold">Pro</h3>
              <p className="text-muted-foreground">Para pymes que buscan escalar rápido</p>
            </div>

            <div className="mb-8">
              {proPricing.hasDiscount ? (
                <div>
                  <div className="mb-1 flex items-baseline gap-2">
                    <span className="text-5xl font-bold">{proPricing.displayPrice}</span>
                    <span className="text-muted-foreground">/mes</span>
                    {proPricing.discountBadge && (
                      <Badge variant="destructive" className="ml-2">
                        {proPricing.discountBadge}
                      </Badge>
                    )}
                  </div>
                  {proPricing.originalPrice && (
                    <p className="text-muted-foreground text-sm">
                      <span className="line-through">{proPricing.originalPrice}/mes</span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">{proPricing.displayPrice}</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
              )}
            </div>

            <ul className="mb-8 space-y-3">
              <li className="flex items-center">
                <Check className="mr-3 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold">Conversaciones ilimitadas</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-3 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>IA avanzada + se conecta con tu sistema</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-3 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Soporte prioritario 24/7</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-3 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Reportes detallados de ventas</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-3 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Conexiones personalizadas</span>
              </li>
            </ul>

            <Button className="w-full" size="lg" onClick={handleProClick}>
              Elegir Pro
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>

          {/* Enterprise Plan */}
          <Card className="relative p-8 transition-shadow hover:shadow-lg border border-secondary/20">
            <div className="mb-6">
              <h3 className="mb-2 text-2xl font-bold">Empresarial</h3>
              <p className="text-muted-foreground">
                Para empresas que necesitan soluciones personalizadas
              </p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-muted-foreground">Precio</span>
                <span className="text-lg text-muted-foreground">personalizado</span>
              </div>
            </div>

            <ul className="mb-8 space-y-3">
              <li className="flex items-center">
                <Check className="mr-3 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Todo lo incluido en Pro</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-3 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Implementación personalizada</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-3 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Garantía de servicio</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-3 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Soporte técnico 24/7</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-3 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Multi-canal y multi-idioma</span>
              </li>
            </ul>

            <Button className="w-full" size="lg" variant="secondary">
              Contactar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm">
            ✨ 14 días de prueba gratis • Sin tarjeta de crédito • Cancela cuando quieras
          </p>
        </div>
      </div>
    </section>
  )
}
