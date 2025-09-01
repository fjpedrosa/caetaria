'use client'

import React, { useCallback, useEffect } from 'react'
import type { FallbackProps } from 'react-error-boundary'

import { createErrorReport } from '../../domain/services/error-reporting.service'
import type { ErrorReport } from '../../domain/types/error.types'

interface ErrorFallbackProps extends FallbackProps {
  /**
   * Custom title for the error message
   */
  title?: string
  /**
   * Custom description for the error
   */
  description?: string
  /**
   * Whether to show error details in development
   */
  showErrorDetails?: boolean
  /**
   * Additional actions to show alongside default actions
   */
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary'
  }>
  /**
   * Custom error reporting handler
   */
  onErrorReport?: (report: ErrorReport) => void
}

/**
 * Default Error Fallback Component
 * Provides a user-friendly error screen with accessibility features
 */
export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  title = 'Something went wrong',
  description = 'We apologize for the inconvenience. Our team has been notified and is working to fix this issue.',
  showErrorDetails = process.env.NODE_ENV === 'development',
  actions = [],
  onErrorReport
}) => {
  // Create error report on mount
  useEffect(() => {
    if (onErrorReport && error) {
      const report = createErrorReport(error, undefined, {
        fallbackComponent: 'ErrorFallback'
      })
      onErrorReport(report)
    }
  }, [error, onErrorReport])

  const handleReload = useCallback(() => {
    window.location.reload()
  }, [])

  const handleGoHome = useCallback(() => {
    window.location.href = '/'
  }, [])

  const handleRetry = useCallback(() => {
    resetErrorBoundary()
  }, [resetErrorBoundary])

  return (
    <div
      className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-md mx-auto text-center">
        {/* Error Icon */}
        <div className="mb-8" aria-hidden="true">
          <svg
            className="w-24 h-24 mx-auto text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        {/* Title */}
        <h1
          className="text-2xl font-bold text-gray-900 mb-4"
          id="error-title"
        >
          {title}
        </h1>

        {/* Description */}
        <p
          className="text-gray-600 mb-6"
          id="error-description"
          aria-describedby="error-title"
        >
          {description}
        </p>

        {/* Action Buttons */}
        <div className="space-y-3" role="group" aria-label="Error recovery actions">
          <button
            onClick={handleRetry}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            aria-describedby="error-description"
          >
            Try Again
          </button>

          <button
            onClick={handleReload}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            aria-describedby="error-description"
          >
            Reload Page
          </button>

          <button
            onClick={handleGoHome}
            className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            aria-describedby="error-description"
          >
            Go Home
          </button>

          {/* Custom Actions */}
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors focus:ring-2 focus:ring-offset-2 ${
                action.variant === 'primary'
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500'
              }`}
              aria-describedby="error-description"
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* Error Details (Development Only) */}
        {showErrorDetails && error && (
          <details className="mt-6 text-left">
            <summary
              className="cursor-pointer text-sm text-gray-500 mb-2 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded"
              aria-label="Toggle error details visibility"
            >
              Error Details (Development Only)
            </summary>
            <pre
              className="bg-red-50 p-4 rounded text-xs text-red-800 overflow-auto max-h-64 border border-red-200"
              role="region"
              aria-label="Error details"
              tabIndex={0}
            >
              <strong>Error:</strong> {error.message}
              {error.stack && (
                <>
                  {'\n\n'}
                  <strong>Stack Trace:</strong>
                  {'\n'}
                  {error.stack}
                </>
              )}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

/**
 * Minimal Error Fallback for smaller components
 */
export const MinimalErrorFallback: React.FC<FallbackProps> = ({
  error,
  resetErrorBoundary
}) => {
  return (
    <div
      className="p-4 bg-red-50 border border-red-200 rounded-lg text-center"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center justify-center mb-2">
        <svg
          className="w-5 h-5 text-red-500 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <span className="text-sm font-medium text-red-800">
          Something went wrong
        </span>
      </div>

      <button
        onClick={resetErrorBoundary}
        className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
        aria-label="Retry loading this component"
      >
        Try again
      </button>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-xs text-red-600">
          {error.message}
        </div>
      )}
    </div>
  )
}

/**
 * Loading state error fallback for async components
 */
export const LoadingErrorFallback: React.FC<FallbackProps & {
  isLoading?: boolean
}> = ({
  error,
  resetErrorBoundary,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center p-8"
        role="status"
        aria-live="polite"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" aria-hidden="true" />
        <span className="ml-2 text-gray-600">Loading...</span>
        <span className="sr-only">Loading content</span>
      </div>
    )
  }

  return <MinimalErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
}