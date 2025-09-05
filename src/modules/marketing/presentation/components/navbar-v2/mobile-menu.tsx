'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

import { MessageCircle, X } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { Button } from '@/modules/shared/presentation/components/ui/button';
import { Icon } from '@/modules/shared/presentation/components/ui/icon';
import { SheetContent, SheetHeader, SheetTitle } from '@/modules/shared/presentation/components/ui/sheet';

// Types
interface NavigationItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
  badge?: string;
  icon?: LucideIcon;
}

interface CTAConfig {
  signIn: {
    text: string;
    href: string;
  };
  primary: {
    text: string;
    href: string;
    icon?: LucideIcon;
  };
}

interface MobileMenuProps {
  navigationItems: NavigationItem[];
  ctaConfig: CTAConfig;
  onClose: () => void;
  className?: string;
  logoText?: string;
}

/**
 * Mobile Menu Component - Full screen overlay
 *
 * Características:
 * - Full screen overlay con blur background
 * - Animaciones staggered para elementos
 * - Logo y close button en header
 * - Navigation items con touch-friendly sizing
 * - CTAs en footer con prominence diferenciado
 */
export function MobileMenu({
  navigationItems,
  ctaConfig,
  onClose,
  className,
  logoText = 'Neptunik'
}: MobileMenuProps) {
  const containerVariants = {
    hidden: {
      opacity: 0,
      transition: {
        staggerChildren: 0.02,
        staggerDirection: -1
      }
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      x: -20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1]
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0.0, 0.2, 1]
      }
    }
  };

  const footerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: 0.3,
        ease: [0.4, 0.0, 0.2, 1]
      }
    }
  };

  return (
    <SheetContent
      side="top"
      className={cn(
        'h-screen bg-gray-900 text-white border-none p-0',
        // Enhanced backdrop blur for Motion style
        'backdrop-blur-xl',
        className
      )}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="flex flex-col h-full"
      >
        {/* Header */}
        <MobileMenuHeader
          logoText={logoText}
          onClose={onClose}
          variants={headerVariants}
        />

        {/* Navigation */}
        <MobileMenuNavigation
          items={navigationItems}
          onClose={onClose}
          itemVariants={itemVariants}
        />

        {/* Footer CTAs */}
        <MobileMenuFooter
          ctaConfig={ctaConfig}
          onClose={onClose}
          variants={footerVariants}
        />
      </motion.div>
    </SheetContent>
  );
}

/**
 * Mobile Menu Header
 * Logo + Close button
 */
function MobileMenuHeader({
  logoText,
  onClose,
  variants
}: {
  logoText: string;
  onClose: () => void;
  variants: any;
}) {
  return (
    <motion.div
      variants={variants}
      className="flex justify-between items-center p-6 border-b border-gray-800"
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center space-x-2 group"
        onClick={onClose}
      >
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all duration-300"
        >
          <Icon
            icon={MessageCircle}
            size="small"
            iconClassName="text-white group-hover:scale-110 transition-all"
          />
        </motion.div>
        <span className="text-lg font-bold group-hover:text-gray-100 transition-colors">
          {logoText}
        </span>
      </Link>

      {/* Close Button */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/10 focus:bg-white/10 focus:ring-white/50"
          aria-label="Cerrar menú"
        >
          <X className="h-6 w-6" />
        </Button>
      </motion.div>
    </motion.div>
  );
}

/**
 * Mobile Menu Navigation
 * Lista de navegación con animaciones staggered
 */
function MobileMenuNavigation({
  items,
  onClose,
  itemVariants
}: {
  items: NavigationItem[];
  onClose: () => void;
  itemVariants: any;
}) {
  return (
    <nav className="flex-1 p-6">
      <div className="space-y-2">
        {items.map((item, index) => (
          <motion.div
            key={item.href}
            variants={itemVariants}
            custom={index} // Para animaciones más elaboradas si es necesario
          >
            <MobileMenuItem
              item={item}
              onClose={onClose}
            />
          </motion.div>
        ))}
      </div>
    </nav>
  );
}

/**
 * Individual Mobile Menu Item
 */
function MobileMenuItem({
  item,
  onClose
}: {
  item: NavigationItem;
  onClose: () => void;
}) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={item.href}
        onClick={onClose}
        className={cn(
          'flex items-center justify-between px-4 py-4 text-lg font-medium rounded-lg',
          'hover:bg-white/10 active:bg-white/15 focus:bg-white/10',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-white/50',
          // Touch optimization
          'min-h-[48px] touch-manipulation'
        )}
        aria-label={`Ir a ${item.label}`}
      >
        <span className="flex items-center gap-3">
          {item.icon && (
            <Icon
              icon={item.icon}
              size="small"
              iconClassName="text-gray-300"
            />
          )}
          {item.label}
        </span>

        {item.badge && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center rounded-full bg-white/20 px-2 py-1 text-xs font-medium text-white"
          >
            {item.badge}
          </motion.span>
        )}
      </Link>
    </motion.div>
  );
}

/**
 * Mobile Menu Footer
 * CTAs con diferentes prominence levels
 */
function MobileMenuFooter({
  ctaConfig,
  onClose,
  variants
}: {
  ctaConfig: CTAConfig;
  onClose: () => void;
  variants: any;
}) {
  return (
    <motion.div
      variants={variants}
      className="p-6 border-t border-gray-800 space-y-4"
    >
      {/* Sign In Link - Menos prominente */}
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <Link
          href={ctaConfig.signIn.href}
          onClick={onClose}
          className={cn(
            'block text-center py-3 text-gray-300 hover:text-white',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-1',
            'rounded-lg min-h-[48px] flex items-center justify-center touch-manipulation'
          )}
          aria-label={`${ctaConfig.signIn.text} - Acceder a tu cuenta`}
        >
          {ctaConfig.signIn.text}
        </Link>
      </motion.div>

      {/* Primary CTA - Más prominente */}
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          asChild
          className={cn(
            'w-full bg-white text-gray-900 hover:bg-gray-100',
            'font-semibold py-4 text-lg rounded-lg',
            'shadow-lg hover:shadow-xl',
            'focus:ring-white/50 focus:ring-offset-2',
            'transition-all duration-200 ease-out',
            'min-h-[48px] touch-manipulation'
          )}
          size="lg"
        >
          <Link
            href={ctaConfig.primary.href}
            onClick={onClose}
            className="flex items-center justify-center gap-2"
            aria-label={`${ctaConfig.primary.text} - Comenzar ahora`}
          >
            <span className="flex items-center gap-2">
              {ctaConfig.primary.text}
              {ctaConfig.primary.icon && (
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: 'easeInOut'
                  }}
                >
                  <Icon
                    icon={ctaConfig.primary.icon}
                    size="small"
                  />
                </motion.div>
              )}
            </span>
          </Link>
        </Button>
      </motion.div>
    </motion.div>
  );
}

/**
 * Compact Mobile Menu
 * Versión más compacta para algunos casos de uso
 */
export function CompactMobileMenu({
  navigationItems,
  ctaConfig,
  onClose,
  className,
  logoText = 'Neptunik'
}: MobileMenuProps) {
  return (
    <MobileMenu
      navigationItems={navigationItems}
      ctaConfig={ctaConfig}
      onClose={onClose}
      logoText={logoText}
      className={cn('px-4 py-4', className)}
    />
  );
}

/**
 * Minimal Mobile Menu
 * Solo navegación, sin CTAs en footer
 */
export function MinimalMobileMenu({
  navigationItems,
  onClose,
  className,
  logoText = 'Neptunik'
}: Omit<MobileMenuProps, 'ctaConfig'>) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <SheetContent
      side="top"
      className={cn(
        'h-screen bg-gray-900 text-white border-none p-0',
        className
      )}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col h-full"
      >
        <MobileMenuHeader
          logoText={logoText}
          onClose={onClose}
          variants={itemVariants}
        />

        <MobileMenuNavigation
          items={navigationItems}
          onClose={onClose}
          itemVariants={itemVariants}
        />
      </motion.div>
    </SheetContent>
  );
}

// Export types for external use
export type { CTAConfig,MobileMenuProps, NavigationItem };