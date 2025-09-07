/**
 * Success Mosaic Component
 * Displays multiple success stories in a grid layout
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ExternalLink,TrendingUp } from 'lucide-react';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import type { SuccessStory } from '@/modules/marketing/domain/types/evidence.types';

interface SuccessMosaicProps {
  stories: SuccessStory[];
  isInView: boolean;
  className?: string;
  maxStories?: number;
}

export function SuccessMosaic({
  stories,
  isInView,
  className,
  maxStories = 6
}: SuccessMosaicProps) {
  // Limit stories to maxStories
  const displayStories = stories.slice(0, maxStories);

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.7, delay: 0.5 }}
      role="region"
      aria-label="Casos de éxito verificados"
    >
      <div className="text-center mb-12">
        <h3 className="text-2xl lg:text-3xl font-bold text-foreground dark:text-foreground mb-4">
          Empresas que ya multiplican sus ventas con WhatsApp
        </h3>
        <p className="text-muted-foreground dark:text-muted-foreground/80 max-w-2xl mx-auto">
          Resultados verificados de empresas reales en diferentes industrias
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayStories.map((story, index) => (
          <motion.div
            key={story.id}
            className="bg-card dark:bg-card/80 backdrop-blur-sm rounded-xl p-6 border border-border hover:border-primary/50 transition-all hover:shadow-lg group"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            {/* Header with logo and verification */}
            <div className="flex items-start justify-between mb-4">
              {story.logoUrl ? (
                <div className="relative w-20 h-12">
                  <Image
                    src={story.logoUrl}
                    alt={story.company}
                    fill
                    className="object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {story.company.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">
                      {story.company}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {story.industry}
                    </p>
                  </div>
                </div>
              )}
              {story.source.verified && (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                  <span className="text-xs text-green-700 dark:text-green-300 font-medium">
                    Verificado
                  </span>
                </div>
              )}
            </div>

            {/* Metrics */}
            <div className="mb-4">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-bold text-primary">
                  {story.metric}
                </span>
                <span className="text-sm font-semibold text-foreground dark:text-foreground">
                  {story.value}
                </span>
              </div>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground/90 line-clamp-2">
                {story.description}
              </p>
            </div>

            {/* Source and year */}
            <div className="pt-4 border-t border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-xs text-muted-foreground">
                  {story.source.year}
                </span>
              </div>
              <a
                href={story.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                aria-label={`Ver caso completo de ${story.company}`}
              >
                Ver caso
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View all CTA */}
      {stories.length > maxStories && (
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <a
            href="/casos-de-exito"
            className="inline-flex items-center gap-2 px-6 py-3 bg-card hover:bg-card/80 text-foreground font-semibold rounded-lg transition-all border border-border hover:border-primary/50"
          >
            Ver todos los casos de éxito ({stories.length}+)
            <ExternalLink className="w-4 h-4" />
          </a>
        </motion.div>
      )}
    </motion.div>
  );
}