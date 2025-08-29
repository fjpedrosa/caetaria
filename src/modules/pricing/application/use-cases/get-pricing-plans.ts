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

export class GetPricingPlansUseCase {
  constructor(private readonly pricingRepository: PricingRepository) {}

  async execute(request: GetPricingPlansRequest = {}): Promise<Result<GetPricingPlansResponse, Error>> {
    try {
      let plans: PricingPlanEntity[];

      if (request.popularOnly) {
        plans = await this.pricingRepository.getPopularPlans();
      } else if (request.includeInactive) {
        plans = await this.pricingRepository.getAllPlans();
      } else {
        plans = await this.pricingRepository.getActivePlans();
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
  }
}