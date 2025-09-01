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
  readonly conversionSource?: string;
  readonly deviceInfo?: {
    readonly userAgent: string;
    readonly ip: string;
    readonly country?: string;
    readonly city?: string;
  };
  readonly abTestVariants?: Record<string, string>;
}

export interface StartOnboardingDependencies {
  readonly onboardingRepository: OnboardingRepository;
}

/**
 * Factory function to create startOnboarding use case
 * @param deps Dependencies required for the use case
 * @returns Object with execute function
 */
export const createStartOnboardingUseCase = (deps: StartOnboardingDependencies) => {
  const { onboardingRepository } = deps;

  return {
    execute: async (command: StartOnboardingCommand): Promise<Result<OnboardingSession, Error>> => {
      try {
        // Parse and validate email
        let email: Email;
        try {
          email = createEmail(command.userEmail);
        } catch (error) {
          return failure(new Error(`Invalid email: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }

        // Check if user already has an ongoing onboarding session
        const existingSessionResult = await onboardingRepository.findByUserEmail(email);
        if (!isSuccess(existingSessionResult)) {
          return failure(new Error('Failed to check existing sessions'));
        }

        const existingSession = existingSessionResult.data;
        if (existingSession && existingSession.status === 'in-progress') {
          // Return existing session
          return success(existingSession);
        }

        // Create new onboarding session with enhanced tracking
        const newSession = createOnboardingSession(
          email,
          command.deviceInfo,
          command.conversionSource
        );

        // Apply A/B test variants if provided
        let sessionWithVariants = newSession;
        if (command.abTestVariants) {
          sessionWithVariants = {
            ...newSession,
            analytics: {
              ...newSession.analytics,
              abTestVariants: command.abTestVariants,
            },
          };
        }

        // Save the session
        const saveResult = await onboardingRepository.save(sessionWithVariants);
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
  };
};

// =============================================================================
// LEGACY COMPATIBILITY - For gradual migration
// =============================================================================

/**
 * @deprecated Use createStartOnboardingUseCase factory function instead
 * Legacy class wrapper for backward compatibility during migration
 */
export class StartOnboardingUseCase {
  constructor(
    private readonly onboardingRepository: OnboardingRepository
  ) {}

  async execute(command: StartOnboardingCommand): Promise<Result<OnboardingSession, Error>> {
    const useCase = createStartOnboardingUseCase({ onboardingRepository: this.onboardingRepository });
    return useCase.execute(command);
  }
}
