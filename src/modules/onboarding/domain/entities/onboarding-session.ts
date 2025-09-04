/**
 * Onboarding Session Entity
 * Domain layer - Core business entity representing user onboarding progress
 */

import { Email } from '../../../shared/domain/value-objects/email';
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

export interface SessionAnalytics {
  readonly startedAt: Date;
  readonly lastActivityAt: Date;
  readonly completedAt?: Date;
  readonly abandonedAt?: Date;
  readonly resumedAt?: Date;
  readonly pausedAt?: Date;
  readonly stepTimestamps: Record<OnboardingStep, Date[]>;
  readonly stepDurations: Record<OnboardingStep, number>;
  readonly deviceInfo?: {
    readonly userAgent: string;
    readonly ip: string;
    readonly country?: string;
    readonly city?: string;
  };
  readonly abTestVariants: Record<string, string>;
  readonly conversionSource?: string;
  readonly abandonmentReason?: string;
}

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
  readonly analytics: SessionAnalytics;
  readonly recoveryToken?: string;
  readonly expiresAt: Date;
}

export function createOnboardingSessionId(): OnboardingSessionId {
  return crypto.randomUUID() as OnboardingSessionId;
}

/**
 * Pure function to create a recovery token for session restoration
 */
export function createRecoveryToken(): string {
  return crypto.randomUUID();
}

/**
 * Pure function to create a new onboarding session
 */
export function createOnboardingSession(
  userEmail: Email,
  deviceInfo?: SessionAnalytics['deviceInfo'],
  conversionSource?: string
): OnboardingSession {
  const now = new Date();
  const expiryTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

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
    analytics: {
      startedAt: now,
      lastActivityAt: now,
      stepTimestamps: {
        'welcome': [now],
        'business': [],
        'integration': [],
        'verification': [],
        'bot-setup': [],
        'testing': [],
        'complete': [],
      },
      stepDurations: {
        'welcome': 0,
        'business': 0,
        'integration': 0,
        'verification': 0,
        'bot-setup': 0,
        'testing': 0,
        'complete': 0,
      },
      deviceInfo,
      abTestVariants: {},
      conversionSource,
    },
    recoveryToken: createRecoveryToken(),
    expiresAt: expiryTime,
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

  // Calculate step duration for current step
  const currentStepTimestamps = session.analytics.stepTimestamps[session.currentStep];
  const stepStartTime = currentStepTimestamps[currentStepTimestamps.length - 1] || session.analytics.lastActivityAt;
  const currentStepDuration = now.getTime() - stepStartTime.getTime();

  // Update analytics
  const updatedAnalytics: SessionAnalytics = {
    ...session.analytics,
    lastActivityAt: now,
    completedAt: isCompleted ? now : session.analytics.completedAt,
    stepTimestamps: {
      ...session.analytics.stepTimestamps,
      [nextStep]: [...(session.analytics.stepTimestamps[nextStep] || []), now],
    },
    stepDurations: {
      ...session.analytics.stepDurations,
      [session.currentStep]: session.analytics.stepDurations[session.currentStep] + currentStepDuration,
    },
  };

  return {
    ...session,
    currentStep: nextStep,
    status: isCompleted ? 'completed' : session.status,
    completedSteps: updatedCompletedSteps,
    lastActivityAt: now,
    completedAt: isCompleted ? now : session.completedAt,
    stepData: stepData ? { ...session.stepData, ...stepData } : session.stepData,
    analytics: updatedAnalytics,
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

/**
 * Pure function to abandon onboarding session
 */
export function abandonOnboarding(
  session: OnboardingSession,
  reason?: string
): OnboardingSession {
  const now = new Date();

  return {
    ...session,
    status: 'abandoned',
    lastActivityAt: now,
    analytics: {
      ...session.analytics,
      abandonedAt: now,
      lastActivityAt: now,
      abandonmentReason: reason,
    },
  };
}

/**
 * Pure function to extend session expiry
 */
export function extendSessionExpiry(
  session: OnboardingSession,
  additionalHours: number = 24
): OnboardingSession {
  const now = new Date();
  const newExpiryTime = new Date(now.getTime() + additionalHours * 60 * 60 * 1000);

  return {
    ...session,
    expiresAt: newExpiryTime,
    lastActivityAt: now,
    analytics: {
      ...session.analytics,
      lastActivityAt: now,
    },
  };
}

/**
 * Pure function to check if session is expired
 */
export function isSessionExpired(session: OnboardingSession): boolean {
  return new Date() > session.expiresAt;
}

/**
 * Pure function to record A/B test variant
 */
export function recordAbTestVariant(
  session: OnboardingSession,
  testName: string,
  variant: string
): OnboardingSession {
  return {
    ...session,
    analytics: {
      ...session.analytics,
      abTestVariants: {
        ...session.analytics.abTestVariants,
        [testName]: variant,
      },
    },
  };
}

/**
 * Pure function to update device information
 */
export function updateDeviceInfo(
  session: OnboardingSession,
  deviceInfo: SessionAnalytics['deviceInfo']
): OnboardingSession {
  return {
    ...session,
    analytics: {
      ...session.analytics,
      deviceInfo,
    },
  };
}

/**
 * Pure function to get session duration in minutes
 */
export function getSessionDurationMinutes(session: OnboardingSession): number {
  const endTime = session.completedAt || session.analytics.abandonedAt || new Date();
  const startTime = session.startedAt;
  return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
}

/**
 * Pure function to get current step duration in minutes
 */
export function getCurrentStepDurationMinutes(session: OnboardingSession): number {
  const currentStepTimestamps = session.analytics.stepTimestamps[session.currentStep];
  if (!currentStepTimestamps || currentStepTimestamps.length === 0) {
    return 0;
  }

  const stepStartTime = currentStepTimestamps[currentStepTimestamps.length - 1];
  const now = new Date();
  return Math.round((now.getTime() - stepStartTime.getTime()) / (1000 * 60));
}

/**
 * Pure function to generate analytics summary
 */
export function generateAnalyticsSummary(session: OnboardingSession) {
  const totalDuration = getSessionDurationMinutes(session);
  const currentStepDuration = getCurrentStepDurationMinutes(session);
  const progress = calculateOnboardingProgress(session);

  return {
    sessionId: session.id,
    status: session.status,
    progress,
    currentStep: session.currentStep,
    completedSteps: session.completedSteps.length,
    totalSteps: 6,
    totalDurationMinutes: totalDuration,
    currentStepDurationMinutes: currentStepDuration,
    averageStepDuration: Object.values(session.analytics.stepDurations)
      .filter(d => d > 0)
      .reduce((acc, duration, index, arr) => acc + duration / arr.length, 0) / (1000 * 60),
    conversionSource: session.analytics.conversionSource,
    abTestVariants: session.analytics.abTestVariants,
    deviceInfo: session.analytics.deviceInfo,
    isExpired: isSessionExpired(session),
    timeToExpiry: Math.max(0, Math.round((session.expiresAt.getTime() - new Date().getTime()) / (1000 * 60))),
  };
}