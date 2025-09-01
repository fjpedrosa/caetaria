/**
 * Start Onboarding Use Case Tests
 * Application layer - Unit tests for starting onboarding process
 * Coverage requirement: 90%
 */

import { createEmail } from '../../../../marketing/domain/value-objects/email';
import { failure, isSuccess,success } from '../../../../shared/domain/value-objects/result';
import { createOnboardingSession, OnboardingSession } from '../../../domain/entities/onboarding-session';
import { OnboardingRepository } from '../../ports/onboarding-repository';
import {
  createStartOnboardingUseCase,
  StartOnboardingCommand,
  StartOnboardingDependencies,
  StartOnboardingUseCase,
} from '../start-onboarding';

// =============================================================================
// MOCK SETUP
// =============================================================================

const createMockRepository = (): jest.Mocked<OnboardingRepository> => ({
  save: jest.fn(),
  findById: jest.fn(),
  findByUserEmail: jest.fn(),
  findByRecoveryToken: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findByStatus: jest.fn(),
  findAbandonedSessions: jest.fn(),
  findExpiredSessions: jest.fn(),
  findSessionsInDateRange: jest.fn(),
  getAnalyticsSummary: jest.fn(),
  cleanupExpiredSessions: jest.fn(),
  getActiveSessionCount: jest.fn(),
});

const createValidCommand = (overrides: Partial<StartOnboardingCommand> = {}): StartOnboardingCommand => ({
  userEmail: 'test@example.com',
  conversionSource: 'website-form',
  deviceInfo: {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    ip: '192.168.1.1',
    country: 'United States',
    city: 'San Francisco',
  },
  abTestVariants: {
    hero_cta: 'variant_a',
    pricing: 'variant_b',
  },
  ...overrides,
});

const createTestSession = (): OnboardingSession => {
  return createOnboardingSession(
    createEmail('test@example.com'),
    {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      ip: '192.168.1.1',
      country: 'United States',
      city: 'San Francisco',
    },
    'website-form'
  );
};

// =============================================================================
// FUNCTIONAL USE CASE TESTS
// =============================================================================

describe('createStartOnboardingUseCase', () => {
  let mockRepository: jest.Mocked<OnboardingRepository>;
  let dependencies: StartOnboardingDependencies;
  let useCase: ReturnType<typeof createStartOnboardingUseCase>;

  beforeEach(() => {
    mockRepository = createMockRepository();
    dependencies = { onboardingRepository: mockRepository };
    useCase = createStartOnboardingUseCase(dependencies);
  });

  describe('successful onboarding start', () => {
    it('should create new onboarding session for new user', async () => {
      const command = createValidCommand();
      const expectedSession = createTestSession();

      // Mock no existing session
      mockRepository.findByUserEmail.mockResolvedValue(success(null));
      // Mock successful save
      mockRepository.save.mockResolvedValue(success(expectedSession));

      const result = await useCase.execute(command);

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data.userEmail).toEqual(createEmail('test@example.com'));
        expect(result.data.currentStep).toBe('welcome');
        expect(result.data.status).toBe('in-progress');
        expect(result.data.analytics.conversionSource).toBe('website-form');
      }

      expect(mockRepository.findByUserEmail).toHaveBeenCalledWith(createEmail('test@example.com'));
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should return existing session if user has ongoing onboarding', async () => {
      const command = createValidCommand();
      const existingSession = { ...createTestSession(), status: 'in-progress' as const };

      // Mock existing in-progress session
      mockRepository.findByUserEmail.mockResolvedValue(success(existingSession));

      const result = await useCase.execute(command);

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toBe(existingSession);
      }

      expect(mockRepository.findByUserEmail).toHaveBeenCalledWith(createEmail('test@example.com'));
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should create new session if existing session is completed', async () => {
      const command = createValidCommand();
      const completedSession = { ...createTestSession(), status: 'completed' as const };
      const newSession = createTestSession();

      // Mock existing completed session
      mockRepository.findByUserEmail.mockResolvedValue(success(completedSession));
      // Mock successful save of new session
      mockRepository.save.mockResolvedValue(success(newSession));

      const result = await useCase.execute(command);

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toBe(newSession);
      }

      expect(mockRepository.findByUserEmail).toHaveBeenCalledWith(createEmail('test@example.com'));
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should create new session if existing session is abandoned', async () => {
      const command = createValidCommand();
      const abandonedSession = { ...createTestSession(), status: 'abandoned' as const };
      const newSession = createTestSession();

      // Mock existing abandoned session
      mockRepository.findByUserEmail.mockResolvedValue(success(abandonedSession));
      // Mock successful save of new session
      mockRepository.save.mockResolvedValue(success(newSession));

      const result = await useCase.execute(command);

      expect(isSuccess(result)).toBe(true);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should apply A/B test variants when provided', async () => {
      const command = createValidCommand({
        abTestVariants: {
          hero_cta: 'variant_a',
          pricing_display: 'variant_c',
          form_layout: 'variant_b',
        },
      });
      const savedSession = createTestSession();

      mockRepository.findByUserEmail.mockResolvedValue(success(null));
      mockRepository.save.mockResolvedValue(success(savedSession));

      const result = await useCase.execute(command);

      expect(isSuccess(result)).toBe(true);
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          analytics: expect.objectContaining({
            abTestVariants: {
              hero_cta: 'variant_a',
              pricing_display: 'variant_c',
              form_layout: 'variant_b',
            },
          }),
        })
      );
    });

    it('should handle device info correctly', async () => {
      const command = createValidCommand({
        deviceInfo: {
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7)',
          ip: '192.168.0.100',
          country: 'Canada',
          city: 'Vancouver',
        },
      });
      const savedSession = createTestSession();

      mockRepository.findByUserEmail.mockResolvedValue(success(null));
      mockRepository.save.mockResolvedValue(success(savedSession));

      const result = await useCase.execute(command);

      expect(isSuccess(result)).toBe(true);
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          analytics: expect.objectContaining({
            deviceInfo: {
              userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7)',
              ip: '192.168.0.100',
              country: 'Canada',
              city: 'Vancouver',
            },
          }),
        })
      );
    });

    it('should handle conversion source correctly', async () => {
      const command = createValidCommand({
        conversionSource: 'google-ads',
      });
      const savedSession = createTestSession();

      mockRepository.findByUserEmail.mockResolvedValue(success(null));
      mockRepository.save.mockResolvedValue(success(savedSession));

      const result = await useCase.execute(command);

      expect(isSuccess(result)).toBe(true);
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          analytics: expect.objectContaining({
            conversionSource: 'google-ads',
          }),
        })
      );
    });

    it('should work with minimal command data', async () => {
      const command: StartOnboardingCommand = {
        userEmail: 'minimal@example.com',
      };
      const savedSession = createTestSession();

      mockRepository.findByUserEmail.mockResolvedValue(success(null));
      mockRepository.save.mockResolvedValue(success(savedSession));

      const result = await useCase.execute(command);

      expect(isSuccess(result)).toBe(true);
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userEmail: createEmail('minimal@example.com'),
          analytics: expect.objectContaining({
            deviceInfo: undefined,
            conversionSource: undefined,
            abTestVariants: {},
          }),
        })
      );
    });
  });

  describe('email validation', () => {
    it('should fail for invalid email format', async () => {
      const command = createValidCommand({
        userEmail: 'invalid-email',
      });

      const result = await useCase.execute(command);

      expect(isSuccess(result)).toBe(false);
      if (!isSuccess(result)) {
        expect(result.error.message).toContain('Invalid email');
      }

      expect(mockRepository.findByUserEmail).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should fail for empty email', async () => {
      const command = createValidCommand({
        userEmail: '',
      });

      const result = await useCase.execute(command);

      expect(isSuccess(result)).toBe(false);
      if (!isSuccess(result)) {
        expect(result.error.message).toContain('Invalid email');
      }
    });

    it('should handle email validation error gracefully', async () => {
      const command = createValidCommand({
        userEmail: 'invalid@',
      });

      const result = await useCase.execute(command);

      expect(isSuccess(result)).toBe(false);
      expect(mockRepository.findByUserEmail).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('repository error handling', () => {
    it('should handle findByUserEmail repository error', async () => {
      const command = createValidCommand();

      mockRepository.findByUserEmail.mockResolvedValue(failure(new Error('Database error')));

      const result = await useCase.execute(command);

      expect(isSuccess(result)).toBe(false);
      if (!isSuccess(result)) {
        expect(result.error.message).toBe('Failed to check existing sessions');
      }

      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should handle save repository error', async () => {
      const command = createValidCommand();

      mockRepository.findByUserEmail.mockResolvedValue(success(null));
      mockRepository.save.mockResolvedValue(failure(new Error('Save failed')));

      const result = await useCase.execute(command);

      expect(isSuccess(result)).toBe(false);
      if (!isSuccess(result)) {
        expect(result.error.message).toBe('Failed to save onboarding session');
      }
    });

    it('should handle repository throwing unexpected errors', async () => {
      const command = createValidCommand();

      mockRepository.findByUserEmail.mockRejectedValue(new Error('Unexpected error'));

      const result = await useCase.execute(command);

      expect(isSuccess(result)).toBe(false);
      if (!isSuccess(result)) {
        expect(result.error.message).toBe('Unexpected error');
      }
    });

    it('should handle non-Error exceptions', async () => {
      const command = createValidCommand();

      mockRepository.findByUserEmail.mockRejectedValue('String error');

      const result = await useCase.execute(command);

      expect(isSuccess(result)).toBe(false);
      if (!isSuccess(result)) {
        expect(result.error.message).toBe('Unknown error starting onboarding');
      }
    });
  });

  describe('edge cases and comprehensive scenarios', () => {
    it('should handle paused session correctly', async () => {
      const command = createValidCommand();
      const pausedSession = { ...createTestSession(), status: 'paused' as const };
      const newSession = createTestSession();

      mockRepository.findByUserEmail.mockResolvedValue(success(pausedSession));
      mockRepository.save.mockResolvedValue(success(newSession));

      const result = await useCase.execute(command);

      expect(isSuccess(result)).toBe(true);
      // Paused session should trigger creation of new session
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should preserve session properties correctly', async () => {
      const command = createValidCommand({
        userEmail: 'preserve@test.com',
        conversionSource: 'facebook-ads',
        deviceInfo: {
          userAgent: 'Custom User Agent',
          ip: '10.0.0.1',
          country: 'United Kingdom',
          city: 'London',
        },
        abTestVariants: {
          test1: 'variant1',
          test2: 'variant2',
        },
      });
      const savedSession = createTestSession();

      mockRepository.findByUserEmail.mockResolvedValue(success(null));
      mockRepository.save.mockResolvedValue(success(savedSession));

      const result = await useCase.execute(command);

      expect(isSuccess(result)).toBe(true);
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userEmail: createEmail('preserve@test.com'),
          currentStep: 'welcome',
          status: 'in-progress',
          completedSteps: [],
          analytics: expect.objectContaining({
            conversionSource: 'facebook-ads',
            deviceInfo: {
              userAgent: 'Custom User Agent',
              ip: '10.0.0.1',
              country: 'United Kingdom',
              city: 'London',
            },
            abTestVariants: {
              test1: 'variant1',
              test2: 'variant2',
            },
          }),
        })
      );
    });

    it('should create session with proper initial state', async () => {
      const command = createValidCommand();
      const savedSession = createTestSession();

      mockRepository.findByUserEmail.mockResolvedValue(success(null));
      mockRepository.save.mockResolvedValue(success(savedSession));

      const result = await useCase.execute(command);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          currentStep: 'welcome',
          status: 'in-progress',
          completedSteps: [],
          stepData: {},
          metadata: {},
          recoveryToken: expect.any(String),
          expiresAt: expect.any(Date),
          analytics: expect.objectContaining({
            startedAt: expect.any(Date),
            lastActivityAt: expect.any(Date),
            stepTimestamps: expect.objectContaining({
              welcome: expect.any(Array),
            }),
            stepDurations: expect.any(Object),
          }),
        })
      );
    });
  });
});

// =============================================================================
// LEGACY CLASS-BASED USE CASE TESTS
// =============================================================================

describe('StartOnboardingUseCase (Legacy Class)', () => {
  let mockRepository: jest.Mocked<OnboardingRepository>;
  let useCase: StartOnboardingUseCase;

  beforeEach(() => {
    mockRepository = createMockRepository();
    useCase = new StartOnboardingUseCase(mockRepository);
  });

  it('should delegate to functional use case implementation', async () => {
    const command = createValidCommand();
    const expectedSession = createTestSession();

    mockRepository.findByUserEmail.mockResolvedValue(success(null));
    mockRepository.save.mockResolvedValue(success(expectedSession));

    const result = await useCase.execute(command);

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data.userEmail).toEqual(createEmail('test@example.com'));
      expect(result.data.currentStep).toBe('welcome');
      expect(result.data.status).toBe('in-progress');
    }

    expect(mockRepository.findByUserEmail).toHaveBeenCalledWith(createEmail('test@example.com'));
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should handle errors the same way as functional implementation', async () => {
    const command = createValidCommand({
      userEmail: 'invalid-email',
    });

    const result = await useCase.execute(command);

    expect(isSuccess(result)).toBe(false);
    if (!isSuccess(result)) {
      expect(result.error.message).toContain('Invalid email');
    }
  });
});

// =============================================================================
// PERFORMANCE AND STRESS TESTS
// =============================================================================

describe('Start Onboarding Performance Tests', () => {
  let mockRepository: jest.Mocked<OnboardingRepository>;
  let useCase: ReturnType<typeof createStartOnboardingUseCase>;

  beforeEach(() => {
    mockRepository = createMockRepository();
    useCase = createStartOnboardingUseCase({ onboardingRepository: mockRepository });
  });

  it('should handle concurrent onboarding requests', async () => {
    const commands = Array.from({ length: 10 }, (_, i) =>
      createValidCommand({ userEmail: `user${i}@example.com` })
    );
    const sessions = commands.map(() => createTestSession());

    // Mock repository responses
    mockRepository.findByUserEmail.mockResolvedValue(success(null));
    sessions.forEach((session, i) => {
      if (i === 0) {
        mockRepository.save.mockResolvedValueOnce(success(session));
      } else {
        mockRepository.save.mockResolvedValueOnce(success(session));
      }
    });

    // Execute all commands concurrently
    const results = await Promise.all(
      commands.map(command => useCase.execute(command))
    );

    // All should succeed
    results.forEach(result => {
      expect(isSuccess(result)).toBe(true);
    });

    expect(mockRepository.findByUserEmail).toHaveBeenCalledTimes(10);
    expect(mockRepository.save).toHaveBeenCalledTimes(10);
  });

  it('should handle large A/B test variant data', async () => {
    const largeVariants: Record<string, string> = {};
    for (let i = 0; i < 100; i++) {
      largeVariants[`test_${i}`] = `variant_${i % 5}`;
    }

    const command = createValidCommand({
      abTestVariants: largeVariants,
    });
    const savedSession = createTestSession();

    mockRepository.findByUserEmail.mockResolvedValue(success(null));
    mockRepository.save.mockResolvedValue(success(savedSession));

    const result = await useCase.execute(command);

    expect(isSuccess(result)).toBe(true);
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        analytics: expect.objectContaining({
          abTestVariants: largeVariants,
        }),
      })
    );
  });

  it('should handle rapid successive calls for same user', async () => {
    const command = createValidCommand();
    const existingSession = { ...createTestSession(), status: 'in-progress' as const };

    mockRepository.findByUserEmail.mockResolvedValue(success(existingSession));

    // Simulate rapid successive calls
    const results = await Promise.all([
      useCase.execute(command),
      useCase.execute(command),
      useCase.execute(command),
    ]);

    // All should return the same existing session
    results.forEach(result => {
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toBe(existingSession);
      }
    });

    expect(mockRepository.findByUserEmail).toHaveBeenCalledTimes(3);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });
});
