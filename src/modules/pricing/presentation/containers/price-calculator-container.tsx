/**
 * Price Calculator Container - Connects business logic with presentation
 * Container component that bridges the usePriceCalculator hook with PriceCalculator component
 */

'use client';

import React from 'react';

import { type PriceCalculatorOptions,usePriceCalculator } from '../../presentation/hooks/use-price-calculator';
import { PriceCalculator } from '../components/price-calculator';

interface PriceCalculatorContainerProps extends PriceCalculatorOptions {
  className?: string;
}

/**
 * Container component for price calculator
 * Handles all business logic via custom hook and passes props to presentational component
 */
export function PriceCalculatorContainer({
  onPriceCalculated,
  defaultPlanId,
  showQuantity = true,
  showDiscount = true,
  className
}: PriceCalculatorContainerProps) {
  // Extract all business logic from custom hook
  const {
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
  } = usePriceCalculator({
    onPriceCalculated,
    defaultPlanId,
    showQuantity,
    showDiscount
  });

  return (
    <div className={className}>
      <PriceCalculator
        // State from hook
        selectedPlanId={selectedPlanId}
        billingPeriod={billingPeriod}
        quantity={quantity}
        discountCode={discountCode}
        discountValidation={discountValidation}

        // Computed state from hook
        pricingData={pricingData}
        calculation={calculation}
        selectedPlan={selectedPlan}

        // Loading states from hook
        plansLoading={plansLoading}
        calculating={calculating}
        validatingDiscount={validatingDiscount}

        // Error states from hook
        calculationError={calculationError}

        // Actions from hook
        onSelectedPlanChange={setSelectedPlanId}
        onBillingPeriodChange={setBillingPeriod}
        onQuantityChange={setQuantity}
        onDiscountCodeChange={handleDiscountCodeChange}
        formatPrice={formatPrice}

        // Options
        showQuantity={showQuantity}
        showDiscount={showDiscount}
      />
    </div>
  );
}

/**
 * Export the container as the default PriceCalculator for backward compatibility
 * This allows existing imports to continue working while providing the new architecture
 */
export default PriceCalculatorContainer;