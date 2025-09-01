/**
 * Domain types for error handling
 * Pure types with no framework dependencies
 */

export interface ErrorInfo {
  componentStack?: string
  errorBoundary?: string
  errorBoundaryStack?: string
}

export interface ErrorReport {
  message: string
  stack?: string
  componentStack?: string
  timestamp: number
  url: string
  userAgent: string
  errorId: string
  severity?: ErrorSeverity
}

export interface ErrorReportingConfig {
  apiEndpoint: string
  enabled: boolean
  maxRetries: number
  retryDelay: number
}

export interface ErrorBoundaryConfig {
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  enableReporting?: boolean
  showErrorDetails?: boolean
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface EnhancedError extends Error {
  severity?: ErrorSeverity
  context?: Record<string, any>
  userId?: string
  sessionId?: string
}