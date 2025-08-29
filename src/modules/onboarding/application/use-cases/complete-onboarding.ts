/**
 * Complete Onboarding Use Case
 * Application layer - Business logic for completing the onboarding process
 */

import { Result, success, failure } from '../../../shared/domain/value-objects/result';
import { OnboardingSession, OnboardingSessionId, advanceOnboardingStep } from '../../domain/entities/onboarding-session';
import { isOnboardingComplete } from '../../domain/value-objects/onboarding-step-data';
import { OnboardingRepository } from '../ports/onboarding-repository';
import { NotFoundError, BusinessRuleError } from '../../../shared/domain/errors/application-errors';

export interface CompleteOnboardingCommand {
  readonly sessionId: string;
}

export interface OnboardingCompletionResult {
  readonly session: OnboardingSession;
  readonly dashboardUrl: string;
  readonly nextSteps: string[];
}

export class CompleteOnboardingUseCase {
  constructor(
    private readonly onboardingRepository: OnboardingRepository
  ) {}

  async execute(command: CompleteOnboardingCommand): Promise<Result<OnboardingCompletionResult, Error>> {
    try {
      // Find the onboarding session
      const sessionResult = await this.onboardingRepository.findById(
        command.sessionId as OnboardingSessionId
      );
      
      if (!sessionResult.success || !sessionResult.data) {
        return failure(new NotFoundError('OnboardingSession', command.sessionId));
      }

      const session = sessionResult.data;

      // Validate that onboarding is actually complete
      if (!isOnboardingComplete(session.stepData)) {
        return failure(new BusinessRuleError('Onboarding is not complete. Please complete all required steps.', 'INCOMPLETE_ONBOARDING'));
      }

      // Mark session as completed
      const completedSession = session.status === 'completed' 
        ? session
        : advanceOnboardingStep(session, 'complete');

      // Save the completed session
      const saveResult = await this.onboardingRepository.update(completedSession);
      if (!saveResult.success) {
        return failure(new BusinessRuleError('Failed to complete onboarding', 'SAVE_FAILURE'));
      }

      // Generate next steps based on configuration
      const nextSteps: string[] = [];
      
      if (session.stepData.botConfig) {
        nextSteps.push('Customize your bot responses and commands');
      }
      
      if (session.stepData.whatsappConfig) {
        nextSteps.push('Set up message templates for common responses');
      }
      
      if (session.stepData.businessInfo) {
        nextSteps.push('Configure business hours and availability');
      }
      
      nextSteps.push('Invite team members to manage conversations');
      nextSteps.push('Set up analytics and reporting preferences');
      nextSteps.push('Create automated workflows and triggers');

      return success({
        session: saveResult.data,
        dashboardUrl: '/dashboard',
        nextSteps,
      });
    } catch (error) {
      return failure(new BusinessRuleError(
        error instanceof Error ? error.message : 'Unknown error completing onboarding',
        'COMPLETION_ERROR'
      ));
    }
  }

  async getOnboardingStatus(sessionId: string): Promise<Result<{
    session: OnboardingSession;
    isComplete: boolean;
    completionPercentage: number;
    missingSteps: string[];
  }, Error>> {
    try {
      const sessionResult = await this.onboardingRepository.findById(
        sessionId as OnboardingSessionId
      );
      
      if (!sessionResult.success || !sessionResult.data) {
        return failure(new NotFoundError('OnboardingSession', sessionId));
      }

      const session = sessionResult.data;
      const isComplete = isOnboardingComplete(session.stepData);
      
      // Calculate completion percentage and missing steps
      const missingSteps: string[] = [];
      let completedSteps = 0;
      const totalSteps = 5;
      
      if (!session.stepData.businessInfo) {
        missingSteps.push('Business Information');
      } else {
        completedSteps++;
      }
      
      if (!session.stepData.whatsappConfig) {
        missingSteps.push('WhatsApp Integration');
      } else {
        completedSteps++;
      }
      
      if (!session.stepData.phoneVerification?.isVerified) {
        missingSteps.push('Phone Verification');
      } else {
        completedSteps++;
      }
      
      if (!session.stepData.botConfig) {
        missingSteps.push('Bot Configuration');
      } else {
        completedSteps++;
      }
      
      if (!session.stepData.testingResults?.testMessageSent || !session.stepData.testingResults?.webhookConfigured) {
        missingSteps.push('Bot Testing');
      } else {
        completedSteps++;
      }
      
      const completionPercentage = Math.round((completedSteps / totalSteps) * 100);

      return success({
        session,
        isComplete,
        completionPercentage,
        missingSteps,
      });
    } catch (error) {
      return failure(new BusinessRuleError(
        error instanceof Error ? error.message : 'Unknown error getting onboarding status',
        'STATUS_ERROR'
      ));
    }
  }
}
