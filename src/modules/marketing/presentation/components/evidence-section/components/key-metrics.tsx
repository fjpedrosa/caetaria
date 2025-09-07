/**
 * Key Metrics Component
 * Displays verified performance metrics with source attribution
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import type { KeyMetric } from '@/modules/marketing/domain/types/evidence.types';

interface KeyMetricsProps {
  metrics: KeyMetric[];
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
    aria-label="Ver fuente externa"
  >
    {children}
    <ExternalLink className="w-3 h-3" aria-hidden="true" />
  </a>
);

export function KeyMetrics({ metrics, isInView, className }: KeyMetricsProps) {
  return (
    <motion.div
      className={cn('grid grid-cols-1 md:grid-cols-3 gap-6', className)}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.7, delay: 0.3 }}
      role="region"
      aria-label="Métricas clave de rendimiento"
    >
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.id}
          className="bg-card dark:bg-card/80 backdrop-blur-sm rounded-xl p-6 border border-border hover:border-primary/50 transition-all hover:shadow-lg group"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
          whileHover={{ y: -5 }}
        >
          {/* Header with icon and source logo */}
          <div className="flex items-start justify-between mb-4">
            <metric.icon className={cn('w-8 h-8', metric.color)} aria-hidden="true" />
            <div className="flex items-center gap-2">
              {metric.source.logoUrl && (
                <div className="relative w-16 h-6 opacity-70 group-hover:opacity-100 transition-opacity">
                  <Image
                    src={metric.source.logoUrl}
                    alt={metric.source.name}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <SourceLink
                href={metric.source.url}
                className="text-xs opacity-70 group-hover:opacity-100"
              >
                Fuente
              </SourceLink>
            </div>
          </div>

          {/* Metric Title */}
          <h3 className="text-sm font-medium text-muted-foreground dark:text-muted-foreground/80 mb-2">
            {metric.title}
          </h3>

          {/* Metric Value and Comparison */}
          <div className="flex items-baseline gap-2">
            <span className={cn('text-3xl font-bold', metric.color)}>
              {metric.value}
            </span>
            {metric.comparison && (
              <span className="text-sm text-muted-foreground dark:text-muted-foreground/70">
                {metric.comparison}
              </span>
            )}
          </div>

          {/* Source Attribution */}
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground dark:text-muted-foreground/60">
              {metric.source.name}
              {metric.source.year && ` • ${metric.source.year}`}
              {metric.source.verified && (
                <span className="ml-1 text-green-600 dark:text-green-400">✓</span>
              )}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}