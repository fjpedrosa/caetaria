/**
 * Visual Regression E2E Tests
 * Screenshot comparison tests for UI consistency
 */

import { test, expect, Page } from '@playwright/test';

interface ScreenshotOptions {
  fullPage?: boolean;
  mask?: string[];
  clip?: { x: number; y: number; width: number; height: number };
  animations?: 'disabled' | 'allow';
  threshold?: number;
}

class VisualTestHelper {
  constructor(private page: Page) {}

  async takeScreenshot(name: string, options: ScreenshotOptions = {}) {
    const defaultOptions = {
      fullPage: false,
      animations: 'disabled' as const,
      threshold: 0.2,
      ...options
    };

    // Disable animations for consistent screenshots
    if (defaultOptions.animations === 'disabled') {
      await this.page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
            scroll-behavior: auto !important;
          }
        `
      });
    }

    // Wait for any pending animations or transitions
    await this.page.waitForTimeout(500);

    // Take screenshot with masking for dynamic content
    const locators = options.mask ? options.mask.map(selector => this.page.locator(selector)) : [];

    await expect(this.page).toHaveScreenshot(`${name}.png`, {
      fullPage: defaultOptions.fullPage,
      clip: defaultOptions.clip,
      threshold: defaultOptions.threshold,
      mask: locators
    });
  }

  async waitForStableContent() {
    // Wait for images to load
    await this.page.waitForLoadState('networkidle');
    
    // Wait for any lazy-loaded content
    await this.page.waitForTimeout(1000);
    
    // Wait for fonts to load
    await this.page.waitForFunction(() => document.fonts.ready);
  }

  async maskDynamicContent() {
    // Common dynamic content selectors to mask
    return [
      '[data-testid="timestamp"]',
      '[data-testid="random-id"]',
      '.animate-spin',
      '.animate-pulse',
      '[class*="animate-"]'
    ];
  }

  async scrollToElement(selector: string) {
    const element = this.page.locator(selector);
    await element.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300);
  }

  async hoverElement(selector: string) {
    await this.page.hover(selector);
    await this.page.waitForTimeout(300);
  }

  async focusElement(selector: string) {
    await this.page.focus(selector);
    await this.page.waitForTimeout(300);
  }
}

test.describe('Visual Regression Testing', () => {
  let visualHelper: VisualTestHelper;

  test.beforeEach(async ({ page }) => {
    visualHelper = new VisualTestHelper(page);
    
    // Set consistent viewport for reproducible screenshots
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test.describe('Landing Page Components', () => {
    test('should match hero section visual design', async ({ page }) => {
      await page.goto('/');
      await visualHelper.waitForStableContent();
      
      // Screenshot the hero section
      const heroSection = page.locator('[data-section="hero"], .hero, section').first();
      await heroSection.scrollIntoViewIfNeeded();
      
      await expect(heroSection).toHaveScreenshot('hero-section.png', {
        threshold: 0.2
      });
    });

    test('should match WhatsApp simulator design', async ({ page }) => {
      await page.goto('/');
      await visualHelper.waitForStableContent();
      
      // Wait for simulator to load and animate
      const simulator = page.getByRole('img', { name: /demostración avanzada/i });
      await expect(simulator).toBeVisible();
      await page.waitForTimeout(3000); // Allow for initial animation
      
      // Mask dynamic elements like timestamps
      const mask = await visualHelper.maskDynamicContent();
      mask.push('text=/\d{2}:\d{2}/');
      
      await visualHelper.takeScreenshot('whatsapp-simulator', {
        mask,
        threshold: 0.3 // Higher threshold for animated content
      });
    });

    test('should match lead capture form design', async ({ page }) => {
      await page.goto('/');
      await visualHelper.waitForStableContent();
      
      // Find and screenshot lead capture form
      const leadForm = page.locator('form').first();
      await leadForm.scrollIntoViewIfNeeded();
      
      await expect(leadForm).toHaveScreenshot('lead-capture-form.png', {
        threshold: 0.2
      });
    });

    test('should match features grid layout', async ({ page }) => {
      await page.goto('/');
      await visualHelper.waitForStableContent();
      
      // Screenshot features section
      const featuresSection = page.locator('[data-section="features"], section').filter({ hasText: /features/i }).first();
      if (await featuresSection.count() > 0) {
        await featuresSection.scrollIntoViewIfNeeded();
        await expect(featuresSection).toHaveScreenshot('features-grid.png');
      }
    });

    test('should match pricing section design', async ({ page }) => {
      await page.goto('/');
      await visualHelper.waitForStableContent();
      
      // Screenshot pricing section
      const pricingSection = page.locator('[data-section="pricing"], section').filter({ hasText: /pricing|plan/i }).first();
      if (await pricingSection.count() > 0) {
        await pricingSection.scrollIntoViewIfNeeded();
        await expect(pricingSection).toHaveScreenshot('pricing-section.png');
      }
    });

    test('should match testimonials carousel', async ({ page }) => {
      await page.goto('/');
      await visualHelper.waitForStableContent();
      
      // Screenshot testimonials section
      const testimonialsSection = page.locator('[data-section="testimonials"], section').filter({ hasText: /testimonial/i }).first();
      if (await testimonialsSection.count() > 0) {
        await testimonialsSection.scrollIntoViewIfNeeded();
        await expect(testimonialsSection).toHaveScreenshot('testimonials-carousel.png');
      }
    });

    test('should match FAQ section design', async ({ page }) => {
      await page.goto('/');
      await visualHelper.waitForStableContent();
      
      // Screenshot FAQ section
      const faqSection = page.locator('[data-section="faq"], section').filter({ hasText: /faq|question/i }).first();
      if (await faqSection.count() > 0) {
        await faqSection.scrollIntoViewIfNeeded();
        await expect(faqSection).toHaveScreenshot('faq-section.png');
      }
    });
  });

  test.describe('Onboarding Flow Screens', () => {
    test('should match business info step design', async ({ page }) => {
      await page.goto('/onboarding/business');
      await visualHelper.waitForStableContent();
      
      await visualHelper.takeScreenshot('onboarding-business-step', {
        fullPage: true
      });
    });

    test('should match WhatsApp integration step', async ({ page }) => {
      await page.goto('/onboarding/integration');
      await visualHelper.waitForStableContent();
      
      await visualHelper.takeScreenshot('onboarding-integration-step', {
        fullPage: true
      });
    });

    test('should match bot setup step design', async ({ page }) => {
      await page.goto('/onboarding/bot-setup');
      await visualHelper.waitForStableContent();
      
      await visualHelper.takeScreenshot('onboarding-bot-setup-step', {
        fullPage: true
      });
    });

    test('should match completion step design', async ({ page }) => {
      await page.goto('/onboarding/complete');
      await visualHelper.waitForStableContent();
      
      await visualHelper.takeScreenshot('onboarding-complete-step', {
        fullPage: true
      });
    });

    test('should match progress indicator design', async ({ page }) => {
      await page.goto('/onboarding/business');
      await visualHelper.waitForStableContent();
      
      // Screenshot just the progress indicator
      const progressIndicator = page.locator('[data-testid="progress"], .progress, .stepper').first();
      if (await progressIndicator.count() > 0) {
        await expect(progressIndicator).toHaveScreenshot('onboarding-progress-indicator.png');
      }
    });
  });

  test.describe('Interactive States', () => {
    test('should capture hover states for buttons', async ({ page }) => {
      await page.goto('/');
      await visualHelper.waitForStableContent();
      
      // Test primary CTA button hover
      const primaryCta = page.locator('button').filter({ hasText: /get started|start free/i }).first();
      if (await primaryCta.isVisible()) {
        await visualHelper.hoverElement(primaryCta);
        await expect(primaryCta).toHaveScreenshot('button-hover-primary.png');
      }
      
      // Test secondary button hover
      const secondaryButton = page.locator('button').filter({ hasText: /learn more|demo/i }).first();
      if (await secondaryButton.isVisible()) {
        await visualHelper.hoverElement(secondaryButton);
        await expect(secondaryButton).toHaveScreenshot('button-hover-secondary.png');
      }
    });

    test('should capture focus states for form elements', async ({ page }) => {
      await page.goto('/');
      await visualHelper.waitForStableContent();
      
      // Test input focus states
      const inputs = page.locator('input[type="text"], input[type="email"]');
      const count = await inputs.count();
      
      for (let i = 0; i < Math.min(3, count); i++) {
        const input = inputs.nth(i);
        if (await input.isVisible()) {
          await visualHelper.focusElement(input);
          await expect(input).toHaveScreenshot(`input-focus-${i}.png`);
        }
      }
    });

    test('should capture error states in forms', async ({ page }) => {
      await page.goto('/');
      await visualHelper.waitForStableContent();
      
      // Trigger validation errors
      const form = page.locator('form').first();
      if (await form.isVisible()) {
        const submitButton = form.locator('button[type="submit"]');
        await submitButton.click();
        
        // Wait for validation errors to appear
        await page.waitForTimeout(1000);
        
        await expect(form).toHaveScreenshot('form-validation-errors.png');
      }
    });

    test('should capture loading states', async ({ page }) => {
      // Mock slow API to capture loading state
      await page.route('**/api/**', route => {
        setTimeout(() => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true })
          });
        }, 5000);
      });

      await page.goto('/');
      await visualHelper.waitForStableContent();
      
      // Submit form to trigger loading state
      const form = page.locator('form').first();
      if (await form.isVisible()) {
        await page.fill('input[name="firstName"]', 'Test');
        await page.fill('input[name="email"]', 'test@example.com');
        
        const submitButton = form.locator('button[type="submit"]');
        await submitButton.click();
        
        // Capture loading state quickly
        await page.waitForTimeout(500);
        await expect(submitButton).toHaveScreenshot('button-loading-state.png');
      }
    });
  });

  test.describe('Mobile Visual Testing', () => {
    test('should match mobile layout for hero section', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await visualHelper.waitForStableContent();
      
      // Screenshot mobile hero
      const heroSection = page.locator('section').first();
      await expect(heroSection).toHaveScreenshot('mobile-hero-section.png');
    });

    test('should match mobile form layout', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await visualHelper.waitForStableContent();
      
      // Screenshot mobile form
      const form = page.locator('form').first();
      if (await form.isVisible()) {
        await form.scrollIntoViewIfNeeded();
        await expect(form).toHaveScreenshot('mobile-form-layout.png');
      }
    });

    test('should match mobile navigation', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await visualHelper.waitForStableContent();
      
      // Screenshot mobile navigation
      const nav = page.locator('nav').first();
      await expect(nav).toHaveScreenshot('mobile-navigation.png');
      
      // Test mobile menu if present
      const mobileMenuTrigger = page.locator('button[aria-label*="menu"], .mobile-menu-trigger').first();
      if (await mobileMenuTrigger.isVisible()) {
        await mobileMenuTrigger.click();
        await page.waitForTimeout(500);
        
        const mobileMenu = page.locator('.mobile-menu, [data-mobile-menu="true"]').first();
        if (await mobileMenu.isVisible()) {
          await expect(mobileMenu).toHaveScreenshot('mobile-menu-open.png');
        }
      }
    });

    test('should match tablet layout', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      await visualHelper.waitForStableContent();
      
      await visualHelper.takeScreenshot('tablet-layout', {
        fullPage: true,
        threshold: 0.3
      });
    });
  });

  test.describe('Dark Mode and Theming', () => {
    test('should match dark mode design if supported', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');
      await visualHelper.waitForStableContent();
      
      // Check if dark mode is actually implemented
      const backgroundColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });
      
      // Only test if dark mode changes the background
      if (backgroundColor !== 'rgb(255, 255, 255)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        await visualHelper.takeScreenshot('dark-mode-layout', {
          fullPage: true
        });
      }
    });

    test('should match high contrast mode', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light', forcedColors: 'active' });
      await page.goto('/');
      await visualHelper.waitForStableContent();
      
      await visualHelper.takeScreenshot('high-contrast-layout', {
        fullPage: true,
        threshold: 0.5 // Higher threshold for high contrast mode
      });
    });
  });

  test.describe('Animation and Transition States', () => {
    test('should capture component entrance animations', async ({ page }) => {
      await page.goto('/');
      
      // Don't wait for stable content to catch animations
      await page.waitForSelector('main');
      await page.waitForTimeout(100);
      
      // Allow animations for this test
      await visualHelper.takeScreenshot('entrance-animations', {
        animations: 'allow',
        threshold: 0.4
      });
    });

    test('should capture modal/dialog states', async ({ page }) => {
      await page.goto('/');
      await visualHelper.waitForStableContent();
      
      // Look for modal triggers
      const modalTriggers = page.locator('button, a').filter({ hasText: /modal|popup|dialog/i });
      const triggerCount = await modalTriggers.count();
      
      if (triggerCount > 0) {
        await modalTriggers.first().click();
        await page.waitForTimeout(500);
        
        // Screenshot the modal
        const modal = page.locator('[role="dialog"], .modal, [aria-modal="true"]').first();
        if (await modal.isVisible()) {
          await expect(modal).toHaveScreenshot('modal-dialog-open.png');
        }
      }
    });

    test('should capture tooltip states', async ({ page }) => {
      await page.goto('/');
      await visualHelper.waitForStableContent();
      
      // Look for elements that might have tooltips
      const tooltipTriggers = page.locator('[data-tooltip], [title], [aria-describedby]');
      const count = await tooltipTriggers.count();
      
      for (let i = 0; i < Math.min(3, count); i++) {
        const trigger = tooltipTriggers.nth(i);
        if (await trigger.isVisible()) {
          await trigger.hover();
          await page.waitForTimeout(500);
          
          // Look for tooltip
          const tooltip = page.locator('.tooltip, [role="tooltip"]').first();
          if (await tooltip.isVisible()) {
            await expect(tooltip).toHaveScreenshot(`tooltip-${i}.png`);
          }
        }
      }
    });
  });

  test.describe('Cross-Browser Consistency', () => {
    test('should maintain consistent layout across browsers', async ({ page, browserName }) => {
      await page.goto('/');
      await visualHelper.waitForStableContent();
      
      // Take browser-specific screenshots for comparison
      await visualHelper.takeScreenshot(`browser-${browserName}-layout`, {
        fullPage: true,
        threshold: 0.3
      });
    });

    test('should handle font rendering differences', async ({ page }) => {
      await page.goto('/');
      await visualHelper.waitForStableContent();
      
      // Screenshot text-heavy sections
      const textSections = page.locator('h1, h2, p').filter({ hasText: /.{20,}/ });
      const count = await textSections.count();
      
      for (let i = 0; i < Math.min(3, count); i++) {
        const section = textSections.nth(i);
        if (await section.isVisible()) {
          await section.scrollIntoViewIfNeeded();
          await expect(section).toHaveScreenshot(`text-rendering-${i}.png`, {
            threshold: 0.3
          });
        }
      }
    });
  });

  test.describe('Error State Visuals', () => {
    test('should match 404 error page design', async ({ page }) => {
      await page.goto('/non-existent-page');
      await page.waitForLoadState('networkidle');
      
      // If a custom 404 page exists
      if (await page.locator('text=404, text=not found').count() > 0) {
        await visualHelper.takeScreenshot('404-error-page', {
          fullPage: true
        });
      }
    });

    test('should match API error states', async ({ page }) => {
      // Mock API errors
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' })
        });
      });

      await page.goto('/');
      await visualHelper.waitForStableContent();
      
      // Try to trigger API error
      const form = page.locator('form').first();
      if (await form.isVisible()) {
        await page.fill('input[name="firstName"]', 'Test');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.locator('button[type="submit"]').click();
        
        // Wait for error state
        await page.waitForTimeout(2000);
        
        await expect(form).toHaveScreenshot('api-error-state.png');
      }
    });
  });
});
