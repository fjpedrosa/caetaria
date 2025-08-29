/**
 * API configuration and endpoint definitions
 */

import type { ApiEndpoint } from "../types/utils.types"

/**
 * Base API configuration
 */
export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  version: "v1",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
} as const

/**
 * External API configurations
 */
export const externalApiConfig = {
  whatsapp: {
    baseUrl: "https://graph.facebook.com",
    version: "v17.0",
    timeout: 15000,
  },
  stripe: {
    publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    baseUrl: "https://api.stripe.com/v1",
  },
  google: {
    mapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    analyticsId: process.env.NEXT_PUBLIC_GA_ID,
  },
} as const

/**
 * API endpoint definitions
 */
export const apiEndpoints = {
  // Authentication endpoints
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    verify: "/auth/verify",
    resetPassword: "/auth/reset-password",
    confirmReset: "/auth/confirm-reset",
    changePassword: "/auth/change-password",
  },
  
  // User endpoints
  users: {
    profile: "/users/profile",
    update: "/users/profile",
    avatar: "/users/avatar",
    preferences: "/users/preferences",
    list: "/users",
    byId: (id: string) => `/users/${id}`,
  },
  
  // Lead/Contact endpoints
  leads: {
    list: "/leads",
    create: "/leads",
    byId: (id: string) => `/leads/${id}`,
    update: (id: string) => `/leads/${id}`,
    delete: (id: string) => `/leads/${id}`,
    export: "/leads/export",
    import: "/leads/import",
    stats: "/leads/stats",
  },
  
  // WhatsApp endpoints
  whatsapp: {
    config: "/whatsapp/config",
    messages: "/whatsapp/messages",
    send: "/whatsapp/send",
    templates: "/whatsapp/templates",
    media: "/whatsapp/media",
    webhook: "/whatsapp/webhook",
    verify: "/whatsapp/verify",
    status: "/whatsapp/status",
  },
  
  // Business endpoints
  business: {
    list: "/business",
    create: "/business",
    byId: (id: string) => `/business/${id}`,
    update: (id: string) => `/business/${id}`,
    delete: (id: string) => `/business/${id}`,
    members: (id: string) => `/business/${id}/members`,
    invite: (id: string) => `/business/${id}/invite`,
  },
  
  // Analytics endpoints
  analytics: {
    overview: "/analytics/overview",
    messages: "/analytics/messages",
    leads: "/analytics/leads",
    performance: "/analytics/performance",
    export: "/analytics/export",
    webVitals: "/analytics/web-vitals",
  },
  
  // File upload endpoints
  files: {
    upload: "/files/upload",
    byId: (id: string) => `/files/${id}`,
    delete: (id: string) => `/files/${id}`,
    generateSignedUrl: "/files/signed-url",
  },
  
  // Notification endpoints
  notifications: {
    list: "/notifications",
    markRead: "/notifications/mark-read",
    markAllRead: "/notifications/mark-all-read",
    preferences: "/notifications/preferences",
    subscribe: "/notifications/subscribe",
    unsubscribe: "/notifications/unsubscribe",
  },
  
  // Search endpoints
  search: {
    global: "/search",
    users: "/search/users",
    leads: "/search/leads",
    messages: "/search/messages",
    suggestions: "/search/suggestions",
  },
  
  // Webhook endpoints
  webhooks: {
    list: "/webhooks",
    create: "/webhooks",
    byId: (id: string) => `/webhooks/${id}`,
    update: (id: string) => `/webhooks/${id}`,
    delete: (id: string) => `/webhooks/${id}`,
    test: (id: string) => `/webhooks/${id}/test`,
    logs: (id: string) => `/webhooks/${id}/logs`,
  },
  
  // Subscription and billing endpoints
  billing: {
    plans: "/billing/plans",
    subscription: "/billing/subscription",
    portal: "/billing/portal",
    invoices: "/billing/invoices",
    paymentMethods: "/billing/payment-methods",
    usage: "/billing/usage",
  },
  
  // Integration endpoints
  integrations: {
    list: "/integrations",
    create: "/integrations",
    byId: (id: string) => `/integrations/${id}`,
    update: (id: string) => `/integrations/${id}`,
    delete: (id: string) => `/integrations/${id}`,
    sync: (id: string) => `/integrations/${id}/sync`,
    logs: (id: string) => `/integrations/${id}/logs`,
  },
  
  // Health and status endpoints
  health: {
    check: "/health",
    detailed: "/health/detailed",
    database: "/health/database",
    external: "/health/external",
  },
} as const

/**
 * HTTP methods
 */
export const httpMethods = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
} as const

/**
 * HTTP status codes
 */
export const httpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const

/**
 * API response formats
 */
export const responseFormats = {
  JSON: "application/json",
  XML: "application/xml",
  CSV: "text/csv",
  PDF: "application/pdf",
  EXCEL: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
} as const

/**
 * Rate limiting configuration
 */
export const rateLimits = {
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },
  fileUpload: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  },
  webhook: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
  },
} as const

/**
 * Cache configuration
 */
export const cacheConfig = {
  defaultTtl: 5 * 60 * 1000, // 5 minutes
  strategies: {
    staleWhileRevalidate: "stale-while-revalidate",
    cacheFirst: "cache-first",
    networkFirst: "network-first",
    networkOnly: "network-only",
    cacheOnly: "cache-only",
  },
  keys: {
    user: "user",
    leads: "leads",
    analytics: "analytics",
    notifications: "notifications",
  },
} as const

/**
 * Request/Response interceptor configuration
 */
export const interceptorConfig = {
  request: {
    addAuthToken: true,
    addTimestamp: true,
    addRequestId: true,
    validatePayload: true,
    logRequests: process.env.NODE_ENV === "development",
  },
  response: {
    parseErrors: true,
    logErrors: true,
    handleUnauthorized: true,
    transformData: true,
  },
} as const

/**
 * Mock API configuration (for development)
 */
export const mockConfig = {
  enabled: process.env.NEXT_PUBLIC_ENABLE_MOCKING === "true",
  delay: parseInt(process.env.NEXT_PUBLIC_MOCK_DELAY || "1000"),
  errorRate: 0.1, // 10% error rate
  endpoints: {
    "/auth/login": { delay: 2000 },
    "/leads": { delay: 1500 },
    "/analytics/overview": { delay: 3000 },
  },
} as const

/**
 * WebSocket configuration
 */
export const websocketConfig = {
  url: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001",
  reconnectAttempts: 5,
  reconnectDelay: 3000,
  heartbeatInterval: 30000,
  channels: {
    notifications: "notifications",
    messages: "messages",
    analytics: "analytics",
    system: "system",
  },
} as const

/**
 * Build full API URL
 */
export function buildApiUrl(endpoint: string, params?: Record<string, string>): string {
  let url = `${apiConfig.baseUrl}${endpoint}`
  
  if (params) {
    const searchParams = new URLSearchParams(params)
    url += `?${searchParams.toString()}`
  }
  
  return url
}

/**
 * Build external API URL
 */
export function buildExternalUrl(
  service: keyof typeof externalApiConfig,
  endpoint: string,
  params?: Record<string, string>
): string {
  const config = externalApiConfig[service]
  
  // Check if the service has a baseUrl
  if (!('baseUrl' in config)) {
    throw new Error(`Service ${service} does not have a baseUrl configuration`)
  }
  
  let url = `${(config as any).baseUrl}${endpoint}`
  
  if (params) {
    const searchParams = new URLSearchParams(params)
    url += `?${searchParams.toString()}`
  }
  
  return url
}

/**
 * Get request configuration for a specific endpoint
 */
export function getRequestConfig(endpoint: string) {
  const config: {
    timeout: number
    headers: Record<string, string>
    retryAttempts: number
    retryDelay: number
  } = {
    timeout: apiConfig.timeout,
    headers: { ...apiConfig.headers },
    retryAttempts: apiConfig.retryAttempts,
    retryDelay: apiConfig.retryDelay,
  }
  
  // Apply endpoint-specific configurations
  if (endpoint.includes("/auth/")) {
    config.timeout = 10000 // Shorter timeout for auth
  } else if (endpoint.includes("/files/")) {
    config.timeout = 60000 // Longer timeout for file uploads
  } else if (endpoint.includes("/analytics/")) {
    config.timeout = 45000 // Longer timeout for analytics
  }
  
  return config
}

/**
 * Get cache configuration for a specific endpoint
 */
export function getCacheConfig(endpoint: string) {
  // Default cache configuration
  const config: {
    ttl: number
    strategy: string
  } = {
    ttl: cacheConfig.defaultTtl,
    strategy: cacheConfig.strategies.staleWhileRevalidate,
  }
  
  // Apply endpoint-specific cache configurations
  if (endpoint.includes("/users/profile")) {
    config.ttl = 10 * 60 * 1000 // 10 minutes for user profile
  } else if (endpoint.includes("/analytics/")) {
    config.ttl = 5 * 60 * 1000 // 5 minutes for analytics
    config.strategy = cacheConfig.strategies.cacheFirst
  } else if (endpoint.includes("/leads")) {
    config.ttl = 2 * 60 * 1000 // 2 minutes for leads
  } else if (endpoint.includes("/notifications")) {
    config.strategy = cacheConfig.strategies.networkFirst
    config.ttl = 30 * 1000 // 30 seconds for notifications
  }
  
  return config
}

/**
 * Check if endpoint should be mocked
 */
export function shouldMock(endpoint: string): boolean {
  if (!mockConfig.enabled) return false
  
  // Always mock in development if enabled
  if (process.env.NODE_ENV === "development") return true
  
  // Check for specific endpoint configurations
  return Object.keys(mockConfig.endpoints).some(pattern => 
    endpoint.includes(pattern)
  )
}

/**
 * Get mock delay for endpoint
 */
export function getMockDelay(endpoint: string): number {
  const endpointConfig = Object.entries(mockConfig.endpoints).find(([pattern]) => 
    endpoint.includes(pattern)
  )
  
  return endpointConfig ? endpointConfig[1].delay : mockConfig.delay
}

/**
 * API error messages
 */
export const apiErrorMessages = {
  [httpStatus.BAD_REQUEST]: "Invalid request. Please check your input.",
  [httpStatus.UNAUTHORIZED]: "You are not authorized. Please log in.",
  [httpStatus.FORBIDDEN]: "You don't have permission to access this resource.",
  [httpStatus.NOT_FOUND]: "The requested resource was not found.",
  [httpStatus.METHOD_NOT_ALLOWED]: "This method is not allowed for this resource.",
  [httpStatus.CONFLICT]: "A conflict occurred. The resource may already exist.",
  [httpStatus.UNPROCESSABLE_ENTITY]: "The request contains invalid data.",
  [httpStatus.TOO_MANY_REQUESTS]: "Too many requests. Please try again later.",
  [httpStatus.INTERNAL_SERVER_ERROR]: "An internal server error occurred.",
  [httpStatus.SERVICE_UNAVAILABLE]: "The service is temporarily unavailable.",
  network: "Network error. Please check your connection.",
  timeout: "Request timed out. Please try again.",
  unknown: "An unknown error occurred.",
} as const

/**
 * Content type helpers
 */
export const contentTypes = {
  json: "application/json",
  formData: "multipart/form-data",
  urlEncoded: "application/x-www-form-urlencoded",
  text: "text/plain",
  html: "text/html",
  xml: "application/xml",
} as const