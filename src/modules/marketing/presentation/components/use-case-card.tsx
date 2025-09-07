/**
 * Use Case Card Component
 * Interactive card that displays a use case with hover and selected states
 * Simplified version with always-visible numbers and reduced animations
 */

'use client';

import React from 'react';
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
  index: number; // Para mostrar el número del paso
}

/**
 * Use Case Card Component
 * Tarjeta simplificada con números siempre visibles y animaciones sutiles
 */
export const UseCaseCard = React.memo<UseCaseCardProps>(function UseCaseCard({
  useCase,
  isSelected,
  onClick,
  index
}) {
  const Icon = useCase.icon;
  const PrimaryIcon = useCase.metrics.primary.icon;
  const SecondaryIcon = useCase.metrics.secondary.icon;
  const TertiaryIcon = useCase.metrics.tertiary.icon;

  return (
    <button
      className={`
        w-full text-left p-5 lg:p-6 rounded-2xl border-2
        group relative overflow-hidden
        transition-all duration-200 ease-out
        ${isSelected
          ? 'bg-primary/10 dark:bg-primary/15 border-primary shadow-xl ring-2 ring-primary/30 dark:ring-primary/40'
          : 'bg-card dark:bg-card/50 hover:bg-primary/5 dark:hover:bg-primary/10 border-border dark:border-border/50 hover:border-primary/60 hover:shadow-lg'
        }
      `}
      onClick={onClick}
      role="tab"
      aria-label={`Seleccionar caso de uso: ${useCase.title}`}
      aria-selected={isSelected}
      aria-controls={`panel-${useCase.id}`}
      id={`tab-${useCase.id}`}
    >
      {/* Número del paso - siempre visible */}
      <div className="absolute top-4 lg:top-5 right-4 lg:right-5 z-10">
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
          ${isSelected
            ? 'bg-primary text-white shadow-lg'
            : 'bg-primary/20 text-primary'
          }
          transition-all duration-200
        `}>
          {String(index + 1).padStart(2, '0')}
        </div>
      </div>

      {/* Card Content */}
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={`
              flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
              ${isSelected
                ? 'bg-primary text-white'
                : 'bg-primary/10 text-primary group-hover:bg-primary/20'
              }
              transition-all duration-200
            `}
          >
            <Icon className="w-6 h-6" aria-hidden="true" />
          </div>

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

        {/* Description - Siempre visible */}
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

        {/* Metrics Grid - Siempre visible y expandido */}
        <div className="grid grid-cols-3 gap-2">
          {/* Primary Metric */}
          <div className={`
            flex flex-col items-center p-2.5 rounded-lg transition-all
            ${isSelected
              ? 'bg-primary/10 dark:bg-primary/20'
              : 'bg-muted/50 dark:bg-muted/20 group-hover:bg-muted dark:group-hover:bg-muted/30'
            }
          `}>
            <PrimaryIcon className="w-4 h-4 text-primary mb-1" aria-hidden="true" />
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
            <SecondaryIcon className="w-4 h-4 text-green-600 mb-1" aria-hidden="true" />
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
            <TertiaryIcon className="w-4 h-4 text-blue-600 mb-1" aria-hidden="true" />
            <span className="text-xs font-bold text-foreground dark:text-foreground">
              {useCase.metrics.tertiary.value}
            </span>
            <span className="text-[10px] text-muted-foreground dark:text-muted-foreground/70 text-center">
              {useCase.metrics.tertiary.label}
            </span>
          </div>
        </div>
      </div>

      {/* Indicador sutil de selección */}
      {isSelected && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent -z-10 pointer-events-none" />
      )}
    </button>
  );
});

export default UseCaseCard;