'use client';

import { useRef,useState } from 'react';
import { AnimatePresence,motion, useInView } from 'framer-motion';
import { ArrowRight, Check, Crown, Loader2,Sparkles, Star, Zap } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

interface PricingPlan {
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular: boolean;
}

// Default pricing plans data
const defaultPlans: PricingPlan[] = [
  {
    name: 'Starter',
    price: 49,
    period: 'month',
    description: 'Perfect for small businesses',
    features: [
      'Up to 1,000 conversations/month',
      'AI-powered chatbot',
      'Pre-designed templates',
      'Email support',
      'Verified green badge',
      'Basic analytics dashboard'
    ],
    popular: false
  },
  {
    name: 'Pro',
    price: 149,
    period: 'month',
    description: 'For growing businesses',
    features: [
      'Unlimited conversations',
      'IA avanzada + conecta con tu sistema',
      'Custom templates',
      '24/7 priority support',
      'Reportes detallados de ventas',
      'Conexiones personalizadas',
      'Multi-agent support',
      'Data export'
    ],
    popular: true
  },
  {
    name: 'Empresarial',
    price: 499,
    period: 'month',
    description: 'For large organizations',
    features: [
      'Everything in Pro',
      'Dedicated account manager',
      'Custom AI training',
      'Garantía de servicio',
      'White-label options',
      'Multiple workspaces',
      'Advanced security features',
      'Custom integrations'
    ],
    popular: false
  }
];

interface PricingCardsProps {
  plans?: PricingPlan[];
}

/**
 * Pricing Cards Component - Client Component
 *
 * Interactive pricing section with plan comparison,
 * billing period toggle, and CTA buttons.
 */
export function PricingCards({ plans = defaultPlans }: PricingCardsProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  // Calculate yearly pricing with discount
  const getPrice = (monthlyPrice: number) => {
    if (billingPeriod === 'yearly') {
      return Math.round(monthlyPrice * 10); // 2 months free
    }
    return monthlyPrice;
  };

  const handlePlanSelect = async (planName: string) => {
    setLoadingPlan(planName);
    setSelectedPlan(planName);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setLoadingPlan(null);
    console.log(`Selected plan: ${planName}`);
  };

  const toggleBilling = () => {
    setBillingPeriod(prev => prev === 'monthly' ? 'yearly' : 'monthly');
  };

  return (
    <section ref={ref} id="pricing" className="py-20 bg-gradient-to-br from-background via-muted/20 to-background overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Badge variant="outline" className="px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Flexible Pricing
            </Badge>
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Choose the Perfect Plan
            <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              for Your Business
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Start free, scale as you grow. All plans include our core features
            with transparent, usage-based pricing.
          </p>

          {/* Billing Period Toggle - Mobile optimized */}
          <motion.div
            className="flex items-center justify-center space-x-2 sm:space-x-4 bg-gray-100 rounded-lg p-1 w-fit mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 sm:px-6 py-2.5 min-h-[44px] rounded-md text-sm font-semibold transition-all touch-manipulation ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 active:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 sm:px-6 py-2.5 min-h-[44px] rounded-md text-sm font-semibold transition-all relative touch-manipulation ${
                billingPeriod === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 active:text-gray-900'
              }`}
            >
              Yearly
              <Badge className="absolute -top-1.5 sm:-top-2 -right-1.5 sm:-right-2 bg-green-500 text-white text-xs px-1.5 sm:px-2 py-0.5">
                <span className="hidden sm:inline">Save </span>20%
              </Badge>
            </button>
          </motion.div>
        </motion.div>

        {/* Pricing Cards Grid - Mobile optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const isPopular = plan.popular;
            const currentPrice = getPrice(plan.price);
            const isSelected = selectedPlan === plan.name;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <Card
                  className={`relative p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 cursor-pointer touch-manipulation ${
                    isPopular
                      ? 'ring-2 ring-green-500 shadow-xl sm:scale-105 bg-gradient-to-br from-green-50 to-blue-50'
                      : 'hover:shadow-xl bg-white'
                  } ${
                    isSelected ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handlePlanSelect(plan.name)}
                >
                {/* Popular Badge - Mobile responsive */}
                {isPopular && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 font-semibold text-xs sm:text-sm">
                      🎆 <span className="hidden sm:inline">Most </span>Popular
                    </Badge>
                  </div>
                )}

                {/* Plan Header - Mobile responsive */}
                <div className="text-center mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{plan.description}</p>

                  {/* Price - Mobile responsive */}
                  <div className="mb-4">
                    <div className="flex items-center justify-center">
                      <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">${currentPrice}</span>
                      <span className="text-gray-500 ml-2 text-sm sm:text-base">/{billingPeriod === 'yearly' ? 'year' : 'month'}</span>
                    </div>

                    {billingPeriod === 'yearly' && (
                      <div className="text-xs sm:text-sm text-green-600 font-semibold mt-2">
                        <span className="block sm:inline">Save ${plan.price * 2}/year</span>
                        <span className="hidden sm:inline"> • </span>
                        <span className="block sm:inline">2 months free</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Features List - Mobile responsive */}
                <div className="mb-6 sm:mb-8">
                  <ul className="space-y-3 sm:space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3 min-h-[40px]">
                        <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm sm:text-base text-gray-700 leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button - Mobile optimized */}
                <Button
                  onClick={() => handlePlanSelect(plan.name)}
                  className={`w-full py-3 sm:py-4 text-base sm:text-lg font-semibold transition-all duration-200 group min-h-[48px] touch-manipulation ${
                    isPopular
                      ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 active:from-green-800 active:to-blue-800 text-white shadow-lg'
                      : 'border-2 border-gray-300 hover:border-green-500 active:border-green-600 bg-white hover:bg-green-50 active:bg-green-100 text-gray-900'
                  }`}
                >
                  {plan.name === 'Empresarial' ? 'Contactar Ventas' : 'Prueba Gratis'}
                  {isPopular ? (
                    <Zap className="ml-2 w-5 h-5 group-hover:animate-pulse" />
                  ) : (
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  )}
                </Button>

                {/* Trust Indicator - Mobile responsive */}
                <div className="text-center mt-3 sm:mt-4">
                  <div className="text-xs sm:text-sm text-gray-500">
                    {plan.name === 'Empresarial' ? (
                      'Custom pricing available'
                    ) : (
                      <>
                        <span className="block sm:inline">14-day free trial</span>
                        <span className="hidden sm:inline"> • </span>
                        <span className="block sm:inline">No credit card required</span>
                      </>
                    )}
                  </div>
                </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Features Comparison */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 bg-gray-50 rounded-full px-6 py-3 mb-8">
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
            <span className="text-gray-700 font-semibold">Todos los planes incluyen soporte 24/7 y funcionamiento garantizado</span>
          </div>

          <p className="text-gray-600 mb-6">
            Need a custom plan for your enterprise? We offer tailored solutions for large-scale deployments.
          </p>

          <Button
            variant="outline"
            className="border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 px-8 py-3 font-semibold"
          >
            Compare All Features
          </Button>
        </div>

        {/* Money Back Guarantee */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-3 bg-green-50 rounded-2xl px-8 py-4 border border-green-200">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-left">
              <div className="font-bold text-green-900">30-day money-back guarantee</div>
              <div className="text-green-700">Not satisfied? Get a full refund, no questions asked.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}