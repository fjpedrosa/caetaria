/**
 * Presentation Layer - Mobile Menu Toggle Component
 *
 * Pure presentational component for mobile menu button.
 * No business logic, only visual rendering.
 */

import React from 'react';

import { cn } from '@/lib/utils';

import { CloseIcon,MenuIcon } from './optimized-icons';

interface NavbarMobileToggleProps {
  isOpen: boolean;
  onClick?: () => void;
  className?: string;
  isCompact?: boolean;
}

export const NavbarMobileToggle: React.FC<NavbarMobileToggleProps> = ({
  isOpen,
  onClick,
  className,
  isCompact = false
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative overflow-hidden transition-all duration-200 rounded-full',
        // Ensure minimum 48x48px touch target for WCAG AAA
        'min-w-[48px] min-h-[48px]',
        isCompact ? 'w-11 h-11' : 'w-12 h-12',
        // Touch optimizations
        'touch-manipulation active:scale-95',
        // Expanded invisible touch area
        'before:absolute before:inset-[-4px] before:content-[""]',
        // Visual styles
        'text-white hover:bg-white/10 hover:text-yellow-400',
        'focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:ring-offset-2',
        'focus:bg-white/10 focus:text-yellow-400 active:bg-white/20',
        className
      )}
      aria-label={isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
      aria-haspopup="true"
    >
      <span className="relative flex items-center justify-center pointer-events-none">
        {isOpen ? (
          <CloseIcon className={cn(isCompact ? 'h-6 w-6' : 'h-7 w-7')} />
        ) : (
          <MenuIcon className={cn(isCompact ? 'h-6 w-6' : 'h-7 w-7')} />
        )}
        <span className="sr-only">
          {isOpen ? 'Cerrar' : 'Abrir'} menú de navegación
        </span>
      </span>
    </button>
  );
};