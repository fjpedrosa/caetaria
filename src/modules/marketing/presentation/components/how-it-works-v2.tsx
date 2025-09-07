'use client';

import { MARKETING_COPY } from '@/modules/marketing/domain/copy';
import { 
  UserPlus, 
  Smartphone, 
  Bot, 
  Rocket,
  Code,
  CreditCard,
  Shield,
  Clock,
  Check,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

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
  Shield
} as const;

export function HowItWorksV2() {
  const [isInView, setIsInView] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  
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
      className="relative py-24 lg:py-32 overflow-hidden bg-gradient-to-b from-background to-muted/20"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        {/* Header Section */}
        <motion.div 
          className="text-center mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{badge}</span>
          </div>

          {/* Title */}
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {title}
            <span className="block lg:inline text-primary mt-2 lg:mt-0 lg:ml-2">
              {titleHighlight}
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>

          {/* Total Time Badge */}
          <div className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-base font-semibold text-foreground">{totalTime}</span>
          </div>
        </motion.div>

        {/* Desktop Timeline (Horizontal) */}
        <div className="hidden lg:block">
          <div className="relative max-w-7xl mx-auto">
            {/* Connecting Line */}
            <div className="absolute top-[88px] left-[10%] right-[10%] h-1 bg-gradient-to-r from-muted via-primary/20 to-muted">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary to-primary/60"
                initial={{ width: '0%' }}
                animate={isInView ? { width: '100%' } : {}}
                transition={{ duration: 2, delay: 0.5, ease: 'easeInOut' }}
              />
            </div>

            {/* Steps */}
            <div className="relative grid grid-cols-4 gap-8">
              {steps.map((step, index) => {
                const IconComponent = iconMap[step.icon as keyof typeof iconMap];
                
                return (
                  <motion.div
                    key={index}
                    className="relative"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.2 * (index + 1) }}
                    onMouseEnter={() => setActiveStep(index)}
                    onMouseLeave={() => setActiveStep(null)}
                  >
                    {/* Step Card */}
                    <div className={cn(
                      "relative bg-card rounded-2xl p-6 border transition-all duration-300",
                      activeStep === index ? "border-primary shadow-lg scale-105" : "border-border hover:border-primary/50"
                    )}>
                      {/* Step Number Circle */}
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <div className="relative">
                          <div className={cn(
                            "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
                            activeStep === index 
                              ? "bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25" 
                              : "bg-gradient-to-br from-primary/80 to-primary/60"
                          )}>
                            <span className="text-2xl font-bold text-white">{step.number}</span>
                          </div>
                          {/* Pulse animation for active step */}
                          {activeStep === index && (
                            <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-25" />
                          )}
                        </div>
                      </div>

                      {/* Time Badge */}
                      <div className="absolute top-4 right-4">
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs font-semibold">{step.time}</span>
                        </div>
                      </div>

                      {/* Icon */}
                      <div className="mt-12 mb-4 flex justify-center">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                          <IconComponent className="w-8 h-8 text-primary" />
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-foreground mb-2 text-center">
                        {step.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        {step.description}
                      </p>

                      {/* Benefit Badge */}
                      <div className="flex justify-center mb-4">
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                          <Check className="w-3 h-3" />
                          <span className="text-xs font-medium">{step.benefit}</span>
                        </div>
                      </div>

                      {/* Details (shown on hover) */}
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={activeStep === index ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 border-t border-border/50">
                          <ul className="space-y-2">
                            {step.details.map((detail, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Timeline (Vertical Cards) */}
        <div className="lg:hidden">
          <div className="relative">
            {/* Vertical Connecting Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-muted via-primary/20 to-muted">
              <motion.div 
                className="w-full bg-gradient-to-b from-primary to-primary/60"
                initial={{ height: '0%' }}
                animate={isInView ? { height: '100%' } : {}}
                transition={{ duration: 2, delay: 0.5, ease: 'easeInOut' }}
              />
            </div>

            {/* Mobile Steps */}
            <div className="relative space-y-12">
              {steps.map((step, index) => {
                const IconComponent = iconMap[step.icon as keyof typeof iconMap];
                
                return (
                  <motion.div
                    key={index}
                    className="relative flex gap-6"
                    initial={{ opacity: 0, x: -30 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.2 * (index + 1) }}
                  >
                    {/* Number Circle */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                        <span className="text-xl font-bold text-white">{step.number}</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="flex-1 bg-card rounded-xl p-6 border border-border">
                      {/* Time Badge */}
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary mb-4">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs font-semibold">{step.time}</span>
                      </div>

                      {/* Icon and Title */}
                      <div className="flex items-start gap-4 mb-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-foreground mb-1">
                            {step.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      {/* Benefit Badge */}
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 mb-4">
                        <Check className="w-3 h-3" />
                        <span className="text-xs font-medium">{step.benefit}</span>
                      </div>

                      {/* Details */}
                      <ul className="space-y-2">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
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

        {/* Trust Badges & CTA Section */}
        <motion.div 
          className="mt-16 lg:mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {trustBadges.map((badge, index) => {
              const BadgeIcon = badgeIconMap[badge.icon as keyof typeof badgeIconMap];
              return (
                <div 
                  key={index}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border"
                >
                  <BadgeIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">{badge.text}</span>
                </div>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              {cta.primary}
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-muted/50 border border-border text-foreground font-semibold hover:bg-muted transition-all duration-300">
              {cta.secondary}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}