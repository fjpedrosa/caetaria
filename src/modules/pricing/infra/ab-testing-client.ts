// Client-side AB testing utilities
// This file contains only client-safe functions without server-only imports

import type { PriceVariant, PricingPlan } from './ab-testing-types';
import { PRICE_VARIANTS, PRICING_MAP } from './ab-testing-types';

// Validador de variante
function isValidVariant(variant: string): variant is PriceVariant {
  return PRICE_VARIANTS.includes(variant as PriceVariant);
}

// Hook para Client Components
export function usePriceVariant(): { variant: PriceVariant; pricing: PricingPlan } {
  if (typeof window !== 'undefined') {
    // Leer cookie en cliente
    const match = document.cookie.match(/price_var=([^;]+)/);
    const variant = match?.[1] as PriceVariant;
    
    if (variant && isValidVariant(variant)) {
      return {
        variant,
        pricing: PRICING_MAP[variant]
      };
    }
  }
  
  return {
    variant: 'A',
    pricing: PRICING_MAP['A']
  };
}

// Helper para formatear precios con descuento
export function formatPriceWithDiscount(plan: PricingPlan['starter'] | PricingPlan['pro']): {
  displayPrice: string;
  originalPrice?: string;
  discountBadge?: string;
  hasDiscount: boolean;
} {
  return {
    displayPrice: plan.price,
    originalPrice: plan.originalPrice,
    discountBadge: plan.discount,
    hasDiscount: !!plan.originalPrice
  };
}

// Metadata para analytics
export function getPricingMetadata(variant: PriceVariant, planType: 'starter' | 'pro') {
  const pricing = PRICING_MAP[variant];
  const plan = pricing[planType];
  
  return {
    variant,
    plan_type: planType,
    price: plan.price,
    has_discount: !!plan.originalPrice,
    discount_percentage: plan.discount
  };
}