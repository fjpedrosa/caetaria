/**
 * Presentation Layer - Navbar Logo Component
 *
 * Pure presentational component for the navbar logo.
 * No business logic, only visual rendering.
 */

import React from 'react';

import { MessageCircle } from '@/lib/icons';
import { cn } from '@/lib/utils';

interface NavbarLogoProps {
  text?: string;
  subtitle?: string;
  iconClassName?: string;
  textClassName?: string;
  onClick?: () => void;
}

export const NavbarLogo: React.FC<NavbarLogoProps> = ({
  text = 'Neptunik',
  subtitle = 'WhatsApp Cloud',
  iconClassName,
  textClassName,
  onClick
}) => {
  const content = (
    <>
      <div
        className={cn(
          'w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg',
          'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600',
          'transition-all duration-200',
          iconClassName
        )}
        role="img"
        aria-hidden="true"
      >
        <MessageCircle className="w-6 h-6 text-slate-900 group-hover:scale-110 transition-transform duration-200" />
      </div>
      <div className="hidden sm:flex flex-col">
        <span
          className={cn(
            'text-xl font-bold transition-all duration-200',
            'bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent',
            'group-hover:from-yellow-300 group-hover:to-yellow-400',
            textClassName
          )}
        >
          {text}
        </span>
        {subtitle && (
          <span className="text-xs -mt-0.5 text-slate-400 group-hover:text-slate-300 transition-colors duration-200">
            {subtitle}
          </span>
        )}
      </div>
    </>
  );

  // If onClick is provided, render as button, otherwise as div
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'flex items-center space-x-3 group rounded-lg p-2 -m-2',
          'focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2'
        )}
        aria-label={`${text} - Página principal`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex items-center space-x-3 group">
      {content}
    </div>
  );
};