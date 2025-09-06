/**
 * Presentation Layer - Pure Navbar Progress Bar Component
 *
 * Componente 100% presentacional para la barra de progreso.
 * Sin cálculos internos ni estado, todo controlado por props.
 *
 * Principios aplicados:
 * - Single Responsibility: Solo renderiza la barra de progreso
 * - Open/Closed: Extensible via props sin modificación
 * - Dependency Inversion: No calcula progreso, solo lo muestra
 */

import React from 'react';

import { cn } from '@/lib/utils';

export interface NavbarProgressBarPureProps {
  // Valor del progreso (0-100, calculado externamente)
  progress: number;

  // Control de visibilidad
  visible?: boolean;

  // Dimensiones
  height?: number | string;
  width?: number | string;

  // Variantes visuales
  variant?: 'linear' | 'stepped' | 'segmented';

  // Colores (controlados desde fuera)
  backgroundColor?: string;
  progressColor?: string;

  // Secciones para variante segmentada
  segments?: Array<{
    id: string;
    label: string;
    progress: number; // 0-100 para cada segmento
    isActive?: boolean;
    isCompleted?: boolean;
  }>;

  // Animación (controlada desde fuera)
  animated?: boolean;
  animationDuration?: number;

  // Indicadores visuales
  showPercentage?: boolean;
  showMilestones?: boolean;
  milestones?: number[]; // Ej: [25, 50, 75, 100]

  // Personalización
  className?: string;
  progressClassName?: string;
  containerClassName?: string;

  // Accesibilidad
  ariaLabel?: string;
  ariaValueNow?: number;
  ariaValueMin?: number;
  ariaValueMax?: number;
  role?: string;
}

export const NavbarProgressBarPure: React.FC<NavbarProgressBarPureProps> = ({
  progress,
  visible = true,
  height = 4,
  width = '100%',
  variant = 'linear',
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  progressColor = 'rgb(250, 204, 21)', // yellow-400
  segments = [],
  animated = true,
  animationDuration = 300,
  showPercentage = false,
  showMilestones = false,
  milestones = [25, 50, 75, 100],
  className,
  progressClassName,
  containerClassName,
  ariaLabel = 'Navigation progress',
  ariaValueNow,
  ariaValueMin = 0,
  ariaValueMax = 100,
  role = 'progressbar'
}) => {
  // No mostrar si no está visible
  if (!visible) return null;

  // Asegurar que el progreso esté entre 0 y 100 (sin lógica, solo validación de renderizado)
  const safeProgress = Math.min(100, Math.max(0, progress));

  // Renderizado según variante
  switch (variant) {
    case 'segmented':
      return (
        <div
          className={cn(
            'relative w-full',
            containerClassName,
            className
          )}
          style={{ width, height }}
          role={role}
          aria-label={ariaLabel}
          aria-valuenow={ariaValueNow || safeProgress}
          aria-valuemin={ariaValueMin}
          aria-valuemax={ariaValueMax}
        >
          <div className="flex gap-1 h-full">
            {segments.map((segment) => (
              <div
                key={segment.id}
                className="relative flex-1 overflow-hidden rounded-sm"
                style={{ backgroundColor }}
              >
                {/* Progreso del segmento */}
                <div
                  className={cn(
                    'absolute inset-y-0 left-0 rounded-sm',
                    animated && 'transition-all ease-out',
                    segment.isActive && 'animate-pulse',
                    progressClassName
                  )}
                  style={{
                    width: `${segment.progress}%`,
                    backgroundColor: segment.isCompleted
                      ? progressColor
                      : segment.isActive
                        ? progressColor
                        : `${progressColor}66`, // 40% opacity
                    transitionDuration: animated ? `${animationDuration}ms` : '0ms'
                  }}
                />

                {/* Label del segmento (opcional) */}
                {segment.label && (
                  <span className="sr-only">
                    {segment.label}: {segment.progress}% complete
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case 'stepped':
      return (
        <div
          className={cn(
            'relative',
            containerClassName,
            className
          )}
          style={{ width, height }}
          role={role}
          aria-label={ariaLabel}
          aria-valuenow={ariaValueNow || safeProgress}
          aria-valuemin={ariaValueMin}
          aria-valuemax={ariaValueMax}
        >
          {/* Fondo con steps */}
          <div
            className="absolute inset-0 rounded-full overflow-hidden"
            style={{ backgroundColor }}
          >
            {/* Milestones markers */}
            {showMilestones && milestones.map((milestone) => (
              <div
                key={milestone}
                className="absolute top-0 bottom-0 w-px bg-white/20"
                style={{ left: `${milestone}%` }}
                aria-hidden="true"
              />
            ))}
          </div>

          {/* Barra de progreso */}
          <div
            className={cn(
              'absolute inset-y-0 left-0 rounded-full',
              animated && 'transition-all ease-out',
              progressClassName
            )}
            style={{
              width: `${safeProgress}%`,
              backgroundColor: progressColor,
              transitionDuration: animated ? `${animationDuration}ms` : '0ms'
            }}
          />

          {/* Indicador de porcentaje */}
          {showPercentage && (
            <div
              className="absolute top-1/2 -translate-y-1/2 text-xs font-medium text-white"
              style={{ left: `${safeProgress}%`, transform: 'translateX(-50%) translateY(-50%)' }}
              aria-hidden="true"
            >
              {Math.round(safeProgress)}%
            </div>
          )}
        </div>
      );

    case 'linear':
    default:
      return (
        <div
          className={cn(
            'relative overflow-hidden',
            containerClassName,
            className
          )}
          style={{ width, height }}
          role={role}
          aria-label={ariaLabel}
          aria-valuenow={ariaValueNow || safeProgress}
          aria-valuemin={ariaValueMin}
          aria-valuemax={ariaValueMax}
        >
          {/* Fondo de la barra */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor }}
            aria-hidden="true"
          />

          {/* Barra de progreso */}
          <div
            className={cn(
              'absolute inset-y-0 left-0',
              animated && 'transition-all ease-out',
              progressClassName
            )}
            style={{
              width: `${safeProgress}%`,
              backgroundColor: progressColor,
              transitionDuration: animated ? `${animationDuration}ms` : '0ms'
            }}
          >
            {/* Efecto de brillo (opcional, solo visual) */}
            {animated && safeProgress > 0 && safeProgress < 100 && (
              <div
                className="absolute inset-y-0 right-0 w-8 bg-gradient-to-r from-transparent to-white/20 animate-shimmer"
                aria-hidden="true"
              />
            )}
          </div>

          {/* Milestones markers */}
          {showMilestones && milestones.map((milestone) => (
            <div
              key={milestone}
              className={cn(
                'absolute top-0 bottom-0 w-px transition-opacity duration-300',
                safeProgress >= milestone ? 'bg-white/40' : 'bg-white/20'
              )}
              style={{ left: `${milestone}%` }}
              aria-hidden="true"
            />
          ))}

          {/* Porcentaje flotante */}
          {showPercentage && safeProgress > 0 && (
            <div
              className="absolute top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs font-medium bg-black/50 text-white rounded backdrop-blur-sm"
              style={{
                left: `${Math.min(90, safeProgress)}%`,
                transform: 'translateX(-50%) translateY(-50%)'
              }}
              aria-hidden="true"
            >
              {Math.round(safeProgress)}%
            </div>
          )}
        </div>
      );
  }
};

NavbarProgressBarPure.displayName = 'NavbarProgressBarPure';