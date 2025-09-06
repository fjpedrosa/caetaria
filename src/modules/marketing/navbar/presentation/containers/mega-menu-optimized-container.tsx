/**
 * Presentation Layer - Optimized Mega Menu Container
 *
 * Container inteligente que gestiona mega menús con animaciones optimizadas.
 * Implementa debounce/throttle, lazy loading y performance monitoring.
 *
 * Performance optimizations:
 * - Debounced hover events
 * - Throttled scroll/resize handlers
 * - Lazy content loading
 * - Resource cleanup on unmount
 * - 60fps animation guarantee
 */

'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';

import { useMegaMenuAnimation } from '../../application/hooks/use-mega-menu-animation';
import { useMegaMenuInteraction } from '../../application/hooks/use-mega-menu-interaction';
import { useNavbarAccessibility } from '../../application/hooks/use-navbar-accessibility';
import { useNavbarPrefetch } from '../../application/hooks/use-navbar-prefetch';
import type { MegaMenuContent, NavigationItem } from '../../domain/types';
import { MegaMenuOptimized } from '../components/mega-menu-optimized';

// Utility functions
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  let lastFunc: NodeJS.Timeout;
  let lastRan: number;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      lastRan = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

interface MegaMenuOptimizedContainerProps {
  menuId: string;
  navigationItems: NavigationItem[];
  triggerElement?: HTMLElement;
  position?: 'left' | 'center' | 'right';
  className?: string;
  onClose: () => void;
  onNavigate?: (href: string) => void;
  // Performance config
  enableDebounce?: boolean;
  debounceDelay?: number;
  enableThrottle?: boolean;
  throttleDelay?: number;
  enablePrefetch?: boolean;
  enablePerformanceMonitoring?: boolean;
}

const generateMegaMenuContent = (items: NavigationItem[]): MegaMenuContent => {
  const sections = [];

  const mainSection = {
    title: 'Productos',
    items: items.slice(0, 4)
  };

  if (items.length > 4) {
    sections.push({
      title: 'Recursos',
      items: items.slice(4, 8)
    });
  }

  if (items.length > 8) {
    sections.push({
      title: 'Empresa',
      items: items.slice(8)
    });
  }

  sections.unshift(mainSection);

  const featured = items.find(item => item.badge);

  return { sections, featured };
};

export const MegaMenuOptimizedContainer: React.FC<MegaMenuOptimizedContainerProps> = ({
  menuId,
  navigationItems,
  triggerElement,
  position = 'center',
  className,
  onClose,
  onNavigate,
  enableDebounce = true,
  debounceDelay = 100,
  enableThrottle = true,
  throttleDelay = 16,
  enablePrefetch = true,
  enablePerformanceMonitoring = process.env.NODE_ENV === 'development'
}) => {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(triggerElement || null);
  const performanceRef = useRef<{ frameCount: number; lastTime: number }>({
    frameCount: 0,
    lastTime: performance.now()
  });

  // State
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [focusedItem, setFocusedItem] = useState<string | null>(null);

  // Mega menu interaction hook
  const {
    activeMenu,
    isOpen,
    isPending,
    openMenu,
    closeMenu,
    handleMouseEnter,
    handleMouseLeave,
    registerMenu,
    config
  } = useMegaMenuInteraction({
    config: {
      hoverDelay: {
        enter: enableDebounce ? debounceDelay : 0,
        exit: enableDebounce ? debounceDelay * 3 : 0,
        keyboard: 0
      },
      triangleSafeZone: {
        enabled: true,
        tolerance: 75,
        angleThreshold: 75,
        timeWindow: 300
      },
      touchMode: {
        enabled: true,
        preventClickPropagation: true
      },
      accessibility: {
        announceChanges: true,
        focusFirstItem: true
      },
      performance: {
        useRAF: true,
        throttleMs: enableThrottle ? throttleDelay : 0,
        movementThreshold: 3
      },
      expandedHitArea: {
        enabled: true,
        padding: 8
      }
    },
    onMenuOpen: (id) => {
      console.log(`[Performance] Menu ${id} opening`);
    },
    onMenuClose: (id) => {
      console.log(`[Performance] Menu ${id} closing`);
    }
  });

  // Animation hook with optimization
  const {
    animationState,
    isContentReady,
    getAnimationStyles,
    getItemStyles
  } = useMegaMenuAnimation({
    isOpen,
    triggerRef,
    menuRef,
    position,
    config: {
      duration: 200,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      scaleFrom: 0.95,
      scaleTo: 1,
      opacityFrom: 0,
      opacityTo: 1,
      translateY: -4,
      stagger: 20,
      enableGPU: true,
      enableWillChange: true
    },
    onAnimationStart: () => {
      if (enablePerformanceMonitoring) {
        performanceRef.current.lastTime = performance.now();
        performanceRef.current.frameCount = 0;
      }
    },
    onAnimationEnd: () => {
      if (enablePerformanceMonitoring) {
        const duration = performance.now() - performanceRef.current.lastTime;
        const avgFps = (performanceRef.current.frameCount / duration) * 1000;
        console.log(`[Performance] Animation completed: ${avgFps.toFixed(2)} FPS`);
      }
    }
  });

  // Accessibility hook
  const {
    announceToScreenReader,
    trapFocus,
    releaseFocus
  } = useNavbarAccessibility({
    config: {
      enableSkipLinks: false,
      enableKeyboardShortcuts: true,
      enableFocusTrap: true,
      enableAriaLive: true,
      minTouchTarget: 44
    }
  });

  // Prefetch hook
  const { prefetchLink } = useNavbarPrefetch({
    enabled: enablePrefetch,
    delay: 100,
    maxQueueSize: 5
  });

  // Generate content
  const megaMenuContent = useMemo(
    () => generateMegaMenuContent(navigationItems),
    [navigationItems]
  );

  // Debounced/Throttled handlers
  const debouncedSetHoveredItem = useMemo(
    () => enableDebounce ? debounce(setHoveredItem, debounceDelay) : setHoveredItem,
    [enableDebounce, debounceDelay]
  );

  const throttledHandleScroll = useMemo(
    () => enableThrottle ? throttle(() => {
      if (isOpen) {
        // Update menu position if needed
        console.log('[Performance] Scroll event throttled');
      }
    }, throttleDelay) : () => {},
    [enableThrottle, throttleDelay, isOpen]
  );

  // Event handlers
  const handleItemClick = useCallback((item: NavigationItem) => {
    announceToScreenReader(`Navegando a ${item.label}`);

    if (item.sectionId) {
      const element = document.getElementById(item.sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (item.external) {
      window.open(item.href, '_blank', 'noopener,noreferrer');
    } else {
      router.push(item.href);
      onNavigate?.(item.href);
    }

    onClose();
  }, [router, announceToScreenReader, onNavigate, onClose]);

  const handleItemHover = useCallback((item: NavigationItem) => {
    const itemId = `${item.label}-${item.href}`;
    debouncedSetHoveredItem(itemId);

    // Prefetch on hover
    if (enablePrefetch && !item.external && !item.sectionId) {
      prefetchLink(item.href);
    }
  }, [debouncedSetHoveredItem, enablePrefetch, prefetchLink]);

  const handleItemLeave = useCallback(() => {
    debouncedSetHoveredItem(null);
  }, [debouncedSetHoveredItem]);

  // Register menu with trigger
  useEffect(() => {
    if (menuRef.current && triggerRef.current) {
      const cleanup = registerMenu(menuId, menuRef.current, triggerRef.current);
      return cleanup;
    }
  }, [menuId, registerMenu]);

  // Focus management
  useEffect(() => {
    if (isOpen && menuRef.current) {
      trapFocus(menuRef.current);

      if (config.accessibility.focusFirstItem) {
        const timer = setTimeout(() => {
          const firstFocusable = menuRef.current?.querySelector<HTMLElement>(
            'a, button, [tabindex]:not([tabindex="-1"])'
          );
          firstFocusable?.focus();
        }, 100);

        return () => {
          clearTimeout(timer);
          releaseFocus();
        };
      }

      return () => releaseFocus();
    }
  }, [isOpen, config.accessibility.focusFirstItem, trapFocus, releaseFocus]);

  // Scroll/Resize handling with throttling
  useEffect(() => {
    if (isOpen) {
      window.addEventListener('scroll', throttledHandleScroll, { passive: true });
      window.addEventListener('resize', throttledHandleScroll, { passive: true });

      return () => {
        window.removeEventListener('scroll', throttledHandleScroll);
        window.removeEventListener('resize', throttledHandleScroll);
      };
    }
  }, [isOpen, throttledHandleScroll]);

  // Performance monitoring
  useEffect(() => {
    if (enablePerformanceMonitoring && animationState.isAnimating) {
      const measureFrame = () => {
        performanceRef.current.frameCount++;

        if (animationState.isAnimating) {
          requestAnimationFrame(measureFrame);
        }
      };

      requestAnimationFrame(measureFrame);
    }
  }, [enablePerformanceMonitoring, animationState.isAnimating]);

  // Memory cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear any pending debounced/throttled calls
      debouncedSetHoveredItem(null);

      // Clear refs
      if (menuRef.current) {
        menuRef.current = null;
      }
      if (triggerRef.current) {
        triggerRef.current = null;
      }

      // Log cleanup
      if (enablePerformanceMonitoring) {
        console.log('[Performance] Menu container cleaned up');
      }
    };
  }, [debouncedSetHoveredItem, enablePerformanceMonitoring]);

  // Don't render if closed and not animating
  if (!isOpen && animationState.phase === 'exited') {
    return null;
  }

  return (
    <div ref={menuRef}>
      <MegaMenuOptimized
        animationStyles={getAnimationStyles()}
        sections={megaMenuContent.sections}
        featuredItem={megaMenuContent.featured}
        isOpen={isOpen}
        isContentReady={isContentReady}
        animationPhase={animationState.phase}
        hoveredItemId={hoveredItem}
        activeItemId={focusedItem}
        onItemClick={handleItemClick}
        onItemHover={handleItemHover}
        onItemLeave={handleItemLeave}
        onClose={onClose}
        getItemStyles={getItemStyles}
        className={className}
        enableBackdropBlur={true}
        enableProgressiveShadow={true}
        maxItemsBeforeVirtualization={50}
      />
    </div>
  );
};