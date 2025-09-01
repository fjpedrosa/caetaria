'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, Bug, ChevronDown,RefreshCw } from 'lucide-react';

import { Button } from '@/modules/shared/ui/components/ui/button';
import { Card } from '@/modules/shared/ui/components/ui/card';

/**
 * Form Error Boundary Component
 *
 * Comprehensive error handling for forms with:
 * - Graceful error recovery
 * - User-friendly error messages
 * - Developer information in development
 * - Analytics integration for error tracking
 * - Accessibility support
 */

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  formName?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableRecovery?: boolean;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  retryCount: number;
}

export class FormErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log error for debugging
    console.error('Form Error Boundary caught an error:', error, errorInfo);

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Track error analytics
    this.trackError(error, errorInfo);
  }

  trackError = (error: Error, errorInfo: ErrorInfo) => {
    // Analytics tracking for form errors
    if (typeof window !== 'undefined') {
      // Replace with your analytics service
      const analyticsData = {
        formName: this.props.formName || 'unknown',
        errorMessage: error.message,
        errorStack: error.stack,
        componentStack: errorInfo.componentStack,
        retryCount: this.state.retryCount,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      };

      // Example: Send to analytics service
      console.log('Form error analytics:', analyticsData);
    }
  };

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      retryCount: prevState.retryCount + 1,
    }));
  };

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails,
    }));
  };

  render() {
    const { hasError, error, errorInfo, showDetails, retryCount } = this.state;
    const { children, fallback, enableRecovery = true, formName } = this.props;

    if (hasError) {
      // Custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-red-600" aria-hidden="true" />
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                {formName ? `${formName} Error` : 'Form Error'}
              </h3>

              <p className="text-red-700 mb-4">
                We encountered an issue while processing your form. This might be due to a
                temporary problem or invalid data format.
              </p>

              {/* User-friendly error message */}
              <div className="bg-white rounded-lg p-4 border border-red-200 mb-4">
                <div className="flex items-center space-x-2 text-red-800">
                  <Bug className="w-4 h-4" />
                  <span className="font-medium">Error Details:</span>
                </div>
                <p className="text-red-700 mt-1 text-sm">
                  {this.getUserFriendlyErrorMessage(error?.message || 'Unknown error')}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                {enableRecovery && retryCount < 3 && (
                  <Button
                    onClick={this.handleRetry}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                    {retryCount > 0 && ` (${retryCount + 1}/3)`}
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  size="sm"
                >
                  Refresh Page
                </Button>
              </div>

              {/* Developer details (only in development) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="border-t border-red-200 pt-4">
                  <button
                    onClick={this.toggleDetails}
                    className="flex items-center space-x-2 text-red-600 hover:text-red-800 text-sm font-medium"
                    aria-expanded={showDetails}
                  >
                    <span>Developer Information</span>
                    <ChevronDown
                      className={`w-4 h-4 transform transition-transform ${
                        showDetails ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {showDetails && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <h4 className="font-medium text-red-900 text-sm mb-1">Error Message:</h4>
                        <pre className="text-xs bg-red-100 p-2 rounded border text-red-800 overflow-x-auto">
                          {error?.message}
                        </pre>
                      </div>

                      {error?.stack && (
                        <div>
                          <h4 className="font-medium text-red-900 text-sm mb-1">Stack Trace:</h4>
                          <pre className="text-xs bg-red-100 p-2 rounded border text-red-800 overflow-x-auto max-h-32 overflow-y-auto">
                            {error.stack}
                          </pre>
                        </div>
                      )}

                      {errorInfo?.componentStack && (
                        <div>
                          <h4 className="font-medium text-red-900 text-sm mb-1">Component Stack:</h4>
                          <pre className="text-xs bg-red-100 p-2 rounded border text-red-800 overflow-x-auto max-h-32 overflow-y-auto">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Help text */}
              <div className="text-sm text-red-600 mt-4">
                <p>
                  If this problem persists, please{' '}
                  <a
                    href="mailto:support@example.com"
                    className="underline hover:no-underline"
                  >
                    contact support
                  </a>{' '}
                  or try refreshing the page.
                </p>
              </div>
            </div>
          </div>
        </Card>
      );
    }

    return children;
  }

  private getUserFriendlyErrorMessage(originalMessage: string): string {
    // Convert technical error messages to user-friendly ones
    const errorMappings: Record<string, string> = {
      'Network Error': 'Unable to connect to our servers. Please check your internet connection.',
      'ValidationError': 'Some fields contain invalid information. Please check and try again.',
      'Unauthorized': 'Your session has expired. Please refresh the page and try again.',
      'Forbidden': 'You do not have permission to perform this action.',
      'Not Found': 'The requested resource could not be found.',
      'Internal Server Error': 'Our servers are experiencing issues. Please try again later.',
      'Bad Request': 'The submitted data appears to be invalid. Please check your entries.',
      'Timeout': 'The request took too long to complete. Please try again.',
      'ChunkLoadError': 'Failed to load form components. Please refresh the page.',
    };

    // Check for specific error patterns
    for (const [pattern, friendlyMessage] of Object.entries(errorMappings)) {
      if (originalMessage.includes(pattern)) {
        return friendlyMessage;
      }
    }

    // Handle Zod validation errors
    if (originalMessage.includes('validation')) {
      return 'Please check the form fields for any errors and try again.';
    }

    // Handle network-related errors
    if (originalMessage.toLowerCase().includes('fetch')) {
      return 'Unable to submit the form due to a network issue. Please try again.';
    }

    // Default fallback
    return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
  }
}

/**
 * Hook to use form error boundary functionality
 */
export function useFormErrorHandler(formName?: string) {
  const handleError = React.useCallback((error: Error, errorInfo: ErrorInfo) => {
    // Custom error handling logic
    console.error(`Form error in ${formName}:`, error, errorInfo);

    // You can add additional error tracking here
    // e.g., send to error monitoring service
  }, [formName]);

  return { handleError };
}

/**
 * Simple error display component for inline errors
 */
export function FormErrorMessage({
  error,
  className = ''
}: {
  error: string | string[] | null | undefined;
  className?: string;
}) {
  if (!error) return null;

  const errorMessages = Array.isArray(error) ? error : [error];

  return (
    <div
      className={`flex items-start space-x-2 text-red-600 text-sm ${className}`}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <div>
        {errorMessages.map((message, index) => (
          <p key={index} className={index > 0 ? 'mt-1' : ''}>
            {message}
          </p>
        ))}
      </div>
    </div>
  );
}

/**
 * Success message component
 */
export function FormSuccessMessage({
  message,
  className = ''
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-start space-x-2 text-green-600 text-sm ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="w-4 h-4 mt-0.5 flex-shrink-0 rounded-full bg-green-600 flex items-center justify-center">
        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
          <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z"/>
        </svg>
      </div>
      <p>{message}</p>
    </div>
  );
}