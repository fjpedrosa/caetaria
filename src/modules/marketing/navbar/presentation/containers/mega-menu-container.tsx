/**
 * Presentation Layer - Smart Mega Menu Container
 *
 * Container que gestiona la lógica de mega menús desplegables.
 * Conecta el hook useMegaMenuInteraction con componentes presentacionales.
 *
 * Principios aplicados:
 * - Container/Presentation Pattern: Separa lógica de presentación
 * - Single Responsibility: Solo maneja mega menús
 * - Dependency Inversion: Usa abstracciones (hooks) no implementaciones
 */

'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';

import { useMegaMenuInteraction } from '../../application/hooks/use-mega-menu-interaction';
import { useNavbarAccessibility } from '../../application/hooks/use-navbar-accessibility';
import { useNavbarPrefetch } from '../../application/hooks/use-navbar-prefetch';
import type { MegaMenuContent,NavigationItem } from '../../domain/types';
import { MegaMenuPresentationPure } from '../components/mega-menu-presentation-pure';

// ============= Types =============

interface MegaMenuContainerProps {
  menuId: string;
  navigationItems: NavigationItem[];
  interactionMode?: 'hover' | 'click' | 'touch';
  position?: 'left' | 'center' | 'right';
  className?: string;
  onClose: () => void;
  onNavigate?: (href: string) => void;
  getMenuProps?: (menuId: string) => any;
}

interface MenuPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ============= Helper Functions =============

/**
 * Generate mega menu content from navigation items
 * Groups items into sections for mega menu display
 */
const generateMegaMenuContent = (items: NavigationItem[]): MegaMenuContent => {
  // Group items by some criteria (this is a simplified example)
  // In a real scenario, you might have more complex grouping logic
  const sections = [];

  // Create main section
  const mainSection = {
    title: 'Productos',
    items: items.slice(0, 4)
  };

  // Create resources section if we have enough items
  if (items.length > 4) {
    sections.push({
      title: 'Recursos',
      items: items.slice(4, 8)
    });
  }

  // Create company section if we have more items
  if (items.length > 8) {
    sections.push({
      title: 'Empresa',
      items: items.slice(8)
    });
  }

  sections.unshift(mainSection);

  // Featured item (if any item has a badge)
  const featured = items.find(item => item.badge);

  return {
    sections,
    featured
  };
};

// ============= Container Implementation =============

export const MegaMenuContainer: React.FC<MegaMenuContainerProps> = ({
  menuId,
  navigationItems,
  interactionMode = 'hover',
  position = 'center',
  className,
  onClose,
  onNavigate,
  getMenuProps: externalGetMenuProps
}) => {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // ============= State Management =============
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });
  const [isPositioned, setIsPositioned] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [focusedItem, setFocusedItem] = useState<string | null>(null);
  const [animationState, setAnimationState] = useState<'entering' | 'idle' | 'leaving'>('entering');

  // ============= Hooks =============
  const {
    activeMenu,
    isOpen,
    isPending,
    openMenu,
    closeMenu,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    handleKeyDown,
    registerMenu,
    getMenuProps,
    getTriggerProps,
    config
  } = useMegaMenuInteraction({
    config: {
      hoverDelay: { enter: 100, exit: 300, keyboard: 0 },
      triangleSafeZone: {
        enabled: true,
        tolerance: 75,
        angleThreshold: 75,
        timeWindow: 300
      },
      touchMode: { enabled: true, preventClickPropagation: true },
      accessibility: { announceChanges: true, focusFirstItem: true },
      performance: {
        useRAF: true,
        throttleMs: 16,
        movementThreshold: 3
      },
      expandedHitArea: {
        enabled: true,
        padding: 8
      }
    },
    onMenuOpen: (id) => {
      setAnimationState('entering');
      console.log(`Menu ${id} opened`);
    },
    onMenuClose: (id) => {
      setAnimationState('leaving');
      console.log(`Menu ${id} closed`);
    }
  });

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

  const {
    prefetchLink,
    isPrefetching
  } = useNavbarPrefetch({
    enabled: true,
    delay: 100,
    maxQueueSize: 5
  });

  // ============= Generate Content =============
  const megaMenuContent = generateMegaMenuContent(navigationItems);

  // ============= Position Calculation =============
  const calculateMenuPosition = useCallback(() => {
    if (!triggerRef.current || !menuRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = triggerRect.left;
    let y = triggerRect.bottom;

    // Adjust horizontal position based on alignment
    switch (position) {
      case 'center':
        x = triggerRect.left + (triggerRect.width / 2) - (menuRect.width / 2);
        break;
      case 'right':
        x = triggerRect.right - menuRect.width;
        break;
      // 'left' is default
    }

    // Ensure menu doesn't go off-screen horizontally
    if (x + menuRect.width > viewportWidth) {
      x = viewportWidth - menuRect.width - 16; // 16px margin
    }
    if (x < 16) {
      x = 16;
    }

    // Ensure menu doesn't go off-screen vertically
    if (y + menuRect.height > viewportHeight) {
      // Show above trigger if not enough space below
      y = triggerRect.top - menuRect.height;
    }

    setMenuPosition({
      x,
      y,
      width: menuRect.width,
      height: menuRect.height
    });
    setIsPositioned(true);
  }, [position]);

  // ============= Event Handlers =============

  const handleItemClick = useCallback((item: NavigationItem) => {
    announceToScreenReader(`Navegando a ${item.label}`);

    if (item.sectionId) {
      // Scroll to section
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
    setHoveredItem(item.href);

    // Prefetch on hover for better performance
    if (!item.external && !item.sectionId) {
      prefetchLink(item.href);
    }
  }, [prefetchLink]);

  const handleItemLeave = useCallback(() => {
    setHoveredItem(null);
  }, []);

  const handleItemFocus = useCallback((item: NavigationItem) => {
    setFocusedItem(item.href);
    announceToScreenReader(item.description || item.label);
  }, [announceToScreenReader]);

  const handleItemBlur = useCallback(() => {
    setFocusedItem(null);
  }, []);

  // ============= Keyboard Navigation =============

  const handleMenuKeyDown = useCallback((e: React.KeyboardEvent) => {
    const focusableElements = menuRef.current?.querySelectorAll<HTMLElement>(
      'a, button, [tabindex]:not([tabindex="-1"])'
    );

    if (!focusableElements || focusableElements.length === 0) return;

    const currentIndex = Array.from(focusableElements).findIndex(
      el => el === document.activeElement
    );

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % focusableElements.length;
        focusableElements[nextIndex]?.focus();
        break;

      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = currentIndex <= 0
          ? focusableElements.length - 1
          : currentIndex - 1;
        focusableElements[prevIndex]?.focus();
        break;

      case 'Tab':
        // Let natural tab order work but trap within menu
        if (e.shiftKey && currentIndex === 0) {
          e.preventDefault();
          focusableElements[focusableElements.length - 1]?.focus();
        } else if (!e.shiftKey && currentIndex === focusableElements.length - 1) {
          e.preventDefault();
          focusableElements[0]?.focus();
        }
        break;

      case 'Escape':
        e.preventDefault();
        onClose();
        // Return focus to trigger
        triggerRef.current?.focus();
        break;

      case 'Home':
        e.preventDefault();
        focusableElements[0]?.focus();
        break;

      case 'End':
        e.preventDefault();
        focusableElements[focusableElements.length - 1]?.focus();
        break;
    }
  }, [onClose]);

  // ============= Effects =============

  // Register menu on mount with trigger element
  useEffect(() => {
    if (menuRef.current) {
      // Find the trigger element if it exists
      const triggerElement = document.querySelector(`[data-menu-trigger="${menuId}"]`) as HTMLElement;
      const cleanup = registerMenu(menuId, menuRef.current, triggerElement || undefined);
      return cleanup;
    }
  }, [menuId, registerMenu]);

  // Calculate position when menu opens
  useEffect(() => {
    if (isOpen) {
      calculateMenuPosition();
      window.addEventListener('resize', calculateMenuPosition);
      window.addEventListener('scroll', calculateMenuPosition);

      return () => {
        window.removeEventListener('resize', calculateMenuPosition);
        window.removeEventListener('scroll', calculateMenuPosition);
      };
    }
  }, [isOpen, calculateMenuPosition]);

  // Focus management
  useEffect(() => {
    if (isOpen && menuRef.current) {
      trapFocus(menuRef.current);

      // Focus first item if configured
      if (config.accessibility.focusFirstItem) {
        const firstFocusable = menuRef.current.querySelector<HTMLElement>(
          'a, button, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }

      return () => releaseFocus();
    }
  }, [isOpen, config.accessibility.focusFirstItem, trapFocus, releaseFocus]);

  // Animation state management
  useEffect(() => {
    if (isOpen) {
      setAnimationState('entering');
      const timer = setTimeout(() => setAnimationState('idle'), 300);
      return () => clearTimeout(timer);
    } else {
      setAnimationState('leaving');
    }
  }, [isOpen]);

  // ============= Render Props =============

  const megaMenuProps = {
    // Visual props
    isOpen,
    isPositioned,
    animationState,
    position: menuPosition,
    className: cn(
      'absolute z-50',
      animationState === 'entering' && 'animate-in fade-in slide-in-from-top-2',
      animationState === 'leaving' && 'animate-out fade-out slide-out-to-top-2',
      className
    ),

    // Content
    content: megaMenuContent,
    hoveredItem,
    focusedItem,

    // Event handlers
    onItemClick: handleItemClick,
    onItemHover: handleItemHover,
    onItemLeave: handleItemLeave,
    onItemFocus: handleItemFocus,
    onItemBlur: handleItemBlur,
    onKeyDown: handleMenuKeyDown,
    onClose,

    // Mouse events for interaction mode
    onMouseEnter: interactionMode === 'hover' ? (e: React.MouseEvent) => handleMouseEnter(menuId, e) : undefined,
    onMouseLeave: interactionMode === 'hover' ? (e: React.MouseEvent) => handleMouseLeave(menuId, e) : undefined,

    // Accessibility
    role: 'menu',
    'aria-label': `${menuId} mega menu`,
    'aria-expanded': isOpen,

    // Ref
    ref: menuRef
  };

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  // Render the presentational component
  return (
    <MegaMenuPresentationPure
      {...megaMenuProps}
      isOpen={isOpen}
      isPending={isPending}
      sections={megaMenuContent.sections}
      featuredItem={megaMenuContent.featured}
      position={{ x: menuPosition.x, y: menuPosition.y }}
      animationPhase={animationState === 'entering' ? 'entering' :
                      animationState === 'leaving' ? 'exiting' : 'entered'}
      showLoadingIndicator={isPending}
      hoveredItemId={hoveredItem}
      activeItemId={focusedItem}
      onItemClick={handleItemClick}
      onClose={onClose}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
};