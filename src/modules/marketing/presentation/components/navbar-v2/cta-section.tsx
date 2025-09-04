'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
// Hook removido para simplificar animaciones
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import type { CTAConfig, CTASectionProps } from '@/modules/marketing/domain/types';
import { Button } from '@/modules/shared/presentation/components/ui/button';
import { Icon } from '@/modules/shared/presentation/components/ui/icon';

// CVA Variants for the section container
const ctaSectionVariants = cva(
  'flex items-center',
  {
    variants: {
      variant: {
        default: 'gap-3',
        compact: 'gap-2',
        spacious: 'gap-4'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

// CVA Variants for Sign In link
const signInVariants = cva(
  [
    'text-sm font-medium transition-all duration-200',
    'px-3 py-2 rounded-lg',
    'focus:outline-none focus:ring-2 focus:ring-white/50',
    'touch-manipulation select-none'
  ],
  {
    variants: {
      state: {
        default: [
          'text-gray-200 hover:text-white',
          'hover:bg-white/10 active:bg-white/15'
        ],
        active: [
          'text-white bg-white/10'
        ]
      }
    },
    defaultVariants: {
      state: 'default'
    }
  }
);

// CVA Variants for Primary CTA Button
const primaryCtaVariants = cva(
  [
    'px-6 py-2.5 rounded-lg font-semibold text-sm',
    'transition-all duration-200 ease-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'touch-manipulation select-none',
    'transform hover:scale-105 active:scale-95'
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-white text-gray-900',
          'hover:bg-gray-100 hover:shadow-lg',
          'focus:ring-white/50',
          'shadow-md hover:shadow-xl'
        ],
        gradient: [
          'bg-gradient-to-r from-blue-500 to-purple-600',
          'text-white hover:shadow-lg hover:shadow-blue-500/25',
          'focus:ring-blue-500/50',
          'hover:from-blue-600 hover:to-purple-700'
        ],
        outline: [
          'border-2 border-white/30 text-white bg-transparent',
          'hover:border-white hover:bg-white/10',
          'focus:ring-white/50',
          'hover:shadow-lg'
        ]
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

/**
 * CTA Section Component - Estilo Motion Software
 *
 * Layout: [Sign in] [Get Started Button]
 *
 * Características:
 * - Sign in: Link simple con hover sutil
 * - Primary CTA: Botón prominente que destaca
 * - Responsive: Se oculta en mobile
 * - Accesible: Focus states y touch targets
 */
export function CTASection({
  config,
  variant = 'default',
  className
}: CTASectionProps) {

  return (
    <div
      className={cn(
        ctaSectionVariants({ variant }),
        className
      )}
    >
      {/* Sign In Link - Texto simple */}
      <SignInLink
        config={config.signIn}
      />

      {/* Primary CTA - Botón prominente */}
      <PrimaryCTA
        config={config.primary}
      />
    </div>
  );
}

/**
 * Sign In Link Component
 * Enlace de texto simple con hover sutil
 */
function SignInLink({
  config
}: {
  config: CTAConfig['signIn'];
}) {
  return (
    <div>
      <Link
        href={config.href}
        className={signInVariants()}
        aria-label={`${config.text} - Acceder a tu cuenta`}
      >
        <span className="flex items-center gap-2">
          {config.icon && (
            <Icon
              icon={config.icon}
              size="small"
              iconClassName="transition-transform group-hover:scale-110"
            />
          )}
          {config.text}
        </span>
      </Link>
    </div>
  );
}

/**
 * Primary CTA Component
 * Botón principal prominente con animaciones
 */
function PrimaryCTA({
  config
}: {
  config: CTAConfig['primary'];
}) {
  return (
    <div>
      <Button
        asChild
        className={primaryCtaVariants({ variant: config.variant || 'default' })}
        aria-label={`${config.text} - Comenzar ahora`}
      >
        <Link href={config.href}>
          <span className="flex items-center gap-2">
            {config.text}
            {config.icon && (
              <Icon
                icon={config.icon}
                size="small"
                iconClassName="transition-transform group-hover:translate-x-1"
              />
            )}
          </span>
        </Link>
      </Button>
    </div>
  );
}

/**
 * Compact CTA Section
 * Para espacios más pequeños o layouts específicos
 */
export function CompactCTASection({
  config,
  className
}: Omit<CTASectionProps, 'variant'>) {
  return (
    <CTASection
      config={config}
      variant="compact"
      className={className}
    />
  );
}

/**
 * Minimal CTA Section
 * Solo el CTA principal, sin sign in
 */
export function MinimalCTASection({
  config,
  className
}: {
  config: Pick<CTAConfig, 'primary'>;
  className?: string;
}) {
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        type: 'spring' as const,
        ease: 'easeOut' as const
      }
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={className}
    >
      <Button
        asChild
        className={primaryCtaVariants({ variant: config.primary.variant || 'default' })}
      >
        <Link href={config.primary.href}>
          <span className="flex items-center gap-2">
            {config.primary.text}
            {config.primary.icon && (
              <Icon
                icon={config.primary.icon}
                size="small"
                iconClassName="transition-transform group-hover:translate-x-1"
              />
            )}
          </span>
        </Link>
      </Button>
    </motion.div>
  );
}

/**
 * Animated CTA with more elaborate entrance
 * Para animaciones de entrada más dramáticas
 */
export function AnimatedCTASection({
  config,
  variant = 'default',
  className
}: CTASectionProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const,
        staggerChildren: 0.15,
        delayChildren: 0.4
      }
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: 'easeOut' as const
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        ctaSectionVariants({ variant }),
        className
      )}
    >
      <motion.div variants={itemVariants}>
        <SignInLink
          config={config.signIn}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <PrimaryCTA
          config={config.primary}
        />
      </motion.div>
    </motion.div>
  );
}

// Export types for external use
export type { CTAConfig, CTASectionProps };