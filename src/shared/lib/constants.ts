// App-wide constants

/**
 * Application metadata
 */
export const APP = {
  name: 'WhatsApp Cloud Landing',
  description: 'A comprehensive landing page for WhatsApp Cloud API integration',
  version: '1.0.0',
  url: 'https://your-domain.com',
} as const

/**
 * API configuration
 */
export const API = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
} as const

/**
 * Authentication constants
 */
export const AUTH = {
  tokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
  userKey: 'user_data',
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
} as const

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  theme: 'app_theme',
  language: 'app_language',
  onboardingCompleted: 'onboarding_completed',
  preferences: 'user_preferences',
  recentSearches: 'recent_searches',
} as const

/**
 * Theme configuration
 */
export const THEMES = {
  light: 'light',
  dark: 'dark',
  system: 'system',
} as const

/**
 * Supported languages
 */
export const LANGUAGES = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  pt: 'Português',
  de: 'Deutsch',
} as const

/**
 * Common HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const

/**
 * Common error messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  UNKNOWN_ERROR: 'An unknown error occurred.',
} as const

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully!',
  CREATED: 'Created successfully!',
  UPDATED: 'Updated successfully!',
  DELETED: 'Deleted successfully!',
  COPIED: 'Copied to clipboard!',
  EMAIL_SENT: 'Email sent successfully!',
} as const

/**
 * Form validation patterns
 */
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  url: /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&=]*)$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  numeric: /^\d+$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const

/**
 * File upload constraints
 */
export const FILE_UPLOAD = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  maxFiles: 5,
} as const

/**
 * Pagination defaults
 */
export const PAGINATION = {
  defaultPage: 1,
  defaultPageSize: 10,
  pageSizeOptions: [10, 20, 50, 100],
  maxPageSize: 100,
} as const

/**
 * Animation durations (in milliseconds)
 */
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 1000,
} as const

/**
 * Breakpoints for responsive design
 */
export const BREAKPOINTS = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

/**
 * WhatsApp specific constants
 */
export const WHATSAPP = {
  apiVersion: 'v17.0',
  maxMessageLength: 4096,
  maxMediaSize: 16 * 1024 * 1024, // 16MB
  supportedMessageTypes: [
    'text',
    'image',
    'audio',
    'video',
    'document',
    'location',
    'contacts',
    'template',
    'interactive',
  ],
  webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
} as const

/**
 * Social media links
 */
export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/yourcompany',
  facebook: 'https://facebook.com/yourcompany',
  linkedin: 'https://linkedin.com/company/yourcompany',
  instagram: 'https://instagram.com/yourcompany',
  github: 'https://github.com/yourcompany',
} as const

/**
 * Contact information
 */
export const CONTACT = {
  email: 'contact@yourcompany.com',
  phone: '+1-234-567-8900',
  address: '123 Business Street, City, State 12345',
  supportEmail: 'support@yourcompany.com',
  salesEmail: 'sales@yourcompany.com',
} as const

/**
 * Feature flags
 */
export const FEATURES = {
  analytics: true,
  darkMode: true,
  multiLanguage: false,
  notifications: true,
  offlineMode: false,
  betaFeatures: process.env.NODE_ENV === 'development',
} as const

/**
 * Rate limiting
 */
export const RATE_LIMITS = {
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
  fileUpload: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  },
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5,
  },
} as const

/**
 * Default values
 */
export const DEFAULTS = {
  locale: 'en-US',
  timezone: 'UTC',
  currency: 'USD',
  dateFormat: 'MM/dd/yyyy',
  timeFormat: '12h',
  pageSize: 20,
} as const

/**
 * External service URLs
 */
export const EXTERNAL_URLS = {
  whatsappDocs: 'https://developers.facebook.com/docs/whatsapp',
  privacyPolicy: '/privacy',
  termsOfService: '/terms',
  support: '/support',
  documentation: '/docs',
} as const