/**
 * Infrastructure layer for error reporting
 * Handles actual API calls and external dependencies
 */

import { sanitizeErrorReport, validateErrorReport } from '../../domain/services/error-reporting.service'
import type { ErrorReport, ErrorReportingConfig } from '../../domain/types/error.types'

/**
 * Default error reporting configuration
 */
const DEFAULT_CONFIG: ErrorReportingConfig = {
  apiEndpoint: '/api/analytics/errors',
  enabled: process.env.NODE_ENV === 'production',
  maxRetries: 3,
  retryDelay: 1000
}

/**
 * Creates an error reporter service using functional patterns
 *
 * Uses closures to maintain private state and returns an object
 * with methods for error reporting with retry logic and error handling.
 */
const createErrorReporter = (initialConfig: Partial<ErrorReportingConfig> = {}) => {
  // Private state maintained via closures
  let config: ErrorReportingConfig = { ...DEFAULT_CONFIG, ...initialConfig }
  const reportedErrors = new Set<string>()
  const retryQueue: Array<{ report: ErrorReport; retries: number }> = []

  /**
   * Sends the error report to the API endpoint
   */
  const sendReport = async (report: ErrorReport): Promise<boolean> => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      const response = await fetch(config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(report),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return true
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Error reporting timeout:', report.errorId)
      } else {
        console.error('Network error during error reporting:', error)
      }

      throw error
    }
  }

  /**
   * Schedules retry attempts for failed reports
   */
  const scheduleRetry = (): void => {
    if (retryQueue.length === 0) return

    const { report, retries } = retryQueue[0]

    if (retries >= config.maxRetries) {
      retryQueue.shift()
      console.error('Max retries reached for error report:', report.errorId)
      scheduleRetry() // Process next item
      return
    }

    const delay = config.retryDelay * Math.pow(2, retries) // Exponential backoff

    setTimeout(async () => {
      const success = await sendReport(report).catch(() => false)

      if (success) {
        retryQueue.shift()
        reportedErrors.add(`${report.message}_${report.stack?.split('\n')[0] || ''}`)
        console.debug('Error report retry successful:', report.errorId)
      } else {
        retryQueue[0].retries++
      }

      scheduleRetry() // Process next item or retry current
    }, delay)
  }

  /**
   * Queues an error report for retry
   */
  const queueForRetry = (report: ErrorReport): void => {
    if (retryQueue.length >= 10) {
      // Remove oldest item if queue is full
      retryQueue.shift()
    }

    retryQueue.push({ report, retries: 0 })
    scheduleRetry()
  }

  // Public interface
  return {
    /**
     * Reports an error to the analytics endpoint
     */
    async reportError(report: ErrorReport): Promise<boolean> {
      if (!config.enabled) {
        console.debug('Error reporting disabled, skipping report:', report.errorId)
        return false
      }

      // Validate report
      if (!validateErrorReport(report)) {
        console.error('Invalid error report:', report)
        return false
      }

      // Check if already reported to prevent duplicates
      const fingerprint = `${report.message}_${report.stack?.split('\n')[0] || ''}`
      if (reportedErrors.has(fingerprint)) {
        console.debug('Error already reported, skipping:', report.errorId)
        return false
      }

      // Sanitize sensitive data
      const sanitizedReport = sanitizeErrorReport(report)

      try {
        const success = await sendReport(sanitizedReport)
        if (success) {
          reportedErrors.add(fingerprint)
          console.debug('Error reported successfully:', report.errorId)
          return true
        } else {
          queueForRetry(report)
          return false
        }
      } catch (error) {
        console.error('Failed to report error:', error)
        queueForRetry(report)
        return false
      }
    },

    /**
     * Clears the reported errors cache
     */
    clearReportedCache(): void {
      reportedErrors.clear()
    },

    /**
     * Gets the current retry queue size
     */
    getRetryQueueSize(): number {
      return retryQueue.length
    },

    /**
     * Updates the configuration
     */
    updateConfig(newConfig: Partial<ErrorReportingConfig>): void {
      config = { ...config, ...newConfig }
    }
  }
}

/**
 * Default error reporter instance
 */
export const defaultErrorReporter = createErrorReporter()

/**
 * Convenience function for reporting errors
 */
export const reportError = (report: ErrorReport): Promise<boolean> => {
  return defaultErrorReporter.reportError(report)
}