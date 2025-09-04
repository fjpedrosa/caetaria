/**
 * Price Calculator Hook - Business Logic Layer
 * Handles all state management, API calls, and business logic for price calculation
 */

import { useEffect, useState } from 'react';

import {
  useCalculatePriceMutation,
  useGetPricingPlansQuery,
  useLazyValidateDiscountQuery
} from '../../infrastructure/services/pricing-api';

export interface PriceCalculatorOptions {
  onPriceCalculated?: (calculation: any) => void;
  defaultPlanId?: string;
  showQuantity?: boolean;
  showDiscount?: boolean;
}

export interface DiscountValidation {
  isValid: boolean;
  message?: string;
  discount?: any;
}

export interface UsePriceCalculatorResult {
  // State
  selectedPlanId: string;
  billingPeriod: 'monthly' | 'yearly';
  quantity: number;
  discountCode: string;
  discountValidation: DiscountValidation | null;

  // Computed state
  pricingData: any;
  calculation: any;
  selectedPlan: any;

  // Loading states
  plansLoading: boolean;
  calculating: boolean;
  validatingDiscount: boolean;

  // Error states
  calculationError: any;

  // Actions
  setSelectedPlanId: (planId: string) => void;
  setBillingPeriod: (period: 'monthly' | 'yearly') => void;
  setQuantity: (quantity: number) => void;
  handleDiscountCodeChange: (code: string) => void;
  formatPrice: (price: { amount: number; currency: string }) => string;
}

/**
 * Custom hook for price calculation business logic
 */
export const usePriceCalculator = ({
  onPriceCalculated,
  defaultPlanId,
  showQuantity = true,
  showDiscount = true
}: PriceCalculatorOptions): UsePriceCalculatorResult => {
  // State management
  const [selectedPlanId, setSelectedPlanId] = useState<string>(defaultPlanId || '');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [quantity, setQuantity] = useState<number>(1);
  const [discountCode, setDiscountCode] = useState<string>('');
  const [discountValidation, setDiscountValidation] = useState<DiscountValidation | null>(null);

  // API hooks
  const { data: pricingData, isLoading: plansLoading } = useGetPricingPlansQuery({
    includeInactive: false
  });

  const [calculatePrice, {
    data: calculation,
    isLoading: calculating,
    error: calculationError
  }] = useCalculatePriceMutation();

  const [validateDiscount, {
    isLoading: validatingDiscount
  }] = useLazyValidateDiscountQuery();

  // Computed values
  const selectedPlan = pricingData?.plans.find(p => p.id === selectedPlanId);

  // Set default plan if available
  useEffect(() => {
    if (!selectedPlanId && pricingData?.plans.length) {
      const defaultPlan = pricingData.plans.find(p => p.isPopular) || pricingData.plans[0];
      setSelectedPlanId(defaultPlan.id);
    }
  }, [pricingData, selectedPlanId]);

  // Calculate price when inputs change
  useEffect(() => {
    if (selectedPlanId) {
      handleCalculate();
    }
  }, [selectedPlanId, billingPeriod, quantity, discountValidation]);

  // Notify parent of calculation changes
  useEffect(() => {
    if (calculation) {
      onPriceCalculated?.(calculation);
    }
  }, [calculation, onPriceCalculated]);

  /**
   * Handle price calculation
   */
  const handleCalculate = async () => {
    if (!selectedPlanId) return;

    try {
      await calculatePrice({
        planId: selectedPlanId,
        billingPeriod,
        quantity: showQuantity ? quantity : 1,
        discountCode: discountValidation?.isValid ? discountCode : undefined,
      });
    } catch (error) {
      console.error('Price calculation failed:', error);
    }
  };

  /**
   * Handle discount code validation
   */
  const handleDiscountValidation = async (code: string) => {
    if (!code.trim() || !selectedPlanId) {
      setDiscountValidation(null);
      return;
    }

    try {
      const result = await validateDiscount({
        discountCode: code.trim().toUpperCase(),
        planId: selectedPlanId,
      });

      if (result.data) {
        setDiscountValidation(result.data);
      }
    } catch (error) {
      setDiscountValidation({
        isValid: false,
        message: 'Failed to validate discount code',
      });
    }
  };

  /**
   * Handle discount code change with debouncing
   */
  const handleDiscountCodeChange = (code: string) => {
    setDiscountCode(code);
    // Debounce validation
    const timeoutId = setTimeout(() => {
      handleDiscountValidation(code);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  /**
   * Format price with currency symbol
   */
  const formatPrice = (price: { amount: number; currency: string }): string => {
    const currencySymbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      ZAR: 'R',
      NGN: '₦',
      KES: 'KSh',
      GHS: '₵'
    };

    const symbol = currencySymbols[price.currency] || price.currency;
    return `${symbol}${price.amount.toFixed(2)}`;
  };

  return {
    // State
    selectedPlanId,
    billingPeriod,
    quantity,
    discountCode,
    discountValidation,

    // Computed state
    pricingData,
    calculation,
    selectedPlan,

    // Loading states
    plansLoading,
    calculating,
    validatingDiscount,

    // Error states
    calculationError,

    // Actions
    setSelectedPlanId,
    setBillingPeriod,
    setQuantity,
    handleDiscountCodeChange,
    formatPrice
  };
};

/**
 * Utility function to create price calculator options
 */
export const createPriceCalculatorOptions = (
  options: Partial<PriceCalculatorOptions> = {}
): PriceCalculatorOptions => ({
  showQuantity: true,
  showDiscount: true,
  ...options
});