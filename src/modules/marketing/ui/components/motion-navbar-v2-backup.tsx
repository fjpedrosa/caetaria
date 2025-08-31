'use client';

import React, { useEffect,useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
// Types
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

// Components
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
// Icons
import { ArrowRight, Menu, MessageCircle, X } from '@/lib/icons';
import { cn } from '@/lib/utils';

import type { CTAConfig } from './navbar-v2/cta-section';
import { CTASection as CTASectionComponent } from './navbar-v2/cta-section';
import { useNavbarAnimation } from './navbar-v2/hooks/use-navbar-animation';
// Hooks
import { useSmartScroll } from './navbar-v2/hooks/use-smart-scroll';
import { MobileMenu as MobileMenuComponent } from './navbar-v2/mobile-menu';
import type { NavigationItem } from './navbar-v2/navigation-pill';
// Components v2
import { NavigationPill as NavigationPillComponent } from './navbar-v2/navigation-pill';

// Note: NavigationItem and CTAConfig are now imported from respective modules

interface MotionNavbarV2Props {
  variant?: 'default' | 'transparent';
  showProgress?: boolean;
  hideOnScroll?: boolean;
  className?: string;
}

// Navigation data - similar to v1 but simplified for Motion style
const navigationItems: NavigationItem[] = [
  { label: 'Productos', href: '/productos' },
  { label: 'Soluciones', href: '/soluciones' },
  { label: 'Precios', href: '/precios' },
  { label: 'Roadmap', href: '/roadmap' }
];

const ctaConfig: CTAConfig = {
  signIn: {
    text: 'Iniciar sesión',
    href: '/login'
  },
  primary: {
    text: 'Prueba Gratis',
    href: '/onboarding',
    icon: ArrowRight
  }
};

/**
 * Motion Navbar V2 - Estilo Motion Software
 *
 * Características principales:
 * - Smart scroll (hide on scroll down, show on scroll up)
 * - Navigation pill central con backdrop blur
 * - Dark theme con CTAs diferenciados
 * - Mobile menu responsive
 */
export function MotionNavbarV2({
  variant = 'default',
  showProgress = false,
  hideOnScroll = true,
  className
}: MotionNavbarV2Props) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Smart scroll behavior
  const { isVisible, isAtTop, scrollY } = useSmartScroll({
    threshold: 10,
    hideThreshold: 80,
    debounceTime: 10
  });

  // Animations
  const {
    navbarVariants,
    entryVariants,
    containerVariants,
    itemVariants
  } = useNavbarAnimation(hideOnScroll ? isVisible : true);

  const hoverAnimations = useNavbarHoverAnimations();

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Dynamic navbar classes
  const navbarClasses = cn(
    // Base styles - Motion style dark theme
    'fixed top-0 left-0 right-0 z-50',
    'bg-gray-900 text-white',
    'transition-all duration-300 ease-out',

    // Smart scroll behavior
    hideOnScroll && (isVisible ? 'translate-y-0' : '-translate-y-full'),

    // Backdrop blur based on scroll
    isAtTop
      ? 'bg-gray-900/50 backdrop-blur-sm'
      : 'bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/20 shadow-xl',

    className
  );

  return (
    <>
      {/* Scroll Progress Indicator */}
      {showProgress && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-0.5 bg-white origin-left z-50"
          style={{
            scaleX: scrollY > 0 ? Math.min(scrollY / (document.documentElement.scrollHeight - window.innerHeight), 1) : 0
          }}
          initial={{ scaleX: 0 }}
        />
      )}

      {/* Main Navbar */}
      <motion.header
        variants={hideOnScroll ? navbarVariants : entryVariants}
        initial="initial"
        animate={hideOnScroll ? (isVisible ? 'visible' : 'hidden') : 'enter'}
        className={navbarClasses}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* Logo Section */}
            <motion.div
              variants={itemVariants}
              whileHover={hoverAnimations.logoHover}
              whileTap={hoverAnimations.logoTap}
              className="flex-shrink-0"
            >
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:bg-white/20 transition-all duration-300">
                  <Icon
                    icon={MessageCircle}
                    size="medium"
                    iconClassName="text-white group-hover:scale-110 transition-all"
                  />
                </div>
                <span className="text-xl font-bold text-white group-hover:text-gray-100 transition-all duration-300 hidden sm:block">
                  Caetaria
                </span>
              </Link>
            </motion.div>

            {/* Navigation Pill - Hidden on mobile */}
            <motion.div
              variants={containerVariants}
              className="hidden lg:flex items-center"
            >
              <NavigationPill items={navigationItems} />
            </motion.div>

            {/* CTA Section - Hidden on mobile */}
            <motion.div
              variants={containerVariants}
              className="hidden md:flex items-center space-x-3"
            >
              <CTASection config={ctaConfig} />
            </motion.div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10 focus:bg-white/10 focus:ring-white/50"
                    aria-label="Abrir menú de navegación"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <MobileMenu
                  navigationItems={navigationItems}
                  ctaConfig={ctaConfig}
                  onClose={() => setIsMobileMenuOpen(false)}
                />
              </Sheet>
            </div>

          </div>
        </nav>
      </motion.header>

      {/* Spacer to prevent content overlap */}
      <div className="h-16" />
    </>
  );
}

/**
 * Navigation Pill Component - Distintivo del estilo Motion
 * Navegación central agrupada con backdrop blur
 */
function NavigationPill({ items }: { items: NavigationItem[] }) {
  const hoverAnimations = useNavbarHoverAnimations();

  return (
    <motion.div
      whileHover={hoverAnimations.pillHover}
      whileTap={hoverAnimations.pillTap}
      className={cn(
        // Motion pill styles
        'flex items-center gap-1 px-2 py-2 rounded-full',
        'bg-white/10 backdrop-blur-md border border-white/20',
        'transition-all duration-200'
      )}
    >
      {items.map((item) => (
        <NavigationPillItem
          key={item.href}
          item={item}
        />
      ))}
    </motion.div>
  );
}

/**
 * Individual Navigation Pill Item
 */
function NavigationPillItem({ item }: { item: NavigationItem }) {
  const hoverAnimations = useNavbarHoverAnimations();

  return (
    <motion.div
      whileHover={hoverAnimations.linkHover}
      whileTap={hoverAnimations.linkTap}
    >
      <Link
        href={item.href}
        className={cn(
          'px-4 py-2 rounded-full text-sm font-medium',
          'text-gray-200 hover:text-white',
          'hover:bg-white/20 focus:bg-white/20',
          'transition-all duration-200 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-white/50'
        )}
      >
        <span className="flex items-center gap-2">
          {item.label}
          {item.badge && (
            <span className="inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white">
              {item.badge}
            </span>
          )}
        </span>
      </Link>
    </motion.div>
  );
}

/**
 * CTA Section - Sign in (texto) + Primary CTA (botón)
 */
function CTASection({ config }: { config: CTAConfig }) {
  const hoverAnimations = useNavbarHoverAnimations();

  return (
    <>
      {/* Sign In Link - Simple text */}
      <motion.div
        variants={{
          initial: { opacity: 0, x: 20 },
          visible: { opacity: 1, x: 0 }
        }}
        whileHover={hoverAnimations.linkHover}
        whileTap={hoverAnimations.linkTap}
      >
        <Link
          href={config.signIn.href}
          className={cn(
            'text-sm font-medium text-gray-200 hover:text-white',
            'px-3 py-2 rounded-lg hover:bg-white/10',
            'transition-colors duration-200'
          )}
        >
          {config.signIn.text}
        </Link>
      </motion.div>

      {/* Primary CTA - Prominent button */}
      <motion.div
        variants={{
          initial: { opacity: 0, x: 20 },
          visible: { opacity: 1, x: 0 }
        }}
        whileHover={hoverAnimations.ctaHover}
        whileTap={hoverAnimations.ctaTap}
      >
        <Button
          asChild
          className={cn(
            'px-6 py-2.5 rounded-lg font-semibold text-sm',
            'bg-white text-gray-900',
            'hover:bg-gray-100 hover:shadow-lg',
            'focus:ring-white/50 focus:ring-offset-2',
            'transition-all duration-200 ease-out'
          )}
        >
          <Link href={config.primary.href}>
            <span className="flex items-center gap-2">
              {config.primary.icon && (
                <Icon icon={config.primary.icon} size="small" />
              )}
              {config.primary.text}
            </span>
          </Link>
        </Button>
      </motion.div>
    </>
  );
}

/**
 * Mobile Menu Component
 */
function MobileMenu({
  navigationItems,
  ctaConfig,
  onClose
}: {
  navigationItems: NavigationItem[];
  ctaConfig: CTAConfig;
  onClose: () => void;
}) {
  const staggerVariants = {
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
      className="h-screen bg-gray-900 text-white border-none"
    >
      <motion.div
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col h-full"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <Link href="/" className="flex items-center space-x-2" onClick={onClose}>
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Icon icon={MessageCircle} size="small" iconClassName="text-white" />
            </div>
            <span className="text-lg font-bold">Caetaria</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6">
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <motion.div key={item.href} variants={itemVariants}>
                <Link
                  href={item.href}
                  className="block px-4 py-4 text-lg font-medium rounded-lg hover:bg-white/10 transition-colors"
                  onClick={onClose}
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </div>
        </nav>

        {/* Footer CTAs */}
        <motion.div
          variants={itemVariants}
          className="p-6 border-t border-gray-800 space-y-4"
        >
          <Link
            href={ctaConfig.signIn.href}
            className="block text-center py-3 text-gray-300 hover:text-white transition-colors"
            onClick={onClose}
          >
            {ctaConfig.signIn.text}
          </Link>
          <Button
            asChild
            className="w-full bg-white text-gray-900 hover:bg-gray-100"
            size="lg"
          >
            <Link href={ctaConfig.primary.href} onClick={onClose}>
              <span className="flex items-center gap-2">
                {ctaConfig.primary.text}
                {ctaConfig.primary.icon && (
                  <Icon icon={ctaConfig.primary.icon} size="small" />
                )}
              </span>
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </SheetContent>
  );
}

export default MotionNavbarV2;