/**
 * Onboarding Session Entity
 * Domain layer - Core business entity representing user onboarding progress
 */

import { Email } from '../../../marketing/domain/value-objects/email';
import { OnboardingStepData } from '../value-objects/onboarding-step-data';

export type OnboardingSessionId = string & { readonly __brand: unique symbol };

export type OnboardingStep = 
  | 'welcome'
  | 'business'
  | 'integration'
  | 'verification'
  | 'bot-setup'
  | 'testing'
  | 'complete';

export type OnboardingStatus = 
  | 'in-progress'
  | 'paused'
  | 'completed'
  | 'abandoned';

export interface OnboardingSession {
  readonly id: OnboardingSessionId;
  readonly userEmail: Email;
  readonly currentStep: OnboardingStep;
  readonly status: OnboardingStatus;
  readonly completedSteps: OnboardingStep[];
  readonly startedAt: Date;
  readonly lastActivityAt: Date;
  readonly completedAt?: Date;
  readonly stepData: OnboardingStepData;
  readonly metadata?: Record<string, unknown>;
}

export function createOnboardingSessionId(): OnboardingSessionId {
  return crypto.randomUUID() as OnboardingSessionId;
}

/**
 * Pure function to create a new onboarding session
 */
export function createOnboardingSession(userEmail: Email): OnboardingSession {
  const now = new Date();
  
  return {
    id: createOnboardingSessionId(),
    userEmail,
    currentStep: 'welcome',
    status: 'in-progress',
    completedSteps: [],
    startedAt: now,
    lastActivityAt: now,
    stepData: {},
    metadata: {},
  };
}

/**
 * Pure function to advance to next step
 */
export function advanceOnboardingStep(
  session: OnboardingSession, 
  nextStep: OnboardingStep,
  stepData?: Partial<OnboardingStepData>
): OnboardingSession {
  const stepOrder: OnboardingStep[] = [
    'welcome',
    'business', 
    'integration',
    'verification',
    'bot-setup',
    'testing',
    'complete'
  ];

  // Add current step to completed if not already there
  const updatedCompletedSteps = session.completedSteps.includes(session.currentStep)
    ? session.completedSteps
    : [...session.completedSteps, session.currentStep];

  const isCompleted = nextStep === 'complete';
  const now = new Date();

  return {
    ...session,
    currentStep: nextStep,
    status: isCompleted ? 'completed' : session.status,
    completedSteps: updatedCompletedSteps,
    lastActivityAt: now,
    completedAt: isCompleted ? now : session.completedAt,
    stepData: stepData ? { ...session.stepData, ...stepData } : session.stepData,
  };
}

/**
 * Pure function to update session metadata
 */
export function updateOnboardingMetadata(
  session: OnboardingSession,
  metadata: Record<string, unknown>
): OnboardingSession {
  return {
    ...session,
    metadata: {
      ...session.metadata,
      ...metadata,
    },
    lastActivityAt: new Date(),
  };
}

/**
 * Pure function to pause onboarding
 */
export function pauseOnboarding(session: OnboardingSession): OnboardingSession {
  return {
    ...session,
    status: 'paused',
    lastActivityAt: new Date(),
  };
}

/**
 * Pure function to resume onboarding
 */
export function resumeOnboarding(session: OnboardingSession): OnboardingSession {
  return {
    ...session,
    status: 'in-progress',
    lastActivityAt: new Date(),
  };
}

/**
 * Pure function to calculate onboarding progress percentage
 */
export function calculateOnboardingProgress(session: OnboardingSession): number {
  const totalSteps = 6; // Excluding 'complete'
  const completedCount = session.completedSteps.length;
  
  return Math.min(Math.round((completedCount / totalSteps) * 100), 100);
}

/**
 * Pure function to update step data in session
 */
export function updateOnboardingStepData(
  session: OnboardingSession,
  stepData: Partial<OnboardingStepData>
): OnboardingSession {
  return {
    ...session,
    stepData: { ...session.stepData, ...stepData },
    lastActivityAt: new Date(),
  };
}

/**
 * Pure function to get step display name
 */
export function getStepDisplayName(step: OnboardingStep): string {
  const displayNames: Record<OnboardingStep, string> = {
    'welcome': 'Welcome',
    'business': 'Business Information',
    'integration': 'WhatsApp Integration',
    'verification': 'Phone Verification',
    'bot-setup': 'Bot Configuration',
    'testing': 'Test Your Bot',
    'complete': 'Complete',
  };
  
  return displayNames[step];
}

/**
 * Pure function to get step number
 */
export function getStepNumber(step: OnboardingStep): number {
  const stepOrder: OnboardingStep[] = [
    'welcome',
    'business',
    'integration',
    'verification',
    'bot-setup',
    'testing',
    'complete'
  ];
  
  return stepOrder.indexOf(step) + 1;
}

/**
 * Pure function to get all steps for progress indicator
 */
export function getAllSteps(): OnboardingStep[] {
  return [
    'welcome',
    'business',
    'integration',
    'verification',
    'bot-setup',
    'testing',
    'complete'
  ];
}

/**
 * Pure function to get next step in sequence
 */
export function getNextOnboardingStep(currentStep: OnboardingStep): OnboardingStep | null {
  const stepOrder: OnboardingStep[] = [
    'welcome',
    'business',
    'integration', 
    'verification',
    'bot-setup',
    'testing',
    'complete'
  ];

  const currentIndex = stepOrder.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex === stepOrder.length - 1) {
    return null;
  }

  return stepOrder[currentIndex + 1];
}

/**
 * Pure function to check if step is accessible
 */
export function isStepAccessible(
  session: OnboardingSession, 
  targetStep: OnboardingStep
): boolean {
  const stepOrder: OnboardingStep[] = [
    'welcome',
    'business',
    'integration',
    'verification', 
    'bot-setup',
    'testing',
    'complete'
  ];

  const currentIndex = stepOrder.indexOf(session.currentStep);
  const targetIndex = stepOrder.indexOf(targetStep);

  // Can access current step, completed steps, or next step
  return (
    targetStep === session.currentStep ||
    session.completedSteps.includes(targetStep) ||
    targetIndex === currentIndex + 1
  );
}