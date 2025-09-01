/**
 * Onboarding API Route Tests
 * API layer - Tests for onboarding session management endpoints
 * Coverage requirement: 85%
 */

import { NextRequest } from 'next/server';

import { createEmail } from '../../../../modules/marketing/domain/value-objects/email';
import { createOnboardingSession } from '../../../../modules/onboarding/domain/entities/onboarding-session';
import { failure,success } from '../../../../modules/shared/domain/value-objects/result';
import { GET,POST } from '../route';

// =============================================================================
// MOCKS
// =============================================================================

// Mock the repository
const mockOnboardingRepository = {
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
};

// Mock the repository constructor
jest.mock('../../../../modules/onboarding/infra/adapters/supabase-onboarding-repository', () => ({
  SupabaseOnboardingRepository: jest.fn().mockImplementation(() => mockOnboardingRepository),
}));

// Mock use cases
const mockStartOnboardingUseCase = {
  execute: jest.fn(),
};

const mockSessionUseCases = {
  recoverSession: jest.fn(),
};

jest.mock('../../../../modules/onboarding/application/use-cases/start-onboarding', () => ({
  createStartOnboardingUseCase: jest.fn(() => mockStartOnboardingUseCase),
}));

jest.mock('../../../../modules/onboarding/application/use-cases/manage-session', () => ({
  createManageSessionUseCases: jest.fn(() => mockSessionUseCases),
}));

// Mock console methods
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

// =============================================================================
// TEST HELPERS
// =============================================================================

const createMockRequest = (options: {
  method: string;
  body?: any;
  searchParams?: Record<string, string>;
  headers?: Record<string, string>;
}) => {
  const url = new URL('http://localhost:3000/api/onboarding');

  if (options.searchParams) {
    Object.entries(options.searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const request = {
    method: options.method,
    nextUrl: url,
    json: () => Promise.resolve(options.body || {}),
    headers: {
      get: (name: string) => {
        const headers = {
          'user-agent': 'Mozilla/5.0 (Test Browser)',
          'x-forwarded-for': '192.168.1.1',
          'cf-ipcountry': 'US',
          'cf-ipcity': 'San Francisco',
          ...options.headers,
        };
        return headers[name.toLowerCase()] || null;
      },
    },
  } as unknown as NextRequest;

  return request;
};

const createTestSession = () => {
  const email = createEmail('test@example.com');
  return createOnboardingSession(
    email,
    {
      userAgent: 'Mozilla/5.0 (Test Browser)',
      ip: '192.168.1.1',
      country: 'US',
      city: 'San Francisco',
    },
    'website-form'
  );
};

// =============================================================================
// POST ENDPOINT TESTS
// =============================================================================

describe('POST /api/onboarding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('successful session creation', () => {
    it('should create new onboarding session successfully', async () => {
      const testSession = createTestSession();
      mockStartOnboardingUseCase.execute.mockResolvedValue(success(testSession));

      const request = createMockRequest({
        method: 'POST',
        body: {
          userEmail: 'test@example.com',
          conversionSource: 'landing-page',
          abTestVariants: { hero_cta: 'variant_a' },
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.sessionId).toBe(testSession.id);
      expect(data.currentStep).toBe(testSession.currentStep);
      expect(data.status).toBe(testSession.status);
      expect(data.progress).toBe(0); // No completed steps
      expect(data.recoveryToken).toBe(testSession.recoveryToken);
      expect(data.expiresAt).toBe(testSession.expiresAt);

      expect(mockStartOnboardingUseCase.execute).toHaveBeenCalledWith({
        userEmail: 'test@example.com',
        conversionSource: 'landing-page',
        deviceInfo: {
          userAgent: 'Mozilla/5.0 (Test Browser)',
          ip: '192.168.1.1',
          country: 'US',
          city: 'San Francisco',
        },
        abTestVariants: { hero_cta: 'variant_a' },
      });
    });

    it('should handle minimal request data', async () => {
      const testSession = createTestSession();
      mockStartOnboardingUseCase.execute.mockResolvedValue(success(testSession));

      const request = createMockRequest({
        method: 'POST',
        body: {
          userEmail: 'minimal@example.com',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.sessionId).toBeDefined();

      expect(mockStartOnboardingUseCase.execute).toHaveBeenCalledWith({
        userEmail: 'minimal@example.com',
        conversionSource: undefined,
        deviceInfo: expect.objectContaining({
          userAgent: 'Mozilla/5.0 (Test Browser)',
          ip: '192.168.1.1',
        }),
        abTestVariants: undefined,
      });
    });

    it('should extract device info from various headers', async () => {
      const testSession = createTestSession();
      mockStartOnboardingUseCase.execute.mockResolvedValue(success(testSession));

      const request = createMockRequest({
        method: 'POST',
        body: { userEmail: 'device-test@example.com' },
        headers: {
          'user-agent': 'Custom/1.0 Browser',
          'x-real-ip': '10.0.0.1', // Should prefer x-forwarded-for
          'x-forwarded-for': '203.0.113.1',
          'cf-ipcountry': 'CA',
          'cf-ipcity': 'Toronto',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockStartOnboardingUseCase.execute).toHaveBeenCalledWith({
        userEmail: 'device-test@example.com',
        conversionSource: undefined,
        deviceInfo: {
          userAgent: 'Custom/1.0 Browser',
          ip: '203.0.113.1', // x-forwarded-for takes precedence
          country: 'CA',
          city: 'Toronto',
        },
        abTestVariants: undefined,
      });
    });

    it('should handle missing device info headers gracefully', async () => {
      const testSession = createTestSession();
      mockStartOnboardingUseCase.execute.mockResolvedValue(success(testSession));

      const request = createMockRequest({
        method: 'POST',
        body: { userEmail: 'no-headers@example.com' },
        headers: {}, // No headers
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockStartOnboardingUseCase.execute).toHaveBeenCalledWith({
        userEmail: 'no-headers@example.com',
        conversionSource: undefined,
        deviceInfo: {
          userAgent: 'unknown',
          ip: 'unknown',
          country: null,
          city: null,
        },
        abTestVariants: undefined,
      });
    });

    it('should calculate progress correctly', async () => {
      const testSession = {
        ...createTestSession(),
        completedSteps: ['welcome', 'business'],
      };
      mockStartOnboardingUseCase.execute.mockResolvedValue(success(testSession));

      const request = createMockRequest({
        method: 'POST',
        body: { userEmail: 'progress@example.com' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.progress).toBe(33); // 2/6 = 33.33... rounded to 33
    });
  });

  describe('validation errors', () => {
    it('should return 400 when userEmail is missing', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: {
          conversionSource: 'landing-page',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('userEmail is required');
      expect(mockStartOnboardingUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return 400 when userEmail is empty', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: {
          userEmail: '',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('userEmail is required');
    });

    it('should return 400 when userEmail is null', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: {
          userEmail: null,
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('userEmail is required');
    });
  });

  describe('use case errors', () => {
    it('should return 400 when use case returns validation error', async () => {
      mockStartOnboardingUseCase.execute.mockResolvedValue(
        failure(new Error('Invalid email format'))
      );

      const request = createMockRequest({
        method: 'POST',
        body: {
          userEmail: 'invalid-email',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid email format');
    });

    it('should return 400 when use case returns business logic error', async () => {
      mockStartOnboardingUseCase.execute.mockResolvedValue(
        failure(new Error('Failed to save onboarding session'))
      );

      const request = createMockRequest({
        method: 'POST',
        body: {
          userEmail: 'save-error@example.com',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Failed to save onboarding session');
    });
  });

  describe('server errors', () => {
    it('should return 500 when JSON parsing fails', async () => {
      const request = {
        method: 'POST',
        json: () => Promise.reject(new Error('Invalid JSON')),
        headers: {
          get: () => 'test-value',
        },
      } as unknown as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(mockConsoleError).toHaveBeenCalledWith('Error starting onboarding:', expect.any(Error));
    });

    it('should return 500 when use case throws unexpected error', async () => {
      mockStartOnboardingUseCase.execute.mockRejectedValue(new Error('Database connection failed'));

      const request = createMockRequest({
        method: 'POST',
        body: {
          userEmail: 'database-error@example.com',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it('should return 500 when repository constructor fails', async () => {
      // This would be a rare edge case but worth testing
      const SupabaseOnboardingRepository = require('../../../../modules/onboarding/infra/adapters/supabase-onboarding-repository').SupabaseOnboardingRepository;
      SupabaseOnboardingRepository.mockImplementationOnce(() => {
        throw new Error('Repository initialization failed');
      });

      const request = createMockRequest({
        method: 'POST',
        body: {
          userEmail: 'init-error@example.com',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('edge cases', () => {
    it('should handle very long email addresses', async () => {
      const longEmail = 'a'.repeat(100) + '@' + 'b'.repeat(100) + '.com';
      const testSession = createTestSession();
      mockStartOnboardingUseCase.execute.mockResolvedValue(success(testSession));

      const request = createMockRequest({
        method: 'POST',
        body: {
          userEmail: longEmail,
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockStartOnboardingUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          userEmail: longEmail,
        })
      );
    });

    it('should handle special characters in device info', async () => {
      const testSession = createTestSession();
      mockStartOnboardingUseCase.execute.mockResolvedValue(success(testSession));

      const request = createMockRequest({
        method: 'POST',
        body: { userEmail: 'special@example.com' },
        headers: {
          'user-agent': 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Mobile Safari/537.36',
          'cf-ipcountry': 'XK', // Special country code
          'cf-ipcity': 'Ürümqi', // City with special characters
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockStartOnboardingUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          deviceInfo: expect.objectContaining({
            country: 'XK',
            city: 'Ürümqi',
          }),
        })
      );
    });

    it('should handle large A/B test variant objects', async () => {
      const testSession = createTestSession();
      mockStartOnboardingUseCase.execute.mockResolvedValue(success(testSession));

      const largeVariants: Record<string, string> = {};
      for (let i = 0; i < 50; i++) {
        largeVariants[`test_${i}`] = `variant_${i % 3}`;
      }

      const request = createMockRequest({
        method: 'POST',
        body: {
          userEmail: 'variants@example.com',
          abTestVariants: largeVariants,
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockStartOnboardingUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          abTestVariants: largeVariants,
        })
      );
    });
  });
});

// =============================================================================
// GET ENDPOINT TESTS
// =============================================================================

describe('GET /api/onboarding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get session by email', () => {
    it('should return session when found by email', async () => {
      const testSession = createTestSession();
      testSession.completedSteps = ['welcome', 'business'];
      testSession.stepData = { businessInfo: { companyName: 'Test Company' } };

      mockOnboardingRepository.findByUserEmail.mockResolvedValue(success(testSession));

      const request = createMockRequest({
        method: 'GET',
        searchParams: {
          email: 'test@example.com',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sessionId).toBe(testSession.id);
      expect(data.currentStep).toBe(testSession.currentStep);
      expect(data.status).toBe(testSession.status);
      expect(data.progress).toBe(33); // 2/6 steps completed
      expect(data.completedSteps).toEqual(['welcome', 'business']);
      expect(data.stepData).toEqual({ businessInfo: { companyName: 'Test Company' } });
      expect(data.recoveryToken).toBe(testSession.recoveryToken);
      expect(data.expiresAt).toBe(testSession.expiresAt);
    });

    it('should return 404 when session not found by email', async () => {
      mockOnboardingRepository.findByUserEmail.mockResolvedValue(success(null));

      const request = createMockRequest({
        method: 'GET',
        searchParams: {
          email: 'notfound@example.com',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Session not found');
    });

    it('should handle repository errors when finding by email', async () => {
      mockOnboardingRepository.findByUserEmail.mockResolvedValue(
        failure(new Error('Database error'))
      );

      const request = createMockRequest({
        method: 'GET',
        searchParams: {
          email: 'error@example.com',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Session not found');
    });
  });

  describe('recover session by token', () => {
    it('should recover session successfully with recovery token', async () => {
      const testSession = createTestSession();
      testSession.completedSteps = ['welcome', 'business', 'integration'];

      mockSessionUseCases.recoverSession.mockResolvedValue(
        success({
          session: testSession,
          wasExpired: false,
          wasExtended: false,
        })
      );

      const request = createMockRequest({
        method: 'GET',
        searchParams: {
          recoveryToken: 'valid-recovery-token',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sessionId).toBe(testSession.id);
      expect(data.progress).toBe(50); // 3/6 steps completed
      expect(data.wasExpired).toBe(false);
      expect(data.wasExtended).toBe(false);

      expect(mockSessionUseCases.recoverSession).toHaveBeenCalledWith({
        recoveryToken: 'valid-recovery-token',
      });
    });

    it('should recover expired session and mark as extended', async () => {
      const testSession = createTestSession();
      testSession.completedSteps = ['welcome'];

      mockSessionUseCases.recoverSession.mockResolvedValue(
        success({
          session: testSession,
          wasExpired: true,
          wasExtended: true,
        })
      );

      const request = createMockRequest({
        method: 'GET',
        searchParams: {
          recoveryToken: 'expired-token',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.wasExpired).toBe(true);
      expect(data.wasExtended).toBe(true);
    });

    it('should return 404 when recovery token is invalid', async () => {
      mockSessionUseCases.recoverSession.mockResolvedValue(
        failure(new Error('Invalid recovery token'))
      );

      const request = createMockRequest({
        method: 'GET',
        searchParams: {
          recoveryToken: 'invalid-token',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Session not found');
    });
  });

  describe('parameter validation', () => {
    it('should return 400 when both email and recoveryToken are missing', async () => {
      const request = createMockRequest({
        method: 'GET',
        searchParams: {},
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('email or recoveryToken is required');
    });

    it('should prioritize recoveryToken when both parameters are provided', async () => {
      const testSession = createTestSession();
      mockSessionUseCases.recoverSession.mockResolvedValue(
        success({
          session: testSession,
          wasExpired: false,
          wasExtended: false,
        })
      );

      const request = createMockRequest({
        method: 'GET',
        searchParams: {
          email: 'test@example.com',
          recoveryToken: 'recovery-token',
        },
      });

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockSessionUseCases.recoverSession).toHaveBeenCalled();
      expect(mockOnboardingRepository.findByUserEmail).not.toHaveBeenCalled();
    });

    it('should handle empty string parameters', async () => {
      const request = createMockRequest({
        method: 'GET',
        searchParams: {
          email: '',
          recoveryToken: '',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('email or recoveryToken is required');
    });
  });

  describe('server errors', () => {
    it('should return 500 when unexpected error occurs', async () => {
      mockOnboardingRepository.findByUserEmail.mockRejectedValue(
        new Error('Unexpected database error')
      );

      const request = createMockRequest({
        method: 'GET',
        searchParams: {
          email: 'error@example.com',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error getting onboarding session:',
        expect.any(Error)
      );
    });

    it('should return 500 when session use cases throw error', async () => {
      mockSessionUseCases.recoverSession.mockRejectedValue(
        new Error('Session recovery service unavailable')
      );

      const request = createMockRequest({
        method: 'GET',
        searchParams: {
          recoveryToken: 'service-error-token',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(mockConsoleError).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle email with special characters', async () => {
      const specialEmail = 'test+user@example-domain.co.uk';
      const testSession = createTestSession();
      mockOnboardingRepository.findByUserEmail.mockResolvedValue(success(testSession));

      const request = createMockRequest({
        method: 'GET',
        searchParams: {
          email: specialEmail,
        },
      });

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockOnboardingRepository.findByUserEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          getValue: expect.any(Function),
        })
      );
    });

    it('should handle very long recovery token', async () => {
      const longToken = 'a'.repeat(1000);
      const testSession = createTestSession();
      mockSessionUseCases.recoverSession.mockResolvedValue(
        success({
          session: testSession,
          wasExpired: false,
          wasExtended: false,
        })
      );

      const request = createMockRequest({
        method: 'GET',
        searchParams: {
          recoveryToken: longToken,
        },
      });

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockSessionUseCases.recoverSession).toHaveBeenCalledWith({
        recoveryToken: longToken,
      });
    });

    it('should handle session with all steps completed', async () => {
      const completedSession = {
        ...createTestSession(),
        completedSteps: ['welcome', 'business', 'integration', 'verification', 'bot-setup', 'testing'],
        currentStep: 'complete',
        status: 'completed',
      };
      mockOnboardingRepository.findByUserEmail.mockResolvedValue(success(completedSession));

      const request = createMockRequest({
        method: 'GET',
        searchParams: {
          email: 'completed@example.com',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.progress).toBe(100);
      expect(data.currentStep).toBe('complete');
      expect(data.status).toBe('completed');
    });

    it('should handle session with complex step data', async () => {
      const sessionWithComplexData = {
        ...createTestSession(),
        stepData: {
          businessInfo: {
            companyName: 'Complex Company',
            employees: 150,
            industries: ['tech', 'consulting'],
            metadata: {
              source: 'referral',
              campaign: 'Q1-2024',
            },
          },
          integrationInfo: {
            phoneNumber: '+1234567890',
            configuration: {
              webhooks: true,
              apiKeys: ['key1', 'key2'],
            },
          },
        },
      };
      mockOnboardingRepository.findByUserEmail.mockResolvedValue(success(sessionWithComplexData));

      const request = createMockRequest({
        method: 'GET',
        searchParams: {
          email: 'complex@example.com',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stepData).toEqual(sessionWithComplexData.stepData);
    });
  });
});

// =============================================================================
// PERFORMANCE AND STRESS TESTS
// =============================================================================

describe('API Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle concurrent POST requests', async () => {
    const testSession = createTestSession();
    mockStartOnboardingUseCase.execute.mockResolvedValue(success(testSession));

    const requests = Array.from({ length: 10 }, (_, i) =>
      createMockRequest({
        method: 'POST',
        body: {
          userEmail: `concurrent${i}@example.com`,
        },
      })
    );

    const responses = await Promise.all(requests.map(req => POST(req)));

    responses.forEach(response => {
      expect(response.status).toBe(201);
    });

    expect(mockStartOnboardingUseCase.execute).toHaveBeenCalledTimes(10);
  });

  it('should handle concurrent GET requests', async () => {
    const testSession = createTestSession();
    mockOnboardingRepository.findByUserEmail.mockResolvedValue(success(testSession));

    const requests = Array.from({ length: 10 }, (_, i) =>
      createMockRequest({
        method: 'GET',
        searchParams: {
          email: `concurrent${i}@example.com`,
        },
      })
    );

    const responses = await Promise.all(requests.map(req => GET(req)));

    responses.forEach(response => {
      expect(response.status).toBe(200);
    });

    expect(mockOnboardingRepository.findByUserEmail).toHaveBeenCalledTimes(10);
  });

  it('should handle large request payloads', async () => {
    const testSession = createTestSession();
    mockStartOnboardingUseCase.execute.mockResolvedValue(success(testSession));

    const largePayload = {
      userEmail: 'large@example.com',
      conversionSource: 'a'.repeat(1000), // Large conversion source
      abTestVariants: {} as Record<string, string>,
    };

    // Add many A/B test variants
    for (let i = 0; i < 100; i++) {
      largePayload.abTestVariants[`test_${i}`] = `variant_${i}`.repeat(10);
    }

    const request = createMockRequest({
      method: 'POST',
      body: largePayload,
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(mockStartOnboardingUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        conversionSource: largePayload.conversionSource,
        abTestVariants: largePayload.abTestVariants,
      })
    );
  });
});
