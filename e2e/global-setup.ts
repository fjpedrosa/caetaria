/**
 * Playwright Global Setup
 * Enhanced setup configuration for comprehensive E2E tests
 */

import { FullConfig, chromium } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting comprehensive E2E test setup...');
  
  // 1. Verify development server is running or start it
  await verifyOrStartDevServer();
  
  // 2. Setup test data and environment
  await setupTestEnvironment();
  
  // 3. Warm up the application
  await warmupApplication();
  
  // 4. Setup performance monitoring
  await setupPerformanceMonitoring();
  
  console.log('✅ Global setup completed successfully');
}

async function verifyOrStartDevServer() {
  console.log('📡 Verifying development server...');
  
  try {
    // Check if server is already running
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    try {
      await page.goto('http://localhost:3000', { timeout: 5000 });
      console.log('✅ Development server is running');
    } catch (error) {
      console.log('❌ Development server not accessible');
      throw new Error('Development server must be running before tests');
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('❌ Failed to verify development server:', error);
    throw error;
  }
}

async function setupTestEnvironment() {
  console.log('🔧 Setting up test environment...');
  
  // Setup environment variables for testing
  process.env.NODE_ENV = 'test';
  process.env.NEXT_PUBLIC_TESTING = 'true';
  
  // Mock external services during E2E tests if needed
  process.env.MOCK_EXTERNAL_APIS = 'true';
  
  console.log('✅ Test environment configured');
}

async function warmupApplication() {
  console.log('🔥 Warming up application...');
  
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Warm up key pages to ensure consistent test performance
    const pagesToWarmup = [
      '/',
      '/onboarding/business',
      '/onboarding/integration',
      '/onboarding/bot-setup'
    ];
    
    for (const path of pagesToWarmup) {
      try {
        await page.goto(`http://localhost:3000${path}`, { 
          timeout: 10000,
          waitUntil: 'networkidle' 
        });
        console.log(`   ✅ Warmed up ${path}`);
      } catch (error) {
        console.log(`   ⚠️  Could not warm up ${path}`);
      }
    }
    
    await browser.close();
    console.log('✅ Application warmup completed');
  } catch (error) {
    console.log('⚠️  Application warmup failed, continuing...', error.message);
  }
}

async function setupPerformanceMonitoring() {
  console.log('📊 Setting up performance monitoring...');
  
  // Inject performance monitoring script that will be available in tests
  const performanceScript = `
    window.testPerformance = {
      marks: new Map(),
      measures: [],
      
      mark: function(name) {
        this.marks.set(name, performance.now());
      },
      
      measure: function(name, startMark, endMark) {
        const start = this.marks.get(startMark) || 0;
        const end = this.marks.get(endMark) || performance.now();
        const duration = end - start;
        this.measures.push({ name, duration, start, end });
        return duration;
      },
      
      getMetrics: function() {
        return {
          marks: Array.from(this.marks.entries()),
          measures: this.measures.slice()
        };
      },
      
      reset: function() {
        this.marks.clear();
        this.measures = [];
      }
    };
  `;
  
  // Store the script to be injected by tests
  (global as any).performanceScript = performanceScript;
  
  console.log('✅ Performance monitoring setup completed');
}

export default globalSetup;