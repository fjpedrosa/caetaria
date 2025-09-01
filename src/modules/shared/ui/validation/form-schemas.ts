/**
 * Comprehensive Form Validation Schemas
 *
 * Centralized Zod validation schemas for all forms in the application.
 * Includes business logic validation, accessibility helpers, and
 * internationalization support.
 */

import { z } from 'zod';

// Common validation patterns
const phoneRegex = /^\+[1-9]\d{1,14}$/;
const urlRegex = /^https?:\/\/([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;

// Custom validation messages
const messages = {
  required: (field: string) => `${field} is required`,
  email: 'Please enter a valid email address',
  phone: 'Phone number must include country code (e.g., +1234567890)',
  url: 'Please enter a valid URL',
  minLength: (field: string, min: number) => `${field} must be at least ${min} characters`,
  maxLength: (field: string, max: number) => `${field} must be less than ${max} characters`,
  min: (field: string, min: number) => `${field} must be at least ${min}`,
  max: (field: string, max: number) => `${field} must be less than ${max}`,
};

// Lead source enum
export const leadSourceSchema = z.enum([
  'organic',
  'paid-ads',
  'social-media',
  'referral',
  'direct',
  'email-campaign',
  'content-marketing',
  'webinar',
  'demo-request',
  'pricing-page',
  'hero-cta',
  'features-cta',
  'footer-cta',
], {
  errorMap: () => ({ message: 'Invalid lead source' }),
});

// Lead status enum
export const leadStatusSchema = z.enum([
  'new',
  'contacted',
  'qualified',
  'proposal',
  'converted',
  'lost',
  'unqualified',
], {
  errorMap: () => ({ message: 'Invalid lead status' }),
});

/**
 * Lead Capture Form Schema
 * Enhanced with business logic validation
 */
export const leadCaptureSchema = z.object({
  email: z
    .string({ required_error: messages.required('Email') })
    .email(messages.email)
    .min(1, messages.required('Email'))
    .max(254, messages.maxLength('Email', 254))
    .toLowerCase()
    .transform((email) => email.trim()),

  firstName: z
    .string({ required_error: messages.required('First name') })
    .min(1, messages.required('First name'))
    .max(50, messages.maxLength('First name', 50))
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'First name contains invalid characters')
    .transform((name) => name.trim().replace(/\s+/g, ' ')),

  lastName: z
    .string()
    .max(50, messages.maxLength('Last name', 50))
    .regex(/^[a-zA-ZÀ-ÿ\s'-]*$/, 'Last name contains invalid characters')
    .transform((name) => name.trim().replace(/\s+/g, ' '))
    .optional(),

  phoneNumber: z
    .string()
    .refine((phone) => !phone || phoneRegex.test(phone), {
      message: messages.phone,
    })
    .optional(),

  companyName: z
    .string()
    .max(100, messages.maxLength('Company name', 100))
    .transform((name) => name.trim().replace(/\s+/g, ' '))
    .optional(),

  interestedFeatures: z
    .array(z.string())
    .max(10, 'Please select at most 10 features')
    .optional()
    .default([]),

  notes: z
    .string()
    .max(500, messages.maxLength('Notes', 500))
    .transform((notes) => notes.trim())
    .optional(),

  source: leadSourceSchema.default('hero-cta'),

  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
}).refine((data) => {
  // Business rule: If phone is provided, it should be valid
  if (data.phoneNumber && data.phoneNumber.length > 0) {
    return phoneRegex.test(data.phoneNumber);
  }
  return true;
}, {
  message: messages.phone,
  path: ['phoneNumber'],
});

/**
 * Business Information Form Schema
 * For onboarding flow
 */
export const businessInfoSchema = z.object({
  fullName: z
    .string({ required_error: messages.required('Full name') })
    .min(1, messages.required('Full name'))
    .max(100, messages.maxLength('Full name', 100))
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Full name contains invalid characters')
    .transform((name) => name.trim().replace(/\s+/g, ' ')),

  companyName: z
    .string()
    .min(2, messages.minLength('Company name', 2))
    .max(100, messages.maxLength('Company name', 100))
    .transform((name) => name.trim().replace(/\s+/g, ' '))
    .optional(),

  phoneNumber: z
    .string()
    .refine((phone) => !phone || phoneRegex.test(phone), {
      message: messages.phone,
    })
    .optional(),

  businessType: z.enum([
    'startup',
    'sme',
    'enterprise',
    'agency',
    'non-profit',
    'other',
  ], {
    errorMap: () => ({ message: messages.required('Business type') }),
  }).optional(),

  industry: z.enum([
    'e-commerce',
    'healthcare',
    'education',
    'finance',
    'real-estate',
    'travel',
    'food-beverage',
    'technology',
    'consulting',
    'retail',
    'other',
  ], {
    errorMap: () => ({ message: messages.required('Industry') }),
  }).optional(),

  employeeCount: z
    .number({
      required_error: messages.required('Employee count'),
      invalid_type_error: 'Employee count must be a number',
    })
    .min(1, messages.min('Employee count', 1))
    .max(1000000, messages.max('Employee count', 1000000))
    .optional(),

  expectedVolume: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: messages.required('Expected volume') }),
  }).optional(),

  website: z
    .string()
    .refine((url) => !url || urlRegex.test(url), {
      message: messages.url,
    })
    .optional(),

  timezone: z.string().optional(),

  description: z
    .string()
    .max(500, messages.maxLength('Description', 500))
    .transform((desc) => desc.trim())
    .optional(),
});

/**
 * WhatsApp Integration Form Schema
 */
export const whatsappIntegrationSchema = z.object({
  phoneNumber: z
    .string({ required_error: messages.required('Phone number') })
    .regex(phoneRegex, messages.phone),

  phoneNumberId: z
    .string({ required_error: messages.required('Phone number ID') })
    .min(1, messages.required('Phone number ID'))
    .max(50, messages.maxLength('Phone number ID', 50)),

  businessAccountId: z
    .string({ required_error: messages.required('Business account ID') })
    .min(1, messages.required('Business account ID'))
    .max(50, messages.maxLength('Business account ID', 50)),

  accessToken: z
    .string({ required_error: messages.required('Access token') })
    .min(50, messages.minLength('Access token', 50))
    .max(500, messages.maxLength('Access token', 500)),

  webhookVerifyToken: z
    .string({ required_error: messages.required('Webhook verify token') })
    .min(10, messages.minLength('Webhook verify token', 10))
    .max(100, messages.maxLength('Webhook verify token', 100)),

  webhookUrl: z
    .string()
    .refine((url) => !url || urlRegex.test(url), {
      message: messages.url,
    })
    .optional(),

  testMode: z.boolean().default(true),
});

/**
 * Bot Configuration Form Schema
 */
export const botConfigurationSchema = z.object({
  name: z
    .string({ required_error: messages.required('Bot name') })
    .min(1, messages.required('Bot name'))
    .max(50, messages.maxLength('Bot name', 50))
    .transform((name) => name.trim()),

  description: z
    .string()
    .max(200, messages.maxLength('Description', 200))
    .transform((desc) => desc.trim())
    .optional(),

  welcomeMessage: z
    .string({ required_error: messages.required('Welcome message') })
    .min(10, messages.minLength('Welcome message', 10))
    .max(1000, messages.maxLength('Welcome message', 1000))
    .transform((msg) => msg.trim()),

  fallbackMessage: z
    .string({ required_error: messages.required('Fallback message') })
    .min(10, messages.minLength('Fallback message', 10))
    .max(500, messages.maxLength('Fallback message', 500))
    .transform((msg) => msg.trim()),

  businessHours: z.object({
    enabled: z.boolean().default(false),
    timezone: z.string().default('UTC'),
    schedule: z.array(z.object({
      day: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      enabled: z.boolean(),
    })).default([]),
  }).optional(),

  autoReplyEnabled: z.boolean().default(true),
  aiEnabled: z.boolean().default(false),

  aiModel: z
    .string()
    .optional(),

  aiPersonality: z
    .string()
    .max(500, messages.maxLength('AI personality', 500))
    .transform((personality) => personality.trim())
    .optional(),

  trainingData: z.array(z.object({
    question: z.string().min(1, 'Question is required'),
    answer: z.string().min(1, 'Answer is required'),
    keywords: z.array(z.string()).optional(),
  })).optional(),
});

// Type exports
export type LeadCaptureFormData = z.infer<typeof leadCaptureSchema>;
export type BusinessInfoFormData = z.infer<typeof businessInfoSchema>;
export type WhatsAppIntegrationFormData = z.infer<typeof whatsappIntegrationSchema>;
export type BotConfigurationFormData = z.infer<typeof botConfigurationSchema>;
export type LeadSource = z.infer<typeof leadSourceSchema>;
export type LeadStatus = z.infer<typeof leadStatusSchema>;

// Validation helpers
export const validateEmail = (email: string) => {
  try {
    leadCaptureSchema.pick({ email: true }).parse({ email });
    return { isValid: true, error: null };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof z.ZodError ? error.errors[0]?.message : 'Invalid email'
    };
  }
};

export const validatePhoneNumber = (phone: string) => {
  try {
    whatsappIntegrationSchema.pick({ phoneNumber: true }).parse({ phoneNumber: phone });
    return { isValid: true, error: null };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof z.ZodError ? error.errors[0]?.message : 'Invalid phone number'
    };
  }
};

// Form step validation
export const validateFormStep = <T extends Record<string, any>>(
  schema: z.ZodSchema<T>,
  data: Partial<T>
): { isValid: boolean; errors: Record<string, string[]>; canProceed: boolean } => {
  try {
    schema.parse(data);
    return {
      isValid: true,
      errors: {},
      canProceed: true,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.reduce((acc, err) => {
        const path = err.path.join('.');
        if (!acc[path]) acc[path] = [];
        acc[path].push(err.message);
        return acc;
      }, {} as Record<string, string[]>);

      // Determine if user can proceed (partial validation)
      const criticalFields = ['email', 'firstName', 'phoneNumber', 'accessToken'];
      const hasCriticalErrors = Object.keys(errors).some(path =>
        criticalFields.some(field => path.includes(field))
      );

      return {
        isValid: false,
        errors,
        canProceed: !hasCriticalErrors,
      };
    }

    return {
      isValid: false,
      errors: { general: ['Validation failed'] },
      canProceed: false,
    };
  }
};