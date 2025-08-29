'use client';

import { useEffect,useState } from 'react';
import type { Variants } from 'framer-motion';

import { 
  animationBatcher,
  detectDevice, 
  getOptimalAnimationConfig, 
  shouldReduceMotion 
} from '@/lib/animation-utils';

import { useMediaQuery } from './use-media-query';

/**
 * Custom hook for managing animations with device-aware optimization
 */
export function useAnimationConfig() {
  const [config, setConfig] = useState(() => getOptimalAnimationConfig());
  const isMobile = useMediaQuery('(max-width: 768px)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    const newConfig = getOptimalAnimationConfig();
    setConfig(newConfig);
  }, [isMobile, prefersReducedMotion]);

  return {
    ...config,
    isMobile,
    prefersReducedMotion,
    
    // Check if animation should be enabled based on priority
    shouldAnimate: (priority: 'low' | 'medium' | 'high' = 'medium') => {
      if (config.shouldUseMinimalAnimations && priority === 'low') return false;
      if (config.shouldUseLightAnimations && priority === 'low') return false;
      return true;
    },
    
    // Get batched animation that respects performance limits
    getBatchedAnimation: (animationName: string, animation: Variants, fallback?: Variants) => {
      if (!animationBatcher.canAnimate(animationName)) {
        return fallback || { animate: { opacity: 1 } };
      }
      return animation;
    },
    
    // Get particle count for effects based on device capability
    getParticleCount: (baseCount: number = 10) => {
      if (config.shouldUseMinimalAnimations) return 0;
      if (config.shouldUseLightAnimations) return Math.min(baseCount * 0.3, 3);
      return Math.min(baseCount, config.maxConcurrentAnimations);
    },
    
    // Get optimized viewport config for intersection observer
    getViewportConfig: () => ({
      once: true,
      margin: isMobile ? '0px 0px -20px 0px' : '0px 0px -50px 0px',
      amount: isMobile ? 0.1 : 0.3
    }),
    
    // Check if heavy animations should be used
    canUseHeavyAnimations: () => !config.shouldUseMinimalAnimations && !config.shouldUseLightAnimations,
    
    // Get animation duration multiplier based on device
    getDurationMultiplier: () => {
      if (config.shouldUseMinimalAnimations) return 0.3;
      if (config.shouldUseLightAnimations) return 0.7;
      return 1;
    }
  };
}

/**
 * Hook for managing animation lifecycle with performance monitoring
 */
export function useAnimationLifecycle(animationName: string) {
  const [isAnimating, setIsAnimating] = useState(false);
  
  const startAnimation = () => {
    const canStart = animationBatcher.startAnimation(animationName);
    if (canStart) {
      setIsAnimating(true);
      return true;
    }
    return false;
  };
  
  const endAnimation = () => {
    animationBatcher.endAnimation(animationName);
    setIsAnimating(false);
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isAnimating) {
        animationBatcher.endAnimation(animationName);
      }
    };
  }, [animationName, isAnimating]);
  
  return {
    isAnimating,
    startAnimation,
    endAnimation,
    canAnimate: () => animationBatcher.canAnimate(animationName),
    activeAnimationsCount: animationBatcher.getActiveCount()
  };
}

/**
 * Hook for adaptive scroll-triggered animations
 */
export function useScrollAnimation() {
  const { shouldAnimate, getViewportConfig, getDurationMultiplier } = useAnimationConfig();
  
  return {
    // Get optimized fade in animation
    getFadeInAnimation: () => {
      if (!shouldAnimate('medium')) {
        return { animate: { opacity: 1 } };
      }
      
      return {
        initial: { opacity: 0, y: 20 },
        animate: { 
          opacity: 1, 
          y: 0,
          transition: { 
            duration: 0.6 * getDurationMultiplier(),
            ease: [0.215, 0.610, 0.355, 1.000]
          }
        }
      };
    },
    
    // Get optimized stagger animation
    getStaggerAnimation: (itemCount: number = 5) => {
      if (!shouldAnimate('low')) {
        return {
          container: { animate: {} },
          item: { animate: { opacity: 1 } }
        };
      }
      
      const staggerDelay = shouldAnimate('high') ? 0.1 : 0.05;
      
      return {
        container: {
          animate: {
            transition: {
              staggerChildren: staggerDelay,
              delayChildren: 0.1 * getDurationMultiplier()
            }
          }
        },
        item: {
          initial: { opacity: 0, y: 20 },
          animate: { 
            opacity: 1, 
            y: 0,
            transition: { 
              duration: 0.4 * getDurationMultiplier()
            }
          }
        }
      };
    },
    
    viewportConfig: getViewportConfig()
  };
}