'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Play } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { Badge } from '@/modules/shared/presentation/components/ui/badge';
import { Button } from '@/modules/shared/presentation/components/ui/button';

import { Industry } from '../../domain/types';

// ITERATION 1: Neptune Blue Primary + WhatsApp Green Accents
// Clean, professional design matching existing landing page patterns

interface IndustryHeroProps {
  industry: Industry;
  onStartTrial: () => void;
  onViewDemo: () => void;
}

export function IndustryHeroV1({ industry, onStartTrial, onViewDemo }: IndustryHeroProps) {
  // Icon mapping - would normally import from a centralized icon registry
  const getIcon = (iconName: string) => {
    // This would be replaced with actual icon component lookup
    return CheckCircle; // Placeholder
  };

  return (
    <section className="relative min-h-[600px] bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
      {/* Subtle geometric shapes like in pricing section */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-brand-neptune-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-whatsapp-green-400/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Badge */}
            <Badge variant="outline" className="inline-flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-whatsapp-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-whatsapp-green-500"></span>
              </span>
              Solución especializada para {industry.name}
            </Badge>

            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                WhatsApp Business para{' '}
                <span className="text-brand-neptune-500 dark:text-brand-neptune-400">
                  {industry.name}
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                {industry.description}
              </p>
            </div>

            {/* Key Benefits */}
            <div className="space-y-3">
              {industry.benefits.slice(0, 3).map((benefit) => (
                <motion.div
                  key={benefit.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle className="h-5 w-5 text-whatsapp-green-500 flex-shrink-0" />
                  <span className="text-foreground">
                    <strong className="font-semibold text-brand-neptune-500">
                      {benefit.metric}
                    </strong>{' '}
                    {benefit.title.toLowerCase()}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={onStartTrial}
                className="bg-brand-neptune-500 hover:bg-brand-neptune-600 text-white shadow-brand hover:shadow-brand-lg transition-all"
              >
                Empezar prueba gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onViewDemo}
                className="border-brand-neptune-200 hover:bg-brand-neptune-50 dark:hover:bg-brand-neptune-950"
              >
                <Play className="mr-2 h-4 w-4" />
                Ver demo en vivo
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-whatsapp-green-500" />
                <span className="text-sm text-muted-foreground">Sin tarjeta de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-whatsapp-green-500" />
                <span className="text-sm text-muted-foreground">Configuración en 5 min</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-whatsapp-green-500" />
                <span className="text-sm text-muted-foreground">Soporte 24/7</span>
              </div>
            </div>
          </motion.div>

          {/* Visual/Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {industry.metrics.slice(0, 4).map((metric, index) => (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={cn(
                    'relative bg-card border border-border rounded-xl p-6',
                    'hover:shadow-lg transition-shadow duration-300',
                    index === 0 && 'col-span-2' // First metric spans full width
                  )}
                >
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{metric.metric}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-brand-neptune-500">
                        {metric.after}
                      </span>
                      <span className="text-sm font-medium text-whatsapp-green-500">
                        {metric.improvement}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Antes: {metric.before}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Floating WhatsApp Badge */}
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              className="absolute -top-4 -right-4 bg-whatsapp-green-500 text-white rounded-full p-3 shadow-whatsapp-lg"
            >
              <svg
                className="w-8 h-8"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347z"/>
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}