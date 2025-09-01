import { failure,Result, success } from '../../../shared/domain/value-objects/result';
import { Discount, DiscountEntity, validateDiscountForPlan } from '../../domain/entities/discount';
import { createCurrencyFromCode,createPrice, Price, PriceInterface, subtractPrices } from '../../domain/value-objects/price';
import { DiscountRepository } from '../ports/pricing-repository';

export interface ApplyDiscountRequest {
  discountCode: string;
  originalAmount: number;
  currency: string;
  planId: string;
}

export interface ApplyDiscountResponse {
  discount: Discount;
  discountAmount: PriceInterface;
  finalAmount: PriceInterface;
  discountPercentage?: number;
  isValid: boolean;
  validationMessage?: string;
}

/**
 * @deprecated Use ApplyDiscountResponse with functional Discount instead
 * Legacy response type for backward compatibility during migration
 */
export interface LegacyApplyDiscountResponse {
  discount: DiscountEntity;
  discountAmount: PriceInterface;
  finalAmount: PriceInterface;
  discountPercentage?: number;
  isValid: boolean;
  validationMessage?: string;
}

export interface ApplyDiscountDependencies {
  readonly discountRepository: DiscountRepository;
}

/**
 * @deprecated Use validateDiscountForPlan from domain instead
 * Validate discount function - Pure function for validation logic
 * Kept for backward compatibility during migration
 */
const validateDiscount = (discount: Discount | DiscountEntity, planId: string): { isValid: boolean; message?: string } => {
  // Handle both functional Discount and legacy DiscountEntity
  if ('isActive' in discount) {
    // It's a functional Discount
    return validateDiscountForPlan(discount as Discount, planId);
  } else {
    // It's a legacy DiscountEntity - use the class methods
    const entity = discount as DiscountEntity;
    if (!entity.isActive) {
      return { isValid: false, message: 'Discount is not active' };
    }

    if (!entity.isValid()) {
      const now = new Date();
      if (now < entity.validFrom) {
        return { isValid: false, message: 'Discount is not yet valid' };
      }
      if (now > entity.validUntil) {
        return { isValid: false, message: 'Discount has expired' };
      }
      if (entity.usageLimit !== undefined && entity.usageCount >= entity.usageLimit) {
        return { isValid: false, message: 'Discount usage limit reached' };
      }
    }

    if (!entity.canApplyToPlan(planId)) {
      return { isValid: false, message: 'Discount cannot be applied to this plan' };
    }

    return { isValid: true };
  }
};

/**
 * Factory function to create applyDiscount use case
 * @param deps Dependencies required for the use case
 * @returns Object with execute and confirmDiscountUsage functions
 */
export const createApplyDiscountUseCase = (deps: ApplyDiscountDependencies) => {
  const { discountRepository } = deps;

  return {
    execute: async (request: ApplyDiscountRequest): Promise<Result<ApplyDiscountResponse, Error>> => {
      try {
        const { discountCode, originalAmount, currency, planId } = request;

        if (originalAmount <= 0) {
          return failure(new Error('Original amount must be greater than 0'));
        }

        const discount = await discountRepository.getDiscountByCode(discountCode.toUpperCase());
        if (!discount) {
          return failure(new Error('Discount code not found'));
        }

        // Validate discount
        const validationResult = validateDiscount(discount, planId);
        if (!validationResult.isValid) {
          return failure(new Error(validationResult.message));
        }

        // Create currency and original price
        const priceCurrency = createCurrencyFromCode(currency);
        const originalPrice = createPrice(originalAmount, priceCurrency);

        // Calculate discount amount - handle both functional and class-based approaches
        let discountAmount: number;
        let discountType: string;
        let discountValue: number;

        if ('calculateDiscountAmount' in discount && typeof discount.calculateDiscountAmount === 'function') {
          // Legacy DiscountEntity approach
          const entity = discount as DiscountEntity;
          discountAmount = entity.calculateDiscountAmount(originalAmount, priceCurrency);
          discountType = entity.type;
          discountValue = entity.value;
        } else {
          // Functional approach
          const { calculateDiscountAmount } = await import('../../domain/entities/discount');
          const functionalDiscount = discount as Discount;
          discountAmount = calculateDiscountAmount(functionalDiscount, originalAmount, priceCurrency);
          discountType = functionalDiscount.type;
          discountValue = functionalDiscount.value;
        }

        const discountPrice = createPrice(discountAmount, priceCurrency);
        const finalPrice = subtractPrices(originalPrice, discountPrice);

        // Calculate percentage if it's a fixed amount discount
        const discountPercentage = discountType === 'percentage'
          ? discountValue
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
    },

    confirmDiscountUsage: async (discountCode: string): Promise<Result<void, Error>> => {
      try {
        const discount = await discountRepository.getDiscountByCode(discountCode.toUpperCase());
        if (!discount) {
          return failure(new Error('Discount code not found'));
        }

        // Handle both functional Discount and legacy DiscountEntity
        const discountId = 'id' in discount ? discount.id : (discount as any).id;
        await discountRepository.incrementDiscountUsage(discountId);
        return success(undefined);
      } catch (error) {
        return failure(error instanceof Error ? error : new Error('Failed to confirm discount usage'));
      }
    },

    validateDiscount: (discount: Discount | DiscountEntity, planId: string): { isValid: boolean; message?: string } => {
      return validateDiscount(discount, planId);
    }
  };
};

// =============================================================================
// LEGACY COMPATIBILITY - For gradual migration
// =============================================================================

/**
 * @deprecated Use createApplyDiscountUseCase factory function instead
 * Legacy class wrapper for backward compatibility during migration
 */
export class ApplyDiscountUseCase {
  constructor(private readonly discountRepository: DiscountRepository) {}

  async execute(request: ApplyDiscountRequest): Promise<Result<ApplyDiscountResponse, Error>> {
    const useCase = createApplyDiscountUseCase({ discountRepository: this.discountRepository });
    return useCase.execute(request);
  }

  async confirmDiscountUsage(discountCode: string): Promise<Result<void, Error>> {
    const useCase = createApplyDiscountUseCase({ discountRepository: this.discountRepository });
    return useCase.confirmDiscountUsage(discountCode);
  }

  private validateDiscount(discount: DiscountEntity, planId: string): { isValid: boolean; message?: string } {
    return validateDiscount(discount, planId);
  }
}