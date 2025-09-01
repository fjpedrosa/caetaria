import { Discount, DiscountEntity } from '../../domain/entities/discount';
import { PricingPlanEntity } from '../../domain/entities/pricing-plan';

export interface PricingRepository {
  getAllPlans(): Promise<PricingPlanEntity[]>;
  getPlanById(id: string): Promise<PricingPlanEntity | null>;
  getActivePlans(): Promise<PricingPlanEntity[]>;
  getPopularPlans(): Promise<PricingPlanEntity[]>;
  savePlan(plan: PricingPlanEntity): Promise<PricingPlanEntity>;
  deletePlan(id: string): Promise<void>;
}

/**
 * Repository interface for discount management - Functional approach
 * Uses immutable Discount interface instead of DiscountEntity class
 */
export interface DiscountRepository {
  /**
   * Finds a discount by its code
   * @param code - Discount code to search for
   * @returns Discount object if found, null otherwise
   */
  getDiscountByCode(code: string): Promise<Discount | null>;

  /**
   * Retrieves all active discounts
   * @returns Array of active discount objects
   */
  getActiveDiscounts(): Promise<Discount[]>;

  /**
   * Saves a discount (create or update)
   * @param discount - Discount object to save
   * @returns Saved discount object
   */
  saveDiscount(discount: Discount): Promise<Discount>;

  /**
   * Increments the usage count of a discount by its ID
   * @param discountId - ID of the discount to increment
   */
  incrementDiscountUsage(discountId: string): Promise<void>;
}

/**
 * @deprecated Use DiscountRepository with functional approach instead
 * Legacy repository interface for backward compatibility during migration
 */
export interface LegacyDiscountRepository {
  getDiscountByCode(code: string): Promise<DiscountEntity | null>;
  getActiveDiscounts(): Promise<DiscountEntity[]>;
  saveDiscount(discount: DiscountEntity): Promise<DiscountEntity>;
  incrementDiscountUsage(discountId: string): Promise<void>;
}