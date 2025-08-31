/**
 * Onboarding Step Data Value Objects
 * Domain layer - Value objects for storing step-specific data
 */

import { BusinessInfo } from './business-info';
import { BotConfiguration,PhoneNumberVerification, WhatsAppIntegrationConfig } from './whatsapp-config';

export interface OnboardingStepData {
  readonly businessInfo?: BusinessInfo;
  readonly whatsappConfig?: WhatsAppIntegrationConfig;
  readonly phoneVerification?: PhoneNumberVerification;
  readonly botConfig?: BotConfiguration;
  readonly testingResults?: TestingResults;
}

export interface TestingResults {
  readonly testMessageSent: boolean;
  readonly testMessageReceived: boolean;
  readonly webhookConfigured: boolean;
  readonly lastTestAt: Date;
  readonly testPhoneNumber?: string;
  readonly testErrors?: string[];
}

export class OnboardingDataValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OnboardingDataValidationError';
  }
}

/**
 * Pure function to create testing results
 */
export function createTestingResults(params: {
  testMessageSent: boolean;
  testMessageReceived: boolean;
  webhookConfigured: boolean;
  testPhoneNumber?: string;
  testErrors?: string[];
}): TestingResults {
  return {
    testMessageSent: params.testMessageSent,
    testMessageReceived: params.testMessageReceived,
    webhookConfigured: params.webhookConfigured,
    lastTestAt: new Date(),
    testPhoneNumber: params.testPhoneNumber,
    testErrors: params.testErrors || [],
  };
}

/**
 * Pure function to update step data
 */
export function updateOnboardingStepData(
  currentData: OnboardingStepData,
  updates: Partial<OnboardingStepData>
): OnboardingStepData {
  return {
    ...currentData,
    ...updates,
  };
}

/**
 * Pure function to validate step data completeness
 */
export function validateStepDataCompleteness(
  step: string,
  data: OnboardingStepData
): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  switch (step) {
    case 'business-info':
      if (!data.businessInfo) {
        missingFields.push('businessInfo');
      }
      break;

    case 'integration-config':
      if (!data.whatsappConfig) {
        missingFields.push('whatsappConfig');
      }
      break;

    case 'phone-verification':
      if (!data.phoneVerification?.isVerified) {
        missingFields.push('phoneVerification');
      }
      break;

    case 'bot-setup':
      if (!data.botConfig) {
        missingFields.push('botConfig');
      }
      break;

    case 'testing':
      if (!data.testingResults?.testMessageSent || !data.testingResults?.webhookConfigured) {
        missingFields.push('testingResults');
      }
      break;
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Pure function to check if onboarding is complete
 */
export function isOnboardingComplete(data: OnboardingStepData): boolean {
  return !!(
    data.businessInfo &&
    data.whatsappConfig &&
    data.phoneVerification?.isVerified &&
    data.botConfig &&
    data.testingResults?.testMessageSent &&
    data.testingResults?.webhookConfigured
  );
}

/**
 * Pure function to get onboarding completion percentage
 */
export function getOnboardingCompletionPercentage(data: OnboardingStepData): number {
  let completedSteps = 0;
  const totalSteps = 5;

  if (data.businessInfo) completedSteps++;
  if (data.whatsappConfig) completedSteps++;
  if (data.phoneVerification?.isVerified) completedSteps++;
  if (data.botConfig) completedSteps++;
  if (data.testingResults?.testMessageSent && data.testingResults?.webhookConfigured) {
    completedSteps++;
  }

  return Math.round((completedSteps / totalSteps) * 100);
}
