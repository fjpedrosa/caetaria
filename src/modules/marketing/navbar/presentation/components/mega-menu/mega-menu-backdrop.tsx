/**
 * Premium backdrop component with blur effect
 * Creates the sophisticated overlay effect seen in Stripe's navigation
 */

import { useEffect, useState } from 'react';
import { AnimatePresence,motion } from 'framer-motion';

import { designTokens } from '../../styles/design-tokens';

interface MegaMenuBackdropProps {
  isOpen: boolean;
  onClick?: () => void;
  className?: string;
  blurAmount?: number;
  opacity?: number;
  zIndex?: number;
}

/**
 * Sophisticated backdrop with glass morphism effect
 * Includes fallback for browsers without backdrop-filter support
 */
export function MegaMenuBackdrop({
  isOpen,
  onClick,
  className = '',
  blurAmount = 8,
  opacity = 0.4,
  zIndex = 40,
}: MegaMenuBackdropProps) {
  const [supportsBackdropFilter, setSupportsBackdropFilter] = useState(true);

  // Check for backdrop-filter support
  useEffect(() => {
    const checkSupport = () => {
      const testElement = document.createElement('div');
      testElement.style.cssText = 'backdrop-filter: blur(1px); -webkit-backdrop-filter: blur(1px);';
      const supported = testElement.style.backdropFilter !== undefined ||
                       testElement.style.webkitBackdropFilter !== undefined;
      setSupportsBackdropFilter(supported);
    };

    checkSupport();
  }, []);

  // Animation variants for smooth transitions
  const backdropVariants = {
    hidden: {
      opacity: 0,
      backdropFilter: 'blur(0px)',
      WebkitBackdropFilter: 'blur(0px)',
    },
    visible: {
      opacity: 1,
      backdropFilter: `blur(${blurAmount}px)`,
      WebkitBackdropFilter: `blur(${blurAmount}px)`,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1], // Smooth cubic-bezier
      },
    },
    exit: {
      opacity: 0,
      backdropFilter: 'blur(0px)',
      WebkitBackdropFilter: 'blur(0px)',
      transition: {
        duration: 0.2,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  // Fallback gradient overlay for non-supporting browsers
  const fallbackOverlay = {
    background: `linear-gradient(
      180deg,
      rgba(0, 0, 0, ${opacity}) 0%,
      rgba(0, 0, 0, ${opacity * 0.8}) 50%,
      rgba(0, 0, 0, ${opacity * 0.6}) 100%
    )`,
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className={`fixed inset-0 ${className}`}
          style={{
            zIndex,
            backgroundColor: supportsBackdropFilter
              ? `rgba(0, 0, 0, ${opacity})`
              : undefined,
            ...(!supportsBackdropFilter ? fallbackOverlay : {}),
          }}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClick}
          aria-hidden="true"
        >
          {/* Additional visual layer for enhanced depth */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.1) 100%)',
              pointerEvents: 'none',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />

          {/* Subtle noise texture for premium feel */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              pointerEvents: 'none',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Lightweight version without animations for mobile
 */
export function MegaMenuBackdropMobile({
  isOpen,
  onClick,
  className = '',
}: Pick<MegaMenuBackdropProps, 'isOpen' | 'onClick' | 'className'>) {
  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/50 z-40 md:hidden ${className}`}
      onClick={onClick}
      aria-hidden="true"
      style={{
        // Simple fade for mobile
        transition: 'opacity 200ms ease-out',
      }}
    />
  );
}