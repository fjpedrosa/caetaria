/**
 * Onboarding Session Entity Tests
 * Domain layer - Unit tests for core business entity
 * Coverage requirement: 95%
 */

import { createEmail } from '../../../../marketing/domain/value-objects/email';
import {
  abandonOnboarding,
  advanceOnboardingStep,
  calculateOnboardingProgress,
  createOnboardingSession,
  createOnboardingSessionId,
  createRecoveryToken,
  extendSessionExpiry,
  generateAnalyticsSummary,
  getAllSteps,
  getCurrentStepDurationMinutes,
  getNextOnboardingStep,
  getSessionDurationMinutes,
  getStepDisplayName,
  getStepNumber,
  isSessionExpired,
  isStepAccessible,
  OnboardingSession,
  OnboardingSessionId,
  OnboardingStatus,
  OnboardingStep,
  pauseOnboarding,
  recordAbTestVariant,
  resumeOnboarding,
  SessionAnalytics,
  updateDeviceInfo,
  updateOnboardingMetadata,
  updateOnboardingStepData,
} from '../onboarding-session';

// =============================================================================
// TEST SETUP & HELPERS
// =============================================================================

const createTestSession = (overrides: Partial<OnboardingSession> = {}): OnboardingSession => {
  const baseSession = createOnboardingSession(
    createEmail('test@example.com'),
    {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      ip: '127.0.0.1',
      country: 'United States',
      city: 'San Francisco',
    },
    'website-form'
  );

  return { ...baseSession, ...overrides };
};

const mockDate = (dateString: string) => {
  const date = new Date(dateString);
  jest.spyOn(Date, 'now').mockImplementation(() => date.getTime());
  // Mock Date constructor for new Date() calls
  const OriginalDate = global.Date;
  global.Date = jest.fn((dateValue) => {
    if (dateValue) {
      return new OriginalDate(dateValue);
    }
    return date;
  }) as any;
  global.Date.now = jest.fn(() => date.getTime());
  global.Date.UTC = OriginalDate.UTC;
  global.Date.parse = OriginalDate.parse;
  return date;
};

const restoreDate = () => {
  jest.restoreAllMocks();
};

// =============================================================================
// ID GENERATION TESTS
// =============================================================================

describe('createOnboardingSessionId', () => {
  afterEach(() => {
    restoreDate();
  });

  it('should generate unique session IDs', () => {
    const id1 = createOnboardingSessionId();
    const id2 = createOnboardingSessionId();

    expect(id1).toBeDefined();
    expect(id2).toBeDefined();
    expect(id1).not.toBe(id2);
    expect(typeof id1).toBe('string');
    expect(typeof id2).toBe('string');
  });

  it('should generate UUID format IDs', () => {
    const id = createOnboardingSessionId();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    expect(id).toMatch(uuidRegex);
  });
});

describe('createRecoveryToken', () => {
  afterEach(() => {
    restoreDate();
  });

  it('should generate unique recovery tokens', () => {
    const token1 = createRecoveryToken();
    const token2 = createRecoveryToken();

    expect(token1).toBeDefined();
    expect(token2).toBeDefined();
    expect(token1).not.toBe(token2);
    expect(typeof token1).toBe('string');
    expect(typeof token2).toBe('string');
  });

  it('should generate UUID format tokens', () => {
    const token = createRecoveryToken();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    expect(token).toMatch(uuidRegex);
  });
});

// =============================================================================
// SESSION CREATION TESTS
// =============================================================================

describe('createOnboardingSession', () => {
  let fixedDate: Date;

  beforeEach(() => {
    fixedDate = mockDate('2024-01-15T10:00:00.000Z');
  });

  afterEach(() => {
    restoreDate();
  });

  it('should create a new onboarding session with correct initial values', () => {
    const email = createEmail('test@example.com');
    const deviceInfo = {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      ip: '192.168.1.1',
      country: 'United States',
      city: 'San Francisco',
    };
    const conversionSource = 'google-ads';

    const session = createOnboardingSession(email, deviceInfo, conversionSource);

    expect(session.userEmail).toBe(email);
    expect(session.currentStep).toBe('welcome');
    expect(session.status).toBe('in-progress');
    expect(session.completedSteps).toEqual([]);
    expect(session.startedAt).toEqual(fixedDate);
    expect(session.lastActivityAt).toEqual(fixedDate);
    expect(session.completedAt).toBeUndefined();
    expect(session.stepData).toEqual({});
    expect(session.metadata).toEqual({});
    expect(session.recoveryToken).toBeDefined();
    expect(session.expiresAt).toEqual(new Date('2024-01-16T10:00:00.000Z')); // 24 hours later
  });

  it('should create session with correct analytics structure', () => {
    const email = createEmail('analytics@test.com');
    const deviceInfo = {
      userAgent: 'Chrome/91.0',
      ip: '10.0.0.1',
      country: 'Canada',
      city: 'Toronto',
    };
    const conversionSource = 'direct';

    const session = createOnboardingSession(email, deviceInfo, conversionSource);

    expect(session.analytics.startedAt).toEqual(fixedDate);
    expect(session.analytics.lastActivityAt).toEqual(fixedDate);
    expect(session.analytics.completedAt).toBeUndefined();
    expect(session.analytics.abandonedAt).toBeUndefined();
    expect(session.analytics.resumedAt).toBeUndefined();
    expect(session.analytics.pausedAt).toBeUndefined();
    expect(session.analytics.deviceInfo).toEqual(deviceInfo);
    expect(session.analytics.conversionSource).toBe(conversionSource);
    expect(session.analytics.abTestVariants).toEqual({});
    expect(session.analytics.abandonmentReason).toBeUndefined();
  });

  it('should initialize all step timestamps and durations correctly', () => {
    const email = createEmail('steps@test.com');
    const session = createOnboardingSession(email);

    const expectedSteps: OnboardingStep[] = [
      'welcome', 'business', 'integration', 'verification', 'bot-setup', 'testing', 'complete'
    ];

    expectedSteps.forEach(step => {
      if (step === 'welcome') {
        expect(session.analytics.stepTimestamps[step]).toEqual([fixedDate]);
      } else {
        expect(session.analytics.stepTimestamps[step]).toEqual([]);
      }
      expect(session.analytics.stepDurations[step]).toBe(0);
    });
  });

  it('should work with minimal parameters', () => {
    const email = createEmail('minimal@test.com');
    const session = createOnboardingSession(email);

    expect(session.userEmail).toBe(email);
    expect(session.analytics.deviceInfo).toBeUndefined();
    expect(session.analytics.conversionSource).toBeUndefined();
    expect(session.currentStep).toBe('welcome');
    expect(session.status).toBe('in-progress');
  });
});

// =============================================================================
// STEP ADVANCEMENT TESTS
// =============================================================================

describe('advanceOnboardingStep', () => {
  let fixedStartDate: Date;
  let fixedAdvanceDate: Date;
  let baseSession: OnboardingSession;

  beforeEach(() => {
    fixedStartDate = mockDate('2024-01-15T10:00:00.000Z');
    baseSession = createTestSession();

    // Mock a different time for advancement (10 minutes later)
    fixedAdvanceDate = new Date('2024-01-15T10:10:00.000Z');
  });

  afterEach(() => {
    restoreDate();
  });

  it('should advance to next step successfully', () => {
    jest.spyOn(global, 'Date').mockImplementation(() => fixedAdvanceDate);

    const updatedSession = advanceOnboardingStep(baseSession, 'business');

    expect(updatedSession.currentStep).toBe('business');
    expect(updatedSession.completedSteps).toEqual(['welcome']);
    expect(updatedSession.lastActivityAt).toEqual(fixedAdvanceDate);
    expect(updatedSession.status).toBe('in-progress');
  });

  it('should update analytics when advancing steps', () => {
    jest.spyOn(global, 'Date').mockImplementation(() => fixedAdvanceDate);

    const updatedSession = advanceOnboardingStep(baseSession, 'business');

    expect(updatedSession.analytics.lastActivityAt).toEqual(fixedAdvanceDate);
    expect(updatedSession.analytics.stepTimestamps['business']).toEqual([fixedAdvanceDate]);
    // Should update duration for previous step (welcome)
    expect(updatedSession.analytics.stepDurations['welcome']).toBe(10 * 60 * 1000); // 10 minutes in ms
  });

  it('should complete session when advancing to complete step', () => {
    jest.spyOn(global, 'Date').mockImplementation(() => fixedAdvanceDate);

    const updatedSession = advanceOnboardingStep(baseSession, 'complete');

    expect(updatedSession.currentStep).toBe('complete');
    expect(updatedSession.status).toBe('completed');
    expect(updatedSession.completedAt).toEqual(fixedAdvanceDate);
    expect(updatedSession.analytics.completedAt).toEqual(fixedAdvanceDate);
  });

  it('should merge step data when provided', () => {
    const stepData = {
      businessInfo: {
        companyName: 'Test Company',
        businessType: 'retail',
      },
    };

    const updatedSession = advanceOnboardingStep(baseSession, 'business', stepData);

    expect(updatedSession.stepData).toEqual(stepData);
  });

  it('should not duplicate completed steps', () => {
    const sessionWithCompletedSteps = {
      ...baseSession,
      completedSteps: ['welcome'] as OnboardingStep[],
    };

    const updatedSession = advanceOnboardingStep(sessionWithCompletedSteps, 'business');

    expect(updatedSession.completedSteps).toEqual(['welcome']);
  });

  it('should handle step advancement with existing step data', () => {
    const sessionWithData = {
      ...baseSession,
      stepData: {
        existingData: 'should be preserved',
      },
    };

    const newStepData = {
      newData: 'should be added',
    };

    const updatedSession = advanceOnboardingStep(sessionWithData, 'business', newStepData);

    expect(updatedSession.stepData).toEqual({
      existingData: 'should be preserved',
      newData: 'should be added',
    });
  });
});

// =============================================================================
// METADATA MANAGEMENT TESTS
// =============================================================================

describe('updateOnboardingMetadata', () => {
  let fixedDate: Date;
  let baseSession: OnboardingSession;

  beforeEach(() => {
    fixedDate = mockDate('2024-01-15T10:00:00.000Z');
    baseSession = createTestSession();
  });

  afterEach(() => {
    restoreDate();
  });

  it('should add new metadata', () => {
    const newMetadata = {
      source: 'landing-page',
      campaignId: 'camp-123',
    };

    const updatedSession = updateOnboardingMetadata(baseSession, newMetadata);

    expect(updatedSession.metadata).toEqual(newMetadata);
    expect(updatedSession.lastActivityAt).toEqual(fixedDate);
  });

  it('should merge with existing metadata', () => {
    const sessionWithMetadata = {
      ...baseSession,
      metadata: {
        existingKey: 'existingValue',
        sharedKey: 'originalValue',
      },
    };

    const newMetadata = {
      newKey: 'newValue',
      sharedKey: 'updatedValue',
    };

    const updatedSession = updateOnboardingMetadata(sessionWithMetadata, newMetadata);

    expect(updatedSession.metadata).toEqual({
      existingKey: 'existingValue',
      sharedKey: 'updatedValue',
      newKey: 'newValue',
    });
  });

  it('should handle empty metadata object', () => {
    const updatedSession = updateOnboardingMetadata(baseSession, {});

    expect(updatedSession.metadata).toEqual({});
    expect(updatedSession.lastActivityAt).toEqual(fixedDate);
  });
});

// =============================================================================
// SESSION STATUS MANAGEMENT TESTS
// =============================================================================

describe('pauseOnboarding', () => {
  let fixedDate: Date;
  let baseSession: OnboardingSession;

  beforeEach(() => {
    fixedDate = mockDate('2024-01-15T10:00:00.000Z');
    baseSession = createTestSession();
  });

  afterEach(() => {
    restoreDate();
  });

  it('should pause onboarding session', () => {
    const pausedSession = pauseOnboarding(baseSession);

    expect(pausedSession.status).toBe('paused');
    expect(pausedSession.lastActivityAt).toEqual(fixedDate);
    // Other properties should remain unchanged
    expect(pausedSession.currentStep).toBe(baseSession.currentStep);
    expect(pausedSession.completedSteps).toEqual(baseSession.completedSteps);
  });

  it('should update last activity time on pause', () => {
    const laterDate = new Date('2024-01-15T12:00:00.000Z');
    jest.spyOn(global, 'Date').mockImplementation(() => laterDate);

    const pausedSession = pauseOnboarding(baseSession);

    expect(pausedSession.lastActivityAt).toEqual(laterDate);
  });
});

describe('resumeOnboarding', () => {
  let fixedDate: Date;
  let pausedSession: OnboardingSession;

  beforeEach(() => {
    fixedDate = mockDate('2024-01-15T10:00:00.000Z');
    const baseSession = createTestSession();
    pausedSession = pauseOnboarding(baseSession);
  });

  afterEach(() => {
    restoreDate();
  });

  it('should resume paused onboarding session', () => {
    const resumedSession = resumeOnboarding(pausedSession);

    expect(resumedSession.status).toBe('in-progress');
    expect(resumedSession.lastActivityAt).toEqual(fixedDate);
    // Other properties should remain unchanged
    expect(resumedSession.currentStep).toBe(pausedSession.currentStep);
    expect(resumedSession.completedSteps).toEqual(pausedSession.completedSteps);
  });

  it('should update last activity time on resume', () => {
    const resumeDate = new Date('2024-01-15T14:00:00.000Z');
    jest.spyOn(global, 'Date').mockImplementation(() => resumeDate);

    const resumedSession = resumeOnboarding(pausedSession);

    expect(resumedSession.lastActivityAt).toEqual(resumeDate);
  });
});

describe('abandonOnboarding', () => {
  let fixedDate: Date;
  let baseSession: OnboardingSession;

  beforeEach(() => {
    fixedDate = mockDate('2024-01-15T10:00:00.000Z');
    baseSession = createTestSession();
  });

  afterEach(() => {
    restoreDate();
  });

  it('should abandon onboarding session', () => {
    const reason = 'User clicked away';
    const abandonedSession = abandonOnboarding(baseSession, reason);

    expect(abandonedSession.status).toBe('abandoned');
    expect(abandonedSession.lastActivityAt).toEqual(fixedDate);
    expect(abandonedSession.analytics.abandonedAt).toEqual(fixedDate);
    expect(abandonedSession.analytics.lastActivityAt).toEqual(fixedDate);
    expect(abandonedSession.analytics.abandonmentReason).toBe(reason);
  });

  it('should abandon without reason', () => {
    const abandonedSession = abandonOnboarding(baseSession);

    expect(abandonedSession.status).toBe('abandoned');
    expect(abandonedSession.analytics.abandonmentReason).toBeUndefined();
  });
});

// =============================================================================
// PROGRESS CALCULATION TESTS
// =============================================================================

describe('calculateOnboardingProgress', () => {
  let baseSession: OnboardingSession;

  beforeEach(() => {
    baseSession = createTestSession();
  });

  it('should calculate 0% progress for new session', () => {
    const progress = calculateOnboardingProgress(baseSession);
    expect(progress).toBe(0);
  });

  it('should calculate progress based on completed steps', () => {
    const sessionWith2Steps = {
      ...baseSession,
      completedSteps: ['welcome', 'business'] as OnboardingStep[],
    };

    const progress = calculateOnboardingProgress(sessionWith2Steps);
    expect(progress).toBe(33); // 2/6 = 33.33 -> rounded to 33
  });

  it('should calculate 100% progress when all steps completed', () => {
    const sessionAllCompleted = {
      ...baseSession,
      completedSteps: [
        'welcome', 'business', 'integration', 'verification', 'bot-setup', 'testing'
      ] as OnboardingStep[],
    };

    const progress = calculateOnboardingProgress(sessionAllCompleted);
    expect(progress).toBe(100);
  });

  it('should cap progress at 100%', () => {
    // Edge case: more completed steps than total (shouldn't happen, but defensive)
    const sessionOverCompleted = {
      ...baseSession,
      completedSteps: [
        'welcome', 'business', 'integration', 'verification', 'bot-setup', 'testing', 'complete'
      ] as OnboardingStep[],
    };

    const progress = calculateOnboardingProgress(sessionOverCompleted);
    expect(progress).toBe(100);
  });
});

// =============================================================================
// STEP DATA MANAGEMENT TESTS
// =============================================================================

describe('updateOnboardingStepData', () => {
  let fixedDate: Date;
  let baseSession: OnboardingSession;

  beforeEach(() => {
    fixedDate = mockDate('2024-01-15T10:00:00.000Z');
    baseSession = createTestSession();
  });

  afterEach(() => {
    restoreDate();
  });

  it('should add new step data', () => {
    const stepData = {
      businessInfo: {
        companyName: 'Acme Corp',
        businessType: 'technology',
      },
    };

    const updatedSession = updateOnboardingStepData(baseSession, stepData);

    expect(updatedSession.stepData).toEqual(stepData);
    expect(updatedSession.lastActivityAt).toEqual(fixedDate);
  });

  it('should merge with existing step data', () => {
    const sessionWithStepData = {
      ...baseSession,
      stepData: {
        businessInfo: {
          companyName: 'Old Company',
        },
        existingStep: {
          value: 'preserved',
        },
      },
    };

    const newStepData = {
      businessInfo: {
        companyName: 'New Company',
        businessType: 'retail',
      },
      newStep: {
        value: 'added',
      },
    };

    const updatedSession = updateOnboardingStepData(sessionWithStepData, newStepData);

    expect(updatedSession.stepData).toEqual({
      businessInfo: {
        companyName: 'New Company',
        businessType: 'retail',
      },
      existingStep: {
        value: 'preserved',
      },
      newStep: {
        value: 'added',
      },
    });
  });
});

// =============================================================================
// STEP UTILITY FUNCTION TESTS
// =============================================================================

describe('getStepDisplayName', () => {
  it('should return correct display names for all steps', () => {
    expect(getStepDisplayName('welcome')).toBe('Welcome');
    expect(getStepDisplayName('business')).toBe('Business Information');
    expect(getStepDisplayName('integration')).toBe('WhatsApp Integration');
    expect(getStepDisplayName('verification')).toBe('Phone Verification');
    expect(getStepDisplayName('bot-setup')).toBe('Bot Configuration');
    expect(getStepDisplayName('testing')).toBe('Test Your Bot');
    expect(getStepDisplayName('complete')).toBe('Complete');
  });
});

describe('getStepNumber', () => {
  it('should return correct step numbers', () => {
    expect(getStepNumber('welcome')).toBe(1);
    expect(getStepNumber('business')).toBe(2);
    expect(getStepNumber('integration')).toBe(3);
    expect(getStepNumber('verification')).toBe(4);
    expect(getStepNumber('bot-setup')).toBe(5);
    expect(getStepNumber('testing')).toBe(6);
    expect(getStepNumber('complete')).toBe(7);
  });
});

describe('getAllSteps', () => {
  it('should return all steps in correct order', () => {
    const steps = getAllSteps();

    expect(steps).toEqual([
      'welcome',
      'business',
      'integration',
      'verification',
      'bot-setup',
      'testing',
      'complete'
    ]);
  });
});

describe('getNextOnboardingStep', () => {
  it('should return next step in sequence', () => {
    expect(getNextOnboardingStep('welcome')).toBe('business');
    expect(getNextOnboardingStep('business')).toBe('integration');
    expect(getNextOnboardingStep('integration')).toBe('verification');
    expect(getNextOnboardingStep('verification')).toBe('bot-setup');
    expect(getNextOnboardingStep('bot-setup')).toBe('testing');
    expect(getNextOnboardingStep('testing')).toBe('complete');
  });

  it('should return null for last step', () => {
    expect(getNextOnboardingStep('complete')).toBeNull();
  });

  it('should return null for invalid step', () => {
    expect(getNextOnboardingStep('invalid' as OnboardingStep)).toBeNull();
  });
});

// =============================================================================
// STEP ACCESSIBILITY TESTS
// =============================================================================

describe('isStepAccessible', () => {
  let baseSession: OnboardingSession;

  beforeEach(() => {
    baseSession = createTestSession({
      currentStep: 'business',
      completedSteps: ['welcome'],
    });
  });

  it('should allow access to current step', () => {
    expect(isStepAccessible(baseSession, 'business')).toBe(true);
  });

  it('should allow access to completed steps', () => {
    expect(isStepAccessible(baseSession, 'welcome')).toBe(true);
  });

  it('should allow access to next step in sequence', () => {
    expect(isStepAccessible(baseSession, 'integration')).toBe(true);
  });

  it('should deny access to steps too far ahead', () => {
    expect(isStepAccessible(baseSession, 'verification')).toBe(false);
    expect(isStepAccessible(baseSession, 'bot-setup')).toBe(false);
    expect(isStepAccessible(baseSession, 'testing')).toBe(false);
    expect(isStepAccessible(baseSession, 'complete')).toBe(false);
  });

  it('should handle session with multiple completed steps', () => {
    const advancedSession = {
      ...baseSession,
      currentStep: 'verification' as OnboardingStep,
      completedSteps: ['welcome', 'business', 'integration'] as OnboardingStep[],
    };

    expect(isStepAccessible(advancedSession, 'welcome')).toBe(true);
    expect(isStepAccessible(advancedSession, 'business')).toBe(true);
    expect(isStepAccessible(advancedSession, 'integration')).toBe(true);
    expect(isStepAccessible(advancedSession, 'verification')).toBe(true);
    expect(isStepAccessible(advancedSession, 'bot-setup')).toBe(true); // next step
    expect(isStepAccessible(advancedSession, 'testing')).toBe(false);
    expect(isStepAccessible(advancedSession, 'complete')).toBe(false);
  });
});

// =============================================================================
// SESSION EXPIRY TESTS
// =============================================================================

describe('isSessionExpired', () => {
  it('should return false for unexpired session', () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    const session = createTestSession({ expiresAt: futureDate });

    expect(isSessionExpired(session)).toBe(false);
  });

  it('should return true for expired session', () => {
    const pastDate = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
    const session = createTestSession({ expiresAt: pastDate });

    expect(isSessionExpired(session)).toBe(true);
  });

  it('should return true for session expiring right now', () => {
    const session = createTestSession({ expiresAt: new Date() });

    expect(isSessionExpired(session)).toBe(true);
  });
});

describe('extendSessionExpiry', () => {
  let fixedDate: Date;
  let baseSession: OnboardingSession;

  beforeEach(() => {
    fixedDate = mockDate('2024-01-15T10:00:00.000Z');
    baseSession = createTestSession({
      expiresAt: new Date('2024-01-15T12:00:00.000Z'), // 2 hours from start
    });
  });

  afterEach(() => {
    restoreDate();
  });

  it('should extend expiry by default 24 hours', () => {
    const extendedSession = extendSessionExpiry(baseSession);
    const expectedExpiry = new Date('2024-01-16T10:00:00.000Z'); // 24 hours from fixed date

    expect(extendedSession.expiresAt).toEqual(expectedExpiry);
    expect(extendedSession.lastActivityAt).toEqual(fixedDate);
    expect(extendedSession.analytics.lastActivityAt).toEqual(fixedDate);
  });

  it('should extend expiry by custom hours', () => {
    const extendedSession = extendSessionExpiry(baseSession, 12);
    const expectedExpiry = new Date('2024-01-15T22:00:00.000Z'); // 12 hours from fixed date

    expect(extendedSession.expiresAt).toEqual(expectedExpiry);
  });

  it('should handle zero extension', () => {
    const extendedSession = extendSessionExpiry(baseSession, 0);

    expect(extendedSession.expiresAt).toEqual(fixedDate);
  });
});

// =============================================================================
// A/B TEST VARIANT TESTS
// =============================================================================

describe('recordAbTestVariant', () => {
  let baseSession: OnboardingSession;

  beforeEach(() => {
    baseSession = createTestSession();
  });

  it('should record A/B test variant', () => {
    const updatedSession = recordAbTestVariant(baseSession, 'hero_cta', 'variant_b');

    expect(updatedSession.analytics.abTestVariants['hero_cta']).toBe('variant_b');
  });

  it('should record multiple A/B test variants', () => {
    let updatedSession = recordAbTestVariant(baseSession, 'hero_cta', 'variant_a');
    updatedSession = recordAbTestVariant(updatedSession, 'pricing_display', 'variant_c');

    expect(updatedSession.analytics.abTestVariants).toEqual({
      'hero_cta': 'variant_a',
      'pricing_display': 'variant_c',
    });
  });

  it('should overwrite existing variant for same test', () => {
    let updatedSession = recordAbTestVariant(baseSession, 'hero_cta', 'variant_a');
    updatedSession = recordAbTestVariant(updatedSession, 'hero_cta', 'variant_b');

    expect(updatedSession.analytics.abTestVariants['hero_cta']).toBe('variant_b');
  });
});

// =============================================================================
// DEVICE INFO TESTS
// =============================================================================

describe('updateDeviceInfo', () => {
  let baseSession: OnboardingSession;

  beforeEach(() => {
    baseSession = createTestSession();
  });

  it('should update device information', () => {
    const newDeviceInfo = {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7 like Mac OS X)',
      ip: '192.168.1.100',
      country: 'Canada',
      city: 'Vancouver',
    };

    const updatedSession = updateDeviceInfo(baseSession, newDeviceInfo);

    expect(updatedSession.analytics.deviceInfo).toEqual(newDeviceInfo);
  });

  it('should handle undefined device info', () => {
    const updatedSession = updateDeviceInfo(baseSession, undefined);

    expect(updatedSession.analytics.deviceInfo).toBeUndefined();
  });

  it('should completely replace existing device info', () => {
    const sessionWithDeviceInfo = {
      ...baseSession,
      analytics: {
        ...baseSession.analytics,
        deviceInfo: {
          userAgent: 'Old Agent',
          ip: '1.1.1.1',
          country: 'Old Country',
          city: 'Old City',
        },
      },
    };

    const newDeviceInfo = {
      userAgent: 'New Agent',
      ip: '2.2.2.2',
    };

    const updatedSession = updateDeviceInfo(sessionWithDeviceInfo, newDeviceInfo);

    expect(updatedSession.analytics.deviceInfo).toEqual(newDeviceInfo);
  });
});

// =============================================================================
// DURATION CALCULATION TESTS
// =============================================================================

describe('getSessionDurationMinutes', () => {
  it('should calculate duration for completed session', () => {
    const startTime = new Date('2024-01-15T10:00:00.000Z');
    const completedTime = new Date('2024-01-15T10:30:00.000Z'); // 30 minutes later

    const session = createTestSession({
      startedAt: startTime,
      completedAt: completedTime,
    });

    expect(getSessionDurationMinutes(session)).toBe(30);
  });

  it('should calculate duration for abandoned session', () => {
    const startTime = new Date('2024-01-15T10:00:00.000Z');
    const abandonedTime = new Date('2024-01-15T10:15:00.000Z'); // 15 minutes later

    const session = createTestSession({
      startedAt: startTime,
      analytics: {
        ...createTestSession().analytics,
        abandonedAt: abandonedTime,
      },
    });

    expect(getSessionDurationMinutes(session)).toBe(15);
  });

  it('should calculate duration for ongoing session using current time', () => {
    const startTime = new Date('2024-01-15T10:00:00.000Z');
    const currentTime = new Date('2024-01-15T10:45:00.000Z'); // 45 minutes later

    jest.spyOn(global, 'Date').mockImplementation(() => currentTime);

    const session = createTestSession({
      startedAt: startTime,
    });

    expect(getSessionDurationMinutes(session)).toBe(45);

    jest.restoreAllMocks();
  });

  it('should round to nearest minute', () => {
    const startTime = new Date('2024-01-15T10:00:00.000Z');
    const endTime = new Date('2024-01-15T10:05:30.000Z'); // 5.5 minutes later

    const session = createTestSession({
      startedAt: startTime,
      completedAt: endTime,
    });

    expect(getSessionDurationMinutes(session)).toBe(6); // Rounded up
  });
});

describe('getCurrentStepDurationMinutes', () => {
  it('should calculate current step duration', () => {
    const stepStartTime = new Date('2024-01-15T10:00:00.000Z');
    const currentTime = new Date('2024-01-15T10:20:00.000Z'); // 20 minutes later

    jest.spyOn(global, 'Date').mockImplementation(() => currentTime);

    const session = createTestSession({
      analytics: {
        ...createTestSession().analytics,
        stepTimestamps: {
          ...createTestSession().analytics.stepTimestamps,
          'welcome': [stepStartTime],
        },
      },
    });

    expect(getCurrentStepDurationMinutes(session)).toBe(20);

    jest.restoreAllMocks();
  });

  it('should return 0 for step with no timestamps', () => {
    const session = createTestSession({
      currentStep: 'business',
      analytics: {
        ...createTestSession().analytics,
        stepTimestamps: {
          ...createTestSession().analytics.stepTimestamps,
          'business': [], // No timestamps
        },
      },
    });

    expect(getCurrentStepDurationMinutes(session)).toBe(0);
  });

  it('should use most recent timestamp for step with multiple entries', () => {
    const firstEntry = new Date('2024-01-15T10:00:00.000Z');
    const secondEntry = new Date('2024-01-15T10:10:00.000Z');
    const currentTime = new Date('2024-01-15T10:25:00.000Z'); // 15 minutes after second entry

    jest.spyOn(global, 'Date').mockImplementation(() => currentTime);

    const session = createTestSession({
      analytics: {
        ...createTestSession().analytics,
        stepTimestamps: {
          ...createTestSession().analytics.stepTimestamps,
          'welcome': [firstEntry, secondEntry],
        },
      },
    });

    expect(getCurrentStepDurationMinutes(session)).toBe(15);

    jest.restoreAllMocks();
  });
});

// =============================================================================
// ANALYTICS SUMMARY TESTS
// =============================================================================

describe('generateAnalyticsSummary', () => {
  let fixedDate: Date;
  let baseSession: OnboardingSession;

  beforeEach(() => {
    fixedDate = mockDate('2024-01-15T10:30:00.000Z'); // 30 minutes after creation
    baseSession = createTestSession({
      startedAt: new Date('2024-01-15T10:00:00.000Z'),
      currentStep: 'business',
      completedSteps: ['welcome'],
      status: 'in-progress',
      expiresAt: new Date('2024-01-16T10:00:00.000Z'), // 24 hours from start
      analytics: {
        ...createTestSession().analytics,
        stepTimestamps: {
          ...createTestSession().analytics.stepTimestamps,
          'welcome': [new Date('2024-01-15T10:00:00.000Z')],
          'business': [new Date('2024-01-15T10:15:00.000Z')], // Started business step 15 mins in
        },
        stepDurations: {
          ...createTestSession().analytics.stepDurations,
          'welcome': 15 * 60 * 1000, // 15 minutes in ms
        },
        conversionSource: 'google-ads',
        abTestVariants: {
          'hero_cta': 'variant_a',
          'pricing': 'variant_b',
        },
        deviceInfo: {
          userAgent: 'Mozilla/5.0',
          ip: '192.168.1.1',
          country: 'United States',
          city: 'San Francisco',
        },
      },
    });
  });

  afterEach(() => {
    restoreDate();
  });

  it('should generate comprehensive analytics summary', () => {
    const summary = generateAnalyticsSummary(baseSession);

    expect(summary.sessionId).toBe(baseSession.id);
    expect(summary.status).toBe('in-progress');
    expect(summary.progress).toBe(17); // 1/6 steps completed
    expect(summary.currentStep).toBe('business');
    expect(summary.completedSteps).toBe(1);
    expect(summary.totalSteps).toBe(6);
    expect(summary.totalDurationMinutes).toBe(30);
    expect(summary.currentStepDurationMinutes).toBe(15); // 30 - 15 = 15 minutes in current step
    expect(summary.averageStepDuration).toBe(15); // Only welcome step has duration
    expect(summary.conversionSource).toBe('google-ads');
    expect(summary.abTestVariants).toEqual({
      'hero_cta': 'variant_a',
      'pricing': 'variant_b',
    });
    expect(summary.deviceInfo).toEqual({
      userAgent: 'Mozilla/5.0',
      ip: '192.168.1.1',
      country: 'United States',
      city: 'San Francisco',
    });
    expect(summary.isExpired).toBe(false);
    expect(summary.timeToExpiry).toBe(1410); // 23.5 hours in minutes
  });

  it('should handle completed session', () => {
    const completedSession = {
      ...baseSession,
      status: 'completed' as OnboardingStatus,
      completedAt: new Date('2024-01-15T11:00:00.000Z'), // 1 hour total
      completedSteps: ['welcome', 'business', 'integration', 'verification', 'bot-setup', 'testing'] as OnboardingStep[],
    };

    const summary = generateAnalyticsSummary(completedSession);

    expect(summary.status).toBe('completed');
    expect(summary.progress).toBe(100);
    expect(summary.completedSteps).toBe(6);
    expect(summary.totalDurationMinutes).toBe(60); // Using completed time
  });

  it('should handle abandoned session', () => {
    const abandonedSession = {
      ...baseSession,
      status: 'abandoned' as OnboardingStatus,
      analytics: {
        ...baseSession.analytics,
        abandonedAt: new Date('2024-01-15T10:20:00.000Z'), // Abandoned after 20 minutes
      },
    };

    const summary = generateAnalyticsSummary(abandonedSession);

    expect(summary.status).toBe('abandoned');
    expect(summary.totalDurationMinutes).toBe(20); // Using abandoned time
  });

  it('should handle expired session', () => {
    const expiredSession = {
      ...baseSession,
      expiresAt: new Date('2024-01-15T10:20:00.000Z'), // Expired 10 minutes ago
    };

    const summary = generateAnalyticsSummary(expiredSession);

    expect(summary.isExpired).toBe(true);
    expect(summary.timeToExpiry).toBe(0);
  });

  it('should handle session with no step durations', () => {
    const sessionNoStepDurations = {
      ...baseSession,
      analytics: {
        ...baseSession.analytics,
        stepDurations: {
          'welcome': 0,
          'business': 0,
          'integration': 0,
          'verification': 0,
          'bot-setup': 0,
          'testing': 0,
          'complete': 0,
        },
      },
    };

    const summary = generateAnalyticsSummary(sessionNoStepDurations);

    expect(summary.averageStepDuration).toBe(0);
  });
});
