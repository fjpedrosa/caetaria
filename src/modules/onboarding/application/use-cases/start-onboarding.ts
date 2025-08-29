/**
 * Start Onboarding Use Case
 * Application layer - Business logic for starting the onboarding process
 */

import { createEmail,Email } from '../../../marketing/domain/value-objects/email';
import { failure, isSuccess,Result, success } from '../../../shared/domain/value-objects/result';
import { createOnboardingSession,OnboardingSession } from '../../domain/entities/onboarding-session';
import { OnboardingRepository } from '../ports/onboarding-repository';

export interface StartOnboardingCommand {
  readonly userEmail: string;
}

export class StartOnboardingUseCase {
  constructor(
    private readonly onboardingRepository: OnboardingRepository
  ) {}

  async execute(command: StartOnboardingCommand): Promise<Result<OnboardingSession, Error>> {
    try {
      // Parse and validate email
      let email: Email;
      try {
        email = createEmail(command.userEmail);
      } catch (error) {
        return failure(new Error(`Invalid email: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }

      // Check if user already has an ongoing onboarding session
      const existingSessionResult = await this.onboardingRepository.findByUserEmail(email);
      if (!isSuccess(existingSessionResult)) {
        return failure(new Error('Failed to check existing sessions'));
      }

      const existingSession = existingSessionResult.data;
      if (existingSession && existingSession.status === 'in-progress') {
        // Return existing session
        return success(existingSession);
      }

      // Create new onboarding session
      const newSession = createOnboardingSession(email);

      // Save the session
      const saveResult = await this.onboardingRepository.save(newSession);
      if (!isSuccess(saveResult)) {
        return failure(new Error('Failed to save onboarding session'));
      }

      return success(saveResult.data);
    } catch (error) {
      return failure(new Error(
        error instanceof Error ? error.message : 'Unknown error starting onboarding'
      ));
    }
  }
}
