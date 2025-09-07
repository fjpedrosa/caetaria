'use client';

import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  Calculator,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Mail,
  MessageSquare,
  Shield,
  Smartphone,
  TrendingUp} from 'lucide-react';

import { cn } from '@/lib/utils';

import { AnimatedCounter } from '../hero-section/components/animated-counter';

/**
 * Component for external links that open in new tabs
 */
interface SourceLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const SourceLink: React.FC<SourceLinkProps> = ({ href, children, className }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={cn(
      'inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors underline-offset-2 hover:underline',
      className
    )}
  >
    {children}
    <ExternalLink className="w-3 h-3" />
  </a>
);

/**
 * Channel metrics data structure - unified approach
 */
interface ChannelMetrics {
  name: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  metrics: {
    openRate: number;
    ctr: number;
    conversion: number;
    roi: string;
  };
  isHighlighted?: boolean;
}

/**
 * Simplified testimonial structure
 */
interface Testimonial {
  company: string;
  industry: string;
  metric: {
    value: string;
    label: string;
  };
  quote: string;
  verified: boolean;
}

/**
 * Evidence Section Component
 * Displays verified WhatsApp Business impact data with sources
 */
export function EvidenceSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  // Unified channel comparison data
  const channelsData: ChannelMetrics[] = [
    {
      name: 'WhatsApp',
      icon: MessageSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      metrics: {
        openRate: 98,
        ctr: 45,
        conversion: 15,
        roi: '10-35x'
      },
      isHighlighted: true
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100 dark:bg-gray-900/30',
      metrics: {
        openRate: 20,
        ctr: 3,
        conversion: 2,
        roi: '2-3x'
      }
    },
    {
      name: 'SMS',
      icon: Smartphone,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      metrics: {
        openRate: 95,
        ctr: 8,
        conversion: 4,
        roi: '4-5x'
      }
    }
  ];

  // Simplified testimonials
  const testimonials: Testimonial[] = [
    {
      company: 'Tata CLiQ',
      industry: 'Comercio',
      metric: {
        value: '10x ROI',
        label: 'vs otros canales'
      },
      quote: 'WhatsApp genera más retorno que email, SMS y push combinados. Es nuestro canal más rentable.',
      verified: true
    },
    {
      company: 'PTI Cosmetics',
      industry: 'Belleza',
      metric: {
        value: '98.9%',
        label: 'satisfacción'
      },
      quote: 'Resolvemos el 100% de consultas en 48h. Nuestros clientes aman la inmediatez de WhatsApp.',
      verified: true
    },
    {
      company: 'BMW',
      industry: 'Automoción',
      metric: {
        value: '80%',
        label: 'automatizado'
      },
      quote: 'Automatizamos la mayoría de consultas manteniendo un servicio personalizado y premium.',
      verified: true
    }
  ];


  const nextTestimonial = () => {
    setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section
      ref={ref}
      className="py-16 lg:py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden"
      aria-label="Evidencia del impacto de WhatsApp Business"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-primary rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative">
        {/* Section Header - Consistent Pattern */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Badge with subtle design - matching use-cases pattern */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 rounded-full mb-6">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span className="text-primary font-semibold text-sm">Datos Verificados</span>
          </div>

          {/* Title with consistent pattern: main + primary highlight */}
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground dark:text-foreground mb-6">
            Así multiplican sus ventas
            <span className="block text-2xl lg:text-3xl xl:text-4xl mt-2 text-primary">
              las empresas que aprovechan WhatsApp
            </span>
          </h2>

          {/* Description */}
          <p className="text-lg lg:text-xl text-muted-foreground dark:text-muted-foreground/90 max-w-3xl mx-auto leading-relaxed">
            Comparación real entre canales de comunicación.
            <span className="font-semibold text-foreground dark:text-foreground"> El 73% de usuarios</span> prefieren WhatsApp
            para comunicarse con empresas.
          </p>
        </motion.div>

        {/* Unified Channel Comparison Dashboard - Vertical Bar Charts */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <h3 className="text-2xl font-bold text-foreground dark:text-foreground mb-8 text-center">
            Comparación directa: WhatsApp vs Email vs SMS
          </h3>

          {/* Metrics Grid - Mobile First Design */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {/* Open Rate Chart */}
            <motion.div
              className="bg-card dark:bg-card/80 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-border"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h4 className="text-sm md:text-base font-semibold text-foreground mb-4 text-center">
                Tasa de Apertura
              </h4>
              <div className="relative h-48 md:h-56 lg:h-64">
                <div className="flex items-end justify-around h-full pb-10">
                  {channelsData.map((channel, index) => (
                    <div key={`open-${channel.name}`} className="flex flex-col items-center flex-1 max-w-[60px]">
                      {/* Bar Container */}
                      <div className="relative w-full h-full flex items-end justify-center">
                        {/* Background Bar */}
                        <div className="absolute bottom-0 w-12 md:w-14 lg:w-16 h-full bg-gray-100 dark:bg-gray-800 rounded-t-lg" />

                        {/* Animated Bar */}
                        <motion.div
                          className={cn(
                            'absolute bottom-0 w-12 md:w-14 lg:w-16 rounded-t-lg',
                            channel.name === 'WhatsApp' && 'bg-green-500',
                            channel.name === 'SMS' && 'bg-blue-500',
                            channel.name === 'Email' && 'bg-gray-400'
                          )}
                          initial={{ height: 0 }}
                          animate={isInView ? { height: `${(channel.metrics.openRate / 100) * 100}%` } : { height: 0 }}
                          transition={{ duration: 1.5, delay: 0.5 + (index * 0.2), ease: 'easeOut' }}
                        >
                          {/* Value Label */}
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 font-bold text-sm md:text-base whitespace-nowrap">
                            <AnimatedCounter end={channel.metrics.openRate} duration={1500} suffix="%" />
                          </div>

                          {/* Leader Badge */}
                          {channel.isHighlighted && (
                            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                              <span className="text-xs text-green-600 dark:text-green-400">⭐</span>
                            </div>
                          )}
                        </motion.div>
                      </div>

                      {/* Icon and Label */}
                      <div className="absolute bottom-0 flex flex-col items-center">
                        <channel.icon className={cn('w-4 h-4 md:w-5 md:h-5 mb-1', channel.color)} />
                        <span className="text-xs text-muted-foreground">{channel.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* CTR Chart */}
            <motion.div
              className="bg-card dark:bg-card/80 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-border"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h4 className="text-sm md:text-base font-semibold text-foreground mb-4 text-center">
                Click Rate (CTR)
              </h4>
              <div className="relative h-48 md:h-56 lg:h-64">
                <div className="flex items-end justify-around h-full pb-10">
                  {channelsData.map((channel, index) => (
                    <div key={`ctr-${channel.name}`} className="flex flex-col items-center flex-1 max-w-[60px]">
                      {/* Bar Container */}
                      <div className="relative w-full h-full flex items-end justify-center">
                        {/* Background Bar */}
                        <div className="absolute bottom-0 w-12 md:w-14 lg:w-16 h-full bg-gray-100 dark:bg-gray-800 rounded-t-lg" />

                        {/* Animated Bar */}
                        <motion.div
                          className={cn(
                            'absolute bottom-0 w-12 md:w-14 lg:w-16 rounded-t-lg',
                            channel.name === 'WhatsApp' && 'bg-green-500',
                            channel.name === 'SMS' && 'bg-blue-500',
                            channel.name === 'Email' && 'bg-gray-400'
                          )}
                          initial={{ height: 0 }}
                          animate={isInView ? { height: `${(channel.metrics.ctr / 50) * 100}%` } : { height: 0 }}
                          transition={{ duration: 1.5, delay: 0.6 + (index * 0.2), ease: 'easeOut' }}
                        >
                          {/* Value Label */}
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 font-bold text-sm md:text-base whitespace-nowrap">
                            <AnimatedCounter end={channel.metrics.ctr} duration={1500} suffix="%" />
                          </div>

                          {/* Leader Badge */}
                          {channel.isHighlighted && channel.metrics.ctr === 45 && (
                            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                              <span className="text-xs text-green-600 dark:text-green-400">⭐</span>
                            </div>
                          )}
                        </motion.div>
                      </div>

                      {/* Icon and Label */}
                      <div className="absolute bottom-0 flex flex-col items-center">
                        <channel.icon className={cn('w-4 h-4 md:w-5 md:h-5 mb-1', channel.color)} />
                        <span className="text-xs text-muted-foreground">{channel.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Conversion Chart */}
            <motion.div
              className="bg-card dark:bg-card/80 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-border"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h4 className="text-sm md:text-base font-semibold text-foreground mb-4 text-center">
                Tasa de Conversión
              </h4>
              <div className="relative h-48 md:h-56 lg:h-64">
                <div className="flex items-end justify-around h-full pb-10">
                  {channelsData.map((channel, index) => (
                    <div key={`conv-${channel.name}`} className="flex flex-col items-center flex-1 max-w-[60px]">
                      {/* Bar Container */}
                      <div className="relative w-full h-full flex items-end justify-center">
                        {/* Background Bar */}
                        <div className="absolute bottom-0 w-12 md:w-14 lg:w-16 h-full bg-gray-100 dark:bg-gray-800 rounded-t-lg" />

                        {/* Animated Bar */}
                        <motion.div
                          className={cn(
                            'absolute bottom-0 w-12 md:w-14 lg:w-16 rounded-t-lg',
                            channel.name === 'WhatsApp' && 'bg-green-500',
                            channel.name === 'SMS' && 'bg-blue-500',
                            channel.name === 'Email' && 'bg-gray-400'
                          )}
                          initial={{ height: 0 }}
                          animate={isInView ? { height: `${(channel.metrics.conversion / 20) * 100}%` } : { height: 0 }}
                          transition={{ duration: 1.5, delay: 0.7 + (index * 0.2), ease: 'easeOut' }}
                        >
                          {/* Value Label */}
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 font-bold text-sm md:text-base whitespace-nowrap">
                            <AnimatedCounter end={channel.metrics.conversion} duration={1500} suffix="%" />
                          </div>

                          {/* Leader Badge */}
                          {channel.isHighlighted && channel.metrics.conversion === 15 && (
                            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                              <span className="text-xs text-green-600 dark:text-green-400">⭐</span>
                            </div>
                          )}
                        </motion.div>
                      </div>

                      {/* Icon and Label */}
                      <div className="absolute bottom-0 flex flex-col items-center">
                        <channel.icon className={cn('w-4 h-4 md:w-5 md:h-5 mb-1', channel.color)} />
                        <span className="text-xs text-muted-foreground">{channel.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ROI Chart */}
            <motion.div
              className="bg-card dark:bg-card/80 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-border"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <h4 className="text-sm md:text-base font-semibold text-foreground mb-4 text-center">
                ROI Promedio
              </h4>
              <div className="relative h-48 md:h-56 lg:h-64">
                <div className="flex items-end justify-around h-full pb-10">
                  {channelsData.map((channel, index) => {
                    // Parse ROI values for bar height calculation
                    const roiValue = channel.metrics.roi === '10-35x' ? 35 :
                                   channel.metrics.roi === '4-5x' ? 5 :
                                   channel.metrics.roi === '2-3x' ? 3 : 0;

                    return (
                      <div key={`roi-${channel.name}`} className="flex flex-col items-center flex-1 max-w-[60px]">
                        {/* Bar Container */}
                        <div className="relative w-full h-full flex items-end justify-center">
                          {/* Background Bar */}
                          <div className="absolute bottom-0 w-12 md:w-14 lg:w-16 h-full bg-gray-100 dark:bg-gray-800 rounded-t-lg" />

                          {/* Animated Bar */}
                          <motion.div
                            className={cn(
                              'absolute bottom-0 w-12 md:w-14 lg:w-16 rounded-t-lg',
                              channel.name === 'WhatsApp' && 'bg-green-500',
                              channel.name === 'SMS' && 'bg-blue-500',
                              channel.name === 'Email' && 'bg-gray-400'
                            )}
                            initial={{ height: 0 }}
                            animate={isInView ? { height: `${(roiValue / 35) * 100}%` } : { height: 0 }}
                            transition={{ duration: 1.5, delay: 0.8 + (index * 0.2), ease: 'easeOut' }}
                          >
                            {/* Value Label */}
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 font-bold text-sm md:text-base whitespace-nowrap">
                              {channel.metrics.roi}
                            </div>

                            {/* Leader Badge */}
                            {channel.isHighlighted && (
                              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                                <span className="text-xs text-green-600 dark:text-green-400">⭐</span>
                              </div>
                            )}
                          </motion.div>
                        </div>

                        {/* Icon and Label */}
                        <div className="absolute bottom-0 flex flex-col items-center">
                          <channel.icon className={cn('w-4 h-4 md:w-5 md:h-5 mb-1', channel.color)} />
                          <span className="text-xs text-muted-foreground">{channel.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sources Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground dark:text-muted-foreground/60">
              Fuentes:
              <SourceLink
                href="https://business.whatsapp.com/success-stories"
                className="text-xs mx-1"
              >
                Meta Business 2024
              </SourceLink>
              •
              <SourceLink
                href="https://useinsider.com/whatsapp-conversational-commerce"
                className="text-xs mx-1"
              >
                Insider Commerce Guide
              </SourceLink>
            </p>
          </div>
        </motion.div>

        {/* Simplified Testimonials */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          <h3 className="text-2xl font-bold text-foreground dark:text-foreground mb-8 text-center">
            Lo que dicen las empresas
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.company}
                className="bg-card dark:bg-card/80 backdrop-blur-sm rounded-xl p-6 border border-border hover:border-primary/50 transition-all hover:shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.5 + (index * 0.1) }}
                whileHover={{ y: -5 }}
              >
                {/* Quote */}
                <div className="mb-6">
                  <div className="text-4xl text-primary/20 mb-2">"</div>
                  <p className="text-muted-foreground dark:text-muted-foreground/90 italic">
                    {testimonial.quote}
                  </p>
                </div>

                {/* Metric highlight */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">
                      {testimonial.metric.value}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {testimonial.metric.label}
                    </span>
                  </div>
                  {testimonial.verified && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  )}
                </div>

                {/* Company info */}
                <div className="pt-4 border-t border-border/50">
                  <p className="font-semibold text-foreground dark:text-foreground">
                    {testimonial.company}
                  </p>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground/80">
                    {testimonial.industry}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>


        {/* ROI Calculator CTA - Temporarily commented
        TODO: Implement interactive ROI calculator
        Options:
        - Option A: Simple inline calculator with 3 inputs
        - Option B: Modal with lead capture
        - Option C: Separate page with detailed analysis
        */}
        {false && (
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.7, delay: 0.8 }}
          >
            <div className="bg-gradient-to-r from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/30 rounded-xl p-8 border border-primary/30">
              <div className="text-center">
                <Calculator className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground dark:text-foreground mb-3">
                  Calcula tu ROI Potencial
                </h3>
                <p className="text-muted-foreground dark:text-muted-foreground/90 mb-6 max-w-2xl mx-auto">
                  Descubre cuánto podrías aumentar tus ventas basándote en los resultados
                  reales de empresas como la tuya
                </p>
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all hover:scale-105 active:scale-95">
                  Calcular mi ROI
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Simplified References */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground dark:text-muted-foreground/60">
            <Shield className="w-3 h-3" />
            <span>Datos verificados por</span>
            <SourceLink
              href="https://business.whatsapp.com/success-stories"
              className="text-xs"
            >
              Meta Business
            </SourceLink>
            <span>•</span>
            <SourceLink
              href="https://useinsider.com/whatsapp-conversational-commerce"
              className="text-xs"
            >
              Insider Commerce
            </SourceLink>
            <span>•</span>
            <SourceLink
              href="https://iabspain.es/estudio/estudio-redes-sociales-2024"
              className="text-xs"
            >
              IAB Spain
            </SourceLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
}