/**
 * Presentation Layer - Pure Mega Menu Presentation Component
 *
 * Componente 100% presentacional para el mega menú.
 * Sin estado interno, animaciones controladas por props.
 *
 * Principios aplicados:
 * - Single Responsibility: Solo renderiza el mega menú
 * - Interface Segregation: Props específicas para mega menú
 * - Dependency Inversion: No maneja estado, solo muestra
 */

import React from 'react';

import { cn } from '@/lib/utils';

import type { NavigationItem, NavigationSection } from '../../domain/types';

export interface MegaMenuPresentationPureProps {
  // Control de visibilidad
  isOpen: boolean;
  isPending?: boolean; // New: Shows pending state before opening

  // Contenido del menú
  items?: NavigationItem[];
  sections?: NavigationSection[];
  featuredItem?: NavigationItem;

  // Posicionamiento (calculado externamente)
  position?: {
    x: number;
    y: number;
  };
  alignment?: 'left' | 'center' | 'right';

  // Dimensiones
  width?: number | string;
  maxHeight?: number | string;

  // Estados visuales (controlados desde fuera)
  isAnimating?: boolean;
  animationPhase?: 'entering' | 'entered' | 'exiting' | 'exited';
  showLoadingIndicator?: boolean; // New: Shows subtle loading state

  // Event handlers (sin lógica)
  onItemClick?: (item: NavigationItem) => void;
  onSectionClick?: (section: NavigationSection) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClose?: () => void;

  // Elementos visuales
  showSectionTitles?: boolean;
  showItemDescriptions?: boolean;
  showItemIcons?: boolean;
  showDividers?: boolean;
  columnsPerRow?: number;

  // Item activo (determinado externamente)
  activeItemId?: string;
  hoveredItemId?: string;

  // Personalización
  className?: string;
  menuClassName?: string;
  sectionClassName?: string;
  itemClassName?: string;

  // Tema
  backgroundColor?: string;
  borderColor?: string;
  shadowIntensity?: 'sm' | 'md' | 'lg' | 'xl';

  // Accesibilidad
  ariaLabel?: string;
  ariaDescribedBy?: string;
  role?: string;
  id?: string;
}

export const MegaMenuPresentationPure: React.FC<MegaMenuPresentationPureProps> = ({
  isOpen,
  isPending = false,
  items = [],
  sections = [],
  featuredItem,
  position,
  alignment = 'left',
  width = 'auto',
  maxHeight = '70vh',
  isAnimating = false,
  animationPhase = 'exited',
  showLoadingIndicator = false,
  onItemClick,
  onSectionClick,
  onMouseEnter,
  onMouseLeave,
  onClose,
  showSectionTitles = true,
  showItemDescriptions = true,
  showItemIcons = true,
  showDividers = true,
  columnsPerRow = 3,
  activeItemId,
  hoveredItemId,
  className,
  menuClassName,
  sectionClassName,
  itemClassName,
  backgroundColor = 'rgba(15, 23, 42, 0.98)', // slate-900 with opacity
  borderColor = 'rgba(255, 255, 255, 0.1)',
  shadowIntensity = 'xl',
  ariaLabel = 'Navigation menu',
  ariaDescribedBy,
  role = 'menu',
  id
}) => {
  // No renderizar si está cerrado y no animando y no pending
  if (!isOpen && !isPending && animationPhase === 'exited') return null;

  // Clases de sombra según intensidad
  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl shadow-black/50'
  };

  // Clases de animación mejoradas con scale y opacity
  const animationClasses = {
    entering: 'opacity-0 scale-95 translate-y-[-4px]',
    entered: 'opacity-100 scale-100 translate-y-0',
    exiting: 'opacity-0 scale-95 translate-y-[-4px]',
    exited: 'opacity-0 scale-95 translate-y-[-4px] invisible'
  };

  // Clases de alineación
  const alignmentClasses = {
    left: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    right: 'right-0'
  };

  // Grid columns según configuración
  const gridColumns = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5'
  };

  return (
    <div
      className={cn(
        'absolute top-full mt-2 z-50',
        'rounded-xl backdrop-blur-md',
        'border',
        // Enhanced transition with spring-like easing
        'transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
        shadowClasses[shadowIntensity],
        alignmentClasses[alignment],
        animationClasses[animationPhase],
        isAnimating && 'will-change-transform',
        isPending && 'pointer-events-none',
        className
      )}
      style={{
        backgroundColor,
        borderColor,
        width,
        maxHeight,
        // Enhanced transform origin for smoother animation
        transformOrigin: alignment === 'center' ? 'top center' :
                        alignment === 'right' ? 'top right' : 'top left',
        ...(position && {
          left: position.x,
          top: position.y
        })
      }}
      role={role || 'menu'}
      aria-label={ariaLabel || 'Navigation menu'}
      aria-describedby={ariaDescribedBy}
      aria-hidden={!isOpen}
      aria-orientation="vertical"
      aria-expanded={isOpen}
      id={id}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Loading indicator for pending state */}
      {showLoadingIndicator && isPending && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse" />
      )}

      {/* Botón de cierre (opcional) */}
      {onClose && (
        <button
          className="absolute top-2 right-2 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          onClick={onClose}
          aria-label="Close menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div
        className={cn(
          'p-6 overflow-y-auto',
          menuClassName
        )}
        style={{ maxHeight }}
      >
        {/* Featured Item */}
        {featuredItem && (
          <div className="mb-6">
            <button
              className={cn(
                'w-full p-4 rounded-lg',
                'bg-gradient-to-r from-yellow-400/10 to-yellow-500/10',
                'border border-yellow-400/20',
                'hover:from-yellow-400/20 hover:to-yellow-500/20',
                'transition-all duration-200',
                'text-left'
              )}
              onClick={() => onItemClick?.(featuredItem)}
              role="menuitem"
            >
              <div className="flex items-start gap-3">
                {showItemIcons && featuredItem.icon && (
                  <featuredItem.icon className="w-5 h-5 text-yellow-400 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-white flex items-center gap-2">
                    {featuredItem.label}
                    {featuredItem.badge && (
                      <span className="px-2 py-0.5 text-xs bg-yellow-400 text-slate-900 rounded-full font-medium">
                        {featuredItem.badge}
                      </span>
                    )}
                  </div>
                  {showItemDescriptions && featuredItem.description && (
                    <div className="text-sm text-slate-400 mt-1">
                      {featuredItem.description}
                    </div>
                  )}
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Divider */}
        {featuredItem && (items.length > 0 || sections.length > 0) && showDividers && (
          <div className="border-t border-white/10 my-4" />
        )}

        {/* Sections */}
        {sections.length > 0 ? (
          <div className={cn('grid gap-6', gridColumns[Math.min(columnsPerRow, 5) as keyof typeof gridColumns])}>
            {sections.map((section, sectionIndex) => (
              <div
                key={`section-${sectionIndex}`}
                className={cn('space-y-3', sectionClassName)}
              >
                {/* Section Title */}
                {showSectionTitles && section.title && (
                  <h3
                    id={`section-${sectionIndex}-title`}
                    className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3"
                    onClick={() => onSectionClick?.(section)}
                    role="heading"
                    aria-level={3}
                  >
                    {section.title}
                  </h3>
                )}

                {/* Section Items */}
                <div className="space-y-1" role="group" aria-labelledby={`section-${sectionIndex}-title`}>
                  {section.items.map((item, itemIndex) => {
                    const itemId = `${section.title}-${item.label}`;
                    const isActive = activeItemId === itemId;
                    const isHovered = hoveredItemId === itemId;
                    const tabIndex = itemIndex === 0 && sectionIndex === 0 ? 0 : -1; // Roving tabindex

                    return (
                      <button
                        key={`item-${itemIndex}`}
                        className={cn(
                          'w-full px-3 py-2 rounded-lg text-left',
                          'transition-all duration-150 ease-out',
                          'hover:bg-white/10 hover:text-white hover:translate-x-1',
                          'focus:bg-white/10 focus:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:ring-offset-2 focus:ring-offset-slate-900',
                          'active:scale-[0.98]',
                          isActive && 'bg-yellow-400/10 text-yellow-400',
                          isHovered && 'bg-white/5 text-white translate-x-0.5',
                          itemClassName
                        )}
                        onClick={() => onItemClick?.(item)}
                        role="menuitem"
                        aria-current={isActive ? 'page' : undefined}
                        aria-label={`${item.label}${item.description ? `: ${item.description}` : ''}`}
                        aria-describedby={item.description ? `item-desc-${sectionIndex}-${itemIndex}` : undefined}
                        tabIndex={tabIndex}
                        data-section-index={sectionIndex}
                        data-item-index={itemIndex}
                      >
                        <div className="flex items-start gap-2">
                          {/* Item Icon */}
                          {showItemIcons && item.icon && (
                            <item.icon className={cn(
                              'w-4 h-4 mt-0.5',
                              isActive ? 'text-yellow-400' : 'text-slate-400'
                            )} />
                          )}

                          {/* Item Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                'text-sm font-medium',
                                isActive ? 'text-yellow-400' : 'text-slate-300'
                              )}>
                                {item.label}
                              </span>
                              {item.badge && (
                                <span className="px-1.5 py-0.5 text-xs bg-yellow-400/20 text-yellow-400 rounded-full">
                                  {item.badge}
                                </span>
                              )}
                              {item.external && (
                                <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              )}
                            </div>
                            {showItemDescriptions && item.description && (
                              <div
                                id={`item-desc-${sectionIndex}-${itemIndex}`}
                                className="text-xs text-slate-500 mt-0.5"
                              >
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
            ))}
          </div>
        ) : items.length > 0 ? (
          // Simple items list (no sections)
          <div className="space-y-1">
            {items.map((item, index) => {
              const isActive = activeItemId === item.href;
              const isHovered = hoveredItemId === item.href;

              return (
                <button
                  key={`simple-item-${index}`}
                  className={cn(
                    'w-full px-4 py-2 rounded-lg text-left',
                    'transition-all duration-150',
                    'hover:bg-white/10 hover:text-white',
                    'focus:bg-white/10 focus:text-white focus:outline-none',
                    isActive && 'bg-yellow-400/10 text-yellow-400',
                    isHovered && 'bg-white/5 text-white',
                    itemClassName
                  )}
                  onClick={() => onItemClick?.(item)}
                  role="menuitem"
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="flex items-center gap-3">
                    {showItemIcons && item.icon && (
                      <item.icon className={cn(
                        'w-4 h-4',
                        isActive ? 'text-yellow-400' : 'text-slate-400'
                      )} />
                    )}
                    <span className={cn(
                      'text-sm font-medium',
                      isActive ? 'text-yellow-400' : 'text-slate-300'
                    )}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="ml-auto px-2 py-0.5 text-xs bg-yellow-400/20 text-yellow-400 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          // Empty state
          <div className="text-center py-8 text-slate-500">
            No items available
          </div>
        )}
      </div>
    </div>
  );
};

MegaMenuPresentationPure.displayName = 'MegaMenuPresentationPure';