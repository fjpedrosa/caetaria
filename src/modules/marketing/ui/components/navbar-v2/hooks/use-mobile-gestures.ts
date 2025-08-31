'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface SwipeGestureConfig {
  threshold?: number;           // Distancia mínima para detectar swipe (px)
  velocityThreshold?: number;   // Velocidad mínima para detectar swipe (px/ms)
  timeThreshold?: number;       // Tiempo máximo para completar swipe (ms)
  preventScroll?: boolean;      // Prevenir scroll durante swipe
  direction?: 'horizontal' | 'vertical' | 'both'; // Direcciones permitidas
}

interface SwipeGestureResult {
  direction: 'left' | 'right' | 'up' | 'down' | null;
  distance: number;
  velocity: number;
  duration: number;
}

interface MobileGesturesHook {
  // Swipe detection
  isSwipeActive: boolean;
  lastSwipe: SwipeGestureResult | null;

  // Touch tracking
  isTouching: boolean;
  touchPosition: TouchPoint | null;

  // Event handlers
  onTouchStart: (event: TouchEvent) => void;
  onTouchMove: (event: TouchEvent) => void;
  onTouchEnd: (event: TouchEvent) => void;

  // Utilities
  resetSwipe: () => void;
  enableGestures: () => void;
  disableGestures: () => void;
}

/**
 * Hook avanzado para gestión de gestos móviles
 *
 * Características:
 * - Detección precisa de swipes con umbrales configurables
 * - Soporte para múltiples direcciones
 * - Prevención de scroll durante gestos
 * - Tracking de velocidad y duración
 * - Performance optimizada con RAF
 * - Soporte para touch targets pequeños
 */
export function useMobileGestures(
  config: SwipeGestureConfig = {},
  callbacks: {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    onTouchStart?: (position: TouchPoint) => void;
    onTouchEnd?: () => void;
  } = {}
): MobileGesturesHook {
  const {
    threshold = 50,
    velocityThreshold = 0.3,
    timeThreshold = 500,
    preventScroll = false,
    direction = 'both'
  } = config;

  // State
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [touchPosition, setTouchPosition] = useState<TouchPoint | null>(null);
  const [lastSwipe, setLastSwipe] = useState<SwipeGestureResult | null>(null);
  const [gesturesEnabled, setGesturesEnabled] = useState(true);

  // Refs for tracking
  const startTouchRef = useRef<TouchPoint | null>(null);
  const currentTouchRef = useRef<TouchPoint | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Helper function to get touch point
  const getTouchPoint = useCallback((event: TouchEvent): TouchPoint => {
    const touch = event.touches[0] || event.changedTouches[0];
    return {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    };
  }, []);

  // Calculate swipe result
  const calculateSwipeResult = useCallback((
    start: TouchPoint,
    end: TouchPoint
  ): SwipeGestureResult => {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const duration = end.timestamp - start.timestamp;

    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
    const velocity = distance / Math.max(duration, 1);

    // Determine primary direction
    let swipeDirection: 'left' | 'right' | 'up' | 'down' | null = null;

    if (distance >= threshold && velocity >= velocityThreshold && duration <= timeThreshold) {
      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);

      if (direction === 'horizontal' || direction === 'both') {
        if (isHorizontal) {
          swipeDirection = deltaX > 0 ? 'right' : 'left';
        }
      }

      if (direction === 'vertical' || direction === 'both') {
        if (!isHorizontal) {
          swipeDirection = deltaY > 0 ? 'down' : 'up';
        }
      }
    }

    return {
      direction: swipeDirection,
      distance,
      velocity,
      duration
    };
  }, [threshold, velocityThreshold, timeThreshold, direction]);

  // Touch start handler
  const onTouchStart = useCallback((event: TouchEvent) => {
    if (!gesturesEnabled) return;

    const touchPoint = getTouchPoint(event);
    startTouchRef.current = touchPoint;
    currentTouchRef.current = touchPoint;

    setIsTouching(true);
    setTouchPosition(touchPoint);
    setIsSwipeActive(true);

    callbacks.onTouchStart?.(touchPoint);

    // Prevent scroll if configured
    if (preventScroll) {
      event.preventDefault();
    }
  }, [gesturesEnabled, getTouchPoint, preventScroll, callbacks]);

  // Touch move handler
  const onTouchMove = useCallback((event: TouchEvent) => {
    if (!gesturesEnabled || !startTouchRef.current || !isSwipeActive) return;

    const touchPoint = getTouchPoint(event);
    currentTouchRef.current = touchPoint;

    // Update touch position with RAF for smooth tracking
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      setTouchPosition(touchPoint);
    });

    // Prevent scroll during active gesture if configured
    if (preventScroll) {
      event.preventDefault();
    }
  }, [gesturesEnabled, isSwipeActive, getTouchPoint, preventScroll]);

  // Touch end handler
  const onTouchEnd = useCallback((event: TouchEvent) => {
    if (!gesturesEnabled || !startTouchRef.current) return;

    const endTouchPoint = getTouchPoint(event);
    const swipeResult = calculateSwipeResult(startTouchRef.current, endTouchPoint);

    setLastSwipe(swipeResult);
    setIsSwipeActive(false);
    setIsTouching(false);
    setTouchPosition(null);

    // Execute appropriate callback based on swipe direction
    if (swipeResult.direction) {
      switch (swipeResult.direction) {
        case 'left':
          callbacks.onSwipeLeft?.();
          break;
        case 'right':
          callbacks.onSwipeRight?.();
          break;
        case 'up':
          callbacks.onSwipeUp?.();
          break;
        case 'down':
          callbacks.onSwipeDown?.();
          break;
      }
    }

    callbacks.onTouchEnd?.();

    // Reset refs
    startTouchRef.current = null;
    currentTouchRef.current = null;

    // Clean up animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [gesturesEnabled, getTouchPoint, calculateSwipeResult, callbacks]);

  // Utility functions
  const resetSwipe = useCallback(() => {
    setLastSwipe(null);
    setIsSwipeActive(false);
    setIsTouching(false);
    setTouchPosition(null);
    startTouchRef.current = null;
    currentTouchRef.current = null;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const enableGestures = useCallback(() => {
    setGesturesEnabled(true);
  }, []);

  const disableGestures = useCallback(() => {
    setGesturesEnabled(false);
    resetSwipe();
  }, [resetSwipe]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    isSwipeActive,
    lastSwipe,
    isTouching,
    touchPosition,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    resetSwipe,
    enableGestures,
    disableGestures
  };
}

/**
 * Hook simplificado para swipe-to-close functionality
 * Especialmente útil para menús móviles y overlays
 */
export function useSwipeToClose(
  onClose: () => void,
  config: {
    threshold?: number;
    direction?: 'left' | 'right' | 'up' | 'down' | 'horizontal' | 'vertical';
    enabled?: boolean;
  } = {}
) {
  const { threshold = 100, direction = 'right', enabled = true } = config;

  const swipeDirection = direction === 'horizontal' ? 'horizontal' :
                        direction === 'vertical' ? 'vertical' : 'both';

  const callbacks = {
    onSwipeLeft: direction === 'left' || direction === 'horizontal' ? onClose : undefined,
    onSwipeRight: direction === 'right' || direction === 'horizontal' ? onClose : undefined,
    onSwipeUp: direction === 'up' || direction === 'vertical' ? onClose : undefined,
    onSwipeDown: direction === 'down' || direction === 'vertical' ? onClose : undefined,
  };

  const gestures = useMobileGestures(
    {
      threshold,
      direction: swipeDirection,
      preventScroll: true,
      velocityThreshold: 0.4, // Slightly higher threshold for closing
      timeThreshold: 400
    },
    callbacks
  );

  // Disable gestures if not enabled
  useEffect(() => {
    if (enabled) {
      gestures.enableGestures();
    } else {
      gestures.disableGestures();
    }
  }, [enabled, gestures]);

  return {
    ...gestures,
    // Additional convenience properties for swipe-to-close
    isClosing: gestures.isSwipeActive && gestures.lastSwipe?.direction !== null,
    progress: gestures.touchPosition && gestures.isSwipeActive ?
      Math.min(Math.abs((gestures.touchPosition.x - (gestures.touchPosition.x - 50)) / threshold), 1) : 0
  };
}

/**
 * Hook para detectar dispositivos móviles y capacidades touch
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  const [hasTouch, setHasTouch] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isMobileWidth = width < 768; // md breakpoint

      setIsMobile(isMobileWidth || isTouchDevice);
      setHasTouch(isTouchDevice);
      setScreenSize({ width, height });
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  return { isMobile, hasTouch, screenSize };
}