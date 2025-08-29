import { Currency } from './currency';

export class Price {
  constructor(
    public readonly amount: number,
    public readonly currency: Currency
  ) {
    if (amount < 0) {
      throw new Error('Price amount cannot be negative');
    }
  }

  add(other: Price): Price {
    this.validateCurrencyMatch(other);
    return new Price(this.amount + other.amount, this.currency);
  }

  subtract(other: Price): Price {
    this.validateCurrencyMatch(other);
    const newAmount = this.amount - other.amount;
    if (newAmount < 0) {
      throw new Error('Resulting price cannot be negative');
    }
    return new Price(newAmount, this.currency);
  }

  multiply(multiplier: number): Price {
    if (multiplier < 0) {
      throw new Error('Multiplier cannot be negative');
    }
    return new Price(this.amount * multiplier, this.currency);
  }

  divide(divisor: number): Price {
    if (divisor <= 0) {
      throw new Error('Divisor must be positive');
    }
    return new Price(this.amount / divisor, this.currency);
  }

  equals(other: Price): boolean {
    return this.amount === other.amount && this.currency.equals(other.currency);
  }

  isGreaterThan(other: Price): boolean {
    this.validateCurrencyMatch(other);
    return this.amount > other.amount;
  }

  isLessThan(other: Price): boolean {
    this.validateCurrencyMatch(other);
    return this.amount < other.amount;
  }

  format(): string {
    return this.currency.format(this.amount);
  }

  toJSON(): { amount: number; currency: string } {
    return {
      amount: this.amount,
      currency: this.currency.code,
    };
  }

  static fromJSON(data: { amount: number; currency: string }): Price {
    return new Price(data.amount, Currency.fromCode(data.currency));
  }

  static zero(currency: Currency): Price {
    return new Price(0, currency);
  }

  private validateCurrencyMatch(other: Price): void {
    if (!this.currency.equals(other.currency)) {
      throw new Error(`Currency mismatch: ${this.currency.code} vs ${other.currency.code}`);
    }
  }
}