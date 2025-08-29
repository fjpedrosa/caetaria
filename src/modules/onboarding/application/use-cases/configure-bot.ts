/**
 * Configure Bot Use Case
 * Application layer - Business logic for bot configuration
 */

import { failure, isSuccess,Result, success } from '../../../shared/domain/value-objects/result';
import { advanceOnboardingStep, OnboardingSession, OnboardingSessionId, updateOnboardingStepData } from '../../domain/entities/onboarding-session';
import { BotConfiguration, BusinessHours,createBotConfiguration } from '../../domain/value-objects/whatsapp-config';
import { OnboardingRepository } from '../ports/onboarding-repository';

export interface ConfigureBotCommand {
  readonly sessionId: string;
  readonly name: string;
  readonly welcomeMessage?: string;
  readonly languageCode?: string;
  readonly businessHours?: Partial<BusinessHours>;
}

export class ConfigureBotUseCase {
  constructor(
    private readonly onboardingRepository: OnboardingRepository
  ) {}

  async execute(command: ConfigureBotCommand): Promise<Result<OnboardingSession, Error>> {
    try {
      // Find the onboarding session
      const sessionResult = await this.onboardingRepository.findById(
        command.sessionId as OnboardingSessionId
      );
      
      if (!isSuccess(sessionResult) || !sessionResult.data) {
        return failure(new Error('Onboarding session not found'));
      }

      const session = sessionResult.data;

      // Validate that we're on the correct step
      if (session.currentStep !== 'bot-setup' && !session.completedSteps.includes('bot-setup')) {
        return failure(new Error('Invalid step for bot configuration'));
      }

      // Check if phone verification is complete
      if (!session.stepData.phoneVerification?.isVerified) {
        return failure(new Error('Phone verification required before bot configuration'));
      }

      // Create and validate bot configuration
      let botConfig: BotConfiguration;
      try {
        botConfig = createBotConfiguration({
          name: command.name,
          welcomeMessage: command.welcomeMessage,
          languageCode: command.languageCode,
          businessHours: command.businessHours,
        });
      } catch (error) {
        return failure(new Error(
          error instanceof Error ? error.message : 'Invalid bot configuration'
        ));
      }

      // Update session with bot configuration
      const updatedSession = updateOnboardingStepData(session, {
        botConfig,
      });

      // Advance to next step if we're currently on bot-setup step
      const finalSession = session.currentStep === 'bot-setup'
        ? advanceOnboardingStep(updatedSession, 'testing')
        : updatedSession;

      // Save the updated session
      const saveResult = await this.onboardingRepository.update(finalSession);
      if (!isSuccess(saveResult)) {
        return failure(new Error('Failed to save bot configuration'));
      }

      return success(saveResult.data);
    } catch (error) {
      return failure(new Error(
        error instanceof Error ? error.message : 'Unknown error configuring bot'
      ));
    }
  }
}
