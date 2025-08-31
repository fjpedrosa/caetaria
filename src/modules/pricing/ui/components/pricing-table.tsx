'use client';

import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Skeleton } from '../../../../components/ui/loading-skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { useGetPricingPlansQuery } from '../../infra/services/pricing-api';

interface PricingTableProps {
  onPlanSelect?: (planId: string, billingPeriod: 'monthly' | 'yearly') => void;
  selectedPlanId?: string;
  showComparison?: boolean;
  maxPlansToShow?: number;
}

export function PricingTable({
  onPlanSelect,
  selectedPlanId,
  showComparison = true,
  maxPlansToShow
}: PricingTableProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const {
    data: pricingData,
    isLoading,
    error
  } = useGetPricingPlansQuery({ includeInactive: false });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-96" />
        ))}
      </div>
    );
  }

  if (error || !pricingData) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Failed to load pricing plans. Please try again.</p>
      </div>
    );
  }

  const plansToShow = maxPlansToShow
    ? pricingData.plans.slice(0, maxPlansToShow)
    : pricingData.plans;

  const handlePlanSelect = (planId: string) => {
    onPlanSelect?.(planId, billingPeriod);
  };

  const calculateDisplayPrice = (plan: any) => {
    // If plan is yearly and we're showing monthly, convert to monthly equivalent
    if (plan.billingPeriod === 'yearly' && billingPeriod === 'monthly') {
      return {
        amount: plan.price.amount / 12,
        currency: plan.price.currency,
        period: 'month'
      };
    }

    // If plan is monthly and we're showing yearly, calculate yearly with discount
    if (plan.billingPeriod === 'monthly' && billingPeriod === 'yearly') {
      return {
        amount: plan.price.amount * 12 * 0.8, // 20% yearly discount
        currency: plan.price.currency,
        period: 'year'
      };
    }

    return {
      amount: plan.price.amount,
      currency: plan.price.currency,
      period: plan.billingPeriod === 'monthly' ? 'month' : 'year'
    };
  };

  const formatPrice = (amount: number, currency: string) => {
    const currencySymbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      ZAR: 'R',
      NGN: '₦',
      KES: 'KSh',
      GHS: '₵'
    };

    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {showComparison && (
        <div className="flex justify-center mb-8">
          <Tabs value={billingPeriod} onValueChange={(value) => setBillingPeriod(value as 'monthly' | 'yearly')}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">
                Yearly
                <Badge variant="secondary" className="ml-2 text-xs">
                  Save 20%
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plansToShow.map((plan) => {
          const displayPrice = calculateDisplayPrice(plan);
          const isSelected = selectedPlanId === plan.id;

          return (
            <Card
              key={plan.id}
              className={`relative transition-all duration-200 ${
                plan.isPopular
                  ? 'border-primary shadow-lg scale-105'
                  : 'hover:shadow-md'
              } ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
            >
              {plan.isPopular && (
                <Badge
                  className="absolute -top-2 left-1/2 transform -translate-x-1/2"
                  variant="default"
                >
                  Most Popular
                </Badge>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {plan.description}
                </CardDescription>

                <div className="mt-4">
                  <div className="text-3xl font-bold">
                    {formatPrice(displayPrice.amount, displayPrice.currency)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    per {displayPrice.period}
                  </div>

                  {billingPeriod === 'yearly' && plan.billingPeriod === 'monthly' && (
                    <div className="text-sm text-muted-foreground mt-1">
                      <span className="line-through">
                        {formatPrice(plan.price.amount * 12, plan.price.currency)}
                      </span>
                      <span className="text-green-600 ml-2 font-medium">
                        Save {formatPrice(plan.price.amount * 12 * 0.2, plan.price.currency)}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <Button
                  className="w-full mb-6"
                  variant={plan.isPopular ? 'default' : 'outline'}
                  onClick={() => handlePlanSelect(plan.id)}
                  disabled={!plan.isActive}
                >
                  {isSelected ? 'Selected' : 'Choose Plan'}
                </Button>

                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature.id} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <span className={`text-sm ${
                          feature.included
                            ? 'text-foreground'
                            : 'text-muted-foreground line-through'
                        }`}>
                          {feature.name}
                          {feature.limit && feature.included && (
                            <span className="text-muted-foreground ml-1">
                              (up to {feature.limit.toLocaleString()})
                            </span>
                          )}
                        </span>
                        {feature.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {feature.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {plansToShow.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No pricing plans available at the moment.</p>
        </div>
      )}
    </div>
  );
}