/**
 * Presentation Layer - Pure Navbar CTA Component
 *
 * Componente 100% presentacional para botones de acción (CTA).
 * Sin estado interno ni lógica de negocio.
 *
 * Principios aplicados:
 * - Single Responsibility: Solo renderiza CTAs
 * - Interface Segregation: Props mínimas y específicas
 * - Dependency Inversion: Controlado completamente desde fuera
 */

import React from 'react';

import { cn } from '@/lib/utils';

export interface NavbarCTAPureProps {
  // Contenido
  children: React.ReactNode;
  href?: string;

  // Variantes visuales
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';

  // Estados visuales (controlados externamente)
  isHovered?: boolean;
  isFocused?: boolean;
  isPressed?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;

  // Event handlers (sin lógica)
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onMouseDown?: () => void;
  onMouseUp?: () => void;

  // Elementos visuales adicionales
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loadingText?: string;

  // Personalización
  className?: string;
  style?: React.CSSProperties;

  // Accesibilidad
  ariaLabel?: string;
  ariaPressed?: boolean;
  ariaExpanded?: boolean;
  ariaDescribedBy?: string;
  role?: string;
  tabIndex?: number;
  id?: string;
}

// Configuración de variantes (sin lógica, solo estilos)
const variantStyles = {
  primary: {
    base: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 hover:from-yellow-500 hover:to-yellow-600 shadow-lg hover:shadow-xl hover:shadow-yellow-500/25',
    hover: 'hover:scale-105',
    active: 'active:scale-95',
    focus: 'focus:ring-yellow-500/50'
  },
  secondary: {
    base: 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm',
    hover: 'hover:scale-102',
    active: 'active:scale-98',
    focus: 'focus:ring-white/50'
  },
  ghost: {
    base: 'text-slate-300 hover:text-white hover:bg-white/10',
    hover: 'hover:scale-102',
    active: 'active:scale-98',
    focus: 'focus:ring-white/30'
  },
  outline: {
    base: 'border border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10 hover:border-yellow-400',
    hover: 'hover:scale-102',
    active: 'active:scale-98',
    focus: 'focus:ring-yellow-400/50'
  }
};

// Configuración de tamaños (sin lógica, solo estilos)
const sizeStyles = {
  sm: 'px-3 py-2 text-sm min-h-[36px]',
  md: 'px-4 py-2.5 text-sm min-h-[40px]',
  lg: 'px-6 py-3 text-base min-h-[44px]'
};

export const NavbarCTAPure: React.FC<NavbarCTAPureProps> = ({
  children,
  href,
  variant = 'primary',
  size = 'md',
  isHovered = false,
  isFocused = false,
  isPressed = false,
  isLoading = false,
  isDisabled = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onMouseDown,
  onMouseUp,
  icon,
  iconPosition = 'left',
  loadingText = 'Loading...',
  className,
  style,
  ariaLabel,
  ariaPressed,
  ariaExpanded,
  ariaDescribedBy,
  role = 'button',
  tabIndex = 0,
  id
}) => {
  // Clases computadas (sin lógica, solo composición de estilos)
  const buttonClasses = cn(
    // Base styles
    'relative inline-flex items-center justify-center gap-2',
    'font-semibold rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'select-none touch-manipulation',

    // Tamaño
    sizeStyles[size],

    // Variante
    variantStyles[variant].base,
    variantStyles[variant].focus,

    // Estados visuales (sin translate vertical como se pidió)
    !isDisabled && !isLoading && [
      variantStyles[variant].hover,
      variantStyles[variant].active
    ],

    // Estado pressed
    isPressed && 'scale-95',

    // Estado disabled
    (isDisabled || isLoading) && 'opacity-50 cursor-not-allowed',

    // Clases custom
    className
  );

  // Contenido del botón (puro renderizado)
  const buttonContent = (
    <>
      {/* Loading spinner */}
      {isLoading && (
        <span
          className="absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <svg
            className="animate-spin h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}

      {/* Contenido principal */}
      <span
        className={cn(
          'flex items-center gap-2',
          isLoading && 'invisible'
        )}
      >
        {/* Icono izquierdo */}
        {icon && iconPosition === 'left' && (
          <span className="flex-shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}

        {/* Texto */}
        <span>{isLoading && loadingText ? loadingText : children}</span>

        {/* Icono derecho */}
        {icon && iconPosition === 'right' && (
          <span className="flex-shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
      </span>

      {/* Efecto de ripple visual (opcional, sin lógica) */}
      {isPressed && variant === 'primary' && (
        <span
          className="absolute inset-0 rounded-lg bg-white/20 animate-pulse"
          aria-hidden="true"
        />
      )}
    </>
  );

  // Props comunes para button y anchor
  const commonProps = {
    className: buttonClasses,
    style,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    onMouseDown,
    onMouseUp,
    'aria-label': ariaLabel,
    'aria-pressed': ariaPressed,
    'aria-expanded': ariaExpanded,
    'aria-describedby': ariaDescribedBy,
    'aria-busy': isLoading,
    'aria-disabled': isDisabled,
    role,
    tabIndex: isDisabled ? -1 : tabIndex,
    id
  };

  // Si tiene href, renderizar como anchor
  if (href && !isDisabled && !isLoading) {
    return (
      <a
        href={href}
        onClick={onClick}
        {...commonProps}
      >
        {buttonContent}
      </a>
    );
  }

  // Por defecto, renderizar como button
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled || isLoading}
      {...commonProps}
    >
      {buttonContent}
    </button>
  );
};

NavbarCTAPure.displayName = 'NavbarCTAPure';