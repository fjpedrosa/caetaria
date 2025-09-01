import { Currency } from '../value-objects/currency';
import { createPrice, multiplyPrice,Price, PriceInterface } from '../value-objects/price';

export interface PricingFeature {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly included: boolean;
  readonly limit?: number;
}

export interface PricingPlan {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: PriceInterface;
  readonly billingPeriod: 'monthly' | 'yearly';
  readonly features: PricingFeature[];
  readonly isPopular: boolean;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// =============================================================================
// FUNCTIONAL PRICING PLAN OPERATIONS - Pure functions replacing PricingPlanEntity class
// =============================================================================

/**
 * @deprecated Use PricingPlan interface with functional operations instead
 * Backwards compatibility alias for legacy code
 */
export type PricingPlanEntity = PricingPlan;

/**
 * Check if a pricing plan has a specific feature
 */
export const hasPlanFeature = (plan: PricingPlan, featureId: string): boolean => {
  return plan.features.some(feature => feature.id === featureId && feature.included);
};

/**
 * Get the limit for a specific feature in a pricing plan
 */
export const getPlanFeatureLimit = (plan: PricingPlan, featureId: string): number | null => {
  const feature = plan.features.find(f => f.id === featureId && f.included);
  return feature?.limit ?? null;
};

/**
 * Calculate yearly price for a plan (with 20% discount for monthly plans)
 */
export const calculateYearlyPrice = (plan: PricingPlan): PriceInterface => {
  if (plan.billingPeriod === 'yearly') {
    return plan.price;
  }
  // Apply typical 20% yearly discount
  const yearlyAmount = plan.price.amount * 12 * 0.8;
  return createPrice(yearlyAmount, plan.price.currency);
};

/**
 * Calculate monthly equivalent price for a yearly plan
 */
export const calculateMonthlyPrice = (plan: PricingPlan): PriceInterface => {
  if (plan.billingPeriod === 'monthly') {
    return plan.price;
  }
  // Convert yearly to monthly
  const monthlyAmount = plan.price.amount / 12;
  return createPrice(monthlyAmount, plan.price.currency);
};

/**
 * Create a new pricing plan with timestamps (factory function)
 */
export const createPricingPlan = (
  data: Omit<PricingPlan, 'createdAt' | 'updatedAt'>
): PricingPlan => {
  const now = new Date();
  return {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Update a pricing plan with new data (immutable)
 */
export const updatePricingPlan = (
  plan: PricingPlan,
  updates: Partial<Pick<PricingPlan, 'name' | 'description' | 'price' | 'features' | 'isPopular' | 'isActive'>>
): PricingPlan => ({
  ...plan,
  ...updates,
  updatedAt: new Date(),
});

/**
 * Add a feature to a pricing plan (immutable)
 */
export const addPlanFeature = (plan: PricingPlan, feature: PricingFeature): PricingPlan => {
  // Check if feature already exists
  if (plan.features.some(f => f.id === feature.id)) {
    return plan;
  }

  return {
    ...plan,
    features: [...plan.features, feature],
    updatedAt: new Date(),
  };
};

/**
 * Remove a feature from a pricing plan (immutable)
 */
export const removePlanFeature = (plan: PricingPlan, featureId: string): PricingPlan => ({
  ...plan,
  features: plan.features.filter(f => f.id !== featureId),
  updatedAt: new Date(),
});

/**
 * Update a specific feature in a pricing plan (immutable)
 */
export const updatePlanFeature = (
  plan: PricingPlan,
  featureId: string,
  updates: Partial<PricingFeature>
): PricingPlan => ({
  ...plan,
  features: plan.features.map(feature =>
    feature.id === featureId ? { ...feature, ...updates } : feature
  ),
  updatedAt: new Date(),
});

/**
 * Toggle the active status of a pricing plan
 */
export const togglePlanActive = (plan: PricingPlan): PricingPlan => ({
  ...plan,
  isActive: !plan.isActive,
  updatedAt: new Date(),
});

/**
 * Mark a plan as popular (and optionally unmark others)
 */
export const markPlanAsPopular = (plan: PricingPlan): PricingPlan => ({
  ...plan,
  isPopular: true,
  updatedAt: new Date(),
});

/**
 * Compare two pricing plans by price
 */
export const comparePlansByPrice = (planA: PricingPlan, planB: PricingPlan): number => {
  // Convert both to monthly equivalent for fair comparison
  const monthlyA = calculateMonthlyPrice(planA);
  const monthlyB = calculateMonthlyPrice(planB);

  return monthlyA.amount - monthlyB.amount;
};

// =============================================================================
// FUNCTIONAL VALIDATION AND FILTERING
// =============================================================================

/**
 * Validate pricing plan data (pure function)
 */
export const validatePricingPlan = (plan: PricingPlan): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!plan.id) errors.push('Plan ID is required');
  if (!plan.name.trim()) errors.push('Plan name is required');
  if (!plan.description.trim()) errors.push('Plan description is required');
  if (!plan.price) errors.push('Plan price is required');
  if (!['monthly', 'yearly'].includes(plan.billingPeriod)) {
    errors.push('Invalid billing period');
  }
  if (plan.features.length === 0) errors.push('At least one feature is required');

  // Validate features
  plan.features.forEach((feature, index) => {
    if (!feature.id) errors.push(`Feature ${index + 1}: ID is required`);
    if (!feature.name.trim()) errors.push(`Feature ${index + 1}: Name is required`);
    if (!feature.description.trim()) errors.push(`Feature ${index + 1}: Description is required`);
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Filter pricing plans by criteria (pure function)
 */
export const filterPricingPlans = (
  plans: PricingPlan[],
  criteria: Partial<{
    isActive: boolean;
    isPopular: boolean;
    billingPeriod: 'monthly' | 'yearly';
    hasFeature: string;
    maxPrice: number;
    minPrice: number;
  }>
): PricingPlan[] => {
  return plans.filter(plan => {
    if (criteria.isActive !== undefined && plan.isActive !== criteria.isActive) return false;
    if (criteria.isPopular !== undefined && plan.isPopular !== criteria.isPopular) return false;
    if (criteria.billingPeriod && plan.billingPeriod !== criteria.billingPeriod) return false;
    if (criteria.hasFeature && !hasPlanFeature(plan, criteria.hasFeature)) return false;

    // Price filtering (convert to monthly equivalent)
    const monthlyPrice = calculateMonthlyPrice(plan);
    if (criteria.maxPrice && monthlyPrice.amount > criteria.maxPrice) return false;
    if (criteria.minPrice && monthlyPrice.amount < criteria.minPrice) return false;

    return true;
  });
};

/**
 * Sort pricing plans by various criteria
 */
export const sortPricingPlans = (
  plans: PricingPlan[],
  sortBy: 'price' | 'name' | 'popularity' | 'createdAt',
  order: 'asc' | 'desc' = 'asc'
): PricingPlan[] => {
  const sorted = [...plans].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'price':
        comparison = comparePlansByPrice(a, b);
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'popularity':
        comparison = (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
        break;
      case 'createdAt':
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
        break;
    }

    return order === 'desc' ? -comparison : comparison;
  });

  return sorted;
};

/**
 * Get the most popular active plan
 */
export const getPopularPlan = (plans: PricingPlan[]): PricingPlan | null => {
  const popularPlans = filterPricingPlans(plans, { isActive: true, isPopular: true });
  return popularPlans.length > 0 ? popularPlans[0] : null;
};

/**
 * Get plans within a price range
 */
export const getPlansInPriceRange = (
  plans: PricingPlan[],
  minPrice: number,
  maxPrice: number
): PricingPlan[] => {
  return filterPricingPlans(plans, { minPrice, maxPrice });
};