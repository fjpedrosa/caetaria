/**
 * Application Layer - Main Navbar State Hook
 *
 * Hook principal que orquesta todo el estado y lógica del navbar.
 * Principio aplicado: Single Responsibility - Solo maneja el estado principal
 */

import { useCallback, useEffect, useReducer } from 'react';

import {
  DEFAULT_CTA_CONFIG,
  DEFAULT_NAVIGATION_ITEMS} from '../../domain/constants';
import type {
  AccessibilityState,
  CTAConfig,
  MobileMenuState,
  NavbarConfig,
  NavigationItem,
  PrefetchState,
  ScrollState} from '../../domain/types';

// ============= State Types =============

interface NavbarState {
  config: NavbarConfig;
  navigationItems: NavigationItem[];
  ctaConfig: CTAConfig;
  accessibility: AccessibilityState;
  mobileMenu: MobileMenuState;
  scroll: ScrollState;
  prefetch: PrefetchState;
  currentSection: string;
  isHydrated: boolean;
}

// ============= Action Types =============

type NavbarAction =
  | { type: 'SET_CONFIG'; payload: Partial<NavbarConfig> }
  | { type: 'SET_NAVIGATION_ITEMS'; payload: NavigationItem[] }
  | { type: 'SET_CTA_CONFIG'; payload: Partial<CTAConfig> }
  | { type: 'UPDATE_ACCESSIBILITY'; payload: Partial<AccessibilityState> }
  | { type: 'TOGGLE_MOBILE_MENU'; payload?: boolean }
  | { type: 'UPDATE_SCROLL_STATE'; payload: Partial<ScrollState> }
  | { type: 'ADD_TO_PREFETCH_QUEUE'; payload: string }
  | { type: 'REMOVE_FROM_PREFETCH_QUEUE'; payload: string }
  | { type: 'SET_CURRENT_SECTION'; payload: string }
  | { type: 'SET_HYDRATED'; payload: boolean }
  | { type: 'RESET_STATE' };

// ============= Initial State =============

const initialState: NavbarState = {
  config: {
    variant: { type: 'default', blurEffect: true },
    showProgress: false,
    hideOnScroll: true,
    sticky: true
  },
  navigationItems: DEFAULT_NAVIGATION_ITEMS,
  ctaConfig: DEFAULT_CTA_CONFIG,
  accessibility: {
    announcements: [],
    focusedElement: null,
    skipLinkVisible: false,
    reducedMotion: false,
    highContrast: false,
    screenReaderActive: false,
    keyboardNavigating: false
  },
  mobileMenu: {
    isOpen: false,
    isAnimating: false,
    focusTrapActive: false
  },
  scroll: {
    isVisible: true,
    isAtTop: true,
    scrollY: 0,
    scrollVelocity: 0,
    scrollDirection: 'idle',
    scrollProgress: 0
  },
  prefetch: {
    queue: new Set(),
    isPrefetching: new Map(),
    cache: new Map()
  },
  currentSection: 'hero',
  isHydrated: false
};

// ============= Reducer =============

function navbarReducer(state: NavbarState, action: NavbarAction): NavbarState {
  switch (action.type) {
    case 'SET_CONFIG':
      return {
        ...state,
        config: { ...state.config, ...action.payload }
      };

    case 'SET_NAVIGATION_ITEMS':
      return {
        ...state,
        navigationItems: action.payload
      };

    case 'SET_CTA_CONFIG':
      return {
        ...state,
        ctaConfig: { ...state.ctaConfig, ...action.payload }
      };

    case 'UPDATE_ACCESSIBILITY':
      return {
        ...state,
        accessibility: { ...state.accessibility, ...action.payload }
      };

    case 'TOGGLE_MOBILE_MENU':
      return {
        ...state,
        mobileMenu: {
          ...state.mobileMenu,
          isOpen: action.payload ?? !state.mobileMenu.isOpen
        }
      };

    case 'UPDATE_SCROLL_STATE':
      return {
        ...state,
        scroll: { ...state.scroll, ...action.payload }
      };

    case 'ADD_TO_PREFETCH_QUEUE':
      return {
        ...state,
        prefetch: {
          ...state.prefetch,
          queue: new Set(Array.from(state.prefetch.queue).concat(action.payload))
        }
      };

    case 'REMOVE_FROM_PREFETCH_QUEUE':
      const newQueue = new Set(state.prefetch.queue);
      newQueue.delete(action.payload);
      return {
        ...state,
        prefetch: {
          ...state.prefetch,
          queue: newQueue
        }
      };

    case 'SET_CURRENT_SECTION':
      return {
        ...state,
        currentSection: action.payload
      };

    case 'SET_HYDRATED':
      return {
        ...state,
        isHydrated: action.payload
      };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

// ============= Hook Implementation =============

export interface UseNavbarStateOptions {
  config?: Partial<NavbarConfig>;
  navigationItems?: NavigationItem[];
  ctaConfig?: Partial<CTAConfig>;
}

export function useNavbarState(options: UseNavbarStateOptions = {}) {
  const [state, dispatch] = useReducer(navbarReducer, {
    ...initialState,
    config: { ...initialState.config, ...options.config },
    navigationItems: options.navigationItems || initialState.navigationItems,
    ctaConfig: { ...initialState.ctaConfig, ...options.ctaConfig }
  });

  // ============= Action Creators =============

  const setConfig = useCallback((config: Partial<NavbarConfig>) => {
    dispatch({ type: 'SET_CONFIG', payload: config });
  }, []);

  const setNavigationItems = useCallback((items: NavigationItem[]) => {
    dispatch({ type: 'SET_NAVIGATION_ITEMS', payload: items });
  }, []);

  const setCTAConfig = useCallback((config: Partial<CTAConfig>) => {
    dispatch({ type: 'SET_CTA_CONFIG', payload: config });
  }, []);

  const updateAccessibility = useCallback((accessibility: Partial<AccessibilityState>) => {
    dispatch({ type: 'UPDATE_ACCESSIBILITY', payload: accessibility });
  }, []);

  const toggleMobileMenu = useCallback((isOpen?: boolean) => {
    dispatch({ type: 'TOGGLE_MOBILE_MENU', payload: isOpen });
  }, []);

  const updateScrollState = useCallback((scroll: Partial<ScrollState>) => {
    dispatch({ type: 'UPDATE_SCROLL_STATE', payload: scroll });
  }, []);

  const addToPrefetchQueue = useCallback((href: string) => {
    dispatch({ type: 'ADD_TO_PREFETCH_QUEUE', payload: href });
  }, []);

  const removeFromPrefetchQueue = useCallback((href: string) => {
    dispatch({ type: 'REMOVE_FROM_PREFETCH_QUEUE', payload: href });
  }, []);

  const setCurrentSection = useCallback((section: string) => {
    dispatch({ type: 'SET_CURRENT_SECTION', payload: section });
  }, []);

  const setHydrated = useCallback((hydrated: boolean) => {
    dispatch({ type: 'SET_HYDRATED', payload: hydrated });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  // ============= Hydration Effect =============

  useEffect(() => {
    setHydrated(true);

    // Clean up on unmount
    return () => {
      resetState();
    };
  }, [setHydrated, resetState]);

  // ============= Computed Values =============

  const isNavbarVisible = state.config.hideOnScroll
    ? state.scroll.isVisible
    : true;

  const shouldShowProgress = state.config.showProgress && state.isHydrated;

  const isHighContrastMode = state.accessibility.highContrast;

  const isReducedMotion = state.accessibility.reducedMotion;

  // ============= Return Interface =============

  return {
    // State
    state,

    // Computed values
    isNavbarVisible,
    shouldShowProgress,
    isHighContrastMode,
    isReducedMotion,

    // Actions
    actions: {
      setConfig,
      setNavigationItems,
      setCTAConfig,
      updateAccessibility,
      toggleMobileMenu,
      updateScrollState,
      addToPrefetchQueue,
      removeFromPrefetchQueue,
      setCurrentSection,
      setHydrated,
      resetState
    }
  };
}