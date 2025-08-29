import { DiscountRepository,PricingRepository } from '../../application/ports/pricing-repository';
import { Currency,DiscountEntity, Price, PricingPlanEntity } from '../../domain';
import { DiscountApiModel,pricingApi, PricingPlanApiModel } from '../services/pricing-api';

// Mappers for converting between domain entities and API models
export class PricingModelMapper {
  static toDomainPlan(apiModel: PricingPlanApiModel): PricingPlanEntity {
    const currency = Currency.fromCode(apiModel.price.currency);
    const price = new Price(apiModel.price.amount, currency);
    
    return new PricingPlanEntity({
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
    });
  }

  static toApiPlan(domainEntity: PricingPlanEntity): PricingPlanApiModel {
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
      createdAt: domainEntity['plan'].createdAt.toISOString(),
      updatedAt: domainEntity['plan'].updatedAt.toISOString(),
    };
  }

  static toDomainDiscount(apiModel: DiscountApiModel): DiscountEntity {
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
  }

  static toApiDiscount(domainEntity: DiscountEntity): DiscountApiModel {
    return {
      id: domainEntity.id,
      code: domainEntity.code,
      type: domainEntity.type,
      value: domainEntity.value,
      currency: domainEntity.currency?.code,
      minPurchaseAmount: domainEntity['discount'].minPurchaseAmount,
      maxDiscountAmount: domainEntity['discount'].maxDiscountAmount,
      validFrom: domainEntity.validFrom.toISOString(),
      validUntil: domainEntity.validUntil.toISOString(),
      usageLimit: domainEntity.usageLimit,
      usageCount: domainEntity.usageCount,
      isActive: domainEntity.isActive,
      applicablePlans: domainEntity.applicablePlans,
      createdAt: domainEntity['discount'].createdAt.toISOString(),
      updatedAt: domainEntity['discount'].updatedAt.toISOString(),
    };
  }
}

export class PricingRepositoryAdapter implements PricingRepository {
  constructor(private readonly store: any) {} // RTK store reference

  async getAllPlans(): Promise<PricingPlanEntity[]> {
    const result = await this.store.dispatch(
      pricingApi.endpoints.getPricingPlans.initiate({ includeInactive: true })
    );
    
    if (result.error) {
      throw new Error('Failed to fetch pricing plans');
    }

    return result.data.plans.map(PricingModelMapper.toDomainPlan);
  }

  async getPlanById(id: string): Promise<PricingPlanEntity | null> {
    const result = await this.store.dispatch(
      pricingApi.endpoints.getPricingPlan.initiate(id)
    );
    
    if (result.error) {
      return null;
    }

    return result.data ? PricingModelMapper.toDomainPlan(result.data) : null;
  }

  async getActivePlans(): Promise<PricingPlanEntity[]> {
    const result = await this.store.dispatch(
      pricingApi.endpoints.getPricingPlans.initiate({ includeInactive: false })
    );
    
    if (result.error) {
      throw new Error('Failed to fetch active pricing plans');
    }

    return result.data.plans.map(PricingModelMapper.toDomainPlan);
  }

  async getPopularPlans(): Promise<PricingPlanEntity[]> {
    const result = await this.store.dispatch(
      pricingApi.endpoints.getPricingPlans.initiate({ popularOnly: true })
    );
    
    if (result.error) {
      throw new Error('Failed to fetch popular pricing plans');
    }

    return result.data.plans.map(PricingModelMapper.toDomainPlan);
  }

  async savePlan(plan: PricingPlanEntity): Promise<PricingPlanEntity> {
    // This would typically be a mutation endpoint
    throw new Error('Save plan not implemented - would require API endpoint');
  }

  async deletePlan(id: string): Promise<void> {
    // This would typically be a mutation endpoint
    throw new Error('Delete plan not implemented - would require API endpoint');
  }
}

export class DiscountRepositoryAdapter implements DiscountRepository {
  constructor(private readonly store: any) {} // RTK store reference

  async getDiscountByCode(code: string): Promise<DiscountEntity | null> {
    // This would require a specific API endpoint for fetching discount by code
    // For now, we'll use the validate endpoint which should return the discount
    const result = await this.store.dispatch(
      pricingApi.endpoints.validateDiscount.initiate({ discountCode: code, planId: '' })
    );
    
    if (result.error || !result.data.isValid || !result.data.discount) {
      return null;
    }

    return PricingModelMapper.toDomainDiscount(result.data.discount);
  }

  async getActiveDiscounts(): Promise<DiscountEntity[]> {
    const result = await this.store.dispatch(
      pricingApi.endpoints.getActiveDiscounts.initiate()
    );
    
    if (result.error) {
      throw new Error('Failed to fetch active discounts');
    }

    return result.data.map(PricingModelMapper.toDomainDiscount);
  }

  async saveDiscount(discount: DiscountEntity): Promise<DiscountEntity> {
    // This would typically be a mutation endpoint
    throw new Error('Save discount not implemented - would require API endpoint');
  }

  async incrementDiscountUsage(discountId: string): Promise<void> {
    // This would use the discount code, not ID
    throw new Error('Increment discount usage not fully implemented - would require discount code');
  }
}