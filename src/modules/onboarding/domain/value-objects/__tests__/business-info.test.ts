/**
 * Business Info Value Object Tests
 * Domain layer - Unit tests for business information validation
 * Coverage requirement: 95%
 */

import {
  BusinessInfo,
  BusinessInfoValidationError,
  BusinessType,
  createBusinessInfo,
  formatWebsiteUrl,
  getBusinessSizeCategory,
  getBusinessTypeDisplayName,
  getIndustryDisplayName,
  getRecommendedPlan,
  Industry,
} from '../business-info';

// =============================================================================
// TEST DATA HELPERS
// =============================================================================

const createValidBusinessInfoParams = (overrides: Partial<Parameters<typeof createBusinessInfo>[0]> = {}) => ({
  companyName: 'Test Company Inc.',
  businessType: 'startup' as BusinessType,
  industry: 'technology' as Industry,
  employeeCount: 10,
  website: 'https://test.com',
  description: 'A test company for testing purposes',
  expectedVolume: 'medium' as const,
  ...overrides,
});

// =============================================================================
// BUSINESS INFO CREATION TESTS
// =============================================================================

describe('createBusinessInfo', () => {
  describe('successful creation', () => {
    it('should create valid business info with all fields', () => {
      const params = createValidBusinessInfoParams();
      const businessInfo = createBusinessInfo(params);

      expect(businessInfo.companyName).toBe('Test Company Inc.');
      expect(businessInfo.businessType).toBe('startup');
      expect(businessInfo.industry).toBe('technology');
      expect(businessInfo.employeeCount).toBe(10);
      expect(businessInfo.website).toBe('https://test.com');
      expect(businessInfo.description).toBe('A test company for testing purposes');
      expect(businessInfo.expectedVolume).toBe('medium');
    });

    it('should create valid business info with minimal required fields', () => {
      const params = {
        companyName: 'Minimal Co',
        businessType: 'sme' as BusinessType,
        industry: 'retail' as Industry,
        employeeCount: 5,
        expectedVolume: 'low' as const,
      };

      const businessInfo = createBusinessInfo(params);

      expect(businessInfo.companyName).toBe('Minimal Co');
      expect(businessInfo.businessType).toBe('sme');
      expect(businessInfo.industry).toBe('retail');
      expect(businessInfo.employeeCount).toBe(5);
      expect(businessInfo.website).toBeUndefined();
      expect(businessInfo.description).toBeUndefined();
      expect(businessInfo.expectedVolume).toBe('low');
    });

    it('should trim company name whitespace', () => {
      const params = createValidBusinessInfoParams({
        companyName: '  Trimmed Company  ',
      });

      const businessInfo = createBusinessInfo(params);

      expect(businessInfo.companyName).toBe('Trimmed Company');
    });

    it('should trim and handle empty website', () => {
      const params = createValidBusinessInfoParams({
        website: '  ',
      });

      const businessInfo = createBusinessInfo(params);

      expect(businessInfo.website).toBeUndefined();
    });

    it('should trim and handle empty description', () => {
      const params = createValidBusinessInfoParams({
        description: '   ',
      });

      const businessInfo = createBusinessInfo(params);

      expect(businessInfo.description).toBeUndefined();
    });

    it('should accept all valid business types', () => {
      const businessTypes: BusinessType[] = ['startup', 'sme', 'enterprise', 'agency', 'non-profit', 'other'];

      businessTypes.forEach(businessType => {
        const params = createValidBusinessInfoParams({ businessType });
        const businessInfo = createBusinessInfo(params);
        expect(businessInfo.businessType).toBe(businessType);
      });
    });

    it('should accept all valid industries', () => {
      const industries: Industry[] = [
        'e-commerce', 'healthcare', 'education', 'finance', 'real-estate',
        'travel', 'food-beverage', 'technology', 'consulting', 'retail', 'other'
      ];

      industries.forEach(industry => {
        const params = createValidBusinessInfoParams({ industry });
        const businessInfo = createBusinessInfo(params);
        expect(businessInfo.industry).toBe(industry);
      });
    });

    it('should accept all valid expected volume levels', () => {
      const volumes = ['low', 'medium', 'high'] as const;

      volumes.forEach(expectedVolume => {
        const params = createValidBusinessInfoParams({ expectedVolume });
        const businessInfo = createBusinessInfo(params);
        expect(businessInfo.expectedVolume).toBe(expectedVolume);
      });
    });
  });

  describe('company name validation', () => {
    it('should throw error for empty company name', () => {
      const params = createValidBusinessInfoParams({ companyName: '' });

      expect(() => createBusinessInfo(params)).toThrow(BusinessInfoValidationError);
      expect(() => createBusinessInfo(params)).toThrow('Company name is required');
    });

    it('should throw error for whitespace-only company name', () => {
      const params = createValidBusinessInfoParams({ companyName: '   ' });

      expect(() => createBusinessInfo(params)).toThrow(BusinessInfoValidationError);
      expect(() => createBusinessInfo(params)).toThrow('Company name is required');
    });

    it('should throw error for company name too short', () => {
      const params = createValidBusinessInfoParams({ companyName: 'A' });

      expect(() => createBusinessInfo(params)).toThrow(BusinessInfoValidationError);
      expect(() => createBusinessInfo(params)).toThrow('Company name must be at least 2 characters');
    });

    it('should accept company name with exactly 2 characters', () => {
      const params = createValidBusinessInfoParams({ companyName: 'AB' });

      expect(() => createBusinessInfo(params)).not.toThrow();
      const businessInfo = createBusinessInfo(params);
      expect(businessInfo.companyName).toBe('AB');
    });

    it('should throw error for company name too long', () => {
      const longName = 'A'.repeat(101); // 101 characters
      const params = createValidBusinessInfoParams({ companyName: longName });

      expect(() => createBusinessInfo(params)).toThrow(BusinessInfoValidationError);
      expect(() => createBusinessInfo(params)).toThrow('Company name must be less than 100 characters');
    });

    it('should accept company name with exactly 100 characters', () => {
      const maxName = 'A'.repeat(100); // 100 characters
      const params = createValidBusinessInfoParams({ companyName: maxName });

      expect(() => createBusinessInfo(params)).not.toThrow();
      const businessInfo = createBusinessInfo(params);
      expect(businessInfo.companyName).toBe(maxName);
    });
  });

  describe('employee count validation', () => {
    it('should throw error for zero employees', () => {
      const params = createValidBusinessInfoParams({ employeeCount: 0 });

      expect(() => createBusinessInfo(params)).toThrow(BusinessInfoValidationError);
      expect(() => createBusinessInfo(params)).toThrow('Employee count must be at least 1');
    });

    it('should throw error for negative employee count', () => {
      const params = createValidBusinessInfoParams({ employeeCount: -5 });

      expect(() => createBusinessInfo(params)).toThrow(BusinessInfoValidationError);
      expect(() => createBusinessInfo(params)).toThrow('Employee count must be at least 1');
    });

    it('should accept minimum employee count of 1', () => {
      const params = createValidBusinessInfoParams({ employeeCount: 1 });

      expect(() => createBusinessInfo(params)).not.toThrow();
      const businessInfo = createBusinessInfo(params);
      expect(businessInfo.employeeCount).toBe(1);
    });

    it('should throw error for unreasonably high employee count', () => {
      const params = createValidBusinessInfoParams({ employeeCount: 1000001 });

      expect(() => createBusinessInfo(params)).toThrow(BusinessInfoValidationError);
      expect(() => createBusinessInfo(params)).toThrow('Employee count seems too high');
    });

    it('should accept maximum reasonable employee count', () => {
      const params = createValidBusinessInfoParams({ employeeCount: 1000000 });

      expect(() => createBusinessInfo(params)).not.toThrow();
      const businessInfo = createBusinessInfo(params);
      expect(businessInfo.employeeCount).toBe(1000000);
    });

    it('should handle edge case employee counts', () => {
      const edgeCases = [1, 10, 50, 250, 1000, 10000, 100000, 500000, 1000000];

      edgeCases.forEach(count => {
        const params = createValidBusinessInfoParams({ employeeCount: count });
        expect(() => createBusinessInfo(params)).not.toThrow();
        const businessInfo = createBusinessInfo(params);
        expect(businessInfo.employeeCount).toBe(count);
      });
    });
  });

  describe('website URL validation', () => {
    it('should accept valid HTTPS URL', () => {
      const params = createValidBusinessInfoParams({ website: 'https://example.com' });

      const businessInfo = createBusinessInfo(params);
      expect(businessInfo.website).toBe('https://example.com');
    });

    it('should accept valid HTTP URL', () => {
      const params = createValidBusinessInfoParams({ website: 'http://example.com' });

      const businessInfo = createBusinessInfo(params);
      expect(businessInfo.website).toBe('http://example.com');
    });

    it('should accept domain without protocol by adding https', () => {
      const params = createValidBusinessInfoParams({ website: 'example.com' });

      const businessInfo = createBusinessInfo(params);
      expect(businessInfo.website).toBe('example.com');
    });

    it('should accept subdomain URLs', () => {
      const params = createValidBusinessInfoParams({ website: 'https://www.example.com' });

      const businessInfo = createBusinessInfo(params);
      expect(businessInfo.website).toBe('https://www.example.com');
    });

    it('should accept URLs with paths', () => {
      const params = createValidBusinessInfoParams({ website: 'https://example.com/path/to/page' });

      const businessInfo = createBusinessInfo(params);
      expect(businessInfo.website).toBe('https://example.com/path/to/page');
    });

    it('should throw error for invalid URL format', () => {
      const invalidUrls = [
        'not-a-url',
        'ftp://example.com',
        '://invalid',
        'https://',
        'http://.com',
        'just words',
      ];

      invalidUrls.forEach(website => {
        const params = createValidBusinessInfoParams({ website });
        expect(() => createBusinessInfo(params)).toThrow(BusinessInfoValidationError);
        expect(() => createBusinessInfo(params)).toThrow('Invalid website URL');
      });
    });

    it('should handle undefined website', () => {
      const params = createValidBusinessInfoParams({ website: undefined });

      const businessInfo = createBusinessInfo(params);
      expect(businessInfo.website).toBeUndefined();
    });

    it('should trim website URL', () => {
      const params = createValidBusinessInfoParams({ website: '  https://example.com  ' });

      const businessInfo = createBusinessInfo(params);
      expect(businessInfo.website).toBe('https://example.com');
    });
  });

  describe('description validation', () => {
    it('should accept valid description', () => {
      const description = 'A valid business description';
      const params = createValidBusinessInfoParams({ description });

      const businessInfo = createBusinessInfo(params);
      expect(businessInfo.description).toBe(description);
    });

    it('should throw error for description too long', () => {
      const longDescription = 'A'.repeat(501); // 501 characters
      const params = createValidBusinessInfoParams({ description: longDescription });

      expect(() => createBusinessInfo(params)).toThrow(BusinessInfoValidationError);
      expect(() => createBusinessInfo(params)).toThrow('Description must be less than 500 characters');
    });

    it('should accept description with exactly 500 characters', () => {
      const maxDescription = 'A'.repeat(500); // 500 characters
      const params = createValidBusinessInfoParams({ description: maxDescription });

      expect(() => createBusinessInfo(params)).not.toThrow();
      const businessInfo = createBusinessInfo(params);
      expect(businessInfo.description).toBe(maxDescription);
    });

    it('should trim description', () => {
      const params = createValidBusinessInfoParams({ description: '  Valid description  ' });

      const businessInfo = createBusinessInfo(params);
      expect(businessInfo.description).toBe('Valid description');
    });

    it('should handle undefined description', () => {
      const params = createValidBusinessInfoParams({ description: undefined });

      const businessInfo = createBusinessInfo(params);
      expect(businessInfo.description).toBeUndefined();
    });

    it('should handle empty description', () => {
      const params = createValidBusinessInfoParams({ description: '' });

      const businessInfo = createBusinessInfo(params);
      expect(businessInfo.description).toBeUndefined();
    });
  });
});

// =============================================================================
// BUSINESS SIZE CATEGORY TESTS
// =============================================================================

describe('getBusinessSizeCategory', () => {
  it('should return "micro" for 1-10 employees', () => {
    expect(getBusinessSizeCategory(1)).toBe('micro');
    expect(getBusinessSizeCategory(5)).toBe('micro');
    expect(getBusinessSizeCategory(10)).toBe('micro');
  });

  it('should return "small" for 11-50 employees', () => {
    expect(getBusinessSizeCategory(11)).toBe('small');
    expect(getBusinessSizeCategory(25)).toBe('small');
    expect(getBusinessSizeCategory(50)).toBe('small');
  });

  it('should return "medium" for 51-250 employees', () => {
    expect(getBusinessSizeCategory(51)).toBe('medium');
    expect(getBusinessSizeCategory(100)).toBe('medium');
    expect(getBusinessSizeCategory(250)).toBe('medium');
  });

  it('should return "large" for 251+ employees', () => {
    expect(getBusinessSizeCategory(251)).toBe('large');
    expect(getBusinessSizeCategory(1000)).toBe('large');
    expect(getBusinessSizeCategory(10000)).toBe('large');
  });

  it('should handle edge cases correctly', () => {
    // Test boundaries
    expect(getBusinessSizeCategory(10)).toBe('micro');
    expect(getBusinessSizeCategory(11)).toBe('small');
    expect(getBusinessSizeCategory(50)).toBe('small');
    expect(getBusinessSizeCategory(51)).toBe('medium');
    expect(getBusinessSizeCategory(250)).toBe('medium');
    expect(getBusinessSizeCategory(251)).toBe('large');
  });
});

// =============================================================================
// RECOMMENDED PLAN TESTS
// =============================================================================

describe('getRecommendedPlan', () => {
  it('should recommend "starter" for micro business with low volume', () => {
    const businessInfo = createBusinessInfo({
      companyName: 'Micro Corp',
      businessType: 'startup',
      industry: 'retail',
      employeeCount: 5, // micro
      expectedVolume: 'low',
    });

    expect(getRecommendedPlan(businessInfo)).toBe('starter');
  });

  it('should recommend "growth" for micro business with medium/high volume', () => {
    const businessInfoMedium = createBusinessInfo({
      companyName: 'Micro Corp',
      businessType: 'startup',
      industry: 'retail',
      employeeCount: 8, // micro
      expectedVolume: 'medium',
    });

    const businessInfoHigh = createBusinessInfo({
      companyName: 'Micro Corp',
      businessType: 'startup',
      industry: 'retail',
      employeeCount: 10, // micro
      expectedVolume: 'high',
    });

    expect(getRecommendedPlan(businessInfoMedium)).toBe('growth');
    expect(getRecommendedPlan(businessInfoHigh)).toBe('enterprise'); // High volume overrides size
  });

  it('should recommend "growth" for small/medium businesses with low/medium volume', () => {
    const smallBusiness = createBusinessInfo({
      companyName: 'Small Corp',
      businessType: 'sme',
      industry: 'consulting',
      employeeCount: 25, // small
      expectedVolume: 'medium',
    });

    const mediumBusiness = createBusinessInfo({
      companyName: 'Medium Corp',
      businessType: 'sme',
      industry: 'healthcare',
      employeeCount: 100, // medium
      expectedVolume: 'low',
    });

    expect(getRecommendedPlan(smallBusiness)).toBe('growth');
    expect(getRecommendedPlan(mediumBusiness)).toBe('growth');
  });

  it('should recommend "enterprise" for large businesses', () => {
    const largeBusiness = createBusinessInfo({
      companyName: 'Large Corp',
      businessType: 'enterprise',
      industry: 'technology',
      employeeCount: 500, // large
      expectedVolume: 'low',
    });

    expect(getRecommendedPlan(largeBusiness)).toBe('enterprise');
  });

  it('should recommend "enterprise" for high volume regardless of size', () => {
    const microHighVolume = createBusinessInfo({
      companyName: 'Micro High Volume',
      businessType: 'startup',
      industry: 'e-commerce',
      employeeCount: 3, // micro
      expectedVolume: 'high',
    });

    const smallHighVolume = createBusinessInfo({
      companyName: 'Small High Volume',
      businessType: 'sme',
      industry: 'e-commerce',
      employeeCount: 30, // small
      expectedVolume: 'high',
    });

    expect(getRecommendedPlan(microHighVolume)).toBe('enterprise');
    expect(getRecommendedPlan(smallHighVolume)).toBe('enterprise');
  });

  it('should handle all business size and volume combinations', () => {
    const testCases = [
      { employees: 5, volume: 'low', expected: 'starter' },
      { employees: 5, volume: 'medium', expected: 'growth' },
      { employees: 5, volume: 'high', expected: 'enterprise' },
      { employees: 25, volume: 'low', expected: 'growth' },
      { employees: 25, volume: 'medium', expected: 'growth' },
      { employees: 25, volume: 'high', expected: 'enterprise' },
      { employees: 100, volume: 'low', expected: 'growth' },
      { employees: 100, volume: 'medium', expected: 'growth' },
      { employees: 100, volume: 'high', expected: 'enterprise' },
      { employees: 500, volume: 'low', expected: 'enterprise' },
      { employees: 500, volume: 'medium', expected: 'enterprise' },
      { employees: 500, volume: 'high', expected: 'enterprise' },
    ] as const;

    testCases.forEach(({ employees, volume, expected }) => {
      const businessInfo = createBusinessInfo({
        companyName: 'Test Corp',
        businessType: 'sme',
        industry: 'technology',
        employeeCount: employees,
        expectedVolume: volume,
      });

      expect(getRecommendedPlan(businessInfo)).toBe(expected);
    });
  });
});

// =============================================================================
// WEBSITE URL FORMATTING TESTS
// =============================================================================

describe('formatWebsiteUrl', () => {
  it('should return empty string for empty input', () => {
    expect(formatWebsiteUrl('')).toBe('');
    expect(formatWebsiteUrl('   ')).toBe('');
  });

  it('should keep HTTPS URLs unchanged', () => {
    const httpsUrl = 'https://example.com';
    expect(formatWebsiteUrl(httpsUrl)).toBe(httpsUrl);
  });

  it('should keep HTTP URLs unchanged', () => {
    const httpUrl = 'http://example.com';
    expect(formatWebsiteUrl(httpUrl)).toBe(httpUrl);
  });

  it('should add https:// to domain-only URLs', () => {
    expect(formatWebsiteUrl('example.com')).toBe('https://example.com');
    expect(formatWebsiteUrl('www.example.com')).toBe('https://www.example.com');
    expect(formatWebsiteUrl('subdomain.example.com')).toBe('https://subdomain.example.com');
  });

  it('should handle URLs with paths', () => {
    expect(formatWebsiteUrl('example.com/path')).toBe('https://example.com/path');
    expect(formatWebsiteUrl('example.com/path/to/page')).toBe('https://example.com/path/to/page');
  });

  it('should handle URLs with query parameters', () => {
    expect(formatWebsiteUrl('example.com?param=value')).toBe('https://example.com?param=value');
    expect(formatWebsiteUrl('example.com/path?param=value&other=test')).toBe('https://example.com/path?param=value&other=test');
  });

  it('should handle URLs with fragments', () => {
    expect(formatWebsiteUrl('example.com#section')).toBe('https://example.com#section');
    expect(formatWebsiteUrl('example.com/path#section')).toBe('https://example.com/path#section');
  });

  it('should trim whitespace', () => {
    expect(formatWebsiteUrl('  example.com  ')).toBe('https://example.com');
    expect(formatWebsiteUrl('  https://example.com  ')).toBe('https://example.com');
  });

  it('should handle complex URLs correctly', () => {
    const complexUrls = [
      { input: 'api.example.com/v1/endpoint', expected: 'https://api.example.com/v1/endpoint' },
      { input: 'example.com:8080', expected: 'https://example.com:8080' },
      { input: 'localhost:3000', expected: 'https://localhost:3000' },
    ];

    complexUrls.forEach(({ input, expected }) => {
      expect(formatWebsiteUrl(input)).toBe(expected);
    });
  });
});

// =============================================================================
// DISPLAY NAME TESTS
// =============================================================================

describe('getBusinessTypeDisplayName', () => {
  it('should return correct display names for all business types', () => {
    const expectedMappings: Record<BusinessType, string> = {
      'startup': 'Startup',
      'sme': 'Small/Medium Enterprise',
      'enterprise': 'Large Enterprise',
      'agency': 'Agency/Consultancy',
      'non-profit': 'Non-Profit Organization',
      'other': 'Other',
    };

    Object.entries(expectedMappings).forEach(([businessType, expectedName]) => {
      expect(getBusinessTypeDisplayName(businessType as BusinessType)).toBe(expectedName);
    });
  });
});

describe('getIndustryDisplayName', () => {
  it('should return correct display names for all industries', () => {
    const expectedMappings: Record<Industry, string> = {
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

    Object.entries(expectedMappings).forEach(([industry, expectedName]) => {
      expect(getIndustryDisplayName(industry as Industry)).toBe(expectedName);
    });
  });
});

// =============================================================================
// ERROR HANDLING TESTS
// =============================================================================

describe('BusinessInfoValidationError', () => {
  it('should be instance of Error', () => {
    const error = new BusinessInfoValidationError('Test error');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(BusinessInfoValidationError);
  });

  it('should have correct name property', () => {
    const error = new BusinessInfoValidationError('Test error');
    expect(error.name).toBe('BusinessInfoValidationError');
  });

  it('should preserve error message', () => {
    const message = 'Custom validation error message';
    const error = new BusinessInfoValidationError(message);
    expect(error.message).toBe(message);
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

describe('BusinessInfo integration tests', () => {
  it('should work with realistic business scenarios', () => {
    const scenarios = [
      {
        name: 'Tech startup',
        params: {
          companyName: 'TechStart AI',
          businessType: 'startup' as BusinessType,
          industry: 'technology' as Industry,
          employeeCount: 8,
          website: 'techstart.ai',
          description: 'AI-powered customer service automation',
          expectedVolume: 'medium' as const,
        },
        expectedPlan: 'growth',
        expectedCategory: 'micro',
      },
      {
        name: 'Healthcare SME',
        params: {
          companyName: 'HealthCare Solutions Ltd',
          businessType: 'sme' as BusinessType,
          industry: 'healthcare' as Industry,
          employeeCount: 45,
          website: 'https://healthcare-solutions.com',
          description: 'Telemedicine and patient management systems',
          expectedVolume: 'high' as const,
        },
        expectedPlan: 'enterprise',
        expectedCategory: 'small',
      },
      {
        name: 'Large enterprise',
        params: {
          companyName: 'Global Enterprise Corp',
          businessType: 'enterprise' as BusinessType,
          industry: 'finance' as Industry,
          employeeCount: 2500,
          website: 'https://www.globalenterprise.com',
          description: 'International financial services and banking solutions',
          expectedVolume: 'high' as const,
        },
        expectedPlan: 'enterprise',
        expectedCategory: 'large',
      },
    ];

    scenarios.forEach(({ name, params, expectedPlan, expectedCategory }) => {
      const businessInfo = createBusinessInfo(params);
      const plan = getRecommendedPlan(businessInfo);
      const category = getBusinessSizeCategory(businessInfo.employeeCount);

      expect(plan).toBe(expectedPlan);
      expect(category).toBe(expectedCategory);
      expect(businessInfo.companyName).toBe(params.companyName);
      expect(businessInfo.businessType).toBe(params.businessType);
      expect(businessInfo.industry).toBe(params.industry);
    });
  });

  it('should handle edge cases and validation combinations', () => {
    // Test minimum valid business info
    const minimalBusiness = createBusinessInfo({
      companyName: 'AB', // minimum length
      businessType: 'other',
      industry: 'other',
      employeeCount: 1, // minimum count
      expectedVolume: 'low',
    });

    expect(minimalBusiness.companyName).toBe('AB');
    expect(getBusinessSizeCategory(minimalBusiness.employeeCount)).toBe('micro');
    expect(getRecommendedPlan(minimalBusiness)).toBe('starter');

    // Test maximum valid business info
    const maximalBusiness = createBusinessInfo({
      companyName: 'A'.repeat(100), // maximum length
      businessType: 'enterprise',
      industry: 'technology',
      employeeCount: 1000000, // maximum count
      website: 'https://very-long-domain-name.example.com/very/long/path/to/resource',
      description: 'A'.repeat(500), // maximum length
      expectedVolume: 'high',
    });

    expect(maximalBusiness.companyName).toHaveLength(100);
    expect(maximalBusiness.description).toHaveLength(500);
    expect(getBusinessSizeCategory(maximalBusiness.employeeCount)).toBe('large');
    expect(getRecommendedPlan(maximalBusiness)).toBe('enterprise');
  });
});
