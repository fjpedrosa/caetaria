/**
 * Domain Layer - Navbar Constants
 *
 * Constantes del dominio que definen valores por defecto y configuraciones
 */

import type {
  AccessibilityConfig,
  AnimationConfig,
  CTAConfig,
  NavigationItem,
  PerformanceConfig,
  ThemeConfig
} from './types';

// ============= Navigation Items =============

export const DEFAULT_NAVIGATION_ITEMS: NavigationItem[] = [
  { label: 'Productos', href: '/productos' },
  { label: 'Soluciones', href: '/soluciones' },
  { label: 'Precios', href: '/precios' },
  { label: 'Roadmap', href: '/roadmap' }
];

// ============= CTA Configuration =============

export const DEFAULT_CTA_CONFIG: CTAConfig = {
  signIn: {
    text: 'Iniciar sesión',
    href: '/login',
    ariaLabel: 'Iniciar sesión en tu cuenta existente'
  },
  primary: {
    text: 'Prueba Gratis',
    href: '/onboarding',
    ariaLabel: 'Comenzar prueba gratuita - Crear nueva cuenta'
  }
};

// ============= Accessibility Configuration =============

export const DEFAULT_ACCESSIBILITY_CONFIG: AccessibilityConfig = {
  enableSkipLinks: true,
  enableKeyboardShortcuts: true,
  enableFocusTrap: true,
  enableAriaLive: true,
  minTouchTarget: 44 // WCAG 2.1 AA requirement
};

// ============= Performance Configuration =============

export const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  enablePrefetch: true,
  prefetchDelay: 300,
  maxPrefetchQueue: 10,
  enableHapticFeedback: true,
  enableMicroInteractions: true
};

// ============= Animation Configuration =============

export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500
  },
  easing: {
    smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)'
  },
  reducedMotion: false
};

// ============= Theme Configuration =============

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  colors: {
    primary: 'yellow-400',
    secondary: 'slate-900',
    accent: 'yellow-500',
    background: 'slate-900',
    foreground: 'white',
    border: 'slate-800'
  },
  fonts: {
    heading: 'font-bold',
    body: 'font-medium'
  }
};

// ============= Scroll Thresholds =============

export const SCROLL_THRESHOLDS = {
  HIDE_THRESHOLD: 80,
  SHOW_THRESHOLD: 10,
  DEBOUNCE_TIME: 10,
  SMOOTH_SCROLL_DURATION: 800
} as const;

// ============= Keyboard Shortcuts =============

export const KEYBOARD_SHORTCUTS = {
  SKIP_TO_MAIN: 'Alt+S',
  TOGGLE_MENU: 'Alt+M',
  CLOSE_MENU: 'Escape',
  NAVIGATE_PREV: 'ArrowLeft',
  NAVIGATE_NEXT: 'ArrowRight'
} as const;

// ============= Breakpoints =============

export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 768,
  DESKTOP: 1024,
  LARGE: 1280
} as const;

// ============= Z-Index Layers =============

export const Z_INDEX = {
  SKIP_LINKS: 9999,
  MOBILE_MENU: 60,
  NAVBAR: 50,
  PROGRESS_BAR: 50,
  DROPDOWN: 40
} as const;

// ============= Section IDs =============

export const SECTION_IDS = [
  'hero',
  'features',
  'pricing',
  'testimonials',
  'faq'
] as const;

// ============= ARIA Labels =============

export const ARIA_LABELS = {
  MAIN_NAV: 'Navegación principal del sitio',
  MOBILE_MENU: 'Menú de navegación móvil',
  SKIP_TO_MAIN: 'Saltar al contenido principal',
  SKIP_TO_NAV: 'Saltar a navegación',
  PROGRESS_BAR: 'Progreso de lectura de página',
  LOGO: 'Neptunik - Página principal - Plataforma WhatsApp Cloud'
} as const;

// ============= CSS Classes (for consistency) =============

export const CSS_CLASSES = {
  FOCUS_RING: 'focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2',
  TRANSITION_DEFAULT: 'transition-all duration-200 ease-out',
  TRANSITION_NONE: 'transition-none',
  BUTTON_BASE: 'min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg',
  HIGH_CONTRAST_BG: 'bg-black text-white border-2 border-white',
  DEFAULT_BG: 'bg-slate-900 text-white'
} as const;

// ============= Error Messages =============

export const ERROR_MESSAGES = {
  NAVIGATION_FAILED: 'Failed to navigate to the specified route',
  SECTION_NOT_FOUND: 'The requested section could not be found',
  PREFETCH_FAILED: 'Failed to prefetch the route',
  ACCESSIBILITY_INIT_FAILED: 'Failed to initialize accessibility features',
  SCROLL_LOCK_FAILED: 'Failed to lock/unlock scroll'
} as const;