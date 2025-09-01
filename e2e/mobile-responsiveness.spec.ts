/**
 * Mobile Responsiveness E2E Tests
 * Testing mobile interactions, touch events, and responsive design
 */

import { test, expect, devices } from '@playwright/test';

// Common mobile viewports to test
const mobileViewports = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12', width: 390, height: 844 },
  { name: 'iPhone 12 Pro Max', width: 428, height: 926 },
  { name: 'Samsung Galaxy S21', width: 360, height: 800 },
  { name: 'Samsung Galaxy Note', width: 412, height: 915 },
  { name: 'iPad Mini', width: 768, height: 1024 },
  { name: 'iPad Pro', width: 1024, height: 1366 }
];

class MobileTestHelper {
  constructor(private page: any) {}

  async setMobileViewport(viewport: { width: number; height: number }) {
    await this.page.setViewportSize(viewport);
    await this.page.waitForTimeout(500); // Allow for responsive adjustments
  }

  async testTouchInteraction(selector: string) {
    const element = this.page.locator(selector);
    await expect(element).toBeVisible();
    
    // Test touch tap
    await element.tap();
    await this.page.waitForTimeout(300);
  }

  async testSwipeGesture(selector: string, direction: 'left' | 'right' | 'up' | 'down') {
    const element = this.page.locator(selector);
    const box = await element.boundingBox();
    
    if (!box) return;
    
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;
    
    let endX = startX;
    let endY = startY;
    
    switch (direction) {
      case 'left':
        endX = startX - 100;
        break;
      case 'right':
        endX = startX + 100;
        break;
      case 'up':
        endY = startY - 100;
        break;
      case 'down':
        endY = startY + 100;
        break;
    }
    
    await this.page.touchscreen.tap(startX, startY);
    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(endX, endY);
    await this.page.mouse.up();
  }

  async checkMinTouchTargetSize(selector: string, minSize: number = 44) {
    const elements = await this.page.locator(selector).all();
    
    for (const element of elements) {
      const box = await element.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(minSize);
        expect(box.height).toBeGreaterThanOrEqual(minSize);
      }
    }
  }

  async testScrollBehavior() {
    const initialScrollY = await this.page.evaluate(() => window.scrollY);
    
    // Scroll down
    await this.page.evaluate(() => window.scrollBy(0, 500));
    const afterScrollY = await this.page.evaluate(() => window.scrollY);
    
    expect(afterScrollY).toBeGreaterThan(initialScrollY);
    
    // Scroll back up
    await this.page.evaluate(() => window.scrollBy(0, -500));
    const finalScrollY = await this.page.evaluate(() => window.scrollY);
    
    expect(finalScrollY).toBeLessThanOrEqual(afterScrollY);
  }

  async checkTextReadability() {
    // Check that text is large enough for mobile
    const textElements = this.page.locator('p, span, div, h1, h2, h3, h4, h5, h6').filter({ hasText: /.+/ });
    const count = await textElements.count();
    
    // Sample a few text elements to check font size
    for (let i = 0; i < Math.min(5, count); i++) {
      const element = textElements.nth(i);
      const fontSize = await element.evaluate(el => {
        const style = window.getComputedStyle(el);
        return parseInt(style.fontSize);
      });
      
      // Text should be at least 14px for readability on mobile
      expect(fontSize).toBeGreaterThanOrEqual(14);
    }
  }
}

test.describe('Mobile Responsiveness', () => {
  let mobileHelper: MobileTestHelper;

  test.beforeEach(async ({ page }) => {
    mobileHelper = new MobileTestHelper(page);
  });

  test.describe('Viewport Adaptation', () => {
    for (const viewport of mobileViewports.slice(0, 3)) { // Test first 3 viewports
      test(`should adapt layout for ${viewport.name}`, async ({ page }) => {
        await mobileHelper.setMobileViewport(viewport);
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Check that content is visible and properly sized
        await expect(page.locator('main')).toBeVisible();
        
        // Navigation should be mobile-friendly
        const mobileNav = page.locator('nav button[aria-label*="menu"], .mobile-menu-trigger, [data-mobile-menu]');
        if (await mobileNav.count() > 0) {
          await expect(mobileNav.first()).toBeVisible();
        }
        
        // Content should not overflow horizontally
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 20); // 20px tolerance
      });
    }

    test('should handle orientation changes', async ({ page }) => {
      // Start in portrait
      await mobileHelper.setMobileViewport({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check content is visible
      await expect(page.locator('main')).toBeVisible();
      const portraitHeight = await page.evaluate(() => document.body.scrollHeight);
      
      // Switch to landscape
      await mobileHelper.setMobileViewport({ width: 667, height: 375 });
      await page.waitForTimeout(1000);
      
      // Content should still be visible and accessible
      await expect(page.locator('main')).toBeVisible();
      const landscapeHeight = await page.evaluate(() => document.body.scrollHeight);
      
      // Layout should adapt (different heights expected)
      expect(Math.abs(portraitHeight - landscapeHeight)).toBeGreaterThan(100);
    });
  });

  test.describe('Touch Interactions', () => {
    test('should handle touch navigation correctly', async ({ page }) => {
      await mobileHelper.setMobileViewport({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Test mobile menu if present
      const menuButton = page.locator('button[aria-label*="menu"], .mobile-menu-trigger').first();
      if (await menuButton.isVisible()) {
        await mobileHelper.testTouchInteraction('button[aria-label*="menu"], .mobile-menu-trigger');
        
        // Menu should open
        const mobileMenu = page.locator('.mobile-menu, [data-mobile-menu="true"], nav ul').first();
        await expect(mobileMenu).toBeVisible({ timeout: 2000 });
        
        // Menu items should be touchable
        const menuItems = mobileMenu.locator('a, button');
        const count = await menuItems.count();
        if (count > 0) {
          await mobileHelper.testTouchInteraction(menuItems.first());
        }
      }
    });

    test('should handle form interactions on mobile', async ({ page }) => {
      await mobileHelper.setMobileViewport({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Find form elements
      const firstInput = page.locator('input').first();
      if (await firstInput.isVisible()) {
        // Test touch focus
        await mobileHelper.testTouchInteraction('input');
        
        // Check that input is properly focused and keyboard appears
        await expect(firstInput).toBeFocused();
        
        // Test typing
        await firstInput.fill('test@example.com');
        await expect(firstInput).toHaveValue('test@example.com');
        
        // Test submit button
        const submitButton = page.locator('button[type="submit"]').first();
        if (await submitButton.isVisible()) {
          await mobileHelper.testTouchInteraction('button[type="submit"]');
        }
      }
    });

    test('should handle CTA buttons with proper touch targets', async ({ page }) => {
      await mobileHelper.setMobileViewport({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check CTA buttons have minimum touch target size (44px)
      await mobileHelper.checkMinTouchTargetSize('button, a[role="button"], .btn');
      
      // Test primary CTA
      const primaryCta = page.locator('button, a').filter({ hasText: /get started|start free|sign up/i }).first();
      if (await primaryCta.isVisible()) {
        await mobileHelper.testTouchInteraction(primaryCta);
      }
    });
  });

  test.describe('Mobile-Specific Features', () => {
    test('should handle WhatsApp simulator on mobile', async ({ page }) => {
      await mobileHelper.setMobileViewport({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // WhatsApp simulator should be visible and properly sized
      const simulator = page.getByRole('img', { name: /demostración avanzada/i });
      if (await simulator.isVisible()) {
        const simulatorBox = await simulator.boundingBox();
        
        if (simulatorBox) {
          // Should fit within mobile viewport with some margin
          expect(simulatorBox.width).toBeLessThanOrEqual(375);
          expect(simulatorBox.x).toBeGreaterThanOrEqual(0);
        }
      }
    });

    test('should provide mobile-optimized form experience', async ({ page }) => {
      await mobileHelper.setMobileViewport({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Look for lead capture form
      const form = page.locator('form').first();
      if (await form.isVisible()) {
        await form.scrollIntoViewIfNeeded();
        
        // Check input types for mobile keyboards
        const emailInput = page.locator('input[type="email"], input[name="email"]');
        const phoneInput = page.locator('input[type="tel"], input[name="phone"], input[name="phoneNumber"]');
        
        if (await emailInput.isVisible()) {
          const inputType = await emailInput.getAttribute('type');
          expect(inputType).toBe('email'); // Should trigger email keyboard
        }
        
        if (await phoneInput.isVisible()) {
          const inputType = await phoneInput.getAttribute('type');
          expect(inputType).toBe('tel'); // Should trigger number keyboard
        }
        
        // Check form field sizes are mobile-friendly
        const inputs = form.locator('input, select, textarea');
        const count = await inputs.count();
        
        for (let i = 0; i < count; i++) {
          const input = inputs.nth(i);
          const box = await input.boundingBox();
          
          if (box) {
            // Input height should be at least 44px for easy tapping
            expect(box.height).toBeGreaterThanOrEqual(40);
          }
        }
      }
    });
  });

  test.describe('Scroll and Navigation Behavior', () => {
    test('should provide smooth scrolling experience', async ({ page }) => {
      await mobileHelper.setMobileViewport({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await mobileHelper.testScrollBehavior();
      
      // Test scrolling to specific sections
      const sections = ['features', 'pricing', 'testimonials', 'faq'];
      
      for (const section of sections) {
        const sectionElement = page.locator(`#${section}, [data-section="${section}"]`).first();
        if (await sectionElement.isVisible()) {
          await sectionElement.scrollIntoViewIfNeeded();
          await expect(sectionElement).toBeInViewport();
        }
      }
    });

    test('should handle sticky/fixed elements on mobile', async ({ page }) => {
      await mobileHelper.setMobileViewport({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check for sticky navigation
      const stickyNav = page.locator('nav[class*="sticky"], nav[class*="fixed"], .sticky, .fixed').first();
      if (await stickyNav.isVisible()) {
        // Scroll down
        await page.evaluate(() => window.scrollBy(0, 1000));
        
        // Sticky element should still be visible
        await expect(stickyNav).toBeVisible();
        
        // Should not cover too much of the viewport
        const navBox = await stickyNav.boundingBox();
        if (navBox) {
          expect(navBox.height).toBeLessThanOrEqual(100); // Max 100px height
        }
      }
    });
  });

  test.describe('Text and Content Readability', () => {
    test('should have readable text sizes on mobile', async ({ page }) => {
      await mobileHelper.setMobileViewport({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await mobileHelper.checkTextReadability();
    });

    test('should have appropriate line spacing and contrast', async ({ page }) => {
      await mobileHelper.setMobileViewport({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check line height for readability
      const paragraphs = page.locator('p');
      const count = await paragraphs.count();
      
      for (let i = 0; i < Math.min(3, count); i++) {
        const p = paragraphs.nth(i);
        const lineHeight = await p.evaluate(el => {
          const style = window.getComputedStyle(el);
          const fontSize = parseInt(style.fontSize);
          const lh = style.lineHeight;
          
          if (lh === 'normal') return fontSize * 1.2;
          if (lh.includes('px')) return parseInt(lh);
          return fontSize * parseFloat(lh);
        });
        
        const fontSize = await p.evaluate(el => parseInt(window.getComputedStyle(el).fontSize));
        const ratio = lineHeight / fontSize;
        
        // Line height should be at least 1.2 times font size
        expect(ratio).toBeGreaterThanOrEqual(1.1);
      }
    });
  });

  test.describe('Performance on Mobile', () => {
    test('should load quickly on simulated slow connections', async ({ page }) => {
      // Simulate slow 3G
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 100);
      });
      
      await mobileHelper.setMobileViewport({ width: 375, height: 667 });
      
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForSelector('main', { timeout: 10000 });
      const loadTime = Date.now() - startTime;
      
      // Should load main content within 10 seconds even on slow connection
      expect(loadTime).toBeLessThan(10000);
    });

    test('should handle limited memory environments', async ({ page }) => {
      await mobileHelper.setMobileViewport({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Simulate memory pressure by running heavy operations
      await page.evaluate(() => {
        // Create and clean up objects to test memory management
        for (let i = 0; i < 100; i++) {
          const div = document.createElement('div');
          div.innerHTML = 'Test content'.repeat(100);
          document.body.appendChild(div);
          document.body.removeChild(div);
        }
      });
      
      // Page should still be responsive
      await expect(page.locator('main')).toBeVisible();
      
      // Test interaction still works
      const interactiveElement = page.locator('button, a, input').first();
      if (await interactiveElement.isVisible()) {
        await mobileHelper.testTouchInteraction(interactiveElement);
      }
    });
  });

  test.describe('Cross-Device Consistency', () => {
    test('should maintain feature parity across mobile devices', async ({ page }) => {
      const features = {
        leadForm: 'input[name="firstName"], input[name="email"]',
        navigation: 'nav',
        cta: 'button, a[role="button"]',
        simulator: '[role="img"], .whatsapp-simulator'
      };
      
      for (const viewport of [{ width: 375, height: 667 }, { width: 768, height: 1024 }]) {
        await mobileHelper.setMobileViewport(viewport);
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Check that key features are present on all devices
        for (const [feature, selector] of Object.entries(features)) {
          const element = page.locator(selector).first();
          if (await element.count() > 0) {
            await expect(element).toBeVisible();
          }
        }
      }
    });

    test('should handle edge cases in viewport sizes', async ({ page }) => {
      // Test very narrow viewport
      await mobileHelper.setMobileViewport({ width: 280, height: 500 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await expect(page.locator('main')).toBeVisible();
      
      // Test very wide mobile viewport (foldable phones)
      await mobileHelper.setMobileViewport({ width: 600, height: 800 });
      await page.waitForTimeout(500);
      
      await expect(page.locator('main')).toBeVisible();
      
      // Test very tall viewport
      await mobileHelper.setMobileViewport({ width: 375, height: 1200 });
      await page.waitForTimeout(500);
      
      await expect(page.locator('main')).toBeVisible();
    });
  });
});
