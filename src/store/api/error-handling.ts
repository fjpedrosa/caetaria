/**
 * Error Handling Utilities for RTK Query
 *
 * Centralized error handling, user-friendly error messages,
 * error recovery strategies, and error reporting utilities.
 *
 * Features:
 * - Standardized error formatting
 * - User-friendly error messages
 * - Error classification and severity levels
 * - Retry strategies and recovery mechanisms
 * - Error reporting and analytics
 * - Toast notifications integration
 */

import { useCallback } from 'react';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import type { SupabaseError } from './supabase-base-query';

// Error severity levels
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

// Error categories for better handling
export type ErrorCategory =
  | 'network'
  | 'authentication'
  | 'authorization'
  | 'validation'
  | 'server'
  | 'database'
  | 'rate_limit'
  | 'timeout'
  | 'unknown';

// Enhanced error interface
export interface EnhancedError {
  message: string;
  userMessage: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  code?: string;
  details?: any;
  canRetry: boolean;
  retryAfter?: number;
  suggestions?: string[];
  originalError: any;
  timestamp: string;
  context?: {
    operation?: string;
    endpoint?: string;
    userId?: string;
    sessionId?: string;
  };
}

// Error recovery strategies
export interface ErrorRecoveryStrategy {
  canRecover: boolean;
  strategy: 'retry' | 'fallback' | 'redirect' | 'manual';
  retryDelay?: number;
  maxRetries?: number;
  fallbackData?: any;
  redirectUrl?: string;
  actionRequired?: string;
}

/**
 * Classify error based on type and content
 */
export const classifyError = (error: any): ErrorCategory => {
  if (!error) return 'unknown';

  // Network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return 'network';
  }

  if (error.status) {
    const status = error.status;

    if (status === 401) return 'authentication';
    if (status === 403) return 'authorization';
    if (status === 400 || (status >= 422 && status <= 429)) return 'validation';
    if (status === 429) return 'rate_limit';
    if (status === 408 || status === 504) return 'timeout';
    if (status >= 500) return 'server';
  }

  // Supabase specific errors
  if (error.code) {
    const code = error.code;

    if (code.startsWith('PGRST')) return 'database';
    if (code === '42501' || code === '42P01') return 'authorization';
    if (code === '23505' || code === '23503') return 'validation';
  }

  return 'unknown';
};

/**
 * Determine error severity
 */
export const getErrorSeverity = (error: any, category: ErrorCategory): ErrorSeverity => {
  if (category === 'authentication' || category === 'authorization') {
    return 'high';
  }

  if (category === 'server' || category === 'database') {
    return 'critical';
  }

  if (category === 'network' || category === 'timeout') {
    return 'medium';
  }

  if (category === 'rate_limit') {
    return 'medium';
  }

  if (category === 'validation') {
    return 'low';
  }

  return 'medium';
};

/**
 * Generate user-friendly error messages
 */
export const getUserFriendlyMessage = (
  error: any,
  category: ErrorCategory,
  operation?: string
): string => {
  const operationContext = operation ? ` while ${operation}` : '';

  switch (category) {
    case 'network':
      return `Unable to connect to the server${operationContext}. Please check your internet connection and try again.`;

    case 'authentication':
      return 'Your session has expired. Please sign in again to continue.';

    case 'authorization':
      return `You don't have permission to perform this action${operationContext}.`;

    case 'validation':
      return error.message || `The information provided is invalid${operationContext}. Please check your input and try again.`;

    case 'rate_limit':
      return 'Too many requests. Please wait a moment before trying again.';

    case 'timeout':
      return `The request timed out${operationContext}. Please try again.`;

    case 'server':
      return `A server error occurred${operationContext}. Our team has been notified and is working on a fix.`;

    case 'database':
      return `A database error occurred${operationContext}. Please try again or contact support if the problem persists.`;

    default:
      return error.message || `An unexpected error occurred${operationContext}. Please try again.`;
  }
};

/**
 * Generate recovery suggestions
 */
export const getRecoverySuggestions = (
  category: ErrorCategory,
  operation?: string
): string[] => {
  const suggestions: string[] = [];

  switch (category) {
    case 'network':
      suggestions.push(
        'Check your internet connection',
        'Try refreshing the page',
        'Disable any VPN or proxy temporarily'
      );
      break;

    case 'authentication':
      suggestions.push(
        'Sign in again',
        'Clear your browser cache',
        'Try using an incognito/private browser window'
      );
      break;

    case 'authorization':
      suggestions.push(
        'Contact your administrator for access',
        'Try signing out and signing in again',
        'Check if your account has the necessary permissions'
      );
      break;

    case 'validation':
      suggestions.push(
        'Review the form for any missing or incorrect information',
        'Ensure all required fields are filled',
        'Check that email addresses and phone numbers are in the correct format'
      );
      break;

    case 'rate_limit':
      suggestions.push(
        'Wait a few minutes before trying again',
        'Reduce the frequency of your requests'
      );
      break;

    case 'timeout':
    case 'server':
    case 'database':
      suggestions.push(
        'Try again in a few moments',
        'Refresh the page',
        'Contact support if the problem continues'
      );
      break;

    default:
      suggestions.push(
        'Try refreshing the page',
        'Contact support if the problem persists'
      );
  }

  return suggestions;
};

/**
 * Determine error recovery strategy
 */
export const getRecoveryStrategy = (
  category: ErrorCategory,
  error: any
): ErrorRecoveryStrategy => {
  const baseStrategy: ErrorRecoveryStrategy = {
    canRecover: true,
    strategy: 'retry',
    retryDelay: 1000,
    maxRetries: 3,
  };

  switch (category) {
    case 'network':
    case 'timeout':
      return {
        ...baseStrategy,
        retryDelay: 2000,
        maxRetries: 2,
      };

    case 'authentication':
      return {
        canRecover: true,
        strategy: 'redirect',
        redirectUrl: '/login',
      };

    case 'authorization':
      return {
        canRecover: false,
        strategy: 'manual',
        actionRequired: 'Contact administrator for access permissions',
      };

    case 'validation':
      return {
        canRecover: true,
        strategy: 'manual',
        actionRequired: 'Correct the validation errors and try again',
      };

    case 'rate_limit':
      const retryAfter = error.retryAfter || 60; // Default 60 seconds
      return {
        canRecover: true,
        strategy: 'retry',
        retryDelay: retryAfter * 1000,
        maxRetries: 1,
      };

    case 'server':
    case 'database':
      return {
        ...baseStrategy,
        retryDelay: 5000,
        maxRetries: 1,
      };

    default:
      return baseStrategy;
  }
};

/**
 * Enhanced error processor that combines all utilities
 */
export const processError = (
  error: FetchBaseQueryError | SerializedError | SupabaseError | any,
  context?: {
    operation?: string;
    endpoint?: string;
    userId?: string;
    sessionId?: string;
  }
): EnhancedError => {
  const category = classifyError(error);
  const severity = getErrorSeverity(error, category);
  const userMessage = getUserFriendlyMessage(error, category, context?.operation);
  const suggestions = getRecoverySuggestions(category, context?.operation);

  const enhancedError: EnhancedError = {
    message: error?.message || 'An unknown error occurred',
    userMessage,
    category,
    severity,
    code: error?.code || error?.status?.toString(),
    details: error?.details || error?.data,
    canRetry: getRecoveryStrategy(category, error).canRecover,
    suggestions,
    originalError: error,
    timestamp: new Date().toISOString(),
    context,
  };

  // Add retry information if applicable
  const recoveryStrategy = getRecoveryStrategy(category, error);
  if (recoveryStrategy.retryDelay) {
    enhancedError.retryAfter = recoveryStrategy.retryDelay;
  }

  return enhancedError;
};

/**
 * Error logging and reporting utilities
 */
export const reportError = async (
  error: EnhancedError,
  options: {
    reportToAnalytics?: boolean;
    reportToConsole?: boolean;
    reportToSentry?: boolean;
  } = {}
): Promise<void> => {
  const {
    reportToAnalytics = true,
    reportToConsole = true,
    reportToSentry = error.severity === 'high' || error.severity === 'critical',
  } = options;

  if (reportToConsole) {
    const logLevel = error.severity === 'critical' ? 'error'
                   : error.severity === 'high' ? 'error'
                   : error.severity === 'medium' ? 'warn'
                   : 'info';

    console[logLevel]('Enhanced Error Report:', {
      message: error.message,
      userMessage: error.userMessage,
      category: error.category,
      severity: error.severity,
      code: error.code,
      context: error.context,
      timestamp: error.timestamp,
      originalError: error.originalError,
    });
  }

  if (reportToAnalytics) {
    try {
      // Track error analytics event
      // This would integrate with your analytics tracking
      const errorEvent = {
        eventName: 'error_occurred',
        eventData: {
          errorCategory: error.category,
          errorSeverity: error.severity,
          errorCode: error.code,
          operation: error.context?.operation,
          endpoint: error.context?.endpoint,
          canRetry: error.canRetry,
          timestamp: error.timestamp,
        },
        userId: error.context?.userId,
        sessionId: error.context?.sessionId,
      };

      // You would call your analytics tracking here
      // await trackEvent(errorEvent);
    } catch (analyticsError) {
      console.warn('Failed to track error analytics:', analyticsError);
    }
  }

  if (reportToSentry) {
    try {
      // Report to Sentry or similar error tracking service
      // This is a placeholder - you would integrate with your error tracking service
      console.error('Critical error reported to error tracking:', error);
    } catch (sentryError) {
      console.warn('Failed to report error to tracking service:', sentryError);
    }
  }
};

/**
 * Create standardized error boundaries and handlers
 */
export const createErrorHandler = (
  operation: string,
  endpoint?: string
) => {
  return (error: any, context?: { userId?: string; sessionId?: string }) => {
    const enhancedError = processError(error, {
      operation,
      endpoint,
      ...context,
    });

    reportError(enhancedError);

    return enhancedError;
  };
};

/**
 * RTK Query error transformation middleware
 */
export const transformRTKQueryError = (error: FetchBaseQueryError | SerializedError) => {
  return processError(error);
};

/**
 * Hook for handling errors in React components
 */
export const useErrorHandler = (operation?: string) => {
  const handleError = useCallback((error: any, showToast: boolean = true) => {
    const enhancedError = processError(error, { operation });

    if (showToast) {
      // This would integrate with your toast/notification system
      console.error('Error toast:', enhancedError.userMessage);
      // toast.error(enhancedError.userMessage);
    }

    reportError(enhancedError);

    return enhancedError;
  }, [operation]);

  return handleError;
};