/**
 * Application Layer - Navbar Scroll Hook
 *
 * Hook optimizado que maneja toda la lógica de scroll del navbar.
 * Implementa throttling a 60fps con requestAnimationFrame para performance óptima.
 *
 * Principios aplicados:
 * - Single Responsibility: Solo maneja scroll
 * - Performance First: Throttling a 16ms (60fps)
 * - Memory Efficient: Cleanup apropiado de timers y listeners
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { SCROLL_THRESHOLDS } from '../../domain/constants';
import type { ScrollState } from '../../domain/types';

interface UseNavbarScrollOptions {
  threshold?: number;
  hideThreshold?: number;
  throttleTime?: number; // Changed from debounceTime to throttleTime for clarity
  enableProgressBar?: boolean;
  enableVelocityTracking?: boolean;
  onScrollChange?: (state: ScrollState) => void;
}

// Constants for performance optimization
const FRAME_TIME = 16; // 60fps = 16.67ms per frame
const VELOCITY_SMOOTHING = 0.7; // Smoothing factor for velocity calculation

export function useNavbarScroll(options: UseNavbarScrollOptions = {}) {
  const {
    threshold = SCROLL_THRESHOLDS.SHOW_THRESHOLD,
    hideThreshold = SCROLL_THRESHOLDS.HIDE_THRESHOLD,
    throttleTime = FRAME_TIME, // Default to 60fps
    enableProgressBar = true,
    enableVelocityTracking = true,
    onScrollChange
  } = options;

  const [scrollState, setScrollState] = useState<ScrollState>({
    isVisible: true,
    isAtTop: true,
    scrollY: 0,
    scrollVelocity: 0,
    scrollDirection: 'idle',
    scrollProgress: 0
  });

  const lastScrollY = useRef(0);
  const lastTimestamp = useRef(performance.now()); // Use performance.now() for better precision
  const rafId = useRef<number | undefined>();
  const throttleTimer = useRef<number | undefined>();
  const velocityHistory = useRef<number[]>([]); // Track velocity history for smoothing
  const isScrolling = useRef(false);

  // Calculate scroll progress with caching
  const calculateScrollProgress = useCallback(() => {
    if (!enableProgressBar) return 0;

    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) return 0;

    const progress = (window.scrollY / scrollHeight) * 100;
    return Math.max(0, Math.min(100, progress)); // Clamp between 0-100
  }, [enableProgressBar]);

  // Calculate smoothed scroll velocity for better UX
  const calculateVelocity = useCallback((currentY: number, currentTime: number) => {
    if (!enableVelocityTracking) return 0;

    const deltaY = currentY - lastScrollY.current;
    const deltaTime = Math.max(1, currentTime - lastTimestamp.current); // Prevent division by zero

    const instantVelocity = Math.abs(deltaY / deltaTime) * 1000; // pixels per second

    // Apply smoothing using exponential moving average
    velocityHistory.current.push(instantVelocity);
    if (velocityHistory.current.length > 5) {
      velocityHistory.current.shift(); // Keep only last 5 values
    }

    // Calculate weighted average for smoother velocity
    const smoothedVelocity = velocityHistory.current.reduce((acc, vel, index) => {
      const weight = Math.pow(VELOCITY_SMOOTHING, velocityHistory.current.length - index - 1);
      return acc + vel * weight;
    }, 0) / velocityHistory.current.reduce((acc, _, index) => {
      return acc + Math.pow(VELOCITY_SMOOTHING, velocityHistory.current.length - index - 1);
    }, 0);

    return smoothedVelocity;
  }, [enableVelocityTracking]);

  // Determine scroll direction
  const determineDirection = useCallback((currentY: number): 'up' | 'down' | 'idle' => {
    const delta = currentY - lastScrollY.current;

    if (Math.abs(delta) < 1) return 'idle';
    return delta > 0 ? 'down' : 'up';
  }, []);

  // Optimized main scroll handler with 60fps throttling
  const handleScroll = useCallback(() => {
    // Cancel any pending animation frame
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }

    rafId.current = requestAnimationFrame(() => {
      const currentY = window.scrollY;
      const currentTime = performance.now();

      // Calculate metrics
      const velocity = calculateVelocity(currentY, currentTime);
      const direction = determineDirection(currentY);
      const progress = calculateScrollProgress();
      const isAtTop = currentY < threshold;

      // Check if mobile device
      const isMobile = window.innerWidth < 768;

      // Smart visibility logic with mobile optimization
      let isVisible = scrollState.isVisible;

      if (isMobile) {
        // Always visible on mobile for better UX
        isVisible = true;
      } else if (direction === 'down') {
        // Desktop: Hide only after passing threshold and with sufficient velocity
        if (currentY > hideThreshold && velocity > 50) {
          isVisible = false;
        }
      } else if (direction === 'up') {
        // Show immediately when scrolling up
        isVisible = true;
      } else if (isAtTop) {
        // Always visible at top
        isVisible = true;
      }

      const newState: ScrollState = {
        isVisible,
        isAtTop,
        scrollY: currentY,
        scrollVelocity: velocity,
        scrollDirection: direction,
        scrollProgress: progress
      };

      // Only update state if something changed (performance optimization)
      setScrollState(prevState => {
        const hasChanged =
          prevState.isVisible !== newState.isVisible ||
          prevState.isAtTop !== newState.isAtTop ||
          Math.abs(prevState.scrollY - newState.scrollY) > 1 ||
          Math.abs(prevState.scrollVelocity - newState.scrollVelocity) > 10 ||
          prevState.scrollDirection !== newState.scrollDirection ||
          Math.abs(prevState.scrollProgress - newState.scrollProgress) > 0.5;

        return hasChanged ? newState : prevState;
      });

      // Notify listeners
      if (onScrollChange) {
        onScrollChange(newState);
      }

      // Update refs for next calculation
      lastScrollY.current = currentY;
      lastTimestamp.current = currentTime;
      isScrolling.current = false;
    });
  }, [
    threshold,
    hideThreshold,
    calculateVelocity,
    determineDirection,
    calculateScrollProgress,
    onScrollChange,
    scrollState.isVisible
  ]);

  // Throttled scroll handler with requestAnimationFrame
  const throttledHandleScroll = useCallback(() => {
    // If we're already processing a scroll, skip this call
    if (isScrolling.current) return;

    const now = performance.now();
    const timeSinceLastScroll = now - lastTimestamp.current;

    // Throttle to specified frame rate (default 60fps = 16ms)
    if (timeSinceLastScroll < throttleTime) {
      // Schedule for next available frame
      if (!throttleTimer.current) {
        throttleTimer.current = requestAnimationFrame(() => {
          throttleTimer.current = undefined;
          handleScroll();
        });
      }
      return;
    }

    isScrolling.current = true;
    handleScroll();
  }, [handleScroll, throttleTime]);

  // Scroll to top function
  const scrollToTop = useCallback((smooth = true) => {
    window.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }, []);

  // Scroll to element function
  const scrollToElement = useCallback((elementId: string, offset = 80) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }, []);

  // Lock/unlock scroll
  const lockScroll = useCallback(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${window.innerWidth - document.body.clientWidth}px`;
  }, []);

  const unlockScroll = useCallback(() => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }, []);

  // Setup optimized scroll listener with passive event and RAF throttling
  useEffect(() => {
    // Initial state calculation
    handleScroll();

    // Add optimized scroll listener with passive flag for better performance
    window.addEventListener('scroll', throttledHandleScroll, {
      passive: true,
      capture: false
    });

    // Also listen to resize events for responsive behavior
    const handleResize = () => {
      // Recalculate on resize with debounce
      if (throttleTimer.current) {
        cancelAnimationFrame(throttleTimer.current);
      }
      throttleTimer.current = requestAnimationFrame(() => {
        handleScroll();
        throttleTimer.current = undefined;
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Cleanup function
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      window.removeEventListener('resize', handleResize);

      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }

      if (throttleTimer.current) {
        cancelAnimationFrame(throttleTimer.current);
      }

      // Clear velocity history
      velocityHistory.current = [];
    };
  }, [throttledHandleScroll, handleScroll]);

  return {
    ...scrollState,
    scrollToTop,
    scrollToElement,
    lockScroll,
    unlockScroll
  };
}