import { baseApi } from '../../../../store/api/base-api';
import { PricingPlan, Discount } from '../../domain';
import { GetPricingPlansRequest, GetPricingPlansResponse } from '../../application/use-cases/get-pricing-plans';
import { CalculatePriceRequest, CalculatePriceResponse } from '../../application/use-cases/calculate-price';
import { ApplyDiscountRequest, ApplyDiscountResponse } from '../../application/use-cases/apply-discount';

// API types for serialization
export interface PricingPlanApiModel {
  id: string;
  name: string;
  description: string;
  price: {
    amount: number;
    currency: string;
  };
  billingPeriod: 'monthly' | 'yearly';
  features: Array<{
    id: string;
    name: string;
    description: string;
    included: boolean;
    limit?: number;
  }>;
  isPopular: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountApiModel {
  id: string;
  code: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  currency?: string;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  applicablePlans: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GetPricingPlansApiRequest extends GetPricingPlansRequest {}

export interface GetPricingPlansApiResponse {
  plans: PricingPlanApiModel[];
  totalCount: number;
}

export interface CalculatePriceApiRequest extends CalculatePriceRequest {}

export interface CalculatePriceApiResponse {
  originalPrice: { amount: number; currency: string };
  discountAmount: { amount: number; currency: string };
  finalPrice: { amount: number; currency: string };
  appliedDiscount?: DiscountApiModel;
  billingPeriod: 'monthly' | 'yearly';
  priceBreakdown: {
    basePrice: { amount: number; currency: string };
    discountApplied: boolean;
    discountPercentage?: number;
    savingsAmount?: { amount: number; currency: string };
  };
}

export interface ApplyDiscountApiRequest extends ApplyDiscountRequest {}

export interface ApplyDiscountApiResponse {
  discount: DiscountApiModel;
  discountAmount: { amount: number; currency: string };
  finalAmount: { amount: number; currency: string };
  discountPercentage?: number;
  isValid: boolean;
  validationMessage?: string;
}

export interface ValidateDiscountApiRequest {
  discountCode: string;
  planId: string;
}

export interface ValidateDiscountApiResponse {
  isValid: boolean;
  discount?: DiscountApiModel;
  validationMessage?: string;
}

export const pricingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all pricing plans with filtering options
    getPricingPlans: builder.query<GetPricingPlansApiResponse, GetPricingPlansApiRequest>({
      query: (params) => ({
        url: '/pricing/plans',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.plans.map(({ id }) => ({ type: 'PricingPlan' as const, id })),
              { type: 'PricingPlan', id: 'LIST' },
            ]
          : [{ type: 'PricingPlan', id: 'LIST' }],
    }),

    // Get a specific pricing plan by ID
    getPricingPlan: builder.query<PricingPlanApiModel, string>({
      query: (id) => `/pricing/plans/${id}`,
      providesTags: (result, error, id) => [{ type: 'PricingPlan', id }],
    }),

    // Calculate price with optional discount
    calculatePrice: builder.mutation<CalculatePriceApiResponse, CalculatePriceApiRequest>({
      query: (body) => ({
        url: '/pricing/calculate',
        method: 'POST',
        body,
      }),
    }),

    // Apply discount code
    applyDiscount: builder.mutation<ApplyDiscountApiResponse, ApplyDiscountApiRequest>({
      query: (body) => ({
        url: '/pricing/discount/apply',
        method: 'POST',
        body,
      }),
    }),

    // Validate discount code without applying
    validateDiscount: builder.query<ValidateDiscountApiResponse, ValidateDiscountApiRequest>({
      query: (params) => ({
        url: '/pricing/discount/validate',
        method: 'GET',
        params,
      }),
    }),

    // Confirm discount usage (increment usage count)
    confirmDiscountUsage: builder.mutation<void, { discountCode: string }>({
      query: (body) => ({
        url: '/pricing/discount/confirm',
        method: 'POST',
        body,
      }),
    }),

    // Get active discounts
    getActiveDiscounts: builder.query<DiscountApiModel[], void>({
      query: () => '/pricing/discounts/active',
      providesTags: [{ type: 'Discount', id: 'LIST' }],
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetPricingPlansQuery,
  useGetPricingPlanQuery,
  useCalculatePriceMutation,
  useApplyDiscountMutation,
  useValidateDiscountQuery,
  useLazyValidateDiscountQuery,
  useConfirmDiscountUsageMutation,
  useGetActiveDiscountsQuery,
} = pricingApi;

// Export API for direct usage in use cases
export default pricingApi;