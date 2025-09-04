/**
 * Email Value Object - Shared across modules
 * Domain layer - Pure business rules for email validation
 */

export type Email = string & { readonly __brand: unique symbol };

export class EmailValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailValidationError';
  }
}

/**
 * Pure function to validate and create Email value object
 */
export function createEmail(value: string): Email {
  const trimmedValue = value.trim().toLowerCase();

  if (!trimmedValue) {
    throw new EmailValidationError('Email cannot be empty');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedValue)) {
    throw new EmailValidationError('Invalid email format');
  }

  if (trimmedValue.length > 254) {
    throw new EmailValidationError('Email too long');
  }

  return trimmedValue as Email;
}

/**
 * Pure function to extract domain from email
 */
export function getEmailDomain(email: Email): string {
  return email.split('@')[1];
}

/**
 * Pure function to validate email without creating object
 */
export function isValidEmail(value: string): boolean {
  try {
    createEmail(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Pure function to mask email for display (preserves first 2 chars and domain)
 */
export function maskEmail(email: Email): string {
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return `${localPart}***@${domain}`;
  }
  return `${localPart.slice(0, 2)}***@${domain}`;
}