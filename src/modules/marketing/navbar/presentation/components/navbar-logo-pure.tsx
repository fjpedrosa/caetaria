/**
 * Presentation Layer - Pure Navbar Logo Component
 *
 * Componente 100% presentacional sin lógica interna.
 * Todas las props son controladas desde el exterior.
 *
 * Principios aplicados:
 * - Single Responsibility: Solo renderiza el logo
 * - Interface Segregation: Props específicas y necesarias
 * - Dependency Inversion: No depende de lógica de negocio
 */

import React from 'react';

import { cn } from '@/lib/utils';

export interface NavbarLogoPureProps {
  // Contenido visual
  src?: string;
  alt?: string;
  text?: string;
  subtitle?: string;
  icon?: React.ReactNode;

  // Comportamiento controlado
  href?: string;
  onClick?: () => void;

  // Estados visuales (controlados externamente)
  isHovered?: boolean;
  isFocused?: boolean;
  isActive?: boolean;

  // Personalización de estilos
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  subtitleClassName?: string;

  // Accesibilidad
  ariaLabel?: string;
  role?: string;
}

export const NavbarLogoPure: React.FC<NavbarLogoPureProps> = ({
  src,
  alt,
  text,
  subtitle,
  icon,
  href,
  onClick,
  isHovered = false,
  isFocused = false,
  isActive = false,
  className,
  iconClassName,
  textClassName,
  subtitleClassName,
  ariaLabel,
  role = 'img'
}) => {
  // Renderizado del contenido interno (sin lógica)
  const content = (
    <>
      {/* Icono o imagen del logo */}
      {(icon || src) && (
        <div
          className={cn(
            'flex items-center justify-center transition-all duration-200',
            iconClassName
          )}
          role={role}
          aria-hidden={!ariaLabel}
        >
          {icon || (src && <img src={src} alt={alt || text || 'Logo'} className="w-full h-full object-contain" />)}
        </div>
      )}

      {/* Texto del logo */}
      {(text || subtitle) && (
        <div className="flex flex-col">
          {text && (
            <span
              className={cn(
                'transition-all duration-200',
                textClassName
              )}
            >
              {text}
            </span>
          )}
          {subtitle && (
            <span
              className={cn(
                'transition-colors duration-200',
                subtitleClassName
              )}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </>
  );

  // Si tiene onClick, renderizar como button
  if (onClick && !href) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'flex items-center focus:outline-none',
          className
        )}
        aria-label={ariaLabel || `${text || 'Logo'} - Navigate to home`}
      >
        {content}
      </button>
    );
  }

  // Si tiene href, renderizar como anchor
  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={cn(
          'flex items-center focus:outline-none',
          className
        )}
        aria-label={ariaLabel || `${text || 'Logo'} - Navigate to ${href}`}
      >
        {content}
      </a>
    );
  }

  // Por defecto, renderizar como div
  return (
    <div
      className={cn(
        'flex items-center',
        className
      )}
      role={role}
      aria-label={ariaLabel}
    >
      {content}
    </div>
  );
};

NavbarLogoPure.displayName = 'NavbarLogoPure';