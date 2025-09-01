/**
 * Configure WhatsApp Integration Use Case
 * Application layer - Business logic for WhatsApp API integration setup
 */

import { failure, isSuccess,Result, success } from '../../../shared/domain/value-objects/result';
import { advanceOnboardingStep, OnboardingSession, OnboardingSessionId, updateOnboardingStepData } from '../../domain/entities/onboarding-session';
import { createWhatsAppIntegrationConfig,WhatsAppIntegrationConfig } from '../../domain/value-objects/whatsapp-config';
import { OnboardingRepository } from '../ports/onboarding-repository';
import { WhatsAppService } from '../ports/whatsapp-service';

export interface ConfigureWhatsAppIntegrationCommand {
  readonly sessionId: string;
  readonly businessAccountId: string;
  readonly phoneNumberId: string;
  readonly appId: string;
  readonly accessToken: string;
  readonly webhookUrl: string;
  readonly verifyToken: string;
  readonly isTestMode?: boolean;
}

export interface ConfigureWhatsAppIntegrationDependencies {
  readonly onboardingRepository: OnboardingRepository;
  readonly whatsappService: WhatsAppService;
}

/**
 * Factory function to create configureWhatsAppIntegration use case
 * @param deps Dependencies required for the use case
 * @returns Object with execute function
 */
export const createConfigureWhatsAppIntegrationUseCase = (deps: ConfigureWhatsAppIntegrationDependencies) => {
  const { onboardingRepository, whatsappService } = deps;

  return {
    execute: async (command: ConfigureWhatsAppIntegrationCommand): Promise<Result<OnboardingSession, Error>> => {
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
        if (session.currentStep !== 'integration' && !session.completedSteps.includes('integration')) {
          return failure(new Error('Invalid step for WhatsApp integration configuration'));
        }

        // Create and validate WhatsApp configuration
        let whatsappConfig: WhatsAppIntegrationConfig;
        try {
          whatsappConfig = createWhatsAppIntegrationConfig({
            businessAccountId: command.businessAccountId,
            phoneNumberId: command.phoneNumberId,
            appId: command.appId,
            accessToken: command.accessToken,
            webhookUrl: command.webhookUrl,
            verifyToken: command.verifyToken,
            isTestMode: command.isTestMode,
          });
        } catch (error) {
          return failure(new Error(
            error instanceof Error ? error.message : 'Invalid WhatsApp configuration'
          ));
        }

        // Validate the configuration with WhatsApp API
        const validationResult = await whatsappService.validateConfiguration(whatsappConfig);
        if (!isSuccess(validationResult)) {
          return failure(new Error(
            `WhatsApp configuration validation failed: ${validationResult.error?.message || 'Unknown error'}`
          ));
        }

        if (!validationResult.data.isValid) {
          return failure(new Error(
            `Invalid WhatsApp configuration: ${validationResult.data.errors.join(', ')}`
          ));
        }

        // Configure webhook
        const webhookResult = await whatsappService.configureWebhook(
          whatsappConfig,
          command.webhookUrl
        );

        if (!isSuccess(webhookResult)) {
          return failure(new Error(
            `Failed to configure webhook: ${webhookResult.error?.message || 'Unknown error'}`
          ));
        }

        // Update session with WhatsApp configuration
        const updatedSession = updateOnboardingStepData(session, {
          whatsappConfig,
        });

        // Advance to next step if we're currently on integration step
        const finalSession = session.currentStep === 'integration'
          ? advanceOnboardingStep(updatedSession, 'verification')
          : updatedSession;

        // Save the updated session
        const saveResult = await onboardingRepository.update(finalSession);
        if (!isSuccess(saveResult)) {
          return failure(new Error('Failed to save WhatsApp integration configuration'));
        }

        return success(saveResult.data);
      } catch (error) {
        return failure(new Error(
          error instanceof Error ? error.message : 'Unknown error configuring WhatsApp integration'
        ));
      }
    }
  };
};

// =============================================================================
// LEGACY COMPATIBILITY - For gradual migration
// =============================================================================

/**
 * @deprecated Use createConfigureWhatsAppIntegrationUseCase factory function instead
 * Legacy class wrapper for backward compatibility during migration
 */
export class ConfigureWhatsAppIntegrationUseCase {
  constructor(
    private readonly onboardingRepository: OnboardingRepository,
    private readonly whatsappService: WhatsAppService
  ) {}

  async execute(command: ConfigureWhatsAppIntegrationCommand): Promise<Result<OnboardingSession, Error>> {
    const useCase = createConfigureWhatsAppIntegrationUseCase({
      onboardingRepository: this.onboardingRepository,
      whatsappService: this.whatsappService
    });
    return useCase.execute(command);
  }
}
