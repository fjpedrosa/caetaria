import { Currency } from '../value-objects/currency';

export type DiscountType = 'percentage' | 'fixed_amount';

/**
 * Discount domain entity - Immutable data structure
 * Represents a discount code that can be applied to pricing plans
 */
export interface Discount {
  readonly id: string;
  readonly code: string;
  readonly type: DiscountType;
  readonly value: number;
  readonly currency?: Currency; // Required only for fixed_amount discounts
  readonly minPurchaseAmount?: number;
  readonly maxDiscountAmount?: number;
  readonly validFrom: Date;
  readonly validUntil: Date;
  readonly usageLimit?: number;
  readonly usageCount: number;
  readonly isActive: boolean;
  readonly applicablePlans: string[]; // Plan IDs that this discount applies to
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Input type for creating new discounts - excludes auto-generated fields
 */
export type CreateDiscountInput = Omit<Discount, 'usageCount' | 'createdAt' | 'updatedAt'>;

/**
 * Input type for updating existing discounts - only allows specific fields to be updated
 */
export type UpdateDiscountInput = Partial<Pick<Discount, 'code' | 'type' | 'value' | 'validFrom' | 'validUntil' | 'usageLimit' | 'isActive' | 'applicablePlans'>>;

// =============================================================================
// FACTORY FUNCTIONS - Pure functions for creating and modifying Discount objects
// =============================================================================

/**
 * Factory function to create a new discount with default values
 * @param data - Discount data without auto-generated fields
 * @returns New Discount object
 */
export const createDiscount = (data: CreateDiscountInput): Discount => {
  const now = new Date();
  return {
    ...data,
    usageCount: 0,
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Pure function to increment discount usage count
 * @param discount - Original discount object
 * @returns New discount object with incremented usage count
 */
export const incrementDiscountUsage = (discount: Discount): Discount => {
  return {
    ...discount,
    usageCount: discount.usageCount + 1,
    updatedAt: new Date(),
  };
};

/**
 * Pure function to update discount properties
 * @param discount - Original discount object
 * @param updates - Partial updates to apply
 * @returns New discount object with updates applied
 */
export const updateDiscount = (discount: Discount, updates: UpdateDiscountInput): Discount => {
  return {
    ...discount,
    ...updates,
    updatedAt: new Date(),
  };
};

// =============================================================================
// BUSINESS LOGIC FUNCTIONS - Pure functions for discount validation and calculation
// =============================================================================

/**
 * Validates if a discount is currently valid and can be used
 * @param discount - Discount to validate
 * @param currentDate - Date to validate against (defaults to current date)
 * @returns True if discount is valid and usable
 */
export const isDiscountValid = (discount: Discount, currentDate: Date = new Date()): boolean => {
  return (
    discount.isActive &&
    currentDate >= discount.validFrom &&
    currentDate <= discount.validUntil &&
    (discount.usageLimit === undefined || discount.usageCount < discount.usageLimit)
  );
};

/**
 * Checks if a discount can be applied to a specific pricing plan
 * @param discount - Discount to check
 * @param planId - ID of the pricing plan
 * @returns True if discount can be applied to the plan
 */
export const canDiscountApplyToPlan = (discount: Discount, planId: string): boolean => {
  return discount.applicablePlans.length === 0 || discount.applicablePlans.includes(planId);
};

/**
 * Calculates the actual discount amount for a given original amount
 * @param discount - Discount to apply
 * @param originalAmount - Original price amount
 * @param planCurrency - Currency of the pricing plan
 * @returns Calculated discount amount (never exceeds original amount)
 * @throws Error if currency mismatch for fixed_amount discounts
 */
export const calculateDiscountAmount = (
  discount: Discount,
  originalAmount: number,
  planCurrency: Currency
): number => {
  // Discount must be valid to calculate amount
  if (!isDiscountValid(discount)) {
    return 0;
  }

  // Check minimum purchase amount requirement
  if (discount.minPurchaseAmount && originalAmount < discount.minPurchaseAmount) {
    return 0;
  }

  let discountAmount = 0;

  if (discount.type === 'percentage') {
    discountAmount = (originalAmount * discount.value) / 100;
  } else if (discount.type === 'fixed_amount') {
    if (!discount.currency || discount.currency.code !== planCurrency.code) {
      throw new Error(
        `Currency mismatch: discount currency ${discount.currency?.code} does not match plan currency ${planCurrency.code}`
      );
    }
    discountAmount = discount.value;
  }

  // Apply maximum discount limit if specified
  if (discount.maxDiscountAmount && discountAmount > discount.maxDiscountAmount) {
    discountAmount = discount.maxDiscountAmount;
  }

  // Ensure discount doesn't exceed original amount
  return Math.min(discountAmount, originalAmount);
};

/**
 * Validates discount and returns validation result with message
 * @param discount - Discount to validate
 * @param planId - ID of the pricing plan
 * @param currentDate - Date to validate against (defaults to current date)
 * @returns Validation result with boolean and optional message
 */
export const validateDiscountForPlan = (
  discount: Discount,
  planId: string,
  currentDate: Date = new Date()
): { isValid: boolean; message?: string } => {
  if (!discount.isActive) {
    return { isValid: false, message: 'Discount is not active' };
  }

  if (!isDiscountValid(discount, currentDate)) {
    if (currentDate < discount.validFrom) {
      return { isValid: false, message: 'Discount is not yet valid' };
    }
    if (currentDate > discount.validUntil) {
      return { isValid: false, message: 'Discount has expired' };
    }
    if (discount.usageLimit !== undefined && discount.usageCount >= discount.usageLimit) {
      return { isValid: false, message: 'Discount usage limit reached' };
    }
  }

  if (!canDiscountApplyToPlan(discount, planId)) {
    return { isValid: false, message: 'Discount cannot be applied to this plan' };
  }

  return { isValid: true };
};

// =============================================================================
// LEGACY COMPATIBILITY - For gradual migration
// =============================================================================

/**
 * @deprecated Use functional discount functions instead
 * Legacy class wrapper for backward compatibility during migration
 * This will be removed once all usage is migrated to functional approach
 */
export class DiscountEntity {
  constructor(private readonly discount: Discount) {}

  get id(): string { return this.discount.id; }
  get code(): string { return this.discount.code; }
  get type(): DiscountType { return this.discount.type; }
  get value(): number { return this.discount.value; }
  get currency(): Currency | undefined { return this.discount.currency; }
  get validFrom(): Date { return this.discount.validFrom; }
  get validUntil(): Date { return this.discount.validUntil; }
  get usageLimit(): number | undefined { return this.discount.usageLimit; }
  get usageCount(): number { return this.discount.usageCount; }
  get isActive(): boolean { return this.discount.isActive; }
  get applicablePlans(): string[] { return this.discount.applicablePlans; }

  isValid(currentDate: Date = new Date()): boolean {
    return isDiscountValid(this.discount, currentDate);
  }

  canApplyToPlan(planId: string): boolean {
    return canDiscountApplyToPlan(this.discount, planId);
  }

  calculateDiscountAmount(originalAmount: number, planCurrency: Currency): number {
    return calculateDiscountAmount(this.discount, originalAmount, planCurrency);
  }

  incrementUsage(): DiscountEntity {
    return new DiscountEntity(incrementDiscountUsage(this.discount));
  }

  static create(data: CreateDiscountInput): DiscountEntity {
    return new DiscountEntity(createDiscount(data));
  }

  update(updates: UpdateDiscountInput): DiscountEntity {
    return new DiscountEntity(updateDiscount(this.discount, updates));
  }
}