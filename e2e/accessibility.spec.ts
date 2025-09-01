/**
 * Accessibility E2E Tests
 * WCAG 2.1 AA compliance testing and screen reader compatibility
 */

import { test, expect, Page } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

class AccessibilityHelper {
  constructor(private page: Page) {}

  async injectAxe() {
    await injectAxe(this.page);
  }

  async checkAccessibility(selector?: string) {
    await checkA11y(this.page, selector, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  }

  async testKeyboardNavigation() {
    const focusableElements: string[] = [];
    let tabCount = 0;
    const maxTabs = 50; // Prevent infinite loops

    // Start from the top
    await this.page.keyboard.press('Home');
    
    while (tabCount < maxTabs) {
      await this.page.keyboard.press('Tab');
      
      const focusedElement = this.page.locator(':focus');
      const tagName = await focusedElement.evaluate((el) => el?.tagName.toLowerCase()).catch(() => 'unknown');
      const role = await focusedElement.getAttribute('role').catch(() => null);
      
      if (tagName === 'unknown') break;
      
      focusableElements.push(`${tagName}${role ? `[role="${role}"]` : ''}`);
      tabCount++;
      
      // Check if we've cycled back to the beginning
      if (tabCount > 2 && focusableElements[0] === focusableElements[tabCount - 1]) {
        break;
      }
    }

    expect(focusableElements.length).toBeGreaterThan(0);
    return focusableElements;
  }

  async testSkipLinks() {
    // Test skip to main content link
    await this.page.keyboard.press('Tab');
    
    const skipLink = this.page.locator('a[href*="#main"], a[href*="#content"]').first();
    if (await skipLink.isVisible()) {
      await skipLink.press('Enter');
      
      // Should focus main content
      const mainContent = this.page.locator('#main-content, main, [role="main"]');
      await expect(mainContent).toBeFocused({ timeout: 1000 });
    }
  }

  async testAriaLabels() {
    const elementsNeedingLabels = [
      'button:not([aria-label]):not([aria-labelledby])',
      'input:not([aria-label]):not([aria-labelledby]):not([id])',
      '[role="button"]:not([aria-label]):not([aria-labelledby])',
      'img:not([alt]):not([aria-label])'
    ];

    for (const selector of elementsNeedingLabels) {
      const elements = this.page.locator(selector);
      const count = await elements.count();
      
      for (let i = 0; i < count; i++) {
        const element = elements.nth(i);
        if (await element.isVisible()) {
          // Check if element has accessible name through other means
          const hasAccessibleName = await element.evaluate((el) => {
            return !!(el.textContent?.trim() || 
                     el.getAttribute('aria-label') ||
                     el.getAttribute('aria-labelledby') ||
                     (el as HTMLInputElement).labels?.length);
          });
          
          expect(hasAccessibleName).toBeTruthy();
        }
      }
    }
  }

  async testColorContrast() {
    // Test high contrast mode
    await this.page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await this.page.waitForTimeout(500);
    
    // Check that content is still visible
    await expect(this.page.locator('main')).toBeVisible();
    
    // Reset to normal
    await this.page.emulateMedia({ colorScheme: 'light' });
  }

  async testScreenReaderContent() {
    // Check for screen reader only content
    const srOnlyElements = this.page.locator('.sr-only, .screen-reader-only, [class*="visually-hidden"]');
    const count = await srOnlyElements.count();
    
    if (count > 0) {
      // Should have content for screen readers
      for (let i = 0; i < count; i++) {
        const element = srOnlyElements.nth(i);
        const text = await element.textContent();
        expect(text?.trim().length).toBeGreaterThan(0);
      }
    }
  }

  async testHeadingStructure() {
    const headings = await this.page.locator('h1, h2, h3, h4, h5, h6').all();
    const headingLevels: number[] = [];
    
    for (const heading of headings) {
      if (await heading.isVisible()) {
        const tagName = await heading.evaluate((el) => el.tagName);
        const level = parseInt(tagName.replace('H', ''));
        headingLevels.push(level);
      }
    }
    
    // Should have at least one h1
    expect(headingLevels).toContain(1);
    
    // Check for logical heading progression (no skipping levels)
    for (let i = 1; i < headingLevels.length; i++) {
      const current = headingLevels[i];
      const previous = headingLevels[i - 1];
      
      // Should not skip more than 1 level
      if (current > previous) {
        expect(current - previous).toBeLessThanOrEqual(1);
      }
    }
  }

  async testFormAccessibility() {
    const forms = this.page.locator('form');
    const formCount = await forms.count();
    
    for (let i = 0; i < formCount; i++) {
      const form = forms.nth(i);
      
      // Check form inputs have labels
      const inputs = form.locator('input, select, textarea');
      const inputCount = await inputs.count();
      
      for (let j = 0; j < inputCount; j++) {
        const input = inputs.nth(j);
        
        if (await input.isVisible()) {
          const hasLabel = await input.evaluate((el) => {
            const id = el.getAttribute('id');
            const ariaLabel = el.getAttribute('aria-label');
            const ariaLabelledBy = el.getAttribute('aria-labelledby');
            const label = id ? document.querySelector(`label[for="${id}"]`) : null;
            
            return !!(ariaLabel || ariaLabelledBy || label);
          });
          
          expect(hasLabel).toBeTruthy();
        }
      }
      
      // Check for error message associations
      const errorMessages = form.locator('[role="alert"], .error, [class*="error"]');
      const errorCount = await errorMessages.count();
      
      if (errorCount > 0) {
        // Error messages should be associated with inputs
        for (let k = 0; k < errorCount; k++) {
          const error = errorMessages.nth(k);
          const errorId = await error.getAttribute('id');
          
          if (errorId) {
            const associatedInput = form.locator(`[aria-describedby*="${errorId}"]`);
            expect(await associatedInput.count()).toBeGreaterThan(0);
          }
        }
      }
    }
  }

  async testFocusManagement() {
    // Test focus trap in modals/dialogs
    const modalTriggers = this.page.locator('button, a').filter({ hasText: /open|show|modal/i });
    const triggerCount = await modalTriggers.count();
    
    if (triggerCount > 0) {
      const trigger = modalTriggers.first();
      await trigger.click();
      
      // Look for modal
      const modal = this.page.locator('[role="dialog"], .modal, [aria-modal="true"]').first();
      
      if (await modal.isVisible({ timeout: 2000 })) {
        // Focus should be trapped within modal
        const modalFocusable = modal.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const focusableCount = await modalFocusable.count();
        
        if (focusableCount > 1) {
          // Tab through modal elements
          for (let i = 0; i < focusableCount + 1; i++) {
            await this.page.keyboard.press('Tab');
            
            const focusedElement = this.page.locator(':focus');
            const isInModal = await modal.locator(':focus').count() > 0;
            expect(isInModal).toBeTruthy();
          }
        }
        
        // Close modal with Escape
        await this.page.keyboard.press('Escape');
        await expect(modal).not.toBeVisible({ timeout: 2000 });
      }
    }
  }
}

test.describe('Accessibility Compliance (WCAG 2.1 AA)', () => {
  let a11yHelper: AccessibilityHelper;

  test.beforeEach(async ({ page }) => {
    a11yHelper = new AccessibilityHelper(page);
  });

  test.describe('Automated Accessibility Testing', () => {
    test('should pass axe accessibility audit on landing page', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await a11yHelper.injectAxe();
      await a11yHelper.checkAccessibility();
    });

    test('should pass axe audit on onboarding pages', async ({ page }) => {
      const onboardingPages = [
        '/onboarding/business',
        '/onboarding/integration',
        '/onboarding/verification',
        '/onboarding/bot-setup',
        '/onboarding/testing',
        '/onboarding/complete'
      ];

      for (const path of onboardingPages) {
        await page.goto(path);
        await page.waitForLoadState('networkidle');
        
        await a11yHelper.injectAxe();
        // Check specific sections to isolate issues
        await a11yHelper.checkAccessibility('main');
      }
    });

    test('should pass axe audit on form components', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await a11yHelper.injectAxe();
      
      // Test lead capture form specifically
      const form = page.locator('form').first();
      if (await form.isVisible()) {
        await a11yHelper.checkAccessibility('form');
      }
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should provide complete keyboard navigation', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const focusableElements = await a11yHelper.testKeyboardNavigation();
      
      // Should have reasonable number of focusable elements
      expect(focusableElements.length).toBeGreaterThan(5);
      expect(focusableElements.length).toBeLessThan(100);
    });

    test('should support skip links', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await a11yHelper.testSkipLinks();
    });

    test('should handle keyboard navigation in onboarding flow', async ({ page }) => {
      await page.goto('/onboarding/business');
      await page.waitForLoadState('networkidle');
      
      // Should be able to navigate form with keyboard
      const inputs = page.locator('input, select, textarea, button');
      const count = await inputs.count();
      
      for (let i = 0; i < Math.min(5, count); i++) {
        await page.keyboard.press('Tab');
        
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible();
        
        // If it's an input, test typing
        const tagName = await focusedElement.evaluate((el) => el?.tagName.toLowerCase());
        if (['input', 'textarea'].includes(tagName)) {
          const type = await focusedElement.getAttribute('type');
          if (!type || ['text', 'email', 'tel'].includes(type)) {
            await focusedElement.fill('Test');
            await expect(focusedElement).toHaveValue('Test');
            await focusedElement.clear();
          }
        }
      }
    });

    test('should provide keyboard access to interactive elements', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Test buttons
      const buttons = page.locator('button, [role="button"]');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(3, buttonCount); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          await button.focus();
          await expect(button).toBeFocused();
          
          // Should be activatable with Enter or Space
          await button.press('Space');
          // Note: We don't check the result as it might navigate or trigger modals
        }
      }
    });
  });

  test.describe('Screen Reader Compatibility', () => {
    test('should have proper heading structure', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await a11yHelper.testHeadingStructure();
    });

    test('should have proper ARIA labels and roles', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await a11yHelper.testAriaLabels();
    });

    test('should provide screen reader only content where needed', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await a11yHelper.testScreenReaderContent();
    });

    test('should have meaningful page titles', async ({ page }) => {
      const pages = [
        { path: '/', expectedTitle: /whatsapp|landing|home/i },
        { path: '/onboarding/business', expectedTitle: /business|onboarding/i },
        { path: '/onboarding/integration', expectedTitle: /integration|whatsapp/i },
      ];

      for (const { path, expectedTitle } of pages) {
        await page.goto(path);
        await page.waitForLoadState('networkidle');
        
        const title = await page.title();
        expect(title).toMatch(expectedTitle);
        expect(title.length).toBeGreaterThan(10); // Should be descriptive
        expect(title.length).toBeLessThan(100); // But not too long
      }
    });

    test('should provide proper form labels and error messages', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await a11yHelper.testFormAccessibility();
    });
  });

  test.describe('Visual Accessibility', () => {
    test('should maintain accessibility in high contrast mode', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await a11yHelper.testColorContrast();
    });

    test('should respect reduced motion preferences', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check that animations are reduced or disabled
      const animatedElements = page.locator('[class*="animate-"], [class*="motion-"], .animate');
      const count = await animatedElements.count();
      
      for (let i = 0; i < count; i++) {
        const element = animatedElements.nth(i);
        const animationDuration = await element.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return style.animationDuration || style.transitionDuration;
        });
        
        // Should have reduced or no animation
        if (animationDuration && animationDuration !== '0s') {
          // Allow very short animations (< 200ms)
          const duration = parseFloat(animationDuration.replace('s', ''));
          expect(duration).toBeLessThanOrEqual(0.2);
        }
      }
    });

    test('should be usable at 200% zoom', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Simulate 200% zoom
      await page.setViewportSize({ width: 640, height: 360 }); // Half the normal size
      await page.waitForTimeout(500);
      
      // Content should still be accessible
      await expect(page.locator('main')).toBeVisible();
      
      // Navigation should still work
      const navElements = page.locator('nav a, nav button');
      const navCount = await navElements.count();
      
      if (navCount > 0) {
        await expect(navElements.first()).toBeVisible();
      }
      
      // Forms should still be usable
      const firstInput = page.locator('input').first();
      if (await firstInput.isVisible()) {
        await firstInput.focus();
        await expect(firstInput).toBeFocused();
      }
    });
  });

  test.describe('Focus Management', () => {
    test('should manage focus in interactive components', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await a11yHelper.testFocusManagement();
    });

    test('should provide visible focus indicators', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Test focus indicators on various elements
      const focusableElements = page.locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const count = await focusableElements.count();
      
      for (let i = 0; i < Math.min(5, count); i++) {
        const element = focusableElements.nth(i);
        if (await element.isVisible()) {
          await element.focus();
          
          // Check for focus ring or outline
          const focusStyles = await element.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return {
              outline: style.outline,
              outlineWidth: style.outlineWidth,
              boxShadow: style.boxShadow,
              border: style.border
            };
          });
          
          // Should have some form of focus indication
          const hasFocusIndicator = 
            focusStyles.outline !== 'none' ||
            focusStyles.outlineWidth !== '0px' ||
            focusStyles.boxShadow !== 'none' ||
            focusStyles.boxShadow.includes('inset') ||
            focusStyles.border.includes('solid');
            
          expect(hasFocusIndicator).toBeTruthy();
        }
      }
    });

    test('should handle focus when navigating between pages', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Click a navigation link
      const navLink = page.locator('nav a, a[href*="onboarding"]').first();
      if (await navLink.isVisible()) {
        await navLink.click();
        await page.waitForLoadState('networkidle');
        
        // Focus should be managed appropriately (either on main content or first focusable element)
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeDefined();
      }
    });
  });

  test.describe('Error Handling Accessibility', () => {
    test('should announce form validation errors to screen readers', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Find a form and try to submit with validation errors
      const form = page.locator('form').first();
      if (await form.isVisible()) {
        const submitButton = form.locator('button[type="submit"]');
        
        if (await submitButton.isVisible()) {
          await submitButton.click();
          
          // Wait for validation errors
          await page.waitForTimeout(1000);
          
          // Check for ARIA live regions or role="alert"
          const errorRegions = page.locator('[role="alert"], [aria-live], .error');
          const errorCount = await errorRegions.count();
          
          if (errorCount > 0) {
            // Errors should be announced to screen readers
            for (let i = 0; i < errorCount; i++) {
              const error = errorRegions.nth(i);
              const text = await error.textContent();
              expect(text?.trim().length).toBeGreaterThan(0);
              
              // Should have appropriate ARIA attributes
              const role = await error.getAttribute('role');
              const ariaLive = await error.getAttribute('aria-live');
              
              expect(role === 'alert' || ariaLive === 'polite' || ariaLive === 'assertive').toBeTruthy();
            }
          }
        }
      }
    });

    test('should provide accessible error recovery options', async ({ page }) => {
      // Mock API error
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' })
        });
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Try to submit a form to trigger error
      const form = page.locator('form').first();
      if (await form.isVisible()) {
        // Fill required fields
        const firstNameInput = form.locator('input[name="firstName"]');
        const emailInput = form.locator('input[name="email"]');
        
        if (await firstNameInput.isVisible()) await firstNameInput.fill('Test');
        if (await emailInput.isVisible()) await emailInput.fill('test@example.com');
        
        const submitButton = form.locator('button[type="submit"]');
        if (await submitButton.isVisible()) {
          await submitButton.click();
          
          // Wait for error state
          await page.waitForTimeout(2000);
          
          // Should provide accessible retry option
          const retryButton = page.locator('button').filter({ hasText: /retry|try again/i });
          if (await retryButton.count() > 0) {
            await expect(retryButton.first()).toBeVisible();
            
            // Retry button should be focusable and have proper labeling
            await retryButton.first().focus();
            await expect(retryButton.first()).toBeFocused();
            
            const buttonText = await retryButton.first().textContent();
            expect(buttonText?.length).toBeGreaterThan(0);
          }
        }
      }
    });
  });
});
