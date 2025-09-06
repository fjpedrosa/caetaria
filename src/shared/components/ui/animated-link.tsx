/**
 * Componente AnimatedLink optimizado para navbar
 * Aplica automáticamente las microanimaciones del sistema
 */
'use client';

import React, { forwardRef, useEffect, useRef } from 'react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { useTextAnimations } from '@/shared/hooks/use-text-animations';

interface AnimatedLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'button' | 'cta-primary' | 'cta-secondary';
  enableUnderline?: boolean;
  enableFontWeightChange?: boolean;
  external?: boolean;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  onMouseEnter?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLAncearElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLAnchorElement>) => void;
  'aria-label'?: string;
  'data-testid'?: string;
}

// Variantes de estilos predefinidas
const linkVariants = {
  default: 'nav-link text-foreground hover:text-primary focus-visible:text-primary',
  button: 'nav-link--button text-foreground hover:text-primary focus-visible:text-primary hover:bg-accent focus-visible:bg-accent',
  'cta-primary': 'cta-button cta-button--primary',
  'cta-secondary': 'cta-button cta-button--secondary'
};

export const AnimatedLink = forwardRef<HTMLAnchorElement, AnimatedLinkProps>(({
  href,
  children,
  className,
  variant = 'default',
  enableUnderline = variant === 'default',
  enableFontWeightChange = variant === 'default' || variant === 'button',
  external = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  'aria-label': ariaLabel,
  'data-testid': testId,
  ...props
}, ref) => {
  const internalRef = useRef<HTMLAnchorElement>(null);
  const linkRef = (ref as React.RefObject<HTMLAnchorElement>) || internalRef;
  const { setupTextAnimation } = useTextAnimations();

  // Configurar animaciones al montar
  useEffect(() => {
    const element = linkRef.current;
    if (!element) return;

    const cleanup = setupTextAnimation(element, {
      enableUnderline,
      fontWeightChange: enableFontWeightChange,
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    });

    return cleanup;
  }, [setupTextAnimation, enableUnderline, enableFontWeightChange]);

  // Handlers optimizados
  const handleMouseEnter = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const element = event.currentTarget;

    // Aplicar optimizaciones de performance solo cuando necesario
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Solo activar will-change para las propiedades que realmente cambiarán
      if (enableUnderline) {
        element.style.willChange = 'transform';
      }
      if (variant === 'button' || variant.startsWith('cta-')) {
        element.style.willChange = element.style.willChange
          ? `${element.style.willChange}, background-color`
          : 'background-color';
      }
    }

    onMouseEnter?.(event);
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const element = event.currentTarget;

    // Limpiar optimizaciones después de la animación
    setTimeout(() => {
      element.style.willChange = 'auto';
    }, 300); // Duración de la animación

    onMouseLeave?.(event);
  };

  const handleFocus = (event: React.FocusEvent<HTMLAnchorElement>) => {
    const element = event.currentTarget;

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Solo activar will-change para las propiedades que realmente cambiarán
      if (enableUnderline) {
        element.style.willChange = 'transform';
      }
      if (variant === 'button' || variant.startsWith('cta-')) {
        element.style.willChange = element.style.willChange
          ? `${element.style.willChange}, background-color`
          : 'background-color';
      }
    }

    onFocus?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLAnchorElement>) => {
    const element = event.currentTarget;

    setTimeout(() => {
      element.style.willChange = 'auto';
    }, 300); // Duración de la animación

    onBlur?.(event);
  };

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const element = event.currentTarget;

    // Animación de press para botones CTA
    if (variant.startsWith('cta-')) {
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        element.style.transform = 'scale(0.98)';

        setTimeout(() => {
          element.style.transform = '';
        }, 150);
      }
    }

    onClick?.(event);
  };

  // Clases combinadas
  const combinedClassName = cn(
    'relative inline-flex items-center justify-center',
    'transition-all duration-200 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
    'touch-manipulation', // Optimización para móvil
    linkVariants[variant],
    className
  );

  // Props comunes para ambos tipos de link
  const commonProps = {
    ref: linkRef,
    className: combinedClassName,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onClick: handleClick,
    'aria-label': ariaLabel,
    'data-testid': testId,
    ...props
  };

  // Link externo
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        {...commonProps}
      >
        {children}
      </a>
    );
  }

  // Next.js Link interno
  return (
    <Link href={href} {...commonProps}>
      {children}
    </Link>
  );
});

AnimatedLink.displayName = 'AnimatedLink';

/**
 * Componente específico para mega menús con animaciones optimizadas
 */
interface AnimatedMegaMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen?: boolean;
  onAnimationComplete?: () => void;
}

export const AnimatedMegaMenu = forwardRef<HTMLDivElement, AnimatedMegaMenuProps>(({
  children,
  className,
  isOpen = false,
  onAnimationComplete,
  ...props
}, ref) => {
  const internalRef = useRef<HTMLDivElement>(null);
  const menuRef = (ref as React.RefObject<HTMLDivElement>) || internalRef;

  useEffect(() => {
    const element = menuRef.current;
    if (!element) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      // Sin animaciones para reduced motion
      element.style.opacity = isOpen ? '1' : '0';
      element.style.visibility = isOpen ? 'visible' : 'hidden';
      element.style.transform = 'none';
      onAnimationComplete?.();
      return;
    }

    // Animaciones completas
    if (isOpen) {
      element.style.willChange = 'transform, opacity';
      element.style.animation = 'megaMenuEnter 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';

      const timeout = setTimeout(() => {
        element.style.willChange = 'auto';
        element.style.animation = '';
        onAnimationComplete?.();
      }, 200);

      return () => clearTimeout(timeout);
    } else {
      element.style.willChange = 'transform, opacity';
      element.style.animation = 'megaMenuExit 0.15s cubic-bezier(0.4, 0, 1, 1) forwards';

      const timeout = setTimeout(() => {
        element.style.willChange = 'auto';
        element.style.animation = '';
        onAnimationComplete?.();
      }, 150);

      return () => clearTimeout(timeout);
    }
  }, [isOpen, onAnimationComplete]);

  return (
    <div
      ref={menuRef}
      className={cn(
        'mega-menu',
        'absolute top-full left-0 mt-2',
        'opacity-0 invisible transform scale-95 translate-y-[-8px]',
        'will-change-auto', // Se activa dinámicamente
        className
      )}
      {...props}
    >
      <div className="mega-menu-content">
        {children}
      </div>
    </div>
  );
});

AnimatedMegaMenu.displayName = 'AnimatedMegaMenu';

/**
 * Item animado para mega menús
 */
interface AnimatedMegaMenuItemProps {
  children: React.ReactNode;
  className?: string;
  href: string;
  onClick?: () => void;
}

export const AnimatedMegaMenuItem = forwardRef<HTMLAnchorElement, AnimatedMegaMenuItemProps>(({
  children,
  className,
  href,
  onClick,
  ...props
}, ref) => {
  const handleMouseEnter = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const element = event.currentTarget;

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      element.style.willChange = 'transform, background-color';
    }
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const element = event.currentTarget;

    setTimeout(() => {
      element.style.willChange = 'auto';
    }, 150);
  };

  return (
    <Link
      ref={ref}
      href={href}
      className={cn(
        'mega-menu-item',
        'block rounded-lg p-3 transition-all duration-150 ease-out',
        'hover:bg-accent active:bg-accent/80',
        'focus-visible:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        'touch-manipulation',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      {...props}
    >
      {children}
    </Link>
  );
});

AnimatedMegaMenuItem.displayName = 'AnimatedMegaMenuItem';