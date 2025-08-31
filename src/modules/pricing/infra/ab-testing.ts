import { cookies, headers } from 'next/headers';

import type { PriceVariant, PricingPlan } from './ab-testing-types';
import { PRICE_VARIANTS, PRICING_MAP } from './ab-testing-types';

// Re-export types for backward compatibility
export type { PriceVariant, PricingPlan } from './ab-testing-types';
export { PRICE_VARIANTS, PRICING_MAP } from './ab-testing-types';

// Helper para obtener variante en Server Components
export async function getPriceVariant(): Promise<PriceVariant> {
  // Intentar obtener desde headers (establecido por middleware)
  const headersList = await headers();
  const headerVariant = headersList.get('x-price-variant');

  if (headerVariant && isValidVariant(headerVariant)) {
    return headerVariant;
  }

  // Fallback a cookie
  const cookieStore = await cookies();
  const cookieVariant = cookieStore.get('price_var')?.value;

  if (cookieVariant && isValidVariant(cookieVariant)) {
    return cookieVariant;
  }

  // Default
  return 'A';
}

// Helper para obtener precios según variante
export async function getVariantPricing(): Promise<{ variant: PriceVariant; pricing: PricingPlan }> {
  const variant = await getPriceVariant();
  return {
    variant,
    pricing: PRICING_MAP[variant]
  };
}

// Validador de variante
function isValidVariant(variant: string): variant is PriceVariant {
  return PRICE_VARIANTS.includes(variant as PriceVariant);
}