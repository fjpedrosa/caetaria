/**
 * Pure error reporting functions
 * No side effects, only data transformation
 */

import type { EnhancedError,ErrorInfo, ErrorReport, ErrorSeverity } from '../types/error.types'

/**
 * Generates a unique error ID for tracking purposes
 */
export const generateErrorId = (): string => {
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 8)
  return `err_${timestamp}_${randomPart}`
}

/**
 * Determines error severity based on error characteristics
 */
export const determineErrorSeverity = (error: Error, errorInfo?: ErrorInfo): ErrorSeverity => {
  const errorMessage = error.message.toLowerCase()
  const errorStack = error.stack?.toLowerCase() || ''

  // Critical errors that break the entire application
  if (
    errorMessage.includes('out of memory') ||
    errorMessage.includes('maximum call stack') ||
    errorMessage.includes('script error') ||
    errorStack.includes('chunk')
  ) {
    return 'critical'
  }

  // High severity errors that affect major functionality
  if (
    errorMessage.includes('network error') ||
    errorMessage.includes('failed to fetch') ||
    errorMessage.includes('permission denied') ||
    errorInfo?.componentStack?.includes('Providers')
  ) {
    return 'high'
  }

  // Medium severity errors that affect specific features
  if (
    errorMessage.includes('validation') ||
    errorMessage.includes('not found') ||
    errorMessage.includes('unauthorized')
  ) {
    return 'medium'
  }

  // Default to low severity
  return 'low'
}

/**
 * Creates an error report from error and environment information
 */
export const createErrorReport = (
  error: Error,
  errorInfo?: ErrorInfo,
  additionalContext?: Record<string, any>
): ErrorReport => {
  const errorId = generateErrorId()
  const severity = determineErrorSeverity(error, errorInfo)

  return {
    errorId,
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo?.componentStack,
    timestamp: Date.now(),
    url: typeof window !== 'undefined' ? window.location.href : 'server',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
    ...additionalContext,
    severity
  }
}

/**
 * Sanitizes error data to remove sensitive information
 */
export const sanitizeErrorReport = (report: ErrorReport): ErrorReport => {
  const sanitized = { ...report }

  // Remove potential sensitive data from stack traces
  if (sanitized.stack) {
    sanitized.stack = sanitized.stack
      .replace(/\/Users\/[^\/]+/g, '/user')
      .replace(/\/home\/[^\/]+/g, '/home')
      .replace(/C:\\Users\\[^\\]+/g, 'C:\\Users\\user')
      .replace(/access_token=[^&\s]+/g, 'access_token=***')
      .replace(/password=[^&\s]+/g, 'password=***')
      .replace(/api_key=[^&\s]+/g, 'api_key=***')
  }

  // Sanitize URL parameters
  if (sanitized.url) {
    try {
      const url = new URL(sanitized.url)
      url.searchParams.delete('token')
      url.searchParams.delete('password')
      url.searchParams.delete('api_key')
      sanitized.url = url.toString()
    } catch {
      // If URL parsing fails, just remove query parameters entirely
      sanitized.url = sanitized.url.split('?')[0]
    }
  }

  return sanitized
}

/**
 * Validates that an error report has all required fields
 */
export const validateErrorReport = (report: ErrorReport): boolean => {
  return !!(
    report.errorId &&
    report.message &&
    report.timestamp &&
    report.url &&
    report.userAgent
  )
}

/**
 * Groups similar errors to prevent spam reporting
 */
export const createErrorFingerprint = (error: Error): string => {
  const message = error.message.replace(/\d+/g, 'N') // Replace numbers
  const firstStackLine = error.stack?.split('\n')[1] || ''
  return btoa(`${message}:${firstStackLine}`).substring(0, 16)
}

/**
 * Checks if an error should be reported based on filters
 */
export const shouldReportError = (
  error: Error,
  errorInfo: ErrorInfo | undefined,
  config: { enabled: boolean; environment: string }
): boolean => {
  if (!config.enabled) return false

  // Don't report in development unless explicitly enabled
  if (config.environment === 'development') return false

  // Filter out known non-critical errors
  const ignoredPatterns = [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    'Loading chunk',
    'Loading CSS chunk'
  ]

  return !ignoredPatterns.some(pattern =>
    error.message.includes(pattern)
  )
}