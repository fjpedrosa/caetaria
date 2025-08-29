import { Currency } from '../value-objects/currency';

export type DiscountType = 'percentage' | 'fixed_amount';

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

export class DiscountEntity {
  constructor(private readonly discount: Discount) {}

  get id(): string {
    return this.discount.id;
  }

  get code(): string {
    return this.discount.code;
  }

  get type(): DiscountType {
    return this.discount.type;
  }

  get value(): number {
    return this.discount.value;
  }

  get currency(): Currency | undefined {
    return this.discount.currency;
  }

  get validFrom(): Date {
    return this.discount.validFrom;
  }

  get validUntil(): Date {
    return this.discount.validUntil;
  }

  get usageLimit(): number | undefined {
    return this.discount.usageLimit;
  }

  get usageCount(): number {
    return this.discount.usageCount;
  }

  get isActive(): boolean {
    return this.discount.isActive;
  }

  get applicablePlans(): string[] {
    return this.discount.applicablePlans;
  }

  isValid(currentDate: Date = new Date()): boolean {
    return (
      this.discount.isActive &&
      currentDate >= this.discount.validFrom &&
      currentDate <= this.discount.validUntil &&
      (this.discount.usageLimit === undefined || this.discount.usageCount < this.discount.usageLimit)
    );
  }

  canApplyToPlan(planId: string): boolean {
    return this.discount.applicablePlans.length === 0 || this.discount.applicablePlans.includes(planId);
  }

  calculateDiscountAmount(originalAmount: number, planCurrency: Currency): number {
    if (!this.isValid()) {
      return 0;
    }

    if (this.discount.minPurchaseAmount && originalAmount < this.discount.minPurchaseAmount) {
      return 0;
    }

    let discountAmount = 0;

    if (this.discount.type === 'percentage') {
      discountAmount = (originalAmount * this.discount.value) / 100;
    } else if (this.discount.type === 'fixed_amount') {
      if (!this.discount.currency || this.discount.currency.code !== planCurrency.code) {
        throw new Error(`Currency mismatch: discount currency ${this.discount.currency?.code} does not match plan currency ${planCurrency.code}`);
      }
      discountAmount = this.discount.value;
    }

    // Apply maximum discount limit if specified
    if (this.discount.maxDiscountAmount && discountAmount > this.discount.maxDiscountAmount) {
      discountAmount = this.discount.maxDiscountAmount;
    }

    // Ensure discount doesn't exceed original amount
    return Math.min(discountAmount, originalAmount);
  }

  incrementUsage(): DiscountEntity {
    return new DiscountEntity({
      ...this.discount,
      usageCount: this.discount.usageCount + 1,
      updatedAt: new Date(),
    });
  }

  static create(data: Omit<Discount, 'usageCount' | 'createdAt' | 'updatedAt'>): DiscountEntity {
    const now = new Date();
    return new DiscountEntity({
      ...data,
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  update(updates: Partial<Pick<Discount, 'code' | 'type' | 'value' | 'validFrom' | 'validUntil' | 'usageLimit' | 'isActive' | 'applicablePlans'>>): DiscountEntity {
    return new DiscountEntity({
      ...this.discount,
      ...updates,
      updatedAt: new Date(),
    });
  }
}