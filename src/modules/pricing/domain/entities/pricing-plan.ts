import { Price } from '../value-objects/price';
import { Currency } from '../value-objects/currency';

export interface PricingFeature {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly included: boolean;
  readonly limit?: number;
}

export interface PricingPlan {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: Price;
  readonly billingPeriod: 'monthly' | 'yearly';
  readonly features: PricingFeature[];
  readonly isPopular: boolean;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class PricingPlanEntity {
  constructor(private readonly plan: PricingPlan) {}

  get id(): string {
    return this.plan.id;
  }

  get name(): string {
    return this.plan.name;
  }

  get description(): string {
    return this.plan.description;
  }

  get price(): Price {
    return this.plan.price;
  }

  get billingPeriod(): 'monthly' | 'yearly' {
    return this.plan.billingPeriod;
  }

  get features(): PricingFeature[] {
    return this.plan.features;
  }

  get isPopular(): boolean {
    return this.plan.isPopular;
  }

  get isActive(): boolean {
    return this.plan.isActive;
  }

  hasFeature(featureId: string): boolean {
    return this.plan.features.some(feature => feature.id === featureId && feature.included);
  }

  getFeatureLimit(featureId: string): number | null {
    const feature = this.plan.features.find(f => f.id === featureId && f.included);
    return feature?.limit ?? null;
  }

  calculateYearlyPrice(): Price {
    if (this.plan.billingPeriod === 'yearly') {
      return this.plan.price;
    }
    // Apply typical 20% yearly discount
    const yearlyAmount = this.plan.price.amount * 12 * 0.8;
    return new Price(yearlyAmount, this.plan.price.currency);
  }

  static create(data: Omit<PricingPlan, 'createdAt' | 'updatedAt'>): PricingPlanEntity {
    const now = new Date();
    return new PricingPlanEntity({
      ...data,
      createdAt: now,
      updatedAt: now,
    });
  }

  update(updates: Partial<Pick<PricingPlan, 'name' | 'description' | 'price' | 'features' | 'isPopular' | 'isActive'>>): PricingPlanEntity {
    return new PricingPlanEntity({
      ...this.plan,
      ...updates,
      updatedAt: new Date(),
    });
  }
}