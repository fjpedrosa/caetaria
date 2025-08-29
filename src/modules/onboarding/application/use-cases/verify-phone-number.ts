/**
 * Verify Phone Number Use Case
 * Application layer - Business logic for phone number verification
 */

import { failure, isSuccess,Result, success } from '../../../shared/domain/value-objects/result';
import { advanceOnboardingStep, OnboardingSession, OnboardingSessionId, updateOnboardingStepData } from '../../domain/entities/onboarding-session';
import { createPhoneNumberVerification, PhoneNumberVerification, verifyPhoneNumber } from '../../domain/value-objects/whatsapp-config';
import { OnboardingRepository } from '../ports/onboarding-repository';
import { WhatsAppService } from '../ports/whatsapp-service';

export interface StartPhoneVerificationCommand {
  readonly sessionId: string;
  readonly phoneNumber: string;
  readonly countryCode: string;
}

export interface CompletePhoneVerificationCommand {
  readonly sessionId: string;
  readonly verificationCode: string;
}

export class VerifyPhoneNumberUseCase {
  constructor(
    private readonly onboardingRepository: OnboardingRepository,
    private readonly whatsappService: WhatsAppService
  ) {}

  async startVerification(command: StartPhoneVerificationCommand): Promise<Result<OnboardingSession, Error>> {
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
      if (session.currentStep !== 'verification' && !session.completedSteps.includes('verification')) {
        return failure(new Error('Invalid step for phone verification'));
      }

      // Check if WhatsApp config is available
      if (!session.stepData.whatsappConfig) {
        return failure(new Error('WhatsApp configuration required for phone verification'));
      }

      // Create phone verification object
      let phoneVerification: PhoneNumberVerification;
      try {
        phoneVerification = createPhoneNumberVerification({
          phoneNumber: command.phoneNumber,
          countryCode: command.countryCode,
        });
      } catch (error) {
        return failure(new Error(
          error instanceof Error ? error.message : 'Invalid phone number'
        ));
      }

      // Send verification code via WhatsApp
      const verificationResult = await this.whatsappService.sendVerificationCode(
        phoneVerification.phoneNumber
      );
      
      if (!isSuccess(verificationResult)) {
        return failure(new Error(
          `Failed to send verification code: ${verificationResult.error?.message || 'Unknown error'}`
        ));
      }

      // Update phone verification with the sent code (in production, this would be stored securely)
      const updatedPhoneVerification: PhoneNumberVerification = {
        ...phoneVerification,
        verificationCode: verificationResult.data.verificationId, // This would be handled differently in production
      };

      // Update session with phone verification data
      const updatedSession = updateOnboardingStepData(session, {
        phoneVerification: updatedPhoneVerification,
      });

      // Save the updated session
      const saveResult = await this.onboardingRepository.update(updatedSession);
      if (!isSuccess(saveResult)) {
        return failure(new Error('Failed to save phone verification data'));
      }

      return success(saveResult.data);
    } catch (error) {
      return failure(new Error(
        error instanceof Error ? error.message : 'Unknown error starting phone verification'
      ));
    }
  }

  async completeVerification(command: CompletePhoneVerificationCommand): Promise<Result<OnboardingSession, Error>> {
    try {
      // Find the onboarding session
      const sessionResult = await this.onboardingRepository.findById(
        command.sessionId as OnboardingSessionId
      );
      
      if (!isSuccess(sessionResult) || !sessionResult.data) {
        return failure(new Error('Onboarding session not found'));
      }

      const session = sessionResult.data;

      // Check if phone verification data exists
      if (!session.stepData.phoneVerification) {
        return failure(new Error('Phone verification not started'));
      }

      // Verify the code
      let verifiedPhoneVerification: PhoneNumberVerification;
      try {
        verifiedPhoneVerification = verifyPhoneNumber(
          session.stepData.phoneVerification,
          command.verificationCode
        );
      } catch (error) {
        return failure(new Error(
          error instanceof Error ? error.message : 'Verification failed'
        ));
      }

      if (!verifiedPhoneVerification.isVerified) {
        return failure(new Error('Invalid verification code'));
      }

      // Update session with verified phone data
      const updatedSession = updateOnboardingStepData(session, {
        phoneVerification: verifiedPhoneVerification,
      });

      // Advance to next step if we're currently on verification step
      const finalSession = session.currentStep === 'verification'
        ? advanceOnboardingStep(updatedSession, 'bot-setup')
        : updatedSession;

      // Save the updated session
      const saveResult = await this.onboardingRepository.update(finalSession);
      if (!isSuccess(saveResult)) {
        return failure(new Error('Failed to save verification results'));
      }

      return success(saveResult.data);
    } catch (error) {
      return failure(new Error(
        error instanceof Error ? error.message : 'Unknown error completing phone verification'
      ));
    }
  }
}
