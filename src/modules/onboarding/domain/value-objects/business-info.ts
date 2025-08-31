/**
 * Business Info Value Object
 * Domain layer - Pure business rules for business information validation
 */

export type BusinessType =
  | 'startup'
  | 'sme'
  | 'enterprise'
  | 'agency'
  | 'non-profit'
  | 'other';

export type Industry =
  | 'e-commerce'
  | 'healthcare'
  | 'education'
  | 'finance'
  | 'real-estate'
  | 'travel'
  | 'food-beverage'
  | 'technology'
  | 'consulting'
  | 'retail'
  | 'other';

export interface BusinessInfo {
  readonly companyName: string;
  readonly businessType: BusinessType;
  readonly industry: Industry;
  readonly employeeCount: number;
  readonly website?: string;
  readonly description?: string;
  readonly expectedVolume: 'low' | 'medium' | 'high';
}

export class BusinessInfoValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessInfoValidationError';
  }
}

/**
 * Pure function to validate and create BusinessInfo value object
 */
export function createBusinessInfo(params: {
  companyName: string;
  businessType: BusinessType;
  industry: Industry;
  employeeCount: number;
  website?: string;
  description?: string;
  expectedVolume: 'low' | 'medium' | 'high';
}): BusinessInfo {
  // Validate company name
  const trimmedName = params.companyName.trim();
  if (!trimmedName) {
    throw new BusinessInfoValidationError('Company name is required');
  }

  if (trimmedName.length < 2) {
    throw new BusinessInfoValidationError('Company name must be at least 2 characters');
  }

  if (trimmedName.length > 100) {
    throw new BusinessInfoValidationError('Company name must be less than 100 characters');
  }

  // Validate employee count
  if (params.employeeCount < 1) {
    throw new BusinessInfoValidationError('Employee count must be at least 1');
  }

  if (params.employeeCount > 1000000) {
    throw new BusinessInfoValidationError('Employee count seems too high');
  }

  // Validate website URL if provided
  if (params.website?.trim()) {
    const website = params.website.trim();
    try {
      new URL(website.startsWith('http') ? website : `https://${website}`);
    } catch {
      throw new BusinessInfoValidationError('Invalid website URL');
    }
  }

  // Validate description length
  if (params.description && params.description.trim().length > 500) {
    throw new BusinessInfoValidationError('Description must be less than 500 characters');
  }

  return {
    companyName: trimmedName,
    businessType: params.businessType,
    industry: params.industry,
    employeeCount: params.employeeCount,
    website: params.website?.trim() || undefined,
    description: params.description?.trim() || undefined,
    expectedVolume: params.expectedVolume,
  };
}

/**
 * Pure function to get business size category
 */
export function getBusinessSizeCategory(employeeCount: number): 'micro' | 'small' | 'medium' | 'large' {
  if (employeeCount <= 10) return 'micro';
  if (employeeCount <= 50) return 'small';
  if (employeeCount <= 250) return 'medium';
  return 'large';
}

/**
 * Pure function to get recommended plan based on business info
 */
export function getRecommendedPlan(businessInfo: BusinessInfo): 'starter' | 'growth' | 'enterprise' {
  const sizeCategory = getBusinessSizeCategory(businessInfo.employeeCount);

  if (sizeCategory === 'micro' && businessInfo.expectedVolume === 'low') {
    return 'starter';
  }

  if (sizeCategory === 'large' || businessInfo.expectedVolume === 'high') {
    return 'enterprise';
  }

  return 'growth';
}

/**
 * Pure function to format website URL
 */
export function formatWebsiteUrl(website: string): string {
  const trimmed = website.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

/**
 * Pure function to get display name for business type
 */
export function getBusinessTypeDisplayName(businessType: BusinessType): string {
  const displayNames: Record<BusinessType, string> = {
    'startup': 'Startup',
    'sme': 'Small/Medium Enterprise',
    'enterprise': 'Large Enterprise',
    'agency': 'Agency/Consultancy',
    'non-profit': 'Non-Profit Organization',
    'other': 'Other',
  };

  return displayNames[businessType];
}

/**
 * Pure function to get display name for industry
 */
export function getIndustryDisplayName(industry: Industry): string {
  const displayNames: Record<Industry, string> = {
    'e-commerce': 'E-commerce & Online Retail',
    'healthcare': 'Healthcare & Medical',
    'education': 'Education & Training',
    'finance': 'Financial Services',
    'real-estate': 'Real Estate',
    'travel': 'Travel & Hospitality',
    'food-beverage': 'Food & Beverage',
    'technology': 'Technology & Software',
    'consulting': 'Consulting & Professional Services',
    'retail': 'Retail & Consumer Goods',
    'other': 'Other',
  };

  return displayNames[industry];
}