/**
 * Session Monitoring Service
 * Infrastructure layer - Background monitoring and cleanup operations
 */

import { isSuccess } from '../../../shared/domain/value-objects/result';
import { OnboardingRepository } from '../../application/ports/onboarding-repository';
import { SessionManagementService } from '../../application/services/session-management-service';

export interface MonitoringConfig {
  readonly abandonmentThresholdMinutes: number;
  readonly cleanupIntervalMinutes: number;
  readonly maxRetries: number;
  readonly enableNotifications: boolean;
}

export interface MonitoringReport {
  readonly timestamp: Date;
  readonly activeSessions: number;
  readonly expiredSessionsDeleted: number;
  readonly abandonedSessionsMarked: number;
  readonly errors: string[];
  readonly nextRunAt: Date;
}

export interface SessionAlert {
  readonly type: 'high_abandonment' | 'system_error' | 'cleanup_required';
  readonly message: string;
  readonly data: Record<string, unknown>;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Service for monitoring onboarding sessions and performing background maintenance
 */
export class SessionMonitoringService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(
    private readonly onboardingRepository: OnboardingRepository,
    private readonly sessionManagementService: SessionManagementService,
    private readonly config: MonitoringConfig = {
      abandonmentThresholdMinutes: 30,
      cleanupIntervalMinutes: 60, // Run every hour
      maxRetries: 3,
      enableNotifications: true,
    }
  ) {}

  /**
   * Start background monitoring
   */
  start(): void {
    if (this.isRunning) {
      console.warn('Session monitoring is already running');
      return;
    }

    console.log('Starting session monitoring service...');
    this.isRunning = true;

    // Run immediately on start
    this.runMonitoringCycle();

    // Schedule recurring runs
    this.intervalId = setInterval(() => {
      this.runMonitoringCycle();
    }, this.config.cleanupIntervalMinutes * 60 * 1000);
  }

  /**
   * Stop background monitoring
   */
  stop(): void {
    if (!this.isRunning) {
      console.warn('Session monitoring is not running');
      return;
    }

    console.log('Stopping session monitoring service...');

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
  }

  /**
   * Get current monitoring status
   */
  getStatus(): {
    isRunning: boolean;
    config: MonitoringConfig;
    nextRunAt?: Date;
  } {
    const nextRunAt = this.intervalId
      ? new Date(Date.now() + this.config.cleanupIntervalMinutes * 60 * 1000)
      : undefined;

    return {
      isRunning: this.isRunning,
      config: this.config,
      nextRunAt,
    };
  }

  /**
   * Perform manual monitoring cycle
   */
  async performManualMonitoring(): Promise<MonitoringReport> {
    return this.runMonitoringCycle();
  }

  /**
   * Get session health metrics
   */
  async getHealthMetrics(): Promise<{
    activeSessions: number;
    recentCompletions: number;
    recentAbandonments: number;
    averageCompletionTime: number;
    alerts: SessionAlert[];
  }> {
    try {
      const errors: string[] = [];

      // Get active session count
      const activeSessionsResult = await this.onboardingRepository.getActiveSessionCount();
      const activeSessions = isSuccess(activeSessionsResult) ? activeSessionsResult.data : 0;

      if (!isSuccess(activeSessionsResult)) {
        errors.push('Failed to get active session count');
      }

      // Get recent analytics (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const now = new Date();

      const analyticsResult = await this.onboardingRepository.getAnalyticsSummary({
        startDate: yesterday,
        endDate: now,
      });

      let recentCompletions = 0;
      let recentAbandonments = 0;
      let averageCompletionTime = 0;

      if (isSuccess(analyticsResult)) {
        const analytics = analyticsResult.data;
        recentCompletions = analytics.completedSessions;
        recentAbandonments = analytics.abandonedSessions;
        averageCompletionTime = analytics.averageCompletionTime;
      } else {
        errors.push('Failed to get analytics summary');
      }

      // Generate alerts based on metrics
      const alerts = this.generateAlerts({
        activeSessions,
        recentCompletions,
        recentAbandonments,
        averageCompletionTime,
        errors,
      });

      return {
        activeSessions,
        recentCompletions,
        recentAbandonments,
        averageCompletionTime,
        alerts,
      };

    } catch (error) {
      console.error('Error getting health metrics:', error);
      return {
        activeSessions: 0,
        recentCompletions: 0,
        recentAbandonments: 0,
        averageCompletionTime: 0,
        alerts: [{
          type: 'system_error',
          message: 'Failed to retrieve health metrics',
          data: { error: error instanceof Error ? error.message : 'Unknown error' },
          severity: 'critical',
        }],
      };
    }
  }

  /**
   * Run a complete monitoring cycle
   */
  private async runMonitoringCycle(): Promise<MonitoringReport> {
    const timestamp = new Date();
    const nextRunAt = new Date(timestamp.getTime() + this.config.cleanupIntervalMinutes * 60 * 1000);

    console.log(`Running session monitoring cycle at ${timestamp.toISOString()}`);

    try {
      const errors: string[] = [];

      // 1. Get active session count
      const activeSessionsResult = await this.onboardingRepository.getActiveSessionCount();
      const activeSessions = isSuccess(activeSessionsResult) ? activeSessionsResult.data : 0;

      if (!isSuccess(activeSessionsResult)) {
        errors.push('Failed to get active session count');
      }

      // 2. Perform session cleanup
      const cleanupResult = await this.sessionManagementService.performSessionCleanup();

      let expiredSessionsDeleted = 0;
      let abandonedSessionsMarked = 0;

      if (isSuccess(cleanupResult)) {
        expiredSessionsDeleted = cleanupResult.data.expiredSessionsDeleted;
        abandonedSessionsMarked = cleanupResult.data.abandonedSessionsMarked;

        // Add any errors from cleanup
        errors.push(...cleanupResult.data.errors.map(e => e.message));
      } else {
        errors.push(`Cleanup failed: ${cleanupResult.error.message}`);
      }

      // 3. Log monitoring results
      console.log('Monitoring cycle completed:', {
        activeSessions,
        expiredSessionsDeleted,
        abandonedSessionsMarked,
        errors: errors.length,
      });

      // 4. Send notifications if enabled and there are significant events
      if (this.config.enableNotifications) {
        await this.sendNotifications({
          timestamp,
          activeSessions,
          expiredSessionsDeleted,
          abandonedSessionsMarked,
          errors,
          nextRunAt,
        });
      }

      return {
        timestamp,
        activeSessions,
        expiredSessionsDeleted,
        abandonedSessionsMarked,
        errors,
        nextRunAt,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown monitoring error';
      console.error('Session monitoring cycle failed:', errorMessage);

      return {
        timestamp,
        activeSessions: 0,
        expiredSessionsDeleted: 0,
        abandonedSessionsMarked: 0,
        errors: [errorMessage],
        nextRunAt,
      };
    }
  }

  /**
   * Generate alerts based on session metrics
   */
  private generateAlerts(metrics: {
    activeSessions: number;
    recentCompletions: number;
    recentAbandonments: number;
    averageCompletionTime: number;
    errors: string[];
  }): SessionAlert[] {
    const alerts: SessionAlert[] = [];

    // High abandonment rate alert
    const totalRecent = metrics.recentCompletions + metrics.recentAbandonments;
    if (totalRecent > 0) {
      const abandonmentRate = (metrics.recentAbandonments / totalRecent) * 100;

      if (abandonmentRate > 70) {
        alerts.push({
          type: 'high_abandonment',
          message: `High abandonment rate detected: ${abandonmentRate.toFixed(1)}%`,
          data: {
            abandonmentRate,
            recentAbandonments: metrics.recentAbandonments,
            totalSessions: totalRecent,
          },
          severity: 'high',
        });
      } else if (abandonmentRate > 50) {
        alerts.push({
          type: 'high_abandonment',
          message: `Elevated abandonment rate: ${abandonmentRate.toFixed(1)}%`,
          data: {
            abandonmentRate,
            recentAbandonments: metrics.recentAbandonments,
            totalSessions: totalRecent,
          },
          severity: 'medium',
        });
      }
    }

    // System errors alert
    if (metrics.errors.length > 0) {
      alerts.push({
        type: 'system_error',
        message: `${metrics.errors.length} system error(s) detected`,
        data: {
          errors: metrics.errors,
          errorCount: metrics.errors.length,
        },
        severity: metrics.errors.length > 3 ? 'critical' : 'high',
      });
    }

    // Too many active sessions (potential memory/performance issue)
    if (metrics.activeSessions > 1000) {
      alerts.push({
        type: 'cleanup_required',
        message: `High number of active sessions: ${metrics.activeSessions}`,
        data: {
          activeSessions: metrics.activeSessions,
          threshold: 1000,
        },
        severity: metrics.activeSessions > 2000 ? 'high' : 'medium',
      });
    }

    return alerts;
  }

  /**
   * Send notifications for significant events
   */
  private async sendNotifications(report: MonitoringReport): Promise<void> {
    try {
      // Check if notifications should be sent
      const shouldNotify =
        report.errors.length > 0 ||
        report.expiredSessionsDeleted > 10 ||
        report.abandonedSessionsMarked > 20;

      if (!shouldNotify) {
        return;
      }

      // In a real implementation, you would send notifications via:
      // - Email to administrators
      // - Slack/Discord webhooks
      // - Push notifications
      // - Database logging for dashboard display

      console.log('Session monitoring notification:', {
        level: report.errors.length > 0 ? 'warning' : 'info',
        message: 'Session monitoring cycle completed',
        data: report,
      });


    } catch (error) {
      console.error('Failed to send monitoring notifications:', error);
    }
  }
}