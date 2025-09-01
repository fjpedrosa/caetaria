/**
 * Onboarding Repository Port
 * Application layer - Interface for onboarding data persistence
 */

import { Email } from '../../../marketing/domain/value-objects/email';
import { Result } from '../../../shared/domain/value-objects/result';
import { OnboardingSession, OnboardingSessionId } from '../../domain/entities/onboarding-session';

export interface OnboardingRepository {
  /**
   * Save onboarding session
   */
  save(session: OnboardingSession): Promise<Result<OnboardingSession, Error>>;

  /**
   * Find onboarding session by ID
   */
  findById(id: OnboardingSessionId): Promise<Result<OnboardingSession | null, Error>>;

  /**
   * Find onboarding session by user email
   */
  findByUserEmail(email: Email): Promise<Result<OnboardingSession | null, Error>>;

  /**
   * Find onboarding session by recovery token
   */
  findByRecoveryToken(token: string): Promise<Result<OnboardingSession | null, Error>>;

  /**
   * Update onboarding session
   */
  update(session: OnboardingSession): Promise<Result<OnboardingSession, Error>>;

  /**
   * Delete onboarding session
   */
  delete(id: OnboardingSessionId): Promise<Result<boolean, Error>>;

  /**
   * Find sessions by status
   */
  findByStatus(status: 'in-progress' | 'paused' | 'completed' | 'abandoned'): Promise<Result<OnboardingSession[], Error>>;

  /**
   * Find abandoned sessions older than specified minutes
   */
  findAbandonedSessions(olderThanMinutes: number): Promise<Result<OnboardingSession[], Error>>;

  /**
   * Find expired sessions that need cleanup
   */
  findExpiredSessions(): Promise<Result<OnboardingSession[], Error>>;

  /**
   * Find sessions for analytics within date range
   */
  findSessionsInDateRange(startDate: Date, endDate: Date): Promise<Result<OnboardingSession[], Error>>;

  /**
   * Get session analytics summary
   */
  getAnalyticsSummary(filters?: {
    startDate?: Date;
    endDate?: Date;
    status?: OnboardingSession['status'][];
    conversionSource?: string;
  }): Promise<Result<{
    totalSessions: number;
    completedSessions: number;
    abandonedSessions: number;
    averageCompletionTime: number;
    conversionRate: number;
    stepDropoffRates: Record<string, number>;
    commonAbandonmentReasons: Record<string, number>;
    conversionSourceBreakdown: Record<string, number>;
  }, Error>>;

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): Promise<Result<number, Error>>;

  /**
   * Get active session count for monitoring
   */
  getActiveSessionCount(): Promise<Result<number, Error>>;
}
