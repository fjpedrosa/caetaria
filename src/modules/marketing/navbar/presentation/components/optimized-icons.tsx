/**
 * Optimized Icons Module
 *
 * Tree-shaken imports de Lucide React:
 * - Solo importa los iconos específicos que se usan
 * - Elimina el bundle completo de lucide-react
 * - ~2KB vs ~45KB de lucide-react completo
 */

import React from 'react';
// Tree-shaken imports - solo los iconos que usamos en el navbar
import {
  ArrowRight,
  Check,
  ChevronDown,
  ExternalLink,
  Menu,
  Star,
  X,
  Zap
} from 'lucide-react';

// Re-export for external use
export {
  ArrowRight,
  Check,
  ChevronDown,
  ExternalLink,
  Menu,
  Star,
  X,
  Zap
};

// Tipo para los iconos exportados
export type NavbarIcon =
  | typeof Menu
  | typeof X
  | typeof ChevronDown
  | typeof ExternalLink
  | typeof ArrowRight
  | typeof Check
  | typeof Star
  | typeof Zap;

// Props base para todos los iconos del navbar
export interface IconProps {
  className?: string;
  size?: number | string;
  'aria-hidden'?: boolean;
}

// Wrapper para iconos optimizados con props por defecto
const createOptimizedIcon = (IconComponent: NavbarIcon) => {
  return React.forwardRef<SVGSVGElement, IconProps>(
    ({ className, size = 20, 'aria-hidden': ariaHidden = true, ...props }, ref) => (
      <IconComponent
        ref={ref}
        className={className}
        size={size}
        aria-hidden={ariaHidden}
        {...props}
      />
    )
  );
};

// Iconos pre-optimizados para el navbar
export const MenuIcon = createOptimizedIcon(Menu);
export const CloseIcon = createOptimizedIcon(X);
export const DropdownIcon = createOptimizedIcon(ChevronDown);
export const ExternalIcon = createOptimizedIcon(ExternalLink);
export const ArrowIcon = createOptimizedIcon(ArrowRight);
export const CheckIcon = createOptimizedIcon(Check);
export const StarIcon = createOptimizedIcon(Star);
export const ZapIcon = createOptimizedIcon(Zap);

// Export the creator function as well
export { createOptimizedIcon };