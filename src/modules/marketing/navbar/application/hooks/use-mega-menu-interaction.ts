/**
 * Application Layer - Mega Menu Interaction Hook
 *
 * Hook especializado para el manejo de interacciones con mega menús.
 * Implementa patrones avanzados de UX como triangle safe zone y delays inteligentes.
 *
 * Principios aplicados:
 * - Single Responsibility: Solo maneja interacciones de mega menú
 * - Open/Closed: Extensible mediante configuración sin modificar el core
 * - Dependency Inversion: No depende de implementaciones específicas de UI
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  calculateOptimalTriangle,
  createHoverBridge,
  CursorTracker,
  DEFAULT_SAFE_ZONE_CONFIG,
  isInEnhancedSafeZone,
  type Point,
  type Rectangle,
  type SafeZoneConfig,
  type TrianglePath} from '../utils/triangle-safe-zone';

// ============= Types =============

interface MenuState {
  activeMenu: string | null;
  isOpen: boolean;
  hoveredItem: string | null;
  interactionMode: 'hover' | 'click' | 'touch' | 'keyboard';
  lastInteractionTime: number;
  isPending: boolean; // New: indicates menu is about to open
  movementThreshold: number; // New: movement threshold to prevent accidental opens
  focusedItemIndex: number; // Current focused item index in menu
  focusedColumnIndex: number; // Current focused column in mega menu
  keyboardNavigationActive: boolean; // Track if using keyboard navigation
}

interface MegaMenuConfig {
  hoverDelay: {
    enter: number;  // Delay before showing menu on hover
    exit: number;   // Delay before hiding menu on leave
    keyboard: number; // New: delay for keyboard navigation (usually 0)
  };
  triangleSafeZone: SafeZoneConfig;
  touchMode: {
    enabled: boolean;
    preventClickPropagation: boolean;
  };
  accessibility: {
    announceChanges: boolean;
    focusFirstItem: boolean;
  };
  performance: {
    useRAF: boolean; // Use requestAnimationFrame for smooth tracking
    throttleMs: number; // Throttle mouse move events
    movementThreshold: number; // Pixels before considering it intentional hover
  };
  expandedHitArea: {
    enabled: boolean;
    padding: number; // Pixels of invisible padding
  };
}

interface UseMegaMenuInteractionOptions {
  config?: Partial<MegaMenuConfig>;
  onMenuOpen?: (menuId: string) => void;
  onMenuClose?: (menuId: string) => void;
  onInteractionModeChange?: (mode: 'hover' | 'click' | 'touch') => void;
}

// ============= Default Configuration =============

const DEFAULT_CONFIG: MegaMenuConfig = {
  hoverDelay: {
    enter: 50,   // 50ms delay to open (very fast)
    exit: 500,   // 500ms delay to close (much more forgiving)
    keyboard: 0  // No delay for keyboard navigation
  },
  triangleSafeZone: {
    ...DEFAULT_SAFE_ZONE_CONFIG,
    enabled: true,
    tolerance: 120,  // Increased tolerance for easier navigation
    angleThreshold: 85,  // More forgiving angle
    timeWindow: 400  // Longer time window
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
    throttleMs: 16, // ~60fps
    movementThreshold: 3 // 3px movement before considering hover intentional
  },
  expandedHitArea: {
    enabled: true,
    padding: 16 // 16px invisible padding for easier hover
  }
};

// ============= Hook Implementation =============

export function useMegaMenuInteraction(options: UseMegaMenuInteractionOptions = {}) {
  const config = { ...DEFAULT_CONFIG, ...options.config };
  const { onMenuOpen, onMenuClose, onInteractionModeChange } = options;

  // State
  const [menuState, setMenuState] = useState<MenuState>({
    activeMenu: null,
    isOpen: false,
    hoveredItem: null,
    interactionMode: 'hover',
    lastInteractionTime: 0,
    isPending: false,
    movementThreshold: config.performance.movementThreshold,
    focusedItemIndex: -1,
    focusedColumnIndex: 0,
    keyboardNavigationActive: false
  });

  // Refs for internal tracking
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  const triangleSafeZoneRef = useRef<TrianglePath | null>(null);
  const cursorTrackerRef = useRef<CursorTracker>(new CursorTracker(10));
  const menuElementsRef = useRef<Map<string, HTMLElement>>(new Map());
  const triggerElementsRef = useRef<Map<string, HTMLElement>>(new Map());
  const lastActiveMenuRef = useRef<string | null>(null);
  const isTouchDeviceRef = useRef(false);
  const initialHoverPositionRef = useRef<Point | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastThrottleTimeRef = useRef<number>(0);
  const hoverBridgeRef = useRef<HTMLDivElement | null>(null);

  // ============= Touch Detection =============

  useEffect(() => {
    // Detect if device supports touch
    isTouchDeviceRef.current =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0;

    // Set initial interaction mode
    if (isTouchDeviceRef.current) {
      setMenuState(prev => ({ ...prev, interactionMode: 'touch' }));
      onInteractionModeChange?.('touch');
    }
  }, [onInteractionModeChange]);

  // ============= Triangle Safe Zone Logic =============

  const updateTriangleSafeZone = useCallback((menuElement: HTMLElement, triggerElement?: HTMLElement) => {
    if (!config.triangleSafeZone.enabled) return;

    const menuRect = menuElement.getBoundingClientRect();
    const cursor = cursorTrackerRef.current.getLatest() || { x: 0, y: 0 };
    const previousCursor = cursorTrackerRef.current.getPrevious();

    // Convert DOMRect to Rectangle interface
    const rect: Rectangle = {
      top: menuRect.top,
      right: menuRect.right,
      bottom: menuRect.bottom,
      left: menuRect.left,
      width: menuRect.width,
      height: menuRect.height
    };

    // Calculate optimal triangle based on cursor movement
    triangleSafeZoneRef.current = calculateOptimalTriangle(
      cursor,
      rect,
      previousCursor,
      config.triangleSafeZone
    );

    // Create hover bridge if trigger element is provided
    if (triggerElement && config.expandedHitArea.enabled) {
      const triggerRect = triggerElement.getBoundingClientRect();
      const bridgeRect: Rectangle = {
        top: triggerRect.top,
        right: triggerRect.right,
        bottom: triggerRect.bottom,
        left: triggerRect.left,
        width: triggerRect.width,
        height: triggerRect.height
      };

      // Create invisible bridge element
      if (!hoverBridgeRef.current) {
        hoverBridgeRef.current = document.createElement('div');
        hoverBridgeRef.current.className = 'hover-bridge';
        document.body.appendChild(hoverBridgeRef.current);
      }

      const bridgeStyles = createHoverBridge(bridgeRect, rect);
      Object.assign(hoverBridgeRef.current.style, bridgeStyles);
    }
  }, [config.triangleSafeZone, config.expandedHitArea.enabled]);

  const checkSafeZone = useCallback((): boolean => {
    if (!config.triangleSafeZone.enabled || !triangleSafeZoneRef.current) return false;

    const cursor = cursorTrackerRef.current.getLatest();
    if (!cursor) return false;

    const activeMenuElement = menuState.activeMenu ?
      menuElementsRef.current.get(menuState.activeMenu) : null;

    if (!activeMenuElement) return false;

    const menuRect = activeMenuElement.getBoundingClientRect();
    const rect: Rectangle = {
      top: menuRect.top,
      right: menuRect.right,
      bottom: menuRect.bottom,
      left: menuRect.left,
      width: menuRect.width,
      height: menuRect.height
    };

    return isInEnhancedSafeZone(
      cursor,
      triangleSafeZoneRef.current,
      rect,
      cursorTrackerRef.current.getPositions(),
      config.triangleSafeZone
    );
  }, [config.triangleSafeZone, menuState.activeMenu]);

  // ============= Menu Opening/Closing Logic =============

  const openMenu = useCallback((menuId: string, immediate = false, isKeyboard = false) => {
    // Clear any pending close timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Set pending state for visual feedback
    setMenuState(prev => ({ ...prev, isPending: true }));

    const doOpen = () => {
      setMenuState(prev => ({
        ...prev,
        activeMenu: menuId,
        isOpen: true,
        isPending: false,
        lastInteractionTime: Date.now()
      }));

      lastActiveMenuRef.current = menuId;
      onMenuOpen?.(menuId);

      // Update triangle safe zone for new menu
      const menuElement = menuElementsRef.current.get(menuId);
      const triggerElement = triggerElementsRef.current.get(menuId);

      if (menuElement) {
        updateTriangleSafeZone(menuElement, triggerElement);
      }

      // Focus management for accessibility
      if (config.accessibility.focusFirstItem && (isKeyboard || menuState.interactionMode === 'click')) {
        requestAnimationFrame(() => {
          const firstFocusable = menuElement?.querySelector<HTMLElement>(
            'a, button, [tabindex]:not([tabindex="-1"])'
          );
          firstFocusable?.focus();
        });
      }
    };

    // Determine delay based on interaction type
    let delay = config.hoverDelay.enter;
    if (isKeyboard) {
      delay = config.hoverDelay.keyboard;
    } else if (immediate || menuState.interactionMode !== 'hover') {
      delay = 0;
    }

    if (delay === 0) {
      doOpen();
    } else {
      hoverTimeoutRef.current = setTimeout(doOpen, delay);
    }
  }, [
    menuState.interactionMode,
    config.hoverDelay,
    config.accessibility.focusFirstItem,
    onMenuOpen,
    updateTriangleSafeZone
  ]);

  const closeMenu = useCallback((menuId?: string, immediate = false) => {
    const targetMenu = menuId || menuState.activeMenu;
    if (!targetMenu || targetMenu !== menuState.activeMenu) return;

    // Clear pending state
    setMenuState(prev => ({ ...prev, isPending: false }));

    const doClose = () => {
      setMenuState(prev => ({
        ...prev,
        activeMenu: null,
        isOpen: false,
        hoveredItem: null,
        isPending: false
      }));

      triangleSafeZoneRef.current = null;
      lastActiveMenuRef.current = null;
      initialHoverPositionRef.current = null;

      // Clean up hover bridge
      if (hoverBridgeRef.current) {
        hoverBridgeRef.current.remove();
        hoverBridgeRef.current = null;
      }

      onMenuClose?.(targetMenu);
    };

    if (immediate || menuState.interactionMode !== 'hover') {
      doClose();
    } else {
      // Check if cursor is in safe zone before closing
      if (checkSafeZone()) {
        // Don't close if in safe zone
        return;
      }
      hoverTimeoutRef.current = setTimeout(doClose, config.hoverDelay.exit);
    }
  }, [
    menuState.activeMenu,
    menuState.interactionMode,
    config.hoverDelay.exit,
    checkSafeZone,
    onMenuClose
  ]);

  const toggleMenu = useCallback((menuId: string) => {
    if (menuState.activeMenu === menuId) {
      closeMenu(menuId, true);
    } else {
      // Close previous menu if open
      if (menuState.activeMenu) {
        closeMenu(menuState.activeMenu, true);
      }
      openMenu(menuId, true);
    }
  }, [menuState.activeMenu, openMenu, closeMenu]);

  // ============= Hover Handlers =============

  const handleMouseEnter = useCallback((menuId: string, event: React.MouseEvent) => {
    if (menuState.interactionMode !== 'hover') return;

    // Update cursor position with tracker
    const currentPos = { x: event.clientX, y: event.clientY };
    cursorTrackerRef.current.addPosition(currentPos);

    // Check movement threshold to prevent accidental hovers
    if (!initialHoverPositionRef.current) {
      initialHoverPositionRef.current = currentPos;
    } else {
      const dx = Math.abs(currentPos.x - initialHoverPositionRef.current.x);
      const dy = Math.abs(currentPos.y - initialHoverPositionRef.current.y);
      const movement = Math.sqrt(dx * dx + dy * dy);

      if (movement < config.performance.movementThreshold) {
        // Not enough movement, might be accidental
        return;
      }
    }

    // If switching from another menu, check triangle safe zone
    if (menuState.activeMenu && menuState.activeMenu !== menuId) {
      if (checkSafeZone()) {
        // Delay switching to allow cursor to reach the submenu
        setTimeout(() => {
          if (menuState.hoveredItem === menuId) {
            closeMenu(menuState.activeMenu, true);
            openMenu(menuId);
          }
        }, 50);
        return;
      }
      closeMenu(menuState.activeMenu, true);
    }

    setMenuState(prev => ({ ...prev, hoveredItem: menuId }));
    openMenu(menuId);
  }, [
    menuState.interactionMode,
    menuState.activeMenu,
    menuState.hoveredItem,
    config.performance.movementThreshold,
    checkSafeZone,
    openMenu,
    closeMenu
  ]);

  const handleMouseLeave = useCallback((menuId: string, event: React.MouseEvent) => {
    if (menuState.interactionMode !== 'hover') return;

    // Update cursor position with tracker
    const currentPos = { x: event.clientX, y: event.clientY };
    cursorTrackerRef.current.addPosition(currentPos);

    // Reset initial hover position
    initialHoverPositionRef.current = null;

    // Check if cursor is moving towards the open menu (triangle safe zone)
    if (checkSafeZone()) {
      // Don't close yet, cursor might be moving to submenu
      return;
    }

    setMenuState(prev => ({ ...prev, hoveredItem: null }));
    closeMenu(menuId);
  }, [
    menuState.interactionMode,
    checkSafeZone,
    closeMenu
  ]);

  // ============= Click/Touch Handlers =============

  const handleClick = useCallback((menuId: string, event: React.MouseEvent | React.TouchEvent) => {
    if (config.touchMode.preventClickPropagation) {
      event.stopPropagation();
    }

    // Set interaction mode to click/touch
    const newMode = 'ontouchstart' in event ? 'touch' : 'click';
    if (menuState.interactionMode !== newMode) {
      setMenuState(prev => ({ ...prev, interactionMode: newMode }));
      onInteractionModeChange?.(newMode);
    }

    toggleMenu(menuId);
  }, [
    config.touchMode.preventClickPropagation,
    menuState.interactionMode,
    onInteractionModeChange,
    toggleMenu
  ]);

  // ============= Registration System =============

  const registerMenu = useCallback((menuId: string, element: HTMLElement, triggerElement?: HTMLElement) => {
    menuElementsRef.current.set(menuId, element);

    if (triggerElement) {
      triggerElementsRef.current.set(menuId, triggerElement);

      // Add expanded hit area if enabled
      if (config.expandedHitArea.enabled) {
        triggerElement.style.position = 'relative';

        // Create pseudo-element for expanded hit area
        const style = document.createElement('style');
        style.textContent = `
          [data-menu-trigger="${menuId}"]::before {
            content: '';
            position: absolute;
            top: -${config.expandedHitArea.padding}px;
            right: -${config.expandedHitArea.padding}px;
            bottom: -${config.expandedHitArea.padding}px;
            left: -${config.expandedHitArea.padding}px;
            z-index: -1;
          }
        `;
        document.head.appendChild(style);
        triggerElement.setAttribute('data-menu-trigger', menuId);
      }
    }

    // Return cleanup function
    return () => {
      menuElementsRef.current.delete(menuId);
      triggerElementsRef.current.delete(menuId);
      if (menuState.activeMenu === menuId) {
        closeMenu(menuId, true);
      }
      // Clean up style
      const style = document.querySelector(`style:has([data-menu-trigger="${menuId}"])`);
      style?.remove();
    };
  }, [menuState.activeMenu, config.expandedHitArea, closeMenu]);

  // ============= Keyboard Navigation =============

  // ============= Enhanced Keyboard Navigation =============

  const handleKeyDown = useCallback((event: React.KeyboardEvent, menuId: string) => {
    const menuElement = menuElementsRef.current.get(menuId);
    const triggerElement = triggerElementsRef.current.get(menuId);

    // Set keyboard navigation mode
    if (!menuState.keyboardNavigationActive) {
      setMenuState(prev => ({
        ...prev,
        keyboardNavigationActive: true,
        interactionMode: 'keyboard'
      }));
      onInteractionModeChange?.('keyboard');
    }

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (document.activeElement === triggerElement) {
          toggleMenu(menuId);
        } else {
          // If focusing an item within menu, activate it
          const activeElement = document.activeElement as HTMLElement;
          activeElement?.click();
        }
        break;

      case 'Escape':
        event.preventDefault();
        closeMenu(menuId, true);
        // Return focus to trigger
        triggerElement?.focus();
        setMenuState(prev => ({
          ...prev,
          focusedItemIndex: -1,
          focusedColumnIndex: 0,
          keyboardNavigationActive: false
        }));
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (menuState.activeMenu !== menuId) {
          // Open menu and focus first item
          openMenu(menuId, false, true);
          setMenuState(prev => ({ ...prev, focusedItemIndex: 0 }));
        } else {
          // Navigate down within menu
          navigateMenu(menuId, 'down');
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (menuState.activeMenu === menuId) {
          // Navigate up within menu
          navigateMenu(menuId, 'up');
        }
        break;

      case 'ArrowRight':
        event.preventDefault();
        if (menuState.activeMenu === menuId) {
          // Navigate to next column or next nav item
          navigateMenu(menuId, 'right');
        } else {
          // Move to next navbar item
          navigateNavbar('right');
        }
        break;

      case 'ArrowLeft':
        event.preventDefault();
        if (menuState.activeMenu === menuId) {
          // Navigate to previous column or previous nav item
          navigateMenu(menuId, 'left');
        } else {
          // Move to previous navbar item
          navigateNavbar('left');
        }
        break;

      case 'Home':
        event.preventDefault();
        if (menuState.activeMenu === menuId) {
          // Focus first item in current column
          navigateToFirstItem(menuId);
        } else {
          // Focus first navbar item
          focusFirstNavItem();
        }
        break;

      case 'End':
        event.preventDefault();
        if (menuState.activeMenu === menuId) {
          // Focus last item in current column
          navigateToLastItem(menuId);
        } else {
          // Focus last navbar item
          focusLastNavItem();
        }
        break;

      case 'Tab':
        // Implement focus trapping when menu is open
        if (menuState.activeMenu === menuId) {
          handleTabKey(event, menuId);
        }
        break;
    }
  }, [menuState.activeMenu, menuState.keyboardNavigationActive, toggleMenu, openMenu, closeMenu, onInteractionModeChange]);

  // Navigate within mega menu using arrow keys
  const navigateMenu = useCallback((menuId: string, direction: 'up' | 'down' | 'left' | 'right') => {
    const menuElement = menuElementsRef.current.get(menuId);
    if (!menuElement) return;

    // Get all focusable elements organized by columns
    const columns = menuElement.querySelectorAll('[role="group"], .menu-column');
    const currentColumn = columns[menuState.focusedColumnIndex] || columns[0];

    if (!currentColumn) return;

    const focusableItems = currentColumn.querySelectorAll<HTMLElement>(
      'a:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
    );

    let newIndex = menuState.focusedItemIndex;
    let newColumnIndex = menuState.focusedColumnIndex;

    switch (direction) {
      case 'down':
        newIndex = Math.min(newIndex + 1, focusableItems.length - 1);
        break;

      case 'up':
        newIndex = Math.max(newIndex - 1, 0);
        break;

      case 'right':
        if (newColumnIndex < columns.length - 1) {
          newColumnIndex++;
          newIndex = 0; // Reset to first item in new column
        }
        break;

      case 'left':
        if (newColumnIndex > 0) {
          newColumnIndex--;
          newIndex = 0; // Reset to first item in new column
        }
        break;
    }

    // Update state and focus element
    setMenuState(prev => ({
      ...prev,
      focusedItemIndex: newIndex,
      focusedColumnIndex: newColumnIndex
    }));

    // Focus the element
    const targetColumn = columns[newColumnIndex] || columns[0];
    const targetItems = targetColumn.querySelectorAll<HTMLElement>(
      'a:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
    );
    const targetElement = targetItems[newIndex];

    if (targetElement) {
      targetElement.focus();
      // Update roving tabindex
      updateRovingTabindex(menuElement, targetElement);
    }
  }, [menuState.focusedItemIndex, menuState.focusedColumnIndex]);

  // Navigate navbar items
  const navigateNavbar = useCallback((direction: 'left' | 'right') => {
    const navbar = document.querySelector('[role="navigation"]');
    if (!navbar) return;

    const navItems = navbar.querySelectorAll<HTMLElement>(
      'a:not([disabled]), button:not([disabled])'
    );

    const currentIndex = Array.from(navItems).findIndex(
      item => item === document.activeElement
    );

    let newIndex = currentIndex;
    if (direction === 'right') {
      newIndex = (currentIndex + 1) % navItems.length;
    } else {
      newIndex = currentIndex <= 0 ? navItems.length - 1 : currentIndex - 1;
    }

    navItems[newIndex]?.focus();
  }, []);

  // Navigate to first item in menu
  const navigateToFirstItem = useCallback((menuId: string) => {
    const menuElement = menuElementsRef.current.get(menuId);
    if (!menuElement) return;

    const firstItem = menuElement.querySelector<HTMLElement>(
      'a:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
    );

    if (firstItem) {
      firstItem.focus();
      setMenuState(prev => ({
        ...prev,
        focusedItemIndex: 0,
        focusedColumnIndex: 0
      }));
      updateRovingTabindex(menuElement, firstItem);
    }
  }, []);

  // Navigate to last item in menu
  const navigateToLastItem = useCallback((menuId: string) => {
    const menuElement = menuElementsRef.current.get(menuId);
    if (!menuElement) return;

    const columns = menuElement.querySelectorAll('[role="group"], .menu-column');
    const lastColumn = columns[columns.length - 1] || menuElement;

    const items = lastColumn.querySelectorAll<HTMLElement>(
      'a:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
    );

    const lastItem = items[items.length - 1];

    if (lastItem) {
      lastItem.focus();
      setMenuState(prev => ({
        ...prev,
        focusedItemIndex: items.length - 1,
        focusedColumnIndex: columns.length - 1
      }));
      updateRovingTabindex(menuElement, lastItem);
    }
  }, []);

  // Focus first/last navbar item
  const focusFirstNavItem = useCallback(() => {
    const navbar = document.querySelector('[role="navigation"]');
    const firstItem = navbar?.querySelector<HTMLElement>('a, button');
    firstItem?.focus();
  }, []);

  const focusLastNavItem = useCallback(() => {
    const navbar = document.querySelector('[role="navigation"]');
    const items = navbar?.querySelectorAll<HTMLElement>('a, button');
    if (items && items.length > 0) {
      items[items.length - 1].focus();
    }
  }, []);

  // Handle Tab key for focus trapping
  const handleTabKey = useCallback((event: React.KeyboardEvent, menuId: string) => {
    const menuElement = menuElementsRef.current.get(menuId);
    if (!menuElement) return;

    const focusableElements = menuElement.querySelectorAll<HTMLElement>(
      'a:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift+Tab - trap at beginning
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab - trap at end
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }, []);

  // Update roving tabindex for better keyboard navigation
  const updateRovingTabindex = useCallback((container: HTMLElement, activeElement: HTMLElement) => {
    // Set all items to tabindex="-1"
    const allItems = container.querySelectorAll<HTMLElement>(
      'a, button, [tabindex]'
    );
    allItems.forEach(item => {
      if (item !== activeElement) {
        item.setAttribute('tabindex', '-1');
      }
    });

    // Set active item to tabindex="0"
    activeElement.setAttribute('tabindex', '0');
  }, []);

  // ============= Global Mouse Tracking =============

  useEffect(() => {
    let lastEventTime = 0;

    const handleGlobalMouseMove = (event: MouseEvent) => {
      const now = Date.now();

      // Throttle mouse move events
      if (config.performance.throttleMs > 0 && now - lastEventTime < config.performance.throttleMs) {
        return;
      }
      lastEventTime = now;

      const currentPos = { x: event.clientX, y: event.clientY };

      // Use RAF for smooth tracking if enabled
      if (config.performance.useRAF) {
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);

        rafIdRef.current = requestAnimationFrame(() => {
          cursorTrackerRef.current.addPosition(currentPos);

          // Check if cursor left the safe zone
          if (menuState.activeMenu && !menuState.hoveredItem) {
            if (!checkSafeZone()) {
              // Cursor left safe zone and not hovering any item
              closeMenu(menuState.activeMenu);
            }
          }
        });
      } else {
        cursorTrackerRef.current.addPosition(currentPos);

        // Check safe zone directly
        if (menuState.activeMenu && !menuState.hoveredItem) {
          if (!checkSafeZone()) {
            closeMenu(menuState.activeMenu);
          }
        }
      }
    };

    if (config.triangleSafeZone.enabled && menuState.interactionMode === 'hover') {
      // Start cursor tracker
      cursorTrackerRef.current.start();

      document.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        cursorTrackerRef.current.stop();
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
      };
    }
  }, [
    config.triangleSafeZone.enabled,
    config.performance,
    menuState.activeMenu,
    menuState.hoveredItem,
    menuState.interactionMode,
    checkSafeZone,
    closeMenu
  ]);

  // ============= Close on Outside Click =============

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!menuState.activeMenu) return;

      const target = event.target as HTMLElement;
      const activeMenuElement = menuElementsRef.current.get(menuState.activeMenu);

      if (activeMenuElement && !activeMenuElement.contains(target)) {
        closeMenu(menuState.activeMenu, true);
      }
    };

    if (menuState.interactionMode !== 'hover' && menuState.isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }
  }, [menuState.activeMenu, menuState.isOpen, menuState.interactionMode, closeMenu]);

  // ============= Cleanup =============

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    activeMenu: menuState.activeMenu,
    isOpen: menuState.isOpen,
    isPending: menuState.isPending,
    interactionMode: menuState.interactionMode,
    isMenuOpen: (menuId: string) => menuState.activeMenu === menuId,
    isMenuPending: (menuId: string) => menuState.isPending && menuState.hoveredItem === menuId,

    // Actions
    openMenu,
    closeMenu,
    toggleMenu,
    registerMenu,

    // Event Handlers
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    handleKeyDown,

    // Utilities
    getMenuProps: (menuId: string, triggerRef?: React.RefObject<HTMLElement>) => ({
      onMouseEnter: (e: React.MouseEvent) => handleMouseEnter(menuId, e),
      onMouseLeave: (e: React.MouseEvent) => handleMouseLeave(menuId, e),
      onClick: (e: React.MouseEvent) => handleClick(menuId, e),
      onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, menuId),
      'aria-expanded': menuState.activeMenu === menuId,
      'aria-haspopup': 'true' as const,
      'data-pending': menuState.isPending && menuState.hoveredItem === menuId,
      'data-menu-trigger': menuId,
      role: 'button' as const,
      ref: triggerRef
    }),

    getTriggerProps: (menuId: string) => ({
      'data-menu-trigger': menuId,
      'data-menu-active': menuState.activeMenu === menuId,
      'data-menu-pending': menuState.isPending && menuState.hoveredItem === menuId,
      style: config.expandedHitArea.enabled ? {
        position: 'relative' as const,
        '--hit-area-padding': `${config.expandedHitArea.padding}px`
      } : undefined
    }),

    // Tracking
    cursorPosition: cursorTrackerRef.current.getLatest(),
    cursorVelocity: cursorTrackerRef.current.getVelocity(),

    // Config
    config
  };
}