/**
 * Success Carousel Component
 * Displays verified success stories with navigation
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle, ChevronLeft, ChevronRight, ExternalLink,TrendingUp } from 'lucide-react';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import type { SuccessStory } from '@/modules/marketing/domain/types/evidence.types';

interface SuccessCarouselProps {
  stories: SuccessStory[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onGoTo: (index: number) => void;
  isInView: boolean;
  className?: string;
}

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

export function SuccessCarousel({
  stories,
  currentIndex,
  onNext,
  onPrev,
  onGoTo,
  isInView,
  className
}: SuccessCarouselProps) {
  const currentStory = stories[currentIndex];

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.7, delay: 0.5 }}
      role="region"
      aria-label="Casos de éxito verificados"
    >
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-foreground dark:text-foreground">
          Casos de Éxito Verificados
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onPrev}
            className="p-2 rounded-lg bg-card dark:bg-card/80 border border-border hover:border-primary/50 transition-colors"
            aria-label="Historia anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onNext}
            className="p-2 rounded-lg bg-card dark:bg-card/80 border border-border hover:border-primary/50 transition-colors"
            aria-label="Siguiente historia"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <motion.div
        key={currentIndex}
        className="bg-gradient-to-br from-card to-card/50 dark:from-card/80 dark:to-card/40 rounded-xl p-8 border border-border"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="grid md:grid-cols-2 gap-8">
          {/* Story Details */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                {currentStory.logoUrl && (
                  <div className="relative w-20 h-12">
                    <Image
                      src={currentStory.logoUrl}
                      alt={currentStory.company}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <div>
                  <h4 className="text-xl font-bold text-foreground dark:text-foreground">
                    {currentStory.company}
                  </h4>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground/80">
                    {currentStory.industry}
                  </p>
                </div>
              </div>
              {currentStory.source.verified && (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                  <span className="text-xs text-green-700 dark:text-green-300 font-medium">
                    Verificado
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-primary">
                  {currentStory.metric}
                </span>
                <span className="text-xl font-semibold text-foreground dark:text-foreground">
                  {currentStory.value}
                </span>
              </div>

              <p className="text-muted-foreground dark:text-muted-foreground/90">
                {currentStory.description}
              </p>

              <div className="pt-4 border-t border-border/50">
                {currentStory.source.logoUrl && (
                  <div className="relative w-16 h-6 mb-2 opacity-70">
                    <Image
                      src={currentStory.source.logoUrl}
                      alt={currentStory.source.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <SourceLink
                  href={currentStory.source.url}
                  className="text-sm font-medium"
                >
                  Ver caso completo
                </SourceLink>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground/60 mt-1">
                  {currentStory.source.name} • {currentStory.source.year}
                </p>
              </div>
            </div>
          </div>

          {/* Visual Impact */}
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 dark:bg-primary/20 mb-4">
                <Award className="w-12 h-12 text-primary" />
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    ROI Comprobado
                  </span>
                </div>
                <div className="text-xs text-muted-foreground dark:text-muted-foreground/60">
                  Resultados en {currentStory.source.year}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {stories.map((_, index) => (
            <button
              key={index}
              onClick={() => onGoTo(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                index === currentIndex
                  ? 'w-8 bg-primary'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              )}
              aria-label={`Ir a historia ${index + 1}`}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}