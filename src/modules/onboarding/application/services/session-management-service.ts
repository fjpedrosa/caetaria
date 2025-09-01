/**
 * Session Management Service
 * Application layer - Orchestrates onboarding session management operations
 */

import { Email } from '../../../marketing/domain/value-objects/email';
import { failure, isSuccess, Result, success } from '../../../shared/domain/value-objects/result';
import {
  abandonOnboarding,
  advanceOnboardingStep,
  extendSessionExpiry,
  generateAnalyticsSummary,
  isSessionExpired,
  OnboardingSession,
  OnboardingSessionId,
  pauseOnboarding,
  recordAbTestVariant,
  resumeOnboarding,
  SessionAnalytics,
  updateDeviceInfo} from '../../domain/entities/onboarding-session';
import { OnboardingRepository } from '../ports/onboarding-repository';

export interface SessionRecoveryResult {
  readonly session: OnboardingSession;
  readonly wasExpired: boolean;
  readonly wasExtended: boolean;
}

export interface AbandonmentTrackingResult {
  readonly totalAbandoned: number;
  readonly sessionsMarkedAbandoned: OnboardingSession[];
  readonly errors: Error[];
}

export interface SessionCleanupResult {
  readonly expiredSessionsDeleted: number;
  readonly abandonedSessionsMarked: number;
  readonly errors: Error[];
}

export interface SessionSyncResult {
  readonly synchronized: boolean;
  readonly conflicts: string[];
  readonly resolved: boolean;
}

/**
 * Session Management Service
 * Provides high-level session management operations
 */
export class SessionManagementService {
  constructor(
    private readonly onboardingRepository: OnboardingRepository
  ) {}

  /**
   * Recover session using recovery token with automatic expiry extension
   */
  async recoverSession(recoveryToken: string): Promise<Result<SessionRecoveryResult, Error>> {
    try {
      const sessionResult = await this.onboardingRepository.findByRecoveryToken(recoveryToken);

      if (!isSuccess(sessionResult)) {
        return failure(new Error('Failed to find session with recovery token'));
      }

      if (!sessionResult.data) {
        return failure(new Error('No session found with provided recovery token'));
      }

      const session = sessionResult.data;
      const wasExpired = isSessionExpired(session);
      let wasExtended = false;
      let recoveredSession = session;

      // Extend expiry if session was expired or close to expiring
      if (wasExpired || this.isCloseToExpiry(session)) {
        recoveredSession = extendSessionExpiry(session, 24); // Extend by 24 hours
        wasExtended = true;

        // Resume session if it was paused due to expiry
        if (session.status === 'paused') {
          recoveredSession = resumeOnboarding(recoveredSession);
        }

        const updateResult = await this.onboardingRepository.update(recoveredSession);
        if (!isSuccess(updateResult)) {
          return failure(new Error('Failed to extend session expiry'));
        }

        recoveredSession = updateResult.data;
      }

      return success({
        session: recoveredSession,
        wasExpired,
        wasExtended,
      });
    } catch (error) {
      return failure(new Error(
        error instanceof Error ? error.message : 'Unknown error recovering session'
      ));
    }
  }

  /**
   * Track and mark abandoned sessions
   */
  async trackAbandonedSessions(abandonmentThresholdMinutes: number = 30): Promise<Result<AbandonmentTrackingResult, Error>> {
    try {
      const abandonedSessionsResult = await this.onboardingRepository.findAbandonedSessions(abandonmentThresholdMinutes);

      if (!isSuccess(abandonedSessionsResult)) {
        return failure(new Error('Failed to find abandoned sessions'));
      }

      const abandonedSessions = abandonedSessionsResult.data;
      const sessionsMarkedAbandoned: OnboardingSession[] = [];
      const errors: Error[] = [];

      // Mark sessions as abandoned with reason
      for (const session of abandonedSessions) {
        try {
          const abandonedSession = abandonOnboarding(session, 'inactive_timeout');

          const updateResult = await this.onboardingRepository.update(abandonedSession);
          if (isSuccess(updateResult)) {
            sessionsMarkedAbandoned.push(updateResult.data);
          } else {
            errors.push(new Error(`Failed to mark session ${session.id} as abandoned`));
          }
        } catch (error) {
          errors.push(new Error(`Error processing session ${session.id}: ${error}`));
        }
      }

      return success({
        totalAbandoned: abandonedSessions.length,
        sessionsMarkedAbandoned,
        errors,
      });
    } catch (error) {
      return failure(new Error(
        error instanceof Error ? error.message : 'Unknown error tracking abandoned sessions'
      ));
    }
  }

  /**
   * Perform comprehensive session cleanup
   */
  async performSessionCleanup(): Promise<Result<SessionCleanupResult, Error>> {
    try {
      const errors: Error[] = [];

      // 1. Clean up expired sessions
      const cleanupResult = await this.onboardingRepository.cleanupExpiredSessions();
      const expiredSessionsDeleted = isSuccess(cleanupResult) ? cleanupResult.data : 0;

      if (!isSuccess(cleanupResult)) {
        errors.push(new Error('Failed to cleanup expired sessions'));
      }

      // 2. Mark abandoned sessions
      const abandonmentResult = await this.trackAbandonedSessions(60); // 1 hour threshold
      const abandonedSessionsMarked = isSuccess(abandonmentResult)
        ? abandonmentResult.data.sessionsMarkedAbandoned.length
        : 0;

      if (!isSuccess(abandonmentResult)) {
        errors.push(new Error('Failed to track abandoned sessions'));
      } else {
        errors.push(...abandonmentResult.data.errors);
      }

      return success({
        expiredSessionsDeleted,
        abandonedSessionsMarked,
        errors,
      });
    } catch (error) {
      return failure(new Error(
        error instanceof Error ? error.message : 'Unknown error during session cleanup'
      ));
    }
  }

  /**
   * Synchronize session across devices
   */
  async synchronizeSession(
    sessionId: OnboardingSessionId,
    clientVersion: number,
    deviceInfo: SessionAnalytics['deviceInfo']
  ): Promise<Result<SessionSyncResult, Error>> {
    try {
      const sessionResult = await this.onboardingRepository.findById(sessionId);

      if (!isSuccess(sessionResult)) {
        return failure(new Error('Failed to find session for synchronization'));
      }

      if (!sessionResult.data) {
        return failure(new Error('Session not found'));
      }

      const session = sessionResult.data;
      const conflicts: string[] = [];
      let synchronized = true;

      // Simple version-based conflict detection
      // In a real implementation, you'd have more sophisticated conflict resolution
      const serverVersion = session.analytics.stepTimestamps[session.currentStep].length;

      if (clientVersion < serverVersion) {
        conflicts.push('Client is behind server state');
        synchronized = false;
      }

      // Update device info if provided
      let updatedSession = session;
      if (deviceInfo) {
        updatedSession = updateDeviceInfo(session, deviceInfo);
      }

      // Extend session if it's active
      if (session.status === 'in-progress' && this.isCloseToExpiry(session)) {
        updatedSession = extendSessionExpiry(updatedSession);
      }

      const updateResult = await this.onboardingRepository.update(updatedSession);
      if (!isSuccess(updateResult)) {
        return failure(new Error('Failed to update session during sync'));
      }

      return success({
        synchronized,
        conflicts,
        resolved: conflicts.length === 0,
      });
    } catch (error) {
      return failure(new Error(
        error instanceof Error ? error.message : 'Unknown error synchronizing session'
      ));
    }
  }

  /**
   * Get comprehensive session analytics
   */
  async getSessionAnalytics(
    filters?: {
      startDate?: Date;
      endDate?: Date;
      conversionSource?: string;
    }
  ): Promise<Result<any, Error>> {
    try {
      const analyticsResult = await this.onboardingRepository.getAnalyticsSummary({
        ...filters,
        status: ['completed', 'abandoned', 'in-progress'],
      });

      if (!isSuccess(analyticsResult)) {
        return failure(new Error('Failed to get session analytics'));
      }

      // Add additional metrics
      const activeSessionsResult = await this.onboardingRepository.getActiveSessionCount();
      const activeSessions = isSuccess(activeSessionsResult) ? activeSessionsResult.data : 0;

      const analytics = {
        ...analyticsResult.data,
        activeSessions,
        timestamp: new Date(),
      };

      return success(analytics);
    } catch (error) {
      return failure(new Error(
        error instanceof Error ? error.message : 'Unknown error getting session analytics'
      ));
    }
  }

  /**
   * Update session with A/B test variant
   */
  async updateAbTestVariant(
    sessionId: OnboardingSessionId,
    testName: string,
    variant: string
  ): Promise<Result<OnboardingSession, Error>> {
    try {
      const sessionResult = await this.onboardingRepository.findById(sessionId);

      if (!isSuccess(sessionResult)) {
        return failure(new Error('Failed to find session'));
      }

      if (!sessionResult.data) {
        return failure(new Error('Session not found'));
      }

      const updatedSession = recordAbTestVariant(sessionResult.data, testName, variant);

      const saveResult = await this.onboardingRepository.update(updatedSession);
      if (!isSuccess(saveResult)) {
        return failure(new Error('Failed to update session with A/B test variant'));
      }

      return success(saveResult.data);
    } catch (error) {
      return failure(new Error(
        error instanceof Error ? error.message : 'Unknown error updating A/B test variant'
      ));
    }
  }

  /**
   * Get session summary for monitoring
   */
  async getSessionSummary(sessionId: OnboardingSessionId): Promise<Result<any, Error>> {
    try {
      const sessionResult = await this.onboardingRepository.findById(sessionId);

      if (!isSuccess(sessionResult)) {
        return failure(new Error('Failed to find session'));
      }

      if (!sessionResult.data) {
        return failure(new Error('Session not found'));
      }

      const summary = generateAnalyticsSummary(sessionResult.data);
      return success(summary);
    } catch (error) {
      return failure(new Error(
        error instanceof Error ? error.message : 'Unknown error getting session summary'
      ));
    }
  }

  /**
   * Pause session with reason
   */
  async pauseSession(
    sessionId: OnboardingSessionId,
    reason?: string
  ): Promise<Result<OnboardingSession, Error>> {
    try {
      const sessionResult = await this.onboardingRepository.findById(sessionId);

      if (!isSuccess(sessionResult)) {
        return failure(new Error('Failed to find session'));
      }

      if (!sessionResult.data) {
        return failure(new Error('Session not found'));
      }

      let pausedSession = pauseOnboarding(sessionResult.data);

      // Add pause reason to metadata
      if (reason) {
        pausedSession = {
          ...pausedSession,
          metadata: {
            ...pausedSession.metadata,
            pauseReason: reason,
            pausedAt: new Date().toISOString(),
          },
        };
      }

      const saveResult = await this.onboardingRepository.update(pausedSession);
      if (!isSuccess(saveResult)) {
        return failure(new Error('Failed to pause session'));
      }

      return success(saveResult.data);
    } catch (error) {
      return failure(new Error(
        error instanceof Error ? error.message : 'Unknown error pausing session'
      ));
    }
  }

  /**
   * Resume paused session
   */
  async resumeSession(sessionId: OnboardingSessionId): Promise<Result<OnboardingSession, Error>> {
    try {
      const sessionResult = await this.onboardingRepository.findById(sessionId);

      if (!isSuccess(sessionResult)) {
        return failure(new Error('Failed to find session'));
      }

      if (!sessionResult.data) {
        return failure(new Error('Session not found'));
      }

      if (sessionResult.data.status !== 'paused') {
        return failure(new Error('Session is not paused'));
      }

      let resumedSession = resumeOnboarding(sessionResult.data);

      // Extend expiry when resuming
      resumedSession = extendSessionExpiry(resumedSession);

      // Add resume info to metadata
      resumedSession = {
        ...resumedSession,
        metadata: {
          ...resumedSession.metadata,
          resumedAt: new Date().toISOString(),
        },
      };

      const saveResult = await this.onboardingRepository.update(resumedSession);
      if (!isSuccess(saveResult)) {
        return failure(new Error('Failed to resume session'));
      }

      return success(saveResult.data);
    } catch (error) {
      return failure(new Error(
        error instanceof Error ? error.message : 'Unknown error resuming session'
      ));
    }
  }

  // Private helper methods
  private isCloseToExpiry(session: OnboardingSession): boolean {
    const now = new Date();
    const timeToExpiry = session.expiresAt.getTime() - now.getTime();
    const oneHourInMs = 60 * 60 * 1000;

    return timeToExpiry < oneHourInMs;
  }
}