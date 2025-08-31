import { failure, isSuccess,Result, success } from '../../../shared/domain/value-objects/result';
import { DiscountEntity } from '../../domain/entities/discount';
import { PricingPlanEntity } from '../../domain/entities/pricing-plan';
import { Price } from '../../domain/value-objects/price';
import { DiscountRepository,PricingRepository } from '../ports/pricing-repository';

export interface CalculatePriceRequest {
  planId: string;
  discountCode?: string;
  billingPeriod?: 'monthly' | 'yearly';
  quantity?: number;
}

export interface CalculatePriceResponse {
  originalPrice: Price;
  discountAmount: Price;
  finalPrice: Price;
  appliedDiscount?: DiscountEntity;
  billingPeriod: 'monthly' | 'yearly';
  priceBreakdown: {
    basePrice: Price;
    discountApplied: boolean;
    discountPercentage?: number;
    savingsAmount?: Price;
  };
}

export class CalculatePriceUseCase {
  constructor(
    private readonly pricingRepository: PricingRepository,
    private readonly discountRepository: DiscountRepository
  ) {}

  async execute(request: CalculatePriceRequest): Promise<Result<CalculatePriceResponse, Error>> {
    try {
      const plan = await this.pricingRepository.getPlanById(request.planId);
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
      const basePrice = billingPeriod === 'yearly' ? plan.calculateYearlyPrice() : plan.price;
      const originalPrice = basePrice.multiply(quantity);

      let appliedDiscount: DiscountEntity | undefined;
      let discountAmount = Price.zero(originalPrice.currency);

      // Apply discount if provided
      if (request.discountCode) {
        const discountResult = await this.applyDiscount(request.discountCode, originalPrice, plan.id);
        if (isSuccess(discountResult)) {
          const { discount, amount } = discountResult.data;
          appliedDiscount = discount;
          discountAmount = amount;
        }
      }

      const finalPrice = originalPrice.subtract(discountAmount);

      // Calculate savings for yearly billing
      let savingsAmount: Price | undefined;
      if (billingPeriod === 'yearly' && plan.billingPeriod === 'monthly') {
        const monthlyTotal = plan.price.multiply(12 * quantity);
        savingsAmount = monthlyTotal.subtract(originalPrice);
      }

      return success({
        originalPrice,
        discountAmount,
        finalPrice,
        appliedDiscount,
        billingPeriod,
        priceBreakdown: {
          basePrice,
          discountApplied: !discountAmount.equals(Price.zero(originalPrice.currency)),
          discountPercentage: appliedDiscount && appliedDiscount.type === 'percentage'
            ? appliedDiscount.value
            : undefined,
          savingsAmount,
        },
      });
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to calculate price'));
    }
  }

  private async applyDiscount(
    discountCode: string,
    originalPrice: Price,
    planId: string
  ): Promise<Result<{ discount: DiscountEntity; amount: Price }, Error>> {
    try {
      const discount = await this.discountRepository.getDiscountByCode(discountCode);
      if (!discount) {
        return failure(new Error('Invalid discount code'));
      }

      if (!discount.isValid()) {
        return failure(new Error('Discount is not valid or has expired'));
      }

      if (!discount.canApplyToPlan(planId)) {
        return failure(new Error('Discount cannot be applied to this plan'));
      }

      const discountAmount = discount.calculateDiscountAmount(originalPrice.amount, originalPrice.currency);
      const discountPrice = new Price(discountAmount, originalPrice.currency);

      return success({
        discount,
        amount: discountPrice,
      });
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to apply discount'));
    }
  }
}