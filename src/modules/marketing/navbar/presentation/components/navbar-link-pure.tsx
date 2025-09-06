/**
 * Presentation Layer - Pure Navbar Link Component
 *
 * Componente 100% presentacional para enlaces del navbar.
 * Usa AnimatedLink internamente pero sin lógica propia.
 *
 * Principios aplicados:
 * - Single Responsibility: Solo renderiza enlaces
 * - Open/Closed: Extensible via props sin modificación
 * - Dependency Inversion: No depende de lógica de negocio
 */

import React from 'react';

import { cn } from '@/lib/utils';
import { AnimatedLink } from '@/shared/components/ui/animated-link';

export interface NavbarLinkPureProps {
  // Contenido y navegación
  href: string;
  children: React.ReactNode;

  // Estados visuales (controlados externamente)
  isActive?: boolean;
  isHovered?: boolean;
  isFocused?: boolean;
  isPrefetching?: boolean;

  // Variantes visuales
  variant?: 'default' | 'button' | 'cta-primary' | 'cta-secondary';

  // Comportamiento (props puras, sin lógica)
  external?: boolean;
  prefetch?: boolean;

  // Event handlers (pasados desde container)
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;

  // Personalización
  className?: string;
  activeClassName?: string;
  hoverClassName?: string;

  // Indicadores visuales
  badge?: string | number;
  icon?: React.ReactNode;
  showExternalIcon?: boolean;

  // Accesibilidad
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaCurrent?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false';
  role?: string;
  tabIndex?: number;
}

export const NavbarLinkPure: React.FC<NavbarLinkPureProps> = ({
  href,
  children,
  isActive = false,
  isHovered = false,
  isFocused = false,
  isPrefetching = false,
  variant = 'default',
  external = false,
  prefetch = true,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onFocus,
  onBlur,
  className,
  activeClassName,
  hoverClassName,
  badge,
  icon,
  showExternalIcon = false,
  ariaLabel,
  ariaDescribedBy,
  ariaCurrent,
  role = 'link',
  tabIndex
}) => {
  // Clases dinámicas basadas en estados (sin lógica, solo renderizado)
  const linkClasses = cn(
    'relative inline-flex items-center gap-2 transition-all duration-200',

    // Estado activo
    isActive && (activeClassName || 'text-yellow-400 font-semibold'),

    // Estado hover (controlado desde fuera)
    isHovered && (hoverClassName || 'text-white'),

    // Estado focus
    isFocused && 'ring-2 ring-yellow-400/50 ring-offset-2',

    // Estado prefetching
    isPrefetching && 'opacity-70 cursor-wait',

    // Clases custom
    className
  );

  // Contenido del link (puro renderizado)
  const linkContent = (
    <>
      {/* Icono opcional */}
      {icon && (
        <span className="flex-shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}

      {/* Contenido principal */}
      <span className="relative">
        {children}

        {/* Indicador de activo (visual only) */}
        {isActive && (
          <span
            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-yellow-400 rounded-full"
            aria-hidden="true"
          />
        )}
      </span>

      {/* Badge opcional */}
      {badge && (
        <span
          className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-yellow-400/20 text-yellow-400 rounded-full"
          aria-label={`${badge} items`}
        >
          {badge}
        </span>
      )}

      {/* Indicador de link externo */}
      {external && showExternalIcon && (
        <svg
          className="w-3 h-3 opacity-60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      )}

      {/* Screen reader text para links externos */}
      {external && (
        <span className="sr-only">(opens in new tab)</span>
      )}
    </>
  );

  // Para variantes de botón CTA, usar AnimatedLink directamente
  if (variant === 'cta-primary' || variant === 'cta-secondary') {
    return (
      <AnimatedLink
        href={href}
        className={linkClasses}
        variant={variant}
        external={external}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onFocus={onFocus}
        onBlur={onBlur}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-current={isActive ? ariaCurrent || 'page' : undefined}
        data-prefetch={prefetch ? 'true' : 'false'}
        data-prefetching={isPrefetching ? 'true' : 'false'}
      >
        {linkContent}
      </AnimatedLink>
    );
  }

  // Para enlaces normales y botones
  return (
    <AnimatedLink
      href={href}
      className={linkClasses}
      variant={variant}
      external={external}
      enableUnderline={variant === 'default'}
      enableFontWeightChange={variant === 'default' || variant === 'button'}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-current={isActive ? ariaCurrent || 'page' : undefined}
      data-prefetch={prefetch ? 'true' : 'false'}
      data-prefetching={isPrefetching ? 'true' : 'false'}
    >
      {linkContent}
    </AnimatedLink>
  );
};

NavbarLinkPure.displayName = 'NavbarLinkPure';