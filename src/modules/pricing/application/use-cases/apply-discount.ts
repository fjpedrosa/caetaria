import { failure,Result, success } from '../../../shared/domain/value-objects/result';
import { DiscountEntity } from '../../domain/entities/discount';
import { Price } from '../../domain/value-objects/price';
import { DiscountRepository } from '../ports/pricing-repository';

export interface ApplyDiscountRequest {
  discountCode: string;
  originalAmount: number;
  currency: string;
  planId: string;
}

export interface ApplyDiscountResponse {
  discount: DiscountEntity;
  discountAmount: Price;
  finalAmount: Price;
  discountPercentage?: number;
  isValid: boolean;
  validationMessage?: string;
}

export class ApplyDiscountUseCase {
  constructor(private readonly discountRepository: DiscountRepository) {}

  async execute(request: ApplyDiscountRequest): Promise<Result<ApplyDiscountResponse, Error>> {
    try {
      const { discountCode, originalAmount, currency, planId } = request;

      if (originalAmount <= 0) {
        return failure(new Error('Original amount must be greater than 0'));
      }

      const discount = await this.discountRepository.getDiscountByCode(discountCode.toUpperCase());
      if (!discount) {
        return failure(new Error('Discount code not found'));
      }

      // Validate discount
      const validationResult = this.validateDiscount(discount, planId);
      if (!validationResult.isValid) {
        return failure(new Error(validationResult.message));
      }

      // Import Currency from domain
      const { Currency } = await import('../../domain/value-objects/currency');
      const priceCurrency = Currency.fromCode(currency);
      const originalPrice = new Price(originalAmount, priceCurrency);

      // Calculate discount amount
      const discountAmount = discount.calculateDiscountAmount(originalAmount, priceCurrency);
      const discountPrice = new Price(discountAmount, priceCurrency);
      const finalPrice = originalPrice.subtract(discountPrice);

      // Calculate percentage if it's a fixed amount discount
      const discountPercentage = discount.type === 'percentage'
        ? discount.value
        : (discountAmount / originalAmount) * 100;

      return success({
        discount,
        discountAmount: discountPrice,
        finalAmount: finalPrice,
        discountPercentage,
        isValid: true,
      });
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to apply discount'));
    }
  }

  async confirmDiscountUsage(discountCode: string): Promise<Result<void, Error>> {
    try {
      const discount = await this.discountRepository.getDiscountByCode(discountCode.toUpperCase());
      if (!discount) {
        return failure(new Error('Discount code not found'));
      }

      await this.discountRepository.incrementDiscountUsage(discount.id);
      return success(undefined);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to confirm discount usage'));
    }
  }

  private validateDiscount(discount: DiscountEntity, planId: string): { isValid: boolean; message?: string } {
    if (!discount.isActive) {
      return { isValid: false, message: 'Discount is not active' };
    }

    if (!discount.isValid()) {
      const now = new Date();
      if (now < discount.validFrom) {
        return { isValid: false, message: 'Discount is not yet valid' };
      }
      if (now > discount.validUntil) {
        return { isValid: false, message: 'Discount has expired' };
      }
      if (discount.usageLimit !== undefined && discount.usageCount >= discount.usageLimit) {
        return { isValid: false, message: 'Discount usage limit reached' };
      }
    }

    if (!discount.canApplyToPlan(planId)) {
      return { isValid: false, message: 'Discount cannot be applied to this plan' };
    }

    return { isValid: true };
  }
}