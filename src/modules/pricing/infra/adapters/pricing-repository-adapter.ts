import { DiscountRepository,PricingRepository } from '../../application/ports/pricing-repository';
import { createDiscount, Currency, Discount, DiscountEntity, Price, PricingPlanEntity } from '../../domain';
import { DiscountApiModel,pricingApi, PricingPlanApiModel } from '../services/pricing-api';

// Functional mapper object for converting between domain entities and API models
export const pricingModelMapper = {
  toDomainPlan: (apiModel: PricingPlanApiModel): PricingPlanEntity => {
    const currency = Currency.fromCode(apiModel.price.currency);
    const price = new Price(apiModel.price.amount, currency);

    return {
      id: apiModel.id,
      name: apiModel.name,
      description: apiModel.description,
      price,
      billingPeriod: apiModel.billingPeriod,
      features: apiModel.features,
      isPopular: apiModel.isPopular,
      isActive: apiModel.isActive,
      createdAt: new Date(apiModel.createdAt),
      updatedAt: new Date(apiModel.updatedAt),
    };
  },

  toApiPlan: (domainEntity: PricingPlanEntity): PricingPlanApiModel => {
    return {
      id: domainEntity.id,
      name: domainEntity.name,
      description: domainEntity.description,
      price: {
        amount: domainEntity.price.amount,
        currency: domainEntity.price.currency.code,
      },
      billingPeriod: domainEntity.billingPeriod,
      features: domainEntity.features,
      isPopular: domainEntity.isPopular,
      isActive: domainEntity.isActive,
      createdAt: domainEntity.createdAt.toISOString(),
      updatedAt: domainEntity.updatedAt.toISOString(),
    };
  },

  /**
   * Converts API model to functional Discount interface
   * @param apiModel - Discount data from API
   * @returns Functional Discount object
   */
  toDomainDiscount: (apiModel: DiscountApiModel): Discount => {
    const currency = apiModel.currency ? Currency.fromCode(apiModel.currency) : undefined;

    return {
      id: apiModel.id,
      code: apiModel.code,
      type: apiModel.type,
      value: apiModel.value,
      currency,
      minPurchaseAmount: apiModel.minPurchaseAmount,
      maxDiscountAmount: apiModel.maxDiscountAmount,
      validFrom: new Date(apiModel.validFrom),
      validUntil: new Date(apiModel.validUntil),
      usageLimit: apiModel.usageLimit,
      usageCount: apiModel.usageCount,
      isActive: apiModel.isActive,
      applicablePlans: apiModel.applicablePlans,
      createdAt: new Date(apiModel.createdAt),
      updatedAt: new Date(apiModel.updatedAt),
    };
  },

  /**
   * @deprecated Use toDomainDiscount for functional approach
   * Legacy method for backward compatibility during migration
   */
  toDomainDiscountEntity: (apiModel: DiscountApiModel): DiscountEntity => {
    const currency = apiModel.currency ? Currency.fromCode(apiModel.currency) : undefined;

    return new DiscountEntity({
      id: apiModel.id,
      code: apiModel.code,
      type: apiModel.type,
      value: apiModel.value,
      currency,
      minPurchaseAmount: apiModel.minPurchaseAmount,
      maxDiscountAmount: apiModel.maxDiscountAmount,
      validFrom: new Date(apiModel.validFrom),
      validUntil: new Date(apiModel.validUntil),
      usageLimit: apiModel.usageLimit,
      usageCount: apiModel.usageCount,
      isActive: apiModel.isActive,
      applicablePlans: apiModel.applicablePlans,
      createdAt: new Date(apiModel.createdAt),
      updatedAt: new Date(apiModel.updatedAt),
    });
  },

  /**
   * Converts functional Discount to API model
   * @param discount - Functional Discount object
   * @returns API model for discount
   */
  toApiDiscount: (discount: Discount): DiscountApiModel => {
    return {
      id: discount.id,
      code: discount.code,
      type: discount.type,
      value: discount.value,
      currency: discount.currency?.code,
      minPurchaseAmount: discount.minPurchaseAmount,
      maxDiscountAmount: discount.maxDiscountAmount,
      validFrom: discount.validFrom.toISOString(),
      validUntil: discount.validUntil.toISOString(),
      usageLimit: discount.usageLimit,
      usageCount: discount.usageCount,
      isActive: discount.isActive,
      applicablePlans: discount.applicablePlans,
      createdAt: discount.createdAt.toISOString(),
      updatedAt: discount.updatedAt.toISOString(),
    };
  },

  /**
   * @deprecated Use toApiDiscount with functional Discount instead
   * Legacy method for backward compatibility during migration
   */
  toApiDiscountFromEntity: (domainEntity: DiscountEntity): DiscountApiModel => {
    return {
      id: domainEntity.id,
      code: domainEntity.code,
      type: domainEntity.type,
      value: domainEntity.value,
      currency: domainEntity.currency?.code,
      minPurchaseAmount: domainEntity.minPurchaseAmount,
      maxDiscountAmount: domainEntity.maxDiscountAmount,
      validFrom: domainEntity.validFrom.toISOString(),
      validUntil: domainEntity.validUntil.toISOString(),
      usageLimit: domainEntity.usageLimit,
      usageCount: domainEntity.usageCount,
      isActive: domainEntity.isActive,
      applicablePlans: domainEntity.applicablePlans,
      createdAt: domainEntity.createdAt.toISOString(),
      updatedAt: domainEntity.updatedAt.toISOString(),
    };
  }
};

export const createPricingRepository = (dependencies: { store: any }): PricingRepository => ({
  async getAllPlans(): Promise<PricingPlanEntity[]> {
    const result = await dependencies.store.dispatch(
      pricingApi.endpoints.getPricingPlans.initiate({ includeInactive: true })
    );

    if (result.error) {
      throw new Error('Failed to fetch pricing plans');
    }

    return result.data.plans.map(pricingModelMapper.toDomainPlan);
  },

  async getPlanById(id: string): Promise<PricingPlanEntity | null> {
    const result = await dependencies.store.dispatch(
      pricingApi.endpoints.getPricingPlan.initiate(id)
    );

    if (result.error) {
      return null;
    }

    return result.data ? pricingModelMapper.toDomainPlan(result.data) : null;
  },

  async getActivePlans(): Promise<PricingPlanEntity[]> {
    const result = await dependencies.store.dispatch(
      pricingApi.endpoints.getPricingPlans.initiate({ includeInactive: false })
    );

    if (result.error) {
      throw new Error('Failed to fetch active pricing plans');
    }

    return result.data.plans.map(pricingModelMapper.toDomainPlan);
  },

  async getPopularPlans(): Promise<PricingPlanEntity[]> {
    const result = await dependencies.store.dispatch(
      pricingApi.endpoints.getPricingPlans.initiate({ popularOnly: true })
    );

    if (result.error) {
      throw new Error('Failed to fetch popular pricing plans');
    }

    return result.data.plans.map(pricingModelMapper.toDomainPlan);
  },

  async savePlan(plan: PricingPlanEntity): Promise<PricingPlanEntity> {
    // This would typically be a mutation endpoint
    throw new Error('Save plan not implemented - would require API endpoint');
  },

  async deletePlan(id: string): Promise<void> {
    // This would typically be a mutation endpoint
    throw new Error('Delete plan not implemented - would require API endpoint');
  }
});

/**
 * Creates functional DiscountRepository implementation
 * @param dependencies - Store and other dependencies
 * @returns DiscountRepository implementation using functional approach
 */
export const createDiscountRepository = (dependencies: { store: any }): DiscountRepository => ({
  async getDiscountByCode(code: string): Promise<Discount | null> {
    // This would require a specific API endpoint for fetching discount by code
    // For now, we'll use the validate endpoint which should return the discount
    const result = await dependencies.store.dispatch(
      pricingApi.endpoints.validateDiscount.initiate({ discountCode: code, planId: '' })
    );

    if (result.error || !result.data.isValid || !result.data.discount) {
      return null;
    }

    return pricingModelMapper.toDomainDiscount(result.data.discount);
  },

  async getActiveDiscounts(): Promise<Discount[]> {
    const result = await dependencies.store.dispatch(
      pricingApi.endpoints.getActiveDiscounts.initiate()
    );

    if (result.error) {
      throw new Error('Failed to fetch active discounts');
    }

    return result.data.map(pricingModelMapper.toDomainDiscount);
  },

  async saveDiscount(discount: Discount): Promise<Discount> {
    // This would typically be a mutation endpoint
    // For now, we'll simulate the save operation
    const apiModel = pricingModelMapper.toApiDiscount(discount);

    // In a real implementation, this would call a save/update API endpoint
    throw new Error('Save discount not implemented - would require API endpoint');
  },

  async incrementDiscountUsage(discountId: string): Promise<void> {
    // This would use the discount code, not ID
    // In a real implementation, this would call an increment usage API endpoint
    throw new Error('Increment discount usage not fully implemented - would require discount code');
  }
});

/**
 * @deprecated Use createDiscountRepository for functional approach instead
 * Legacy repository factory for backward compatibility during migration
 */
export const createLegacyDiscountRepository = (dependencies: { store: any }) => ({
  async getDiscountByCode(code: string): Promise<DiscountEntity | null> {
    const result = await dependencies.store.dispatch(
      pricingApi.endpoints.validateDiscount.initiate({ discountCode: code, planId: '' })
    );

    if (result.error || !result.data.isValid || !result.data.discount) {
      return null;
    }

    return pricingModelMapper.toDomainDiscountEntity(result.data.discount);
  },

  async getActiveDiscounts(): Promise<DiscountEntity[]> {
    const result = await dependencies.store.dispatch(
      pricingApi.endpoints.getActiveDiscounts.initiate()
    );

    if (result.error) {
      throw new Error('Failed to fetch active discounts');
    }

    return result.data.map(pricingModelMapper.toDomainDiscountEntity);
  },

  async saveDiscount(discount: DiscountEntity): Promise<DiscountEntity> {
    throw new Error('Save discount not implemented - would require API endpoint');
  },

  async incrementDiscountUsage(discountId: string): Promise<void> {
    throw new Error('Increment discount usage not fully implemented - would require discount code');
  }
});