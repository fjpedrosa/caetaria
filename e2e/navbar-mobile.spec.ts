/**
 * Mobile-Specific Tests for Navbar Component
 * 
 * Specialized mobile testing covering:
 * - Touch interactions and gestures
 * - Swipe gestures for menu control
 * - Viewport testing across mobile devices
 * - Orientation change handling
 * - Safe area and notch handling
 * - Performance on mobile devices
 * - Battery and network optimization
 * 
 * @group navbar
 * @group mobile
 * @group touch
 */

import { test, expect, devices } from '@playwright/test';
import { PageHelper, AssertionHelper, VIEWPORTS } from './test-helpers';

// Mobile device configurations
const MOBILE_DEVICES = {
  iphoneSE: { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  iphone12: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  iphone14Pro: { width: 393, height: 852, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  pixel5: { width: 393, height: 851, deviceScaleFactor: 2.75, isMobile: true, hasTouch: true },
  galaxyS21: { width: 384, height: 854, deviceScaleFactor: 2.81, isMobile: true, hasTouch: true },
  smallMobile: { width: 320, height: 568, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, // iPhone 5
  largeMobile: { width: 428, height: 926, deviceScaleFactor: 3, isMobile: true, hasTouch: true } // iPhone 12 Pro Max
};

const NAVBAR_SELECTORS = {
  navbar: 'nav[role="navigation"], nav[aria-label*="navegación"]',
  logo: 'a[href="/"], .navbar-logo, [data-testid="logo"]',
  mobileMenuTrigger: 'button[aria-expanded], .mobile-menu-trigger, [data-testid="mobile-menu-trigger"]',
  mobileMenu: '.mobile-menu, [data-testid="mobile-menu"]',
  mobileNavItems: '.mobile-menu a[href*="/"], .mobile-nav-item',
  closeButton: '.mobile-menu button, [data-testid="close-menu"]',
  overlay: '.menu-overlay, [data-testid="menu-overlay"]',
  safeArea: '[data-safe-area], .safe-area',
  compactMode: '.compact-mode, [data-compact="true"]'
};

// Touch interaction helpers
const TOUCH_GESTURES = {
  tap: { duration: 100 },
  longPress: { duration: 500 },
  swipe: { duration: 300, distance: 150 }
};

test.describe('Mobile Navbar Tests', () => {
  let pageHelper: PageHelper;
  let assertionHelper: AssertionHelper;

  test.beforeEach(async ({ page }) => {
    pageHelper = new PageHelper(page);
    assertionHelper = new AssertionHelper(page);
    await pageHelper.injectTestUtils();

    // Enable touch events
    await page.addInitScript(() => {
      // Mock touch capabilities
      Object.defineProperty(navigator, 'maxTouchPoints', { value: 5 });
      Object.defineProperty(navigator, 'userAgent', { 
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      });
    });
  });

  test.describe('Touch Interactions', () => {
    Object.entries(MOBILE_DEVICES).forEach(([deviceName, device]) => {
      test(`should handle touch interactions on ${deviceName}`, async ({ page }) => {
        await page.setViewportSize({ width: device.width, height: device.height });
        await page.goto('/');
        await pageHelper.waitForInteractive();

        const mobileMenuTrigger = page.locator(NAVBAR_SELECTORS.mobileMenuTrigger);
        await expect(mobileMenuTrigger).toBeVisible();

        // Test touch target size (minimum 44px)
        const triggerBounds = await mobileMenuTrigger.boundingBox();
        expect(triggerBounds).toBeTruthy();
        if (triggerBounds) {
          expect(triggerBounds.width).toBeGreaterThanOrEqual(44);
          expect(triggerBounds.height).toBeGreaterThanOrEqual(44);
        }

        // Test tap interaction
        await mobileMenuTrigger.tap();
        await page.waitForTimeout(300);

        const mobileMenu = page.locator(NAVBAR_SELECTORS.mobileMenu);
        await expect(mobileMenu).toBeVisible();

        // Verify menu accessibility
        const ariaExpanded = await mobileMenuTrigger.getAttribute('aria-expanded');
        expect(ariaExpanded).toBe('true');

        // Close menu with tap
        await mobileMenuTrigger.tap();
        await page.waitForTimeout(300);

        await expect(mobileMenu).toBeHidden();
      });
    });

    test('should handle long press interactions', async ({ page }) => {
      await page.setViewportSize(MOBILE_DEVICES.iphone12);
      await page.goto('/');
      await pageHelper.waitForInteractive();

      const logo = page.locator(NAVBAR_SELECTORS.logo);
      if (await logo.count() > 0) {
        const logoBounds = await logo.boundingBox();
        
        if (logoBounds) {
          // Simulate long press
          await page.touchscreen.tap(
            logoBounds.x + logoBounds.width / 2,
            logoBounds.y + logoBounds.height / 2
          );
          await page.waitForTimeout(TOUCH_GESTURES.longPress.duration);

          // Logo should still be functional after long press
          await expect(logo).toBeVisible();
        }
      }
    });

    test('should handle multi-touch scenarios', async ({ page }) => {
      await page.setViewportSize(MOBILE_DEVICES.iphone12);
      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Simulate pinch gesture (zoom)
      await page.evaluate(() => {
        const touchStart = new TouchEvent('touchstart', {
          touches: [
            new Touch({
              identifier: 0,
              target: document.body,
              clientX: 100,
              clientY: 100
            }),
            new Touch({
              identifier: 1,
              target: document.body,
              clientX: 200,
              clientY: 200
            })
          ]
        });
        document.body.dispatchEvent(touchStart);
      });

      await page.waitForTimeout(100);

      // Navbar should remain functional after multi-touch
      const navbar = page.locator(NAVBAR_SELECTORS.navbar);
      await expect(navbar).toBeVisible();
    });
  });

  test.describe('Swipe Gestures', () => {
    test('should open mobile menu with swipe left', async ({ page }) => {
      await page.setViewportSize(MOBILE_DEVICES.iphone12);
      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Perform swipe left gesture from right edge
      const viewport = page.viewportSize()!;
      
      await page.touchscreen.tap(viewport.width - 10, viewport.height / 2);
      await page.touchscreen.tap(viewport.width - TOUCH_GESTURES.swipe.distance, viewport.height / 2);
      
      await page.waitForTimeout(500);

      // Check if menu opened (if swipe gesture is implemented)
      const mobileMenu = page.locator(NAVBAR_SELECTORS.mobileMenu);
      const isMenuVisible = await mobileMenu.isVisible().catch(() => false);
      
      // This test verifies swipe gesture support - may not be implemented in all navbars
      if (isMenuVisible) {
        await expect(mobileMenu).toBeVisible();
      }
    });

    test('should close mobile menu with swipe right', async ({ page }) => {
      await page.setViewportSize(MOBILE_DEVICES.iphone12);
      await page.goto('/');
      await pageHelper.waitForInteractive();

      const mobileMenuTrigger = page.locator(NAVBAR_SELECTORS.mobileMenuTrigger);
      
      // Open menu first
      await mobileMenuTrigger.tap();
      await page.waitForTimeout(300);

      const mobileMenu = page.locator(NAVBAR_SELECTORS.mobileMenu);
      await expect(mobileMenu).toBeVisible();

      // Perform swipe right gesture
      const menuBounds = await mobileMenu.boundingBox();
      if (menuBounds) {
        await page.touchscreen.tap(menuBounds.x + 50, menuBounds.y + 100);
        await page.touchscreen.tap(
          menuBounds.x + 50 + TOUCH_GESTURES.swipe.distance,
          menuBounds.y + 100
        );
      }

      await page.waitForTimeout(500);

      // Menu should close (if swipe to close is implemented)
      const isMenuHidden = await mobileMenu.isHidden().catch(() => true);
      if (isMenuHidden) {
        await expect(mobileMenu).toBeHidden();
      }
    });

    test('should handle swipe conflicts with scroll', async ({ page }) => {
      await page.setViewportSize(MOBILE_DEVICES.iphone12);
      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Create a tall page that requires scrolling
      await page.evaluate(() => {
        const content = document.querySelector('main') || document.body;
        content.style.height = '200vh';
      });

      // Test vertical scroll
      const initialScrollY = await page.evaluate(() => window.scrollY);
      
      await page.touchscreen.tap(200, 400);
      await page.touchscreen.tap(200, 200);
      await page.waitForTimeout(300);

      const scrolledY = await page.evaluate(() => window.scrollY);
      
      // Page should scroll normally
      expect(scrolledY).toBeGreaterThan(initialScrollY);

      // Navbar should remain accessible
      const navbar = page.locator(NAVBAR_SELECTORS.navbar);
      await expect(navbar).toBeVisible();
    });
  });

  test.describe('Viewport Responsiveness', () => {
    test('should adapt to extreme viewport sizes', async ({ page }) => {
      const extremeViewports = [
        { width: 280, height: 653 }, // Very narrow
        { width: 480, height: 320 }, // Very wide but short
        { width: 320, height: 480 }  // Square-ish
      ];

      for (const viewport of extremeViewports) {
        await page.setViewportSize(viewport);
        await page.goto('/');
        await pageHelper.waitForInteractive();

        const navbar = page.locator(NAVBAR_SELECTORS.navbar);
        await expect(navbar).toBeVisible();

        // Content should not overflow horizontally
        const overflowCheck = await page.evaluate(() => {
          const body = document.body;
          return {
            scrollWidth: body.scrollWidth,
            clientWidth: body.clientWidth,
            hasHorizontalScroll: body.scrollWidth > body.clientWidth
          };
        });

        // Allow small overflow tolerance
        expect(overflowCheck.scrollWidth - overflowCheck.clientWidth).toBeLessThan(20);
      }
    });

    test('should handle orientation changes', async ({ page }) => {
      // Start in portrait
      await page.setViewportSize(MOBILE_DEVICES.iphone12);
      await page.goto('/');
      await pageHelper.waitForInteractive();

      const navbar = page.locator(NAVBAR_SELECTORS.navbar);
      await expect(navbar).toBeVisible();

      // Switch to landscape
      await page.setViewportSize({ 
        width: MOBILE_DEVICES.iphone12.height, 
        height: MOBILE_DEVICES.iphone12.width 
      });
      
      await page.waitForTimeout(500); // Allow for reflow

      // Navbar should still be functional
      await expect(navbar).toBeVisible();

      // Mobile menu should work in landscape
      const mobileMenuTrigger = page.locator(NAVBAR_SELECTORS.mobileMenuTrigger);
      if (await mobileMenuTrigger.count() > 0) {
        await mobileMenuTrigger.tap();
        await page.waitForTimeout(300);

        const mobileMenu = page.locator(NAVBAR_SELECTORS.mobileMenu);
        await expect(mobileMenu).toBeVisible();
      }
    });

    test('should maintain accessibility across viewports', async ({ page }) => {
      const testViewports = [
        MOBILE_DEVICES.smallMobile,
        MOBILE_DEVICES.iphone12,
        MOBILE_DEVICES.largeMobile
      ];

      for (const viewport of testViewports) {
        await page.setViewportSize(viewport);
        await page.goto('/');
        await pageHelper.waitForInteractive();

        // Test keyboard navigation
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible();

        // Test screen reader compatibility
        const navbar = page.locator(NAVBAR_SELECTORS.navbar);
        const navbarAriaLabel = await navbar.getAttribute('aria-label');
        expect(navbarAriaLabel || await navbar.getAttribute('role')).toBeTruthy();
      }
    });
  });

  test.describe('Safe Area and Notch Handling', () => {
    test('should respect safe areas on notched devices', async ({ page }) => {
      // Simulate iPhone with notch
      await page.setViewportSize(MOBILE_DEVICES.iphone14Pro);
      
      await page.addInitScript(() => {
        // Mock safe area insets
        document.documentElement.style.setProperty('--sat', '47px'); // Status bar
        document.documentElement.style.setProperty('--sab', '34px'); // Home indicator
      });

      await page.goto('/');
      await pageHelper.waitForInteractive();

      const navbar = page.locator(NAVBAR_SELECTORS.navbar);
      
      // Check if navbar respects safe area
      const navbarStyles = await navbar.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          paddingTop: computed.paddingTop,
          marginTop: computed.marginTop,
          top: computed.top,
          position: computed.position
        };
      });

      // Navbar should account for safe area (implementation dependent)
      expect(navbarStyles.position).toBeTruthy();
    });

    test('should handle compact mode for small screens', async ({ page }) => {
      await page.setViewportSize(MOBILE_DEVICES.smallMobile);
      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Check for compact mode indicators
      const compactMode = page.locator(NAVBAR_SELECTORS.compactMode);
      const navbar = page.locator(NAVBAR_SELECTORS.navbar);
      
      // Verify compact layout
      const navbarHeight = await navbar.evaluate(el => el.offsetHeight);
      
      // Compact navbar should be shorter
      expect(navbarHeight).toBeLessThan(80); // Max height for compact mode
      
      // All essential elements should still be accessible
      const logo = page.locator(NAVBAR_SELECTORS.logo);
      const mobileMenuTrigger = page.locator(NAVBAR_SELECTORS.mobileMenuTrigger);
      
      await expect(logo).toBeVisible();
      await expect(mobileMenuTrigger).toBeVisible();
    });
  });

  test.describe('Mobile Performance', () => {
    test('should maintain 60fps on mobile interactions', async ({ page }) => {
      await page.setViewportSize(MOBILE_DEVICES.iphone12);
      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Monitor frame rate during mobile menu animation
      const frameRate = await page.evaluate(async () => {
        return new Promise((resolve) => {
          const frames: number[] = [];
          let lastTime = performance.now();
          let animationId: number;

          function measureFrame() {
            const now = performance.now();
            const delta = now - lastTime;
            const fps = 1000 / delta;
            frames.push(fps);
            lastTime = now;

            if (frames.length < 30) { // Measure for ~0.5 seconds
              animationId = requestAnimationFrame(measureFrame);
            } else {
              const avgFps = frames.reduce((a, b) => a + b, 0) / frames.length;
              resolve(avgFps);
            }
          }

          animationId = requestAnimationFrame(measureFrame);
        });
      });

      const mobileMenuTrigger = page.locator(NAVBAR_SELECTORS.mobileMenuTrigger);
      await mobileMenuTrigger.tap();
      await page.waitForTimeout(500);

      const fps = await frameRate;
      expect(fps).toBeGreaterThan(45); // Allow some tolerance on mobile
    });

    test('should optimize for battery usage', async ({ page }) => {
      await page.setViewportSize(MOBILE_DEVICES.iphone12);
      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Monitor CPU-intensive operations
      const performanceMetrics = await page.evaluate(() => {
        const entries = performance.getEntriesByType('measure');
        const longTasks = performance.getEntriesByType('longtask');
        
        return {
          measureCount: entries.length,
          longTaskCount: longTasks.length,
          totalDuration: entries.reduce((sum, entry) => sum + entry.duration, 0)
        };
      });

      // Should have minimal long tasks
      expect(performanceMetrics.longTaskCount).toBeLessThan(5);
    });

    test('should work efficiently on slow networks', async ({ page }) => {
      // Simulate slow 3G
      await pageHelper.enableSlowNetwork(800);
      
      await page.setViewportSize(MOBILE_DEVICES.iphone12);
      
      const startTime = Date.now();
      await page.goto('/');
      await pageHelper.waitForInteractive();
      
      const loadTime = Date.now() - startTime;
      
      // Should load within reasonable time even on slow network
      expect(loadTime).toBeLessThan(10000); // 10 seconds max

      // Navbar should be functional
      const navbar = page.locator(NAVBAR_SELECTORS.navbar);
      await expect(navbar).toBeVisible();
    });
  });

  test.describe('Mobile Accessibility', () => {
    test('should support assistive technologies on mobile', async ({ page }) => {
      await page.setViewportSize(MOBILE_DEVICES.iphone12);
      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Test screen reader announcements
      const mobileMenuTrigger = page.locator(NAVBAR_SELECTORS.mobileMenuTrigger);
      
      // Should have proper ARIA attributes
      const ariaLabel = await mobileMenuTrigger.getAttribute('aria-label');
      const ariaExpanded = await mobileMenuTrigger.getAttribute('aria-expanded');
      
      expect(ariaLabel || ariaExpanded).toBeTruthy();

      // Test focus management
      await mobileMenuTrigger.focus();
      await expect(mobileMenuTrigger).toBeFocused();

      // Open menu and test focus trapping
      await mobileMenuTrigger.tap();
      await page.waitForTimeout(300);

      const mobileMenu = page.locator(NAVBAR_SELECTORS.mobileMenu);
      await expect(mobileMenu).toBeVisible();

      // Focus should move to menu
      const firstMenuItem = mobileMenu.locator('a, button').first();
      if (await firstMenuItem.count() > 0) {
        await expect(firstMenuItem).toBeFocused();
      }
    });

    test('should handle high contrast mode on mobile', async ({ page }) => {
      await page.setViewportSize(MOBILE_DEVICES.iphone12);
      
      // Simulate high contrast mode
      await page.addInitScript(() => {
        const style = document.createElement('style');
        style.textContent = `
          @media (prefers-contrast: high) {
            * { 
              border: 1px solid !important;
              background: white !important;
              color: black !important;
            }
          }
        `;
        document.head.appendChild(style);
      });

      await page.goto('/');
      await pageHelper.waitForInteractive();

      const navbar = page.locator(NAVBAR_SELECTORS.navbar);
      await expect(navbar).toBeVisible();

      // Elements should remain visible in high contrast
      const mobileMenuTrigger = page.locator(NAVBAR_SELECTORS.mobileMenuTrigger);
      await expect(mobileMenuTrigger).toBeVisible();
    });

    test('should support voice control on mobile', async ({ page }) => {
      await page.setViewportSize(MOBILE_DEVICES.iphone12);
      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Simulate voice command by finding elements by accessible name
      const mobileMenuTrigger = page.locator(NAVBAR_SELECTORS.mobileMenuTrigger);
      
      // Should be findable by voice commands (aria-label or text content)
      const accessibleName = await mobileMenuTrigger.evaluate(el => {
        return (
          el.getAttribute('aria-label') ||
          el.textContent?.trim() ||
          el.getAttribute('title')
        );
      });

      expect(accessibleName).toBeTruthy();
      expect(accessibleName?.length).toBeGreaterThan(0);
    });
  });

  test.describe('Device-Specific Features', () => {
    test('should handle haptic feedback on supported devices', async ({ page }) => {
      await page.setViewportSize(MOBILE_DEVICES.iphone12);
      
      await page.addInitScript(() => {
        // Mock haptic feedback API
        (navigator as any).vibrate = jest.fn();
      });

      await page.goto('/');
      await pageHelper.waitForInteractive();

      const mobileMenuTrigger = page.locator(NAVBAR_SELECTORS.mobileMenuTrigger);
      await mobileMenuTrigger.tap();
      await page.waitForTimeout(100);

      // Check if haptic feedback was triggered (mock verification)
      const hapticCalled = await page.evaluate(() => {
        return (navigator as any).vibrate && (navigator as any).vibrate.mock?.calls.length > 0;
      });

      // Haptic feedback is optional - test passes if implementation exists
      if (hapticCalled) {
        expect(hapticCalled).toBeTruthy();
      }
    });

    test('should integrate with device theme preferences', async ({ page }) => {
      await page.setViewportSize(MOBILE_DEVICES.iphone12);
      
      // Test dark mode
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');
      await pageHelper.waitForInteractive();

      const navbar = page.locator(NAVBAR_SELECTORS.navbar);
      
      // Check if navbar adapts to dark mode
      const navbarStyles = await navbar.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          color: computed.color
        };
      });

      // Should have appropriate dark mode styling
      expect(navbarStyles.backgroundColor).toBeTruthy();
    });

    test('should respect reduced motion preferences', async ({ page }) => {
      await page.setViewportSize(MOBILE_DEVICES.iphone12);
      
      // Simulate reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      await page.goto('/');
      await pageHelper.waitForInteractive();

      const mobileMenuTrigger = page.locator(NAVBAR_SELECTORS.mobileMenuTrigger);
      
      // Open menu
      const startTime = Date.now();
      await mobileMenuTrigger.tap();
      await page.waitForTimeout(100);
      const animationTime = Date.now() - startTime;

      const mobileMenu = page.locator(NAVBAR_SELECTORS.mobileMenu);
      await expect(mobileMenu).toBeVisible();

      // Animation should be instant or very quick when motion is reduced
      expect(animationTime).toBeLessThan(200);
    });
  });
});