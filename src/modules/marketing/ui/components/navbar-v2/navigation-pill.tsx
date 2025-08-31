'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import Link from 'next/link';

import { cn } from '@/lib/utils';
// Hook removido para simplificar animaciones

// Types
interface NavigationItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
  badge?: string;
}

interface NavigationPillProps {
  items: NavigationItem[];
  activeItem?: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg';
}

interface NavigationPillItemProps {
  item: NavigationItem;
  isActive?: boolean;
  onClick?: () => void;
}

// CVA Variants for the pill container
const pillVariants = cva(
  [
    // Base styles - Motion Software distinctive pill
    'flex items-center gap-1 px-2 py-2 rounded-full',
    'bg-white/10 backdrop-blur-md border border-white/20',
    'transition-all duration-200 ease-out',
    // Hardware acceleration for smooth performance
    'transform-gpu will-change-transform'
  ],
  {
    variants: {
      size: {
        default: 'h-12',
        sm: 'h-10 px-1.5 py-1.5',
        lg: 'h-14 px-3 py-3'
      },
      state: {
        default: 'hover:bg-white/15 hover:shadow-lg',
        active: 'bg-white/20 shadow-md',
        disabled: 'opacity-50 pointer-events-none'
      }
    },
    defaultVariants: {
      size: 'default',
      state: 'default'
    }
  }
);

// CVA Variants for individual pill items
const pillItemVariants = cva(
  [
    // Base item styles
    'px-4 py-2 rounded-full text-sm font-medium',
    'transition-all duration-200 ease-out',
    'focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-1',
    // Touch optimization
    'touch-manipulation select-none'
  ],
  {
    variants: {
      state: {
        default: [
          'text-gray-200 hover:text-white',
          'hover:bg-white/20 active:bg-white/30'
        ],
        active: [
          'bg-white/20 text-white',
          'shadow-sm'
        ],
        disabled: [
          'text-gray-400 cursor-not-allowed',
          'pointer-events-none'
        ]
      },
      size: {
        default: 'px-4 py-2 text-sm',
        sm: 'px-3 py-1.5 text-xs',
        lg: 'px-5 py-2.5 text-base'
      }
    },
    defaultVariants: {
      state: 'default',
      size: 'default'
    }
  }
);

/**
 * Navigation Pill Component - Distintivo del estilo Motion Software
 *
 * Características:
 * - Forma de píldora con backdrop blur
 * - Items agrupados visualmente
 * - Hover states suaves y animaciones
 * - Responsive y accesible
 */
export function NavigationPill({
  items,
  activeItem,
  className,
  size = 'default'
}: NavigationPillProps) {

  return (
    <div
      className={cn(
        pillVariants({ size }),
        className
      )}
      // Accessibility
      role="navigation"
      aria-label="Navegación principal"
    >
      {items.map((item, index) => (
        <NavigationPillItem
          key={item.href}
          item={item}
          isActive={activeItem === item.href}
          size={size}
        />
      ))}
    </div>
  );
}

/**
 * Individual Navigation Pill Item
 * Maneja el estado individual de cada elemento
 */
function NavigationPillItem({
  item,
  isActive,
  onClick,
  size = 'default'
}: NavigationPillItemProps & { size?: 'default' | 'sm' | 'lg' }) {

  return (
    <div>
      <Link
        href={item.href}
        onClick={onClick}
        className={cn(
          pillItemVariants({
            state: isActive ? 'active' : 'default',
            size
          })
        )}
        // Accessibility
        aria-current={isActive ? 'page' : undefined}
        aria-label={`Ir a ${item.label}`}
      >
        <span className="flex items-center gap-2">
          {item.label}
          {item.badge && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white"
            >
              {item.badge}
            </motion.span>
          )}
        </span>
      </Link>
    </div>
  );
}

/**
 * Animated Navigation Pill with staggered children
 * Para animaciones de entrada más elaboradas
 */
export function AnimatedNavigationPill({
  items,
  activeItem,
  className,
  size = 'default'
}: NavigationPillProps) {
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.4, 0.0, 0.2, 1],
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1]
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        pillVariants({ size }),
        className
      )}
      role="navigation"
      aria-label="Navegación principal"
    >
      {items.map((item) => (
        <motion.div
          key={item.href}
          variants={itemVariants}
        >
          <NavigationPillItem
            item={item}
            isActive={activeItem === item.href}
            size={size}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * Compact Navigation Pill para espacios reducidos
 */
export function CompactNavigationPill({
  items,
  activeItem,
  className
}: Omit<NavigationPillProps, 'size'>) {
  return (
    <NavigationPill
      items={items}
      activeItem={activeItem}
      size="sm"
      className={cn('gap-0.5', className)}
    />
  );
}

// Export types for external use
export type { NavigationItem, NavigationPillProps };