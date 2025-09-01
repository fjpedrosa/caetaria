module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'Ready on',
      startServerReadyTimeout: 60000,
      url: [
        'http://localhost:3000',
        'http://localhost:3000/onboarding/business',
        'http://localhost:3000/onboarding/integration',
        'http://localhost:3000/onboarding/bot-setup',
        'http://localhost:3000/onboarding/testing',
        'http://localhost:3000/onboarding/verification',
        'http://localhost:3000/onboarding/complete',
      ],
      settings: {
        chromeFlags: ['--no-sandbox', '--disable-dev-shm-usage'],
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0,
        },
        emulatedFormFactor: 'desktop',
        internalDisableDeviceScreenEmulation: true,
      },
    },
    assert: {
      assertions: {
        // Performance thresholds
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.90 }],
        'categories:seo': ['error', { minScore: 0.85 }],
        
        // Core Web Vitals
        'audits:largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'audits:interactive': ['error', { maxNumericValue: 3000 }],
        'audits:first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'audits:cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        
        // Performance metrics
        'audits:speed-index': ['error', { maxNumericValue: 3000 }],
        'audits:total-blocking-time': ['error', { maxNumericValue: 300 }],
        
        // Accessibility requirements (WCAG 2.1 AA)
        'audits:color-contrast': 'error',
        'audits:heading-order': 'error',
        'audits:html-has-lang': 'error',
        'audits:image-alt': 'error',
        'audits:label': 'error',
        'audits:link-name': 'error',
        'audits:skip-link': 'warn',
        'audits:focus-traps': 'warn',
        
        // SEO requirements
        'audits:document-title': 'error',
        'audits:meta-description': 'error',
        'audits:robots-txt': 'error',
        'audits:canonical': 'error',
        'audits:structured-data': 'warn',
        
        // Best practices
        'audits:errors-in-console': 'warn',
        'audits:no-vulnerable-libraries': 'error',
        'audits:uses-https': 'error',
        'audits:is-on-https': 'error',
        
        // Next.js specific optimizations
        'audits:unused-javascript': ['warn', { maxNumericValue: 20 }],
        'audits:unused-css-rules': ['warn', { maxNumericValue: 20 }],
        'audits:modern-image-formats': 'warn',
        'audits:efficiently-encode-images': 'warn',
        'audits:preload-lcp-image': 'warn',
        'audits:uses-responsive-images': 'warn',
        
        // Bundle size monitoring
        'audits:total-byte-weight': ['warn', { maxNumericValue: 1600000 }], // 1.6MB
        'audits:dom-size': ['warn', { maxNumericValue: 1500 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
      githubAppToken: process.env.LHCI_GITHUB_APP_TOKEN,
    },
    server: {
      port: 9001,
      storage: {
        storageMethod: 'filesystem',
        storagePath: './.lighthouseci',
      },
    },
  },
  
  // Mobile-specific configuration
  mobile: {
    collect: {
      numberOfRuns: 2,
      settings: {
        preset: 'mobile',
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4,
        },
        emulatedFormFactor: 'mobile',
        internalDisableDeviceScreenEmulation: false,
      },
    },
    assert: {
      assertions: {
        // More lenient mobile thresholds
        'categories:performance': ['error', { minScore: 0.75 }],
        'audits:largest-contentful-paint': ['error', { maxNumericValue: 4000 }],
        'audits:interactive': ['error', { maxNumericValue: 5000 }],
        'audits:first-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'audits:speed-index': ['error', { maxNumericValue: 4500 }],
        'audits:total-blocking-time': ['error', { maxNumericValue: 600 }],
        
        // Touch targets for mobile
        'audits:tap-targets': 'error',
        'audits:viewport': 'error',
      },
    },
  },
  
  // Development mode (more permissive)
  development: {
    collect: {
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.70 }],
        'categories:accessibility': ['error', { minScore: 0.90 }],
        'audits:largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
        'audits:interactive': ['warn', { maxNumericValue: 5000 }],
      },
    },
  },
};