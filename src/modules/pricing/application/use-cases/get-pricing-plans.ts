import { failure,Result, success } from '../../../shared/domain/value-objects/result';
import { PricingPlanEntity } from '../../domain/entities/pricing-plan';
import { PricingRepository } from '../ports/pricing-repository';

export interface GetPricingPlansRequest {
  includeInactive?: boolean;
  popularOnly?: boolean;
}

export interface GetPricingPlansResponse {
  plans: PricingPlanEntity[];
  totalCount: number;
}

// Factory function for creating GetPricingPlans use case
export const createGetPricingPlansUseCase = (dependencies: {
  pricingRepository: PricingRepository;
}) => {
  const { pricingRepository } = dependencies;

  const execute = async (request: GetPricingPlansRequest = {}): Promise<Result<GetPricingPlansResponse, Error>> => {
    try {
      let plans: PricingPlanEntity[];

      if (request.popularOnly) {
        plans = await pricingRepository.getPopularPlans();
      } else if (request.includeInactive) {
        plans = await pricingRepository.getAllPlans();
      } else {
        plans = await pricingRepository.getActivePlans();
      }

      // Sort plans by price (ascending)
      const sortedPlans = plans.sort((a, b) => {
        // Convert to same billing period for comparison
        const aYearlyPrice = a.calculateYearlyPrice();
        const bYearlyPrice = b.calculateYearlyPrice();

        return aYearlyPrice.amount - bYearlyPrice.amount;
      });

      return success({
        plans: sortedPlans,
        totalCount: sortedPlans.length,
      });
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to get pricing plans'));
    }
  };

  return {
    execute,
  };
};

// Export type for the use case factory
export type GetPricingPlansUseCase = ReturnType<typeof createGetPricingPlansUseCase>;