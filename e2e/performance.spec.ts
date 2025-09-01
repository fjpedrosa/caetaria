/**
 * Performance E2E Tests
 * Core Web Vitals, loading times, and performance benchmarks
 */

import { test, expect, Page } from '@playwright/test';

interface PerformanceMetrics {
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  FCP: number; // First Contentful Paint
  TTFB: number; // Time to First Byte
  loadTime: number;
  domContentLoaded: number;
  networkRequests: number;
  totalSize: number;
}

class PerformanceHelper {
  constructor(private page: Page) {}

  async collectWebVitals(): Promise<Partial<PerformanceMetrics>> {
    return await this.page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals: Partial<PerformanceMetrics> = {};
        
        // Collect Web Vitals using the web-vitals library if available
        if (typeof window !== 'undefined' && (window as any).webVitals) {
          const { getCLS, getFID, getFCP, getLCP, getTTFB } = (window as any).webVitals;
          
          getCLS((metric: any) => { vitals.CLS = metric.value; });
          getFID((metric: any) => { vitals.FID = metric.value; });
          getFCP((metric: any) => { vitals.FCP = metric.value; });
          getLCP((metric: any) => { vitals.LCP = metric.value; });
          getTTFB((metric: any) => { vitals.TTFB = metric.value; });
          
          setTimeout(() => resolve(vitals), 3000);
        } else {
          // Fallback to Performance API
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          
          vitals.TTFB = navigation.responseStart - navigation.requestStart;
          vitals.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart;
          vitals.loadTime = navigation.loadEventEnd - navigation.navigationStart;
          
          // Try to get LCP from Performance Observer
          try {
            const observer = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const lastEntry = entries[entries.length - 1];
              vitals.LCP = lastEntry.startTime;
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
          } catch (e) {
            // LCP not supported
          }
          
          setTimeout(() => resolve(vitals), 2000);
        }
      });
    });
  }

  async measurePageLoad(url: string): Promise<PerformanceMetrics> {
    const startTime = Date.now();
    
    // Track network requests
    const requests: any[] = [];
    this.page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType()
      });
    });
    
    let totalSize = 0;
    this.page.on('response', response => {
      if (response.ok()) {
        response.body().then(body => {
          totalSize += body.length;
        }).catch(() => {});
      }
    });

    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
    
    const endTime = Date.now();
    const webVitals = await this.collectWebVitals();
    
    const navigation = await this.page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: nav.domContentLoadedEventEnd - nav.navigationStart,
        loadComplete: nav.loadEventEnd - nav.navigationStart,
        ttfb: nav.responseStart - nav.requestStart
      };
    });

    return {
      loadTime: endTime - startTime,
      domContentLoaded: navigation.domContentLoaded,
      TTFB: navigation.ttfb,
      networkRequests: requests.length,
      totalSize,
      LCP: webVitals.LCP || 0,
      FID: webVitals.FID || 0,
      CLS: webVitals.CLS || 0,
      FCP: webVitals.FCP || 0
    };
  }

  async measureInteractionDelay(selector: string): Promise<number> {
    const startTime = Date.now();
    
    await this.page.click(selector);
    
    // Wait for any visual feedback or state change
    await this.page.waitForTimeout(100);
    
    return Date.now() - startTime;
  }

  async measureScriptExecutionTime(): Promise<number> {
    return await this.page.evaluate(() => {
      const startTime = performance.now();
      
      // Simulate heavy computation
      let result = 0;
      for (let i = 0; i < 100000; i++) {
        result += Math.random();
      }
      
      return performance.now() - startTime;
    });
  }

  async analyzeResourceLoading(): Promise<any[]> {
    return await this.page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      return resources.map(resource => ({
        name: resource.name,
        type: resource.initiatorType,
        size: resource.transferSize || 0,
        duration: resource.duration,
        blocked: resource.domainLookupStart - resource.fetchStart,
        dns: resource.domainLookupEnd - resource.domainLookupStart,
        connect: resource.connectEnd - resource.connectStart,
        request: resource.responseStart - resource.requestStart,
        response: resource.responseEnd - resource.responseStart
      }));
    });
  }

  async simulateSlowNetwork() {
    // Simulate slow 3G network
    await this.page.route('**/*', route => {
      setTimeout(() => route.continue(), Math.random() * 200 + 100);
    });
  }

  async simulateCPUThrottling() {
    // Inject CPU throttling simulation
    await this.page.evaluate(() => {
      // Override setTimeout to simulate slower execution
      const originalSetTimeout = window.setTimeout;
      (window as any).setTimeout = function(callback: Function, delay: number) {
        return originalSetTimeout(() => {
          const start = performance.now();
          while (performance.now() - start < 5) {} // Artificial delay
          callback();
        }, delay * 2); // Double the delay
      };
    });
  }
}

test.describe('Performance Benchmarks', () => {
  let perfHelper: PerformanceHelper;

  test.beforeEach(async ({ page }) => {
    perfHelper = new PerformanceHelper(page);
  });

  test.describe('Core Web Vitals', () => {
    test('should meet Core Web Vitals thresholds on landing page', async ({ page }) => {
      const metrics = await perfHelper.measurePageLoad('/');
      
      // Core Web Vitals thresholds (good ratings)
      expect(metrics.LCP).toBeLessThan(2500); // LCP < 2.5s
      expect(metrics.FID).toBeLessThan(100);  // FID < 100ms
      expect(metrics.CLS).toBeLessThan(0.1);  // CLS < 0.1
      
      // Additional performance metrics
      expect(metrics.FCP).toBeLessThan(1800); // FCP < 1.8s
      expect(metrics.TTFB).toBeLessThan(800); // TTFB < 800ms
      
      console.log('Performance Metrics:', metrics);
    });

    test('should meet performance thresholds on onboarding pages', async ({ page }) => {
      const onboardingPages = [
        '/onboarding/business',
        '/onboarding/integration',
        '/onboarding/bot-setup'
      ];

      for (const url of onboardingPages) {
        const metrics = await perfHelper.measurePageLoad(url);
        
        // Slightly more lenient thresholds for form-heavy pages
        expect(metrics.LCP).toBeLessThan(3000); // LCP < 3s
        expect(metrics.FCP).toBeLessThan(2000); // FCP < 2s
        expect(metrics.loadTime).toBeLessThan(5000); // Total load < 5s
        
        console.log(`${url} Performance:`, {
          LCP: metrics.LCP,
          FCP: metrics.FCP,
          loadTime: metrics.loadTime
        });
      }
    });

    test('should maintain performance under slow network conditions', async ({ page }) => {
      await perfHelper.simulateSlowNetwork();
      
      const metrics = await perfHelper.measurePageLoad('/');
      
      // More lenient thresholds for slow network
      expect(metrics.LCP).toBeLessThan(5000); // LCP < 5s
      expect(metrics.FCP).toBeLessThan(3000); // FCP < 3s
      expect(metrics.loadTime).toBeLessThan(10000); // Total load < 10s
    });
  });

  test.describe('Loading Performance', () => {
    test('should load critical resources quickly', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const resources = await perfHelper.analyzeResourceLoading();
      
      // Check critical resources
      const criticalResources = resources.filter(r => 
        r.type === 'script' || r.type === 'link' || r.name.includes('font')
      );
      
      for (const resource of criticalResources.slice(0, 5)) {
        expect(resource.duration).toBeLessThan(2000); // < 2s per resource
        
        if (resource.size > 0) {
          // Check for reasonable resource sizes
          if (resource.type === 'script') {
            expect(resource.size).toBeLessThan(500000); // JS < 500KB
          }
          if (resource.type === 'link' && resource.name.includes('.css')) {
            expect(resource.size).toBeLessThan(100000); // CSS < 100KB
          }
        }
      }
    });

    test('should minimize total page size', async ({ page }) => {
      const metrics = await perfHelper.measurePageLoad('/');
      
      // Total page size should be reasonable
      expect(metrics.totalSize).toBeLessThan(3000000); // < 3MB total
      expect(metrics.networkRequests).toBeLessThan(100); // < 100 requests
      
      console.log('Resource Summary:', {
        totalSize: `${(metrics.totalSize / 1024 / 1024).toFixed(2)}MB`,
        requests: metrics.networkRequests
      });
    });

    test('should load above-the-fold content quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      
      // Wait for hero section to be visible
      await page.waitForSelector('main section:first-child', { timeout: 3000 });
      const heroLoadTime = Date.now() - startTime;
      
      expect(heroLoadTime).toBeLessThan(2000); // Hero < 2s
      
      // Check that key elements are visible
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();
      
      const ctaButton = page.locator('button, a').filter({ hasText: /get started/i }).first();
      if (await ctaButton.count() > 0) {
        await expect(ctaButton).toBeVisible();
      }
    });
  });

  test.describe('Interaction Performance', () => {
    test('should respond quickly to user interactions', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Test button click response time
      const buttons = page.locator('button:visible');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(3, buttonCount); i++) {
        const button = buttons.nth(i);
        const delay = await perfHelper.measureInteractionDelay(button);
        expect(delay).toBeLessThan(100); // < 100ms response time
      }
    });

    test('should handle form interactions efficiently', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const form = page.locator('form').first();
      if (await form.isVisible()) {
        const inputs = form.locator('input, textarea');
        const inputCount = await inputs.count();
        
        for (let i = 0; i < Math.min(3, inputCount); i++) {
          const input = inputs.nth(i);
          const startTime = Date.now();
          
          await input.click();
          await input.fill('Test input');
          
          const interactionTime = Date.now() - startTime;
          expect(interactionTime).toBeLessThan(200); // < 200ms for form interactions
        }
      }
    });

    test('should maintain performance during rapid interactions', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Rapid clicking test
      const button = page.locator('button:visible').first();
      const startTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        await button.click({ timeout: 1000 });
        await page.waitForTimeout(50);
      }
      
      const totalTime = Date.now() - startTime;
      expect(totalTime).toBeLessThan(2000); // < 2s for 10 rapid clicks
    });
  });

  test.describe('JavaScript Performance', () => {
    test('should execute JavaScript efficiently', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const executionTime = await perfHelper.measureScriptExecutionTime();
      expect(executionTime).toBeLessThan(50); // < 50ms for test computation
    });

    test('should not block the main thread for extended periods', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Measure how long the main thread is blocked
      const blockingTime = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          const startTime = performance.now();
          
          const checkBlocking = () => {
            const currentTime = performance.now();
            const timeDiff = currentTime - startTime;
            
            if (timeDiff > 100) { // If it takes >100ms, main thread was blocked
              resolve(timeDiff);
            } else {
              setTimeout(checkBlocking, 0);
            }
          };
          
          checkBlocking();
          
          // Timeout after reasonable time
          setTimeout(() => resolve(0), 1000);
        });
      });
      
      expect(blockingTime).toBeLessThan(100); // Main thread shouldn't be blocked >100ms
    });

    test('should handle memory usage efficiently', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory ? {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize,
          limit: (performance as any).memory.jsHeapSizeLimit
        } : null;
      });
      
      if (initialMemory) {
        // Perform some interactions to potentially create memory usage
        await page.evaluate(() => {
          // Simulate user interactions that might create DOM nodes
          for (let i = 0; i < 100; i++) {
            const div = document.createElement('div');
            div.innerHTML = 'Test content';
            document.body.appendChild(div);
            document.body.removeChild(div);
          }
        });
        
        const finalMemory = await page.evaluate(() => {
          return (performance as any).memory ? {
            used: (performance as any).memory.usedJSHeapSize,
            total: (performance as any).memory.totalJSHeapSize,
            limit: (performance as any).memory.jsHeapSizeLimit
          } : null;
        });
        
        if (finalMemory) {
          const memoryIncrease = finalMemory.used - initialMemory.used;
          expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // < 10MB increase
        }
      }
    });
  });

  test.describe('Mobile Performance', () => {
    test('should perform well on mobile devices', async ({ page }) => {
      // Simulate mobile device
      await page.setViewportSize({ width: 375, height: 667 });
      await perfHelper.simulateCPUThrottling();
      
      const metrics = await perfHelper.measurePageLoad('/');
      
      // More lenient thresholds for mobile
      expect(metrics.LCP).toBeLessThan(4000); // LCP < 4s on mobile
      expect(metrics.FCP).toBeLessThan(2500); // FCP < 2.5s on mobile
      expect(metrics.loadTime).toBeLessThan(6000); // Total load < 6s
    });

    test('should handle touch interactions efficiently', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Test touch interactions
      const touchableElements = page.locator('button, a[role="button"], input');
      const count = await touchableElements.count();
      
      for (let i = 0; i < Math.min(3, count); i++) {
        const element = touchableElements.nth(i);
        if (await element.isVisible()) {
          const startTime = Date.now();
          await element.tap();
          const tapTime = Date.now() - startTime;
          
          expect(tapTime).toBeLessThan(150); // < 150ms for touch response
        }
      }
    });
  });

  test.describe('Progressive Loading', () => {
    test('should show loading states appropriately', async ({ page }) => {
      // Navigate to a page that might show loading states
      await page.goto('/onboarding/business');
      
      // Check for loading indicators during initial load
      const hasLoadingIndicators = await page.evaluate(() => {
        const spinners = document.querySelectorAll('.animate-spin, .spinner, [data-loading]');
        const skeletons = document.querySelectorAll('.animate-pulse, .skeleton, [data-skeleton]');
        return spinners.length > 0 || skeletons.length > 0;
      });
      
      // Loading states are good UX, not required
      if (hasLoadingIndicators) {
        console.log('✓ Loading indicators found');
      }
    });

    test('should prioritize critical content loading', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      
      // Critical content should appear quickly
      await page.waitForSelector('h1', { timeout: 2000 });
      const h1LoadTime = Date.now() - startTime;
      
      await page.waitForSelector('nav', { timeout: 3000 });
      const navLoadTime = Date.now() - startTime;
      
      expect(h1LoadTime).toBeLessThan(2000); // Main heading < 2s
      expect(navLoadTime).toBeLessThan(3000); // Navigation < 3s
      
      // Secondary content can load later
      const footer = page.locator('footer');
      if (await footer.count() > 0) {
        // Footer doesn't need to be as fast
        await expect(footer).toBeVisible({ timeout: 10000 });
      }
    });
  });

  test.describe('Performance Under Load', () => {
    test('should handle multiple simultaneous operations', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Simulate multiple concurrent operations
      const operations = [
        page.evaluate(() => fetch('/api/health').catch(() => {})),
        page.evaluate(() => {
          // Simulate DOM manipulation
          for (let i = 0; i < 50; i++) {
            const div = document.createElement('div');
            document.body.appendChild(div);
            document.body.removeChild(div);
          }
        }),
        page.hover('button:visible'),
        page.evaluate(() => window.scrollBy(0, 100))
      ];
      
      const startTime = Date.now();
      await Promise.all(operations);
      const totalTime = Date.now() - startTime;
      
      expect(totalTime).toBeLessThan(2000); // All operations < 2s
    });

    test('should maintain responsiveness during background tasks', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Start a background task
      page.evaluate(async () => {
        // Simulate background processing
        const worker = new Worker('data:application/javascript;base64,' + 
          btoa(`
            let counter = 0;
            setInterval(() => {
              counter++;
              if (counter % 1000 === 0) {
                self.postMessage(counter);
              }
            }, 1);
          `)
        );
        
        setTimeout(() => worker.terminate(), 5000);
      });
      
      // Test that UI remains responsive
      const button = page.locator('button:visible').first();
      if (await button.count() > 0) {
        const startTime = Date.now();
        await button.click();
        const clickTime = Date.now() - startTime;
        
        expect(clickTime).toBeLessThan(200); // UI still responsive
      }
    });
  });
});
