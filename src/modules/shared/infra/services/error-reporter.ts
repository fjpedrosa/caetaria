/**
 * Infrastructure layer for error reporting
 * Handles actual API calls and external dependencies
 */

import { sanitizeErrorReport,validateErrorReport } from '../../domain/services/error-reporting.service'
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
 * Error reporting service with retry logic and error handling
 */
export class ErrorReporter {
  private config: ErrorReportingConfig
  private reportedErrors: Set<string> = new Set()
  private retryQueue: Array<{ report: ErrorReport; retries: number }> = []

  constructor(config: Partial<ErrorReportingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Reports an error to the analytics endpoint
   */
  async reportError(report: ErrorReport): Promise<boolean> {
    if (!this.config.enabled) {
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
    if (this.reportedErrors.has(fingerprint)) {
      console.debug('Error already reported, skipping:', report.errorId)
      return false
    }

    // Sanitize sensitive data
    const sanitizedReport = sanitizeErrorReport(report)

    try {
      const success = await this.sendReport(sanitizedReport)
      if (success) {
        this.reportedErrors.add(fingerprint)
        console.debug('Error reported successfully:', report.errorId)
        return true
      } else {
        this.queueForRetry(report)
        return false
      }
    } catch (error) {
      console.error('Failed to report error:', error)
      this.queueForRetry(report)
      return false
    }
  }

  /**
   * Sends the error report to the API endpoint
   */
  private async sendReport(report: ErrorReport): Promise<boolean> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      const response = await fetch(this.config.apiEndpoint, {
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
   * Queues an error report for retry
   */
  private queueForRetry(report: ErrorReport): void {
    if (this.retryQueue.length >= 10) {
      // Remove oldest item if queue is full
      this.retryQueue.shift()
    }

    this.retryQueue.push({ report, retries: 0 })
    this.scheduleRetry()
  }

  /**
   * Schedules retry attempts for failed reports
   */
  private scheduleRetry(): void {
    if (this.retryQueue.length === 0) return

    const { report, retries } = this.retryQueue[0]

    if (retries >= this.config.maxRetries) {
      this.retryQueue.shift()
      console.error('Max retries reached for error report:', report.errorId)
      this.scheduleRetry() // Process next item
      return
    }

    const delay = this.config.retryDelay * Math.pow(2, retries) // Exponential backoff

    setTimeout(async () => {
      const success = await this.sendReport(report).catch(() => false)

      if (success) {
        this.retryQueue.shift()
        this.reportedErrors.add(`${report.message}_${report.stack?.split('\n')[0] || ''}`)
        console.debug('Error report retry successful:', report.errorId)
      } else {
        this.retryQueue[0].retries++
      }

      this.scheduleRetry() // Process next item or retry current
    }, delay)
  }

  /**
   * Clears the reported errors cache
   */
  clearReportedCache(): void {
    this.reportedErrors.clear()
  }

  /**
   * Gets the current retry queue size
   */
  getRetryQueueSize(): number {
    return this.retryQueue.length
  }

  /**
   * Updates the configuration
   */
  updateConfig(config: Partial<ErrorReportingConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

/**
 * Default error reporter instance
 */
export const defaultErrorReporter = new ErrorReporter()

/**
 * Convenience function for reporting errors
 */
export const reportError = (report: ErrorReport): Promise<boolean> => {
  return defaultErrorReporter.reportError(report)
}