/**
 * Evidence Section Component - Refactored Version
 * Clean Architecture implementation with modular components
 */

'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight,Calculator, Shield } from 'lucide-react';

// Application imports
import { useRegion } from '@/modules/marketing/application/contexts/region-context';
// Domain imports
import { KEY_METRICS } from '@/modules/marketing/domain/data/evidence-metrics.data';
import {
  CHANNEL_COMPARISON,
  REGIONAL_MARKET_DATA} from '@/modules/marketing/domain/data/evidence-regional.data';
import { SUCCESS_STORIES } from '@/modules/marketing/domain/data/evidence-stories.data';

import { ChannelComparison } from './components/channel-comparison';
// Component imports
import { KeyMetrics } from './components/key-metrics';
import { RegionalMarket } from './components/regional-market';
import { SuccessMosaic } from './components/success-mosaic';

/**
 * Main Evidence Section Component
 * Now with dynamic regional personalization
 */
export function EvidenceSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  // Use regional context for personalized data
  const { currentRegion, marketData, isLoading } = useRegion();

  // Get regional data based on user's detected/selected region
  const regionalData = marketData || REGIONAL_MARKET_DATA[currentRegion] || REGIONAL_MARKET_DATA.spain;

  return (
    <section
      ref={ref}
      className="py-16 lg:py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden"
      aria-label="Evidencia del impacto de WhatsApp Business"
    >
      {/* Background decorative elements - simplified */}
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
        {/* Section Header - Simplified */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-full mb-6">
            <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-green-700 dark:text-green-300 font-semibold text-sm">
              Datos Verificados ✓
            </span>
          </div>

          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground dark:text-foreground mb-6">
            {currentRegion === 'spain'
              ? 'El 73% de tus clientes ya están en WhatsApp.'
              : currentRegion === 'latam'
              ? 'El 78% de tus clientes ya están en WhatsApp.'
              : currentRegion === 'usa'
              ? '65% of your customers are already on WhatsApp.'
              : currentRegion === 'europe'
              ? '70% of your customers are already on WhatsApp.'
              : currentRegion === 'asia'
              ? '85% of your customers are already on WhatsApp.'
              : 'El 73% de tus clientes ya están en WhatsApp.'}
            <span className="block text-2xl lg:text-3xl xl:text-4xl mt-3 text-primary">
              {currentRegion === 'usa' || currentRegion === 'europe' || currentRegion === 'asia'
                ? 'How businesses like yours multiply their sales'
                : 'Así multiplican sus ventas las empresas que lo aprovechan'}
            </span>
          </h2>

          <p className="text-lg lg:text-xl text-muted-foreground dark:text-muted-foreground/90 max-w-3xl mx-auto leading-relaxed">
            {currentRegion === 'usa' || currentRegion === 'europe' || currentRegion === 'asia'
              ? <>Real results from businesses like yours. Every data point is<span className="font-semibold text-foreground dark:text-foreground"> verified and documented</span>, with links to original sources.</>
              : <>Resultados reales de empresas como la tuya. Cada dato está<span className="font-semibold text-foreground dark:text-foreground"> verificado y documentado</span>, con enlaces a las fuentes originales.</>}
          </p>
        </motion.div>

        {/* Key Metrics - Now with logos */}
        <KeyMetrics
          metrics={KEY_METRICS}
          isInView={isInView}
          className="mb-16"
        />

        {/* Channel Comparison - Unified view */}
        <ChannelComparison
          data={CHANNEL_COMPARISON}
          isInView={isInView}
          className="mb-16"
          showAsUnified={true}
        />

        {/* Success Stories Mosaic */}
        <SuccessMosaic
          stories={SUCCESS_STORIES}
          isInView={isInView}
          className="mb-16"
          maxStories={6}
        />

        {/* Regional Market Data */}
        <RegionalMarket
          data={regionalData}
          isInView={isInView}
          className="mb-16"
        />

        {/* CTA Section - Simplified */}
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
                ¿Listo para multiplicar tus ventas?
              </h3>
              <p className="text-muted-foreground dark:text-muted-foreground/90 mb-6 max-w-2xl mx-auto">
                Únete a más de 2.400 negocios españoles que ya no pierden clientes
                por no contestar a tiempo
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all hover:scale-105 active:scale-95">
                  Empezar ahora gratis
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="/casos-de-exito"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-card hover:bg-card/80 text-foreground font-semibold rounded-lg transition-all border border-border hover:border-primary/50"
                >
                  Ver más casos de éxito
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}