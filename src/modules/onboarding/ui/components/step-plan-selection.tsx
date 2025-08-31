'use client'

import { useEffect,useState } from 'react'
import {
  BarChart3,
  Check,
  CreditCard,
  MessageSquare,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { usePriceVariant } from '@/modules/pricing/infra/ab-testing-client'
import type { PricingPlan } from '@/modules/pricing/infra/ab-testing-types'

import { type PlanSelectionFormData,planSelectionSchema } from '../../domain/schemas'
import type { StepProps } from '../../domain/types'

interface Plan {
  id: 'starter' | 'pro' | 'enterprise'
  name: string
  description: string
  features: string[]
  icon: React.ReactNode
  popular?: boolean
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfecto para pequeños negocios',
    icon: <Zap className="h-5 w-5" />,
    features: [
      'Hasta 1,000 conversaciones/mes',
      'Respuestas automáticas básicas',
      'Horario de atención',
      'Análisis básico',
      'Soporte por email'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Para negocios en crecimiento',
    icon: <TrendingUp className="h-5 w-5" />,
    popular: true,
    features: [
      'Conversaciones ilimitadas',
      'IA avanzada y personalización',
      'Multi-agentes',
      'Análisis detallado',
      'Integración con CRM',
      'Soporte prioritario 24/7'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Soluciones a medida',
    icon: <Shield className="h-5 w-5" />,
    features: [
      'Todo de Pro +',
      'API personalizada',
      'Múltiples números',
      'Manager dedicado',
      'SLA garantizado',
      'Formación personalizada'
    ]
  }
]

const addOns = [
  {
    id: 'extra-numbers',
    name: 'Números adicionales',
    description: '+5 números de WhatsApp',
    price: '15€/mes'
  },
  {
    id: 'priority-support',
    name: 'Soporte VIP',
    description: 'Respuesta en menos de 1 hora',
    price: '25€/mes'
  },
  {
    id: 'custom-ai',
    name: 'IA personalizada',
    description: 'Entrenamiento con tus datos',
    price: '50€/mes'
  }
]

export function StepPlanSelection({ onNext, onPrev, defaultValues }: StepProps) {
  const { variant, pricing } = usePriceVariant()
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>(defaultValues?.addOns || [])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<PlanSelectionFormData>({
    resolver: zodResolver(planSelectionSchema),
    defaultValues: {
      planType: defaultValues?.planType || 'pro',
      billingCycle: defaultValues?.billingCycle || 'monthly',
      addOns: selectedAddOns
    }
  })

  const selectedPlan = watch('planType')
  const billingCycle = watch('billingCycle')

  const getPlanPrice = (planId: 'starter' | 'pro' | 'enterprise') => {
    if (planId === 'enterprise') {
      return { displayPrice: 'Contacto', originalPrice: undefined, hasDiscount: false }
    }

    const planPricing = pricing[planId as keyof PricingPlan]
    const multiplier = billingCycle === 'yearly' ? 10 : 1

    const basePrice = parseInt(planPricing.price.replace('€', ''))
    const displayPrice = billingCycle === 'yearly'
      ? `${basePrice * multiplier}€/año`
      : `${planPricing.price}/mes`

    if (planPricing.originalPrice) {
      const originalBase = parseInt(planPricing.originalPrice.replace('€', ''))
      const originalPrice = billingCycle === 'yearly'
        ? `${originalBase * multiplier}€`
        : planPricing.originalPrice

      return {
        displayPrice,
        originalPrice,
        hasDiscount: true,
        discount: planPricing.discount
      }
    }

    return { displayPrice, originalPrice: undefined, hasDiscount: false }
  }

  const toggleAddOn = (addOnId: string) => {
    const newAddOns = selectedAddOns.includes(addOnId)
      ? selectedAddOns.filter(id => id !== addOnId)
      : [...selectedAddOns, addOnId]

    setSelectedAddOns(newAddOns)
    setValue('addOns', newAddOns)
  }

  const onSubmit = async (data: PlanSelectionFormData) => {
    await onNext({
      ...data,
      priceVariant: variant
    })
  }

  const yearlyDiscount = billingCycle === 'yearly' ? '2 meses GRATIS' : null

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-full bg-indigo-100 text-indigo-600 mb-4">
          <CreditCard className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold">Elige tu plan ideal</h2>
        <p className="text-gray-600">
          Comienza con 14 días gratis. Sin tarjeta de crédito.
        </p>

        {variant !== 'A' && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full text-sm font-medium">
            <Sparkles className="h-3 w-3" />
            Oferta especial - Variante {variant}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="flex items-center justify-center gap-3 p-1 bg-gray-100 rounded-lg max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => setValue('billingCycle', 'monthly')}
            className={cn(
              'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all',
              billingCycle === 'monthly'
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-600'
            )}
          >
            Mensual
          </button>
          <button
            type="button"
            onClick={() => setValue('billingCycle', 'yearly')}
            className={cn(
              'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all relative',
              billingCycle === 'yearly'
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-600'
            )}
          >
            Anual
            {yearlyDiscount && (
              <Badge className="absolute -top-2 -right-2 text-xs" variant="default">
                -17%
              </Badge>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id
            const priceInfo = getPlanPrice(plan.id)

            return (
              <Card
                key={plan.id}
                className={cn(
                  'relative p-6 cursor-pointer transition-all',
                  isSelected
                    ? 'ring-2 ring-indigo-500 shadow-lg scale-[1.02]'
                    : 'hover:shadow-md',
                  plan.popular && 'border-indigo-500'
                )}
                onClick={() => setValue('planType', plan.id)}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="default">
                    <Star className="h-3 w-3 mr-1" />
                    Más popular
                  </Badge>
                )}

                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {plan.icon}
                        <h3 className="font-bold text-lg">{plan.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{plan.description}</p>
                    </div>
                    {isSelected && (
                      <div className="h-6 w-6 rounded-full bg-indigo-500 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="py-3 border-y">
                    <div className="flex items-baseline gap-2">
                      {priceInfo.originalPrice && (
                        <span className="text-gray-400 line-through text-sm">
                          {priceInfo.originalPrice}
                        </span>
                      )}
                      <span className="text-2xl font-bold">{priceInfo.displayPrice}</span>
                    </div>
                    {priceInfo.hasDiscount && priceInfo.discount && (
                      <Badge variant="secondary" className="mt-1">
                        {priceInfo.discount} descuento
                      </Badge>
                    )}
                    {billingCycle === 'yearly' && plan.id !== 'enterprise' && (
                      <p className="text-xs text-green-600 mt-1">
                        Ahorra 2 meses al año
                      </p>
                    )}
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            )
          })}
        </div>

        {selectedPlan !== 'enterprise' && (
          <div className="space-y-3">
            <Label className="text-base font-semibold">Complementos opcionales</Label>
            <div className="space-y-2">
              {addOns.map((addOn) => (
                <div
                  key={addOn.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border transition-colors',
                    selectedAddOns.includes(addOn.id)
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={addOn.id}
                      checked={selectedAddOns.includes(addOn.id)}
                      onCheckedChange={() => toggleAddOn(addOn.id)}
                    />
                    <div>
                      <Label htmlFor={addOn.id} className="cursor-pointer font-medium">
                        {addOn.name}
                      </Label>
                      <p className="text-sm text-gray-600">{addOn.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{addOn.price}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Total estimado:</span>
            <span className="text-xl font-bold text-indigo-600">
              {selectedPlan === 'enterprise'
                ? 'Contactar'
                : getPlanPrice(selectedPlan as 'starter' | 'pro').displayPrice}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            14 días de prueba gratis • Cancela cuando quieras
          </p>
        </div>

        <div className="pt-4 flex gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onPrev}
            className="flex-1"
          >
            Anterior
          </Button>
          <Button
            type="submit"
            size="lg"
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Procesando...' : 'Continuar'}
          </Button>
        </div>
      </form>
    </div>
  )
}