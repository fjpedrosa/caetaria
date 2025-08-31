import { useEffect } from 'react';
import { useAnimation, type Variants } from 'framer-motion';

interface NavbarAnimationOptions {
  hideDelay?: number;        // Delay antes de ocultar (ms)
  showDelay?: number;        // Delay antes de mostrar (ms)
  duration?: number;         // Duración de la animación (s)
  easing?: number[];         // Función de easing como array de números
}

/**
 * Hook que maneja las animaciones del navbar basadas en visibilidad
 * Proporciona animaciones suaves para show/hide y efectos de entrada
 */
export const useNavbarAnimation = (
  isVisible: boolean,
  options: NavbarAnimationOptions = {}
) => {
  const {
    hideDelay = 0,
    showDelay = 0,
    duration = 0.3,
    easing = [0.4, 0.0, 0.2, 1] // ease-out cubic-bezier
  } = options;

  const controls = useAnimation();

  // Variantes para el navbar principal
  const navbarVariants: Variants = {
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration,
        ease: easing,
        delay: showDelay,
      }
    },
    hidden: {
      y: -100,
      opacity: 0,
      transition: {
        duration: duration * 0.8, // Ligeramente más rápido para ocultar
        ease: easing,
        delay: hideDelay,
      }
    },
    initial: {
      y: -100,
      opacity: 0
    }
  };

  // Variantes para la entrada inicial
  const entryVariants: Variants = {
    enter: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94], // ease-out-quart
        delay: 0.1
      }
    },
    initial: {
      y: -100,
      opacity: 0
    }
  };

  // Variantes para los elementos internos (stagger effect)
  const itemVariants: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: easing
      }
    },
    hidden: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.2,
        ease: easing
      }
    }
  };

  // Variantes para el container con stagger
  const containerVariants: Variants = {
    visible: {
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.05
      }
    },
    hidden: {
      transition: {
        staggerChildren: 0.02,
        staggerDirection: -1
      }
    }
  };

  // Efecto para controlar la animación basada en visibilidad
  useEffect(() => {
    controls.start(isVisible ? 'visible' : 'hidden');
  }, [isVisible, controls]);

  return {
    controls,
    navbarVariants,
    entryVariants,
    itemVariants,
    containerVariants,
    // Utilidades para animaciones específicas
    fadeInUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4, ease: easing }
    },
    slideDown: {
      initial: { y: -50, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      transition: { duration: 0.5, ease: easing }
    }
  };
};

/**
 * Hook para animaciones de hover específicas del navbar Motion style
 */
export const useNavbarHoverAnimations = () => {
  return {
    // Para la navigation pill
    pillHover: {
      scale: 1.02,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      transition: { duration: 0.2, ease: 'easeOut' }
    },
    pillTap: {
      scale: 0.98,
      transition: { duration: 0.1 }
    },

    // Para botones CTA
    ctaHover: {
      scale: 1.05,
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
      transition: { duration: 0.2, ease: 'easeOut' }
    },
    ctaTap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    },

    // Para enlaces internos
    linkHover: {
      y: -2,
      transition: { duration: 0.2, ease: 'easeOut' }
    },
    linkTap: {
      y: 0,
      scale: 0.98,
      transition: { duration: 0.1 }
    },

    // Para el logo
    logoHover: {
      scale: 1.05,
      rotate: 5,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    logoTap: {
      scale: 0.95,
      rotate: 0,
      transition: { duration: 0.1 }
    }
  };
};

/**
 * Hook para animaciones de backdrop blur dinámico
 */
export const useBackdropAnimation = (isScrolled: boolean) => {
  const blurVariants: Variants = {
    scrolled: {
      backdropFilter: 'blur(20px)',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    top: {
      backdropFilter: 'blur(8px)',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderColor: 'transparent',
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  const controls = useAnimation();

  useEffect(() => {
    controls.start(isScrolled ? 'scrolled' : 'top');
  }, [isScrolled, controls]);

  return {
    blurControls: controls,
    blurVariants
  };
};