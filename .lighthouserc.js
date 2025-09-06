/**
 * Lighthouse CI Configuration
 * 
 * Automated performance, accessibility, and best practices auditing
 * for the navbar component and overall site performance.
 * 
 * @see https://github.com/GoogleChrome/lighthouse-ci
 */

module.exports = {
  ci: {
    collect: {
      // URLs to audit
      url: [
        'http://localhost:3000/', // Home page with navbar
        'http://localhost:3000/features', // Features page
        'http://localhost:3000/pricing', // Pricing page
        'http://localhost:3000/contact', // Contact page
      ],
      
      // Lighthouse collection settings
      numberOfRuns: 3, // Run each audit 3 times for consistency
      settings: {
        // Chrome flags for consistent testing
        chromeFlags: [
          '--headless',
          '--disable-gpu',
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-extensions',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=TranslateUI',
          '--disable-default-apps',
          '--disable-component-extensions-with-background-pages',
          '--disable-background-networking',
          '--disable-sync',
          '--metrics-recording-only',
        ],
        
        // Lighthouse configuration
        preset: 'desktop', // Test desktop performance by default
        
        // Custom config for navbar-specific metrics
        onlyCategories: [
          'performance',
          'accessibility',
          'best-practices',
          'seo'
        ],
        
        // Skip PWA audits (not relevant for navbar)
        skipAudits: [
          'installable-manifest',
          'splash-screen',
          'themed-omnibox',
          'maskable-icon',
          'offline-start-url'
        ],
        
        // Extended timeout for slower connections
        maxWaitForLoad: 45000,
        maxWaitForFcp: 15000,
        
        // Throttling settings
        throttlingMethod: 'simulate',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240, // 10 Mbps
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 10240,
          uploadThroughputKbps: 10240,
        },
        
        // Screen emulation for consistent results
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false,
        },
        
        // Form factor
        formFactor: 'desktop',
        
        // Locale settings
        locale: 'en-US',
        
        // Additional settings for navbar testing
        additionalTraceCategories: 'devtools.timeline,v8.execute,disabled-by-default-devtools.timeline',
        debugNavigation: true,
      },
      
      // Start local server for testing
      startServerCommand: 'npm run build && npm run start',
      startServerReadyPattern: 'ready',
      startServerReadyTimeout: 60000,
    },
    
    upload: {
      // Configure where to store results
      target: 'filesystem',
      outputDir: './lighthouse-results',
      reportFilenamePattern: '%%PATHNAME%%-%%DATETIME%%-report.%%EXTENSION%%',
    },
    
    assert: {
      // Performance thresholds
      assertions: {
        // Core Web Vitals
        'categories:performance': ['error', { minScore: 0.85 }], // 85% minimum
        'categories:accessibility': ['error', { minScore: 0.95 }], // 95% minimum
        'categories:best-practices': ['error', { minScore: 0.90 }], // 90% minimum
        'categories:seo': ['error', { minScore: 0.90 }], // 90% minimum
        
        // Specific metrics for navbar performance
        'first-contentful-paint': ['error', { maxNumericValue: 1500 }], // 1.5s
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }], // 2.5s
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }], // 0.1 CLS
        'total-blocking-time': ['error', { maxNumericValue: 300 }], // 300ms
        'speed-index': ['error', { maxNumericValue: 3000 }], // 3s
        'interactive': ['error', { maxNumericValue: 3500 }], // 3.5s TTI
        
        // Accessibility specific to navbar
        'color-contrast': 'error', // All elements must have sufficient contrast
        'focus-traps': 'error', // Focus management in mobile menu
        'focusable-controls': 'error', // All interactive elements focusable
        'keyboard-traps': 'error', // No keyboard traps
        'link-name': 'error', // All links have accessible names
        'button-name': 'error', // All buttons have accessible names
        
        // Performance optimizations
        'unused-css-rules': ['warn', { maxNumericValue: 20 }], // Max 20KB unused CSS
        'unused-javascript': ['warn', { maxNumericValue: 50 }], // Max 50KB unused JS
        'render-blocking-resources': 'error', // No render blocking resources
        'uses-responsive-images': 'error', // Responsive images
        'efficient-animated-content': 'error', // Efficient animations
        
        // Best practices for navbar
        'errors-in-console': 'error', // No console errors
        'uses-https': 'error', // HTTPS usage
        'no-vulnerable-libraries': 'error', // No vulnerable dependencies
        
        // SEO requirements
        'meta-description': 'error', // Meta description present
        'document-title': 'error', // Page title present
        'html-has-lang': 'error', // HTML lang attribute
        'meta-viewport': 'error', // Viewport meta tag
      },
    },
    
    // Server configuration for CI/CD
    server: {
      port: 9009,
      storage: {
        storageMethod: 'filesystem',
        storagePath: './lighthouse-server-storage',
      },
    },
  },
  
  // Mobile configuration
  mobile: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/features',
        'http://localhost:3000/pricing',
        'http://localhost:3000/contact',
      ],
      numberOfRuns: 3,
      settings: {
        // Mobile-specific Chrome flags
        chromeFlags: [
          '--headless',
          '--disable-gpu',
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-extensions'
        ],
        
        // Mobile configuration
        preset: 'mobile',
        formFactor: 'mobile',
        
        // Mobile screen emulation
        screenEmulation: {
          mobile: true,
          width: 375,
          height: 667,
          deviceScaleFactor: 2,
          disabled: false,
        },
        
        // Mobile throttling (3G)
        throttling: {
          rttMs: 150,
          throughputKbps: 1600,
          cpuSlowdownMultiplier: 4,
          requestLatencyMs: 150,
          downloadThroughputKbps: 1600,
          uploadThroughputKbps: 750,
        },
        
        onlyCategories: [
          'performance',
          'accessibility',
          'best-practices',
          'seo'
        ],
      },
    },
    
    assert: {
      assertions: {
        // More lenient mobile thresholds
        'categories:performance': ['error', { minScore: 0.70 }], // 70% on mobile
        'categories:accessibility': ['error', { minScore: 0.95 }], // Same accessibility standard
        'categories:best-practices': ['error', { minScore: 0.90 }],
        'categories:seo': ['error', { minScore: 0.90 }],
        
        // Mobile-specific metrics
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }], // 2s on mobile
        'largest-contentful-paint': ['error', { maxNumericValue: 4000 }], // 4s on mobile
        'total-blocking-time': ['error', { maxNumericValue: 600 }], // 600ms TBT
        'speed-index': ['error', { maxNumericValue: 4500 }], // 4.5s SI
        'interactive': ['error', { maxNumericValue: 5000 }], // 5s TTI
        
        // Touch and mobile accessibility
        'tap-targets': 'error', // Adequate touch target sizes
        'content-width': 'error', // Content fits viewport
      },
    },
  },
};