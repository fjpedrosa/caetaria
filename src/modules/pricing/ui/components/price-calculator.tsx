'use client';

import React, { useEffect,useState } from 'react';
import { AlertCircle, Check, Percent, Tag } from 'lucide-react';

import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Skeleton } from '../../../../components/ui/loading-skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Separator } from '../../../../components/ui/separator';
import { 
  useCalculatePriceMutation,
  useGetPricingPlansQuery, 
  useLazyValidateDiscountQuery 
} from '../../infra/services/pricing-api';

interface PriceCalculatorProps {
  onPriceCalculated?: (calculation: any) => void;
  defaultPlanId?: string;
  showQuantity?: boolean;
  showDiscount?: boolean;
}

export function PriceCalculator({ 
  onPriceCalculated, 
  defaultPlanId, 
  showQuantity = true, 
  showDiscount = true 
}: PriceCalculatorProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(defaultPlanId || '');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [quantity, setQuantity] = useState<number>(1);
  const [discountCode, setDiscountCode] = useState<string>('');
  const [discountValidation, setDiscountValidation] = useState<{
    isValid: boolean;
    message?: string;
    discount?: any;
  } | null>(null);

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

  const handleDiscountCodeChange = (code: string) => {
    setDiscountCode(code);
    // Debounce validation
    const timeoutId = setTimeout(() => {
      handleDiscountValidation(code);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const formatPrice = (price: { amount: number; currency: string }) => {
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

  const selectedPlan = pricingData?.plans.find(p => p.id === selectedPlanId);

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
          <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
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
          <Select value={billingPeriod} onValueChange={(value) => setBillingPeriod(value as 'monthly' | 'yearly')}>
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
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
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
              onChange={(e) => handleDiscountCodeChange(e.target.value)}
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