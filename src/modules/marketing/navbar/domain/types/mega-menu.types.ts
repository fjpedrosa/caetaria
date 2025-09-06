/**
 * Types for professional mega menu system inspired by Stripe's design
 */

import { LucideIcon } from 'lucide-react';

/**
 * Individual item within a mega menu column
 */
export interface MegaMenuItem {
  id: string;
  title: string;
  description?: string;
  href: string;
  icon?: LucideIcon;
  iconColor?: string; // For gradient or solid colors
  badge?: {
    text: string;
    variant: 'new' | 'beta' | 'pro' | 'coming-soon';
  };
  isExternal?: boolean;
  isHighlighted?: boolean;
}

/**
 * Column within a mega menu
 */
export interface MegaMenuColumn {
  id: string;
  title?: string; // Column header (optional)
  items: MegaMenuItem[];
  footerLink?: {
    text: string;
    href: string;
    icon?: LucideIcon;
  };
  span?: 1 | 2; // Column span in grid
}

/**
 * Featured section for highlighting important items
 */
export interface MegaMenuFeatured {
  title: string;
  description: string;
  image?: string;
  cta: {
    text: string;
    href: string;
    variant?: 'primary' | 'secondary' | 'ghost';
  };
  gradient?: {
    from: string;
    to: string;
  };
}

/**
 * Complete mega menu configuration
 */
export interface MegaMenuConfig {
  id: string;
  trigger: string; // Nav item that triggers this menu
  columns: MegaMenuColumn[];
  featured?: MegaMenuFeatured;
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full'; // Menu width
  showBackdrop?: boolean;
  animationPreset?: 'fade' | 'slide' | 'scale';
}

/**
 * Visual theme configuration
 */
export interface MegaMenuTheme {
  backdrop: {
    blur: number;
    opacity: number;
    color: string;
  };
  panel: {
    background: string;
    borderRadius: string;
    shadow: string;
    border: string;
  };
  animation: {
    duration: number;
    easing: string;
    stagger: number;
  };
}

/**
 * State management for mega menus
 */
export interface MegaMenuState {
  activeMenuId: string | null;
  isTransitioning: boolean;
  hoveredItemId: string | null;
  keyboardNavigationActive: boolean;
  focusedItemIndex: number;
}

/**
 * Animation variants for Framer Motion
 */
export interface MegaMenuAnimationVariants {
  hidden: any;
  visible: any;
  exit: any;
  item?: any;
}