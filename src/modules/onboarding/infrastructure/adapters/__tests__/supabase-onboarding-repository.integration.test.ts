/**
 * Supabase Onboarding Repository Integration Tests
 * Infrastructure layer - Integration tests with mocked Supabase client
 * Coverage requirement: 85%
 */

import { createMockResponse, createTestSupabaseClient, TEST_CONFIG } from '../../../../__mocks__/supabase/setup';
import { createEmail } from '../../../../marketing/domain/value-objects/email';
import { isSuccess } from '../../../../shared/domain/value-objects/result';
import {
  abandonOnboarding,
  advanceOnboardingStep,
  createOnboardingSession,
  OnboardingSession,
  OnboardingSessionId,
  OnboardingStatus,
} from '../../../domain/entities/onboarding-session';
import { SupabaseOnboardingRepository } from '../supabase-onboarding-repository';

// =============================================================================
// MOCK SETUP
// =============================================================================

// Mock the Supabase client module for unit tests
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => createTestSupabaseClient('unit')),
}));

// Helper to create test sessions
const createTestSession = (overrides: Partial<OnboardingSession> = {}): OnboardingSession => {
  const baseSession = createOnboardingSession(
    createEmail('test@example.com'),
    {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      ip: '192.168.1.1',
      country: 'United States',
      city: 'San Francisco',
    },
    'website-form'
  );

  return { ...baseSession, ...overrides };
};

// =============================================================================
// REPOSITORY INITIALIZATION TESTS
// =============================================================================

describe('SupabaseOnboardingRepository - Initialization', () => {
  beforeEach(() => {
    // Clear environment variables
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  it('should initialize with provided credentials', () => {
    expect(() => {
      new SupabaseOnboardingRepository(
        'https://test.supabase.co',
        'test-anon-key'
      );
    }).not.toThrow();
  });

  it('should initialize with environment variables', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://env.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'env-anon-key';

    expect(() => {
      new SupabaseOnboardingRepository();
    }).not.toThrow();
  });

  it('should throw error if no credentials provided', () => {
    expect(() => {
      new SupabaseOnboardingRepository();
    }).toThrow('Supabase URL and key are required');
  });

  it('should throw error if only URL provided', () => {
    expect(() => {
      new SupabaseOnboardingRepository('https://test.supabase.co');
    }).toThrow('Supabase URL and key are required');
  });
});

// =============================================================================
// SAVE OPERATION TESTS
// =============================================================================

describe('SupabaseOnboardingRepository - Save Operations', () => {
  let repository: SupabaseOnboardingRepository;
  let mockSupabase: any;

  beforeEach(() => {
    repository = new SupabaseOnboardingRepository(
      'https://test.supabase.co',
      'test-anon-key'
    );
    mockSupabase = (repository as any).supabase;
  });

  describe('save', () => {
    it('should save new onboarding session successfully', async () => {
      const session = createTestSession();
      const expectedRecord = {
        id: session.id,
        user_email: 'test@example.com',
        current_step: 'welcome',
        status: 'in-progress',
        completed_steps: [],
        started_at: session.startedAt.toISOString(),
        last_activity_at: session.lastActivityAt.toISOString(),
        completed_at: null,
        step_data: {},
        metadata: {},
        analytics: session.analytics,
        recovery_token: session.recoveryToken,
        expires_at: session.expiresAt.toISOString(),
        created_at: '2024-01-15T10:00:00.000Z',
        updated_at: '2024-01-15T10:00:00.000Z',
      };

      mockSupabase.from().insert.mockReturnThis();
      mockSupabase.from().select.mockReturnThis();
      mockSupabase.from().single.mockResolvedValue(
        createMockResponse.success(expectedRecord)
      );

      const result = await repository.save(session);

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data.id).toBe(session.id);
        expect(result.data.userEmail.getValue()).toBe('test@example.com');
        expect(result.data.currentStep).toBe('welcome');
      }

      expect(mockSupabase.from).toHaveBeenCalledWith('onboarding_sessions');
      expect(mockSupabase.from().insert).toHaveBeenCalledWith([expect.objectContaining({
        id: session.id,
        user_email: 'test@example.com',
        current_step: 'welcome',
        status: 'in-progress',
      })]);
    });

    it('should handle save error from Supabase', async () => {
      const session = createTestSession();

      mockSupabase.from().insert.mockReturnThis();
      mockSupabase.from().select.mockReturnThis();
      mockSupabase.from().single.mockResolvedValue(
        createMockResponse.error('Duplicate key violation', 'unique_violation')
      );

      const result = await repository.save(session);

      expect(isSuccess(result)).toBe(false);
      if (!isSuccess(result)) {
        expect(result.error.message).toContain('Failed to save onboarding session');
      }
    });

    it('should handle unexpected save errors', async () => {
      const session = createTestSession();

      mockSupabase.from.mockImplementation(() => {
        throw new Error('Connection failed');
      });

      const result = await repository.save(session);

      expect(isSuccess(result)).toBe(false);
      if (!isSuccess(result)) {
        expect(result.error.message).toBe('Connection failed');
      }
    });

    it('should transform session data correctly', async () => {
      const session = createTestSession({
        currentStep: 'business',
        completedSteps: ['welcome'],
        stepData: { businessInfo: { companyName: 'Test Co' } },
        metadata: { source: 'test' },
      });

      mockSupabase.from().insert.mockReturnThis();
      mockSupabase.from().select.mockReturnThis();
      mockSupabase.from().single.mockResolvedValue(
        createMockResponse.success({
          id: session.id,
          user_email: session.userEmail.getValue(),
          current_step: session.currentStep,
          status: session.status,
          completed_steps: session.completedSteps,
          step_data: session.stepData,
          metadata: session.metadata,
          analytics: session.analytics,
          started_at: session.startedAt.toISOString(),
          last_activity_at: session.lastActivityAt.toISOString(),
          completed_at: null,
          recovery_token: session.recoveryToken,
          expires_at: session.expiresAt.toISOString(),
          created_at: '2024-01-15T10:00:00.000Z',
          updated_at: '2024-01-15T10:00:00.000Z',
        })
      );

      const result = await repository.save(session);

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data.currentStep).toBe('business');
        expect(result.data.completedSteps).toEqual(['welcome']);
        expect(result.data.stepData).toEqual({ businessInfo: { companyName: 'Test Co' } });
        expect(result.data.metadata).toEqual({ source: 'test' });
      }
    });
  });
});

// =============================================================================
// FIND OPERATIONS TESTS
// =============================================================================

describe('SupabaseOnboardingRepository - Find Operations', () => {
  let repository: SupabaseOnboardingRepository;
  let mockSupabase: any;

  beforeEach(() => {
    repository = new SupabaseOnboardingRepository(
      'https://test.supabase.co',
      'test-anon-key'
    );
    mockSupabase = (repository as any).supabase;
  });

  describe('findById', () => {
    it('should find session by ID successfully', async () => {
      const sessionId = 'test-session-id' as OnboardingSessionId;
      const sessionRecord = {
        id: sessionId,
        user_email: 'test@example.com',
        current_step: 'business',
        status: 'in-progress',
        completed_steps: ['welcome'],
        started_at: '2024-01-15T10:00:00.000Z',
        last_activity_at: '2024-01-15T10:05:00.000Z',
        completed_at: null,
        step_data: { businessInfo: { companyName: 'Test Co' } },
        metadata: { source: 'test' },
        analytics: {
          startedAt: new Date('2024-01-15T10:00:00.000Z'),
          lastActivityAt: new Date('2024-01-15T10:05:00.000Z'),
          stepTimestamps: { welcome: [new Date('2024-01-15T10:00:00.000Z')] },
          stepDurations: { welcome: 300000 },
          deviceInfo: { userAgent: 'Test Agent', ip: '127.0.0.1' },
          abTestVariants: {},
          conversionSource: 'test',
        },
        recovery_token: 'recovery-token-123',
        expires_at: '2024-01-16T10:00:00.000Z',
        created_at: '2024-01-15T10:00:00.000Z',
        updated_at: '2024-01-15T10:05:00.000Z',
      };

      mockSupabase.from().select.mockReturnThis();
      mockSupabase.from().eq.mockReturnThis();
      mockSupabase.from().single.mockResolvedValue(
        createMockResponse.success(sessionRecord)
      );

      const result = await repository.findById(sessionId);

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).not.toBeNull();
        expect(result.data?.id).toBe(sessionId);
        expect(result.data?.userEmail.getValue()).toBe('test@example.com');
        expect(result.data?.currentStep).toBe('business');
        expect(result.data?.completedSteps).toEqual(['welcome']);
      }

      expect(mockSupabase.from).toHaveBeenCalledWith('onboarding_sessions');
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('id', sessionId);
    });

    it('should return null when session not found', async () => {
      const sessionId = 'non-existent-id' as OnboardingSessionId;

      mockSupabase.from().select.mockReturnThis();
      mockSupabase.from().eq.mockReturnThis();
      mockSupabase.from().single.mockResolvedValue(
        createMockResponse.error('No rows returned', 'PGRST116')
      );

      const result = await repository.findById(sessionId);

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toBeNull();
      }
    });

    it('should handle database error', async () => {
      const sessionId = 'error-id' as OnboardingSessionId;

      mockSupabase.from().select.mockReturnThis();
      mockSupabase.from().eq.mockReturnThis();
      mockSupabase.from().single.mockResolvedValue(
        createMockResponse.error('Database connection failed', 'DB_ERROR')
      );

      const result = await repository.findById(sessionId);

      expect(isSuccess(result)).toBe(false);
      if (!isSuccess(result)) {
        expect(result.error.message).toContain('Failed to find session');
      }
    });
  });

  describe('findByUserEmail', () => {
    it('should find active session by user email', async () => {
      const email = createEmail('active@example.com');
      const sessionRecord = {
        id: 'active-session-id',
        user_email: 'active@example.com',
        current_step: 'integration',
        status: 'in-progress',
        completed_steps: ['welcome', 'business'],
        started_at: '2024-01-15T10:00:00.000Z',
        last_activity_at: '2024-01-15T10:15:00.000Z',
        completed_at: null,
        step_data: {},
        metadata: {},
        analytics: {
          startedAt: new Date('2024-01-15T10:00:00.000Z'),
          lastActivityAt: new Date('2024-01-15T10:15:00.000Z'),
          stepTimestamps: {},
          stepDurations: {},
          deviceInfo: undefined,
          abTestVariants: {},
        },
        recovery_token: 'recovery-123',
        expires_at: '2024-01-16T10:00:00.000Z',
        created_at: '2024-01-15T10:00:00.000Z',
        updated_at: '2024-01-15T10:15:00.000Z',
      };

      mockSupabase.from().select.mockReturnThis();
      mockSupabase.from().eq.mockReturnThis();
      mockSupabase.from().order.mockReturnThis();
      mockSupabase.from().limit.mockReturnThis();
      mockSupabase.from().single.mockResolvedValue(
        createMockResponse.success(sessionRecord)
      );

      const result = await repository.findByUserEmail(email);

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).not.toBeNull();
        expect(result.data?.userEmail.getValue()).toBe('active@example.com');
        expect(result.data?.currentStep).toBe('integration');
        expect(result.data?.status).toBe('in-progress');
      }

      expect(mockSupabase.from().eq).toHaveBeenCalledWith('user_email', 'active@example.com');
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('status', 'in-progress');
    });

    it('should return null when no active session found', async () => {
      const email = createEmail('inactive@example.com');

      mockSupabase.from().select.mockReturnThis();
      mockSupabase.from().eq.mockReturnThis();
      mockSupabase.from().order.mockReturnThis();
      mockSupabase.from().limit.mockReturnThis();
      mockSupabase.from().single.mockResolvedValue(
        createMockResponse.error('No rows returned', 'PGRST116')
      );

      const result = await repository.findByUserEmail(email);

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toBeNull();
      }
    });
  });

  describe('findByRecoveryToken', () => {
    it('should find session by recovery token', async () => {
      const token = 'recovery-token-123';
      const sessionRecord = {
        id: 'session-with-token',
        user_email: 'recovery@example.com',
        current_step: 'verification',
        status: 'paused',
        completed_steps: ['welcome', 'business', 'integration'],
        started_at: '2024-01-15T10:00:00.000Z',
        last_activity_at: '2024-01-15T10:30:00.000Z',
        completed_at: null,
        step_data: {},
        metadata: {},
        analytics: {
          startedAt: new Date('2024-01-15T10:00:00.000Z'),
          lastActivityAt: new Date('2024-01-15T10:30:00.000Z'),
          stepTimestamps: {},
          stepDurations: {},
          deviceInfo: undefined,
          abTestVariants: {},
        },
        recovery_token: token,
        expires_at: '2024-01-16T10:00:00.000Z',
        created_at: '2024-01-15T10:00:00.000Z',
        updated_at: '2024-01-15T10:30:00.000Z',
      };

      mockSupabase.from().select.mockReturnThis();
      mockSupabase.from().eq.mockReturnThis();
      mockSupabase.from().single.mockResolvedValue(
        createMockResponse.success(sessionRecord)
      );

      const result = await repository.findByRecoveryToken(token);

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).not.toBeNull();
        expect(result.data?.recoveryToken).toBe(token);
        expect(result.data?.status).toBe('paused');
      }

      expect(mockSupabase.from().eq).toHaveBeenCalledWith('recovery_token', token);
    });

    it('should return null when token not found', async () => {
      const token = 'invalid-token';

      mockSupabase.from().select.mockReturnThis();
      mockSupabase.from().eq.mockReturnThis();
      mockSupabase.from().single.mockResolvedValue(
        createMockResponse.error('No rows returned', 'PGRST116')
      );

      const result = await repository.findByRecoveryToken(token);

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toBeNull();
      }
    });
  });

  describe('findByStatus', () => {
    it('should find sessions by status', async () => {
      const status: OnboardingStatus = 'completed';
      const sessionRecords = [
        {
          id: 'completed-1',
          user_email: 'user1@example.com',
          current_step: 'complete',
          status: 'completed',
          completed_steps: ['welcome', 'business', 'integration', 'verification', 'bot-setup', 'testing'],
          started_at: '2024-01-15T10:00:00.000Z',
          last_activity_at: '2024-01-15T11:00:00.000Z',
          completed_at: '2024-01-15T11:00:00.000Z',
          step_data: {},
          metadata: {},
          analytics: {
            startedAt: new Date('2024-01-15T10:00:00.000Z'),
            lastActivityAt: new Date('2024-01-15T11:00:00.000Z'),
            completedAt: new Date('2024-01-15T11:00:00.000Z'),
            stepTimestamps: {},
            stepDurations: {},
            deviceInfo: undefined,
            abTestVariants: {},
          },
          recovery_token: null,
          expires_at: '2024-01-16T10:00:00.000Z',
          created_at: '2024-01-15T10:00:00.000Z',
          updated_at: '2024-01-15T11:00:00.000Z',
        },
        {
          id: 'completed-2',
          user_email: 'user2@example.com',
          current_step: 'complete',
          status: 'completed',
          completed_steps: ['welcome', 'business', 'integration', 'verification', 'bot-setup', 'testing'],
          started_at: '2024-01-15T09:00:00.000Z',
          last_activity_at: '2024-01-15T09:45:00.000Z',
          completed_at: '2024-01-15T09:45:00.000Z',
          step_data: {},
          metadata: {},
          analytics: {
            startedAt: new Date('2024-01-15T09:00:00.000Z'),
            lastActivityAt: new Date('2024-01-15T09:45:00.000Z'),
            completedAt: new Date('2024-01-15T09:45:00.000Z'),
            stepTimestamps: {},
            stepDurations: {},
            deviceInfo: undefined,
            abTestVariants: {},
          },
          recovery_token: null,
          expires_at: '2024-01-16T09:00:00.000Z',
          created_at: '2024-01-15T09:00:00.000Z',
          updated_at: '2024-01-15T09:45:00.000Z',
        },
      ];

      mockSupabase.from().select.mockReturnThis();
      mockSupabase.from().eq.mockReturnThis();
      mockSupabase.from().order.mockResolvedValue(
        createMockResponse.success(sessionRecords)
      );

      const result = await repository.findByStatus(status);

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toHaveLength(2);
        expect(result.data[0].status).toBe('completed');
        expect(result.data[1].status).toBe('completed');
      }

      expect(mockSupabase.from().eq).toHaveBeenCalledWith('status', status);
    });

    it('should return empty array when no sessions found', async () => {
      const status: OnboardingStatus = 'abandoned';

      mockSupabase.from().select.mockReturnThis();
      mockSupabase.from().eq.mockReturnThis();
      mockSupabase.from().order.mockResolvedValue(
        createMockResponse.success([])
      );

      const result = await repository.findByStatus(status);

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toHaveLength(0);
      }
    });
  });
});

// =============================================================================
// UPDATE AND DELETE OPERATIONS TESTS
// =============================================================================

describe('SupabaseOnboardingRepository - Update and Delete Operations', () => {
  let repository: SupabaseOnboardingRepository;
  let mockSupabase: any;

  beforeEach(() => {
    repository = new SupabaseOnboardingRepository(
      'https://test.supabase.co',
      'test-anon-key'
    );
    mockSupabase = (repository as any).supabase;
  });

  describe('update', () => {
    it('should update session successfully', async () => {
      const originalSession = createTestSession();
      const updatedSession = advanceOnboardingStep(originalSession, 'business', {
        businessInfo: { companyName: 'Updated Company' },
      });

      const updatedRecord = {
        id: updatedSession.id,
        user_email: updatedSession.userEmail.getValue(),
        current_step: updatedSession.currentStep,
        status: updatedSession.status,
        completed_steps: updatedSession.completedSteps,
        started_at: updatedSession.startedAt.toISOString(),
        last_activity_at: updatedSession.lastActivityAt.toISOString(),
        completed_at: null,
        step_data: updatedSession.stepData,
        metadata: updatedSession.metadata,
        analytics: updatedSession.analytics,
        recovery_token: updatedSession.recoveryToken,
        expires_at: updatedSession.expiresAt.toISOString(),
        created_at: '2024-01-15T10:00:00.000Z',
        updated_at: '2024-01-15T10:15:00.000Z',
      };

      mockSupabase.from().update.mockReturnThis();
      mockSupabase.from().eq.mockReturnThis();
      mockSupabase.from().select.mockReturnThis();
      mockSupabase.from().single.mockResolvedValue(
        createMockResponse.success(updatedRecord)
      );

      const result = await repository.update(updatedSession);

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data.currentStep).toBe('business');
        expect(result.data.completedSteps).toContain('welcome');
        expect(result.data.stepData).toEqual({
          businessInfo: { companyName: 'Updated Company' },
        });
      }

      expect(mockSupabase.from).toHaveBeenCalledWith('onboarding_sessions');
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('id', updatedSession.id);
      expect(mockSupabase.from().update).toHaveBeenCalledWith(
        expect.objectContaining({
          current_step: 'business',
          updated_at: expect.any(String),
        })
      );
    });

    it('should handle update error', async () => {
      const session = createTestSession();

      mockSupabase.from().update.mockReturnThis();
      mockSupabase.from().eq.mockReturnThis();
      mockSupabase.from().select.mockReturnThis();
      mockSupabase.from().single.mockResolvedValue(
        createMockResponse.error('Update failed', 'UPDATE_ERROR')
      );

      const result = await repository.update(session);

      expect(isSuccess(result)).toBe(false);
      if (!isSuccess(result)) {
        expect(result.error.message).toContain('Failed to update session');
      }
    });
  });

  describe('delete', () => {
    it('should delete session successfully', async () => {
      const sessionId = 'delete-me' as OnboardingSessionId;

      mockSupabase.from().delete.mockReturnThis();
      mockSupabase.from().eq.mockResolvedValue(
        createMockResponse.success(null)
      );

      const result = await repository.delete(sessionId);

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toBe(true);
      }

      expect(mockSupabase.from).toHaveBeenCalledWith('onboarding_sessions');
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('id', sessionId);
    });

    it('should handle delete error', async () => {
      const sessionId = 'error-delete' as OnboardingSessionId;

      mockSupabase.from().delete.mockReturnThis();
      mockSupabase.from().eq.mockResolvedValue(
        createMockResponse.error('Delete failed', 'DELETE_ERROR')
      );

      const result = await repository.delete(sessionId);

      expect(isSuccess(result)).toBe(false);
      if (!isSuccess(result)) {
        expect(result.error.message).toContain('Failed to delete session');
      }
    });
  });
});

// =============================================================================
// ANALYTICS AND SPECIALIZED QUERIES TESTS
// =============================================================================

describe('SupabaseOnboardingRepository - Analytics Operations', () => {
  let repository: SupabaseOnboardingRepository;
  let mockSupabase: any;

  beforeEach(() => {
    repository = new SupabaseOnboardingRepository(
      'https://test.supabase.co',
      'test-anon-key'
    );
    mockSupabase = (repository as any).supabase;
  });

  describe('findAbandonedSessions', () => {
    it('should find abandoned sessions older than specified time', async () => {
      const olderThanMinutes = 60; // 1 hour
      const abandonedSessions = [
        {
          id: 'abandoned-1',
          user_email: 'abandoned1@example.com',
          current_step: 'business',
          status: 'in-progress',
          completed_steps: ['welcome'],
          started_at: '2024-01-15T08:00:00.000Z',
          last_activity_at: '2024-01-15T08:30:00.000Z', // 1.5 hours ago
          completed_at: null,
          step_data: {},
          metadata: {},
          analytics: {
            startedAt: new Date('2024-01-15T08:00:00.000Z'),
            lastActivityAt: new Date('2024-01-15T08:30:00.000Z'),
            stepTimestamps: {},
            stepDurations: {},
            deviceInfo: undefined,
            abTestVariants: {},
          },
          recovery_token: 'recovery-abandoned-1',
          expires_at: '2024-01-16T08:00:00.000Z',
          created_at: '2024-01-15T08:00:00.000Z',
          updated_at: '2024-01-15T08:30:00.000Z',
        },
      ];

      mockSupabase.from().select.mockReturnThis();
      mockSupabase.from().eq.mockReturnThis();
      mockSupabase.from().lt.mockReturnThis();
      mockSupabase.from().order.mockResolvedValue(
        createMockResponse.success(abandonedSessions)
      );

      const result = await repository.findAbandonedSessions(olderThanMinutes);

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0].status).toBe('in-progress');
        expect(result.data[0].userEmail.getValue()).toBe('abandoned1@example.com');
      }

      expect(mockSupabase.from().eq).toHaveBeenCalledWith('status', 'in-progress');
      expect(mockSupabase.from().lt).toHaveBeenCalledWith('last_activity_at', expect.any(String));
    });
  });

  describe('findExpiredSessions', () => {
    it('should find expired sessions', async () => {
      const expiredSessions = [
        {
          id: 'expired-1',
          user_email: 'expired1@example.com',
          current_step: 'verification',
          status: 'in-progress',
          completed_steps: ['welcome', 'business', 'integration'],
          started_at: '2024-01-14T10:00:00.000Z',
          last_activity_at: '2024-01-14T12:00:00.000Z',
          completed_at: null,
          step_data: {},
          metadata: {},
          analytics: {
            startedAt: new Date('2024-01-14T10:00:00.000Z'),
            lastActivityAt: new Date('2024-01-14T12:00:00.000Z'),
            stepTimestamps: {},
            stepDurations: {},
            deviceInfo: undefined,
            abTestVariants: {},
          },
          recovery_token: 'recovery-expired-1',
          expires_at: '2024-01-15T09:00:00.000Z', // Expired
          created_at: '2024-01-14T10:00:00.000Z',
          updated_at: '2024-01-14T12:00:00.000Z',
        },
      ];

      mockSupabase.from().select.mockReturnThis();
      mockSupabase.from().lt.mockReturnThis();
      mockSupabase.from().in.mockReturnThis();
      mockSupabase.from().order.mockResolvedValue(
        createMockResponse.success(expiredSessions)
      );

      const result = await repository.findExpiredSessions();

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0].userEmail.getValue()).toBe('expired1@example.com');
      }

      expect(mockSupabase.from().lt).toHaveBeenCalledWith('expires_at', expect.any(String));
      expect(mockSupabase.from().in).toHaveBeenCalledWith('status', ['in-progress', 'paused']);
    });
  });

  describe('getAnalyticsSummary', () => {
    it('should calculate analytics summary correctly', async () => {
      const sessions = [
        // Completed session
        {
          id: 'analytics-completed',
          user_email: 'completed@example.com',
          current_step: 'complete',
          status: 'completed',
          completed_steps: ['welcome', 'business', 'integration', 'verification', 'bot-setup', 'testing'],
          started_at: '2024-01-15T10:00:00.000Z',
          last_activity_at: '2024-01-15T11:00:00.000Z',
          completed_at: '2024-01-15T11:00:00.000Z',
          step_data: {},
          metadata: {},
          analytics: {
            startedAt: new Date('2024-01-15T10:00:00.000Z'),
            lastActivityAt: new Date('2024-01-15T11:00:00.000Z'),
            completedAt: new Date('2024-01-15T11:00:00.000Z'),
            stepTimestamps: {},
            stepDurations: {},
            deviceInfo: undefined,
            abTestVariants: {},
            conversionSource: 'google-ads',
          },
          recovery_token: null,
          expires_at: '2024-01-16T10:00:00.000Z',
          created_at: '2024-01-15T10:00:00.000Z',
          updated_at: '2024-01-15T11:00:00.000Z',
        },
        // Abandoned session
        {
          id: 'analytics-abandoned',
          user_email: 'abandoned@example.com',
          current_step: 'business',
          status: 'abandoned',
          completed_steps: ['welcome'],
          started_at: '2024-01-15T09:00:00.000Z',
          last_activity_at: '2024-01-15T09:15:00.000Z',
          completed_at: null,
          step_data: {},
          metadata: {},
          analytics: {
            startedAt: new Date('2024-01-15T09:00:00.000Z'),
            lastActivityAt: new Date('2024-01-15T09:15:00.000Z'),
            abandonedAt: new Date('2024-01-15T09:15:00.000Z'),
            abandonmentReason: 'form_complexity',
            stepTimestamps: {},
            stepDurations: {},
            deviceInfo: undefined,
            abTestVariants: {},
            conversionSource: 'facebook-ads',
          },
          recovery_token: 'recovery-abandoned',
          expires_at: '2024-01-16T09:00:00.000Z',
          created_at: '2024-01-15T09:00:00.000Z',
          updated_at: '2024-01-15T09:15:00.000Z',
        },
        // In-progress session
        {
          id: 'analytics-progress',
          user_email: 'progress@example.com',
          current_step: 'integration',
          status: 'in-progress',
          completed_steps: ['welcome', 'business'],
          started_at: '2024-01-15T11:00:00.000Z',
          last_activity_at: '2024-01-15T11:30:00.000Z',
          completed_at: null,
          step_data: {},
          metadata: {},
          analytics: {
            startedAt: new Date('2024-01-15T11:00:00.000Z'),
            lastActivityAt: new Date('2024-01-15T11:30:00.000Z'),
            stepTimestamps: {},
            stepDurations: {},
            deviceInfo: undefined,
            abTestVariants: {},
            conversionSource: 'direct',
          },
          recovery_token: 'recovery-progress',
          expires_at: '2024-01-16T11:00:00.000Z',
          created_at: '2024-01-15T11:00:00.000Z',
          updated_at: '2024-01-15T11:30:00.000Z',
        },
      ];

      mockSupabase.from().select.mockResolvedValue(
        createMockResponse.success(sessions)
      );

      const result = await repository.getAnalyticsSummary();

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        const analytics = result.data;
        expect(analytics.totalSessions).toBe(3);
        expect(analytics.completedSessions).toBe(1);
        expect(analytics.abandonedSessions).toBe(1);
        expect(analytics.conversionRate).toBeCloseTo(33.33, 1); // 1/3 * 100
        expect(analytics.averageCompletionTime).toBe(60); // 1 hour in minutes

        // Check conversion source breakdown
        expect(analytics.conversionSourceBreakdown).toEqual({
          'google-ads': 1,
          'facebook-ads': 1,
          'direct': 1,
        });

        // Check abandonment reasons
        expect(analytics.commonAbandonmentReasons).toEqual({
          'form_complexity': 1,
        });
      }
    });
  });

  describe('cleanupExpiredSessions', () => {
    it('should cleanup expired sessions and return count', async () => {
      mockSupabase.from().delete.mockReturnThis();
      mockSupabase.from().lt.mockResolvedValue(
        createMockResponse.success(null, 5) // 5 sessions deleted
      );

      const result = await repository.cleanupExpiredSessions();

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toBe(5);
      }

      expect(mockSupabase.from).toHaveBeenCalledWith('onboarding_sessions');
      expect(mockSupabase.from().delete).toHaveBeenCalledWith({ count: 'exact' });
      expect(mockSupabase.from().lt).toHaveBeenCalledWith('expires_at', expect.any(String));
    });
  });

  describe('getActiveSessionCount', () => {
    it('should return count of active sessions', async () => {
      mockSupabase.from().select.mockReturnThis();
      mockSupabase.from().eq.mockResolvedValue(
        createMockResponse.success(null, 42) // 42 active sessions
      );

      const result = await repository.getActiveSessionCount();

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toBe(42);
      }

      expect(mockSupabase.from().select).toHaveBeenCalledWith('*', { count: 'exact', head: true });
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('status', 'in-progress');
    });
  });
});

// =============================================================================
// DATA TRANSFORMATION TESTS
// =============================================================================

describe('SupabaseOnboardingRepository - Data Transformation', () => {
  let repository: SupabaseOnboardingRepository;

  beforeEach(() => {
    repository = new SupabaseOnboardingRepository(
      'https://test.supabase.co',
      'test-anon-key'
    );
  });

  describe('sessionToRecord transformation', () => {
    it('should correctly transform session to database record', () => {
      const session = createTestSession({
        currentStep: 'business',
        completedSteps: ['welcome'],
        stepData: {
          businessInfo: {
            companyName: 'Test Company',
            businessType: 'startup',
          },
        },
        metadata: {
          source: 'landing-page',
          campaign: 'test-campaign',
        },
      });

      const record = (repository as any).sessionToRecord(session);

      expect(record.id).toBe(session.id);
      expect(record.user_email).toBe(session.userEmail.getValue());
      expect(record.current_step).toBe('business');
      expect(record.status).toBe('in-progress');
      expect(record.completed_steps).toEqual(['welcome']);
      expect(record.started_at).toBe(session.startedAt.toISOString());
      expect(record.last_activity_at).toBe(session.lastActivityAt.toISOString());
      expect(record.completed_at).toBeNull();
      expect(record.step_data).toEqual(session.stepData);
      expect(record.metadata).toEqual(session.metadata);
      expect(record.analytics).toBe(session.analytics);
      expect(record.recovery_token).toBe(session.recoveryToken);
      expect(record.expires_at).toBe(session.expiresAt.toISOString());
    });

    it('should handle completed session', () => {
      const completedDate = new Date('2024-01-15T12:00:00.000Z');
      const session = createTestSession({
        status: 'completed',
        completedAt: completedDate,
      });

      const record = (repository as any).sessionToRecord(session);

      expect(record.status).toBe('completed');
      expect(record.completed_at).toBe(completedDate.toISOString());
    });

    it('should handle session without recovery token', () => {
      const session = createTestSession({
        recoveryToken: undefined,
      });

      const record = (repository as any).sessionToRecord(session);

      expect(record.recovery_token).toBeNull();
    });
  });

  describe('recordToSession transformation', () => {
    it('should correctly transform database record to session', () => {
      const record = {
        id: 'test-session-id',
        user_email: 'transform@example.com',
        current_step: 'integration',
        status: 'in-progress',
        completed_steps: ['welcome', 'business'],
        started_at: '2024-01-15T10:00:00.000Z',
        last_activity_at: '2024-01-15T10:30:00.000Z',
        completed_at: null,
        step_data: {
          businessInfo: { companyName: 'Transform Co' },
        },
        metadata: {
          source: 'api',
        },
        analytics: {
          startedAt: new Date('2024-01-15T10:00:00.000Z'),
          lastActivityAt: new Date('2024-01-15T10:30:00.000Z'),
          stepTimestamps: {},
          stepDurations: {},
          deviceInfo: { userAgent: 'Test Agent', ip: '127.0.0.1' },
          abTestVariants: { test1: 'variant1' },
          conversionSource: 'api-test',
        },
        recovery_token: 'recovery-123',
        expires_at: '2024-01-16T10:00:00.000Z',
        created_at: '2024-01-15T10:00:00.000Z',
        updated_at: '2024-01-15T10:30:00.000Z',
      };

      const session = (repository as any).recordToSession(record);

      expect(session.id).toBe('test-session-id');
      expect(session.userEmail.getValue()).toBe('transform@example.com');
      expect(session.currentStep).toBe('integration');
      expect(session.status).toBe('in-progress');
      expect(session.completedSteps).toEqual(['welcome', 'business']);
      expect(session.startedAt).toEqual(new Date('2024-01-15T10:00:00.000Z'));
      expect(session.lastActivityAt).toEqual(new Date('2024-01-15T10:30:00.000Z'));
      expect(session.completedAt).toBeUndefined();
      expect(session.stepData).toEqual({ businessInfo: { companyName: 'Transform Co' } });
      expect(session.metadata).toEqual({ source: 'api' });
      expect(session.analytics).toBe(record.analytics);
      expect(session.recoveryToken).toBe('recovery-123');
      expect(session.expiresAt).toEqual(new Date('2024-01-16T10:00:00.000Z'));
    });

    it('should handle completed session record', () => {
      const record = {
        id: 'completed-record',
        user_email: 'completed@example.com',
        current_step: 'complete',
        status: 'completed',
        completed_steps: ['welcome', 'business', 'integration', 'verification', 'bot-setup', 'testing'],
        started_at: '2024-01-15T10:00:00.000Z',
        last_activity_at: '2024-01-15T11:00:00.000Z',
        completed_at: '2024-01-15T11:00:00.000Z',
        step_data: {},
        metadata: {},
        analytics: {
          startedAt: new Date('2024-01-15T10:00:00.000Z'),
          lastActivityAt: new Date('2024-01-15T11:00:00.000Z'),
          completedAt: new Date('2024-01-15T11:00:00.000Z'),
          stepTimestamps: {},
          stepDurations: {},
          deviceInfo: undefined,
          abTestVariants: {},
        },
        recovery_token: null,
        expires_at: '2024-01-16T10:00:00.000Z',
        created_at: '2024-01-15T10:00:00.000Z',
        updated_at: '2024-01-15T11:00:00.000Z',
      };

      const session = (repository as any).recordToSession(record);

      expect(session.status).toBe('completed');
      expect(session.completedAt).toEqual(new Date('2024-01-15T11:00:00.000Z'));
      expect(session.recoveryToken).toBeUndefined();
    });
  });
});

// =============================================================================
// ERROR HANDLING AND EDGE CASES
// =============================================================================

describe('SupabaseOnboardingRepository - Error Handling', () => {
  let repository: SupabaseOnboardingRepository;
  let mockSupabase: any;

  beforeEach(() => {
    repository = new SupabaseOnboardingRepository(
      'https://test.supabase.co',
      'test-anon-key'
    );
    mockSupabase = (repository as any).supabase;
  });

  it('should handle network timeouts gracefully', async () => {
    const session = createTestSession();

    mockSupabase.from.mockImplementation(() => {
      throw new Error('Network timeout');
    });

    const result = await repository.save(session);

    expect(isSuccess(result)).toBe(false);
    if (!isSuccess(result)) {
      expect(result.error.message).toBe('Network timeout');
    }
  });

  it('should handle non-Error exceptions', async () => {
    const session = createTestSession();

    mockSupabase.from.mockImplementation(() => {
      throw 'String error';
    });

    const result = await repository.save(session);

    expect(isSuccess(result)).toBe(false);
    if (!isSuccess(result)) {
      expect(result.error.message).toBe('Unknown error saving session');
    }
  });

  it('should handle malformed data gracefully', async () => {
    const sessionId = 'malformed-id' as OnboardingSessionId;

    mockSupabase.from().select.mockReturnThis();
    mockSupabase.from().eq.mockReturnThis();
    mockSupabase.from().single.mockResolvedValue(
      createMockResponse.success({
        id: sessionId,
        user_email: 'malformed@example.com',
        current_step: 'business',
        status: 'in-progress',
        completed_steps: 'invalid-not-array', // Invalid data
        started_at: 'invalid-date', // Invalid date
        last_activity_at: '2024-01-15T10:00:00.000Z',
        completed_at: null,
        step_data: {},
        metadata: {},
        analytics: {},
        recovery_token: null,
        expires_at: '2024-01-16T10:00:00.000Z',
        created_at: '2024-01-15T10:00:00.000Z',
        updated_at: '2024-01-15T10:00:00.000Z',
      })
    );

    const result = await repository.findById(sessionId);

    // Should still succeed but with potentially unexpected data
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).not.toBeNull();
      // The transformation will handle the data as-is
    }
  });

  it('should handle very large datasets', async () => {
    const largeSessionData = {
      stepData: {},
      metadata: {},
      analytics: {
        stepTimestamps: {},
        stepDurations: {},
        abTestVariants: {},
      },
    };

    // Add large amounts of data
    for (let i = 0; i < 1000; i++) {
      largeSessionData.stepData[`key_${i}`] = `value_${i}`.repeat(100);
      largeSessionData.metadata[`meta_${i}`] = `meta_value_${i}`.repeat(50);
      largeSessionData.analytics.abTestVariants[`test_${i}`] = `variant_${i % 5}`;
    }

    const session = createTestSession(largeSessionData);

    mockSupabase.from().insert.mockReturnThis();
    mockSupabase.from().select.mockReturnThis();
    mockSupabase.from().single.mockResolvedValue(
      createMockResponse.success({
        id: session.id,
        user_email: session.userEmail.getValue(),
        current_step: session.currentStep,
        status: session.status,
        completed_steps: session.completedSteps,
        started_at: session.startedAt.toISOString(),
        last_activity_at: session.lastActivityAt.toISOString(),
        completed_at: null,
        step_data: largeSessionData.stepData,
        metadata: largeSessionData.metadata,
        analytics: session.analytics,
        recovery_token: session.recoveryToken,
        expires_at: session.expiresAt.toISOString(),
        created_at: '2024-01-15T10:00:00.000Z',
        updated_at: '2024-01-15T10:00:00.000Z',
      })
    );

    const result = await repository.save(session);

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(Object.keys(result.data.stepData)).toHaveLength(1000);
      expect(Object.keys(result.data.metadata)).toHaveLength(1000);
    }
  });
});
