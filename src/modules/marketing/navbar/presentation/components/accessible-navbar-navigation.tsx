/**
 * Accessible Navbar Navigation Component
 *
 * Componente de navegación del navbar con accesibilidad completa WCAG 2.1 AA.
 * Implementa navegación por teclado, ARIA attributes y focus management.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import type { NavigationItem } from '../../domain/types';

interface AccessibleNavbarNavigationProps {
  items: NavigationItem[];
  activeItem?: string;
  onItemClick?: (item: NavigationItem) => void;
  onItemHover?: (item: NavigationItem | null) => void;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  enableSkipLink?: boolean;
}

export const AccessibleNavbarNavigation: React.FC<AccessibleNavbarNavigationProps> = ({
  items,
  activeItem,
  onItemClick,
  onItemHover,
  className,
  orientation = 'horizontal',
  enableSkipLink = true
}) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isUsingKeyboard, setIsUsingKeyboard] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Detect keyboard navigation
  useEffect(() => {
    const handleKeyDown = () => setIsUsingKeyboard(true);
    const handleMouseDown = () => setIsUsingKeyboard(false);

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const currentIndex = focusedIndex >= 0 ? focusedIndex :
      items.findIndex(item => item.href === activeItem);

    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        if (orientation === 'horizontal' && event.key === 'ArrowDown') {
          // Open mega menu if exists
          const item = items[currentIndex];
          if (item && item.children) {
            onItemClick?.(item);
          }
          return;
        }
        newIndex = (currentIndex + 1) % items.length;
        break;

      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        if (orientation === 'horizontal' && event.key === 'ArrowUp') {
          return; // Don't navigate on up arrow in horizontal mode
        }
        newIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
        break;

      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;

      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        if (currentIndex >= 0 && items[currentIndex]) {
          onItemClick?.(items[currentIndex]);
        }
        break;

      case 'Escape':
        event.preventDefault();
        // Blur current focus
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        setFocusedIndex(-1);
        break;

      default:
        // Handle letter key navigation (jump to item starting with letter)
        if (event.key.length === 1 && event.key.match(/[a-z]/i)) {
          const letter = event.key.toLowerCase();
          const startIndex = (currentIndex + 1) % items.length;

          // Find next item starting with the letter
          for (let i = 0; i < items.length; i++) {
            const index = (startIndex + i) % items.length;
            if (items[index].label.toLowerCase().startsWith(letter)) {
              newIndex = index;
              break;
            }
          }
        }
        return;
    }

    // Update focus
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < items.length) {
      setFocusedIndex(newIndex);
      itemRefs.current[newIndex]?.focus();
    }
  }, [focusedIndex, items, activeItem, orientation, onItemClick]);

  // Update roving tabindex
  useEffect(() => {
    itemRefs.current.forEach((ref, index) => {
      if (ref) {
        // First item or focused item gets tabindex="0"
        ref.setAttribute('tabindex',
          index === focusedIndex || (focusedIndex === -1 && index === 0) ? '0' : '-1'
        );
      }
    });
  }, [focusedIndex]);

  return (
    <>
      {/* Skip to main content link */}
      {enableSkipLink && (
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-yellow-400 focus:text-slate-900 focus:rounded-lg focus:font-semibold focus:ring-4 focus:ring-yellow-400/30"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              document.getElementById('main-content')?.focus();
            }
          }}
        >
          Skip to main content
        </a>
      )}

      <nav
        ref={navRef}
        className={cn(
          'flex',
          orientation === 'horizontal' ? 'flex-row space-x-1' : 'flex-col space-y-1',
          className
        )}
        role="navigation"
        aria-label="Main navigation"
        onKeyDown={handleKeyDown}
      >
        <ul
          className={cn(
            'flex list-none p-0 m-0',
            orientation === 'horizontal' ? 'flex-row space-x-1' : 'flex-col space-y-1'
          )}
          role="menubar"
          aria-orientation={orientation}
        >
          {items.map((item, index) => {
            const isActive = activeItem === item.href;
            const isFocused = focusedIndex === index;
            const hasSubmenu = item.children && item.children.length > 0;

            return (
              <li key={item.href} role="none">
                <button
                  ref={(el) => { itemRefs.current[index] = el; }}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
                    'relative group',

                    // Active state
                    isActive ?
                      'bg-yellow-400/10 text-yellow-400' :
                      'text-slate-300 hover:text-white hover:bg-white/10',

                    // Keyboard focus state
                    isUsingKeyboard && isFocused && 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-900',

                    // Hover effects (reduced when using keyboard)
                    !isUsingKeyboard && 'hover:scale-[1.02] active:scale-[0.98]'
                  )}
                  onClick={() => onItemClick?.(item)}
                  onMouseEnter={() => onItemHover?.(item)}
                  onMouseLeave={() => onItemHover?.(null)}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => {
                    if (focusedIndex === index) {
                      setFocusedIndex(-1);
                    }
                  }}
                  role="menuitem"
                  aria-current={isActive ? 'page' : undefined}
                  aria-haspopup={hasSubmenu ? 'menu' : undefined}
                  aria-expanded={hasSubmenu ? undefined : undefined} // Will be controlled by mega menu
                  aria-label={`${item.label}${hasSubmenu ? ', has submenu' : ''}${item.badge ? `, ${item.badge} new` : ''}`}
                  tabIndex={index === 0 || focusedIndex === index ? 0 : -1}
                  data-navbar-item={item.href}
                >
                  <span className="flex items-center space-x-2">
                    {/* Icon */}
                    {item.icon && (
                      <item.icon
                        className="w-4 h-4"
                        aria-hidden="true"
                      />
                    )}

                    {/* Label */}
                    <span>{item.label}</span>

                    {/* Badge */}
                    {item.badge && (
                      <span
                        className="px-1.5 py-0.5 text-xs bg-yellow-400/20 text-yellow-400 rounded-full"
                        aria-label={`${item.badge} new items`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Dropdown indicator */}
                    {hasSubmenu && (
                      <svg
                        className="w-3 h-3 transition-transform duration-200 group-aria-expanded:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </span>

                  {/* Focus indicator for keyboard navigation */}
                  {isUsingKeyboard && isFocused && (
                    <span
                      className="absolute inset-0 rounded-lg ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-900 pointer-events-none"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};

// Export for use in navbar components
export default AccessibleNavbarNavigation;