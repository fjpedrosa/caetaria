'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

import {
  Activity,
  ArrowRight,
  MessageCircle,
  Sparkles,
  Users,
  Zap,
} from '@/lib/icons';
import { MARKETING_COPY } from '@/modules/marketing/domain/copy';
import { type HeroContentProps } from '@/modules/marketing/domain/types';
import { Badge } from '@/modules/shared/presentation/components/ui/badge';
import { Button } from '@/modules/shared/presentation/components/ui/button';
import { AnimatedIcon, Icon } from '@/modules/shared/presentation/components/ui/icon';

import { AnimatedCounter } from './animated-counter';

// Extended props for this specific implementation
interface ExtendedHeroContentProps extends HeroContentProps {
  isInView: boolean;
  prefersReducedMotion: boolean;
}

// HMR Optimization: Memoize animation configurations to prevent object recreation
const useAnimationConfigs = (isInView: boolean, prefersReducedMotion: boolean) => {
  return React.useMemo(() => ({
    containerVariants: {
      initial: { opacity: 0, x: prefersReducedMotion ? 0 : -50 },
      animate: isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: prefersReducedMotion ? 0 : -50 },
      transition: { duration: prefersReducedMotion ? 0.2 : 0.8, delay: prefersReducedMotion ? 0 : 0.2 }
    },
    badgeVariants: {
      initial: { opacity: 0, scale: 0.8 },
      animate: isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 },
      transition: { duration: 0.5, delay: 0.4 }
    },
    titleVariants: {
      initial: { opacity: 0, y: 20 },
      animate: isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
      transition: { duration: 0.7, delay: 0.6 }
    },
    subtitleVariants: {
      initial: { opacity: 0 },
      animate: isInView ? { opacity: 1 } : { opacity: 0 },
      transition: { duration: 0.5, delay: 1.2 }
    },
    descriptionVariants: {
      initial: { opacity: 0, y: 20 },
      animate: isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
      transition: { duration: 0.7, delay: 0.8 }
    },
    metricsVariants: {
      initial: { opacity: 0, y: 20 },
      animate: isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
      transition: { duration: 0.7, delay: 1.0 }
    },
    ctaVariants: {
      initial: { opacity: 0, y: 20 },
      animate: isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
      transition: { duration: 0.7, delay: 1.2 }
    }
  }), [isInView, prefersReducedMotion]);
};

// HMR Optimization: Memoize motion component hover effects
const useMotionEffects = () => {
  return React.useMemo(() => ({
    metricCardHover: { scale: 1.02, y: -3 },
    metricCardTap: { scale: 0.98 },
    ctaHover: { scale: 1.05 },
    ctaTap: { scale: 0.95 }
  }), []);
};

/**
 * Hero Section Content Component
 * Contains the left side content: text, CTAs, and metrics
 * HMR Optimized: Memoized to prevent unnecessary re-renders during development
 */
function HeroContent({ isInView, prefersReducedMotion }: ExtendedHeroContentProps) {
  // HMR Optimization: Memoize MARKETING_COPY extraction to prevent object recreation
  const heroContent = React.useMemo(() => MARKETING_COPY.hero, []);
  const { badge, title, subtitle, description, cta } = heroContent;

  // HMR Optimization: Use memoized animation configurations
  const animationConfigs = useAnimationConfigs(isInView, prefersReducedMotion);
  const motionEffects = useMotionEffects();

  return (
    <motion.div
      className="space-y-8 w-full max-w-2xl lg:max-w-xl xl:max-w-2xl"
      {...animationConfigs.containerVariants}
    >
      {/* Badge */}
      <motion.div {...animationConfigs.badgeVariants}>
        <Badge variant="promotional" className="px-3 py-1.5 text-xs font-medium inline-flex items-center shadow-sm">
          <Icon icon={Sparkles} size="small" iconClassName="w-3 h-3 mr-1.5 text-current" />
          {badge}
        </Badge>
      </motion.div>

      {/* Title and Subtitle */}
      <div className="space-y-4">
        <motion.h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight"
          {...animationConfigs.titleVariants}
        >
          {title}
          <motion.span
            className="block mt-1"
            {...animationConfigs.subtitleVariants}
          >
            <span className="inline highlight-text">
              {subtitle}
            </span>
          </motion.span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl"
          {...animationConfigs.descriptionVariants}
        >
          {description}
        </motion.p>
      </div>

      {/* Animated Metrics - Redesigned for better visibility and proportions */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        {...animationConfigs.metricsVariants}
        role="region"
        aria-label="Estadísticas de la plataforma"
      >
        {/* Messages Metric - Consistent Primary */}
        <motion.div
          className="flex items-center gap-4 bg-card border border-border rounded-xl px-5 py-4 shadow-lg hover:shadow-xl transition-shadow"
          whileHover={motionEffects.metricCardHover}
          whileTap={motionEffects.metricCardTap}
          aria-label="Mensajes procesados en la plataforma"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Icon icon={MessageCircle} size="large" iconClassName="text-primary w-6 h-6" aria-hidden="true" />
            </motion.div>
          </div>
          <div className="flex flex-col">
            <span className="text-foreground font-bold text-lg leading-none">
              <AnimatedCounter end={10} duration={2000} suffix="M+" />
            </span>
            <span className="text-muted-foreground text-sm font-medium">
              mensajes
            </span>
          </div>
        </motion.div>

        {/* Businesses Metric - Consistent Primary */}
        <motion.div
          className="flex items-center gap-4 bg-card border border-border rounded-xl px-5 py-4 shadow-lg hover:shadow-xl transition-shadow"
          whileHover={motionEffects.metricCardHover}
          whileTap={motionEffects.metricCardTap}
          aria-label="Empresas utilizando la plataforma"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
            >
              <Icon icon={Users} size="large" iconClassName="text-primary w-6 h-6" aria-hidden="true" />
            </motion.div>
          </div>
          <div className="flex flex-col">
            <span className="text-foreground font-bold text-lg leading-none">
              <AnimatedCounter end={5} duration={2000} suffix="K+" />
            </span>
            <span className="text-muted-foreground text-sm font-medium">
              empresas
            </span>
          </div>
        </motion.div>

        {/* Uptime Metric - Consistent Primary */}
        <motion.div
          className="flex items-center gap-4 bg-card border border-border rounded-xl px-5 py-4 shadow-lg hover:shadow-xl transition-shadow sm:col-span-2 lg:col-span-1"
          whileHover={motionEffects.metricCardHover}
          whileTap={motionEffects.metricCardTap}
          aria-label="Disponibilidad del servicio"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <motion.div
              animate={{
                y: [0, -2, 0],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            >
              <Icon icon={Activity} size="large" iconClassName="text-primary w-6 h-6" aria-hidden="true" />
            </motion.div>
          </div>
          <div className="flex flex-col">
            <span className="text-foreground font-bold text-lg leading-none">
              24/7
            </span>
            <span className="text-muted-foreground text-sm font-medium">
              funcionando
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* CTAs */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4"
        {...animationConfigs.ctaVariants}
      >
        <Link
          href="/signup"
          aria-label="Comenzar proceso de registro para prueba gratuita"
        >
          <motion.div
            whileHover={motionEffects.ctaHover}
            whileTap={motionEffects.ctaTap}
          >
            <Button
              size="lg"
              className="btn-primary shadow-lg hover:shadow-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 group relative overflow-hidden px-8 py-6 text-lg"
            >
              <span className="relative z-10 flex items-center gap-2">
                <AnimatedIcon icon={Zap} size="medium" hover animationType="pulse" iconClassName="text-current" />
                {cta.primary}
                <Icon icon={ArrowRight} size="medium" iconClassName="text-current group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </motion.div>
        </Link>
      </motion.div>
    </motion.div>
  );
}

HeroContent.displayName = 'HeroContent';

export { HeroContent };