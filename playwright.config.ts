import { defineConfig, devices } from '@playwright/test';

/**
 * Enhanced Playwright Configuration for Comprehensive E2E Testing
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry configuration - more retries for visual tests */
  retries: process.env.CI ? 3 : 1,
  
  /* Worker configuration - balance parallelism with resource usage */
  workers: process.env.CI ? 2 : undefined,
  
  /* Enhanced reporting for comprehensive test results */
  reporter: process.env.CI 
    ? [['github'], ['junit', { outputFile: 'test-results/junit.xml' }], ['html']]
    : [['html'], ['list'], ['json', { outputFile: 'test-results/results.json' }]],
  
  /* Shared settings for all projects */
  use: {
    /* Base URL */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    /* Enhanced tracing */
    trace: 'retain-on-failure',
    
    /* Screenshot configuration */
    screenshot: 'only-on-failure',
    
    /* Video recording */
    video: 'retain-on-failure',
    
    /* Timeout settings */
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    /* Ignore HTTPS errors for local development */
    ignoreHTTPSErrors: true,
    
    /* Collect HAR files for network analysis - disabled for compatibility */
    // recordHar: process.env.RECORD_HAR ? { path: 'test-results/network.har' } : undefined,
    
    /* Additional context options */
    extraHTTPHeaders: {
      // Add headers for testing
      'X-Test-Environment': 'playwright',
    },
  },

  /* Test projects configuration */
  projects: [
    // Setup project for dependency installation
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      teardown: 'cleanup',
    },
    
    // Cleanup project
    {
      name: 'cleanup',
      testMatch: /.*\.cleanup\.ts/,
    },

    /* Desktop browsers */
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        // Enable additional Chrome features for testing
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=TranslateUI',
            '--disable-extensions',
            '--disable-component-extensions-with-background-pages',
          ],
        },
      },
      dependencies: ['setup'],
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
      dependencies: ['setup'],
    },

    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
      dependencies: ['setup'],
    },

    /* Mobile testing */
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        // Mobile-specific settings
        hasTouch: true,
        isMobile: true,
      },
      dependencies: ['setup'],
    },
    
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        hasTouch: true,
        isMobile: true,
      },
      dependencies: ['setup'],
    },
    
    /* Tablet testing */
    {
      name: 'iPad',
      use: {
        ...devices['iPad Pro'],
        hasTouch: true,
      },
      dependencies: ['setup'],
    },

    /* Accessibility-focused testing */
    {
      name: 'accessibility',
      testMatch: '**/accessibility.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        // Enable accessibility features
        launchOptions: {
          args: [
            '--force-prefers-reduced-motion',
            '--disable-backgrounding-occluded-windows',
          ],
        },
      },
      dependencies: ['setup'],
    },

    /* Performance testing */
    {
      name: 'performance',
      testMatch: '**/performance.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        // Optimize for performance testing
        launchOptions: {
          args: [
            '--enable-precise-memory-info',
            '--enable-logging',
            '--log-level=0',
          ],
        },
      },
      dependencies: ['setup'],
    },

    /* Visual regression testing */
    {
      name: 'visual',
      testMatch: '**/visual-regression.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        // Optimize for visual consistency
        launchOptions: {
          args: [
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
          ],
        },
      },
      dependencies: ['setup'],
    },

    /* Slow network simulation */
    {
      name: 'slow-network',
      testMatch: '**/performance.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        // Simulate slow 3G
        launchOptions: {
          args: [
            '--force-effective-connection-type=3g',
          ],
        },
      },
      dependencies: ['setup'],
    },
  ],

  /* Development server configuration */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      NODE_ENV: 'test',
      NEXT_PUBLIC_TESTING: 'true',
    },
  },
  
  /* Global setup and teardown */
  globalSetup: './e2e/global-setup.ts',
  
  /* Test timeout configuration */
  timeout: process.env.CI ? 45 * 1000 : 30 * 1000, // Longer timeout in CI
  
  /* Expect timeout */
  expect: {
    timeout: 10 * 1000, // Longer expect timeout for complex assertions
    // Visual comparison threshold
    toHaveScreenshot: {
      threshold: 0.2,
    },
    toMatchSnapshot: {
      threshold: 0.2,
    },
  },
  
  /* Output directories */
  outputDir: 'test-results/',
  
  /* Metadata for test reports */
  metadata: {
    testEnvironment: process.env.NODE_ENV || 'development',
    buildId: process.env.BUILD_ID || 'local',
    branch: process.env.BRANCH || 'main',
  },
  
  /* Test pattern configuration */
  testMatch: [
    '**/*.spec.ts',
    '**/*.test.ts',
    '**/*.e2e.ts',
  ],
  
  /* Test ignore patterns */
  testIgnore: [
    '**/node_modules/**',
    '**/build/**',
    '**/dist/**',
  ],
});