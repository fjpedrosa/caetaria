/**
 * Phone Number Value Object
 * Domain layer - Pure business rules for phone number validation
 */

export type PhoneNumber = string & { readonly __brand: unique symbol };

export class PhoneNumberValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PhoneNumberValidationError';
  }
}

/**
 * Pure function to validate and create PhoneNumber value object
 */
export function createPhoneNumber(value: string): PhoneNumber {
  const cleanedValue = value.replace(/\s+/g, '').replace(/[^\d+]/g, '');

  if (!cleanedValue) {
    throw new PhoneNumberValidationError('Phone number cannot be empty');
  }

  // Must start with + and have country code
  if (!cleanedValue.startsWith('+')) {
    throw new PhoneNumberValidationError('Phone number must include country code with +');
  }

  // Validate length (minimum 7, maximum 15 digits after +)
  const digitsOnly = cleanedValue.substring(1);
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    throw new PhoneNumberValidationError('Invalid phone number length');
  }

  if (!/^\d+$/.test(digitsOnly)) {
    throw new PhoneNumberValidationError('Phone number contains invalid characters');
  }

  return cleanedValue as PhoneNumber;
}

/**
 * Pure function to format phone number for display
 */
export function formatPhoneNumber(phoneNumber: PhoneNumber): string {
  // Basic formatting for international numbers
  const digits = phoneNumber.substring(1);
  if (digits.length >= 10) {
    const countryCode = digits.substring(0, digits.length - 10);
    const areaCode = digits.substring(digits.length - 10, digits.length - 7);
    const firstPart = digits.substring(digits.length - 7, digits.length - 4);
    const lastPart = digits.substring(digits.length - 4);

    if (countryCode) {
      return `+${countryCode} ${areaCode} ${firstPart}-${lastPart}`;
    }
    return `+${areaCode} ${firstPart}-${lastPart}`;
  }

  return phoneNumber;
}