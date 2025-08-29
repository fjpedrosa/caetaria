/** @type {import('tailwindcss').Config} */
module.exports = {
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
        // Brand colors
        'brand-yellow': {
          50: "oklch(0.97 0.05 85)",
          100: "oklch(0.94 0.08 83)",
          200: "oklch(0.90 0.10 84)",
          300: "oklch(0.86 0.12 85)", 
          400: "oklch(0.82 0.14 85)", // Primary - Bright yellow
          500: "oklch(0.78 0.16 82)", // Primary hover
          600: "oklch(0.74 0.18 80)",
          700: "oklch(0.70 0.20 78)",
          800: "oklch(0.60 0.22 75)",
          900: "oklch(0.50 0.24 70)",
          DEFAULT: "var(--primary)",
        },
        'brand-blue': {
          50: "oklch(0.95 0.05 255)",
          100: "oklch(0.90 0.10 255)",
          200: "oklch(0.80 0.15 255)",
          300: "oklch(0.70 0.20 255)",
          400: "oklch(0.60 0.23 252)", // Secondary hover
          500: "oklch(0.55 0.25 255)", // Secondary
          600: "oklch(0.50 0.24 258)",
          700: "oklch(0.45 0.22 260)",
          800: "oklch(0.35 0.20 265)",
          900: "oklch(0.25 0.18 270)",
          DEFAULT: "var(--secondary)",
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
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-secondary': 'var(--gradient-secondary)',
        'gradient-brand': 'var(--gradient-brand)',
        'gradient-warm': 'var(--gradient-warm)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
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
          '100%': { boxShadow: '0 0 30px oklch(0.87 0.15 95 / 0.6), 0 0 40px oklch(0.55 0.25 255 / 0.3)' },
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
      },
      boxShadow: {
        'brand': '0 4px 14px 0 oklch(0.87 0.15 95 / 0.25)',
        'brand-lg': '0 10px 40px 0 oklch(0.87 0.15 95 / 0.3)',
        'secondary': '0 4px 14px 0 oklch(0.55 0.25 255 / 0.25)',
        'secondary-lg': '0 10px 40px 0 oklch(0.55 0.25 255 / 0.3)',
      },
    },
  },
  plugins: [],
}