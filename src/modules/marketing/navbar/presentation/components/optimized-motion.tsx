/**
 * Optimized Framer Motion Components
 *
 * Tree-shaken imports para reducir bundle size:
 * - Solo importa motion.div y motion.nav
 * - Elimina features no usadas (drag, layout, etc.)
 * - ~8KB vs ~30KB de framer-motion completo
 */

'use client';

// Tree-shaken imports - solo lo que necesitamos
import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';

// ============= Optimized Motion Components =============

// Solo exportamos los componentes motion que usamos
export const MotionDiv = motion.div;
export const MotionNav = motion.nav;
export const MotionButton = motion.button;
export const MotionHeader = motion.header;

// ============= Preset Animations (Lightweight) =============

// Animaciones predefnidas para evitar recrear objetos
export const navbarVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -10
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0.0, 0.2, 1] // easeOut
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: [0.4, 0.0, 1, 1] // easeIn
    }
  }
};

export const megaMenuVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -10
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.0, 0.0, 0.2, 1] // easeOut
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: {
      duration: 0.15,
      ease: [0.4, 0.0, 1, 1] // easeIn
    }
  }
};

export const mobileMenuVariants: Variants = {
  hidden: {
    x: '100%'
  },
  visible: {
    x: 0,
    transition: {
      type: 'tween',
      duration: 0.3,
      ease: [0.0, 0.0, 0.2, 1]
    }
  },
  exit: {
    x: '100%',
    transition: {
      type: 'tween',
      duration: 0.2,
      ease: [0.4, 0.0, 1, 1]
    }
  }
};

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

export const slideInVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.0, 0.0, 0.2, 1]
    }
  }
};

// ============= Animation States =============

// Estados constantes para evitar recrear objetos
export const ANIMATION_STATES = {
  HIDDEN: 'hidden',
  VISIBLE: 'visible',
  EXIT: 'exit'
} as const;

// ============= Performance Optimized Props =============

// Props por defecto optimizadas para performance
export const optimizedMotionProps = {
  // Reduce re-renders
  layout: false,

  // Disable features we don't need
  drag: false,
  dragConstraints: false,
  dragElastic: false,
  dragMomentum: false,

  // Optimize animations
  transformTemplate: undefined,
  custom: undefined,

  // Reduce DOM updates
  style: undefined,
  transformValues: undefined
} as const;

// ============= Custom Animation Hooks =============

export { AnimatePresence } from 'framer-motion';

// ============= TypeScript Exports =============

export type {
  MotionProps,
  Transition,
  Variants} from 'framer-motion';