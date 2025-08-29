import { Transition,Variants } from 'framer-motion';

/**
 * Performance-optimized animation utilities
 * Provides common animation patterns with proper performance considerations
 */

// Easing functions optimized for performance
export const easings = {
  // Use cubic-bezier for smooth, performant animations
  easeOutCubic: [0.215, 0.610, 0.355, 1.000],
  easeInOutCubic: [0.645, 0.045, 0.355, 1.000],
  easeOutExpo: [0.190, 1.000, 0.220, 1.000],
  easeInOutExpo: [1.000, 0.000, 0.000, 1.000],
  // Spring configurations
  bouncy: { type: "spring", damping: 10, stiffness: 100 },
  gentle: { type: "spring", damping: 20, stiffness: 300 },
  snappy: { type: "spring", damping: 30, stiffness: 400 }
} as const;

// Performance-optimized transitions
export const transitions = {
  // Fast transitions for micro-interactions
  fast: { duration: 0.2, ease: easings.easeOutCubic },
  // Medium transitions for UI state changes
  medium: { duration: 0.4, ease: easings.easeOutCubic },
  // Slow transitions for page/section transitions
  slow: { duration: 0.6, ease: easings.easeOutExpo },
  // Stagger configurations for sequential animations
  stagger: {
    fast: { staggerChildren: 0.05, delayChildren: 0.1 },
    medium: { staggerChildren: 0.1, delayChildren: 0.2 },
    slow: { staggerChildren: 0.15, delayChildren: 0.3 }
  }
} as const;

// Common animation variants optimized for performance
export const fadeInUp: Variants = {
  initial: { 
    opacity: 0, 
    y: 20,
    // Use transform3d for hardware acceleration
    transform: 'translate3d(0, 20px, 0)'
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transform: 'translate3d(0, 0, 0)',
    transition: transitions.medium
  }
};

export const fadeInDown: Variants = {
  initial: { 
    opacity: 0, 
    y: -20,
    transform: 'translate3d(0, -20px, 0)'
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transform: 'translate3d(0, 0, 0)',
    transition: transitions.medium
  }
};

export const fadeInLeft: Variants = {
  initial: { 
    opacity: 0, 
    x: -20,
    transform: 'translate3d(-20px, 0, 0)'
  },
  animate: { 
    opacity: 1, 
    x: 0,
    transform: 'translate3d(0, 0, 0)',
    transition: transitions.medium
  }
};

export const fadeInRight: Variants = {
  initial: { 
    opacity: 0, 
    x: 20,
    transform: 'translate3d(20px, 0, 0)'
  },
  animate: { 
    opacity: 1, 
    x: 0,
    transform: 'translate3d(0, 0, 0)',
    transition: transitions.medium
  }
};

export const scaleIn: Variants = {
  initial: { 
    opacity: 0, 
    scale: 0.9,
    // Force hardware acceleration
    transform: 'translate3d(0, 0, 0) scale(0.9)'
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    transform: 'translate3d(0, 0, 0) scale(1)',
    transition: transitions.medium
  }
};

export const slideInUp: Variants = {
  initial: { 
    y: '100%',
    transform: 'translate3d(0, 100%, 0)'
  },
  animate: { 
    y: '0%',
    transform: 'translate3d(0, 0, 0)',
    transition: transitions.slow
  }
};

// Stagger container variants
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: transitions.stagger.medium
  }
};

export const staggerItem: Variants = {
  initial: { 
    opacity: 0, 
    y: 20,
    transform: 'translate3d(0, 20px, 0)'
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transform: 'translate3d(0, 0, 0)',
    transition: transitions.medium
  }
};

// Hover animations with reduced motion support
export const hoverScale = {
  scale: 1.05,
  transition: transitions.fast
};

export const hoverLift = {
  y: -2,
  scale: 1.02,
  transition: transitions.fast
};

export const tapScale = {
  scale: 0.95,
  transition: transitions.fast
};

// Adaptive infinite animations based on device capabilities
export const float: Variants = {
  animate: {
    y: [-4, 4, -4],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const floatLight: Variants = {
  animate: {
    y: [-2, 2, -2],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const pulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const pulseLight: Variants = {
  animate: {
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const rotate: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Get optimized floating animation based on device
export const getFloatAnimation = () => getAnimation(float, floatLight, { animate: {} });

// Get optimized pulse animation based on device
export const getPulseAnimation = () => getAnimation(pulse, pulseLight, { animate: {} });

// Device and connection detection utilities
export const detectDevice = () => {
  if (typeof window === 'undefined') return { isMobile: false, isLowEnd: false, connectionSpeed: '4g' };
  
  const userAgent = window.navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  // Detect low-end devices based on hardware concurrency and memory
  const hardwareConcurrency = (navigator as any).hardwareConcurrency || 1;
  const deviceMemory = (navigator as any).deviceMemory || 4;
  const isLowEnd = hardwareConcurrency <= 2 || deviceMemory <= 2;
  
  // Detect connection speed
  const connection = (navigator as any).connection;
  const connectionSpeed = connection?.effectiveType || '4g';
  
  return { isMobile, isLowEnd, connectionSpeed };
};

// Utility function to check for reduced motion preference
export const shouldReduceMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Enhanced animation configuration based on device capabilities
export const getOptimalAnimationConfig = () => {
  const { isMobile, isLowEnd, connectionSpeed } = detectDevice();
  const prefersReducedMotion = shouldReduceMotion();
  
  // Heavy animation reduction for low-end devices or slow connections
  const shouldUseMinimalAnimations = isLowEnd || connectionSpeed === 'slow-2g' || connectionSpeed === '2g' || prefersReducedMotion;
  const shouldUseLightAnimations = isMobile || connectionSpeed === '3g';
  
  return {
    shouldUseMinimalAnimations,
    shouldUseLightAnimations,
    maxConcurrentAnimations: shouldUseMinimalAnimations ? 2 : shouldUseLightAnimations ? 5 : 10,
    particleCount: shouldUseMinimalAnimations ? 0 : shouldUseLightAnimations ? 2 : 5,
    animationComplexity: shouldUseMinimalAnimations ? 'none' : shouldUseLightAnimations ? 'light' : 'full'
  };
};

// Utility function to get animation with comprehensive device support
export const getAnimation = (animation: Variants, lightAnimation?: Variants, minimalAnimation?: Variants): Variants => {
  const config = getOptimalAnimationConfig();
  
  if (config.shouldUseMinimalAnimations) {
    return minimalAnimation || { animate: { opacity: 1, transition: { duration: 0.1 } } };
  }
  
  if (config.shouldUseLightAnimations && lightAnimation) {
    return lightAnimation;
  }
  
  return animation;
};

// Animation batching utility to prevent too many concurrent animations
class AnimationBatcher {
  private activeAnimations = new Set<string>();
  private maxConcurrentAnimations: number;
  
  constructor() {
    this.maxConcurrentAnimations = getOptimalAnimationConfig().maxConcurrentAnimations;
  }
  
  canAnimate(animationId: string): boolean {
    return this.activeAnimations.size < this.maxConcurrentAnimations;
  }
  
  startAnimation(animationId: string): boolean {
    if (this.canAnimate(animationId)) {
      this.activeAnimations.add(animationId);
      return true;
    }
    return false;
  }
  
  endAnimation(animationId: string): void {
    this.activeAnimations.delete(animationId);
  }
  
  getActiveCount(): number {
    return this.activeAnimations.size;
  }
}

// Global animation batcher instance
export const animationBatcher = new AnimationBatcher();

// Enhanced performance monitoring with animation batching
export const withPerformanceMonitoring = (animationName: string) => ({
  onAnimationStart: () => {
    // Start animation in batcher
    const canStart = animationBatcher.startAnimation(animationName);
    
    if (!canStart) {
      console.warn(`Animation ${animationName} skipped due to performance limits`);
      return;
    }
    
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      performance.mark(`animation-${animationName}-start`);
    }
  },
  onAnimationComplete: () => {
    // End animation in batcher
    animationBatcher.endAnimation(animationName);
    
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      performance.mark(`animation-${animationName}-end`);
      performance.measure(
        `animation-${animationName}`,
        `animation-${animationName}-start`,
        `animation-${animationName}-end`
      );
    }
  }
});

// Hook to get animation configuration for React components
export const useAnimationConfig = () => {
  const config = getOptimalAnimationConfig();
  
  return {
    ...config,
    shouldAnimate: (priority: 'low' | 'medium' | 'high' = 'medium') => {
      if (config.shouldUseMinimalAnimations && priority === 'low') return false;
      if (config.shouldUseLightAnimations && priority === 'low') return false;
      return true;
    },
    getBatchedAnimation: (animationName: string, animation: Variants, fallback?: Variants) => {
      if (!animationBatcher.canAnimate(animationName)) {
        return fallback || { animate: { opacity: 1 } };
      }
      return animation;
    }
  };
};

// Viewport-based animation configuration
export const viewportConfig = {
  once: true, // Only animate once when in view
  margin: "0px 0px -50px 0px", // Trigger animation 50px before entering viewport
  amount: 0.3 // Animate when 30% of element is visible
};

// Layout transition configurations
export const layoutTransition = {
  layout: true,
  transition: {
    layout: { duration: 0.3, ease: easings.easeOutCubic }
  }
};

export default {
  easings,
  transitions,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  slideInUp,
  staggerContainer,
  staggerItem,
  hoverScale,
  hoverLift,
  tapScale,
  float,
  floatLight,
  pulse,
  pulseLight,
  rotate,
  getFloatAnimation,
  getPulseAnimation,
  detectDevice,
  shouldReduceMotion,
  getOptimalAnimationConfig,
  getAnimation,
  animationBatcher,
  withPerformanceMonitoring,
  useAnimationConfig,
  viewportConfig,
  layoutTransition
};