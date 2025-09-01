/**
 * Onboarding Flow E2E Tests
 * Complete end-to-end testing of the onboarding journey
 */

import { test, expect, Page } from '@playwright/test';

interface OnboardingData {
  businessName: string;
  website: string;
  industry: string;
  employeeCount: string;
  phoneNumber: string;
  accessToken: string;
  phoneNumberId: string;
  botName: string;
  botGreeting: string;
}

const mockOnboardingData: OnboardingData = {
  businessName: 'Test Restaurant Ltd',
  website: 'https://testrestaurant.com',
  industry: 'restaurant',
  employeeCount: '10-50',
  phoneNumber: '+1234567890',
  accessToken: 'test_access_token_12345',
  phoneNumberId: 'test_phone_id_67890',
  botName: 'RestaurantBot',
  botGreeting: 'Welcome to Test Restaurant! How can I help you today?'
};

// Helper functions for onboarding steps
class OnboardingPage {
  constructor(private page: Page) {}

  async goToOnboarding() {
    await this.page.goto('/onboarding/business');
    await this.page.waitForLoadState('networkidle');
  }

  async fillBusinessInfo(data: Partial<OnboardingData>) {
    // Wait for business info form
    await expect(this.page.locator('h1')).toContainText('Tell us about your business');

    // Fill business name
    if (data.businessName) {
      await this.page.fill('input[name="businessName"]', data.businessName);
    }

    // Fill website
    if (data.website) {
      await this.page.fill('input[name="website"]', data.website);
    }

    // Select industry
    if (data.industry) {
      await this.page.selectOption('select[name="industry"]', data.industry);
    }

    // Select employee count
    if (data.employeeCount) {
      await this.page.selectOption('select[name="employeeCount"]', data.employeeCount);
    }
  }

  async proceedToNextStep() {
    const continueButton = this.page.locator('button[type="submit"]', { hasText: /continue|next/i });
    await expect(continueButton).toBeEnabled();
    await continueButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async fillWhatsAppIntegration(data: Partial<OnboardingData>) {
    await expect(this.page.locator('h1')).toContainText('WhatsApp Integration');

    if (data.phoneNumber) {
      await this.page.fill('input[name="phoneNumber"]', data.phoneNumber);
    }

    if (data.accessToken) {
      await this.page.fill('input[name="accessToken"]', data.accessToken);
    }

    if (data.phoneNumberId) {
      await this.page.fill('input[name="phoneNumberId"]', data.phoneNumberId);
    }
  }

  async fillBotSetup(data: Partial<OnboardingData>) {
    await expect(this.page.locator('h1')).toContainText('Bot Setup');

    if (data.botName) {
      await this.page.fill('input[name="botName"]', data.botName);
    }

    if (data.botGreeting) {
      await this.page.fill('textarea[name="botGreeting"]', data.botGreeting);
    }
  }

  async verifyCompletionPage() {
    await expect(this.page.locator('h1')).toContainText('Setup Complete');
    await expect(this.page.locator('text=Congratulations')).toBeVisible();
    await expect(this.page.locator('text=Your WhatsApp bot is now ready')).toBeVisible();
  }

  async verifyStepProgress(currentStep: number) {
    const progressSteps = this.page.locator('[data-testid="progress-step"]');
    
    // Verify current step is highlighted
    const currentStepElement = progressSteps.nth(currentStep - 1);
    await expect(currentStepElement).toHaveClass(/active|current/);

    // Verify previous steps are completed
    for (let i = 0; i < currentStep - 1; i++) {
      await expect(progressSteps.nth(i)).toHaveClass(/completed/);
    }
  }

  async checkValidationErrors() {
    const errorMessages = this.page.locator('[data-testid="form-error"], .text-red-500, [role="alert"]');
    return await errorMessages.count();
  }
}

test.describe('Complete Onboarding Flow', () => {
  let onboardingPage: OnboardingPage;

  test.beforeEach(async ({ page }) => {
    onboardingPage = new OnboardingPage(page);
  });

  test.describe('Happy Path - Complete Flow', () => {
    test('should complete full onboarding flow successfully', async ({ page }) => {
      // Step 1: Business Information
      await onboardingPage.goToOnboarding();
      await onboardingPage.verifyStepProgress(1);
      
      await onboardingPage.fillBusinessInfo(mockOnboardingData);
      await onboardingPage.proceedToNextStep();

      // Step 2: WhatsApp Integration
      await expect(page).toHaveURL(/\/onboarding\/integration/);
      await onboardingPage.verifyStepProgress(2);
      
      await onboardingPage.fillWhatsAppIntegration(mockOnboardingData);
      await onboardingPage.proceedToNextStep();

      // Step 3: Phone Verification
      await expect(page).toHaveURL(/\/onboarding\/verification/);
      await onboardingPage.verifyStepProgress(3);
      
      // Mock successful verification (or skip if automated)
      await page.locator('button', { hasText: /verify|confirm/i }).click();
      await page.waitForTimeout(2000); // Wait for verification process
      await onboardingPage.proceedToNextStep();

      // Step 4: Bot Setup
      await expect(page).toHaveURL(/\/onboarding\/bot-setup/);
      await onboardingPage.verifyStepProgress(4);
      
      await onboardingPage.fillBotSetup(mockOnboardingData);
      await onboardingPage.proceedToNextStep();

      // Step 5: Testing
      await expect(page).toHaveURL(/\/onboarding\/testing/);
      await onboardingPage.verifyStepProgress(5);
      
      // Test the bot
      await page.fill('input[name="testMessage"]', 'Hello, this is a test message');
      await page.locator('button', { hasText: /send|test/i }).click();
      
      // Wait for bot response
      await expect(page.locator('text=RestaurantBot')).toBeVisible();
      await onboardingPage.proceedToNextStep();

      // Step 6: Completion
      await expect(page).toHaveURL(/\/onboarding\/complete/);
      await onboardingPage.verifyCompletionPage();
    });

    test('should save progress and allow resuming from any step', async ({ page }) => {
      // Start onboarding
      await onboardingPage.goToOnboarding();
      await onboardingPage.fillBusinessInfo(mockOnboardingData);
      await onboardingPage.proceedToNextStep();

      // Simulate browser refresh/close
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Should resume from integration step
      await expect(page).toHaveURL(/\/onboarding\/integration/);
      await expect(page.locator('input[name="phoneNumber"]')).toBeVisible();

      // Business info should be preserved (if session storage is implemented)
      await page.goBack();
      await expect(page.locator('input[name="businessName"]')).toHaveValue(mockOnboardingData.businessName);
    });
  });

  test.describe('Form Validation', () => {
    test('should validate required fields in business info step', async ({ page }) => {
      await onboardingPage.goToOnboarding();

      // Try to proceed without filling required fields
      await page.locator('button[type="submit"]').click();

      // Should show validation errors
      const errorCount = await onboardingPage.checkValidationErrors();
      expect(errorCount).toBeGreaterThan(0);

      // URL should not change
      await expect(page).toHaveURL(/\/onboarding\/business/);
    });

    test('should validate WhatsApp credentials format', async ({ page }) => {
      await onboardingPage.goToOnboarding();
      await onboardingPage.fillBusinessInfo(mockOnboardingData);
      await onboardingPage.proceedToNextStep();

      // Enter invalid access token format
      await page.fill('input[name="accessToken"]', 'invalid_token');
      await page.fill('input[name="phoneNumberId"]', 'invalid_id');
      await page.locator('button[type="submit"]').click();

      // Should show validation errors
      const errorCount = await onboardingPage.checkValidationErrors();
      expect(errorCount).toBeGreaterThan(0);
    });

    test('should validate phone number format', async ({ page }) => {
      await onboardingPage.goToOnboarding();
      await onboardingPage.fillBusinessInfo(mockOnboardingData);
      await onboardingPage.proceedToNextStep();

      // Test various invalid phone formats
      const invalidPhones = ['123', '+++invalid', 'not-a-phone', ''];
      
      for (const phone of invalidPhones) {
        await page.fill('input[name="phoneNumber"]', phone);
        await page.locator('input[name="phoneNumber"]').blur();
        
        // Should show validation error
        await expect(page.locator('text=invalid phone number', { hasText: /invalid|format/i })).toBeVisible();
      }
    });
  });

  test.describe('Error Recovery', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // Intercept API calls and return errors
      await page.route('**/api/onboarding/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' })
        });
      });

      await onboardingPage.goToOnboarding();
      await onboardingPage.fillBusinessInfo(mockOnboardingData);
      await onboardingPage.proceedToNextStep();

      // Should show error message
      await expect(page.locator('text=error', { hasText: /error|failed/i })).toBeVisible();
      
      // Should provide retry option
      await expect(page.locator('button', { hasText: /retry|try again/i })).toBeVisible();
    });

    test('should handle network timeouts', async ({ page }) => {
      // Simulate slow network
      await page.route('**/api/onboarding/**', route => {
        setTimeout(() => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true })
          });
        }, 10000); // 10 second delay
      });

      await onboardingPage.goToOnboarding();
      await onboardingPage.fillBusinessInfo(mockOnboardingData);
      await onboardingPage.proceedToNextStep();

      // Should show loading state
      await expect(page.locator('.animate-spin, text=loading', { hasText: /loading|processing/i })).toBeVisible();
    });

    test('should recover from invalid session', async ({ page }) => {
      await onboardingPage.goToOnboarding();
      await onboardingPage.fillBusinessInfo(mockOnboardingData);
      
      // Clear session storage
      await page.evaluate(() => {
        sessionStorage.clear();
        localStorage.clear();
      });

      await onboardingPage.proceedToNextStep();

      // Should either redirect to start or handle gracefully
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      
      // Accept either redirect to start or graceful handling
      expect(
        currentUrl.includes('/onboarding/business') || 
        currentUrl.includes('/onboarding/integration')
      ).toBeTruthy();
    });
  });

  test.describe('Navigation and Back Button', () => {
    test('should allow going back to previous steps', async ({ page }) => {
      await onboardingPage.goToOnboarding();
      await onboardingPage.fillBusinessInfo(mockOnboardingData);
      await onboardingPage.proceedToNextStep();

      // Should be on integration step
      await expect(page).toHaveURL(/\/onboarding\/integration/);

      // Click back button
      await page.locator('button', { hasText: /back|previous/i }).click();

      // Should return to business step
      await expect(page).toHaveURL(/\/onboarding\/business/);
      
      // Data should be preserved
      await expect(page.locator('input[name="businessName"]')).toHaveValue(mockOnboardingData.businessName);
    });

    test('should handle browser back button correctly', async ({ page }) => {
      await onboardingPage.goToOnboarding();
      await onboardingPage.fillBusinessInfo(mockOnboardingData);
      await onboardingPage.proceedToNextStep();
      await onboardingPage.fillWhatsAppIntegration(mockOnboardingData);
      await onboardingPage.proceedToNextStep();

      // Use browser back button
      await page.goBack();
      await expect(page).toHaveURL(/\/onboarding\/integration/);
      
      await page.goBack();
      await expect(page).toHaveURL(/\/onboarding\/business/);
    });
  });

  test.describe('Real-time Updates', () => {
    test('should show real-time verification status', async ({ page }) => {
      await onboardingPage.goToOnboarding();
      await onboardingPage.fillBusinessInfo(mockOnboardingData);
      await onboardingPage.proceedToNextStep();
      await onboardingPage.fillWhatsAppIntegration(mockOnboardingData);
      await onboardingPage.proceedToNextStep();

      // On verification step
      await expect(page).toHaveURL(/\/onboarding\/verification/);
      
      // Should show verification in progress
      await expect(page.locator('text=verifying', { hasText: /verifying|checking/i })).toBeVisible();
      
      // Mock successful verification
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('verification-success', {
          detail: { status: 'verified', phoneNumber: '+1234567890' }
        }));
      });

      // Should show success state
      await expect(page.locator('text=verified', { hasText: /verified|success/i })).toBeVisible();
    });

    test('should update bot configuration in real-time', async ({ page }) => {
      // Navigate to bot setup step
      await onboardingPage.goToOnboarding();
      await onboardingPage.fillBusinessInfo(mockOnboardingData);
      await onboardingPage.proceedToNextStep();
      await onboardingPage.fillWhatsAppIntegration(mockOnboardingData);
      await onboardingPage.proceedToNextStep();
      await page.locator('button', { hasText: /skip|continue/i }).click(); // Skip verification
      await onboardingPage.proceedToNextStep();

      // Should be on bot setup
      await expect(page).toHaveURL(/\/onboarding\/bot-setup/);
      
      // Fill bot name and see preview update
      await page.fill('input[name="botName"]', 'TestBot');
      await expect(page.locator('text=TestBot')).toBeVisible({ timeout: 1000 });
      
      // Update greeting and see preview
      await page.fill('textarea[name="botGreeting"]', 'Hello from TestBot!');
      await expect(page.locator('text=Hello from TestBot!')).toBeVisible({ timeout: 1000 });
    });
  });

  test.describe('Performance and Timeout Handling', () => {
    test('should handle slow form submissions', async ({ page }) => {
      // Mock slow API response
      await page.route('**/api/onboarding/business', route => {
        setTimeout(() => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, id: 'business-123' })
          });
        }, 3000);
      });

      await onboardingPage.goToOnboarding();
      await onboardingPage.fillBusinessInfo(mockOnboardingData);
      
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Should show loading state immediately
      await expect(submitButton).toBeDisabled();
      await expect(page.locator('.animate-spin')).toBeVisible();
      
      // Should eventually succeed
      await expect(page).toHaveURL(/\/onboarding\/integration/, { timeout: 5000 });
    });

    test('should timeout gracefully on very slow responses', async ({ page }) => {
      // Mock extremely slow response (longer than timeout)
      await page.route('**/api/onboarding/**', route => {
        // Never respond to simulate timeout
      });

      await onboardingPage.goToOnboarding();
      await onboardingPage.fillBusinessInfo(mockOnboardingData);
      await page.locator('button[type="submit"]').click();

      // Should eventually show timeout error
      await expect(page.locator('text=timeout', { hasText: /timeout|slow|retry/i })).toBeVisible({ timeout: 10000 });
    });
  });
});
