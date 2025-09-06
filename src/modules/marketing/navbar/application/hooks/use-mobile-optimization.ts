/**
 * Application Layer - Mobile Optimization Hook
 *
 * Hook especializado que optimiza la experiencia móvil del navbar con:
 * - Touch targets de 48x48px mínimo
 * - Navbar sticky optimizado para móvil
 * - Swipe gestures mejorados
 * - Safe areas detection
 * - Haptic feedback
 *
 * Principios aplicados:
 * - Mobile-first approach
 * - Performance optimization
 * - Touch-friendly interactions
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface TouchState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  velocity: number;
  direction: 'left' | 'right' | 'up' | 'down' | null;
  isSwipe: boolean;
}

interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface MobileOptimizationState {
  touchTargetSize: number;
  isCompactMode: boolean;
  hasNotch: boolean;
  safeAreaInsets: SafeAreaInsets;
  isSwipeGestureActive: boolean;
  hapticFeedbackAvailable: boolean;
}

interface UseMobileOptimizationOptions {
  enableSwipeGestures?: boolean;
  swipeThreshold?: number;
  swipeVelocityThreshold?: number;
  enableHapticFeedback?: boolean;
  minTouchTargetSize?: number;
  enableCompactMode?: boolean;
  compactModeThreshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

// Constants optimized for mobile
const DEFAULT_TOUCH_TARGET_SIZE = 48; // WCAG AAA standard
const SWIPE_THRESHOLD = 50; // Reduced from 80px for better mobile UX
const SWIPE_VELOCITY_THRESHOLD = 0.3; // pixels per millisecond
const COMPACT_MODE_SCROLL_THRESHOLD = 100; // When to switch to compact mode
const HAPTIC_PATTERNS = {
  light: { duration: 10, intensity: 1 },
  medium: { duration: 20, intensity: 2 },
  heavy: { duration: 30, intensity: 3 },
  success: { pattern: [10, 10, 10], intensity: 2 },
  warning: { pattern: [30, 10, 30], intensity: 3 }
};

export function useMobileOptimization(options: UseMobileOptimizationOptions = {}) {
  const {
    enableSwipeGestures = true,
    swipeThreshold = SWIPE_THRESHOLD,
    swipeVelocityThreshold = SWIPE_VELOCITY_THRESHOLD,
    enableHapticFeedback = true,
    minTouchTargetSize = DEFAULT_TOUCH_TARGET_SIZE,
    enableCompactMode = true,
    compactModeThreshold = COMPACT_MODE_SCROLL_THRESHOLD,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown
  } = options;

  const [state, setState] = useState<MobileOptimizationState>({
    touchTargetSize: minTouchTargetSize,
    isCompactMode: false,
    hasNotch: false,
    safeAreaInsets: { top: 0, right: 0, bottom: 0, left: 0 },
    isSwipeGestureActive: false,
    hapticFeedbackAvailable: false
  });

  const touchState = useRef<TouchState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    velocity: 0,
    direction: null,
    isSwipe: false
  });

  const touchStartTime = useRef<number>(0);
  const lastScrollY = useRef<number>(0);

  // Detect safe areas (notch, home indicator, etc.)
  const detectSafeAreas = useCallback(() => {
    const computedStyle = getComputedStyle(document.documentElement);

    // Try to get safe area insets from CSS environment variables
    const safeAreaTop = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0');
    const safeAreaRight = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0');
    const safeAreaBottom = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0');
    const safeAreaLeft = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0');

    // Detect if device has a notch (iPhone X and later)
    const hasNotch = safeAreaTop > 20 ||
                     (window.screen.height >= 812 && window.devicePixelRatio >= 2);

    setState(prev => ({
      ...prev,
      hasNotch,
      safeAreaInsets: {
        top: safeAreaTop,
        right: safeAreaRight,
        bottom: safeAreaBottom,
        left: safeAreaLeft
      }
    }));
  }, []);

  // Check haptic feedback availability
  const checkHapticFeedback = useCallback(() => {
    // Check for Vibration API support
    const hasVibrationAPI = 'vibrate' in navigator;

    // Check for iOS Haptic Engine (via Taptic Engine)
    const hasIOSHaptic = 'ontouchstart' in window &&
                         /iPhone|iPad|iPod/.test(navigator.userAgent);

    setState(prev => ({
      ...prev,
      hapticFeedbackAvailable: hasVibrationAPI || hasIOSHaptic
    }));
  }, []);

  // Trigger haptic feedback
  const triggerHapticFeedback = useCallback((type: keyof typeof HAPTIC_PATTERNS = 'light') => {
    if (!enableHapticFeedback || !state.hapticFeedbackAvailable) return;

    const pattern = HAPTIC_PATTERNS[type];

    try {
      if ('vibrate' in navigator) {
        if (Array.isArray(pattern.pattern)) {
          navigator.vibrate(pattern.pattern);
        } else {
          navigator.vibrate(pattern.duration);
        }
      }
    } catch (error) {
      console.debug('Haptic feedback not available:', error);
    }
  }, [enableHapticFeedback, state.hapticFeedbackAvailable]);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enableSwipeGestures) return;

    const touch = e.touches[0];
    touchState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX: 0,
      deltaY: 0,
      velocity: 0,
      direction: null,
      isSwipe: false
    };
    touchStartTime.current = Date.now();

    setState(prev => ({ ...prev, isSwipeGestureActive: true }));
  }, [enableSwipeGestures]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enableSwipeGestures || !touchState.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchState.current.startX;
    const deltaY = touch.clientY - touchState.current.startY;
    const deltaTime = Date.now() - touchStartTime.current;
    const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / Math.max(1, deltaTime);

    touchState.current = {
      ...touchState.current,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX,
      deltaY,
      velocity,
      direction: Math.abs(deltaX) > Math.abs(deltaY)
        ? (deltaX > 0 ? 'right' : 'left')
        : (deltaY > 0 ? 'down' : 'up'),
      isSwipe: Math.abs(deltaX) > swipeThreshold || Math.abs(deltaY) > swipeThreshold
    };

    // Prevent default scrolling if horizontal swipe is detected
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      e.preventDefault();
    }
  }, [enableSwipeGestures, swipeThreshold]);

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!enableSwipeGestures || !touchState.current.isSwipe) {
      setState(prev => ({ ...prev, isSwipeGestureActive: false }));
      return;
    }

    const { deltaX, deltaY, velocity, direction } = touchState.current;

    // Check if swipe meets velocity threshold
    if (velocity < swipeVelocityThreshold) {
      setState(prev => ({ ...prev, isSwipeGestureActive: false }));
      return;
    }

    // Trigger appropriate swipe handler
    switch (direction) {
      case 'left':
        if (Math.abs(deltaX) > swipeThreshold) {
          triggerHapticFeedback('light');
          onSwipeLeft?.();
        }
        break;
      case 'right':
        if (Math.abs(deltaX) > swipeThreshold) {
          triggerHapticFeedback('light');
          onSwipeRight?.();
        }
        break;
      case 'up':
        if (Math.abs(deltaY) > swipeThreshold) {
          triggerHapticFeedback('light');
          onSwipeUp?.();
        }
        break;
      case 'down':
        if (Math.abs(deltaY) > swipeThreshold) {
          triggerHapticFeedback('light');
          onSwipeDown?.();
        }
        break;
    }

    setState(prev => ({ ...prev, isSwipeGestureActive: false }));
  }, [
    enableSwipeGestures,
    swipeThreshold,
    swipeVelocityThreshold,
    triggerHapticFeedback,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown
  ]);

  // Handle scroll for compact mode
  const handleScroll = useCallback(() => {
    if (!enableCompactMode) return;

    const scrollY = window.scrollY;
    const shouldBeCompact = scrollY > compactModeThreshold;

    setState(prev => {
      if (prev.isCompactMode !== shouldBeCompact) {
        return { ...prev, isCompactMode: shouldBeCompact };
      }
      return prev;
    });

    lastScrollY.current = scrollY;
  }, [enableCompactMode, compactModeThreshold]);

  // Ensure touch targets meet minimum size
  const ensureTouchTargetSize = useCallback((element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (width < minTouchTargetSize || height < minTouchTargetSize) {
      // Add padding to meet minimum size
      const paddingX = Math.max(0, (minTouchTargetSize - width) / 2);
      const paddingY = Math.max(0, (minTouchTargetSize - height) / 2);

      element.style.padding = `${paddingY}px ${paddingX}px`;

      // Add transparent expanded hit area using ::before pseudo-element
      element.style.position = 'relative';
      const before = document.createElement('div');
      before.style.position = 'absolute';
      before.style.content = '""';
      before.style.inset = `-${paddingY}px -${paddingX}px`;
      before.style.zIndex = '1';
      element.appendChild(before);
    }
  }, [minTouchTargetSize]);

  // Apply touch target optimization to all interactive elements
  const optimizeTouchTargets = useCallback(() => {
    const interactiveElements = document.querySelectorAll<HTMLElement>(
      'button, a, [role="button"], [role="link"], input, select, textarea'
    );

    interactiveElements.forEach(element => {
      // Skip if already optimized
      if (element.dataset.touchOptimized === 'true') return;

      ensureTouchTargetSize(element);
      element.dataset.touchOptimized = 'true';

      // Add haptic feedback on touch
      if (enableHapticFeedback) {
        element.addEventListener('touchstart', () => triggerHapticFeedback('light'), { passive: true });
      }
    });
  }, [ensureTouchTargetSize, enableHapticFeedback, triggerHapticFeedback]);

  // CSS variables for dynamic styling
  const getCSSVariables = useCallback(() => ({
    '--safe-area-top': `${state.safeAreaInsets.top}px`,
    '--safe-area-right': `${state.safeAreaInsets.right}px`,
    '--safe-area-bottom': `${state.safeAreaInsets.bottom}px`,
    '--safe-area-left': `${state.safeAreaInsets.left}px`,
    '--touch-target-size': `${state.touchTargetSize}px`,
    '--navbar-height': state.isCompactMode ? '56px' : '64px',
    '--navbar-padding-y': state.isCompactMode ? '8px' : '12px'
  }), [state]);

  // Initialize on mount
  useEffect(() => {
    detectSafeAreas();
    checkHapticFeedback();
    optimizeTouchTargets();

    // Re-run on orientation change
    const handleOrientationChange = () => {
      detectSafeAreas();
      optimizeTouchTargets();
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, [detectSafeAreas, checkHapticFeedback, optimizeTouchTargets]);

  // Setup touch event listeners
  useEffect(() => {
    if (!enableSwipeGestures) return;

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enableSwipeGestures, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Setup scroll listener for compact mode
  useEffect(() => {
    if (!enableCompactMode) return;

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [enableCompactMode, handleScroll]);

  return {
    ...state,
    triggerHapticFeedback,
    optimizeTouchTargets,
    getCSSVariables,
    ensureTouchTargetSize
  };
}