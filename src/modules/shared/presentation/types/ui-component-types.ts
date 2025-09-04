/**
 * Shared UI Component Types - React-specific component interfaces
 * Presentation layer - Framework-specific types for UI components
 */

import React from 'react';

// =============================================================================
// CORE UI COMPONENT TYPES - Shared across all modules
// =============================================================================

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingStateProps extends BaseComponentProps {
  isLoading: boolean;
  loadingText?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'skeleton' | 'pulse';
}

export interface ErrorStateProps extends BaseComponentProps {
  error: Error | string;
  retry?: () => void;
  variant?: 'inline' | 'card' | 'page';
}

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangle' | 'circle';
  animation?: 'pulse' | 'wave' | 'none';
}

// =============================================================================
// FORM COMPONENT TYPES
// =============================================================================

export interface FormErrorBoundaryProps extends BaseComponentProps {
  formName: string;
  onError?: (error: Error) => void;
}

// =============================================================================
// ICON AND VISUAL COMPONENT TYPES
// =============================================================================

export interface IconProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number | string;
  color?: string;
  wrapper?: 'div' | 'span';
  animation?: 'spin' | 'pulse' | 'bounce' | 'none';
}

export interface FeatureIconProps extends Omit<IconProps, 'wrapper'> {
  variant?: 'primary' | 'secondary' | 'accent';
  showBackground?: boolean;
}

export interface AnimatedIconProps extends Omit<IconProps, 'animation'> {
  animationType: 'spin' | 'pulse' | 'bounce' | 'shake';
  duration?: number;
  infinite?: boolean;
}

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ComponentType<any>;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  loading?: boolean;
  iconPosition?: 'left' | 'right';
}

export interface IconWithTextProps extends Omit<IconProps, 'wrapper'> {
  text: string;
  textPosition?: 'right' | 'left' | 'bottom' | 'top';
  spacing?: 'sm' | 'md' | 'lg';
}

// =============================================================================
// INPUT AND INTERACTION COMPONENT TYPES
// =============================================================================

export interface FloatingInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'placeholder'> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  variant?: 'default' | 'outlined' | 'filled';
}

export interface FloatingTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'placeholder'> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  variant?: 'default' | 'outlined' | 'filled';
}

export interface SelectProps extends BaseComponentProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export interface SelectTriggerProps extends BaseComponentProps {
  disabled?: boolean;
}

export interface SelectContentProps extends BaseComponentProps {
  position?: 'bottom' | 'top';
}

export interface SelectItemProps extends BaseComponentProps {
  value: string;
  disabled?: boolean;
}

export interface SelectValueProps extends BaseComponentProps {
  placeholder?: string;
}

// =============================================================================
// LAYOUT AND NAVIGATION COMPONENT TYPES
// =============================================================================

export interface PageTransitionsProps extends BaseComponentProps {
  variant?: 'fade' | 'slide' | 'scale' | 'none';
  duration?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
}

export interface SmoothScrollNavProps extends BaseComponentProps {
  sections: Array<{
    id: string;
    label: string;
    href: string;
  }>;
  activeSection?: string;
  offset?: number;
  behavior?: 'smooth' | 'instant';
}

// =============================================================================
// RESPONSIVE AND OPTIMIZATION TYPES
// =============================================================================

export interface ResponsiveImageProps extends BaseComponentProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export interface OptimizedImageProps extends ResponsiveImageProps {
  lazy?: boolean;
  threshold?: number;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export interface AnimatedImageProps extends OptimizedImageProps {
  animation?: 'fadeIn' | 'slideIn' | 'scaleIn' | 'none';
  delay?: number;
  duration?: number;
}

export interface ImageGalleryProps extends BaseComponentProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  layout?: 'grid' | 'masonry' | 'carousel';
  columns?: number;
  spacing?: 'sm' | 'md' | 'lg';
  showCaptions?: boolean;
}

// =============================================================================
// PERFORMANCE AND MONITORING TYPES (UI-specific)
// =============================================================================

export interface PerformanceDashboardProps extends BaseComponentProps {
  metrics: PerformanceMetrics;
  refreshInterval?: number;
  showCharts?: boolean;
  compact?: boolean;
}

export interface FeedbackStateProps extends BaseComponentProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  onDismiss?: () => void;
}

// =============================================================================
// ERROR BOUNDARY TYPES
// =============================================================================

export interface ErrorBoundaryProps extends BaseComponentProps {
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: any) => void;
  resetOnPropsChange?: boolean;
}

export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  className?: string;
}

// =============================================================================
// IMPORT DOMAIN TYPES FOR UI COMPONENTS
// =============================================================================

// Re-export domain types that UI components need
export type {
  FormErrorState,
  FormLoadingState,
  PerformanceMetrics
} from '../../domain/types';