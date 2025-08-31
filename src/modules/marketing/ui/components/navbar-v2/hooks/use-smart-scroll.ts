import { useCallback,useEffect, useState } from 'react';

interface SmartScrollOptions {
  threshold?: number;          // Mínimo scroll para activar hide
  hideThreshold?: number;      // Scroll mínimo para ocultar
  debounceTime?: number;       // Debounce time en ms
}

interface SmartScrollState {
  isVisible: boolean;          // Si el navbar está visible
  isAtTop: boolean;           // Si está en el top de la página
  scrollDirection: 'up' | 'down' | null; // Dirección del scroll
  scrollY: number;            // Posición actual del scroll
  scrollVelocity: number;     // Velocidad del scroll en px/ms
}

/**
 * Hook que implementa smart scroll behavior tipo FreshGreens:
 * - Hide on scroll down (después del threshold)
 * - Show on scroll up (inmediatamente)
 * - Always visible at top of page
 * - Always visible on first page load
 */
export const useSmartScroll = (options: SmartScrollOptions = {}): SmartScrollState => {
  const {
    threshold = 10,           // 10px para detectar que no está en top
    hideThreshold = 80,       // 80px para empezar a ocultar
    debounceTime = 10         // 10ms debounce para performance
  } = options;

  // Initialize state synchronously - always start visible on first render
  const [isVisible, setIsVisible] = useState(() => {
    // Always start visible to prevent navbar being hidden on page load
    // The scroll logic will take over after the first scroll event
    return true;
  });

  const [isAtTop, setIsAtTop] = useState(() => {
    if (typeof window === 'undefined') return true; // SSR fallback
    return window.scrollY < threshold;
  });

  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [scrollY, setScrollY] = useState(() => {
    if (typeof window === 'undefined') return 0;
    return window.scrollY;
  });

  const [lastScrollY, setLastScrollY] = useState(() => {
    if (typeof window === 'undefined') return 0;
    return window.scrollY;
  });
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [lastScrollTime, setLastScrollTime] = useState(() => performance.now());
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false); // Track if user has scrolled

  const updateScrollState = useCallback((currentScrollY: number) => {
    const direction = currentScrollY > lastScrollY ? 'down' : 'up';
    const atTop = currentScrollY < threshold;

    // Calculate scroll velocity
    const currentTime = performance.now();
    const timeDelta = currentTime - lastScrollTime;
    const scrollDelta = Math.abs(currentScrollY - lastScrollY);
    const velocity = timeDelta > 0 ? scrollDelta / timeDelta : 0;

    setScrollY(currentScrollY);
    setScrollDirection(direction);
    setIsAtTop(atTop);
    setScrollVelocity(velocity);
    setLastScrollY(currentScrollY);
    setLastScrollTime(currentTime);

    // Mark that user has scrolled
    if (!hasScrolled) {
      setHasScrolled(true);
    }

    // Lógica de visibilidad - solo aplicar después del primer scroll
    if (!hasScrolled) {
      // Keep navbar visible until first scroll
      setIsVisible(true);
    } else if (atTop) {
      // En el top, siempre visible
      setIsVisible(true);
    } else if (direction === 'up') {
      // Scroll up - mostrar inmediatamente
      setIsVisible(true);
    } else if (direction === 'down' && currentScrollY > hideThreshold) {
      // Scroll down y pasado el threshold - ocultar
      setIsVisible(false);
    }
    // Si scrolling down pero no se ha pasado hideThreshold, mantener estado actual
  }, [lastScrollY, lastScrollTime, threshold, hideThreshold, hasScrolled]);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;

    // Cancelar timeout anterior si existe
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Debounce para optimizar performance
    const newTimeoutId = setTimeout(() => {
      updateScrollState(currentScrollY);
    }, debounceTime);

    setTimeoutId(newTimeoutId);
  }, [updateScrollState, debounceTime, timeoutId]);

  useEffect(() => {
    // Only add scroll listener, state is already initialized synchronously
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [handleScroll, timeoutId]);

  return {
    isVisible,
    isAtTop,
    scrollDirection,
    scrollY,
    scrollVelocity
  };
};

/**
 * Hook simplificado que solo retorna si el navbar debe ser visible
 * Útil cuando solo necesitas el estado de visibilidad
 */
export const useNavbarVisibility = (options?: SmartScrollOptions): boolean => {
  const { isVisible } = useSmartScroll(options);
  return isVisible;
};

/**
 * Hook que añade clases CSS dinámicas basadas en el scroll
 * Útil para aplicar estilos directamente
 */
export const useScrollClasses = (options?: SmartScrollOptions) => {
  const { isVisible, isAtTop, scrollDirection } = useSmartScroll(options);

  return {
    navbarClasses: {
      'navbar-visible': isVisible,
      'navbar-hidden': !isVisible,
      'navbar-at-top': isAtTop,
      'navbar-scrolled': !isAtTop,
      'navbar-scroll-up': scrollDirection === 'up',
      'navbar-scroll-down': scrollDirection === 'down',
    },
    isVisible,
    isAtTop,
    scrollDirection
  };
};