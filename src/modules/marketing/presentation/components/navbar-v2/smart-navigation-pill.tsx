/**
 * Smart Navigation Pill Component
 * Enhanced navigation with intelligent features and animations
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

import { cn } from '@/lib/utils';

// Import the base types from navigation-pill
import type { NavigationItem } from './navigation-pill';

interface SmartNavigationPillProps {
  items: NavigationItem[];
  activeItem?: string;
  onItemHover?: (href: string, event: React.MouseEvent) => void;
  onItemLeave?: (href: string) => void;
  onItemClick?: (href: string, sectionId?: string) => void;
  sectionProgress?: Record<string, number>;
  isNavigating?: boolean;
  isPrefetching?: (href: string) => boolean;
  scrollVelocity?: number;
  className?: string;
}

/**
 * Smart Navigation Pill with enhanced features:
 * - Hover prefetching
 * - Section progress indicators
 * - Intelligent active state detection
 * - Micro-interactions and feedback
 */
export function SmartNavigationPill({
  items,
  activeItem,
  onItemHover,
  onItemLeave,
  onItemClick,
  sectionProgress = {},
  isNavigating = false,
  isPrefetching = false,
  scrollVelocity = 0,
  className
}: SmartNavigationPillProps) {

  const handleItemClick = (item: NavigationItem, event: React.MouseEvent) => {
    event.preventDefault();

    // Determine if this is a section navigation or external link
    const sectionMap: Record<string, string> = {
      '/productos': 'features',
      '/precios': 'pricing',
      '/roadmap': 'testimonials',
      '/soluciones': 'faq'
    };

    const sectionId = sectionMap[item.href];
    onItemClick?.(item.href, sectionId);
  };

  return (
    <motion.div
      className={cn(
        // Base pill styling
        'flex items-center gap-1 px-2 py-2 rounded-full',
        'bg-white/10 backdrop-blur-md border border-white/20',
        'transition-all duration-200 ease-out',
        // Performance optimizations
        'transform-gpu will-change-transform',
        // Responsive adjustments
        'h-12',
        className
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        scale: 1,
        // Slight scale animation based on scroll velocity
        y: Math.abs(scrollVelocity) > 10 ? -2 : 0
      }}
      transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
      role="navigation"
      aria-label="Navegación inteligente"
    >
      {/* Navigation Items */}
      {items.map((item) => {
        const isActive = activeItem === item.href;
        const progress = sectionProgress[item.href] || 0;

        return (
          <motion.div
            key={item.href}
            className="relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href={item.href}
              onClick={(e) => handleItemClick(item, e)}
              onMouseEnter={(e) => onItemHover?.(item.href, e)}
              onMouseLeave={() => onItemLeave?.(item.href)}
              className={cn(
                // Base item styles
                'px-4 py-2 rounded-full text-sm font-medium',
                'transition-all duration-200 ease-out',
                'focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-1',
                'touch-manipulation select-none',
                // State-based styling
                isActive
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-gray-200 hover:text-white hover:bg-white/15',
                // Navigation state feedback
                isNavigating && isActive && 'animate-pulse'
              )}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`Ir a ${item.label}`}
            >
              <span className="flex items-center gap-2">
                {item.label}

                {/* Badge if present */}
                {item.badge && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white"
                  >
                    {item.badge}
                  </motion.span>
                )}

                {/* Prefetch indicator - removed for debugging */}
              </span>
            </Link>

            {/* Section Progress Indicator */}
            {progress > 0 && (
              <motion.div
                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: progress }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="h-0.5 bg-yellow-400 rounded-full"
                  style={{ width: '80%' }}
                />
              </motion.div>
            )}

            {/* Active indicator */}
            {isActive && (
              <motion.div
                layoutId="active-pill"
                className="absolute inset-0 bg-white/10 rounded-full -z-10"
                transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
              />
            )}
          </motion.div>
        );
      })}

      {/* Loading/Navigation state */}
      {isNavigating && (
        <motion.div
          className="absolute inset-0 bg-white/5 rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

export default SmartNavigationPill;