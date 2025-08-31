/**
 * Application-wide configuration
 */

import type { AppConfig, Language,Theme } from '../types'

export const appConfig: AppConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Caetaria',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  environment: (process.env.NODE_ENV as AppConfig['environment']) || 'development',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',

  // Feature flags
  features: {
    analytics: process.env.NEXT_PUBLIC_FEATURE_ANALYTICS === 'true',
    darkMode: process.env.NEXT_PUBLIC_FEATURE_DARK_MODE !== 'false', // enabled by default
    multiLanguage: process.env.NEXT_PUBLIC_FEATURE_MULTI_LANGUAGE === 'true',
    notifications: process.env.NEXT_PUBLIC_FEATURE_NOTIFICATIONS !== 'false', // enabled by default
    offlineMode: process.env.NEXT_PUBLIC_FEATURE_OFFLINE_MODE === 'true',
    betaFeatures: process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_BETA === 'true',
    testimonials: process.env.NEXT_PUBLIC_FEATURE_TESTIMONIALS !== 'false',
    pricing: process.env.NEXT_PUBLIC_FEATURE_PRICING !== 'false',
    blog: process.env.NEXT_PUBLIC_FEATURE_BLOG === 'true',
    support: process.env.NEXT_PUBLIC_FEATURE_SUPPORT !== 'false',
    apiPlayground: process.env.NEXT_PUBLIC_FEATURE_API_PLAYGROUND === 'true',
  },

  // Analytics configuration
  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID,
    mixpanelToken: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
    hotjarId: process.env.NEXT_PUBLIC_HOTJAR_ID,
    enableTracking: process.env.NODE_ENV === 'production',
  },

  // Social media links
  social: {
    twitter: process.env.NEXT_PUBLIC_TWITTER_URL || 'https://twitter.com/yourcompany',
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://facebook.com/yourcompany',
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || 'https://linkedin.com/company/yourcompany',
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://instagram.com/yourcompany',
    github: process.env.NEXT_PUBLIC_GITHUB_URL || 'https://github.com/yourcompany',
    youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL,
    discord: process.env.NEXT_PUBLIC_DISCORD_URL,
  },
}

/**
 * Theme configuration
 */
export const themeConfig = {
  defaultTheme: 'system' as Theme,
  enableSystemTheme: true,
  storageKey: 'app_theme',
  attribute: 'class',
  themes: ['light', 'dark'] as Theme[],
} as const

/**
 * Internationalization configuration
 */
export const i18nConfig = {
  defaultLanguage: 'en' as Language,
  supportedLanguages: ['en', 'es', 'fr', 'pt', 'de'] as Language[],
  storageKey: 'app_language',
  fallbackLanguage: 'en' as Language,
  enableLanguageDetection: true,
} as const

/**
 * SEO configuration
 */
export const seoConfig = {
  defaultTitle: 'Caetaria - Automatiza WhatsApp para tu negocio',
  titleTemplate: '%s | Caetaria',
  defaultDescription: 'Aumenta tus ventas 30% automatizando WhatsApp. Caetaria te permite gestionar clientes, automatizar respuestas y cerrar más ventas. Configuración en 5 minutos.',
  defaultKeywords: ['whatsapp', 'business', 'api', 'messaging', 'cloud', 'integration'],
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://caetaria.com',
  defaultImage: '/images/og-image.jpg',
  twitterHandle: '@yourcompany',
  facebookAppId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
} as const

/**
 * Performance configuration
 */
export const performanceConfig = {
  enableServiceWorker: process.env.NODE_ENV === 'production',
  enableImageOptimization: true,
  enableLazyLoading: true,
  enablePreloading: true,
  cacheStrategy: 'networkFirst' as const,
  offlineFallback: '/offline.html',
  imageQuality: 80,
  imageSizes: [640, 768, 1024, 1280, 1600] as const,
} as const

/**
 * Security configuration
 */
export const securityConfig = {
  enableCSP: process.env.NODE_ENV === 'production',
  enableHSTS: process.env.NODE_ENV === 'production',
  enableSecurityHeaders: process.env.NODE_ENV === 'production',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    skipSuccessfulRequests: false,
  },
} as const

/**
 * Business configuration
 */
export const businessConfig = {
  name: process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Caetaria',
  description: 'Automatiza WhatsApp para tu negocio y aumenta tus ventas',
  email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'contact@yourcompany.com',
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+1-234-567-8900',
  address: {
    street: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS_STREET || '123 Business Street',
    city: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS_CITY || 'City',
    state: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS_STATE || 'State',
    zipCode: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS_ZIP || '12345',
    country: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS_COUNTRY || 'Country',
  },
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@yourcompany.com',
  salesEmail: process.env.NEXT_PUBLIC_SALES_EMAIL || 'sales@yourcompany.com',
  privacyPolicyUrl: '/privacy',
  termsOfServiceUrl: '/terms',
  supportUrl: '/support',
} as const

/**
 * WhatsApp specific configuration
 */
export const whatsappConfig = {
  apiVersion: 'v17.0' as const,
  baseUrl: 'https://graph.facebook.com',
  webhookPath: '/api/webhook/whatsapp',
  verifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
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
  ] as const,
  supportedMediaTypes: {
    image: ['image/jpeg', 'image/png', 'image/webp'],
    video: ['video/mp4', 'video/3gp'],
    audio: ['audio/aac', 'audio/mp4', 'audio/mpeg', 'audio/amr', 'audio/ogg'],
    document: ['application/pdf', 'application/vnd.ms-powerpoint', 'application/msword'],
  },
} as const

/**
 * Development configuration
 */
export const devConfig = {
  enableDebugMode: process.env.NODE_ENV === 'development',
  enableMocking: process.env.NEXT_PUBLIC_ENABLE_MOCKING === 'true',
  mockDelay: parseInt(process.env.NEXT_PUBLIC_MOCK_DELAY || '1000'),
  enableDevTools: process.env.NODE_ENV === 'development',
  logLevel: (process.env.NEXT_PUBLIC_LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
} as const

/**
 * Animation configuration
 */
export const animationConfig = {
  defaultDuration: 300,
  defaultEasing: 'cubic-bezier(0.4, 0, 0.2, 1)' as const,
  enableReducedMotion: true,
  durations: {
    fast: 150,
    normal: 300,
    slow: 500,
    verySlow: 1000,
  },
  easings: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
} as const

/**
 * Layout configuration
 */
export const layoutConfig = {
  header: {
    height: 64,
    sticky: true,
    showLogo: true,
    showNavigation: true,
    showActions: true,
  },
  footer: {
    showSocialLinks: true,
    showNewsletter: true,
    showLinks: true,
    variant: 'default' as const,
  },
  sidebar: {
    width: 280,
    collapsible: true,
    defaultCollapsed: false,
  },
  breakpoints: {
    xs: 480,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
} as const

/**
 * Form configuration
 */
export const formConfig = {
  defaultValidationMode: 'onChange' as const,
  defaultRevalidateMode: 'onChange' as const,
  defaultSubmitOnEnter: true,
  defaultRequiredIndicator: '*',
  defaultErrorDisplay: 'below' as const,
  debounceValidation: 300,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedDocumentTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
} as const

/**
 * Table configuration
 */
export const tableConfig = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 20, 50, 100],
  defaultSortOrder: 'asc' as const,
  showPagination: true,
  showSearch: true,
  showFilters: true,
  stickyHeader: true,
  enableSelection: false,
  enableActions: true,
  emptyMessage: 'No data available',
} as const

/**
 * Toast/Notification configuration
 */
export const toastConfig = {
  position: 'bottom-right' as const,
  duration: 5000,
  maxToasts: 5,
  enableSound: false,
  enableAnimation: true,
  pauseOnHover: true,
  closeOnClick: true,
  showProgress: true,
  types: {
    success: { duration: 4000, closable: true },
    error: { duration: 6000, closable: true },
    warning: { duration: 5000, closable: true },
    info: { duration: 4000, closable: true },
  },
} as const

/**
 * Get configuration based on environment
 */
export function getConfig() {
  return {
    app: appConfig,
    theme: themeConfig,
    i18n: i18nConfig,
    seo: seoConfig,
    performance: performanceConfig,
    security: securityConfig,
    business: businessConfig,
    whatsapp: whatsappConfig,
    dev: devConfig,
    animation: animationConfig,
    layout: layoutConfig,
    form: formConfig,
    table: tableConfig,
    toast: toastConfig,
  }
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof appConfig.features): boolean {
  return appConfig.features[feature] || false
}

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig() {
  const isDev = appConfig.environment === 'development'
  const isStaging = appConfig.environment === 'staging'
  const isProd = appConfig.environment === 'production'

  return {
    isDev,
    isStaging,
    isProd,
    isClient: typeof window !== 'undefined',
    isServer: typeof window === 'undefined',
  }
}