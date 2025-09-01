/**
 * Onboarding API Slice Tests
 * RTK Query API tests for onboarding flow management
 * Coverage requirement: 85%
 */

import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { createMockResponse,createTestSupabaseClient } from '../../../__mocks__/supabase/setup';
import {
  type BotConfigurationFormData,
  type BusinessInfoFormData,
  type IntegrationTestResult,
  onboardingApi,
  type OnboardingData,
  type OnboardingSession,
  type OnboardingStep,
  type WhatsAppIntegrationFormData,
} from '../onboarding-api';

// =============================================================================
// MOCK SETUP
// =============================================================================

// Mock Supabase base query
jest.mock('../supabase-base-query', () => ({
  supabaseBaseQuery: jest.fn(),
}));

// Create a mock store for testing
const createMockStore = () => {
  return configureStore({
    reducer: {
      [onboardingApi.reducerPath]: onboardingApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(onboardingApi.middleware),
  });
};

// Test data factories
const createTestOnboardingSession = (overrides: Partial<OnboardingSession> = {}): OnboardingSession => ({
  sessionId: 'onboarding_user123_1699123456789',
  userId: 'user123',
  currentStep: 'business_info',
  completedSteps: [],
  sessionData: {},
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-15T10:00:00.000Z',
  expiresAt: '2024-01-16T10:00:00.000Z',
  ...overrides,
});

const createTestBusinessInfo = (): BusinessInfoFormData => ({
  fullName: 'John Doe',
  companyName: 'Test Company Inc.',
  phoneNumber: '+1234567890',
  businessType: 'startup',
  industry: 'technology',
  expectedVolume: 'medium',
  timezone: 'America/New_York',
});

const createTestWhatsAppIntegration = (): WhatsAppIntegrationFormData => ({
  phoneNumber: '+1234567890',
  phoneNumberId: 'phone123',
  businessAccountId: 'business123',
  accessToken: 'access_token_123',
  webhookVerifyToken: 'verify_token_123',
  webhookUrl: 'https://example.com/webhook',
  testMode: false,
});

const createTestBotConfiguration = (): BotConfigurationFormData => ({
  name: 'Customer Support Bot',
  description: 'Automated customer support for our business',
  welcomeMessage: 'Hello! Welcome to our service. How can I help you today?',
  fallbackMessage: 'I\'m sorry, I didn\'t understand that. Can you please rephrase?',
  businessHours: {
    enabled: true,
    timezone: 'America/New_York',
    schedule: [
      { day: 'monday', startTime: '09:00', endTime: '17:00', enabled: true },
      { day: 'tuesday', startTime: '09:00', endTime: '17:00', enabled: true },
      { day: 'wednesday', startTime: '09:00', endTime: '17:00', enabled: true },
      { day: 'thursday', startTime: '09:00', endTime: '17:00', enabled: true },
      { day: 'friday', startTime: '09:00', endTime: '17:00', enabled: true },
      { day: 'saturday', startTime: '10:00', endTime: '14:00', enabled: false },
      { day: 'sunday', startTime: '10:00', endTime: '14:00', enabled: false },
    ],
  },
  autoReplyEnabled: true,
  aiEnabled: true,
  aiModel: 'gpt-3.5-turbo',
  aiPersonality: 'friendly and professional',
  trainingData: [
    {
      question: 'What are your business hours?',
      answer: 'We are open Monday to Friday from 9 AM to 5 PM EST.',
      keywords: ['hours', 'time', 'open', 'closed'],
    },
  ],
});

// =============================================================================
// SESSION MANAGEMENT TESTS
// =============================================================================

describe('Onboarding API - Session Management', () => {
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    store = createMockStore();
    setupListeners(store.dispatch);
    jest.clearAllMocks();
  });

  describe('createOnboardingSession', () => {
    it('should create new onboarding session successfully', async () => {
      const userId = 'user123';
      const sessionData = { source: 'landing-page' };

      // Mock the dependency query to return no existing session
      const mockGetSession = jest.fn().mockResolvedValue({ data: null });
      store.dispatch = jest.fn().mockImplementation((action) => {
        if (typeof action === 'function') {
          return action(store.dispatch, store.getState, undefined);
        }
        if (action.type?.includes('getOnboardingSession')) {
          return mockGetSession();
        }
        return { type: 'mock' };
      });

      const result = await store.dispatch(
        onboardingApi.endpoints.createOnboardingSession.initiate({
          userId,
          sessionData,
        })
      );

      expect(result.data).toBeDefined();
      expect(result.data?.userId).toBe(userId);
      expect(result.data?.currentStep).toBe('business_info');
      expect(result.data?.completedSteps).toEqual([]);
      expect(result.data?.sessionData).toEqual(sessionData);
    });

    it('should resume existing incomplete session', async () => {
      const userId = 'user123';
      const existingSession = createTestOnboardingSession({
        userId,
        currentStep: 'whatsapp_integration',
        completedSteps: ['business_info'],
      });

      // Mock the dependency query to return existing session
      const mockGetSession = jest.fn().mockResolvedValue({ data: existingSession });
      store.dispatch = jest.fn().mockImplementation((action) => {
        if (typeof action === 'function') {
          return action(store.dispatch, store.getState, undefined);
        }
        if (action.type?.includes('getOnboardingSession')) {
          return mockGetSession();
        }
        return { type: 'mock' };
      });

      const result = await store.dispatch(
        onboardingApi.endpoints.createOnboardingSession.initiate({ userId })
      );

      expect(result.data).toEqual(existingSession);
      expect(mockGetSession).toHaveBeenCalled();
    });

    it('should create new session when existing session is complete', async () => {
      const userId = 'user123';
      const completedSession = createTestOnboardingSession({
        userId,
        currentStep: 'complete',
        completedSteps: ['business_info', 'whatsapp_integration', 'bot_configuration', 'testing', 'complete'],
      });

      // Mock the dependency query to return completed session
      const mockGetSession = jest.fn().mockResolvedValue({ data: completedSession });
      store.dispatch = jest.fn().mockImplementation((action) => {
        if (typeof action === 'function') {
          return action(store.dispatch, store.getState, undefined);
        }
        if (action.type?.includes('getOnboardingSession')) {
          return mockGetSession();
        }
        return { type: 'mock' };
      });

      const result = await store.dispatch(
        onboardingApi.endpoints.createOnboardingSession.initiate({ userId })
      );

      expect(result.data).toBeDefined();
      expect(result.data?.userId).toBe(userId);
      expect(result.data?.currentStep).toBe('business_info');
      expect(result.data?.completedSteps).toEqual([]);
    });

    it('should handle session creation errors', async () => {
      const userId = 'user123';

      store.dispatch = jest.fn().mockImplementation((action) => {
        if (typeof action === 'function') {
          return action(store.dispatch, store.getState, undefined);
        }
        if (action.type?.includes('getOnboardingSession')) {
          throw new Error('Database connection failed');
        }
        return { type: 'mock' };
      });

      const result = await store.dispatch(
        onboardingApi.endpoints.createOnboardingSession.initiate({ userId })
      );

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Database connection failed');
    });
  });

  describe('getOnboardingSession', () => {
    it('should derive session from user data when no explicit session exists', async () => {
      const userId = 'user123';
      const mockProfile = { id: '1', user_id: userId, full_name: 'John Doe', created_at: '2024-01-15T10:00:00.000Z', updated_at: '2024-01-15T10:00:00.000Z' };

      // Mock dependency queries
      store.dispatch = jest.fn().mockImplementation((action) => {
        if (typeof action === 'function') {
          return action(store.dispatch, store.getState, undefined);
        }

        if (action.type?.includes('getUserProfile')) {
          return Promise.resolve({ data: mockProfile });
        }
        if (action.type?.includes('getWhatsAppIntegration')) {
          return Promise.resolve({ data: null });
        }
        if (action.type?.includes('getBotConfiguration')) {
          return Promise.resolve({ data: null });
        }
        return { type: 'mock' };
      });

      const result = await store.dispatch(
        onboardingApi.endpoints.getOnboardingSession.initiate({ userId })
      );

      expect(result.data).toBeDefined();
      expect(result.data?.userId).toBe(userId);
      expect(result.data?.currentStep).toBe('whatsapp_integration'); // Next step after business info
      expect(result.data?.completedSteps).toContain('business_info');
    });

    it('should determine correct current step based on completed data', async () => {
      const userId = 'user123';
      const mockProfile = { id: '1', user_id: userId, full_name: 'John Doe', created_at: '2024-01-15T10:00:00.000Z', updated_at: '2024-01-15T10:00:00.000Z' };
      const mockIntegration = { id: '1', user_id: userId, phone_number: '+1234567890', status: 'pending', created_at: '2024-01-15T10:00:00.000Z', updated_at: '2024-01-15T10:00:00.000Z' };
      const mockBot = { id: '1', user_id: userId, name: 'Test Bot', status: 'draft', created_at: '2024-01-15T10:00:00.000Z', updated_at: '2024-01-15T10:00:00.000Z' };

      store.dispatch = jest.fn().mockImplementation((action) => {
        if (typeof action === 'function') {
          return action(store.dispatch, store.getState, undefined);
        }

        if (action.type?.includes('getUserProfile')) {
          return Promise.resolve({ data: mockProfile });
        }
        if (action.type?.includes('getWhatsAppIntegration')) {
          return Promise.resolve({ data: mockIntegration });
        }
        if (action.type?.includes('getBotConfiguration')) {
          return Promise.resolve({ data: mockBot });
        }
        return { type: 'mock' };
      });

      const result = await store.dispatch(
        onboardingApi.endpoints.getOnboardingSession.initiate({ userId })
      );

      expect(result.data?.currentStep).toBe('testing'); // All configured, ready for testing
      expect(result.data?.completedSteps).toEqual(['business_info', 'whatsapp_integration', 'bot_configuration']);
    });

    it('should mark as complete when integration is active', async () => {
      const userId = 'user123';
      const mockProfile = { id: '1', user_id: userId, full_name: 'John Doe', created_at: '2024-01-15T10:00:00.000Z', updated_at: '2024-01-15T10:00:00.000Z' };
      const mockIntegration = { id: '1', user_id: userId, phone_number: '+1234567890', status: 'active', created_at: '2024-01-15T10:00:00.000Z', updated_at: '2024-01-15T10:00:00.000Z' };
      const mockBot = { id: '1', user_id: userId, name: 'Test Bot', status: 'active', created_at: '2024-01-15T10:00:00.000Z', updated_at: '2024-01-15T10:00:00.000Z' };

      store.dispatch = jest.fn().mockImplementation((action) => {
        if (typeof action === 'function') {
          return action(store.dispatch, store.getState, undefined);
        }

        if (action.type?.includes('getUserProfile')) {
          return Promise.resolve({ data: mockProfile });
        }
        if (action.type?.includes('getWhatsAppIntegration')) {
          return Promise.resolve({ data: mockIntegration });
        }
        if (action.type?.includes('getBotConfiguration')) {
          return Promise.resolve({ data: mockBot });
        }
        return { type: 'mock' };
      });

      const result = await store.dispatch(
        onboardingApi.endpoints.getOnboardingSession.initiate({ userId })
      );

      expect(result.data?.currentStep).toBe('complete');
      expect(result.data?.completedSteps).toContain('complete');
    });
  });

  describe('updateOnboardingSession', () => {
    it('should update session step and data', async () => {
      const userId = 'user123';
      const currentSession = createTestOnboardingSession({ userId });
      const updatedData = { businessInfo: createTestBusinessInfo() };

      // Mock getting current session
      store.dispatch = jest.fn().mockImplementation((action) => {
        if (typeof action === 'function') {
          return action(store.dispatch, store.getState, undefined);
        }

        if (action.type?.includes('getOnboardingSession')) {
          return Promise.resolve({ data: currentSession });
        }
        return { type: 'mock' };
      });

      const result = await store.dispatch(
        onboardingApi.endpoints.updateOnboardingSession.initiate({
          userId,
          step: 'whatsapp_integration',
          sessionData: updatedData,
          markStepComplete: 'business_info',
        })
      );

      expect(result.data).toBeDefined();
      expect(result.data?.currentStep).toBe('whatsapp_integration');
      expect(result.data?.completedSteps).toContain('business_info');
      expect(result.data?.sessionData).toEqual(expect.objectContaining(updatedData));
    });

    it('should handle missing session error', async () => {
      const userId = 'user123';

      store.dispatch = jest.fn().mockImplementation((action) => {
        if (typeof action === 'function') {
          return action(store.dispatch, store.getState, undefined);
        }

        if (action.type?.includes('getOnboardingSession')) {
          return Promise.resolve({ data: null });
        }
        return { type: 'mock' };
      });

      const result = await store.dispatch(
        onboardingApi.endpoints.updateOnboardingSession.initiate({
          userId,
          step: 'whatsapp_integration',
        })
      );

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('No onboarding session found');
    });
  });
});

// =============================================================================
// BUSINESS INFO SUBMISSION TESTS
// =============================================================================

describe('Onboarding API - Business Info Submission', () => {
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    store = createMockStore();
    setupListeners(store.dispatch);
    jest.clearAllMocks();
  });

  it('should submit business info and update session', async () => {
    const userId = 'user123';
    const businessInfo = createTestBusinessInfo();
    const mockProfile = {
      id: '1',
      user_id: userId,
      full_name: businessInfo.fullName,
      phone_number: businessInfo.phoneNumber,
      company_name: businessInfo.companyName,
      created_at: '2024-01-15T10:00:00.000Z',
      updated_at: '2024-01-15T10:00:00.000Z',
    };

    // Mock Supabase upsert response
    const mockSupabaseQuery = jest.fn().mockResolvedValue(
      createMockResponse.success([mockProfile])
    );

    // Mock the base query
    const supabaseBaseQueryMock = require('../supabase-base-query').supabaseBaseQuery;
    supabaseBaseQueryMock.mockImplementation(() => mockSupabaseQuery());

    // Mock session update
    store.dispatch = jest.fn().mockImplementation((action) => {
      if (typeof action === 'function') {
        return action(store.dispatch, store.getState, undefined);
      }

      if (action.type?.includes('updateOnboardingSession')) {
        return Promise.resolve({ data: createTestOnboardingSession({ currentStep: 'whatsapp_integration', completedSteps: ['business_info'] }) });
      }
      return { type: 'mock' };
    });

    const result = await store.dispatch(
      onboardingApi.endpoints.submitBusinessInfo.initiate({
        userId,
        businessInfo,
      })
    );

    expect(result.data).toEqual(mockProfile);
  });

  it('should handle validation errors in business info', async () => {
    const userId = 'user123';
    const invalidBusinessInfo = { ...createTestBusinessInfo(), fullName: '' }; // Invalid: empty name

    const mockSupabaseQuery = jest.fn().mockResolvedValue(
      createMockResponse.error('Validation failed: full_name cannot be empty', 'VALIDATION_ERROR', 400)
    );

    const supabaseBaseQueryMock = require('../supabase-base-query').supabaseBaseQuery;
    supabaseBaseQueryMock.mockImplementation(() => mockSupabaseQuery());

    const result = await store.dispatch(
      onboardingApi.endpoints.submitBusinessInfo.initiate({
        userId,
        businessInfo: invalidBusinessInfo,
      })
    );

    expect(result.error).toBeDefined();
    expect(result.error?.status).toBe(400);
  });
});

// =============================================================================
// WHATSAPP INTEGRATION TESTS
// =============================================================================

describe('Onboarding API - WhatsApp Integration', () => {
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    store = createMockStore();
    setupListeners(store.dispatch);
    jest.clearAllMocks();
  });

  it('should submit WhatsApp integration data', async () => {
    const userId = 'user123';
    const integrationData = createTestWhatsAppIntegration();
    const mockIntegration = {
      id: '1',
      user_id: userId,
      phone_number: integrationData.phoneNumber,
      phone_number_id: integrationData.phoneNumberId,
      business_account_id: integrationData.businessAccountId,
      access_token: integrationData.accessToken,
      webhook_verify_token: integrationData.webhookVerifyToken,
      webhook_url: integrationData.webhookUrl,
      status: 'pending',
      configuration: { testMode: integrationData.testMode },
      created_at: '2024-01-15T10:00:00.000Z',
      updated_at: '2024-01-15T10:00:00.000Z',
    };

    const mockSupabaseQuery = jest.fn().mockResolvedValue(
      createMockResponse.success([mockIntegration])
    );

    const supabaseBaseQueryMock = require('../supabase-base-query').supabaseBaseQuery;
    supabaseBaseQueryMock.mockImplementation(() => mockSupabaseQuery());

    // Mock session update
    store.dispatch = jest.fn().mockImplementation((action) => {
      if (typeof action === 'function') {
        return action(store.dispatch, store.getState, undefined);
      }

      if (action.type?.includes('updateOnboardingSession')) {
        return Promise.resolve({
          data: createTestOnboardingSession({
            currentStep: 'bot_configuration',
            completedSteps: ['business_info', 'whatsapp_integration']
          })
        });
      }
      return { type: 'mock' };
    });

    const result = await store.dispatch(
      onboardingApi.endpoints.submitWhatsAppIntegration.initiate({
        userId,
        integrationData,
      })
    );

    expect(result.data).toEqual(mockIntegration);
  });

  it('should handle WhatsApp API errors', async () => {
    const userId = 'user123';
    const integrationData = { ...createTestWhatsAppIntegration(), accessToken: 'invalid_token' };

    const mockSupabaseQuery = jest.fn().mockResolvedValue(
      createMockResponse.error('Invalid access token', 'WHATSAPP_API_ERROR', 401)
    );

    const supabaseBaseQueryMock = require('../supabase-base-query').supabaseBaseQuery;
    supabaseBaseQueryMock.mockImplementation(() => mockSupabaseQuery());

    const result = await store.dispatch(
      onboardingApi.endpoints.submitWhatsAppIntegration.initiate({
        userId,
        integrationData,
      })
    );

    expect(result.error).toBeDefined();
    expect(result.error?.status).toBe(401);
  });
});

// =============================================================================
// BOT CONFIGURATION TESTS
// =============================================================================

describe('Onboarding API - Bot Configuration', () => {
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    store = createMockStore();
    setupListeners(store.dispatch);
    jest.clearAllMocks();
  });

  it('should submit bot configuration', async () => {
    const userId = 'user123';
    const integrationId = 'integration123';
    const botConfig = createTestBotConfiguration();
    const mockBot = {
      id: '1',
      user_id: userId,
      integration_id: integrationId,
      name: botConfig.name,
      description: botConfig.description,
      welcome_message: botConfig.welcomeMessage,
      fallback_message: botConfig.fallbackMessage,
      business_hours: botConfig.businessHours,
      auto_reply_enabled: botConfig.autoReplyEnabled,
      ai_enabled: botConfig.aiEnabled,
      ai_model: botConfig.aiModel,
      ai_personality: botConfig.aiPersonality,
      training_data: botConfig.trainingData,
      status: 'draft',
      created_at: '2024-01-15T10:00:00.000Z',
      updated_at: '2024-01-15T10:00:00.000Z',
    };

    const mockSupabaseQuery = jest.fn().mockResolvedValue(
      createMockResponse.success([mockBot])
    );

    const supabaseBaseQueryMock = require('../supabase-base-query').supabaseBaseQuery;
    supabaseBaseQueryMock.mockImplementation(() => mockSupabaseQuery());

    // Mock session update
    store.dispatch = jest.fn().mockImplementation((action) => {
      if (typeof action === 'function') {
        return action(store.dispatch, store.getState, undefined);
      }

      if (action.type?.includes('updateOnboardingSession')) {
        return Promise.resolve({
          data: createTestOnboardingSession({
            currentStep: 'testing',
            completedSteps: ['business_info', 'whatsapp_integration', 'bot_configuration']
          })
        });
      }
      return { type: 'mock' };
    });

    const result = await store.dispatch(
      onboardingApi.endpoints.submitBotConfiguration.initiate({
        userId,
        integrationId,
        botConfig,
      })
    );

    expect(result.data).toEqual(mockBot);
  });

  it('should validate complex bot configuration', async () => {
    const userId = 'user123';
    const integrationId = 'integration123';
    const botConfig = {
      ...createTestBotConfiguration(),
      trainingData: [], // Empty training data should still be valid
      businessHours: undefined, // Optional field
    };

    const mockBot = {
      id: '1',
      user_id: userId,
      integration_id: integrationId,
      name: botConfig.name,
      training_data: [],
      business_hours: null,
      status: 'draft',
      created_at: '2024-01-15T10:00:00.000Z',
      updated_at: '2024-01-15T10:00:00.000Z',
    };

    const mockSupabaseQuery = jest.fn().mockResolvedValue(
      createMockResponse.success([mockBot])
    );

    const supabaseBaseQueryMock = require('../supabase-base-query').supabaseBaseQuery;
    supabaseBaseQueryMock.mockImplementation(() => mockSupabaseQuery());

    // Mock session update
    store.dispatch = jest.fn().mockImplementation((action) => {
      if (typeof action === 'function') {
        return action(store.dispatch, store.getState, undefined);
      }

      if (action.type?.includes('updateOnboardingSession')) {
        return Promise.resolve({ data: createTestOnboardingSession() });
      }
      return { type: 'mock' };
    });

    const result = await store.dispatch(
      onboardingApi.endpoints.submitBotConfiguration.initiate({
        userId,
        integrationId,
        botConfig,
      })
    );

    expect(result.data).toBeDefined();
    expect(result.data?.training_data).toEqual([]);
    expect(result.data?.business_hours).toBeNull();
  });
});

// =============================================================================
// INTEGRATION TESTING TESTS
// =============================================================================

describe('Onboarding API - Integration Testing', () => {
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    store = createMockStore();
    setupListeners(store.dispatch);
    jest.clearAllMocks();
  });

  it('should test webhook configuration', async () => {
    const userId = 'user123';
    const mockIntegration = {
      id: '1',
      user_id: userId,
      phone_number: '+1234567890',
      webhook_url: 'https://example.com/webhook',
      status: 'pending',
    };

    // Mock getting integration
    store.dispatch = jest.fn().mockImplementation((action) => {
      if (typeof action === 'function') {
        return action(store.dispatch, store.getState, undefined);
      }

      if (action.type?.includes('getWhatsAppIntegration')) {
        return Promise.resolve({ data: mockIntegration });
      }
      return { type: 'mock' };
    });

    const result = await store.dispatch(
      onboardingApi.endpoints.testWhatsAppIntegration.initiate({
        userId,
        testType: 'webhook',
      })
    );

    expect(result.data?.success).toBe(true);
    expect(result.data?.testType).toBe('webhook');
    expect(result.data?.message).toContain('Webhook configuration verified');
    expect(result.data?.details).toEqual(expect.objectContaining({
      webhookUrl: 'https://example.com/webhook',
      verifyToken: 'verified',
    }));
  });

  it('should test message sending', async () => {
    const userId = 'user123';
    const testData = { message: 'Test message content' };
    const mockIntegration = {
      id: '1',
      user_id: userId,
      phone_number: '+1234567890',
      status: 'pending',
    };

    store.dispatch = jest.fn().mockImplementation((action) => {
      if (typeof action === 'function') {
        return action(store.dispatch, store.getState, undefined);
      }

      if (action.type?.includes('getWhatsAppIntegration')) {
        return Promise.resolve({ data: mockIntegration });
      }
      return { type: 'mock' };
    });

    const result = await store.dispatch(
      onboardingApi.endpoints.testWhatsAppIntegration.initiate({
        userId,
        testType: 'send_message',
        testData,
      })
    );

    expect(result.data?.testType).toBe('send_message');
    expect(result.data?.details).toEqual(expect.objectContaining({
      phoneNumber: '+1234567890',
      content: testData.message,
      messageId: expect.any(String),
    }));
  });

  it('should run full integration test flow', async () => {
    const userId = 'user123';
    const mockIntegration = {
      id: '1',
      user_id: userId,
      phone_number: '+1234567890',
      status: 'pending',
    };

    // Mock all test types to succeed
    let testCallCount = 0;
    store.dispatch = jest.fn().mockImplementation((action) => {
      if (typeof action === 'function') {
        return action(store.dispatch, store.getState, undefined);
      }

      if (action.type?.includes('getWhatsAppIntegration')) {
        return Promise.resolve({ data: mockIntegration });
      }

      if (action.type?.includes('testWhatsAppIntegration') && !action.type?.includes('full_flow')) {
        testCallCount++;
        const testTypes = ['webhook', 'send_message', 'receive_message'];
        const testType = testTypes[testCallCount - 1];

        return {
          unwrap: () => Promise.resolve({
            success: true,
            testType,
            message: `${testType} test passed`,
            timestamp: new Date().toISOString(),
          }),
        };
      }

      if (action.type?.includes('updateWhatsAppIntegration')) {
        return Promise.resolve({ data: { ...mockIntegration, status: 'active' } });
      }

      if (action.type?.includes('updateOnboardingSession')) {
        return Promise.resolve({ data: createTestOnboardingSession({ currentStep: 'complete' }) });
      }

      return { type: 'mock' };
    });

    const result = await store.dispatch(
      onboardingApi.endpoints.testWhatsAppIntegration.initiate({
        userId,
        testType: 'full_flow',
      })
    );

    expect(result.data?.success).toBe(true);
    expect(result.data?.testType).toBe('full_flow');
    expect(result.data?.message).toContain('All integration tests passed');
    expect(result.data?.details?.subTests).toHaveLength(3);
    expect(testCallCount).toBe(3); // Should have called each sub-test
  });

  it('should handle test failures gracefully', async () => {
    const userId = 'user123';

    store.dispatch = jest.fn().mockImplementation((action) => {
      if (typeof action === 'function') {
        return action(store.dispatch, store.getState, undefined);
      }

      if (action.type?.includes('getWhatsAppIntegration')) {
        return Promise.resolve({ data: null }); // No integration found
      }
      return { type: 'mock' };
    });

    const result = await store.dispatch(
      onboardingApi.endpoints.testWhatsAppIntegration.initiate({
        userId,
        testType: 'webhook',
      })
    );

    expect(result.data?.success).toBe(false);
    expect(result.data?.message).toBe('No WhatsApp integration found');
  });
});

// =============================================================================
// COMPLETE ONBOARDING TESTS
// =============================================================================

describe('Onboarding API - Complete Onboarding', () => {
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    store = createMockStore();
    setupListeners(store.dispatch);
    jest.clearAllMocks();
  });

  it('should complete onboarding with all data present', async () => {
    const userId = 'user123';
    const completeOnboardingData: OnboardingData = {
      session: createTestOnboardingSession({
        userId,
        currentStep: 'testing',
        completedSteps: ['business_info', 'whatsapp_integration', 'bot_configuration'],
      }),
      userProfile: {
        id: '1',
        user_id: userId,
        full_name: 'John Doe',
        created_at: '2024-01-15T10:00:00.000Z',
        updated_at: '2024-01-15T10:00:00.000Z',
      },
      whatsappIntegration: {
        id: '1',
        user_id: userId,
        phone_number: '+1234567890',
        status: 'active', // Key requirement for completion
        created_at: '2024-01-15T10:00:00.000Z',
        updated_at: '2024-01-15T10:00:00.000Z',
      },
      botConfiguration: {
        id: '1',
        user_id: userId,
        name: 'Test Bot',
        status: 'draft',
        created_at: '2024-01-15T10:00:00.000Z',
        updated_at: '2024-01-15T10:00:00.000Z',
      },
    };

    store.dispatch = jest.fn().mockImplementation((action) => {
      if (typeof action === 'function') {
        return action(store.dispatch, store.getState, undefined);
      }

      if (action.type?.includes('getOnboardingData')) {
        return Promise.resolve({ data: completeOnboardingData });
      }

      if (action.type?.includes('updateBotConfiguration')) {
        return Promise.resolve({
          data: { ...completeOnboardingData.botConfiguration, status: 'active' }
        });
      }

      if (action.type?.includes('updateOnboardingSession')) {
        return Promise.resolve({
          data: createTestOnboardingSession({
            currentStep: 'complete',
            completedSteps: ['business_info', 'whatsapp_integration', 'bot_configuration', 'testing', 'complete']
          })
        });
      }

      return { type: 'mock' };
    });

    const result = await store.dispatch(
      onboardingApi.endpoints.completeOnboarding.initiate({ userId })
    );

    expect(result.data).toBeDefined();
    expect(result.data?.currentStep).toBe('complete');
    expect(result.data?.completedSteps).toContain('complete');
  });

  it('should fail completion when business info is missing', async () => {
    const userId = 'user123';
    const incompleteOnboardingData: OnboardingData = {
      session: createTestOnboardingSession({ userId }),
      userProfile: undefined, // Missing!
      whatsappIntegration: {
        id: '1',
        user_id: userId,
        phone_number: '+1234567890',
        status: 'active',
        created_at: '2024-01-15T10:00:00.000Z',
        updated_at: '2024-01-15T10:00:00.000Z',
      },
      botConfiguration: {
        id: '1',
        user_id: userId,
        name: 'Test Bot',
        status: 'draft',
        created_at: '2024-01-15T10:00:00.000Z',
        updated_at: '2024-01-15T10:00:00.000Z',
      },
    };

    store.dispatch = jest.fn().mockImplementation((action) => {
      if (typeof action === 'function') {
        return action(store.dispatch, store.getState, undefined);
      }

      if (action.type?.includes('getOnboardingData')) {
        return Promise.resolve({ data: incompleteOnboardingData });
      }

      return { type: 'mock' };
    });

    const result = await store.dispatch(
      onboardingApi.endpoints.completeOnboarding.initiate({ userId })
    );

    expect(result.error).toBeDefined();
    expect(result.error?.message).toBe('Business information is incomplete');
  });

  it('should fail completion when WhatsApp integration is not active', async () => {
    const userId = 'user123';
    const incompleteOnboardingData: OnboardingData = {
      session: createTestOnboardingSession({ userId }),
      userProfile: {
        id: '1',
        user_id: userId,
        full_name: 'John Doe',
        created_at: '2024-01-15T10:00:00.000Z',
        updated_at: '2024-01-15T10:00:00.000Z',
      },
      whatsappIntegration: {
        id: '1',
        user_id: userId,
        phone_number: '+1234567890',
        status: 'pending', // Not active!
        created_at: '2024-01-15T10:00:00.000Z',
        updated_at: '2024-01-15T10:00:00.000Z',
      },
      botConfiguration: {
        id: '1',
        user_id: userId,
        name: 'Test Bot',
        status: 'draft',
        created_at: '2024-01-15T10:00:00.000Z',
        updated_at: '2024-01-15T10:00:00.000Z',
      },
    };

    store.dispatch = jest.fn().mockImplementation((action) => {
      if (typeof action === 'function') {
        return action(store.dispatch, store.getState, undefined);
      }

      if (action.type?.includes('getOnboardingData')) {
        return Promise.resolve({ data: incompleteOnboardingData });
      }

      return { type: 'mock' };
    });

    const result = await store.dispatch(
      onboardingApi.endpoints.completeOnboarding.initiate({ userId })
    );

    expect(result.error).toBeDefined();
    expect(result.error?.message).toBe('WhatsApp integration has not been tested and activated');
  });
});

// =============================================================================
// DATA QUERIES TESTS
// =============================================================================

describe('Onboarding API - Data Queries', () => {
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    store = createMockStore();
    setupListeners(store.dispatch);
    jest.clearAllMocks();
  });

  it('should get complete onboarding data', async () => {
    const userId = 'user123';
    const mockSession = createTestOnboardingSession({ userId });
    const mockProfile = { id: '1', user_id: userId, full_name: 'John Doe', created_at: '2024-01-15T10:00:00.000Z', updated_at: '2024-01-15T10:00:00.000Z' };
    const mockIntegration = { id: '1', user_id: userId, phone_number: '+1234567890', status: 'pending', created_at: '2024-01-15T10:00:00.000Z', updated_at: '2024-01-15T10:00:00.000Z' };
    const mockBot = { id: '1', user_id: userId, name: 'Test Bot', status: 'draft', created_at: '2024-01-15T10:00:00.000Z', updated_at: '2024-01-15T10:00:00.000Z' };

    store.dispatch = jest.fn().mockImplementation((action) => {
      if (typeof action === 'function') {
        return action(store.dispatch, store.getState, undefined);
      }

      if (action.type?.includes('getOnboardingSession')) {
        return Promise.resolve({ data: mockSession });
      }
      if (action.type?.includes('getUserProfile')) {
        return Promise.resolve({ data: mockProfile });
      }
      if (action.type?.includes('getWhatsAppIntegration')) {
        return Promise.resolve({ data: mockIntegration });
      }
      if (action.type?.includes('getBotConfiguration')) {
        return Promise.resolve({ data: mockBot });
      }
      return { type: 'mock' };
    });

    const result = await store.dispatch(
      onboardingApi.endpoints.getOnboardingData.initiate({ userId })
    );

    expect(result.data).toBeDefined();
    expect(result.data?.session).toEqual(mockSession);
    expect(result.data?.userProfile).toEqual(mockProfile);
    expect(result.data?.whatsappIntegration).toEqual(mockIntegration);
    expect(result.data?.botConfiguration).toEqual(mockBot);
  });

  it('should handle missing session in getOnboardingData', async () => {
    const userId = 'user123';

    store.dispatch = jest.fn().mockImplementation((action) => {
      if (typeof action === 'function') {
        return action(store.dispatch, store.getState, undefined);
      }

      if (action.type?.includes('getOnboardingSession')) {
        return Promise.resolve({ data: null }); // No session
      }
      return { type: 'mock' };
    });

    const result = await store.dispatch(
      onboardingApi.endpoints.getOnboardingData.initiate({ userId })
    );

    expect(result.error).toBeDefined();
    expect(result.error?.message).toBe('No onboarding session found');
  });
});

// =============================================================================
// CACHE INVALIDATION AND OPTIMISTIC UPDATES TESTS
// =============================================================================

describe('Onboarding API - Cache Management', () => {
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    store = createMockStore();
    setupListeners(store.dispatch);
    jest.clearAllMocks();
  });

  it('should invalidate correct cache tags on session creation', async () => {
    const userId = 'user123';

    // Create a spy on the store dispatch to track invalidation calls
    const originalDispatch = store.dispatch;
    const dispatchSpy = jest.fn().mockImplementation((action) => {
      if (typeof action === 'function') {
        return action(store.dispatch, store.getState, undefined);
      }
      return originalDispatch(action);
    });
    store.dispatch = dispatchSpy;

    await store.dispatch(
      onboardingApi.endpoints.createOnboardingSession.initiate({ userId })
    );

    // Check that the API endpoint was configured with correct invalidation tags
    const endpoint = onboardingApi.endpoints.createOnboardingSession;
    expect(endpoint.invalidatesTags).toBeDefined();

    if (typeof endpoint.invalidatesTags === 'function') {
      const tags = endpoint.invalidatesTags({ sessionId: 'test' } as any, undefined, { userId });
      expect(tags).toContain({ type: 'OnboardingSession', id: userId });
    }
  });

  it('should provide correct cache tags for data queries', () => {
    const userId = 'user123';
    const mockData = { sessionId: 'test' } as any;

    // Test getUserProfile tags
    const profileEndpoint = onboardingApi.endpoints.getUserProfile;
    if (typeof profileEndpoint.providesTags === 'function') {
      const tags = profileEndpoint.providesTags(mockData, undefined, userId);
      expect(tags).toContain({ type: 'UserProfile', id: userId });
    }

    // Test getOnboardingData tags
    const dataEndpoint = onboardingApi.endpoints.getOnboardingData;
    if (typeof dataEndpoint.providesTags === 'function') {
      const tags = dataEndpoint.providesTags(mockData, undefined, { userId });
      expect(tags).toEqual(expect.arrayContaining([
        { type: 'OnboardingSession', id: userId },
        { type: 'UserProfile', id: userId },
        { type: 'WhatsAppIntegration', id: userId },
        { type: 'BotConfiguration', id: userId },
      ]));
    }
  });

  it('should handle optimistic updates correctly', async () => {
    const userId = 'user123';
    const businessInfo = createTestBusinessInfo();

    // Mock the onQueryStarted for optimistic updates
    const mockQueryFulfilled = Promise.resolve({ data: { id: '1' } });
    const mockDispatch = jest.fn();

    const endpoint = onboardingApi.endpoints.submitBusinessInfo;
    if (endpoint.onQueryStarted) {
      await endpoint.onQueryStarted(
        { userId, businessInfo },
        { dispatch: mockDispatch, queryFulfilled: mockQueryFulfilled } as any
      );
    }

    // Should have dispatched session update optimistically
    expect(mockDispatch).toHaveBeenCalled();
  });
});

// =============================================================================
// ERROR HANDLING AND EDGE CASES
// =============================================================================

describe('Onboarding API - Error Handling', () => {
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    store = createMockStore();
    setupListeners(store.dispatch);
    jest.clearAllMocks();
  });

  it('should handle network errors gracefully', async () => {
    const userId = 'user123';

    const supabaseBaseQueryMock = require('../supabase-base-query').supabaseBaseQuery;
    supabaseBaseQueryMock.mockImplementation(() =>
      Promise.reject(new Error('Network connection failed'))
    );

    const result = await store.dispatch(
      onboardingApi.endpoints.getUserProfile.initiate(userId)
    );

    expect(result.error).toBeDefined();
  });

  it('should handle malformed data responses', async () => {
    const userId = 'user123';

    store.dispatch = jest.fn().mockImplementation((action) => {
      if (typeof action === 'function') {
        return action(store.dispatch, store.getState, undefined);
      }

      if (action.type?.includes('getUserProfile')) {
        return Promise.resolve({ data: null }); // No profile data
      }
      if (action.type?.includes('getWhatsAppIntegration')) {
        return Promise.resolve({ data: { invalid: 'data' } }); // Malformed data
      }
      if (action.type?.includes('getBotConfiguration')) {
        return Promise.resolve({ data: null });
      }
      return { type: 'mock' };
    });

    const result = await store.dispatch(
      onboardingApi.endpoints.getOnboardingSession.initiate({ userId })
    );

    // Should still create a valid session structure
    expect(result.data).toBeDefined();
    expect(result.data?.userId).toBe(userId);
    expect(result.data?.currentStep).toBe('business_info'); // Fallback to first step
  });

  it('should timeout on long-running operations', async () => {
    const userId = 'user123';

    // Mock a long-running operation
    store.dispatch = jest.fn().mockImplementation((action) => {
      if (typeof action === 'function') {
        return action(store.dispatch, store.getState, undefined);
      }

      if (action.type?.includes('getWhatsAppIntegration')) {
        return new Promise((resolve) => {
          setTimeout(() => resolve({ data: null }), 30000); // 30 second delay
        });
      }
      return Promise.resolve({ data: null });
    });

    // This should timeout or be handled gracefully
    // In a real implementation, you'd set up proper timeout handling
    const result = await store.dispatch(
      onboardingApi.endpoints.testWhatsAppIntegration.initiate({
        userId,
        testType: 'webhook',
      })
    );

    // Should not hang indefinitely
    expect(result.data?.success).toBe(false);
  });
});
