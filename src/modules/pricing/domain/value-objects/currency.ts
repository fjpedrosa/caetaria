export class Currency {
  private static readonly SUPPORTED_CURRENCIES = {
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

  constructor(
    public readonly code: keyof typeof Currency.SUPPORTED_CURRENCIES,
    public readonly symbol: string,
    public readonly name: string,
    public readonly decimals: number
  ) {}

  format(amount: number): string {
    const formattedAmount = amount.toFixed(this.decimals);

    // Handle different symbol placement based on currency
    if (this.code === 'EUR') {
      return `${formattedAmount}${this.symbol}`;
    }

    return `${this.symbol}${formattedAmount}`;
  }

  formatWithCode(amount: number): string {
    return `${this.format(amount)} ${this.code}`;
  }

  equals(other: Currency): boolean {
    return this.code === other.code;
  }

  isSameCurrency(currencyCode: string): boolean {
    return this.code === currencyCode;
  }

  static fromCode(code: string): Currency {
    const upperCode = code.toUpperCase() as keyof typeof Currency.SUPPORTED_CURRENCIES;
    const currencyData = Currency.SUPPORTED_CURRENCIES[upperCode];

    if (!currencyData) {
      throw new Error(`Unsupported currency code: ${code}`);
    }

    return new Currency(
      currencyData.code,
      currencyData.symbol,
      currencyData.name,
      currencyData.decimals
    );
  }

  static getSupportedCurrencies(): Currency[] {
    return Object.values(Currency.SUPPORTED_CURRENCIES).map(data =>
      new Currency(data.code, data.symbol, data.name, data.decimals)
    );
  }

  static getAfricanCurrencies(): Currency[] {
    const africanCodes: (keyof typeof Currency.SUPPORTED_CURRENCIES)[] = [
      'ZAR', 'NGN', 'KES', 'GHS', 'EGP', 'MAD', 'TND', 'UGX',
      'TZS', 'ETB', 'ZMW', 'BWP', 'MUR', 'XOF', 'XAF'
    ];

    return africanCodes.map(code => Currency.fromCode(code));
  }

  static isSupported(code: string): boolean {
    const upperCode = code.toUpperCase();
    return upperCode in Currency.SUPPORTED_CURRENCIES;
  }

  // Common currency instances
  static readonly USD = Currency.fromCode('USD');
  static readonly EUR = Currency.fromCode('EUR');
  static readonly GBP = Currency.fromCode('GBP');
  static readonly ZAR = Currency.fromCode('ZAR');
  static readonly NGN = Currency.fromCode('NGN');
  static readonly KES = Currency.fromCode('KES');
}