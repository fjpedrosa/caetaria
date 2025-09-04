'use client';

import React from 'react';
import { AlertCircle, Check, Percent, Tag } from 'lucide-react';

import { Badge } from '../../../shared/presentation/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/presentation/components/ui/card';
import { Input } from '../../../shared/presentation/components/ui/input';
import { Label } from '../../../shared/presentation/components/ui/label';
import { Skeleton } from '../../../shared/presentation/components/ui/loading-skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/presentation/components/ui/select';
import { Separator } from '../../../shared/presentation/components/ui/separator';
import type { UsePriceCalculatorResult } from '../../presentation/hooks/use-price-calculator';

interface PriceCalculatorProps {
  // State from hook
  selectedPlanId: string;
  billingPeriod: 'monthly' | 'yearly';
  quantity: number;
  discountCode: string;
  discountValidation: UsePriceCalculatorResult['discountValidation'];

  // Computed state from hook
  pricingData: any;
  calculation: any;
  selectedPlan: any;

  // Loading states from hook
  plansLoading: boolean;
  calculating: boolean;
  validatingDiscount: boolean;

  // Error states from hook
  calculationError: any;

  // Actions from hook
  onSelectedPlanChange: (planId: string) => void;
  onBillingPeriodChange: (period: 'monthly' | 'yearly') => void;
  onQuantityChange: (quantity: number) => void;
  onDiscountCodeChange: (code: string) => void;
  formatPrice: (price: { amount: number; currency: string }) => string;

  // Options
  showQuantity?: boolean;
  showDiscount?: boolean;
}

export function PriceCalculator({
  // State from hook
  selectedPlanId,
  billingPeriod,
  quantity,
  discountCode,
  discountValidation,

  // Computed state from hook
  pricingData,
  calculation,
  selectedPlan,

  // Loading states from hook
  plansLoading,
  calculating,
  validatingDiscount,

  // Error states from hook
  calculationError,

  // Actions from hook
  onSelectedPlanChange,
  onBillingPeriodChange,
  onQuantityChange,
  onDiscountCodeChange,
  formatPrice,

  // Options
  showQuantity = true,
  showDiscount = true
}: PriceCalculatorProps) {

  if (plansLoading) {
    return <Skeleton className="h-96" />;
  }

  if (!pricingData?.plans.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">
            No pricing plans available for calculation.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Price Calculator
        </CardTitle>
        <CardDescription>
          Calculate your total cost with optional discounts
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Plan Selection */}
        <div className="space-y-2">
          <Label htmlFor="plan-select">Select Plan</Label>
          <Select value={selectedPlanId} onValueChange={onSelectedPlanChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a plan" />
            </SelectTrigger>
            <SelectContent>
              {pricingData.plans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{plan.name}</span>
                    {plan.isPopular && (
                      <Badge variant="secondary" className="ml-2">
                        Popular
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Billing Period */}
        <div className="space-y-2">
          <Label htmlFor="billing-period">Billing Period</Label>
          <Select value={billingPeriod} onValueChange={(value) => onBillingPeriodChange(value as 'monthly' | 'yearly')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">
                <div className="flex items-center gap-2">
                  Yearly
                  <Badge variant="secondary" className="text-xs">
                    Save 20%
                  </Badge>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quantity */}
        {showQuantity && (
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max="100"
              value={quantity}
              onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
            />
          </div>
        )}

        {/* Discount Code */}
        {showDiscount && (
          <div className="space-y-2">
            <Label htmlFor="discount-code">Discount Code (Optional)</Label>
            <Input
              id="discount-code"
              placeholder="Enter discount code"
              value={discountCode}
              onChange={(e) => onDiscountCodeChange(e.target.value)}
            />
            {validatingDiscount && (
              <p className="text-xs text-muted-foreground">Validating...</p>
            )}
            {discountValidation && (
              <div className={`flex items-center gap-2 text-xs ${
                discountValidation.isValid ? 'text-green-600' : 'text-destructive'
              }`}>
                {discountValidation.isValid ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <AlertCircle className="h-3 w-3" />
                )}
                <span>
                  {discountValidation.message ||
                    (discountValidation.isValid ? 'Valid discount code' : 'Invalid discount code')
                  }
                </span>
              </div>
            )}
          </div>
        )}

        {/* Price Breakdown */}
        {calculation && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-medium">Price Breakdown</h4>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base Price</span>
                  <span>{formatPrice(calculation.priceBreakdown.basePrice)}</span>
                </div>

                {showQuantity && quantity > 1 && (
                  <div className="flex justify-between">
                    <span>Quantity ({quantity})</span>
                    <span>{formatPrice(calculation.originalPrice)}</span>
                  </div>
                )}

                {calculation.priceBreakdown.savingsAmount && (
                  <div className="flex justify-between text-green-600">
                    <span>Yearly Savings</span>
                    <span>-{formatPrice(calculation.priceBreakdown.savingsAmount)}</span>
                  </div>
                )}

                {calculation.priceBreakdown.discountApplied && (
                  <div className="flex justify-between text-green-600">
                    <div className="flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      <span>Discount Applied</span>
                    </div>
                    <span>-{formatPrice(calculation.discountAmount)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>{formatPrice(calculation.finalPrice)}</span>
                </div>

                <p className="text-xs text-muted-foreground">
                  {billingPeriod === 'monthly' ? 'per month' : 'per year'}
                </p>
              </div>
            </div>
          </>
        )}

        {calculationError && (
          <div className="flex items-center gap-2 text-xs text-destructive">
            <AlertCircle className="h-3 w-3" />
            <span>Failed to calculate price. Please try again.</span>
          </div>
        )}

        {calculating && (
          <div className="text-center text-xs text-muted-foreground">
            Calculating...
          </div>
        )}
      </CardContent>
    </Card>
  );
}