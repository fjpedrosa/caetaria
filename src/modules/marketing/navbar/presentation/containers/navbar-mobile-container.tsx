/**
 * Presentation Layer - Smart Mobile Navbar Container
 *
 * Container especializado para la versión móvil del navbar.
 * Conecta hooks específicos de móvil con componentes presentacionales.
 *
 * Principios aplicados:
 * - Container/Presentation Pattern: Separa lógica de presentación
 * - Single Responsibility: Solo maneja interacciones móviles
 * - Interface Segregation: Interfaz específica para móvil
 */

'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';

import { useNavbarAccessibility } from '../../application/hooks/use-navbar-accessibility';
import { useNavbarScroll } from '../../application/hooks/use-navbar-scroll';
import type { CTAConfig,NavigationItem } from '../../domain/types';

// ============= Types =============

interface NavbarMobileContainerProps {
  navigationItems: NavigationItem[];
  ctaConfig: CTAConfig;
  isOpen: boolean;
  isScrolled?: boolean;
  enableGestures?: boolean;
  enableHapticFeedback?: boolean;
  className?: string;
  onClose: () => void;
  onNavigate?: (href: string) => void;
}

interface TouchState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isDragging: boolean;
  velocity: number;
}

// ============= Constants =============

const SWIPE_THRESHOLD = 50; // Minimum distance for swipe detection
const VELOCITY_THRESHOLD = 0.5; // Minimum velocity for quick swipe
const HAPTIC_PATTERNS = {
  light: [10],
  medium: [20],
  heavy: [30, 10, 30]
};

// ============= Container Implementation =============

export const NavbarMobileContainer: React.FC<NavbarMobileContainerProps> = ({
  navigationItems,
  ctaConfig,
  isOpen,
  isScrolled = false,
  enableGestures = true,
  enableHapticFeedback = true,
  className,
  onClose,
  onNavigate
}) => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStateRef = useRef<TouchState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isDragging: false,
    velocity: 0
  });

  // ============= State Management =============
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [animationState, setAnimationState] = useState<'idle' | 'entering' | 'leaving'>('idle');

  // ============= Hooks =============
  const { lockScroll, unlockScroll } = useNavbarScroll();
  const {
    trapFocus,
    releaseFocus,
    announceToScreenReader,
    getAriaProps
  } = useNavbarAccessibility({
    config: {
      enableSkipLinks: false,
      enableKeyboardShortcuts: true,
      enableFocusTrap: true,
      enableAriaLive: true,
      minTouchTarget: 44
    }
  });

  // ============= Haptic Feedback =============
  const triggerHaptic = useCallback((pattern: keyof typeof HAPTIC_PATTERNS = 'light') => {
    if (!enableHapticFeedback) return;

    // Use Vibration API if available
    if ('vibrate' in navigator) {
      navigator.vibrate(HAPTIC_PATTERNS[pattern]);
    }
  }, [enableHapticFeedback]);

  // ============= Touch Gesture Handlers =============
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enableGestures) return;

    const touch = e.touches[0];
    touchStateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      isDragging: false,
      velocity: 0
    };
  }, [enableGestures]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enableGestures || !touchStateRef.current) return;

    const touch = e.touches[0];
    const state = touchStateRef.current;

    state.currentX = touch.clientX;
    state.currentY = touch.clientY;

    const deltaX = state.currentX - state.startX;
    const deltaY = state.currentY - state.startY;

    // Detect horizontal swipe intent
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      state.isDragging = true;

      // Calculate velocity
      state.velocity = deltaX / (performance.now() / 1000);

      // Apply transform for visual feedback
      if (containerRef.current && deltaX > 0) {
        const progress = Math.min(deltaX / SWIPE_THRESHOLD, 1);
        containerRef.current.style.transform = `translateX(${deltaX}px)`;
        containerRef.current.style.opacity = `${1 - progress * 0.3}`;
      }
    }
  }, [enableGestures]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!enableGestures || !touchStateRef.current) return;

    const state = touchStateRef.current;
    const deltaX = state.currentX - state.startX;

    // Reset transform
    if (containerRef.current) {
      containerRef.current.style.transform = '';
      containerRef.current.style.opacity = '';
    }

    // Check for swipe right to close
    if (
      state.isDragging &&
      deltaX > SWIPE_THRESHOLD &&
      (Math.abs(state.velocity) > VELOCITY_THRESHOLD || deltaX > window.innerWidth * 0.3)
    ) {
      triggerHaptic('medium');
      onClose();
    }

    // Reset touch state
    touchStateRef.current = {
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      isDragging: false,
      velocity: 0
    };
  }, [enableGestures, triggerHaptic, onClose]);

  // ============= Navigation Handlers =============
  const handleItemClick = useCallback((item: NavigationItem) => {
    triggerHaptic('light');
    setActiveItem(item.href);

    // Handle navigation
    if (item.sectionId) {
      // Scroll to section
      const element = document.getElementById(item.sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        announceToScreenReader(`Navegando a sección ${item.label}`);
      }
    } else if (item.external) {
      window.open(item.href, '_blank', 'noopener,noreferrer');
      announceToScreenReader(`Abriendo ${item.label} en nueva pestaña`);
    } else {
      router.push(item.href);
      announceToScreenReader(`Navegando a ${item.label}`);
      onNavigate?.(item.href);
    }

    // Close menu after navigation
    setTimeout(() => {
      onClose();
    }, 300);
  }, [router, triggerHaptic, announceToScreenReader, onNavigate, onClose]);

  const handleSectionToggle = useCallback((sectionId: string) => {
    triggerHaptic('light');
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
        announceToScreenReader(`Sección ${sectionId} contraída`);
      } else {
        next.add(sectionId);
        announceToScreenReader(`Sección ${sectionId} expandida`);
      }
      return next;
    });
  }, [triggerHaptic, announceToScreenReader]);

  const handleSignInClick = useCallback(() => {
    triggerHaptic('light');
    router.push(ctaConfig.signIn.href);
    announceToScreenReader('Navegando a inicio de sesión');
    onNavigate?.(ctaConfig.signIn.href);
    onClose();
  }, [router, ctaConfig.signIn.href, triggerHaptic, announceToScreenReader, onNavigate, onClose]);

  const handlePrimaryCtaClick = useCallback(() => {
    triggerHaptic('medium');
    router.push(ctaConfig.primary.href);
    announceToScreenReader('Navegando a registro');
    onNavigate?.(ctaConfig.primary.href);
    onClose();
  }, [router, ctaConfig.primary.href, triggerHaptic, announceToScreenReader, onNavigate, onClose]);

  // ============= Keyboard Navigation =============
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
      case 'Tab':
        // Let focus trap handle tab navigation
        break;
      case 'ArrowDown':
        e.preventDefault();
        // Focus next item
        break;
      case 'ArrowUp':
        e.preventDefault();
        // Focus previous item
        break;
    }
  }, [isOpen, onClose]);

  // ============= Effects =============

  // Animation state management
  useEffect(() => {
    if (isOpen) {
      setAnimationState('entering');
      const timer = setTimeout(() => setAnimationState('idle'), 300);
      return () => clearTimeout(timer);
    } else if (animationState !== 'idle') {
      setAnimationState('leaving');
      const timer = setTimeout(() => setAnimationState('idle'), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, animationState]);

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      lockScroll();
      return () => unlockScroll();
    }
  }, [isOpen, lockScroll, unlockScroll]);

  // Focus trap
  useEffect(() => {
    if (isOpen && containerRef.current) {
      trapFocus(containerRef.current);
      return () => releaseFocus();
    }
  }, [isOpen, trapFocus, releaseFocus]);

  // Keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ============= Render Props for Presentational Components =============

  const mobileMenuProps = {
    // Visual props
    isOpen,
    isScrolled,
    animationState,
    className: cn(
      'fixed inset-0 z-50 lg:hidden',
      animationState === 'entering' && 'animate-in slide-in-from-right',
      animationState === 'leaving' && 'animate-out slide-out-to-right',
      className
    ),

    // Navigation data
    navigationItems,
    ctaConfig,
    expandedSections: Array.from(expandedSections),
    activeItem,

    // Event handlers
    onItemClick: handleItemClick,
    onSectionToggle: handleSectionToggle,
    onSignInClick: handleSignInClick,
    onPrimaryCtaClick: handlePrimaryCtaClick,
    onClose,

    // Touch gesture props
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,

    // Accessibility props
    ...getAriaProps('mobile-menu'),
    ref: containerRef
  };

  // Don't render if not open (after animation completes)
  if (!isOpen && animationState === 'idle') {
    return null;
  }

  // Return props object for use with presentational components
  // The actual rendering should be done by importing and using presentational components
  return (
    <div {...mobileMenuProps}>
      {/* This is where you would render the presentational mobile menu component */}
      {/* For now, returning the container div with all props attached */}
      {/* The presentational component should be imported and used here */}
    </div>
  );
};