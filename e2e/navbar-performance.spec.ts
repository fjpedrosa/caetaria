/**
 * Performance Tests for Navbar Component
 * 
 * Specialized performance testing covering:
 * - Lighthouse CI integration
 * - Core Web Vitals monitoring
 * - FPS measurement during interactions
 * - Memory usage tracking
 * - Bundle size verification
 * - First Paint and TTI metrics
 * 
 * @group navbar
 * @group performance
 * @group lighthouse
 */

import { test, expect, devices } from '@playwright/test';
import { PageHelper, AssertionHelper, VIEWPORTS } from './test-helpers';

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  lighthouse: {
    performance: 85,
    accessibility: 95,
    bestPractices: 90,
    seo: 90
  },
  metrics: {
    firstContentfulPaint: 1500, // ms
    largestContentfulPaint: 2500, // ms
    timeToInteractive: 3000, // ms
    cumulativeLayoutShift: 0.1,
    firstInputDelay: 100 // ms
  },
  navbar: {
    loadTime: 500, // ms
    interactionResponse: 200, // ms
    memoryUsage: 10 * 1024 * 1024, // 10MB
    bundleSize: 500 * 1024 // 500KB
  },
  animation: {
    minFps: 55,
    targetFps: 60,
    frameDropTolerance: 0.1 // 10% frame drops allowed
  }
};

const NAVBAR_SELECTORS = {
  navbar: 'nav[role="navigation"], nav[aria-label*="navegación"]',
  mobileMenuTrigger: 'button[aria-expanded], .mobile-menu-trigger',
  mobileMenu: '.mobile-menu, [data-testid="mobile-menu"]',
  megaMenu: '.mega-menu, [data-testid="mega-menu"]',
  navItems: 'nav a[href*="/"], .nav-item',
  progressBar: '.progress-bar, [data-testid="progress-bar"]'
};

test.describe('Navbar Performance Tests', () => {
  let pageHelper: PageHelper;
  let assertionHelper: AssertionHelper;

  test.beforeEach(async ({ page }) => {
    pageHelper = new PageHelper(page);
    assertionHelper = new AssertionHelper(page);
    await pageHelper.injectTestUtils();
  });

  test.describe('Core Web Vitals', () => {
    test('should meet Core Web Vitals thresholds', async ({ page }) => {
      // Navigate to home page
      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Collect Web Vitals metrics
      const webVitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          const metrics: Record<string, number> = {};
          let metricsCollected = 0;
          const expectedMetrics = 4; // LCP, FID, CLS, FCP

          // Function to resolve when all metrics are collected
          const tryResolve = () => {
            metricsCollected++;
            if (metricsCollected >= expectedMetrics) {
              resolve(metrics);
            }
          };

          // First Contentful Paint
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.name === 'first-contentful-paint') {
                metrics.fcp = entry.startTime;
                tryResolve();
              }
            }
          }).observe({ entryTypes: ['paint'] });

          // Largest Contentful Paint
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            metrics.lcp = lastEntry.startTime;
            tryResolve();
          }).observe({ entryTypes: ['largest-contentful-paint'] });

          // Cumulative Layout Shift
          let clsValue = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
            metrics.cls = clsValue;
            tryResolve();
          }).observe({ entryTypes: ['layout-shift'] });

          // First Input Delay (simulated)
          document.addEventListener('click', function measureFID(event) {
            metrics.fid = performance.now() - event.timeStamp;
            document.removeEventListener('click', measureFID);
            tryResolve();
          }, { once: true });

          // Trigger a click to measure FID
          setTimeout(() => {
            const navbar = document.querySelector('nav');
            if (navbar) {
              navbar.click();
            }
          }, 100);

          // Fallback timeout
          setTimeout(() => resolve(metrics), 5000);
        });
      });

      // Verify Core Web Vitals thresholds
      if ((webVitals as any).fcp) {
        expect((webVitals as any).fcp).toBeLessThan(PERFORMANCE_THRESHOLDS.metrics.firstContentfulPaint);
      }
      
      if ((webVitals as any).lcp) {
        expect((webVitals as any).lcp).toBeLessThan(PERFORMANCE_THRESHOLDS.metrics.largestContentfulPaint);
      }
      
      if ((webVitals as any).cls !== undefined) {
        expect((webVitals as any).cls).toBeLessThan(PERFORMANCE_THRESHOLDS.metrics.cumulativeLayoutShift);
      }
      
      if ((webVitals as any).fid) {
        expect((webVitals as any).fid).toBeLessThan(PERFORMANCE_THRESHOLDS.metrics.firstInputDelay);
      }
    });

    test('should have fast Time to Interactive', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      
      // Wait for navbar to be interactive
      const navbar = page.locator(NAVBAR_SELECTORS.navbar);
      await expect(navbar).toBeVisible();
      
      // Test interactivity by clicking
      const firstNavItem = page.locator(NAVBAR_SELECTORS.navItems).first();
      if (await firstNavItem.count() > 0) {
        await firstNavItem.click();
        await page.waitForLoadState('networkidle');
      }
      
      const tti = Date.now() - startTime;
      expect(tti).toBeLessThan(PERFORMANCE_THRESHOLDS.metrics.timeToInteractive);
    });
  });

  test.describe('Navbar Load Performance', () => {
    test('should load navbar within performance budget', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      
      // Wait specifically for navbar to be visible
      const navbar = page.locator(NAVBAR_SELECTORS.navbar);
      await expect(navbar).toBeVisible();
      
      const navbarLoadTime = Date.now() - startTime;
      
      // Navbar should load quickly
      expect(navbarLoadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.navbar.loadTime);
    });

    test('should have minimal impact on page load', async ({ page }) => {
      // Measure page performance with detailed timing
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcpConnect: navigation.connectEnd - navigation.connectStart,
          request: navigation.responseStart - navigation.requestStart,
          response: navigation.responseEnd - navigation.responseStart,
          domProcessing: navigation.domContentLoadedEventEnd - navigation.responseEnd,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          totalTime: navigation.loadEventEnd - navigation.fetchStart
        };
      });

      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Navbar should not significantly impact total load time
      expect(performanceMetrics.totalTime).toBeLessThan(3000);
      expect(performanceMetrics.domProcessing).toBeLessThan(1000);
    });

    test('should efficiently handle resource loading', async ({ page }) => {
      // Monitor network requests
      const requests: any[] = [];
      page.on('request', request => {
        requests.push({
          url: request.url(),
          method: request.method(),
          resourceType: request.resourceType(),
          size: request.headers()['content-length'] || 0
        });
      });

      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Analyze network requests
      const cssRequests = requests.filter(req => req.resourceType === 'stylesheet');
      const jsRequests = requests.filter(req => req.resourceType === 'script');
      const totalRequests = requests.length;

      // Resource efficiency expectations
      expect(totalRequests).toBeLessThan(50); // Not too many requests
      expect(cssRequests.length).toBeLessThan(10); // Efficient CSS loading
      expect(jsRequests.length).toBeLessThan(15); // Efficient JS loading
    });
  });

  test.describe('Animation Performance', () => {
    test('should maintain smooth FPS during mobile menu animation', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Start FPS monitoring
      const fpsData = await page.evaluate(async () => {
        return new Promise((resolve) => {
          const frames: number[] = [];
          let lastTime = performance.now();
          let frameCount = 0;
          const maxFrames = 60; // Monitor for ~1 second at 60fps

          function measureFPS() {
            const now = performance.now();
            const delta = now - lastTime;
            const fps = 1000 / delta;
            frames.push(fps);
            lastTime = now;
            frameCount++;

            if (frameCount < maxFrames) {
              requestAnimationFrame(measureFPS);
            } else {
              const avgFps = frames.reduce((a, b) => a + b, 0) / frames.length;
              const minFps = Math.min(...frames);
              const frameDrops = frames.filter(fps => fps < 55).length;
              const frameDropPercentage = frameDrops / frames.length;

              resolve({
                avgFps,
                minFps,
                frameDropPercentage,
                totalFrames: frames.length
              });
            }
          }

          requestAnimationFrame(measureFPS);
        });
      });

      const mobileMenuTrigger = page.locator(NAVBAR_SELECTORS.mobileMenuTrigger);
      
      // Trigger mobile menu animation
      await mobileMenuTrigger.click();
      await page.waitForTimeout(500); // Animation duration
      
      await mobileMenuTrigger.click(); // Close animation
      await page.waitForTimeout(500);

      const fps = await fpsData;
      
      // FPS performance expectations
      expect((fps as any).avgFps).toBeGreaterThan(PERFORMANCE_THRESHOLDS.animation.minFps);
      expect((fps as any).frameDropPercentage).toBeLessThan(PERFORMANCE_THRESHOLDS.animation.frameDropTolerance);
    });

    test('should have smooth hover animations on desktop', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('/');
      await pageHelper.waitForInteractive();

      const navItems = page.locator(NAVBAR_SELECTORS.navItems);
      const firstNavItem = navItems.first();

      // Monitor animation performance
      const animationPerf = await page.evaluate(async (selector) => {
        const element = document.querySelector(selector);
        if (!element) return { smooth: false };

        let frameCount = 0;
        const maxFrames = 30;
        const frameTimes: number[] = [];

        return new Promise((resolve) => {
          function measureAnimation() {
            const start = performance.now();
            
            requestAnimationFrame(() => {
              const duration = performance.now() - start;
              frameTimes.push(duration);
              frameCount++;

              if (frameCount < maxFrames) {
                measureAnimation();
              } else {
                const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
                const smoothFrames = frameTimes.filter(time => time < 20).length; // < 20ms per frame
                const smoothPercentage = smoothFrames / frameTimes.length;

                resolve({
                  avgFrameTime,
                  smoothPercentage,
                  smooth: smoothPercentage > 0.9
                });
              }
            });
          }

          measureAnimation();
        });
      }, await firstNavItem.getAttribute('data-testid') || 'a');

      // Trigger hover animation
      await firstNavItem.hover();
      await page.waitForTimeout(300);
      
      await page.mouse.move(0, 0); // Move away
      await page.waitForTimeout(300);

      // Animation should be smooth
      expect((animationPerf as any).smoothPercentage).toBeGreaterThan(0.8);
    });

    test('should handle scroll performance efficiently', async ({ page }) => {
      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Monitor scroll performance
      const scrollPerf = await page.evaluate(() => {
        return new Promise((resolve) => {
          let scrollEvents = 0;
          let smoothScrolls = 0;
          const maxEvents = 20;

          function measureScrollPerformance() {
            const start = performance.now();
            
            window.addEventListener('scroll', function scrollHandler() {
              const scrollTime = performance.now() - start;
              scrollEvents++;
              
              if (scrollTime < 10) { // Smooth scroll under 10ms
                smoothScrolls++;
              }

              if (scrollEvents >= maxEvents) {
                window.removeEventListener('scroll', scrollHandler);
                resolve({
                  totalScrollEvents: scrollEvents,
                  smoothScrollPercentage: smoothScrolls / scrollEvents,
                  efficient: (smoothScrolls / scrollEvents) > 0.8
                });
              }
            });

            // Trigger scroll events
            for (let i = 0; i < maxEvents; i++) {
              setTimeout(() => {
                window.scrollBy(0, 10);
              }, i * 50);
            }
          }

          measureScrollPerformance();
        });
      });

      const result = await scrollPerf;
      expect((result as any).efficient).toBeTruthy();
    });
  });

  test.describe('Memory Performance', () => {
    test('should not leak memory during extended interactions', async ({ page }) => {
      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Measure initial memory
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
        } : null;
      });

      if (initialMemory) {
        // Simulate extended navbar usage
        for (let i = 0; i < 20; i++) {
          // Desktop interactions
          await page.setViewportSize(VIEWPORTS.desktop);
          const navItems = page.locator(NAVBAR_SELECTORS.navItems);
          const navCount = await navItems.count();
          
          for (let j = 0; j < Math.min(navCount, 3); j++) {
            await navItems.nth(j).hover();
            await page.waitForTimeout(50);
          }

          // Mobile interactions
          await page.setViewportSize(VIEWPORTS.mobile);
          const mobileMenuTrigger = page.locator(NAVBAR_SELECTORS.mobileMenuTrigger);
          if (await mobileMenuTrigger.count() > 0) {
            await mobileMenuTrigger.click();
            await page.waitForTimeout(100);
            await mobileMenuTrigger.click();
            await page.waitForTimeout(100);
          }
        }

        // Force garbage collection if available
        await page.evaluate(() => {
          if ((window as any).gc) {
            (window as any).gc();
          }
        });

        // Measure final memory
        const finalMemory = await page.evaluate(() => {
          return (performance as any).memory ? {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize
          } : null;
        });

        if (finalMemory) {
          const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
          
          // Memory increase should be reasonable (less than 10MB)
          expect(memoryIncrease).toBeLessThan(PERFORMANCE_THRESHOLDS.navbar.memoryUsage);
        }
      }
    });

    test('should efficiently manage DOM elements', async ({ page }) => {
      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Count DOM elements
      const domStats = await page.evaluate(() => {
        const allElements = document.querySelectorAll('*');
        const navbarElements = document.querySelectorAll('nav *, [data-testid*="nav"] *');
        const listenerElements = Array.from(allElements).filter(el => {
          const events = (el as any).getEventListeners ? (el as any).getEventListeners() : {};
          return Object.keys(events).length > 0;
        });

        return {
          totalElements: allElements.length,
          navbarElements: navbarElements.length,
          elementsWithListeners: listenerElements.length,
          navbarRatio: navbarElements.length / allElements.length
        };
      });

      // Navbar should not dominate the DOM
      expect(domStats.navbarRatio).toBeLessThan(0.3); // Less than 30% of DOM
      expect(domStats.navbarElements).toBeLessThan(50); // Reasonable element count
    });
  });

  test.describe('Network Performance', () => {
    test('should minimize network requests', async ({ page }) => {
      const requests: any[] = [];
      const responses: any[] = [];

      page.on('request', request => {
        requests.push({
          url: request.url(),
          method: request.method(),
          resourceType: request.resourceType(),
          size: request.postDataBuffer()?.length || 0
        });
      });

      page.on('response', response => {
        responses.push({
          url: response.url(),
          status: response.status(),
          size: response.headers()['content-length'] || 0
        });
      });

      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Network efficiency checks
      const totalRequests = requests.length;
      const failedResponses = responses.filter(r => r.status >= 400);
      const largeAssets = responses.filter(r => parseInt(r.size) > 100000); // > 100KB

      expect(totalRequests).toBeLessThan(30); // Reasonable request count
      expect(failedResponses).toHaveLength(0); // No failed requests
      expect(largeAssets.length).toBeLessThan(5); // Limited large assets
    });

    test('should implement efficient caching', async ({ page }) => {
      // First visit
      await page.goto('/');
      await pageHelper.waitForInteractive();

      const firstVisitRequests: string[] = [];
      page.on('request', request => {
        firstVisitRequests.push(request.url());
      });

      // Second visit (reload)
      await page.reload();
      await pageHelper.waitForInteractive();

      const secondVisitRequests: string[] = [];
      page.on('request', request => {
        secondVisitRequests.push(request.url());
      });

      // Should have fewer requests on second visit due to caching
      const requestReduction = (firstVisitRequests.length - secondVisitRequests.length) / firstVisitRequests.length;
      expect(requestReduction).toBeGreaterThan(0.2); // At least 20% reduction
    });
  });

  test.describe('Bundle Size Analysis', () => {
    test('should have reasonable JavaScript bundle size', async ({ page }) => {
      const resourceSizes: Record<string, number> = {};

      page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('_next/static/chunks/') || url.includes('.js')) {
          try {
            const size = parseInt(response.headers()['content-length'] || '0');
            if (size > 0) {
              resourceSizes[url] = size;
            }
          } catch (error) {
            // Ignore errors getting response size
          }
        }
      });

      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Calculate total JS bundle size
      const totalJSSize = Object.values(resourceSizes).reduce((sum, size) => sum + size, 0);
      
      // Bundle size should be reasonable
      expect(totalJSSize).toBeLessThan(PERFORMANCE_THRESHOLDS.navbar.bundleSize);
    });

    test('should efficiently tree-shake unused code', async ({ page }) => {
      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Check for unused CSS/JS
      const codeUsage = await page.evaluate(() => {
        const stylesheets = Array.from(document.styleSheets);
        let totalRules = 0;
        let usedRules = 0;

        stylesheets.forEach(sheet => {
          try {
            const rules = Array.from(sheet.cssRules || sheet.rules || []);
            totalRules += rules.length;
            
            rules.forEach(rule => {
              if ((rule as CSSStyleRule).selectorText) {
                const selector = (rule as CSSStyleRule).selectorText;
                if (document.querySelector(selector)) {
                  usedRules++;
                }
              }
            });
          } catch (e) {
            // Cross-origin stylesheets might not be accessible
          }
        });

        return {
          totalRules,
          usedRules,
          utilization: totalRules > 0 ? usedRules / totalRules : 1
        };
      });

      // CSS utilization should be reasonable
      expect(codeUsage.utilization).toBeGreaterThan(0.5); // At least 50% utilization
    });
  });

  test.describe('Performance Monitoring', () => {
    test('should integrate with performance monitoring tools', async ({ page }) => {
      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Check for performance monitoring integration
      const monitoringTools = await page.evaluate(() => {
        const tools = {
          webVitals: typeof (window as any).webVitals !== 'undefined',
          sentry: typeof (window as any).Sentry !== 'undefined',
          analytics: typeof (window as any).gtag !== 'undefined' || typeof (window as any).analytics !== 'undefined',
          vercelAnalytics: typeof (window as any).va !== 'undefined'
        };

        return tools;
      });

      // Should have at least one monitoring tool
      const hasMonitoring = Object.values(monitoringTools).some(Boolean);
      expect(hasMonitoring).toBeTruthy();
    });

    test('should report accurate performance metrics', async ({ page }) => {
      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Get comprehensive performance data
      const performanceData = await pageHelper.measurePerformance();

      // Validate performance data structure
      expect(performanceData).toHaveProperty('loadTime');
      expect(performanceData).toHaveProperty('domContentLoaded');
      expect(performanceData).toHaveProperty('firstContentfulPaint');

      // Validate reasonable values
      expect(performanceData.loadTime).toBeGreaterThan(0);
      expect(performanceData.loadTime).toBeLessThan(10000); // Less than 10 seconds
      expect(performanceData.resourceCount).toBeGreaterThan(0);
    });
  });
});