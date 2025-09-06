/**
 * Hook optimizado para animaciones del navbar
 * Gestiona performance, throttling y prefers-reduced-motion
 */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface NavbarAnimationState {
  isScrolled: boolean;
  scrollProgress: number;
  isVisible: boolean;
  reducedMotion: boolean;
  isHovering: boolean;
}

interface UseNavbarAnimationsOptions {
  hideOnScroll?: boolean;
  showProgress?: boolean;
  throttleMs?: number;
  scrollThreshold?: number;
}

interface NavbarAnimationControls {
  // Estado
  state: NavbarAnimationState;

  // Controladores de elementos
  linkHandlers: {
    onMouseEnter: (element: HTMLElement) => void;
    onMouseLeave: (element: HTMLElement) => void;
    onFocus: (element: HTMLElement) => void;
    onBlur: (element: HTMLElement) => void;
  };

  megaMenuHandlers: {
    onTriggerHover: (isHovering: boolean) => void;
    onMenuEnter: (element: HTMLElement) => void;
    onMenuLeave: (element: HTMLElement) => void;
  };

  ctaHandlers: {
    onPress: (element: HTMLElement) => void;
    onRelease: (element: HTMLElement) => void;
    onHover: (element: HTMLElement, isHovering: boolean) => void;
  };

  // Utilidades
  applyOptimizations: (element: HTMLElement) => void;
  cleanupOptimizations: (element: HTMLElement) => void;
  forceUpdate: () => void;
}

/**
 * Throttle con requestAnimationFrame para mejor performance
 */
function rafThrottle<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 16
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  let rafId: number | null = null;

  return (...args: Parameters<T>) => {
    const currentTime = Date.now();

    const execute = () => {
      func(...args);
      lastExecTime = Date.now();
    };

    if (currentTime - lastExecTime > delay) {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(execute);
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
        rafId = requestAnimationFrame(execute);
      }, delay - (currentTime - lastExecTime));
    }
  };
}

export function useNavbarAnimations(
  options: UseNavbarAnimationsOptions = {}
): NavbarAnimationControls {
  const {
    hideOnScroll = true,
    showProgress = false,
    throttleMs = 16,
    scrollThreshold = 50
  } = options;

  // Estado principal
  const [state, setState] = useState<NavbarAnimationState>({
    isScrolled: false,
    scrollProgress: 0,
    isVisible: true,
    reducedMotion: false,
    isHovering: false
  });

  // Referencias para optimización
  const lastScrollYRef = useRef(0);
  const scrollProgressRef = useRef(0);
  const activeAnimationsRef = useRef(new Set<HTMLElement>());

  // Detectar preferencias de accesibilidad
  useEffect(() => {
    const detectMotionPreference = () => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setState(prev => ({ ...prev, reducedMotion }));
    };

    detectMotionPreference();

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => detectMotionPreference();
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Manejo del scroll con throttling optimizado
  const handleScroll = useCallback(
    rafThrottle(() => {
      const scrollY = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = Math.min(scrollY / documentHeight, 1);

      setState(prev => {
        const shouldBeScrolled = scrollY > scrollThreshold;
        let isVisible = prev.isVisible;

        // Lógica de hide on scroll
        if (hideOnScroll) {
          const lastY = lastScrollYRef.current;
          if (scrollY > lastY && scrollY > 100) {
            isVisible = false;
          } else {
            isVisible = true;
          }
          lastScrollYRef.current = scrollY;
        }

        // Solo actualizar si hay cambios significativos
        const significantScrollChange = Math.abs(scrollY - lastScrollYRef.current) > 10;
        const significantProgressChange = Math.abs(scrollProgress - scrollProgressRef.current) > 0.01;

        if (significantScrollChange || shouldBeScrolled !== prev.isScrolled || isVisible !== prev.isVisible) {
          scrollProgressRef.current = scrollProgress;
          return {
            ...prev,
            isScrolled: shouldBeScrolled,
            scrollProgress,
            isVisible
          };
        }

        return prev;
      });
    }, throttleMs),
    [hideOnScroll, scrollThreshold, throttleMs]
  );

  // Listener de scroll
  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Llamada inicial
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // Aplicar optimizaciones de performance
  const applyOptimizations = useCallback((element: HTMLElement) => {
    if (state.reducedMotion) return;

    element.style.willChange = 'transform, opacity';
    element.style.transform = 'translateZ(0)';
    element.style.backfaceVisibility = 'hidden';

    activeAnimationsRef.current.add(element);
  }, [state.reducedMotion]);

  // Limpiar optimizaciones
  const cleanupOptimizations = useCallback((element: HTMLElement) => {
    element.style.willChange = 'auto';
    element.style.transform = '';
    element.style.backfaceVisibility = '';

    activeAnimationsRef.current.delete(element);
  }, []);

  // Handlers para enlaces
  const linkHandlers = {
    onMouseEnter: useCallback((element: HTMLElement) => {
      if (state.reducedMotion) return;

      applyOptimizations(element);
      element.classList.add('will-animate');

      // Trigger underline animation
      const textContent = element.textContent || '';
      element.setAttribute('data-text', textContent);
    }, [applyOptimizations, state.reducedMotion]),

    onMouseLeave: useCallback((element: HTMLElement) => {
      // Delay cleanup para permitir que termine la animación
      setTimeout(() => {
        cleanupOptimizations(element);
        element.classList.remove('will-animate');
        element.classList.add('animation-complete');

        // Remove class after a frame
        requestAnimationFrame(() => {
          element.classList.remove('animation-complete');
        });
      }, 300);
    }, [cleanupOptimizations]),

    onFocus: useCallback((element: HTMLElement) => {
      const textContent = element.textContent || '';
      element.setAttribute('data-text', textContent);
      if (!state.reducedMotion) {
        applyOptimizations(element);
      }
    }, [applyOptimizations, state.reducedMotion]),

    onBlur: useCallback((element: HTMLElement) => {
      setTimeout(() => {
        cleanupOptimizations(element);
      }, 300);
    }, [cleanupOptimizations])
  };

  // Handlers para mega menús
  const megaMenuHandlers = {
    onTriggerHover: useCallback((isHovering: boolean) => {
      setState(prev => ({ ...prev, isHovering }));
    }, []),

    onMenuEnter: useCallback((element: HTMLElement) => {
      if (state.reducedMotion) {
        element.style.opacity = '1';
        element.style.visibility = 'visible';
        element.style.transform = 'none';
        return;
      }

      applyOptimizations(element);
      element.classList.add('will-animate');

      // Trigger entrada animation
      element.style.animation = 'megaMenuEnter 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
    }, [applyOptimizations, state.reducedMotion]),

    onMenuLeave: useCallback((element: HTMLElement) => {
      if (state.reducedMotion) {
        element.style.opacity = '0';
        element.style.visibility = 'hidden';
        return;
      }

      element.style.animation = 'megaMenuExit 0.15s cubic-bezier(0.4, 0, 1, 1) forwards';

      setTimeout(() => {
        cleanupOptimizations(element);
        element.classList.remove('will-animate');
      }, 150);
    }, [cleanupOptimizations, state.reducedMotion])
  };

  // Handlers para botones CTA
  const ctaHandlers = {
    onPress: useCallback((element: HTMLElement) => {
      if (state.reducedMotion) return;

      applyOptimizations(element);
      element.style.animation = 'ctaPress 0.15s cubic-bezier(0.4, 0, 0.2, 1)';

      setTimeout(() => {
        element.style.animation = '';
        cleanupOptimizations(element);
      }, 150);
    }, [applyOptimizations, cleanupOptimizations, state.reducedMotion]),

    onRelease: useCallback((element: HTMLElement) => {
      // Cleanup se maneja en onPress
    }, []),

    onHover: useCallback((element: HTMLElement, isHovering: boolean) => {
      if (state.reducedMotion) return;

      if (isHovering) {
        applyOptimizations(element);
        element.classList.add('will-animate');
      } else {
        setTimeout(() => {
          cleanupOptimizations(element);
          element.classList.remove('will-animate');
        }, 200);
      }
    }, [applyOptimizations, cleanupOptimizations, state.reducedMotion])
  };

  // Force update para casos especiales
  const forceUpdate = useCallback(() => {
    setState(prev => ({ ...prev }));
  }, []);

  // Cleanup global al desmontar
  useEffect(() => {
    return () => {
      activeAnimationsRef.current.forEach(element => {
        element.style.willChange = 'auto';
        element.style.transform = '';
        element.style.backfaceVisibility = '';
      });
      activeAnimationsRef.current.clear();
    };
  }, []);

  return {
    state,
    linkHandlers,
    megaMenuHandlers,
    ctaHandlers,
    applyOptimizations,
    cleanupOptimizations,
    forceUpdate
  };
}