// ===== FUNCTIONAL PRICE IMPLEMENTATION =====
// This follows Clean Architecture principles with pure functions and immutability

import { createCurrencyFromCode, Currency, currencyEquals, CurrencyInterface, formatCurrency } from './currency';

// Re-export createCurrencyFromCode for convenience
export { createCurrencyFromCode };

/**
 * Price interface - immutable data structure
 */
export interface PriceInterface {
  readonly amount: number;
  readonly currency: CurrencyInterface;
}

/**
 * Branded type for validated price amounts
 */
type ValidatedAmount = number & { readonly __brand: 'ValidatedAmount' };

/**
 * Price JSON representation for serialization
 */
export interface PriceJSON {
  readonly amount: number;
  readonly currency: string;
}

// ===== PURE FUNCTIONS =====

/**
 * Factory function to create a Price object with validation
 */
export const createPrice = (amount: number, currency: CurrencyInterface): PriceInterface => {
  if (amount < 0) {
    throw new Error('Price amount cannot be negative');
  }
  return {
    amount: amount as ValidatedAmount,
    currency,
  };
};

/**
 * Create a zero price for a given currency
 */
export const createZeroPrice = (currency: CurrencyInterface): PriceInterface => {
  return createPrice(0, currency);
};

/**
 * Validate currency match between two prices
 */
const validateCurrencyMatch = (priceA: PriceInterface, priceB: PriceInterface): void => {
  if (!currencyEquals(priceA.currency, priceB.currency)) {
    throw new Error(`Currency mismatch: ${priceA.currency.code} vs ${priceB.currency.code}`);
  }
};

/**
 * Add two prices (immutable operation)
 */
export const addPrices = (priceA: PriceInterface, priceB: PriceInterface): PriceInterface => {
  validateCurrencyMatch(priceA, priceB);
  return createPrice(priceA.amount + priceB.amount, priceA.currency);
};

/**
 * Subtract two prices (immutable operation)
 */
export const subtractPrices = (priceA: PriceInterface, priceB: PriceInterface): PriceInterface => {
  validateCurrencyMatch(priceA, priceB);
  const newAmount = priceA.amount - priceB.amount;
  if (newAmount < 0) {
    throw new Error('Resulting price cannot be negative');
  }
  return createPrice(newAmount, priceA.currency);
};

/**
 * Multiply price by a factor (immutable operation)
 */
export const multiplyPrice = (price: PriceInterface, multiplier: number): PriceInterface => {
  if (multiplier < 0) {
    throw new Error('Multiplier cannot be negative');
  }
  return createPrice(price.amount * multiplier, price.currency);
};

/**
 * Divide price by a divisor (immutable operation)
 */
export const dividePrice = (price: PriceInterface, divisor: number): PriceInterface => {
  if (divisor <= 0) {
    throw new Error('Divisor must be positive');
  }
  return createPrice(price.amount / divisor, price.currency);
};

/**
 * Check if two prices are equal
 */
export const pricesEqual = (priceA: PriceInterface, priceB: PriceInterface): boolean => {
  return priceA.amount === priceB.amount && currencyEquals(priceA.currency, priceB.currency);
};

/**
 * Check if first price is greater than second price
 */
export const isPriceGreaterThan = (priceA: PriceInterface, priceB: PriceInterface): boolean => {
  validateCurrencyMatch(priceA, priceB);
  return priceA.amount > priceB.amount;
};

/**
 * Check if first price is less than second price
 */
export const isPriceLessThan = (priceA: PriceInterface, priceB: PriceInterface): boolean => {
  validateCurrencyMatch(priceA, priceB);
  return priceA.amount < priceB.amount;
};

/**
 * Format price as a string
 */
export const formatPrice = (price: PriceInterface): string => {
  return formatCurrency(price.currency, price.amount);
};

/**
 * Convert price to JSON representation
 */
export const priceToJSON = (price: PriceInterface): PriceJSON => {
  return {
    amount: price.amount,
    currency: price.currency.code,
  };
};

/**
 * Create price from JSON representation
 */
export const priceFromJSON = (data: PriceJSON): PriceInterface => {
  const currency = createCurrencyFromCode(data.currency);
  return createPrice(data.amount, currency);
};

/**
 * Compare two prices (returns -1, 0, or 1)
 */
export const comparePrices = (priceA: PriceInterface, priceB: PriceInterface): number => {
  validateCurrencyMatch(priceA, priceB);
  if (priceA.amount < priceB.amount) return -1;
  if (priceA.amount > priceB.amount) return 1;
  return 0;
};

/**
 * Get the minimum of two prices
 */
export const minPrice = (priceA: PriceInterface, priceB: PriceInterface): PriceInterface => {
  return isPriceLessThan(priceA, priceB) ? priceA : priceB;
};

/**
 * Get the maximum of two prices
 */
export const maxPrice = (priceA: PriceInterface, priceB: PriceInterface): PriceInterface => {
  return isPriceGreaterThan(priceA, priceB) ? priceA : priceB;
};

/**
 * Sum an array of prices with the same currency
 */
export const sumPrices = (prices: PriceInterface[]): PriceInterface => {
  if (prices.length === 0) {
    throw new Error('Cannot sum empty array of prices');
  }

  return prices.reduce((total, price) => addPrices(total, price));
};

/**
 * Calculate percentage of a price
 */
export const calculatePercentageOfPrice = (price: PriceInterface, percentage: number): PriceInterface => {
  if (percentage < 0 || percentage > 100) {
    throw new Error('Percentage must be between 0 and 100');
  }
  return multiplyPrice(price, percentage / 100);
};

// ===== BACKWARD COMPATIBILITY WRAPPER =====
// @deprecated Use functional price API instead
export class Price {
  constructor(
    public readonly amount: number,
    public readonly currency: Currency
  ) {
    console.warn('Price class is deprecated. Use functional price API instead.');
    if (amount < 0) {
      throw new Error('Price amount cannot be negative');
    }
  }

  add(other: Price): Price {
    const result = addPrices(this, other);
    return new Price(result.amount, result.currency as Currency);
  }

  subtract(other: Price): Price {
    const result = subtractPrices(this, other);
    return new Price(result.amount, result.currency as Currency);
  }

  multiply(multiplier: number): Price {
    const result = multiplyPrice(this, multiplier);
    return new Price(result.amount, result.currency as Currency);
  }

  divide(divisor: number): Price {
    const result = dividePrice(this, divisor);
    return new Price(result.amount, result.currency as Currency);
  }

  equals(other: Price): boolean {
    return pricesEqual(this, other);
  }

  isGreaterThan(other: Price): boolean {
    return isPriceGreaterThan(this, other);
  }

  isLessThan(other: Price): boolean {
    return isPriceLessThan(this, other);
  }

  format(): string {
    return formatPrice(this);
  }

  toJSON(): { amount: number; currency: string } {
    return priceToJSON(this);
  }

  static fromJSON(data: { amount: number; currency: string }): Price {
    const functionalPrice = priceFromJSON(data);
    return new Price(functionalPrice.amount, functionalPrice.currency as Currency);
  }

  static zero(currency: Currency): Price {
    const zeroPrice = createZeroPrice(currency);
    return new Price(zeroPrice.amount, zeroPrice.currency as Currency);
  }

  private validateCurrencyMatch(other: Price): void {
    validateCurrencyMatch(this, other);
  }
}