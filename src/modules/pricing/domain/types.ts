/**
 * Pricing Domain Types
 * Type definitions for pricing-related business concepts
 */

// AB Testing Types
export const PRICE_VARIANTS = ['A', 'B', 'C'] as const;
export type PriceVariant = typeof PRICE_VARIANTS[number];

export interface PricingPlan {
  starter: {
    price: string;
    originalPrice?: string;
    discount?: string;
  };
  pro: {
    price: string;
    originalPrice?: string;
    discount?: string;
  };
}

// Price configuration mapping by variant
export const PRICING_MAP: Record<PriceVariant, PricingPlan> = {
  A: {
    starter: {
      price: '20€',
    },
    pro: {
      price: '40€',
    }
  },
  B: {
    starter: {
      price: '40€',
      originalPrice: '49€',
      discount: '-18%'
    },
    pro: {
      price: '60€',
      originalPrice: '79€',
      discount: '-24%'
    }
  },
  C: {
    starter: {
      price: '100€',
      originalPrice: '149€',
      discount: '-33%'
    },
    pro: {
      price: '150€',
      originalPrice: '199€',
      discount: '-25%'
    }
  }
};