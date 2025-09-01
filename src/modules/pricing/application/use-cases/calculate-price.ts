import { failure, isSuccess,Result, success } from '../../../shared/domain/value-objects/result';
import { calculateDiscountAmount,canDiscountApplyToPlan, Discount, DiscountEntity, isDiscountValid } from '../../domain/entities/discount';
import { calculateYearlyPrice,PricingPlanEntity } from '../../domain/entities/pricing-plan';
import { addPrices, createPrice,createZeroPrice, multiplyPrice, Price, PriceInterface, pricesEqual, subtractPrices } from '../../domain/value-objects/price';
import { DiscountRepository,PricingRepository } from '../ports/pricing-repository';

export interface CalculatePriceRequest {
  planId: string;
  discountCode?: string;
  billingPeriod?: 'monthly' | 'yearly';
  quantity?: number;
}

export interface CalculatePriceResponse {
  originalPrice: PriceInterface;
  discountAmount: PriceInterface;
  finalPrice: PriceInterface;
  appliedDiscount?: Discount;
  billingPeriod: 'monthly' | 'yearly';
  priceBreakdown: {
    basePrice: PriceInterface;
    discountApplied: boolean;
    discountPercentage?: number;
    savingsAmount?: PriceInterface;
  };
}

// Factory function for creating CalculatePrice use case
export const createCalculatePriceUseCase = (dependencies: {
  pricingRepository: PricingRepository;
  discountRepository: DiscountRepository;
}) => {
  const { pricingRepository, discountRepository } = dependencies;

  const execute = async (request: CalculatePriceRequest): Promise<Result<CalculatePriceResponse, Error>> => {
    try {
      const plan = await pricingRepository.getPlanById(request.planId);
      if (!plan) {
        return failure(new Error(`Pricing plan not found: ${request.planId}`));
      }

      if (!plan.isActive) {
        return failure(new Error('Pricing plan is not active'));
      }

      const quantity = request.quantity ?? 1;
      if (quantity <= 0) {
        return failure(new Error('Quantity must be greater than 0'));
      }

      // Determine the billing period and base price
      const billingPeriod = request.billingPeriod ?? plan.billingPeriod;
      const basePrice = billingPeriod === 'yearly' ? calculateYearlyPrice(plan) : plan.price;
      const originalPrice = multiplyPrice(basePrice, quantity);

      let appliedDiscount: Discount | undefined;
      let discountAmount = createZeroPrice(originalPrice.currency);

      // Apply discount if provided
      if (request.discountCode) {
        const discountResult = await applyDiscount(request.discountCode, originalPrice, plan.id);
        if (isSuccess(discountResult)) {
          const { discount, amount } = discountResult.data;
          appliedDiscount = discount;
          discountAmount = amount;
        }
      }

      const finalPrice = subtractPrices(originalPrice, discountAmount);

      // Calculate savings for yearly billing
      let savingsAmount: Price | undefined;
      if (billingPeriod === 'yearly' && plan.billingPeriod === 'monthly') {
        const monthlyTotal = multiplyPrice(plan.price, 12 * quantity);
        savingsAmount = subtractPrices(monthlyTotal, originalPrice);
      }

      return success({
        originalPrice,
        discountAmount,
        finalPrice,
        appliedDiscount,
        billingPeriod,
        priceBreakdown: {
          basePrice,
          discountApplied: !pricesEqual(discountAmount, createZeroPrice(originalPrice.currency)),
          discountPercentage: appliedDiscount && appliedDiscount.type === 'percentage'
            ? appliedDiscount.value
            : undefined,
          savingsAmount,
        },
      });
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to calculate price'));
    }
  };

  const applyDiscount = async (
    discountCode: string,
    originalPrice: Price,
    planId: string
  ): Promise<Result<{ discount: Discount; amount: PriceInterface }, Error>> => {
    try {
      const discount = await discountRepository.getDiscountByCode(discountCode);
      if (!discount) {
        return failure(new Error('Invalid discount code'));
      }

      // Handle both functional Discount and legacy DiscountEntity
      let isValid: boolean;
      let canApply: boolean;
      let discountAmountValue: number;

      if ('isValid' in discount && typeof discount.isValid === 'function') {
        // Legacy DiscountEntity approach
        const entity = discount as DiscountEntity;
        isValid = entity.isValid();
        canApply = entity.canApplyToPlan(planId);
        discountAmountValue = entity.calculateDiscountAmount(originalPrice.amount, originalPrice.currency);
      } else {
        // Functional approach
        const functionalDiscount = discount as Discount;
        isValid = isDiscountValid(functionalDiscount);
        canApply = canDiscountApplyToPlan(functionalDiscount, planId);
        discountAmountValue = calculateDiscountAmount(functionalDiscount, originalPrice.amount, originalPrice.currency);
      }

      if (!isValid) {
        return failure(new Error('Discount is not valid or has expired'));
      }

      if (!canApply) {
        return failure(new Error('Discount cannot be applied to this plan'));
      }

      const discountPrice = createPrice(discountAmountValue, originalPrice.currency);

      return success({
        discount,
        amount: discountPrice,
      });
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to apply discount'));
    }
  };

  return {
    execute,
  };
};

// Export type for the use case factory
export type CalculatePriceUseCase = ReturnType<typeof createCalculatePriceUseCase>;