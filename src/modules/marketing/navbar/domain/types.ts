/**
 * Domain Layer - Navbar Types and Interfaces
 *
 * Este archivo define TODOS los tipos e interfaces del dominio del navbar.
 * Principio aplicado: Interface Segregation - Interfaces específicas y cohesivas
 */

// ============= Navigation Types =============

export interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ComponentType;
  description?: string;
  badge?: string;
  external?: boolean;
  sectionId?: string; // For scroll-to-section navigation
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

export interface MegaMenuContent {
  sections: NavigationSection[];
  featured?: NavigationItem;
}

// ============= CTA Configuration =============

export interface CTAConfig {
  signIn: {
    text: string;
    href: string;
    ariaLabel?: string;
  };
  primary: {
    text: string;
    href: string;
    icon?: React.ComponentType;
    ariaLabel?: string;
  };
}

// ============= Navbar Props =============

export interface NavbarVariant {
  type: 'default' | 'transparent' | 'solid';
  blurEffect?: boolean;
}

export interface NavbarConfig {
  variant?: NavbarVariant;
  showProgress?: boolean;
  hideOnScroll?: boolean;
  sticky?: boolean;
  className?: string;
}

// ============= Scroll State =============

export interface ScrollState {
  isVisible: boolean;
  isAtTop: boolean;
  scrollY: number;
  scrollVelocity: number;
  scrollDirection: 'up' | 'down' | 'idle';
  scrollProgress: number;
}

// ============= Mobile Menu State =============

export interface MobileMenuState {
  isOpen: boolean;
  isAnimating: boolean;
  focusTrapActive: boolean;
}

// ============= Accessibility State =============

export interface AccessibilityState {
  announcements: string[];
  focusedElement: string | null;
  skipLinkVisible: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  screenReaderActive: boolean;
  keyboardNavigating: boolean;
}

export interface AccessibilityConfig {
  enableSkipLinks: boolean;
  enableKeyboardShortcuts: boolean;
  enableFocusTrap: boolean;
  enableAriaLive: boolean;
  minTouchTarget: number; // in pixels, min 44px for WCAG
}

// ============= Performance Optimization =============

export interface PrefetchState {
  queue: Set<string>;
  isPrefetching: Map<string, boolean>;
  cache: Map<string, boolean>;
}

export interface PerformanceConfig {
  enablePrefetch: boolean;
  prefetchDelay: number;
  maxPrefetchQueue: number;
  enableHapticFeedback: boolean;
  enableMicroInteractions: boolean;
}

// ============= Animation Configuration =============

export interface AnimationConfig {
  duration: {
    fast: number;
    normal: number;
    slow: number;
  };
  easing: {
    smooth: string;
    bounce: string;
    sharp: string;
  };
  reducedMotion: boolean;
}

// ============= Viewport Information =============

export interface ViewportState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLg: boolean;
  orientation: 'portrait' | 'landscape';
}

// ============= Section Tracking =============

export interface SectionProgress {
  sectionId: string;
  progress: number; // 0-100
  isVisible: boolean;
  isActive: boolean;
}

// ============= Theme Configuration =============

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

// ============= Component Props Interfaces =============

// Pure presentational component props
export interface NavbarPresentationProps {
  navigationItems: NavigationItem[];
  ctaConfig: CTAConfig;
  theme?: ThemeConfig;
  className?: string;
  isTransparent?: boolean;
  showLogo?: boolean;
  logoText?: string;
  ariaLabel?: string;

  // Event handlers (no business logic)
  onLogoClick?: () => void;
  onNavItemClick?: (item: NavigationItem) => void;
  onNavItemHover?: () => void;
  onSignInClick?: () => void;
  onPrimaryCtaClick?: () => void;
  onMobileMenuToggle?: () => void;

  // Visual states only
  isMobileMenuOpen?: boolean;
  activeNavItem?: string;
  isScrolled?: boolean;
  isVisible?: boolean;
  isCompactMode?: boolean;
  cssVariables?: Record<string, string>;
}

// Container component props (smart component)
export interface NavbarContainerProps {
  config?: NavbarConfig;
  navigationItems?: NavigationItem[];
  ctaConfig?: CTAConfig;
  performanceConfig?: PerformanceConfig;
  accessibilityConfig?: AccessibilityConfig;
  onNavigate?: (href: string) => void;
  className?: string;
}

// Mobile menu presentation props
export interface MobileMenuPresentationProps {
  isOpen: boolean;
  navigationItems: NavigationItem[];
  ctaConfig: CTAConfig;
  logoText?: string;
  onClose: () => void;
  onNavigate: (href: string) => void;
  onSignIn: () => void;
  onPrimaryCta: () => void;
}

// Mega menu presentation props
export interface MegaMenuPresentationProps {
  content: MegaMenuContent;
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onNavigate: (href: string) => void;
}

// Progress bar presentation props
export interface ProgressBarPresentationProps {
  progress: number; // 0-100
  sections?: SectionProgress[];
  currentSection?: string;
  variant?: 'linear' | 'stepped';
  className?: string;
  onSectionClick?: (sectionId: string) => void;
}

// ============= Service Interfaces (Ports) =============

export interface NavigationService {
  navigateToSection(sectionId: string, options?: ScrollToOptions): Promise<void>;
  navigateToRoute(href: string): Promise<void>;
  prefetchRoute(href: string): Promise<void>;
  getCurrentSection(): string | null;
}

export interface AccessibilityService {
  announceToScreenReader(message: string): void;
  trapFocus(containerElement: HTMLElement): void;
  releaseFocus(): void;
  detectUserPreferences(): AccessibilityState;
}

export interface AnimationService {
  createRippleEffect(element: HTMLElement, position?: { x: number; y: number }): void;
  triggerHapticFeedback(intensity: 'light' | 'medium' | 'heavy'): Promise<void>;
  addMicroInteraction(element: HTMLElement, type: string): void;
}

export interface ScrollService {
  getScrollState(): ScrollState;
  scrollToElement(element: HTMLElement, options?: ScrollToOptions): void;
  lockScroll(): void;
  unlockScroll(): void;
}

// ============= Event Types =============

export interface NavbarEvents {
  onNavigationStart?: (href: string) => void;
  onNavigationEnd?: (href: string) => void;
  onSectionChange?: (sectionId: string) => void;
  onMobileMenuToggle?: (isOpen: boolean) => void;
  onAccessibilityAnnouncement?: (message: string) => void;
}

// ============= Error Types =============

export class NavbarError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'NavbarError';
  }
}

export class NavigationError extends NavbarError {
  constructor(message: string) {
    super(message, 'NAVIGATION_ERROR');
  }
}

export class AccessibilityError extends NavbarError {
  constructor(message: string) {
    super(message, 'ACCESSIBILITY_ERROR');
  }
}