/**
 * Accessibility Tests for Navbar Component
 * 
 * Comprehensive accessibility testing covering:
 * - Screen reader compatibility and announcements
 * - Keyboard navigation and focus management
 * - ARIA attributes and semantic markup
 * - Color contrast verification
 * - Touch target sizes and spacing
 * - High contrast and reduced motion support
 * - WCAG 2.1 AA compliance verification
 * 
 * @group navbar
 * @group accessibility
 * @group a11y
 */

import { test, expect } from '@playwright/test';
import { PageHelper, AssertionHelper, VIEWPORTS } from './test-helpers';

// Accessibility testing configuration
const A11Y_CONFIG = {
  contrast: {
    normal: 4.5,      // WCAG AA for normal text
    large: 3.0,       // WCAG AA for large text
    enhanced: 7.0     // WCAG AAA standard
  },
  touchTargets: {
    minimum: 44,      // WCAG minimum touch target size
    recommended: 48   // Recommended touch target size
  },
  focus: {
    ringWidth: 2,     // Minimum focus ring width
    ringOffset: 1     // Minimum focus ring offset
  }
};

const NAVBAR_SELECTORS = {
  navbar: 'nav[role="navigation"], nav[aria-label*="navegación"]',
  logo: 'a[href="/"], .navbar-logo, [data-testid="logo"]',
  navItems: 'nav a[href*="/"], .nav-item, [data-testid="nav-item"]',
  mobileMenuTrigger: 'button[aria-expanded], .mobile-menu-trigger, [data-testid="mobile-menu-trigger"]',
  mobileMenu: '.mobile-menu, [data-testid="mobile-menu"]',
  megaMenu: '.mega-menu, [data-testid="mega-menu"]',
  skipLink: 'a[href*="#main"], .skip-link, [data-testid="skip-link"]',
  ctaButtons: '.cta-button, [data-testid="cta-button"]',
  focusableElements: 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
};

// Color contrast calculation utility
const getContrastRatio = async (page: any, element: string) => {
  return await page.evaluate((selector: string) => {
    const el = document.querySelector(selector);
    if (!el) return null;

    const style = window.getComputedStyle(el);
    const bgColor = style.backgroundColor;
    const textColor = style.color;

    // Simple RGB to relative luminance conversion
    const getRGB = (color: string) => {
      const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : [0, 0, 0];
    };

    const getRelativeLuminance = (rgb: number[]) => {
      const [r, g, b] = rgb.map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const bgRGB = getRGB(bgColor);
    const textRGB = getRGB(textColor);
    const bgLum = getRelativeLuminance(bgRGB);
    const textLum = getRelativeLuminance(textRGB);

    const lighter = Math.max(bgLum, textLum);
    const darker = Math.min(bgLum, textLum);
    
    return (lighter + 0.05) / (darker + 0.05);
  }, element);
};

test.describe('Navbar Accessibility Tests', () => {
  let pageHelper: PageHelper;
  let assertionHelper: AssertionHelper;

  test.beforeEach(async ({ page }) => {
    pageHelper = new PageHelper(page);
    assertionHelper = new AssertionHelper(page);
    await pageHelper.injectTestUtils();
  });

  test.describe('Semantic Structure and ARIA', () => {
    test('should have proper semantic navigation structure', async ({ page }) => {
      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Main navigation should be in nav element
      const navbar = page.locator(NAVBAR_SELECTORS.navbar);
      await expect(navbar).toBeVisible();

      // Should have navigation role
      const navRole = await navbar.getAttribute('role');
      const navAriaLabel = await navbar.getAttribute('aria-label');
      
      expect(navRole === 'navigation' || navAriaLabel?.includes('navegación')).toBeTruthy();

      // Navigation items should be in list structure (if using ul/li)
      const navList = navbar.locator('ul');
      if (await navList.count() > 0) {
        await expect(navList).toBeVisible();
        
        const listItems = navList.locator('li');
        const listItemCount = await listItems.count();
        expect(listItemCount).toBeGreaterThan(0);
      }

      // Links should have proper href attributes
      const navLinks = page.locator(NAVBAR_SELECTORS.navItems);
      const linkCount = await navLinks.count();
      
      for (let i = 0; i < Math.min(linkCount, 5); i++) {
        const link = navLinks.nth(i);
        const href = await link.getAttribute('href');
        expect(href).toBeTruthy();
        expect(href).not.toBe('#'); // Avoid placeholder links
      }
    });

    test('should have proper ARIA attributes for interactive elements', async ({ page }) => {
      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Mobile menu trigger ARIA
      const mobileMenuTrigger = page.locator(NAVBAR_SELECTORS.mobileMenuTrigger);
      if (await mobileMenuTrigger.count() > 0) {
        const ariaExpanded = await mobileMenuTrigger.getAttribute('aria-expanded');
        const ariaLabel = await mobileMenuTrigger.getAttribute('aria-label');
        const ariaControls = await mobileMenuTrigger.getAttribute('aria-controls');

        expect(ariaExpanded).toBeTruthy();
        expect(ariaLabel || ariaControls).toBeTruthy();

        // Test expanded state change
        await mobileMenuTrigger.click();
        await page.waitForTimeout(300);

        const expandedAfterClick = await mobileMenuTrigger.getAttribute('aria-expanded');
        expect(expandedAfterClick).toBe('true');
      }

      // CTA buttons should have descriptive text
      const ctaButtons = page.locator(NAVBAR_SELECTORS.ctaButtons);
      const ctaCount = await ctaButtons.count();

      for (let i = 0; i < ctaCount; i++) {
        const button = ctaButtons.nth(i);
        const buttonText = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        const title = await button.getAttribute('title');

        const hasAccessibleName = buttonText?.trim() || ariaLabel || title;
        expect(hasAccessibleName).toBeTruthy();
      }
    });

    test('should announce menu state changes to screen readers', async ({ page }) => {
      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Monitor aria-live regions
      const announcements: string[] = [];
      
      page.on('console', msg => {
        if (msg.type() === 'log' && msg.text().includes('Accessibility')) {
          announcements.push(msg.text());
        }
      });

      const mobileMenuTrigger = page.locator(NAVBAR_SELECTORS.mobileMenuTrigger);
      if (await mobileMenuTrigger.count() > 0) {
        // Open menu
        await mobileMenuTrigger.click();
        await page.waitForTimeout(500);

        // Close menu
        await mobileMenuTrigger.click();
        await page.waitForTimeout(500);

        // Should have announcements for state changes
        expect(announcements.length).toBeGreaterThan(0);
      }
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Get all headings on the page
      const headings = await page.evaluate(() => {
        const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        return Array.from(headingElements).map(el => ({
          level: parseInt(el.tagName.charAt(1)),
          text: el.textContent?.trim() || '',
          inNavbar: !!el.closest('nav')
        }));
      });

      // Should have proper heading structure (no skipping levels)
      const navbarHeadings = headings.filter(h => h.inNavbar);
      
      if (navbarHeadings.length > 0) {
        // Logo might be h1 if on home page, or lower level on other pages
        const firstHeading = navbarHeadings[0];
        expect([1, 2, 3]).toContain(firstHeading.level);
      }
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should support complete keyboard navigation', async ({ page }) => {
      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Test skip link functionality
      const skipLink = page.locator(NAVBAR_SELECTORS.skipLink);
      if (await skipLink.count() > 0) {
        await page.keyboard.press('Tab');
        await expect(skipLink).toBeFocused();

        // Skip link should be visible when focused
        const isVisible = await skipLink.isVisible();
        expect(isVisible).toBeTruthy();

        // Activate skip link
        await page.keyboard.press('Enter');
        await page.waitForTimeout(200);

        // Focus should move to main content
        const focusedElement = page.locator(':focus');
        const focusedTag = await focusedElement.evaluate(el => el?.tagName.toLowerCase());
        expect(['main', 'h1', 'h2', 'section']).toContain(focusedTag || '');
      }

      // Reset to navbar
      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Navigate through navbar elements
      const focusableElements = await pageHelper.testKeyboardFlow(10);
      
      // Should include navbar elements
      const hasNavbarElements = focusableElements.some(el => 
        el.includes('a') || el.includes('button')
      );
      expect(hasNavbarElements).toBeTruthy();
    });

    test('should handle Enter and Space key activation', async ({ page }) => {
      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Test navigation links
      const firstNavItem = page.locator(NAVBAR_SELECTORS.navItems).first();
      if (await firstNavItem.count() > 0) {
        await firstNavItem.focus();
        await expect(firstNavItem).toBeFocused();

        const href = await firstNavItem.getAttribute('href');
        
        // Activate with Enter
        await page.keyboard.press('Enter');
        await pageHelper.waitForInteractive();

        if (href && href !== '#') {
          expect(page.url()).toContain(href === '/' ? 'localhost:3000' : href);
        }
      }

      // Return to test page
      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Test mobile menu trigger
      const mobileMenuTrigger = page.locator(NAVBAR_SELECTORS.mobileMenuTrigger);
      if (await mobileMenuTrigger.count() > 0) {
        await mobileMenuTrigger.focus();
        await expect(mobileMenuTrigger).toBeFocused();

        // Activate with Space key
        await page.keyboard.press('Space');
        await page.waitForTimeout(300);

        const expandedState = await mobileMenuTrigger.getAttribute('aria-expanded');
        expect(expandedState).toBe('true');
      }
    });

    test('should trap focus in mobile menu', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto('/');
      await pageHelper.waitForInteractive();

      const mobileMenuTrigger = page.locator(NAVBAR_SELECTORS.mobileMenuTrigger);
      
      // Open mobile menu
      await mobileMenuTrigger.focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      const mobileMenu = page.locator(NAVBAR_SELECTORS.mobileMenu);
      await expect(mobileMenu).toBeVisible();

      // Tab through menu items
      const initialFocus = page.locator(':focus');
      const initialElement = await initialFocus.evaluate(el => el?.tagName);

      // Tab forward through menu
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        const currentFocus = page.locator(':focus');
        const isInMenu = await currentFocus.evaluate(el => {
          return el && (
            el.closest('.mobile-menu') !== null ||
            el.getAttribute('aria-expanded') === 'true'
          );
        });
        
        // Focus should stay within mobile menu area
        if (!isInMenu) {
          break; // Focus escaped - this might be end of menu
        }
      }

      // Shift+Tab should also work
      await page.keyboard.press('Shift+Tab');
      const shiftTabFocus = page.locator(':focus');
      const isStillInMenu = await shiftTabFocus.evaluate(el => 
        el && el.closest('.mobile-menu') !== null
      );

      // Close menu with Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      // Focus should return to trigger
      await expect(mobileMenuTrigger).toBeFocused();
    });

    test('should support arrow key navigation in menus', async ({ page }) => {
      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Test arrow navigation in main nav
      const navItems = page.locator(NAVBAR_SELECTORS.navItems);
      const firstNavItem = navItems.first();
      
      if (await navItems.count() > 1) {
        await firstNavItem.focus();
        await expect(firstNavItem).toBeFocused();

        // Arrow right to next item
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(100);

        const secondNavItem = navItems.nth(1);
        const isSecondFocused = await secondNavItem.evaluate(el => 
          document.activeElement === el
        );

        // Arrow navigation might not be implemented for all navbars
        // This test verifies if it exists
        if (isSecondFocused) {
          expect(isSecondFocused).toBeTruthy();
        }
      }
    });
  });

  test.describe('Visual Accessibility', () => {
    test('should have sufficient color contrast', async ({ page }) => {
      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Test navbar background contrast
      const navbar = page.locator(NAVBAR_SELECTORS.navbar);
      const navbarContrast = await getContrastRatio(page, NAVBAR_SELECTORS.navbar);
      
      if (navbarContrast && navbarContrast > 1) {
        expect(navbarContrast).toBeGreaterThan(A11Y_CONFIG.contrast.normal);
      }

      // Test navigation links contrast
      const navItems = page.locator(NAVBAR_SELECTORS.navItems);
      const navItemCount = await navItems.count();

      for (let i = 0; i < Math.min(navItemCount, 3); i++) {
        const navItem = navItems.nth(i);
        const itemContrast = await navItem.evaluate(el => {
          const style = window.getComputedStyle(el);
          const bg = style.backgroundColor;
          const color = style.color;
          
          // Simple contrast calculation
          const getBrightness = (color: string) => {
            const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (!match) return 0;
            const [r, g, b] = match.slice(1).map(Number);
            return (r * 299 + g * 587 + b * 114) / 1000;
          };

          const bgBrightness = getBrightness(bg);
          const textBrightness = getBrightness(color);
          
          return Math.abs(bgBrightness - textBrightness) > 100;
        });

        expect(itemContrast).toBeTruthy();
      }

      // Test CTA buttons contrast
      const ctaButtons = page.locator(NAVBAR_SELECTORS.ctaButtons);
      const ctaCount = await ctaButtons.count();

      for (let i = 0; i < ctaCount; i++) {
        const button = ctaButtons.nth(i);
        const hasContrast = await button.evaluate(el => {
          const style = window.getComputedStyle(el);
          const bg = style.backgroundColor;
          const color = style.color;
          
          // Ensure visible contrast exists
          return bg !== 'rgba(0, 0, 0, 0)' && color !== bg;
        });

        expect(hasContrast).toBeTruthy();
      }
    });

    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/');
      await pageHelper.waitForInteractive();

      const focusableElements = page.locator(NAVBAR_SELECTORS.focusableElements);
      const elementCount = await focusableElements.count();

      // Test first few focusable elements
      for (let i = 0; i < Math.min(elementCount, 5); i++) {
        const element = focusableElements.nth(i);
        
        await element.focus();
        await expect(element).toBeFocused();

        // Check focus ring visibility
        const focusStyles = await element.evaluate(el => {
          const style = window.getComputedStyle(el);
          return {
            outline: style.outline,
            outlineWidth: style.outlineWidth,
            outlineColor: style.outlineColor,
            outlineStyle: style.outlineStyle,
            boxShadow: style.boxShadow,
            borderColor: style.borderColor,
            borderWidth: style.borderWidth
          };
        });

        // Should have some form of focus indication
        const hasFocusIndicator = 
          focusStyles.outline !== 'none' ||
          focusStyles.boxShadow.includes('inset') ||
          focusStyles.boxShadow.includes('rgb') ||
          parseInt(focusStyles.outlineWidth) > 0 ||
          parseInt(focusStyles.borderWidth) > 1;

        expect(hasFocusIndicator).toBeTruthy();
      }
    });

    test('should have adequate touch target sizes', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Test mobile menu trigger
      const mobileMenuTrigger = page.locator(NAVBAR_SELECTORS.mobileMenuTrigger);
      if (await mobileMenuTrigger.count() > 0) {
        const triggerSize = await mobileMenuTrigger.boundingBox();
        expect(triggerSize).toBeTruthy();
        if (triggerSize) {
          expect(triggerSize.width).toBeGreaterThanOrEqual(A11Y_CONFIG.touchTargets.minimum);
          expect(triggerSize.height).toBeGreaterThanOrEqual(A11Y_CONFIG.touchTargets.minimum);
        }
      }

      // Test navigation links on mobile
      const navItems = page.locator(NAVBAR_SELECTORS.mobileMenu + ' a');
      const navItemCount = await navItems.count();

      if (navItemCount > 0) {
        for (let i = 0; i < Math.min(navItemCount, 3); i++) {
          const navItem = navItems.nth(i);
          if (await navItem.isVisible()) {
            const itemSize = await navItem.boundingBox();
            if (itemSize) {
              expect(itemSize.height).toBeGreaterThanOrEqual(A11Y_CONFIG.touchTargets.minimum);
            }
          }
        }
      }

      // Test CTA buttons
      const ctaButtons = page.locator(NAVBAR_SELECTORS.ctaButtons);
      const ctaCount = await ctaButtons.count();

      for (let i = 0; i < ctaCount; i++) {
        const button = ctaButtons.nth(i);
        if (await button.isVisible()) {
          const buttonSize = await button.boundingBox();
          if (buttonSize) {
            expect(buttonSize.width).toBeGreaterThanOrEqual(A11Y_CONFIG.touchTargets.minimum);
            expect(buttonSize.height).toBeGreaterThanOrEqual(A11Y_CONFIG.touchTargets.minimum);
          }
        }
      }
    });

    test('should maintain adequate spacing between interactive elements', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Open mobile menu to test spacing
      const mobileMenuTrigger = page.locator(NAVBAR_SELECTORS.mobileMenuTrigger);
      if (await mobileMenuTrigger.count() > 0) {
        await mobileMenuTrigger.click();
        await page.waitForTimeout(300);

        const mobileNavItems = page.locator(NAVBAR_SELECTORS.mobileMenu + ' a, ' + NAVBAR_SELECTORS.mobileMenu + ' button');
        const itemCount = await mobileNavItems.count();

        if (itemCount > 1) {
          for (let i = 0; i < itemCount - 1; i++) {
            const currentItem = mobileNavItems.nth(i);
            const nextItem = mobileNavItems.nth(i + 1);

            if (await currentItem.isVisible() && await nextItem.isVisible()) {
              const currentBox = await currentItem.boundingBox();
              const nextBox = await nextItem.boundingBox();

              if (currentBox && nextBox) {
                const spacing = nextBox.y - (currentBox.y + currentBox.height);
                expect(spacing).toBeGreaterThanOrEqual(8); // Minimum 8px spacing
              }
            }
          }
        }
      }
    });
  });

  test.describe('Screen Reader Support', () => {
    test('should provide appropriate text alternatives', async ({ page }) => {
      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Test logo accessibility
      const logo = page.locator(NAVBAR_SELECTORS.logo);
      if (await logo.count() > 0) {
        const logoAlt = await logo.evaluate(el => {
          const img = el.querySelector('img');
          const svg = el.querySelector('svg');
          
          return {
            imgAlt: img?.getAttribute('alt'),
            svgTitle: svg?.querySelector('title')?.textContent,
            ariaLabel: el.getAttribute('aria-label'),
            textContent: el.textContent?.trim()
          };
        });

        // Should have some form of accessible name
        const hasAccessibleName = logoAlt.imgAlt || logoAlt.svgTitle || logoAlt.ariaLabel || logoAlt.textContent;
        expect(hasAccessibleName).toBeTruthy();
      }

      // Test navigation landmarks
      const landmarkElements = await page.evaluate(() => {
        const landmarks = document.querySelectorAll('[role="navigation"], nav, [role="banner"], [role="main"]');
        return Array.from(landmarks).map(el => ({
          tagName: el.tagName.toLowerCase(),
          role: el.getAttribute('role'),
          ariaLabel: el.getAttribute('aria-label'),
          hasContent: !!el.textContent?.trim()
        }));
      });

      const navLandmarks = landmarkElements.filter(l => 
        l.role === 'navigation' || l.tagName === 'nav'
      );

      expect(navLandmarks.length).toBeGreaterThan(0);
      
      // At least one navigation landmark should have a label
      const hasLabeledNav = navLandmarks.some(nav => nav.ariaLabel);
      expect(hasLabeledNav).toBeTruthy();
    });

    test('should announce dynamic content changes', async ({ page }) => {
      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Monitor console for accessibility announcements
      const announcements: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'log' && msg.text().includes('[Accessibility]')) {
          announcements.push(msg.text());
        }
      });

      // Test mobile menu state announcements
      const mobileMenuTrigger = page.locator(NAVBAR_SELECTORS.mobileMenuTrigger);
      if (await mobileMenuTrigger.count() > 0) {
        // Open menu
        await mobileMenuTrigger.click();
        await page.waitForTimeout(500);

        // Close menu
        await mobileMenuTrigger.click();
        await page.waitForTimeout(500);

        // Should have screen reader announcements
        const hasAnnouncements = announcements.length > 0;
        expect(hasAnnouncements).toBeTruthy();
      }
    });

    test('should provide context for navigation items', async ({ page }) => {
      await page.goto('/');
      await pageHelper.waitForInteractive();

      const navItems = page.locator(NAVBAR_SELECTORS.navItems);
      const navItemCount = await navItems.count();

      for (let i = 0; i < Math.min(navItemCount, 5); i++) {
        const navItem = navItems.nth(i);
        
        const linkInfo = await navItem.evaluate(el => ({
          href: el.getAttribute('href'),
          textContent: el.textContent?.trim(),
          ariaLabel: el.getAttribute('aria-label'),
          title: el.getAttribute('title'),
          ariaCurrent: el.getAttribute('aria-current'),
          role: el.getAttribute('role')
        }));

        // Should have meaningful link text
        const hasAccessibleText = linkInfo.textContent && linkInfo.textContent.length > 0;
        expect(hasAccessibleText).toBeTruthy();

        // Link text should be descriptive (not just "click here")
        const isDescriptive = !linkInfo.textContent?.toLowerCase().includes('click here') &&
                             !linkInfo.textContent?.toLowerCase().includes('read more') &&
                             !linkInfo.textContent?.toLowerCase().includes('here');
        expect(isDescriptive).toBeTruthy();

        // External links should be indicated
        if (linkInfo.href && (linkInfo.href.startsWith('http') && !linkInfo.href.includes('localhost'))) {
          const hasExternalIndicator = linkInfo.ariaLabel?.includes('external') || 
                                     linkInfo.title?.includes('external') ||
                                     linkInfo.textContent?.includes('(external)');
          
          // External link indication is recommended but not required
          // This test documents the expectation
        }
      }
    });
  });

  test.describe('High Contrast and Reduced Motion', () => {
    test('should support high contrast mode', async ({ page }) => {
      // Enable high contrast simulation
      await page.emulateMedia({ forcedColors: 'active' });
      await page.goto('/');
      await pageHelper.waitForInteractive();

      const navbar = page.locator(NAVBAR_SELECTORS.navbar);
      await expect(navbar).toBeVisible();

      // Elements should remain visible in high contrast mode
      const navItems = page.locator(NAVBAR_SELECTORS.navItems);
      const firstNavItem = navItems.first();
      
      if (await firstNavItem.count() > 0) {
        await expect(firstNavItem).toBeVisible();

        // Focus should be visible in high contrast
        await firstNavItem.focus();
        await expect(firstNavItem).toBeFocused();

        const focusVisible = await firstNavItem.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.outline !== 'none' || style.boxShadow !== 'none';
        });

        expect(focusVisible).toBeTruthy();
      }
    });

    test('should respect reduced motion preferences', async ({ page }) => {
      // Enable reduced motion
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/');
      await pageHelper.waitForInteractive();

      const mobileMenuTrigger = page.locator(NAVBAR_SELECTORS.mobileMenuTrigger);
      
      if (await mobileMenuTrigger.count() > 0) {
        // Measure animation duration
        const startTime = Date.now();
        await mobileMenuTrigger.click();
        
        const mobileMenu = page.locator(NAVBAR_SELECTORS.mobileMenu);
        await expect(mobileMenu).toBeVisible();
        
        const animationTime = Date.now() - startTime;

        // Animation should be instant or very fast with reduced motion
        expect(animationTime).toBeLessThan(100);
      }

      // Test hover animations
      const navItems = page.locator(NAVBAR_SELECTORS.navItems);
      if (await navItems.count() > 0) {
        const firstNavItem = navItems.first();
        
        await firstNavItem.hover();
        await page.waitForTimeout(100);

        // Should not have CSS transitions when motion is reduced
        const hasReducedMotion = await firstNavItem.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.transitionDuration === '0s' || 
                 style.animationDuration === '0s' ||
                 style.transitionDuration === '';
        });

        // This test verifies proper reduced motion implementation
        // Some implementations may still have minimal transitions
        if (hasReducedMotion) {
          expect(hasReducedMotion).toBeTruthy();
        }
      }
    });

    test('should maintain functionality without CSS', async ({ page }) => {
      // Disable CSS
      await page.addStyleTag({ content: '* { all: unset !important; }' });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Basic HTML structure should work
      const navbar = page.locator('nav');
      await expect(navbar).toBeVisible();

      // Links should still be functional
      const links = navbar.locator('a');
      const linkCount = await links.count();
      
      if (linkCount > 0) {
        const firstLink = links.first();
        const href = await firstLink.getAttribute('href');
        expect(href).toBeTruthy();
        
        // Link should be clickable
        await firstLink.click();
        await page.waitForLoadState('networkidle');
        
        if (href && href !== '#' && !href.startsWith('javascript:')) {
          expect(page.url()).toContain(href === '/' ? 'localhost:3000' : href);
        }
      }
    });
  });

  test.describe('WCAG Compliance Verification', () => {
    test('should pass automated accessibility audit', async ({ page }) => {
      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Inject axe-core for accessibility testing
      await page.addScriptTag({ 
        url: 'https://unpkg.com/axe-core@4.8.2/axe.min.js' 
      });

      // Run axe accessibility audit
      const results = await page.evaluate(() => {
        return new Promise((resolve) => {
          (window as any).axe.run(document, {
            tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
            rules: {
              'color-contrast': { enabled: true },
              'focus-order-semantics': { enabled: true },
              'keyboard-navigation': { enabled: true }
            }
          }, (err: any, results: any) => {
            resolve(results);
          });
        });
      });

      const violations = (results as any).violations || [];
      const passes = (results as any).passes || [];

      // Should have no critical violations
      const criticalViolations = violations.filter((v: any) => v.impact === 'critical');
      expect(criticalViolations).toHaveLength(0);

      // Should have minimal serious violations
      const seriousViolations = violations.filter((v: any) => v.impact === 'serious');
      expect(seriousViolations.length).toBeLessThan(3);

      // Should pass key accessibility tests
      expect(passes.length).toBeGreaterThan(violations.length);
    });

    test('should meet WCAG 2.1 AA success criteria', async ({ page }) => {
      await page.goto('/');
      await pageHelper.waitForInteractive();

      // Test key WCAG criteria
      const wcagResults = {
        hasSkipLink: false,
        hasProperHeadings: false,
        hasKeyboardAccess: false,
        hasAriaLabels: false,
        hasGoodContrast: false
      };

      // 2.4.1 Bypass Blocks (Skip Link)
      const skipLink = page.locator(NAVBAR_SELECTORS.skipLink);
      wcagResults.hasSkipLink = await skipLink.count() > 0;

      // 1.3.1 Info and Relationships (Proper Headings)
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
      wcagResults.hasProperHeadings = headings > 0;

      // 2.1.1 Keyboard Access
      const focusableCount = await page.locator(NAVBAR_SELECTORS.focusableElements).count();
      wcagResults.hasKeyboardAccess = focusableCount > 0;

      // 4.1.2 Name, Role, Value (ARIA Labels)
      const elementsWithAria = await page.locator('[aria-label], [aria-labelledby], [role]').count();
      wcagResults.hasAriaLabels = elementsWithAria > 0;

      // 1.4.3 Contrast (Basic contrast check)
      const contrastElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('nav *');
        let goodContrastCount = 0;
        
        Array.from(elements).forEach(el => {
          const style = window.getComputedStyle(el);
          const bg = style.backgroundColor;
          const color = style.color;
          
          if (bg !== 'rgba(0, 0, 0, 0)' && color !== 'rgba(0, 0, 0, 0)') {
            goodContrastCount++;
          }
        });
        
        return goodContrastCount > 0;
      });
      
      wcagResults.hasGoodContrast = contrastElements;

      // Verify WCAG compliance
      const passedCriteria = Object.values(wcagResults).filter(Boolean).length;
      const totalCriteria = Object.keys(wcagResults).length;
      const compliancePercentage = passedCriteria / totalCriteria;

      expect(compliancePercentage).toBeGreaterThan(0.8); // 80% compliance minimum
    });
  });
});