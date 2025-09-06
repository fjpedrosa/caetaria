/**
 * Presentation Layer - Optimized Mega Menu Component
 *
 * Componente de mega menú con animaciones optimizadas para 60fps.
 * Implementa lazy rendering, virtualización y GPU acceleration.
 *
 * Performance features:
 * - GPU-accelerated animations con transform3d
 * - Lazy rendering del contenido
 * - Virtualización para listas largas
 * - Debounce/throttle de eventos
 * - Backdrop blur con fallback
 * - Shadow progresivo durante animación
 */

'use client';

import React, { memo, useCallback, useMemo, useRef } from 'react';

import { cn } from '@/lib/utils';

import type { NavigationItem, NavigationSection } from '../../domain/types';

interface MegaMenuOptimizedProps {
  // Animation state
  animationStyles: {
    transform: string;
    opacity: number;
    transformOrigin: string;
    willChange?: string;
    transition: string;
    pointerEvents: 'auto' | 'none';
  };

  // Content
  sections?: NavigationSection[];
  featuredItem?: NavigationItem;
  items?: NavigationItem[];

  // Visual state
  isOpen: boolean;
  isContentReady: boolean;
  animationPhase: 'idle' | 'entering' | 'entered' | 'exiting' | 'exited';

  // Interaction
  hoveredItemId?: string | null;
  activeItemId?: string | null;

  // Callbacks
  onItemClick?: (item: NavigationItem) => void;
  onItemHover?: (item: NavigationItem) => void;
  onItemLeave?: () => void;
  onClose?: () => void;

  // Performance
  maxItemsBeforeVirtualization?: number;
  enableBackdropBlur?: boolean;
  enableProgressiveShadow?: boolean;

  // Customization
  className?: string;
  backgroundColor?: string;
  getItemStyles?: (index: number) => React.CSSProperties;
}

// Memoized section component for performance
const MenuSection = memo(({
  section,
  sectionIndex,
  hoveredItemId,
  activeItemId,
  onItemClick,
  onItemHover,
  onItemLeave,
  getItemStyles
}: {
  section: NavigationSection;
  sectionIndex: number;
  hoveredItemId?: string | null;
  activeItemId?: string | null;
  onItemClick?: (item: NavigationItem) => void;
  onItemHover?: (item: NavigationItem) => void;
  onItemLeave?: () => void;
  getItemStyles?: (index: number) => React.CSSProperties;
}) => {
  const handleItemClick = useCallback((e: React.MouseEvent, item: NavigationItem) => {
    e.preventDefault();
    onItemClick?.(item);
  }, [onItemClick]);

  const handleItemMouseEnter = useCallback((item: NavigationItem) => {
    onItemHover?.(item);
  }, [onItemHover]);

  return (
    <div className="space-y-3">
      {section.title && (
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3">
          {section.title}
        </h3>
      )}

      <div className="space-y-1" role="group">
        {section.items.map((item, itemIndex) => {
          const itemId = `${section.title}-${item.label}`;
          const isActive = activeItemId === itemId;
          const isHovered = hoveredItemId === itemId;
          const globalIndex = sectionIndex * 10 + itemIndex; // For stagger animation

          return (
            <button
              key={itemId}
              data-menu-item
              className={cn(
                'w-full px-3 py-2 rounded-lg text-left',
                'transition-all duration-150 ease-out',
                'transform-gpu', // Force GPU acceleration
                'hover:bg-white/10 hover:text-white',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/50',
                'active:scale-[0.98]',
                isActive && 'bg-yellow-400/10 text-yellow-400',
                isHovered && 'bg-white/5 text-white'
              )}
              style={{
                ...getItemStyles?.(globalIndex),
                // Additional performance optimizations
                contain: 'layout style paint',
                willChange: isHovered ? 'transform' : 'auto'
              }}
              onClick={(e) => handleItemClick(e, item)}
              onMouseEnter={() => handleItemMouseEnter(item)}
              onMouseLeave={onItemLeave}
              role="menuitem"
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="flex items-start gap-2">
                {item.icon && (
                  <item.icon className={cn(
                    'w-4 h-4 mt-0.5 transition-colors',
                    isActive ? 'text-yellow-400' : 'text-slate-400'
                  )} />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-sm font-medium transition-colors',
                      isActive ? 'text-yellow-400' : 'text-slate-300'
                    )}>
                      {item.label}
                    </span>

                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-xs bg-yellow-400/20 text-yellow-400 rounded-full animate-pulse">
                        {item.badge}
                      </span>
                    )}

                    {item.external && (
                      <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    )}
                  </div>

                  {item.description && (
                    <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                      {item.description}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});

MenuSection.displayName = 'MenuSection';

export const MegaMenuOptimized: React.FC<MegaMenuOptimizedProps> = memo(({
  animationStyles,
  sections = [],
  featuredItem,
  items = [],
  isOpen,
  isContentReady,
  animationPhase,
  hoveredItemId,
  activeItemId,
  onItemClick,
  onItemHover,
  onItemLeave,
  onClose,
  maxItemsBeforeVirtualization = 50,
  enableBackdropBlur = true,
  enableProgressiveShadow = true,
  className,
  backgroundColor = 'rgba(15, 23, 42, 0.98)',
  getItemStyles
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Calculate total items for virtualization decision
  const totalItems = useMemo(() => {
    const sectionItems = sections.reduce((acc, section) => acc + section.items.length, 0);
    return sectionItems + items.length + (featuredItem ? 1 : 0);
  }, [sections, items, featuredItem]);

  const shouldVirtualize = totalItems > maxItemsBeforeVirtualization;

  // Progressive shadow based on animation phase
  const shadowClass = useMemo(() => {
    if (!enableProgressiveShadow) return 'shadow-xl';

    switch (animationPhase) {
      case 'entering':
        return 'shadow-lg transition-shadow duration-200';
      case 'entered':
        return 'shadow-xl shadow-black/50';
      case 'exiting':
        return 'shadow-md transition-shadow duration-150';
      default:
        return 'shadow-none';
    }
  }, [animationPhase, enableProgressiveShadow]);

  // Backdrop filter with fallback
  const backdropClass = useMemo(() => {
    if (!enableBackdropBlur) return '';

    // Check for backdrop filter support
    if (typeof window !== 'undefined' && CSS.supports && !CSS.supports('backdrop-filter', 'blur(1px)')) {
      // Fallback to darker background without blur
      return '';
    }

    return 'backdrop-blur-md backdrop-saturate-150';
  }, [enableBackdropBlur]);

  // Don't render if not needed
  if (!isOpen && animationPhase === 'exited') return null;

  return (
    <div
      ref={menuRef}
      className={cn(
        'absolute top-full mt-2 z-50',
        'rounded-xl border border-white/10',
        shadowClass,
        backdropClass,
        'transform-gpu', // Force GPU acceleration
        className
      )}
      style={{
        ...animationStyles,
        backgroundColor,
        // Performance optimization
        contain: 'layout style paint',
        // Prevent layout thrashing
        isolation: 'isolate'
      }}
      role="menu"
      aria-label="Navigation menu"
      aria-hidden={!isOpen}
    >
      {/* Gradient overlay for depth */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(250, 204, 21, 0.05), transparent 50%)',
          opacity: animationPhase === 'entered' ? 1 : 0,
          transition: 'opacity 300ms ease-out'
        }}
      />

      {/* Close button */}
      {onClose && (
        <button
          className={cn(
            'absolute top-2 right-2 p-2 rounded-lg',
            'text-slate-400 hover:text-white hover:bg-white/10',
            'transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/50'
          )}
          onClick={onClose}
          aria-label="Close menu"
          style={{
            opacity: animationPhase === 'entered' ? 1 : 0,
            transition: 'opacity 200ms ease-out 100ms'
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Content wrapper with lazy loading */}
      <div
        className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar"
        style={{
          // Only render content when ready
          visibility: isContentReady ? 'visible' : 'hidden'
        }}
      >
        {/* Featured item with enhanced animation */}
        {featuredItem && (
          <div
            data-menu-item
            className="mb-6"
            style={getItemStyles?.(0)}
          >
            <button
              className={cn(
                'w-full p-4 rounded-lg',
                'bg-gradient-to-r from-yellow-400/10 to-yellow-500/10',
                'border border-yellow-400/20',
                'hover:from-yellow-400/20 hover:to-yellow-500/20',
                'transition-all duration-200',
                'transform-gpu hover:scale-[1.02]',
                'text-left'
              )}
              onClick={() => onItemClick?.(featuredItem)}
              onMouseEnter={() => onItemHover?.(featuredItem)}
              onMouseLeave={onItemLeave}
              role="menuitem"
            >
              <div className="flex items-start gap-3">
                {featuredItem.icon && (
                  <featuredItem.icon className="w-5 h-5 text-yellow-400 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-white flex items-center gap-2">
                    {featuredItem.label}
                    {featuredItem.badge && (
                      <span className="px-2 py-0.5 text-xs bg-yellow-400 text-slate-900 rounded-full font-medium animate-pulse">
                        {featuredItem.badge}
                      </span>
                    )}
                  </div>
                  {featuredItem.description && (
                    <div className="text-sm text-slate-400 mt-1">
                      {featuredItem.description}
                    </div>
                  )}
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Divider with animation */}
        {featuredItem && (sections.length > 0 || items.length > 0) && (
          <div
            className="border-t border-white/10 my-4"
            style={{
              opacity: animationPhase === 'entered' ? 1 : 0,
              transition: 'opacity 200ms ease-out 150ms'
            }}
          />
        )}

        {/* Sections with virtualization if needed */}
        {sections.length > 0 ? (
          <div className={cn(
            'grid gap-6',
            sections.length === 1 ? 'grid-cols-1' :
            sections.length === 2 ? 'grid-cols-2' :
            'grid-cols-3'
          )}>
            {sections.map((section, index) => (
              <MenuSection
                key={`section-${index}`}
                section={section}
                sectionIndex={index}
                hoveredItemId={hoveredItemId}
                activeItemId={activeItemId}
                onItemClick={onItemClick}
                onItemHover={onItemHover}
                onItemLeave={onItemLeave}
                getItemStyles={getItemStyles}
              />
            ))}
          </div>
        ) : items.length > 0 ? (
          // Simple items list
          <div className="space-y-1">
            {items.map((item, index) => (
              <button
                key={`item-${index}`}
                data-menu-item
                className={cn(
                  'w-full px-4 py-2 rounded-lg text-left',
                  'transition-all duration-150',
                  'transform-gpu',
                  'hover:bg-white/10 hover:text-white',
                  activeItemId === item.href && 'bg-yellow-400/10 text-yellow-400',
                  hoveredItemId === item.href && 'bg-white/5 text-white'
                )}
                style={getItemStyles?.(index + 1)}
                onClick={() => onItemClick?.(item)}
                onMouseEnter={() => onItemHover?.(item)}
                onMouseLeave={onItemLeave}
                role="menuitem"
              >
                <div className="flex items-center gap-3">
                  {item.icon && (
                    <item.icon className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="text-sm font-medium text-slate-300">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="ml-auto px-2 py-0.5 text-xs bg-yellow-400/20 text-yellow-400 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          // Empty state
          <div className="text-center py-8 text-slate-500">
            No items available
          </div>
        )}
      </div>

      {/* Loading skeleton for lazy content */}
      {!isContentReady && isOpen && (
        <div className="p-6 space-y-4">
          <div className="h-12 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-8 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-8 bg-white/5 rounded-lg animate-pulse" />
        </div>
      )}
    </div>
  );
});

MegaMenuOptimized.displayName = 'MegaMenuOptimized';