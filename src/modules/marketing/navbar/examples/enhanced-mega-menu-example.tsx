/**
 * Enhanced Mega Menu Example
 *
 * Ejemplo completo de implementación del mega menú mejorado con:
 * - Triangle safe zone
 * - Timing optimizado
 * - Área de hover expandida
 * - Animaciones suaves
 * - Indicadores de estado pending
 */

'use client';

import React, { useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { useMegaMenuInteraction } from '../application/hooks/use-mega-menu-interaction';
import type { NavigationItem } from '../domain/types';
import { MegaMenuPresentationPure } from '../presentation/components/mega-menu-presentation-pure';

// Import the enhanced styles
import '../presentation/styles/mega-menu.css';

// Example navigation items
const navigationItems: NavigationItem[] = [
  {
    label: 'Products',
    href: '/products',
    description: 'Explore our product catalog',
    icon: () => (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )
  },
  {
    label: 'Solutions',
    href: '/solutions',
    description: 'Industry-specific solutions',
    badge: 'New',
    icon: () => (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  {
    label: 'Resources',
    href: '/resources',
    description: 'Documentation and guides',
    icon: () => (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  },
  {
    label: 'Pricing',
    href: '/pricing',
    description: 'Simple, transparent pricing',
    icon: () => (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
];

export function EnhancedMegaMenuExample() {
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Use the enhanced mega menu hook
  const {
    isOpen,
    isPending,
    isMenuOpen,
    isMenuPending,
    openMenu,
    closeMenu,
    registerMenu,
    getMenuProps,
    getTriggerProps,
    cursorPosition,
    cursorVelocity,
    config
  } = useMegaMenuInteraction({
    config: {
      hoverDelay: {
        enter: 100,    // Fast opening
        exit: 300,     // Forgiving closing
        keyboard: 0    // Instant for keyboard
      },
      triangleSafeZone: {
        enabled: true,
        tolerance: 75,
        angleThreshold: 75,
        timeWindow: 300
      },
      performance: {
        useRAF: true,
        throttleMs: 16,
        movementThreshold: 3
      },
      expandedHitArea: {
        enabled: true,
        padding: 8
      }
    },
    onMenuOpen: (menuId) => {
      console.log('Menu opened:', menuId);
    },
    onMenuClose: (menuId) => {
      console.log('Menu closed:', menuId);
    }
  });

  // Register menu on mount
  React.useEffect(() => {
    if (menuRef.current && triggerRef.current) {
      return registerMenu('main-menu', menuRef.current, triggerRef.current);
    }
  }, [registerMenu]);

  // Group items into sections for mega menu
  const sections = [
    {
      title: 'Products & Solutions',
      items: navigationItems.slice(0, 2)
    },
    {
      title: 'Resources & Support',
      items: navigationItems.slice(2)
    }
  ];

  const featuredItem = navigationItems.find(item => item.badge);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        {...getMenuProps('main-menu', triggerRef)}
        {...getTriggerProps('main-menu')}
        className={cn(
          'px-4 py-2 rounded-lg font-medium',
          'text-slate-300 hover:text-white',
          'transition-all duration-200',
          'hover:bg-white/10',
          'focus:outline-none focus:ring-2 focus:ring-yellow-400/50',
          isMenuOpen('main-menu') && 'bg-white/10 text-white',
          isMenuPending('main-menu') && 'text-yellow-400'
        )}
      >
        <span className="flex items-center gap-2">
          Menu
          <svg
            className={cn(
              'w-4 h-4 transition-transform duration-200',
              isMenuOpen('main-menu') && 'rotate-180'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && cursorPosition && (
        <div className="fixed bottom-4 right-4 p-2 bg-black/80 text-white text-xs rounded-lg font-mono z-50">
          <div>Cursor: {Math.round(cursorPosition.x)}, {Math.round(cursorPosition.y)}</div>
          <div>Velocity: {Math.round(cursorVelocity?.x || 0)}, {Math.round(cursorVelocity?.y || 0)}</div>
          <div>State: {isPending ? 'pending' : isOpen ? 'open' : 'closed'}</div>
          <div>Safe Zone: {config.triangleSafeZone.enabled ? 'ON' : 'OFF'}</div>
        </div>
      )}

      {/* Mega Menu */}
      <div ref={menuRef}>
        <MegaMenuPresentationPure
          isOpen={isMenuOpen('main-menu')}
          isPending={isMenuPending('main-menu')}
          sections={sections}
          featuredItem={featuredItem}
          position={{ x: 0, y: 40 }}
          alignment="left"
          width="600px"
          animationPhase={
            isMenuOpen('main-menu') ? 'entered' :
            isMenuPending('main-menu') ? 'entering' : 'exited'
          }
          showLoadingIndicator={true}
          hoveredItemId={hoveredItem}
          onItemClick={(item) => {
            console.log('Item clicked:', item);
            closeMenu('main-menu', true);
          }}
          onItemHover={(item) => setHoveredItem(item.href)}
          onItemLeave={() => setHoveredItem(null)}
          onClose={() => closeMenu('main-menu', true)}
          className="mega-menu-optimized"
          itemClassName="mega-menu-item"
        />
      </div>

      {/* Triangle Safe Zone Visualization (Debug Mode) */}
      {process.env.NODE_ENV === 'development' && config.triangleSafeZone.enabled && (
        <div
          className="triangle-safe-zone"
          style={{
            /* This would be dynamically positioned based on the triangle calculation */
            display: isOpen ? 'block' : 'none'
          }}
        />
      )}
    </div>
  );
}

// Usage in a page or component
export default function MegaMenuShowcase() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Enhanced Mega Menu Demo</h1>

        <div className="mb-8 p-4 bg-slate-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Features:</h2>
          <ul className="space-y-2 text-slate-300">
            <li>✅ Triangle Safe Zone - Move diagonally without losing hover</li>
            <li>✅ Optimized Timing - 100ms open, 300ms close</li>
            <li>✅ Expanded Hit Area - 8px invisible padding</li>
            <li>✅ Smooth Animations - Spring-like easing</li>
            <li>✅ Movement Threshold - Prevents accidental opens</li>
            <li>✅ RAF Optimization - 60fps tracking</li>
            <li>✅ Pending State Indicator - Visual feedback</li>
            <li>✅ Keyboard Navigation - Arrow keys support</li>
            <li>✅ Accessibility - WCAG 2.1 AA compliant</li>
            <li>✅ Touch Support - Enhanced hit areas on mobile</li>
          </ul>
        </div>

        <nav className="flex gap-4">
          <EnhancedMegaMenuExample />
        </nav>

        <div className="mt-8 p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
          <p className="text-sm text-yellow-400">
            💡 Try hovering over the menu and moving your cursor diagonally to the items.
            The triangle safe zone will keep the menu open!
          </p>
        </div>
      </div>
    </div>
  );
}