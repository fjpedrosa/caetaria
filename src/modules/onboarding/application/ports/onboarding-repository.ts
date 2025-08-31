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
}
