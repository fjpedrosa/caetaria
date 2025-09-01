// ===== FUNCTIONAL CURRENCY IMPLEMENTATION =====
// This follows Clean Architecture principles with pure functions and immutability

/**
 * Supported currency data structure
 */
interface CurrencyData {
  readonly code: string;
  readonly symbol: string;
  readonly name: string;
  readonly decimals: number;
}

/**
 * Currency interface - immutable data structure
 */
export interface CurrencyInterface {
  readonly code: SupportedCurrencyCode;
  readonly symbol: string;
  readonly name: string;
  readonly decimals: number;
}

/**
 * Supported currency codes for type safety
 */
export type SupportedCurrencyCode = keyof typeof SUPPORTED_CURRENCIES;

/**
 * Supported currencies constant - immutable data
 */
export const SUPPORTED_CURRENCIES = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2 },
  // African currencies
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', decimals: 2 },
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', decimals: 2 },
  KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', decimals: 2 },
  GHS: { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi', decimals: 2 },
  EGP: { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', decimals: 2 },
  MAD: { code: 'MAD', symbol: 'MAD', name: 'Moroccan Dirham', decimals: 2 },
  TND: { code: 'TND', symbol: 'DT', name: 'Tunisian Dinar', decimals: 3 },
  UGX: { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling', decimals: 0 },
  TZS: { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling', decimals: 0 },
  ETB: { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr', decimals: 2 },
  ZMW: { code: 'ZMW', symbol: 'ZK', name: 'Zambian Kwacha', decimals: 2 },
  BWP: { code: 'BWP', symbol: 'P', name: 'Botswana Pula', decimals: 2 },
  MUR: { code: 'MUR', symbol: '₨', name: 'Mauritian Rupee', decimals: 2 },
  XOF: { code: 'XOF', symbol: 'CFA', name: 'West African CFA Franc', decimals: 0 },
  XAF: { code: 'XAF', symbol: 'FCFA', name: 'Central African CFA Franc', decimals: 0 },
} as const;

/**
 * African currency codes for filtering
 */
const AFRICAN_CURRENCY_CODES: SupportedCurrencyCode[] = [
  'ZAR', 'NGN', 'KES', 'GHS', 'EGP', 'MAD', 'TND', 'UGX',
  'TZS', 'ETB', 'ZMW', 'BWP', 'MUR', 'XOF', 'XAF'
];

// ===== PURE FUNCTIONS =====

/**
 * Factory function to create a Currency object
 */
export const createCurrency = (
  code: SupportedCurrencyCode,
  symbol: string,
  name: string,
  decimals: number
): CurrencyInterface => ({
  code,
  symbol,
  name,
  decimals,
});

/**
 * Create Currency from currency code
 */
export const createCurrencyFromCode = (code: string): CurrencyInterface => {
  const upperCode = code.toUpperCase() as SupportedCurrencyCode;
  const currencyData = SUPPORTED_CURRENCIES[upperCode];

  if (!currencyData) {
    throw new Error(`Unsupported currency code: ${code}`);
  }

  return createCurrency(
    currencyData.code as SupportedCurrencyCode,
    currencyData.symbol,
    currencyData.name,
    currencyData.decimals
  );
};

/**
 * Format currency amount with proper symbol placement
 */
export const formatCurrency = (currency: CurrencyInterface, amount: number): string => {
  const formattedAmount = amount.toFixed(currency.decimals);

  // Handle different symbol placement based on currency
  if (currency.code === 'EUR') {
    return `${formattedAmount}${currency.symbol}`;
  }

  return `${currency.symbol}${formattedAmount}`;
};

/**
 * Format currency amount with currency code
 */
export const formatCurrencyWithCode = (currency: CurrencyInterface, amount: number): string => {
  return `${formatCurrency(currency, amount)} ${currency.code}`;
};

/**
 * Check if two currencies are equal
 */
export const currencyEquals = (a: CurrencyInterface, b: CurrencyInterface): boolean => {
  return a.code === b.code;
};

/**
 * Check if currency matches a currency code
 */
export const isSameCurrency = (currency: CurrencyInterface, currencyCode: string): boolean => {
  return currency.code === currencyCode.toUpperCase();
};

/**
 * Check if a currency code is supported
 */
export const isCurrencySupported = (code: string): boolean => {
  const upperCode = code.toUpperCase();
  return upperCode in SUPPORTED_CURRENCIES;
};

/**
 * Get all supported currencies
 */
export const getSupportedCurrencies = (): CurrencyInterface[] => {
  return Object.values(SUPPORTED_CURRENCIES).map(data =>
    createCurrency(
      data.code as SupportedCurrencyCode,
      data.symbol,
      data.name,
      data.decimals
    )
  );
};

/**
 * Get African currencies only
 */
export const getAfricanCurrencies = (): CurrencyInterface[] => {
  return AFRICAN_CURRENCY_CODES.map(code => createCurrencyFromCode(code));
};

// ===== COMMON CURRENCY CONSTANTS =====

export const USD_CURRENCY = createCurrencyFromCode('USD');
export const EUR_CURRENCY = createCurrencyFromCode('EUR');
export const GBP_CURRENCY = createCurrencyFromCode('GBP');
export const ZAR_CURRENCY = createCurrencyFromCode('ZAR');
export const NGN_CURRENCY = createCurrencyFromCode('NGN');
export const KES_CURRENCY = createCurrencyFromCode('KES');

// ===== BACKWARD COMPATIBILITY WRAPPER =====
// @deprecated Use functional currency API instead
export class Currency {
  private static readonly SUPPORTED_CURRENCIES = SUPPORTED_CURRENCIES;

  constructor(
    public readonly code: SupportedCurrencyCode,
    public readonly symbol: string,
    public readonly name: string,
    public readonly decimals: number
  ) {
    console.warn('Currency class is deprecated. Use functional currency API instead.');
  }

  format(amount: number): string {
    return formatCurrency(this, amount);
  }

  formatWithCode(amount: number): string {
    return formatCurrencyWithCode(this, amount);
  }

  equals(other: Currency): boolean {
    return currencyEquals(this, other);
  }

  isSameCurrency(currencyCode: string): boolean {
    return isSameCurrency(this, currencyCode);
  }

  static fromCode(code: string): Currency {
    const functionalCurrency = createCurrencyFromCode(code);
    return new Currency(
      functionalCurrency.code,
      functionalCurrency.symbol,
      functionalCurrency.name,
      functionalCurrency.decimals
    );
  }

  static getSupportedCurrencies(): Currency[] {
    return getSupportedCurrencies().map(fc =>
      new Currency(fc.code, fc.symbol, fc.name, fc.decimals)
    );
  }

  static getAfricanCurrencies(): Currency[] {
    return getAfricanCurrencies().map(fc =>
      new Currency(fc.code, fc.symbol, fc.name, fc.decimals)
    );
  }

  static isSupported(code: string): boolean {
    return isCurrencySupported(code);
  }

  // Common currency instances
  static readonly USD = Currency.fromCode('USD');
  static readonly EUR = Currency.fromCode('EUR');
  static readonly GBP = Currency.fromCode('GBP');
  static readonly ZAR = Currency.fromCode('ZAR');
  static readonly NGN = Currency.fromCode('NGN');
  static readonly KES = Currency.fromCode('KES');
}