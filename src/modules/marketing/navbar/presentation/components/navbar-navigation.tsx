/**
 * Presentation Layer - Navbar Navigation Component
 *
 * Pure presentational component for navigation items.
 * WCAG 2.1 AA Compliant with enhanced keyboard navigation
 * No business logic, only visual rendering.
 */

import React from 'react';

import { cn } from '@/lib/utils';

import type { NavigationItem } from '../../domain/types';

interface NavbarNavigationProps {
  items: NavigationItem[];
  activeItem?: string;
  onItemClick?: (item: NavigationItem) => void;
  onItemHover?: () => void;
  className?: string;
}

export const NavbarNavigation: React.FC<NavbarNavigationProps> = ({
  items,
  activeItem,
  onItemClick,
  onItemHover,
  className
}) => {
  return (
    <nav
      className={cn('flex items-center space-x-1', className)}
      role="navigation"
      aria-label="Main navigation menu"
    >
      <ul className="flex items-center space-x-1 list-none m-0 p-0" role="list">
        {items.map((item, index) => (
          <li key={item.href} role="listitem">
            <button
              onClick={() => onItemClick?.(item)}
              onMouseEnter={() => onItemHover?.()}
              className={cn(
                // Base styles
                'relative px-4 py-2 text-sm font-medium rounded-lg',
                'transition-all duration-200',
                'min-w-[44px] min-h-[44px]', // WCAG touch target size

                // Enhanced focus styles - 3px minimum for WCAG 2.1 AA
                'focus-visible:outline-none',
                'focus-visible:ring-[3px] focus-visible:ring-yellow-400',
                'focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
                'focus-visible:shadow-[0_0_0_5px_rgba(251,191,36,0.25)]',

                // Active state with proper contrast
                activeItem === item.href || activeItem === item.sectionId
                  ? 'bg-yellow-400/10 text-yellow-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/10',

                // Hover effects (only for non-active items)
                activeItem !== item.href && activeItem !== item.sectionId &&
                  'hover:scale-[1.02] active:scale-[0.98]',

                // High contrast mode support
                'contrast-more:border contrast-more:border-current',
                'contrast-more:hover:bg-white contrast-more:hover:text-black'
              )}
              role="link"
              aria-label={`${item.label}${item.external ? ' (opens in new window)' : ''}${item.description ? ` - ${item.description}` : ''}`}
              aria-current={activeItem === item.href || activeItem === item.sectionId ? 'page' : undefined}
              aria-describedby={item.description ? `nav-desc-${index}` : undefined}
              data-keyboard-nav="true"
              tabIndex={0}
            >
              <span className="flex items-center justify-center space-x-2">
                {item.icon && (
                  <item.icon
                    className="w-4 h-4 flex-shrink-0"
                    aria-hidden="true"
                  />
                )}
                <span className="whitespace-nowrap">{item.label}</span>
                {item.badge && (
                  <span
                    className={cn(
                      'px-1.5 py-0.5 text-xs rounded-full',
                      'bg-yellow-400/20 text-yellow-400',
                      'font-semibold'
                    )}
                    role="status"
                    aria-label={`${item.badge} new items`}
                  >
                    {item.badge}
                  </span>
                )}
              </span>

              {/* External link indicator for screen readers */}
              {item.external && (
                <span className="sr-only"> (opens in new window)</span>
              )}

              {/* Current page indicator visual */}
              {(activeItem === item.href || activeItem === item.sectionId) && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-[3px] bg-yellow-400 rounded-full"
                  aria-hidden="true"
                />
              )}
            </button>

            {/* Hidden description for screen readers */}
            {item.description && (
              <span
                id={`nav-desc-${index}`}
                className="sr-only"
              >
                {item.description}
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};