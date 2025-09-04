/**
 * Onboarding Test Utilities
 * Shared test utilities and fixtures for onboarding module testing
 */

import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { render, RenderOptions } from '@testing-library/react';

import { createEmail } from '../../../marketing/domain/value-objects/email';
import { failure,success } from '../../../shared/domain/value-objects/result';
import { onboardingApi } from '../../../store/api/onboarding-api';
import { OnboardingRepository } from '../../application/ports/onboarding-repository';
import {
  createOnboardingSession,
  OnboardingSession,
  OnboardingSessionId,
  OnboardingStatus,
  OnboardingStep,
  SessionAnalytics,
} from '../../domain/entities/onboarding-session';
import { BusinessInfo, createBusinessInfo } from '../../domain/value-objects/business-info';

// =============================================================================
// TEST DATA FACTORIES
// =============================================================================

/**
 * Creates a test onboarding session with realistic defaults
 */
export const createTestOnboardingSession = (overrides: Partial<OnboardingSession> = {}): OnboardingSession => {
  const baseSession = createOnboardingSession(
    createEmail('test@example.com'),
    {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      ip: '192.168.1.1',
      country: 'United States',
      city: 'San Francisco',
    },
    'website-form'
  );

  return {
    ...baseSession,
    ...overrides,
  };
};

/**
 * Creates a test business info with realistic data
 */
export const createTestBusinessInfo = (overrides: Partial<Parameters<typeof createBusinessInfo>[0]> = {}): BusinessInfo => {
  const params = {
    companyName: 'Test Company Inc.',
    businessType: 'startup' as const,
    industry: 'technology' as const,
    employeeCount: 25,
    website: 'https://testcompany.com',
    description: 'A test company focused on software development and consulting services.',
    expectedVolume: 'medium' as const,
    ...overrides,
  };

  return createBusinessInfo(params);
};

/**
 * Creates test device info
 */
export const createTestDeviceInfo = (overrides: Partial<SessionAnalytics['deviceInfo']> = {}) => ({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  ip: '192.168.1.1',
  country: 'United States',
  city: 'San Francisco',
  ...overrides,
});

/**
 * Creates various onboarding session scenarios for testing
 */
export const createOnboardingScenarios = () => ({
  newSession: createTestOnboardingSession(),

  businessInfoCompleted: createTestOnboardingSession({
    currentStep: 'integration',
    completedSteps: ['welcome', 'business'],
    stepData: {
      businessInfo: {
        companyName: 'Completed Business',
        businessType: 'sme',
        industry: 'retail',
        employeeCount: 50,
        expectedVolume: 'high',
      },
    },
  }),

  integrationCompleted: createTestOnboardingSession({
    currentStep: 'verification',
    completedSteps: ['welcome', 'business', 'integration'],
    stepData: {
      businessInfo: {
        companyName: 'Integration Test Co.',
        businessType: 'enterprise',
        industry: 'finance',
        employeeCount: 200,
        expectedVolume: 'high',
      },
      whatsappConfig: {
        phoneNumber: '+1234567890',
        businessAccountId: 'ba_test_123',
        accessToken: 'test_token_123',
      },
    },
  }),

  completedSession: createTestOnboardingSession({
    currentStep: 'complete',
    status: 'completed',
    completedSteps: ['welcome', 'business', 'integration', 'verification', 'bot-setup', 'testing'],
    completedAt: new Date('2024-01-15T12:00:00.000Z'),
    stepData: {
      businessInfo: {
        companyName: 'Completed Company',
        businessType: 'startup',
        industry: 'technology',
        employeeCount: 10,
        expectedVolume: 'medium',
      },
      whatsappConfig: {
        phoneNumber: '+1234567890',
        businessAccountId: 'ba_complete_123',
        accessToken: 'complete_token_123',
      },
      botConfig: {
        name: 'Customer Support Bot',
        welcomeMessage: 'Hello! How can I help you today?',
        fallbackMessage: 'Sorry, I didn\'t understand that.',
      },
    },
  }),

  abandonedSession: createTestOnboardingSession({
    currentStep: 'business',
    status: 'abandoned',
    completedSteps: ['welcome'],
    analytics: {
      ...createTestOnboardingSession().analytics,
      abandonedAt: new Date('2024-01-15T11:00:00.000Z'),
      abandonmentReason: 'form_complexity',
    },
  }),

  expiredSession: createTestOnboardingSession({
    expiresAt: new Date('2024-01-14T10:00:00.000Z'), // Yesterday
    currentStep: 'integration',
    completedSteps: ['welcome', 'business'],
  }),
});

// =============================================================================
// MOCK REPOSITORY FACTORY
// =============================================================================

/**
 * Creates a mock onboarding repository with realistic behavior
 */
export const createMockOnboardingRepository = (): jest.Mocked<OnboardingRepository> => {
  const scenarios = createOnboardingScenarios();

  return {
    save: jest.fn().mockResolvedValue(success(scenarios.newSession)),
    findById: jest.fn().mockResolvedValue(success(null)),
    findByUserEmail: jest.fn().mockResolvedValue(success(null)),
    findByRecoveryToken: jest.fn().mockResolvedValue(success(null)),
    update: jest.fn().mockResolvedValue(success(scenarios.businessInfoCompleted)),
    delete: jest.fn().mockResolvedValue(success(true)),
    findByStatus: jest.fn().mockResolvedValue(success([])),
    findAbandonedSessions: jest.fn().mockResolvedValue(success([scenarios.abandonedSession])),
    findExpiredSessions: jest.fn().mockResolvedValue(success([scenarios.expiredSession])),
    findSessionsInDateRange: jest.fn().mockResolvedValue(success([scenarios.completedSession])),
    getAnalyticsSummary: jest.fn().mockResolvedValue(success({
      totalSessions: 100,
      completedSessions: 80,
      abandonedSessions: 15,
      averageCompletionTime: 45,
      conversionRate: 80,
      stepDropoffRates: {
        welcome: 5,
        business: 10,
        integration: 8,
        verification: 3,
        'bot-setup': 2,
        testing: 1,
      },
      commonAbandonmentReasons: {
        form_complexity: 8,
        time_constraints: 5,
        technical_issues: 2,
      },
      conversionSourceBreakdown: {
        'website-form': 60,
        'google-ads': 25,
        'social-media': 15,
      },
    })),
    cleanupExpiredSessions: jest.fn().mockResolvedValue(success(5)),
    getActiveSessionCount: jest.fn().mockResolvedValue(success(42)),
  };
};

/**
 * Configures mock repository with specific scenarios
 */
export const configureMockRepository = (
  mockRepository: jest.Mocked<OnboardingRepository>,
  scenario: keyof ReturnType<typeof createOnboardingScenarios>
) => {
  const scenarios = createOnboardingScenarios();
  const selectedScenario = scenarios[scenario];

  mockRepository.findByUserEmail.mockResolvedValue(success(selectedScenario));
  mockRepository.findById.mockResolvedValue(success(selectedScenario));
  mockRepository.save.mockResolvedValue(success(selectedScenario));
  mockRepository.update.mockResolvedValue(success(selectedScenario));
};

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validates that a session follows the expected onboarding flow rules
 */
export const validateOnboardingFlow = (session: OnboardingSession): boolean => {
  const stepOrder: OnboardingStep[] = [
    'welcome', 'business', 'integration', 'verification', 'bot-setup', 'testing', 'complete'
  ];

  const currentIndex = stepOrder.indexOf(session.currentStep);

  // All completed steps should come before current step
  const invalidCompletedSteps = session.completedSteps.filter(step => {
    const stepIndex = stepOrder.indexOf(step);
    return stepIndex >= currentIndex;
  });

  return invalidCompletedSteps.length === 0;
};

/**
 * Validates session analytics structure
 */
export const validateSessionAnalytics = (analytics: SessionAnalytics): boolean => {
  const requiredFields = ['startedAt', 'lastActivityAt', 'stepTimestamps', 'stepDurations', 'abTestVariants'];

  return requiredFields.every(field => field in analytics);
};

/**
 * Checks if session data is consistent
 */
export const validateSessionConsistency = (session: OnboardingSession): string[] => {
  const errors: string[] = [];

  // Check date consistency
  if (session.completedAt && session.completedAt < session.startedAt) {
    errors.push('completedAt cannot be before startedAt');
  }

  if (session.lastActivityAt < session.startedAt) {
    errors.push('lastActivityAt cannot be before startedAt');
  }

  // Check step flow consistency
  if (!validateOnboardingFlow(session)) {
    errors.push('Invalid onboarding step flow');
  }

  // Check analytics consistency
  if (!validateSessionAnalytics(session.analytics)) {
    errors.push('Invalid analytics structure');
  }

  // Check status consistency
  if (session.status === 'completed' && !session.completedAt) {
    errors.push('Completed session must have completedAt date');
  }

  if (session.status === 'abandoned' && !session.analytics.abandonedAt) {
    errors.push('Abandoned session must have abandonedAt date in analytics');
  }

  return errors;
};

// =============================================================================
// TEST ASSERTIONS
// =============================================================================

/**
 * Custom Jest matchers for onboarding sessions
 */
export const onboardingMatchers = {
  toBeValidOnboardingSession(received: OnboardingSession) {
    const errors = validateSessionConsistency(received);

    return {
      message: () =>
        errors.length > 0
          ? `Expected valid onboarding session but found errors: ${errors.join(', ')}`
          : 'Expected invalid onboarding session',
      pass: errors.length === 0,
    };
  },

  toHaveCompletedStep(received: OnboardingSession, step: OnboardingStep) {
    const hasCompleted = received.completedSteps.includes(step);

    return {
      message: () =>
        hasCompleted
          ? `Expected session not to have completed step '${step}'`
          : `Expected session to have completed step '${step}'`,
      pass: hasCompleted,
    };
  },

  toBeAtStep(received: OnboardingSession, step: OnboardingStep) {
    const isAtStep = received.currentStep === step;

    return {
      message: () =>
        isAtStep
          ? `Expected session not to be at step '${step}' but it was`
          : `Expected session to be at step '${step}' but was at '${received.currentStep}'`,
      pass: isAtStep,
    };
  },
};

// =============================================================================
// REACT TESTING UTILITIES
// =============================================================================

/**
 * Creates a Redux store for testing with onboarding API
 */
export const createTestStore = (preloadedState?: any) => {
  return configureStore({
    reducer: {
      [onboardingApi.reducerPath]: onboardingApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(onboardingApi.middleware),
    preloadedState,
  });
};

/**
 * Wrapper component that provides Redux store for testing
 */
interface TestProviderProps {
  store?: ReturnType<typeof createTestStore>;
}

const TestProvider: React.FC<PropsWithChildren<TestProviderProps>> = ({ children, store }) => {
  const testStore = store || createTestStore();

  return (
    <Provider store={testStore}>
      {children}
    </Provider>
  );
};

/**
 * Custom render function that includes Redux provider
 */
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    store?: ReturnType<typeof createTestStore>;
  }
) => {
  const { store, ...renderOptions } = options || {};

  const Wrapper: React.FC<PropsWithChildren> = ({ children }) => (
    <TestProvider store={store}>
      {children}
    </TestProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// =============================================================================
// TIME UTILITIES
// =============================================================================

/**
 * Mocks Date.now() to a fixed timestamp
 */
export const mockFixedDate = (dateString: string = '2024-01-15T10:00:00.000Z') => {
  const fixedDate = new Date(dateString);

  jest.spyOn(Date, 'now').mockReturnValue(fixedDate.getTime());
  jest.spyOn(global, 'Date').mockImplementation(((...args: any[]) => {
    if (args.length === 0) {
      return fixedDate;
    }
    return new (Date as any)(...args);
  }) as any);

  return fixedDate;
};

/**
 * Restores Date methods to their original implementations
 */
export const restoreDate = () => {
  jest.restoreAllMocks();
};

/**
 * Creates a series of mock dates for testing time progression
 */
export const createDateSequence = (startDate: string, intervalMinutes: number, count: number) => {
  const start = new Date(startDate);
  const dates = [];

  for (let i = 0; i < count; i++) {
    dates.push(new Date(start.getTime() + i * intervalMinutes * 60 * 1000));
  }

  return dates;
};

// =============================================================================
// ASYNC TESTING UTILITIES
// =============================================================================

/**
 * Waits for a specific number of milliseconds
 */
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Waits for a condition to become true
 */
export const waitForCondition = async (
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> => {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    if (condition()) {
      return;
    }
    await waitFor(interval);
  }

  throw new Error(`Condition not met within ${timeout}ms`);
};

/**
 * Flushes all pending promises
 */
export const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

// =============================================================================
// ERROR SIMULATION UTILITIES
// =============================================================================

/**
 * Creates common error scenarios for testing
 */
export const createErrorScenarios = () => ({
  networkError: new Error('Network connection failed'),
  validationError: new Error('Invalid email format'),
  notFoundError: new Error('Session not found'),
  expiredSessionError: new Error('Session has expired'),
  repositoryError: new Error('Database connection failed'),
  permissionError: new Error('Insufficient permissions'),
});

/**
 * Simulates repository errors for testing error handling
 */
export const simulateRepositoryError = (
  mockRepository: jest.Mocked<OnboardingRepository>,
  method: keyof OnboardingRepository,
  error: Error
) => {
  (mockRepository[method] as jest.Mock).mockResolvedValue(failure(error));
};

// =============================================================================
// EXPORTS
// =============================================================================

export {
  createTestStore,
  customRender as render,
  TestProvider,
};

// Export types for external use
export type {
  BusinessInfo,
  OnboardingSession,
  OnboardingSessionId,
  OnboardingStatus,
  OnboardingStep,
  SessionAnalytics,
};
