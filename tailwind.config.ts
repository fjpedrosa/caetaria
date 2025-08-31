import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          hover: "var(--secondary-hover)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        // State colors
        success: {
          DEFAULT: "var(--success)",
          foreground: "var(--success-foreground)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          foreground: "var(--warning-foreground)",
        },
        info: {
          DEFAULT: "var(--info)",
          foreground: "var(--info-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        // Professional Brand Colors - Corporate Yellow
        'brand-yellow': {
          50: "oklch(0.97 0.05 95)",
          100: "oklch(0.94 0.08 95)",
          200: "oklch(0.91 0.11 95)",
          300: "oklch(0.88 0.13 95)",
          400: "oklch(0.85 0.14 95)",
          500: "oklch(0.87 0.15 95)", // Primary - Corporate Yellow
          600: "oklch(0.83 0.17 93)", // Primary hover
          700: "oklch(0.79 0.19 91)",
          800: "oklch(0.75 0.21 89)",
          900: "oklch(0.71 0.23 87)",
          DEFAULT: "var(--primary)",
        },
        'whatsapp-green': {
          50: "oklch(0.96 0.05 150)",
          100: "oklch(0.92 0.08 150)",
          200: "oklch(0.86 0.12 150)",
          300: "oklch(0.80 0.16 150)",
          400: "oklch(0.75 0.20 150)", // WhatsApp Green
          500: "oklch(0.70 0.22 148)", // WhatsApp Green hover
          600: "oklch(0.65 0.24 146)",
          700: "oklch(0.58 0.26 144)",
          800: "oklch(0.52 0.24 142)",
          900: "oklch(0.46 0.22 140)",
          DEFAULT: "var(--whatsapp)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // Mobile-first responsive breakpoints
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        // Device-specific breakpoints
        'mobile': { 'max': '767px' },
        'tablet': { 'min': '768px', 'max': '1023px' },
        'desktop': { 'min': '1024px' },
        // Orientation breakpoints
        'portrait': { 'raw': '(orientation: portrait)' },
        'landscape': { 'raw': '(orientation: landscape)' },
        // Touch and interaction
        'touch': { 'raw': '(pointer: coarse)' },
        'no-touch': { 'raw': '(pointer: fine)' },
        'hover': { 'raw': '(hover: hover)' },
        // Accessibility
        'reduced-motion': { 'raw': '(prefers-reduced-motion: reduce)' },
        'high-contrast': { 'raw': '(prefers-contrast: high)' },
        // Display characteristics
        'retina': { 'raw': '(min-resolution: 2dppx)' },
        'high-refresh': { 'raw': '(min-resolution: 120dpi)' },
      },
      // REMOVED: All gradient backgrounds for clean design
      // Using solid colors only for professional appearance
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'scale-up': 'scaleUp 0.3s ease-out',
        'pulse-gentle': 'pulseGentle 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'wave': 'wave 2s ease-in-out infinite',
        'typing-dot': 'typing-dot 1.2s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleUp: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGentle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px oklch(0.87 0.15 95 / 0.4)' },
          '100%': { boxShadow: '0 0 30px oklch(0.87 0.15 95 / 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(1.1)' },
        },
        // Mobile-specific animations
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-left': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-right': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.1)', opacity: '0.8' },
          '70%': { transform: 'scale(0.9)', opacity: '0.9' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'touch-feedback': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        'typing-dot': {
          '0%, 60%, 100%': { 
            transform: 'translateY(0)', 
            opacity: '0.4' 
          },
          '30%': { 
            transform: 'translateY(-8px)', 
            opacity: '1' 
          },
        },
      },
      boxShadow: {
        'brand': '0 4px 14px 0 oklch(0.87 0.15 95 / 0.25)',
        'brand-lg': '0 10px 40px 0 oklch(0.87 0.15 95 / 0.3)',
        'whatsapp': '0 4px 14px 0 oklch(0.75 0.20 150 / 0.25)',
        'whatsapp-lg': '0 10px 40px 0 oklch(0.75 0.20 150 / 0.3)',
        // Mobile-optimized shadows
        'mobile-card': '0 2px 8px 0 rgba(0, 0, 0, 0.1)',
        'mobile-floating': '0 4px 16px 0 rgba(0, 0, 0, 0.15)',
        'mobile-modal': '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
      },
      // Mobile-first spacing scale
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
        // Touch-friendly sizes
        'touch-sm': '2.75rem', // 44px
        'touch-md': '3rem',    // 48px
        'touch-lg': '3.5rem',  // 56px
      },
      // Mobile typography scale
      fontSize: {
        'mobile-xs': ['0.75rem', { lineHeight: '1rem' }],
        'mobile-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'mobile-base': ['1rem', { lineHeight: '1.5rem' }],
        'mobile-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'mobile-xl': ['1.25rem', { lineHeight: '1.75rem' }],
        'mobile-2xl': ['1.5rem', { lineHeight: '2rem' }],
        'mobile-3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      },
      // Viewport units for mobile
      height: {
        'screen-small': '100svh', // Small viewport height
        'screen-large': '100lvh', // Large viewport height
        'screen-dynamic': '100dvh', // Dynamic viewport height
      },
      maxHeight: {
        'screen-small': '100svh',
        'screen-large': '100lvh', 
        'screen-dynamic': '100dvh',
      },
      minHeight: {
        'screen-small': '100svh',
        'screen-large': '100lvh',
        'screen-dynamic': '100dvh',
      },
    },
  },
  plugins: [
    // Custom plugin for mobile utilities
    function({ addUtilities, theme, addComponents }) {
      // Hardware acceleration utilities
      addUtilities({
        '.hw-accel': {
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          perspective: '1000px',
        },
        '.hw-accel-scroll': {
          transform: 'translateZ(0)',
          WebkitOverflowScrolling: 'touch',
          willChange: 'scroll-position',
        },
        '.hw-accel-animate': {
          transform: 'translateZ(0)',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
        },
      });
      
      // Touch-optimized components
      addComponents({
        '.touch-button': {
          minHeight: theme('spacing.touch-md'),
          minWidth: theme('spacing.touch-md'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          touchAction: 'manipulation',
          userSelect: 'none',
          WebkitTouchCallout: 'none',
          cursor: 'pointer',
        },
        '.mobile-container': {
          paddingLeft: 'max(1rem, env(safe-area-inset-left))',
          paddingRight: 'max(1rem, env(safe-area-inset-right))',
        },
        '.mobile-safe-area': {
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        },
        '.scrollable-area': {
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          scrollBehavior: 'smooth',
        },
      });
    },
  ],
};

export default config;