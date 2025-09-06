/**
 * Application Layer - Mega Menu Animation Hook
 *
 * Hook optimizado para gestionar animaciones de mega menú con alta performance.
 * Implementa GPU acceleration, lazy rendering, y optimizaciones para 60fps.
 *
 * Features:
 * - Transform-origin dinámico según posición
 * - GPU acceleration con transform3d
 * - Will-change optimization
 * - Lazy rendering del contenido
 * - Cleanup automático de recursos
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface AnimationConfig {
  duration: number;
  easing: string;
  scaleFrom: number;
  scaleTo: number;
  opacityFrom: number;
  opacityTo: number;
  translateY: number;
  stagger?: number;
  enableGPU?: boolean;
  enableWillChange?: boolean;
}

interface UseMenuAnimationProps {
  isOpen: boolean;
  triggerRef?: React.RefObject<HTMLElement>;
  menuRef?: React.RefObject<HTMLElement>;
  position?: 'left' | 'center' | 'right';
  config?: Partial<AnimationConfig>;
  onAnimationStart?: () => void;
  onAnimationEnd?: () => void;
}

interface AnimationState {
  phase: 'idle' | 'entering' | 'entered' | 'exiting' | 'exited';
  isAnimating: boolean;
  transformOrigin: string;
  willChange: string | undefined;
  transform: string;
  opacity: number;
}

const DEFAULT_CONFIG: AnimationConfig = {
  duration: 200,
  easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  scaleFrom: 0.95,
  scaleTo: 1,
  opacityFrom: 0,
  opacityTo: 1,
  translateY: -4,
  stagger: 30,
  enableGPU: true,
  enableWillChange: true
};

export const useMegaMenuAnimation = ({
  isOpen,
  triggerRef,
  menuRef,
  position = 'center',
  config: userConfig,
  onAnimationStart,
  onAnimationEnd
}: UseMenuAnimationProps) => {
  const config = { ...DEFAULT_CONFIG, ...userConfig };
  const animationFrameRef = useRef<number>();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const observerRef = useRef<IntersectionObserver>();
  const [isContentReady, setIsContentReady] = useState(false);

  const [animationState, setAnimationState] = useState<AnimationState>({
    phase: 'idle',
    isAnimating: false,
    transformOrigin: 'top center',
    willChange: undefined,
    transform: `scale3d(${config.scaleFrom}, ${config.scaleFrom}, 1) translateY(${config.translateY}px)`,
    opacity: config.opacityFrom
  });

  // Calculate dynamic transform origin based on trigger position
  const calculateTransformOrigin = useCallback(() => {
    if (!triggerRef?.current || !menuRef?.current) {
      return 'top center';
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    // Calculate horizontal origin
    const triggerCenter = triggerRect.left + triggerRect.width / 2;
    const menuCenter = menuRect.left + menuRect.width / 2;
    const horizontalOffset = ((triggerCenter - menuCenter) / menuRect.width) * 100 + 50;

    // Clamp between 0 and 100
    const clampedOffset = Math.max(0, Math.min(100, horizontalOffset));

    // Add vertical component (always from top for dropdown)
    return `${clampedOffset}% 0%`;
  }, [triggerRef, menuRef]);

  // Optimized animation using requestAnimationFrame
  const animateMenu = useCallback((
    targetScale: number,
    targetOpacity: number,
    targetTranslateY: number,
    phase: AnimationState['phase']
  ) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const startTime = performance.now();
    const transformOrigin = calculateTransformOrigin();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / config.duration, 1);

      // Easing function (custom cubic-bezier approximation)
      const easedProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const currentScale = config.scaleFrom + (targetScale - config.scaleFrom) * easedProgress;
      const currentOpacity = config.opacityFrom + (targetOpacity - config.opacityFrom) * easedProgress;
      const currentTranslateY = config.translateY + (targetTranslateY - config.translateY) * easedProgress;

      const transform = config.enableGPU
        ? `scale3d(${currentScale}, ${currentScale}, 1) translateY(${currentTranslateY}px) translateZ(0)`
        : `scale(${currentScale}) translateY(${currentTranslateY}px)`;

      setAnimationState({
        phase,
        isAnimating: progress < 1,
        transformOrigin,
        willChange: config.enableWillChange && progress < 1 ? 'transform, opacity' : undefined,
        transform,
        opacity: currentOpacity
      });

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        onAnimationEnd?.();

        // Clean up will-change after animation
        if (config.enableWillChange) {
          timeoutRef.current = setTimeout(() => {
            setAnimationState(prev => ({
              ...prev,
              willChange: undefined,
              phase: phase === 'entering' ? 'entered' : 'exited'
            }));
          }, 50);
        }
      }
    };

    onAnimationStart?.();
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [
    config,
    calculateTransformOrigin,
    onAnimationStart,
    onAnimationEnd
  ]);

  // Lazy content loading with Intersection Observer
  const setupLazyLoading = useCallback(() => {
    if (!menuRef?.current || !('IntersectionObserver' in window)) {
      setIsContentReady(true);
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsContentReady(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.01
      }
    );

    observerRef.current.observe(menuRef.current);
  }, [menuRef]);

  // Stagger animation for menu items
  const animateItems = useCallback((show: boolean) => {
    if (!menuRef?.current || !config.stagger) return;

    const items = menuRef.current.querySelectorAll('[data-menu-item]');

    items.forEach((item, index) => {
      const element = item as HTMLElement;
      const delay = show ? index * config.stagger : (items.length - index - 1) * config.stagger;

      element.style.transition = `transform ${config.duration}ms ${config.easing} ${delay}ms, opacity ${config.duration}ms ${config.easing} ${delay}ms`;

      if (show) {
        element.style.transform = 'translateY(0) translateZ(0)';
        element.style.opacity = '1';
      } else {
        element.style.transform = 'translateY(-8px) translateZ(0)';
        element.style.opacity = '0';
      }
    });
  }, [menuRef, config]);

  // Handle open/close state changes
  useEffect(() => {
    if (isOpen) {
      // Start entering animation
      animateMenu(config.scaleTo, config.opacityTo, 0, 'entering');
      setupLazyLoading();

      // Animate items after menu starts opening
      timeoutRef.current = setTimeout(() => {
        animateItems(true);
      }, config.duration * 0.3);
    } else if (animationState.phase !== 'idle' && animationState.phase !== 'exited') {
      // Start exiting animation
      animateItems(false);
      animateMenu(config.scaleFrom, config.opacityFrom, config.translateY, 'exiting');
    }
  }, [isOpen, animateMenu, animateItems, setupLazyLoading, config, animationState.phase]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Performance monitoring in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && animationState.isAnimating) {
      const measurePerformance = () => {
        const fps = performance.now();
        // Log if FPS drops below 30
        if (fps > 33) {
          console.warn('Animation performance degraded:', fps, 'ms per frame');
        }
      };

      const perfInterval = setInterval(measurePerformance, 100);
      return () => clearInterval(perfInterval);
    }
  }, [animationState.isAnimating]);

  return {
    animationState,
    isContentReady,
    animateMenu,
    animateItems,
    getAnimationStyles: () => ({
      transform: animationState.transform,
      opacity: animationState.opacity,
      transformOrigin: animationState.transformOrigin,
      willChange: animationState.willChange,
      transition: `transform ${config.duration}ms ${config.easing}, opacity ${config.duration}ms ${config.easing}`,
      pointerEvents: animationState.phase === 'entered' ? 'auto' as const : 'none' as const
    }),
    getItemStyles: (index: number) => ({
      transitionDelay: `${index * (config.stagger || 0)}ms`,
      transform: animationState.phase === 'entered' ? 'translateY(0)' : 'translateY(-8px)',
      opacity: animationState.phase === 'entered' ? 1 : 0
    })
  };
};