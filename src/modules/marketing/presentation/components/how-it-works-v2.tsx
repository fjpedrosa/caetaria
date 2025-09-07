'use client';

import { useEffect,useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  Check,
  Clock,
  Code,
  CreditCard,
  Rocket,
  Shield,
  Smartphone,
  Sparkles,
  UserPlus,
  Zap
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { MARKETING_COPY } from '@/modules/marketing/domain/copy';

// Icon mapping for dynamic icon rendering
const iconMap = {
  UserPlus,
  Smartphone,
  Bot,
  Rocket,
  Code,
  CreditCard,
  Shield
} as const;

// Badge icon mapping
const badgeIconMap = {
  Code,
  CreditCard,
  Shield,
  Clock,
  Zap
} as const;

export function HowItWorksV2() {
  const [isInView, setIsInView] = useState(false);

  const {
    badge,
    title,
    titleHighlight,
    subtitle,
    totalTime,
    steps,
    cta,
    trustBadges
  } = MARKETING_COPY.howItWorks;

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('how-it-works');
      if (element) {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.75 && rect.bottom > 0;
        setIsInView(isVisible);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      id="how-it-works"
      className="relative py-12 lg:py-16 overflow-hidden"
      aria-labelledby="how-it-works-title"
    >
      {/* Glass Elements */}
      <div className="glass-circle w-20 h-20 top-40 left-1/5 animate-[glass-float_13s_ease-in-out_infinite]" />
      <div className="glass-circle w-28 h-28 bottom-28 right-1/6 animate-[glass-float_15s_ease-in-out_infinite_reverse]" />

      <div className="container mx-auto px-6 lg:px-12">
        {/* Header Section - Following Use Cases Pattern */}
        <motion.div
          className="text-center mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Animated Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 rounded-full mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            <span className="text-primary font-semibold text-sm">{badge}</span>
          </div>

          {/* Main Title */}
          <h2 id="how-it-works-title" className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground dark:text-foreground mb-6">
            {title}
            <span className="block text-2xl lg:text-3xl xl:text-4xl mt-2 text-primary">
              {titleHighlight}
            </span>
          </h2>

          {/* Description */}
          <p className="text-lg lg:text-xl text-muted-foreground dark:text-muted-foreground/90 max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        {/* Desktop Timeline (Horizontal) */}
        <div className="hidden lg:block" role="list" aria-label="Pasos de configuración">
          <div className="relative max-w-6xl mx-auto">
            {/* Enhanced Connecting Line */}
            <div className="absolute top-[100px] left-[12%] right-[12%] h-1 bg-primary/10" aria-hidden="true">
              <motion.div
                className="relative h-full bg-gradient-to-r from-primary via-primary to-primary"
                initial={{ width: '0%' }}
                animate={isInView ? { width: '100%' } : {}}
                transition={{ duration: 2, delay: 0.5, ease: 'easeInOut' }}
              >
                {/* Animated Glow */}
                <motion.div
                  className="absolute inset-0 bg-primary/30 blur-sm"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              {/* Connection Nodes */}
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 bg-white rounded-full border-2 border-primary -top-[5px]"
                  style={{ left: `${25 * i + 12.5}%` }}
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : {}}
                  transition={{ duration: 0.3, delay: 0.8 + (i * 0.2) }}
                />
              ))}
            </div>

            {/* Steps */}
            <div className="relative grid grid-cols-4 gap-6">
              {steps.map((step, index) => {
                const IconComponent = iconMap[step.icon as keyof typeof iconMap];

                return (
                  <motion.div
                    key={index}
                    className="relative"
                    role="listitem"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.2 * (index + 1) }}
                  >
                    {/* Compact Step Card */}
                    <motion.div
                      className="relative bg-white rounded-xl p-4 border border-white/50 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-primary/30"
                      whileHover={{ y: -4 }}
                    >
                      {/* Step Badge */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <div className="px-3 py-1 bg-white rounded-full border-2 border-primary shadow-sm">
                          <span className="text-xs font-semibold text-primary">
                            Paso {step.number}
                          </span>
                        </div>
                      </div>

                      {/* Time Badge */}
                      <div className="absolute top-4 right-4">
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs font-semibold">{step.time}</span>
                        </div>
                      </div>

                      {/* Icon and Title Row */}
                      <div className="mt-6 mb-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-5 h-5 text-primary" aria-hidden="true" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {step.title}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 text-center mb-4">
                        {step.description}
                      </p>

                      {/* Benefit Badge */}
                      <div className="flex justify-center mb-4">
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                          <Check className="w-3 h-3" />
                          <span className="text-xs font-medium">{step.benefit}</span>
                        </div>
                      </div>

                      {/* Compact Details */}
                      <div className="pt-3 border-t border-gray-100">
                        <ul className="space-y-1.5">
                          {step.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                              <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Timeline (Vertical Cards) */}
        <div className="lg:hidden" role="list" aria-label="Pasos de configuración">
          <div className="relative">
            {/* Enhanced Vertical Connecting Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/20" aria-hidden="true">
              <motion.div
                className="relative w-full bg-gradient-to-b from-primary via-primary to-primary"
                initial={{ height: '0%' }}
                animate={isInView ? { height: '100%' } : {}}
                transition={{ duration: 2, delay: 0.5, ease: 'easeInOut' }}
              >
                {/* Animated Glow */}
                <motion.div
                  className="absolute inset-0 bg-primary/30 blur-sm"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            </div>

            {/* Mobile Steps */}
            <div className="relative space-y-12">
              {steps.map((step, index) => {
                const IconComponent = iconMap[step.icon as keyof typeof iconMap];

                return (
                  <motion.div
                    key={index}
                    className="relative flex gap-6"
                    role="listitem"
                    initial={{ opacity: 0, x: -30 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.2 * (index + 1) }}
                  >
                    {/* Compact Number Circle */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-white border-2 border-primary flex items-center justify-center shadow-sm">
                        <span className="text-lg font-bold text-primary">
                          {step.number}
                        </span>
                      </div>
                    </div>

                    {/* Compact Card Content */}
                    <div className="flex-1 bg-white rounded-xl p-4 border border-white/50 shadow-sm hover:shadow-lg transition-all duration-200">
                      {/* Time Badge */}
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary mb-4">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs font-semibold">{step.time}</span>
                      </div>


                      {/* Icon and Title */}
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-5 h-5 text-primary" aria-hidden="true" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-bold text-gray-900 mb-1">
                            {step.title}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      {/* Benefit Badge */}
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 mb-4">
                        <Check className="w-3 h-3" />
                        <span className="text-xs font-medium">{step.benefit}</span>
                      </div>

                      {/* Compact Details */}
                      <ul className="space-y-1.5">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                            <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          className="mt-16 lg:mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {/* Persuasive Text Before CTA */}
          {cta.preText && (
            <p className="text-lg lg:text-xl text-foreground font-medium mb-6">
              {cta.preText}
            </p>
          )}

          {/* Enhanced CTA Button */}
          <div className="flex justify-center">
            <motion.button
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg overflow-hidden"
              aria-label={cta.primary || 'Empezar ahora'}
              whileHover={{ scale: 1.02, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              {/* Hover Background Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />

              {/* Button Text */}
              <span className="relative font-semibold">
                {cta.primary || 'Empezar ahora'}
              </span>

              {/* Animated Arrow */}
              <motion.div
                className="relative"
                animate={{ x: 0 }}
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>

              {/* Sparkle Effect */}
              <motion.div
                className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full opacity-60"
                animate={{
                  opacity: [0, 0.6, 0],
                  scale: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}