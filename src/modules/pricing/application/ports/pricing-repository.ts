import { DiscountEntity } from '../../domain/entities/discount';
import { PricingPlanEntity } from '../../domain/entities/pricing-plan';

export interface PricingRepository {
  getAllPlans(): Promise<PricingPlanEntity[]>;
  getPlanById(id: string): Promise<PricingPlanEntity | null>;
  getActivePlans(): Promise<PricingPlanEntity[]>;
  getPopularPlans(): Promise<PricingPlanEntity[]>;
  savePlan(plan: PricingPlanEntity): Promise<PricingPlanEntity>;
  deletePlan(id: string): Promise<void>;
}

export interface DiscountRepository {
  getDiscountByCode(code: string): Promise<DiscountEntity | null>;
  getActiveDiscounts(): Promise<DiscountEntity[]>;
  saveDiscount(discount: DiscountEntity): Promise<DiscountEntity>;
  incrementDiscountUsage(discountId: string): Promise<void>;
}