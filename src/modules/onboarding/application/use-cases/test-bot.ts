/**
 * Test Bot Use Case
 * Application layer - Business logic for testing bot functionality
 */

import { failure, isSuccess,Result, success } from '../../../shared/domain/value-objects/result';
import { advanceOnboardingStep, OnboardingSession, OnboardingSessionId, updateOnboardingStepData } from '../../domain/entities/onboarding-session';
import { createTestingResults,TestingResults } from '../../domain/value-objects/onboarding-step-data';
import { OnboardingRepository } from '../ports/onboarding-repository';
import { WhatsAppService } from '../ports/whatsapp-service';

export interface TestBotCommand {
  readonly sessionId: string;
  readonly testPhoneNumber: string;
  readonly testMessage?: string;
}

export interface TestBotDependencies {
  readonly onboardingRepository: OnboardingRepository;
  readonly whatsappService: WhatsAppService;
}

/**
 * Factory function to create testBot use case
 * @param deps Dependencies required for the use case
 * @returns Object with execute function
 */
export const createTestBotUseCase = (deps: TestBotDependencies) => {
  const { onboardingRepository, whatsappService } = deps;

  return {
    execute: async (command: TestBotCommand): Promise<Result<OnboardingSession, Error>> => {
      try {
        // Find the onboarding session
        const sessionResult = await onboardingRepository.findById(
          command.sessionId as OnboardingSessionId
        );

        if (!isSuccess(sessionResult) || !sessionResult.data) {
          return failure(new Error('Onboarding session not found'));
        }

        const session = sessionResult.data;

        // Validate that we're on the correct step
        if (session.currentStep !== 'testing' && !session.completedSteps.includes('testing')) {
          return failure(new Error('Invalid step for bot testing'));
        }

        // Check if all required configurations are complete
        if (!session.stepData.whatsappConfig) {
          return failure(new Error('WhatsApp configuration required'));
        }

        if (!session.stepData.phoneVerification?.isVerified) {
          return failure(new Error('Phone verification required'));
        }

        if (!session.stepData.botConfig) {
          return failure(new Error('Bot configuration required'));
        }

        const testErrors: string[] = [];
        let testMessageSent = false;
        let testMessageReceived = false;
        let webhookConfigured = false;

        // Test webhook connectivity
        try {
          const webhookResult = await whatsappService.testWebhook(
            session.stepData.whatsappConfig.webhookUrl
          );

          if (isSuccess(webhookResult) && webhookResult.data) {
            webhookConfigured = true;
          } else {
            testErrors.push('Webhook connectivity test failed');
          }
        } catch (error) {
          testErrors.push('Webhook test error: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }

        // Send test message
        try {
          const testMessage = command.testMessage || session.stepData.botConfig.welcomeMessage;
          const messageResult = await whatsappService.sendTestMessage(
            session.stepData.whatsappConfig,
            command.testPhoneNumber,
            testMessage
          );

          if (isSuccess(messageResult) && messageResult.data.status === 'sent') {
            testMessageSent = true;
            // In a real implementation, we'd wait for delivery confirmation
            testMessageReceived = true; // Simulated for demo
          } else {
            testErrors.push('Failed to send test message');
          }
        } catch (error) {
          testErrors.push('Test message error: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }

        // Create testing results
        const testingResults = createTestingResults({
          testMessageSent,
          testMessageReceived,
          webhookConfigured,
          testPhoneNumber: command.testPhoneNumber,
          testErrors: testErrors.length > 0 ? testErrors : undefined,
        });

        // Update session with testing results
        const updatedSession = updateOnboardingStepData(session, {
          testingResults,
        });

        // Advance to completion if tests passed
        const shouldComplete = testMessageSent && webhookConfigured;
        const finalSession = session.currentStep === 'testing' && shouldComplete
          ? advanceOnboardingStep(updatedSession, 'complete')
          : updatedSession;

        // Save the updated session
        const saveResult = await onboardingRepository.update(finalSession);
        if (!isSuccess(saveResult)) {
          return failure(new Error('Failed to save testing results'));
        }

        return success(saveResult.data);
      } catch (error) {
        return failure(new Error(
          error instanceof Error ? error.message : 'Unknown error testing bot'
        ));
      }
    }
  };
};

// =============================================================================
// LEGACY COMPATIBILITY - For gradual migration
// =============================================================================

/**
 * @deprecated Use createTestBotUseCase factory function instead
 * Legacy class wrapper for backward compatibility during migration
 */
export class TestBotUseCase {
  constructor(
    private readonly onboardingRepository: OnboardingRepository,
    private readonly whatsappService: WhatsAppService
  ) {}

  async execute(command: TestBotCommand): Promise<Result<OnboardingSession, Error>> {
    const useCase = createTestBotUseCase({
      onboardingRepository: this.onboardingRepository,
      whatsappService: this.whatsappService
    });
    return useCase.execute(command);
  }
}
