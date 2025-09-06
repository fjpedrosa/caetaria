/**
 * Presentation Layer - Mobile Menu Container
 *
 * Smart container for mobile menu with business logic.
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { X } from '@/lib/icons';
import { cn } from '@/lib/utils';

import type { CTAConfig,NavigationItem } from '../../domain/types';

interface MobileMenuContainerProps {
  isOpen: boolean;
  navigationItems: NavigationItem[];
  ctaConfig: CTAConfig;
  onClose: () => void;
  onNavigate: (href: string) => void;
}

export const MobileMenuContainer: React.FC<MobileMenuContainerProps> = ({
  isOpen,
  navigationItems,
  ctaConfig,
  onClose,
  onNavigate
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Focus trap when menu is open
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const focusableElements = menuRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    firstElement.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }

      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Menu Panel */}
          <motion.div
            ref={menuRef}
            id="mobile-menu"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed top-0 right-0 bottom-0 w-full max-w-sm z-50',
              'bg-slate-900 shadow-2xl lg:hidden',
              'flex flex-col'
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación móvil"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <span className="text-lg font-semibold text-white">Menú</span>
              <button
                onClick={onClose}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  'text-slate-400 hover:text-white hover:bg-white/10',
                  'focus:outline-none focus:ring-2 focus:ring-yellow-400'
                )}
                aria-label="Cerrar menú"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-1 px-4">
                {navigationItems.map((item) => (
                  <li key={item.href}>
                    <button
                      onClick={() => onNavigate(item.href)}
                      className={cn(
                        'w-full text-left rounded-lg',
                        // Ensure minimum 48px height for touch targets
                        'min-h-[48px] px-4 py-3',
                        // Expanded touch area
                        'relative before:absolute before:inset-[-2px] before:content-[""]',
                        // Visual styles
                        'text-slate-300 hover:text-white hover:bg-white/10',
                        'transition-colors duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-yellow-400',
                        // Touch optimizations
                        'touch-manipulation active:scale-[0.98]'
                      )}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* CTA Buttons - Optimized for touch */}
            <div className="p-4 space-y-3 border-t border-slate-800">
              <button
                onClick={() => onNavigate(ctaConfig.signIn.href)}
                className={cn(
                  'w-full rounded-lg',
                  // Ensure minimum 48px height for touch targets
                  'min-h-[48px] px-4 py-3',
                  // Visual styles
                  'text-slate-300 hover:text-white hover:bg-white/10',
                  'border border-slate-700 hover:border-slate-600',
                  'transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-yellow-400',
                  // Touch optimizations
                  'touch-manipulation active:scale-[0.98]'
                )}
              >
                {ctaConfig.signIn.text}
              </button>
              <button
                onClick={() => onNavigate(ctaConfig.primary.href)}
                className={cn(
                  'w-full rounded-lg font-semibold',
                  // Ensure minimum 48px height for touch targets
                  'min-h-[48px] px-4 py-3',
                  // Visual styles
                  'bg-gradient-to-r from-yellow-400 to-yellow-500',
                  'text-slate-900 hover:from-yellow-500 hover:to-yellow-600',
                  'transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-yellow-400',
                  // Touch optimizations
                  'touch-manipulation active:scale-[0.98]'
                )}
              >
                {ctaConfig.primary.text}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};