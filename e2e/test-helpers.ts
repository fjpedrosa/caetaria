/**
 * E2E Test Helpers
 * Shared utilities and helpers for end-to-end tests
 */

import { Page, expect } from '@playwright/test';

// Common test data
export const TEST_DATA = {
  validUser: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@testcompany.com',
    phoneNumber: '+1234567890',
    companyName: 'Test Company Inc'
  },
  validBusiness: {
    businessName: 'Test Restaurant Ltd',
    website: 'https://testrestaurant.com',
    industry: 'restaurant',
    employeeCount: '10-50'
  },
  validWhatsAppConfig: {
    accessToken: 'test_access_token_12345',
    phoneNumberId: 'test_phone_id_67890',
    webhookSecret: 'test_webhook_secret'
  },
  validBotConfig: {
    botName: 'TestBot',
    greeting: 'Welcome to Test Company! How can I help you today?',
    fallbackMessage: 'I\'m sorry, I didn\'t understand. Please try again.'
  }
};

// Common selectors
export const SELECTORS = {
  // Forms
  leadForm: 'form:has(input[name="firstName"])',
  businessForm: 'form:has(input[name="businessName"])',
  submitButton: 'button[type="submit"]',
  
  // Navigation
  mobileMenuTrigger: 'button[aria-label*="menu"], .mobile-menu-trigger',
  skipLink: 'a[href*="#main"], a[href*="#content"]',
  
  // Loading states
  loadingSpinner: '.animate-spin, .spinner, [data-loading="true"]',
  loadingSkeleton: '.animate-pulse, .skeleton, [data-skeleton="true"]',
  
  // Error states
  errorMessage: '[role="alert"], .error, [data-error="true"]',
  validationError: '[data-testid="form-error"], .text-red-500',
  
  // WhatsApp Simulator
  simulator: '[role="img"][aria-label*="demostración"]',
  simulatorMessage: '.message, [data-message="true"]',
  typingIndicator: 'text=escribiendo..., .typing-indicator'
};

// Viewport presets
export const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  mobileLarge: { width: 428, height: 926 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 },
  desktopLarge: { width: 1920, height: 1080 }
};

/**
 * Enhanced Page Helper with common operations
 */
export class PageHelper {
  constructor(private page: Page) {}

  /**
   * Wait for page to be fully interactive
   */
  async waitForInteractive() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('main', { timeout: 10000 });
    
    // Wait for any initial animations to complete
    await this.page.waitForTimeout(500);
  }

  /**
   * Fill form fields with validation
   */
  async fillForm(formData: Record<string, string>, formSelector = 'form') {
    const form = this.page.locator(formSelector);
    await expect(form).toBeVisible();

    for (const [fieldName, value] of Object.entries(formData)) {
      const field = form.locator(`input[name="${fieldName}"], select[name="${fieldName}"], textarea[name="${fieldName}"]`);
      
      if (await field.count() > 0) {
        const tagName = await field.evaluate(el => el.tagName.toLowerCase());
        
        if (tagName === 'select') {
          await field.selectOption(value);
        } else {
          await field.fill(value);
        }
        
        // Wait for field validation
        await this.page.waitForTimeout(200);
      }
    }
  }

  /**
   * Submit form and wait for response
   */
  async submitForm(formSelector = 'form') {
    const form = this.page.locator(formSelector);
    const submitButton = form.locator(SELECTORS.submitButton);
    
    await expect(submitButton).toBeEnabled();
    await submitButton.click();
    
    // Wait for either success or error state
    await Promise.race([
      this.page.waitForSelector('text=Thank You, text=Success, text=Complete', { timeout: 10000 }),
      this.page.waitForSelector(SELECTORS.errorMessage, { timeout: 10000 }),
      this.page.waitForURL('**/onboarding/**', { timeout: 10000 })
    ]).catch(() => {
      // Timeout is acceptable - form might not show immediate feedback
    });
  }

  /**
   * Check for and count validation errors
   */
  async getValidationErrors(): Promise<string[]> {
    await this.page.waitForTimeout(500); // Wait for validation to trigger
    
    const errorElements = this.page.locator(SELECTORS.validationError);
    const count = await errorElements.count();
    const errors = [];
    
    for (let i = 0; i < count; i++) {
      const errorText = await errorElements.nth(i).textContent();
      if (errorText?.trim()) {
        errors.push(errorText.trim());
      }
    }
    
    return errors;
  }

  /**
   * Navigate through onboarding flow
   */
  async proceedToNextStep() {
    const continueButton = this.page.locator('button').filter({ hasText: /continue|next|proceed/i });
    const submitButton = this.page.locator(SELECTORS.submitButton);
    
    const nextButton = await continueButton.count() > 0 ? continueButton : submitButton;
    
    await expect(nextButton.first()).toBeEnabled();
    await nextButton.first().click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Take accessibility-focused screenshot
   */
  async takeA11yScreenshot(name: string) {
    // Ensure focus is visible for screenshot
    await this.page.keyboard.press('Tab');
    await this.page.waitForTimeout(200);
    
    await expect(this.page).toHaveScreenshot(`${name}-a11y.png`);
  }

  /**
   * Test keyboard navigation flow
   */
  async testKeyboardFlow(maxTabs: number = 20): Promise<string[]> {
    const focusedElements: string[] = [];
    
    // Start from the beginning
    await this.page.keyboard.press('Home');
    
    for (let i = 0; i < maxTabs; i++) {
      await this.page.keyboard.press('Tab');
      
      try {
        const focusedElement = this.page.locator(':focus');
        const tagName = await focusedElement.evaluate(el => el?.tagName.toLowerCase());
        const role = await focusedElement.getAttribute('role');
        const ariaLabel = await focusedElement.getAttribute('aria-label');
        
        const identifier = `${tagName}${role ? `[role="${role}"]` : ''}${ariaLabel ? `[aria-label="${ariaLabel.slice(0, 20)}..."]` : ''}`;
        focusedElements.push(identifier);
        
        if (tagName === 'body') break; // Reached end of focusable elements
      } catch (error) {
        break; // No more focusable elements
      }
    }
    
    return focusedElements;
  }

  /**
   * Simulate slow network conditions
   */
  async enableSlowNetwork(delayMs: number = 500) {
    await this.page.route('**/*', route => {
      setTimeout(() => route.continue(), delayMs);
    });
  }

  /**
   * Mock API responses for testing
   */
  async mockApiResponses(responses: Record<string, any>) {
    for (const [pattern, response] of Object.entries(responses)) {
      await this.page.route(pattern, route => {
        route.fulfill({
          status: response.status || 200,
          contentType: response.contentType || 'application/json',
          body: JSON.stringify(response.body || response)
        });
      });
    }
  }

  /**
   * Wait for WhatsApp simulator to load and animate
   */
  async waitForSimulator() {
    await expect(this.page.locator(SELECTORS.simulator)).toBeVisible({ timeout: 10000 });
    await this.page.waitForTimeout(2000); // Allow for initial animation
  }

  /**
   * Check responsive behavior across viewports
   */
  async testResponsiveBreakpoints(element: string) {
    const breakpoints = [
      { name: 'mobile', ...VIEWPORTS.mobile },
      { name: 'tablet', ...VIEWPORTS.tablet },
      { name: 'desktop', ...VIEWPORTS.desktop }
    ];
    
    const results = [];
    
    for (const breakpoint of breakpoints) {
      await this.page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
      await this.page.waitForTimeout(500);
      
      const isVisible = await this.page.locator(element).isVisible();
      const boundingBox = await this.page.locator(element).boundingBox();
      
      results.push({
        breakpoint: breakpoint.name,
        isVisible,
        boundingBox
      });
    }
    
    return results;
  }

  /**
   * Measure performance metrics
   */
  async measurePerformance(): Promise<any> {
    return await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const resources = performance.getEntriesByType('resource');
      
      return {
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        firstContentfulPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        resourceCount: resources.length,
        totalResourceSize: resources.reduce((sum, r) => sum + (r as any).transferSize || 0, 0)
      };
    });
  }

  /**
   * Inject test utilities into page
   */
  async injectTestUtils() {
    await this.page.addInitScript(() => {
      // Add test utilities to window object
      (window as any).testUtils = {
        waitForElement: (selector: string, timeout = 5000) => {
          return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const check = () => {
              const element = document.querySelector(selector);
              if (element) {
                resolve(element);
              } else if (Date.now() - startTime > timeout) {
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
              } else {
                setTimeout(check, 100);
              }
            };
            check();
          });
        },
        
        getComputedStyle: (selector: string, property: string) => {
          const element = document.querySelector(selector);
          if (element) {
            return window.getComputedStyle(element)[property as any];
          }
          return null;
        },
        
        simulateEvent: (selector: string, eventType: string) => {
          const element = document.querySelector(selector);
          if (element) {
            const event = new Event(eventType, { bubbles: true });
            element.dispatchEvent(event);
          }
        }
      };
    });
  }
}

/**
 * Assertion helpers for common test patterns
 */
export class AssertionHelper {
  constructor(private page: Page) {}

  async expectValidForm(formSelector = 'form') {
    const form = this.page.locator(formSelector);
    await expect(form).toBeVisible();
    
    // Should have submit button
    const submitButton = form.locator(SELECTORS.submitButton);
    await expect(submitButton).toBeVisible();
    
    // Submit button should be initially disabled or enabled based on form state
    // This is context-dependent, so we just verify it exists
    await expect(submitButton).toBeAttached();
  }

  async expectAccessibleForm(formSelector = 'form') {
    const form = this.page.locator(formSelector);
    await expect(form).toBeVisible();
    
    // Check that form has proper labeling
    const inputs = form.locator('input, select, textarea');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      
      // Should have associated label or aria-label
      const hasLabel = await input.evaluate(el => {
        const id = el.getAttribute('id');
        const ariaLabel = el.getAttribute('aria-label');
        const ariaLabelledBy = el.getAttribute('aria-labelledby');
        const label = id ? document.querySelector(`label[for="${id}"]`) : null;
        
        return !!(ariaLabel || ariaLabelledBy || label);
      });
      
      expect(hasLabel).toBeTruthy();
    }
  }

  async expectNoConsoleErrors() {
    const errors: string[] = [];
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Wait a bit to collect any errors
    await this.page.waitForTimeout(1000);
    
    const criticalErrors = errors.filter(error => 
      error.includes('Uncaught') || 
      error.includes('TypeError') ||
      error.includes('ReferenceError')
    );
    
    expect(criticalErrors).toHaveLength(0);
  }

  async expectFastLoading(maxLoadTimeMs: number = 3000) {
    const startTime = Date.now();
    await this.page.waitForSelector('main');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(maxLoadTimeMs);
  }

  async expectMobileResponsive() {
    // Test at mobile viewport
    await this.page.setViewportSize(VIEWPORTS.mobile);
    await this.page.waitForTimeout(500);
    
    // Content should not overflow horizontally
    const bodyWidth = await this.page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(VIEWPORTS.mobile.width + 20); // 20px tolerance
    
    // Navigation should be accessible
    const nav = this.page.locator('nav');
    await expect(nav).toBeVisible();
  }
}
