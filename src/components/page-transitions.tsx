'use client';

import { ReactNode } from 'react';
import { AnimatePresence,motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface PageTransitionsProps {
  children: ReactNode;
}

/**
 * Page Transitions Component
 *
 * Provides smooth page transitions with Framer Motion.
 * Includes fade-in, slide effects, and loading animations.
 */
export function PageTransitions({ children }: PageTransitionsProps) {
  const pathname = usePathname();

  const variants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.98,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 1.02,
    },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          duration: 0.5,
          ease: [0.25, 0.46, 0.45, 0.94], // Custom easing curve
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Loading Overlay Component
 *
 * Shows a beautiful loading animation during page transitions.
 */
export function LoadingOverlay() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col items-center space-y-4">
        {/* Animated logo */}
        <motion.div
          className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-blue-600 rounded-full flex items-center justify-center"
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <motion.div
            className="w-8 h-8 bg-white rounded-full"
            animate={{
              scale: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>

        {/* Loading text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-gray-600 font-medium">Loading...</p>
        </motion.div>

        {/* Progress dots */}
        <div className="flex space-x-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-yellow-400 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: index * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}