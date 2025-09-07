/**
 * Design tokens for premium navbar inspired by Stripe & Supabase
 * Consistent design system for professional look and feel
 */

export const designTokens = {
  // Color palette
  colors: {
    // Base colors
    background: {
      primary: 'rgba(255, 255, 255, 0.98)',
      secondary: 'rgba(249, 250, 251, 0.95)',
      overlay: 'rgba(0, 0, 0, 0.4)',
      blur: 'rgba(255, 255, 255, 0.85)',
    },

    // Text colors
    text: {
      primary: '#0a2540', // Dark blue like Stripe
      secondary: '#425466', // Muted gray
      tertiary: '#6b7280',
      inverse: '#ffffff',
    },

    // Brand colors
    brand: {
      primary: '#635bff', // Stripe purple
      primaryHover: '#7a73ff',
      secondary: '#00d924', // Success green
      accent: '#00a8ff', // Info blue
    },

    // Interactive states
    interactive: {
      hover: 'rgba(99, 91, 255, 0.08)',
      active: 'rgba(99, 91, 255, 0.12)',
      focus: 'rgba(99, 91, 255, 0.2)',
      selected: 'rgba(99, 91, 255, 0.15)',
    },

    // Semantic colors
    semantic: {
      success: '#00d924',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },

    // Borders
    border: {
      light: 'rgba(0, 0, 0, 0.08)',
      medium: 'rgba(0, 0, 0, 0.12)',
      dark: 'rgba(0, 0, 0, 0.2)',
    },
  },

  // Typography system
  typography: {
    fontFamily: {
      base: '\'Inter\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif',
      mono: '\'SF Mono\', \'Monaco\', \'Inconsolata\', monospace',
    },

    fontSize: {
      xs: '11px',
      sm: '13px',
      base: '14px',
      md: '15px',
      lg: '16px',
      xl: '18px',
    },

    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },

    lineHeight: {
      tight: 1.2,
      base: 1.5,
      relaxed: 1.75,
    },

    letterSpacing: {
      tight: '-0.02em',
      normal: '-0.01em',
      wide: '0.025em',
    },
  },

  // Spacing system (based on 4px grid)
  spacing: {
    px: '1px',
    0.5: '2px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    7: '28px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
  },

  // Layout dimensions
  layout: {
    navbar: {
      height: '64px',
      mobileHeight: '56px',
    },

    megaMenu: {
      maxWidth: '1280px',
      padding: '32px',
      columnGap: '48px',
      rowGap: '24px',
    },

    container: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },

  // Border radius
  borderRadius: {
    sm: '4px',
    base: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },

  // Shadows (multi-layered for depth)
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '2xl': '0 0 0 1px rgba(0, 0, 0, 0.05), 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },

  // Animation configurations
  animation: {
    duration: {
      instant: '100ms',
      fast: '200ms',
      base: '300ms',
      slow: '400ms',
      slower: '600ms',
    },

    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    },

    spring: {
      gentle: { type: 'spring', stiffness: 100, damping: 15 },
      snappy: { type: 'spring', stiffness: 300, damping: 25 },
      bouncy: { type: 'spring', stiffness: 400, damping: 20 },
    },
  },

  // Hover intent delays
  interaction: {
    hoverDelay: 150, // ms to wait before showing menu
    leaveDelay: 300, // ms to wait before hiding menu
    focusRingWidth: '2px',
    focusRingOffset: '2px',
  },

  // Z-index layers
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    backdrop: 40,
    modal: 50,
    popover: 60,
    tooltip: 70,
    notification: 80,
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// Type exports for TypeScript
export type DesignTokens = typeof designTokens;
export type ColorTokens = typeof designTokens.colors;
export type TypographyTokens = typeof designTokens.typography;
export type SpacingTokens = typeof designTokens.spacing;
export type AnimationTokens = typeof designTokens.animation;