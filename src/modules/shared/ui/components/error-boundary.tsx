'use client'

import React, { ReactNode, useCallback, useEffect } from 'react'
import type { FallbackProps } from 'react-error-boundary'
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'

import { createErrorReport, shouldReportError } from '../../domain/services/error-reporting.service'
import type { ErrorInfo } from '../../domain/types/error.types'
import { reportError } from '../../infra/services/error-reporter'

import { ErrorFallback } from './error-fallback'

interface ErrorBoundaryProps {
  children?: ReactNode
  fallback?: ReactNode | ((props: FallbackProps) => ReactNode)
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  enableReporting?: boolean
  showErrorDetails?: boolean
  /**
   * Custom reset keys that will reset the error boundary when changed
   */
  resetKeys?: Array<string | number | boolean | null | undefined>
  /**
   * Called when the error boundary resets
   */
  onReset?: () => void
}

/**
 * Enhanced Error Handler Hook
 * Handles error reporting and logging with proper error context
 */
const useErrorHandler = (
  enableReporting = process.env.NODE_ENV === 'production',
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) => {
  return useCallback(
    (error: Error, errorInfo: { componentStack: string }) => {
      console.error('ErrorBoundary caught an error:', error, errorInfo)

      const enhancedErrorInfo: ErrorInfo = {
        componentStack: errorInfo.componentStack
      }

      // Call optional error handler
      onError?.(error, enhancedErrorInfo)

      // Report error if enabled and should be reported
      if (
        enableReporting &&
        shouldReportError(error, enhancedErrorInfo, {
          enabled: enableReporting,
          environment: process.env.NODE_ENV || 'development'
        })
      ) {
        const report = createErrorReport(error, enhancedErrorInfo, {
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
          timestamp: Date.now()
        })

        reportError(report).catch(reportingError => {
          console.error('Failed to report error:', reportingError)
        })
      }
    },
    [enableReporting, onError]
  )
}

/**
 * Enhanced ErrorBoundary using react-error-boundary
 * Provides functional implementation with comprehensive error handling
 */
const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  children,
  fallback,
  onError,
  enableReporting = process.env.NODE_ENV === 'production',
  showErrorDetails = process.env.NODE_ENV === 'development',
  resetKeys,
  onReset
}) => {
  const handleError = useErrorHandler(enableReporting, onError)

  // Default fallback component if none provided
  const defaultFallback = useCallback(
    (props: FallbackProps) => (
      <ErrorFallback
        {...props}
        showErrorDetails={showErrorDetails}
        onErrorReport={report => {
          if (enableReporting) {
            reportError(report).catch(console.error)
          }
        }}
      />
    ),
    [showErrorDetails, enableReporting]
  )

  // Determine which fallback to use
  const fallbackComponent = useCallback(
    (props: FallbackProps) => {
      if (fallback) {
        return typeof fallback === 'function' ? fallback(props) : fallback
      }
      return defaultFallback(props)
    },
    [fallback, defaultFallback]
  )

  return (
    <ReactErrorBoundary
      FallbackComponent={fallbackComponent}
      onError={handleError}
      resetKeys={resetKeys}
      onReset={onReset}
    >
      {children}
    </ReactErrorBoundary>
  )
}

export default ErrorBoundary

// Export additional components and utilities for convenience
export { ErrorFallback, LoadingErrorFallback,MinimalErrorFallback } from './error-fallback'
export type { ErrorBoundaryProps }

/**
 * HOC for wrapping components with error boundary
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}