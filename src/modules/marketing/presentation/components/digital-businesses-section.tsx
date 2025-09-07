/**
 * Digital Businesses Section Component
 * Muestra empresas reconocidas que han digitalizado sus operaciones con WhatsApp
 * Fusiona lo mejor de Value Props y Evidence Section con un enfoque visual
 */

'use client';

import React, { useMemo, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  CheckCircle,
  ExternalLink,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import { useRegion } from '@/modules/marketing/application/contexts/region-context';
import {
  DIGITAL_BUSINESSES,
  type DigitalBusiness,
  getBusinessesByRegion,
  getFeaturedBusinesses,
  REGIONAL_METRICS
} from '@/modules/marketing/domain/data/digital-businesses.data';

/**
 * Business Card Component
 */
function BusinessCard({
  business,
  index,
  isInView
}: {
  business: DigitalBusiness;
  index: number;
  isInView: boolean;
}) {
  const Icon = business.industryIcon;
  const isPositiveTrend = business.metric.trend === 'up';

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={isInView ? {
        opacity: 1,
        y: 0,
        scale: 1
      } : {
        opacity: 0,
        y: 30,
        scale: 0.95
      }}
      transition={{
        duration: 0.6,
        delay: 0.1 + (index * 0.1),
        ease: [0.23, 1, 0.32, 1]
      }}
      whileHover={{
        y: -8,
        transition: { duration: 0.2, ease: 'easeOut' }
      }}
    >
      <div className={cn(
        'relative bg-card dark:bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden',
        'border border-border hover:border-primary/50 transition-all duration-300',
        'hover:shadow-2xl hover:shadow-primary/10',
        'h-full flex flex-col'
      )}>
        {/* Header con logo de empresa */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            {/* Logo real de la empresa */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 flex items-center justify-center">
                <Image
                  src={business.logoUrl}
                  alt={`${business.company} logo`}
                  width={56}
                  height={56}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-lg">
                  {business.company}
                </h4>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Icon className="w-3 h-3" />
                  {business.industry}
                </p>
              </div>
            </div>

            {/* Verification badge */}
            {business.source.verified && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                <span className="text-xs text-green-700 dark:text-green-300 font-medium">
                  Verificado
                </span>
              </div>
            )}
          </div>

          {/* Métrica principal */}
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <motion.span
                className={cn(
                  'text-3xl font-bold',
                  isPositiveTrend ? 'text-green-600 dark:text-green-400' :
                  business.metric.trend === 'down' ? 'text-blue-600 dark:text-blue-400' :
                  'text-primary'
                )}
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : { scale: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.3 + (index * 0.1),
                  type: 'spring',
                  stiffness: 200
                }}
              >
                {business.metric.value}
              </motion.span>
              <span className="text-sm font-medium text-muted-foreground">
                {business.metric.label}
              </span>
              {business.metric.trend === 'up' && (
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              )}
              {business.metric.trend === 'down' && (
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400 rotate-180" />
              )}
            </div>
          </div>

          {/* Descripción corta */}
          <p className="text-sm font-medium text-foreground mb-2">
            {business.description}
          </p>

          {/* Impacto detallado - 3 líneas completas */}
          <p className="text-sm text-muted-foreground dark:text-muted-foreground/90 line-clamp-3">
            {business.detailedImpact}
          </p>
        </div>

        {/* Footer con fuente y enlace */}
        <div className="mt-auto px-6 py-3 bg-muted/30 dark:bg-muted/20 border-t border-border/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{business.source.year}</span>
            <a
              href={business.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
              aria-label={`Ver fuente del caso de ${business.company}`}
            >
              <span>Ver fuente</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Decoración de fondo animada */}
        <motion.div
          className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: index * 0.5
          }}
        />
      </div>
    </motion.div>
  );
}

/**
 * Main Digital Businesses Section Component
 */
export function DigitalBusinessesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const { currentRegion } = useRegion();

  // Get businesses for current region
  const regionalBusinesses = useMemo(() => {
    const regional = getBusinessesByRegion(currentRegion);
    const featured = getFeaturedBusinesses();

    // Combine regional and featured, removing duplicates
    const combined = [...regional];
    featured.forEach(business => {
      if (!combined.find(b => b.id === business.id)) {
        combined.push(business);
      }
    });

    // Limit to 4-6 businesses for optimal display
    return combined.slice(0, 6);
  }, [currentRegion]);

  // Get regional metrics
  const metrics = REGIONAL_METRICS[currentRegion] || REGIONAL_METRICS.spain;

  // Split businesses for grid display (max 4 for main grid)
  const mainBusinesses = regionalBusinesses.slice(0, 4);
  const logoBusinesses = regionalBusinesses;

  return (
    <section
      ref={ref}
      className="py-12 lg:py-16 relative overflow-hidden"
      aria-labelledby="digital-businesses-heading"
    >
      {/* Section Fade Mask - Smooth continuation */}
      <div className="section-fade-mask section-fade-top" />

      {/* Success Blob Shapes */}
      <div className="blob-success blob-top-left" />
      <div className="blob-success-2 blob-bottom-right" />

      {/* Glass Elements */}
      <div className="glass-card w-36 h-28 top-28 right-1/3 animate-[glass-float_16s_ease-in-out_infinite]" />
      <div className="glass-card w-28 h-20 bottom-36 left-1/4 animate-[glass-float_13s_ease-in-out_infinite_reverse]" />

      {/* Background decoration */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 rounded-full mb-6">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-primary font-semibold text-sm">
              Negocios que ya se Digitalizaron
            </span>
          </div>

          {/* Main heading */}
          <h2
            id="digital-businesses-heading"
            className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground dark:text-foreground mb-4"
          >
            Empresas líderes que ya
            <span className="text-primary"> multiplicaron sus ventas</span>
          </h2>

          {/* Aggregated metrics */}
          <motion.div
            className="flex flex-wrap justify-center gap-6 mt-8 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-primary">{metrics.totalSaved}</span>
              <span className="text-sm text-muted-foreground">ahorrados</span>
            </div>
            <div className="text-muted-foreground">•</div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-primary">{metrics.totalCustomers}</span>
              <span className="text-sm text-muted-foreground">clientes automatizados</span>
            </div>
            <div className="text-muted-foreground">•</div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-primary">{metrics.automationRate}</span>
              <span className="text-sm text-muted-foreground">menos gestión manual</span>
            </div>
          </motion.div>

          {/* Company logos row */}
          <motion.div
            className="flex flex-wrap justify-center items-center gap-8 mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {logoBusinesses.map((business, index) => (
              <motion.div
                key={business.id}
                className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 0.7, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, delay: 0.3 + (index * 0.05) }}
                whileHover={{ scale: 1.05, opacity: 1 }}
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  <Image
                    src={business.logoUrl}
                    alt={`${business.company} logo`}
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-semibold text-muted-foreground">
                  {business.company}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Business Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-16">
          {mainBusinesses.map((business, index) => (
            <BusinessCard
              key={business.id}
              business={business}
              index={index}
              isInView={isInView}
            />
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, delay: 0.8 }}
        >
          <div className="bg-gradient-to-r from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/30 rounded-xl p-8 lg:p-12 border border-primary/30">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground dark:text-foreground mb-4">
              ¿Tu negocio será el siguiente?
            </h3>
            <p className="text-lg text-muted-foreground dark:text-muted-foreground/90 mb-8 max-w-2xl mx-auto">
              Únete a más de {metrics.businessCount} negocios que ya automatizan
              sus ventas con WhatsApp. Configuración en 2 horas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all hover:scale-105 active:scale-95 text-lg">
                Calcular mi ROI potencial
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-card hover:bg-card/80 text-foreground font-semibold rounded-lg transition-all border border-border hover:border-primary/50 text-lg">
                Ver más casos de éxito
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}