/**
 * Optimized Motion Components
 * Pre-configured Framer Motion components for better performance
 */

'use client';

import { motion } from 'framer-motion';
import React from 'react';

// Optimized animation variants for common patterns
export const animationVariants = {
  // Fast fade transitions for scenario changes
  scenarioTransition: {
    initial: { opacity: 0, scale: 0.98, y: 8 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 1.02, y: -8 },
    transition: { 
      duration: 0.2, 
      ease: [0.4, 0.0, 0.2, 1] // Custom easing for smooth feel
    }
  },
  
  // Smooth message animations
  messageAppear: {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -10 },
    transition: { 
      duration: 0.25,
      ease: 'easeOut'
    }
  },
  
  // Loading overlay transitions
  loadingOverlay: {
    initial: { opacity: 0, backdropFilter: 'blur(0px)' },
    animate: { opacity: 1, backdropFilter: 'blur(4px)' },
    exit: { opacity: 0, backdropFilter: 'blur(0px)' },
    transition: { 
      duration: 0.15,
      ease: 'easeInOut'
    }
  },
  
  // Simulator container animations
  simulatorContainer: {
    initial: { opacity: 0, scale: 0.92, rotateY: -8 },
    animate: { opacity: 1, scale: 1, rotateY: 0 },
    transition: { 
      duration: 0.5, 
      delay: 0.2, 
      ease: 'easeOut'
    }
  },
  
  // Badge animations
  badgeAppear: {
    initial: { opacity: 0, scale: 0.8, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.8, y: -20 },
    transition: { 
      type: 'spring',
      damping: 20,
      stiffness: 300,
      duration: 0.4
    }
  }
} as const;

// Pre-configured motion components with optimized settings
export const OptimizedMotion = {
  // Container for scenario transitions
  ScenarioContainer: React.memo<React.ComponentProps<typeof motion.div>>(
    function ScenarioContainer(props) {
      return (
        <motion.div
          {...animationVariants.scenarioTransition}
          {...props}
          style={{ 
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden',
            ...props.style 
          }}
        />
      );
    }
  ),

  // Container for messages
  MessageContainer: React.memo<React.ComponentProps<typeof motion.div>>(
    function MessageContainer(props) {
      return (
        <motion.div
          {...animationVariants.messageAppear}
          {...props}
          style={{ 
            willChange: 'transform, opacity',
            ...props.style 
          }}
        />
      );
    }
  ),

  // Loading overlay
  LoadingOverlay: React.memo<React.ComponentProps<typeof motion.div>>(
    function LoadingOverlay(props) {
      return (
        <motion.div
          {...animationVariants.loadingOverlay}
          {...props}
          style={{
            willChange: 'opacity, backdrop-filter',
            ...props.style
          }}
        />
      );
    }
  ),

  // Simulator container
  SimulatorContainer: React.memo<React.ComponentProps<typeof motion.div>>(
    function SimulatorContainer(props) {
      return (
        <motion.div
          {...animationVariants.simulatorContainer}
          {...props}
          style={{
            willChange: 'transform, opacity',
            perspective: '1000px',
            backfaceVisibility: 'hidden',
            ...props.style
          }}
        />
      );
    }
  ),

  // Badge container
  BadgeContainer: React.memo<React.ComponentProps<typeof motion.div>>(
    function BadgeContainer(props) {
      return (
        <motion.div
          {...animationVariants.badgeAppear}
          {...props}
          style={{
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden',
            ...props.style
          }}
        />
      );
    }
  )
};

// Performance-optimized layout animations
export const layoutTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.2
} as const;

// Reduced motion variants for accessibility
export const reducedMotionVariants = {
  scenarioTransition: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.1 }
  },
  
  messageAppear: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.15 }
  }
} as const;

// Hook to detect reduced motion preference
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return prefersReducedMotion;
}