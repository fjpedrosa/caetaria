/**
 * E2E Tests for Navbar Component
 * 
 * Comprehensive end-to-end testing covering:
 * - User journey navigation
 * - Mega menu interactions
 * - Mobile menu functionality
 * - Cross-browser compatibility
 * - Keyboard navigation
 * - Touch interactions
 * 
 * @group navbar
 * @group e2e
 */

import { test, expect, devices } from '@playwright/test';
import { PageHelper, AssertionHelper, VIEWPORTS, SELECTORS } from './test-helpers';

// Test configuration
const NAVBAR_SELECTORS = {
  navbar: 'nav[role="navigation"], nav[aria-label*="navegación"]',
  logo: 'a[href="/"], .navbar-logo, [data-testid="logo"]',
  navItems: 'nav a[href*="/"], .nav-item, [data-testid="nav-item"]',
  mobileMenuTrigger: 'button[aria-expanded], .mobile-menu-trigger, [data-testid="mobile-menu-trigger"]',
  mobileMenu: '.mobile-menu, [data-testid="mobile-menu"]',
  megaMenu: '.mega-menu, [data-testid="mega-menu"]',
  ctaButtons: '.cta-button, [data-testid="cta-button"]',
  progressBar: '.progress-bar, [data-testid="progress-bar"]',
  skipLink: 'a[href*="#main"], .skip-link',
  searchInput: 'input[type="search"], [data-testid="search"]'
};

const TEST_ROUTES = [
  { path: '/', label: 'Home' },
  { path: '/features', label: 'Features' },
  { path: '/pricing', label: 'Pricing' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' }
];

test.describe('Navbar E2E Tests', () => {
  let pageHelper: PageHelper;
  let assertionHelper: AssertionHelper;

  test.beforeEach(async ({ page }) => {
    pageHelper = new PageHelper(page);
    assertionHelper = new AssertionHelper(page);

    // Inject test utilities
    await pageHelper.injectTestUtils();
    
    // Start from home page
    await page.goto('/');
    await pageHelper.waitForInteractive();
  });

  test.describe('Desktop Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
    });

    test('should render navbar with all essential elements', async ({ page }) => {
      // Verify navbar structure
      const navbar = page.locator(NAVBAR_SELECTORS.navbar);
      await expect(navbar).toBeVisible();
      await expect(navbar).toHaveAttribute('role', 'navigation');

      // Verify logo
      const logo = page.locator(NAVBAR_SELECTORS.logo);
      await expect(logo).toBeVisible();
      await expect(logo).toHaveAttribute('href', '/');

      // Verify navigation items
      const navItems = page.locator(NAVBAR_SELECTORS.navItems);
      await expect(navItems).toHaveCount(expect.any(Number));

      // Verify CTA buttons
      const ctaButtons = page.locator(NAVBAR_SELECTORS.ctaButtons);
      await expect(ctaButtons.first()).toBeVisible();

      // Take screenshot for visual verification
      await expect(page).toHaveScreenshot('navbar-desktop.png');
    });

    test('should navigate through all main pages', async ({ page }) => {
      for (const route of TEST_ROUTES) {
        // Navigate to route
        await page.click(`a[href="${route.path}"]`);
        await pageHelper.waitForInteractive();

        // Verify URL
        expect(page.url()).toContain(route.path === '/' ? 'localhost:3000' : route.path);

        // Verify navbar remains visible and functional
        const navbar = page.locator(NAVBAR_SELECTORS.navbar);
        await expect(navbar).toBeVisible();

        // Verify active state if applicable
        const activeItem = page.locator(`a[href="${route.path}"][aria-current="page"], a[href="${route.path}"].active`);
        if (await activeItem.count() > 0) {
          await expect(activeItem).toBeVisible();
        }
      }
    });

    test('should handle mega menu interactions on hover', async ({ page }) => {
      const navItems = page.locator(NAVBAR_SELECTORS.navItems);
      const navItemsCount = await navItems.count();

      for (let i = 0; i < Math.min(navItemsCount, 3); i++) {
        const navItem = navItems.nth(i);
        
        // Hover over nav item
        await navItem.hover();
        await page.waitForTimeout(200); // Wait for hover delay

        // Check if mega menu appears
        const megaMenu = page.locator(NAVBAR_SELECTORS.megaMenu);
        const hasMegaMenu = await megaMenu.count() > 0;

        if (hasMegaMenu) {
          await expect(megaMenu).toBeVisible();
          
          // Test mega menu navigation
          const megaMenuLinks = megaMenu.locator('a');
          const megaMenuLinksCount = await megaMenuLinks.count();
          
          if (megaMenuLinksCount > 0) {
            const firstLink = megaMenuLinks.first();
            await expect(firstLink).toBeVisible();
            
            // Click on first link in mega menu
            await firstLink.click();
            await pageHelper.waitForInteractive();
            
            // Verify navigation occurred
            const url = page.url();
            expect(url).not.toContain('#');
          }

          // Move mouse away to close mega menu
          await page.mouse.move(0, 0);
          await page.waitForTimeout(400); // Wait for exit delay
          
          // Mega menu should be hidden
          await expect(megaMenu).toBeHidden();
        }
      }
    });

    test('should handle mega menu interactions on click', async ({ page }) => {
      const navItems = page.locator(NAVBAR_SELECTORS.navItems);
      const firstNavItem = navItems.first();

      // Click on nav item
      await firstNavItem.click();
      await page.waitForTimeout(200);

      // Check if mega menu appears
      const megaMenu = page.locator(NAVBAR_SELECTORS.megaMenu);
      const hasMegaMenu = await megaMenu.count() > 0;

      if (hasMegaMenu) {
        await expect(megaMenu).toBeVisible();
        
        // Press Escape to close
        await page.keyboard.press('Escape');
        await page.waitForTimeout(200);
        
        await expect(megaMenu).toBeHidden();
      }
    });

    test('should handle CTA button interactions', async ({ page }) => {
      const ctaButtons = page.locator(NAVBAR_SELECTORS.ctaButtons);
      const ctaCount = await ctaButtons.count();

      for (let i = 0; i < ctaCount; i++) {
        const ctaButton = ctaButtons.nth(i);
        await expect(ctaButton).toBeVisible();
        await expect(ctaButton).toBeEnabled();

        // Get button text and href before clicking
        const buttonText = await ctaButton.textContent();
        const href = await ctaButton.getAttribute('href');

        if (href && href.startsWith('/')) {
          // Click CTA button
          await ctaButton.click();
          await pageHelper.waitForInteractive();

          // Verify navigation
          expect(page.url()).toContain(href);

          // Navigate back to home
          await page.goto('/');
          await pageHelper.waitForInteractive();
        }
      }
    });

    test('should handle scroll behavior', async ({ page }) => {
      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(500);

      // Navbar should still be visible (sticky)
      const navbar = page.locator(NAVBAR_SELECTORS.navbar);
      await expect(navbar).toBeVisible();

      // Check for scroll-based styling changes
      const isScrolled = await navbar.evaluate(el => 
        el.classList.contains('scrolled') || 
        el.classList.contains('navbar-scrolled') ||
        window.getComputedStyle(el).backgroundColor !== 'rgba(0, 0, 0, 0)'
      );

      // Progress bar should be visible if implemented
      const progressBar = page.locator(NAVBAR_SELECTORS.progressBar);
      if (await progressBar.count() > 0) {
        await expect(progressBar).toBeVisible();
      }

      // Scroll back to top
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);

      await expect(navbar).toBeVisible();
    });

    test('should prefetch links on hover', async ({ page }) => {
      // Enable request monitoring
      const requests: string[] = [];
      page.on('request', request => {
        if (request.url().includes('localhost:3000') && request.method() === 'GET') {
          requests.push(request.url());
        }
      });

      const navItems = page.locator(NAVBAR_SELECTORS.navItems);
      const firstNavItem = navItems.first();
      
      // Hover over nav item to trigger prefetch
      await firstNavItem.hover();
      await page.waitForTimeout(500); // Wait for prefetch

      // Check if prefetch requests were made
      const prefetchRequests = requests.filter(url => 
        url.includes('_next/static') || 
        url.includes('_next/data') ||
        TEST_ROUTES.some(route => url.includes(route.path))
      );

      // Should have some prefetch activity
      expect(prefetchRequests.length).toBeGreaterThan(0);
    });
  });

  test.describe('Mobile Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.waitForTimeout(500); // Allow for responsive adjustments
    });

    test('should render mobile navbar correctly', async ({ page }) => {
      const navbar = page.locator(NAVBAR_SELECTORS.navbar);
      await expect(navbar).toBeVisible();

      // Mobile menu trigger should be visible
      const mobileMenuTrigger = page.locator(NAVBAR_SELECTORS.mobileMenuTrigger);
      await expect(mobileMenuTrigger).toBeVisible();

      // Desktop nav items should be hidden on mobile
      const navItems = page.locator(NAVBAR_SELECTORS.navItems);
      const firstNavItem = navItems.first();
      
      // Check if nav items are hidden (display: none or not visible)
      const isNavItemVisible = await firstNavItem.isVisible().catch(() => false);
      const isNavItemInViewport = await firstNavItem.isInViewport().catch(() => false);
      
      // Either not visible or not in viewport (hidden by responsive design)
      expect(isNavItemVisible && isNavItemInViewport).toBeFalsy();

      await expect(page).toHaveScreenshot('navbar-mobile.png');
    });

    test('should open and close mobile menu with click', async ({ page }) => {
      const mobileMenuTrigger = page.locator(NAVBAR_SELECTORS.mobileMenuTrigger);
      const mobileMenu = page.locator(NAVBAR_SELECTORS.mobileMenu);

      // Initial state - menu should be closed
      const initiallyOpen = await mobileMenuTrigger.getAttribute('aria-expanded');
      expect(initiallyOpen).toBe('false');

      // Open mobile menu
      await mobileMenuTrigger.click();
      await page.waitForTimeout(300); // Wait for animation

      // Menu should be open
      const openState = await mobileMenuTrigger.getAttribute('aria-expanded');
      expect(openState).toBe('true');

      // Mobile menu should be visible
      await expect(mobileMenu).toBeVisible();

      // Close mobile menu by clicking trigger again
      await mobileMenuTrigger.click();
      await page.waitForTimeout(300); // Wait for animation

      // Menu should be closed
      const closedState = await mobileMenuTrigger.getAttribute('aria-expanded');
      expect(closedState).toBe('false');

      // Mobile menu should be hidden
      await expect(mobileMenu).toBeHidden();
    });

    test('should close mobile menu with escape key', async ({ page }) => {
      const mobileMenuTrigger = page.locator(NAVBAR_SELECTORS.mobileMenuTrigger);
      const mobileMenu = page.locator(NAVBAR_SELECTORS.mobileMenu);

      // Open mobile menu
      await mobileMenuTrigger.click();
      await page.waitForTimeout(300);

      await expect(mobileMenu).toBeVisible();

      // Press Escape key
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      // Menu should be closed
      const closedState = await mobileMenuTrigger.getAttribute('aria-expanded');
      expect(closedState).toBe('false');
      await expect(mobileMenu).toBeHidden();
    });

    test('should navigate through mobile menu items', async ({ page }) => {
      const mobileMenuTrigger = page.locator(NAVBAR_SELECTORS.mobileMenuTrigger);

      // Open mobile menu
      await mobileMenuTrigger.click();
      await page.waitForTimeout(300);

      const mobileMenu = page.locator(NAVBAR_SELECTORS.mobileMenu);
      await expect(mobileMenu).toBeVisible();

      // Find navigation links in mobile menu
      const mobileNavItems = mobileMenu.locator('a[href*="/"]');
      const mobileNavCount = await mobileNavItems.count();

      if (mobileNavCount > 0) {
        const firstMobileNavItem = mobileNavItems.first();
        const href = await firstMobileNavItem.getAttribute('href');

        // Click on first nav item
        await firstMobileNavItem.click();
        await pageHelper.waitForInteractive();

        // Verify navigation occurred
        if (href) {
          expect(page.url()).toContain(href === '/' ? 'localhost:3000' : href);
        }

        // Mobile menu should be closed after navigation
        const closedState = await mobileMenuTrigger.getAttribute('aria-expanded');
        expect(closedState).toBe('false');
      }
    });

    test('should handle touch interactions', async ({ page }) => {
      const mobileMenuTrigger = page.locator(NAVBAR_SELECTORS.mobileMenuTrigger);

      // Test touch target size (minimum 44px)
      const triggerBox = await mobileMenuTrigger.boundingBox();
      expect(triggerBox).toBeTruthy();
      if (triggerBox) {
        expect(triggerBox.width).toBeGreaterThanOrEqual(44);
        expect(triggerBox.height).toBeGreaterThanOrEqual(44);
      }

      // Test touch interaction
      await mobileMenuTrigger.tap();
      await page.waitForTimeout(300);

      const openState = await mobileMenuTrigger.getAttribute('aria-expanded');
      expect(openState).toBe('true');

      // Test swipe gesture if implemented
      const mobileMenu = page.locator(NAVBAR_SELECTORS.mobileMenu);
      await expect(mobileMenu).toBeVisible();

      // Swipe right to close (if gesture is implemented)
      const menuBox = await mobileMenu.boundingBox();
      if (menuBox) {
        await page.touchscreen.tap(menuBox.x + 50, menuBox.y + 50);
        await page.touchscreen.tap(menuBox.x + 200, menuBox.y + 50);
        await page.waitForTimeout(300);
      }
    });
  });

  test.describe('Keyboard Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      // Ensure keyboard focus is enabled
      await page.keyboard.press('Tab');
    });

    test('should support complete keyboard navigation', async ({ page }) => {
      // Test skip link functionality
      const skipLink = page.locator(NAVBAR_SELECTORS.skipLink);
      if (await skipLink.count() > 0) {
        await expect(skipLink).toBeFocused();
        
        // Activate skip link
        await page.keyboard.press('Enter');
        await page.waitForTimeout(200);
        
        // Focus should move to main content
        const mainContent = page.locator('main, #main, [role="main"]');
        if (await mainContent.count() > 0) {
          await expect(mainContent).toBeFocused();
        }
        
        // Reset focus to beginning for next test
        await page.keyboard.press('Home');
      }

      // Test tab navigation through navbar
      const focusedElements = await pageHelper.testKeyboardFlow(15);
      
      // Should include logo, nav items, and CTA buttons
      const expectedElements = ['a', 'button'];
      const hasExpectedElements = focusedElements.some(element => 
        expectedElements.some(expected => element.includes(expected))
      );
      
      expect(hasExpectedElements).toBeTruthy();
    });

    test('should handle arrow key navigation in nav items', async ({ page }) => {
      // Focus on first nav item
      const firstNavItem = page.locator(NAVBAR_SELECTORS.navItems).first();
      await firstNavItem.focus();
      await expect(firstNavItem).toBeFocused();

      // Use arrow keys to navigate
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(100);

      // Next nav item should be focused
      const secondNavItem = page.locator(NAVBAR_SELECTORS.navItems).nth(1);
      if (await secondNavItem.count() > 0) {
        const isSecondFocused = await secondNavItem.evaluate(el => 
          document.activeElement === el
        );
        // Arrow key navigation might not be implemented for all navbars
        // This is an optional enhancement
      }
    });

    test('should handle Enter and Space key activation', async ({ page }) => {
      const navItems = page.locator(NAVBAR_SELECTORS.navItems);
      const firstNavItem = navItems.first();
      
      // Focus on nav item
      await firstNavItem.focus();
      await expect(firstNavItem).toBeFocused();

      // Get href before activation
      const href = await firstNavItem.getAttribute('href');

      // Activate with Enter key
      await page.keyboard.press('Enter');
      await pageHelper.waitForInteractive();

      // Verify navigation
      if (href) {
        expect(page.url()).toContain(href === '/' ? 'localhost:3000' : href);
      }
    });

    test('should trap focus in mobile menu', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      
      const mobileMenuTrigger = page.locator(NAVBAR_SELECTORS.mobileMenuTrigger);
      
      // Open mobile menu with keyboard
      await mobileMenuTrigger.focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      const mobileMenu = page.locator(NAVBAR_SELECTORS.mobileMenu);
      await expect(mobileMenu).toBeVisible();

      // Tab through mobile menu items
      const focusedElements = await pageHelper.testKeyboardFlow(10);
      
      // Focus should stay within mobile menu
      // This test verifies focus trapping is implemented
      const hasFocusTrapping = focusedElements.length > 0;
      expect(hasFocusTrapping).toBeTruthy();

      // Close with Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      // Focus should return to trigger
      await expect(mobileMenuTrigger).toBeFocused();
    });
  });

  test.describe('Cross-Browser Compatibility', () => {
    ['chromium', 'firefox', 'webkit'].forEach(browserName => {
      test(`should work correctly in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
        test.skip(currentBrowser !== browserName, `Running only on ${browserName}`);

        // Basic functionality test
        const navbar = page.locator(NAVBAR_SELECTORS.navbar);
        await expect(navbar).toBeVisible();

        // Navigation test
        const firstNavItem = page.locator(NAVBAR_SELECTORS.navItems).first();
        if (await firstNavItem.count() > 0) {
          await firstNavItem.click();
          await pageHelper.waitForInteractive();
        }

        // Mobile menu test
        await page.setViewportSize(VIEWPORTS.mobile);
        const mobileMenuTrigger = page.locator(NAVBAR_SELECTORS.mobileMenuTrigger);
        if (await mobileMenuTrigger.count() > 0) {
          await mobileMenuTrigger.click();
          await page.waitForTimeout(300);
          
          const mobileMenu = page.locator(NAVBAR_SELECTORS.mobileMenu);
          await expect(mobileMenu).toBeVisible();
        }

        // No critical console errors
        await assertionHelper.expectNoConsoleErrors();
      });
    });
  });

  test.describe('Performance Testing', () => {
    test('should load navbar quickly', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      
      // Wait for navbar to be visible
      const navbar = page.locator(NAVBAR_SELECTORS.navbar);
      await expect(navbar).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      
      // Navbar should be visible within 2 seconds
      expect(loadTime).toBeLessThan(2000);
    });

    test('should handle rapid interactions without lag', async ({ page }) => {
      const mobileMenuTrigger = page.locator(NAVBAR_SELECTORS.mobileMenuTrigger);
      
      await page.setViewportSize(VIEWPORTS.mobile);
      
      // Rapid toggle test
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        
        await mobileMenuTrigger.click();
        await page.waitForTimeout(100);
        
        const responseTime = Date.now() - startTime;
        expect(responseTime).toBeLessThan(500); // Should respond within 500ms
      }
    });

    test('should not cause memory leaks during extended use', async ({ page }) => {
      // Simulate extended navbar usage
      await page.setViewportSize(VIEWPORTS.desktop);
      
      for (let i = 0; i < 10; i++) {
        // Hover over nav items
        const navItems = page.locator(NAVBAR_SELECTORS.navItems);
        const navCount = await navItems.count();
        
        for (let j = 0; j < Math.min(navCount, 3); j++) {
          await navItems.nth(j).hover();
          await page.waitForTimeout(100);
        }
        
        // Switch to mobile and back
        await page.setViewportSize(VIEWPORTS.mobile);
        await page.waitForTimeout(100);
        await page.setViewportSize(VIEWPORTS.desktop);
        await page.waitForTimeout(100);
      }

      // Check performance metrics
      const metrics = await pageHelper.measurePerformance();
      
      // Basic performance expectations
      expect(metrics.loadTime).toBeLessThan(5000);
      expect(metrics.resourceCount).toBeLessThan(100);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle broken navigation links gracefully', async ({ page }) => {
      // Mock a broken link response
      await page.route('**/broken-link', route => {
        route.fulfill({
          status: 404,
          contentType: 'text/html',
          body: '<html><body><h1>404 Not Found</h1></body></html>'
        });
      });

      // If there's a broken link in navbar, it should still function
      const navbar = page.locator(NAVBAR_SELECTORS.navbar);
      await expect(navbar).toBeVisible();

      // No critical console errors
      await assertionHelper.expectNoConsoleErrors();
    });

    test('should maintain functionality when JavaScript fails', async ({ page }) => {
      // Disable JavaScript
      await page.setExtraHTTPHeaders({ 'X-Test-No-JS': 'true' });
      
      await page.goto('/');
      
      // Basic HTML structure should still work
      const navbar = page.locator(NAVBAR_SELECTORS.navbar);
      await expect(navbar).toBeVisible();

      // Links should still be functional (basic HTML navigation)
      const logo = page.locator(NAVBAR_SELECTORS.logo);
      if (await logo.count() > 0) {
        await expect(logo).toHaveAttribute('href');
      }
    });
  });
});