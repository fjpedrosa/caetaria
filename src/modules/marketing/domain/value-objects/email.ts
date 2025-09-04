/**
 * Email Value Object - Marketing Domain Specific Extensions
 * Domain layer - Marketing-specific email business rules
 */

// Re-export shared email types and functions
export type { Email } from '../../../shared/domain/value-objects/email';
export {
  createEmail,
  EmailValidationError,
  getEmailDomain,
  isValidEmail,
  maskEmail
} from '../../../shared/domain/value-objects/email';

/**
 * Marketing-specific email validation for campaigns
 */
export function isValidMarketingEmail(email: string): boolean {
  try {
    const emailObj = createEmail(email);

    // Additional marketing-specific validations
    const domain = getEmailDomain(emailObj);

    // Exclude disposable email domains (basic list)
    const disposableDomains = [
      '10minutemail.com',
      'tempmail.org',
      'guerrillamail.com',
      'mailinator.com'
    ];

    if (disposableDomains.includes(domain)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Get email quality score for marketing campaigns
 */
export function getEmailQualityScore(email: string): number {
  let score = 50; // Base score

  try {
    const emailObj = createEmail(email);
    const domain = getEmailDomain(emailObj);

    // Corporate domains get higher scores
    const corporateDomains = [
      'gmail.com', 'outlook.com', 'yahoo.com',
      'company.com', 'corp.com', 'business.com'
    ];

    if (corporateDomains.some(d => domain.endsWith(d))) {
      score += 30;
    }

    // Length-based scoring
    if (email.length > 10 && email.length < 50) {
      score += 20;
    }

    return Math.min(score, 100);
  } catch {
    return 0;
  }
}