'use client';

import { useCallback, useEffect, useState } from 'react';

// Mobile-first breakpoints matching Tailwind CSS
export const BREAKPOINTS = {
  xs: 0,      // Extra small devices (portrait phones)
  sm: 640,    // Small devices (landscape phones)
  md: 768,    // Medium devices (tablets)
  lg: 1024,   // Large devices (desktops)
  xl: 1280,   // Extra large devices (large desktops)
  '2xl': 1536 // 2X Large devices (larger desktops)
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

interface ViewportSize {
  width: number;
  height: number;
}

interface DeviceCapabilities {
  hasTouch: boolean;
  isStandalone: boolean; // PWA mode
  supportsHover: boolean;
  prefersReducedMotion: boolean;
  colorScheme: 'light' | 'dark';
}

interface OrientationInfo {
  isPortrait: boolean;
  isLandscape: boolean;
  angle: number;
}

interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface ViewportState {
  // Dimensions
  viewport: ViewportSize;
  screen: ViewportSize;

  // Breakpoints
  currentBreakpoint: BreakpointKey;
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  is2Xl: boolean;

  // Mobile detection
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;

  // Device capabilities
  capabilities: DeviceCapabilities;

  // Orientation
  orientation: OrientationInfo;

  // Safe areas (for notched devices)
  safeArea: SafeAreaInsets;

  // Utility functions
  isAbove: (breakpoint: BreakpointKey) => boolean;
  isBelow: (breakpoint: BreakpointKey) => boolean;
  isBetween: (min: BreakpointKey, max: BreakpointKey) => boolean;
}

/**
 * Hook avanzado para detección de viewport y capacidades del dispositivo
 *
 * Características:
 * - Detección precisa de breakpoints móviles
 * - Información de orientación con ángulo
 * - Safe areas para dispositivos con notch
 * - Capacidades del dispositivo (touch, hover, etc.)
 * - Soporte para PWA y modo standalone
 * - Performance optimizada con debounce
 * - SSR-safe con hidratación correcta
 */
export function useViewport(): ViewportState {
  // Initialize with SSR-safe defaults
  const [viewport, setViewport] = useState<ViewportSize>(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  }));

  const [screen, setScreen] = useState<ViewportSize>(() => ({
    width: typeof window !== 'undefined' ? window.screen.width : 1024,
    height: typeof window !== 'undefined' ? window.screen.height : 768
  }));

  const [capabilities, setCapabilities] = useState<DeviceCapabilities>(() => ({
    hasTouch: typeof window !== 'undefined' ? 'ontouchstart' in window : false,
    isStandalone: typeof window !== 'undefined' ? window.matchMedia('(display-mode: standalone)').matches : false,
    supportsHover: typeof window !== 'undefined' ? window.matchMedia('(hover: hover)').matches : true,
    prefersReducedMotion: typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false,
    colorScheme: typeof window !== 'undefined' ?
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 'light'
  }));

  const [orientation, setOrientation] = useState<OrientationInfo>(() => ({
    isPortrait: typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : true,
    isLandscape: typeof window !== 'undefined' ? window.innerWidth > window.innerHeight : false,
    angle: typeof window !== 'undefined' && window.screen.orientation ?
      window.screen.orientation.angle : 0
  }));

  const [safeArea, setSafeArea] = useState<SafeAreaInsets>(() => ({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  }));

  const [isHydrated, setIsHydrated] = useState(false);

  // Get current breakpoint
  const getCurrentBreakpoint = useCallback((width: number): BreakpointKey => {
    if (width >= BREAKPOINTS['2xl']) return '2xl';
    if (width >= BREAKPOINTS.xl) return 'xl';
    if (width >= BREAKPOINTS.lg) return 'lg';
    if (width >= BREAKPOINTS.md) return 'md';
    if (width >= BREAKPOINTS.sm) return 'sm';
    return 'xs';
  }, []);

  // Update viewport info
  const updateViewportInfo = useCallback(() => {
    if (typeof window === 'undefined') return;

    const newViewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    const newScreen = {
      width: window.screen.width,
      height: window.screen.height
    };

    const newOrientation = {
      isPortrait: window.innerHeight > window.innerWidth,
      isLandscape: window.innerWidth > window.innerHeight,
      angle: window.screen.orientation ? window.screen.orientation.angle : 0
    };

    // Update safe area insets from CSS environment variables
    const computedStyle = getComputedStyle(document.documentElement);
    const newSafeArea = {
      top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0'),
      right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0'),
      bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
      left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0')
    };

    setViewport(newViewport);
    setScreen(newScreen);
    setOrientation(newOrientation);
    setSafeArea(newSafeArea);
  }, []);

  // Update device capabilities
  const updateCapabilities = useCallback(() => {
    if (typeof window === 'undefined') return;

    const newCapabilities: DeviceCapabilities = {
      hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      supportsHover: window.matchMedia('(hover: hover)').matches,
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    };

    setCapabilities(newCapabilities);
  }, []);

  // Debounced update function
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const debouncedUpdate = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      updateViewportInfo();
    }, 100); // 100ms debounce

    setTimeoutId(newTimeoutId);
  }, [timeoutId, updateViewportInfo]);

  // Setup event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initial update
    updateViewportInfo();
    updateCapabilities();
    setIsHydrated(true);

    // Event listeners
    window.addEventListener('resize', debouncedUpdate);
    window.addEventListener('orientationchange', updateViewportInfo);

    // Media query listeners for capabilities
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hoverQuery = window.matchMedia('(hover: hover)');
    const standaloneQuery = window.matchMedia('(display-mode: standalone)');

    const handleMediaQueryChange = () => updateCapabilities();

    darkModeQuery.addEventListener('change', handleMediaQueryChange);
    reducedMotionQuery.addEventListener('change', handleMediaQueryChange);
    hoverQuery.addEventListener('change', handleMediaQueryChange);
    standaloneQuery.addEventListener('change', handleMediaQueryChange);

    // Cleanup
    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      window.removeEventListener('orientationchange', updateViewportInfo);

      darkModeQuery.removeEventListener('change', handleMediaQueryChange);
      reducedMotionQuery.removeEventListener('change', handleMediaQueryChange);
      hoverQuery.removeEventListener('change', handleMediaQueryChange);
      standaloneQuery.removeEventListener('change', handleMediaQueryChange);

      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [debouncedUpdate, updateViewportInfo, updateCapabilities, timeoutId]);

  // Calculate derived values
  const currentBreakpoint = getCurrentBreakpoint(viewport.width);

  const breakpointCheckers = {
    isXs: currentBreakpoint === 'xs',
    isSm: currentBreakpoint === 'sm',
    isMd: currentBreakpoint === 'md',
    isLg: currentBreakpoint === 'lg',
    isXl: currentBreakpoint === 'xl',
    is2Xl: currentBreakpoint === '2xl'
  };

  // Device type detection
  const isMobile = viewport.width < BREAKPOINTS.md; // < 768px
  const isTablet = viewport.width >= BREAKPOINTS.md && viewport.width < BREAKPOINTS.lg; // 768px - 1023px
  const isDesktop = viewport.width >= BREAKPOINTS.lg; // >= 1024px

  // Utility functions
  const isAbove = useCallback((breakpoint: BreakpointKey): boolean => {
    return viewport.width >= BREAKPOINTS[breakpoint];
  }, [viewport.width]);

  const isBelow = useCallback((breakpoint: BreakpointKey): boolean => {
    return viewport.width < BREAKPOINTS[breakpoint];
  }, [viewport.width]);

  const isBetween = useCallback((min: BreakpointKey, max: BreakpointKey): boolean => {
    return viewport.width >= BREAKPOINTS[min] && viewport.width < BREAKPOINTS[max];
  }, [viewport.width]);

  return {
    viewport,
    screen,
    currentBreakpoint,
    ...breakpointCheckers,
    isMobile,
    isTablet,
    isDesktop,
    capabilities,
    orientation,
    safeArea,
    isAbove,
    isBelow,
    isBetween
  };
}

/**
 * Hook simplificado para detectar si es dispositivo móvil
 */
export function useIsMobileDevice(): boolean {
  const { isMobile } = useViewport();
  return isMobile;
}

/**
 * Hook para detectar breakpoint específico
 */
export function useBreakpoint(breakpoint: BreakpointKey): boolean {
  const { isAbove } = useViewport();
  return isAbove(breakpoint);
}

/**
 * Hook para detectar capacidades táctiles
 */
export function useTouchCapabilities() {
  const { capabilities } = useViewport();
  return {
    hasTouch: capabilities.hasTouch,
    supportsHover: capabilities.supportsHover,
    isPWA: capabilities.isStandalone
  };
}

/**
 * Hook para safe areas (notch support)
 */
export function useSafeArea() {
  const { safeArea } = useViewport();

  return {
    ...safeArea,
    // CSS custom properties para usar en estilos
    cssVars: {
      '--safe-area-inset-top': `${safeArea.top}px`,
      '--safe-area-inset-right': `${safeArea.right}px`,
      '--safe-area-inset-bottom': `${safeArea.bottom}px`,
      '--safe-area-inset-left': `${safeArea.left}px`
    },
    // Classes para aplicar safe areas
    classes: {
      top: safeArea.top > 0 ? 'pt-[env(safe-area-inset-top)]' : '',
      right: safeArea.right > 0 ? 'pr-[env(safe-area-inset-right)]' : '',
      bottom: safeArea.bottom > 0 ? 'pb-[env(safe-area-inset-bottom)]' : '',
      left: safeArea.left > 0 ? 'pl-[env(safe-area-inset-left)]' : ''
    }
  };
}

/**
 * Hook para animaciones responsivas basadas en capacidades del dispositivo
 */
export function useResponsiveAnimations() {
  const { capabilities, isMobile } = useViewport();

  return {
    // Reduce animaciones en dispositivos de baja potencia o con preferencia
    shouldReduceMotion: capabilities.prefersReducedMotion,

    // Configuración de animaciones optimizada por dispositivo
    animationConfig: {
      duration: capabilities.prefersReducedMotion ? 0 : (isMobile ? 0.2 : 0.3),
      ease: isMobile ? 'easeOut' : [0.4, 0.0, 0.2, 1],
      stiffness: isMobile ? 300 : 400,
      damping: isMobile ? 30 : 25
    },

    // Propiedades CSS para optimización
    optimizationProps: isMobile ? {
      style: {
        willChange: 'transform, opacity',
        transform: 'translate3d(0, 0, 0)' // Force hardware acceleration
      }
    } : {}
  };
}

export default useViewport;