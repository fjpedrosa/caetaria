import { z } from 'zod'

import { VALIDATION_PATTERNS } from './constants'

/**
 * Common validation schemas using Zod
 */

// Basic field validators
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')

export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(VALIDATION_PATTERNS.phone, 'Please enter a valid phone number')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    VALIDATION_PATTERNS.password,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  )

export const urlSchema = z
  .string()
  .min(1, 'URL is required')
  .regex(VALIDATION_PATTERNS.url, 'Please enter a valid URL')

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .trim()

export const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .regex(VALIDATION_PATTERNS.slug, 'Slug can only contain lowercase letters, numbers, and hyphens')

export const numericSchema = z
  .string()
  .regex(VALIDATION_PATTERNS.numeric, 'Only numbers are allowed')
  .transform(Number)

// File validation
export const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')

export const imageSchema = fileSchema
  .refine(
    (file) => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type),
    'Only JPEG, PNG, GIF, and WebP images are allowed'
  )

// Contact form validation
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  company: z.string().max(100, 'Company name must be less than 100 characters').optional(),
  message: z
    .string()
    .min(1, 'Message is required')
    .max(1000, 'Message must be less than 1000 characters')
    .trim(),
  subject: z.string().max(200, 'Subject must be less than 200 characters').optional(),
})

export type ContactFormData = z.infer<typeof contactFormSchema>

// Newsletter signup validation
export const newsletterSchema = z.object({
  email: emailSchema,
  firstName: z.string().max(50, 'First name must be less than 50 characters').optional(),
  lastName: z.string().max(50, 'Last name must be less than 50 characters').optional(),
  preferences: z.array(z.string()).optional(),
})

export type NewsletterData = z.infer<typeof newsletterSchema>

// User registration validation
export const registrationSchema = z
  .object({
    firstName: nameSchema.max(50, 'First name must be less than 50 characters'),
    lastName: nameSchema.max(50, 'Last name must be less than 50 characters'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    terms: z.boolean().refine((val) => val === true, 'You must accept the terms and conditions'),
    marketing: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type RegistrationData = z.infer<typeof registrationSchema>

// Login validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

export type LoginData = z.infer<typeof loginSchema>

// Profile update validation
export const profileSchema = z.object({
  firstName: nameSchema.max(50, 'First name must be less than 50 characters'),
  lastName: nameSchema.max(50, 'Last name must be less than 50 characters'),
  email: emailSchema,
  phone: phoneSchema.optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  website: urlSchema.optional().or(z.literal('')),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  avatar: z.string().url('Please enter a valid avatar URL').optional(),
})

export type ProfileData = z.infer<typeof profileSchema>

// WhatsApp configuration validation
export const whatsappConfigSchema = z.object({
  businessName: nameSchema.max(100, 'Business name must be less than 100 characters'),
  phoneNumber: phoneSchema,
  accessToken: z.string().min(1, 'Access token is required'),
  verifyToken: z.string().min(1, 'Verify token is required'),
  webhookUrl: urlSchema,
  businessId: z.string().min(1, 'Business ID is required'),
  appId: z.string().min(1, 'App ID is required'),
  appSecret: z.string().min(1, 'App secret is required'),
})

export type WhatsAppConfigData = z.infer<typeof whatsappConfigSchema>

// Business information validation
export const businessInfoSchema = z.object({
  name: nameSchema.max(100, 'Business name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  industry: z.string().min(1, 'Please select an industry'),
  size: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+'], {
    message: 'Please select a business size',
  }),
  website: urlSchema.optional().or(z.literal('')),
  address: z
    .object({
      street: z.string().max(100, 'Street must be less than 100 characters').optional(),
      city: z.string().max(50, 'City must be less than 50 characters').optional(),
      state: z.string().max(50, 'State must be less than 50 characters').optional(),
      country: z.string().min(1, 'Country is required'),
      zipCode: z.string().max(20, 'ZIP code must be less than 20 characters').optional(),
    })
    .optional(),
})

export type BusinessInfoData = z.infer<typeof businessInfoSchema>

// Search validation
export const searchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query cannot be empty')
    .max(100, 'Search query must be less than 100 characters')
    .trim(),
  filters: z
    .object({
      category: z.string().optional(),
      dateRange: z
        .object({
          from: z.date().optional(),
          to: z.date().optional(),
        })
        .optional(),
      tags: z.array(z.string()).optional(),
    })
    .optional(),
})

export type SearchData = z.infer<typeof searchSchema>

// Pagination validation
export const paginationSchema = z.object({
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  pageSize: z.number().int().min(1).max(100, 'Page size must be between 1 and 100').default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export type PaginationData = z.infer<typeof paginationSchema>

// API response validation
export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z
      .object({
        message: z.string(),
        code: z.string().optional(),
        details: z.unknown().optional(),
      })
      .optional(),
    meta: z
      .object({
        page: z.number().optional(),
        pageSize: z.number().optional(),
        total: z.number().optional(),
        totalPages: z.number().optional(),
      })
      .optional(),
  })

// Webhook validation
export const webhookSchema = z.object({
  object: z.string(),
  entry: z.array(
    z.object({
      id: z.string(),
      changes: z.array(
        z.object({
          value: z.object({
            messaging_product: z.string(),
            metadata: z.object({
              display_phone_number: z.string(),
              phone_number_id: z.string(),
            }),
            messages: z
              .array(
                z.object({
                  from: z.string(),
                  id: z.string(),
                  timestamp: z.string(),
                  text: z
                    .object({
                      body: z.string(),
                    })
                    .optional(),
                  type: z.string(),
                })
              )
              .optional(),
          }),
          field: z.string(),
        })
      ),
    })
  ),
})

export type WebhookData = z.infer<typeof webhookSchema>

// Custom validation helpers
export const createEnumSchema = <T extends readonly string[]>(
  values: T,
  errorMessage?: string
) => {
  return z.enum(values as any, {
    message: errorMessage || `Must be one of: ${values.join(', ')}`,
  })
}

export const createOptionalStringSchema = (maxLength?: number) => {
  let schema = z.string().trim()

  if (maxLength) {
    schema = schema.max(maxLength, `Must be less than ${maxLength} characters`)
  }

  return schema.optional().or(z.literal(''))
}

// Validation utilities
export const validateEmail = (email: string): boolean => {
  return emailSchema.safeParse(email).success
}

export const validatePhone = (phone: string): boolean => {
  return phoneSchema.safeParse(phone).success
}

export const validateUrl = (url: string): boolean => {
  return urlSchema.safeParse(url).success
}

export const validatePassword = (password: string): boolean => {
  return passwordSchema.safeParse(password).success
}

/**
 * Password strength checker
 */
export const checkPasswordStrength = (password: string): {
  score: number
  feedback: string[]
  isStrong: boolean
} => {
  const feedback: string[] = []
  let score = 0

  // Length check
  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('Use at least 8 characters')
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include uppercase letters')
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include lowercase letters')
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push('Include numbers')
  }

  // Special character check
  if (/[@$!%*?&]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include special characters (@$!%*?&)')
  }

  return {
    score,
    feedback,
    isStrong: score >= 4,
  }
}