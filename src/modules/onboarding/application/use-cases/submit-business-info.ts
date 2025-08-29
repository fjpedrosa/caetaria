/**
 * Submit Business Info Use Case
 * Application layer - Business logic for collecting business information
 */

import { failure, isSuccess,Result, success } from '../../../shared/domain/value-objects/result';
import { advanceOnboardingStep, OnboardingSession, OnboardingSessionId, updateOnboardingStepData } from '../../domain/entities/onboarding-session';
import { BusinessInfo, BusinessType, createBusinessInfo, Industry } from '../../domain/value-objects/business-info';
import { OnboardingRepository } from '../ports/onboarding-repository';

export interface SubmitBusinessInfoCommand {
  readonly sessionId: string;
  readonly companyName: string;
  readonly businessType: BusinessType;
  readonly industry: Industry;
  readonly employeeCount: number;
  readonly website?: string;
  readonly description?: string;
  readonly expectedVolume: 'low' | 'medium' | 'high';
}

export class SubmitBusinessInfoUseCase {
  constructor(
    private readonly onboardingRepository: OnboardingRepository
  ) {}

  async execute(command: SubmitBusinessInfoCommand): Promise<Result<OnboardingSession, Error>> {
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
      if (session.currentStep !== 'business' && !session.completedSteps.includes('business')) {
        return failure(new Error('Invalid step for business info submission'));
      }

      // Create and validate business info
      let businessInfo: BusinessInfo;
      try {
        businessInfo = createBusinessInfo({
          companyName: command.companyName,
          businessType: command.businessType,
          industry: command.industry,
          employeeCount: command.employeeCount,
          website: command.website,
          description: command.description,
          expectedVolume: command.expectedVolume,
        });
      } catch (error) {
        return failure(new Error(
          error instanceof Error ? error.message : 'Invalid business information'
        ));
      }

      // Update session with business info
      const updatedSession = updateOnboardingStepData(session, {
        businessInfo,
      });

      // Advance to next step if we're currently on business step
      const finalSession = session.currentStep === 'business'
        ? advanceOnboardingStep(updatedSession, 'integration')
        : updatedSession;

      // Save the updated session
      const saveResult = await this.onboardingRepository.update(finalSession);
      if (!isSuccess(saveResult)) {
        return failure(new Error('Failed to save business information'));
      }

      return success(saveResult.data);
    } catch (error) {
      return failure(new Error(
        error instanceof Error ? error.message : 'Unknown error submitting business information'
      ));
    }
  }
}
