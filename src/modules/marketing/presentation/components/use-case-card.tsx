/**
 * Use Case Card Component
 * Interactive card that displays a use case with hover and selected states
 * Inspired by Canny.io card design pattern
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface UseCaseMetric {
  label: string;
  value: string;
  icon: LucideIcon;
  color?: string;
}

interface UseCaseCategory {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  metrics: {
    primary: UseCaseMetric;
    secondary: UseCaseMetric;
    tertiary: UseCaseMetric;
  };
  scenario?: any;
}

interface UseCaseCardProps {
  useCase: UseCaseCategory;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * Use Case Card Component
 * Interactive card with smooth animations and clear visual hierarchy
 */
export const UseCaseCard = React.memo<UseCaseCardProps>(function UseCaseCard({
  useCase,
  isSelected,
  onClick
}) {
  const Icon = useCase.icon;
  const PrimaryIcon = useCase.metrics.primary.icon;
  const SecondaryIcon = useCase.metrics.secondary.icon;
  const TertiaryIcon = useCase.metrics.tertiary.icon;

  return (
    <motion.button
      className={`
        w-full text-left p-5 lg:p-6 rounded-2xl border-2
        group relative overflow-hidden
        transform transition-all duration-200 ease-out
        hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl
        ${isSelected
          ? 'bg-primary/10 dark:bg-primary/15 border-primary shadow-xl ring-2 ring-primary/30 dark:ring-primary/40'
          : 'bg-card dark:bg-card/50 hover:bg-primary/5 dark:hover:bg-primary/10 border-border dark:border-border/50 hover:border-primary/60'
        }
      `}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      role="tab"
      aria-label={`Seleccionar caso de uso: ${useCase.title}`}
      aria-selected={isSelected}
      aria-controls={`panel-${useCase.id}`}
      id={`tab-${useCase.id}`}
    >
      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          className="absolute top-4 lg:top-5 right-4 lg:right-5 z-10"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div className="w-7 h-7 rounded-full bg-primary dark:bg-primary flex items-center justify-center shadow-md">
            <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </motion.div>
      )}

      {/* Card Content */}
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Icon */}
          <motion.div
            className={`
              flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
              ${isSelected
                ? 'bg-primary dark:bg-primary text-primary-foreground'
                : 'bg-muted dark:bg-muted/30 text-muted-foreground dark:text-muted-foreground group-hover:bg-primary/10 dark:group-hover:bg-primary/20 group-hover:text-primary'
              }
              transition-all duration-200
            `}
            animate={isSelected ? { rotate: [0, -5, 5, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            <Icon className="w-6 h-6" aria-hidden="true" />
          </motion.div>

          {/* Title and Subtitle */}
          <div className="flex-1 min-w-0 pr-8">
            <h4 className={`
              font-bold text-base lg:text-lg mb-1 
              ${isSelected
                ? 'text-primary dark:text-primary'
                : 'text-foreground dark:text-foreground group-hover:text-primary dark:group-hover:text-primary'
              }
              transition-colors duration-200
            `}>
              {useCase.title}
            </h4>
            <p className="text-xs font-medium text-muted-foreground dark:text-muted-foreground/70 uppercase tracking-wider">
              {useCase.subtitle}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className={`
          text-sm lg:text-[15px] leading-relaxed
          ${isSelected
            ? 'text-foreground/90 dark:text-foreground/80'
            : 'text-muted-foreground dark:text-muted-foreground/90'
          }
          transition-colors duration-200
        `}>
          {useCase.description}
        </p>

        {/* Metrics Grid */}
        <motion.div
          className="grid grid-cols-3 gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          {/* Primary Metric */}
          <div className={`
            flex flex-col items-center p-2.5 rounded-lg transition-all
            ${isSelected
              ? 'bg-primary/10 dark:bg-primary/20'
              : 'bg-muted/50 dark:bg-muted/20 group-hover:bg-muted dark:group-hover:bg-muted/30'
            }
          `}>
            <PrimaryIcon className="w-4 h-4 text-primary dark:text-primary mb-1" aria-hidden="true" />
            <span className="text-xs font-bold text-foreground dark:text-foreground">
              {useCase.metrics.primary.value}
            </span>
            <span className="text-[10px] text-muted-foreground dark:text-muted-foreground/70 text-center">
              {useCase.metrics.primary.label}
            </span>
          </div>

          {/* Secondary Metric */}
          <div className={`
            flex flex-col items-center p-2.5 rounded-lg transition-all
            ${isSelected
              ? 'bg-green-500/10 dark:bg-green-500/20'
              : 'bg-muted/50 dark:bg-muted/20 group-hover:bg-muted dark:group-hover:bg-muted/30'
            }
          `}>
            <SecondaryIcon className="w-4 h-4 text-green-600 dark:text-green-500 mb-1" aria-hidden="true" />
            <span className="text-xs font-bold text-foreground dark:text-foreground">
              {useCase.metrics.secondary.value}
            </span>
            <span className="text-[10px] text-muted-foreground dark:text-muted-foreground/70 text-center">
              {useCase.metrics.secondary.label}
            </span>
          </div>

          {/* Tertiary Metric */}
          <div className={`
            flex flex-col items-center p-2.5 rounded-lg transition-all
            ${isSelected
              ? 'bg-blue-500/10 dark:bg-blue-500/20'
              : 'bg-muted/50 dark:bg-muted/20 group-hover:bg-muted dark:group-hover:bg-muted/30'
            }
          `}>
            <TertiaryIcon className="w-4 h-4 text-blue-600 dark:text-blue-500 mb-1" aria-hidden="true" />
            <span className="text-xs font-bold text-foreground dark:text-foreground">
              {useCase.metrics.tertiary.value}
            </span>
            <span className="text-[10px] text-muted-foreground dark:text-muted-foreground/70 text-center">
              {useCase.metrics.tertiary.label}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Hover Effect Background - Improved for dark mode */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent dark:from-primary/10 dark:via-primary/5 dark:to-transparent opacity-0 group-hover:opacity-100 pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 0.5 }}
        transition={{ duration: 0.3 }}
      />

      {/* Selection Effect Background */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 -z-10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  );
});

export default UseCaseCard;