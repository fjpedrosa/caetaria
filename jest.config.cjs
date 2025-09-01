const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^~/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/file-mock.js',
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/e2e/',
    '<rootDir>/playwright-tests/'
  ],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  collectCoverageFrom: [
    'src/modules/**/*.{js,jsx,ts,tsx}',
    'src/lib/supabase/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/examples/**',
    '!**/scenarios/**',
    '!**/__tests__/**',
    '!**/__mocks__/**',
    '!**/*.test.{js,jsx,ts,tsx}',
    '!**/*.spec.{js,jsx,ts,tsx}',
    '!**/test-data/**',
    '!**/test-utils/**',
  ],
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 90,
      statements: 90,
    },
    // WhatsApp Simulator (existing strict requirements)
    'src/modules/whatsapp-simulator/domain/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    'src/modules/whatsapp-simulator/application/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    // Marketing Module (strict requirements for business logic)
    'src/modules/marketing/domain/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    'src/modules/marketing/application/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    // Onboarding Module
    'src/modules/onboarding/domain/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    'src/modules/onboarding/application/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    // Analytics Module
    'src/modules/analytics/domain/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    'src/modules/analytics/application/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    // Supabase infrastructure layer
    'src/lib/supabase/': {
      branches: 85,
      functions: 85,
      lines: 90,
      statements: 90,
    },
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '<rootDir>/performance/**/*.test.{js,jsx,ts,tsx}',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  setupFiles: [
    'jest-canvas-mock',
    '<rootDir>/src/__mocks__/supabase/setup.ts'
  ],
  testTimeout: 10000,
  maxWorkers: '50%',
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },
  // Test database configuration for integration tests
  // globalSetup: '<rootDir>/src/__mocks__/supabase/global-setup.ts',
  // globalTeardown: '<rootDir>/src/__mocks__/supabase/global-teardown.ts',
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|rxjs|framer-motion))',
  ],
};

module.exports = createJestConfig(customJestConfig);